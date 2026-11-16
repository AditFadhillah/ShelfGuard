import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatError, MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, EMPTY, startWith, switchMap } from 'rxjs';
import { InventoryService } from '../../../core/services/inventory.service';
import { integerValidator } from '../inventory-form/inventory-form.validators';

@Component({
  selector: 'app-receive-delivery',
  imports: [
    ReactiveFormsModule,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatHint,
    MatError,
    MatInput,
    MatButton,
  ],
  templateUrl: './receive-delivery.html',
  styleUrl: './receive-delivery.css',
})
export class ReceiveDelivery {
  // Filled from the :id route param thanks to withComponentInputBinding().
  readonly id = input.required<string>();

  private readonly inventory = inject(InventoryService);
  protected readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly quantity = new FormControl<number | null>(null, {
    validators: [Validators.required, Validators.min(1), integerValidator],
  });
  protected readonly saving = signal(false);
  protected readonly form = new FormGroup({ quantity: this.quantity });

  protected readonly item = toSignal(
    toObservable(this.id).pipe(
      switchMap((id) =>
        this.inventory.getById(id).pipe(
          catchError(() => {
            this.snackBar.open('Item not found', 'Dismiss', { duration: 3000 });
            this.router.navigateByUrl('/inventory');
            return EMPTY;
          }),
        ),
      ),
    ),
  );

  private readonly quantityValue = toSignal(this.quantity.valueChanges.pipe(startWith(this.quantity.value)), {
    initialValue: this.quantity.value,
  });
  private readonly quantityStatus = toSignal(this.quantity.statusChanges.pipe(startWith(this.quantity.status)), {
    initialValue: this.quantity.status,
  });

  protected readonly newStock = computed(() => {
    const item = this.item();
    const added = this.quantityValue();
    return item && this.quantityStatus() === 'VALID' && added ? item.stock + added : null;
  });
  protected readonly canSubmit = computed(
    () => !!this.item() && this.quantityStatus() === 'VALID' && !this.saving(),
  );

  protected submit(): void {
    const item = this.item();
    if (!item || !this.canSubmit()) {
      return;
    }
    this.saving.set(true);
    this.inventory.receive(item.id, this.quantity.value!).subscribe({
      next: (updated) => {
        this.snackBar.open(`Received delivery: ${updated.name} now has ${updated.stock} in stock`, 'Dismiss', {
          duration: 3000,
        });
        this.router.navigateByUrl('/inventory');
      },
      error: () => {
        this.saving.set(false);
        this.snackBar.open('Could not record the delivery', 'Dismiss', { duration: 3000 });
      },
    });
  }
}
