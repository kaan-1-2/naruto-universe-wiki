import { createContext, useContext, useEffect, useState } from 'react';
import { characterImage, characterClan } from '../utils/format.js';

const CollectionContext = createContext(null);

function readSaved(key) {
  try {
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

export function CollectionProvider({ children }) {
  const [favorites, setFavorites] = useState(() => readSaved('shinobi:favorites'));
  const [compare, setCompare] = useState(() => readSaved('shinobi:compare'));

  useEffect(() => {
    localStorage.setItem('shinobi:favorites', JSON.stringify(favorites));
  }, [favorites]);
  useEffect(() => {
    localStorage.setItem('shinobi:compare', JSON.stringify(compare));
  }, [compare]);

  function minimalRecord(character) {
    return {
      id: character.id,
      name: character.name,
      images: characterImage(character) ? [characterImage(character)] : [],
      clanLabel: characterClan(character),
    };
  }
  const isFavorite = (id) => favorites.some((x) => String(x.id) === String(id));
  const inCompare = (id) => compare.some((x) => String(x.id) === String(id));

  function toggleFavorite(character) {
    setFavorites((current) =>
      current.some((x) => x.id === character.id)
        ? current.filter((x) => x.id !== character.id)
        : [minimalRecord(character), ...current],
    );
  }
  function toggleCompare(character) {
    setCompare((current) =>
      current.some((x) => x.id === character.id)
        ? current.filter((x) => x.id !== character.id)
        : current.length < 2
          ? [...current, minimalRecord(character)]
          : [current[1], minimalRecord(character)],
    );
  }
  return (
    <CollectionContext.Provider
      value={{
        favorites,
        compare,
        isFavorite,
        inCompare,
        toggleFavorite,
        toggleCompare,
        clearCompare: () => setCompare([]),
        clearFavorites: () => setFavorites([]),
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
}

export function useSavedCollection() {
  const value = useContext(CollectionContext);
  if (!value) throw new Error('CollectionProvider is missing');
  return value;
}
