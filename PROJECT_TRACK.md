# ShelfGuard: Mini Warehouse & Team Access Dashboard

A single-workspace inventory and team-access dashboard built with **Angular 19+** (standalone components, Signals, strict TypeScript) and **Angular Material**. The app uses in-memory mock data only: no backend, no database, no login.

## 1. Goal and Audience

The developer is experienced in TypeScript, and React. The goal is to learn idiomatic Angular, not to build a production backend or write custom CSS.

Write code that avoids React habits:
- No prop-drilling. Share state through injectable services.
- No business logic in component lifecycle hooks. Put it in services and computed signals.
- No NgModules. Everything is standalone.

## 2. Tech Stack and Constraints

| Area | Requirement |
|---|---|
| Framework | Angular 19+, standalone components, `strict: true` in `tsconfig` |
| UI | Angular Material via `ng add @angular/material`, using the prebuilt `azure-blue` theme |
| Routing | Functional guards (`CanActivateFn`), lazy routes via `loadComponent` |
| State | Signals (`signal`, `computed`) for synchronous UI state. RxJS for async streams, converted with `toSignal()` where the template needs them |
| Forms | Reactive forms (`FormBuilder`, `FormArray`), `MatFormField`, `MatError`, custom async validator |
| Data | `InventoryService` and `TeamService` return `of(...).pipe(delay(300))` |
| Tests | Use the runner `ng new` generates. Unit tests for services, the guard, the SKU validator, and the status computation |

Do not add a backend, a state library (NgRx, Akita), or a CSS framework.

## 3. Domain Model

Put these in `src/app/core/models/`.

```ts
// inventory.model.ts
export type ItemCategory = 'Electronics' | 'Apparel' | 'Tools' | 'Office' | 'Food';
export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface Supplier {
  name: string;
  leadTimeDays: number; // integer >= 0
}

export interface InventoryItem {
  id: string;           // e.g. 'itm-001'
  name: string;
  sku: string;          // unique, format 'ABC-12345'
  category: ItemCategory;
  stock: number;        // integer >= 0
  suppliers: Supplier[];
}

// user.model.ts
export type Role = 'Admin' | 'Viewer';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
}
```

**Stock status rule** (a pure function, unit-tested):
- `stock === 0` gives `Out of Stock`
- `stock <= 10` gives `Low Stock`
- otherwise `In Stock`

The threshold of 10 is a constant. Export it from the model file.

## 4. Core Features

### 4.1 Global Header and Role Switcher
- `MatToolbar` with links to `/inventory`, `/inventory/new`, and `/settings`.
- A `MatSelect` with options `Admin` and `Viewer`, bound to a signal in `AuthService`.
- The default role is `Admin`.
- Changing the role updates the whole app immediately. Nothing reloads and no navigation is forced, except that a Viewer on `/settings` is redirected (see 4.4).
- The navbar and the role switcher live in `shared/components/`.

**Acceptance:** switching roles hides or shows the delete buttons without a page refresh.

### 4.2 Inventory Dashboard (`/inventory`)
- `MatTable` with columns: ID, Name, SKU, Category, Stock, Status, and Actions.
- Status is a `MatChip` styled by status. Use the `status-badge` shared component.
- Seed 18 mock items across all five categories. Include at least one of each status.
- **Search:** a `MatFormField` text input that matches name or SKU, case-insensitive.
- **Status filter:** a `MatSelect` with `All`, `In Stock`, `Low Stock`, and `Out of Stock`.
- Both controls feed one RxJS pipeline: `debounceTime(300)`, `distinctUntilChanged()`, `switchMap()` to `InventoryService.search(query, status)`. The result goes into a signal the template reads.
- Show an empty state row when no items match.
- **Actions:** each row has a delete `MatIconButton` with `aria-label`. It is rendered only when the role is `Admin`, using either a `@if` on the auth signal or the `hasRole` structural directive.
- Delete asks for confirmation with `MatDialog`, removes the item, and shows a `MatSnackBar` message.

**Acceptance:**
- Typing in search filters after about 300 ms of inactivity.
- A fast sequence of keystrokes never shows results from an older query.
- Viewers never see a delete button.

