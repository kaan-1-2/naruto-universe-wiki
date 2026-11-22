// Pure gameplay rules: no React or browser API required.
// Units are logical canvas pixels; time is measured in seconds.
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 420;
export const GROUND_Y = 339;
export const NINJA = Object.freeze({ x: 148, width: 46, height: 64 });
export const GRAVITY = 2140;
export const JUMP_VELOCITY = -735;
const START_SPEED = 310;
const MAX_SPEED = 610;

export const STAGES = Object.freeze([
  {
    key: 'konoha',
    name: 'Konohagakure',
    subtitle: 'Land of Fire',
    accent: '#fb923c',
    startAt: 0,
    spawnBias: 0.0,
    speedBoost: 0,
  },
  {
    key: 'suna',
    name: 'Sunagakure',
    subtitle: 'Land of Wind',
    accent: '#fbbf24',
    startAt: 16,
    spawnBias: 0.06,
    speedBoost: 35,
  },
  {
    key: 'kiri',
    name: 'Kirigakure',
    subtitle: 'Land of Water',
    accent: '#67e8f9',
    startAt: 34,
    spawnBias: 0.1,
    speedBoost: 60,
  },
  {
    key: 'kumo',
    name: 'Kumogakure',
    subtitle: 'Land of Lightning',
    accent: '#a78bfa',
    startAt: 54,
    spawnBias: 0.16,
    speedBoost: 85,
  },
]);

export function stageIndexForElapsed(elapsed) {
  for (let i = STAGES.length - 1; i >= 0; i -= 1) {
    if (elapsed >= STAGES[i].startAt) return i;
  }
  return 0;
}

export function currentStage(world) {
  return STAGES[world.stageIndex] || STAGES[0];
}

export function createWorld() {
  return {
    status: 'ready',
    elapsed: 0,
    score: 0,
    dodged: 0,
    speed: START_SPEED,
    distance: 0,
    ninjaY: GROUND_Y - NINJA.height,
    ninjaVelocity: 0,
    obstacles: [],
    terrain: [
      { id: 1, kind: 'roof', x: 690, width: 290, height: 72 },
      { id: 2, kind: 'roof', x: 1080, width: 250, height: 108 },
      { id: 3, kind: 'ridge', x: 1550, width: 590, height: 95 },
    ],
    terrainId: 3,
    grounded: true,
    surfaceY: GROUND_Y,
    jumpsUsed: 0,
    jumpBuffer: 0,
    coyoteTime: 0.1,
    failureReason: '',
    nextSpawn: 1.1,
    spawnId: 0,
    stageIndex: 0,
    announcedStage: 0,
    stageBanner: 1.4,
  };
}

export function terrainTopAt(platform, x) {
  if (x < platform.x || x > platform.x + platform.width) return GROUND_Y;
  if (platform.kind === 'ridge') {
    const t = (x - platform.x) / platform.width;
    const elevation = Math.min(1, t / 0.28, (1 - t) / 0.28);
    return GROUND_Y - Math.max(0, elevation) * platform.height;
  }
  return GROUND_Y - platform.height;
}

export function surfaceAt(world, x) {
  return Math.min(GROUND_Y, ...(world.terrain || []).map((platform) => terrainTopAt(platform, x)));
}

export function isGrounded(world) {
  return world.grounded && Math.abs(world.ninjaY + NINJA.height - (world.surfaceY ?? GROUND_Y)) < 1;
}

export function jump(world) {
  if (world.status !== 'running') return false;
  if (!isGrounded(world) && world.coyoteTime <= 0 && world.jumpsUsed >= 2) {
    world.jumpBuffer = 0.12;
    return false;
  }
  const firstJump = isGrounded(world) || world.coyoteTime > 0;
  world.ninjaVelocity = firstJump ? JUMP_VELOCITY : JUMP_VELOCITY * 0.88;
  world.jumpsUsed = firstJump ? 1 : 2;
  world.grounded = false;
  world.coyoteTime = 0;
  world.jumpBuffer = 0;
  return true;
}

