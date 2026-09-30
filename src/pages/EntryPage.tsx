import { FileDown, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Store, StoreSelection, Transaction } from '../types';
import { calcProfit, calcPurchaseTotal, calcRemaining, calcSaleTotal, formatVND, safeNumber, todayISO } from '../utils/calculations';
import { StoreSelector } from '../components/StoreSelector';
import { exportPdf } from '../utils/exportPdf';
import { exportExcel } from '../utils/exportExcel';

type Draft = { date:string; purchaseQuantity:string; purchaseUnitPrice:string; saleQuantity:string; saleUnitPrice:string; note:string };
const blank = (): Draft => ({ date: todayISO(), purchaseQuantity:'', purchaseUnitPrice:'', saleQuantity:'', saleUnitPrice:'', note:'' });
const moneyInput = (v:string) => v.replace(/\D/g,'');
const displayMoneyInput = (v:string) => v ? new Intl.NumberFormat('vi-VN').format(Number(v)) : '';

export function EntryPage({ stores, storeId, onStore, onSave, editing, onCancelEdit }: { stores: Store[]; storeId: StoreSelection; onStore:(v:StoreSelection)=>void; onSave:(t:Transaction)=>void; editing:Transaction|null; onCancelEdit:()=>void }) {
  const selected = storeId === 'all' ? 'store-1' : storeId;
  const [draft,setDraft] = useState<Draft>(blank());
  const [error,setError] = useState('');
  useEffect(()=>{ if(editing){ onStore(editing.storeId as StoreSelection); setDraft({date:editing.date,purchaseQuantity:String(editing.purchaseQuantity),purchaseUnitPrice:String(editing.purchaseUnitPrice),saleQuantity:String(editing.saleQuantity),saleUnitPrice:String(editing.saleUnitPrice),note:editing.note||''}); } },[editing]);
  const pQty=safeNumber(draft.purchaseQuantity), pPrice=safeNumber(draft.purchaseUnitPrice), sQty=safeNumber(draft.saleQuantity), sPrice=safeNumber(draft.saleUnitPrice);
  const purchaseTotal=calcPurchaseTotal(pQty,pPrice), saleTotal=calcSaleTotal(sQty,sPrice), profit=calcProfit(sQty,pPrice,saleTotal), remaining=calcRemaining(pQty,sQty);
  const preview = useMemo<Transaction>(()=>({id:editing?.id || `TG-${draft.date.replaceAll('-','')}-PREVIEW`,storeId:selected,date:draft.date,purchaseQuantity:pQty,purchaseUnitPrice:pPrice,purchaseTotal,saleQuantity:sQty,saleUnitPrice:sPrice,saleTotal,profit,remainingQuantity:remaining,note:draft.note,createdAt:editing?.createdAt||new Date().toISOString(),updatedAt:editing?new Date().toISOString():undefined}),[draft,selected,editing,pQty,pPrice,purchaseTotal,sQty,sPrice,saleTotal,profit,remaining]);
  const validate=()=>{ if(!draft.date) return 'Vui lòng chọn ngày giao dịch.'; if(pQty<0||pPrice<0||sQty<0||sPrice<0) return 'Số lượng và giá không được âm.'; if(pQty===0 && sQty===0) return 'Không thể lưu giao dịch rỗng.'; if(sQty>pQty) return 'Số lượng bán ra đang lớn hơn số lượng mua vào.'; return ''; };
  const submit=()=>{ const e=validate(); setError(e); if(e) return; const now=new Date().toISOString(); onSave({...preview,id:editing?.id || `TG-${draft.date.replaceAll('-','')}-${Date.now().toString().slice(-6)}`,createdAt:editing?.createdAt||now,updatedAt:editing?now:undefined}); setDraft(blank()); onCancelEdit(); };
  const reset=()=>{setDraft(blank());setError('');onCancelEdit();};
  const label=stores.find(s=>s.id===selected)?.name||selected;
  return <div className="space-y-5">
    {editing && <div className="rounded-2xl border border-champagne/40 bg-champagne/10 p-4 text-sm font-semibold text-navy">Đang sửa giao dịch <span className="font-mono">{editing.id}</span></div>}
    <StoreSelector stores={stores} value={selected as StoreSelection} onChange={onStore} allowAll={false}/>
    <div className="rounded-3xl bg-white p-5 shadow-soft sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold text-navy">Nhập giao dịch</h2><p className="mt-1 text-sm text-slate-500">Dữ liệu sẽ lưu vào <b>{label}</b>.</p></div><input aria-label="Ngày giao dịch" type="date" value={draft.date} onChange={e=>setDraft({...draft,date:e.target.value})} className="min-h-11 rounded-xl border border-slate-200 bg-appgray px-3 text-sm font-semibold text-navy outline-none focus:border-champagne"/></div>
      {error && <div role="alert" className="mt-4 rounded-2xl border border-danger/20 bg-danger/10 p-3 text-sm font-semibold text-danger">{error}</div>}
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <section className="rounded-3xl bg-appgray p-4 sm:p-5"><h3 className="font-bold text-navy">Số lượng mua vào</h3><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Số lượng mua vào"><input type="number" min="0" inputMode="numeric" value={draft.purchaseQuantity} onChange={e=>setDraft({...draft,purchaseQuantity:e.target.value})} className="field" placeholder="0"/></Field><MoneyField label="Giá mua mỗi cái" raw={draft.purchaseUnitPrice} onRaw={v=>setDraft({...draft,purchaseUnitPrice:v})}/><Field label="Thành tiền mua vào"><div className="readonly">{formatVND(purchaseTotal)}</div></Field></div></section>
        <section className="rounded-3xl bg-appgray p-4 sm:p-5"><h3 className="font-bold text-navy">Số lượng bán ra</h3><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Số lượng bán ra"><input type="number" min="0" inputMode="numeric" value={draft.saleQuantity} onChange={e=>setDraft({...draft,saleQuantity:e.target.value})} className="field" placeholder="0"/></Field><MoneyField label="Giá bán mỗi cái" raw={draft.saleUnitPrice} onRaw={v=>setDraft({...draft,saleUnitPrice:v})}/><Field label="Thành tiền bán ra"><div className="readonly">{formatVND(saleTotal)}</div></Field></div></section>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-navy p-4 text-white"><p className="text-xs text-white/60">Lợi nhuận dự kiến</p><p className={`mt-1 text-xl font-bold ${profit<0?'text-red-300':'text-champagne-light'}`}>{formatVND(profit)}</p><p className="mt-1 text-[11px] text-white/50">Doanh thu bán − giá vốn của số lượng đã bán</p></div><div className={`rounded-2xl p-4 ${remaining<0?'bg-danger/10 text-danger':'bg-success/10 text-success'}`}><p className="text-xs opacity-70">Số lượng tồn còn lại</p><p className="mt-1 text-xl font-bold">{remaining}</p>{remaining<0&&<p className="mt-1 text-xs font-semibold">Không thể lưu khi tồn kho âm.</p>}</div></div>
      <Field label="Ghi chú"><textarea value={draft.note} onChange={e=>setDraft({...draft,note:e.target.value})} className="field min-h-24 resize-none" placeholder="Ghi chú tùy chọn"/></Field>
      <div className="mt-6 grid gap-2 sm:grid-cols-2 xl:grid-cols-5"><button onClick={submit} className="btn-primary"><Save size={18}/>{editing?'Cập nhật':'Lưu giao dịch'}</button><button onClick={reset} className="btn-secondary"><Trash2 size={18}/>Xóa dữ liệu nhập</button><button onClick={onCancelEdit} className="btn-secondary"><RotateCcw size={18}/>Hủy</button><button onClick={()=>{if(validate()){setError(validate());return;} exportPdf([preview],stores,label)}} className="btn-secondary"><FileDown size={18}/>Xuất PDF</button><button onClick={()=>{if(validate()){setError(validate());return;} exportExcel([preview],stores,label)}} className="btn-secondary"><FileDown size={18}/>Xuất Excel</button></div>
    </div>
  </div>;
}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="mt-4 block text-sm font-semibold text-slate-600"><span className="mb-2 block">{label}</span>{children}</label>}
function MoneyField({label,raw,onRaw}:{label:string;raw:string;onRaw:(v:string)=>void}){return <Field label={label}><div className="relative"><input inputMode="numeric" value={displayMoneyInput(raw)} onChange={e=>onRaw(moneyInput(e.target.value))} className="field pr-8" placeholder="0"/><span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">₫</span></div></Field>}
