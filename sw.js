// Service worker: rende l'app utilizzabile senza internet dopo la prima apertura.
// Quando pubblichi una nuova versione, aumenta il numero qui sotto.
const VERSIONE = 'scheda-dnd-v1.0.0';

const FILE_APP = [
  './', 'index.html', 'manifest.webmanifest', 'css/style.css',
  'js/main.js', 'js/ui.js', 'js/db.js', 'js/stato.js', 'js/regole.js', 'js/scheda.js', 'js/zaino.js',
  'js/wizard.js', 'js/dadi.js', 'js/backup.js', 'js/modelli.js', 'js/viewer.js', 'js/incantesimi-base.js',
  'vendor/three-bundle.js', 'vendor/draco/draco_wasm_wrapper.js', 'vendor/draco/draco_decoder.wasm',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/favicon.png',
  'esempi/eroe.glb', 'esempi/eroe-armatura-oro.glb', 'esempi/spada.glb', 'esempi/scudo.glb',
  'esempi/elmo.glb', 'esempi/amuleto.glb', 'esempi/faretra.glb', 'esempi/borsa.glb',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSIONE).then((c) => c.addAll(FILE_APP.map((u) => new Request(u, { cache: 'reload' })))));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSIONE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('message', (e) => { if (e.data === 'aggiorna') self.skipWaiting(); });

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(caches.match('index.html').then((r) => r || fetch(req)));
    return;
  }
  e.respondWith((async () => {
    const inCache = await caches.match(req, { ignoreSearch: true });
    if (inCache) return inCache;
    try {
      const r = await fetch(req);
      if (r.ok) (await caches.open(VERSIONE)).put(req, r.clone());
      return r;
    } catch (err) {
      return new Response('Non disponibile offline', { status: 503 });
    }
  })());
});
