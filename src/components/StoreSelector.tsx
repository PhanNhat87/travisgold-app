import type { Store, StoreSelection } from '../types';

export function StoreSelector({ stores, value, onChange, allowAll = true }: { stores: Store[]; value: StoreSelection; onChange: (value: StoreSelection) => void; allowAll?: boolean }) {
  const items: { id: StoreSelection; label: string }[] = [
    ...(allowAll ? [{ id: 'all' as StoreSelection, label: 'Tổng quan' }] : []),
    ...stores.map((s) => ({ id: s.id as StoreSelection, label: s.name })),
  ];
  return (
    <div className={`grid gap-1 rounded-[22px] border border-[#eadfca] bg-white p-1.5 shadow-[0_10px_28px_rgba(11,31,51,.07)] ${items.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`} role="tablist" aria-label="Chọn cửa hàng">
      {items.map((item) => {
        const active = value === item.id;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={`min-h-11 min-w-0 rounded-2xl px-2 text-[13px] font-bold transition active:scale-[0.98] sm:px-4 sm:text-sm ${
              active
                ? 'bg-gradient-to-r from-[#e7c36f] to-[#f3d58a] text-navy shadow-[0_7px_16px_rgba(181,132,31,.22)]'
                : 'text-slate-600 hover:bg-[#fffaf0]'
            }`}
          >
            <span className="block truncate">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
