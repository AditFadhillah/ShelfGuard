import { computed, Injectable, signal } from '@angular/core';
import { Role } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _role = signal<Role>('Admin');

  readonly role = this._role.asReadonly();
  readonly isAdmin = computed(() => this._role() === 'Admin');

  setRole(role: Role): void {
    this._role.set(role);
  }
}
