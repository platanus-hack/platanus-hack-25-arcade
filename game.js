// Duelo Rítmico: 2 jugadores - estilo Guitar Hero (compacto)
const menuScene = {
  key: 'Menu',
  create: function () {
    const s = this;
    s.add.text(400, 200, 'DUEL RHYTHM', { font: '48px Arial', fill: '#ffd966' }).setOrigin(0.5);
    s.add.text(400, 300, 'Press SPACE to Start (2 Players)', { font: '24px Arial', fill: '#ffffff' }).setOrigin(0.5);
    s.add.text(400, 350, 'Press ENTER for Single Player', { font: '20px Arial', fill: '#ffffff' }).setOrigin(0.5);
    s.input.keyboard.on('keydown-SPACE', () => {
      singlePlayer = false;
      s.scene.start('Game');
    });
    s.input.keyboard.on('keydown-ENTER', () => {
      singlePlayer = true;
      s.scene.start('Game');
    });
  }
};

const gameScene = {
  key: 'Game',
  create: gameCreate,
  update: gameUpdate
};

const cfg = { type: Phaser.AUTO, width: 800, height: 600, backgroundColor: '#081017', scene: [menuScene, gameScene] };
const game = new Phaser.Game(cfg);

let g, notes1 = [], notes2 = [], lanes = 4, laneW, hitY = 520, speed = 220, spawnRate = 420, score1 = 0, score2 = 0, running = true, timerText, scoreText1, scoreText2, endText;
// leadTimer acumula ms durante los cuales la diferencia absoluta > leadThreshold
let leadTimer = 0;
const leadThreshold = 2000; // puntos
const leadDuration = 30000; // ms (30s)
let difficultyMultiplier = 1.0;
// visual note size
let noteWidth = 64;
let labelTexts1 = [];
let labelTexts2 = [];
// separator between players
const separatorWidth = 36;
let halfWidth;
// key states for simultaneous presses
let keysDown = {};
// base probability for multi-notes
const baseMultiProb = 0.1;
// game mode
let singlePlayer = false;
function gameCreate() {
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
  halfWidth = (cfg.width - separatorWidth) / 2;
  laneW = halfWidth / lanes;

  // UI
  scoreText1 = s.add.text(16, 16, 'P1: 0', { font: '20px Arial', fill: '#66ff66' });
  if (!singlePlayer) {
    scoreText2 = s.add.text(800 - 16, 16, 'P2: 0', { font: '20px Arial', fill: '#66b3ff' }).setOrigin(1, 0);
  }
  // place title at top and difficulty text slightly below it
  timerText = s.add.text(400, 80, 'Diff x1.00', { font: '20px Arial', fill: '#ffffff' }).setOrigin(0.5, 0);

  // Hit guides
  s.input.keyboard.on('keydown', (ev) => {
    if (!running) { if (ev.key.toLowerCase() === 'r') s.scene.restart(); return; }
    keysDown[ev.key.toLowerCase()] = true;
    handleKey(ev.key);
  });
  s.input.keyboard.on('keyup', (ev) => {
    keysDown[ev.key.toLowerCase()] = false;
  });

  // Allow returning to menu with ESC
  s.input.keyboard.on('keydown-ESC', () => {
    s.scene.start('Menu');
  });

  // dynamic spawn scheduling (uses current spawnRate so we can change it)
  function scheduleSpawn() {
    s.time.delayedCall(spawnRate, () => {
      if (Math.random() < 0.75) {
        const isMulti = Math.random() < baseMultiProb * difficultyMultiplier;
        if (isMulti) {
          let count = 2;
          if (Math.random() < baseMultiProb * difficultyMultiplier) count = 3;
          spawn(notes1, 0, true, count);
          if (!singlePlayer) spawn(notes2, 1, true, count);
        } else {
          spawn(notes1, 0, false);
          if (!singlePlayer) spawn(notes2, 1, false);
        }
      }
      scheduleSpawn();
    });
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
    if (!singlePlayer) {
      const x2 = halfWidth + separatorWidth + i * laneW + laneW / 2;
      labelTexts2[i] = s.add.text(x2, labelY, keysP2[i], { font: '18px Arial', fill: '#99ddff' }).setOrigin(0.5, 0.5);
    }
  }
}

function spawn(arr, side, isMulti = false, count = 2) {
  // side 0 left, 1 right
  if (!running) return;
  let lanesForNote = [];
  if (isMulti) {
    // use the provided count
    const available = [0, 1, 2, 3];
    for (let i = 0; i < count && available.length > 0; i++) {
      const idx = Math.floor(Math.random() * available.length);
      lanesForNote.push(available.splice(idx, 1)[0]);
    }
  } else {
    // single note
    lanesForNote = [Math.floor(Math.random() * lanes)];
  }
  const baseX = side === 0 ? 0 : halfWidth + separatorWidth;
  // for multi, center on the first lane, but draw each
  const x = baseX + lanesForNote[0] * laneW + laneW / 2 - Math.floor(noteWidth / 2);
  arr.push({ x: x, y: -30, lanes: lanesForNote, side: side, hit: false });
}

