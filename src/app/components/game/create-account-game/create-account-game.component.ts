import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, type FormGroup, Validators } from "@angular/forms"
import { ReactiveFormsModule } from '@angular/forms';
import { GameAccountService } from '../../../services/game-account.service';
@Component({
  selector: 'app-create-account-game',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './create-account-game.component.html',
  styleUrl: './create-account-game.component.css'
})
export class CreateAccountGameComponent {
  createAccountForm: FormGroup
  isSubmitting = false

  constructor(private fb: FormBuilder, accountsGameService: GameAccountService) {
    this.createAccountForm = this.fb.group(
      {
        username: ["", [Validators.required, Validators.minLength(4), Validators.maxLength(16)]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    )

    accountsGameService.getAccountsGame("encabojuan@gmail.com").subscribe({
      next: (accounts) => {
        console.log("Game accounts retrieved:", accounts);
      },
      error: (err) => {
        console.error("Error retrieving game accounts:", err);
      }
    })
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get("password")
    const confirmPassword = form.get("confirmPassword")

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true }
    }
    return null
  }

  onSubmit() {
    if (this.createAccountForm.valid) {
      this.isSubmitting = true

      // Simular llamada al servidor
      setTimeout(() => {
        console.log("Account created:", this.createAccountForm.value)
        this.isSubmitting = false
        // Aquí iría la lógica real de creación de cuenta
      }, 2000)
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.createAccountForm.get(fieldName)

    if (field?.errors && field.touched) {
      if (field.errors["required"]) return `${fieldName} is required`
      if (field.errors["minlength"])
        return `${fieldName} must be at least ${field.errors["minlength"].requiredLength} characters`
      if (field.errors["maxlength"])
        return `${fieldName} must be no more than ${field.errors["maxlength"].requiredLength} characters`
    }

    if (fieldName === "confirmPassword" && this.createAccountForm.errors?.["passwordMismatch"] && field?.touched) {
      return "Passwords do not match"
    }

    return ""
  }
}