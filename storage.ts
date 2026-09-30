import { defaultStores, sampleTransactions } from '../data/sampleData';
import type { AppSettings, Store, Transaction } from '../types';

const KEYS = {
  transactions: 'travisgold.transactions.v1',
  stores: 'travisgold.stores.v1',
  settings: 'travisgold.settings.v1',
};

const defaultSettings: AppSettings = { currency: 'VND', sampleEnabled: true, version: '1.0.0' };

export function loadStores(): Store[] {
  try { return JSON.parse(localStorage.getItem(KEYS.stores) || 'null') || defaultStores; } catch { return defaultStores; }
}
export function saveStores(stores: Store[]) { localStorage.setItem(KEYS.stores, JSON.stringify(stores)); }

export function loadSettings(): AppSettings {
  try { return { ...defaultSettings, ...(JSON.parse(localStorage.getItem(KEYS.settings) || '{}')) }; } catch { return defaultSettings; }
}
export function saveSettings(settings: AppSettings) { localStorage.setItem(KEYS.settings, JSON.stringify(settings)); }

export function loadTransactions(): Transaction[] {
  try {
    const stored = localStorage.getItem(KEYS.transactions);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(KEYS.transactions, JSON.stringify(sampleTransactions));
    return sampleTransactions;
  } catch { return sampleTransactions; }
}
export function saveTransactions(items: Transaction[]) { localStorage.setItem(KEYS.transactions, JSON.stringify(items)); }

export function exportBackup(transactions: Transaction[], stores: Store[], settings: AppSettings) {
  return JSON.stringify({ schema: 1, exportedAt: new Date().toISOString(), transactions, stores, settings }, null, 2);
}

export function importBackup(raw: string): { transactions: Transaction[]; stores: Store[]; settings: AppSettings } {
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed.transactions) || !Array.isArray(parsed.stores)) throw new Error('File sao lưu không hợp lệ.');
  return { transactions: parsed.transactions, stores: parsed.stores, settings: { ...defaultSettings, ...(parsed.settings || {}) } };
}

export function clearAll() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}
