// Infinity Rooms — juego arcade procedural para el desafío Platanus Hack 25

const VIEW_W = 800;
const VIEW_H = 600;
const TILE = 40;
const ROOM_COLS = 16;
const ROOM_ROWS = 12;
const ROOM_W = ROOM_COLS * TILE;
const ROOM_H = ROOM_ROWS * TILE;
const ROOM_X = (VIEW_W - ROOM_W) / 2;
const ROOM_Y = (VIEW_H - ROOM_H) / 2;
const ENTRY_ENERGY = 100;

const config = {
  type: Phaser.AUTO,
  width: VIEW_W,
  height: VIEW_H,
  backgroundColor: '#0b0f1a',
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);

function preload() {}

function create() {
  this.cameras.main.setRoundPixels(true);
  this.layers = {
    floor: this.add.graphics(),
    entities: this.add.graphics()
  };
  this.banner = this.add.text(VIEW_W / 2, 36, '', {
    fontFamily: 'monospace',
    fontSize: 22,
    color: '#9cfaff',
    align: 'center'
  }).setOrigin(0.5).setAlpha(0);
  this.hud = this.add.text(24, VIEW_H - 120, '', {
    fontFamily: 'monospace',
    fontSize: 18,
    color: '#f4f9ff',
    lineSpacing: 8
  });
  this.tip = this.add.text(VIEW_W - 260, VIEW_H - 140, '', {
    fontFamily: 'monospace',
    fontSize: 16,
    color: '#d5faff',
    align: 'right',
    wordWrap: { width: 220 }
  }).setOrigin(1, 1);

  this.timeScale = 1;
  this.controls = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,ENTER');

  this.state = {
    seed: Date.now() % 100000,
    index: 0,
    difficulty: 1,
    roomsCleared: 0,
    orbsTaken: 0,
    hitsTaken: 0,
    bestStreak: 0,
    currentStreak: 0
  };

  this.player = {
    x: ROOM_X + ROOM_W / 2,
    y: ROOM_Y + ROOM_H / 2,
    size: TILE * 0.55,
    speed: 180,
    energy: ENTRY_ENERGY,
    hitCooldown: 0
  };

  this.room = null;
  this.bannerTimer = 0;
  createGradientFloor(this.layers.floor);

  startRoom(this, null);
  updateHUD(this);
  updateTip(this);
}

function update(_, delta) {
  const dt = (delta / 1000) * this.timeScale;
  if (!this.room) return;

  handleInput(this, dt);
  updateHazards(this, dt);
  updateOrbs(this);
  renderEntities(this);
  updateHUD(this);
  updateBanner(this, dt);
}

function handleInput(scene, dt) {
  const speed = scene.player.speed;
  const dx = (isDown(scene, 'D') || isDown(scene, 'RIGHT') ? 1 : 0) - (isDown(scene, 'A') || isDown(scene, 'LEFT') ? 1 : 0);
  const dy = (isDown(scene, 'S') || isDown(scene, 'DOWN') ? 1 : 0) - (isDown(scene, 'W') || isDown(scene, 'UP') ? 1 : 0);
  let vx = dx;
  let vy = dy;
  if (vx && vy) {
    const inv = 1 / Math.sqrt(2);
    vx *= inv;
    vy *= inv;
  }
  if (vx || vy) {
    const nextX = scene.player.x + vx * speed * dt;
    const nextY = scene.player.y + vy * speed * dt;
    if (!blocked(scene, nextX, scene.player.y)) scene.player.x = Phaser.Math.Clamp(nextX, ROOM_X + TILE * 0.5, ROOM_X + ROOM_W - TILE * 0.5);
    if (!blocked(scene, scene.player.x, nextY)) scene.player.y = Phaser.Math.Clamp(nextY, ROOM_Y + TILE * 0.5, ROOM_Y + ROOM_H - TILE * 0.5);
  }
  scene.player.hitCooldown = Math.max(0, scene.player.hitCooldown - dt);

  const door = detectDoor(scene);
  if (door && scene.room.orbs.length === 0) {
    advanceRoom(scene, door);
  } else if (door && scene.room.orbs.length > 0) {
    showBanner(scene, 'Recolecta todos los destellos para desbloquear la cámara siguiente');
  }
}

