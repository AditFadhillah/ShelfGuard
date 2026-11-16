import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../core/services/auth.service';
import { HasRoleDirective } from './has-role.directive';

@Component({
  imports: [HasRoleDirective],
  template: `<button *appHasRole="'Admin'">Delete</button>`,
})
class Host {}

describe('HasRoleDirective', () => {
  it('shows content for the matching role and hides it otherwise', async () => {
    const auth = TestBed.inject(AuthService);
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('button')).toBeTruthy();

    auth.setRole('Viewer');
    await fixture.whenStable();
    expect(el.querySelector('button')).toBeNull();

    auth.setRole('Admin');
    await fixture.whenStable();
    expect(el.querySelector('button')).toBeTruthy();
  });
});
