// Regole di D&D (SRD 5.1 e, dove cambiano, regole 2024 / SRD 5.2) usate dalla scheda: tabelle, abilità, classi, calcoli.
import { ARMI, COLPO_SENZ_ARMI, SPECIE, COMPETENZE_CLASSE, EFFETTI_CONDIZIONI, maestrieClasse, attacchiPerAzione, risorseClasse, TALENTI_ORIGINE } from './dati2024.js';

export const CARATTERISTICHE = [
  { id: 'FOR', nome: 'Forza' },
  { id: 'DES', nome: 'Destrezza' },
  { id: 'COS', nome: 'Costituzione' },
  { id: 'INT', nome: 'Intelligenza' },
  { id: 'SAG', nome: 'Saggezza' },
  { id: 'CAR', nome: 'Carisma' },
];

export const ABILITA = [
  { id: 'acrobazia', nome: 'Acrobazia', car: 'DES' },
  { id: 'addestrare', nome: 'Addestrare Animali', car: 'SAG' },
  { id: 'arcano', nome: 'Arcano', car: 'INT' },
  { id: 'atletica', nome: 'Atletica', car: 'FOR' },
  { id: 'furtivita', nome: 'Furtività', car: 'DES' },
  { id: 'indagare', nome: 'Indagare', car: 'INT' },
  { id: 'inganno', nome: 'Inganno', car: 'CAR' },
  { id: 'intimidire', nome: 'Intimidire', car: 'CAR' },
  { id: 'intrattenere', nome: 'Intrattenere', car: 'CAR' },
  { id: 'intuizione', nome: 'Intuizione', car: 'SAG' },
  { id: 'medicina', nome: 'Medicina', car: 'SAG' },
  { id: 'natura', nome: 'Natura', car: 'INT' },
  { id: 'percezione', nome: 'Percezione', car: 'SAG' },
  { id: 'persuasione', nome: 'Persuasione', car: 'CAR' },
  { id: 'rapidita', nome: 'Rapidità di Mano', car: 'DES' },
  { id: 'religione', nome: 'Religione', car: 'INT' },
  { id: 'sopravvivenza', nome: 'Sopravvivenza', car: 'SAG' },
  { id: 'storia', nome: 'Storia', car: 'INT' },
];

// tipoMagia: piena | mezza | patto | nessuna
export const CLASSI = {
  'Barbaro':  { dv: 12, ts: ['FOR', 'COS'], magia: 'nessuna', carMagia: null, nAbilita: 2, abilita: ['addestrare', 'atletica', 'intimidire', 'natura', 'percezione', 'sopravvivenza'] },
  'Bardo':    { dv: 8, ts: ['DES', 'CAR'], magia: 'piena', carMagia: 'CAR', nAbilita: 3, abilita: 'tutte' },
  'Chierico': { dv: 8, ts: ['SAG', 'CAR'], magia: 'piena', carMagia: 'SAG', nAbilita: 2, abilita: ['intuizione', 'medicina', 'persuasione', 'religione', 'storia'] },
  'Druido':   { dv: 8, ts: ['INT', 'SAG'], magia: 'piena', carMagia: 'SAG', nAbilita: 2, abilita: ['addestrare', 'arcano', 'intuizione', 'medicina', 'natura', 'percezione', 'religione', 'sopravvivenza'] },
  'Guerriero':{ dv: 10, ts: ['FOR', 'COS'], magia: 'nessuna', carMagia: null, nAbilita: 2, abilita: ['acrobazia', 'addestrare', 'atletica', 'intimidire', 'intuizione', 'percezione', 'persuasione', 'sopravvivenza', 'storia'] },
  'Ladro':    { dv: 8, ts: ['DES', 'INT'], magia: 'nessuna', carMagia: null, nAbilita: 4, abilita: ['acrobazia', 'atletica', 'furtivita', 'indagare', 'inganno', 'intimidire', 'intuizione', 'percezione', 'persuasione', 'rapidita'] },
  'Mago':     { dv: 6, ts: ['INT', 'SAG'], magia: 'piena', carMagia: 'INT', nAbilita: 2, abilita: ['arcano', 'indagare', 'intuizione', 'medicina', 'natura', 'religione', 'storia'] },
  'Monaco':   { dv: 8, ts: ['FOR', 'DES'], magia: 'nessuna', carMagia: null, nAbilita: 2, abilita: ['acrobazia', 'atletica', 'furtivita', 'intuizione', 'religione', 'storia'] },
  'Paladino': { dv: 10, ts: ['SAG', 'CAR'], magia: 'mezza', carMagia: 'CAR', nAbilita: 2, abilita: ['atletica', 'intimidire', 'intuizione', 'medicina', 'persuasione', 'religione'] },
  'Ranger':   { dv: 10, ts: ['FOR', 'DES'], magia: 'mezza', carMagia: 'SAG', nAbilita: 3, abilita: ['addestrare', 'atletica', 'furtivita', 'indagare', 'intuizione', 'natura', 'percezione', 'sopravvivenza'] },
  'Stregone': { dv: 6, ts: ['COS', 'CAR'], magia: 'piena', carMagia: 'CAR', nAbilita: 2, abilita: ['arcano', 'inganno', 'intimidire', 'intuizione', 'persuasione', 'religione'] },
  'Warlock':  { dv: 8, ts: ['SAG', 'CAR'], magia: 'patto', carMagia: 'CAR', nAbilita: 2, abilita: ['arcano', 'indagare', 'inganno', 'intimidire', 'natura', 'religione', 'storia'] },
};