function blocked(scene, worldX, worldY) {
  const col = Math.floor((worldX - ROOM_X) / TILE);
  const row = Math.floor((worldY - ROOM_Y) / TILE);
  const grid = scene.room.grid;
  if (col < 0 || row < 0 || col >= ROOM_COLS || row >= ROOM_ROWS) return true;
  return grid[row][col] === 1;
}

function updateHazards(scene, dt) {
  const hazards = scene.room.hazards;
  const px = scene.player.x;
  const py = scene.player.y;
  for (let i = 0; i < hazards.length; i++) {
    const hz = hazards[i];
    hz.timer += dt;
    while (hz.timer > hz.period) hz.timer -= hz.period;
    hz.active = hz.timer < hz.activeWindow;
    if (!hz.active) continue;
    const cx = ROOM_X + hz.col * TILE + TILE / 2;
    const cy = ROOM_Y + hz.row * TILE + TILE / 2;
    const dist = Phaser.Math.Distance.Between(px, py, cx, cy);
    if (dist < TILE * 0.45 && scene.player.hitCooldown <= 0) {
      scene.player.energy = Math.max(0, scene.player.energy - 34);
      scene.player.hitCooldown = 0.9;
      scene.state.hitsTaken++;
      scene.state.currentStreak = 0;
      showBanner(scene, 'Impacto de dron. Reajusta tu ritmo.');
      if (scene.player.energy === 0) {
        resetEnergy(scene);
      }
    }
  }
}

function updateOrbs(scene) {
  const orbs = scene.room.orbs;
  if (!orbs.length) return;
  const px = scene.player.x;
  const py = scene.player.y;
  for (let i = orbs.length - 1; i >= 0; i--) {
    const orb = orbs[i];
    const cx = ROOM_X + orb.col * TILE + TILE / 2;
    const cy = ROOM_Y + orb.row * TILE + TILE / 2;
    if (Phaser.Math.Distance.Between(px, py, cx, cy) < TILE * 0.4) {
      orbs.splice(i, 1);
      scene.state.orbsTaken++;
      scene.player.energy = Math.min(ENTRY_ENERGY, scene.player.energy + 12);
      scene.state.currentStreak++;
      scene.state.bestStreak = Math.max(scene.state.bestStreak, scene.state.currentStreak);
      if (orbs.length === 0) {
        showBanner(scene, 'Puertas liberadas. Explora la siguiente cámara.');
      } else {
        showBanner(scene, `${orbs.length} destellos por capturar`);
      }
    }
  }
}

function renderEntities(scene) {
  const g = scene.layers.entities;
  g.clear();
  drawDoors(scene, g);
  drawHazards(scene, g);
  drawOrbs(scene, g);
  drawPlayer(scene, g);
}

function drawPlayer(scene, g) {
  const size = scene.player.size;
  g.fillStyle(0x4ff4ff, 0.9);
  g.fillRoundedRect(scene.player.x - size / 2, scene.player.y - size / 2, size, size, size * 0.28);
  g.lineStyle(2, 0xffffff, 0.5);
  g.strokeRoundedRect(scene.player.x - size / 2, scene.player.y - size / 2, size, size, size * 0.28);
  const pulse = 0.3 + 0.2 * Math.sin(scene.time.now * 0.005);
  g.fillStyle(0x9effff, pulse);
  g.fillCircle(scene.player.x, scene.player.y, size * 0.58);
}

function drawOrbs(scene, g) {
  const orbs = scene.room.orbs;
  for (let i = 0; i < orbs.length; i++) {
    const orb = orbs[i];
    const cx = ROOM_X + orb.col * TILE + TILE / 2;
    const cy = ROOM_Y + orb.row * TILE + TILE / 2;
    const glow = 0.2 + 0.2 * Math.sin((scene.time.now / 200) + i);
    g.fillStyle(0xffe066, 0.4 + glow);
    g.fillCircle(cx, cy, TILE * (0.25 + glow));
    g.fillStyle(0xfff6a8, 1);
    g.fillCircle(cx, cy, TILE * 0.2);
  }
}

