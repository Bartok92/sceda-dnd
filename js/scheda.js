// Schede del personaggio: Eroe, Combattimento, Caratteristiche, Magie, Zaino, Note.
import { h, pannello, conferma, tastierino, avviso, vibra, selezione, campo, fmtKg, contatore } from './ui.js';
import { stato, modifica, salvaPresto } from './stato.js';
import { nuovoId } from './db.js';
import * as R from './regole.js';
import { tira, selettoreModo } from './dadi.js';
import { INCANTESIMI_BASE } from './incantesimi-base.js';

const pg = () => stato.pg;
const num = (v, d = 0) => (v === '' || v == null || isNaN(Number(v)) ? d : Number(v));

function inputNum(valore, onCambia, props = {}) {
  const i = h('input.campo.num', { type: 'number', inputmode: 'numeric', value: valore ?? '', ...props });
  i.addEventListener('change', () => onCambia(num(i.value)));
  return i;
}
function inputTesto(valore, onCambia, props = {}) {
  const i = h('input.campo', { value: valore ?? '', ...props });
  i.addEventListener('change', () => onCambia(i.value));
  return i;
}
function areaTesto(valore, onCambia, props = {}) {
  const i = h('textarea.campo', { rows: 4, ...props });
  i.value = valore ?? '';
  i.addEventListener('change', () => onCambia(i.value));
  return i;
}
const card = (titolo, ...figli) => h('section.card', titolo ? h('h3.card-titolo', titolo) : null, ...figli);

// ───────────────────────── Intestazione e vita ─────────────────────────

export function renderIntestazione(c) {
  const p = pg();
  const liv = p.livello, prossimo = R.SOGLIE_PE[liv] ?? null, attuale = R.SOGLIE_PE[liv - 1] ?? 0;
  const perc = prossimo ? Math.max(0, Math.min(100, ((p.pe - attuale) / (prossimo - attuale)) * 100)) : 100;
  const puoSalire = prossimo != null && p.pe >= prossimo && liv < 20;
  c.append(h('section.card.intestazione', { onclick: (e) => { if (!e.target.closest('button')) apriModificaBase(); } },
    h('div.int-riga',
      h('div',
        h('h1.pg-nome', p.nome),
        h('div.pg-sotto', `${p.razza} · ${p.classe}${p.sottoclasse ? ' (' + p.sottoclasse + ')' : ''} · Livello ${liv}`),
        h('div.pg-sotto.piccolo', p.allineamento + (p.background ? ' · ' + p.background : ''))),
      h('button.ispirazione' + (p.ispirazione ? '.attiva' : ''), {
        'aria-label': 'Ispirazione', onclick: () => { vibra(15); modifica((x) => (x.ispirazione = !x.ispirazione)); },
      }, h('span', '✦'), h('small', 'Ispirazione'))),
    h('div.pe',
      h('div.pe-testo', h('span', `PE ${p.pe.toLocaleString('it-IT')}`), h('span', prossimo ? `prossimo livello: ${prossimo.toLocaleString('it-IT')}` : 'livello massimo')),
      h('div.barra', h('div.barra-riemp.oro', { style: { width: perc + '%' } }))),
    h('div.riga-btn.compatta',
      h('button.btn.piccolo', { onclick: aggiungiPE }, '+ PE'),
      puoSalire ? h('button.btn.piccolo.primario.pulsa', { onclick: saliDiLivello }, '⬆ Sali di livello') : null,
      h('button.btn.piccolo', { onclick: apriModificaBase }, '✎ Modifica'))));
}

async function aggiungiPE() {
  const r = await tastierino('Punti esperienza', [{ id: 'add', nome: 'Aggiungi', classe: 'primario' }, { id: 'tog', nome: 'Togli' }]);
  if (!r) return;
  modifica((x) => (x.pe = Math.max(0, x.pe + (r.azione === 'add' ? r.valore : -r.valore))));
  avviso(`${r.azione === 'add' ? '+' : '−'}${r.valore} PE`);
}

function saliDiLivello() {
  const p = pg(); const dv = p.dadiVita.tipo; const m = R.mod(p.car.COS);
  const media = Math.max(1, Math.floor(dv / 2) + 1 + m);
  pannello(`Livello ${p.livello + 1}!`, (c, chiudi) => {
    const applica = (pf) => {
      modifica((x) => { x.livello++; x.pf.max += pf; x.pf.att += pf; x.dadiVita.rimasti = Math.min(x.livello, x.dadiVita.rimasti + 1); });
      chiudi(); avviso(`Ora sei di livello ${p.livello}! +${pf} PF massimi`);
    };
    c.append(h('p', `Aumenta i punti ferita massimi: dado vita d${dv} ${R.segno(m)} (Costituzione).`),
      h('div.riga-btn',
        h('button.btn.grande', { onclick: () => applica(media) }, `Usa la media (+${media})`),
        h('button.btn.grande.primario', { onclick: () => { const r = tira(`1d${dv}`, 'Dado vita (livello)'); applica(Math.max(1, r.totale + m)); } }, `Tira 1d${dv}`)),
      h('p.nota', 'Ricordati di controllare i nuovi privilegi di classe e, se sei un incantatore, i nuovi incantesimi. Gli slot incantesimo si aggiornano da soli.'));
  });
}

