/* Gobble Run — game state machine and main loop.
   One job: own the run: title, playing, caught, escaped, pause and score. */
'use strict';

const GobbleGame = (function buildGame() {
  const PHASE = {
    TITLE: 'title',
    PLAYING: 'playing',
    CAUGHT: 'caught',
    ESCAPED: 'escaped'
  };

  let canvas = null;
  let ctx = null;
  let state = null;
  let lastTime = 0;
  let rafId = 0;
  let titleButton = null;
  let endButton = null;
  let frameFrozen = false;

  /* Freeze the frame: keep rendering, stop updating. Used by shots.js. */
  function freeze() {
    frameFrozen = true;
  }

  function unfreeze() {
    frameFrozen = false;
  }

  function freshState(seed) {
    const rand = createSeededRandom(seed || ((Math.random() * 0xffffffff) >>> 0));
    return {
      phase: PHASE.TITLE,
      paused: false,
      score: 0,
      distanceMeters: 0,
      scrollPx: 0,
      lives: GOBBLE_CONFIG.startLives,
      corn: 0,
      farmerGap: GOBBLE_CONFIG.startFarmerGap,
      stageIndex: 0,
      bannerText: '',
      bannerAlpha: 0,
      bannerTimer: 0,
      nowSeconds: 0,
      bestScore: 0,
      turkey: createTurkey(),
      farmer: createFarmer(),
      hazards: createHazardField(rand),
      scenery: createStageScenery(rand),
      rand,
      seed
    };
  }

  function startRun() {
    state.phase = PHASE.PLAYING;
    state.score = 0;
    state.distanceMeters = 0;
    state.scrollPx = 0;
    state.lives = GOBBLE_CONFIG.startLives;
    state.corn = 0;
    state.farmerGap = GOBBLE_CONFIG.startFarmerGap;
    state.stageIndex = 0;
    state.turkey = createTurkey();
    state.farmer = createFarmer();
    state.hazards = createHazardField(state.rand);
    showBanner(stageBannerText(0));
    GobbleAudio.playGobble();
    GobbleAudio.startMusic();
  }

  function showBanner(text) {
    state.bannerText = text;
    state.bannerAlpha = 1;
    state.bannerTimer = 2.2;
  }

  function loseLife(reason) {
    state.lives -= 1;
    if (state.lives <= 0) {
      endRun(PHASE.CAUGHT);
    } else {
      state.farmerGap = 210;
      turkeyStumble(state.turkey, state.nowSeconds);
    }
  }

  function endRun(phase) {
    state.phase = phase;
    if (state.score > state.bestScore) state.bestScore = state.score;
    GobbleAudio.stopMusic();
    if (phase === PHASE.ESCAPED) {
      GobbleAudio.playEscapeFanfare();
    } else {
      GobbleAudio.playCaughtTrombone();
    }
  }

  function checkCollisions() {
    const turkey = state.turkey;
    if (turkeyIsInvulnerable(turkey, state.nowSeconds)) return;
    for (const item of state.hazards.items) {
      if (item.hit || item.eaten) continue;
      if (!turkeyHitsItem(turkey, item)) continue;
      if (item.kind === HAZARD_KIND.CORN) {
        item.eaten = true;
        state.corn += 1;
        state.score += GOBBLE_CONFIG.cornScore;
        state.farmerGap = Math.min(GOBBLE_CONFIG.maxFarmerGap, state.farmerGap + GOBBLE_CONFIG.cornGapGain);
        GobbleAudio.playCornPickup();
        continue;
      }
      item.hit = true;
      state.farmerGap = Math.max(0, state.farmerGap - GOBBLE_CONFIG.stumbleGapLoss);
      loseLife('hit ' + item.kind);
      if (state.phase !== PHASE.PLAYING) return;
    }
  }

  function updatePlaying(dt) {
    const speed = runSpeedForDistance(state.distanceMeters) +
      (GobbleInput.boostHeld() ? GOBBLE_CONFIG.speedBoost : 0) -
      (GobbleInput.slowHeld() ? 90 : 0);
    const clampedSpeed = Math.max(240, speed);

    /* Jump on key or click. */
    if (GobbleInput.jumpRequested()) turkeyTryJump(state.turkey);
    turkeyUpdate(state.turkey, dt, state.nowSeconds, GobbleInput.duckHeld());

    /* The world scrolls; distance and score grow with it. */
    const scrolledPx = clampedSpeed * dt;
    state.scrollPx += scrolledPx;
    state.distanceMeters += scrolledPx / GOBBLE_CONFIG.pixelsPerMeter;
    state.score += (scrolledPx / GOBBLE_CONFIG.pixelsPerMeter) * GOBBLE_CONFIG.meterScore;

    /* Stage changes. */
    const newStage = stageIndexForDistance(state.distanceMeters);
    if (newStage !== state.stageIndex) {
      state.stageIndex = newStage;
      state.score += GOBBLE_CONFIG.stageBonus;
      if (newStage < 3) showBanner(stageBannerText(newStage));
    }

    /* Farmer AI and the gap. */
    farmerUpdate(state.farmer, dt, state.farmerGap, clampedSpeed);
    state.farmerGap -= farmerGapCloseRate(state.farmer, dt);
    state.farmerGap = Math.min(GOBBLE_CONFIG.maxFarmerGap, state.farmerGap);
    if (state.farmerGap <= GOBBLE_CONFIG.farmerCatchGap) {
      loseLife('caught by the farmer');
      if (state.phase !== PHASE.PLAYING) return;
    }

    /* Hazards and scenery. */
    hazardUpdate(state.hazards, dt, state.distanceMeters, clampedSpeed, state.nowSeconds);
    sceneryUpdate(state.scenery, dt, clampedSpeed, state.nowSeconds);
    checkCollisions();

    /* Banner fade. */
    if (state.bannerTimer > 0) {
      state.bannerTimer -= dt;
      state.bannerAlpha = Math.max(0, Math.min(1, state.bannerTimer));
    }

    /* Escape! */
    if (state.distanceMeters >= GOBBLE_CONFIG.escapeDistanceMeters) {
      state.score += GOBBLE_CONFIG.stageBonus;
      endRun(PHASE.ESCAPED);
    }
  }

  function updateTitle(dt) {
    sceneryUpdate(state.scenery, dt, 60, state.nowSeconds);
    if (GobbleInput.startRequested()) {
      const click = GobbleInput.consumeClick();
      if (!click || (titleButton && click.x >= titleButton.x && click.x <= titleButton.x + titleButton.w &&
          click.y >= titleButton.y && click.y <= titleButton.y + titleButton.h)) {
        GobbleAudio.unlock();
        GobbleAudio.playClick();
        startRun();
      }
    }
  }

  function updateEnd(dt) {
    /* Restart by key (R / Enter) or by clicking the RUN AGAIN button. */
    const click = GobbleInput.consumeClick();
    const clickedButton = click !== null && endButton !== null &&
      click.x >= endButton.x && click.x <= endButton.x + endButton.w &&
      click.y >= endButton.y && click.y <= endButton.y + endButton.h;
    if (GobbleInput.restartRequested() || clickedButton) {
      GobbleAudio.playClick();
      startRun();
    }
  }

  function update(dt) {
    state.nowSeconds += dt;
    if (GobbleInput.muteRequested()) GobbleAudio.toggleMute();
    if (frameFrozen) return;
    if (GobbleInput.pauseRequested() && state.phase === PHASE.PLAYING) {
      state.paused = !state.paused;
    }
    if (state.paused) return;
    if (state.phase === PHASE.TITLE) updateTitle(dt);
    else if (state.phase === PHASE.PLAYING) updatePlaying(dt);
    else updateEnd(dt);
  }

  function render() {
    const palette = stagePalette(state.phase === PHASE.TITLE ? 0 : state.stageIndex);
    if (state.phase === PHASE.TITLE) {
      drawBackground(ctx, 0, palette, state.scenery, state.scrollPx);
      titleButton = drawTitleScreen(ctx, state.bestScore, GobbleInput.mousePosition());
      /* The hero turkey stands on the title stage, bottom left. */
      drawTurkey(ctx, state.turkey, state.nowSeconds);
      return;
    }
    drawBackground(ctx, state.stageIndex, palette, state.scenery, state.scrollPx);
    drawHazards(ctx, state.hazards, state.nowSeconds);
    drawFarmer(ctx, state.farmer, state.farmerGap);
    drawTurkey(ctx, state.turkey, state.nowSeconds);
    drawHud(ctx, state);
    drawStageBanner(ctx, state.bannerText, state.bannerAlpha);
    if (state.phase === PHASE.CAUGHT || state.phase === PHASE.ESCAPED) {
      endButton = drawEndScreen(ctx, state, GobbleInput.mousePosition());
    }
    if (state.paused) drawPausedOverlay(ctx);
  }

  function frame(timeMs) {
    const now = timeMs / 1000;
    let dt = lastTime === 0 ? 0.016 : now - lastTime;
    lastTime = now;
    if (dt > 0.05) dt = 0.05;
    if (dt < 0) dt = 0;
    update(dt);
    render();
    GobbleInput.endFrame();
    rafId = window.requestAnimationFrame(frame);
  }

  function boot(canvasId, seed) {
    canvas = document.getElementById(canvasId);
    ctx = canvas.getContext('2d');
    GobbleInput.attach(canvas);
    state = freshState(seed);
    window.GobbleRunState = state;
    window.GobbleRun = { state, startRun, freeze, unfreeze, PHASE };
    rafId = window.requestAnimationFrame(frame);
  }

  return { boot, PHASE };
})();

window.addEventListener('DOMContentLoaded', () => {
  GobbleGame.boot('gameCanvas');
});