function drawHazards(scene, g) {
  const hazards = scene.room.hazards;
  for (let i = 0; i < hazards.length; i++) {
    const hz = hazards[i];
    const cx = ROOM_X + hz.col * TILE + TILE / 2;
    const cy = ROOM_Y + hz.row * TILE + TILE / 2;
    const base = hz.active ? 0xff4d6d : 0x7346ff;
    g.fillStyle(base, hz.active ? 0.95 : 0.4);
    g.fillPolygon([
      cx, cy - TILE * 0.32,
      cx + TILE * 0.26, cy + TILE * 0.16,
      cx - TILE * 0.26, cy + TILE * 0.16
    ]);
    g.lineStyle(2, 0x111a3b, 0.6);
    g.strokeCircle(cx, cy, TILE * 0.34);
  }
}

function drawDoors(scene, g) {
  const doors = scene.room.doors;
  for (let i = 0; i < doors.length; i++) {
    const door = doors[i];
    const cx = ROOM_X + door.col * TILE + TILE / 2;
    const cy = ROOM_Y + door.row * TILE + TILE / 2;
    const unlocked = scene.room.orbs.length === 0 || door.dir === scene.room.entryDir;
    const color = unlocked ? 0x41ffb0 : 0x225064;
    g.lineStyle(4, color, 0.7);
    g.strokeRect(cx - TILE * 0.35, cy - TILE * 0.35, TILE * 0.7, TILE * 0.7);
    if (unlocked) {
      g.fillStyle(color, 0.3);
      g.fillEllipse(cx, cy, TILE * 0.8, TILE * 0.8);
    }
  }
}

function updateHUD(scene) {
  const energy = Math.round(scene.player.energy);
  const rooms = scene.state.roomsCleared;
  const difficulty = scene.state.difficulty;
  const remaining = scene.room ? scene.room.orbs.length : 0;
  scene.hud.setText(
    `Salas superadas: ${rooms}\n` +
    `Energía: ${energy}%\n` +
    `Destellos restantes: ${remaining}\n` +
    `Riesgo dinámico: ${difficulty}\n` +
    `Racha actual: ${scene.state.currentStreak} • Mejor racha: ${scene.state.bestStreak}`
  );
}

function updateTip(scene) {
  scene.tip.setText(
    'Controles: WASD o flechas para moverte.\n' +
    'Recolecta todos los destellos para desbloquear las puertas.\n' +
    'Evita drones de contención; te drenan energía.\n' +
    'Mantén la racha para subir tu multiplicador invisible.'
  );
}

function updateBanner(scene, dt) {
  if (scene.bannerTimer > 0) {
    scene.bannerTimer -= dt;
    scene.banner.setAlpha(Math.min(1, scene.bannerTimer));
    if (scene.bannerTimer <= 0) {
      scene.bannerTimer = 0;
      scene.banner.setAlpha(0);
    }
  }
}

function showBanner(scene, text) {
  scene.banner.setText(text);
  scene.banner.setAlpha(1);
  scene.bannerTimer = 2.5;
}

function resetEnergy(scene) {
  scene.player.energy = ENTRY_ENERGY;
  scene.player.x = ROOM_X + scene.room.entryCol * TILE + TILE / 2;
  scene.player.y = ROOM_Y + scene.room.entryRow * TILE + TILE / 2;
  showBanner(scene, 'Energía restaurada. Intenta de nuevo la cámara.');
}

function detectDoor(scene) {
  const px = scene.player.x;
  const py = scene.player.y;
  const doors = scene.room.doors;
  for (let i = 0; i < doors.length; i++) {
    const door = doors[i];
    const cx = ROOM_X + door.col * TILE + TILE / 2;
    const cy = ROOM_Y + door.row * TILE + TILE / 2;
    if (Phaser.Math.Distance.Between(px, py, cx, cy) < TILE * 0.5) {
      return door;
    }
  }
  return null;
}

