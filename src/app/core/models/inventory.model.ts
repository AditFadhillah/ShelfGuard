export const ITEM_CATEGORIES = ['Electronics', 'Apparel', 'Tools', 'Office', 'Food'] as const;
export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';
export type StockFilter = 'All' | StockStatus;
export const STOCK_FILTERS: readonly StockFilter[] = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];

export const LOW_STOCK_THRESHOLD = 10;
export const SKU_PATTERN = /^[A-Z]{3}-\d{5}$/;

export interface Supplier {
  name: string;
  leadTimeDays: number; // integer >= 0
}

export interface InventoryItem {
  id: string; // e.g. 'itm-001'
  name: string;
  sku: string; // unique, format 'ABC-12345'
  category: ItemCategory;
  stock: number; // integer >= 0
  suppliers: Supplier[];
}

export type NewInventoryItem = Omit<InventoryItem, 'id'>;

export function getStockStatus(stock: number): StockStatus {
  if (stock === 0) {
    return 'Out of Stock';
  }
  return stock <= LOW_STOCK_THRESHOLD ? 'Low Stock' : 'In Stock';
}
