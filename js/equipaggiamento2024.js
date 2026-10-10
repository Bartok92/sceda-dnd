// Equipaggiamento del Manuale del Giocatore 2024 (capitolo 6): equipaggiamento d'avventura, munizioni, focus da
// incantatore, alcuni attrezzi ed equipaggiamento iniziale delle classi (opzione A).
// Pesi in kg (1 libbra = 0,5 kg, come nel manuale italiano); costi in mo (oro), ma (argento), mr (rame).
// Le descrizioni sono riassunti in italiano scritti per l'app, non il testo del manuale.
// usa: { cura: '2d4+2' } = l'oggetto si può usare dallo zaino e cura chi lo usa (si consuma 1 unità).

const E = (id, nome, en, peso, costo, cat, descr = '', extra = {}) => ({ id, nome, en, peso, costo, cat, descr, ...extra });

export const CATEGORIE_EQUIP = [
  ['consumabili', 'Pozioni, veleni e lanci'], ['dotazioni', 'Dotazioni (pacchetti)'], ['luce', 'Luce e fuoco'],
  ['munizioni', 'Munizioni'], ['focus', 'Focus da incantatore'], ['attrezzi', 'Attrezzi e strumenti'], ['vari', 'Altro equipaggiamento'],
];

const LANCIO = (danni, extra = '') => `Con l'azione di Attacco puoi sostituire un attacco lanciandolo contro una creatura o un oggetto entro 6 m: il bersaglio fa un TS su Destrezza (CD 8 + tuo DES + competenza) o subisce ${danni}.${extra}`;

