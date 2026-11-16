import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Navbar } from './navbar';

describe('Navbar', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('links to the three pages', async () => {
    const fixture = TestBed.createComponent(Navbar);
    await fixture.whenStable();

    const hrefs = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('a')).map((a) =>
      a.getAttribute('href'),
    );
    expect(hrefs).toEqual(['/inventory', '/inventory/new', '/settings']);
  });

  it('reflects the current role in the select', async () => {
    const auth = TestBed.inject(AuthService);
    const fixture = TestBed.createComponent(Navbar);
    await fixture.whenStable();
    const select = (fixture.nativeElement as HTMLElement).querySelector('mat-select')!;
    expect(select.textContent).toContain('Admin');

    auth.setRole('Viewer');
    await fixture.whenStable();
    expect(select.textContent).toContain('Viewer');
  });
});