// Specie delle regole 2024 (i vecchi nomi come Mezzelfo restano scrivibili a mano)
export const RAZZE = Object.fromEntries(Object.entries(SPECIE).map(([nome, s]) => [nome, { vel: s.vel }]));

export const ALLINEAMENTI = ['Legale Buono', 'Neutrale Buono', 'Caotico Buono', 'Legale Neutrale', 'Neutrale Puro', 'Caotico Neutrale', 'Legale Malvagio', 'Neutrale Malvagio', 'Caotico Malvagio'];

export const SOGLIE_PE = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];

// Condizioni secondo le regole 2024 (descrizioni riassunte)
export const CONDIZIONI = [
  { id: 'accecato', nome: 'Accecato', desc: 'Non vedi e fallisci le prove che richiedono la vista. Gli attacchi contro di te hanno vantaggio, i tuoi svantaggio.' },
  { id: 'affascinato', nome: 'Affascinato', desc: 'Non puoi attaccare chi ti ha affascinato né colpirlo con effetti dannosi; lui ha vantaggio nelle prove per interagire socialmente con te.' },
  { id: 'afferrato', nome: 'Afferrato', desc: 'Velocità 0. Svantaggio ai tiri per colpire contro chiunque non sia chi ti afferra. Chi ti afferra può trascinarti con sé.' },
  { id: 'assordato', nome: 'Assordato', desc: 'Non senti e fallisci le prove che richiedono l\'udito.' },
  { id: 'avvelenato', nome: 'Avvelenato', desc: 'Svantaggio ai tiri per colpire e alle prove di caratteristica.' },
  { id: 'incapacitato', nome: 'Incapacitato', desc: 'Niente azioni, azioni bonus né reazioni. Perdi la concentrazione e non puoi parlare. Svantaggio all\'iniziativa.' },
  { id: 'intralciato', nome: 'Intralciato', desc: 'Velocità 0. Gli attacchi contro di te hanno vantaggio, i tuoi svantaggio. Svantaggio ai tiri salvezza su Destrezza.' },
  { id: 'invisibile', nome: 'Invisibile', desc: 'Vantaggio all\'iniziativa. Chi non ti vede ha svantaggio ad attaccarti e tu hai vantaggio ad attaccare lui.' },
  { id: 'paralizzato', nome: 'Paralizzato', desc: 'Incapacitato e velocità 0. Fallisci i tiri salvezza su Forza e Destrezza. Attacchi contro di te con vantaggio; i colpi entro 1,5 m sono critici.' },
  { id: 'pietrificato', nome: 'Pietrificato', desc: 'Trasformato in pietra: incapacitato, velocità 0, fallisci i TS su Forza e Destrezza, attacchi contro di te con vantaggio. Resistenza a tutti i danni, immune al veleno.' },
  { id: 'privo', nome: 'Privo di sensi', desc: 'Incapacitato, Prono, lasci cadere ciò che tieni, velocità 0. Fallisci i TS su Forza e Destrezza; attacchi contro di te con vantaggio e critici entro 1,5 m.' },
  { id: 'prono', nome: 'Prono', desc: 'Puoi solo strisciare o spendere metà del movimento per rialzarti. Svantaggio ai tuoi attacchi; contro di te vantaggio entro 1,5 m, svantaggio più lontano.' },
  { id: 'spaventato', nome: 'Spaventato', desc: 'Svantaggio a prove e tiri per colpire finché vedi la fonte della paura; non puoi avvicinarti a essa volontariamente.' },
  { id: 'stordito', nome: 'Stordito', desc: 'Incapacitato. Fallisci i tiri salvezza su Forza e Destrezza; gli attacchi contro di te hanno vantaggio.' },
];

