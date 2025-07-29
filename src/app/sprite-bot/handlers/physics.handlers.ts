import { Injectable } from '@angular/core';
import { BOT_CONFIG, debugLog } from '../config/bot-config';
import { BotStateService } from '../services/bot-state.service';
import { AnimationHandler } from './animation.handler';
import { DialogueHandler } from './dialogue.handler';

@Injectable({
  providedIn: 'root'
})
export class PhysicsHandler {
  private _movementIntervalId: any;
  private _autoWalkInterval: any;
  private _moveCheckInterval: any;
  private _autoWalkShouldResume = false;

  // NUEVAS variables para movimiento gradual
  private _targetX: number | null = null;
  private _targetY: number | null = null;

  constructor(
    private botState: BotStateService,
    private animationHandler: AnimationHandler,
    private dialogueHandler: DialogueHandler
  ) { }

  /**
   * Inicia el sistema de física y movimiento
   */
  startPhysics(): void {
    this.startMovementLoop();

    if (BOT_CONFIG.enableAutoWalk) {
      this.startAutoWalk();
    }
  }

  /**
   * Detiene todos los sistemas de física
   */
  stopPhysics(): void {
    if (this._movementIntervalId) {
      clearInterval(this._movementIntervalId);
      this._movementIntervalId = null;
    }
    this.stopAutoWalk();
  }

  /**
   * Loop principal de física que se ejecuta cada frame
   */
  updatePhysics(): void {
    this.updateJumpPhysics();
    this.updateFallPhysics();
    this.updateMovement();  // Aquí se mueve el bot gradualmente hacia target
    this.updatePosition();
  }

  /**
   * Actualiza la física de salto
   */
  private updateJumpPhysics(): void {
    const physics = this.botState.physics;

    if (!physics.isJumping) return;

    // Aplicar gravedad
    const newJumpVelocity = physics.jumpVelocity + BOT_CONFIG.gravity;
    const newY = this.botState.position.y + newJumpVelocity;

    this.botState.setPhysics({ jumpVelocity: newJumpVelocity });
    this.botState.updatePosition({ y: newY });

    // Manejar animaciones de salto
    this.animationHandler.handleJumpAnimation(true, newJumpVelocity);

    // Verificar aterrizaje
    if (newY >= physics.groundY) {
      this.landFromJump();
    }
  }

  /**
   * Actualiza la física de caída
   */
  private updateFallPhysics(): void {
    const physics = this.botState.physics;
    const dragState = this.botState.dragState;

    if (!physics.isFalling || dragState.isDragging) return;

    // Incrementar la velocidad de caída progresivamente con un límite máximo
    const gravityAcceleration = BOT_CONFIG.gravity;       // Gravedad muy baja para caída lenta
    const maxFallSpeed = BOT_CONFIG.maxFallSpeed;          // Velocidad máxima muy baja

    // Incremento la velocidad de caída sumando gravedad, limitando al máximo
    let newFallSpeed = physics.fallSpeed + gravityAcceleration;
    if (newFallSpeed > maxFallSpeed) {
      newFallSpeed = maxFallSpeed;
    }

    // Obtener la posición Y actual
    let currentY = this.botState.position.y;

    // Log de posición inicial (solo en el primer frame de caída)
    if (physics.fallSpeed === 0) {
      debugLog.physics(`Iniciando caída desde Y=${currentY}`);
    }

    // Calcular nueva posición restando la velocidad progresiva (como en el original)
    let newY = currentY - newFallSpeed;

    // No permitir que pase el suelo (groundY = 0)
    if (newY < physics.groundY) {
      newY = physics.groundY;
    }

    // Actualizar posición y velocidad en el estado global
    this.botState.updatePosition({ y: newY });
    this.botState.setPhysics({ fallSpeed: newFallSpeed });

    // Log de física
    debugLog.physics(`Caída: Y=${newY.toFixed(2)}, Speed=${newFallSpeed.toFixed(3)}`);

    // Finalizar caída si tocó el suelo
    if (newY === physics.groundY) {
      this.landFromFall();
    }
  }


