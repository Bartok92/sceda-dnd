// Tavolo di gioco: i telefoni dei giocatori (e del Master) si collegano tra loro.
//
// Come funziona
// - Collegamento diretto tra telefoni (WebRTC) tramite PeerJS: il servizio pubblico gratuito serve solo a "presentarsi".
// - Un telefono fa da centralino ("host", con l'indirizzo fisso del tavolo), gli altri si collegano a lui.
//   Chi riapre il tavolo prova prima a collegarsi; se nessuno risponde diventa lui il centralino. Se il centralino
//   sparisce (telefono bloccato), un altro prende il suo posto da solo.
// - Memoria: ogni telefono salva il tavolo (compagni con l'ultimo stato noto, registro diviso per serata, turno)
//   in IndexedDB, così la volta dopo si riapre con un tocco e chiunque può fare da centralino.
// - Ogni personaggio resta sul telefono del suo giocatore: si condividono solo nome, classe, PF, CA, condizioni.
// - Azioni: cure, danni, PF temporanei e condizioni viaggiano come messaggi verso il telefono del bersaglio,
//   che le applica alla sua scheda (con tasto Annulla). Se il bersaglio non è collegato, il centralino le tiene in coda.
// - Il Master partecipa senza personaggio: vede tutti, manda danni e condizioni, gestisce iniziativa e turni.
// - Solo al Master arriva anche la scheda completa di ogni giocatore (sola lettura), aggiornata a ogni modifica.
// - Il Master può chiedere tiri, concedere riposi, dare PE/oggetti/monete, scrivere (a tutti o in privato) e
//   "mostrare" immagini e testi scegliendo chi li vede: ai giocatori arriva l'elenco aggiornato (vetrina) e le
//   immagini viaggiano a pezzi, su richiesta, solo verso chi le può vedere.
import { h, $, avviso, pannello, conferma, chiediTesto, vibra } from './ui.js';
import { db, nuovoId } from './db.js';
import { stato, suCambio, modifica } from './stato.js';
import * as R from './regole.js';
import { ico, sigillo } from './icone.js';
import { applicaPF, riposoBreve, riposoLungo } from './scheda.js';
import { tira } from './dadi.js';

const PREFISSO = 'schedadnd-tavolo-';
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAX_REGISTRO = 800;
const RIAPERTURA_AUTOMATICA = 14 * 3600e3;   // riaprendo l'app entro 14 ore ci si ricollega da soli
const ERRORI_DA_RIPROVARE = ['network', 'server-error', 'socket-error', 'socket-closed', 'disconnected'];

let libreria = null;
export const rete = async () => (libreria ||= await import('../vendor/rete-bundle.js'));

// ───────────────────────── Memoria (su questo telefono) ─────────────────────────

let tavoli = null;
export async function caricaTavoli() {
  if (!tavoli) tavoli = (await db.impostazione('tavoli', [])) || [];
  return tavoli;
}
let timerSalva = null;
function salvaTavoli() {
  clearTimeout(timerSalva);
  timerSalva = setTimeout(() => db.salvaImpostazione('tavoli', structuredClone(tavoli)).catch(console.error), 400);
}
const tavoloDa = (codice) => tavoli?.find((t) => t.codice === codice) || null;
function assicuraTavolo(codice, nome = 'Tavolo ' + codice) {
  let tv = tavoloDa(codice);
  if (!tv) { tv = { codice, nome, creato: Date.now(), ultimoUso: Date.now(), membri: {}, registro: [] }; tavoli.push(tv); }
  tv.inAttesa ||= {}; tv.applicate ||= [];
  return tv;
}

// La "serata": fino alle 6 del mattino conta ancora come la sera prima
const due = (n) => String(n).padStart(2, '0');
export function serataDi(t) {
  const d = new Date(t - 6 * 3600e3);
  return `${d.getFullYear()}-${due(d.getMonth() + 1)}-${due(d.getDate())}`;
}
function nomeSerata(s) {
  if (s === serataDi(Date.now())) return 'Stasera';
  if (s === serataDi(Date.now() - 864e5)) return 'Ieri sera';
  const [a, m, g] = s.split('-').map(Number);
  return 'Serata del ' + new Date(a, m - 1, g).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: a === new Date().getFullYear() ? undefined : 'numeric' });
}
const ora = (t) => new Date(t).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

// Unisce voci di registro arrivate da altri telefoni; restituisce quelle davvero nuove
function uniscRegistro(tv, voci) {
  const ids = new Set(tv.registro.map((v) => v.id));
  const nuove = [];
  for (const v of voci || []) if (v && v.id && !ids.has(v.id)) { tv.registro.push(v); ids.add(v.id); nuove.push(v); }
  if (nuove.length) {
    tv.registro.sort((a, b) => a.t - b.t);
    if (tv.registro.length > MAX_REGISTRO) tv.registro.splice(0, tv.registro.length - MAX_REGISTRO);
  }
  return nuove;
}
function uniscMembri(tv, membri) {
  for (const [id, m] of Object.entries(membri || {})) if (m && (!tv.membri[id] || (m.t || 0) > (tv.membri[id].t || 0))) tv.membri[id] = m;
}

// Quello che si mostra ai compagni (e al Master)
function istantanea(pg) {
  return {
    id: pg.id, nome: pg.nome, razza: pg.razza, classe: pg.classe, classi: R.testoClassi(pg, { sottoclassi: false }), livello: pg.livello,
    pf: { att: pg.pf.att, max: pg.pf.max, temp: pg.pf.temp || 0 }, ca: R.classeArmatura(pg),
    condizioni: [...(pg.condizioni || [])], sfinimento: Number(pg.sfinimento) || 0, tsMorte: { ...(pg.tsMorte || { succ: 0, fall: 0 }) },
    percezione: R.percezionePassiva(pg), iniziativa: R.iniziativa(pg), velocita: R.velocitaEffettiva(pg).valore,
    t: Date.now(),
  };
}
const confrontabile = (s) => s && JSON.stringify({ ...s, t: 0 });

// La scheda completa che vede solo il Master (senza modelli 3D e cronologia dei dadi)
function schedaPerMaster(pg) {
  const s = structuredClone(pg);
  delete s.storicoDadi; delete s.modelli; delete s.animazione;
  s.inventario = (s.inventario || []).map(({ regolazioni, modello, versioneModello, ...o }) => ({ ...o, ha3d: !!modello }));
  // Per sicurezza resta sotto i 60 KB (limite dei messaggi su alcuni telefoni): si tolgono prima le descrizioni lunghe
  if (JSON.stringify(s).length > 60000) (s.incantesimi || []).forEach((x) => { x.descrizione = (x.descrizione || '').slice(0, 200); });
  if (JSON.stringify(s).length > 60000) { (s.tratti || []).forEach((x) => { x.testo = (x.testo || '').slice(0, 300); }); s.note = (s.note || '').slice(0, 2000); }
  return s;
}

// ───────────────────────── Sessione in corso ─────────────────────────

const S = {
  codice: null, io: null,                      // io: { id, nome, master } — il personaggio oppure il Master
  ruolo: null,                                 // 'host' (centralino) | 'ospite'
  fase: 'spento',                              // 'spento' | 'collegamento' | 'collegato' | 'riconnessione'
  peer: null, conn: null, conns: new Map(),    // ospite: conn verso l'host; host: conn → id partecipante
  presenti: new Set(), chiuso: true, timer: null, generazione: 0,
  pfInSospeso: null,
  presentiNoti: new Set(),                     // per accorgersi di chi arriva (il Master sincronizza vetrina e schede)
  ultimaScheda: '',                            // ultima scheda completa mandata al Master (per non ripeterla)
  ricezioni: new Map(), chiesteImg: new Set(), // immagini della vetrina in arrivo a pezzi
};
export const tavoloAttivo = () => (S.fase === 'spento' ? null : tavoloDa(S.codice));
export const faseTavolo = () => S.fase;
export const sonoMaster = () => !!S.io?.master;
export const sonoCentralino = () => S.ruolo === 'host';
export const presente = (id) => S.presenti.has(id);
const mioPgId = () => (S.io && !S.io.master ? S.io.id : null);

const ascoltatori = new Set();
export const suTavolo = (fn) => ascoltatori.add(fn);
function aggiornaViste() {
  controllaPresenze();
  ascoltatori.forEach((f) => { try { f(); } catch (e) { console.error(e); } });
  aggiornaElementiVivi();
}
// Risposte per il Master (iniziativa e tiri richiesti ai giocatori)
const ascoltaRisposte = new Set();
export const suRisposta = (fn) => ascoltaRisposte.add(fn);
// Messaggi in arrivo (il Master li usa per l'avviso e il contatore dei non letti)
const ascoltaMessaggi = new Set();
export const suMessaggio = (fn) => ascoltaMessaggi.add(fn);
// Chi è appena arrivato al tavolo (riceve un elenco di id)
const ascoltaPresenza = new Set();
export const suPresenza = (fn) => ascoltaPresenza.add(fn);
// Il Master fornisce le immagini della vetrina: async (id) → { v, dati } (dati = data URL)
let fornitoreImmagine = null;
export const fornisciImmagini = (fn) => { fornitoreImmagine = fn; };

function controllaPresenze() {
  const attivi = S.fase === 'collegato' ? S.presenti : new Set();
  const nuovi = [...attivi].filter((id) => id !== S.io?.id && !S.presentiNoti.has(id));
  S.presentiNoti = new Set(attivi);
  if (!nuovi.length) return;
  // Un giocatore manda la sua scheda quando il Master arriva
  const tv = tavoloDa(S.codice);
  if (tv?.master && nuovi.includes(tv.master.id)) setTimeout(() => inviaSchedaAlMaster({ forza: true }), 300);
  ascoltaPresenza.forEach((f) => { try { f(nuovi); } catch (e) { console.error(e); } });
}

