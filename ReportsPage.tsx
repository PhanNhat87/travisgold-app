import { FileSpreadsheet, FileText } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Store, StoreSelection, Transaction } from '../types';
import { formatVND, summarize } from '../utils/calculations';
import { exportExcel } from '../utils/exportExcel';
import { exportPdf } from '../utils/exportPdf';
import { StoreSelector } from '../components/StoreSelector';

export function ReportsPage({stores,transactions,selection,onSelection}:{stores:Store[];transactions:Transaction[];selection:StoreSelection;onSelection:(v:StoreSelection)=>void}){
  const [from,setFrom]=useState(''); const [to,setTo]=useState('');
  const rows=useMemo(()=>transactions.filter(t=>(selection==='all'||t.storeId===selection)&&(!from||t.date>=from)&&(!to||t.date<=to)),[transactions,selection,from,to]);
  const s=summarize(rows); const label=selection==='all'?'TongHop':stores.find(x=>x.id===selection)?.name||selection;
  return <div className="space-y-5"><StoreSelector stores={stores} value={selection} onChange={onSelection}/><div className="rounded-3xl bg-white p-5 shadow-soft"><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-600">Từ ngày<input className="field mt-2" type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><label className="text-sm font-semibold text-slate-600">Đến ngày<input className="field mt-2" type="date" value={to} onChange={e=>setTo(e.target.value)}/></label></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Box label="Giao dịch" value={String(s.transactionCount)}/><Box label="Tiền mua" value={formatVND(s.purchaseTotal)}/><Box label="Tiền bán" value={formatVND(s.saleTotal)}/><Box label="Lợi nhuận" value={formatVND(s.profit)}/></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><button onClick={()=>exportPdf(rows,stores,label)} disabled={!rows.length} className="btn-primary disabled:opacity-40"><FileText size={18}/>Xuất PDF</button><button onClick={()=>exportExcel(rows,stores,label)} disabled={!rows.length} className="btn-secondary disabled:opacity-40"><FileSpreadsheet size={18}/>Xuất Excel</button></div><p className="mt-4 text-xs leading-5 text-slate-400">PDF dùng bộ ký tự Latin an toàn để tránh lỗi font trên thiết bị; Excel giữ đầy đủ tiếng Việt.</p></div></div>
}
function Box({label,value}:{label:string;value:string}){return <div className="rounded-2xl bg-appgray p-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-lg font-bold text-navy">{value}</p></div>}
