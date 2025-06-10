import { Component, HostListener } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  navVisible = true;
  resolucionCambiada: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {

    
  }
    @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (window.innerWidth >= 1080) {
      this.navVisible = true;
      console.log('Pasó los 1080px');
    }
  }

  toggleNav() {
    console.log('Toggling navigation visibility');
    this.navVisible = !this.navVisible;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: err => console.error(err)
    });
  }

  navigateToCreateAccountGame() {
    this.router.navigate(['/dashboard/create-account-game']);
  }

  navigateToChangePasswordGame() {
    this.router.navigate(['/dashboard/change-password-game']);
  }
}