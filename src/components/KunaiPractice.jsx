import { useEffect, useRef, useState } from 'react';
import KunaiTargetArt from './KunaiTargetArt.jsx';
import {
  ROUND_SECONDS,
  createFallingGame,
  fallingDifficulty,
  advanceFallingGame,
  strikeFallingObject,
  endFallingGame,
} from '../game/fallingKunai.js';

function FallingArt({ type, impact = false }) {
  if (type === 'target')
    return <KunaiTargetArt hits={impact ? [{ id: 0, x: 100, y: 100, angle: 8 }] : []} />;
  if (type === 'bomb')
    return (
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <path d="m53 17 3-11 16 2" stroke="#ac9c77" strokeWidth="5" fill="none" />
        <path d="m29 16 50 9-12 66-50-9Z" fill="#9f3029" stroke="#2a1b19" strokeWidth="4" />
        <path d="m35 27 31 6-8 45-31-6Z" fill="#f0d5a7" />
        <text x="46" y="63" fill="#68241e" textAnchor="middle" fontSize="30" fontWeight="bold">
          爆
        </text>
      </svg>
    );
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <path d="M19 31 74 23l12 45-56 9Z" fill="#89603c" stroke="#3b2a1f" strokeWidth="3" />
      <path d="m26 40 49-8m-46 22 51-9m-47 21 50-10" stroke="#b58a58" strokeWidth="3" />
      <ellipse
        cx="25"
        cy="54"
        rx="15"
        ry="23"
        transform="rotate(-15 25 54)"
        fill="#d3ae79"
        stroke="#5d3e27"
        strokeWidth="3"
      />
      <ellipse
        cx="25"
        cy="54"
        rx="8"
        ry="15"
        transform="rotate(-15 25 54)"
        fill="none"
        stroke="#9c7042"
        strokeWidth="2"
      />
      <path d="m68 24 6 12-2 13" fill="none" stroke="#473024" strokeWidth="2" />
    </svg>
  );
}
function readBest() {
  try {
    return Math.max(0, Number(localStorage.getItem('shinobi:falling-kunai-best')) || 0);
  } catch {
    return 0;
  }
}

export default function KunaiPractice() {
  const [game, setGame] = useState(createFallingGame);
  const gameRef = useRef(game);
  const gamePanel = useRef(null);
  const [best, setBest] = useState(readBest);
  function commit(next) {
    gameRef.current = next;
    setGame(next);
  }
  useEffect(() => {
    if (game.status !== 'running') return;
    let frame, last;
    function tick(now) {
      const delta = last === undefined ? 0 : Math.min(0.1, (now - last) / 1000);
      last = now;
      const next = advanceFallingGame(gameRef.current, delta);
      commit(next);
      if (next.status === 'running') frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [game.status]);
  useEffect(() => {
    const pause = () => {
      if (document.hidden && gameRef.current.status === 'running')
        commit({ ...gameRef.current, status: 'paused' });
    };
    document.addEventListener('visibilitychange', pause);
    return () => document.removeEventListener('visibilitychange', pause);
  }, []);
  useEffect(() => {
    if (game.status !== 'finished' || game.score <= best) return;
    setBest(game.score);
    try {
      localStorage.setItem('shinobi:falling-kunai-best', String(game.score));
    } catch {
      /* The current score remains visible. */
    }
  }, [game.status, game.score, best]);
  const active = game.status === 'running';
  const stage = fallingDifficulty(game.hits).stage;
  const endMessage = {
    bomb: 'You hit a paper bomb!',
    dropped: 'A safe object escaped!',
    miss: 'Your kunai missed!',
    time: 'Time is up!',
  }[game.reason];
  function hit(event, id) {
    event.stopPropagation();
    commit(strikeFallingObject(gameRef.current, id));
  }
  return (
    <section
      ref={gamePanel}
      className="kunai-practice kunai-falling-game page-width"
      aria-label="Falling kunai game"
    >
      <div className="falling-topbar">
        <div>
          <span className="screen-eyebrow">Konoha training grounds</span>
          <h2>Catch them on the way down</h2>
          <p>Wood +20 · Target +30 · Red paper bombs: avoid</p>
        </div>
        <div className="kunai-controls">
          {game.status === 'ready' || game.status === 'finished' ? (
            <button
              className="ink-button"
              onClick={() => {
                commit(createFallingGame('running'));
                gamePanel.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
              }}
            >
              {game.status === 'ready' ? 'Start training' : 'Play again'}
            </button>
          ) : (
            <button
              className="paper-button"
              onClick={() => commit({ ...gameRef.current, status: active ? 'paused' : 'running' })}
            >
              {active ? 'Pause' : 'Resume'}
            </button>
          )}
        </div>
      </div>
      <dl className="kunai-hud">
        {[
          ['Score', game.score],
          ['Stage', stage],
          ['Time', Math.ceil(ROUND_SECONDS - game.elapsed) + 's'],
          ['Hits', game.hits],
          ['Best', best],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div
        className="falling-arena"
        role="group"
        aria-label="Falling object arena"
        onPointerDown={() => {
          if (active) commit(endFallingGame(gameRef.current, 'miss'));
        }}
      >
        <div className="falling-backdrop" aria-hidden="true">
          <span>木ノ葉</span>
        </div>
        {game.objects.map((object) => (
          <button
            key={object.id}
            className={'falling-object falling-' + object.type}
            disabled={!active}
            aria-label={object.type === 'bomb' ? 'Avoid paper bomb' : 'Hit falling ' + object.type}
            style={{
              left: object.x + '%',
              top: object.y + '%',
              transform: 'translate(-50%,-50%) rotate(' + object.angle + 'deg)',
            }}
            onPointerDown={(event) => hit(event, object.id)}
            onClick={(event) => {
              if (event.detail === 0) hit(event, object.id);
            }}
          >
            <FallingArt type={object.type} />
            {object.type === 'bomb' && <span className="falling-danger-label">AVOID</span>}
          </button>
        ))}
        {game.effects.map((effect) => (
          <div
            key={effect.id}
            className={'falling-hit-effect falling-hit-' + effect.type}
            style={{ left: effect.x + '%', top: effect.y + '%' }}
            aria-hidden="true"
          >
            <FallingArt type={effect.type} impact />
            <span className="falling-points">+{effect.points}</span>
            {effect.type === 'log' && (
              <svg className="falling-impact-knife" viewBox="-12 -80 24 84">
                <path d="m0 0-9-27L0-40l9 13Z" fill="#8b969c" stroke="#222b30" />
                <path d="M-3-40h6v-22h-6Z" fill="#222b30" />
                <circle cy="-69" r="6" stroke="#839097" strokeWidth="3" fill="none" />
              </svg>
            )}
          </div>
        ))}
        {!active && (
          <div className="falling-game-overlay">
            <h3>
              {game.status === 'ready'
                ? 'Ready your kunai'
                : game.status === 'paused'
                  ? 'Paused'
                  : endMessage}
            </h3>
            <p>
              {game.status === 'ready'
                ? 'Hit falling wood and targets. Leave the bombs alone.'
                : game.status === 'paused'
                  ? 'Resume when you are ready.'
                  : 'Final score: ' + game.score}
            </p>
          </div>
        )}
      </div>
      <p className="falling-round-status" role="status">
        {game.status === 'finished'
          ? endMessage + ' Final score: ' + game.score
          : game.status === 'paused'
            ? 'Training paused.'
            : 'Every five hits raises the stage. One mistake ends the round.'}
      </p>
    </section>
  );
}
