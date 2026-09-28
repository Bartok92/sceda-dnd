// Dati delle regole di D&D 2024 (SRD 5.2, CC-BY-4.0): armi, maestrie, armature, specie, background, talenti delle origini,
// risorse e privilegi di classe per livello. Descrizioni riassunte in italiano. Pesi: 1 libbra = 0,5 kg (come nei manuali italiani).

// ───────────────────────── Armi ─────────────────────────
// prop: accurata, leggera, pesante, due-mani, versatile, portata, lancio, munizioni, ricarica
const A = (id, nome, en, cat, tipo, danni, tipoDanno, prop, maestria, peso, costo, extra = {}) =>
  ({ id, nome, en, cat, tipo, danni, tipoDanno, prop, maestria, peso, costo, ...extra });

export const ARMI = [
  // Semplici da mischia
  A('randello', 'Randello', 'Club', 'semplice', 'mischia', '1d4', 'contundenti', ['leggera'], 'rallentare', 1, '1 ma'),
  A('pugnale', 'Pugnale', 'Dagger', 'semplice', 'mischia', '1d4', 'perforanti', ['accurata', 'leggera', 'lancio'], 'colpo-extra', 0.5, '2 mo', { gittata: '6/18 m' }),
  A('randello-pesante', 'Randello pesante', 'Greatclub', 'semplice', 'mischia', '1d8', 'contundenti', ['due-mani'], 'spingere', 5, '2 ma'),
  A('ascia', 'Ascia', 'Handaxe', 'semplice', 'mischia', '1d6', 'taglienti', ['leggera', 'lancio'], 'tormentare', 1, '5 mo', { gittata: '6/18 m' }),
  A('giavellotto', 'Giavellotto', 'Javelin', 'semplice', 'mischia', '1d6', 'perforanti', ['lancio'], 'rallentare', 1, '5 ma', { gittata: '9/36 m' }),
  A('martello-leggero', 'Martello leggero', 'Light Hammer', 'semplice', 'mischia', '1d4', 'contundenti', ['leggera', 'lancio'], 'colpo-extra', 1, '2 mo', { gittata: '6/18 m' }),
  A('mazza', 'Mazza', 'Mace', 'semplice', 'mischia', '1d6', 'contundenti', [], 'fiaccare', 2, '5 mo'),
  A('bastone-ferrato', 'Bastone ferrato', 'Quarterstaff', 'semplice', 'mischia', '1d6', 'contundenti', ['versatile'], 'rovesciare', 2, '2 ma', { versatile: '1d8' }),
  A('falcetto', 'Falcetto', 'Sickle', 'semplice', 'mischia', '1d4', 'taglienti', ['leggera'], 'colpo-extra', 1, '1 mo'),
  A('lancia', 'Lancia', 'Spear', 'semplice', 'mischia', '1d6', 'perforanti', ['lancio', 'versatile'], 'fiaccare', 1.5, '1 mo', { gittata: '6/18 m', versatile: '1d8' }),
  // Semplici a distanza
  A('dardo', 'Dardo', 'Dart', 'semplice', 'distanza', '1d4', 'perforanti', ['accurata', 'lancio'], 'tormentare', 0.125, '5 mr', { gittata: '6/18 m' }),
  A('balestra-leggera', 'Balestra leggera', 'Light Crossbow', 'semplice', 'distanza', '1d8', 'perforanti', ['munizioni', 'ricarica', 'due-mani'], 'rallentare', 2.5, '25 mo', { gittata: '24/96 m', munizione: 'quadrelli' }),
  A('arco-corto', 'Arco corto', 'Shortbow', 'semplice', 'distanza', '1d6', 'perforanti', ['munizioni', 'due-mani'], 'tormentare', 1, '25 mo', { gittata: '24/96 m', munizione: 'frecce' }),
  A('fionda', 'Fionda', 'Sling', 'semplice', 'distanza', '1d4', 'contundenti', ['munizioni'], 'rallentare', 0, '1 ma', { gittata: '9/36 m', munizione: 'proiettili' }),
  // Da guerra da mischia
  A('ascia-da-battaglia', 'Ascia da battaglia', 'Battleaxe', 'guerra', 'mischia', '1d8', 'taglienti', ['versatile'], 'rovesciare', 2, '10 mo', { versatile: '1d10' }),
  A('mazzafrusto', 'Mazzafrusto', 'Flail', 'guerra', 'mischia', '1d8', 'contundenti', [], 'fiaccare', 1, '10 mo'),
  A('falcione', 'Falcione', 'Glaive', 'guerra', 'mischia', '1d10', 'taglienti', ['pesante', 'portata', 'due-mani'], 'sfiorare', 3, '20 mo'),
  A('ascia-bipenne', 'Ascia bipenne', 'Greataxe', 'guerra', 'mischia', '1d12', 'taglienti', ['pesante', 'due-mani'], 'fendere', 3.5, '30 mo'),
  A('spadone', 'Spadone', 'Greatsword', 'guerra', 'mischia', '2d6', 'taglienti', ['pesante', 'due-mani'], 'sfiorare', 3, '50 mo'),
  A('alabarda', 'Alabarda', 'Halberd', 'guerra', 'mischia', '1d10', 'taglienti', ['pesante', 'portata', 'due-mani'], 'fendere', 3, '20 mo'),
  A('lancia-da-cavaliere', 'Lancia da cavaliere', 'Lance', 'guerra', 'mischia', '1d10', 'perforanti', ['pesante', 'portata', 'due-mani'], 'rovesciare', 3, '10 mo', { nota: 'A due mani solo se non sei in sella.' }),
  A('spada-lunga', 'Spada lunga', 'Longsword', 'guerra', 'mischia', '1d8', 'taglienti', ['versatile'], 'fiaccare', 1.5, '15 mo', { versatile: '1d10' }),
  A('maglio', 'Maglio', 'Maul', 'guerra', 'mischia', '2d6', 'contundenti', ['pesante', 'due-mani'], 'rovesciare', 5, '10 mo'),
  A('morning-star', 'Morning star', 'Morningstar', 'guerra', 'mischia', '1d8', 'perforanti', [], 'fiaccare', 2, '15 mo'),
  A('picca', 'Picca', 'Pike', 'guerra', 'mischia', '1d10', 'perforanti', ['pesante', 'portata', 'due-mani'], 'spingere', 9, '5 mo'),
  A('stocco', 'Stocco', 'Rapier', 'guerra', 'mischia', '1d8', 'perforanti', ['accurata'], 'tormentare', 1, '25 mo'),
  A('scimitarra', 'Scimitarra', 'Scimitar', 'guerra', 'mischia', '1d6', 'taglienti', ['accurata', 'leggera'], 'colpo-extra', 1.5, '25 mo'),
  A('spada-corta', 'Spada corta', 'Shortsword', 'guerra', 'mischia', '1d6', 'perforanti', ['accurata', 'leggera'], 'tormentare', 1, '10 mo'),
  A('tridente', 'Tridente', 'Trident', 'guerra', 'mischia', '1d8', 'perforanti', ['lancio', 'versatile'], 'rovesciare', 2, '5 mo', { gittata: '6/18 m', versatile: '1d10' }),
  A('martello-da-guerra', 'Martello da guerra', 'Warhammer', 'guerra', 'mischia', '1d8', 'contundenti', ['versatile'], 'spingere', 2.5, '15 mo', { versatile: '1d10' }),
  A('piccone-da-guerra', 'Piccone da guerra', 'War Pick', 'guerra', 'mischia', '1d8', 'perforanti', ['versatile'], 'fiaccare', 1, '5 mo', { versatile: '1d10' }),
  A('frusta', 'Frusta', 'Whip', 'guerra', 'mischia', '1d4', 'taglienti', ['accurata', 'portata'], 'rallentare', 1.5, '2 mo'),
  // Da guerra a distanza
  A('cerbottana', 'Cerbottana', 'Blowgun', 'guerra', 'distanza', '1', 'perforanti', ['munizioni', 'ricarica'], 'tormentare', 0.5, '10 mo', { gittata: '7,5/30 m', munizione: 'aghi' }),
  A('balestra-a-mano', 'Balestra a mano', 'Hand Crossbow', 'guerra', 'distanza', '1d6', 'perforanti', ['munizioni', 'leggera', 'ricarica'], 'tormentare', 1.5, '75 mo', { gittata: '9/36 m', munizione: 'quadrelli' }),
  A('balestra-pesante', 'Balestra pesante', 'Heavy Crossbow', 'guerra', 'distanza', '1d10', 'perforanti', ['munizioni', 'pesante', 'ricarica', 'due-mani'], 'spingere', 9, '50 mo', { gittata: '30/120 m', munizione: 'quadrelli' }),
  A('arco-lungo', 'Arco lungo', 'Longbow', 'guerra', 'distanza', '1d8', 'perforanti', ['munizioni', 'pesante', 'due-mani'], 'rallentare', 1, '50 mo', { gittata: '45/180 m', munizione: 'frecce' }),
  A('moschetto', 'Moschetto', 'Musket', 'guerra', 'distanza', '1d12', 'perforanti', ['munizioni', 'ricarica', 'due-mani'], 'rallentare', 5, '500 mo', { gittata: '12/36 m', munizione: 'proiettili' }),
  A('pistola', 'Pistola', 'Pistol', 'guerra', 'distanza', '1d10', 'perforanti', ['munizioni', 'ricarica'], 'tormentare', 1.5, '250 mo', { gittata: '9/27 m', munizione: 'proiettili' }),
];
// Colpo senz'armi (2024): 1 + modificatore di Forza, contundenti. Non è un'arma ma si usa come tale.
export const COLPO_SENZ_ARMI = A('colpo-senz-armi', 'Colpo senz\'armi', 'Unarmed Strike', 'senzarmi', 'mischia', '1', 'contundenti', [], null, 0, '—',
  { nota: 'Invece dei danni puoi Afferrare o Spingere (TS FOR o DES, CD 8 + FOR + competenza).' });

