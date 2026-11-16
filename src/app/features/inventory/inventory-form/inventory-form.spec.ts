import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideMockHttp } from '../../../core/interceptors/provide-mock-http';
import { InventoryForm } from './inventory-form';

describe('InventoryForm', () => {
  const setup = async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideMockHttp()] });
    const fixture = TestBed.createComponent(InventoryForm);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const submit = () => el.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    const removeButtons = () => el.querySelectorAll<HTMLButtonElement>('button[aria-label^="Remove supplier"]');
    return { fixture, el, submit, removeButtons };
  };

  it('starts with Submit disabled and exactly one supplier', async () => {
    const { submit, removeButtons } = await setup();
    expect(submit().disabled).toBe(true);
    expect(removeButtons()).toHaveLength(1);
    expect(removeButtons()[0].disabled).toBe(true);
  });

  it('adds and removes suppliers but never drops the last one', async () => {
    const { fixture, el, removeButtons } = await setup();
    const addButton = Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.includes('Add Supplier'))!;

    addButton.click();
    await fixture.whenStable();
    expect(removeButtons()).toHaveLength(2);
    expect(removeButtons()[0].disabled).toBe(false);

    removeButtons()[0].click();
    await fixture.whenStable();
    expect(removeButtons()).toHaveLength(1);
    expect(removeButtons()[0].disabled).toBe(true);
  });
});
