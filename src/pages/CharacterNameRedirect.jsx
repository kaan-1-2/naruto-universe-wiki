import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchCollection } from '../services/api.js';
import { findCharacterByName, normalizeCharacterName } from '../utils/characterDirectory.js';

// Family names don't include stable IDs in the public archive. Resolve the
// clicked name on demand and navigate to its canonical character profile.
export default function CharacterNameRedirect() {
  const { name = '' } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState('loading');
  const [message, setMessage] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    setState('loading');
    const local = findCharacterByName(name);
    if (local) {
      navigate(`/characters/${local.id}`, { replace: true });
      return () => controller.abort();
    }
    fetchCollection('characters', { name, page: 1, limit: 30, signal: controller.signal })
      .then(({ items }) => {
        if (controller.signal.aborted) return;
        const exact = items.find(
          (entry) => normalizeCharacterName(entry.name) === normalizeCharacterName(name),
        );
        const chosen = exact || (items.length === 1 ? items[0] : null);
        if (chosen?.id) navigate(`/characters/${chosen.id}`, { replace: true });
        else {
          setState('missing');
          setMessage(`We couldn't find a profile for ${name}.`);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setState('missing');
          setMessage('This character could not be found right now.');
        }
      });
    return () => controller.abort();
  }, [name, navigate]);

  return (
    <section className="character-resolution mx-auto max-w-xl px-5 py-20 text-center">
      <h1 className="font-display text-4xl font-bold">
        {state === 'loading' ? `Finding ${name}...` : 'Character not found'}
      </h1>
      <p className="mt-4" role="status">
        {state === 'loading' ? 'Opening the related shinobi profile.' : message}
      </p>
      <Link to={`/characters?search=${encodeURIComponent(name)}`} className="ink-button mt-6">
        Search characters
      </Link>
    </section>
  );
}
