import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { SpriteAnimation, SpriteServiceService } from '../../../services/sprite-service.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

/**
 * MiniAk4n1Component
 * ------------------
 * Sprite animado tipo "knight" que camina, ataca, salta y muere usando SpriteServiceService.
 * - Camina automáticamente y nunca se sale del contenedor.
 * - Hover: ataca (attack), vuelve a idle/walk al salir.
 * - Click: salta (jump) y luego muere (die), solo una vez.
 * - Usa los assets de Knight_01 y la lógica centralizada del servicio.
 * - Totalmente desacoplado: solo maneja eventos y renderiza el estado del servicio.
 */
@Component({
  selector: 'app-mini-ak4n1',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mini-ak4n1.component.html',
  styleUrls: ['./mini-ak4n1.component.css']
})
export class MiniAk4n1Component implements OnInit, OnDestroy, AfterViewInit {
  animation: SpriteAnimation = 'IDLE';
  frame: number = 0;
  positionX: number = 0;
  direction: 'left' | 'right' = 'right';
  private subs: Subscription[] = [];
  private isBrowser: boolean;
  @ViewChild('container', { static: true }) containerRef!: ElementRef;
  private hasJumped = false;
  private hasDied = false;

  constructor(
    public spriteService: SpriteServiceService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    // Suscribirse a los observables del servicio para actualizar el estado del sprite
    this.subs.push(this.spriteService.animation.subscribe(a => this.animation = a));
    this.subs.push(this.spriteService.frame.subscribe(f => this.frame = f));
    this.subs.push(this.spriteService.positionX.subscribe(x => this.positionX = x));
    this.subs.push(this.spriteService.directionObservable.subscribe(d => this.direction = d));
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const width = this.containerRef?.nativeElement?.offsetWidth || window.innerWidth;
      this.spriteService.setContainerWidth(width);
      this.spriteService.start();
    });
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  get spriteUrl() {
    const anim = this.animation;
    const frameStr = this.frame.toString().padStart(3, '0');
    return `/assets/sprite-boot/_PNG/1_KNIGHT/Knight_01__${anim}_${frameStr}.png`;
  }

  get spriteStyle() {
    return {
      left: this.positionX + '%',
      bottom: '0',
      position: 'absolute',
      transform: this.direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
      transition: 'left 0.1s linear',
      height: '100%',
      pointerEvents: 'auto',
      objectFit: 'contain',
      objectPosition: 'bottom',
      transformOrigin: 'bottom',
      ...(this.spriteService.spriteYOffset ? { transform: `${this.direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)'} translateY(${this.spriteService.spriteYOffset}%)` } : {})
    };
  }

  get spriteTransform() {
    if (this.spriteService.spriteYOffset) {
      return `${this.direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)'} translateY(${this.spriteService.spriteYOffset}%)`;
    }
    return this.direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)';
  }

  @HostListener('mouseenter') onHover() {
    if (!this.hasDied && !this.hasJumped) {
      this.spriteService.attackOnHover();
    }
  }
  @HostListener('mouseleave') onLeave() {
    if (!this.hasDied && !this.hasJumped) {
      this.spriteService.endAttack();
    }
  }
  @HostListener('click') onClick() {
    if (!this.hasJumped && !this.hasDied) {
      this.hasJumped = true;
      this.spriteService.jumpOnClick();
      // Calcula la duración real de la animación de salto
      const jumpFrames = 10;
      const frameDuration = 80;
      const jumpDuration = jumpFrames * frameDuration;
      setTimeout(() => {
        if (!this.hasDied) {
          this.hasDied = true;
          this.spriteService.setAnimation('DIE', true);
        }
      }, jumpDuration);
    }
  }
}