function inviaA(conn, msg) { try { if (conn?.open) { conn.send(msg); return true; } } catch (e) { console.warn(e); } return false; }
function aTutti(msg, tranne = null) { for (const c of S.conns.keys()) if (c !== tranne) inviaA(c, msg); }
function invia(msg) {
  if (S.ruolo === 'host') aTutti(msg);
  else inviaA(S.conn, msg);
}
const connDi = (id) => [...S.conns].find(([, x]) => x === id)?.[0] || null;

function pulisciPeer() {
  clearTimeout(S.timer);
  S.generazione++;
  try { S.peer?.destroy(); } catch {}
  S.peer = null; S.conn = null; S.conns.clear();
}

async function identitaMaster() {
  let id = await db.impostazione('idMaster');
  if (!id) { id = 'master-' + nuovoId(); await db.salvaImpostazione('idMaster', id); }
  return { id, nome: 'Il Master', master: true };
}

// Avvia la sessione: prima prova a collegarsi al centralino; se nessuno risponde e il tavolo è "nostro", lo diventa.
async function avvia(codice, { puoFareHost = true, master = false } = {}) {
  await caricaTavoli();
  if (!master && !stato.pg) return;
  pulisciPeer();
  S.io = master ? await identitaMaster() : { id: stato.pg.id, nome: stato.pg.nome, master: false };
  S.codice = codice; S.chiuso = false; S.ruolo = null;
  S.presenti = new Set([S.io.id]);
  S.fase = 'collegamento';
  const tv = assicuraTavolo(codice);
  tv.ultimoUso = Date.now();
  if (master) tv.master = { id: S.io.id, nome: S.io.nome, t: Date.now() };
  else tv.membri[S.io.id] = istantanea(stato.pg);
  salvaTavoli();
  await db.salvaImpostazione('tavoloAttivo', { codice, pgId: master ? null : S.io.id, master, t: Date.now() });
  aggiornaViste();
  tentaOspite({ poiHost: puoFareHost });
}

function messaggioCiao(tv) {
  return { tipo: 'ciao', io: S.io, pg: S.io.master ? null : tv.membri[S.io.id], nome: tv.nome, membri: tv.membri, registro: tv.registro.slice(-300) };
}

async function tentaOspite({ poiHost }) {
  const { Peer } = await rete();
  if (S.chiuso) return;
  pulisciPeer();
  const gen = S.generazione;
  const p = new Peer({ debug: 0 });
  S.peer = p;
  let deciso = false;
  const fallito = () => {
    if (deciso || gen !== S.generazione) return; deciso = true;
    if (poiHost) { tentaHost(); return; }
    // Codice sconosciuto e nessuno risponde: si dimentica il tavolo appena creato e si avvisa
    const tv = tavoloDa(S.codice);
    if (tv && !tv.registro.length && Object.keys(tv.membri).length <= 1) { tavoli.splice(tavoli.indexOf(tv), 1); salvaTavoli(); }
    const cod = S.codice;
    esci({ silenzioso: true });
    avviso(`Nessun tavolo aperto con il codice ${cod}. Controlla il codice, o chiedi a chi l'ha aperto di tenere l'app aperta.`, 'errore');
  };
  p.on('open', () => {
    if (gen !== S.generazione) return;
    const c = p.connect(PREFISSO + S.codice, { reliable: true, serialization: 'json' });
    const scadenza = setTimeout(fallito, 7000);
    c.on('open', () => {
      if (gen !== S.generazione) return;
      clearTimeout(scadenza); deciso = true;
      S.conn = c; S.ruolo = 'ospite';
      const tv = tavoloDa(S.codice);
      if (!S.io.master && stato.pg?.id === S.io.id) tv.membri[S.io.id] = istantanea(stato.pg);
      inviaA(c, messaggioCiao(tv));
    });
    c.on('data', (m) => gen === S.generazione && riceviOspite(m));
    const perso = () => { if (gen === S.generazione && deciso) centralinoPerso(); };
    c.on('close', perso);
    c.on('error', perso);
  });
  p.on('error', (e) => {
    if (gen !== S.generazione) return;
    if (e.type === 'peer-unavailable') fallito();
    else if (ERRORI_DA_RIPROVARE.includes(e.type)) riprovaTra(4000 + Math.random() * 2000, { poiHost });
    else console.warn('Tavolo:', e.type, e);
  });
}

async function tentaHost() {
  const { Peer } = await rete();
  if (S.chiuso) return;
  pulisciPeer();
  const gen = S.generazione;
  const p = new Peer(PREFISSO + S.codice, { debug: 0 });
  S.peer = p;
  p.on('open', () => {
    if (gen !== S.generazione) return;
    S.ruolo = 'host'; S.fase = 'collegato';
    S.presenti = new Set([S.io.id]);
    const tv = tavoloDa(S.codice);
    if (!S.io.master && stato.pg?.id === S.io.id) tv.membri[S.io.id] = istantanea(stato.pg);
    segnaArrivo(tv, S.io);
    // Azioni rimaste in coda per me (ricevute quando facevo da centralino e non avevo la scheda aperta)
    consegnaCoda(tv, S.io.id);
    salvaTavoli(); aggiornaViste();
  });
  p.on('connection', (c) => {
    c.on('data', (m) => gen === S.generazione && riceviHost(c, m));
    const via = () => {
      if (gen !== S.generazione || !S.conns.has(c)) return;
      const id = S.conns.get(c); S.conns.delete(c);
      if (![...S.conns.values()].includes(id)) S.presenti.delete(id);
      aTutti({ tipo: 'presenti', presenti: [...S.presenti] });
      aggiornaViste();
    };
    c.on('close', via);
    c.on('error', via);
  });
  p.on('disconnected', () => { if (gen === S.generazione && !S.chiuso && !p.destroyed) try { p.reconnect(); } catch {} });
  p.on('error', (e) => {
    if (gen !== S.generazione) return;
    // Qualcun altro è diventato centralino un attimo prima: mi collego a lui
    if (e.type === 'unavailable-id') riprovaTra(600 + Math.random() * 800, { poiHost: true });
    else if (ERRORI_DA_RIPROVARE.includes(e.type)) riprovaTra(4000 + Math.random() * 2000, { poiHost: true });
    else console.warn('Tavolo (centralino):', e.type, e);
  });
}

function riprovaTra(ms, opz) {
  if (S.chiuso) return;
  if (S.fase === 'collegato') { S.fase = 'riconnessione'; aggiornaViste(); }
  clearTimeout(S.timer);
  const gen = S.generazione;
  S.timer = setTimeout(() => { if (!S.chiuso && gen === S.generazione) tentaOspite(opz); }, ms);
}

// Il centralino non risponde più: dopo una pausa casuale (così non ci provano tutti insieme) ci si ricollega,
// e se il centralino non c'è più uno dei presenti prende il suo posto.
function centralinoPerso() {
  if (S.chiuso) return;
  S.fase = 'riconnessione'; S.conn = null;
  S.presenti = new Set([S.io.id]);
  aggiornaViste();
  riprovaTra(800 + Math.random() * 2200, { poiHost: true });
}

// ───────────────────────── Messaggi ─────────────────────────

function consegnaCoda(tv, id) {
  const coda = tv.inAttesa?.[id];
  if (!coda?.length) return;
  delete tv.inAttesa[id];
  for (const m of coda) consegna(m);
}
// Il centralino consegna un messaggio diretto a un partecipante (o lo tiene in coda se non c'è)
function consegna(m) {
  const tv = tavoloDa(S.codice);
  if (m.a === S.io.id) { perMe(m); return; }
  const c = connDi(m.a);
  if (c && inviaA(c, m)) return;
  if (m.tipo !== 'azione' && m.tipo !== 'messaggio') return;   // solo azioni e messaggi aspettano chi non c'è
  (tv.inAttesa[m.a] ||= []).push(m);
  salvaTavoli();
}
// Messaggi per tutti i giocatori (richiesta d'iniziativa, turno): il centralino li applica anche a sé
function diffondi(m, tranne = null) {
  aTutti(m, tranne);
  perMe(m);
}

function riceviHost(c, m) {
  const tv = tavoloDa(S.codice);
  if (!tv || !m || typeof m !== 'object') return;
  if (m.tipo === 'ciao' && m.io?.id) {
    const id = m.io.id;
    S.conns.set(c, id);
    S.presenti.add(id);
    uniscMembri(tv, m.membri);
    if (m.io.master) tv.master = { id, nome: m.io.nome, t: Date.now() };
    else if (m.pg) tv.membri[id] = m.pg;
    if (!S.io.master && stato.pg?.id === S.io.id) tv.membri[S.io.id] = istantanea(stato.pg);
    const nuove = uniscRegistro(tv, m.registro);
    if (/^Tavolo [A-Z0-9]{6}$/.test(tv.nome) && m.nome && !/^Tavolo [A-Z0-9]{6}$/.test(m.nome)) tv.nome = m.nome;
    inviaA(c, { tipo: 'benvenuto', nome: tv.nome, membri: tv.membri, registro: tv.registro, presenti: [...S.presenti], master: tv.master || null, turno: tv.turno || null });
    if (m.pg) aTutti({ tipo: 'stato', pg: m.pg }, c);
    if (m.io.master) aTutti({ tipo: 'master', master: tv.master }, c);
    aTutti({ tipo: 'presenti', presenti: [...S.presenti] }, c);
    if (nuove.length) aTutti({ tipo: 'voci', voci: nuove }, c);
    segnaArrivo(tv, m.io);
    consegnaCoda(tv, id);
  } else if (m.tipo === 'stato' && m.pg?.id) {
    tv.membri[m.pg.id] = m.pg;
    aTutti({ tipo: 'stato', pg: m.pg }, c);
  } else if (m.tipo === 'voci') {
    const nuove = uniscRegistro(tv, m.voci);
    if (nuove.length) aTutti({ tipo: 'voci', voci: nuove }, c);
    applicaNomeDaVoci(tv, nuove);
  } else if (m.a) {
    consegna(m);            // messaggio diretto (azione, risposta): va a destinazione
  } else if (m.tipo === 'richiesta' || m.tipo === 'turno') {
    diffondi(m, c);         // dal Master a tutti
  } else return;
  salvaTavoli(); aggiornaViste();
}

