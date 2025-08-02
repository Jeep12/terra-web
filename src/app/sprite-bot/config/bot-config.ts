export type AnimationKey =
  | 'dying'
  | 'fallingDown'
  | 'hurt'
  | 'idle'
  | 'idleBlinking'
  | 'jumpLoop'
  | 'jumpStart'
  | 'kicking'
  | 'runSlashing'
  | 'runThrowing'
  | 'running'
  | 'slashing'
  | 'slashingInTheAir'
  | 'sliding'
  | 'throwing'
  | 'throwingInTheAir'
  | 'walking';

export interface AnimationData {
  folder: string;
  frames: number;
}

export type CharacterState = 'idle' | 'moving' | 'jumping' | 'falling' | 'dying' | 'custom';

export interface BotPosition {
  x: number;
  y: number;
}

export interface BotPhysics {
  velocity: number;
  jumpVelocity: number;
  fallSpeed: number;
  isJumping: boolean;
  isFalling: boolean;
  groundY: number;
}

export interface DragState {
  isDragging: boolean;
  isMouseDown: boolean;
  mouseDownTime: number;
  startMouseX: number;
  startMouseY: number;
  startElementX: number;
  startElementY: number;
  dragOffsetX: number;
  dragOffsetY: number;
  dragDistance: number;
  selecting: boolean;
  clickFired: boolean;
  selectionEffect: boolean;
}

export const BOT_CONFIG = {
  // ===== CONFIGURACIÓN DE ANIMACIÓN =====
  assetBasePath: 'https://assets.l2terra.online/sprites/Skeleton_Crusader_3/PNG/PNG%20Sequences/',
  defaultFrameRate: 12,               // FPS bajo para animación más lenta y natural

  // ===== CONFIGURACIÓN DE CARGA DE IMÁGENES =====

  

  enableProgressiveLoading: true,
  enableLazyLoading: true,
  loadingBatchSize: 3,
  loadingDelay: 50,

  // ===== CONFIGURACIÓN DE MOVIMIENTO =====
  movementSpeed: 0.15,                // Muy baja para movimientos lentos

  // ===== CONFIGURACIÓN DE FÍSICA =====
  gravity: 3,                    // Gravedad más suave
  maxFallSpeed: 3,               // Velocidad máxima más suave
  jumpPower: 7,                     // Salto más suave y bajo

  // ===== CONFIGURACIÓN DE DRAG & DROP =====
  dragHoldMs: 150,
  dragThreshold: 5,

  // ===== CONFIGURACIÓN DE AUTO-WALK =====
  minAutoWalkDistance: 80,

  // ===== CONFIGURACIÓN DE DIÁLOGOS =====
  dialogDuration: 3000,
  dialogFadeTime: 500,

  // ===== CONFIGURACIÓN DE EFECTOS VISUALES =====
  selectionGlowColor: '#FFD700',
  selectionGlowIntensity: 15,
  dragScale: 1.1,
  dragShadow: '0 10px 20px rgba(0, 0, 0, 0.4)',

  // ===== CONFIGURACIÓN DE POSICIONAMIENTO =====
  initialX: 350,
  initialY: 0,  // Posición inicial más alta para que pueda caer
  spriteWidth: 100,
  spriteHeight: 100,

  // ===== CONFIGURACIÓN DE COMPORTAMIENTO =====
  enableAutoWalk: true,
  enableAutoBlink: true,
  enableRandomDialog: true,
  enableDragAndDrop: true,
  enableClick: true,
  useSimpleDrag: true,
  enableJump: true,

  // ===== CONFIGURACIÓN DE TIMING =====
  autoWalkInterval: 6000,            // Más lento el auto walk
  autoBlinkInterval: 4000,
  randomDialogInterval: 6000,
  blinkDuration: 900,

  // ===== CONFIGURACIÓN DE DIÁLOGOS =====
  defaultDialog: "Hello, I'm the Skeleton Crusader!",
  dialogMessages: [
    // English
    'Our Terra server is temporarily on pause.',
    'Development is paused while we focus on studies.',
    'For updates, join our Discord community.',
    'We’ll be back stronger soon!',
    'Thanks for your support!',
  
    // Español
    'Nuestro servidor Terra está en pausa temporal.',
    'Pausamos el desarrollo por temas de estudio.',
    'Unite a nuestro Discord para más novedades.',
    '¡Volveremos con todo pronto!',
    '¡Gracias por el aguante!'
  ],

  // ===== CONFIGURACIÓN DE ANIMACIONES =====
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
  } as Record<AnimationKey, AnimationData>
} as const;

export const ANIMATION_PRIORITIES = {
  high: ['walking', 'running', 'jumpStart', 'jumpLoop', 'kicking'] as AnimationKey[],
  medium: ['hurt', 'slashing', 'throwing', 'idleBlinking'] as AnimationKey[],
  low: ['dying', 'fallingDown', 'runSlashing', 'runThrowing', 'slashingInTheAir',
    'sliding', 'throwingInTheAir'] as AnimationKey[]
} as const;

// ===== CONFIGURACIÓN DE DEBUG =====
export const DEBUG_CONFIG = {
  enableLogs: false,              // ← Desactiva TODOS los logs
  enablePhysicsLogs: false,       // ← Logs de caída, salto, movimiento
  enableAnimationLogs: false,     // ← Logs de cambios de animación
  enableDragLogs: false,          // ← Logs de arrastrar y soltar
  enableDialogLogs: false,        // ← Logs de diálogos del bot
  enableLoadingLogs: false        // ← Logs de carga de imágenes
} as const;

// ===== FUNCIÓN DE LOGGING =====
export const debugLog = {
  physics: (message: string, ...args: any[]) => {
    if (DEBUG_CONFIG.enableLogs && DEBUG_CONFIG.enablePhysicsLogs) {
      console.log(`📉 [PHYSICS] ${message}`, ...args);
    }
  },
  animation: (message: string, ...args: any[]) => {
    if (DEBUG_CONFIG.enableLogs && DEBUG_CONFIG.enableAnimationLogs) {
      console.log(`🎮 [ANIMATION] ${message}`, ...args);
    }
  },
  drag: (message: string, ...args: any[]) => {
    if (DEBUG_CONFIG.enableLogs && DEBUG_CONFIG.enableDragLogs) {
      console.log(`🎯 [DRAG] ${message}`, ...args);
    }
  },
  dialog: (message: string, ...args: any[]) => {
    if (DEBUG_CONFIG.enableLogs && DEBUG_CONFIG.enableDialogLogs) {
      console.log(`💬 [DIALOG] ${message}`, ...args);
    }
  },
  loading: (message: string, ...args: any[]) => {
    if (DEBUG_CONFIG.enableLogs && DEBUG_CONFIG.enableLoadingLogs) {
      console.log(`📦 [LOADING] ${message}`, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    console.error(`❌ [ERROR] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`⚠️ [WARN] ${message}`, ...args);
  }
};
