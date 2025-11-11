// =============================================================================
// ARCADE BUTTON MAPPING - INCLUIDO DESDE EL OTRO JS
// =============================================================================
const ARCADE_CONTROLS = {
    // Joystick para navegación: P1L/P1R
    'P1U': ['w'],
    'P1D': ['s'],
    'P1L': ['a', 'ArrowLeft'], // Usaremos P1L para 'Izquierda'
    'P1R': ['d', 'ArrowRight'], // Usaremos P1R para 'Derecha'

    // Botones de Acción (Pulsar el color): P1A
    'P1A': ['u', ' ', 'Enter'], // Usaremos P1A para 'Seleccionar/ESPACIO'
    'P1B': ['i'],
    'P1C': ['o'],
    'P1X': ['j'],
    'P1Y': ['k'],
    'P1Z': ['l'],

    // Botones de Inicio: START1
    'START1': ['1', 'Enter']
};

// Construir un mapeo inverso: tecla de teclado → código de botón arcade
const KEYBOARD_TO_ARCADE = {};
for (const [arcadeCode, keyboardKeys] of Object.entries(ARCADE_CONTROLS)) {
    if (keyboardKeys) {
        const keys = Array.isArray(keyboardKeys) ? keyboardKeys : [keyboardKeys];
        keys.forEach(key => {
            // Normalizar mayúsculas/minúsculas para las teclas
            KEYBOARD_TO_ARCADE[key.toLowerCase()] = arcadeCode;
        });
    }
}
// =============================================================================
// FIN DEL MAPEADO ARCADE
// =============================================================================


// --- Variables de Juego ---
const COLORES = [
    { nombre: 'Rojo', hex: 0xff4444, freq: 440 }, // A4
    { nombre: 'Verde', hex: 0x44ff44, freq: 554 }, // C#5
    { nombre: 'Azul', hex: 0x4499ff, freq: 659 }, // E5
    { nombre: 'Amarillo', hex: 0xffff44, freq: 880 }, // A5
    { nombre: 'Blanco', hex: 0xffffff, freq: 987 }, // B5
    { nombre: 'Morado', hex: 0xcc44ff, freq: 783 } // G5
];

// Rangos y Títulos
const RANGOS = [
    "Platano Junior", "Platano Aprendiz", "Caminante Dorado", "Simio Nivel-1", 
    "Platano Mayor", "Maestro Bananero", "Hacker Prime", "Súper Plátano" 
];
const NIVEL_MAXIMO = 35; 
const HIGHSCORE_KEY = 'platanusDiceHighScores'; 

let secuenciaActual = [], indiceEntrada = 0;
let tiempoSecuencia = 700; 
let tiempoLimiteJuego = 5000; 
let enReproduccion = false, coloresBotones = [];
let textoEstado, temporizadorJugador, puntuacion = 0, textoPuntuacion, textoCronometro;
let botonSeleccionadoIndice = 0; 
let contenedorCasillas; 
let juegoScene; 
let inicioTiempoJugador = 0; 
let racha = 0; 
let textoRacha; 
let audioContext = null;
let jingleTimeout = null; 

// (Funciones de Audio Context y Jingle sin cambios)
// --- Web Audio Generator ---
function initializeAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playTone(frecuencia, duracionMs, tipoOnda = 'square', volumen = 0.5) {
    initializeAudioContext();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = tipoOnda; 
    oscillator.frequency.setValueAtTime(frecuencia, audioContext.currentTime);

    const now = audioContext.currentTime;
    const duracionSeg = duracionMs / 1000;
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volumen, now + 0.01); 
    gainNode.gain.linearRampToValueAtTime(0.0, now + duracionSeg);

    oscillator.start();
    oscillator.stop(now + duracionSeg);
}

function playPacmanJingle() {
    const notes = [
        { freq: 440, duration: 120 }, 
        { freq: 392, duration: 120 }, 
        { freq: 349, duration: 120 }, 
        { freq: 330, duration: 120 }, 
        { freq: 311, duration: 150, type: 'triangle', vol: 0.6 } 
    ];

    let delay = 0;
    
    notes.forEach((note) => {
        jingleTimeout = setTimeout(() => {
            playTone(note.freq, note.duration, note.type || 'square', note.vol || 0.4);
        }, delay);
        
        delay += note.duration - 30; 
    });
}

