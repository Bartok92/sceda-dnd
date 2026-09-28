// Avvio dell'app: elenco personaggi, creazione guidata, scheda a schede scorrevoli.
import { h, $, avviso, pannello, conferma, scegliFile, selezione, campo, fmtMB, impostaIndietro, armaIndietro } from './ui.js';
import { db, chiediPersistenza, stimaSpazio, nuovoId } from './db.js';
import { stato, suCambio, salvaOra, normalizza } from './stato.js';
import * as S from './scheda.js';
import { testoClassi } from './regole.js';
import { renderZaino } from './zaino.js';
import { avviaCreazione } from './wizard.js';
import { apriTiraDadi } from './dadi.js';
import { esportaBackup, importaBackup } from './backup.js';
import { ico, sigillo } from './icone.js';
import { caricaTemaGlobale, applicaTema, temaGlobale, temaPer, apriSceltaTema, pulsanteTema, nomeTema } from './temi.js';
import * as T from './tavolo.js';
import * as E from './effetti.js';
import { mostraMaster } from './master.js';

export const VERSIONE_APP = '1.9.0';
// Edizione iPhone (pagina iphone/): stessi file dell'app, più css/iphone.css e js/iphone.js
export const EDIZIONE_IPHONE = document.documentElement.dataset.edizione === 'iphone';
const QUALITA_PREDEFINITA = EDIZIONE_IPHONE ? 'massima' : 'bilanciata';

// iOS 26, app installata: la finestra risulta più corta dello schermo di ~60 punti (difetto di WebKit).
// Misuro la differenza tra l'altezza vera (100lvh) e quella dichiarata e la uso per spostare giù gli elementi fissi.
const installata = () => navigator.standalone || matchMedia('(display-mode: standalone)').matches;
const misure = { fondoPerso: 0 };
function misuraSchermo() {
  const sonda = document.createElement('div');
  sonda.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:100lvh;visibility:hidden;pointer-events:none';
  document.body.append(sonda);
  const alto = sonda.getBoundingClientRect().height;
  sonda.remove();
  const perso = installata() ? Math.max(0, Math.min(120, Math.round(alto - window.innerHeight))) : 0;
  misure.fondoPerso = perso; misure.alto = Math.round(alto);
  document.documentElement.style.setProperty('--fondo-perso', perso + 'px');
}
misuraSchermo();
addEventListener('resize', () => setTimeout(misuraSchermo, 50));
addEventListener('orientationchange', () => setTimeout(misuraSchermo, 300));

const TABS = [
  { id: 'eroe', nome: 'Eroe', icona: 'eroe' },
  { id: 'combatti', nome: 'Combatti', icona: 'combatti' },
  { id: 'car', nome: 'Abilità', icona: 'abilita' },
  { id: 'magie', nome: 'Magie', icona: 'magie' },
  { id: 'zaino', nome: 'Zaino', icona: 'zaino' },
  { id: 'note', nome: 'Note', icona: 'note' },
];

// Braci luminose che salgono sullo sfondo (schermata iniziale e creazione)
function braci(n = 16) {
  return h('div.braci', Array.from({ length: n }, () => {
    const r = Math.random;
    return h('span', { style: `--x:${(r() * 100).toFixed(1)}%;--d:${(7 + r() * 9).toFixed(1)}s;--r:${(-r() * 14).toFixed(1)}s;--dx:${(r() * 80 - 40).toFixed(0)}px;--s:${(2 + r() * 3).toFixed(1)}px` });
  }));
}
const RENDER = {
  eroe: (c) => { S.renderIntestazione(c); S.renderVita(c); E.renderEffetti(c); T.renderStrisciaCompagni(c); S.renderCondizioni(c); },
  combatti: S.renderCombattimento,
  car: S.renderCaratteristiche,
  magie: S.renderMagie,
  zaino: renderZaino,
  note: S.renderNote,
};

