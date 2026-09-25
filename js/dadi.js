// Tira-dadi: interprete di espressioni (es. "2d6+3"), animazione e cronologia.
import { h, pannello, vibra, $ } from './ui.js';
import { stato, salvaPresto } from './stato.js';

export const modo = { tiro: 'normale' }; // normale | vantaggio | svantaggio
const d = (f) => 1 + Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296 * f);

// Interpreta "2d6+1d4+3" → { gruppi:[{n,f,segno}], fisso }
export function interpreta(expr) {
  const s = String(expr).replace(/\s+/g, '').toLowerCase().replace(/−/g, '-');
  const re = /([+-]?)(\d*)d(\d+)|([+-]?)(\d+)/g;
  const gruppi = []; let fisso = 0; let m; let letto = 0;
  while ((m = re.exec(s))) {
    letto += m[0].length;
    if (m[3]) gruppi.push({ n: Math.min(100, Number(m[2] || 1)), f: Number(m[3]), segno: m[1] === '-' ? -1 : 1 });
    else fisso += (m[4] === '-' ? -1 : 1) * Number(m[5]);
  }
  if (!gruppi.length && !fisso && letto === 0) return null;
  return { gruppi, fisso };
}

// Esegue un tiro. opzioni.d20: applica vantaggio/svantaggio al primo d20
export function esegui(expr, { d20 = false, modoTiro = modo.tiro } = {}) {
  const p = interpreta(expr); if (!p) return null;
  let totale = p.fisso; const parti = []; let naturale = null; let scartato = null;
  p.gruppi.forEach((g, gi) => {
    const valori = [];
    for (let i = 0; i < g.n; i++) valori.push(d(g.f));
    if (d20 && gi === 0 && g.f === 20 && g.n === 1 && modoTiro !== 'normale') {
      const altro = d(20);
      const [a, b] = [valori[0], altro];
      const tenuto = modoTiro === 'vantaggio' ? Math.max(a, b) : Math.min(a, b);
      scartato = tenuto === a ? b : a; valori[0] = tenuto;
    }
    if (g.f === 20 && g.n === 1 && gi === 0) naturale = valori[0];
    totale += g.segno * valori.reduce((s, v) => s + v, 0);
    parti.push({ ...g, valori });
  });
  return { expr, totale, parti, fisso: p.fisso, naturale, scartato, modo: d20 ? modoTiro : 'normale', ora: Date.now() };
}

function descriviParti(r) {
  const s = r.parti.map((p) => `${p.segno < 0 ? '−' : ''}${p.n}d${p.f} [${p.valori.join(', ')}]`).join(' + ').replace(/\+ −/g, '− ');
  const f = r.fisso ? (r.fisso > 0 ? ' + ' : ' − ') + Math.abs(r.fisso) : '';
  const sc = r.scartato != null ? ` (scartato ${r.scartato})` : '';
  return s + f + sc;
}

// Tira e mostra il risultato con animazione
export function tira(expr, etichetta = '', opz = {}) {
  const r = esegui(expr, opz);
  if (!r) return null;
  r.etichetta = etichetta;
  if (stato.pg) {
    stato.pg.storicoDadi = [r, ...(stato.pg.storicoDadi || [])].slice(0, 60);
    salvaPresto();
  }
  mostraRisultato(r);
  document.dispatchEvent(new CustomEvent('tiro', { detail: r }));
  return r;
}

function formaDado(f) {
  // Poligono che richiama la forma del dado
  const forme = {
    4: '50,6 95,88 5,88', 6: '12,12 88,12 88,88 12,88', 8: '50,3 95,50 50,97 5,50',
    10: '50,3 95,40 50,97 5,40', 12: '50,4 93,34 77,90 23,90 7,34', 20: '50,3 93,27 93,73 50,97 7,73 7,27',
    100: '50,3 95,40 50,97 5,40',
  };
  return h('div.dado-forma', { html: `<svg viewBox="0 0 100 100"><polygon points="${forme[f] || forme[20]}" /></svg>` });
}

