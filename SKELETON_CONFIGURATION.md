# 🎮 Skeleton Character - Guía de Configuración Completa

## 📋 Descripción General

El componente `SkeletonCharacterComponent` es un sprite interactivo completamente configurable que puede caminar automáticamente, ser arrastrado, mostrar diálogos y realizar animaciones. Toda su funcionalidad está controlada por un objeto de configuración que permite personalizar cada aspecto del comportamiento.

## ⚙️ Configuración Principal

### 🎨 Configuración de Animación

```typescript
// Ruta base de los sprites (cambiar para usar diferentes assets)
assetBasePath: 'assets/Skeleton_Crusader_1/PNG/PNG Sequences/'

// FPS de las animaciones (mayor = más rápido, menor = más lento)
defaultFrameRate: 14
```

**Ejemplos de uso:**
- `assetBasePath: '/assets/other-character/'` - Cambiar a otro personaje
- `defaultFrameRate: 8` - Animaciones más lentas
- `defaultFrameRate: 24` - Animaciones más fluidas

### 🏃 Configuración de Movimiento

```typescript
// Velocidad de movimiento (mayor = más rápido)
movementSpeed: 1

// Suavizado del drag (0.01 = muy suave, 1.0 = instantáneo)
dragSmooth: 0.05

// Suavizado del movimiento automático (0.01 = muy suave, 1.0 = instantáneo)
movementSmooth: 0.02

// Suavizado cuando está quieto (0.01 = muy suave, 1.0 = instantáneo)
idleSmooth: 1
```

**Ejemplos de uso:**
- `dragSmooth: 0.1` - Drag más responsivo
- `dragSmooth: 0.01` - Drag muy suave y fluido
- `movementSpeed: 2` - Movimiento automático más rápido

### ⚡ Configuración de Física

```typescript
// Fuerza de gravedad (mayor = cae más rápido)
gravity: 1

// Velocidad máxima de caída (mayor = cae más rápido)
maxFallSpeed: 16

// Potencia del salto (mayor = salta más alto)
jumpPower: 120
```

### 🖱️ Configuración de Drag & Drop

```typescript
// Tiempo en ms para activar drag (menor = más sensible)
dragHoldMs: 200

// Distancia mínima en píxeles para activar drag (menor = más sensible)
dragThreshold: 3

// Usar drag simple y robusto (sin librerías externas)
useSimpleDrag: true
```

**Ejemplos de uso:**
- `dragHoldMs: 100` - Drag muy sensible
- `dragHoldMs: 500` - Requiere mantener presionado más tiempo
- `dragThreshold: 2` - Drag se activa con menos movimiento
- `useSimpleDrag: true` - Usar drag simple y robusto (sin librerías)
- `useSimpleDrag: false` - Deshabilitar drag

### 🚶 Configuración de Auto-Walk

```typescript
// Distancia mínima para auto-walk (mayor = menos movimiento)
minAutoWalkDistance: 60

// Intervalo para verificar si llegó al destino (menor = más preciso)
moveCheckInterval: 30
```

**Ejemplos de uso:**
- `minAutoWalkDistance: 100` - Solo se mueve distancias largas
- `minAutoWalkDistance: 20` - Se mueve incluso distancias cortas

### 💬 Configuración de Diálogos

```typescript
// Intervalo de diálogos en ms (menor = más frecuente)
dialogMessageIntervalMs: 10000

// Duración del diálogo en ms (mayor = más tiempo visible)
dialogDuration: 3000

// Tiempo de fade del diálogo en ms (mayor = transición más lenta)
dialogFadeTime: 500
```

### ✨ Configuración de Efectos Visuales

```typescript
// Color del brillo de selección (cualquier color CSS)
selectionGlowColor: '#FFD700'

// Intensidad del brillo en píxeles (mayor = más brillante)
selectionGlowIntensity: 20

// Escala durante drag (1.0 = normal, 1.5 = 50% más grande)
dragScale: 1.05

// Sombra durante drag (CSS box-shadow)
dragShadow: '0 8px 16px rgba(0, 0, 0, 0.3)'
```

**Ejemplos de uso:**
- `selectionGlowColor: '#FF0000'` - Brillo rojo
- `selectionGlowColor: '#00FF00'` - Brillo verde
- `dragScale: 1.2` - 20% más grande durante drag
- `dragShadow: '0 12px 24px rgba(255, 0, 0, 0.5)'` - Sombra roja

### 📍 Configuración de Posicionamiento

```typescript
// Posición X inicial (0 = borde izquierdo, window.innerWidth = borde derecho)
initialX: 350

// Posición Y inicial (0 = parte inferior, mayor = más arriba)
initialY: 0

// Ancho del sprite en píxeles (debe coincidir con el CSS)
spriteWidth: 100

// Alto del sprite en píxeles (debe coincidir con el CSS)
spriteHeight: 100
```

### 🎯 Configuración de Comportamiento

```typescript
// Habilita movimiento automático (true/false)
enableAutoWalk: true

// Habilita parpadeo automático (true/false)
enableAutoBlink: true

// Habilita diálogos aleatorios (true/false)
enableRandomDialog: true

// Habilita arrastrar y soltar (true/false)
enableDragAndDrop: true

// Habilita clicks (true/false)
enableClick: true
```

**Ejemplos de uso:**
- `enableAutoWalk: false` - Desactiva movimiento automático
- `enableDragAndDrop: false` - Desactiva drag & drop
- `enableRandomDialog: false` - Desactiva diálogos aleatorios

