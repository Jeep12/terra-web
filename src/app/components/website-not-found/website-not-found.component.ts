import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-website-not-found',
  templateUrl: './website-not-found.component.html',
  styleUrls: ['./website-not-found.component.css']
})
export class WebsiteNotFoundComponent implements OnInit {

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private authService: AuthService
  ) {}

  goToWebsite(): void {
    this.authService.isLoggedIn().subscribe({
      next: (logged) => {
        if (logged) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        console.error('Error checking login status', err);
      }
    });
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
}
