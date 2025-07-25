import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { Personaje, Knight, PersonajeAnim } from '../models/personaje.model';

/**
 * Servicio PersonajeService: maneja el ciclo de vida y lógica de múltiples personajes (sprites)
 * Permite seleccionar el personaje activo y desacopla la lógica del componente.
 * Incluye un game loop profesional para animación y movimiento automático.
 */
@Injectable({ providedIn: 'root' })
export class PersonajeService {
  personajes: Personaje[] = [new Knight(), new Knight()];
  private activeIndex = 0;

  anim$ = new BehaviorSubject<PersonajeAnim>(this.personajes[0].anim);
  frame$ = new BehaviorSubject<number>(this.personajes[0].frame);
  x$ = new BehaviorSubject<number>(this.personajes[0].x);
  direction$ = new BehaviorSubject<'left' | 'right'>(this.personajes[0].direction);

  // Game loop
  private frameIntervalMs = 80;
  private loopSub: Subscription | null = null;
  private idleTimeout: any;
  private walkTarget: number | null = null;
  private walkDuration = 1200; // ms (ya no se usa, cada personaje tiene su propio walkDuration)
  private walkStartTime = 0;
  private walkStartX = 0;

  constructor() {
    this.startLoop();
  }

  /** Cambia el personaje activo por índice */
  setActive(index: number) {
    if (index >= 0 && index < this.personajes.length) {
      this.activeIndex = index;
      const p = this.personajes[this.activeIndex];
      this.anim$.next(p.anim);
      this.frame$.next(p.frame);
      this.x$.next(p.x);
      this.direction$.next(p.direction);
    }
  }

  get personaje(): Personaje {
    return this.personajes[this.activeIndex];
  }

  /** Inicia el game loop: avanza frames y decide movimiento */
  startLoop() {
    if (this.loopSub) this.loopSub.unsubscribe();
    this.loopSub = interval(this.frameIntervalMs).subscribe(() => this.gameTick());
  }

  /**
   * Game loop profesional: avanza frames, controla animación y movimiento automático.
   * - Si está en IDLE, espera 10s y luego decide moverse.
   * - Elige target aleatorio: 80% centro, 20% extremos.
   * - Si la distancia es suficiente, inicia WALK y mueve el personaje sincronizado con la animación.
   * - Al llegar al target (borde o centro), entra en IDLE y repite el ciclo.
   * - Solo en IDLE se muestran los diálogos.
   */
  private gameTick() {
    const p = this.personaje;
    // Avanza frame de animación
    p.frame = (p.frame + 1) % 10;
    this.frame$.next(p.frame);
    // Si está en IDLE, espera 10s y luego decide moverse
    if (p.anim === 'IDLE') {
      if (!this.idleTimeout) {
        // Espera 10 segundos en idle antes de volver a caminar
        this.idleTimeout = setTimeout(() => {
          this.startWalk();
        }, 10000);
      }
    } else if (p.anim === 'WALK' && this.walkTarget !== null) {
      // Movimiento sincronizado con la animación walk
      const now = Date.now();
      const elapsed = now - this.walkStartTime;
      // Usa la velocidad del personaje activo
      const duration = p.walkDuration;
      const progress = Math.min(elapsed / duration, 1);
      let newX = this.walkStartX + (this.walkTarget - this.walkStartX) * progress;
      // Limita la posición para que nunca se salga del contenedor
      const spriteWidthPx = (p as any).spriteWidth || 180;
      const containerWidthPx = (window.innerWidth || 1000);
      const maxPercent = 100 - (spriteWidthPx / containerWidthPx * 100);
      const minPercent = 0;
      newX = Math.max(minPercent, Math.min(newX, maxPercent));
      p.x = newX;
      this.x$.next(p.x);
      if (progress >= 1) {
        // Siempre entra en IDLE al terminar el trayecto, aunque sea borde
        // Esto permite que los diálogos se muestren y el personaje "descanse" antes de volver a caminar
        p.setAnim('IDLE');
        this.anim$.next(p.anim);
        this.walkTarget = null;
        this.idleTimeout = null;
      }
    } else {
      // Si está en animación especial (ATTACK, JUMP, DIE), no hacer nada
      if (this.idleTimeout) { clearTimeout(this.idleTimeout); this.idleTimeout = null; }
    }
  }

  /**
   * Decide el próximo destino del personaje y comienza el movimiento WALK.
   * - 80% de las veces elige el centro (50).
   * - 20% de las veces elige un extremo (izquierda o derecha).
   * - El target se limita para que nunca sea fuera de rango.
   * - Si la distancia es muy corta, espera otros 10s en idle antes de intentar moverse de nuevo.
   * - La dirección y la animación se actualizan según el target.
   * - El movimiento y la animación están perfectamente sincronizados.
   */
  private startWalk() {
    const p = this.personaje;
    // Decide target: 80% centro, 20% extremos
    let target;
    const spriteWidthPx = (p as any).spriteWidth || 180;
    const containerWidthPx = (window.innerWidth || 1000);
    const maxPercent = 100 - (spriteWidthPx / containerWidthPx * 100);
    const minPercent = 0;
    if (Math.random() < 0.8) {
      target = 50;
    } else {
      target = Math.random() < 0.5 ? minPercent : maxPercent;
    }
    // Limita el target para que nunca sea fuera de rango
    target = Math.max(minPercent, Math.min(target, maxPercent));
    // Solo moverse si la distancia es significativa
    if (Math.abs(target - p.x) < 2) {
      // Si el target es muy cerca, espera otros 10s en idle antes de intentar moverse de nuevo
      this.idleTimeout = setTimeout(() => this.startWalk(), 10000);
      return;
    }
    // Actualiza dirección y animación
    p.direction = target > p.x ? 'right' : 'left';
    this.direction$.next(p.direction);
    p.setAnim('WALK');
    this.anim$.next(p.anim);
    this.walkTarget = target;
    this.walkStartTime = Date.now();
    this.walkStartX = p.x;
    // La duración del movimiento es p.walkDuration (ya está sincronizada con la animación)
  }

  // Métodos de interacción manual
  setAnim(anim: PersonajeAnim) {
    this.personaje.setAnim(anim);
    this.anim$.next(this.personaje.anim);
    this.frame$.next(this.personaje.frame);
  }
  // El método mover ya no es necesario, el movimiento es automático en el game loop
  atacar() {
    this.setAnim('ATTACK');
    // Después de atacar, vuelve a idle y ciclo automático
    setTimeout(() => {
      this.setAnim('IDLE');
      this.idleTimeout = null;
    }, 10 * this.frameIntervalMs);
  }
  saltar() {
    this.setAnim('JUMP');
    setTimeout(() => {
      this.setAnim('IDLE');
      this.idleTimeout = null;
    }, 10 * this.frameIntervalMs);
  }
  morir() {
    this.setAnim('DIE');
    setTimeout(() => {
      this.setAnim('IDLE');
      this.idleTimeout = null;
    }, 10 * this.frameIntervalMs);
  }
} 