function riceviOspite(m) {
  const tv = tavoloDa(S.codice);
  if (!tv || !m || typeof m !== 'object') return;
  if (m.tipo === 'benvenuto') {
    if (m.nome) tv.nome = m.nome;
    uniscMembri(tv, m.membri);
    if (!S.io.master && stato.pg?.id === S.io.id) tv.membri[S.io.id] = istantanea(stato.pg);
    uniscRegistro(tv, m.registro);
    if (m.master) tv.master = m.master;
    if (m.turno !== undefined) impostaTurno(tv, m.turno, { avvisa: false });
    S.presenti = new Set(m.presenti || []); S.presenti.add(S.io.id);
    const prima = S.fase;
    S.fase = 'collegato';
    if (prima === 'collegamento') avviso(`Sei al tavolo "${tv.nome}"`);
  } else if (m.tipo === 'stato' && m.pg?.id && m.pg.id !== S.io.id) {
    tv.membri[m.pg.id] = m.pg;
  } else if (m.tipo === 'voci') {
    applicaNomeDaVoci(tv, uniscRegistro(tv, m.voci));
  } else if (m.tipo === 'presenti') {
    S.presenti = new Set(m.presenti || []); S.presenti.add(S.io.id);
  } else if (m.tipo === 'master') {
    tv.master = m.master;
  } else if (m.a === S.io.id || m.tipo === 'richiesta' || m.tipo === 'turno') {
    perMe(m);
  } else return;
  salvaTavoli(); aggiornaViste();
}
function applicaNomeDaVoci(tv, voci) {
  const v = voci?.filter((x) => x.tipo === 'nome' && x.nomeTavolo).pop();
  if (v) tv.nome = v.nomeTavolo;
}

// Messaggi che riguardano questo telefono
function perMe(m) {
  if (m.tipo === 'azione') applicaAzione(m);
  else if (m.tipo === 'risposta') { if (S.io.master) ascoltaRisposte.forEach((f) => f(m)); }
  else if (m.tipo === 'richiesta') {
    if (S.io.master) return;
    if (m.cosa === 'iniziativa') chiestaIniziativa(m);
    else if (m.cosa === 'scheda') inviaSchedaAlMaster({ forza: true });
    else if (m.cosa === 'tiro') chiestoTiro(m);
    else if (m.cosa === 'riposo') chiestoRiposo(m);
  }
  else if (m.tipo === 'turno') impostaTurno(tavoloDa(S.codice), m.turno);
  else if (m.tipo === 'scheda') { if (S.io.master) riceviScheda(m); }
  else if (m.tipo === 'messaggio') riceviMessaggio(m);
  else if (m.tipo === 'vetrina') { if (!S.io.master) riceviVetrina(m); }
  else if (m.tipo === 'chiediImg') { if (S.io.master) inviaImmagine(m); }
  else if (m.tipo === 'pezzo') { if (!S.io.master) riceviPezzo(m); }
}

// Messaggio diretto a un partecipante (passa dal centralino; se sono io il centralino lo consegno io)
export function mandaA(destId, dati) {
  if (S.fase !== 'collegato' || !destId) return false;
  const m = { id: nuovoId(), t: Date.now(), ...dati, a: destId, da: { id: S.io.id, nome: S.io.nome } };
  if (S.ruolo === 'host') { consegna(m); if (m.tipo !== 'pezzo') { salvaTavoli(); aggiornaViste(); } return true; }
  return inviaA(S.conn, m);
}

// ───────────────────────── Registro ─────────────────────────

function aggiungiVoce(testo, extra = {}) {
  const tv = tavoloDa(S.codice);
  if (!tv) return;
  const t = Date.now();
  const v = { id: nuovoId(), t, serata: serataDi(t), testo, pg: S.io?.id, ...extra };
  uniscRegistro(tv, [v]);
  invia({ tipo: 'voci', voci: [v] });
  salvaTavoli(); aggiornaViste();
}
export const scriviNelRegistro = (testo, extra) => aggiungiVoce(testo, extra);

// "X si siede al tavolo": una volta per serata (le riconnessioni non riempiono il registro)
function segnaArrivo(tv, chi) {
  const s = serataDi(Date.now());
  if (tv.registro.some((v) => v.tipo === 'arrivo' && v.chi === chi.id && v.serata === s)) return;
  const nome = chi.master ? chi.nome : (tv.membri[chi.id]?.nome || 'Un eroe');
  const t = Date.now();
  const v = { id: nuovoId(), t, serata: s, testo: `${nome} si siede al tavolo`, tipo: 'arrivo', chi: chi.id, pg: chi.id };
  uniscRegistro(tv, [v]);
  aTutti({ tipo: 'voci', voci: [v] });
}

export const nomeCondizione = (id) => R.CONDIZIONI.find((c) => c.id === id)?.nome || id;

// Confronta lo stato di prima e di adesso e scrive nel registro ciò che conta
function scriviPF(n, da, a, max) {
  if (da === undefined || da === a) return;
  if (a === 0 && da > 0) aggiungiVoce(`${n} è a terra! (0 PF)`, { tipo: 'pf' });
  else aggiungiVoce(`${n}: ${da} → ${a} PF su ${max} (${a > da ? '+' : '−'}${Math.abs(a - da)})`, { tipo: 'pf' });
}
function chiudiPFInSospeso() {
  const s = S.pfInSospeso; if (!s) return;
  clearTimeout(s.timer); S.pfInSospeso = null;
  scriviPF(s.nome, s.da, s.a, s.max);
}
function annotaCambiamenti(prima, dopo) {
  if (!prima || !dopo) return;
  const n = dopo.nome;
  // PF: si aspetta qualche secondo, così più tocchi su − e + diventano una sola voce
  if (prima.pf.att !== dopo.pf.att || S.pfInSospeso) {
    if (!S.pfInSospeso) S.pfInSospeso = { da: prima.pf.att };
    Object.assign(S.pfInSospeso, { a: dopo.pf.att, max: dopo.pf.max, nome: n });
    clearTimeout(S.pfInSospeso.timer);
    S.pfInSospeso.timer = setTimeout(chiudiPFInSospeso, 6000);
  }
  for (const c of dopo.condizioni) if (!prima.condizioni.includes(c)) aggiungiVoce(`${n} ora è ${nomeCondizione(c)}`, { tipo: 'condizione' });
  for (const c of prima.condizioni) if (!dopo.condizioni.includes(c)) aggiungiVoce(`${n} non è più ${nomeCondizione(c)}`, { tipo: 'condizione' });
  if (dopo.livello > prima.livello) aggiungiVoce(`${n} sale al livello ${dopo.livello}!`, { tipo: 'livello' });
  if (dopo.sfinimento !== prima.sfinimento) aggiungiVoce(dopo.sfinimento ? `${n}: sfinimento ${dopo.sfinimento}` : `${n} non è più sfinito`, { tipo: 'condizione' });
  if (dopo.tsMorte.fall >= 3 && prima.tsMorte.fall < 3) aggiungiVoce(`${n} ha fallito tre tiri salvezza contro la morte…`, { tipo: 'pf' });
}

// Quando cambia il mio personaggio, lo comunico ai compagni (e la scheda completa al Master)
let timerStato = null, timerScheda = null;
suCambio(() => {
  if (S.fase === 'spento' || !mioPgId() || stato.pg?.id !== mioPgId()) return;
  clearTimeout(timerStato);
  timerStato = setTimeout(pubblicaStato, 500);
  clearTimeout(timerScheda);
  timerScheda = setTimeout(() => inviaSchedaAlMaster(), 1500);
});

// ───────────────────────── Scheda completa per il Master ─────────────────────────

function inviaSchedaAlMaster({ forza = false } = {}) {
  const tv = tavoloDa(S.codice);
  if (!tv?.master || S.fase !== 'collegato' || !mioPgId() || stato.pg?.id !== mioPgId() || !S.presenti.has(tv.master.id)) return;
  const pg = schedaPerMaster(stato.pg);
  const js = JSON.stringify(pg);
  if (!forza && js === S.ultimaScheda) return;
  if (mandaA(tv.master.id, { tipo: 'scheda', pg })) S.ultimaScheda = js;
}
function riceviScheda(m) {
  const tv = tavoloDa(S.codice);
  if (!tv || !m.pg?.id) return;
  (tv.schede ||= {})[m.pg.id] = { pg: m.pg, t: m.t || Date.now() };
}
export const schedaDi = (id) => tavoloAttivo()?.schede?.[id] || null;
export function chiediSchede(ids) {
  let ok = 0;
  for (const id of ids) if (mandaA(id, { tipo: 'richiesta', cosa: 'scheda' })) ok++;
  return ok;
}

// ───────────────────────── Messaggi tra Master e giocatori ─────────────────────────
// tv.chat: [{ id, t, da: 'master' | idGiocatore, a: 'master' | 'tutti' | idGiocatore, daNome, testo, letto }]

function potaChat(tv) { if (tv.chat.length > 400) tv.chat.splice(0, tv.chat.length - 400); }

