// Effetti su se stessi e sui compagni: incantesimi e privilegi che aiutano il gruppo.
//
// Come funziona
// - Un CATALOGO riconosce (dal nome) gli incantesimi e i privilegi che si possono lanciare su di sé o su un alleato,
//   con l'effetto vero secondo le regole: +2 CA di Scudo della fede, +1d4 di Benedizione, +5 PF massimi di Aiuto…
//   Per tutto il resto c'è l'"effetto personalizzato".
// - Chi lancia sceglie i bersagli (se stesso e/o i compagni collegati al tavolo), nel rispetto delle regole:
//   quanti bersagli, solo su di sé (es. Scudo) o solo su altri (es. Ispirazione bardica).
// - Sul telefono del bersaglio l'effetto entra in pg.effetti: CA, TS, velocità, PF massimi e condizioni cambiano da soli
//   (vedi regole.js) e i dadi extra (es. +1d4) si aggiungono ai suoi tiri.
// - Concentrazione: chi lancia tiene pg.concentrazione; un nuovo incantesimo a concentrazione chiude il precedente,
//   "Interrompi" lo toglie a tutti i bersagli e subendo danni l'app chiede il TS di Costituzione.
import { h, pannello, avviso, conferma, vibra, selezione } from './ui.js';
import { stato, modifica } from './stato.js';
import { nuovoId } from './db.js';
import * as R from './regole.js';
import { tira } from './dadi.js';

const tavolo = () => import('./tavolo.js');   // caricato quando serve (evita dipendenze circolari)
export const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const modInc = (pg) => R.mod(pg.car?.[pg.magia?.car] ?? 10);   // modificatore della caratteristica da incantatore
const piuMod = (pg) => { const m = modInc(pg); return m ? (m > 0 ? '+' : '') + m : ''; };
const sopra = (liv, base) => Math.max(0, liv - base);
const nomeCond = (id) => R.CONDIZIONI.find((c) => c.id === id)?.nome || id;

// ───────────────────────── Catalogo (regole 2024, SRD 5.2) ─────────────────────────
// bersagli: 'tutti' (te o altri) | 'se' (solo te) | 'altri' (solo altri); max(liv): quanti bersagli
// effetto(liv, pg) → { mod, nota, condizione, usi, dadoLibero }; cura/pfTemp(liv, pg) → dadi da tirare
const D = (nomi, liv, x) => ({ nomi, liv, bersagli: 'tutti', max: () => 1, conc: false, durata: 'Istantanea', ...x, nome: x.nome || cap(nomi[0]) });
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