### 4.3 Add Inventory Item (`/inventory/new`)
- A `MatCard` containing a reactive form with: Name (required), SKU (required, pattern `ABC-12345`), Category (required `MatSelect`), and Initial Stock (required integer >= 0).
- **Async SKU validator:** after the user types, call `InventoryService.skuExists(sku)` with `debounceTime(400)`, then show `MatError` "SKU already exists" when it is taken. While the check is running, show a `MatProgressSpinner` suffix and disable Submit.
- **Suppliers `FormArray`:** a "+ Add Supplier" `MatButton` appends a group (supplier name, lead time in days >= 0). Each group has a remove button. Require at least one supplier.
- **Submit:** calls `InventoryService.create(...)`, shows a `MatSnackBar` confirmation, and navigates to `/inventory`.
- Submit stays disabled while the form is invalid, the SKU check is pending, or a save is in progress.
- Viewers can access this page. (Assumption. See section 8.)

**Acceptance:**
- An existing SKU shows the error and blocks submit.
- Removing all suppliers is impossible.
- A successful submit adds the item to the table on return.

### 4.4 Team and Access Settings (`/settings`)
- **Route guard:** a functional `CanActivateFn` named `roleGuard` that reads the role from `AuthService`. If the role is not `Admin`, it shows a `MatSnackBar` warning and returns a `UrlTree` redirecting to `/inventory`. Use `inject()` inside the guard.
- **Content:** a `MatTable` of 5 mock team members (name, email, role) from `TeamService`.
- The page is lazy loaded.

**Acceptance:** navigating to `/settings` as Viewer, by URL or link, redirects to `/inventory` and shows the warning.

### 4.5 Routing
- `''` redirects to `/inventory`.
- Unknown paths redirect to `/inventory`.
- All feature routes are lazy loaded with `loadComponent`.

## 5. Folder Architecture

```text
src/app/
├── core/
│   ├── guards/          role.guard.ts
│   ├── interceptors/    mock-auth.interceptor.ts   (optional, see 6)
│   ├── models/          inventory.model.ts, user.model.ts
│   └── services/        auth.service.ts, inventory.service.ts, team.service.ts
├── features/
│   ├── inventory/
│   │   ├── inventory-list/      MatTable, search, filter, delete
│   │   └── inventory-form/      reactive form, FormArray, async validator
│   └── settings/
│       └── team-settings/       admin-only team table
├── shared/
│   ├── components/      navbar/, status-badge/
│   └── directives/      has-role.directive.ts
├── app.routes.ts
├── app.config.ts
└── app.component.ts
```

Each component has its own `.ts`, `.html`, and `.spec.ts`. Keep templates in separate files.

## 6. Angular Concepts to Practice

Use these in idiomatic form, and explain each one briefly when you introduce it:
1. `inject()` for dependency injection. Components stay thin.
2. Signals with `toSignal()` to bridge RxJS and templates.
3. Standalone Material imports per component.
4. Control flow: `@if`, `@for` with `track`, `@switch`.
5. Functional guards and lazy routes.
6. Optional bonus: a functional `HttpInterceptorFn` that logs requests or adds an `X-User-Role` header. Only do this if the mock services use `HttpClient`. Otherwise skip it.

## 7. Delivery Process

Build in this order. Stop after each slice for review before starting the next:
1. Scaffold: `ng new` with routing and strict mode, `ng add @angular/material`, folder structure, models, mock services, and their unit tests.
2. Navbar and role switcher.
3. Inventory list with search, filter, and role-gated delete.
4. Add item form with async validator and `FormArray`.
5. Role guard and settings page.

For each slice, provide:
- The exact CLI commands used.
- The files created or changed.
- The tests added and their results.
- A short note on how each Angular or Material concept maps to React or MUI.

Run `ng build` and `ng test` before reporting a slice as done. Do not add dependencies beyond Angular and Angular Material without asking.

## 8. Assumptions (change if needed)
- The default role is `Admin`.
- Viewers can view the inventory and add items, but cannot delete or open settings.
- Low-stock threshold is 10.
- SKU format is `ABC-12345`.
- Mock data resets on page reload. There is no persistence.

## 9. Non-Goals
- Real authentication or authorization
- Persistence (localStorage, IndexedDB, or a backend)
- Editing existing items
- Responsive or mobile-specific design beyond what Material provides by default
- Internationalization
- Custom theming beyond the `azure-blue` preset

## 10. Definition of Done
- `ng build` passes with no errors or warnings in strict mode.
- `ng test` passes. Tests cover the status rule, SKU validator, role guard, and `AuthService` role switching.
- All acceptance criteria in section 4 are met.
- A `README.md` explains how to run the app and lists the features.
