export type StoreSelection = 'all' | 'store-1' | 'store-2';

export interface Transaction {
  id: string;
  storeId: string;
  date: string;
  purchaseQuantity: number;
  purchaseUnitPrice: number;
  purchaseTotal: number;
  saleQuantity: number;
  saleUnitPrice: number;
  saleTotal: number;
  profit: number;
  remainingQuantity: number;
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Store {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AppSettings {
  currency: 'VND';
  sampleEnabled: boolean;
  version: string;
}

export interface Summary {
  transactionCount: number;
  purchaseQuantity: number;
  saleQuantity: number;
  purchaseTotal: number;
  saleTotal: number;
  profit: number;
  remainingQuantity: number;
}
