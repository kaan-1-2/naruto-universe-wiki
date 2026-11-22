const missingLabels = /^(unknown|unrecorded|not recorded|not available|n\/a|null|undefined|[-—])$/i;

export function recordedText(value) {
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    const text = value.trim();
    return text && !missingLabels.test(text) ? text : '';
  }
  if (Array.isArray(value)) return value.map(recordedText).filter(Boolean).join(', ');
  if (value && typeof value === 'object') {
    return Object.entries(value)
      .map(([label, entry]) => {
        const text = recordedText(entry);
        return text ? `${label}: ${text}` : '';
      })
      .filter(Boolean)
      .join(' · ');
  }
  return '';
}

export function latestRecordedText(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.values(value).map(recordedText).filter(Boolean).at(-1) || '';
  }
  return recordedText(value);
}

export function formatBirthday(date) {
  const month = Number(date?.month);
  const day = Number(date?.day);
  if (!Number.isInteger(month) || !Number.isInteger(day) || month < 1 || month > 12 || day < 1)
    return '';
  const parsed = new Date(Date.UTC(2000, month - 1, day));
  if (parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}

export function biographyText(description) {
  if (typeof description !== 'string') return '';
  return description
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(?:p|div)\b[^>]*>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/(?:~!|!~|__|\*\*|~~)/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function biographySummary(text) {
  const paragraphs = String(text || '').split(/\n\s*\n/);
  const prose = paragraphs.find((paragraph) => {
    const line = paragraph.trim();
    return (
      line.length > 60 &&
      !/^(height|weight|family|clan|rank|occupation|affiliation|age|birthday|classification|blood type)\s*:/i.test(
        line,
      )
    );
  });
  if (!prose) return '';
  const compact = prose.replace(/\s+/g, ' ').trim();
  if (compact.length <= 380) return compact;
  const end = compact.lastIndexOf(' ', 377);
  return compact.slice(0, end > 0 ? end : 377).trim() + '…';
}

export function mergeCharacterDetails(character, extra) {
  if (!extra) return character;
  const personal = { ...(character.personal || {}) };
  const additions = {
    sex: extra.gender,
    birthdate: formatBirthday(extra.dateOfBirth),
    age: extra.age,
    bloodType: extra.bloodType,
  };
  for (const [key, value] of Object.entries(additions)) {
    if (!recordedText(personal[key]) && recordedText(value)) personal[key] = value;
  }
  return { ...character, personal };
}
