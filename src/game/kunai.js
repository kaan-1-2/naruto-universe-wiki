export const ROUND_SECONDS = 45;
export const MAX_MISSES = 1;

export function createKunaiGame(status = 'ready') {
  return { status, score: 0, hits: 0, misses: 0, elapsed: 0 };
}
export function kunaiDifficulty(hits) {
  const level = Math.min(10, 1 + Math.floor(hits / 5));
  const targetCount = Math.min(4, 1 + Math.floor((level - 1) / 3));
  return {
    level,
    targetCount,
    speed: 0.72 + Math.min(level - 1, 2) * 0.28 + Math.max(0, level - 3) * 0.12,
    scale: targetCount > 2 ? 0.8 : 1,
  };
}
export function targetPosition(elapsed, side, hits) {
  const phase = elapsed * kunaiDifficulty(hits).speed + side * Math.PI;
  return { x: 50 + Math.sin(phase) * 22, y: 50 + Math.sin(phase * 1.37 + side) * 23 };
}
export function hitKunaiTarget(state, radius) {
  if (state.status !== 'running') return state;
  if (!Number.isFinite(radius) || radius > 0.96) return missKunaiTarget(state);
  const points = radius <= 0.24 ? 30 : radius <= 0.55 ? 20 : 10;
  return { ...state, hits: state.hits + 1, score: state.score + points };
}
export function missKunaiTarget(state) {
  if (state.status !== 'running') return state;
  const misses = state.misses + 1;
  return { ...state, misses, status: misses >= MAX_MISSES ? 'finished' : 'running' };
}
export function advanceKunaiGame(state, seconds) {
  if (state.status !== 'running') return state;
  const elapsed = Math.min(ROUND_SECONDS, state.elapsed + Math.max(0, seconds));
  return { ...state, elapsed, status: elapsed >= ROUND_SECONDS ? 'finished' : 'running' };
}
