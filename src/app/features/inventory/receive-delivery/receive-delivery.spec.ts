import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { INVENTORY_SEED } from '../../../core/data/mock-data';
import { InventoryService } from '../../../core/services/inventory.service';
import { ReceiveDelivery } from './receive-delivery';

describe('ReceiveDelivery', () => {
  const receive = vi.fn();

  const setup = async () => {
    receive.mockReset();
    receive.mockImplementation((id: string, qty: number) => of({ ...INVENTORY_SEED[2], stock: qty }));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: InventoryService, useValue: { getById: () => of(INVENTORY_SEED[2]), receive } },
      ],
    });
    const fixture = TestBed.createComponent(ReceiveDelivery);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture.componentRef.setInput('id', 'itm-003');
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    return { fixture, el, navigate, submit: () => el.querySelector<HTMLButtonElement>('button[type="submit"]')! };
  };

  const type = async (fixture: { whenStable(): Promise<unknown> }, el: HTMLElement, value: string) => {
    const input = el.querySelector('input')!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };

  it('shows the item and its current stock', async () => {
    const { el } = await setup();
    expect(el.textContent).toContain('Mechanical Keyboard');
    expect(el.textContent).toContain('currently has 0 in stock');
  });

  it('enables Submit only for a whole number of at least 1', async () => {
    const { fixture, el, submit } = await setup();
    expect(submit().disabled).toBe(true);

    await type(fixture, el, '0');
    expect(submit().disabled).toBe(true);
    await type(fixture, el, '2.5');
    expect(submit().disabled).toBe(true);
    await type(fixture, el, '5');
    expect(submit().disabled).toBe(false);
  });

  it('previews the new stock level and submits the quantity', async () => {
    const { fixture, el, submit, navigate } = await setup();
    await type(fixture, el, '12');
    expect(el.textContent).toContain('New stock level: 12');

    submit().click();
    expect(receive).toHaveBeenCalledWith('itm-003', 12);
    expect(navigate).toHaveBeenCalledWith('/inventory');
  });
});
