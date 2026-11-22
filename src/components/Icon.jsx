import React from 'react';

const shapes = {
  film: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 3v18M17 3v18M3 8h4m-4 8h4M17 8h4m-4 8h4M7 12h10" />
    </>
  ),
  gallery: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8" cy="9" r="2" />
      <path d="m4 18 5-5 4 3 4-6 4 7" />
    </>
  ),
  home: (
    <>
      <path d="m3 11 9-8 9 8M5 10v11h5v-7h4v7h5V10" />
    </>
  ),
  clan: (
    <>
      <circle cx="12" cy="6" r="3" />
      <circle cx="5" cy="17" r="3" />
      <circle cx="19" cy="17" r="3" />
      <path d="m10 9-4 5m8-5 4 5M8 17h8" />
    </>
  ),
  game: (
    <>
      <path d="M7 7h10c4 0 6 11 3 12-2 1-4-3-5-3H9c-1 0-3 4-5 3C1 18 3 7 7 7Z" />
      <path d="M6 11v5m-2-2.5h4m7-1h.01m3 2h.01" />
    </>
  ),
  bookmark: (
    <>
      <path d="M6 3h12v19l-6-4-6 4Z" />
      <path d="m9 8 2 2 4-4" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </>
  ),
  arrowLeft: (
    <>
      <path d="M19 12H5m6-6-6 6 6 6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  close: (
    <>
      <path d="M18 6 6 18M6 6l12 12" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>
  ),
  heart: (
    <>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    </>
  ),
  compare: (
    <>
      <rect x="3" y="4" width="7" height="16" rx="1" />
      <rect x="14" y="4" width="7" height="16" rx="1" />
      <path d="M6 9h1m10 0h1M6 13h1m10 0h1" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M2 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m1 3a5 5 0 0 1 5 5v1" />
    </>
  ),
  map: (
    <>
      <path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2zM9 3v16M15 5v16" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22S4 18 4 11V5l8-3 8 3v6c0 7-8 11-8 11Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  star: (
    <>
      <path d="m12 2 3 6 6.7 1-4.8 4.7 1.2 6.7L12 17.3l-6.1 3.1 1.2-6.7L2.3 9 9 8z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" />
    </>
  ),
  layers: (
    <>
      <path d="m12 2-9 5 9 5 9-5-9-5ZM3 12l9 5 9-5M3 17l9 5 9-5" />
    </>
  ),
  external: (
    <>
      <path d="M14 4h6v6m0-6-9 9" />
      <path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 7v5h-5M4 17v-5h5" />
      <path d="M6 9a7 7 0 0 1 12-2l2 2M4 15l2 2a7 7 0 0 0 12-2" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7h.01" />
    </>
  ),
  leaf: (
    <>
      <path d="M20 4C10 4 4 8 4 16a4 4 0 0 0 4 4c8 0 12-6 12-16ZM4 20c4-6 7-9 12-12" />
    </>
  ),
  spark: (
    <>
      <path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z" />
    </>
  ),
  chevron: (
    <>
      <path d="m9 18 6-6-6-6" />
    </>
  ),
};

export default function Icon({ name = 'arrow', size = 20, className = '', filled = false }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {shapes[name] || shapes.arrow}
    </svg>
  );
}
