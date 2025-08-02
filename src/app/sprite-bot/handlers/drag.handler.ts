// core/handlers/drag.handler.ts

import { Injectable, ElementRef } from '@angular/core';
import { BotStateService } from '../services/bot-state.service';
import { AnimationHandler } from './animation.handler';
import { DialogueHandler } from './dialogue.handler';
import { BOT_CONFIG, debugLog } from '../config/bot-config';
import { PhysicsHandler } from './physics.handlers';

@Injectable({
  providedIn: 'root'
})
export class DragHandler {
  private _dragHoldTimeout: any = null;
  private _spriteElement: ElementRef<HTMLImageElement> | null = null;

  constructor(
    private botState: BotStateService,
    private animationHandler: AnimationHandler,
    private dialogueHandler: DialogueHandler,
    private physicsHandler: PhysicsHandler
  ) {}

  /**
   * Inicializa el handler con la referencia al elemento sprite
   */
  initialize(spriteElement: ElementRef<HTMLImageElement>): void {
    this._spriteElement = spriteElement;
  }

  /**
   * Maneja el evento mousedown
   */
  onMouseDown(event: MouseEvent): void {
    if (!this.canInteract()) return;

    event.preventDefault();
    event.stopPropagation();

    // Inicializar estado de drag
    const rect = this.getSpriteRect();
    if (!rect) return;

    this.botState.setDragState({
      isMouseDown: true,
      mouseDownTime: Date.now(),
      startMouseX: event.clientX,
      startMouseY: event.clientY,
      startElementX: this.botState.position.x,
      startElementY: this.botState.position.y,
      dragOffsetX: event.clientX - rect.left,
      dragOffsetY: event.clientY - rect.top,
      dragDistance: 0,
      selecting: true,
      selectionEffect: true,
      clickFired: false
    });

    // Configurar timeout para activar drag
    if (BOT_CONFIG.enableDragAndDrop && BOT_CONFIG.useSimpleDrag) {
      this._dragHoldTimeout = setTimeout(() => {
        if (this.botState.dragState.isMouseDown && !this.botState.dragState.isDragging) {
          this.startDragging();
        }
      }, BOT_CONFIG.dragHoldMs);
    }
  }

  /**
   * Maneja el evento mousemove
   */
  onMouseMove(event: MouseEvent): void {
    const dragState = this.botState.dragState;
    
    if (!dragState.isMouseDown) return;

    // Calcular distancia movida
    const deltaX = event.clientX - dragState.startMouseX;
    const deltaY = event.clientY - dragState.startMouseY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    this.botState.setDragState({ dragDistance: distance });

    // Activar drag si se supera el threshold
    if (distance > BOT_CONFIG.dragThreshold && 
        !dragState.isDragging && 
        BOT_CONFIG.enableDragAndDrop) {
      this.startDragging();
    }

    // Actualizar posición durante el drag
    if (dragState.isDragging) {
      this.updateDragPosition(event);
    }
  }

  /**
   * Maneja el evento mouseup
   */
  onMouseUp(event: MouseEvent): void {
    const dragState = this.botState.dragState;

    // Limpiar timeout
    this.clearDragTimeout();

    // Manejar click vs drag
    if (dragState.selecting && 
        !dragState.isDragging && 
        !dragState.clickFired && 
        BOT_CONFIG.enableClick) {
      this.handleClick();
    }

    // Finalizar drag
    if (dragState.isDragging) {
      this.endDragging();
    }

    // Resetear estado
    this.resetDragState();
  }

  /**
   * Maneja el evento mouseleave
   */
  onMouseLeave(event: MouseEvent): void {
    const dragState = this.botState.dragState;
    
    if (dragState.isDragging) {
      this.endDragging();
    }
    
    this.resetDragState();
  }

  /**
   * Maneja el evento mouseenter (hover)
   */
  onMouseEnter(event: MouseEvent): void {

  }

  /**
   * Inicia el proceso de arrastrar
   */
  private startDragging(): void {
    const dragState = this.botState.dragState;
    
    if (dragState.isDragging) return;

    debugLog.drag('Iniciando drag...');

    this.botState.setDragState({
      isDragging: true,
      clickFired: true,
      selecting: false,
      selectionEffect: false
    });

    // Cambiar animación y diálogo
    this.animationHandler.setAnimation('slashing');
    this.dialogueHandler.handleInteractionDialog('drag');

    // Pausar auto-walk
    this.physicsHandler.pauseAutoWalk();

    // Aplicar estilos de drag
    this.applyDragStyles(true);
  }

  /**
   * Actualiza la posición durante el drag
   */
  private updateDragPosition(event: MouseEvent): void {
    const dragState = this.botState.dragState;
    const screenHeight = this.botState.screenHeight;
    const screenWidth = this.botState.screenWidth;

    // Calcular nueva posición (coordenadas desde la parte inferior)
    const newX = event.clientX - dragState.dragOffsetX;
    const newY = screenHeight - (event.clientY - dragState.dragOffsetY) - BOT_CONFIG.spriteHeight;

    // Mantener dentro de los límites
    const boundedX = Math.max(0, Math.min(screenWidth - BOT_CONFIG.spriteWidth, newX));
    const boundedY = Math.max(0, newY);

    // Actualizar posición
    this.botState.setPosition(boundedX, boundedY);

    // Log de posición durante drag
    debugLog.drag(`Posición durante drag: X=${boundedX}, Y=${boundedY}`);

    // Aplicar posición al DOM inmediatamente
    this.updateElementPosition(boundedX, boundedY);
  }

