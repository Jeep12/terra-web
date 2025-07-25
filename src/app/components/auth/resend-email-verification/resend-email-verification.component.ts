import { Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { PreloadComponent } from '../../public/preload/preload.component';

@Component({
  standalone: true,
  selector: 'app-resend-email-verification',
  templateUrl: './resend-email-verification.component.html',
  styleUrls: ['./resend-email-verification.component.css'],
  imports: [CommonModule, FormsModule,PreloadComponent]
})
export class ResendEmailVerificationComponent implements OnInit {
  email: string = '';
  emailFromQuery: boolean = false;
  emailSent: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private renderer: Renderer2

  ) { }

  ngOnInit(): void {
    const authContainer = document.querySelector('.auth-container');
    const savedTheme = localStorage.getItem('theme');

    if (authContainer) {
      if (savedTheme === 'dark') {
        this.renderer.addClass(authContainer, 'dark-mode');
      } else {
        this.renderer.removeClass(authContainer, 'dark-mode');
      }
    }
    this.route.queryParams.subscribe(params => {
      const emailParam = params['email'];
      if (emailParam) {
        this.email = emailParam;
        this.emailFromQuery = true;
      }
    });
  }

  resendEmail(): void {
    this.authService.resendVerificationEmail(this.email).subscribe({
      next: (res) => {
        this.emailSent = true;
        this.errorMessage = null;
      },
      error: (err) => {
        this.emailSent = false;
        this.errorMessage = err.error?.message || 'Error sending email.';
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
