// Modalità Master: il DM usa l'app senza personaggio.
// - Gruppo: tutti i giocatori in diretta (PF, CA, condizioni, percezione passiva) e la loro SCHEDA COMPLETA
//   (sola lettura, aggiornata a ogni modifica). Se ne selezionano uno o più e si mandano danni, cure, condizioni,
//   tiri da fare, PE, ispirazione, oggetti, monete, riposi o messaggi: i loro telefoni li ricevono subito.
// - Combatti: iniziativa chiesta ai giocatori, mostri (anche nascosti), turni; il Master decide se i giocatori
//   vedono l'ordine dei turni e lo stato di salute dei mostri.
// - Mostra: immagini (mappe, ritratti, lettere) e testi preparati dal Master; per ognuno sceglie chi lo vede
//   (nessuno, tutti o solo alcuni) e può nasconderlo di nuovo.
// - Chat: messaggi a tutti o privati, con le risposte dei giocatori.
// - Registro: tutto quello che è successo, serata per serata.
import { h, avviso, pannello, conferma, tastierino, vibra, chiediTesto, scegliFile } from './ui.js';
import { db, nuovoId } from './db.js';
import * as R from './regole.js';
import { esegui } from './dadi.js';
import { ico, sigillo } from './icone.js';
import * as T from './tavolo.js';

const M = {
  vista: 'gruppo', selezionati: new Set(), ini: null, codiceIni: null, tutte: {},
  vetrine: null, miniature: {},       // contenuti da mostrare, per tavolo (le immagini stanno a parte)
  tiri: new Map(),                    // tiri chiesti in questa sessione: id → { tiro, ids, risposte }
  chatCon: 'tutti',
};
const oraBreve = (t) => new Date(t).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
const prova = (fn, def = '–') => { try { const v = fn(); return v ?? def; } catch { return def; } };
const ferma = (fn) => (e) => { e.stopPropagation(); fn(); };

// ───────── Iniziativa (salvata su questo telefono, una per tavolo) ─────────
async function caricaIniziativa(codice) {
  M.tutte = (await db.impostazione('masterIniziativa', {})) || {};
  M.ini = M.tutte[codice] || { voci: [], round: 0, indice: -1, mostraOrdine: false, statoMostri: false };
  M.codiceIni = codice;
  T.ridisegna();
}
function salvaIniziativa() {
  if (!M.codiceIni) return;
  M.tutte[M.codiceIni] = M.ini;
  db.salvaImpostazione('masterIniziativa', structuredClone(M.tutte)).catch(console.error);
}
const ordinate = () => [...M.ini.voci].sort((a, b) => (b.init ?? -99) - (a.init ?? -99) || (b.bonus || 0) - (a.bonus || 0) || a.nome.localeCompare(b.nome));

// Come appare un mostro ai giocatori
const nomeVisibile = (v) => (v.tipo === 'mostro' && v.nascosto ? '???' : v.nome);
function statoSalute(v) {
  const p = v.pfMax ? v.pf / v.pfMax : 1;
  return p <= 0 ? 'a terra' : p >= 1 ? 'illeso' : p > 0.5 ? 'ferito' : p > 0.25 ? 'malconcio' : 'quasi morto';
}

// Le risposte dei giocatori (iniziativa e tiri richiesti) arrivano qui
T.suRisposta((r) => {
  if (r.cosa === 'iniziativa' && M.ini) {
    let v = M.ini.voci.find((x) => x.tipo === 'pg' && x.pgId === r.pgId);
    if (!v) { v = { id: nuovoId(), tipo: 'pg', pgId: r.pgId, nome: r.nome }; M.ini.voci.push(v); }
    v.init = r.valore; v.bonus = r.bonus; v.nome = r.nome;
    salvaIniziativa();
    avviso(`${r.nome}: iniziativa ${r.valore}${r.naturale === 20 ? ' (20 naturale!)' : ''}`);
  } else if (r.cosa === 'tiro') {
    const tr = M.tiri.get(r.richiesta);
    if (!tr) return;
    tr.risposte[r.pgId] = r;
    const esito = tr.tiro.cd ? (r.valore >= tr.tiro.cd ? ' ✔' : ' ✖') : '';
    avviso(`${r.nome}: ${T.descriviTiro(tr.tiro)} ${r.valore}${r.naturale === 20 ? ' (20 naturale!)' : r.naturale === 1 ? ' (1 naturale)' : ''}${esito}`);
    if (tr.tiro.pubblico) T.scriviNelRegistro(`${r.nome}: ${T.descriviTiro(tr.tiro)} → ${r.valore}${tr.tiro.cd && tr.tiro.mostraCd ? (r.valore >= tr.tiro.cd ? ' (superata)' : ' (fallita)') : ''}`, { tipo: 'iniziativa' });
  }
  T.ridisegna();
});

// Messaggi dei giocatori
T.suMessaggio((v) => {
  if (!T.sonoMaster()) return;
  avviso(`✉ ${v.daNome || 'Un giocatore'}: ${v.testo.length > 70 ? v.testo.slice(0, 70) + '…' : v.testo}`);
});

// Quando qualcuno arriva, riceve subito le cose che il Master gli sta mostrando
T.suPresenza(async (nuovi) => {
  if (!T.sonoMaster()) return;
  if (!M.vetrine) await caricaVetrine();
  sincronizzaVetrina(nuovi);
});
T.fornisciImmagini((id) => db.impostazione('masterImg-' + id));

function annunciaTurno({ registro = true } = {}) {
  const tv = T.tavoloAttivo();
  const lista = ordinate();
  const att = lista[M.ini.indice];
  if (!att || !M.ini.round) { T.inviaTurno(null); return; }
  // il prossimo "vivo" dopo l'attuale
  let prossimo = null;
  for (let k = 1; k <= lista.length; k++) {
    const v = lista[(M.ini.indice + k) % lista.length];
    if (v && v.id !== att.id && (v.tipo === 'pg' || v.pf > 0)) { prossimo = v; break; }
  }
  const ordine = M.ini.mostraOrdine
    ? lista.filter((v) => !(v.tipo === 'mostro' && v.nascosto)).map((v) => ({
      nome: v.nome, tipo: v.tipo, pgId: v.tipo === 'pg' ? v.pgId : null, attuale: v.id === att.id,
      stato: v.tipo === 'mostro' ? (M.ini.statoMostri ? statoSalute(v) : v.pf <= 0 ? 'a terra' : null) : null,
    }))
    : null;
  T.inviaTurno({ round: M.ini.round, nome: nomeVisibile(att), pgId: att.tipo === 'pg' ? att.pgId : null, prossimo: prossimo ? nomeVisibile(prossimo) : null, ordine, t: Date.now() });
  if (registro && tv) T.scriviNelRegistro(`Round ${M.ini.round} · turno di ${nomeVisibile(att)}`, { tipo: 'turno' });
}
// Dopo un cambiamento (danni ai mostri, opzioni) si aggiorna quello che vedono i giocatori
const riannuncia = () => { if (M.ini?.round) annunciaTurno({ registro: false }); };

function turnoSuccessivo() {
  const lista = ordinate();
  if (!lista.length) return avviso('Aggiungi prima i partecipanti al combattimento', 'errore');
  if (M.ini.round === 0) { M.ini.round = 1; M.ini.indice = 0; }
  else {
    let i = M.ini.indice;
    for (let k = 0; k < lista.length; k++) {
      i++;
      if (i >= lista.length) { i = 0; M.ini.round++; }
      const v = lista[i];
      if (v.tipo === 'pg' || v.pf > 0) break;   // i mostri a 0 PF si saltano
    }
    M.ini.indice = i;
  }
  salvaIniziativa(); annunciaTurno(); vibra(15); T.ridisegna();
}

