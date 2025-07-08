import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
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
    console.log('Joining Terra community...');
  }

  onLearnMore() {
    // Add navigation or modal logic here
    console.log('Learning more about Terra...');
  }
}