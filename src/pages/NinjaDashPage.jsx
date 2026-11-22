import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { STAGES, createWorld } from '../game/engine.js';
import { GAME_HEIGHT, GAME_WIDTH, gameSnapshot, jump, tickWorld } from '../game/engine.js';
import { drawWorld } from '../game/draw.js';

const HIGH_SCORE_KEY = 'shinobi-archive-ninja-dash-best-v2';

function readHighScore() {
  try {
    const parsed = Number(window.localStorage.getItem(HIGH_SCORE_KEY));
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
  } catch {
    return 0;
  }
}

function saveHighScore(score) {
  try {
    window.localStorage.setItem(HIGH_SCORE_KEY, String(score));
  } catch {
    /* Storage may be unavailable in private mode. */
  }
}

const statusMessages = {
  ready: 'Ready to run. Press Space, tap the game, or select Start.',
  running: 'Running. Jump onto rooftops; tap again in the air for a double jump.',
  paused: 'Game paused. Select Resume to continue.',
  gameover: 'Mission over. Restart and try to survive all village stages.',
};

export default function NinjaDashPage() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const worldRef = useRef(null);
  if (!worldRef.current) worldRef.current = createWorld();

  const frameRef = useRef(null);
  const previousFrameRef = useRef(null);
  const lastHudRef = useRef(0);
  const [hud, setHud] = useState(() => gameSnapshot(worldRef.current));
  const [best, setBest] = useState(readHighScore);
  const bestRef = useRef(best);

  const paint = useCallback(() => {
    if (contextRef.current) drawWorld(contextRef.current, worldRef.current);
  }, []);
  const refreshHud = useCallback(() => setHud(gameSnapshot(worldRef.current)), []);
  const stopLoop = useCallback(() => {
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    previousFrameRef.current = null;
  }, []);

  const frame = useCallback(
    function nextFrame(now) {
      const world = worldRef.current;
      if (world.status !== 'running') return;
      const dt = previousFrameRef.current === null ? 0 : (now - previousFrameRef.current) / 1000;
      previousFrameRef.current = now;
      const result = tickWorld(world, dt);
      paint();

      if (result.collided) {
        if (world.score > bestRef.current) {
          bestRef.current = world.score;
          setBest(world.score);
          saveHighScore(world.score);
        }
        refreshHud();
        frameRef.current = null;
        return;
      }

      if (now - lastHudRef.current >= 100 || result.stageChanged) {
        refreshHud();
        lastHudRef.current = now;
      }
      frameRef.current = window.requestAnimationFrame(nextFrame);
    },
    [paint, refreshHud],
  );

  const startLoop = useCallback(() => {
    stopLoop();
    lastHudRef.current = 0;
    frameRef.current = window.requestAnimationFrame(frame);
  }, [frame, stopLoop]);

  const startGame = useCallback(() => {
    if (worldRef.current.status === 'running') return;
    if (worldRef.current.status === 'gameover') worldRef.current = createWorld();
    worldRef.current.status = 'running';
    refreshHud();
    paint();
    startLoop();
  }, [paint, refreshHud, startLoop]);

  const pauseGame = useCallback(() => {
    if (worldRef.current.status !== 'running') return;
    worldRef.current.status = 'paused';
    stopLoop();
    refreshHud();
    paint();
  }, [paint, refreshHud, stopLoop]);

  const resetGame = useCallback(() => {
    stopLoop();
    worldRef.current = createWorld();
    refreshHud();
    paint();
  }, [paint, refreshHud, stopLoop]);

  const attemptJump = useCallback(() => {
    if (worldRef.current.status === 'paused') return;
    if (worldRef.current.status !== 'running') {
      startGame();
    }
    jump(worldRef.current);
    paint();
  }, [paint, startGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return undefined;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(GAME_WIDTH * ratio);
    canvas.height = Math.round(GAME_HEIGHT * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    contextRef.current = ctx;
    paint();
    return () => {
      stopLoop();
      contextRef.current = null;
    };
  }, [paint, stopLoop]);

  useEffect(() => {
    function keydown(event) {
      if (
        event.target instanceof HTMLElement &&
        event.target.closest('input, textarea, select, button, a, [contenteditable="true"]')
      )
        return;
      if (['Space', 'ArrowUp', 'KeyW'].includes(event.code)) {
        event.preventDefault();
        if (!event.repeat) attemptJump();
      } else if (event.code === 'KeyP') {
        event.preventDefault();
        if (worldRef.current.status === 'running') pauseGame();
        else if (worldRef.current.status === 'paused') startGame();
      } else if (event.code === 'KeyR') {
        event.preventDefault();
        resetGame();
      }
    }
    const hidden = () => {
      if (document.hidden) pauseGame();
    };
    window.addEventListener('keydown', keydown);
    window.addEventListener('blur', pauseGame);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('blur', pauseGame);
      document.removeEventListener('visibilitychange', hidden);
    };
  }, [attemptJump, pauseGame, resetGame, startGame]);

  const overlay = hud.status !== 'running';
  const overlayLabel =
    hud.status === 'gameover'
      ? 'Mission failed'
      : hud.status === 'paused'
        ? 'Take a breather'
        : 'The Five Nations Trial';
  const overlayDescription =
    hud.status === 'gameover'
      ? `${worldRef.current.failureReason || 'Mission ended'}. You avoided ${hud.dodged} hazards and earned ${hud.score} points.`
      : hud.status === 'paused'
        ? 'Your progress is safe while the route is paused.'
        : 'Leap between rooftops and cross mountain ridges through Konoha, Suna, Kiri and Kumo. Press Space or tap twice for a double jump.';

  const stageProgress = Math.max(0, Math.min(100, ((hud.stageIndex + 1) / STAGES.length) * 100));

  return (
    <div className="game-page min-h-[75vh]">
      <section className="border-b border-[#e7a076]/25 bg-gradient-to-br from-[#2d1621] via-[#190e1b] to-[#241c27]">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
          <div className="mb-3 flex flex-wrap items-center gap-2 font-display text-sm font-bold uppercase tracking-[.22em] text-orange-300">
            <Icon name="spark" size={16} /> Shinobi Challenge · The Five Nations
          </div>
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="font-display text-5xl font-bold tracking-tight text-white sm:text-6xl">
                Shinobi <span className="text-orange-400">Dash</span>
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Run across village rooftops, climb rocky ridges and dodge shuriken. Jump onto raised
                platforms and use a second jump in the air to reach the next roof.
              </p>
            </div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-orange-300 hover:text-orange-200"
              to="/characters"
            >
              <Icon name="arrowLeft" size={17} /> Explore the wiki
            </Link>
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12"
        aria-label="Shinobi Dash game"
      >
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: 'SCORE', value: hud.score },
            { label: 'BEST', value: best },
            { label: 'DODGED', value: hud.dodged },
            { label: 'PACE', value: `${Math.round(hud.speed / 3)}%` },
            { label: 'STAGE', value: hud.stageIndex + 1 },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-[#172236] px-4 py-3 sm:px-5"
            >
              <p className="text-[11px] font-bold tracking-[.2em] text-slate-400">{label}</p>
              <p className="mt-1 text-2xl font-black tabular-nums text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="mb-4 rounded-2xl border border-white/10 bg-[#121b2d] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.22em] text-slate-400">
                Current route
              </p>
              <h2 className="mt-1 text-xl font-black text-white">
                {hud.stageName}{' '}
                <span className="text-sm font-semibold text-slate-400">· {hud.stageSubtitle}</span>
              </h2>
            </div>
            <div className="text-sm text-slate-300">
              {hud.nextStageIn > 0 ? `Next village in ~${hud.nextStageIn}s` : 'Final stage active'}
            </div>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/7">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${stageProgress}%`, background: hud.stageAccent }}
            />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-orange-400/25 bg-[#0d182b] shadow-[0_30px_85px_rgba(0,0,0,.38)]">
          <canvas
            ref={canvasRef}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            tabIndex={0}
            role="button"
            aria-label="Ninja game. Press Space or tap to jump; press again in the air to double jump. Land on rooftops and cross ridges. P pauses and R resets."
            onPointerDown={attemptJump}
            className="block aspect-[16/7] w-full cursor-pointer touch-manipulation object-fill focus-visible:outline-3 focus-visible:outline-orange-400"
          >
            Your browser does not support the Canvas game. Use a modern browser.
          </canvas>

          {overlay && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#050b18]/72 px-4 backdrop-blur-[2px]">
              <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-orange-300/25 bg-[#101b2d]/96 px-5 py-5 text-center shadow-2xl sm:px-8 sm:py-8">
                <p className="text-xs font-bold uppercase tracking-[.24em] text-orange-400">
                  {hud.status === 'gameover'
                    ? 'End of run'
                    : hud.status === 'paused'
                      ? 'Paused'
                      : 'Mission 01'}
                </p>
                <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">{overlayLabel}</h2>
                <p className="mx-auto mt-3 max-w-sm text-xs leading-6 text-slate-300 sm:text-sm">
                  {overlayDescription}
                </p>
                <button
                  onClick={startGame}
                  type="button"
                  className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-7 py-2.5 text-sm font-black text-[#111827] transition hover:bg-orange-400 focus-visible:outline-2 focus-visible:outline-white"
                >
                  <Icon name={hud.status === 'gameover' ? 'refresh' : 'arrow'} size={17} />
                  {hud.status === 'gameover'
                    ? 'Play again'
                    : hud.status === 'paused'
                      ? 'Resume game'
                      : 'Start mission'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={attemptJump}
            disabled={hud.status === 'paused'}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-black text-[#0a101c] transition hover:bg-orange-400 disabled:opacity-50 sm:flex-none"
          >
            <Icon name="arrow" size={18} className="-rotate-90" /> Jump{' '}
            <span className="hidden text-xs font-medium sm:inline">
              (Space / ↑ · twice for double jump)
            </span>
          </button>
          <button
            type="button"
            onClick={hud.status === 'running' ? pauseGame : startGame}
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 bg-white/7 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
          >
            {hud.status === 'running'
              ? 'Pause (P)'
              : hud.status === 'paused'
                ? 'Resume (P)'
                : 'Start'}
          </button>
          <button
            type="button"
            onClick={resetGame}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
          >
            <Icon name="refresh" size={16} /> Reset (R)
          </button>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-400" aria-live="polite">
          {statusMessages[hud.status]}
        </p>

        <div className="mt-9 grid gap-4 md:grid-cols-4">
          {STAGES.map((stage, index) => (
            <div key={stage.key} className="rounded-2xl border border-white/10 bg-[#141f31] p-5">
              <p
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: stage.accent }}
              >
                {String(index + 1).padStart(2, '0')} · {stage.subtitle}
              </p>
              <h3 className="mt-2 font-bold text-white">{stage.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {index === 0
                  ? 'Balanced introduction.'
                  : index === 1
                    ? 'Faster desert route and denser spacing.'
                    : index === 2
                      ? 'Misty water path with quicker pressure.'
                      : 'Fastest route with the highest hazard density.'}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs leading-5 text-slate-500">
          Controls: Space / ↑ / W or tap to jump. Jump again in the air for a double jump. P pauses;
          R resets. Rooftops and rocky ridges are playable surfaces.
        </p>
      </section>
    </div>
  );
}
