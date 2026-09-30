import { useEffect, useMemo, useState } from 'react';
import { AppShell, type PageKey } from './components/AppShell';
import { PwaGuide } from './components/PwaGuide';
import { Toast } from './components/Toast';
import { DashboardPage } from './pages/DashboardPage';
import { EntryPage } from './pages/EntryPage';
import { HistoryPage } from './pages/HistoryPage';
import { ReportsPage } from './pages/ReportsPage';
import { StoresPage } from './pages/StoresPage';
import { SettingsPage } from './pages/SettingsPage';
import { defaultStores } from './data/sampleData';
import type { AppSettings, StoreSelection, Transaction } from './types';
import { clearAll, loadSettings, loadStores, loadTransactions, saveSettings, saveStores, saveTransactions } from './utils/storage';

const titles: Record<PageKey, string> = {
  dashboard: 'Tổng quan', entry: 'Nhập giao dịch', history: 'Lịch sử giao dịch', reports: 'Báo cáo', stores: 'Quản lý cửa hàng', settings: 'Cài đặt',
};

export default function App() {
  const [page,setPage]=useState<PageKey>('dashboard');
  const [selection,setSelection]=useState<StoreSelection>('all');
  const [stores,setStores]=useState(loadStores);
  const [transactions,setTransactions]=useState(loadTransactions);
  const [settings,setSettings]=useState<AppSettings>(loadSettings);
  const [editing,setEditing]=useState<Transaction|null>(null);
  const [toast,setToast]=useState('');
  const [guide,setGuide]=useState(false);

  useEffect(()=>saveStores(stores),[stores]);
  useEffect(()=>saveTransactions(transactions),[transactions]);
  useEffect(()=>saveSettings(settings),[settings]);
  useEffect(()=>{ if(!toast)return; const id=setTimeout(()=>setToast(''),2600); return ()=>clearTimeout(id); },[toast]);

  const saveTx=(tx:Transaction)=>{
    setTransactions(prev=> prev.some(x=>x.id===tx.id) ? prev.map(x=>x.id===tx.id?tx:x) : [tx,...prev]);
    setToast(editing?'Đã cập nhật giao dịch thành công':'Đã lưu giao dịch thành công');
    setEditing(null);
  };
  const editTx=(tx:Transaction)=>{ setEditing(tx); setSelection(tx.storeId as StoreSelection); setPage('entry'); };
  const deleteTx=(id:string)=>{ if(!confirm('Bạn có chắc muốn xóa giao dịch này?'))return; setTransactions(prev=>prev.filter(x=>x.id!==id)); setToast('Đã xóa giao dịch'); };
  const cloneTx=(t:Transaction)=>{ const now=new Date().toISOString(); const copy={...t,id:`TG-${t.date.replaceAll('-','')}-${Date.now().toString().slice(-6)}`,createdAt:now,updatedAt:undefined,note:t.note?`${t.note} (bản sao)`:'Bản sao'}; setTransactions(prev=>[copy,...prev]); setToast('Đã nhân bản giao dịch'); };
  const resetAll=()=>{ clearAll(); setTransactions([]); setStores(defaultStores); setSettings({currency:'VND',sampleEnabled:false,version:'1.0.1'}); setSelection('all'); setToast('Đã xóa toàn bộ dữ liệu'); };

  const content = useMemo(()=>{
    switch(page){
      case 'entry': return <EntryPage stores={stores} storeId={selection} onStore={setSelection} onSave={saveTx} editing={editing} onCancelEdit={()=>setEditing(null)}/>;
      case 'history': return <HistoryPage stores={stores} transactions={transactions} selection={selection} onSelection={setSelection} onEdit={editTx} onDelete={deleteTx} onClone={cloneTx}/>;
      case 'reports': return <ReportsPage stores={stores} transactions={transactions} selection={selection} onSelection={setSelection}/>;
      case 'stores': return <StoresPage stores={stores} selection={selection} onSelection={setSelection}/>;
      case 'settings': return <SettingsPage stores={stores} settings={settings} transactions={transactions} selection={selection} onSelection={setSelection} onStores={setStores} onSettings={setSettings} onTransactions={setTransactions} onClear={resetAll} onGuide={()=>setGuide(true)} onToast={setToast}/>;
      default: return <DashboardPage stores={stores} transactions={transactions} selection={selection} onSelection={setSelection}/>;
    }
  },[page,stores,transactions,selection,settings,editing]);

  return <>
    <AppShell page={page} setPage={(p)=>{setPage(p); if(p!=='entry')setEditing(null);}} title={titles[page]}>{content}<footer className="mt-8 pb-2 text-center text-xs text-slate-400">TravisGold Internal Management • v{settings.version}</footer></AppShell>
    {toast&&<Toast message={toast} onClose={()=>setToast('')}/>}<PwaGuide open={guide} onClose={()=>setGuide(false)}/>
  </>;
}
