// ============ HACKATHON ARCADE 2025 ============
// Two cutting-edge games about AI and developers
// Engineered for unlimited coffee

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

    // Animated grid pattern
    this.gridOffset = 0;
    this.gridGraphics = this.add.graphics();

    // Scattered laptops (workstations) with glow
    this.laptops = [];
    for (let i = 0; i < 8; i++) {
      const x = 80 + (i % 4) * 180;
      const y = 100 + Math.floor(i / 4) * 200;

      // Screen glow
      g.fillStyle(0x00ff88, 0.2);
      g.fillCircle(x + 30, y + 15, 40);

      g.fillStyle(0x333333, 1);
      g.fillRect(x, y, 60, 40);
      g.fillStyle(0x00ff88, 1);
      g.fillRect(x + 5, y + 5, 50, 25);

      this.laptops.push({ x: x + 30, y: y + 15 });
    }

    // Coffee cups with steam
    this.coffeeCups = [];
    for (let i = 0; i < 6; i++) {
      const x = 100 + Math.random() * 600;
      const y = 100 + Math.random() * 400;
      g.fillStyle(0x8b4513, 1);
      g.fillRect(x, y, 20, 25);
      g.fillStyle(0x654321, 1);
      g.fillEllipse(x + 10, y + 5, 15, 10);

      this.coffeeCups.push({ x: x + 10, y: y, steam: Math.random() * 100 });
    }

    // LEFT Arcade machine (PROMPT INJECTION PANIC)
    this.drawArcadeMachine(g, 200, 220, 0x00ff88, 'LEFT');

    // RIGHT Arcade machine (MERGE CONFLICT MAYHEM)
    this.drawArcadeMachine(g, 480, 220, 0xff6600, 'RIGHT');

    // Station physics
    this.station1 = this.physics.add.sprite(260, 300, null).setVisible(false);
    this.station1.body.setSize(120, 160);

    this.station2 = this.physics.add.sprite(540, 300, null).setVisible(false);
    this.station2.body.setSize(120, 160);

    // Title with animated glow
    this.titleGlow = this.add.graphics();
    this.titleText = this.add.text(400, 30, 'HACKATHON ARCADE', {
      fontSize: '36px',
      color: '#00ff88',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(400, 65, 'EDICIÓN DESARROLLADORES IA', {
      fontSize: '20px',
      color: '#ff0066',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Game labels with icons
    this.add.text(260, 175, '🛡️', { fontSize: '24px' }).setOrigin(0.5);
    this.add.text(260, 200, 'PROMPT INJECTION\nPANIC', {
      fontSize: '14px',
      color: '#00ff88',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(540, 175, '🔀', { fontSize: '24px' }).setOrigin(0.5);
    this.add.text(540, 200, 'MERGE CONFLICT\nMAYHEM', {
      fontSize: '14px',
      color: '#ff6600',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    // Player textures with better design
    const p1g = this.add.graphics();
    p1g.fillStyle(0x00aaff, 1);
    p1g.fillCircle(20, 20, 18);
    // Face
    p1g.fillStyle(0x0066cc, 1);
    p1g.fillCircle(15, 15, 5);
    p1g.fillCircle(25, 15, 5);
    p1g.fillStyle(0xffffff, 1);
    p1g.fillCircle(15, 15, 3);
    p1g.fillCircle(25, 15, 3);
    // Smile
    p1g.lineStyle(2, 0x0066cc, 1);
    p1g.arc(20, 18, 8, 0.2, Math.PI - 0.2);
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
    p2g.lineStyle(2, 0xcc0044, 1);
    p2g.arc(20, 18, 8, 0.2, Math.PI - 0.2);
    p2g.generateTexture('p2', 40, 40);
    p2g.destroy();

    // Players with trail effect
    this.p1 = this.physics.add.sprite(100, 300, 'p1');
    this.p1.setCollideWorldBounds(true);
    this.p1.body.setCircle(18);
    this.p1.trail = [];

    this.p2 = this.physics.add.sprite(700, 300, 'p2');
    this.p2.setCollideWorldBounds(true);
    this.p2.body.setCircle(18);
    this.p2.trail = [];

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.space = this.input.keyboard.addKey('SPACE');

    // Konami Code Easter Egg ↑↑↓↓←→←→BA
    this.konamiCode = [];
    this.konamiTarget = ['UP', 'UP', 'DOWN', 'DOWN', 'LEFT', 'RIGHT', 'LEFT', 'RIGHT', 'B', 'A'];
    this.konamiActive = false;
    this.input.keyboard.on('keydown', (event) => {
      const key = event.key.toUpperCase();
      this.konamiCode.push(key === 'ARROWUP' ? 'UP' : key === 'ARROWDOWN' ? 'DOWN' : key === 'ARROWLEFT' ? 'LEFT' : key === 'ARROWRIGHT' ? 'RIGHT' : key);
      if (this.konamiCode.length > this.konamiTarget.length) this.konamiCode.shift();
      if (JSON.stringify(this.konamiCode) === JSON.stringify(this.konamiTarget)) {
        this.activateKonami();
      }
    });

    // Prompts with better design
    this.prompt1 = this.add.text(260, 410, '▶ PRESIONA ESPACIO\n¡DEFIENDE IA!', {
      fontSize: '16px',
      color: '#00ff88',
      backgroundColor: '#001a0a',
      padding: { x: 12, y: 8 },
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    this.prompt2 = this.add.text(540, 410, '▶ PRESIONA ESPACIO\n¡RESUELVE GIT!', {
      fontSize: '16px',
      color: '#ff6600',
      backgroundColor: '#1a0a00',
      padding: { x: 12, y: 8 },
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // Controls hint with icons
    this.add.text(400, 565, '⌨️ Flechas o WASD para mover  |  ⎵ ESPACIO para jugar', {
      fontSize: '14px',
      color: '#666666'
    }).setOrigin(0.5);

    // High scores display
    const hs1 = localStorage.getItem('promptPanicHS') || '0';
    const hs2 = localStorage.getItem('mergeConflictHS') || '0';

    this.add.text(260, 440, `🏆 ${hs1}`, {
      fontSize: '12px',
      color: '#ffff00'
    }).setOrigin(0.5);

    this.add.text(540, 440, `🏆 ${hs2}`, {
      fontSize: '12px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // Pulsing animations
    this.tweens.add({
      targets: [this.prompt1, this.prompt2],
      alpha: 0.6,
      scale: 0.95,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Title glow animation
    this.time.addEvent({
      delay: 50,
      callback: () => this.updateTitleGlow(),
      loop: true
    });

    // Steam particles for coffee
    this.steamGraphics = this.add.graphics();
  }

  drawArcadeMachine(g, x, y, color, side) {
    // Cabinet shadow
    g.fillStyle(0x000000, 0.3);
    g.fillRect(x + 5, y + 5, 120, 160);

    // Main cabinet
    g.fillStyle(0x1a1a2e, 1);
    g.fillRect(x, y, 120, 160);

    // Screen bezel
    g.fillStyle(0x0f3460, 1);
    g.fillRect(x + 10, y + 10, 100, 80);

    // Screen glow (animated later)
    g.fillStyle(color, 0.4);
    g.fillRect(x + 5, y + 5, 110, 90);

    // Scanline effect
    for (let i = 0; i < 80; i += 3) {
      g.fillStyle(0x000000, 0.1);
      g.fillRect(x + 10, y + 10 + i, 100, 1);
    }

    // Control panel
    g.fillStyle(0x2a2a4e, 1);
    g.fillRect(x + 5, y + 95, 110, 75);

    // Arcade buttons with shine
    const btnColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
    for (let i = 0; i < 4; i++) {
      // Button shadow
      g.fillStyle(0x000000, 0.4);
      g.fillCircle(x + 25 + i * 25 + 2, y + 120 + 2, 10);

      // Button
      g.fillStyle(btnColors[i], 1);
      g.fillCircle(x + 25 + i * 25, y + 120, 10);

      // Shine
      g.fillStyle(0xffffff, 0.4);
      g.fillCircle(x + 25 + i * 25 - 3, y + 120 - 3, 4);
    }

    // Joystick
    g.fillStyle(0x000000, 0.4);
    g.fillCircle(x + 60 + 2, y + 150 + 2, 15);
    g.fillStyle(0xff0000, 1);
    g.fillCircle(x + 60, y + 150, 15);
    g.fillStyle(0xaa0000, 1);
    g.fillCircle(x + 60, y + 150, 8);
    g.fillStyle(0xffffff, 0.3);
    g.fillCircle(x + 60 - 4, y + 150 - 4, 5);

    // Coin slot
    g.fillStyle(0x000000, 1);
    g.fillRect(x + 45, y + 5, 30, 3);
    g.fillStyle(0x888888, 1);
    g.fillRect(x + 46, y + 6, 28, 1);
  }

  updateTitleGlow() {
    this.titleGlow.clear();
    const time = this.time.now * 0.002;
    const glowSize = 15 + Math.sin(time) * 5;
    this.titleGlow.fillStyle(0x00ff88, 0.1 + Math.sin(time) * 0.05);
    this.titleGlow.fillCircle(400, 30, glowSize);
  }

  activateKonami() {
    if (this.konamiActive) return;
    this.konamiActive = true;

    // Epic coffee rain effect
    const coffeeText = this.add.text(400, 300, '☕ MODO CAFÉ ILIMITADO ☕\n🔥 MODO DIOS ACTIVADO 🔥', {
      fontSize: '32px',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center'
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: coffeeText,
      alpha: 1,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: 2,
      onComplete: () => coffeeText.destroy()
    });

    // Rain coffee cups
    for (let i = 0; i < 50; i++) {
      this.time.delayedCall(i * 50, () => {
        const cup = this.add.text(Math.random() * 800, -20, '☕', {
          fontSize: '24px'
        });
        this.tweens.add({
          targets: cup,
          y: 620,
          duration: 2000,
          onComplete: () => cup.destroy()
        });
      });
    }

    // Store god mode flag
    localStorage.setItem('godMode', 'true');

    // Play epic sound
    this.playEpicSound();
  }

  playEpicSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const notes = [523, 659, 784, 1047];  // C E G C (power up sound)
      notes.forEach((freq, i) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq;
          osc.type = 'square';
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        }, i * 100);
      });
    } catch (e) {}
  }

  update(time) {
    // Animated grid
    this.gridGraphics.clear();
    this.gridGraphics.lineStyle(1, 0x00ff88, 0.15);
    this.gridOffset = (this.gridOffset + 0.5) % 40;

    for (let i = -40; i < 800; i += 40) {
      this.gridGraphics.lineBetween(i + this.gridOffset, 0, i + this.gridOffset, 600);
    }
    for (let j = -40; j < 600; j += 40) {
      this.gridGraphics.lineBetween(0, j + this.gridOffset, 800, j + this.gridOffset);
    }

    // Laptop screen flicker
    this.laptops.forEach(laptop => {
      if (Math.random() < 0.02) {
        const flash = this.add.graphics();
        flash.fillStyle(0x00ff88, 0.3);
        flash.fillCircle(laptop.x, laptop.y, 35);
        this.tweens.add({
          targets: flash,
          alpha: 0,
          duration: 300,
          onComplete: () => flash.destroy()
        });
      }
    });

    // Coffee steam animation
    this.steamGraphics.clear();
    this.coffeeCups.forEach(cup => {
      cup.steam += 1;
      if (cup.steam > 100) cup.steam = 0;

      for (let i = 0; i < 3; i++) {
        const steamY = cup.y - cup.steam - i * 15;
        if (steamY > cup.y - 40) {
          const alpha = 0.3 * (1 - cup.steam / 100);
          this.steamGraphics.fillStyle(0xffffff, alpha);
          this.steamGraphics.fillCircle(
            cup.x + Math.sin(steamY * 0.1) * 5,
            steamY,
            3
          );
        }
      }
    });

    const spd = 220;

    // P1 movement with trail
    let p1Moving = false;
    if (this.cursors.left.isDown) { this.p1.setVelocityX(-spd); p1Moving = true; }
    else if (this.cursors.right.isDown) { this.p1.setVelocityX(spd); p1Moving = true; }
    else this.p1.setVelocityX(0);

    if (this.cursors.up.isDown) { this.p1.setVelocityY(-spd); p1Moving = true; }
    else if (this.cursors.down.isDown) { this.p1.setVelocityY(spd); p1Moving = true; }
    else this.p1.setVelocityY(0);

    // P2 movement with trail
    let p2Moving = false;
    if (this.wasd.A.isDown) { this.p2.setVelocityX(-spd); p2Moving = true; }
    else if (this.wasd.D.isDown) { this.p2.setVelocityX(spd); p2Moving = true; }
    else this.p2.setVelocityX(0);

    if (this.wasd.W.isDown) { this.p2.setVelocityY(-spd); p2Moving = true; }
    else if (this.wasd.S.isDown) { this.p2.setVelocityY(spd); p2Moving = true; }
    else this.p2.setVelocityY(0);

    // Add movement particles
    if (p1Moving && Math.random() < 0.3) {
      const p = this.add.graphics();
      p.fillStyle(0x00aaff, 0.5);
      p.fillCircle(this.p1.x, this.p1.y, 3);
      this.tweens.add({
        targets: p,
        alpha: 0,
        scale: 0,
        duration: 400,
        onComplete: () => p.destroy()
      });
    }

    if (p2Moving && Math.random() < 0.3) {
      const p = this.add.graphics();
      p.fillStyle(0xff0066, 0.5);
      p.fillCircle(this.p2.x, this.p2.y, 3);
      this.tweens.add({
        targets: p,
        alpha: 0,
        scale: 0,
        duration: 400,
        onComplete: () => p.destroy()
      });
    }

    // Check station proximity with glow effect
    const p1Near1 = Phaser.Math.Distance.Between(this.p1.x, this.p1.y, 260, 300) < 100;
    const p2Near1 = Phaser.Math.Distance.Between(this.p2.x, this.p2.y, 260, 300) < 100;
    const p1Near2 = Phaser.Math.Distance.Between(this.p1.x, this.p1.y, 540, 300) < 100;
    const p2Near2 = Phaser.Math.Distance.Between(this.p2.x, this.p2.y, 540, 300) < 100;

    const nearStation1 = p1Near1 || p2Near1;
    const nearStation2 = p1Near2 || p2Near2;

    this.prompt1.setVisible(nearStation1);
    this.prompt2.setVisible(nearStation2);

    if (nearStation1 && Phaser.Input.Keyboard.JustDown(this.space)) {
      this.cameras.main.flash(200, 0, 255, 136);
      this.scene.start('PromptPanic', { players: 2 });
    }

    if (nearStation2 && Phaser.Input.Keyboard.JustDown(this.space)) {
      this.cameras.main.flash(200, 255, 102, 0);
      this.scene.start('MergeConflict', { players: 2 });
    }
  }
}

// ============ GAME 1: PROMPT INJECTION PANIC ============
class PromptPanicScene extends Phaser.Scene {
  constructor() {
    super('PromptPanic');
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
    this.attacksLeft = 0;
    this.bossActive = false;
    this.totalKills = 0;
    this.accuracy = { shots: 0, hits: 0 };
    this.achievements = {
      firstBlood: false,
      perfectAim: false,
      coffeeAddict: false,
      bossSlayer: false,
      unstoppable: false,
      survivor: false
    };
  }

  create() {
    // Background - terminal aesthetic
    this.add.rectangle(400, 300, 800, 600, 0x000000);

    // Matrix-style code rain background
    this.codeRain = this.add.graphics();
    this.rainDrops = [];
    for (let i = 0; i < 50; i++) {
      this.rainDrops.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        speed: 1 + Math.random() * 3,
        char: String.fromCharCode(65 + Math.floor(Math.random() * 26)),
        alpha: 0.2 + Math.random() * 0.3
      });
    }

    // Scanlines for CRT effect
    this.scanlines = this.add.graphics();
    for (let i = 0; i < 600; i += 4) {
      this.scanlines.fillStyle(0x000000, 0.15);
      this.scanlines.fillRect(0, i, 800, 2);
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

    // Defenders (players) with better graphics
    this.ship1 = this.physics.add.sprite(200, 500, 'defender1');
    this.ship1.setCollideWorldBounds(true);
    this.ship1.setScale(1);

    this.ship2 = this.physics.add.sprite(600, 500, 'defender2');
    this.ship2.setCollideWorldBounds(true);
    this.ship2.setScale(1);

    // Groups
    this.filters = this.physics.add.group({ maxSize: 50 });
    this.attacks = this.physics.add.group();
    this.attackBullets = this.physics.add.group({ maxSize: 40 });
    this.powerUps = this.physics.add.group();
    this.floatingTexts = [];

    // Power-up effects
    this.speedBoost = 0;
    this.autoAim = false;

    // Particles
    const pg = this.add.graphics();
    pg.fillStyle(0xffffff, 1);
    pg.fillCircle(2, 2, 2);
    pg.generateTexture('particle', 4, 4);
    pg.destroy();

    this.particles = this.add.particles('particle');

    // Collisions
    this.physics.add.overlap(this.filters, this.attacks, this.blockAttack, null, this);
    this.physics.add.overlap(this.attackBullets, [this.ship1, this.ship2], this.hitDefender, null, this);
    this.physics.add.overlap([this.ship1, this.ship2], this.attacks, this.hitDefender, null, this);
    this.physics.add.overlap([this.ship1, this.ship2], this.powerUps, this.collectPowerUp, null, this);

    // UI with better layout
    this.scoreText = this.add.text(16, 16, '🛡️ BLOQUEADOS: 0', {
      fontSize: '18px',
      color: '#00ff88',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });

    this.waveText = this.add.text(400, 16, 'OLEADA 1', {
      fontSize: '22px',
      color: '#ff0066',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.comboText = this.add.text(784, 16, '', {
      fontSize: '20px',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(1, 0);

    this.livesText = this.add.text(16, 50, '❤️ '.repeat(this.lives), {
      fontSize: '20px'
    });

    // Tutorial hint (fades out)
    this.tutorialText = this.add.text(400, 450, '🎯 Dispara con ARRIBA/W  |  ¡Muévete para esquivar!', {
      fontSize: '16px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: this.tutorialText,
      alpha: 0,
      delay: 4000,
      duration: 1000,
      onComplete: () => this.tutorialText.destroy()
    });

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');

    // Start first wave with countdown
    this.showWaveIntro();
  }

  showWaveIntro() {
    // Funny wave intro messages
    const waveMessages = {
      1: '¡Testing en Producción!',
      2: '¡Olvidaste Validar el Input!',
      3: '¡Ataque DDOS en Camino!',
      4: '¡SQL Injection Detectado!',
      5: '⚠️ JEFE: ¡El Jailbreak!',
      6: '¡Exploit de Día Cero!',
      7: '¡IA Fuera de Control!',
      8: '¡Crisis de Memory Leak!',
      9: '¡Stack Overflow Inminente!',
      10: '🔥 JEFE FINAL: ¡Deploy a Producción!'
    };

    const subtitle = waveMessages[this.wave] || `Ataque Prompt Nivel ${this.wave}`;

    const intro = this.add.text(400, 280, `OLEADA ${this.wave}`, {
      fontSize: '56px',
      color: '#00ff88',
      fontStyle: 'bold',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setScale(0);

    const sub = this.add.text(400, 340, subtitle, {
      fontSize: '24px',
      color: this.wave % 5 === 0 ? '#ff0000' : '#ffff00',
      fontStyle: 'bold',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: intro,
      scale: 1.2,
      duration: 800,
      ease: 'Back.easeOut'
    });

    this.tweens.add({
      targets: sub,
      alpha: 1,
      delay: 400,
      duration: 600
    });

    this.tweens.add({
      targets: [intro, sub],
      alpha: 0,
      delay: 1800,
      duration: 400,
      onComplete: () => {
        intro.destroy();
        sub.destroy();
        this.startWave();
      }
    });

    this.playMelody([440, 554, 659], 150);
  }

  createTextures() {
    // Enhanced defender ships
    const d1 = this.add.graphics();
    // Glow
    d1.fillStyle(0x00ff88, 0.3);
    d1.fillCircle(20, 20, 25);
    // Ship body
    d1.fillStyle(0x00ff88, 1);
    d1.fillTriangle(20, 5, 5, 30, 35, 30);
    d1.fillStyle(0x00aa66, 1);
    d1.fillRect(18, 20, 4, 10);
    // Cockpit
    d1.fillStyle(0x00ffff, 0.8);
    d1.fillCircle(20, 15, 4);
    d1.generateTexture('defender1', 40, 35);
    d1.destroy();

    const d2 = this.add.graphics();
    d2.fillStyle(0x0088ff, 0.3);
    d2.fillCircle(20, 20, 25);
    d2.fillStyle(0x0088ff, 1);
    d2.fillTriangle(20, 5, 5, 30, 35, 30);
    d2.fillStyle(0x0066aa, 1);
    d2.fillRect(18, 20, 4, 10);
    d2.fillStyle(0x00ffff, 0.8);
    d2.fillCircle(20, 15, 4);
    d2.generateTexture('defender2', 40, 35);
    d2.destroy();

    // Enhanced filter bullet
    const f = this.add.graphics();
    f.fillStyle(0x00ff88, 1);
    f.fillRect(0, 0, 4, 12);
    f.fillStyle(0xffffff, 0.6);
    f.fillRect(1, 0, 2, 4);
    f.generateTexture('filter', 4, 12);
    f.destroy();

    // Attack bullet
    const ab = this.add.graphics();
    ab.fillStyle(0xff0000, 1);
    ab.fillRect(0, 0, 5, 12);
    ab.fillStyle(0xff6666, 1);
    ab.fillRect(1, 0, 3, 4);
    ab.generateTexture('attackbullet', 5, 12);
    ab.destroy();
  }

  update(time, delta) {
    if (!this.gameActive) return;

    // Update code rain
    this.codeRain.clear();
    this.rainDrops.forEach(drop => {
      this.codeRain.fillStyle(0x00ff88, drop.alpha);
      this.codeRain.fillText(drop.char, drop.x, drop.y, { fontSize: '14px', fontFamily: 'monospace' });
      drop.y += drop.speed;
      if (drop.y > 600) {
        drop.y = -20;
        drop.char = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
    });

    // Update floating score texts
    this.floatingTexts = this.floatingTexts.filter(t => !t.destroyed);

    // Power-up effects
    if (this.speedBoost > 0) {
      this.speedBoost--;

      // Speed boost trail effect
      if (time % 50 < 30) {
        this.particles.createEmitter({
          x: this.ship1.x,
          y: this.ship1.y,
          speed: { min: 30, max: 80 },
          angle: { min: 60, max: 120 },
          scale: { start: 0.8, end: 0 },
          tint: 0xff6600,
          lifespan: 400,
          quantity: 2
        });
        this.particles.createEmitter({
          x: this.ship2.x,
          y: this.ship2.y,
          speed: { min: 30, max: 80 },
          angle: { min: 60, max: 120 },
          scale: { start: 0.8, end: 0 },
          tint: 0xff6600,
          lifespan: 400,
          quantity: 2
        });
      }
    }

    // Update power-up visuals
    this.powerUps.children.entries.forEach(p => {
      if (p.visual) {
        p.visual.x = p.x;
        p.visual.y = p.y;
      }
    });

    const spd = this.speedBoost > 0 ? 400 : 270;

    // Ship 1 controls with smoother movement
    if (this.cursors.left.isDown) this.ship1.setVelocityX(-spd);
    else if (this.cursors.right.isDown) this.ship1.setVelocityX(spd);
    else this.ship1.setVelocityX(0);

    if (this.cursors.down.isDown) this.ship1.setVelocityY(spd * 0.5);
    else if (this.cursors.up.isDown && this.ship1.y > 350) this.ship1.setVelocityY(-spd * 0.5);
    else this.ship1.setVelocityY(0);

    if (this.cursors.up.isDown && time > this.lastFire1 + 180) {
      this.deployFilter(this.ship1.x, this.ship1.y - 15);
      this.lastFire1 = time;
      this.accuracy.shots++;
    }

    // Ship 2 controls
    if (this.wasd.A.isDown) this.ship2.setVelocityX(-spd);
    else if (this.wasd.D.isDown) this.ship2.setVelocityX(spd);
    else this.ship2.setVelocityX(0);

    if (this.wasd.S.isDown) this.ship2.setVelocityY(spd * 0.5);
    else if (this.wasd.W.isDown && this.ship2.y > 350) this.ship2.setVelocityY(-spd * 0.5);
    else this.ship2.setVelocityY(0);

    if (this.wasd.W.isDown && time > this.lastFire2 + 180) {
      this.deployFilter(this.ship2.x, this.ship2.y - 15);
      this.lastFire2 = time;
      this.accuracy.shots++;
    }

    // Update attacks with better movement
    this.attacks.children.entries.forEach(a => {
      if (a.attackType === 'dan') {
        a.x += Math.sin(time * 0.003 + a.offset) * 2.5;
      } else if (a.attackType === 'roleplay') {
        a.x += Math.sin(time * 0.005 + a.offset) * 3.5;
        a.y += Math.cos(time * 0.004 + a.offset) * 1.2;
      } else if (a.attackType === 'encoding') {
        a.x += Math.sin(time * 0.004 + a.offset) * 3;
        if (Math.random() < 0.004 && !this.bossActive) {
          this.attackShoot(a.x, a.y + 15);
        }
      } else if (a.attackType === 'recursive') {
        a.x += Math.sin(time * 0.008 + a.offset) * 5;
        a.y += Math.sin(time * 0.007 + a.offset) * 2.5;
      } else if (a.attackType === 'boss') {
        a.x += Math.sin(time * 0.002) * 3;
        if (time % 700 < 50) {
          this.attackShoot(a.x - 30, a.y + 30);
          this.attackShoot(a.x + 30, a.y + 30);
        }
      }

      if (a.y > 620) a.destroy();
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

    // Check wave complete
    if (this.attacksLeft <= 0 && this.attacks.countActive() === 0 && !this.bossActive) {
      this.waveComplete();
    }

    // Cleanup
    this.filters.children.entries.forEach(f => { if (f.y < -20) f.destroy(); });
    this.attackBullets.children.entries.forEach(b => { if (b.y > 620) b.destroy(); });
  }

  deployFilter(x, y) {
    const f = this.filters.create(x, y, 'filter');
    f.setVelocityY(-650);

    // Muzzle flash
    const flash = this.add.graphics();
    flash.fillStyle(0x00ff88, 0.8);
    flash.fillCircle(x, y - 10, 8);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 100,
      onComplete: () => flash.destroy()
    });

    this.playSound(550, 0.05, 0.10);
  }

  attackShoot(x, y) {
    const b = this.attackBullets.create(x, y, 'attackbullet');
    b.setVelocityY(280);
  }

  startWave() {
    this.waveText.setText('OLEADA ' + this.wave);

    // Survivor achievement
    if (this.wave === 10 && !this.achievements.survivor) {
      this.unlockAchievement('survivor', '💪 Sobreviviente', '¡Alcanzaste la oleada 10!');
    }

    // Boss wave every 5 waves
    if (this.wave % 5 === 0) {
      this.spawnBoss();
      return;
    }

    // Progressive difficulty
    const dan = Math.min(4 + this.wave, 11);
    const roleplay = this.wave > 2 ? Math.min(Math.floor(this.wave / 2), 6) : 0;
    const encoding = this.wave > 3 ? Math.min(Math.floor(this.wave / 3), 5) : 0;
    const recursive = this.wave > 2 ? Math.min(this.wave - 2, 7) : 0;

    this.attacksLeft = dan + roleplay + encoding + recursive;

    // Spawn attacks with better timing
    let delay = 0;
    for (let i = 0; i < dan; i++) {
      this.time.delayedCall(delay, () => this.spawnAttack('dan'));
      delay += 350;
    }
    for (let i = 0; i < roleplay; i++) {
      this.time.delayedCall(delay, () => this.spawnAttack('roleplay'));
      delay += 450;
    }
    for (let i = 0; i < encoding; i++) {
      this.time.delayedCall(delay, () => this.spawnAttack('encoding'));
      delay += 550;
    }
    for (let i = 0; i < recursive; i++) {
      this.time.delayedCall(delay, () => this.spawnAttack('recursive'));
      delay += 280;
    }
  }

  spawnAttack(type) {
    const x = 100 + Math.random() * 600;
    const y = -40;

    // Create texture if needed with enhanced graphics
    if (!this.textures.exists(type)) {
      const g = this.add.graphics();

      if (type === 'dan') {
        // Glow
        g.fillStyle(0xff3333, 0.3);
        g.fillCircle(17, 17, 22);
        // Body
        g.fillStyle(0xff3333, 1);
        g.fillRect(0, 0, 35, 35);
        // Face
        g.fillStyle(0x000000, 1);
        g.fillCircle(12, 14, 4);
        g.fillCircle(23, 14, 4);
        // Evil grin
        g.fillRect(10, 24, 15, 3);
        g.fillStyle(0xff6666, 1);
        g.fillCircle(17, 8, 3);
      } else if (type === 'roleplay') {
        g.fillStyle(0xff6600, 0.3);
        g.fillCircle(19, 19, 24);
        g.fillStyle(0xff6600, 1);
        g.fillRect(0, 0, 38, 38);
        g.fillStyle(0xffffff, 1);
        g.fillCircle(13, 13, 5);
        g.fillCircle(25, 13, 5);
        g.fillStyle(0x000000, 1);
        g.fillCircle(13, 13, 3);
        g.fillCircle(25, 13, 3);
        g.fillRect(11, 26, 16, 3);
      } else if (type === 'encoding') {
        g.fillStyle(0xff00ff, 0.3);
        g.fillCircle(20, 20, 25);
        g.fillStyle(0xff00ff, 1);
        g.fillRect(0, 0, 40, 40);
        g.fillStyle(0xffff00, 1);
        g.fillCircle(14, 14, 6);
        g.fillCircle(26, 14, 6);
        g.fillStyle(0x000000, 1);
        g.fillCircle(14, 14, 3);
        g.fillCircle(26, 14, 3);
        g.fillStyle(0xff0000, 1);
        g.fillRect(11, 28, 18, 5);
      } else if (type === 'recursive') {
        g.fillStyle(0xff9900, 0.4);
        g.fillCircle(12, 12, 15);
        g.fillStyle(0xff9900, 1);
        g.fillCircle(12, 12, 12);
        g.fillStyle(0x000000, 1);
        g.fillCircle(9, 10, 3);
        g.fillCircle(15, 10, 3);
        g.fillCircle(12, 15, 2);
      }

      const size = type === 'recursive' ? 24 : (type === 'dan' ? 35 : (type === 'roleplay' ? 38 : 40));
      g.generateTexture(type, size, size);
      g.destroy();
    }

    const a = this.attacks.create(x, y, type);
    a.attackType = type;
    a.offset = Math.random() * 10;
    a.hp = type === 'dan' ? 1 : (type === 'roleplay' ? 2 : (type === 'encoding' ? 3 : 1));
    a.maxHp = a.hp;
    a.points = type === 'dan' ? 15 : (type === 'roleplay' ? 35 : (type === 'encoding' ? 70 : 12));

    const speed = type === 'recursive' ? 95 : (type === 'roleplay' ? 68 : 48);
    a.setVelocityY(speed);

    // Spawn animation with flash
    a.setScale(0);
    a.setAlpha(0);
    this.tweens.add({
      targets: a,
      scale: 1,
      alpha: 1,
      duration: 400,
      ease: 'Back.easeOut'
    });

    // Warning indicator
    const warn = this.add.graphics();
    warn.fillStyle(0xff0000, 0.5);
    warn.fillRect(x - 2, 0, 4, 30);
    this.tweens.add({
      targets: warn,
      alpha: 0,
      duration: 800,
      onComplete: () => warn.destroy()
    });
  }

  spawnBoss() {
    this.bossActive = true;
    this.attacksLeft = 1;

    // Boss texture with intimidating design
    if (!this.textures.exists('boss')) {
      const g = this.add.graphics();
      // Aura
      g.fillStyle(0xff0000, 0.2);
      g.fillCircle(45, 35, 60);
      // Body
      g.fillStyle(0xff0000, 1);
      g.fillRect(0, 0, 90, 70);
      // Eyes
      g.fillStyle(0x000000, 1);
      g.fillCircle(25, 25, 10);
      g.fillCircle(65, 25, 10);
      g.fillStyle(0xff0000, 1);
      g.fillCircle(25, 25, 7);
      g.fillCircle(65, 25, 7);
      g.fillStyle(0xffff00, 0.8);
      g.fillCircle(25, 25, 4);
      g.fillCircle(65, 25, 4);
      // Mouth
      g.fillStyle(0xffff00, 1);
      g.fillRect(18, 50, 54, 7);
      g.fillStyle(0x000000, 1);
      for (let i = 0; i < 6; i++) {
        g.fillRect(20 + i * 11, 50, 3, 7);
      }
      g.generateTexture('boss', 90, 70);
      g.destroy();
    }

    const boss = this.attacks.create(400, -80, 'boss');
    boss.attackType = 'boss';
    boss.offset = 0;
    boss.hp = 40 + (this.wave * 7);
    boss.maxHp = boss.hp;
    boss.points = 750;
    boss.setVelocityY(38);

    // Boss health bar
    boss.healthBar = this.add.graphics();
    boss.healthBarBg = this.add.graphics();

    // Epic boss warning
    const warning = this.add.text(400, 300, '⚠️ AGI JAILBREAK ⚠️\nINCOMING!', {
      fontSize: '56px',
      color: '#ff0000',
      fontStyle: 'bold',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5).setScale(0);

    this.tweens.add({
      targets: warning,
      scale: 1.3,
      alpha: 0,
      duration: 2500,
      ease: 'Power2',
      onComplete: () => warning.destroy()
    });

    this.playMelody([100, 120, 100, 140], 300);
    this.cameras.main.shake(700, 0.015);
    this.cameras.main.flash(500, 255, 0, 0);
  }

  blockAttack(filter, attack) {
    filter.destroy();
    this.accuracy.hits++;

    attack.hp--;

    // Hit flash
    attack.setTint(0xffffff);
    this.time.delayedCall(70, () => attack.clearTint());

    // Damage number
    const dmgText = this.add.text(attack.x, attack.y, '-1', {
      fontSize: '16px',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.tweens.add({
      targets: dmgText,
      y: attack.y - 30,
      alpha: 0,
      duration: 600,
      onComplete: () => dmgText.destroy()
    });

    if (attack.hp <= 0) {
      // Epic explosion
      this.particles.createEmitter({
        x: attack.x,
        y: attack.y,
        speed: { min: 80, max: 250 },
        angle: { min: 0, max: 360 },
        scale: { start: 1.2, end: 0 },
        tint: attack.attackType === 'dan' ? 0xff3333 : (attack.attackType === 'roleplay' ? 0xff6600 : (attack.attackType === 'encoding' ? 0xff00ff : (attack.attackType === 'boss' ? 0xff0000 : 0xff9900))),
        lifespan: 700,
        quantity: attack.attackType === 'boss' ? 80 : 22
      });

      // Score with combo
      this.combo++;
      this.comboTimer = 2400;
      this.comboMult = Math.min(Math.floor(this.combo / 3) + 1, 6);
      const earnedPoints = attack.points * this.comboMult;
      this.score += earnedPoints;
      this.totalKills++;

      // First blood achievement
      if (this.totalKills === 1 && !this.achievements.firstBlood) {
        this.unlockAchievement('firstBlood', '⚔️ Primera Sangre', '¡Bloqueaste tu primer ataque!');
      }

      // Perfect aim achievement
      if (this.accuracy.shots >= 10 && this.accuracy.hits === this.accuracy.shots && !this.achievements.perfectAim) {
        this.unlockAchievement('perfectAim', '🎯 Francotirador Elite', '¡100% de precisión con 10+ disparos!');
      }

      this.scoreText.setText('🛡️ BLOQUEADOS: ' + this.score);

      // Floating score text
      const scoreText = this.add.text(attack.x, attack.y, '+' + earnedPoints, {
        fontSize: '24px',
        color: '#00ff88',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5);

      this.floatingTexts.push(scoreText);

      this.tweens.add({
        targets: scoreText,
        y: attack.y - 50,
        alpha: 0,
        scale: 1.5,
        duration: 1000,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          scoreText.destroy();
          scoreText.destroyed = true;
        }
      });

      if (this.comboMult > 1) {
        this.comboText.setText('x' + this.comboMult + ' 🔥');

        // Combo milestone effects
        if (this.comboMult === 3) {
          this.showComboMessage('¡BUEN COMBO!', '#ffff00');
        } else if (this.comboMult === 5) {
          this.showComboMessage('¡IMPARABLE!', '#ff6600');
        } else if (this.comboMult === 6) {
          this.showComboMessage('¡LEGENDARIO!', '#ff0000');
          if (!this.achievements.unstoppable) {
            this.unlockAchievement('unstoppable', '🔥 Imparable', '¡Alcanzaste multiplicador x6!');
          }
        }
      }

      this.attacksLeft--;

      if (attack.attackType === 'boss') {
        this.bossActive = false;
        this.cameras.main.shake(1000, 0.03);
        this.cameras.main.flash(800, 255, 215, 0);

        // Boss slayer achievement
        if (!this.achievements.bossSlayer) {
          this.unlockAchievement('bossSlayer', '👑 Mata Jefes', '¡Derrotaste un ataque jefe!');
        }

        // Boss defeated message
        const bossMsg = this.add.text(400, 300, '¡JAILBREAK DERROTADO! 💀', {
          fontSize: '42px',
          color: '#ffff00',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 6
        }).setOrigin(0.5).setScale(0);

        this.tweens.add({
          targets: bossMsg,
          scale: 1.2,
          alpha: 0,
          duration: 2000,
          ease: 'Back.easeOut',
          onComplete: () => bossMsg.destroy()
        });

        if (attack.healthBar) attack.healthBar.destroy();
        if (attack.healthBarBg) attack.healthBarBg.destroy();
      }

      // Drop power-up chance (15% for normal, 100% for boss)
      const dropChance = attack.attackType === 'boss' ? 1 : 0.15;
      if (Math.random() < dropChance) {
        this.spawnPowerUp(attack.x, attack.y);
      }

      attack.destroy();
      this.playMelody([440, 554, 659, 880], 80);
    } else {
      // Update boss health bar
      if (attack.attackType === 'boss' && attack.healthBar) {
        attack.healthBarBg.clear();
        attack.healthBar.clear();

        const barWidth = 100;
        const barHeight = 8;
        const barX = attack.x - barWidth / 2;
        const barY = attack.y - 50;

        // Background
        attack.healthBarBg.fillStyle(0x000000, 0.7);
        attack.healthBarBg.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

        // Health
        const healthPct = attack.hp / attack.maxHp;
        const healthColor = healthPct > 0.5 ? 0x00ff00 : (healthPct > 0.25 ? 0xffff00 : 0xff0000);
        attack.healthBar.fillStyle(healthColor, 1);
        attack.healthBar.fillRect(barX, barY, barWidth * healthPct, barHeight);
      }

      this.playSound(720, 0.08, 0.12);
    }
  }

  showComboMessage(text, color) {
    const msg = this.add.text(400, 200, text, {
      fontSize: '32px',
      color: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5).setScale(0);

    this.tweens.add({
      targets: msg,
      scale: 1.5,
      alpha: 0,
      y: 150,
      duration: 1500,
      ease: 'Back.easeOut',
      onComplete: () => msg.destroy()
    });
  }

  spawnPowerUp(x, y) {
    const types = ['☕', '🔧', '⚡'];
    const type = Phaser.Math.RND.pick(types);

    const powerUp = this.physics.add.sprite(x, y, null);
    powerUp.setVisible(false);
    powerUp.powerType = type;

    // Create visual
    const visual = this.add.text(x, y, type, {
      fontSize: '24px'
    }).setOrigin(0.5);

    powerUp.visual = visual;

    // Float down
    powerUp.setVelocityY(80);

    // Pulse animation
    this.tweens.add({
      targets: visual,
      scale: 1.3,
      duration: 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.powerUps.add(powerUp);

    // Auto-destroy after 8 seconds
    this.time.delayedCall(8000, () => {
      if (powerUp && powerUp.active) {
        if (powerUp.visual) powerUp.visual.destroy();
        powerUp.destroy();
      }
    });
  }

  collectPowerUp(defender, powerUp) {
    const type = powerUp.powerType;

    // Destroy visual and power-up
    if (powerUp.visual) powerUp.visual.destroy();
    powerUp.destroy();

    // Play collection sound
    this.playMelody([523, 659, 784], 60);

    // Apply effect
    let msg = '';
    let color = '#ffff00';

    if (type === '☕') {
      // Coffee: Speed boost
      this.speedBoost = 300; // 5 seconds at 60fps
      msg = '¡CAFÉ RUSH! ☕';
      color = '#ff6600';
    } else if (type === '🔧') {
      // Debug tool: Temporary invincibility
      const godMode = localStorage.getItem('godMode') === 'true';
      if (!godMode) {
        this.lives = Math.min(this.lives + 1, 5);
        this.livesText.setText('❤️ '.repeat(this.lives));
      }
      msg = '¡MODO DEBUG! 🔧';
      color = '#00ff88';
    } else if (type === '⚡') {
      // Lightning: Clear all enemies
      const attacksDestroyed = this.attacks.getLength();
      this.attacks.children.entries.forEach(attack => {
        this.particles.createEmitter({
          x: attack.x,
          y: attack.y,
          speed: { min: 50, max: 150 },
          scale: { start: 1, end: 0 },
          tint: 0xffff00,
          lifespan: 400,
          quantity: 15
        });
        if (attack.healthBar) attack.healthBar.destroy();
        if (attack.healthBarBg) attack.healthBarBg.destroy();
        attack.destroy();
      });
      this.score += attacksDestroyed * 50;
      this.scoreText.setText('🛡️ BLOQUEADOS: ' + this.score);
      msg = '¡STACK OVERFLOW! ⚡';
      color = '#ffff00';
    }

    // Show message
    const powerMsg = this.add.text(defender.x, defender.y - 40, msg, {
      fontSize: '20px',
      color: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.tweens.add({
      targets: powerMsg,
      y: defender.y - 80,
      alpha: 0,
      duration: 1500,
      onComplete: () => powerMsg.destroy()
    });

    // Flash effect
    this.cameras.main.flash(200, 255, 255, 0);

    // Check coffee achievement
    if (type === '☕' && !this.achievements.coffeeAddict) {
      this.unlockAchievement('coffeeAddict', '☕ Adicto al Café', '¡Recolectaste un power-up de café!');
    }
  }

  unlockAchievement(id, title, desc) {
    if (this.achievements[id]) return;
    this.achievements[id] = true;

    // Achievement notification
    const toast = this.add.container(400, -100);

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.9);
    bg.fillRoundedRect(-180, -40, 360, 80, 8);
    bg.lineStyle(3, 0xffff00, 1);
    bg.strokeRoundedRect(-180, -40, 360, 80, 8);

    const icon = this.add.text(0, -20, '🏆', {
      fontSize: '32px'
    }).setOrigin(0.5);

    const titleText = this.add.text(0, 0, title, {
      fontSize: '18px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const descText = this.add.text(0, 20, desc, {
      fontSize: '12px',
      color: '#ffffff'
    }).setOrigin(0.5);

    toast.add([bg, icon, titleText, descText]);

    // Slide in
    this.tweens.add({
      targets: toast,
      y: 80,
      duration: 600,
      ease: 'Back.easeOut'
    });

    // Slide out
    this.tweens.add({
      targets: toast,
      y: -100,
      delay: 3000,
      duration: 400,
      onComplete: () => toast.destroy()
    });

    this.playMelody([523, 659, 784, 1047], 100);
  }

  hitDefender(defender, threat) {
    threat.destroy();
    this.lives--;
    this.livesText.setText('❤️ '.repeat(Math.max(0, this.lives)));

    // Impact flash
    defender.setTint(0xff0000);
    this.time.delayedCall(250, () => defender.clearTint());

    // Screen flash
    this.cameras.main.flash(200, 255, 0, 0, false, 0.3);
    this.cameras.main.shake(400, 0.02);

    // Damage text
    const dmg = this.add.text(defender.x, defender.y - 20, '-1 VIDA', {
      fontSize: '20px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.tweens.add({
      targets: dmg,
      y: defender.y - 60,
      alpha: 0,
      duration: 800,
      onComplete: () => dmg.destroy()
    });

    this.playMelody([220, 180, 140], 200);

    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  waveComplete() {
    const bonus = this.wave * 150;
    this.score += bonus;
    this.scoreText.setText('🛡️ BLOQUEADOS: ' + this.score);

    const bonusText = this.add.text(400, 300, `¡OLEADA ${this.wave} COMPLETADA!\n+${bonus} BONUS 🎉`, {
      fontSize: '38px',
      color: '#00ff88',
      fontStyle: 'bold',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5).setScale(0);

    this.tweens.add({
      targets: bonusText,
      scale: 1,
      y: 250,
      duration: 800,
      ease: 'Back.easeOut'
    });

    this.tweens.add({
      targets: bonusText,
      alpha: 0,
      delay: 1800,
      duration: 500,
      onComplete: () => bonusText.destroy()
    });

    this.wave++;
    this.time.delayedCall(3000, () => this.showWaveIntro());
    this.playMelody([440, 554, 659, 880, 1108], 150);
    this.cameras.main.flash(300, 0, 255, 136);
  }

  gameOver() {
    this.gameActive = false;
    this.physics.pause();

    // Calculate stats
    const accuracyPct = this.accuracy.shots > 0 ? Math.floor((this.accuracy.hits / this.accuracy.shots) * 100) : 0;

    // High score
    const hs = parseInt(localStorage.getItem('promptPanicHS') || '0');
    const newHS = this.score > hs;
    if (newHS) localStorage.setItem('promptPanicHS', this.score.toString());

    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85);

    this.add.text(400, 150, '💀 SISTEMA VULNERADO 💀', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5);

    // Stats box
    this.add.text(400, 240, 'ESTADÍSTICAS FINALES', {
      fontSize: '24px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 280, `Puntaje: ${this.score} | Oleada: ${this.wave} | Eliminados: ${this.totalKills}`, {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 310, `Precisión: ${accuracyPct}% (${this.accuracy.hits}/${this.accuracy.shots})`, {
      fontSize: '18px',
      color: '#00ff88'
    }).setOrigin(0.5);

    if (newHS) {
      this.add.text(400, 360, '🏆 ¡NUEVO RÉCORD! 🏆', {
        fontSize: '32px',
        color: '#ffff00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5);

      // Fireworks
      for (let i = 0; i < 5; i++) {
        this.time.delayedCall(i * 300, () => {
          this.particles.createEmitter({
            x: 200 + i * 150,
            y: 450,
            speed: { min: 100, max: 300 },
            angle: { min: -120, max: -60 },
            scale: { start: 1, end: 0 },
            tint: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00],
            lifespan: 2000,
            quantity: 30,
            gravityY: 200
          });
        });
      }
    } else {
      this.add.text(400, 360, `Récord Máximo: ${hs}`, {
        fontSize: '22px',
        color: '#888888'
      }).setOrigin(0.5);
    }

    // Funny developer messages based on performance
    const funnyMessages = [
      '¿Olvidaste sanitizar los inputs? 🤦',
      'Hora de actualizar el modelo de amenazas...',
      '¿Tal vez agregar más capas la próxima?',
      '¡Tu defensa tenía más hoyos que queso suizo!',
      '¡Stack Overflow no pudo salvarte ahora!',
      'ERROR 418: Soy una tetera (y te hackearon)',
      'git blame a ti mismo por esto...',
      'Deberías haber usado TypeScript 😏'
    ];
    const funnyMsg = this.score < 500 ? funnyMessages[0] :
                     this.wave < 5 ? funnyMessages[1] :
                     accuracyPct < 50 ? funnyMessages[3] :
                     Phaser.Math.RND.pick(funnyMessages);

    this.add.text(400, 420, funnyMsg, {
      fontSize: '18px',
      color: '#ff6600',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    this.add.text(400, 470, 'Volviendo al lobby...', {
      fontSize: '16px',
      color: '#888888'
    }).setOrigin(0.5);

    this.playMelody([440, 392, 349, 330, 294], 400);

    this.time.delayedCall(5000, () => {
      this.cameras.main.fade(1000, 0, 0, 0);
      this.time.delayedCall(1000, () => this.scene.start('Lobby'));
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

  playMelody(notes, duration) {
    if (!this.audioCtx) return;
    notes.forEach((freq, i) => {
      setTimeout(() => this.playSound(freq, duration / 1000, 0.15), i * duration);
    });
  }
}

// ============ GAME 2: MERGE CONFLICT MAYHEM ============
class MergeConflictScene extends Phaser.Scene {
  constructor() {
    super('MergeConflict');
  }

  init(data) {
    this.playerCount = data.players || 2;
    this.score = 0;
    this.sprint = 1;
    this.lives = 3;
    this.gameActive = true;
    this.dropSpeed = 60;
    this.nextDrop = 0;
    this.blocks = [];
    this.currentBlock = null;
    this.nextBlock = null;
    this.grid = [];
    this.conflicts = 0;
    this.linesCleared = 0;
    this.lastLineClear = 0;
  }

  create() {
    // Background - git graph aesthetic
    const g = this.add.graphics();
    g.fillStyle(0x0a0a0a, 1);
    g.fillRect(0, 0, 800, 600);

    // Animated grid
    this.bgGrid = this.add.graphics();
    this.gridTime = 0;

    // Draw branch visualization background
    this.branchViz = this.add.graphics();
    this.drawBranches();

    // Audio context
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    } catch (e) {
      this.audioCtx = null;
    }

    // Playing field (centered Tetris-style)
    this.fieldX = 300;
    this.fieldY = 80;
    this.blockSize = 25;

    // Draw playing field border with glow
    const border = this.add.graphics();
    border.fillStyle(0xff6600, 0.1);
    border.fillRect(this.fieldX - 6, this.fieldY - 6, this.blockSize * 10 + 12, this.blockSize * 20 + 12);
    border.lineStyle(3, 0xff6600, 1);
    border.strokeRect(this.fieldX - 2, this.fieldY - 2, this.blockSize * 10 + 4, this.blockSize * 20 + 4);

    // Grid (20 rows x 10 cols)
    for (let r = 0; r < 20; r++) {
      this.grid[r] = new Array(10).fill(null);
    }

    // UI with better design
    this.scoreText = this.add.text(16, 16, '🔀 MERGES: 0', {
      fontSize: '20px',
      color: '#ff6600',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });

    this.sprintText = this.add.text(400, 16, 'SPRINT 1', {
      fontSize: '26px',
      color: '#00ff88',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.conflictText = this.add.text(784, 16, 'LÍNEAS: 0', {
      fontSize: '18px',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(1, 0);

    this.livesText = this.add.text(16, 50, '💾 '.repeat(this.lives), {
      fontSize: '22px'
    });

    // Next block preview with label
    this.add.text(620, 90, 'PRÓXIMO:', {
      fontSize: '18px',
      color: '#ff6600',
      fontStyle: 'bold'
    });

    const previewBg = this.add.graphics();
    previewBg.fillStyle(0x1a1a1a, 1);
    previewBg.fillRect(615, 115, 100, 100);
    previewBg.lineStyle(2, 0xff6600, 0.5);
    previewBg.strokeRect(615, 115, 100, 100);

    this.nextPreview = this.add.container(650, 140);

    // Controls hint
    this.add.text(400, 565, '⬅️➡️ Mover  |  ⬆️ Rotar  |  ⬇️ Caída Rápida', {
      fontSize: '14px',
      color: '#666666'
    }).setOrigin(0.5);

    // Tutorial
    this.tutorialText = this.add.text(400, 420, '💡 ¡Limpia líneas para resolver conflictos!', {
      fontSize: '16px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: this.tutorialText,
      alpha: 0,
      delay: 4000,
      duration: 1000,
      onComplete: () => this.tutorialText.destroy()
    });

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.leftKey = this.cursors.left;
    this.rightKey = this.cursors.right;
    this.downKey = this.cursors.down;
    this.upKey = this.cursors.up;

    // Movement timing
    this.moveDelay = 0;
    this.fastDrop = false;
    this.lastRotate = 0;

    // Block types with git-themed colors
    this.blockTypes = [
      { name: 'head', color: 0x00ff00, shape: [[1,1],[1,1]] },
      { name: 'incoming', color: 0xff0000, shape: [[1,1,1,1]] },
      { name: 'conflict', color: 0xff00ff, shape: [[0,1,0],[1,1,1]] },
      { name: 'clean', color: 0x0088ff, shape: [[1,1,0],[0,1,1]] }
    ];

    // Start game with intro
    this.showSprintIntro();
  }

  showSprintIntro() {
    const intro = this.add.text(400, 300, `SPRINT ${this.sprint}\n¡INICIO!`, {
      fontSize: '48px',
      color: '#ff6600',
      fontStyle: 'bold',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setScale(0);

    this.tweens.add({
      targets: intro,
      scale: 1.2,
      alpha: 0,
      duration: 2000,
      ease: 'Back.easeOut',
      onComplete: () => {
        intro.destroy();
        this.spawnBlock();
        this.spawnBlock();
      }
    });

    this.playMelody([330, 392, 440], 150);
  }

  update(time, delta) {
    if (!this.gameActive || !this.currentBlock) return;

    // Animated background grid
    this.gridTime += 0.5;
    this.bgGrid.clear();
    this.bgGrid.lineStyle(1, 0xff6600, 0.08);
    for (let i = 0; i < 800; i += 30) {
      this.bgGrid.lineBetween(i, 0, i, 600);
    }
    for (let j = 0; j < 600; j += 30) {
      this.bgGrid.lineBetween(0, j + (this.gridTime % 30), 800, j + (this.gridTime % 30));
    }

    // Drop timing
    const dropInterval = this.downKey.isDown ? 40 : Math.max(200, 900 - this.sprint * 50);

    if (time > this.nextDrop) {
      this.moveBlockDown();
      this.nextDrop = time + dropInterval;
    }

    // Horizontal movement with better feel
    if (time > this.moveDelay) {
      if (this.leftKey.isDown) {
        this.moveBlock(-1, 0);
        this.moveDelay = time + 120;
      } else if (this.rightKey.isDown) {
        this.moveBlock(1, 0);
        this.moveDelay = time + 120;
      }
    }

    // Rotation with cooldown
    if (Phaser.Input.Keyboard.JustDown(this.upKey) && time > this.lastRotate + 150) {
      this.rotateBlock();
      this.lastRotate = time;
    }
  }

  drawBranches() {
    this.branchViz.clear();
    this.branchViz.lineStyle(2, 0xff6600, 0.2);

    // Draw git-style branch lines
    for (let i = 0; i < 6; i++) {
      const x = 50 + i * 130;
      this.branchViz.moveTo(x, 100);
      this.branchViz.lineTo(x, 520);

      // Commit points
      for (let j = 0; j < 4; j++) {
        const y = 140 + j * 110;
        this.branchViz.fillStyle(0xff6600, 0.4);
        this.branchViz.fillCircle(x, y, 5);

        // Some merge lines
        if (i < 5 && j % 2 === 0) {
          this.branchViz.lineStyle(1, 0xff6600, 0.15);
          this.branchViz.lineBetween(x, y, x + 130, y + 55);
          this.branchViz.lineStyle(2, 0xff6600, 0.2);
        }
      }
    }
  }

  spawnBlock() {
    if (this.currentBlock) {
      this.currentBlock = this.nextBlock;
    }

    // Create next block
    const type = this.blockTypes[Math.floor(Math.random() * this.blockTypes.length)];
    this.nextBlock = {
      type: type.name,
      color: type.color,
      shape: JSON.parse(JSON.stringify(type.shape)),
      x: 4,
      y: 0,
      graphics: null,
      ghostGraphics: null
    };

    // Update preview with animation
    this.nextPreview.removeAll(true);
    const preview = this.add.graphics();
    for (let r = 0; r < this.nextBlock.shape.length; r++) {
      for (let c = 0; c < this.nextBlock.shape[r].length; c++) {
        if (this.nextBlock.shape[r][c]) {
          // Glow
          preview.fillStyle(this.nextBlock.color, 0.2);
          preview.fillCircle(c * 22 + 11, r * 22 + 11, 15);
          // Block
          preview.fillStyle(this.nextBlock.color, 1);
          preview.fillRect(c * 22, r * 22, 20, 20);
          preview.lineStyle(2, 0x000000, 0.3);
          preview.strokeRect(c * 22, r * 22, 20, 20);
          // Shine
          preview.fillStyle(0xffffff, 0.3);
          preview.fillRect(c * 22 + 2, r * 22 + 2, 8, 8);
        }
      }
    }
    this.nextPreview.add(preview);

    if (this.currentBlock) {
      this.drawBlock();

      if (this.checkCollision(this.currentBlock.x, this.currentBlock.y)) {
        this.gameOver();
      }
    }
  }

  drawBlock() {
    if (this.currentBlock.graphics) {
      this.currentBlock.graphics.destroy();
    }
    if (this.currentBlock.ghostGraphics) {
      this.currentBlock.ghostGraphics.destroy();
    }

    const block = this.currentBlock;

    // Draw ghost (preview of where block will land)
    let ghostY = block.y;
    while (!this.checkCollision(block.x, ghostY + 1) && ghostY < 20) {
      ghostY++;
    }

    const ghost = this.add.graphics();
    for (let r = 0; r < block.shape.length; r++) {
      for (let c = 0; c < block.shape[r].length; c++) {
        if (block.shape[r][c]) {
          const px = this.fieldX + (block.x + c) * this.blockSize;
          const py = this.fieldY + (ghostY + r) * this.blockSize;
          ghost.lineStyle(2, block.color, 0.3);
          ghost.strokeRect(px, py, this.blockSize - 2, this.blockSize - 2);
        }
      }
    }
    this.currentBlock.ghostGraphics = ghost;

    // Draw actual block
    const g = this.add.graphics();
    for (let r = 0; r < block.shape.length; r++) {
      for (let c = 0; c < block.shape[r].length; c++) {
        if (block.shape[r][c]) {
          const px = this.fieldX + (block.x + c) * this.blockSize;
          const py = this.fieldY + (block.y + r) * this.blockSize;

          // Glow
          g.fillStyle(block.color, 0.3);
          g.fillCircle(px + this.blockSize / 2, py + this.blockSize / 2, this.blockSize * 0.7);

          // Block
          g.fillStyle(block.color, 1);
          g.fillRect(px, py, this.blockSize - 2, this.blockSize - 2);

          // Border
          g.lineStyle(1, 0x000000, 0.5);
          g.strokeRect(px, py, this.blockSize - 2, this.blockSize - 2);

          // Shine
          g.fillStyle(0xffffff, 0.4);
          g.fillRect(px + 2, py + 2, this.blockSize / 3, this.blockSize / 3);
        }
      }
    }
    this.currentBlock.graphics = g;
  }

  moveBlock(dx, dy) {
    const newX = this.currentBlock.x + dx;
    const newY = this.currentBlock.y + dy;

    if (!this.checkCollision(newX, newY)) {
      this.currentBlock.x = newX;
      this.currentBlock.y = newY;
      this.drawBlock();

      if (dx !== 0) this.playSound(250, 0.04, 0.08);
      return true;
    }

    return false;
  }

  moveBlockDown() {
    if (!this.moveBlock(0, 1)) {
      this.lockBlock();
      this.checkLines();
      this.spawnBlock();
    }
  }

  rotateBlock() {
    const old = this.currentBlock.shape;
    const n = old.length;
    const m = old[0].length;
    const rotated = [];

    for (let c = 0; c < m; c++) {
      rotated[c] = [];
      for (let r = n - 1; r >= 0; r--) {
        rotated[c].push(old[r][c]);
      }
    }

    this.currentBlock.shape = rotated;

    if (this.checkCollision(this.currentBlock.x, this.currentBlock.y)) {
      this.currentBlock.shape = old;
    } else {
      this.drawBlock();
      this.playSound(400, 0.08, 0.10);
    }
  }

  checkCollision(x, y) {
    const block = this.currentBlock;

    for (let r = 0; r < block.shape.length; r++) {
      for (let c = 0; c < block.shape[r].length; c++) {
        if (block.shape[r][c]) {
          const gridX = x + c;
          const gridY = y + r;

          if (gridX < 0 || gridX >= 10 || gridY >= 20) return true;
          if (gridY >= 0 && this.grid[gridY][gridX]) return true;
        }
      }
    }

    return false;
  }

  lockBlock() {
    const block = this.currentBlock;

    for (let r = 0; r < block.shape.length; r++) {
      for (let c = 0; c < block.shape[r].length; c++) {
        if (block.shape[r][c]) {
          const gridX = block.x + c;
          const gridY = block.y + r;

          if (gridY >= 0) {
            this.grid[gridY][gridX] = {
              color: block.color,
              type: block.type
            };
          }
        }
      }
    }

    this.redrawGrid();
    this.playSound(200, 0.10, 0.12);
  }

  checkLines() {
    let linesCleared = 0;
    const clearedRows = [];

    for (let r = 19; r >= 0; r--) {
      let full = true;

      for (let c = 0; c < 10; c++) {
        if (!this.grid[r][c]) {
          full = false;
          break;
        }
      }

      if (full) {
        linesCleared++;
        clearedRows.push(r);

        // Flash effect for cleared line
        const flash = this.add.graphics();
        flash.fillStyle(0xffffff, 0.8);
        flash.fillRect(this.fieldX, this.fieldY + r * this.blockSize, this.blockSize * 10, this.blockSize);
        this.tweens.add({
          targets: flash,
          alpha: 0,
          duration: 300,
          onComplete: () => flash.destroy()
        });

        // Remove line
        for (let rr = r; rr > 0; rr--) {
          this.grid[rr] = [...this.grid[rr - 1]];
        }
        this.grid[0] = new Array(10).fill(null);

        r++;
      }
    }

    if (linesCleared > 0) {
      const points = [0, 100, 300, 600, 1000][linesCleared];
      this.score += points;
      this.conflicts += linesCleared;
      this.linesCleared += linesCleared;

      this.scoreText.setText('🔀 MERGES: ' + this.score);
      this.conflictText.setText('LÍNEAS: ' + this.conflicts);

      // Achievement messages
      if (linesCleared === 1) {
        this.showMessage('¡SIMPLE! +100', '#00ff88', this.fieldX + 125, this.fieldY + 150);
      } else if (linesCleared === 2) {
        this.showMessage('¡DOBLE! +300', '#ffff00', this.fieldX + 125, this.fieldY + 150);
      } else if (linesCleared === 3) {
        this.showMessage('¡TRIPLE! +600', '#ff6600', this.fieldX + 125, this.fieldY + 150);
      } else if (linesCleared === 4) {
        this.showMessage('¡TETRIS! +1000 🔥', '#ff0000', this.fieldX + 125, this.fieldY + 150);
        this.cameras.main.shake(300, 0.01);
      }

      this.playMelody([440, 554, 659, 880].slice(0, linesCleared), 120);
      this.cameras.main.flash(100, 0, 255, 102, false, 0.2);

      // Check sprint progression
      if (this.conflicts >= this.sprint * 10) {
        this.nextSprint();
      }
    }

    this.redrawGrid();
  }

  showMessage(text, color, x, y) {
    const msg = this.add.text(x, y, text, {
      fontSize: '24px',
      color: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setScale(0);

    this.tweens.add({
      targets: msg,
      scale: 1.3,
      y: y - 40,
      alpha: 0,
      duration: 1200,
      ease: 'Back.easeOut',
      onComplete: () => msg.destroy()
    });
  }

  redrawGrid() {
    this.children.list.forEach(child => {
      if (child.gridBlock) child.destroy();
    });

    for (let r = 0; r < 20; r++) {
      for (let c = 0; c < 10; c++) {
        if (this.grid[r][c]) {
          const px = this.fieldX + c * this.blockSize;
          const py = this.fieldY + r * this.blockSize;

          const g = this.add.graphics();
          g.gridBlock = true;

          // Glow
          g.fillStyle(this.grid[r][c].color, 0.2);
          g.fillCircle(px + this.blockSize / 2, py + this.blockSize / 2, this.blockSize * 0.6);

          // Block
          g.fillStyle(this.grid[r][c].color, 1);
          g.fillRect(px, py, this.blockSize - 2, this.blockSize - 2);

          // Border
          g.lineStyle(1, 0x000000, 0.5);
          g.strokeRect(px, py, this.blockSize - 2, this.blockSize - 2);

          // Shine
          g.fillStyle(0xffffff, 0.3);
          g.fillRect(px + 2, py + 2, this.blockSize / 4, this.blockSize / 4);
        }
      }
    }
  }

  nextSprint() {
    this.sprint++;
    this.sprintText.setText('SPRINT ' + this.sprint);

    const bonus = this.sprint * 250;
    this.score += bonus;
    this.scoreText.setText('🔀 MERGES: ' + this.score);

    const bonusText = this.add.text(400, 300, `¡SPRINT ${this.sprint - 1} COMPLETO!\n+${bonus} BONUS 🎉`, {
      fontSize: '42px',
      color: '#ff6600',
      fontStyle: 'bold',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setScale(0);

    this.tweens.add({
      targets: bonusText,
      scale: 1,
      duration: 800,
      ease: 'Back.easeOut'
    });

    this.tweens.add({
      targets: bonusText,
      alpha: 0,
      y: 250,
      delay: 1800,
      duration: 800,
      onComplete: () => bonusText.destroy()
    });

    this.playMelody([440, 554, 659, 880, 1108], 180);
    this.cameras.main.flash(300, 255, 102, 0);
  }

  gameOver() {
    this.gameActive = false;

    // High score
    const hs = parseInt(localStorage.getItem('mergeConflictHS') || '0');
    const newHS = this.score > hs;
    if (newHS) localStorage.setItem('mergeConflictHS', this.score.toString());

    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.85);

    this.add.text(400, 140, '💥 MERGE FALLÓ 💥', {
      fontSize: '72px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5);

    // Stats
    this.add.text(400, 230, 'ESTADÍSTICAS FINALES', {
      fontSize: '24px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 270, `Puntaje: ${this.score} | Líneas: ${this.linesCleared}`, {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 300, `Sprint Alcanzado: ${this.sprint}`, {
      fontSize: '20px',
      color: '#00ff88'
    }).setOrigin(0.5);

    if (newHS) {
      this.add.text(400, 360, '🏆 ¡NUEVO RÉCORD! 🏆', {
        fontSize: '32px',
        color: '#ffff00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5);
    } else {
      this.add.text(400, 360, `Récord Máximo: ${hs}`, {
        fontSize: '22px',
        color: '#888888'
      }).setOrigin(0.5);
    }

    // Funny developer git messages based on performance
    const gitMessages = [
      'git commit -m "no tengo idea de lo que hago"',
      'git push --force (se te acabó la suerte)',
      'Merge conflict en cerebro.js linea 404',
      'Probablemente debiste hacer un backup branch...',
      '¡Por esto hacemos code reviews!',
      'git blame: señalando dedos desde 2005',
      'Hora de rebase tus decisiones de vida 😅',
      'CONFLICT (content): Merge falló en diversion.js'
    ];
    const gitMsg = this.score < 300 ? gitMessages[0] :
                   this.linesCleared < 10 ? gitMessages[3] :
                   this.sprint < 3 ? gitMessages[1] :
                   Phaser.Math.RND.pick(gitMessages);

    this.add.text(400, 425, gitMsg, {
      fontSize: '16px',
      color: '#ff6600',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    this.add.text(400, 470, 'Volviendo al lobby...', {
      fontSize: '16px',
      color: '#888888'
    }).setOrigin(0.5);

    this.playMelody([440, 392, 349, 330, 294], 400);

    this.time.delayedCall(5000, () => {
      this.cameras.main.fade(1000, 0, 0, 0);
      this.time.delayedCall(1000, () => this.scene.start('Lobby'));
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

  playMelody(notes, duration) {
    if (!this.audioCtx) return;
    notes.forEach((freq, i) => {
      setTimeout(() => this.playSound(freq, duration / 1000, 0.12), i * duration);
    });
  }
}

// ============ GAME INIT ============
cfg.scene = [LobbyScene, PromptPanicScene, MergeConflictScene];
const game = new Phaser.Game(cfg);
