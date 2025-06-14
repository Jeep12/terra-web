import { HttpInterceptorFn, HttpRequest, HttpHandler } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const authReq = req.clone({
    withCredentials: true,
  });

  return next(authReq).pipe(
    catchError(error => {
      const ignore401Paths = [
        '/account-game/reset-password'
      ];

      const shouldIgnore = error.status === 401 && ignore401Paths.some(path => req.url.includes(path));

      if (error.status === 401 && !shouldIgnore) {

      }

      return throwError(() => error);
    })
  );
};
