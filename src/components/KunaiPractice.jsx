import { useEffect, useRef, useState } from 'react';
import KunaiTargetArt from './KunaiTargetArt.jsx';
import {
  ROUND_SECONDS,
  MAX_MISSES,
  createKunaiGame,
  kunaiDifficulty,
  targetPosition,
  hitKunaiTarget,
  missKunaiTarget,
  advanceKunaiGame,
} from '../game/kunai.js';

function Target({ side, hits, onStrike, active, scale, buttonRef }) {
  return (
    <button
      ref={buttonRef}
      className="kunai-target"
      disabled={!active}
      style={{ width: 'calc(var(--target-size) * ' + scale + ')' }}
      aria-label={'Throw a kunai at the ' + (side === 0 ? 'left' : 'right') + ' target'}
      onClick={(event) => onStrike(event, side)}
    >
      <KunaiTargetArt hits={hits} />
    </button>
  );
}

function readBest() {
  try {
    const value = Number(localStorage.getItem('shinobi:kunai-best'));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

export default function KunaiPractice() {
  const [game, setGame] = useState(createKunaiGame);
  const gameRef = useRef(game);
  const targets = useRef([]);
  const shotId = useRef(0);
  const motionClock = useRef(0);
  const [shots, setShots] = useState([]);
  const [best, setBest] = useState(readBest);
  const [message, setMessage] = useState('Hit the moving targets. The centre earns more points.');
  const [reducedMotion, setReducedMotion] = useState(false);
  function commit(next) {
    gameRef.current = next;
    setGame(next);
  }
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden && gameRef.current.status === 'running')
        commit({ ...gameRef.current, status: 'paused' });
    };
    document.addEventListener('visibilitychange', pauseWhenHidden);
    return () => document.removeEventListener('visibilitychange', pauseWhenHidden);
  }, []);
  useEffect(() => {
    if (game.status !== 'running') return;
    let frame;
    let previous;
    function tick(now) {
      const delta = previous === undefined ? 0 : Math.min((now - previous) / 1000, 0.1);
      previous = now;
      const old = gameRef.current;
      const next = advanceKunaiGame(old, delta);
      const speed = kunaiDifficulty(next.hits).speed;
      motionClock.current += delta * speed;
      gameRef.current = next;
      if (
        Math.ceil(ROUND_SECONDS - old.elapsed) !== Math.ceil(ROUND_SECONDS - next.elapsed) ||
        old.status !== next.status
      )
        setGame(next);
      targets.current.forEach((target, side) => {
        if (!target) return;
        const point = targetPosition(
          reducedMotion ? next.hits * 0.8 : motionClock.current / speed,
          side,
          next.hits,
        );
        target.style.left = point.x + '%';
        target.style.top = point.y + '%';
      });
      if (next.status === 'running') frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [game.status, reducedMotion]);
  useEffect(() => {
    if (game.status !== 'finished' || game.score <= best) return;
    setBest(game.score);
    try {
      localStorage.setItem('shinobi:kunai-best', String(game.score));
    } catch {
      /* Scores remain available for this session. */
    }
  }, [game.status, game.score, best]);

  function start() {
    setShots([]);
    shotId.current = 0;
    motionClock.current = 0;
    setMessage('Aim for the centre. Every five hits raises the difficulty.');
    commit(createKunaiGame('running'));
  }
  function strike(event, side) {
    event.stopPropagation();
    if (gameRef.current.status !== 'running') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const keyboard = event.detail === 0;
    const x = keyboard ? 100 : ((event.clientX - rect.left) / rect.width) * 200;
    const y = keyboard ? 100 : ((event.clientY - rect.top) / rect.height) * 200;
    const radius = Math.hypot(x - 100, y - 100) / 100;
    const old = gameRef.current;
    const next = hitKunaiTarget(old, radius);
    commit(next);
    if (next.hits > old.hits) {
      const id = shotId.current++;
      setShots((current) => [...current.slice(-9), { id, side, x, y, angle: ((id % 5) - 2) * 12 }]);
      setMessage((radius <= 0.24 ? 'Bullseye! +' : 'Hit! +') + (next.score - old.score));
    } else setMessage('Miss! Keep your eye on the target.');
  }
  const difficulty = kunaiDifficulty(game.hits);
  const running = game.status === 'running';
  return (
    <section
      className="kunai-practice kunai-game page-width"
      aria-labelledby="kunai-practice-title"
    >
      <div className="kunai-intro">
        <span className="screen-eyebrow">Konoha training grounds</span>
        <h2 id="kunai-practice-title">Training round</h2>
        <p>Hit moving targets. Every five hits makes them faster and smaller.</p>
        <span className="kunai-hint">
          45 seconds · 5 misses allowed · Centre 30 / Inner ring 20 / Outer ring 10
        </span>
        <div className="kunai-controls">
          {(game.status === 'ready' || game.status === 'finished') && (
            <button className="ink-button" onClick={start}>
              {game.status === 'ready' ? 'Start training' : 'Play again'}
            </button>
          )}
          {(running || game.status === 'paused') && (
            <button
              className="paper-button"
              onClick={() => commit({ ...gameRef.current, status: running ? 'paused' : 'running' })}
            >
              {running ? 'Pause' : 'Resume'}
            </button>
          )}
        </div>
        <p className="kunai-feedback" aria-live="polite">
          {game.status === 'finished'
            ? (game.misses >= MAX_MISSES ? 'Five misses. ' : 'Time is up! ') +
              'Final score: ' +
              game.score
            : game.status === 'paused'
              ? 'Training paused.'
              : message}
        </p>
      </div>
      <div className="kunai-game-area">
        <dl className="kunai-hud">
          {[
            ['Score', game.score],
            ['Level', difficulty.level],
            ['Time', Math.ceil(ROUND_SECONDS - game.elapsed) + 's'],
            ['Misses', game.misses + '/' + MAX_MISSES],
            ['Best', best],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <div
          className="kunai-arena"
          role="group"
          aria-label="Kunai training arena"
          onClick={() => {
            if (gameRef.current.status !== 'running') return;
            commit(missKunaiTarget(gameRef.current));
            setMessage('Miss! Aim at a target.');
          }}
        >
          {[0, 1].map((side) => (
            <div className={'kunai-moving-lane kunai-moving-lane-' + side} key={side}>
              <Target
                side={side}
                hits={shots.filter((shot) => shot.side === side)}
                active={running}
                scale={difficulty.scale}
                onStrike={strike}
                buttonRef={(element) => {
                  targets.current[side] = element;
                }}
              />
            </div>
          ))}
          {!running && (
            <div className="kunai-arena-caption">
              {game.status === 'ready'
                ? 'Ready your kunai'
                : game.status === 'paused'
                  ? 'Paused'
                  : 'Training complete'}
            </div>
          )}
        </div>
        <p className="kunai-accuracy">
          {game.hits} hits ·{' '}
          {game.hits + game.misses ? Math.round((game.hits / (game.hits + game.misses)) * 100) : 0}%
          accuracy{reducedMotion ? ' · Reduced motion' : ''}
        </p>
      </div>
    </section>
  );
}
