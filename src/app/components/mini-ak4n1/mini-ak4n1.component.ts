import {
  Component,
  ElementRef,
  ViewChild,
  Input,
  OnInit,
  OnDestroy,
  SimpleChanges,
  OnChanges,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AnimationKey, BOT_CONFIG } from '../../sprite-bot/config/bot-config';
import { BotStateService } from '../../sprite-bot/services/bot-state.service';
import { ImageSpritePreloadService } from '../../sprite-bot/services/image-sprite-preload.service';
import { AnimationHandler } from '../../sprite-bot/handlers/animation.handler';
import { DialogueHandler } from '../../sprite-bot/handlers/dialogue.handler';
import { DragHandler } from '../../sprite-bot/handlers/drag.handler';
import { PhysicsHandler } from '../../sprite-bot/handlers/physics.handlers';

// Importar servicios y handlers

// Importar tipos y configuración

@Component({
  selector: 'app-mini-ak4n1',
  imports: [CommonModule],
  templateUrl: './mini-ak4n1.component.html',
  styleUrl: './mini-ak4n1.component.css'
})
export class MiniAk4n1Component {

  @ViewChild('sprite', { static: true }) spriteRef!: ElementRef<HTMLImageElement>;

  @Input() frameRate: number = BOT_CONFIG.defaultFrameRate;
  @Input() animation: AnimationKey = 'idle';

  // Subject para manejar la destrucción del componente
  private readonly destroy$ = new Subject<void>();

  // Estados reactivos para el template
  public currentX: any = BOT_CONFIG.initialX;
  public currentY: any = BOT_CONFIG.initialY;
  public facingLeft = false;
  public dialog = '';
  public isDragging = false;
  public selecting = false;
  public config = BOT_CONFIG;

  constructor(
    private botState: BotStateService,
    private imagePreloader: ImageSpritePreloadService,
    private animationHandler: AnimationHandler,
    private physicsHandler: PhysicsHandler,
    private dialogueHandler: DialogueHandler,
    private dragHandler: DragHandler
  ) { }

  ngOnInit(): void {
    // console.log('🎮 Inicializando BotSpriteComponent...');

    // Configurar CSS del componente
    this.applyCSSConfig();

    // Inicializar handlers
    this.initializeHandlers();

    // Suscribirse a cambios de estado
    this.subscribeToStateChanges();

    // Comenzar con el modo básico
    this.startBasicMode();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['animation'] && !changes['animation'].firstChange) {
      this.animationHandler.setAnimation(this.animation);
    }

