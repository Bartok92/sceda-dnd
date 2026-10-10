// Procedura guidata per creare un nuovo personaggio (regole 2024: specie, background con talento delle origini).
import { h, avviso, selezione, campo, contatore } from './ui.js';
import { personaggioVuoto } from './stato.js';
import { nuovoId } from './db.js';
import * as R from './regole.js';
import { esegui } from './dadi.js';
import { SPECIE, BACKGROUND, TALENTI_ORIGINE, COMPETENZE_CLASSE, COSTO_PUNTI, PUNTI_DISPONIBILI, ARMATURE, COLPO_SENZ_ARMI, SERIE_PER_CLASSE } from './dati2024.js';
import { EQUIP_INIZIALE, ORO_INIZIALE, equipDaId } from './equipaggiamento2024.js';
import { oggettoDaArma, oggettoDaArmatura, oggettoDaEquip } from './zaino.js';
import { sigillo } from './icone.js';
import { selettoreSottoclasse } from './scheda.js';

// Equipaggiamento iniziale della classe (manuale 2024, opzione A; il Guerriero ha A e B): armature e scudo indossati,
// la prima arma impugnata, un attacco collegato per ogni arma, dotazione e monete d'oro. 'oro' = solo monete (opzione B).
function applicaEquipIniziale(pg, scelta) {
  const pac = scelta === 'oro' ? null : (EQUIP_INIZIALE[pg.classe] || [])[scelta] || null;
  if (!pac) {
    pg.monete.mo = (Number(pg.monete.mo) || 0) + (ORO_INIZIALE[pg.classe] || 0);
    pg.attacchi.push({ id: nuovoId(), ...R.attaccoDaArma(pg, COLPO_SENZ_ARMI) });
    return;
  }
  for (const id of pac.armature || []) {
    const a = ARMATURE.find((x) => x.id === id); if (!a) continue;
    const o = oggettoDaArmatura(a); o.equip = true; pg.inventario.push(o);
  }
  let impugnata = false;
  for (const [id, n] of pac.armi || []) {
    const a = R.armaDaId(id); if (!a) continue;
    const o = oggettoDaArma(a); o.qta = n;
    if (!impugnata) { o.equip = true; impugnata = true; }
    pg.inventario.push(o);
    pg.attacchi.push({ id: nuovoId(), ...R.attaccoDaArma(pg, a), oggetto: o.id });
  }
  for (const [id, n] of pac.oggetti || []) { const e = equipDaId(id); if (e) pg.inventario.push(oggettoDaEquip(e, (e.qta || 1) * n)); }
  pg.monete.mo = (Number(pg.monete.mo) || 0) + (pac.mo || 0);
}
// Testo breve del pacchetto: "Cotta di maglia, Scudo, Spada lunga, 6 Giavellotti… e 9 mo"
function testoPacchetto(pac) {
  const nomi = [...(pac.armature || []).map((id) => ARMATURE.find((x) => x.id === id)?.nome),
    ...(pac.armi || []).map(([id, n]) => (n > 1 ? n + ' × ' : '') + R.armaDaId(id)?.nome),
    ...(pac.oggetti || []).map(([id, n]) => (n > 1 ? n + ' × ' : '') + equipDaId(id)?.nome)].filter(Boolean);
  return `${nomi.join(', ')} e ${pac.mo} mo.`;
}