export const CATEGORIE_ARMI = [
  ['semplice', 'mischia', 'Armi semplici da mischia'], ['semplice', 'distanza', 'Armi semplici a distanza'],
  ['guerra', 'mischia', 'Armi da guerra da mischia'], ['guerra', 'distanza', 'Armi da guerra a distanza'],
];

export const PROPRIETA_ARMI = {
  accurata: { nome: 'Accurata', en: 'Finesse', testo: 'Per colpire e per i danni usi a scelta Forza o Destrezza (la stessa per entrambi). L\'app usa da sola la migliore.' },
  leggera: { nome: 'Leggera', en: 'Light', testo: 'Dopo aver attaccato con un\'arma leggera puoi fare un attacco extra con un\'altra arma leggera usando l\'azione bonus: a quei danni non sommi il modificatore di caratteristica (se non è negativo).' },
  pesante: { nome: 'Pesante', en: 'Heavy', testo: 'Svantaggio ai tiri per colpire se hai Forza sotto 13 (arma da mischia) o Destrezza sotto 13 (arma a distanza).' },
  'due-mani': { nome: 'Due mani', en: 'Two-Handed', testo: 'Devi tenerla con due mani quando attacchi.' },
  versatile: { nome: 'Versatile', en: 'Versatile', testo: 'Puoi usarla a una o a due mani: a due mani fa il danno più alto.' },
  portata: { nome: 'Portata', en: 'Reach', testo: 'Aggiunge 1,5 m alla tua portata: attacchi fino a 3 m.' },
  lancio: { nome: 'Lancio', en: 'Thrown', testo: 'Puoi lanciarla per un attacco a distanza, usando la stessa caratteristica dell\'attacco in mischia.' },
  munizioni: { nome: 'Munizioni', en: 'Ammunition', testo: 'Ogni attacco consuma una munizione. Dopo lo scontro puoi recuperare metà di quelle usate.' },
  ricarica: { nome: 'Ricarica', en: 'Loading', testo: 'Con quest\'arma fai un solo attacco per azione, azione bonus o reazione, anche se potresti farne di più.' },
};

