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
import { PreloadComponent } from '../../public/preload/preload.component';

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgOptimizedImage, RouterModule, MagicCrystalComponent, PreloadComponent],
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
    // NO verificar autenticación automáticamente para evitar loops
    // Solo verificar si viene de otra página
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
          // Limpiar cache de usuario para forzar nueva carga
          this.authService.clearUserCache();
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isAuthenticating = false;
          console.log('❌ [LOGIN ERROR] Error completo:', err);
          
          // Manejar diferentes tipos de errores
          if (err.status === 429) {
            // Rate limit excedido
            this.errors.push(err.error.message);
          } else if (err.error?.code === 'EMAIL_NOT_VERIFIED' || err.error?.error === 'EMAIL_NOT_VERIFIED') {
            // Email no verificado
            this.btnGoToResendEmailVerification = true;
            this.errors.push('Tu email no está verificado. Por favor verifícalo o reenvía el email de verificación.');
          } else if (err.error?.code === 'LOGIN_FAILED' || err.status === 401) {
            // Credenciales inválidas
            this.btnGoToResendEmailVerification = false;
            this.errors.push(err.error?.message || 'Credenciales inválidas. Verifica tu email y contraseña.');
          } else if (err.error?.code === 'USER_DISABLED') {
            // Usuario deshabilitado
            this.errors.push('Tu cuenta ha sido deshabilitada. Contacta al soporte.');
          } else if (err.error?.code === 'TWO_FACTOR_NOT_PASSED') {
            // 2FA requerido
            this.errors.push('Se requiere autenticación de dos factores.');
          } else {
            // Otros errores
            this.btnGoToResendEmailVerification = false;
            this.errors.push(err.error?.message || 'Error al iniciar sesión. Intenta nuevamente.');
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
      // Limpiar cache de usuario para forzar nueva carga
      this.authService.clearUserCache();
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
      // Limpiar cache de usuario para forzar nueva carga
      this.authService.clearUserCache();
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