async function fineCombattimento() {
  if (!(await conferma('Finire il combattimento? Si azzerano turni e iniziativa (i mostri vengono tolti).', { si: 'Fine combattimento' }))) return;
  M.ini = { ...M.ini, voci: [], round: 0, indice: -1 };
  salvaIniziativa();
  T.inviaTurno(null);
  T.scriviNelRegistro('Fine del combattimento', { tipo: 'turno' });
  T.ridisegna();
}

function aggiungiMostri() {
  pannello('Aggiungi mostri', (c, chiudi) => {
    const nome = h('input.campo', { placeholder: 'Nome, es. Goblin' });
    const quanti = h('input.campo.campo-numero', { type: 'number', inputMode: 'numeric', value: 1, min: 1, max: 20 });
    const bonus = h('input.campo.campo-numero', { type: 'number', inputMode: 'numeric', value: 0 });
    const pf = h('input.campo.campo-numero', { type: 'number', inputMode: 'numeric', placeholder: 'es. 7' });
    const ca = h('input.campo.campo-numero', { type: 'number', inputMode: 'numeric', placeholder: 'es. 15' });
    const nascosti = h('input', { type: 'checkbox' });
    const riga = (et, inp) => h('label.campo-ctr', h('span.etichetta', et), inp);
    c.append(riga('Nome', nome),
      h('div.griglia-2', riga('Quanti', quanti), riga('Bonus iniziativa', bonus), riga('Punti ferita', pf), riga('Classe armatura', ca)),
      h('label.spunta', nascosti, ' Nascosti ai giocatori (non compaiono nell\'ordine dei turni)'),
      h('p.nota', 'L\'app tira l\'iniziativa di ogni mostro (d20 + bonus). Con più mostri uguali li numera: Goblin 1, Goblin 2…'),
      h('button.btn.grande.primario', { onclick: () => {
        const n = Math.max(1, Math.min(20, Number(quanti.value) || 1));
        const base = nome.value.trim() || 'Mostro';
        const b = Number(bonus.value) || 0; const p = Math.max(1, Number(pf.value) || 1);
        for (let i = 1; i <= n; i++) {
          const r = esegui('1d20');
          M.ini.voci.push({ id: nuovoId(), tipo: 'mostro', nome: n > 1 ? `${base} ${i}` : base, init: r.totale + b, bonus: b, pf: p, pfMax: p, ca: Number(ca.value) || null, nascosto: nascosti.checked });
        }
        salvaIniziativa(); chiudi(); riannuncia(); T.ridisegna();
        avviso(`${n > 1 ? n + ' ' + base : base}: iniziativa tirata`);
      } }, 'Aggiungi al combattimento'));
    setTimeout(() => nome.focus(), 250);
  });
}

function aggiungiGiocatoriSenzaTiro() {
  const tv = T.tavoloAttivo(); if (!tv) return;
  let n = 0;
  for (const m of T.elencoCompagni(tv)) {
    if (M.ini.voci.some((v) => v.tipo === 'pg' && v.pgId === m.id)) continue;
    M.ini.voci.push({ id: nuovoId(), tipo: 'pg', pgId: m.id, nome: m.nome, init: null, bonus: m.iniziativa ?? 0 });
    n++;
  }
  salvaIniziativa(); T.ridisegna();
  if (n) avviso(`Aggiunti ${n} giocatori: tocca il numero per scrivere l'iniziativa`);
}

async function modificaVoce(v) {
  const tv = T.tavoloAttivo();
  if (v.tipo === 'mostro') {
    const r = await tastierino(`${v.nome} · PF ${v.pf}/${v.pfMax}`, [
      { id: 'danno', nome: '⚔ Danno', classe: 'pericolo' }, { id: 'cura', nome: '✚ Cura', classe: 'verde' }, { id: 'init', nome: 'Iniziativa' }]);
    if (!r) return;
    if (r.azione === 'init') v.init = r.valore;
    else {
      v.pf = Math.max(0, Math.min(v.pfMax, v.pf + (r.azione === 'danno' ? -r.valore : r.valore)));
      if (r.azione === 'danno' && v.pf === 0) { avviso(`${v.nome} è a terra!`); if (tv && !v.nascosto) T.scriviNelRegistro(`${v.nome} è sconfitto`, { tipo: 'danno' }); }
    }
  } else {
    const r = await tastierino(`Iniziativa di ${v.nome}`, [{ id: 'init', nome: 'Imposta', classe: 'primario' }]);
    if (!r) return;
    v.init = r.valore;
  }
  salvaIniziativa(); riannuncia(); T.ridisegna();
}

// ───────── Azioni sui giocatori selezionati ─────────
function bersagli() {
  const tv = T.tavoloAttivo();
  return tv ? [...M.selezionati].map((id) => tv.membri[id]).filter(Boolean) : [];
}
function nomiBersagli(b) { return b.length > 2 ? `${b.length} giocatori` : b.map((m) => m.nome).join(' e '); }
function avvisaAssenti(b) { return b.some((m) => !T.presente(m.id)) ? h('p.nota', 'Chi non è collegato lo riceverà appena torna al tavolo.') : null; }

function pannelloValore(tipo, b = bersagli()) {
  if (!b.length) return;
  const titoli = { danno: 'Danni', cura: 'Cura', pftemp: 'PF temporanei', pe: 'Punti esperienza' };
  pannello(`${titoli[tipo]} a ${nomiBersagli(b)}`, (c, chiudi) => {
    const numero = h('input.campo.campo-numero.grande', { type: 'number', inputMode: 'numeric', placeholder: tipo === 'pe' ? 'quanti PE?' : 'quanti?' });
    const motivo = h('input.campo', { placeholder: tipo === 'danno' ? 'Motivo (facoltativo), es. Palla di fuoco' : tipo === 'pe' ? 'Motivo (facoltativo), es. Il drago sconfitto' : 'Motivo (facoltativo)' });
    const manda = (modo = '') => {
      let v = Number(numero.value);
      if (!v || v < 0) return avviso('Scrivi un numero', 'errore');
      if (modo === 'meta') v = Math.floor(v / 2);
      if (modo === 'dividi') v = Math.floor(v / b.length);
      const extra = modo === 'meta' ? 'metà danni' : modo === 'dividi' ? `diviso tra ${b.length}` : '';
      const mot = [motivo.value.trim(), extra].filter(Boolean).join(', ');
      let ok = 0;
      for (const m of b) if (T.inviaAzione(m.id, { tipo, valore: v, motivo: mot })) ok++;
      if (ok) { chiudi(); vibra(20); avviso(`Inviato a ${nomiBersagli(b)}`); }
    };
    c.append(numero, motivo,
      tipo === 'danno'
        ? h('div.riga-btn', h('button.btn.grande.pericolo', { onclick: () => manda() }, '⚔ Infliggi'), h('button.btn.grande', { onclick: () => manda('meta') }, '½ Metà (TS superato)'))
        : tipo === 'pe' && b.length > 1
          ? h('div.riga-btn', h('button.btn.grande.primario', { onclick: () => manda() }, 'A ciascuno'), h('button.btn.grande', { onclick: () => manda('dividi') }, `Da dividere tra ${b.length}`))
          : h('button.btn.grande' + (tipo === 'cura' ? '.verde' : '.primario'), { onclick: () => manda() }, tipo === 'cura' ? '✚ Cura' : tipo === 'pe' ? '✦ Dai i PE' : '◈ Dai PF temporanei'),
      avvisaAssenti(b));
    setTimeout(() => numero.focus(), 250);
  }, { classe: 'stretto' });
}