function advanceRoom(scene, door) {
  scene.state.roomsCleared++;
  scene.state.difficulty = Math.min(10, 1 + Math.floor(scene.state.roomsCleared / 2));
  scene.state.index++;
  startRoom(scene, door.dir);
  showBanner(scene, `Sala ${scene.state.roomsCleared}. Dificultad ${scene.state.difficulty}`);
}

function startRoom(scene, entryDir) {
  const roomSeed = scene.state.seed + scene.state.index * 9973;
  scene.room = buildRoom(roomSeed, entryDir, scene.state.difficulty);
  scene.player.x = ROOM_X + scene.room.entryCol * TILE + TILE / 2;
  scene.player.y = ROOM_Y + scene.room.entryRow * TILE + TILE / 2;
  scene.player.energy = Math.min(scene.player.energy, ENTRY_ENERGY);
  scene.player.hitCooldown = 0;
  drawRoom(scene);
  renderEntities(scene);
}

function drawRoom(scene) {
  const g = scene.layers.floor;
  g.clear();
  g.fillStyle(0x121d34, 0.95);
  g.fillRect(ROOM_X - 20, ROOM_Y - 20, ROOM_W + 40, ROOM_H + 40);
  g.lineStyle(4, 0x1f3d5d, 0.8);
  g.strokeRect(ROOM_X - 20, ROOM_Y - 20, ROOM_W + 40, ROOM_H + 40);
  for (let r = 0; r < ROOM_ROWS; r++) {
    for (let c = 0; c < ROOM_COLS; c++) {
      const tile = scene.room.grid[r][c];
      const x = ROOM_X + c * TILE;
      const y = ROOM_Y + r * TILE;
      const isDark = (r + c) % 2 === 0;
      g.fillStyle(isDark ? 0x0e1526 : 0x101a2b, 0.9);
      g.fillRect(x, y, TILE, TILE);
      if (tile === 1) {
        g.fillStyle(0x1f3658, 0.85);
        g.fillRect(x, y, TILE, TILE);
        g.fillStyle(0x2f4d7d, 0.6);
        g.fillRect(x + 6, y + 6, TILE - 12, TILE - 12);
      }
    }
  }
}

function buildRoom(seed, entryDir, difficulty) {
  const rng = makeRNG(seed);
  const grid = [];
  for (let r = 0; r < ROOM_ROWS; r++) {
    const row = [];
    for (let c = 0; c < ROOM_COLS; c++) {
      const border = r === 0 || c === 0 || r === ROOM_ROWS - 1 || c === ROOM_COLS - 1;
      row.push(border ? 1 : 0);
    }
    grid.push(row);
  }

  const doors = createDoors(entryDir);
  for (let i = 0; i < doors.length; i++) {
    const door = doors[i];
    grid[door.row][door.col] = 0;
    if (door.row - 1 >= 0) grid[door.row - 1][door.col] = 0;
    if (door.row + 1 < ROOM_ROWS) grid[door.row + 1][door.col] = 0;
    if (door.col - 1 >= 0) grid[door.row][door.col - 1] = 0;
    if (door.col + 1 < ROOM_COLS) grid[door.row][door.col + 1] = 0;
  }

  const inserts = Phaser.Math.Clamp(Math.floor(10 + difficulty * 4), 10, 40);
  for (let i = 0; i < inserts; i++) {
    const c = Math.floor(rng() * ROOM_COLS);
    const r = Math.floor(rng() * ROOM_ROWS);
    if (grid[r][c] === 0) {
      grid[r][c] = 1;
      if (rng() > 0.6 && r + 1 < ROOM_ROWS - 1) grid[r + 1][c] = 1;
      if (rng() > 0.6 && c + 1 < ROOM_COLS - 1) grid[r][c + 1] = 1;
    }
  }

  carvePaths(grid, doors, rng);

  const orbCount = Phaser.Math.Clamp(3 + difficulty, 3, 12);
  const orbs = [];
  while (orbs.length < orbCount) {
    const col = Phaser.Math.Between(2, ROOM_COLS - 3);
    const row = Phaser.Math.Between(2, ROOM_ROWS - 3);
    if (grid[row][col] === 0 && !doorTile(doors, col, row) && !existsIn(orbs, col, row)) {
      orbs.push({ col, row });
    }
  }

  const hazardCount = Phaser.Math.Clamp(Math.floor(2 + difficulty * 1.5), 2, 14);
  const hazards = [];
  while (hazards.length < hazardCount) {
    const col = Phaser.Math.Between(1, ROOM_COLS - 2);
    const row = Phaser.Math.Between(1, ROOM_ROWS - 2);
    if (grid[row][col] === 0 && !doorTile(doors, col, row) && !existsIn(orbs, col, row)) {
      hazards.push({
        col,
        row,
        period: 1.5 + rng() * (3 + difficulty * 0.4),
        activeWindow: 0.6 + rng() * 0.4,
        timer: rng() * 3,
        active: false
      });
    }
  }

  const entryDoor = doors.find(d => d.dir === (entryDir ? entryDir : 'S'));
  const entryCol = entryDoor ? entryDoor.col : Math.floor(ROOM_COLS / 2);
  const entryRow = entryDoor ? entryDoor.row + (entryDoor.dir === 'N' ? 1 : entryDoor.dir === 'S' ? -1 : 0) : ROOM_ROWS - 2;

  return {
    grid,
    doors,
    orbs,
    hazards,
    entryCol,
    entryRow,
    entryDir: entryDir ? opposite(entryDir) : 'S'
  };
}

