// POTASIUMABYSS - Platanus Hack 25
// ARCADE CONTROLS (Player 1 only: WASD + U/I/O/J/K/L)
const ARCADE_CONTROLS = {
  'P1U': ['w'],
  'P1D': ['s'],
  'P1L': ['a'],
  'P1R': ['d'],
  'P1A': ['u'],
  'P1B': ['i'],
  'P1C': ['o'],
  'P1X': ['j'],
  'P1Y': ['k'],
  'P1Z': ['l'],
  'START1': ['1', 'Enter']
};

const KEYBOARD_TO_ARCADE = {};
for (const [arcadeCode, keyboardKeys] of Object.entries(ARCADE_CONTROLS)) {
  if (keyboardKeys) {
    const keys = Array.isArray(keyboardKeys) ? keyboardKeys : [keyboardKeys];
    keys.forEach(key => { KEYBOARD_TO_ARCADE[key] = arcadeCode; });
  }
}

// AI Behavior Definitions (Data-Driven)
const AI = {
  RAT: { smallType: 'rat', bigType: 'troll', sprite: 'rat', bigSprite: 'troll', smallScale: 1.5 },
  GOLEM: { smallType: 'rat', bigType: 'golem', sprite: 'rat', bigSprite: 'golem', smallScale: 1.5, bigScale: 6 },
  ALMA: { smallType: 'alma', bigType: 'troll_abyss', sprite: 'rat', bigSprite: 'troll', smallScale: 3.5, smallTint: 0xf5f5f5, bigScale: 6, bigTint: 0x6633aa },
  DEMON: { smallType: 'rat', bigType: 'demon', sprite: 'rat', bigSprite: 'troll', smallScale: 2.25, bigScale: 6, bigTint: 0xaa0000 },
  DRAGON: { smallType: 'rat', bigType: 'dragon', sprite: 'rat', bigSprite: 'dragon', smallScale: 2.25, smallTint: 0xff0000 },
  BOSS: { smallType: 'alma', bigType: 'dragon_boss', sprite: 'rat', bigSprite: 'hero', smallScale: 3.5, smallTint: 0xf5f5f5, bigScale: 7 }
};

// GAME DATA - Zone data: [name, common, commonVal, rare, rareVal, smallE, smallHP[3], smallDmg[3], bigE, bigHP, bigDmg[3], chest, color, aiType]
const ZONES = {
  0: ['BOSQUE', 'HIERRO', 10, 'PLATA', 50, 'RATONCITO', [2,10,25], [1,10,3], 'TROLL', 50, [2,10,5], 30, 0x2D5016, 'RAT'],
  1: ['MINAS OLVIDADAS', 'ORO', 25, 'ESMERALDA', 150, 'RATATA', [2,10,40], [2,10,5], 'GOLEM', 80, [3,10,8], 75, 0x4A4A4A, 'GOLEM'],
  2: ['LAS PROFUNDIDADES', 'DIAMANTE', 50, 'RUBI', 300, 'WAREN', [3,10,100], [2,10,8], 'DEMON', 200, [4,10,5], 150, 0x2C1810, 'DEMON'],
  3: ['INFIERNO', 'PIEDRA INFERNAL', 100, 'ZAFIRO', 600, 'DIABLILLO', [4,10,150], [3,10,5], 'DRAGON', 300, [4,10,15], 300, 0x8B0000, 'DRAGON'],
  4: ['ABISMO', 'PIEDRA ABISMAL', 1000, 'CRISTAL-SOMBRA', 8000, 'ALMA EN PENA', [5,10,550], [5,10,20], 'TROLL ABYSS', 880, [10,15,40], 4000, 0x1A0033, 'ALMA'],
  5: ['???', null, 0, 'CORAZON-ABYSS', 30000, 'ALMA EN PENA', [8,10,63], [9,10,45], 'HEROE CORRUPTO', 2100, [15,20,80], 15000, 0x000000, 'BOSS']
};

// Zone array indices (optimized access)
const Z = { NAME:0, COMMON:1, COMMON_VAL:2, RARE:3, RARE_VAL:4, SMALL_E:5, SMALL_HP:6, SMALL_DMG:7, BIG_E:8, BIG_HP:9, BIG_DMG:10, CHEST:11, COLOR:12, AI:13 };

// Get max events per zone
const getMaxEvents = z => {
  if (z === 5) return 1; // Jefe final: solo 1 evento
  if (z === 4) return 3; // El Abismo: 3 eventos de combate
  return 5; // Zonas normales: 5 eventos
};

// Projectile speed multiplier per zone (increases difficulty)
const getProjSpeed = z => 1.0 + (z * 0.1); // Zone 0: 1.0x, Zone 1: 1.1x, Zone 2: 1.2x, Zone 3: 1.3x, Zone 4: 1.4x, Zone 5: 1.5x

// MINERAL DATA - [mainColor, gemColor]
const MINERAL_DATA = {
  'HIERRO': [0x888888, 0xC0C0C0],
  'ORO': [0xFFD700, 0xFFFF00],
  'PIEDRA INFERNAL': [0xFF4500, 0xFF6347],
  'DIAMANTE': [0x87CEEB, 0xADD8E6],
  'PIEDRA ABISMAL': [0x4B0082, 0x9370DB]
};

// Simple unified mineral drawing function
function drawMineral(ox, oy, mineralName, g = graphics) {
  const colors = MINERAL_DATA[mineralName] || MINERAL_DATA['HIERRO'];
  const mainColor = colors[0];
  const gemColor = colors[1];
  
  g.fillStyle(mainColor, 1);
  g.fillRect(ox - 35, oy - 42, 70, 84);
  
  g.fillStyle(0x000000, 0.3);
  g.fillRect(ox - 35, oy + 20, 70, 22);
  
  g.fillStyle(gemColor, 0.9);
  g.fillCircle(ox - 15, oy - 20, 8);
  g.fillRect(ox + 10, oy - 10, 12, 12);
  g.fillCircle(ox - 5, oy + 15, 6);
}

// GAME STATE
let state = 'MENU'; // MENU, GAME, SHOP, GAMEOVER
let zone = 0;
let mineralsInZone = 0; // Track minerals spawned in current zone (max 3)
let eventNum = 0;
let currentEvent = null;
let player = { hp: 1, maxHp: 1, dmg: 1, cooldown: 0.6, moveSpeed: 250, money: 0, treasures: 0, pos: 300, x: 150, combo: 0, timingBonus: 0, miningBonus: 0 };
let enemy = null;
let ore = null;
let chest = null;
let attackTimer = 0;

// Input state for smooth movement
let inputUp = false;
let inputDown = false;
let inputLeft = false;
let inputRight = false;

// Input debounce to prevent spam
let lastInputTime = 0;
const INPUT_DEBOUNCE_MS = 150; // Minimum time between inputs
let canAttack = true;
let graphics, scene, texts = {};
let runMoney = 0;
let upgradePrices = { hp: 50, dmg: 80, speed: 60, timing: 150, mining: 120 };
let upgradeLevel = { timing: 0 };
let shakeAmt = 0;
let particles = [];
let projectiles = [];
let floatingTexts = [];
let shopSelection = 0;
let bgStars = [];
let particleEmitters = [];
let playerSprite = null;
let lastEventWasChest = false; // Track if last event was chest (don't increment counter)
let lastEventType = null; // Track last event type to reduce repetition
let directionArrows = []; // Array to hold arrow sprites
let enemySprites = []; // Array to hold enemy sprite references
let timingSlider = { position: 0, direction: 1, speed: 2 }; // Timing slider for pickaxe
let timingZone = { min: 0.45, max: 0.55 }; // Sweet spot zone (45%-55%)
let bgMusicInterval = null; // Background music interval

// Get speed multiplier based on zone (0-2: Caves, 3-5: Desert, 6-8: Abyss)
function getZoneSpeedMultiplier(z) {
  if (z <= 2) return 0.75; // Caves - slower
  if (z <= 3) return 1.0;  // Desert - normal (base speed)
  return 1.25;             // Abyss - faster (reduced from 1.5)
}

// Update timing zone based on upgrade level
function updateTimingZone(randomize = true) {
  const baseZone = 0.1; // 10% base zone
  const upgradeBonus = upgradeLevel.timing * 0.05; // 5% extra per upgrade level
  const hawkEyeBonus = player.timingBonus; // Ojo de Halcón bonus
  const totalZone = baseZone + upgradeBonus + hawkEyeBonus;

  // If zone is too large (>0.8), center it
  if (totalZone >= 0.8) {
    timingZone.min = 0.5 - totalZone / 2;
    timingZone.max = 0.5 + totalZone / 2;
  } else if (randomize) {
    // Randomize position within valid range (only for new events)
    const maxStartPos = 1.0 - totalZone; // Maximum starting position to fit zone
    const randomStart = Math.random() * maxStartPos;
    timingZone.min = randomStart;
    timingZone.max = randomStart + totalZone;
  } else {
    // Keep current center position, just resize (for upgrades)
    const currentCenter = (timingZone.min + timingZone.max) / 2;
    timingZone.min = Math.max(0, currentCenter - totalZone / 2);
    timingZone.max = Math.min(1, currentCenter + totalZone / 2);
  }
}

// PHASER CONFIG
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#111111',
  scene: { create: create, update: update }
};

const game = new Phaser.Game(config);

// UTILITY FUNCTIONS
function roll(count, sides, bonus = 0) {
  let sum = 0;
  for (let i = 0; i < count; i++) {
    sum += Math.floor(Math.random() * sides) + 1;
  }
  return sum + bonus;
}

function takeDmg() {
  player.hp -= 1;
  player.combo = 0;
  spawnBloodParticles(player.x, player.pos, 1);
  updateGameUI();
  if (player.hp <= 0) {
    state = 'GAMEOVER';
    showGameOver();
  }
}

function play(freq, dur = 0.1, type = 'square') {
  const ctx = scene.sound.context;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.value = freq;
  osc.type = type;

  gain.gain.setValueAtTime(0.04, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + dur);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + dur);
}

function playDrum(freq, dur = 0.12, decay = 0.05) {
  const ctx = scene.sound.context;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  // Harmonic bass-like percussion
  osc.frequency.value = freq; // Use frequency directly for musical harmony
  osc.type = 'triangle'; // Softer, more musical than square

  // Low-pass filter for warm bass sound
  filter.type = 'lowpass';
  filter.frequency.value = 800; // Warm cutoff
  filter.Q.value = 1; // Gentle resonance

  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + dur);
}

function shake(amount) {
  shakeAmt = amount;
}

// Music synchronized with timing slider BPM (60 BPM = 1 second per cycle)
function startGameMusic() {
  if (bgMusicInterval) clearInterval(bgMusicInterval);

  // Two main melodies in simple alternating loop
  const melody1 = [ // A Major scale: A4-B4-C#5-D5-E5-F#5-G#5-A5 (8 notes = 1 second)
    { freq: 440, dur: 0.1 }, // A4
    { freq: 494, dur: 0.1 }, // B4
    { freq: 523, dur: 0.1 }, // C#5
    { freq: 587, dur: 0.1 }, // D5
    { freq: 659, dur: 0.1 }, // E5
    { freq: 698, dur: 0.1 }, // F#5
    { freq: 784, dur: 0.1 }, // G#5
    { freq: 880, dur: 0.1 }  // A5
  ];

  const melody2 = [ // F Lydian scale: F4-G4-A4-B4-C5-D5-E5-F5 (mysterious minas theme)
    { freq: 349, dur: 0.1 }, // F4
    { freq: 392, dur: 0.1 }, // G4
    { freq: 440, dur: 0.1 }, // A4
    { freq: 494, dur: 0.1 }, // B4
    { freq: 523, dur: 0.1 }, // C5
    { freq: 587, dur: 0.1 }, // D5
    { freq: 659, dur: 0.1 }, // E5
    { freq: 698, dur: 0.1 }  // F5
  ];

  // Harmonic percussion pattern (3/4 time) - musical with melody
  const percussionPattern = [
    { beat: 0, type: 'bass', freq: 55 },    // F2 - root note harmony
    { beat: 3, type: 'mid', freq: 110 },    // F3 - octave harmony
    { beat: 6, type: 'bass', freq: 55 }     // F2 - root note harmony
  ];

  let noteIndex = 0;

  // Calculate interval based on zone speed multiplier
  // Base interval is 125ms (Desert speed)
  // Caves (0.75x): 125 / 0.75 = 166.67ms
  // Desert (1.0x): 125ms
  // Abyss (1.25x): 125 / 1.25 = 100ms
  const baseInterval = 125;
  const currentInterval = Math.round(baseInterval / getZoneSpeedMultiplier(zone));

  bgMusicInterval = setInterval(() => {
    if (state === 'GAME') {
      // Simple alternating melody loop: 4 cycles melody1, 4 cycles melody2, repeat
      const currentCycle = Math.floor(noteIndex / 8); // Each cycle = 8 notes = 1 second
      const melodyBlock = Math.floor(currentCycle / 4); // Change every 4 cycles
      const useMelody2 = melodyBlock % 2 === 1; // Alternate: 4 cycles melody1, 4 cycles melody2

      const mainMelody = useMelody2 ? melody2 : melody1;
      const mainNote = mainMelody[noteIndex % 8];
      play(mainNote.freq, mainNote.dur, 'sine');

      // Add percussion on specific beats (waltz rhythm)
      const beatInMeasure = noteIndex % 8;
      percussionPattern.forEach(perc => {
        if (beatInMeasure === perc.beat) {
          playDrum(perc.freq, 0.12);
        }
      });

      noteIndex++;
    }
  }, currentInterval);
}

function stopGameMusic() {
  if (bgMusicInterval) {
    clearInterval(bgMusicInterval);
    bgMusicInterval = null;
  }
}

