import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { provideMockHttp } from '../interceptors/provide-mock-http';
import { AuthService } from './auth.service';
import { InventoryService } from './inventory.service';

describe('InventoryService (against the mock backend)', () => {
  let service: InventoryService;

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    TestBed.configureTestingModule({ providers: [provideMockHttp()] });
    service = TestBed.inject(InventoryService);
  });

  afterEach(() => vi.restoreAllMocks());

  it('seeds 18 items covering every category and status', async () => {
    const items = await firstValueFrom(service.search(''));
    expect(items).toHaveLength(18);
    expect(new Set(items.map((i) => i.category)).size).toBe(5);
    for (const status of ['In Stock', 'Low Stock', 'Out of Stock'] as const) {
      expect((await firstValueFrom(service.search('', status))).length).toBeGreaterThan(0);
    }
  });

  it('searches name and SKU case-insensitively', async () => {
    expect((await firstValueFrom(service.search('wireless'))).map((i) => i.name)).toEqual(['Wireless Mouse']);
    expect((await firstValueFrom(service.search('ele-10002'))).map((i) => i.name)).toEqual(['USB-C Hub']);
  });

  it('combines query and status filters', async () => {
    const result = await firstValueFrom(service.search('ele-', 'Out of Stock'));
    expect(result.map((i) => i.name)).toEqual(['Mechanical Keyboard']);
  });

  it('delays responses', async () => {
    const start = Date.now();
    await firstValueFrom(service.search(''));
    expect(Date.now() - start).toBeGreaterThanOrEqual(250);
  });

  it('gets one item by id and rejects unknown ids with 404', async () => {
    expect((await firstValueFrom(service.getById('itm-001'))).name).toBe('Wireless Mouse');
    await expect(firstValueFrom(service.getById('itm-999'))).rejects.toMatchObject({ status: 404 });
  });

  it('reports whether a SKU exists, ignoring case', async () => {
    expect(await firstValueFrom(service.skuExists('ele-10001'))).toBe(true);
    expect(await firstValueFrom(service.skuExists('ZZZ-99999'))).toBe(false);
  });

  it('creates an item with a generated id and rejects a duplicate SKU with 409', async () => {
    const input = {
      name: 'Test Item',
      sku: 'TST-00001',
      category: 'Office' as const,
      stock: 4,
      suppliers: [{ name: 'Acme', leadTimeDays: 2 }],
    };
    expect((await firstValueFrom(service.create(input))).id).toBe('itm-019');
    expect(await firstValueFrom(service.skuExists('TST-00001'))).toBe(true);
    expect(await firstValueFrom(service.search(''))).toHaveLength(19);
    await expect(firstValueFrom(service.create(input))).rejects.toMatchObject({ status: 409 });
  });

  it('deletes an item as Admin', async () => {
    await firstValueFrom(service.delete('itm-001'));
    const items = await firstValueFrom(service.search(''));
    expect(items).toHaveLength(17);
    expect(items.some((i) => i.id === 'itm-001')).toBe(false);
  });

  it('refuses to delete as Viewer (403) because of the X-User-Role header', async () => {
    TestBed.inject(AuthService).setRole('Viewer');
    await expect(firstValueFrom(service.delete('itm-001'))).rejects.toMatchObject({ status: 403 });
    expect(await firstValueFrom(service.search(''))).toHaveLength(18);
  });

  it('adds a delivery to the stock level', async () => {
    const updated = await firstValueFrom(service.receive('itm-003', 25));
    expect(updated.stock).toBe(25);
    expect((await firstValueFrom(service.getById('itm-003'))).stock).toBe(25);
  });

  it('rejects an invalid delivery quantity with 400 and unknown items with 404', async () => {
    await expect(firstValueFrom(service.receive('itm-001', 0))).rejects.toMatchObject({ status: 400 });
    await expect(firstValueFrom(service.receive('itm-001', 1.5))).rejects.toMatchObject({ status: 400 });
    await expect(firstValueFrom(service.receive('itm-999', 5))).rejects.toMatchObject({ status: 404 });
  });
});
