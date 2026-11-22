import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareGroupMembers } from '../src/utils/groupMembers.js';
import directory from '../src/data/character-index.json' with { type: 'json' };

test('large village membership resolves card metadata without profile requests and preserves API membership order', () => {
  const group = { characters: directory.slice(0, 470).map((member) => member.id) };
  const before = structuredClone(group);
  const { members, unresolved } = prepareGroupMembers(group);
  assert.equal(members.length, 470);
  assert.equal(unresolved.length, 0);
  assert.deepEqual(
    members.map((member) => member.id),
    group.characters,
  );
  assert.ok(members.every((member) => member.name && Array.isArray(member.images)));
  assert.deepEqual(group, before);
});

test('mixed group members retain live metadata, deduplicate aliases and leave unknown references for fetching', () => {
  const { members, unresolved } = prepareGroupMembers({
    members: [
      { id: 1344, name: 'Naruto Uzumaki', images: ['https://example.com/live.png'] },
      1344,
      'Hinata Uzumaki',
      { id: 437 },
      999999,
    ],
  });
  assert.deepEqual(
    members.map((member) => member.id),
    [1344, 437],
  );
  assert.equal(members[0].images[0], 'https://example.com/live.png');
  assert.deepEqual(unresolved, [{ id: 999999 }]);
});
