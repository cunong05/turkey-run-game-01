/* Gobble Run — obstacles and corn: spawning, collision and drawing.
   One job: everything the turkey must jump, duck or eat. */
'use strict';

const HAZARD_KIND = {
  FENCE: 'fence',
  HAYBALE: 'haybale',
  OVEN: 'oven',
  KNIFE: 'knife',
  CORN: 'corn'
};

function createHazardField(rand) {
  return {
    items: [],
    nextSpawnX: 1400,
    rand
  };
}

/* Which hazards may appear at this stage of the run. */
function hazardKindsForStage(stageIndex) {
  if (stageIndex === 0) return [HAZARD_KIND.FENCE, HAZARD_KIND.HAYBALE, HAZARD_KIND.CORN];
  if (stageIndex === 1) return [HAZARD_KIND.FENCE, HAZARD_KIND.HAYBALE, HAZARD_KIND.KNIFE, HAZARD_KIND.CORN];
  return [HAZARD_KIND.OVEN, HAZARD_KIND.KNIFE, HAZARD_KIND.HAYBALE, HAZARD_KIND.CORN];
}

function hazardSize(kind) {
  if (kind === HAZARD_KIND.FENCE) return { w: 46, h: 62 };
  if (kind === HAZARD_KIND.HAYBALE) return { w: 84, h: 66 };
  if (kind === HAZARD_KIND.OVEN) return { w: 96, h: 118 };
  if (kind === HAZARD_KIND.KNIFE) return { w: 92, h: 26 };
  return { w: 34, h: 44 };
}

function spawnHazard(field, x, stageIndex, distanceMeters) {
  const kinds = hazardKindsForStage(stageIndex);
  const kind = randomPick(field.rand, kinds);
  const size = hazardSize(kind);
  const item = {
    kind,
    x,
    y: GOBBLE_CONFIG.groundY - size.h,
    w: size.w,
    h: size.h,
    hit: false,
    eaten: false,
    bobPhase: field.rand() * Math.PI * 2,
    spin: field.rand() * Math.PI * 2
  };
  /* Knives fly at head height; corn floats a jump above the ground. */
  if (kind === HAZARD_KIND.KNIFE) item.y = GOBBLE_CONFIG.groundY - 96;
  if (kind === HAZARD_KIND.CORN) item.y = GOBBLE_CONFIG.groundY - 130 - field.rand() * 60;
  /* Late game: sometimes a knife follows a fence, a real combo. */
  if (distanceMeters > 1400 && field.rand() < 0.3 && kind !== HAZARD_KIND.CORN) {
    const second = {
      kind: HAZARD_KIND.KNIFE,
      x: x + 190,
      y: GOBBLE_CONFIG.groundY - 96,
      w: 92,
      h: 26,
      hit: false,
      eaten: false,
      bobPhase: field.rand() * Math.PI * 2,
      spin: field.rand() * Math.PI * 2
    };
    field.items.push(item, second);
  } else {
    field.items.push(item);
  }
}

function hazardUpdate(field, dt, distanceMeters, speedPx, nowSeconds) {
  for (const item of field.items) {
    item.x -= speedPx * dt;
    if (item.kind === HAZARD_KIND.KNIFE) {
      item.spin += dt * 5;
      item.y += Math.sin(nowSeconds * 3 + item.bobPhase) * 22 * dt;
    }
    if (item.kind === HAZARD_KIND.CORN) {
      item.y += Math.sin(nowSeconds * 4 + item.bobPhase) * 14 * dt;
    }
  }
  field.items = field.items.filter((item) => item.x > -220);
  const stageIndex = stageIndexForDistance(distanceMeters);
  const difficulty = Math.min(1, distanceMeters / GOBBLE_CONFIG.escapeDistanceMeters);
  const minGap = GOBBLE_CONFIG.spawnMinGapPx - difficulty * 130;
  const maxGap = GOBBLE_CONFIG.spawnMaxGapPx - difficulty * 220;
  const rightmost = field.items.reduce((m, item) => Math.max(m, item.x), 0);
  if (rightmost < GOBBLE_CONFIG.canvasWidth - 60 || field.items.length === 0) {
    const gap = randomRange(field.rand, minGap, maxGap);
    field.nextSpawnX = Math.max(field.nextSpawnX, rightmost + gap);
    if (field.nextSpawnX < GOBBLE_CONFIG.canvasWidth + 80) {
      field.nextSpawnX = GOBBLE_CONFIG.canvasWidth + 80 + gap;
    }
    spawnHazard(field, field.nextSpawnX, stageIndex, distanceMeters);
  }
}

/* Overlap test between the turkey and one hazard item. */
function turkeyHitsItem(turkey, item) {
  const turkeyLeft = GOBBLE_CONFIG.turkeyX - 34;
  const turkeyRight = GOBBLE_CONFIG.turkeyX + 40;
  const turkeyTop = GOBBLE_CONFIG.groundY - turkey.height;
  const turkeyBottom = GOBBLE_CONFIG.groundY;
  const shrink = item.kind === HAZARD_KIND.KNIFE ? 10 : 6;
  return (
    turkeyRight - shrink > item.x &&
    turkeyLeft + shrink < item.x + item.w &&
    turkeyBottom - 6 > item.y &&
    turkeyTop + 6 < item.y + item.h
  );
}

