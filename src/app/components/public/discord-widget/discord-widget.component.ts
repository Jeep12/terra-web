import { CommonModule } from "@angular/common"
import { Component, type OnInit } from "@angular/core"
import { environment } from "../../../environments/environment"

interface DiscordMember {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  status: string
  avatar_url: string
  game?: {
    name: string
  }
}

interface DiscordWidget {
  id: string
  name: string
  instant_invite: string | null
  channels: any[]
  members: DiscordMember[]
  presence_count: number
}

@Component({
  selector: "app-discord-widget",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./discord-widget.component.html",
  styleUrls: ["./discord-widget.component.css"],
})

export class DiscordWidgetComponent implements OnInit {
  guildId = environment.API_KEY_DISCORD
  widgetData: DiscordWidget | null = null
  error: string | null = null
  isLoading = true

  ngOnInit() {
    this.loadWidget()
  }

  async loadWidget() {
    this.isLoading = true
    this.error = null

    try {
      const res = await fetch(`https://discord.com/api/guilds/${this.guildId}/widget.json`)
      if (!res.ok) {
        throw new Error(`Error ${res.status}`)
      }
      this.widgetData = await res.json()

      // Debug: ver qué datos recibimos
      console.log("Discord widget data:", this.widgetData)
    } catch (e: any) {
      this.error = e.message || "Error loading widget"
    } finally {
      this.isLoading = false
    }
  }

  openInvite(inviteUrl: string) {
    window.open(inviteUrl, "_blank")
  }

  onImageError(event: any) {
    event.target.src = "https://cdn.discordapp.com/embed/avatars/0.png"
  }

  refreshWidget() {
    this.loadWidget()
  }

  // Método para crear invitación manual si no hay instant_invite
  getServerInvite(): string {
    // Si hay instant_invite, usarlo
    if (this.widgetData?.instant_invite) {
      return this.widgetData.instant_invite
    }
    // Si no, crear URL genérica del servidor
    return `https://discord.gg/wXnPMdStvW`
  }
}
