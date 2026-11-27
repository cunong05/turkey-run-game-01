/* Gobble Run — keyboard and mouse input.
   One job: turn keys and clicks into game intents, nothing else. */
'use strict';

const GobbleInput = (function buildInput() {
  const pressed = new Set();
  const justPressed = new Set();
  let clickX = -1;
  let clickY = -1;
  let clickQueued = false;
  let mouseX = -1;
  let mouseY = -1;

  const JUMP_KEYS = ['Space', 'ArrowUp', 'KeyW'];
  const DUCK_KEYS = ['ArrowDown', 'KeyS'];
  const BOOST_KEYS = ['ArrowRight', 'KeyD'];
  const SLOW_KEYS = ['ArrowLeft', 'KeyA'];

  function keyCodeOf(event) {
    return event.code || event.key;
  }

  function isJumpKey(code) {
    return JUMP_KEYS.indexOf(code) !== -1;
  }

  function isDuckKey(code) {
    return DUCK_KEYS.indexOf(code) !== -1;
  }

  function isBoostKey(code) {
    return BOOST_KEYS.indexOf(code) !== -1;
  }

  function isSlowKey(code) {
    return SLOW_KEYS.indexOf(code) !== -1;
  }

  function onKeyDown(event) {
    const code = keyCodeOf(event);
    if (isJumpKey(code) || isDuckKey(code) || code === 'ArrowLeft' || code === 'ArrowRight') {
      event.preventDefault();
    }
    if (!event.repeat) justPressed.add(code);
    pressed.add(code);
  }

  function onKeyUp(event) {
    pressed.delete(keyCodeOf(event));
  }

  function canvasPoint(canvas, clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function attach(canvas) {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('pointerdown', (event) => {
      const point = canvasPoint(canvas, event.clientX, event.clientY);
      clickX = point.x;
      clickY = point.y;
      clickQueued = true;
      mouseX = point.x;
      mouseY = point.y;
    });
    canvas.addEventListener('pointermove', (event) => {
      const point = canvasPoint(canvas, event.clientX, event.clientY);
      mouseX = point.x;
      mouseY = point.y;
    });
    window.addEventListener('blur', () => {
      pressed.clear();
      justPressed.clear();
    });
  }

  /* True once for the frame the key went down. */
  function wasPressed(code) {
    return justPressed.has(code);
  }

  function isHeld(code) {
    return pressed.has(code);
  }

  function jumpRequested() {
    return JUMP_KEYS.some((code) => justPressed.has(code)) || clickQueued;
  }

  function duckHeld() {
    return DUCK_KEYS.some((code) => pressed.has(code));
  }

  function boostHeld() {
    return BOOST_KEYS.some((code) => pressed.has(code));
  }

  function slowHeld() {
    return SLOW_KEYS.some((code) => pressed.has(code));
  }

  function restartRequested() {
    return justPressed.has('KeyR') || justPressed.has('Enter');
  }

  function startRequested() {
    return justPressed.has('Enter') || justPressed.has('Space') || clickQueued;
  }

  function pauseRequested() {
    return justPressed.has('KeyP');
  }

  function muteRequested() {
    return justPressed.has('KeyM');
  }

  function consumeClick() {
    const point = clickQueued ? { x: clickX, y: clickY } : null;
    clickQueued = false;
    clickX = -1;
    clickY = -1;
    return point;
  }

  function mousePosition() {
    return { x: mouseX, y: mouseY };
  }

  /* Call at the end of each frame: one-frame presses expire. */
  function endFrame() {
    justPressed.clear();
    clickQueued = false;
  }

  return {
    attach,
    wasPressed,
    isHeld,
    jumpRequested,
    duckHeld,
    boostHeld,
    slowHeld,
    restartRequested,
    startRequested,
    pauseRequested,
    muteRequested,
    consumeClick,
    mousePosition,
    endFrame
  };
})();
