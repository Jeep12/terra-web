import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StreamingService } from '../../../services/streaming.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-kick-platform-live',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kick-platform-live.component.html',
  styleUrls: ['./kick-platform-live.component.css']
})
export class KickPlatformLiveComponent implements OnInit, OnDestroy {
  channel: any = null;
  loading = true;
  playerError: string | null = null;
  isRefreshing = false;

  // Lista de canales
  channels: string[] = ['napoplays', 'duendepablo', 'djshavi'];
  currentSlug = '';

  safeUrl: SafeResourceUrl | null = null;

  constructor(
    private streamingService: StreamingService,
    private ngZone: NgZone,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadChannel('duendepablo');
  }

  ngOnDestroy(): void {
    // no hace falta limpiar nada
  }

  loadChannel(slug: string): void {
    if (this.currentSlug === slug) return; // evitar recarga si es el mismo canal

    this.loading = true;
    this.currentSlug = slug;
    this.playerError = null;
    this.channel = null;
    this.safeUrl = null;

    this.streamingService.getKickChannel(slug).subscribe({
      next: (res: any) => {
        console.log('Respuesta completa:', res);

        if (res.data && res.data.length > 0) {
          this.channel = res.data[0];

          if (!this.channel.stream.is_live) {
            this.playerError = 'El canal no está transmitiendo en vivo';
            this.safeUrl = null;
          } else {
            // Url del iframe para el player oficial Kick
            this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
              'https://player.kick.com/' + this.channel.slug
            );
          }
        } else {
          this.playerError = 'No se encontró el canal';
          this.channel = null;
          this.safeUrl = null;
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading channel:', error);
        this.playerError = 'Error cargando el canal';
        this.channel = null;
        this.safeUrl = null;
        this.loading = false;
      }
    });
  }

  refreshPlayer(): void {
    if (this.isRefreshing) return;
    this.isRefreshing = true;
    this.loadChannel(this.currentSlug);
    setTimeout(() => this.isRefreshing = false, 1000);
  }

  retryLoad(): void {
    this.loadChannel(this.currentSlug);
  }
}