// Epic Shop Music - 90 BPM (667ms per beat)
function startShopMusic() {
  if (bgMusicInterval) clearInterval(bgMusicInterval);

  // Simple 8-beat loop with bass + pad - i-V harmonic minor progression
  const chordI = [261.63, 311.13, 392.00]; // C minor chord (C4-Eb4-G4)
  const chordV = [392.00, 493.88, 587.33]; // G Major chord (G4-B4-D5)
  let beat = 0;

  bgMusicInterval = setInterval(() => {
    if (state === 'SHOP') {
      const currentChord = beat < 4 ? chordI : chordV; // i for beats 0-3, V for beats 4-7
      const bassNote = beat < 4 ? 130.81 : 196.00; // C3 for i, G3 for V
      
      // Bass on beat 1, 5
      if (beat === 0 || beat === 4) {
        play(bassNote, 0.4, 'sine');
      }
      
      // Pad (sustained chord) - soft continuous
      if (beat % 2 === 0) {
        currentChord.forEach(freq => play(freq, 1.2, 'sine'));
      }
      
      // Epic timpani hit on beat 1
      if (beat === 0) {
        playDrum(80, 0.3); // Deep timpani
      }
      
      beat = (beat + 1) % 8;
    }
  }, 667); // 90 BPM = 667ms per beat
}

function stopShopMusic() {
  if (bgMusicInterval) {
    clearInterval(bgMusicInterval);
    bgMusicInterval = null;
  }
}

function spawnParticles(x, y, color, count = 10) {
  for (let i = 0; i < count; i++) {
    // Create particle as a sprite instead of graphics object for proper depth layering
    const particle = scene.add.graphics();
    particle.fillStyle(color, 1);
    particle.fillRect(-2, -2, 4, 4);
    particle.setPosition(x, y);
    particle.setDepth(150); // High depth to appear above everything

    // Add velocity and life properties
    particle.vx = (Math.random() - 0.5) * 200;
    particle.vy = (Math.random() - 0.5) * 200 - 50;
    particle.life = 1.0;
    particle.color = color;

    particles.push(particle);
  }
}

function spawnBloodParticles(x, y, damage = 1) {
  // Spawn MANY more particles for dramatic blood effect
  const particleCount = Math.min(40, 15 + damage * 4);

  for (let i = 0; i < particleCount; i++) {
    // Create blood particle as a sprite
    const particle = scene.add.graphics();

    // Varied blood colors for realism (dark red to bright red)
    const bloodColors = [0x8B0000, 0xDC143C, 0xB22222, 0xFF0000];
    const bloodColor = bloodColors[Math.floor(Math.random() * bloodColors.length)];

    // Varied sizes - some small droplets, some big splatters
    const isBigSplatter = Math.random() < 0.3; // 30% chance of big splatter
    const size = isBigSplatter ? (4 + Math.random() * 4) : (1 + Math.random() * 2);

    particle.fillStyle(bloodColor, 0.95);
    particle.fillRect(-size/2, -size/2, size, size);
    particle.setPosition(x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 30);
    particle.setDepth(160); // Even higher depth than regular particles

    // Dramatic blood physics - fast and chaotic movement
    const angle = Math.random() * Math.PI * 2;
    const speed = 150 + Math.random() * 200; // Much faster
    particle.vx = Math.cos(angle) * speed;
    particle.vy = Math.sin(angle) * speed - 80; // More upward momentum for splatter effect

    particle.life = 1.5 + Math.random() * 0.5; // Live longer
    particle.color = bloodColor;

    // Add gravity effect for more realistic blood physics
    particle.gravity = 300 + Math.random() * 200;

    particles.push(particle);
  }
}

function showBigText(text, x, y, color = '#ffff00', size = 32, duration = 1500) {
  const txt = scene.add.text(x, y, text, {
    fontSize: size + 'px',
    fontFamily: 'Arial',
    color: color,
    stroke: '#000',
    strokeThickness: 6
  }).setOrigin(0.5).setDepth(1000);
  
  floatingTexts.push(txt);
  
  scene.tweens.add({
    targets: txt,
    y: y - 100,
    alpha: { from: 1, to: 0 },
    scale: { from: 1, to: 1.5 },
    duration: duration,
    ease: 'Power2',
    onComplete: () => {
      if (txt && txt.scene) {
        txt.destroy();
      }
      const idx = floatingTexts.indexOf(txt);
      if (idx > -1) floatingTexts.splice(idx, 1);
    }
  });
}

function createTimingSuccessParticles(x, y) {
  // Create 8 small particles that burst out from the timing hit position
  const particleCount = 8;
  const colors = [0x00ff00, 0x88ff88, 0xffff00, 0xffffff]; // Green and yellow variations
  
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const speed = 100 + Math.random() * 50;
    const size = 3 + Math.random() * 3;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const particle = scene.add.rectangle(x, y, size, size, color);
    particle.setDepth(999);
    
    // Burst animation
    scene.tweens.add({
      targets: particle,
      x: x + Math.cos(angle) * (30 + Math.random() * 20),
      y: y + Math.sin(angle) * (30 + Math.random() * 20),
      alpha: { from: 1, to: 0 },
      scale: { from: 1, to: 0 },
      duration: 400 + Math.random() * 200,
      ease: 'Power2',
      onComplete: () => {
        if (particle && particle.scene) {
          particle.destroy();
        }
      }
    });
  }
}

function createBgStars() {
  // Create 3 layers of parallax stars
  for (let layer = 0; layer < 3; layer++) {
    const count = 30 - layer * 8;
    const speed = (layer + 1) * 0.3;
    const size = 1 + layer;
    const brightness = 0.3 + layer * 0.2;
    
    for (let i = 0; i < count; i++) {
      bgStars.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        layer: layer,
        speed: speed,
        size: size,
        brightness: brightness,
        twinkle: Math.random() * Math.PI * 2
      });
    }
  }
}


// MAIN GAME LOOP
function create() {
  scene = this;
  graphics = this.add.graphics();
  graphics.setDepth(300); // UI elements like timing bar appear above game elements
  
  // Create procedural player sprite (no external URLs)
  const tempGraphics = this.add.graphics();
  // Create a simple miner shape: head + body + pickaxe
  tempGraphics.fillStyle(0x8B4513); // Brown color
  tempGraphics.fillRect(8, 8, 16, 16); // Body
  tempGraphics.fillStyle(0xFFD700); // Gold helmet
  tempGraphics.fillRect(10, 4, 12, 8); // Head/helmet
  tempGraphics.fillStyle(0x444444); // Dark gray pickaxe
  tempGraphics.fillRect(24, 10, 6, 2); // Pickaxe handle
  tempGraphics.fillRect(28, 6, 2, 8); // Pickaxe head
  tempGraphics.generateTexture('miner', 32, 32);
  tempGraphics.destroy();

  // Create procedural pickaxe sprite
  const pickaxeGraphics = this.add.graphics();
  pickaxeGraphics.fillStyle(0x8B4513); // Brown handle
  pickaxeGraphics.fillRect(2, 6, 12, 4); // Handle
  pickaxeGraphics.fillStyle(0xC0C0C0); // Silver head
  pickaxeGraphics.fillRect(12, 2, 4, 12); // Pick head
  pickaxeGraphics.fillStyle(0xFFD700); // Gold tip
  pickaxeGraphics.fillRect(14, 4, 2, 8); // Gold edge
  pickaxeGraphics.generateTexture('pickaxe', 20, 16);
  pickaxeGraphics.destroy();

  // Create procedural enemy sprites

  // Rat sprite
  const ratGraphics = this.add.graphics();
  ratGraphics.fillStyle(0x8B4513); // Brown body
  ratGraphics.fillRect(8, 12, 16, 12); // Body
  ratGraphics.fillStyle(0x654321); // Darker brown head
  ratGraphics.fillRect(10, 8, 12, 8); // Head
  ratGraphics.fillStyle(0xFF0000); // Red eyes
  ratGraphics.fillRect(12, 10, 2, 2); // Left eye
  ratGraphics.fillRect(18, 10, 2, 2); // Right eye
  ratGraphics.fillStyle(0xFFFF00); // Yellow teeth
  ratGraphics.fillRect(14, 14, 4, 2); // Teeth
  ratGraphics.generateTexture('rat', 32, 32);
  ratGraphics.destroy();

  // Troll sprite (big)
  const trollGraphics = this.add.graphics();
  trollGraphics.fillStyle(0x228B22); // Green skin
  trollGraphics.fillRect(4, 4, 24, 20); // Body
  trollGraphics.fillStyle(0x32CD32); // Lighter green head
  trollGraphics.fillRect(8, 0, 16, 12); // Head
  trollGraphics.fillStyle(0x8B4513); // Brown club
  trollGraphics.fillRect(20, 16, 8, 4); // Club
  trollGraphics.generateTexture('troll', 32, 32);
  trollGraphics.destroy();

  // Golem sprite (big)
  const golemGraphics = this.add.graphics();
  golemGraphics.fillStyle(0x696969); // Gray stone body
  golemGraphics.fillRect(6, 8, 20, 16); // Body
  golemGraphics.fillStyle(0x8B8B8B); // Lighter gray head
  golemGraphics.fillRect(10, 2, 12, 10); // Head
  golemGraphics.fillStyle(0xFFD700); // Gold eyes
  golemGraphics.fillRect(12, 6, 2, 2); // Left eye
  golemGraphics.fillRect(18, 6, 2, 2); // Right eye
  // Arms
  golemGraphics.fillStyle(0x696969);
  golemGraphics.fillRect(2, 10, 6, 4); // Left arm
  golemGraphics.fillRect(24, 10, 6, 4); // Right arm
  golemGraphics.generateTexture('golem', 32, 32);
  golemGraphics.destroy();

// Dragon sprite (intento 4 - Simplificado con triángulos y cuadrado)
const dragonGraphics = this.add.graphics();

// Colores
const darkRed = 0x8B0000;   // Cuerpo y Alas
const crimson = 0xDC143C;   // Cabeza
const gold = 0xFFD700;      // Ojo y Espinas/Detalles

  dragonGraphics.fillStyle(crimson);
  dragonGraphics.fillTriangle(14, 12, 20, 8, 20, 16);
  dragonGraphics.fillStyle(darkRed);
  dragonGraphics.fillRect(20, 10, 12, 8);
dragonGraphics.fillStyle(darkRed);
dragonGraphics.fillTriangle(20, 8, 30, 4, 30, 16);
dragonGraphics.fillTriangle(22, 9, 32, 5, 32, 17);
dragonGraphics.fillTriangle(32, 14, 38, 11, 38, 17);
dragonGraphics.fillStyle(gold);
dragonGraphics.fillRect(16, 11, 2, 2);

dragonGraphics.generateTexture('dragon', 64, 32); // Ajustado a un tamaño más ancho para el dragón
dragonGraphics.destroy();

  // Hero sprite (corrupted hero boss)
  const heroGraphics = this.add.graphics();
  heroGraphics.fillStyle(0x6633aa); // Purple body
  heroGraphics.fillRect(8, 10, 16, 14); // Body
  heroGraphics.fillStyle(0x8844cc); // Lighter purple head
  heroGraphics.fillRect(10, 4, 12, 10); // Head
  heroGraphics.fillStyle(0xff00ff); // Magenta eyes (corrupted)
  heroGraphics.fillRect(12, 8, 2, 2); // Left eye
  heroGraphics.fillRect(18, 8, 2, 2); // Right eye
  heroGraphics.fillStyle(0x4422aa); // Dark purple armor
  heroGraphics.fillRect(10, 12, 4, 6); // Left shoulder
  heroGraphics.fillRect(18, 12, 4, 6); // Right shoulder
  heroGraphics.generateTexture('hero', 32, 32);
  heroGraphics.destroy();
  
  // Create background stars for parallax effect
  createBgStars();

  // Initialize timing zone
  updateTimingZone();
  
  // Text objects
  texts.title = this.add.text(400, 130, 'PLATANUS ABYSS', {
    fontSize: '72px', 
    fontFamily: 'Impact, Arial Black, Arial', 
    color: '#8b4789',
    stroke: '#000', 
    strokeThickness: 12,
    shadow: { offsetX: 4, offsetY: 4, color: '#330000', blur: 10, fill: true }
  }).setOrigin(0.5);

  texts.subtitle = this.add.text(400, 450, 'PRESIONA START', {
    fontSize: '32px', 
    fontFamily: 'Impact, Arial Black, Arial', 
    color: '#d4af37',
    stroke: '#000', 
    strokeThickness: 6,
    shadow: { offsetX: 2, offsetY: 2, color: '#4b1818ff', blur: 6, fill: true }
  }).setOrigin(0.5);
  
  texts.info = this.add.text(400, 520, 'DESCIENDE A LA OSCURIDAD • ENFRENTA TU DESTINO • RECLAMA TU FORTUNA', {
    fontSize: '18px', 
    fontFamily: 'Arial', 
    color: '#9370db',
    stroke: '#000',
    strokeThickness: 3
  }).setOrigin(0.5);

  texts.zone = this.add.text(400, 30, '', {
    fontSize: '28px', fontFamily: 'Arial', color: '#9370db',
    stroke: '#000', strokeThickness: 4
  }).setOrigin(0.5).setVisible(false).setDepth(500);
  
  texts.hp = this.add.text(50, 80, '', {
    fontSize: '24px', fontFamily: 'Arial', color: '#ff4444',
    stroke: '#000', strokeThickness: 3
  }).setVisible(false).setDepth(500);
  
  texts.money = this.add.text(750, 80, '', {
    fontSize: '24px', fontFamily: 'Arial', color: '#ffd700',
    stroke: '#000', strokeThickness: 3
  }).setOrigin(1, 0).setVisible(false).setDepth(500);
  
  texts.treasures = this.add.text(750, 110, '', {
    fontSize: '20px', fontFamily: 'Arial', color: '#00ddff',
    stroke: '#000', strokeThickness: 3
  }).setOrigin(1, 0).setVisible(false).setDepth(500);
  
  texts.combo = this.add.text(400, 530, '', {
    fontSize: '24px', fontFamily: 'Courier New', color: '#ffaa00',
    stroke: '#000', strokeThickness: 3
  }).setOrigin(0.5, 0).setVisible(false).setDepth(500);
  
  texts.event = this.add.text(750, 145, '', {
    fontSize: '24px', fontFamily: 'Arial', color: '#cccccc',
    stroke: '#000', strokeThickness: 3
  }).setOrigin(1, 0).setVisible(false).setDepth(500);
  
  // Blink animation for menu
  this.tweens.add({
    targets: texts.subtitle,
    alpha: { from: 1, to: 0.3 },
    duration: 800,
    yoyo: true,
    repeat: -1
  });
  
  // Input
  this.input.keyboard.on('keydown', handleInput);
  this.input.keyboard.on('keyup', handleKeyUp);
}

