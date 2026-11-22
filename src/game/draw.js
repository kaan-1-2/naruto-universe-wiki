import {
  GAME_HEIGHT,
  GAME_WIDTH,
  GROUND_Y,
  NINJA,
  STAGES,
  currentStage,
  isGrounded,
  terrainTopAt,
} from './engine.js';

const palettes = {
  konoha: {
    skyTop: '#11223b',
    skyMid: '#23425a',
    skyBottom: '#3f6a57',
    glow: 'rgba(251,146,60,.22)',
    moon: '#ffd18c',
    groundTop: '#355a46',
    groundBottom: '#16261f',
    line: '#f59e0b',
    skylineA: '#25394d',
    skylineB: '#31485d',
    particle: '#fca76d',
  },
  suna: {
    skyTop: '#2a1b23',
    skyMid: '#6b4a3d',
    skyBottom: '#b67849',
    glow: 'rgba(251,191,36,.24)',
    moon: '#ffe3af',
    groundTop: '#8d6238',
    groundBottom: '#3f2819',
    line: '#fbbf24',
    skylineA: '#704b30',
    skylineB: '#96653e',
    particle: '#ffd36d',
  },
  kiri: {
    skyTop: '#081b2d',
    skyMid: '#20485b',
    skyBottom: '#355f72',
    glow: 'rgba(103,232,249,.22)',
    moon: '#ddfcff',
    groundTop: '#274a56',
    groundBottom: '#0d1a24',
    line: '#67e8f9',
    skylineA: '#223f53',
    skylineB: '#2e5567',
    particle: '#8ff3ff',
  },
  kumo: {
    skyTop: '#161a34',
    skyMid: '#32477e',
    skyBottom: '#5a5f9b',
    glow: 'rgba(167,139,250,.24)',
    moon: '#ede6ff',
    groundTop: '#37435d',
    groundBottom: '#13182b',
    line: '#a78bfa',
    skylineA: '#2f3f5d',
    skylineB: '#405275',
    particle: '#d1c1ff',
  },
};

