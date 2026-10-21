const CACHE_NAME = 'yizhinuan-v3';
const APP_ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    try {
      const response = await fetch(event.request,{cache:'no-store'});
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.request,response.clone());
      }
      return response;
    } catch (_) {
      const cached = await caches.match(event.request,{ignoreSearch:true});
      if (cached) return cached;
      if (event.request.mode === 'navigate') return caches.match('./index.html');
      return new Response('Offline',{status:503,statusText:'Offline'});
    }
  })());
});