function playWinJingle() {
    const notes = [
        { freq: 659, duration: 100, vol: 0.5 }, // E5
        { freq: 783, duration: 100, vol: 0.5 }, // G5
        { freq: 987, duration: 250, vol: 0.7 }  // B5
    ];
    let delay = 0;
    notes.forEach((note) => {
        setTimeout(() => playTone(note.freq, note.duration, 'sine', note.vol), delay);
        delay += note.duration;
    });
}

function playGameOverJingle() {
    const notes = [
        { freq: 330, duration: 200, vol: 0.6, type: 'sawtooth' }, // E4
        { freq: 247, duration: 200, vol: 0.6, type: 'sawtooth' }, // B3
        { freq: 165, duration: 500, vol: 0.8, type: 'square' } // E3 (Final)
    ];
    let delay = 0;
    notes.forEach((note) => {
        setTimeout(() => playTone(note.freq, note.duration, note.type, note.vol), delay);
        delay += note.duration;
    });
}


// --- High Score Logic (sin cambios) ---

function cargarHighScores() {
    try {
        const scores = localStorage.getItem(HIGHSCORE_KEY);
        return scores ? JSON.parse(scores) : [];
    } catch (e) {
        console.error("Error cargando High Scores:", e);
        return [];
    }
}

function guardarHighScores(scores) {
    try {
        localStorage.setItem(HIGHSCORE_KEY, JSON.stringify(scores));
    } catch (e) {
        console.error("Error guardando High Scores:", e);
    }
}

function actualizarHighScores(nuevaPuntuacion) {
    let scores = cargarHighScores();

    if (nuevaPuntuacion > 0) {
        let esNuevoRecord = false;

        if (scores.length < 5 || nuevaPuntuacion > scores[scores.length - 1].score) {
            esNuevoRecord = true;
        }

        if (esNuevoRecord) {
            let iniciales = prompt(`¡NUEVO RECORD (${nuevaPuntuacion})! Ingresa tus iniciales (3 letras):`);
            if (iniciales) {
                iniciales = iniciales.toUpperCase().substring(0, 3);
            } else {
                iniciales = "AAA";
            }

            scores.push({ initials: iniciales, score: nuevaPuntuacion });
            
            scores.sort((a, b) => b.score - a.score);

            scores = scores.slice(0, 5); // Asegura solo el TOP 5
            
            guardarHighScores(scores);
        }
    }
    return scores;
}

// Reinicialización de variables globales
function resetearVariables() {
    secuenciaActual = [];
    indiceEntrada = 0;
    tiempoSecuencia = 700;
    tiempoLimiteJuego = 5000; 
    enReproduccion = false;
    coloresBotones = [];
    puntuacion = 0;
    botonSeleccionadoIndice = 0;
    inicioTiempoJugador = 0;
    racha = 0;
}

// --- Configuración de Phaser (sin cambios) ---
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: { preload, create, update }
};
new Phaser.Game(config);

function preload() {
    // No assets
}

