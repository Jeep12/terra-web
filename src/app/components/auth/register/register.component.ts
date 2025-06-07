import { CommonModule } from "@angular/common"
import { Component } from "@angular/core"
import {
  FormBuilder,
  type FormGroup,
  Validators,
  type AbstractControl,
  type ValidationErrors,
  ReactiveFormsModule,
} from "@angular/forms"
import { Router } from "@angular/router"

/**
 * Register Component
 *
 * This component handles user registration with form validation:
 * - Email validation
 * - Password requirements
 * - Password matching
 * - Terms acceptance
 *
 * It also provides social registration options and navigation to login.
 */
@Component({
  selector: "app-register",
  imports:[CommonModule,ReactiveFormsModule],
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"],
})
export class RegisterComponent {
  // Form group for registration
  registerForm: FormGroup

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
    // Initialize form group with validators
    this.registerForm = this.fb.group(
      {
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", [Validators.required]],
        acceptTerms: [false, [Validators.requiredTrue]],
      },
      {
        validators: this.passwordMatchValidator,
      },
    )
  }

  /**
   * Custom validator to check if passwords match
   */
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get("password")
    const confirmPassword = control.get("confirmPassword")

    // Return null if controls haven't initialized yet or if there's no value
    if (!password || !confirmPassword) {
      return null
    }

    // Return null if another validator has already found an error on the matchingControl
    if (confirmPassword.errors && !confirmPassword.errors["passwordMismatch"]) {
      return null
    }

    // Return error if passwords don't match
    if (password.value !== confirmPassword.value) {
      return { passwordMismatch: true }
    }

    return null
  }

  /**
   * Handle the registration submission
   */
  register(): void {
    if (this.registerForm.valid) {
      const registrationData = {
        email: this.registerForm.get("email")?.value,
        password: this.registerForm.get("password")?.value,
      }

      // In a real app, you would call your registration service here
      console.log("Registration attempt with:", registrationData)

      // Simulate successful registration
      alert("Registration successful! (This is a stub - no actual registration)")

      // Navigate to login page or dashboard after successful registration
      // this.router.navigate(['/auth/login']);
    } else {
      // Mark form controls as touched to trigger validation messages
      this.registerForm.markAllAsTouched()
    }
  }

  /**
   * Handle Google registration
   */
  registerWithGoogle(): void {
    // In a real app, you would integrate with Google OAuth
    console.log("Google registration clicked")
    alert("Google registration clicked (This is a stub - no actual registration)")
  }

  /**
   * Handle Facebook registration
   */
  registerWithFacebook(): void {
    // In a real app, you would integrate with Facebook OAuth
    console.log("Facebook registration clicked")
    alert("Facebook registration clicked (This is a stub - no actual registration)")
  }

  /**
   * Navigate to login page
   */
  navigateToLogin(): void {
    // In a real app, you would use Angular Router
    this.router.navigate(['/login']);
    // this.router.navigate(['/auth/login']);
  }
}
