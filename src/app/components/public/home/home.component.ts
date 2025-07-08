import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CarrouselHomeComponent } from "../carrousel-home/carrousel-home.component";
import { AboutComponent } from "../about/about.component";
import { DiscordWidgetComponent } from "../discord-widget/discord-widget.component";
import { StreamersSectionComponent } from "../streamers-section/streamers-section.component";

@Component({
  selector: 'app-home',
  imports: [RouterModule, CommonModule, AboutComponent, CarrouselHomeComponent, StreamersSectionComponent,],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  isLoggedIn: boolean = true;


  isMenuOpen = false;
  isStatisticsDropdownOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleStatisticsDropdown() {
    this.isStatisticsDropdownOpen = !this.isStatisticsDropdownOpen;
  }

  closeDropdowns() {
    this.isStatisticsDropdownOpen = false;
  }

  onLogin() {
    // Handle login logic
    console.log('Login clicked');
  }

  onRegister() {
    // Handle register logic
    console.log('Register clicked');
  }

  onDashboard() {
    // Handle dashboard navigation
    console.log('Dashboard clicked');
  }
}
