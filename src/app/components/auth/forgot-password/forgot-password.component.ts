import { CommonModule } from "@angular/common";
import { Component, OnInit, Renderer2 } from "@angular/core";
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../../services/auth.service";

@Component({
  selector: "app-forgot-password",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.css"],
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  emailSent = false;
  responseMessage = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private renderer: Renderer2

  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
    });
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

  sendResetEmail(): void {
    if (this.forgotPasswordForm.valid) {
      this.loading = true;
      const email = this.forgotPasswordForm.get("email")?.value;

      this.authService.recoveryPassword(email).subscribe({
        next: (res: any) => {
          this.emailSent = true;
          this.responseMessage = res.message || 'Check your inbox for the reset link.';
          this.forgotPasswordForm.reset();
          this.loading = false;
        },
        error: (err: any) => {
          this.emailSent = false;
          this.responseMessage = err.error?.message || 'Error sending reset email, try again later.';
          this.loading = false;
        }
      });
    } else {
      this.forgotPasswordForm.markAllAsTouched();
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}