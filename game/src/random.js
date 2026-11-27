/* Gobble Run — small seeded random number helper.
   One job: deterministic randomness so screenshots and replays agree. */
'use strict';

/* Mulberry32: a tiny fast seeded PRNG. */
function createSeededRandom(seed) {
  let a = seed >>> 0;
  return function nextRandom() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* A float in [min, max) from a random function. */
function randomRange(rand, min, max) {
  return min + rand() * (max - min);
}

/* An integer in [min, max] from a random function. */
function randomInt(rand, min, max) {
  return Math.floor(randomRange(rand, min, max + 1));
}

/* Pick one element of an array at random. */
function randomPick(rand, list) {
  return list[Math.floor(rand() * list.length)];
}

/* Shuffle a copy of an array (Fisher-Yates). */
function shuffledCopy(rand, list) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}