// Maestria nelle armi (2024): ogni arma ha una proprietà di maestria, usabile solo se la padroneggi.
export const MAESTRIE = {
  fendere: { nome: 'Fendere', en: 'Cleave', testo: 'Se colpisci una creatura con un attacco in mischia, puoi attaccare con la stessa arma una seconda creatura entro 1,5 m dalla prima e a tua portata. Se la colpisci subisce i danni dell\'arma senza il modificatore di caratteristica (a meno che sia negativo). Una volta per turno.' },
  sfiorare: { nome: 'Sfiorare', en: 'Graze', testo: 'Se manchi il bersaglio, subisce comunque danni pari al modificatore di caratteristica che hai usato per l\'attacco, dello stesso tipo dell\'arma.' },
  'colpo-extra': { nome: 'Colpo extra', en: 'Nick', testo: 'L\'attacco extra della proprietà Leggera lo fai dentro l\'azione di Attacco invece che con l\'azione bonus. Una volta per turno.' },
  spingere: { nome: 'Spingere', en: 'Push', testo: 'Se colpisci, puoi spingere la creatura fino a 3 m lontano da te in linea retta, se è di taglia Grande o inferiore.' },
  fiaccare: { nome: 'Fiaccare', en: 'Sap', testo: 'Se colpisci, la creatura ha svantaggio al suo prossimo tiro per colpire prima dell\'inizio del tuo prossimo turno.' },
  rallentare: { nome: 'Rallentare', en: 'Slow', testo: 'Se colpisci e fai danni, la velocità della creatura cala di 3 m fino all\'inizio del tuo prossimo turno (più colpi non si sommano).' },
  rovesciare: { nome: 'Rovesciare', en: 'Topple', testo: 'Se colpisci, la creatura fa un tiro salvezza su Costituzione (CD 8 + modificatore usato per l\'attacco + competenza) o cade Prona.' },
  tormentare: { nome: 'Tormentare', en: 'Vex', testo: 'Se colpisci e fai danni, hai vantaggio al tuo prossimo tiro per colpire contro quella creatura prima della fine del tuo prossimo turno.' },
};

// ───────────────────────── Armature ─────────────────────────
// base: CA; tipo: leggera (+DES), media (+DES max 2), pesante (niente DES), scudo (+2); forza: punteggio minimo; furtivita: svantaggio
const AR = (id, nome, en, tipo, base, forza, furtivita, peso, costo) => ({ id, nome, en, tipo, base, forza, furtivita, peso, costo });
export const ARMATURE = [
  AR('imbottita', 'Armatura imbottita', 'Padded', 'leggera', 11, 0, true, 4, '5 mo'),
  AR('cuoio', 'Armatura di cuoio', 'Leather', 'leggera', 11, 0, false, 5, '10 mo'),
  AR('cuoio-borchiato', 'Cuoio borchiato', 'Studded Leather', 'leggera', 12, 0, false, 6.5, '45 mo'),
  AR('pelle', 'Armatura di pelle', 'Hide', 'media', 12, 0, false, 6, '10 mo'),
  AR('giaco-di-maglia', 'Giaco di maglia', 'Chain Shirt', 'media', 13, 0, false, 10, '50 mo'),
  AR('corazza-di-scaglie', 'Corazza di scaglie', 'Scale Mail', 'media', 14, 0, true, 22.5, '50 mo'),
  AR('corazza', 'Corazza di piastre', 'Breastplate', 'media', 14, 0, false, 10, '400 mo'),
  AR('mezza-armatura', 'Mezza armatura', 'Half Plate', 'media', 15, 0, true, 20, '750 mo'),
  AR('cotta-ad-anelli', 'Cotta ad anelli', 'Ring Mail', 'pesante', 14, 0, true, 20, '30 mo'),
  AR('cotta-di-maglia', 'Cotta di maglia', 'Chain Mail', 'pesante', 16, 13, true, 27.5, '75 mo'),
  AR('armatura-a-strisce', 'Armatura a strisce', 'Splint', 'pesante', 17, 15, true, 30, '200 mo'),
  AR('armatura-completa', 'Armatura completa', 'Plate', 'pesante', 18, 15, true, 32.5, '1500 mo'),
  AR('scudo', 'Scudo', 'Shield', 'scudo', 2, 0, false, 3, '10 mo'),
];

// ───────────────────────── Talenti delle origini ─────────────────────────
// effetto: gestito dall'app (robusto: +2 PF per livello; allerta: +competenza all'iniziativa; fortunato: risorsa)
export const TALENTI_ORIGINE = {
  allerta: { nome: 'Allerta', en: 'Alert', testo: 'Aggiungi il bonus di competenza all\'iniziativa. Subito dopo averla tirata puoi scambiarla con quella di un alleato consenziente.' },
  artigiano: { nome: 'Artigiano', en: 'Crafter', testo: 'Competenza in 3 strumenti da artigiano, sconto del 20% sugli oggetti non magici e piccoli oggetti costruiti durante un riposo lungo.' },
  guaritore: { nome: 'Guaritore', en: 'Healer', testo: 'Con un kit da guaritore e un\'azione Usare, una creatura spende un dado vita e recupera PF pari al tiro + il tuo bonus di competenza. Quando tiri dadi per curare puoi ritirare gli 1.' },
  fortunato: { nome: 'Fortunato', en: 'Lucky', testo: 'Hai punti fortuna pari al bonus di competenza (riposo lungo): spendine uno per avere vantaggio a un tuo tiro d20 o per dare svantaggio a un tiro per colpire contro di te.' },
  'iniziato-alla-magia': { nome: 'Iniziato alla magia', en: 'Magic Initiate', testo: '2 trucchetti e 1 incantesimo di 1° livello dalla lista del Chierico, del Druido o del Mago. L\'incantesimo lo lanci gratis una volta per riposo lungo.' },
  musicista: { nome: 'Musicista', en: 'Musician', testo: 'Competenza in 3 strumenti musicali. Alla fine di un riposo suoni e dai Ispirazione eroica a tanti alleati quanto il tuo bonus di competenza.' },
  'attaccante-selvaggio': { nome: 'Attaccante selvaggio', en: 'Savage Attacker', testo: 'Una volta per turno, quando colpisci con un\'arma, tiri due volte i dadi dei danni e tieni il risultato migliore.' },
  abile: { nome: 'Abile', en: 'Skilled', testo: 'Competenza in 3 abilità o strumenti a tua scelta.' },
  rissaiolo: { nome: 'Rissaiolo', en: 'Tavern Brawler', testo: 'Il colpo senz\'armi fa 1d4 + FOR e ritiri gli 1 ai danni; competenza con le armi improvvisate; una volta per turno puoi spingere di 1,5 m chi colpisci senz\'armi.' },
  robusto: { nome: 'Robusto', en: 'Tough', testo: '+2 punti ferita massimi per ogni livello (l\'app li somma da sola quando sali di livello o ricalcoli i PF).' },
};

