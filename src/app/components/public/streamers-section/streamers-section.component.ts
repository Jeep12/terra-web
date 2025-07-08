import { Component, signal } from "@angular/core"
import { CommonModule } from "@angular/common"
import { StreamingService } from "../../../services/streaming.service"
import { KickPlatformLiveComponent } from "../kick-platform-live/kick-platform-live.component";


type Platform = "kick" | "youtube" | "twitch"

@Component({
  selector: "app-streamers-section",
  standalone: true,
  imports: [CommonModule, KickPlatformLiveComponent],
  templateUrl: "./streamers-section.component.html",
  styleUrl: "./streamers-section.component.css",
})
export class StreamersSectionComponent {
  selectedPlatform = signal<Platform>("kick")

  constructor(private streamService: StreamingService) {

  }

  platforms = [
    { id: 'kick' as Platform, name: 'Kick', icon: '<i class="fa-brands fa-kickstarter kick-icon"></i>' },
    { id: 'youtube' as Platform, name: 'YouTube', icon: '<i class="fa-brands fa-youtube"></i> ' },
    { id: 'twitch' as Platform, name: 'Twitch', icon: '<i class="fa-brands fa-twitch"></i>' },
  ];


  selectPlatform(platform: Platform) {
    this.selectedPlatform.set(platform)
  }
}
