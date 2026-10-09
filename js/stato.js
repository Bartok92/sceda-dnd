// Stato dell'app: personaggio corrente, salvataggio automatico, notifiche di cambiamento.
import { db, nuovoId } from './db.js';
import * as R from './regole.js';
import { TALENTI_ORIGINE, SPECIE } from './dati2024.js';
import { INCANTESIMI_BASE, DESCRIZIONI_2014 } from './incantesimi-base.js';

export const stato = { pg: null, tab: 'eroe' };
const ascoltatori = new Set();
export const suCambio = (fn) => ascoltatori.add(fn);
export const notifica = (cosa) => ascoltatori.forEach((f) => f(cosa));

let timer = null;
export function salvaPresto() {
  clearTimeout(timer);
  timer = setTimeout(salvaOra, 350);
}
export async function salvaOra() {
  clearTimeout(timer);
  if (!stato.pg) return;
  stato.pg.modificato = Date.now();
  try { await db.scrivi('personaggi', structuredClone(stato.pg)); }
  catch (e) { console.error(e); import('./ui.js').then((u) => u.avviso('Salvataggio non riuscito: ' + e.message, 'errore')); }
}
window.addEventListener('pagehide', salvaOra);
document.addEventListener('visibilitychange', () => document.hidden && salvaOra());

// Applica una modifica al personaggio, salva e ridisegna
export function modifica(fn, cosa = 'scheda') {
  fn(stato.pg);
  salvaPresto();
  notifica(cosa);
}

export function personaggioVuoto() {
  return {
    id: nuovoId(), creato: Date.now(), modificato: Date.now(),
    nome: 'Nuovo eroe', razza: 'Umano', classe: 'Guerriero', sottoclasse: '', multiclasse: [], livello: 1, pe: 0,
    allineamento: 'Neutrale Puro', background: '', ispirazione: false,
    car: { FOR: 10, DES: 10, COS: 10, INT: 10, SAG: 10, CAR: 10 },
    tsComp: [], bonusTiriSalvezza: 0, abilita: {}, bonusAbilita: {},
    pf: { att: 10, max: 10, temp: 0 }, dadiVita: { tipo: 10, rimasti: 1 }, tsMorte: { succ: 0, fall: 0 },
    ca: { modo: 'auto', manuale: 10, bonus: 0 }, velocita: 9, iniziativaBonus: 0,
    attacchi: [],
    magia: { tipo: 'nessuna', car: null, slotUsati: [0, 0, 0, 0, 0, 0, 0, 0, 0], pattoUsati: 0, slotManuali: null },
    incantesimi: [],
    inventario: [], monete: { mr: 0, ma: 0, me: 0, mo: 0, mp: 0 },
    condizioni: [], sfinimento: 0,
    risorse: [], tratti: [], competenzeAltre: '', note: '',
    talenti: [], maestrie: [],   // talenti con effetto automatico; armi di cui si usa la maestria (id del manuale)
    automatismiOff: [],          // regole automatiche spente a mano (vedi R.AUTOMATISMI)
    talentiScelti: [],           // talenti aggiunti dall'elenco del manuale: [{ uid, id }] (vedi privilegi2024.js)
    modelli: [], animazione: '', tema: '',   // tema: '' = segue il tema generale
    effetti: [], concentrazione: null,       // effetti ricevuti (Scudo della fede…) e concentrazione di chi lancia (effetti.js)
    storicoDadi: [],
  };
}