// ───────────────────────── Background ─────────────────────────
// car: le tre caratteristiche tra cui dividere +2/+1 o +1/+1/+1; abilita: competenze; talento: talento delle origini
const BG = (nome, en, car, abilita, talento, strumento) => ({ nome, en, car, abilita, talento, strumento });
export const BACKGROUND = [
  BG('Accolito', 'Acolyte', ['INT', 'SAG', 'CAR'], ['intuizione', 'religione'], 'iniziato-alla-magia', 'Strumenti da calligrafo'),
  BG('Artigiano', 'Artisan', ['FOR', 'DES', 'INT'], ['indagare', 'persuasione'], 'artigiano', 'Uno strumento da artigiano'),
  BG('Ciarlatano', 'Charlatan', ['DES', 'COS', 'CAR'], ['inganno', 'rapidita'], 'abile', 'Kit da falsario'),
  BG('Contadino', 'Farmer', ['FOR', 'COS', 'SAG'], ['addestrare', 'natura'], 'robusto', 'Attrezzi da falegname'),
  BG('Criminale', 'Criminal', ['DES', 'COS', 'INT'], ['rapidita', 'furtivita'], 'allerta', 'Arnesi da scasso'),
  BG('Eremita', 'Hermit', ['COS', 'SAG', 'CAR'], ['medicina', 'religione'], 'guaritore', 'Kit da erborista'),
  BG('Guardia', 'Guard', ['FOR', 'INT', 'SAG'], ['atletica', 'percezione'], 'allerta', 'Un set da gioco'),
  BG('Guida', 'Guide', ['DES', 'COS', 'SAG'], ['furtivita', 'sopravvivenza'], 'iniziato-alla-magia', 'Strumenti da cartografo'),
  BG('Intrattenitore', 'Entertainer', ['FOR', 'DES', 'CAR'], ['acrobazia', 'intrattenere'], 'musicista', 'Uno strumento musicale'),
  BG('Marinaio', 'Sailor', ['FOR', 'DES', 'SAG'], ['acrobazia', 'percezione'], 'rissaiolo', 'Strumenti da navigatore'),
  BG('Mercante', 'Merchant', ['COS', 'INT', 'CAR'], ['addestrare', 'persuasione'], 'fortunato', 'Strumenti da navigatore'),
  BG('Nobile', 'Noble', ['FOR', 'INT', 'CAR'], ['storia', 'persuasione'], 'abile', 'Un set da gioco'),
  BG('Sapiente', 'Sage', ['COS', 'INT', 'SAG'], ['arcano', 'storia'], 'iniziato-alla-magia', 'Strumenti da calligrafo'),
  BG('Scriba', 'Scribe', ['DES', 'INT', 'SAG'], ['indagare', 'percezione'], 'abile', 'Strumenti da calligrafo'),
  BG('Soldato', 'Soldier', ['FOR', 'DES', 'COS'], ['atletica', 'intimidire'], 'attaccante-selvaggio', 'Un set da gioco'),
  BG('Viandante', 'Wayfarer', ['DES', 'SAG', 'CAR'], ['intuizione', 'furtivita'], 'fortunato', 'Arnesi da scasso'),
];

