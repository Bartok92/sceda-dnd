// Modalità Master: il DM usa l'app senza personaggio.
// - Gruppo: tutti i giocatori in diretta (PF, CA, condizioni, percezione passiva); se ne selezionano uno o più
//   e si mandano danni, cure, PF temporanei o condizioni: i loro telefoni li applicano da soli (con Annulla).
// - Iniziativa: si chiede l'iniziativa ai giocatori (tirano dal loro telefono), si aggiungono i mostri (con PF e CA),
//   si scorrono i turni: tutti vedono "Round 2 · turno di …" e chi è di turno riceve un avviso.
// - Registro: tutto quello che è successo, serata per serata.
import { h, avviso, pannello, conferma, tastierino, vibra } from './ui.js';
import { db, nuovoId } from './db.js';
import * as R from './regole.js';
import { esegui } from './dadi.js';
import { ico } from './icone.js';
import * as T from './tavolo.js';

const M = { vista: 'gruppo', selezionati: new Set(), ini: null, codiceIni: null, tutte: {} };

// ───────── Iniziativa (salvata su questo telefono, una per tavolo) ─────────
async function caricaIniziativa(codice) {
  M.tutte = (await db.impostazione('masterIniziativa', {})) || {};
  M.ini = M.tutte[codice] || { voci: [], round: 0, indice: -1 };
  M.codiceIni = codice;
  T.ridisegna();
}
function salvaIniziativa() {
  if (!M.codiceIni) return;
  M.tutte[M.codiceIni] = M.ini;
  db.salvaImpostazione('masterIniziativa', structuredClone(M.tutte)).catch(console.error);
}
const ordinate = () => [...M.ini.voci].sort((a, b) => (b.init ?? -99) - (a.init ?? -99) || (b.bonus || 0) - (a.bonus || 0) || a.nome.localeCompare(b.nome));

// Le risposte d'iniziativa dei giocatori arrivano qui
T.suRisposta((r) => {
  if (r.cosa !== 'iniziativa' || !M.ini) return;
  let v = M.ini.voci.find((x) => x.tipo === 'pg' && x.pgId === r.pgId);
  if (!v) { v = { id: nuovoId(), tipo: 'pg', pgId: r.pgId, nome: r.nome }; M.ini.voci.push(v); }
  v.init = r.valore; v.bonus = r.bonus; v.nome = r.nome;
  salvaIniziativa();
  avviso(`${r.nome}: iniziativa ${r.valore}${r.naturale === 20 ? ' (20 naturale!)' : ''}`);
  T.ridisegna();
});

