// Platanus Hack 25: CHAINFALL
// Arcade mapping: P1L/R (move), P1U (jump), P1A (shoot), P1B (ray gun), START1 (restart)

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
    const keys = Array.isArray(keyboardKeys) ? keyboardKeys : [keyboardKeys];
    keys.forEach(key => {
      KEYBOARD_TO_ARCADE[key] = arcadeCode;
    });
  }
}

// ======== SAFE HELPERS (avoid destroyed group crashes) ========
function safeChildren(group) {
  if (!group || !group.children || !Array.isArray(group.children.entries)) return [];
  return group.children.entries;
}
function safeEach(group, fn) {
  const list = safeChildren(group);
  for (let i = 0; i < list.length; i++) {
    const child = list[i];
    if (child) fn(child);
  }
}

// ===== Scenes registry =====
const GameScene = { key: 'game', create: create, update: update };
const MenuScene = { key: 'menu', create: menuCreate, update: menuUpdate };

let currentShootKey = 'e';
let currentRayKey = 'i';
let selectedMode = 'challenger'; // 'normal' or 'challenger'

// Game Over UI state
let gameOverIndex = 0;
let gameOverItems = [];
let gameOverBorders = [];

// Failsafe global state (hold P1A+P1B for N ms)
let fsPrimaryDown = false;
let fsSecondaryDown = false;
let failsafeStartTime = 0;

