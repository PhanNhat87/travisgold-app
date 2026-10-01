'use strict';

const APP_VERSION='4.19.11';
const CACHE=`travisnote-v${APP_VERSION.replace(/\./g,'')}-customer-debt-focus-row`;

const versioned=path=>`${path}?v=${APP_VERSION}`;

const CORE=[
  '/',
  '/index.html',
  versioned('/styles.css'),
  versioned('/schedule-v472.css'),
  versioned('/schedule-v475.css'),
  versioned('/schedule-v41214.css'),
  versioned('/schedule-v477.css'),
  versioned('/fix-v464.css'),
  versioned('/notes-v480.css'),
  versioned('/notes-v481.css'),
  versioned('/notes-v482.css'),
  versioned('/notes-v483.css'),
  versioned('/notes-v484.css'),
  versioned('/notes-v486.css'),
  versioned('/notes-v487.css'),
  versioned('/notes-v493.css'),
  versioned('/notes-v495.css'),
  versioned('/notes-v496.css'),
  versioned('/notes-v497.css'),
  versioned('/notes-v498.css'),
  versioned('/calendar-v4110.css'),
  versioned('/calendar-v4112.css'),
  versioned('/calendar-v4116.css'),
  versioned('/contacts-v4119.css'),
  versioned('/contact-activity-v41911.css'),
  versioned('/contact-debt-hub-v4198.css'),
  versioned('/calendar-v41212.css'),
  versioned('/calendar-v4190.css'),
  versioned('/ledger-v4132.css'),
  versioned('/ledger-v4134.css'),
  versioned('/ledger-v4140.css'),
  versioned('/ledger-v4142.css'),
  versioned('/ledger-v4150.css'),
  versioned('/ledger-v4151.css'),
  versioned('/ledger-v4160.css'),
  versioned('/ledger-v4162.css'),
  versioned('/ledger-v4181.css'),
  versioned('/ledger-v4184.css'),
  versioned('/ledger-v4185.css'),
  versioned('/ledger-v4186.css'),
  versioned('/startup-v41813.css'),
  versioned('/schedule-v4194.css'),
  versioned('/notes-v488-preload.js'),
  versioned('/app.js'),
  versioned('/fix-v464.js'),
  versioned('/travisbox-v4196.js'),
  versioned('/debt-v4103.js'),
  versioned('/calendar-v4111.js'),
  versioned('/calendar-v4112.js'),
  versioned('/calendar-v4116.js'),
  versioned('/contacts-v4119.js'),
  versioned('/contact-activity-v41911.js'),
  versioned('/contact-debt-hub-v4198.js'),
  versioned('/calendar-v41212.js'),
  versioned('/calendar-share-v41814.js'),
  versioned('/calendar-v4190.js'),
  versioned('/notes-v480.js'),
  versioned('/notes-v493.js'),
  versioned('/notes-v495.js'),
  versioned('/ledger-v4132.js'),
  versioned('/ledger-v4142.js'),
  versioned('/ledger-v4160.js'),
  versioned('/ledger-v4161.js'),
  versioned('/ledger-v4184.js'),
  versioned('/ledger-v41811.js'),
  versioned('/ledger-v41812.js'),
  versioned('/startup-v41813.js'),
  versioned('/schedule-v4194.js'),
  versioned('/manifest.webmanifest'),
  versioned('/icon.svg'),
  '/icon-192-v330.png',
  '/icon-512-v330.png',
  '/apple-touch-icon-v330.png',
  '/favicon.ico'
];

async function precacheCore(){
  const cache=await caches.open(CACHE);
  await Promise.allSettled(
    CORE.map(async url=>{
      const response=await fetch(url,{cache:'reload'});
      if(response.ok)await cache.put(url,response);
    })
  );
}

self.addEventListener('install',event=>{
  event.waitUntil(precacheCore());
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys().then(
      keys=>Promise.all(
        keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;

  const requestUrl=new URL(event.request.url);
  if(requestUrl.origin!==self.location.origin)return;

  const updateCache=async()=>{
    const response=await fetch(event.request);
    if(response.ok){
      const cache=await caches.open(CACHE);
      await cache.put(event.request,response.clone());
    }
    return response;
  };

  if(event.request.mode==='navigate'){
    const networkPromise=updateCache();
    event.waitUntil(networkPromise.catch(()=>{}));

    event.respondWith((async()=>{
      const cached=
        await caches.match(event.request) ||
        await caches.match('/index.html') ||
        await caches.match('/');

      if(cached)return cached;

      try{
        return await networkPromise;
      }catch{
        return new Response('Offline',{
          status:503,
          statusText:'Offline'
        });
      }
    })());
    return;
  }

  if(requestUrl.searchParams.has('v')){
    event.respondWith((async()=>{
      const cached=await caches.match(event.request);
      if(cached)return cached;

      try{
        return await updateCache();
      }catch{
        throw new Error('offline_asset_not_cached');
      }
    })());
    return;
  }

  event.respondWith(
    updateCache().catch(async()=>{
      const cached=await caches.match(event.request);
      if(cached)return cached;
      throw new Error('offline_asset_not_cached');
    })
  );
});
