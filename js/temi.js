// Temi grafici: scelta globale (per tutti i personaggi) oppure solo per un personaggio (pg.tema).
// I colori stanno tutti in css/style.css come variabili sotto [data-tema="..."].
import { h, pannello, avviso } from './ui.js';
import { db } from './db.js';
import { ico } from './icone.js';

export const TEMI = [
  { id: 'grimorio', nome: 'Grimorio Epico', motto: 'Pergamena, filigrane d\'oro e gemme di zaffiro: il classico tomo dell\'avventuriero.' },
  { id: 'lava', nome: 'Forgia dell\'Abisso', motto: 'Ossidiana, lava viva, braci e luci rosse. Forgiato per Thargrimm, il Paladino Dannato.' },
];
const valido = (id) => (TEMI.some((t) => t.id === id) ? id : 'grimorio');

let globale = 'grimorio';
export async function caricaTemaGlobale() {
  globale = valido(await db.impostazione('tema', 'grimorio'));
  applicaTema(globale);
}
export const temaGlobale = () => globale;
export const temaPer = (pg) => valido(pg?.tema || globale);
export const nomeTema = (id) => TEMI.find((t) => t.id === valido(id)).nome;

// Applica il tema a tutta l'app: colori (CSS), barra di stato del telefono e scena 3D
export function applicaTema(id) {
  const t = valido(id);
  if (document.documentElement.dataset.tema === t) return;
  document.documentElement.dataset.tema = t;
  const colore = getComputedStyle(document.documentElement).getPropertyValue('--tema-colore').trim() || '#0c0706';
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', colore));
  document.dispatchEvent(new CustomEvent('tema-cambiato', { detail: t }));
}

// Anteprima in miniatura, disegnata con le variabili del tema stesso
function anteprima(t) {
  return h('div.ant-tema', { 'data-tema': t.id },
    h('div.ant-card',
      h('div.ant-titolo', 'Thargrimm'),
      h('div.ant-riga', h('span.ant-gemma'), h('span.ant-gemma'), h('span.ant-gemma.vuota'), h('span.ant-moneta'), h('span.ant-moneta')),
      h('div.ant-riga', h('span.ant-btn', 'Tira'), h('span.ant-scudo', '19'))));
}

// Menu dei temi. pg: se presente, si può scegliere il tema solo per questo personaggio.
// onCambia(pg aggiornato o null) viene chiamato dopo la scelta.
export function apriSceltaTema({ pg = null, salvaPg = null } = {}) {
  let soloLui = !!pg?.tema;
  pannello('Tema grafico', (c) => {
    const disegna = () => {
      const attuale = pg ? temaPer(pg) : globale;
      c.replaceChildren(
        pg ? h('div.segmenti.larghi',
          h('button' + (!soloLui ? '.attivo' : ''), { onclick: () => { soloLui = false; disegna(); } }, 'Tutti i personaggi'),
          h('button' + (soloLui ? '.attivo' : ''), { onclick: () => { soloLui = true; disegna(); } }, `Solo ${pg.nome}`)) : null,
        h('div.lista-temi', TEMI.map((t) => h('button.scelta-tema' + (t.id === attuale ? '.attivo' : ''), {
          onclick: async () => {
            if (pg && soloLui) { salvaPg?.(t.id); }
            else {
              globale = t.id; await db.salvaImpostazione('tema', t.id);
              if (pg?.tema) salvaPg?.('');
            }
            applicaTema(pg ? (soloLui ? t.id : globale) : globale);
            avviso(`Tema: ${t.nome}${pg && soloLui ? ` (solo per ${pg.nome})` : ''}`);
            disegna();
          },
        }, anteprima(t),
        h('div.scelta-info', h('strong', t.nome), h('small', t.motto)),
        t.id === attuale ? h('span.scelta-spunta', '✓') : null))),
        h('p.nota', pg
          ? `"Solo ${pg.nome}": quando apri questo personaggio si accende il suo tema, gli altri restano con quello generale (${nomeTema(globale)}).`
          : 'Il tema vale per tutti i personaggi. Dentro la scheda di un personaggio (menu ⋮) puoi dargli un tema tutto suo.'));
    };
    disegna();
  }, { pieno: false });
}

export const pulsanteTema = (onclick) => h('button.btn', { onclick }, ico('tavolozza'), `Tema: ${nomeTema(globale)}`);
