// Edizione iPhone (pagina iphone/): accorgimenti che valgono solo qui. Viene caricato prima di main.js.
// Tutto il resto dell'app (schede, 3D, tavolo, Master…) è in comune con la versione generica: ogni aggiornamento vale per entrambe.
import { stato } from './stato.js';
import * as T from './tavolo.js';

const radice = document.documentElement;
radice.dataset.edizione = 'iphone';

// ───── 1. Vibrazione vera (Taptic Engine) ─────
// Safari su iPhone non supporta navigator.vibrate. Da iOS 18, attivare un interruttore <input type="checkbox" switch>
// produce il "tic" aptico di sistema: lo usiamo (nascosto) per tutti i tocchi, i tiri di dado, i colpi subiti.
const etichetta = document.createElement('label');
etichetta.setAttribute('aria-hidden', 'true');
etichetta.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none';
const interruttore = document.createElement('input');
interruttore.type = 'checkbox';
interruttore.setAttribute('switch', '');
interruttore.tabIndex = -1;
etichetta.append(interruttore);
document.body.append(etichetta);
let ultimoTic = 0;
function tic() {
  const ora = performance.now();
  if (ora - ultimoTic < 55) return;
  ultimoTic = ora;
  etichetta.click();
}
window.__aptica = (ms = 10) => {
  // un tocco leggero = 1 tic; vibrazioni lunghe o a sequenza (colpo subito, critico) = 2-3 tic ravvicinati
  const n = Array.isArray(ms) ? Math.ceil(ms.length / 2) : ms >= 25 ? 2 : 1;
  for (let i = 0; i < Math.min(3, n); i++) setTimeout(tic, i * 110);
};

// ───── 2. Schermo sempre acceso al tavolo ─────
// Su iPhone, quando lo schermo si spegne l'app si ferma e il collegamento con i compagni cade.
// Mentre sei al tavolo (o in modalità Master) lo schermo resta acceso (Screen Wake Lock).
let blocco = null;
async function aggiornaSchermo() {
  const serve = document.visibilityState === 'visible' && (T.faseTavolo() !== 'spento' || document.body.dataset.schermata === 'master');
  if (serve && !blocco && 'wakeLock' in navigator) {
    try {
      blocco = await navigator.wakeLock.request('screen');
      blocco.addEventListener('release', () => { blocco = null; });
    } catch { blocco = null; }
  } else if (!serve && blocco) {
    try { await blocco.release(); } catch {}
    blocco = null;
  }
}
T.suTavolo(aggiornaSchermo);
document.addEventListener('visibilitychange', aggiornaSchermo);
new MutationObserver(aggiornaSchermo).observe(document.body, { attributes: true, attributeFilter: ['data-schermata'] });

// ───── 3. Pallino sull'icona quando è il tuo turno ─────
T.suTavolo(() => {
  const t = T.tavoloAttivo()?.turno;
  const mio = !!(t && stato.pg && t.pgId === stato.pg.id);
  if (mio && document.hidden) navigator.setAppBadge?.(1).catch(() => {});
  if (!mio) navigator.clearAppBadge?.().catch(() => {});
});
document.addEventListener('visibilitychange', () => { if (!document.hidden) navigator.clearAppBadge?.().catch(() => {}); });

// ───── 4. Tastiera: i fogli dal basso restano sopra la tastiera ─────
// Nelle app installate Safari non ridimensiona la pagina quando compare la tastiera: la misuro e sposto i pannelli.
const vv = window.visualViewport;
if (vv) {
  const agg = () => {
    const k = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
    radice.style.setProperty('--tastiera', k + 'px');
    radice.classList.toggle('tastiera-aperta', k > 80);
  };
  vv.addEventListener('resize', agg);
  vv.addEventListener('scroll', agg);
  agg();
}
// Chiusa la tastiera, Safari a volte lascia la pagina spostata verso l'alto: la rimetto a posto
document.addEventListener('focusout', () => setTimeout(() => { if (!document.activeElement?.matches?.('input, textarea, select')) window.scrollTo(0, 0); }, 60));

// ───── 5. Niente zoom accidentale con due dita (iOS ignora user-scalable=no) ─────
for (const ev of ['gesturestart', 'gesturechange']) document.addEventListener(ev, (e) => { if (!e.target.closest?.('.vista3d')) e.preventDefault(); }, { passive: false });
