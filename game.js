// Duelo Rítmico: 2 jugadores - estilo Guitar Hero (compacto)
const cfg = { type: Phaser.AUTO, width: 800, height: 600, backgroundColor: '#081017', scene: { create: create, update: update } };
const game = new Phaser.Game(cfg);

let g, notes1 = [], notes2 = [], lanes = 4, laneW, hitY = 520, speed = 220, spawnRate = 420, score1 = 0, score2 = 0, running = true, timerText, scoreText1, scoreText2, endText;
// leadTimer acumula ms durante los cuales la diferencia absoluta > leadThreshold
let leadTimer = 0;
const leadThreshold = 2000; // puntos
const leadDuration = 30000; // ms (30s)
let difficultyMultiplier = 1.0;
let labelTexts1 = [];
let labelTexts2 = [];
function create() {
  const s = this;
  // reset runtime state (useful when scene restarts)
  notes1 = [];
  notes2 = [];
  score1 = 0; score2 = 0;
  speed = 220;
  spawnRate = 420;
  difficultyMultiplier = 1.0;
  leadTimer = 0;
  running = true;
  g = s.add.graphics();
  laneW = cfg.width / 2 / lanes;

  // UI
  scoreText1 = s.add.text(16, 16, 'P1: 0', { font: '20px Arial', fill: '#66ff66' });
  scoreText2 = s.add.text(800 - 16, 16, 'P2: 0', { font: '20px Arial', fill: '#66b3ff' }).setOrigin(1, 0);
  // place title at top and difficulty text slightly below it
  timerText = s.add.text(400, 80, 'Diff x1.00', { font: '20px Arial', fill: '#ffffff' }).setOrigin(0.5, 0);

  // Hit guides
  s.input.keyboard.on('keydown', (ev) => { if (!running) { if (ev.key.toLowerCase() === 'r') s.scene.restart(); return; } handleKey(ev.key); });

  // dynamic spawn scheduling (uses current spawnRate so we can change it)
  function scheduleSpawn() {
    s.time.delayedCall(spawnRate, () => { spawn(notes1, 0); spawn(notes2, 1); scheduleSpawn(); });
  }
  scheduleSpawn();

  // every 30s increase difficulty: speed * 1.2 and more notes (spawnRate /= 1.2)
  s.time.addEvent({
    delay: 30000, loop: true, callback: () => {
      speed = Math.round(speed * 1.2);
      spawnRate = Math.max(50, Math.floor(spawnRate / 1.2));
      difficultyMultiplier *= 1.2;
      timerText.setText('Diff x' + difficultyMultiplier.toFixed(2));
    }
  });

  // Title at top
  s.add.text(400, 30, 'DUEL RHYTHM', { font: '28px Arial', fill: '#ffd966' }).setOrigin(0.5, 0.5);

  // Bottom lane key labels for each player
  const keysP1 = ['A', 'S', 'D', 'F'];
  const keysP2 = ['H', 'J', 'K', 'L'];
  const labelY = cfg.height - 40;
  for (let i = 0; i < lanes; i++) {
    const x1 = i * laneW + laneW / 2;
    labelTexts1[i] = s.add.text(x1, labelY, keysP1[i], { font: '18px Arial', fill: '#99ff99' }).setOrigin(0.5, 0.5);
    const x2 = cfg.width / 2 + i * laneW + laneW / 2;
    labelTexts2[i] = s.add.text(x2, labelY, keysP2[i], { font: '18px Arial', fill: '#99ddff' }).setOrigin(0.5, 0.5);
  }
}

function spawn(arr, side) {
  // side 0 left, 1 right
  if (!running) return;
  if (Math.random() > 0.75) return; // sparse notes
  const lane = Math.floor(Math.random() * lanes);
  const x = (side === 0 ? 0 : cfg.width / 2) + lane * laneW + laneW / 2 - 12;
  arr.push({ x: x, y: -30, lane: lane, side: side, hit: false });
}

function update(_, dt) {
  const scene = this;
  if (!g) return;
  if (!running) return;
  const s = dt / 1000;
  // move notes
  [notes1, notes2].forEach(arr => { for (let i = arr.length - 1; i >= 0; i--) { arr[i].y += speed * s; if (arr[i].y > cfg.height + 50) arr.splice(i, 1); } });

  // comprobar ventaja sostenida
  const diff = Math.abs(score1 - score2);
  if (diff > leadThreshold) {
    leadTimer += dt;
    if (leadTimer >= leadDuration) {
      endSong(scene);
      return;
    }
  } else {
    leadTimer = 0;
  }

  draw();
}

