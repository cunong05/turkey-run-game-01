/* Gobble Run — stages and scenery: farmyard, barn, kitchen, forest gate.
   One job: know what each stretch of the run looks like and when it changes. */
'use strict';

function createStageScenery(rand) {
  return {
    rand,
    clouds: Array.from({ length: 7 }, (_, i) => ({
      x: rand() * 1400,
      y: 50 + rand() * 130,
      scale: 0.7 + rand() * 0.9,
      speed: 12 + rand() * 18
    })),
    leaves: Array.from({ length: 26 }, () => ({
      x: rand() * 1280,
      y: rand() * 500,
      size: 5 + rand() * 7,
      speed: 30 + rand() * 50,
      sway: rand() * Math.PI * 2,
      color: randomPick(rand, ['#e8632c', '#ffd23c', '#c94a1e', '#d8a03c'])
    })),
    pumpkins: [140, 520, 900, 1180].map((x) => ({ x, size: 26 + rand() * 14 })),
    fencePosts: Array.from({ length: 14 }, (_, i) => ({ x: i * 100 + 20 })),
    pots: [180, 420, 700, 980, 1180].map((x) => ({ x, size: 30 + rand() * 16 })),
    trees: [80, 420, 760, 1120].map((x) => ({ x, height: 150 + rand() * 70 }))
  };
}

function stagePalette(stageIndex) {
  const keys = ['farmyard', 'barn', 'kitchen', 'forest'];
  return GOBBLE_CONFIG.palette[keys[stageIndex]];
}

function stageBannerText(stageIndex) {
  if (stageIndex === 0) return 'STAGE 1 — THE FARMYARD';
  if (stageIndex === 1) return 'STAGE 2 — THE BARN';
  if (stageIndex === 2) return 'STAGE 3 — THE KITCHEN';
  return 'THE FOREST GATE — RUN!';
}

/* Move clouds and leaves with the wind and the run. */
function sceneryUpdate(scenery, dt, speedPx, nowSeconds) {
  for (const cloud of scenery.clouds) {
    cloud.x -= (cloud.speed + speedPx * 0.05) * dt;
    if (cloud.x < -180) {
      cloud.x = 1400;
      cloud.y = 50 + scenery.rand() * 130;
    }
  }
  for (const leaf of scenery.leaves) {
    leaf.y += leaf.speed * dt;
    leaf.x += Math.sin(nowSeconds * 2 + leaf.sway) * 26 * dt - speedPx * 0.12 * dt;
    if (leaf.y > 620) {
      leaf.y = -12;
      leaf.x = scenery.rand() * 1400;
    }
    if (leaf.x < -20) leaf.x = 1300;
  }
}