function backdrop(ctx, world) {
  const stage = currentStage(world);
  const palette = palettes[stage.key] || palettes.konoha;
  const sky = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
  sky.addColorStop(0, palette.skyTop);
  sky.addColorStop(0.56, palette.skyMid);
  sky.addColorStop(1, palette.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  const moonGlow = ctx.createRadialGradient(766, 91, 16, 766, 91, 146);
  moonGlow.addColorStop(0, palette.glow);
  moonGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = moonGlow;
  ctx.fillRect(620, 0, 292, 250);
  ctx.beginPath();
  ctx.arc(766, 90, 36, 0, Math.PI * 2);
  ctx.fillStyle = palette.moon;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(779, 77, 35, 0, Math.PI * 2);
  ctx.fillStyle = palette.skyTop;
  ctx.fill();

  ctx.fillStyle = 'rgba(226,237,255,.48)';
  for (let index = 0; index < 31; index += 1) {
    const x = (index * 173 + 44) % GAME_WIDTH;
    const y = 24 + ((index * 83) % 205);
    ctx.fillRect(x, y, index % 5 === 0 ? 2 : 1, index % 5 === 0 ? 2 : 1);
  }

  for (const [shade, height, drift] of [
    [palette.skylineA, 205, 0.08],
    [palette.skylineB, 259, 0.17],
  ]) {
    const offset = (world.distance * drift) % 240;
    ctx.beginPath();
    ctx.moveTo(-260, GROUND_Y);
    for (let x = -260; x < GAME_WIDTH + 300; x += 120) {
      const peakY = height + Math.sin((x + offset) * 0.015) * 19;
      ctx.lineTo(x + 60 - offset, peakY);
      ctx.lineTo(x + 120 - offset, GROUND_Y - 40);
    }
    ctx.lineTo(GAME_WIDTH, GROUND_Y);
    ctx.closePath();
    ctx.fillStyle = shade;
    ctx.fill();
  }

  const roofOffset = (world.distance * 0.26) % 230;
  for (let x = -230 - roofOffset; x < GAME_WIDTH + 270; x += 230) {
    if (stage.key === 'suna') {
      ctx.fillStyle = '#8d6238';
      ctx.fillRect(x + 62, GROUND_Y - 80, 66, 80);
      ctx.beginPath();
      ctx.arc(x + 95, GROUND_Y - 80, 33, Math.PI, 0);
      ctx.fillStyle = '#b9844b';
      ctx.fill();
    } else if (stage.key === 'kiri') {
      ctx.fillStyle = '#25495a';
      ctx.fillRect(x + 52, GROUND_Y - 76, 80, 76);
      ctx.beginPath();
      ctx.moveTo(x + 35, GROUND_Y - 74);
      ctx.lineTo(x + 90, GROUND_Y - 106);
      ctx.lineTo(x + 145, GROUND_Y - 74);
      ctx.closePath();
      ctx.fillStyle = '#33677b';
      ctx.fill();
    } else if (stage.key === 'kumo') {
      ctx.fillStyle = '#25324c';
      ctx.fillRect(x + 60, GROUND_Y - 95, 72, 95);
      ctx.fillRect(x + 86, GROUND_Y - 125, 20, 30);
      ctx.fillStyle = '#526685';
      ctx.fillRect(x + 80, GROUND_Y - 120, 32, 7);
    } else {
      ctx.fillStyle = '#1c2a3c';
      ctx.fillRect(x + 52, GROUND_Y - 63, 80, 63);
      ctx.beginPath();
      ctx.moveTo(x + 33, GROUND_Y - 62);
      ctx.lineTo(x + 91, GROUND_Y - 92);
      ctx.lineTo(x + 150, GROUND_Y - 62);
      ctx.closePath();
      ctx.fillStyle = '#2b3e51';
      ctx.fill();
      ctx.fillStyle = '#d58c55';
      ctx.fillRect(x + 84, GROUND_Y - 38, 12, 20);
    }
  }

  if (stage.key === 'kiri') {
    ctx.fillStyle = 'rgba(220,255,255,.07)';
    for (let i = 0; i < 6; i += 1) ctx.fillRect(0, 185 + i * 22, GAME_WIDTH, 10);
  }
  if (stage.key === 'kumo') {
    ctx.strokeStyle = 'rgba(208,200,255,.28)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(700, 76);
    ctx.lineTo(723, 106);
    ctx.lineTo(708, 106);
    ctx.lineTo(729, 140);
    ctx.stroke();
  }

  const soil = ctx.createLinearGradient(0, GROUND_Y, 0, GAME_HEIGHT);
  soil.addColorStop(0, palette.groundTop);
  soil.addColorStop(1, palette.groundBottom);
  ctx.fillStyle = soil;
  ctx.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);
  ctx.fillStyle = palette.line;
  ctx.fillRect(0, GROUND_Y, GAME_WIDTH, 3);
  ctx.fillStyle = 'rgba(255,255,255,.12)';
  const trackOffset = world.distance % 63;
  for (let x = -trackOffset; x < GAME_WIDTH; x += 63) ctx.fillRect(x, GROUND_Y + 27, 30, 2);
}

