// Inventario: oggetti, monete, peso trasportato ed equipaggiamento collegato al modello 3D.
import { h, pannello, conferma, avviso, selezione, campo, fmtKg, fmtMB, scegliFile } from './ui.js';
import { stato, modifica } from './stato.js';
import { nuovoId, db } from './db.js';
import * as R from './regole.js';
import { inputNum, inputTesto, areaTesto, card } from './scheda.js';

const pg = () => stato.pg;
const TIPI = [['oggetto', 'Oggetto'], ['arma', 'Arma'], ['armatura', 'Armatura'], ['scudo', 'Scudo'], ['consumabile', 'Consumabile'], ['tesoro', 'Tesoro']];
const nomeSlot = (id) => R.SLOT_OGGETTO.find((s) => s.id === id)?.nome || '';

let aperto = null;
export function renderZaino(c) {
  const p = pg();
  const peso = R.pesoTotale(p), cap = R.capacitaCarico(p);
  const perc = Math.min(100, (peso / cap) * 100);
  const eq = p.inventario.filter((o) => o.equip);
  c.append(
    card('Monete',
      h('div.monete', R.MONETE.map((m) => h('label.moneta.' + m.id,
        h('span.moneta-icona', m.sigla),
        inputNum(p.monete[m.id], (v) => modifica((x) => (x.monete[m.id] = Math.max(0, v)))),
        h('small', m.nome))))),
    card('Peso trasportato',
      h('div.pe-testo', h('span', fmtKg(peso)), h('span', 'capacità ' + fmtKg(cap))),
      h('div.barra', h('div.barra-riemp' + (perc > 100 * (2 / 3) ? '.rosso' : perc > 100 / 3 ? '.arancio' : '.oro'), { style: { width: perc + '%' } })),
      peso > cap ? h('p.nota.rosso', 'Stai trasportando più della tua capacità!') : null),
    card('Equipaggiato',
      h('div.slot-griglia', [...R.SLOT, { id: 'armatura', nome: 'Armatura', icona: '🛡️' }].map((s) => {
        const o = eq.find((x) => x.slot === s.id);
        return h('button.slot-box' + (o ? '.pieno' : ''), { onclick: () => o ? apriOggetto(o) : scegliPerSlot(s.id) },
          h('span.slot-icona', s.icona), h('small', s.nome), h('strong', o ? o.nome : '—'), o?.modello ? h('span.badge3d', '3D') : null);
      }))),
    h('div.card',
      h('div.riga-titolo', h('h3.card-titolo', `Zaino (${p.inventario.length})`)),
      p.inventario.length ? p.inventario.map(rigaOggetto) : h('p.vuoto', 'Lo zaino è vuoto.'),
      h('div.riga-btn',
        h('button.btn.aggiungi', { onclick: () => apriOggetto() }, '+ Nuovo oggetto'),
        h('button.btn.aggiungi', { onclick: aggiungiEsempi }, '✨ Oggetti 3D di prova'))));
}

function rigaOggetto(o) {
  const el = h('div.oggetto' + (o.equip ? '.equip' : '') + (aperto === o.id ? '.aperto' : ''),
    h('div.ogg-testa', { onclick: () => { aperto = aperto === o.id ? null : o.id; el.classList.toggle('aperto'); } },
      h('div.ogg-nome', h('strong', o.nome, o.qta > 1 ? h('span.qta', ' ×' + o.qta) : null),
        h('small', [TIPI.find((t) => t[0] === o.tipo)?.[1], o.slot ? nomeSlot(o.slot) : null, fmtKg((o.peso || 0) * (o.qta || 0))].filter(Boolean).join(' · '))),
      o.modello ? h('span.badge3d', '3D') : null,
      o.slot ? h('button.btn.piccolo' + (o.equip ? '.primario' : ''), { onclick: (e) => { e.stopPropagation(); equipaggia(o); } }, o.equip ? 'Togli' : 'Equipaggia') : null),
    h('div.ogg-dettagli',
      o.descrizione ? h('p', o.descrizione) : null,
      h('div.riga-btn.compatta',
        h('button.btn.piccolo', { onclick: () => modifica((x) => { const y = x.inventario.find((z) => z.id === o.id); y.qta = Math.max(0, y.qta - 1); }) }, '− 1'),
        h('button.btn.piccolo', { onclick: () => modifica((x) => { x.inventario.find((z) => z.id === o.id).qta++; }) }, '+ 1'),
        o.equip && o.modello && R.SLOT.some((s) => s.id === o.slot) ? h('button.btn.piccolo', { onclick: () => import('./modelli.js').then((m) => m.apriRegolazione(o.id)) }, '⚙ Regola posizione') : null,
        h('button.btn.piccolo', { onclick: () => apriOggetto(o) }, '✎ Modifica'))));
  return el;
}