export const CATALOGO = [
  // Trucchetti
  D(['guida', 'guidance'], 0, { conc: true, durata: '1 minuto', testo: '+1d4 alle prove dell\'abilità scelta', sceltaAbilita: true,
    effetto: (l, p, car, ab) => ({ mod: { provaDado: '1d4', ...(ab ? { soloAbilita: ab } : {}) }, nota: `+1d4 a tutte le prove di ${R.ABILITA.find((a) => a.id === ab)?.nome || 'un\'abilità scelta'} finché dura.` }) }),
  D(['resistenza', 'resistance'], 0, { conc: true, durata: '1 minuto', testo: 'Riduce di 1d4 i danni del tipo scelto', effetto: () => ({ nota: 'Quando subisci danni del tipo scelto, riducili di 1d4 (una volta per turno).' }) }),
  D(['salvare i morenti', 'risparmiare i morenti', 'stabilizzare', 'spare the dying'], 0, { nome: 'Salvare i morenti', bersagli: 'altri', speciale: 'stabilizza', testo: 'Una creatura a 0 PF diventa stabile' }),
  // 1° livello
  D(['armatura magica', 'mage armor'], 1, { durata: '8 ore', testo: 'CA 13 + Destrezza se non indossa armature', effetto: () => ({ mod: { armaturaMagica: true } }) }),
  D(['benedizione', 'bless'], 1, { conc: true, durata: '1 minuto', max: (l) => 3 + sopra(l, 1), testo: '+1d4 ai tiri per colpire e ai tiri salvezza', effetto: () => ({ mod: { attaccoDado: '1d4', tsDado: '1d4' } }) }),
  D(['scudo della fede', 'shield of faith'], 1, { conc: true, durata: '10 minuti', testo: '+2 alla CA', effetto: () => ({ mod: { ca: 2 } }) }),
  D(['scudo', 'shield'], 1, { bersagli: 'se', durata: 'fino al tuo prossimo turno', testo: '+5 alla CA (reazione)', effetto: () => ({ mod: { ca: 5 }, nota: 'Nessun danno da Dardo incantato.' }) }),
  D(['cura ferite', 'curare ferite', 'cure wounds'], 1, { testo: 'Cura 2d8 + mod. (+2d8 per livello in più)', cura: (l, p) => `${2 * l}d8${piuMod(p)}` }),
  D(['parola guaritrice', 'healing word'], 1, { testo: 'Cura 2d4 + mod. (+2d4 per livello in più)', cura: (l, p) => `${2 * l}d4${piuMod(p)}` }),
  D(['falsa vita', 'false life'], 1, { bersagli: 'se', durata: '1 ora', testo: '2d4+4 PF temporanei', pfTemp: (l) => `2d4+${4 + 5 * sopra(l, 1)}` }),
  D(['eroismo', 'heroism'], 1, { conc: true, durata: '1 minuto', max: (l) => 1 + sopra(l, 1), testo: 'Immune a Spaventato e PF temporanei a ogni turno',
    effetto: (l, p) => ({ nota: `Immune a Spaventato. All'inizio di ogni tuo turno ottieni ${Math.max(0, modInc(p))} PF temporanei.` }), pfTemp: (l, p) => String(Math.max(0, modInc(p))) }),
  D(['passolungo', 'passo lungo', 'passo veloce', 'longstrider'], 1, { nome: 'Passolungo', durata: '1 ora', max: (l) => 1 + sopra(l, 1), testo: '+3 m di velocità', effetto: () => ({ mod: { velocita: 3 } }) }),
  D(['santuario', 'sanctuary'], 1, { durata: '1 minuto', testo: 'Chi vuole colpirlo deve superare un TS su Saggezza',
    effetto: (l, p) => ({ nota: `Chi ti prende di mira con un attacco o un incantesimo dannoso deve superare un TS su Saggezza (CD ${R.cdIncantesimi(p) ?? '?'}) o scegliere un altro bersaglio. Finisce se attacchi o lanci incantesimi dannosi.` }) }),
  D(['protezione dal male e dal bene', 'protezione dal bene e dal male', 'protection from evil and good'], 1, { nome: 'Protezione dal male e dal bene', conc: true, durata: '10 minuti', testo: 'Protetto da aberrazioni, celestiali, elementali, folletti, immondi e non morti',
    effetto: () => ({ nota: 'Aberrazioni, celestiali, elementali, folletti, immondi e non morti hanno svantaggio agli attacchi contro di te; non possono affascinarti, spaventarti né possederti.' }) }),
  D(['favore divino', 'divine favor'], 1, { bersagli: 'se', durata: '1 minuto', testo: '+1d4 danni radiosi con le armi', effetto: () => ({ mod: { danniDado: '1d4' }, nota: 'I colpi con le armi fanno 1d4 danni radiosi in più.' }) }),
  D(['armatura di agathys', 'armor of agathys'], 1, { bersagli: 'se', durata: '1 ora', testo: '5 PF temporanei per livello; chi ti colpisce subisce danni da freddo',
    pfTemp: (l) => String(5 * l), effetto: (l) => ({ nota: `Finché hai questi PF temporanei, chi ti colpisce in mischia subisce ${5 * l} danni da freddo.` }) }),
  D(['salto', 'jump'], 1, { durata: '1 minuto', max: (l) => 1 + sopra(l, 1), testo: 'Salti più lunghi', effetto: () => ({ nota: 'Una volta per turno puoi saltare fino a 9 m spendendo solo 3 m di movimento.' }) }),
  D(['ritirata rapida', 'expeditious retreat'], 1, { bersagli: 'se', conc: true, durata: '10 minuti', testo: 'Scatto come azione bonus', effetto: () => ({ nota: 'Puoi usare Scatto come azione bonus.' }) }),
  // 2° livello
  D(['aiuto', 'aid'], 2, { durata: '8 ore', max: () => 3, testo: '+5 PF massimi e attuali (+5 per livello in più)', effetto: (l) => ({ mod: { pfMax: 5 * (l - 1) } }) }),
  D(['pelle coriacea', 'pelle di corteccia', 'barkskin'], 2, { nome: 'Pelle coriacea', durata: '1 ora', max: (l) => 1 + sopra(l, 2), testo: 'La CA non può essere inferiore a 17', effetto: () => ({ mod: { caMin: 17 } }) }),
  D(['invisibilita', 'invisibility'], 2, { nome: 'Invisibilità', conc: true, durata: '1 ora', max: (l) => 1 + sopra(l, 2), testo: 'Diventa Invisibile finché non attacca o lancia incantesimi',
    effetto: () => ({ condizione: 'invisibile', nota: 'Finisce se attacchi, infliggi danni o lanci un incantesimo.' }) }),
  D(['potenziare caratteristica', 'enhance ability'], 2, { conc: true, durata: '1 ora', max: (l) => 1 + sopra(l, 2), testo: 'Vantaggio alle prove di una caratteristica', sceltaCar: true,
    effetto: (l, p, car) => ({ nota: `Vantaggio alle prove di ${car || 'una caratteristica a scelta'}.` }) }),
  D(['ristorare inferiore', 'lesser restoration'], 2, { speciale: 'rimuoviCondizione', condizioni: ['accecato', 'assordato', 'avvelenato', 'paralizzato'], testo: 'Toglie Accecato, Assordato, Avvelenato o Paralizzato' }),
  D(['preghiera di guarigione', 'prayer of healing'], 2, { max: () => 5, testo: 'Cura 2d8 + mod. a fino a 5 creature (fuori dal combattimento)', cura: (l, p) => `${2 + sopra(l, 2)}d8${piuMod(p)}` }),
  D(['scurovisione', 'darkvision'], 2, { durata: '8 ore', testo: 'Scurovisione 45 m', effetto: () => ({ nota: 'Vedi al buio fino a 45 m.' }) }),
  D(['passo senza tracce', 'passare senza tracce', 'pass without trace'], 2, { conc: true, durata: '1 ora', max: () => 8, testo: '+10 alle prove di Furtività (chi è entro 9 m)', effetto: () => ({ mod: { abilita: { furtivita: 10 } } }) }),
  D(['protezione dal veleno', 'protection from poison'], 2, { durata: '1 ora', testo: 'Toglie Avvelenato; resistenza al veleno', togliCondizioni: ['avvelenato'],
    effetto: () => ({ nota: 'Vantaggio ai TS per non essere Avvelenato e resistenza ai danni da veleno.' }) }),
  D(['legame protettivo', 'legame di interdizione', 'warding bond'], 2, { nome: 'Legame protettivo', bersagli: 'altri', durata: '1 ora', testo: '+1 CA e TS, resistenza a tutti i danni',
    effetto: (l, p) => ({ mod: { ca: 1, ts: 1 }, nota: `Resistenza a tutti i danni; ${p.nome} subisce gli stessi danni che subisci tu.` }) }),
  D(['arma magica', 'magic weapon'], 2, { durata: '1 ora', testo: '+1 per colpire e ai danni con un\'arma (+2 con slot dal 3° al 5°, +3 dal 6°)',
    effetto: (l) => { const b = l >= 6 ? 3 : l >= 3 ? 2 : 1; return { mod: { attacco: b, danni: b }, nota: 'Vale per l\'arma toccata.' }; } }),
  // 3° livello
  D(['velocita', 'haste'], 3, { nome: 'Velocità', conc: true, durata: '1 minuto', testo: '+2 CA, velocità doppia e un\'azione in più',
    effetto: () => ({ mod: { ca: 2, velocitaX: 2 }, nota: 'Vantaggio ai TS su Destrezza e un\'azione in più a turno (un solo attacco, Disimpegno, Nascondersi, Scatto o Usare un oggetto). Quando finisce, per un turno non puoi muoverti né agire.' }) }),
  D(['parola guaritrice di massa', 'mass healing word'], 3, { max: () => 6, testo: 'Cura 2d4 + mod. a fino a 6 creature', cura: (l, p) => `${2 + sopra(l, 3)}d4${piuMod(p)}` }),
  D(['volare', 'fly'], 3, { conc: true, durata: '10 minuti', max: (l) => 1 + sopra(l, 3), testo: 'Velocità di volare 18 m', effetto: () => ({ nota: 'Velocità di volare 18 m.' }) }),
  D(['protezione dall energia', 'protection from energy'], 3, { nome: 'Protezione dall\'energia', conc: true, durata: '1 ora', testo: 'Resistenza a un tipo di danno',
    effetto: () => ({ nota: 'Resistenza al tipo di danno scelto (acido, freddo, fuoco, fulmine o tuono).' }) }),
  D(['respirare sott acqua', 'respirare sottacqua', 'water breathing'], 3, { nome: 'Respirare sott\'acqua', durata: '24 ore', max: () => 10, testo: 'Respira sott\'acqua', effetto: () => ({ nota: 'Puoi respirare sott\'acqua.' }) }),
  D(['revivificare', 'revivify'], 3, { bersagli: 'altri', speciale: 'revivifica', testo: 'Riporta in vita con 1 PF chi è morto da meno di un minuto' }),
  D(['mantello del crociato', 'crusader s mantle', 'crusaders mantle'], 3, { conc: true, durata: '1 minuto', max: () => 8, testo: '+1d4 danni radiosi con le armi (alleati entro 9 m)',
    effetto: () => ({ mod: { danniDado: '1d4' }, nota: 'I colpi con le armi fanno 1d4 danni radiosi in più.' }) }),
  // 4° livello
  D(['liberta di movimento', 'freedom of movement'], 4, { nome: 'Libertà di movimento', durata: '1 ora', testo: 'Niente paralisi né rallentamenti magici', togliCondizioni: ['afferrato', 'intralciato', 'paralizzato'],
    effetto: () => ({ nota: 'Il terreno difficile non ti rallenta; la magia non può ridurre la tua velocità né paralizzarti o intralciarti.' }) }),
  D(['invisibilita superiore', 'greater invisibility'], 4, { nome: 'Invisibilità superiore', conc: true, durata: '1 minuto', testo: 'Invisibile anche mentre attacca', effetto: () => ({ condizione: 'invisibile' }) }),
  D(['pelle di pietra', 'stoneskin'], 4, { conc: true, durata: '1 ora', testo: 'Resistenza a danni contundenti, perforanti e taglienti', effetto: () => ({ nota: 'Resistenza ai danni contundenti, perforanti e taglienti.' }) }),
  D(['interdizione alla morte', 'interdizione dalla morte', 'death ward'], 4, { nome: 'Interdizione alla morte', durata: '8 ore', testo: 'La prima volta che andrebbe a 0 PF resta a 1',
    effetto: () => ({ nota: 'La prima volta che scenderesti a 0 PF, resti invece a 1 PF e l\'incantesimo finisce.' }) }),
  // 5° livello e oltre
  D(['ristorare superiore', 'greater restoration'], 5, { speciale: 'rimuoviCondizione', condizioni: ['affascinato', 'pietrificato'], sfinimento: true, testo: 'Toglie un livello di Sfinimento, Affascinato o Pietrificato' }),
  D(['cura ferite di massa', 'curare ferite di massa', 'mass cure wounds'], 5, { max: () => 6, testo: 'Cura 5d8 + mod. a fino a 6 creature (controlla il tuo manuale)', cura: (l, p) => `${5 + sopra(l, 5)}d8${piuMod(p)}` }),
  D(['guarigione', 'heal'], 6, { testo: 'Cura 70 PF e toglie Accecato, Assordato e Avvelenato', cura: (l) => String(70 + 10 * sopra(l, 6)), togliCondizioni: ['accecato', 'assordato', 'avvelenato'] }),
];

