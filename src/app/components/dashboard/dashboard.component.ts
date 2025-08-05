import { Component, HostListener, OnInit, Renderer2, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AccountMaster } from '../../models/master.account.model';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  isDarkMode = false;
  navVisible = true;
  resolucionCambiada: boolean = false;
  accountM: AccountMaster | any = null;
  scrolled = false;
  private subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private renderer: Renderer2
  ) {}

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
    
    const userSub = this.authService.getCurrentUser().pipe(take(1)).subscribe({
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
    
    this.subscription.add(userSub);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
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
    const logoutSub = this.authService.logout().pipe(take(1)).subscribe({
      next: () => this.router.navigate(['/login']),
      error: err => console.error(err)
    });
    this.subscription.add(logoutSub);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 50; // o el valor que quieras
  }
}