// ───────────────────────── Specie ─────────────────────────
// risorse: max 'comp' = pari al bonus di competenza; daLivello = livello del personaggio da cui si ottiene
const T = (titolo, testo) => ({ titolo, testo });
export const SPECIE = {
  'Aasimar': { en: 'Aasimar', taglia: 'Media o Piccola', vel: 9, tratti: [
    T('Resistenza celestiale', 'Resistenza ai danni necrotici e radiosi.'),
    T('Scurovisione', 'Vedi al buio fino a 18 m.'),
    T('Mani guaritrici', 'Azione Magia: tocchi una creatura e tiri tanti d4 quanto il tuo bonus di competenza; recupera quei PF. Una volta per riposo lungo.'),
    T('Portatore di luce', 'Conosci il trucchetto Luce (usi il Carisma).'),
    T('Rivelazione celestiale', 'Dal 3° livello, azione bonus per 1 minuto (una volta per riposo lungo): Ali celesti, Radiosità interiore o Velo necrotico. Una volta per turno fai danni extra pari al bonus di competenza.')],
    risorse: [{ id: 'mani-guaritrici', nome: 'Mani guaritrici', max: 1, ricarica: 'lungo' }, { id: 'rivelazione-celestiale', nome: 'Rivelazione celestiale', max: 1, ricarica: 'lungo', daLivello: 3 }] },
  'Dragonide': { en: 'Dragonborn', taglia: 'Media', vel: 9, tratti: [
    T('Ascendenza draconica', 'Scegli un tipo di drago: decide il tipo di danno del soffio e della resistenza (es. rosso = fuoco, blu = fulmine, bianco = freddo, nero/ramato = acido, verde = veleno).'),
    T('Arma a soffio', 'Al posto di un attacco: cono di 4,5 m o linea di 9 m × 1,5 m. TS Destrezza (CD 8 + COS + competenza): 1d10 danni, 2d10 al 5° livello, 3d10 all\'11°, 4d10 al 17°; metà se riesce. Usi pari al bonus di competenza per riposo lungo.'),
    T('Resistenza ai danni', 'Resistenza al tipo di danno della tua ascendenza.'),
    T('Scurovisione', 'Vedi al buio fino a 18 m.'),
    T('Volo draconico', 'Dal 5° livello, azione bonus: ali spettrali per 10 minuti, velocità di volo pari alla velocità. Una volta per riposo lungo.')],
    risorse: [{ id: 'soffio', nome: 'Arma a soffio', max: 'comp', ricarica: 'lungo' }, { id: 'volo-draconico', nome: 'Volo draconico', max: 1, ricarica: 'lungo', daLivello: 5 }] },
  'Elfo': { en: 'Elf', taglia: 'Media', vel: 9, tratti: [
    T('Scurovisione', 'Vedi al buio fino a 18 m (36 m se sei Drow).'),
    T('Stirpe elfica', 'Drow: trucchetto Luci danzanti. Alto elfo: trucchetto Prestidigitazione. Elfo dei boschi: trucchetto Arte druidica e velocità 10,5 m. Altri incantesimi al 3° e al 5° livello.'),
    T('Ascendenza fatata', 'Vantaggio ai tiri salvezza per non essere affascinato.'),
    T('Sensi acuti', 'Competenza in Intuizione, Percezione o Sopravvivenza (a scelta).'),
    T('Trance', 'Completi un riposo lungo in 4 ore di trance, restando cosciente.')],
    risorse: [{ id: 'stirpe-elfica-3', nome: 'Stirpe elfica: incantesimo del 3° livello (gratis)', max: 1, ricarica: 'lungo', daLivello: 3 },
      { id: 'stirpe-elfica-5', nome: 'Stirpe elfica: incantesimo del 5° livello (gratis)', max: 1, ricarica: 'lungo', daLivello: 5 }] },
  'Gnomo': { en: 'Gnome', taglia: 'Piccola', vel: 9, tratti: [
    T('Scurovisione', 'Vedi al buio fino a 18 m.'),
    T('Astuzia gnomesca', 'Vantaggio ai tiri salvezza su Intelligenza, Saggezza e Carisma.'),
    T('Stirpe gnomesca', 'Gnomo delle foreste: Illusione minore e Parlare con gli animali (usi pari al bonus di competenza per riposo lungo). Gnomo delle rocce: Riparare, Prestidigitazione e piccoli congegni a orologeria.')], risorse: [] },
  'Goliath': { en: 'Goliath', taglia: 'Media', vel: 10.5, tratti: [
    T('Ascendenza gigante', 'Scegli un gigante: Balzo delle nuvole (teletrasporto di 9 m con azione bonus), Bruciatura del fuoco (+1d10 fuoco quando colpisci), Morso del gelo (+1d6 freddo e −3 m di velocità al bersaglio), Ruzzolone della collina (fai cadere Prono chi colpisci), Resistenza della pietra (reazione: riduci i danni di 1d12 + COS), Tuono della tempesta (reazione: 1d8 tuono a chi ti colpisce). Usi pari al bonus di competenza per riposo lungo.'),
    T('Forma grande', 'Dal 5° livello, azione bonus: diventi Grande per 10 minuti, vantaggio alle prove di Forza e +3 m di velocità. Una volta per riposo lungo.'),
    T('Corporatura possente', 'Vantaggio per liberarti da una presa; per il carico conti come una taglia più grande.')],
    risorse: [{ id: 'ascendenza-gigante', nome: 'Ascendenza gigante', max: 'comp', ricarica: 'lungo', alias: ['resistenza della pietra', 'balzo delle nuvole', 'bruciatura del fuoco', 'morso del gelo', 'ruzzolone della collina', 'tuono della tempesta'] },
      { id: 'forma-grande', nome: 'Forma grande', max: 1, ricarica: 'lungo', daLivello: 5 }] },
  'Halfling': { en: 'Halfling', taglia: 'Piccola', vel: 9, tratti: [
    T('Coraggioso', 'Vantaggio ai tiri salvezza per non essere spaventato.'),
    T('Agilità halfling', 'Puoi passare nello spazio di una creatura più grande di te.'),
    T('Fortuna', 'Quando fai 1 al d20 in un tiro d20, puoi ritirarlo e devi usare il nuovo risultato.'),
    T('Furtività naturale', 'Puoi nasconderti anche dietro una creatura più grande di te.')], risorse: [] },
  'Nano': { en: 'Dwarf', taglia: 'Media', vel: 9, tratti: [
    T('Scurovisione', 'Vedi al buio fino a 36 m.'),
    T('Resilienza nanica', 'Resistenza ai danni da veleno e vantaggio ai tiri salvezza per non essere avvelenato.'),
    T('Robustezza nanica', '+1 punto ferita massimo per ogni livello (l\'app lo somma da sola).'),
    T('Conoscenza della pietra', 'Azione bonus, stando su una superficie di pietra: percezione tellurica fino a 18 m per 10 minuti. Usi pari al bonus di competenza per riposo lungo.')],
    risorse: [{ id: 'conoscenza-pietra', nome: 'Conoscenza della pietra', max: 'comp', ricarica: 'lungo' }] },
  'Orco': { en: 'Orc', taglia: 'Media', vel: 9, tratti: [
    T('Scatto di adrenalina', 'Azione bonus: fai lo Scatto e ottieni PF temporanei pari al bonus di competenza. Usi pari al bonus di competenza per riposo breve o lungo.'),
    T('Scurovisione', 'Vedi al buio fino a 36 m.'),
    T('Tenacia implacabile', 'Quando scendi a 0 PF senza morire, resti invece a 1 PF. Una volta per riposo lungo.')],
    risorse: [{ id: 'adrenalina', nome: 'Scatto di adrenalina', max: 'comp', ricarica: 'breve' }, { id: 'tenacia', nome: 'Tenacia implacabile', max: 1, ricarica: 'lungo' }] },
  'Tiefling': { en: 'Tiefling', taglia: 'Media o Piccola', vel: 9, tratti: [
    T('Scurovisione', 'Vedi al buio fino a 18 m.'),
    T('Retaggio immondo', 'Abissale: resistenza al veleno e trucchetto Spruzzo velenoso. Ctonio: resistenza necrotica e Tocco gelido. Infernale: resistenza al fuoco e Dardo di fuoco. Altri incantesimi al 3° e al 5° livello.'),
    T('Presenza ultraterrena', 'Conosci il trucchetto Taumaturgia.')],
    risorse: [{ id: 'retaggio-immondo-3', nome: 'Retaggio immondo: incantesimo del 3° livello (gratis)', max: 1, ricarica: 'lungo', daLivello: 3 },
      { id: 'retaggio-immondo-5', nome: 'Retaggio immondo: incantesimo del 5° livello (gratis)', max: 1, ricarica: 'lungo', daLivello: 5 }] },
  'Umano': { en: 'Human', taglia: 'Media o Piccola', vel: 9, tratti: [
    T('Intraprendente', 'Ottieni Ispirazione eroica ogni volta che finisci un riposo lungo.'),
    T('Abile', 'Competenza in un\'abilità a tua scelta.'),
    T('Versatile', 'Ottieni un talento delle origini a tua scelta (es. Abile).')], risorse: [] },
};

// ───────────────────────── Classi: dati 2024 per livello ─────────────────────────
const perLivello = (soglie, l) => { let v = 0; for (const [liv, n] of soglie) if (l >= liv) v = n; return v; };

