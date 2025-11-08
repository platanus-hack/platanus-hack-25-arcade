// Platanus Hack 25: CHAINFALL

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
// CURRENT GAME USAGE (CHAINFALL):
//   - P1L/P1R (Joystick) → Move left/right
//   - P1U → Jump (grounded)
//   - P1A → Shoot down (in air)
//   - START1 → Start/Confirm/Restart
// =============================================================================

const ARCADE_CONTROLS = {
  // ===== PLAYER 1 CONTROLS (CHAINFALL) =====
  'P1U': ['w'],
  'P1D': ['s'],
  'P1L': ['a'],
  'P1R': ['d'],
  'P1A': ['e'],
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

let currentShootKey = 'e';
let currentRayKey = 'i';

function menuCreate() {
  const s = this;
  s.cameras.main.setBackgroundColor('#000000');
  
  // Initialize overlay visibility flags
  s.instructionsVisible = false;
  s.controlsVisible = false;

  // Stylish animated title
  const titleText = s.add.text(400, 130, 'CHAINFALL', {
    fontSize: '72px', 
    fontFamily: 'Arial, sans-serif', 
    color: '#ffffff', 
    align: 'center',
    stroke: '#00ffff',
    strokeThickness: 4
  }).setOrigin(0.5);
  
  // Title pulsing animation
  s.tweens.add({
    targets: titleText,
    scale: { from: 1, to: 1.05 },
    duration: 1500,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
  
  // Subtitle
  const subtitleText = s.add.text(400, 200, 'Chain your combos as you fall', {
    fontSize: '20px',
    fontFamily: 'Arial, sans-serif',
    color: '#00ffff',
    align: 'center',
    style: 'italic'
  }).setOrigin(0.5).setAlpha(0.8);

  // Explicit buttons to avoid mapping errors
  s.menuItems = [];
  s.menuBorders = [];
  const mkBtn = (y, label, onClick) => {
    // Button background/border
    const border = s.add.rectangle(400, y, 280, 50, 0x001a1a, 0.5);
    border.setStrokeStyle(2, 0x00ffff, 0.8);
    s.menuBorders.push(border);
    
    // Button text
    const t = s.add.text(400, y, label, {
      fontSize: '32px', 
      fontFamily: 'Arial, sans-serif', 
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    t.on('pointerover', () => { s.menuIndex = s.menuItems.indexOf(t); updateMenuVisuals(s); });
    t.on('pointerdown', onClick);
    s.menuItems.push(t);
    return t;
  };
  s.btnStart = mkBtn(260, 'Start Game', () => s.scene.start('game'));
  s.btnInstr = mkBtn(330, 'Instructions', () => showInstructions(s));
  s.btnExit  = mkBtn(400, 'Controls', () => showControls(s));
  s.menuIndex = 0; updateMenuVisuals(s);

  s.input.keyboard.on('keydown', (ev) => {
    const key = KEYBOARD_TO_ARCADE[ev.key] || ev.key;
    if (s.instructionsVisible || s.controlsVisible) { return; }
    if (key === 'P1U') { s.menuIndex = (s.menuIndex + s.menuItems.length - 1) % s.menuItems.length; updateMenuVisuals(s); }
    else if (key === 'P1D') { s.menuIndex = (s.menuIndex + 1) % s.menuItems.length; updateMenuVisuals(s); }
    else if (key === 'P1A') {
      const actions = [() => s.scene.start('game'), () => showInstructions(s), () => showControls(s)];
      actions[s.menuIndex]();
    }
  });

  // Instructions overlay (hidden by default) - visual with images
  s.instructionsGroup = s.add.group();
  const iOv = s.add.rectangle(400, 300, 800, 600, 0x000000, 0.86);
  const iT = s.add.text(400, 140, 'Instructions', { fontSize: '40px', fontFamily: 'Arial, sans-serif', color: '#ffff00' }).setOrigin(0.5);
  
  // Back button with border
  const iBackBorder = s.add.rectangle(400, 520, 180, 50, 0x003300, 0.6);
  iBackBorder.setStrokeStyle(2, 0x00ff00, 0.8);
  const iBack = s.add.text(400, 520, 'Back', { 
    fontSize: '28px', 
    fontFamily: 'Arial, sans-serif', 
    color: '#00ff00',
    stroke: '#000000',
    strokeThickness: 3
  }).setOrigin(0.5).setInteractive({ useHandCursor: true });
  iBack.on('pointerdown', () => hideInstructions(s));

  // Graphics helper
  const g = s.add.graphics();
  g.lineStyle(2, 0x00ffff, 1);

  // Section: Move / Jump (left)
  const moveTitle = s.add.text(140, 200, 'MOVE / JUMP', { fontSize: '18px', fontFamily: 'Arial, sans-serif', color: '#ffffff' }).setOrigin(0.5);
  const keyA = s.add.rectangle(110, 240, 34, 34, 0x111111);
  const keyD = s.add.rectangle(170, 240, 34, 34, 0x111111);
  const keyW = s.add.rectangle(140, 190, 34, 34, 0x111111);
  const txtA = s.add.text(110, 240, 'A', { fontSize: '20px', fontFamily: 'Arial, sans-serif', color: '#00ffff' }).setOrigin(0.5);
  const txtD = s.add.text(170, 240, 'D', { fontSize: '20px', fontFamily: 'Arial, sans-serif', color: '#00ffff' }).setOrigin(0.5);
  const txtW = s.add.text(140, 190, 'W', { fontSize: '20px', fontFamily: 'Arial, sans-serif', color: '#00ffff' }).setOrigin(0.5);
  // Arrows left/right
  g.fillStyle(0x00ffff, 1);
  g.fillTriangle(90, 240, 100, 232, 100, 248);
  g.fillTriangle(190, 240, 180, 232, 180, 248);
  // Up arrow for jump
  g.fillTriangle(140, 170, 132, 180, 148, 180);

  const enemyYValue = 346;

  // Section: Shooting (center)
  const centerTitle = s.add.text(400, 200, 'SHOOT DOWN', { fontSize: '18px', fontFamily: 'Arial, sans-serif', color: '#ffffff' }).setOrigin(0.5);
  const plat = s.add.rectangle(400, 360, 160, 12, 0x00aaff);
  const pRect = s.add.rectangle(400, enemyYValue - 12 - 22 - 66, 18, 24, 0xffffff);
  // Red bullets going downward (airborne, above platform)
  // Keep bottoms <= platform top (~354)
  const bullet = s.add.rectangle(400, enemyYValue - 12 - 22, 6, 14, 0xff4444); // bottom 343
  const bullet2 = s.add.rectangle(400, enemyYValue - 12 - 22 - 26, 6, 14, 0xff4444); // bottom 349
  // Red enemy target
  const enemy1 = s.add.rectangle(400, enemyYValue, 30, 16, 0xff2222);
  // Bullet arrow
  g.fillStyle(0xff4444, 1);
  g.fillTriangle(400, 390, 392, 378, 408, 378);
  const shootTxt = s.add.text(400, 420, 'Press ' + currentShootKey.toUpperCase() + ' to shoot down (in air)', { fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#dddddd' }).setOrigin(0.5);
  const landTxt = s.add.text(400, 444, 'Landing reloads to max ammo', { fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa' }).setOrigin(0.5);

  // Section: Combo (right)
  const comboTitle = s.add.text(660, 200, 'COMBO', { fontSize: '18px', fontFamily: 'Arial, sans-serif', color: '#ffffff' }).setOrigin(0.5);
  const comboPlat = s.add.rectangle(660, 360, 160, 12, 0x00aaff);
  const comboPlayer = s.add.rectangle(660, enemyYValue - 12 - 22 - 66, 18, 24, 0xffffff);
  // Blue bullets (bonus) going downward (airborne, above platform)
  const bb1 = s.add.rectangle(660, enemyYValue - 12 - 22, 6, 14, 0x00ffff); // bottom 343
  const bb2 = s.add.rectangle(660, enemyYValue - 12 - 22 - 26, 6, 14, 0x00ffff); // bottom 349
  // Cyan arrow to emphasize direction
  g.fillStyle(0x00ffff, 1);
  g.fillTriangle(660, 390, 652, 378, 668, 378);
  // Red enemy target for combo
  const enemy2 = s.add.rectangle(660, enemyYValue, 30, 16, 0xff2222);
  const comboInfo1 = s.add.text(660, 420, 'Air kills build combo', { fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#dddddd' }).setOrigin(0.5);
  const comboInfo2 = s.add.text(660, 444, 'Gain blue bullets; landing resets extras', { fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa' }).setOrigin(0.5);

  s.instructionsGroup.addMultiple([
    iOv, iT, iBackBorder, iBack,
    moveTitle, keyA, keyD, keyW, txtA, txtD, txtW,
    centerTitle, plat, pRect, bullet, bullet2, enemy1, shootTxt, landTxt,
    comboTitle, comboPlat, comboPlayer, bb1, bb2, enemy2, comboInfo1, comboInfo2,
    g
  ]);
  // Panel items for keyboard focus
  s.instrItems = [iBack];
  s.instrBorders = [iBackBorder];
  s.instrIndex = 0;
  updateInstrVisuals(s);
  hideInstructions(s);

  // Panel key handling: Instructions
  s.input.keyboard.on('keydown', (ev) => {
    if (!s.instructionsVisible) return;
    if (s.instructionsJustOpened) return; // Prevent immediate close
    const raw = ev.key;
    const key = KEYBOARD_TO_ARCADE[raw] || raw;
    
    // Close on Escape or P1B
    if (raw === 'Escape' || key === 'P1B') {
      hideInstructions(s);
      return;
    }
    
    // Navigation keys
    if (key === 'P1U' || key === 'P1D' || key === 'P1L' || key === 'P1R') {
      s.instrIndex = 0; // Only one item, keep highlighted
      updateInstrVisuals(s);
      return;
    }
    
    // Confirm with P1A
    if (key === 'P1A') {
      hideInstructions(s);
    }
  });

  // Controls overlay (hidden by default)
  s.controlsGroup = s.add.group();
  const cOv = s.add.rectangle(400, 300, 800, 600, 0x000000, 0.86);
  const cT = s.add.text(400, 150, 'Controls', { fontSize: '40px', fontFamily: 'Arial, sans-serif', color: '#ffff00' }).setOrigin(0.5);
  s.controlsInfo = s.add.text(400, 200,
    'Select an item and press a key to rebind',
    { fontSize: '18px', fontFamily: 'Arial, sans-serif', color: '#dddddd', align: 'center' }
  ).setOrigin(0.5);

  // Normal Shoot row
  const cShootBorder = s.add.rectangle(400, 270, 360, 46, 0x001a1a, 0.5);
  cShootBorder.setStrokeStyle(2, 0x00ffff, 0.8);
  const cShoot = s.add.text(400, 270, 'Normal Shoot: ' + currentShootKey.toUpperCase(), {
    fontSize: '28px', fontFamily: 'Arial, sans-serif', color: '#00ffff', stroke: '#000000', strokeThickness: 2
  }).setOrigin(0.5).setInteractive({ useHandCursor: true });
  cShoot.on('pointerover', () => { s.controlsIndex = 0; updateControlsVisuals(s); });

  // Ray Gun row
  const cRayBorder = s.add.rectangle(400, 330, 360, 46, 0x1a1a00, 0.5);
  cRayBorder.setStrokeStyle(2, 0xEEF527, 0.8);
  const cRay = s.add.text(400, 330, 'Ray Gun: ' + currentRayKey.toUpperCase(), {
    fontSize: '28px', fontFamily: 'Arial, sans-serif', color: '#EEF527', stroke: '#000000', strokeThickness: 2
  }).setOrigin(0.5).setInteractive({ useHandCursor: true });
  cRay.on('pointerover', () => { s.controlsIndex = 1; updateControlsVisuals(s); });

  // Back button with border
  const cBackBorder = s.add.rectangle(400, 420, 180, 50, 0x003300, 0.6);
  cBackBorder.setStrokeStyle(2, 0x00ff00, 0.8);
  const cBack = s.add.text(400, 420, 'Back', { 
    fontSize: '28px', 
    fontFamily: 'Arial, sans-serif', 
    color: '#00ff00',
    stroke: '#000000',
    strokeThickness: 3
  }).setOrigin(0.5).setInteractive({ useHandCursor: true });
  cBack.on('pointerover', () => { s.controlsIndex = 2; updateControlsVisuals(s); });
  cBack.on('pointerdown', () => hideControls(s));

  s.controlsGroup.addMultiple([cOv, cT, s.controlsInfo, cShootBorder, cShoot, cRayBorder, cRay, cBackBorder, cBack]);
  // Panel items for keyboard focus
  s.controlsItems = [cShoot, cRay, cBack];
  s.controlsBorders = [cShootBorder, cRayBorder, cBackBorder];
  s.controlsIndex = 0;
  updateControlsVisuals(s);
  hideControls(s);

  // Panel key handling: Controls (unified handler)
  s.input.keyboard.on('keydown', (ev) => {
    if (!s.controlsVisible) return;
    if (s.controlsJustOpened) return; // Prevent immediate close
    const raw = ev.key;
    const key = KEYBOARD_TO_ARCADE[raw] || raw;
    
    // Close on Escape or P1B
    if (raw === 'Escape' || key === 'P1B') { 
      hideControls(s); 
      return; 
    }
    
    // Navigation keys
    if (key === 'P1U') {
      s.controlsIndex = (s.controlsIndex + s.controlsItems.length - 1) % s.controlsItems.length;
      updateControlsVisuals(s);
      return;
    }
    if (key === 'P1D') {
      s.controlsIndex = (s.controlsIndex + 1) % s.controlsItems.length;
      updateControlsVisuals(s);
      return;
    }
    
    // Confirm with P1A on Back
    if (key === 'P1A' && s.controlsIndex === 2) {
      hideControls(s);
      return;
    }
    
    // Rebind selected action with any single letter
    if (raw && raw.length === 1) {
      const k = raw.toLowerCase();
      if (s.controlsIndex === 0) {
        rebindShootKey(k);
        // Update label
        if (s.controlsItems[0] && s.controlsItems[0].setText) s.controlsItems[0].setText('Normal Shoot: ' + currentShootKey.toUpperCase());
      } else if (s.controlsIndex === 1) {
        rebindRayKey(k);
        if (s.controlsItems[1] && s.controlsItems[1].setText) s.controlsItems[1].setText('Ray Gun: ' + currentRayKey.toUpperCase());
      }
      return;
    }
  });
}

function menuUpdate() {
  // No-op; visuals actualizados por eventos
}

function updateMenuVisuals(s) {
  s.menuItems.forEach((t, i) => {
    const sel = i === s.menuIndex;
    const border = s.menuBorders[i];
    
    // Text effects
    t.setScale(sel ? 1.15 : 1);
    t.setColor(sel ? '#ffffff' : '#00ffff');
    
    // Border effects
    if (border) {
      border.setScale(sel ? 1.08 : 1);
      border.setStrokeStyle(sel ? 3 : 2, sel ? 0xffffff : 0x00ffff, sel ? 1 : 0.8);
      border.setFillStyle(0x001a1a, sel ? 0.8 : 0.5);
    }
  });
}

function updateInstrVisuals(s) {
  if (!s.instrItems) return;
  s.instrItems.forEach((t, i) => {
    const sel = i === s.instrIndex;
    const border = s.instrBorders ? s.instrBorders[i] : null;
    
    // Enhanced visual feedback for Back button
    t.setScale(sel ? 1.25 : 1);
    t.setColor(sel ? '#ffff00' : '#00ff00');
    t.setStroke(sel ? '#ffffff' : '#000000', sel ? 4 : 3);
    
    // Border effects
    if (border) {
      border.setScale(sel ? 1.12 : 1);
      border.setStrokeStyle(sel ? 3 : 2, sel ? 0xffff00 : 0x00ff00, sel ? 1 : 0.8);
      border.setFillStyle(0x003300, sel ? 0.9 : 0.6);
    }
  });
}

function updateControlsVisuals(s) {
  if (!s.controlsItems) return;
  s.controlsItems.forEach((t, i) => {
    const sel = i === s.controlsIndex;
    const border = s.controlsBorders ? s.controlsBorders[i] : null;
    
    // Enhanced visual feedback for Back button
    t.setScale(sel ? 1.25 : 1);
    t.setColor(sel ? '#ffff00' : '#00ff00');
    t.setStroke(sel ? '#ffffff' : '#000000', sel ? 4 : 3);
    
    // Border effects
    if (border) {
      border.setScale(sel ? 1.12 : 1);
      border.setStrokeStyle(sel ? 3 : 2, sel ? 0xffff00 : 0x00ff00, sel ? 1 : 0.8);
      border.setFillStyle(0x003300, sel ? 0.9 : 0.6);
    }
  });
}

function showInstructions(s) { 
  s.instructionsVisible = true; 
  s.instructionsGroup.setVisible(true); 
  s.instrIndex = 0; 
  updateInstrVisuals(s);
  s.instructionsJustOpened = true;
  setTimeout(() => { s.instructionsJustOpened = false; }, 50);
}
function hideInstructions(s) { 
  s.instructionsVisible = false; 
  s.instructionsGroup.setVisible(false); 
}
function showControls(s) { 
  s.controlsVisible = true; 
  s.controlsGroup.setVisible(true); 
  s.controlsIndex = 0; 
  updateControlsVisuals(s);
  s.controlsJustOpened = true;
  setTimeout(() => { s.controlsJustOpened = false; }, 50);
}
function hideControls(s) { 
  s.controlsVisible = false; 
  s.controlsGroup.setVisible(false); 
}

function rebindShootKey(newKey) {
  const k = (newKey || '').toLowerCase();
  // Only single letter a-z and not reserved or conflicting
  if (!/^[a-z]$/.test(k)) return;
  if (k === 'w' || k === 'a' || k === 's' || k === 'd') return;
  if (k === currentRayKey) return;
  // Remove previous mapping for P1A
  if (currentShootKey && KEYBOARD_TO_ARCADE[currentShootKey] === 'P1A') {
    delete KEYBOARD_TO_ARCADE[currentShootKey];
  }
  currentShootKey = k;
  ARCADE_CONTROLS['P1A'] = [k];
  KEYBOARD_TO_ARCADE[k] = 'P1A';
}

function rebindRayKey(newKey) {
  const k = (newKey || '').toLowerCase();
  // Only single letter a-z and not reserved or conflicting
  if (!/^[a-z]$/.test(k)) return;
  if (k === 'w' || k === 'a' || k === 's' || k === 'd') return;
  if (k === currentShootKey) return;
  // Remove previous mapping for P1B
  if (currentRayKey && KEYBOARD_TO_ARCADE[currentRayKey] === 'P1B') {
    delete KEYBOARD_TO_ARCADE[currentRayKey];
  }
  currentRayKey = k;
  ARCADE_CONTROLS['P1B'] = [k];
  KEYBOARD_TO_ARCADE[k] = 'P1B';
}

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
let enemiesGroup;
let debugHitboxes = false;
let debugGraphics;
// Combo system
let comboCount = 0;
let comboMultiplier = 1;
let comboText;

// Charge Shot state
let isCharging = false;
let chargeStartTime = 0;
let chargeVisuals = null;       // grupo para visuales de canalización
let chargeToneInterval = null;  // intervalo de audio
let slowMoTween = null;         // tween de time scale

// ===== Jumper balance constants =====
const JUMPER_SPAWN_CHANCE = 0.15;          // 15% por enemigo spawneado
const JUMPER_COOLDOWN_MIN_MS = 1200;       // ms
const JUMPER_COOLDOWN_MAX_MS = 2000;       // ms
const JUMPER_JUMP_VEL_Y = -250;            // salto vertical (negativo = hacia arriba)

// ===== Ray Gun (Charge Shot) constants =====
const CHARGE_THRESHOLD_MS = 1000;          // ⚠️ MODIFICA ESTO: tiempo en ms para activar Ray Gun (1 segundo por defecto)
const CHARGE_COST_AMMO = 2;                // munición requerida
const CHARGE_PIERCE_COUNT = 2;             // enemigos que atraviesa el rayo
const CHARGE_SLOWMO_SCALE = 3.33;          // ⚠️ escala de tiempo durante carga (3.33 = ~30% velocidad, valores MAYORES = más lento)
const CHARGE_RAY_MAX_DISTANCE = 2000;      // ⚠️ MODIFICA ESTO: distancia máxima del rayo (px)
const CHARGE_RAY_VISUAL_DURATION = 200;    // duración visual del rayo (ms)
const CHARGE_RAMP_IN_MS = 150;             // duración de ramp-in a slow-mo
const CHARGE_RAMP_OUT_MS = 180;            // duración de ramp-out desde slow-mo

function create() {
  const scene = this;
  // CHAINFALL scene init tone
  playTone(this, 440, 0.1);
  
  // MUSIC
  // playBackgroundMusic(this);
  // Reset core state on scene start
  if (this.physics && this.physics.world && this.physics.world.isPaused) this.physics.world.resume();
  
  // Asegurar que time scale está en 1.0 al inicio
  if (this.physics && this.physics.world) {
    this.physics.world.timeScale = 1.0;
  }
  
  gameOver = false;
  score = 0;
  maxDepth = 0;
  ammo = maxAmmo;
  wasOnGround = false;
  keysState.left = keysState.right = false;
  hazardOn = true;
  hazardTimer = 0;
  
  // Reset charge shot state
  isCharging = false;
  chargeStartTime = 0;
  chargeVisuals = null;
  chargeToneInterval = null;
  slowMoTween = null;
  
  // Reset combo state
  comboCount = 0;
  comboMultiplier = 1;
  
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
  enemiesGroup = this.physics.add.group();

  // Safe starting platform (left side, yellow, no enemy spawns)
  const startWidth = 160;
  const startX = 40 + startWidth / 2;
  const startY = 140;
  const startPlat = this.add.rectangle(startX, startY, startWidth, 12, 0xffff00);
  startPlat.setStrokeStyle(2, 0xffaa00, 0.9); // Orange stroke for emphasis
  this.physics.add.existing(startPlat, true);
  if (startPlat.body) {
    startPlat.body.checkCollision.up = true;
    startPlat.body.checkCollision.down = true;
    startPlat.body.checkCollision.left = true;
    startPlat.body.checkCollision.right = true;
    if (startPlat.body.updateFromGameObject) startPlat.body.updateFromGameObject();
  }
  startPlat.enemies = [];
  startPlat.noEnemies = true;
  if (platformsGroup) platformsGroup.add(startPlat);
  platforms.push(startPlat);

  // Player: white rectangle with dynamic body and glow effect
  player = this.add.rectangle(startX, startY - 6 - 12, 18, 24, 0xffffff);
  player.setStrokeStyle(2, 0x00ffff, 0.6); // Cyan glow
  this.physics.add.existing(player);
  if (player.body && player.body.setSize) player.body.setSize(player.displayWidth, player.displayHeight, true);
  player.body.setCollideWorldBounds(true);
  player.body.setMaxVelocity(300, 700);
  player.body.setDragX(800);
  player.body.enable = true;
  player.body.checkCollision.up = true;
  player.body.checkCollision.down = true;
  player.body.checkCollision.left = true;
  player.body.checkCollision.right = true;

  // Seed initial platforms (start below the safe platform)
  seedPlatforms(this, 220, this.cameras.main.scrollY + 800);
  // Colliders (single)
  this.physics.add.collider(player, platformsGroup);
  this.physics.add.collider(bulletsGroup, platformsGroup, (b /* bullet */, _p /* platform */) => {
    if (b && b.destroy) b.destroy();
  });
  // Bullets kill enemies
  this.physics.add.overlap(bulletsGroup, enemiesGroup, (b, e) => onBulletHitsEnemy(this, b, e));

  // Enemies collide with platforms (stay on top)
  this.physics.add.collider(enemiesGroup, platformsGroup);
  
  // Enemies collide with each other (reverse direction on same platform)
  this.physics.add.collider(enemiesGroup, enemiesGroup, (a, b) => {
    if (a.platformRef && b.platformRef && a.platformRef === b.platformRef) {
      a.dir = -a.dir;
      b.dir = -b.dir;
      a.body.setVelocityX(a.dir * a.speed);
      b.body.setVelocityX(b.dir * b.speed);
    }
  });

  // Side hazards (prevent safe wall-riding)
  setupHazards(this);
  this.physics.add.overlap(player, hazardsGroup, (_pl, _hz) => {
    if (hazardOn) endGame(this);
  });
  // Player dies on touching enemies
  this.physics.add.overlap(player, enemiesGroup, (p, e) => { 
    if (!gameOver) endGame(this); 
  });

  // Camera follow (soft)
  this.cameras.main.startFollow(player, false, 0.1, 0.1);
  this.cameras.main.setBackgroundColor('#000000');

  // HUD with stylized backgrounds
  const hudBg = this.add.rectangle(10, 10, 200, 90, 0x000000, 0.5);
  hudBg.setOrigin(0, 0);
  hudBg.setStrokeStyle(2, 0x00ffff, 0.4);
  hudBg.setScrollFactor(0);
  hudBg.setDepth(999);
  
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '24px',
    fontFamily: 'Arial, sans-serif',
    color: '#00ff00',
    stroke: '#000000',
    strokeThickness: 2
  }).setScrollFactor(0).setDepth(1000);
  
  this.ammoText = this.add.text(16, 44, 'Ammo: ' + ammo, {
    fontSize: '20px',
    fontFamily: 'Arial, sans-serif',
    color: '#ffff00',
    stroke: '#000000',
    strokeThickness: 2
  }).setScrollFactor(0).setDepth(1000);
  
  comboText = this.add.text(16, 68, '', {
    fontSize: '20px',
    fontFamily: 'Arial, sans-serif',
    color: '#00ffff',
    stroke: '#000000',
    strokeThickness: 2
  }).setScrollFactor(0).setDepth(1000);

  // Title splash
  const titleSplash = this.add.text(400, 200, 'CHAINFALL', {
    fontSize: '64px',
    fontFamily: 'Arial, sans-serif',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 6
  }).setOrigin(0.5).setScrollFactor(0);
  this.tweens.add({
    targets: titleSplash,
    alpha: { from: 1, to: 0 },
    duration: 1200,
    delay: 300,
    ease: 'Quad.easeOut',
    onComplete: () => titleSplash.destroy()
  });

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
    // P1A: disparo normal en aire (si no está cargando)
    if (key === 'P1A' && !player.body.blocked.down && ammo > 0 && !isCharging) {
      fireBullet(scene);
    }
    // P1B: iniciar Charge Shot si está en el aire
    if (key === 'P1B' && !player.body.blocked.down && ammo > 1 && !isCharging) {
      startCharging(scene);
    }
  });

  this.input.keyboard.on('keyup', (event) => {
    const key = KEYBOARD_TO_ARCADE[event.key] || event.key;
    if (key === 'P1L') keysState.left = false;
    if (key === 'P1R') keysState.right = false;
    
    // P1B release: disparar Charge Shot o cancelar carga
    if (key === 'P1B' && isCharging) {
      const heldTime = scene.time.now - chargeStartTime;
      const isAirborne = !player.body.blocked.down;
      
      if (heldTime >= CHARGE_THRESHOLD_MS && ammo >= CHARGE_COST_AMMO && isAirborne) {
        // IMPORTANTE: Primero restaurar timeScale a 1.0, LUEGO disparar
        // De lo contrario, la bala se crea con velocidad afectada por slow-mo
        stopCharging(scene, true); // fired = true
        fireChargedBullet(scene); // Ahora disparar con timeScale normal
      } else {
        // Cancelar carga sin disparar
        stopCharging(scene, false);
      }
    }
  });

  // Toggle hurtbox/hitbox debug with P
  this.input.keyboard.on('keydown-P', () => {
    debugHitboxes = !debugHitboxes;
    if (!debugHitboxes && debugGraphics) debugGraphics.clear();
  });
  if (debugGraphics && !debugGraphics.scene) {
    // stale reference from previous scene, drop it
    debugGraphics = null;
  }
  if (debugGraphics) debugGraphics.destroy();
  debugGraphics = this.add.graphics();
  debugGraphics.setDepth(4500);
}


function update(_time, _delta) {
  if (gameOver) return;

  // Horizontal control
  if (player && player.body) {
    let vx = 0;
    if (keysState.left) vx -= speed;
    if (keysState.right) vx += speed;
    
    // Durante slow-mo, compensar velocidad X del jugador para mantenerla normal
    const timeScale = this.physics.world.timeScale || 1.0;
    
    if (isCharging && timeScale > 1.0) {
      // Como timeScale es un divisor, multiplicamos vx por el timeScale para compensar
      vx = vx * timeScale;
    }
    
    player.body.setVelocityX(vx);
    
    // Cancelar carga si el jugador toca el suelo
    if (isCharging && player.body.blocked.down) {
      stopCharging(this, false);
    }
    
    // Dibujar anillos de canalización alrededor del jugador
    if (isCharging && chargeVisuals) {
      chargeVisuals.clear();
      const progress = Math.min((this.time.now - chargeStartTime) / CHARGE_THRESHOLD_MS, 1.0);
      
      // Anillos concéntricos amarillos que crecen con el progreso
      for (let i = 0; i < 3; i++) {
        const radius = 20 + (i * 12) + (progress * 10);
        const alpha = 0.6 - (i * 0.15);
        chargeVisuals.lineStyle(2, 0xEEF527, alpha); // Amarillo brillante
        chargeVisuals.strokeCircle(player.x, player.y, radius);
      }
      
      // Barra de progreso simple sobre el jugador
      if (progress < 1.0) {
        const barWidth = 30;
        const barHeight = 4;
        const barX = player.x - barWidth / 2;
        const barY = player.y - 20;
        
        // Fondo
        chargeVisuals.fillStyle(0x000000, 0.6);
        chargeVisuals.fillRect(barX, barY, barWidth, barHeight);
        
        // Progreso amarillo
        chargeVisuals.fillStyle(0xEEF527, 0.9);
        chargeVisuals.fillRect(barX, barY, barWidth * progress, barHeight);
      }
    }

    // Land detection to reset ammo and combo
    const onGround = player.body.blocked.down;
    if (onGround && !wasOnGround) {
      // Reset combo if had blue bullets
      if (ammo > maxAmmo || comboCount > 0) {
        comboCount = 0;
        comboMultiplier = 1;
        if (comboText) {
          comboText.setText('');
          comboText.setScale(1); // Reset scale
        }
      }
      // ALWAYS reset ammo to maxAmmo when landing
      ammo = maxAmmo;
      if (this.ammoText) {
        this.ammoText.setText('Ammo: ' + ammo);
        // Reset to yellow color (normal ammo)
        this.ammoText.setColor('#ffff00');
      }
      playTone(this, 440, 0.05);
      
      // Landing visual effects
      // Player flash effect (change color temporarily)
      player.setFillStyle(0x00ffff); // Cyan flash
      this.tweens.add({
        targets: player,
        duration: 200,
        onComplete: () => player.setFillStyle(0xffffff) // Back to white
      });
      
      // Small particle burst on landing
      for (let i = 0; i < 4; i++) {
        const px = player.x + (Math.random() - 0.5) * 20;
        const particle = this.add.rectangle(px, player.y + 12, 3, 3, 0x00aaff);
        this.physics.add.existing(particle);
        particle.body.setVelocity(
          (Math.random() - 0.5) * 100,
          -Math.random() * 80
        );
        particle.body.setGravity(0, 400);
        this.tweens.add({
          targets: particle,
          alpha: 0,
          duration: 400,
          onComplete: () => particle.destroy()
        });
      }
    }
    wasOnGround = onGround;
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
      positionPlatform(this, p, maxY + Phaser.Math.Between(70, 120));
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

  // Enemies movement and interactions
  updateEnemies(this, _delta || 16);

  // Draw hurtboxes/hitboxes when enabled
  if (debugHitboxes) drawHitboxes(this);
}


function endGame(scene) {
  gameOver = true;
  playTone(scene, 220, 0.5);
  
  // Limpiar estado de carga si estaba activo
  if (isCharging) {
    stopCharging(scene, false);
  }
  
  // Restaurar time scale a normal
  if (scene.physics && scene.physics.world) {
    scene.physics.world.timeScale = 1.0;
  }
  
  // Completely stop gameplay
  if (scene.physics && scene.physics.world) scene.physics.world.pause();
  if (scene.cameras && scene.cameras.main) scene.cameras.main.stopFollow();

  // Semi-transparent overlay
  const overlay = scene.add.graphics();
  overlay.fillStyle(0x000000, 0.7);
  overlay.fillRect(0, 0, 800, 600);
  overlay.setDepth(9999);
  overlay.setScrollFactor(0);

  // Game title on overlay (styled like main menu)
  const titleText = scene.add.text(400, 70, 'CHAINFALL', {
    fontSize: '42px',
    fontFamily: 'Arial, sans-serif',
    color: '#ffffff',
    stroke: '#00ffff',
    strokeThickness: 4
  }).setOrigin(0.5);
  titleText.setDepth(10000);
  titleText.setScrollFactor(0);
  
  // Subtle pulsing for title
  scene.tweens.add({
    targets: titleText,
    scale: { from: 1, to: 1.03 },
    duration: 1500,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });

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
  const finalScoreText = scene.add.text(cx, cy + 100, 'TOTAL SCORE: ' + score, {
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
  const restartText = scene.add.text(cx, cy + 180, 'Press ' + currentShootKey.toUpperCase() + ' to Restart', {
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

  // Main Menu button with border (styled like main menu)
  const menuBorder = scene.add.rectangle(cx, cy + 240, 240, 50, 0x001a1a, 0.6);
  menuBorder.setStrokeStyle(2, 0x00ffff, 0.8);
  menuBorder.setDepth(10000);
  menuBorder.setScrollFactor(0);
  
  const menuBtn = scene.add.text(cx, cy + 240, 'Main Menu', {
    fontSize: '28px',
    fontFamily: 'Arial, sans-serif',
    color: '#00ffff',
    align: 'center',
    stroke: '#000000',
    strokeThickness: 3
  }).setOrigin(0.5).setInteractive({ useHandCursor: true });
  
  // Hover effects
  menuBtn.on('pointerover', () => {
    menuBtn.setScale(1.15);
    menuBtn.setColor('#ffffff');
    menuBorder.setScale(1.08);
    menuBorder.setStrokeStyle(3, 0xffffff, 1);
    menuBorder.setFillStyle(0x001a1a, 0.8);
  });
  
  menuBtn.on('pointerout', () => {
    menuBtn.setScale(1);
    menuBtn.setColor('#00ffff');
    menuBorder.setScale(1);
    menuBorder.setStrokeStyle(2, 0x00ffff, 0.8);
    menuBorder.setFillStyle(0x001a1a, 0.6);
  });
  
  menuBtn.on('pointerdown', () => {
    scene.scene.start('menu');
  });
  
  menuBtn.setDepth(10001);
  menuBorder.setDepth(10000);
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
  
  // Reset combo state
  comboCount = 0;
  comboMultiplier = 1;
  
  // Reset charge shot state
  isCharging = false;
  chargeStartTime = 0;
  if (chargeVisuals) {
    chargeVisuals.destroy();
    chargeVisuals = null;
  }
  if (chargeToneInterval) {
    clearInterval(chargeToneInterval);
    chargeToneInterval = null;
  }
  if (slowMoTween) {
    slowMoTween.stop();
    slowMoTween = null;
  }
  
  // Clear globals to force re-creation on next create()
  scoreText = null;
  comboText = null;
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
    maybeSpawnEnemies(scene, p);
    y += Phaser.Math.Between(70, 120);
  }
}

function createPlatform(scene, y) {
  const width = Phaser.Math.Between(70, 180);
  const x = Phaser.Math.Between(40, 760 - width);
  const rect = scene.add.rectangle(x + width / 2, y, width, 12, 0x00aaff);
  rect.setStrokeStyle(1, 0x0088dd, 0.8); // Darker blue outline
  scene.physics.add.existing(rect, true); // static body
  if (rect.body) {
    // One-way: collide only on top face
    rect.body.checkCollision.up = true;
    rect.body.checkCollision.down = true; // now collide from below too (solid from bottom)
    rect.body.checkCollision.left = true;  // enable side collisions
    rect.body.checkCollision.right = true; // enable side collisions
  }
  rect.enemies = [];
  if (platformsGroup) platformsGroup.add(rect);
  if (rect.body && rect.body.updateFromGameObject) rect.body.updateFromGameObject();
  return rect;
}

function positionPlatform(scene, rect, y) {
  const width = Phaser.Math.Between(70, 180);
  const x = Phaser.Math.Between(40, 760 - width);
  rect.setSize(width, 12);
  rect.displayWidth = width;
  rect.displayHeight = 12;
  rect.x = x + width / 2;
  rect.y = y;
  rect.setFillStyle(0x00aaff);
  rect.setStrokeStyle(1, 0x0088dd, 0.8); // Re-apply stroke on reposition
  rect.noEnemies = false;
  if (rect.body) {
    // ensure collisions remain solid on both top and bottom faces
    rect.body.checkCollision.up = true;
    rect.body.checkCollision.down = true;
    rect.body.checkCollision.left = true;  // enable side collisions
    rect.body.checkCollision.right = true; // enable side collisions
    if (rect.body.updateFromGameObject) rect.body.updateFromGameObject();
  }
  // Reset enemies on this platform and respawn
  if (rect.enemies && rect.enemies.length) {
    rect.enemies.forEach(e => e.destroy());
    rect.enemies = [];
  } else if (!rect.enemies) {
    rect.enemies = [];
  }
  maybeSpawnEnemies(scene, rect);
}

function fireBullet(scene) {
  const useBlue = comboCount > 0;
  const bulletColor = useBlue ? 0x00ffff : 0xff4444;
  const strokeColor = useBlue ? 0x88ffff : 0xff8888;
  const b = scene.add.rectangle(player.x, player.y + 16, 6, 14, bulletColor);
  b.setStrokeStyle(1, strokeColor, 0.7);
  scene.physics.add.existing(b);
  if (b.body && b.body.setSize) b.body.setSize(6, 14, true);
  b.body.setAllowGravity(false);
  b.body.enable = true;
  b.body.checkCollision.up = true;
  b.body.checkCollision.down = true;
  b.body.checkCollision.left = true;
  b.body.checkCollision.right = true;
  b.body.setVelocityY(550);
  if (bulletsGroup) bulletsGroup.add(b);
  bullets.push(b);
  ammo -= 1;
  if (scene.ammoText) {
    scene.ammoText.setText('Ammo: ' + ammo);
    scene.ammoText.setColor(comboCount > 0 ? '#00ffff' : '#ffff00');
  }
  // Recoil upwards
  player.body.setVelocityY(Math.min(player.body.velocity.y - recoil, -recoil));
  playTone(scene, 880, 0.05);
}

// ===== Enemy helpers =====
function maybeSpawnEnemies(scene, platform) {
  if (!enemiesGroup) return;
  if (platform && platform.noEnemies) return;
  const pw = platform.displayWidth || 100;
  // Decide count: 0-2, bias to fewer, and ensure max 2
  let count = 0;
  if (Phaser.Math.Between(0, 99) < 75) count = 1;
  if (pw > 140 && Phaser.Math.Between(0, 99) < 12) count = Math.min(2, count + 1);
  for (let i = 0; i < count && platform.enemies.length < 2; i++) {
    spawnEnemy(scene, platform);
  }
}

function spawnEnemy(scene, platform) {
  // Determine type: walker (default) or jumper
  const isJumper = Math.random() < JUMPER_SPAWN_CHANCE;
  
  const pw = platform.displayWidth;
  const minX = platform.x - pw / 2 + 16;
  const maxX = platform.x + pw / 2 - 16;
  const ex = Phaser.Math.Between(Math.floor(minX), Math.floor(maxX));
  const ph = platform.displayHeight || 12;
  const eh = 14;
  const ew = 28;
  const ey = platform.y - ph / 2 - eh / 2; // sit on top of platform visually
  const enemy = scene.add.rectangle(ex, ey, ew, eh, isJumper ? 0x27f565 : 0xff2222);

  enemy.type = isJumper ? 'jumper' : 'walker';
  // Distinctive stroke for jumper
  enemy.setStrokeStyle(1, isJumper ? 0x27f565 : 0xff6666, 0.8); // green-ish for jumper

  scene.physics.add.existing(enemy);

  // Subtle pulsing animation for enemies
  scene.tweens.add({
    targets: enemy,
    alpha: { from: 1, to: 0.85 },
    duration: 800,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
  
  // ===== Physics setup =====
  if (enemy.body && enemy.body.setAllowGravity) {
    enemy.body.setAllowGravity(isJumper); // jumpers use gravity
  }

  // Configure physics body FIRST
  enemy.body.setSize(ew, eh, true);
  enemy.body.enable = true;
  enemy.body.checkCollision.up = true;
  enemy.body.checkCollision.down = true;
  enemy.body.checkCollision.left = true;
  enemy.body.checkCollision.right = true;
  
  // Store movement data with proper boundaries
  enemy.minX = platform.x - pw / 2 + 14; // Left boundary with margin
  enemy.maxX = platform.x + pw / 2 - 14; // Right boundary with margin
  enemy.dir = Phaser.Math.Between(0, 1) ? 1 : -1;
  enemy.speed = Phaser.Math.Between(40, 80);
  enemy.platformRef = platform;

  // Jumper data
  if (isJumper) {
    enemy.jumpCooldownMs = Phaser.Math.Between(JUMPER_COOLDOWN_MIN_MS, JUMPER_COOLDOWN_MAX_MS);
    enemy.jumpTimerMs = 0;
    enemy.jumpVelY = JUMPER_JUMP_VEL_Y;
  }
  
  // Start movement with velocity
  enemy.body.setVelocityX(enemy.dir * enemy.speed);
  enemy.body.setVelocityY(0);
  
  enemiesGroup.add(enemy);
  platform.enemies.push(enemy);
}

function updateEnemies(scene, deltaMs) {
  // Move enemies within their platform range - PURE velocity based, NO manual position changes
  enemiesGroup.getChildren().forEach(e => {
    if (!e.active || !e.body) return;
    
    const isJumper = e.type === 'jumper';

    // Walkers: keep Y velocity at 0 (walkers stick to platforms)
    if (!isJumper && e.body.velocity.y !== 0) {
      e.body.setVelocityY(0);
    }
    
    // Ensure enemy is always moving (restore velocity if lost due to collisions)
    if (Math.abs(e.body.velocity.x) < 5) {
      e.body.setVelocityX(e.dir * e.speed);
    }
    
    // Boundary checks using center position - ONLY change velocity, NEVER touch position
    if (e.x <= e.minX && e.body.velocity.x < 0) { 
      e.dir = 1; 
      e.body.setVelocityX(e.dir * e.speed);
    }
    else if (e.x >= e.maxX && e.body.velocity.x > 0) { 
      e.dir = -1; 
      e.body.setVelocityX(e.dir * e.speed);
    }

    // ===== Jumper behavior =====
    if (isJumper) {
      // Accumulate timer; if on ground and cooldown met, jump
      e.jumpTimerMs = (e.jumpTimerMs || 0) + (deltaMs || 0);
      if (e.body.blocked && e.body.blocked.down && e.jumpTimerMs >= (e.jumpCooldownMs || JUMPER_COOLDOWN_MIN_MS)) {
        e.body.setVelocityY(e.jumpVelY || JUMPER_JUMP_VEL_Y);
        e.jumpTimerMs = 0;
        // Micro visual feedback on jump
        scene.tweens.add({
          targets: e,
          scaleY: { from: 0.9, to: 1 },
          duration: 120,
          ease: 'Quad.easeOut'
        });
      }
    }
  });
  // Clean up destroyed enemies from platform lists
  platforms.forEach(p => {
    if (p.enemies) {
      p.enemies = p.enemies.filter(e => e.active);
    }
  });
}

function onBulletHitsEnemy(scene, bullet, enemy) {
  // Manejar balas con pierce (charged bullets)
  if (bullet && bullet.isCharged && bullet.pierceCount > 0) {
    bullet.pierceCount--;
    // Solo destruir si pierceCount agotado
    if (bullet.pierceCount <= 0 && bullet.destroy) {
      bullet.destroy();
    }
  } else {
    // Balas normales se destruyen inmediatamente
    if (bullet && bullet.destroy) bullet.destroy();
  }
  
  if (enemy && enemy.active) {
    // Particle burst effect on enemy death
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const particle = scene.add.rectangle(enemy.x, enemy.y, 4, 4, 0xff6666);
      scene.physics.add.existing(particle);
      particle.body.setVelocity(
        Math.cos(angle) * 150,
        Math.sin(angle) * 150
      );
      particle.body.setGravity(0, 300);
      scene.tweens.add({
        targets: particle,
        alpha: 0,
        scale: 0,
        duration: 500,
        onComplete: () => particle.destroy()
      });
    }
    
    // Remove from platform list
    const p = enemy.platformRef;
    if (p && p.enemies) p.enemies = p.enemies.filter(x => x !== enemy);
    
    // Check if airborne kill (combo system)
    const isAirborne = player && player.body && !player.body.blocked.down;
    
    let earnedScore = 50;
    
    if (isAirborne) {
      // Airborne kill: increment combo
      const isFirstCombo = comboCount === 0;
      comboCount++;
      comboMultiplier = 1 + (comboCount * 0.5); // +50% per kill in combo
      
      // First combo kill: grant maxAmmo bullets, subsequent: +1
      if (isFirstCombo) {
        ammo = maxAmmo; // Start combo with full reload!
      } else {
        ammo++; // Blue bullet (can exceed maxAmmo)
      }
      
      // Update combo display with scaling effects
      if (comboText) {
        comboText.setText('COMBO x' + comboMultiplier.toFixed(1) + ' (' + comboCount + ')');
        // Scale combo text based on level
        const scale = 1 + (comboCount * 0.1);
        comboText.setScale(Math.min(scale, 2));
      }
      
      // Award score with multiplier
      earnedScore = Math.floor(50 * comboMultiplier);
      score += earnedScore;
      
      // Progressive visual feedback based on combo level
      let textColor = '#00ffff';
      let textSize = 18;
      let strokeThickness = 3;
      let shakeIntensity = 0.005;
      let comboMessage = '';
      
      if (comboCount >= 10) {
        textColor = '#ff00ff'; // Magenta for godlike
        textSize = 28;
        strokeThickness = 5;
        shakeIntensity = 0.02;
        comboMessage = 'GODLIKE!';
      } else if (comboCount >= 7) {
        textColor = '#ff0080'; // Pink for insane
        textSize = 24;
        strokeThickness = 4;
        shakeIntensity = 0.015;
        comboMessage = 'INSANE!';
      } else if (comboCount >= 5) {
        textColor = '#ff4400'; // Orange for amazing
        textSize = 22;
        strokeThickness = 4;
        shakeIntensity = 0.012;
        comboMessage = 'AMAZING!';
      } else if (comboCount >= 3) {
        textColor = '#ffff00'; // Yellow for great
        textSize = 20;
        strokeThickness = 3;
        shakeIntensity = 0.008;
        comboMessage = 'GREAT!';
      } else if (isFirstCombo) {
        comboMessage = 'COMBO START!';
      }
      
      // Visual feedback: floating score with combo
      const t = scene.add.text(enemy.x, enemy.y - 10, '+' + earnedScore, {
        fontSize: textSize + 'px', fontFamily: 'Arial, sans-serif', color: textColor, stroke: '#000000', strokeThickness: strokeThickness
      }).setOrigin(0.5);
      scene.tweens.add({ 
        targets: t, 
        y: t.y - 30, 
        scale: { from: 0.5, to: 1.2 },
        alpha: 0, 
        duration: 700, 
        ease: 'Back.easeOut',
        onComplete: () => t.destroy() 
      });
      
      // Show combo message
      if (comboMessage) {
        const msg = scene.add.text(enemy.x, enemy.y - 35, comboMessage, {
          fontSize: (textSize + 4) + 'px', fontFamily: 'Arial, sans-serif', color: textColor, stroke: '#ffffff', strokeThickness: 2
        }).setOrigin(0.5);
        scene.tweens.add({ 
          targets: msg, 
          y: msg.y - 40, 
          scale: { from: 1.5, to: 0.8 },
          alpha: { from: 1, to: 0 }, 
          duration: 1000, 
          ease: 'Power2',
          onComplete: () => msg.destroy() 
        });
      }
      
      // Camera shake with increasing intensity
      if (scene.cameras && scene.cameras.main) {
        scene.cameras.main.shake(200, shakeIntensity);
      }
      
      // Update ammo display with blue color and scale
      if (scene.ammoText) {
        scene.ammoText.setText('Ammo: ' + ammo);
        scene.ammoText.setColor(textColor); // Match combo color
        // Pulse effect on ammo text
        scene.tweens.add({
          targets: scene.ammoText,
          scale: { from: 1, to: 1.3 },
          duration: 150,
          yoyo: true,
          ease: 'Quad.easeOut'
        });
      }
      
      // Play combo sound with increasing pitch
      const pitchMultiplier = 1 + (comboCount * 0.1);
      playTone(scene, 660 * pitchMultiplier, 0.08);
    } else {
      // Grounded kill: normal behavior
      score += earnedScore;
      ammo = Math.min(maxAmmo, ammo + 1); // Regular ammo (clamped)
      
      // Visual feedback: floating +50
      const t = scene.add.text(enemy.x, enemy.y - 10, '+50', {
        fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#ffdd55', stroke: '#000000', strokeThickness: 2
      }).setOrigin(0.5);
      scene.tweens.add({ targets: t, y: t.y - 20, alpha: 0, duration: 500, onComplete: () => t.destroy() });
      
      // Update ammo display with yellow color
      if (scene.ammoText) {
        scene.ammoText.setText('Ammo: ' + ammo);
        scene.ammoText.setColor('#ffff00'); // Yellow for normal ammo
      }
      
      // Sound feedback for grounded kill
      playTone(scene, 660, 0.08);
    }
    
    if (scoreText) scoreText.setText('Score: ' + score);
    enemy.destroy();
  }
}

// ===== Charge Shot helpers =====
function startCharging(scene) {
  if (isCharging) return; // ya está cargando
  
  isCharging = true;
  chargeStartTime = scene.time.now;
  
  // Aplicar slow-motion inmediatamente
  // NOTA: En Phaser, timeScale funciona como DIVISOR del delta time
  // Valores MAYORES a 1.0 = más lento (ej: 3.33 ≈ 30% velocidad)
  // Valores MENORES a 1.0 = más rápido
  if (scene.physics && scene.physics.world) {
    scene.physics.world.timeScale = CHARGE_SLOWMO_SCALE;
  }
  
  // Guardar referencia al tween para cleanup (aunque ya no lo usamos para el ramp)
  slowMoTween = null;
  
  // Visuales de canalización: anillos amarillos pulsantes alrededor del jugador (Ray Gun)
  if (!chargeVisuals) {
    chargeVisuals = scene.add.graphics();
    chargeVisuals.setDepth(999);
    chargeVisuals.setScrollFactor(1);
  }
  
  // Animación de anillos
  scene.tweens.add({
    targets: chargeVisuals,
    alpha: { from: 0.8, to: 0.3 },
    duration: 400,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
  
  // Audio feedback: tono continuo modulado
  let frequency = 440;
  const freqStep = 10;
  chargeToneInterval = setInterval(() => {
    if (isCharging) {
      playTone(scene, frequency, 0.08);
      frequency += freqStep;
      if (frequency > 600) frequency = 440;
    }
  }, 150);
}

function stopCharging(scene, fired = false) {
  if (!isCharging) return;
  
  isCharging = false;
  
  // Restaurar velocidad normal inmediatamente
  if (scene.physics && scene.physics.world) {
    scene.physics.world.timeScale = 1.0;
  }
  slowMoTween = null;
  
  // Limpiar visuales
  if (chargeVisuals) {
    scene.tweens.killTweensOf(chargeVisuals);
    chargeVisuals.clear();
    chargeVisuals.destroy();
    chargeVisuals = null;
  }
  
  // Detener audio
  if (chargeToneInterval) {
    clearInterval(chargeToneInterval);
    chargeToneInterval = null;
  }
  
  // Si se disparó, mostrar efectos de liberación
  if (fired) {
    // Flash ring amarillo desde el jugador (Ray Gun)
    const ring = scene.add.circle(player.x, player.y, 10, 0xEEF527, 0.7);
    ring.setDepth(1000);
    scene.tweens.add({
      targets: ring,
      scale: 4,
      alpha: 0,
      duration: 250,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy()
    });
    
    // Partículas amarillas
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const particle = scene.add.rectangle(player.x, player.y, 4, 4, 0xEEF527);
      particle.setDepth(1000);
      scene.physics.add.existing(particle);
      particle.body.setVelocity(
        Math.cos(angle) * 200,
        Math.sin(angle) * 200
      );
      particle.body.setGravity(0, 0);
      scene.tweens.add({
        targets: particle,
        alpha: 0,
        scale: 0,
        duration: 300,
        onComplete: () => particle.destroy()
      });
    }
    
    // Camera shake más intenso para Ray Gun
    scene.cameras.main.shake(150, 0.006);
    
    // Audio: tono de liberación (pitch alto)
    playTone(scene, 1000, 0.12);
  }
}

function fireChargedBullet(scene) {
  // ===== RAY GUN: Rayo instantáneo hacia abajo =====
  const rayColor = 0xEEF527;      // Amarillo brillante
  const rayStart = { x: player.x, y: player.y + 12 };
  const rayEnd = { x: player.x, y: player.y + CHARGE_RAY_MAX_DISTANCE };
  
  console.log('🔫 RAY GUN DISPARADO desde:', rayStart.y, 'hasta:', rayEnd.y);
  
  // Dibujar el rayo visual
  const rayGraphics = scene.add.graphics();
  rayGraphics.setDepth(1500);
  
  // Rayo grueso con glow
  rayGraphics.lineStyle(8, rayColor, 0.3);
  rayGraphics.lineBetween(rayStart.x, rayStart.y, rayEnd.x, rayEnd.y);
  rayGraphics.lineStyle(4, rayColor, 0.7);
  rayGraphics.lineBetween(rayStart.x, rayStart.y, rayEnd.x, rayEnd.y);
  rayGraphics.lineStyle(2, 0xFFFFFF, 1.0);
  rayGraphics.lineBetween(rayStart.x, rayStart.y, rayEnd.x, rayEnd.y);
  
  // El rayo se desvanece después de un tiempo
  scene.tweens.add({
    targets: rayGraphics,
    alpha: 0,
    duration: CHARGE_RAY_VISUAL_DURATION,
    ease: 'Quad.easeOut',
    onComplete: () => rayGraphics.destroy()
  });
  
  // Detectar todos los enemigos que están en el camino del rayo
  const hitEnemies = [];
  if (enemiesGroup && enemiesGroup.children) {
    enemiesGroup.children.entries.forEach(enemy => {
      if (!enemy.active) return;
      
      // Verificar si el enemigo está en la línea del rayo (±10px de tolerancia horizontal)
      const horizontalDist = Math.abs(enemy.x - player.x);
      if (horizontalDist <= 20) {
        // Y el enemigo está debajo del jugador
        if (enemy.y > player.y) {
          const distanceFromPlayer = enemy.y - player.y;
          hitEnemies.push({ enemy, distance: distanceFromPlayer });
        }
      }
    });
  }
  
  // Ordenar por distancia (más cercano primero)
  hitEnemies.sort((a, b) => a.distance - b.distance);
  
  // Aplicar daño a los primeros N enemigos (pierce)
  const maxHits = CHARGE_PIERCE_COUNT;
  const actualHits = Math.min(hitEnemies.length, maxHits);
  
  console.log('Enemigos en camino del rayo:', hitEnemies.length, '/ Hits aplicados:', actualHits);
  
  for (let i = 0; i < actualHits; i++) {
    const { enemy, distance } = hitEnemies[i];
    
    // Efecto visual en el punto de impacto
    const impactFlash = scene.add.circle(enemy.x, enemy.y, 12, rayColor, 0.8);
    impactFlash.setDepth(1600);
    scene.tweens.add({
      targets: impactFlash,
      scale: 2.5,
      alpha: 0,
      duration: 250,
      ease: 'Power2',
      onComplete: () => impactFlash.destroy()
    });
    
    // Partículas en el impacto
    for (let j = 0; j < 6; j++) {
      const angle = (j / 6) * Math.PI * 2;
      const p = scene.add.rectangle(enemy.x, enemy.y, 3, 3, rayColor);
      p.setDepth(1600);
      scene.physics.add.existing(p);
      p.body.setVelocity(
        Math.cos(angle) * 150,
        Math.sin(angle) * 150
      );
      p.body.setGravity(0, 0);
      scene.tweens.add({
        targets: p,
        alpha: 0,
        scale: 0,
        duration: 300,
        onComplete: () => p.destroy()
      });
    }
    
    // Matar al enemigo (reutilizar lógica existente)
    onBulletHitsEnemy(scene, { isCharged: true, pierceCount: 999 }, enemy);
  }
  
  // Consumir munición
  ammo -= CHARGE_COST_AMMO;
  if (scene.ammoText) {
    scene.ammoText.setText('Ammo: ' + ammo);
    scene.ammoText.setColor(comboCount > 0 ? '#00ffff' : '#ffff00');
  }
  
  // Recoil suave
  if (player && player.body) {
    const recoilY = recoil * 0.5;
    player.body.setVelocityY(Math.min(player.body.velocity.y - recoilY, -recoilY));
  }
  
  // Sonido más potente para el ray gun
  playTone(scene, 1200, 0.15);
}

// ===== Debug helpers =====
function drawHitboxes(scene) {
  if (!debugGraphics) return;
  debugGraphics.clear();
  // Player
  if (player && player.body) {
    debugGraphics.lineStyle(1, 0x00ff00, 1);
    debugGraphics.strokeRect(player.body.x, player.body.y, player.body.width, player.body.height);
  }
  // Enemies
  if (enemiesGroup) {
    enemiesGroup.getChildren().forEach(e => {
      if (e.body) {
        debugGraphics.lineStyle(1, 0xffa500, 1);
        debugGraphics.strokeRect(e.body.x, e.body.y, e.body.width, e.body.height);
      }
    });
  }
  // Bullets
  if (bulletsGroup) {
    bulletsGroup.getChildren().forEach(b => {
      if (b.body) {
        debugGraphics.lineStyle(1, 0xffff00, 1);
        debugGraphics.strokeRect(b.body.x, b.body.y, b.body.width, b.body.height);
      }
    });
  }
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

  gainNode.gain.setValueAtTime(0.03, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

// MUSIC
function playBackgroundMusic(scene) {
  const audioContext = scene.sound.context;
  
  // Music parameters (easy to modify)
  const tempo = 120; // BPM
  const beatDuration = 60 / tempo; // Duration of one beat in seconds
  const loopBars = 4; // Number of bars in the loop
  const loopDuration = beatDuration * 4 * loopBars; // 4 beats per bar
  
  // Funky bass line pattern (note frequencies in Hz)
  const bassPattern = [
    { note: 110, start: 0, duration: 0.15 },      // A2
    { note: 110, start: 0.5, duration: 0.1 },     // A2
    { note: 146.83, start: 1, duration: 0.15 },   // D3
    { note: 110, start: 1.75, duration: 0.1 },    // A2
    { note: 123.47, start: 2.5, duration: 0.15 }, // B2
    { note: 110, start: 3.25, duration: 0.1 },    // A2
    { note: 146.83, start: 4, duration: 0.2 },    // D3
    { note: 123.47, start: 4.75, duration: 0.1 }, // B2
    { note: 98, start: 5.5, duration: 0.15 },     // G2
    { note: 110, start: 6.25, duration: 0.1 },    // A2
    { note: 146.83, start: 7, duration: 0.2 },    // D3
    { note: 110, start: 7.75, duration: 0.1 }     // A2
  ];
  
  // Melody pattern (higher notes)
  const melodyPattern = [
    { note: 440, start: 0.25, duration: 0.1 },    // A4
    { note: 493.88, start: 1.25, duration: 0.1 }, // B4
    { note: 587.33, start: 2.25, duration: 0.15 },// D5
    { note: 493.88, start: 3, duration: 0.1 },    // B4
    { note: 523.25, start: 4.25, duration: 0.1 }, // C5
    { note: 587.33, start: 5.25, duration: 0.15 },// D5
    { note: 659.25, start: 6.5, duration: 0.2 },  // E5
    { note: 587.33, start: 7.25, duration: 0.1 }  // D5
  ];
  
  function scheduleLoop(startTime) {
    // Schedule bass notes
    bassPattern.forEach(({ note, start, duration }) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.type = 'sawtooth';
      osc.frequency.value = note;
      
      const noteStart = startTime + start * beatDuration;
      const noteEnd = noteStart + duration;
      
      gain.gain.setValueAtTime(0.08, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.01, noteEnd);
      
      osc.start(noteStart);
      osc.stop(noteEnd);
    });
    
    // Schedule melody notes
    melodyPattern.forEach(({ note, start, duration }) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.type = 'square';
      osc.frequency.value = note;
      
      const noteStart = startTime + start * beatDuration;
      const noteEnd = noteStart + duration;
      
      gain.gain.setValueAtTime(0.04, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.01, noteEnd);
      
      osc.start(noteStart);
      osc.stop(noteEnd);
    });
    
    // Schedule next loop immediately for seamless playback
    const nextLoopTime = startTime + loopDuration;
    if (!gameOver && nextLoopTime < audioContext.currentTime + 10) {
      scheduleLoop(nextLoopTime);
    } else {
      // Check later if we should continue
      setTimeout(() => {
        if (!gameOver) scheduleLoop(audioContext.currentTime);
      }, (loopDuration - 0.5) * 1000);
    }
  }
  
  // Start the music loop
  scheduleLoop(audioContext.currentTime);
}
