/* v18b service worker: the app opens offline. Pages: network first, cached copy when offline. Art and icons (file names
   carry a content hash): cache first. Requests to other sites (the AI Worker) are never touched or cached. */
const VER = '6b4af38583';
const SHELL = 'shell-' + VER; const V50 = 'v59-assets'; /* v54.7 bump */ /* v54: renamed so every phone drops art cached before v54 */ /* v50: content-hashed app code, fonts, art/v49 + art/v50 (cache first) */ const ART = 'art-v32'; const AUDIO = 'audio-v33'; /* v31: new names with the story covers, game icons and extra clips */
const CORE = ['./', './app.ddb55e8270.js', './chunk-audio.0eb2c407c4.js', './fonts/Readex-arabic.woff2', './fonts/Readex-latin.woff2', './fonts/NotoNaskh-arabic.woff2', './fonts/ElMessiri-500-arabic.woff2', './manifest.webmanifest', './icon-192.png?v=54', './icon-512.png?v=54', './favicon-32.png?v=54', './favicon.ico?v=54', './privacy/', './terms/'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(SHELL).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => (k.startsWith('shell-') && k !== SHELL) || (k.startsWith('art-') && k !== ART) || (k.startsWith('audio-') && k !== AUDIO) || (/^v5[0-9]-assets$/.test(k) && k !== V50)).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url); if (u.origin !== self.location.origin) return;
  if (/\/audio\/[0-9a-f]{12}\.mp3$/.test(u.pathname)) {
    e.respondWith(caches.open(AUDIO).then((c) => c.match(r, { ignoreVary: true }).then((hit) => hit || fetch(r).then((res) => { if (res.ok && res.status === 200) c.put(r, res.clone()); return res; }))));
    return;
  }
  if (/\/(app|chunk-[a-z]+)\.[0-9a-f]{10}\.js$/.test(u.pathname) || /\/fonts\/[^/]+\.woff2$/.test(u.pathname) || /\/art\/v(49|50|51|54)\/[^/]+\.(webp|jpg|png)$/.test(u.pathname)) {
    e.respondWith(caches.open(V50).then((c) => c.match(r).then((hit) => hit || fetch(r).then((res) => { if (res.ok && res.status === 200) c.put(r, res.clone()); return res; }))));
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
