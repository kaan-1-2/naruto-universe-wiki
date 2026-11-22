// API records have inconsistent shapes. Normalize before presenting them.
export function textValue(value, fallback = 'Unknown') {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    const values = value.map((item) => textValue(item, '')).filter(Boolean);
    return values.length ? values.join(', ') : fallback;
  }
  return fallback;
}

export function asStringArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap((v) => (typeof v === 'string' ? [v] : []));
  return typeof value === 'string' ? [value] : [];
}

export function characterImage(character) {
  return (
    character?.images?.find((x) => typeof x === 'string' && x.startsWith('https://')) ||
    (typeof character?.image === 'string' && character.image.startsWith('https://')
      ? character.image
      : null)
  );
}

export function characterClan(character) {
  return asStringArray(character?.personal?.clan || character?.clan).join(', ') || 'Unrecorded';
}

export function characterAffiliation(character) {
  return (
    asStringArray(character?.personal?.affiliation || character?.affiliation)
      .slice(0, 2)
      .join(', ') || 'Unknown'
  );
}

export function memberCount(group) {
  if (Number.isFinite(group?.member_count)) return group.member_count;
  if (Array.isArray(group?.characters)) return group.characters.length;
  if (Array.isArray(group?.members)) return group.members.length;
  return null;
}

export function normalizeCharacterRecord(record) {
  if (!record || typeof record !== 'object') return null;
  return {
    ...record,
    images: Array.isArray(record.images) ? record.images : record.image ? [record.image] : [],
  };
}

export function getMembers(group) {
  const raw = Array.isArray(group?.members)
    ? group.members
    : Array.isArray(group?.characters)
      ? group.characters
      : [];
  return raw
    .filter((x) => x && typeof x === 'object' && (x.name || x.id))
    .map(normalizeCharacterRecord)
    .filter(Boolean);
}

export function extractMemberReferences(group) {
  const raw = Array.isArray(group?.members)
    ? group.members
    : Array.isArray(group?.characters)
      ? group.characters
      : [];
  const refs = [];
  const seen = new Set();

  for (const entry of raw) {
    let ref = null;
    if (typeof entry === 'number') ref = { id: entry };
    else if (typeof entry === 'string' && entry.trim()) {
      const value = entry.trim();
      ref = /^\d+$/.test(value) ? { id: Number(value) } : { name: value };
    } else if (entry && typeof entry === 'object') {
      if (entry.id != null && !entry.name) ref = { id: Number(entry.id) };
      else if (typeof entry.characterId === 'number') ref = { id: entry.characterId };
      else if (typeof entry.name === 'string' && !entry.id) ref = { name: entry.name };
      else if (typeof entry.url === 'string') {
        const match = entry.url.match(/(\d+)(?!.*\d)/);
        if (match) ref = { id: Number(match[1]) };
      }
    }
    if (!ref) continue;
    const key = ref.id != null ? `id:${ref.id}` : `name:${ref.name.toLowerCase()}`;
    if (!seen.has(key)) {
      refs.push(ref);
      seen.add(key);
    }
  }
  return refs;
}

export function firstAppearance(character) {
  const debut = character?.debut;
  if (!debut || typeof debut !== 'object') return 'Not recorded';
  return textValue(debut.anime || debut.manga || debut.movie, 'Not recorded');
}

export function normalizeCollection(data, type) {
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.[type]) ? data[type] : [];
}

export function totalPages(data, type, page, limit) {
  const provided = Number(data?.totalPages ?? data?.total_pages ?? data?.pages);
  if (Number.isFinite(provided) && provided > 0) return provided;
  const total = Number(
    data?.total ?? data?.count ?? data?.[`total${type[0].toUpperCase()}${type.slice(1)}`],
  );
  if (Number.isFinite(total) && total > 0) return Math.ceil(total / limit);
  const list = normalizeCollection(data, type);
  return list.length < limit ? page : page + 1; // safe fallback; unknown total
}
