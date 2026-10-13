// Rakbin service worker — toujours la dernière version, page disponible même avec une connexion faible
const CACHE = 'rakbin-v2';
const SHELL = ['./', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(()=>{})); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return; // Firebase, cartes : réseau direct
  const isPage = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html') || url.pathname.endsWith('version.json');
  // Pages : jamais le cache HTTP (toujours la nouvelle version) ; images : cache normal
  e.respondWith(fetch(isPage ? new Request(req, { cache: 'no-store' }) : req)
    .then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; })
    .catch(() => caches.match(req).then(m => m || caches.match('./'))));
});
