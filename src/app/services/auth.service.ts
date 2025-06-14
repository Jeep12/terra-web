import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AccountMaster } from '../models/master.account.model';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedIn = false;


  constructor(private http: HttpClient) { }

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
    return this.http.get<AccountMaster>(`${environment.apiUrl}api/auth/me`, { withCredentials: true });
  }

  isLoggedIn(): Observable<boolean> {
    if (this.loggedIn) {
      return of(true);
    }
    return this.getCurrentUser().pipe(
      tap(() => this.loggedIn = true),
      map(() => true),
      catchError(() => {
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



}
