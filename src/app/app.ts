import { Component, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { Navbar } from './shared/components/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor() {
    const auth = inject(AuthService);
    const router = inject(Router);

    // Re-running the same URL triggers the route guards, so a Viewer on /settings gets bounced.
    effect(() => {
      if (auth.role() !== 'Admin' && router.url.startsWith('/settings')) {
        router.navigateByUrl(router.url, { onSameUrlNavigation: 'reload' });
      }
    });
  }
}