// Competenze della classe (quando è la classe iniziale) e cosa si ottiene entrando in multiclasse
export const COMPETENZE_CLASSE = {
  Barbaro: { armi: 'guerra', armature: ['leggera', 'media', 'scudo'], testo: 'Armi semplici e da guerra; armature leggere e medie; scudi.', multi: { armi: 'guerra', armature: ['scudo'] } },
  Bardo: { armi: 'semplice', armature: ['leggera'], testo: 'Armi semplici; armature leggere; 3 strumenti musicali.', multi: { armature: ['leggera'] } },
  Chierico: { armi: 'semplice', armature: ['leggera', 'media', 'scudo'], testo: 'Armi semplici; armature leggere e medie; scudi.', multi: { armature: ['leggera', 'media', 'scudo'] } },
  Druido: { armi: 'semplice', armature: ['leggera', 'scudo'], testo: 'Armi semplici; armature leggere; scudi; kit da erborista.', multi: { armature: ['leggera', 'scudo'] } },
  Guerriero: { armi: 'guerra', armature: ['leggera', 'media', 'pesante', 'scudo'], testo: 'Armi semplici e da guerra; tutte le armature; scudi.', multi: { armi: 'guerra', armature: ['leggera', 'media', 'scudo'] } },
  Ladro: { armi: 'ladro', armature: ['leggera'], testo: 'Armi semplici e armi da guerra accurate o leggere; armature leggere; arnesi da scasso.', multi: { armature: ['leggera'] } },
  Mago: { armi: 'semplice', armature: [], testo: 'Armi semplici.', multi: {} },
  Monaco: { armi: 'monaco', armature: [], testo: 'Armi semplici e armi da guerra leggere; uno strumento da artigiano o musicale.', multi: {} },
  Paladino: { armi: 'guerra', armature: ['leggera', 'media', 'pesante', 'scudo'], testo: 'Armi semplici e da guerra; tutte le armature; scudi.', multi: { armi: 'guerra', armature: ['leggera', 'media', 'scudo'] } },
  Ranger: { armi: 'guerra', armature: ['leggera', 'media', 'scudo'], testo: 'Armi semplici e da guerra; armature leggere e medie; scudi.', multi: { armi: 'guerra', armature: ['leggera', 'media', 'scudo'] } },
  Stregone: { armi: 'semplice', armature: [], testo: 'Armi semplici.', multi: {} },
  Warlock: { armi: 'semplice', armature: ['leggera'], testo: 'Armi semplici; armature leggere.', multi: { armature: ['leggera'] } },
};

// Numero di tipi di arma di cui si usa la maestria (0 = la classe non ha Maestria nelle armi)
export function maestrieClasse(classe, l) {
  switch (classe) {
    case 'Barbaro': return perLivello([[1, 2], [4, 3], [10, 4]], l);
    case 'Guerriero': return perLivello([[1, 3], [4, 4], [10, 5], [16, 6]], l);
    case 'Paladino': case 'Ranger': case 'Ladro': return 2;
    default: return 0;
  }
}

// Numero di attacchi con l'azione di Attacco
export function attacchiPerAzione(classe, l) {
  if (classe === 'Guerriero') return perLivello([[1, 1], [5, 2], [11, 3], [20, 4]], l);
  if (['Barbaro', 'Monaco', 'Paladino', 'Ranger'].includes(classe)) return l >= 5 ? 2 : 1;
  return 1;
}

// Privilegi da mostrare in Combattimento con un dado da tirare
export function privilegiCombattimento(classe, l, pg) {
  const out = [];
  if (classe === 'Ladro') out.push({ nome: 'Attacco furtivo', dadi: `${Math.ceil(l / 2)}d6`, testo: 'Una volta per turno, con un\'arma accurata o a distanza, se hai vantaggio o un alleato è entro 1,5 m dal bersaglio.' });
  if (classe === 'Barbaro') out.push({ nome: 'Danni da ira', fisso: perLivello([[1, 2], [9, 3], [16, 4]], l), testo: 'Mentre sei in ira, sommali ai danni degli attacchi che usano la Forza.' });
  if (classe === 'Monaco') out.push({ nome: 'Arti marziali', dadi: '1' + perLivello([[1, 'd6'], [5, 'd8'], [11, 'd10'], [17, 'd12']], l), testo: 'Dado dei colpi senz\'armi e delle armi da monaco (puoi usare la Destrezza).' });
  if (classe === 'Bardo') out.push({ nome: 'Ispirazione bardica', dadi: '1' + perLivello([[1, 'd6'], [5, 'd8'], [10, 'd10'], [15, 'd12']], l), testo: 'Il dado che dai a un alleato: lo aggiunge a un suo tiro d20.' });
  if (classe === 'Ranger') out.push({ nome: 'Marchio del cacciatore', dadi: l >= 20 ? '1d10' : '1d6', testo: 'Danni extra (forza) quando colpisci il bersaglio marchiato.' });
  if (classe === 'Paladino' && l >= 11) out.push({ nome: 'Colpi radiosi', dadi: '1d8', testo: 'Quando colpisci con un\'arma da mischia o un colpo senz\'armi: +1d8 radiosi.' });
  if (classe === 'Guerriero' && l >= 9) out.push({ nome: 'Indomito', fisso: l, testo: `Se fallisci un tiro salvezza puoi ritirarlo con +${l} (il tuo livello da guerriero) e devi tenere il nuovo risultato. Gli usi sono tra le Risorse.` });
  return out;
}

