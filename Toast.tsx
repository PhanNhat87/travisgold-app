import { CheckCircle2, X } from 'lucide-react';
export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return <div className="fixed left-1/2 top-[calc(env(safe-area-inset-top)+16px)] z-[80] flex w-[calc(100%-32px)] max-w-md -translate-x-1/2 items-center gap-3 rounded-2xl bg-navy px-4 py-3 text-sm font-semibold text-white shadow-2xl">
    <CheckCircle2 className="text-champagne-light" size={20}/><span className="flex-1">{message}</span><button aria-label="Đóng thông báo" onClick={onClose}><X size={18}/></button>
  </div>;
}
