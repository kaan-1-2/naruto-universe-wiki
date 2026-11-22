import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { fetchAnime, mediaStatus } from '../services/anime.js';
import { EmptyState, ErrorState, LoadingGrid } from '../components/Status.jsx';
import Icon from '../components/Icon.jsx';

function Poster({ item }) {
  const [failed, setFailed] = useState(false);
  return failed || !item.coverImage?.large ? (
    <div className="screen-poster screen-poster-fallback">
      <Icon name="film" size={48} />
      <span>{item.name}</span>
    </div>
  ) : (
    <img
      className="screen-poster"
      src={item.coverImage.extraLarge || item.coverImage.large}
      alt={`${item.name} poster`}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}

export default function AnimePage() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState('all');
  const [state, setState] = useState({ items: [], loading: true, error: '' });
  const [retry, setRetry] = useState(0);
  const search = params.get('search') || '';
  useEffect(() => {
    let active = true;
    setState((previous) => ({ ...previous, loading: true, error: '' }));
    fetchAnime()
      .then((items) => {
        if (active) setState({ items, loading: false, error: '' });
      })
      .catch((error) => {
        if (active) setState({ items: [], loading: false, error: error.message });
      });
    return () => {
      active = false;
    };
  }, [retry]);
  const item = state.items.find((entry) => String(entry.id) === id);
  useEffect(() => {
    document.title = `${item?.name || 'Anime & Movies'} · Naruto Universe Wiki`;
  }, [item]);
  const shown = state.items.filter(
    (entry) =>
      (filter === 'all' || entry.format === filter) &&
      `${entry.name} ${entry.title.romaji}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="screen-page page-width">
      {id && (
        <Link className="screen-back" to="/anime">
          <Icon name="arrowLeft" size={18} /> Back to anime & movies
        </Link>
      )}
      {state.loading ? (
        <>
          <h1 className="screen-loading-title">Opening the screen archive…</h1>
          <LoadingGrid />
        </>
      ) : state.error ? (
        <ErrorState message={state.error} onRetry={() => setRetry((n) => n + 1)} />
      ) : id ? (
        item ? (
          <>
            <section
              className="screen-detail-hero"
              style={{
                backgroundImage: `linear-gradient(90deg,#101415ee,#101415aa),url("${item.bannerImage || '/assets/konoha-panorama.png'}")`,
              }}
            >
              <Poster key={item.id} item={item} />
              <div>
                <p className="screen-eyebrow">
                  {item.format === 'MOVIE' ? 'Motion picture' : 'Anime series'} ·{' '}
                  {mediaStatus(item.status)}
                </p>
                <h1>{item.name}</h1>
                {item.name !== item.title.romaji && (
                  <p className="screen-romaji">{item.title.romaji}</p>
                )}
                <div className="screen-facts">
                  {[
                    ['Release', item.startDate?.year],
                    ['Episodes', item.format === 'TV' ? item.episodes : null],
                    [
                      item.format === 'TV' ? 'Per episode' : 'Runtime',
                      item.duration ? `${item.duration} min` : null,
                    ],
                    ['Community score', item.averageScore ? `${item.averageScore}%` : null],
                  ]
                    .filter(([, value]) => value)
                    .map(([label, value]) => (
                      <div key={label}>
                        <span>{label}</span>
                        <strong>{value}</strong>
                      </div>
                    ))}
                </div>
              </div>
            </section>
            <div className="screen-detail-grid">
              <section className="paper-panel screen-synopsis">
                <h2>Synopsis</h2>
                {item.synopsis ? (
                  item.synopsis
                    .split(/\n\s*\n/)
                    .map((paragraph, index) => <p key={index}>{paragraph}</p>)
                ) : (
                  <p>A synopsis is not available for this title yet.</p>
                )}
              </section>
              <aside className="paper-panel screen-information">
                <h2>Production</h2>
                <dl>
                  {[
                    ['Format', item.format === 'TV' ? 'TV anime' : 'Movie'],
                    ['Status', mediaStatus(item.status)],
                    [
                      'Japanese premiere',
                      item.startDate?.year
                        ? [
                            item.startDate.year,
                            item.startDate.month && String(item.startDate.month).padStart(2, '0'),
                            item.startDate.day && String(item.startDate.day).padStart(2, '0'),
                          ]
                            .filter(Boolean)
                            .join(' / ')
                        : null,
                    ],
                    ['Studio', item.studios?.nodes?.map((studio) => studio.name).join(', ')],
                    ['Genres', item.genres?.join(', ')],
                  ]
                    .filter(([, value]) => value)
                    .map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                </dl>
                <a
                  className="biography-source"
                  href={`https://anilist.co/anime/${item.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on AniList ↗
                </a>
              </aside>
            </div>
          </>
        ) : (
          <EmptyState
            title="Title not found"
            message="Return to the screen archive to choose an anime or film."
          />
        )
      ) : (
        <>
          <section className="screen-hero">
            <p className="screen-eyebrow">The shinobi screen archive</p>
            <h1>
              Anime <em>&</em> Movies
            </h1>
            <p>
              From Naruto’s first mission to the next generation. Explore the series and cinema
              adventures of the shinobi world.
            </p>
            <div className="screen-totals">
              <span>
                {state.items.filter((entry) => entry.format === 'TV').length} anime series
              </span>
              <span>{state.items.filter((entry) => entry.format === 'MOVIE').length} movies</span>
              <span>In release order</span>
            </div>
          </section>
          <div className="screen-toolbar">
            <div className="screen-filters" role="group" aria-label="Title format">
              {[
                ['all', 'All titles'],
                ['TV', 'Anime series'],
                ['MOVIE', 'Movies'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="screen-search">
              <Icon name="search" size={18} />
              <input
                aria-label="Search anime and movies"
                type="search"
                placeholder="Search a title…"
                value={search}
                onChange={(event) => {
                  const next = new URLSearchParams(params);
                  event.target.value
                    ? next.set('search', event.target.value)
                    : next.delete('search');
                  setParams(next, { replace: true });
                }}
              />
            </label>
          </div>
          <p className="screen-result-count" aria-live="polite">
            {shown.length} titles · Japanese release order
          </p>
          <div className="screen-grid">
            {shown.map((entry) => (
              <Link key={entry.id} to={`/anime/${entry.id}`} className="screen-card">
                <div className="screen-card-art">
                  <Poster item={entry} />
                  <span className="screen-format">
                    {entry.format === 'TV'
                      ? 'Anime series'
                      : entry.duration && entry.duration < 40
                        ? 'Short movie'
                        : 'Movie'}
                  </span>
                </div>
                <div className="screen-card-copy">
                  <p>
                    {entry.startDate?.year || mediaStatus(entry.status)}
                    {entry.format === 'TV' && entry.episodes
                      ? ` · ${entry.episodes} episodes`
                      : entry.duration
                        ? ` · ${entry.duration} min`
                        : ''}
                  </p>
                  <h2>{entry.name}</h2>
                  <span className="screen-card-link">
                    Explore title <Icon name="arrow" size={17} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
          {!shown.length && (
            <EmptyState
              title="No titles found"
              message="Try another title or choose a different format."
            />
          )}
          <p className="screen-attribution">
            Synopsis, posters and production details:{' '}
            <a href="https://anilist.co" target="_blank" rel="noreferrer">
              AniList
            </a>
            .
          </p>
        </>
      )}
    </div>
  );
}