export function equipaggia(o, forza) {
  if (!o.slot) return apriOggetto(o);
  const metti = forza ?? !o.equip;
  modifica((x) => {
    x.inventario.forEach((y) => {
      if (y.id === o.id) y.equip = metti;
      else if (metti && y.equip && y.slot === o.slot) y.equip = false;
    });
  }, 'equip');
  avviso(metti ? `${o.nome} equipaggiato (${nomeSlot(o.slot)})` : `${o.nome} riposto nello zaino`);
}

function scegliPerSlot(slot) {
  const p = pg();
  const adatti = p.inventario.filter((o) => o.slot === slot);
  pannello('Slot: ' + nomeSlot(slot), (c, chiudi) => {
    c.append(adatti.length ? h('div.lista-scelte', adatti.map((o) => h('button.btn.grande', { onclick: () => { equipaggia(o, true); chiudi(); } }, o.nome, o.modello ? ' (3D)' : ''))) : h('p.vuoto', 'Nessun oggetto dello zaino è assegnato a questo slot.'),
      h('button.btn.aggiungi', { onclick: () => { chiudi(); apriOggetto(null, slot); } }, '+ Nuovo oggetto per questo slot'));
  });
}

export function apriOggetto(o, slotIniziale = '') {
  const nuovo = !o;
  const ogg = o ? structuredClone(o) : { id: nuovoId(), nome: '', qta: 1, peso: 0, descrizione: '', tipo: 'oggetto', slot: slotIniziale, equip: false, modello: null, regolazioni: {}, armatura: null, bonusCA: 0, versioneModello: '' };
  pannello(nuovo ? 'Nuovo oggetto' : ogg.nome, (c, chiudi) => {
    const set = (k) => (v) => (ogg[k] = v);
    const zonaExtra = h('div');
    const zonaModello = h('div.zona-modello');
    const disegnaExtra = () => {
      const p = pg();
      zonaExtra.replaceChildren(
        ogg.slot === 'armatura' || ogg.tipo === 'armatura' ? h('div.box-armatura',
          h('div.griglia2',
            campo('CA base', inputNum(ogg.armatura?.base ?? 11, (v) => (ogg.armatura = { ...(ogg.armatura || { tipo: 'leggera' }), base: v }))),
            campo('Tipo', selezione(R.TIPI_ARMATURA, ogg.armatura?.tipo || 'leggera', (v) => (ogg.armatura = { ...(ogg.armatura || { base: 11 }), tipo: v })))),
          campo('Versione del personaggio da mostrare', selezione([['', '— Modello predefinito —'], ...p.modelli.map((m) => [m.id, m.nome])], ogg.versioneModello, set('versioneModello'))),
          h('p.nota', 'Quando equipaggi questa armatura, il visualizzatore 3D mostra la versione scelta del tuo personaggio. Le versioni si caricano nella scheda Eroe → Modelli 3D.')) : null,
        campo('Bonus alla CA (scudi, anelli…)', inputNum(ogg.bonusCA, set('bonusCA'))));
    };
    const disegnaModello = async () => {
      let info = null;
      if (ogg.modello) info = (await db.elencoFile()).find((f) => f.id === ogg.modello);
      const bone = R.SLOT.some((s) => s.id === ogg.slot);
      zonaModello.replaceChildren(
        h('span.etichetta', 'Modello 3D (.glb)'),
        ogg.modello ? h('div.file-info', h('span', '📦 ' + (info?.nome || 'modello'), info ? h('small', ' ' + fmtMB(info.dimensione)) : null),
          h('button.btn.piccolo.pericolo', { onclick: () => { ogg.modello = null; disegnaModello(); } }, 'Scollega')) : null,
        h('button.btn.piccolo', { onclick: async () => {
          const f = await scegliFile();
          if (!f) return;
          const { importaFileGLB } = await import('./modelli.js');
          const id = await importaFileGLB(f, 'oggetto');
          if (id) { ogg.modello = id; ogg.regolazioni = {}; disegnaModello(); }
        } }, ogg.modello ? 'Sostituisci file' : '📂 Collega file .glb'),
        !bone && ogg.modello ? h('p.nota', 'Scegli uno slot visibile (testa, collo, schiena, mani, cintura) per vedere l\'oggetto sul personaggio.') : null);
    };
    const slotSel = selezione(R.SLOT_OGGETTO, ogg.slot, (v) => { ogg.slot = v; if (v === 'scudo' && !ogg.bonusCA) ogg.bonusCA = 2; disegnaExtra(); disegnaModello(); });
    c.append(
      campo('Nome', inputTesto(ogg.nome, set('nome'), { placeholder: 'Es. Spada lunga' })),
      h('div.griglia3',
        campo('Quantità', inputNum(ogg.qta, set('qta'), { min: 0 })),
        campo('Peso (kg)', inputNum(ogg.peso, set('peso'), { step: 0.1, inputmode: 'decimal' })),
        campo('Tipo', selezione(TIPI, ogg.tipo, (v) => { ogg.tipo = v; if (v === 'scudo') { ogg.slot ||= 'manoSx'; ogg.bonusCA ||= 2; slotSel.value = ogg.slot; } if (v === 'armatura') { ogg.slot = 'armatura'; slotSel.value = 'armatura'; } disegnaExtra(); }))),
      campo('Si equipaggia in', slotSel),
      zonaModello, zonaExtra,
      campo('Descrizione', areaTesto(ogg.descrizione, set('descrizione'))),
      h('div.riga-btn',
        !nuovo ? h('button.btn.pericolo', { onclick: async () => {
          if (!(await conferma(`Eliminare "${ogg.nome}" dallo zaino?`, { si: 'Elimina', pericolo: true }))) return;
          modifica((x) => (x.inventario = x.inventario.filter((y) => y.id !== ogg.id)), 'equip'); chiudi();
        } }, 'Elimina') : null,
        h('button.btn.primario', { onclick: () => {
          if (!ogg.nome.trim()) return avviso('Dai un nome all\'oggetto', 'errore');
          if (!ogg.slot) ogg.equip = false;
          modifica((x) => {
            const i = x.inventario.findIndex((y) => y.id === ogg.id);
            if (ogg.equip) x.inventario.forEach((y) => { if (y.id !== ogg.id && y.equip && y.slot === ogg.slot) y.equip = false; });
            i >= 0 ? (x.inventario[i] = ogg) : x.inventario.push(ogg);
          }, 'equip');
          chiudi();
        } }, 'Salva')));
    disegnaExtra(); disegnaModello();
  }, { pieno: true });
}

