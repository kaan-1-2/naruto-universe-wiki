import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import { characterAffiliation, characterClan, memberCount } from '../utils/format.js';
import { portraitCandidates } from '../utils/art.js';
import { clanScene, sceneAccent, villageScene } from '../utils/scenes.js';
import { useSavedCollection } from '../context/CollectionContext.jsx';

export function Portrait({ item, className = '', nameSize = 'text-6xl' }) {
  const urls = useMemo(() => portraitCandidates(item), [item]);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => setAttempt(0), [item?.id, item?.name]);
  const src = urls[Math.min(attempt, urls.length - 1)];
  const illustrated = src?.startsWith('data:image/svg+xml');
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#653e41] via-[#312536] to-[#161823] ${illustrated ? 'portrait-unavailable' : ''} ${className}`}
    >
      <img
        loading="lazy"
        key={src}
        src={src}
        alt={`${item?.name || 'Shinobi'} portrait${illustrated ? ' — portrait unavailable' : ''}`}
        onError={() => setAttempt((value) => Math.min(value + 1, urls.length - 1))}
        className="h-full w-full object-cover object-center"
      />
      {illustrated ? (
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-white/15 bg-black/60 px-2 py-1 text-[9px] uppercase tracking-wider text-white/70">
          Portrait unavailable
        </span>
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#130d18]/65 via-transparent to-transparent" />
    </div>
  );
}

export function CharacterCard({ character }) {
  const { isFavorite, inCompare, toggleFavorite, toggleCompare } = useSavedCollection();
  return (
    <article className="character-card card-lift group overflow-hidden rounded-xl border border-[#ac6650]/30 bg-[#201820] shadow-xl shadow-black/25">
      <Link
        to={`/characters/${character.id}`}
        className="block"
        aria-label={`View ${character.name} details`}
      >
        <Portrait item={character} className="h-55 w-full" />
        <div className="px-5 pt-4">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[.2em] text-amber-400">
            Shinobi profile
          </p>
          <h2 className="font-display line-clamp-1 text-2xl font-bold tracking-wide text-white transition group-hover:text-orange-300">
            {character.name}
          </h2>
          <p className="mt-2 line-clamp-1 text-xs text-slate-300">{characterClan(character)}</p>
          <p className="mt-1 line-clamp-1 text-xs text-slate-400">
            {characterAffiliation(character)}
          </p>
        </div>
      </Link>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#b46e58]/20 px-5 py-3">
        <button
          type="button"
          onClick={() => toggleFavorite(character)}
          aria-label={`${isFavorite(character.id) ? 'Remove' : 'Add'} ${character.name} ${isFavorite(character.id) ? 'from' : 'to'} favorites`}
          aria-pressed={isFavorite(character.id)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold ${isFavorite(character.id) ? 'bg-red-500/15 text-red-300' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
        >
          <Icon name="heart" size={16} filled={isFavorite(character.id)} />
          {isFavorite(character.id) ? 'Favorited' : 'Favorite'}
        </button>
        <button
          type="button"
          onClick={() => toggleCompare(character)}
          aria-pressed={inCompare(character.id)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold ${inCompare(character.id) ? 'bg-orange-500/15 text-orange-300' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
        >
          <Icon name="compare" size={16} />
          {inCompare(character.id) ? 'Selected' : 'Compare'}
        </button>
      </div>
    </article>
  );
}

export function GroupCard({ item, type }) {
  const count = memberCount(item);
  const isClan = type === 'clans';
  const art = isClan ? clanScene(item.name, item.id) : villageScene(item.name, item.id);
  const color = isClan ? sceneAccent(item.name) : '#ffcd91';
  return (
    <Link
      to={`/${type}/${item.id}`}
      aria-label={`Explore ${item.name} ${isClan ? 'clan' : 'village'}`}
      className="illustrated-group card-lift group relative flex min-h-63 flex-col justify-end overflow-hidden rounded-xl border border-[#a96b50]/45 bg-[#261d26] p-5 shadow-xl shadow-black/30 sm:min-h-68"
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.07]"
        style={{ backgroundImage: `url("${art}")` }}
        role="img"
        aria-label={`${item.name} inspired ${isClan ? 'clan crest illustration' : 'village landscape illustration'}`}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0a12]/98 via-[#130d18]/55 to-[#1b0d1a]/8" />
      <div className="relative z-10">
        <p className="text-[10px] font-extrabold uppercase tracking-[.19em]" style={{ color }}>
          {isClan ? 'Shinobi clan' : 'Hidden village'}
        </p>
        <h2 className="font-display mt-1 break-words text-3xl font-bold leading-tight text-white drop-shadow-lg transition-colors group-hover:text-[#ffd9b7]">
          {item.name}
        </h2>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/20 pt-3 text-xs text-[#e9d6c1]">
          <span>{count !== null ? `${count} known members` : 'Explore this place'}</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white group-hover:bg-[#b33431]">
            <Icon name="arrow" size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}
