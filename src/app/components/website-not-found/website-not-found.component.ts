import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-website-not-found',
  imports: [],
  templateUrl: './website-not-found.component.html',
  styleUrl: './website-not-found.component.css'
})
export class WebsiteNotFoundComponent implements OnInit {


  constructor(
    private renderer: Renderer2,
    private router: Router,
    private authService: AuthService
  ) {

  }
  goToWebsite() {
    this.authService.isLoggedIn().subscribe(logged => {
      if (logged) {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/login']);
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
