// Gestione dei modelli 3D: import dei .glb, versioni del personaggio,
// associazione slot → ossa con suggerimenti, regolazione della posizione degli oggetti.
import { h, pannello, conferma, avviso, selezione, fmtMB, scegliFile, chiediTesto, vibra } from './ui.js';
import { stato, modifica, salvaOra } from './stato.js';
import { db, nuovoId } from './db.js';
import * as R from './regole.js';

let V = null; // modulo viewer, caricato solo quando serve
export async function viewer() { return (V ||= await import('./viewer.js')); }

const LIMITE_AVVISO = 25 * 1048576; // 25 MB
const LIMITE_TRIANGOLI = 200000;

// Versione del personaggio da mostrare in base all'armatura equipaggiata
export function versioneDaMostrare(pg) {
  const arm = pg.inventario.find((o) => o.equip && o.slot === 'armatura' && o.versioneModello);
  return pg.modelli.find((m) => m.id === arm?.versioneModello) || pg.modelli.find((m) => m.predefinito) || pg.modelli[0] || null;
}

let coda = Promise.resolve();
export function aggiornaVista() {
  coda = coda.then(async () => {
    const pg = stato.pg; if (!pg) return;
    const v = await viewer();
    if (!v.pronto()) return;
    const versione = versioneDaMostrare(pg);
    await v.mostraPersonaggio(versione, { animazione: pg.animazione });
    if (!versione) return;
    const bone = new Set(R.SLOT.map((s) => s.id));
    await v.sincronizzaOggetti(pg.inventario.filter((o) => o.equip && o.modello && bone.has(o.slot)).map((o) => ({
      id: o.id, slot: o.slot, modello: o.modello, regolazione: o.regolazioni?.[versione.id] || o.regolazioni?._ultimo || null,
    })));
  }).catch((e) => console.error(e));
  return coda;
}

// Salva un file .glb scelto dall'utente nell'archivio del telefono
export async function importaFileGLB(file, tipo) {
  if (!file) return null;
  if (/\.gltf$/i.test(file.name)) { avviso('Serve il formato .glb (un solo file). Da Tripo/Meshy scegli "Esporta GLB".', 'errore'); return null; }
  if (file.size > LIMITE_AVVISO && !(await conferma(`Il file "${file.name}" pesa ${fmtMB(file.size)}. Su iPhone potrebbe essere lento o chiudere l'app. Consiglio: esporta con texture 1024 o 2048 e meno poligoni. Vuoi caricarlo lo stesso?`, { si: 'Carica comunque' }))) return null;
  const buf = await file.arrayBuffer();
  const magic = new TextDecoder().decode(new Uint8Array(buf, 0, 4));
  if (magic !== 'glTF') { avviso('Questo file non è un modello .glb valido.', 'errore'); return null; }
  const id = nuovoId();
  try {
    await db.scrivi('file', { id, nome: file.name, dimensione: buf.byteLength, tipo, dati: buf, creato: Date.now() });
  } catch (e) { avviso('Spazio insufficiente sul telefono: ' + e.message, 'errore'); return null; }
  avviso(`${file.name} salvato (${fmtMB(buf.byteLength)})`);
  return id;
}

// ───────────── Suggerimento automatico delle ossa ─────────────

function gettoni(nome) {
  // three.js toglie punti e due punti dai nomi (es. "Hand.R" → "HandR", "mixamorig:Head" → "mixamorigHead")
  return nome.replace(/^mixamorig\d*[:_]?/i, '').replace(/([a-z])([A-Z])/g, '$1_$2').replace(/([A-Za-z])(\d)/g, '$1_$2').replace(/(\d)([A-Za-z])/g, '$1_$2')
    .toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}
function lato(t) {
  if (t.some((x) => ['right', 'r', 'rt', 'destra', 'dx'].includes(x))) return 'dx';
  if (t.some((x) => ['left', 'l', 'lt', 'sinistra', 'sx'].includes(x))) return 'sx';
  return null;
}
const ESCLUDI = ['end', 'nub', 'top', 'tip', 'finger', 'thumb', 'index', 'middle', 'ring', 'pinky', 'little', 'twist', 'ik', 'pole', 'target', 'ctrl', 'helper'];

