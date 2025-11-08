// ============ CODE DEFENDERS: AI INVASION ============
// A game about developers defending their jobs from AI automation

const cfg = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 } }
  },
  scene: []
};

// ============ LOBBY SCENE ============
class LobbyScene extends Phaser.Scene {
  constructor() {
    super('Lobby');
  }
  
  create() {
    // Dark tech office floor
    const g = this.add.graphics();
    g.fillStyle(0x0a0a0a, 1);
    g.fillRect(0, 0, 800, 600);
    
    // Grid pattern
    g.lineStyle(1, 0x00ff88, 0.15);
    for (let i = 0; i < 800; i += 40) g.lineBetween(i, 0, i, 600);
    for (let j = 0; j < 600; j += 40) g.lineBetween(0, j, 800, j);
    
    // Scattered laptops (workstations)
    for (let i = 0; i < 8; i++) {
      const x = 80 + (i % 4) * 180;
      const y = 100 + Math.floor(i / 4) * 200;
      g.fillStyle(0x333333, 1);
      g.fillRect(x, y, 60, 40);
      g.fillStyle(0x00ff88, 1);
      g.fillRect(x + 5, y + 5, 50, 25);
    }
    
    // Coffee cups
    for (let i = 0; i < 6; i++) {
      const x = 100 + Math.random() * 600;
      const y = 100 + Math.random() * 400;
      g.fillStyle(0x8b4513, 1);
      g.fillRect(x, y, 20, 25);
      g.fillStyle(0x654321, 1);
      g.fillEllipse(x + 10, y + 5, 15, 10);
    }
    
    // Arcade machine (glowing)
    g.fillStyle(0x1a1a2e, 1);
    g.fillRect(550, 220, 120, 160);
    g.fillStyle(0x0f3460, 1);
    g.fillRect(560, 230, 100, 80);
    
    // Screen glow effect
    g.fillStyle(0x00ff88, 0.3);
    g.fillRect(555, 225, 110, 90);
    
    // Arcade buttons
    const btnColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
    for (let i = 0; i < 4; i++) {
      g.fillStyle(btnColors[i], 1);
      g.fillCircle(575 + i * 25, 340, 10);
    }
    
    // Joystick
    g.fillStyle(0xff0000, 1);
    g.fillCircle(610, 360, 15);
    g.fillStyle(0x000000, 1);
    g.fillCircle(610, 360, 8);
    
    // Station physics
    this.station = this.physics.add.sprite(610, 300, null).setVisible(false);
    this.station.body.setSize(120, 160);
    
    // Title with glow
    this.add.text(400, 30, 'CODE DEFENDERS', {
      fontSize: '36px',
      color: '#00ff88',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    this.add.text(400, 65, 'AI INVASION', {
      fontSize: '24px',
      color: '#ff0066',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // Player textures
    const p1g = this.add.graphics();
    p1g.fillStyle(0x00aaff, 1);
    p1g.fillCircle(20, 20, 18);
    p1g.fillStyle(0x0066cc, 1);
    p1g.fillCircle(15, 15, 5);
    p1g.fillCircle(25, 15, 5);
    p1g.fillStyle(0xffffff, 1);
    p1g.fillCircle(15, 15, 3);
    p1g.fillCircle(25, 15, 3);
    p1g.generateTexture('p1', 40, 40);
    p1g.destroy();
    
    const p2g = this.add.graphics();
    p2g.fillStyle(0xff0066, 1);
    p2g.fillCircle(20, 20, 18);
    p2g.fillStyle(0xcc0044, 1);
    p2g.fillCircle(15, 15, 5);
    p2g.fillCircle(25, 15, 5);
    p2g.fillStyle(0xffffff, 1);
    p2g.fillCircle(15, 15, 3);
    p2g.fillCircle(25, 15, 3);
    p2g.generateTexture('p2', 40, 40);
    p2g.destroy();
    
    // Players
    this.p1 = this.physics.add.sprite(100, 300, 'p1');
    this.p1.setCollideWorldBounds(true);
    this.p1.body.setCircle(18);
    
    this.p2 = this.physics.add.sprite(700, 300, 'p2');
    this.p2.setCollideWorldBounds(true);
    this.p2.body.setCircle(18);
    
    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.space = this.input.keyboard.addKey('SPACE');
    
    // Prompt
    this.prompt = this.add.text(610, 400, 'PRESS SPACE\nTO DEFEND!', {
      fontSize: '18px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 6 },
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);
    
    // Controls hint
    this.add.text(400, 570, 'P1: Arrow Keys + UP to Shoot | P2: WASD + W to Shoot', {
      fontSize: '14px',
      color: '#666666'
    }).setOrigin(0.5);
    
    // Pulsing animation for prompt
    this.tweens.add({
      targets: this.prompt,
      alpha: 0.5,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }
  
  update() {
    const spd = 220;
    
    // P1 movement
    if (this.cursors.left.isDown) this.p1.setVelocityX(-spd);
    else if (this.cursors.right.isDown) this.p1.setVelocityX(spd);
    else this.p1.setVelocityX(0);
    
    if (this.cursors.up.isDown) this.p1.setVelocityY(-spd);
    else if (this.cursors.down.isDown) this.p1.setVelocityY(spd);
    else this.p1.setVelocityY(0);
    
    // P2 movement
    if (this.wasd.A.isDown) this.p2.setVelocityX(-spd);
    else if (this.wasd.D.isDown) this.p2.setVelocityX(spd);
    else this.p2.setVelocityX(0);
    
    if (this.wasd.W.isDown) this.p2.setVelocityY(-spd);
    else if (this.wasd.S.isDown) this.p2.setVelocityY(spd);
    else this.p2.setVelocityY(0);
    
    // Check station proximity
    const p1Near = Phaser.Math.Distance.Between(this.p1.x, this.p1.y, 610, 300) < 100;
    const p2Near = Phaser.Math.Distance.Between(this.p2.x, this.p2.y, 610, 300) < 100;
    const nearStation = p1Near || p2Near;
    
    this.prompt.setVisible(nearStation);
    
    if (nearStation && Phaser.Input.Keyboard.JustDown(this.space)) {
      this.scene.start('Game', { players: 2 });
    }
  }
}

// ============ MAIN GAME SCENE ============
class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }
  
  init(data) {
    this.playerCount = data.players || 2;
    this.score = 0;
    this.wave = 1;
    this.lives = 3;
    this.combo = 0;
    this.comboTimer = 0;
    this.comboMult = 1;
    this.gameActive = true;
    this.lastFire1 = 0;
    this.lastFire2 = 0;
    this.powerupActive = null;
    this.powerupTimer = 0;
    this.shield = 0;
    this.enemiesLeft = 0;
    this.bossActive = false;
    this.bossPhase = 1;
  }
  
  create() {
    // Background
    this.add.rectangle(400, 300, 800, 600, 0x000000);
    
    // Starfield
    this.stars = this.add.graphics();
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 800;
      const y = Math.random() * 600;
      const s = Math.random() * 2;
      this.stars.fillStyle(0xffffff, Math.random() * 0.8 + 0.2);
      this.stars.fillCircle(x, y, s);
    }
    
    // Create textures
    this.createTextures();
    
    // Audio context
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    } catch (e) {
      this.audioCtx = null;
    }
    
    // Ships
    this.ship1 = this.physics.add.sprite(200, 550, 'ship1');
    this.ship1.setCollideWorldBounds(true);
    
    this.ship2 = this.physics.add.sprite(600, 550, 'ship2');
    this.ship2.setCollideWorldBounds(true);
    
    // Groups
    this.bullets = this.physics.add.group({ maxSize: 30 });
    this.enemies = this.physics.add.group();
    this.enemyBullets = this.physics.add.group({ maxSize: 20 });
    this.powerups = this.physics.add.group({ maxSize: 5 });
    
    // Particles
    const pg = this.add.graphics();
    pg.fillStyle(0xffffff, 1);
    pg.fillCircle(2, 2, 2);
    pg.generateTexture('particle', 4, 4);
    pg.destroy();
    
    this.particles = this.add.particles('particle');
    
    // Collisions
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.enemyBullets, [this.ship1, this.ship2], this.hitPlayer, null, this);
    this.physics.add.overlap([this.ship1, this.ship2], this.enemies, this.hitPlayer, null, this);
    this.physics.add.overlap([this.ship1, this.ship2], this.powerups, this.collectPowerup, null, this);
    
    // UI
    this.scoreText = this.add.text(16, 16, 'SCORE: 0', {
      fontSize: '20px',
      color: '#00ff88',
      fontStyle: 'bold'
    });
    
    this.waveText = this.add.text(400, 16, 'WAVE 1', {
      fontSize: '24px',
      color: '#ff0066',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.comboText = this.add.text(784, 16, '', {
      fontSize: '20px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(1, 0);
    
    this.livesText = this.add.text(16, 50, '❤️ '.repeat(this.lives), {
      fontSize: '24px'
    });
    
    this.powerupText = this.add.text(400, 580, '', {
      fontSize: '16px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5).setVisible(false);
    
    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    
    // Start first wave
    this.time.delayedCall(1000, () => this.startWave());
  }
  
  createTextures() {
    // Ship 1
    const s1 = this.add.graphics();
    s1.fillStyle(0x00aaff, 1);
    s1.fillTriangle(20, 0, 0, 30, 40, 30);
    s1.fillStyle(0x0066cc, 1);
    s1.fillRect(15, 25, 10, 5);
    s1.generateTexture('ship1', 40, 30);
    s1.destroy();
    
    // Ship 2
    const s2 = this.add.graphics();
    s2.fillStyle(0xff0066, 1);
    s2.fillTriangle(20, 0, 0, 30, 40, 30);
    s2.fillStyle(0xcc0044, 1);
    s2.fillRect(15, 25, 10, 5);
    s2.generateTexture('ship2', 40, 30);
    s2.destroy();
    
    // Bullet
    const b = this.add.graphics();
    b.fillStyle(0x00ff88, 1);
    b.fillRect(0, 0, 4, 12);
    b.generateTexture('bullet', 4, 12);
    b.destroy();
    
    // Enemy bullet
    const eb = this.add.graphics();
    eb.fillStyle(0xff0066, 1);
    eb.fillRect(0, 0, 4, 12);
    eb.generateTexture('ebullet', 4, 12);
    eb.destroy();
  }
  
  update(time, delta) {
    if (!this.gameActive) return;
    
    const spd = 280;
    
    // Ship 1 controls
    if (this.cursors.left.isDown) this.ship1.setVelocityX(-spd);
    else if (this.cursors.right.isDown) this.ship1.setVelocityX(spd);
    else this.ship1.setVelocityX(0);
    
    if (this.cursors.down.isDown) this.ship1.setVelocityY(spd * 0.5);
    else if (this.cursors.up.isDown && this.ship1.y > 400) this.ship1.setVelocityY(-spd * 0.5);
    else this.ship1.setVelocityY(0);
    
    const fireRate = this.powerupActive === 'rapid' ? 100 : 250;
    if (this.cursors.up.isDown && time > this.lastFire1 + fireRate) {
      this.shoot(this.ship1.x, this.ship1.y - 15);
      this.lastFire1 = time;
    }
    
    // Ship 2 controls
    if (this.wasd.A.isDown) this.ship2.setVelocityX(-spd);
    else if (this.wasd.D.isDown) this.ship2.setVelocityX(spd);
    else this.ship2.setVelocityX(0);
    
    if (this.wasd.S.isDown) this.ship2.setVelocityY(spd * 0.5);
    else if (this.wasd.W.isDown && this.ship2.y > 400) this.ship2.setVelocityY(-spd * 0.5);
    else this.ship2.setVelocityY(0);
    
    if (this.wasd.W.isDown && time > this.lastFire2 + fireRate) {
      this.shoot(this.ship2.x, this.ship2.y - 15);
      this.lastFire2 = time;
    }
    
    // Update enemies
    this.enemies.children.entries.forEach(e => {
      if (e.aiType === 'chatbot') {
        e.x += Math.sin(time * 0.002 + e.offset) * 2;
      } else if (e.aiType === 'copilot') {
        e.x += Math.sin(time * 0.004 + e.offset) * 3;
        e.y += Math.cos(time * 0.003 + e.offset) * 1;
      } else if (e.aiType === 'agent') {
        e.x += Math.sin(time * 0.003 + e.offset) * 2.5;
        if (Math.random() < 0.002 && !this.bossActive) {
          this.enemyShoot(e.x, e.y + 15);
        }
      } else if (e.aiType === 'swarm') {
        e.x += Math.sin(time * 0.006 + e.offset) * 4;
        e.y += Math.sin(time * 0.005 + e.offset) * 2;
      } else if (e.aiType === 'boss') {
        e.x += Math.sin(time * 0.001) * 3;
        if (time % 1000 < 50) {
          this.enemyShoot(e.x - 20, e.y + 30);
          this.enemyShoot(e.x + 20, e.y + 30);
        }
      }
      
      if (e.y > 620) e.destroy();
    });
    
    // Combo timer
    if (this.comboTimer > 0) {
      this.comboTimer -= delta;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        this.comboMult = 1;
        this.comboText.setText('');
      }
    }
    
    // Powerup timer
    if (this.powerupTimer > 0) {
      this.powerupTimer -= delta;
      if (this.powerupTimer <= 0) {
        this.powerupActive = null;
        this.powerupText.setVisible(false);
      }
    }
    
    // Check wave complete
    if (this.enemiesLeft <= 0 && this.enemies.countActive() === 0 && !this.bossActive) {
      this.waveComplete();
    }
    
    // Cleanup
    this.bullets.children.entries.forEach(b => { if (b.y < -20) b.destroy(); });
    this.enemyBullets.children.entries.forEach(b => { if (b.y > 620) b.destroy(); });
  }
  
  shoot(x, y) {
    const b = this.bullets.create(x, y, 'bullet');
    b.setVelocityY(-500);
    this.playSound(440, 0.08, 0.15);
    
    // Bullet trail
    this.particles.createEmitter({
      follow: b,
      quantity: 2,
      scale: { start: 0.3, end: 0 },
      tint: 0x00ff88,
      lifespan: 200,
      alpha: { start: 0.8, end: 0 }
    });
  }
  
  enemyShoot(x, y) {
    const b = this.enemyBullets.create(x, y, 'ebullet');
    b.setVelocityY(300);
  }
  
  startWave() {
    this.waveText.setText('WAVE ' + this.wave);
    
    // Boss wave every 5 waves
    if (this.wave % 5 === 0) {
      this.spawnBoss();
      return;
    }
    
    // Calculate enemy counts
    const chatbots = Math.min(5 + this.wave, 12);
    const copilots = this.wave > 2 ? Math.min(Math.floor(this.wave / 2), 6) : 0;
    const agents = this.wave > 4 ? Math.min(Math.floor(this.wave / 3), 4) : 0;
    const swarms = this.wave > 3 ? Math.min(this.wave - 3, 8) : 0;
    
    this.enemiesLeft = chatbots + copilots + agents + swarms;
    
    // Spawn enemies
    let delay = 0;
    for (let i = 0; i < chatbots; i++) {
      this.time.delayedCall(delay, () => this.spawnEnemy('chatbot'));
      delay += 300;
    }
    for (let i = 0; i < copilots; i++) {
      this.time.delayedCall(delay, () => this.spawnEnemy('copilot'));
      delay += 400;
    }
    for (let i = 0; i < agents; i++) {
      this.time.delayedCall(delay, () => this.spawnEnemy('agent'));
      delay += 500;
    }
    for (let i = 0; i < swarms; i++) {
      this.time.delayedCall(delay, () => this.spawnEnemy('swarm'));
      delay += 200;
    }
  }
  
  spawnEnemy(type) {
    const x = 100 + Math.random() * 600;
    const y = -30;
    
    // Create texture if needed
    if (!this.textures.exists(type)) {
      const g = this.add.graphics();
      
      if (type === 'chatbot') {
        g.fillStyle(0x00ff00, 1);
        g.fillRect(0, 0, 30, 30);
        g.fillStyle(0x000000, 1);
        g.fillCircle(10, 12, 3);
        g.fillCircle(20, 12, 3);
        g.fillRect(8, 20, 14, 2);
      } else if (type === 'copilot') {
        g.fillStyle(0x0088ff, 1);
        g.fillRect(0, 0, 35, 35);
        g.fillStyle(0xffffff, 1);
        g.fillCircle(12, 12, 4);
        g.fillCircle(23, 12, 4);
        g.fillRect(10, 22, 15, 3);
      } else if (type === 'agent') {
        g.fillStyle(0xff00ff, 1);
        g.fillRect(0, 0, 40, 40);
        g.fillStyle(0xffff00, 1);
        g.fillCircle(13, 13, 5);
        g.fillCircle(27, 13, 5);
        g.fillStyle(0xff0000, 1);
        g.fillRect(10, 25, 20, 4);
      } else if (type === 'swarm') {
        g.fillStyle(0xffaa00, 1);
        g.fillCircle(10, 10, 10);
        g.fillStyle(0x000000, 1);
        g.fillCircle(7, 8, 2);
        g.fillCircle(13, 8, 2);
      }
      
      g.generateTexture(type, type === 'swarm' ? 20 : (type === 'chatbot' ? 30 : (type === 'copilot' ? 35 : 40)), type === 'swarm' ? 20 : (type === 'chatbot' ? 30 : (type === 'copilot' ? 35 : 40)));
      g.destroy();
    }
    
    const e = this.enemies.create(x, y, type);
    e.aiType = type;
    e.offset = Math.random() * 10;
    e.hp = type === 'chatbot' ? 1 : (type === 'copilot' ? 2 : (type === 'agent' ? 3 : 1));
    e.maxHp = e.hp;
    e.points = type === 'chatbot' ? 10 : (type === 'copilot' ? 25 : (type === 'agent' ? 50 : 5));
    
    const speed = this.powerupActive === 'slow' ? 20 : (type === 'swarm' ? 80 : (type === 'copilot' ? 60 : 40));
    e.setVelocityY(speed);
    
    // Spawn animation
    e.setScale(0);
    this.tweens.add({
      targets: e,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
  }
  
  spawnBoss() {
    this.bossActive = true;
    this.bossPhase = 1;
    this.enemiesLeft = 1;
    
    // Boss texture
    if (!this.textures.exists('boss')) {
      const g = this.add.graphics();
      g.fillStyle(0xff0000, 1);
      g.fillRect(0, 0, 80, 60);
      g.fillStyle(0x000000, 1);
      g.fillCircle(20, 20, 8);
      g.fillCircle(60, 20, 8);
      g.fillStyle(0xff0000, 1);
      g.fillCircle(20, 20, 5);
      g.fillCircle(60, 20, 5);
      g.fillStyle(0xffff00, 1);
      g.fillRect(15, 40, 50, 5);
      g.generateTexture('boss', 80, 60);
      g.destroy();
    }
    
    const boss = this.enemies.create(400, -60, 'boss');
    boss.aiType = 'boss';
    boss.offset = 0;
    boss.hp = 30 + (this.wave * 5);
    boss.maxHp = boss.hp;
    boss.points = 500;
    boss.setVelocityY(30);
    
    // Boss warning
    const warning = this.add.text(400, 300, 'AGI BOSS INCOMING!', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: warning,
      alpha: 0,
      duration: 2000,
      onComplete: () => warning.destroy()
    });
    
    this.playSound(100, 1, 0.3);
    this.cameras.main.shake(500, 0.01);
  }
  
  hitEnemy(bullet, enemy) {
    bullet.destroy();
    
    if (this.shield > 0) return;
    
    enemy.hp--;
    
    // Flash effect
    enemy.setTint(0xffffff);
    this.time.delayedCall(100, () => enemy.clearTint());
    
    if (enemy.hp <= 0) {
      // Explosion
      this.particles.createEmitter({
        x: enemy.x,
        y: enemy.y,
        speed: { min: 50, max: 200 },
        angle: { min: 0, max: 360 },
        scale: { start: 1, end: 0 },
        tint: enemy.aiType === 'chatbot' ? 0x00ff00 : (enemy.aiType === 'copilot' ? 0x0088ff : (enemy.aiType === 'agent' ? 0xff00ff : (enemy.aiType === 'boss' ? 0xff0000 : 0xffaa00))),
        lifespan: 600,
        quantity: enemy.aiType === 'boss' ? 50 : 15
      });
      
      // Score
      this.combo++;
      this.comboTimer = 2000;
      this.comboMult = Math.min(Math.floor(this.combo / 3) + 1, 5);
      this.score += enemy.points * this.comboMult;
      this.scoreText.setText('SCORE: ' + this.score);
      
      if (this.comboMult > 1) {
        this.comboText.setText('x' + this.comboMult + ' COMBO!');
      }
      
      // Powerup chance
      if (Math.random() < 0.15 && this.powerups.countActive() < 3) {
        this.spawnPowerup(enemy.x, enemy.y);
      }
      
      this.enemiesLeft--;
      
      if (enemy.aiType === 'boss') {
        this.bossActive = false;
        this.cameras.main.shake(800, 0.02);
      }
      
      enemy.destroy();
      this.playSound(880, 0.15, 0.2);
    } else {
      this.playSound(660, 0.1, 0.15);
    }
  }
  
  hitPlayer(player, threat) {
    if (this.shield > 0) {
      this.shield--;
      threat.destroy();
      this.playSound(1200, 0.2, 0.2);
      return;
    }
    
    threat.destroy();
    this.lives--;
    this.livesText.setText('❤️ '.repeat(Math.max(0, this.lives)));
    
    // Flash
    player.setTint(0xff0000);
    this.time.delayedCall(200, () => player.clearTint());
    
    this.cameras.main.shake(300, 0.015);
    this.playSound(220, 0.3, 0.3);
    
    if (this.lives <= 0) {
      this.gameOver();
    }
  }
  
  spawnPowerup(x, y) {
    const types = ['rapid', 'slow', 'shield', 'bomb'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    if (!this.textures.exists('powerup_' + type)) {
      const g = this.add.graphics();
      const colors = { rapid: 0xff8800, slow: 0x8b4513, shield: 0x00ff00, bomb: 0xffff00 };
      g.fillStyle(colors[type], 1);
      g.fillCircle(15, 15, 15);
      g.fillStyle(0x000000, 1);
      g.fillCircle(15, 15, 10);
      g.generateTexture('powerup_' + type, 30, 30);
      g.destroy();
    }
    
    const p = this.powerups.create(x, y, 'powerup_' + type);
    p.powerType = type;
    p.setVelocityY(100);
    
    this.tweens.add({
      targets: p,
      angle: 360,
      duration: 2000,
      repeat: -1
    });
  }
  
  collectPowerup(player, powerup) {
    powerup.destroy();
    
    if (powerup.powerType === 'bomb') {
      // Clear all enemies
      this.enemies.children.entries.forEach(e => {
        if (e.aiType !== 'boss') {
          this.hitEnemy({ destroy: () => {} }, e);
        }
      });
      this.cameras.main.flash(300, 255, 255, 255);
    } else if (powerup.powerType === 'shield') {
      this.shield = 3;
      this.powerupText.setText('🛡️ SHIELD ACTIVE').setVisible(true);
    } else {
      this.powerupActive = powerup.powerType;
      this.powerupTimer = 5000;
      const names = { rapid: '⚡ RAPID FIRE', slow: '⏰ SLOW TIME' };
      this.powerupText.setText(names[powerup.powerType]).setVisible(true);
    }
    
    this.playSound(1000, 0.3, 0.25);
  }
  
  waveComplete() {
    this.score += this.wave * 100;
    this.scoreText.setText('SCORE: ' + this.score);
    
    const bonus = this.add.text(400, 300, 'WAVE CLEARED!\n+' + (this.wave * 100), {
      fontSize: '36px',
      color: '#00ff88',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: bonus,
      y: 250,
      alpha: 0,
      duration: 2000,
      onComplete: () => bonus.destroy()
    });
    
    this.wave++;
    this.time.delayedCall(2500, () => this.startWave());
    this.playSound(880, 0.5, 0.25);
  }
  
  gameOver() {
    this.gameActive = false;
    this.physics.pause();
    
    // High score
    const hs = parseInt(localStorage.getItem('codeDefendersHS') || '0');
    const newHS = this.score > hs;
    if (newHS) localStorage.setItem('codeDefendersHS', this.score.toString());
    
    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
    
    this.add.text(400, 200, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5);
    
    this.add.text(400, 280, 'Final Score: ' + this.score, {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    this.add.text(400, 320, 'Wave Reached: ' + this.wave, {
      fontSize: '24px',
      color: '#00ff88'
    }).setOrigin(0.5);
    
    if (newHS) {
      this.add.text(400, 360, '🏆 NEW HIGH SCORE! 🏆', {
        fontSize: '28px',
        color: '#ffff00',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    } else {
      this.add.text(400, 360, 'High Score: ' + hs, {
        fontSize: '20px',
        color: '#888888'
      }).setOrigin(0.5);
    }
    
    this.add.text(400, 420, 'The AI has won... for now', {
      fontSize: '18px',
      color: '#666666',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    
    this.playSound(220, 1, 0.3);
    
    this.time.delayedCall(4000, () => {
      this.scene.start('Lobby');
    });
  }
  
  playSound(freq, dur, vol) {
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
  }
}

// ============ GAME INIT ============
cfg.scene = [LobbyScene, GameScene];
const game = new Phaser.Game(cfg);