function pannelloCondizioni(b = bersagli()) {
  if (!b.length) return;
  pannello(`Condizioni · ${nomiBersagli(b)}`, (c, chiudi) => {
    c.append(h('p.nota', 'Tocca una condizione per metterla a tutti i selezionati; se ce l\'hanno già tutti, la toglie.'),
      h('div.chips', R.CONDIZIONI.map((cd) => {
        const tutti = b.every((m) => m.condizioni.includes(cd.id));
        const alcuni = b.some((m) => m.condizioni.includes(cd.id));
        return h('button.chip' + (tutti ? '.attivo' : alcuni ? '.consigliato' : ''), { onclick: () => {
          for (const m of b) {
            const ha = m.condizioni.includes(cd.id);
            if (tutti ? ha : !ha) T.inviaAzione(m.id, { tipo: 'condizione', id: cd.id, attiva: !tutti });
          }
          chiudi(); avviso(`${cd.nome}: ${tutti ? 'tolta' : 'messa'} a ${nomiBersagli(b)}`);
        } }, cd.nome);
      })));
  });
}

function pannelloOggetto(b = bersagli()) {
  if (!b.length) return;
  pannello(`Dai un oggetto · ${nomiBersagli(b)}`, (c, chiudi) => {
    const nome = h('input.campo', { placeholder: 'es. Pozione di guarigione' });
    const qta = h('input.campo.campo-numero', { type: 'number', inputMode: 'numeric', value: 1, min: 1 });
    const peso = h('input.campo.campo-numero', { type: 'number', inputMode: 'decimal', value: 0, step: 0.1 });
    const descr = h('textarea.campo', { rows: 3, placeholder: 'Descrizione (facoltativa), es. Recupera 2d4+2 PF' });
    const riga = (et, inp) => h('label.campo-ctr', h('span.etichetta', et), inp);
    c.append(riga('Oggetto', nome), h('div.griglia-2', riga('Quantità', qta), riga('Peso (kg, ciascuno)', peso)), riga('Descrizione', descr),
      h('button.btn.grande.primario', { onclick: () => {
        if (!nome.value.trim()) return avviso('Scrivi il nome dell\'oggetto', 'errore');
        const oggetto = { nome: nome.value.trim(), qta: Math.max(1, Number(qta.value) || 1), peso: Math.max(0, Number(peso.value) || 0), descrizione: descr.value.trim() };
        let ok = 0;
        for (const m of b) if (T.inviaAzione(m.id, { tipo: 'oggetto', oggetto })) ok++;
        if (ok) { chiudi(); avviso(`${oggetto.nome} dato a ${nomiBersagli(b)}`); }
      } }, '⚱ Metti nello zaino'),
      avvisaAssenti(b));
    setTimeout(() => nome.focus(), 250);
  }, { classe: 'stretto' });
}

function pannelloMonete(b = bersagli()) {
  if (!b.length) return;
  pannello(`Dai monete · ${nomiBersagli(b)}`, (c, chiudi) => {
    const campi = Object.fromEntries(R.MONETE.map((m) => [m.id, h('input.campo.campo-numero', { type: 'number', inputMode: 'numeric', min: 0, placeholder: '0' })]));
    c.append(h('div.griglia-2', R.MONETE.map((m) => h('label.campo-ctr', h('span.etichetta', m.nome), campi[m.id]))),
      h('p.nota', 'Le monete si aggiungono a quelle di ciascun giocatore selezionato.'),
      h('button.btn.grande.primario', { onclick: () => {
        const monete = Object.fromEntries(R.MONETE.map((m) => [m.id, Math.max(0, Number(campi[m.id].value) || 0)]));
        if (!Object.values(monete).some(Boolean)) return avviso('Scrivi quante monete', 'errore');
        let ok = 0;
        for (const m of b) if (T.inviaAzione(m.id, { tipo: 'monete', monete })) ok++;
        if (ok) { chiudi(); avviso(`${T.testoMonete(monete)} a ${nomiBersagli(b)}`); }
      } }, '◎ Dai le monete'),
      avvisaAssenti(b));
  }, { classe: 'stretto' });
}

function pannelloAltro() {
  const b = bersagli(); if (!b.length) return;
  const ids = b.map((m) => m.id);
  pannello(`Per ${nomiBersagli(b)}`, (c, chiudi) => {
    const voce = (icona, testo, nota, fn) => h('button.voce-azione', { onclick: () => { chiudi(); fn(); } }, h('span.voce-azione-ico', icona), h('span', h('strong', testo), h('small', nota)));
    c.append(h('div.lista-azioni',
      voce('✉', 'Messaggio privato', 'Lo leggono solo loro', async () => {
        const t = await chiediTesto(`Messaggio a ${nomiBersagli(b)}`, '', { etichetta: 'Solo i giocatori selezionati lo vedranno', multiriga: true });
        if (!t?.trim()) return;
        let ok = 0; for (const id of ids) if (T.inviaMessaggio(id, t)) ok++;
        if (ok) avviso(`Messaggio inviato a ${nomiBersagli(b)}`);
      }),
      voce('✦', 'Punti esperienza', 'A ciascuno o da dividere', () => pannelloValore('pe', b)),
      voce('☆', 'Ispirazione eroica', 'Si accende sulla loro scheda', () => {
        let ok = 0; for (const id of ids) if (T.inviaAzione(id, { tipo: 'ispirazione' })) ok++;
        if (ok) avviso(`Ispirazione a ${nomiBersagli(b)}`);
      }),
      voce('⚱', 'Dai un oggetto', 'Finisce nel loro zaino', () => pannelloOggetto(b)),
      voce('◎', 'Dai monete', 'Oro, argento, rame…', () => pannelloMonete(b)),
      voce('◈', 'PF temporanei', '', () => pannelloValore('pftemp', b)),
      voce('☾', 'Concedi un riposo breve', 'Sul loro telefono si apre il riposo', () => { if (T.concediRiposo(ids, 'breve')) avviso('Riposo breve concesso'); else avviso('Serve il collegamento al tavolo', 'errore'); }),
      voce('☀', 'Concedi un riposo lungo', 'PF, slot e risorse tornano al massimo', () => { if (T.concediRiposo(ids, 'lungo')) avviso('Riposo lungo concesso'); else avviso('Serve il collegamento al tavolo', 'errore'); }),
      voce('⟳', 'Aggiorna le loro schede', 'Se una scheda sembra vecchia', () => { if (T.chiediSchede(ids)) avviso('Richiesta inviata'); else avviso('Serve il collegamento al tavolo', 'errore'); })));
  }, { classe: 'stretto' });
}

