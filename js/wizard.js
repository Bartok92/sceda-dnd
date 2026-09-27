// Procedura guidata per creare un nuovo personaggio (regole 2024: specie, background con talento delle origini).
import { h, avviso, selezione, campo, contatore } from './ui.js';
import { personaggioVuoto } from './stato.js';
import { nuovoId } from './db.js';
import * as R from './regole.js';
import { esegui } from './dadi.js';
import { SPECIE, BACKGROUND, TALENTI_ORIGINE, COMPETENZE_CLASSE } from './dati2024.js';
import { oggettoDaArma } from './zaino.js';
import { sigillo } from './icone.js';

// Arma di partenza suggerita per classe (se la Destrezza è più alta, per Guerriero e Ladro un'arma a distanza/accurata)
const ARMA_PARTENZA = { Barbaro: 'ascia-bipenne', Bardo: 'pugnale', Chierico: 'mazza', Druido: 'falcetto', Guerriero: 'spada-lunga', Ladro: 'spada-corta',
  Mago: 'pugnale', Monaco: 'lancia', Paladino: 'spada-lunga', Ranger: 'arco-lungo', Stregone: 'pugnale', Warlock: 'pugnale' };

export function avviaCreazione(contenitore, { onFine, onAnnulla }) {
  const pg = personaggioVuoto();
  pg.nome = ''; pg.razza = 'Umano'; pg.background = '';
  let passo = 0;
  let aumenti = null; // { FOR: 2, COS: 1 } dal background
  const PASSI = ['Chi sei', 'Classe', 'Caratteristiche', 'Abilità', 'Riepilogo'];
  const bg = () => BACKGROUND.find((b) => b.nome === pg.background) || null;
  const totale = (id) => Math.min(20, pg.car[id] + (aumenti?.[id] || 0));

  const applicaClasse = () => {
    const cl = R.CLASSI[pg.classe];
    pg.dadiVita.tipo = cl.dv; pg.tsComp = [...cl.ts];
    pg.magia.tipo = cl.magia; pg.magia.car = cl.carMagia;
  };
  applicaClasse();

  function disegna() {
    const corpo = h('div.wiz-corpo');
    [passoChi, passoClasse, passoCar, passoAbilita, passoRiepilogo][passo](corpo);
    contenitore.replaceChildren(
      h('div.wizard',
        h('div.wiz-testa',
          h('button.btn-icona', { onclick: () => (passo ? (passo--, disegna()) : onAnnulla()) }, '‹'),
          h('div', h('small', `Passo ${passo + 1} di ${PASSI.length}`), h('h2', PASSI[passo])),
          h('span')),
        h('div.wiz-progresso', PASSI.map((_, i) => h('span' + (i <= passo ? '.fatto' : '')))),
        corpo,
        h('div.wiz-piede',
          passo < PASSI.length - 1
            ? h('button.btn.grande.primario', { onclick: avanti }, 'Avanti ›')
            : h('button.btn.grande.primario', { onclick: fine }, '⚔ Crea il personaggio'))));
    contenitore.scrollTop = 0;
  }

  function avanti() {
    if (passo === 0 && !pg.nome.trim()) return avviso('Scrivi il nome del tuo eroe', 'errore');
    if (passo === 3) {
      const n = abilitaDiClasse().length;
      if (n < R.CLASSI[pg.classe].nAbilita) avviso(`Hai scelto ${n} abilità di classe su ${R.CLASSI[pg.classe].nAbilita}: potrai completarle dopo.`);
    }
    passo++; disegna();
  }
  const abilitaBg = () => bg()?.abilita || [];
  const abilitaDiClasse = () => Object.keys(pg.abilita).filter((id) => pg.abilita[id] && !abilitaBg().includes(id));

  function fine() {
    // Caratteristiche con gli aumenti del background
    if (aumenti) for (const [id, n] of Object.entries(aumenti)) pg.car[id] = Math.min(20, pg.car[id] + n);
    const specie = SPECIE[pg.razza];
    const b = bg();
    const altre = [];
    if (specie) {
      pg.velocita = specie.vel;
      specie.tratti.forEach((t) => pg.tratti.push({ id: nuovoId(), titolo: `${t.titolo} (${pg.razza})`, testo: t.testo }));
      altre.push(`Taglia: ${specie.taglia}.`);
      if (pg.razza === 'Umano') pg.ispirazione = true; // Intraprendente: Ispirazione eroica
    }
    if (b) {
      b.abilita.forEach((id) => (pg.abilita[id] = 1));
      const t = TALENTI_ORIGINE[b.talento];
      pg.tratti.push({ id: nuovoId(), titolo: `${t.nome} (talento delle origini)`, testo: t.testo });
      if (R.TALENTI_AUTOMATICI.includes(b.talento)) pg.talenti.push(b.talento);
      altre.push(`Strumento (${b.nome}): ${b.strumento}.`);
    }
    const comp = COMPETENZE_CLASSE[pg.classe];
    if (comp) altre.unshift(`Competenze (${pg.classe}): ${comp.testo}`);
    pg.competenzeAltre = altre.join('\n');
    pg.pf.max = R.pfMediTotali(pg);
    pg.pf.att = pg.pf.max;
    pg.dadiVita.rimasti = pg.livello;
    pg.pe = R.SOGLIE_PE[pg.livello - 1];
    // Risorse di classe e di specie secondo il manuale
    R.applicaRisorse(pg, R.confrontaRisorse(pg));
    // Arma di partenza: oggetto nello zaino + attacco già compilato + maestria (se la classe la ha)
    let idArma = ARMA_PARTENZA[pg.classe] || 'pugnale';
    if (R.mod(pg.car.DES) > R.mod(pg.car.FOR)) { if (pg.classe === 'Guerriero') idArma = 'arco-lungo'; if (pg.classe === 'Paladino') idArma = 'stocco'; }
    const arma = R.armaDaId(idArma);
    const ogg = oggettoDaArma(arma); ogg.equip = true;
    pg.inventario.push(ogg);
    pg.attacchi.push({ id: 'arma1', ...R.attaccoDaArma(pg, arma) });
    if (R.maestrieMax(pg) > 0) pg.maestrie = [arma.id];
    pg._talentiControllati = true; pg._maestrieControllate = true;
    onFine(pg);
  }

  function passoChi(c) {
    const nome = h('input.campo.grande', { value: pg.nome, placeholder: 'Es. Thalia Ventodargento', autocomplete: 'off' });
    nome.addEventListener('input', () => (pg.nome = nome.value));
    const s = SPECIE[pg.razza]; const b = bg();
    c.append(
      campo('Nome del personaggio', nome),
      h('span.etichetta', 'Specie'),
      h('div.chips.grandi', Object.keys(SPECIE).map((r) => h('button.chip' + (pg.razza === r ? '.attivo' : ''), { onclick: () => { pg.razza = r; disegna(); } }, r))),
      s ? h('div.box-info', h('strong', `${pg.razza}: taglia ${s.taglia}, velocità ${String(s.vel).replace('.', ',')} m`), h('small', s.tratti.map((t) => t.titolo).join(' · '))) : null,
      campo('Altra specie (scrivi)', (() => { const i = h('input.campo', { value: SPECIE[pg.razza] ? '' : pg.razza, placeholder: 'Es. Mezzelfo' }); i.addEventListener('change', () => { if (i.value.trim()) { pg.razza = i.value.trim(); disegna(); } }); return i; })()),
      h('span.etichetta', 'Background'),
      h('div.chips', BACKGROUND.map((x) => h('button.chip' + (pg.background === x.nome ? '.attivo' : ''), { onclick: () => { pg.background = x.nome; aumenti = null; disegna(); } }, x.nome))),
      b ? h('div.box-info', h('strong', `${b.nome}: talento ${TALENTI_ORIGINE[b.talento].nome}`),
        h('small', `Abilità: ${b.abilita.map((id) => R.ABILITA.find((a) => a.id === id).nome).join(', ')} · Strumento: ${b.strumento} · Aumenti a ${b.car.join(', ')}`)) : null,
      campo('Altro background (scrivi)', (() => { const i = h('input.campo', { value: bg() ? '' : pg.background, placeholder: 'Es. Cavaliere' }); i.addEventListener('change', () => { if (i.value.trim()) { pg.background = i.value.trim(); aumenti = null; disegna(); } }); return i; })()),
      campo('Allineamento', selezione(R.ALLINEAMENTI, pg.allineamento, (v) => (pg.allineamento = v))));
    setTimeout(() => !pg.nome && nome.focus(), 300);
  }

  function passoClasse(c) {
    c.append(
      h('div.classi-griglia', Object.entries(R.CLASSI).map(([nome, cl]) => h('button.classe-card' + (pg.classe === nome ? '.attivo' : ''), {
        onclick: () => { pg.classe = nome; pg.abilita = {}; applicaClasse(); disegna(); },
      }, sigillo(nome, 'sigillo'), h('strong', nome), h('small', `d${cl.dv} · TS ${cl.ts.join(', ')}`), cl.magia !== 'nessuna' ? h('small.magico', '✦ incantatore') : null))),
      COMPETENZE_CLASSE[pg.classe] ? h('p.nota', COMPETENZE_CLASSE[pg.classe].testo) : null,
      h('div.griglia2',
        campo('Livello di partenza', contatore(pg.livello, (v) => (pg.livello = v), { min: 1, max: 20 })),
        campo('Sottoclasse (facoltativa)', (() => { const i = h('input.campo', { value: pg.sottoclasse }); i.addEventListener('change', () => (pg.sottoclasse = i.value)); return i; })())));
  }

  function passoCar(c) {
    const b = bg();
    const griglia = h('div.car-griglia.wizard-car');
    const disegnaCar = () => griglia.replaceChildren(...R.CARATTERISTICHE.map((cr) => h('div.car-box.modifica',
      h('div.car-tocca', h('small', cr.nome), h('strong', R.segno(R.mod(totale(cr.id)))), h('span.car-punteggio', totale(cr.id)),
        aumenti?.[cr.id] ? h('span.badge.verde', '+' + aumenti[cr.id]) : null,
        R.CLASSI[pg.classe].ts.includes(cr.id) ? h('span.badge.oro', 'TS') : null),
      contatore(pg.car[cr.id], (v) => { pg.car[cr.id] = v; disegnaCar(); }, { min: 3, max: 20 }))));
    disegnaCar();
    const assegna = (valori) => {
      // Assegna i valori migliori alle caratteristiche più utili per la classe
      const cl = R.CLASSI[pg.classe];
      const priorita = [...new Set([cl.carMagia, ...cl.ts, 'COS', 'DES', 'FOR', 'SAG', 'INT', 'CAR'].filter(Boolean))];
      const ord = [...valori].sort((a, b) => b - a);
      priorita.forEach((id, i) => (pg.car[id] = ord[i]));
      disegnaCar();
    };
    // Aumenti del background (regole 2024): +2 e +1, oppure +1 a tutte e tre
    let selAumenti = null;
    if (b) {
      const [x, y, z] = b.car;
      const opz = [[x, y], [x, z], [y, x], [y, z], [z, x], [z, y]].map(([d, u]) => [`${d}2${u}1`, `+2 ${d}, +1 ${u}`]);
      opz.push([`${x}1${y}1${z}1`, `+1 a ${x}, ${y} e ${z}`]);
      const chiave = aumenti ? Object.entries(aumenti).sort((a, b2) => b2[1] - a[1]).map(([k, n]) => k + n).join('') : '';
      selAumenti = selezione([['', '— Scegli —'], ...opz], chiave, (v) => {
        aumenti = v ? Object.fromEntries(v.match(/[A-Z]{3}\d/g).map((s) => [s.slice(0, 3), Number(s[3])])) : null;
        disegnaCar();
      });
    }
    c.append(
      h('p.nota', 'Scegli un metodo oppure regola i punteggi a mano con − e +. Il massimo alla creazione è 20.'),
      h('div.riga-btn',
        h('button.btn', { onclick: () => assegna(R.MATRICE_STANDARD) }, 'Serie standard'),
        h('button.btn', { onclick: () => {
          const tiri = Array.from({ length: 6 }, () => { const r = esegui('4d6').parti[0].valori.sort((a, b2) => b2 - a); return r[0] + r[1] + r[2]; });
          assegna(tiri); avviso('Tirati: ' + tiri.join(', '));
        } }, '🎲 Tira 4d6')),
      b ? campo(`Aumenti del background (${b.nome})`, selAumenti) : h('p.nota', 'Con un background del manuale l\'app ti fa scegliere gli aumenti di caratteristica (+2/+1).'),
      griglia);
  }

  function passoAbilita(c) {
    const cl = R.CLASSI[pg.classe];
    const disponibili = cl.abilita === 'tutte' ? R.ABILITA.map((a) => a.id) : cl.abilita;
    const daBg = abilitaBg();
    c.append(
      h('p.nota', `Il ${pg.classe} sceglie ${cl.nAbilita} abilità tra quelle evidenziate. Scelte: ${abilitaDiClasse().length}.` + (daBg.length ? ' Quelle con ✓ vengono dal background.' : '')),
      h('div.chips.grandi', R.ABILITA.map((ab) => daBg.includes(ab.id)
        ? h('button.chip.attivo.bloccato', ab.nome, h('small', ' ✓ ' + ab.car))
        : h('button.chip' + (pg.abilita[ab.id] ? '.attivo' : '') + (disponibili.includes(ab.id) ? '.consigliato' : ''), {
          onclick: () => { pg.abilita[ab.id] = pg.abilita[ab.id] ? 0 : 1; disegna(); },
        }, ab.nome, h('small', ' ' + ab.car)))));
  }

  function passoRiepilogo(c) {
    const tmp = { ...pg, car: Object.fromEntries(R.CARATTERISTICHE.map((cr) => [cr.id, totale(cr.id)])), talenti: bg() && R.TALENTI_AUTOMATICI.includes(bg().talento) ? [bg().talento] : [] };
    const pf = R.pfMediTotali(tmp);
    const s = SPECIE[pg.razza]; const b = bg();
    c.append(h('div.card.riepilogo',
      h('h2', pg.nome || 'Senza nome'),
      h('p', `${pg.razza} · ${pg.classe} di livello ${pg.livello}`),
      h('p', [pg.background, pg.allineamento].filter(Boolean).join(' · ')),
      h('div.riep-griglia',
        h('div', h('small', 'PF'), h('strong', pf)),
        h('div', h('small', 'CA'), h('strong', R.classeArmatura({ ...tmp, pf: { att: pf, max: pf, temp: 0 } }))),
        h('div', h('small', 'Velocità'), h('strong', String(s?.vel ?? 9).replace('.', ',') + ' m')),
        h('div', h('small', 'Iniziativa'), h('strong', R.segno(R.iniziativa(tmp))))),
      h('div.riep-car', R.CARATTERISTICHE.map((cr) => h('span', `${cr.id} ${tmp.car[cr.id]} (${R.segno(R.mod(tmp.car[cr.id]))})`))),
      b ? h('p.nota', `Talento delle origini: ${TALENTI_ORIGINE[b.talento].nome}. Arma iniziale: ${R.armaDaId(ARMA_PARTENZA[pg.classe])?.nome || 'Pugnale'} (con il suo attacco).`) : null),
      h('p.nota', 'Tratti della specie, talento, competenze, risorse di classe e un\'arma con il suo attacco vengono aggiunti da soli. Tutto resta modificabile dalla scheda.'));
  }

  disegna();
}