// Sfinimento (regole 2024): livelli 1-6, −2 ai tiri d20 e −1,5 m di velocità per livello, al 6° si muore
export const SFINIMENTO = ['Nessuno', '−2 ai tiri d20, −1,5 m', '−4 ai tiri d20, −3 m', '−6 ai tiri d20, −4,5 m', '−8 ai tiri d20, −6 m', '−10 ai tiri d20, −7,5 m', 'Morte'];
export const malusSfinimento = (pg) => -2 * Math.min(6, Number(pg.sfinimento) || 0);

export const SCUOLE = ['Abiurazione', 'Ammaliamento', 'Divinazione', 'Evocazione', 'Illusione', 'Invocazione', 'Necromanzia', 'Trasmutazione'];

export const MONETE = [
  { id: 'mr', nome: 'Rame', sigla: 'mr' }, { id: 'ma', nome: 'Argento', sigla: 'ma' }, { id: 'me', nome: 'Electrum', sigla: 'me' },
  { id: 'mo', nome: 'Oro', sigla: 'mo' }, { id: 'mp', nome: 'Platino', sigla: 'mp' },
];

// Slot equipaggiamento visibili sul modello 3D
export const SLOT = [
  { id: 'testa', nome: 'Testa', icona: '⛑' },
  { id: 'collo', nome: 'Collo', icona: '📿' },
  { id: 'schiena', nome: 'Schiena', icona: '🎒' },
  { id: 'manoDx', nome: 'Mano destra', icona: '🗡' },
  { id: 'manoSx', nome: 'Mano sinistra', icona: '🛡' },
  { id: 'cintura', nome: 'Cintura', icona: '👝' },
];
// Slot "logici" senza osso: l'armatura cambia il modello intero
export const SLOT_OGGETTO = [{ id: '', nome: 'Nessuno (solo zaino)' }, ...SLOT, { id: 'armatura', nome: 'Armatura (corpo)' }];

export const TIPI_ARMATURA = [
  { id: 'leggera', nome: 'Leggera (+DES)' }, { id: 'media', nome: 'Media (+DES max 2)' }, { id: 'pesante', nome: 'Pesante (niente DES)' },
];

// Tabella slot incantatore completo, livelli 1..20 → slot per livello incantesimo 1..9
const SLOT_PIENI = [
  [2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2],
  [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1],
  [4, 3, 3, 3, 2, 1, 1, 1, 1], [4, 3, 3, 3, 3, 1, 1, 1, 1], [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1],
];

export const mod = (v) => Math.floor(((Number(v) || 0) - 10) / 2);
export const segno = (n) => (n >= 0 ? '+' : '−') + Math.abs(n);
export const competenza = (liv) => 2 + Math.floor((Math.max(1, liv) - 1) / 4);

export function livelloDaPE(pe) {
  let l = 1; for (let i = 0; i < SOGLIE_PE.length; i++) if (pe >= SOGLIE_PE[i]) l = i + 1; return l;
}

// ───── Multiclasse ─────
// pg.livello è il livello TOTALE del personaggio (decide competenza e PE).
// pg.multiclasse = [{ id, classe, sottoclasse, livello, dvRimasti }] sono le classi aggiunte dopo la prima;
// il livello della classe iniziale (pg.classe) è il totale meno quelli delle altre classi.
export const livelliMulticlasse = (pg) => (pg.multiclasse || []).reduce((s, c) => s + (Number(c.livello) || 0), 0);
export const livelloClasseIniziale = (pg) => Math.max(1, (pg.livello || 1) - livelliMulticlasse(pg));