export function apriModificaBase() {
  pannello('Dati del personaggio', (c) => {
    const p = pg();
    const agg = (fn) => modifica(fn);
    const razze = h('datalist#razze', Object.keys(R.RAZZE).map((r) => h('option', { value: r })));
    c.append(razze,
      campo('Nome', inputTesto(p.nome, (v) => agg((x) => (x.nome = v || 'Senza nome')))),
      h('div.griglia2',
        campo('Razza', inputTesto(p.razza, (v) => agg((x) => (x.razza = v)), { list: 'razze' })),
        campo('Classe', selezione(Object.keys(R.CLASSI), p.classe, (v) => agg((x) => {
          x.classe = v; const cl = R.CLASSI[v];
          x.dadiVita.tipo = cl.dv; x.tsComp = [...cl.ts]; x.magia.tipo = cl.magia; x.magia.car = cl.carMagia;
        })))),
      h('div.griglia2',
        campo('Sottoclasse', inputTesto(p.sottoclasse, (v) => agg((x) => (x.sottoclasse = v)))),
        campo('Background', inputTesto(p.background, (v) => agg((x) => (x.background = v))))),
      h('div.griglia2',
        campo('Livello', inputNum(p.livello, (v) => agg((x) => (x.livello = Math.max(1, Math.min(20, v)))), { min: 1, max: 20 })),
        campo('Punti esperienza', inputNum(p.pe, (v) => agg((x) => (x.pe = Math.max(0, v)))))),
      campo('Allineamento', selezione(R.ALLINEAMENTI, p.allineamento, (v) => agg((x) => (x.allineamento = v)))),
      h('div.griglia2',
        campo('PF massimi', inputNum(p.pf.max, (v) => agg((x) => { x.pf.max = Math.max(1, v); x.pf.att = Math.min(x.pf.att, x.pf.max); }))),
        campo('Dado vita', selezione([6, 8, 10, 12].map((d) => [d, 'd' + d]), p.dadiVita.tipo, (v) => agg((x) => (x.dadiVita.tipo = Number(v)))))),
      h('button.btn.piccolo', { onclick: () => agg((x) => { x.pf.max = R.pfMediGenerati(x.classe, x.livello, x.car.COS); x.pf.att = x.pf.max; avviso('PF massimi ricalcolati: ' + x.pf.max); }) }, 'Ricalcola PF massimi (media)'),
      h('div.griglia2',
        campo('Velocità (m)', inputNum(p.velocita, (v) => agg((x) => (x.velocita = v)), { step: 1.5 })),
        campo('Bonus iniziativa extra', inputNum(p.iniziativaBonus, (v) => agg((x) => (x.iniziativaBonus = v))))),
      h('p.nota', 'Tutto viene salvato automaticamente sul telefono.'));
  });
}

export function renderVita(c) {
  const p = pg();
  const { att, max, temp } = p.pf;
  const perc = max ? Math.max(0, Math.min(100, (att / max) * 100)) : 0;
  const livelloPF = att <= 0 ? 'zero' : perc <= 25 ? 'critico' : perc <= 50 ? 'ferito' : 'sano';
  const cambiaPF = (delta) => { vibra(8); modifica((x) => applicaPF(x, delta), 'vita'); };
  const morte = p.tsMorte;
  c.append(h('section.card.vita.' + livelloPF,
    h('div.vita-testa', h('h3.card-titolo', 'Punti ferita'), temp > 0 ? h('span.badge.blu', `+${temp} temporanei`) : null),
    h('div.vita-centro',
      h('button.pf-btn.meno', { onclick: () => cambiaPF(-1), 'aria-label': 'Togli 1 PF' }, '−'),
      h('button.pf-valore', { onclick: apriTastierinoPF },
        h('span.pf-att', att), h('span.pf-sep', '/'), h('span.pf-max', max),
        h('small', 'tocca per danno o cura')),
      h('button.pf-btn.piu', { onclick: () => cambiaPF(1), 'aria-label': 'Aggiungi 1 PF' }, '+')),
    h('div.barra.pf', h('div.barra-riemp', { style: { width: perc + '%' } }), temp > 0 ? h('div.barra-temp', { style: { width: Math.min(100, (temp / max) * 100) + '%' } }) : null),
    h('div.vita-riga',
      h('div.mini-stat', h('small', 'Dadi vita'), h('strong', `${p.dadiVita.rimasti}/${p.livello}`), h('small', 'd' + p.dadiVita.tipo)),
      h('div.mini-stat', { onclick: async () => {
        const r = await tastierino('PF temporanei', [{ id: 'set', nome: 'Imposta', classe: 'primario' }, { id: 'zero', nome: 'Azzera' }]);
        if (r) modifica((x) => (x.pf.temp = r.azione === 'zero' ? 0 : r.valore));
      } }, h('small', 'PF temp.'), h('strong', temp || 0), h('small', 'tocca')),
      h('div.mini-stat.morte' + (att <= 0 ? '.attivo' : ''),
        h('small', 'TS contro morte'),
        h('div.pallini', h('span.lbl', '✔'), [0, 1, 2].map((i) => h('button.pallino.succ' + (i < morte.succ ? '.pieno' : ''), { onclick: () => modifica((x) => (x.tsMorte.succ = i < x.tsMorte.succ ? i : i + 1)) }))),
        h('div.pallini', h('span.lbl', '✖'), [0, 1, 2].map((i) => h('button.pallino.fall' + (i < morte.fall ? '.pieno' : ''), { onclick: () => modifica((x) => (x.tsMorte.fall = i < x.tsMorte.fall ? i : i + 1)) }))),
        att <= 0 ? h('button.btn.piccolo', { onclick: tiroMorte }, 'Tira TS') : null)),
    h('div.riga-btn',
      h('button.btn', { onclick: riposoBreve }, '☾ Riposo breve'),
      h('button.btn', { onclick: riposoLungo }, '☀ Riposo lungo'))));
  document.body.dataset.vita = livelloPF;
}

