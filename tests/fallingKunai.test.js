import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createFallingGame,
  fallingDifficulty,
  advanceFallingGame,
  strikeFallingObject,
  endFallingGame,
} from '../src/game/fallingKunai.js';

test('first falling object is safe; stages raise speed and spawn frequency', () => {
  const state = advanceFallingGame(createFallingGame('running'), 0, () => 0.1);
  assert.equal(state.objects.length, 1);
  assert.notEqual(state.objects[0].type, 'bomb');
  assert.ok(fallingDifficulty(15).speed > fallingDifficulty(0).speed);
  assert.ok(fallingDifficulty(15).interval < fallingDifficulty(0).interval);
  assert.equal(fallingDifficulty(999).stage, 10);
});
test('safe hits award points once, create an impact and remove the falling object', () => {
  const state = {
    ...createFallingGame('running'),
    objects: [
      { id: 1, type: 'log', x: 30, y: 20 },
      { id: 2, type: 'target', x: 65, y: 35 },
    ],
  };
  const hit = strikeFallingObject(state, 1);
  assert.equal(hit.score, 20);
  assert.equal(hit.effects[0].type, 'log');
  assert.equal(hit.objects.length, 1);
  assert.equal(strikeFallingObject(hit, 1), hit);
  assert.equal(strikeFallingObject(hit, 2).score, 50);
  assert.equal(state.objects.length, 2);
});
test('a bomb, dropped safe object or empty throw ends the round; falling bombs can be ignored', () => {
  const base = createFallingGame('running');
  assert.equal(
    strikeFallingObject({ ...base, objects: [{ id: 1, type: 'bomb' }] }, 1).reason,
    'bomb',
  );
  const object = { id: 1, type: 'target', x: 30, y: 111, speed: 20, spin: 0, angle: 0 };
  assert.equal(advanceFallingGame({ ...base, objects: [object] }, 0.1).reason, 'dropped');
  assert.equal(
    advanceFallingGame({ ...base, objects: [{ ...object, type: 'bomb' }], spawnIn: 2 }, 0.1).status,
    'running',
  );
  assert.equal(endFallingGame(base, 'miss').status, 'finished');
});
test('pause freezes simulation, time ends a round, and hit effects expire', () => {
  const paused = createFallingGame('paused');
  assert.equal(advanceFallingGame(paused, 10), paused);
  assert.equal(
    advanceFallingGame({ ...createFallingGame('running'), elapsed: 44 }, 1).reason,
    'time',
  );
  const state = advanceFallingGame(
    { ...createFallingGame('running'), spawnIn: 2, effects: [{ ttl: 0.1 }] },
    0.2,
  );
  assert.equal(state.effects.length, 0);
});