// Tutte le classi del personaggio: la prima è quella iniziale (i = null), poi le altre (i = indice in multiclasse)
export function elencoClassi(pg) {
  return [
    { i: null, classe: pg.classe, sottoclasse: pg.sottoclasse, livello: livelloClasseIniziale(pg), dv: pg.dadiVita.tipo, rimasti: pg.dadiVita.rimasti, magia: pg.magia?.tipo || 'nessuna' },
    ...(pg.multiclasse || []).map((c, i) => ({ i, classe: c.classe, sottoclasse: c.sottoclasse, livello: Number(c.livello) || 1,
      dv: CLASSI[c.classe]?.dv || 8, rimasti: c.dvRimasti ?? c.livello, magia: CLASSI[c.classe]?.magia || 'nessuna' })),
  ];
}
// "Ladro 5 (Assassino) / Guerriero 2" — con una sola classe resta "Paladino (Oathbreaker)"
export function testoClassi(pg, { sottoclassi = true } = {}) {
  const cl = elencoClassi(pg); const multi = cl.length > 1;
  return cl.map((c) => `${c.classe}${multi ? ' ' + c.livello : ''}${sottoclassi && c.sottoclasse ? ' (' + c.sottoclasse + ')' : ''}`).join(' / ');
}
// Dadi vita di tutte le classi: { rimasti, max, testo: "d8 5/5 · d10 2/2" }
export function dadiVitaTotali(pg) {
  const cl = elencoClassi(pg);
  return { rimasti: cl.reduce((s, c) => s + c.rimasti, 0), max: cl.reduce((s, c) => s + c.livello, 0),
    testo: cl.map((c) => `d${c.dv} ${c.rimasti}/${c.livello}`).join(' · ') };
}


// Restituisce array di 9 elementi con il numero massimo di slot per livello incantesimo
export function slotMassimi(pg) {
  const m = pg.magia || {};
  if (Array.isArray(m.slotManuali)) return m.slotManuali.map((n) => Number(n) || 0);
  const base = new Array(9).fill(0);
  const incantatori = elencoClassi(pg).filter((c) => c.magia === 'piena' || c.magia === 'mezza');
  let riga = null;
  if (incantatori.length === 1) {
    const { magia, livello: liv } = incantatori[0];
    if (magia === 'piena') riga = SLOT_PIENI[liv - 1];
    else riga = SLOT_PIENI[Math.ceil(liv / 2) - 1]; // regole 2024: Paladino e Ranger hanno slot già dal 1° livello
  } else if (incantatori.length > 1) {
    // Multiclasse (regole 2024): livelli pieni + metà dei livelli da Paladino/Ranger arrotondata per eccesso
    const pieni = incantatori.filter((c) => c.magia === 'piena').reduce((s, c) => s + c.livello, 0);
    const mezzi = incantatori.filter((c) => c.magia === 'mezza').reduce((s, c) => s + c.livello, 0);
    const liv = Math.min(20, pieni + Math.ceil(mezzi / 2));
    if (liv > 0) riga = SLOT_PIENI[liv - 1];
  }
  if (riga) riga.forEach((n, i) => (base[i] = n));
  return base;
}

// Magia del patto (Warlock): numero slot e livello (conta solo i livelli da Warlock)
export function slotPatto(pg) {
  const w = elencoClassi(pg).find((c) => c.magia === 'patto');
  if (!w) return null;
  const l = w.livello;
  const n = l >= 17 ? 4 : l >= 11 ? 3 : l >= 2 ? 2 : 1;
  const liv = Math.min(5, Math.ceil(l / 2));
  return { n, liv };
}

// ───── Effetti attivi (incantesimi e privilegi ricevuti, vedi effetti.js) ─────
// pg.effetti = [{ id, nome, da, conc, durata, mod: { ca, caMin, armaturaMagica, ts, tsDado, attacco, attaccoDado,
//   danni, danniDado, provaDado, pfMax, velocita, velocitaX, abilita: { id: n } }, nota, condizione, usi, dadoLibero }]
// Due effetti con lo stesso nome non si sommano (regola degli effetti dello stesso incantesimo): conta il più forte.
export function effettiAttivi(pg) {
  const perNome = new Map();
  for (const e of pg.effetti || []) {
    const k = String(e.nome || '').toLowerCase();
    const prima = perNome.get(k);
    const forza = (x) => Object.values(x?.mod || {}).reduce((s, v) => s + (typeof v === 'number' ? v : 1), 0);
    if (!prima || forza(e) > forza(prima)) perNome.set(k, e);
  }
  return [...perNome.values()];
}
export const sommaEffetti = (pg, k) => effettiAttivi(pg).reduce((s, e) => s + (Number(e.mod?.[k]) || 0), 0);
const CHIAVI_DADI = { attacco: 'attaccoDado', ts: 'tsDado', prova: 'provaDado', danni: 'danniDado' };
export const effettiConDadi = (pg, ambito) => effettiAttivi(pg).filter((e) => e.mod?.[CHIAVI_DADI[ambito]]);
// Dadi da aggiungere ai tiri: es. Benedizione → "+1d4" su attacchi e TS
export const dadiEffetti = (pg, ambito) => effettiConDadi(pg, ambito).map((e) => '+' + e.mod[CHIAVI_DADI[ambito]]).join('');