function punteggio(slot, nome) {
  const t = gettoni(nome); const tt = t.join('');
  if (t.some((x) => ESCLUDI.includes(x) || /^(finger|thumb|index|middle|ring|pinky)/.test(x))) return 0;
  const l = lato(t);
  const ha = (...p) => p.some((x) => t.includes(x) || tt.includes(x));
  switch (slot) {
    case 'testa': return l ? 0 : ha('head') ? 10 : ha('skull', 'testa') ? 8 : 0;
    case 'collo': return l ? 0 : ha('neck') ? 10 : ha('collo') ? 9 : 0;
    case 'schiena': {
      if (l) return 0;
      if (ha('upperchest')) return 10;
      if (t.includes('chest')) return 9;
      const i = t.indexOf('spine');
      if (i >= 0) { const n = Number(t[i + 1]); return isNaN(n) ? 5 : 5 + Math.min(n, 3); }
      if (ha('torso')) return 7;
      if (ha('abdomen')) return 3;
      return 0;
    }
    case 'cintura': return l ? 0 : ha('hips', 'pelvis') ? 10 : t.includes('hip') ? 8 : ha('root') ? 2 : 0;
    case 'manoDx': case 'manoSx': {
      if (l !== (slot === 'manoDx' ? 'dx' : 'sx')) return 0;
      if (t.includes('hand') || t.includes('mano')) return 10;
      if (t.includes('wrist')) return 9;
      if (t.includes('palm')) return 7;
      if (ha('forearm', 'lowerarm')) return 3;
      return 0;
    }
  }
  return 0;
}

export function suggerisciOssa(nomiOssa) {
  const out = {};
  for (const s of R.SLOT) {
    let migliore = null, best = 0;
    for (const n of nomiOssa) { const p = punteggio(s.id, n); if (p > best) { best = p; migliore = n; } }
    out[s.id] = migliore;
  }
  return out;
}

// ───────────── Pannello gestione modelli ─────────────

export function apriGestioneModelli() {
  pannello('Modelli 3D del personaggio', (c, chiudi) => {
    const disegna = async () => {
      const pg = stato.pg;
      const files = await db.elencoFile();
      const attiva = versioneDaMostrare(pg);
      c.replaceChildren(
        h('p.nota', 'Carica il tuo personaggio in formato .glb (con scheletro, ad esempio da Tripo o Meshy). Puoi avere più versioni, per esempio una per ogni armatura: l\'armatura equipaggiata decide quale mostrare.'),
        pg.modelli.length ? h('div.lista-versioni', pg.modelli.map((m) => {
          const f = files.find((x) => x.id === m.fileId);
          const mappati = R.SLOT.filter((s) => m.ossa?.[s.id]).length;
          return h('div.versione' + (attiva?.id === m.id ? '.attiva' : ''),
            h('div.ver-info',
              h('strong', m.nome, m.predefinito ? h('span.badge.oro', 'predefinito') : null),
              h('small', `${f ? f.nome + ' · ' + fmtMB(f.dimensione) : 'file mancante!'} · ossa associate ${mappati}/6`)),
            h('div.riga-btn.compatta',
              h('button.btn.piccolo', { onclick: () => { chiudi(); apriMappaOssa(m.id); } }, '🦴 Ossa'),
              !m.predefinito ? h('button.btn.piccolo', { onclick: () => { modifica((x) => x.modelli.forEach((y) => (y.predefinito = y.id === m.id)), 'modelli'); disegna(); } }, '★ Predefinito') : null,
              h('button.btn.piccolo', { onclick: async () => { const n = await chiediTesto('Nome della versione', m.nome); if (n) { modifica((x) => (x.modelli.find((y) => y.id === m.id).nome = n), 'modelli'); disegna(); } } }, '✎'),
              h('button.btn.piccolo.pericolo', { onclick: async () => {
                if (!(await conferma(`Eliminare la versione "${m.nome}" e il suo file 3D?`, { si: 'Elimina', pericolo: true }))) return;
                modifica((x) => {
                  x.modelli = x.modelli.filter((y) => y.id !== m.id);
                  if (x.modelli.length && !x.modelli.some((y) => y.predefinito)) x.modelli[0].predefinito = true;
                  x.inventario.forEach((o) => { if (o.versioneModello === m.id) o.versioneModello = ''; });
                }, 'modelli');
                await eliminaFileSeOrfano(m.fileId);
                disegna();
              } }, '🗑')));
        })) : h('p.vuoto', 'Nessun modello caricato.'),
        h('button.btn.grande.primario', { onclick: async () => {
          const f = await scegliFile();
          if (!f) return;
          const id = await importaFileGLB(f, 'personaggio');
          if (!id) return;
          chiudi();
          await nuovaVersione(id, f.name.replace(/\.glb$/i, ''));
        } }, '📂 Carica un modello .glb'),
        h('button.btn.grande', { onclick: async () => { await caricaEsempio(); disegna(); } }, '🤖 Usa il personaggio di esempio'),
        h('p.nota', 'Il modello di esempio è "Robot Expressive" di Tomás Laulhé (Quaternius), licenza CC0: libero per qualsiasi uso.'));
    };
    disegna();
  }, { pieno: true });
}

