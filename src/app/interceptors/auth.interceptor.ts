 import { HttpInterceptorFn, HttpRequest, HttpHandler } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const deviceId = localStorage.getItem('deviceId') || '';
  const isWebhookN8n = req.url.includes('n8n.l2terra.online');
  const isAuthEndpoint = req.url.includes('/api/auth/me');

  // Si es webhook, no agregues header ni credenciales
  const headers = isWebhookN8n
    ? req.headers
    : req.headers.set('X-Device-Id', deviceId);

  const authReq = req.clone({
    withCredentials: !isWebhookN8n,
    headers: headers,
  });

  return next(authReq).pipe(
    catchError(error => {
      // Silenciar errores de autenticación para evitar spam en consola
      if (isAuthEndpoint && (error.status === 401 || error.status === 403)) {
        // Crear un error silencioso que no aparezca en la consola
        const silentError = new Error();
        silentError.name = 'SilentAuthError';
        silentError.message = error.message;
        silentError.stack = error.stack;
        
        // Preservar la información del error original pero sin mostrarlo en consola
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
      
      // Para otros errores, mantener el comportamiento normal
      return throwError(() => error);
    })
  );
};
