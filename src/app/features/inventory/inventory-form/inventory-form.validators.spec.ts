import { FormControl } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, isObservable, of } from 'rxjs';
import { InventoryService } from '../../../core/services/inventory.service';
import { provideMockHttp } from '../../../core/interceptors/provide-mock-http';
import { integerValidator, skuUniqueValidator } from './inventory-form.validators';

describe('skuUniqueValidator', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    TestBed.configureTestingModule({ providers: [provideMockHttp()] });
  });

  afterEach(() => vi.restoreAllMocks());

  const validate = async (sku: string) => {
    const validator = skuUniqueValidator(TestBed.inject(InventoryService));
    const result = validator(new FormControl(sku));
    return firstValueFrom(isObservable(result) ? result : of(null));
  };

  it('flags an existing SKU', async () => {
    expect(await validate('ELE-10001')).toEqual({ skuTaken: true });
  });

  it('accepts a new SKU', async () => {
    expect(await validate('NEW-00001')).toBeNull();
  });
});

describe('integerValidator', () => {
  it('accepts whole numbers and empty values', () => {
    expect(integerValidator(new FormControl(3))).toBeNull();
    expect(integerValidator(new FormControl(null))).toBeNull();
  });

  it('rejects decimals', () => {
    expect(integerValidator(new FormControl(2.5))).toEqual({ integer: true });
  });
});
