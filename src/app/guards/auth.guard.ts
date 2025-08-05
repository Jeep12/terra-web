
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { tap, map, catchError, take } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🔍 [GUARD] authGuard ejecutado para ruta:', state.url);
  console.log('🔍 [GUARD] Estado local de autenticación:', authService.isAuthenticated);

  // Usar el estado local primero para evitar llamadas innecesarias
  if (authService.isAuthenticated) {
    console.log('🔍 [GUARD] Ya autenticado localmente, permitiendo acceso');
    return of(true);
  }

  console.log('🔍 [GUARD] No autenticado localmente, verificando con servidor');
  return authService.isLoggedIn().pipe(
    take(1), // Solo tomar una emisión para evitar loops
    tap(loggedIn => {
      console.log('🔍 [GUARD] Resultado de isLoggedIn:', loggedIn);
      if (!loggedIn) {
        console.log('🔍 [GUARD] No autenticado, redirigiendo a login');
        router.navigate(['/login']);
      } else {
        console.log('🔍 [GUARD] Autenticado, permitiendo acceso');
      }
    }),
    map(loggedIn => loggedIn),
    catchError((error) => {
      console.error('🔍 [GUARD] Error en guard:', error);
      // En caso de error, redirigir al login y devolver false
      router.navigate(['/login']);
      return of(false);
    })
  );
};
