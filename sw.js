const C='gold54';
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  const u=e.request;
  if(u.method!=='GET'||!u.url.startsWith(self.location.origin))return;
  e.respondWith(
    caches.open(C).then(c=>c.match(u).then(hit=>{
      const f=fetch(u).then(res=>{ if(res&&res.status===200)c.put(u,res.clone()); return res; }).catch(()=>hit);
      return hit||f;
    }))
  );
});
