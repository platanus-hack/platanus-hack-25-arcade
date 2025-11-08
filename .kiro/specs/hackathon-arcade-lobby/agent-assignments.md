# Agent Work Assignments - Hackathon Arcade Lobby

## Parallel Development Strategy

This document assigns tasks to 7 specialized agents working simultaneously. Each agent has a clear domain to avoid file conflicts and maximize development speed.

---

## 🎮 Agent v.01 - Game Core & Configuration Lead

**Primary File**: `game.js` (lines 1-100)

**Responsibilities**: Game initialization, configuration, and scene management

**Tasks**:
- [ ] 1. Set up game configuration and scene structure
  - Create the main Phaser game configuration with 800x600 dimensions
  - Configure Arcade physics with zero gravity
  - Define scene array with LobbyScene and MiniGameScene
  - Initialize the game instance
  - _Requirements: 1.1, 7.1, 7.5_

**Deliverables**:
```javascript
// Game config object
// Scene class declarations (empty shells)
// Game instance initialization
```

**Estimated Lines**: 80-100 lines

**Dependencies**: None - can start immediately

**Coordination**: Provides scene structure for v.02 and v.03 to fill in

---

## 🏢 Agent v.02 - Lobby Environment Specialist

**Primary File**: `game.js` (Lobby Scene - Graphics section)

**Responsibilities**: Lobby visual environment and decorations

**Tasks**:
- [ ] 2.1 Create LobbyScene class with preload, create, and update methods
- [ ] 2.2 Generate procedural lobby environment graphics
  - Draw office floor with grid pattern using Graphics API
  - Create 5-8 banana decorations (yellow ellipses with brown stems) at random positions
  - Create 4-6 money decorations (green rectangles with "$" symbols) at random positions
  - Generate arcade station graphic (purple rectangle with black screen and cyan button)
  - Position arcade station at center-right of lobby (x: 600, y: 300)

**Deliverables**:
```javascript
// LobbyScene.create() - environment graphics
// Helper functions for banana/money generation
// Arcade station graphic
```

**Estimated Lines**: 120-150 lines

**Dependencies**: Needs v.01 to create scene structure first

**Coordination**: Works in LobbyScene.create() method - separate from v.04's player logic

---

## 🎯 Agent v.03 - Lobby Player Movement Engineer

**Primary File**: `game.js` (Lobby Scene - Player section)

**Responsibilities**: Player avatars, input handling, and movement

**Tasks**:
- [ ] 2.3 Create player avatar sprites with physics
- [ ] 2.4 Implement keyboard input handling for player movement
- [ ] 2.5 Implement player movement logic in update method

**Deliverables**:
```javascript
// Player sprite creation (blue/red circles)
// Input key setup (arrows + WASD)
// LobbyScene.update() - movement logic
```

**Estimated Lines**: 80-100 lines

**Dependencies**: Needs v.01 scene structure

**Coordination**: Works in LobbyScene.create() and .update() - separate section from v.02

---

## 🚪 Agent v.04 - Scene Transition Specialist

**Primary File**: `game.js` (Lobby Scene - Interaction section)

**Responsibilities**: Arcade station interaction and scene transitions

**Tasks**:
- [ ] 2.6 Create arcade station interaction system
- [ ] 2.7 Implement scene transition to mini-game

**Deliverables**:
```javascript
// Overlap detection with arcade station
// Interaction prompt display
// Scene transition logic
// Cleanup before transition
```

**Estimated Lines**: 60-80 lines

**Dependencies**: Needs v.02 (arcade station graphic) and v.03 (player sprites)

**Coordination**: Adds to LobbyScene.create() and .update() - interaction logic only

---

## 👾 Agent v.05 - Mini-Game Core Mechanics Lead

**Primary File**: `game.js` (MiniGame Scene - Core section)

**Responsibilities**: Mini-game foundation, ships, and projectiles

**Tasks**:
- [ ] 3.1 Create MiniGameScene class structure
- [ ] 3.2 Generate player ship graphics and positioning
- [ ] 3.3 Implement ship movement controls
- [ ] 3.4 Create projectile (pitch) system

**Deliverables**:
```javascript
// MiniGameScene class with init/create/update
// Ship graphics and physics
// Ship movement logic
// Projectile system with pooling
```

**Estimated Lines**: 150-180 lines

**Dependencies**: Needs v.01 scene structure

**Coordination**: Works in MiniGameScene - completely separate from Lobby agents

---

## 🤖 Agent v.06 - Investor Wave & Combat Engineer

**Primary File**: `game.js` (MiniGame Scene - Enemy section)

**Responsibilities**: Investor enemies, movement patterns, and collisions

**Tasks**:
- [ ] 3.5 Create investor wave system
- [ ] 3.6 Implement investor movement pattern
- [ ] 3.7 Implement collision detection system
- [ ] 3.8 Implement game over conditions
- [ ] 3.9 Implement return to lobby after game over

**Deliverables**:
```javascript
// Investor graphics and spawning
// Wave movement logic (Space Invaders pattern)
// Collision handlers
// Game over detection and display
// Return to lobby transition
```

**Estimated Lines**: 150-180 lines

**Dependencies**: Needs v.05 (ships and projectiles)

**Coordination**: Adds to MiniGameScene - enemy logic separate from v.05's player logic

---

## 🔊 Agent v.07 - Audio & Polish Specialist

**Primary File**: `game.js` (Audio & UI section)

**Responsibilities**: Sound effects, UI elements, and final polish

