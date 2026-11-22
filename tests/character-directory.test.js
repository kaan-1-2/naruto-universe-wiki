import test from 'node:test';
import assert from 'node:assert/strict';
import {
  findCharacterByName,
  normalizeCharacterName,
  characterHref,
  bundledCharacterImages,
  characterGallery,
} from '../src/utils/characterDirectory.js';

test('the married and birth names of Hinata resolve to the same profile', () => {
  assert.equal(findCharacterByName('Hinata Uzumaki').id, 437);
  assert.equal(findCharacterByName('Hinata Hyuga').id, 437);
  assert.equal(findCharacterByName('Hinata Hyūga').id, 437);
  assert.equal(characterHref({ name: 'Hinata Uzumaki' }), '/characters/437');
});

test('relationship names tolerate accents and punctuation without guessing unrelated people', () => {
  assert.equal(normalizeCharacterName('  Chōji Akimichi  '), 'choji akimichi');
  assert.equal(findCharacterByName('Sakura Uchiha').name, 'Sakura Haruno');
  assert.equal(findCharacterByName('Unknown Character'), null);
});

test('relations and gallery use local character images', () => {
  assert.match(bundledCharacterImages({ name: 'Hinata Uzumaki' }).portrait, /^\/assets\//);
  assert.ok(characterGallery({ id: 1344 }).length >= 3);
  assert.ok(characterGallery({ id: 515 }).length >= 3);
});