// Trova la voce di catalogo per un incantesimo dell'utente (dal nome, italiano o inglese)
export function trovaIncantesimo(s) {
  const n = norm(s?.nome);
  if (!n) return null;
  return CATALOGO.find((d) => d.nomi.some((x) => norm(x) === n)) || null;
}

// ───────────────────────── Privilegi di classe per il gruppo ─────────────────────────
function risorsaDi(pg, id, parole) {
  return (pg.risorse || []).find((r) => r.id === id || parole.some((w) => norm(r.nome).includes(w))) || null;
}
const livelloClasse = (pg, classe) => R.elencoClassi(pg).filter((c) => c.classe === classe).reduce((s, c) => s + (c.livello || 0), 0);

export function privilegiDisponibili(pg) {
  const out = [];
  const pal = livelloClasse(pg, 'Paladino'), bar = livelloClasse(pg, 'Bardo'), gue = livelloClasse(pg, 'Guerriero'), bb = livelloClasse(pg, 'Barbaro');
  if (pal) out.push({ id: 'imposizione', nome: 'Imposizione delle mani', testo: 'Cura te o un compagno con la tua riserva di PF (5 punti per togliere Avvelenato)', risorsa: risorsaDi(pg, 'imposizione', ['imposizione']) });
  if (pal >= 6) out.push({ id: 'aura', nome: 'Aura di protezione', testo: `+${Math.max(1, R.mod(pg.car.CAR))} ai tiri salvezza dei compagni entro ${pal >= 18 ? 9 : 3} m (su di te la scheda la conta già)` });
  if (bar) out.push({ id: 'ispirazione-bardica', nome: 'Ispirazione bardica', testo: `Dai a un compagno un d${bar >= 15 ? 12 : bar >= 10 ? 10 : bar >= 5 ? 8 : 6} da aggiungere a un tiro`, risorsa: risorsaDi(pg, 'ispirazione', ['ispirazione bardica']) });
  if (gue) out.push({ id: 'secondo-fiato', nome: 'Secondo fiato', testo: `Recuperi 1d10+${gue} PF (solo su di te)`, risorsa: risorsaDi(pg, 'secondo-fiato', ['secondo fiato', 'recuperare energie']) });
  if (bb) out.push({ id: 'ira', nome: 'Ira', testo: `+${bb >= 16 ? 4 : bb >= 9 ? 3 : 2} danni con la Forza e resistenze (solo su di te)`, risorsa: risorsaDi(pg, 'ira', ['ira']) });
  return out;
}

// ───────────────────────── Applicare e togliere un effetto (dentro modifica) ─────────────────────────

function curaLocale(x, v) {
  if (x.pf.att <= 0 && v > 0) x.tsMorte = { succ: 0, fall: 0 };
  x.pf.att = Math.min(x.pf.max, x.pf.att + v);
}