// Risorse di classe per livello (regole 2024). ricarica: breve | breve1 (1 al breve, tutte al lungo) | lungo
// alias: vecchi id o nomi con cui la risorsa può già esistere nella scheda (per non creare doppioni)
export function risorseClasse(classe, l, pg) {
  const mod = (c) => Math.floor(((Number(pg.car?.[c]) || 10) - 10) / 2);
  const r = [];
  const add = (id, nome, max, ricarica, alias = []) => max > 0 && r.push({ id, nome, max, ricarica, alias });
  switch (classe) {
    case 'Barbaro': add('ira', 'Ira', perLivello([[1, 2], [3, 3], [6, 4], [12, 5], [17, 6]], l), 'breve1'); break;
    case 'Bardo': add('ispirazione', 'Ispirazione bardica', Math.max(1, mod('CAR')), l >= 5 ? 'breve' : 'lungo'); break;
    case 'Chierico':
      add('canalizzare', 'Incanalare divinità', perLivello([[2, 2], [6, 3], [18, 4]], l), 'breve1');
      add('intervento-divino', 'Intervento divino', l >= 10 ? 1 : 0, 'lungo'); break;
    case 'Druido': add('forma-selvatica', 'Forma selvatica', perLivello([[2, 2], [6, 3], [17, 4]], l), 'breve1'); break;
    case 'Guerriero':
      add('secondo-fiato', 'Secondo fiato', perLivello([[1, 2], [4, 3], [10, 4]], l), 'breve1', ['recupero', 'recuperare energie']);
      add('azione-impetuosa', 'Azione impetuosa', perLivello([[2, 1], [17, 2]], l), 'breve');
      add('indomito', 'Indomito', perLivello([[9, 1], [13, 2], [17, 3]], l), 'lungo'); break;
    case 'Monaco':
      add('focus', 'Punti concentrazione', l >= 2 ? l : 0, 'breve', ['ki', 'punti ki']);
      add('metabolismo', 'Metabolismo straordinario', l >= 2 ? 1 : 0, 'lungo'); break;
    case 'Paladino':
      add('imposizione', 'Imposizione delle mani (PF)', 5 * l, 'lungo');
      add('canalizzare', 'Incanalare divinità', perLivello([[3, 2], [11, 3]], l), 'breve1');
      add('punizione-paladino', 'Punizione del paladino (Punizione divina gratis)', l >= 2 ? 1 : 0, 'lungo');
      add('destriero-fedele', 'Destriero fedele (Trova destriero gratis)', l >= 5 ? 1 : 0, 'lungo'); break;
    case 'Ranger':
      add('nemico-prescelto', 'Nemico prescelto (Marchio del cacciatore gratis)', perLivello([[1, 2], [5, 3], [9, 4], [13, 5], [17, 6]], l), 'lungo');
      add('instancabile', 'Instancabile (1d8 + SAG PF temporanei)', l >= 10 ? Math.max(1, mod('SAG')) : 0, 'lungo');
      add('velo-natura', 'Velo della natura', l >= 14 ? Math.max(1, mod('SAG')) : 0, 'lungo'); break;
    case 'Ladro': add('colpo-di-fortuna', 'Colpo di fortuna', l >= 20 ? 1 : 0, 'breve'); break;
    case 'Stregone':
      add('stregoneria', 'Punti stregoneria', l >= 2 ? l : 0, 'lungo');
      add('stregoneria-innata', 'Stregoneria innata', 2, 'lungo');
      add('recupero-stregonesco', 'Recupero stregonesco', l >= 5 ? 1 : 0, 'lungo'); break;
    case 'Warlock':
      add('astuzia-magica', 'Astuzia magica', l >= 2 ? 1 : 0, 'lungo');
      add('contattare-patrono', 'Contattare il patrono', l >= 9 ? 1 : 0, 'lungo');
      [[11, 6], [13, 7], [15, 8], [17, 9]].forEach(([da, liv]) => add(`arcano-mistico-${liv}`, `Arcano mistico (${liv}° livello)`, l >= da ? 1 : 0, 'lungo')); break;
    case 'Mago': add('recupero-arcano', 'Recupero arcano', 1, 'lungo'); break;
  }
  return r;
}

// Incantesimi preparati e trucchetti conosciuti per livello di classe (tabelle 2024)
const PREP_A = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22];
const PREP_MEZZI = [2, 3, 4, 5, 6, 6, 7, 7, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15];
export const PREPARATI = {
  Bardo: PREP_A, Chierico: PREP_A, Druido: PREP_A,
  Paladino: PREP_MEZZI, Ranger: PREP_MEZZI,
  Stregone: [2, 4, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22],
  Warlock: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
  Mago: [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 18, 19, 21, 22, 23, 24, 25],
};
export function trucchettiClasse(classe, l) {
  const base = { Bardo: 2, Chierico: 3, Druido: 2, Stregone: 4, Warlock: 2, Mago: 3 }[classe];
  return base ? base + (l >= 4 ? 1 : 0) + (l >= 10 ? 1 : 0) : 0;
}

// ───────────────────────── Acquisto a punti (capitolo 2) ─────────────────────────
// 27 punti da spendere; ogni punteggio parte da 8 e arriva al massimo a 15 (prima degli aumenti del background)
export const COSTO_PUNTI = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
export const PUNTI_DISPONIBILI = 27;

// Caratteristiche principali di ogni classe: per il multiclasse serve almeno 13 in quelle della classe nuova
// e di quelle che hai già (per il Guerriero basta Forza O Destrezza)
export const CARATTERISTICHE_PRINCIPALI = {
  Barbaro: ['FOR'], Bardo: ['CAR'], Chierico: ['SAG'], Druido: ['SAG'], Guerriero: ['FOR|DES'], Ladro: ['DES'],
  Mago: ['INT'], Monaco: ['DES', 'SAG'], Paladino: ['FOR', 'CAR'], Ranger: ['DES', 'SAG'], Stregone: ['CAR'], Warlock: ['CAR'],
};

