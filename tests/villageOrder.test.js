import test from 'node:test';
import assert from 'node:assert/strict';
import { orderVillages } from '../src/utils/villageOrder.js';
import { fetchCollection } from '../src/services/api.js';

test('village default order promotes familiar villages and moves empty records last without mutation', () => {
  const villages = [
    { id: 3, name: 'Curtain Village', characters: [] },
    { id: 4, name: 'Other Village', characters: [1, 2, 3] },
    { id: 16, name: 'Konohagakure', characters: [1] },
    { id: 28, name: 'Sunagakure', characters: [2] },
    { id: 15, name: 'Kisaragi Village', characters: [] },
    { id: 2, name: 'Ceramic Village', characters: [3] },
  ];
  const original = structuredClone(villages);
  assert.deepEqual(
    orderVillages(villages).map((v) => v.id),
    [16, 28, 4, 2, 3, 15],
  );
  assert.deepEqual(villages, original);
});

test('village ordering spans API pages before display pagination and retains searchable empty records', async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  try {
    globalThis.fetch = async (input) => {
      const query = new URL(String(input), 'https://example.test').searchParams;
      calls.push(query);
      const villages = query.has('name')
        ? [{ id: 3, name: 'Curtain Village', characters: [] }]
        : query.get('page') === '1'
          ? [{ id: 3, name: 'Curtain Village', characters: [] }]
          : [{ id: 16, name: 'Konohagakure', characters: [1] }];
      return { ok: true, json: async () => ({ villages, totalPages: query.has('name') ? 1 : 2 }) };
    };
    const first = await fetchCollection('villages', { page: 1, limit: 1 });
    const last = await fetchCollection('villages', { page: 2, limit: 1 });
    assert.equal(first.items[0].name, 'Konohagakure');
    assert.equal(last.items[0].name, 'Curtain Village');
    assert.equal(first.pages, 2);
    assert.equal(first.total, 2);
    const search = await fetchCollection('villages', { name: 'Curtain' });
    assert.equal(search.items[0].id, 3);
    assert.equal(search.total, 1);
    assert.equal(calls.at(-1).get('name'), 'Curtain');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
