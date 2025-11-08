// ============ LOBBY INTERACTION ============
// Agent v.04 - Transition Specialist

const origLobbyCreate3 = LobbyScene.prototype.create;
LobbyScene.prototype.create = function() {
  if (origLobbyCreate3) origLobbyCreate3.call(this);
  
  // Interaction prompt
  this.prompt = this.add.text(600, 380, 'Press SPACE to play!', {
    fontSize: '16px',
    color: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 8, y: 4 }
  }).setOrigin(0.5).setVisible(false);
  
  // Banana stage prompt
  this.bananaPrompt = this.add.text(90, 145, 'Press B for BANANA!', {
    fontSize: '12px',
    color: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 6, y: 3 }
  }).setOrigin(0.5).setVisible(false);
  
  // Pizza stage prompt
  this.pizzaPrompt = this.add.text(710, 285, 'Press P for PIZZA!', {
    fontSize: '12px',
    color: '#ff6600',
    backgroundColor: '#000000',
    padding: { x: 6, y: 3 }
  }).setOrigin(0.5).setVisible(false);
  
  // Shower prompt
  this.showerPrompt = this.add.text(720, 170, 'Press S for SHOWER!', {
    fontSize: '12px',
    color: '#00aaff',
    backgroundColor: '#000000',
    padding: { x: 6, y: 3 }
  }).setOrigin(0.5).setVisible(false);
  
  // B key for banana, P key for pizza, S key for shower
  this.bKey = this.input.keyboard.addKey('B');
  this.pKey = this.input.keyboard.addKey('P');
  this.sKey = this.input.keyboard.addKey('S');
  
  // Track banana state for each player
  this.p1.hasBanana = false;
  this.p1.eatingBanana = false;
  this.p1.eatTimer = 0;
  this.p2.hasBanana = false;
  this.p2.eatingBanana = false;
  this.p2.eatTimer = 0;
  
  // Track pizza state for each player
  this.p1.hasPizza = false;
  this.p1.eatingPizza = false;
  this.p1.pizzaTimer = 0;
  this.p2.hasPizza = false;
  this.p2.eatingPizza = false;
  this.p2.pizzaTimer = 0;
};

