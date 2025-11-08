# Modular Development Strategy - Hackathon Arcade Lobby

## 🎯 Core Concept: Separate Files, Zero Conflicts

Each agent works on their own file. At the end, we concatenate them into `game.js`. This eliminates merge conflicts and allows true parallel development.

---

## 📁 File Structure

```
project/
├── game.js                          (FINAL - created by combining modules)
├── modules/
│   ├── 01-config.js                 (Agent v.01)
│   ├── 02-lobby-environment.js      (Agent v.02)
│   ├── 03-lobby-players.js          (Agent v.03)
│   ├── 04-lobby-interaction.js      (Agent v.04)
│   ├── 05-minigame-core.js          (Agent v.05)
│   ├── 06-minigame-combat.js        (Agent v.06)
│   ├── 07-audio-ui.js               (Agent v.07)
│   └── 08-game-init.js              (Agent v.01)
├── metadata.json                    (Agent v.07)
└── cover.png                        (Agent v.07 - optional)
```

---

## 👥 Agent Assignments

### 🎮 Agent v.01 - Foundation Architect

**Files**: 
- `modules/01-config.js` (game configuration)
- `modules/08-game-init.js` (game initialization)

**Tasks**:
1. Create game configuration object
2. Define scene class shells (empty LobbyScene and MiniGameScene)
3. Create game initialization code

**Code Template**:
```javascript
// modules/01-config.js
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [] // Will be populated by other modules
};

// Scene class shells
class LobbyScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Lobby' });
  }
  
  preload() {}
  create() {}
  update() {}
}

class MiniGameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MiniGame' });
  }
  
  init(data) {
    this.playerCount = data.players || 1;
  }
  
  preload() {}
  create() {}
  update() {}
}
```

```javascript
// modules/08-game-init.js
config.scene = [LobbyScene, MiniGameScene];
const game = new Phaser.Game(config);
```

**Dependencies**: None - START IMMEDIATELY
**Estimated Time**: 30 minutes
**Deliverable**: Scene structure ready for other agents

---

### 🏢 Agent v.02 - Lobby Environment Artist

**File**: `modules/02-lobby-environment.js`

**Tasks**:
1. Create lobby environment graphics (floor, grid)
2. Generate banana decorations
3. Generate money decorations
4. Create arcade station graphic

**Code Template**:
```javascript
// modules/02-lobby-environment.js

// Extend LobbyScene.create
const originalLobbyCreate = LobbyScene.prototype.create;
LobbyScene.prototype.create = function() {
  if (originalLobbyCreate) originalLobbyCreate.call(this);
  
  // Office floor with grid
  const floor = this.add.graphics();
  floor.fillStyle(0x333333, 1);
  floor.fillRect(0, 0, 800, 600);
  floor.lineStyle(1, 0x444444, 0.5);
  for (let i = 0; i < 800; i += 50) {
    floor.lineBetween(i, 0, i, 600);
  }
  for (let j = 0; j < 600; j += 50) {
    floor.lineBetween(0, j, 800, j);
  }
  
  // Bananas (5-8 random positions)
  for (let i = 0; i < 6; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const banana = this.add.graphics();
    banana.fillStyle(0xffff00, 1);
    banana.fillEllipse(x, y, 20, 40);
    banana.fillStyle(0x8b4513, 1);
    banana.fillRect(x - 2, y - 22, 4, 8);
  }
  
  // Money (4-6 random positions)
  for (let i = 0; i < 5; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const money = this.add.graphics();
    money.fillStyle(0x00ff00, 1);
    money.fillRect(x, y, 30, 15);
    money.lineStyle(2, 0x006600, 1);
    money.strokeRect(x, y, 30, 15);
    this.add.text(x + 8, y + 2, '$', { fontSize: '12px', color: '#006600' });
  }
  
  // Arcade station
  const station = this.add.graphics();
  station.fillStyle(0x8b00ff, 1);
  station.fillRect(600, 300, 100, 120);
  station.fillStyle(0x000000, 1);
  station.fillRect(610, 310, 80, 60);
  station.fillStyle(0x00ffff, 1);
  station.fillCircle(650, 390, 15);
  
  // Store for other modules
  this.arcadeStation = this.add.zone(650, 360, 100, 120);
  this.physics.add.existing(this.arcadeStation);
};
```

