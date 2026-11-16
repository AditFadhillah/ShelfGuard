import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher, MatOption } from '@angular/material/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatError, MatFormField, MatHint, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { startWith } from 'rxjs';
import { ITEM_CATEGORIES, ItemCategory, SKU_PATTERN } from '../../../core/models/inventory.model';
import { InventoryService } from '../../../core/services/inventory.service';
import { integerValidator, skuUniqueValidator } from './inventory-form.validators';

@Component({
  selector: 'app-inventory-form',
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
    MatSuffix,
    MatInput,
    MatSelect,
    MatOption,
    MatButton,
    MatIconButton,
    MatIcon,
    MatProgressSpinner,
  ],
  providers: [{ provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }],
  templateUrl: './inventory-form.html',
  styleUrl: './inventory-form.css',
})
export class InventoryForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly inventory = inject(InventoryService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly categories = ITEM_CATEGORIES;
  protected readonly saving = signal(false);

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    sku: this.fb.control('', {
      validators: [Validators.required, Validators.pattern(SKU_PATTERN)],
      asyncValidators: [skuUniqueValidator(this.inventory)],
    }),
    category: this.fb.control<ItemCategory | null>(null, Validators.required),
    stock: this.fb.control<number | null>(null, [Validators.required, Validators.min(0), integerValidator]),
    suppliers: this.fb.array([this.createSupplier()], Validators.minLength(1)),
  });

  // FormControl state is not a signal; statusChanges -> toSignal makes it work with zoneless change detection.
  private readonly formStatus = toSignal(this.form.statusChanges.pipe(startWith(this.form.status)), {
    initialValue: this.form.status,
  });
  private readonly skuStatus = toSignal(
    this.form.controls.sku.statusChanges.pipe(startWith(this.form.controls.sku.status)),
    { initialValue: this.form.controls.sku.status },
  );

  protected readonly skuPending = computed(() => this.skuStatus() === 'PENDING');
  protected readonly canSubmit = computed(() => this.formStatus() === 'VALID' && !this.saving());

  protected get suppliers() {
    return this.form.controls.suppliers;
  }

  protected addSupplier(): void {
    this.suppliers.push(this.createSupplier());
  }

  protected removeSupplier(index: number): void {
    if (this.suppliers.length > 1) {
      this.suppliers.removeAt(index);
    }
  }

  protected submit(): void {
    if (!this.canSubmit()) {
      return;
    }
    const { name, sku, category, stock, suppliers } = this.form.getRawValue();
    this.saving.set(true);
    this.inventory
      .create({
        name,
        sku,
        category: category!,
        stock: stock!,
        suppliers: suppliers.map((s) => ({ name: s.name, leadTimeDays: s.leadTimeDays! })),
      })
      .subscribe({
        next: (item) => {
          this.snackBar.open(`Added ${item.name}`, 'Dismiss', { duration: 3000 });
          this.router.navigateByUrl('/inventory');
        },
        error: () => {
          this.saving.set(false);
          this.snackBar.open('Could not save the item', 'Dismiss', { duration: 3000 });
        },
      });
  }

  private createSupplier() {
    return this.fb.group({
      name: ['', Validators.required],
      leadTimeDays: this.fb.control<number | null>(null, [
        Validators.required,
        Validators.min(0),
        integerValidator,
      ]),
    });
  }
}