// ======================= MENU SCENE ==========================
function menuCreate() {
  const s = this;
  s.cameras.main.setBackgroundColor('#000000');

  // Initialize overlay visibility flags
  s.instructionsVisible = false;
  s.controlsVisible = false;
  s.modeVisible = false;
  // Reset failsafe on entering menu
  fsPrimaryDown = false; fsSecondaryDown = false; failsafeStartTime = 0;

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
    const border = s.add.rectangle(400, y, 280, 50, 0x001a1a, 0.5);
    border.setStrokeStyle(2, 0x00ffff, 0.8);
    s.menuBorders.push(border);

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
  s.btnStart = mkBtn(260, 'Start Game', () => showModeSelect(s));
  s.btnInstr = mkBtn(330, 'Instructions', () => showInstructions(s));
  s.btnExit  = mkBtn(400, 'Controls', () => showControls(s));
  s.menuIndex = 0; updateMenuVisuals(s);

  // ===== Instructions overlay (hidden by default) =====
  s.instructionsGroup = s.add.group();
  const iOv = s.add.rectangle(400, 300, 800, 600, 0x000000, 0.86);
  const iT = s.add.text(400, 140, 'Instructions', { fontSize: '40px', fontFamily: 'Arial, sans-serif', color: '#ffff00' }).setOrigin(0.5);

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

  const g = s.add.graphics();
  g.lineStyle(2, 0x00ffff, 1);

  const moveTitle = s.add.text(140, 200, 'MOVE / JUMP', { fontSize: '18px', fontFamily: 'Arial, sans-serif', color: '#ffffff' }).setOrigin(0.5);
  const keyA = s.add.rectangle(110, 240, 34, 34, 0x111111);
  const keyD = s.add.rectangle(170, 240, 34, 34, 0x111111);
  const keyW = s.add.rectangle(140, 190, 34, 34, 0x111111);
  const txtA = s.add.text(110, 240, 'A', { fontSize: '20px', fontFamily: 'Arial, sans-serif', color: '#00ffff' }).setOrigin(0.5);
  const txtD = s.add.text(170, 240, 'D', { fontSize: '20px', fontFamily: 'Arial, sans-serif', color: '#00ffff' }).setOrigin(0.5);
  const txtW = s.add.text(140, 190, 'W', { fontSize: '20px', fontFamily: 'Arial, sans-serif', color: '#00ffff' }).setOrigin(0.5);
  g.fillStyle(0x00ffff, 1);
  g.fillTriangle(90, 240, 100, 232, 100, 248);
  g.fillTriangle(190, 240, 180, 232, 180, 248);
  g.fillTriangle(140, 170, 132, 180, 148, 180);

  const enemyYValue = 346;

  const centerTitle = s.add.text(400, 200, 'SHOOT DOWN', { fontSize: '18px', fontFamily: 'Arial, sans-serif', color: '#ffffff' }).setOrigin(0.5);
  const plat = s.add.rectangle(400, 360, 160, 12, 0x00aaff);
  const pRect = s.add.rectangle(400, enemyYValue - 12 - 22 - 66, 18, 24, 0xffffff);
  const bullet = s.add.rectangle(400, enemyYValue - 12 - 22, 6, 14, 0xff4444);
  const bullet2 = s.add.rectangle(400, enemyYValue - 12 - 22 - 26, 6, 14, 0xff4444);
  const enemy1 = s.add.rectangle(400, enemyYValue, 30, 16, 0xff2222);
  g.fillStyle(0xff4444, 1);
  g.fillTriangle(400, 390, 392, 378, 408, 378);
  const shootTxt = s.add.text(400, 420, 'Press ' + currentShootKey.toUpperCase() + ' to shoot down (in air)', { fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#dddddd' }).setOrigin(0.5);
  const landTxt = s.add.text(400, 444, 'Landing reloads to max ammo', { fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa' }).setOrigin(0.5);

  const comboTitle = s.add.text(660, 200, 'COMBO', { fontSize: '18px', fontFamily: 'Arial, sans-serif', color: '#ffffff' }).setOrigin(0.5);
  const comboPlat = s.add.rectangle(660, 360, 160, 12, 0x00aaff);
  const comboPlayer = s.add.rectangle(660, enemyYValue - 12 - 22 - 66, 18, 24, 0xffffff);
  const bb1 = s.add.rectangle(660, enemyYValue - 12 - 22, 6, 14, 0x00ffff);
  const bb2 = s.add.rectangle(660, enemyYValue - 12 - 22 - 26, 6, 14, 0x00ffff);
  g.fillStyle(0x00ffff, 1);
  g.fillTriangle(660, 390, 652, 378, 668, 378);
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
  s.instrItems = [iBack];
  s.instrBorders = [iBackBorder];
  s.instrIndex = 0; updateInstrVisuals(s); hideInstructions(s);

  // Panel key handling: Instructions
  s.input.keyboard.on('keydown', (ev) => {
    if (!s.instructionsVisible) return;
    if (s.instructionsJustOpened) return;
    const raw = ev.key;
    const key = KEYBOARD_TO_ARCADE[raw] || raw;
    if (raw === 'Escape' || key === 'P1B') { hideInstructions(s); if (ev.stopPropagation) ev.stopPropagation(); return; }
    if (key === 'P1U' || key === 'P1D' || key === 'P1L' || key === 'P1R') { s.instrIndex = 0; updateInstrVisuals(s); if (ev.stopPropagation) ev.stopPropagation(); return; }
    // P1A close moved to keyup only to avoid keyboard repeat issues
    if (ev.stopPropagation) ev.stopPropagation();
  });
  s.input.keyboard.on('keyup', (ev) => {
    if (!s.instructionsVisible) return;
    if (s.instructionsJustOpened) return;
    const raw = ev.key;
    const key = KEYBOARD_TO_ARCADE[raw] || raw;
    if (raw === 'Escape' || key === 'P1B' || key === 'P1A') {
      hideInstructions(s);
      if (ev.stopPropagation) ev.stopPropagation();
    }
  });

  // ===== Controls overlay (hidden by default) =====
  s.controlsGroup = s.add.group();
  const cOv = s.add.rectangle(400, 300, 800, 600, 0x000000, 0.86);
  const cT = s.add.text(400, 150, 'Controls', { fontSize: '40px', fontFamily: 'Arial, sans-serif', color: '#ffff00' }).setOrigin(0.5);
  s.controlsInfo = s.add.text(400, 200, 'Select an item and press a key to rebind', { fontSize: '18px', fontFamily: 'Arial, sans-serif', color: '#dddddd', align: 'center' }).setOrigin(0.5);

  const cShootBorder = s.add.rectangle(400, 270, 360, 46, 0x001a1a, 0.5);
  cShootBorder.setStrokeStyle(2, 0x00ffff, 0.8);
  const cShoot = s.add.text(400, 270, 'Normal Shoot: ' + currentShootKey.toUpperCase(), {
    fontSize: '28px', fontFamily: 'Arial, sans-serif', color: '#00ffff', stroke: '#000000', strokeThickness: 2
  }).setOrigin(0.5).setInteractive({ useHandCursor: true });
  cShoot.on('pointerover', () => { s.controlsIndex = 0; updateControlsVisuals(s); });

  const cRayBorder = s.add.rectangle(400, 330, 360, 46, 0x1a1a00, 0.5);
  cRayBorder.setStrokeStyle(2, 0xEEF527, 0.8);
  const cRay = s.add.text(400, 330, 'Ray Gun: ' + currentRayKey.toUpperCase(), {
    fontSize: '28px', fontFamily: 'Arial, sans-serif', color: '#EEF527', stroke: '#000000', strokeThickness: 2
  }).setOrigin(0.5).setInteractive({ useHandCursor: true });
  cRay.on('pointerover', () => { s.controlsIndex = 1; updateControlsVisuals(s); });

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
  s.controlsItems = [cShoot, cRay, cBack];
  s.controlsBorders = [cShootBorder, cRayBorder, cBackBorder];
  s.controlsIndex = 0; updateControlsVisuals(s); hideControls(s);

  // Panel key handling: Controls (navigation, back and rebinding)
  s.input.keyboard.on('keydown', (ev) => {
    if (!s.controlsVisible) return;
    if (s.controlsJustOpened) return;
    const raw = ev.key;
    const key = KEYBOARD_TO_ARCADE[raw] || raw;
    if (raw === 'Escape' || key === 'P1B') { hideControls(s); return; }
    if (key === 'P1U') { s.controlsIndex = (s.controlsIndex + s.controlsItems.length - 1) % s.controlsItems.length; updateControlsVisuals(s); return; }
    if (key === 'P1D') { s.controlsIndex = (s.controlsIndex + 1) % s.controlsItems.length; updateControlsVisuals(s); return; }
    // P1A close moved to separate keyup handler to avoid keyboard repeat issues
    // Rebind when a single printable key is pressed
    if (raw && raw.length === 1) {
      const k = raw.toLowerCase();
      if (s.controlsIndex === 0) {
        rebindShootKey(k);
        if (s.controlsItems[0] && s.controlsItems[0].setText) s.controlsItems[0].setText('Normal Shoot: ' + currentShootKey.toUpperCase());
      } else if (s.controlsIndex === 1) {
        rebindRayKey(k);
        if (s.controlsItems[1] && s.controlsItems[1].setText) s.controlsItems[1].setText('Ray Gun: ' + currentRayKey.toUpperCase());
      }
      return;
    }
  });
  s.input.keyboard.on('keyup', (ev) => {
    if (!s.controlsVisible) return;
    if (s.controlsJustOpened) return;
    const raw = ev.key;
    const key = KEYBOARD_TO_ARCADE[raw] || raw;
    if (key === 'P1A' && s.controlsIndex === 2) { hideControls(s); return; }
  });

  // Mode Select overlay (hidden by default)
  buildModeSelectOverlay(s);
  hideModeSelect(s);

  // Menu navigation keys (disabled when overlays are open)
  s.input.keyboard.on('keydown', (ev) => {
    const key = KEYBOARD_TO_ARCADE[ev.key] || ev.key;
    if (s.instructionsVisible || s.controlsVisible || s.modeVisible) return;
    if (key === 'P1U') { s.menuIndex = (s.menuIndex + s.menuItems.length - 1) % s.menuItems.length; updateMenuVisuals(s); }
    else if (key === 'P1D') { s.menuIndex = (s.menuIndex + 1) % s.menuItems.length; updateMenuVisuals(s); }
    else if (key === 'P1A') {
      const actions = [() => showModeSelect(s), () => showInstructions(s), () => showControls(s)];
      actions[s.menuIndex]();
    }
  });
  // Failsafe key tracking (menu scene)
  s.input.keyboard.on('keydown', (ev) => {
    if (s.instructionsVisible || s.controlsVisible || s.modeVisible) return;
    const key = KEYBOARD_TO_ARCADE[ev.key] || ev.key;
    if (key === 'P1A') fsPrimaryDown = true;
    if (key === 'P1B') fsSecondaryDown = true;
    if (fsPrimaryDown && fsSecondaryDown && failsafeStartTime === 0) failsafeStartTime = s.time.now;
  });
  s.input.keyboard.on('keyup', (ev) => {
    if (s.instructionsVisible || s.controlsVisible || s.modeVisible) return;
    const key = KEYBOARD_TO_ARCADE[ev.key] || ev.key;
    if (key === 'P1A') fsPrimaryDown = false;
    if (key === 'P1B') fsSecondaryDown = false;
    if (!fsPrimaryDown || !fsSecondaryDown) failsafeStartTime = 0;
  });
}

function menuUpdate() {
  // Avoid triggering failsafe while overlays are open in menu
  if (this.instructionsVisible || this.controlsVisible || this.modeVisible) return;
  checkFailsafe(this);
}

// ===== Failsafe: hold primary+secondary for N ms to return to menu =====
function checkFailsafe(scene) {
  if (!scene || !scene.time) return;
  if (fsPrimaryDown && fsSecondaryDown) {
    if (failsafeStartTime === 0) failsafeStartTime = scene.time.now;
    const elapsed = scene.time.now - failsafeStartTime;
    if (elapsed >= FAILSAFE_HOLD_MS) {
      fsPrimaryDown = false;
      fsSecondaryDown = false;
      failsafeStartTime = 0;
      if (scene.scene && scene.scene.start) scene.scene.start('menu');
    }
  } else {
    // reset timer if any of the keys is up
    failsafeStartTime = 0;
  }
}

function updateMenuVisuals(s) {
  s.menuItems.forEach((t, i) => {
    const sel = i === s.menuIndex;
    const border = s.menuBorders[i];
    t.setScale(sel ? 1.15 : 1);
    t.setColor(sel ? '#ffffff' : '#00ffff');
    if (border) {
      border.setScale(sel ? 1.08 : 1);
      border.setStrokeStyle(sel ? 3 : 2, sel ? 0xffffff : 0x00ffff, sel ? 1 : 0.8);
      border.setFillStyle(0x001a1a, sel ? 0.8 : 0.5);
    }
  });
}

// ===== Instructions / Controls visuals =====
function updateInstrVisuals(s) {
  if (!s.instrItems) return;
  s.instrItems.forEach((t, i) => {
    const sel = i === s.instrIndex;
    const border = s.instrBorders ? s.instrBorders[i] : null;
    t.setScale(sel ? 1.25 : 1);
    t.setColor(sel ? '#ffff00' : '#00ff00');
    t.setStroke(sel ? '#ffffff' : '#000000', sel ? 4 : 3);
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
    t.setScale(sel ? 1.25 : 1);
    t.setColor(sel ? '#ffff00' : '#00ff00');
    t.setStroke(sel ? '#ffffff' : '#000000', sel ? 4 : 3);
    if (border) {
      border.setScale(sel ? 1.12 : 1);
      border.setStrokeStyle(sel ? 3 : 2, sel ? 0xffff00 : 0x00ff00, sel ? 1 : 0.8);
      border.setFillStyle(sel ? 0x003300 : 0x003300, sel ? 0.9 : 0.6);
    }
  });
}
function showInstructions(s) {
  s.instructionsVisible = true;
  s.instructionsGroup.setVisible(true);
  s.instrIndex = 0;
  updateInstrVisuals(s);
  s.instructionsJustOpened = true;
  setTimeout(() => { s.instructionsJustOpened = false; }, 300);
}
function hideInstructions(s) {
  s.instructionsVisible = false;
  s.instructionsGroup.setVisible(false);
  s.instructionsJustOpened = false;
}
function showControls(s) {
  s.controlsVisible = true;
  s.controlsGroup.setVisible(true);
  s.controlsIndex = 0;
  updateControlsVisuals(s);
  s.controlsJustOpened = true;
  setTimeout(() => { s.controlsJustOpened = false; }, 300);
}
function hideControls(s) {
  s.controlsVisible = false;
  s.controlsGroup.setVisible(false);
  s.controlsJustOpened = false;
}

// ===== Mode Select overlay =====
function buildModeSelectOverlay(s) {
  s.modeGroup = s.add.group();

  const overlay = s.add.rectangle(400, 300, 800, 600, 0x000000, 0.86);
  const title = s.add.text(400, 110, 'SELECT MODE', {
    fontSize: '44px', fontFamily: 'Arial, sans-serif', color: '#ffff00', stroke: '#000000', strokeThickness: 4
  }).setOrigin(0.5);

  const help = s.add.text(400, 160, `Use A/D to choose • Press ${currentShootKey.toUpperCase()} to confirm • ${currentRayKey.toUpperCase()} to cancel`, {
    fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#dddddd'
  }).setOrigin(0.5);

  const enemyYValue = 346;

  // Cards
  s.modeIndex = 0;
  const cardW = 300; const cardH = 300;

  // Normal card
  const nCardBorder = s.add.rectangle(250, 330, cardW, cardH, 0x001a1a, 0.55);
  nCardBorder.setStrokeStyle(2, 0x00ffff, 0.8);

  const nTitle = s.add.text(250, 210, 'NORMAL', {
    fontSize: '28px', fontFamily: 'Arial, sans-serif', color: '#00ffff', stroke: '#000000', strokeThickness: 2
  }).setOrigin(0.5);

  const nDesc = s.add.text(250, 250, 'Ammo refills to MAX on any kill by bullet.', {
    fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#dddddd', align: 'center', wordWrap: { width: 260 }
  }).setOrigin(0.5);

  // Normal illustration
  const nG = s.add.graphics();
  nG.lineStyle(2, 0x00ffff, 1);
  const nPlat = s.add.rectangle(250, 360, 160, 12, 0x00aaff);
  const nPlayer = s.add.rectangle(250, 300, 18, 24, 0xffffff);
  const nEnemy = s.add.rectangle(250, enemyYValue, 30, 16, 0xff2222);
  const nBullet = s.add.rectangle(250, enemyYValue - 22, 6, 14, 0xff4444);
  const nHint = s.add.text(250, 420, `Press ${currentShootKey.toUpperCase()} to pick`, {
    fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
  }).setOrigin(0.5);

  // Challenger card
  const cCardBorder = s.add.rectangle(550, 330, cardW, cardH, 0x1a1a00, 0.55);
  cCardBorder.setStrokeStyle(2, 0xEEF527, 0.8);

  const cTitle = s.add.text(550, 210, 'CHALLENGER', {
    fontSize: '28px', fontFamily: 'Arial, sans-serif', color: '#EEF527', stroke: '#000000', strokeThickness: 2
  }).setOrigin(0.5);

  const cDesc = s.add.text(550, 250,
    'Gain +1 ammo on any kill by bullet.',
    {
      fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#dddddd', align: 'center', wordWrap: { width: 260 }
    }).setOrigin(0.5);

  const cG = s.add.graphics();
  cG.lineStyle(2, 0xEEF527, 1);
  const cPlat = s.add.rectangle(550, 360, 160, 12, 0x00aaff);
  const cPlayer = s.add.rectangle(550, 300, 18, 24, 0xffffff);
  const cEnemy = s.add.rectangle(550, enemyYValue, 30, 16, 0xff2222);
  const cBullet = s.add.rectangle(550, enemyYValue - 22, 6, 14, 0x00ffff);
  const cHint = s.add.text(550, 420, `Press ${currentShootKey.toUpperCase()} to pick`, {
    fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#aaaaaa'
  }).setOrigin(0.5);

  // Add to group
  s.modeGroup.addMultiple([
    overlay, title, help,
    nCardBorder, nTitle, nDesc, nG, nPlat, nPlayer, nEnemy, nBullet, nHint,
    cCardBorder, cTitle, cDesc, cG, cPlat, cPlayer, cEnemy, cBullet, cHint
  ]);

  // Input for Mode Select
  s.input.keyboard.on('keydown', (ev) => {
    if (!s.modeVisible) return;
    const raw = ev.key;
    const key = KEYBOARD_TO_ARCADE[raw] || raw;
    if (key === 'P1L') { s.modeIndex = 0; updateModeVisuals(); }
    else if (key === 'P1R') { s.modeIndex = 1; updateModeVisuals(); }
    else if (key === 'P1A') { confirmMode(); }
    else if (key === 'P1B' || raw === 'Escape') { hideModeSelect(s); }
  });

  // Click handlers on cards
  [nCardBorder, nTitle, nDesc, nPlat, nPlayer, nEnemy, nBullet, nG].forEach(obj => {
    obj.setInteractive({ useHandCursor: true }).on('pointerdown', () => { s.modeIndex = 0; updateModeVisuals(); confirmMode(); });
    obj.on('pointerover', () => { s.modeIndex = 0; updateModeVisuals(); });
  });
  [cCardBorder, cTitle, cDesc, cPlat, cPlayer, cEnemy, cBullet, cG].forEach(obj => {
    obj.setInteractive({ useHandCursor: true }).on('pointerdown', () => { s.modeIndex = 1; updateModeVisuals(); confirmMode(); });
    obj.on('pointerover', () => { s.modeIndex = 1; updateModeVisuals(); });
  });

  function updateModeVisuals() {
    const leftSel = s.modeIndex === 0;
    nCardBorder.setScale(leftSel ? 1.06 : 1);
    nCardBorder.setStrokeStyle(leftSel ? 3 : 2, 0xffffff, leftSel ? 1 : 0.8);
    nTitle.setColor(leftSel ? '#ffffff' : '#00ffff');

    const rightSel = s.modeIndex === 1;
    cCardBorder.setScale(rightSel ? 1.06 : 1);
    cCardBorder.setStrokeStyle(rightSel ? 3 : 2, 0xffffff, rightSel ? 1 : 0.8);
    cTitle.setColor(rightSel ? '#ffffff' : '#EEF527');
  }

  function confirmMode() {
    selectedMode = s.modeIndex === 0 ? 'normal' : 'challenger';
    hideModeSelect(s);
    s.scene.start('game', { mode: selectedMode });
  }

  s.updateModeVisuals = updateModeVisuals;
}

function showModeSelect(s) {
  s.modeVisible = true;
  s.modeGroup.setVisible(true);
  s.modeIndex = 0;
  if (s.updateModeVisuals) s.updateModeVisuals();
}
function hideModeSelect(s) {
  s.modeVisible = false;
  s.modeGroup.setVisible(false);
}

// ===== Rebinding helpers =====
function rebindShootKey(newKey) {
  const k = (newKey || '').toLowerCase();
  if (!/^[a-z]$/.test(k)) return;
  if (k === 'w' || k === 'a' || k === 's' || k === 'd') return;
  if (k === currentRayKey) return;
  if (currentShootKey && KEYBOARD_TO_ARCADE[currentShootKey] === 'P1A') {
    delete KEYBOARD_TO_ARCADE[currentShootKey];
  }
  currentShootKey = k;
  ARCADE_CONTROLS['P1A'] = [k];
  KEYBOARD_TO_ARCADE[k] = 'P1A';
}
function rebindRayKey(newKey) {
  const k = (newKey || '').toLowerCase();
  if (!/^[a-z]$/.test(k)) return;
  if (k === 'w' || k === 'a' || k === 's' || k === 'd') return;
  if (k === currentShootKey) return;
  if (currentRayKey && KEYBOARD_TO_ARCADE[currentRayKey] === 'P1B') {
    delete KEYBOARD_TO_ARCADE[currentRayKey];
  }
  currentRayKey = k;
  ARCADE_CONTROLS['P1B'] = [k];
  KEYBOARD_TO_ARCADE[k] = 'P1B';
}

// ======================= GAME SCENE ==========================
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

// Downwell-like variables
let player;
let platforms = [];
let bullets = [];
let platformsGroup;
let bulletsGroup;
let hazardsGroup;
let enemyBulletsGroup;
let leftHazard;
let rightHazard;
let hazardOn = true;
let hazardTimer = 0;
let hazardInterval = 1200;
let keysState = { left: false, right: false };
let wasOnGround = false;
let ammo = 3;
let maxAmmo = 10;
let maxDepth = 0;
let speed = 220;
let jump = 300;
let recoil = 240;
let enemiesGroup;
let powerUpsGroup;
let powerUps = [];
let jetpackActive = false;
let jetpackLeftBlock = null;
let jetpackRightBlock = null;
let isInvulnerable = false;
let invulnerabilityEndTime = 0;
let debugHitboxes = false;
let debugGraphics;
// Combo system
let comboCount = 0;
let comboMultiplier = 1;
let comboText;

// String constants
const FONT = 'Arial, sans-serif';
const C_BLACK = '#000000';
const C_WHITE = '#ffffff';
const C_CYAN = '#00ffff';
const C_YELLOW = '#ffff00';
const C_RED = '#ff0000';

// Infinite world helpers
let worldBottom = 20000;
const WORLD_CHUNK = 20000;
const WORLD_MARGIN = 1200;
let worldYOffset = 0;
const REBASE_THRESHOLD = 200000;
const REBASE_DELTA = 150000;

// Charge Shot state
let isCharging = false;
let chargeStartTime = 0;
let chargeVisuals = null;

// ===== Jumper balance constants =====
const JUMPER_SPAWN_CHANCE_BASE = 0.15;
const JUMPER_COOLDOWN_MIN_MS = 1200;
const JUMPER_COOLDOWN_MAX_MS = 2000;
const JUMPER_JUMP_VEL_Y = -250;

// Shooter Up enemy constants
const SHOOTER_SPAWN_CHANCE_BASE = 0.15;
const SHOOTER_COOLDOWN_MIN_MS = 1200;
const SHOOTER_COOLDOWN_MAX_MS = 1800;

// Dynamic Difficulty constants
const DIFFICULTY_DEPTH_STEP = 1000;
const DIFFICULTY_SPAWN_MULT_MAX = 2.5;
const DIFFICULTY_COUNT_MULT_MAX = 1.8;

// Enemy Shield constants
const SHIELDED_SPAWN_CHANCE = 0.08;

// Power-Up constants
const POWERUP_SPAWN_CHANCE = 0.20;
const POWERUP_MAX_ACTIVE = 2;
const INVULNERABILITY_DURATION_MS = 1500;
const FAILSAFE_HOLD_MS = 5000; // hold P1A+P1B for 5s to return to menu

// ===== Enemy bullets (UPWARD TRAJECTORY) =====
const ENEMY_BULLET_SPEED_Y = -360;

// ===== Scoring per enemy type =====
const SCORE_WALKER = 50;
const SCORE_JUMPER = 60;
const SCORE_SHOOTER = 80;
const SHIELD_SCORE_MULT = 1.5;

// ===== Ray Gun (Charge Shot) constants =====
const CHARGE_THRESHOLD_MS = 1000;
const CHARGE_COST_AMMO = 2;
const CHARGE_PIERCE_COUNT = 2;
const CHARGE_SLOWMO_SCALE = 3.33;
const CHARGE_RAY_MAX_DISTANCE = 2000;
const CHARGE_RAY_VISUAL_DURATION = 200;
const CHARGE_RAMP_IN_MS = 150;
const CHARGE_RAMP_OUT_MS = 180;

// ======== AUDIO DINÁMICO PARA CHARGE ========
const CHARGE_AUDIO_MIN_HZ = 440;
const CHARGE_AUDIO_MAX_HZ = 900;
let chargeOsc = null;
let chargeGain = null;
let chargeAudioCompleted = false;

function create(data) {
  const scene = this;

  // Save selected mode from menu
  selectedMode = (data && data.mode) ? data.mode : (selectedMode || 'challenger');

  // CHAINFALL scene init tone
  playTone(this, 440, 0.1);

  // Reset world/time
  if (this.physics && this.physics.world && this.physics.world.isPaused) this.physics.world.resume();
  if (this.physics && this.physics.world) this.physics.world.timeScale = 1.0;

  // Reset core state
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
  chargeAudioCompleted = false;
  stopChargeAudio(this);

  // Reset combo state
  comboCount = 0;
  comboMultiplier = 1;

  // Clear runtime arrays
  platforms = [];
  bullets = [];
  powerUps = [];

  // Reset jetpack state
  jetpackActive = false;
  jetpackLeftBlock = null;
  jetpackRightBlock = null;
  isInvulnerable = false;
  invulnerabilityEndTime = 0;
  // Reset failsafe in game scene
  fsPrimaryDown = false; fsSecondaryDown = false; failsafeStartTime = 0;

  // ===== Downwell-like setup =====
  if (this.physics && this.physics.world) {
    this.physics.world.setBounds(0, 0, 800, worldBottom);
  }

  // Physics groups
  platformsGroup = this.physics.add.staticGroup();
  bulletsGroup = this.physics.add.group();
  hazardsGroup = this.physics.add.staticGroup();
  enemiesGroup = this.physics.add.group();
  enemyBulletsGroup = this.physics.add.group({ allowGravity: false });
  powerUpsGroup = this.physics.add.group({ allowGravity: false });

  // Safe starting platform
  const startWidth = 160;
  const startX = 40 + startWidth / 2;
  const startY = 140;
  const startPlat = this.add.rectangle(startX, startY, startWidth, 12, 0xffff00);
  startPlat.setStrokeStyle(2, 0xffaa00, 0.9);
  this.physics.add.existing(startPlat, true);
  if (startPlat.body) {
    startPlat.body.checkCollision.up = startPlat.body.checkCollision.down = startPlat.body.checkCollision.left = startPlat.body.checkCollision.right = true;
    if (startPlat.body.updateFromGameObject) startPlat.body.updateFromGameObject();
  }
  startPlat.enemies = [];
  startPlat.noEnemies = true;
  if (platformsGroup) platformsGroup.add(startPlat);
  platforms.push(startPlat);

  // Player
  player = this.add.rectangle(startX, startY - 6 - 12, 18, 24, 0xffffff);
  player.setStrokeStyle(2, 0x00ffff, 0.6);
  this.physics.add.existing(player);
  if (player.body && player.body.setSize) player.body.setSize(player.displayWidth, player.displayHeight, true);
  player.body.setCollideWorldBounds(true);
  player.body.setMaxVelocity(300, 700);
  player.body.setDragX(800);
  player.body.enable = true;
  player.body.checkCollision.up = player.body.checkCollision.down = player.body.checkCollision.left = player.body.checkCollision.right = true;

  // Seed platforms
  seedPlatforms(this, 220, this.cameras.main.scrollY + 800);

  // Colliders & overlaps
  this.physics.add.collider(player, platformsGroup);
  this.physics.add.collider(bulletsGroup, platformsGroup, (b, _p) => { if (b && b.destroy) b.destroy(); });
  this.physics.add.overlap(bulletsGroup, enemiesGroup, (b, e) => onBulletHitsEnemy(this, b, e));
  this.physics.add.overlap(enemyBulletsGroup, player, (b, _p) => {
    if (!gameOver && !isInvulnerable) {
      if (b && b.destroy) b.destroy(); // destroy first to avoid multi-triggers
      if (jetpackActive) {
        onJetpackDamaged(this);
      } else {
        endGame(this);
      }
    }
  });

  // Failsafe key tracking (game scene)
  this.input.keyboard.on('keydown', (ev) => {
    const key = KEYBOARD_TO_ARCADE[ev.key] || ev.key;
    if (key === 'P1A') fsPrimaryDown = true;
    if (key === 'P1B') fsSecondaryDown = true;
    if (fsPrimaryDown && fsSecondaryDown && failsafeStartTime === 0) failsafeStartTime = scene.time.now;
  });
  this.input.keyboard.on('keyup', (ev) => {
    const key = KEYBOARD_TO_ARCADE[ev.key] || ev.key;
    if (key === 'P1A') fsPrimaryDown = false;
    if (key === 'P1B') fsSecondaryDown = false;
    if (!fsPrimaryDown || !fsSecondaryDown) failsafeStartTime = 0;
  });
  this.physics.add.collider(enemyBulletsGroup, platformsGroup, (b) => { if (b && b.destroy) b.destroy(); });
  this.physics.add.collider(enemiesGroup, platformsGroup);
  this.physics.add.collider(enemiesGroup, enemiesGroup, (a, b) => {
    if (a.platformRef && b.platformRef && a.platformRef === b.platformRef) {
      a.dir = -a.dir; b.dir = -b.dir;
      a.body.setVelocityX(a.dir * a.speed);
      b.body.setVelocityX(b.dir * b.speed);
    }
  });

  // Hazards
  setupHazards(this);
  this.physics.add.overlap(player, hazardsGroup, (_pl, _hz) => {
    if (hazardOn && !isInvulnerable) {
      if (jetpackActive) {
        onJetpackDamaged(this);
      } else {
        endGame(this);
      }
    }
  });
  this.physics.add.overlap(player, enemiesGroup, (p, e) => {
    if (!gameOver && !isInvulnerable) {
      if (jetpackActive) {
        onJetpackDamaged(this);
      } else {
        endGame(this);
      }
    }
  });

  // Power-Ups overlap
  this.physics.add.overlap(player, powerUpsGroup, (p, powerUp) => onPowerUpCollected(this, powerUp));

  // Camera
  this.cameras.main.startFollow(player, false, 0.1, 0.1);
  this.cameras.main.setBackgroundColor('#000000');

  // HUD
  const hudBg = this.add.rectangle(10, 10, 200, 90, 0x000000, 0.5);
  hudBg.setOrigin(0, 0);
  hudBg.setStrokeStyle(2, 0x00ffff, 0.4);
  hudBg.setScrollFactor(0); hudBg.setDepth(999);

  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '24px', fontFamily: 'Arial, sans-serif', color: '#00ff00', stroke: '#000000', strokeThickness: 2
  }).setScrollFactor(0).setDepth(1000);

  this.ammoText = this.add.text(16, 44, 'Ammo: ' + ammo, {
    fontSize: '20px', fontFamily: 'Arial, sans-serif', color: '#ffff00', stroke: '#000000', strokeThickness: 2
  }).setScrollFactor(0).setDepth(1000);

  comboText = this.add.text(16, 68, '', {
    fontSize: '20px', fontFamily: 'Arial, sans-serif', color: '#00ffff', stroke: '#000000', strokeThickness: 2
  }).setScrollFactor(0).setDepth(1000);

  const titleSplash = this.add.text(400, 200, 'CHAINFALL', {
    fontSize: '64px', fontFamily: 'Arial, sans-serif',
    color: '#ffffff', stroke: '#000000', strokeThickness: 6
  }).setOrigin(0.5).setScrollFactor(0);
  this.tweens.add({
    targets: titleSplash, alpha: { from: 1, to: 0 }, duration: 1200, delay: 300, ease: 'Quad.easeOut',
    onComplete: () => titleSplash.destroy()
  });

  // Input handlers (arcade mapping)
  this.input.keyboard.on('keydown', (event) => {
    const key = KEYBOARD_TO_ARCADE[event.key] || event.key;
    if (gameOver) {
      if (key === 'P1U') { gameOverIndex = (gameOverIndex + gameOverItems.length - 1) % gameOverItems.length; updateGameOverVisuals(); return; }
      if (key === 'P1D') { gameOverIndex = (gameOverIndex + 1) % gameOverItems.length; updateGameOverVisuals(); return; }
      if (key === 'P1A' || key === 'START1') {
        if (gameOverIndex === 0) { restartGame(scene); }
        else if (gameOverIndex === 1) { scene.scene.start('menu'); }
        return;
      }
    }
    if (key === 'P1L') keysState.left = true;
    if (key === 'P1R') keysState.right = true;
    if (key === 'P1U' && player && player.body && player.body.blocked.down) {
      player.body.setVelocityY(-jump);
      playTone(scene, 523, 0.05);
    }
    // P1A: normal shot in air
    if (key === 'P1A' && player && player.body && !player.body.blocked.down && ammo > 0 && !isCharging) {
      fireBullet(scene);
    }
    // P1B: start charge if airborne
    if (key === 'P1B' && player && player.body && !player.body.blocked.down && ammo > 1 && !isCharging) {
      startCharging(scene);
    }
  });
  this.input.keyboard.on('keyup', (event) => {
    const key = KEYBOARD_TO_ARCADE[event.key] || event.key;
    if (key === 'P1L') keysState.left = false;
    if (key === 'P1R') keysState.right = false;

    // P1B release: fire ray or cancel
    if (key === 'P1B' && isCharging) {
      const heldTime = scene.time.now - chargeStartTime;
      const isAirborne = player && player.body && !player.body.blocked.down;
      if (heldTime >= CHARGE_THRESHOLD_MS && ammo >= CHARGE_COST_AMMO && isAirborne) {
        stopCharging(scene, true);
        fireChargedBullet(scene);
      } else {
        stopCharging(scene, false);
      }
    }
  });

  // Debug hitboxes with P
  this.input.keyboard.on('keydown-P', () => {
    debugHitboxes = !debugHitboxes;
    if (!debugHitboxes && debugGraphics) debugGraphics.clear();
  });
  if (debugGraphics && !debugGraphics.scene) debugGraphics = null;
  if (debugGraphics) debugGraphics.destroy();
  debugGraphics = this.add.graphics();
  debugGraphics.setDepth(4500);

  // ===== Clean globals on scene shutdown/destroy (prevents stale .entries errors) =====
  const nullGlobals = () => {
    platformsGroup = null;
    bulletsGroup = null;
    hazardsGroup = null;
    enemiesGroup = null;
    enemyBulletsGroup = null;
    powerUpsGroup = null;
  };
  this.events.once('shutdown', nullGlobals);
  this.events.once('destroy', nullGlobals);
}

function update(_time, _delta) {
  checkFailsafe(this);
  if (gameOver) return;

  // Horizontal control
  if (player && player.body) {
    let vx = 0;
    if (keysState.left) vx -= speed;
    if (keysState.right) vx += speed;

    // keep X feel during slow-mo
    const timeScale = this.physics.world.timeScale || 1.0;
    if (isCharging && timeScale > 1.0) {
      vx = vx * timeScale;
    }
    player.body.setVelocityX(vx);

    // Cancel charge on ground
    if (isCharging && player.body.blocked.down) {
      stopCharging(this, false);
    }

    // Channel visuals
    if (isCharging && chargeVisuals) {
      chargeVisuals.clear();
      const progress = Math.min((this.time.now - chargeStartTime) / CHARGE_THRESHOLD_MS, 1.0);
      for (let i = 0; i < 3; i++) {
        const radius = 20 + (i * 12) + (progress * 10);
        const alpha = 0.6 - (i * 0.15);
        chargeVisuals.lineStyle(2, 0xEEF527, alpha);
        chargeVisuals.strokeCircle(player.x, player.y, radius);
      }
      // Progress bar
      if (progress < 1.0) {
        const barWidth = 30, barHeight = 4;
        const barX = player.x - barWidth / 2, barY = player.y - 20;
        chargeVisuals.fillStyle(0x000000, 0.6);
        chargeVisuals.fillRect(barX, barY, barWidth, barHeight);
        chargeVisuals.fillStyle(0xEEF527, 0.9);
        chargeVisuals.fillRect(barX, barY, barWidth * progress, barHeight);
      }
    }

    // Charge audio sweep
    if (isCharging) updateChargeAudio(this);

    // Land detection: reset ammo/combo
    const onGround = player.body.blocked.down;
    if (onGround && !wasOnGround) {
      if (ammo > maxAmmo || comboCount > 0) {
        comboCount = 0;
        comboMultiplier = 1;
        if (comboText) { comboText.setText(''); comboText.setScale(1); }
      }
      ammo = maxAmmo;
      if (this.ammoText) { this.ammoText.setText('Ammo: ' + ammo); this.ammoText.setColor('#ffff00'); }
      playTone(this, 440, 0.05);

      player.setFillStyle(0x00ffff);
      this.tweens.add({ targets: player, duration: 200, onComplete: () => player.setFillStyle(0xffffff) });
      for (let i = 0; i < 4; i++) {
        const px = player.x + (Math.random() - 0.5) * 20;
        const particle = this.add.rectangle(px, player.y + 12, 3, 3, 0x00aaff);
        this.physics.add.existing(particle);
        particle.body.setVelocity((Math.random() - 0.5) * 100, -Math.random() * 80);
        particle.body.setGravity(0, 400);
        this.tweens.add({ targets: particle, alpha: 0, duration: 400, onComplete: () => particle.destroy() });
      }
    }
    wasOnGround = onGround;
  }

  // Ensure platforms fill below camera; recycle
  const cam = this.cameras.main;
  cam.scrollY = Math.max(cam.scrollY, player.y - 260);
  ensureWorldCapacity(this, cam.scrollY + 1000);
  seedPlatforms(this, cam.scrollY + 100, cam.scrollY + 800);
  for (let i = 0; i < platforms.length; i++) {
    const p = platforms[i];
    if (p.y < cam.scrollY - 60) {
      const maxY = platforms.reduce((m, o) => Math.max(m, o.y), cam.scrollY + 300);
      positionPlatform(this, p, maxY + Phaser.Math.Between(70, 120));
      if (p.body && p.body.updateFromGameObject) p.body.updateFromGameObject();
    }
  }
  // Rebase coordinates to avoid large Y
  maybeRebaseWorld(this);

  // Cleanup bullets below view
  bullets = bullets.filter(b => {
    if (!b.active) return false;
    if (b.y > cam.scrollY + 700) { b.destroy(); return false; }
    return true;
  });

  // Enemy bullets: enforce straight up & cleanup
  if (enemyBulletsGroup) {
    safeEach(enemyBulletsGroup, (b) => {
      if (!b || !b.body) return;
      b.body.setAllowGravity(false);
      if (b.body.velocity.x !== 0) b.body.setVelocityX(0);
      if (b.body.velocity.y === 0) b.body.setVelocityY(ENEMY_BULLET_SPEED_Y);
      if (!b.active || b.y < cam.scrollY - 60 || b.y > cam.scrollY + 1200) { if (b.destroy) b.destroy(); }
    });
  }

  // Game over if player moves above visible area
  if (player && player.y < cam.scrollY - 20) {
    endGame(this);
    return;
  }

  // Cleanup power-ups by distance
  powerUps = powerUps.filter(p => {
    if (!p.active) return false;
    if (p.y > cam.scrollY + 800 || p.y < cam.scrollY - 100) {
      if (p.label && p.label.destroy) p.label.destroy();
      p.destroy();
      return false;
    }
    return true;
  });

  // Update jetpack blocks
  if (jetpackActive) updateJetpackPosition();

  // Update invulnerability
  if (isInvulnerable && this.time.now >= invulnerabilityEndTime) {
    isInvulnerable = false;
    player.setAlpha(1);
    player.setFillStyle(0xffffff);
  }

  // Hazards follow camera and toggle
  updateHazards(this);
  hazardTimer += _delta || 0;
  if (hazardTimer >= hazardInterval) {
    hazardTimer = 0;
    hazardOn = !hazardOn;
    hazardInterval = Phaser.Math.Between(900, 1800);
    setHazardVisual(this);
  }

  // Enemies movement & behaviors
  updateEnemies(this, _delta || 16);

  // Debug hitboxes
  if (debugHitboxes) drawHitboxes(this);
}

function ensureWorldCapacity(scene, targetY) {
  if (!scene.physics || !scene.physics.world) return;
  const need = (targetY || 0) + WORLD_MARGIN;
  if (need <= worldBottom) return;
  while (worldBottom < need) worldBottom += WORLD_CHUNK;
  scene.physics.world.setBounds(0, 0, 800, worldBottom);
}

function maybeRebaseWorld(scene) {
  const cam = scene.cameras.main;
  if (cam.scrollY < REBASE_THRESHOLD) return;
  const dy = REBASE_DELTA;
  worldYOffset += dy;

  cam.scrollY -= dy;
  if (player) player.y -= dy;

  for (let i = 0; i < platforms.length; i++) {
    const p = platforms[i];
    if (!p) continue;
    if (p.y != null) p.y -= dy;
    if (p.body && p.body.updateFromGameObject) p.body.updateFromGameObject();
  }

  safeEach(enemiesGroup, (e) => { if (e && e.y != null) e.y -= dy; });
  safeEach(bulletsGroup, (b) => { if (b && b.y != null) b.y -= dy; });
  safeEach(enemyBulletsGroup, (b) => { if (b && b.y != null) b.y -= dy; });

  safeEach(powerUpsGroup, (p) => {
    if (p && p.y != null) {
      p.y -= dy;
      if (p.label && p.label.y != null) p.label.y -= dy;
    }
  });

  if (jetpackLeftBlock) jetpackLeftBlock.y -= dy;
  if (jetpackRightBlock) jetpackRightBlock.y -= dy;

  if (leftHazard) { leftHazard.y -= dy; if (leftHazard.body && leftHazard.body.updateFromGameObject) leftHazard.body.updateFromGameObject(); }
  if (rightHazard) { rightHazard.y -= dy; if (rightHazard.body && rightHazard.body.updateFromGameObject) rightHazard.body.updateFromGameObject(); }
}

function endGame(scene) {
  gameOver = true;
  playTone(scene, 220, 0.5);

  // Clear charge
  if (isCharging) stopCharging(scene, false);
  stopChargeAudio(scene);

  // Clear jetpack
  if (jetpackActive) deactivateJetpack(scene);

  // Clear invulnerability
  isInvulnerable = false;
  invulnerabilityEndTime = 0;
  if (player) {
    player.setAlpha(1);
    player.setScale(1, 1);
  }

  // Restore time scale
  if (scene.physics && scene.physics.world) scene.physics.world.timeScale = 1.0;

  // Stop gameplay
  if (scene.physics && scene.physics.world) scene.physics.world.pause();
  if (scene.cameras && scene.cameras.main) scene.cameras.main.stopFollow();

  // Dark overlay with radial gradient effect
  const overlay = scene.add.graphics();
  overlay.fillStyle(0x000000, 0.88);
  overlay.fillRect(0, 0, 800, 600);
  overlay.setDepth(9999);
  overlay.setScrollFactor(0);

  // Add subtle scan lines for retro effect
  const scanLines = scene.add.graphics();
  for (let i = 0; i < 600; i += 4) {
    scanLines.fillStyle(0x000000, 0.15);
    scanLines.fillRect(0, i, 800, 2);
  }
  scanLines.setDepth(9999).setScrollFactor(0);

  // Animated particles burst
  for (let i = 0; i < 20; i++) {
    const px = 400 + (Math.random() - 0.5) * 600;
    const py = 300 + (Math.random() - 0.5) * 400;
    const particle = scene.add.rectangle(px, py, 3, 3, 0xff0000, 0.8);
    particle.setDepth(9998).setScrollFactor(0);
    scene.tweens.add({
      targets: particle,
      alpha: 0,
      scale: 0,
      y: py - 100,
      duration: 1500 + Math.random() * 1000,
      ease: 'Cubic.easeOut',
      onComplete: () => particle.destroy()
    });
  }

  // Glowing title
  const titleText = scene.add.text(400, 60, 'CHAINFALL', {
    fontSize: '48px',
    fontFamily: 'Arial, sans-serif',
    color: '#ffffff',
    stroke: '#00ffff',
    strokeThickness: 5
  }).setOrigin(0.5).setDepth(10000).setScrollFactor(0);
  scene.tweens.add({ 
    targets: titleText, 
    scale: { from: 1, to: 1.05 }, 
    duration: 1800, 
    yoyo: true, 
    repeat: -1, 
    ease: 'Sine.easeInOut' 
  });

  const cam = scene.cameras.main;
  const cx = 400;
  const cy = 200;

  // Epic GAME OVER text with glow
  const gameOverGlow = scene.add.text(cx, cy, 'GAME OVER', {
    fontSize: '72px',
    fontFamily: 'Arial, sans-serif',
    color: '#ff0000',
    align: 'center',
    stroke: '#ff6666',
    strokeThickness: 12
  }).setOrigin(0.5).setDepth(9999).setScrollFactor(0).setAlpha(0.3);
  scene.tweens.add({ 
    targets: gameOverGlow, 
    scale: { from: 1.1, to: 1.2 }, 
    alpha: { from: 0.2, to: 0.4 },
    duration: 600, 
    yoyo: true, 
    repeat: -1, 
    ease: 'Sine.easeInOut' 
  });

  const gameOverText = scene.add.text(cx, cy, 'GAME OVER', {
    fontSize: '72px',
    fontFamily: 'Arial, sans-serif',
    color: '#ff3333',
    align: 'center',
    stroke: '#990000',
    strokeThickness: 8
  }).setOrigin(0.5).setDepth(10000).setScrollFactor(0);
  scene.tweens.add({ 
    targets: gameOverText, 
    scale: { from: 1, to: 1.08 }, 
    duration: 800, 
    yoyo: true, 
    repeat: -1, 
    ease: 'Sine.easeInOut' 
  });

  // Score panel with border
  const scorePanelBg = scene.add.rectangle(cx, cy + 90, 400, 70, 0x0a0a1a, 0.85);
  scorePanelBg.setStrokeStyle(3, 0x00ffff, 0.6);
  scorePanelBg.setDepth(10000).setScrollFactor(0);

  const finalScoreLabel = scene.add.text(cx, cy + 75, 'FINAL SCORE', {
    fontSize: '18px', 
    fontFamily: 'Arial, sans-serif', 
    color: '#aaaaaa', 
    stroke: '#000000', 
    strokeThickness: 2
  }).setOrigin(0.5).setDepth(10001).setScrollFactor(0);

  const finalScoreText = scene.add.text(cx, cy + 100, score.toString(), {
    fontSize: '42px', 
    fontFamily: 'Arial, sans-serif', 
    color: '#00ffff', 
    stroke: '#004444', 
    strokeThickness: 5
  }).setOrigin(0.5).setDepth(10001).setScrollFactor(0);
  scene.tweens.add({
    targets: finalScoreText,
    scale: { from: 0.95, to: 1.05 },
    duration: 1200,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });

  // Instructions text with pulse
  const instructText = scene.add.text(cx, cy + 155, 'Use Arrow Keys  •  Press ' + currentShootKey.toUpperCase() + ' to Select', {
    fontSize: '16px', 
    fontFamily: 'Arial, sans-serif', 
    color: '#ffff00', 
    stroke: '#000000', 
    strokeThickness: 3
  }).setOrigin(0.5).setDepth(10001).setScrollFactor(0);
  scene.tweens.add({ 
    targets: instructText, 
    alpha: { from: 0.6, to: 1 }, 
    duration: 800, 
    yoyo: true, 
    repeat: -1, 
    ease: 'Sine.easeInOut' 
  });

  // Retry button
  const retryY = cy + 220;
  const retryBorder = scene.add.rectangle(cx, retryY, 280, 60, 0x001a1a, 0.7);
  retryBorder.setStrokeStyle(3, 0x00ff00, 0.9);
  retryBorder.setDepth(10000).setScrollFactor(0);
  
  const retryGlow = scene.add.rectangle(cx, retryY, 280, 60, 0x00ff00, 0.1);
  retryGlow.setDepth(9999).setScrollFactor(0);
  scene.tweens.add({
    targets: retryGlow,
    alpha: { from: 0.1, to: 0.25 },
    scale: { from: 1, to: 1.15 },
    duration: 1000,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });

  const retryBtn = scene.add.text(cx, retryY, '↻ RETRY', {
    fontSize: '32px', 
    fontFamily: 'Arial, sans-serif', 
    color: '#00ff00', 
    stroke: '#003300', 
    strokeThickness: 4
  }).setOrigin(0.5).setDepth(10001).setScrollFactor(0);

  // Main Menu button
  const menuY = cy + 300;
  const menuBorder = scene.add.rectangle(cx, menuY, 280, 60, 0x001a1a, 0.7);
  menuBorder.setStrokeStyle(3, 0x00ffff, 0.9);
  menuBorder.setDepth(10000).setScrollFactor(0);
  
  const menuGlow = scene.add.rectangle(cx, menuY, 280, 60, 0x00ffff, 0.1);
  menuGlow.setDepth(9999).setScrollFactor(0);

  const menuBtn = scene.add.text(cx, menuY, '⌂ MAIN MENU', {
    fontSize: '32px', 
    fontFamily: 'Arial, sans-serif', 
    color: '#00ffff', 
    stroke: '#003333', 
    strokeThickness: 4
  }).setOrigin(0.5).setDepth(10001).setScrollFactor(0);

  // Store elements for navigation
  gameOverItems = [retryBtn, menuBtn];
  gameOverBorders = [retryBorder, menuBorder];
  const gameOverGlows = [retryGlow, menuGlow];
  gameOverIndex = 0;

  // Update visuals function
  window.updateGameOverVisuals = () => {
    gameOverItems.forEach((item, idx) => {
      const isSelected = idx === gameOverIndex;
      const border = gameOverBorders[idx];
      const glow = gameOverGlows[idx];
      
      if (isSelected) {
        item.setScale(1.15);
        item.setColor(idx === 0 ? '#ffffff' : '#ffffff');
        border.setStrokeStyle(4, 0xffffff, 1);
        border.setFillStyle(idx === 0 ? 0x003300 : 0x003333, 0.9);
        border.setScale(1.1);
        scene.tweens.killTweensOf(glow);
        scene.tweens.add({
          targets: glow,
          alpha: { from: 0.3, to: 0.5 },
          scale: { from: 1.1, to: 1.25 },
          duration: 400,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      } else {
        item.setScale(1);
        item.setColor(idx === 0 ? '#00ff00' : '#00ffff');
        border.setStrokeStyle(3, idx === 0 ? 0x00ff00 : 0x00ffff, 0.9);
        border.setFillStyle(0x001a1a, 0.7);
        border.setScale(1);
        scene.tweens.killTweensOf(glow);
        scene.tweens.add({
          targets: glow,
          alpha: { from: 0.1, to: 0.25 },
          scale: { from: 1, to: 1.15 },
          duration: 1000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    });
    playTone(scene, 440, 0.05);
  };

  updateGameOverVisuals();

  // Mouse interactions
  retryBtn.setInteractive({ useHandCursor: true });
  retryBtn.on('pointerover', () => { gameOverIndex = 0; updateGameOverVisuals(); });
  retryBtn.on('pointerdown', () => { restartGame(scene); });

  menuBtn.setInteractive({ useHandCursor: true });
  menuBtn.on('pointerover', () => { gameOverIndex = 1; updateGameOverVisuals(); });
  menuBtn.on('pointerdown', () => { scene.scene.start('menu'); });
}

function restartGame(scene) {
  gameOver = false;
  score = 0;
  maxDepth = 0;
  ammo = maxAmmo;
  wasOnGround = false;
  keysState.left = keysState.right = false;
  comboCount = 0;
  comboMultiplier = 1;

  // Reset charge state + audio
  isCharging = false;
  chargeStartTime = 0;
  if (chargeVisuals) { chargeVisuals.destroy(); chargeVisuals = null; }
  chargeAudioCompleted = false;
  stopChargeAudio(scene);

  scoreText = null;
  comboText = null;
  platforms = [];
  bullets = [];
  // Restart with current mode preserved
  scene.scene.restart({ mode: selectedMode });
}

// ===== Helper functions =====
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
  rect.setStrokeStyle(1, 0x0088dd, 0.8);
  scene.physics.add.existing(rect, true);
  if (rect.body) {
    rect.body.checkCollision.up = rect.body.checkCollision.down = rect.body.checkCollision.left = rect.body.checkCollision.right = true;
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
  rect.setStrokeStyle(1, 0x0088dd, 0.8);
  rect.noEnemies = false;
  if (rect.body) {
    rect.body.checkCollision.up = rect.body.checkCollision.down = rect.body.checkCollision.left = rect.body.checkCollision.right = true;
    if (rect.body.updateFromGameObject) rect.body.updateFromGameObject();
  }
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
  b.body.checkCollision.up = b.body.checkCollision.down = b.body.checkCollision.left = b.body.checkCollision.right = true;
  b.body.setVelocityY(550);
  if (bulletsGroup) bulletsGroup.add(b);
  bullets.push(b);

  // Jetpack side shots
  if (jetpackActive && jetpackLeftBlock && jetpackRightBlock) {
    const bL = scene.add.rectangle(jetpackLeftBlock.x, jetpackLeftBlock.y + 10, 6, 14, bulletColor);
    bL.setStrokeStyle(1, strokeColor, 0.7);
    scene.physics.add.existing(bL);
    if (bL.body && bL.body.setSize) bL.body.setSize(6, 14, true);
    bL.body.setAllowGravity(false);
    bL.body.enable = true;
    bL.body.checkCollision.up = bL.body.checkCollision.down = bL.body.checkCollision.left = bL.body.checkCollision.right = true;
    bL.body.setVelocityY(550);
    if (bulletsGroup) bulletsGroup.add(bL);
    bullets.push(bL);

    const bR = scene.add.rectangle(jetpackRightBlock.x, jetpackRightBlock.y + 10, 6, 14, bulletColor);
    bR.setStrokeStyle(1, strokeColor, 0.7);
    scene.physics.add.existing(bR);
    if (bR.body && bR.body.setSize) bR.body.setSize(6, 14, true);
    bR.body.setAllowGravity(false);
    bR.body.enable = true;
    bR.body.checkCollision.up = bR.body.checkCollision.down = bR.body.checkCollision.left = bR.body.checkCollision.right = true;
    bR.body.setVelocityY(550);
    if (bulletsGroup) bulletsGroup.add(bR);
    bullets.push(bR);
  }

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
function getDifficultyMultiplier() {
  const depth = Math.max(0, player.y - 150);
  const steps = Math.floor(depth / DIFFICULTY_DEPTH_STEP);
  return Math.min(steps * 0.15, 1);
}
function maybeSpawnEnemies(scene, platform) {
  if (!enemiesGroup) return;
  if (platform && platform.noEnemies) return;
  const pw = platform.displayWidth || 100;
  const diffMult = getDifficultyMultiplier();
  const countMult = 1 + (diffMult * (DIFFICULTY_COUNT_MULT_MAX - 1));
  let count = 0;
  const baseChance = 75 + Math.floor(diffMult * 15);
  if (Phaser.Math.Between(0, 99) < baseChance) count = 1;
  const secondChance = 12 + Math.floor(diffMult * 28);
  if (pw > 140 && Phaser.Math.Between(0, 99) < secondChance) count = Math.min(2, count + 1);
  const maxEnemies = Math.floor(2 * countMult);
  for (let i = 0; i < count && platform.enemies.length < maxEnemies; i++) {
    spawnEnemy(scene, platform);
  }
}
function spawnEnemy(scene, platform) {
  const diffMult = getDifficultyMultiplier();
  const shooterChance = SHOOTER_SPAWN_CHANCE_BASE + (diffMult * (DIFFICULTY_SPAWN_MULT_MAX - 1) * SHOOTER_SPAWN_CHANCE_BASE);
  const jumperChance = JUMPER_SPAWN_CHANCE_BASE + (diffMult * (DIFFICULTY_SPAWN_MULT_MAX - 1) * JUMPER_SPAWN_CHANCE_BASE);
  const isShooter = Math.random() < shooterChance;
  const isJumper = !isShooter && Math.random() < jumperChance;
  const pw = platform.displayWidth;
  const minX = platform.x - pw / 2 + 16;
  const maxX = platform.x + pw / 2 - 16;
  const ex = Phaser.Math.Between(Math.floor(minX), Math.floor(maxX));
  const ph = platform.displayHeight || 12;
  const eh = 14;
  const ew = 28;
  const ey = platform.y - ph / 2 - eh / 2;
  const enemy = scene.add.rectangle(ex, ey, ew, eh, isShooter ? 0xF527EE : (isJumper ? 0x27f565 : 0xff2222));
  enemy.type = isShooter ? 'shooterUp' : (isJumper ? 'jumper' : 'walker');

  enemy.shielded = Math.random() < SHIELDED_SPAWN_CHANCE;
  const strokeWidth = enemy.shielded ? 3 : 1;
  const strokeColor = enemy.shielded ? 0x00ffff : (isShooter ? 0xF74DF2 : (isJumper ? 0x27f565 : 0xff6666));
  enemy.setStrokeStyle(strokeWidth, strokeColor, 0.8);

  scene.physics.add.existing(enemy);

  scene.tweens.add({
    targets: enemy,
    alpha: { from: 1, to: enemy.shielded ? 0.7 : 0.85 },
    duration: enemy.shielded ? 600 : 800,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });

  if (enemy.body && enemy.body.setAllowGravity) {
    enemy.body.setAllowGravity(isJumper);
  }

  enemy.body.setSize(ew, eh, true);
  enemy.body.enable = true;
  enemy.body.checkCollision.up = enemy.body.checkCollision.down = enemy.body.checkCollision.left = enemy.body.checkCollision.right = true;

  enemy.minX = platform.x - pw / 2 + 14;
  enemy.maxX = platform.x + pw / 2 - 14;
  enemy.dir = Phaser.Math.Between(0, 1) ? 1 : -1;
  enemy.speed = isShooter ? Phaser.Math.Between(10, 30) : Phaser.Math.Between(40, 80);
  enemy.platformRef = platform;

  if (isJumper) {
    enemy.jumpCooldownMs = Phaser.Math.Between(JUMPER_COOLDOWN_MIN_MS, JUMPER_COOLDOWN_MAX_MS);
    enemy.jumpTimerMs = 0;
    enemy.jumpVelY = JUMPER_JUMP_VEL_Y;
  }
  if (isShooter) {
    enemy.shootCooldownMs = Phaser.Math.Between(SHOOTER_COOLDOWN_MIN_MS, SHOOTER_COOLDOWN_MAX_MS);
    enemy.shootTimerMs = 0;
  }

  enemy.body.setVelocityX(enemy.dir * enemy.speed);
  enemy.body.setVelocityY(0);

  enemiesGroup.add(enemy);
  platform.enemies.push(enemy);
}

function updateEnemies(scene, deltaMs) {
  safeEach(enemiesGroup, (e) => {
    if (!e.active || !e.body) return;
    const isJumper = e.type === 'jumper';
    const isShooter = e.type === 'shooterUp';
    if (!isJumper && e.body.velocity.y !== 0) e.body.setVelocityY(0);
    if (Math.abs(e.body.velocity.x) < 5) e.body.setVelocityX(e.dir * e.speed);
    if (e.x <= e.minX && e.body.velocity.x < 0) { e.dir = 1; e.body.setVelocityX(e.dir * e.speed); }
    else if (e.x >= e.maxX && e.body.velocity.x > 0) { e.dir = -1; e.body.setVelocityX(e.dir * e.speed); }

    if (isJumper) {
      e.jumpTimerMs = (e.jumpTimerMs || 0) + (deltaMs || 0);
      if (e.body.blocked && e.body.blocked.down && e.jumpTimerMs >= (e.jumpCooldownMs || JUMPER_COOLDOWN_MIN_MS)) {
        e.body.setVelocityY(e.jumpVelY || JUMPER_JUMP_VEL_Y);
        e.jumpTimerMs = 0;
        scene.tweens.add({ targets: e, scaleY: { from: 0.9, to: 1 }, duration: 120, ease: 'Quad.easeOut' });
      }
    }

    if (isShooter) {
      e.shootTimerMs = (e.shootTimerMs || 0) + (deltaMs || 0);
      if (e.shootTimerMs >= (e.shootCooldownMs || SHOOTER_COOLDOWN_MIN_MS)) {
        // enemy bullet straight up
        const by = e.y - (e.displayHeight || 14) / 2;
        const b = scene.add.rectangle(e.x, by, 4, 12, 0xFC03F5);
        scene.physics.add.existing(b);
        if (b.body) {
          b.body.setAllowGravity(false);
          b.body.setGravity(0, 0);
          b.body.setDrag(0, 0);
          b.body.setAcceleration(0, 0);
          b.body.setImmovable(false);
          b.body.moves = true;
          b.body.setVelocityX(0);
          b.body.setVelocityY(ENEMY_BULLET_SPEED_Y);
        }
        if (enemyBulletsGroup) enemyBulletsGroup.add(b);
        e.shootTimerMs = 0;
        const shooters = safeChildren(enemiesGroup).filter(x => x && x.type === 'shooterUp').length;
        const mult = shooters > 2 ? 1.3 : 1;
        e.shootCooldownMs = Phaser.Math.Between(SHOOTER_COOLDOWN_MIN_MS, SHOOTER_COOLDOWN_MAX_MS) * mult;
      }
    }
  });

  platforms.forEach(p => {
    if (p.enemies) p.enemies = p.enemies.filter(e => e.active);
  });
}

function onBulletHitsEnemy(scene, bullet, enemy) {
  // Shield logic
  if (enemy && enemy.active && enemy.shielded) {
    const isChargedBullet = bullet && bullet.isCharged;
    if (!isChargedBullet) {
      if (bullet && bullet.destroy) bullet.destroy();
      const flash = scene.add.circle(enemy.x, enemy.y, enemy.displayWidth / 2 + 4, 0x00ffff, 0.6);
      flash.setDepth(1500);
      scene.tweens.add({ targets: flash, scale: 1.4, alpha: 0, duration: 200, ease: 'Quad.easeOut', onComplete: () => flash.destroy() });
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const p = scene.add.rectangle(enemy.x, enemy.y, 3, 3, 0x00ffff);
        scene.physics.add.existing(p);
        p.body.setVelocity(Math.cos(angle) * 180, Math.sin(angle) * 180);
        p.body.setGravity(0, 0);
        scene.tweens.add({ targets: p, alpha: 0, scale: 0, duration: 250, onComplete: () => p.destroy() });
      }
      playTone(scene, 800, 0.08);
      return; // Enemy survives
    }
  }

  // Bullet cleanup
  if (bullet && bullet.isCharged && bullet.pierceCount > 0) {
    bullet.pierceCount--;
    if (bullet.pierceCount <= 0 && bullet.destroy) bullet.destroy();
  } else {
    if (bullet && bullet.destroy) bullet.destroy();
  }

  // Enemy death & scoring/combo rules
  if (enemy && enemy.active) {
    // Preserve properties needed after destroy
    const wasShielded = !!enemy.shielded;
    const ex = enemy.x; const ey = enemy.y;
    // death particles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const particle = scene.add.rectangle(enemy.x, enemy.y, 4, 4, 0xff6666);
      scene.physics.add.existing(particle);
      particle.body.setVelocity(Math.cos(angle) * 150, Math.sin(angle) * 150);
      particle.body.setGravity(0, 300);
      scene.tweens.add({ targets: particle, alpha: 0, scale: 0, duration: 500, onComplete: () => particle.destroy() });
    }

    const p = enemy.platformRef;
    if (p && p.enemies) p.enemies = p.enemies.filter(x => x !== enemy);

    const isAirborne = player && player.body && !player.body.blocked.down;
    const baseTypeScore = enemy.type === 'jumper' ? SCORE_JUMPER : (enemy.type === 'shooterUp' ? SCORE_SHOOTER : SCORE_WALKER);
    const baseScore = enemy.shielded ? Math.floor(baseTypeScore * SHIELD_SCORE_MULT) : baseTypeScore;

    let earnedScore = baseScore;

    if (isAirborne) {
      // === Full combo logic (same for BOTH modes) ===
      const wasComboZero = comboCount === 0;
      comboCount++;
      comboMultiplier = 1 + (comboCount * 0.5);
      earnedScore = Math.floor(baseScore * comboMultiplier);
      score += earnedScore;

      // VFX/SFX like Challenger
      const tiers = [
        [10,'#ff00ff',28,5,0.02,'GODLIKE!'],
        [7,'#ff0080',24,4,0.015,'INSANE!'],
        [5,'#ff4400',22,4,0.012,'AMAZING!'],
        [3,'#ffff00',20,3,0.008,'GREAT!']
      ];
      const tier = tiers.find(t => comboCount >= t[0]) || [0,'#00ffff',18,3,0.005,''];
      let [, textColor, textSize, strokeThickness, shakeIntensity, comboMessage] = tier;

      const t = scene.add.text(enemy.x, enemy.y - 10, '+' + earnedScore, {
        fontSize: textSize + 'px', fontFamily: FONT, color: textColor, stroke: C_BLACK, strokeThickness: strokeThickness
      }).setOrigin(0.5);
      scene.tweens.add({ targets: t, y: t.y - 30, scale: { from: 0.5, to: 1.2 }, alpha: 0, duration: 700, ease: 'Back.easeOut', onComplete: () => t.destroy() });

      if (!comboMessage && comboCount === 1) comboMessage = 'COMBO START!';
      if (comboMessage) {
        const msg = scene.add.text(enemy.x, enemy.y - 35, comboMessage, {
          fontSize: (textSize + 4) + 'px', fontFamily: FONT, color: textColor, stroke: C_WHITE, strokeThickness: 2
        }).setOrigin(0.5);
        scene.tweens.add({ targets: msg, y: msg.y - 40, scale: { from: 1.5, to: 0.8 }, alpha: { from: 1, to: 0 }, duration: 1000, ease: 'Power2', onComplete: () => msg.destroy() });
      }
      if (comboText) {
        comboText.setText('COMBO x' + comboMultiplier.toFixed(1) + ' (' + comboCount + ')');
        const scale = 1 + (comboCount * 0.1); comboText.setScale(Math.min(scale, 2));
      }
      if (scene.cameras && scene.cameras.main) scene.cameras.main.shake(200, shakeIntensity);
      const pitchMultiplier = 1 + (comboCount * 0.1);
      playTone(scene, 660 * pitchMultiplier, 0.08);

      // === Ammo rules diverge by mode ===
      if (selectedMode === 'normal') {
        ammo = maxAmmo; // ONLY difference in Normal mode
      } else {
        ammo = wasComboZero ? maxAmmo : (ammo + 1);
      }

      if (scene.ammoText) {
        scene.ammoText.setText('Ammo: ' + ammo);
        scene.ammoText.setColor(textColor);
        scene.tweens.add({ targets: scene.ammoText, scale: { from: 1, to: 1.3 }, duration: 150, yoyo: true, ease: 'Quad.easeOut' });
      }
    } else {
      // Grounded kill (no combo gain)
      score += earnedScore;

      // Ammo rules
      if (selectedMode === 'normal') {
        ammo = maxAmmo; // refill on ANY bullet kill
      } else {
        ammo = Math.min(maxAmmo, ammo + 1);
      }

      const t = scene.add.text(enemy.x, enemy.y - 10, '+' + baseScore, {
        fontSize: '16px', fontFamily: FONT, color: '#ffdd55', stroke: C_BLACK, strokeThickness: 2
      }).setOrigin(0.5);
      scene.tweens.add({ targets: t, y: t.y - 20, alpha: 0, duration: 500, onComplete: () => t.destroy() });

      if (scene.ammoText) { scene.ammoText.setText('Ammo: ' + ammo); scene.ammoText.setColor('#ffff00'); }
      playTone(scene, 660, 0.08);
    }

    if (scoreText) scoreText.setText('Score: ' + score);
    enemy.destroy();

    // Guaranteed Jetpack drop for shielded enemies, unless player already has jetpack
    let spawnedPU = false;
    if (wasShielded && !jetpackActive) {
      spawnPowerUp(scene, ex, ey - 40);
      spawnedPU = true;
    }

    // Spawn power-up on airborne kills (only if jetpack not active and none spawned yet)
    const isAirborneAfter = player && player.body && !player.body.blocked.down;
    if (!spawnedPU && isAirborneAfter && !jetpackActive && false && Math.random() < POWERUP_SPAWN_CHANCE && powerUps.length < POWERUP_MAX_ACTIVE) {
      spawnPowerUp(scene, ex, ey - 40);
    }
  }
}


function spawnPowerUp(scene, x, y) {
  if (!powerUpsGroup) return;
  const powerUp = scene.add.rectangle(x, y, 20, 20, 0xff9900, 0.9);
  powerUp.setStrokeStyle(3, 0xffcc00, 1);

  const label = scene.add.text(x, y, '🚀', { fontSize: '16px', align: 'center' }).setOrigin(0.5);
  label.setDepth(1500);
  powerUp.label = label;

  scene.physics.add.existing(powerUp);
  powerUp.body.setAllowGravity(false);
  if (powerUpsGroup) powerUpsGroup.add(powerUp);
  powerUps.push(powerUp);

  scene.tweens.add({
    targets: [powerUp, label],
    scale: { from: 0.9, to: 1.1 },
    duration: 500,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
  scene.tweens.add({ targets: powerUp, angle: 360, duration: 3000, repeat: -1, ease: 'Linear' });
}

function onPowerUpCollected(scene, powerUp) {
  if (!powerUp || !powerUp.active) return;
  activateJetpack(scene);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const p = scene.add.rectangle(powerUp.x, powerUp.y, 4, 4, 0xff9900);
    scene.physics.add.existing(p);
    p.body.setVelocity(Math.cos(angle) * 150, Math.sin(angle) * 150);
    p.body.setGravity(0, 0);
    scene.tweens.add({ targets: p, alpha: 0, scale: 0, duration: 400, onComplete: () => p.destroy() });
  }
  playTone(scene, 880, 0.1); playTone(scene, 1100, 0.1);
  if (powerUp.label && powerUp.label.destroy) powerUp.label.destroy();
  powerUp.destroy();
  powerUps = powerUps.filter(p => p !== powerUp);
}

function activateJetpack(scene) {
  jetpackActive = true;
  const offsetX = 14;
  jetpackLeftBlock = scene.add.rectangle(player.x - offsetX, player.y, 8, 16, 0x888888);
  jetpackLeftBlock.setStrokeStyle(1, 0xaaaaaa, 0.8);
  jetpackLeftBlock.setDepth(player.depth - 1);
  jetpackRightBlock = scene.add.rectangle(player.x + offsetX, player.y, 8, 16, 0x888888);
  jetpackRightBlock.setStrokeStyle(1, 0xaaaaaa, 0.8);
  jetpackRightBlock.setDepth(player.depth - 1);
  scene.tweens.add({
    targets: [jetpackLeftBlock, jetpackRightBlock],
    alpha: { from: 1, to: 0.6 },
    duration: 150, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
  });
  playTone(scene, 660, 0.15);
}
function deactivateJetpack(scene) {
  jetpackActive = false;
  if (jetpackLeftBlock) { jetpackLeftBlock.destroy(); jetpackLeftBlock = null; }
  if (jetpackRightBlock) { jetpackRightBlock.destroy(); jetpackRightBlock = null; }
  playTone(scene, 440, 0.1);
}
function updateJetpackPosition() {
  if (!jetpackActive || !player) return;
  const offsetX = 14;
  if (jetpackLeftBlock) { jetpackLeftBlock.x = player.x - offsetX; jetpackLeftBlock.y = player.y; }
  if (jetpackRightBlock) { jetpackRightBlock.x = player.x + offsetX; jetpackRightBlock.y = player.y; }
}
function onJetpackDamaged(scene) {
  if (!jetpackActive || isInvulnerable) return;

  // Activate invulnerability immediately
  isInvulnerable = true;
  invulnerabilityEndTime = scene.time.now + INVULNERABILITY_DURATION_MS;

  scene.tweens.killTweensOf(player);
  player.setAlpha(1);
  player.setScale(1, 1);

  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const p = scene.add.rectangle(player.x, player.y, 4, 4, 0xff6600);
    scene.physics.add.existing(p);
    p.body.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);
    p.body.setGravity(0, 300);
    scene.tweens.add({ targets: p, alpha: 0, scale: 0, duration: 400, onComplete: () => p.destroy() });
  }

  player.setFillStyle(0xff0000);
  scene.tweens.add({
    targets: player,
    scaleX: { from: 1, to: 1.1 },
    scaleY: { from: 1, to: 1.1 },
    duration: 100,
    yoyo: true,
    repeat: 2,
    onComplete: () => {
      player.setFillStyle(0xffffff);
      player.setScale(1, 1);
      startInvulnerabilityFlicker(scene);
    }
  });

  playTone(scene, 220, 0.15);
  playTone(scene, 180, 0.15);
  deactivateJetpack(scene);
}
function startInvulnerabilityFlicker(scene) {
  if (!isInvulnerable) return;
  scene.tweens.add({
    targets: player,
    alpha: { from: 0.3, to: 1 },
    duration: 150,
    yoyo: true,
    repeat: Math.floor(INVULNERABILITY_DURATION_MS / 300) - 1,
    ease: 'Linear',
    onComplete: () => {
      if (player) { player.setAlpha(1); player.setFillStyle(0xffffff); }
    }
  });
}

// ===== Charge Shot helpers =====
function startCharging(scene) {
  if (isCharging) return;
  isCharging = true;
  chargeStartTime = scene.time.now;
  chargeAudioCompleted = false;

  if (scene.physics && scene.physics.world) scene.physics.world.timeScale = CHARGE_SLOWMO_SCALE;
  if (!chargeVisuals) {
    chargeVisuals = scene.add.graphics();
    chargeVisuals.setDepth(999);
    chargeVisuals.setScrollFactor(1);
  }
  scene.tweens.add({
    targets: chargeVisuals,
    alpha: { from: 0.8, to: 0.3 },
    duration: 400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
  });

  startChargeAudio(scene);
}
function stopCharging(scene, fired = false) {
  if (!isCharging) return;
  isCharging = false;

  if (scene.physics && scene.physics.world) scene.physics.world.timeScale = 1.0;

  if (chargeVisuals) {
    scene.tweens.killTweensOf(chargeVisuals);
    chargeVisuals.clear();
    chargeVisuals.destroy();
    chargeVisuals = null;
  }

  stopChargeAudio(scene);
  chargeAudioCompleted = false;

  if (fired) {
    const ring = scene.add.circle(player.x, player.y, 10, 0xEEF527, 0.7);
    ring.setDepth(1000);
    scene.tweens.add({ targets: ring, scale: 4, alpha: 0, duration: 250, ease: 'Quad.easeOut', onComplete: () => ring.destroy() });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const p = scene.add.rectangle(player.x, player.y, 4, 4, 0xEEF527);
      p.setDepth(1000);
      scene.physics.add.existing(p);
      p.body.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);
      p.body.setGravity(0, 0);
      scene.tweens.add({ targets: p, alpha: 0, scale: 0, duration: 300, onComplete: () => p.destroy() });
    }
    scene.cameras.main.shake(150, 0.006);
    playTone(scene, 1000, 0.12);
  }
}
function fireChargedBullet(scene) {
  // Instant ray down
  const rayColor = 0xEEF527;
  const rayStart = { x: player.x, y: player.y + 12 };
  const rayEnd = { x: player.x, y: player.y + CHARGE_RAY_MAX_DISTANCE };

  const CHARGE_RAY_WIDTH_OUTER = 40;
  const CHARGE_RAY_WIDTH_MID   = 20;
  const CHARGE_RAY_WIDTH_CORE  = 10;

  const rayGraphics = scene.add.graphics();
  rayGraphics.setDepth(1500);
  rayGraphics.lineStyle(CHARGE_RAY_WIDTH_OUTER, rayColor, 0.3); rayGraphics.lineBetween(rayStart.x, rayStart.y, rayEnd.x, rayEnd.y);
  rayGraphics.lineStyle(CHARGE_RAY_WIDTH_MID, rayColor, 0.7); rayGraphics.lineBetween(rayStart.x, rayStart.y, rayEnd.x, rayEnd.y);
  rayGraphics.lineStyle(CHARGE_RAY_WIDTH_CORE, 0xFFFFFF, 1.0); rayGraphics.lineBetween(rayStart.x, rayStart.y, rayEnd.x, rayEnd.y);
  scene.tweens.add({ targets: rayGraphics, alpha: 0, duration: CHARGE_RAY_VISUAL_DURATION, ease: 'Quad.easeOut', onComplete: () => rayGraphics.destroy() });

  // Detect enemies under player within narrow X alignment
  const hitEnemies = [];
  safeEach(enemiesGroup, (enemy) => {
    if (!enemy.active) return;
    const horizontalDist = Math.abs(enemy.x - player.x);
    if (horizontalDist <= 20 && enemy.y > player.y) {
      const distanceFromPlayer = enemy.y - player.y;
      hitEnemies.push({ enemy, distance: distanceFromPlayer });
    }
  });
  hitEnemies.sort((a, b) => a.distance - b.distance);
  const maxHits = CHARGE_PIERCE_COUNT;
  const actualHits = Math.min(hitEnemies.length, maxHits);
  for (let i = 0; i < actualHits; i++) {
    const { enemy } = hitEnemies[i];
    const impactFlash = scene.add.circle(enemy.x, enemy.y, 12, rayColor, 0.8);
    impactFlash.setDepth(1600);
    scene.tweens.add({ targets: impactFlash, scale: 2.5, alpha: 0, duration: 250, ease: 'Power2', onComplete: () => impactFlash.destroy() });
    for (let j = 0; j < 6; j++) {
      const angle = (j / 6) * Math.PI * 2;
      const p = scene.add.rectangle(enemy.x, enemy.y, 3, 3, rayColor);
      p.setDepth(1600);
      scene.physics.add.existing(p);
      p.body.setVelocity(Math.cos(angle) * 150, Math.sin(angle) * 150);
      p.body.setGravity(0, 0);
      scene.tweens.add({ targets: p, alpha: 0, scale: 0, duration: 300, onComplete: () => p.destroy() });
    }
    onBulletHitsEnemy(scene, { isCharged: true, pierceCount: 999 }, enemy);
  }

  // Ammo & recoil
  ammo -= CHARGE_COST_AMMO;
  if (scene.ammoText) {
    scene.ammoText.setText('Ammo: ' + ammo);
    scene.ammoText.setColor(comboCount > 0 ? '#00ffff' : '#ffff00');
  }
  if (player && player.body) {
    const recoilY = recoil * 0.5;
    player.body.setVelocityY(Math.min(player.body.velocity.y - recoilY, -recoilY));
  }
  playTone(scene, 1200, 0.15);
}

// ===== Debug helpers =====
function drawHitboxes(scene) {
  if (!debugGraphics) return;
  debugGraphics.clear();
  if (player && player.body) {
    debugGraphics.lineStyle(1, 0x00ff00, 1);
    debugGraphics.strokeRect(player.body.x, player.body.y, player.body.width, player.body.height);
  }
  safeEach(enemiesGroup, (e) => {
    if (e.body) {
      debugGraphics.lineStyle(1, 0xffa500, 1);
      debugGraphics.strokeRect(e.body.x, e.body.y, e.body.width, e.body.height);
    }
  });
  safeEach(bulletsGroup, (b) => {
    if (b.body) {
      debugGraphics.lineStyle(1, 0xffff00, 1);
      debugGraphics.strokeRect(b.body.x, b.body.y, b.body.width, b.body.height);
    }
  });
}

// ===== Side hazard helpers =====
function setupHazards(scene) {
  const cam = scene.cameras.main;
  leftHazard = scene.add.rectangle(6, cam.scrollY + 300, 12, 640, 0xff2222, hazardOn ? 0.6 : 0.12);
  scene.physics.add.existing(leftHazard, true);
  hazardsGroup.add(leftHazard);
  if (leftHazard.body && leftHazard.body.updateFromGameObject) leftHazard.body.updateFromGameObject();
  rightHazard = scene.add.rectangle(794, cam.scrollY + 300, 12, 640, 0xff2222, hazardOn ? 0.6 : 0.12);
  scene.physics.add.existing(rightHazard, true);
  hazardsGroup.add(rightHazard);
  if (rightHazard.body && rightHazard.body.updateFromGameObject) rightHazard.body.updateFromGameObject();
}
function updateHazards(scene) {
  const cam = scene.cameras.main;
  if (leftHazard) { leftHazard.y = cam.scrollY + 300; if (leftHazard.body && leftHazard.body.updateFromGameObject) leftHazard.body.updateFromGameObject(); }
  if (rightHazard) { rightHazard.y = cam.scrollY + 300; if (rightHazard.body && rightHazard.body.updateFromGameObject) rightHazard.body.updateFromGameObject(); }
}
function setHazardVisual(_scene) {
  const a = hazardOn ? 0.6 : 0.12;
  if (leftHazard) leftHazard.setFillStyle(0xff2222, a);
  if (rightHazard) rightHazard.setFillStyle(0xff2222, a);
}

// ====== AUDIO ======
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

/* =========================
   AUDIO DINÁMICO DE CARGA
   ========================= */
function startChargeAudio(scene) {
  stopChargeAudio(scene);
  const ac = scene.sound.context;
  chargeOsc = ac.createOscillator();
  chargeGain = ac.createGain();
  chargeOsc.type = 'sine';
  chargeOsc.frequency.value = CHARGE_AUDIO_MIN_HZ;
  chargeGain.gain.setValueAtTime(0.02, ac.currentTime);
  chargeOsc.connect(chargeGain);
  chargeGain.connect(ac.destination);
  chargeOsc.start();
}
function stopChargeAudio(scene) {
  const ac = scene?.sound?.context;
  const now = ac?.currentTime ?? 0;
  try {
    if (chargeGain && ac) {
      chargeGain.gain.cancelScheduledValues(now);
      chargeGain.gain.setValueAtTime(chargeGain.gain.value ?? 0.02, now);
      chargeGain.gain.linearRampToValueAtTime(0.0001, now + 0.03);
    }
    if (chargeOsc) chargeOsc.stop(now + 0.03);
  } catch (_) {}
  try { if (chargeOsc) chargeOsc.disconnect(); } catch (_) {}
  try { if (chargeGain) chargeGain.disconnect(); } catch (_) {}
  chargeOsc = null;
  chargeGain = null;
}
function updateChargeAudio(scene) {
  if (!chargeOsc || !scene) return;
  const threshold = Math.max(1, CHARGE_THRESHOLD_MS);
  const elapsed = scene.time.now - chargeStartTime;
  const rawProgress = elapsed / threshold;
  const progress = Phaser.Math.Clamp(rawProgress, 0, 1);
  const t = progress;
  const freq = CHARGE_AUDIO_MIN_HZ + (CHARGE_AUDIO_MAX_HZ - CHARGE_AUDIO_MIN_HZ) * t;
  const ac = scene.sound.context;
  chargeOsc.frequency.setValueAtTime(freq, ac.currentTime);
  if (!chargeAudioCompleted && progress >= 1) {
    chargeAudioCompleted = true;
    stopChargeAudio(scene);
    // Optional ready ping:
    // playTone(scene, 750, 0.06);
  }
}