export function applicaPF(x, delta) {
  if (delta < 0) {
    let danno = -delta;
    const assorbito = Math.min(x.pf.temp, danno);
    x.pf.temp -= assorbito; danno -= assorbito;
    if (x.pf.att <= 0 && danno > 0) x.tsMorte.fall = Math.min(3, x.tsMorte.fall + 1);
    x.pf.att = Math.max(0, x.pf.att - danno);
  } else {
    if (x.pf.att <= 0 && delta > 0) x.tsMorte = { succ: 0, fall: 0 };
    x.pf.att = Math.min(x.pf.max, x.pf.att + delta);
  }
}

async function apriTastierinoPF() {
  const r = await tastierino('Danno o cura', [
    { id: 'danno', nome: '⚔ Danno', classe: 'pericolo' }, { id: 'cura', nome: '✚ Cura', classe: 'verde' }, { id: 'temp', nome: '◈ PF temp.' }]);
  if (!r) return;
  if (r.azione === 'temp') modifica((x) => (x.pf.temp = Math.max(x.pf.temp, r.valore)));
  else modifica((x) => applicaPF(x, r.azione === 'danno' ? -r.valore : r.valore));
  const p = pg();
  if (r.azione === 'danno') {
    document.body.classList.remove('colpito'); void document.body.offsetWidth; document.body.classList.add('colpito');
    vibra([40, 30, 40]);
    if (p.pf.att <= 0) avviso('Sei a 0 PF: effettua i tiri salvezza contro la morte!', 'errore');
    if (p.pf.att > 0 && r.valore >= p.pf.max + p.pf.att) avviso('Danno massiccio: morte istantanea secondo le regole!', 'errore');
  } else avviso(r.azione === 'cura' ? `+${r.valore} PF` : `${r.valore} PF temporanei`);
}

function tiroMorte() {
  const r = tira('1d20', 'Tiro salvezza contro la morte', { d20: true });
  const n = r.naturale;
  modifica((x) => {
    if (n === 20) { x.pf.att = 1; x.tsMorte = { succ: 0, fall: 0 }; }
    else if (n === 1) x.tsMorte.fall = Math.min(3, x.tsMorte.fall + 2);
    else if (r.totale >= 10) x.tsMorte.succ = Math.min(3, x.tsMorte.succ + 1);
    else x.tsMorte.fall = Math.min(3, x.tsMorte.fall + 1);
  });
  const t = pg().tsMorte;
  setTimeout(() => {
    if (n === 20) avviso('20 naturale: torni in piedi con 1 PF!');
    else if (t.succ >= 3) avviso('Tre successi: sei stabile.');
    else if (t.fall >= 3) avviso('Tre fallimenti… il tuo eroe è morto.', 'errore');
  }, 900);
}

// ───────────────────────── Riposi ─────────────────────────

function riposoBreve() {
  pannello('Riposo breve', (c, chiudi) => {
    const p = pg(); const m = R.mod(p.car.COS);
    const info = h('p');
    const agg = () => (info.textContent = `PF ${p.pf.att}/${p.pf.max} · Dadi vita rimasti: ${p.dadiVita.rimasti} (d${p.dadiVita.tipo} ${R.segno(m)})`);
    agg();
    c.append(h('p.nota', 'Durante un riposo breve (almeno 1 ora) puoi spendere dadi vita per recuperare PF. Si ricaricano anche le risorse "a riposo breve" e gli slot del patto del Warlock.'),
      info,
      h('button.btn.grande', { onclick: () => {
        if (p.dadiVita.rimasti <= 0) return avviso('Non hai più dadi vita.', 'errore');
        if (p.pf.att >= p.pf.max) return avviso('Hai già i PF al massimo.');
        const r = tira(`1d${p.dadiVita.tipo}${m ? (m > 0 ? '+' : '') + m : ''}`, 'Dado vita');
        modifica((x) => { x.dadiVita.rimasti--; applicaPF(x, Math.max(0, r.totale)); });
        agg();
      } }, `🎲 Spendi un dado vita`),
      h('button.btn.grande.primario', { onclick: () => {
        modifica((x) => {
          x.risorse.forEach((r) => { if (r.ricarica === 'breve') r.usati = 0; });
          x.magia.pattoUsati = 0;
        });
        chiudi(); avviso('Riposo breve completato ☾');
      } }, 'Termina il riposo breve'));
  });
}

async function riposoLungo() {
  if (!(await conferma('Riposo lungo (8 ore): PF al massimo, recuperi metà dei dadi vita, tutti gli slot incantesimo e le risorse. Procedo?', { si: 'Riposa' }))) return;
  modifica((x) => {
    x.pf.att = x.pf.max; x.pf.temp = 0;
    x.dadiVita.rimasti = Math.min(x.livello, x.dadiVita.rimasti + Math.max(1, Math.floor(x.livello / 2)));
    x.magia.slotUsati = new Array(9).fill(0); x.magia.pattoUsati = 0;
    x.risorse.forEach((r) => (r.usati = 0));
    x.tsMorte = { succ: 0, fall: 0 };
    if (x.sfinimento > 0) x.sfinimento--;
  });
  avviso('Riposo lungo completato ☀ Sei in piena forma!');
}

// ───────────────────────── Condizioni ─────────────────────────

export function renderCondizioni(c) {
  const p = pg();
  c.append(card('Condizioni',
    h('div.chips', R.CONDIZIONI.map((cd) => h('button.chip' + (p.condizioni.includes(cd.id) ? '.attivo' : ''), {
      onclick: () => modifica((x) => { const i = x.condizioni.indexOf(cd.id); i >= 0 ? x.condizioni.splice(i, 1) : x.condizioni.push(cd.id); }),
    }, cd.nome))),
    p.condizioni.length ? h('div.cond-desc', p.condizioni.map((id) => { const cd = R.CONDIZIONI.find((x) => x.id === id); return cd && h('p', h('strong', cd.nome + ': '), cd.desc); })) : null,
    h('div.riga-sfin', h('span.etichetta', 'Sfinimento'),
      contatore(p.sfinimento, (v) => modifica((x) => (x.sfinimento = v)), { min: 0, max: 6 })),
    p.sfinimento ? h('p.nota', 'Livello ' + p.sfinimento + ': ' + R.SFINIMENTO.slice(1, p.sfinimento + 1).join('; ')) : null));
}

