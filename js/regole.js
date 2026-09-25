// Regole di D&D 5e (SRD 5.1) usate dalla scheda: tabelle, abilità, classi, calcoli.

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
  'Guerriero':{ dv: 10, ts: ['FOR', 'COS'], magia: 'nessuna', carMagia: null, nAbilita: 2, abilita: ['acrobazia', 'addestrare', 'atletica', 'intimidire', 'intuizione', 'percezione', 'sopravvivenza', 'storia'] },
  'Ladro':    { dv: 8, ts: ['DES', 'INT'], magia: 'nessuna', carMagia: null, nAbilita: 4, abilita: ['acrobazia', 'atletica', 'furtivita', 'indagare', 'inganno', 'intimidire', 'intrattenere', 'intuizione', 'percezione', 'persuasione', 'rapidita'] },
  'Mago':     { dv: 6, ts: ['INT', 'SAG'], magia: 'piena', carMagia: 'INT', nAbilita: 2, abilita: ['arcano', 'indagare', 'intuizione', 'medicina', 'religione', 'storia'] },
  'Monaco':   { dv: 8, ts: ['FOR', 'DES'], magia: 'nessuna', carMagia: null, nAbilita: 2, abilita: ['acrobazia', 'atletica', 'furtivita', 'intuizione', 'religione', 'storia'] },
  'Paladino': { dv: 10, ts: ['SAG', 'CAR'], magia: 'mezza', carMagia: 'CAR', nAbilita: 2, abilita: ['atletica', 'intimidire', 'intuizione', 'medicina', 'persuasione', 'religione'] },
  'Ranger':   { dv: 10, ts: ['FOR', 'DES'], magia: 'mezza', carMagia: 'SAG', nAbilita: 3, abilita: ['addestrare', 'atletica', 'furtivita', 'indagare', 'intuizione', 'natura', 'percezione', 'sopravvivenza'] },
  'Stregone': { dv: 6, ts: ['COS', 'CAR'], magia: 'piena', carMagia: 'CAR', nAbilita: 2, abilita: ['arcano', 'inganno', 'intimidire', 'intuizione', 'persuasione', 'religione'] },
  'Warlock':  { dv: 8, ts: ['SAG', 'CAR'], magia: 'patto', carMagia: 'CAR', nAbilita: 2, abilita: ['arcano', 'indagare', 'inganno', 'intimidire', 'natura', 'religione', 'storia'] },
};

export const RAZZE = {
  'Umano': { vel: 9 }, 'Elfo': { vel: 9 }, 'Nano': { vel: 7.5 }, 'Halfling': { vel: 7.5 },
  'Gnomo': { vel: 7.5 }, 'Mezzelfo': { vel: 9 }, 'Mezzorco': { vel: 9 }, 'Dragonide': { vel: 9 }, 'Tiefling': { vel: 9 },
};

export const ALLINEAMENTI = ['Legale Buono', 'Neutrale Buono', 'Caotico Buono', 'Legale Neutrale', 'Neutrale Puro', 'Caotico Neutrale', 'Legale Malvagio', 'Neutrale Malvagio', 'Caotico Malvagio'];

export const SOGLIE_PE = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];

export const CONDIZIONI = [
  { id: 'accecato', nome: 'Accecato', desc: 'Fallisce le prove basate sulla vista. Attacchi contro di lui con vantaggio, i suoi con svantaggio.' },
  { id: 'affascinato', nome: 'Affascinato', desc: 'Non può attaccare chi lo ha affascinato; questi ha vantaggio nelle prove sociali contro di lui.' },
  { id: 'afferrato', nome: 'Afferrato', desc: 'Velocità 0, non beneficia di bonus alla velocità.' },
  { id: 'assordato', nome: 'Assordato', desc: 'Non sente e fallisce le prove basate sull\'udito.' },
  { id: 'avvelenato', nome: 'Avvelenato', desc: 'Svantaggio ai tiri per colpire e alle prove di caratteristica.' },
  { id: 'incapacitato', nome: 'Incapacitato', desc: 'Non può effettuare azioni né reazioni.' },
  { id: 'intralciato', nome: 'Intralciato', desc: 'Velocità 0. Attacchi contro di lui con vantaggio, i suoi con svantaggio. Svantaggio ai TS su Destrezza.' },
  { id: 'invisibile', nome: 'Invisibile', desc: 'Impossibile da vedere senza aiuti. I suoi attacchi hanno vantaggio, quelli contro di lui svantaggio.' },
  { id: 'paralizzato', nome: 'Paralizzato', desc: 'Incapacitato, non può muoversi né parlare. Fallisce TS su FOR e DES. Colpi entro 1,5 m sono critici.' },
  { id: 'pietrificato', nome: 'Pietrificato', desc: 'Trasformato in pietra, incapacitato, resistenza a tutti i danni.' },
  { id: 'privo', nome: 'Privo di sensi', desc: 'Incapacitato, lascia cadere ciò che tiene, cade prono. Colpi entro 1,5 m sono critici.' },
  { id: 'prono', nome: 'Prono', desc: 'Può solo strisciare. Svantaggio ai suoi attacchi. Attacchi in mischia contro di lui con vantaggio.' },
  { id: 'spaventato', nome: 'Spaventato', desc: 'Svantaggio a prove e attacchi finché vede la fonte della paura; non può avvicinarsi a essa.' },
  { id: 'stordito', nome: 'Stordito', desc: 'Incapacitato, non può muoversi, parla a fatica. Fallisce TS su FOR e DES.' },
];