function update(time, delta) {
  graphics.clear();

  // Menu animations
  if (state === 'MENU') {
    // Pulse animation for subtitle "PRESIONA START"
    const pulseScale = 1 + Math.sin(time / 300) * 0.15; // Pulse between 0.85 and 1.15
    texts.subtitle.setScale(pulseScale);
    
    // Subtle color shift for title (dark red to blood red)
    const colorShift = Math.sin(time / 500) * 0.5 + 0.5; // 0 to 1
    const r = Math.floor(100 + colorShift * 39); // 100 to 139 (dark red range)
    const g = Math.floor(0);
    const b = Math.floor(0);
    const hexColor = '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
    texts.title.setColor(hexColor);
    
    // Subtle pulse for subtitle color (dark red to brighter red/crimson)
    const redShift = Math.sin(time / 400) * 0.5 + 0.5;
    const sr = Math.floor(153 + redShift * 51); // 153 to 204 (darker to lighter red)
    const sg = Math.floor(53 + redShift * 30);  // 53 to 83 (keep low for red tones)
    const sb = Math.floor(53 + redShift * 30);  // 53 to 83 (keep low for red tones)
    const redHex = '#' + sr.toString(16).padStart(2, '0') + sg.toString(16).padStart(2, '0') + sb.toString(16).padStart(2, '0');
    texts.subtitle.setColor(redHex);
  }

  // Continuous player movement
  if (state === 'GAME') {
    const moveSpeed = player.moveSpeed * delta / 1000; // Use player's move speed stat
    const topBarHeight = 180;
    const bottomBarHeight = 180;
    const minY = topBarHeight + 20; // 200
    const maxY = 600 - bottomBarHeight - 20; // 400
    
    // Check if shop is available (unlock left boundary)
    const canShop = directionArrows.length > 0 && eventNum >= getMaxEvents(zone) - 1 && zone !== 4 && zone !== 5;
    const minX = canShop ? -50 : 50; // Open left boundary when shop available
    const maxX = directionArrows.length > 0 ? 600 : 450; // Extended right limit when arrows visible

    if (inputUp) {
      player.pos = Math.max(minY, player.pos - moveSpeed);
    }
    if (inputDown) {
      player.pos = Math.min(maxY, player.pos + moveSpeed);
    }
    if (inputLeft) {
      player.x = Math.max(minX, player.x - moveSpeed);
    }
    if (inputRight) {
      player.x = Math.min(maxX, player.x + moveSpeed);
    }
  }

  // Auto-advance when player reaches right side OR go to shop when leaving screen
  // Only works after completing events (when directionArrows are visible)
  if (directionArrows.length > 0 && state === 'GAME') {
    if (player.x > 550) {
      // Teleport player back to starting position before advancing
      player.x = 150;
      player.pos = 300;
      selectDirection('forward');
    } else if (player.x < -20) {
      // Player walked off screen left - go to shop
      if (zone !== 4 && zone !== 5) {
        player.x = 150;
        player.pos = 300;
        escapeToShop();
      }
    }
  } else if (state === 'GAME') {
    // Show blocked area indicators when trying to access restricted zones
    const canShop = eventNum >= getMaxEvents(zone) - 1 && zone !== 4 && zone !== 5;
    
    if (player.x > 500) {
      // Show "Complete event first" near right side
      if (!window.centerBlockText) {
        window.centerBlockText = scene.add.text(550, 350, 'Completa el evento primero!', {
          fontSize: '18px',
          fontFamily: 'Arial',
          color: '#ff6666',
          stroke: '#000',
          strokeThickness: 2
        }).setOrigin(0.5).setDepth(1000);
      }
    } else if (player.x <= 40 && !canShop) {
      // Show "Finish zone first" near left (only if shop not available)
      if (!window.leftBlockText) {
        window.leftBlockText = scene.add.text(100, 350, 'Termina la zona primero!', {
          fontSize: '18px',
          fontFamily: 'Arial',
          color: '#ff6666',
          stroke: '#000',
          strokeThickness: 2
        }).setOrigin(0.5).setDepth(1000);
      }
    } else {
      // Clear block texts when not in restricted areas
      if (window.centerBlockText) {
        window.centerBlockText.destroy();
        window.centerBlockText = null;
      }
      if (window.leftBlockText) {
        window.leftBlockText.destroy();
        window.leftBlockText = null;
      }
    }
  }
  
  // Draw animated background stars (parallax)
  bgStars.forEach(star => {
    star.x -= star.speed;
    if (star.x < -10) star.x = 810;
    
    // Twinkling effect
    star.twinkle += delta / 1000;
    const alpha = star.brightness + Math.sin(star.twinkle) * 0.2;
    
    graphics.fillStyle(0xffffff, alpha);
    graphics.fillRect(star.x, star.y, star.size, star.size);
  });
  
  // Camera shake
  if (shakeAmt > 0) {
    scene.cameras.main.setPosition(
      (Math.random() - 0.5) * shakeAmt,
      (Math.random() - 0.5) * shakeAmt
    );
    shakeAmt *= 0.9;
    if (shakeAmt < 0.1) {
      shakeAmt = 0;
      scene.cameras.main.setPosition(0, 0);
    }
  }

  // Update timing slider with zone-based speed multiplier
  const speedMultiplier = getZoneSpeedMultiplier(zone);
  timingSlider.position += timingSlider.direction * timingSlider.speed * speedMultiplier * delta / 1000;
  if (timingSlider.position >= 1) {
    timingSlider.position = 1;
    timingSlider.direction = -1;
  } else if (timingSlider.position <= 0) {
    timingSlider.position = 0;
    timingSlider.direction = 1;
  }
  
  // Attack cooldown
  if (!canAttack) {
    attackTimer += delta / 1000;
    if (attackTimer >= player.cooldown) {
      canAttack = true;
      attackTimer = 0;
    }
  }
  
  // Update particles (physics only, drawing moved to end)
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * delta / 1000;
    p.y += p.vy * delta / 1000;
    p.vy += 300 * delta / 1000; // gravity
    p.life -= delta / 1000;
    
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
  
  // Update projectiles
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];

    // Skip if projectile is undefined (safety check)
    if (!proj) {
      projectiles.splice(i, 1);
      continue;
    }

    // Update position based on velocity (vx, vy) or default left movement
    if (proj.vx !== undefined) {
      proj.x += proj.vx * delta / 1000;
      proj.y += proj.vy * delta / 1000;
    } else {
      proj.x -= 400 * delta / 1000;
    }

    proj.life -= delta / 1000;
    
    if (proj.x < -50 || proj.x > 850 || proj.y < -50 || proj.y > 650 || proj.life <= 0) {
      projectiles.splice(i, 1);
    } else {
      // Only check collision with player during GAME state
      if (state === 'GAME' && Math.abs(proj.x - player.x) < 11.25 && Math.abs(proj.y - player.pos) < 11.25) {
        takeDmg();
        play(150, 0.2);
        shake(10);
        projectiles.splice(i, 1);
      } else {
        // Only draw projectiles during GAME state
        if (state === 'GAME') {
          // Different projectile visuals based on type
          if (proj.type === 'fire') {
            // Fire projectiles - orange/red with glow
            graphics.fillStyle(0xff4400, 1);
            graphics.fillCircle(proj.x, proj.y, 6);
            graphics.fillStyle(0xffaa00, 0.6);
            graphics.fillCircle(proj.x, proj.y, 12);
          } else if (proj.type === 'wave') {
            // Wave projectiles - blue with trail
            graphics.fillStyle(0x0088ff, 1);
            graphics.fillRect(proj.x - 4, proj.y - 2, 8, 4);
            graphics.fillStyle(0x00aaff, 0.7);
            graphics.fillCircle(proj.x, proj.y, 8);
          } else if (proj.type === 'burst') {
            // Burst projectiles - purple fast
            graphics.fillStyle(0x8800ff, 1);
            graphics.fillRect(proj.x - 3, proj.y - 3, 6, 6);
            graphics.fillStyle(0xaa00ff, 0.8);
            graphics.fillCircle(proj.x, proj.y, 5);
          } else {
            // Normal projectiles - red
        graphics.fillStyle(0xff0000, 1);
        graphics.fillCircle(proj.x, proj.y, 8);
          }
        }
      }
    }
  }
  
  if (state === 'GAME') {
  drawGame();
    
    // Enemy projectile shooting (solo si está vivo)
    if (enemy && enemy.type === 'small' && enemy.hp > 0) {
      enemy.shootTimer -= delta / 1000;
      if (enemy.shootTimer <= 0) {
        const aiType = AI[ZONES[zone][Z.AI]].smallType;
  // Use the current playable vertical range (minY..maxY) so projectiles can reach edges
  const targetY = (typeof minY !== 'undefined' && typeof maxY !== 'undefined') ? (minY + Math.random() * (maxY - minY)) : (200 + Math.random() * 200);
        const speedMult = getProjSpeed(zone);
        
        if (aiType === 'rat') {
          // Rata dispara MUCHO más rápido: 1.2s (zona 0) -> 0.2s (zona 4 ABISMO)
          enemy.shootTimer = 1.2 - (zone * 0.25);
          projectiles.push({ x: 600, y: targetY, dmg: 1, life: 3.0, vx: -200 * speedMult, vy: 0, type: 'normal' });
          play(800, 0.1);
        } else if (aiType === 'alma') {
          // Alma dispara MUCHO más rápido: 1.0s (zona 0) -> 0.15s (zona 4 ABISMO)
          enemy.shootTimer = 1.0 - (zone * 0.2125);
          projectiles.push({ x: 600, y: targetY, dmg: 1, life: 3.0, vx: -250 * speedMult, vy: 0, type: 'normal' });
          play(700, 0.1, 'square');
        }
      }
    }
    
    // Big enemy attack (solo si está vivo)
    if (enemy && enemy.type === 'big' && enemy.hp > 0) {
      enemy.attackTimer -= delta / 1000;
      if (enemy.attackTimer <= 0) {
        const aiType = AI[ZONES[zone][Z.AI]].bigType;
        
        if (aiType === 'troll') {
          enemy.attackTimer = 2.8;
          enemy.attacking = Math.random() < 0.5 ? 'upper' : 'lower';
          enemy.attackWarn = 1.2;
          play(150, 0.4, 'sawtooth');
        }
        else if (aiType === 'demon') {
          // DEMON: Zone attack + 7 projectiles aimed at player with 15° spread
          enemy.attackTimer = 2.8;
          enemy.attacking = Math.random() < 0.5 ? 'upper' : 'lower';
          enemy.attackWarn = 1.2;
          play(150, 0.4, 'sawtooth');
          // 7 projectiles aimed at player with 15° spread between each
          const speedMult = getProjSpeed(zone);
          const baseAngle = Math.atan2(player.pos - 300, player.x - 600);
          const spreadDegrees = 15; // 15 degrees between each projectile
          const spreadRad = (spreadDegrees * Math.PI) / 180;
          for (let i = 0; i < 7; i++) {
            setTimeout(() => {
              if (enemy && enemy.hp > 0) {
                const offset = (i - 3) * spreadRad; // Center the spread: -3, -2, -1, 0, 1, 2, 3
                const angle = baseAngle + offset;
                projectiles.push({ x: 600, y: 300, dmg: 1, life: 3.0, vx: Math.cos(angle) * 140 * speedMult, vy: Math.sin(angle) * 140 * speedMult, type: 'fire' });
              }
            }, i * 60);
          }
        }
        else if (aiType === 'troll_abyss') {
          enemy.attackTimer = 1.0;
          enemy.attacking = 'zone';
          // Target zone on player position (forces constant movement)
          const zoneW = 80; // Zone width
          const zoneH = 80; // Zone height
          enemy.attackZoneX = Math.max(50, Math.min(450 - zoneW, player.x - zoneW / 2)); // Center on player X
          enemy.attackZoneY = Math.max(200, Math.min(400 - zoneH, player.pos - zoneH / 2)); // Center on player Y
          enemy.attackZoneW = zoneW;
          enemy.attackZoneH = zoneH;
          enemy.attackWarn = 0.4;
          const speedMult = getProjSpeed(zone);
          for (let i = 0; i < 3; i++) {
            setTimeout(() => {
              if (enemy && enemy.hp > 0) {
                const targetY = (typeof minY !== 'undefined' && typeof maxY !== 'undefined') ? (minY + Math.random() * (maxY - minY)) : (200 + Math.random() * 200);
                const targetX = 70 + Math.random() * 360;
                const angle = Math.atan2(targetY - 300, targetX - 600);
                projectiles.push({ x: 600, y: 300, dmg: 1, life: 3.0, vx: Math.cos(angle) * 150 * speedMult, vy: Math.sin(angle) * 150 * speedMult, type: 'normal' });
              }
            }, i * 200);
          }
          play(150, 0.4, 'sawtooth');
        }
        else if (aiType === 'golem') {
          enemy.attackTimer = 3.5;
          enemy.attacking = 'line';
          // TRIPLE LINE ATTACK - 3 horizontal lines cascading down
          enemy.attackLineY = 200 + Math.random() * 100; // First line: 200-300
          enemy.attackLineY2 = enemy.attackLineY + 50; // Second line: 50px below
          enemy.attackLineY3 = enemy.attackLineY + 100; // Third line: 100px below
          enemy.attackWarn = 1.0;
          enemy.golemShake = true;
          play(100, 0.5, 'sawtooth');
        }
        else if (aiType === 'dragon') {
          enemy.attackTimer = 3.2;
          // Ataque combinado: Zona trasera (más ancha) + Zona centro + Proyectiles con spread
          enemy.attacking = 'zone';
          enemy.attackZoneX = 50; // Borde izquierdo
          enemy.attackZoneY = 200; // Desde arriba
          enemy.attackZoneW = 120; // MÁS ANCHO: 120px (casi 1/3 del área)
          enemy.attackZoneH = 200; // Toda la altura disponible
          // Segunda zona en el centro
          enemy.attackZone2X = 200; // Centro del área
          enemy.attackZone2Y = 200;
          enemy.attackZone2W = 100; // Zona centro
          enemy.attackZone2H = 200;
          enemy.attackWarn = 0.8;
          const speedMult = getProjSpeed(zone);
          const baseAngle = Math.atan2(player.pos - 300, player.x - 550);
          // Lanzar 11 proyectiles con más dispersión (±35 grados)
          for (let i = 0; i < 11; i++) {
            setTimeout(() => {
              if (enemy && enemy.hp > 0) {
                const spread = (Math.random() - 0.5) * 1.22; // ±35 grados en radianes (1.22 rad ≈ 35°)
                const angle = baseAngle + spread;
                projectiles.push({ x: 550, y: 300, dmg: 1, life: 3.5, vx: Math.cos(angle) * 180 * speedMult, vy: Math.sin(angle) * 180 * speedMult, type: 'fire' });
              }
            }, i * 50); // Delay más corto: 50ms entre proyectiles
          }
          play(300, 0.5, 'sawtooth');
        }
        else if (aiType === 'dragon_boss') {
          enemy.attackTimer = 1.2; // Reducido de 1.5 a 1.2 (ataca más frecuente)
          enemy.attacking = 'zone';
          // Player area: X(50-450), Y(200-400) = 400x200px
          // Cubrir el área izquierda/derecha que NO cubren los proyectiles (que van al centro)
          const side = Math.random() < 0.5 ? 'left' : 'right';
          if (side === 'left') {
            enemy.attackZoneX = 50; // Borde izquierdo
            enemy.attackZoneW = 100 + Math.random() * 50; // 100-150px de ancho
          } else {
            enemy.attackZoneW = 100 + Math.random() * 50; // 100-150px de ancho
            enemy.attackZoneX = 450 - enemy.attackZoneW; // Borde derecho
          }
          enemy.attackZoneY = 200 + Math.random() * 100; // Y: 200-300
          enemy.attackZoneH = 100 + Math.random() * 100; // Alto: 100-200px
          enemy.attackWarn = 0.6; // Reducido de 0.8 a 0.6 (menos tiempo de advertencia)
          const speedMult = getProjSpeed(zone);
          const targetX = 150 + Math.random() * 200; // Random center dentro del área del jugador
          const targetY = 260 + Math.random() * 80; // Centro del área vertical
          const playerCenterAngle = Math.atan2(targetY - 300, targetX - 550);
          for (let i = 0; i < 12; i++) { // Aumentado de 8 a 12 proyectiles
            setTimeout(() => {
              if (enemy && enemy.hp > 0) {
                const spread = (i - 5.5) * 0.18; // Ajustado el spread para 12 proyectiles
                const angle = playerCenterAngle + spread;
                projectiles.push({ x: 550, y: 300, dmg: 1, life: 4.0, vx: Math.cos(angle) * 200 * speedMult, vy: Math.sin(angle) * 200 * speedMult, type: 'fire' });
              }
            }, i * 50); // Reducido de 80ms a 50ms (dispara más rápido)
          }
          play(300, 0.5, 'sawtooth');
        }
      }
      
      if (enemy && enemy.attackWarn > 0) {
        enemy.attackWarn -= delta / 1000;
        if (enemy.attackWarn <= 0) {
          // Iniciar ataque activo
          if (enemy) enemy.attackActive = 0.15; // Zona activa por 150ms
        }
      }
      
      if (enemy && enemy.attackActive > 0) {
        enemy.attackActive -= delta / 1000;
        
        // Execute attack based on type
        if (enemy.attacking === 'upper' || enemy.attacking === 'lower') {
          // TROLL: Attack in targeted section
          const attackMinY = enemy.attacking === 'upper' ? 200 : 300;
          const attackMaxY = enemy.attacking === 'upper' ? 300 : 400;

          if (player.x >= 0 && player.x <= 400 &&
              player.pos >= attackMinY && player.pos <= attackMaxY) {
            takeDmg();
            if (state === 'GAMEOVER') return; // Salir inmediatamente si murió
            play(150, 0.4);
            shake(18);
            if (enemy) enemy.attackActive = 0; // Detener tras golpear
          }
        }
        else if (enemy.attacking === 'line') {
          // GOLEM: Triple line cascade attack
          let hit = false;
          // Check first line
          if (player.x >= 0 && player.x <= 400 &&
              player.pos >= enemy.attackLineY && player.pos <= enemy.attackLineY + 50) {
            hit = true;
          }
          // Check second line
          if (player.x >= 0 && player.x <= 400 && enemy.attackLineY2 &&
              player.pos >= enemy.attackLineY2 && player.pos <= enemy.attackLineY2 + 50) {
            hit = true;
          }
          // Check third line
          if (player.x >= 0 && player.x <= 400 && enemy.attackLineY3 &&
              player.pos >= enemy.attackLineY3 && player.pos <= enemy.attackLineY3 + 50) {
            hit = true;
          }
          if (hit) {
            takeDmg();
            if (state === 'GAMEOVER') return;
            play(150, 0.3);
            shake(30); // Big shake for triple line
            if (enemy) enemy.attackActive = 0;
          }
        }
        else if (enemy.attacking === 'zone') {
          // ABYSS ENEMIES: Attack in random zone
          const zoneLeft = enemy.attackZoneX;
          const zoneRight = enemy.attackZoneX + enemy.attackZoneW;
          const zoneTop = enemy.attackZoneY;
          const zoneBottom = enemy.attackZoneY + enemy.attackZoneH;
          
          let inZone = player.x >= zoneLeft && player.x <= zoneRight &&
                       player.pos >= zoneTop && player.pos <= zoneBottom;
          
          // Verificar segunda zona si existe (dragon)
          if (!inZone && enemy.attackZone2X !== undefined) {
            const zone2Left = enemy.attackZone2X;
            const zone2Right = enemy.attackZone2X + enemy.attackZone2W;
            const zone2Top = enemy.attackZone2Y;
            const zone2Bottom = enemy.attackZone2Y + enemy.attackZone2H;
            inZone = player.x >= zone2Left && player.x <= zone2Right &&
                     player.pos >= zone2Top && player.pos <= zone2Bottom;
          }

          if (inZone) {
            takeDmg();
            if (state === 'GAMEOVER') return; // Salir inmediatamente si murió
            play(150, 0.4);
            shake(20); // Strong shake for zone attacks
            if (enemy) enemy.attackActive = 0; // Detener tras golpear
          }
        }
        
        if (enemy && enemy.attackActive <= 0) {
          // Limpiar ataque cuando termine
          if (state === 'GAMEOVER') return; // Salir si takeDmg() causó game over

          // Solo intentar limpiar si enemy todavía existe
          if (enemy) {
            enemy.attacking = null;
            enemy.golemShake = false;
            enemy.dragonBreath = false;
            // Clear zone attack variables
            enemy.attackZoneX = undefined;
            enemy.attackZoneY = undefined;
            enemy.attackZoneW = undefined;
            enemy.attackZoneH = undefined;
            enemy.attackZone2X = undefined;
            enemy.attackZone2Y = undefined;
            enemy.attackZone2W = undefined;
            enemy.attackZone2H = undefined;
            enemy.attackLineY = undefined;
          }
        }
      }
    }
  }
}

