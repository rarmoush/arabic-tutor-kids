/* v18b service worker: the app opens offline. Pages: network first, cached copy when offline. Art and icons (file names
   carry a content hash): cache first. Requests to other sites (the AI Worker) are never touched or cached. */
const VER = 'ad544f8d94';
const SHELL = 'shell-' + VER; const ART = 'art-v30'; const AUDIO = 'audio-v30'; /* v30: new name so the redrawn icons/art replace the old cached copies */
const CORE = ['./', './manifest.webmanifest', './icon-192.png', './icon-512.png', './favicon-32.png', './privacy/', './terms/'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(SHELL).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => (k.startsWith('shell-') && k !== SHELL) || (k.startsWith('art-') && k !== ART) || (k.startsWith('audio-') && k !== AUDIO)).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url); if (u.origin !== self.location.origin) return;
  if (/\/audio\/[0-9a-f]{12}\.mp3$/.test(u.pathname)) {
    e.respondWith(caches.open(AUDIO).then((c) => c.match(r, { ignoreVary: true }).then((hit) => hit || fetch(r).then((res) => { if (res.ok && res.status === 200) c.put(r, res.clone()); return res; }))));
    return;
  }
  if (/\/art\/[^/]+\.webp$/.test(u.pathname) || /\.(png|webmanifest)$/.test(u.pathname)) {
    e.respondWith(caches.open(ART).then((c) => c.match(r).then((hit) => hit || fetch(r).then((res) => { if (res.ok) c.put(r, res.clone()); return res; }))));
    return;
  }
  if (r.mode === 'navigate' || /\.html$|\/$/.test(u.pathname)) {
    e.respondWith(fetch(r).then((res) => { if (res.ok) { const cp = res.clone(); caches.open(SHELL).then((c) => c.put(r, cp)); } return res; })
      .catch(() => caches.match(r, { ignoreSearch: true }).then((hit) => hit || caches.match('./'))));
  }
});
