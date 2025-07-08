// login.component.ts
import { CommonModule } from "@angular/common"
import { HttpClient } from "@angular/common/http"
import { Component, inject, type OnInit, Renderer2 } from "@angular/core"
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { Router, RouterModule } from "@angular/router"
import { AuthService } from "../../../services/auth.service"
import { NgOptimizedImage } from '@angular/common';
import { GoogleAuthService } from "../../../services/google-auth.service"
import { MagicCrystalComponent } from "../../magic-crystal/magic-crystal.component";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgOptimizedImage, RouterModule, MagicCrystalComponent],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  emailForm: FormGroup
  passwordForm: FormGroup
  errors: string[] = [];
  currentStep = 1
  btnGoToResendEmailVerification = false;
  userEmail = ""
  passwordVisible = false;

  private googleAuth = inject(GoogleAuthService);
  isLoading = false;
  errorMessage = '';
  isAuthenticating = false;




  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private renderer: Renderer2
  ) {
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

  goToNextStep(): void {
    if (this.emailForm.valid) {
      this.userEmail = this.emailForm.get("email")?.value
      this.currentStep = 2
    } else {
      this.emailForm.markAllAsTouched()
    }
  }

  goToBack(): void {
    this.currentStep = 1
  }

  login(): void {
    this.errors = [];
    this.btnGoToResendEmailVerification = false;
    this.isAuthenticating = true;

    if (this.passwordForm.valid && this.userEmail) {
      const loginData = {
        email: this.userEmail,
        password: this.passwordForm.get("password")?.value,
      };

      this.authService.login(loginData).subscribe({
        next: (res) => {
          this.btnGoToResendEmailVerification = false;
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
        },
        complete: () => {
          this.isAuthenticating = false;
        }
      });
    } else {
      this.btnGoToResendEmailVerification = false;
      this.isAuthenticating = false;
      if (!this.userEmail) alert('Email is required');
      this.passwordForm.markAllAsTouched();
    }
  }

  navigateToResendEmailVerification(): void {
    this.router.navigate(['/resend-email-verification'], {
      queryParams: { email: this.userEmail }
    });
  }

  async loginWithGoogle(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const user = await this.googleAuth.signInWithGoogle();
      this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorMessage = 'Error al iniciar sesión con Google';
      this.isLoading = false;
    } finally {
      this.isLoading = false;
    }
  }

  async loginWithFacebook(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const user = await this.googleAuth.signInWithFacebook();
      this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorMessage = 'Error al iniciar sesión con Facebook';
      this.isLoading = false;
    } finally {
      this.isLoading = false;
    }
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
}