function drawGame() {
  const zoneColor = ZONES[zone][Z.COLOR];
  
  // Background gradient with zone color
  graphics.fillGradientStyle(0x000000, 0x000000, zoneColor, zoneColor, 0.3);
  graphics.fillRect(0, 0, 800, 600);

  // Cinematic black bars (only during gameplay)
  if (state === 'GAME') {
    const barHeight = 180; // Height of each cinematic bar (3x larger for more cinematic effect)
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(0, 0, 800, barHeight); // Top bar
    graphics.fillRect(0, 600 - barHeight, 800, barHeight); // Bottom bar
  }
  
  // Player (sprite-based)
  const px = player.x;
  const py = player.pos;
  
  // Create or update player sprite
  if (!playerSprite || !playerSprite.scene) {
    // Crear sprite solo si no existe o fue destruido
    if (playerSprite && !playerSprite.scene) {
      playerSprite = null;
    }
    playerSprite = scene.add.image(px, py, 'miner');
    playerSprite.setScale(1.5); // Scale up for better visibility
    playerSprite.setDepth(10); // Asegurar que esté sobre otros elementos
  }
  
  // Actualizar posición y visibilidad
  if (playerSprite && playerSprite.scene) {
    playerSprite.setPosition(px, py);
    playerSprite.setVisible(true);
    
    // Pickaxe swing animation
    const pickSwing = !canAttack ? Math.sin(attackTimer / player.cooldown * Math.PI) * 15 : 0;
    playerSprite.setRotation(pickSwing * 0.01); // Subtle rotation during attack
  }
  
  // Attack cooldown bar with glow
  if (!canAttack) {
    const pct = attackTimer / player.cooldown;
    // Glow
    graphics.fillStyle(0x00ff00, 0.3);
    graphics.fillRect(px - 32, py + 38, 64, 10);
    // Background
    graphics.fillStyle(0x003300, 1);
    graphics.fillRect(px - 30, py + 40, 60, 6);
    // Fill
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(px - 30, py + 40, 60 * pct, 6);
    // Border
    graphics.lineStyle(2, 0x00ff00);
    graphics.strokeRect(px - 30, py + 40, 60, 6);
    // Segments
    for (let i = 1; i < 4; i++) {
      graphics.lineStyle(1, 0x004400);
      graphics.lineBetween(px - 30 + (60 / 4) * i, py + 40, px - 30 + (60 / 4) * i, py + 46);
    }
  }
  
  // Draw timing slider (always visible during gameplay)
  drawTimingSlider();
  
  // Draw event
  if (currentEvent === 'ORE' && ore) {
    drawOre();
  } else if (currentEvent === 'ENEMY' && enemy) {
    drawEnemy();
  } else if (currentEvent === 'CHEST' && chest) {
    drawChest();
  }

  // Update and draw particles (now as sprites with proper depth)
  const deltaTime = 0.016; // ~60 FPS
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    // Update particle physics
    p.x += p.vx * deltaTime;
    p.y += p.vy * deltaTime;
    p.vy += (p.gravity || 300) * deltaTime; // Use specific gravity or default
    p.life -= 2 * deltaTime;

    // Update position and alpha
    p.setPosition(p.x, p.y);
    p.setAlpha(p.life);

    // Remove dead particles
    if (p.life <= 0) {
      p.destroy();
      particles.splice(i, 1);
    }
  }
  
  // Draw player hitbox indicator (always on top)
  graphics.fillStyle(0xc32454, 0.3);
  graphics.fillCircle(player.x, player.pos, 7.5);
  graphics.lineStyle(2, 0xc32454, 0.6);
  graphics.strokeCircle(player.x, player.pos, 7.5);
}

function drawOre() {
  if (ore.hp <= 0) return;

  const ox = 600;
  const oy = 300;
  const dmgPct = ore.hp / ore.maxHp;
  const alpha = 0.3 + (dmgPct * 0.7);

  const tempGraphics = scene.add.graphics();
  tempGraphics.setAlpha(alpha);

  drawMineral(ox, oy, ZONES[zone][Z.COMMON], tempGraphics);

  scene.time.delayedCall(100, () => tempGraphics.destroy());

  // HP bar
  graphics.fillStyle(0x330000, 0.5);
  graphics.fillRect(ox - 52, oy - 82, 104, 14);
  graphics.fillStyle(0x330000, 1);
  graphics.fillRect(ox - 50, oy - 80, 100, 10);
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(ox - 50, oy - 80, 100 * dmgPct, 10);
  graphics.lineStyle(1, 0xffffff);
  graphics.strokeRect(ox - 50, oy - 80, 100, 10);

  texts.event.setText(`${ZONES[zone][Z.COMMON]}`).setVisible(true);
  texts.event.setPosition(ox, oy - 150).setOrigin(0.5, 0);
}

