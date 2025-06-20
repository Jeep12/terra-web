import { HttpInterceptorFn, HttpRequest, HttpHandler } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const deviceId = localStorage.getItem('deviceId') || '';

  const authReq = req.clone({
    withCredentials: true,
    headers: req.headers.set('X-Device-Id', deviceId),
  });

  return next(authReq).pipe(
    catchError(error => {

      return throwError(() => error);
    })
  );
};
