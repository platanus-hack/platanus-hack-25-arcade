// Platanus Hack 25: Bootfall

// =============================================================================
// ARCADE BUTTON MAPPING - COMPLETE TEMPLATE
// =============================================================================
// Reference: See button-layout.webp at hack.platan.us/assets/images/arcade/
//
// Maps arcade button codes to keyboard keys for local testing.
// Each arcade code can map to multiple keyboard keys (array values).
// The arcade cabinet sends codes like 'P1U', 'P1A', etc. when buttons are pressed.
//
// To use in your game:
//   if (key === 'P1U') { ... }  // Works on both arcade and local (via keyboard)
//
// CURRENT GAME USAGE (Bootfall):
//   - P1L/P1R (Joystick) → Move left/right
//   - P1U → Jump (grounded)
//   - P1A → Shoot down (in air)
//   - START1 → Start/Confirm/Restart
// =============================================================================

const ARCADE_CONTROLS = {
  // ===== PLAYER 1 CONTROLS (Bootfall) =====
  'P1U': ['w'],
  'P1D': ['s'],
  'P1L': ['a'],
  'P1R': ['d'],
  'P1A': ['u'],
  'P1B': ['i'],
  'START1': ['1', 'Enter']
};

// Build reverse lookup: keyboard key → arcade button code
const KEYBOARD_TO_ARCADE = {};
for (const [arcadeCode, keyboardKeys] of Object.entries(ARCADE_CONTROLS)) {
  if (keyboardKeys) {
    // Handle both array and single value
    const keys = Array.isArray(keyboardKeys) ? keyboardKeys : [keyboardKeys];
    keys.forEach(key => {
      KEYBOARD_TO_ARCADE[key] = arcadeCode;
    });
  }
}
// Scenes registry
const GameScene = { key: 'game', create: create, update: update };
const MenuScene = { key: 'menu', create: menuCreate, update: menuUpdate };

