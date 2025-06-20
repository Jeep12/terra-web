import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-two-factor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgOptimizedImage],
  templateUrl: './two-factor.component.html',
  styleUrls: ['./two-factor.component.css'],
})
export class TwoFactorComponent {
  currentStep = 1;
  emailSent = false;
  email = '';
  isError = false;
  responseMessage = '';
  loading = false;
  loadingResend = false;
  codeInputs = ['', '', '', '', '', ''];
  showNoTokenError = false;

  constructor(private authService: AuthService, private router: Router) {


  }

  isCodeIncomplete() {
    return this.codeInputs.some((val) => val === '');
  }

  send2FACode() {
    this.loading = true;
    this.responseMessage = '';
    this.isError = false;

    this.authService.request2FACode().subscribe({
      next: (response: any) => {
        this.loading = false;
        this.currentStep = 2;

        if (response?.message) {
          this.responseMessage = response.message;
          this.isError = false;
          this.emailSent = true;
        } else {
          this.responseMessage = 'Unexpected response';
          this.isError = true;
        }
      },
      error: (error) => {
        this.loading = false;
        this.isError = true;
        this.currentStep = 2;
        this.email = error.error.email;
        console.log(error)
        if (error.error.code == "NO_TOKEN") {
          this.showNoTokenError = true;
        } else if (error.error.code == "2FA_REQUIRED_NO_DEVICE") {
          alert("Please log in again to be redirected.");
          this.navigateToLogin();
          this.showNoTokenError = true;

        } else {
          this.showNoTokenError = false;
        }

        this.responseMessage = error?.error?.message || error?.error || 'Error sending code';
      }
    });
  }

  onInputChange(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const val = input.value;

    if (!/^\d?$/.test(val)) {
      input.value = '';
      this.codeInputs[index] = '';
      return;
    }

    this.codeInputs[index] = val;

    if (val && index < this.codeInputs.length - 1) {
      const nextInput = input.nextElementSibling as HTMLInputElement;
      if (nextInput) nextInput.focus();
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

  verify2FACode() {
    const code = this.codeInputs.join('');
    if (this.isCodeIncomplete()) {
      this.isError = true;
      this.responseMessage = 'Please enter the 6-digit code';
      return;
    }

    // Crear deviceId si no existe
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = this.generateUUID();
      localStorage.setItem('deviceId', deviceId);
    }

    this.loading = true;
    this.responseMessage = '';
    this.isError = false;

    this.authService.verify2FACode(code).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.responseMessage = res.message || 'Code verified successfully!';
        this.isError = false;
        // redirigir o lo que necesites acá
      },
      error: (err) => {
        this.loading = false;
        this.isError = true;
        this.responseMessage = err.error?.message || 'Invalid 2FA code, try again.';
      }
    });
  }

  // Función simple para crear UUID (v4-like)
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }




  goBackToEmail() {
    this.currentStep = 1;
    this.responseMessage = '';
    this.isError = false;
    this.codeInputs = ['', '', '', '', '', ''];
  }

  resendCode() {
    if (this.loadingResend) return;
    this.loadingResend = true;
    this.responseMessage = '';
    this.isError = false;

    setTimeout(() => {
      this.loadingResend = false;
      this.responseMessage = '2FA code resent to ' + this.email;
    }, 1500);
  }


  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
