import { useState } from 'react';
import { Link } from 'react-router-dom';
import KunaiTargetArt from './KunaiTargetArt.jsx';

function Target({ side }) {
  const [hits, setHits] = useState([]);
  const [throws, setThrows] = useState(0);
  function strike(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const keyboard = event.detail === 0;
    const x = keyboard
      ? 100
      : Math.max(16, Math.min(184, ((event.clientX - rect.left) / rect.width) * 200));
    const y = keyboard
      ? 100
      : Math.max(16, Math.min(184, ((event.clientY - rect.top) / rect.height) * 200));
    setHits((previous) => [
      ...previous.slice(-7),
      { x, y, id: throws, angle: ((throws % 5) - 2) * 12 },
    ]);
    setThrows((value) => value + 1);
  }
  return (
    <div className="kunai-lane">
      <button
        className="kunai-target"
        aria-label={`Throw a kunai at the ${side} target`}
        onClick={strike}
      >
        <KunaiTargetArt hits={hits} />
      </button>
      {throws > 0 && (
        <button
          className="kunai-reset"
          onClick={() => {
            setHits([]);
            setThrows(0);
          }}
        >
          Clear target
        </button>
      )}
    </div>
  );
}

export default function KunaiHomeTargets() {
  return (
    <section className="kunai-practice page-width" aria-labelledby="kunai-practice-title">
      <div className="kunai-intro">
        <span className="screen-eyebrow">Konoha training grounds</span>
        <h2 id="kunai-practice-title">Sharpen your aim</h2>
        <p>Choose your mark. Tap either target to land a kunai.</p>
        <Link className="ink-button kunai-play-link" to="/kunai-challenge">
          Play Kunai Challenge →
        </Link>
      </div>
      <div className="kunai-targets">
        <Target side="left" />
        <Target side="right" />
      </div>
    </section>
  );
}
