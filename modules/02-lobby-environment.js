// ============ LOBBY ENVIRONMENT ============
// Agent v.02 - Minimal with Banana Stage

const origLobbyCreate = LobbyScene.prototype.create;
LobbyScene.prototype.create = function() {
  if (origLobbyCreate) origLobbyCreate.call(this);
  
  const g = this.add.graphics();
  
  // FLOOR - Premium wood parquet
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 12; j++) {
      const x = i * 50;
      const y = j * 50;
      const shade = ((i + j) % 2) ? 0x3d2817 : 0x4a3520;
      g.fillGradientStyle(shade, shade, shade - 0x0a0a0a, shade - 0x0a0a0a, 1);
      g.fillRect(x, y, 50, 50);
      g.lineStyle(1, 0x2d1810, 0.3);
      for (let k = 0; k < 3; k++) g.lineBetween(x, y + k * 16, x + 50, y + k * 16);
    }
  }
  
  // WALLS with depth
  g.fillGradientStyle(0x2a2a2a, 0x2a2a2a, 0x1a1a1a, 0x1a1a1a, 1);
  g.fillRect(0, 0, 800, 40);
  g.fillRect(0, 0, 40, 600);
  g.fillRect(760, 0, 40, 600);
  
  // === BANANA STAGE (Top-Left) ===
  // Stage platform
  g.fillGradientStyle(0xffaa00, 0xffaa00, 0xdd8800, 0xdd8800, 1);
  g.fillRect(50, 80, 80, 50);
  g.fillStyle(0x000000, 0.3);
  g.fillRect(55, 135, 80, 5);
  
  // Stage title
  this.add.text(90, 60, 'BANANA BAR', { 
    fontSize: '14px', 
    color: '#ffff00', 
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 3
  }).setOrigin(0.5);
  
  // Banana bunch 1 (5 bananas)
  for (let i = 0; i < 5; i++) {
    const bx = 60 + i * 12;
    const by = 95 + Math.random() * 10;
    g.fillGradientStyle(0xffff00, 0xffff00, 0xffdd00, 0xffbb00, 1);
    g.fillEllipse(bx, by, 10, 20);
    g.fillStyle(0xffff99, 0.6);
    g.fillEllipse(bx - 2, by - 5, 4, 10);
    g.fillStyle(0xccaa00, 0.4);
    g.fillEllipse(bx + 2, by + 5, 4, 10);
  }
  g.fillGradientStyle(0x8b4513, 0x8b4513, 0x654321, 0x654321, 1);
  g.fillRect(82, 85, 6, 8);
  
  // Banana bunch 2 (4 bananas)
  for (let i = 0; i < 4; i++) {
    const bx = 95 + i * 10;
    const by = 100 + Math.random() * 8;
    g.fillGradientStyle(0xffff00, 0xffff00, 0xffdd00, 0xffbb00, 1);
    g.fillEllipse(bx, by, 9, 18);
    g.fillStyle(0xffff99, 0.6);
    g.fillEllipse(bx - 2, by - 4, 3, 8);
    g.fillStyle(0xccaa00, 0.4);
    g.fillEllipse(bx + 2, by + 4, 3, 8);
  }
  g.fillGradientStyle(0x8b4513, 0x8b4513, 0x654321, 0x654321, 1);
  g.fillRect(105, 92, 5, 7);
  
  // Stage sign
  g.fillStyle(0xffff00, 1);
  g.fillRect(55, 115, 70, 15);
  g.lineStyle(2, 0xffaa00, 1);
  g.strokeRect(55, 115, 70, 15);
  this.add.text(90, 122, 'FREE FUEL!', { 
    fontSize: '11px', 
    color: '#000', 
    fontStyle: 'bold' 
  }).setOrigin(0.5);
  
  // === WORKSTATIONS (4 desks with computers) ===
  const desks = [
    {x: 200, y: 150}, {x: 400, y: 150},
    {x: 200, y: 350}, {x: 400, y: 350}
  ];
  
  desks.forEach(desk => {
    // Desk
    g.fillGradientStyle(0x8b7355, 0x8b7355, 0x654321, 0x654321, 1);
    g.fillRect(desk.x - 40, desk.y, 80, 50);
    g.fillStyle(0x000000, 0.2);
    g.fillRect(desk.x - 38, desk.y + 48, 80, 4);
    
    // Computer monitor
    g.fillStyle(0x1a1a1a, 1);
    g.fillRect(desk.x - 20, desk.y + 5, 40, 30);
    g.fillGradientStyle(0x00ff00, 0x00ff00, 0x008800, 0x004400, 0.9);
    g.fillRect(desk.x - 18, desk.y + 7, 36, 26);
    
    // Code on screen
    for (let i = 0; i < 4; i++) {
      g.fillStyle(0x00ff00, 0.8);
      g.fillRect(desk.x - 16, desk.y + 10 + i * 5, 20, 2);
    }
    
    // Monitor stand
    g.fillStyle(0x333333, 1);
    g.fillRect(desk.x - 5, desk.y + 35, 10, 8);
    g.fillRect(desk.x - 10, desk.y + 43, 20, 3);
    
    // Keyboard
    g.fillStyle(0x2a2a2a, 1);
    g.fillRect(desk.x - 15, desk.y + 40, 30, 8);
    
    // Coffee cup
    g.fillGradientStyle(0x8b4513, 0x8b4513, 0x654321, 0x654321, 1);
    g.fillRect(desk.x + 20, desk.y + 38, 12, 10);
    g.fillStyle(0x3d2817, 1);
    g.fillEllipse(desk.x + 26, desk.y + 40, 10, 4);
    g.fillStyle(0xffffff, 0.3);
    g.fillCircle(desk.x + 23, desk.y + 41, 2);
  });
  
  // === BEAN BAGS (3 scattered around) ===
  const beanBags = [
    {x: 150, y: 480, color: 0xff0000},
    {x: 650, y: 480, color: 0x0000ff},
    {x: 300, y: 500, color: 0x00ff00}
  ];
  
  beanBags.forEach(bag => {
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(bag.x, bag.y + 15, 50, 15);
    g.fillGradientStyle(bag.color, bag.color, bag.color - 0x333333, bag.color - 0x333333, 1);
    g.fillEllipse(bag.x, bag.y, 50, 35);
    g.fillStyle(0xffffff, 0.2);
    g.fillEllipse(bag.x - 10, bag.y - 8, 15, 10);
  });
  
  // === PLANTS (4 strategically placed) ===
  const plants = [
    {x: 80, y: 250},   // Left wall
    {x: 720, y: 250},  // Right wall
    {x: 500, y: 80},   // Top center
    {x: 500, y: 540}   // Bottom center
  ];
  
  plants.forEach(plant => {
    // Shadow
    g.fillStyle(0x000000, 0.2);
    g.fillEllipse(plant.x, plant.y + 35, 28, 8);
    
    // Terracotta pot with rim
    g.fillGradientStyle(0xc65d3b, 0xc65d3b, 0x8b4513, 0x6b3410, 1);
    g.fillRect(plant.x - 12, plant.y + 15, 24, 20);
    g.fillStyle(0xa0522d, 1);
    g.fillEllipse(plant.x, plant.y + 16, 26, 8);
    g.fillStyle(0xc65d3b, 1);
    g.fillEllipse(plant.x, plant.y + 35, 24, 6);
    
    // Pot rim highlight
    g.fillStyle(0xd4735e, 0.6);
    g.fillEllipse(plant.x - 8, plant.y + 17, 8, 3);
    
    // Soil
    g.fillStyle(0x3d2817, 1);
    g.fillEllipse(plant.x, plant.y + 16, 22, 6);
    
    // Main stem
    g.fillGradientStyle(0x228b22, 0x228b22, 0x1a6b1a, 0x1a6b1a, 1);
    g.fillRect(plant.x - 2, plant.y - 10, 4, 26);
    
    // Realistic leaves with veins
    const leafPositions = [
      {angle: 0, dist: 15, size: 1.0},
      {angle: Math.PI * 0.4, dist: 14, size: 0.9},
      {angle: Math.PI * 0.8, dist: 13, size: 0.85},
      {angle: Math.PI * 1.2, dist: 14, size: 0.9},
      {angle: Math.PI * 1.6, dist: 15, size: 1.0},
      {angle: Math.PI * 0.2, dist: 10, size: 0.7},
      {angle: Math.PI * 1.0, dist: 10, size: 0.7},
      {angle: Math.PI * 1.8, dist: 10, size: 0.7}
    ];
    
    leafPositions.forEach(leaf => {
      const lx = plant.x + Math.cos(leaf.angle) * leaf.dist;
      const ly = plant.y + Math.sin(leaf.angle) * leaf.dist - 5;
      const w = 12 * leaf.size;
      const h = 18 * leaf.size;
      
      // Leaf shadow
      g.fillStyle(0x000000, 0.15);
      g.fillEllipse(lx + 2, ly + 2, w, h);
      
      // Main leaf body
      g.fillGradientStyle(0x32cd32, 0x32cd32, 0x228b22, 0x1a6b1a, 1);
      g.fillEllipse(lx, ly, w, h);
      
      // Leaf highlight
      g.fillStyle(0x90ee90, 0.5);
      g.fillEllipse(lx - w * 0.2, ly - h * 0.2, w * 0.4, h * 0.5);
      
      // Central vein
      g.lineStyle(1, 0x1a6b1a, 0.6);
      g.lineBetween(lx, ly - h * 0.4, lx, ly + h * 0.4);
      
      // Side veins
      for (let v = -0.2; v <= 0.2; v += 0.2) {
        g.lineBetween(lx, ly + h * v, lx + w * 0.3, ly + h * v);
        g.lineBetween(lx, ly + h * v, lx - w * 0.3, ly + h * v);
      }
    });
  });
  
  // === BACKPACKS (4 near desks) ===
  const bags = [
    {x: 170, y: 200}, {x: 370, y: 200},
    {x: 170, y: 400}, {x: 430, y: 400}
  ];
  
  bags.forEach(bag => {
    g.fillStyle(0x000000, 0.3);
    g.fillRect(bag.x - 2, bag.y + 18, 24, 4);
    g.fillGradientStyle(0x333333, 0x333333, 0x1a1a1a, 0x1a1a1a, 1);
    g.fillRect(bag.x, bag.y, 20, 20);
    g.fillStyle(0x555555, 1);
    g.fillRect(bag.x + 2, bag.y + 2, 16, 3);
    g.fillRect(bag.x + 5, bag.y + 7, 10, 10);
    g.fillStyle(0xff0000, 1);
    g.fillCircle(bag.x + 15, bag.y + 5, 3);
  });
  
  // === BATHTUB (Top-Right Corner) ===
  // Bathtub title
  this.add.text(720, 70, '🚿 SHOWER', {
    fontSize: '14px',
    color: '#00aaff',
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 3
  }).setOrigin(0.5);
  
  // Bathtub body
  g.fillGradientStyle(0xffffff, 0xffffff, 0xe0e0e0, 0xc0c0c0, 1);
  g.fillRoundedRect(670, 100, 100, 60, 8);
  
  // Bathtub rim
  g.fillStyle(0xf0f0f0, 1);
  g.fillRoundedRect(668, 98, 104, 8, 4);
  
  // Bathtub legs
  g.fillStyle(0xc0c0c0, 1);
  g.fillCircle(680, 165, 5);
  g.fillCircle(760, 165, 5);
  
  // Bathtub interior (water)
  g.fillGradientStyle(0x87ceeb, 0x87ceeb, 0x4682b4, 0x4682b4, 0.6);
  g.fillRoundedRect(675, 110, 90, 45, 6);
  
  // Water shimmer
  g.fillStyle(0xffffff, 0.3);
  g.fillEllipse(690, 125, 20, 8);
  g.fillEllipse(740, 135, 15, 6);
  
  // Showerhead
  g.fillStyle(0xc0c0c0, 1);
  g.fillRect(718, 85, 4, 15);
  g.fillEllipse(720, 85, 12, 6);
  
  // Shower curtain rod
  g.lineStyle(3, 0xc0c0c0, 1);
  g.lineBetween(665, 90, 775, 90);
  
  // Shower state (off by default)
  this.showerOn = false;
  this.showerTimer = 0;
  this.showerGraphics = this.add.graphics();
  
  // === ARCADE CABINET ===
  g.fillStyle(0x000000, 0.3);
  g.fillRect(555, 365, 100, 10);
  g.fillGradientStyle(0x9900ff, 0x8b00ff, 0x7700dd, 0x6600bb, 1);
  g.fillRect(550, 240, 100, 120);
  g.fillGradientStyle(0x7700dd, 0x7700dd, 0x5500aa, 0x5500aa, 1);
  g.fillRect(645, 245, 8, 115);
  g.fillStyle(0x000000, 1);
  g.fillRect(558, 248, 84, 64);
  g.fillGradientStyle(0x00ffff, 0x00ddff, 0x0088ff, 0x0066ff, 0.8);
  g.fillRect(562, 252, 76, 56);
  for (let s = 252; s < 308; s += 4) {
    g.fillStyle(0x000000, 0.2);
    g.fillRect(562, s, 76, 2);
  }
  g.fillGradientStyle(0x6600bb, 0x6600bb, 0x4400aa, 0x4400aa, 1);
  g.fillRect(555, 312, 90, 48);
  g.fillGradientStyle(0x00ffff, 0x00ffff, 0x00aaaa, 0x008888, 1);
  g.fillCircle(600, 330, 16);
  g.fillStyle(0xffffff, 0.6);
  g.fillCircle(596, 326, 6);
  g.fillStyle(0x000000, 0.4);
  g.fillCircle(604, 334, 6);
  g.fillGradientStyle(0x5500aa, 0x5500aa, 0x330088, 0x330088, 1);
  g.fillRect(545, 360, 110, 8);
  this.add.text(600, 320, 'PRESS', { fontSize: '10px', color: '#ffff00', fontStyle: 'bold' }).setOrigin(0.5);
  
  // Station physics zone
  this.station = this.physics.add.sprite(600, 300, null).setVisible(false);
  this.station.body.setSize(100, 120);
  
  // Banana stage physics zone
  this.bananaStage = this.physics.add.sprite(90, 105, null).setVisible(false);
  this.bananaStage.body.setSize(80, 50);
  
  // === PIZZA STAGE (Top-Right, before bathroom) ===
  // Stage platform
  g.fillGradientStyle(0xff6600, 0xff6600, 0xdd4400, 0xdd4400, 1);
  g.fillRect(670, 220, 80, 50);
  g.fillStyle(0x000000, 0.3);
  g.fillRect(675, 275, 80, 5);
  
  // Stage title
  this.add.text(710, 200, 'PIZZA ZONE', { 
    fontSize: '14px', 
    color: '#ff0000', 
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 3
  }).setOrigin(0.5);
  
  // Pizza slices (3 slices)
  for (let i = 0; i < 3; i++) {
    const px = 680 + i * 25;
    const py = 240;
    
    // Pizza slice (triangle)
    g.fillGradientStyle(0xffcc66, 0xffcc66, 0xddaa44, 0xddaa44, 1);
    g.fillTriangle(px + 10, py, px, py + 20, px + 20, py + 20);
    
    // Crust edge
    g.fillStyle(0xcc9944, 1);
    g.beginPath();
    g.arc(px + 10, py, 3, Math.PI, 0);
    g.fillPath();
    
    // Cheese texture
    g.fillStyle(0xffdd77, 0.6);
    g.fillCircle(px + 8, py + 10, 2);
    g.fillCircle(px + 12, py + 12, 2);
    
    // Pepperoni
    g.fillStyle(0xcc0000, 1);
    g.fillCircle(px + 7, py + 8, 2);
    g.fillCircle(px + 13, py + 10, 2);
    g.fillCircle(px + 10, py + 14, 2);
    
    // Pepperoni highlights
    g.fillStyle(0xff3333, 0.6);
    g.fillCircle(px + 7, py + 7, 1);
    g.fillCircle(px + 13, py + 9, 1);
  }
  
  // Stage sign
  g.fillStyle(0xff6600, 1);
  g.fillRect(675, 255, 70, 15);
  g.lineStyle(2, 0xff0000, 1);
  g.strokeRect(675, 255, 70, 15);
  this.add.text(710, 262, 'HOT & FRESH!', { 
    fontSize: '11px', 
    color: '#fff', 
    fontStyle: 'bold' 
  }).setOrigin(0.5);
  
  // Pizza stage physics zone
  this.pizzaStage = this.physics.add.sprite(710, 245, null).setVisible(false);
  this.pizzaStage.body.setSize(80, 50);
  
  // === UI ===
  this.add.text(400, 20, 'HACKATHON ARCADE LOBBY', {
    fontSize: '24px',
    color: '#00ffff',
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 4
  }).setOrigin(0.5);
  
  this.add.text(400, 580, 'P1: Arrow Keys | P2: WASD | SPACE: Interact', {
    fontSize: '12px',
    color: '#888888'
  }).setOrigin(0.5);
};

// Add shower animation update
const origLobbyUpdateEnv = LobbyScene.prototype.update;
LobbyScene.prototype.update = function(time, delta) {
  if (origLobbyUpdateEnv) origLobbyUpdateEnv.call(this, time, delta);
  
  // Animate shower water droplets only when shower is on
  if (this.showerOn && this.showerGraphics) {
    this.showerGraphics.clear();
    
    // Update timer
    this.showerTimer -= delta;
    if (this.showerTimer <= 0) {
      this.showerOn = false;
      return;
    }
    
    // Draw water droplets
    for (let i = 0; i < 15; i++) {
      const x = 710 + Math.random() * 20;
      const y = 90 + (time * 0.3 + i * 10) % 65;
      const alpha = 0.3 + Math.random() * 0.4;
      
      this.showerGraphics.fillStyle(0x87ceeb, alpha);
      this.showerGraphics.fillCircle(x, y, 2);
    }
  } else if (this.showerGraphics) {
    this.showerGraphics.clear();
  }
};
