import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { InventoryItem, NewInventoryItem, StockFilter } from '../models/inventory.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/inventory`;

  search(query: string, status: StockFilter = 'All'): Observable<InventoryItem[]> {
    const params = new HttpParams().set('q', query.trim()).set('status', status);
    return this.http.get<InventoryItem[]>(this.apiUrl, { params });
  }

  getById(id: string): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`${this.apiUrl}/${encodeURIComponent(id)}`);
  }

  skuExists(sku: string): Observable<boolean> {
    const params = new HttpParams().set('sku', sku);
    return this.http
      .get<{ exists: boolean }>(`${this.apiUrl}/sku-exists`, { params })
      .pipe(map((res) => res.exists));
  }

  create(input: NewInventoryItem): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(this.apiUrl, input);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${encodeURIComponent(id)}`);
  }

  receive(id: string, quantity: number): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.apiUrl}/${encodeURIComponent(id)}/receive`, { quantity });
  }
}
