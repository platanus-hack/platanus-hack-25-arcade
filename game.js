// Bubble Shooter Game for Platanus Hack 25
// Using Phaser 3 - No imports, pure vanilla JS

const Phaser = window.Phaser // Declare the Phaser variable

// Arcade controls mapping for local testing
const ARCADE_CONTROLS = {
  P1U: ['KeyW', 'ArrowUp'], // Aim up
  P1D: ['KeyS', 'ArrowDown'], // Aim down
  P1L: ['KeyQ'], // Move cannon left (only Q)
  P1R: ['KeyE'], // Move cannon right (only E)
  P1A: ['KeyU', 'Space'], // Shoot
  P1B: ['KeyL'], // Aim right
  P1C: ['KeyO'],
  P1X: ['KeyJ'], // Aim left
  P1Y: ['KeyK'],
  P1Z: ['KeyL'],
  START1: ['KeyR'],
  P2U: ['ArrowUp', 'KeyW'], // Aim up
  P2D: ['ArrowDown', 'KeyS'], // Aim down
  P2L: ['KeyQ'], // Move cannon left (only Q)
  P2R: ['KeyE'], // Move cannon right (only E)
  P2DL: [],
  P2DR: [],
  P2A: ['KeyR', 'Space'], // Shoot
  P2B: ['KeyH'], // Aim right
  P2C: ['KeyY'],
  P2X: ['KeyF'], // Aim left
  P2Y: ['KeyG'],
  P2Z: ['KeyH'],
  START2: ['KeyP']
}

// Alternative keyboard controls for easier testing
const ALTERNATIVE_CONTROLS = {
  // Player 1
  P1_LEFT: ['KeyA'], // Move left
  P1_RIGHT: ['KeyD'], // Move right
  P1_AIM_LEFT: ['KeyQ'], // Aim left
  P1_AIM_RIGHT: ['KeyE'], // Aim right
  P1_AIM_UP: ['KeyW'], // Aim up
  P1_AIM_DOWN: ['KeyS'], // Aim down
  P1_SHOOT: ['Space'], // Shoot

  // Player 2
  P2_LEFT: ['KeyJ'], // Move left
  P2_RIGHT: ['KeyL'], // Move right
  P2_AIM_LEFT: ['KeyU'], // Aim left
  P2_AIM_RIGHT: ['KeyO'], // Aim right
  P2_AIM_UP: ['KeyI'], // Aim up
  P2_AIM_DOWN: ['KeyK'], // Aim down
  P2_SHOOT: ['Enter'], // Shoot
}

class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" })
  }

  create() {
    // Enhanced animated background with multiple layers
    const bgGraphics = this.add.graphics()
    bgGraphics.fillGradientStyle(0x0f0f23, 0x1a1a2e, 0x16213e, 0x0f0f23, 1)
    bgGraphics.fillRect(0, 0, 800, 600)

    // Animated starfield background
    for (let i = 0; i < 100; i++) {
      const star = this.add.graphics()
      star.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.2, 0.8))
      const size = Phaser.Math.Between(1, 4)
      star.fillCircle(Phaser.Math.Between(0, 800), Phaser.Math.Between(0, 600), size)
      star.setDepth(-3)

      // Twinkling effect
      this.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.2, 1),
        duration: Phaser.Math.Between(2000, 5000),
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      })
    }

    // Large floating bubbles in background
    for (let i = 0; i < 15; i++) {
      const bubble = this.add.graphics()
      const colors = [0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xfeca57, 0xff9ff3, 0x54a0ff, 0x74b9ff, 0xa29bfe]
      const color = Phaser.Utils.Array.GetRandom(colors)
      bubble.fillStyle(color, 0.1)
      const size = Phaser.Math.Between(80, 150)
      bubble.fillCircle(Phaser.Math.Between(0, 800), Phaser.Math.Between(0, 600), size)
      bubble.setDepth(-2)

      // Complex floating animation
      this.tweens.add({
        targets: bubble,
        x: bubble.x + Phaser.Math.Between(-100, 100),
        y: bubble.y - Phaser.Math.Between(30, 80),
        scaleX: Phaser.Math.FloatBetween(0.8, 1.2),
        scaleY: Phaser.Math.FloatBetween(0.8, 1.2),
        alpha: Phaser.Math.FloatBetween(0.05, 0.15),
        duration: Phaser.Math.Between(8000, 15000),
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 5000)
      })
    }

    // Medium animated bubbles
    for (let i = 0; i < 25; i++) {
      const bubble = this.add.graphics()
      const colors = [0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xfeca57, 0xff9ff3, 0x54a0ff]
      const color = Phaser.Utils.Array.GetRandom(colors)
      bubble.fillStyle(color, 0.2)
      const size = Phaser.Math.Between(30, 70)
      bubble.fillCircle(Phaser.Math.Between(0, 800), Phaser.Math.Between(0, 600), size)
      bubble.setDepth(-1)

      // Enhanced floating animation with rotation
      this.tweens.add({
        targets: bubble,
        x: bubble.x + Phaser.Math.Between(-50, 50),
        y: bubble.y - Phaser.Math.Between(20, 60),
        rotation: Phaser.Math.FloatBetween(-0.5, 0.5),
        alpha: Phaser.Math.FloatBetween(0.1, 0.3),
        duration: Phaser.Math.Between(4000, 10000),
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 3000)
      })
    }

    // Creator name - moved to top left corner
    const creatorName = this.add.text(20, 20, "Exequiel Alvarado", {
      fontSize: "18px",
      fill: "#ffe66d",
      fontFamily: "Arial",
      fontStyle: "bold",
      stroke: "#4ecdc4",
      strokeThickness: 1,
    })
    creatorName.setOrigin(0, 0)

    // Enhanced title with multiple effects - moved down for better spacing
    const title = this.add.text(400, 120, "BUBBLE POP", {
      fontSize: "72px",
      fill: "#4ecdc4",
      fontFamily: "Arial",
      fontStyle: "bold",
      stroke: "#ffffff",
      strokeThickness: 6,
    })
    title.setOrigin(0.5)

    // Add multiple glow effects to title
    this.tweens.add({
      targets: title,
      scaleX: 1.06,
      scaleY: 1.06,
      duration: 2500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    })

    // Pulsing glow effect
    this.tweens.add({
      targets: title,
      alpha: 0.9,
      duration: 1500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
      delay: 500
    })

    // Color cycling effect
    const colors = ['#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff']
    let colorIndex = 0
    this.time.addEvent({
      delay: 800,
      callback: () => {
        colorIndex = (colorIndex + 1) % colors.length
        title.setStyle({ fill: colors[colorIndex] })
      },
      loop: true
    })

    // Enhanced subtitle with multiple effects - moved down
    const subtitle = this.add.text(400, 200, "¡Explota burbujas del mismo color!", {
      fontSize: "28px",
      fill: "#ffe66d",
      fontFamily: "Arial",
      fontStyle: "bold",
    })
    subtitle.setOrigin(0.5)

    // Enhanced pulsing and scaling effects
    this.tweens.add({
      targets: subtitle,
      alpha: 0.8,
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    })

    // Secondary subtitle - moved down
    const subtitle2 = this.add.text(400, 240, "Platanus Hack 25 Arcade Challenge", {
      fontSize: "18px",
      fill: "#96ceb4",
      fontFamily: "Arial",
      fontStyle: "italic",
    })
    subtitle2.setOrigin(0.5)

    // Subtle fade effect for secondary subtitle
    this.tweens.add({
      targets: subtitle2,
      alpha: 0.6,
      duration: 3000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
      delay: 1000
    })

    // Enhanced instructions panel with better visual hierarchy - moved down
    const instructionsBg = this.add.graphics()
    instructionsBg.fillStyle(0x000000, 0.8)
    instructionsBg.fillRoundedRect(150, 300, 500, 120, 15)
    instructionsBg.lineStyle(3, 0x4ecdc4, 1)
    instructionsBg.strokeRoundedRect(150, 300, 500, 120, 15)

    const instructions = this.add.text(
      400,
      315,
      "\n"+
      "🎯 OBJETIVO: Conecta 3+ burbujas del mismo color\n\n⚠️ ¡CUIDADO! \n Después de 1 minuto las burbujas caen automáticamente\n\n💎 ¡Elimina todas las burbujas para ganar!",
      {
        fontSize: "15px",
        fill: "#ffffff",
        fontFamily: "Arial",
        fontStyle: "bold",
        align: "center",
        lineSpacing: 6,
      },
    )
    instructions.setOrigin(0.5)

    // Enhanced controls panel - made more compact
    const controlsBg = this.add.graphics()
    controlsBg.fillStyle(0x000000, 0.8)
    controlsBg.fillRoundedRect(150, 430, 500, 80, 15)
    controlsBg.lineStyle(3, 0xff9ff3, 1)
    controlsBg.strokeRoundedRect(150, 430, 500, 80, 15)

    const controls = this.add.text(
      400,
      445,
      "\n"+
      "\n"+
      "🎮 CONTROLES: presiona 1 o 2 para iniciar\n" +
      "🎯 J1: A|D (mover) • Q|W|E|S (apuntar) • ESPACIO (disparar)\n" +
      "🎯 J2: J|L (mover) • U|I|O|K (apuntar) • ENTER (disparar)",
      {
        fontSize: "14px",
        fill: "#ffe66d",
        fontFamily: "Arial",
        fontStyle: "bold",
        align: "center",
        lineSpacing: 2,
      },
    )
    controls.setOrigin(0.5)

    // Enhanced player selection section - moved up to fit everything
    const playerText = this.add.text(400, 520, "🎯 SELECCIONA TU MODO DE JUEGO", {
      fontSize: "22px",
      fill: "#c5f714ff",
      fontFamily: "Arial",
      fontStyle: "bold",
      stroke: "#030000ff",
      strokeThickness: 2,
    })
    playerText.setOrigin(0.5)

    // Pulsing effect for player selection text
    this.tweens.add({
      targets: playerText,
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 1800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    })

    // 1 Player button with enhanced styling - moved up
    const onePlayerButton = this.add.container(300, 550)
    const onePlayerBg = this.add.graphics()
    onePlayerBg.fillStyle(0x4ecdc4, 1)
    onePlayerBg.fillRoundedRect(-75, -18, 150, 36, 8)
    onePlayerBg.lineStyle(3, 0xffffff, 1)
    onePlayerBg.strokeRoundedRect(-75, -18, 150, 36, 8)

    const onePlayerText = this.add.text(0, 0, "🏆 1 JUGADOR", {
      fontSize: "18px",
      fill: "#1a1a2e",
      fontFamily: "Arial",
      fontStyle: "bold",
    })
    onePlayerText.setOrigin(0.5)

    onePlayerButton.add([onePlayerBg, onePlayerText])
    onePlayerButton.setInteractive({ useHandCursor: true })

    // 2 Players button with enhanced styling - moved up
    const twoPlayersButton = this.add.container(500, 550)
    const twoPlayersBg = this.add.graphics()
    twoPlayersBg.fillStyle(0xff6b6b, 1)
    twoPlayersBg.fillRoundedRect(-75, -18, 150, 36, 8)
    twoPlayersBg.lineStyle(3, 0xffffff, 1)
    twoPlayersBg.strokeRoundedRect(-75, -18, 150, 36, 8)

    const twoPlayersText = this.add.text(0, 0, "👥 2 JUGADORES", {
      fontSize: "18px",
      fill: "#1a1a2e",
      fontFamily: "Arial",
      fontStyle: "bold",
    })
    twoPlayersText.setOrigin(0.5)

    twoPlayersButton.add([twoPlayersBg, twoPlayersText])
    twoPlayersButton.setInteractive({ useHandCursor: true })

    // Enhanced button hover effects
    const setHoverEffect = (button, bg, text, originalColor) => {
      button.on("pointerover", () => {
        bg.clear()
        bg.fillStyle(0xffffff, 1)
        bg.fillRoundedRect(-80, -20, 160, 40, 8)
        bg.lineStyle(3, originalColor, 1)
        bg.strokeRoundedRect(-80, -20, 160, 40, 8)
        text.setStyle({ fill: originalColor })

        // Scale animation
        this.tweens.add({
          targets: button,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 200,
          ease: 'Back.easeOut'
        })
      })

      button.on("pointerout", () => {
        bg.clear()
        bg.fillStyle(originalColor, 1)
        bg.fillRoundedRect(-80, -20, 160, 40, 8)
        bg.lineStyle(3, 0xffffff, 1)
        bg.strokeRoundedRect(-80, -20, 160, 40, 8)
        text.setStyle({ fill: "#1a1a2e" })

        // Scale back
        this.tweens.add({
          targets: button,
          scaleX: 1,
          scaleY: 1,
          duration: 200,
          ease: 'Back.easeOut'
        })
      })
    }

    setHoverEffect(onePlayerButton, onePlayerBg, onePlayerText, 0x4ecdc4)
    setHoverEffect(twoPlayersButton, twoPlayersBg, twoPlayersText, 0xff6b6b)

    onePlayerButton.on("pointerdown", () => {
      this.scene.start("GameScene", { numPlayers: 1 })
    })

    twoPlayersButton.on("pointerdown", () => {
      this.scene.start("GameScene", { numPlayers: 2 })
    })

    // Add keyboard controls for menu
    this.input.keyboard.on('keydown-ONE', () => {
      this.scene.start("GameScene", { numPlayers: 1 })
    })

    this.input.keyboard.on('keydown-TWO', () => {
      this.scene.start("GameScene", { numPlayers: 2 })
    })

    this.input.keyboard.on('keydown-SPACE', () => {
      this.scene.start("GameScene", { numPlayers: 1 })
    })

    // High scores preview
    this.displayHighScoresPreview()
  }

  displayHighScoresPreview() {
    const highScores = getHighScores()
    if (highScores.length > 0) {
      let text = "MEJORES PUNTAJES:\n\n"
      const top10 = highScores.slice(0, 10)
      top10.forEach((entry, index) => {
        text += `${index + 1}. ${entry.name}: ${entry.score}\n`
      })

      const scoresText = this.add.text(400, 520, text, {
        fontSize: "16px",
        fill: "#ffe66d",
        fontFamily: "Arial",
        align: "center",
      })
      scoresText.setOrigin(0.5, 0)
    }
  }
}