const app = $('#app');

// Installazione dell'app su Android/PC: il browser avvisa quando si può installare
let promptInstalla = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); promptInstalla = e;
  if (document.body.dataset.schermata === 'elenco') mostraElenco();
});
window.addEventListener('appinstalled', () => { promptInstalla = null; avviso('App installata! La trovi tra le tue app.'); });
let modelli = null; // modulo modelli.js (3D), caricato alla prima apertura della scheda

// ───────────────────────── Elenco personaggi ─────────────────────────

async function mostraElenco() {
  await salvaOra();
  T.sospendi();
  stato.pg = null;
  document.body.dataset.vita = '';
  document.body.dataset.schermata = 'elenco';
  applicaTema(temaGlobale());
  const elenco = (await db.tutti('personaggi')).sort((a, b) => (b.modificato || 0) - (a.modificato || 0));
  const standalone = navigator.standalone || matchMedia('(display-mode: standalone)').matches;
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const android = /Android/i.test(navigator.userAgent);
  const ultimoBackup = await db.impostazione('ultimoBackup');
  app.replaceChildren(braci(), h('div.elenco',
    h('header.logo',
      h('img', { src: 'icons/icon-192.png', alt: '' }),
      h('h1', 'Scheda D&D'),
      h('p', 'I tuoi eroi, sempre in tasca')),
    ios && !standalone ? h('div.card.suggerimento',
      h('strong', '📲 Installa l\'app'),
      h('p', 'Tocca il pulsante Condividi ', h('span.ico-share', '⬆'), ' in Safari e scegli "Aggiungi alla schermata Home". Così funziona a schermo intero e anche senza internet.'),
      h('p.nota', 'Nota: l\'app installata ha un archivio separato da Safari. Crea i personaggi dopo averla installata (o usa il backup per trasferirli).')) : null,
    !ios && !standalone && (promptInstalla || android) ? h('div.card.suggerimento',
      h('strong', ico('installa'), ' Installa l\'app'),
      promptInstalla
        ? h('button.btn.primario', { onclick: async () => { const e = promptInstalla; promptInstalla = null; e.prompt(); await e.userChoice.catch(() => null); mostraElenco(); } }, ico('installa'), 'Installa sul telefono')
        : h('p', 'Apri il menu del browser (⋮) e scegli "Installa app" oppure "Aggiungi a schermata Home". Così funziona a schermo intero e anche senza internet.')) : null,
    EDIZIONE_IPHONE && !elenco.length ? h('div.card.suggerimento',
      h('strong', '✦ Edizione iPhone'),
      h('p', 'Per portare qui i tuoi personaggi: nella vecchia app tocca "Backup completo" e salva il file; poi qui tocca "Ripristina" e sceglilo. Arrivano anche i modelli 3D e i tavoli di gioco.')) : null,
    elenco.length ? h('div.lista-pg', elenco.map((p) => h('div.pg-card', { onclick: (e) => !e.target.closest('button') && apriPersonaggio(p.id) },
      h('div.pg-card-icona', sigillo(p.classe)),
      h('div.pg-card-info', h('strong', p.nome), h('small', `${p.razza} · ${testoClassi(p, { sottoclassi: false })}`), h('span.pg-livello', p.livello),
        h('div.barra.mini', h('div.barra-riemp', { style: { width: Math.max(0, Math.min(100, (p.pf.att / p.pf.max) * 100)) + '%' } }))),
      h('button.btn-icona', { 'aria-label': 'Opzioni', onclick: () => menuPersonaggio(p) }, '⋮')))) :
      h('div.card.vuota', h('p', 'Nessun personaggio ancora.'), h('p.nota', 'Crea il tuo primo eroe con la procedura guidata.')),
    h('button.btn.grande.primario', { onclick: nuovoPersonaggio }, ico('piu'), 'Nuovo personaggio'),
    h('button.btn.grande.master-btn', { onclick: apriMaster }, ico('tavolo'), 'Modalità Master'),
    h('div.riga-btn',
      h('button.btn', { onclick: () => esportaBackup().catch((e) => avviso(e.message, 'errore')) }, ico('salva'), 'Backup completo'),
      h('button.btn', { onclick: ripristina }, ico('libro'), 'Ripristina')),
    h('div.riga-btn', pulsanteTema(() => apriSceltaTema())),
    elenco.length && (!ultimoBackup || Date.now() - ultimoBackup > 14 * 864e5) ? h('p.nota.centrato', ultimoBackup ? `Ultimo backup: ${new Date(ultimoBackup).toLocaleDateString('it-IT')}. Fanne uno nuovo ogni tanto!` : 'Consiglio: fai un backup ogni tanto, per non perdere nulla.') : null,
    h('button.btn-link.centrato', { onclick: apriImpostazioni }, '⚙ Impostazioni e informazioni'),
    h('p.piede', `Versione ${VERSIONE_APP}${EDIZIONE_IPHONE ? ' (iPhone)' : ''} · Dungeons & Dragons è un marchio di Wizards of the Coast. Regole dal SRD 5.1 e 5.2 (CC-BY-4.0).`)));
}

