import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (auth.role() === 'Admin') {
    return true;
  }
  inject(MatSnackBar).open('Settings are available to Admins only.', 'Dismiss', { duration: 4000 });
  return inject(Router).createUrlTree(['/inventory']);
};
