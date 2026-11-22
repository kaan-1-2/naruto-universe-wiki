// Scene illustrations are local assets or generated SVGs; catalog records remain live API data.
const clanKinds = [
  ['uchiha', 'fan'],
  ['hyuga', 'eye'],
  ['hyūga', 'eye'],
  ['uzumaki', 'spiral'],
  ['senju', 'tree'],
  ['aburame', 'insect'],
  ['nara', 'antlers'],
  ['akimichi', 'circle'],
  ['yamanaka', 'flower'],
  ['inuzuka', 'paw'],
  ['sarutobi', 'flame'],
  ['fuma', 'star'],
  ['fūma', 'star'],
  ['otsutsuki', 'moon'],
  ['ōtsutsuki', 'moon'],
  ['hoshigaki', 'wave'],
  ['kaguya', 'bone'],
  ['hozuki', 'water'],
  ['hōzuki', 'water'],
  ['kurama', 'eye'],
  ['kazekage', 'wind'],
  ['hatake', 'lightning'],
  ['yuki', 'snow'],
  ['chinoike', 'eye'],
];

function hashText(text) {
  let hash = 2166136261;
  for (const char of String(text || 'Shinobi')) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const svgPaths = {
  fan: '<path d="M0 -92 A92 92 0 0 1 92 0 L-92 0 A92 92 0 0 1 0 -92Z" fill="#e55056"/><path d="M-92 0 Q0 65 92 0Z" fill="#fcf3dc"/><path d="M-11 6 H11 V103 H-11Z" fill="#fcf3dc"/>',
  eye: '<ellipse rx="124" ry="56" fill="none" stroke="currentColor" stroke-width="11"/><circle r="47" fill="none" stroke="currentColor" stroke-width="13"/><circle r="17" fill="currentColor"/><path d="M-120 0l-20-22 M120 0l20-22" stroke="currentColor" stroke-width="10"/>',
  spiral:
    '<path d="M102 8 C92 -66 27 -118 -50 -98 C-125 -78 -146 6 -99 67 C-48 132 60 112 85 42 C103 -12 57 -68 5 -53 C-55 -36 -56 34 -15 49 C22 61 51 33 41 1" fill="none" stroke="currentColor" stroke-width="19" stroke-linecap="round"/>',
  tree: '<path d="M-10 117V-14M10 117V-14M0-14L-66-80M0-14L72-94M-37-47L-91-52M36-58L99-42M-66-80L-62-124M72-94L86-130" stroke="currentColor" stroke-width="18" stroke-linecap="round" fill="none"/>',
  insect:
    '<ellipse rx="42" ry="66" fill="none" stroke="currentColor" stroke-width="12"/><path d="M-44 -24Q-117-111 -126-26Q-111 29-44 20M44 -24Q117-111 126-26Q111 29 44 20M0-67v135M-42-21h84M-42 24h84" fill="none" stroke="currentColor" stroke-width="9"/>',
  antlers:
    '<path d="M0 112V-9M0 0L-75-60M-75-60L-82-123M-75-60L-132-76M0 0L75-60M75-60L82-123M75-60L132-76" fill="none" stroke="currentColor" stroke-width="17" stroke-linecap="round"/><circle cy="-7" r="17" fill="currentColor"/>',
  circle:
    '<circle r="98" fill="none" stroke="currentColor" stroke-width="21"/><circle r="51" fill="none" stroke="currentColor" stroke-width="15"/><circle r="13" fill="currentColor"/>',
  flower:
    '<circle r="24" fill="currentColor"/>' +
    Array.from(
      { length: 6 },
      (_, i) =>
        `<ellipse cy="-69" ry="49" rx="28" transform="rotate(${i * 60})" fill="none" stroke="currentColor" stroke-width="10"/>`,
    ).join(''),
  paw:
    '<path d="M0 25C-56-38-104 10-69 69C-37 121 37 121 69 69C104 10 56-38 0 25Z" fill="none" stroke="currentColor" stroke-width="13"/>' +
    [-75, -27, 27, 75]
      .map(
        (x, i) =>
          `<ellipse cx="${x}" cy="-55" rx="17" ry="26" transform="rotate(${(i - 1.5) * 15} ${x} -55)" fill="currentColor"/>`,
      )
      .join(''),
  flame:
    '<path d="M0 107C-105 50-75 -43-25-94C-30-28 18-36 37-119C117-24 111 66 0 107Z" fill="none" stroke="currentColor" stroke-width="15"/><path d="M0 85C-45 46-30 9 9-40C55 10 52 55 0 85Z" fill="currentColor"/>',
  star: '<path d="M0-122L28-30L120 0L28 30L0 122L-28 30L-120 0L-28-30Z" fill="none" stroke="currentColor" stroke-width="13"/><circle r="17" fill="currentColor"/>',
  moon: '<path d="M-26 -116A122 122 0 1 0 116 31A89 89 0 0 1 -26 -116Z" fill="currentColor"/>',
  wave: '<path d="M-140-32Q-95-95-50-32T40-32T130-32M-140 15Q-95-48-50 15T40 15T130 15M-140 65Q-95 2-50 65T40 65T130 65" fill="none" stroke="currentColor" stroke-width="15"/>',
  water:
    '<path d="M0-126C-62-45-105 8-105 51A105 105 0 0 0 105 51C105 8 62-45 0-126Z" fill="none" stroke="currentColor" stroke-width="15"/>',
  lightning: '<path d="M25-126L-90 7H-14L-38 127L99-23H18Z" fill="currentColor"/>',
  wind: '<path d="M-133-50H47Q115-50 103-93Q91-130 55-101M-144-5H95Q152-5 132 39Q110 74 79 37M-128 50H21Q73 50 65 93Q52 117 33 93" stroke="currentColor" stroke-width="13" stroke-linecap="round" fill="none"/>',
  snow: '<path d="M-117 0H117M-58-103L58 103M-58 103L58-103" stroke="currentColor" stroke-width="17" stroke-linecap="round"/><circle r="18" fill="currentColor"/>',
  bone: '<path d="M-12-115L-50-80L-25-55L-25 55L-50 80L-12 115L12 115L50 80L25 55L25-55L50-80L12-115Z" fill="none" stroke="currentColor" stroke-width="15"/>',
};

export function clanScene(name, id = 0) {
  const label = String(name || 'Unknown');
  const norm = label.toLowerCase();
  const type =
    clanKinds.find(([needle]) => norm.includes(needle))?.[1] ||
    ['star', 'moon', 'spiral', 'flower', 'tree', 'wave', 'eye', 'wind'][hashText(norm) % 8];
  const seed = hashText(`${label}:${id}`) % 360;
  const hue =
    type === 'fan'
      ? 356
      : type === 'eye'
        ? 263
        : type === 'spiral'
          ? 7
          : type === 'tree'
            ? 130
            : seed;
  const back1 = `hsl(${hue},34%,12%)`;
  const back2 = `hsl(${(hue + 28) % 360},30%,23%)`;
  const bright = `hsl(${hue},78%,72%)`;
  const icon = svgPaths[type] || svgPaths.star;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="390" viewBox="0 0 700 390">
    <defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${back1}"/><stop offset="1" stop-color="${back2}"/></linearGradient>
    <radialGradient id="sun"><stop stop-color="${bright}" stop-opacity=".5"/><stop offset="1" stop-color="${bright}" stop-opacity="0"/></radialGradient></defs>
    <rect width="700" height="390" fill="url(#bg)"/><circle cx="510" cy="172" r="180" fill="url(#sun)"/>
    <path d="M0 300L115 244L208 287L316 205L419 265L519 187L700 278V390H0Z" fill="#0b1320" opacity=".5"/>
    <path d="M0 355L126 312L228 344L350 283L474 334L588 281L700 316V390H0Z" fill="#060c14" opacity=".6"/>
    <g transform="translate(495 190) scale(.94)" style="color:${bright}" fill="none" opacity=".78">${icon}</g>
    <g fill="none" stroke="${bright}" stroke-opacity=".22" stroke-width="3"><path d="M16 59Q140 2 272 59T528 59"/><path d="M16 80Q140 23 272 80T528 80"/><path d="M-6 140Q90 110 200 138"/></g>
    <rect x="14" y="14" width="672" height="362" rx="20" fill="none" stroke="${bright}" stroke-opacity=".22" stroke-width="2"/>
    </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const villages = [
  [/konoh|leaf|fire|daidai|tree|forest/i, 'konoha'],
  [/suna|sand|desert|wind/i, 'suna'],
  [/kiri|mist|water|hacho|hacho|hacho|wave|island|harbor/i, 'kiri'],
  [/ame|rain|curtain/i, 'ame'],
  [/kumo|cloud|lightning|sky/i, 'kumo'],
  [/iwa|stone|earth|rock|mountain|cave/i, 'iwa'],
  [/bamboo|grass|takig|waterfall|forest|tree|wood/i, 'bamboo'],
  [/ceramic|pottery|craft|hot spring/i, 'ceramic'],
  [/oto|sound|snake|genjutsu|silence|dark/i, 'oto'],
];
const villageCycle = ['konoha', 'suna', 'kiri', 'ame', 'kumo', 'iwa', 'bamboo', 'ceramic', 'oto'];
export function villageScene(name, id = 0) {
  const norm = String(name || 'Unknown');
  const match = villages.find(([rule]) => rule.test(norm));
  const asset = match ? match[1] : villageCycle[hashText(`${norm}:${id}`) % villageCycle.length];
  return `/assets/villages/${asset}.webp`;
}

export function sceneAccent(name) {
  const hue = (hashText(name) % 120) + 11;
  return `hsl(${hue}, 90%, 73%)`;
}