// Tutti i tiri d20 (prove, TS, attacchi, iniziativa) includono il malus dello Sfinimento
export function bonusAbilita(pg, ab, { passiva = false } = {}) {
  const liv = pg.abilita?.[ab.id] || 0;
  const daEffetti = effettiAttivi(pg).reduce((s, e) => s + (Number(e.mod?.abilita?.[ab.id]) || 0), 0);
  return mod(pg.car[ab.car]) + liv * competenza(pg.livello) + (pg.bonusAbilita?.[ab.id] || 0) + daEffetti + (passiva ? 0 : malusSfinimento(pg));
}
export const bonusProva = (pg, car) => mod(pg.car[car]) + malusSfinimento(pg);
export function bonusTS(pg, car) {
  // bonusTiriSalvezza: bonus a tutti i TS sempre attivo; gli effetti (es. Aura di protezione ricevuta) si aggiungono
  return mod(pg.car[car]) + (pg.tsComp?.includes(car) ? competenza(pg.livello) : 0) + (Number(pg.bonusTiriSalvezza) || 0) + sommaEffetti(pg, 'ts') + malusSfinimento(pg);
}
export function percezionePassiva(pg) {
  return 10 + bonusAbilita(pg, ABILITA.find((a) => a.id === 'percezione'), { passiva: true });
}
// Talento Allerta (2024): + bonus di competenza all'iniziativa
export function iniziativa(pg) {
  return mod(pg.car.DES) + (Number(pg.iniziativaBonus) || 0) + (haTalento(pg, 'allerta') ? competenza(pg.livello) : 0) + malusSfinimento(pg);
}

export function cdIncantesimi(pg) {
  const c = pg.magia?.car; if (!c) return null;
  return 8 + competenza(pg.livello) + mod(pg.car[c]);
}
export function attaccoIncantesimi(pg) {
  const c = pg.magia?.car; if (!c) return null;
  return competenza(pg.livello) + mod(pg.car[c]) + malusSfinimento(pg);
}

// ───── Armature ─────
export const armaturaIndossata = (pg) => (pg.inventario || []).find((o) => o.equip && o.slot === 'armatura' && o.armatura);
export const scudoImbracciato = (pg) => (pg.inventario || []).find((o) => o.equip && (o.tipo === 'scudo' || o.armatura?.tipo === 'scudo'));

// Effetti sulla CA: bonus (Scudo della fede +2) e minimi (Pelle coriacea: non meno di 17)
function caConEffetti(pg, v) {
  v += sommaEffetti(pg, 'ca');
  const minimo = Math.max(0, ...effettiAttivi(pg).map((e) => Number(e.mod?.caMin) || 0));
  return Math.max(v, minimo);
}

export function classeArmatura(pg) {
  const ca = pg.ca || {};
  if (ca.modo === 'manuale') return caConEffetti(pg, Number(ca.manuale) || 10);
  const des = mod(pg.car.DES);
  const eq = (pg.inventario || []).filter((o) => o.equip);
  const arm = armaturaIndossata(pg);
  let val;
  if (arm) {
    const b = Number(arm.armatura.base) || 10;
    val = arm.armatura.tipo === 'pesante' ? b : arm.armatura.tipo === 'media' ? b + Math.min(2, des) : b + des;
  } else {
    // Difesa senza armatura (il Monaco la perde se imbraccia uno scudo)
    const classi = elencoClassi(pg).map((c) => c.classe);
    const candidati = [10 + des];
    if (classi.includes('Barbaro')) candidati.push(10 + des + mod(pg.car.COS));
    if (classi.includes('Monaco') && !scudoImbracciato(pg)) candidati.push(10 + des + mod(pg.car.SAG));
    if (effettiAttivi(pg).some((e) => e.mod?.armaturaMagica)) candidati.push(13 + des);   // Armatura magica
    val = Math.max(...candidati);
  }
  eq.forEach((o) => (val += Number(o.bonusCA) || 0));
  return caConEffetti(pg, val + (Number(ca.bonus) || 0));
}