function create() {
    juegoScene = this; 
    resetearVariables(); 
    
    // Limpiar timeout del jingle si la escena se reinicia
    if (jingleTimeout) clearTimeout(jingleTimeout); 

    const W = this.sys.game.config.width;
    const H = this.sys.game.config.height;

    // Fondo y Scanlines (decoración sin cambios)
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000).setAlpha(1);
    const scanlines = this.add.graphics({ lineStyle: { width: 1, color: 0x000000, alpha: 0.15 } });
    for(let y = 0; y < H; y += 2) {
        scanlines.lineBetween(0, y, W, y);
    }
    
    // Decoración
    const deco = this.add.graphics({ fillStyle: { color: 0x5c2e00 } });
    deco.fillCircle(40, 40, 20); deco.fillCircle(W - 40, 40, 20); deco.fillCircle(40, H - 40, 20); deco.fillCircle(W - 40, H - 40, 20);

    // Texto de Estado (Posición Ajustada: y=130)
    textoEstado = this.add.text(W / 2, 130, '🍌 PLATANUS DICE 🍌', { 
        fontFamily: 'ArcadeFont, monospace', fontSize: '48px', color: '#ffdd00',
        stroke: '#ff0000', strokeThickness: 5, align: 'center'
    }).setOrigin(0.5);

    // Texto de Puntuación
    textoPuntuacion = this.add.text(40, 40, 'PUNTAJE: 0', {
        fontFamily: 'ArcadeFont, monospace', fontSize: '32px', color: '#00ffaa',
        stroke: '#004444', strokeThickness: 3
    });
    
    // Cronómetro
    textoCronometro = this.add.text(W - 40, 75, '5.00', { 
        fontFamily: 'ArcadeFont, monospace', 
        fontSize: '24px', 
        color: '#ffff00', 
        stroke: '#884400', 
        strokeThickness: 2 
    }).setOrigin(1, 0);

    // Indicador de Racha
    textoRacha = this.add.text(W / 2, 40, 'RACHA: 0', {
        fontFamily: 'ArcadeFont, monospace',
        fontSize: '32px',
        color: '#ff00ff',
        stroke: '#440044',
        strokeThickness: 3
    }).setOrigin(0.5);


    // Contenedor de Casillas de Secuencia (Posición: y=270)
    contenedorCasillas = this.add.container(W / 2, 270); 
    
    // Configuración de Controles Arcade
    // Asegurar que el AudioContext se active con cualquier interacción
    this.input.keyboard.once('keydown', initializeAudioContext);
    this.input.on('pointerdown', initializeAudioContext); 

    // ** Lógica de Mapeo de Teclado Centralizada **
    this.input.keyboard.on('keydown', (event) => {
        // Normaliza la tecla de teclado a su código de botón arcade (P1A, P1L, P1R, START1, etc.)
        const arcadeCode = KEYBOARD_TO_ARCADE[event.key.toLowerCase()];

        // Comprobación de que no estamos en medio de la reproducción de la secuencia
        if (enReproduccion) return;
        
        // Lógica de Reinicio (Usando P1A o START1)
        if ((arcadeCode === 'P1A' || arcadeCode === 'START1') && textoEstado.text.includes('PARA REINICIAR')) {
            this.scene.restart();
            return;
        }

        // Lógica de Movimiento
        if (arcadeCode === 'P1L') { // Izquierda
            actualizarBotonSeleccionado.call(this, -1);
        } else if (arcadeCode === 'P1R') { // Derecha
            actualizarBotonSeleccionado.call(this, 1);
        }
        
        // Lógica de Pulsar Botón (P1A)
        else if (arcadeCode === 'P1A' && coloresBotones.length > 0) {
            const colorPulsado = coloresBotones[botonSeleccionadoIndice].getData('color');
            botonPulsado.call(this, colorPulsado, coloresBotones[botonSeleccionadoIndice]);
        }
    });
    
    // ** Código original de teclado eliminado/reemplazado: **
    /*
    this.input.keyboard.on('keydown-SPACE', () => {
        if (!enReproduccion && coloresBotones.length > 0) {
            const colorPulsado = coloresBotones[botonSeleccionadoIndice].getData('color');
            botonPulsado.call(this, colorPulsado, coloresBotones[botonSeleccionadoIndice]);
        }
    });

    this.input.keyboard.on('keydown-LEFT', () => {
        if (!enReproduccion) actualizarBotonSeleccionado.call(this, -1);
    });

    this.input.keyboard.on('keydown-RIGHT', () => {
        if (!enReproduccion) actualizarBotonSeleccionado.call(this, 1);
    });
    */
    
    // INICIO DEL JUEGO: Reproducir jingle y luego iniciar la primera ronda
    dibujarBotones.call(this);
    this.time.delayedCall(1000, playPacmanJingle, [], this); 
    this.time.delayedCall(1000 + 700, iniciarRonda, [], this); 
}

// (Función Update sin cambios, ya que maneja el parpadeo y el cronómetro)
function update() {
    // Lógica del Cronómetro en cada frame
    if (!enReproduccion && temporizadorJugador && temporizadorJugador.paused === false) {
        const tiempoTranscurrido = juegoScene.time.now - inicioTiempoJugador;
        let tiempoRestante = tiempoLimiteJuego - tiempoTranscurrido;
        
        if (tiempoRestante < 0) tiempoRestante = 0;

        const segundos = (tiempoRestante / 1000).toFixed(2);
        textoCronometro.setText(segundos);

        if (tiempoRestante < 1000) {
            const alpha = Math.sin(juegoScene.time.now / 50) > 0 ? 1 : 0.5;
            textoCronometro.setColor('#ff0000').setAlpha(alpha); 
        } else if (tiempoRestante < 2500) {
            textoCronometro.setColor('#ff9900').setAlpha(1); 
        } else {
            textoCronometro.setColor('#ffff00').setAlpha(1); 
        }
    } else {
        textoCronometro.setText('0.00');
    }

    if (!enReproduccion && coloresBotones.length > 0) {
        coloresBotones.forEach((boton, i) => {
            if (i === botonSeleccionadoIndice) {
                const alpha = 0.8 + Math.sin(juegoScene.time.now / 150) * 0.2;
                boton.setAlpha(alpha);
            } else {
                boton.setAlpha(1);
            }
        });
    }
}

