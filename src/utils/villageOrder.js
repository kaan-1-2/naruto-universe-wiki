import { memberCount } from './format.js';

const featuredVillages = [
  'Konohagakure',
  'Sunagakure',
  'Kirigakure',
  'Kumogakure',
  'Iwagakure',
  'Amegakure',
  'Otogakure',
  'Uzushiogakure',
  'Takigakure',
  'Kusagakure',
  'Yugakure',
  'Yukigakure',
];
const priority = new Map(featuredVillages.map((name, index) => [name.toLowerCase(), index]));

export function orderVillages(villages) {
  const rank = (village) => priority.get(village.name?.toLowerCase()) ?? Infinity;
  const hasMembers = (village) => (memberCount(village) ?? 0) > 0;
  return [...villages].sort((a, b) => {
    if (hasMembers(a) !== hasMembers(b)) return hasMembers(a) ? -1 : 1;
    if (rank(a) !== rank(b)) return rank(a) < rank(b) ? -1 : 1;
    return (memberCount(b) ?? 0) - (memberCount(a) ?? 0) || a.name.localeCompare(b.name);
  });
}