function drawEnemy() {
  if (enemy.hp <= 0) return; // Don't draw if dead
  
  const ex = 600;
  const ey = 300;
  
  // Clear previous enemy sprites
  enemySprites.forEach(sprite => {
    if (sprite && sprite.scene) {
      sprite.destroy();
    }
  });
  enemySprites = [];

  let spriteKey = 'rat'; // default
  let scale = 4; // default scale
  let tint = 0xffffff; // default no tint

  const ai = AI[ZONES[zone][Z.AI]];
  if (enemy.type === 'small') {
    spriteKey = ai.sprite;
    scale = ai.smallScale || 1.5; // Use custom scale if defined
    tint = ai.smallTint || 0xffffff;
  } else {
    spriteKey = ai.bigSprite;
    scale = ai.bigScale || 6; // Use custom scale if defined
    tint = ai.bigTint || 0xffffff;
  }

  const enemySprite = scene.add.image(ex, ey, spriteKey);
  enemySprite.setScale(scale);
  enemySprite.setTint(tint); // Apply color tint
  enemySprite.setDepth(5); // Above background but below effects
  
  // Ghostly pulse effect for Alma enemies
  if (ZONES[zone][Z.AI] === 'ALMA') {
    const pulse = 0.5 + Math.sin(Date.now() / 300) * 0.3; // Pulse between 0.2 and 0.8
    enemySprite.setAlpha(pulse);
  }
  
  // Final boss aura (Corrupted Hero)
  if (ZONES[zone][Z.AI] === 'BOSS' && enemy.type === 'big') {
    const auraPulse = 0.3 + Math.sin(Date.now() / 200) * 0.2;
    graphics.fillStyle(0x9900ff, auraPulse);
    graphics.fillCircle(ex, ey, 120); // Purple aura around boss
  }
  
  enemySprites.push(enemySprite); // Store reference for cleanup

  if (enemy.type === 'small') {
    texts.event.setText(`${enemy.name}`).setVisible(true);
    texts.event.setPosition(ex, ey - 150).setOrigin(0.5, 0);
  } else {
    if (enemy.attackWarn > 0) {
      const pulse = 0.3 + Math.sin(Date.now() / 100) * 0.2;

      if (enemy.attacking === 'upper') {
        // TROLL: Warning for upper section
        graphics.fillStyle(0xff0000, pulse);
        graphics.fillRect(0, 200, 400, 100); // Upper playable area
        graphics.lineStyle(3, 0xff0000, 0.8);
        graphics.strokeRect(0, 200, 400, 100);
      }
      else if (enemy.attacking === 'lower') {
        // TROLL: Warning for lower section
        graphics.fillStyle(0xff0000, pulse);
        graphics.fillRect(0, 300, 400, 100); // Lower playable area
        graphics.lineStyle(3, 0xff0000, 0.8);
        graphics.strokeRect(0, 300, 400, 100);
      }
      else if (enemy.attacking === 'line') {
        // GOLEM: Triple horizontal line cascade attack
        graphics.fillStyle(0xff0000, pulse);
        graphics.lineStyle(3, 0xff0000, 0.8);
        // First line
        graphics.fillRect(0, enemy.attackLineY, 400, 50);
        graphics.strokeRect(0, enemy.attackLineY, 400, 50);
        // Second line
        if (enemy.attackLineY2 && enemy.attackLineY2 <= 400) {
          graphics.fillRect(0, enemy.attackLineY2, 400, 50);
          graphics.strokeRect(0, enemy.attackLineY2, 400, 50);
        }
        // Third line
        if (enemy.attackLineY3 && enemy.attackLineY3 <= 400) {
          graphics.fillRect(0, enemy.attackLineY3, 400, 50);
          graphics.strokeRect(0, enemy.attackLineY3, 400, 50);
        }
      }
      else if (enemy.attacking === 'zone') {
        // ABYSS ENEMIES: Warning for random zone attack
        graphics.fillStyle(0xff0000, pulse);
        graphics.fillRect(enemy.attackZoneX, enemy.attackZoneY, enemy.attackZoneW, enemy.attackZoneH);
        graphics.lineStyle(3, 0xff0000, 0.8);
        graphics.strokeRect(enemy.attackZoneX, enemy.attackZoneY, enemy.attackZoneW, enemy.attackZoneH);
        // Segunda zona si existe (dragon)
        if (enemy.attackZone2X !== undefined) {
          graphics.fillStyle(0xff0000, pulse);
          graphics.fillRect(enemy.attackZone2X, enemy.attackZone2Y, enemy.attackZone2W, enemy.attackZone2H);
          graphics.lineStyle(3, 0xff0000, 0.8);
          graphics.strokeRect(enemy.attackZone2X, enemy.attackZone2Y, enemy.attackZone2W, enemy.attackZone2H);
        }
      }
      else if (enemy.dragonBreath) {
        // DRAGON: Cone warning for focused fire breath
        graphics.fillStyle(0xff4400, pulse * 0.8);
        graphics.fillRect(200, 100, 400, 400); // Large cone area
        graphics.lineStyle(4, 0xff4400, 0.9);
        graphics.strokeRect(200, 100, 400, 400);
      }
    }
    
    texts.event.setText(`${enemy.name}`).setVisible(true);
    texts.event.setPosition(ex, ey - 150).setOrigin(0.5, 0);
  }
  
  // HP bar with glow
  const dmgPct = enemy.hp / enemy.maxHp;
  graphics.fillStyle(0x330000, 0.5);
  graphics.fillRect(ex - 62, ey - 102, 124, 14);
  graphics.fillStyle(0x330000, 1);
  graphics.fillRect(ex - 60, ey - 100, 120, 10);
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(ex - 60, ey - 100, 120 * dmgPct, 10);
  graphics.lineStyle(1, 0xffffff);
  graphics.strokeRect(ex - 60, ey - 100, 120, 10);
}

function drawChest() {
  if (chest.opened) return; // Don't draw if opened
  
  const cx = 600;
  const cy = 300;
  
  // Chest body
  graphics.fillStyle(0x8B4513, 1);
  graphics.fillRect(cx - 40, cy - 30, 80, 60);
  graphics.lineStyle(2, 0x000000);
  graphics.strokeRect(cx - 40, cy - 30, 80, 60);
  
  // Metal bands
  graphics.fillStyle(0x666666, 1);
  graphics.fillRect(cx - 40, cy - 20, 80, 4);
  graphics.fillRect(cx - 40, cy + 10, 80, 4);
  
  // Lock
  graphics.fillStyle(0xFFD700, 1);
  graphics.fillRect(cx - 5, cy - 10, 10, 20);
  graphics.lineStyle(2, 0x000000);
  graphics.strokeRect(cx - 5, cy - 10, 10, 20);
  
  // Sparkles
  const sparkles = [
    { x: cx - 45, y: cy - 35, phase: 0 },
    { x: cx + 45, y: cy - 25, phase: Math.PI },
    { x: cx - 35, y: cy + 35, phase: Math.PI * 0.5 }
  ];
  sparkles.forEach(s => {
    const alpha = 0.5 + Math.sin(Date.now() / 200 + s.phase) * 0.5;
    graphics.fillStyle(0xFFFFFF, alpha);
    // Dibujar estrella manualmente
    const size = 4;
    graphics.beginPath();
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? size : size / 2;
      const angle = (i * Math.PI) / 5;
      const px = s.x + Math.cos(angle) * radius;
      const py = s.y + Math.sin(angle) * radius;
      if (i === 0) graphics.moveTo(px, py);
      else graphics.lineTo(px, py);
    }
    graphics.closePath();
    graphics.fillPath();
  });
  
  texts.event.setText('COFRE DEL TESORO').setVisible(true);
  texts.event.setPosition(600, 150).setOrigin(0.5, 0);
}

// INPUT HANDLING
function handleInput(event) {
  const key = KEYBOARD_TO_ARCADE[event.key] || event.key;
  const currentTime = Date.now();

  // Debounce discrete actions (not movement)
  const needsDebounce = ['P1A', 'P1B', 'START1'].includes(key);
  if (needsDebounce && currentTime - lastInputTime < INPUT_DEBOUNCE_MS) {
    return; // Ignore input if too soon after last one
  }
  
  if (state === 'MENU') {
    if (key === 'START1' || key === 'P1A') {
      lastInputTime = currentTime;
      startGame();
    }
  } else if (state === 'GAME') {
    if (key === 'P1U') {
      inputUp = true;
    } else if (key === 'P1D') {
      inputDown = true;
    } else if (key === 'P1L') {
      inputLeft = true;
    } else if (key === 'P1R') {
      inputRight = true;
    } else if (key === 'P1A') {
      // Actions: mine/attack/open chest (NOT advance level - must walk)
      lastInputTime = currentTime;
      // Removed auto-advance with button - player must walk to center/shop
      if (canAttack) {
        doAction(); // Mine, attack, or open chest
      }
    } else if (key === 'P1B') {
      // Escape to shop (single press)
      lastInputTime = currentTime;
      if (eventNum >= getMaxEvents(zone) - 1 && zone !== 4 && zone !== 5) {
        escapeToShop();
      } else {
        // Can't escape during events - show feedback
        play(150, 0.2); // Error sound
        showBigText('NO PUEDES VOLVER!', 400, 200, '#ff4444', 32, 2200);
      }
    }
  } else if (state === 'SHOP') {
    if (key === 'P1U') {
      shopSelection = Math.max(0, shopSelection - 1);
      play(330, 0.05);
      updateShopText();
    } else if (key === 'P1D') {
      shopSelection = Math.min(7, shopSelection + 1);
      play(330, 0.05);
      updateShopText();
    } else if (key === 'P1A') {
      // Buy selected item
      if (shopSelection === 0) {
        // Sell treasures
        if (player.treasures > 0) {
          player.money += player.treasures;
          showBigText(`TESOROS VENDIDOS! +💰${player.treasures}`, 400, 200, '#00ffff', 44, 2200);
          play(1100, 0.5, 'sine');
          player.treasures = 0;
          updateShopText();
        } else {
          play(150, 0.2);
        }
      } else if (shopSelection === 1) {
        // Eat Banana - restore to max HP
        if (player.money >= 25) {
          player.money -= 25;
          const healAmount = player.maxHp - player.hp;
          player.hp = player.maxHp;
          showBigText(`VIDA RESTAURADA! (+${healAmount})`, 400, 200, '#ffff00', 44, 2200);
          play(660, 0.4, 'sawtooth');
          updateShopText();
        } else {
          play(150, 0.2);
        }
      } else if (shopSelection === 1) {
        // Eat Banana - restore to max HP
        if (player.money >= 25) {
          player.money -= 25;
          const healAmount = player.maxHp - player.hp;
          player.hp = player.maxHp;
          showBigText(`VIDA RESTAURADA! (+${healAmount})`, 400, 200, '#ffff00', 44, 2200);
          play(660, 0.4, 'sawtooth');
          updateShopText();
        } else {
          play(150, 0.2);
        }
      } else if (shopSelection === 2) {
        // Buy HP - upgrade max HP (no limit) and heal that amount
        if (player.money >= upgradePrices.hp) {
          player.money -= upgradePrices.hp;
          const gain = 1; // Fixed +1 HP
          player.maxHp += gain;
          player.hp += gain; // Heal the amount gained
          // Price based on shop purchases only (not total HP)
          upgradePrices.hp = Math.floor(upgradePrices.hp * 1.51 + 12);
          showBigText(`VIDA MAXIMA +${gain}! [${player.maxHp} HP]`, 400, 200, '#ff0000', 44, 2000);
          play(880, 0.3);
          updateShopText();
        } else {
          play(150, 0.2);
        }
      } else if (shopSelection === 3) {
        // Buy DMG
        if (player.money >= upgradePrices.dmg) {
          player.money -= upgradePrices.dmg;
          const gain = roll(4, 8); // Aumentado de 3-6 a 4-8
          player.dmg += gain;
          upgradePrices.dmg = Math.floor(upgradePrices.dmg * 2.0);
          showBigText(`DANO +${gain}!`, 400, 200, '#ff8800', 44, 2000);
          play(1000, 0.3);
          updateShopText();
        } else {
          play(150, 0.2);
        }
      } else if (shopSelection === 4) {
        // Buy SPEED (Movement + Attack Speed)
        if (player.money >= upgradePrices.speed) {
          player.money -= upgradePrices.speed;
          player.moveSpeed = Math.floor(player.moveSpeed * 1.12); // +12% movement speed (aumentado de 10%)
          player.cooldown = Math.max(0.1, player.cooldown - 0.12); // -0.12s cooldown (aumentado de 0.1s)
          upgradePrices.speed = Math.floor(upgradePrices.speed * 2.0);
          showBigText('MAS VELOCIDAD!', 400, 200, '#00ffff', 44, 2000);
          play(1200, 0.3);
          updateShopText();
  } else {
          play(150, 0.2);
        }
      } else if (shopSelection === 5) {
        // Buy TIMING
        if (player.money >= upgradePrices.timing) {
          player.money -= upgradePrices.timing;
          upgradeLevel.timing++;
          upgradePrices.timing = Math.floor(upgradePrices.timing * 2.0);
          updateTimingZone(false); // Apply the timing upgrade without randomizing position
          showBigText('PRECISION MEJORADA!', 400, 200, '#ffff00', 44, 2000);
          play(1300, 0.3);
          updateShopText();
        } else {
          play(150, 0.2);
        }
      } else if (shopSelection === 6) {
        // Buy PICO SUERTUDO (Mining Bonus)
        if (player.money >= upgradePrices.mining) {
          player.money -= upgradePrices.mining;
          player.miningBonus += 0.6; // +60% more minerals (aumentado de 50%)
          upgradePrices.mining = Math.floor(upgradePrices.mining * 1.9);
          showBigText('PICO SUERTUDO! +60% MINERALES!', 400, 200, '#00ffaa', 44, 2000);
          play(1100, 0.4, 'triangle');
          updateShopText();
        } else {
          play(150, 0.2);
        }
      } else if (shopSelection === 7) {
        // Return to mines - advance to next room (don't repeat cleared room)
        state = 'GAME';
        currentEvent = null;
        shopSelection = 0;
        
        // Advance to next event (reward for clearing the room that unlocked shop)
        if (!lastEventWasChest) {
          eventNum++;
        }
        lastEventWasChest = false; // Reset flag after using it
        
        // Check if zone is complete
        if (eventNum >= getMaxEvents(zone)) {
          const oldPhase = Math.floor(zone / 3);
          runMoney += ZONES[zone][Z.CHEST] * 5;
          zone++;
          mineralsInZone = 0; // Reset mineral counter for new zone
          lastEventType = null; // Reset event tracking for new zone
          const newPhase = Math.floor(zone / 3);
          eventNum = 0;
          
          if (zone >= 6) {
            state = 'GAMEOVER';
            hideShop();
            showVictory();
            return;
          }
        }
        
        hideShop();
        showGameUI();
        startGameMusic(); // Continue background music
        nextEvent();
      }
    }
  } else if (state === 'GAMEOVER') {
    if (key === 'START1' || key === 'P1A') {
      resetGame();
    }
  }
}

function handleKeyUp(event) {
  const key = event.key;

  if (state === 'GAME') {
    if (key === 'w' || key === 'ArrowUp') {
      inputUp = false;
    } else if (key === 's' || key === 'ArrowDown') {
      inputDown = false;
    } else if (key === 'a' || key === 'ArrowLeft') {
      inputLeft = false;
    } else if (key === 'd' || key === 'ArrowRight') {
      inputRight = false;
    }
  }
}

