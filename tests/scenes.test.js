import test from 'node:test';
import assert from 'node:assert/strict';
import { clanScene, villageScene } from '../src/utils/scenes.js';
import { localPortrait, illustratedAvatar } from '../src/utils/art.js';

test('every clan receives a distinctive visual illustration', () => {
  const uchiha = clanScene('Uchiha', 1);
  const hyuga = clanScene('Hyuga', 2);
  const aburame = clanScene('Aburame', 3);
  const obscure = clanScene('Unlisted Clan', 8);
  for (const asset of [uchiha, hyuga, aburame, obscure])
    assert.match(asset, /^data:image\/svg\+xml/);
  assert.notEqual(uchiha, hyuga);
  assert.notEqual(aburame, obscure);
});

test('villages select setting-appropriate local backgrounds', () => {
  assert.equal(villageScene('Amegakure'), '/assets/villages/ame.webp');
  assert.equal(villageScene('Sunagakure'), '/assets/villages/suna.webp');
  assert.equal(villageScene('Konohagakure'), '/assets/villages/konoha.webp');
  assert.equal(villageScene('Bamboo Village'), '/assets/villages/bamboo.webp');
  assert.match(villageScene('Unknown Place', 9), /^\/assets\/villages\//);
});

test('local portraits and illustrated alternatives are available', () => {
  assert.equal(localPortrait('Gaara'), '/assets/portraits/gaara.png');
  assert.equal(localPortrait('Tsunade'), '/assets/portraits/tsunade.png');
  assert.notEqual(illustratedAvatar('Rock Lee'), illustratedAvatar('Shikamaru Nara'));
});