// ───────────────────────── Combattimento ─────────────────────────

export function renderCombattimento(c) {
  const p = pg();
  const ca = R.classeArmatura(p);
  c.append(
    h('div.stat-griglia',
      h('button.stat-box.scudo', { onclick: apriCA }, h('small', 'CA'), h('strong', ca), h('small', p.ca.modo === 'auto' ? 'auto' : 'manuale')),
      h('button.stat-box', { onclick: () => tira('1d20' + fmtMod(R.iniziativa(p)), 'Iniziativa', { d20: true }) }, h('small', 'Iniziativa'), h('strong', R.segno(R.iniziativa(p))), h('small', 'tocca e tira')),
      h('div.stat-box', h('small', 'Velocità'), h('strong', String(p.velocita).replace('.', ',')), h('small', 'metri')),
      h('div.stat-box', h('small', 'Competenza'), h('strong', R.segno(R.competenza(p.livello))), h('small', 'bonus')),
      h('div.stat-box', h('small', 'Perc. passiva'), h('strong', R.percezionePassiva(p)), h('small', 'saggezza')),
      h('div.stat-box', h('small', 'Dado vita'), h('strong', 'd' + p.dadiVita.tipo), h('small', `${p.dadiVita.rimasti} rimasti`))),
    h('div.card', h('div.riga-titolo', h('h3.card-titolo', 'Attacchi'), selettoreModo()),
      p.attacchi.length ? p.attacchi.map(rigaAttacco) : h('p.vuoto', 'Nessun attacco. Aggiungi la tua arma o un trucchetto d\'attacco.'),
      h('button.btn.aggiungi', { onclick: () => modificaAttacco() }, '+ Aggiungi attacco')),
    renderRisorse());
}

const fmtMod = (n) => (n ? (n > 0 ? '+' : '') + n : '');

function rigaAttacco(a) {
  const p = pg();
  const bc = R.attaccoBonus(p, a), danni = R.attaccoDanni(p, a);
  return h('div.attacco',
    h('div.att-info', { onclick: () => modificaAttacco(a) }, h('strong', a.nome), h('small', [a.tipo, a.gittata, a.note].filter(Boolean).join(' · ') || 'tocca per modificare')),
    h('button.btn-tiro', { onclick: () => tira('1d20' + fmtMod(bc), `${a.nome}: tiro per colpire`, { d20: true }) }, h('small', 'colpire'), R.segno(bc)),
    h('button.btn-tiro.danni', {
      onclick: () => tira(danni, `${a.nome}: danni`),
      oncontextmenu: (e) => { e.preventDefault(); tira(raddoppiaDadi(danni), `${a.nome}: danni CRITICI`); },
    }, h('small', 'danni'), danni),
    h('button.btn-tiro.crit', { onclick: () => tira(raddoppiaDadi(danni), `${a.nome}: danni CRITICI`), 'aria-label': 'Danni critici' }, h('small', 'crit'), '×2'));
}
const raddoppiaDadi = (e) => e.replace(/(\d*)d(\d+)/g, (_, n, f) => `${(Number(n) || 1) * 2}d${f}`);

function modificaAttacco(a) {
  const nuovo = !a;
  const att = a ? structuredClone(a) : { id: nuovoId(), nome: '', car: 'FOR', comp: true, bonus: 0, danni: '1d8', bonusDanni: 0, tipo: 'taglienti', modDanni: true, gittata: '1,5 m', note: '' };
  pannello(nuovo ? 'Nuovo attacco' : 'Modifica attacco', (c, chiudi) => {
    const anteprima = h('p.anteprima');
    const agg = () => (anteprima.textContent = `Per colpire ${R.segno(R.attaccoBonus(pg(), att))} · Danni ${R.attaccoDanni(pg(), att)} ${att.tipo}`);
    const set = (k) => (v) => { att[k] = v; agg(); };
    const armi = (pg().inventario || []).filter((o) => o.tipo === 'arma');
    c.append(
      campo('Nome', inputTesto(att.nome, set('nome'), { placeholder: 'Es. Spada lunga' })),
      armi.length ? h('div.chips.piccoli', h('span.etichetta', 'Dallo zaino:'), armi.map((o) => h('button.chip', { onclick: () => { att.nome = o.nome; c.querySelector('input').value = o.nome; agg(); } }, o.nome))) : null,
      h('div.griglia2',
        campo('Caratteristica', selezione([['FOR', 'Forza'], ['DES', 'Destrezza'], ['MAG', 'Car. incantatore'], ['COS', 'Costituzione'], ['INT', 'Intelligenza'], ['SAG', 'Saggezza'], ['CAR', 'Carisma']], att.car, set('car'))),
        campo('Competente', selezione([['1', 'Sì'], ['0', 'No']], att.comp ? '1' : '0', (v) => set('comp')(v === '1')))),
      h('div.griglia2',
        campo('Dadi danno', inputTesto(att.danni, set('danni'), { placeholder: '1d8' })),
        campo('Tipo di danno', inputTesto(att.tipo, set('tipo'), { list: 'tipi-danno' }))),
      h('datalist#tipi-danno', ['taglienti', 'perforanti', 'contundenti', 'fuoco', 'freddo', 'fulmine', 'acido', 'veleno', 'necrotici', 'radiosi', 'forza', 'psichici', 'tuono'].map((t) => h('option', { value: t }))),
      h('div.griglia2',
        campo('Bonus colpire extra', inputNum(att.bonus, set('bonus'))),
        campo('Bonus danni extra', inputNum(att.bonusDanni, set('bonusDanni')))),
      h('div.griglia2',
        campo('Somma mod. ai danni', selezione([['1', 'Sì'], ['0', 'No (es. trucchetti)']], att.modDanni ? '1' : '0', (v) => set('modDanni')(v === '1'))),
        campo('Gittata', inputTesto(att.gittata, set('gittata')))),
      campo('Note', inputTesto(att.note, set('note'), { placeholder: 'Es. versatile 1d10, accurata…' })),
      anteprima,
      h('div.riga-btn',
        !nuovo ? h('button.btn.pericolo', { onclick: async () => { if (await conferma(`Eliminare "${att.nome}"?`, { si: 'Elimina', pericolo: true })) { modifica((x) => (x.attacchi = x.attacchi.filter((y) => y.id !== att.id))); chiudi(); } } }, 'Elimina') : null,
        h('button.btn.primario', { onclick: () => {
          if (!att.nome.trim()) return avviso('Dai un nome all\'attacco', 'errore');
          modifica((x) => { const i = x.attacchi.findIndex((y) => y.id === att.id); i >= 0 ? (x.attacchi[i] = att) : x.attacchi.push(att); });
          chiudi();
        } }, 'Salva')));
    agg();
  });
}