// GAME ACTIONS
function doAction() {
  // No permitir atacar si el evento ya está completo
  if (currentEvent === 'ORE' && ore && ore.hp <= 0) return;
  if (currentEvent === 'ENEMY' && enemy && enemy.hp <= 0) return;
  if (currentEvent === 'CHEST' && chest && chest.opened) return;
  
  // Check timing - must be in sweet spot zone
  const inTimingZone = timingSlider.position >= timingZone.min && timingSlider.position <= timingZone.max;

  if (!inTimingZone) {
    // Timing failed - reset combo and lose 5% of treasures (unless event already complete)
    const eventComplete = (currentEvent === 'ORE' && ore && ore.hp <= 0) || 
                          (currentEvent === 'ENEMY' && enemy && enemy.hp <= 0);
    
    if (!eventComplete) {
      // Reset combo on fail
      player.combo = 0;
      updateGameUI();
    }
    
    if (currentEvent === 'ORE') {
      // Lose 5% + 10 minimum (or all if < 10)
      const treasureLoss = player.treasures < 10 ? player.treasures : Math.floor(player.treasures * 0.05) + 10;
      player.treasures -= treasureLoss;
      if (treasureLoss > 0) {
        showBigText(`Te has tropezado y tus tesoros caen al vacío! -${treasureLoss}💎`, 400, 200, '#ff4444', 28, 2500);
      } else {
        showBigText('Te has tropezado! (pero no llevas tesoros)', 400, 200, '#ffaa00', 28, 2500);
      }
      play(150, 0.2); // Error sound
      shake(8);
      updateGameUI();
    } else if (currentEvent === 'ENEMY') {
      // Lose 5% + 10 minimum (or all if < 10)
      const treasureLoss = player.treasures < 10 ? player.treasures : Math.floor(player.treasures * 0.05) + 10;
      player.treasures -= treasureLoss;
      if (treasureLoss > 0) {
        showBigText(`Te has tropezado y tus tesoros caen al vacío! -${treasureLoss}💎`, 400, 200, '#ffaa00', 28, 2500);
      } else {
        showBigText('Te tropiezas y haces el ridiculo!', 400, 200, '#ffaa00', 28, 2500);
      }
      play(200, 0.15); // Different sound for embarrassment
      shake(5);
      updateGameUI();
    } else {
      // Just show feedback for chests (no damage or treasure loss)
      showBigText('Chocas las manos con el cofre.....', 400, 200, '#ffaa00', 32);
      play(200, 0.15);
    }

    // Check for game over
    if (player.hp <= 0) {
      state = 'GAMEOVER';
      showGameOver();
      return;
    }

    updateGameUI();
    return;
  }

  // Timing successful - execute action
  canAttack = false;
  attackTimer = 0;

  // Create success particles at the timing indicator position
  const barHeight = 180;
  const sliderX = 100;
  const sliderY = 600 - barHeight + 70;
  const sliderWidth = 600;
  const indicatorX = sliderX + timingSlider.position * sliderWidth;
  const indicatorY = sliderY + 10; // Center of the timing bar
  createTimingSuccessParticles(indicatorX, indicatorY);

  // Show pickaxe swing effect near the event
  const eventX = 600;
  const eventY = 300;
  showPickaxeSwing(eventX, eventY);
  
  if (currentEvent === 'ORE' && ore && ore.hp > 0) {
    mineOre();
  } else if (currentEvent === 'ENEMY' && enemy && enemy.hp > 0) {
    attackEnemy();
  } else if (currentEvent === 'CHEST' && chest && !chest.opened) {
    openChest();
  }
}

function mineOre() {
  // Calculate base damage first
  const maxDmg = 10 + player.dmg;
  let dmg = roll(1, maxDmg, player.dmg);
  
  // Apply combo bonus only if damage is less than max
  if (dmg < maxDmg && player.combo > 0) {
    dmg = Math.min(dmg + player.combo, maxDmg);
  }
  
  // Increase combo after hit
  player.combo++;
  
  ore.hp -= dmg;
  ore.hits++;
  
  play(220, 0.15);
  shake(5);
  spawnParticles(600, 300, ZONES[zone][Z.COLOR], 8);
  showBigText(`-${dmg} !`, 600, 200, '#ffaa00', 36);

  // Always drop gold when mining (20% of zone common value per hit) + mining bonus
  const baseMiningReward = Math.floor(ZONES[zone][Z.COMMON_VAL] * 0.2);
  const miningReward = Math.floor(baseMiningReward * (1 + player.miningBonus));
  player.treasures += miningReward;
  runMoney += miningReward;
  showBigText(`Minando ${ZONES[zone][Z.COMMON]} +${miningReward}`, 600, 250, '#00ffff', 28);
  play(800, 0.2, 'sine');
  spawnParticles(600, 300, 0x00ffff, 12);
  updateGameUI();
  
  if (ore.hp <= 0) {
    ore.hp = 0;
    // Recompensa final fija al romper el mineral (aplica mining bonus)
    const baseValue = ZONES[zone][Z.COMMON_VAL] * 3;
    const finalReward = Math.floor(baseValue * (1 + player.miningBonus));
    
    player.treasures += finalReward;
    runMoney += finalReward;
    
    showBigText(`${ZONES[zone][Z.COMMON]} +💎${finalReward}`, 600, 280, '#00ffff', 44);
    play(440, 0.4);
    spawnParticles(600, 300, ZONES[zone][Z.COLOR], 40);
    shake(15);
    updateGameUI();

    // Auto-complete event when ore is destroyed
    scene.time.delayedCall(200, () => {
      if (currentEvent === 'ORE' && ore && ore.hp <= 0) {
        completeEvent();
      }
    });
  }
}

function attackEnemy() {
  // Calculate base damage first
  const maxDmg = 10 + player.dmg;
  let dmg = roll(1, maxDmg, player.dmg);
  
  // Apply combo bonus only if damage is less than max
  if (dmg < maxDmg && player.combo > 0) {
    dmg = Math.min(dmg + player.combo, maxDmg);
  }
  
  // Increase combo after hit
  player.combo++;
  
  enemy.hp -= dmg;
  
  play(440, 0.1);
  shake(3);
  spawnParticles(600, 300, 0xff0000, 6);
  showBigText(`-${dmg} HP`, 600, 250, '#ff8800', 36);
  updateGameUI(); // Update combo display immediately
  
  if (enemy.hp <= 0) {
    enemy.hp = 0;
    showBigText('DERROTADO!', 600, 300, '#00ff00', 40);
    
    if (enemy.type === 'big') {
      const rareValue = ZONES[zone][Z.RARE_VAL];
      player.treasures += rareValue;
      runMoney += rareValue;
      showBigText(`+💎${rareValue}`, 600, 360, '#00ffff', 48);
      play(1500, 0.5, 'sine');
      updateGameUI();
    } else if (enemy.type === 'small') {
      // Small enemies give 1/5 of the rare value (rounded)
      const rareValue = ZONES[zone][Z.RARE_VAL];
      const smallReward = Math.max(1, Math.floor(rareValue / 5));
      player.treasures += smallReward;
      runMoney += smallReward;
      showBigText(`+💎${smallReward}`, 600, 360, '#88ffff', 36);
      play(1200, 0.3, 'sine');
      updateGameUI();
    }
    spawnParticles(600, 300, 0xff0000, 50);
    shake(20);
    
    // Victory flash
    const victory = scene.add.graphics();
    victory.fillStyle(0x00ff00, 0.3);
    victory.fillRect(0, 0, 800, 600);
    scene.tweens.add({
      targets: victory,
      alpha: 0,
      duration: 500,
      onComplete: () => victory.destroy()
    });

    // Auto-complete event when enemy is defeated
    scene.time.delayedCall(200, () => {
      if (currentEvent === 'ENEMY' && enemy && enemy.hp <= 0) {
        completeEvent();
      }
    });
  }
}

function openChest() {
  const lootRoll = roll(1, 10);
  
  chest.opened = true;
  play(660, 0.3);
  spawnParticles(600, 300, 0xFFD700, 30);
  shake(8);
  
  // Treasure burst flash
  const burst = scene.add.graphics();
  burst.fillStyle(0xFFD700, 0.7);
  // Dibujar estrella grande manualmente
  burst.beginPath();
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? 60 : 30;
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const px = 600 + Math.cos(angle) * radius;
    const py = 300 + Math.sin(angle) * radius;
    if (i === 0) burst.moveTo(px, py);
    else burst.lineTo(px, py);
  }
  burst.closePath();
  burst.fillPath();
  scene.tweens.add({
    targets: burst,
    alpha: 0,
    scale: 3,
    rotation: Math.PI * 2,
    duration: 800,
    ease: 'Power2',
    onComplete: () => burst.destroy()
  });
  
  // Abyss chests (zone 4+): Only heal or damage (no gold - no shop available)
  if (zone >= 4) {
    const rand = Math.random();
    if (rand < 0.4) {
      // 40% - Heal (Full restore) - OR +1 maxHP if already at full
      if (player.hp === player.maxHp) {
        // Already at max HP - grant +1 maxHP!
        player.maxHp += 1;
        player.hp = player.maxHp;
        showBigText('🍌 PLATANO DIVINO! 🍌', 600, 280, '#ffff00', 48, 2800);
        showBigText(`¡+1 VIDA MAXIMA! [${player.maxHp} HP]`, 600, 340, '#00ff00', 38, 2500);
        play(1320, 0.5, 'sine');
        spawnParticles(600, 300, 0xffff00, 60);
        spawnParticles(600, 300, 0x00ff00, 25);
        shake(15);
      } else {
        // Not at max HP - normal heal
        const healAmount = player.maxHp - player.hp;
        player.hp = player.maxHp;
        showBigText('🍌 PLATANO MAGICO! 🍌', 600, 280, '#ffff00', 48, 2800);
        showBigText(`VIDA TOTAL +${healAmount} HP!`, 600, 340, '#00ff00', 38, 2500);
        play(880, 0.4, 'sine');
        spawnParticles(600, 300, 0xffff00, 40);
        spawnParticles(600, 300, 0x00ff00, 15);
        shake(10);
      }
    } else if (rand < 0.8) {
      // 40% - +1 Damage
      player.dmg += 1;
      showBigText('⚔️ PICO MAS GRANDE +1 DMG! ⚔️', 600, 280, '#ff4400', 48);
      play(1200, 0.6, 'sawtooth');
      spawnParticles(600, 300, 0xff4400, 40);
      shake(18);
    } else {
      // 20% - Ojo de Halcón (Timing Zone +10%)
      player.timingBonus += 0.1;
      updateTimingZone(false);
      showBigText('🦅 OJO DE HALCON! 🦅', 600, 280, '#ffaa00', 48);
      showBigText('ZONA VERDE +10% MAS GRANDE!', 600, 340, '#00ff00', 36);
      play(1400, 0.5, 'sine');
      spawnParticles(600, 300, 0xffaa00, 35);
      shake(12);
    }
  } else {
    // Normal zones (0-3): Full loot table with treasures
    const rand = Math.random();
    if (rand < 0.05) {
      // 5% - Empty (reduced from 12%)
      showBigText('COFRE VACIO!', 600, 300, '#666666', 40);
      play(200, 0.3);
      spawnParticles(600, 300, 0x666666, 8);
    } else if (rand < 0.20) {
      // 15% - Banana (heals 50% HP) - OR +1 maxHP if already at full
      if (player.hp === player.maxHp) {
        // Already at max HP - grant +1 maxHP!
        player.maxHp += 1;
        player.hp = player.maxHp;
        showBigText('🍌 PLATANO DIVINO! 🍌', 600, 280, '#ffff00', 48, 2800);
        showBigText(`¡+1 VIDA MAXIMA! [${player.maxHp} HP]`, 600, 340, '#00ff00', 38, 2500);
        play(1320, 0.5, 'sine');
        spawnParticles(600, 300, 0xffff00, 60);
        spawnParticles(600, 300, 0x00ff00, 25);
        shake(15);
      } else {
        // Not at max HP - normal heal
        const healAmount = Math.floor(player.maxHp * 0.5);
        const actualHeal = Math.min(healAmount, player.maxHp - player.hp);
        player.hp = Math.min(player.maxHp, player.hp + healAmount);
        showBigText('🍌 PLATANO ENCONTRADO! 🍌', 600, 280, '#ffff00', 48, 2800);
        showBigText(`VIDA RESTAURADA +${actualHeal} HP!`, 600, 340, '#00ff00', 38, 2500);
        play(880, 0.4, 'sine');
        spawnParticles(600, 300, 0xffff00, 40);
        spawnParticles(600, 300, 0x00ff00, 15);
        shake(10);
      }
    } else if (rand < 0.35) {
      // 15% - +1 Damage (increased from 10%)
      player.dmg += 1;
      showBigText('⚔️ PICO MAS GRANDE +1 DMG! ⚔️', 600, 280, '#ff4400', 48);
      play(1200, 0.6, 'sawtooth');
      spawnParticles(600, 300, 0xff4400, 40);
      shake(18);
    } else if (rand < 0.50) {
      // 15% - Ojo de Halcón (Timing Zone +10%) - increased from 10%
      player.timingBonus += 0.1;
      updateTimingZone(false);
      showBigText('🦅 OJO DE HALCON! 🦅', 600, 280, '#ffaa00', 48);
      showBigText('ZONA VERDE +10% MAS GRANDE!', 600, 340, '#00ff00', 36);
      play(1400, 0.5, 'sine');
      spawnParticles(600, 300, 0xffaa00, 35);
      shake(12);
    } else if (zone === 0 && rand < 0.60) {
      // 10% - Pico Bendito (ONLY in BOSQUE - zone 0) - reduced from 15%
      player.miningBonus += 1.0;
      showBigText('⛏️ PICO BENDITO! ⛏️', 600, 280, '#00ffff', 48);
      showBigText('MINERALES DAN X2 RECURSOS!', 600, 340, '#ffff00', 36);
      play(1100, 0.5, 'triangle');
      spawnParticles(600, 300, 0x00ffff, 35);
      shake(15);
    } else {
      // 50% (zones 1-3) OR 40% (zone 0) - Treasure (consolidated from rare+normal+small)
      const money = ZONES[zone][Z.CHEST];
      player.treasures += money;
      runMoney += money;
      showBigText(`+💎${money} TESORO!`, 600, 340, '#ffff88', 36);
      play(800, 0.4, 'sine');
      spawnParticles(600, 300, 0xffff00, 35);
      spawnParticles(600, 300, 0xffdd00, 15);
    }
  }
  
  updateGameUI();

  // Auto-complete event when chest is opened
  scene.time.delayedCall(200, () => {
    if (currentEvent === 'CHEST' && chest && chest.opened) {
      completeEvent();
    }
  });
}

function drawTimingSlider() {
  const barHeight = 180; // Match cinematic bar height
  const sliderX = 100; // Start from left side of screen
  const sliderY = 600 - barHeight + 70; // Positioned in bottom cinematic bar (centered vertically)
  const sliderWidth = 600; // Much wider for horizontal layout
  const sliderHeight = 20; // Much shorter for horizontal layout

  // Draw slider background (track) - reduced alpha
  graphics.fillStyle(0x333333, 0.4);
  graphics.fillRect(sliderX - 2, sliderY - 2, sliderWidth + 4, sliderHeight + 4);

  // Draw slider track - reduced alpha
  graphics.fillStyle(0x666666, 0.5);
  graphics.fillRect(sliderX, sliderY, sliderWidth, sliderHeight);

  // Draw sweet spot zone (middle area) - reduced alpha
  const zoneStartX = sliderX + sliderWidth * timingZone.min;
  const zoneWidth = sliderWidth * (timingZone.max - timingZone.min);
  graphics.fillStyle(0x00ff00, 0.3);
  graphics.fillRect(zoneStartX, sliderY, zoneWidth, sliderHeight);

  // Draw slider indicator - reduced alpha (horizontal movement)
  const indicatorX = sliderX + timingSlider.position * sliderWidth;
  graphics.fillStyle(0xffff00, 0.8);
  graphics.fillRect(indicatorX - 5, sliderY - 5, 10, sliderHeight + 10);

  // Draw border - reduced alpha
  graphics.lineStyle(2, 0xffffff, 0.6);
  graphics.strokeRect(sliderX, sliderY, sliderWidth, sliderHeight);
}

