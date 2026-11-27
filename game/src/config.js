/* Gobble Run — tuning constants and shared geometry.
   One job: every number the rest of the game agrees on lives here. */
'use strict';

const GOBBLE_CONFIG = {
  canvasWidth: 1280,
  canvasHeight: 720,
  groundY: 600,
  turkeyX: 300,
  pixelsPerMeter: 40,
  escapeDistanceMeters: 3000,
  startLives: 3,
  startFarmerGap: 260,
  maxFarmerGap: 340,
  farmerCatchGap: 0,
  farmerLungeGap: 95,
  baseSpeed: 430,
  maxSpeed: 640,
  speedBoost: 90,
  gravity: 2600,
  jumpVelocity: -980,
  duckHeight: 46,
  standHeight: 86,
  cornScore: 50,
  meterScore: 10,
  stageBonus: 500,
  stumbleGapLoss: 75,
  cornGapGain: 9,
  invulnerableSeconds: 1.6,
  spawnMinGapPx: 460,
  spawnMaxGapPx: 900,
  stageLengthMeters: 1000,
  stageNames: ['THE FARMYARD', 'THE BARN', 'THE KITCHEN', 'THE FOREST GATE'],
  palette: {
    farmyard: {
      skyTop: '#ff9a3d', skyBottom: '#ffd98a', sun: '#fff3b0',
      hillFar: '#c97e2e', hillNear: '#8a5a1e', ground: '#7a4a1c',
      groundTop: '#a06a2c', accent: '#e8632c'
    },
    barn: {
      skyTop: '#5a3a22', skyBottom: '#8a5a34', sun: '#ffdf9e',
      hillFar: '#4a2c16', hillNear: '#3a2210', ground: '#6b4423',
      groundTop: '#8a5a2e', accent: '#d8a03c'
    },
    kitchen: {
      skyTop: '#7a2e1e', skyBottom: '#c96a3a', sun: '#ffe9a8',
      hillFar: '#5a2418', hillNear: '#47201a', ground: '#5e3a24',
      groundTop: '#8a5a34', accent: '#ff7a2c'
    },
    forest: {
      skyTop: '#2e6b34', skyBottom: '#9ed08a', sun: '#fff8c0',
      hillFar: '#2a5a2e', hillNear: '#1e4a22', ground: '#4a6b2e',
      groundTop: '#6b8a3a', accent: '#ffd23c'
    }
  }
};

/* Stage index for a distance in meters: 0 farmyard, 1 barn, 2 kitchen, 3 forest gate. */
function stageIndexForDistance(meters) {
  if (meters < GOBBLE_CONFIG.stageLengthMeters) return 0;
  if (meters < GOBBLE_CONFIG.stageLengthMeters * 2) return 1;
  if (meters < GOBBLE_CONFIG.escapeDistanceMeters) return 2;
  return 3;
}

/* Current run speed in px/s for a distance in meters. */
function runSpeedForDistance(meters) {
  const t = Math.min(1, meters / GOBBLE_CONFIG.escapeDistanceMeters);
  return GOBBLE_CONFIG.baseSpeed + (GOBBLE_CONFIG.maxSpeed - GOBBLE_CONFIG.baseSpeed) * t;
}
