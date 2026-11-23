import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createFallingGame,
  fallingDifficulty,
  advanceFallingGame,
  strikeFallingObject,
  endFallingGame,
  FALLING_OBJECTS,
  SAFE_OBJECTS,
  HAZARD_OBJECTS,
} from '../src/game/fallingKunai.js';

test('first falling object is safe; stages raise speed and spawn frequency', () => {
  const state = advanceFallingGame(createFallingGame('running'), 0, () => 0.1);
  assert.equal(state.objects.length, 1);
  assert.notEqual(state.objects[0].type, 'bomb');
  assert.ok(fallingDifficulty(15).speed > fallingDifficulty(0).speed);
  assert.ok(fallingDifficulty(15).interval < fallingDifficulty(0).interval);
  assert.equal(fallingDifficulty(3).stage, 2);
  assert.ok(fallingDifficulty(999).stage > 10);
  assert.equal(fallingDifficulty(0).speed, 30);
  assert.equal(fallingDifficulty(0).interval, 0.95);
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
test('pause freezes simulation, survival continues past the former time limit, and effects expire', () => {
  const paused = createFallingGame('paused');
  assert.equal(advanceFallingGame(paused, 10), paused);
  const endless = advanceFallingGame(
    { ...createFallingGame('running'), elapsed: 44, spawnIn: 1000 },
    100,
  );
  assert.equal(endless.status, 'running');
  assert.equal(endless.elapsed, 144);
  const state = advanceFallingGame(
    { ...createFallingGame('running'), spawnIn: 2, effects: [{ ttl: 0.1 }] },
    0.2,
  );
  assert.equal(state.effects.length, 0);
});

test('all four safe objects score correctly and all three hazards end the run only when hit', () => {
  for (const type of SAFE_OBJECTS) {
    const game = { ...createFallingGame('running'), objects: [{ id: 1, type }] };
    assert.equal(strikeFallingObject(game, 1).score, FALLING_OBJECTS[type].points);
  }
  for (const type of HAZARD_OBJECTS) {
    const game = {
      ...createFallingGame('running'),
      spawnIn: 100,
      objects: [{ id: 1, type, y: 111, speed: 30, angle: 0, spin: 0 }],
    };
    assert.equal(strikeFallingObject(game, 1).status, 'finished');
    assert.equal(advanceFallingGame(game, 1).status, 'running');
  }
});

test('spawner can generate every safe and dangerous object type', () => {
  for (const types of [SAFE_OBJECTS, HAZARD_OBJECTS]) {
    types.forEach((type, index) => {
      const sequence = [
        types === SAFE_OBJECTS ? 0.99 : 0,
        (index + 0.1) / types.length,
        0.5,
        0.5,
        0.5,
        0.5,
      ];
      const game = advanceFallingGame(
        { ...createFallingGame('running'), nextId: 3 },
        0,
        () => sequence.shift() ?? 0.5,
      );
      assert.equal(game.objects[0].type, type);
    });
  }
});
