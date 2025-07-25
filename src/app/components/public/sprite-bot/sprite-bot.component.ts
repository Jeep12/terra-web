import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PersonajeService } from '../../../services/personaje.service';
import { CommonModule } from '@angular/common';

/**
 * SpriteBotComponent desacoplado: solo renderiza y reacciona a eventos.
 * Toda la lógica de animación y movimiento está en PersonajeService y el modelo Personaje.
 */
@Component({
  selector: 'app-sprite-bot',
  templateUrl: './sprite-bot.component.html',
  styleUrls: ['./sprite-bot.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class SpriteBotComponent implements OnInit, OnDestroy {
  anim: string = 'IDLE';
  frame: number = 0;
  x: number = 50;
  direction: 'left' | 'right' = 'right';
  private subs: Subscription[] = [];

  // Diálogo (puedes moverlo a un servicio si quieres compartirlo)
  dialogMessage: string | null = null;
  private dialogTimeout: any;
  dialogVisibleMs: number = 8000; // 8 segundos visible
  dialogHiddenMs: number = 12000; // 12 segundos oculto
  dialogMessages: string[] = [
    'Our Terra server is under development!',
    'Click here for more information!',
    'Stay tuned for upcoming updates!',
    'Have questions? Tap me!',
    'Join our Discord for more info!'
  ];

  constructor(public personajeService: PersonajeService) {}

  ngOnInit() {
    this.subs.push(this.personajeService.anim$.subscribe(a => {
      this.anim = a;
      // Solo mostrar diálogos si está en IDLE
      if (a === 'IDLE') {
        this.startDialogLoop();
      } else {
        this.clearDialog();
      }
    }));
    this.subs.push(this.personajeService.frame$.subscribe(f => this.frame = f));
    this.subs.push(this.personajeService.x$.subscribe(x => this.x = x));
    this.subs.push(this.personajeService.direction$.subscribe(d => this.direction = d));
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    this.clearDialog();
  }

  // Diálogo automático solo en IDLE
  startDialogLoop() {
    if (this.dialogTimeout) return; // Ya hay un ciclo activo
    this.setRandomDialogMessage();
  }
  setRandomDialogMessage() {
    if (this.anim !== 'IDLE') return;
    const idx = Math.floor(Math.random() * this.dialogMessages.length);
    this.dialogMessage = this.dialogMessages[idx];
    this.dialogTimeout = setTimeout(() => {
      this.dialogMessage = null;
      this.dialogTimeout = setTimeout(() => this.setRandomDialogMessage(), this.dialogHiddenMs);
    }, this.dialogVisibleMs);
  }
  clearDialog() {
    if (this.dialogTimeout) clearTimeout(this.dialogTimeout);
    this.dialogTimeout = null;
    this.dialogMessage = null;
  }

  // Eventos de interacción
  onHover() { this.personajeService.atacar(); }
  onLeave() { this.personajeService.setAnim('IDLE'); }
  onClick() { this.personajeService.saltar(); }

  // Render helpers
  get spriteUrl() {
    const anim = this.anim;
    const frameStr = this.frame.toString().padStart(3, '0');
    return `assets/sprite-boot/_PNG/1_KNIGHT/Knight_01__${anim}_${frameStr}.png`;
  }
  get spriteStyle() {
    return {
      left: this.x + '%',
      bottom: '0',
      position: 'absolute',
      transform: this.direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
      transition: 'left 0.1s linear',
      height: '100%',
      pointerEvents: 'auto',
      objectFit: 'contain',
      objectPosition: 'bottom',
      transformOrigin: 'bottom',
    };
  }
}
