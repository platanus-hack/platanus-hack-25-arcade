# Implementation Plan: Hackathon Arcade Lobby

## Task List

- [ ] 1. Set up game configuration and scene structure
  - Create the main Phaser game configuration with 800x600 dimensions
  - Configure Arcade physics with zero gravity
  - Define scene array with LobbyScene and MiniGameScene
  - Initialize the game instance
  - _Requirements: 1.1, 7.1, 7.5_

- [ ] 2. Implement Lobby Scene foundation
  - [ ] 2.1 Create LobbyScene class with preload, create, and update methods
    - Define the scene class extending Phaser.Scene
    - Set up scene key as 'Lobby'
    - Initialize empty preload, create, and update methods
    - _Requirements: 1.1_
  
  - [ ] 2.2 Generate procedural lobby environment graphics
    - Draw office floor with grid pattern using Graphics API
    - Create 5-8 banana decorations (yellow ellipses with brown stems) at random positions
    - Create 4-6 money decorations (green rectangles with "$" symbols) at random positions
    - Generate arcade station graphic (purple rectangle with black screen and cyan button)
    - Position arcade station at center-right of lobby (x: 600, y: 300)
    - _Requirements: 1.2, 1.5_
  
  - [ ] 2.3 Create player avatar sprites with physics
    - Generate Player 1 sprite as blue circle (radius 20) at position (100, 300)
    - Generate Player 2 sprite as red circle (radius 20) at position (700, 300)
    - Enable Arcade physics bodies for both players
    - Set collideWorldBounds to true for both players
    - Configure player body sizes to match visual representation
    - _Requirements: 2.1, 2.3_
  
  - [ ] 2.4 Implement keyboard input handling for player movement
    - Create cursor keys for Player 1 (arrow keys)
    - Create WASD keys for Player 2
    - Store input references in scene properties
    - _Requirements: 2.1, 2.4, 2.5_
  
  - [ ] 2.5 Implement player movement logic in update method
    - Check Player 1 arrow key inputs and set velocity (speed: 200)
    - Check Player 2 WASD key inputs and set velocity (speed: 200)
    - Apply velocity to player sprites based on input
    - Ensure boundary collision works correctly
    - _Requirements: 2.1, 2.2, 2.4, 2.5_
  
  - [ ] 2.6 Create arcade station interaction system
    - Add physics body to arcade station graphic
    - Set up overlap detection between players and arcade station
    - Create interaction prompt text (initially hidden)
    - Show "Press SPACE to play" when player overlaps station
    - Hide prompt when player moves away
    - _Requirements: 3.1, 3.2_
  
  - [ ] 2.7 Implement scene transition to mini-game
    - Detect spacebar press when player is at arcade station
    - Count active players (1 or 2)
    - Call scene.start('MiniGame') with player count data
    - Clean up lobby scene listeners before transition
    - _Requirements: 3.2, 3.3, 3.4_

- [ ] 3. Implement Mini-Game Scene (Pitch Invaders) core mechanics
  - [ ] 3.1 Create MiniGameScene class structure
    - Define the scene class extending Phaser.Scene
    - Set up scene key as 'MiniGame'
    - Initialize properties for score, game state, and object groups
    - Implement init method to receive player count from lobby
    - _Requirements: 4.1_
  
  - [ ] 3.2 Generate player ship graphics and positioning
    - Create ship graphic as triangle using Graphics API
    - Generate texture from graphic for Player 1 (blue) and Player 2 (red)
    - Position Player 1 ship at (100, 550)
    - Position Player 2 ship at (700, 550) if two players active
    - Enable Arcade physics for ship sprites
    - Set ship movement speed to 250
    - _Requirements: 4.1, 5.1_
  
  - [ ] 3.3 Implement ship movement controls
    - Set up left/right arrow keys for Player 1 ship
    - Set up A/D keys for Player 2 ship
    - Apply horizontal velocity based on input in update method
    - Clamp ship positions to screen boundaries (20 to 780)
    - _Requirements: 5.2_
  
  - [ ] 3.4 Create projectile (pitch) system
    - Create physics group for pitch projectiles with object pooling (maxSize: 20)
    - Generate pitch graphic as small yellow rectangle (4x15)
    - Implement shooting logic with spacebar for Player 1
    - Implement shooting logic with W key for Player 2
    - Add fire rate cooldown (300ms between shots)
    - Set projectile velocity to -400 (upward)
    - Destroy projectiles when they leave screen (y < -20)
    - _Requirements: 4.3, 5.4_
  
  - [x] 3.5 Create investor wave system
    - Generate investor graphic as green rectangle with simple face (30x30)
    - Create physics group for investors
    - Spawn 8 columns × 4 rows of investors in formation
    - Position formation starting at (100, 80) with spacing
    - Enable physics bodies for all investors
    - _Requirements: 4.2_
  
  - [x] 3.6 Implement investor movement pattern
    - Set initial horizontal movement speed (50) and direction (1)
    - Move all investors horizontally in update method
    - Detect when rightmost investor reaches boundary (x > 770)
    - Detect when leftmost investor reaches boundary (x < 30)
    - Reverse direction and descend all investors by 20 pixels at boundaries
    - _Requirements: 4.2_
  
  - [x] 3.7 Implement collision detection system
    - Set up overlap between pitches group and investors group
    - On collision: destroy both pitch and investor
    - Increment score by 10 points on each hit
    - Update score display text
    - _Requirements: 4.4, 6.1_
  
  - [x] 3.8 Implement game over conditions
    - Check if any investor reaches y > 530 (loss condition)
    - Check if investors.countActive() === 0 (win condition)
    - Pause physics on game over
    - Display "FUNDED!" (green) for win or "REJECTED!" (red) for loss
    - Show final score in game over message
    - _Requirements: 4.5_
  
  - [x] 3.9 Implement return to lobby after game over
    - Use time.delayedCall to wait 3 seconds after game over
    - Transition back to Lobby scene
    - Clean up mini-game scene listeners
    - _Requirements: 3.4, 6.2_

