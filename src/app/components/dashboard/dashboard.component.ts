import { Component, HostListener, OnInit, Renderer2 } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AccountMaster } from '../../models/master.account.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  isDarkMode = false;

  navVisible = true;

  resolucionCambiada: boolean = false;
  accountM: AccountMaster | any = null;
  scrolled = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private renderer: Renderer2

  ) {


  }


  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      this.renderer.addClass(document.body, 'dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      this.renderer.removeClass(document.body, 'dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      this.renderer.addClass(document.body, 'dark-mode');
    }
    this.authService.getCurrentUser().subscribe({
      next: user => {
        if (user) {
          this.accountM = user;
        } else {
          console.error('No user data found');
          this.accountM = null;
        }
      },
      error: err => {
        console.error('Error fetching user:', err);
        if (err?.message === '2FA required') {
          this.router.navigate(['/two-factor-step']);
        }
      }
    });
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (window.innerWidth >= 1080) {
      this.navVisible = true;
    }
  }

  toggleNav() {
    this.navVisible = !this.navVisible;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: err => console.error(err)
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 50; // o el valor que quieras
  }

  navigateToCreateAccountGame() {
    this.router.navigate(['/dashboard/create-account-game']);
  }

  navigateToChangePasswordGame() {
    this.router.navigate(['/dashboard/change-password-game']);
  }
  navigateToHome() {
    this.router.navigate(['/dashboard/home-dashboard']);
  }
  navigateToBuyTerraCoin() {
    this.router.navigate(['/dashboard/buy-terra-coin']);
  }
  navigateToSendTerraCoin() {
    this.router.navigate(['/dashboard/send-terra-coin']);
  }
  navigateToSettingsAccountsMaster() {
    this.router.navigate(['/dashboard/setting-account-master']);
  }
  navigateToSupport() {
    this.router.navigate(['/dashboard/support']);
  }
  navigateToDownload() {
    this.router.navigate(['/dashboard/download']);
  }
}