export function aggiungiEffetto(x, e) {
  x.effetti ||= [];
  // Lo stesso effetto dalla stessa fonte si rinnova (non si accumula)
  for (const vecchio of x.effetti.filter((y) => y.nome === e.nome && y.da?.id === e.da?.id)) togliEffetto(x, vecchio.id);
  const nuovo = structuredClone(e);
  nuovo.applicato = {};
  const pfMax = Number(nuovo.mod?.pfMax) || 0;
  if (pfMax) { x.pf.max += pfMax; x.pf.att += pfMax; nuovo.applicato.pfMax = pfMax; }
  if (nuovo.condizione && !x.condizioni.includes(nuovo.condizione)) { x.condizioni.push(nuovo.condizione); nuovo.applicato.condizione = true; }
  x.effetti.push(nuovo);
}

export function togliEffetto(x, id) {
  const i = (x.effetti || []).findIndex((y) => y.id === id);
  if (i < 0) return null;
  const e = x.effetti[i];
  if (e.applicato?.pfMax) { x.pf.max = Math.max(1, x.pf.max - e.applicato.pfMax); x.pf.att = Math.min(x.pf.att, x.pf.max); }
  if (e.applicato?.condizione) x.condizioni = x.condizioni.filter((c) => c !== e.condizione);
  x.effetti.splice(i, 1);
  return e;
}

// Descrizione breve di cosa fa un effetto
export function sommario(e) {
  const m = e.mod || {}; const s = [];
  if (m.ca) s.push(`${R.segno(m.ca)} CA`);
  if (m.caMin) s.push(`CA almeno ${m.caMin}`);
  if (m.armaturaMagica) s.push('CA 13 + DES');
  if (m.ts) s.push(`${R.segno(m.ts)} ai TS`);
  if (m.tsDado) s.push(`+${m.tsDado} ai TS`);
  if (m.attacco) s.push(`${R.segno(m.attacco)} per colpire`);
  if (m.attaccoDado) s.push(`+${m.attaccoDado} per colpire`);
  if (m.danni) s.push(`${R.segno(m.danni)} danni`);
  if (m.danniDado) s.push(`+${m.danniDado} danni`);
  if (m.provaDado) s.push(`+${m.provaDado} ${m.soloAbilita ? 'a ' + (R.ABILITA.find((a) => a.id === m.soloAbilita)?.nome || m.soloAbilita) : 'a una prova'}`);
  if (m.pfMax) s.push(`+${m.pfMax} PF massimi`);
  if (m.velocita) s.push(`+${String(m.velocita).replace('.', ',')} m velocità`);
  if (m.velocitaX > 1) s.push(`velocità ×${m.velocitaX}`);
  for (const [ab, v] of Object.entries(m.abilita || {})) s.push(`${R.segno(v)} ${R.ABILITA.find((a) => a.id === ab)?.nome || ab}`);
  if (e.condizione) s.push(nomeCond(e.condizione));
  if (e.dadoLibero) s.push(`${e.dadoLibero} da aggiungere a un tiro`);
  return s.join(' · ');
}

// ───────────────────────── Tiri con i dadi degli effetti ─────────────────────────
// ambito: 'attacco' | 'ts' | 'prova' | 'danni'. Gli effetti "a un uso" (es. Guida) finiscono dopo il tiro.
export function tiraCon(expr, etichetta, ambito, opz = {}, { critico = false, abilita = null } = {}) {
  const p = stato.pg;
  const extra = p ? R.dadiEffetti(p, ambito, abilita) : '';
  const nomi = p ? R.effettiConDadi(p, ambito, abilita).map((e) => e.nome) : [];
  let e = String(expr) + extra;
  if (critico) e = e.replace(/(\d*)d(\d+)/g, (_, n, f) => `${(Number(n) || 1) * 2}d${f}`);
  const r = tira(e, etichetta + (nomi.length ? ` (+ ${nomi.join(', ')})` : ''), opz);
  const usati = (p?.effetti || []).filter((x) => x.usi === ambito);
  if (r && usati.length) {
    modifica((x) => usati.forEach((u) => togliEffetto(x, u.id)));
    usati.forEach((u) => avvisaFineAlLanciatore(u));
    setTimeout(() => avviso(`${usati.map((u) => u.nome).join(', ')}: usato`), 1200);
  }
  return r;
}

// ───────────────────────── Concentrazione ─────────────────────────

export async function finisciConcentrazione({ chiedi = false, motivo = '' } = {}) {
  const p = stato.pg; const c = p?.concentrazione;
  if (!c) return true;
  if (chiedi && !(await conferma(`Interrompere la concentrazione su ${c.nome}? L'effetto finisce per ${c.bersagli.map((b) => b.nome).join(', ')}.`, { si: 'Interrompi' }))) return false;
  const T = await tavolo();
  const nonAvvisati = [];
  for (const b of c.bersagli) {
    if (b.id === p.id) modifica((x) => togliEffetto(x, b.effettoId));
    else if (!T.inviaAzione(b.id, { tipo: 'fineEffetto', effettoId: b.effettoId, nome: c.nome, motivo })) nonAvvisati.push(b.nome);
  }
  modifica((x) => { x.concentrazione = null; });
  if (nonAvvisati.length) avviso(`Avvisa ${nonAvvisati.join(', ')}: ${c.nome} è finito (non sei collegato al tavolo).`, 'errore');
  else avviso(`${c.nome}: concentrazione terminata${motivo ? ' (' + motivo + ')' : ''}`);
  return true;
}

// Regole 2024: chi ha la condizione Incapacitato (anche Paralizzato, Pietrificato, Privo di sensi, Stordito; e chi
// scende a 0 PF, perché cade Privo di sensi) perde la concentrazione. Si può spegnere tra le Regole automatiche.
export function controllaIncapacitato(motivo = 'Incapacitato') {
  const p = stato.pg;
  if (!p?.concentrazione || !R.automatico(p, 'concentrazione-incapacitato')) return false;
  if (!R.incapacitato(p) && p.pf.att > 0) return false;
  finisciConcentrazione({ motivo: p.pf.att > 0 ? motivo : '0 PF' });
  return true;
}

