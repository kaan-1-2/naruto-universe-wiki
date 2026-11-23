import Icon from './Icon.jsx';
import ShinobiLoading from './ShinobiLoading.jsx';

export function LoadingGrid({ count = 8, label = 'Loading the shinobi archive…' }) {
  return (
    <div className="archive-loading">
      <ShinobiLoading label={label} />
      <div aria-hidden="true" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: count }, (_, index) => (
          <div
            key={index}
            className="loading-card animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-white/5"
          >
            <div className="h-52 bg-white/10" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-3/4 rounded bg-white/10" />
              <div className="h-3 w-1/2 rounded bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export function ErrorState({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="feedback-panel mx-auto max-w-2xl rounded-3xl px-7 py-12 text-center"
    >
      <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-300">
        <Icon name="info" size={28} />
      </span>
      <h2 className="text-2xl font-bold">Something went wrong</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-400">
        {message || 'Something went wrong.'} Please try again in a moment.
      </p>
      <button
        onClick={onRetry}
        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-bold text-[#10131b] hover:bg-orange-400"
      >
        <Icon name="refresh" size={18} /> Try again
      </button>
    </div>
  );
}
export function EmptyState({
  title = 'No entries found',
  message = 'Try another search or reset the filters.',
}) {
  return (
    <div className="col-span-full rounded-3xl border border-dashed border-white/15 bg-white/3 px-6 py-14 text-center">
      <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/6 text-orange-300">
        <Icon name="search" size={26} />
      </span>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-slate-400">{message}</p>
    </div>
  );
}
export function PageIntro({ eyebrow, title, description }) {
  return (
    <div className="mb-9 reveal">
      <div className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[.27em] text-orange-400">
        <span className="h-px w-9 bg-orange-400" />
        {eyebrow}
      </div>
      <h1 className="font-display max-w-4xl text-5xl font-bold uppercase tracking-[.03em] sm:text-6xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-8 text-slate-400">{description}</p>
    </div>
  );
}