**Dependencies**: Needs v.01 to create scene structure
**Estimated Time**: 2 hours
**Deliverable**: Lobby environment with decorations

---

### 🎯 Agent v.03 - Player Movement Engineer

**File**: `modules/03-lobby-players.js`

**Tasks**:
1. Create player avatar sprites
2. Set up keyboard input
3. Implement movement logic

**Code Template**:
```javascript
// modules/03-lobby-players.js

// Extend LobbyScene.create
const originalLobbyCreate2 = LobbyScene.prototype.create;
LobbyScene.prototype.create = function() {
  if (originalLobbyCreate2) originalLobbyCreate2.call(this);
  
  // Player 1 (blue circle)
  const p1 = this.add.graphics();
  p1.fillStyle(0x0066ff, 1);
  p1.fillCircle(0, 0, 20);
  p1.generateTexture('player1', 40, 40);
  p1.destroy();
  
  this.player1 = this.physics.add.sprite(100, 300, 'player1');
  this.player1.setCollideWorldBounds(true);
  
  // Player 2 (red circle)
  const p2 = this.add.graphics();
  p2.fillStyle(0xff0066, 1);
  p2.fillCircle(0, 0, 20);
  p2.generateTexture('player2', 40, 40);
  p2.destroy();
  
  this.player2 = this.physics.add.sprite(700, 300, 'player2');
  this.player2.setCollideWorldBounds(true);
  
  // Input
  this.cursors = this.input.keyboard.createCursorKeys();
  this.wasd = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });
  this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
};

// Extend LobbyScene.update
LobbyScene.prototype.update = function() {
  const speed = 200;
  
  // Player 1 movement
  if (this.cursors.left.isDown) {
    this.player1.setVelocityX(-speed);
  } else if (this.cursors.right.isDown) {
    this.player1.setVelocityX(speed);
  } else {
    this.player1.setVelocityX(0);
  }
  
  if (this.cursors.up.isDown) {
    this.player1.setVelocityY(-speed);
  } else if (this.cursors.down.isDown) {
    this.player1.setVelocityY(speed);
  } else {
    this.player1.setVelocityY(0);
  }
  
  // Player 2 movement
  if (this.wasd.left.isDown) {
    this.player2.setVelocityX(-speed);
  } else if (this.wasd.right.isDown) {
    this.player2.setVelocityX(speed);
  } else {
    this.player2.setVelocityX(0);
  }
  
  if (this.wasd.up.isDown) {
    this.player2.setVelocityY(-speed);
  } else if (this.wasd.down.isDown) {
    this.player2.setVelocityY(speed);
  } else {
    this.player2.setVelocityY(0);
  }
};
```

**Dependencies**: Needs v.01 to create scene structure
**Estimated Time**: 2 hours
**Deliverable**: Player movement working

---

### 🚪 Agent v.04 - Transition Specialist

**File**: `modules/04-lobby-interaction.js`

**Tasks**:
1. Detect player overlap with arcade station
2. Show interaction prompt
3. Handle scene transition

