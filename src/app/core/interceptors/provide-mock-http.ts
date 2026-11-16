import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { mockAuthInterceptor } from './mock-auth.interceptor';
import { mockBackendInterceptor } from './mock-backend.interceptor';

// Order matters: the header/logging interceptor wraps the mock backend, which ends the chain.
export const provideMockHttp = () =>
  provideHttpClient(withInterceptors([mockAuthInterceptor, mockBackendInterceptor]));