// ───────── Tiri richiesti ai giocatori ─────────
function pannelloTiro(ids, preset = {}) {
  const tv = T.tavoloAttivo(); if (!tv || !ids.length) return;
  const b = ids.map((id) => tv.membri[id]).filter(Boolean);
  const t = { tipo: 'abilita', chiave: 'percezione', espr: '1d20', cd: '', mostraCd: false, modo: 'normale', nota: '', pubblico: false, ...preset };
  pannello(`🎲 Tiro per ${nomiBersagli(b)}`, (c, chiudi) => {
    const zona = h('div.pannello-tiro');
    const chip = (attivo, testo, fn) => h('button.chip' + (attivo ? '.attivo' : ''), { onclick: fn }, testo);
    const disegna = () => {
      const cd = h('input.campo.campo-numero', { type: 'number', inputMode: 'numeric', value: t.cd, placeholder: 'nessuna', oninput: (e) => (t.cd = e.target.value) });
      const nota = h('input.campo', { value: t.nota, placeholder: 'Nota per i giocatori (facoltativa)', oninput: (e) => (t.nota = e.target.value) });
      const espr = h('input.campo', { value: t.espr, placeholder: 'es. 1d20+2, 2d6', oninput: (e) => (t.espr = e.target.value) });
      zona.replaceChildren(
        h('div.segmenti.larghi', [['abilita', 'Abilità'], ['ts', 'Salvezza'], ['caratteristica', 'Caratt.'], ['libero', 'Dadi']].map(([id, n]) =>
          h('button' + (t.tipo === id ? '.attivo' : ''), { onclick: () => { t.tipo = id; t.chiave = id === 'abilita' ? 'percezione' : 'DES'; disegna(); } }, n))),
        t.tipo === 'abilita' ? h('div.chips', R.ABILITA.map((a) => chip(t.chiave === a.id, a.nome, () => { t.chiave = a.id; disegna(); })))
          : t.tipo === 'libero' ? h('label.campo-ctr', h('span.etichetta', 'Dadi da tirare'), espr)
            : h('div.chips', R.CARATTERISTICHE.map((cr) => chip(t.chiave === cr.id, cr.nome, () => { t.chiave = cr.id; disegna(); }))),
        h('div.griglia-2',
          h('label.campo-ctr', h('span.etichetta', 'Classe Difficoltà'), cd),
          h('div.campo-ctr', h('span.etichetta', 'Con'), h('div.chips.piccoli', [['svantaggio', 'Svant.'], ['normale', 'Normale'], ['vantaggio', 'Vant.']].map(([id, n]) => chip(t.modo === id, n, () => { t.modo = id; disegna(); }))))),
        h('label.spunta', h('input', { type: 'checkbox', checked: t.mostraCd, onchange: (e) => (t.mostraCd = e.target.checked) }), ' I giocatori vedono la CD'),
        h('label.spunta', h('input', { type: 'checkbox', checked: t.pubblico, onchange: (e) => (t.pubblico = e.target.checked) }), ' Scrivi i risultati nel registro (li vedono tutti)'),
        nota,
        h('button.btn.grande.primario', { onclick: () => {
          const tiro = { tipo: t.tipo, chiave: t.chiave, espr: t.espr, cd: Number(t.cd) || null, mostraCd: t.mostraCd, modo: t.modo, nota: t.nota.trim(), pubblico: t.pubblico };
          const id = T.chiediTiro(ids, tiro);
          if (!id) return avviso('Serve il collegamento al tavolo', 'errore');
          M.tiri.set(id, { tiro, ids: [...ids], risposte: {}, t: Date.now() });
          chiudi(); vibra(15); apriRisultati(id);
        } }, `🎲 Chiedi a ${nomiBersagli(b)}`),
        avvisaAssenti(b));
    };
    disegna();
    c.append(zona);
  }, { classe: 'stretto' });
}

function apriRisultati(id) {
  const tr = M.tiri.get(id); if (!tr) return;
  pannello(T.descriviTiro(tr.tiro), (c) => c.append(T.vivo(() => contenutoRisultati(id))), { classe: 'stretto' });
}
function contenutoRisultati(id) {
  const tr = M.tiri.get(id); const tv = T.tavoloAttivo();
  if (!tr || !tv) return h('p.nota', 'Tiro non più disponibile.');
  const n = Object.keys(tr.risposte).length;
  const successi = tr.tiro.cd ? Object.values(tr.risposte).filter((r) => r.valore >= tr.tiro.cd).length : null;
  return h('div.risultati-tiro',
    h('p.nota', `${n}/${tr.ids.length} risposte${tr.tiro.cd ? ` · CD ${tr.tiro.cd}${tr.tiro.mostraCd ? '' : ' (nascosta)'} · ${successi} ${successi === 1 ? 'successo' : 'successi'}` : ''}${tr.tiro.modo !== 'normale' ? ' · con ' + tr.tiro.modo : ''}`),
    tr.ids.map((pid) => {
      const m = tv.membri[pid]; const r = tr.risposte[pid];
      const sch = T.schedaDi(pid);
      const atteso = sch ? prova(() => T.bonusTiro(sch.pg, tr.tiro), null) : null;
      const esito = r && tr.tiro.cd ? (r.valore >= tr.tiro.cd ? 'ok' : 'ko') : '';
      return h('div.risultato-riga' + (esito ? '.' + esito : '') + (r ? '' : '.attesa'),
        h('span.risultato-nome', m?.nome || '?', atteso != null && tr.tiro.tipo !== 'libero' ? h('small', ` (${R.segno(atteso)})`) : null),
        r ? h('span.risultato-val', r.valore, r.naturale === 20 ? h('small', ' 20 nat.') : r.naturale === 1 ? h('small', ' 1 nat.') : null) : h('small', T.presente(pid) ? 'sta tirando…' : 'non collegato'),
        esito ? h('span.risultato-esito', esito === 'ok' ? '✔' : '✖') : null);
    }));
}

// ───────── Scheda completa di un giocatore (sola lettura) ─────────
function apriScheda(id) {
  const tv = T.tavoloAttivo();
  pannello(`Scheda di ${tv?.membri[id]?.nome || 'un giocatore'}`, (c) => c.append(T.vivo(() => contenutoScheda(id))), { pieno: true });
}