const origLobbyUpdate2 = LobbyScene.prototype.update;
LobbyScene.prototype.update = function(time, delta) {
  if (origLobbyUpdate2) origLobbyUpdate2.call(this, time, delta);
  
  // Check proximity to arcade station
  const p1Near = Phaser.Math.Distance.Between(this.p1.x, this.p1.y, 600, 300) < 80;
  const p2Near = Phaser.Math.Distance.Between(this.p2.x, this.p2.y, 600, 300) < 80;
  const nearStation = p1Near || p2Near;
  
  this.prompt.setVisible(nearStation);
  
  // Transition to mini-game
  if (nearStation && Phaser.Input.Keyboard.JustDown(this.space)) {
    this.scene.start('MiniGame', { players: 2 });
  }
  
  // Check proximity to banana stage
  const p1NearBanana = Phaser.Math.Distance.Between(this.p1.x, this.p1.y, 90, 105) < 60;
  const p2NearBanana = Phaser.Math.Distance.Between(this.p2.x, this.p2.y, 90, 105) < 60;
  const nearBanana = p1NearBanana || p2NearBanana;
  
  this.bananaPrompt.setVisible(nearBanana && !this.p1.eatingBanana && !this.p2.eatingBanana);
  
  // Grab banana
  if (nearBanana && Phaser.Input.Keyboard.JustDown(this.bKey)) {
    if (p1NearBanana && !this.p1.hasBanana && !this.p1.eatingBanana) {
      this.p1.hasBanana = true;
      this.p1.eatingBanana = true;
      this.p1.eatTimer = 3000; // 3 seconds eating animation
      this.showBananaText(this.p1, 'P1 got BANANA! 🍌');
    }
    if (p2NearBanana && !this.p2.hasBanana && !this.p2.eatingBanana) {
      this.p2.hasBanana = true;
      this.p2.eatingBanana = true;
      this.p2.eatTimer = 3000;
      this.showBananaText(this.p2, 'P2 got BANANA! 🍌');
    }
  }
  
  // Update eating timers
  if (this.p1.eatingBanana) {
    this.p1.eatTimer -= delta;
    if (this.p1.eatTimer <= 0) {
      this.p1.eatingBanana = false;
      this.p1.hasBanana = false;
      this.showBananaText(this.p1, 'Yum! +Energy!');
    }
  }
  
  if (this.p2.eatingBanana) {
    this.p2.eatTimer -= delta;
    if (this.p2.eatTimer <= 0) {
      this.p2.eatingBanana = false;
      this.p2.hasBanana = false;
      this.showBananaText(this.p2, 'Yum! +Energy!');
    }
  }
  
  // Check proximity to pizza stage
  const p1NearPizza = Phaser.Math.Distance.Between(this.p1.x, this.p1.y, 710, 245) < 60;
  const p2NearPizza = Phaser.Math.Distance.Between(this.p2.x, this.p2.y, 710, 245) < 60;
  const nearPizza = p1NearPizza || p2NearPizza;
  
  this.pizzaPrompt.setVisible(nearPizza && !this.p1.eatingPizza && !this.p2.eatingPizza);
  
  // Grab pizza
  if (nearPizza && Phaser.Input.Keyboard.JustDown(this.pKey)) {
    if (p1NearPizza && !this.p1.hasPizza && !this.p1.eatingPizza) {
      this.p1.hasPizza = true;
      this.p1.eatingPizza = true;
      this.p1.pizzaTimer = 4000; // 4 seconds eating animation (pizza takes longer)
      this.showBananaText(this.p1, 'P1 got PIZZA! 🍕');
    }
    if (p2NearPizza && !this.p2.hasPizza && !this.p2.eatingPizza) {
      this.p2.hasPizza = true;
      this.p2.eatingPizza = true;
      this.p2.pizzaTimer = 4000;
      this.showBananaText(this.p2, 'P2 got PIZZA! 🍕');
    }
  }
  
  // Update pizza eating timers
  if (this.p1.eatingPizza) {
    this.p1.pizzaTimer -= delta;
    if (this.p1.pizzaTimer <= 0) {
      this.p1.eatingPizza = false;
      this.p1.hasPizza = false;
      this.showBananaText(this.p1, 'Delicious! +Power!');
    }
  }
  
  if (this.p2.eatingPizza) {
    this.p2.pizzaTimer -= delta;
    if (this.p2.pizzaTimer <= 0) {
      this.p2.eatingPizza = false;
      this.p2.hasPizza = false;
      this.showBananaText(this.p2, 'Delicious! +Power!');
    }
  }
  
  // Check proximity to shower
  const p1NearShower = Phaser.Math.Distance.Between(this.p1.x, this.p1.y, 720, 130) < 70;
  const p2NearShower = Phaser.Math.Distance.Between(this.p2.x, this.p2.y, 720, 130) < 70;
  const nearShower = p1NearShower || p2NearShower;
  
  this.showerPrompt.setVisible(nearShower && !this.showerOn);
  
  // Turn on shower
  if (nearShower && Phaser.Input.Keyboard.JustDown(this.sKey) && !this.showerOn) {
    this.showerOn = true;
    this.showerTimer = 5000; // 5 seconds of shower
    
    if (p1NearShower) {
      this.showBananaText(this.p1, 'P1 taking a shower! 🚿');
    }
    if (p2NearShower) {
      this.showBananaText(this.p2, 'P2 taking a shower! 🚿');
    }
  }
};

// Helper function to show banana text
LobbyScene.prototype.showBananaText = function(player, message) {
  const txt = this.add.text(player.x, player.y - 50, message, {
    fontSize: '14px',
    color: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 6, y: 3 }
  }).setOrigin(0.5);
  
  this.tweens.add({
    targets: txt,
    y: player.y - 80,
    alpha: 0,
    duration: 1500,
    onComplete: () => txt.destroy()
  });
};
