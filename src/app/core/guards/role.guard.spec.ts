import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
  const snackBar = { open: vi.fn() };

  const runGuard = () =>
    TestBed.runInInjectionContext(() =>
      roleGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

  beforeEach(() => {
    snackBar.open.mockClear();
    TestBed.configureTestingModule({ providers: [{ provide: MatSnackBar, useValue: snackBar }] });
  });

  it('allows Admins', () => {
    TestBed.inject(AuthService).setRole('Admin');
    expect(runGuard()).toBe(true);
    expect(snackBar.open).not.toHaveBeenCalled();
  });

  it('redirects Viewers to /inventory and warns', () => {
    TestBed.inject(AuthService).setRole('Viewer');
    const result = runGuard();

    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/inventory');
    expect(snackBar.open).toHaveBeenCalledOnce();
  });
});
