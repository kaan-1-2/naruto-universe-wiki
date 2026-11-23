import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import KunaiTargetArt from './KunaiTargetArt.jsx';

function Target({ side }) {
  const [hits, setHits] = useState([]);
  const [throws, setThrows] = useState(0);
  const board = useRef(null);
  useEffect(() => {
    if (!throws || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const shake = board.current?.animate(
      [
        { transform: 'translate(0,0) rotate(0deg)' },
        { transform: 'translate(3px,3px) rotate(1.5deg)' },
        { transform: 'translate(-2px,-1px) rotate(-1deg)' },
        { transform: 'translate(1px,0) rotate(.5deg)' },
        { transform: 'translate(0,0) rotate(0deg)' },
      ],
      { duration: 220, delay: 200, easing: 'ease-out' },
    );
    return () => shake?.cancel();
  }, [throws]);
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
        ref={board}
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
