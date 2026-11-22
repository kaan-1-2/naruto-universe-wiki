import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import records from '../src/data/catalog-characters.json' with { type: 'json' };
import images from '../src/data/character-images.json' with { type: 'json' };

test('the first ten catalog pages have local portraits except the unillustrated novel record', () => {
  assert.equal(records.length, 120);
  const missing = records.filter((record) => !images[record.id]?.portrait);
  assert.deepEqual(
    missing.map((record) => record.name),
    ['Kido Tsumiki'],
  );
});

test('all bundled portraits and gallery files exist and contain image bytes', () => {
  for (const entry of Object.values(images))
    for (const path of new Set([entry.portrait, ...entry.gallery])) {
      const bytes = fs.readFileSync(new URL('../public' + path, import.meta.url));
      assert.ok(bytes.length > 800, path);
      assert.ok(
        bytes[0] === 0x89 || bytes[0] === 0xff || bytes.subarray(0, 4).toString() === 'RIFF',
        path,
      );
    }
});

test('each character on the first catalog page has at least three gallery images', () => {
  for (const record of records.slice(0, 12))
    assert.ok(new Set(images[record.id].gallery).size >= 3, record.name);
});
