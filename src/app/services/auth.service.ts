import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AccountMaster } from '../models/master.account.model';
import { RecentActivity } from '../models/recent.activity.model';
import { Router } from '@angular/router';
import { TrustedDeviceDTO } from '../models/trusted.device.model';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = false;
  private email: String | any;

  constructor(private http: HttpClient, private router: Router) { }

  login(credentials: { email: string; password: string }) {
    return this.http.post(`${environment.apiUrl}api/auth/login`, credentials, { withCredentials: true });
  }
  register(userData: { email: string; password: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}api/auth/register`, userData);
  }

  logout() {
    return this.http.post(`${environment.apiUrl}api/auth/logout`, {}, { withCredentials: true });
  }
  recoveryPassword(email: string) {
    return this.http.post(`${environment.apiUrl}api/auth/resend-reset-email?email=${encodeURIComponent(email)}`, {});
  }

  resetPassword(tokenUser: string, password: string) {
    return this.http.post(
      `${environment.apiUrl}api/auth/reset-password?token=${encodeURIComponent(tokenUser)}`,
      { password }, // el body
      { withCredentials: true } // la cookie va sola si está seteada
    );
  }


  getCurrentUser(): Observable<AccountMaster> {
    return this.http.get<AccountMaster>(`${environment.apiUrl}api/auth/me`, { withCredentials: true })
      .pipe(
        catchError((error: any) => {
          if (error.status === 401) {
            if (error.error?.message?.includes('2FA requerido')) {
              this.router.navigate(['/two-factor-step']);
              return throwError(() => new Error('2FA required'));
            }
            if (error.error.code === "2FA_REQUIRED_UNTRUSTED_DEVICE") {
              this.router.navigate(['/two-factor-step']);
              return throwError(() => new Error('2FA required'));


            }
          }
          return throwError(() => error);
        })
      );
  }


  isLoggedIn(): Observable<boolean> {
    if (this.loggedIn) {
      return of(true);
    }

    return this.getCurrentUser().pipe(
      tap(() => this.loggedIn = true),
      map(() => true),
      catchError((error) => {
        console.warn('[isLoggedIn] Error:', error);

        if (error.status === 401 && error.error?.code === "2FA_REQUIRED_NO_DEVICE") {
          this.router.navigate(['/two-factor-step']);
          return of(false);
        }

        this.loggedIn = false;
        return of(false);
      })
    );
  }


  resendVerificationEmail(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}api/auth/resend-verification`, { email });
  }
  verifyEmail(token: string) {
    return this.http.get(`${environment.apiUrl}api/auth/verify-email?token=${encodeURIComponent(token)}`);
  }

  recentActivity() {
    return this.http.get<RecentActivity>(`${environment.apiUrl}api/auth/recent-activity`, { withCredentials: true });
  }

  // Pide el código 2FA (request-2fa-code)
  request2FACode() {
    return this.http.post(`${environment.apiUrl}api/auth/request-2fa-code`, {}, { withCredentials: true });
  }

  verify2FACode(code: string) {
    return this.http.post(
      `${environment.apiUrl}api/auth/verify-2fa-code?code=${encodeURIComponent(code)}`,
      {},  // body vacío porque el código va por query param
      { withCredentials: true }
    );
  }

  toggle2FA(enabled: boolean) {
    return this.http.post(
      `${environment.apiUrl}api/auth/2fa/toggle`,
      { enabled },
      { withCredentials: true }
    );
  }



  setEmail(email: string) {
    this.email = email;
  }
  getEmail(): string {
    return this.email;
  }

  getTrustedDevices(): Observable<TrustedDeviceDTO[]> {
    return this.http.get<TrustedDeviceDTO[]>(`${environment.apiUrl}api/auth/trusted-devices`, { withCredentials: true });
  }

  removeTrustedDevice(deviceId: string): Observable<any> {
    return this.http.post<{ message?: string, error?: string }>(
      `${environment.apiUrl}api/auth/remove-trusted-device`,
      { deviceId },

    );
  }


}