function menuPersonaggio(p) {
  pannello(p.nome, (c, chiudi) => {
    c.append(h('div.lista-scelte',
      h('button.btn.grande', { onclick: () => { chiudi(); apriPersonaggio(p.id); } }, '📜 Apri la scheda'),
      h('button.btn.grande', { onclick: async () => {
        const copia = structuredClone(p); copia.id = nuovoId(); copia.nome += ' (copia)'; copia.modificato = Date.now();
        await db.scrivi('personaggi', copia); chiudi(); mostraElenco(); avviso('Personaggio duplicato');
      } }, '⧉ Duplica'),
      h('button.btn.grande', { onclick: () => { chiudi(); esportaBackup([p.id]).catch((e) => avviso(e.message, 'errore')); } }, '💾 Esporta solo questo personaggio'),
      h('button.btn.grande.pericolo', { onclick: async () => {
        chiudi();
        if (!(await conferma(`Eliminare definitivamente "${p.nome}"? Consiglio di fare prima un backup.`, { si: 'Elimina', pericolo: true }))) return;
        await db.elimina('personaggi', p.id);
        await pulisciFileOrfani();
        mostraElenco(); avviso('Personaggio eliminato');
      } }, '🗑 Elimina')));
  });
}

async function pulisciFileOrfani() {
  const tutti = await db.tutti('personaggi');
  const usati = new Set();
  tutti.forEach((p) => { p.modelli?.forEach((m) => usati.add(m.fileId)); p.inventario?.forEach((o) => o.modello && usati.add(o.modello)); });
  for (const f of await db.elencoFile()) if (!usati.has(f.id)) await db.elimina('file', f.id);
}

// Modalità Master: il DM usa l'app senza personaggio (vede il gruppo, manda danni e condizioni, gestisce i turni)
async function apriMaster() {
  await salvaOra();
  stato.pg = null;
  document.body.dataset.vita = '';
  await db.salvaImpostazione('ultimo', '__master__');
  applicaTema(temaGlobale());
  armaIndietro();
  mostraMaster(app, { indietro: mostraElenco });
}

function nuovoPersonaggio() {
  document.body.dataset.schermata = 'wizard';
  applicaTema(temaGlobale());
  armaIndietro();
  const cont = h('div.schermata-wizard');
  app.replaceChildren(braci(10), cont);
  avviaCreazione(cont, {
    onAnnulla: mostraElenco,
    onFine: async (pg) => {
      await db.scrivi('personaggi', pg);
      avviso(`Benvenuto, ${pg.nome}!`);
      apriPersonaggio(pg.id);
    },
  });
}