// dest: per il Master 'tutti' o l'id di un giocatore; per un giocatore è sempre il Master
export function inviaMessaggio(dest, testo) {
  const tv = tavoloDa(S.codice);
  testo = String(testo || '').trim();
  if (!tv || !testo) return false;
  if (S.fase !== 'collegato') { avviso('Non sei collegato al tavolo: aspetta che torni il pallino verde.', 'errore'); return false; }
  const idMsg = nuovoId();
  const destinatari = S.io.master ? (dest === 'tutti' ? elencoCompagni(tv).map((m) => m.id) : [dest]) : [tv.master?.id].filter(Boolean);
  if (!destinatari.length) { avviso(S.io.master ? 'Nessun giocatore al tavolo' : 'Il Master non si è ancora seduto al tavolo', 'errore'); return false; }
  let ok = false;
  for (const d of destinatari) ok = mandaA(d, { tipo: 'messaggio', testo, tutti: dest === 'tutti', idMsg }) || ok;
  if (!ok) return false;
  (tv.chat ||= []).push({ id: idMsg, t: Date.now(), da: S.io.master ? 'master' : S.io.id, a: S.io.master ? dest : 'master', daNome: S.io.nome, testo, letto: true });
  potaChat(tv); salvaTavoli(); aggiornaViste();
  return true;
}

function riceviMessaggio(m) {
  const tv = tavoloDa(S.codice);
  if (!tv) return;
  tv.chat ||= [];
  const id = m.idMsg || m.id;
  if (tv.chat.some((x) => x.id === id)) return;
  const voce = { id, t: m.t || Date.now(), da: S.io.master ? m.da.id : 'master', a: S.io.master ? 'master' : (m.tutti ? 'tutti' : S.io.id), daNome: m.da?.nome, testo: String(m.testo || ''), letto: false };
  tv.chat.push(voce); potaChat(tv);
  vibra([25, 30, 25]);
  if (S.io.master) ascoltaMessaggi.forEach((f) => { try { f(voce); } catch (e) { console.error(e); } });
  else mostraMessaggio(voce);
}

export function segnaLetti(filtro) {
  const tv = tavoloDa(S.codice);
  let n = 0;
  for (const v of tv?.chat || []) if (!v.letto && filtro(v)) { v.letto = true; n++; }
  if (n) { salvaTavoli(); aggiornaViste(); }
}
export const nonLetti = (filtro = () => true) => (tavoloAttivo()?.chat || []).filter((v) => !v.letto && filtro(v)).length;

// Il giocatore riceve un messaggio del Master: finestra con "Rispondi"
function mostraMessaggio(v) {
  pannello(v.a === 'tutti' ? '✉ Il Master, a tutti' : '✉ Il Master, solo a te', (c, chiudi) => {
    c.append(h('p.messaggio-master', v.testo),
      h('div.riga-btn',
        h('button.btn', { onclick: () => chiudi() }, 'Ho letto'),
        h('button.btn.primario', { onclick: async () => { chiudi(); await rispondiAlMaster(); } }, 'Rispondi')));
  }, { classe: 'stretto', onChiudi: () => segnaLetti((x) => x.id === v.id) });
}
export async function rispondiAlMaster() {
  const t = await chiediTesto('Scrivi al Master', '', { etichetta: 'Lo leggerà solo il Master', multiriga: true });
  if (t && t.trim() && inviaMessaggio('master', t)) avviso('Messaggio inviato al Master');
}

// ───────────────────────── Tiri richiesti dal Master ─────────────────────────
// tiro: { tipo: 'abilita'|'ts'|'caratteristica'|'libero', chiave, espr, cd, mostraCd, modo, nota, pubblico }

export function descriviTiro(t) {
  const car = R.CARATTERISTICHE.find((c) => c.id === t.chiave)?.nome;
  if (t.tipo === 'abilita') return `Prova di ${R.ABILITA.find((a) => a.id === t.chiave)?.nome || t.chiave}`;
  if (t.tipo === 'ts') return `Tiro salvezza su ${car || t.chiave}`;
  if (t.tipo === 'caratteristica') return `Prova di ${car || t.chiave}`;
  return t.nome || `Tiro ${t.espr || '1d20'}`;
}
export function bonusTiro(pg, t) {
  try {
    if (t.tipo === 'abilita') return R.bonusAbilita(pg, R.ABILITA.find((a) => a.id === t.chiave));
    if (t.tipo === 'ts') return R.bonusTS(pg, t.chiave);
    if (t.tipo === 'caratteristica') return R.bonusProva(pg, t.chiave);
  } catch (e) { console.error(e); }
  return 0;
}

function chiestoTiro(m) {
  const pg = stato.pg;
  if (!pg || pg.id !== mioPgId()) return;
  const t = m.tiro || {};
  const etichetta = descriviTiro(t);
  const bonus = bonusTiro(pg, t);
  const d20 = t.tipo !== 'libero' || /^1?d20/i.test(t.espr || '');
  const espr = t.tipo === 'libero' ? (t.espr || '1d20') : `1d20${bonus ? (bonus > 0 ? '+' : '') + bonus : ''}`;
  const modo = ['vantaggio', 'svantaggio'].includes(t.modo) ? t.modo : 'normale';
  const rispondi = (valore, naturale = null) => {
    mandaA(m.da.id, { tipo: 'risposta', cosa: 'tiro', richiesta: m.id, pgId: pg.id, nome: pg.nome, valore, naturale, bonus });
    if (t.mostraCd && t.cd) setTimeout(() => avviso(valore >= t.cd ? `${etichetta}: ${valore} contro CD ${t.cd}, superata!` : `${etichetta}: ${valore} contro CD ${t.cd}, fallita`, valore >= t.cd ? '' : 'errore'), 1400);
  };
  vibra([30, 40, 30]);
  pannello(`🎲 ${etichetta}`, (c, chiudi) => {
    const inp = h('input.campo.campo-numero', { type: 'number', inputMode: 'numeric', placeholder: 'es. 15' });
    c.append(
      h('p', `${m.da?.nome || 'Il Master'} ti chiede: `, h('strong', etichetta),
        t.mostraCd && t.cd ? ` · CD ${t.cd}` : '', modo !== 'normale' ? ` · con ${modo}` : ''),
      t.nota ? h('p.nota', t.nota) : null,
      h('button.btn.grande.primario', { onclick: () => {
        const r = tira(espr, etichetta, { d20, modoTiro: modo });
        if (r) { chiudi(); rispondi(r.totale, r.naturale); }
      } }, `🎲 Tira ora (${espr.replace('1d20', 'd20')}${modo !== 'normale' ? ', ' + modo : ''})`),
      h('p.nota.centrato', 'oppure, se tiri con il dado vero, scrivi il risultato totale'),
      inp,
      h('button.btn.grande', { onclick: () => { const v = Number(inp.value); if (!inp.value || Number.isNaN(v)) return avviso('Scrivi il risultato', 'errore'); chiudi(); rispondi(v); } }, 'Invia al Master'));
  }, { classe: 'stretto' });
}

export function chiediTiro(ids, tiro) {
  let ok = 0; const id = nuovoId();
  for (const d of ids) if (mandaA(d, { tipo: 'richiesta', cosa: 'tiro', tiro, id })) ok++;
  return ok ? id : null;
}

// ───────────────────────── Riposi concessi dal Master ─────────────────────────

function chiestoRiposo(m) {
  if (!stato.pg || stato.pg.id !== mioPgId()) return;
  const lungo = m.riposo === 'lungo';
  vibra([30, 40, 30]);
  pannello(lungo ? '☀ Riposo lungo' : '☾ Riposo breve', (c, chiudi) => {
    c.append(h('p', `${m.da?.nome || 'Il Master'} concede un riposo ${lungo ? 'lungo (8 ore)' : 'breve (1 ora)'}.`),
      h('p.nota', lungo ? 'PF al massimo, metà dei dadi vita, tutti gli slot e le risorse.' : 'Puoi spendere dadi vita per recuperare PF; si ricaricano le risorse "a riposo breve".'),
      h('div.riga-btn',
        h('button.btn', { onclick: () => chiudi() }, 'Non ora'),
        h('button.btn.primario', { onclick: () => {
          chiudi();
          if (lungo) riposoLungo({ senzaConferma: true }); else riposoBreve({ titolo: 'Riposo breve concesso dal Master' });
          aggiungiVoce(`${stato.pg.nome} fa un riposo ${lungo ? 'lungo' : 'breve'}`, { tipo: 'pf' });
        } }, lungo ? '☀ Riposa' : '☾ Riposa')));
  }, { classe: 'stretto' });
}
export function concediRiposo(ids, riposo) {
  let ok = 0;
  for (const d of ids) if (mandaA(d, { tipo: 'richiesta', cosa: 'riposo', riposo })) ok++;
  return ok;
}

// ───────────────────────── Vetrina: cose che il Master mostra ─────────────────────────
// Il giocatore tiene tv.vetrina = [{ id, titolo, testo, img, v, visto }]; le immagini stanno a parte in
// IndexedDB (impostazione "vetrina-img-<id>" = { v, dati }) e si chiedono al Master solo se mancano.

const PEZZO = 16000;

function riceviVetrina(m) {
  const tv = tavoloDa(S.codice);
  if (!tv) return;
  const prima = new Map((tv.vetrina || []).map((c) => [c.id, c]));
  tv.vetrina = (m.contenuti || []).map((c) => ({ ...c, visto: !!(prima.get(c.id)?.visto && prima.get(c.id).v === c.v) }));
  for (const c of tv.vetrina) if (c.img) assicuraImmagine(c, m.da.id);
  for (const id of prima.keys()) if (!tv.vetrina.some((c) => c.id === id)) db.salvaImpostazione('vetrina-img-' + id, null).catch(() => {});
  const nuovi = tv.vetrina.filter((c) => !prima.has(c.id) || prima.get(c.id).v !== c.v);
  const daAprire = (m.evidenzia && tv.vetrina.find((c) => c.id === m.evidenzia)) || nuovi[nuovi.length - 1];
  if (daAprire) { vibra([40, 30, 40]); apriContenuto(daAprire, { dalMaster: true }); }
}

