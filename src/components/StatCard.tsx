import type { LucideIcon } from 'lucide-react';

export function StatCard({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: string; hint?: string }) {
  return <div className="rounded-3xl border border-white/70 bg-white p-4 shadow-soft sm:p-5">
    <div className="mb-3 flex items-center justify-between">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy/5 text-navy"><Icon size={18} /></span>
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </div>
    <p className="text-sm font-medium text-slate-500">{label}</p>
    <p className="mt-1 break-words text-xl font-bold tracking-tight text-navy sm:text-2xl">{value}</p>
  </div>;
}
