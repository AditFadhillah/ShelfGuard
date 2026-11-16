# ShelfGuard

A mini warehouse and team-access dashboard built with Angular 21 (standalone components, Signals, strict TypeScript) and Angular Material. All data is in memory and resets on reload: no backend, no login.

## Run

```bash
npm install
npm start        # http://localhost:4200
npm test         # unit tests (Vitest)
npm run build    # production build
```

Requires Node.js 20+ and the Angular CLI (`npm i -g @angular/cli`) if you want to use `ng` directly.

## Features

- **Role switcher** in the toolbar (Admin / Viewer). Switching updates the whole app instantly.
- **Inventory** (`/inventory`): 18 seeded items, search by name or SKU (debounced), status filter, status chips, and an Admin-only delete with confirmation dialog and snackbar.
- **Add item** (`/inventory/new`): reactive form with an async "SKU already exists" check, a dynamic suppliers list (at least one required), and a snackbar on success.
- **Receive delivery** (`/inventory/:id/receive`): a truck icon on each row opens a form to add a received quantity to an existing item, with a live preview of the new stock level. Open to Admins and Viewers.
- **Settings** (`/settings`): lazy-loaded team table, protected by a functional `roleGuard`. Viewers are redirected to `/inventory` with a warning.

## Assumptions

- Default role is Admin. Viewers can view and add items, but cannot delete or open settings.
- Low-stock threshold is 10 (`LOW_STOCK_THRESHOLD`). SKU format is `ABC-12345`.
- Services use `HttpClient` against `/api/*`. No real request is sent: `mockBackendInterceptor` answers from in-memory data after a 300 ms delay, and `mockAuthInterceptor` adds an `X-User-Role` header and logs each request (method, URL, status, duration) to the browser console. The mock backend returns 403 when a non-Admin deletes.

## Layout

```text
src/app/
  core/      models, mock data, services (auth, inventory, team), http interceptors, mock backend, role guard
  features/  inventory (list, form, receive-delivery), settings (team-settings)
  shared/    navbar (with role switcher), status-badge, confirm-dialog, has-role directive
```