function completeEvent() {
  const wasChest = currentEvent === 'CHEST'; // Guardar antes de limpiar
  currentEvent = null;
  
  // Limpiar animaciones y referencias
  if (ore && ore.spawnAnim) {
    clearInterval(ore.spawnAnim);
  }
  ore = null;
  enemy = null;
  chest = null;

  // Clean up enemy sprites
  enemySprites.forEach(sprite => {
    if (sprite && sprite.scene) {
      sprite.destroy();
    }
  });
  enemySprites = [];

  // Reset timing slider to center for next event (horizontal movement)
  timingSlider.position = 0.5;
  timingSlider.direction = 1;
  
  texts.event.setVisible(false);
  
  // Show direction choice arrows instead of auto-advancing
  showDirectionChoice(wasChest);
}

function showPickaxeSwing(x, y) {
  // Add random variation around the event position (radius of ~25 pixels)
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * 25;
  const offsetX = Math.cos(angle) * distance;
  const offsetY = Math.sin(angle) * distance - 30; // -30 to position above

  // Create pickaxe sprite near the event with random variation
  const pickaxe = scene.add.image(x + offsetX, y + offsetY, 'pickaxe');
  pickaxe.setScale(8);
  pickaxe.setAlpha(0.8);
  pickaxe.setDepth(200); // High depth to appear above everything

  // Quick swing animation with particles
  scene.tweens.add({
    targets: pickaxe,
    angle: 45,
    duration: 50,
    yoyo: true,
    ease: 'Power2',
    onComplete: () => {
      // Spawn explosion of particles when pickaxe hits
      spawnParticles(x + offsetX, y + offsetY, 0xFFD700, 20);

      // Fade out quickly
      scene.tweens.add({
        targets: pickaxe,
        alpha: 0,
        scale: 12,
        duration: 100,
        ease: 'Power2',
        onComplete: () => pickaxe.destroy()
      });
    }
  });
}

function showDirectionChoice(wasChest = false) {
  lastEventWasChest = wasChest;

  // Clear any existing arrows and block texts
  directionArrows.forEach(arrow => arrow.destroy());
  directionArrows = [];

  // Clear block texts when navigation becomes available
  if (window.centerBlockText) {
    window.centerBlockText.destroy();
    window.centerBlockText = null;
  }
  if (window.leftBlockText) {
    window.leftBlockText.destroy();
    window.leftBlockText = null;
  }

  // Create forward arrow (right) - always available
  const forwardArrow = scene.add.text(700, 300, '→', {
    fontSize: '64px',
    fontFamily: 'Arial',
    color: '#00ff00',
    stroke: '#000',
    strokeThickness: 4
  }).setOrigin(0.5).setInteractive().setDepth(800);

  // Add pulsing animation to the arrow
  scene.tweens.add({
    targets: forwardArrow,
    scaleX: 1.2,
    scaleY: 1.2,
    duration: 800,
    yoyo: true,
    repeat: -1,
    ease: 'Power2'
  });

  directionArrows.push(forwardArrow);

  // Create back arrow (left) - only at end of zone and if shop available
  let backArrow = null;
  if (eventNum >= getMaxEvents(zone) - 1 && zone !== 4 && zone !== 5) {
    backArrow = scene.add.text(150, 300, '←', {
      fontSize: '64px',
      fontFamily: 'Arial',
    color: '#ffff00',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5).setInteractive().setDepth(800);

    // Add pulsing animation to back arrow too
    scene.tweens.add({
      targets: backArrow,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Power2'
    });

    directionArrows.push(backArrow);

    // Add "TIENDA DISPONIBLE!" text above the back arrow
    const shopAvailableText = scene.add.text(150, 240, 'TIENDA DISPONIBLE!', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffff00',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(800);

    // Add pulsing animation to shop text too
    scene.tweens.add({
      targets: shopAvailableText,
      alpha: { from: 1, to: 0.5 },
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Power2'
    });

    directionArrows.push(shopAvailableText);
  }

  // Show hint text
  const canShop = eventNum >= getMaxEvents(zone) - 1 && zone !== 4 && zone !== 5;
  const hintMessage = canShop ? '  ←   Tienda (Button B)  | Continuar (Avanzar)  → ' : ' ';
  const centerHintText = scene.add.text(400, 450, hintMessage, {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#ffffff',
    stroke: '#000',
    strokeThickness: 2
  }).setOrigin(0.5).setDepth(800);
  directionArrows.push(centerHintText);

  // Add click handlers
  forwardArrow.on('pointerdown', () => selectDirection('forward'));
  if (backArrow) {
    backArrow.on('pointerdown', () => selectDirection('back'));
  }

  // Add hover effects
  forwardArrow.on('pointerover', () => forwardArrow.setScale(1.2));
  forwardArrow.on('pointerout', () => forwardArrow.setScale(1.0));
  if (backArrow) {
    backArrow.on('pointerover', () => backArrow.setScale(1.2));
    backArrow.on('pointerout', () => backArrow.setScale(1.0));
  }

  // Animate arrows (pulse effect)
  const targets = backArrow ? [forwardArrow, backArrow] : [forwardArrow];
  scene.tweens.add({
    targets: targets,
    scale: { from: 1, to: 1.1 },
    duration: 600,
    yoyo: true,
    repeat: -1,
    ease: 'Power2'
  });
}

function selectDirection(choice) {
  // Hide arrows and hint
  directionArrows.forEach(arrow => arrow.destroy());
  directionArrows = [];

  if (choice === 'forward') {
    // Continue to next event (cofres no suman al contador)
  if (!lastEventWasChest) {
    eventNum++;
  }
  if (eventNum >= getMaxEvents(zone)) {
    // Zone complete
    const oldPhase = Math.floor(zone / 3);
    runMoney += ZONES[zone][Z.CHEST] * 5;
    zone++;
    mineralsInZone = 0; // Reset mineral counter for new zone
    lastEventType = null; // Reset event tracking for new zone
    const newPhase = Math.floor(zone / 3);
    eventNum = 0;
    
    if (oldPhase !== newPhase && state === 'GAME') {
      stopGameMusic();
      startGameMusic();
    }
    
    if (zone >= 6) {
      state = 'GAMEOVER';
      showVictory();
      return;
    }
  }
  nextEvent();
  } else if (choice === 'back') {
    // Go to shop
    escapeToShop();
  }
}

function nextEvent() {
  // Randomize timing zone position for new event
  updateTimingZone();
  
  // Zona 5 (JEFE FINAL): Solo el jefe, un evento
  if (zone === 5) {
    spawnEnemy(); // Solo el HEROE CORRUPTO
    updateGameUI();
    return;
  }
  
  // Zona 4 (EL ABISMO): Solo enemigos y cofres, sin minerales (3 eventos)
  if (zone === 4) {
    const eventRoll = Math.random();
    if (eventRoll < 0.70) { // 70% enemigos
      spawnEnemy();
    } else {
      spawnChest(); // 30% cofres
    }
    updateGameUI();
    return;
  }
  
  // Zonas normales (0-3): Minerales, enemigos y cofres
  let eventRoll = roll(1, 20); // 1-20 para probabilidades más finas
  
  // BOSQUE evento 2: Boost chest chance to 80%
  if (zone === 0 && eventNum === 1 && eventRoll > 5) {
    eventRoll = roll(5, 9); // Force chest range
  }
  
  // Anti-repetición: -30% chance si es mismo tipo que anterior
  const lastType = lastEventType;
  if (lastType === 'ENEMY' && eventRoll <= 4) eventRoll = 5; // Evita enemigo
  if (lastType === 'CHEST' && eventRoll >= 5 && eventRoll <= 9) eventRoll = 10; // Evita cofre
  if (lastType === 'ORE' && eventRoll >= 10) eventRoll = roll(1, 9); // Evita mineral
  
  if (eventRoll <= 4) {
    spawnEnemy(); // 4/20 = 20%
  } else if (eventRoll <= 9) {
    spawnChest(); // 5/20 = 25% (+5%)
  } else {
    // Max 3 minerals per zone
    if (mineralsInZone < 3) {
      spawnOre(); // 11/20 = 55%
      mineralsInZone++;
    } else {
      spawnEnemy(); // Spawn enemy instead if mineral limit reached
    }
  }
  
  updateGameUI();
}

function spawnOre() {
  currentEvent = 'ORE';
  lastEventType = 'ORE';
  ore = { hp: 30, maxHp: 30, hits: 0, scale: 0 };
  play(330, 0.2);

  // Show mineral discovery text
  showBigText('MINERAL ENCONTRADO!', 400, 380, '#ffff00', 48);
  
  // Spawn animation - bounce in
  const startTime = Date.now();
  ore.spawnAnim = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 300;
    ore.scale = Math.min(1, elapsed);
    if (elapsed >= 1) {
      clearInterval(ore.spawnAnim);
      ore.scale = 1;
    }
  }, 16);
}

function spawnEnemy() {
  currentEvent = 'ENEMY';
  lastEventType = 'ENEMY';
  
  // Zona ??? (5) solo tiene enemigos grandes
  if (zone === 5 || Math.random() >= 0.65) {
    // Big enemy
    enemy = {
      type: 'big',
      name: ZONES[zone][Z.BIG_E],
      hp: ZONES[zone][Z.BIG_HP],
      maxHp: ZONES[zone][Z.BIG_HP],
      dmgDice: ZONES[zone][Z.BIG_DMG],
      attackTimer: 1.5, // Empezar atacando pronto
      attacking: null,
      attackWarn: 0
    };
  } else {
    // Small enemy
    const hp = roll(ZONES[zone][Z.SMALL_HP][0], ZONES[zone][Z.SMALL_HP][1], ZONES[zone][Z.SMALL_HP][2]);
    enemy = {
      type: 'small',
      name: ZONES[zone][Z.SMALL_E],
      hp: hp,
      maxHp: hp,
      dmgDice: ZONES[zone][Z.SMALL_DMG],
      shootTimer: 0.6 - (zone * 0.1) // Empezar disparando pronto, MUY rápido en zonas avanzadas
    };
  }

  // Show enemy discovery text based on type
  if (enemy.type === 'small') {
    showBigText('ENEMIGO AVISTADO!', 400, 380, '#ff6600', 48);
  } else {
    // Cambia 180 por 300
  showBigText('PELIGRO ENEMIGO ELITE!', 400, 300, '#ff0000', 42);
  }

  play(200, 0.3);
}

function spawnChest() {
  currentEvent = 'CHEST';
  lastEventType = 'CHEST';
  chest = { opened: false };
  play(550, 0.2);

  // Show secret room discovery text
  showBigText('SALA SECRETA ENCONTRADA!', 400, 380, '#ff00ff', 48);
}

// STATE TRANSITIONS
function startGame() {
  state = 'GAME';
  zone = 0;
  eventNum = 0;
  runMoney = 0;
  currentEvent = null;
  lastEventType = null;
  
  hideMenu();
  showGameUI();
  startGameMusic(); // Start background music synchronized with timing
  nextEvent();
}

function escapeToShop() {
  // Clear navigation UI before going to shop
  directionArrows.forEach(arrow => arrow.destroy());
  directionArrows = [];

  // Clear block texts
  if (window.centerBlockText) {
    window.centerBlockText.destroy();
    window.centerBlockText = null;
  }
  if (window.leftBlockText) {
    window.leftBlockText.destroy();
    window.leftBlockText = null;
  }

  state = 'SHOP';
  shopSelection = 0;
  projectiles = [];
  particles = [];
  inputUp = false; // Reset input state
  inputDown = false;
  inputLeft = false;
  inputRight = false;
  lastInputTime = 0; // Reset debounce timer
  stopGameMusic(); // Stop music when going to shop
  hideGame();
  showShop();
}

function resetGame() {
  // Stop background music
  stopGameMusic();

  // Complete deep reset - reinitialize ALL game state

  // Player and stats
  player = { hp: 1, maxHp: 1, dmg: 1, cooldown: 0.6, moveSpeed: 250, money: 0, treasures: 0, pos: 300, x: 150, combo: 0, timingBonus: 0, miningBonus: 0 }; // Reset to center position

  // Reset input state
  inputUp = false;
  inputDown = false;
  inputLeft = false;
  inputRight = false;
  lastInputTime = 0; // Reset debounce timer

  // Game state
  state = 'MENU';
  zone = 0;
  mineralsInZone = 0; // Reset mineral counter
  eventNum = 0;
  currentEvent = null;
  lastEventWasChest = false;
  lastEventType = null;

  // Combat state
  enemy = null;
  ore = null;
  chest = null;
  attackTimer = 0;
  canAttack = true;

  // Money and upgrades
  runMoney = 0;
  upgradePrices = { hp: 50, dmg: 100, speed: 75, timing: 200, mining: 150 };
  upgradeLevel = { timing: 0 };
  updateTimingZone(); // Reset timing zone to base values
  shopSelection = 0;

  // Visual effects
  shakeAmt = 0;
  // Destroy particle sprites before clearing array
  particles.forEach(p => p.destroy());
  particles = [];
  projectiles = [];
  bgStars = [];
  particleEmitters = [];
  directionArrows = [];
  timingSlider = { position: 0, direction: 1, speed: 2 };

  // Stop all active tweens FIRST (before destroying objects)
  if (scene && scene.tweens) {
    scene.tweens.killAll();
  }

  // Clear all timers/intervals
  if (ore && ore.spawnAnim) {
    clearInterval(ore.spawnAnim);
  }

  // Destroy all sprites and graphics
  if (playerSprite && playerSprite.scene) {
    playerSprite.destroy();
    playerSprite = null;
  }
  
  // Clean up floating texts (after killing tweens)
  floatingTexts.forEach(t => {
    if (t && t.scene) {
      t.destroy();
    }
  });
  floatingTexts = [];
  
  // Clean up direction arrows
  directionArrows.forEach(arrow => arrow.destroy());
  directionArrows = [];
  if (texts.directionHint) {
    texts.directionHint.destroy();
    texts.directionHint = null;
  }

  // Clean up enemy sprites
  enemySprites.forEach(sprite => {
    if (sprite && sprite.scene) {
      sprite.destroy();
    }
  });
  enemySprites = [];

  // Clean up particle emitters
  particleEmitters.forEach(emitter => {
    if (emitter && emitter.scene) {
      emitter.destroy();
    }
  });
  particleEmitters = [];

  // Clear graphics
  if (graphics) {
    graphics.clear();
  }

  // Reset camera position
  if (scene && scene.cameras && scene.cameras.main) {
    scene.cameras.main.setPosition(0, 0);
  }

  // Reinitialize background stars
  createBgStars();

  // Show menu
  showMenu();
}

