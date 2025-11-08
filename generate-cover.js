// Generate cover.png - 800x600 image for the arcade games
// This uses Node.js canvas to create a visual representation

import fs from 'fs';

// Create HTML canvas renderer
const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Generate Cover</title>
</head>
<body style="margin:0;background:#000;">
<canvas id="c" width="800" height="600"></canvas>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

// Background
ctx.fillStyle = '#0a0a0a';
ctx.fillRect(0, 0, 800, 600);

// Grid pattern
ctx.strokeStyle = 'rgba(0, 255, 136, 0.15)';
ctx.lineWidth = 1;
for (let i = 0; i < 800; i += 40) {
  ctx.beginPath();
  ctx.moveTo(i, 0);
  ctx.lineTo(i, 600);
  ctx.stroke();
}
for (let j = 0; j < 600; j += 40) {
  ctx.beginPath();
  ctx.moveTo(0, j);
  ctx.lineTo(800, j);
  ctx.stroke();
}

// Title
ctx.font = 'bold 56px Arial';
ctx.fillStyle = '#00ff88';
ctx.textAlign = 'center';
ctx.strokeStyle = '#000000';
ctx.lineWidth = 6;
ctx.strokeText('HACKATHON ARCADE', 400, 80);
ctx.fillText('HACKATHON ARCADE', 400, 80);

ctx.font = 'bold 32px Arial';
ctx.fillStyle = '#ff0066';
ctx.fillText('AI DEVELOPER EDITION', 400, 120);

// LEFT GAME - Prompt Injection Panic
ctx.fillStyle = '#00ff88';
ctx.font = 'bold 28px Arial';
ctx.fillText('PROMPT INJECTION', 200, 180);
ctx.fillText('PANIC', 200, 210);

// Draw defender ship
ctx.fillStyle = '#00ff88';
ctx.beginPath();
ctx.moveTo(200, 250);
ctx.lineTo(170, 280);
ctx.lineTo(230, 280);
ctx.closePath();
ctx.fill();

// Draw attacks
const attackColors = ['#ff3333', '#ff6600', '#ff00ff'];
for (let i = 0; i < 3; i++) {
  ctx.fillStyle = attackColors[i];
  ctx.fillRect(150 + i * 50, 300 + i * 30, 30, 30);

  // Eyes
  ctx.fillStyle = '#000000';
  ctx.fillRect(155 + i * 50, 308 + i * 30, 4, 4);
  ctx.fillRect(171 + i * 50, 308 + i * 30, 4, 4);
}

// Safety filters (bullets)
ctx.fillStyle = '#00ff88';
for (let i = 0; i < 5; i++) {
  ctx.fillRect(180 + i * 10, 360 - i * 20, 3, 10);
}

// RIGHT GAME - Merge Conflict Mayhem
ctx.fillStyle = '#ff6600';
ctx.font = 'bold 28px Arial';
ctx.fillText('MERGE CONFLICT', 600, 180);
ctx.fillText('MAYHEM', 600, 210);

// Draw Tetris-style blocks
const blockColors = ['#00ff00', '#ff0000', '#ff00ff', '#0088ff'];
const blockSize = 20;

// Stack of blocks
let yPos = 250;
for (let row = 0; row < 8; row++) {
  for (let col = 0; col < 5; col++) {
    const colorIdx = (row + col) % 4;
    ctx.fillStyle = blockColors[colorIdx];
    ctx.fillRect(530 + col * (blockSize + 2), yPos + row * (blockSize + 2), blockSize, blockSize);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(530 + col * (blockSize + 2), yPos + row * (blockSize + 2), blockSize, blockSize);
  }
}

// Git branch visualization
ctx.strokeStyle = 'rgba(255, 102, 0, 0.3)';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(550, 450);
ctx.lineTo(550, 500);
ctx.stroke();

ctx.beginPath();
ctx.moveTo(600, 450);
ctx.lineTo(600, 500);
ctx.stroke();

// Merge point
ctx.fillStyle = '#ff6600';
ctx.beginPath();
ctx.arc(575, 475, 5, 0, Math.PI * 2);
ctx.fill();

// Bottom text
ctx.font = 'bold 24px Arial';
ctx.fillStyle = '#ffffff';
ctx.fillText('Two Games. Infinite Developer Pain.', 400, 520);

ctx.font = '18px Arial';
ctx.fillStyle = '#888888';
ctx.fillText('Navigate the lobby with Arrow Keys or WASD | Press SPACE to play', 400, 555);

// Stats
ctx.font = 'bold 14px Arial';
ctx.textAlign = 'left';
ctx.fillStyle = '#00ff88';
ctx.fillText('✓ Wave-based progression', 50, 470);
ctx.fillText('✓ Combo multipliers', 50, 495);
ctx.fillText('✓ Boss battles', 50, 520);
ctx.fillText('✓ High score tracking', 50, 545);

// Download button prompt
ctx.font = 'bold 20px Arial';
ctx.fillStyle = '#ffff00';
ctx.textAlign = 'center';
ctx.fillText('Right-click canvas and Save Image As "cover.png"', 400, 590);

</script>
</body>
</html>
`;

fs.writeFileSync('cover-generator.html', html);
console.log('✅ Created cover-generator.html');
console.log('📝 Open cover-generator.html in your browser');
console.log('📸 Right-click the canvas and save as cover.png');