  /**
   * Finaliza el proceso de arrastrar
   */
  private endDragging(): void {
    debugLog.drag('Finalizando drag...');

    this.botState.setDragState({ isDragging: false });

    // Quitar estilos de drag
    this.applyDragStyles(false);

    // Verificar si está por encima del suelo para iniciar caída
    const physics = this.botState.physics;
    const position = this.botState.position;

    debugLog.drag(`Posición final del drag: X=${position.x}, Y=${position.y}, GroundY=${physics.groundY}`);

    if (position.y > physics.groundY) {
      this.physicsHandler.startFalling();
    } else {
      // Volver a idle
      this.animationHandler.setAnimation('idle');
      this.botState.setCharacterState('idle');
      this.dialogueHandler.setDialog("I'm not being dragged anymore!", 1500);
      this.physicsHandler.resumeAutoWalk();
    }
  }

  /**
   * Maneja el evento de click
   */
  private handleClick(): void {
    debugLog.drag('Click detectado');

    this.animationHandler.playOnceAnimation('kicking', () => {
      if (this.botState.currentAnimation === 'kicking') {
        this.animationHandler.setAnimation('idle');
      }
    });

    this.dialogueHandler.handleInteractionDialog('click');

    // Emitir evento personalizado
    this.emitCustomClickEvent();
  }

  /**
   * Emite un evento personalizado de click
   */
  private emitCustomClickEvent(): void {
    if (!this._spriteElement?.nativeElement.parentElement) return;

    const position = this.botState.position;
    const customEvent = new CustomEvent('skeletonClick', {
      detail: { x: position.x, y: position.y }
    });

    this._spriteElement.nativeElement.parentElement.dispatchEvent(customEvent);
  }

  /**
   * Resetea el estado de drag
   */
  private resetDragState(): void {
    this.botState.resetDragState();
    this.clearDragTimeout();
  }

  /**
   * Limpia el timeout de drag
   */
  private clearDragTimeout(): void {
    if (this._dragHoldTimeout) {
      clearTimeout(this._dragHoldTimeout);
      this._dragHoldTimeout = null;
    }
  }

  /**
   * Aplica estilos de drag al elemento
   */
  private applyDragStyles(isDragging: boolean): void {
    const element = this._spriteElement?.nativeElement.parentElement;
    if (!element) return;

    if (isDragging) {
      element.style.zIndex = '1001';
      element.classList.add('dragging');
    } else {
      element.style.zIndex = '1000';
      element.classList.remove('dragging');
    }
  }

  /**
   * Actualiza la posición del elemento en el DOM
   */
  private updateElementPosition(x: number, y: number): void {
    const element = this._spriteElement?.nativeElement.parentElement;
    if (!element) return;

    element.style.position = 'fixed';
    element.style.left = x + 'px';
    element.style.bottom = y + 'px';
    element.style.transition = 'none';
  }

  /**
   * Obtiene el rectángulo del sprite
   */
  private getSpriteRect(): DOMRect | null {
    const element = this._spriteElement?.nativeElement.parentElement;
    return element?.getBoundingClientRect() || null;
  }

  /**
   * Verifica si se puede interactuar
   */
  private canInteract(): boolean {
    return BOT_CONFIG.enableDragAndDrop || BOT_CONFIG.enableClick;
  }

  /**
   * Obtiene el estado actual del drag
   */
  getDragState(): {
    isDragging: boolean;
    isSelecting: boolean;
    canDrag: boolean;
    canClick: boolean;
  } {
    const dragState = this.botState.dragState;
    
    return {
      isDragging: dragState.isDragging,
      isSelecting: dragState.selecting,
      canDrag: BOT_CONFIG.enableDragAndDrop,
      canClick: BOT_CONFIG.enableClick
    };
  }

  /**
   * Fuerza el final del drag (útil para situaciones especiales)
   */
  forceDragEnd(): void {
    if (this.botState.dragState.isDragging) {
      this.endDragging();
      this.resetDragState();
    }
  }

  /**
   * Habilita/deshabilita el drag dinámicamente
   */
  setDragEnabled(enabled: boolean): void {
    // Esto podría modificar la configuración temporalmente
    // Por ahora, solo registramos el cambio
    debugLog.drag(`Drag ${enabled ? 'habilitado' : 'deshabilitado'}`);
    
    if (!enabled && this.botState.dragState.isDragging) {
      this.forceDragEnd();
    }
  }

  /**
   * Simula un click programático
   */
  simulateClick(): void {
    if (BOT_CONFIG.enableClick && this.botState.canInteract()) {
      this.handleClick();
    }
  }

  /**
   * Limpieza de recursos
   */
  cleanup(): void {
    this.clearDragTimeout();
    this.resetDragState();
    this._spriteElement = null;
  }
}