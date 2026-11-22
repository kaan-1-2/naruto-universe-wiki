import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import ShinobiTile from '../components/ShinobiTile.jsx';
import { ErrorState, LoadingGrid } from '../components/Status.jsx';
import { useFeaturedCharacters } from '../hooks/useArchive.js';

export default function HomePage() {
  const { items, loading, error, retry } = useFeaturedCharacters();
  return (
    <div className="wiki-home">
      <section className="wiki-hero">
        <div className="hero-content page-width">
          <h1>
            The Ultimate
            <br />
            <span>Naruto</span> Wiki
          </h1>
          <p>
            Explore characters, clans, villages, jutsu and the rich world of Naruto. Discover
            detailed profiles, relationships and more.
          </p>
          <div className="hero-actions">
            <Link className="ink-button" to="/characters">
              <Icon name="leaf" />
              Explore Characters <Icon name="arrow" size={17} />
            </Link>
            <Link className="paper-button" to="/ninja-dash">
              <Icon name="game" />
              Play Shinobi Dash
            </Link>
          </div>
        </div>
      </section>
      <div className="parchment home-parchment">
        <section className="world-section page-width">
          <div className="world-copy">
            <h2 className="brush-heading">The World of Shinobi</h2>
            <p>
              A world shaped by five great nations, each with its own hidden village, culture and
              shinobi traditions. Explore the map and learn about their history, people and power.
            </p>
            <Link className="ink-button" to="/villages">
              Explore the Shinobi World <Icon name="arrow" size={18} />
            </Link>
          </div>
          <Link
            className="world-map"
            to="/villages"
            aria-label="Explore the five great shinobi nations"
          >
            <img
              src="/assets/shinobi-atlas.png"
              alt="Illustrated map of the Lands of Fire, Wind, Water, Earth and Lightning"
            />
          </Link>
          <div className="hanging-scroll" aria-hidden="true">
            <span>
              忍<br />の<br />世<br />界
            </span>
            <small>
              N<br />✥<br />S
            </small>
          </div>
        </section>
        <section className="featured-legends page-width">
          <div className="section-heading">
            <h2 className="brush-heading">Featured Characters</h2>
            <Link to="/characters">
              View All Characters <Icon name="arrow" size={16} />
            </Link>
          </div>
          {loading ? (
            <LoadingGrid count={6} />
          ) : error ? (
            <ErrorState message={error} onRetry={retry} />
          ) : (
            <div className="featured-grid">
              {items.map((item) => (
                <ShinobiTile item={item} key={item.id} />
              ))}
            </div>
          )}
        </section>
        <section className="quick-paths page-width" aria-label="Explore the archive">
          {[
            {
              to: '/clans',
              icon: 'users',
              title: 'Clans',
              text: 'Discover the great clans and their unique abilities.',
              art: 'path-clans',
            },
            {
              to: '/villages',
              icon: 'leaf',
              title: 'Villages',
              text: 'Explore the hidden villages of the shinobi world.',
              art: 'path-villages',
            },
            {
              to: '/ninja-dash',
              icon: 'game',
              title: 'Shinobi Game',
              text: 'Play Shinobi Dash and test your reflexes!',
              art: 'shuriken-run',
            },
          ].map((x) => (
            <Link
              key={x.to}
              to={x.to}
              className="quick-path"
              style={{
                backgroundImage: `linear-gradient(90deg,#111317 10%,#111317d9 50%,#11131730),url('/assets/banners/${x.art}.webp')`,
              }}
            >
              <Icon name={x.icon} size={34} />
              <div>
                <h2>{x.title}</h2>
                <p>{x.text}</p>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