// (Resto de las funciones de Juego sin cambios)

function obtenerRangoActual(nivel) {
    const nivelesPorRango = 5; 
    const indice = Math.floor((nivel - 1) / nivelesPorRango);
    
    if (nivel >= NIVEL_MAXIMO) return "LEYENDA SUPREMA 👑";
    if (indice >= RANGOS.length) return RANGOS[RANGOS.length - 1]; 
    
    return RANGOS[indice];
}

function dibujarSecuenciaCasillas() {
    contenedorCasillas.removeAll(true);
    const anchoCasilla = 30, padding = 10;
    const totalWidth = secuenciaActual.length * anchoCasilla + (secuenciaActual.length - 1) * padding;
    let xCasilla = -totalWidth / 2 + anchoCasilla / 2;

    secuenciaActual.forEach((colorNombre, i) => {
        const color = COLORES.find(c => c.nombre === colorNombre);
        const colorHex = color.hex;
        
        let casillaColor = 0x000000;
        let casillaBorde = 0x555555; 
        let texto = '?';
        let textColor = '#ffffff';

        if (i < indiceEntrada) {
            casillaColor = colorHex;
            casillaBorde = 0xffff00; 
            texto = ''; 
        }

        const casilla = juegoScene.add.rectangle(xCasilla, 0, anchoCasilla, anchoCasilla, casillaColor)
            .setStrokeStyle(3, casillaBorde)
            .setAlpha(0.8);

        if (texto === '?') {
            const textoQ = juegoScene.add.text(xCasilla, 0, texto, {
                fontFamily: 'ArcadeFont',
                fontSize: '24px',
                color: textColor
            }).setOrigin(0.5);
            contenedorCasillas.add(textoQ);
        }

        contenedorCasillas.add(casilla);
        contenedorCasillas.sendToBack(casilla);
        
        xCasilla += anchoCasilla + padding;
    });
}

function actualizarBotonSeleccionado(direccion) {
    if (coloresBotones.length === 0) return;

    if (coloresBotones[botonSeleccionadoIndice]) {
        coloresBotones[botonSeleccionadoIndice].setStrokeStyle(5, 0xffffff); 
    }

    let nuevoIndice = botonSeleccionadoIndice + direccion;
    if (nuevoIndice >= COLORES.length) {
        nuevoIndice = 0;
    } else if (nuevoIndice < 0) {
        nuevoIndice = COLORES.length - 1;
    }
    
    botonSeleccionadoIndice = nuevoIndice;

    coloresBotones[botonSeleccionadoIndice].setStrokeStyle(8, 0xffff00); 
}

function dibujarBotones() {
    const W = juegoScene.sys.game.config.width;
    const anchoBoton = 110, padding = 30;
    const totalWidth = COLORES.length * anchoBoton + (COLORES.length - 1) * padding;
    let x = (W - totalWidth) / 2 + anchoBoton / 2;
    const yBoton = 600;
    coloresBotones = [];

    COLORES.forEach((c, i) => {
        const boton = juegoScene.add.rectangle(x, yBoton + 400, anchoBoton, anchoBoton, c.hex)
            .setInteractive()
            .setData('color', c.nombre)
            .setStrokeStyle(5, 0xffffff)
            .setOrigin(0.5, 0.5);

        juegoScene.tweens.add({
            targets: boton,
            y: yBoton,
            duration: 900,
            delay: i * 100,
            ease: 'Bounce.easeOut'
        });

        coloresBotones.push(boton);
        x += anchoBoton + padding;
    });
    
    actualizarBotonSeleccionado.call(juegoScene, 0); 
}