function menuCreate() {
  const s = this;
  s.cameras.main.setBackgroundColor('#000000');

  s.add.text(400, 130, 'BOOTFALL', {
    fontSize: '64px', fontFamily: 'Arial, sans-serif', color: '#ffffff', align: 'center'
  }).setOrigin(0.5);

  // Explicit buttons to avoid mapping errors
  s.menuItems = [];
  const mkBtn = (y, label, onClick) => {
    const t = s.add.text(400, y, label, {
      fontSize: '32px', fontFamily: 'Arial, sans-serif', color: '#00ffff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    t.on('pointerover', () => { s.menuIndex = s.menuItems.indexOf(t); updateMenuVisuals(s); });
    t.on('pointerdown', onClick);
    s.menuItems.push(t);
    return t;
  };
  s.btnStart = mkBtn(260, 'Start Game', () => s.scene.start('game'));
  s.btnInstr = mkBtn(330, 'Instructions', () => showInstructions(s));
  s.btnExit  = mkBtn(400, 'Exit', () => showExit(s));
  s.menuIndex = 0; updateMenuVisuals(s);

  s.input.keyboard.on('keydown', (ev) => {
    const key = KEYBOARD_TO_ARCADE[ev.key] || ev.key;
    if (key === 'P1U') { s.menuIndex = (s.menuIndex + s.menuItems.length - 1) % s.menuItems.length; updateMenuVisuals(s); }
    else if (key === 'P1D') { s.menuIndex = (s.menuIndex + 1) % s.menuItems.length; updateMenuVisuals(s); }
    else if (key === 'P1A' || key === 'START1') {
      const actions = [() => s.scene.start('game'), () => showInstructions(s), () => showExit(s)];
      actions[s.menuIndex]();
    }
  });

  // Instructions overlay (hidden by default)
  s.instructionsGroup = s.add.group();
  const iOv = s.add.rectangle(400, 300, 800, 600, 0x000000, 0.86);
  const iT = s.add.text(400, 180, 'Instructions', { fontSize: '40px', fontFamily: 'Arial, sans-serif', color: '#ffff00' }).setOrigin(0.5);
  const iTxt = s.add.text(400, 300,
    'Move: A/D  |  Jump: W\nShoot down: U (ammo 3, recarga al aterrizar)\nPress START to begin',
    { fontSize: '20px', fontFamily: 'Arial, sans-serif', color: '#dddddd', align: 'center' }
  ).setOrigin(0.5);
  const iBack = s.add.text(400, 420, 'Back', { fontSize: '28px', fontFamily: 'Arial, sans-serif', color: '#00ff00' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
  iBack.on('pointerdown', () => hideInstructions(s));
  s.instructionsGroup.addMultiple([iOv, iT, iTxt, iBack]);
  hideInstructions(s);
  s.input.keyboard.on('keydown', (ev) => { const k = KEYBOARD_TO_ARCADE[ev.key] || ev.key; if (s.instructionsVisible && (k === 'P1B' || ev.key === 'Escape' || k === 'P1A')) hideInstructions(s); });

  // Exit overlay (hidden by default)
  s.exitGroup = s.add.group();
  const eOv = s.add.rectangle(400, 300, 800, 600, 0x000000, 0.86);
  const eTxt = s.add.text(400, 280, 'Exit is not available on web', { fontSize: '28px', fontFamily: 'Arial, sans-serif', color: '#ff6666' }).setOrigin(0.5);
  const eHint = s.add.text(400, 330, 'Press START to play or Back to return', { fontSize: '20px', fontFamily: 'Arial, sans-serif', color: '#dddddd' }).setOrigin(0.5);
  const eBack = s.add.text(400, 400, 'Back', { fontSize: '28px', fontFamily: 'Arial, sans-serif', color: '#00ff00' }).setOrigin(0.5).setInteractive({ useHandCursor: true });
  eBack.on('pointerdown', () => hideExit(s));
  s.exitGroup.addMultiple([eOv, eTxt, eHint, eBack]);
  hideExit(s);
  s.input.keyboard.on('keydown', (ev) => {
    const k = KEYBOARD_TO_ARCADE[ev.key] || ev.key;
    if (s.exitVisible && (k === 'P1B' || ev.key === 'Escape' || k === 'P1A')) hideExit(s);
    if (s.exitVisible && k === 'START1') s.scene.start('game');
  });
}

function menuUpdate() {
  // No-op; visuals actualizados por eventos
}

function updateMenuVisuals(s) {
  s.menuItems.forEach((t, i) => {
    const sel = i === s.menuIndex;
    t.setScale(sel ? 1.12 : 1);
    t.setColor(sel ? '#ffffff' : '#00ffff');
  });
}

function showInstructions(s) { s.instructionsVisible = true; s.instructionsGroup.setVisible(true); }
function hideInstructions(s) { s.instructionsVisible = false; s.instructionsGroup.setVisible(false); }
function showExit(s) { s.exitVisible = true; s.exitGroup.setVisible(true); }
function hideExit(s) { s.exitVisible = false; s.exitGroup.setVisible(false); }

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: { default: 'arcade', arcade: { gravity: { y: 900 }, debug: false } },
  scene: [MenuScene, GameScene]
};

const game = new Phaser.Game(config);

// Game variables
let score = 0;
let scoreText;
let gameOver = false;

// Downwell-like variables (M0 prototype)
let player;
let platforms = [];
let bullets = [];
let platformsGroup;
let bulletsGroup;
let hazardsGroup;
let leftHazard;
let rightHazard;
let hazardOn = true;
let hazardTimer = 0;
let hazardInterval = 1200;
let keysState = { left: false, right: false };
let wasOnGround = false;
let ammo = 3;
let maxAmmo = 3;
let maxDepth = 0;
let worldHeight = 1000000;
let speed = 220;
let jump = 300;
let recoil = 240;


function create() {
  const scene = this;
  // Bootfall scene init tone
  playTone(this, 440, 0.1);
  // Reset core state on scene start
  if (this.physics && this.physics.world && this.physics.world.isPaused) this.physics.world.resume();
  gameOver = false;
  score = 0;
  maxDepth = 0;
  ammo = maxAmmo;
  wasOnGround = false;
  keysState.left = keysState.right = false;
  hazardOn = true;
  hazardTimer = 0;
  // Clear runtime arrays
  platforms = [];
  bullets = [];

  // ===== Downwell-like setup =====
  // Physics world bounds (very tall world)
  if (this.physics && this.physics.world) {
    this.physics.world.setBounds(0, 0, 800, worldHeight);
  }

  // Physics groups
  platformsGroup = this.physics.add.staticGroup();
  bulletsGroup = this.physics.add.group();
  hazardsGroup = this.physics.add.staticGroup();

  // Player: white rectangle with dynamic body
  player = this.add.rectangle(400, 50, 18, 24, 0xffffff);
  this.physics.add.existing(player);
  player.body.setCollideWorldBounds(true);
  player.body.setMaxVelocity(300, 700);
  player.body.setDragX(800);

  // Seed initial platforms
  seedPlatforms(this, 150, this.cameras.main.scrollY + 800);
  // Colliders (single)
  this.physics.add.collider(player, platformsGroup);
  this.physics.add.collider(bulletsGroup, platformsGroup, (b /* bullet */, _p /* platform */) => {
    if (b && b.destroy) b.destroy();
  });

  // Side hazards (prevent safe wall-riding)
  setupHazards(this);
  this.physics.add.overlap(player, hazardsGroup, (_pl, _hz) => {
    if (hazardOn) endGame(this);
  });

  // Camera follow (soft)
  this.cameras.main.startFollow(player, false, 0.1, 0.1);
  this.cameras.main.setBackgroundColor('#000000');

  // HUD
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '24px',
    fontFamily: 'Arial, sans-serif',
    color: '#00ff00'
  }).setScrollFactor(0);
  this.ammoText = this.add.text(16, 44, 'Ammo: ' + ammo, {
    fontSize: '20px',
    fontFamily: 'Arial, sans-serif',
    color: '#ffff00'
  }).setScrollFactor(0);

  // Input handlers (use arcade mapping)
  this.input.keyboard.on('keydown', (event) => {
    const key = KEYBOARD_TO_ARCADE[event.key] || event.key;
    if (gameOver && (key === 'P1A' || key === 'START1')) {
      restartGame(scene);
      return;
    }
    if (key === 'P1L') keysState.left = true;
    if (key === 'P1R') keysState.right = true;
    if (key === 'P1U' && player.body.blocked.down) {
      player.body.setVelocityY(-jump);
      playTone(scene, 523, 0.05);
    }
    if (key === 'P1A' && !player.body.blocked.down && ammo > 0) {
      fireBullet(scene);
    }
  });

  this.input.keyboard.on('keyup', (event) => {
    const key = KEYBOARD_TO_ARCADE[event.key] || event.key;
    if (key === 'P1L') keysState.left = false;
    if (key === 'P1R') keysState.right = false;
  });
}


function update(_time, _delta) {
  if (gameOver) return;

  // Horizontal control
  if (player && player.body) {
    let vx = 0;
    if (keysState.left) vx -= speed;
    if (keysState.right) vx += speed;
    player.body.setVelocityX(vx);

    // Land detection to reset ammo
    const onGround = player.body.blocked.down;
    if (onGround && !wasOnGround) {
      ammo = maxAmmo;
      if (this.ammoText) this.ammoText.setText('Ammo: ' + ammo);
      playTone(this, 440, 0.05);
    }
    wasOnGround = onGround;

    // Score by max depth
    if (player.y > maxDepth) {
      maxDepth = player.y;
      if (scoreText) scoreText.setText('Score: ' + Math.floor(maxDepth));
    }

  }

  // Ensure platforms fill below camera; recycle those far above
  const cam = this.cameras.main;
  // Camera: only descend, never move up (Downwell-like)
  cam.scrollY = Math.max(cam.scrollY, player.y - 260);
  seedPlatforms(this, cam.scrollY + 100, cam.scrollY + 800);
  for (let i = 0; i < platforms.length; i++) {
    const p = platforms[i];
    if (p.y < cam.scrollY - 60) {
      // move platform below
      const maxY = platforms.reduce((m, o) => Math.max(m, o.y), cam.scrollY + 300);
      positionPlatform(p, maxY + Phaser.Math.Between(70, 120));
      if (p.body && p.body.updateFromGameObject) p.body.updateFromGameObject();
    }
  }

  // Cleanup bullets below view
  bullets = bullets.filter(b => {
    if (!b.active) return false;
    if (b.y > cam.scrollY + 700) {
      b.destroy();
      return false;
    }
    return true;
  });

  // Game over if player moves above the visible area (top-out)
  if (player && player.y < cam.scrollY - 20) {
    endGame(this);
    return;
  }

  // Hazards follow camera and toggle damage
  updateHazards(this);
  hazardTimer += _delta || 0;
  if (hazardTimer >= hazardInterval) {
    hazardTimer = 0;
    hazardOn = !hazardOn;
    hazardInterval = Phaser.Math.Between(900, 1800);
    setHazardVisual(this);
  }
}


function endGame(scene) {
  gameOver = true;
  playTone(scene, 220, 0.5);
  // Completely stop gameplay
  if (scene.physics && scene.physics.world) scene.physics.world.pause();
  if (scene.cameras && scene.cameras.main) scene.cameras.main.stopFollow();

  // Semi-transparent overlay
  const overlay = scene.add.graphics();
  overlay.fillStyle(0x000000, 0.7);
  overlay.fillRect(0, 0, 800, 600);
  overlay.setDepth(9999);
  overlay.setScrollFactor(0);

  const cam = scene.cameras.main;
  const cx = player ? (player.x - cam.scrollX) : 400;
  const cy = player ? (player.y - cam.scrollY) : 300;

  // Game Over title with glow effect
  const gameOverText = scene.add.text(cx, cy, 'GAME OVER', {
    fontSize: '64px',
    fontFamily: 'Arial, sans-serif',
    color: '#ff0000',
    align: 'center',
    stroke: '#ff6666',
    strokeThickness: 8
  }).setOrigin(0.5);
  gameOverText.setDepth(10000);
  gameOverText.setScrollFactor(0);

  // Pulsing animation for game over text
  scene.tweens.add({
    targets: gameOverText,
    scale: { from: 1, to: 1.1 },
    alpha: { from: 1, to: 0.8 },
    duration: 800,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });

  // Score display
  const finalScoreText = scene.add.text(cx, cy + 100, 'TOTAL SCORE: ' + Math.floor(maxDepth), {
    fontSize: '36px',
    fontFamily: 'Arial, sans-serif',
    color: '#00ffff',
    align: 'center',
    stroke: '#000000',
    strokeThickness: 4
  }).setOrigin(0.5);
  finalScoreText.setDepth(10000);
  finalScoreText.setScrollFactor(0);

  // Restart instruction with subtle animation
  const restartText = scene.add.text(cx, cy + 180, 'Press Button A or START to Restart', {
    fontSize: '24px',
    fontFamily: 'Arial, sans-serif',
    color: '#ffff00',
    align: 'center',
    stroke: '#000000',
    strokeThickness: 3
  }).setOrigin(0.5);
  restartText.setDepth(10000);
  restartText.setScrollFactor(0);

  // Blinking animation for restart text
  scene.tweens.add({
    targets: restartText,
    alpha: { from: 1, to: 0.3 },
    duration: 600,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });

  // Main Menu button
  const menuBtn = scene.add.text(cx, cy + 240, 'Main Menu', {
    fontSize: '28px',
    fontFamily: 'Arial, sans-serif',
    color: '#ffffff',
    align: 'center',
    stroke: '#000000',
    strokeThickness: 3
  }).setOrigin(0.5).setInteractive({ useHandCursor: true });
  menuBtn.on('pointerdown', () => {
    scene.scene.start('menu');
  });
  menuBtn.setDepth(10000);
  menuBtn.setScrollFactor(0);
}

function restartGame(scene) {
  // Minimal reset and full scene restart to avoid stale references
  gameOver = false;
  score = 0;
  maxDepth = 0;
  ammo = maxAmmo;
  wasOnGround = false;
  keysState.left = keysState.right = false;
  // Clear globals to force re-creation on next create()
  scoreText = null;
  platforms = [];
  bullets = [];
  scene.scene.restart();
}

// ===== Helper functions for Downwell-like prototype =====
function seedPlatforms(scene, fromY, toY) {
  let maxExistingY = platforms.length ? Math.max(...platforms.map(p => p.y)) : fromY - 100;
  let y = Math.max(fromY, maxExistingY + 70);
  while (y < toY) {
    const p = createPlatform(scene, y);
    platforms.push(p);
    y += Phaser.Math.Between(70, 120);
  }
}

function createPlatform(scene, y) {
  const width = Phaser.Math.Between(70, 180);
  const x = Phaser.Math.Between(40, 760 - width);
  const rect = scene.add.rectangle(x + width / 2, y, width, 12, 0x00aaff);
  scene.physics.add.existing(rect, true); // static body
  if (rect.body) {
    // One-way: collide only on top face
    rect.body.checkCollision.up = true;
    rect.body.checkCollision.down = false;
    rect.body.checkCollision.left = false;
    rect.body.checkCollision.right = false;
  }
  if (platformsGroup) platformsGroup.add(rect);
  if (rect.body && rect.body.updateFromGameObject) rect.body.updateFromGameObject();
  return rect;
}

function positionPlatform(rect, y) {
  const width = Phaser.Math.Between(70, 180);
  const x = Phaser.Math.Between(40, 760 - width);
  rect.setSize(width, 12);
  rect.displayWidth = width;
  rect.displayHeight = 12;
  rect.x = x + width / 2;
  rect.y = y;
  if (rect.body && rect.body.updateFromGameObject) rect.body.updateFromGameObject();
}

function fireBullet(scene) {
  const b = scene.add.rectangle(player.x, player.y + 16, 4, 8, 0xff4444);
  scene.physics.add.existing(b);
  b.body.setVelocityY(550);
  b.body.setAllowGravity(false);
  if (bulletsGroup) bulletsGroup.add(b);
  bullets.push(b);
  ammo -= 1;
  if (scene.ammoText) scene.ammoText.setText('Ammo: ' + ammo);
  // Recoil upwards
  player.body.setVelocityY(Math.min(player.body.velocity.y - recoil, -recoil));
  playTone(scene, 880, 0.05);
}

// ===== Side hazard helpers =====
function setupHazards(scene) {
  const cam = scene.cameras.main;
  // Left wall
  leftHazard = scene.add.rectangle(6, cam.scrollY + 300, 12, 640, 0xff2222, hazardOn ? 0.6 : 0.12);
  scene.physics.add.existing(leftHazard, true);
  hazardsGroup.add(leftHazard);
  if (leftHazard.body && leftHazard.body.updateFromGameObject) leftHazard.body.updateFromGameObject();
  // Right wall
  rightHazard = scene.add.rectangle(794, cam.scrollY + 300, 12, 640, 0xff2222, hazardOn ? 0.6 : 0.12);
  scene.physics.add.existing(rightHazard, true);
  hazardsGroup.add(rightHazard);
  if (rightHazard.body && rightHazard.body.updateFromGameObject) rightHazard.body.updateFromGameObject();
}

function updateHazards(scene) {
  const cam = scene.cameras.main;
  if (leftHazard) {
    leftHazard.y = cam.scrollY + 300;
    if (leftHazard.body && leftHazard.body.updateFromGameObject) leftHazard.body.updateFromGameObject();
  }
  if (rightHazard) {
    rightHazard.y = cam.scrollY + 300;
    if (rightHazard.body && rightHazard.body.updateFromGameObject) rightHazard.body.updateFromGameObject();
  }
}

function setHazardVisual(_scene) {
  const a = hazardOn ? 0.6 : 0.12;
  if (leftHazard) leftHazard.setFillStyle(0xff2222, a);
  if (rightHazard) rightHazard.setFillStyle(0xff2222, a);
}

function playTone(scene, frequency, duration) {
  const audioContext = scene.sound.context;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = 'square';

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}