// Dopo aver subito danni: TS su Costituzione, CD = metà dei danni (minimo 10, massimo 30)
export function controllaConcentrazione(danno) {
  const p = stato.pg; const c = p?.concentrazione;
  if (!c || !(danno > 0)) return;
  const cd = Math.min(30, Math.max(10, Math.floor(danno / 2)));
  setTimeout(() => pannello('Concentrazione!', (corpo, chiudi) => {
    const bonus = R.bonusTS(stato.pg, 'COS');
    corpo.append(h('p', `Hai subito ${danno} danni mentre mantieni `, h('strong', c.nome), `. Tiro salvezza su Costituzione, CD ${cd}.`),
      h('button.btn.grande.primario', { onclick: () => {
        const r = tiraCon('1d20' + (bonus ? (bonus > 0 ? '+' : '') + bonus : ''), 'TS di concentrazione', 'ts', { d20: true });
        chiudi();
        if (!r) return;
        setTimeout(() => { if (r.totale >= cd) avviso(`${r.totale} contro CD ${cd}: mantieni la concentrazione`); else { avviso(`${r.totale} contro CD ${cd}: concentrazione persa`, 'errore'); finisciConcentrazione({ motivo: 'TS fallito' }); } }, 1300);
      } }, `🎲 Tira (d20 ${R.segno(bonus)})`),
      h('div.riga-btn',
        h('button.btn', { onclick: () => chiudi() }, 'L\'ho superato col dado vero'),
        h('button.btn.pericolo', { onclick: () => { chiudi(); finisciConcentrazione({ motivo: 'TS fallito' }); } }, 'L\'ho fallito')));
  }, { classe: 'stretto' }), 900);
}

// Un bersaglio toglie da sé un effetto a concentrazione: il lanciatore lo sa
async function avvisaFineAlLanciatore(e) {
  if (!e.conc || !e.da?.id || e.da.id === stato.pg?.id) {
    if (e.conc && e.da?.id === stato.pg?.id) modifica((x) => { if (x.concentrazione) { x.concentrazione.bersagli = x.concentrazione.bersagli.filter((b) => b.effettoId !== e.id); if (!x.concentrazione.bersagli.length) x.concentrazione = null; } });
    return;
  }
  const T = await tavolo();
  T.mandaA(e.da.id, { tipo: 'effettoTerminato', effettoId: e.id, nome: e.nome });
}

// Riposi: finiscono gli effetti di breve durata (breve) o quasi tutti (lungo), e la concentrazione
export async function dopoRiposo(tipo) {
  const p = stato.pg; if (!p) return;
  const scade = (e) => (tipo === 'lungo' ? !/24 ore|finch/i.test(e.durata || '') : /round|turno|minut/i.test(e.durata || ''));
  if (p.concentrazione && (tipo === 'lungo' || /round|turno|minut/i.test(p.concentrazione.durata || ''))) await finisciConcentrazione({ motivo: 'riposo' });
  const via = (stato.pg.effetti || []).filter(scade);
  if (via.length) modifica((x) => via.forEach((e) => togliEffetto(x, e.id)));
}

// ───────────────────────── Lanciare su qualcuno ─────────────────────────

// Chi posso scegliere come bersaglio: io + i compagni del tavolo (anche se non collegati: lo ricevono appena tornano)
async function bersagliPossibili() {
  const T = await tavolo();
  const p = stato.pg; const tv = T.tavoloAttivo();
  const compagni = tv ? T.elencoCompagni(tv, { soloAltri: true }).map((m) => ({ id: m.id, nome: m.nome, presente: T.presente(m.id), condizioni: m.condizioni || [], pf: m.pf })) : [];
  return { io: { id: p.id, nome: p.nome, presente: true, condizioni: p.condizioni, pf: p.pf }, compagni, alTavolo: !!tv };
}

// def: voce di catalogo (o definizione personalizzata), liv: livello dello slot usato
export async function lanciaSu(def, liv, { nome = def.nome, conc = def.conc, durata = def.durata } = {}) {
  const p = stato.pg; if (!p) return;
  durata = String(durata || '').replace(/^concentrazione,?\s*/i, '');   // "Concentrazione, fino a 10 minuti" → "fino a 10 minuti"
  const { io, compagni, alTavolo } = await bersagliPossibili();
  const max = Math.max(1, def.max?.(liv, p) || 1);
  const opzioni = [...(def.bersagli !== 'altri' ? [io] : []), ...(def.bersagli !== 'se' ? compagni : [])];
  const scelti = new Set(def.bersagli === 'se' ? [io.id] : []);
  let car = 'Forza', abilita = null, condizioniDaTogliere = new Set(), sfinimento = false;
  const esprCura = def.cura?.(liv, p) || def.pfTemp?.(liv, p) || '';
  pannello(`✦ ${nome}`, (c, chiudi) => {
    const zona = h('div.lancia-su');
    const inpDadi = h('input.campo', { value: esprCura });
    const disegna = () => zona.replaceChildren(
      h('p.nota', [def.testo, conc ? 'concentrazione' : null, durata && durata !== 'Istantanea' ? durata : null].filter(Boolean).join(' · ')),
      h('h4.sottotitolo', def.bersagli === 'se' ? 'Solo su di te' : `Su chi? (fino a ${max})`),
      h('div.chips.grandi', opzioni.map((b) => h('button.chip' + (scelti.has(b.id) ? '.attivo' : ''), {
        disabled: def.bersagli === 'se',
        onclick: () => {
          if (scelti.has(b.id)) scelti.delete(b.id);
          else { if (scelti.size >= max) { if (max === 1) scelti.clear(); else return avviso(`Al massimo ${max} bersagli`, 'errore'); } scelti.add(b.id); }
          disegna();
        },
      }, b.id === io.id ? `${b.nome} (tu)` : b.nome, b.id !== io.id && !b.presente ? h('small', ' · non collegato') : null))),
      !alTavolo && def.bersagli !== 'se' ? h('p.nota', 'Per lanciarlo su un compagno collegatevi al tavolo di gioco (icona in alto nella scheda).') : null,
      def.sceltaCar ? h('div.chips', R.CARATTERISTICHE.map((cr) => h('button.chip' + (car === cr.nome ? '.attivo' : ''), { onclick: () => { car = cr.nome; disegna(); } }, cr.nome))) : null,
      def.sceltaAbilita ? h('div', h('h4.sottotitolo', 'Quale abilità?'), h('div.chips.piccoli', R.ABILITA.map((ab) => h('button.chip' + (abilita === ab.id ? '.attivo' : ''), { onclick: () => { abilita = ab.id; disegna(); } }, ab.nome)))) : null,
      def.speciale === 'rimuoviCondizione' ? h('div',
        h('h4.sottotitolo', 'Cosa togliere'),
        h('div.chips', def.condizioni.map((id) => h('button.chip' + (condizioniDaTogliere.has(id) ? '.attivo' : ''), { onclick: () => { condizioniDaTogliere.has(id) ? condizioniDaTogliere.delete(id) : condizioniDaTogliere.add(id); disegna(); } }, nomeCond(id))),
          def.sfinimento ? h('button.chip' + (sfinimento ? '.attivo' : ''), { onclick: () => { sfinimento = !sfinimento; disegna(); } }, '1 livello di Sfinimento') : null)) : null,
      esprCura ? h('label.campo-ctr', h('span.etichetta', def.cura ? 'Punti ferita curati (dadi da tirare)' : 'PF temporanei (dadi da tirare)'), inpDadi) : null,
      h('button.btn.grande.primario', { onclick: async () => {
        if (!scelti.size) return avviso('Scegli almeno un bersaglio', 'errore');
        if (def.sceltaAbilita && !abilita) return avviso('Scegli l\'abilità', 'errore');
        chiudi();
        await applica(def, liv, [...scelti], { nome, conc, durata, car, abilita, condizioni: [...condizioniDaTogliere], sfinimento, dadi: inpDadi.value.trim(), io, compagni });
      } }, `✦ Lancia${scelti.size ? ' su ' + [...scelti].map((id) => opzioni.find((b) => b.id === id)?.nome).join(', ') : ''}`));
    disegna();
    c.append(zona);
  }, { classe: 'stretto' });
}

