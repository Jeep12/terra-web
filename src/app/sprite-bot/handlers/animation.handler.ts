// core/handlers/animation.handler.ts

import { Injectable } from '@angular/core';
import { AnimationKey, BOT_CONFIG, debugLog } from '../config/bot-config';
import { BotStateService } from '../services/bot-state.service';
import { ImageSpritePreloadService } from '../services/image-sprite-preload.service';

@Injectable({
  providedIn: 'root'
})
export class AnimationHandler {
  private _animationFrameId: any;
  private _lastFrameTimestamp = performance.now();
  private _frameRate:any = BOT_CONFIG.defaultFrameRate;

  constructor(
    private botState: BotStateService,
    private imagePreloader: ImageSpritePreloadService
  ) {}

  /**
   * Inicia el loop de animación
   */
  startAnimation(frameRate?: number): void {
    if (frameRate) {
      this._frameRate = frameRate;
    }

    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId);
    }

    const animate = (timestamp: number) => {
      const frameDuration = 1000 / this._frameRate;

      if (timestamp - this._lastFrameTimestamp >= frameDuration) {
        this.updateFrame();
        this._lastFrameTimestamp = timestamp;
      }

      this._animationFrameId = requestAnimationFrame(animate);
    };

    this._animationFrameId = requestAnimationFrame(animate);
  }

  /**
   * Detiene la animación
   */
  stopAnimation(): void {
    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
  }

  /**
   * Actualiza el frame actual de la animación
   */
  private updateFrame(): void {
    const currentAnimation = this.botState.currentAnimation;
    const anim = BOT_CONFIG.animations[currentAnimation];
    
    if (!anim) {
      this.setAnimation('idle');
      return;
    }

    const currentFrame = this.botState.currentFrame;
    const nextFrame = (currentFrame + 1) % anim.frames;
    
    this.botState.setCurrentFrame(nextFrame);

    // Manejar animaciones especiales
    this.handleSpecialAnimations(currentAnimation, nextFrame, anim.frames);
  }

  /**
   * Maneja lógica especial para ciertas animaciones
   */
  private handleSpecialAnimations(animation: AnimationKey, frame: number, totalFrames: number): void {
    // Parpadeo: si termina idleBlinking, vuelve a idle
    if (this.botState.blinkBackToIdle && animation === 'idleBlinking' && frame === totalFrames - 1) {
      this.setAnimation('idle');
    }

    // Animaciones que se reproducen una sola vez
    if (this.botState.playOnce && frame === totalFrames - 1) {
      this.handleOnceAnimation(animation);
    }
  }

  /**
   * Maneja animaciones que se reproducen una sola vez
   */
  private handleOnceAnimation(animation: AnimationKey): void {
    switch (animation) {
      case 'kicking':
      case 'hurt':
      case 'dying':
      case 'throwing':
      case 'slashing':
        this.setAnimation('idle');
        break;
      
      default:
        // Para otras animaciones, mantener la animación actual
        break;
    }
  }

  /**
   * Establece una nueva animación
   */
  setAnimation(animKey: AnimationKey, playOnce = false): void {
    if (!BOT_CONFIG.animations[animKey]) {
      console.warn(`⚠️ Animación no válida: ${animKey}`);
      return;
    }

    // Asegurar que la animación esté cargada
    this.imagePreloader.ensureAnimationLoaded(animKey);

    // Actualizar estado
    this.botState.setAnimation(animKey, playOnce);

    debugLog.animation(`Cambiando a animación: ${animKey}${playOnce ? ' (una vez)' : ''}`);
  }

  /**
   * Obtiene la URL del frame actual
   */
  getCurrentFrameUrl(): string {
    const animation = this.botState.currentAnimation;
    const frame = this.botState.currentFrame;
    
    return this.imagePreloader.getFrameImage(animation, frame);
  }

  /**
   * Inicia animación de parpadeo
   */
  startBlinkAnimation(): void {
    if (this.botState.characterState === 'idle' && this.botState.currentAnimation === 'idle') {
      this.setAnimation('idleBlinking', true);
    }
  }

  /**
   * Maneja animaciones de movimiento
   */
  handleMovementAnimation(isMoving: boolean, speed: number): void {
    if (!isMoving) {
      if (this.botState.currentAnimation === 'walking' || this.botState.currentAnimation === 'running') {
        this.setAnimation('idle');
      }
      return;
    }

    // Determinar tipo de animación basado en velocidad
    const animationType = speed > 5 ? 'running' : 'walking';
    
    if (this.botState.currentAnimation !== animationType) {
      this.setAnimation(animationType);
    }
  }

  /**
   * Maneja animaciones de salto
   */
  handleJumpAnimation(isJumping: boolean, jumpVelocity: number): void {
    if (!isJumping) return;

    if (jumpVelocity < 0 && this.botState.currentAnimation !== 'jumpStart') {
      this.setAnimation('jumpStart');
    } else if (jumpVelocity > 0 && this.botState.currentAnimation === 'jumpStart') {
      this.setAnimation('jumpLoop');
    }
  }

  /**
   * Maneja animaciones de caída
   */
  handleFallAnimation(): void {
    if (this.botState.currentAnimation !== 'fallingDown') {
      this.setAnimation('fallingDown');
    }
  }

  /**
   * Reproduce una animación específica una sola vez
   */
  playOnceAnimation(animKey: AnimationKey, callback?: () => void): void {
    this.setAnimation(animKey, true);

    if (callback) {
      const anim = BOT_CONFIG.animations[animKey];
      if (anim) {
        const duration = (anim.frames / this._frameRate) * 1000;
        setTimeout(callback, duration);
      }
    }
  }

  /**
   * Obtiene la duración de una animación en milisegundos
   */
  getAnimationDuration(animKey: AnimationKey): number {
    const anim = BOT_CONFIG.animations[animKey];
    if (!anim) return 0;
    
    return (anim.frames / this._frameRate) * 1000;
  }

  /**
   * Verifica si una animación está actualmente reproduciéndose
   */
  isAnimationPlaying(animKey: AnimationKey): boolean {
    return this.botState.currentAnimation === animKey;
  }

  /**
   * Obtiene información sobre la animación actual
   */
  getCurrentAnimationInfo(): { 
    name: AnimationKey; 
    frame: number; 
    totalFrames: number; 
    progress: number;
  } {
    const animation = this.botState.currentAnimation;
    const frame = this.botState.currentFrame;
    const anim = BOT_CONFIG.animations[animation];
    
    return {
      name: animation,
      frame,
      totalFrames: anim?.frames || 0,
      progress: anim ? (frame / anim.frames) * 100 : 0
    };
  }

  /**
   * Pausa la animación
   */
  pauseAnimation(): void {
    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
  }

  /**
   * Reanuda la animación
   */
  resumeAnimation(): void {
    if (!this._animationFrameId) {
      this.startAnimation();
    }
  }

  /**
   * Limpieza de recursos
   */
  cleanup(): void {
    this.stopAnimation();
  }
}