// Aggiunge allo zaino gli oggetti 3D di esempio inclusi nell'app
async function aggiungiEsempi() {
  const esempi = [
    { nome: 'Spada lunga', file: 'spada.glb', slot: 'manoDx', tipo: 'arma', peso: 1.5, descrizione: 'Versatile (1d10). Danni 1d8 taglienti.' },
    { nome: 'Scudo del grifone', file: 'scudo.glb', slot: 'manoSx', tipo: 'scudo', peso: 3, bonusCA: 2, descrizione: '+2 alla CA.' },
    { nome: 'Elmo crestato', file: 'elmo.glb', slot: 'testa', tipo: 'oggetto', peso: 1.5, descrizione: 'Un elmo d\'acciaio con cresta rossa.' },
    { nome: 'Amuleto di rubino', file: 'amuleto.glb', slot: 'collo', tipo: 'tesoro', peso: 0.1, descrizione: 'Una gemma che brilla di luce propria.' },
    { nome: 'Faretra', file: 'faretra.glb', slot: 'schiena', tipo: 'oggetto', peso: 0.5, descrizione: '20 frecce.' },
    { nome: 'Borsa da cintura', file: 'borsa.glb', slot: 'cintura', tipo: 'oggetto', peso: 0.5, descrizione: 'Contiene le monete e piccoli oggetti.' },
  ];
  avviso('Carico gli oggetti di esempio…');
  try {
    const nuovi = [];
    for (const e of esempi) {
      const buf = await (await fetch('esempi/' + e.file)).arrayBuffer();
      const id = nuovoId();
      await db.scrivi('file', { id, nome: e.file, dimensione: buf.byteLength, tipo: 'oggetto', dati: buf, creato: Date.now() });
      nuovi.push({ id: nuovoId(), nome: e.nome, qta: 1, peso: e.peso, descrizione: e.descrizione, tipo: e.tipo, slot: e.slot, equip: false, modello: id, regolazioni: {}, armatura: null, bonusCA: e.bonusCA || 0, versioneModello: '' });
    }
    modifica((x) => x.inventario.push(...nuovi), 'equip');
    avviso('Aggiunti 6 oggetti 3D. Tocca "Equipaggia" per vederli sul personaggio!');
  } catch (e) { avviso('Impossibile caricare gli esempi: ' + e.message, 'errore'); }
}