**Code Template**:
```javascript
// modules/04-lobby-interaction.js

// Extend LobbyScene.create (add interaction)
const originalLobbyCreate3 = LobbyScene.prototype.create;
LobbyScene.prototype.create = function() {
  if (originalLobbyCreate3) originalLobbyCreate3.call(this);
  
  // Wait for other modules to set up players and station
  this.time.delayedCall(100, () => {
    if (this.player1 && this.arcadeStation) {
      this.physics.add.overlap(this.player1, this.arcadeStation, () => {
        this.nearStation = true;
      });
      this.physics.add.overlap(this.player2, this.arcadeStation, () => {
        this.nearStation = true;
      });
    }
  });
  
  this.promptText = this.add.text(400, 500, 'Press SPACE to play!', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5).setVisible(false);
  
  this.nearStation = false;
};

// Extend LobbyScene.update (add interaction check)
const originalLobbyUpdate = LobbyScene.prototype.update;
LobbyScene.prototype.update = function() {
  if (originalLobbyUpdate) originalLobbyUpdate.call(this);
  
  // Check if near station
  if (this.arcadeStation && this.player1) {
    const dist1 = Phaser.Math.Distance.Between(
      this.player1.x, this.player1.y,
      this.arcadeStation.x, this.arcadeStation.y
    );
    const dist2 = Phaser.Math.Distance.Between(
      this.player2.x, this.player2.y,
      this.arcadeStation.x, this.arcadeStation.y
    );
    
    this.nearStation = dist1 < 80 || dist2 < 80;
    this.promptText.setVisible(this.nearStation);
    
    if (this.nearStation && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.scene.start('MiniGame', { players: 2 });
    }
  }
};
```

**Dependencies**: Needs v.02 (arcade station) and v.03 (players)
**Estimated Time**: 1 hour
**Deliverable**: Scene transition working

---

### 👾 Agent v.05 - Mini-Game Ships & Projectiles

**File**: `modules/05-minigame-core.js`

**Tasks**:
1. Create ship graphics
2. Implement ship movement
3. Create projectile system

**Code Template**:
```javascript
// modules/05-minigame-core.js

// Extend MiniGameScene.create
MiniGameScene.prototype.create = function() {
  // Ship graphics
  const ship1 = this.add.graphics();
  ship1.fillStyle(0x0066ff, 1);
  ship1.fillTriangle(20, 0, 0, 20, 40, 20);
  ship1.generateTexture('ship1', 40, 20);
  ship1.destroy();
  
  const ship2 = this.add.graphics();
  ship2.fillStyle(0xff0066, 1);
  ship2.fillTriangle(20, 0, 0, 20, 40, 20);
  ship2.generateTexture('ship2', 40, 20);
  ship2.destroy();
  
  // Create ships
  this.ship1 = this.physics.add.sprite(100, 550, 'ship1');
  this.ship2 = this.physics.add.sprite(700, 550, 'ship2');
  
  // Projectile graphic
  const pitch = this.add.graphics();
  pitch.fillStyle(0xffff00, 1);
  pitch.fillRect(0, 0, 4, 15);
  pitch.generateTexture('pitch', 4, 15);
  pitch.destroy();
  
  // Projectile group
  this.pitches = this.physics.add.group({
    defaultKey: 'pitch',
    maxSize: 20
  });
  
  // Input
  this.cursors = this.input.keyboard.createCursorKeys();
  this.wasd = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });
  this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  this.lastFired1 = 0;
  this.lastFired2 = 0;
  this.score = 0;
};

// MiniGameScene.update
MiniGameScene.prototype.update = function(time) {
  const speed = 250;
  
  // Ship 1 movement
  if (this.cursors.left.isDown) {
    this.ship1.setVelocityX(-speed);
  } else if (this.cursors.right.isDown) {
    this.ship1.setVelocityX(speed);
  } else {
    this.ship1.setVelocityX(0);
  }
  
  // Ship 2 movement
  if (this.wasd.left.isDown) {
    this.ship2.setVelocityX(-speed);
  } else if (this.wasd.right.isDown) {
    this.ship2.setVelocityX(speed);
  } else {
    this.ship2.setVelocityX(0);
  }
  
  // Shooting
  if (this.spaceKey.isDown && time > this.lastFired1 + 300) {
    const p = this.pitches.get(this.ship1.x, this.ship1.y - 20);
    if (p) {
      p.setActive(true);
      p.setVisible(true);
      p.setVelocityY(-400);
      this.lastFired1 = time;
    }
  }
  
  if (this.wasd.up.isDown && time > this.lastFired2 + 300) {
    const p = this.pitches.get(this.ship2.x, this.ship2.y - 20);
    if (p) {
      p.setActive(true);
      p.setVisible(true);
      p.setVelocityY(-400);
      this.lastFired2 = time;
    }
  }
  
  // Clean up projectiles
  this.pitches.children.entries.forEach(p => {
    if (p.active && p.y < -20) {
      p.setActive(false);
      p.setVisible(false);
    }
  });
};
```

