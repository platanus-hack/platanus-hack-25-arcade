# Requirements Document

## Introduction

This document specifies the requirements for the Hackathon Arcade Lobby game - an engaging arcade experience that combines a free-roaming lobby system with an embedded mini-game. The game celebrates hackathon culture with investor-themed decorations (bananas and money) and features a "Pitch Invaders" arcade game where players defend against descending investor questions by launching successful pitches.

## Glossary

- **Game System**: The complete Phaser 3 game application including lobby and mini-game
- **Lobby Scene**: The main hackathon office environment where players can move freely
- **Mini-Game Scene**: The "Pitch Invaders" arcade game accessible from the lobby
- **Player Avatar**: The controllable character representation in the lobby
- **Arcade Station**: The interactive object in the lobby that launches the mini-game
- **Pitch Projectile**: The player-fired object in the mini-game representing a startup pitch
- **Investor Wave**: A group of descending entities in the mini-game representing investor questions
- **Score System**: The point-tracking mechanism for player performance
- **Input Handler**: The keyboard control system for player movement and actions

## Requirements

### Requirement 1: Lobby Environment

**User Story:** As a player, I want to explore a hackathon-themed lobby with decorations, so that I feel immersed in the startup culture before playing the mini-game.

#### Acceptance Criteria

1. WHEN the Game System starts, THE Game System SHALL display the Lobby Scene with dimensions of 800x600 pixels
2. THE Lobby Scene SHALL render office-themed decorations including banana graphics and money graphics
3. THE Lobby Scene SHALL include visible boundaries that prevent Player Avatars from moving outside the playable area
4. THE Lobby Scene SHALL display at least one Arcade Station that players can interact with
5. THE Lobby Scene SHALL use procedurally generated graphics to minimize file size

### Requirement 2: Player Movement and Controls

**User Story:** As a player, I want to control my avatar with keyboard inputs, so that I can navigate the lobby freely.

#### Acceptance Criteria

1. WHEN a player presses arrow keys or WASD keys, THE Input Handler SHALL move the corresponding Player Avatar in the pressed direction
2. WHILE a Player Avatar is moving, THE Game System SHALL prevent the Player Avatar from passing through Lobby Scene boundaries
3. THE Game System SHALL support simultaneous control of two Player Avatars using different key sets
4. WHEN Player Avatar 1 uses arrow keys, THE Input Handler SHALL move Player Avatar 1 accordingly
5. WHEN Player Avatar 2 uses WASD keys, THE Input Handler SHALL move Player Avatar 2 accordingly

### Requirement 3: Mini-Game Activation

**User Story:** As a player, I want to start the arcade mini-game by interacting with an arcade station, so that I can play "Pitch Invaders".

#### Acceptance Criteria

1. WHEN a Player Avatar overlaps with an Arcade Station, THE Game System SHALL display a visual indicator showing interaction is possible
2. WHEN a player presses the spacebar WHILE their Player Avatar overlaps with an Arcade Station, THE Game System SHALL transition to the Mini-Game Scene
3. THE Game System SHALL preserve the number of active players when transitioning from Lobby Scene to Mini-Game Scene
4. WHEN the Mini-Game Scene ends, THE Game System SHALL return players to the Lobby Scene

### Requirement 4: Pitch Invaders Mini-Game Core Mechanics

**User Story:** As a player, I want to play a Space Invaders-style game themed around pitching to investors, so that I can enjoy classic arcade gameplay with a hackathon twist.

#### Acceptance Criteria

1. WHEN the Mini-Game Scene starts, THE Game System SHALL display Player Avatars at the bottom of the screen
2. THE Mini-Game Scene SHALL spawn Investor Waves that descend from the top of the screen
3. WHEN a player presses the spacebar, THE Game System SHALL fire a Pitch Projectile upward from their Player Avatar position
4. WHEN a Pitch Projectile collides with an Investor Wave entity, THE Game System SHALL remove both objects and increment the Score System
5. IF an Investor Wave entity reaches the bottom of the screen, THEN THE Game System SHALL end the mini-game session

### Requirement 5: Two-Player Cooperative Gameplay

**User Story:** As a player, I want to play with a friend cooperatively, so that we can work together to achieve higher scores.

#### Acceptance Criteria

1. WHERE two players are active, THE Mini-Game Scene SHALL display two Player Avatars simultaneously
2. WHERE two players are active, THE Input Handler SHALL accept inputs from both player control schemes simultaneously
3. THE Score System SHALL track a combined score for both players in cooperative mode
4. THE Game System SHALL allow either player to fire Pitch Projectiles independently

### Requirement 6: Visual Feedback and Game State

**User Story:** As a player, I want to see my score and game status clearly, so that I understand my performance.

#### Acceptance Criteria

1. THE Mini-Game Scene SHALL display the current Score System value on screen
2. WHEN the mini-game session ends, THE Game System SHALL display the final score for 3 seconds before returning to Lobby Scene
3. THE Game System SHALL use distinct colors and shapes to differentiate between Player Avatars, Pitch Projectiles, and Investor Waves
4. THE Game System SHALL provide visual feedback when Pitch Projectiles collide with Investor Wave entities

### Requirement 7: Performance and Size Constraints

**User Story:** As a developer, I want the game to meet hackathon size restrictions, so that it qualifies for the competition.

#### Acceptance Criteria

1. THE Game System SHALL have a minified file size of 50 kilobytes or less
2. THE Game System SHALL use only procedurally generated graphics or base64-encoded data URIs
3. THE Game System SHALL not include any external network calls or imports
4. THE Game System SHALL render at 60 frames per second on standard hardware
5. THE Game System SHALL complete initialization within 2 seconds on standard hardware

### Requirement 8: Audio Feedback

**User Story:** As a player, I want to hear sound effects during gameplay, so that the experience feels more engaging.

#### Acceptance Criteria

1. WHEN a Pitch Projectile is fired, THE Game System SHALL play a short tone using Web Audio API
2. WHEN a collision occurs between a Pitch Projectile and an Investor Wave entity, THE Game System SHALL play a distinct collision tone
3. WHEN the mini-game session ends, THE Game System SHALL play an end-game tone
4. THE Game System SHALL generate all audio procedurally without external audio files
