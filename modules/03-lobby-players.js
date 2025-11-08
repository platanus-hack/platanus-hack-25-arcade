// ============ LOBBY PLAYERS ============
// Agent v.03 - Player Movement Engineer

// Extend LobbyScene.create for player setup
const origLobbyCreate2 = LobbyScene.prototype.create;
LobbyScene.prototype.create = function() {
  if (origLobbyCreate2) origLobbyCreate2.call(this);
  
  // Enhanced Player 1 (developer in blue hoodie with laptop)
  const p1g = this.add.graphics();
  
  // Shadow (bigger)
  p1g.fillStyle(0x000000, 0.3);
  p1g.fillEllipse(35, 68, 30, 10);
  
  // Legs (jeans)
  p1g.fillGradientStyle(0x2244aa, 0x2244aa, 0x1133aa, 0x1133aa, 1);
  p1g.fillRect(24, 50, 8, 20);
  p1g.fillRect(38, 50, 8, 20);
  
  // Shoes
  p1g.fillStyle(0x222222, 1);
  p1g.fillEllipse(28, 70, 10, 4);
  p1g.fillEllipse(42, 70, 10, 4);
  
  // Body (hoodie)
  p1g.fillGradientStyle(0x0088ff, 0x0088ff, 0x0066dd, 0x0044bb, 1);
  p1g.fillRoundedRect(20, 28, 30, 24, 3);
  
  // Hoodie pocket (kangaroo pocket)
  p1g.fillStyle(0x0044bb, 0.6);
  p1g.fillRoundedRect(24, 38, 22, 10, 2);
  
  // Hoodie strings
  p1g.lineStyle(2, 0x00aaff, 1);
  p1g.lineBetween(32, 28, 30, 24);
  p1g.lineBetween(38, 28, 40, 24);
  
  // Arms (hoodie sleeves)
  p1g.fillGradientStyle(0x0088ff, 0x0088ff, 0x0066dd, 0x0044bb, 1);
  p1g.fillRoundedRect(12, 32, 8, 18, 2);
  p1g.fillRoundedRect(50, 32, 8, 18, 2);
  
  // Laptop (left arm holding it)
  p1g.fillGradientStyle(0x333333, 0x333333, 0x111111, 0x111111, 1);
  p1g.fillRect(6, 42, 12, 10);
  // Screen glow
  p1g.fillGradientStyle(0x00ff00, 0x00ff00, 0x00aa00, 0x006600, 0.8);
  p1g.fillRect(7, 43, 10, 8);
  // Code lines on screen
  p1g.fillStyle(0x00ff00, 1);
  p1g.fillRect(8, 44, 6, 1);
  p1g.fillRect(8, 46, 8, 1);
  p1g.fillRect(8, 48, 5, 1);
  
  // Hands
  p1g.fillStyle(0xffcc99, 1);
  p1g.fillCircle(16, 50, 3);
  p1g.fillCircle(54, 50, 3);
  
  // Head
  p1g.fillGradientStyle(0xffcc99, 0xffcc99, 0xffaa77, 0xffaa77, 1);
  p1g.fillCircle(35, 18, 12);
  
  // Hood (over head)
  p1g.fillGradientStyle(0x0088ff, 0x0088ff, 0x0066dd, 0x0044bb, 1);
  p1g.fillEllipse(35, 12, 14, 8);
  
  // Hair (messy dev hair)
  p1g.fillStyle(0x331100, 1);
  p1g.fillEllipse(35, 10, 10, 6);
  p1g.fillRect(30, 12, 3, 4);
  p1g.fillRect(40, 12, 3, 4);
  
  // Glasses
  p1g.lineStyle(2, 0x000000, 1);
  p1g.strokeCircle(30, 18, 4);
  p1g.strokeCircle(40, 18, 4);
  p1g.lineBetween(34, 18, 36, 18);
  
  // Eyes behind glasses
  p1g.fillStyle(0x000000, 1);
  p1g.fillCircle(30, 18, 2);
  p1g.fillCircle(40, 18, 2);
  
  // Smile
  p1g.lineStyle(1, 0x000000, 1);
  p1g.beginPath();
  p1g.arc(35, 22, 4, 0, Math.PI);
  p1g.strokePath();
  
  p1g.generateTexture('p1', 70, 72);
  p1g.destroy();
  
  this.p1 = this.physics.add.sprite(100, 300, 'p1');
  this.p1.setCollideWorldBounds(true);
  this.p1.body.setCircle(30);
  
  // P1 banana sprite (initially hidden)
  this.p1Banana = this.add.graphics();
  this.p1Banana.visible = false;
  
  // P1 pizza sprite (initially hidden)
  this.p1Pizza = this.add.graphics();
  this.p1Pizza.visible = false;
  
  // Enhanced Player 2 (developer in red hoodie with coffee)
  const p2g = this.add.graphics();
  
  // Shadow (bigger)
  p2g.fillStyle(0x000000, 0.3);
  p2g.fillEllipse(35, 68, 30, 10);
  
  // Legs (jeans)
  p2g.fillGradientStyle(0x224488, 0x224488, 0x113377, 0x113377, 1);
  p2g.fillRect(24, 50, 8, 20);
  p2g.fillRect(38, 50, 8, 20);
  
  // Shoes
  p2g.fillStyle(0x111111, 1);
  p2g.fillEllipse(28, 70, 10, 4);
  p2g.fillEllipse(42, 70, 10, 4);
  
  // Body (hoodie)
  p2g.fillGradientStyle(0xff3366, 0xff3366, 0xdd2244, 0xbb1133, 1);
  p2g.fillRoundedRect(20, 28, 30, 24, 3);
  
  // Hoodie pocket
  p2g.fillStyle(0xbb1133, 0.6);
  p2g.fillRoundedRect(24, 38, 22, 10, 2);
  
  // Hoodie strings
  p2g.lineStyle(2, 0xff6699, 1);
  p2g.lineBetween(32, 28, 30, 24);
  p2g.lineBetween(38, 28, 40, 24);
  
  // Arms (hoodie sleeves)
  p2g.fillGradientStyle(0xff3366, 0xff3366, 0xdd2244, 0xbb1133, 1);
  p2g.fillRoundedRect(12, 32, 8, 18, 2);
  p2g.fillRoundedRect(50, 32, 8, 18, 2);
  
  // Coffee cup (right hand)
  p2g.fillGradientStyle(0x8b4513, 0x8b4513, 0x654321, 0x654321, 1);
  p2g.fillRect(52, 42, 10, 12);
  // Coffee
  p2g.fillStyle(0x3d2817, 1);
  p2g.fillRect(53, 43, 8, 6);
  // Steam
  p2g.lineStyle(1, 0xffffff, 0.6);
  p2g.beginPath();
  p2g.moveTo(56, 42);
  p2g.lineTo(55, 38);
  p2g.strokePath();
  p2g.beginPath();
  p2g.moveTo(58, 42);
  p2g.lineTo(59, 38);
  p2g.strokePath();
  // Cup sleeve
  p2g.fillStyle(0x00aa00, 1);
  p2g.fillRect(52, 48, 10, 3);
  
  // Hands
  p2g.fillStyle(0xffcc99, 1);
  p2g.fillCircle(16, 50, 3);
  p2g.fillCircle(54, 50, 3);
  
  // Head
  p2g.fillGradientStyle(0xffcc99, 0xffcc99, 0xffaa77, 0xffaa77, 1);
  p2g.fillCircle(35, 18, 12);
  
  // Hood (over head)
  p2g.fillGradientStyle(0xff3366, 0xff3366, 0xdd2244, 0xbb1133, 1);
  p2g.fillEllipse(35, 12, 14, 8);
  
  // Hair (longer dev hair)
  p2g.fillStyle(0x442200, 1);
  p2g.fillEllipse(35, 10, 12, 6);
  p2g.fillRect(28, 14, 4, 6);
  p2g.fillRect(42, 14, 4, 6);
  
  // Headphones
  p2g.lineStyle(3, 0x222222, 1);
  p2g.beginPath();
  p2g.arc(35, 18, 14, Math.PI, 0, true);
  p2g.strokePath();
  p2g.fillStyle(0x333333, 1);
  p2g.fillCircle(22, 18, 5);
  p2g.fillCircle(48, 18, 5);
  
  // Eyes
  p2g.fillStyle(0x000000, 1);
  p2g.fillCircle(30, 18, 2);
  p2g.fillCircle(40, 18, 2);
  
  // Smile
  p2g.lineStyle(1, 0x000000, 1);
  p2g.beginPath();
  p2g.arc(35, 22, 4, 0, Math.PI);
  p2g.strokePath();
  
  p2g.generateTexture('p2', 70, 72);
  p2g.destroy();
  
  this.p2 = this.physics.add.sprite(700, 300, 'p2');
  this.p2.setCollideWorldBounds(true);
  this.p2.body.setCircle(30);
  
  // P2 banana sprite (initially hidden)
  this.p2Banana = this.add.graphics();
  this.p2Banana.visible = false;
  
  // P2 pizza sprite (initially hidden)
  this.p2Pizza = this.add.graphics();
  this.p2Pizza.visible = false;
  
  // Input setup
  this.cursors = this.input.keyboard.createCursorKeys();
  this.wasd = this.input.keyboard.addKeys('W,A,S,D');
  this.space = this.input.keyboard.addKey('SPACE');
};

