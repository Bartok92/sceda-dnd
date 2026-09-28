// Service worker: rende l'app utilizzabile senza internet dopo la prima apertura.
// Quando pubblichi una nuova versione, aumenta il numero qui sotto.
const VERSIONE = 'scheda-dnd-v1.10.0';

const FILE_APP = [
  './', 'index.html', 'manifest.webmanifest', 'css/style.css',
  'js/main.js', 'js/ui.js', 'js/db.js', 'js/stato.js', 'js/regole.js', 'js/scheda.js', 'js/zaino.js',
  'js/wizard.js', 'js/dadi.js', 'js/backup.js', 'js/modelli.js', 'js/viewer.js', 'js/incantesimi-base.js', 'js/dati2024.js', 'js/icone.js', 'js/temi.js', 'js/tavolo.js', 'js/master.js', 'js/effetti.js', 'js/iphone.js', 'css/iphone.css',
  'iphone/', 'iphone/index.html', 'iphone/manifest.webmanifest', 'iphone/avvio-1320x2868.png',
  'fonts/cinzel-latin-500-normal.woff2', 'fonts/cinzel-latin-700-normal.woff2', 'fonts/cinzel-latin-900-normal.woff2',
  'fonts/cinzel-decorative-latin-700-normal.woff2', 'fonts/cinzel-decorative-latin-900-normal.woff2',
  'fonts/alegreya-latin-400-normal.woff2', 'fonts/alegreya-latin-400-italic.woff2', 'fonts/alegreya-latin-500-normal.woff2',
  'fonts/alegreya-latin-700-normal.woff2', 'fonts/alegreya-sc-latin-500-normal.woff2',
  'vendor/three-bundle.js', 'vendor/rete-bundle.js', 'vendor/draco/draco_wasm_wrapper.js', 'vendor/draco/draco_decoder.wasm',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/favicon.png',
  'esempi/eroe.glb', 'esempi/eroe-armatura-oro.glb', 'esempi/spada.glb', 'esempi/scudo.glb',
  'esempi/elmo.glb', 'esempi/amuleto.glb', 'esempi/faretra.glb', 'esempi/borsa.glb',
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSIONE);
    await c.addAll(FILE_APP.map((u) => new Request(u, { cache: 'reload' })));
    // Le versioni fino alla 1.5 rispondevano a ogni indirizzo con la pagina generica, anche per l'edizione iPhone:
    // se ne trovo una, mi attivo subito (una volta sola), così la pagina iphone/ non resta bloccata.
    if ((await caches.keys()).some((k) => /^scheda-dnd-v1\.[0-5]\./.test(k))) self.skipWaiting();
  })());
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
    // Due ingressi alla stessa app: la versione generica e l'edizione iPhone (cartella iphone/)
    const pagina = new URL(req.url).pathname.includes('/iphone/') ? 'iphone/index.html' : 'index.html';
    e.respondWith(caches.match(pagina).then((r) => r || fetch(req)));
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
