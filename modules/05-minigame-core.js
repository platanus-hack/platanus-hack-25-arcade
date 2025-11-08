// ============ MINIGAME CORE ============
// Agent v.05 - Mini-Game Core Mechanics Lead

MiniGameScene.prototype.create = function() {
  this.score = 0;
  this.gameActive = true;
  this.lastFire1 = 0;
  this.lastFire2 = 0;
  
  // Background
  this.add.rectangle(400, 300, 800, 600, 0x000000);
  
  // Ship 1 texture
  const s1g = this.add.graphics();
  s1g.fillStyle(0x0066ff, 1);
  s1g.fillTriangle(20, 0, 0, 20, 40, 20);
  s1g.generateTexture('ship1', 40, 20);
  s1g.destroy();
  
  // Ship 2 texture
  const s2g = this.add.graphics();
  s2g.fillStyle(0xff0066, 1);
  s2g.fillTriangle(20, 0, 0, 20, 40, 20);
  s2g.generateTexture('ship2', 40, 20);
  s2g.destroy();
  
  // Create ships
  this.ship1 = this.physics.add.sprite(100, 550, 'ship1');
  this.ship1.setCollideWorldBounds(true);
  
  if (this.playerCount === 2) {
    this.ship2 = this.physics.add.sprite(700, 550, 'ship2');
    this.ship2.setCollideWorldBounds(true);
  }
  
  // Pitch texture
  const pg = this.add.graphics();
  pg.fillStyle(0xffff00, 1);
  pg.fillRect(0, 0, 4, 15);
  pg.generateTexture('pitch', 4, 15);
  pg.destroy();
  
  this.pitches = this.physics.add.group({ maxSize: 20 });
  
  // UI
  this.scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '24px',
    color: '#ffffff'
  });
  
  this.add.text(400, 16, 'PITCH INVADERS', {
    fontSize: '24px',
    color: '#00ffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  this.add.text(400, 580, 'P1: Arrows + Up | P2: WASD + W', {
    fontSize: '14px',
    color: '#888888'
  }).setOrigin(0.5);
  
  // Input
  this.cursors = this.input.keyboard.createCursorKeys();
  this.wasd = this.input.keyboard.addKeys('W,A,S,D');
  
  // Audio context
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContext();
  } catch (e) {
    this.audioCtx = null;
  }
};

MiniGameScene.prototype.update = function(time) {
  if (!this.gameActive) return;
  
  const spd = 250;
  
  // Ship 1 controls
  if (this.cursors.left.isDown) {
    this.ship1.setVelocityX(-spd);
  } else if (this.cursors.right.isDown) {
    this.ship1.setVelocityX(spd);
  } else {
    this.ship1.setVelocityX(0);
  }
  
  if (this.cursors.up.isDown && time > this.lastFire1 + 300) {
    this.shoot(this.ship1.x, this.ship1.y);
    this.lastFire1 = time;
  }
  
  // Ship 2 controls
  if (this.ship2) {
    if (this.wasd.A.isDown) {
      this.ship2.setVelocityX(-spd);
    } else if (this.wasd.D.isDown) {
      this.ship2.setVelocityX(spd);
    } else {
      this.ship2.setVelocityX(0);
    }
    
    if (this.wasd.W.isDown && time > this.lastFire2 + 300) {
      this.shoot(this.ship2.x, this.ship2.y);
      this.lastFire2 = time;
    }
  }
  
  // Clean up projectiles
  this.pitches.children.entries.forEach(p => {
    if (p.y < -20) p.destroy();
  });
};

MiniGameScene.prototype.shoot = function(x, y) {
  const pitch = this.pitches.create(x, y - 20, 'pitch');
  pitch.setVelocityY(-400);
  this.playSound(440, 0.1, 0.3);
};

MiniGameScene.prototype.playSound = function(freq, dur, vol) {
  if (!this.audioCtx) return;
  try {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.frequency.value = freq;
    osc.type = 'square';
    gain.gain.setValueAtTime(vol, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + dur);
    osc.start(this.audioCtx.currentTime);
    osc.stop(this.audioCtx.currentTime + dur);
  } catch (e) {}
};
