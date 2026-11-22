import { Link } from 'react-router-dom';
import { CharacterCard } from '../components/ArchiveCard.jsx';
import { EmptyState, PageIntro } from '../components/Status.jsx';
import { useSavedCollection } from '../context/CollectionContext.jsx';
import Icon from '../components/Icon.jsx';

export default function FavoritesPage() {
  const { favorites, clearFavorites } = useSavedCollection();
  return (
    <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-18">
      <div
        className="favorites-banner mb-8 rounded-2xl border border-[#d88b64]/45 px-7 py-11"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(22,13,21,.96),rgba(22,13,21,.86) 60%,rgba(22,13,21,.22)),url('/assets/banners/my-shinobi.webp')`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <PageIntro
          eyebrow="My shinobi collection"
          title="Your favorites"
          description="Save the shinobi you admire most and revisit their stories whenever you like."
        />
      </div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          {favorites.length} saved character{favorites.length === 1 ? '' : 's'}
        </p>
        {favorites.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Remove all favorites?')) clearFavorites();
            }}
            className="text-sm font-semibold text-slate-400 hover:text-red-300"
          >
            Clear favorites
          </button>
        )}
      </div>
      {favorites.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favorites.map((item) => (
            <CharacterCard
              key={item.id}
              character={{
                ...item,
                personal: { clan: item.clanLabel !== 'Unrecorded' ? [item.clanLabel] : [] },
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Your collection is empty"
          message="Browse the characters and press Save to keep favorites here."
        />
      )}
      <Link
        to="/characters"
        className="mt-8 inline-flex items-center gap-2 font-bold text-orange-300 hover:underline"
      >
        Browse characters <Icon name="arrow" size={17} />
      </Link>
    </div>
  );
}