function updateTerrain(world, movement) {
  for (const platform of world.terrain) platform.x -= movement;
  world.terrain = world.terrain.filter((platform) => platform.x + platform.width > -100);
  let end = Math.max(GAME_WIDTH, ...world.terrain.map((platform) => platform.x + platform.width));
  while (end < GAME_WIDTH + 1400) {
    const id = ++world.terrainId;
    const kind = id % 3 === 0 ? 'ridge' : 'roof';
    const platform = {
      id,
      kind,
      x: end + (kind === 'ridge' ? 210 : 110),
      width: kind === 'ridge' ? 580 : 250 + (id % 3) * 45,
      height: kind === 'ridge' ? 85 + (id % 2) * 20 : 68 + (id % 3) * 21,
    };
    world.terrain.push(platform);
    end = platform.x + platform.width;
  }
}

function moveNinja(world, dt, movement) {
  const feetX = NINJA.x + NINJA.width / 2;
  const previousFeet = world.ninjaY + NINJA.height;
  const supported = isGrounded(world);
  const oldSurface = world.surfaceY;
  updateTerrain(world, movement);
  const surface = surfaceAt(world, feetX);
  world.jumpBuffer = Math.max(0, world.jumpBuffer - dt);
  world.coyoteTime = supported ? 0.1 : Math.max(0, world.coyoteTime - dt);
  // Smooth slopes carry a grounded runner; a roof edge still requires a jump.
  if (supported && Math.abs(surface - oldSurface) <= Math.max(5, movement * 1.1)) {
    world.surfaceY = surface;
    world.ninjaY = surface - NINJA.height;
    world.ninjaVelocity = 0;
    world.grounded = true;
    world.jumpsUsed = 0;
    if (world.jumpBuffer > 0) jump(world);
    return;
  }
  world.grounded = false;
  world.ninjaVelocity += GRAVITY * dt;
  world.ninjaY += world.ninjaVelocity * dt;
  const feet = world.ninjaY + NINJA.height;
  if (world.ninjaVelocity >= 0) {
    const crossed = [
      GROUND_Y,
      ...world.terrain
        .filter((platform) => feetX >= platform.x && feetX <= platform.x + platform.width)
        .map((platform) => terrainTopAt(platform, feetX)),
    ]
      .filter((y) => previousFeet <= y + Math.max(2, movement * 0.7) && feet >= y)
      .sort((x, y) => x - y);
    if (crossed.length) {
      world.surfaceY = crossed[0];
      world.ninjaY = crossed[0] - NINJA.height;
      world.ninjaVelocity = 0;
      world.grounded = true;
      world.jumpsUsed = 0;
      if (world.jumpBuffer > 0) jump(world);
    }
  }
}

// Find whether a circular obstacle intersects the ninja's rectangular body.
export function collidesWithNinja(world, obstacle) {
  const nearestX = Math.max(NINJA.x + 8, Math.min(obstacle.x, NINJA.x + NINJA.width - 7));
  const nearestY = Math.max(
    world.ninjaY + 5,
    Math.min(obstacle.y, world.ninjaY + NINJA.height - 3),
  );
  const dx = obstacle.x - nearestX;
  const dy = obstacle.y - nearestY;
  return dx * dx + dy * dy <= obstacle.radius * obstacle.radius;
}

function spawnObstacle(world, random) {
  const stage = currentStage(world);
  const pick = random();
  const isHigh = pick < 0.22 + stage.spawnBias;
  const variantPool =
    stage.key === 'konoha'
      ? ['shuriken']
      : stage.key === 'suna'
        ? ['shuriken', 'kunai']
        : stage.key === 'kiri'
          ? ['shuriken', 'senbon']
          : ['shuriken', 'kunai', 'senbon'];
  const variant = variantPool[Math.floor(random() * variantPool.length)] || 'shuriken';
  const obstacle = {
    id: ++world.spawnId,
    x: GAME_WIDTH + 30,
    y: surfaceAt(world, GAME_WIDTH + 30) - (isHigh ? 130 : 20),
    clearance: isHigh ? 130 : 20,
    radius: variant === 'senbon' ? 16 : variant === 'kunai' ? 20 : 18,
    high: isHigh,
    spin: 0,
    passed: false,
    variant,
  };
  world.obstacles.push(obstacle);

  // Later stages occasionally add a chained second hazard to raise difficulty.
  if (world.stageIndex >= 1 && random() > (world.stageIndex >= 3 ? 0.54 : 0.72)) {
    world.obstacles.push({
      id: ++world.spawnId,
      x: GAME_WIDTH + 150 + random() * 55,
      y: surfaceAt(world, GAME_WIDTH + 150) - (!isHigh ? 128 : 22),
      clearance: !isHigh ? 128 : 22,
      radius: 17,
      high: !isHigh,
      spin: 0,
      passed: false,
      variant: world.stageIndex >= 2 ? 'senbon' : 'shuriken',
    });
  }

  const stagePressure = stage.startAt / 5.5;
  world.nextSpawn =
    Math.max(0.58, 1.44 - world.elapsed * 0.016 - stagePressure * 0.013) + random() * 0.26;
}

