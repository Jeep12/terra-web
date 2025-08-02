import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

export type SpriteAnimation = 'IDLE' | 'WALK' | 'RUN' | 'JUMP' | 'ATTACK' | 'HURT' | 'DIE';

const ANIMATION_FRAMES: Record<SpriteAnimation, number> = {
  IDLE: 10,
  WALK: 10,
  RUN: 10,
  JUMP: 10,
  ATTACK: 10,
  HURT: 10,
  DIE: 10,
};

@Injectable({
  providedIn: 'root',
})
export class SpriteServiceService {
  // === CONFIGURABLES ===
  /**
   * Porcentaje del ancho del contenedor que representa el radio de detección del mouse.
   * Unidad: porcentaje (0-100)
   * Efecto: mayor valor, más fácil que el sprite detecte el mouse.
   */
  detectionRadius: number = 20;
  /**
   * Velocidad de caminata del sprite.
   * Unidad: porcentaje de ancho por segundo.
   * Efecto: menor valor = camina más lento, mayor valor = camina más rápido.
   */
  walkSpeed: number = 5;
  /**
   * Duración mínima de la animación de walk.
   * Unidad: milisegundos.
   * Efecto: el movimiento más corto posible.
   */
  walkMinDuration: number = 2500;
  /**
   * Duración máxima de la animación de walk.
   * Unidad: milisegundos.
   * Efecto: el movimiento más largo posible.
   */
  walkMaxDuration: number = 4000;
  /**
   * Offset vertical del sprite respecto al fondo del contenedor.
   * Unidad: porcentaje (positivo lo baja).
   * Efecto: ajusta la posición vertical del sprite.
   */
  spriteYOffset: number = 20;
  /**
   * Mostrar o no los globos de diálogo.
   * true = se muestran, false = no se muestran.
   */
  showDialogs: boolean = true;
  /**
   * Ancho del sprite en píxeles (para cálculos internos).
   * Unidad: px
   * Efecto: afecta límites de movimiento y colisiones.
   */
  spriteWidth: number = 128;
  /**
   * Alto del sprite en píxeles (para cálculos internos).
   * Unidad: px
   * Efecto: solo visual, no afecta movimiento.
   */
  spriteHeight: number = 128;
  /**
   * Intervalo de frame de animación.
   * Unidad: milisegundos.
   * Efecto: menor valor = animación más rápida.
   */
  frameIntervalMs: number = 80;

  // === FIN CONFIGURABLES ===

  /**
   * Observable de la animación actual del sprite.
   * Emite el tipo de animación (IDLE, WALK, etc) en cada cambio.
   */
  private animation$ = new BehaviorSubject<SpriteAnimation>('IDLE');
  /**
   * Observable del frame actual de la animación.
   * Emite el número de frame (0-9) en cada cambio de frame.
   */
  private frame$ = new BehaviorSubject<number>(0);
  /**
   * Observable de la posición X del sprite.
   * Unidad: porcentaje (0-100) del ancho del contenedor.
   * Efecto: determina la posición horizontal del sprite.
   */
  private positionX$ = new BehaviorSubject<number>(0);
  /**
   * Indica si el sprite está actualmente en movimiento automático (walk).
   * true = está caminando, false = está quieto.
   */
  private moving = false;
  /**
   * Referencia al intervalo de animación de frames (setInterval/Subscription).
   * Se usa para controlar el loop de animación.
   */
  private frameInterval: Subscription | null = null;
  /**
   * Referencia al timeout de movimiento automático (setTimeout).
   * Se usa para pausar entre idle y walk.
   */
  private moveTimeout: any;
  /**
   * Dirección actual del sprite ('left' o 'right').
   * Efecto: determina el flip horizontal del sprite.
   */
  private direction: 'left' | 'right' = 'right';
  /**
   * Observable de la dirección actual del sprite.
   * Emite 'left' o 'right' en cada cambio de dirección.
   */
  private direction$ = new BehaviorSubject<'left' | 'right'>('right');
  /**
   * Ancho del contenedor del sprite en píxeles.
   * Se setea desde el componente para limitar el movimiento.
   */
  private containerWidth = 1;
  /**
   * true si el sprite está en una animación especial (attack, jump, hurt, die).
   * Efecto: bloquea el movimiento automático y otras animaciones hasta terminar.
   */
  private isBusy = false;
  /**
   * Última animación automática (idle/walk) antes de una animación especial.
   * Efecto: permite retomar el ciclo automático después de un ataque, salto, etc.
   */
  private lastAutoAnim: SpriteAnimation = 'IDLE';
  // Eliminar lógica de seguimiento del mouse
  // private followMouseActive = false;
  // private followMouseTarget: number | null = null;
  // private followMouseLoopActive = false;
  // private lastMousePercent: number | null = null;
  private walkWatchdogTimeout: any;
  private lastWalkX: number | null = null;

  constructor() {
    // Inicia el watchdog al crear el servicio
    this.positionX$.subscribe(x => this.checkWalkWatchdog(x));
  }