async function ripristina() {
  const f = await scegliFile('.zip,application/zip');
  if (!f) return;
  pannello('Ripristina backup', (c, chiudi) => {
    const esegui = async (modo) => {
      chiudi();
      if (modo === 'sostituisci' && !(await conferma('Tutti i personaggi attuali verranno sostituiti con quelli del backup. Continuare?', { si: 'Sostituisci', pericolo: true }))) return;
      try {
        avviso('Ripristino in corso…');
        const r = await importaBackup(f, modo);
        avviso(`Ripristinati ${r.personaggi} personaggi e ${r.file} modelli 3D`);
        mostraElenco();
      } catch (e) { avviso('Errore: ' + e.message, 'errore'); }
    };
    c.append(h('p', `File: ${f.name} (${fmtMB(f.size)})`),
      h('div.lista-scelte',
        h('button.btn.grande.primario', { onclick: () => esegui('unisci') }, 'Aggiungi ai personaggi attuali'),
        h('p.nota', 'I personaggi già presenti con lo stesso identificativo vengono aggiornati con la versione del backup.'),
        h('button.btn.grande.pericolo', { onclick: () => esegui('sostituisci') }, 'Sostituisci tutto')));
  });
}

async function apriImpostazioni() {
  const spazio = await stimaSpazio();
  const persistente = await navigator.storage?.persisted?.().catch(() => false);
  const q = await db.impostazione('qualita', QUALITA_PREDEFINITA);
  const files = await db.elencoFile();
  pannello('Impostazioni', (c) => {
    c.append(
      campo('Qualità grafica 3D', selezione([['massima', 'Massima (iPhone Pro, piena risoluzione)'], ['alta', 'Alta (iPhone recenti)'], ['bilanciata', 'Bilanciata (consigliata)'], ['risparmio', 'Risparmio (batteria e iPhone datati)']], q, async (v) => {
        await db.salvaImpostazione('qualita', v);
        if (modelli) { const vw = await modelli.viewer(); vw.impostaQualita(v); }
        avviso('Qualità: ' + v + '. Le texture verranno ridotte al prossimo caricamento del modello.');
      })),
      h('div.card.info',
        h('p', `Modelli 3D salvati: ${files.length} (${fmtMB(files.reduce((s, f) => s + (f.dimensione || 0), 0))})`),
        h('p.nota', `Schermo: ${innerWidth} × ${innerHeight} punti (altezza vera ${misure.alto}, recuperati ${misure.fondoPerso}) · pagina larga ${document.documentElement.scrollWidth} · scheda larga ${document.querySelector('.scheda, .master, .elenco')?.offsetWidth ?? '–'}`),
        spazio ? h('p', `Spazio usato dall'app: ${fmtMB(spazio.usage || 0)}${spazio.quota ? ' su ' + fmtMB(spazio.quota) + ' disponibili' : ''}`) : null,
        h('p', persistente ? '✔ Archivio protetto: il sistema non cancellerà i dati da solo.' : '⚠ Archivio non protetto: installa l\'app nella schermata Home e fai backup regolari.')),
      h('button.btn', { onclick: () => apriSceltaTema() }, ico('tavolozza'), `Tema grafico: ${nomeTema(temaGlobale())}`),
      h('button.btn', { onclick: async () => { await pulisciFileOrfani(); avviso('Pulizia completata'); } }, '🧹 Elimina i file 3D non più usati'),
      h('button.btn', { onclick: async () => {
        const reg = await navigator.serviceWorker?.getRegistration();
        if (!reg) return avviso('Aggiornamenti non disponibili in questa modalità');
        await reg.update(); avviso('Controllo completato. Se c\'è una nuova versione comparirà un avviso.');
      } }, '⟳ Controlla aggiornamenti'),
      h('div.crediti',
        h('p', `Scheda D&D versione ${VERSIONE_APP}${EDIZIONE_IPHONE ? ' · edizione iPhone' : ''}. Funziona senza internet: tutti i dati restano sul tuo telefono.`),
        h('p', 'Caratteri: Cinzel, Cinzel Decorative e Alegreya (SIL Open Font License). Grafica 3D: three.js (licenza MIT). Tavolo di gioco: PeerJS (MIT), jsQR (Apache 2.0), qrcode-generator (MIT). Personaggio di esempio: "Robot Expressive" di Tomás Laulhé / Quaternius (CC0). Oggetti 3D di esempio creati per questa app (CC0).'),
        h('p', 'Regole e incantesimi dal System Reference Document 5.1 di Wizards of the Coast (CC-BY-4.0).')));
  });
}

