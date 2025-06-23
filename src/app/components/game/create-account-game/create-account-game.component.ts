import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, type FormGroup, FormsModule, Validators } from "@angular/forms"
import { ReactiveFormsModule } from '@angular/forms';
import { GameAccountService } from '../../../services/game-account.service';
import { AuthService } from '../../../services/auth.service';
import { AccountMaster } from '../../../models/master.account.model';
declare var bootstrap: any;

@Component({
  selector: 'app-create-account-game',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  standalone: true,
  templateUrl: './create-account-game.component.html',
  styleUrls: ['./create-account-game.component.css']
})
export class CreateAccountGameComponent implements OnInit {

  createAccountForm: FormGroup;
  isSubmitting = false;
  accountM: AccountMaster | null = null;
  currentStep = 1;
  totalSteps = 2;
  codeInputs = ['', '', '', '', '', ''];
  loading = false;
  codeSent = false;
  responseMessage = '';
  responseCreateAccountMessage = '';
  emailSent = false;

  passwordVisible = false;
  confirmPasswordVisible = false;

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

  ngOnInit(): void {

  }

  onInputChange(event: any, index: number) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    if (value.length > 1) {
      value = value[0];
      input.value = value;
    }

    this.codeInputs[index] = value;

    if (value && index < 5) {
      const inputs = document.querySelectorAll('.code-input') as NodeListOf<HTMLInputElement>;
      inputs[index + 1]?.focus();
    }
  }

  nextStep() {
    if (this.currentStep === 1 && !this.isCodeComplete()) {
      return;
    }
    if (this.currentStep < this.totalSteps) this.currentStep++;
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  isCodeComplete(): boolean {
    return this.codeInputs.every(code => code.trim() !== '');
  }

  getEnteredCode(): string {
    return this.codeInputs.join('');
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get("password");
    const confirmPassword = form.get("confirmPassword");

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit() {
    if (this.createAccountForm.valid && this.isCodeComplete()) {
      this.isSubmitting = true;

      const username = this.createAccountForm.get('username')?.value;
      const password = this.createAccountForm.get('password')?.value;
      const verificationCode = this.getEnteredCode();

      const accountPayload = {
        username: username,
        password: password,
        createCode: verificationCode
      };

      this.accountsGameService.createAccountGame(accountPayload).subscribe({
        next: (response: any) => {
          this.isSubmitting = false;
          this.createAccountForm.reset();
          this.codeInputs = ['', '', '', '', '', ''];
          this.responseCreateAccountMessage = "";
          const modal = new bootstrap.Modal(document.getElementById('successModal'));
          modal.show();
        },
        error: (error: any) => {
          console.error('Error creating account:', error.error);
          this.isSubmitting = false;
          this.responseCreateAccountMessage = error.error?.message || 'Error creating account';
          // Show error message here
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

  sendEmailCodeCreateAccount() {
    this.loading = true;
    this.accountsGameService.sendCreateCode().subscribe({
      next: (res) => {
        this.loading = false;
        this.codeSent = true;
        // Show success message to user
      },
      error: (err) => {
        console.error('Error sending verification code:', err);
        this.loading = false;
        this.responseMessage = err.error?.message || 'Error sending code';
        this.codeSent = true;

        // Show error message to user
      }
    });
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const paste = event.clipboardData?.getData('text') || '';
    const values = paste.substring(0, 6).split('');
    const inputs = document.querySelectorAll('.code-input') as NodeListOf<HTMLInputElement>;

    values.forEach((char, i) => {
      this.codeInputs[i] = char;
      if (inputs[i]) inputs[i].value = char;
    });

    const next = inputs[values.length];
    if (next) next.focus();
  }

  resendCode() {
    this.sendEmailCodeCreateAccount();
  }


  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }
}