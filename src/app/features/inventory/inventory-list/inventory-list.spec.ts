import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { INVENTORY_SEED } from '../../../core/data/mock-data';
import { AuthService } from '../../../core/services/auth.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { InventoryList } from './inventory-list';

describe('InventoryList', () => {
  const search = vi.fn();

  beforeEach(() => {
    search.mockReset();
    search.mockReturnValue(of([...INVENTORY_SEED]));
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: InventoryService, useValue: { search } }],
    });
  });

  it('renders a row per item and loads with the default filters', async () => {
    const fixture = TestBed.createComponent(InventoryList);
    await fixture.whenStable();

    expect(search).toHaveBeenCalledWith('', 'All');
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('tr[mat-row]')).toHaveLength(18);
  });

  it('shows delete buttons to Admins only', async () => {
    const fixture = TestBed.createComponent(InventoryList);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('button[aria-label^="Delete"]')).toHaveLength(18);

    TestBed.inject(AuthService).setRole('Viewer');
    await fixture.whenStable();
    expect(el.querySelectorAll('button[aria-label^="Delete"]')).toHaveLength(0);
  });

  it('links every row to its receive-delivery page, for any role', async () => {
    const fixture = TestBed.createComponent(InventoryList);
    TestBed.inject(AuthService).setRole('Viewer');
    await fixture.whenStable();

    const links = (fixture.nativeElement as HTMLElement).querySelectorAll('a[aria-label^="Receive delivery"]');
    expect(links).toHaveLength(18);
    expect(links[0].getAttribute('href')).toBe('/inventory/itm-001/receive');
  });

  it('shows an empty state when nothing matches', async () => {
    search.mockReturnValue(of([]));
    const fixture = TestBed.createComponent(InventoryList);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No items match your filters.');
  });

  it('debounces search input by 300 ms', async () => {
    vi.useFakeTimers();
    try {
      const fixture = TestBed.createComponent(InventoryList);
      fixture.detectChanges();
      search.mockClear();

      const input = (fixture.nativeElement as HTMLElement).querySelector('input')!;
      for (const text of ['m', 'mo', 'mou']) {
        input.value = text;
        input.dispatchEvent(new Event('input'));
        await vi.advanceTimersByTimeAsync(100);
      }
      expect(search).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(300);
      expect(search).toHaveBeenCalledOnce();
      expect(search).toHaveBeenCalledWith('mou', 'All');
    } finally {
      vi.useRealTimers();
    }
  });
});
