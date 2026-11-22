import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createWorld,
  tickWorld,
  jump,
  isGrounded,
  GROUND_Y,
  NINJA,
  surfaceAt,
  terrainTopAt,
} from '../src/game/engine.js';

test('a descending ninja lands on a rooftop and can jump again', () => {
  const world = createWorld();
  world.status = 'running';
  world.nextSpawn = 999;
  world.terrain = [{ id: 1, kind: 'roof', x: 100, width: 500, height: 72 }];
  world.ninjaY = GROUND_Y - 72 - NINJA.height - 2;
  world.ninjaVelocity = 150;
  world.grounded = false;
  world.coyoteTime = 0;
  world.jumpsUsed = 2;
  tickWorld(world, 0.02);
  assert.equal(world.ninjaY + NINJA.height, GROUND_Y - 72);
  assert.equal(isGrounded(world), true);
  assert.equal(jump(world), true);
});

test('passing a roof edge makes the runner fall instead of snapping to the floor', () => {
  const world = createWorld();
  world.status = 'running';
  world.nextSpawn = 999;
  world.terrain = [{ id: 1, kind: 'roof', x: 0, width: 172, height: 72 }];
  world.surfaceY = GROUND_Y - 72;
  world.ninjaY = world.surfaceY - NINJA.height;
  tickWorld(world, 0.03);
  assert.equal(isGrounded(world), false);
  assert.ok(world.ninjaY + NINJA.height > GROUND_Y - 72);
  assert.ok(world.ninjaY + NINJA.height < GROUND_Y);
});

test('a grounded runner follows a ridge slope and reaches higher ground', () => {
  const world = createWorld();
  world.status = 'running';
  world.nextSpawn = 999;
  const ridge = { id: 1, kind: 'ridge', x: 171, width: 580, height: 95 };
  world.terrain = [ridge];
  for (let i = 0; i < 20; i++) tickWorld(world, 0.02);
  assert.equal(isGrounded(world), true);
  assert.ok(world.surfaceY < GROUND_Y - 50);
  assert.equal(surfaceAt(world, 171), terrainTopAt(ridge, 171));
});

test('running into a building ends the run; jumping clears its front wall', () => {
  const world = createWorld();
  world.status = 'running';
  world.nextSpawn = 999;
  world.terrain = [{ id: 1, kind: 'roof', x: NINJA.x + NINJA.width - 6, width: 300, height: 72 }];
  assert.equal(tickWorld(world, 0.02).collided, true);
  assert.equal(world.failureReason, 'Missed the rooftop');
  const airborne = createWorld();
  airborne.status = 'running';
  airborne.nextSpawn = 999;
  airborne.terrain = [
    { id: 1, kind: 'roof', x: NINJA.x + NINJA.width - 6, width: 300, height: 72 },
  ];
  airborne.ninjaY = GROUND_Y - 72 - NINJA.height - 5;
  airborne.ninjaVelocity = -100;
  airborne.grounded = false;
  assert.equal(tickWorld(airborne, 0.02).collided, false);
});

test('reset restores terrain, position and the double jump allowance', () => {
  const world = createWorld();
  world.status = 'running';
  jump(world);
  tickWorld(world, 0.02);
  jump(world);
  const fresh = createWorld();
  assert.equal(fresh.jumpsUsed, 0);
  assert.equal(fresh.grounded, true);
  assert.equal(fresh.terrain.length, 3);
  assert.equal(fresh.ninjaY, GROUND_Y - NINJA.height);
});
