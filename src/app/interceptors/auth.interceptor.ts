 import { HttpInterceptorFn, HttpRequest, HttpHandler } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const deviceId = localStorage.getItem('deviceId') || '';
  const isWebhookN8n = req.url.includes('n8n.l2terra.online');

  // Si es webhook, no agregues header ni credenciales
  const headers = isWebhookN8n
    ? req.headers
    : req.headers.set('X-Device-Id', deviceId);

  const authReq = req.clone({
    withCredentials: !isWebhookN8n,
    headers: headers,
  });

  return next(authReq).pipe(
    catchError(error => throwError(() => error))
  );
};
