/* Gobble Run — screenshot poses for the maker's own renders.
   One job: put the game into a photogenic state from ?shot=…&seed=…,
   then freeze the frame so the capture is exactly what was posed. */
'use strict';

(function poseForScreenshot() {
  function queryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      shot: params.get('shot') || 'title',
      seed: parseInt(params.get('seed') || '1', 10) || 1
    };
  }

  function placeHazard(state, kind, x, yOverride) {
    const size = hazardSize(kind);
    const item = {
      kind,
      x,
      y: yOverride !== undefined ? yOverride : GOBBLE_CONFIG.groundY - size.h,
      w: size.w,
      h: size.h,
      hit: false,
      eaten: false,
      bobPhase: 0.7,
      spin: 0.4
    };
    state.hazards.items.push(item);
    return item;
  }

  function poseTitle(state) {
    /* Title screen with the turkey standing proud on the farm. */
    state.turkey.y = GOBBLE_CONFIG.groundY;
    state.turkey.onGround = true;
    for (let i = 0; i < 40; i++) sceneryUpdate(state.scenery, 0.05, 60, state.nowSeconds + i * 0.05);
  }

  function posePlay(state) {
    window.GobbleRun.startRun();
    state.distanceMeters = 420;
    state.scrollPx = 420 * GOBBLE_CONFIG.pixelsPerMeter;
    state.score = 1250;
    state.corn = 3;
    state.farmerGap = 88;
    state.stageIndex = 0;
    state.bannerAlpha = 0;
    state.bannerTimer = 0;
    /* Turkey mid-jump over a fence, knife incoming, corn ahead. */
    state.turkey.y = GOBBLE_CONFIG.groundY - 150;
    state.turkey.vy = -220;
    state.turkey.onGround = false;
    placeHazard(state, HAZARD_KIND.CORN, 560, GOBBLE_CONFIG.groundY - 150);
    placeHazard(state, HAZARD_KIND.FENCE, 760);
    placeHazard(state, HAZARD_KIND.KNIFE, 1010, GOBBLE_CONFIG.groundY - 96);
    placeHazard(state, HAZARD_KIND.HAYBALE, 1180);
  }

  function poseKitchen(state) {
    window.GobbleRun.startRun();
    state.distanceMeters = 2150;
    state.scrollPx = 2150 * GOBBLE_CONFIG.pixelsPerMeter;
    state.score = 8430;
    state.corn = 7;
    state.farmerGap = 200;
    state.stageIndex = 2;
    state.bannerText = stageBannerText(2);
    state.bannerAlpha = 0.9;
    state.bannerTimer = 1.8;
    state.turkey.y = GOBBLE_CONFIG.groundY;
    state.turkey.onGround = true;
    state.turkey.runCycle = 2.4;
    placeHazard(state, HAZARD_KIND.CORN, 540, GOBBLE_CONFIG.groundY - 150);
    placeHazard(state, HAZARD_KIND.OVEN, 780);
    placeHazard(state, HAZARD_KIND.KNIFE, 1040, GOBBLE_CONFIG.groundY - 96);
  }

  function poseCaught(state) {
    window.GobbleRun.startRun();
    state.score = 2310;
    state.distanceMeters = 612;
    state.corn = 5;
    state.lives = 0;
    state.bestScore = 2310;
    state.farmerGap = 0;
    state.phase = 'caught';
    GobbleAudio.stopMusic();
  }

  function poseEscaped(state) {
    window.GobbleRun.startRun();
    state.score = 31240;
    state.distanceMeters = 3000;
    state.corn = 18;
    state.lives = 2;
    state.bestScore = 31240;
    state.stageIndex = 3;
    state.phase = 'escaped';
    GobbleAudio.stopMusic();
  }

  window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    /* No ?shot= in the URL means a real player: do not pose or freeze. */
    if (!params.has('shot')) return;
    const { shot, seed } = queryParams();
    const state = window.GobbleRunState;
    if (!state) return;
    state.seed = seed;
    state.rand = createSeededRandom(seed);
    if (shot === 'play') posePlay(state);
    else if (shot === 'kitchen') poseKitchen(state);
    else if (shot === 'caught') poseCaught(state);
    else if (shot === 'escaped') poseEscaped(state);
    else poseTitle(state);
    window.GobbleRun.freeze();
    window.__shotReady = true;
    document.title = 'Gobble Run — shot: ' + shot;
  });
})();