function drawTerrain(ctx, world) {
  const stage = currentStage(world);
  for (const platform of world.terrain || []) {
    const { x, width, height, kind } = platform;
    if (x > GAME_WIDTH + 40 || x + width < -40) continue;
    const top = GROUND_Y - height;
    if (kind === 'ridge') {
      const rock = ctx.createLinearGradient(0, top, 0, GROUND_Y + 25);
      rock.addColorStop(0, stage.key === 'suna' ? '#b48752' : '#718078');
      rock.addColorStop(1, '#35433d');
      ctx.fillStyle = rock;
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y);
      ctx.lineTo(x + width * 0.28, top);
      ctx.lineTo(x + width * 0.72, top);
      ctx.lineTo(x + width, GROUND_Y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = stage.key === 'suna' ? '#e6bd76' : '#aac38e';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y);
      ctx.lineTo(x + width * 0.28, top);
      ctx.lineTo(x + width * 0.72, top);
      ctx.lineTo(x + width, GROUND_Y);
      ctx.stroke();
      ctx.strokeStyle = '#293a3755';
      ctx.lineWidth = 2;
      for (let i = 1; i < 7; i++) {
        const px = x + (width * i) / 7,
          py = terrainTopAt(platform, px);
        ctx.beginPath();
        ctx.moveTo(px, py + 12);
        ctx.lineTo(px - 15, GROUND_Y + 6);
        ctx.stroke();
      }
      // Small pines on the far slope make raised ground distinct from a roof.
      for (const fraction of [0.42, 0.6]) {
        const tx = x + width * fraction;
        ctx.fillStyle = '#243e34';
        ctx.fillRect(tx - 3, top - 33, 6, 33);
        ctx.beginPath();
        ctx.moveTo(tx, top - 70);
        ctx.lineTo(tx - 24, top - 20);
        ctx.lineTo(tx + 24, top - 20);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      const wall = ctx.createLinearGradient(0, top, 0, GROUND_Y);
      wall.addColorStop(0, '#b9a27c');
      wall.addColorStop(1, '#6b6155');
      ctx.fillStyle = wall;
      ctx.fillRect(x + 8, top + 10, width - 16, height - 10);
      ctx.strokeStyle = '#554d46';
      ctx.lineWidth = 2;
      for (let row = top + 28; row < GROUND_Y; row += 25) {
        ctx.beginPath();
        ctx.moveTo(x + 8, row);
        ctx.lineTo(x + width - 8, row);
        ctx.stroke();
      }
      ctx.fillStyle =
        stage.key === 'kiri' ? '#396d7e' : stage.key === 'suna' ? '#aa7446' : '#b34d35';
      ctx.beginPath();
      ctx.moveTo(x - 12, top + 13);
      ctx.lineTo(x, top);
      ctx.lineTo(x + width, top);
      ctx.lineTo(x + width + 12, top + 13);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#f2ba76';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x + width, top);
      ctx.stroke();
      ctx.strokeStyle = '#572f27';
      ctx.lineWidth = 2;
      for (let tile = x + 15; tile < x + width; tile += 22) {
        ctx.beginPath();
        ctx.moveTo(tile, top + 2);
        ctx.lineTo(tile + 3, top + 12);
        ctx.stroke();
      }
      for (let window = x + 34; window < x + width - 25; window += 58) {
        ctx.fillStyle = '#3d4444';
        ctx.fillRect(window, top + 30, 25, 30);
        ctx.fillStyle = '#f1c884';
        ctx.fillRect(window + 4, top + 34, 17, 22);
        ctx.fillStyle = '#675342';
        ctx.fillRect(window + 11, top + 34, 3, 22);
      }
    }
    if (world.status === 'running' && x > NINJA.x + 95 && x < NINJA.x + 450 && kind === 'roof') {
      ctx.fillStyle = '#fff1c6';
      ctx.font = '700 12px ui-sans-serif,system-ui';
      ctx.fillText('JUMP TO THE ROOF', x + 12, top - 16);
    }
  }
}

