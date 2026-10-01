(()=>{
'use strict';

/*
  TravisNote v4.19.11 - Debt Focus Row

  Muc tieu:
  - Giu khu vuc Hoat dong gon nhe.
  - Chi de 1 nut "Cong no" o tieu de (da duoc v4.19.8 xu ly).
  - Bo sung che do chon nhanh cong no ngay trong danh sach.
  - Co "Chon tat ca", hien thi so da chon va tong gia tri.
  - "Hoan tat" se xoa khoan cong no da chon khoi du lieu ngay lap tuc.
  - Bo 4 chip loc de giao dien gon hon.
  - Chi giu the Cong no + nut Tat ca / Hoan tat theo trang thai.
  - Timeline Hoat dong van giu du lieu Lich / Ghi chu / Cong no.
  - Khong can thay doi schema du lieu cua app.
*/

const STORAGE_KEY='travisnote_data_v1';

let activeContactId='';
let activeFilter='all';
let observer=null;
let decorating=false;
let patched=false;
const selectedDebtIdsByContact=new Map();

function appEl(){
  return document.getElementById('app');
}

function isContactRoute(){
  return appEl()?.dataset?.route==='contact';
}

function readState(){
  try{
    const data=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');
    return data&&typeof data==='object'
      ?data
      :{contacts:[],events:[],notes:[],debts:[],payments:[]};
  }catch{
    return {contacts:[],events:[],notes:[],debts:[],payments:[]};
  }
}

function writeState(nextState){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(nextState));
  setTimeout(()=>{
    try{
      window.dispatchEvent(new StorageEvent('storage',{key:STORAGE_KEY}));
    }catch{
      window.dispatchEvent(new Event('focus'));
    }
    window.dispatchEvent(new Event('focus'));
    decorate();
  },0);
}

function esc(value=''){
  return String(value).replace(/[&<>"']/g,ch=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  }[ch]));
}

function money(value){
  return `${Math.round(Number(value)||0).toLocaleString('vi-VN')} ₫`;
}

function moneyPlain(value){
  return `${Math.round(Number(value)||0).toLocaleString('vi-VN')} đ`;
}

function dateParts(value=''){
  const p=String(value||'').split('-');
  if(p.length!==3)return{day:'—',year:''};
  return{day:`${p[2]}/${p[1]}`,year:p[0]};
}

function localDateFromTs(ts){
  if(!ts)return'';
  const d=new Date(Number(ts));
  if(Number.isNaN(d.getTime()))return'';
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function localTimeFromTs(ts){
  if(!ts)return'';
  const d=new Date(Number(ts));
  if(Number.isNaN(d.getTime()))return'';
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function remainingDebt(state,debt){
  const paid=(state.payments||[])
    .filter(p=>String(p?.debtId||'')===String(debt?.id||'')&&!p?.reversed)
    .reduce((sum,p)=>sum+Number(p?.amount||0),0);

  return Math.max(0,Number(debt?.amount||0)-paid);
}

function getSelectionSet(contactId){
  const key=String(contactId||'');
  if(!selectedDebtIdsByContact.has(key)){
    selectedDebtIdsByContact.set(key,new Set());
  }
  return selectedDebtIdsByContact.get(key);
}

function pruneSelection(contactId,debtItems){
  const valid=new Set((debtItems||[]).map(item=>String(item.id||'')));
  const set=getSelectionSet(contactId);
  [...set].forEach(id=>{
    if(!valid.has(String(id||'')))set.delete(String(id||''));
  });
  return set;
}

function debtSelectionSummary(contactId,debtItems){
  const set=pruneSelection(contactId,debtItems);
  const selectedItems=(debtItems||[]).filter(item=>set.has(String(item.id||'')));
  const selectedTotal=selectedItems.reduce((sum,item)=>sum+Number(item.remainingAmount||0),0);
  const totalCount=(debtItems||[]).length;
  const selectedCount=selectedItems.length;
  return {
    set,
    selectedIds:selectedItems.map(item=>String(item.id||'')),
    selectedItems,
    totalCount,
    selectedCount,
    selectedTotal,
    allSelected:totalCount>0&&selectedCount===totalCount
  };
}

function toggleDebtSelection(contactId,debtId){
  const set=getSelectionSet(contactId);
  const id=String(debtId||'');
  if(!id)return;
  if(set.has(id))set.delete(id);
  else set.add(id);
  decorate();
}

function toggleSelectAllDebts(contactId,debtItems){
  const summary=debtSelectionSummary(contactId,debtItems);
  const set=getSelectionSet(contactId);
  if(summary.allSelected){
    set.clear();
  }else{
    set.clear();
    debtItems.forEach(item=>set.add(String(item.id||'')));
  }
  decorate();
}

async function completeSelectedDebts(contactId,debtItems){
  const summary=debtSelectionSummary(contactId,debtItems);
  if(!summary.selectedCount)return;

  /*
    v4.19.11: dung luong core App de xoa cong no.
    App.completeBulkDebts cap nhat ca state trong bo nho, payments,
    share history, localStorage, toast va render. Tranh lech du lieu
    giua Activity Timeline va cac man hinh khac.
  */
  if(
    typeof window.App?.clearBulkDebts==='function' &&
    typeof window.App?.toggleBulkDebt==='function' &&
    typeof window.App?.completeBulkDebts==='function'
  ){
    window.App.clearBulkDebts(contactId);
    summary.selectedIds.forEach(id=>{
      window.App.toggleBulkDebt(id,true);
    });

    const result=window.App.completeBulkDebts(contactId);
    if(result&&typeof result.then==='function'){
      await result;
    }

    getSelectionSet(contactId).clear();
    setTimeout(decorate,0);
    return;
  }

  /* Fallback an toan neu runtime core cu khong co bulk API. */
  const message=
    summary.selectedCount===1
      ?`Đánh dấu đã thanh toán và xóa 1 khoản công nợ (${moneyPlain(summary.selectedTotal)})?`
      :`Đánh dấu đã thanh toán và xóa ${summary.selectedCount} khoản công nợ (${moneyPlain(summary.selectedTotal)})?`;

  if(typeof window.confirm==='function'&&!window.confirm(message))return;

  const state=readState();
  const idSet=new Set(summary.selectedIds);
  state.debts=(state.debts||[]).filter(
    debt=>!idSet.has(String(debt?.id||''))
  );
  state.payments=(state.payments||[]).filter(
    payment=>!idSet.has(String(payment?.debtId||''))
  );
  getSelectionSet(contactId).clear();
  writeState(state);
}

function svgCalendar(){
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M7 3v3M17 3v3M4.5 8.5h15M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
      stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function svgNote(){
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 3.5h9l3 3V20H6V3.5Z"
      stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M15 3.5v4h4M9 11h6M9 15h6"
      stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`;
}

function svgDebt(){
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.8"/>
    <path d="M14.8 8.5c-.7-.7-1.6-1-2.7-1-1.5 0-2.6.7-2.6 1.8 0 1.2 1 1.6 2.8 2 1.7.4 2.6.9 2.6 2.1 0 1.2-1.1 2-2.8 2-1.2 0-2.3-.4-3.1-1.2M12 6v12"
      stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
  </svg>`;
}

function svgEmpty(){
  return `<svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
    <rect x="14" y="10" width="30" height="42" rx="7"
      stroke="currentColor" stroke-width="3"/>
    <path d="M23 22h13M23 30h13M23 38h8"
      stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <circle cx="45" cy="45" r="11" fill="currentColor" opacity=".16"/>
    <path d="M45 39v6l4 2"
      stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function svgCheck(){
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6.5 12.5 10 16l7.5-8"
      stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function svgSliders(){
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 7h10M18 7h2M4 17h3M11 17h9M14 4v6M8 14v6"
      stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>
  </svg>`;
}

function kindLabel(kind){
  if(kind==='event')return'Lịch';
  if(kind==='note')return'Ghi chú';
  if(kind==='debt')return'Công nợ';
  return'Tất cả';
}

function resolveContactId(){
  if(activeContactId)return activeContactId;

  const state=readState();
  const name=document.querySelector(
    '.customerProfile .profileHeroIdentity h2'
  )?.textContent?.trim()||'';

  const meta=document.querySelector(
    '.customerProfile .profileHeroMeta'
  )?.textContent?.trim()||'';

  if(!name)return'';

  const sameName=(state.contacts||[]).filter(
    c=>String(c?.name||'').trim()===name
  );

  if(sameName.length===1){
    activeContactId=String(sameName[0].id||'');
    return activeContactId;
  }

  if(sameName.length>1&&meta){
    const exact=sameName.find(c=>
      meta.includes(String(c?.phone||'').trim()) ||
      meta.includes(String(c?.email||'').trim())
    );
    if(exact){
      activeContactId=String(exact.id||'');
      return activeContactId;
    }
  }

  return'';
}

function collectActivities(contactId){
  const state=readState();
  const items=[];

  (state.events||[])
    .filter(e=>String(e?.contactId||'')===contactId)
    .forEach(e=>{
      const date=String(e?.date||'');
      const time=String(e?.start||'');
      items.push({
        kind:'event',
        id:String(e?.id||''),
        date,
        time,
        sortKey:`${date||'0000-00-00'}T${time||'00:00'}`,
        title:String(e?.title||'Lịch hẹn'),
        meta:[
          e?.location,
          e?.content
        ].filter(Boolean).map(String)
      });
    });

  (state.notes||[])
    .filter(n=>String(n?.contactId||'')===contactId)
    .forEach(n=>{
      const fallbackTs=Number(n?.updatedAt||n?.createdAt||0);
      const date=String(n?.taskDate||'')||localDateFromTs(fallbackTs);
      const time=String(n?.taskTime||'')||localTimeFromTs(fallbackTs);
      items.push({
        kind:'note',
        id:String(n?.id||''),
        date,
        time,
        sortKey:`${date||'0000-00-00'}T${time||'00:00'}`,
        title:String(n?.title||'Ghi chú'),
        meta:[
          n?.content,
          ...(Array.isArray(n?.tags)&&n.tags.length
            ?[`#${n.tags.join(' #')}`]
            :[])
        ].filter(Boolean).map(String)
      });
    });

  (state.debts||[])
    .filter(d=>
      String(d?.contactId||'')===contactId &&
      d?.status!=='paid' &&
      remainingDebt(state,d)>0
    )
    .forEach(d=>{
      const date=String(d?.incurredDate||'')||
        localDateFromTs(Number(d?.updatedAt||d?.createdAt||0));
      const time=String(d?.incurredTime||'')||
        localTimeFromTs(Number(d?.updatedAt||d?.createdAt||0));
      const remain=remainingDebt(state,d);
      const recv=d?.type==='owed_to_me';

      items.push({
        kind:'debt',
        id:String(d?.id||''),
        date,
        time,
        sortKey:`${date||'0000-00-00'}T${time||'00:00'}`,
        title:recv
          ?`Còn phải thu ${money(remain)}`
          :`Cần trả ${money(remain)}`,
        meta:[
          d?.reason,
          d?.note&&d.note!=='Tạo từ TravisBox'
            ?d.note
            :''
        ].filter(Boolean).map(String),
        moneyTone:recv?'recv':'pay',
        remainingAmount:remain
      });
    });

  items.sort((a,b)=>
    String(b.sortKey).localeCompare(String(a.sortKey))
  );

  return items;
}

function filterButton(kind,count){
  return `<button type="button"
    class="tn4197Filter ${activeFilter===kind?'active':''}"
    data-tn4197-filter="${kind}"
    aria-pressed="${activeFilter===kind?'true':'false'}">
    ${esc(kind==='all'?'Tất cả':kindLabel(kind))}
    <span>(${count})</span>
  </button>`;
}

function actionButton(kind,contactId){
  const icon=kind==='event'
    ?svgCalendar()
    :kind==='note'
      ?svgNote()
      :svgDebt();

  const label=kind==='event'
    ?'+ Lịch'
    :kind==='note'
      ?'+ Ghi chú'
      :'+ Công nợ';

  return `<button type="button"
    class="tn4197Quick ${kind}"
    data-tn4197-create="${kind}"
    data-contact-id="${esc(contactId)}">
    <span>${icon}</span>
    <b>${label}</b>
  </button>`;
}

function debtCompactControls(contactId,debtItems){
  const summary=debtSelectionSummary(contactId,debtItems);
  const hasSelection=summary.selectedCount>0;
  const canSelect=summary.totalCount>0;

  return `<div class="tn41911CompactRow">
    <div class="tn41911DebtPill" aria-label="Công nợ ${summary.totalCount}">
      <span>${svgDebt()}</span>
      <b>Công nợ (${summary.totalCount})</b>
    </div>

    ${hasSelection?`
      <button type="button"
        class="tn41911ContextAction complete"
        data-tn4199-complete
        data-contact-id="${esc(contactId)}"
        aria-label="Hoàn tất ${summary.selectedCount} khoản ${esc(moneyPlain(summary.selectedTotal))}">
        <span>${svgCheck()}</span>
        <span class="tn41911ActionText">
          <b>Hoàn tất ${summary.selectedCount}</b>
          <small>${esc(moneyPlain(summary.selectedTotal))}</small>
        </span>
      </button>
    `:`
      <button type="button"
        class="tn41911ContextAction all"
        data-tn4199-toggle-all
        data-contact-id="${esc(contactId)}"
        ${canSelect?'':'disabled'}>
        <span>${svgSliders()}</span>
        <b>Tất cả</b>
      </button>
    `}
  </div>`;
}

function itemHtml(item,contactId,debtItems){
  const date=dateParts(item.date);
  const icon=item.kind==='event'
    ?svgCalendar()
    :item.kind==='note'
      ?svgNote()
      :svgDebt();

  const timeMeta=item.kind==='event'&&item.time
    ?`<span class="tn4197Time">${esc(item.time)}</span>`
    :'';

  const meta=(item.meta||[])
    .map(line=>`<small>${esc(line)}</small>`)
    .join('');

  if(item.kind==='debt'){
    const summary=debtSelectionSummary(contactId,debtItems);
    const selected=summary.set.has(String(item.id||''));

    return `<article class="tn4197ActivityItem tn4199DebtItem ${item.kind} ${selected?'selected':''}"
      data-tn4197-open="${esc(item.kind)}"
      data-item-id="${esc(item.id)}">
      <div class="tn4197Date">
        <strong>${esc(date.day)}</strong>
        <span>${esc(date.year)}</span>
      </div>

      <div class="tn4197Line">
        <i></i>
      </div>

      <div class="tn4197Icon">${icon}</div>

      <div class="tn4197ItemBody">
        <div class="tn4197ItemTop">
          <b class="${item.moneyTone||''}">${esc(item.title)}</b>
        </div>
        ${timeMeta?`<div class="tn4197Meta tn4199DebtTimeOnly"><small>${timeMeta.replace(/<[^>]+>/g,'')}</small></div>`:''}
        ${meta?`<div class="tn4197Meta">${meta}</div>`:''}
      </div>

      <button type="button" class="tn4199Check ${selected?'selected':''}"
        data-tn4199-toggle="${esc(item.id)}"
        data-contact-id="${esc(contactId)}"
        aria-label="${selected?'Bỏ chọn khoản':'Chọn khoản'}">
        ${svgCheck()}
      </button>
    </article>`;
  }

  return `<article class="tn4197ActivityItem ${item.kind}"
    data-tn4197-open="${esc(item.kind)}"
    data-item-id="${esc(item.id)}">
    <div class="tn4197Date">
      <strong>${esc(date.day)}</strong>
      <span>${esc(date.year)}</span>
    </div>

    <div class="tn4197Line">
      <i></i>
    </div>

    <div class="tn4197Icon">${icon}</div>

    <div class="tn4197ItemBody">
      <div class="tn4197ItemTop">
        <b class="${item.moneyTone||''}">${esc(item.title)}</b>
        ${timeMeta}
      </div>
      ${meta?`<div class="tn4197Meta">${meta}</div>`:''}
    </div>

    <button type="button" class="tn4197More"
      data-tn4197-open="${esc(item.kind)}"
      data-item-id="${esc(item.id)}"
      aria-label="Mở chi tiết">•••</button>
  </article>`;
}

function emptyHtml(contactId){
  return `<div class="tn4197Empty tn41911Empty">
    <div class="tn4197EmptyIcon">${svgEmpty()}</div>
    <h4>Chưa có hoạt động</h4>
    <p>Thêm công nợ để theo dõi khách hàng thuận tiện hơn.</p>
  </div>`;
}

function sectionHtml(contactId){
  const items=collectActivities(contactId);
  const debtItems=items.filter(x=>x.kind==='debt');
  const shown=items;

  return `<section class="profileSection tn4197ActivitySection tn41911ActivitySection"
    data-tn4197-activity
    data-contact-id="${esc(contactId)}">

    <div class="tn4197ActivityHead">
      <h3>Hoạt động</h3>
    </div>

    <div class="tn4197QuickRow">
      ${actionButton('event',contactId)}
      ${actionButton('note',contactId)}
      ${actionButton('debt',contactId)}
    </div>

    ${debtCompactControls(contactId,debtItems)}

    <div class="tn4197ActivityCard">
      ${shown.length
        ?`<div class="tn4197Timeline">${shown.map(item=>itemHtml(item,contactId,debtItems)).join('')}</div>`
        :emptyHtml(contactId)}
    </div>

  </section>`;
}

function hideLegacySections(profile){
  profile.querySelectorAll(':scope > .profileSection').forEach(section=>{
    if(section.matches('[data-tn4197-activity]')){
      return;
    }

    const title=section.querySelector(
      '.profileSectionHead h3'
    )?.textContent?.trim()||'';

    if(
      title==='Lịch hẹn liên quan' ||
      title==='Ghi chú' ||
      title==='Công nợ hiện tại'
    ){
      section.hidden=true;
      section.dataset.tn4197Hidden='true';
    }
  });
}

function decorate(){
  if(decorating||!isContactRoute())return;

  const profile=document.querySelector('.customerProfile');
  if(!profile)return;

  const contactId=resolveContactId();
  if(!contactId)return;

  decorating=true;

  try{
    hideLegacySections(profile);

    const hero=profile.querySelector(':scope > .profileHeroCard');
    let section=profile.querySelector(':scope > [data-tn4197-activity]');

    const html=sectionHtml(contactId);
    const signature=`${contactId}|${activeFilter}|${html}`;

    if(!section){
      const temp=document.createElement('div');
      temp.innerHTML=html;
      section=temp.firstElementChild;

      if(hero?.nextSibling){
        profile.insertBefore(section,hero.nextSibling);
      }else{
        profile.appendChild(section);
      }

      section.dataset.tn4197Signature=signature;
    }else if(section.dataset.tn4197Signature!==signature){
      const temp=document.createElement('div');
      temp.innerHTML=html;
      const next=temp.firstElementChild;
      next.dataset.tn4197Signature=signature;
      section.replaceWith(next);
      section=next;
    }

    const fab=document.querySelector('.fab');
    if(fab)fab.hidden=true;
  }finally{
    observer?.takeRecords();
    decorating=false;
  }
}

function openItem(kind,id){
  if(kind==='event'){
    window.App?.editEvent?.(id);
    return;
  }

  if(kind==='note'){
    window.App?.editNote?.(id);
    return;
  }

  if(kind==='debt'){
    window.App?.editDebt?.(id);
  }
}

function createItem(kind,contactId){
  if(kind==='event'){
    window.App?.eventForm?.(contactId);
    return;
  }

  if(kind==='note'){
    window.App?.noteForm?.(contactId);
    return;
  }

  if(kind==='debt'){
    window.App?.debtForm?.(contactId);
  }
}

document.addEventListener('click',event=>{
  const toggleAll=event.target.closest?.('[data-tn4199-toggle-all]');
  if(toggleAll){
    event.preventDefault();
    const contactId=String(toggleAll.dataset.contactId||activeContactId||'');
    toggleSelectAllDebts(
      contactId,
      collectActivities(contactId).filter(item=>item.kind==='debt')
    );
    return;
  }

  const toggle=event.target.closest?.('[data-tn4199-toggle]');
  if(toggle){
    event.preventDefault();
    event.stopPropagation();
    toggleDebtSelection(
      String(toggle.dataset.contactId||activeContactId||''),
      String(toggle.dataset.tn4199Toggle||'')
    );
    return;
  }

  const complete=event.target.closest?.('[data-tn4199-complete]');
  if(complete&&!complete.disabled){
    event.preventDefault();
    const contactId=String(complete.dataset.contactId||activeContactId||'');
    completeSelectedDebts(
      contactId,
      collectActivities(contactId).filter(item=>item.kind==='debt')
    );
    return;
  }


  const create=event.target.closest?.('[data-tn4197-create]');
  if(create){
    event.preventDefault();
    createItem(
      String(create.dataset.tn4197Create||''),
      String(create.dataset.contactId||activeContactId||'')
    );
    return;
  }

  const open=event.target.closest?.('[data-tn4197-open]');
  if(open){
    event.preventDefault();
    openItem(
      String(open.dataset.tn4197Open||''),
      String(open.dataset.itemId||'')
    );
  }
});

function patchMethod(name,before){
  const original=window.App?.[name];

  if(typeof original!=='function'||original.__tn4197){
    return;
  }

  const wrapped=function(...args){
    if(before)before(...args);

    const result=original.apply(this,args);

    if(result&&typeof result.finally==='function'){
      result.finally(()=>setTimeout(decorate,0));
    }else{
      setTimeout(decorate,0);
    }

    return result;
  };

  wrapped.__tn4197=true;
  window.App[name]=wrapped;
}

function patchApp(){
  if(patched||!window.App)return false;

  patchMethod('openContact',id=>{
    activeContactId=String(id||'');
    activeFilter='all';
  });

  patchMethod('go',target=>{
    if(target!=='contact'){
      activeContactId='';
      activeFilter='all';
    }
  });

  [
    'saveContact',
    'saveDebt',
    'deleteDebt',
    'partialPayment',
    'completeDebt',
    'restoreDebt',
    'saveEvent',
    'updateEvent',
    'deleteEvent',
    'saveNote',
    'toggleNote',
    'deleteNote'
  ].forEach(name=>patchMethod(name));

  patched=true;
  return true;
}

function observe(){
  const app=appEl();
  if(!app)return false;

  observer?.disconnect();

  observer=new MutationObserver(records=>{
    if(decorating||!records.length)return;
    decorate();
  });

  observer.observe(app,{
    childList:true,
    subtree:true
  });

  return true;
}

function init(){
  if(!patchApp()){
    let tries=0;
    const timer=setInterval(()=>{
      tries+=1;
      if(patchApp()||tries>=30){
        clearInterval(timer);
      }
    },50);
  }

  observe();
  decorate();
}

window.addEventListener('pageshow',()=>{
  observe();
  decorate();
});

window.addEventListener('focus',decorate);

window.addEventListener('storage',event=>{
  if(event.key===STORAGE_KEY){
    decorate();
  }
});

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',init,{once:true});
}else{
  init();
}

})();
