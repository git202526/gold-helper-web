/* 黄金建仓助手 V4.25 —— Service Worker：离线缓存（网络优先，保证 dashboard 等页面始终最新） */
var CACHE = 'gold-assistant-v4.25-'+Date.now();
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
  if(e.request.url.indexOf('api.github.com')>=0 || e.request.url.indexOf('gold-api.com')>=0 || e.request.url.indexOf('er-api.com')>=0) return;
  e.respondWith(
    fetch(e.request).then(function(r){
      if(r && r.status===200){
        var cp = r.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, cp); });
      }
      return r;
    }).catch(function(){
      return caches.match(e.request).then(function(m){
        return m || caches.match('./index.html');
      });
    })
  );
});