function iniciarRonda() {
    if (secuenciaActual.length >= NIVEL_MAXIMO) {
        juegoTerminado.call(juegoScene, '¡JUEGO SUPERADO! ERES EL REY BANANERO');
        return;
    }

    const colorNuevo = COLORES[Phaser.Math.Between(0, COLORES.length - 1)];
    secuenciaActual.push(colorNuevo.nombre);
    indiceEntrada = 0;
    
    dibujarSecuenciaCasillas.call(juegoScene);
    
    const rango = obtenerRangoActual(secuenciaActual.length);
    textoEstado.setText(`NIVEL ${secuenciaActual.length} [${rango}]: ¡OBSERVA!`);
    coloresBotones.forEach(b => b.disableInteractive());
    juegoScene.time.delayedCall(1200, mostrarSecuencia, [0], juegoScene);
}

function mostrarSecuencia(i) {
    if (i >= secuenciaActual.length) {
        enReproduccion = false;
        coloresBotones.forEach(b => b.setInteractive()); 
        textoEstado.setText('¡TU TURNO, HACKER!');
        iniciarEntradaJugador.call(juegoScene);
        return;
    }
    enReproduccion = true;
    const colorNombre = secuenciaActual[i];
    const boton = coloresBotones.find(b => b.getData('color') === colorNombre);
    const colorData = COLORES.find(c => c.nombre === colorNombre);
    
    // SONIDO: Tono por cada color de la secuencia
    playTone(colorData.freq, tiempoSecuencia * 0.5, 'square', 0.4);

    juegoScene.tweens.add({
        targets: boton, scale: 1.3, duration: tiempoSecuencia * 0.4, yoyo: true, ease: 'Sine.easeInOut',
        onStart: () => {
             boton.setStrokeStyle(8, 0xffffff); 
        },
        onYoyo: () => {
             const botonIndice = COLORES.findIndex(c => c.nombre === colorNombre);
             boton.setStrokeStyle(5, (botonSeleccionadoIndice === botonIndice) ? 0xffff00 : 0xffffff);
        },
        onComplete: () => juegoScene.time.delayedCall(tiempoSecuencia * 0.6, mostrarSecuencia, [i + 1], juegoScene)
    });
}

function iniciarEntradaJugador() {
    if (temporizadorJugador) temporizadorJugador.remove(false);
    
    inicioTiempoJugador = juegoScene.time.now; 
    
    temporizadorJugador = juegoScene.time.delayedCall(tiempoLimiteJuego, finalizarPorTiempo, [], juegoScene);
}

function obtenerCalificacion(tiempoTranscurrido) {
    const t = tiempoTranscurrido;
    if (t < 500) return '¡FLASH!';
    if (t < 1500) return '¡RÁPIDO!';
    if (t < 3000) return '¡BIEN HECHO!';
    if (t < 4500) return '¡APENAS!';
    return '¡UFF, JUSTO!';
}

function botonPulsado(colorPulsado, boton) {
    if (enReproduccion) return; 

    const tiempoTranscurrido = juegoScene.time.now - inicioTiempoJugador;

    if (temporizadorJugador) temporizadorJugador.remove(false);
    
    inicioTiempoJugador = juegoScene.time.now;
    temporizadorJugador = juegoScene.time.delayedCall(tiempoLimiteJuego, finalizarPorTiempo, [], juegoScene);

    juegoScene.tweens.add({ targets: boton, scale: 0.85, duration: 60, yoyo: true });

    if (colorPulsado === secuenciaActual[indiceEntrada]) {
        // CORRECTO: Tono de acierto
        playTone(1000, 100, 'sine', 0.6); 
        
        indiceEntrada++;
        dibujarSecuenciaCasillas.call(juegoScene); 
        
        // Calificación por Turno
        const calificacion = obtenerCalificacion(tiempoTranscurrido);
        textoEstado.setText(calificacion).setColor('#00ff00');
        juegoScene.time.delayedCall(500, () => textoEstado.setText('¡TU TURNO, HACKER!').setColor('#ffdd00'), [], juegoScene);
        
        if (indiceEntrada === secuenciaActual.length) {
            // Se completa la ronda: Detener el cronómetro antes del siguiente retraso
            temporizadorJugador.remove(false); 
            textoCronometro.setText('0.00'); // Reset visual inmediato
            rondaSuperada.call(juegoScene);
        }
    } else {
        // Romper la racha
        racha = 0;
        textoRacha.setText(`RACHA: ${racha}`);

        temporizadorJugador.remove(false);
        
        const casillaError = contenedorCasillas.getAll().find(obj => obj instanceof Phaser.GameObjects.Rectangle && contenedorCasillas.getIndex(obj) === indiceEntrada * 2);

        if (casillaError) {
              juegoScene.tweens.add({
                  targets: casillaError, fillColor: 0xff0000, duration: 150, yoyo: true, repeat: 3
               });
        }
        
        juegoScene.time.delayedCall(1000, () => juegoTerminado.call(juegoScene, `¡ERROR! ERA ${secuenciaActual[indiceEntrada]} 🍌`), [], juegoScene);
    }
}

