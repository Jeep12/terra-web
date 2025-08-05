import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap, switchMap, filter, take } from 'rxjs/operators';
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
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private userDataSubject: BehaviorSubject<AccountMaster | null> = new BehaviorSubject<AccountMaster | null>(null);
  private isCheckingAuth = false; // Flag para evitar múltiples verificaciones simultáneas

  constructor(private http: HttpClient, private router: Router) { }

  login(credentials: { email: string; password: string }) {
    return this.http.post(`${environment.apiUrl}api/auth/login`, credentials, {
      withCredentials: true,
      observe: 'response'
    }).pipe(
      tap((response: any) => {
        console.log('✅ [LOGIN SUCCESS] Usuario autenticado:', credentials.email);
        this.setEmail(credentials.email);
        this.loggedIn = true;
        this.userDataSubject.next(null);

      }),
      catchError((error) => {
        console.error('❌ [LOGIN ERROR] Error:', error.status, error.message);
        return throwError(() => error);
      })
    );
  }

  register(userData: { email: string; password: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}api/auth/register`, userData);
  }

  logout() {
    return this.http.post(`${environment.apiUrl}api/auth/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        this.loggedIn = false;
        this.email = null;
        this.userDataSubject.next(null);
        this.router.navigate(['/login']);
      })
    );
  }

  // Método para refrescar el token
  refreshToken(): Observable<any> {
    if (this.isRefreshing) {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1)
      );
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    return this.http.post(`${environment.apiUrl}api/auth/refresh`, {}, {
      withCredentials: true
    }).pipe(
      take(1),
      tap((response) => {
        console.log('🔄 [REFRESH SUCCESS] Token renovado exitosamente');
        this.isRefreshing = false;
        this.refreshTokenSubject.next(response);
      }),
      catchError((error) => {
        console.error('❌ [REFRESH ERROR] Error:', error.status, error.message);
        this.isRefreshing = false;
        this.refreshTokenSubject.next(null);

        if (error.status === 401 || error.status === 403) {
          this.loggedIn = false;
          this.userDataSubject.next(null);
        }

        return throwError(() => error);
      })
    );
  }

  get isRefreshingToken(): boolean {
    return this.isRefreshing;
  }

  get refreshTokenSubject$(): Observable<any> {
    return this.refreshTokenSubject.asObservable();
  }

  get isAuthenticated(): boolean {
    return this.loggedIn;
  }

  recoveryPassword(email: string) {
    return this.http.post(`${environment.apiUrl}api/auth/resend-reset-email?email=${encodeURIComponent(email)}`, {});
  }

  resetPassword(tokenUser: string, password: string) {
    return this.http.post(
      `${environment.apiUrl}api/auth/reset-password?token=${encodeURIComponent(tokenUser)}`,
      { password },
      { withCredentials: true }
    );
  }

  getCurrentUser(): Observable<AccountMaster> {
    const cachedUser = this.userDataSubject.value;
    if (cachedUser) {
      return of(cachedUser);
    }

    return this.http.get<AccountMaster>(`${environment.apiUrl}api/auth/me`, {
      withCredentials: true
    }).pipe(
      take(1),
      tap(user => {
        console.log('✅ [AUTH SUCCESS] Usuario obtenido exitosamente:', user.email);
        this.userDataSubject.next(user);
      }),
      catchError((error: any) => {
        console.error('❌ [AUTH ERROR] Error:', error.status, error.message);

        // Manejar errores específicos
        if (error.error?.code === '2FA_REQUIRED_UNTRUSTED_DEVICE') {
          const email = this.getEmail();
          console.log('🔍 [AUTH] Redirigiendo a 2FA con email:', email);
          this.router.navigate(['/two-factor-step'], { queryParams: { email: email } });
        } else if (error.error?.code === '2FA_REQUIRED_NO_DEVICE') {
          const email = this.getEmail();
          console.log('🔍 [AUTH] Redirigiendo a 2FA con email:', email);
          this.router.navigate(['/two-factor-step'], { queryParams: { email: email } });
        } else if (error.status === 401 || error.status === 403) {
          this.userDataSubject.next(null);
        }

        return throwError(() => error);
      })
    );
  }

  isLoggedIn(): Observable<boolean> {
    console.log('🔍 [AUTH] isLoggedIn() llamado');
    console.log('🔍 [AUTH] isCheckingAuth:', this.isCheckingAuth);
    console.log('🔍 [AUTH] loggedIn local:', this.loggedIn);

    // Evitar múltiples verificaciones simultáneas
    if (this.isCheckingAuth) {
      console.log('🔍 [AUTH] Ya está verificando, devolviendo estado local:', this.loggedIn);
      return of(this.loggedIn);
    }

    // Si ya está autenticado localmente, devolver inmediatamente
    if (this.loggedIn) {
      console.log('🔍 [AUTH] Ya autenticado localmente, devolviendo true');
      return of(true);
    }

    console.log('🔍 [AUTH] Iniciando verificación de autenticación');
    this.isCheckingAuth = true;

    return this.getCurrentUser().pipe(
      take(1), // Solo tomar una emisión
      tap(() => {
        console.log('🔍 [AUTH] Verificación exitosa, estableciendo loggedIn = true');
        this.loggedIn = true;
        this.isCheckingAuth = false;
      }),
      map(() => true),
      catchError((error) => {
        console.error('🔍 [AUTH] Error en isLoggedIn:', error);
        this.isCheckingAuth = false;
        this.loggedIn = false;

        // Para errores 401/403, no hacer nada más, solo devolver false
        if (error.status === 401 || error.status === 403) {
          console.log('🔍 [AUTH] Error 401/403, devolviendo false');
          return of(false);
        }

        // Para otros errores, también devolver false
        console.log('🔍 [AUTH] Otro error, devolviendo false');
        return of(false);
      })
    );
  }

  clearUserCache() {
    this.userDataSubject.next(null);
  }

  updateAuthState(isAuthenticated: boolean) {
    this.loggedIn = isAuthenticated;
    if (!isAuthenticated) {
      this.userDataSubject.next(null);
    }
  }

  resendVerificationEmail(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}api/auth/resend-verification`, { email });
  }

  verifyEmail(token: string) {
    return this.http.get(`${environment.apiUrl}api/auth/verify-email?token=${encodeURIComponent(token)}`);
  }

  recentActivity() {
    return this.http.get<RecentActivity>(`${environment.apiUrl}api/auth/recent-activity`, {
      withCredentials: true
    });
  }

  request2FACode(email?: string) {
    console.log('🔍 [2FA SERVICE] Solicitando código 2FA para:', email);

    const payload = email ? { email: email } : {};

    return this.http.post(`${environment.apiUrl}api/auth/request-2fa-code`, payload).pipe(
      tap((response) => {
        console.log('🔍 [2FA SERVICE] Respuesta exitosa de request2FACode:', response);
      }),
      catchError((error) => {
        console.error('🔍 [2FA SERVICE] Error en request2FACode:', error);
        return throwError(() => error);
      })
    );
  }
  verify2FACode(code: string, email: string) {
    console.log('📧 Email a verificar:', email);
    console.log('🔐 Código a verificar:', code);

    const body = {
      emailRequest: {
        email: email
      },
      code: code // Ya no es parseInt, se manda como string
    };



    return this.http.post(`${environment.apiUrl}api/auth/verify-2fa-code`, body).pipe(
      tap((response) => {
        console.log('✅ Código 2FA verificado con éxito:', response);
      }),
      catchError((error) => {
        console.error('❌ Error al verificar código 2FA:', error);
        return throwError(() => error);
      })
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
    return this.http.get<TrustedDeviceDTO[]>(`${environment.apiUrl}api/auth/trusted-devices`, {
      withCredentials: true
    });
  }

  removeTrustedDevice(deviceId: string): Observable<any> {
    return this.http.post<{ message?: string, error?: string }>(
      `${environment.apiUrl}api/auth/remove-trusted-device`,
      { deviceId },
    );
  }
}