// ───────────────────────── Scheda del personaggio ─────────────────────────

let strutturaScheda = null;

async function apriPersonaggio(id) {
  const p = await db.leggi('personaggi', id);
  if (!p) return mostraElenco();
  stato.pg = normalizza(p);
  await db.salvaImpostazione('ultimo', id);
  document.body.dataset.schermata = 'scheda';
  applicaTema(temaPer(stato.pg));
  armaIndietro();
  costruisciScheda();
  renderTutte();
  vaiTab(stato.tab || 'eroe', false);
  // 3D: caricato in modo che la scheda sia subito utilizzabile
  try {
    modelli ||= await import('./modelli.js');
    const vw = await modelli.viewer();
    if (!vw.pronto()) {
      vw.impostaQualita(await db.impostazione('qualita', QUALITA_PREDEFINITA));
      vw.suStato(aggiornaStato3D);
    }
    vw.init(strutturaScheda.vista);
    vw.impostaTema?.(document.documentElement.dataset.tema);
    modelli.aggiornaVista();
  } catch (e) {
    console.error(e);
    strutturaScheda.stato3d.replaceChildren(h('p', 'Il 3D non è disponibile su questo dispositivo: ' + e.message));
  }
  aggiornaOverlay3D();
  T.alPersonaggio(stato.pg).catch(console.error);
}

function costruisciScheda() {
  const vista = h('div.vista3d');
  const stato3d = h('div.stato3d');
  const overlay = h('div.overlay3d');
  vista.append(stato3d, overlay);
  const panes = {};
  const contenuti = {};
  const scorrevole = h('div.schede', TABS.map((t) => {
    contenuti[t.id] = h('div.pane-contenuto');
    panes[t.id] = h('section.tab-pane', { 'data-tab': t.id }, t.id === 'eroe' ? vista : null, contenuti[t.id]);
    return panes[t.id];
  }));
  const barra = h('nav.tabbar', TABS.map((t) => h('button', { 'data-tab': t.id, 'aria-label': t.nome, onclick: () => vaiTab(t.id) }, h('span.tab-icona', ico(t.icona)), h('span.tab-nome', t.nome))));
  const titolo = h('div.top-titolo');
  app.replaceChildren(h('div.scheda',
    h('header.barra-top',
      h('button.btn-icona', { 'aria-label': 'Personaggi', onclick: mostraElenco }, ico('personaggi')),
      titolo,
      T.pulsanteTavolo(),
      h('button.btn-icona', { 'aria-label': 'Menu', onclick: menuScheda }, ico('altro'))),
    braci(18), scorrevole, barra,
    h('button.fab-dadi', { 'aria-label': 'Tira i dadi', onclick: apriTiraDadi }, ico('dado'))));
  let t0 = null;
  scorrevole.addEventListener('scroll', () => {
    clearTimeout(t0);
    t0 = setTimeout(() => {
      const i = Math.round(scorrevole.scrollLeft / scorrevole.clientWidth);
      const id = TABS[i]?.id;
      if (id && id !== stato.tab) { stato.tab = id; evidenziaTab(); }
    }, 60);
  }, { passive: true });
  strutturaScheda = { vista, stato3d, overlay, panes, contenuti, scorrevole, barra, titolo };
}

