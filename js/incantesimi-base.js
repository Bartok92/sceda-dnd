// Piccolo prontuario di incantesimi comuni secondo il Manuale del Giocatore 2024 (SRD 5.2, CC-BY-4.0, descrizioni riassunte).
// Serve per aggiungere velocemente un incantesimo: tutto resta modificabile.
const I = (nome, livello, scuola, tempo, gittata, componenti, durata, descrizione, extra = {}) =>
  ({ nome, livello, scuola, tempo, gittata, componenti, durata, descrizione, concentrazione: /concentrazione/i.test(durata), rituale: false, ...extra });

export const INCANTESIMI_BASE = [
  I('Dardo di fuoco', 0, 'Invocazione', '1 azione', '36 m', 'V, S', 'Istantanea', 'Attacco a distanza con incantesimo: 1d10 danni da fuoco. Sale a 2d10 al 5°, 3d10 all\'11°, 4d10 al 17° livello.'),
  I('Luce', 0, 'Invocazione', '1 azione', 'Contatto', 'V, M', '1 ora', 'Un oggetto emette luce intensa in un raggio di 6 m e fioca per altri 6 m.'),
  I('Mano magica', 0, 'Evocazione', '1 azione', '9 m', 'V, S', '1 minuto', 'Una mano spettrale manipola oggetti fino a 5 kg entro 9 m.'),
  I('Prestidigitazione', 0, 'Trasmutazione', '1 azione', '3 m', 'V, S', 'Fino a 1 ora', 'Piccoli effetti magici innocui: pulire, scaldare, accendere candele, piccoli segni.'),
  I('Raggio di gelo', 0, 'Invocazione', '1 azione', '18 m', 'V, S', 'Istantanea', 'Attacco a distanza con incantesimo: 1d8 danni da freddo e la velocità del bersaglio cala di 3 m fino al tuo prossimo turno.'),
  I('Fiamma sacra', 0, 'Invocazione', '1 azione', '18 m', 'V, S', 'Istantanea', 'Il bersaglio effettua un TS su Destrezza o subisce 1d8 danni radiosi. Ignora la copertura.'),
  I('Guida', 0, 'Divinazione', '1 azione', 'Contatto', 'V, S', 'Concentrazione, fino a 1 minuto', 'Tocchi una creatura consenziente e scegli un\'abilità: finché dura, aggiunge 1d4 alle prove di caratteristica con quell\'abilità.'),
  I('Deflagrazione occulta', 0, 'Invocazione', '1 azione', '36 m', 'V, S', 'Istantanea', 'Raggio di energia crepitante: attacco a distanza con incantesimo, 1d10 danni da forza. Più raggi ai livelli alti.'),
  I('Beffa crudele', 0, 'Ammaliamento', '1 azione', '18 m', 'V', 'Istantanea', 'TS su Saggezza o 1d6 danni psichici e svantaggio al suo prossimo tiro per colpire prima della fine del suo prossimo turno. Sale a 2d6 al 5°, 3d6 all\'11°, 4d6 al 17° livello.'),
  I('Dardo incantato', 1, 'Invocazione', '1 azione', '36 m', 'V, S', 'Istantanea', 'Tre dardi colpiscono automaticamente, 1d4+1 danni da forza ciascuno. Un dardo in più per ogni livello di slot sopra il 1°.'),
  I('Armatura magica', 1, 'Abiurazione', '1 azione', 'Contatto', 'V, S, M', '8 ore', 'Una creatura senza armatura ha CA 13 + modificatore di Destrezza.'),
  I('Scudo', 1, 'Abiurazione', '1 reazione', 'Incantatore', 'V, S', '1 round', '+5 alla CA fino all\'inizio del tuo prossimo turno, immune a dardo incantato.'),
  I('Cura ferite', 1, 'Abiurazione', '1 azione', 'Contatto', 'V, S', 'Istantanea', 'Una creatura che tocchi recupera 2d8 + modificatore da incantatore PF. +2d8 per ogni livello di slot sopra il 1°.'),
  I('Parola guaritrice', 1, 'Abiurazione', '1 azione bonus', '18 m', 'V', 'Istantanea', 'Una creatura che vedi entro la gittata recupera 2d4 + modificatore da incantatore PF. +2d4 per ogni livello di slot sopra il 1°.'),
  I('Benedizione', 1, 'Ammaliamento', '1 azione', '9 m', 'V, S, M', 'Concentrazione, fino a 1 minuto', 'Fino a tre creature aggiungono 1d4 ai tiri per colpire e ai tiri salvezza.'),
  I('Sonno', 1, 'Ammaliamento', '1 azione', '18 m', 'V, S, M', 'Concentrazione, fino a 1 minuto', 'Le creature a tua scelta in una sfera di 1,5 m di raggio fanno un TS su Saggezza: chi fallisce è Incapacitato fino alla fine del suo prossimo turno, poi ripete il TS; se fallisce di nuovo è Privo di sensi finché dura. L\'effetto finisce se subisce danni o se qualcuno entro 1,5 m usa un\'azione per svegliarlo. Chi non dorme (es. gli elfi) o è immune allo Sfinimento supera il TS in automatico.'),
  I('Mani brucianti', 1, 'Invocazione', '1 azione', 'Incantatore (cono 4,5 m)', 'V, S', 'Istantanea', 'TS su Destrezza: 3d6 danni da fuoco, metà se superato.'),
  I('Individuazione del magico', 1, 'Divinazione', '1 azione', 'Incantatore', 'V, S', 'Concentrazione, fino a 10 minuti', 'Percepisci la magia entro 9 m e ne vedi l\'aura.', { rituale: true }),
  I('Charme su persone', 1, 'Ammaliamento', '1 azione', '9 m', 'V, S', '1 ora', 'Un umanoide effettua un TS su Saggezza o è affascinato da te.'),
  I('Punizione divina', 1, 'Invocazione', '1 azione bonus', 'Incantatore', 'V', 'Istantanea', 'Si lancia subito dopo aver colpito con un\'arma da mischia o un colpo senz\'armi: il bersaglio subisce 2d8 danni radiosi extra (+1d8 se è un immondo o un non morto). +1d8 per ogni livello di slot sopra il 1°. Il paladino lo ha sempre preparato e dal 2° livello può lanciarlo gratis una volta per riposo lungo.'),
  I('Maledizione', 1, 'Ammaliamento', '1 azione bonus', '27 m', 'V, S, M', 'Concentrazione, fino a 1 ora', '+1d6 danni necrotici quando colpisci il bersaglio; svantaggio a una caratteristica a scelta.'),
  I('Passo velato', 2, 'Evocazione', '1 azione bonus', 'Incantatore', 'V', 'Istantanea', 'Ti teletrasporti fino a 9 m in uno spazio libero che vedi.'),
  I('Blocca persone', 2, 'Ammaliamento', '1 azione', '18 m', 'V, S, M', 'Concentrazione, fino a 1 minuto', 'Un umanoide effettua un TS su Saggezza o è paralizzato. Ripete il TS a fine turno.'),
  I('Immagine speculare', 2, 'Illusione', '1 azione', 'Incantatore', 'V, S', '1 minuto', 'Tre duplicati illusori ti circondano e possono deviare gli attacchi.'),
  I('Invisibilità', 2, 'Illusione', '1 azione', 'Contatto', 'V, S, M', 'Concentrazione, fino a 1 ora', 'Una creatura diventa invisibile finché non attacca o lancia un incantesimo.'),
  I('Arma spirituale', 2, 'Invocazione', '1 azione bonus', '18 m', 'V, S', 'Concentrazione, fino a 1 minuto', 'Una forza spettrale a forma di arma: appena compare fai un attacco in mischia con incantesimo contro una creatura entro 1,5 m da lei, 1d8 + modificatore da incantatore danni da forza. Nei turni seguenti, con un\'azione bonus, la sposti fino a 6 m e ripeti l\'attacco. +1d8 per ogni livello di slot sopra il 2°.'),
  I('Palla di fuoco', 3, 'Invocazione', '1 azione', '45 m', 'V, S, M', 'Istantanea', 'Esplosione di 6 m di raggio: TS su Destrezza, 8d6 danni da fuoco (metà se superato). +1d6 per livello di slot sopra il 3°.'),
  I('Controincantesimo', 3, 'Abiurazione', '1 reazione', '18 m', 'S', 'Istantanea', 'Quando vedi una creatura entro 18 m lanciare un incantesimo con componenti verbali, somatiche o materiali: la creatura fa un TS su Costituzione; se fallisce, l\'incantesimo svanisce senza effetto e l\'azione è sprecata (se aveva usato uno slot, lo slot non si consuma).'),
  I('Volare', 3, 'Trasmutazione', '1 azione', 'Contatto', 'V, S, M', 'Concentrazione, fino a 10 minuti', 'Una creatura ottiene velocità di volare 18 m.'),
  I('Revivificare', 3, 'Necromanzia', '1 azione', 'Contatto', 'V, S, M', 'Istantanea', 'Riporta in vita con 1 PF una creatura morta da non più di un minuto (diamanti da 300 mo).'),
];