function apriCA() {
  pannello('Classe Armatura', (c) => {
    const p = pg();
    const disegna = () => {
      c.replaceChildren(
        h('div.ca-grande', R.classeArmatura(pg())),
        campo('Calcolo', selezione([['auto', 'Automatico (armatura equipaggiata + DES)'], ['manuale', 'Valore manuale']], p.ca.modo, (v) => { modifica((x) => (x.ca.modo = v)); disegna(); })),
        p.ca.modo === 'manuale'
          ? campo('CA', inputNum(p.ca.manuale, (v) => { modifica((x) => (x.ca.manuale = v)); disegna(); }))
          : h('p.nota', 'Si usa l\'armatura equipaggiata nello Zaino (slot "Armatura") più scudi e oggetti con bonus CA. Senza armatura: 10 + DES (Barbaro +COS, Monaco +SAG).'),
        campo('Bonus extra (anelli, incantesimi…)', inputNum(p.ca.bonus, (v) => { modifica((x) => (x.ca.bonus = v)); disegna(); })));
    };
    disegna();
  });
}

function renderRisorse() {
  const p = pg();
  return card('Risorse di classe',
    h('p.nota', 'Ira, Ki, Canalizzare divinità, Punti stregoneria… Si ricaricano da sole con i riposi.'),
    p.risorse.map((r) => h('div.risorsa',
      h('div.ris-info', { onclick: () => modificaRisorsa(r) }, h('strong', r.nome), h('small', `${r.max - r.usati}/${r.max} · riposo ${r.ricarica}`)),
      h('div.pallini', Array.from({ length: Math.min(r.max, 20) }, (_, i) => h('button.pallino.oro' + (i < r.max - r.usati ? '.pieno' : ''), {
        onclick: () => { vibra(8); modifica((x) => { const y = x.risorse.find((z) => z.id === r.id); const disp = y.max - y.usati; y.usati = i < disp ? y.max - i : y.max - i - 1; }); },
      }))))),
    h('button.btn.aggiungi', { onclick: () => modificaRisorsa() }, '+ Aggiungi risorsa'));
}

function modificaRisorsa(r) {
  const ris = r ? { ...r } : { id: nuovoId(), nome: '', max: 2, usati: 0, ricarica: 'lungo' };
  pannello(r ? 'Modifica risorsa' : 'Nuova risorsa', (c, chiudi) => {
    c.append(campo('Nome', inputTesto(ris.nome, (v) => (ris.nome = v), { placeholder: 'Es. Ira' })),
      h('div.griglia2', campo('Utilizzi massimi', inputNum(ris.max, (v) => (ris.max = Math.max(1, v)))),
        campo('Si ricarica con', selezione([['breve', 'Riposo breve'], ['lungo', 'Riposo lungo']], ris.ricarica, (v) => (ris.ricarica = v)))),
      h('div.riga-btn',
        r ? h('button.btn.pericolo', { onclick: () => { modifica((x) => (x.risorse = x.risorse.filter((y) => y.id !== ris.id))); chiudi(); } }, 'Elimina') : null,
        h('button.btn.primario', { onclick: () => {
          if (!ris.nome.trim()) return;
          ris.usati = Math.min(ris.usati, ris.max);
          modifica((x) => { const i = x.risorse.findIndex((y) => y.id === ris.id); i >= 0 ? (x.risorse[i] = ris) : x.risorse.push(ris); });
          chiudi();
        } }, 'Salva')));
  });
}

// ───────────────────────── Caratteristiche e abilità ─────────────────────────

