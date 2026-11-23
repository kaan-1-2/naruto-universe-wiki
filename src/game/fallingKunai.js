export const FALLING_OBJECTS = {
  log: { label: 'log', points: 20 },
  target: { label: 'target board', points: 30 },
  dummy: { label: 'training dummy', points: 35 },
  scroll: { label: 'training scroll', points: 25 },
  bomb: { label: 'paper bomb', hazard: true },
  spikes: { label: 'spiked iron ball', hazard: true },
  poison: { label: 'poison bottle', hazard: true },
};
export const SAFE_OBJECTS = ['log', 'target', 'dummy', 'scroll'];
export const HAZARD_OBJECTS = ['bomb', 'spikes', 'poison'];
export const isHazard = (type) => Boolean(FALLING_OBJECTS[type]?.hazard);
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
  const stage = 1 + Math.floor(hits / 3);
  return {
    stage,
    speed: Math.min(80, 30 + (stage - 1) * 3),
    interval: Math.max(0.28, 0.95 - (stage - 1) * 0.055),
    hazardChance: Math.min(0.4, 0.18 + stage * 0.02),
  };
}
export function endFallingGame(state, reason) {
  return state.status === 'running' ? { ...state, status: 'finished', reason } : state;
}
export function strikeFallingObject(state, id) {
  if (state.status !== 'running') return state;
  const object = state.objects.find((item) => item.id === id);
  if (!object) return state;
  if (isHazard(object.type)) return endFallingGame(state, object.type);
  const points = FALLING_OBJECTS[object.type].points;
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
  const elapsed = state.elapsed + delta;
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
  if (objects.some((object) => !isHazard(object.type) && object.y >= 112))
    return endFallingGame(next, 'dropped');
  while (next.spawnIn <= 0 && next.objects.length < 16) {
    const hazard = next.nextId > 2 && random() < difficulty.hazardChance;
    const types = hazard ? HAZARD_OBJECTS : SAFE_OBJECTS;
    next.objects.push({
      id: next.nextId++,
      type: types[Math.min(types.length - 1, Math.floor(random() * types.length))],
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
