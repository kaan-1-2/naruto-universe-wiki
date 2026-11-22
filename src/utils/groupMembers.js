import { findCharacterById, findCharacterByName } from './characterDirectory.js';
import { extractMemberReferences, getMembers } from './format.js';

// Membership comes from the group response; card metadata can use the existing directory.
export function prepareGroupMembers(group) {
  const members = new Map();
  const unresolved = [];
  const unresolvedKeys = new Set();
  for (const entry of [...getMembers(group), ...extractMemberReferences(group)]) {
    const known = entry.id != null ? findCharacterById(entry.id) : findCharacterByName(entry.name);
    const member = known
      ? {
          ...known,
          ...entry,
          name: entry.name || known.name,
          images: entry.images?.length ? entry.images : known.images,
        }
      : entry;
    const key = member.id != null ? `id:${member.id}` : `name:${member.name?.toLowerCase()}`;
    if (member.name && (known || entry.images)) {
      if (!members.has(key)) members.set(key, member);
    } else if (!unresolvedKeys.has(key)) {
      unresolved.push(entry);
      unresolvedKeys.add(key);
    }
  }
  return { members: [...members.values()], unresolved };
}
