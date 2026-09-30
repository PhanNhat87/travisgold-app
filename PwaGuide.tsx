import { Share, SquarePlus, X } from 'lucide-react';
export function PwaGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-[90] grid place-items-end bg-black/35 p-3 sm:place-items-center" onClick={onClose}>
    <div className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-navy">Cài TravisGold trên iPhone</h2><button aria-label="Đóng" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100"><X size={18}/></button></div>
      <ol className="mt-5 space-y-4 text-sm text-slate-600">
        <li className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy text-white"><Share size={17}/></span><span><b>1.</b> Bấm nút <b>Chia sẻ</b> trên Safari.</span></li>
        <li className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-champagne text-navy"><SquarePlus size={17}/></span><span><b>2.</b> Chọn <b>Thêm vào Màn hình chính</b>.</span></li>
        <li className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-success text-white">3</span><span><b>3.</b> Bấm <b>Thêm</b> để hoàn tất.</span></li>
      </ol>
      <button onClick={onClose} className="mt-6 min-h-11 w-full rounded-2xl bg-navy px-4 font-semibold text-white">Đã hiểu</button>
    </div>
  </div>;
}
