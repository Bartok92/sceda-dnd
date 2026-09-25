// Stato dell'app: personaggio corrente, salvataggio automatico, notifiche di cambiamento.
import { db, nuovoId } from './db.js';

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
    nome: 'Nuovo eroe', razza: 'Umano', classe: 'Guerriero', sottoclasse: '', livello: 1, pe: 0,
    allineamento: 'Neutrale Puro', background: '', ispirazione: false,
    car: { FOR: 10, DES: 10, COS: 10, INT: 10, SAG: 10, CAR: 10 },
    tsComp: [], abilita: {}, bonusAbilita: {},
    pf: { att: 10, max: 10, temp: 0 }, dadiVita: { tipo: 10, rimasti: 1 }, tsMorte: { succ: 0, fall: 0 },
    ca: { modo: 'auto', manuale: 10, bonus: 0 }, velocita: 9, iniziativaBonus: 0,
    attacchi: [],
    magia: { tipo: 'nessuna', car: null, slotUsati: [0, 0, 0, 0, 0, 0, 0, 0, 0], pattoUsati: 0, slotManuali: null },
    incantesimi: [],
    inventario: [], monete: { mr: 0, ma: 0, me: 0, mo: 0, mp: 0 },
    condizioni: [], sfinimento: 0,
    risorse: [], tratti: [], competenzeAltre: '', note: '',
    modelli: [], animazione: '',
    storicoDadi: [],
  };
}

// Aggiunge i campi mancanti a personaggi salvati con versioni precedenti
export function normalizza(pg) {
  const base = personaggioVuoto();
  for (const k of Object.keys(base)) if (pg[k] === undefined) pg[k] = base[k];
  pg.magia = { ...base.magia, ...pg.magia };
  pg.pf = { ...base.pf, ...pg.pf };
  pg.ca = { ...base.ca, ...pg.ca };
  pg.monete = { ...base.monete, ...pg.monete };
  return pg;
}
