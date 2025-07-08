import { Component, type OnInit, type OnDestroy, type NgZone } from "@angular/core"
import { CommonModule } from "@angular/common"
import { StreamingService } from "../../../services/streaming.service"
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser"
import { HttpClient } from "@angular/common/http"

@Component({
  selector: "app-kick-platform-live",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./kick-platform-live.component.html",
  styleUrls: ["./kick-platform-live.component.css"],
})
export class KickPlatformLiveComponent implements OnInit, OnDestroy {
  channel: any = null
  channelData: any = null // Datos de la API pública
  loading = true
  playerError: string | null = null
  isRefreshing = false
  showIframe = false // Controla si mostrar iframe o previsualización

  // Lista de canales
  channels: string[] = ["napoplays", "duendepablo", "djshavi"]
  currentSlug = ""

  safeUrl: SafeResourceUrl | null = null

  constructor(
    private streamingService: StreamingService,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    this.loadChannel(this.channels[0])
  }

  ngOnDestroy(): void {
  }

  loadChannel(slug: string): void {
    if (this.currentSlug === slug && !this.isRefreshing) return

    this.loading = true
    this.currentSlug = slug
    this.playerError = null
    this.channel = null
    this.channelData = null
    this.safeUrl = null
    this.showIframe = false

    this.loadChannelFromPublicAPI(slug)
    this.loadChannelFromStreamingService(slug)
  }

  private async loadChannelFromPublicAPI(slug: string) {
    try {
      const response = await this.http.get<any>(`https://kick.com/api/v1/channels/${slug}`).toPromise()

      this.channelData = response

      if (this.channel) {
        this.loading = false
      }
    } catch (error) {
      this.playerError = "Error cargando información del canal"
      this.loading = false
    }
  }

  private loadChannelFromStreamingService(slug: string): void {
    this.streamingService.getKickChannel(slug).subscribe({
      next: (res: any) => {

        if (res.data && res.data.length > 0) {
          this.channel = res.data[0]
          if (this.channelData) {
            this.loading = false
          }
        } else {
          this.playerError = "No se encontró el canal"
          this.channel = null
          this.loading = false
        }
      },
      error: (error) => {
        this.playerError = "Error cargando el canal"
        this.channel = null
        this.loading = false
      },
    })
  }

  showStream(): void {
    if (this.channelData?.livestream?.is_live) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`https://player.kick.com/${this.currentSlug}`)
      this.showIframe = true
    }
  }

  hideStream(): void {
    this.showIframe = false
    this.safeUrl = null
  }

  refreshPlayer(): void {
    if (this.isRefreshing) return
    this.isRefreshing = true
    this.showIframe = false
    this.loadChannel(this.currentSlug)
    setTimeout(() => (this.isRefreshing = false), 1000)
  }

  retryLoad(): void {
    this.loadChannel(this.currentSlug)
  }

  formatViewerCount(count: number): string {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K"
    }
    return count.toString()
  }

  formatDuration(startTime: string): string {
    const start = new Date(startTime)
    const now = new Date()
    const diff = now.getTime() - start.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }
}