async function eliminaFileSeOrfano(fileId) {
  const tutti = await db.tutti('personaggi');
  const usato = tutti.some((p) => p.modelli?.some((m) => m.fileId === fileId) || p.inventario?.some((o) => o.modello === fileId));
  if (!usato) await db.elimina('file', fileId);
}

async function nuovaVersione(fileId, nome, { mappa = true } = {}) {
  const v = await viewer();
  const buf = (await db.leggi('file', fileId)).dati;
  let an;
  try { an = await v.analizzaBuffer(buf); } catch (e) { avviso('Il modello non si apre: ' + e.message, 'errore'); await db.elimina('file', fileId); return null; }
  const nomi = an.ossa.map((o) => o.nome);
  avvisiPeso(buf.byteLength, an);
  if (!nomi.length) avviso('Attenzione: questo modello non ha uno scheletro. Si vedrà, ma gli oggetti non potranno essere agganciati.', 'errore');
  const ver = { id: nuovoId(), nome, fileId, ossa: suggerisciOssa(nomi), predefinito: !stato.pg.modelli.length };
  modifica((x) => x.modelli.push(ver), 'modelli');
  await salvaOra();
  if (mappa && nomi.length) apriMappaOssa(ver.id, { nuovo: true });
  return ver;
}

function avvisiPeso(byte, an) {
  const msg = [];
  if (byte > LIMITE_AVVISO) msg.push(`il file pesa ${fmtMB(byte)}`);
  if (an.triangoli > LIMITE_TRIANGOLI) msg.push(`ha ${an.triangoli.toLocaleString('it-IT')} triangoli`);
  if (an.texMax > 2048) msg.push(`ha texture da ${an.texMax}px (verranno ridotte automaticamente)`);
  if (msg.length) avviso('Modello pesante: ' + msg.join(', ') + '. Se l\'app rallenta, esporta una versione più leggera o usa la qualità "Risparmio".', 'errore');
}

