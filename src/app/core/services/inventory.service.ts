import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { InventoryItem, NewInventoryItem, StockFilter } from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly http = inject(HttpClient);

  search(query: string, status: StockFilter = 'All'): Observable<InventoryItem[]> {
    const params = new HttpParams().set('q', query.trim()).set('status', status);
    return this.http.get<InventoryItem[]>('/api/inventory', { params });
  }

  getById(id: string): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`/api/inventory/${encodeURIComponent(id)}`);
  }

  skuExists(sku: string): Observable<boolean> {
    const params = new HttpParams().set('sku', sku);
    return this.http
      .get<{ exists: boolean }>('/api/inventory/sku-exists', { params })
      .pipe(map((res) => res.exists));
  }

  create(input: NewInventoryItem): Observable<InventoryItem> {
    return this.http.post<InventoryItem>('/api/inventory', input);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/inventory/${encodeURIComponent(id)}`);
  }

  receive(id: string, quantity: number): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`/api/inventory/${encodeURIComponent(id)}/receive`, { quantity });
  }
}