function drawFence(ctx, item) {
  ctx.fillStyle = '#8a5a2c';
  ctx.fillRect(item.x, item.y + 8, 8, item.h - 8);
  ctx.fillRect(item.x + item.w - 8, item.y + 8, 8, item.h - 8);
  ctx.fillStyle = '#a06a34';
  ctx.fillRect(item.x - 4, item.y + 14, item.w + 8, 10);
  ctx.fillRect(item.x - 4, item.y + 36, item.w + 8, 10);
  ctx.fillStyle = '#c98a3e';
  ctx.fillRect(item.x - 4, item.y, item.w + 8, 6);
}

function drawHaybale(ctx, item) {
  ctx.fillStyle = '#d8a83c';
  ctx.beginPath();
  ctx.arc(item.x + item.w / 2, item.y + item.h / 2, item.h / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#a8842c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(item.x + item.w / 2, item.y + item.h / 2, item.h / 2 - 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(item.x + item.w / 2, item.y + item.h / 2, item.h / 2 - 18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#e8c05a';
  ctx.beginPath();
  ctx.arc(item.x + item.w / 2 - 8, item.y + item.h / 2 - 10, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawOven(ctx, item, nowSeconds) {
  const flicker = 0.75 + Math.sin(nowSeconds * 9 + item.x) * 0.15;
  /* Body. */
  ctx.fillStyle = '#3a3a44';
  ctx.fillRect(item.x, item.y, item.w, item.h);
  ctx.fillStyle = '#55555f';
  ctx.fillRect(item.x, item.y, item.w, 12);
  /* Glowing door with flames. */
  ctx.fillStyle = `rgba(255, ${Math.floor(110 * flicker)}, 20, 0.95)`;
  ctx.fillRect(item.x + 12, item.y + 30, item.w - 24, item.h - 44);
  ctx.fillStyle = '#ffd23c';
  for (let i = 0; i < 3; i++) {
    const fx = item.x + 24 + i * 24;
    const fh = 26 + Math.sin(nowSeconds * 11 + i * 2) * 8;
    ctx.beginPath();
    ctx.moveTo(fx, item.y + item.h - 16);
    ctx.quadraticCurveTo(fx + 8, item.y + item.h - 16 - fh, fx + 16, item.y + item.h - 16);
    ctx.closePath();
    ctx.fill();
  }
  /* Door handle and dials. */
  ctx.fillStyle = '#c8c8d0';
  ctx.fillRect(item.x + 10, item.y + 18, item.w - 20, 6);
  ctx.fillStyle = '#ff5a2c';
  ctx.beginPath();
  ctx.arc(item.x + 20, item.y + 44, 4, 0, Math.PI * 2);
  ctx.arc(item.x + item.w - 20, item.y + 44, 4, 0, Math.PI * 2);
  ctx.fill();
  /* Warning label. */
  ctx.fillStyle = '#fff3b0';
  ctx.font = 'bold 13px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HOT!', item.x + item.w / 2, item.y - 8);
}

function drawKnife(ctx, item) {
  ctx.save();
  ctx.translate(item.x + item.w / 2, item.y + item.h / 2);
  ctx.rotate(Math.sin(item.spin) * 0.25);
  /* Blade. */
  ctx.fillStyle = '#d8dce6';
  ctx.beginPath();
  ctx.moveTo(-46, -6);
  ctx.lineTo(18, -9);
  ctx.lineTo(44, 0);
  ctx.lineTo(18, 9);
  ctx.lineTo(-46, 6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#9aa0b0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-44, 0);
  ctx.lineTo(36, 0);
  ctx.stroke();
  /* Handle. */
  ctx.fillStyle = '#2c1e14';
  ctx.fillRect(-46, -8, 22, 16);
  ctx.fillStyle = '#c8c8d0';
  ctx.beginPath();
  ctx.arc(-40, 0, 2.5, 0, Math.PI * 2);
  ctx.arc(-30, 0, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCorn(ctx, item, nowSeconds) {
  const bob = Math.sin(nowSeconds * 4 + item.bobPhase) * 3;
  ctx.save();
  ctx.translate(item.x + item.w / 2, item.y + item.h / 2 + bob);
  ctx.fillStyle = '#2e7a2e';
  ctx.beginPath();
  ctx.moveTo(-12, 16);
  ctx.quadraticCurveTo(-20, 2, -10, -16);
  ctx.lineTo(-4, -8);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(12, 16);
  ctx.quadraticCurveTo(20, 2, 10, -16);
  ctx.lineTo(4, -8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd23c';
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8a83c';
  for (let r = -1; r <= 1; r++) {
    for (let c = -1; c <= 1; c++) {
      ctx.beginPath();
      ctx.arc(c * 5, r * 9, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawHazards(ctx, field, nowSeconds) {
  for (const item of field.items) {
    if (item.eaten) continue;
    if (item.kind === HAZARD_KIND.FENCE) drawFence(ctx, item);
    else if (item.kind === HAZARD_KIND.HAYBALE) drawHaybale(ctx, item);
    else if (item.kind === HAZARD_KIND.OVEN) drawOven(ctx, item, nowSeconds);
    else if (item.kind === HAZARD_KIND.KNIFE) drawKnife(ctx, item);
    else if (item.kind === HAZARD_KIND.CORN) drawCorn(ctx, item, nowSeconds);
  }
}