export function tickWorld(world, seconds, random = Math.random) {
  if (world.status !== 'running') return { collided: false, dodged: 0, stageChanged: false };

  // Cap long frame delays so switching browser tabs does not skip through hazards.
  const dt = Math.max(0, Math.min(seconds, 0.05));
  world.elapsed += dt;
  const previousStage = world.stageIndex;
  world.stageIndex = stageIndexForElapsed(world.elapsed);
  const stage = currentStage(world);
  world.speed = Math.min(MAX_SPEED, START_SPEED + stage.speedBoost + world.elapsed * 8.5);
  world.distance += world.speed * dt;
  if (world.stageIndex !== previousStage) world.stageBanner = 2.8;
  else if (world.stageBanner > 0) world.stageBanner = Math.max(0, world.stageBanner - dt);

  moveNinja(world, dt, world.speed * dt);

  const front = NINJA.x + NINJA.width - 8;
  const hitBuilding = world.terrain.some(
    (platform) =>
      platform.kind === 'roof' &&
      platform.x <= front &&
      platform.x + world.speed * dt > front &&
      world.ninjaY + NINJA.height > GROUND_Y - platform.height + 6,
  );
  if (hitBuilding) {
    world.status = 'gameover';
    world.failureReason = 'Missed the rooftop';
    return { collided: true, dodged: 0, stageChanged: world.stageIndex !== previousStage };
  }

  world.nextSpawn -= dt;
  if (world.nextSpawn <= 0) spawnObstacle(world, random);

  let newlyDodged = 0;
  for (const obstacle of world.obstacles) {
    obstacle.x -= (world.speed + (obstacle.variant === 'senbon' ? 20 : 0)) * dt;
    if (obstacle.clearance !== undefined)
      obstacle.y = surfaceAt(world, obstacle.x) - obstacle.clearance;
    obstacle.spin += dt * (obstacle.variant === 'kunai' ? 7.5 : 11);
    if (collidesWithNinja(world, obstacle)) {
      world.status = 'gameover';
      world.failureReason = 'Hit by a ' + obstacle.variant;
      world.score = Math.floor(world.elapsed * 5) + world.dodged * 18 + world.stageIndex * 30;
      return {
        collided: true,
        dodged: newlyDodged,
        stageChanged: world.stageIndex !== previousStage,
      };
    }
    if (!obstacle.passed && obstacle.x < NINJA.x - obstacle.radius) {
      obstacle.passed = true;
      newlyDodged += 1;
    }
  }
  world.dodged += newlyDodged;
  world.obstacles = world.obstacles.filter((obstacle) => obstacle.x > -60);
  world.score = Math.floor(world.elapsed * 5) + world.dodged * 18 + world.stageIndex * 30;
  return { collided: false, dodged: newlyDodged, stageChanged: world.stageIndex !== previousStage };
}

export function gameSnapshot(world) {
  const stage = currentStage(world);
  const nextStage = STAGES[world.stageIndex + 1] ?? null;
  return {
    status: world.status,
    score: world.score,
    dodged: world.dodged,
    speed: Math.round(world.speed),
    seconds: Math.floor(world.elapsed),
    stageIndex: world.stageIndex,
    stageName: stage.name,
    stageSubtitle: stage.subtitle,
    stageAccent: stage.accent,
    nextStageIn: nextStage ? Math.max(0, Math.ceil(nextStage.startAt - world.elapsed)) : 0,
  };
}