export const EQUIPAGGIAMENTO = [
  // ── Pozioni, veleni e oggetti da lancio
  E('pozione-guarigione', 'Pozione di guarigione', 'Potion of Healing', 0.25, '50 mo', 'consumabili', 'Oggetto magico. Con un\'azione bonus la bevi o la fai bere a una creatura entro 1,5 m: recupera 2d4 + 2 PF.', { usa: { cura: '2d4+2' } }),
  E('acido', 'Acido (fiala)', 'Acid', 0.5, '25 mo', 'consumabili', LANCIO('2d6 danni da acido')),
  E('fuoco-alchimista', 'Fuoco dell\'alchimista (fiasca)', 'Alchemist\'s Fire', 0.5, '50 mo', 'consumabili', LANCIO('1d4 danni da fuoco', ' Se fallisce inizia anche a bruciare (vedi il glossario delle regole).')),
  E('acqua-santa', 'Acqua santa (fiasca)', 'Holy Water', 0.5, '25 mo', 'consumabili', LANCIO('2d8 danni radiosi', ' Funziona solo contro immondi e non morti.')),
  E('antitossina', 'Antitossina (fiala)', 'Antitoxin', 0, '50 mo', 'consumabili', 'Con un\'azione bonus la bevi: per 1 ora hai vantaggio ai TS per evitare o terminare la condizione Avvelenato.'),
  E('veleno-base', 'Veleno base (fiala)', 'Poison, Basic', 0, '100 mo', 'consumabili', 'Con un\'azione bonus ricopri un\'arma o fino a 3 munizioni: chi subisce danni perforanti o taglienti da quell\'arma subisce anche 1d4 danni da veleno. Dura 1 minuto o finché non infligge il danno.'),
  E('olio', 'Olio (fiasca)', 'Oil', 0.5, '1 ma', 'consumabili', 'Lanciato (al posto di un attacco, entro 6 m, TS su Destrezza CD 8 + DES + competenza) copre il bersaglio: se subisce danni da fuoco entro 1 minuto, subisce 5 danni da fuoco in più. Versato a terra (quadrato di 1,5 m) e acceso brucia per 2 round: 5 danni da fuoco a chi entra o finisce il turno lì. Come combustibile dura 6 ore in lampade e lanterne.'),
  E('rete', 'Rete', 'Net', 1.5, '1 mo', 'consumabili', 'Al posto di un attacco la lanci contro una creatura entro 4,5 m: TS su Destrezza (CD 8 + DES + competenza) o è Intralciata finché non si libera (azione, prova di Forza (Atletica) CD 10, anche di chi è entro 1,5 m). Le creature Enormi o più grandi la evitano. La rete ha CA 10 e 5 PF.'),
  E('triboli', 'Triboli (sacchetto)', 'Caltrops', 1, '1 mo', 'consumabili', 'Con l\'azione Utilizzare li spargi in un quadrato di 1,5 m entro 1,5 m da te: chi ci entra per la prima volta in un turno fa un TS su Destrezza CD 15 o subisce 1 danno perforante e ha velocità 0 fino all\'inizio del suo turno. Raccoglierli richiede 10 minuti.'),
  E('biglie', 'Biglie (sacchetto)', 'Ball Bearings', 1, '1 mo', 'consumabili', 'Con l\'azione Utilizzare le spargi in un quadrato di 3 m entro 3 m da te: chi ci entra per la prima volta in un turno fa un TS su Destrezza CD 10 o cade Prono. Raccoglierle richiede 10 minuti.'),
  E('pergamena-trucchetto', 'Pergamena magica (trucchetto)', 'Spell Scroll (Cantrip)', 0, '30 mo', 'consumabili', 'Oggetto magico con un trucchetto. Se è nella lista della tua classe puoi leggerla e lanciarlo senza componenti materiali; CD 15 e attacco +5. Poi si sbriciola.'),
  E('pergamena-1', 'Pergamena magica (1° livello)', 'Spell Scroll (Level 1)', 0, '50 mo', 'consumabili', 'Oggetto magico con un incantesimo di 1° livello. Se è nella lista della tua classe puoi leggerla e lanciarlo senza componenti materiali; CD 15 e attacco +5. Poi si sbriciola.'),
  E('razioni', 'Razioni (1 giorno)', 'Rations', 1, '5 ma', 'consumabili', 'Cibo da viaggio per un giorno (carne secca, frutta secca, gallette, noci).'),
  // ── Dotazioni
  E('dot-scassinatore', 'Dotazione da scassinatore', 'Burglar\'s Pack', 21, '16 mo', 'dotazioni', 'Contiene: zaino, biglie, campanella, 10 candele, piede di porco, lanterna schermabile, 7 fiasche d\'olio, 5 giorni di razioni, corda, acciarino e otre.'),
  E('dot-diplomatico', 'Dotazione da diplomatico', 'Diplomat\'s Pack', 19.5, '39 mo', 'dotazioni', 'Contiene: forziere, abiti pregiati, inchiostro, 5 pennini, lampada, 2 custodie per mappe o pergamene, 4 fiasche d\'olio, 5 fogli di carta, 5 fogli di pergamena, profumo e acciarino.'),
  E('dot-dungeon', 'Dotazione da esploratore di dungeon', 'Dungeoneer\'s Pack', 27.5, '12 mo', 'dotazioni', 'Contiene: zaino, triboli, piede di porco, 2 fiasche d\'olio, 10 giorni di razioni, corda, acciarino, 10 torce e otre.'),
  E('dot-intrattenitore', 'Dotazione da intrattenitore', 'Entertainer\'s Pack', 29.25, '40 mo', 'dotazioni', 'Contiene: zaino, giaciglio, campanella, lanterna a lente sporgente, 3 costumi, specchio, 8 fiasche d\'olio, 9 giorni di razioni, acciarino e otre.'),
  E('dot-esploratore', 'Dotazione da esploratore', 'Explorer\'s Pack', 27.5, '10 mo', 'dotazioni', 'Contiene: zaino, giaciglio, 2 fiasche d\'olio, 10 giorni di razioni, corda, acciarino, 10 torce e otre.'),
  E('dot-sacerdote', 'Dotazione da sacerdote', 'Priest\'s Pack', 14.5, '33 mo', 'dotazioni', 'Contiene: zaino, coperta, acqua santa, lampada, 7 giorni di razioni, veste e acciarino.'),
  E('dot-studioso', 'Dotazione da studioso', 'Scholar\'s Pack', 11, '40 mo', 'dotazioni', 'Contiene: zaino, libro, inchiostro, pennino, lampada, 10 fiasche d\'olio, 10 fogli di pergamena e acciarino.'),
  // ── Luce e fuoco
  E('torcia', 'Torcia', 'Torch', 0.5, '1 mr', 'luce', 'Brucia per 1 ora: luce intensa entro 6 m e fioca per altri 6 m. Puoi usarla come arma semplice da mischia: 1 danno da fuoco.'),
  E('candela', 'Candela', 'Candle', 0, '1 mr', 'luce', 'Per 1 ora: luce intensa entro 1,5 m e fioca per altri 1,5 m.'),
  E('lampada', 'Lampada', 'Lamp', 0.5, '5 ma', 'luce', 'Brucia olio: luce intensa entro 4,5 m e fioca per altri 9 m.'),
  E('lanterna-lente', 'Lanterna a lente sporgente', 'Lantern, Bullseye', 1, '10 mo', 'luce', 'Brucia olio: luce intensa in un cono di 18 m e fioca per altri 18 m.'),
  E('lanterna-schermabile', 'Lanterna schermabile', 'Lantern, Hooded', 1, '5 mo', 'luce', 'Brucia olio: luce intensa entro 9 m e fioca per altri 9 m. Con un\'azione bonus abbassi lo schermo (solo luce fioca entro 1,5 m) o lo rialzi.'),
  E('acciarino', 'Acciarino', 'Tinderbox', 0.5, '5 ma', 'luce', 'Accendere una candela, una lampada, una lanterna o una torcia richiede un\'azione bonus; qualsiasi altro fuoco 1 minuto.'),
  // ── Munizioni (quantità di una confezione)
  E('frecce', 'Frecce (20)', 'Arrows', 0.5, '1 mo', 'munizioni', '20 frecce per archi. Si tengono in una faretra.', { qta: 20, pesoTot: true }),
  E('quadrelli', 'Quadrelli (20)', 'Bolts', 0.75, '1 mo', 'munizioni', '20 quadrelli per balestre. Si tengono in una custodia.', { qta: 20, pesoTot: true }),
  E('proiettili-fionda', 'Proiettili per fionda (20)', 'Bullets, Sling', 0.75, '4 mr', 'munizioni', '20 proiettili per fionda. Si tengono in una borsa.', { qta: 20, pesoTot: true }),
  E('proiettili-arma-fuoco', 'Proiettili per armi da fuoco (10)', 'Bullets, Firearm', 1, '3 mo', 'munizioni', '10 proiettili per armi da fuoco. Si tengono in una borsa.', { qta: 10, pesoTot: true }),
  E('aghi', 'Aghi per cerbottana (50)', 'Needles', 0.5, '1 mo', 'munizioni', '50 aghi per cerbottana. Si tengono in una borsa.', { qta: 50, pesoTot: true }),
  E('faretra', 'Faretra', 'Quiver', 0.5, '1 mo', 'munizioni', 'Contiene fino a 20 frecce.'),
  E('custodia-quadrelli', 'Custodia per quadrelli', 'Case, Crossbow Bolt', 0.5, '1 mo', 'munizioni', 'Contiene fino a 20 quadrelli.'),
  // ── Focus da incantatore
  E('focus-cristallo', 'Focus arcano (cristallo)', 'Arcane Focus (Crystal)', 0.5, '10 mo', 'focus', 'Stregoni, warlock e maghi lo usano come focus per gli incantesimi.'),
  E('focus-globo', 'Focus arcano (globo)', 'Arcane Focus (Orb)', 1.5, '20 mo', 'focus', 'Stregoni, warlock e maghi lo usano come focus per gli incantesimi.'),
  E('focus-verga', 'Focus arcano (verga)', 'Arcane Focus (Rod)', 1, '10 mo', 'focus', 'Stregoni, warlock e maghi lo usano come focus per gli incantesimi.'),
  E('focus-bastone', 'Focus arcano (bastone)', 'Arcane Focus (Staff)', 2, '5 mo', 'focus', 'Focus per gli incantesimi arcani; è anche un bastone ferrato.'),
  E('focus-bacchetta', 'Focus arcano (bacchetta)', 'Arcane Focus (Wand)', 0.5, '10 mo', 'focus', 'Stregoni, warlock e maghi lo usano come focus per gli incantesimi.'),
  E('focus-vischio', 'Focus druidico (rametto di vischio)', 'Druidic Focus (Sprig of mistletoe)', 0, '1 mo', 'focus', 'Druidi e ranger lo usano come focus per gli incantesimi.'),
  E('focus-bastone-legno', 'Focus druidico (bastone di legno)', 'Druidic Focus (Wooden staff)', 2, '5 mo', 'focus', 'Focus per gli incantesimi primevi; è anche un bastone ferrato.'),
  E('focus-tasso', 'Focus druidico (bacchetta di tasso)', 'Druidic Focus (Yew wand)', 0.5, '10 mo', 'focus', 'Druidi e ranger lo usano come focus per gli incantesimi.'),
  E('simbolo-amuleto', 'Simbolo sacro (amuleto)', 'Holy Symbol (Amulet)', 0.5, '5 mo', 'focus', 'Chierici e paladini lo usano come focus per gli incantesimi, indossato o impugnato.'),
  E('simbolo-emblema', 'Simbolo sacro (emblema)', 'Holy Symbol (Emblem)', 0, '5 mo', 'focus', 'Focus per gli incantesimi divini, dipinto su un tessuto o su uno scudo.'),
  E('simbolo-reliquiario', 'Simbolo sacro (reliquiario)', 'Holy Symbol (Reliquary)', 1, '5 mo', 'focus', 'Focus per gli incantesimi divini, da impugnare.'),
  E('borsa-componenti', 'Borsa per componenti', 'Component Pouch', 1, '25 mo', 'focus', 'Impermeabile, contiene tutte le componenti materiali gratuite dei tuoi incantesimi.'),
  E('libro-incantesimi', 'Libro degli incantesimi', 'Spellbook', 1.5, '—', 'focus', 'Il libro del mago: 100 pagine, leggibile solo da te o con Identificare.'),
  // ── Attrezzi e strumenti
  E('arnesi-scasso', 'Arnesi da scasso', 'Thieves\' Tools', 0.5, '25 mo', 'attrezzi', 'Destrezza. Scassinare una serratura (CD 15) o disattivare una trappola (CD 15).'),
  E('borsa-erborista', 'Borsa da erborista', 'Herbalism Kit', 1.5, '5 mo', 'attrezzi', 'Intelligenza. Identificare una pianta (CD 10). Permette di creare antitossina, candele, kit da guaritore e pozioni di guarigione.'),
  E('kit-guaritore', 'Kit da guaritore', 'Healer\'s Kit', 1.5, '5 mo', 'attrezzi', 'Dieci usi. Con l\'azione Utilizzare spendi un uso per stabilizzare una creatura a 0 PF priva di sensi, senza prova di Saggezza (Medicina).'),
  E('kit-scalatore', 'Kit da scalatore', 'Climber\'s Kit', 6, '25 mo', 'attrezzi', 'Con l\'azione Utilizzare ti ancori: non cadi più di 7,5 m dal punto di ancoraggio e non ti allontani più di 7,5 m senza sganciarti (azione bonus).'),
  E('liuto', 'Liuto', 'Lute', 1, '35 mo', 'attrezzi', 'Strumento musicale (Carisma): suonare un brano conosciuto (CD 10) o improvvisare (CD 15). Gli strumenti musicali costano e pesano in modo diverso: cambia nome e peso se ne usi un altro.'),
  E('flauto', 'Flauto', 'Flute', 0.5, '2 mo', 'attrezzi', 'Strumento musicale (Carisma): suonare un brano conosciuto (CD 10) o improvvisare (CD 15).'),
  // ── Altro equipaggiamento
  E('zaino', 'Zaino', 'Backpack', 2.5, '2 mo', 'vari', 'Contiene fino a 15 kg. Può fare anche da bisaccia.'),
  E('corda', 'Corda', 'Rope', 2.5, '1 mo', 'vari', 'Fare un nodo: prova di Destrezza (Rapidità di Mano) CD 10. Spezzarla: Forza (Atletica) CD 20. Puoi legare una creatura Afferrata, Incapacitata o Intralciata: con le gambe legate è Intralciata finché non si libera (Destrezza (Acrobazia) CD 15).'),
  E('rampino', 'Rampino', 'Grappling Hook', 2, '2 mo', 'vari', 'Con l\'azione Utilizzare lo lanci verso un appiglio entro 15 m: si aggancia con una prova di Destrezza (Acrobazia) CD 13. Legato a una corda, puoi arrampicarti.'),
  E('piede-di-porco', 'Piede di porco', 'Crowbar', 2.5, '2 mo', 'vari', 'Vantaggio alle prove di Forza in cui puoi fare leva.'),
  E('giaciglio', 'Giaciglio', 'Bedroll', 3.5, '1 mo', 'vari', 'Ci dorme una creatura Piccola o Media; superi da solo i TS contro il freddo estremo.'),
  E('coperta', 'Coperta', 'Blanket', 1.5, '5 ma', 'vari', 'Avvolto in una coperta hai vantaggio ai TS contro il freddo estremo.'),
  E('otre', 'Otre', 'Waterskin', 2.5, '2 ma', 'vari', 'Contiene circa 2 litri d\'acqua (peso da pieno).'),
  E('tenda', 'Tenda', 'Tent', 10, '2 mo', 'vari', 'Ci dormono fino a due creature Piccole o Medie.'),
  E('pala', 'Pala', 'Shovel', 2.5, '2 mo', 'vari', 'In 1 ora scavi una buca di 1,5 m di lato nel terreno.'),
  E('catena', 'Catena', 'Chain', 5, '5 mo', 'vari', 'Puoi avvolgerla attorno a una creatura entro 1,5 m Afferrata, Incapacitata o Intralciata con una prova di Forza (Atletica) CD 13. Liberarsi: Destrezza (Acrobazia) CD 18; spezzarla: Forza (Atletica) CD 20.'),
  E('manette', 'Manette', 'Manacles', 3, '2 mo', 'vari', 'Legano una creatura Piccola o Media Afferrata, Incapacitata o Intralciata (Destrezza (Rapidità di Mano) CD 13): ha svantaggio ai tiri per colpire. Liberarsi CD 20 (Rapidità di Mano), spezzarle CD 25 (Atletica). Hanno una chiave.'),
  E('lucchetto', 'Lucchetto', 'Lock', 0.5, '10 mo', 'vari', 'Ha una chiave. Senza chiave si apre con arnesi da scasso e una prova di Destrezza (Rapidità di Mano) CD 15.'),
  E('tagliola', 'Tagliola', 'Hunting Trap', 12.5, '5 mo', 'vari', 'Chi la calpesta fa un TS su Destrezza CD 13 o subisce 1d4 danni perforanti e ha velocità 0 fino all\'inizio del suo turno; poi resta legato alla catena. Liberarsi: azione, prova di Forza (Atletica) CD 13 (ogni fallimento fa 1 danno perforante).'),
  E('specchio', 'Specchio', 'Mirror', 0.25, '5 mo', 'vari', 'Specchio d\'acciaio a mano: per guardare dietro gli angoli o fare segnali.'),
  E('cannocchiale', 'Cannocchiale', 'Spyglass', 0.5, '1.000 mo', 'vari', 'Ingrandisce due volte gli oggetti.'),
  E('lente', 'Lente d\'ingrandimento', 'Magnifying Glass', 0, '100 mo', 'vari', 'Vantaggio alle prove per esaminare o valutare un oggetto molto dettagliato.'),
  E('mappa', 'Mappa', 'Map', 0, '1 mo', 'vari', 'Con una mappa precisa hai +5 alle prove di Saggezza (Sopravvivenza) per orientarti in quel luogo.'),
  E('libro', 'Libro', 'Book', 2.5, '25 mo', 'vari', 'Consultando un libro di saggistica accurato hai +5 alle prove di Intelligenza (Arcano, Storia, Natura o Religione) su quell\'argomento.'),
  E('costume', 'Costume', 'Costume', 2, '5 mo', 'vari', 'Vantaggio alle prove per impersonare la persona o il tipo di persona che rappresenta.'),
  E('abiti-viaggiatore', 'Abiti da viaggiatore', 'Clothes, Traveler\'s', 2, '2 mo', 'vari', 'Abiti resistenti per viaggiare.'),
  E('abiti-pregiati', 'Abiti pregiati', 'Clothes, Fine', 3, '15 mo', 'vari', 'Alcuni eventi e luoghi ammettono solo chi li indossa.'),
  E('veste', 'Veste', 'Robe', 2, '1 mo', 'vari', 'Ha un significato professionale o cerimoniale.'),
  E('profumo', 'Profumo', 'Perfume', 0, '5 mo', 'vari', 'Per 1 ora vantaggio alle prove di Carisma (Persuasione) con un umanoide Indifferente entro 1,5 m.'),
  E('ariete', 'Ariete portatile', 'Ram, Portable', 17.5, '4 mo', 'vari', '+4 alle prove di Forza per sfondare porte; un altro personaggio che aiuta ti dà vantaggio.'),
  E('pertica', 'Pertica (3 m)', 'Pole', 3.5, '5 mr', 'vari', 'Tocchi oggetti fino a 3 m. Usata per i salti ti dà vantaggio alla prova di Forza (Atletica).'),
  E('chiodi', 'Chiodi da rocciatore (10)', 'Spikes, Iron', 2.5, '1 mo', 'vari', 'Si piantano con un oggetto contundente per bloccare una porta o legarci una corda.'),
  E('carrucola', 'Carrucola e paranco', 'Block and Tackle', 2.5, '1 mo', 'vari', 'Sollevi fino a quattro volte il peso che sollevi normalmente.'),
  E('campanella', 'Campanella', 'Bell', 0, '1 mo', 'vari', 'Suonata con l\'azione Utilizzare si sente fino a 18 m.'),
  E('fischietto', 'Fischietto da segnalazione', 'Signal Whistle', 0, '5 mr', 'vari', 'Si sente fino a 180 m.'),
  E('sacco', 'Sacco', 'Sack', 0.25, '1 mr', 'vari', 'Contiene fino a 15 kg.'),
  E('borsa', 'Borsa', 'Pouch', 0.5, '5 ma', 'vari', 'Contiene fino a 3 kg.'),
  E('forziere', 'Forziere', 'Chest', 12.5, '5 mo', 'vari', 'Contenitore robusto.'),
  E('fiasca', 'Fiasca', 'Flask', 0.5, '2 mr', 'vari', 'Contiene circa mezzo litro.'),
  E('fiala', 'Fiala', 'Vial', 0, '1 mo', 'vari', 'Contiene circa 120 ml.'),
  E('inchiostro', 'Inchiostro', 'Ink', 0, '10 mo', 'vari', 'Una boccetta basta per circa 500 pagine.'),
  E('pennino', 'Pennino', 'Ink Pen', 0, '2 mr', 'vari', 'Per scrivere o disegnare con l\'inchiostro.'),
  E('pergamena', 'Pergamena (foglio)', 'Parchment', 0, '1 ma', 'vari', 'Circa 250 parole scritte a mano.'),
  E('carta', 'Carta (foglio)', 'Paper', 0, '2 ma', 'vari', 'Circa 250 parole scritte a mano.'),
];