// ───────────────────────── Privilegi di classe per livello (tabelle del Manuale del Giocatore 2024) ─────────────────────────
// Un elenco per classe con i 20 livelli; ASI = Aumento dei punteggi di caratteristica, SUB = privilegio della sottoclasse, EPICO = Dono epico
const ASI = 'Aumento dei punteggi di caratteristica (o un altro talento)';
const SUB = 'Privilegio della sottoclasse';
const EPICO = 'Dono epico (un talento epico)';
export const PRIVILEGI_LIVELLO = {
  Barbaro: [['Ira', 'Difesa senza armatura', 'Maestria nelle armi'], ['Percezione del pericolo', 'Attacco irruento'], ['Sottoclasse del barbaro', 'Conoscenza primordiale'], [ASI],
    ['Attacco extra', 'Movimento veloce'], [SUB], ['Istinto ferino', 'Balzo istintivo'], [ASI], ['Colpo brutale'], [SUB], ['Ira implacabile'], [ASI],
    ['Colpo brutale migliorato'], [SUB], ['Ira persistente'], [ASI], ['Colpo brutale migliorato'], ['Potenza indomabile'], [EPICO], ['Campione primordiale']],
  Bardo: [['Ispirazione bardica', 'Incantesimi'], ['Maestria (competenza doppia in 2 abilità)', 'Tuttofare'], ['Sottoclasse del bardo'], [ASI], ['Fonte di ispirazione'], [SUB],
    ['Controfascino'], [ASI], ['Maestria (altre 2 abilità)'], ['Segreti magici'], [], [ASI], [], [SUB], [], [ASI], [], ['Ispirazione superiore'], [EPICO], ['Parole della creazione']],
  Chierico: [['Incantesimi', 'Ordine divino'], ['Incanalare divinità'], ['Sottoclasse del chierico'], [ASI], ['Bruciare non morti'], [SUB], ['Colpi benedetti'], [ASI], [],
    ['Intervento divino'], [], [ASI], [], ['Colpi benedetti migliorati'], [], [ASI], [SUB], [], [EPICO], ['Intervento divino superiore']],
  Druido: [['Incantesimi', 'Druidico', 'Ordine primordiale'], ['Forma selvatica', 'Compagno selvatico'], ['Sottoclasse del druido'], [ASI], ['Rinascita selvatica'], [SUB],
    ['Furia elementale'], [ASI], [], [SUB], [], [ASI], [], [SUB], ['Furia elementale migliorata'], [ASI], [], ['Incantesimi bestiali'], [EPICO], ['Arcidruido']],
  Guerriero: [['Stile di combattimento', 'Secondo fiato', 'Maestria nelle armi'], ['Azione impetuosa (un uso)', 'Mente tattica'], ['Sottoclasse del guerriero'], [ASI],
    ['Attacco extra', 'Spostamento tattico'], [ASI], [SUB], [ASI], ['Indomito (un uso)', 'Maestro tattico'], [SUB], ['Due attacchi extra'], [ASI],
    ['Indomito (due usi)', 'Attacchi studiati'], [ASI], [SUB], [ASI], ['Azione impetuosa (due usi)', 'Indomito (tre usi)'], [SUB], [EPICO], ['Tre attacchi extra']],
  Ladro: [['Maestria (competenza doppia in 2 abilità)', 'Attacco furtivo', 'Gergo dei ladri', 'Maestria nelle armi'], ['Azione scaltra'], ['Sottoclasse del ladro', 'Mira ferma'], [ASI],
    ['Colpo astuto', 'Schivata prodigiosa'], ['Maestria (altre 2 abilità)'], ['Elusione', 'Talento affidabile'], [ASI], [SUB], [ASI], ['Colpo astuto migliorato'], [ASI],
    [SUB], ['Colpi subdoli'], ['Mente sfuggente'], [ASI], [SUB], ['Inafferrabile'], [EPICO], ['Colpo di fortuna']],
  Mago: [['Incantesimi', 'Esperto di rituali', 'Recupero arcano'], ['Studioso'], ['Sottoclasse del mago'], [ASI], ['Memorizzare un incantesimo'], [SUB], [], [ASI], [], [SUB],
    [], [ASI], [], [SUB], [], [ASI], [], ['Padronanza degli incantesimi'], [EPICO], ['Incantesimi distintivi']],
  Monaco: [['Arti marziali', 'Difesa senza armatura'], ['Concentrazione del monaco', 'Movimento senza armatura', 'Metabolismo straordinario'], ['Deviare attacchi', 'Sottoclasse del monaco'],
    [ASI, 'Caduta lenta'], ['Attacco extra', 'Colpo stordente'], ['Colpi potenziati', SUB], ['Elusione'], [ASI], ['Movimento acrobatico'], ['Concentrazione accresciuta', 'Autoguarigione'],
    [SUB], [ASI], ['Deviare energia'], ['Sopravvissuto disciplinato'], ['Concentrazione perfetta'], [ASI], [SUB], ['Difesa superiore'], [EPICO], ['Corpo e mente']],
  Paladino: [['Imposizione delle mani', 'Incantesimi', 'Maestria nelle armi'], ['Stile di combattimento', 'Punizione del paladino'], ['Incanalare divinità', 'Sottoclasse del paladino'], [ASI],
    ['Attacco extra', 'Destriero fedele'], ['Aura di protezione'], [SUB], [ASI], ['Abiurare i nemici'], ['Aura di coraggio'], ['Colpi radiosi'], [ASI], [], ['Tocco ristoratore'],
    [SUB], [ASI], [], ['Espansione dell\'aura'], [EPICO], [SUB]],
  Ranger: [['Incantesimi', 'Nemico prescelto', 'Maestria nelle armi'], ['Esploratore abile', 'Stile di combattimento'], ['Sottoclasse del ranger'], [ASI], ['Attacco extra'], ['Girovago'],
    [SUB], [ASI], ['Maestria (competenza doppia in 2 abilità)'], ['Instancabile'], [SUB], [ASI], ['Cacciatore implacabile'], ['Velo della natura'], [SUB], [ASI],
    ['Cacciatore preciso'], ['Sensi ferini'], [EPICO], ['Sterminatore di nemici']],
  Stregone: [['Incantesimi', 'Stregoneria innata'], ['Fonte di magia', 'Metamagia'], ['Sottoclasse dello stregone'], [ASI], ['Recupero stregonesco'], [SUB], ['Stregoneria incarnata'],
    [ASI], [], ['Metamagia (altre opzioni)'], [], [ASI], [], [SUB], [], [ASI], ['Metamagia (altre opzioni)'], [SUB], [EPICO], ['Apoteosi arcana']],
  Warlock: [['Suppliche occulte', 'Magia del patto'], ['Astuzia magica'], ['Sottoclasse del warlock'], [ASI], [], [SUB], [], [ASI], ['Contattare il patrono'], [SUB],
    ['Arcano mistico (incantesimo di 6° livello)'], [ASI], ['Arcano mistico (incantesimo di 7° livello)'], [SUB], ['Arcano mistico (incantesimo di 8° livello)'], [ASI],
    ['Arcano mistico (incantesimo di 9° livello)'], [], [EPICO], ['Maestro dell\'occulto']],
};
// Privilegi che si ottengono a un certo livello di una classe
export const privilegiAlLivello = (classe, l) => PRIVILEGI_LIVELLO[classe]?.[l - 1] || [];

// ───────────────────────── Sfinimento e condizioni (2024) ─────────────────────────
export const SFINIMENTO_2024 = 'Ogni livello: −2 a tutti i tiri d20 (prove, tiri per colpire, tiri salvezza) e −1,5 m di velocità. Al 6° livello muori. Un riposo lungo toglie un livello.';

// Effetti delle condizioni usati dall'app per gli avvisi e i calcoli
export const EFFETTI_CONDIZIONI = {
  accecato: { svantaggioAttacchi: true },
  afferrato: { velocitaZero: true, nota: 'Svantaggio agli attacchi contro chi non ti sta afferrando.' },
  avvelenato: { svantaggioAttacchi: true, svantaggioProve: true },
  intralciato: { velocitaZero: true, svantaggioAttacchi: true, nota: 'Svantaggio ai tiri salvezza su Destrezza.' },
  paralizzato: { velocitaZero: true, falliscoFD: true, incapacitato: true },
  pietrificato: { velocitaZero: true, falliscoFD: true, incapacitato: true },
  privo: { velocitaZero: true, falliscoFD: true, incapacitato: true },
  prono: { svantaggioAttacchi: true, nota: 'Puoi solo strisciare o spendere metà del movimento per rialzarti.' },
  spaventato: { svantaggioAttacchi: true, svantaggioProve: true, nota: 'Solo finché vedi la fonte della paura.' },
  stordito: { falliscoFD: true, incapacitato: true },
  incapacitato: { incapacitato: true },
};