**Dependencies**: Needs v.01 to create scene structure
**Estimated Time**: 3 hours
**Deliverable**: Ships and shooting working

---

### 🤖 Agent v.06 - Combat & Enemy Waves

**File**: `modules/06-minigame-combat.js`

**Tasks**:
1. Create investor graphics
2. Implement wave movement
3. Add collision detection
4. Implement game over logic

**Code Template**:
```javascript
// modules/06-minigame-combat.js

// Extend MiniGameScene.create
const originalMiniCreate = MiniGameScene.prototype.create;
MiniGameScene.prototype.create = function() {
  if (originalMiniCreate) originalMiniCreate.call(this);
  
  // Investor graphic
  const inv = this.add.graphics();
  inv.fillStyle(0x00ff00, 1);
  inv.fillRect(0, 0, 30, 30);
  inv.fillStyle(0x000000, 1);
  inv.fillCircle(10, 10, 3);
  inv.fillCircle(20, 10, 3);
  inv.fillRect(8, 20, 14, 2);
  inv.generateTexture('investor', 30, 30);
  inv.destroy();
  
  // Create investor wave
  this.investors = this.physics.add.group();
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 8; col++) {
      const x = 100 + col * 80;
      const y = 80 + row * 50;
      const investor = this.investors.create(x, y, 'investor');
    }
  }
  
  this.moveDir = 1;
  this.moveSpeed = 50;
  this.gameActive = true;
  
  // Collision
  this.time.delayedCall(100, () => {
    if (this.pitches) {
      this.physics.add.overlap(this.pitches, this.investors, (pitch, inv) => {
        pitch.setActive(false);
        pitch.setVisible(false);
        inv.destroy();
        this.score += 10;
        if (this.scoreText) this.scoreText.setText('Score: ' + this.score);
        
        if (this.investors.countActive() === 0) {
          this.gameOver(true);
        }
      });
    }
  });
};

// Extend MiniGameScene.update
const originalMiniUpdate = MiniGameScene.prototype.update;
MiniGameScene.prototype.update = function(time, delta) {
  if (originalMiniUpdate) originalMiniUpdate.call(this, time, delta);
  
  if (!this.gameActive) return;
  
  // Move investors
  let needDescend = false;
  this.investors.children.entries.forEach(inv => {
    inv.x += this.moveSpeed * this.moveDir * delta / 1000;
    if (inv.x > 770 || inv.x < 30) needDescend = true;
    if (inv.y > 530) this.gameOver(false);
  });
  
  if (needDescend) {
    this.moveDir *= -1;
    this.investors.children.entries.forEach(inv => {
      inv.y += 20;
    });
  }
};

MiniGameScene.prototype.gameOver = function(won) {
  this.gameActive = false;
  this.physics.pause();
  
  const msg = won ? 'FUNDED!' : 'REJECTED!';
  const color = won ? '#00ff00' : '#ff0000';
  this.add.text(400, 300, msg + '\nScore: ' + this.score, {
    fontSize: '48px',
    color: color,
    align: 'center'
  }).setOrigin(0.5);
  
  this.time.delayedCall(3000, () => {
    this.scene.start('Lobby');
  });
};
```

**Dependencies**: Needs v.05 (ships and projectiles)
**Estimated Time**: 3 hours
**Deliverable**: Full mini-game working

---

### 🔊 Agent v.07 - Audio, UI & Polish

**File**: `modules/07-audio-ui.js`

**Tasks**:
1. Create Web Audio functions
2. Add score display
3. Integrate audio into gameplay
4. Update metadata.json
5. Optimize code size

