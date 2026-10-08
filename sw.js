const CACHE='lexy-sound-v5-offline';const FILES=['./','index.html','style.css?v=4','game.js?v=4','manifest.webmanifest?v=5','assets/lexy.png','assets/icon.png','assets/icon-512.png','assets/URWGothic-Book.otf','assets/URWGothic-Demi.otf','audio/intro.mp3','audio/correct.mp3','audio/retry.mp3','assets/items/bike.png','assets/items/cup.png','assets/items/car.png','assets/items/bus.png','assets/items/ball.png','assets/items/crayon.png','assets/items/ant.png','assets/items/alligator.png',...Array.from({length:10},(_,i)=>['pair','explain'].map(t=>`audio/${String(i+1).padStart(2,'0')}_${t}.mp3`)).flat()];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  if(e.request.mode==='navigate'){
    if(new URL(e.request.url).searchParams.has('app')){
      e.respondWith(caches.match('./').then(c=>c||fetch(e.request)));
      return;
    }
    e.respondWith(fetch(e.request).then(response=>{
      if(response.ok){
        const copy=response.clone();
        e.waitUntil(caches.open(CACHE).then(cache=>cache.put('./',copy)));
      }
      return response;
    }).catch(()=>caches.match('./').then(c=>c||caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request)));
});
