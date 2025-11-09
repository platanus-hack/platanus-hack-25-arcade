// Orbital Wave Dodge — Arcade (Electro • Dash • Polygons • Fases • Top 3)
// Controles: Flechas = mover · ESPACIO = Dash · R = Reiniciar (o click en Game Over)

const config = { type: Phaser.AUTO, width: 800, height: 600, backgroundColor: '#000', scene: { create, update } };
const game = new Phaser.Game(config);

// -------------------- Estado global --------------------
let g, cursors, keySpace, keyR, cam, center = { x: 400, y: 300 };
let player = { x: 400, y: 450, r: 10, speed: 230, dashMul: 2.6, dashDur: 0.18, dashCD: 0.6, dashT: 0, cdT: 0, invT: 0, dashing: false };
let waves = [];               // {shape:{sides,rot,rotSpeed}, r, width, speed, gaps[], color, alt, shiftPhase, shiftSpeed}
let gameOver = false;

// Tiempo (métrica principal)
let timeSurvived = 0;
let bestTime = 0;

// Leaderboard (TOP 3)
const LB_KEY = 'owd_top3';
let topTimes = [];

// UI y color
let timeText, infoText;
let hue = 200, beatPulse = 0, bgPulse = 0, sidechain = 0;
let dashReadyPrev = true;

// Música / Ritmo
let bpm = 132, spb = 60 / bpm, nextBeat = 0, beatCount = 0, barCount = 0, AC, musicStarted = false;

// Densidad / huecos
let MAX_WAVES = 6;
const GAP_COUNT_MIN = 2, GAP_COUNT_MAX = 4;
let GAP_SIZE_MIN = 0.65, GAP_SIZE_MAX = 1.10;
let GAP_TOTAL_MIN = Math.PI * 0.8;
let lastSafeAngle = null;

// Fases (cada 30s sube dificultad)
let phase = 0;
let phaseTimer = 0;
let speedMul = 1;

// Partículas simples
let particles = []; // {x,y,dx,dy,life,col}

// Countdown y arranque seguro
let starting = true, startTimer = 3.0;
const START_SAFE_TIME = 8.0;
let firstSpawnPending = true;

// Colisión suave
const GAP_EPS = 0.05; // tolerancia angular
const EDGE_GRACE = 1; // 1px de gracia

// -------------------- Phaser --------------------
function create() {
  g = this.add.graphics();
  cam = this.cameras.main;
  cursors = this.input.keyboard.createCursorKeys();
  keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);

  timeText = this.add.text(16, 16, 'Tiempo: 0.00 s', { fontSize: '22px', fontFamily: 'Arial, sans-serif', color: '#00ffcc' });
  infoText = this.add.text(400, 580, '', { fontSize: '15px', fontFamily: 'Arial, sans-serif', color: '#aaa', align: 'center' }).setOrigin(0.5);

  // Leaderboard
  try { const raw = localStorage.getItem(LB_KEY); topTimes = raw ? JSON.parse(raw) : []; } catch { topTimes = []; }

  // Inputs robustos
  this.input.keyboard.on('keydown', (e) => {
    const k = (e.key || '').toLowerCase();
    if (!musicStarted) startMusic(this);
    if (k === 'r' && gameOver) restart(this);
  });
  this.input.on('pointerdown', () => {
    if (!musicStarted) startMusic(this);
    if (gameOver) restart(this);
  });

  updateInfoBanner();
  try { playBeep(this, 880, 0.07, 0.12); } catch(e) {}
}

function startMusic(scene) {
  musicStarted = true;
  AC = scene.sound.context;
  nextBeat = AC.currentTime + 0.1;
  beatCount = 0; barCount = 0;
}

