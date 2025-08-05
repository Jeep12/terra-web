import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap, filter, take, finalize } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  const deviceId = localStorage.getItem('deviceId') || '';
  const isWebhookN8n = req.url.includes('n8n.l2terra.online');
  const isAuthEndpoint = req.url.includes('/api/auth/me');
  const is2FAEndpoint = req.url.includes('/api/auth/request-2fa-code') || req.url.includes('/api/auth/verify-2fa-code');
  const isRefreshEndpoint = req.url.includes('/api/auth/refresh');
  const isPublicEndpoint = req.url.includes('/api/auth/login') || 
                         req.url.includes('/api/auth/register') ||
                         req.url.includes('/api/auth/resend-reset-email') ||
                         req.url.includes('/api/auth/reset-password') ||
                         req.url.includes('/api/auth/verify-email') ||
                         req.url.includes('/api/auth/resend-verification') ||
                         req.url.includes('/api/auth/google/login') ||
                         req.url.includes('/api/auth/request-2fa-code') ||
                         req.url.includes('/api/auth/verify-2fa-code') ||
                         req.url.includes('/api/kick/channels') ||
                         req.url.includes('/api/game/ranking/top-pvp') ||
                         req.url.includes('/api/game/ranking/top-pk');

  // Preparar headers
  let headers = req.headers;
  
  // Agregar device ID si no es webhook
  if (!isWebhookN8n) {
    headers = headers.set('X-Device-Id', deviceId);
  }

  const authReq = req.clone({
    withCredentials: !isWebhookN8n,
    headers: headers,
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Para endpoints de autenticación, manejar errores 401/403 de forma silenciosa
      if (isAuthEndpoint && (error.status === 401 || error.status === 403)) {
        const silentError = new Error();
        silentError.name = 'SilentAuthError';
        silentError.message = error.message;
        
        Object.defineProperty(silentError, 'status', {
          value: error.status,
          writable: false
        });
        Object.defineProperty(silentError, 'error', {
          value: error.error,
          writable: false
        });
        
        return throwError(() => silentError);
      }

      // Manejar errores específicos
      if (error.status === 401) {
        const errorCode = error.error?.code;

        // Si es TOKEN_EXPIRED, hacer refresh automático
        if (errorCode === 'TOKEN_EXPIRED') {
          return handleTokenRefresh(req, next, authService, router);
        }

        // Si es 2FA_REQUIRED_UNTRUSTED_DEVICE, redirigir a 2FA
        if (errorCode === '2FA_REQUIRED_UNTRUSTED_DEVICE') {
          // La redirección la maneja el AuthService en getCurrentUser
          return throwError(() => error);
        }

        // Si es REFRESH_TOKEN_EXPIRED, hacer logout
        if (errorCode === 'REFRESH_TOKEN_EXPIRED') {
          authService.logout().subscribe(() => {
            router.navigate(['/login']);
          });
          return throwError(() => error);
        }

        // Para otros errores 401, intentar refresh si no es un endpoint de refresh
        if (!isRefreshEndpoint && !is2FAEndpoint) {
          return handleTokenRefresh(req, next, authService, router);
        }
      }

      // Para errores 403, también intentar refresh si no es endpoint de refresh
      if (error.status === 403 && !isRefreshEndpoint && !is2FAEndpoint) {
        return handleTokenRefresh(req, next, authService, router);
      }
      
      // Para otros errores, mantener el comportamiento normal
      return throwError(() => error);
    })
  );
};

// Función para manejar el refresh de tokens
function handleTokenRefresh(
  originalReq: HttpRequest<any>, 
  next: HttpHandlerFn, 
  authService: AuthService,
  router: Router
) {
  console.log('🔄 [REFRESH] Iniciando refresh para:', originalReq.url);
  
  // Si ya está refrescando, esperar a que termine
  if (authService.isRefreshingToken) {
    console.log('🔄 [REFRESH] Ya está refrescando, esperando...');
    return authService.refreshTokenSubject$.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(() => {
        console.log('🔄 [REFRESH] Reintentando request después del refresh:', originalReq.url);
        // Clonar el request original con los headers actualizados
        const deviceId = localStorage.getItem('deviceId') || '';
        let headers = originalReq.headers;
        
        if (!originalReq.url.includes('n8n.l2terra.online')) {
          headers = headers.set('X-Device-Id', deviceId);
        }
        
        const updatedReq = originalReq.clone({
          withCredentials: !originalReq.url.includes('n8n.l2terra.online'),
          headers: headers,
        });
        
        return next(updatedReq);
      }),
      catchError((error) => {
        console.error('🔄 [REFRESH] Error en reintento:', error.status, error.message);
        return throwError(() => error);
      })
    );
  }

  // Iniciar refresh
  console.log('🔄 [REFRESH] Iniciando nuevo refresh');
  return authService.refreshToken().pipe(
    switchMap((response) => {
      console.log('🔄 [REFRESH] Refresh exitoso, reintentando:', originalReq.url);
      // Clonar el request original con los headers actualizados
      const deviceId = localStorage.getItem('deviceId') || '';
      let headers = originalReq.headers;
      
      if (!originalReq.url.includes('n8n.l2terra.online')) {
        headers = headers.set('X-Device-Id', deviceId);
      }
      
      const updatedReq = originalReq.clone({
        withCredentials: !originalReq.url.includes('n8n.l2terra.online'),
        headers: headers,
      });
      
      return next(updatedReq);
    }),
    catchError((error) => {
      console.error('🔄 [REFRESH] Error en refresh:', error.status, error.message);
      // Si el refresh falla, hacer logout
      if (error.status === 401 || error.status === 403) {
        authService.logout().subscribe(() => {
          router.navigate(['/login']);
        });
      }
      
      return throwError(() => error);
    }),
    finalize(() => {
      console.log('🔄 [REFRESH] Proceso de refresh finalizado');
    })
  );
}