import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = TestBed.inject(AuthService);
  });

  it('defaults to Admin', () => {
    expect(service.role()).toBe('Admin');
    expect(service.isAdmin()).toBe(true);
  });

  it('switches role and updates derived state', () => {
    service.setRole('Viewer');
    expect(service.role()).toBe('Viewer');
    expect(service.isAdmin()).toBe(false);

    service.setRole('Admin');
    expect(service.isAdmin()).toBe(true);
  });
});
