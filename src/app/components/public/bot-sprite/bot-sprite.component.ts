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

type AnimationKey =
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

interface AnimationData {
  folder: string;
  frames: number;
}

type CharacterState = 'idle' | 'moving' | 'jumping' | 'falling' | 'dying' | 'custom';

@Component({
  selector: 'app-bot-sprite',
  imports: [CommonModule],
  templateUrl: './bot-sprite.component.html',
  styleUrl: './bot-sprite.component.css'
})
export class BotSpriteComponent {
  @ViewChild('sprite', { static: true }) spriteRef!: ElementRef<HTMLImageElement>;

  @Input() frameRate: number = 24;
  @Input() animation: AnimationKey = 'idle';

  // Configuración del personaje
  config = {
    // ===== CONFIGURACIÓN DE ANIMACIÓN =====
    assetBasePath: 'https://assets.l2terra.online/sprites/Skeleton_Crusader_1/PNG/PNG%20Sequences/',
    defaultFrameRate: 24,

    // ===== CONFIGURACIÓN DE MOVIMIENTO =====
    movementSpeed: 1.5,
    dragSmooth: 1.12,
    movementSmooth: 0.04,
    idleSmooth: 0.95,

    // ===== CONFIGURACIÓN DE FÍSICA =====
    gravity: 3,
    maxFallSpeed: 300,
    jumpPower: 20,

    // ===== CONFIGURACIÓN DE DRAG & DROP =====
    dragHoldMs: 150,
    dragThreshold: 5,

    // ===== CONFIGURACIÓN DE AUTO-WALK =====
    minAutoWalkDistance: 80,
    moveCheckInterval: 50,

    // ===== CONFIGURACIÓN DE DIÁLOGOS =====
    dialogMessageIntervalMs: 8000,
    dialogDuration: 3000,
    dialogFadeTime: 500,

    // ===== CONFIGURACIÓN DE EFECTOS VISUALES =====
    selectionGlowColor: '#FFD700',
    selectionGlowIntensity: 15,
    dragScale: 1.1,
    dragShadow: '0 10px 20px rgba(0, 0, 0, 0.4)',

    // ===== CONFIGURACIÓN DE POSICIONAMIENTO =====
    initialX: 350,
    initialY: 0,
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
    autoWalkInterval: 6000,
    autoBlinkInterval: 4000,
    randomDialogInterval: 6000,
    blinkDuration: 600,
    fallAnimationDuration: 800,
    deathAnimationDuration: 1500,
    kickAnimationDuration: 600,
    fallDistance: 60,
    fallSteps: 25,

    // ===== CONFIGURACIÓN DE DIÁLOGOS =====
    defaultDialog: "Hello, I'm the Skeleton Crusader!",
    dialogMessages: [
      'Our Terra server is under development!',
      'Click here for more information!',
      'Stay tuned for upcoming updates!',
      'Have questions? Tap me!',
      'Join our Discord for more info!',
      'Drag and drop me!',
      'Click on me!',
      'Let\'s go for a walk!'
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
    }
  };

  // Variables de animación
  currentFrame = 0;
  totalFrames = 18;
  intervalId: any;
  movementIntervalId: any;
  private _frameTime = 0;
  private _lastFrameTimestamp = performance.now();
  private _animationFrameId: any;

  // Variables de posición y movimiento
  currentX = this.config.initialX;
  currentY = this.config.initialY;
  targetX = this.config.initialX;
  targetY = this.config.initialY;
  facingLeft = false;
  spriteWidth = this.config.spriteWidth;
  spriteHeight = this.config.spriteHeight;
  screenWidth = window.innerWidth;
  screenHeight = window.innerHeight;

  // Estados del personaje
  state: CharacterState = 'idle';
  isLoaded = false;
  isFalling = false;
  fallSpeed = 0;
  isJumping = false;
  jumpVelocity = 0;
  jumpPower = this.config.jumpPower;
  playOnce = false;
  isBeingDragged = false;

  // Variables de drag and drop CORREGIDAS
  isDragging = false;
  isMouseDown = false;
  mouseDownTime = 0;
  startMouseX = 0;
  startMouseY = 0;
  startElementX = 0;
  startElementY = 0;
  dragOffsetX = 0;
  dragOffsetY = 0;
  selecting = false;
  clickFired = false;
  dragHoldTimeout: any = null;
  selectionEffect = false;
  dragDistance = 0;