    if (changes['frameRate'] && !changes['frameRate'].firstChange) {
      this.animationHandler.startAnimation(this.frameRate);
    }
  }

  ngOnDestroy(): void {
    // console.log('🎮 Destruyendo BotSpriteComponent...');

    // Emitir señal de destrucción
    this.destroy$.next();
    this.destroy$.complete();

    // Limpiar handlers
    this.cleanupHandlers();
  }

  /**
   * Inicializa todos los handlers
   */
  private initializeHandlers(): void {
    // Inicializar drag handler con referencia al elemento
    this.dragHandler.initialize(this.spriteRef);

    // Iniciar sistemas
    this.animationHandler.startAnimation(this.frameRate);
    this.physicsHandler.startPhysics();
    this.dialogueHandler.startDialogSystem();
  }

  /**
   * Se suscribe a los cambios de estado reactivos
   */
  private subscribeToStateChanges(): void {
    // Posición
    this.botState.position$
      .pipe(takeUntil(this.destroy$))
      .subscribe(position => {
        this.currentX = position.x;
        this.currentY = position.y;
        this.updateDOMPosition();
      });

    // Dirección
    this.botState.facingLeft$
      .pipe(takeUntil(this.destroy$))
      .subscribe(facingLeft => {
        this.facingLeft = facingLeft;
        this.updateSpriteDirection();
      });

    // Diálogo
    this.botState.dialog$
      .pipe(takeUntil(this.destroy$))
      .subscribe(dialog => {
        this.dialog = dialog;
      });

    // Estado de drag
    this.botState.dragState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(dragState => {
        this.isDragging = dragState.isDragging;
        this.selecting = dragState.selecting;
      });
  }

  /**
   * Inicia el modo básico con precarga progresiva
   */
  private async startBasicMode(): Promise<void> {
    // console.log('🎮 Iniciando modo básico...');

    try {
      // Precargar animación idle primero
      await this.imagePreloader.preloadAnimation('idle');
      // console.log('🎮 Animación idle cargada, bot activo!');

      // Iniciar precarga en segundo plano
      if (BOT_CONFIG.enableProgressiveLoading) {
        setTimeout(() => {
          this.imagePreloader.preloadAllImagesAsync();
        }, 100);
      }

    } catch (error) {
      console.error('❌ Error en modo básico:', error);
    }
  }

  /**
   * Actualiza la posición del elemento en el DOM
   */
  private updateDOMPosition(): void {
    const element = this.spriteRef.nativeElement.parentElement;
    if (element && !this.isDragging) {
      element.style.position = 'fixed';
      element.style.left = this.currentX + 'px';
      element.style.bottom = this.currentY + 'px';
      element.style.transition = 'none';
    }
  }

  /**
   * Actualiza la dirección del sprite
   */
  private updateSpriteDirection(): void {
    const element = this.spriteRef.nativeElement;
    if (element) {
      element.style.transform = this.facingLeft ? 'scaleX(-1)' : 'scaleX(1)';
    }
  }

  /**
   * Aplica la configuración CSS
   */
  private applyCSSConfig(): void {
    const element = this.spriteRef.nativeElement.parentElement?.parentElement;
    if (element) {
      element.style.setProperty('--skeleton-sprite-width', `${BOT_CONFIG.spriteWidth}px`);
      element.style.setProperty('--skeleton-sprite-height', `${BOT_CONFIG.spriteHeight}px`);
      element.style.setProperty('--skeleton-drag-scale', BOT_CONFIG.dragScale.toString());
      element.style.setProperty('--skeleton-drag-shadow', BOT_CONFIG.dragShadow);
      element.style.setProperty('--skeleton-selection-glow-color', BOT_CONFIG.selectionGlowColor);
      element.style.setProperty('--skeleton-selection-glow-intensity', `${BOT_CONFIG.selectionGlowIntensity}px`);
    }

    this.ensureFixedPosition();
  }

  /**
   * Asegura la posición fija del elemento
   */
  private ensureFixedPosition(): void {
    const element = this.spriteRef.nativeElement.parentElement;
    if (element) {
      element.style.position = 'fixed';
      element.style.bottom = this.currentY + 'px';
      element.style.left = this.currentX + 'px';
      element.style.transition = 'none';
      element.style.zIndex = '1000';
    }
  }

  /**
   * Obtiene la URL del frame actual
   */
  getFrameSrc(): string {
    return this.animationHandler.getCurrentFrameUrl();
  }

  /**
   * Maneja errores de carga de imágenes
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;

    // Solo mostrar errores en desarrollo
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.error(`❌ Error cargando imagen: ${img.src}`);
      console.error('🎮 Verificar CORS o ruta del asset');
    }
  }

  // ===== EVENT HANDLERS =====

  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: MouseEvent): void {
    this.dragHandler.onMouseEnter(event);
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    this.dragHandler.onMouseDown(event);
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.dragHandler.onMouseMove(event);
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    this.dragHandler.onMouseUp(event);
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: MouseEvent): void {
    this.dragHandler.onMouseLeave(event);
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.code === 'Space' && BOT_CONFIG.enableJump) {
      event.preventDefault();
      this.physicsHandler.jump();
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(): void {
    this.botState.updateScreenSize();
  }

  // ===== MÉTODOS PÚBLICOS PARA API EXTERNA =====

  /**
   * Reproduce una animación específica
   */
  public play(animName: AnimationKey): void {
    this.animationHandler.setAnimation(animName);
    this.botState.setCharacterState('custom');
  }

  /**
   * Hace que el bot muera
   */
  public die(): void {
    this.animationHandler.playOnceAnimation('dying', () => {
      this.animationHandler.setAnimation('idle');
      this.botState.setCharacterState('idle');
      this.dialogueHandler.setDialog("I'm alive again!", 2000);
    });

    this.botState.setCharacterState('dying');
    this.dialogueHandler.setDialog("I'm dying!", 2500);
  }

  /**
   * Mueve el bot a una posición específica
   */
  public moveTo(x: number, y?: number): void {
    this.physicsHandler.moveTo(x, y);
  }

  /**
   * Hace que el bot salte
   */
  public jump(): void {
    this.physicsHandler.jump();
  }

  /**
   * Agrega un mensaje de diálogo
   */
  public addDialogMessage(message: string): void {
    this.dialogueHandler.addDialogMessage(message);
  }

  /**
   * Establece los mensajes de diálogo
   */
  public setDialogMessages(messages: string[]): void {
    this.dialogueHandler.setDialogMessages(messages);
  }

  /**
   * Establece un diálogo específico
   */
  public setDialog(text: string, duration?: number): void {
    this.dialogueHandler.setDialog(text, duration);
  }

  /**
   * Fuerza la precarga de una animación
   */
  public async forceLoadAnimation(animKey: AnimationKey): Promise<void> {
    return this.imagePreloader.preloadAnimation(animKey);
  }

  /**
   * Obtiene el estado de carga
   */
  public getLoadingStatus(): any {
    return this.imagePreloader.getLoadingStatus();
  }

  /**
   * Obtiene estadísticas de cache
   */
  public getCacheStats(): any {
    return this.imagePreloader.getCacheStats();
  }

  /**
   * Limpia la cache de imágenes
   */
  public clearImageCache(): void {
    this.imagePreloader.clearImageCache();
  }

  /**
   * Obtiene el estado actual del bot
   */
  public getBotState(): any {
    return {
      animation: this.botState.currentAnimation,
      state: this.botState.characterState,
      position: this.botState.position,
      physics: this.botState.physics,
      dragState: this.dragHandler.getDragState(),
      dialogState: this.dialogueHandler.getDialogState()
    };
  }

  /**
   * Limpia todos los handlers
   */
  private cleanupHandlers(): void {
    this.animationHandler.cleanup();
    this.physicsHandler.cleanup();
    this.dialogueHandler.cleanup();
    this.dragHandler.cleanup();
  }
}