function draw() {
  g.clear();
  // background lanes
  for (let side = 0; side < 2; side++) {
    const baseX = side === 0 ? 0 : cfg.width / 2;
    for (let i = 0; i < lanes; i++) {
      const x = baseX + i * laneW;
      g.fillStyle(0x0b2540, 1); g.fillRect(x, 60, laneW - 4, cfg.height - 140);
      g.lineStyle(2, 0x163b54, 1); g.strokeRect(x, 60, laneW - 4, cfg.height - 140);
    }
    // draw hit line
    g.fillStyle(side === 0 ? 0x113322 : 0x112233, 0.25); g.fillRect(baseX, hitY, cfg.width / 2, 6);
  }

  // notes
  notes1.forEach(n => { g.fillStyle(0xffcc33, 1); g.fillRect(n.x, n.y, 24, 20); });
  notes2.forEach(n => { g.fillStyle(0x66ccff, 1); g.fillRect(n.x, n.y, 24, 20); });
}

function handleKey(k) {
  const key = k.toLowerCase();
  // P1: a s d f -> lanes 0..3
  const map1 = { a: 0, s: 1, d: 2, f: 3 };
  // P2: h j k l -> lanes 0..3 (changed per request)
  const map2 = { h: 0, j: 1, k: 2, l: 3 };
  if (map1[key] !== undefined) checkHit(notes1, map1[key], 0);
  else if (map2[key] !== undefined) checkHit(notes2, map2[key], 1);
}

function checkHit(arr, lane, side) {
  // find closest note in lane
  let bestI = -1, bestDist = 1e9;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].lane !== lane) continue;
    const d = Math.abs(arr[i].y - hitY);
    if (d < bestDist) { bestDist = d; bestI = i; }
  }
  if (bestI === -1) return; // no note
  const acc = bestDist;
  if (acc < 40) { // hit
    const perfect = acc < 12;
    const points = perfect ? 100 : 50;
    if (side === 0) score1 += points; else score2 += points;
    playToneForSide(side, perfect ? 880 : 660, 0.08);
    if (side === 0) scoreText1.setText('P1: ' + score1); else scoreText2.setText('P2: ' + score2);
    arr.splice(bestI, 1);
  } else {
    // miss feedback
    playToneForSide(side, 220, 0.12);
  }
}

function endSong(s) {
  // evitar ejecutar dos veces
  if (!running) return;
  running = false; const overlay = s.add.graphics(); overlay.fillStyle(0x000000, 0.6); overlay.fillRect(0, 0, cfg.width, cfg.height);
  const winner = score1 === score2 ? 'TIE' : (score1 > score2 ? 'PLAYER 1 WINS' : 'PLAYER 2 WINS');
  endText = s.add.text(cfg.width / 2, 270, winner, { font: '40px Arial', fill: '#ffffff' }).setOrigin(0.5);
  s.add.text(cfg.width / 2, 330, 'P1: ' + score1 + '   P2: ' + score2, { font: '26px Arial', fill: '#ffd966' }).setOrigin(0.5);
  s.add.text(cfg.width / 2, 390, 'Press R to Restart', { font: '20px Arial', fill: '#99ff99' }).setOrigin(0.5);
  playToneForSide(0, 440, 0.2); playToneForSide(1, 330, 0.2);
  // also accept R key to restart (once) — ensures restart works after game over
  s.input.keyboard.once('keydown', (ev) => { if (ev.key && ev.key.toLowerCase() === 'r') s.scene.restart(); });
}

function playToneForSide(side, f, dur) {
  // use global game sound context
  try {
    const ctx = game.sound.context; const o = ctx.createOscillator(); const gnode = ctx.createGain();
    o.connect(gnode); gnode.connect(ctx.destination); o.type = 'square'; o.frequency.value = f; gnode.gain.setValueAtTime(0.08, ctx.currentTime);
    gnode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.start(ctx.currentTime); o.stop(ctx.currentTime + dur);
  } catch (e) { }
}
