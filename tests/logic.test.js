import test from 'node:test';
import assert from 'node:assert/strict';
import {
  asStringArray,
  characterAffiliation,
  characterClan,
  characterImage,
  extractMemberReferences,
  firstAppearance,
  memberCount,
  normalizeCollection,
  totalPages,
} from '../src/utils/format.js';
import {
  FEATURED_CHARACTER_IDS,
  fetchCharactersByReferences,
  fetchCollection,
  fetchFeaturedCharacters,
  fetchItem,
} from '../src/services/api.js';

test('normalizes incomplete or irregular character records', () => {
  const data = {
    name: 'Sample Ninja',
    images: [],
    personal: { clan: ['River Clan'], affiliation: ['Hidden Lake'] },
    debut: { anime: 'Episode 2' },
  };
  assert.equal(characterClan(data), 'River Clan');
  assert.equal(characterAffiliation(data), 'Hidden Lake');
  assert.equal(characterImage(data), null);
  assert.equal(firstAppearance(data), 'Episode 2');
  assert.deepEqual(asStringArray(undefined), []);
});

test('normalizes collection payloads and pagination', () => {
  const response = { characters: [{ id: 12 }, { id: 22 }], totalCharacters: 30 };
  assert.deepEqual(
    normalizeCollection(response, 'characters').map((x) => x.id),
    [12, 22],
  );
  assert.equal(totalPages(response, 'characters', 1, 12), 3);
  assert.equal(totalPages({ villages: [] }, 'villages', 1, 12), 1);
  assert.equal(memberCount({ member_count: 11 }), 11);
});

test('extracts member references from mixed data shapes', () => {
  const refs = extractMemberReferences({
    members: [3, '7', 'Naruto Uzumaki', { characterId: 18 }, { url: '/characters/21' }],
  });
  assert.deepEqual(refs, [
    { id: 3 },
    { id: 7 },
    { name: 'Naruto Uzumaki' },
    { id: 18 },
    { id: 21 },
  ]);
});

test('requests live collection routes with query parameters and supports search', async () => {
  const originalFetch = globalThis.fetch;
  let url = '';
  try {
    globalThis.fetch = async (input) => {
      url = String(input);
      return {
        ok: true,
        json: async () => ({ clans: [{ id: 4, name: 'Test Clan' }], totalClans: 1 }),
      };
    };
    const result = await fetchCollection('clans', { name: 'test', page: 1, limit: 12 });
    assert.match(url, /^\/api\/naruto\/clans\?/);
    assert.match(url, /name=test/);
    assert.equal(result.items[0].name, 'Test Clan');
    assert.equal(result.total, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('reads dynamic record detail and detects unsuccessful responses', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({ character: { id: 20, name: 'API Ninja' } }),
    });
    const record = await fetchItem('characters', 20);
    assert.equal(record.name, 'API Ninja');
    globalThis.fetch = async () => ({ ok: false, status: 503 });
    await assert.rejects(fetchCollection('villages'), /records could not be loaded/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('handles a search with zero matches', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ ok: false, status: 404 });
    const result = await fetchCollection('characters', { name: 'not-found-name' });
    assert.deepEqual(result.items, []);
    assert.equal(result.total, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('cached catalog and character records remain available when the API is down', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ ok: false, status: 503 });
    const page = await fetchCollection('characters', { page: 10, limit: 12 });
    assert.equal(page.items.length, 12);
    assert.ok(page.pages > 10);
    assert.equal((await fetchItem('characters', 609)).name, 'Kawaki');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('resolves character references by id and by name', async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  try {
    globalThis.fetch = async (input) => {
      const url = String(input);
      calls.push(url);
      if (url.includes('/characters/7'))
        return {
          ok: true,
          json: async () => ({
            character: { id: 7, name: 'Sai', image: 'https://example.com/sai.png' },
          }),
        };
      if (url.endsWith('/characters/1344'))
        return { ok: true, json: async () => ({ id: 1344, name: 'Naruto Uzumaki' }) };
      if (url.includes('/characters?'))
        return {
          ok: true,
          json: async () => ({
            characters: [
              { id: 10, name: 'Naruto Uzumaki', images: ['https://example.com/naruto.png'] },
            ],
          }),
        };
      return { ok: false, status: 404 };
    };
    const result = await fetchCharactersByReferences([{ id: 7 }, { name: 'Naruto Uzumaki' }]);
    assert.equal(result.length, 2);
    assert.equal(result[0].name, 'Sai');
    assert.equal(result[1].name, 'Naruto Uzumaki');
    assert.ok(calls.includes('/api/naruto/characters/1344'));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('featured profiles return the live response instead of the bundled record', async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  try {
    globalThis.fetch = async (input) => {
      calls.push(String(input));
      return {
        ok: true,
        json: async () => ({
          id: 1344,
          name: 'Naruto Uzumaki',
          personal: { occupation: 'Live API record' },
        }),
      };
    };
    const record = await fetchItem('characters', 1344);
    assert.equal(record.personal.occupation, 'Live API record');
    assert.deepEqual(calls, ['/api/naruto/characters/1344']);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('home page featured characters are fetched in display order', async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  try {
    globalThis.fetch = async (input) => {
      const url = String(input);
      calls.push(url);
      return {
        ok: true,
        json: async () => ({ id: Number(url.split('/').at(-1)), name: 'Live character' }),
      };
    };
    const records = await fetchFeaturedCharacters();
    assert.deepEqual(
      records.map((record) => record.id),
      FEATURED_CHARACTER_IDS,
    );
    assert.equal(calls.length, 6);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('missing profiles and cancelled requests do not silently return local records', async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ ok: false, status: 404 });
    await assert.rejects(fetchItem('characters', 1344), (error) => error.status === 404);
    const controller = new AbortController();
    controller.abort();
    globalThis.fetch = async () => {
      throw new DOMException('Cancelled', 'AbortError');
    };
    await assert.rejects(
      fetchItem('characters', 1344, { signal: controller.signal }),
      (error) => error.name === 'AbortError',
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
