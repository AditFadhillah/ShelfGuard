import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { INVENTORY_SEED, TEAM_SEED } from '../data/mock-data';
import { getStockStatus, InventoryItem, NewInventoryItem, StockFilter } from '../models/inventory.model';

const ok = (body: unknown, status = 200) => new HttpResponse({ status, body });

// Stands in for a real server: owns the data and applies the same rules an API would.
@Injectable({ providedIn: 'root' })
export class MockBackend {
  private items = structuredClone(INVENTORY_SEED) as InventoryItem[];
  private nextId = this.items.length + 1;

  handle(req: HttpRequest<unknown>): HttpResponse<unknown> {
    const [resource, id, action] = req.url.replace(/^\/api\//, '').split('/');

    if (resource === 'team' && req.method === 'GET') {
      return ok([...TEAM_SEED]);
    }
    if (resource === 'inventory') {
      return this.inventoryRoute(req, id, action);
    }
    throw this.fail(req, 404, 'Not found');
  }

  private inventoryRoute(req: HttpRequest<unknown>, id?: string, action?: string): HttpResponse<unknown> {
    const { method } = req;

    if (!id && method === 'GET') {
      return ok(this.search(req.params.get('q') ?? '', (req.params.get('status') ?? 'All') as StockFilter));
    }
    if (!id && method === 'POST') {
      return this.create(req);
    }
    if (id === 'sku-exists' && method === 'GET') {
      const sku = (req.params.get('sku') ?? '').trim().toLowerCase();
      return ok({ exists: this.items.some((i) => i.sku.toLowerCase() === sku) });
    }

    const item = id ? this.items.find((i) => i.id === id) : undefined;
    if (id && !item) {
      throw this.fail(req, 404, `Item ${id} not found`);
    }
    if (item && !action && method === 'GET') {
      return ok({ ...item });
    }
    if (item && !action && method === 'DELETE') {
      if (req.headers.get('X-User-Role') !== 'Admin') {
        throw this.fail(req, 403, 'Only Admins can delete items');
      }
      this.items = this.items.filter((i) => i.id !== item.id);
      return ok(null, 204);
    }
    if (item && action === 'receive' && method === 'POST') {
      return this.receive(req, item);
    }
    throw this.fail(req, 405, 'Method not allowed');
  }

  private search(query: string, status: StockFilter): InventoryItem[] {
    const q = query.trim().toLowerCase();
    return this.items.filter(
      (item) =>
        (status === 'All' || getStockStatus(item.stock) === status) &&
        (!q || item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q)),
    );
  }

  private create(req: HttpRequest<unknown>): HttpResponse<unknown> {
    const input = req.body as NewInventoryItem;
    if (this.items.some((i) => i.sku.toLowerCase() === input.sku.toLowerCase())) {
      throw this.fail(req, 409, 'SKU already exists');
    }
    const item: InventoryItem = { ...input, id: `itm-${String(this.nextId++).padStart(3, '0')}` };
    this.items = [...this.items, item];
    return ok(item, 201);
  }

  private receive(req: HttpRequest<unknown>, item: InventoryItem): HttpResponse<unknown> {
    const { quantity } = req.body as { quantity: number };
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw this.fail(req, 400, 'Quantity must be a whole number of at least 1');
    }
    const updated = { ...item, stock: item.stock + quantity };
    this.items = this.items.map((i) => (i.id === item.id ? updated : i));
    return ok(updated);
  }

  private fail(req: HttpRequest<unknown>, status: number, message: string): HttpErrorResponse {
    return new HttpErrorResponse({ status, statusText: message, url: req.url, error: { message } });
  }
}
