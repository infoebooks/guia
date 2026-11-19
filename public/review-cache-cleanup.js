/* Remove only the old review shell cache. Account data and backups are preserved. */
(async function(){
  if('serviceWorker' in navigator){
    const registrations=await navigator.serviceWorker.getRegistrations();
    for(const registration of registrations){
      const scripts=[registration.active,registration.waiting,registration.installing].filter(Boolean);
      if(registration.scope===location.origin+'/'&&scripts.some(worker=>worker.scriptURL===location.origin+'/sw.js'))await registration.unregister();
    }
  }
  if('caches' in window){for(const key of await caches.keys())if(key.startsWith('guia-rdc-shell-'))await caches.delete(key);}
})().catch(()=>{});
