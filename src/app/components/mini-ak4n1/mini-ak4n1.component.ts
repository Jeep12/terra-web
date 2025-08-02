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

  @ViewChild('sprite', { static: false }) spriteRef!: ElementRef<HTMLImageElement>;

  @Input() frameRate: number = BOT_CONFIG.defaultFrameRate;
  @Input() animation: AnimationKey = 'idle';
  showButton = false; 
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

  // Nuevos estados para carga manual
  public isLoaded = false;
  public isLoading = false;
  public loadProgress = 0;
  public showComponent = false;

  constructor(
    private botState: BotStateService,
    private imagePreloader: ImageSpritePreloadService,
    private animationHandler: AnimationHandler,
    private physicsHandler: PhysicsHandler,
    private dialogueHandler: DialogueHandler,
    private dragHandler: DragHandler
  ) { }

  ngOnInit(): void {
    this.showComponent = false; // Skeleton is hidden initially
    
    // Verificar cache y activar automáticamente si todo está listo
    this.checkAndAutoActivate();
  }

  /**
   * Verifica si las imágenes están cacheadas y activa automáticamente el sprite
   */
  private async checkAndAutoActivate(): Promise<void> {
    const criticalImages = [
      'https://assets.l2terra.online/sprites/Skeleton_Crusader_3/PNG/PNG%20Sequences/Idle/0_Skeleton_Crusader_Idle_000.png',
      'https://assets.l2terra.online/sprites/Skeleton_Crusader_3/PNG/PNG%20Sequences/Walking/0_Skeleton_Crusader_Walking_000.png',
      'https://assets.l2terra.online/sprites/Skeleton_Crusader_3/PNG/PNG%20Sequences/Running/0_Skeleton_Crusader_Running_000.png'
    ];
    
    let cachedCount = 0;
    const totalImages = criticalImages.length;
    
    for (const imageUrl of criticalImages) {
      const isCached = await this.isImageCached(imageUrl);
      if (isCached) {
        cachedCount++;
      }
    }
    
    // SOLO activar automáticamente si TODAS las imágenes están cacheadas
    if (cachedCount === totalImages) {
      // Activar el sprite automáticamente
      await this.activateSkeleton();
      
      // Emitir evento para ocultar el botón
      this.emitAutoActivated();
    }
  }

  /**
   * Emite evento para indicar que el sprite se activó automáticamente
   */
  private emitAutoActivated(): void {
    // Crear un evento personalizado para comunicar con el botón
    const event = new CustomEvent('skeletonAutoActivated', {
      detail: { autoActivated: true }
    });
    window.dispatchEvent(event);
  }

  /**
   * Verifica si las imágenes críticas están en cache (only for logging)
   */
  private async checkImagesCache(): Promise<void> {
    const criticalImages = [
      'https://assets.l2terra.online/sprites/Skeleton_Crusader_3/PNG/PNG%20Sequences/Idle/0_Skeleton_Crusader_Idle_000.png',
      'https://assets.l2terra.online/sprites/Skeleton_Crusader_3/PNG/PNG%20Sequences/Walking/0_Skeleton_Crusader_Walking_000.png',
      'https://assets.l2terra.online/sprites/Skeleton_Crusader_3/PNG/PNG%20Sequences/Running/0_Skeleton_Crusader_Running_000.png'
    ];
    let cachedCount = 0;
    const totalImages = criticalImages.length;
    
    for (const imageUrl of criticalImages) {
      const isCached = await this.isImageCached(imageUrl);
      if (isCached) {
        cachedCount++;
      }
    }
  }

  /**
   * Verifica si una imagen específica está en cache
   */
  private async isImageCached(imageUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        // Si se carga rápidamente, probablemente está en cache
        resolve(true);
      };
      
      img.onerror = () => {
        resolve(false);
      };
      
      // NO agregar timestamp para permitir que el cache funcione
      img.src = imageUrl;
      
      // Timeout después de 1 segundo (más rápido para detectar cache)
      setTimeout(() => {
        resolve(false);
      }, 1000);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['animation'] && !changes['animation'].firstChange && this.isLoaded) {
      this.animationHandler.setAnimation(this.animation);
    }

    if (changes['frameRate'] && !changes['frameRate'].firstChange && this.isLoaded) {
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
   * Método público para activar la carga del skeleton
   */
  async activateSkeleton(): Promise<void> {
    if (this.isLoaded || this.isLoading) return;

    console.log('🎮 Activando skeleton - Iniciando carga...');
    this.isLoading = true;
    this.loadProgress = 0;

    try {
      console.log('🎮 Activando skeleton...');
      console.log('🔄 Cargando sprite!');
      
      // Esperar a que el DOM esté listo
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Cargar recursos progresivamente PRIMERO
      await this.loadResourcesProgressively();

      // MOSTRAR el componente ANTES de configurar CSS
      this.showComponent = true;
      
      // Esperar un frame para que el DOM se actualice
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      // Configurar CSS del componente DESPUÉS de mostrar
      await this.applyCSSConfig();

      // Inicializar handlers DESPUÉS de cargar recursos
      await this.initializeHandlers();

      // Comenzar con el modo básico
      this.startBasicMode();

      // Marcar como cargado ANTES de suscribirse a cambios
      this.isLoaded = true;
      this.isLoading = false;
      this.loadProgress = 100;

      // Suscribirse a cambios de estado DESPUÉS de marcar como cargado
      this.subscribeToStateChanges();

      // Ocultar el botón después de cargar exitosamente
      // this.hideSkeletonButton(); // Eliminado

    } catch (error) {
      this.isLoading = false;
      this.showComponent = false;
    }
  }

  /**
   * Carga recursos progresivamente con barra de progreso
   */
  private async loadResourcesProgressively(): Promise<void> {
    const totalSteps = 6;
    let currentStep = 0;

    // Paso 1: Precargar animación idle (crítica)
    currentStep++;
    this.loadProgress = Math.round((currentStep / totalSteps) * 100);
    await this.imagePreloader.preloadAnimation('idle');

    // Paso 2: Precargar animaciones básicas de movimiento
    currentStep++;
    this.loadProgress = Math.round((currentStep / totalSteps) * 100);
    await Promise.all([
      this.imagePreloader.preloadAnimation('walking'),
      this.imagePreloader.preloadAnimation('running')
    ]);

    // Paso 3: Precargar animaciones de salto
    currentStep++;
    this.loadProgress = Math.round((currentStep / totalSteps) * 100);
    await Promise.all([
      this.imagePreloader.preloadAnimation('jumpStart'),
      this.imagePreloader.preloadAnimation('jumpLoop')
    ]);

    // Paso 4: Precargar animaciones de combate básicas
    currentStep++;
    this.loadProgress = Math.round((currentStep / totalSteps) * 100);
    await Promise.all([
      this.imagePreloader.preloadAnimation('slashing'),
      this.imagePreloader.preloadAnimation('throwing')
    ]);

    // Paso 5: Precargar animaciones especiales
    currentStep++;
    this.loadProgress = Math.round((currentStep / totalSteps) * 100);
    await Promise.all([
      this.imagePreloader.preloadAnimation('kicking'),
      this.imagePreloader.preloadAnimation('hurt'),
      this.imagePreloader.preloadAnimation('idleBlinking')
    ]);

    // Paso 6: Precargar resto de animaciones en segundo plano
    currentStep++;
    this.loadProgress = Math.round((currentStep / totalSteps) * 100);
    
    // Cargar el resto en segundo plano sin bloquear
    setTimeout(() => {
      this.imagePreloader.preloadAllImagesAsync();
    }, 100);
  }

  /**
   * Inicializa todos los handlers
   */
  private async initializeHandlers(): Promise<void> {
    // Esperar a que el spriteRef esté disponible
    await this.waitForSpriteRef();
    
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
    // Solo suscribirse si el componente está cargado
    if (!this.isLoaded) {
      return;
    }

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
      // Error en modo básico
    }
  }

  /**
   * Actualiza la posición del elemento en el DOM
   */
  private updateDOMPosition(): void {
    // Verificar que el spriteRef existe y tiene nativeElement
    if (!this.spriteRef || !this.spriteRef.nativeElement) {
      return; // Salir silenciosamente si no está listo
    }

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
    // Verificar que el spriteRef existe y tiene nativeElement
    if (!this.spriteRef || !this.spriteRef.nativeElement) {
      return; // Salir silenciosamente si no está listo
    }

    const element = this.spriteRef.nativeElement;
    if (element) {
      element.style.transform = this.facingLeft ? 'scaleX(-1)' : 'scaleX(1)';
    }
  }

  /**
   * Aplica la configuración CSS
   */
  private async applyCSSConfig(): Promise<void> {
    // Esperar a que el spriteRef esté disponible
    await this.waitForSpriteRef();
    
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
   * Espera a que el spriteRef esté disponible
   */
  private async waitForSpriteRef(): Promise<void> {
    const maxAttempts = 50; // Máximo 5 segundos (50 * 100ms)
    let attempts = 0;
    
    while (!this.spriteRef || !this.spriteRef.nativeElement) {
      attempts++;
      if (attempts >= maxAttempts) {
        console.error('❌ Timeout esperando spriteRef');
        throw new Error('spriteRef no disponible después de múltiples intentos');
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Asegura la posición fija del elemento
   */
  private ensureFixedPosition(): void {
    // Verificar que el spriteRef existe y tiene nativeElement
    if (!this.spriteRef || !this.spriteRef.nativeElement) {
      console.warn('⚠️ spriteRef no está disponible para posicionamiento');
      return;
    }

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
    // Verificar que el animationHandler esté disponible
    if (!this.animationHandler) {
      return ''; // Retornar string vacío si no está inicializado
    }
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
    if (this.isLoaded) {
      this.dragHandler.onMouseEnter(event);
    }
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if (this.isLoaded) {
      this.dragHandler.onMouseDown(event);
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isLoaded) {
      this.dragHandler.onMouseMove(event);
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    if (this.isLoaded) {
      this.dragHandler.onMouseUp(event);
    }
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: MouseEvent): void {
    if (this.isLoaded) {
      this.dragHandler.onMouseLeave(event);
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (this.isLoaded && event.code === 'Space' && BOT_CONFIG.enableJump) {
      event.preventDefault();
      this.physicsHandler.jump();
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(): void {
    if (this.isLoaded) {
      this.botState.updateScreenSize();
    }
  }

  // ===== MÉTODOS PÚBLICOS PARA API EXTERNA =====

  /**
   * Reproduce una animación específica
   */
  public play(animName: AnimationKey): void {
    if (this.isLoaded) {
      this.animationHandler.setAnimation(animName);
      this.botState.setCharacterState('custom');
    }
  }

  /**
   * Hace que el bot muera
   */
  public die(): void {
    if (this.isLoaded) {
      this.animationHandler.playOnceAnimation('dying', () => {
        this.animationHandler.setAnimation('idle');
        this.botState.setCharacterState('idle');
        this.dialogueHandler.setDialog("I'm alive again!", 2000);
      });

      this.botState.setCharacterState('dying');
      this.dialogueHandler.setDialog("I'm dying!", 2500);
    }
  }

  /**
   * Mueve el bot a una posición específica
   */
  public moveTo(x: number, y?: number): void {
    if (this.isLoaded) {
      this.physicsHandler.moveTo(x, y);
    }
  }

  /**
   * Hace que el bot salte
   */
  public jump(): void {
    if (this.isLoaded) {
      this.physicsHandler.jump();
    }
  }

  /**
   * Agrega un mensaje de diálogo
   */
  public addDialogMessage(message: string): void {
    if (this.isLoaded) {
      this.dialogueHandler.addDialogMessage(message);
    }
  }

  /**
   * Establece los mensajes de diálogo
   */
  public setDialogMessages(messages: string[]): void {
    if (this.isLoaded) {
      this.dialogueHandler.setDialogMessages(messages);
    }
  }

  /**
   * Establece un diálogo específico
   */
  public setDialog(text: string, duration?: number): void {
    if (this.isLoaded) {
      this.dialogueHandler.setDialog(text, duration);
    }
  }

  /**
   * Fuerza la precarga de una animación
   */
  public async forceLoadAnimation(animKey: AnimationKey): Promise<void> {
    if (this.isLoaded) {
      return this.imagePreloader.preloadAnimation(animKey);
    }
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
    if (!this.isLoaded) return { loaded: false };
    
    return {
      loaded: true,
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