// Competenze in armi e armature: classe iniziale + ciò che danno le classi prese in multiclasse (regole 2024)
export function competenzeEquip(pg) {
  const armature = new Set(); let armi = 'semplice'; const extra = new Set();
  elencoClassi(pg).forEach((c) => {
    const d = COMPETENZE_CLASSE[c.classe]; if (!d) return;
    const x = c.i == null ? d : d.multi;
    (x.armature || []).forEach((a) => armature.add(a));
    if (x.armi === 'guerra') armi = 'guerra';
    else if (x.armi === 'ladro' || x.armi === 'monaco') extra.add(x.armi);
  });
  return { armature, armi, extra };
}
export function competenteArma(pg, arma) {
  if (!arma || arma.cat === 'semplice' || arma.cat === 'senzarmi') return true;
  const { armi, extra } = competenzeEquip(pg);
  if (armi === 'guerra') return true;
  if (extra.has('ladro') && (arma.prop.includes('accurata') || arma.prop.includes('leggera'))) return true;
  if (extra.has('monaco') && arma.prop.includes('leggera')) return true;
  return false;
}
// Avvisi sull'armatura indossata: Forza minima, Furtività, competenza
export function avvisiArmatura(pg, { furtivita = true } = {}) {
  const out = []; const arm = armaturaIndossata(pg); const sc = scudoImbracciato(pg);
  const { armature } = competenzeEquip(pg);
  if (arm) {
    const a = arm.armatura;
    if (a.forza && (Number(pg.car.FOR) || 0) < a.forza) out.push(`${arm.nome}: serve Forza ${a.forza}, la tua velocità cala di 3 m.`);
    if (furtivita && a.furtivita) out.push(`${arm.nome}: svantaggio alle prove di Furtività.`);
    if (a.tipo && !armature.has(a.tipo)) out.push(`Non sei addestrato alle armature di tipo ${a.tipo}: svantaggio a prove, TS e tiri per colpire con Forza o Destrezza, e non puoi lanciare incantesimi.`);
  }
  if (sc && !armature.has('scudo')) out.push('Non sei addestrato agli scudi: per le regole non ottieni il bonus alla CA dello scudo.');
  return out;
}
export const svantaggioFurtivita = (pg) => !!armaturaIndossata(pg)?.armatura?.furtivita;

// ───── Velocità effettiva: sfinimento, condizioni, armatura troppo pesante ─────
export function velocitaEffettiva(pg) {
  let v = Number(pg.velocita) || 0; const note = [];
  const arm = armaturaIndossata(pg);
  if (arm?.armatura?.forza && (Number(pg.car.FOR) || 0) < arm.armatura.forza) { v -= 3; note.push('armatura −3 m'); }
  if (pg.sfinimento > 0) { v -= 1.5 * pg.sfinimento; note.push(`sfinimento −${String(1.5 * pg.sfinimento).replace('.', ',')} m`); }
  for (const e of effettiAttivi(pg)) {
    if (Number(e.mod?.velocita)) { v += Number(e.mod.velocita); note.push(`${e.nome} +${String(e.mod.velocita).replace('.', ',')} m`); }
  }
  const molt = Math.max(1, ...effettiAttivi(pg).map((e) => Number(e.mod?.velocitaX) || 1));
  if (molt > 1) { v *= molt; note.push(`×${molt} (${effettiAttivi(pg).find((e) => Number(e.mod?.velocitaX) === molt)?.nome})`); }
  const zero = (pg.condizioni || []).find((c) => EFFETTI_CONDIZIONI[c]?.velocitaZero);
  if (zero) { v = 0; note.push(CONDIZIONI.find((c) => c.id === zero)?.nome.toLowerCase()); }
  return { valore: Math.max(0, v), note };
}
// Promemoria in combattimento dovuti alle condizioni
export function avvisiCondizioni(pg) {
  const out = [];
  (pg.condizioni || []).forEach((id) => {
    const e = EFFETTI_CONDIZIONI[id]; const nome = CONDIZIONI.find((c) => c.id === id)?.nome; if (!e || !nome) return;
    const parti = [];
    if (e.svantaggioAttacchi) parti.push('svantaggio ai tiri per colpire');
    if (e.svantaggioProve) parti.push('svantaggio alle prove');
    if (e.falliscoFD) parti.push('fallisci i TS su Forza e Destrezza');
    if (e.incapacitato) parti.push('niente azioni né reazioni');
    if (e.nota) parti.push(e.nota.charAt(0).toLowerCase() + e.nota.slice(1).replace(/\.$/, ''));
    if (parti.length) out.push(`${nome}: ${parti.join('; ')}.`);
  });
  if (pg.sfinimento > 0) out.push(`Sfinimento ${pg.sfinimento}: ${segno(malusSfinimento(pg))} a tutti i tiri d20 (già incluso nei numeri).`);
  return out;
}

