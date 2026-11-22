import featured from '../data/featured.json' with { type: 'json' };
import catalogCharacters from '../data/catalog-characters.json' with { type: 'json' };
import {
  CHARACTER_COUNT,
  findCharacterByName,
  normalizeCharacterName,
} from '../utils/characterDirectory.js';
import { normalizeCharacterRecord, normalizeCollection, totalPages } from '../utils/format.js';
import { orderVillages } from '../utils/villageOrder.js';

// In development Vite proxies /api/naruto/*; Vercel rewrites the same prefix.
// This avoids browser-side CORS issues while keeping the data sourced from Dattebayo.
const BASE = '/api/naruto';
const CATEGORIES = ['characters', 'clans', 'villages'];
export const FEATURED_CHARACTER_IDS = [1344, 1307, 374, 376, 1293, 515];

function canUseLocalRecord(error, signal) {
  return (
    !signal?.aborted &&
    error instanceof ApiError &&
    (error.status === 0 || error.status === 429 || error.status >= 500)
  );
}

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function getJSON(path, { signal } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35000);
  const cancel = () => controller.abort();
  if (signal?.aborted) cancel();
  signal?.addEventListener('abort', cancel, { once: true });
  try {
    const response = await fetch(BASE + path, { signal: controller.signal });
    if (!response.ok)
      throw new ApiError(
        response.status === 404
          ? 'This shinobi record could not be found.'
          : 'The shinobi records could not be loaded.',
        response.status,
      );
    return await response.json();
  } catch (error) {
    if (signal?.aborted) throw error;
    if (error?.name === 'AbortError')
      throw new ApiError('The shinobi records are taking too long to load. Please try again.');
    if (error instanceof ApiError) throw error;
    throw new ApiError('Could not load the shinobi records. Check your connection and try again.');
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancel);
  }
}

export async function fetchCollection(type, { page = 1, limit = 12, name = '', signal } = {}) {
  if (!CATEGORIES.includes(type)) throw new ApiError('Unknown archive category.');
  if (type === 'villages') {
    const villages = [];
    const batchSize = 200;
    let sourcePage = 1;
    let sourcePages = 1;
    try {
      do {
        const query = new URLSearchParams({ page: String(sourcePage), limit: String(batchSize) });
        if (name.trim()) query.set('name', name.trim());
        const data = await getJSON(`/villages?${query}`, { signal });
        const batch = normalizeCollection(data, 'villages');
        villages.push(...batch);
        if (!batch.length) break;
        sourcePages = totalPages(data, 'villages', sourcePage, batchSize);
        sourcePage += 1;
      } while (sourcePage <= sourcePages);
    } catch (error) {
      if (!(name.trim() && error.status === 404)) throw error;
    }
    const ordered = orderVillages(villages);
    return {
      items: ordered.slice((page - 1) * limit, page * limit),
      pages: Math.max(1, Math.ceil(ordered.length / limit)),
      page,
      total: ordered.length,
    };
  }
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (name.trim()) query.set('name', name.trim());
  try {
    const data = await getJSON(`/${type}?${query}`, { signal });
    const reportedTotal = Number(
      data.total ?? data.count ?? data[`total${type[0].toUpperCase()}${type.slice(1)}`],
    );
    return {
      items: normalizeCollection(data, type),
      pages: totalPages(data, type, page, limit),
      page,
      total: Number.isFinite(reportedTotal) ? reportedTotal : null,
    };
  } catch (error) {
    if (
      type === 'characters' &&
      !name.trim() &&
      page * limit <= catalogCharacters.length &&
      canUseLocalRecord(error, signal)
    ) {
      return {
        items: catalogCharacters.slice((page - 1) * limit, page * limit),
        pages: Math.ceil(CHARACTER_COUNT / limit),
        page,
        total: CHARACTER_COUNT,
      };
    }
    if (name.trim() && error.status === 404) return { items: [], pages: 1, page, total: 0 };
    throw error;
  }
}

export async function fetchItem(type, id, { signal } = {}) {
  if (!CATEGORIES.includes(type) || !/^\d+$/.test(String(id)))
    throw new ApiError('Invalid archive address.');
  let data;
  try {
    data = await getJSON(`/${type}/${id}`, { signal });
  } catch (error) {
    const bundled =
      type === 'characters'
        ? [...catalogCharacters, ...featured].find((item) => String(item.id) === String(id))
        : null;
    if (bundled && canUseLocalRecord(error, signal)) return bundled;
    throw error;
  }
  const singular = type.slice(0, -1);
  return data?.[singular] ?? data?.[type] ?? data;
}

export async function fetchFeaturedCharacters({ signal } = {}) {
  return Promise.all(FEATURED_CHARACTER_IDS.map((id) => fetchItem('characters', id, { signal })));
}

export async function fetchCharactersByReferences(references, { signal } = {}) {
  if (!Array.isArray(references) || references.length === 0) return [];
  const tasks = references.map(async (reference) => {
    if (reference?.id) {
      try {
        return normalizeCharacterRecord(await fetchItem('characters', reference.id, { signal }));
      } catch {
        return null;
      }
    }
    if (reference?.name) {
      try {
        const known = findCharacterByName(reference.name);
        if (known)
          return normalizeCharacterRecord(await fetchItem('characters', known.id, { signal }));
        const result = await fetchCollection('characters', {
          name: reference.name,
          page: 1,
          limit: 6,
          signal,
        });
        const exact = result.items.find(
          (item) => normalizeCharacterName(item?.name) === normalizeCharacterName(reference.name),
        );
        return normalizeCharacterRecord(
          exact || (result.items.length === 1 ? result.items[0] : null),
        );
      } catch {
        return null;
      }
    }
    return null;
  });

  const settled = await Promise.all(tasks);
  const unique = [];
  const seen = new Set();
  for (const item of settled) {
    if (!item?.id && !item?.name) continue;
    const key = item.id ? `id:${item.id}` : `name:${item.name.toLowerCase()}`;
    if (!seen.has(key)) {
      unique.push(item);
      seen.add(key);
    }
  }
  return unique;
}
