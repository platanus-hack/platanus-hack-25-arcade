// Platanus Hack 25: Orbital Wave Dodge
// Mueves un círculo y esquivas anillos que salen del centro con huecos.

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: {
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

// --- variables globales ---
let g;                // graphics
let player;           // {x,y,r}
let cursors;
let waves = [];       // anillos activos
let spawnTimer = 0;   // tiempo para próxima ola
let spawnDelay = 1400;// ms entre olas (se va bajando)
let gameOver = false;
let score = 0;
let scoreText;
let center = { x: 400, y: 300 };
let bgPulse = 0;
let best = 0;

function create() {
  g = this.add.graphics();
  cursors = this.input.keyboard.createCursorKeys();

  // jugador: círculo
  player = {
    x: 400,
    y: 450,
    r: 10,
    speed: 200
  };

  // texto puntaje
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '24px',
    fontFamily: 'Arial, sans-serif',
    color: '#00ffcc'
  });

  // instrucciones
  this.add.text(400, 580, 'Flechas para moverte · Pasa por los huecos · R para reiniciar', {
    fontSize: '16px',
    fontFamily: 'Arial, sans-serif',
    color: '#888',
    align: 'center'
  }).setOrigin(0.5);

  // input restart
  this.input.keyboard.on('keydown', (ev) => {
    if (ev.key === 'r' && gameOver) {
      restart(this);
    }
  });

  // sonido inicio
  playTone(this, 660, 0.12);

  // crear primera ola
  spawnWave();
}

function spawnWave() {
  // cada ola es un anillo que parte en r=0 y crece
  // tendrá entre 1 y 3 huecos
  const gapsCount = Phaser.Math.Between(1, 3);
  const gaps = [];
  const base = Phaser.Math.FloatBetween(0, Math.PI * 2);
  for (let i = 0; i < gapsCount; i++) {
    const size = Phaser.Math.FloatBetween(0.4, 0.75); // en radianes
    const start = base + i * (Math.PI * 2 / gapsCount) + Phaser.Math.FloatBetween(-0.2, 0.2);
    gaps.push({
      start: wrapAngle(start),
      end: wrapAngle(start + size)
    });
  }

  waves.push({
    r: 0,
    width: 15,              // grosor del anillo
    speed: 120,             // px por segundo
    gaps: gaps,
    color: 0x00ffff
  });
}

function update(time, delta) {
  if (gameOver) return;

  const dt = delta / 1000;

  // mover jugador
  movePlayer(dt);

  // actualizar olas
  for (let i = waves.length - 1; i >= 0; i--) {
    const wv = waves[i];
    wv.r += wv.speed * dt;
    // si ya salió de pantalla, la quitamos y damos score
    if (wv.r - wv.width > 900) {
      waves.splice(i, 1);
      score += 5;
      scoreText.setText('Score: ' + score);
      // subir dificultad
      if (spawnDelay > 500) spawnDelay -= 10;
    }
  }

  // spawnear nuevas olas
  spawnTimer += delta;
  if (spawnTimer >= spawnDelay) {
    spawnTimer = 0;
    spawnWave();
  }

  // dibujar
  drawScene();

  // colisiones
  checkCollisions(this, dt);

  bgPulse += dt * 2;
}

function movePlayer(dt) {
  let vx = 0, vy = 0;
  if (cursors.left.isDown) vx = -1;
  else if (cursors.right.isDown) vx = 1;
  if (cursors.up.isDown) vy = -1;
  else if (cursors.down.isDown) vy = 1;

  const mag = Math.hypot(vx, vy);
  if (mag > 0) {
    vx /= mag;
    vy /= mag;
  }

  player.x += vx * player.speed * dt;
  player.y += vy * player.speed * dt;

  // límites pantalla
  if (player.x < player.r) player.x = player.r;
  if (player.x > 800 - player.r) player.x = 800 - player.r;
  if (player.y < player.r) player.y = player.r;
  if (player.y > 600 - player.r) player.y = 600 - player.r;
}