function contenutoScheda(id) {
  const tv = T.tavoloAttivo(); const s = T.schedaDi(id); const m = tv?.membri[id];
  if (!s) {
    return h('div.sl',
      h('p', 'La scheda completa non è ancora arrivata.'),
      h('p.nota', 'Arriva da sola appena il giocatore è collegato al tavolo con la sua scheda aperta.'),
      h('button.btn', { onclick: () => { if (T.chiediSchede([id])) avviso('Richiesta inviata'); else avviso('Serve il collegamento al tavolo', 'errore'); } }, '⟳ Chiedi la scheda'));
  }
  const pg = s.pg;
  const chiedi = (tiro) => pannelloTiro([id], tiro);
  const box = (et, val, sotto) => h('div.sl-box', h('small', et), h('strong', val), sotto ? h('small', sotto) : null);
  const slotMax = prova(() => R.slotMassimi(pg), []);
  const patto = prova(() => R.slotPatto(pg), null);
  const magia = pg.magia?.tipo && pg.magia.tipo !== 'nessuna' || (pg.incantesimi || []).length;
  const livelliInc = [...new Set((pg.incantesimi || []).map((x) => x.livello))].sort((a, b) => a - b);
  const sezione = (titolo, ...contenuto) => h('section.sl-sez', h('h3.card-titolo', titolo), ...contenuto);
  return h('div.sl',
    h('div.sl-testa',
      h('div.comp-sigillo', sigillo(pg.classe)),
      h('div', h('strong.sl-nome', pg.nome),
        h('small', `${pg.razza} · ${prova(() => R.testoClassi(pg), pg.classe)} · Livello ${pg.livello}`),
        h('small', [pg.allineamento, pg.background, `${(Number(pg.pe) || 0).toLocaleString('it-IT')} PE`].filter(Boolean).join(' · ')),
        h('small.sl-agg', `${T.presente(id) ? '● collegato' : '○ non collegato'} · scheda aggiornata ${new Date(s.t).toLocaleDateString('it-IT') === new Date().toLocaleDateString('it-IT') ? 'alle ' + oraBreve(s.t) : 'il ' + new Date(s.t).toLocaleDateString('it-IT')}`))),
    h('div.sl-numeri',
      box('PF', `${pg.pf.att}/${pg.pf.max}`, pg.pf.temp ? `+${pg.pf.temp} temp.` : null),
      box('CA', prova(() => R.classeArmatura(pg))),
      box('Iniziativa', prova(() => R.segno(R.iniziativa(pg)))),
      box('Velocità', prova(() => String(R.velocitaEffettiva(pg).valore).replace('.', ',') + ' m')),
      box('Competenza', R.segno(R.competenza(pg.livello))),
      box('Perc. passiva', prova(() => R.percezionePassiva(pg))),
      box('Dadi vita', prova(() => R.dadiVitaTotali(pg).testo)),
      box('Ispirazione', pg.ispirazione ? '✦' : '–')),
    (pg.condizioni?.length || pg.sfinimento || pg.pf.att <= 0) ? h('div.sl-avvisi',
      (pg.condizioni || []).map((cd) => h('span.comp-chip', T.nomeCondizione(cd))),
      pg.sfinimento ? h('span.comp-chip', `Sfinimento ${pg.sfinimento}`) : null,
      pg.pf.att <= 0 ? h('span.comp-chip', `TS morte ✔${pg.tsMorte?.succ || 0} ✖${pg.tsMorte?.fall || 0}`) : null) : null,
    sezione('Caratteristiche', h('p.nota', 'Tocca una caratteristica, un tiro salvezza o un\'abilità per chiedere quel tiro al giocatore.'),
      h('div.sl-car', R.CARATTERISTICHE.map((cr) => h('button.sl-car-box', { onclick: () => chiedi({ tipo: 'caratteristica', chiave: cr.id }) },
        h('small', cr.id), h('strong', R.segno(R.mod(pg.car[cr.id]))), h('span', pg.car[cr.id]))))),
    sezione('Tiri salvezza', h('div.sl-lista', R.CARATTERISTICHE.map((cr) => h('button.sl-riga', { onclick: () => chiedi({ tipo: 'ts', chiave: cr.id }) },
      h('span.sl-comp', pg.tsComp?.includes(cr.id) ? '●' : '○'), h('span.sl-voce', cr.nome), h('strong', prova(() => R.segno(R.bonusTS(pg, cr.id)))))))),
    sezione('Abilità', h('div.sl-lista.due', R.ABILITA.map((ab) => h('button.sl-riga', { onclick: () => chiedi({ tipo: 'abilita', chiave: ab.id }) },
      h('span.sl-comp', ['○', '●', '◉'][pg.abilita?.[ab.id] || 0] || '○'), h('span.sl-voce', ab.nome), h('strong', prova(() => R.segno(R.bonusAbilita(pg, ab)))))))),
    (pg.attacchi || []).length ? sezione('Attacchi', h('div.sl-lista', pg.attacchi.map((a) => h('div.sl-riga',
      h('span.sl-voce', a.nome), h('small', prova(() => R.segno(R.attaccoBonus(pg, a)))), h('strong', prova(() => R.attaccoDanni(pg, a))))))) : null,
    magia ? sezione('Magia',
      h('p.sl-riassunto', `CD ${prova(() => R.cdIncantesimi(pg))} · attacco ${prova(() => R.segno(R.attaccoIncantesimi(pg)))}`),
      h('div.sl-slot', slotMax.map((n, i) => n > 0 ? h('span.sl-slot-liv', `${i + 1}°: ${Math.max(0, n - (pg.magia.slotUsati?.[i] || 0))}/${n}`) : null),
        patto ? h('span.sl-slot-liv', `Patto ${patto.liv}°: ${Math.max(0, patto.n - (pg.magia.pattoUsati || 0))}/${patto.n}`) : null),
      livelliInc.map((liv) => h('div.sl-inc-gruppo', h('h4', liv === 0 ? 'Trucchetti' : `${liv}° livello`),
        (pg.incantesimi || []).filter((x) => x.livello === liv).map((x) => h('details.sl-dettaglio',
          h('summary', x.nome, liv > 0 && (x.preparato || x.sempre) ? ' ★' : ''),
          h('p', [x.tempo, x.gittata, x.durata].filter(Boolean).join(' · ')), x.descrizione ? h('p', x.descrizione) : null))))) : null,
    (pg.risorse || []).length ? sezione('Risorse', h('div.sl-lista', pg.risorse.map((r) => h('div.sl-riga', h('span.sl-voce', r.nome), h('strong', `${Math.max(0, r.max - (r.usati || 0))}/${r.max}`))))) : null,
    sezione('Zaino',
      h('p.sl-riassunto', `${T.testoMonete(pg.monete)} · peso ${prova(() => String(R.pesoTotale(pg)).replace('.', ','))} kg su ${prova(() => String(R.capacitaCarico(pg)).replace('.', ','))} kg`),
      (pg.inventario || []).length ? h('div.sl-lista', pg.inventario.map((o) => h('details.sl-dettaglio',
        h('summary', o.nome, (o.qta || 1) > 1 ? ` ×${o.qta}` : '', o.equip ? h('span.badge.oro', 'in uso') : null),
        o.descrizione ? h('p', o.descrizione) : h('p.nota', 'Nessuna descrizione')))) : h('p.nota', 'Zaino vuoto.')),
    (pg.tratti || []).length ? sezione('Tratti e privilegi', pg.tratti.map((t) => h('details.sl-dettaglio', h('summary', t.titolo), h('p', t.testo)))) : null,
    pg.competenzeAltre ? sezione('Altre competenze e linguaggi', h('p.sl-testo', pg.competenzeAltre)) : null,
    pg.note ? sezione('Note del giocatore', h('p.sl-testo', pg.note)) : null,
    m && !T.presente(id) ? h('p.nota.centrato', 'Il giocatore non è collegato: vedi l\'ultima versione ricevuta.') : null);
}

// ───────── Vetrina: cose da mostrare ai giocatori ─────────
async function caricaVetrine() {
  M.vetrine = (await db.impostazione('masterVetrina', {})) || {};
  T.ridisegna();
}
const vetrinaDi = (codice) => (M.vetrine[codice] ||= []);
function salvaVetrine() { db.salvaImpostazione('masterVetrina', structuredClone(M.vetrine)).catch(console.error); }
const visibileA = (c, id) => c.per === 'tutti' || (Array.isArray(c.per) && c.per.includes(id));

function sincronizzaVetrina(ids = null, { evidenzia = null } = {}) {
  const tv = T.tavoloAttivo();
  if (!tv || !T.sonoMaster() || !M.vetrine) return;
  const lista = vetrinaDi(tv.codice);
  ids ||= T.elencoCompagni(tv).filter((m) => T.presente(m.id)).map((m) => m.id);
  for (const id of ids) {
    if (!tv.membri[id]) continue;   // solo i giocatori
    const vis = lista.filter((c) => visibileA(c, id));
    T.mandaA(id, { tipo: 'vetrina', contenuti: vis.map(({ id: cid, titolo, testo, img, v, vi }) => ({ id: cid, titolo, testo, img, v, vi })), evidenzia: evidenzia && vis.some((c) => c.id === evidenzia) ? evidenzia : null });
  }
}

function impostaVisibilita(c, per) {
  const primaVisibile = c.per !== 'nessuno';
  c.per = per;
  salvaVetrine();
  sincronizzaVetrina(null, { evidenzia: per !== 'nessuno' ? c.id : null });
  T.ridisegna();
  avviso(per === 'nessuno' ? `"${c.titolo}" nascosto ai giocatori` : per === 'tutti' ? `"${c.titolo}" mostrato a tutti` : `"${c.titolo}" mostrato a ${per.length} ${per.length === 1 ? 'giocatore' : 'giocatori'}`);
  if (!primaVisibile && per !== 'nessuno' && !T.tavoloAttivo()) avviso('Nessun tavolo aperto: i giocatori lo vedranno quando si collegano.');
}

