import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import {
  getStockStatus,
  InventoryItem,
  STOCK_FILTERS,
  StockFilter,
} from '../../../core/models/inventory.model';
import { InventoryService } from '../../../core/services/inventory.service';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { HasRoleDirective } from '../../../shared/directives/has-role.directive';

@Component({
  selector: 'app-inventory-list',
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatIconButton,
    MatIcon,
    RouterLink,
    StatusBadge,
    HasRoleDirective,
  ],
  templateUrl: './inventory-list.html',
  styleUrl: './inventory-list.css',
})
export class InventoryList {
  private readonly inventory = inject(InventoryService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly columns = ['id', 'name', 'sku', 'category', 'stock', 'status', 'actions'];
  protected readonly statusFilters = STOCK_FILTERS;
  protected readonly statusOf = getStockStatus;

  protected readonly query = new FormControl('', { nonNullable: true });
  protected readonly status = new FormControl<StockFilter>('All', { nonNullable: true });
  protected readonly loading = signal(true);

  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  // One pipeline: both controls -> debounce -> dedupe -> switchMap (drops stale responses) -> signal.
  private readonly filters$ = combineLatest([
    this.query.valueChanges.pipe(startWith(this.query.value)),
    this.status.valueChanges.pipe(startWith(this.status.value)),
  ]).pipe(
    debounceTime(300),
    startWith<[string, StockFilter]>([this.query.value, this.status.value]),
    distinctUntilChanged(([q1, s1], [q2, s2]) => q1 === q2 && s1 === s2),
  );

  protected readonly items = toSignal(
    combineLatest([this.filters$, this.refresh$]).pipe(
      tap(() => this.loading.set(true)),
      switchMap(([[query, status]]) => this.inventory.search(query, status)),
      tap(() => this.loading.set(false)),
    ),
    { initialValue: [] as InventoryItem[] },
  );

  protected confirmDelete(item: InventoryItem): void {
    this.dialog
      .open(ConfirmDialog, {
        data: {
          title: 'Delete item?',
          message: `"${item.name}" (${item.sku}) will be removed from the inventory.`,
          confirmLabel: 'Delete',
        },
      })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() => this.inventory.delete(item.id)),
      )
      .subscribe(() => {
        this.snackBar.open(`Deleted ${item.name}`, 'Dismiss', { duration: 3000 });
        this.refresh$.next();
      });
  }
}
