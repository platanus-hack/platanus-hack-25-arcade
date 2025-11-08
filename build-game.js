import fs from 'fs';

const modules = [
  'modules/01-config.js',
  'modules/02-lobby-environment.js',
  'modules/09-graphics-enhancement.js',
  'modules/03-lobby-players.js',
  'modules/04-lobby-interaction.js',
  'modules/05-minigame-core.js',
  'modules/06-minigame-combat.js',
  'modules/07-audio-ui.js',
  'modules/08-game-init.js'
];

let combined = '';

modules.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    combined += content + '\n\n';
    console.log(`✅ Added: ${file}`);
  } else {
    console.log(`⚠️  Missing: ${file}`);
  }
});

fs.writeFileSync('game.js', combined);
console.log('\n🎮 game.js built successfully!');
console.log(`📦 Size: ${(combined.length / 1024).toFixed(2)} KB (unminified)`);