// Menu ⋮ della scheda: tema, backup, dati, elenco
function menuScheda() {
  const p = stato.pg; if (!p) return;
  pannello(p.nome, (c, chiudi) => {
    c.append(h('div.lista-scelte',
      h('button.btn.grande', { onclick: () => { chiudi(); apriSceltaTema({ pg: p, salvaPg: (t) => salvaTemaPg(t) }); } }, ico('tavolozza'), `Tema grafico: ${nomeTema(temaPer(p))}${p.tema ? ' (solo suo)' : ''}`),
      h('button.btn.grande', { onclick: () => { chiudi(); T.apriTavolo(); } }, ico('tavolo'), 'Tavolo di gioco (compagni)'),
      h('button.btn.grande', { onclick: () => { chiudi(); S.apriModificaBase(); } }, ico('note'), 'Modifica i dati del personaggio'),
      h('button.btn.grande', { onclick: () => { chiudi(); esportaBackup([p.id]).catch((e) => avviso(e.message, 'errore')); } }, ico('salva'), 'Backup di questo personaggio'),
      h('button.btn.grande', { onclick: () => { chiudi(); mostraElenco(); } }, ico('personaggi'), 'Torna ai personaggi')));
  });
}
async function salvaTemaPg(t) {
  const { modifica } = await import('./stato.js');
  modifica((x) => (x.tema = t), 'silenzio');
}
// Il 3D segue il tema (luci, nebbia, anello di rune)
document.addEventListener('tema-cambiato', async (e) => {
  if (!modelli) return;
  const vw = await modelli.viewer();
  vw.impostaTema?.(e.detail);
});
// Tasto Indietro: dalla scheda o dalla creazione si torna all'elenco
impostaIndietro(
  () => { if (['scheda', 'wizard', 'master'].includes(document.body.dataset.schermata)) { mostraElenco(); return true; } return false; },
  () => ['scheda', 'wizard', 'master'].includes(document.body.dataset.schermata));

function evidenziaTab() {
  strutturaScheda.barra.querySelectorAll('button').forEach((b) => b.classList.toggle('attivo', b.dataset.tab === stato.tab));
}
function vaiTab(id, animato = true) {
  stato.tab = id;
  const i = TABS.findIndex((t) => t.id === id);
  const sc = strutturaScheda.scorrevole;
  sc.scrollTo({ left: i * sc.clientWidth, behavior: animato ? 'smooth' : 'instant' });
  evidenziaTab();
}
document.addEventListener('vai-tab', (e) => strutturaScheda && vaiTab(e.detail));

function renderTutte() {
  if (!stato.pg || !strutturaScheda) return;
  const p = stato.pg;
  strutturaScheda.titolo.replaceChildren(h('strong', p.nome), h('small', `${testoClassi(p, { sottoclassi: false })} · Liv. ${p.livello}`));
  for (const t of TABS) {
    const pane = strutturaScheda.panes[t.id];
    const top = pane.scrollTop;
    const c = strutturaScheda.contenuti[t.id];
    const nuovo = h('div.pane-contenuto');
    try { RENDER[t.id](nuovo); } catch (e) { console.error(e); nuovo.append(h('p.errore', 'Errore: ' + e.message)); }
    c.replaceWith(nuovo);
    strutturaScheda.contenuti[t.id] = nuovo;
    pane.scrollTop = top;
  }
  aggiornaOverlay3D();
}

suCambio((cosa) => {
  if (cosa === 'silenzio' || !stato.pg) return;
  renderTutte();
  if ((cosa === 'equip' || cosa === 'modelli') && modelli) modelli.aggiornaVista();
});

// ───────────── Overlay del visualizzatore 3D ─────────────