  /**
   * Actualiza el movimiento hacia el objetivo de forma gradual
   */
  private updateMovement(): void {
    const dragState = this.botState.dragState;
    const physics = this.botState.physics;
    const position = this.botState.position;
    const state = this.botState.characterState;

    if (dragState.isDragging || physics.isFalling || state !== 'moving' || this._targetX === null || this._targetY === null) {
      return;
    }

    const deltaX = this._targetX - position.x;
    const deltaY = this._targetY - position.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const speed = BOT_CONFIG.movementSpeed * 0.5; // Ajustar velocidad

    if (distance < speed) {
      // Llegó al destino
      this.botState.setPosition(this._targetX, this._targetY);
      this.botState.setCharacterState('idle');
      this.animationHandler.setAnimation('idle');
      this._targetX = null;
      this._targetY = null;
      return;
    }

    // Mover poco a poco
    const stepX = (deltaX / distance) * speed;
    const stepY = (deltaY / distance) * speed;

    this.botState.updatePosition({
      x: position.x + stepX,
      y: position.y + stepY
    });

    this.botState.setFacingLeft(stepX < 0);

    // Animación caminando/corriendo
    const currentAnimation = this.botState.currentAnimation;
    if (currentAnimation !== 'running' && currentAnimation !== 'walking') {
      this.animationHandler.setAnimation('running');
    }
  }

  /**
   * Actualiza la posición del sprite en el DOM manteniendo dentro de límites
   */
  private updatePosition(): void {
    const position = this.botState.position;
    const dragState = this.botState.dragState;

    if (dragState.isDragging) return;

    // Mantener dentro de los límites de pantalla
    const bounds = this.botState.isWithinBounds(position.x, position.y);

    if (bounds.x !== position.x || bounds.y !== position.y) {
      this.botState.setPosition(bounds.x, bounds.y);
    }
  }

  /**
   * Inicia el salto
   */
  jump(): void {
    if (!this.botState.canJump() || !BOT_CONFIG.enableJump) {
      return;
    }

    this.botState.setPhysics({
      isJumping: true,
      jumpVelocity: -BOT_CONFIG.jumpPower
    });

    this.botState.setCharacterState('jumping');
    this.animationHandler.setAnimation('jumpStart');
    this.dialogueHandler.setDialog('Jump!', 1000);

    // Pausar auto-walk durante el salto
    this.pauseAutoWalk();
  }

  /**
   * Maneja el aterrizaje desde un salto
   */
  private landFromJump(): void {
    const physics = this.botState.physics;

    this.botState.setPosition(this.botState.position.x, physics.groundY);
    this.botState.setPhysics({
      isJumping: false,
      jumpVelocity: 0
    });

    this.botState.setCharacterState('idle');
    this.animationHandler.setAnimation('idle');
    this.dialogueHandler.setDialog('I landed!', 1000);

    this.resumeAutoWalk();
  }

  /**
   * Inicia la caída
   */
  startFalling(): void {
    // Solo iniciar caída si no está ya cayendo
    if (this.botState.physics.isFalling) return;

    debugLog.physics('Iniciando caída');

    this.botState.setPhysics({
      isFalling: true,
      fallSpeed: 0
    });

    this.botState.setCharacterState('falling');
    this.animationHandler.handleFallAnimation();
    this.dialogueHandler.setDialog("I'm falling!", 1500);

    this.pauseAutoWalk();
  }
  /**
   * Maneja el aterrizaje desde una caída
   */
  private landFromFall(): void {
    const physics = this.botState.physics;

    debugLog.physics('Aterrizando desde caída');

    this.botState.setPosition(this.botState.position.x, physics.groundY);
    this.botState.setPhysics({
      isFalling: false,
      fallSpeed: 0
    });

    // Animación de daño por caída
    this.animationHandler.setAnimation('hurt', true);
    this.dialogueHandler.setDialog('Ouch! That hurt!', 2000);

    setTimeout(() => {
      this.botState.setCharacterState('idle');
      this.animationHandler.setAnimation('idle');
      this.resumeAutoWalk();
    }, 1000);
  }

