// ============ MINIGAME COMBAT ============
// Agent v.06 - Investor Wave & Combat Engineer

const origMiniCreate = MiniGameScene.prototype.create;
MiniGameScene.prototype.create = function() {
  if (origMiniCreate) origMiniCreate.call(this);
  
  // Investor texture
  const ig = this.add.graphics();
  ig.fillStyle(0x00ff00, 1);
  ig.fillRect(0, 0, 30, 30);
  ig.fillStyle(0x000000, 1);
  ig.fillCircle(10, 10, 3);
  ig.fillCircle(20, 10, 3);
  ig.fillRect(8, 20, 14, 2);
  ig.generateTexture('investor', 30, 30);
  ig.destroy();
  
  // Create investor wave
  this.investors = this.physics.add.group();
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 8; col++) {
      const inv = this.investors.create(100 + col * 50, 80 + row * 40, 'investor');
      inv.body.setSize(30, 30);
    }
  }
  
  this.moveDir = 1;
  this.moveSpd = 50;
  
  // Collision
  this.physics.add.overlap(this.pitches, this.investors, this.hitInvestor, null, this);
};

const origMiniUpdate = MiniGameScene.prototype.update;
MiniGameScene.prototype.update = function(time) {
  if (origMiniUpdate) origMiniUpdate.call(this, time);
  
  if (!this.gameActive) return;
  
  // Move investors
  let hitEdge = false;
  this.investors.children.entries.forEach(inv => {
    inv.x += this.moveSpd * this.moveDir * 0.016;
    if (inv.x > 770 || inv.x < 30) hitEdge = true;
    if (inv.y > 530) this.endGame(false);
  });
  
  if (hitEdge) {
    this.moveDir *= -1;
    this.investors.children.entries.forEach(inv => inv.y += 20);
  }
  
  // Check win condition
  if (this.investors.countActive() === 0) {
    this.endGame(true);
  }
};

MiniGameScene.prototype.hitInvestor = function(pitch, investor) {
  pitch.destroy();
  investor.destroy();
  this.score += 10;
  this.scoreText.setText('Score: ' + this.score);
  this.playSound(880, 0.15, 0.2);
};

MiniGameScene.prototype.endGame = function(won) {
  this.gameActive = false;
  this.physics.pause();
  
  const msg = won ? 'FUNDED!' : 'REJECTED!';
  const col = won ? '#00ff00' : '#ff0000';
  
  this.add.text(400, 300, msg + '\nScore: ' + this.score, {
    fontSize: '48px',
    color: col,
    align: 'center',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  
  this.playSound(won ? 880 : 220, 0.5, 0.3);
  
  this.time.delayedCall(3000, () => {
    this.scene.start('Lobby');
  });
};