function rondaSuperada() {
    // SONIDO DE VICTORIA
    playWinJingle();

    puntuacion++;
    racha++; // Aumentar racha al completar una ronda
    textoPuntuacion.setText(`PUNTAJE: ${puntuacion}`);
    textoRacha.setText(`RACHA: ${racha}`); // Actualizar racha

    // Aumento de dificultad
    tiempoSecuencia = Math.max(250, tiempoSecuencia - 30); 
    tiempoLimiteJuego = Math.max(1500, tiempoLimiteJuego - 150); 
    
    const rango = obtenerRangoActual(secuenciaActual.length);
    textoEstado.setText(`¡NIVEL SUPERADO! ERES ${rango}.`);
    
    juegoScene.time.delayedCall(1800, iniciarRonda, [], juegoScene);
}

function finalizarPorTiempo() {
    racha = 0; // Romper racha por tiempo
    textoRacha.setText(`RACHA: ${racha}`);
    juegoTerminado.call(juegoScene, '⏰ ¡TIEMPO AGOTADO!');
}

function mostrarTablaHighScores(highScores) {
    const W = juegoScene.sys.game.config.width;

    juegoScene.add.text(W / 2, 300, 'TABLA DE PLATANO-RANGOS', { // Título ajustado a y=300
        fontFamily: 'ArcadeFont, monospace', fontSize: '30px', color: '#00ffcc',
        stroke: '#004444', strokeThickness: 3
    }).setOrigin(0.5);

    let yPos = 350; // Posición inicial de la primera entrada ajustada a y=350
    highScores.forEach((scoreData, index) => {
        const rank = index + 1;
        const initials = scoreData.initials;
        const score = scoreData.score;
        
        const line = `${rank}. ${initials} ............ ${score}`;
        
        juegoScene.add.text(W / 2, yPos, line, {
            fontFamily: 'ArcadeFont, monospace', fontSize: '24px', color: '#ffff00'
        }).setOrigin(0.5);
        yPos += 30;
    });
}

function juegoTerminado(msg) {
    // SONIDO DE DERROTA
    playGameOverJingle();
    
    coloresBotones.forEach(b => b.disableInteractive());
    
    if (temporizadorJugador) temporizadorJugador.remove(false);
    textoCronometro.setText('0.00');
    
    // Ocultar la racha al finalizar el juego
    textoRacha.setVisible(false);

    const finalScore = puntuacion;
    const highScores = actualizarHighScores(finalScore);

    // Ajustar el texto de estado para que no tape la tabla
    textoEstado.setText(`${msg}\n\nPUNTAJE FINAL: ${finalScore}`).setLineSpacing(10).setY(130);
    textoEstado.setColor('#ff0000').setStroke('#ffff00', 4);

    juegoScene.tweens.add({
        targets: textoEstado, alpha: 0.5, yoyo: true, repeat: 5, duration: 200
    });

    mostrarTablaHighScores(highScores);

    // Instrucción de Reinicio adaptada para la cabina arcade
    const restart = juegoScene.add.text(juegoScene.sys.game.config.width / 2, 650, 'PRESIONA P1A O START PARA REINICIAR', {
        fontFamily: 'ArcadeFont, monospace', fontSize: '36px', color: '#ffff55',
        stroke: '#000000', strokeThickness: 2, backgroundColor: '#333',
        padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();
    
    // ** La lógica de reinicio ya está en el listener 'keydown' en la función create, 
    // pero mantenemos el listener para la tecla ESPACIO por si acaso, aunque ya no es necesaria con el mapeo.
    // Lo eliminaremos por la implementación centralizada en 'keydown' que usa el mapeo arcade.
    /* juegoScene.input.keyboard.once('keydown-SPACE', () => {
          juegoScene.scene.restart(); 
    }); */
}
