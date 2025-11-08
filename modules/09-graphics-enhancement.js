// ============ GRAPHICS ENHANCEMENT ============
// Mini-game graphics enhancements only
// (Lobby environment is now in module 02)
// (Player avatars are now in module 03)

// ENHANCED MINI-GAME GRAPHICS
const origMiniCreate2 = MiniGameScene.prototype.create;
MiniGameScene.prototype.create = function() {
  if (origMiniCreate2) origMiniCreate2.call(this);
  
  // Enhanced Ship 1 (futuristic with metallic gradient)
  const s1g = this.add.graphics();
  
  // Ship shadow
  s1g.fillStyle(0x000000, 0.3);
  s1g.fillTriangle(20, 22, 0, 22, 40, 22);
  
  // Ship body with metallic gradient
  s1g.fillGradientStyle(0x0088ff, 0x0066ff, 0x0044cc, 0x0044cc, 1);
  s1g.fillTriangle(20, 0, 0, 20, 40, 20);
  
  // Cockpit window
  s1g.fillGradientStyle(0x00ffff, 0x00ffff, 0x0088ff, 0x0088ff, 0.8);
  s1g.fillTriangle(20, 6, 12, 14, 28, 14);
  
  // Engine glow
  s1g.fillStyle(0x00ffff, 0.6);
  s1g.fillCircle(8, 18, 3);
  s1g.fillCircle(32, 18, 3);
  
  // Wing highlights
  s1g.fillStyle(0xffffff, 0.4);
  s1g.fillTriangle(20, 2, 16, 8, 24, 8);
  
  s1g.generateTexture('ship1', 40, 22);
  s1g.destroy();
  
  // Enhanced Ship 2
  const s2g = this.add.graphics();
  
  // Ship shadow
  s2g.fillStyle(0x000000, 0.3);
  s2g.fillTriangle(20, 22, 0, 22, 40, 22);
  
  // Ship body with metallic gradient
  s2g.fillGradientStyle(0xff0088, 0xff0066, 0xcc0044, 0xcc0044, 1);
  s2g.fillTriangle(20, 0, 0, 20, 40, 20);
  
  // Cockpit window
  s2g.fillGradientStyle(0xff00ff, 0xff00ff, 0xff0088, 0xff0088, 0.8);
  s2g.fillTriangle(20, 6, 12, 14, 28, 14);
  
  // Engine glow
  s2g.fillStyle(0xff00ff, 0.6);
  s2g.fillCircle(8, 18, 3);
  s2g.fillCircle(32, 18, 3);
  
  // Wing highlights
  s2g.fillStyle(0xffffff, 0.4);
  s2g.fillTriangle(20, 2, 16, 8, 24, 8);
  
  s2g.generateTexture('ship2', 40, 22);
  s2g.destroy();
  
  // Enhanced Pitch (glowing energy projectile)
  const pg = this.add.graphics();
  
  // Outer glow
  pg.fillStyle(0xffff00, 0.3);
  pg.fillRect(-2, 0, 8, 19);
  
  // Core
  pg.fillGradientStyle(0xffffff, 0xffffff, 0xffff00, 0xffff00, 1);
  pg.fillRect(0, 0, 4, 15);
  
  // Highlight
  pg.fillStyle(0xffffff, 0.8);
  pg.fillRect(1, 2, 2, 8);
  
  pg.generateTexture('pitch', 8, 19);
  pg.destroy();
  
  // Enhanced Investor (business person with briefcase)
  const ig = this.add.graphics();
  
  // Shadow
  ig.fillStyle(0x000000, 0.3);
  ig.fillEllipse(15, 29, 12, 4);
  
  // Legs
  ig.fillGradientStyle(0x004400, 0x004400, 0x003300, 0x003300, 1);
  ig.fillRect(10, 20, 4, 10);
  ig.fillRect(16, 20, 4, 10);
  
  // Body (suit)
  ig.fillGradientStyle(0x00ff00, 0x00ff00, 0x00cc00, 0x00cc00, 1);
  ig.fillRect(8, 10, 14, 12);
  
  // Tie
  ig.fillStyle(0x006600, 1);
  ig.fillRect(13, 11, 4, 8);
  
  // Arms
  ig.fillGradientStyle(0x00ff00, 0x00ff00, 0x00cc00, 0x00cc00, 1);
  ig.fillRect(4, 12, 4, 8);
  ig.fillRect(22, 12, 4, 8);
  
  // Briefcase
  ig.fillGradientStyle(0x8b4513, 0x8b4513, 0x654321, 0x654321, 1);
  ig.fillRect(22, 16, 6, 6);
  ig.lineStyle(1, 0x000000, 1);
  ig.strokeRect(22, 16, 6, 6);
  
  // Head
  ig.fillGradientStyle(0xffcc99, 0xffcc99, 0xffaa77, 0xffaa77, 1);
  ig.fillCircle(15, 6, 6);
  
  // Hair
  ig.fillStyle(0x331100, 1);
  ig.fillEllipse(15, 3, 6, 3);
  
  // Eyes (angry investor look)
  ig.fillStyle(0x000000, 1);
  ig.fillCircle(12, 5, 1);
  ig.fillCircle(18, 5, 1);
  
  // Mouth (frown)
  ig.lineStyle(1, 0x000000, 1);
  ig.beginPath();
  ig.arc(15, 9, 3, 0.2, 2.94);
  ig.strokePath();
  
  ig.generateTexture('investor', 30, 30);
  ig.destroy();
};