function scegliChi(c) {
  const tv = T.tavoloAttivo(); if (!tv) return;
  const scelti = new Set(Array.isArray(c.per) ? c.per : c.per === 'tutti' ? Object.keys(tv.membri) : []);
  pannello(`Chi vede "${c.titolo}"?`, (corpo, chiudi) => {
    const zona = h('div');
    const disegna = () => zona.replaceChildren(
      h('div.chips.grandi', T.elencoCompagni(tv).map((m) => h('button.chip' + (scelti.has(m.id) ? '.attivo' : ''), { onclick: () => { scelti.has(m.id) ? scelti.delete(m.id) : scelti.add(m.id); disegna(); } }, m.nome))),
      h('p.nota', scelti.size ? `Lo vedranno: ${[...scelti].map((id) => tv.membri[id]?.nome).filter(Boolean).join(', ')}` : 'Nessuno lo vedrà.'),
      h('div.riga-btn',
        h('button.btn', { onclick: () => { chiudi(); impostaVisibilita(c, 'nessuno'); } }, 'Nascondi a tutti'),
        h('button.btn.primario', { onclick: () => {
          chiudi();
          const tutti = T.elencoCompagni(tv).every((m) => scelti.has(m.id));
          impostaVisibilita(c, !scelti.size ? 'nessuno' : tutti ? 'tutti' : [...scelti]);
        } }, 'Conferma')));
    disegna();
    corpo.append(zona);
  }, { classe: 'stretto' });
}

// Riduce la foto (max 1600 px, JPEG) per farla viaggiare veloce tra i telefoni
async function riduciImmagine(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ko(new Error('Immagine non leggibile')); i.src = url; });
    const s = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
    const cv = document.createElement('canvas'); cv.width = Math.round(img.naturalWidth * s); cv.height = Math.round(img.naturalHeight * s);
    const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(img, 0, 0, cv.width, cv.height);
    return cv.toDataURL('image/jpeg', 0.82);
  } finally { URL.revokeObjectURL(url); }
}

function editorContenuto(c = null) {
  const tv = T.tavoloAttivo(); if (!tv) return;
  const bozza = c ? { ...c } : { id: nuovoId(), titolo: '', testo: '', img: false, v: 0, vi: 0, per: 'nessuno', creato: Date.now() };
  let nuovaImg = null, togliImg = false;
  pannello(c ? 'Modifica contenuto' : 'Nuovo contenuto da mostrare', (corpo, chiudi) => {
    const titolo = h('input.campo', { value: bozza.titolo, placeholder: 'es. Mappa della cripta, Lettera del duca' });
    const testo = h('textarea.campo', { rows: 5, placeholder: 'Testo (facoltativo): descrizione, indizio, lettera…' });
    testo.value = bozza.testo || '';
    const anteprima = h('div.vetrina-anteprima');
    const disegnaAnteprima = () => {
      const dati = nuovaImg || (!togliImg && M.miniature[bozza.id]);
      anteprima.replaceChildren(dati ? h('img', { src: dati, alt: '' }) : h('p.nota.centrato', bozza.img && !togliImg ? 'Immagine salvata' : 'Nessuna immagine'),
        h('div.riga-btn',
          h('button.btn', { onclick: async () => {
            const f = await scegliFile('image/*'); if (!f) return;
            try { nuovaImg = await riduciImmagine(f); togliImg = false; disegnaAnteprima(); } catch (e) { avviso(e.message, 'errore'); }
          } }, '🖼 ' + (bozza.img || nuovaImg ? 'Cambia immagine' : 'Aggiungi immagine')),
          (bozza.img && !togliImg) || nuovaImg ? h('button.btn', { onclick: () => { nuovaImg = null; togliImg = true; disegnaAnteprima(); } }, 'Togli immagine') : null));
    };
    disegnaAnteprima();
    corpo.append(h('label.campo-ctr', h('span.etichetta', 'Titolo'), titolo), h('label.campo-ctr', h('span.etichetta', 'Testo'), testo), anteprima,
      h('p.nota', 'All\'inizio è nascosto: dopo il salvataggio scegli tu chi lo vede.'),
      h('button.btn.grande.primario', { onclick: async () => {
        bozza.titolo = titolo.value.trim(); bozza.testo = testo.value.trim();
        if (!bozza.titolo && !bozza.testo && !nuovaImg && !(bozza.img && !togliImg)) return avviso('Scrivi un titolo o aggiungi un\'immagine', 'errore');
        bozza.titolo ||= 'Senza titolo';
        if (nuovaImg) {
          bozza.vi = (bozza.vi || 0) + 1; bozza.img = true;
          await db.salvaImpostazione('masterImg-' + bozza.id, { v: bozza.vi, dati: nuovaImg });
          M.miniature[bozza.id] = nuovaImg;
        } else if (togliImg && bozza.img) {
          bozza.img = false; await db.salvaImpostazione('masterImg-' + bozza.id, null); delete M.miniature[bozza.id];
        }
        bozza.v = (bozza.v || 0) + 1;
        const lista = vetrinaDi(tv.codice);
        const i = lista.findIndex((x) => x.id === bozza.id);
        if (i >= 0) lista[i] = bozza; else lista.unshift(bozza);
        salvaVetrine();
        if (bozza.per !== 'nessuno') sincronizzaVetrina();
        chiudi(); T.ridisegna();
        avviso(c ? 'Contenuto aggiornato' : 'Contenuto salvato: ora scegli chi lo vede');
      } }, 'Salva'));
    if (!c) setTimeout(() => titolo.focus(), 250);
  }, { pieno: true });
}

async function eliminaContenuto(c) {
  if (!(await conferma(`Eliminare "${c.titolo}"? Sparisce anche dai telefoni dei giocatori.`, { si: 'Elimina', pericolo: true }))) return;
  const tv = T.tavoloAttivo(); if (!tv) return;
  M.vetrine[tv.codice] = vetrinaDi(tv.codice).filter((x) => x.id !== c.id);
  salvaVetrine(); db.salvaImpostazione('masterImg-' + c.id, null).catch(() => {}); delete M.miniature[c.id];
  sincronizzaVetrina(); T.ridisegna();
}

function miniatura(c) {
  if (!c.img) return h('div.vetrina-mini', '📜');
  const box = h('div.vetrina-mini', '🖼');
  const metti = (dati) => box.replaceChildren(h('img', { src: dati, alt: '' }));
  if (M.miniature[c.id]) metti(M.miniature[c.id]);
  else db.impostazione('masterImg-' + c.id).then((s) => { if (s?.dati) { M.miniature[c.id] = s.dati; metti(s.dati); } });
  return box;
}

function testoVisibilita(c, tv) {
  if (c.per === 'tutti') return 'Visibile a tutti';
  if (Array.isArray(c.per) && c.per.length) return 'Visibile a: ' + c.per.map((id) => tv.membri[id]?.nome || '?').join(', ');
  return 'Nascosto';
}

