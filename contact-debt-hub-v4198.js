(()=>{
'use strict';

/*
  TravisNote v4.19.8 - Compact Customer Activity + Debt Hub

  Muc tieu:
  - Xoa 2 nut + Them lich hen / + Them ghi chu o Hero.
  - Xoa 3 nut + Lich / + Ghi chu / + Cong no tren Hoat dong.
  - Chi giu 1 nut "Cong no" ben canh tieu de Hoat dong.
  - Nut Cong no mo Debt Hub:
      + Them cong no
      + Chia se / Thanh toan
      + Mo ma QR thanh toan
  - Khoi phuc luong chia se va QR bang chinh ham cu cua app.js:
      App.openDebtShare()
      App.openPaymentSettings()
  - Khong thay doi schema du lieu.
*/

const STORAGE_KEY='travisnote_data_v1';
const PAYMENT_KEY='travisnote_payment_config_v1';

let observer=null;
let decorating=false;
let activeContactId='';

function appEl(){
  return document.getElementById('app');
}

function isContactRoute(){
  return appEl()?.dataset?.route==='contact';
}

function readJson(key,fallback){
  try{
    const value=JSON.parse(localStorage.getItem(key)||'null');
    return value&&typeof value==='object'?value:fallback;
  }catch{
    return fallback;
  }
}

function readState(){
  return readJson(STORAGE_KEY,{
    contacts:[],
    debts:[],
    payments:[]
  });
}

function readPayment(){
  return readJson(PAYMENT_KEY,{
    qrDataUrl:''
  });
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

function remainingDebt(state,debt){
  const paid=(state.payments||[])
    .filter(p=>
      String(p?.debtId||'')===String(debt?.id||'') &&
      !p?.reversed
    )
    .reduce((sum,p)=>sum+Number(p?.amount||0),0);

  return Math.max(
    0,
    Number(debt?.amount||0)-paid
  );
}

function activeDebts(state,contactId){
  return (state.debts||[]).filter(d=>
    String(d?.contactId||'')===String(contactId||'') &&
    d?.status!=='paid' &&
    remainingDebt(state,d)>0
  );
}

function resolveContactId(){
  const activity=document.querySelector(
    '[data-tn4197-activity][data-contact-id]'
  );

  if(activity?.dataset?.contactId){
    activeContactId=String(activity.dataset.contactId);
    return activeContactId;
  }

  if(activeContactId)return activeContactId;

  const state=readState();
  const name=document.querySelector(
    '.customerProfile .profileHeroIdentity h2'
  )?.textContent?.trim()||'';

  if(!name)return'';

  const matches=(state.contacts||[]).filter(
    c=>String(c?.name||'').trim()===name
  );

  if(matches.length===1){
    activeContactId=String(matches[0].id||'');
  }

  return activeContactId;
}

function svgDebt(){
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5"
      stroke="currentColor" stroke-width="1.8"/>
    <path d="M14.8 8.5c-.7-.7-1.6-1-2.7-1-1.5 0-2.6.7-2.6 1.8 0 1.2 1 1.6 2.8 2 1.7.4 2.6.9 2.6 2.1 0 1.2-1.1 2-2.8 2-1.2 0-2.3-.4-3.1-1.2M12 6v12"
      stroke="currentColor" stroke-width="1.7"
      stroke-linecap="round"/>
  </svg>`;
}

function svgShare(){
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="18" cy="5" r="2.4" stroke="currentColor" stroke-width="1.8"/>
    <circle cx="6" cy="12" r="2.4" stroke="currentColor" stroke-width="1.8"/>
    <circle cx="18" cy="19" r="2.4" stroke="currentColor" stroke-width="1.8"/>
    <path d="m8.2 10.9 7.6-4.5M8.2 13.1l7.6 4.5"
      stroke="currentColor" stroke-width="1.8"
      stroke-linecap="round"/>
  </svg>`;
}

function svgQr(){
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="3" width="6" height="6" rx="1"
      stroke="currentColor" stroke-width="1.8"/>
    <rect x="15" y="3" width="6" height="6" rx="1"
      stroke="currentColor" stroke-width="1.8"/>
    <rect x="3" y="15" width="6" height="6" rx="1"
      stroke="currentColor" stroke-width="1.8"/>
    <path d="M15 15h2v2h-2zM19 15h2v4h-2M15 19h2v2h-2M19 21h2"
      stroke="currentColor" stroke-width="1.8"
      stroke-linejoin="round"/>
  </svg>`;
}

function svgPlus(){
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 5v14M5 12h14"
      stroke="currentColor" stroke-width="2"
      stroke-linecap="round"/>
  </svg>`;
}

function svgClose(){
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M7 7l10 10M17 7 7 17"
      stroke="currentColor" stroke-width="2"
      stroke-linecap="round"/>
  </svg>`;
}

function debtSummary(contactId){
  const state=readState();
  const debts=activeDebts(state,contactId);

  let recv=0;
  let pay=0;

  debts.forEach(d=>{
    const remain=remainingDebt(state,d);
    if(d?.type==='owed_to_me'){
      recv+=remain;
    }else{
      pay+=remain;
    }
  });

  return{
    state,
    debts,
    recv,
    pay,
    net:recv-pay
  };
}

function ensureDebtButton(contactId){
  const head=document.querySelector(
    '[data-tn4197-activity] .tn4197ActivityHead'
  );

  if(!head)return;

  let button=head.querySelector('[data-tn4198-debt-hub]');
  const count=debtSummary(contactId).debts.length;

  if(!button){
    button=document.createElement('button');
    button.type='button';
    button.className='tn4198DebtHubButton';
    button.setAttribute('data-tn4198-debt-hub','');
    head.appendChild(button);
  }

  button.dataset.contactId=contactId;
  button.innerHTML=`
    <span>${svgDebt()}</span>
    <b>Công nợ</b>
    ${count?`<i>${count}</i>`:''}
  `;
}

function ensureRoot(){
  let root=document.getElementById('tn4198-debt-hub-root');

  if(!root){
    root=document.createElement('div');
    root.id='tn4198-debt-hub-root';
    document.body.appendChild(root);
  }

  return root;
}

function closeHub(){
  const root=document.getElementById('tn4198-debt-hub-root');
  if(root)root.replaceChildren();
  document.body.classList.remove('tn4198DebtHubOpen');
}

function hubHtml(contactId){
  const state=readState();
  const contact=(state.contacts||[]).find(
    c=>String(c?.id||'')===String(contactId||'')
  );

  const summary=debtSummary(contactId);
  const payment=readPayment();
  const hasQr=Boolean(String(payment?.qrDataUrl||''));
  const canShare=summary.debts.length>0;

  const netLabel=summary.net>0
    ?`Cần thu ${money(summary.net)}`
    :summary.net<0
      ?`Cần trả ${money(Math.abs(summary.net))}`
      :'Đang cân bằng';

  return `<div class="tn4198DebtHubLayer">
    <button type="button"
      class="tn4198DebtHubBackdrop"
      data-tn4198-close
      aria-label="Đóng"></button>

    <section class="tn4198DebtHubSheet"
      role="dialog"
      aria-modal="true"
      aria-label="Công nợ">

      <div class="tn4198DebtHubHandle"></div>

      <header class="tn4198DebtHubHeader">
        <div>
          <span>CÔNG NỢ</span>
          <h3>${esc(contact?.name||'Khách hàng')}</h3>
        </div>

        <button type="button"
          class="tn4198DebtHubClose"
          data-tn4198-close
          aria-label="Đóng">
          ${svgClose()}
        </button>
      </header>

      <div class="tn4198DebtHubSummary">
        <div>
          <span>Số dư hiện tại</span>
          <strong class="${summary.net>0?'recv':summary.net<0?'pay':''}">
            ${esc(netLabel)}
          </strong>
          <small>
            Thu ${esc(money(summary.recv))} · Trả ${esc(money(summary.pay))}
          </small>
        </div>

        <em>${summary.debts.length} khoản</em>
      </div>

      <div class="tn4198DebtHubActions">
        <button type="button"
          class="tn4198DebtAction add"
          data-tn4198-add
          data-contact-id="${esc(contactId)}">
          <span>${svgPlus()}</span>
          <div>
            <b>Thêm công nợ</b>
            <small>Tạo khoản mới</small>
          </div>
        </button>

        <button type="button"
          class="tn4198DebtAction share"
          data-tn4198-share
          data-contact-id="${esc(contactId)}"
          ${canShare?'':'disabled'}>
          <span>${svgShare()}</span>
          <div>
            <b>Chia sẻ / Thanh toán</b>
            <small>${canShare?'Tạo ảnh công nợ và gửi khách':'Chưa có khoản để chia sẻ'}</small>
          </div>
        </button>
      </div>

      <button type="button"
        class="tn4198QrCard ${hasQr?'ready':'missing'}"
        data-tn4198-qr
        data-contact-id="${esc(contactId)}"
        ${canShare?'':'disabled'}>

        <span class="tn4198QrIcon">
          ${hasQr
            ?`<img src="${esc(payment.qrDataUrl)}" alt="QR thanh toán">`
            :svgQr()}
        </span>

        <span class="tn4198QrText">
          <b>Mã QR thanh toán</b>
          <small>
            ${!canShare
              ?'Tạo công nợ trước để thiết lập thanh toán.'
              :hasQr
                ?'QR đã sẵn sàng và sẽ được chèn vào ảnh chia sẻ.'
                :'Chưa có QR · Chạm để thêm ảnh QR thanh toán.'}
          </small>
        </span>

        <strong>${hasQr?'Đã cài':'Thiết lập'}</strong>
      </button>

      ${canShare?`
        <p class="tn4198DebtHubHint">
          Khi chọn “Chia sẻ / Thanh toán”, TravisNote sẽ mở lại màn hình
          công nợ cũ gồm chọn khoản, xem trước, mã QR, lưu ảnh và chia sẻ.
        </p>
      `:''}
    </section>
  </div>`;
}

function openHub(contactId){
  if(!contactId)return;

  const root=ensureRoot();
  root.innerHTML=hubHtml(contactId);
  document.body.classList.add('tn4198DebtHubOpen');
}

function openShare(contactId){
  closeHub();

  if(typeof window.App?.openDebtShare==='function'){
    window.App.openDebtShare(null,contactId);
  }
}

function openQr(contactId){
  closeHub();

  if(
    typeof window.App?.openDebtShare!=='function' ||
    typeof window.App?.openPaymentSettings!=='function'
  ){
    return;
  }

  /*
    openPaymentSettings can debtShareDraft.
    openDebtShare se tao draft tu cac khoan cong no dang xu ly.
  */
  window.App.openDebtShare(null,contactId);

  setTimeout(()=>{
    window.App?.openPaymentSettings?.();
  },0);
}

function decorate(){
  if(decorating||!isContactRoute())return;

  const contactId=resolveContactId();
  if(!contactId)return;

  decorating=true;

  try{
    const heroActions=document.querySelector(
      '.customerProfile .profileHeroActions'
    );

    if(heroActions){
      heroActions.classList.add('tn4198HiddenHeroActions');
    }

    const quickRow=document.querySelector(
      '[data-tn4197-activity] .tn4197QuickRow'
    );

    if(quickRow){
      quickRow.classList.add('tn4198HiddenQuickRow');
    }

    document
      .querySelectorAll(
        '[data-tn4197-activity] .tn4197EmptyActions'
      )
      .forEach(node=>{
        node.classList.add('tn4198HiddenEmptyActions');
      });

    ensureDebtButton(contactId);
  }finally{
    observer?.takeRecords();
    decorating=false;
  }
}

document.addEventListener('click',event=>{
  const close=event.target.closest?.('[data-tn4198-close]');
  if(close){
    event.preventDefault();
    closeHub();
    return;
  }

  const hub=event.target.closest?.('[data-tn4198-debt-hub]');
  if(hub){
    event.preventDefault();
    openHub(
      String(hub.dataset.contactId||resolveContactId()||'')
    );
    return;
  }

  const add=event.target.closest?.('[data-tn4198-add]');
  if(add){
    event.preventDefault();
    const id=String(add.dataset.contactId||'');
    closeHub();
    window.App?.debtForm?.(id);
    return;
  }

  const share=event.target.closest?.('[data-tn4198-share]');
  if(share&&!share.disabled){
    event.preventDefault();
    openShare(String(share.dataset.contactId||''));
    return;
  }

  const qr=event.target.closest?.('[data-tn4198-qr]');
  if(qr&&!qr.disabled){
    event.preventDefault();
    openQr(String(qr.dataset.contactId||''));
  }
});

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
  observe();
  decorate();
}

window.addEventListener('pageshow',()=>{
  observe();
  decorate();
});

window.addEventListener('focus',decorate);

window.addEventListener('storage',event=>{
  if(
    event.key===STORAGE_KEY ||
    event.key===PAYMENT_KEY
  ){
    decorate();
  }
});

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',init,{once:true});
}else{
  init();
}

})();
