/**
 * PLAT-MAN - Arcade Game
 * Un gorila escapa de agentes corporativos estresados mientras recolecta plátanos
 */

// ================ CONFIGURACIÓN GLOBAL ================
const W = 800;
const H = 600;
const POWER_DURATION_MS = 4000;
const BANANAS_TOTAL = 6;
const GHOST_COUNT = 4;
const RANKING_KEY = 'platman_ranking';

// Configuración de niveles
const LEVEL_CONFIG = {
  1: {
    bgColor: 0x0f0f14,
    wallColor: "#1e2aff",
    wallStroke: "#5360ff",
    ghostSpeed: 120,
    name: "Etapa 1",
    walls: [
      [W/2, 40, W-40, 18], [W/2, H-40, W-40, 18],
      [40, H/2, 18, H-80], [W-40, H/2, 18, H-80],
      [W/2, 200, 320, 18], [W/2, 300, 18, 240],
      [250, 430, 270, 18], [550, 430, 270, 18],
      [150, 260, 18, 160], [650, 260, 18, 160]
    ]
  },
  2: {
    bgColor: 0x1a0a1a,
    wallColor: "#8e2aff",
    wallStroke: "#b360ff",
    ghostSpeed: 150,
    name: "Etapa 2",
    walls: [
      [W/2, 40, W-40, 18], [W/2, H-40, W-40, 18],
      [40, H/2, 18, H-80], [W-40, H/2, 18, H-80],
      [200, 150, 18, 200], [600, 150, 18, 200],
      [200, 450, 18, 200], [600, 450, 18, 200],
      [W/2, 300, 200, 18], [300, 200, 200, 18],
      [500, 400, 200, 18]
    ]
  },
  3: {
    bgColor: 0x1a140a,
    wallColor: "#ff6e2a",
    wallStroke: "#ff9060",
    ghostSpeed: 180,
    name: "Etapa 3",
    walls: [
      [W/2, 40, W-40, 18], [W/2, H-40, W-40, 18],
      [40, H/2, 18, H-80], [W-40, H/2, 18, H-80],
      [250, 200, 300, 18], [550, 400, 300, 18],
      [W/2, H/2, 100, 100], [200, 350, 18, 180],
      [600, 250, 18, 180], [350, 150, 18, 120],
      [450, 450, 18, 120]
    ]
  }
};

// ================ VARIABLES GLOBALES ================
let gameState = 'start'; // 'start', 'playing', 'gameOver', 'ranking'
let currentLevel = 1;
let score = 0;
let startTime = 0;
let powerMode = false;
let powerExpiresAt = 0;
let isGameOver = false;

// Objetos del juego
let player;
let cursors;
let wasdKeys;
let bananas;
let ghosts;
let wallBodies;
let wallVisuals;
let bgRect;
let scoreText;
let levelText;
let bgMusicTimer;

// UI de ranking
let rankingInputs = [];
let currentInitials = ['A', 'A', 'A'];
let selectedIndex = 0;
let finalScore = 0;
let wonGame = false;