export const equipDaId = (id) => EQUIPAGGIAMENTO.find((x) => x.id === id) || null;
// Riconosce un oggetto del manuale dal nome scritto (italiano o inglese, senza maiuscole né parentesi)
const normNome = (s) => String(s || '').toLowerCase().replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim();
export const equipDaNome = (nome) => { const n = normNome(nome); return n ? EQUIPAGGIAMENTO.find((x) => normNome(x.nome) === n || normNome(x.en) === n) || null : null; };

// Equipaggiamento iniziale delle classi (opzione A del manuale). armi/armature: id di dati2024.js; oggetti: id qui sopra
// (con quantità); mo: monete d'oro. Il Guerriero ha due pacchetti (A e B), come nel manuale.
export const EQUIP_INIZIALE = {
  Barbaro: [{ armi: [['ascia-bipenne', 1], ['ascia', 4]], oggetti: [['dot-esploratore', 1]], mo: 15 }],
  Bardo: [{ armature: ['cuoio'], armi: [['pugnale', 2]], oggetti: [['liuto', 1], ['dot-intrattenitore', 1]], mo: 19, nota: 'Lo strumento musicale è a tua scelta (qui un liuto).' }],
  Chierico: [{ armature: ['giaco-di-maglia', 'scudo'], armi: [['mazza', 1]], oggetti: [['simbolo-amuleto', 1], ['dot-sacerdote', 1]], mo: 7 }],
  Druido: [{ armature: ['cuoio', 'scudo'], armi: [['falcetto', 1], ['bastone-ferrato', 1]], oggetti: [['dot-esploratore', 1], ['borsa-erborista', 1]], mo: 9, nota: 'Il bastone ferrato è anche il tuo focus druidico.' }],
  Guerriero: [
    { nome: 'A: armatura pesante', armature: ['cotta-di-maglia'], armi: [['spadone', 1], ['mazzafrusto', 1], ['giavellotto', 8]], oggetti: [['dot-dungeon', 1]], mo: 4 },
    { nome: 'B: arco e cuoio borchiato', armature: ['cuoio-borchiato'], armi: [['scimitarra', 1], ['spada-corta', 1], ['arco-lungo', 1]], oggetti: [['frecce', 1], ['faretra', 1], ['dot-dungeon', 1]], mo: 11 },
  ],
  Ladro: [{ armature: ['cuoio'], armi: [['pugnale', 2], ['spada-corta', 1], ['arco-corto', 1]], oggetti: [['frecce', 1], ['faretra', 1], ['arnesi-scasso', 1], ['dot-scassinatore', 1]], mo: 8 }],
  Mago: [{ armi: [['pugnale', 2], ['bastone-ferrato', 1]], oggetti: [['veste', 1], ['libro-incantesimi', 1], ['dot-studioso', 1]], mo: 5, nota: 'Il bastone ferrato è anche il tuo focus arcano.' }],
  Monaco: [{ armi: [['lancia', 1], ['pugnale', 5]], oggetti: [['flauto', 1], ['dot-esploratore', 1]], mo: 11, nota: 'Al posto del flauto puoi avere gli strumenti da artigiano o lo strumento musicale della tua competenza.' }],
  Paladino: [{ armature: ['cotta-di-maglia', 'scudo'], armi: [['spada-lunga', 1], ['giavellotto', 6]], oggetti: [['simbolo-amuleto', 1], ['dot-sacerdote', 1]], mo: 9 }],
  Ranger: [{ armature: ['cuoio-borchiato'], armi: [['scimitarra', 1], ['spada-corta', 1], ['arco-lungo', 1]], oggetti: [['frecce', 1], ['faretra', 1], ['focus-vischio', 1], ['dot-esploratore', 1]], mo: 7 }],
  Stregone: [{ armi: [['lancia', 1], ['pugnale', 2]], oggetti: [['focus-cristallo', 1], ['dot-dungeon', 1]], mo: 28 }],
  Warlock: [{ armature: ['cuoio'], armi: [['falcetto', 1], ['pugnale', 2]], oggetti: [['focus-globo', 1], ['libro', 1], ['dot-studioso', 1]], mo: 15, nota: 'Il libro è di sapere occulto.' }],
};
// Monete d'oro dell'opzione "solo oro" (B, o C per il Guerriero)
export const ORO_INIZIALE = { Barbaro: 75, Bardo: 90, Chierico: 110, Druido: 50, Guerriero: 155, Ladro: 100, Mago: 55, Monaco: 50, Paladino: 150, Ranger: 150, Stregone: 50, Warlock: 100 };
