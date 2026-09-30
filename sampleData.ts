import type { Store, Transaction } from '../types';

export const defaultStores: Store[] = [
  { id: 'store-1', name: 'Cửa hàng 1', color: '#D6B36A', createdAt: '2026-09-01T08:00:00.000Z' },
  { id: 'store-2', name: 'Cửa hàng 2', color: '#163A5F', createdAt: '2026-09-01T08:00:00.000Z' },
];

export const sampleTransactions: Transaction[] = [
  {
    id: 'TG-20260925-001', storeId: 'store-1', date: '2026-09-25',
    purchaseQuantity: 10, purchaseUnitPrice: 500000, purchaseTotal: 5000000,
    saleQuantity: 4, saleUnitPrice: 650000, saleTotal: 2600000,
    profit: 600000, remainingQuantity: 6, note: 'Dữ liệu mẫu cửa hàng 1',
    createdAt: '2026-09-25T09:00:00.000Z',
  },
  {
    id: 'TG-20260926-002', storeId: 'store-2', date: '2026-09-26',
    purchaseQuantity: 20, purchaseUnitPrice: 480000, purchaseTotal: 9600000,
    saleQuantity: 8, saleUnitPrice: 620000, saleTotal: 4960000,
    profit: 1120000, remainingQuantity: 12, note: 'Dữ liệu mẫu cửa hàng 2',
    createdAt: '2026-09-26T10:15:00.000Z',
  },
  {
    id: 'TG-20260928-003', storeId: 'store-1', date: '2026-09-28',
    purchaseQuantity: 12, purchaseUnitPrice: 510000, purchaseTotal: 6120000,
    saleQuantity: 7, saleUnitPrice: 680000, saleTotal: 4760000,
    profit: 1190000, remainingQuantity: 5, note: 'Đợt hàng chiều',
    createdAt: '2026-09-28T08:45:00.000Z',
  },
  {
    id: 'TG-20260929-004', storeId: 'store-2', date: '2026-09-29',
    purchaseQuantity: 15, purchaseUnitPrice: 495000, purchaseTotal: 7425000,
    saleQuantity: 9, saleUnitPrice: 640000, saleTotal: 5760000,
    profit: 1305000, remainingQuantity: 6, note: 'Bán lẻ',
    createdAt: '2026-09-29T11:20:00.000Z',
  },
];