function drawNinja(ctx, world) {
  const run = isGrounded(world) && world.status === 'running' ? Math.sin(world.elapsed * 21) : 0;
  const x = NINJA.x;
  const y = world.ninjaY;
  ctx.save();
  ctx.translate(x, y);

  // Dust trail.
  if (isGrounded(world) && world.status === 'running') {
    ctx.fillStyle = 'rgba(252,184,112,.2)';
    for (let k = 0; k < 3; k += 1) {
      ctx.beginPath();
      ctx.arc(-14 - k * 13 + ((world.elapsed * 35) % 13), 57 - k * 7, 5 - k, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Headband tails.
  ctx.fillStyle = '#17324a';
  ctx.beginPath();
  ctx.moveTo(15, 20);
  ctx.lineTo(-18 - run * 4, 13);
  ctx.lineTo(-8, 23);
  ctx.lineTo(15, 28);
  ctx.fill();
  ctx.fillStyle = '#1f4e7a';
  ctx.beginPath();
  ctx.moveTo(15, 23);
  ctx.lineTo(-5, 29 + run * 2);
  ctx.lineTo(6, 30);
  ctx.fill();

  // Legs.
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#0f1724';
  for (const [legX, swing] of [
    [18, run * 10],
    [34, -run * 10],
  ]) {
    ctx.beginPath();
    ctx.moveTo(legX, 49);
    ctx.lineTo(legX + swing, 60);
    ctx.stroke();
  }

  // Body.
  ctx.fillStyle = '#f97316';
  ctx.fillRect(9, 29, 36, 24);
  ctx.fillStyle = '#1b314a';
  ctx.fillRect(14, 31, 24, 15);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(24, 31, 3, 22);

  // Arms.
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(12, 34);
  ctx.lineTo(2, 43 + run * 1.5);
  ctx.moveTo(42, 34);
  ctx.lineTo(53, 42 - run * 1.5);
  ctx.stroke();

  // Face and hair.
  ctx.fillStyle = '#f3d2aa';
  ctx.beginPath();
  ctx.arc(28, 18, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.moveTo(12, 18);
  ctx.lineTo(15, 8);
  ctx.lineTo(20, 15);
  ctx.lineTo(24, 6);
  ctx.lineTo(29, 14);
  ctx.lineTo(34, 5);
  ctx.lineTo(39, 14);
  ctx.lineTo(44, 7);
  ctx.lineTo(47, 18);
  ctx.closePath();
  ctx.fill();

  // Headband.
  ctx.fillStyle = '#1f4e7a';
  ctx.fillRect(12, 15, 32, 7);
  ctx.fillStyle = '#dce7f5';
  ctx.fillRect(20, 16, 15, 5);
  ctx.fillStyle = '#7188a6';
  ctx.fillRect(26, 17, 4, 3);

  // Eyes and whisker marks.
  ctx.fillStyle = '#17253a';
  ctx.fillRect(23, 23, 4, 2);
  ctx.fillRect(32, 23, 4, 2);
  ctx.fillRect(18, 26, 5, 1);
  ctx.fillRect(18, 29, 5, 1);
  ctx.fillRect(36, 26, 5, 1);
  ctx.fillRect(36, 29, 5, 1);

  ctx.restore();
}

function drawShuriken(ctx, obstacle) {
  ctx.save();
  ctx.translate(obstacle.x, obstacle.y);
  ctx.rotate(obstacle.spin);
  const glow =
    obstacle.variant === 'senbon'
      ? 'rgba(103,232,249,.55)'
      : obstacle.high
        ? 'rgba(94,234,212,.55)'
        : 'rgba(251,146,60,.65)';
  ctx.shadowBlur = 17;
  ctx.shadowColor = glow;

  if (obstacle.variant === 'kunai') {
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(10, 7);
    ctx.lineTo(0, 22);
    ctx.lineTo(-10, 7);
    ctx.closePath();
    ctx.fillStyle = '#d8e0ed';
    ctx.fill();
    ctx.strokeStyle = '#70859f';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 17, 4, 0, Math.PI * 2);
    ctx.stroke();
  } else if (obstacle.variant === 'senbon') {
    ctx.strokeStyle = '#87f3ff';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-18, -18);
    ctx.lineTo(18, 18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-18, 18);
    ctx.lineTo(18, -18);
    ctx.stroke();
  } else {
    ctx.beginPath();
    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI / 4) * i - Math.PI / 2;
      const r = i % 2 === 0 ? 19 : 7.5;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = obstacle.high ? '#70e7df' : '#e5ebf6';
    ctx.fill();
    ctx.strokeStyle = obstacle.high ? '#137f7b' : '#788da7';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#243247';
    ctx.fill();
  }

  ctx.restore();
}

function stageBanner(ctx, world) {
  if (world.stageBanner <= 0 || world.status !== 'running') return;
  const stage = currentStage(world);
  ctx.save();
  const alpha = Math.min(1, world.stageBanner / 1.4);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(5,11,24,.52)';
  ctx.fillRect(280, 35, 400, 70);
  ctx.strokeStyle = stage.accent;
  ctx.lineWidth = 2;
  ctx.strokeRect(280, 35, 400, 70);
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 13px ui-sans-serif, system-ui, sans-serif';
  ctx.fillText('STAGE SHIFT', 306, 60);
  ctx.font = '900 24px ui-sans-serif, system-ui, sans-serif';
  ctx.fillStyle = stage.accent;
  ctx.fillText(stage.name, 306, 88);
  ctx.font = '500 14px ui-sans-serif, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,.78)';
  ctx.fillText(stage.subtitle, 520, 88);
  ctx.restore();
}

export function drawWorld(ctx, world) {
  const stage = currentStage(world);
  ctx.save();
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  backdrop(ctx, world);
  drawTerrain(ctx, world);
  for (const obstacle of world.obstacles) drawShuriken(ctx, obstacle);
  drawNinja(ctx, world);
  stageBanner(ctx, world);

  ctx.font = '700 15px ui-sans-serif, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,.75)';
  ctx.fillText('SHINOBI DASH', 29, 38);
  ctx.font = '500 12px ui-sans-serif, system-ui, sans-serif';
  ctx.fillStyle = stage.accent;
  ctx.fillText(`MISSION ROUTE · ${stage.name.toUpperCase()}`, 29, 58);

  // Stage markers on the top-right.
  STAGES.forEach((entry, index) => {
    const x = 790 + index * 36;
    ctx.beginPath();
    ctx.arc(x, 32, 11, 0, Math.PI * 2);
    ctx.fillStyle = index <= world.stageIndex ? entry.accent : 'rgba(255,255,255,.14)';
    ctx.fill();
    ctx.fillStyle = '#0a101c';
    ctx.font = '700 10px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText(String(index + 1), x - 3, 35);
  });
  ctx.restore();
}
