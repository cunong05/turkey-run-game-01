/* Gobble Run — the farmer: chase AI, lunges, searching and drawing.
   One job: one very determined farmer who never quite gives up. */
'use strict';

const FARMER_STATE = {
  CHASE: 'chase',
  LUNGE: 'lunge',
  SEARCH: 'search'
};

function createFarmer() {
  return {
    state: FARMER_STATE.CHASE,
    stateTimer: 0,
    runCycle: 0,
    searchTimer: 0,
    lungeCooldown: 4
  };
}

/* Farmer screen x from the gap behind the turkey. */
function farmerScreenX(gapPx) {
  return GOBBLE_CONFIG.turkeyX - 70 - gapPx;
}

/* Update the farmer's mood: chase, lunge when close, search when far. */
function farmerUpdate(farmer, dt, gapPx, turkeySpeed) {
  farmer.runCycle += dt * (11 + turkeySpeed / 90);
  farmer.stateTimer += dt;
  farmer.lungeCooldown -= dt;

  if (farmer.state === FARMER_STATE.CHASE) {
    if (gapPx < GOBBLE_CONFIG.farmerLungeGap && farmer.lungeCooldown <= 0) {
      farmer.state = FARMER_STATE.LUNGE;
      farmer.stateTimer = 0;
      farmer.lungeCooldown = 6;
      GobbleAudio.playAlarm();
    } else if (gapPx > GOBBLE_CONFIG.maxFarmerGap * 0.92 && farmer.stateTimer > 3) {
      farmer.state = FARMER_STATE.SEARCH;
      farmer.stateTimer = 0;
      farmer.searchTimer = 1.4;
    }
  } else if (farmer.state === FARMER_STATE.LUNGE) {
    if (farmer.stateTimer > 0.7) {
      farmer.state = FARMER_STATE.CHASE;
      farmer.stateTimer = 0;
    }
  } else if (farmer.state === FARMER_STATE.SEARCH) {
    farmer.searchTimer -= dt;
    if (farmer.searchTimer <= 0) {
      farmer.state = FARMER_STATE.CHASE;
      farmer.stateTimer = 0;
      GobbleAudio.playGobble();
    }
  }
}

/* How fast the gap closes this frame: lunging farmer gains ground. */
function farmerGapCloseRate(farmer, dt) {
  if (farmer.state === FARMER_STATE.LUNGE) return 165 * dt;
  if (farmer.state === FARMER_STATE.SEARCH) return -60 * dt;
  return 14 * dt;
}

/* Draw the farmer mid-run (or searching), pitchfork in hand. */
function drawFarmer(ctx, farmer, gapPx) {
  const x = farmerScreenX(gapPx);
  if (x < -160) return;
  const ground = GOBBLE_CONFIG.groundY;
  const searching = farmer.state === FARMER_STATE.SEARCH;
  const legSwing = searching ? 0 : Math.sin(farmer.runCycle) * 18;
  const bob = searching ? 0 : Math.abs(Math.sin(farmer.runCycle)) * -4;

  ctx.save();
  ctx.translate(x, ground + bob);

  /* Legs: blue overalls. */
  ctx.strokeStyle = '#2c4a7a';
  ctx.lineWidth = 11;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-10, -52);
  ctx.lineTo(-10 + legSwing, 0);
  ctx.moveTo(10, -52);
  ctx.lineTo(10 - legSwing, 0);
  ctx.stroke();

  /* Boots. */
  ctx.fillStyle = '#4a2c14';
  ctx.fillRect(-18 + legSwing, -8, 18, 9);
  ctx.fillRect(2 - legSwing, -8, 18, 9);

  /* Body: red plaid shirt under overalls. */
  ctx.fillStyle = '#b83226';
  ctx.fillRect(-24, -108, 48, 58);
  ctx.strokeStyle = '#7a1e14';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-24, -90);
  ctx.lineTo(24, -90);
  ctx.moveTo(-24, -72);
  ctx.lineTo(24, -72);
  ctx.moveTo(0, -108);
  ctx.lineTo(0, -50);
  ctx.stroke();

  /* Overalls straps and pocket. */
  ctx.fillStyle = '#2c4a7a';
  ctx.fillRect(-20, -108, 8, 40);
  ctx.fillRect(12, -108, 8, 40);
  ctx.fillRect(-14, -58, 28, 12);

  /* Arms: one pumping, one holding the pitchfork. */
  const armSwing = searching ? 0 : Math.sin(farmer.runCycle) * 12;
  ctx.strokeStyle = '#b83226';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(-22, -100);
  ctx.lineTo(-34, -70 + armSwing);
  ctx.stroke();
  ctx.strokeStyle = '#e8b88a';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(22, -100);
  ctx.lineTo(34, -78);
  ctx.stroke();

  /* Pitchfork. */
  ctx.save();
  ctx.translate(38, -78);
  ctx.rotate(searching ? 0.15 : -0.35 + Math.sin(farmer.runCycle) * 0.06);
  ctx.strokeStyle = '#8a6a3a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, 58);
  ctx.lineTo(0, -46);
  ctx.stroke();
  ctx.strokeStyle = '#c8c8d0';
  ctx.lineWidth = 4;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 8, -46);
    ctx.lineTo(i * 8, -66);
    ctx.stroke();
  }
  ctx.restore();

  /* Head. */
  ctx.fillStyle = '#e8b88a';
  ctx.beginPath();
  ctx.arc(0, -124, 17, 0, Math.PI * 2);
  ctx.fill();
  /* Angry brows and eyes. */
  ctx.strokeStyle = '#3a2410';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-10, -132);
  ctx.lineTo(-2, -129);
  ctx.moveTo(10, -132);
  ctx.lineTo(2, -129);
  ctx.stroke();
  ctx.fillStyle = '#1c1c1c';
  ctx.beginPath();
  ctx.arc(-6, -126, 2.4, 0, Math.PI * 2);
  ctx.arc(6, -126, 2.4, 0, Math.PI * 2);
  ctx.fill();
  /* Moustache. */
  ctx.fillStyle = '#6b4a22';
  ctx.beginPath();
  ctx.ellipse(0, -114, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  /* Straw hat. */
  ctx.fillStyle = '#d8b25a';
  ctx.beginPath();
  ctx.ellipse(0, -138, 30, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, -142, 17, 9, 0, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = '#a8842c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, -138, 30, 7, 0, 0, Math.PI * 2);
  ctx.stroke();

  /* "!" when lunging. */
  if (farmer.state === FARMER_STATE.LUNGE) {
    ctx.fillStyle = '#ff2c1e';
    ctx.font = 'bold 44px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', 44, -150);
  }

  /* "?" while searching. */
  if (searching) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('?', 40, -152);
  }

  ctx.restore();
}
