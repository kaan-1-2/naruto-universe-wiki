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
test('stages speed up a single target before adding more targets', () => {
  assert.equal(kunaiDifficulty(0).targetCount, 1);
  assert.equal(kunaiDifficulty(5).targetCount, 1);
  assert.equal(kunaiDifficulty(10).targetCount, 1);
  assert.equal(kunaiDifficulty(15).targetCount, 2);
  assert.equal(kunaiDifficulty(30).targetCount, 3);
  assert.equal(kunaiDifficulty(45).targetCount, 4);
  assert.ok(kunaiDifficulty(10).speed > kunaiDifficulty(0).speed);
  assert.equal(kunaiDifficulty(1000).level, 10);
  assert.ok(kunaiDifficulty(1000).scale >= 0.52);
  for (let time = 0; time < 45; time += 0.1) {
    for (const side of [0, 1]) {
      const point = targetPosition(time, side, 1000);
      assert.ok(point.x >= 28 && point.x <= 72 && point.y >= 27 && point.y <= 73);
    }
  }
});
test('first miss ends the round immediately; time limit and pause remain effective', () => {
  let state = createKunaiGame('running');
  state = missKunaiTarget(state);
  assert.equal(state.misses, 1);
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
