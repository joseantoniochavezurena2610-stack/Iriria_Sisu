// sw.js — keeps Iriria Sìsù usable without signal in the field.
// Own files (page, code, data): network first, so a weekly data update is picked up when
// there is signal; the saved copy is used when there is none.
// Libraries and fonts from CDNs: the saved copy first, refreshed in the background.
// Map tiles and live NASA POWER downloads are never stored.
const CACHE = 'iriria-sisu-v7';
const SHELL = [
  './', 'index.html', 'css/styles.css', 'js/app.js', 'js/engine.js', 'js/climate.js', 'js/strings.js', 'js/icons.js', 'js/choices.js',
  'img/logo.png', 'img/isotipo.png', 'img/favicon.png',
  'data/crops.json', 'data/enso.json', 'data/guanacaste/points.json', 'data/guanacaste/summary.json', 'data/guanacaste/soil_reference.json',
];
const CDN = ['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    e.respondWith(fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
    return;
  }
  if (CDN.includes(url.hostname)) {
    e.respondWith(caches.match(req).then((hit) => {
      const net = fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; }).catch(() => hit);
      return hit || net;
    }));
  }
  // Anything else (OpenStreetMap tiles, NASA POWER live API) goes straight to the network.
});