**Code Template**:
```javascript
// modules/07-audio-ui.js

// Audio context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playShootSound() {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.value = 440;
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.1);
}

function playHitSound() {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.15);
}

function playGameOverSound() {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.setValueAtTime(440, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.5);
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.5);
}

// Add score display to MiniGameScene
const originalMiniCreate2 = MiniGameScene.prototype.create;
MiniGameScene.prototype.create = function() {
  if (originalMiniCreate2) originalMiniCreate2.call(this);
  
  this.scoreText = this.add.text(32, 32, 'Score: 0', {
    fontSize: '24px',
    color: '#ffffff'
  });
};

// Integrate audio (patch shooting and collision)
// This will be done by modifying the functions in v.05 and v.06
```

**Also Updates**: `metadata.json`
```json
{
  "game_name": "Hackathon Arcade Lobby",
  "description": "Explore a hackathon office lobby and play Pitch Invaders - defend against investor questions with your startup pitches! 1-2 player co-op arcade action."
}
```

**Dependencies**: Can start audio immediately; UI needs v.05 and v.06
**Estimated Time**: 3 hours
**Deliverable**: Audio, UI, and metadata complete

---

## 🔧 Assembly Process

### Step 1: Create Build Script

Create `build-game.js`:

```javascript
const fs = require('fs');

const modules = [
  'modules/01-config.js',
  'modules/02-lobby-environment.js',
  'modules/03-lobby-players.js',
  'modules/04-lobby-interaction.js',
  'modules/05-minigame-core.js',
  'modules/06-minigame-combat.js',
  'modules/07-audio-ui.js',
  'modules/08-game-init.js'
];

let combined = '';

modules.forEach(file => {
  if (fs.existsSync(file)) {
    combined += fs.readFileSync(file, 'utf8') + '\n\n';
  }
});

fs.writeFileSync('game.js', combined);
console.log('✅ game.js built successfully!');
```

### Step 2: Build Command

```bash
node build-game.js
```

### Step 3: Test

```bash
pnpm check-restrictions
pnpm dev
```

---

## 📊 Development Timeline

### Day 1 Morning (0-4 hours)
- **v.01**: Creates foundation (30 min) → BLOCKS ALL
- **v.02, v.03, v.07**: Start work in parallel (2-3 hours)

### Day 1 Afternoon (4-8 hours)
- **v.04**: Adds interactions (1 hour)
- **v.05**: Starts mini-game (3 hours)
- **v.02, v.03, v.07**: Continue work

### Day 2 Morning (8-12 hours)
- **v.06**: Adds combat (3 hours)
- **v.05**: Finishes mini-game
- **v.07**: Integrates audio and UI

### Day 2 Afternoon (12-16 hours)
- **v.07**: Final optimization
- **ALL**: Testing
- **v.01**: Runs build script
- **ALL**: Final validation

---

## ✅ Advantages of This Approach

1. **Zero Merge Conflicts**: Each agent has their own file
2. **True Parallel Development**: No waiting for file access
3. **Easy Rollback**: Can exclude problematic modules
4. **Clear Ownership**: Each agent owns their module
5. **Incremental Testing**: Can test modules individually
6. **Simple Integration**: Just concatenate files

---

## 🚀 Quick Start for Each Agent

1. Create your module file in `modules/` directory
2. Follow your code template
3. Test your module independently (if possible)
4. Mark your status as complete
5. Agent v.01 will run the build script

---

## 📝 Status Tracking

| Agent | File | Status | ETA | Notes |
|-------|------|--------|-----|-------|
| v.01 | 01-config.js, 08-game-init.js | 🟢 | 30min | Foundation |
| v.02 | 02-lobby-environment.js | 🟢 | 2h | Complete |
| v.03 | 03-lobby-players.js | 🟢 | 2h | Complete |
| v.04 | 04-lobby-interaction.js | 🟢 | 1h | Complete |
| v.05 | 05-minigame-core.js | 🟢 | 3h | Complete |
| v.06 | 06-minigame-combat.js | 🟢 | 3h | Complete |
| v.07 | 07-audio-ui.js, metadata.json | 🟢 | 3h | Complete |

**Legend**: 🔴 Not Started | 🟡 In Progress | 🟢 Complete | 🔵 Blocked

---

**This approach eliminates file corruption and enables true parallel development!** 🎉
