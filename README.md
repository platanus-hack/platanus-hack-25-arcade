# PLAT-MAN 🍌🦍

Un juego arcade para Platanus Hack 25 donde un gorila escapa de agentes corporativos estresados mientras recolecta plátanos.

## 🎮 Descripción

- **3 niveles** con dificultad creciente
- **Agentes corporativos** como enemigos (con trajes y maletines)
- **Bananas realistas** que dan poder temporal
- **Sistema de ranking** con Top 5 (almacenado en localStorage)
- **Música de fondo** generada con Web Audio API
- **Sprites procedurales** dibujados en runtime (sin imágenes externas)

## 🎯 Controles

- **Flechas** o **WASD**: Mover al gorila
- **ESPACIO/ENTER**: Iniciar juego / Confirmar
- **↑↓**: Cambiar letra en ranking
- **←→**: Mover entre letras en ranking
- **R**: Reiniciar (durante el juego)

## 📁 Estructura del Proyecto

```
platanus-phaser-game/
├── game.js          # ✅ Código principal del juego (sin imports)
├── metadata.json    # ✅ Nombre y descripción del juego
├── index.html       # HTML con Phaser desde CDN
├── README.md        # Este archivo
└── cover.png        # (pendiente) Imagen 800x600px
```

## ⚙️ Características Técnicas

### Cumple con restricciones:
- ✅ **Sin imports**: JavaScript vanilla puro
- ✅ **Sin URLs externas** en game.js (Phaser desde CDN no cuenta)
- ✅ **Sin fetch/XMLHttpRequest**
- ✅ **Sprites procedurales**: Dibujados con Canvas API
- ✅ **Audio generado**: Usando Web Audio API de Phaser
- ✅ **Tamaño optimizado**: Código minificable

### Phaser 3 Features utilizados:
- `Phaser.Game` y configuración
- Physics (Arcade)
- Sprites y texturas procedurales
- Tweens para animaciones
- Keyboard input
- Groups y colisiones
- LocalStorage para persistencia

## 🚀 Desarrollo

### Instalar dependencias:
```bash
pnpm install
```

### Ejecutar en desarrollo:
```bash
pnpm dev
```

### Verificar restricciones:
```bash
pnpm check-restrictions
```

## 🎨 Sprites

Todos los sprites son generados proceduralmente en el código:

- **Gorila**: Cuerpo completo con brazos, piernas, expresión facial
- **Agentes**: Oficinistas con traje, corbata, maletín, expresiones (serio/asustado)
- **Bananas**: Realistas con gradientes, brillos y manchas maduras
- **Paredes**: Tiles con efectos visuales por nivel

## 🎵 Audio

Música de fondo simple generada con osciladores (notas: C, E, G, E).

## 🏆 Sistema de Ranking

- Top 5 mejores puntuaciones
- Iniciales de 3 letras
- Colores especiales (oro, plata, bronce)
- Guardado en localStorage

## 📊 Niveles

1. **Etapa 1** (Azul): Velocidad de agentes: 120
2. **Etapa 2** (Púrpura): Velocidad de agentes: 150
3. **Etapa 3** (Naranja): Velocidad de agentes: 180

## 🎯 Objetivo del Juego

Recolecta los 6 plátanos en cada nivel mientras evitas a los agentes corporativos. Cuando recolectas un plátano, los agentes se estresan y puedes comerlos por 4 segundos. Completa las 3 etapas para ganar.

## 📝 Puntuación

- **10 puntos** por plátano
- **50 puntos** por agente comido
- **1 punto** por segundo sobrevivido

## 🔧 Próximos Pasos

- [ ] Crear `cover.png` (800x600px)
- [ ] Ejecutar `pnpm check-restrictions` para verificar tamaño
- [ ] Optimizar código si excede 50KB

## 👥 Créditos

Juego creado para **Platanus Hack 25: Arcade Challenge**