  /**
   * Watchdog: si la animación es WALK pero la posición X no cambia durante 1s, fuerza IDLE.
   */
  private checkWalkWatchdog(x: number) {
    if (this.animation$.value !== 'WALK') {
      this.lastWalkX = null;
      if (this.walkWatchdogTimeout) clearTimeout(this.walkWatchdogTimeout);
      return;
    }
    if (this.lastWalkX === null) {
      this.lastWalkX = x;
      if (this.walkWatchdogTimeout) clearTimeout(this.walkWatchdogTimeout);
      this.walkWatchdogTimeout = setTimeout(() => this.checkWalkWatchdog(x), 1000);
      return;
    }
    if (Math.abs(x - this.lastWalkX) < 0.5) { // No se movió
      this.setAnimation('IDLE', true);
      this.idleThenWalk();
      this.lastWalkX = null;
      if (this.walkWatchdogTimeout) clearTimeout(this.walkWatchdogTimeout);
    } else {
      this.lastWalkX = x;
      if (this.walkWatchdogTimeout) clearTimeout(this.walkWatchdogTimeout);
      this.walkWatchdogTimeout = setTimeout(() => this.checkWalkWatchdog(x), 1000);
    }
  }

  get animation() { return this.animation$.asObservable(); }
  get frame() { return this.frame$.asObservable(); }
  get positionX() { return this.positionX$.asObservable(); }
  get directionObservable() { return this.direction$.asObservable(); }
  get directionValue() { return this.direction; }

  setContainerWidth(width: number) {
    this.containerWidth = width;
  }

  start() {
    this.startFrameLoop();
    this.idleThenWalk();
  }

  // Bucle de frames: avanza el frame de la animación actual
  private startFrameLoop() {
    if (this.frameInterval) this.frameInterval.unsubscribe();
    this.frameInterval = interval(this.frameIntervalMs).subscribe(() => {
      const anim = this.animation$.value;
      const max = ANIMATION_FRAMES[anim];
      let next = this.frame$.value + 1;
      if (next >= max) {
        next = 0;
        // Si termina una animación especial, vuelve a la automática
        if (this.isBusy) {
          this.isBusy = false;
          // Siempre retomar ciclo idle/walk después de animación especial
          // Si estaba caminando antes, fuerza un nuevo movimiento
          this.idleThenWalk(true);
          return;
        }
      }
      this.frame$.next(next);
    });
  }

  private stopFrameLoop() {
    if (this.frameInterval) this.frameInterval.unsubscribe();
    this.frameInterval = null;
  }

  // Cambia la animación solo si no está ocupado (o si es forzado)
  setAnimation(anim: SpriteAnimation, force = false) {
    if (!force && this.isBusy) return;
    if (this.animation$.value !== anim) {
      this.animation$.next(anim);
      this.frame$.next(0);
    }
  }

  /**
   * Reinicia el ciclo automático de idle/walk y movimiento.
   * Si forceWalk es true, inicia un nuevo movimiento inmediatamente.
   */
  private idleThenWalk(forceWalk = false) {
    if (this.moveTimeout) clearTimeout(this.moveTimeout);
    this.lastAutoAnim = 'IDLE';
    this.setAnimation('IDLE', true); // Forzar idle
    this.moving = false;
    if (forceWalk) {
      // Inicia un nuevo movimiento inmediatamente
      this.moveToRandomPosition();
    } else {
      // Espera exactamente 2 segundos antes de moverse
      this.moveTimeout = setTimeout(() => this.moveToRandomPosition(), 2000);
    }
  }

  // Movimiento automático a una posición X aleatoria (solo WALK)
  private moveToRandomPosition() {
    if (this.isBusy) return;
    if (this.moveTimeout) clearTimeout(this.moveTimeout);
    // Puedes modificar la lógica de target aquí para personalizar el movimiento
    const min = 0;
    const max = 80; // para que no se salga del contenedor
    const target = Math.random() * (max - min) + min;
    const current = this.positionX$.value;
    this.direction = target > current ? 'right' : 'left';
    this.direction$.next(this.direction); // Emitir dirección

    let anim: SpriteAnimation = 'WALK';
    let duration = this.walkMinDuration + Math.random() * (this.walkMaxDuration - this.walkMinDuration);
    this.lastAutoAnim = anim;
    this.setAnimation(anim, true); // Forzar animación
    this.moving = true;
    const startTime = Date.now();
    const startX = current;
    const delta = target - startX;
    const move = () => {
      if (this.isBusy) return;
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const newX = startX + delta * progress;
      this.positionX$.next(newX);
      if (progress < 1) {
        requestAnimationFrame(move);
      } else {
        this.moving = false;
        this.idleThenWalk();
      }
    };
    move();
  }

  // Hover para ataque
  attackOnHover() {
    if (this.isBusy) return;
    this.isBusy = true;
    this.setAnimation('ATTACK', true);
  }
  endAttack() {
    if (this.animation$.value === 'ATTACK') {
      this.isBusy = false;
      this.setAnimation(this.lastAutoAnim, true);
    }
  }

  // Click para salto
  jumpOnClick() {
    if (this.isBusy) return;
    this.isBusy = true;
    this.setAnimation('JUMP', true);
  }

  // Puedes agregar aquí otros métodos para hurt, die, etc.
  // hurt() { ... }
  // die() { ... }
}
