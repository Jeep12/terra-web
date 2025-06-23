import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

declare var bootstrap: any;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  passwordVisible = false;
  confirmPasswordVisible = false;
  loading = false;
  errors: string[] = [];
  showOffcanvas = false;
  activeContent: 'terms' | 'privacy' | null = null;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private renderer: Renderer2

  ) {
    this.registerForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        acceptTerms: [false, Validators.requiredTrue],
      },
      { validators: this.passwordMatch }
    );
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


  passwordMatch(ctrl: AbstractControl): ValidationErrors | null {
    const pw = ctrl.get('password')!;
    const cpw = ctrl.get('confirmPassword')!;
    if (pw.value !== cpw.value) {
      return { passwordMismatch: true };
    }
    return null;
  }



  register() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.errors = [];
    const { email, password } = this.registerForm.value;

    this.authService.register({ email, password }).subscribe({
      next: res => {
        this.loading = false;
        const modal = new bootstrap.Modal(document.getElementById('successModal'));
        modal.show();
      },
      error: err => {
        this.loading = false;
        this.errors = [err.error?.message || 'Ocurrió un error'];
      },
    });
  }

  openOffcanvas(type: 'terms' | 'privacy', event: Event) {
    event.preventDefault();
    this.activeContent = type;
    this.showOffcanvas = true;
  }

  closeOffcanvas() {
    this.showOffcanvas = false;
    this.activeContent = null;
  }
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  registerWithGoogle() {
  }
  registerWithFacebook() {
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