function creaEffetto(def, liv, extra, bersaglio) {
  const p = stato.pg;
  const base = def.effetto?.(liv, p, extra.car, extra.abilita) || {};
  return { id: nuovoId(), nome: extra.nome, da: { id: p.id, nome: p.nome }, conc: !!extra.conc, durata: extra.durata || '', t: Date.now(),
    mod: base.mod || {}, nota: base.nota || '', condizione: base.condizione || null, usi: base.usi || null, dadoLibero: base.dadoLibero || null, a: bersaglio };
}

async function applica(def, liv, ids, extra) {
  const T = await tavolo();
  const p = stato.pg;
  const nomeDi = (id) => (id === p.id ? p.nome : extra.compagni.find((b) => b.id === id)?.nome || '?');
  const manda = (id, azione) => {
    if (id === p.id) return true;
    const ok = T.inviaAzione(id, azione);
    return ok;
  };
  // Concentrazione: il nuovo incantesimo chiude quello di prima
  if (extra.conc && p.concentrazione) {
    if (!(await conferma(`Stai già mantenendo la concentrazione su ${p.concentrazione.nome}: lanciando ${extra.nome} finisce. Procedo?`, { si: 'Procedi' }))) return;
    await finisciConcentrazione({ motivo: 'nuovo incantesimo' });
  }
  const riusciti = [];
  // Cure e PF temporanei: si tira una volta e vale per tutti i bersagli
  if ((def.cura || def.pfTemp) && extra.dadi) {
    const r = tira(extra.dadi, `${extra.nome}${def.cura ? ' (cura)' : ' (PF temporanei)'}`);
    if (!r) return avviso('Dadi non validi', 'errore');
    const v = Math.max(0, r.totale);
    for (const id of ids) {
      if (id === p.id) modifica((x) => { if (def.cura) curaLocale(x, v); else x.pf.temp = Math.max(x.pf.temp || 0, v); });
      else if (manda(id, { tipo: def.cura ? 'cura' : 'pftemp', valore: v, motivo: extra.nome })) riusciti.push(id);
    }
  }
  if (def.speciale === 'rimuoviCondizione' || def.togliCondizioni) {
    const cond = def.speciale === 'rimuoviCondizione' ? extra.condizioni : def.togliCondizioni;
    const sfin = def.speciale === 'rimuoviCondizione' && extra.sfinimento;
    if (cond.length || sfin) for (const id of ids) {
      if (id === p.id) modifica((x) => { x.condizioni = x.condizioni.filter((c) => !cond.includes(c)); if (sfin && x.sfinimento > 0) x.sfinimento--; });
      else if (manda(id, { tipo: 'rimuoviCondizione', condizioni: cond, sfinimento: sfin, motivo: extra.nome })) riusciti.push(id);
    }
  }
  if (def.speciale === 'stabilizza' || def.speciale === 'revivifica') {
    for (const id of ids) if (manda(id, { tipo: def.speciale, motivo: extra.nome })) riusciti.push(id);
  }
  const bersagliConc = [];
  if (def.effetto) {
    for (const id of ids) {
      const e = creaEffetto(def, liv, extra, id);
      if (id === p.id) { modifica((x) => aggiungiEffetto(x, e)); bersagliConc.push({ id, nome: p.nome, effettoId: e.id }); }
      else if (manda(id, { tipo: 'effetto', effetto: e })) { riusciti.push(id); bersagliConc.push({ id, nome: nomeDi(id), effettoId: e.id }); }
    }
  }
  if (extra.conc && bersagliConc.length) modifica((x) => { x.concentrazione = { nome: extra.nome, durata: extra.durata, bersagli: bersagliConc, t: Date.now() }; });
  vibra(20);
  const tutti = ids.filter((id) => id === p.id || riusciti.includes(id));
  if (tutti.length) {
    def.dopo?.();   // es. consuma l'uso di Ispirazione bardica
    avviso(`${extra.nome} su ${tutti.map(nomeDi).join(', ')}`);
    if (ids.includes(p.id) && T.tavoloAttivo()) T.scriviNelRegistro(`${p.nome} usa ${extra.nome} su se stesso`, { tipo: 'livello' });
  }
}

// ───────────────────────── Privilegi di classe ─────────────────────────

function consumaRisorsa(r, n = 1) {
  if (!r) return true;
  if (r.max - (r.usati || 0) < n) { avviso(`${r.nome}: non ne hai abbastanza`, 'errore'); return false; }
  modifica((x) => { const y = x.risorse.find((z) => z.id === r.id); if (y) y.usati = Math.min(y.max, (y.usati || 0) + n); });
  return true;
}