async function assicuraImmagine(c, masterId) {
  const vi = c.vi ?? c.v;   // versione dell'immagine (cambiare solo il testo non la fa riscaricare)
  const salvata = await db.impostazione('vetrina-img-' + c.id);
  if (salvata?.v === vi) return;
  const chiave = c.id + ':' + vi;
  if (S.chiesteImg.has(chiave)) return;
  S.chiesteImg.add(chiave);
  mandaA(masterId, { tipo: 'chiediImg', img: c.id });
}

async function inviaImmagine(m) {
  const im = await fornitoreImmagine?.(m.img);
  if (!im?.dati) return;
  const n = Math.ceil(im.dati.length / PEZZO);
  for (let i = 0; i < n; i++) mandaA(m.da.id, { tipo: 'pezzo', img: m.img, v: im.v, i, n, dati: im.dati.slice(i * PEZZO, (i + 1) * PEZZO) });
}

function riceviPezzo(m) {
  const chiave = m.img + ':' + m.v;
  let r = S.ricezioni.get(chiave);
  if (!r) { r = { n: m.n, parti: new Array(m.n), arrivati: 0 }; S.ricezioni.set(chiave, r); }
  if (r.parti[m.i] == null) { r.parti[m.i] = m.dati; r.arrivati++; }
  if (r.arrivati < r.n) return;
  S.ricezioni.delete(chiave);
  const dati = r.parti.join('');
  db.salvaImpostazione('vetrina-img-' + m.img, { v: m.v, dati }).then(() => {
    document.dispatchEvent(new CustomEvent('vetrina-img', { detail: { id: m.img, dati } }));
  }).catch(console.error);
}

// Finestra che mostra un contenuto (immagine a tutta larghezza: un tocco la ingrandisce)
export function apriContenuto(c, { dalMaster = false, datiImmagine = null } = {}) {
  const tv = tavoloAttivo();
  const voce = tv?.vetrina?.find((x) => x.id === c.id);
  if (voce && !voce.visto) { voce.visto = true; salvaTavoli(); aggiornaViste(); }
  pannello(dalMaster ? `📜 ${c.titolo || 'Dal Master'}` : (c.titolo || 'Contenuto'), (corpo) => {
    const zonaImg = h('div.vetrina-img');
    const mettiImmagine = (dati) => {
      const img = h('img', { src: dati, alt: c.titolo || '' });
      zonaImg.replaceChildren(img);
      zonaImg.onclick = () => zonaImg.classList.toggle('zoom');
    };
    if (c.img) {
      zonaImg.append(h('p.nota.centrato', 'Sto ricevendo l\'immagine dal Master…'));
      if (datiImmagine) mettiImmagine(datiImmagine);
      else db.impostazione('vetrina-img-' + c.id).then((s) => { if (s?.dati) mettiImmagine(s.dati); });
      const quandoArriva = (e) => { if (!zonaImg.isConnected) return document.removeEventListener('vetrina-img', quandoArriva); if (e.detail.id === c.id) mettiImmagine(e.detail.dati); };
      document.addEventListener('vetrina-img', quandoArriva);
    }
    corpo.append(
      dalMaster ? h('p.nota', 'Il Master vi mostra:') : null,
      c.img ? zonaImg : null,
      c.img ? h('p.nota.centrato', 'Tocca l\'immagine per ingrandirla') : null,
      c.testo ? h('div.vetrina-testo', c.testo) : null);
  }, { pieno: !!c.img });
}
function pubblicaStato({ annota = true } = {}) {
  const tv = tavoloDa(S.codice);
  if (!tv || !mioPgId() || stato.pg?.id !== mioPgId()) return;
  const prima = tv.membri[S.io.id];
  const dopo = istantanea(stato.pg);
  if (confrontabile(dopo) === confrontabile(prima)) return;
  tv.membri[S.io.id] = dopo;
  if (annota) annotaCambiamenti(prima, dopo);
  if (S.fase === 'collegato') invia({ tipo: 'stato', pg: dopo });
  salvaTavoli(); aggiornaViste();
}

// ───────────────────────── Azioni tra telefoni ─────────────────────────
// azione: { tipo: 'danno'|'cura'|'pftemp'|'condizione', valore, id (condizione), attiva, motivo }

export function inviaAzione(destId, azione) {
  if (S.fase !== 'collegato') { avviso('Non sei collegato al tavolo: aspetta che torni il pallino verde.', 'errore'); return false; }
  const m = { tipo: 'azione', id: nuovoId(), a: destId, da: { id: S.io.id, nome: S.io.nome }, azione, t: Date.now() };
  if (S.ruolo === 'host') { consegna(m); salvaTavoli(); aggiornaViste(); }
  else inviaA(S.conn, m);
  return true;
}

function descriviAzione(az, da, chi, prima, dopo) {
  const motivo = az.motivo ? ` (${az.motivo})` : '';
  if (az.tipo === 'danno') return `${da} → ${chi}: ${az.valore} danni${motivo} · PF ${prima.att} → ${dopo.att}`;
  if (az.tipo === 'cura') return `${da} cura ${chi}: +${dopo.att - prima.att} PF${motivo} · PF ${prima.att} → ${dopo.att}`;
  if (az.tipo === 'pftemp') return `${da} dà ${az.valore} PF temporanei a ${chi}${motivo}`;
  if (az.tipo === 'condizione') return az.attiva ? `${da}: ${chi} ora è ${nomeCondizione(az.id)}${motivo}` : `${da}: ${chi} non è più ${nomeCondizione(az.id)}${motivo}`;
  if (az.tipo === 'pe') return `${da} dà ${az.valore} PE a ${chi}${motivo}`;
  if (az.tipo === 'ispirazione') return `${da} dà l'ispirazione eroica a ${chi}${motivo}`;
  if (az.tipo === 'oggetto') return `${da} dà a ${chi}: ${az.oggetto?.nome || 'un oggetto'}${(az.oggetto?.qta || 1) > 1 ? ' ×' + az.oggetto.qta : ''}${motivo}`;
  if (az.tipo === 'monete') return `${da} dà a ${chi} ${testoMonete(az.monete)}${motivo}`;
  return `${da} → ${chi}`;
}
export const testoMonete = (m = {}) => R.MONETE.filter((c) => Number(m[c.id]) > 0).map((c) => `${m[c.id]} ${c.sigla || c.id}`).join(', ') || 'nessuna moneta';

// Il mio telefono riceve un'azione: la applico alla scheda (se è aperta) e offro "Annulla"
function applicaAzione(m) {
  const tv = tavoloDa(S.codice);
  if (!tv || !mioPgId() || m.a !== mioPgId()) return;
  if (tv.applicate.includes(m.id)) return;
  if (stato.pg?.id !== m.a) { (tv.inAttesa[m.a] ||= []).push(m); salvaTavoli(); return; }
  tv.applicate.push(m.id); if (tv.applicate.length > 300) tv.applicate.splice(0, tv.applicate.length - 300);
  chiudiPFInSospeso();
  const az = m.azione || {};
  const prima = { pf: { ...stato.pg.pf }, condizioni: [...stato.pg.condizioni], tsMorte: { ...stato.pg.tsMorte },
    pe: stato.pg.pe, ispirazione: stato.pg.ispirazione, monete: { ...stato.pg.monete }, livello: stato.pg.livello };
  let idOggetto = null;
  modifica((x) => {
    const v = Math.max(0, Number(az.valore) || 0);
    if (az.tipo === 'danno') applicaPF(x, -v);
    else if (az.tipo === 'cura') applicaPF(x, v);
    else if (az.tipo === 'pftemp') x.pf.temp = Math.max(x.pf.temp || 0, v);
    else if (az.tipo === 'condizione') {
      const i = x.condizioni.indexOf(az.id);
      if (az.attiva && i < 0) x.condizioni.push(az.id);
      if (!az.attiva && i >= 0) x.condizioni.splice(i, 1);
    }
    else if (az.tipo === 'pe') x.pe = (Number(x.pe) || 0) + v;
    else if (az.tipo === 'ispirazione') x.ispirazione = true;
    else if (az.tipo === 'monete') for (const c of R.MONETE) x.monete[c.id] = (Number(x.monete[c.id]) || 0) + Math.max(0, Number(az.monete?.[c.id]) || 0);
    else if (az.tipo === 'oggetto' && az.oggetto?.nome) {
      const o = az.oggetto;
      idOggetto = nuovoId();
      x.inventario.push({ id: idOggetto, nome: String(o.nome), qta: Math.max(1, Number(o.qta) || 1), peso: Math.max(0, Number(o.peso) || 0), descrizione: String(o.descrizione || ''),
        tipo: 'oggetto', slot: '', equip: false, modello: null, regolazioni: {}, armatura: null, bonusCA: 0, versioneModello: '' });
    }
  });
  const testo = descriviAzione(az, m.da?.nome || 'Qualcuno', stato.pg.nome, prima.pf, stato.pg.pf);
  pubblicaStato({ annota: false });
  aggiungiVoce(testo, { tipo: az.tipo === 'condizione' ? 'condizione' : az.tipo === 'danno' ? 'danno' : 'pf' });
  if (az.tipo === 'danno') {
    document.body.classList.remove('colpito'); void document.body.offsetWidth; document.body.classList.add('colpito');
    vibra([40, 30, 40]);
  } else vibra(20);
  if (az.tipo === 'pe') {
    const prossimo = R.SOGLIE_PE[stato.pg.livello];
    if (prossimo != null && stato.pg.pe >= prossimo && (prima.pe || 0) < prossimo) setTimeout(() => avviso(`Hai abbastanza PE per salire al livello ${stato.pg.livello + 1}! Tocca "Sali di livello" nella scheda.`), 1500);
  }
  avvisoConAzione(testo.replace(`${stato.pg.nome}: `, '').replace(` → ${stato.pg.nome}`, ''), 'Annulla', () => {
    modifica((x) => {
      x.pf = { ...prima.pf }; x.condizioni = [...prima.condizioni]; x.tsMorte = { ...prima.tsMorte };
      x.pe = prima.pe; x.ispirazione = prima.ispirazione; x.monete = { ...prima.monete };
      if (idOggetto) x.inventario = x.inventario.filter((o) => o.id !== idOggetto);
    });
    pubblicaStato({ annota: false });
    aggiungiVoce(`${stato.pg.nome} annulla: ${testo}`, { tipo: 'annulla' });
  }, az.tipo === 'danno' ? 'danno' : '');
  if (az.tipo === 'danno' && stato.pg.pf.att <= 0) setTimeout(() => avviso('Sei a 0 PF: effettua i tiri salvezza contro la morte!', 'errore'), 1200);
}

