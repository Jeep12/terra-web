import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


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

}
