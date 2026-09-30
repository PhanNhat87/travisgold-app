import { PackageOpen } from 'lucide-react';
export function EmptyState() {
  return <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center shadow-soft">
    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-champagne/15 text-navy"><PackageOpen size={28}/></div>
    <h3 className="mt-4 text-lg font-bold text-navy">Chưa có giao dịch</h3>
    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">Hãy tạo giao dịch đầu tiên để bắt đầu theo dõi hoạt động kinh doanh.</p>
  </div>;
}
