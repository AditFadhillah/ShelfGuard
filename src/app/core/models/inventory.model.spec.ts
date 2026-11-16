import { getStockStatus, LOW_STOCK_THRESHOLD } from './inventory.model';

describe('getStockStatus', () => {
  it('returns Out of Stock for 0', () => {
    expect(getStockStatus(0)).toBe('Out of Stock');
  });

  it('returns Low Stock from 1 up to and including the threshold', () => {
    expect(getStockStatus(1)).toBe('Low Stock');
    expect(getStockStatus(LOW_STOCK_THRESHOLD)).toBe('Low Stock');
  });

  it('returns In Stock above the threshold', () => {
    expect(getStockStatus(LOW_STOCK_THRESHOLD + 1)).toBe('In Stock');
  });
});
