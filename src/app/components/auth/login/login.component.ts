import { CommonModule } from "@angular/common"
import { HttpClient } from "@angular/common/http"
import { Component, inject, type OnInit, Renderer2 } from "@angular/core"
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { Router } from "@angular/router"
import { AuthService } from "../../../services/auth.service"
import { NgOptimizedImage } from '@angular/common';
import { GoogleAuthService } from "../../../services/google-auth.service"

/**
 * Login Component
 *
 * This component handles user authentication with a two-step process:
 * 1. User enters email
 * 2. User enters password
 *
 * It also provides social login options and navigation to other auth pages.
 */
@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgOptimizedImage],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  // Form groups for each step
  emailForm: FormGroup
  passwordForm: FormGroup
  errors: string[] = [];
  // Track the current step in the login process
  currentStep = 1
  btnGoToResendEmailVerification = false;
  // Store the email for use in step 2
  userEmail = ""
  passwordVisible = false;


  private googleAuth = inject(GoogleAuthService);
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private renderer: Renderer2

  ) {
    // Initialize form groups with validators
    this.emailForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
    })

    this.passwordForm = this.fb.group({
      password: ["", [Validators.required]],
    })
  }

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
  }

  /**
   * Proceed to the password step after validating email
   */
  goToNextStep(): void {
    if (this.emailForm.valid) {
      this.userEmail = this.emailForm.get("email")?.value
      this.currentStep = 2

      // In a real app, you might check if the email exists in your system here
    } else {
      // Mark form controls as touched to trigger validation messages
      this.emailForm.markAllAsTouched()
    }
  }

  /**
   * Go back to the email step
   */

  getEmail(): String {

    return this.emailForm.get("email")?.value



  }
  goToBack(): void {
    this.currentStep = 1
  }

  /**
   * Handle the login submission
   */
  login(): void {
    this.errors = [];
    this.btnGoToResendEmailVerification = false;  // Reseteo al iniciar login

    if (this.passwordForm.valid && this.userEmail) {
      const loginData = {
        email: this.userEmail,
        password: this.passwordForm.get("password")?.value,
      };


      this.authService.login(loginData).subscribe({
        next: (res) => {
          this.btnGoToResendEmailVerification = false; // Login OK, oculto botón
          this.authService.setEmail(this.userEmail);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {

          if (err.error?.error === 'EMAIL_NOT_VERIFIED') {
            this.btnGoToResendEmailVerification = true;
            this.errors.push('Your email is not verified. Please verify it or resend verification email.');
          } else {
            this.btnGoToResendEmailVerification = false;
            this.errors.push(err.error?.message || 'Login failed');
          }
        }
      });
    } else {
      this.btnGoToResendEmailVerification = false;
      if (!this.userEmail) {
        alert('Email is required');
      }
      this.passwordForm.markAllAsTouched();
    }
  }



  navigateToResendEmailVerification(): void {
    this.router.navigate(['/resend-email-verification'], {
      queryParams: { email: this.userEmail }
    });
  }

  /**
   * Handle Google login
   */
  async loginWithGoogle(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      console.log('Iniciando autenticación con Google...'); // Debug

      const user = await this.googleAuth.signInWithGoogle();

      console.log('Usuario:', user);
      console.log('Token almacenado:', localStorage.getItem('google_token'));
      this.router.navigate(['/dashboard']);
      // Verifica si la navegación está ocurriendo demasiado rápido
      // this.router.navigate(['/dashboard']); // Comenta temporalmente para pruebas

    } catch (error) {
      this.errorMessage = 'Error al iniciar sesión con Google';
      console.error('Error completo:', error);
    } finally {
      this.isLoading = false;
    }
  }
  /**
   * Handle Facebook login
   */
  async loginWithFacebook(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      console.log('Iniciando autenticación con Facebook...');
      const user = await this.googleAuth.signInWithFacebook();
      console.log('Usuario:', user);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorMessage = 'Error al iniciar sesión con Facebook';
      console.error('Error completo:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Navigate to forgot password page
   */
  navigateToForgotPassword(): void {
    // In a real app, you would use Angular Router
    this.router.navigate(['/forgot-password']);
    // this.router.navigate(['/auth/forgot-password']);
  }

  /**
   * Navigate to register page
   */
  navigateToRegister(): void {
    // In a real app, you would use Angular Router
    this.router.navigate(['/register']);

    // this.router.navigate(['/auth/register']);
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
}
