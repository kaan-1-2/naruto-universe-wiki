import characters from '../data/character-index.json' with { type: 'json' };
import images from '../data/character-images.json' with { type: 'json' };

export function normalizeCharacterName(name) {
  return String(name || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s*\((?:deceased|anime only|adoptive)\)\s*/g, ' ')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const byName = new Map(
  characters.map((character) => [normalizeCharacterName(character.name), character]),
);
const byId = new Map(characters.map((character) => [String(character.id), character]));
export const CHARACTER_COUNT = characters.length;
const aliases = {
  'hinata uzumaki': 'Hinata Hyūga',
  hinata: 'Hinata Hyūga',
  'sakura uchiha': 'Sakura Haruno',
  sakura: 'Sakura Haruno',
  naruto: 'Naruto Uzumaki',
  sasuke: 'Sasuke Uchiha',
  kakashi: 'Kakashi Hatake',
  itachi: 'Itachi Uchiha',
  'kushina namikaze': 'Kushina Uzumaki',
  boruto: 'Boruto Uzumaki',
  'might gai': 'Might Guy',
  guy: 'Might Guy',
};

export function findCharacterByName(name) {
  const key = normalizeCharacterName(name);
  return byName.get(key) || byName.get(normalizeCharacterName(aliases[key])) || null;
}

export function findCharacterById(id) {
  return byId.get(String(id)) || null;
}

export function characterHref(character) {
  const resolved = character?.id ? character : findCharacterByName(character?.name);
  return resolved?.id
    ? `/characters/${resolved.id}`
    : `/characters/name/${encodeURIComponent(character?.name || '')}`;
}

export function bundledCharacterImages(character) {
  const resolved = character?.id ? character : findCharacterByName(character?.name);
  return images[resolved?.id] || null;
}

export function characterGallery(character) {
  const bundled = bundledCharacterImages(character);
  return [
    ...new Set([
      ...(bundled?.gallery || []),
      ...(!bundled?.gallery?.length ? character?.images || [] : []),
    ]),
  ];
}
