import { bundledCharacterImages, findCharacterByName } from './characterDirectory.js';

// The illustrated fallbacks are included in the app so key portraits keep working
// even when external image hosts block or remove a picture.
const portraitLookup = Object.freeze({
  jiraiya: 'jiraiya',
  'naruto uzumaki': 'naruto-uzumaki',
  'sasuke uchiha': 'sasuke-uchiha',
  'sakura haruno': 'sakura-haruno',
  'kakashi hatake': 'kakashi-hatake',
  'itachi uchiha': 'itachi-uchiha',
  gaara: 'gaara',
  'minato namikaze': 'minato-namikaze',
  nagato: 'nagato',
  tsunade: 'tsunade',
  orochimaru: 'orochimaru',
});

export function localPortrait(name) {
  const key = String(name || '')
    .trim()
    .toLowerCase();
  const file = portraitLookup[key];
  return file ? `/assets/portraits/${file}.${file === 'jiraiya' ? 'jpg' : 'png'}` : null;
}

// Unknown appearances are shown as archive symbols rather than invented faces.
export function illustratedAvatar(name) {
  const label = String(name || 'Shinobi').replace(/[<>&"']/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="520" viewBox="0 0 420 520"><title>${label}: portrait unavailable</title><defs><linearGradient id="paper" x2="1" y2="1"><stop stop-color="#49403a"/><stop offset="1" stop-color="#1c2022"/></linearGradient></defs><rect width="420" height="520" fill="url(#paper)"/><rect x="24" y="24" width="372" height="472" rx="5" fill="none" stroke="#b79a6a" stroke-opacity=".5"/><path d="M125 158h72q28 0 28 28v139q-15-16-37-16h-63Zm170 0h-70q-28 0-28 28v139q15-16 37-16h61Z" fill="none" stroke="#dbc18c" stroke-width="7" stroke-linejoin="round"/><path d="M144 187h38m-38 24h38m56-24h38m-38 24h38" stroke="#dbc18c" stroke-width="5" opacity=".55"/><text x="210" y="370" text-anchor="middle" font-size="21" font-family="sans-serif" fill="#e9d8b3">Portrait unavailable</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function portraitCandidates(character) {
  const bundled = bundledCharacterImages(character);
  const resolved = findCharacterByName(character?.name);
  const imageUrls = [
    ...(Array.isArray(character?.images) ? character.images : []),
    character?.image,
    ...(resolved?.images || []),
  ].filter((value) => typeof value === 'string' && /^https?:\/\//i.test(value));
  const local = localPortrait(character?.name);
  const uniques = [...new Set(imageUrls)].slice(0, 4);
  const illustrated = illustratedAvatar(
    character?.name,
    character?.personal?.clan || character?.clan,
  );
  // For featured profiles, the bundled art loads immediately without waiting for broken image hosts.
  return [
    ...new Set([
      ...(bundled?.portrait ? [bundled.portrait] : []),
      ...(local ? [local] : []),
      ...uniques,
      illustrated,
    ]),
  ];
}

const techniques = [
  { test: /rasengan/i, asset: 'rasengan', subtitle: 'Spiraling chakra' },
  { test: /chidori/i, asset: 'chidori', subtitle: 'Lightning technique' },
  { test: /shadow clone|multi shadow clone/i, asset: 'shadow-clone', subtitle: 'Clone technique' },
  { test: /amaterasu/i, asset: 'amaterasu', subtitle: 'Black flames' },
  { test: /susano.?o/i, asset: 'susanoo', subtitle: 'Guardian aura' },
  { test: /sage mode/i, asset: 'sage-mode', subtitle: 'Natural energy' },
  { test: /eight gates|eight inner gates/i, asset: 'eight-gates', subtitle: 'Inner gates' },
  { test: /byakugan|gentle fist/i, asset: 'byakugan', subtitle: 'Visual technique' },
  { test: /summon|toad|kuchiyose|gamabunta/i, asset: 'toad-summoning', subtitle: 'Toad summoning' },
  { test: /fire release|fire style|fireball/i, asset: 'fire-release', subtitle: 'Fire technique' },
  {
    test: /earth release|earth style|earth wall|earth barrier/i,
    asset: 'earth-barrier',
    subtitle: 'Earth technique',
  },
];

export function illustratedTechniques(jutsu) {
  const seen = new Set();
  const entries = [];
  for (const name of Array.isArray(jutsu) ? jutsu : []) {
    if (typeof name !== 'string') continue;
    const technique = techniques.find((entry) => entry.test.test(name));
    if (technique && !seen.has(technique.asset)) {
      entries.push({
        name,
        art: `/assets/abilities/${technique.asset}.webp`,
        note: technique.subtitle,
      });
      seen.add(technique.asset);
    }
  }
  return entries.slice(0, 6);
}

export function familyConnections(family) {
  if (!family || typeof family !== 'object' || Array.isArray(family)) return [];
  const connections = [];
  for (const [relationship, raw] of Object.entries(family)) {
    const values = Array.isArray(raw) ? raw : [raw];
    for (const value of values) {
      if (typeof value !== 'string' || !value.trim()) continue;
      const name = value
        .trim()
        .replace(/\s*\([^)]*\)\s*$/, '')
        .trim();
      if (name)
        connections.push({ relationship: relationship.replace(/([a-z])([A-Z])/g, '$1 $2'), name });
    }
  }
  return connections;
}