function vistaMostra(tv) {
  if (!M.vetrine) { caricaVetrine(); return h('p.nota', 'Carico…'); }
  const lista = vetrinaDi(tv.codice);
  return h('div.master-mostra',
    h('p.nota', 'Prepara immagini (mappe, ritratti, lettere, oggetti) e testi. Decidi tu chi li vede: nessuno, tutti o solo alcuni. Puoi nasconderli di nuovo quando vuoi.'),
    h('button.btn.grande.primario', { onclick: () => editorContenuto() }, ico('piu'), 'Nuovo contenuto'),
    lista.length ? lista.map((c) => {
      const visibile = c.per !== 'nessuno';
      return h('div.vetrina-master' + (visibile ? '.visibile' : ''),
        h('div.vetrina-master-testa', { onclick: () => T.apriContenuto(c, { datiImmagine: M.miniature[c.id] }) },
          miniatura(c),
          h('div.vetrina-master-info', h('strong', c.titolo), h('small', (visibile ? '👁 ' : '🙈 ') + testoVisibilita(c, tv)),
            c.testo ? h('small.vetrina-estratto', c.testo.length > 90 ? c.testo.slice(0, 90) + '…' : c.testo) : null)),
        h('div.riga-btn.compatta',
          visibile
            ? h('button.btn.piccolo', { onclick: () => impostaVisibilita(c, 'nessuno') }, '🙈 Nascondi')
            : h('button.btn.piccolo.primario', { onclick: () => impostaVisibilita(c, 'tutti') }, '👁 Mostra a tutti'),
          h('button.btn.piccolo', { onclick: () => scegliChi(c) }, 'Scegli chi'),
          visibile ? h('button.btn.piccolo', { onclick: () => { sincronizzaVetrina(null, { evidenzia: c.id }); avviso('Riaperto sui loro telefoni'); } }, '📣 Rimostra') : null,
          h('button.btn.piccolo', { onclick: () => editorContenuto(c) }, '✎'),
          h('button.btn.piccolo', { onclick: () => eliminaContenuto(c) }, '🗑')));
    }) : h('div.card.vuota', h('p', 'Niente da mostrare, per ora.'), h('p.nota', 'Scatta una foto a una mappa o scrivi la lettera che i personaggi trovano: la mostri quando arriva il momento.')));
}

// ───────── Chat ─────────
function vistaChat(tv) {
  const giocatori = T.elencoCompagni(tv);
  if (M.chatCon !== 'tutti' && !tv.membri[M.chatCon]) M.chatCon = 'tutti';
  const con = M.chatCon;
  const messaggi = (tv.chat || []).filter((v) => con === 'tutti' || v.da === con || v.a === con);
  if (messaggi.some((v) => !v.letto && v.da !== 'master')) setTimeout(() => T.segnaLetti((v) => v.da !== 'master' && (con === 'tutti' || v.da === con)), 400);
  return h('div.master-chat',
    h('div.chips.chat-dest', [['tutti', 'Tutti'], ...giocatori.map((m) => [m.id, m.nome])].map(([id, nome]) => {
      const n = id === 'tutti' ? 0 : T.nonLetti((v) => v.da === id);
      return h('button.chip' + (con === id ? '.attivo' : ''), { onclick: () => { M.chatCon = id; T.ridisegna(); } }, nome, n ? h('span.badge', n) : null);
    })),
    h('p.nota', con === 'tutti' ? 'Il messaggio arriva a tutti i giocatori. Qui vedi anche i messaggi privati.' : `Messaggi privati con ${tv.membri[con]?.nome}: gli altri non li vedono.`),
    messaggi.length
      ? h('div.chat-lista', messaggi.map((v) => h('div.chat-bolla' + (v.da === 'master' ? '.mia' : ''),
        h('small', v.da === 'master' ? `Tu → ${v.a === 'tutti' ? 'tutti' : (tv.membri[v.a]?.nome || '?')}` : (v.daNome || tv.membri[v.da]?.nome || '?'), ' · ', oraBreve(v.t)),
        h('span', v.testo))))
      : h('p.vuoto', 'Nessun messaggio.'));
}

// ───────── Interfaccia ─────────
function vistaGruppo(tv) {
  const giocatori = T.elencoCompagni(tv);
  for (const id of [...M.selezionati]) if (!tv.membri[id]) M.selezionati.delete(id);
  if (!giocatori.length) return h('div.card.vuota', h('p', 'Nessun giocatore ancora al tavolo.'), h('p.nota', 'Tocca il codice in alto e fai inquadrare il QR ai giocatori.'));
  const tutti = giocatori.every((m) => M.selezionati.has(m.id));
  const recenti = [...M.tiri].slice(-3).reverse();
  return h('div.master-gruppo',
    h('div.riga-sel',
      h('span.nota', M.selezionati.size ? `${M.selezionati.size} selezionati: scegli un'azione in basso` : 'Tocca i giocatori per selezionarli'),
      h('button.btn-link', { onclick: () => { if (tutti) M.selezionati.clear(); else giocatori.forEach((m) => M.selezionati.add(m.id)); T.ridisegna(); } }, tutti ? 'Nessuno' : 'Tutti')),
    h('div.compagni', giocatori.map((m) => {
      const msg = T.nonLetti((v) => v.da === m.id);
      return T.schedaCompagno(m, {
        presente: T.presente(m.id),
        classe: M.selezionati.has(m.id) ? 'selezionato' : '',
        onclick: () => { M.selezionati.has(m.id) ? M.selezionati.delete(m.id) : M.selezionati.add(m.id); vibra(5); T.ridisegna(); },
        extra: h('div',
          h('small.comp-extra', `Percezione passiva ${m.percezione ?? '–'} · Iniziativa ${m.iniziativa != null ? R.segno(m.iniziativa) : '–'} · ${typeof m.velocita === 'number' ? String(m.velocita).replace('.', ',') + ' m' : '–'}`),
          h('div.comp-azioni',
            h('button.btn.piccolo', { onclick: ferma(() => apriScheda(m.id)) }, ico('libro'), T.schedaDi(m.id) ? 'Scheda' : 'Scheda…'),
            h('button.btn.piccolo', { onclick: ferma(() => { M.chatCon = m.id; M.vista = 'chat'; T.ridisegna(); }) }, '✉ Scrivi', msg ? h('span.badge', msg) : null))),
      });
    })),
    recenti.length ? h('div.tiri-recenti', h('h3.card-titolo', 'Ultimi tiri chiesti'),
      recenti.map(([id, tr]) => h('button.tiro-recente', { onclick: () => apriRisultati(id) },
        h('span', T.descriviTiro(tr.tiro)), h('small', `${Object.keys(tr.risposte).length}/${tr.ids.length} risposte · ${oraBreve(tr.t)}`)))) : null,
    h('button.btn-link.centrato', { onclick: () => {
      const presenti = giocatori.filter((m) => T.presente(m.id)).map((m) => m.id);
      if (!presenti.length) return avviso('Nessun giocatore collegato', 'errore');
      T.chiediSchede(presenti); avviso('Chiesto l\'aggiornamento delle schede');
    } }, '⟳ Aggiorna le schede di tutti'));
}

function spunta(testo, valore, onCambia) {
  return h('label.spunta', h('input', { type: 'checkbox', checked: !!valore, onchange: (e) => onCambia(e.target.checked) }), ' ' + testo);
}

