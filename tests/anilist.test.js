import test from 'node:test';
import assert from 'node:assert/strict';
import { createAniListClient, selectAniListCharacter } from '../src/services/anilist.js';
import {
  biographySummary,
  biographyText,
  formatBirthday,
  latestRecordedText,
  mergeCharacterDetails,
  recordedText,
} from '../src/utils/profileData.js';

function candidate(name = 'Kawaki', id = 130426, series = 'BORUTO: NARUTO NEXT GENERATIONS') {
  return {
    id,
    name: { full: name, alternative: [] },
    description: 'A shinobi from the Naruto universe.',
    gender: 'Male',
    dateOfBirth: { day: 13, month: 5 },
    age: null,
    bloodType: null,
    media: { nodes: [{ title: { romaji: series } }] },
  };
}

function response(record = candidate(), headers = {}) {
  return {
    ok: true,
    status: 200,
    headers: { get: (key) => headers[key.toLowerCase()] ?? null },
    json: async () => ({ data: { Page: { characters: [record] } } }),
  };
}

test('matching requires a Naruto or Boruto appearance and the same character name', () => {
  const right = candidate();
  const wrong = candidate('Tomoe Kawakita', 139832, 'Hachigatsu no Cinderella Nine');
  assert.equal(selectAniListCharacter({ name: 'Kawaki' }, [wrong, right]), right);
  assert.equal(
    selectAniListCharacter({ name: 'Kawaki' }, [candidate('Kawaki', 99, 'Another Series')]),
    null,
  );
  assert.equal(selectAniListCharacter({ name: 'Kawaki' }, [candidate('Boruto Uzumaki')]), null);
  assert.equal(selectAniListCharacter({ name: 'Kawaki' }, [right, { ...right, id: 99 }]), null);
});

test('matching tolerates reversed names, aliases and long vowels', () => {
  assert.equal(
    selectAniListCharacter({ name: 'Might Guy' }, [candidate('Guy Might', 307)]).id,
    307,
  );
  assert.equal(
    selectAniListCharacter({ name: 'Hinata Uzumaki' }, [candidate('Hinata Hyuuga', 1555)]).id,
    1555,
  );
});

test('simultaneous requests share one call and a successful result is cached in memory', async () => {
  let calls = 0;
  const client = createAniListClient({
    fetchImpl: async () => {
      calls++;
      return response();
    },
  });
  const [first, second] = await Promise.all([
    client.getCharacter({ name: 'Kawaki' }),
    client.getCharacter({ name: 'Kawaki' }),
  ]);
  assert.equal(first.id, 130426);
  assert.equal(second, first);
  assert.equal(await client.getCharacter({ name: 'Kawaki' }), first);
  assert.equal(calls, 1);
});

test('aborting one view does not cancel a shared request used by another view', async () => {
  let finish;
  let started;
  const hasStarted = new Promise((resolve) => {
    started = resolve;
  });
  const pendingResponse = new Promise((resolve) => {
    finish = resolve;
  });
  const client = createAniListClient({
    fetchImpl: () => {
      started();
      return pendingResponse;
    },
  });
  const controller = new AbortController();
  const first = client.getCharacter({ name: 'Kawaki' }, { signal: controller.signal });
  const second = client.getCharacter({ name: 'Kawaki' });
  await hasStarted;
  controller.abort();
  await assert.rejects(first, (error) => error.name === 'AbortError');
  finish(response());
  assert.equal((await second).id, 130426);
});

test('queued requests are spaced and rate limit responses do not become cached character data', async () => {
  let clock = 0;
  const pauses = [];
  let calls = 0;
  const client = createAniListClient({
    now: () => clock,
    pause: async (ms) => {
      pauses.push(ms);
      clock += ms;
    },
    fetchImpl: async () => {
      calls++;
      if (calls === 1) return { ok: false, status: 429, headers: { get: () => '60' } };
      return response();
    },
  });
  await assert.rejects(client.getCharacter({ name: 'Kawaki' }), /temporarily unavailable/);
  await assert.rejects(client.getCharacter({ name: 'Kawaki' }), /temporarily unavailable/);
  assert.equal(calls, 1);
  clock = 61000;
  assert.equal((await client.getCharacter({ name: 'Kawaki' })).id, 130426);
  await client.getCharacter({ name: 'Unknown shinobi' });
  assert.deepEqual(pauses, [2100]);
});

test('HTTP and GraphQL failures are reported without saving a false match', async () => {
  const client = createAniListClient({
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      json: async () => ({ errors: [{ message: 'Unavailable' }] }),
    }),
  });
  await assert.rejects(client.getCharacter({ name: 'Kawaki' }), /unavailable/);
  const stopped = new AbortController();
  stopped.abort();
  await assert.rejects(
    client.getCharacter({ name: 'Kawaki' }, { signal: stopped.signal }),
    (error) => error.name === 'AbortError',
  );
});

test('additional information fills only missing values and never changes primary data', () => {
  const primary = {
    id: 609,
    name: 'Kawaki',
    images: ['portrait.png'],
    personal: { sex: 'Male', birthdate: 'Unknown', clan: 'Existing Clan' },
  };
  const result = mergeCharacterDetails(primary, {
    gender: 'Female',
    dateOfBirth: { day: 13, month: 5 },
    age: '16',
    bloodType: 'B',
  });
  assert.equal(result.personal.sex, 'Male');
  assert.equal(result.personal.birthdate, 'May 13');
  assert.equal(result.personal.age, '16');
  assert.equal(result.personal.clan, 'Existing Clan');
  assert.equal(primary.personal.birthdate, 'Unknown');
  assert.equal(primary.personal.age, undefined);
  assert.equal(result.images, primary.images);
});

test('missing labels are omitted while real measurements and version labels remain', () => {
  assert.equal(recordedText('Unknown'), '');
  assert.equal(recordedText('Unrecorded'), '');
  assert.equal(recordedText(['Unknown', 'Konoha']), 'Konoha');
  assert.equal(recordedText(0), '0');
  assert.equal(
    recordedText({ 'Part I': '145 cm', 'Part II': '166 cm' }),
    'Part I: 145 cm · Part II: 166 cm',
  );
  assert.equal(latestRecordedText({ 'Part I': '145 cm', 'Part II': 'Unknown' }), '145 cm');
  assert.equal(formatBirthday({ month: 5, day: 13 }), 'May 13');
  assert.equal(formatBirthday({ month: 2, day: 30 }), '');
  assert.equal(formatBirthday({ month: null, day: null }), '');
});

test('biographies are rendered as plain text and summaries skip metadata lines', () => {
  const text = biographyText(
    '__Height__: 183 cm\n\nKawaki was raised by [Jigen](https://anilist.co/character/130418) and later became a member of the Uzumaki family.\n\n~!Further history!~<br><b>More details</b>',
  );
  assert.ok(!text.includes('<b>'));
  assert.ok(!text.includes(']('));
  assert.ok(!text.includes('~!'));
  assert.match(biographySummary(text), /^Kawaki was raised by Jigen/);
});
