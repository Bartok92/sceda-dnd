// Archivio locale su IndexedDB: personaggi, file 3D e impostazioni.
const NOME_DB = 'scheda-dnd';
const VERSIONE = 1;
let dbPromise = null;

function apri() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((ok, ko) => {
    const req = indexedDB.open(NOME_DB, VERSIONE);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('personaggi')) db.createObjectStore('personaggi', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('file')) db.createObjectStore('file', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('impostazioni')) db.createObjectStore('impostazioni', { keyPath: 'chiave' });
    };
    req.onsuccess = () => ok(req.result);
    req.onerror = () => ko(req.error);
  });
  return dbPromise;
}

async function tx(store, modo, fn) {
  const db = await apri();
  return new Promise((ok, ko) => {
    const t = db.transaction(store, modo);
    const s = t.objectStore(store);
    let risultato;
    const r = fn(s);
    if (r && 'onsuccess' in r) r.onsuccess = () => (risultato = r.result);
    t.oncomplete = () => ok(risultato);
    t.onerror = () => ko(t.error);
    t.onabort = () => ko(t.error || new Error('Operazione annullata (spazio esaurito?)'));
  });
}

export const db = {
  tutti: (store) => tx(store, 'readonly', (s) => s.getAll()),
  leggi: (store, id) => tx(store, 'readonly', (s) => s.get(id)),
  scrivi: (store, obj) => tx(store, 'readwrite', (s) => s.put(obj)),
  elimina: (store, id) => tx(store, 'readwrite', (s) => s.delete(id)),
  svuota: (store) => tx(store, 'readwrite', (s) => s.clear()),
  // Elenco file senza caricare i dati binari in memoria
  async elencoFile() {
    const db0 = await apri();
    return new Promise((ok, ko) => {
      const out = [];
      const t = db0.transaction('file', 'readonly');
      const req = t.objectStore('file').openCursor();
      req.onsuccess = () => {
        const c = req.result;
        if (c) { const { dati, ...resto } = c.value; out.push(resto); c.continue(); }
      };
      t.oncomplete = () => ok(out);
      t.onerror = () => ko(t.error);
    });
  },
  async impostazione(chiave, predefinito = null) {
    const r = await this.leggi('impostazioni', chiave);
    return r ? r.valore : predefinito;
  },
  salvaImpostazione: (chiave, valore) => tx('impostazioni', 'readwrite', (s) => s.put({ chiave, valore })),
};

export const nuovoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export async function chiediPersistenza() {
  try { if (navigator.storage?.persist) return await navigator.storage.persist(); } catch {}
  return false;
}
export async function stimaSpazio() {
  try { if (navigator.storage?.estimate) return await navigator.storage.estimate(); } catch {}
  return null;
}