  // Auto-walk y diálogos
  private _autoWalkInterval: any = null;
  private _autoWalkIntervalMs = this.config.autoWalkInterval;
  private _autoWalkShouldResume = false;
  private _moveCheckInterval: any = null;
  private _autoBlinkInterval: any = null;
  private _randomDialogInterval: any = null;
  private _blinkBackToIdle = false;

  // Diálogos
  dialog = '';
  dialogMessages = this.config.dialogMessages;
  private dialogTimeout: any = null;

  // Getter para posición del suelo
  get groundY(): number {
    return 0;
  }

  // Listeners para teclado
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.code === 'Space' && this.config.enableJump) {
      event.preventDefault();
      this.jump();
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize() {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
  }

  ngOnInit(): void {
    this.currentY = this.config.initialY;
    this.targetY = this.config.initialY;
    this.isLoaded = true;

    // Aplicar configuración CSS
    this.applyCSSConfig();

    this.startAnimation();
    this.startMovement();

    // Mostrar diálogo inicial
    this.setDialog(this.config.defaultDialog, 3000);

    // Inicializar características según configuración
    if (this.config.enableAutoBlink) {
      this.startAutoBlink();
    }
    if (this.config.enableRandomDialog) {
      this.startRandomDialog();
    }
    if (this.config.enableAutoWalk) {
      this.startAutoWalk();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['animation']) {
      this.setAnimation(this.animation);
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private cleanup() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.movementIntervalId) clearInterval(this.movementIntervalId);
    if (this._animationFrameId) cancelAnimationFrame(this._animationFrameId);
    if (this._autoWalkInterval) clearInterval(this._autoWalkInterval);
    if (this._moveCheckInterval) clearInterval(this._moveCheckInterval);
    if (this._autoBlinkInterval) clearInterval(this._autoBlinkInterval);
    if (this._randomDialogInterval) clearInterval(this._randomDialogInterval);
    if (this.dragHoldTimeout) clearTimeout(this.dragHoldTimeout);
    if (this.dialogTimeout) clearTimeout(this.dialogTimeout);
  }

  private applyCSSConfig() {
    const element = this.spriteRef.nativeElement.parentElement?.parentElement;
    if (element) {
      element.style.setProperty('--skeleton-sprite-width', `${this.config.spriteWidth}px`);
      element.style.setProperty('--skeleton-sprite-height', `${this.config.spriteHeight}px`);
      element.style.setProperty('--skeleton-drag-scale', this.config.dragScale.toString());
      element.style.setProperty('--skeleton-drag-shadow', this.config.dragShadow);
      element.style.setProperty('--skeleton-selection-glow-color', this.config.selectionGlowColor);
      element.style.setProperty('--skeleton-selection-glow-intensity', `${this.config.selectionGlowIntensity}px`);
    }

    this.ensureFixedPosition();
  }

  private ensureFixedPosition() {
    const element = this.spriteRef.nativeElement.parentElement;
    if (element) {
      element.style.position = 'fixed';
      element.style.bottom = this.currentY + 'px';
      element.style.left = this.currentX + 'px';
      element.style.transition = 'none';
      element.style.zIndex = '1000';
    }
  }

  startAnimation() {
    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId);
    }

    const animate = (timestamp: number) => {
      const frameRate = this.frameRate || this.config.defaultFrameRate;
      const frameDuration = 1000 / frameRate;

      if (timestamp - this._lastFrameTimestamp >= frameDuration) {
        this.update();
        this._lastFrameTimestamp = timestamp;
      }

      this._animationFrameId = requestAnimationFrame(animate);
    };

    this._animationFrameId = requestAnimationFrame(animate);
  }

  update() {
    if (!this.isLoaded) return;

    const anim = this.config.animations[this.animation];
    if (!anim) {
      this.setAnimation('idle');
      return;
    }

    this.currentFrame = (this.currentFrame + 1) % anim.frames;

    // Parpadeo: si termina idleBlinking, vuelve a idle
    if (this._blinkBackToIdle && this.animation === 'idleBlinking' && this.currentFrame === anim.frames - 1) {
      this.setAnimation('idle');
      this._blinkBackToIdle = false;
    }

    // Actualizar físicas y movimiento
    this.updatePhysics();
    this.updateMovement();
    this.updatePosition();
  }

  private updatePhysics() {
    // Lógica de salto mejorada
    if (this.isJumping) {
      this.jumpVelocity += this.config.gravity;
      this.currentY += this.jumpVelocity;

      // Cambiar animación según velocidad
      if (this.jumpVelocity > 0 && this.animation === 'jumpStart') {
        this.setAnimation('jumpLoop');
      }

      if (this.currentY <= this.groundY) {
        this.currentY = this.groundY;
        this.targetY = this.groundY;
        this.isJumping = false;
        this.jumpVelocity = 0;

        // Animación de aterrizaje
        this.setAnimation('idle');
        this.state = 'idle';
        this.setDialog('I landed!', 1000);
      }
    }

    // Lógica de caída
    if (this.isFalling && !this.isDragging) {
      this.fallSpeed += this.config.gravity;
      if (this.fallSpeed > this.config.maxFallSpeed) {
        this.fallSpeed = this.config.maxFallSpeed;
      }
      this.currentY -= this.fallSpeed;

      if (this.currentY <= this.groundY) {
        this.currentY = this.groundY;
        this.targetY = this.groundY;
        this.isFalling = false;
        this.fallSpeed = 0;
        this.setAnimation('hurt', true);
        this.setDialog('Ouch! That hurt!', 2000);

        setTimeout(() => {
          this.setAnimation('idle');
          this.state = 'idle';
        }, 1000);
      }
    }
  }

  private updateMovement() {
    if (this.isDragging || this.isFalling) return;

    // Movimiento suave hacia el destino
    let smooth = this.config.idleSmooth;

    if (this.state === 'moving') {
      smooth = this.config.movementSmooth;

      const deltaX = this.targetX - this.currentX;
      const deltaY = this.targetY - this.currentY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < 5) {
        this.setAnimation('idle');
        this.state = 'idle';
        if (this._moveCheckInterval) {
          clearInterval(this._moveCheckInterval);
          this._moveCheckInterval = null;
        }
      }
    }

    this.currentX += (this.targetX - this.currentX) * smooth;
    this.currentY += (this.targetY - this.currentY) * smooth;
  }

  startMovement() {
    if (this.movementIntervalId) {
      clearInterval(this.movementIntervalId);
    }

    this.movementIntervalId = setInterval(() => {
      this.updateScreenSize();
    }, 100);
  }

  private updateScreenSize() {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
  }

  updatePosition() {
    const element = this.spriteRef.nativeElement.parentElement;
    if (element && !this.isDragging) {
      // Mantener el personaje dentro de los límites de la pantalla
      this.currentX = Math.max(0, Math.min(this.screenWidth - this.spriteWidth, this.currentX));
      this.currentY = Math.max(0, this.currentY);

      element.style.position = 'fixed';
      element.style.left = this.currentX + 'px';
      element.style.bottom = this.currentY + 'px';
      element.style.transition = 'none';

      // Actualizar dirección del sprite
      this.flipSprite();
    }
  }

  flipSprite() {
    const element = this.spriteRef.nativeElement;
    if (element) {
      element.style.transform = this.facingLeft ? 'scaleX(-1)' : 'scaleX(1)';
    }
  }

  setAnimation(animName: AnimationKey, playOnce = false) {
    if (this.config.animations[animName]) {
      this.animation = animName;
      this.currentFrame = 0;
      this.playOnce = playOnce;

      if (animName === 'idleBlinking' && playOnce) {
        this._blinkBackToIdle = true;
      } else {
        this._blinkBackToIdle = false;
      }
    }
  }

  jump() {
    if (!this.isJumping && !this.isFalling && this.state !== 'dying' && this.config.enableJump) {
      this.isJumping = true;
      this.jumpVelocity = -this.config.jumpPower;
      this.setAnimation('jumpStart');
      this.state = 'jumping';
      this.setDialog('Jump!', 1000);

      // Pausar auto-walk durante el salto
      this.pauseAutoWalk();
    }
  }

  startFalling() {
    this.isFalling = true;
    this.fallSpeed = 0;
    this.state = 'falling';
    this.setAnimation('fallingDown');
    this.setDialog('I\'m falling!', 1500);

    // Pausar auto-walk durante la caída
    this.pauseAutoWalk();
  }

  moveTo(x: number, y: number = this.groundY) {
    this.targetX = Math.max(0, Math.min(this.screenWidth - this.spriteWidth, x));
    this.targetY = Math.max(this.groundY, y);

    this.facingLeft = (this.targetX < this.currentX);

    if (this.state === 'idle' && !this.isJumping && !this.isFalling) {
      this.setAnimation('running');
      this.state = 'moving';
    }
  }

  startAutoWalk() {
    if (this._autoWalkInterval || !this.config.enableAutoWalk) return;

    this._autoWalkInterval = setInterval(() => {
      if (this.state === 'idle' && !this.isDragging && !this.isJumping && !this.isFalling) {
        const minX = 50;
        const maxX = this.screenWidth - this.spriteWidth - 50;
        let randomX;

        do {
          randomX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
        } while (Math.abs(this.currentX - randomX) < this.config.minAutoWalkDistance);

        this.moveTo(randomX);
      }
    }, this.config.autoWalkInterval);
  }

  pauseAutoWalk() {
    if (this._autoWalkInterval) {
      clearInterval(this._autoWalkInterval);
      this._autoWalkInterval = null;
      this._autoWalkShouldResume = true;
    }
  }

  resumeAutoWalk() {
    if (this._autoWalkShouldResume && this.config.enableAutoWalk) {
      this.startAutoWalk();
      this._autoWalkShouldResume = false;
    }
  }

  startAutoBlink() {
    if (this._autoBlinkInterval) return;

    this._autoBlinkInterval = setInterval(() => {
      if (this.state === 'idle' && this.animation === 'idle') {
        this.setAnimation('idleBlinking', true);
      }
    }, this.config.autoBlinkInterval + Math.random() * 2000);
  }

  startRandomDialog() {
    if (this._randomDialogInterval) return;

    this._randomDialogInterval = setInterval(() => {
      if (this.dialogMessages && this.dialogMessages.length > 0 && !this.dialog) {
        const idx = Math.floor(Math.random() * this.dialogMessages.length);
        this.setDialog(this.dialogMessages[idx], this.config.dialogDuration);
      }
    }, this.config.randomDialogInterval);
  }

  setDialog(text: string, duration?: number) {
    // Limpiar timeout anterior si existe
    if (this.dialogTimeout) {
      clearTimeout(this.dialogTimeout);
    }

    // Establecer nuevo diálogo
    this.dialog = text;

    // Configurar timeout para limpiar el diálogo con fade-out
    if (duration) {
      this.dialogTimeout = setTimeout(() => {
        // Agregar clase para fade-out antes de limpiar
        const dialogElement = document.querySelector('.dialog-bubble');
        if (dialogElement) {
          (dialogElement as HTMLElement).style.opacity = '0';
          setTimeout(() => {
            this.dialog = '';
          }, 200); // Esperar a que termine la transición
        } else {
          this.dialog = '';
        }
      }, duration);
    }
  }

  getFrameSrc(): string {
    const anim = this.config.animations[this.animation];
    if (!anim) return '';

    const frameNumber = this.currentFrame.toString().padStart(3, '0');
    const src = `${this.config.assetBasePath}${anim.folder}/0_Skeleton_Crusader_${anim.folder}_${frameNumber}.png`;
    
    // Debug: log the source URL
    console.log(`🎮 [getFrameSrc] Animation: ${this.animation}, Frame: ${frameNumber}, Src: ${src}`);
    
    // Try without encoding first to see if that's the issue
    return src;
  }

  // ===== EVENT HANDLERS PARA DRAG & DROP CORREGIDOS =====

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (!this.config.enableDragAndDrop && !this.config.enableClick) return;

    event.preventDefault();
    event.stopPropagation();

    this.isMouseDown = true;
    this.mouseDownTime = Date.now();
    this.startMouseX = event.clientX;
    this.startMouseY = event.clientY;
    this.dragDistance = 0;
    this.clickFired = false;

    // Obtener posición actual del elemento
    const rect = this.spriteRef.nativeElement.parentElement?.getBoundingClientRect();
    if (rect) {
      this.startElementX = this.currentX;
      this.startElementY = this.currentY;
      this.dragOffsetX = event.clientX - rect.left;
      this.dragOffsetY = event.clientY - rect.top;
    }

    // Efecto de selección
    this.selecting = true;
    this.selectionEffect = true;

    // Timer para activar drag
    if (this.config.enableDragAndDrop && this.config.useSimpleDrag) {
      this.dragHoldTimeout = setTimeout(() => {
        if (this.isMouseDown && !this.isDragging) {
          this.startDragging();
        }
      }, this.config.dragHoldMs);
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isMouseDown) return;

    // Calcular distancia movida
    const deltaX = event.clientX - this.startMouseX;
    const deltaY = event.clientY - this.startMouseY;
    this.dragDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Activar drag si se supera el threshold
    if (this.dragDistance > this.config.dragThreshold && !this.isDragging && this.config.enableDragAndDrop) {
      this.startDragging();
    }

    // Actualizar posición durante el drag
    if (this.isDragging) {
      this.updateDragPosition(event);
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    if (this.dragHoldTimeout) {
      clearTimeout(this.dragHoldTimeout);
      this.dragHoldTimeout = null;
    }

    // Manejar click vs drag
    if (this.selecting && !this.isDragging && !this.clickFired && this.config.enableClick) {
      this.handleClick();
    }

    // Finalizar drag
    if (this.isDragging) {
      this.endDragging();
    }

    // Limpiar estado
    this.resetMouseState();
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: MouseEvent) {
    if (this.isDragging) {
      this.endDragging();
    }
    this.resetMouseState();
  }

  private startDragging() {
    if (this.isDragging) return;

    this.isDragging = true;
    this.isBeingDragged = true;
    this.clickFired = true;
    this.selecting = false;
    this.selectionEffect = false;

    this.setAnimation('slashing');
    this.setDialog('I\'m being dragged!', 2000);

    // Pausar auto-walk
    this.pauseAutoWalk();
  }

  private updateDragPosition(event: MouseEvent) {
    // Calcular nueva posición
    const newX = event.clientX - this.dragOffsetX;
    const newY = this.screenHeight - (event.clientY - this.dragOffsetY) - this.spriteHeight;

    // Mantener dentro de los límites
    this.currentX = Math.max(0, Math.min(this.screenWidth - this.spriteWidth, newX));
    this.currentY = Math.max(0, newY);

    // Aplicar posición inmediatamente
    const element = this.spriteRef.nativeElement.parentElement;
    if (element) {
      element.style.position = 'fixed';
      element.style.left = this.currentX + 'px';
      element.style.bottom = this.currentY + 'px';
      element.style.transition = 'none';
      element.style.zIndex = '1001';
    }
  }

  private endDragging() {
    this.isDragging = false;
    this.isBeingDragged = false;

    // Si está por encima del suelo, iniciar caída
    if (this.currentY > this.groundY) {
      this.startFalling();
    } else {
      this.setAnimation('idle');
      this.state = 'idle';
      this.setDialog('I\'m not being dragged anymore!', 1500);
      this.resumeAutoWalk();
    }

    // Actualizar posición objetivo
    this.targetX = this.currentX;
    this.targetY = this.currentY;
  }

  private handleClick() {
    this.setAnimation('kicking', true);
    this.setDialog('Click! Hello!', 2000);

    setTimeout(() => {
      if (this.animation === 'kicking') {
        this.setAnimation('idle');
      }
    }, this.config.kickAnimationDuration);

    // Emitir evento personalizado
    const customEvent = new CustomEvent('skeletonClick', {
      detail: { x: this.currentX, y: this.currentY }
    });
    this.spriteRef.nativeElement.parentElement?.dispatchEvent(customEvent);
  }

  private resetMouseState() {
    this.isMouseDown = false;
    this.selecting = false;
    this.selectionEffect = false;
    this.dragDistance = 0;

    if (this.dragHoldTimeout) {
      clearTimeout(this.dragHoldTimeout);
      this.dragHoldTimeout = null;
    }
  }

  // ===== MÉTODOS PÚBLICOS =====

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    console.error(`❌ Error cargando imagen: ${img.src}`);
    console.error('🎮 Verificar CORS o ruta del asset');
  }

  die() {
    this.setAnimation('dying', true);
    this.state = 'dying';
    this.setDialog('I\'m dying!', 2500);

    setTimeout(() => {
      this.setAnimation('idle');
      this.state = 'idle';
      this.setDialog('I\'m alive again!', 2000);
    }, this.config.deathAnimationDuration);
  }

  play(animName: AnimationKey) {
    this.setAnimation(animName);
    this.state = 'custom';
  }

  addDialogMessage(msg: string) {
    if (!this.dialogMessages) this.dialogMessages = [];
    this.dialogMessages.push(msg);
  }

  setDialogMessages(msgs: string[]) {
    this.dialogMessages = Array.isArray(msgs) ? msgs : [msgs];
  }
}