// ================ CONFIGURACIÓN DE PHASER ================
const config = {
  type: Phaser.AUTO,
  width: W,
  height: H,
  parent: 'game-container',
  backgroundColor: "#000000",
  render: { pixelArt: true, roundPixels: true },
  physics: { 
    default: "arcade", 
    arcade: { debug: false, gravity: { y: 0 } } 
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

// ================ PRELOAD ================
function preload() {
  createAllSprites(this);
}

// ================ CREATE ================
function create() {
  this.scene = this;
  showStartScreen(this);
}

// ================ UPDATE ================
function update() {
  if (gameState === 'playing') {
    updateGame(this);
  }
}

// ================ CREACIÓN DE SPRITES ================
function createAllSprites(scene) {
  const drawTex = (key, w, h, draw) => {
    const tex = scene.textures.createCanvas(key, w, h);
    const ctx = tex.getContext();
    ctx.clearRect(0, 0, w, h);
    draw(ctx, w, h);
    tex.refresh();
  };

  // Gorila del logo (pantalla inicio)
  drawTex("gorilla_logo", 96, 96, (ctx, w, h) => {
    ctx.save();
    const cx = 48, cy = 48;
    // Sombra
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(cx, 86, 24, 8, 0, 0, Math.PI*2);
    ctx.fill();
    // Piernas
    const legGrad = ctx.createLinearGradient(0, 70, 0, 82);
    legGrad.addColorStop(0, "#5a3a22");
    legGrad.addColorStop(1, "#3e2816");
    ctx.fillStyle = legGrad;
    ctx.beginPath();
    ctx.ellipse(38, 74, 8, 12, 0.15, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(58, 74, 8, 12, -0.15, 0, Math.PI*2);
    ctx.fill();
    // Cuerpo
    const bodyGrad = ctx.createRadialGradient(cx, 50, 10, cx, 55, 24);
    bodyGrad.addColorStop(0, "#6b4423");
    bodyGrad.addColorStop(0.6, "#4a2f1a");
    bodyGrad.addColorStop(1, "#2e1c0f");
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(cx, 55, 22, 20, 0, 0, Math.PI*2);
    ctx.fill();
    // Pecho
    const chestGrad = ctx.createRadialGradient(cx, 55, 5, cx, 58, 14);
    chestGrad.addColorStop(0, "#8d6a4c");
    chestGrad.addColorStop(1, "#6b4423");
    ctx.fillStyle = chestGrad;
    ctx.beginPath();
    ctx.ellipse(cx, 58, 14, 11, 0, 0, Math.PI*2);
    ctx.fill();
    // Brazos
    const armGrad = ctx.createLinearGradient(0, 48, 0, 72);
    armGrad.addColorStop(0, "#5a3a22");
    armGrad.addColorStop(1, "#3e2816");
    ctx.fillStyle = armGrad;
    ctx.beginPath();
    ctx.ellipse(26, 58, 8, 22, 0.25, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(23, 74, 6, 8, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(70, 58, 8, 22, -0.25, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(73, 74, 6, 8, 0, 0, Math.PI*2);
    ctx.fill();
    // Hombros
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(34, 46, 10, 9, -0.2, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(62, 46, 10, 9, 0.2, 0, Math.PI*2);
    ctx.fill();
    // Cabeza
    const headGrad = ctx.createRadialGradient(cx, 32, 8, cx, 34, 20);
    headGrad.addColorStop(0, "#8f6241");
    headGrad.addColorStop(1, "#543720");
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(cx, 34, 20, 18, 0, 0, Math.PI*2);
    ctx.fill();
    // Orejas
    ctx.fillStyle = "#6b4423";
    ctx.beginPath();
    ctx.ellipse(30, 32, 6, 7, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(66, 32, 6, 7, 0, 0, Math.PI*2);
    ctx.fill();
    // Hocico
    const muzzleGrad = ctx.createRadialGradient(cx, 42, 4, cx, 44, 12);
    muzzleGrad.addColorStop(0, "#caa17d");
    muzzleGrad.addColorStop(1, "#8d6a4c");
    ctx.fillStyle = muzzleGrad;
    ctx.beginPath();
    ctx.ellipse(cx, 44, 12, 10, 0, 0, Math.PI*2);
    ctx.fill();
    // Nariz
    ctx.fillStyle = "#2e1c0f";
    ctx.beginPath();
    ctx.ellipse(cx, 42, 4, 3, 0, 0, Math.PI*2);
    ctx.fill();
    // Ojos
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(40, 34, 4, 5, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(56, 34, 4, 5, 0, 0, Math.PI*2);
    ctx.fill();
    // Pupilas
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.arc(40, 35, 2, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(56, 35, 2, 0, Math.PI*2);
    ctx.fill();
    // Cejas
    ctx.strokeStyle = "#2e1c0f";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(34, 30);
    ctx.quadraticCurveTo(38, 28, 44, 30);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(52, 30);
    ctx.quadraticCurveTo(56, 28, 62, 30);
    ctx.stroke();
    // Boca
    ctx.strokeStyle = "#4a2f1a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, 48, 6, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.restore();
  });

  // Gorila del juego (más pequeño)
  drawTex("gorilla32b", 48, 48, (ctx, w, h) => {
    ctx.save();
    const cx = 24, cy = 24;
    // Sombra
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(cx, 43, 12, 4, 0, 0, Math.PI*2);
    ctx.fill();
    // Piernas
    const legGrad = ctx.createLinearGradient(0, 35, 0, 41);
    legGrad.addColorStop(0, "#5a3a22");
    legGrad.addColorStop(1, "#3e2816");
    ctx.fillStyle = legGrad;
    ctx.beginPath();
    ctx.ellipse(19, 37, 4, 6, 0.15, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(29, 37, 4, 6, -0.15, 0, Math.PI*2);
    ctx.fill();
    // Cuerpo
    const bodyGrad = ctx.createRadialGradient(cx, 25, 5, cx, 28, 12);
    bodyGrad.addColorStop(0, "#6b4423");
    bodyGrad.addColorStop(0.6, "#4a2f1a");
    bodyGrad.addColorStop(1, "#2e1c0f");
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(cx, 28, 11, 10, 0, 0, Math.PI*2);
    ctx.fill();
    // Pecho
    const chestGrad = ctx.createRadialGradient(cx, 28, 2, cx, 29, 7);
    chestGrad.addColorStop(0, "#8d6a4c");
    chestGrad.addColorStop(1, "#6b4423");
    ctx.fillStyle = chestGrad;
    ctx.beginPath();
    ctx.ellipse(cx, 29, 7, 5, 0, 0, Math.PI*2);
    ctx.fill();
    // Brazos
    const armGrad = ctx.createLinearGradient(0, 24, 0, 36);
    armGrad.addColorStop(0, "#5a3a22");
    armGrad.addColorStop(1, "#3e2816");
    ctx.fillStyle = armGrad;
    ctx.beginPath();
    ctx.ellipse(13, 29, 4, 11, 0.25, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(11, 37, 3, 4, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(35, 29, 4, 11, -0.25, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(37, 37, 3, 4, 0, 0, Math.PI*2);
    ctx.fill();
    // Hombros
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(17, 23, 5, 4, -0.2, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(31, 23, 5, 4, 0.2, 0, Math.PI*2);
    ctx.fill();
    // Cabeza
    const headGrad = ctx.createRadialGradient(cx, 16, 4, cx, 17, 9);
    headGrad.addColorStop(0, "#8f6241");
    headGrad.addColorStop(1, "#543720");
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(cx, 17, 10, 8, 0, 0, Math.PI*2);
    ctx.fill();
    // Orejas
    ctx.fillStyle = "#6b4423";
    ctx.beginPath();
    ctx.ellipse(18, 16, 3, 4, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(30, 16, 3, 4, 0, 0, Math.PI*2);
    ctx.fill();
    // Hocico
    const muzzleGrad = ctx.createRadialGradient(cx, 20, 2, cx, 22, 6);
    muzzleGrad.addColorStop(0, "#caa17d");
    muzzleGrad.addColorStop(1, "#8d6a4c");
    ctx.fillStyle = muzzleGrad;
    ctx.beginPath();
    ctx.ellipse(cx, 22, 6, 5, 0, 0, Math.PI*2);
    ctx.fill();
    // Nariz
    ctx.fillStyle = "#2e1c0f";
    ctx.beginPath();
    ctx.ellipse(cx, 20, 2, 1.5, 0, 0, Math.PI*2);
    ctx.fill();
    // Ojos
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(20, 17, 2, 2.5, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(28, 17, 2, 2.5, 0, 0, Math.PI*2);
    ctx.fill();
    // Pupilas
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.arc(20, 17.5, 1, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(28, 17.5, 1, 0, Math.PI*2);
    ctx.fill();
    // Cejas
    ctx.strokeStyle = "#2e1c0f";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(18, 14);
    ctx.quadraticCurveTo(20, 13.5, 23, 14);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(25, 14);
    ctx.quadraticCurveTo(27, 13.5, 30, 14);
    ctx.stroke();
    // Boca
    ctx.strokeStyle = "#4a2f1a";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, 24, 3, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.restore();
  });

  // Banana realista - forma alargada en C
  drawTex("banana32", 52, 20, (ctx, w, h) => {
    ctx.save();
    // Gradiente amarillo más natural
    const mainGrad = ctx.createLinearGradient(6, 4, 46, 16);
    mainGrad.addColorStop(0, "#F4E04D");
    mainGrad.addColorStop(0.15, "#FFF176");
    mainGrad.addColorStop(0.4, "#FFD54F");
    mainGrad.addColorStop(0.7, "#FFC107");
    mainGrad.addColorStop(0.9, "#FFB300");
    mainGrad.addColorStop(1, "#D4A017");
    ctx.fillStyle = mainGrad;
    
    // Forma alargada de plátano en C
    ctx.beginPath();
    // Empezar desde el tallo (izquierda superior)
    ctx.moveTo(6, 8);
    // Curva superior (parte convexa del plátano)
    ctx.bezierCurveTo(10, 3, 24, 2, 38, 4);
    ctx.bezierCurveTo(44, 5, 48, 7, 46, 10);
    // Punta derecha
    ctx.lineTo(45, 11);
    // Curva inferior (parte cóncava del plátano)
    ctx.bezierCurveTo(43, 13, 28, 17, 14, 16);
    ctx.bezierCurveTo(8, 15, 5, 12, 6, 8);
    ctx.closePath();
    ctx.fill();
    
    // Sombra en el lado cóncavo
    const shadowGrad = ctx.createLinearGradient(12, 8, 12, 16);
    shadowGrad.addColorStop(0, "rgba(255, 160, 0, 0)");
    shadowGrad.addColorStop(0.5, "rgba(184, 134, 11, 0.25)");
    shadowGrad.addColorStop(1, "rgba(139, 101, 8, 0.4)");
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.moveTo(10, 10);
    ctx.quadraticCurveTo(20, 14, 32, 13);
    ctx.quadraticCurveTo(38, 12, 42, 11);
    ctx.quadraticCurveTo(30, 12, 18, 12);
    ctx.quadraticCurveTo(13, 11, 10, 10);
    ctx.fill();
    
    // Brillo en la parte convexa
    const highlightGrad = ctx.createRadialGradient(28, 6, 1, 28, 6, 12);
    highlightGrad.addColorStop(0, "rgba(255, 255, 255, 0.7)");
    highlightGrad.addColorStop(0.5, "rgba(255, 255, 220, 0.3)");
    highlightGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = highlightGrad;
    ctx.beginPath();
    ctx.ellipse(28, 7, 10, 3, -0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Manchas marrones características (más realistas)
    ctx.fillStyle = "rgba(101, 67, 33, 0.35)";
    // Mancha 1
    ctx.beginPath();
    ctx.ellipse(18, 10, 2.5, 1.2, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Mancha 2
    ctx.beginPath();
    ctx.ellipse(28, 12, 1.8, 1, -0.2, 0, Math.PI * 2);
    ctx.fill();
    // Mancha 3
    ctx.beginPath();
    ctx.ellipse(36, 9, 2, 1, 0.4, 0, Math.PI * 2);
    ctx.fill();
    // Mancha 4 (pequeña)
    ctx.beginPath();
    ctx.ellipse(14, 13, 1.2, 0.7, 0.6, 0, Math.PI * 2);
    ctx.fill();
    // Mancha 5 (pequeña)
    ctx.beginPath();
    ctx.ellipse(40, 11, 1.5, 0.8, -0.5, 0, Math.PI * 2);
    ctx.fill();
    
    // Tallo en el extremo izquierdo
    ctx.fillStyle = "#8B7355";
    ctx.beginPath();
    ctx.moveTo(5, 8);
    ctx.lineTo(3, 7);
    ctx.lineTo(3, 9);
    ctx.lineTo(5, 9);
    ctx.fill();
    
    // Contorno sutil
    ctx.strokeStyle = "#B8860B";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(6, 8);
    ctx.bezierCurveTo(10, 3, 24, 2, 38, 4);
    ctx.bezierCurveTo(44, 5, 48, 7, 46, 10);
    ctx.lineTo(45, 11);
    ctx.bezierCurveTo(43, 13, 28, 17, 14, 16);
    ctx.bezierCurveTo(8, 15, 5, 12, 6, 8);
    ctx.stroke();
    
    // Línea central característica del plátano
    ctx.strokeStyle = "rgba(184, 134, 11, 0.3)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(8, 10);
    ctx.quadraticCurveTo(24, 9, 42, 10);
    ctx.stroke();
    
    ctx.restore();
  });

  // Oficinistas/Agentes
  const agentTex = (key, suitColor, stressed) => {
    drawTex(key, 48, 48, (ctx, w, h) => {
      ctx.save();
      const cx = 24;
      // Piernas
      ctx.fillStyle = stressed ? "#1a1a1a" : "#2c2c2c";
      ctx.fillRect(16, 34, 6, 12);
      ctx.fillRect(26, 34, 6, 12);
      // Zapatos
      ctx.fillStyle = "#000000";
      ctx.fillRect(14, 44, 8, 3);
      ctx.fillRect(26, 44, 8, 3);
      // Traje
      const suitGrad = ctx.createLinearGradient(cx, 20, cx, 36);
      suitGrad.addColorStop(0, suitColor);
      suitGrad.addColorStop(1, stressed ? "#1a0000" : "#000033");
      ctx.fillStyle = suitGrad;
      ctx.fillRect(14, 20, 20, 16);
      // Camisa
      ctx.fillStyle = "#f5f5f5";
      ctx.beginPath();
      ctx.moveTo(24, 22);
      ctx.lineTo(20, 26);
      ctx.lineTo(20, 34);
      ctx.lineTo(28, 34);
      ctx.lineTo(28, 26);
      ctx.closePath();
      ctx.fill();
      // Corbata
      ctx.fillStyle = stressed ? "#8B0000" : "#003366";
      ctx.beginPath();
      ctx.moveTo(24, 24);
      ctx.lineTo(22, 26);
      ctx.lineTo(22, 33);
      ctx.lineTo(24, 34);
      ctx.lineTo(26, 33);
      ctx.lineTo(26, 26);
      ctx.closePath();
      ctx.fill();
      // Brazos
      ctx.fillStyle = suitColor;
      ctx.fillRect(10, 24, 4, 10);
      ctx.fillRect(34, 24, 4, 10);
      // Manos
      ctx.fillStyle = "#ffd4a3";
      ctx.beginPath();
      ctx.arc(12, 34, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(36, 34, 3, 0, Math.PI * 2);
      ctx.fill();
      // Cabeza
      const skinGrad = ctx.createRadialGradient(cx, 14, 3, cx, 14, 8);
      skinGrad.addColorStop(0, "#ffe0bd");
      skinGrad.addColorStop(1, "#ffd4a3");
      ctx.fillStyle = skinGrad;
      ctx.beginPath();
      ctx.arc(cx, 14, 8, 0, Math.PI * 2);
      ctx.fill();
      // Pelo
      ctx.fillStyle = stressed ? "#2c2c2c" : "#3d2817";
      ctx.beginPath();
      ctx.ellipse(cx, 10, 8, 4, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      // Ojos y expresión
      if (stressed) {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(20, 14, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(28, 14, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(20, 14, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(28, 14, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, 17, 3, 0, Math.PI);
        ctx.stroke();
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(20, 14, 2, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(28, 14, 2, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.arc(20, 14, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(28, 14, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#2c2c2c";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(18, 12);
        ctx.lineTo(20, 13);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(30, 12);
        ctx.lineTo(28, 13);
        ctx.stroke();
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(20, 19);
        ctx.lineTo(28, 19);
        ctx.stroke();
        // Maletín
        ctx.fillStyle = "#4a3428";
        ctx.fillRect(8, 30, 4, 3);
        ctx.strokeStyle = "#2c1810";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(8, 30, 4, 3);
      }
      ctx.restore();
    });
  };

  agentTex("ghost_red32", "#8B0000", false);
  agentTex("ghost_blue32", "#4169E1", true);

  // Tiles de pared por nivel
  for (let level = 1; level <= 3; level++) {
    drawTex(`wall_tile_${level}`, 16, 16, (ctx, w, h) => {
      ctx.fillStyle = LEVEL_CONFIG[level].wallColor;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = LEVEL_CONFIG[level].wallStroke;
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, w-2, h-2);
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.beginPath();
      ctx.moveTo(2, 2);
      ctx.lineTo(w-3, 2);
      ctx.lineTo(w-3, h-3);
      ctx.stroke();
    });
  }
}

// ================ PANTALLA DE INICIO ================
function showStartScreen(scene) {
  gameState = 'start';
  
  // IMPORTANTE: Limpiar completamente el estado del juego
  cleanupGame(scene);
  
  // Limpiar escena visual
  scene.children.removeAll();
  
  // Fondo
  scene.add.rectangle(W/2, H/2, W, H, 0x000000);
  
  // Logo gorila
  const logo = scene.add.image(W/2, 180, "gorilla_logo");
  logo.setScale(1.5);
  
  // Título
  scene.add.text(W/2, 330, "PLAT-MAN", {
    fontSize: "64px",
    color: "#FFD700",
    fontStyle: "bold",
    fontFamily: "Arial"
  }).setOrigin(0.5);
  
  // Descripción
  scene.add.text(W/2, 400, "¡Escapa de los agentes corporativos!", {
    fontSize: "20px",
    color: "#ffffff",
    fontFamily: "Arial"
  }).setOrigin(0.5);
  
  // Instrucciones
  scene.add.text(W/2, 460, "Controles: Flechas o WASD", {
    fontSize: "18px",
    color: "#cccccc",
    fontFamily: "Arial"
  }).setOrigin(0.5);
  
  // Botón start
  const startText = scene.add.text(W/2, 520, "PRESIONA ESPACIO PARA COMENZAR", {
    fontSize: "18px",
    color: "#cccccc",
    fontFamily: "Arial"
  }).setOrigin(0.5);
  
  // Parpadeo
  scene.tweens.add({
    targets: startText,
    alpha: 0.3,
    duration: 800,
    yoyo: true,
    repeat: -1
  });
  
  // Detectar ESPACIO o ENTER
  scene.input.keyboard.once('keydown-SPACE', () => {
    if (scene.sound.context && scene.sound.context.state === 'suspended') {
      scene.sound.context.resume();
    }
    startGame(scene);
  });
  
  scene.input.keyboard.once('keydown-ENTER', () => {
    if (scene.sound.context && scene.sound.context.state === 'suspended') {
      scene.sound.context.resume();
    }
    startGame(scene);
  });
}

// ================ LIMPIAR JUEGO COMPLETO ================
function cleanupGame(scene) {
  // Detener música
  stopBackgroundMusic();
  
  // Reanudar física si estaba pausada
  if (scene.physics && scene.physics.world) {
    scene.physics.resume();
  }
  
  // Limpiar todos los event listeners del teclado
  if (scene.input && scene.input.keyboard) {
    scene.input.keyboard.removeAllListeners();
  }
  
  // Limpiar grupos de física
  if (bananas) {
    bananas.clear(true, true);
    bananas = null;
  }
  if (ghosts) {
    ghosts.clear(true, true);
    ghosts = null;
  }
  if (wallBodies) {
    wallBodies.clear(true, true);
    wallBodies = null;
  }
  if (wallVisuals) {
    wallVisuals.clear(true, true);
    wallVisuals = null;
  }
  
  // Limpiar colisores
  if (scene.playerWallCollider) {
    scene.physics.world.removeCollider(scene.playerWallCollider);
    scene.playerWallCollider = null;
  }
  if (scene.ghostWallCollider) {
    scene.physics.world.removeCollider(scene.ghostWallCollider);
    scene.ghostWallCollider = null;
  }
  if (scene.ghostGhostCollider) {
    scene.physics.world.removeCollider(scene.ghostGhostCollider);
    scene.ghostGhostCollider = null;
  }
  
  // Resetear variables globales
  player = null;
  cursors = null;
  wasdKeys = null;
  bgRect = null;
  scoreText = null;
  levelText = null;
  currentLevel = 1;
  score = 0;
  startTime = 0;
  powerMode = false;
  powerExpiresAt = 0;
  isGameOver = false;
  rankingInputs = [];
  currentInitials = ['A', 'A', 'A'];
  selectedIndex = 0;
  finalScore = 0;
  wonGame = false;
}

// ================ INICIAR JUEGO ================
function startGame(scene) {
  // Asegurar que todo esté limpio
  cleanupGame(scene);
  
  gameState = 'playing';
  currentLevel = 1;
  score = 0;
  isGameOver = false;
  powerMode = false;
  powerExpiresAt = 0;
  
  // Limpiar escena visual
  scene.children.removeAll();
  
  // Reanudar física
  scene.physics.resume();
  
  // Música de fondo
  createBackgroundMusic(scene);
  
  // Fondo
  bgRect = scene.add.rectangle(W/2, H/2, W-20, H-20, LEVEL_CONFIG[1].bgColor)
    .setStrokeStyle(2, 0x3333ff);
  
  // Paredes
  createWalls(scene);
  
  // Jugador
  player = scene.add.image(100, 100, "gorilla32b");
  player.setScale(2.0);
  scene.physics.add.existing(player);
  player.body.setCollideWorldBounds(true);
  player.body.setCircle(20, player.width/2 - 20, player.height/2 - 20);
  player.body.setVelocity(0, 0); // Asegurar velocidad 0
  player.baseY = player.y;
  player.idleOffset = 0;
  
  // Bananas
  createBananas(scene);
  
  // Agentes
  createGhosts(scene);
  
  // Colisiones
  setupCollisions(scene);
  
  // HUD
  scoreText = scene.add.text(16, 12, "Puntaje: 0", { 
    fontSize: "20px", 
    fill: "#ffffff" 
  });
  levelText = scene.add.text(W - 16, 12, "Etapa 1", { 
    fontSize: "20px", 
    fill: "#ffffff" 
  }).setOrigin(1, 0);
  scene.add.text(W/2, H-24, "Flechas/WASD: mover • R: reiniciar", { 
    fontSize: "14px", 
    fill: "#cccccc" 
  }).setOrigin(0.5, 1);
  
  // Controles
  cursors = scene.input.keyboard.createCursorKeys();
  wasdKeys = scene.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // Reinicio con R
  scene.input.keyboard.on("keydown-R", () => {
    showStartScreen(scene);
  });
  
  startTime = scene.time.now;
}

// ================ MÚSICA DE FONDO ================
function createBackgroundMusic(scene) {
  try {
    bgMusicTimer = scene.time.addEvent({
      delay: 500,
      callback: () => {
        if (!isGameOver && scene.sound && scene.sound.context) {
          try {
            const audioContext = scene.sound.context;
            if (audioContext && audioContext.state === 'running') {
              const notes = [262, 330, 392, 330];
              const noteIndex = (bgMusicTimer.repeatCount % notes.length);
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              oscillator.frequency.value = notes[noteIndex];
              gainNode.gain.value = 0.05;
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              oscillator.start();
              oscillator.stop(audioContext.currentTime + 0.1);
            }
          } catch(e) {}
        }
      },
      loop: true
    });
  } catch(e) {
    console.log("Audio no disponible");
  }
}

function stopBackgroundMusic() {
  if (bgMusicTimer) {
    bgMusicTimer.remove();
    bgMusicTimer = null;
  }
}

// ================ CREAR PAREDES ================
function createWalls(scene) {
  if (wallBodies) wallBodies.clear(true, true);
  if (wallVisuals) wallVisuals.clear(true, true);
  
  wallBodies = scene.physics.add.staticGroup();
  wallVisuals = scene.add.group();
  
  const walls = LEVEL_CONFIG[currentLevel].walls;
  walls.forEach(([x, y, w, h]) => {
    // Cuerpo físico invisible
    const body = scene.add.rectangle(x, y, w, h);
    scene.physics.add.existing(body, true);
    wallBodies.add(body);
    
    // Visual con tiles
    const tile = scene.add.image(0, 0, `wall_tile_${currentLevel}`);
    const tw = tile.width;
    const th = tile.height;
    tile.destroy();
    
    const cols = Math.max(1, Math.floor(w / tw));
    const rows = Math.max(1, Math.floor(h / th));
    const startX = x - (cols * tw) / 2 + tw / 2;
    const startY = y - (rows * th) / 2 + th / 2;
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tileSprite = scene.add.image(
          startX + c * tw, 
          startY + r * th, 
          `wall_tile_${currentLevel}`
        );
        wallVisuals.add(tileSprite);
      }
    }
  });
}

// ================ CREAR BANANAS ================
function createBananas(scene) {
  if (bananas) bananas.clear(true, true);
  bananas = scene.physics.add.group();
  
  for (let i = 0; i < BANANAS_TOTAL; i++) {
    const p = randomPoint();
    const b = scene.add.image(p.x, p.y, "banana32");
    b.setScale(1.4);  // Ajustado para el nuevo diseño alargado
    scene.physics.add.existing(b);
    bananas.add(b);
  }
}

// ================ CREAR AGENTES ================
function createGhosts(scene) {
  if (ghosts) ghosts.clear(true, true);
  ghosts = scene.physics.add.group();
  
  for (let i = 0; i < GHOST_COUNT; i++) {
    const p = randomPoint();
    const g = scene.add.image(p.x, p.y, "ghost_red32");
    g.setScale(1.6);
    scene.physics.add.existing(g);
    g.body.setCollideWorldBounds(true);
    g.body.setBounce(1, 1);
    g.eaten = false;
    g.respawnAt = 0;
    g.nextDirChange = scene.time.now;
    setGhostVelocity(g, scene);
    ghosts.add(g);
  }
}

// ================ COLISIONES ================
function setupCollisions(scene) {
  if (scene.playerWallCollider) {
    scene.physics.world.removeCollider(scene.playerWallCollider);
  }
  if (scene.ghostWallCollider) {
    scene.physics.world.removeCollider(scene.ghostWallCollider);
  }
  if (scene.ghostGhostCollider) {
    scene.physics.world.removeCollider(scene.ghostGhostCollider);
  }
  
  scene.playerWallCollider = scene.physics.add.collider(player, wallBodies);
  scene.ghostWallCollider = scene.physics.add.collider(ghosts, wallBodies);
  scene.ghostGhostCollider = scene.physics.add.collider(ghosts, ghosts);
}

// ================ UPDATE DEL JUEGO ================
function updateGame(scene) {
  if (isGameOver) return;
  
  // Movimiento del jugador
  const speed = powerMode ? 240 : 200;
  let velX = 0, velY = 0;
  
  if (cursors.left.isDown || wasdKeys.left.isDown) velX = -speed;
  if (cursors.right.isDown || wasdKeys.right.isDown) velX = speed;
  if (cursors.up.isDown || wasdKeys.up.isDown) velY = -speed;
  if (cursors.down.isDown || wasdKeys.down.isDown) velY = speed;
  
  player.body.setVelocity(velX, velY);
  
  // Animación idle
  if (velX === 0 && velY === 0) {
    player.idleOffset += 0.1;
    const bobAmount = Math.sin(player.idleOffset) * 2;
    player.y = player.baseY + bobAmount;
    player.setRotation(0);
  } else {
    player.baseY = player.y;
    player.idleOffset = 0;
    const tilt = velX !== 0 ? (velX > 0 ? 0.15 : -0.15) : (velY > 0 ? 0.1 : -0.1);
    player.setRotation(tilt);
  }
  
  // Colisión con bananas
  scene.physics.overlap(player, bananas, (p, banana) => {
    banana.destroy();
    score += 10;
    activatePowerMode(scene);
  });
  
  // Modo poder
  if (powerMode && scene.time.now >= powerExpiresAt) {
    setPowerMode(scene, false);
  }
  
  // Actualizar agentes
  ghosts.getChildren().forEach(g => {
    if (g.eaten) {
      if (scene.time.now >= g.respawnAt) {
        g.eaten = false;
        const p = randomPoint();
        g.setPosition(p.x, p.y);
        g.setVisible(true);
        g.setTexture(powerMode ? "ghost_blue32" : "ghost_red32");
        setGhostVelocity(g, scene);
      }
    } else {
      if (scene.time.now >= g.nextDirChange) {
        setGhostVelocity(g, scene);
        g.nextDirChange = scene.time.now + Phaser.Math.Between(700, 1500);
      }
      
      // Colisión con agentes
      const dist = Phaser.Math.Distance.Between(player.x, player.y, g.x, g.y);
      if (dist < 30) {
        if (powerMode) {
          score += 50;
          g.eaten = true;
          g.setVisible(false);
          g.body.setVelocity(0);
          g.respawnAt = scene.time.now + 2500;
        } else {
          gameOver(scene, false);
        }
      }
    }
  });
  
  // Actualizar HUD
  const survived = Math.floor((scene.time.now - startTime) / 1000);
  const total = score + survived;
  scoreText.setText(`Puntaje: ${total}${powerMode ? " (PODER!)" : ""}`);
  
  // Victoria si no quedan bananas
  if (bananas.countActive(true) === 0) {
    if (currentLevel < 3) {
      advanceLevel(scene);
    } else {
      gameOver(scene, true);
    }
  }
}

// ================ MODO PODER ================
function activatePowerMode(scene) {
  powerMode = true;
  powerExpiresAt = scene.time.now + POWER_DURATION_MS;
  ghosts.getChildren().forEach(g => {
    if (!g.eaten) g.setTexture("ghost_blue32");
  });
}

function setPowerMode(scene, active) {
  powerMode = active;
  if (!active) {
    ghosts.getChildren().forEach(g => {
      if (!g.eaten) g.setTexture("ghost_red32");
    });
  }
}

// ================ AVANZAR NIVEL ================
function advanceLevel(scene) {
  currentLevel++;
  powerMode = false;
  powerExpiresAt = 0;
  
  bgRect.setFillStyle(LEVEL_CONFIG[currentLevel].bgColor);
  
  player.x = 100;
  player.y = 100;
  player.baseY = player.y;
  player.setRotation(0);
  
  createWalls(scene);
  createBananas(scene);
  createGhosts(scene);
  setupCollisions(scene);
  
  levelText.setText(LEVEL_CONFIG[currentLevel].name);
  
  const msg = scene.add.text(W/2, H/2, `¡${LEVEL_CONFIG[currentLevel].name}!`, {
    fontSize: "48px",
    color: "#ffffff",
    fontStyle: "bold"
  }).setOrigin(0.5);
  
  scene.tweens.add({
    targets: msg,
    alpha: 0,
    duration: 2000,
    onComplete: () => msg.destroy()
  });
}

// ================ GAME OVER ================
function gameOver(scene, win) {
  isGameOver = true;
  scene.physics.pause();
  stopBackgroundMusic();
  
  const survived = Math.floor((scene.time.now - startTime) / 1000);
  finalScore = score + survived;
  wonGame = win;
  
  showRankingScreen(scene);
}

// ================ PANTALLA DE RANKING ================
function showRankingScreen(scene) {
  gameState = 'ranking';
  
  // Limpiar event listeners previos
  scene.input.keyboard.removeAllListeners();
  
  scene.children.removeAll();
  
  scene.add.rectangle(W/2, H/2, W, H, 0x000000);
  
  if (wonGame) {
    scene.add.text(W/2, 80, "¡VICTORIA!", {
      fontSize: "48px",
      color: "#FFD700",
      fontStyle: "bold",
      fontFamily: "Arial"
    }).setOrigin(0.5);
    
    scene.add.text(W/2, 130, "¡Completaste las 3 etapas!", {
      fontSize: "20px",
      color: "#00ff00",
      fontFamily: "Arial"
    }).setOrigin(0.5);
  } else {
    scene.add.text(W/2, 80, "GAME OVER", {
      fontSize: "48px",
      color: "#ff0000",
      fontStyle: "bold",
      fontFamily: "Arial"
    }).setOrigin(0.5);
  }
  
  const scoreY = wonGame ? 180 : 150;
  scene.add.text(W/2, scoreY, `Tu puntuación: ${finalScore}`, {
    fontSize: "32px",
    color: "#ffffff",
    fontFamily: "Arial"
  }).setOrigin(0.5);
  
  scene.add.text(W/2, scoreY + 40, "Ingresa tus iniciales (3 letras):", {
    fontSize: "20px",
    color: "#FFD700",
    fontFamily: "Arial"
  }).setOrigin(0.5);
  
  // Crear inputs para iniciales
  rankingInputs = [];
  currentInitials = ['A', 'A', 'A'];
  selectedIndex = 0;
  
  for (let i = 0; i < 3; i++) {
    const x = W/2 - 60 + i * 60;
    const y = scoreY + 100;
    
    const bg = scene.add.rectangle(x, y, 50, 60, 0x333333);
    const txt = scene.add.text(x, y, currentInitials[i], {
      fontSize: "40px",
      color: "#ffffff",
      fontFamily: "Arial"
    }).setOrigin(0.5);
    
    rankingInputs.push({ bg, txt, index: i });
  }
  
  updateRankingSelection(scene);
  
  scene.add.text(W/2, scoreY + 180, "↑↓ cambiar letra  ←→ mover  ENTER confirmar", {
    fontSize: "16px",
    color: "#cccccc",
    fontFamily: "Arial"
  }).setOrigin(0.5);
  
  // Controles - usar once para evitar múltiples registros
  const handleUp = () => changeInitial(scene, 1);
  const handleDown = () => changeInitial(scene, -1);
  const handleLeft = () => moveSelection(scene, -1);
  const handleRight = () => moveSelection(scene, 1);
  const handleEnter = () => saveRanking(scene);
  
  scene.input.keyboard.on('keydown-UP', handleUp);
  scene.input.keyboard.on('keydown-DOWN', handleDown);
  scene.input.keyboard.on('keydown-LEFT', handleLeft);
  scene.input.keyboard.on('keydown-RIGHT', handleRight);
  scene.input.keyboard.on('keydown-ENTER', handleEnter);
}

function updateRankingSelection(scene) {
  rankingInputs.forEach((item, i) => {
    if (i === selectedIndex) {
      item.bg.setFillStyle(0xFFD700);
      item.txt.setColor("#000000");
    } else {
      item.bg.setFillStyle(0x333333);
      item.txt.setColor("#ffffff");
    }
  });
}

function changeInitial(scene, dir) {
  if (gameState !== 'ranking') return;
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let idx = letters.indexOf(currentInitials[selectedIndex]);
  idx = (idx + dir + letters.length) % letters.length;
  currentInitials[selectedIndex] = letters[idx];
  rankingInputs[selectedIndex].txt.setText(currentInitials[selectedIndex]);
}

function moveSelection(scene, dir) {
  if (gameState !== 'ranking') return;
  selectedIndex = (selectedIndex + dir + 3) % 3;
  updateRankingSelection(scene);
}

function saveRanking(scene) {
  if (gameState !== 'ranking') return;
  
  const initials = currentInitials.join('');
  let ranking = [];
  
  try {
    const saved = localStorage.getItem(RANKING_KEY);
    if (saved) ranking = JSON.parse(saved);
  } catch(e) {}
  
  ranking.push({ initials, score: finalScore });
  ranking.sort((a, b) => b.score - a.score);
  ranking = ranking.slice(0, 5);
  
  try {
    localStorage.setItem(RANKING_KEY, JSON.stringify(ranking));
  } catch(e) {}
  
  showFinalRanking(scene, ranking);
}

function showFinalRanking(scene, ranking) {
  // Limpiar todo antes de mostrar ranking final
  scene.input.keyboard.removeAllListeners();
  scene.children.removeAll();
  
  scene.add.rectangle(W/2, H/2, W, H, 0x000000);
  
  scene.add.text(W/2, 80, "TOP 5 RANKING", {
    fontSize: "48px",
    color: "#FFD700",
    fontStyle: "bold",
    fontFamily: "Arial"
  }).setOrigin(0.5);
  
  ranking.forEach((entry, i) => {
    const y = 160 + i * 50;
    let color = "#ffffff";
    if (i === 0) color = "#FFD700";
    else if (i === 1) color = "#C0C0C0";
    else if (i === 2) color = "#CD7F32";
    
    scene.add.text(W/2, y, `${i + 1}. ${entry.initials} - ${entry.score}`, {
      fontSize: "32px",
      color: color,
      fontFamily: "Arial"
    }).setOrigin(0.5);
  });
  
  scene.add.text(W/2, 450, "Presiona ESPACIO para volver al inicio", {
    fontSize: "18px",
    color: "#cccccc",
    fontFamily: "Arial"
  }).setOrigin(0.5);
  
  scene.input.keyboard.once('keydown-SPACE', () => {
    showStartScreen(scene);
  });
}

// ================ UTILIDADES ================
function randomPoint() {
  return {
    x: Phaser.Math.Between(80, W - 80),
    y: Phaser.Math.Between(80, H - 80)
  };
}

function setGhostVelocity(ghost, scene) {
  const speed = LEVEL_CONFIG[currentLevel].ghostSpeed;
  const dirs = [
    { x: 1, y: 0 }, { x: -1, y: 0 },
    { x: 0, y: 1 }, { x: 0, y: -1 }
  ];
  const d = Phaser.Utils.Array.GetRandom(dirs);
  ghost.body.setVelocity(d.x * speed, d.y * speed);
}

