import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import ShinobiLoading from '../components/ShinobiLoading.jsx';
import { PageIntro, ErrorState } from '../components/Status.jsx';
import { Portrait } from '../components/ArchiveCard.jsx';
import { useSavedCollection } from '../context/CollectionContext.jsx';
import { fetchItem } from '../services/api.js';
import { useAdditionalCharacters } from '../hooks/useCharacterDetails.js';
import { recordedText } from '../utils/profileData.js';
import {
  characterAffiliation,
  characterClan,
  firstAppearance,
  asStringArray,
  textValue,
} from '../utils/format.js';

const fields = [
  ['Clan', characterClan],
  ['Affiliation', characterAffiliation],
  ['First appearance', firstAppearance],
  ['Gender', (item) => textValue(item.personal?.sex)],
  ['Birthdate', (item) => textValue(item.personal?.birthdate)],
  ['Age', (item) => recordedText(item.personal?.age)],
  ['Blood type', (item) => recordedText(item.personal?.bloodType)],
  ['Chakra natures', (item) => asStringArray(item.natureType).slice(0, 3).join(', ') || 'Unknown'],
];

export default function ComparePage() {
  const { compare, clearCompare } = useSavedCollection();
  const [state, setState] = useState({ loading: false, items: [], error: '' });
  const items = useAdditionalCharacters(state.items);
  const [retry, setRetry] = useState(0);
  const keys = compare.map((item) => item.id).join(',');
  useEffect(() => {
    if (!keys) {
      setState({ loading: false, items: [], error: '' });
      return;
    }
    const controller = new AbortController();
    setState({ loading: true, items: [], error: '' });
    Promise.all(
      compare.map((item) => fetchItem('characters', item.id, { signal: controller.signal })),
    )
      .then((items) => {
        if (!controller.signal.aborted) setState({ loading: false, items, error: '' });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({ loading: false, items: [], error: error.message });
      });
    return () => controller.abort();
    // IDs (rather than the object reference) form a stable API dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys, retry]);
  return (
    <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-18">
      <PageIntro
        eyebrow="Shinobi analysis"
        title="Character comparison"
        description="Choose up to two characters and discover how their abilities and backgrounds compare."
      />
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#a76b58]/35 bg-[#281b24]/90 p-4">
        <p className="text-sm text-[#f7dbc5]">{compare.length} of 2 shinobi selected</p>
        <div className="flex flex-wrap items-center gap-3">
          {compare.length === 1 && (
            <Link
              to="/characters"
              className="inline-flex items-center gap-2 rounded-lg bg-[#b33b32] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-950/30 transition hover:bg-[#d14f41]"
            >
              <Icon name="users" size={18} /> Add second character <Icon name="arrow" size={17} />
            </Link>
          )}
          {compare.length > 0 && (
            <button
              onClick={clearCompare}
              className="rounded-lg border border-white/20 px-4 py-3 text-sm font-semibold text-[#ffe3d1] hover:border-red-400 hover:text-white"
            >
              Clear selection
            </button>
          )}
        </div>
      </div>
      {compare.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/15 bg-white/4 px-8 py-16 text-center">
          <Icon name="compare" size={45} className="mx-auto text-orange-400" />
          <h2 className="mt-4 text-2xl font-black">Ready to compare?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">
            Choose Compare on two character cards.
          </p>
          <Link
            to="/characters"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-bold text-[#101827]"
          >
            Select characters <Icon name="arrow" size={18} />
          </Link>
        </div>
      ) : state.error ? (
        <ErrorState message={state.error} onRetry={() => setRetry((x) => x + 1)} />
      ) : state.loading ? (
        <ShinobiLoading label="Loading character details…" />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-white/12 bg-[#152034]"
              >
                <Portrait item={item} className="h-64 w-full" />
                <div className="p-5">
                  <p className="text-xs uppercase tracking-widest text-orange-300">
                    Character #{item.id}
                  </p>
                  <Link
                    className="mt-2 block text-2xl font-black hover:text-orange-300"
                    to={`/characters/${item.id}`}
                  >
                    {item.name}
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-7 space-y-3">
            {fields
              .filter(([, fn]) => items.some((item) => recordedText(fn(item))))
              .map(([label, fn]) => (
                <div key={label} className="scroll-panel overflow-hidden rounded-xl">
                  <p className="border-b border-[#ab7254]/30 px-5 py-3 font-display text-lg font-bold uppercase tracking-wide text-[#963f32]">
                    {label}
                  </p>
                  <div className="grid grid-cols-2 gap-4 p-5 text-sm font-semibold leading-7 text-[#412c23]">
                    {items.map((item) => (
                      <p key={item.id} className="break-words">
                        {recordedText(fn(item)) || '—'}
                      </p>
                    ))}
                    {items.length === 1 && (
                      <p className="text-[#987f69]">Choose a second shinobi above</p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
