import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { tap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn().pipe(
    tap(loggedIn => {
      if (!loggedIn) router.navigate(['/login']);
    }),
    map(loggedIn => loggedIn),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};