let modificaPunteggi = false;
export function renderCaratteristiche(c) {
  const p = pg(); const comp = R.competenza(p.livello);
  c.append(
    h('div.riga-titolo', h('span.etichetta', 'Tiri di d20 con'), selettoreModo()),
    h('div.car-griglia', R.CARATTERISTICHE.map((cr) => {
      const m = R.mod(p.car[cr.id]);
      return h('div.car-box' + (modificaPunteggi ? '.modifica' : ''),
        h('button.car-tocca', { onclick: () => !modificaPunteggi && tira('1d20' + fmtMod(m), `Prova di ${cr.nome}`, { d20: true }) },
          h('small', cr.nome), h('strong', R.segno(m)), h('span.car-punteggio', p.car[cr.id])),
        modificaPunteggi ? contatore(p.car[cr.id], (v) => modifica((x) => (x.car[cr.id] = v)), { min: 1, max: 30 }) : null);
    })),
    h('button.btn.piccolo.centrato', { onclick: () => { modificaPunteggi = !modificaPunteggi; modifica(() => {}); } }, modificaPunteggi ? '✔ Fine modifica' : '✎ Modifica punteggi'),
    card('Tiri salvezza',
      R.CARATTERISTICHE.map((cr) => {
        const b = R.bonusTS(p, cr.id), ha = p.tsComp.includes(cr.id);
        return h('div.riga-abilita',
          h('button.comp' + (ha ? '.l1' : ''), { 'aria-label': 'Competenza', onclick: () => modifica((x) => { const i = x.tsComp.indexOf(cr.id); i >= 0 ? x.tsComp.splice(i, 1) : x.tsComp.push(cr.id); }) }),
          h('button.ab-nome', { onclick: () => tira('1d20' + fmtMod(b), `TS su ${cr.nome}`, { d20: true }) }, cr.nome),
          h('span.ab-bonus', R.segno(b)));
      })),
    card('Abilità',
      h('p.nota', `Tocca il pallino: ○ nessuna, ● competenza (+${comp}), ◉ maestria (+${comp * 2}). Tocca il nome per tirare.`),
      R.ABILITA.map((ab) => {
        const l = p.abilita[ab.id] || 0, b = R.bonusAbilita(p, ab);
        return h('div.riga-abilita',
          h('button.comp.l' + l, { 'aria-label': 'Competenza', onclick: () => modifica((x) => (x.abilita[ab.id] = ((x.abilita[ab.id] || 0) + 1) % 3)) }),
          h('button.ab-nome', { onclick: () => tira('1d20' + fmtMod(b), `${ab.nome} (${ab.car})`, { d20: true }) }, ab.nome, h('small', ' ' + ab.car)),
          h('span.ab-bonus', R.segno(b)));
      })),
    card('Altre competenze e linguaggi',
      areaTesto(p.competenzeAltre, (v) => modifica((x) => (x.competenzeAltre = v), 'silenzio'), { placeholder: 'Armi, armature, strumenti, linguaggi…' })));
}

// ───────────────────────── Magie ─────────────────────────

let filtroMagie = 'tutti';
export function renderMagie(c) {
  const p = pg(); const m = p.magia;
  const cd = R.cdIncantesimi(p), att = R.attaccoIncantesimi(p);
  const max = R.slotMassimi(p); const patto = R.slotPatto(p);
  c.append(
    h('div.stat-griglia.tre',
      h('div.stat-box', h('small', 'CD incantesimi'), h('strong', cd ?? '—')),
      h('button.stat-box', { onclick: () => att != null && tira('1d20' + fmtMod(att), 'Attacco con incantesimo', { d20: true }) }, h('small', 'Attacco magico'), h('strong', att != null ? R.segno(att) : '—')),
      h('button.stat-box', { onclick: apriImpostazioniMagia }, h('small', 'Caratteristica'), h('strong', m.car || '—'), h('small', 'tocca per cambiare'))),
    card('Slot incantesimo',
      max.some((n) => n > 0) || patto ? null : h('p.vuoto', 'Nessuno slot. Tocca "Imposta" per scegliere il tipo di incantatore o inserire gli slot a mano.'),
      max.map((n, i) => n > 0 && h('div.slot-riga',
        h('span.slot-liv', `${i + 1}°`),
        h('div.pallini', Array.from({ length: n }, (_, k) => h('button.pallino.slot' + (k < n - (m.slotUsati[i] || 0) ? '.pieno' : ''), {
          onclick: () => { vibra(10); modifica((x) => { const disp = n - (x.magia.slotUsati[i] || 0); x.magia.slotUsati[i] = k < disp ? n - k : n - k - 1; }); },
        }))),
        h('small', `${n - (m.slotUsati[i] || 0)}/${n}`))),
      patto ? h('div.slot-riga.patto',
        h('span.slot-liv', `Patto ${patto.liv}°`),
        h('div.pallini', Array.from({ length: patto.n }, (_, k) => h('button.pallino.slot.viola' + (k < patto.n - m.pattoUsati ? '.pieno' : ''), {
          onclick: () => modifica((x) => { const disp = patto.n - x.magia.pattoUsati; x.magia.pattoUsati = k < disp ? patto.n - k : patto.n - k - 1; }),
        }))),
        h('small', 'riposo breve')) : null,
      h('button.btn.piccolo', { onclick: apriImpostazioniMagia }, '⚙ Imposta')),
    h('div.card',
      h('div.riga-titolo', h('h3.card-titolo', 'Incantesimi'),
        h('div.segmenti', [['tutti', 'Tutti'], ['preparati', 'Preparati']].map(([v, t]) => h('button' + (filtroMagie === v ? '.attivo' : ''), { onclick: () => { filtroMagie = v; modifica(() => {}); } }, t)))),
      listaIncantesimi(),
      h('div.riga-btn',
        h('button.btn.aggiungi', { onclick: apriProntuario }, '📖 Dal prontuario'),
        h('button.btn.aggiungi', { onclick: () => modificaIncantesimo() }, '+ Nuovo'))));
}

