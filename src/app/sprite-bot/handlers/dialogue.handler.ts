// core/handlers/dialogue.handler.ts

import { Injectable } from '@angular/core';
import { BotStateService } from '../services/bot-state.service';
import { BOT_CONFIG, debugLog } from '../config/bot-config';

@Injectable({
  providedIn: 'root'
})
export class DialogueHandler {
  private _dialogTimeout: any = null;
  private _randomDialogInterval: any = null;
  private _dialogMessages: string[] = [...BOT_CONFIG.dialogMessages];

  constructor(private botState: BotStateService) {}

  /**
   * Inicia el sistema de diálogos
   */
  startDialogSystem(): void {
    // Mostrar diálogo inicial
    this.setDialog(BOT_CONFIG.defaultDialog, 3000);

    // Iniciar diálogos aleatorios si está habilitado
    if (BOT_CONFIG.enableRandomDialog) {
      this.startRandomDialogs();
    }
  }

  /**
   * Detiene el sistema de diálogos
   */
  stopDialogSystem(): void {
    this.clearCurrentDialog();
    this.stopRandomDialogs();
  }

  /**
   * Establece un diálogo con duración opcional
   */
  setDialog(text: string, duration?: number): void {
    // Limpiar timeout anterior si existe
    this.clearDialogTimeout();

    // Establecer nuevo diálogo
    this.botState.setDialog(text);
    debugLog.dialog(`Diálogo: "${text}"`);

    // Configurar timeout para limpiar el diálogo
    if (duration && duration > 0) {
      this._dialogTimeout = setTimeout(() => {
        this.fadeOutDialog();
      }, duration);
    }
  }

  /**
   * Limpia el diálogo actual
   */
  clearCurrentDialog(): void {
    this.clearDialogTimeout();
    this.botState.setDialog('');
  }

  /**
   * Efecto de desvanecimiento del diálogo
   */
  private fadeOutDialog(): void {
    // Aplicar efecto de fade-out antes de limpiar
    const dialogElement = document.querySelector('.dialog-bubble');
    
    if (dialogElement) {
      (dialogElement as HTMLElement).style.opacity = '0';
      
      setTimeout(() => {
        this.botState.setDialog('');
      }, BOT_CONFIG.dialogFadeTime);
    } else {
      this.botState.setDialog('');
    }
  }

  /**
   * Inicia los diálogos aleatorios
   */
  private startRandomDialogs(): void {
    if (this._randomDialogInterval) {
      return;
    }

    this._randomDialogInterval = setInterval(() => {
      // Solo mostrar diálogo aleatorio si no hay uno activo
      if (!this.botState.dialog && this._dialogMessages.length > 0) {
        this.showRandomDialog();
      }
    }, BOT_CONFIG.randomDialogInterval);
  }

  /**
   * Detiene los diálogos aleatorios
   */
  private stopRandomDialogs(): void {
    if (this._randomDialogInterval) {
      clearInterval(this._randomDialogInterval);
      this._randomDialogInterval = null;
    }
  }

  /**
   * Muestra un diálogo aleatorio
   */
  private showRandomDialog(): void {
    if (this._dialogMessages.length === 0) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * this._dialogMessages.length);
    const randomMessage = this._dialogMessages[randomIndex];
    
