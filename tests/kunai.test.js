import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createKunaiGame,
  kunaiDifficulty,
  targetPosition,
  hitKunaiTarget,
  missKunaiTarget,
  advanceKunaiGame,
} from '../src/game/kunai.js';

test('kunai scoring rewards accuracy and ignores throws outside an active round', () => {
  const ready = createKunaiGame();
  assert.equal(hitKunaiTarget(ready, 0), ready);
  let state = hitKunaiTarget(createKunaiGame('running'), 0.1);
  state = hitKunaiTarget(state, 0.4);
  state = hitKunaiTarget(state, 0.8);
  assert.equal(state.score, 60);
  assert.equal(state.hits, 3);
  assert.equal(hitKunaiTarget(state, 1).misses, 1);
});
test('difficulty grows with hits while target size and speed stay bounded', () => {
  assert.ok(kunaiDifficulty(10).speed > kunaiDifficulty(0).speed);
  assert.ok(kunaiDifficulty(10).scale < kunaiDifficulty(0).scale);
  assert.equal(kunaiDifficulty(1000).level, 10);
  assert.ok(kunaiDifficulty(1000).scale >= 0.52);
  for (let time = 0; time < 45; time += 0.1) {
    for (const side of [0, 1]) {
      const point = targetPosition(time, side, 1000);
      assert.ok(point.x >= 28 && point.x <= 72 && point.y >= 27 && point.y <= 73);
    }
  }
});
test('round ends after five misses or 45 active seconds and pause freezes time', () => {
  let state = createKunaiGame('running');
  for (let i = 0; i < 5; i++) state = missKunaiTarget(state);
  assert.equal(state.status, 'finished');
  assert.equal(hitKunaiTarget(state, 0), state);
  const paused = { ...createKunaiGame(), status: 'paused' };
  assert.equal(advanceKunaiGame(paused, 10), paused);
  assert.equal(advanceKunaiGame(createKunaiGame('running'), 45).status, 'finished');
  assert.deepEqual(createKunaiGame('running'), {
    status: 'running',
    score: 0,
    hits: 0,
    misses: 0,
    elapsed: 0,
  });
});