// Extend LobbyScene.update for player movement
const origLobbyUpdate = LobbyScene.prototype.update;
LobbyScene.prototype.update = function() {
  if (origLobbyUpdate) origLobbyUpdate.call(this);
  
  const spd = 200;
  
  // Player 1 movement (Arrow keys)
  if (this.cursors.left.isDown) {
    this.p1.setVelocityX(-spd);
  } else if (this.cursors.right.isDown) {
    this.p1.setVelocityX(spd);
  } else {
    this.p1.setVelocityX(0);
  }
  
  if (this.cursors.up.isDown) {
    this.p1.setVelocityY(-spd);
  } else if (this.cursors.down.isDown) {
    this.p1.setVelocityY(spd);
  } else {
    this.p1.setVelocityY(0);
  }
  
  // Player 2 movement (WASD)
  if (this.wasd.A.isDown) {
    this.p2.setVelocityX(-spd);
  } else if (this.wasd.D.isDown) {
    this.p2.setVelocityX(spd);
  } else {
    this.p2.setVelocityX(0);
  }
  
  if (this.wasd.W.isDown) {
    this.p2.setVelocityY(-spd);
  } else if (this.wasd.S.isDown) {
    this.p2.setVelocityY(spd);
  } else {
    this.p2.setVelocityY(0);
  }
  
  // Update banana positions and visibility
  if (this.p1.eatingBanana) {
    this.p1Banana.visible = true;
    this.p1Banana.clear();
    
    // Draw banana near player's mouth
    const bobble = Math.sin(Date.now() / 100) * 2;
    const bx = this.p1.x + 15;
    const by = this.p1.y - 20 + bobble;
    
    this.p1Banana.fillGradientStyle(0xffff00, 0xffff00, 0xffdd00, 0xffbb00, 1);
    this.p1Banana.fillEllipse(bx, by, 8, 16);
    this.p1Banana.fillStyle(0xffff99, 0.6);
    this.p1Banana.fillEllipse(bx - 2, by - 4, 3, 8);
    this.p1Banana.fillStyle(0xccaa00, 0.4);
    this.p1Banana.fillEllipse(bx + 2, by + 4, 3, 8);
    
    // Bite marks (progressive)
    const biteProgress = 1 - (this.p1.eatTimer / 3000);
    if (biteProgress > 0.3) {
      this.p1Banana.fillStyle(0xffcc99, 1);
      this.p1Banana.fillCircle(bx - 2, by - 6, 3);
    }
    if (biteProgress > 0.6) {
      this.p1Banana.fillCircle(bx + 1, by - 2, 3);
    }
  } else {
    this.p1Banana.visible = false;
  }
  
  if (this.p2.eatingBanana) {
    this.p2Banana.visible = true;
    this.p2Banana.clear();
    
    const bobble = Math.sin(Date.now() / 100) * 2;
    const bx = this.p2.x + 15;
    const by = this.p2.y - 20 + bobble;
    
    this.p2Banana.fillGradientStyle(0xffff00, 0xffff00, 0xffdd00, 0xffbb00, 1);
    this.p2Banana.fillEllipse(bx, by, 8, 16);
    this.p2Banana.fillStyle(0xffff99, 0.6);
    this.p2Banana.fillEllipse(bx - 2, by - 4, 3, 8);
    this.p2Banana.fillStyle(0xccaa00, 0.4);
    this.p2Banana.fillEllipse(bx + 2, by + 4, 3, 8);
    
    const biteProgress = 1 - (this.p2.eatTimer / 3000);
    if (biteProgress > 0.3) {
      this.p2Banana.fillStyle(0xffcc99, 1);
      this.p2Banana.fillCircle(bx - 2, by - 6, 3);
    }
    if (biteProgress > 0.6) {
      this.p2Banana.fillCircle(bx + 1, by - 2, 3);
    }
  } else {
    this.p2Banana.visible = false;
  }
  
  // Update pizza positions and visibility
  if (this.p1.eatingPizza) {
    this.p1Pizza.visible = true;
    this.p1Pizza.clear();
    
    // Draw pizza slice near player's mouth
    const bobble = Math.sin(Date.now() / 120) * 2;
    const px = this.p1.x + 15;
    const py = this.p1.y - 20 + bobble;
    
    // Pizza slice (triangle)
    this.p1Pizza.fillGradientStyle(0xffcc66, 0xffcc66, 0xddaa44, 0xddaa44, 1);
    this.p1Pizza.fillTriangle(px, py - 8, px - 8, py + 8, px + 8, py + 8);
    
    // Crust
    this.p1Pizza.fillStyle(0xcc9944, 1);
    this.p1Pizza.beginPath();
    this.p1Pizza.arc(px, py - 8, 3, Math.PI, 0);
    this.p1Pizza.fillPath();
    
    // Cheese
    this.p1Pizza.fillStyle(0xffdd77, 0.8);
    this.p1Pizza.fillCircle(px - 2, py, 2);
    this.p1Pizza.fillCircle(px + 2, py + 2, 2);
    
    // Pepperoni
    this.p1Pizza.fillStyle(0xcc0000, 1);
    this.p1Pizza.fillCircle(px - 3, py - 2, 2);
    this.p1Pizza.fillCircle(px + 3, py, 2);
    this.p1Pizza.fillCircle(px, py + 4, 2);
    
    // Bite marks (progressive)
    const biteProgress = 1 - (this.p1.pizzaTimer / 4000);
    if (biteProgress > 0.25) {
      this.p1Pizza.fillStyle(0xffcc99, 1);
      this.p1Pizza.fillCircle(px - 6, py + 6, 4);
    }
    if (biteProgress > 0.5) {
      this.p1Pizza.fillCircle(px + 4, py + 4, 4);
    }
    if (biteProgress > 0.75) {
      this.p1Pizza.fillCircle(px, py, 4);
    }
  } else {
    this.p1Pizza.visible = false;
  }
  
  if (this.p2.eatingPizza) {
    this.p2Pizza.visible = true;
    this.p2Pizza.clear();
    
    const bobble = Math.sin(Date.now() / 120) * 2;
    const px = this.p2.x + 15;
    const py = this.p2.y - 20 + bobble;
    
    // Pizza slice
    this.p2Pizza.fillGradientStyle(0xffcc66, 0xffcc66, 0xddaa44, 0xddaa44, 1);
    this.p2Pizza.fillTriangle(px, py - 8, px - 8, py + 8, px + 8, py + 8);
    
    // Crust
    this.p2Pizza.fillStyle(0xcc9944, 1);
    this.p2Pizza.beginPath();
    this.p2Pizza.arc(px, py - 8, 3, Math.PI, 0);
    this.p2Pizza.fillPath();
    
    // Cheese
    this.p2Pizza.fillStyle(0xffdd77, 0.8);
    this.p2Pizza.fillCircle(px - 2, py, 2);
    this.p2Pizza.fillCircle(px + 2, py + 2, 2);
    
    // Pepperoni
    this.p2Pizza.fillStyle(0xcc0000, 1);
    this.p2Pizza.fillCircle(px - 3, py - 2, 2);
    this.p2Pizza.fillCircle(px + 3, py, 2);
    this.p2Pizza.fillCircle(px, py + 4, 2);
    
    const biteProgress = 1 - (this.p2.pizzaTimer / 4000);
    if (biteProgress > 0.25) {
      this.p2Pizza.fillStyle(0xffcc99, 1);
      this.p2Pizza.fillCircle(px - 6, py + 6, 4);
    }
    if (biteProgress > 0.5) {
      this.p2Pizza.fillCircle(px + 4, py + 4, 4);
    }
    if (biteProgress > 0.75) {
      this.p2Pizza.fillCircle(px, py, 4);
    }
  } else {
    this.p2Pizza.visible = false;
  }
};
