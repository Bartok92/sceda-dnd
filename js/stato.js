// Stato dell'app: personaggio corrente, salvataggio automatico, notifiche di cambiamento.
import { db, nuovoId } from './db.js';
import * as R from './regole.js';
import { TALENTI_ORIGINE } from './dati2024.js';

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
    modelli: [], animazione: '', tema: '',   // tema: '' = segue il tema generale
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
