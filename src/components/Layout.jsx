import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { useSavedCollection } from '../context/CollectionContext.jsx';
const navItems = [
  ['/', 'Home', 'home'],
  ['/characters', 'Characters', 'users'],
  ['/clans', 'Clans', 'clan'],
  ['/villages', 'Villages', 'map'],
  ['/anime', 'Anime & Movies', 'film'],
  ['/compare', 'Compare', 'compare'],
  ['/ninja-dash', 'Game', 'game'],
];
export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { compare } = useSavedCollection();
  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileOpen(false);
    if (!location.pathname.startsWith('/anime'))
      document.title = `Naruto Universe Wiki · ${location.pathname === '/' ? 'Home' : decodeURIComponent(location.pathname.split('/').filter(Boolean).at(-1))}`;
  }, [location.pathname]);
  function submit(e) {
    e.preventDefault();
    if (search.trim()) {
      const category = location.pathname.startsWith('/clans')
        ? 'clans'
        : location.pathname.startsWith('/villages')
          ? 'villages'
          : location.pathname.startsWith('/anime')
            ? 'anime'
            : 'characters';
      navigate(`/${category}?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  }
  return (
    <div
      className={`chakra-bg wiki-shell ${location.pathname === '/' ? 'theme-home' : 'theme-leaf'}`}
    >
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="wiki-header">
        <div className="header-inner">
          <Link to="/" className="wiki-wordmark" aria-label="Naruto Universe Wiki home">
            <img src="/assets/motifs/leaf.svg" alt="" />
            <span>
              Naruto Universe
              <br />
              Wiki
            </span>
          </Link>
          <nav className="desktop-navigation" aria-label="Main navigation">
            {navItems.map(([to, label, icon]) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => `wiki-nav ${isActive ? 'active' : ''}`}
              >
                <Icon name={icon} size={17} />
                {label}
                {to === '/compare' && compare.length > 0 ? <small>{compare.length}</small> : null}
              </NavLink>
            ))}
          </nav>
          <form className="header-search" role="search" onSubmit={submit}>
            <label className="sr-only" htmlFor="global-search">
              Search the current archive category
            </label>
            <input
              id="global-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search characters, clans, villages…"
              type="search"
            />
            <button aria-label="Search">
              <Icon name="search" size={19} />
            </button>
          </form>
          <NavLink to="/favorites" className="bookmark-link" aria-label="Favorites">
            <Icon name="bookmark" size={21} />
            <span>Favorites</span>
          </NavLink>
          <button
            className="mobile-menu-button"
            onClick={() => setMobileOpen((x) => !x)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <Icon name={mobileOpen ? 'close' : 'menu'} />
          </button>
        </div>
        {mobileOpen && (
          <nav id="mobile-navigation" aria-label="Mobile navigation">
            {navItems.map(([to, label, icon]) => (
              <NavLink to={to} key={to} end={to === '/'}>
                <Icon name={icon} size={17} />
                {label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>
      <div key={location.pathname} className="route-transition-overlay" aria-hidden="true">
        <span className="route-parchment" />
      </div>
      <main id="main-content" className="route-stage">
        <div>{children}</div>
      </main>
      <footer className="wiki-footer page-width">
        <Link to="/" className="footer-brand">
          Naruto Universe Wiki
        </Link>
        <p>An independent fan tribute to the world of Naruto.</p>
        <a href="https://naruto.fandom.com/wiki/Narutopedia" target="_blank" rel="noreferrer">
          Character artwork: Narutopedia
        </a>
      </footer>
    </div>
  );
}