export function avviaCreazione(contenitore, { onFine, onAnnulla }) {
  const pg = personaggioVuoto();
  pg.nome = ''; pg.razza = 'Umano'; pg.background = '';
  let passo = 0;
  let aumenti = null; // { FOR: 2, COS: 1 } dal background
  let aPunti = false;  // acquisto a punti attivo (27 punti)
  let equipScelta = 0; // pacchetto di equipaggiamento iniziale (indice) oppure 'oro'
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
      altre.push(`Taglia: ${specie.taglia}.`);
      if (pg.razza === 'Umano') pg.ispirazione = true; // Intraprendente: Ispirazione eroica
    }
    if (b) {
      b.abilita.forEach((id) => (pg.abilita[id] = 1));
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
    // Equipaggiamento iniziale del manuale: armatura, armi con i loro attacchi, dotazione e monete; maestrie sulle armi ricevute
    applicaEquipIniziale(pg, equipScelta);
    const maxM = R.maestrieMax(pg);
    if (maxM > 0) pg.maestrie = [...new Set(pg.attacchi.map((a) => a.arma).filter((id) => R.armaDaId(id)?.maestria))].slice(0, maxM);
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
        onclick: () => { pg.classe = nome; pg.abilita = {}; equipScelta = 0; applicaClasse(); disegna(); },
      }, sigillo(nome, 'sigillo'), h('strong', nome), h('small', `d${cl.dv} · TS ${cl.ts.join(', ')}`), cl.magia !== 'nessuna' ? h('small.magico', '✦ incantatore') : null))),
      COMPETENZE_CLASSE[pg.classe] ? h('p.nota', COMPETENZE_CLASSE[pg.classe].testo) : null,
      h('div.griglia2',
        campo('Livello di partenza', contatore(pg.livello, (v) => (pg.livello = v), { min: 1, max: 20 })),
        campo('Sottoclasse (dal 3° livello)', selettoreSottoclasse(pg.classe, pg.sottoclasse, (v) => (pg.sottoclasse = v)))),
      sceltaEquip());
  }

  // Equipaggiamento iniziale: i pacchetti del manuale per la classe, oppure solo monete d'oro
  function sceltaEquip() {
    const pacchetti = EQUIP_INIZIALE[pg.classe] || [];
    const box = h('div.box-info');
    const disegnaBox = () => {
      const pac = equipScelta === 'oro' ? null : pacchetti[equipScelta];
      box.replaceChildren(h('strong', pac ? 'Ricevi:' : `Ricevi ${ORO_INIZIALE[pg.classe] || 0} mo da spendere`),
        h('small', pac ? testoPacchetto(pac) : 'Compri tu armi, armatura ed equipaggiamento dallo Zaino → Dal manuale.'),
        pac?.nota ? h('small', ' ' + pac.nota) : null);
    };
    disegnaBox();
    const opz = [...pacchetti.map((p, i) => [i, pacchetti.length > 1 ? `Pacchetto ${p.nome}` : 'Pacchetto del manuale']), ['oro', `Solo oro (${ORO_INIZIALE[pg.classe] || 0} mo)`]];
    return h('div', campo('Equipaggiamento iniziale', selezione(opz, equipScelta, (v) => { equipScelta = v === 'oro' ? 'oro' : Number(v); disegnaBox(); })), box);
  }

  function passoCar(c) {
    const b = bg();
    const griglia = h('div.car-griglia.wizard-car');
    const infoPunti = h('p.nota');
    // Acquisto a punti (regole 2024): 27 punti, ogni punteggio da 8 a 15 prima degli aumenti del background
    const spesi = () => R.CARATTERISTICHE.reduce((t, cr) => t + (COSTO_PUNTI[pg.car[cr.id]] ?? 99), 0);
    const disegnaCar = () => {
      griglia.replaceChildren(...R.CARATTERISTICHE.map((cr) => h('div.car-box.modifica',
        h('div.car-tocca', h('small', cr.nome), h('strong', R.segno(R.mod(totale(cr.id)))), h('span.car-punteggio', totale(cr.id)),
          aumenti?.[cr.id] ? h('span.badge.verde', '+' + aumenti[cr.id]) : null,
          R.CLASSI[pg.classe].ts.includes(cr.id) ? h('span.badge.oro', 'TS') : null),
        contatore(pg.car[cr.id], (v) => {
          const prima = pg.car[cr.id]; pg.car[cr.id] = v;
          if (aPunti && spesi() > PUNTI_DISPONIBILI) { pg.car[cr.id] = prima; avviso(`Hai solo ${PUNTI_DISPONIBILI} punti`, 'errore'); }
          disegnaCar();
        }, aPunti ? { min: 8, max: 15 } : { min: 3, max: 20 }))));
      infoPunti.textContent = aPunti ? `Acquisto a punti: spesi ${spesi()} su ${PUNTI_DISPONIBILI}. Costi: 8=0, 9=1, 10=2, 11=3, 12=4, 13=5, 14=7, 15=9. Tocca di nuovo «A punti (27)» per regolarli liberamente.` : '';
      infoPunti.hidden = !aPunti;
    };
    disegnaCar();
    const assegna = (valori) => {
      aPunti = false;
      // Valori più alti nelle caratteristiche più importanti per la classe, nell'ordine della tabella
      // "Serie standard per classe" del manuale (con la serie standard si ottiene proprio la tabella)
      const serie = SERIE_PER_CLASSE[pg.classe];
      const cl = R.CLASSI[pg.classe];
      const priorita = serie
        ? R.CARATTERISTICHE.map((c, i) => [c.id, serie[i]]).sort((a, b) => b[1] - a[1]).map(([id]) => id)
        : [...new Set([cl.carMagia, ...cl.ts, 'COS', 'DES', 'FOR', 'SAG', 'INT', 'CAR'].filter(Boolean))];
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
        h('button.btn', { onclick: () => { aPunti = !aPunti; if (aPunti) R.CARATTERISTICHE.forEach((cr) => (pg.car[cr.id] = 8)); disegnaCar(); } }, 'A punti (27)'),
        h('button.btn', { onclick: () => {
          const tiri = Array.from({ length: 6 }, () => { const r = esegui('4d6').parti[0].valori.sort((a, b2) => b2 - a); return r[0] + r[1] + r[2]; });
          assegna(tiri); avviso('Tirati: ' + tiri.join(', '));
        } }, '🎲 Tira 4d6')),
      b ? campo(`Aumenti del background (${b.nome})`, selAumenti) : h('p.nota', 'Con un background del manuale l\'app ti fa scegliere gli aumenti di caratteristica (+2/+1).'),
      infoPunti,
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
    const tmp = { ...structuredClone(pg), car: Object.fromEntries(R.CARATTERISTICHE.map((cr) => [cr.id, totale(cr.id)])), talenti: bg() && R.TALENTI_AUTOMATICI.includes(bg().talento) ? [bg().talento] : [] };
    applicaEquipIniziale(tmp, equipScelta);   // anteprima: CA e attacchi con l'equipaggiamento scelto
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
      tmp.attacchi.length ? h('p.nota', 'Attacchi: ' + tmp.attacchi.map((a) => `${a.nome} ${R.segno(R.attaccoBonus(tmp, a))} (${R.attaccoDanni(tmp, a)})`).join(' · ')) : null,
      b ? h('p.nota', `Talento delle origini: ${TALENTI_ORIGINE[b.talento].nome}.`) : null),
      h('p.nota', 'Tratti della specie, talento, competenze, risorse di classe ed equipaggiamento iniziale (con gli attacchi delle armi) vengono aggiunti da soli. Tutto resta modificabile dalla scheda.'));
  }

  disegna();
}
