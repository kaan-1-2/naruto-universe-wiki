import { useEffect, useRef, useState } from 'react';
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
  ['/ninja-dash', 'Shinobi Dash', 'game'],
];
export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { compare } = useSavedCollection();
  const contentRef = useRef(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const animation = contentRef.current?.animate(
      [
        { filter: 'blur(1.5px)', opacity: 0.92 },
        { filter: 'blur(0px)', opacity: 1 },
      ],
      { duration: 420, easing: 'ease-out' },
    );
    return () => animation?.cancel();
  }, [location.pathname]);
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
            <span className="wiki-emblem" aria-hidden="true">
              <img src="/assets/motifs/leaf-emblem.png" alt="" />
            </span>
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
        {[0, 1, 2, 3].map((leaf) => (
          <span key={leaf} className={`route-leaf route-leaf-${leaf}`}>
            <svg viewBox="0 0 32 44" fill="none">
              <path d="M27 3C12 5 1 13 4 26c2 9 11 12 17 6 8-8 5-18 6-29Z" fill="currentColor" />
              <path
                d="M7 41C10 28 16 19 24 8M11 29l-5-8m9 1 7 1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
        ))}
      </div>
      <main id="main-content" className="route-stage">
        <div ref={contentRef}>{children}</div>
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
