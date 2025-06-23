import { CommonModule } from '@angular/common';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

declare var bootstrap: any;

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  errors: string[] = [];
  resetForm: FormGroup;
  passwordVisible: boolean = false;
  repeatPasswordVisible: boolean = false;
  loading: boolean = false;
  tokenUser: string | null = null;

  passwordValidations = {
    length: false,
    uppercase: false,
    specialChar: false,
    number: false,
    match: false
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private renderer: Renderer2

  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    });

    this.resetForm.get('password')?.valueChanges.subscribe(() => {
      this.onPasswordChange();
    });

    this.resetForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.onPasswordChange();
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
    this.route.queryParams.subscribe(params => {
      this.tokenUser = params['token'];
    });
  }

  onPasswordChange() {
    const password = this.resetForm.get('password')?.value;
    const confirmPassword = this.resetForm.get('confirmPassword')?.value;

    this.passwordValidations.length = password?.length >= 8;
    this.passwordValidations.uppercase = /[A-Z]/.test(password);
    this.passwordValidations.specialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    this.passwordValidations.number = /\d/.test(password);
    this.passwordValidations.match = password === confirmPassword;
  }

  onSubmit() {
    if (!this.tokenUser) {
      this.errors = ['Invalid token.'];
      return;
    }

    const { password, confirmPassword } = this.resetForm.value;

    if (password !== confirmPassword) {
      this.errors = ['Passwords do not match.'];
      return;
    }

    if (this.resetForm.valid && this.tokenUser) {
      this.loading = true;
      this.errors = [];

      this.authService.resetPassword(this.tokenUser, password).subscribe(
        (response: any) => {
          if (response.success === false) {
            this.errors = [response.message];
          } else {
            const modal = new bootstrap.Modal(document.getElementById('successModal'));
            modal.show();
          }
          this.loading = false;
        },
        (error: any) => {
          this.errors = [error.error?.message || 'An error occurred. Please try again.'];
          this.loading = false;
        }
      );
    } else {
      this.errors = ['Please fill all required fields correctly.'];
    }
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleRepeatPasswordVisibility() {
    this.repeatPasswordVisible = !this.repeatPasswordVisible;
  }

  isPasswordValid() {
    return (
      this.passwordValidations.length &&
      this.passwordValidations.uppercase &&
      this.passwordValidations.specialChar &&
      this.passwordValidations.number &&
      this.passwordValidations.match
    );
  }

  goBack() {
    this.router.navigate(['/login']);
  }
}