export const SFINIMENTO = ['Nessuno', 'Svantaggio alle prove di caratteristica', 'Velocità dimezzata', 'Svantaggio a tiri per colpire e TS', 'PF massimi dimezzati', 'Velocità ridotta a 0', 'Morte'];

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

// Restituisce array di 9 elementi con il numero massimo di slot per livello incantesimo
export function slotMassimi(pg) {
  const m = pg.magia || {};
  if (Array.isArray(m.slotManuali)) return m.slotManuali.map((n) => Number(n) || 0);
  const base = new Array(9).fill(0);
  const liv = pg.livello || 1;
  let riga = null;
  if (m.tipo === 'piena') riga = SLOT_PIENI[liv - 1];
  else if (m.tipo === 'mezza' && liv >= 2) riga = SLOT_PIENI[Math.ceil(liv / 2) - 1];
  if (riga) riga.forEach((n, i) => (base[i] = n));
  return base;
}

// Magia del patto (Warlock): numero slot e livello
export function slotPatto(pg) {
  if (pg.magia?.tipo !== 'patto') return null;
  const l = pg.livello || 1;
  const n = l >= 17 ? 4 : l >= 11 ? 3 : l >= 2 ? 2 : 1;
  const liv = Math.min(5, Math.ceil(l / 2));
  return { n, liv };
}

export function bonusAbilita(pg, ab) {
  const liv = pg.abilita?.[ab.id] || 0;
  return mod(pg.car[ab.car]) + liv * competenza(pg.livello) + (pg.bonusAbilita?.[ab.id] || 0);
}
export function bonusTS(pg, car) {
  return mod(pg.car[car]) + (pg.tsComp?.includes(car) ? competenza(pg.livello) : 0);
}
export function percezionePassiva(pg) {
  return 10 + bonusAbilita(pg, ABILITA.find((a) => a.id === 'percezione'));
}
export function iniziativa(pg) { return mod(pg.car.DES) + (Number(pg.iniziativaBonus) || 0); }

export function cdIncantesimi(pg) {
  const c = pg.magia?.car; if (!c) return null;
  return 8 + competenza(pg.livello) + mod(pg.car[c]);
}
export function attaccoIncantesimi(pg) {
  const c = pg.magia?.car; if (!c) return null;
  return competenza(pg.livello) + mod(pg.car[c]);
}

export function classeArmatura(pg) {
  const ca = pg.ca || {};
  if (ca.modo === 'manuale') return Number(ca.manuale) || 10;
  const des = mod(pg.car.DES);
  const eq = (pg.inventario || []).filter((o) => o.equip);
  const arm = eq.find((o) => o.slot === 'armatura' && o.armatura);
  let val;
  if (arm) {
    const b = Number(arm.armatura.base) || 10;
    val = arm.armatura.tipo === 'pesante' ? b : arm.armatura.tipo === 'media' ? b + Math.min(2, des) : b + des;
  } else {
    // Difesa senza armatura
    if (pg.classe === 'Barbaro') val = 10 + des + mod(pg.car.COS);
    else if (pg.classe === 'Monaco') val = 10 + des + mod(pg.car.SAG);
    else val = 10 + des;
  }
  eq.forEach((o) => (val += Number(o.bonusCA) || 0));
  return val + (Number(ca.bonus) || 0);
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

export function pfMediGenerati(classe, livello, cos) {
  const dv = CLASSI[classe]?.dv || 8;
  const m = mod(cos);
  let pf = dv + m;
  for (let l = 2; l <= livello; l++) pf += Math.max(1, Math.floor(dv / 2) + 1 + m);
  return Math.max(1, pf);
}

export function attaccoBonus(pg, att) {
  const c = att.car === 'MAG' ? pg.magia?.car : att.car;
  let b = c ? mod(pg.car[c]) : 0;
  if (att.comp) b += competenza(pg.livello);
  return b + (Number(att.bonus) || 0);
}
export function attaccoDanni(pg, att) {
  const c = att.car === 'MAG' ? pg.magia?.car : att.car;
  const m = att.modDanni && c ? mod(pg.car[c]) : 0;
  let s = (att.danni || '').trim() || '1';
  if (m) s += (m > 0 ? '+' : '') + m;
  if (Number(att.bonusDanni)) s += (att.bonusDanni > 0 ? '+' : '') + Number(att.bonusDanni);
  return s;
}

export const MATRICE_STANDARD = [15, 14, 13, 12, 10, 8];
