// Icone disegnate per l'app (stile inciso, a tratto): si colorano con il colore del testo (currentColor).
import { h } from './ui.js';

const P = {
  eroe: '<path d="M4.8 20v-6.6a7.2 7.2 0 0 1 14.4 0V20h-4.4l-1-5.6h-3.6l-1 5.6z"/><path d="M12 6.2V2.8"/><path d="M8.2 11.2h7.6"/>',
  combatti: '<path d="M5 3.5l10.2 10.2"/><path d="M12.6 16.6l4-4"/><path d="M15.2 15.2l4.8 4.8"/><path d="M19 3.5L8.8 13.7"/><path d="M7.4 12.6l4 4"/><path d="M8.8 15.2L4 20"/>',
  abilita: '<path d="M12 2.6l8.4 4.9v9L12 21.4l-8.4-4.9v-9z"/><path d="M12 7.4l4.4 7.8H7.6z"/><path d="M12 2.6v4.8M20.4 7.5l-4 7.7M3.6 7.5l4 7.7M7.6 15.2L12 21.4l4.4-6.2"/>',
  magie: '<path d="M11 2.8c.7 4.6 3 7 7.6 7.6-4.6.7-6.9 3-7.6 7.6-.7-4.6-3-6.9-7.6-7.6 4.6-.6 6.9-3 7.6-7.6z"/><path d="M19 15c.3 1.6 1 2.3 2.5 2.5-1.5.3-2.2 1-2.5 2.5-.3-1.5-1-2.2-2.5-2.5 1.5-.2 2.2-.9 2.5-2.5z"/>',
  zaino: '<path d="M8.6 7.2V5.8a3.4 3.4 0 0 1 6.8 0v1.4"/><path d="M5.4 7.2h13.2l1.1 11.9a1.8 1.8 0 0 1-1.8 1.9H6.1a1.8 1.8 0 0 1-1.8-1.9z"/><path d="M8.5 11.8c2.3 1.4 4.7 1.4 7 0"/><path d="M12 12.8v2.4"/>',
  note: '<path d="M20.2 3.2C12.6 4 7.4 9.2 5.6 17.4L4 21"/><path d="M20.2 3.2c-.8 6.4-4.6 10.8-10.7 12"/><path d="M9.4 9.8l3.2 3.2M12.6 7l2.6 2.6"/>',
  dado: '<path d="M12 2.2l8.8 5.1v9.4L12 21.8l-8.8-5.1V7.3z"/><path d="M12 7.2l5.2 9H6.8z"/><path d="M12 2.2v5M20.8 7.3l-3.6 8.9M3.2 7.3l3.6 8.9M6.8 16.2l5.2 5.6 5.2-5.6"/>',
  personaggi: '<circle cx="9" cy="8.2" r="3.3"/><path d="M3.2 19.6c.6-3.5 2.9-5.4 5.8-5.4s5.2 1.9 5.8 5.4"/><circle cx="16.8" cy="9.3" r="2.6"/><path d="M15.6 14.4c2.8-.2 4.8 1.4 5.4 4.4"/>',
  salva: '<path d="M6 3.2h9.2l3.8 3.8v13.8H6z"/><path d="M15 3.2v4h4"/><path d="M12.5 10.2v6.8M9.5 14l3 3 3-3"/>',
  scudo: '<path d="M12 3l7.4 2.9v5.6c0 4.5-3.1 8.2-7.4 9.5-4.3-1.3-7.4-5-7.4-9.5V5.9z"/><path d="M12 3v18"/>',
  fulmine: '<path d="M13.4 2.6L5.2 13.4h5.9l-1 8 8.7-11.1h-5.9z"/>',
  passo: '<path d="M8.2 3.2h4.6v8.4l5.6 3.4a2 2 0 0 1 1 1.7V20H4.6v-3.3l3.6-2.4z"/><path d="M4.6 17.2h14.8"/>',
  stella: '<path d="M12 3.2l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6-4.4-4.2 6-.8z"/>',
  occhio: '<path d="M2.6 12S6.1 5.6 12 5.6 21.4 12 21.4 12 17.9 18.4 12 18.4 2.6 12 2.6 12z"/><circle cx="12" cy="12" r="2.9"/>',
  cuore: '<path d="M12 20.2S4.4 15.6 4.4 9.9A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 7.6 2.9c0 5.7-7.6 10.3-7.6 10.3z"/>',
  luna: '<path d="M19.6 14.6A8 8 0 1 1 9.4 4.4a6.4 6.4 0 0 0 10.2 10.2z"/>',
  sole: '<circle cx="12" cy="12" r="4"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>',
  piu: '<path d="M12 5v14M5 12h14"/>',
  libro: '<path d="M4.5 5.2c2.9-1 5.4-.6 7.5 1v13.2c-2.1-1.6-4.6-2-7.5-1z"/><path d="M19.5 5.2c-2.9-1-5.4-.6-7.5 1v13.2c2.1-1.6 4.6-2 7.5-1z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  chiudi: '<path d="M6 6l12 12M18 6L6 18"/>',
  espandi: '<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/>',
  amuleto: '<path d="M6.8 3c.2 4.8 2.3 7.8 5.2 8.8 2.9-1 5-4 5.2-8.8"/><path d="M12 11.8l3.2 3.9L12 20.6l-3.2-4.9z"/>',
  spada: '<path d="M20 4l-9.4 9.4"/><path d="M20 4h-3.4M20 4v3.4"/><path d="M7.6 11.8l4.6 4.6"/><path d="M9.9 14.1L4.4 19.6"/>',
  borsa: '<path d="M5 9.2h14v9.4a1.6 1.6 0 0 1-1.6 1.6H6.6A1.6 1.6 0 0 1 5 18.6z"/><path d="M5 9.2L7.3 4.8h9.4L19 9.2"/><path d="M9.6 13.2h4.8"/>',
  armatura: '<path d="M7.2 3.6l2.3 1.6h5l2.3-1.6 3 3-1.6 3.5v10.3H5.8V10.1L4.2 6.6z"/><path d="M12 5.2v14.8M8.4 11.5h7.2"/>',
  // Sigilli delle classi
  ascia: '<path d="M6 20.5L16.2 4.8"/><path d="M13.4 4.1c3.5-1.2 6.6.1 7.7 3.2-2.4 2.1-5.4 2.3-8 .5"/><path d="M13.1 8.9c-1.9 1.2-4.1 1-5.4-.6.8-1.8 2.6-2.6 4.6-2.3"/>',
  lira: '<path d="M7 20.2h10"/><path d="M8.6 20.2c-2.6-3.2-3.1-8.8-1-13.4 1.4 2.6 1.5 4.7 1.1 6.6"/><path d="M15.4 20.2c2.6-3.2 3.1-8.8 1-13.4-1.4 2.6-1.5 4.7-1.1 6.6"/><path d="M8.7 12.3h6.6M10.3 12.3v7.9M12 12.3v7.9M13.7 12.3v7.9"/>',
  foglia: '<path d="M4.8 19.2c0-8.1 5.6-13.7 14.4-14.4-.6 8.8-6.2 14.4-14.4 14.4z"/><path d="M4.8 19.2l8.6-8.6M9.4 14.6h3.2M11.8 12.2V9"/>',
  pugnale: '<path d="M17.8 3.4l-7.9 7.9 1.8 1.8 7.9-7.9z"/><path d="M7.4 11.1l5.5 5.5"/><path d="M9.6 14.4l-5 5"/>',
  bastone: '<path d="M4.6 19.4L19.4 4.6"/><path d="M7.2 14.9l1.9 1.9M14.9 7.2l1.9 1.9"/><circle cx="19.4" cy="4.6" r="1.2"/>',
  arco: '<path d="M5 4.2c8.2.4 14.4 6.6 14.8 14.8"/><path d="M5 4.2l14.8 14.8"/><path d="M8.6 15.4l7.8-7.8"/><path d="M16.4 7.6h-3.1M16.4 7.6v3.1"/>',
  fiamma: '<path d="M12 21.2c-4 0-6.6-2.8-6.6-6.3 0-3.9 3.3-5.7 3.9-10 2.2 1.4 3.3 3.5 3.3 5.3 1-.8 1.6-2 1.7-3.5 2.8 2.1 4.4 5 4.4 8.2 0 3.5-2.6 6.3-6.7 6.3z"/><path d="M12 21.2c-1.7 0-2.9-1.2-2.9-2.8 0-1.9 1.6-2.7 2.3-4.3 1.9 1.1 3.5 2.5 3.5 4.3 0 1.6-1.2 2.8-2.9 2.8z"/>',
  tavolozza: '<path d="M12 3.2a8.8 8.8 0 1 0 0 17.6c1.3 0 1.9-.8 1.9-1.7 0-1.3-1-1.6-1-2.8 0-1 .8-1.7 1.9-1.7h2.2a4 4 0 0 0 4-4C21 6.6 17 3.2 12 3.2z"/><circle cx="7.6" cy="11.4" r="1.2"/><circle cx="10.2" cy="7.4" r="1.2"/><circle cx="15" cy="7.6" r="1.2"/>',
  installa: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.2"/><path d="M12 7v7M9 11.4l3 3 3-3M10.4 18.4h3.2"/>',
  altro: '<circle cx="12" cy="5.5" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="12" cy="18.5" r="1.3"/>',
  figura: '<circle cx="12" cy="5.6" r="2.6"/><path d="M8 21l1.2-7.4-2.6-1.2L8 8.8h8l1.4 3.6-2.6 1.2L16 21"/>',
};

// Sigillo di ogni classe (schermata iniziale, creazione del personaggio)
export const ICONA_CLASSE = {
  Barbaro: 'ascia', Bardo: 'lira', Chierico: 'sole', Druido: 'foglia', Guerriero: 'combatti', Ladro: 'pugnale',
  Mago: 'libro', Monaco: 'bastone', Paladino: 'scudo', Ranger: 'arco', Stregone: 'fiamma', Warlock: 'occhio',
};
export const sigillo = (classe, cls = '') => ico(ICONA_CLASSE[classe] || 'stella', cls);

// Restituisce un <span class="ico"> con l'icona richiesta
export function ico(nome, cls = '') {
  return h('span.ico' + (cls ? '.' + cls : ''), { 'aria-hidden': 'true',
    html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${P[nome] || ''}</svg>` });
}
