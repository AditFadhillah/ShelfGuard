import { InventoryItem } from '../models/inventory.model';
import { TeamMember } from '../models/user.model';

const acme = { name: 'Acme Supply', leadTimeDays: 5 };
const globex = { name: 'Globex Trading', leadTimeDays: 12 };
const initech = { name: 'Initech Wholesale', leadTimeDays: 3 };

export const INVENTORY_SEED: readonly InventoryItem[] = [
  { id: 'itm-001', name: 'Wireless Mouse', sku: 'ELE-10001', category: 'Electronics', stock: 42, suppliers: [acme] },
  { id: 'itm-002', name: 'USB-C Hub', sku: 'ELE-10002', category: 'Electronics', stock: 8, suppliers: [acme, globex] },
  { id: 'itm-003', name: 'Mechanical Keyboard', sku: 'ELE-10003', category: 'Electronics', stock: 0, suppliers: [globex] },
  { id: 'itm-004', name: 'Bluetooth Speaker', sku: 'ELE-10004', category: 'Electronics', stock: 25, suppliers: [initech] },
  { id: 'itm-005', name: 'Denim Jacket', sku: 'APP-20001', category: 'Apparel', stock: 60, suppliers: [globex] },
  { id: 'itm-006', name: 'Cotton T-Shirt', sku: 'APP-20002', category: 'Apparel', stock: 5, suppliers: [initech] },
  { id: 'itm-007', name: 'Wool Socks', sku: 'APP-20003', category: 'Apparel', stock: 120, suppliers: [acme, initech] },
  { id: 'itm-008', name: 'Rain Coat', sku: 'APP-20004', category: 'Apparel', stock: 0, suppliers: [globex] },
  { id: 'itm-009', name: 'Cordless Drill', sku: 'TLS-30001', category: 'Tools', stock: 14, suppliers: [acme] },
  { id: 'itm-010', name: 'Claw Hammer', sku: 'TLS-30002', category: 'Tools', stock: 10, suppliers: [acme] },
  { id: 'itm-011', name: 'Socket Set', sku: 'TLS-30003', category: 'Tools', stock: 3, suppliers: [globex, initech] },
  { id: 'itm-012', name: 'Tape Measure', sku: 'TLS-30004', category: 'Tools', stock: 75, suppliers: [initech] },
  { id: 'itm-013', name: 'Stapler', sku: 'OFF-40001', category: 'Office', stock: 33, suppliers: [acme] },
  { id: 'itm-014', name: 'A4 Paper Ream', sku: 'OFF-40002', category: 'Office', stock: 9, suppliers: [initech] },
  { id: 'itm-015', name: 'Ballpoint Pens (50)', sku: 'OFF-40003', category: 'Office', stock: 200, suppliers: [acme, globex] },
  { id: 'itm-016', name: 'Dark Chocolate Bar', sku: 'FOD-50001', category: 'Food', stock: 11, suppliers: [globex] },
  { id: 'itm-017', name: 'Green Tea Box', sku: 'FOD-50002', category: 'Food', stock: 0, suppliers: [initech] },
  { id: 'itm-018', name: 'Granola Bars', sku: 'FOD-50003', category: 'Food', stock: 48, suppliers: [acme] },
];

export const TEAM_SEED: readonly TeamMember[] = [
  { id: 'usr-001', name: 'Amina Hassan', email: 'amina.hassan@shelfguard.test', role: 'Admin' },
  { id: 'usr-002', name: 'Ben Carter', email: 'ben.carter@shelfguard.test', role: 'Viewer' },
  { id: 'usr-003', name: 'Chloe Nguyen', email: 'chloe.nguyen@shelfguard.test', role: 'Viewer' },
  { id: 'usr-004', name: 'Diego Alvarez', email: 'diego.alvarez@shelfguard.test', role: 'Admin' },
  { id: 'usr-005', name: 'Eva Kowalski', email: 'eva.kowalski@shelfguard.test', role: 'Viewer' },
];