function drawScene() {
  g.clear();

  // fondo dinamico
  const glow = (Math.sin(bgPulse) * 0.5 + 0.5) * 0.3 + 0.1;
  g.fillStyle(Phaser.Display.Color.GetColor(glow * 255, 20, glow * 120), 1);
  g.fillRect(0, 0, 800, 600);

  // centro
  g.fillStyle(0x002222, 1);
  g.fillCircle(center.x, center.y, 6);

  // dibujar olas
  waves.forEach(wv => {
    // anillo completo base
    const outer = wv.r + wv.width * 0.5;
    const inner = wv.r - wv.width * 0.5;

    // fondo tenue del anillo
    g.lineStyle(wv.width, wv.color, 0.15);
    g.strokeCircle(center.x, center.y, wv.r);

    // dibujar sólo las partes sólidas (o sea, todo menos los huecos)
    g.lineStyle(wv.width, wv.color, 1);
    const segs = 30; // cuántos segmentos para aproximar
    const step = Math.PI * 2 / segs;
    for (let a = 0; a < Math.PI * 2; a += step) {
      const mid = a + step * 0.5;
      if (!angleInGaps(mid, wv.gaps)) {
        const x1 = center.x + Math.cos(a) * wv.r;
        const y1 = center.y + Math.sin(a) * wv.r;
        const x2 = center.x + Math.cos(a + step) * wv.r;
        const y2 = center.y + Math.sin(a + step) * wv.r;
        g.beginPath();
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);
        g.strokePath();
      }
    }
  });

  // jugador
  g.fillStyle(0xffff00, 1);
  g.fillCircle(player.x, player.y, player.r + 1);
  g.lineStyle(2, 0xffaa00, 1);
  g.strokeCircle(player.x, player.y, player.r + 1);
}

function angleInGaps(ang, gaps) {
  ang = wrapAngle(ang);
  for (let i = 0; i < gaps.length; i++) {
    const g1 = wrapAngle(gaps[i].start);
    const g2 = wrapAngle(gaps[i].end);
    if (g1 <= g2) {
      if (ang >= g1 && ang <= g2) return true;
    } else {
      // hueco pasa por 2π -> 0
      if (ang >= g1 || ang <= g2) return true;
    }
  }
  return false;
}

function wrapAngle(a) {
  const tw = Math.PI * 2;
  while (a < 0) a += tw;
  while (a >= tw) a -= tw;
  return a;
}

function checkCollisions(scene) {
  // convertimos pos jugador a polar respecto al centro
  const dx = player.x - center.x;
  const dy = player.y - center.y;
  const dist = Math.hypot(dx, dy);
  const ang = Math.atan2(dy, dx);

  for (let i = 0; i < waves.length; i++) {
    const wv = waves[i];
    // el anillo está en wv.r con grosor wv.width
    const half = wv.width * 0.5;
    if (dist >= wv.r - half - player.r && dist <= wv.r + half + player.r) {
      // estamos en la zona del anillo, ahora ver si estamos en un hueco
      if (!angleInGaps(ang, wv.gaps)) {
        endGame(scene);
        return;
      }
    }
  }
}

function endGame(scene) {
  if (gameOver) return;
  gameOver = true;

  // guardar mejor puntaje
  if (score > best) best = score;

  playTone(scene, 180, 0.35);

  const overlay = scene.add.graphics();
  overlay.fillStyle(0x000000, 0.75);
  overlay.fillRect(0, 0, 800, 600);

  const t = scene.add.text(400, 250, 'GAME OVER', {
    fontSize: '62px',
    fontFamily: 'Arial, sans-serif',
    color: '#ff3333',
    stroke: '#000',
    strokeThickness: 6
  }).setOrigin(0.5);

  scene.tweens.add({
    targets: t,
    scale: { from: 1, to: 1.05 },
    yoyo: true,
    repeat: -1,
    duration: 700,
    ease: 'Sine.easeInOut'
  });

  scene.add.text(400, 340, 'SCORE: ' + score, {
    fontSize: '34px',
    fontFamily: 'Arial, sans-serif',
    color: '#00ffff',
    stroke: '#000',
    strokeThickness: 4
  }).setOrigin(0.5);

  scene.add.text(400, 390, 'BEST: ' + best, {
    fontSize: '26px',
    fontFamily: 'Arial, sans-serif',
    color: '#ffffff',
    stroke: '#000',
    strokeThickness: 3
  }).setOrigin(0.5);

  const rt = scene.add.text(400, 460, 'Presiona R para reiniciar', {
    fontSize: '20px',
    fontFamily: 'Arial, sans-serif',
    color: '#ffff00',
    stroke: '#000000',
    strokeThickness: 3
  }).setOrigin(0.5);

  scene.tweens.add({
    targets: rt,
    alpha: { from: 1, to: 0.3 },
    duration: 550,
    yoyo: true,
    repeat: -1
  });
}

function restart(scene) {
  // reset lógicos
  waves = [];
  spawnTimer = 0;
  spawnDelay = 1400;
  score = 0;
  gameOver = false;
  player.x = 400;
  player.y = 450;
  scoreText.setText('Score: 0');

  // limpiar objetos de la escena y rearmar UI básica
  scene.scene.restart();
}

function playTone(scene, frequency, duration) {
  const ctx = scene.sound.context;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = frequency;
  osc.type = 'square';
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
  osc.start(now);
  osc.stop(now + duration);
}