let ultimeAnimazioni = [];
function aggiornaStato3D(s) {
  if (!strutturaScheda) return;
  const st = strutturaScheda.stato3d;
  if (s.caricamento) st.replaceChildren(h('div.caricamento', h('div.spinner'), h('p', 'Evoco il tuo eroe…')));
  else if (s.errore) { st.replaceChildren(); avviso(s.errore, 'errore'); }
  else st.replaceChildren();
  if (s.pronto) {
    ultimeAnimazioni = s.animazioni || [];
    if (s.info?.ridotte) avviso(`Ho ridotto ${s.info.ridotte} texture troppo grandi per restare fluido su iPhone.`);
  }
  if (s.vuoto) ultimeAnimazioni = [];
  aggiornaOverlay3D();
}

function aggiornaOverlay3D() {
  if (!strutturaScheda || !stato.pg) return;
  const p = stato.pg;
  const o = strutturaScheda.overlay;
  const senzaModello = !p.modelli.length;
  o.replaceChildren(
    senzaModello ? h('div.vuoto3d',
      h('p', 'Nessun modello 3D'),
      h('button.btn.primario', { onclick: () => modelli?.apriGestioneModelli() }, 'Carica il tuo personaggio'),
      h('p.nota', 'File .glb con scheletro (Tripo, Meshy…). Puoi provare con il modello di esempio.')) : null,
    !senzaModello ? h('div.ov-alto',
      ultimeAnimazioni.length > 1 ? selezione(ultimeAnimazioni.map((a) => [a, '▶ ' + a]), p.animazione || ultimeAnimazioni.find((a) => /idle/i.test(a)) || ultimeAnimazioni[0], async (v) => {
        stato.pg.animazione = v; (await import('./stato.js')).salvaPresto();
        (await modelli.viewer()).avviaAnimazione(v);
      }, { class: 'sel-anim' }) : h('span'),
      h('button.btn.piccolo.vetro', { onclick: () => modelli?.apriGestioneModelli() }, ico('figura'), 'Modelli 3D')) : null,
    !senzaModello ? h('div.ov-basso',
      h('span.suggerimento3d', '1 dito ruota · 2 dita zoom · doppio tocco ricentra'),
      h('button.btn-icona.vetro', { 'aria-label': 'Ingrandisci', onclick: () => strutturaScheda.vista.classList.toggle('espansa') }, ico('espandi'))) : null);
}

// ───────────────────────── Avvio ─────────────────────────

function registraSW() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  // Sul PC (localhost) niente cache offline, così le modifiche si vedono subito. Per provarla: ?offline
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && !location.search.includes('offline')) {
    navigator.serviceWorker.getRegistrations().then((rr) => rr.forEach((r) => r.unregister()));
    return;
  }
  navigator.serviceWorker.register('sw.js').then((reg) => {
    const mostra = (w) => {
      const b = h('div.banner-agg', h('span', '✨ Nuova versione disponibile'), h('button.btn.piccolo.primario', { onclick: () => w.postMessage('aggiorna') }, 'Aggiorna'));
      document.body.append(b);
    };
    if (reg.waiting && navigator.serviceWorker.controller) mostra(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w?.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) mostra(w); });
    });
  }).catch((e) => console.warn('SW non registrato', e));
  let ricaricato = false;
  navigator.serviceWorker.addEventListener('controllerchange', async () => { if (ricaricato) return; ricaricato = true; await salvaOra(); location.reload(); });
}

async function avvio() {
  registraSW();
  chiediPersistenza();
  try {
    await caricaTemaGlobale();
    const ultimo = await db.impostazione('ultimo');
    if (ultimo === '__master__') await apriMaster();
    else if (ultimo && (await db.leggi('personaggi', ultimo))) await apriPersonaggio(ultimo);
    else await mostraElenco();
  } catch (e) {
    console.error(e);
    app.replaceChildren(h('div.card', h('h2', 'Errore di avvio'), h('p', e.message), h('p.nota', 'Se usi Safari in modalità privata, disattivala: serve per salvare i dati.')));
  }
}
avvio();
