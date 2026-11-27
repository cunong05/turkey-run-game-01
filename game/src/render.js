/* Gobble Run — every picture the game paints: scenery, HUD, menus.
   One job: draw the world, the turkey's dashboard and the screens. */
'use strict';

function drawSky(ctx, palette, scenery) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 560);
  gradient.addColorStop(0, palette.skyTop);
  gradient.addColorStop(1, palette.skyBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, GOBBLE_CONFIG.canvasWidth, 560);
  /* Sun. */
  ctx.fillStyle = palette.sun;
  ctx.beginPath();
  ctx.arc(1080, 110, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.arc(1080, 110, 78, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  /* Clouds. */
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  for (const cloud of scenery.clouds) {
    ctx.beginPath();
    ctx.ellipse(cloud.x, cloud.y, 56 * cloud.scale, 18 * cloud.scale, 0, 0, Math.PI * 2);
    ctx.ellipse(cloud.x + 34 * cloud.scale, cloud.y + 6, 40 * cloud.scale, 15 * cloud.scale, 0, 0, Math.PI * 2);
    ctx.ellipse(cloud.x - 36 * cloud.scale, cloud.y + 7, 36 * cloud.scale, 13 * cloud.scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFarmhouse(ctx, scrollPx) {
  const baseX = 980 - (scrollPx * 0.12 % 1600);
  const x = baseX < -300 ? baseX + 1600 : baseX;
  /* Farmhouse. */
  ctx.fillStyle = '#f2e2c2';
  ctx.fillRect(x, 380, 220, 150);
  ctx.fillStyle = '#a83c22';
  ctx.beginPath();
  ctx.moveTo(x - 16, 384);
  ctx.lineTo(x + 110, 300);
  ctx.lineTo(x + 236, 384);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(x + 90, 450, 40, 80);
  ctx.fillStyle = '#ffd98a';
  ctx.fillRect(x + 24, 410, 34, 34);
  ctx.fillRect(x + 162, 410, 34, 34);
  ctx.fillRect(x + 162, 470, 34, 34);
  /* Silo. */
  ctx.fillStyle = '#c8c8d0';
  ctx.fillRect(x + 250, 330, 70, 200);
  ctx.fillStyle = '#9aa0b0';
  ctx.beginPath();
  ctx.ellipse(x + 285, 330, 35, 18, 0, Math.PI, 0);
  ctx.fill();
}

function drawBarnInterior(ctx, scenery) {
  /* Wooden plank wall. */
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(0, 0, GOBBLE_CONFIG.canvasWidth, 560);
  ctx.strokeStyle = '#4a2c16';
  ctx.lineWidth = 3;
  for (let y = 0; y < 560; y += 56) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(GOBBLE_CONFIG.canvasWidth, y);
    ctx.stroke();
  }
  for (let x = 0; x < 1280; x += 160) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 560);
    ctx.stroke();
  }
  /* Window with light. */
  ctx.fillStyle = '#ffd98a';
  ctx.fillRect(520, 90, 240, 170);
  ctx.strokeStyle = '#4a2c16';
  ctx.lineWidth = 8;
  ctx.strokeRect(520, 90, 240, 170);
  ctx.beginPath();
  ctx.moveTo(640, 90);
  ctx.lineTo(640, 260);
  ctx.moveTo(520, 175);
  ctx.lineTo(760, 175);
  ctx.stroke();
  /* Hanging lantern. */
  ctx.strokeStyle = '#2c1e14';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(180, 0);
  ctx.lineTo(180, 70);
  ctx.stroke();
  ctx.fillStyle = '#ffdf9e';
  ctx.beginPath();
  ctx.arc(180, 92, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a2410';
  ctx.fillRect(168, 66, 24, 8);
  /* Hay bales stacked at the back. */
  ctx.fillStyle = '#d8a83c';
  ctx.beginPath();
  ctx.arc(1120, 500, 52, 0, Math.PI * 2);
  ctx.arc(1180, 520, 40, 0, Math.PI * 2);
  ctx.fill();
}

function drawKitchenInterior(ctx, scenery) {
  /* Checkered tile wall. */
  for (let y = 0; y < 560; y += 70) {
    for (let x = 0; x < 1280; x += 70) {
      ctx.fillStyle = ((x / 70 + y / 70) % 2 === 0) ? '#f2e2c2' : '#d8b88a';
      ctx.fillRect(x, y, 70, 70);
    }
  }
  /* Hanging pots and pans. */
  ctx.strokeStyle = '#3a3a44';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, 60);
  ctx.lineTo(1280, 60);
  ctx.stroke();
  for (const pot of scenery.pots) {
    ctx.fillStyle = '#55555f';
    ctx.beginPath();
    ctx.arc(pot.x, 96, pot.size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2c2c34';
    ctx.beginPath();
    ctx.arc(pot.x, 96, pot.size / 2 - 8, 0, Math.PI * 2);
    ctx.fill();
  }
  /* Window over the sink. */
  ctx.fillStyle = '#9ed0e8';
  ctx.fillRect(540, 150, 200, 130);
  ctx.strokeStyle = '#5a3a22';
  ctx.lineWidth = 8;
  ctx.strokeRect(540, 150, 200, 130);
  ctx.beginPath();
  ctx.moveTo(640, 150);
  ctx.lineTo(640, 280);
  ctx.stroke();
  /* Counter with a pie. */
  ctx.fillStyle = '#8a5a34';
  ctx.fillRect(0, 470, 1280, 90);
  ctx.fillStyle = '#e8c05a';
  ctx.beginPath();
  ctx.ellipse(220, 462, 60, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a83c22';
  ctx.beginPath();
  ctx.ellipse(220, 456, 44, 9, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawForestGate(ctx, scenery) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 560);
  gradient.addColorStop(0, '#2e6b34');
  gradient.addColorStop(1, '#9ed08a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, GOBBLE_CONFIG.canvasWidth, 560);
  /* Tall pines. */
  for (const tree of scenery.trees) {
    const x = tree.x;
    ctx.fillStyle = '#5a3a22';
    ctx.fillRect(x - 10, 560 - 60, 20, 60);
    ctx.fillStyle = '#1e4a22';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x - 70 + i * 14, 520 - i * 70);
      ctx.lineTo(x, 400 - i * 70);
      ctx.lineTo(x + 70 - i * 14, 520 - i * 70);
      ctx.closePath();
      ctx.fill();
    }
  }
  /* The gate arch: freedom. */
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.moveTo(880, 560);
  ctx.lineTo(880, 320);
  ctx.quadraticCurveTo(1040, 220, 1200, 320);
  ctx.lineTo(1200, 560);
  ctx.stroke();
  ctx.fillStyle = '#ffd23c';
  ctx.font = 'bold 30px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FREEDOM', 1040, 300);
}

function drawGround(ctx, palette, scrollPx, stageIndex) {
  ctx.fillStyle = palette.ground;
  ctx.fillRect(0, GOBBLE_CONFIG.groundY, GOBBLE_CONFIG.canvasWidth, 120);
  ctx.fillStyle = palette.groundTop;
  ctx.fillRect(0, GOBBLE_CONFIG.groundY, GOBBLE_CONFIG.canvasWidth, 12);
  /* Rolling texture: tufts and stones scrolling past. */
  ctx.fillStyle = palette.hillNear;
  const offset = scrollPx % 90;
  for (let x = -offset; x < 1280; x += 90) {
    ctx.beginPath();
    ctx.ellipse(x + 30, GOBBLE_CONFIG.groundY + 46, 26, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  for (let x = -offset; x < 1280; x += 150) {
    ctx.beginPath();
    ctx.ellipse(x + 90, GOBBLE_CONFIG.groundY + 84, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (stageIndex === 0) {
    for (const pumpkin of [140, 520, 900, 1180]) {
      const px = pumpkin - (scrollPx * 0.6 % 1280);
      const drawX = px < -60 ? px + 1280 : px;
      ctx.fillStyle = '#e8632c';
      ctx.beginPath();
      ctx.ellipse(drawX, GOBBLE_CONFIG.groundY - 14, 26, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5a7a2e';
      ctx.fillRect(drawX - 3, GOBBLE_CONFIG.groundY - 38, 6, 12);
    }
  }
}

function drawLeaves(ctx, scenery) {
  for (const leaf of scenery.leaves) {
    ctx.save();
    ctx.translate(leaf.x, leaf.y);
    ctx.rotate(leaf.sway + leaf.y * 0.01);
    ctx.fillStyle = leaf.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, leaf.size, leaf.size * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawBackground(ctx, stageIndex, palette, scenery, scrollPx) {
  if (stageIndex === 1) {
    drawBarnInterior(ctx, scenery);
  } else if (stageIndex === 2) {
    drawKitchenInterior(ctx, scenery);
  } else if (stageIndex === 3) {
    drawForestGate(ctx, scenery);
  } else {
    drawSky(ctx, palette, scenery);
    drawFarmhouse(ctx, scrollPx);
    /* Distant hills. */
    ctx.fillStyle = palette.hillFar;
    ctx.beginPath();
    ctx.moveTo(0, 560);
    ctx.quadraticCurveTo(320, 420, 640, 540);
    ctx.quadraticCurveTo(960, 620, 1280, 500);
    ctx.lineTo(1280, 560);
    ctx.closePath();
    ctx.fill();
    drawLeaves(ctx, scenery);
  }
  drawGround(ctx, palette, scrollPx, stageIndex);
}

/* ---------- HUD ---------- */

function drawHeart(ctx, x, y, filled) {
  ctx.fillStyle = filled ? '#ff2c4e' : 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.moveTo(x, y + 8);
  ctx.bezierCurveTo(x - 12, y - 4, x - 6, y - 12, x, y - 4);
  ctx.bezierCurveTo(x + 6, y - 12, x + 12, y - 4, x, y + 8);
  ctx.closePath();
  ctx.fill();
}

function drawHud(ctx, state) {
  const w = GOBBLE_CONFIG.canvasWidth;
  /* Top panel. */
  ctx.fillStyle = 'rgba(30, 16, 8, 0.72)';
  ctx.fillRect(0, 0, w, 64);
  ctx.fillStyle = '#ffd23c';
  ctx.font = 'bold 26px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('SCORE ' + state.score, 20, 42);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px "Trebuchet MS", sans-serif';
  ctx.fillText(Math.floor(state.distanceMeters) + ' m', 250, 40);
  /* Distance progress bar. */
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(330, 22, 260, 16);
  ctx.fillStyle = '#7ac74f';
  const progress = Math.min(1, state.distanceMeters / GOBBLE_CONFIG.escapeDistanceMeters);
  ctx.fillRect(330, 22, 260 * progress, 16);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ESCAPE ' + Math.floor(progress * 100) + '%', 460, 34);
  /* Corn count. */
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffd23c';
  ctx.fillText('CORN ' + state.corn, 620, 40);
  /* Stage name. */
  ctx.fillStyle = '#ffb347';
  ctx.font = 'bold 20px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(GOBBLE_CONFIG.stageNames[state.stageIndex], w - 20, 32);
  /* Lives. */
  for (let i = 0; i < GOBBLE_CONFIG.startLives; i++) {
    drawHeart(ctx, w - 40 - i * 34, 44, i < state.lives);
  }
  /* Farmer proximity meter. */
  const meterX = 20;
  const meterY = 78;
  const meterW = 300;
  ctx.fillStyle = 'rgba(30, 16, 8, 0.72)';
  ctx.fillRect(meterX - 8, meterY - 8, meterW + 16, 40);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(meterX, meterY, meterW, 10);
  const gapRatio = Math.max(0, state.farmerGap / GOBBLE_CONFIG.maxFarmerGap);
  ctx.fillStyle = gapRatio < 0.28 ? '#ff2c1e' : '#ffb347';
  ctx.fillRect(meterX, meterY, meterW * gapRatio, 10);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('FARMER', meterX, meterY + 26);
  ctx.textAlign = 'right';
  ctx.fillText('TURKEY', meterX + meterW, meterY + 26);
  /* Warning when the farmer is close. */
  if (state.farmerGap < GOBBLE_CONFIG.farmerLungeGap && state.phase === 'playing') {
    ctx.fillStyle = '#ff2c1e';
    ctx.font = 'bold 34px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    const pulse = 0.7 + Math.sin(state.nowSeconds * 10) * 0.3;
    ctx.globalAlpha = pulse;
    ctx.fillText("HE'S RIGHT BEHIND YOU!", w / 2, 150);
    ctx.globalAlpha = 1;
  }
}

function drawStageBanner(ctx, text, alpha) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(30, 16, 8, 0.75)';
  ctx.fillRect(0, 300, GOBBLE_CONFIG.canvasWidth, 74);
  ctx.fillStyle = '#ffd23c';
  ctx.font = 'bold 40px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, GOBBLE_CONFIG.canvasWidth / 2, 350);
  ctx.restore();
}

/* ---------- Screens ---------- */

function drawButton(ctx, rect, label, hovered) {
  ctx.fillStyle = hovered ? '#ffb347' : '#e8632c';
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#fff3b0';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#2b1a12';
  ctx.font = 'bold 30px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 11);
}

function drawTitleScreen(ctx, bestScore, mouse) {
  const w = GOBBLE_CONFIG.canvasWidth;
  const gradient = ctx.createLinearGradient(0, 0, 0, 720);
  gradient.addColorStop(0, '#ff9a3d');
  gradient.addColorStop(0.6, '#c95a1e');
  gradient.addColorStop(1, '#5a2c14');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, 720);
  /* Autumn leaves drifting. */
  ctx.fillStyle = 'rgba(255, 210, 60, 0.5)';
  for (let i = 0; i < 14; i++) {
    const lx = (i * 97 + 40) % 1280;
    const ly = (i * 53 + 30) % 720;
    ctx.beginPath();
    ctx.ellipse(lx, ly, 9, 5, i, 0, Math.PI * 2);
    ctx.fill();
  }
  /* Big turkey silhouette art: tail fan behind the title. */
  ctx.save();
  ctx.translate(640, 300);
  ctx.fillStyle = 'rgba(138, 75, 31, 0.9)';
  for (let i = -3; i <= 3; i++) {
    ctx.save();
    ctx.rotate(i * 0.3);
    ctx.beginPath();
    ctx.ellipse(0, -150, 26, 110, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff3b0';
  ctx.font = 'bold 96px "Trebuchet MS", sans-serif';
  ctx.fillText('GOBBLE RUN', w / 2, 190);
  ctx.fillStyle = '#ffd23c';
  ctx.font = 'bold 34px "Trebuchet MS", sans-serif';
  ctx.fillText('THE GREAT THANKSGIVING ESCAPE', w / 2, 240);
  ctx.fillStyle = '#ffffff';
  ctx.font = '22px "Trebuchet MS", sans-serif';
  ctx.fillText('Thanksgiving is coming — and YOU are the main course.', w / 2, 300);
  ctx.fillText('Outrun the farmer, dodge the oven and the carving knife,', w / 2, 332);
  ctx.fillText('and reach the forest gate 3,000 metres away!', w / 2, 364);

  ctx.fillStyle = '#fff3b0';
  ctx.font = 'bold 20px "Trebuchet MS", sans-serif';
  ctx.fillText('SPACE / CLICK — jump      ↓ / S — duck      → / D — sprint      P — pause      M — mute', w / 2, 420);
  ctx.fillStyle = '#ffffff';
  ctx.font = '18px "Trebuchet MS", sans-serif';
  ctx.fillText('Grab corn to slow the farmer down. Three lives. No second dinner.', w / 2, 452);

  const button = { x: w / 2 - 150, y: 500, w: 300, h: 70 };
  const hovered = mouse.x >= button.x && mouse.x <= button.x + button.w && mouse.y >= button.y && mouse.y <= button.y + button.h;
  drawButton(ctx, button, '▶  START THE RUN', hovered);
  ctx.fillStyle = '#fff3b0';
  ctx.font = '18px "Trebuchet MS", sans-serif';
  ctx.fillText('or press ENTER', w / 2, 606);
  if (bestScore > 0) {
    ctx.fillStyle = '#ffd23c';
    ctx.font = 'bold 20px "Trebuchet MS", sans-serif';
    ctx.fillText('BEST SCORE: ' + bestScore, w / 2, 640);
  }
  return button;
}

function drawEndScreen(ctx, state, mouse) {
  const w = GOBBLE_CONFIG.canvasWidth;
  const escaped = state.phase === 'escaped';
  const gradient = ctx.createLinearGradient(0, 0, 0, 720);
  if (escaped) {
    gradient.addColorStop(0, '#2e6b34');
    gradient.addColorStop(1, '#12351a');
  } else {
    gradient.addColorStop(0, '#7a2e1e');
    gradient.addColorStop(1, '#2b0f08');
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, 720);

  ctx.textAlign = 'center';
  if (escaped) {
    ctx.fillStyle = '#ffd23c';
    ctx.font = 'bold 84px "Trebuchet MS", sans-serif';
    ctx.fillText('ESCAPED!', w / 2, 170);
    ctx.fillStyle = '#ffffff';
    ctx.font = '26px "Trebuchet MS", sans-serif';
    ctx.fillText('You made it to the forest. No turkey dinner this year!', w / 2, 220);
    ctx.fillText('The farmer is still searching the barn. Gobble gobble!', w / 2, 256);
  } else {
    ctx.fillStyle = '#ff5a4e';
    ctx.font = 'bold 84px "Trebuchet MS", sans-serif';
    ctx.fillText('CAUGHT!', w / 2, 170);
    ctx.fillStyle = '#ffffff';
    ctx.font = '26px "Trebuchet MS", sans-serif';
    ctx.fillText('The farmer got you... Dinner is served.', w / 2, 220);
    ctx.fillText('But a turkey never gives up. Run again!', w / 2, 256);
    /* A platter, ominously empty of turkey. */
    ctx.fillStyle = '#d8dce6';
    ctx.beginPath();
    ctx.ellipse(w / 2, 330, 150, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#9aa0b0';
    ctx.beginPath();
    ctx.ellipse(w / 2, 324, 110, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff3b0';
    ctx.font = 'bold 20px "Trebuchet MS", sans-serif';
    ctx.fillText('(this could have been you)', w / 2, 386);
  }

  /* Stats. */
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(w / 2 - 260, 420, 520, 110);
  ctx.fillStyle = '#ffd23c';
  ctx.font = 'bold 26px "Trebuchet MS", sans-serif';
  ctx.fillText('SCORE  ' + state.score, w / 2, 458);
  ctx.fillStyle = '#ffffff';
  ctx.font = '22px "Trebuchet MS", sans-serif';
  ctx.fillText(
    'Distance ' + Math.floor(state.distanceMeters) + ' m   •   Corn ' + state.corn +
    '   •   Best ' + state.bestScore,
    w / 2, 498
  );

  const button = { x: w / 2 - 150, y: 570, w: 300, h: 64 };
  const hovered = mouse.x >= button.x && mouse.x <= button.x + button.w && mouse.y >= button.y && mouse.y <= button.y + button.h;
  drawButton(ctx, button, '↻  RUN AGAIN', hovered);
  ctx.fillStyle = '#fff3b0';
  ctx.font = '18px "Trebuchet MS", sans-serif';
  ctx.fillText('or press R / ENTER', w / 2, 668);
  return button;
}

function drawPausedOverlay(ctx) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fillRect(0, 0, GOBBLE_CONFIG.canvasWidth, GOBBLE_CONFIG.canvasHeight);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 64px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', GOBBLE_CONFIG.canvasWidth / 2, 350);
  ctx.font = '22px "Trebuchet MS", sans-serif';
  ctx.fillText('Press P to keep running', GOBBLE_CONFIG.canvasWidth / 2, 400);
}
