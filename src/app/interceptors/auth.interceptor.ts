import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap, filter, take, finalize } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ENDPOINT_CONFIG, type EndpointType } from '../config/endpoint-config';

// Función para verificar si una URL coincide con un patrón
function matchesPattern(url: string, patterns: readonly string[]): boolean {
  return patterns.some(pattern => url.includes(pattern));
}

// Función para verificar si una URL es de un dominio externo
function isExternalDomain(url: string): boolean {
  return ENDPOINT_CONFIG.EXTERNAL_DOMAINS.some((domain: string) => url.includes(domain));
}

// Función para determinar el tipo de endpoint
function getEndpointType(url: string): EndpointType {
  // Verificar si es dominio externo
  if (isExternalDomain(url)) {
    return 'PUBLIC';
  }
  
  // Verificar si es endpoint público
  if (matchesPattern(url, [...ENDPOINT_CONFIG.PUBLIC]) || 
      matchesPattern(url, [...ENDPOINT_CONFIG.PUBLIC_PATTERNS])) {
    return 'PUBLIC';
  }
  
  // Verificar si requiere manejo especial
  if (matchesPattern(url, [...ENDPOINT_CONFIG.SPECIAL_HANDLING])) {
    return 'SPECIAL';
  }
  
  // Por defecto, es protegido
  return 'PROTECTED';
}

// Función para determinar si se debe intentar refresh
function shouldAttemptRefresh(url: string, errorCode?: string): boolean {
  const endpointType = getEndpointType(url);
  
  // NO hacer refresh para endpoints públicos o especiales
  if (endpointType === 'PUBLIC' || endpointType === 'SPECIAL') {
    return false;
  }
  
  // NO hacer refresh para errores específicos que indican problemas de autenticación
  if (errorCode && ENDPOINT_CONFIG.NON_REFRESHABLE_ERRORS.includes(errorCode as any)) {
    return false;
  }
  
  // Para endpoints protegidos, intentar refresh
  return true;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  const deviceId = localStorage.getItem('deviceId') || '';
  const isExternal = isExternalDomain(req.url);
  const endpointType = getEndpointType(req.url);

  // Preparar headers
  let headers = req.headers;
  
  // Agregar device ID si no es dominio externo
  if (!isExternal) {
    headers = headers.set('X-Device-Id', deviceId);
  }

  const authReq = req.clone({
    withCredentials: !isExternal,
    headers: headers,
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Para endpoints de autenticación, manejar errores 401/403 de forma silenciosa
      if (req.url.includes('/api/auth/me') && (error.status === 401 || error.status === 403)) {
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

      // Manejar errores 401/403
      if (error.status === 401 || error.status === 403) {
        const errorCode = error.error?.code;

        // Manejar errores específicos que requieren acciones especiales
        switch (errorCode) {
          case 'TOKEN_EXPIRED':
            // Token expirado, intentar refresh
            return handleTokenRefresh(req, next, authService, router);
            
          case '2FA_REQUIRED_UNTRUSTED_DEVICE':
            // 2FA requerido, dejar que el AuthService maneje la redirección
            return throwError(() => error);
            
          case 'REFRESH_TOKEN_EXPIRED':
            // Refresh token expirado, hacer logout
            authService.logout().subscribe(() => {
              router.navigate(['/login']);
            });
            return throwError(() => error);
            
          default:
            // Para otros errores, verificar si se debe intentar refresh
            if (shouldAttemptRefresh(req.url, errorCode)) {
              return handleTokenRefresh(req, next, authService, router);
            }
            // Si no se debe hacer refresh, dejar que el error llegue al componente
            return throwError(() => error);
        }
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
        return retryRequest(originalReq, next);
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
      return retryRequest(originalReq, next);
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

// Función auxiliar para reintentar requests con headers actualizados
function retryRequest(originalReq: HttpRequest<any>, next: HttpHandlerFn) {
  const deviceId = localStorage.getItem('deviceId') || '';
  const isExternal = isExternalDomain(originalReq.url);
  let headers = originalReq.headers;
  
  if (!isExternal) {
    headers = headers.set('X-Device-Id', deviceId);
  }
  
  const updatedReq = originalReq.clone({
    withCredentials: !isExternal,
    headers: headers,
  });
  
  return next(updatedReq);
}