export async function usaPrivilegio(pr) {
  const p = stato.pg;
  const bar = livelloClasse(p, 'Bardo'), gue = livelloClasse(p, 'Guerriero'), bb = livelloClasse(p, 'Barbaro'), pal = livelloClasse(p, 'Paladino');
  if (pr.id === 'imposizione') return imposizioneDelleMani(pr);
  if (pr.id === 'secondo-fiato') {
    if (!consumaRisorsa(pr.risorsa)) return;
    const r = tira(`1d10+${gue}`, 'Secondo fiato');
    modifica((x) => curaLocale(x, r.totale));
    return;
  }
  if (pr.id === 'ira') {
    if (!consumaRisorsa(pr.risorsa)) return;
    const danni = bb >= 16 ? 4 : bb >= 9 ? 3 : 2;
    const e = { id: nuovoId(), nome: 'Ira', da: { id: p.id, nome: p.nome }, conc: false, durata: 'fino a 10 minuti', t: Date.now(), mod: {},
      nota: `+${danni} ai danni degli attacchi con la Forza; resistenza ai danni contundenti, perforanti e taglienti; vantaggio a prove e TS di Forza; niente incantesimi né concentrazione.` };
    modifica((x) => aggiungiEffetto(x, e));
    avviso('Sei in ira!');
    return;
  }
  const def = pr.id === 'ispirazione-bardica'
    ? { nome: 'Ispirazione bardica', bersagli: 'altri', durata: '1 ora', testo: pr.testo, effetto: () => ({ dadoLibero: `1d${bar >= 15 ? 12 : bar >= 10 ? 10 : bar >= 5 ? 8 : 6}`, nota: 'Quando fallisci un tiro d20 puoi tirare questo dado e aggiungerlo al risultato; poi si consuma.' }) }
    : pr.id === 'aura'
      ? { nome: 'Aura di protezione', bersagli: 'altri', max: () => 8, durata: `finché è entro ${pal >= 18 ? 9 : 3} m da ${p.nome}`, testo: pr.testo, effetto: () => ({ mod: { ts: Math.max(1, R.mod(p.car.CAR)) } }) }
      : null;
  if (!def) return;
  if (pr.risorsa && !(pr.risorsa.max - (pr.risorsa.usati || 0))) return avviso(`${pr.risorsa.nome}: esaurita`, 'errore');
  await lanciaSu({ ...def, dopo: () => consumaRisorsa(pr.risorsa) }, 1, { nome: def.nome, conc: false, durata: def.durata });
}

async function imposizioneDelleMani(pr) {
  const p = stato.pg; const r = pr.risorsa;
  const disp = r ? r.max - (r.usati || 0) : 999;
  const { io, compagni } = await bersagliPossibili();
  const opzioni = [io, ...compagni];
  let scelto = io.id;
  pannello('Imposizione delle mani', (c, chiudi) => {
    const quanti = h('input.campo.campo-numero.grande', { type: 'number', inputMode: 'numeric', placeholder: 'quanti PF?', min: 1, max: disp });
    const zona = h('div');
    const disegna = () => zona.replaceChildren(h('div.chips.grandi', opzioni.map((b) => h('button.chip' + (scelto === b.id ? '.attivo' : ''), { onclick: () => { scelto = b.id; disegna(); } }, b.id === io.id ? `${b.nome} (tu)` : b.nome))));
    disegna();
    c.append(h('p.nota', `Riserva: ${disp} PF${r ? '' : ' (aggiungi la risorsa da Combatti → Dal manuale)'}`), zona, quanti,
      h('div.riga-btn',
        h('button.btn.grande.verde', { onclick: async () => {
          const v = Math.floor(Number(quanti.value));
          if (!v || v < 1) return avviso('Scrivi quanti PF', 'errore');
          if (v > disp) return avviso(`Nella riserva hai ${disp} PF`, 'errore');
          chiudi();
          const T = await tavolo();
          if (scelto === p.id) { modifica((x) => curaLocale(x, v)); consumaRisorsa(r, v); avviso(`+${v} PF`); }
          else if (T.inviaAzione(scelto, { tipo: 'cura', valore: v, motivo: 'Imposizione delle mani' })) { consumaRisorsa(r, v); avviso('Cura inviata'); }
        } }, '✚ Cura'),
      ),
      // Togliere condizioni: 5 punti della riserva ciascuna. Avvelenato sempre; dal 14° livello (Tocco ristoratore)
      // anche Accecato, Affascinato, Assordato, Spaventato, Paralizzato e Stordito.
      h('h4.sottotitolo', 'Togli una condizione (5 punti)'),
      h('div.chips', ['avvelenato', ...(livelloClasse(p, 'Paladino') >= 14 ? ['accecato', 'affascinato', 'assordato', 'spaventato', 'paralizzato', 'stordito'] : [])].map((cond) =>
        h('button.chip', { onclick: async () => {
          if (disp < 5) return avviso('Servono 5 punti della riserva', 'errore');
          chiudi();
          const T = await tavolo();
          if (scelto === p.id) { modifica((x) => { x.condizioni = x.condizioni.filter((c2) => c2 !== cond); }); consumaRisorsa(r, 5); }
          else if (T.inviaAzione(scelto, { tipo: 'rimuoviCondizione', condizioni: [cond], motivo: 'Imposizione delle mani' })) consumaRisorsa(r, 5);
        } }, nomeCond(cond)))));
    setTimeout(() => quanti.focus(), 250);
  }, { classe: 'stretto' });
}

