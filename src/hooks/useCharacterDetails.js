import { useEffect, useMemo, useState } from 'react';
import { fetchAdditionalCharacter } from '../services/anilist.js';
import { mergeCharacterDetails } from '../utils/profileData.js';

export default function useCharacterDetails(character) {
  const key = `${character?.id}:${character?.name}`;
  const [state, setState] = useState({ key: '', extra: null, loading: false });

  useEffect(() => {
    const controller = new AbortController();
    setState({ key, extra: null, loading: true });
    fetchAdditionalCharacter(
      { id: character.id, name: character.name },
      { signal: controller.signal },
    )
      .then((extra) => {
        if (!controller.signal.aborted) setState({ key, extra, loading: false });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ key, extra: null, loading: false });
      });
    return () => controller.abort();
  }, [key, character.id, character.name]);

  const extra = state.key === key ? state.extra : null;
  const enriched = useMemo(() => mergeCharacterDetails(character, extra), [character, extra]);
  return { character: enriched, extra, loading: state.key !== key || state.loading };
}

export function useAdditionalCharacters(characters) {
  const key = characters.map((character) => `${character.id}:${character.name}`).join('|');
  const [state, setState] = useState({ key: '', extras: [] });

  useEffect(() => {
    const controller = new AbortController();
    if (!characters.length) return () => controller.abort();
    Promise.all(
      characters.map((character) =>
        fetchAdditionalCharacter(character, { signal: controller.signal }).catch(() => null),
      ),
    ).then((extras) => {
      if (!controller.signal.aborted) setState({ key, extras });
    });
    return () => controller.abort();
    // Identity, rather than changes to the record's presentation, determines the request.
  }, [key]);

  return characters.map((character, index) =>
    mergeCharacterDetails(character, state.key === key ? state.extras[index] : null),
  );
}
