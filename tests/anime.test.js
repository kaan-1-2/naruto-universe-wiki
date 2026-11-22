import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAnime, fetchAnime, mediaStatus } from '../src/services/anime.js';

test('screen archive deduplicates searches, excludes unrelated formats and orders undated titles last', () => {
  const naruto = {
    id: 20,
    title: { romaji: 'NARUTO', english: 'Naruto' },
    format: 'TV',
    startDate: { year: 2002 },
    description: '<b>A ninja</b><br>His journey.',
  };
  const items = normalizeAnime({
    naruto: {
      media: [
        { id: 165523, title: { romaji: 'Boruto Part 2' }, format: 'TV', startDate: {} },
        { id: 1, title: { english: 'Other series' }, format: 'TV' },
        { id: 2, title: { english: 'Naruto manga' }, format: 'MANGA' },
        naruto,
      ],
    },
    extras: {
      media: [
        naruto,
        { id: 442, title: { romaji: 'NARUTO movie' }, format: 'MOVIE', startDate: { year: 2004 } },
      ],
    },
  });
  assert.deepEqual(
    items.map((item) => item.id),
    [20, 442, 165523],
  );
  assert.equal(items[0].name, 'Naruto');
  assert.equal(items[0].synopsis, 'A ninja\nHis journey.');
  assert.equal(mediaStatus('NOT_YET_RELEASED'), 'Upcoming');
});

test('screen requests share work, allow retries after failure and cache a successful archive', async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  try {
    globalThis.fetch = async () => {
      calls += 1;
      return { ok: false, status: 429 };
    };
    await assert.rejects(fetchAnime(), /busy/);
    globalThis.fetch = async () => {
      calls += 1;
      return {
        ok: true,
        json: async () => ({
          data: { naruto: { media: [{ id: 20, title: { english: 'Naruto' }, format: 'TV' }] } },
        }),
      };
    };
    const [first, second] = await Promise.all([fetchAnime(), fetchAnime()]);
    assert.equal(first, second);
    assert.equal((await fetchAnime())[0].id, 20);
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
