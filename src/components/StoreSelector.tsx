import type { Store, StoreSelection } from '../types';

export function StoreSelector({ stores, value, onChange, allowAll = true }: { stores: Store[]; value: StoreSelection; onChange: (value: StoreSelection) => void; allowAll?: boolean }) {
  const items: { id: StoreSelection; label: string }[] = [
    ...(allowAll ? [{ id: 'all' as StoreSelection, label: 'Tổng quan' }] : []),
    ...stores.map((s) => ({ id: s.id as StoreSelection, label: s.name })),
  ];
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-2xl bg-white p-1.5 shadow-soft" role="tablist" aria-label="Chọn cửa hàng">
      {items.map((item) => {
        const active = value === item.id;
        return <button key={item.id} role="tab" aria-selected={active} onClick={() => onChange(item.id)} className={`min-h-11 shrink-0 rounded-xl px-4 text-sm font-semibold transition active:scale-[0.98] ${active ? 'bg-champagne text-navy' : 'text-slate-600 hover:bg-slate-50'}`}>{item.label}</button>;
      })}
    </div>
  );
}
