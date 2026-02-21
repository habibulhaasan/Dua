const CACHE = 'dua-v2';
const STATIC = ['/', '/index.html',
  'https://fonts.googleapis.com/css2?family=Amiri+Quran&family=Noto+Serif+Bengali:wght@400;600&display=swap',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(STATIC.map(u => c.add(u).catch(()=>{})))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.hostname === 'api.aladhan.com' || url.hostname === 'nominatim.openstreetmap.org') {
    e.respondWith(fetch(e.request).then(r => { const c=r.clone(); caches.open(CACHE).then(ca=>ca.put(e.request,c)); return r; }).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(c => c || fetch(e.request).then(r => { if(r.ok){const cl=r.clone();caches.open(CACHE).then(ca=>ca.put(e.request,cl));} return r; }).catch(() => e.request.mode==='navigate' ? caches.match('/index.html') : undefined)));
});
