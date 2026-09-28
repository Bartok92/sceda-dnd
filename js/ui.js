// Piccoli strumenti per costruire l'interfaccia senza framework.

// h('div.classe#id', {attributi}, ...figli)
export function h(sel, props, ...figli) {
  if (props == null || typeof props !== 'object' || props instanceof Node || Array.isArray(props)) { figli.unshift(props); props = {}; }
  const [tag, ...resto] = sel.split(/(?=[.#])/);
  const el = document.createElement(tag || 'div');
  for (const r of resto) r[0] === '.' ? el.classList.add(r.slice(1)) : (el.id = r.slice(1));
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className += ' ' + v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k === 'html') el.innerHTML = v;
    else if (k in el && k !== 'list' && k !== 'form') el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  aggiungi(el, figli);
  return el;
}
function aggiungi(el, figli) {
  for (const f of figli) {
    if (f == null || f === false) continue;
    if (Array.isArray(f)) aggiungi(el, f);
    else el.append(f instanceof Node ? f : document.createTextNode(String(f)));
  }
}

export const $ = (s, r = document) => r.querySelector(s);

// append e replaceChildren accettano anche liste e ignorano i valori vuoti (null/false), come h()
const pulisci = (figli) => figli.flat(Infinity).filter((f) => f != null && f !== false);
for (const metodo of ['append', 'replaceChildren']) {
  const originale = Element.prototype[metodo];
  Element.prototype[metodo] = function (...figli) { return originale.apply(this, pulisci(figli)); };
}

// Vibrazione: l'edizione iPhone installa un suo "aggancio" (window.__aptica), perché Safari non supporta navigator.vibrate
export function vibra(ms = 10) { try { if (window.__aptica) return window.__aptica(ms); navigator.vibrate?.(ms); } catch {} }

// Notifica breve in basso
export function avviso(testo, tipo = '') {
  const t = h('div.toast' + (tipo ? '.' + tipo : ''), testo);
  $('#toasts').append(t);
  requestAnimationFrame(() => t.classList.add('vis'));
  setTimeout(() => { t.classList.remove('vis'); setTimeout(() => t.remove(), 400); }, tipo === 'errore' ? 5000 : 2600);
}

// ───── Tasto Indietro (Android) e gesto "indietro" del browser ─────
// Si tiene una sola voce "di guardia" nella cronologia: premendo Indietro si chiude il pannello in cima,
// oppure l'app torna all'elenco dei personaggi; solo se non c'è niente da chiudere si esce davvero.
const pannelliAperti = [];
let guardia = false;
let gestoreIndietro = () => false;
let daProteggere = () => false;
export function impostaIndietro(gestore, proteggi) { gestoreIndietro = gestore; daProteggere = proteggi; }
export function armaIndietro() {
  if (guardia) return;
  try { history.pushState({ guardia: true }, ''); guardia = true; } catch {}
}
window.addEventListener('popstate', () => {
  guardia = false;
  if (pannelliAperti.length) pannelliAperti[pannelliAperti.length - 1]();
  else if (!gestoreIndietro()) { history.back(); return; }
  if (pannelliAperti.length || daProteggere()) armaIndietro();
});

// Pannello che sale dal basso. Restituisce { el, chiudi }
export function pannello(titolo, contenuto, { pieno = false, onChiudi, classe = '' } = {}) {
  const sfondo = h('div.velo');
  const corpo = h('div.pannello-corpo');
  const p = h('div.pannello' + (pieno ? '.pieno' : '') + (classe ? '.' + classe : ''),
    h('div.pannello-testa',
      h('div.maniglia'),
      h('h2', titolo),
      h('button.btn-icona.chiudi', { 'aria-label': 'Chiudi', onclick: () => chiudi() }, '✕')),
    corpo);
  if (typeof contenuto === 'function') contenuto(corpo, () => chiudi());
  else if (contenuto) corpo.append(contenuto);
  const ctr = h('div.pannello-ctr', sfondo, p);
  $('#pannelli').append(ctr);
  sfondo.addEventListener('click', () => chiudi());
  requestAnimationFrame(() => ctr.classList.add('aperto'));
  // Trascina giù dalla maniglia per chiudere
  let y0 = null;
  const testa = p.querySelector('.pannello-testa');
  testa.addEventListener('touchstart', (e) => { y0 = e.touches[0].clientY; }, { passive: true });
  testa.addEventListener('touchmove', (e) => { if (y0 == null) return; const dy = Math.max(0, e.touches[0].clientY - y0); p.style.transform = `translateY(${dy}px)`; }, { passive: true });
  testa.addEventListener('touchend', (e) => { if (y0 == null) return; const dy = e.changedTouches[0].clientY - y0; y0 = null; p.style.transform = ''; if (dy > 90) chiudi(); });
  let chiuso = false;
  pannelliAperti.push(chiudi);
  armaIndietro();
  function chiudi() {
    if (chiuso) return; chiuso = true;
    const i = pannelliAperti.indexOf(chiudi); if (i >= 0) pannelliAperti.splice(i, 1);
    ctr.classList.remove('aperto');
    setTimeout(() => ctr.remove(), 300);
    onChiudi?.();
  }
  return { el: corpo, pannelloEl: p, chiudi };
}

export function conferma(testo, { si = 'Conferma', no = 'Annulla', pericolo = false } = {}) {
  return new Promise((ok) => {
    let risposta = false;
    const pn = pannello('Conferma', (c, chiudi) => {
      c.append(h('p.testo-conferma', testo),
        h('div.riga-btn',
          h('button.btn', { onclick: () => chiudi() }, no),
          h('button.btn' + (pericolo ? '.pericolo' : '.primario'), { onclick: () => { risposta = true; chiudi(); } }, si)));
    }, { onChiudi: () => ok(risposta) });
    return pn;
  });
}

export function chiediTesto(titolo, valore = '', { etichetta = '', multiriga = false } = {}) {
  return new Promise((ok) => {
    let ris = null;
    pannello(titolo, (c, chiudi) => {
      const inp = multiriga ? h('textarea.campo', { rows: 6, value: valore }) : h('input.campo', { value: valore });
      c.append(etichetta ? h('label.etichetta', etichetta) : null, inp,
        h('div.riga-btn', h('button.btn', { onclick: () => chiudi() }, 'Annulla'),
          h('button.btn.primario', { onclick: () => { ris = inp.value; chiudi(); } }, 'OK')));
      setTimeout(() => inp.focus(), 250);
    }, { onChiudi: () => ok(ris) });
  });
}

// Tastierino numerico. azioni: [{id, nome, classe}] → risolve {azione, valore}
export function tastierino(titolo, azioni, { iniziale = '' } = {}) {
  return new Promise((ok) => {
    let ris = null;
    pannello(titolo, (c, chiudi) => {
      let val = String(iniziale);
      const disp = h('div.tast-display', val || '0');
      const agg = () => (disp.textContent = val || '0');
      const tasto = (t) => h('button.tasto', { onclick: () => { vibra(5); if (t === '⌫') val = val.slice(0, -1); else if (t === 'C') val = ''; else if (val.length < 4) val += t; agg(); } }, t);
      c.append(disp,
        h('div.tast-griglia', ['7', '8', '9', '4', '5', '6', '1', '2', '3', 'C', '0', '⌫'].map(tasto)),
        h('div.tast-azioni', azioni.map((a) => h('button.btn.grande' + (a.classe ? '.' + a.classe : ''), {
          onclick: () => { if (!val) return; ris = { azione: a.id, valore: Number(val) }; chiudi(); },
        }, a.nome))));
    }, { onChiudi: () => ok(ris), classe: 'stretto' });
  });
}

// Campo numerico compatto con − e +
export function contatore(valore, onCambia, { min = -Infinity, max = Infinity, passo = 1 } = {}) {
  const v = h('span.cont-val', valore);
  const set = (n) => { n = Math.max(min, Math.min(max, n)); v.textContent = n; onCambia(n); };
  return h('div.contatore',
    h('button.btn-mini', { onclick: () => { vibra(5); set(Number(v.textContent) - passo); } }, '−'),
    v,
    h('button.btn-mini', { onclick: () => { vibra(5); set(Number(v.textContent) + passo); } }, '+'));
}

export const fmtKg = (n) => (Math.round(n * 100) / 100).toLocaleString('it-IT') + ' kg';
export const fmtMB = (b) => (b / 1048576).toLocaleString('it-IT', { maximumFractionDigits: 1 }) + ' MB';

export function campo(etichetta, input) { return h('label.campo-ctr', h('span.etichetta', etichetta), input); }

export function selezione(opzioni, valore, onCambia, props = {}) {
  const s = h('select.campo', props, opzioni.map((o) => {
    const [v, t] = Array.isArray(o) ? o : typeof o === 'object' ? [o.id, o.nome] : [o, o];
    return h('option', { value: v, selected: String(v) === String(valore ?? '') }, t);
  }));
  s.addEventListener('change', () => onCambia(s.value));
  return s;
}

// Seleziona un file dal telefono
export function scegliFile(accept = '') {
  return new Promise((ok) => {
    const inp = h('input', { type: 'file', style: { display: 'none' } });
    if (accept) inp.accept = accept;
    inp.addEventListener('change', () => { ok(inp.files[0] || null); inp.remove(); });
    document.body.append(inp);
    inp.click();
  });
}