function annunciaTurno() {
  const tv = T.tavoloAttivo();
  const lista = ordinate();
  const att = lista[M.ini.indice];
  if (!att) { T.inviaTurno(null); return; }
  // il prossimo "vivo" dopo l'attuale
  let prossimo = null;
  for (let k = 1; k <= lista.length; k++) {
    const v = lista[(M.ini.indice + k) % lista.length];
    if (v && v.id !== att.id && (v.tipo === 'pg' || v.pf > 0)) { prossimo = v; break; }
  }
  T.inviaTurno({ round: M.ini.round, nome: att.nome, pgId: att.tipo === 'pg' ? att.pgId : null, prossimo: prossimo?.nome || null, t: Date.now() });
  if (tv) T.scriviNelRegistro(`Round ${M.ini.round} · turno di ${att.nome}`, { tipo: 'turno' });
}

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
  M.ini = { voci: [], round: 0, indice: -1 };
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
    const riga = (et, inp) => h('label.campo-ctr', h('span.etichetta', et), inp);
    c.append(riga('Nome', nome),
      h('div.griglia-2', riga('Quanti', quanti), riga('Bonus iniziativa', bonus), riga('Punti ferita', pf), riga('Classe armatura', ca)),
      h('p.nota', 'L\'app tira l\'iniziativa di ogni mostro (d20 + bonus). Con più mostri uguali li numera: Goblin 1, Goblin 2…'),
      h('button.btn.grande.primario', { onclick: () => {
        const n = Math.max(1, Math.min(20, Number(quanti.value) || 1));
        const base = nome.value.trim() || 'Mostro';
        const b = Number(bonus.value) || 0; const p = Math.max(1, Number(pf.value) || 1);
        for (let i = 1; i <= n; i++) {
          const r = esegui('1d20');
          M.ini.voci.push({ id: nuovoId(), tipo: 'mostro', nome: n > 1 ? `${base} ${i}` : base, init: r.totale + b, bonus: b, pf: p, pfMax: p, ca: Number(ca.value) || null });
        }
        salvaIniziativa(); chiudi(); T.ridisegna();
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
      if (r.azione === 'danno' && v.pf === 0) { avviso(`${v.nome} è a terra!`); if (tv) T.scriviNelRegistro(`${v.nome} è sconfitto`, { tipo: 'danno' }); }
    }
  } else {
    const r = await tastierino(`Iniziativa di ${v.nome}`, [{ id: 'init', nome: 'Imposta', classe: 'primario' }]);
    if (!r) return;
    v.init = r.valore;
  }
  salvaIniziativa(); T.ridisegna();
}

// ───────── Azioni sui giocatori selezionati ─────────
function bersagli() {
  const tv = T.tavoloAttivo();
  return tv ? [...M.selezionati].map((id) => tv.membri[id]).filter(Boolean) : [];
}
function nomiBersagli(b) { return b.length > 2 ? `${b.length} giocatori` : b.map((m) => m.nome).join(' e '); }

function pannelloValore(tipo) {
  const b = bersagli(); if (!b.length) return;
  const titoli = { danno: 'Danni', cura: 'Cura', pftemp: 'PF temporanei' };
  pannello(`${titoli[tipo]} a ${nomiBersagli(b)}`, (c, chiudi) => {
    const numero = h('input.campo.campo-numero.grande', { type: 'number', inputMode: 'numeric', placeholder: 'quanti?' });
    const motivo = h('input.campo', { placeholder: tipo === 'danno' ? 'Motivo (facoltativo), es. Palla di fuoco' : 'Motivo (facoltativo)' });
    const manda = (meta = false) => {
      let v = Number(numero.value);
      if (!v || v < 0) return avviso('Scrivi un numero', 'errore');
      if (meta) v = Math.floor(v / 2);
      let ok = 0;
      for (const m of b) if (T.inviaAzione(m.id, { tipo, valore: v, motivo: motivo.value.trim() + (meta ? (motivo.value.trim() ? ', ' : '') + 'metà danni' : '') })) ok++;
      if (ok) { chiudi(); vibra(20); avviso(`Inviato a ${nomiBersagli(b)}`); }
    };
    c.append(numero, motivo,
      tipo === 'danno'
        ? h('div.riga-btn', h('button.btn.grande.pericolo', { onclick: () => manda(false) }, '⚔ Infliggi'), h('button.btn.grande', { onclick: () => manda(true) }, '½ Metà (TS superato)'))
        : h('button.btn.grande' + (tipo === 'cura' ? '.verde' : '.primario'), { onclick: () => manda(false) }, tipo === 'cura' ? '✚ Cura' : '◈ Dai PF temporanei'),
      b.some((m) => !T.presente(m.id)) ? h('p.nota', 'Chi non è collegato lo riceverà appena torna al tavolo.') : null);
    setTimeout(() => numero.focus(), 250);
  }, { classe: 'stretto' });
}

function pannelloCondizioni() {
  const b = bersagli(); if (!b.length) return;
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

// ───────── Interfaccia ─────────
function vistaGruppo(tv) {
  const giocatori = T.elencoCompagni(tv);
  for (const id of [...M.selezionati]) if (!tv.membri[id]) M.selezionati.delete(id);
  if (!giocatori.length) return h('div.card.vuota', h('p', 'Nessun giocatore ancora al tavolo.'), h('p.nota', 'Tocca il codice in alto e fai inquadrare il QR ai giocatori.'));
  const tutti = giocatori.every((m) => M.selezionati.has(m.id));
  return h('div.master-gruppo',
    h('div.riga-sel',
      h('span.nota', M.selezionati.size ? `${M.selezionati.size} selezionati` : 'Tocca i giocatori per selezionarli'),
      h('button.btn-link', { onclick: () => { if (tutti) M.selezionati.clear(); else giocatori.forEach((m) => M.selezionati.add(m.id)); T.ridisegna(); } }, tutti ? 'Nessuno' : 'Tutti')),
    h('div.compagni', giocatori.map((m) => T.schedaCompagno(m, {
      presente: T.presente(m.id),
      classe: M.selezionati.has(m.id) ? 'selezionato' : '',
      onclick: () => { M.selezionati.has(m.id) ? M.selezionati.delete(m.id) : M.selezionati.add(m.id); vibra(5); T.ridisegna(); },
      extra: h('small.comp-extra', `Percezione passiva ${m.percezione ?? '–'} · Iniziativa ${m.iniziativa != null ? R.segno(m.iniziativa) : '–'} · ${typeof m.velocita === 'number' ? String(m.velocita).replace('.', ',') + ' m' : '–'}`),
    }))));
}

function vistaIniziativa(tv) {
  if (M.codiceIni !== tv.codice) { caricaIniziativa(tv.codice); return h('p.nota', 'Carico…'); }
  const lista = ordinate();
  const att = lista[M.ini.indice];
  return h('div.master-ini',
    h('div.riga-btn',
      h('button.btn', { onclick: () => { if (T.chiediIniziativa()) avviso('Richiesta inviata: i giocatori tirano dal loro telefono'); else avviso('Serve il collegamento al tavolo', 'errore'); } }, '🎲 Chiedi l\'iniziativa'),
      h('button.btn', { onclick: aggiungiMostri }, ico('piu'), 'Mostri')),
    M.ini.round > 0 ? h('div.turno-banner.grande', h('strong', `Round ${M.ini.round}`), att ? ` · turno di ${att.nome}` : null) : null,
    lista.length ? h('div.ini-lista', lista.map((v, i) => {
      const pg = v.tipo === 'pg' ? tv.membri[v.pgId] : null;
      const pf = pg ? `${pg.pf.att}/${pg.pf.max}` : `${v.pf}/${v.pfMax}`;
      const ko = pg ? pg.pf.att <= 0 : v.pf <= 0;
      return h('div.ini-riga' + (i === M.ini.indice && M.ini.round ? '.attuale' : '') + (v.tipo === 'mostro' ? '.mostro' : '') + (ko ? '.ko' : ''),
        h('button.ini-val', { onclick: () => modificaVoce(v) }, v.init ?? '?'),
        h('div.ini-info', h('strong', v.nome), h('small', v.tipo === 'pg' ? `Giocatore · PF ${pf} · CA ${pg?.ca ?? '–'}` : `Mostro · PF ${pf}${v.ca ? ' · CA ' + v.ca : ''}`)),
        v.tipo === 'mostro' ? h('button.btn.piccolo', { onclick: () => modificaVoce(v) }, '± PF') : null,
        h('button.btn-icona.piccola', { 'aria-label': 'Togli', onclick: () => {
          const ordAtt = ordinate()[M.ini.indice];
          M.ini.voci = M.ini.voci.filter((x) => x.id !== v.id);
          if (ordAtt) M.ini.indice = Math.max(0, ordinate().findIndex((x) => x.id === ordAtt.id));
          salvaIniziativa(); T.ridisegna();
        } }, '✕'));
    })) : h('div.card.vuota', h('p', 'Nessuno in combattimento.'), h('p.nota', 'Chiedi l\'iniziativa ai giocatori (tirano dal loro telefono e il risultato arriva qui) e aggiungi i mostri.')),
    h('div.riga-btn',
      h('button.btn.grande.primario', { onclick: turnoSuccessivo }, M.ini.round ? '▶ Turno successivo' : '⚔ Inizia il combattimento'),
      M.ini.voci.length ? h('button.btn', { onclick: fineCombattimento }, 'Fine') : null),
    h('button.btn-link.centrato', { onclick: aggiungiGiocatoriSenzaTiro }, 'Aggiungi i giocatori e scrivo io i tiri'));
}

function barraAzioni() {
  if (M.vista !== 'gruppo' || !M.selezionati.size || !T.tavoloAttivo()) return null;
  return h('div.barra-azioni-master',
    h('button.btn.pericolo', { onclick: () => pannelloValore('danno') }, '⚔ Danno'),
    h('button.btn.verde', { onclick: () => pannelloValore('cura') }, '✚ Cura'),
    h('button.btn', { onclick: () => pannelloValore('pftemp') }, '◈ PF temp.'),
    h('button.btn', { onclick: pannelloCondizioni }, 'Condizioni'));
}

function corpo() {
  const tv = T.tavoloAttivo();
  if (!tv) return h('div.master-vuoto', h('div.card', h('h3.card-titolo', ico('tavolo'), 'Il tuo tavolo'), T.contenutoSenzaTavolo({ master: true })));
  const viste = [['gruppo', 'Gruppo'], ['iniziativa', 'Iniziativa'], ['registro', 'Registro']];
  return h('div.master-contenuto',
    h('div.card.master-testa', T.testaTavolo(tv),
      tv.turno ? h('div.turno-banner', h('strong', `Round ${tv.turno.round}`), ` · turno di ${tv.turno.nome}`) : null),
    h('div.segmenti', viste.map(([id, nome]) => h('button.segmento' + (M.vista === id ? '.attivo' : ''), { onclick: () => { M.vista = id; T.ridisegna(); } }, nome))),
    M.vista === 'gruppo' ? vistaGruppo(tv) : M.vista === 'iniziativa' ? vistaIniziativa(tv) : h('div.card', T.registroPerSerata(tv, { limite: 200 })),
    M.vista === 'registro' ? h('div.riga-btn', h('button.btn', { onclick: () => T.rinominaTavolo(tv) }, 'Rinomina tavolo'), h('button.btn.pericolo', { onclick: () => T.esci() }, 'Chiudi il tavolo')) : null);
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
    T.vivo(barraAzioni)));
  T.caricaTavoli().then(() => T.alMaster()).then(() => T.ridisegna());
}
