import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inventory' },
  {
    path: 'inventory',
    loadComponent: () =>
      import('./features/inventory/inventory-list/inventory-list').then((m) => m.InventoryList),
  },
  {
    path: 'inventory/new',
    loadComponent: () =>
      import('./features/inventory/inventory-form/inventory-form').then((m) => m.InventoryForm),
  },
  {
    path: 'inventory/:id/receive',
    loadComponent: () =>
      import('./features/inventory/receive-delivery/receive-delivery').then((m) => m.ReceiveDelivery),
  },
  {
    path: 'settings',
    canActivate: [roleGuard],
    loadComponent: () =>
      import('./features/settings/team-settings/team-settings').then((m) => m.TeamSettings),
  },
  { path: '**', redirectTo: 'inventory' },
];
