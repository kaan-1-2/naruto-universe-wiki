import CharacterDetail from '../components/CharacterProfile.jsx';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Portrait } from '../components/ArchiveCard.jsx';
import { ErrorState, LoadingGrid } from '../components/Status.jsx';
import Icon from '../components/Icon.jsx';
import { useItem } from '../hooks/useArchive.js';
import { fetchCharactersByReferences } from '../services/api.js';
import { memberCount } from '../utils/format.js';
import { prepareGroupMembers } from '../utils/groupMembers.js';
import { clanScene, villageScene } from '../utils/scenes.js';

function GroupDetail({ item, type }) {
  const { members: directMembers, unresolved: memberRefs } = useMemo(
    () => prepareGroupMembers(item),
    [item],
  );
  const [visibleCount, setVisibleCount] = useState(24);
  const [resolvedMembers, setResolvedMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    const resolvedKeys = new Set(
      directMembers.map((member) =>
        member.id ? `id:${member.id}` : `name:${member.name?.toLowerCase?.()}`,
      ),
    );
    const missingRefs = memberRefs.filter((reference) => {
      const key = reference.id ? `id:${reference.id}` : `name:${reference.name.toLowerCase()}`;
      return !resolvedKeys.has(key);
    });

    if (!missingRefs.length) {
      setResolvedMembers([]);
      setLoadingMembers(false);
      return undefined;
    }

    const controller = new AbortController();
    setLoadingMembers(true);
    fetchCharactersByReferences(missingRefs.slice(0, visibleCount), { signal: controller.signal })
      .then((members) => {
        if (!controller.signal.aborted) setResolvedMembers(members);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingMembers(false);
      });

    return () => controller.abort();
  }, [directMembers, memberRefs, visibleCount]);

  const members = useMemo(() => {
    const list = [...directMembers, ...resolvedMembers];
    const seen = new Set();
    return list.filter((member) => {
      const key = member.id ? `id:${member.id}` : `name:${member.name?.toLowerCase?.()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [directMembers, resolvedMembers]);

  const count = memberCount(item);
  const archiveLabel = type === 'clans' ? 'THE CLAN' : 'THE VILLAGE';
  return (
    <>
      <div
        className="relative isolate overflow-hidden rounded-2xl border border-[#d59573]/50 px-7 py-16 shadow-2xl shadow-black/25 sm:px-11 sm:py-20"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(16,12,21,.96),rgba(16,12,21,.78) 52%,rgba(16,12,21,.30)),url("${type === 'clans' ? clanScene(item.name, item.id) : villageScene(item.name, item.id)}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <p className="font-display text-xs font-bold uppercase tracking-[.25em] text-orange-300">
          {archiveLabel}
        </p>
        <h1 className="font-display mt-3 break-words text-5xl font-bold uppercase tracking-[.06em] text-white sm:text-6xl">
          {item.name}
        </h1>
        <p className="mt-5 text-sm text-[#f5d8c5]">
          {count === null
            ? 'Explore the characters connected to this place.'
            : `${count} known members in this group`}
        </p>
      </div>
      <div className="mt-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold uppercase tracking-[.06em]">
              Connected characters
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Meet the shinobi connected with this village or clan.
            </p>
          </div>
          <Link
            to="/characters"
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-300 hover:underline"
          >
            Browse all <Icon name="arrow" size={16} />
          </Link>
        </div>
        {loadingMembers && !members.length ? (
          <LoadingGrid count={3} />
        ) : members.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.slice(0, visibleCount).map((member, index) => (
              <Link
                key={`${member.id ?? member.name}-${index}`}
                to={
                  member.id
                    ? `/characters/${member.id}`
                    : `/characters/name/${encodeURIComponent(member.name)}`
                }
                className="card-lift flex items-center gap-4 rounded-xl border border-white/10 bg-[#152034] p-3"
              >
                <Portrait
                  item={member}
                  className="h-16 w-16 shrink-0 rounded-lg"
                  nameSize="text-2xl"
                />
                <div>
                  <p className="font-semibold">{member.name}</p>
                  <span className="text-xs text-orange-300">See profile</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#152034] p-8 text-sm leading-7 text-slate-400">
            No related characters are listed here yet. Visit the character collection to discover
            more shinobi.
          </div>
        )}
        {directMembers.length + memberRefs.length > visibleCount && (
          <div className="mt-7 text-center">
            <p className="mb-3 text-sm text-slate-500" aria-live="polite">
              {Math.min(visibleCount, members.length)} of {directMembers.length + memberRefs.length}{' '}
              characters shown
            </p>
            <button className="ink-button" onClick={() => setVisibleCount((value) => value + 24)}>
              Load more characters
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function DetailPage({ type }) {
  const { id } = useParams();
  const { item, loading, error, retry } = useItem(type, id);
  return (
    <div className="detail-page page-width">
      <Link
        to={`/${type}`}
        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-orange-300"
      >
        <Icon name="arrowLeft" size={17} /> Back to {type}
      </Link>
      {loading ? (
        <LoadingGrid count={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : !item || !item.name ? (
        <ErrorState message="We couldn't find this character." onRetry={retry} />
      ) : type === 'characters' ? (
        <CharacterDetail item={item} />
      ) : (
        <GroupDetail key={`${type}:${id}`} item={item} type={type} />
      )}
    </div>
  );
}
