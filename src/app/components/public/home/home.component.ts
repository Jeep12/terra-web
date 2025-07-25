import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationStart, Router, RouterModule } from '@angular/router';
import { CarrouselHomeComponent } from "../carrousel-home/carrousel-home.component";
import { AboutComponent } from "../about/about.component";
import { DiscordWidgetComponent } from "../discord-widget/discord-widget.component";
import { StreamersSectionComponent } from "../streamers-section/streamers-section.component";
import { PreloaderService } from '../../../services/preloader.service';
import { PreloadComponent } from '../preload/preload.component';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    AboutComponent,
    CarrouselHomeComponent,
    StreamersSectionComponent,
    PreloadComponent



  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  showPreloadOpen = true;
  showPreloadClose = false;
  private isDestroying = false;
  private navigationSub!: Subscription;

  isMenuOpen = false;
  isStatisticsDropdownOpen = false;

  constructor(private preloaderService: PreloaderService, private router: Router) {

    this.navigationSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart && !this.isDestroying) {
        // NO funciona en Angular Router, se deja para aclarar la intención
        this.handleBeforeDestroy(event.url);
      }
    });
  }

  handleBeforeDestroy(nextUrl: string) {
    this.isDestroying = true;
    console.log('Animación de salida iniciada, esperando 1.2s');

    // Retraso real de 1.2 segundos (1200 ms)
    timer(1200).subscribe(() => {
      console.log('Animación terminada, navegando a:', nextUrl);
      // Navegar manualmente después del delay
      this.router.navigateByUrl(nextUrl);
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleStatisticsDropdown() {
    this.isStatisticsDropdownOpen = !this.isStatisticsDropdownOpen;
  }

  closeDropdowns() {
    this.isStatisticsDropdownOpen = false;
  }


}