function listaIncantesimi() {
  const p = pg();
  let l = [...p.incantesimi].sort((a, b) => a.livello - b.livello || a.nome.localeCompare(b.nome));
  if (filtroMagie === 'preparati') l = l.filter((s) => s.preparato || s.livello === 0);
  if (!l.length) return h('p.vuoto', 'Nessun incantesimo.');
  const gruppi = {};
  l.forEach((s) => (gruppi[s.livello] ||= []).push(s));
  return Object.entries(gruppi).map(([liv, arr]) => h('div.gruppo-inc',
    h('h4.sottotitolo', liv === '0' ? 'Trucchetti' : `${liv}° livello`),
    arr.map(cartaIncantesimo)));
}

const incAperti = new Set();
function cartaIncantesimo(s) {
  const det = h('div.inc-dettagli',
    h('div.inc-tabella',
      h('span', 'Lancio'), h('b', s.tempo || '—'), h('span', 'Gittata'), h('b', s.gittata || '—'),
      h('span', 'Componenti'), h('b', s.componenti || '—'), h('span', 'Durata'), h('b', s.durata || '—')),
    h('p.inc-desc', s.descrizione || ''),
    h('div.riga-btn',
      h('button.btn.piccolo', { onclick: () => modificaIncantesimo(s) }, '✎ Modifica'),
      h('button.btn.piccolo.primario', { onclick: () => lancia(s) }, '✦ Lancia')));
  const el = h('div.incantesimo' + (s.preparato || s.livello === 0 ? '.preparato' : '') + (incAperti.has(s.id) ? '.aperto' : ''),
    h('div.inc-testa',
      s.livello > 0 ? h('button.prep' + (s.preparato ? '.si' : ''), { 'aria-label': 'Preparato', onclick: () => modifica((x) => { const y = x.incantesimi.find((z) => z.id === s.id); y.preparato = !y.preparato; }) }, s.preparato ? '★' : '☆') : h('span.prep.trucco', '∞'),
      h('div.inc-nome', { onclick: () => { el.classList.toggle('aperto'); incAperti.has(s.id) ? incAperti.delete(s.id) : incAperti.add(s.id); } },
        h('strong', s.nome),
        h('small', [s.scuola, s.concentrazione ? 'Concentrazione' : '', s.rituale ? 'Rituale' : ''].filter(Boolean).join(' · '))),
      h('span.freccia', '›')),
    det);
  return el;
}

function lancia(s) {
  const p = pg();
  if (s.livello === 0) { avviso(`Lanci ${s.nome}`); return tiraSeServe(s); }
  const max = R.slotMassimi(p); const patto = R.slotPatto(p);
  const opzioni = [];
  max.forEach((n, i) => { if (i + 1 >= s.livello && n > 0) opzioni.push({ tipo: 'slot', liv: i + 1, disp: n - (p.magia.slotUsati[i] || 0) }); });
  if (patto && patto.liv >= s.livello) opzioni.push({ tipo: 'patto', liv: patto.liv, disp: patto.n - p.magia.pattoUsati });
  pannello(`Lancia ${s.nome}`, (c, chiudi) => {
    c.append(h('p', 'Scegli lo slot da consumare:'),
      opzioni.length ? h('div.lista-scelte', opzioni.map((o) => h('button.btn.grande' + (o.disp <= 0 ? '.disab' : ''), {
        disabled: o.disp <= 0,
        onclick: () => {
          modifica((x) => { if (o.tipo === 'patto') x.magia.pattoUsati++; else x.magia.slotUsati[o.liv - 1] = (x.magia.slotUsati[o.liv - 1] || 0) + 1; });
          chiudi(); avviso(`${s.nome} lanciato con uno slot di ${o.liv}° livello`); tiraSeServe(s);
        },
      }, `${o.tipo === 'patto' ? 'Patto' : 'Slot'} ${o.liv}° livello — ${o.disp} disponibili`))) : h('p.vuoto', 'Nessuno slot adatto.'),
      s.rituale ? h('button.btn', { onclick: () => { chiudi(); avviso(`${s.nome} lanciato come rituale (+10 minuti)`); } }, 'Lancia come rituale (senza slot)') : null,
      h('button.btn', { onclick: () => { chiudi(); avviso(`${s.nome} lanciato senza consumare slot`); } }, 'Lancia senza consumare slot'));
  });
}
function tiraSeServe(s) {
  const m = /(\d+d\d+(?:\s*[+-]\s*\d+)?)/i.exec(s.descrizione || '');
  if (m && s.tiraDanni !== false) setTimeout(() => tira(m[1].replace(/\s/g, ''), `${s.nome}`), 400);
}

function apriImpostazioniMagia() {
  pannello('Impostazioni magia', (c) => {
    const disegna = () => {
      const p = pg(); const m = p.magia;
      c.replaceChildren(
        campo('Tipo di incantatore', selezione([['nessuna', 'Nessuno'], ['piena', 'Completo (Bardo, Chierico, Druido, Mago, Stregone)'], ['mezza', 'Mezzo (Paladino, Ranger)'], ['patto', 'Magia del patto (Warlock)']], m.tipo, (v) => { modifica((x) => (x.magia.tipo = v)); disegna(); })),
        campo('Caratteristica da incantatore', selezione([['', '—'], ['INT', 'Intelligenza'], ['SAG', 'Saggezza'], ['CAR', 'Carisma']], m.car || '', (v) => { modifica((x) => (x.magia.car = v || null)); disegna(); })),
        h('label.check', h('input', { type: 'checkbox', checked: Array.isArray(m.slotManuali), onchange: (e) => { modifica((x) => (x.magia.slotManuali = e.target.checked ? R.slotMassimi({ ...x, magia: { ...x.magia, slotManuali: null } }) : null)); disegna(); } }),
          ' Inserisco gli slot a mano (multiclasse, oggetti magici…)'),
        Array.isArray(m.slotManuali) ? h('div.griglia3', m.slotManuali.map((n, i) => campo(`${i + 1}° liv.`, inputNum(n, (v) => modifica((x) => (x.magia.slotManuali[i] = Math.max(0, v))))))) : h('p.nota', 'Gli slot vengono calcolati dal livello e dal tipo di incantatore.'));
    };
    disegna();
  });
}

