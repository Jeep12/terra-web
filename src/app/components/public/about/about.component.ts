import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DiscordWidgetComponent } from "../discord-widget/discord-widget.component";
import { PreloadComponent } from '../preload/preload.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [PreloadComponent, CommonModule, DiscordWidgetComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  isVisible = false;

  projectHighlights = [
    {
      title: 'Stability Commitment',
      description: 'Minimum 2 years of guaranteed server uptime',
      icon: '🛡️'
    },
    {
      title: 'Community Driven',
      description: 'Your feedback shapes our development',
      icon: '👥'
    },
    {
      title: 'Classic 3.0',
      description: 'Authentic Lineage II experience with kamels and modern tweaks',
      icon: '⚔️'
    }
  ];

  developers = [
    { name: 'AK4N1', role: 'Lead Developer' },
  ];

  ngOnInit() {
    // Trigger animation after component loads
    setTimeout(() => {
      this.isVisible = true;
    }, 100);
  }

  onJoinCommunity() {
    // Add your community join logic here
  }

  onLearnMore() {
    // Add navigation or modal logic here
  }
}