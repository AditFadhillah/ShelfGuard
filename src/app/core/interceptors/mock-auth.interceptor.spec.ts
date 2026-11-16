import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../services/auth.service';
import { mockAuthInterceptor } from './mock-auth.interceptor';

describe('mockAuthInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let log: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([mockAuthInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => vi.restoreAllMocks());

  it('adds the current role as X-User-Role and follows role changes', () => {
    http.get('/api/ping').subscribe();
    expect(controller.expectOne('/api/ping').request.headers.get('X-User-Role')).toBe('Admin');

    TestBed.inject(AuthService).setRole('Viewer');
    http.get('/api/ping').subscribe();
    expect(controller.expectOne('/api/ping').request.headers.get('X-User-Role')).toBe('Viewer');
  });

  it('logs the request and the response status', () => {
    http.get('/api/ping').subscribe();
    controller.expectOne('/api/ping').flush({});

    const lines = log.mock.calls.map((call: unknown[]) => String(call[0]));
    expect(lines[0]).toBe('[http] GET /api/ping as Admin');
    expect(lines[1]).toMatch(/^\[http\] GET \/api\/ping -> 200 \(\d+ms\)$/);
  });

  it('logs failures with their status', () => {
    http.get('/api/ping').subscribe({ error: () => undefined });
    controller.expectOne('/api/ping').flush('nope', { status: 404, statusText: 'Not Found' });

    expect(String(log.mock.calls.at(-1)?.[0])).toMatch(/-> 404 \(\d+ms\)$/);
  });
});
