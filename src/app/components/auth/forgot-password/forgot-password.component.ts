import { CommonModule } from "@angular/common"
import { Component } from "@angular/core"
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { Router } from "@angular/router"

/**
 * Forgot Password Component
 *
 * This component handles password reset requests:
 * - Email validation
 * - Sending reset email (stub)
 * - Success state management
 *
 * It also provides navigation back to login.
 */
@Component({
  selector: "app-forgot-password",
  standalone:true,
  imports:[CommonModule,ReactiveFormsModule],
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.css"],
})
export class ForgotPasswordComponent {
  // Form group for forgot password
  forgotPasswordForm: FormGroup

  // Track if email has been sent
  emailSent = false

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
    // Initialize form group with validators
    this.forgotPasswordForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
    })
  }

  /**
   * Handle the reset email submission
   */
  sendResetEmail(): void {
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.get("email")?.value

      // In a real app, you would call your password reset service here
      console.log("Password reset requested for:", email)

      // Simulate API call with a short delay
      setTimeout(() => {
        // Show success message
        this.emailSent = true

        // Reset form
        this.forgotPasswordForm.reset()
      }, 1000)
    } else {
      // Mark form controls as touched to trigger validation messages
      this.forgotPasswordForm.markAllAsTouched()
    }
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