function vistaIniziativa(tv) {
  if (M.codiceIni !== tv.codice) { caricaIniziativa(tv.codice); return h('p.nota', 'Carico…'); }
  const lista = ordinate();
  const att = lista[M.ini.indice];
  return h('div.master-ini',
    h('div.riga-btn',
      h('button.btn', { onclick: () => { if (T.chiediIniziativa()) avviso('Richiesta inviata: i giocatori tirano dal loro telefono'); else avviso('Serve il collegamento al tavolo', 'errore'); } }, '🎲 Chiedi l\'iniziativa'),
      h('button.btn', { onclick: aggiungiMostri }, ico('piu'), 'Mostri')),
    h('div.opzioni-ini', h('strong', 'Cosa vedono i giocatori'),
      spunta('L\'ordine dei turni', M.ini.mostraOrdine, (v) => { M.ini.mostraOrdine = v; salvaIniziativa(); riannuncia(); T.ridisegna(); }),
      M.ini.mostraOrdine ? spunta('Come stanno i mostri (illeso, ferito, quasi morto…)', M.ini.statoMostri, (v) => { M.ini.statoMostri = v; salvaIniziativa(); riannuncia(); T.ridisegna(); }) : null,
      h('small', 'I mostri con 🙈 restano nascosti: non compaiono e il loro turno appare come "???".')),
    M.ini.round > 0 ? h('div.turno-banner.grande', h('strong', `Round ${M.ini.round}`), att ? ` · turno di ${att.nome}` : null) : null,
    lista.length ? h('div.ini-lista', lista.map((v, i) => {
      const pg = v.tipo === 'pg' ? tv.membri[v.pgId] : null;
      const pf = pg ? `${pg.pf.att}/${pg.pf.max}` : `${v.pf}/${v.pfMax}`;
      const ko = pg ? pg.pf.att <= 0 : v.pf <= 0;
      return h('div.ini-riga' + (i === M.ini.indice && M.ini.round ? '.attuale' : '') + (v.tipo === 'mostro' ? '.mostro' : '') + (ko ? '.ko' : '') + (v.nascosto ? '.nascosto' : ''),
        h('button.ini-val', { onclick: () => modificaVoce(v) }, v.init ?? '?'),
        h('div.ini-info', h('strong', v.nome), h('small', v.tipo === 'pg' ? `Giocatore · PF ${pf} · CA ${pg?.ca ?? '–'}` : `Mostro · PF ${pf}${v.ca ? ' · CA ' + v.ca : ''}${v.nascosto ? ' · nascosto' : ''}`)),
        v.tipo === 'mostro' ? h('button.btn-icona.piccola', { 'aria-label': v.nascosto ? 'Mostra ai giocatori' : 'Nascondi ai giocatori', onclick: () => { v.nascosto = !v.nascosto; salvaIniziativa(); riannuncia(); T.ridisegna(); } }, v.nascosto ? '🙈' : ico('occhio')) : null,
        v.tipo === 'mostro' ? h('button.btn.piccolo', { onclick: () => modificaVoce(v) }, '± PF') : null,
        h('button.btn-icona.piccola', { 'aria-label': 'Togli', onclick: () => {
          const ordAtt = ordinate()[M.ini.indice];
          M.ini.voci = M.ini.voci.filter((x) => x.id !== v.id);
          if (ordAtt) M.ini.indice = Math.max(0, ordinate().findIndex((x) => x.id === ordAtt.id));
          salvaIniziativa(); riannuncia(); T.ridisegna();
        } }, '✕'));
    })) : h('div.card.vuota', h('p', 'Nessuno in combattimento.'), h('p.nota', 'Chiedi l\'iniziativa ai giocatori (tirano dal loro telefono e il risultato arriva qui) e aggiungi i mostri.')),
    h('div.riga-btn',
      h('button.btn.grande.primario', { onclick: turnoSuccessivo }, M.ini.round ? '▶ Turno successivo' : '⚔ Inizia il combattimento'),
      M.ini.voci.length ? h('button.btn', { onclick: fineCombattimento }, 'Fine') : null),
    h('button.btn-link.centrato', { onclick: aggiungiGiocatoriSenzaTiro }, 'Aggiungi i giocatori e scrivo io i tiri'));
}

function barraAzioni() {
  if (M.vista !== 'gruppo' || !M.selezionati.size || !T.tavoloAttivo()) return null;
  return h('div.barra-azioni-master.cinque',
    h('button.btn.pericolo', { onclick: () => pannelloValore('danno') }, '⚔ Danno'),
    h('button.btn.verde', { onclick: () => pannelloValore('cura') }, '✚ Cura'),
    h('button.btn.primario', { onclick: () => pannelloTiro([...M.selezionati]) }, '🎲 Tiro'),
    h('button.btn', { onclick: () => pannelloCondizioni() }, 'Condiz.'),
    h('button.btn', { onclick: pannelloAltro }, '⋯ Altro'));
}

function corpo() {
  const tv = T.tavoloAttivo();
  if (!tv) return h('div.master-vuoto', h('div.card', h('h3.card-titolo', ico('tavolo'), 'Il tuo tavolo'), T.contenutoSenzaTavolo({ master: true })));
  if (M.codiceIni !== tv.codice) caricaIniziativa(tv.codice);
  const msg = T.nonLetti((v) => v.da !== 'master');
  const viste = [['gruppo', 'Gruppo'], ['iniziativa', 'Combatti'], ['mostra', 'Mostra'], ['chat', 'Chat'], ['registro', 'Registro']];
  const att = M.ini?.round ? ordinate()[M.ini.indice] : null;
  return h('div.master-contenuto',
    h('div.card.master-testa', T.testaTavolo(tv),
      att ? h('div.turno-banner', h('strong', `Round ${M.ini.round}`), ` · turno di ${att.nome}`, att.nascosto ? h('small', ' (per i giocatori: ???)') : null) : null),
    h('div.segmenti.cinque', viste.map(([id, nome]) => h('button.segmento' + (M.vista === id ? '.attivo' : ''), { onclick: () => { M.vista = id; T.ridisegna(); } },
      nome, id === 'chat' && msg ? h('span.badge', msg) : null))),
    M.vista === 'gruppo' ? vistaGruppo(tv)
      : M.vista === 'iniziativa' ? vistaIniziativa(tv)
        : M.vista === 'mostra' ? vistaMostra(tv)
          : M.vista === 'chat' ? vistaChat(tv)
            : h('div.card', T.registroPerSerata(tv, { limite: 200 })),
    M.vista === 'registro' ? h('div.riga-btn', h('button.btn', { onclick: () => T.rinominaTavolo(tv) }, 'Rinomina tavolo'), h('button.btn.pericolo', { onclick: () => T.esci() }, 'Chiudi il tavolo')) : null);
}

// Barra per scrivere in chat: creata una volta sola, così il testo non si perde quando arrivano notizie dal tavolo
function barraChat() {
  const campo = h('textarea.campo.chat-campo', { rows: 1, placeholder: 'Scrivi un messaggio…' });
  const manda = () => { if (T.inviaMessaggio(M.chatCon, campo.value)) { campo.value = ''; vibra(10); } };
  const barra = h('div.barra-chat-master', campo, h('button.btn.primario', { onclick: manda }, 'Invia'));
  const etichetta = T.vivo(() => {
    const tv = T.tavoloAttivo();
    barra.hidden = M.vista !== 'chat' || !tv;
    campo.placeholder = M.chatCon === 'tutti' ? 'Scrivi a tutti…' : `Scrivi solo a ${tv?.membri[M.chatCon]?.nome || '…'}…`;
    return null;
  });
  return h('div', etichetta, barra);
}

// Schermata del Master
export function mostraMaster(app, { indietro }) {
  document.body.dataset.schermata = 'master';
  app.replaceChildren(h('div.master',
    h('header.barra-top',
      h('button.btn-icona', { 'aria-label': 'Personaggi', onclick: indietro }, ico('personaggi')),
      h('div.top-titolo', h('strong', 'Modalità Master'), T.vivo(() => h('small', T.tavoloAttivo()?.nome || 'nessun tavolo aperto'))),
      T.pulsanteTavolo({ master: true })),
    h('main.master-scorri', T.vivo(corpo)),
    T.vivo(barraAzioni),
    barraChat()));
  if (!M.vetrine) caricaVetrine();
  T.caricaTavoli().then(() => T.alMaster()).then(() => T.ridisegna());
}