**Tasks**:
- [ ] 4.1 Create audio context and sound generation functions
- [ ] 4.2 Integrate sound effects into gameplay
- [ ] 5.1 Create score display in mini-game
- [ ] 5.2 Add visual feedback for collisions
- [ ] 5.3 Create game over screen
- [ ] 6.1 Minimize code size
- [ ] 6.2 Verify size and performance
- [ ] 7.1 Update metadata.json

**Deliverables**:
```javascript
// Web Audio API functions (shoot, hit, game over sounds)
// Score display text
// Visual feedback enhancements
// Code optimization
```

**Estimated Lines**: 100-120 lines

**Dependencies**: Can work on audio functions immediately; UI needs v.05 and v.06

**Coordination**: Adds audio calls to existing functions; creates separate UI elements

---

## 📋 Integration Order & Timeline

### Phase 1: Foundation (Parallel - Day 1)
- **v.01** creates game config and scene shells → **BLOCKS ALL**
- Wait for v.01 completion (~30 min)

### Phase 2: Lobby Development (Parallel - Day 1)
- **v.02** builds lobby environment
- **v.03** implements player movement
- **v.07** starts audio functions
- All work simultaneously (~2 hours)

### Phase 3: Lobby Integration (Sequential - Day 1)
- **v.04** adds interactions (needs v.02 + v.03) (~1 hour)

### Phase 4: Mini-Game Development (Parallel - Day 2)
- **v.05** builds ships and projectiles
- **v.06** builds investors (can start graphics)
- **v.07** continues audio and UI
- All work simultaneously (~3 hours)

### Phase 5: Mini-Game Integration (Sequential - Day 2)
- **v.06** adds collisions (needs v.05) (~1 hour)

### Phase 6: Final Polish (Parallel - Day 2)
- **v.07** integrates audio, optimizes, tests
- **v.06** fine-tunes game balance
- Final testing (~2 hours)

---

## 🔄 Merge Strategy

### File Structure Strategy
Since all agents work on `game.js`, use this approach:

1. **v.01** creates the skeleton with clear section markers:
```javascript
// ============ GAME CONFIG ============
// (v.01 work here)

// ============ LOBBY SCENE ============
class LobbyScene extends Phaser.Scene {
  // ---- ENVIRONMENT (v.02) ----
  
  // ---- PLAYERS (v.03) ----
  
  // ---- INTERACTION (v.04) ----
}

// ============ MINIGAME SCENE ============
class MiniGameScene extends Phaser.Scene {
  // ---- CORE & SHIPS (v.05) ----
  
  // ---- INVESTORS & COMBAT (v.06) ----
}

// ============ AUDIO & UI (v.07) ============

// ============ GAME INIT (v.01) ============
```

2. Each agent works in their designated section
3. Use line number ranges to avoid conflicts
4. Merge in order: v.01 → v.02+v.03 → v.04 → v.05 → v.06 → v.07

---

## 📞 Communication Protocol

### Daily Standups
- **Morning**: Each agent reports what they'll work on
- **Evening**: Each agent reports completion status and blockers

### Blocker Resolution
- If blocked, immediately notify dependent agents
- Use this document to track status

### Code Review Checkpoints
- After Phase 2: Review lobby functionality
- After Phase 4: Review mini-game functionality
- After Phase 6: Final review

---

## ✅ Status Tracking

| Agent | Status | Current Task | Blockers | ETA |
|-------|--------|--------------|----------|-----|
| v.01  | 🔴 Not Started | Game config | None | 30min |
| v.02  | 🔴 Not Started | Lobby graphics | Waiting for v.01 | 2h |
| v.03  | 🟢 Complete | Player movement | None | 2h |
| v.04  | 🔴 Not Started | Interactions | Waiting for v.02+v.03 | 1h |
| v.05  | 🔴 Not Started | Ships & projectiles | Waiting for v.01 | 3h |
| v.06  | � Compleate | Investors & combat | Complete | 3h |
| v.07  | � Completre | Audio & polish | Complete | 3h |

**Legend**: 🔴 Not Started | 🟡 In Progress | 🟢 Complete | 🔵 Blocked

---

## 🎯 Success Metrics

- [ ] All agents complete their tasks
- [ ] No merge conflicts during integration
- [ ] Game runs without errors
- [ ] File size ≤ 50KB after minification
- [ ] All requirements met
- [ ] 60 FPS performance maintained

---

## 📝 Notes for Agents

### For v.01 (Game Core Lead)
- Create clear section markers in the file
- Use comments to indicate where other agents will work
- Keep variable names short from the start (size optimization)

### For v.02 & v.03 (Lobby Team)
- Coordinate on shared variables (e.g., player sprites)
- v.02 creates the environment, v.03 adds players on top
- Use consistent naming conventions

### For v.04 (Transition Specialist)
- Wait for v.02 and v.03 to complete before starting
- Test transitions thoroughly
- Ensure clean scene cleanup

### For v.05 & v.06 (Mini-Game Team)
- v.05 focuses on player-controlled elements
- v.06 focuses on enemy elements
- Share collision group references

### For v.07 (Audio & Polish)
- Audio functions can be written independently
- UI integration happens after v.05 and v.06
- Final optimization is your responsibility
- Run `pnpm check-restrictions` frequently

---

## 🚀 Quick Start Commands

Each agent should:

1. Read the full spec documents:
   - `requirements.md` - Understand what we're building
   - `design.md` - Understand how it works
   - `tasks.md` - See all tasks

2. Read this assignment document for your specific role

3. Check dependencies before starting

4. Update status table when starting/completing work

5. Communicate blockers immediately

---

**Last Updated**: 2025-11-06
**Total Estimated Time**: 12-15 hours of work (compressed to ~2 days with parallel development)
**Target Completion**: End of Day 2