// UI FUNCTIONS
function hideMenu() {
  texts.title.setVisible(false);
  texts.subtitle.setVisible(false);
  texts.info.setVisible(false);
}

function showMenu() {
  // Restaurar textos originales del menú
  texts.title.setText('EL ABYSS').setColor('#8b4789');
  texts.title.setFontSize('72px');
  texts.subtitle.setText('PRESIONA START').setColor('#d4af37');
  texts.subtitle.setAlign('center');
  texts.subtitle.setWordWrapWidth(0); // Desactivar word wrap
  texts.info.setText('DESCIENDE A LA OSCURIDAD • ENFRENTA TU DESTINO • RECLAMA TU FORTUNA').setColor('#9370db');

  texts.combo.setVisible(false);     // <-- Faltaba este
  texts.title.setVisible(true);
  texts.subtitle.setVisible(true);
  texts.info.setVisible(true);
  texts.zone.setVisible(false);
  texts.hp.setVisible(false);
  texts.money.setVisible(false);
  texts.event.setVisible(false);
  if (texts.treasures) texts.treasures.setVisible(false);
}

function showGameUI() {
  // Hide menu texts
  texts.title.setVisible(false);
  texts.subtitle.setVisible(false);
  texts.info.setVisible(false);

  // Show game texts
  texts.zone.setVisible(true);
  texts.hp.setVisible(true);
  texts.money.setVisible(true);
  texts.treasures.setVisible(true);
  if (playerSprite && playerSprite.scene) playerSprite.setVisible(true);
  updateGameUI();
}

function updateGameUI() {
  const maxEvents = getMaxEvents(zone);
  texts.zone.setText(`${ZONES[zone][Z.NAME]} - SALA ${eventNum + 1}/${maxEvents}`);
  
  // Display hearts
  let hearts = '';
  for (let i = 0; i < player.maxHp; i++) {
    hearts += i < player.hp ? '❤️' : '🖤';
  }
  texts.hp.setText(hearts);
  
  texts.money.setText(`💰${player.money}`);
  texts.treasures.setText(`💎 Tesoros: ${player.treasures}`);
  
  // Show combo counter if > 0
  if (player.combo > 0) {
    texts.combo.setText(`COMBO x${player.combo}`);
    texts.combo.setVisible(true);
  } else {
    texts.combo.setVisible(false);
  }
}

function hideGame() {
  texts.zone.setVisible(false);
  texts.hp.setVisible(false);
  texts.money.setVisible(false);
  texts.treasures.setVisible(false);
  texts.combo.setVisible(false);
  texts.event.setVisible(false);
  if (playerSprite && playerSprite.scene) playerSprite.setVisible(false);
}

function hideShop() {
  // Stop shop music
  stopShopMusic();
  
  // Clear shop texts
  if (texts.shop && Array.isArray(texts.shop)) {
    texts.shop.forEach(t => t.destroy());
    texts.shop = [];
  }

  // Hide menu texts (don't reset them to menu state since we're going to game)
  texts.title.setVisible(false);
  texts.subtitle.setVisible(false);
  texts.info.setVisible(false);
}

function showShop() {
  const bg = scene.add.graphics();
  // Tavern wood background gradient
  bg.fillGradientStyle(0x2a1810, 0x2a1810, 0x1a0f08, 0x1a0f08, 1);
  bg.fillRect(0, 0, 800, 600);
  // Wood planks texture
  for(let i = 0; i < 12; i++) {
    bg.fillStyle(0x1a0f08, 0.3);
    bg.fillRect(0, i * 50, 800, 2);
  }
  // Stone counter
  bg.fillStyle(0x4a4a4a, 0.9);
  bg.fillRect(50, 90, 700, 480);
  bg.lineStyle(4, 0x6a5a4a);
  bg.strokeRect(50, 90, 700, 480);
  // Counter edge highlight
  bg.lineStyle(2, 0x8a7a6a, 0.5);
  bg.strokeRect(52, 92, 696, 476);
  bg.setDepth(400);
  texts.shop = [bg];

  // Tavern sign
  texts.title.setText('La Taberna Del Platano Dorado')
    .setStyle({ fontSize: '42px', fontFamily: 'Georgia, serif', color: '#ffcc66', stroke: '#331a00', strokeThickness: 6, fontStyle: 'bold italic' })
    .setVisible(true).setPosition(400, 35).setDepth(450);
  
  // Gold pouch display
  texts.subtitle.setText(`💰 ${player.money} Monedas`)
    .setStyle({ fontSize: '26px', fontFamily: 'Georgia, serif', color: '#ffd700', stroke: '#331a00', strokeThickness: 4, fontStyle: 'italic' })
    .setVisible(true).setPosition(400, 82).setOrigin(0.5).setDepth(450);
  
  // Tavern keeper message
  texts.info.setText('↑↓ Elegir  |  ⚔ Pedir  |  ← Salir de la Taberna')
    .setStyle({ fontSize: '15px', fontFamily: 'Georgia, serif', color: '#d4a574', stroke: '#1a0f08', strokeThickness: 2, fontStyle: 'italic' })
    .setVisible(true).setPosition(400, 565).setOrigin(0.5).setDepth(450);

  updateTimingZone();
  updateShopText();
  startShopMusic();
}

function updateShopText() {
  // Update gold display
  texts.subtitle.setText(`💰 ${player.money} Monedas`);
  
  if (texts.shop && Array.isArray(texts.shop)) {
    texts.shop.slice(1).forEach(t => t.destroy());
    texts.shop = [texts.shop[0]];
  }
  
  const options = [
    { name: '💎 Vender Tesoros', price: -1, info: `Convierte tus tesoros en monedas (${player.treasures} tesoros disponibles)`, color: '#00ffff', cat: '💰' },
    { name: '🍌 Estofado de Potasio', price: 25, info: 'Rellena tus corazones', color: '#ffdd44', cat: '🍽️' },
    { name: '❤️ Entrenamiento Fisico', price: upgradePrices.hp, info: `FULL TANK +1 Corazon [${player.hp}/${player.maxHp} HP]`, color: '#ff5555', cat: '💪' },
    { name: '⚔️ Afilar Herramientas', price: upgradePrices.dmg, info: `Pico mas letal (+DMG)(+3d6) [${(1 + player.dmg)}-${(10 + player.dmg * 2)}]`, color: '#ff8833', cat: '🔨' },
    { name: '⚡ Cerveza Energizante', price: upgradePrices.speed, info: `Movimiento y ataque mas rapidos [${player.cooldown.toFixed(1)}s]`, color: '#44ddff', cat: '🍺' },
    { name: '🎯 Leccion de Precision', price: upgradePrices.timing, info: `Mejora tu punteria (ZONA VERDE MAS GRANDE) (Nivel ${upgradeLevel.timing})`, color: '#ffdd44', cat: '📜' },
    { name: '⛏️ Pico Suertudo', price: upgradePrices.mining, info: `Minerales dan +50% mas recursos permanente [+${Math.floor(player.miningBonus * 100)}%]`, color: '#00ffaa', cat: '💎' },
    { name: '🚪 Volver a las Minas', price: 0, info: 'Regresar al abismo oscuro...', color: '#88ff88', cat: '�' }
  ];
  
  let y = 100;
  options.forEach((opt, idx) => {
    const selected = idx === shopSelection;
    const canAfford = player.money >= opt.price || opt.price <= 0;
    
    const cardBg = scene.add.graphics();
    // Parchment-style card (reduced height: 60 -> 52)
    if (selected) {
      cardBg.fillStyle(canAfford ? 0x3a2f1f : 0x2f1a1a, 0.95);
      cardBg.fillRect(80, y, 640, 52);
      cardBg.lineStyle(3, canAfford ? 0xffd700 : 0xff4444, 1);
      cardBg.strokeRect(80, y, 640, 52);
      // Inner glow
      cardBg.lineStyle(1, canAfford ? 0xffee99 : 0xff8888, 0.6);
      cardBg.strokeRect(83, y + 3, 634, 46);
    } else {
      cardBg.fillStyle(0x2a1f12, 0.7);
      cardBg.fillRect(80, y, 640, 52);
      cardBg.lineStyle(1, 0x4a3a2a, 0.6);
      cardBg.strokeRect(80, y, 640, 52);
    }
    cardBg.setDepth(410);
    texts.shop.push(cardBg);
    
    // Category icon
    const catText = scene.add.text(95, y + 8, opt.cat, {
      fontSize: '24px',
      fontFamily: 'Arial'
    }).setDepth(420);
    texts.shop.push(catText);
    
    // Item name with tavern style
    const nameText = scene.add.text(135, y + 4, opt.name, {
      fontSize: selected ? '20px' : '18px',
      fontFamily: 'Georgia, serif',
      color: selected ? (canAfford ? opt.color : '#665555') : '#998877',
      stroke: '#0a0502',
      strokeThickness: selected ? 3 : 2,
      fontStyle: 'bold'
    }).setDepth(420);
    texts.shop.push(nameText);
    
    // Description
    const descText = scene.add.text(135, y + 29, opt.info, {
      fontSize: '12px',
      fontFamily: 'Georgia, serif',
      color: selected ? (canAfford ? '#ccbb99' : '#ff7777') : '#776655',
      fontStyle: 'italic'
    }).setDepth(420);
    texts.shop.push(descText);
    
    // Price tag with tavern coin style
    if (opt.price > 0) {
      const priceText = scene.add.text(700, y + 26, `${opt.price}`, {
        fontSize: selected ? '26px' : '22px',
        fontFamily: 'Georgia, serif',
        color: canAfford ? '#ffd700' : '#ff5555',
        stroke: '#0a0502',
        strokeThickness: 3,
        fontStyle: 'bold'
      }).setOrigin(1, 0.5).setDepth(420);
      texts.shop.push(priceText);
      
      const coinIcon = scene.add.text(705, y + 26, '◉', {
        fontSize: selected ? '18px' : '16px',
        color: canAfford ? '#ffee99' : '#aa4444'
      }).setOrigin(0, 0.5).setDepth(420);
      texts.shop.push(coinIcon);
    } else if (opt.price === -1) {
      const freeText = scene.add.text(700, y + 26, player.treasures > 0 ? 'Vender!' : 'Sin tesoros', {
        fontSize: '18px',
        fontFamily: 'Georgia, serif',
        color: player.treasures > 0 ? '#00ffff' : '#666666',
        stroke: '#0a0502',
        strokeThickness: 2,
        fontStyle: 'italic bold'
      }).setOrigin(1, 0.5).setDepth(420);
      texts.shop.push(freeText);
    } else {
      const freeText = scene.add.text(700, y + 30, 'Vamos!', {
        fontSize: '20px',
        fontFamily: 'Georgia, serif',
        color: '#88dd88',
        stroke: '#0a0502',
        strokeThickness: 2,
        fontStyle: 'italic bold'
      }).setOrigin(1, 0.5).setDepth(420);
      texts.shop.push(freeText);
    }
    
    y += 56; // Reduced spacing (62 -> 56) to fit 7 options
  });
}

function showGameOver() {
  // Stop background music
  stopGameMusic();

  // Limpiar todos los estados de juego
  currentEvent = null;
  projectiles = [];
  // Destroy particle sprites before clearing array
  particles.forEach(p => p.destroy());
  particles = [];
  
  // Limpiar y ocultar sprites de enemigos
  enemySprites.forEach(sprite => {
    if (sprite && sprite.destroy) sprite.destroy();
  });
  enemySprites = [];
  
  // Limpiar enemigos y sus ataques
  if (enemy) {
    enemy.hp = 0;
    enemy.attacking = null;
    enemy.attackWarn = 0;
  }
  enemy = null;
  ore = null;
  chest = null;
  
  hideGame();
//el texto es muy grande asi que hay que subirlo mas de lo que parece
  texts.title.setText('Otro Deshecho en el ABYSS').setVisible(true).setPosition(400, 70);
  texts.title.setFontSize('48px');
  texts.title.setColor('#cc3333');
  
  texts.subtitle.setText(
    `Profundidad Alcanzada: ${ZONES[zone][0]}\n\n` +
    `Score Total: $${runMoney}\n\n` +
    `Oro Final: $${player.money}\n\n\n` +
    `PRESIONA START PARA DESCENDER DE NUEVO`
  ).setVisible(true).setPosition(400, 340).setColor('#ff6666');
  
  texts.info.setVisible(false);
  
  play(100, 1.0);
}

function showVictory() {
  hideGame();
  
  // Limpiar y ocultar sprites de enemigos
  enemySprites.forEach(sprite => {
    if (sprite && sprite.destroy) sprite.destroy();
  });
  enemySprites = [];
  
  texts.title.setText('ABYSS CONQUISTADO!').setVisible(true).setPosition(400, 65);
  texts.title.setFontSize('56px');
  texts.title.setColor('#ffd700');
  
  // Use the last valid zone (5) if zone exceeds the array
  const finalZone = Math.min(zone, 5);
  
  texts.subtitle.setText(
    `Profundidad Alcanzada: ${ZONES[finalZone][0]}\n\n` +
    `Score Total: $${runMoney}\n\n` +
    `Oro Final: $${player.money}\n\n\n` +
    `PRESIONA START PARA DESCENDER DE NUEVO`
  ).setVisible(true).setPosition(400, 280).setColor('#ffed4e');
  
  texts.info.setVisible(false);
  
  play(880, 0.5, 'sine');
  setTimeout(() => play(1100, 0.5, 'sine'), 200);
  setTimeout(() => play(1320, 0.8, 'sine'), 400);
}

// AUDIO

