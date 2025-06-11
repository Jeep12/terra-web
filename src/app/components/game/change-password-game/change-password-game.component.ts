import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from "@angular/forms";
import { AccountGameResponse } from '../../../models/game.account.model';
import { GameAccountService } from '../../../services/game-account.service';
import { AccountMaster } from '../../../models/master.account.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-change-password-game',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule], // Agregamos FormsModule para ngModel
  templateUrl: './change-password-game.component.html',
  styleUrls: ['./change-password-game.component.css']
})
export class ChangePasswordGameComponent implements OnInit {
  // Reactive Form para password
  changePasswordForm: FormGroup;
  isSubmitting = false;

  // ngModel para códigos
  codeInputs = ['', '', '', '', '', '']; // Array para los 6 códigos

  gameAccounts: AccountGameResponse[] = [];
  selectedAccount: AccountGameResponse | null = null;
  accountM: AccountMaster | any = null;
  currentAccountIndex = 0;
  responseMessage = '';
  emailSent = false;
  loading = false;

  constructor(private fb: FormBuilder, private gameAccountService: GameAccountService, private authService: AuthService) {
    // Solo creamos el form para las contraseñas
    this.changePasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }
  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: user => {
        this.accountM = user ?? null;
        if (this.accountM) {

          // Ahora que tenemos usuario, pedimos las cuentas:
          this.gameAccountService.getAccountsGame(this.accountM.email).subscribe(accounts => {
            this.gameAccounts = accounts || [];
            this.selectedAccount = this.gameAccounts.length ? this.gameAccounts[0] : null;
            this.currentAccountIndex = 0;
          });


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


  passwordMatchValidator(form: FormGroup) {
    const newPass = form.get('newPassword');
    const confirmPass = form.get('confirmNewPassword');
    if (newPass && confirmPass && newPass.value !== confirmPass.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  nextAccount() {
    if (this.gameAccounts.length === 0) return;
    this.currentAccountIndex = (this.currentAccountIndex + 1) % this.gameAccounts.length;
    this.selectedAccount = this.gameAccounts[this.currentAccountIndex];
    this.resetFormAndCode();
  }

  previousAccount() {
    if (this.gameAccounts.length === 0) return;
    this.currentAccountIndex = this.currentAccountIndex === 0 ? this.gameAccounts.length - 1 : this.currentAccountIndex - 1;
    this.selectedAccount = this.gameAccounts[this.currentAccountIndex];
    this.resetFormAndCode();
  }

  resetFormAndCode() {
    this.changePasswordForm.reset();
    this.emailSent = false;
    this.responseMessage = '';
    this.loading = false;
    // Limpiamos los códigos
    this.codeInputs = ['', '', '', '', '', ''];
  }

  onSubmit() {
    // Obtenemos el código de los inputs con ngModel
    const code = this.codeInputs.join('');
    const password = this.changePasswordForm.get('newPassword')?.value;
    const accountName = this.selectedAccount?.login;

    // Mostramos por consola como solicitaste
    console.log('Password:', password);
    console.log('Code:', code);
    console.log('Account:', accountName);

    if (!code || code.length < 6 || code.includes('')) {
      this.responseMessage = 'Enter the 6-digit code.';
      return;
    }

    if (this.changePasswordForm.valid && this.selectedAccount) {
      this.isSubmitting = true;

      setTimeout(() => {
        this.isSubmitting = false;
        this.changePasswordForm.reset();
        this.codeInputs = ['', '', '', '', '', ''];
        this.responseMessage = 'Password changed successfully.';
      }, 2000);
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.changePasswordForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `Password must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    if (fieldName === 'confirmNewPassword' && this.changePasswordForm.errors?.['passwordMismatch'] && field?.touched) {
      return 'Passwords do not match';
    }
    return '';
  }

  formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  }

  sendEmailCodeAccount(): void {
    this.loading = true;
    const accountName: string = this.selectedAccount?.login || '';
    this.responseMessage = '';

    this.gameAccountService.sendResetCode(accountName).subscribe({
      next: (res: any) => {
        this.emailSent = true;
        this.responseMessage = res.message;
        this.loading = false;
      },
      error: (err: any) => {
        this.emailSent = false;
        this.responseMessage = err.error?.message;
        this.loading = false;
      }
    });
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






}
