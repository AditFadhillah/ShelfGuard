import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { map, timer } from 'rxjs';
import { MockBackend } from '../mock/mock-backend';

export const MOCK_LATENCY_MS = 300;

// Terminal interceptor: answers /api/* itself and never calls next(), so no real request leaves the browser.
export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) {
    return next(req);
  }
  const backend = inject(MockBackend);
  // Work runs after the delay, so a cancelled request (switchMap) never changes the data.
  return timer(MOCK_LATENCY_MS).pipe(map(() => backend.handle(req)));
};
