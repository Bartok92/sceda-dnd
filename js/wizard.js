// Procedura guidata per creare un nuovo personaggio.
import { h, avviso, selezione, campo, contatore } from './ui.js';
import { personaggioVuoto } from './stato.js';
import * as R from './regole.js';
import { esegui } from './dadi.js';

export function avviaCreazione(contenitore, { onFine, onAnnulla }) {
  const pg = personaggioVuoto();
  pg.nome = '';
  let passo = 0;
  const PASSI = ['Chi sei', 'Classe', 'Caratteristiche', 'Abilità', 'Riepilogo'];

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
      const n = Object.values(pg.abilita).filter(Boolean).length;
      if (n < R.CLASSI[pg.classe].nAbilita) avviso(`Hai scelto ${n} abilità su ${R.CLASSI[pg.classe].nAbilita}: potrai completarle dopo.`);
    }
    passo++; disegna();
  }

  function fine() {
    pg.pf.max = R.pfMediGenerati(pg.classe, pg.livello, pg.car.COS);
    pg.pf.att = pg.pf.max;
    pg.dadiVita.rimasti = pg.livello;
    pg.pe = R.SOGLIE_PE[pg.livello - 1];
    pg.velocita = R.RAZZE[pg.razza]?.vel ?? 9;
    if (pg.classe === 'Barbaro') pg.risorse.push({ id: 'ira', nome: 'Ira', max: pg.livello >= 17 ? 6 : pg.livello >= 12 ? 5 : pg.livello >= 6 ? 4 : pg.livello >= 3 ? 3 : 2, usati: 0, ricarica: 'lungo' });
    if (pg.classe === 'Guerriero') pg.risorse.push({ id: 'recupero', nome: 'Recuperare energie', max: 1, usati: 0, ricarica: 'breve' });
    if (pg.classe === 'Monaco' && pg.livello >= 2) pg.risorse.push({ id: 'ki', nome: 'Punti ki', max: pg.livello, usati: 0, ricarica: 'breve' });
    if (pg.classe === 'Stregone' && pg.livello >= 2) pg.risorse.push({ id: 'stregoneria', nome: 'Punti stregoneria', max: pg.livello, usati: 0, ricarica: 'lungo' });
    if (pg.classe === 'Bardo') pg.risorse.push({ id: 'ispirazione', nome: 'Ispirazione bardica', max: Math.max(1, R.mod(pg.car.CAR)), usati: 0, ricarica: pg.livello >= 5 ? 'breve' : 'lungo' });
    if (pg.classe === 'Paladino') pg.risorse.push({ id: 'imposizione', nome: 'Imposizione delle mani (PF)', max: pg.livello * 5, usati: 0, ricarica: 'lungo' });
    if ((pg.classe === 'Chierico' || pg.classe === 'Paladino') && pg.livello >= 2) pg.risorse.push({ id: 'canalizzare', nome: 'Incanalare divinità', max: pg.livello >= 18 ? 3 : pg.livello >= 6 ? 2 : 1, usati: 0, ricarica: 'breve' });
    // Un attacco di partenza, da modificare a piacere
    const usaDes = R.mod(pg.car.DES) > R.mod(pg.car.FOR);
    const arma = ['Mago', 'Stregone'].includes(pg.classe) ? { nome: 'Pugnale', danni: '1d4', tipo: 'perforanti' }
      : pg.classe === 'Monaco' ? { nome: 'Colpo senz\'armi', danni: '1d4', tipo: 'contundenti' }
      : usaDes ? { nome: 'Stocco', danni: '1d8', tipo: 'perforanti' } : { nome: 'Spada lunga', danni: '1d8', tipo: 'taglienti' };
    pg.attacchi.push({ id: 'arma1', ...arma, car: usaDes || pg.classe === 'Monaco' ? 'DES' : 'FOR', comp: true, bonus: 0, bonusDanni: 0, modDanni: true, gittata: '1,5 m', note: '' });
    onFine(pg);
  }

  function passoChi(c) {
    const nome = h('input.campo.grande', { value: pg.nome, placeholder: 'Es. Thalia Ventodargento', autocomplete: 'off' });
    nome.addEventListener('input', () => (pg.nome = nome.value));
    c.append(
      campo('Nome del personaggio', nome),
      h('span.etichetta', 'Razza'),
      h('div.chips.grandi', Object.keys(R.RAZZE).map((r) => h('button.chip' + (pg.razza === r ? '.attivo' : ''), { onclick: () => { pg.razza = r; disegna(); } }, r))),
      campo('Altra razza (scrivi)', (() => { const i = h('input.campo', { value: Object.keys(R.RAZZE).includes(pg.razza) ? '' : pg.razza, placeholder: 'Es. Aasimar' }); i.addEventListener('change', () => { if (i.value.trim()) pg.razza = i.value.trim(); }); return i; })()),
      campo('Allineamento', selezione(R.ALLINEAMENTI, pg.allineamento, (v) => (pg.allineamento = v))),
      campo('Background', (() => { const i = h('input.campo', { value: pg.background, placeholder: 'Es. Accolito, Soldato, Criminale…' }); i.addEventListener('change', () => (pg.background = i.value)); return i; })()));
    setTimeout(() => !pg.nome && nome.focus(), 300);
  }

  function passoClasse(c) {
    c.append(
      h('div.classi-griglia', Object.entries(R.CLASSI).map(([nome, cl]) => h('button.classe-card' + (pg.classe === nome ? '.attivo' : ''), {
        onclick: () => { pg.classe = nome; pg.abilita = {}; applicaClasse(); disegna(); },
      }, h('strong', nome), h('small', `d${cl.dv} · TS ${cl.ts.join(', ')}`), cl.magia !== 'nessuna' ? h('small.magico', '✦ incantatore') : null))),
      h('div.griglia2',
        campo('Livello di partenza', contatore(pg.livello, (v) => (pg.livello = v), { min: 1, max: 20 })),
        campo('Sottoclasse (facoltativa)', (() => { const i = h('input.campo', { value: pg.sottoclasse }); i.addEventListener('change', () => (pg.sottoclasse = i.value)); return i; })())));
  }

  function passoCar(c) {
    const griglia = h('div.car-griglia.wizard-car');
    const disegnaCar = () => griglia.replaceChildren(...R.CARATTERISTICHE.map((cr) => h('div.car-box.modifica',
      h('div.car-tocca', h('small', cr.nome), h('strong', R.segno(R.mod(pg.car[cr.id]))), h('span.car-punteggio', pg.car[cr.id]),
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
    c.append(
      h('p.nota', 'Scegli un metodo oppure regola i punteggi a mano con − e +. Aggiungi già i bonus razziali.'),
      h('div.riga-btn',
        h('button.btn', { onclick: () => assegna(R.MATRICE_STANDARD) }, 'Serie standard'),
        h('button.btn', { onclick: () => {
          const tiri = Array.from({ length: 6 }, () => { const r = esegui('4d6').parti[0].valori.sort((a, b) => b - a); return r[0] + r[1] + r[2]; });
          assegna(tiri); avviso('Tirati: ' + tiri.join(', '));
        } }, '🎲 Tira 4d6')),
      griglia);
  }

  function passoAbilita(c) {
    const cl = R.CLASSI[pg.classe];
    const disponibili = cl.abilita === 'tutte' ? R.ABILITA.map((a) => a.id) : cl.abilita;
    const n = Object.values(pg.abilita).filter(Boolean).length;
    c.append(
      h('p.nota', `Il ${pg.classe} sceglie ${cl.nAbilita} abilità tra quelle evidenziate. Puoi aggiungere anche quelle del background. Scelte: ${n}.`),
      h('div.chips.grandi', R.ABILITA.map((ab) => h('button.chip' + (pg.abilita[ab.id] ? '.attivo' : '') + (disponibili.includes(ab.id) ? '.consigliato' : ''), {
        onclick: () => { pg.abilita[ab.id] = pg.abilita[ab.id] ? 0 : 1; disegna(); },
      }, ab.nome, h('small', ' ' + ab.car)))));
  }

  function passoRiepilogo(c) {
    const pf = R.pfMediGenerati(pg.classe, pg.livello, pg.car.COS);
    const tmp = { ...pg, pf: { att: pf, max: pf, temp: 0 } };
    c.append(h('div.card.riepilogo',
      h('h2', pg.nome || 'Senza nome'),
      h('p', `${pg.razza} · ${pg.classe} di livello ${pg.livello}`),
      h('p', pg.allineamento),
      h('div.riep-griglia',
        h('div', h('small', 'PF'), h('strong', pf)),
        h('div', h('small', 'CA'), h('strong', R.classeArmatura(tmp))),
        h('div', h('small', 'Competenza'), h('strong', R.segno(R.competenza(pg.livello)))),
        h('div', h('small', 'Iniziativa'), h('strong', R.segno(R.mod(pg.car.DES))))),
      h('div.riep-car', R.CARATTERISTICHE.map((cr) => h('span', `${cr.id} ${pg.car[cr.id]} (${R.segno(R.mod(pg.car[cr.id]))})`)))),
      h('p.nota', 'Tutto potrà essere modificato in seguito dalla scheda. Dopo la creazione potrai caricare il tuo modello 3D nella scheda Eroe.'));
  }

  disegna();
}
