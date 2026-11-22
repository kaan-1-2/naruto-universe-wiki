import { findCharacterByName, normalizeCharacterName } from '../utils/characterDirectory.js';
import { biographyText } from '../utils/profileData.js';

const ENDPOINT = 'https://graphql.anilist.co';
const CACHE_TTL = 10 * 60 * 1000;
const REQUEST_INTERVAL = 2100;
const query = `
  query CharacterDetails($name: String) {
    Page(page: 1, perPage: 10) {
      characters(search: $name) {
        id
        name { full first last alternative }
        description(asHtml: false)
        gender
        dateOfBirth { day month }
        age
        bloodType
        siteUrl
        image { large }
        media(perPage: 10) { nodes { title { romaji english } } }
      }
    }
  }
`;

function nameKey(name) {
  return normalizeCharacterName(name)
    .replace(/uu/g, 'u')
    .replace(/ou/g, 'o')
    .split(' ')
    .filter(Boolean)
    .sort()
    .join(' ');
}

function canonicalName(character) {
  return findCharacterByName(character?.name)?.name || character?.name || '';
}

export function selectAniListCharacter(character, candidates = []) {
  const expected = nameKey(canonicalName(character));
  if (!expected) return null;
  const matches = (Array.isArray(candidates) ? candidates : []).filter((candidate) => {
    const isNarutoCharacter = candidate.media?.nodes?.some((media) =>
      /\b(?:naruto|boruto)\b/i.test(`${media.title?.romaji || ''} ${media.title?.english || ''}`),
    );
    const names = [candidate.name?.full, ...(candidate.name?.alternative || [])];
    return (
      Number.isInteger(candidate.id) &&
      isNarutoCharacter &&
      names.some((name) => nameKey(name) === expected)
    );
  });
  return matches.length === 1 ? matches[0] : null;
}

function abortError() {
  return new DOMException('Request cancelled', 'AbortError');
}

function forSubscriber(promise, signal) {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(abortError());
  return new Promise((resolve, reject) => {
    const cancel = () => {
      signal.removeEventListener('abort', cancel);
      reject(abortError());
    };
    signal.addEventListener('abort', cancel, { once: true });
    promise.then(
      (value) => {
        signal.removeEventListener('abort', cancel);
        resolve(value);
      },
      (error) => {
        signal.removeEventListener('abort', cancel);
        reject(error);
      },
    );
  });
}

export function createAniListClient({
  fetchImpl = (...args) => fetch(...args),
  now = Date.now,
  pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
} = {}) {
  const cache = new Map();
  const pending = new Map();
  let queue = Promise.resolve();
  let nextRequestAt = 0;

  async function request(character) {
    const wait = Math.max(0, nextRequestAt - now());
    if (wait > 8000)
      throw new Error('Additional character information is temporarily unavailable.');
    if (wait) await pause(wait);
    nextRequestAt = now() + REQUEST_INTERVAL;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const search = canonicalName(character).replace(/ū/g, 'uu').replace(/ō/g, 'ou');
      const response = await fetchImpl(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query, variables: { name: search } }),
        signal: controller.signal,
      });
      if (response.status === 429) {
        const seconds = Number(response.headers?.get('retry-after')) || 60;
        nextRequestAt = now() + Math.max(1, seconds) * 1000;
        throw new Error('Additional character information is temporarily unavailable.');
      }
      if (!response.ok) throw new Error('Additional character information is unavailable.');
      const payload = await response.json();
      if (payload.errors?.length)
        throw new Error('Additional character information is unavailable.');
      if (response.headers?.get('x-ratelimit-remaining') === '0') {
        const reset = Number(response.headers.get('x-ratelimit-reset')) * 1000;
        nextRequestAt = reset > now() ? reset : now() + 60000;
      }
      const match = selectAniListCharacter(character, payload.data?.Page?.characters || []);
      if (!match) return null;
      return {
        id: match.id,
        name: match.name.full,
        biography: biographyText(match.description),
        gender: match.gender,
        dateOfBirth: match.dateOfBirth,
        age: match.age,
        bloodType: match.bloodType,
        sourceUrl: `https://anilist.co/character/${match.id}`,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  function getCharacter(character, { signal } = {}) {
    if (signal?.aborted) return Promise.reject(abortError());
    const key = nameKey(canonicalName(character));
    if (!key) return Promise.resolve(null);
    const cached = cache.get(key);
    if (cached && cached.expires > now())
      return forSubscriber(Promise.resolve(cached.value), signal);
    if (!pending.has(key)) {
      const task = queue
        .then(() => request(character))
        .then((value) => {
          cache.set(key, { value, expires: now() + CACHE_TTL });
          if (cache.size > 100) cache.delete(cache.keys().next().value);
          return value;
        })
        .finally(() => pending.delete(key));
      pending.set(key, task);
      queue = task.catch(() => {});
    }
    return forSubscriber(pending.get(key), signal);
  }

  return { getCharacter };
}

const client = createAniListClient();
export const fetchAdditionalCharacter = (character, options) =>
  client.getCharacter(character, options);