function gameUpdate(_, dt) {
  const scene = this;
  if (!g) return;
  if (!running) return;
  const s = dt / 1000;
  // move notes
  [notes1, notes2].forEach(arr => { for (let i = arr.length - 1; i >= 0; i--) { arr[i].y += speed * s; if (arr[i].y > cfg.height + 50) arr.splice(i, 1); } });

  // check hits for multi-notes
  checkMultiHits(notes1, 0);
  if (!singlePlayer) checkMultiHits(notes2, 1);

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
  for (let side = 0; side < (singlePlayer ? 1 : 2); side++) {
    const baseX = side === 0 ? 0 : halfWidth + separatorWidth;
    for (let i = 0; i < lanes; i++) {
      const x = baseX + i * laneW;
      g.fillStyle(0x0b2540, 1); g.fillRect(x, 60, laneW - 4, cfg.height - 140);
      // no stroke to avoid an artifact line
    }
    // draw hit line
    g.fillStyle(side === 0 ? 0x113322 : 0x112233, 0.25); g.fillRect(baseX, hitY, halfWidth, 6);
  }

  // separator lane in the middle (filled only — no stroke to avoid artifact line)
  if (!singlePlayer) {
    g.fillStyle(0x081424, 1); g.fillRect(halfWidth, 60, separatorWidth, cfg.height - 140);
  }

  // aesthetic hit bars for each player's lanes (just below hit line)
  const barY = hitY + 8;
  for (let i = 0; i < lanes; i++) {
    const bx1 = 0 + i * laneW + 4;
    g.fillStyle(0x003300, 0.6); g.fillRect(bx1, barY, Math.max(8, laneW - 8), 10);
    if (!singlePlayer) {
      const bx2 = halfWidth + separatorWidth + i * laneW + 4;
      g.fillStyle(0x002244, 0.6); g.fillRect(bx2, barY, Math.max(8, laneW - 8), 10);
    }
  }

  // notes
  notes1.forEach(n => {
    n.lanes.forEach(lane => {
      const nx = (n.side === 0 ? 0 : halfWidth + separatorWidth) + lane * laneW + laneW / 2 - Math.floor(noteWidth / 2);
      g.fillStyle(0xffcc33, 1); g.fillRect(nx, n.y, noteWidth, 20);
    });
  });
  if (!singlePlayer) {
    notes2.forEach(n => {
      n.lanes.forEach(lane => {
        const nx = (n.side === 0 ? 0 : halfWidth + separatorWidth) + lane * laneW + laneW / 2 - Math.floor(noteWidth / 2);
        g.fillStyle(0x66ccff, 1); g.fillRect(nx, n.y, noteWidth, 20);
      });
    });
  }
}

function checkMultiHits(arr, side) {
  for (let i = arr.length - 1; i >= 0; i--) {
    const n = arr[i];
    if (n.hit) continue;
    const d = Math.abs(n.y - hitY);
    if (d > 30) continue; // slightly less delay, allow a bit early too
    // check if all lanes are pressed
    const map = side === 0 ? { a: 0, s: 1, d: 2, f: 3 } : { h: 0, j: 1, k: 2, l: 3 };
    let allPressed = true;
    for (let lane of n.lanes) {
      let keyPressed = false;
      for (let k in map) {
        if (map[k] === lane && keysDown[k]) {
          keyPressed = true;
          break;
        }
      }
      if (!keyPressed) {
        allPressed = false;
        break;
      }
    }
    if (allPressed) {
      // hit
      const perfect = d < 12;
      const points = perfect ? 100 * n.lanes.length : 50 * n.lanes.length;
      if (side === 0) score1 += points; else score2 += points;
      playToneForSide(side, perfect ? 880 : 660, 0.08);
      if (side === 0) scoreText1.setText('P1: ' + score1); else scoreText2.setText('P2: ' + score2);
      n.hit = true;
      arr.splice(i, 1);
    }
  }
}

function checkHit(arr, lane, side) {
  // removed, now using checkMultiHits
}

function endSong(s) {
  // evitar ejecutar dos veces
  if (!running) return;
  running = false; const overlay = s.add.graphics(); overlay.fillStyle(0x000000, 0.6); overlay.fillRect(0, 0, cfg.width, cfg.height);
  const winner = singlePlayer ? (score1 > 0 ? 'YOU WIN!' : 'GAME OVER') : (score1 === score2 ? 'TIE' : (score1 > score2 ? 'PLAYER 1 WINS' : 'PLAYER 2 WINS'));
  endText = s.add.text(cfg.width / 2, 270, winner, { font: '40px Arial', fill: '#ffffff' }).setOrigin(0.5);
  const scoreText = singlePlayer ? 'Score: ' + score1 : 'P1: ' + score1 + '   P2: ' + score2;
  s.add.text(cfg.width / 2, 330, scoreText, { font: '26px Arial', fill: '#ffd966' }).setOrigin(0.5);
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