### ⏱️ Configuración de Timing

```typescript
// Intervalo de auto-walk en ms (menor = más frecuente)
autoWalkInterval: 3000

// Intervalo de parpadeo en ms (menor = más frecuente)
autoBlinkInterval: 3000

// Intervalo de diálogos en ms (menor = más frecuente)
randomDialogInterval: 5000

// Duración del parpadeo en ms (mayor = más largo)
blinkDuration: 1000

// Duración de la animación de caída en ms
fallAnimationDuration: 1000
// Distancia en píxeles que "cae" el personaje
fallDistance: 80
// Número de pasos para la animación de caída
fallSteps: 20

// Duración de la animación de muerte en ms
deathAnimationDuration: 2000

// Duración de la animación de patada en ms
kickAnimationDuration: 1000
```

### 💭 Configuración de Diálogos

```typescript
// Diálogo inicial
defaultDialog: "¡Hola, soy el Skeleton Crusader!"

// Lista de mensajes aleatorios (agregar/quitar mensajes)
dialogMessages: [
  'Our Terra server is under development!',
  'Click here for more information!',
  'Stay tuned for upcoming updates!',
  'Have questions? Tap me!',
  'Join our Discord for more info!'
]
```

### 🎬 Configuración de Animaciones

```typescript
// Configuración de cada animación (cambiar frames para diferentes sprites)
animations: {
  dying: { folder: 'Dying', frames: 15 },
  fallingDown: { folder: 'Falling Down', frames: 6 },
  hurt: { folder: 'Hurt', frames: 12 },
  idle: { folder: 'Idle', frames: 18 },
  idleBlinking: { folder: 'Idle Blinking', frames: 18 },
  jumpLoop: { folder: 'Jump Loop', frames: 6 },
  jumpStart: { folder: 'Jump Start', frames: 6 },
  kicking: { folder: 'Kicking', frames: 12 },
  runSlashing: { folder: 'Run Slashing', frames: 12 },
  runThrowing: { folder: 'Run Throwing', frames: 12 },
  running: { folder: 'Running', frames: 12 },
  slashing: { folder: 'Slashing', frames: 12 },
  slashingInTheAir: { folder: 'Slashing in The Air', frames: 12 },
  sliding: { folder: 'Sliding', frames: 6 },
  throwing: { folder: 'Throwing', frames: 12 },
  throwingInTheAir: { folder: 'Throwing in The Air', frames: 12 },
  walking: { folder: 'Walking', frames: 24 }
}
```

## 🎨 Variables CSS Configurables

El componente también usa variables CSS que se pueden personalizar:

```css
:host {
  --skeleton-sprite-width: 100px;
  --skeleton-sprite-height: 100px;
  --skeleton-drag-scale: 1.05;
  --skeleton-drag-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  --skeleton-selection-glow-color: #FFD700;
  --skeleton-selection-glow-intensity: 20px;
  --skeleton-dialog-bg-color: rgba(0, 0, 0, 0.8);
  --skeleton-dialog-text-color: white;
  --skeleton-shadow-color: rgba(0, 0, 0, 0.3);
}
```

## 🚀 Ejemplos de Configuración

### Skeleton Rápido y Agresivo
```typescript
{
  defaultFrameRate: 24,
  movementSpeed: 2,
  dragSmooth: 0.1,
  autoWalkInterval: 2000,
  selectionGlowColor: '#FF0000',
  dragScale: 1.2,
  dialogMessages: [
    '¡Muere!',
    '¡Prepárate para la batalla!',
    '¡Soy invencible!'
  ]
}
```

### Skeleton Lento y Pacífico
```typescript
{
  defaultFrameRate: 8,
  movementSpeed: 0.5,
  dragSmooth: 0.01,
  autoWalkInterval: 8000,
  selectionGlowColor: '#00FF00',
  dragScale: 1.02,
  dialogMessages: [
    '¡Hola!',
    '¿Cómo estás?',
    '¡Que tengas un buen día!'
  ]
}
```

### Skeleton Deshabilitado
```typescript
{
  enableAutoWalk: false,
  enableAutoBlink: false,
  enableRandomDialog: false,
  enableDragAndDrop: false,
  enableClick: false
}
```

## 📝 Notas Importantes

1. **Cambios en tiempo real**: La mayoría de configuraciones se aplican inmediatamente
2. **Compatibilidad**: Asegúrate de que `spriteWidth` y `spriteHeight` coincidan con el CSS
3. **Performance**: Valores muy bajos en intervalos pueden afectar el rendimiento
4. **Assets**: Cambia `assetBasePath` y `animations` para usar diferentes sprites
5. **Responsive**: El skeleton se adapta automáticamente al tamaño de la ventana

## 🔧 Métodos Públicos Disponibles

- `setDialog(text: string)` - Cambiar diálogo actual
- `addDialogMessage(msg: string)` - Agregar mensaje a la lista
- `setDialogMessages(msgs: string[])` - Cambiar toda la lista de mensajes
- `autoWalk(enabled: boolean, intervalMs?: number)` - Controlar auto-walk
- `die()` - Forzar animación de muerte
- `play(animName: AnimationKey)` - Reproducir animación específica
- `jump()` - Hacer animación de patada
- `moveTo(x: number, y: number)` - Mover a posición específica

¡Con esta configuración completa, puedes crear cualquier tipo de skeleton character que necesites! 🎮💀 