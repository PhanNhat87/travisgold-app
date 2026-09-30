import type { Summary, Transaction } from '../types';

export const calcPurchaseTotal = (q: number, p: number) => safeNumber(q) * safeNumber(p);
export const calcSaleTotal = (q: number, p: number) => safeNumber(q) * safeNumber(p);

// Loi nhuan du kien dua tren gia von cua so luong da ban, tranh tru toan bo lo hang chua ban.
export const calcProfit = (saleQty: number, purchaseUnitPrice: number, saleTotal: number) =>
  safeNumber(saleTotal) - safeNumber(saleQty) * safeNumber(purchaseUnitPrice);

export const calcRemaining = (purchaseQty: number, saleQty: number) => safeNumber(purchaseQty) - safeNumber(saleQty);

export const safeNumber = (value: number | string | undefined | null) => {
  const parsed = typeof value === 'string' ? Number(value.replace(/\./g, '').replace(/,/g, '')) : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const formatVND = (value: number) => new Intl.NumberFormat('vi-VN', {
  style: 'currency', currency: 'VND', maximumFractionDigits: 0,
}).format(safeNumber(value));

export const formatNumber = (value: number) => new Intl.NumberFormat('vi-VN').format(safeNumber(value));

export const summarize = (items: Transaction[]): Summary => items.reduce<Summary>((acc, t) => ({
  transactionCount: acc.transactionCount + 1,
  purchaseQuantity: acc.purchaseQuantity + t.purchaseQuantity,
  saleQuantity: acc.saleQuantity + t.saleQuantity,
  purchaseTotal: acc.purchaseTotal + t.purchaseTotal,
  saleTotal: acc.saleTotal + t.saleTotal,
  profit: acc.profit + t.profit,
  remainingQuantity: acc.remainingQuantity + t.remainingQuantity,
}), { transactionCount: 0, purchaseQuantity: 0, saleQuantity: 0, purchaseTotal: 0, saleTotal: 0, profit: 0, remainingQuantity: 0 });

export const todayISO = () => new Date().toLocaleDateString('sv-SE');