  /**
   * Mueve el bot a una posición específica (define el target para movimiento gradual)
   */
  moveTo(x: number, y: number = this.botState.physics.groundY): void {
    if (!this.botState.canMove()) {
      return;
    }

    const bounds = this.botState.isWithinBounds(x, y);

    // Definir la dirección que mira el bot
    const shouldFaceLeft = this.botState.shouldFaceLeft(bounds.x);
    this.botState.setFacingLeft(shouldFaceLeft);

    // En vez de setear la posición directo, seteamos objetivo para movimiento gradual
    this._targetX = bounds.x;
    this._targetY = bounds.y;

    this.botState.setCharacterState('moving');
    this.animationHandler.setAnimation('running');
  }

  /**
   * Detiene el movimiento
   */
  private stopMoving(): void {
    this.botState.setCharacterState('idle');
    this.animationHandler.setAnimation('idle');

    if (this._moveCheckInterval) {
      clearInterval(this._moveCheckInterval);
      this._moveCheckInterval = null;
    }

    this._targetX = null;
    this._targetY = null;
  }

  /**
   * Inicia el loop de movimiento con actualización continua (~60fps)
   */
  private startMovementLoop(): void {
    if (this._movementIntervalId) {
      clearInterval(this._movementIntervalId);
    }

    this._movementIntervalId = setInterval(() => {
      this.botState.updateScreenSize();
      this.updatePhysics();
    }, 16);
  }

  /**
   * Inicia el auto-walk, que asigna destinos aleatorios para mover el bot gradualmente
   */
  startAutoWalk(): void {
    if (this._autoWalkInterval || !BOT_CONFIG.enableAutoWalk) {
      return;
    }

    this._autoWalkInterval = setInterval(() => {
      const state = this.botState.characterState;
      const dragState = this.botState.dragState;
      const physics = this.botState.physics;

      if (state === 'idle' && !dragState.isDragging && !physics.isJumping && !physics.isFalling) {
        this.performAutoWalk();
      }
    }, BOT_CONFIG.autoWalkInterval);
  }

  /**
   * Define un destino aleatorio lejos de la posición actual y comienza movimiento gradual hacia él
   */
  private performAutoWalk(): void {
    const screenWidth = this.botState.screenWidth;
    const minX = 50;
    const maxX = screenWidth - BOT_CONFIG.spriteWidth - 50;
    let randomX;

    do {
      randomX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
    } while (Math.abs(this.botState.position.x - randomX) < BOT_CONFIG.minAutoWalkDistance);

    this.moveTo(randomX);
  }

  /**
   * Pausa el auto-walk
   */
  pauseAutoWalk(): void {
    if (this._autoWalkInterval) {
      clearInterval(this._autoWalkInterval);
      this._autoWalkInterval = null;
      this._autoWalkShouldResume = true;
    }
  }

  /**
   * Reanuda el auto-walk si estaba pausado
   */
  resumeAutoWalk(): void {
    if (this._autoWalkShouldResume && BOT_CONFIG.enableAutoWalk) {
      this.startAutoWalk();
      this._autoWalkShouldResume = false;
    }
  }

  /**
   * Detiene el auto-walk
   */
  stopAutoWalk(): void {
    if (this._autoWalkInterval) {
      clearInterval(this._autoWalkInterval);
      this._autoWalkInterval = null;
    }
    this._autoWalkShouldResume = false;
  }

  /**
   * Limpieza de recursos
   */
  cleanup(): void {
    this.stopPhysics();
    this.stopAutoWalk();
  }
}