// Aggiornamento alle regole 2024 dei personaggi creati prima: collega armi e attacchi alle armi del manuale
// (dal nome), riconosce i talenti già scritti nei tratti e sceglie le maestrie delle armi che il personaggio usa.
function aggiorna2024(pg) {
  pg.attacchi.forEach((a) => { if (a.arma === undefined) a.arma = R.armaDaNome(a.nome)?.id || null; });
  pg.inventario.forEach((o) => { if (o.tipo === 'arma' && o.arma === undefined) o.arma = R.armaDaNome(o.nome)?.id || null; });
  pg.incantesimi.forEach((s) => { if (s.sempre === undefined) s.sempre = /^sempre preparat/i.test(s.descrizione || ''); });
  if (!pg._talentiControllati) {
    const titoli = pg.tratti.map((t) => t.titolo.toLowerCase());
    for (const id of R.TALENTI_AUTOMATICI) {
      const nome = TALENTI_ORIGINE[id].nome.toLowerCase();
      if (titoli.some((t) => t === nome || t.startsWith(nome + ' ')) && !pg.talenti.includes(id)) pg.talenti.push(id);
    }
    pg._talentiControllati = true;
  }
  // Versione 1.10.0: riconosce anche Rissaiolo e Iniziato alla magia già scritti nei tratti
  if (!pg._talentiControllati110) {
    const titoli = pg.tratti.map((t) => t.titolo.toLowerCase());
    for (const id of ['rissaiolo', 'iniziato-alla-magia']) {
      const nome = TALENTI_ORIGINE[id].nome.toLowerCase();
      if (titoli.some((t) => t === nome || t.startsWith(nome + ' ')) && !pg.talenti.includes(id)) pg.talenti.push(id);
    }
    pg._talentiControllati110 = true;
  }
  // Versione 1.10.0: l'Aura di protezione sul paladino ora è automatica. Chi l'aveva già scritta a mano nel
  // "Bonus a tutti i tiri salvezza" non deve contarla due volte: se era proprio quel valore la togliamo,
  // altrimenti spegniamo l'automatismo e il suo bonus resta com'era.
  if (!pg._aura110) {
    const aura = R.livelloDiClasse(pg, 'Paladino') >= 6 ? Math.max(1, R.mod(pg.car.CAR)) : 0;
    const scritto = Number(pg.bonusTiriSalvezza) || 0;
    if (aura && scritto === aura) pg.bonusTiriSalvezza = 0;
    else if (aura && scritto > 0 && !pg.automatismiOff.includes('aura-protezione')) pg.automatismiOff.push('aura-protezione');
    pg._aura110 = true;
  }
  // Versione 1.12.0: i tratti della specie e il talento delle origini che la creazione guidata scriveva nei tratti
  // ora si vedono da soli in Note → Tratti e privilegi. Tolgo i doppioni, ma solo se nessuno li ha modificati.
  if (!pg._tratti112) {
    const sp = SPECIE[pg.razza];
    pg.tratti = pg.tratti.filter((t) => {
      if (sp?.tratti.some((x) => t.titolo === `${x.titolo} (${pg.razza})` && t.testo === x.testo)) return false;
      if (Object.values(TALENTI_ORIGINE).some((x) => t.titolo === `${x.nome} (talento delle origini)` && t.testo === x.testo)) return false;
      return true;
    });
    pg._tratti112 = true;
  }
  // Versione 1.13.0: bonus magico (+1/+2/+3) su armi, armature e scudi. Collego ogni attacco alla sua arma dello zaino
  // (stessa arma del manuale o stesso nome) e, se il nome dice già "+1" e il bonus era scritto a mano nell'attacco o nella
  // CA, lo sposto nel nuovo campo dell'oggetto: i totali restano identici.
  if (!pg._magico113) {
    const norm = (t) => String(t || '').toLowerCase().replace(/\s*\+\d+\s*/g, ' ').trim();
    const armi = pg.inventario.filter((o) => o.tipo === 'arma');
    for (const a of pg.attacchi) {
      if (a.oggetto !== undefined) continue;
      const o = armi.find((x) => (a.arma && x.arma === a.arma) || norm(x.nome) === norm(a.nome)) || null;
      a.oggetto = o ? o.id : null;
      const n = Number((o?.nome.match(/\+([1-3])\b/) || [])[1]);
      if (o && n && !Number(o.magico) && Number(a.bonus) === n && Number(a.bonusDanni) === n) { o.magico = n; a.bonus = 0; a.bonusDanni = 0; }
    }
    // gli altri attacchi con la stessa arma già convertita non devono più avere il +N scritto a mano
    for (const a of pg.attacchi) {
      const o = pg.inventario.find((x) => x.id === a.oggetto);
      const n = Number(o?.magico) || 0;
      if (n && Number(a.bonus) === n && Number(a.bonusDanni) === n) { a.bonus = 0; a.bonusDanni = 0; }
    }
    for (const o of pg.inventario) {
      const n = Number((String(o.nome).match(/\+([1-3])\b/) || [])[1]);
      if (!n || Number(o.magico)) continue;
      if ((o.tipo === 'armatura' || o.slot === 'armatura') && Number(o.bonusCA) === n) { o.magico = n; o.bonusCA = 0; }
      else if (o.tipo === 'scudo' && Number(o.bonusCA) === 2 + n) { o.magico = n; o.bonusCA = 2; }
    }
    pg._magico113 = true;
  }
  // Incantesimi presi dal vecchio prontuario (regole 2014) e mai modificati: passano alle regole 2024
  pg.incantesimi.forEach((inc) => {
    if (DESCRIZIONI_2014[inc.nome] == null || inc.descrizione !== DESCRIZIONI_2014[inc.nome]) return;
    const nuovo = INCANTESIMI_BASE.find((b) => b.nome === inc.nome);
    if (nuovo) Object.assign(inc, { livello: nuovo.livello, scuola: nuovo.scuola, tempo: nuovo.tempo, gittata: nuovo.gittata, componenti: nuovo.componenti,
      durata: nuovo.durata, descrizione: nuovo.descrizione, concentrazione: nuovo.concentrazione });
  });
  if (!pg._maestrieControllate) {
    const max = R.maestrieMax(pg);
    if (max && !pg.maestrie.length) pg.maestrie = [...new Set(pg.attacchi.map((a) => a.arma).filter((id) => id && R.armaDaId(id)?.maestria))].slice(0, max);
    pg._maestrieControllate = true;
  }
}

// Aggiunge i campi mancanti a personaggi salvati con versioni precedenti
export function normalizza(pg) {
  const base = personaggioVuoto();
  for (const k of Object.keys(base)) if (pg[k] === undefined) pg[k] = base[k];
  pg.magia = { ...base.magia, ...pg.magia };
  pg.pf = { ...base.pf, ...pg.pf };
  pg.ca = { ...base.ca, ...pg.ca };
  pg.monete = { ...base.monete, ...pg.monete };
  try { aggiorna2024(pg); } catch (e) { console.error('Aggiornamento 2024 non riuscito', e); }
  return pg;
}