function apriProntuario() {
  pannello('Prontuario incantesimi', (c, chiudi) => {
    const cerca = h('input.campo', { placeholder: 'Cerca…', type: 'search' });
    const lista = h('div.lista-prontuario');
    const disegna = () => {
      const q = cerca.value.toLowerCase();
      lista.replaceChildren(...INCANTESIMI_BASE.filter((s) => s.nome.toLowerCase().includes(q)).map((s) => h('button.voce-prontuario', {
        onclick: () => {
          modifica((x) => x.incantesimi.push({ id: nuovoId(), preparato: false, ...structuredClone(s) }));
          avviso(`${s.nome} aggiunto`); chiudi();
        },
      }, h('strong', s.nome), h('small', `${s.livello === 0 ? 'Trucchetto' : s.livello + '° livello'} · ${s.scuola}`))));
    };
    cerca.addEventListener('input', disegna);
    c.append(h('p.nota', 'Una selezione di incantesimi comuni. Puoi modificarli dopo averli aggiunti, o crearne di nuovi.'), cerca, lista);
    disegna();
  }, { pieno: true });
}

function modificaIncantesimo(s) {
  const inc = s ? structuredClone(s) : { id: nuovoId(), nome: '', livello: 1, scuola: 'Invocazione', tempo: '1 azione', gittata: '', componenti: 'V, S', durata: 'Istantanea', concentrazione: false, rituale: false, descrizione: '', preparato: true };
  pannello(s ? 'Modifica incantesimo' : 'Nuovo incantesimo', (c, chiudi) => {
    const set = (k) => (v) => (inc[k] = v);
    c.append(campo('Nome', inputTesto(inc.nome, set('nome'))),
      h('div.griglia2',
        campo('Livello', selezione([[0, 'Trucchetto'], ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => [l, l + '°'])], inc.livello, (v) => set('livello')(Number(v)))),
        campo('Scuola', selezione(R.SCUOLE, inc.scuola, set('scuola')))),
      h('div.griglia2', campo('Tempo di lancio', inputTesto(inc.tempo, set('tempo'))), campo('Gittata', inputTesto(inc.gittata, set('gittata')))),
      h('div.griglia2', campo('Componenti', inputTesto(inc.componenti, set('componenti'))), campo('Durata', inputTesto(inc.durata, set('durata')))),
      h('div.griglia2',
        h('label.check', h('input', { type: 'checkbox', checked: inc.concentrazione, onchange: (e) => (inc.concentrazione = e.target.checked) }), ' Concentrazione'),
        h('label.check', h('input', { type: 'checkbox', checked: inc.rituale, onchange: (e) => (inc.rituale = e.target.checked) }), ' Rituale')),
      campo('Descrizione', areaTesto(inc.descrizione, set('descrizione'), { rows: 6 })),
      h('div.riga-btn',
        s ? h('button.btn.pericolo', { onclick: async () => { if (await conferma(`Eliminare ${inc.nome}?`, { si: 'Elimina', pericolo: true })) { modifica((x) => (x.incantesimi = x.incantesimi.filter((y) => y.id !== inc.id))); chiudi(); } } }, 'Elimina') : null,
        h('button.btn.primario', { onclick: () => {
          if (!inc.nome.trim()) return avviso('Serve un nome', 'errore');
          modifica((x) => { const i = x.incantesimi.findIndex((y) => y.id === inc.id); i >= 0 ? (x.incantesimi[i] = inc) : x.incantesimi.push(inc); });
          chiudi();
        } }, 'Salva')));
  });
}

// ───────────────────────── Note e tratti ─────────────────────────

export function renderNote(c) {
  const p = pg();
  c.append(
    card('Tratti e privilegi',
      p.tratti.length ? p.tratti.map((t) => h('details.tratto', h('summary', t.titolo), h('p', t.testo), h('button.btn-link', { onclick: () => modificaTratto(t) }, '✎ Modifica'))) : h('p.vuoto', 'Aggiungi i privilegi di razza e classe, i talenti, il background…'),
      h('button.btn.aggiungi', { onclick: () => modificaTratto() }, '+ Aggiungi tratto')),
    card('Note libere', areaTesto(p.note, (v) => modifica((x) => (x.note = v), 'silenzio'), { rows: 12, placeholder: 'Storia, alleati, missioni, indizi…' })));
}

function modificaTratto(t) {
  const tr = t ? { ...t } : { id: nuovoId(), titolo: '', testo: '' };
  pannello(t ? 'Modifica tratto' : 'Nuovo tratto', (c, chiudi) => {
    c.append(campo('Titolo', inputTesto(tr.titolo, (v) => (tr.titolo = v))), campo('Descrizione', areaTesto(tr.testo, (v) => (tr.testo = v), { rows: 8 })),
      h('div.riga-btn',
        t ? h('button.btn.pericolo', { onclick: () => { modifica((x) => (x.tratti = x.tratti.filter((y) => y.id !== tr.id))); chiudi(); } }, 'Elimina') : null,
        h('button.btn.primario', { onclick: () => {
          if (!tr.titolo.trim()) return;
          modifica((x) => { const i = x.tratti.findIndex((y) => y.id === tr.id); i >= 0 ? (x.tratti[i] = tr) : x.tratti.push(tr); });
          chiudi();
        } }, 'Salva')));
  });
}

export { inputNum, inputTesto, areaTesto, card, fmtMod };
