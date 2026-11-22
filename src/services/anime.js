import { biographyText } from '../utils/profileData.js';

const fields = `id title { english romaji } format status episodes duration
  startDate { year month day } endDate { year month day }
  coverImage { extraLarge large } bannerImage description(asHtml: false)
  genres averageScore studios(isMain: true) { nodes { name } }`;
const query = `query ShinobiScreenArchive {
  naruto: Page(perPage: 50) { media(search: "Naruto", type: ANIME, format_in: [TV, MOVIE], sort: START_DATE) { ${fields} } }
  boruto: Page(perPage: 50) { media(search: "Boruto", type: ANIME, format_in: [TV, MOVIE], sort: START_DATE) { ${fields} } }
  extras: Page(perPage: 50) { media(id_in: [442, 12979], type: ANIME) { ${fields} } }
}`;

export function normalizeAnime(data) {
  const unique = new Map();
  for (const group of Object.values(data || {})) {
    for (const item of group?.media || []) {
      if (!Number.isInteger(item.id) || !['TV', 'MOVIE'].includes(item.format)) continue;
      if (!/\b(naruto|boruto)\b/i.test(`${item.title?.romaji} ${item.title?.english}`)) continue;
      unique.set(item.id, {
        ...item,
        name: item.title?.english || item.title?.romaji,
        synopsis: biographyText(item.description),
      });
    }
  }
  return [...unique.values()].sort((a, b) => {
    const dateKey = (item) =>
      item.startDate?.year
        ? item.startDate.year * 10000 +
          (item.startDate.month || 1) * 100 +
          (item.startDate.day || 1)
        : Infinity;
    return dateKey(a) - dateKey(b) || a.id - b.id;
  });
}

let cached;
let pending;
export function fetchAnime() {
  if (cached?.expires > Date.now()) return Promise.resolve(cached.items);
  if (!pending) {
    pending = (async () => {
      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok)
        throw new Error(
          response.status === 429
            ? 'The screen archive is busy. Please try again shortly.'
            : 'The anime and film archive could not be loaded.',
        );
      const payload = await response.json();
      if (payload.errors?.length || !payload.data?.naruto?.media)
        throw new Error('The anime and film archive could not be loaded.');
      const items = normalizeAnime(payload.data);
      cached = { items, expires: Date.now() + 10 * 60 * 1000 };
      return items;
    })().finally(() => {
      pending = null;
    });
  }
  return pending;
}

export const mediaStatus = (status) =>
  ({
    FINISHED: 'Completed',
    RELEASING: 'Airing',
    NOT_YET_RELEASED: 'Upcoming',
    CANCELLED: 'Cancelled',
    HIATUS: 'On hiatus',
  })[status] || '';