// Avviso con un pulsante (es. Annulla), resta qualche secondo in più
function avvisoConAzione(testo, etichetta, fn, tipo = '', ms = 9000) {
  const t = h('div.toast.con-azione' + (tipo ? '.' + tipo : ''), h('span', testo),
    h('button.toast-azione', { onclick: () => { chiudi(); fn(); } }, etichetta));
  const chiudi = () => { t.classList.remove('vis'); setTimeout(() => t.remove(), 400); };
  $('#toasts').append(t);
  requestAnimationFrame(() => t.classList.add('vis'));
  setTimeout(chiudi, ms);
}

// ───────────────────────── Iniziativa e turni ─────────────────────────

export function chiediIniziativa() {
  if (!S.io?.master || S.fase !== 'collegato') return false;
  const m = { tipo: 'richiesta', cosa: 'iniziativa', id: nuovoId(), da: { id: S.io.id, nome: S.io.nome } };
  if (S.ruolo === 'host') aTutti(m); else inviaA(S.conn, m);
  return true;
}

function chiestaIniziativa(m) {
  if (!stato.pg || stato.pg.id !== mioPgId()) return;
  const bonus = R.iniziativa(stato.pg);
  const rispondi = (valore, naturale = null) => {
    const r = { tipo: 'risposta', cosa: 'iniziativa', a: m.da.id, pgId: stato.pg.id, nome: stato.pg.nome, valore, naturale, bonus, t: Date.now() };
    if (S.ruolo === 'host') consegna(r); else inviaA(S.conn, r);
    aggiungiVoce(`${stato.pg.nome} tira l'iniziativa: ${valore}`, { tipo: 'iniziativa' });
  };
  vibra([30, 40, 30]);
  pannello('Tira l\'iniziativa!', (c, chiudi) => {
    const inp = h('input.campo.campo-numero', { type: 'number', inputMode: 'numeric', placeholder: 'es. 15' });
    c.append(
      h('p', `${m.da?.nome || 'Il Master'} chiede a tutti l'iniziativa. Il tuo bonus è ${R.segno(bonus)}.`),
      h('button.btn.grande.primario', { onclick: () => {
        const r = tira(`1d20${bonus ? (bonus > 0 ? '+' : '') + bonus : ''}`, 'Iniziativa', { d20: true });
        if (r) { chiudi(); rispondi(r.totale, r.naturale); }
      } }, '🎲 Tira ora (d20 ' + R.segno(bonus) + ')'),
      h('p.nota.centrato', 'oppure, se tiri con il dado vero, scrivi il risultato totale'),
      inp,
      h('button.btn.grande', { onclick: () => { const v = Number(inp.value); if (!inp.value || Number.isNaN(v)) return avviso('Scrivi il risultato', 'errore'); chiudi(); rispondi(v); } }, 'Invia al Master'));
  }, { classe: 'stretto' });
}

export function inviaTurno(turno) {
  if (!S.io?.master) return;
  const tv = tavoloDa(S.codice);
  const m = { tipo: 'turno', turno, id: nuovoId() };
  impostaTurno(tv, turno, { avvisa: false });
  if (S.fase === 'collegato') { if (S.ruolo === 'host') aTutti(m); else inviaA(S.conn, m); }
  salvaTavoli(); aggiornaViste();
}

function impostaTurno(tv, turno, { avvisa = true } = {}) {
  if (!tv) return;
  const prima = tv.turno;
  tv.turno = turno || null;
  if (avvisa && turno && mioPgId() && turno.pgId === mioPgId() && (prima?.pgId !== turno.pgId || prima?.round !== turno.round)) {
    vibra([60, 40, 60]);
    avviso(`⚔ È il tuo turno! (round ${turno.round})`);
  }
  salvaTavoli();
}

// ───────────────────────── Comandi ─────────────────────────

function generaCodice() {
  const a = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(a, (x) => ALFABETO[x % ALFABETO.length]).join('');
}

export async function apriNuovoTavolo({ master = false } = {}) {
  if (!master && !stato.pg) return;
  await caricaTavoli();
  const nome = await chiediTesto('Nome del tavolo', 'La nostra campagna', { etichetta: 'Come si chiama la vostra avventura? (lo vedranno tutti)' });
  if (nome == null) return;
  const codice = generaCodice();
  const tv = assicuraTavolo(codice, nome.trim() || 'La nostra campagna');
  tv.creato = Date.now();
  await avvia(codice, { master });
}

export async function uniscitiA(codice, { master = false } = {}) {
  codice = String(codice || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (codice.length !== 6) return avviso('Il codice del tavolo ha 6 caratteri (lettere e numeri).', 'errore');
  await caricaTavoli();
  // Se il tavolo è già conosciuto (serata precedente) si può anche fare da centralino; se è nuovo, bisogna trovarlo aperto
  await avvia(codice, { puoFareHost: !!tavoloDa(codice)?.registro.length, master });
}

export async function riapri(codice, { master = false } = {}) { await caricaTavoli(); await avvia(codice, { puoFareHost: true, master }); }

export async function esci({ silenzioso = false } = {}) {
  S.chiuso = true;
  pulisciPeer();
  S.fase = 'spento'; S.ruolo = null; S.presenti = new Set();
  chiudiPFInSospeso();
  await db.salvaImpostazione('tavoloAttivo', null);
  aggiornaViste();
  if (!silenzioso) avviso('Sei uscito dal tavolo. Lo ritrovi qui la prossima volta: basta toccare "Riapri".');
}

// Chiamata quando si apre un personaggio: se stasera era già al tavolo, si ricollega da solo
export async function alPersonaggio(pg) {
  await caricaTavoli();
  if (S.fase !== 'spento' && (S.io?.master || S.io?.id !== pg.id)) sospendi();
  if (S.fase !== 'spento') return;
  const att = await db.impostazione('tavoloAttivo');
  if (att && !att.master && att.pgId === pg.id && Date.now() - att.t < RIAPERTURA_AUTOMATICA && tavoloDa(att.codice)) avvia(att.codice, { puoFareHost: true });
}
// Stessa cosa per la modalità Master
export async function alMaster() {
  await caricaTavoli();
  if (S.fase !== 'spento' && !S.io?.master) sospendi();
  if (S.fase !== 'spento') return;
  const att = await db.impostazione('tavoloAttivo');
  if (att?.master && Date.now() - att.t < RIAPERTURA_AUTOMATICA && tavoloDa(att.codice)) avvia(att.codice, { puoFareHost: true, master: true });
}
// Tornando all'elenco dei personaggi il collegamento si sospende (si riprende riaprendo lo stesso personaggio)
export function sospendi() {
  if (S.fase === 'spento') return;
  chiudiPFInSospeso();
  S.chiuso = true; pulisciPeer(); S.fase = 'spento'; S.ruolo = null; aggiornaViste();
}

// Il telefono torna in primo piano (sbloccato): si controlla che il collegamento sia ancora vivo
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible' || S.chiuso || S.fase === 'spento') return;
  const p = S.peer;
  if (!p || p.destroyed) { if (S.ruolo === 'host') tentaHost(); else tentaOspite({ poiHost: true }); return; }
  if (p.disconnected) try { p.reconnect(); } catch {}
  if (S.ruolo === 'ospite' && !S.conn?.open) centralinoPerso();
  else pubblicaStato();
});

// ───────────────────────── Interfaccia ─────────────────────────

const elementiVivi = new Set();   // pezzi di interfaccia da ridisegnare quando arrivano notizie dal tavolo
export function vivo(costruisci) {
  const ctr = h('div.vivo');
  const el = { ctr, disegna: () => { try { ctr.replaceChildren(costruisci()); } catch (e) { console.error(e); } } };
  el.disegna();
  elementiVivi.add(el);
  return ctr;
}
export function ridisegna() { aggiornaElementiVivi(); }
function aggiornaElementiVivi() {
  for (const el of [...elementiVivi]) {
    if (!el.ctr.isConnected) { if (el.staccato) elementiVivi.delete(el); el.staccato = true; continue; }
    el.staccato = false;
    el.disegna();
  }
}

export const TESTO_FASE = { collegamento: 'Collegamento…', collegato: 'Al tavolo', riconnessione: 'Riconnessione…', spento: '' };

