import { CommonModule } from '@angular/common';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  imports: [CommonModule],
  standalone: true,

  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css'
})
export class VerifyEmailComponent implements OnInit {
  isLoading = true;
  statusMessage = '';
  isError = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private renderer: Renderer2

  ) {

  }
  ngOnInit(): void {

    const authContainer = document.querySelector('.verify-container');
    const savedTheme = localStorage.getItem('theme');

    if (authContainer) {
      if (savedTheme === 'dark') {
        this.renderer.addClass(authContainer, 'dark-mode');
      } else {
        this.renderer.removeClass(authContainer, 'dark-mode');
      }
    }

    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      this.verifyEmail(token);

    });



  }


  verifyEmail(token: string) {
    this.isLoading = true;
    this.statusMessage = '';
    this.isError = false;

    this.authService.verifyEmail(token).subscribe({
      next: (res: any) => {
        // esperamos 1.5 segundos antes de mostrar el mensaje
        setTimeout(() => {
          this.isLoading = false;
          this.isError = false;
          this.statusMessage = res.message || "¡Email verificado correctamente!";
        }, 3500);
      },
      error: (err) => {
        setTimeout(() => {
          this.isLoading = false;
          this.isError = true;
          this.statusMessage = err.error?.message || "Error al verificar el email, el token puede ser inválido o expirado.";
        }, 3500);
      }
    });
  }





  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}