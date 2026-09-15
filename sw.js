/* 黄金建仓助手 V4.24 —— Service Worker：离线缓存 */
var CACHE = 'gold-assistant-v4.24-'+Date.now();
var ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c){ return c.addAll(ASSETS); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys()
      .then(function(keys){
        return Promise.all(keys.filter(function(k){ return k !== CACHE; })
          .map(function(k){ return caches.delete(k); }));
      })
      .then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if(e.request.method!=='GET') return;
  e.respondWith(
    caches.match(e.request).then(function(resp){
      return resp || fetch(e.request).then(function(r){
        if(r && r.status===200 && e.request.url.indexOf('api.github.com')<0){
          var cp = r.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, cp); });
        }
        return r;
      });
    }).catch(function(){ return caches.match('./index.html'); })
  );
});