function update(_t, dtMS) {
  const dt = dtMS / 1000;

  if (gameOver && Phaser.Input.Keyboard.JustDown(keyR)) { restart(this); return; }

  if (starting) {
    drawSceneBase(dt);
    startTimer -= dt;
    drawCountdown(this, Math.max(0, startTimer));
    if (startTimer <= 0) {
      starting = false;
      if (firstSpawnPending) { firstSpawnPending = false; smoothFirstSpawn(); }
    }
    return;
  }

  if (gameOver) return;

  timeSurvived += dt;
  timeText.setText('Tiempo: ' + timeSurvived.toFixed(2) + ' s');

  phaseTimer += dt;
  if (phaseTimer >= 30) {
    phaseTimer = 0; phase++;
    speedMul *= 1.07;
    GAP_SIZE_MIN = Math.max(0.5, GAP_SIZE_MIN - 0.04);
    GAP_TOTAL_MIN = Math.max(Math.PI * 0.65, GAP_TOTAL_MIN - 0.08);
    hue = (hue + 60) % 360;
    MAX_WAVES = Math.min(8, MAX_WAVES + 1);
    cam.flash(250, 255, 255, 255);
    updateInfoBanner();
  }

  handleDash(dt);
  movePlayer(dt);
  updateWaves(dt);
  scheduleBeats(this);

  drawScene(this, dt);

  checkCollisions(this);
}

// -------------------- Banner --------------------
function updateInfoBanner() {
  infoText.setText(`BPM: ${bpm}  ·  Fase: ${phase}`);
  infoText.setColor('#cccccc');
}

// -------------------- Jugador / Dash --------------------
function handleDash(dt) {
  if (player.cdT > 0) player.cdT -= dt;
  if (player.invT > 0) player.invT -= dt;

  const ready = player.cdT <= 0;
  if (ready && !dashReadyPrev && musicStarted) try { playBeep({ sound: { context: AC } }, 1320, 0.06, 0.12); } catch(e){}
  dashReadyPrev = ready;

  if (player.dashing) {
    player.dashT -= dt;
    if (player.dashT <= 0) { player.dashing = false; }
  } else if (Phaser.Input.Keyboard.JustDown(keySpace) && player.cdT <= 0) {
    player.dashing = true;
    player.dashT = player.dashDur;
    player.cdT = player.dashCD;
    player.invT = player.dashDur; // invulnerable todo el dash
    beatPulse = Math.max(0.6, beatPulse);
    sidechain = Math.max(0.6, sidechain);
    if (musicStarted) bass(AC.currentTime, 110);
    spawnBurst(player.x, player.y, 14);
    cam.shake(70, 0.0025);
  }
}

function movePlayer(dt) {
  let vx = 0, vy = 0;
  if (cursors.left.isDown) vx = -1; else if (cursors.right.isDown) vx = 1;
  if (cursors.up.isDown) vy = -1;   else if (cursors.down.isDown) vy = 1;
  const m = Math.hypot(vx, vy) || 1;
  const mul = player.dashing ? player.dashMul : 1;
  player.x += (vx / m) * player.speed * mul * dt;
  player.y += (vy / m) * player.speed * mul * dt;
  if (player.x < player.r) player.x = player.r;
  if (player.x > 800 - player.r) player.x = 800 - player.r;
  if (player.y < player.r) player.y = player.r;
  if (player.y > 600 - player.r) player.y = 600 - player.r;
}

