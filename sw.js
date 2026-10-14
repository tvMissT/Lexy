const CACHE='lexy-sound-balloons-4';const FILES=['./','index.html','style.css?v=balloons-4','game.js?v=balloons-4','manifest.webmanifest?v=balloons-4','assets/lexy.png','assets/icon.png','assets/icon-512.png','assets/URWGothic-Book.otf','assets/URWGothic-Demi.otf','audio/ending.mp3','audio/intro.mp3','audio/correct.mp3','audio/retry.mp3','assets/items/bike.png','assets/items/cup.png','assets/items/car.png','assets/items/bus.png','assets/items/ball.png','assets/items/crayon.png','assets/items/ant.png','assets/items/alligator.png',...Array.from({length:10},(_,i)=>['pair','explain'].map(t=>`audio/${String(i+1).padStart(2,'0')}_${t}.mp3`)).flat()];
const ROOT=new URL(self.registration.scope).pathname;
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('lexy-sound-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin||!u.pathname.startsWith(ROOT)||u.pathname.startsWith(ROOT+'lexy-abc/'))return;
 if(e.request.mode==='navigate'){if(u.pathname!==ROOT&&u.pathname!==ROOT+'index.html')return;e.respondWith(fetch(e.request).catch(()=>caches.open(CACHE).then(c=>c.match('index.html'))));return;}
 e.respondWith(caches.open(CACHE).then(c=>c.match(e.request)).then(hit=>hit||fetch(e.request)));
});