async function caricaEsempio() {
  avviso('Carico il personaggio di esempio…');
  try {
    const salva = async (file, nome) => {
      const buf = await (await fetch('esempi/' + file)).arrayBuffer();
      const id = nuovoId();
      await db.scrivi('file', { id, nome: file, dimensione: buf.byteLength, tipo: 'personaggio', dati: buf, creato: Date.now() });
      return nuovaVersione(id, nome, { mappa: false });
    };
    const base = await salva('eroe.glb', 'Robot (esempio)');
    const oro = await salva('eroe-armatura-oro.glb', 'Robot con armatura d\'oro');
    if (!base || !oro) return;
    modifica((x) => {
      x.modelli.forEach((m) => (m.predefinito = m.id === base.id));
      x.inventario.push({ id: nuovoId(), nome: 'Armatura d\'oro', qta: 1, peso: 20, descrizione: 'Armatura di esempio: equipaggiala per cambiare la versione del modello 3D.', tipo: 'armatura', slot: 'armatura', equip: false, modello: null, regolazioni: {}, armatura: { base: 16, tipo: 'pesante' }, bonusCA: 0, versioneModello: oro.id });
    }, 'modelli');
    avviso('Fatto! Nello zaino trovi "Armatura d\'oro": equipaggiala per cambiare modello. Aggiungi anche gli oggetti 3D di prova.');
  } catch (e) { avviso('Errore: ' + e.message, 'errore'); }
}

// ───────────── Associazione slot → ossa ─────────────

export async function apriMappaOssa(versioneId, { nuovo = false } = {}) {
  const pg = stato.pg;
  const ver = pg.modelli.find((m) => m.id === versioneId);
  if (!ver) return;
  document.dispatchEvent(new CustomEvent('vai-tab', { detail: 'eroe' }));
  const v = await viewer();
  await v.mostraPersonaggio(ver, { animazione: pg.animazione });
  const m = v.modelloCorrente();
  const ossa = m ? v.elencoOssa(m.gltf.scene) : [];
  const sugg = suggerisciOssa(ossa.map((o) => o.nome));
  const mappa = { ...ver.ossa };
  const precedentePausa = v.animazioneInPausa();
  v.pausaAnimazione(true);
  pannello(nuovo ? 'Associa gli slot alle ossa' : `Ossa: ${ver.nome}`, (c, chiudi) => {
    c.append(
      h('p.nota', `Scheletro con ${ossa.length} ossa. Ho già scelto le più probabili (✓ consigliato). Tocca uno slot per vedere l'osso sul modello: il punto verde indica dove verrà agganciato l'oggetto.`),
      R.SLOT.map((s) => {
        const sel = h('select.campo', [h('option', { value: '' }, '— nessuno —'), ...ossa.map((o) => h('option', { value: o.nome, selected: mappa[s.id] === o.nome }, ' '.repeat(o.prof * 2) + o.nome + (sugg[s.id] === o.nome ? '  ✓' : '')))]);
        sel.addEventListener('change', () => { mappa[s.id] = sel.value || null; v.evidenziaOsso(sel.value); });
        sel.addEventListener('focus', () => v.evidenziaOsso(sel.value));
        return h('div.riga-osso', h('button.btn-slot', { onclick: () => v.evidenziaOsso(mappa[s.id]) }, s.icona + ' ' + s.nome), sel);
      }),
      h('div.riga-btn',
        h('button.btn', { onclick: () => { Object.assign(mappa, sugg); c.querySelectorAll('select').forEach((sel, i) => (sel.value = sugg[R.SLOT[i].id] || '')); avviso('Suggerimenti ripristinati'); } }, '↺ Suggeriti'),
        h('button.btn.primario', { onclick: () => {
          modifica((x) => (x.modelli.find((y) => y.id === versioneId).ossa = { ...mappa }), 'modelli');
          avviso('Associazione salvata'); chiudi();
        } }, 'Salva')));
  }, { classe: 'basso', onChiudi: () => { v.evidenziaOsso(null); v.pausaAnimazione(precedentePausa); aggiornaVista(); } });
}

// ───────────── Regolazione posizione di un oggetto ─────────────