// -------------------- Olas / Spawns --------------------
function updateWaves(dt) {
  for (let i = waves.length - 1; i >= 0; i--) {
    const w = waves[i];
    w.r += w.speed * speedMul * dt;
    w.shape.rot += w.shape.rotSpeed * dt;
    if (w.alt) w.shiftPhase += w.shiftSpeed * dt;
    if (w.r - w.width > 900) waves.splice(i, 1);
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.dx * dt; p.y += p.dy * dt;
    p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function scheduleBeats(scene) {
  if (!musicStarted) return;
  const now = AC.currentTime;
  while (now >= nextBeat) {
    onBeat(scene, nextBeat, beatCount, barCount);
    beatCount = (beatCount + 1) & 3;
    if (beatCount === 0) barCount++;
    nextBeat += spb;
  }
}

function onBeat(scene, when, beatIdx, barIdx) {
  // Música
  if (beatIdx === 0 || beatIdx === 2) kick(when);
  if (beatIdx === 1 || beatIdx === 3) clap(when + 0.002);
  hihat(when);
  arp(scene, when, barIdx);

  // Visual
  beatPulse = 1;
  hue = (hue + (beatIdx === 0 ? 30 : 14)) % 360;
  sidechain = 0.9;

  if (starting) return;

  // Spawns (seguro al inicio)
  const early = timeSurvived < START_SAFE_TIME;
  const currentMax = early ? 2 : MAX_WAVES;
  const spawnOnThisBeat = (beatIdx === 0) || (!early && beatIdx === 2 && Math.random() < 0.35);

  if (spawnOnThisBeat && waves.length < currentMax) {
    const gaps = Phaser.Math.Between(GAP_COUNT_MIN, GAP_COUNT_MAX);
    const keepCorridor = true;
    spawnWave(randSides(early), gaps, barIdx, 0, keepCorridor, early);
  }
}

function randSides(early=false) {
  if (early) return Math.random() < 0.7 ? 0 : 4;  // círculos/cuadrados al inicio
  const r = Math.random();
  if (r < 0.30) return 0;
  if (r < 0.55) return 4;
  const opts = [3,5,6];
  return opts[Phaser.Math.Between(0, opts.length - 1)];
}

function smoothFirstSpawn() { spawnWave(0, 3, 0, 0, true, true); }

function spawnWave(sides = 0, gapsCount = 2, seed = 0, rotBias = 0, keepCorridor = false, early=false) {
  const baseHue = hue;
  const prevMin = GAP_TOTAL_MIN, prevSizeMin = GAP_SIZE_MIN, prevSizeMax = GAP_SIZE_MAX;
  if (early) {
    GAP_TOTAL_MIN = Math.PI * 1.2;
    GAP_SIZE_MIN = 0.8;
    GAP_SIZE_MAX = 1.3;
  }

  const gapsData = makeGaps(gapsCount, keepCorridor ? lastSafeAngle : null);
  const gaps = gapsData.gaps;
  lastSafeAngle = gapsData.safeAngle;

  if (early) { GAP_TOTAL_MIN = prevMin; GAP_SIZE_MIN = prevSizeMin; GAP_SIZE_MAX = prevSizeMax; }

  let speed = (early ? 110 : 135) + ((seed % 5) * 10);
  const c = Phaser.Display.Color.HSLToColor(baseHue / 360, 0.95, 0.55).color;
  const rotSpeed = Phaser.Math.FloatBetween(-0.7, 0.7) * (sides === 0 ? 0 : 1);

  const alt = !early && Math.random() < 0.5;
  const shiftSpeed = (Math.random() < 0.5 ? -1 : 1) * Phaser.Math.FloatBetween(0.5, 1.4);
  const shiftPhase = Phaser.Math.FloatBetween(0, Math.PI * 2);

  waves.push({ r: 0, width: 14, speed, gaps, color: c, alt, shiftSpeed, shiftPhase, shape: { sides, rot: rotBias, rotSpeed } });
}

function makeGaps(count, corridorAngle) {
  count = Phaser.Math.Clamp(count, GAP_COUNT_MIN, GAP_COUNT_MAX);
  let fixedGapIndex = (corridorAngle != null) ? Phaser.Math.Between(0, count - 1) : -1;

  let gaps = [];
  for (let i = 0; i < count; i++) {
    let size = Phaser.Math.FloatBetween(GAP_SIZE_MIN, GAP_SIZE_MAX);
    let start;
    if (i === fixedGapIndex) {
      const center = wrapAngle(corridorAngle + Phaser.Math.FloatBetween(-0.18, 0.18));
      start = wrapAngle(center - size * 0.5);
    } else {
      start = Phaser.Math.FloatBetween(0, Math.PI * 2);
    }
    gaps.push({ start: wrapAngle(start), end: wrapAngle(start + size) });
  }

  function totalOpen(gs) {
    let sum = 0;
    for (let j = 0; j < gs.length; j++) {
      const a = wrapAngle(gs[j].start), b = wrapAngle(gs[j].end);
      sum += (a <= b) ? (b - a) : ((Math.PI * 2 - a) + b);
    }
    return sum;
  }

  let open = totalOpen(gaps);
  let budget = Math.max(0, GAP_TOTAL_MIN - open);
  while (budget > 0.0001) {
    for (let i = 0; i < gaps.length && budget > 0.0001; i++) {
      const add = Math.min(budget, 0.12);
      gaps[i].end = wrapAngle(gaps[i].end + add);
      budget -= add;
    }
    open = totalOpen(gaps);
    budget = Math.max(0, GAP_TOTAL_MIN - open);
  }

  gaps.sort((g1, g2) => wrapAngle(g1.start) - wrapAngle(g2.start));
  const g0 = gaps[0], a = wrapAngle(g0.start), b = wrapAngle(g0.end);
  const span = (a <= b) ? (b - a) : ((Math.PI * 2 - a) + b);
  const safeCenter = wrapAngle(a + span * 0.5);

  return { gaps, safeAngle: safeCenter };
}

// -------------------- Dibujo --------------------
function drawScene(scene, dt) {
  drawSceneBase(dt);

  // Jugador
  const pc = Phaser.Display.Color.HSLToColor(hue / 360, 1, player.dashing ? 0.75 : 0.6).color;
  g.fillStyle(pc, 1);
  g.fillCircle(player.x, player.y, player.r + 1);
  g.lineStyle(2, 0x000000, 0.6);
  g.strokeCircle(player.x, player.y, player.r + 1);

  // Partículas
  particles.forEach(p => { g.fillStyle(p.col, Math.max(0, p.life)); g.fillRect(p.x, p.y, 2, 2); });

  // HUD Dash
  drawDashHUD(scene);
}

function drawSceneBase(dt) {
  g.clear();
  const baseL = 0.10 + 0.12 * (Math.sin(bgPulse) * 0.5 + 0.5);
  const sc = 1 - sidechain * 0.55;
  const beatL = Math.min(0.55, baseL * sc + beatPulse * 0.20);
  const bgColor = Phaser.Display.Color.HSLToColor(hue / 360, 0.65, beatL).color;
  g.fillStyle(bgColor, 1);
  g.fillRect(0, 0, 800, 600);

  // Vignette
  g.fillStyle(0x000000, 0.12 + beatPulse * 0.07);
  g.fillRect(0, 0, 800, 42); g.fillRect(0, 558, 800, 42);
  g.fillRect(0, 0, 42, 600); g.fillRect(758, 0, 42, 600);

  // Olas / figuras
  waves.forEach(w => {
    const segs = 40, step = Math.PI * 2 / segs;
    g.lineStyle(w.width, w.color, 0.18);
    sampleRing(w, step, (x1, y1, x2, y2) => { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.strokePath(); });
    g.lineStyle(w.width, w.color, 1);
    sampleRing(w, step, (x1, y1, x2, y2, mid) => {
      const localMid = w.alt ? wrapAngle(mid + w.shiftPhase) : mid;
      if (!angleInGaps(localMid, w.gaps)) { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.strokePath(); }
    });
  });

  // Centro
  g.fillStyle(0xffffff, 0.10 + beatPulse * 0.12);
  g.fillCircle(center.x, center.y, 7);

  bgPulse += dt * 2;
  beatPulse = Math.max(0, beatPulse - dt * 2.2);
  sidechain = Math.max(0, sidechain - dt * 4.0);
}

function drawCountdown(scene, t) {
  const txt = t > 0.8 ? Math.ceil(t).toString() : 'GO!';
  const size = t > 0.8 ? 72 : 58;

  if (!scene._countText) {
    scene._countText = scene.add.text(400, 300, txt, {
      fontSize: `${size}px`,
      fontFamily: 'Arial, sans-serif',
      color: '#ffff66',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5);
  } else {
    scene._countText.setText(txt);
    scene._countText.setStyle({
      fontSize: `${size}px`,
      color: t > 0.8 ? '#ffff66' : '#66ff99'
    });
  }
  if (t <= 0) { scene._countText.destroy(); scene._countText = null; }
}

function drawDashHUD(scene) {
  const x = 200, y = 564, w = 320, h = 16;
  g.lineStyle(2, 0xffffff, 0.6);
  g.strokeRect(x, y, w, h);

  const ratio = Phaser.Math.Clamp(1 - (player.cdT / player.dashCD), 0, 1);
  const barCol = Phaser.Display.Color.HSLToColor(hue / 360, 0.8, 0.55).color;
  g.fillStyle(barCol, 0.85);
  g.fillRect(x + 2, y + 2, (w - 4) * ratio, h - 4);

  if (!scene._dashText) {
    scene._dashText = scene.add.text(x + w + 12, y - 1, '', { fontSize: '16px', fontFamily: 'Arial, sans-serif', color: '#ffffff' }).setOrigin(0, 0);
  }
  if (player.cdT <= 0) {
    scene._dashText.setText('DASH READY');
    scene._dashText.setColor('#ffff66');
    scene._dashText.alpha = 0.6 + 0.4 * (Math.sin(performance.now() * 0.01) * 0.5 + 0.5);
  } else {
    scene._dashText.setText('Dash CD: ' + Math.max(0, player.cdT).toFixed(2) + 's');
    scene._dashText.setColor('#ffffff'); scene._dashText.alpha = 1;
  }
}

// -------------------- Geometría / util --------------------
function sampleRing(w, step, drawFn) {
  for (let a = 0; a < Math.PI * 2; a += step) {
    const mid = a + step * 0.5;
    const R = radiusAtAngle(w, mid);
    const x1 = center.x + Math.cos(a) * R;
    const y1 = center.y + Math.sin(a) * R;
    const x2 = center.x + Math.cos(a + step) * R;
    const y2 = center.y + Math.sin(a + step) * R;
    drawFn(x1, y1, x2, y2, mid);
  }
}

function angleInGaps(ang, gaps) {
  ang = wrapAngle(ang);
  for (let i = 0; i < gaps.length; i++) {
    const a = wrapAngle(gaps[i].start), b = wrapAngle(gaps[i].end);
    if (a <= b) { if (ang >= a && ang <= b) return true; }
    else { if (ang >= a || ang <= b) return true; }
  }
  return false;
}

function angleInGapsSoft(ang, gaps, eps) {
  const a1 = wrapAngle(ang - eps), a2 = wrapAngle(ang + eps);
  return angleInGaps(a1, gaps) || angleInGaps(a2, gaps) || angleInGaps(ang, gaps);
}

function wrapAngle(a) { const t = Math.PI * 2; while (a < 0) a += t; while (a >= t) a -= t; return a; }
function angularDistance(a, b) { let d = Math.abs(wrapAngle(a) - wrapAngle(b)); if (d > Math.PI) d = 2 * Math.PI - d; return d; }

function radiusAtAngle(w, ang) {
  if (w.shape.sides === 0) return w.r;
  const n = w.shape.sides, rot = w.shape.rot, R = w.r;
  const pi_n = Math.PI / n, seg = (2 * Math.PI) / n;
  let d = (ang - rot) % (2 * Math.PI); if (d < 0) d += 2 * Math.PI;
  d = (d % seg);
  const denom = Math.cos(d - pi_n);
  return (denom !== 0) ? (R * Math.cos(pi_n) / Math.max(0.0001, denom)) : (R * 10);
}

// -------------------- Colisiones / Game Over --------------------
function checkCollisions(scene) {
  if (player.invT > 0) return; // invulnerable durante el dash

  const dx = player.x - center.x, dy = player.y - center.y;
  const dist = Math.hypot(dx, dy), ang0 = Math.atan2(dy, dx);

  for (let i = 0; i < waves.length; i++) {
    const w = waves[i];
    const ang = w.alt ? wrapAngle(ang0 + w.shiftPhase) : ang0;

    // Annulus con 1px de gracia
    const innerObj = { ...w, r: w.r - w.width * 0.5 + EDGE_GRACE };
    const outerObj = { ...w, r: w.r + w.width * 0.5 - EDGE_GRACE };
    const innerEdge = radiusAtAngle(innerObj, ang);
    const outerEdge = radiusAtAngle(outerObj, ang);

    const inside = (dist + player.r >= innerEdge && dist - player.r <= outerEdge);
    if (inside) {
      if (!angleInGapsSoft(ang, w.gaps, GAP_EPS)) { endGame(scene); return; }
      else {
        const margin = Math.min(Math.abs((dist + player.r) - innerEdge), Math.abs((dist - player.r) - outerEdge));
        if (margin < 6) { cam.shake(40, 0.0015); spawnBurst(player.x, player.y, 6); }
      }
    }
  }
}

function endGame(scene) {
  if (gameOver) return;
  gameOver = true;

  if (timeSurvived > bestTime) bestTime = timeSurvived;
  saveLeaderboard(timeSurvived);

  try { playNoise(scene, 0.12, 0.25); } catch(e){}
  cam.shake(250, 0.004);

  const overlay = scene.add.graphics(); overlay.fillStyle(0x000000, 0.75); overlay.fillRect(0, 0, 800, 600);
  const t = scene.add.text(400, 220, 'GAME OVER', { fontSize: '62px', fontFamily: 'Arial, sans-serif', color: '#ff3333', stroke: '#000', strokeThickness: 6 }).setOrigin(0.5);
  scene.tweens.add({ targets: t, scale: { from: 1, to: 1.05 }, yoyo: true, repeat: -1, duration: 700 });

  scene.add.text(400, 300, 'TIEMPO: ' + timeSurvived.toFixed(2) + ' s', { fontSize: '34px', fontFamily: 'Arial, sans-serif', color: '#00ffff', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5);
  scene.add.text(400, 340, 'MEJOR: ' + bestTime.toFixed(2) + ' s', { fontSize: '26px', fontFamily: 'Arial, sans-serif', color: '#ffffff', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5);

  const list = topTimes.map((v, i) => `${i+1}. ${v.toFixed(2)} s`).join('\n');
  scene.add.text(400, 410, 'TOP 3\n' + (list || '—'), { fontSize: '20px', fontFamily: 'Arial, sans-serif', color: '#ffffaa', align: 'center' }).setOrigin(0.5);

  const rt = scene.add.text(400, 520, 'R: Reiniciar   ·   Click: Reiniciar', { fontSize: '18px', fontFamily: 'Arial, sans-serif', color: '#ffff00', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5);
  scene.tweens.add({ targets: rt, alpha: { from: 1, to: 0.25 }, duration: 550, yoyo: true, repeat: -1 });
}

function restart(scene) {
  if (scene._dashText) { scene._dashText.destroy(); scene._dashText = null; }
  if (scene._countText) { scene._countText.destroy(); scene._countText = null; }

  waves = []; particles = []; gameOver = false;
  player.x = 400; player.y = 450; player.dashing = false; player.cdT = 0; player.invT = 0;
  hue = 200; beatPulse = 0; bgPulse = 0; sidechain = 0; lastSafeAngle = null;
  timeSurvived = 0; phase = 0; phaseTimer = 0; speedMul = 1;
  MAX_WAVES = 6; GAP_SIZE_MIN = 0.65; GAP_SIZE_MAX = 1.10; GAP_TOTAL_MIN = Math.PI * 0.8;
  starting = true; startTimer = 3.0; firstSpawnPending = true;
  updateInfoBanner();
  timeText.setText('Tiempo: 0.00 s');

  scene.scene.restart();
}

// -------------------- Leaderboard --------------------
function saveLeaderboard(t) {
  topTimes.push(t);
  topTimes.sort((a,b)=>b-a);
  topTimes = topTimes.slice(0,3); // TOP 3
  try { localStorage.setItem(LB_KEY, JSON.stringify(topTimes)); } catch {}
}

// -------------------- Partículas --------------------
function spawnBurst(x, y, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 80 + Math.random() * 140;
    particles.push({
      x, y, dx: Math.cos(a) * sp, dy: Math.sin(a) * sp,
      life: 0.35 + Math.random()*0.25,
      col: Phaser.Display.Color.HSLToColor(hue / 360, 1, 0.6).color
    });
  }
}

// -------------------- Música (Web Audio) --------------------
function envGain(node, start, a = 0.004, d = 0.18, peak = 0.18, end = 0.0008) {
  node.gain.setValueAtTime(0.0001, start);
  node.gain.linearRampToValueAtTime(peak, start + a);
  node.gain.exponentialRampToValueAtTime(end, start + a + d);
}
function kick(when) {
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(120, when);
  o.frequency.exponentialRampToValueAtTime(45, when + 0.12);
  envGain(g, when, 0.001, 0.12, 0.55, 0.0007);
  o.connect(g); g.connect(AC.destination);
  o.start(when); o.stop(when + 0.14);
}
function clap(when) {
  const n = AC.createBufferSource(), b = AC.createBuffer(1, 6000, 44100), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  n.buffer = b; const g = AC.createGain();
  envGain(g, when, 0.001, 0.10, 0.25, 0.0007);
  n.connect(g); g.connect(AC.destination);
  n.start(when); n.stop(when + 0.11);
}
function hihat(when) {
  const n = AC.createBufferSource(), b = AC.createBuffer(1, 2205, 44100), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);
  n.buffer = b;
  const hp = AC.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 6500;
  const g = AC.createGain(); envGain(g, when, 0.001, 0.05, 0.12, 0.0005);
  n.connect(hp); hp.connect(g); g.connect(AC.destination);
  n.start(when); n.stop(when + 0.06);
}
function bass(when, freq) {
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = 'square'; o.frequency.value = freq;
  envGain(g, when, 0.004, 0.22, 0.12, 0.0008);
  o.connect(g); g.connect(AC.destination);
  o.start(when); o.stop(when + 0.23);
}
function arp(scene, when, barIdx) {
  const seq = [440, 523.25, 659.25, 523.25];
  const f = seq[barIdx % seq.length];
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = 'sawtooth'; o.frequency.value = f;
  envGain(g, when, 0.002, 0.16, 0.08, 0.0008);
  const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800 + Math.random() * 800;
  o.connect(lp); lp.connect(g); g.connect(AC.destination);
  o.start(when); o.stop(when + 0.2);
}
function playBeep(sceneLike, f, d, v = 0.1) {
  const snd = sceneLike && sceneLike.sound;
  if (!snd || !snd.context) return;
  const ctx = snd.context;
  try {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o.frequency.value = f;
    g.gain.setValueAtTime(v, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + d);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + d);
  } catch(e) {}
}
function playNoise(scene, d = 0.1, v = 0.2) {
  const ctx = scene.sound.context;
  const n = ctx.createBufferSource(), b = ctx.createBuffer(1, Math.floor(d * 44100), 44100), data = b.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  n.buffer = b; const g = ctx.createGain(); g.gain.setValueAtTime(v, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + d);
  n.connect(g); g.connect(ctx.destination); n.start(); n.stop(ctx.currentTime + d);
}
