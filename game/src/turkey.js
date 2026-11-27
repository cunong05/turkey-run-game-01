/* Gobble Run — the player turkey: physics, animation and drawing.
   One job: make one brave bird run, jump, duck and wobble. */
'use strict';

function createTurkey() {
  return {
    y: GOBBLE_CONFIG.groundY,
    vy: 0,
    onGround: true,
    ducking: false,
    runCycle: 0,
    invulnerableUntil: 0,
    stumbleTimer: 0,
    width: 64,
    height: GOBBLE_CONFIG.standHeight
  };
}

/* Current hitbox height: lower while ducking. */
function turkeyHitHeight(turkey) {
  return turkey.ducking ? GOBBLE_CONFIG.duckHeight : GOBBLE_CONFIG.standHeight;
}

function turkeyIsInvulnerable(turkey, nowSeconds) {
  return nowSeconds < turkey.invulnerableUntil;
}

function turkeyTryJump(turkey) {
  if (!turkey.onGround) return false;
  turkey.vy = GOBBLE_CONFIG.jumpVelocity;
  turkey.onGround = false;
  turkey.ducking = false;
  GobbleAudio.playJumpWhoosh();
  return true;
}

function turkeyUpdate(turkey, dt, nowSeconds, duckHeld) {
  turkey.runCycle += dt * 14;
  if (turkey.stumbleTimer > 0) turkey.stumbleTimer -= dt;
  turkey.ducking = duckHeld && turkey.onGround;
  if (!turkey.onGround) {
    turkey.vy += GOBBLE_CONFIG.gravity * dt;
    turkey.y += turkey.vy * dt;
    if (turkey.y >= GOBBLE_CONFIG.groundY) {
      turkey.y = GOBBLE_CONFIG.groundY;
      turkey.vy = 0;
      turkey.onGround = true;
    }
  }
  turkey.height = turkeyHitHeight(turkey);
}

/* Turkey is hit: lose a moment, wobble, brief invulnerability. */
function turkeyStumble(turkey, nowSeconds) {
  turkey.stumbleTimer = 0.55;
  turkey.invulnerableUntil = nowSeconds + GOBBLE_CONFIG.invulnerableSeconds;
  GobbleAudio.playThud();
}

/* Draw the turkey at its run position. Facing right, mid-stride. */
function drawTurkey(ctx, turkey, nowSeconds) {
  const x = GOBBLE_CONFIG.turkeyX;
  const h = turkey.height;
  /* Feet sit at turkey.y, so a jumping turkey is drawn in the air. */
  const top = turkey.y - h;
  const blink = turkeyIsInvulnerable(turkey, nowSeconds) && Math.floor(nowSeconds * 12) % 2 === 0;
  if (blink) ctx.globalAlpha = 0.35;

  const squash = turkey.ducking ? 0.72 : 1;
  const airborne = !turkey.onGround;
  const legSwing = Math.sin(turkey.runCycle) * (airborne ? 0.4 : 1);
  const wobble = turkey.stumbleTimer > 0 ? Math.sin(nowSeconds * 30) * 4 : 0;

  ctx.save();
  ctx.translate(x + wobble, top);
  ctx.scale(1, squash);

  /* Tail feather fan. */
  ctx.fillStyle = '#8a4b1f';
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.translate(-26, 34);
    ctx.rotate(i * 0.34 - 0.35);
    ctx.beginPath();
    ctx.ellipse(0, -26, 9, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = i % 2 === 0 ? '#c97e2e' : '#8a4b1f';
    ctx.beginPath();
    ctx.ellipse(0, -26, 5, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#8a4b1f';
  }

  /* Body. */
  ctx.fillStyle = '#a8642a';
  ctx.beginPath();
  ctx.ellipse(0, 40, 34, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#c98a3e';
  ctx.beginPath();
  ctx.ellipse(4, 48, 24, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  /* Wing, flapping a little while running. */
  const flap = airborne ? -0.5 : Math.sin(turkey.runCycle * 2) * 0.12;
  ctx.save();
  ctx.translate(-2, 36);
  ctx.rotate(flap);
  ctx.fillStyle = '#7a4218';
  ctx.beginPath();
  ctx.ellipse(-6, 6, 20, 12, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  /* Legs. */
  ctx.strokeStyle = '#e8a33c';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  const legA = airborne ? 14 : legSwing * 16;
  const legB = airborne ? -6 : -legSwing * 16;
  ctx.beginPath();
  ctx.moveTo(-8, 66);
  ctx.lineTo(-8 + legA, 84);
  ctx.moveTo(8, 66);
  ctx.lineTo(8 + legB, 84);
  ctx.stroke();

  /* Neck and head. */
  ctx.fillStyle = '#a8642a';
  ctx.fillRect(20, -6, 12, 26);
  ctx.fillStyle = '#d8b48a';
  ctx.beginPath();
  ctx.arc(28, -12, 14, 0, Math.PI * 2);
  ctx.fill();

  /* Beak, wattle and eye. */
  ctx.fillStyle = '#e8a33c';
  ctx.beginPath();
  ctx.moveTo(38, -14);
  ctx.lineTo(54, -9);
  ctx.lineTo(38, -5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d83c2c';
  ctx.beginPath();
  ctx.ellipse(34, -2, 4, 8, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1c1c1c';
  ctx.beginPath();
  ctx.arc(31, -16, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(32, -17, 1.2, 0, Math.PI * 2);
  ctx.fill();

  /* Little red head tuft. */
  ctx.strokeStyle = '#d83c2c';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(26, -25);
  ctx.quadraticCurveTo(24, -32, 30, -33);
  ctx.stroke();

  ctx.restore();
  ctx.globalAlpha = 1;
}
