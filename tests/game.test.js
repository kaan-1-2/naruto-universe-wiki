import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GAME_WIDTH,
  GROUND_Y,
  NINJA,
  STAGES,
  createWorld,
  jump,
  isGrounded,
  collidesWithNinja,
  currentStage,
  gameSnapshot,
  tickWorld,
} from '../src/game/engine.js';

test('new game starts ready with zero score and no obstacles', () => {
  const world = createWorld();
  assert.equal(world.status, 'ready');
  assert.equal(world.score, 0);
  assert.equal(world.obstacles.length, 0);
  assert.deepEqual(gameSnapshot(world), {
    status: 'ready',
    score: 0,
    dodged: 0,
    speed: 310,
    seconds: 0,
    stageIndex: 0,
    stageName: 'Konohagakure',
    stageSubtitle: 'Land of Fire',
    stageAccent: '#fb923c',
    nextStageIn: 16,
  });
});

test('the runner can jump twice, but cannot jump a third time in the air', () => {
  const world = createWorld();
  assert.equal(jump(world), false);
  world.status = 'running';
  assert.equal(jump(world), true);
  tickWorld(world, 0.02);
  assert.equal(isGrounded(world), false);
  assert.equal(jump(world), true);
  assert.equal(jump(world), false);
  for (let i = 0; i < 70; i += 1) tickWorld(world, 0.02, () => 0.5);
  assert.ok(world.ninjaY <= GROUND_Y - NINJA.height);
});

test('spawning uses both obstacle heights and moves hazards left', () => {
  const world = createWorld();
  world.status = 'running';
  world.nextSpawn = 0.01;
  tickWorld(world, 0.02, () => 0);
  assert.equal(world.obstacles.length >= 1, true);
  assert.equal(world.obstacles[0].high, true);
  assert.equal(world.obstacles[0].y, GROUND_Y - 130);
  assert.ok(world.obstacles[0].x <= GAME_WIDTH + 30);
});

test('a low obstacle collides with a ninja on the ground', () => {
  const world = createWorld();
  world.status = 'running';
  world.obstacles = [
    {
      id: 1,
      x: NINJA.x + 21,
      y: GROUND_Y - 20,
      radius: 18,
      high: false,
      spin: 0,
      passed: false,
      variant: 'shuriken',
    },
  ];
  const result = tickWorld(world, 0.01);
  assert.equal(result.collided, true);
  assert.equal(world.status, 'gameover');
});

test('a high shuriken safely passes a grounded ninja but hits an airborne one', () => {
  const grounded = createWorld();
  const high = {
    id: 1,
    x: NINJA.x + 21,
    y: GROUND_Y - 130,
    radius: 18,
    high: true,
    spin: 0,
    passed: false,
    variant: 'shuriken',
  };
  assert.equal(collidesWithNinja(grounded, high), false);
  grounded.ninjaY -= 110;
  assert.equal(collidesWithNinja(grounded, high), true);
});

test('passing an obstacle increases dodged count and score', () => {
  const world = createWorld();
  world.status = 'running';
  world.obstacles = [
    {
      id: 1,
      x: 100,
      y: GROUND_Y - 130,
      radius: 18,
      high: true,
      spin: 0,
      passed: false,
      variant: 'shuriken',
    },
  ];
  const result = tickWorld(world, 0.016);
  assert.equal(result.collided, false);
  assert.equal(result.dodged, 1);
  assert.equal(world.dodged, 1);
  assert.ok(world.score >= 18);
});

test('pausing prevents physics updates; running speed rises and stage changes over time', () => {
  const world = createWorld();
  tickWorld(world, 0.05);
  assert.equal(world.elapsed, 0);
  world.status = 'running';
  world.nextSpawn = 999;
  world.terrain = [{ id: 1, kind: 'ridge', x: 0, width: 1e9, height: 0 }];
  for (let i = 0; i < 400; i += 1) tickWorld(world, 0.05, () => 0.6);
  assert.ok(world.speed > 310);
  assert.notEqual(currentStage(world).name, STAGES[0].name);
  const time = world.elapsed;
  world.status = 'paused';
  tickWorld(world, 0.05);
  assert.equal(world.elapsed, time);
});