class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameOverScene" })
  }

  init(data) {
    this.finalScores = data.scores || [data.score || 0]
    this.playerWon = data.won || false
    this.numPlayers = data.numPlayers || 1
    this.gameTime = data.gameTime || 0
    this.layersCleared = data.layersCleared || 0
    this.difficultyLevel = data.difficultyLevel || 0
  }

  create() {
    // Enhanced background with animated gradient
    const bgGraphics = this.add.graphics()
    bgGraphics.fillGradientStyle(0x1a1a2e, 0x16213e, 0x0f3460, 0x1a1a2e, 1)
    bgGraphics.fillRect(0, 0, 800, 600)

    // Add animated particles for atmosphere
    for (let i = 0; i < 25; i++) {
      const particle = this.add.graphics()
      const colors = [0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xfeca57, 0xff9ff3, 0x54a0ff]
      const color = Phaser.Utils.Array.GetRandom(colors)
      particle.fillStyle(color, Phaser.Math.FloatBetween(0.2, 0.5))
      const size = Phaser.Math.Between(3, 12)
      particle.fillCircle(Phaser.Math.Between(0, 800), Phaser.Math.Between(0, 600), size)

      // Floating animation with varying speeds
      this.tweens.add({
        targets: particle,
        y: particle.y - Phaser.Math.Between(20, 80),
        x: particle.x + Phaser.Math.Between(-30, 30),
        alpha: 0,
        duration: Phaser.Math.Between(4000, 10000),
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 3000)
      })
    }

    // Animated particles for celebration or defeat
    for (let i = 0; i < 30; i++) {
      const particle = this.add.graphics()
      const color = this.playerWon ? 0x4ecdc4 : 0xff6b6b
      particle.fillStyle(color, Phaser.Math.FloatBetween(0.3, 0.8))
      const size = Phaser.Math.Between(2, 8)
      particle.fillCircle(Phaser.Math.Between(0, 800), Phaser.Math.Between(0, 600), size)

      // Floating animation
      this.tweens.add({
        targets: particle,
        y: particle.y - Phaser.Math.Between(50, 150),
        alpha: 0,
        duration: Phaser.Math.Between(2000, 4000),
        ease: 'Sine.easeOut',
        delay: Phaser.Math.Between(0, 1000)
      })
    }

    // Game Over title with enhanced styling - moved up
    const titleText = this.playerWon ? "🎉 ¡GANASTE!" : "💥 GAME OVER"
    const titleColor = this.playerWon ? "#4ecdc4" : "#ff6b6b"
    const gameOverText = this.add.text(400, 80, titleText, {
      fontSize: "64px",
      fill: titleColor,
      fontFamily: "Arial",
      fontStyle: "bold",
      stroke: "#ffffff",
      strokeThickness: 4,
    })
    gameOverText.setOrigin(0.5)

    // Add glow effect
    this.tweens.add({
      targets: gameOverText,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    })

    // Enhanced final statistics display - moved up and made larger
    const statsBg = this.add.graphics()
    statsBg.fillStyle(0x000000, 0.9)
    statsBg.fillRoundedRect(150, 140, 500, 280, 20)
    statsBg.lineStyle(4, 0x4ecdc4, 1)
    statsBg.strokeRoundedRect(150, 140, 500, 280, 20)

    const statsTitle = this.add.text(400, 170, "📊 ESTADÍSTICAS FINALES", {
      fontSize: "28px",
      fill: "#ffe66d",
      fontFamily: "Arial",
      fontStyle: "bold",
    })
    statsTitle.setOrigin(0.5)

    // Game time - larger and more prominent
    const minutes = Math.floor(this.gameTime / 60)
    const seconds = Math.floor(this.gameTime % 60)
    const timeText = this.add.text(200, 210, `⏱️ TIEMPO JUGADO: ${minutes}:${seconds.toString().padStart(2, '0')}`, {
      fontSize: "20px",
      fill: "#ffffff",
      fontFamily: "Arial",
      fontStyle: "bold",
    })

    // Layers cleared - larger
    const layersText = this.add.text(200, 240, `📚 CAPAS LIMPIADAS: ${this.layersCleared}`, {
      fontSize: "20px",
      fill: "#ffffff",
      fontFamily: "Arial",
      fontStyle: "bold",
    })

    // Difficulty level - larger
    const difficultyText = this.add.text(200, 270, `🎯 NIVEL DE DIFICULTAD: ${this.difficultyLevel}`, {
      fontSize: "20px",
      fill: "#ffffff",
      fontFamily: "Arial",
      fontStyle: "bold",
    })

    // Individual scores - larger and more prominent
    for (let i = 0; i < this.numPlayers; i++) {
      const yPos = 310 + (i * 30)
      const playerScoreText = this.add.text(200, yPos, `🏆 JUGADOR ${i + 1}: ${this.finalScores[i]} PUNTOS`, {
        fontSize: "22px",
        fill: i === 0 ? "#4ecdc4" : "#ff6b6b",
        fontFamily: "Arial",
        fontStyle: "bold",
        stroke: "#ffffff",
        strokeThickness: 1,
      })
    }

    // Calculate and show total score - larger and more prominent
    const totalScore = this.finalScores.reduce((sum, score) => sum + score, 0)
    const totalText = this.add.text(400, 380, `⭐ PUNTAJE TOTAL: ${totalScore}`, {
      fontSize: "26px",
      fill: "#ffe66d",
      fontFamily: "Arial",
      fontStyle: "bold",
      stroke: "#4ecdc4",
      strokeThickness: 2,
    }).setOrigin(0.5)

    // Check if it's a high score (only for losses, wins always save)
    if (this.playerWon) {
      const congratsText = this.add.text(400, 430, "¡FELICITACIONES!", {
        fontSize: "32px",
        fill: "#ffe66d",
        fontFamily: "Arial",
        fontStyle: "bold",
        stroke: "#4ecdc4",
        strokeThickness: 2,
      })
      congratsText.setOrigin(0.5)

      // Pulsing animation for congratulations
      this.tweens.add({
        targets: congratsText,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 1000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      })

      this.time.delayedCall(3000, () => this.showHighScoresAndRestart())
    } else {
      // For losses, check if any player got a high score
      const maxScore = Math.max(...this.finalScores)
      if (isHighScore(maxScore)) {
        const highScoreText = this.add.text(400, 430, "NUEVO RÉCORD!", {
          fontSize: "32px",
          fill: "#ffe66d",
          fontFamily: "Arial",
          fontStyle: "bold",
          stroke: "#ff6b6b",
          strokeThickness: 2,
        })
        highScoreText.setOrigin(0.5)

        // Pulsing animation for new record
        this.tweens.add({
          targets: highScoreText,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 1000,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1
        })

        const promptText = this.add.text(400, 470, "Ingresa tus 3 iniciales:", {
          fontSize: "24px",
          fill: "#fff",
          fontFamily: "Arial",
          fontStyle: "bold",
        })
        promptText.setOrigin(0.5)

        this.createNameInput()
      } else {
        this.showHighScoresAndRestart()
      }
    }
      try {
        // Save the highest score from multiplayer
        const maxScore = Math.max(...this.finalScores)
        saveHighScore('MULTIPLAYER', maxScore)
      } catch (e) {
        console.log('Error guardando score automáticamente', e)
      }

      // Mostrar el top score (nombre y puntaje) en la parte superior central
      const highScores = getHighScores()
      let topTextStr = 'No high scores yet'
      if (highScores && highScores.length > 0) {
        const top = highScores[0]
        topTextStr = `${top.name}: ${top.score}`
      }
      const topScoreText = this.add.text(400, 80, topTextStr, { fontSize: '28px', fill: '#ffe66d', fontFamily: 'Arial' }).setOrigin(0.5)
      topScoreText.setDepth(30)

      // Mostrar puntajes de los jugadores en la esquina superior derecha (refuerzo)
      // Note: This is handled in GameScene now with multiple score texts

      const container = document.getElementById('game-container')

      // Si, tras el guardado automático, nuestro score quedó en primer lugar, permitir editar el nombre del primer puesto
      const updated = getHighScores()
      const maxScore = Math.max(...this.finalScores)
      const isNowTop = updated && updated.length > 0 && updated[0].score === maxScore && updated[0].name === 'MULTIPLAYER'

      if (isNowTop) {
        // Mostrar input para reemplazar 'YOU' por el nombre real en la posición 0
        const wrapper = document.createElement('div')
        wrapper.style.position = 'absolute'
        wrapper.style.left = '50%'
        wrapper.style.top = '360px'
        wrapper.style.transform = 'translate(-50%, -50%)'
        wrapper.style.zIndex = '1000'
        wrapper.style.textAlign = 'center'

        const prompt = document.createElement('div')
        prompt.textContent = '¡NUEVO RÉCORD! Ingresa tus 3 iniciales para el #1:'
        prompt.style.color = '#ffe66d'
        prompt.style.fontFamily = 'Arial'
        prompt.style.marginBottom = '8px'
        wrapper.appendChild(prompt)

        const input = document.createElement('input')
        input.type = 'text'
        input.maxLength = 12
        input.placeholder = 'TU NOMBRE'
        input.style.padding = '8px 12px'
        input.style.fontSize = '16px'
        input.style.border = '2px solid #4ecdc4'
        input.style.borderRadius = '4px'
        input.style.background = '#0b1220'
        input.style.color = '#fff'
        input.style.outline = 'none'
        wrapper.appendChild(input)

        const btn = document.createElement('button')
        btn.textContent = 'GUARDAR'
        btn.style.marginLeft = '8px'
        btn.style.padding = '8px 12px'
        btn.style.fontSize = '16px'
        btn.style.border = 'none'
        btn.style.borderRadius = '4px'
        btn.style.background = '#4ecdc4'
        btn.style.cursor = 'pointer'
        wrapper.appendChild(btn)

        container.appendChild(wrapper)
        input.focus()

        const cleanup = () => { try { container.removeChild(wrapper) } catch (e) { } }

        const submit = () => {
          const name = (input.value || '').trim().toUpperCase() || 'YOU'
          if (name.length > 3) return // Don't accept if longer than 3 chars

          // Save the high score
          const maxScore = Math.max(...this.finalScores)
          saveHighScore(name, maxScore)

          cleanup()
          // Mostrar lista top10
          showTop10.call(this)
        }

        btn.onclick = submit
        input.addEventListener('keypress', (e) => { if (e.key === 'Enter') submit() })
      } else {
        // No es primer puesto: mostrar lista top10 automáticamente
        showTop10.call(this)
      }

      // Muestra la lista top10 centrada en la pantalla
      function showTop10() {
        const hs = getHighScores()
        let text = 'TOP 10\n\n'
        if (!hs || hs.length === 0) text += 'No scores yet!'
        else {
          const top10 = hs.slice(0,10)
          top10.forEach((e, i) => { text += `${i+1}. ${e.name}: ${e.score}\n` })
        }
        const scoresText = this.add.text(400, 200, text, { fontSize: '18px', fill: '#ffe66d', fontFamily: 'Arial', align: 'center' }).setOrigin(0.5)
        scoresText.setDepth(30)

        // Reiniciar
        const restartText = this.add.text(400, 460, 'REINICIAR', { fontSize: '26px', fill: '#000', fontFamily: 'Arial', backgroundColor: '#4ecdc4', padding: { x: 14, y: 8 } }).setOrigin(0.5)
        restartText.setInteractive({ useHandCursor: true })
        restartText.setDepth(30)
        restartText.on('pointerdown', () => this.scene.restart())
        this.input.keyboard.once('keydown-R', () => this.scene.restart())
        this.input.keyboard.once('keydown-SPACE', () => this.scene.restart())
      }
  }

  createNameInput() {
    const input = document.createElement("input")
    input.type = "text"
    input.maxLength = 3
    input.placeholder = "ABC"
    input.style.position = "absolute"
    input.style.left = "50%"
    input.style.top = "55%"
    input.style.transform = "translate(-50%, -50%)"
    input.style.padding = "12px"
    input.style.fontSize = "24px"
    input.style.textAlign = "center"
    input.style.border = "3px solid #ffd700"
    input.style.borderRadius = "8px"
    input.style.backgroundColor = "#1a1a2e"
    input.style.color = "#fff"
    input.style.outline = "none"
    input.style.zIndex = "1000"
    input.style.fontFamily = "Arial"
    input.style.fontWeight = "bold"
    input.style.textTransform = "uppercase"

    const container = document.getElementById("game-container")
    container.appendChild(input)
    input.focus()

    const button = document.createElement("button")
    button.textContent = "GUARDAR"
    button.style.position = "absolute"
    button.style.left = "50%"
    button.style.top = "65%"
    button.style.transform = "translate(-50%, -50%)"
    button.style.padding = "12px 40px"
    button.style.fontSize = "20px"
    button.style.border = "none"
    button.style.borderRadius = "8px"
    button.style.backgroundColor = "#4ecdc4"
    button.style.color = "#1a1a2e"
    button.style.cursor = "pointer"
    button.style.fontWeight = "bold"
    button.style.zIndex = "1000"
    button.style.fontFamily = "Arial"

    container.appendChild(button)

    const submitScore = () => {
      const name = input.value.trim().toUpperCase() || "YOU"
      if (name.length > 3) return // Don't accept if longer than 3 chars

      const maxScore = Math.max(...this.finalScores)
      saveHighScore(name, maxScore)

      container.removeChild(input)
      container.removeChild(button)

      // Update the ranking display
      this.displayGameRanking()

      this.showHighScoresAndRestart()
    }

    button.onclick = submitScore
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        submitScore()
      }
    })

    // Auto-uppercase input
    input.addEventListener("input", (e) => {
      e.target.value = e.target.value.toUpperCase()
    })
  }

  showHighScoresAndRestart() {
    // Display high scores
    const highScores = getHighScores()
    let text = "TOP SCORES\n\n"
    const top10 = highScores.slice(0, 10)

    if (top10.length === 0) {
      text += "No scores yet!"
    } else {
      top10.forEach((entry, index) => {
        text += `${index + 1}. ${entry.name}: ${entry.score}\n`
      })
    }

    const scoresText = this.add.text(400, 380, text, {
      fontSize: "16px",
      fill: "#ffe66d",
      fontFamily: "Arial",
      align: "center",
    })
    scoresText.setOrigin(0.5, 0)

    // Restart button
    const restartText = this.add.text(400, 520, "Press R to Restart", {
      fontSize: "24px",
      fill: "#4ecdc4",
      fontFamily: "Arial",
    })
    restartText.setOrigin(0.5)

    this.input.keyboard.on("keydown-R", () => {
      this.scene.start("MenuScene")
    })
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  init(data) {
    this.numPlayers = data.numPlayers || 1;
    this.currentPlayer = 0; // 0 for player 1, 1 for player 2
    this.simultaneousMode = this.numPlayers === 2; // Both players play simultaneously in 2-player mode
    this.scores = [0, 0];
    this.gameOver = false;
    this.shooters = [];
    this.currentBubbles = [];
    this.gameTime = 0; // Game timer in seconds
    this.difficultyLevel = 0; // Current difficulty level
    this.nextLayerTime = 60; // Time until next layer drops (60 seconds)
    this.layerDropInterval = 60; // Base interval between layer drops
    this.maxLayers = 5; // Maximum number of layers to drop
    this.layersDropped = 0; // Number of layers already dropped
    this.gravityFallActive = false; // Flag for continuous falling after 1 minute
  }

  preload() {
    // No external assets needed
  }

  create() {
    // Inicializar variables del juego
    this.bubbleGrid = [];
    this.gameOver = false;

    // Start background music
    this.startBackgroundMusic();

    // Enhanced background
    const bgGraphics = this.add.graphics()
    bgGraphics.fillGradientStyle(0x0f0f23, 0x1a1a2e, 0x16213e, 0x0f0f23, 1)
    bgGraphics.fillRect(0, 0, 800, 600)

    // Animated starfield background
    for (let i = 0; i < 50; i++) {
      const star = this.add.graphics()
      star.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.3, 0.8))
      const size = Phaser.Math.Between(1, 3)
      star.fillCircle(Phaser.Math.Between(0, 800), Phaser.Math.Between(0, 600), size)
      star.setDepth(-2)

      // Twinkling effect
      this.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.3, 1),
        duration: Phaser.Math.Between(1000, 3000),
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 1000)
      })
    }

    // Game area border
    const borderGraphics = this.add.graphics()
    borderGraphics.lineStyle(4, 0x4ecdc4, 1)
    borderGraphics.strokeRect(10, 10, 780, 580)
    borderGraphics.setDepth(-1)

    // Línea roja de game over con efecto
    this.gameOverLine = this.add.graphics();
    this.gameOverLine.lineStyle(6, 0xff0000, 1);
    this.gameOverLine.lineBetween(0, 500, 800, 500);

    // Animated danger zone indicator
    this.dangerZone = this.add.graphics()
    this.dangerZone.fillStyle(0xff0000, 0.1)
    this.dangerZone.fillRect(0, 500, 800, 100)
    this.dangerZone.setDepth(-1)

    this.tweens.add({
      targets: this.dangerZone,
      alpha: 0.3,
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    })

    this.COLORS = [0x16de67, 0x16adde, 0x7513be, 0x5d0948, 0xbe13a2, 0xde1652, 0xed9f4f, 0xff4500, 0xd0ed4f, 0x40e0d0, 0x2fead7, 0xf7b0cd]
    this.BUBBLE_SIZE = 40
    this.GRID_ROWS = 8
    this.GRID_COLS = 15
    this.SHOOTER_Y = 550
    this.GAME_OVER_LINE_Y = 500
    this.highScoresText = null
    this.nameInputActive = false
    this.audioContext = this.sound.context

    // Create shooters for each player
    for (let i = 0; i < this.numPlayers; i++) {
      const shooter = this.add.graphics()
      shooter.x = 400
      shooter.y = this.SHOOTER_Y
      shooter.playerIndex = i
      shooter.aimAngle = 0 // Angle for aiming (0 = straight up, positive = right, negative = left)
      shooter.aimVerticalAngle = 0 // Vertical angle for aiming
      this.shooters.push(shooter)
      this.drawShooter(shooter)

      // Create current bubble for each player
      this.createNewBubble(i)
    }

    // Initialize aiming preview
    this.aimPreview = this.add.graphics()
    this.aimPreview.setDepth(5)

    // Show initial trajectory preview
    this.time.delayedCall(500, () => {
      this.updateAimPreview()
    })

    // Update trajectory preview continuously
    this.time.addEvent({
      delay: 50, // Update every 50ms for smooth preview
      callback: () => {
        if (!this.gameOver && !this.nameInputActive) {
          this.updateAimPreview()
        }
      },
      loop: true
    })

    // Initialize bubble grid
    this.initializeBubbleGrid()

    // Draw game over line
    this.drawGameOverLine()

    // Enhanced score display with panels
    this.scoreTexts = []
    this.topRightScoreTexts = []
    for (let i = 0; i < this.numPlayers; i++) {
      // Score panel background
      const panelBg = this.add.graphics()
      panelBg.fillStyle(i === 0 ? 0x4ecdc4 : 0xff6b6b, 0.8)
      panelBg.fillRoundedRect(10, 10 + (i * 45), 180, 35, 5)
      panelBg.lineStyle(2, 0xffffff, 1)
      panelBg.strokeRoundedRect(10, 10 + (i * 45), 180, 35, 5)

      const scoreText = this.add.text(20, 15 + (i * 45), `🎯 Jugador ${i + 1}: 0`, {
        fontSize: "16px",
        fill: "#1a1a2e",
        fontFamily: "Arial",
        fontStyle: "bold",
      })
      this.scoreTexts.push(scoreText)

      // Top-right mini score with glow effect
      const topRightBg = this.add.graphics()
      topRightBg.fillStyle(i === 0 ? 0x4ecdc4 : 0xff6b6b, 0.9)
      topRightBg.fillRoundedRect(780, 8 + (i * 30), 10, 20, 2)

      const topRightText = this.add.text(784, 10 + (i * 30), `${this.scores[i]}`, {
        fontSize: "14px",
        fill: "#ffffff",
        fontFamily: "Arial",
        fontStyle: "bold",
        stroke: i === 0 ? "#4ecdc4" : "#ff6b6b",
        strokeThickness: 1,
      }).setOrigin(1, 0)
      this.topRightScoreTexts.push(topRightText)
    }

    // Enhanced current player indicator with animation
    const playerIndicatorBg = this.add.graphics()
    playerIndicatorBg.fillStyle(0x4ecdc4, 0.9)
    playerIndicatorBg.fillRoundedRect(350, 10, 100, 30, 8)

    const playerText = this.simultaneousMode ? "🎮 MODO SIMULTÁNEO" : `🎮 Jugador ${this.currentPlayer + 1}`
    this.currentPlayerText = this.add.text(400, 25, playerText, {
      fontSize: "16px",
      fill: "#1a1a2e",
      fontFamily: "Arial",
      fontStyle: "bold",
    }).setOrigin(0.5)

    // Add debug text to show current controls
    this.debugText = this.add.text(10, 570, "DEBUG: Presiona teclas para probar controles", {
      fontSize: "12px",
      fill: "#ffffff",
      fontFamily: "Arial",
    }).setDepth(100)

    // Pulsing animation for current player indicator
    this.tweens.add({
      targets: playerIndicatorBg,
      alpha: 0.7,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    })

    // Timer display - moved up
    const timerBg = this.add.graphics()
    timerBg.fillStyle(0xff6b6b, 0.9)
    timerBg.fillRoundedRect(650, 10, 120, 35, 5)
    timerBg.lineStyle(2, 0xffffff, 1)
    timerBg.strokeRoundedRect(650, 10, 120, 35, 5)

    this.timerText = this.add.text(710, 27, `⏱️ 00:00`, {
      fontSize: "16px",
      fill: "#ffffff",
      fontFamily: "Arial",
      fontStyle: "bold",
    }).setOrigin(0.5)

    // Next layer warning - moved up
    const layerBg = this.add.graphics()
    layerBg.fillStyle(0xffa500, 0.9)
    layerBg.fillRoundedRect(650, 50, 120, 30, 5)
    layerBg.lineStyle(2, 0xffffff, 1)
    layerBg.strokeRoundedRect(650, 50, 120, 30, 5)

    this.layerText = this.add.text(710, 65, `📉 ${this.nextLayerTime}s`, {
      fontSize: "14px",
      fill: "#ffffff",
      fontFamily: "Arial",
      fontStyle: "bold",
    }).setOrigin(0.5)

    // High Scores Ranking Panel - new addition
    const rankingBg = this.add.graphics()
    rankingBg.fillStyle(0x000000, 0.8)
    rankingBg.fillRoundedRect(620, 90, 160, 460, 10)
    rankingBg.lineStyle(3, 0xffd700, 1)
    rankingBg.strokeRoundedRect(620, 90, 160, 460, 10)

    const rankingTitle = this.add.text(700, 110, "🏆 TOP 10", {
      fontSize: "18px",
      fill: "#ffd700",
      fontFamily: "Arial",
      fontStyle: "bold",
    }).setOrigin(0.5)

    // Display current high scores
    this.displayGameRanking()

    this.displayHighScores()

    // Initialize shotThisFrame flag
    this.shotThisFrame = false

    // Initialize keyboard keys at the beginning of create()
    this.keys = this.input.keyboard.addKeys('A,D,Q,E,W,S,SPACE,J,L,U,O,I,K,ENTER,ONE,TWO')

    // Enable keyboard input globally
    this.input.keyboard.enabled = true

    // Controls using arcade mapping with aiming system and alternative controls
    this.updateControls = () => {
      // Player 1 controls (A/D/Q/E/W/S/Space) - always available
      if (this.shooters[0]) {
        const shooter1 = this.shooters[0]
        const bubble1 = this.currentBubbles[0]

        if (this.keys.A.isDown) {
          if (shooter1.x > 50) {
            shooter1.x -= 10
            if (bubble1) bubble1.x = shooter1.x
            this.drawShooter(shooter1)
            this.updateAimPreview()
          }
        }

        if (this.keys.D.isDown) {
          if (shooter1.x < 750) {
            shooter1.x += 10
            if (bubble1) bubble1.x = shooter1.x
            this.drawShooter(shooter1)
            this.updateAimPreview()
          }
        }

        if (this.keys.Q.isDown) {
          if (bubble1 && !bubble1.launched) {
            this.adjustAim(-5, 0)
          }
        }

        if (this.keys.E.isDown) {
          if (bubble1 && !bubble1.launched) {
            this.adjustAim(5, 0)
          }
        }

        if (this.keys.W.isDown) {
          if (bubble1 && !bubble1.launched) {
            this.adjustAimVertical(-5, 0)
          }
        }

        if (this.keys.S.isDown) {
          if (bubble1 && !bubble1.launched) {
            this.adjustAimVertical(5, 0)
          }
        }

        if (this.keys.SPACE.isDown) {
          if (bubble1 && !bubble1.launched && !this.shotThisFrame) {
            this.shootBubble(0)
            this.shotThisFrame = true
          }
        }
      }

      // Player 2 controls (J/L/U/O/I/K/Enter) - only if 2 players
      if (this.numPlayers === 2 && this.shooters[1]) {
        const shooter2 = this.shooters[1]
        const bubble2 = this.currentBubbles[1]

        if (this.keys.J.isDown) {
          if (shooter2.x > 50) {
            shooter2.x -= 10
            if (bubble2) bubble2.x = shooter2.x
            this.drawShooter(shooter2)
            this.updateAimPreview()
          }
        }

        if (this.keys.L.isDown) {
          if (shooter2.x < 750) {
            shooter2.x += 10
            if (bubble2) bubble2.x = shooter2.x
            this.drawShooter(shooter2)
            this.updateAimPreview()
          }
        }

        if (this.keys.U.isDown) {
          if (bubble2 && !bubble2.launched) {
            this.adjustAim(-5, 1)
          }
        }

        if (this.keys.O.isDown) {
          if (bubble2 && !bubble2.launched) {
            this.adjustAim(5, 1)
          }
        }

        if (this.keys.I.isDown) {
          if (bubble2 && !bubble2.launched) {
            this.adjustAimVertical(-5, 1)
          }
        }

        if (this.keys.K.isDown) {
          if (bubble2 && !bubble2.launched) {
            this.adjustAimVertical(5, 1)
          }
        }

        if (this.keys.ENTER.isDown) {
          if (bubble2 && !bubble2.launched && !this.shotThisFrame) {
            this.shootBubble(1)
            this.shotThisFrame = true
          }
        }
      }

      // Reset shot flag
      if (!this.keys.SPACE.isDown && !this.keys.ENTER.isDown) {
        this.shotThisFrame = false
      }
    }
  }

  update(time, delta) {
    if (this.gameOver) return

    // Update game timer
    this.gameTime += delta / 1000 // Convert to seconds
    const minutes = Math.floor(this.gameTime / 60)
    const seconds = Math.floor(this.gameTime % 60)
    this.timerText.setText(`⏱️ ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)

    // Update next layer timer
    const timeToNextLayer = Math.max(0, this.nextLayerTime - this.gameTime)
    this.layerText.setText(`📉 ${Math.ceil(timeToNextLayer)}s`)

    // Check if it's time to drop a new layer
    if (this.layersDropped < this.maxLayers && this.gameTime >= this.nextLayerTime) {
      this.dropNewLayer()
      this.layersDropped++
      this.nextLayerTime += this.layerDropInterval
      this.difficultyLevel++

      // Speed up subsequent layers
      if (this.layersDropped > 1) {
        this.layerDropInterval = Math.max(30, this.layerDropInterval - 5)
      }
    }

    // Activate gravity fall after 1 minute (60 seconds)
    if (!this.gravityFallActive && this.gameTime >= 60) {
      this.gravityFallActive = true
      this.startGravityFall()
    }

    // Update gravity fall if active
    if (this.gravityFallActive) {
      this.updateGravityFall()
    }

    // Update controls
    this.updateControls()

    // Debug: Show pressed keys and cannon positions
    const pressedKeys = []
    if (this.input.keyboard.checkDown(this.input.keyboard.addKey('KeyA'))) pressedKeys.push('A')
    if (this.input.keyboard.checkDown(this.input.keyboard.addKey('KeyD'))) pressedKeys.push('D')
    if (this.input.keyboard.checkDown(this.input.keyboard.addKey('KeyQ'))) pressedKeys.push('Q')
    if (this.input.keyboard.checkDown(this.input.keyboard.addKey('KeyE'))) pressedKeys.push('E')
    if (this.input.keyboard.checkDown(this.input.keyboard.addKey('KeyW'))) pressedKeys.push('W')
    if (this.input.keyboard.checkDown(this.input.keyboard.addKey('KeyS'))) pressedKeys.push('S')
    if (this.input.keyboard.checkDown(this.input.keyboard.addKey('Space'))) pressedKeys.push('SPACE')
    if (this.input.keyboard.checkDown(this.input.keyboard.addKey('KeyJ'))) pressedKeys.push('J')
    if (this.input.keyboard.checkDown(this.input.keyboard.addKey('KeyL'))) pressedKeys.push('L')
    if (this.input.keyboard.checkDown(this.input.keyboard.addKey('KeyU'))) pressedKeys.push('U')
    if (this.input.keyboard.checkDown(this.input.keyboard.addKey('KeyO'))) pressedKeys.push('O')
    if (this.input.keyboard.checkDown(this.input.keyboard.addKey('KeyI'))) pressedKeys.push('I')
    if (this.input.keyboard.checkDown(this.input.keyboard.addKey('KeyK'))) pressedKeys.push('K')
    if (this.input.keyboard.checkDown(this.input.keyboard.addKey('Enter'))) pressedKeys.push('ENTER')

    const cannon1X = this.shooters[0] ? Math.round(this.shooters[0].x) : 'N/A'
    const cannon2X = this.numPlayers === 2 && this.shooters[1] ? Math.round(this.shooters[1].x) : 'N/A'
    const gameOver = this.gameOver ? 'SÍ' : 'NO'

    if (this.debugText) {
      this.debugText.setText(`Teclas: ${pressedKeys.join(', ')} | P1 X: ${cannon1X} | P2 X: ${cannon2X} | GameOver: ${gameOver}`)
    }

    // Check if any bubble has reached the game over line
    for (let row = 0; row < this.bubbleGrid.length; row++) {
      for (let col = 0; col < this.bubbleGrid[row].length; col++) {
        const bubble = this.bubbleGrid[row][col]
        if (bubble) {
          console.log(`Bubble at row ${row}, col ${col}: y=${bubble.y}, line=${this.GAME_OVER_LINE_Y}`)
          if (bubble.y >= this.GAME_OVER_LINE_Y) {
            console.log(`Game Over triggered: bubble at y=${bubble.y}, line at y=${this.GAME_OVER_LINE_Y}`)
            this.gameOver = true
            this.endGame()
            return
          }
        }
      }
    }

    // Check if there are no more bubbles (player won)
    let totalBubbles = 0
    for (let row = 0; row < this.bubbleGrid.length; row++) {
      for (let col = 0; col < this.GRID_COLS; col++) {
        if (this.bubbleGrid[row] && this.bubbleGrid[row][col]) {
          totalBubbles++
        }
      }
    }

    if (totalBubbles === 0) {
      console.log("Players won! No more bubbles")
      this.gameOver = true
      // Pass all scores and game stats to GameOverScene
      this.scene.start("GameOverScene", {
        scores: this.scores,
        won: true,
        numPlayers: this.numPlayers,
        gameTime: this.gameTime,
        layersCleared: this.layersDropped,
        difficultyLevel: this.difficultyLevel
      })
      return
    }
  }

  drawShooter(graphics) {
    graphics.clear()
    // Enhanced shooter design with glow effect
    graphics.lineStyle(3, 0x4ecdc4, 1)
    graphics.fillStyle(0xffffff, 1)
    graphics.fillTriangle(-15, 0, 15, 0, 0, -30)
    graphics.strokeTriangle(-15, 0, 15, 0, 0, -30)

    // Add glow effect
    graphics.lineStyle(1, 0x4ecdc4, 0.5)
    graphics.strokeTriangle(-18, 2, 18, 2, 0, -35)
  }

  drawGameOverLine() {
    const line = this.add.graphics()
    line.lineStyle(3, 0xff0000, 1)
    line.moveTo(0, this.GAME_OVER_LINE_Y)
    line.lineTo(800, this.GAME_OVER_LINE_Y)
    line.strokePath()
  }

  createNewBubble(playerIndex) {
    const color = Phaser.Utils.Array.GetRandom(this.COLORS)
    const bubble = this.add.graphics()
    // Enhanced bubble with border and glow
    bubble.fillStyle(color, 1)
    bubble.fillCircle(0, 0, this.BUBBLE_SIZE / 2)
    bubble.lineStyle(2, 0xffffff, 0.8)
    bubble.strokeCircle(0, 0, this.BUBBLE_SIZE / 2)
    bubble.x = this.shooters[playerIndex].x
    bubble.y = this.shooters[playerIndex].y - 40
    bubble.color = color
    bubble.launched = false
    bubble.velocityX = 0
    bubble.velocityY = 0
    bubble.playerIndex = playerIndex
    this.currentBubbles[playerIndex] = bubble

    // Add glow effect for current bubble (different for each player in simultaneous mode)
    if (this.currentBubbleGlow) this.currentBubbleGlow.destroy()
    this.currentBubbleGlow = this.add.graphics()

    if (this.simultaneousMode) {
      // In simultaneous mode, show glow for both current bubbles
      for (let i = 0; i < this.numPlayers; i++) {
        const currentBubble = this.currentBubbles[i]
        if (currentBubble && !currentBubble.launched) {
          const glowColor = i === 0 ? 0x4ecdc4 : 0xff6b6b // Different colors for each player
          this.currentBubbleGlow.lineStyle(2, glowColor, 0.6)
          this.currentBubbleGlow.strokeCircle(currentBubble.x, currentBubble.y, this.BUBBLE_SIZE / 2 + 4)
        }
      }
    } else {
      // Single player mode - original behavior
      this.currentBubbleGlow.lineStyle(1, color, 0.4)
      this.currentBubbleGlow.strokeCircle(bubble.x, bubble.y, this.BUBBLE_SIZE / 2 + 3)
    }
    this.currentBubbleGlow.setDepth(-1)
  }

  shootBubble(playerIndex) {
    const bubble = this.currentBubbles[playerIndex]
    if (!bubble || bubble.launched) return

    this.playShootSound()
    bubble.launched = true

    // Calculate initial velocity based on aim angle
    const shooter = this.shooters[playerIndex]
    const angle = shooter.aimAngle * Math.PI / 180 // Convert to radians
    const speed = 8
    bubble.velocityX = Math.sin(angle) * speed
    bubble.velocityY = -Math.cos(angle) * speed

    const moveBubble = () => {
      if (!bubble || !bubble.launched) return

      bubble.x += bubble.velocityX
      bubble.y += bubble.velocityY

      // Bounce off walls with visual effect
      if (bubble.x <= this.BUBBLE_SIZE / 2 || bubble.x >= 800 - this.BUBBLE_SIZE / 2) {
        bubble.velocityX *= -1
        // Add bounce effect
        this.createBounceEffect(bubble.x, bubble.y, bubble.color)
      }

      if (bubble.y <= this.BUBBLE_SIZE / 2 || this.checkGridCollision(bubble)) {
        this.snapToGrid(bubble)
        bubble.launched = false
        this.checkMatches(bubble, playerIndex)
        this.currentBubbles[playerIndex] = null
        this.time.delayedCall(200, () => {
          this.createNewBubble(playerIndex)
          // Only switch player if not in simultaneous mode
          if (!this.simultaneousMode) {
            this.switchPlayer()
          }
        })
        return
      }

      if (bubble.y >= this.SHOOTER_Y) {
        this.endGame()
        return
      }

      this.time.delayedCall(16, moveBubble)
    }

    moveBubble()
  }

  switchPlayer() {
    this.currentPlayer = (this.currentPlayer + 1) % this.numPlayers
    this.currentPlayerText.setText(`🎮 Jugador ${this.currentPlayer + 1}`)

    // Clear previous aim preview
    this.aimPreview.clear()
    if (this.angleDisplay) {
      this.angleDisplay.destroy()
      this.angleDisplay = null
    }

    // Show trajectory preview immediately for current player
    this.time.delayedCall(300, () => {
      this.updateAimPreview()
    })
  }

  dropNewLayer() {
    // Create warning effect
    const warningText = this.add.text(400, 200, '⚠️ ¡CAPA NUEVA!', {
      fontSize: '36px',
      fill: '#ff6b6b',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 3
    }).setOrigin(0.5)

    // Animate warning
    this.tweens.add({
      targets: warningText,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => warningText.destroy()
    })

    // Play warning sound
    this.playWarningSound()

    // Add new layer of bubbles at the top
    const newRow = this.bubbleGrid.length
    this.bubbleGrid.push([])

    for (let col = 0; col < this.GRID_COLS; col++) {
      const offset = newRow % 2 === 0 ? 0 : this.BUBBLE_SIZE / 2
      const x = col * this.BUBBLE_SIZE + this.BUBBLE_SIZE / 2 + offset + 20
      const y = newRow * this.BUBBLE_SIZE + this.BUBBLE_SIZE / 2 + 20

      const color = Phaser.Utils.Array.GetRandom(this.COLORS)
      const bubble = this.add.graphics()
      // Enhanced bubble appearance
      bubble.fillStyle(color, 1)
      bubble.fillCircle(0, 0, this.BUBBLE_SIZE / 2)
      bubble.lineStyle(1, 0xffffff, 0.6)
      bubble.strokeCircle(0, 0, this.BUBBLE_SIZE / 2)
      bubble.x = x
      bubble.y = y
      bubble.color = color
      bubble.row = newRow
      bubble.col = col

      this.bubbleGrid[newRow][col] = bubble

      // Drop animation from top
      bubble.y = -50
      this.tweens.add({
        targets: bubble,
        y: y,
        duration: 1000,
        ease: 'Bounce.easeOut',
        delay: col * 50
      })
    }

    // Push all existing bubbles down
    for (let row = this.bubbleGrid.length - 2; row >= 0; row--) {
      for (let col = 0; col < this.GRID_COLS; col++) {
        const bubble = this.bubbleGrid[row][col]
        if (bubble) {
          bubble.row = row + 1
          this.tweens.add({
            targets: bubble,
            y: bubble.y + this.BUBBLE_SIZE,
            duration: 800,
            ease: 'Power2',
            delay: (this.GRID_COLS - col) * 30
          })
        }
      }
      this.bubbleGrid[row + 1] = this.bubbleGrid[row]
    }
    this.bubbleGrid[0] = []
  }

  playWarningSound() {
    if (!this.audioContext) return
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // Warning siren sound
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime)
    oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.2)
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.4)
    oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.6)

    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8)

    oscillator.start()
    oscillator.stop(this.audioContext.currentTime + 0.8)
  }

  adjustAim(angleChange, playerIndex = this.currentPlayer) {
    const shooter = this.shooters[playerIndex]
    shooter.aimAngle = Math.max(-45, Math.min(45, shooter.aimAngle + angleChange))
    this.updateAimPreview()
  }

  adjustAimVertical(angleChange, playerIndex = this.currentPlayer) {
    const shooter = this.shooters[playerIndex]
    shooter.aimVerticalAngle = (shooter.aimVerticalAngle || 0) + angleChange
    shooter.aimVerticalAngle = Math.max(-30, Math.min(30, shooter.aimVerticalAngle))
    this.updateAimPreview()
  }

  updateAimPreview() {
    this.aimPreview.clear()

    // In simultaneous mode, show preview for both players
    const playersToShow = this.simultaneousMode ? [0, 1] : [this.currentPlayer]

    for (const playerIndex of playersToShow) {
      const shooter = this.shooters[playerIndex]
      const bubble = this.currentBubbles[playerIndex]
      if (!bubble || bubble.launched) continue

      const startX = bubble.x
      const startY = bubble.y

      // Calculate trajectory with both horizontal and vertical angles
      const horizontalAngle = shooter.aimAngle * Math.PI / 180
      const verticalAngle = (shooter.aimVerticalAngle || 0) * Math.PI / 180
      const speed = 8

      // Combine angles for 2D trajectory
      const totalAngle = Math.atan2(Math.sin(horizontalAngle), -Math.cos(verticalAngle))
      let velX = Math.sin(totalAngle) * speed
      let velY = -Math.cos(totalAngle) * speed

      // Enhanced trajectory preview with dotted line and glow effect
      let currentX = startX
      let currentY = startY

      // Draw dotted trajectory line with glow
      this.aimPreview.lineStyle(3, bubble.color, 0.8)
      this.aimPreview.moveTo(startX, startY)

      for (let i = 0; i < 80; i++) {
        const prevX = currentX
        const prevY = currentY

        currentX += velX * 0.6 // Smaller steps for smoother trajectory
        currentY += velY * 0.6

        // Bounce prediction
        if (currentX <= 40 || currentX >= 760) {
          velX *= -1
          // Enhanced bounce indicator with glow
          this.aimPreview.fillStyle(bubble.color, 0.9)
          this.aimPreview.fillCircle(currentX, currentY, 8)
          this.aimPreview.lineStyle(3, 0xffffff, 1)
          this.aimPreview.strokeCircle(currentX, currentY, 8)
          this.aimPreview.fillStyle(bubble.color, 0.5)
          this.aimPreview.fillCircle(currentX, currentY, 4)

          // Add ripple effect
          this.aimPreview.lineStyle(1, bubble.color, 0.6)
          this.aimPreview.strokeCircle(currentX, currentY, 12)
        }

        if (currentY <= 40) {
          // Hit top wall - could add ceiling bounce here if desired
          break
        }

        // Draw dotted line effect - more frequent dots for better visibility
         if (i % 2 === 0) { // Every 2nd point for dotted effect
           this.aimPreview.fillStyle(bubble.color, 1.0)
           this.aimPreview.fillCircle(currentX, currentY, 5)

           // Add glow effect around dots
           this.aimPreview.fillStyle(bubble.color, 0.7)
           this.aimPreview.fillCircle(currentX, currentY, 10)

           // Add outer glow
           this.aimPreview.fillStyle(bubble.color, 0.3)
           this.aimPreview.fillCircle(currentX, currentY, 15)
         }

        // Stop if we hit the danger zone
        if (currentY >= 480) break
      }

      // Enhanced aim angle indicator with animated elements
      const indicatorLength = 40

      // Calculate indicator position based on combined angles
      const indicatorX = startX + Math.sin(totalAngle) * indicatorLength
      const indicatorY = startY - Math.cos(totalAngle) * indicatorLength

      // Main aiming line with glow
      this.aimPreview.lineStyle(5, bubble.color, 0.9)
      this.aimPreview.moveTo(startX, startY)
      this.aimPreview.lineTo(indicatorX, indicatorY)

      // Outer glow line
      this.aimPreview.lineStyle(3, bubble.color, 0.5)
      this.aimPreview.moveTo(startX, startY)
      this.aimPreview.lineTo(indicatorX, indicatorY)

      // Target indicator at the end with enhanced effects
      this.aimPreview.fillStyle(bubble.color, 1)
      this.aimPreview.fillCircle(indicatorX, indicatorY, 5)
      this.aimPreview.lineStyle(3, 0xffffff, 1)
      this.aimPreview.strokeCircle(indicatorX, indicatorY, 5)

      // Pulsing effect on target
      this.aimPreview.fillStyle(bubble.color, 0.6)
      this.aimPreview.fillCircle(indicatorX, indicatorY, 10)

      // Outer ring
      this.aimPreview.lineStyle(2, bubble.color, 0.7)
      this.aimPreview.strokeCircle(indicatorX, indicatorY, 12)

      // Enhanced angle display with real-time feedback
      const horizAngle = Math.abs(shooter.aimAngle)
      const vertAngle = Math.abs(shooter.aimVerticalAngle || 0)
      let angleText = ''

      if (horizAngle > 0 && vertAngle > 0) {
        angleText = `${shooter.aimAngle > 0 ? '→' : '←'}${horizAngle}° ${shooter.aimVerticalAngle > 0 ? '↓' : '↑'}${vertAngle}°`
      } else if (horizAngle > 0) {
        angleText = `${shooter.aimAngle > 0 ? '→' : '←'}${horizAngle}°`
      } else if (vertAngle > 0) {
        angleText = `${shooter.aimVerticalAngle > 0 ? '↓' : '↑'}${vertAngle}°`
      } else {
        angleText = '↑ 0°'
      }

      // Add visual feedback for angle changes
      const totalAngleMagnitude = Math.sqrt(horizAngle * horizAngle + vertAngle * vertAngle)
      if (totalAngleMagnitude > 0) {
        // Add pulsing effect for non-zero angles
        this.aimPreview.lineStyle(2, bubble.color, 0.8 + Math.sin(Date.now() * 0.01) * 0.2)
        this.aimPreview.strokeCircle(startX, startY - 20, 25 + Math.sin(Date.now() * 0.01) * 5)
      }

      // Angle indicator background with better positioning
      const bgWidth = Math.max(60, angleText.length * 8)
      this.aimPreview.fillStyle(0x000000, 0.9)
      this.aimPreview.fillRoundedRect(startX - bgWidth/2, startY - 55, bgWidth, 22, 6)
      this.aimPreview.lineStyle(2, bubble.color, 1)
      this.aimPreview.strokeRoundedRect(startX - bgWidth/2, startY - 55, bgWidth, 22, 6)

      // Update or create angle display text
      if (this.angleDisplay) this.angleDisplay.destroy()
      this.angleDisplay = this.add.text(startX, startY - 44, angleText, {
        fontSize: '11px',
        fill: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        stroke: bubble.color,
        strokeThickness: 2
      }).setOrigin(0.5)
      this.angleDisplay.setDepth(6)
    }
  }

  createBounceEffect(x, y, color) {
    const effect = this.add.graphics()
    effect.fillStyle(color, 0.7)
    effect.fillCircle(x, y, 15)
    effect.setDepth(10)

    this.tweens.add({
      targets: effect,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => effect.destroy()
    })
  }

  initializeBubbleGrid() {
    for (let row = 0; row < 5; row++) {
      this.bubbleGrid[row] = []
      for (let col = 0; col < this.GRID_COLS; col++) {
        const offset = row % 2 === 0 ? 0 : this.BUBBLE_SIZE / 2
        const x = col * this.BUBBLE_SIZE + this.BUBBLE_SIZE / 2 + offset + 20
        const y = row * this.BUBBLE_SIZE + this.BUBBLE_SIZE / 2 + 20

        const color = Phaser.Utils.Array.GetRandom(this.COLORS)
        const bubble = this.add.graphics()
        // Enhanced bubble appearance
        bubble.fillStyle(color, 1)
        bubble.fillCircle(0, 0, this.BUBBLE_SIZE / 2)
        bubble.lineStyle(1, 0xffffff, 0.6)
        bubble.strokeCircle(0, 0, this.BUBBLE_SIZE / 2)
        bubble.x = x
        bubble.y = y
        bubble.color = color
        bubble.row = row
        bubble.col = col

        this.bubbleGrid[row][col] = bubble

        // Add entrance animation
        bubble.setScale(0)
        this.tweens.add({
          targets: bubble,
          scaleX: 1,
          scaleY: 1,
          duration: 300,
          ease: 'Back.easeOut',
          delay: (row * this.GRID_COLS + col) * 20
        })
      }
    }
  }

  checkGridCollision(bubble) {
    for (let row = 0; row < this.bubbleGrid.length; row++) {
      for (let col = 0; col < this.bubbleGrid[row].length; col++) {
        const gridBubble = this.bubbleGrid[row][col]
        if (gridBubble) {
          const dist = Phaser.Math.Distance.Between(bubble.x, bubble.y, gridBubble.x, gridBubble.y)
          if (dist <= this.BUBBLE_SIZE) {
            return true
          }
        }
      }
    }
    return false
  }

  snapToGrid(bubble) {
    let closestRow = Math.round((bubble.y - 20 - this.BUBBLE_SIZE / 2) / this.BUBBLE_SIZE)
    closestRow = Math.max(0, closestRow)

    const offset = closestRow % 2 === 0 ? 0 : this.BUBBLE_SIZE / 2
    let closestCol = Math.round((bubble.x - 20 - this.BUBBLE_SIZE / 2 - offset) / this.BUBBLE_SIZE)
    closestCol = Math.max(0, Math.min(this.GRID_COLS - 1, closestCol))

    while (this.bubbleGrid.length <= closestRow) {
      this.bubbleGrid.push([])
    }

    while (this.bubbleGrid[closestRow][closestCol]) {
      closestRow--
      if (closestRow < 0) {
        closestRow = 0
        break
      }
    }

    const finalOffset = closestRow % 2 === 0 ? 0 : this.BUBBLE_SIZE / 2
    bubble.x = closestCol * this.BUBBLE_SIZE + this.BUBBLE_SIZE / 2 + finalOffset + 20
    bubble.y = closestRow * this.BUBBLE_SIZE + this.BUBBLE_SIZE / 2 + 20
    bubble.row = closestRow
    bubble.col = closestCol

    this.bubbleGrid[closestRow][closestCol] = bubble
  }

  checkMatches(bubble, playerIndex) {
    const matches = []
    const toCheck = [bubble]
    const checked = new Set()

    while (toCheck.length > 0) {
      const current = toCheck.pop()
      const key = `${current.row},${current.col}`

      if (checked.has(key)) continue
      checked.add(key)

      if (current.color === bubble.color) {
        matches.push(current)

        const neighbors = this.getNeighbors(current.row, current.col)
        for (const neighbor of neighbors) {
          if (neighbor && !checked.has(`${neighbor.row},${neighbor.col}`)) {
            toCheck.push(neighbor)
          }
        }
      }
    }

    if (matches.length >= 3) {
      this.playPopSound()
      for (const match of matches) {
        match.destroy()
        this.bubbleGrid[match.row][match.col] = null
        this.scores[playerIndex] += 10
      }
      this.updateScoreTexts()

      this.time.delayedCall(100, () => this.removeFloatingBubbles(playerIndex))
    }
  }

  updateScoreTexts() {
    for (let i = 0; i < this.numPlayers; i++) {
      this.scoreTexts[i].setText(`Jugador ${i + 1}: ${this.scores[i]}`)
      this.topRightScoreTexts[i].setText(String(this.scores[i]))
    }
  }

  getNeighbors(row, col) {
    const neighbors = []
    const isEvenRow = row % 2 === 0

    const offsets = isEvenRow
      ? [
          [-1, -1],
          [-1, 0],
          [0, -1],
          [0, 1],
          [1, -1],
          [1, 0],
        ]
      : [
          [-1, 0],
          [-1, 1],
          [0, -1],
          [0, 1],
          [1, 0],
          [1, 1],
        ]

    for (const [dRow, dCol] of offsets) {
      const newRow = row + dRow
      const newCol = col + dCol
      if (
        newRow >= 0 &&
        newRow < this.bubbleGrid.length &&
        newCol >= 0 &&
        newCol < this.GRID_COLS &&
        this.bubbleGrid[newRow] &&
        this.bubbleGrid[newRow][newCol]
      ) {
        neighbors.push(this.bubbleGrid[newRow][newCol])
      }
    }

    return neighbors
  }

  removeFloatingBubbles(playerIndex) {
    const connected = new Set()

    for (let col = 0; col < this.GRID_COLS; col++) {
      if (this.bubbleGrid[0] && this.bubbleGrid[0][col]) {
        this.markConnected(this.bubbleGrid[0][col], connected)
      }
    }

    let floatingCount = 0
    for (let row = 0; row < this.bubbleGrid.length; row++) {
      for (let col = 0; col < this.GRID_COLS; col++) {
        const bubble = this.bubbleGrid[row][col]
        if (bubble && !connected.has(`${row},${col}`)) {
          bubble.destroy()
          this.bubbleGrid[row][col] = null
          this.scores[playerIndex] += 5
          floatingCount++
        }
      }
    }

    if (floatingCount > 0) {
      this.playPopSound()
    }

    this.updateScoreTexts()
  }

  markConnected(bubble, connected) {
    const key = `${bubble.row},${bubble.col}`
    if (connected.has(key)) return

    connected.add(key)
    const neighbors = this.getNeighbors(bubble.row, bubble.col)
    for (const neighbor of neighbors) {
      this.markConnected(neighbor, connected)
    }
  }

  displayHighScores() {
    // Removed right-side panel: keep this function minimal so no panel is drawn
    // If any previous panel objects exist, destroy them
    if (this.highScoresPanel) {
      this.highScoresPanel.destroy()
      this.highScoresPanel = null
    }
    if (this.highScoresGroup) {
      this.highScoresGroup.destroy()
      this.highScoresGroup = null
    }
  }

  displayGameRanking() {
    const highScores = getHighScores()

    // Clear previous ranking texts
    if (this.rankingTexts) {
      this.rankingTexts.forEach(text => text.destroy())
    }
    this.rankingTexts = []

    // Display top 10 scores
    for (let i = 0; i < Math.min(10, highScores.length); i++) {
      const score = highScores[i]
      const yPos = 140 + (i * 20)

      // Position indicator
      let positionText = `${i + 1}.`
      if (i === 0) positionText = "🥇"
      else if (i === 1) positionText = "🥈"
      else if (i === 2) positionText = "🥉"

      const posText = this.add.text(635, yPos, positionText, {
        fontSize: "12px",
        fill: i < 3 ? "#ffd700" : "#ffffff",
        fontFamily: "Arial",
        fontStyle: "bold",
      })

      // Name and score
      const nameScoreText = this.add.text(655, yPos, `${score.name}: ${score.score}`, {
        fontSize: "11px",
        fill: i < 3 ? "#ffd700" : "#ffffff",
        fontFamily: "Arial",
      })

      this.rankingTexts.push(posText, nameScoreText)
    }

    // If no scores yet, show message
    if (highScores.length === 0) {
      const noScoresText = this.add.text(700, 200, "¡Sé el primero\nen el ranking!", {
        fontSize: "14px",
        fill: "#888888",
        fontFamily: "Arial",
        align: "center",
      }).setOrigin(0.5)
      this.rankingTexts.push(noScoresText)
    }
  }

  startBackgroundMusic() {
    if (!this.audioContext) return

    // Create background music using Web Audio API
    this.musicOscillators = []
    this.musicGainNodes = []

    // Main melody - upbeat bubble pop theme
    const melodyNotes = [
      { freq: 523.25, duration: 0.3, delay: 0 },    // C5
      { freq: 659.25, duration: 0.3, delay: 0.3 },  // E5
      { freq: 783.99, duration: 0.3, delay: 0.6 },  // G5
      { freq: 1046.50, duration: 0.6, delay: 0.9 }, // C6
      { freq: 783.99, duration: 0.3, delay: 1.5 },  // G5
      { freq: 659.25, duration: 0.3, delay: 1.8 },  // E5
      { freq: 523.25, duration: 0.6, delay: 2.1 },  // C5
      { freq: 440.00, duration: 0.3, delay: 2.7 },  // A4
      { freq: 523.25, duration: 0.3, delay: 3.0 },  // C5
      { freq: 587.33, duration: 0.3, delay: 3.3 },  // D5
      { freq: 659.25, duration: 0.6, delay: 3.6 },  // E5
    ]

    // Bass line for rhythm
    const bassNotes = [
      { freq: 130.81, duration: 0.4, delay: 0 },    // C3
      { freq: 164.81, duration: 0.4, delay: 0.4 },  // E3
      { freq: 196.00, duration: 0.4, delay: 0.8 },  // G3
      { freq: 261.63, duration: 0.8, delay: 1.2 },  // C4
      { freq: 196.00, duration: 0.4, delay: 2.0 },  // G3
      { freq: 164.81, duration: 0.4, delay: 2.4 },  // E3
      { freq: 130.81, duration: 0.8, delay: 2.8 },  // C3
    ]

    // Play melody
    melodyNotes.forEach(note => {
      this.time.delayedCall(note.delay, () => {
        this.playMusicNote(note.freq, note.duration, 0.1)
      })
    })

    // Play bass line
    bassNotes.forEach(note => {
      this.time.delayedCall(note.delay, () => {
        this.playMusicNote(note.freq, note.duration, 0.08)
      })
    })

    // Repeat the melody every 4 seconds
    this.musicLoop = this.time.addEvent({
      delay: 4000,
      callback: () => {
        if (!this.gameOver) {
          melodyNotes.forEach(note => {
            this.time.delayedCall(note.delay, () => {
              this.playMusicNote(note.freq, note.duration, 0.08)
            })
          })
          bassNotes.forEach(note => {
            this.time.delayedCall(note.delay, () => {
              this.playMusicNote(note.freq, note.duration, 0.06)
            })
          })
        }
      },
      loop: true
    })

    // Add some ambient bubbles popping sounds occasionally
    this.ambientSounds = this.time.addEvent({
      delay: Phaser.Math.Between(2000, 5000),
      callback: () => {
        if (!this.gameOver) {
          this.playAmbientBubbleSound()
        }
      },
      loop: true
    })
  }

  playMusicNote(frequency, duration, volume = 0.1) {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)

    // Add some vibrato for richness
    const vibrato = this.audioContext.createOscillator()
    const vibratoGain = this.audioContext.createGain()
    vibrato.frequency.setValueAtTime(5, this.audioContext.currentTime)
    vibratoGain.gain.setValueAtTime(10, this.audioContext.currentTime)
    vibrato.connect(vibratoGain)
    vibratoGain.connect(oscillator.frequency)

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    oscillator.start()
    vibrato.start()
    oscillator.stop(this.audioContext.currentTime + duration)
    vibrato.stop(this.audioContext.currentTime + duration)

    this.musicOscillators.push(oscillator)
    this.musicGainNodes.push(gainNode)
  }

  playAmbientBubbleSound() {
    if (!this.audioContext) return

    // Random bubble pop sound for atmosphere
    const frequencies = [400, 500, 600, 700, 800]
    const freq = Phaser.Utils.Array.GetRandom(frequencies)

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(freq * 0.3, this.audioContext.currentTime + 0.1)

    gainNode.gain.setValueAtTime(0.02, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1)

    oscillator.start()
    oscillator.stop(this.audioContext.currentTime + 0.1)
  }

  stopBackgroundMusic() {
    if (this.musicLoop) {
      this.musicLoop.destroy()
    }
    if (this.ambientSounds) {
      this.ambientSounds.destroy()
    }
    // Stop any playing oscillators
    if (this.musicOscillators) {
      this.musicOscillators.forEach(osc => {
        try { osc.stop() } catch (e) {}
      })
    }
  }

  endGame() {
    // Marcar gameOver y bloquear controles
    this.gameOver = true

    // Stop background music
    this.stopBackgroundMusic()

    // Animar todas las burbujas cayendo hasta la línea roja
    this.dropAllBubblesToRedLine()

    // Crear overlay semi-transparente (completo)
    if (this._overlay) this._overlay.destroy()
    this._overlay = this.add.graphics()
    this._overlay.fillStyle(0x000000, 0.6)
    this._overlay.fillRect(0, 0, 800, 600)
    this._overlay.setDepth(20)

    // Texto de Game Over
    const gameOverText = this.add.text(400, 200, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontFamily: 'Arial'
    }).setOrigin(0.5)
    gameOverText.setDepth(30)

    // Determinar ganador con mejor presentación - moved down
    const maxScore = Math.max(...this.scores)
    const winners = this.scores.map((score, index) => score === maxScore ? index : -1).filter(index => index !== -1)

    let winnerText = ''
    let winnerColor = '#ffe66d'
    if (winners.length === 1) {
      winnerText = `🏆 ¡JUGADOR ${winners[0] + 1} GANA!`
      winnerColor = winners[0] === 0 ? '#4ecdc4' : '#ff6b6b'
    } else {
      winnerText = '🤝 ¡EMPATE!'
    }

    const winnerBg = this.add.graphics()
    winnerBg.fillStyle(0x000000, 0.7)
    winnerBg.fillRoundedRect(250, 430, 300, 60, 15)

    const winnerDisplay = this.add.text(400, 460, winnerText, {
      fontSize: '28px',
      fill: winnerColor,
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 2,
    }).setOrigin(0.5)

    // Celebration animation for winner
    if (winners.length === 1) {
      this.tweens.add({
        targets: winnerDisplay,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 500,
        ease: 'Back.easeOut',
        yoyo: true,
        repeat: 2
      })
    }

    // Enhanced restart button - moved down
    const restartButton = this.add.container(400, 540)
    const restartBg = this.add.graphics()
    restartBg.fillStyle(0x4ecdc4, 1)
    restartBg.fillRoundedRect(-120, -18, 240, 36, 10)
    restartBg.lineStyle(3, 0xffffff, 1)
    restartBg.strokeRoundedRect(-120, -18, 240, 36, 10)

    const restartText = this.add.text(0, 0, '🔄 REINICIAR JUEGO', {
      fontSize: '20px',
      fill: '#1a1a2e',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    })
    restartText.setOrigin(0.5)

    restartButton.add([restartBg, restartText])
    restartButton.setInteractive(new Phaser.Geom.Rectangle(-120, -18, 240, 36), Phaser.Geom.Rectangle.Contains)

    // Button hover effect
    restartButton.on('pointerover', () => {
      restartBg.clear()
      restartBg.fillStyle(0xffffff, 1)
      restartBg.fillRoundedRect(-120, -18, 240, 36, 10)
      restartBg.lineStyle(3, 0x4ecdc4, 1)
      restartBg.strokeRoundedRect(-120, -18, 240, 36, 10)
      restartText.setStyle({ fill: '#4ecdc4' })

      this.tweens.add({
        targets: restartButton,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 200,
        ease: 'Back.easeOut'
      })
    })

    restartButton.on('pointerout', () => {
      restartBg.clear()
      restartBg.fillStyle(0x4ecdc4, 1)
      restartBg.fillRoundedRect(-120, -18, 240, 36, 10)
      restartBg.lineStyle(3, 0xffffff, 1)
      restartBg.strokeRoundedRect(-120, -18, 240, 36, 10)
      restartText.setStyle({ fill: '#1a1a2e' })

      this.tweens.add({
        targets: restartButton,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: 'Back.easeOut'
      })
    })

    restartButton.on('pointerdown', () => {
      this.scene.start('MenuScene')
    })

    // Also listen for keyboard input
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('MenuScene')
    })
    this.input.keyboard.once('keydown-R', () => {
      this.scene.start('MenuScene')
    })
  }

  playShootSound() {
    if (!this.audioContext) return
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1)
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1)
    oscillator.start()
    oscillator.stop(this.audioContext.currentTime + 0.1)
  }

  playPopSound() {
    if (!this.audioContext) return
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.2)
    gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2)
    oscillator.start()
    oscillator.stop(this.audioContext.currentTime + 0.2)
  }

  dropAllBubblesToRedLine() {
    // Animar todas las burbujas cayendo hasta la línea roja
    for (let row = 0; row < this.bubbleGrid.length; row++) {
      for (let col = 0; col < this.GRID_COLS; col++) {
        const bubble = this.bubbleGrid[row][col]
        if (bubble) {
          // Calcular la nueva posición Y para que llegue justo a la línea roja
          const targetY = this.GAME_OVER_LINE_Y - this.BUBBLE_SIZE / 2

          // Animar la caída con un retraso escalonado para efecto visual
          this.tweens.add({
            targets: bubble,
            y: targetY,
            duration: 1000 + (row * 50) + (col * 20), // Duración variable para efecto cascada
            ease: 'Bounce.easeOut',
            delay: (row * 100) + (col * 50) // Retraso escalonado
          })
        }
      }
    }
  }

  startGravityFall() {
    // Iniciar la caída continua de burbujas después de 1 minuto
    this.gravityFallSpeed = 0.5 // Velocidad inicial más lenta
    this.gravityFallAcceleration = 0.02 // Aceleración más gradual
    this.gravityFallDelay = 0 // Delay counter for gradual effect
    this.gravityFallDelayMax = 10 // Frames between bubble movements
  }

  updateGravityFall() {
    if (!this.gravityFallActive) return

    // Incrementar delay counter
    this.gravityFallDelay++

    // Solo mover burbujas cada cierto número de frames para efecto gradual
    if (this.gravityFallDelay >= this.gravityFallDelayMax) {
      this.gravityFallDelay = 0

      // Aumentar la velocidad gradualmente
      this.gravityFallSpeed += this.gravityFallAcceleration

      // Mover burbujas de abajo hacia arriba para efecto cascada gradual
      let anyBubbleMoved = false
      for (let row = this.bubbleGrid.length - 1; row >= 0; row--) {
        for (let col = 0; col < this.GRID_COLS; col++) {
          const bubble = this.bubbleGrid[row][col]
          if (bubble) {
            const newY = bubble.y + this.gravityFallSpeed

            // Detener si llega a la línea roja
            const redLineY = this.GAME_OVER_LINE_Y - this.BUBBLE_SIZE / 2
            if (newY >= redLineY) {
              bubble.y = redLineY
            } else {
              bubble.y = newY
              anyBubbleMoved = true
            }
          }
        }
      }

      // Si ninguna burbuja se movió, detener la gravedad
      if (!anyBubbleMoved) {
        this.gravityFallActive = false
      }
    }
  }
}

function getHighScores() {
    try {
        const scores = localStorage.getItem('bubbleShooterScores');
        return scores ? JSON.parse(scores) : [];
    } catch {
        return [];
    }
}

function saveHighScore(name, score) {
    try {
        const highScores = getHighScores();
        highScores.push({ name, score, date: new Date().toLocaleDateString() });
        highScores.sort((a, b) => b.score - a.score);
        localStorage.setItem('bubbleShooterScores', JSON.stringify(highScores.slice(0, 10)));
    } catch {
        console.log('Error saving score');
    }
}

function isHighScore(score) {
  const highScores = getHighScores()
  return highScores.length < 10 || score > highScores[highScores.length - 1].score
}

// Initialize the game after scenes are defined
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#000022',
    dom: {
        createContainer: true
    },
    scene: [MenuScene, GameScene, GameOverScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

// Start the game
const game = new Phaser.Game(config);