- [ ] 4. Implement Web Audio API sound effects
  - [ ] 4.1 Create audio context and sound generation functions
    - Initialize Web Audio API context (handle webkit prefix)
    - Create playShootSound function (440Hz, 0.1s duration)
    - Create playHitSound function (880Hz, 0.15s duration)
    - Create playGameOverSound function (440Hz to 220Hz descending, 0.5s)
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ] 4.2 Integrate sound effects into gameplay
    - Call playShootSound when projectile is fired
    - Call playHitSound when collision occurs
    - Call playGameOverSound when game ends
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 5. Implement visual feedback and UI elements
  - [ ] 5.1 Create score display in mini-game
    - Add score text at top-left (32, 32) with white color
    - Initialize score to 0
    - Update text whenever score changes
    - _Requirements: 6.1_
  
  - [ ] 5.2 Add visual feedback for collisions
    - Use distinct colors for different object types (players, pitches, investors)
    - Ensure destroyed objects disappear immediately
    - _Requirements: 6.3, 6.4_
  
  - [ ] 5.3 Create game over screen
    - Display centered text with final score
    - Use appropriate color based on win/loss
    - Set font size to 48px for visibility
    - _Requirements: 6.2_

- [ ] 6. Optimize for size constraints
  - [ ] 6.1 Minimize code size
    - Shorten variable names where possible
    - Remove unnecessary comments
    - Combine similar logic
    - Extract repeated values to constants
    - _Requirements: 7.1_
  
  - [ ] 6.2 Verify size and performance
    - Run `pnpm check-restrictions` to verify file size ≤ 50KB
    - Test game runs at 60 FPS
    - Verify no network calls or imports
    - Check initialization completes within 2 seconds
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 7. Update metadata and cover image
  - [ ] 7.1 Update metadata.json
    - Set game_name to "Hackathon Arcade Lobby"
    - Write engaging description highlighting lobby exploration and Pitch Invaders mini-game
    - _Requirements: All_
  
  - [ ]* 7.2 Create cover.png image
    - Design 800x600 pixel cover image showing lobby and mini-game
    - Include visual elements: bananas, money, arcade station, investor sprites
    - Export as PNG format
    - _Requirements: All_

- [ ]* 8. Final testing and polish
  - [ ]* 8.1 Conduct comprehensive playthrough testing
    - Test single-player mode in lobby and mini-game
    - Test two-player mode in lobby and mini-game
    - Verify all interactions work correctly
    - Check scene transitions are smooth
    - Confirm audio plays correctly
    - _Requirements: All_
  
  - [ ]* 8.2 Performance validation
    - Monitor frame rate during gameplay
    - Check for memory leaks during scene transitions
    - Verify game runs smoothly with both players active
    - _Requirements: 7.4, 7.5_
  
  - [ ]* 8.3 Final size check and optimization
    - Run final `pnpm check-restrictions` check
    - If over 50KB, identify and remove non-essential code
    - Verify all restrictions are met (no imports, no network calls, etc.)
    - _Requirements: 7.1, 7.2, 7.3_