// Pulsante nella barra in alto
export function pulsanteTavolo({ master = false } = {}) {
  return vivo(() => {
    const presenti = S.fase === 'collegato' ? S.presenti.size : 0;
    return h('button.btn-icona.btn-tavolo', { 'aria-label': 'Tavolo di gioco', 'data-fase': S.fase, onclick: () => apriTavolo({ master }) },
      ico('tavolo'),
      S.fase !== 'spento' ? h('span.tavolo-pallino', presenti > 1 ? presenti : '') : null);
  });
}

export function coloreBarra(m) {
  const perc = m.pf.max ? m.pf.att / m.pf.max : 0;
  return perc <= 0 ? 'grigio' : perc <= 0.25 ? 'rosso' : perc <= 0.5 ? 'arancio' : '';
}

export function schedaCompagno(m, { presente: pres, io, extra = null, onclick = null, classe = '' } = {}) {
  const perc = Math.max(0, Math.min(100, (m.pf.att / (m.pf.max || 1)) * 100));
  const col = coloreBarra(m);
  const cond = [...m.condizioni.map(nomeCondizione), m.sfinimento ? `Sfinimento ${m.sfinimento}` : null].filter(Boolean);
  return h('div.compagno' + (pres ? '' : '.assente') + (io ? '.io' : '') + (col === 'rosso' || col === 'grigio' ? '.critico' : '') + (onclick ? '.cliccabile' : '') + (classe ? '.' + classe : ''), { onclick },
    h('div.comp-sigillo', sigillo(m.classe), h('span.comp-stato', { title: pres ? 'Collegato' : 'Non collegato' })),
    h('div.comp-info',
      h('div.comp-nome', h('strong', m.nome), io ? h('span.badge.oro', 'tu') : null),
      h('small', `${m.classi || m.classe} · Liv. ${m.livello}`),
      h('div.barra.comp-barra', h('div.barra-riemp' + (col ? '.' + col : ''), { style: { width: perc + '%' } }),
        m.pf.temp > 0 ? h('div.barra-temp', { style: { width: Math.min(100, (m.pf.temp / (m.pf.max || 1)) * 100) + '%' } }) : null),
      cond.length ? h('div.comp-cond', cond.map((c) => h('span.comp-chip', c))) : null,
      m.pf.att <= 0 && (m.tsMorte?.succ || m.tsMorte?.fall) ? h('small.comp-morte', `TS morte: ✔${m.tsMorte.succ} ✖${m.tsMorte.fall}`) : null,
      extra,
      !pres && m.t ? h('small.comp-visto', `Non collegato · ultimo aggiornamento ${serataDi(m.t) === serataDi(Date.now()) ? 'stasera alle ' + ora(m.t) : 'il ' + new Date(m.t).toLocaleDateString('it-IT')}`) : null),
    h('div.comp-numeri',
      h('div.comp-pf', h('strong', m.pf.att), h('small', `/${m.pf.max}`), m.pf.temp > 0 ? h('span.comp-temp', `+${m.pf.temp}`) : null),
      h('div.comp-ca', ico('scudo'), h('span', m.ca))));
}

export function elencoCompagni(tv, { soloAltri = false } = {}) {
  const io = mioPgId();
  const membri = Object.values(tv.membri).filter((m) => m && !(soloAltri && m.id === io));
  membri.sort((a, b) => (b.id === io) - (a.id === io) || (S.presenti.has(b.id) - S.presenti.has(a.id)) || a.nome.localeCompare(b.nome));
  return membri;
}

export function registroPerSerata(tv, { limite = 80 } = {}) {
  const gruppi = new Map();
  for (const v of [...tv.registro].reverse()) {
    if (!gruppi.has(v.serata)) gruppi.set(v.serata, []);
    gruppi.get(v.serata).push(v);
  }
  if (!gruppi.size) return h('p.nota', 'Il registro è vuoto: qui compariranno ferite, cure e condizioni di tutti, divise per serata.');
  let i = 0;
  return h('div.registro', [...gruppi].map(([s, voci]) => {
    const righe = voci.slice(0, limite).map((v) => h('div.voce' + (v.tipo ? '.voce-' + v.tipo : ''), h('span.voce-ora', ora(v.t)), h('span.voce-testo', v.testo)));
    return h('details.serata', { open: i++ === 0 }, h('summary', nomeSerata(s), h('small', ` · ${voci.length} ${voci.length === 1 ? 'evento' : 'eventi'}`)), righe);
  }));
}

export function mostraQR(codice) {
  pannello('Codice del tavolo', (c) => {
    const qr = h('div.qr');
    c.append(h('div.qr-ctr', qr), h('p.codice-grande', codice),
      h('p.nota.centrato', 'I giocatori aprono la loro scheda, toccano il tavolo in alto e scelgono "Unisciti a un tavolo": possono inquadrare questo QR o scrivere il codice.'));
    rete().then(({ qrcode }) => {
      const q = qrcode(0, 'M'); q.addData(`SCHEDA-DND TAVOLO ${codice}`); q.make();
      qr.innerHTML = q.createSvgTag({ cellSize: 8, margin: 2, scalable: true });
    });
  }, { classe: 'stretto' });
}

export function testoPresenze(tv) {
  const giocatori = elencoCompagni(tv).filter((m) => S.presenti.has(m.id)).length;
  const master = tv.master && S.presenti.has(tv.master.id);
  return `${giocatori} ${giocatori === 1 ? 'eroe collegato' : 'eroi collegati'}${master ? ' · Master presente' : ''}${S.ruolo === 'host' ? ' · questo telefono fa da centralino' : ''}`;
}

// Pannello principale del tavolo
export async function apriTavolo({ master = false } = {}) {
  await caricaTavoli();
  pannello('Tavolo di gioco', (c) => { c.append(vivo(() => contenutoTavolo({ master }))); }, { pieno: true });
}

export function testaTavolo(tv) {
  return h('div.tavolo-testa',
    h('div.tavolo-titoli', h('h3.tavolo-nome', tv.nome),
      h('p.tavolo-fase', { 'data-fase': S.fase }, S.fase === 'collegato' ? testoPresenze(tv) : TESTO_FASE[S.fase])),
    h('button.codice-btn', { onclick: () => mostraQR(tv.codice) }, h('small', 'Codice'), h('strong', tv.codice), h('small', 'mostra QR')));
}

function contenutoTavolo({ master }) {
  const tv = tavoloAttivo();
  if (!tv) return contenutoSenzaTavolo({ master });
  const turno = tv.turno;
  return h('div.tavolo',
    testaTavolo(tv),
    S.fase !== 'collegato' ? h('p.nota', S.fase === 'collegamento' ? 'Cerco il tavolo… se nessuno lo ha ancora aperto, questo telefono farà da centralino.' : 'Il collegamento si è interrotto: riprovo da solo. Tieni l\'app aperta.') : null,
    turno ? h('div.turno-banner', h('strong', `Round ${turno.round}`), ` · turno di ${turno.nome}`, turno.prossimo ? h('small', ` · poi ${turno.prossimo}`) : null) : null,
    !S.io?.master && turno?.ordine?.length ? ordineCombattimento(turno) : null,
    !S.io?.master ? sezioneDalMaster(tv) : null,
    h('h3.card-titolo', 'Compagni'),
    !S.io?.master ? h('p.nota', 'Tocca un compagno per curarlo o dargli PF temporanei: il suo telefono li riceve subito.') : null,
    h('div.compagni', elencoCompagni(tv).map((m) => schedaCompagno(m, {
      presente: S.presenti.has(m.id), io: m.id === mioPgId(),
      onclick: m.id !== mioPgId() && !S.io?.master ? () => azioniSuCompagno(m) : null,
    }))),
    Object.keys(tv.membri).length < 2 && !S.io?.master ? h('p.nota', 'Nessun compagno ancora: tocca il codice in alto e fai inquadrare il QR.') : null,
    h('h3.card-titolo', 'Registro'),
    registroPerSerata(tv),
    h('div.riga-btn',
      h('button.btn', { onclick: () => rinominaTavolo(tv) }, 'Rinomina'),
      h('button.btn.pericolo', { onclick: () => esci() }, 'Esci dal tavolo')));
}

// Ordine dei turni, se il Master ha deciso di mostrarlo (i mostri nascosti non compaiono)
function ordineCombattimento(turno) {
  return h('div.ordine-turni',
    h('h3.card-titolo', 'Ordine dei turni'),
    turno.ordine.map((o) => h('div.ordine-riga' + (o.attuale ? '.attuale' : '') + (o.tipo === 'mostro' ? '.mostro' : '') + (o.pgId && o.pgId === mioPgId() ? '.mio' : ''),
      h('span.ordine-nome', o.nome), o.stato ? h('small.ordine-stato', o.stato) : null)));
}

// Contenuti mostrati dal Master e messaggi con lui (lato giocatore)
function sezioneDalMaster(tv) {
  const vetrina = tv.vetrina || [];
  const chat = (tv.chat || []).slice(-6);
  const nuoviMsg = (tv.chat || []).filter((v) => !v.letto).length;
  if (!vetrina.length && !chat.length && !tv.master) return null;
  return h('div.dal-master',
    h('h3.card-titolo', 'Dal Master', nuoviMsg ? h('span.badge', `${nuoviMsg} nuovi`) : null),
    vetrina.length ? h('div.vetrina-lista', vetrina.map((c) => h('button.vetrina-voce' + (c.visto ? '' : '.nuova'), { onclick: () => apriContenuto(c, { dalMaster: true }) },
      h('span.vetrina-icona', c.img ? '🖼' : '📜'), h('span.vetrina-titolo', c.titolo || 'Senza titolo'), c.visto ? null : h('span.badge', 'nuovo')))) : null,
    chat.length ? h('div.chat-mini', chat.map((v) => h('div.chat-riga' + (v.da === 'master' ? '.dal-master' : '.mia') + (v.letto ? '' : '.non-letto'),
      { onclick: () => segnaLetti((x) => x.id === v.id) },
      h('small', v.da === 'master' ? (v.a === 'tutti' ? 'Master, a tutti' : 'Master, solo a te') : 'Tu', ' · ', ora(v.t)), h('span', v.testo)))) : null,
    tv.master ? h('button.btn', { onclick: rispondiAlMaster }, '✉ Scrivi al Master') : null);
}

