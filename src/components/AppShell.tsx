import { BarChart3, Clock3, Database, FilePlus2, LayoutDashboard, Settings, Store as StoreIcon, WifiOff } from 'lucide-react';
import type { ReactNode } from 'react';
import { Brand } from './Brand';

export type PageKey = 'dashboard' | 'entry' | 'history' | 'reports' | 'stores' | 'settings';
const nav = [
  ['dashboard', 'Tổng quan', LayoutDashboard], ['entry', 'Nhập giao dịch', FilePlus2], ['history', 'Lịch sử', Clock3], ['reports', 'Báo cáo', BarChart3], ['stores', 'Cửa hàng', StoreIcon], ['settings', 'Cài đặt', Settings],
] as const;

export function AppShell({ page, setPage, title, children }: { page: PageKey; setPage: (p: PageKey) => void; title: string; children: ReactNode }) {
  return <div className="min-h-screen bg-appgray text-slate-800">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-100 bg-white p-5 lg:block">
      <Brand />
      <nav className="mt-8 space-y-2">{nav.map(([id, label, Icon]) => <button key={id} onClick={() => setPage(id)} className={`flex min-h-11 w-full items-center gap-3 rounded-2xl px-4 text-left text-sm font-semibold ${page === id ? 'bg-navy text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Icon size={19}/>{label}</button>)}</nav>
      <div className="absolute bottom-6 left-5 right-5 rounded-2xl bg-appgray p-4 text-xs leading-5 text-slate-500"><WifiOff size={16} className="mb-2 text-navy"/>Dữ liệu lưu cục bộ trên thiết bị này.</div>
    </aside>
    <div className="lg:pl-64">
      <header className="sticky top-0 z-30 border-b border-slate-100/80 bg-white/90 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+12px)] backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3"><div className="lg:hidden"><Brand compact /></div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-champagne">TravisGold</p><h1 className="truncate text-lg font-bold text-navy">{title}</h1></div><div className="flex items-center gap-2"><span className="hidden min-h-9 items-center gap-1.5 rounded-xl bg-success/10 px-3 text-xs font-semibold text-success sm:flex"><Database size={14}/>Lưu cục bộ</span><button onClick={() => setPage('settings')} aria-label="Mở cài đặt" className="grid h-11 w-11 place-items-center rounded-2xl bg-appgray text-navy active:scale-95"><Settings size={20}/></button></div></div>
      </header>
      <main className="mx-auto max-w-7xl px-4 pb-[calc(92px+env(safe-area-inset-bottom))] pt-5 sm:px-6 lg:px-8 lg:pb-10">{children}</main>
    </div>
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-100 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-5">{nav.slice(0,5).map(([id, label, Icon]) => <button key={id} onClick={() => setPage(id)} className={`flex min-h-[66px] flex-col items-center justify-center gap-1 text-[11px] font-semibold ${page === id ? 'text-navy' : 'text-slate-400'}`} aria-label={label}><Icon size={20}/><span className="max-w-[68px] truncate">{id === 'entry' ? 'Nhập' : label}</span>{page === id && <span className="h-1 w-5 rounded-full bg-champagne"/>}</button>)}</div>
    </nav>
  </div>;
}
