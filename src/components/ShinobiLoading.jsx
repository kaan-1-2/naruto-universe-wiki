export default function ShinobiLoading({
  label = 'Loading the shinobi archive…',
  compact = false,
}) {
  return (
    <div role="status" className={`shinobi-loading${compact ? ' shinobi-loading-compact' : ''}`}>
      <span className="shuriken-seal" aria-hidden="true">
        <svg className="loading-shuriken" viewBox="0 0 100 100" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M50 4 62 34 96 50 66 62 50 96 38 66 4 50 34 38Zm0 38a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z"
          />
        </svg>
      </span>
      <span className="shinobi-loading-label">{label}</span>
    </div>
  );
}
