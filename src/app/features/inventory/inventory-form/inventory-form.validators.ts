import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { map, Observable, switchMap, timer } from 'rxjs';
import { InventoryService } from '../../../core/services/inventory.service';

export const SKU_DEBOUNCE_MS = 400;

// Angular unsubscribes the previous run when the value changes, so timer() + switchMap acts as a debounce.
export function skuUniqueValidator(inventory: InventoryService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> =>
    timer(SKU_DEBOUNCE_MS).pipe(
      switchMap(() => inventory.skuExists(String(control.value ?? ''))),
      map((exists) => (exists ? { skuTaken: true } : null)),
    );
}

export const integerValidator: ValidatorFn = (control) =>
  control.value === null || control.value === '' || Number.isInteger(control.value)
    ? null
    : { integer: true };
