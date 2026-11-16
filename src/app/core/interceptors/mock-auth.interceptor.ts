import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const mockAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const role = inject(AuthService).role();
  const started = performance.now();
  const label = `[http] ${req.method} ${req.url}`;
  const elapsed = () => Math.round(performance.now() - started);

  console.log(`${label} as ${role}`);

  return next(req.clone({ setHeaders: { 'X-User-Role': role } })).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          console.log(`${label} -> ${event.status} (${elapsed()}ms)`);
        }
      },
      error: (error: HttpErrorResponse) => console.log(`${label} -> ${error.status} (${elapsed()}ms)`),
    }),
  );
};
