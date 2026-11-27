/* Gobble Run — all sound is synthesized with WebAudio, no audio files.
   One job: gobbles, whooshes, thuds, jingles and a little banjo-ish loop. */
'use strict';

const GobbleAudio = (function buildAudioEngine() {
  let context = null;
  let muted = false;
  let musicTimer = null;
  let musicStep = 0;

  /* The plucky little melody the banjo loop walks through (MIDI notes). */
  const MELODY = [72, 76, 79, 76, 74, 76, 79, 84, 79, 76, 74, 72, 71, 72, 0, 0];
  const BASS = [48, 48, 55, 48, 53, 48, 55, 55, 48, 48, 55, 48, 53, 55, 48, 0];

  function midiToFrequency(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function ensureContext() {
    if (context === null) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      context = new AudioContext();
    }
    if (context.state === 'suspended') context.resume();
    return context;
  }

  function tone(freq, startAt, duration, type, volume, slideTo) {
    if (muted) return;
    const ctx = ensureContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startAt);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + startAt + duration);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + startAt);
    gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + startAt + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + startAt);
    osc.stop(ctx.currentTime + startAt + duration + 0.05);
  }

  function noiseBurst(startAt, duration, volume) {
    if (muted) return;
    const ctx = ensureContext();
    if (!ctx) return;
    const length = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime + startAt);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + duration);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(ctx.currentTime + startAt);
  }

  /* The turkey's signature sound: a fast descending gobble. */
  function playGobble() {
    for (let i = 0; i < 5; i++) {
      tone(620 - i * 70, i * 0.07, 0.09, 'square', 0.12, 420 - i * 60);
    }
  }

  function playJumpWhoosh() {
    noiseBurst(0, 0.18, 0.16);
    tone(300, 0, 0.16, 'sine', 0.08, 720);
  }

  function playThud() {
    tone(140, 0, 0.22, 'sine', 0.28, 55);
    noiseBurst(0, 0.12, 0.2);
  }

  function playCornPickup() {
    tone(880, 0, 0.09, 'triangle', 0.14);
    tone(1318, 0.08, 0.14, 'triangle', 0.14);
  }

  function playAlarm() {
    tone(980, 0, 0.12, 'sawtooth', 0.1, 980);
    tone(980, 0.16, 0.12, 'sawtooth', 0.1, 980);
  }

  function playClick() {
    tone(660, 0, 0.06, 'triangle', 0.12);
  }

  /* Happy escape fanfare. */
  function playEscapeFanfare() {
    const notes = [72, 76, 79, 84, 79, 84, 88];
    notes.forEach((n, i) => tone(midiToFrequency(n), i * 0.13, 0.22, 'triangle', 0.16));
  }

  /* Sad trombone for getting caught. */
  function playCaughtTrombone() {
    const notes = [58, 57, 56, 55];
    notes.forEach((n, i) => tone(midiToFrequency(n), i * 0.32, 0.3, 'sawtooth', 0.12));
  }

  function startMusic() {
    if (musicTimer !== null) return;
    musicTimer = window.setInterval(() => {
      if (muted) return;
      const melodyNote = MELODY[musicStep % MELODY.length];
      const bassNote = BASS[musicStep % BASS.length];
      if (melodyNote) tone(midiToFrequency(melodyNote), 0, 0.16, 'triangle', 0.05);
      if (musicStep % 4 === 0 && bassNote) tone(midiToFrequency(bassNote), 0, 0.3, 'sine', 0.07);
      musicStep++;
    }, 190);
  }

  function stopMusic() {
    if (musicTimer !== null) {
      window.clearInterval(musicTimer);
      musicTimer = null;
    }
  }

  function toggleMute() {
    muted = !muted;
    return muted;
  }

  function isMuted() {
    return muted;
  }

  function unlock() {
    ensureContext();
  }

  return {
    unlock,
    playGobble,
    playJumpWhoosh,
    playThud,
    playCornPickup,
    playAlarm,
    playClick,
    playEscapeFanfare,
    playCaughtTrombone,
    startMusic,
    stopMusic,
    toggleMute,
    isMuted
  };
})();