export async function rinominaTavolo(tv) {
  const n = await chiediTesto('Nome del tavolo', tv.nome);
  if (n && n.trim() && n.trim() !== tv.nome) { tv.nome = n.trim(); salvaTavoli(); aggiungiVoce(`Il tavolo ora si chiama "${tv.nome}"`, { tipo: 'nome', nomeTavolo: tv.nome }); }
}

export function contenutoSenzaTavolo({ master = false } = {}) {
  const noti = [...(tavoli || [])].sort((a, b) => (b.ultimoUso || 0) - (a.ultimoUso || 0));
  return h('div.tavolo',
    master
      ? h('p', 'Apri il tavolo della campagna: i giocatori si collegano con il QR e tu vedi tutti in diretta, mandi danni e condizioni e gestisci l\'iniziativa.')
      : h('p', 'Collega il telefono a quelli dei compagni: vedrete i punti ferita e le condizioni di tutti in diretta, e il registro della serata resterà salvato per la volta dopo.'),
    h('p.nota', master
      ? 'Consiglio: tieni l\'app del Master aperta sul tavolo (magari in carica): così fa da centralino per tutti.'
      : 'Serve internet (Wi-Fi o dati) su tutti i telefoni. Ognuno usa la propria scheda: si condividono solo nome, classe, PF, CA e condizioni.'),
    noti.length ? h('h3.card-titolo', 'I vostri tavoli') : null,
    noti.map((tv) => h('div.tavolo-noto',
      h('div.tavolo-noto-info', h('strong', tv.nome),
        h('small', `Codice ${tv.codice} · ${Object.keys(tv.membri).length} ${Object.keys(tv.membri).length === 1 ? 'eroe' : 'eroi'} · ultima volta il ${new Date(tv.ultimoUso || tv.creato).toLocaleDateString('it-IT')}`)),
      h('button.btn.primario.piccolo', { onclick: () => riapri(tv.codice, { master }) }, 'Riapri'),
      h('button.btn-icona', { 'aria-label': 'Dimentica questo tavolo', onclick: async () => {
        if (!(await conferma(`Dimenticare il tavolo "${tv.nome}" su questo telefono? Il registro resta sui telefoni dei compagni.`, { si: 'Dimentica', pericolo: true }))) return;
        tavoli.splice(tavoli.indexOf(tv), 1); salvaTavoli(); aggiornaViste();
      } }, '🗑'))),
    h('div.lista-scelte',
      h('button.btn.grande.primario', { onclick: () => apriNuovoTavolo({ master }) }, ico('piu'), 'Apri un nuovo tavolo'),
      h('button.btn.grande', { onclick: () => apriUnisciti({ master }) }, ico('tavolo'), 'Unisciti a un tavolo')));
}

// Un giocatore aiuta un compagno: cura o PF temporanei
function azioniSuCompagno(m) {
  pannello(m.nome, (c, chiudi) => {
    const numero = h('input.campo.campo-numero', { type: 'number', inputMode: 'numeric', placeholder: 'quanti?' });
    const motivo = h('input.campo', { placeholder: 'Motivo (facoltativo), es. Parola guaritrice' });
    const manda = (tipo) => {
      const v = Number(numero.value);
      if (!v || v < 0) return avviso('Scrivi quanti PF', 'errore');
      if (inviaAzione(m.id, { tipo, valore: v, motivo: motivo.value.trim() })) { chiudi(); avviso(`Inviato a ${m.nome}`); }
    };
    c.append(
      h('p', `PF ${m.pf.att}/${m.pf.max}${m.pf.temp ? ` (+${m.pf.temp} temporanei)` : ''}${S.presenti.has(m.id) ? '' : ' · non collegato: lo riceverà appena torna'}`),
      numero, motivo,
      h('div.riga-btn',
        h('button.btn.grande.verde', { onclick: () => manda('cura') }, '✚ Cura'),
        h('button.btn.grande', { onclick: () => manda('pftemp') }, '◈ PF temporanei')));
    setTimeout(() => numero.focus(), 250);
  }, { classe: 'stretto' });
}

function apriUnisciti({ master = false } = {}) {
  pannello('Unisciti a un tavolo', (c, chiudi) => {
    const inp = h('input.campo.campo-codice', { maxLength: 6, placeholder: 'ABC123', autocapitalize: 'characters', autocomplete: 'off', spellcheck: false,
      oninput: () => { inp.value = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); } });
    c.append(
      h('p', 'Chiedi a chi ha aperto il tavolo di mostrarti il QR: nel suo tavolo, tocca il codice in alto.'),
      h('button.btn.grande.primario', { onclick: () => { chiudi(); scansionaQR({ master }); } }, '📷 Inquadra il QR'),
      h('p.nota.centrato', 'oppure scrivi il codice'),
      inp,
      h('button.btn.grande', { onclick: () => { const v = inp.value; if (v.length === 6) { chiudi(); uniscitiA(v, { master }); } else avviso('Il codice ha 6 caratteri', 'errore'); } }, 'Entra'));
  }, { classe: 'stretto' });
}

// Lettura del QR con la fotocamera, dentro l'app (su iPhone l'app installata non condivide i dati con Safari)
async function scansionaQR({ master = false } = {}) {
  let flusso = null, fermo = false;
  const video = h('video.qr-video', { muted: true, autoplay: true });
  video.setAttribute('playsinline', '');
  const pn = pannello('Inquadra il QR', (c) => {
    c.append(h('div.qr-camera', video, h('div.qr-mirino')), h('p.nota.centrato', 'Inquadra il QR sul telefono di chi ha aperto il tavolo.'));
  }, { onChiudi: () => { fermo = true; flusso?.getTracks().forEach((t) => t.stop()); }, classe: 'stretto' });
  try {
    const { jsQR } = await rete();
    flusso = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    if (fermo) { flusso.getTracks().forEach((t) => t.stop()); return; }
    video.srcObject = flusso;
    await video.play().catch(() => {});
    const tela = document.createElement('canvas');
    const ctx = tela.getContext('2d', { willReadFrequently: true });
    const giro = () => {
      if (fermo) return;
      if (video.readyState >= 2 && video.videoWidth) {
        const sc = Math.min(1, 640 / video.videoWidth);
        tela.width = Math.round(video.videoWidth * sc); tela.height = Math.round(video.videoHeight * sc);
        ctx.drawImage(video, 0, 0, tela.width, tela.height);
        const img = ctx.getImageData(0, 0, tela.width, tela.height);
        const r = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
        const m = r?.data?.match(/TAVOLO\s+([A-Z0-9]{6})/);
        if (m) { vibra(30); pn.chiudi(); uniscitiA(m[1], { master }); return; }
      }
      setTimeout(() => requestAnimationFrame(giro), 120);
    };
    giro();
  } catch (e) {
    console.error(e);
    pn.chiudi();
    avviso('Non riesco ad aprire la fotocamera: scrivi il codice a mano. (' + (e.name === 'NotAllowedError' ? 'permesso negato' : e.message) + ')', 'errore');
  }
}

// Riquadro "Compagni al tavolo" nella scheda Eroe: si aggiorna da solo quando cambiano i PF dei compagni
export function renderStrisciaCompagni(c) {
  c.append(vivo(() => {
    const tv = tavoloAttivo();
    if (!tv || S.io?.master) return null;
    const altri = elencoCompagni(tv, { soloAltri: true });
    const turno = tv.turno;
    return h('div.card.striscia-compagni', { onclick: () => apriTavolo() },
      h('h3.card-titolo', ico('tavolo'), h('span.striscia-titolo', tv.nome), h('span.striscia-fase', { 'data-fase': S.fase }, TESTO_FASE[S.fase])),
      turno ? h('div.turno-banner' + (turno.pgId === mioPgId() ? '.mio' : ''), h('strong', `Round ${turno.round}`), turno.pgId === mioPgId() ? ' · tocca a te!' : ` · turno di ${turno.nome}`, turno.prossimo ? h('small', ` · poi ${turno.prossimo}`) : null) : null,
      (() => {
        const msg = (tv.chat || []).filter((v) => !v.letto).length;
        const cose = (tv.vetrina || []).filter((c) => !c.visto).length;
        return msg || cose ? h('div.avviso-master', [msg ? `✉ ${msg} ${msg === 1 ? 'messaggio' : 'messaggi'} dal Master` : null, cose ? `📜 ${cose} ${cose === 1 ? 'cosa nuova' : 'cose nuove'} da vedere` : null].filter(Boolean).join(' · ')) : null;
      })(),
      altri.length ? altri.map((m) => {
        const col = coloreBarra(m);
        return h('div.striscia-riga' + (S.presenti.has(m.id) ? '' : '.assente'),
          h('span.striscia-nome', m.nome),
          h('div.barra.mini', h('div.barra-riemp' + (col ? '.' + col : ''), { style: { width: Math.max(0, Math.min(100, (m.pf.att / (m.pf.max || 1)) * 100)) + '%' } })),
          h('span.striscia-pf', `${m.pf.att}/${m.pf.max}`),
          m.condizioni.length ? h('span.striscia-cond', m.condizioni.length === 1 ? nomeCondizione(m.condizioni[0]) : `${m.condizioni.length} condizioni`) : null);
      }) : h('p.nota', 'In attesa dei compagni… tocca qui e mostra il QR.'));
  }));
}
