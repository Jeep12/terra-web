import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from "@angular/forms";
import { AccountGameResponse } from '../../../models/game.account.model';
import { GameAccountService } from '../../../services/game-account.service';
import { AccountMaster } from '../../../models/master.account.model';
import { AuthService } from '../../../services/auth.service';
declare var bootstrap: any;

@Component({
  selector: 'app-change-password-game',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './change-password-game.component.html',
  styleUrls: ['./change-password-game.component.css']
})
export class ChangePasswordGameComponent implements OnInit {

  changePasswordForm: FormGroup;
  isSubmitting = false;
  accountM: AccountMaster | null = null;

  // Steps control
  currentStep = 1;
  totalSteps = 3;

  // Code verification
  codeInputs = ['', '', '', '', '', ''];
  loading = false;
  codeSent = false;

  // Account selection
  gameAccounts: AccountGameResponse[] = [];
  selectedAccount: AccountGameResponse | null = null;
  currentAccountIndex = 0;

  // Response messages
  responseMessage = '';
  emailSent = false;
  newPasswordVisible = false;
  confirmNewPasswordVisible = false;

  constructor(
    private fb: FormBuilder,
    private gameAccountService: GameAccountService,
    private authService: AuthService
  ) {
    this.changePasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.authService.getCurrentUser().subscribe({
      next: user => {
        this.accountM = user ?? null;
        if (this.accountM) {
          this.loadGameAccounts();
        } else {
          console.error('No user data found');
        }
      },
      error: err => {
        console.error('Error fetching user:', err);
        this.accountM = null;
      }
    });
  }

  ngOnInit(): void { }

  loadGameAccounts() {
    if (this.accountM?.email) {
      this.gameAccountService.getAccountsGame(this.accountM.email).subscribe({
        next: accounts => {
          this.gameAccounts = accounts || [];
          this.selectedAccount = this.gameAccounts.length ? this.gameAccounts[0] : null;
          this.currentAccountIndex = 0;
        },
        error: err => {
          console.error('Error loading game accounts:', err);
          this.gameAccounts = [];
          this.selectedAccount = null;
        }
      });
    }
  }

  // Step navigation
  nextStep() {
    if (this.canProceedToNextStep() && this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  canProceedToNextStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.selectedAccount !== null;
      case 2:
        return this.isCodeComplete();
      case 3:
        return false; // No next step after step 3
      default:
        return false;
    }
  }

  // Account selection
  nextAccount() {
    if (this.gameAccounts.length === 0) return;
    this.currentAccountIndex = (this.currentAccountIndex + 1) % this.gameAccounts.length;
    this.selectedAccount = this.gameAccounts[this.currentAccountIndex];
    this.resetFormAndCode();
  }

  previousAccount() {
    if (this.gameAccounts.length === 0) return;
    this.currentAccountIndex = this.currentAccountIndex === 0
      ? this.gameAccounts.length - 1
      : this.currentAccountIndex - 1;
    this.selectedAccount = this.gameAccounts[this.currentAccountIndex];
    this.resetFormAndCode();
  }

  resetFormAndCode() {
    // Reset form only if we're not in step 3
    if (this.currentStep !== 3) {
      this.changePasswordForm.reset();
    }
    this.emailSent = false;
    this.codeSent = false;
    this.responseMessage = '';
    this.loading = false;
    this.codeInputs = ['', '', '', '', '', ''];
  }

  // Code input handling
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

  isCodeComplete(): boolean {
    return this.codeInputs.every(code => code.trim() !== '');
  }

  getEnteredCode(): string {
    return this.codeInputs.join('');
  }

  // Email verification
  sendEmailCodeAccount() {
    this.loading = true;
    const accountName: string = this.selectedAccount?.login || '';
    this.responseMessage = '';

    this.gameAccountService.sendResetCode(accountName).subscribe({
      next: (res: any) => {
        this.emailSent = true;
        this.codeSent = true;
        this.responseMessage = res.message || 'Code sent successfully';
        this.loading = false;
      },
      error: (err: any) => {
        this.emailSent = false;
        this.codeSent = true;
        this.responseMessage = err.error?.message || 'Error sending code';
        this.loading = false;
      }
    });
  }

  resendCode() {
    this.sendEmailCodeAccount();
  }

  // Form validation
  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmNewPassword = form.get('confirmNewPassword');

    if (newPassword && confirmNewPassword && newPassword.value !== confirmNewPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  getFieldError(fieldName: string): string {
    const field = this.changePasswordForm.get(fieldName);

    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength'])
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }

    if (fieldName === 'confirmNewPassword' &&
      this.changePasswordForm.errors?.['passwordMismatch'] &&
      field?.touched) {
      return 'Passwords do not match';
    }

    return '';
  }

  // Form submission
  onSubmit() {
    if (this.changePasswordForm.valid && this.isCodeComplete() && this.selectedAccount) {
      this.isSubmitting = true;

      const newPassword = this.changePasswordForm.get('newPassword')?.value;
      const verificationCode = this.getEnteredCode();
      const accountName = this.selectedAccount.login;



      const changePasswordPayload = {
        login: accountName,
        newPassword: newPassword,
        code: verificationCode
      }


      // Uncomment this when you have the actual service method
      this.gameAccountService.changePassword(changePasswordPayload).subscribe({
        next: (response: any) => {
          this.isSubmitting = false;
          this.changePasswordForm.reset();
          this.codeInputs = ['', '', '', '', '', ''];
          const modal = new bootstrap.Modal(document.getElementById('successModal'));
          modal.show();
          // Add success message or redirect here
        },
        error: (error: any) => {
          console.error('Error changing password:', error);
          this.isSubmitting = false;
          this.responseMessage = error.error?.message || 'Error changing password';
        }
      });

    }
  }

  // Utility methods
  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  }
  toggleNewPasswordVisibility() {
    this.newPasswordVisible = !this.newPasswordVisible;
  }

  toggleConfirmNewPasswordVisibility() {
    this.confirmNewPasswordVisible = !this.confirmNewPasswordVisible;
  }
}