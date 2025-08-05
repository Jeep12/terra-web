import { Component, OnInit, Renderer2, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-website-not-found',
  templateUrl: './website-not-found.component.html',
  styleUrls: ['./website-not-found.component.css']
})
export class WebsiteNotFoundComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private authService: AuthService
  ) {}

  goToWebsite(): void {
    const authSub = this.authService.isLoggedIn().pipe(take(1)).subscribe({
      next: (logged) => {
        if (logged) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        console.error('Error checking login status', err);
        this.router.navigate(['/login']);
      }
    });
    this.subscription.add(authSub);
  }

  ngOnInit(): void {
    const authContainer = document.querySelector('.container-notfound');
    const savedTheme = localStorage.getItem('theme');

    if (authContainer) {
      if (savedTheme === 'dark') {
        this.renderer.addClass(authContainer, 'dark-mode');
      } else {
        this.renderer.removeClass(authContainer, 'dark-mode');
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