function mostraRisultato(r) {
  const vecchio = $('.risultato-dado'); vecchio?.remove();
  const f = r.parti[0]?.f || 20;
  const num = h('div.dado-num', '…');
  const crit = r.naturale === 20 ? 'critico' : r.naturale === 1 ? 'fallimento' : '';
  const box = h('div.risultato-dado' + (crit ? '.' + crit : ''),
    h('div.dado-anim', formaDado(f), num),
    h('div.ris-etichetta', r.etichetta || r.expr),
    h('div.ris-dettaglio', descriviParti(r)),
    r.modo !== 'normale' ? h('div.ris-modo', r.modo === 'vantaggio' ? 'Vantaggio' : 'Svantaggio') : null,
    crit ? h('div.ris-crit', crit === 'critico' ? '20 naturale! Colpo critico' : '1 naturale… fallimento') : null);
  box.addEventListener('click', () => box.remove());
  document.body.append(box);
  vibra(25);
  let i = 0; const max = r.parti.reduce((s, p) => s + p.n * p.f, 0) + Math.abs(r.fisso) || 20;
  const iv = setInterval(() => {
    num.textContent = 1 + Math.floor(Math.random() * max);
    if (++i > 11) { clearInterval(iv); num.textContent = r.totale; box.classList.add('fermo'); vibra(crit ? [30, 40, 60] : 15); }
  }, 55);
  setTimeout(() => box.isConnected && box.classList.add('esce'), 4200);
  setTimeout(() => box.isConnected && box.remove(), 4700);
}

export function selettoreModo(onCambia) {
  const opz = [['svantaggio', 'Svant.'], ['normale', 'Normale'], ['vantaggio', 'Vant.']];
  const el = h('div.segmenti');
  const disegna = () => {
    el.replaceChildren(...opz.map(([v, t]) => h('button' + (modo.tiro === v ? '.attivo' : ''), {
      onclick: () => { modo.tiro = v; disegna(); onCambia?.(v); document.dispatchEvent(new Event('modo-tiro')); },
    }, t)));
  };
  document.addEventListener('modo-tiro', disegna);
  disegna();
  return el;
}

export function apriTiraDadi() {
  pannello('Tira-dadi', (c) => {
    let n = 1, bonus = 0;
    const nEl = h('span.cont-val', '1'), bEl = h('span.cont-val', '+0');
    const exprEl = h('input.campo', { placeholder: 'Oppure scrivi: 2d6+3', inputmode: 'text' });
    const storico = h('div.storico');
    const disegnaStorico = () => {
      const l = stato.pg?.storicoDadi || [];
      storico.replaceChildren(...(l.length ? l.slice(0, 30).map((r) => h('div.storico-riga' + (r.naturale === 20 ? '.critico' : r.naturale === 1 ? '.fallimento' : ''),
        h('div', h('strong', r.etichetta || r.expr), h('small', descriviParti(r))),
        h('div.storico-tot', r.totale))) : [h('p.vuoto', 'Nessun tiro ancora.')]));
    };
    const onTiro = () => disegnaStorico();
    document.addEventListener('tiro', onTiro);
    const tiraDado = (f) => {
      const e = `${n}d${f}${bonus ? (bonus > 0 ? '+' : '') + bonus : ''}`;
      tira(e, `${n}d${f}${bonus ? ' ' + (bonus > 0 ? '+' : '−') + Math.abs(bonus) : ''}`, { d20: f === 20 && n === 1 });
    };
    c.append(
      h('div.dadi-griglia', [4, 6, 8, 10, 12, 20, 100].map((f) => h('button.dado-btn', { onclick: () => tiraDado(f) }, formaDado(f), h('span', 'd' + f)))),
      h('div.dadi-opzioni',
        h('div', h('span.etichetta', 'Quanti'), h('div.contatore',
          h('button.btn-mini', { onclick: () => { n = Math.max(1, n - 1); nEl.textContent = n; } }, '−'), nEl,
          h('button.btn-mini', { onclick: () => { n = Math.min(20, n + 1); nEl.textContent = n; } }, '+'))),
        h('div', h('span.etichetta', 'Modificatore'), h('div.contatore',
          h('button.btn-mini', { onclick: () => { bonus--; bEl.textContent = (bonus >= 0 ? '+' : '') + bonus; } }, '−'), bEl,
          h('button.btn-mini', { onclick: () => { bonus++; bEl.textContent = (bonus >= 0 ? '+' : '') + bonus; } }, '+')))),
      h('div', h('span.etichetta', 'd20 con'), selettoreModo()),
      h('div.riga-input', exprEl, h('button.btn.primario', { onclick: () => {
        if (!interpreta(exprEl.value)) return;
        tira(exprEl.value, exprEl.value, { d20: /^\s*1?d20/i.test(exprEl.value) });
      } }, 'Tira')),
      h('h3.sez', 'Cronologia', h('button.btn-link', { onclick: () => { if (stato.pg) { stato.pg.storicoDadi = []; salvaPresto(); disegnaStorico(); } } }, 'Svuota')),
      storico);
    disegnaStorico();
  }, { onChiudi: () => {} });
}