export async function apriRegolazione(idOggetto) {
  document.dispatchEvent(new CustomEvent('vai-tab', { detail: 'eroe' }));
  const pg = stato.pg;
  const ogg = pg.inventario.find((o) => o.id === idOggetto);
  const ver = versioneDaMostrare(pg);
  if (!ogg || !ver) return avviso('Carica prima un modello del personaggio.', 'errore');
  if (!ver.ossa?.[ogg.slot]) return avviso(`Lo slot "${R.SLOT.find((s) => s.id === ogg.slot)?.nome}" non è associato a nessun osso: sistemalo in Modelli 3D → Ossa.`, 'errore');
  const v = await viewer();
  await aggiornaVista();
  const inner = v.oggettoAgganciato(ogg.id);
  if (!inner) return avviso('Oggetto non visibile sul modello.', 'errore');
  const reg = structuredClone(ogg.regolazioni?.[ver.id] || ogg.regolazioni?._ultimo || v.regolazionePredefinita(ogg.slot));
  const iniziale = structuredClone(reg);
  const precedentePausa = v.animazioneInPausa();
  v.pausaAnimazione(true);
  setTimeout(() => v.focalizza(inner, ogg.slot === 'schiena' ? 1.6 : 1.1), 150);
  let salvato = false;
  pannello('Regola: ' + ogg.nome, (c, chiudi) => {
    const applica = () => v.applicaRegolazione(ogg.id, reg);
    const cursore = (etich, arr, i, min, max, passo, unita = '') => {
      const val = h('span.cur-val');
      const r = h('input.cursore', { type: 'range', min, max, step: passo, value: arr[i] });
      const fmt = () => (val.textContent = (unita === '°' ? Math.round(arr[i]) : Number(arr[i]).toFixed(unita === '×' ? 2 : 3)) + unita);
      const set = (n) => { arr[i] = Math.max(min, Math.min(max, Math.round(n / passo) * passo)); r.value = arr[i]; fmt(); applica(); };
      r.addEventListener('input', () => set(Number(r.value)));
      fmt();
      return h('div.riga-cursore', h('span.cur-etich', etich),
        h('button.btn-mini', { onclick: () => { vibra(4); set(arr[i] - passo); } }, '−'), r,
        h('button.btn-mini', { onclick: () => { vibra(4); set(arr[i] + passo); } }, '+'), val);
    };
    const sezione = h('div.cursori');
    const disegna = () => sezione.replaceChildren(
      h('h4.sottotitolo', 'Spostamento (metri)'),
      cursore('X', reg.p, 0, -0.6, 0.6, 0.005), cursore('Y', reg.p, 1, -0.6, 0.6, 0.005), cursore('Z', reg.p, 2, -0.6, 0.6, 0.005),
      h('h4.sottotitolo', 'Rotazione (gradi)'),
      cursore('X', reg.r, 0, -180, 180, 1, '°'), cursore('Y', reg.r, 1, -180, 180, 1, '°'), cursore('Z', reg.r, 2, -180, 180, 1, '°'),
      h('h4.sottotitolo', 'Scala'),
      cursore('×', reg, 's', 0.05, 4, 0.01, '×'));
    disegna();
    const pausa = h('label.check', h('input', { type: 'checkbox', checked: true, onchange: (e) => v.pausaAnimazione(e.target.checked) }), ' Ferma l\'animazione mentre regolo');
    c.append(sezione, pausa,
      h('div.riga-btn',
        h('button.btn', { onclick: () => { Object.assign(reg, v.regolazionePredefinita(ogg.slot)); disegna(); applica(); } }, '↺ Azzera'),
        h('button.btn', { onclick: () => v.focalizza(inner, 0.8) }, '🔍 Avvicina'),
        h('button.btn.primario', { onclick: () => {
          modifica((x) => { const y = x.inventario.find((z) => z.id === ogg.id); y.regolazioni ||= {}; y.regolazioni[ver.id] = structuredClone(reg); y.regolazioni._ultimo = structuredClone(reg); }, 'equip');
          salvato = true; avviso('Posizione salvata'); chiudi();
        } }, 'Salva')));
  }, { classe: 'basso', onChiudi: () => { if (!salvato) v.applicaRegolazione(ogg.id, iniziale); v.pausaAnimazione(precedentePausa); v.ricentra(); } });
}
