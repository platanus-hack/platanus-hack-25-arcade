# AI Agent Instructions for Platanus Hack 25: Arcade Challenge

You are helping build an arcade game for a hackathon challenge. Follow these instructions carefully.

## Your Goal

Create an engaging, fun arcade game in **game.js** using **Phaser 3** (v3.87.0) that meets all restrictions.

## ⚠️ IMPORTANT: Files to Edit

**ONLY edit these two files:**
- `game.js` - Your game code
- `metadata.json` - Game name and description

**DO NOT edit any other files** (including index.html, check-restrictions files, config files, etc.)

## Critical Restrictions

1. **Size**: Game must be ≤50KB after minification (before gzip)
2. **No imports**: Pure vanilla JavaScript only - no `import` or `require`
3. **No external URLs**: No `http://`, `https://`, or `//` (except `data:` URIs for base64)
4. **No network calls**: No `fetch`, `XMLHttpRequest`, or similar
5. **Sandboxed environment**: Game runs in iframe with no internet access

## What's Allowed

-  Base64-encoded images (as `data:` URIs)
-  Procedurally generated graphics using Phaser's Graphics API
-  Generated audio tones using Phaser's Web Audio API
-  Canvas-based rendering and effects

## Development Workflow

1. **Edit game.js**: Write your game code in this single file
2. **Update metadata.json**: Set `game_name` and `description`
3. **Check restrictions**: Run `pnpm check-restrictions` frequently
4. **DO NOT start dev servers**: The user will handle running `pnpm dev` - do not run it yourself

## Phaser 3 Resources

- **Quick start guide**: @docs/phaser-quick-start.md
- **API documentation**: For specific Phaser methods and examples, search within docs/phaser-api.md

## Size Optimization Tips

- Use short variable names before minification
- Avoid large data structures or arrays
- Generate graphics procedurally instead of embedding images
- Keep game logic simple and efficient
- Test size early and often with `pnpm check-restrictions`

## Validation

Always validate your work:
```bash
pnpm check-restrictions
```

This checks:
- File size after minification
- No forbidden imports
- No network calls
- No external URLs
- Code safety warnings

## Game Structure

Your game.js should follow this structure:

```javascript
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: { /* optional */ },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

function preload() {
  // Load assets (base64 only)
}

function create() {
  // Initialize game objects
}

function update() {
  // Game loop logic
}
```

## Important Notes

- Phaser is loaded externally via CDN (not counted in 50KB limit)
- Focus on gameplay and creativity within size constraints
- Use Phaser's built-in features (sprites, physics, tweens, etc.)
- Test in the development server to ensure sandbox compatibility
- Keep code readable - minification happens automatically
- **Controls**: Keep controls simple (arrow keys, WASD, spacebar, etc.) - they will be mapped to an arcade controller

## Best Practices

1. **Start simple**: Get a working game first, optimize later
2. **Check size frequently**: Don't wait until the end
3. **Use Phaser features**: Leverage built-in physics, tweens, and effects
4. **Generate assets**: Draw shapes instead of using images when possible
5. **Let the user test**: The user will run `pnpm dev` when they want to test - focus on building the game

Good luck building an amazing arcade game! <