function createDoors(entryDir) {
  const midCol = Math.floor(ROOM_COLS / 2);
  const midRow = Math.floor(ROOM_ROWS / 2);
  const base = [
    { dir: 'N', col: midCol, row: 0 },
    { dir: 'S', col: midCol, row: ROOM_ROWS - 1 },
    { dir: 'W', col: 0, row: midRow },
    { dir: 'E', col: ROOM_COLS - 1, row: midRow }
  ];
  if (!entryDir) return base;
  const doors = base.filter(d => d.dir !== opposite(entryDir));
  doors.push(base.find(d => d.dir === opposite(entryDir)));
  return doors;
}

function carvePaths(grid, doors, rng) {
  const targets = [];
  for (let i = 0; i < doors.length; i++) {
    const door = doors[i];
    targets.push({ col: door.col, row: door.row });
  }
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    const startCol = Math.floor(ROOM_COLS / 2);
    const startRow = Math.floor(ROOM_ROWS / 2);
    let col = startCol;
    let row = startRow;
    while (col !== target.col || row !== target.row) {
      if (grid[row][col] === 1) grid[row][col] = 0;
      if (rng() > 0.5) col += Math.sign(target.col - col);
      else row += Math.sign(target.row - row);
      if (col < 1) col = 1;
      if (row < 1) row = 1;
      if (col >= ROOM_COLS - 1) col = ROOM_COLS - 2;
      if (row >= ROOM_ROWS - 1) row = ROOM_ROWS - 2;
    }
  }
}

function existsIn(list, col, row) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].col === col && list[i].row === row) return true;
  }
  return false;
}

function doorTile(doors, col, row) {
  for (let i = 0; i < doors.length; i++) {
    if (doors[i].col === col && doors[i].row === row) return true;
  }
  return false;
}

function makeRNG(seed) {
  let s = seed || 12345;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function isDown(scene, key) {
  const keyObj = scene.controls[key];
  return keyObj ? keyObj.isDown : false;
}

function opposite(dir) {
  if (dir === 'N') return 'S';
  if (dir === 'S') return 'N';
  if (dir === 'E') return 'W';
  if (dir === 'W') return 'E';
  return dir;
}

function createGradientFloor(g) {
  const steps = 6;
  for (let i = 0; i < steps; i++) {
    const alpha = 0.18 - i * 0.02;
    if (alpha <= 0) continue;
    g.fillStyle(0x102039, alpha);
    const inset = i * 16;
    g.fillRect(ROOM_X - 40 + inset, ROOM_Y - 40 + inset, ROOM_W + 80 - inset * 2, ROOM_H + 80 - inset * 2);
  }
}

