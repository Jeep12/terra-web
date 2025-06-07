import { CommonModule } from "@angular/common"
import { Component, type OnInit } from "@angular/core"
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { Router } from "@angular/router"

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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  // Form groups for each step
  emailForm: FormGroup
  passwordForm: FormGroup

  // Track the current step in the login process
  currentStep = 1

  // Store the email for use in step 2
  userEmail = ""

  constructor(
    private fb: FormBuilder,
    private router: Router,
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
    // Any initialization logic can go here
  }

  /**
   * Proceed to the password step after validating email
   */
  goToNextStep(): void {
    if (this.emailForm.valid) {
      this.userEmail = this.emailForm.get("email")?.value
      this.currentStep = 2

      // In a real app, you might check if the email exists in your system here
      console.log("Email validated:", this.userEmail)
    } else {
      // Mark form controls as touched to trigger validation messages
      this.emailForm.markAllAsTouched()
    }
  }

  /**
   * Go back to the email step
   */
  goBack(): void {
    this.currentStep = 1
  }

  /**
   * Handle the login submission
   */
  login(): void {
    if (this.passwordForm.valid) {
      const loginData = {
        email: this.userEmail,
        password: this.passwordForm.get("password")?.value,
      }

      // In a real app, you would call your authentication service here
      console.log("Login attempt with:", loginData)

      // Simulate successful login
      alert("Login successful! (This is a stub - no actual authentication)")

      // Navigate to dashboard or home page after successful login
      // this.router.navigate(['/dashboard']);
    } else {
      // Mark form controls as touched to trigger validation messages
      this.passwordForm.markAllAsTouched()
    }
  }

  /**
   * Handle Google login
   */
  loginWithGoogle(): void {
    // In a real app, you would integrate with Google OAuth
    console.log("Google login clicked")
    alert("Google login clicked (This is a stub - no actual authentication)")
  }

  /**
   * Handle Facebook login
   */
  loginWithFacebook(): void {
    // In a real app, you would integrate with Facebook OAuth
    console.log("Facebook login clicked")
    alert("Facebook login clicked (This is a stub - no actual authentication)")
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
    console.log("Navigate to register")
    this.router.navigate(['/register']);

    // this.router.navigate(['/auth/register']);
  }
}