// ───────────────────────── Effetto personalizzato ─────────────────────────
// Per tutto ciò che il catalogo non conosce: si scelgono bersagli e cosa cambia.
export async function effettoPersonalizzato(preset = {}) {
  const soloSe = /incantatore|se stess|personale|^s[eé]$/i.test(preset.gittata || '');
  const campi = { ca: '', ts: '', attacco: '', danni: '', pfMax: '', velocita: '', tsDado: '', attaccoDado: '', provaDado: '', danniDado: '', pfTemp: '', cura: '', condizione: '', nota: '' };
  const num = (k, et) => h('label.campo-ctr', h('span.etichetta', et), h('input.campo.campo-numero', { type: 'number', inputMode: 'numeric', oninput: (e) => (campi[k] = e.target.value) }));
  const txt = (k, et, ph) => h('label.campo-ctr', h('span.etichetta', et), h('input.campo', { placeholder: ph, oninput: (e) => (campi[k] = e.target.value) }));
  pannello(`✦ ${preset.nome || 'Effetto personalizzato'}`, (c, chiudi) => {
    const nome = h('input.campo', { value: preset.nome || '', placeholder: 'Nome, es. Pozione di eroismo' });
    const durata = h('input.campo', { value: preset.durata || '', placeholder: 'es. 1 minuto' });
    const conc = h('input', { type: 'checkbox', checked: !!preset.conc });
    c.append(
      h('label.campo-ctr', h('span.etichetta', 'Nome'), nome),
      soloSe ? h('p.nota', 'Questo incantesimo ha gittata "incantatore": vale solo su di te.') : null,
      h('p.nota', 'Compila solo quello che serve: i numeri si sommano alla scheda del bersaglio finché l\'effetto dura.'),
      h('div.griglia-2', num('ca', 'Bonus CA'), num('ts', 'Bonus a tutti i TS'), num('attacco', 'Bonus per colpire'), num('danni', 'Bonus ai danni'), num('pfMax', 'PF massimi in più'), num('velocita', 'Velocità in più (m)')),
      h('div.griglia-2', txt('tsDado', 'Dado ai TS', 'es. 1d4'), txt('attaccoDado', 'Dado per colpire', 'es. 1d4'), txt('provaDado', 'Dado a una prova', 'es. 1d4'), txt('danniDado', 'Dado ai danni', 'es. 1d6')),
      h('div.griglia-2', txt('cura', 'Cura subito', 'es. 2d8+3'), txt('pfTemp', 'PF temporanei', 'es. 1d4+4')),
      h('label.campo-ctr', h('span.etichetta', 'Condizione'), selezione([['', '— nessuna —'], ...R.CONDIZIONI.map((cd) => [cd.id, cd.nome])], '', (v) => (campi.condizione = v))),
      txt('nota', 'Nota (cosa ricordare)', 'es. Vantaggio ai TS contro la paura'),
      h('div.griglia-2', h('label.campo-ctr', h('span.etichetta', 'Durata'), durata), h('label.spunta', conc, ' Concentrazione')),
      h('button.btn.grande.primario', { onclick: async () => {
        const n = nome.value.trim() || 'Effetto';
        const mod = {};
        for (const k of ['ca', 'ts', 'attacco', 'danni', 'pfMax', 'velocita']) if (Number(campi[k])) mod[k] = Number(campi[k]);
        for (const k of ['tsDado', 'attaccoDado', 'provaDado', 'danniDado']) if (/^\d*d\d+$/i.test(campi[k].trim())) mod[k] = campi[k].trim().replace(/^d/i, '1d');
        const haEffetto = Object.keys(mod).length || campi.condizione || campi.nota.trim();
        const def = {
          nome: n, bersagli: soloSe ? 'se' : 'tutti', max: () => 12, testo: 'Effetto personalizzato',
          effetto: haEffetto ? () => ({ mod, nota: campi.nota.trim(), condizione: campi.condizione || null, usi: mod.provaDado && !mod.attaccoDado && !mod.tsDado ? 'prova' : null }) : null,
          cura: campi.cura.trim() ? () => campi.cura.trim() : null,
          pfTemp: !campi.cura.trim() && campi.pfTemp.trim() ? () => campi.pfTemp.trim() : null,
        };
        if (!def.effetto && !def.cura && !def.pfTemp) return avviso('Compila almeno un campo', 'errore');
        chiudi();
        await lanciaSu(def, 1, { nome: n, conc: conc.checked, durata: durata.value.trim() });
      } }, 'Avanti: scegli su chi'));
  }, { pieno: true });
}

// ───────────────────────── Interfaccia ─────────────────────────

// Scheda Eroe: concentrazione in corso ed effetti attivi su di me
export function renderEffetti(c) {
  const p = stato.pg;
  const eff = p.effetti || []; const conc = p.concentrazione;
  if (!eff.length && !conc) return;
  c.append(h('section.card.effetti',
    h('h3.card-titolo', 'Effetti attivi'),
    conc ? h('div.concentrazione',
      h('div.conc-info', h('strong', `◎ Concentrazione: ${conc.nome}`), h('small', `su ${conc.bersagli.map((b) => b.nome).join(', ')}${conc.durata ? ' · ' + conc.durata : ''}`)),
      h('button.btn.piccolo', { onclick: () => finisciConcentrazione({ chiedi: true }) }, 'Interrompi')) : null,
    eff.map((e) => h('div.effetto',
      h('div.eff-info',
        h('strong', e.nome),
        h('small', [e.da?.id === p.id ? 'da te' : `da ${e.da?.nome || '?'}`, e.durata, e.conc ? 'concentrazione' : null].filter(Boolean).join(' · ')),
        sommario(e) ? h('span.eff-mod', sommario(e)) : null,
        e.nota ? h('small.eff-nota', e.nota) : null),
      h('div.eff-azioni',
        e.dadoLibero ? h('button.btn.piccolo.primario', { onclick: () => usaDadoLibero(e) }, `🎲 ${e.dadoLibero}`) : null,
        h('button.btn.piccolo', { onclick: () => terminaEffetto(e) }, 'Termina'))))));
}

function usaDadoLibero(e) {
  tira(e.dadoLibero, e.nome);
  modifica((x) => togliEffetto(x, e.id));
}

async function terminaEffetto(e) {
  if (!(await conferma(`Terminare ${e.nome}?`, { si: 'Termina' }))) return;
  modifica((x) => togliEffetto(x, e.id));
  avvisaFineAlLanciatore(e);
}

// Scheda Combatti: privilegi e incantesimi da usare su di sé o sul gruppo
export function renderAiutiGruppo() {
  const p = stato.pg;
  const priv = privilegiDisponibili(p);
  const noti = (p.incantesimi || []).filter((s) => trovaIncantesimo(s));
  return h('section.card.aiuti-gruppo',
    h('h3.card-titolo', 'Su di te o sul gruppo'),
    h('p.nota', 'Incantesimi e privilegi che puoi usare su di te o su un compagno del tavolo: l\'effetto arriva sulla sua scheda (CA, TS, PF…) e finisce da solo.'),
    priv.map((pr) => h('div.privilegio',
      h('div.priv-info', h('strong', pr.nome), h('small', pr.testo + (pr.risorsa ? ` · ${pr.risorsa.max - (pr.risorsa.usati || 0)}/${pr.risorsa.max}` : ''))),
      h('button.btn.piccolo.primario', { onclick: () => usaPrivilegio(pr) }, 'Usa'))),
    noti.length ? h('p.nota', `Dai tuoi incantesimi: ${noti.map((s) => s.nome).join(', ')} (lanciali dalla scheda Magie).`) : null,
    h('button.btn.aggiungi', { onclick: () => effettoPersonalizzato() }, '✦ Effetto personalizzato'));
}