export function pesoTotale(pg) {
  let p = 0;
  (pg.inventario || []).forEach((o) => (p += (Number(o.peso) || 0) * (Number(o.qta) || 0)));
  const m = pg.monete || {};
  const nMonete = MONETE.reduce((s, c) => s + (Number(m[c.id]) || 0), 0);
  p += nMonete / 50 * 0.5;
  return Math.round(p * 100) / 100;
}
export const capacitaCarico = (pg) => (Number(pg.car.FOR) || 0) * 7.5;

// ───── Talenti con effetto automatico (pg.talenti = ['robusto', 'allerta', ...]) ─────
export const haTalento = (pg, id) => (pg.talenti || []).includes(id);
export const TALENTI_AUTOMATICI = ['robusto', 'allerta', 'fortunato'];
// PF massimi extra per livello: talento Robusto (+2) e Robustezza nanica (+1)
export const pfExtraPerLivello = (pg) => (haTalento(pg, 'robusto') ? 2 : 0) + (pg.razza === 'Nano' ? 1 : 0);

// PF medi con più classi: dado pieno al 1° livello della classe iniziale, poi la media di ogni classe
export function pfMediTotali(pg) {
  const m = mod(pg.car.COS);
  let pf = pfMediGenerati(pg.classe, livelloClasseIniziale(pg), pg.car.COS);
  (pg.multiclasse || []).forEach((c) => { const dv = CLASSI[c.classe]?.dv || 8; pf += (Number(c.livello) || 0) * Math.max(1, Math.floor(dv / 2) + 1 + m); });
  return Math.max(1, pf + pfExtraPerLivello(pg) * (pg.livello || 1));
}

export function pfMediGenerati(classe, livello, cos) {
  const dv = CLASSI[classe]?.dv || 8;
  const m = mod(cos);
  let pf = dv + m;
  for (let l = 2; l <= livello; l++) pf += Math.max(1, Math.floor(dv / 2) + 1 + m);
  return Math.max(1, pf);
}

// ───── Armi e attacchi ─────
export const armaDaId = (id) => (id === COLPO_SENZ_ARMI.id ? COLPO_SENZ_ARMI : ARMI.find((a) => a.id === id)) || null;
export const armaDi = (att) => (att?.arma ? armaDaId(att.arma) : null);
// Trova l'arma del manuale dal nome (es. "Ascia bipenne +1" → Ascia bipenne); le più lunghe per prime
export function armaDaNome(nome) {
  const n = String(nome || '').toLowerCase().trim();
  if (!n) return null;
  return [...ARMI, COLPO_SENZ_ARMI].sort((a, b) => b.nome.length - a.nome.length)
    .find((a) => n.startsWith(a.nome.toLowerCase()) || n.startsWith(a.en.toLowerCase())) || null;
}
// Caratteristica di un attacco: 'ACC' = la migliore tra Forza e Destrezza (armi accurate), 'MAG' = da incantatore
export function carAttacco(pg, att) {
  if (att.car === 'MAG') return pg.magia?.car || null;
  if (att.car === 'ACC') return mod(pg.car.DES) > mod(pg.car.FOR) ? 'DES' : 'FOR';
  return att.car;
}
export function attaccoBonus(pg, att) {
  const c = carAttacco(pg, att);
  let b = c ? mod(pg.car[c]) : 0;
  if (att.comp) b += competenza(pg.livello);
  return b + (Number(att.bonus) || 0) + sommaEffetti(pg, 'attacco') + malusSfinimento(pg);
}
// Danni già sommati: "1d12" + FOR 5 + magico 2 → "1d12+7" (se i dadi sono solo un numero, es. colpo senz'armi "1", fa la somma)
export function attaccoDanni(pg, att, { dadi } = {}) {
  const c = carAttacco(pg, att);
  const fisso = (att.modDanni && c ? mod(pg.car[c]) : 0) + (Number(att.bonusDanni) || 0) + sommaEffetti(pg, 'danni');
  const s = String(dadi || att.danni || '').trim() || '1';
  if (/^\d+$/.test(s)) return String(Math.max(1, Number(s) + fisso));
  return fisso ? s + (fisso > 0 ? '+' : '') + fisso : s;
}
// Quante maestrie può usare il personaggio (la classe che ne dà di più)
export const maestrieMax = (pg) => Math.max(0, ...elencoClassi(pg).map((c) => maestrieClasse(c.classe, c.livello)));
export const attacchiAzione = (pg) => Math.max(1, ...elencoClassi(pg).map((c) => attacchiPerAzione(c.classe, c.livello)));
export const haMaestria = (pg, armaId) => maestrieMax(pg) > 0 && (pg.maestrie || []).includes(armaId);
// CD della maestria Rovesciare: 8 + modificatore usato + competenza
export const cdMaestria = (pg, att) => 8 + mod(pg.car[carAttacco(pg, att)] ?? 10) + competenza(pg.livello);
// Svantaggio per armi Pesanti con Forza (mischia) o Destrezza (distanza) sotto 13
export function avvisoArmaPesante(pg, arma) {
  if (!arma?.prop?.includes('pesante')) return null;
  const c = arma.tipo === 'distanza' ? 'DES' : 'FOR';
  return (Number(pg.car[c]) || 0) < 13 ? `svantaggio: ${c === 'FOR' ? 'Forza' : 'Destrezza'} sotto 13` : null;
}
// Crea un attacco già compilato a partire da un'arma del manuale
export function attaccoDaArma(pg, arma, extra = {}) {
  let car = arma.prop.includes('accurata') ? 'ACC' : arma.tipo === 'distanza' ? 'DES' : 'FOR';
  // Monaco (Arti marziali): colpi senz'armi e armi da monaco possono usare la Destrezza; senz'armi usa il dado di Arti marziali
  const monaco = elencoClassi(pg).find((c) => c.classe === 'Monaco');
  let danni = arma.danni;
  if (monaco && arma.tipo === 'mischia' && (arma.cat === 'senzarmi' || arma.cat === 'semplice' || (arma.cat === 'guerra' && arma.prop.includes('leggera')))) {
    car = 'ACC';
    const dado = monaco.livello >= 17 ? '1d12' : monaco.livello >= 11 ? '1d10' : monaco.livello >= 5 ? '1d8' : '1d6';
    if (arma.cat === 'senzarmi') danni = dado;
  }
  const portata = arma.prop.includes('portata') ? '3 m' : '1,5 m';
  const gittata = arma.gittata ? (arma.tipo === 'distanza' ? arma.gittata : `${portata} · lancio ${arma.gittata}`) : portata;
  return { nome: arma.nome, arma: arma.id, car, comp: competenteArma(pg, arma), bonus: 0, danni, bonusDanni: 0,
    tipo: arma.tipoDanno, modDanni: true, gittata, note: '', ...extra };
}

