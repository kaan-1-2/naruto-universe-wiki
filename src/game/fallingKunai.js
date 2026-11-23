export const ROUND_SECONDS = 45;
export function createFallingGame(status = 'ready') {
  return {
    status,
    score: 0,
    hits: 0,
    elapsed: 0,
    spawnIn: 0,
    nextId: 1,
    objects: [],
    effects: [],
    reason: '',
  };
}
export function fallingDifficulty(hits) {
  const stage = Math.min(10, 1 + Math.floor(hits / 5));
  return {
    stage,
    speed: 20 + (stage - 1) * 3,
    interval: Math.max(0.4, 1.35 - (stage - 1) * 0.105),
    hazardChance: Math.min(0.38, 0.16 + stage * 0.02),
  };
}
export function endFallingGame(state, reason) {
  return state.status === 'running' ? { ...state, status: 'finished', reason } : state;
}
export function strikeFallingObject(state, id) {
  if (state.status !== 'running') return state;
  const object = state.objects.find((item) => item.id === id);
  if (!object) return state;
  if (object.type === 'bomb') return endFallingGame(state, 'bomb');
  const points = object.type === 'target' ? 30 : 20;
  return {
    ...state,
    score: state.score + points,
    hits: state.hits + 1,
    objects: state.objects.filter((item) => item.id !== id),
    effects: [...state.effects, { ...object, points, ttl: 0.55 }],
  };
}
export function advanceFallingGame(state, seconds, random = Math.random) {
  if (state.status !== 'running') return state;
  const delta = Math.max(0, seconds);
  const difficulty = fallingDifficulty(state.hits);
  const elapsed = Math.min(ROUND_SECONDS, state.elapsed + delta);
  const objects = state.objects.map((object) => ({
    ...object,
    y: object.y + delta * object.speed,
    angle: object.angle + delta * object.spin,
  }));
  const next = {
    ...state,
    elapsed,
    objects: objects.filter((object) => object.y < 112),
    effects: state.effects
      .map((effect) => ({ ...effect, ttl: effect.ttl - delta }))
      .filter((effect) => effect.ttl > 0),
    spawnIn: state.spawnIn - delta,
  };
  if (objects.some((object) => object.type !== 'bomb' && object.y >= 112))
    return endFallingGame(next, 'dropped');
  if (elapsed >= ROUND_SECONDS) return endFallingGame(next, 'time');
  while (next.spawnIn <= 0 && next.objects.length < 16) {
    const hazard = next.nextId > 2 && random() < difficulty.hazardChance;
    next.objects.push({
      id: next.nextId++,
      type: hazard ? 'bomb' : random() < 0.5 ? 'log' : 'target',
      x: 15 + random() * 70,
      y: -10,
      angle: random() * 30 - 15,
      speed: difficulty.speed * (0.9 + random() * 0.2),
      spin: (random() - 0.5) * 30,
    });
    next.spawnIn += difficulty.interval;
  }
  return next;
}