    this.setDialog(randomMessage, BOT_CONFIG.dialogDuration);
  }

  /**
   * Limpia el timeout del diálogo
   */
  private clearDialogTimeout(): void {
    if (this._dialogTimeout) {
      clearTimeout(this._dialogTimeout);
      this._dialogTimeout = null;
    }
  }

  /**
   * Agrega un nuevo mensaje a la lista de diálogos
   */
  addDialogMessage(message: string): void {
          if (message && !this._dialogMessages.includes(message)) {
        this._dialogMessages.push(message);
        debugLog.dialog(`Mensaje agregado: "${message}"`);
      }
  }

  /**
   * Remueve un mensaje de la lista de diálogos
   */
  removeDialogMessage(message: string): void {
    const index = this._dialogMessages.indexOf(message);
          if (index > -1) {
        this._dialogMessages.splice(index, 1);
        debugLog.dialog(`Mensaje removido: "${message}"`);
      }
  }

  /**
   * Establece una nueva lista de mensajes de diálogo
   */
  setDialogMessages(messages: string[]): void {
    if (!Array.isArray(messages)) {
      console.warn('⚠️ Los mensajes de diálogo deben ser un array');
      return;
    }

    this._dialogMessages = [...messages];
    debugLog.dialog(`Lista de mensajes actualizada (${messages.length} mensajes)`);
  }

  /**
   * Obtiene la lista actual de mensajes
   */
  getDialogMessages(): string[] {
    return [...this._dialogMessages];
  }

  /**
   * Maneja diálogos de interacción específicos
   */
  handleInteractionDialog(interactionType: 'click' | 'drag' | 'hover' | 'jump' | 'fall' | 'hurt'): void {
    const dialogs = {
      click: ['Click! Hello!', 'You clicked me!', 'Hi there!'],
      drag: ["I'm being dragged!", 'Wheee!', 'This is fun!'],
      hover: ['Don\'t come near', 'Stay back!', 'What do you want?'],
      jump: ['Jump!', 'Here I go!', 'Flying high!'],
      fall: ["I'm falling!", 'Oh no!', 'This is not good!'],
      hurt: ['Ouch! That hurt!', 'That was painful!', 'Be more careful!']
    };

    const possibleDialogs = dialogs[interactionType];
    if (possibleDialogs && possibleDialogs.length > 0) {
      const randomDialog = possibleDialogs[Math.floor(Math.random() * possibleDialogs.length)];
      const duration = interactionType === 'hover' ? 2000 : 
                      interactionType === 'hurt' ? 2000 : 1500;
      
      this.setDialog(randomDialog, duration);
    }
  }

  /**
   * Maneja diálogos contextuales basados en el estado
   */
  handleContextualDialog(): void {
    const state = this.botState.characterState;
    const animation = this.botState.currentAnimation;

    // Diálogos basados en estado
    switch (state) {
      case 'idle':
        if (Math.random() < 0.1) { // 10% de probabilidad
          this.setDialog('Just chilling here...', 2000);
        }
        break;
        
      case 'moving':
        if (Math.random() < 0.05) { // 5% de probabilidad
          this.setDialog("Let's go for a walk!", 1500);
        }
        break;
        
      case 'jumping':
        // Ya manejado en otros handlers
        break;
        
      case 'falling':
        // Ya manejado en physics handler
        break;
    }
  }

  /**
   * Muestra un diálogo de bienvenida personalizado
   */
  showWelcomeDialog(userName?: string): void {
    const welcomeMessage = userName 
      ? `Hello ${userName}! I'm the Skeleton Crusader!`
      : BOT_CONFIG.defaultDialog;
    
    this.setDialog(welcomeMessage, 4000);
  }

  /**
   * Muestra diálogo de despedida
   */
  showGoodbyeDialog(): void {
    const goodbyeMessages = [
      'See you later!',
      'Goodbye for now!',
      'Until we meet again!',
      'Take care!'
    ];
    
    const randomGoodbye = goodbyeMessages[Math.floor(Math.random() * goodbyeMessages.length)];
    this.setDialog(randomGoodbye, 3000);
  }

  /**
   * Obtiene el estado actual del diálogo
   */
  getDialogState(): {
    currentDialog: string;
    hasActiveDialog: boolean;
    messageCount: number;
    isRandomDialogActive: boolean;
  } {
    return {
      currentDialog: this.botState.dialog,
      hasActiveDialog: !!this.botState.dialog,
      messageCount: this._dialogMessages.length,
      isRandomDialogActive: !!this._randomDialogInterval
    };
  }

  /**
   * Pausa los diálogos aleatorios
   */
  pauseRandomDialogs(): void {
    this.stopRandomDialogs();
  }

  /**
   * Reanuda los diálogos aleatorios
   */
  resumeRandomDialogs(): void {
    if (BOT_CONFIG.enableRandomDialog) {
      this.startRandomDialogs();
    }
  }

  /**
   * Limpieza de recursos
   */
  cleanup(): void {
    this.clearCurrentDialog();
    this.stopRandomDialogs();
  }
}