// ───── Risorse di classe e di specie secondo il manuale ─────
const normNome = (s) => String(s || '').toLowerCase().replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim();
export function risorseDalManuale(pg) {
  const comp = competenza(pg.livello);
  const out = [];
  elencoClassi(pg).forEach((c) => risorseClasse(c.classe, c.livello, pg).forEach((r) => {
    const gia = out.find((x) => x.id === r.id);
    if (gia) gia.max = Math.max(gia.max, r.max); else out.push({ ...r, origine: c.classe });
  }));
  (SPECIE[pg.razza]?.risorse || []).forEach((r) => {
    if ((r.daLivello || 1) > (pg.livello || 1)) return;
    out.push({ ...r, max: r.max === 'comp' ? comp : r.max, alias: r.alias || [], origine: pg.razza });
  });
  if (haTalento(pg, 'fortunato')) out.push({ id: 'fortuna', nome: 'Punti fortuna', max: comp, ricarica: 'lungo', alias: [], origine: 'Fortunato' });
  return out;
}
// Confronta le risorse della scheda con quelle del manuale: cosa aggiungere e cosa aggiornare (non cancella mai nulla)
export function confrontaRisorse(pg) {
  const aggiunte = []; const aggiornate = [];
  risorseDalManuale(pg).forEach((r) => {
    const nomi = [normNome(r.nome), ...r.alias.map(normNome)];
    const esistente = (pg.risorse || []).find((x) => x.id === r.id || r.alias.includes(x.id) || nomi.includes(normNome(x.nome)));
    if (!esistente) aggiunte.push(r);
    else if (esistente.max !== r.max || esistente.ricarica !== r.ricarica) aggiornate.push({ esistente, r });
  });
  return { aggiunte, aggiornate };
}
export function applicaRisorse(pg, { aggiunte, aggiornate }) {
  aggiornate.forEach(({ esistente, r }) => {
    const y = pg.risorse.find((x) => x.id === esistente.id && x.nome === esistente.nome);
    if (y) { y.max = r.max; y.ricarica = r.ricarica; y.usati = Math.min(y.usati, y.max); }
  });
  aggiunte.forEach((r) => pg.risorse.push({ id: r.id, nome: r.nome, max: r.max, usati: 0, ricarica: r.ricarica }));
}

export const MATRICE_STANDARD = [15, 14, 13, 12, 10, 8];