// Descrizioni delle regole 2014 che il prontuario aveva prima della versione 1.10.0: gli incantesimi già aggiunti
// alle schede con questo testo (mai modificato dal giocatore) vengono aggiornati da soli alle regole 2024.
export const DESCRIZIONI_2014 = {
  'Guida': 'Il bersaglio aggiunge 1d4 a una prova di caratteristica a sua scelta.',
  'Beffa crudele': 'TS su Saggezza o 1d4 danni psichici e svantaggio al prossimo tiro per colpire.',
  'Cura ferite': 'Una creatura recupera 1d8 + modificatore da incantatore PF. +1d8 per ogni livello di slot sopra il 1°.',
  'Parola guaritrice': 'Una creatura che vedi recupera 1d4 + modificatore da incantatore PF.',
  'Sonno': 'Tira 5d8: le creature con meno PF cadono addormentate partendo dalla più debole.',
  'Punizione divina': 'Privilegio del paladino: quando colpisci, spendi uno slot per +2d8 danni radiosi (+1d8 per livello di slot).',
  'Arma spirituale': 'Un\'arma fluttuante attacca: 1d8 + modificatore da incantatore danni da forza.',
  'Controincantesimo': 'Interrompi un incantesimo di 3° livello o inferiore; per livelli superiori prova di caratteristica.',
};
