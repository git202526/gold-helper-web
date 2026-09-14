/* 黄金建仓助手 V2.5.1 —— Service Worker：离线缓存 */
var CACHE = 'gold-assistant-v3.5.7';
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
  var req = e.request;
  if(req.method !== 'GET') return;
  // 只处理同源页面/静态资源；跨域行情接口（gold-api 等）直接放行
  if(req.url.indexOf(self.location.origin) !== 0) return;
  // 网络优先：先请求最新内容（线上更新即时生效），失败才回退缓存
  e.respondWith(
    fetch(req)
      .then(function(res){
        if(res && res.status === 200){
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(req, copy); });
        }
        return res;
      })
      .catch(function(){
        return caches.match(req).then(function(cached){
          if(cached) return cached;
          return caches.match('./index.html');
        });
      })
  );
});
