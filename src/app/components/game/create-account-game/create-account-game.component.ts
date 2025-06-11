import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, type FormGroup, Validators } from "@angular/forms"
import { ReactiveFormsModule } from '@angular/forms';
import { GameAccountService } from '../../../services/game-account.service';
import { AuthService } from '../../../services/auth.service';
import { AccountMaster } from '../../../models/master.account.model';

@Component({
  selector: 'app-create-account-game',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './create-account-game.component.html',
  styleUrls: ['./create-account-game.component.css']
})
export class CreateAccountGameComponent implements OnInit {
  createAccountForm: FormGroup;
  isSubmitting = false;
  accountM: AccountMaster | null = null;

  constructor(
    private fb: FormBuilder,
    private accountsGameService: GameAccountService,
    private authService: AuthService
  ) {
    this.createAccountForm = this.fb.group(
      {
        username: ["", [Validators.required, Validators.minLength(4), Validators.maxLength(16)]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );

    this.authService.getCurrentUser().subscribe({
      next: user => {
        this.accountM = user ?? null;
        if (!this.accountM) {
          console.error('No user data found');
        }
      },
      error: err => {
        console.error('Error fetching user:', err);
        this.accountM = null;
      }
    });
  }

  ngOnInit(): void {}

  passwordMatchValidator(form: FormGroup) {
    const password = form.get("password");
    const confirmPassword = form.get("confirmPassword");

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit() {
    if (this.createAccountForm.valid) {
      this.isSubmitting = true;

      const username = this.createAccountForm.get('username')?.value;
      const password = this.createAccountForm.get('password')?.value;
      const email = this.accountM?.email || '';

      const accountPayload = {
        username: username,
        password: password,
        email: email
      };

      this.accountsGameService.createAccountGame(accountPayload).subscribe({
        next: (response: any) => {
          console.log('Cuenta creada:', response);
          this.isSubmitting = false;
          this.createAccountForm.reset();
          // Podés agregar algún mensaje visual de éxito acá
        },
        error: (error: any) => {
          console.error('Error creando cuenta:', error.error);
          this.isSubmitting = false;
          // Podés mostrar un mensaje de error acá
        }
      });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.createAccountForm.get(fieldName);

    if (field?.errors && field.touched) {
      if (field.errors["required"]) return `${fieldName} is required`;
      if (field.errors["minlength"])
        return `${fieldName} must be at least ${field.errors["minlength"].requiredLength} characters`;
      if (field.errors["maxlength"])
        return `${fieldName} must be no more than ${field.errors["maxlength"].requiredLength} characters`;
    }

    if (
      fieldName === "confirmPassword" &&
      this.createAccountForm.errors?.["passwordMismatch"] &&
      field?.touched
    ) {
      return "Passwords do not match";
    }

    return "";
  }

  prueba() {
    console.log("Prueba de consola");
    // Aquí podés agregar más lógica si es necesario
  }
}
