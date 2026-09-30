import { ArrowDownToLine, ArrowUpFromLine, Boxes, CircleDollarSign, ReceiptText, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Store, StoreSelection, Transaction } from '../types';
import { formatNumber, formatVND, summarize } from '../utils/calculations';
import { EmptyState } from '../components/EmptyState';
import { StatCard } from '../components/StatCard';
import { StoreSelector } from '../components/StoreSelector';
import { useMemo, useState } from 'react';

const startOfMonth = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); };
const iso = (d: Date) => d.toLocaleDateString('sv-SE');

export function DashboardPage({ stores, transactions, selection, onSelection }: { stores: Store[]; transactions: Transaction[]; selection: StoreSelection; onSelection: (v: StoreSelection) => void }) {
  const [range, setRange] = useState<'7'|'30'|'month'|'custom'|'all'>('30');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const filtered = useMemo(() => {
    const now = new Date(); let min = new Date(0);
    if (range === '7' || range === '30') { min = new Date(); min.setDate(now.getDate() - Number(range) + 1); }
    if (range === 'month') min = startOfMonth();
    return transactions.filter(t => {
      const storeOk = selection === 'all' || t.storeId === selection;
      const timeOk = range === 'all' ? true : range === 'custom' ? (!customFrom || t.date >= customFrom) && (!customTo || t.date <= customTo) : t.date >= iso(min);
      return storeOk && timeOk;
    });
  }, [transactions, selection, range, customFrom, customTo]);
  const summary = summarize(filtered);
  const storeSummaries = stores.map(s => ({ store: s, summary: summarize(filtered.filter(t => t.storeId === s.id)) }));
  const dailyMap = new Map<string, { date: string; store1: number; store2: number; profit1: number; profit2: number }>();
  filtered.forEach(t => { const row = dailyMap.get(t.date) || { date: t.date.slice(5), store1: 0, store2: 0, profit1: 0, profit2: 0 }; if (t.storeId === 'store-1') { row.store1 += t.saleTotal; row.profit1 += t.profit; } else { row.store2 += t.saleTotal; row.profit2 += t.profit; } dailyMap.set(t.date, row); });
  const chartData = [...dailyMap.values()].sort((a,b)=>a.date.localeCompare(b.date));

  return <div className="space-y-5">
    <div className="rounded-[28px] bg-gradient-to-br from-navy to-navy-600 p-5 text-white shadow-soft sm:p-7">
      <p className="text-sm font-semibold text-champagne-light">Tổng quan kinh doanh</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-bold sm:text-3xl">Theo dõi rõ ràng. Quyết định nhanh hơn.</h2><p className="mt-2 text-sm text-white/70">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</p></div><span className="rounded-full bg-white/10 px-3 py-2 text-xs">Lưu cục bộ • PWA</span></div>
    </div>
    <StoreSelector stores={stores} value={selection} onChange={onSelection}/>
    <div className="flex gap-2 overflow-x-auto pb-1">{([['7','7 ngày'],['30','30 ngày'],['month','Tháng này'],['custom','Tùy chọn'],['all','Tất cả']] as const).map(([id,label]) => <button key={id} onClick={()=>setRange(id)} className={`min-h-10 shrink-0 rounded-xl px-4 text-sm font-semibold ${range===id?'bg-navy text-white':'bg-white text-slate-500'}`}>{label}</button>)}</div>
    {range === 'custom' && <div className="grid gap-3 rounded-2xl bg-white p-4 shadow-soft sm:grid-cols-2"><label className="text-sm font-semibold text-slate-600">Từ ngày<input type="date" className="field mt-2" value={customFrom} onChange={e=>setCustomFrom(e.target.value)}/></label><label className="text-sm font-semibold text-slate-600">Đến ngày<input type="date" className="field mt-2" value={customTo} onChange={e=>setCustomTo(e.target.value)}/></label></div>}
    {filtered.length === 0 ? <EmptyState/> : <>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard icon={ReceiptText} label="Giao dịch" value={formatNumber(summary.transactionCount)}/>
        <StatCard icon={ArrowDownToLine} label="SL mua vào" value={formatNumber(summary.purchaseQuantity)}/>
        <StatCard icon={ArrowUpFromLine} label="SL bán ra" value={formatNumber(summary.saleQuantity)}/>
        <StatCard icon={Boxes} label="Số lượng tồn" value={formatNumber(summary.remainingQuantity)}/>
        <StatCard icon={CircleDollarSign} label="Tiền mua vào" value={formatVND(summary.purchaseTotal)}/>
        <StatCard icon={CircleDollarSign} label="Tiền bán ra" value={formatVND(summary.saleTotal)}/>
        <div className="col-span-2"><StatCard icon={TrendingUp} label="Lợi nhuận dự kiến" value={formatVND(summary.profit)} hint="Theo giá vốn số lượng đã bán"/></div>
      </div>
      {selection === 'all' && <div className="grid gap-3 md:grid-cols-3">
        {storeSummaries.map(({store,summary:s}) => <div key={store.id} className="rounded-3xl bg-white p-5 shadow-soft"><div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{backgroundColor:store.color}}/><h3 className="font-bold text-navy">{store.name}</h3></div><p className="mt-4 text-xs text-slate-400">Doanh thu bán</p><p className="mt-1 text-xl font-bold text-navy">{formatVND(s.saleTotal)}</p><p className="mt-2 text-sm font-semibold text-success">Lợi nhuận {formatVND(s.profit)}</p></div>)}
        <div className="rounded-3xl bg-champagne p-5 text-navy shadow-soft"><h3 className="font-bold">Tổng 2 cửa hàng</h3><p className="mt-4 text-xs text-navy/60">Doanh thu bán</p><p className="mt-1 text-xl font-extrabold">{formatVND(summary.saleTotal)}</p><p className="mt-2 text-sm font-bold">Lợi nhuận {formatVND(summary.profit)}</p></div>
      </div>}
      <div className="rounded-3xl bg-white p-4 shadow-soft sm:p-6"><h3 className="font-bold text-navy">Doanh thu bán ra theo ngày</h3><p className="mb-5 mt-1 text-xs text-slate-400">So sánh hai cửa hàng</p><div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="date" fontSize={11}/><YAxis tickFormatter={(v)=>`${Math.round(v/1000000)}tr`} fontSize={11}/><Tooltip formatter={(v)=>formatVND(Number(v))}/><Legend/><Bar dataKey="store1" name={stores[0]?.name || 'Cửa hàng 1'} fill="#D6B36A" radius={[6,6,0,0]}/><Bar dataKey="store2" name={stores[1]?.name || 'Cửa hàng 2'} fill="#163A5F" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></div></div>
      <div className="rounded-3xl bg-white p-4 shadow-soft sm:p-6"><h3 className="font-bold text-navy">So sánh lợi nhuận</h3><div className="mt-5 h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={storeSummaries.map(({store,summary:s})=>({name:store.name, profit:s.profit}))}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name" fontSize={11}/><YAxis tickFormatter={(v)=>`${Math.round(v/1000000)}tr`} fontSize={11}/><Tooltip formatter={(v)=>formatVND(Number(v))}/><Bar dataKey="profit" name="Lợi nhuận" fill="#16845B" radius={[8,8,0,0]}/></BarChart></ResponsiveContainer></div></div>
    </>}
  </div>;
}
