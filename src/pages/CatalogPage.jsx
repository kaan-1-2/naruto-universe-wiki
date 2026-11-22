import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { CharacterCard, GroupCard } from '../components/ArchiveCard.jsx';
import { PageIntro, LoadingGrid, ErrorState, EmptyState } from '../components/Status.jsx';
import { useCollection, useDebounced } from '../hooks/useArchive.js';

const settings = {
  characters: {
    title: 'Meet the shinobi',
    eyebrow: 'Ninja World / Characters',
    description: 'Find the heroes, rivals and legends of the Naruto universe.',
    placeholder: 'Search characters (e.g. Naruto)',
  },
  clans: {
    title: 'The great clans',
    eyebrow: 'Ninja World / Clans',
    description: 'Browse the families and lineages that connect generations of shinobi.',
    placeholder: 'Search clans (e.g. Uchiha)',
  },
  villages: {
    title: 'Hidden villages',
    eyebrow: 'Ninja World / Villages',
    description: 'Explore the locations and settlements woven into the Naruto universe.',
    placeholder: 'Search villages (e.g. Konoha)',
  },
};

export default function CatalogPage({ type }) {
  const config = settings[type];
  const [params] = useSearchParams();
  const [search, setSearch] = useState(() => params.get('search') || '');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('default');
  const debounced = useDebounced(search);
  useEffect(() => {
    setSearch(params.get('search') || '');
  }, [params]);
  // Return to the first page when search changes, avoiding stale page counts.
  useEffect(() => {
    setPage(1);
  }, [debounced, type]);
  const { items, pages, loading, error, total, retry } = useCollection(type, {
    name: debounced,
    page,
    limit: 12,
  });
  const shown = useMemo(
    () =>
      sort === 'az'
        ? [...items].sort((a, b) => a.name.localeCompare(b.name))
        : sort === 'za'
          ? [...items].sort((a, b) => b.name.localeCompare(a.name))
          : items,
    [items, sort],
  );

  const headerArt =
    type === 'characters'
      ? '/assets/konoha-panorama.png'
      : type === 'clans'
        ? '/assets/banners/path-clans.webp'
        : '/assets/banners/path-villages.webp';
  return (
    <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-18">
      <div
        className="catalog-banner relative mb-8 overflow-hidden rounded-2xl border border-[#d08e6b]/40 px-6 py-10 sm:px-9"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(20,12,18,.97),rgba(25,13,22,.87) 53%,rgba(25,13,22,.33)),url('${headerArt}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <PageIntro eyebrow={config.eyebrow} title={config.title} description={config.description} />
      </div>
      <div className="glass-panel mb-7 flex flex-col gap-4 rounded-2xl border border-[#b87457]/30 p-4 md:flex-row md:items-center md:justify-between">
        <label className="relative block w-full md:max-w-xl">
          <span className="sr-only">Search {type}</span>
          <Icon
            name="search"
            size={20}
            className="pointer-events-none absolute left-4 top-3.5 text-slate-400"
          />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder={config.placeholder}
            type="search"
            className="w-full rounded-xl border border-white/15 bg-[#0a101c] py-3.5 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400 focus:ring-2 focus:ring-orange-500/15"
          />
        </label>
        <div className="flex items-center justify-between gap-4">
          <label className="text-xs font-semibold text-slate-400" htmlFor="sort-list">
            Sort by
          </label>
          <select
            id="sort-list"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="rounded-xl border border-white/15 bg-[#0a101c] px-4 py-3.5 text-sm text-slate-100 outline-none focus:border-orange-400"
          >
            <option value="default">Default order</option>
            <option value="az">Name (A–Z)</option>
            <option value="za">Name (Z–A)</option>
          </select>
        </div>
      </div>
      <div className="mb-5 flex items-center justify-between gap-3 text-xs text-slate-500">
        <span aria-live="polite">
          {loading
            ? 'Finding shinobi...'
            : `${shown.length} shown${total !== null ? ` · ${total} found` : ''}`}
        </span>
        <span>
          Page {page}
          {pages ? ` / ${pages}` : ''}
        </span>
      </div>
      {error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : loading ? (
        <LoadingGrid />
      ) : shown.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((item) =>
            type === 'characters' ? (
              <CharacterCard key={item.id} character={item} />
            ) : (
              <GroupCard key={item.id} item={item} type={type} />
            ),
          )}
        </div>
      )}
      {!loading && !error && (page > 1 || pages > 1) && (
        <nav
          aria-label={`${type} pagination`}
          className="mt-10 flex items-center justify-center gap-3"
        >
          <button
            disabled={page <= 1}
            onClick={() => {
              setPage((p) => p - 1);
              window.scrollTo(0, 0);
            }}
            className="inline-flex items-center gap-1 rounded-xl border border-white/15 px-5 py-3 text-sm font-bold disabled:opacity-35 hover:bg-white/5"
          >
            <Icon name="arrowLeft" size={16} /> Previous
          </button>
          <span className="rounded-xl bg-white/5 px-4 py-3 text-sm font-bold">
            {page} / {pages}
          </span>
          <button
            disabled={page >= pages}
            onClick={() => {
              setPage((p) => p + 1);
              window.scrollTo(0, 0);
            }}
            className="inline-flex items-center gap-1 rounded-xl border border-white/15 px-5 py-3 text-sm font-bold disabled:opacity-35 hover:bg-white/5"
          >
            Next <Icon name="arrow" size={16} />
          </button>
        </nav>
      )}
      <p className="mt-8 text-center text-xs text-slate-600">
        Alphabetical sorting changes the order of the items shown on this page.
      </p>
    </div>
  );
}
