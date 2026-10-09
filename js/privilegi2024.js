// Privilegi di classe, sottoclassi e talenti del Manuale del Giocatore 2024.
// Le descrizioni sono RIASSUNTI in italiano scritti per l'app (non il testo del manuale): numeri e regole sono quelli
// del manuale 2024, le parole no. Distanze: 1,5 m = 5 piedi. Per il testo completo vale sempre il manuale.
//
// P(livello, nome, testo, extra): extra.ripeti = altri livelli in cui il privilegio si ottiene di nuovo (es. Aumento
// dei punteggi di caratteristica), extra.id = chiave stabile quando il nome si ripete.

const P = (liv, nome, testo, extra = {}) => ({ liv, nome, testo, ...extra });
const ASI = (...livelli) => P(livelli[0], 'Aumento dei punteggi di caratteristica',
  'Ottieni il talento Aumento dei punteggi di caratteristica oppure un altro talento per cui hai i requisiti (lo scegli tra i Talenti).',
  { ripeti: livelli.slice(1), id: 'asi' });
const DONO = (consigliato) => P(19, 'Dono epico', `Ottieni un talento Dono epico oppure un altro talento per cui hai i requisiti. Consigliato: ${consigliato}.`, { id: 'dono-epico' });
// fonte: solo per le sottoclassi che NON sono nel Manuale del Giocatore 2024 (si mostra nel menu e nelle Note)
const SOTTO = (id, nome, en, alias, privilegi, fonte = '') => ({ id, nome, en, alias, privilegi, fonte });

// ───────────────────────── Privilegi di classe ─────────────────────────
export const PRIVILEGI_CLASSE = {
  Barbaro: [
    P(1, 'Ira', 'Entri in ira con un\'azione bonus, se non indossi un\'armatura pesante. Usi: 2 (3 al 3°, 4 al 6°, 5 al 12°, 6 al 17° livello); ne recuperi uno con un riposo breve e tutti con un riposo lungo. In ira: resistenza ai danni contundenti, perforanti e taglienti; bonus ai danni degli attacchi che usano la Forza (con arma o colpo senz\'armi) di +2 (+3 dal 9°, +4 dal 16°); vantaggio alle prove e ai tiri salvezza di Forza; non puoi mantenere la concentrazione né lanciare incantesimi. L\'ira dura fino alla fine del tuo turno successivo e la prolunghi di un turno se attacchi un nemico, gli imponi un tiro salvezza o usi un\'azione bonus; massimo 10 minuti. Finisce se indossi un\'armatura pesante o diventi Incapacitato.'),
    P(1, 'Difesa senza armatura', 'Senza armatura la tua CA base è 10 + modificatore di Destrezza + modificatore di Costituzione. Puoi usare uno scudo.'),
    P(1, 'Maestria nelle armi', 'Usi la proprietà di maestria di 2 tipi di armi da mischia (semplici o da guerra) a tua scelta: 3 dal 4° livello, 4 dal 10°. Dopo un riposo lungo puoi cambiarne una.'),
    P(2, 'Percezione del pericolo', 'Vantaggio ai tiri salvezza su Destrezza, a meno che tu non sia Incapacitato.'),
    P(2, 'Attacco irruento', 'Al primo tiro per colpire del tuo turno puoi attaccare con irruenza: hai vantaggio ai tiri per colpire che usano la Forza fino all\'inizio del tuo turno successivo, ma nello stesso periodo anche gli attacchi contro di te hanno vantaggio.'),
    P(3, 'Conoscenza primordiale', 'Ottieni la competenza in un\'altra abilità della lista del barbaro. Mentre sei in ira, le prove di Acrobazia, Intimidire, Percezione, Furtività e Sopravvivenza puoi farle come prove di Forza.'),
    ASI(4, 8, 12, 16),
    P(5, 'Attacco extra', 'Quando usi l\'azione di Attacco nel tuo turno attacchi due volte invece di una.'),
    P(5, 'Movimento veloce', 'La tua velocità aumenta di 3 m se non indossi un\'armatura pesante.'),
    P(7, 'Istinto ferino', 'Hai vantaggio ai tiri di iniziativa.'),
    P(7, 'Balzo istintivo', 'Con la stessa azione bonus con cui entri in ira puoi muoverti fino a metà della tua velocità.'),
    P(9, 'Colpo brutale', 'Se usi Attacco irruento, puoi rinunciare al vantaggio su un tuo tiro per colpire con la Forza (che non abbia svantaggio). Se colpisce, il bersaglio subisce 1d10 danni extra dello stesso tipo e scegli un effetto: Colpo poderoso (il bersaglio viene spinto di 4,5 m lontano da te e tu puoi muoverti verso di lui fino a metà velocità senza provocare attacchi di opportunità) oppure Colpo azzoppante (la sua velocità cala di 4,5 m fino all\'inizio del tuo turno successivo; non si somma).'),
    P(11, 'Ira implacabile', 'Se scendi a 0 PF mentre sei in ira e non muori sul colpo, puoi fare un tiro salvezza su Costituzione con CD 10: se riesce, i tuoi PF diventano il doppio del tuo livello da barbaro. Ogni uso successivo aumenta la CD di 5; torna a 10 dopo un riposo breve o lungo.'),
    P(13, 'Colpo brutale migliorato', 'Nuovi effetti per Colpo brutale: Colpo sconvolgente (il bersaglio ha svantaggio al suo prossimo tiro salvezza e non può fare attacchi di opportunità fino all\'inizio del tuo turno successivo) e Colpo fendente (il prossimo tiro per colpire di un\'altra creatura contro il bersaglio, prima del tuo turno successivo, ha +5; un solo bonus di questo tipo per tiro).', { id: 'colpo-brutale-13' }),
    P(15, 'Ira persistente', 'Quando tiri l\'iniziativa puoi recuperare tutti gli usi di Ira (una volta per riposo lungo). L\'ira ora dura 10 minuti senza bisogno di prolungarla; finisce prima solo se sei Privo di sensi o indossi un\'armatura pesante.'),
    P(17, 'Colpo brutale migliorato', 'Il danno extra di Colpo brutale sale a 2d10 e puoi applicare due effetti diversi di Colpo brutale ogni volta.', { id: 'colpo-brutale-17' }),
    P(18, 'Potenza indomabile', 'Se il totale di una tua prova o tiro salvezza di Forza è inferiore al tuo punteggio di Forza, puoi usare il punteggio al posto del totale.'),
    DONO('Dono dell\'offesa irresistibile'),
    P(20, 'Campione primordiale', 'Forza e Costituzione aumentano di 4, fino a un massimo di 25.'),
  ],
  Bardo: [
    P(1, 'Ispirazione bardica', 'Con un\'azione bonus dai a una creatura entro 18 m che ti vede o ti sente un tuo dado di Ispirazione bardica (d6; d8 al 5°, d10 al 10°, d12 al 15° livello). Entro un\'ora, quando fallisce un tiro d20 può tirare il dado e sommarlo, magari trasformando il fallimento in successo. Una creatura può avere un solo dado alla volta. Usi pari al modificatore di Carisma (minimo 1), recuperati con un riposo lungo.'),
    P(1, 'Incantesimi', 'Lanci incantesimi da bardo con il Carisma; puoi usare uno strumento musicale come focus. Conosci 2 trucchetti (3 al 4°, 4 al 10° livello) e prepari incantesimi di 1° livello o superiore secondo la tabella del bardo; quando sali di livello puoi sostituirne uno. Recuperi gli slot con un riposo lungo.'),
    P(2, 'Maestria', 'Ottieni la maestria (competenza doppia) in due abilità in cui sei competente. Consigliate: Intrattenere e Persuasione.', { id: 'maestria-2' }),
    P(2, 'Tuttofare', 'Aggiungi metà del bonus di competenza (per difetto) alle prove di abilità in cui non hai competenza e che non usano già il bonus di competenza. (L\'app lo somma da sola.)'),
    ASI(4, 8, 12, 16),
    P(5, 'Fonte di ispirazione', 'Recuperi tutti gli usi di Ispirazione bardica anche con un riposo breve. Inoltre puoi spendere uno slot incantesimo (senza azione) per recuperare un uso.'),
    P(7, 'Controfascino', 'Se tu o una creatura entro 9 m da te fallite un tiro salvezza contro un effetto che rende Affascinato o Spaventato, con la reazione fai ripetere il tiro con vantaggio.'),
    P(9, 'Maestria', 'Ottieni la maestria in altre due abilità in cui sei competente.', { id: 'maestria-9' }),
    P(10, 'Segreti magici', 'Quando il numero di incantesimi preparati aumenta (anche ora) puoi sceglierli dalle liste del bardo, del chierico, del druido e del mago: contano come incantesimi da bardo. Anche quando ne sostituisci uno puoi prenderlo da quelle liste.'),
    P(18, 'Ispirazione superiore', 'Quando tiri l\'iniziativa, se hai meno di due usi di Ispirazione bardica ne recuperi fino ad averne due.'),
    DONO('Dono del richiamo degli incantesimi'),
    P(20, 'Parole della creazione', 'Hai sempre preparati Parola del potere guarire e Parola del potere uccidere. Quando lanci uno dei due puoi prendere di mira una seconda creatura entro 3 m dal primo bersaglio.'),
  ],
  Chierico: [
    P(1, 'Incantesimi', 'Lanci incantesimi da chierico con la Saggezza; puoi usare un simbolo sacro come focus. Conosci 3 trucchetti (4 al 4°, 5 al 10° livello) e prepari incantesimi secondo la tabella del chierico; dopo un riposo lungo puoi cambiare l\'elenco dei preparati.'),
    P(1, 'Ordine divino', 'Scegli un ruolo sacro. Protettore: competenza con le armi da guerra e addestramento alle armature pesanti. Taumaturgo: un trucchetto da chierico in più e bonus alle prove di Intelligenza (Arcano o Religione) pari al modificatore di Saggezza (minimo +1).'),
    P(2, 'Incanalare divinità', 'Usi: 2 (3 al 6°, 4 al 18° livello); ne recuperi uno con un riposo breve e tutti con un riposo lungo. CD dei tiri salvezza = CD dei tuoi incantesimi. Scintilla divina (azione Magia): punti il simbolo sacro su una creatura entro 9 m, tiri 1d8 + Saggezza (2d8 al 7°, 3d8 al 13°, 4d8 al 18°) e scegli se curarla di quel totale o farle fare un tiro salvezza su Costituzione: se fallisce subisce quel totale in danni necrotici o radiosi, metà se riesce. Scacciare non morti (azione Magia): i non morti a tua scelta entro 9 m fanno un tiro salvezza su Saggezza; chi fallisce è Spaventato e Incapacitato per 1 minuto e cerca di allontanarsi da te; finisce prima se subisce danni, se sei Incapacitato o se muori.'),
    ASI(4, 8, 12, 16),
    P(5, 'Bruciare non morti', 'Quando usi Scacciare non morti tiri tanti d8 quanto il tuo modificatore di Saggezza (minimo 1d8): ogni non morto che fallisce il tiro salvezza subisce quel totale in danni radiosi (il danno non fa finire l\'effetto).'),
    P(7, 'Colpi benedetti', 'Scegli un\'opzione. Colpo divino: una volta in ognuno dei tuoi turni, quando colpisci una creatura con un\'arma, +1d8 danni necrotici o radiosi. Incantesimi potenti: aggiungi il modificatore di Saggezza ai danni dei trucchetti da chierico.'),
    P(10, 'Intervento divino', 'Azione Magia: scegli un incantesimo da chierico di 5° livello o inferiore che non si lanci con una reazione e lo lanci subito senza slot e senza componenti materiali. Una volta per riposo lungo.'),
    P(14, 'Colpi benedetti migliorati', 'Colpo divino: il danno extra sale a 2d8. Incantesimi potenti: quando un tuo trucchetto da chierico danneggia una creatura, puoi dare a te o a un\'altra creatura entro 18 m PF temporanei pari al doppio del modificatore di Saggezza.'),
    DONO('Dono del fato'),
    P(20, 'Intervento divino superiore', 'Con Intervento divino puoi scegliere anche Desiderio. Se lo fai, non puoi usare di nuovo Intervento divino finché non completi 2d4 riposi lunghi.'),
  ],
  Druido: [
    P(1, 'Incantesimi', 'Lanci incantesimi da druido con la Saggezza; puoi usare un focus druidico. Conosci 2 trucchetti (3 al 4°, 4 al 10° livello) e prepari incantesimi secondo la tabella del druido; dopo un riposo lungo puoi cambiare l\'elenco dei preparati.'),
    P(1, 'Druidico', 'Conosci il druidico, la lingua segreta dei druidi, e hai sempre preparato Parlare con gli animali. Puoi lasciare messaggi nascosti: chi conosce il druidico li nota da solo; gli altri li notano con una prova di Intelligenza (Indagare) CD 15 ma non li capiscono senza magia.'),
    P(1, 'Ordine primordiale', 'Scegli un ruolo sacro. Mago: un trucchetto da druido in più e bonus alle prove di Intelligenza (Arcano o Natura) pari al modificatore di Saggezza (minimo +1). Guardiano: competenza con le armi da guerra e addestramento alle armature medie.'),
    P(2, 'Forma selvatica', 'Con un\'azione bonus assumi la forma di una bestia che conosci, per tante ore quanto metà del tuo livello da druido (finisce se la riusi, se sei Incapacitato o se muori; puoi uscirne con un\'azione bonus). Usi: 2 (3 al 6°, 4 al 17° livello); uno si recupera con un riposo breve, tutti con un riposo lungo. Forme conosciute: 4 con grado di sfida massimo 1/4 e senza volo; 6 con GS 1/2 dal 4° livello; 8 con GS 1 e anche volanti dall\'8°. Dopo un riposo lungo puoi cambiarne una. In forma ottieni PF temporanei pari al tuo livello da druido; usi le statistiche della bestia ma tieni tipo di creatura, PF, dadi vita, Intelligenza, Saggezza, Carisma, privilegi, lingue, talenti e competenze; non puoi lanciare incantesimi (la concentrazione non si interrompe).'),
    P(2, 'Compagno selvatico', 'Azione Magia: spendi uno slot o un uso di Forma selvatica per lanciare Trova famiglio senza componenti materiali. Il famiglio è un folletto e sparisce quando completi un riposo lungo.'),
    ASI(4, 8, 12, 16),
    P(5, 'Rinascita selvatica', 'Una volta per turno, se non hai usi di Forma selvatica, puoi spendere uno slot incantesimo per ottenerne uno. Puoi anche spendere un uso di Forma selvatica per ottenere uno slot di 1° livello (una volta per riposo lungo).'),
    P(7, 'Furia elementale', 'Scegli un\'opzione. Incantesimi potenti: aggiungi il modificatore di Saggezza ai danni dei trucchetti da druido. Colpo primordiale: una volta per turno, quando colpisci con un\'arma o con un attacco della forma selvatica, +1d8 danni da freddo, fuoco, fulmine o tuono (a scelta).'),
    P(15, 'Furia elementale migliorata', 'Incantesimi potenti: i trucchetti da druido con gittata di almeno 3 m hanno 90 m di gittata in più. Colpo primordiale: il danno extra sale a 2d8.'),
    P(18, 'Incantesimi bestiali', 'Puoi lanciare incantesimi anche in forma selvatica, tranne quelli con componenti materiali di costo indicato o che vengono consumate.'),
    DONO('Dono del viaggio dimensionale'),
    P(20, 'Arcidruido', 'Forma selvatica sempreverde: quando tiri l\'iniziativa e non hai usi di Forma selvatica, ne recuperi uno. Mago della natura: una volta per riposo lungo puoi trasformare usi di Forma selvatica in un solo slot incantesimo (ogni uso vale 2 livelli: due usi = slot di 4° livello). Longevità: per ogni dieci anni il tuo corpo ne invecchia uno.'),
  ],
  Guerriero: [
    P(1, 'Stile di combattimento', 'Ottieni un talento Stile di combattimento a scelta (consigliato: Difesa). Ogni volta che sali di livello da guerriero puoi sostituirlo con un altro.'),
    P(1, 'Secondo fiato', 'Con un\'azione bonus recuperi 1d10 + il tuo livello da guerriero PF. Usi: 2 (3 al 4°, 4 al 10° livello); uno si recupera con un riposo breve, tutti con un riposo lungo.'),
    P(1, 'Maestria nelle armi', 'Usi la proprietà di maestria di 3 tipi di armi semplici o da guerra a tua scelta (4 al 4°, 5 al 10°, 6 al 16° livello). Dopo un riposo lungo puoi cambiarne una.'),
    P(2, 'Azione impetuosa', 'Nel tuo turno puoi fare un\'azione in più (non l\'azione Magia). Una volta per riposo breve o lungo; dal 17° livello due volte per riposo, ma una sola volta per turno.'),
    P(2, 'Mente tattica', 'Quando fallisci una prova di caratteristica puoi spendere un uso di Secondo fiato: invece di curarti tiri 1d10 e lo sommi alla prova. Se fallisci comunque, l\'uso non viene speso.'),
    ASI(4, 6, 8, 12, 14, 16),
    P(5, 'Attacco extra', 'Attacchi due volte quando usi l\'azione di Attacco nel tuo turno.'),
    P(5, 'Spostamento tattico', 'Quando usi Secondo fiato con l\'azione bonus puoi muoverti fino a metà della tua velocità senza provocare attacchi di opportunità.'),
    P(9, 'Indomito', 'Se fallisci un tiro salvezza puoi ritirarlo con un bonus pari al tuo livello da guerriero; devi usare il nuovo risultato. Una volta per riposo lungo (due volte dal 13° livello, tre dal 17°).'),
    P(9, 'Maestro tattico', 'Quando attacchi con un\'arma di cui usi la maestria, per quell\'attacco puoi sostituire la sua proprietà con Spingere, Fiaccare o Rallentare.'),
    P(11, 'Due attacchi extra', 'Attacchi tre volte quando usi l\'azione di Attacco nel tuo turno.'),
    P(13, 'Attacchi studiati', 'Se manchi una creatura con un tiro per colpire, hai vantaggio al tuo prossimo tiro per colpire contro di lei prima della fine del tuo turno successivo.'),
    DONO('Dono della bravura in combattimento'),
    P(20, 'Tre attacchi extra', 'Attacchi quattro volte quando usi l\'azione di Attacco nel tuo turno.'),
  ],
  Monaco: [
    P(1, 'Arti marziali', 'Armi da monaco: armi semplici da mischia e armi da guerra da mischia con la proprietà Leggera. Se sei disarmato o usi solo armi da monaco, senza armatura né scudo: puoi fare un colpo senz\'armi con un\'azione bonus; puoi tirare il dado di Arti marziali (d6; d8 al 5°, d10 all\'11°, d12 al 17° livello) al posto del danno normale dei colpi senz\'armi e delle armi da monaco; puoi usare la Destrezza invece della Forza per colpire e per i danni, e per la CD di Afferrare e Spingere. (L\'app usa da sola il dado più alto.)'),
    P(1, 'Difesa senza armatura', 'Senza armatura né scudo la tua CA base è 10 + modificatore di Destrezza + modificatore di Saggezza.'),
    P(2, 'Concentrazione del monaco', 'Hai punti concentrazione pari al tuo livello da monaco; li recuperi tutti con un riposo breve o lungo. CD dei tiri salvezza: 8 + Saggezza + competenza. Raffica di colpi: 1 punto, due colpi senz\'armi con un\'azione bonus. Difesa paziente: Disimpegno con un\'azione bonus, oppure 1 punto per Disimpegno e Schivata. Passo del vento: Scatto con un\'azione bonus, oppure 1 punto per Disimpegno e Scatto con la distanza di salto raddoppiata per il turno.'),
    P(2, 'Movimento senza armatura', 'Senza armatura né scudo la velocità aumenta di 3 m (4,5 m al 6°, 6 m al 10°, 7,5 m al 14°, 9 m al 18° livello). (L\'app lo somma da sola.)'),
    P(2, 'Metabolismo straordinario', 'Quando tiri l\'iniziativa puoi recuperare tutti i punti concentrazione spesi e curarti di un tiro del dado di Arti marziali + il tuo livello da monaco. Una volta per riposo lungo.'),
    P(3, 'Deviare attacchi', 'Quando un tiro per colpire ti colpisce con danni contundenti, perforanti o taglienti, con la reazione riduci il danno di 1d10 + Destrezza + livello da monaco. Se lo riduci a 0, puoi spendere 1 punto concentrazione per rimandare il colpo: una creatura entro 1,5 m (attacco in mischia) o entro 18 m non dietro copertura totale (attacco a distanza) fa un tiro salvezza su Destrezza o subisce due tiri del dado di Arti marziali + Destrezza, dello stesso tipo.'),
    ASI(4, 8, 12, 16),
    P(4, 'Caduta lenta', 'Quando cadi, con la reazione riduci il danno della caduta di 5 × il tuo livello da monaco.'),
    P(5, 'Attacco extra', 'Attacchi due volte quando usi l\'azione di Attacco nel tuo turno.'),
    P(5, 'Colpo stordente', 'Una volta per turno, quando colpisci una creatura con un\'arma da monaco o un colpo senz\'armi, puoi spendere 1 punto concentrazione: tiro salvezza su Costituzione o è Stordita fino all\'inizio del tuo turno successivo. Se lo supera, la sua velocità è dimezzata e il prossimo attacco contro di lei ha vantaggio, fino all\'inizio del tuo turno successivo.'),
    P(6, 'Colpi potenziati', 'I tuoi colpi senz\'armi possono infliggere danni da forza invece del loro tipo normale.'),
    P(7, 'Elusione', 'Quando un effetto ti permette un tiro salvezza su Destrezza per subire metà danni, se lo superi non subisci danni e se lo fallisci ne subisci la metà. Non funziona se sei Incapacitato.'),
    P(9, 'Movimento acrobatico', 'Senza armatura né scudo, nel tuo turno puoi muoverti su superfici verticali e sui liquidi senza cadere durante il movimento.'),
    P(10, 'Concentrazione accresciuta', 'Raffica di colpi: con 1 punto fai tre colpi senz\'armi invece di due. Difesa paziente: quando spendi un punto ottieni PF temporanei pari a due tiri del dado di Arti marziali. Passo del vento: quando spendi un punto puoi portare con te una creatura consenziente Grande o più piccola entro 1,5 m fino a fine turno, senza che provochi attacchi di opportunità.'),
    P(10, 'Autoguarigione', 'Alla fine di ogni tuo turno puoi porre fine su di te a una condizione tra Affascinato, Spaventato e Avvelenato. Inoltre il digiuno non ti dà livelli di Sfinimento.'),
    P(13, 'Deviare energia', 'Puoi usare Deviare attacchi contro attacchi di qualsiasi tipo di danno.'),
    P(14, 'Sopravvissuto disciplinato', 'Hai competenza in tutti i tiri salvezza. Quando ne fallisci uno puoi spendere 1 punto concentrazione per ritirarlo (devi usare il nuovo risultato).'),
    P(15, 'Concentrazione perfetta', 'Quando tiri l\'iniziativa e non usi Metabolismo straordinario, se hai 3 punti concentrazione o meno ne recuperi fino ad averne 4.'),
    P(18, 'Difesa superiore', 'All\'inizio del tuo turno puoi spendere 3 punti concentrazione: per 1 minuto (o finché sei Incapacitato) hai resistenza a tutti i danni tranne quelli da forza.'),
    DONO('Dono dell\'offesa irresistibile'),
    P(20, 'Corpo e mente', 'Destrezza e Saggezza aumentano di 4, fino a un massimo di 25.'),
  ],
  Paladino: [
    P(1, 'Imposizione delle mani', 'Hai una riserva di cura pari a 5 × il tuo livello da paladino, che si ricarica con un riposo lungo. Con un\'azione bonus tocchi una creatura (anche te) e le fai recuperare PF presi dalla riserva. Puoi anche spendere 5 punti della riserva per togliere la condizione Avvelenato (quei punti non curano).'),
    P(1, 'Incantesimi', 'Lanci incantesimi da paladino con il Carisma; puoi usare un simbolo sacro come focus. Prepari incantesimi di 1° livello o superiore secondo la tabella del paladino (2 al 1° livello); dopo un riposo lungo puoi sostituirne uno. Gli slot si recuperano con un riposo lungo.'),
    P(1, 'Maestria nelle armi', 'Usi la proprietà di maestria di 2 tipi di armi in cui sei competente. Dopo un riposo lungo puoi cambiare i tipi scelti.'),
    P(2, 'Stile di combattimento', 'Ottieni un talento Stile di combattimento a scelta. In alternativa, Guerriero benedetto: impari due trucchetti da chierico (consigliati Guida e Fiamma sacra) che contano come incantesimi da paladino e usano il Carisma; quando sali di livello puoi sostituirne uno.'),
    P(2, 'Punizione del paladino', 'Hai sempre preparato l\'incantesimo Punizione divina e puoi lanciarlo senza slot una volta per riposo lungo.'),
    P(3, 'Incanalare divinità', 'Usi: 2 (3 dall\'11° livello); ne recuperi uno con un riposo breve e tutti con un riposo lungo. CD = CD dei tuoi incantesimi. Percezione divina (azione bonus): per 10 minuti, o finché sei Incapacitato, sai dove sono e di che tipo sono i celestiali, gli immondi e i non morti entro 18 m, e percepisci luoghi e oggetti consacrati o profanati.'),
    ASI(4, 8, 12, 16),
    P(5, 'Attacco extra', 'Attacchi due volte quando usi l\'azione di Attacco nel tuo turno.'),
    P(5, 'Destriero fedele', 'Hai sempre preparato Trova destriero e puoi lanciarlo senza slot una volta per riposo lungo.'),
    P(6, 'Aura di protezione', 'Emani un\'aura invisibile di 3 m. Tu e i tuoi alleati nell\'aura ottenete ai tiri salvezza un bonus pari al tuo modificatore di Carisma (minimo +1). L\'aura non funziona se sei Incapacitato. Con più paladini, ogni creatura beneficia di una sola aura alla volta. (Su di te l\'app la conta da sola.)'),
    P(9, 'Abiurare i nemici', 'Azione Magia, spendendo un uso di Incanalare divinità: fino a tante creature che vedi entro 18 m quanto il tuo modificatore di Carisma (minimo 1) fanno un tiro salvezza su Saggezza; chi fallisce è Spaventato per 1 minuto o finché subisce danni e, nei suoi turni, può fare solo una cosa tra muoversi, un\'azione o un\'azione bonus.'),
    P(10, 'Aura di coraggio', 'Tu e i tuoi alleati siete immuni alla condizione Spaventato mentre siete nella tua Aura di protezione; un alleato Spaventato che entra nell\'aura non ne subisce gli effetti finché ci resta.'),
    P(11, 'Colpi radiosi', 'Quando colpisci con un\'arma da mischia o un colpo senz\'armi, il bersaglio subisce 1d8 danni radiosi extra.'),
    P(14, 'Tocco ristoratore', 'Con Imposizione delle mani puoi anche togliere le condizioni Accecato, Affascinato, Assordato, Spaventato, Paralizzato o Stordito, spendendo 5 punti della riserva per ciascuna (quei punti non curano).'),
    P(18, 'Espansione dell\'aura', 'La tua Aura di protezione diventa un\'emanazione di 9 m.'),
    DONO('Dono della vista del vero'),
  ],
  Ranger: [
    P(1, 'Incantesimi', 'Lanci incantesimi da ranger con la Saggezza; puoi usare un focus druidico. Prepari incantesimi di 1° livello o superiore secondo la tabella del ranger (2 al 1° livello); dopo un riposo lungo puoi sostituirne uno. Gli slot si recuperano con un riposo lungo.'),
    P(1, 'Nemico prescelto', 'Hai sempre preparato Marchio del cacciatore e puoi lanciarlo senza slot 2 volte per riposo lungo (3 al 5°, 4 al 9°, 5 al 13°, 6 al 17° livello).'),
    P(1, 'Maestria nelle armi', 'Usi la proprietà di maestria di 2 tipi di armi in cui sei competente. Dopo un riposo lungo puoi cambiare i tipi scelti.'),
    P(2, 'Esploratore abile', 'Ottieni la maestria (competenza doppia) in un\'abilità in cui sei già competente e impari due lingue a scelta.'),
    P(2, 'Stile di combattimento', 'Ottieni un talento Stile di combattimento a scelta. In alternativa, Guerriero druidico: impari due trucchetti da druido (consigliati Guida e Scintilla stellare) che contano come incantesimi da ranger e usano la Saggezza; quando sali di livello puoi sostituirne uno.'),
    ASI(4, 8, 12, 16),
    P(5, 'Attacco extra', 'Attacchi due volte quando usi l\'azione di Attacco nel tuo turno.'),
    P(6, 'Girovago', 'La tua velocità aumenta di 3 m se non indossi un\'armatura pesante, e hai velocità di scalare e di nuotare pari alla tua velocità. (L\'app somma i 3 m da sola.)'),
    P(9, 'Maestria', 'Ottieni la maestria in due abilità in cui sei competente e non hai già la maestria.'),
    P(10, 'Instancabile', 'Azione Magia: ottieni 1d8 + Saggezza PF temporanei (minimo 1); usi pari al modificatore di Saggezza (minimo 1), recuperati con un riposo lungo. Inoltre alla fine di ogni riposo breve il tuo livello di Sfinimento cala di 1.'),
    P(13, 'Cacciatore implacabile', 'Subire danni non può interrompere la tua concentrazione su Marchio del cacciatore.'),
    P(14, 'Velo della natura', 'Con un\'azione bonus diventi Invisibile fino alla fine del tuo turno successivo. Usi pari al modificatore di Saggezza (minimo 1), recuperati con un riposo lungo.'),
    P(17, 'Cacciatore preciso', 'Hai vantaggio ai tiri per colpire contro la creatura segnata dal tuo Marchio del cacciatore.'),
    P(18, 'Sensi ferini', 'Ottieni la vista cieca entro 9 m.'),
    DONO('Dono del viaggio dimensionale'),
    P(20, 'Sterminatore di nemici', 'Il dado dei danni del tuo Marchio del cacciatore diventa d10 invece di d6.'),
  ],
  Ladro: [
    P(1, 'Maestria', 'Ottieni la maestria (competenza doppia) in due abilità in cui sei competente. Consigliate: Rapidità di mano e Furtività.', { id: 'maestria-1' }),
    P(1, 'Attacco furtivo', 'Una volta per turno infliggi danni extra (1d6, che crescono di 1d6 ogni due livelli da ladro: vedi tabella) a una creatura che colpisci con un\'arma accurata o a distanza, se hai vantaggio al tiro. Non serve il vantaggio se un tuo alleato non Incapacitato è entro 1,5 m dal bersaglio e tu non hai svantaggio. Il danno extra è dello stesso tipo dell\'arma.'),
    P(1, 'Gergo dei ladri', 'Conosci il gergo dei ladri e un\'altra lingua a scelta.'),
    P(1, 'Maestria nelle armi', 'Usi la proprietà di maestria di 2 tipi di armi in cui sei competente. Dopo un riposo lungo puoi cambiare i tipi scelti.'),
    P(2, 'Azione scaltra', 'Nel tuo turno puoi fare Scatto, Disimpegno o Nascondersi con un\'azione bonus.'),
    P(3, 'Mira ferma', 'Con un\'azione bonus ti dai vantaggio al prossimo tiro per colpire del turno. Solo se non ti sei mosso in questo turno; dopo, la tua velocità è 0 fino alla fine del turno.'),
    ASI(4, 8, 10, 12, 16),
    P(5, 'Colpo astuto', 'Quando infliggi l\'Attacco furtivo puoi rinunciare ad alcuni suoi dadi per aggiungere un effetto (CD 8 + Destrezza + competenza). Veleno (1d6, serve un kit da avvelenatore): tiro salvezza su Costituzione o Avvelenato per 1 minuto, ripetendo il tiro alla fine di ogni turno. Sgambetto (1d6): se è Grande o più piccolo, tiro salvezza su Destrezza o cade Prono. Ritirata (1d6): subito dopo l\'attacco ti muovi fino a metà velocità senza provocare attacchi di opportunità.'),
    P(5, 'Schivata prodigiosa', 'Quando un attaccante che vedi ti colpisce con un tiro per colpire, con la reazione dimezzi il danno dell\'attacco.'),
    P(6, 'Maestria', 'Ottieni la maestria in altre due abilità in cui sei competente.', { id: 'maestria-6' }),
    P(7, 'Elusione', 'Quando un effetto ti permette un tiro salvezza su Destrezza per subire metà danni, se lo superi non subisci danni e se lo fallisci ne subisci la metà. Non funziona se sei Incapacitato.'),
    P(7, 'Talento affidabile', 'Nelle prove di caratteristica che usano un\'abilità o uno strumento in cui sei competente, un 9 o meno sul d20 conta come 10.'),
    P(11, 'Colpo astuto migliorato', 'Puoi usare fino a due effetti di Colpo astuto quando infliggi l\'Attacco furtivo, pagando il costo di ciascuno.'),
    P(14, 'Colpi subdoli', 'Nuovi effetti di Colpo astuto. Stordimento (2d6): tiro salvezza su Costituzione o nel suo turno successivo può fare solo una cosa tra muoversi, un\'azione o un\'azione bonus. Tramortire (6d6): tiro salvezza su Costituzione o è Privo di sensi per 1 minuto o finché subisce danni, ripetendo il tiro alla fine di ogni turno. Oscurare (3d6): tiro salvezza su Destrezza o è Accecato fino alla fine del suo turno successivo.'),
    P(15, 'Mente sfuggente', 'Ottieni la competenza nei tiri salvezza su Saggezza e Carisma.'),
    P(18, 'Inafferrabile', 'Nessun tiro per colpire contro di te può avere vantaggio, a meno che tu non sia Incapacitato.'),
    DONO('Dono dello spirito della notte'),
    P(20, 'Colpo di fortuna', 'Se fallisci un tiro d20, puoi trasformare il risultato in un 20. Una volta per riposo breve o lungo.'),
  ],
  Stregone: [
    P(1, 'Incantesimi', 'Lanci incantesimi da stregone con il Carisma; puoi usare un focus arcano. Conosci 4 trucchetti (5 al 4°, 6 al 10° livello) e prepari incantesimi di 1° livello o superiore secondo la tabella dello stregone; quando sali di livello puoi sostituirne uno. Gli slot si recuperano con un riposo lungo.'),
    P(1, 'Stregoneria innata', 'Con un\'azione bonus liberi la tua magia per 1 minuto: la CD dei tuoi incantesimi da stregone aumenta di 1 e hai vantaggio ai tiri per colpire degli incantesimi da stregone. Due usi, recuperati con un riposo lungo.'),
    P(2, 'Fonte di magia', 'Hai punti stregoneria pari al tuo livello da stregone, recuperati con un riposo lungo. Puoi spendere uno slot per ottenere tanti punti quanto il suo livello (senza azione). Con un\'azione bonus puoi creare uno slot (massimo 5° livello) spendendo punti: 1° livello 2 punti, 2° 3 punti (serve livello 3), 3° 5 punti (livello 5), 4° 6 punti (livello 7), 5° 7 punti (livello 9). Gli slot creati spariscono con un riposo lungo.'),
    P(2, 'Metamagia', 'Conosci 2 opzioni di metamagia (2 in più al 10° e al 17° livello; quando sali di livello puoi sostituirne una). Una sola opzione per incantesimo, salvo dove indicato. Incantesimo attento (1 punto): fino a tante creature quanto il tuo Carisma (minimo 1) superano in automatico il tiro salvezza e non subiscono danni se ne subirebbero metà. Incantesimo distante (1): raddoppia la gittata (almeno 1,5 m) o porta il contatto a 9 m. Incantesimo potenziato (1): ritiri fino a tanti dadi di danno quanto il Carisma (minimo 1); combinabile con altre opzioni. Incantesimo esteso (1): raddoppia una durata di almeno 1 minuto (massimo 24 ore) e dà vantaggio ai TS di concentrazione. Incantesimo intensificato (2): un bersaglio ha svantaggio ai tiri salvezza contro l\'incantesimo. Incantesimo rapido (2): un incantesimo da un\'azione si lancia con un\'azione bonus (non se nel turno hai già lanciato o lancerai un incantesimo di 1° livello o superiore). Incantesimo cercatore (1): se manchi con un tiro per colpire dell\'incantesimo, ritiri il d20; combinabile. Incantesimo sottile (1): niente componenti verbali, somatiche né materiali (tranne quelle consumate o con un costo). Incantesimo trasmutato (1): cambi il tipo di danno tra acido, freddo, fuoco, fulmine, veleno e tuono. Incantesimo gemello (1): aumenti di 1 il livello effettivo di un incantesimo che con slot superiori colpisce una creatura in più.'),
    ASI(4, 8, 12, 16),
    P(5, 'Recupero stregonesco', 'Alla fine di un riposo breve recuperi punti stregoneria spesi, fino a metà del tuo livello da stregone (per difetto). Una volta per riposo lungo.'),
    P(7, 'Stregoneria incarnata', 'Se non hai più usi di Stregoneria innata puoi attivarla spendendo 2 punti stregoneria. Mentre è attiva puoi usare fino a due opzioni di metamagia su ogni incantesimo.'),
    DONO('Dono del viaggio dimensionale'),
    P(20, 'Apoteosi arcana', 'Mentre Stregoneria innata è attiva, in ognuno dei tuoi turni puoi usare un\'opzione di metamagia senza spendere punti stregoneria.'),
  ],
  Warlock: [
    P(1, 'Suppliche occulte', 'Conosci 1 supplica (es. Patto del tomo); ne ottieni altre salendo di livello secondo la tabella del warlock (fino a 10 al 18° livello). Quando sali di livello puoi sostituirne una (non se è requisito di un\'altra); non puoi prendere due volte la stessa salvo indicazione.'),
    P(1, 'Elenco delle suppliche', 'Deflagrazione agonizzante (liv. 2, ripetibile): aggiungi il Carisma ai danni di un trucchetto da warlock che infligge danni. Armatura delle ombre: Armatura magica su di te senza slot. Passo ascendente (liv. 5): Levitazione su di te senza slot. Vista del diavolo (liv. 2): vedi normalmente in luce fioca e oscurità, anche magica, entro 36 m. Lama divorante (liv. 12, Lama assetata): l\'Attacco extra dell\'arma del patto dà due attacchi in più. Mente occulta: vantaggio ai TS su Costituzione per la concentrazione. Punizione occulta (liv. 5, Patto della lama): una volta per turno, colpendo con l\'arma del patto, spendi uno slot del patto per +1d8 danni da forza più 1d8 per livello dello slot, e puoi far cadere Prono un bersaglio Enorme o più piccolo. Lancia occulta (liv. 2, ripetibile): un trucchetto da warlock con gittata di almeno 3 m guadagna 9 m di gittata per livello da warlock. Vigore immondo (liv. 2): Falsa vita su di te senza slot, con il massimo del dado. Sguardo di due menti (liv. 5): con un\'azione bonus tocchi una creatura consenziente e percepisci con i suoi sensi fino alla fine del tuo turno successivo (prolungabile); se siete entro 18 m puoi lanciare incantesimi come se fossi nel suo spazio. Dono degli abissi (liv. 5): respiri sott\'acqua, velocità di nuotare pari alla tua velocità e Respirare sott\'acqua senza slot una volta per riposo lungo. Dono dei protettori (liv. 9, Patto del tomo): fino a tante creature quanto il tuo Carisma scrivono il nome nel libro; la prima che scende a 0 PF senza morire resta a 1 PF (una volta per riposo lungo). Investitura del maestro della catena (liv. 5, Patto della catena): il famiglio ottiene volare o nuotare 12 m, attacca con la tua azione bonus, può fare danni necrotici o radiosi, usa la tua CD e con la tua reazione ottiene resistenza a un danno. Lezioni dei Primi (liv. 2, ripetibile): un talento delle origini a scelta. Bevitore di vita (liv. 9, Patto della lama): una volta per turno, colpendo con l\'arma del patto, +1d6 danni necrotici, psichici o radiosi e puoi spendere un dado vita per curarti (dado + Costituzione, minimo 1). Maschera dai molti volti (liv. 2): Camuffare se stesso senza slot. Maestro delle miriadi forme (liv. 5): Alterare se stesso senza slot. Visioni nebbiose (liv. 2): Immagine silenziosa senza slot. Uno con le ombre (liv. 5): in luce fioca o oscurità, Invisibilità su di te senza slot. Balzo ultraterreno (liv. 2): Salto su di te senza slot. Patto della lama: con un\'azione bonus evochi un\'arma da mischia semplice o da guerra (o ti leghi a un\'arma magica): ne sei competente, è il tuo focus, puoi usare il Carisma per colpire e per i danni e farle infliggere danni necrotici, psichici o radiosi. Patto della catena: impari Trova famiglio e lo lanci come azione Magia senza slot, anche in forme speciali (imp, pseudodrago, quasit, scheletro, girino di slaad, sfinge delle meraviglie, folletto, serpente velenoso); rinunciando a un tuo attacco il famiglio attacca con la reazione. Patto del tomo: alla fine di ogni riposo evochi un Libro delle ombre con 3 trucchetti e 2 incantesimi rituali di 1° livello di qualsiasi lista, preparati finché lo porti; fa da focus. Deflagrazione respingente (liv. 2, ripetibile): un trucchetto da warlock con tiro per colpire spinge di 3 m un bersaglio Grande o più piccolo. Lama assetata (liv. 5, Patto della lama): Attacco extra con l\'arma del patto. Visioni di regni lontani (liv. 9): Occhio arcano senza slot. Sussurri della tomba (liv. 7): Parlare con i morti senza slot. Vista della strega (liv. 15): vista del vero entro 9 m.'),
    P(1, 'Magia del patto', 'Lanci incantesimi da warlock con il Carisma; puoi usare un focus arcano. Conosci 2 trucchetti (3 al 4°, 4 al 10° livello). Hai pochi slot, tutti dello stesso livello (fino al 5°, secondo la tabella), che recuperi con un riposo breve o lungo. Prepari incantesimi secondo la tabella del warlock, di livello non superiore a quello dei tuoi slot; quando sali di livello puoi sostituirne uno.'),
    P(2, 'Astuzia magica', 'Con un rito di 1 minuto recuperi slot del patto spesi, fino a metà del tuo massimo (per eccesso). Una volta per riposo lungo.'),
    ASI(4, 8, 12, 16),
    P(9, 'Contattare il patrono', 'Hai sempre preparato Contattare altri piani; puoi lanciarlo senza slot per parlare con il tuo patrono e superi in automatico il suo tiro salvezza. Una volta per riposo lungo.'),
    P(11, 'Arcano mistico', 'Scegli un incantesimo da warlock di 6° livello: puoi lanciarlo una volta senza slot, e di nuovo dopo un riposo lungo. Ne ottieni un altro di 7° livello al 13°, di 8° al 15° e di 9° al 17° livello. Quando sali di livello puoi sostituirne uno con un altro dello stesso livello.'),
    DONO('Dono del fato'),
    P(20, 'Maestro dell\'occulto', 'Quando usi Astuzia magica recuperi tutti gli slot del patto spesi.'),
  ],
  Mago: [
    P(1, 'Incantesimi', 'Lanci incantesimi da mago con l\'Intelligenza; puoi usare un focus arcano o il libro degli incantesimi. Conosci 3 trucchetti (4 al 4°, 5 al 10° livello; dopo un riposo lungo puoi sostituirne uno). Il libro degli incantesimi (oggetto Minuscolo, 1,5 kg, 100 pagine) parte con sei incantesimi di 1° livello e ne aggiunge due gratis a ogni livello. Prepari dal libro gli incantesimi secondo la tabella del mago e dopo un riposo lungo puoi cambiarli. Copiare un incantesimo trovato costa 2 ore e 50 mo per livello.'),
    P(1, 'Esperto di rituali', 'Puoi lanciare come rituale qualsiasi incantesimo rituale presente nel tuo libro, anche se non è preparato, leggendolo dal libro.'),
    P(1, 'Recupero arcano', 'Alla fine di un riposo breve recuperi slot spesi per un totale di livelli pari a metà del tuo livello da mago (per eccesso), nessuno di 6° livello o superiore. Una volta per riposo lungo.'),
    P(2, 'Studioso', 'Ottieni la maestria (competenza doppia) in un\'abilità in cui sei competente tra Arcano, Storia, Indagare, Medicina, Natura e Religione.'),
    ASI(4, 8, 12, 16),
    P(5, 'Memorizzare un incantesimo', 'Alla fine di un riposo breve puoi sostituire un incantesimo di 1° livello o superiore che hai preparato con un altro del tuo libro.'),
    P(18, 'Padronanza degli incantesimi', 'Scegli un incantesimo di 1° e uno di 2° livello del tuo libro che si lanciano con un\'azione: li hai sempre preparati e puoi lanciarli al loro livello più basso senza slot (a livello superiore spendi uno slot). Dopo un riposo lungo puoi sostituirne uno con un altro dello stesso livello.'),
    DONO('Dono del richiamo degli incantesimi'),
    P(20, 'Incantesimi distintivi', 'Scegli due incantesimi di 3° livello del tuo libro: li hai sempre preparati e puoi lanciarli ciascuno una volta al 3° livello senza slot, e di nuovo dopo un riposo breve o lungo (a livello superiore spendi uno slot).'),
  ],
  // «fine classi»
};

// ───────────────────────── Sottoclassi ─────────────────────────
// alias: altri nomi con cui la sottoclasse può essere scritta nella scheda (inglese, nomi brevi)
export const SOTTOCLASSI = {
  Barbaro: [
    SOTTO('berserker', 'Cammino del Berserker', 'Path of the Berserker', ['berserker'], [
      P(3, 'Frenesia', 'Se usi Attacco irruento mentre sei in ira, il primo bersaglio che colpisci nel tuo turno con un attacco che usa la Forza subisce danni extra: tira tanti d6 quanto il tuo bonus ai danni da ira (stesso tipo di danno dell\'arma o del colpo senz\'armi).'),
      P(6, 'Ira cieca', 'Mentre sei in ira sei immune alle condizioni Affascinato e Spaventato; se ce l\'hai quando entri in ira, finisce.'),
      P(10, 'Rappresaglia', 'Quando subisci danni da una creatura entro 1,5 m da te, con la reazione puoi fare un attacco in mischia contro di lei, con un\'arma o un colpo senz\'armi.'),
      P(14, 'Presenza intimidatoria', 'Azione bonus: le creature che scegli in un\'emanazione di 9 m fanno un tiro salvezza su Saggezza (CD 8 + modificatore di Forza + bonus di competenza); chi fallisce è Spaventato per 1 minuto e ripete il tiro alla fine di ogni suo turno. Una volta per riposo lungo, oppure spendi un uso di Ira (senza azione) per poterla riusare.'),
    ]),
    SOTTO('cuore-selvaggio', 'Cammino del Cuore Selvaggio', 'Path of the Wild Heart', ['cuore selvaggio', 'wild heart'], [
      P(3, 'Voce degli animali', 'Puoi lanciare Senso bestiale e Parlare con gli animali, ma solo come rituali. La caratteristica da incantatore è la Saggezza.'),
      P(3, 'Ira delle terre selvagge', 'Ogni volta che entri in ira scegli un\'opzione. Orso: resistenza a tutti i danni tranne forza, necrotici, psichici e radiosi. Aquila: entrando in ira fai anche Disimpegno e Scatto con la stessa azione bonus; mentre sei in ira puoi farli entrambi con un\'azione bonus. Lupo: i tuoi alleati hanno vantaggio ai tiri per colpire contro i tuoi nemici entro 1,5 m da te.'),
      P(6, 'Aspetto delle terre selvagge', 'Scegli un\'opzione (puoi cambiarla dopo un riposo lungo). Gufo: scurovisione 18 m (o +18 m se già ce l\'hai). Pantera: velocità di scalare pari alla tua velocità. Salmone: velocità di nuotare pari alla tua velocità.'),
      P(10, 'Voce della natura', 'Puoi lanciare Comunione con la natura, ma solo come rituale. La caratteristica da incantatore è la Saggezza.'),
      P(14, 'Potere delle terre selvagge', 'Ogni volta che entri in ira scegli un\'opzione. Falco: velocità di volare pari alla tua velocità, se non indossi armature. Leone: i nemici entro 1,5 m da te hanno svantaggio ai tiri per colpire contro chiunque non sia te o un altro barbaro con questa opzione. Ariete: quando colpisci in mischia una creatura Grande o più piccola puoi farla cadere Prona.'),
    ]),
    SOTTO('albero-del-mondo', 'Cammino dell\'Albero del Mondo', 'Path of the World Tree', ['albero del mondo', 'world tree'], [
      P(3, 'Vitalità dell\'albero', 'Scarica vitale: quando entri in ira ottieni PF temporanei pari al tuo livello da barbaro. Forza vitale: all\'inizio di ogni tuo turno in ira puoi dare a un\'altra creatura entro 3 m tanti PF temporanei quanto il risultato di un numero di d6 pari al tuo bonus ai danni da ira; quelli rimasti spariscono quando l\'ira finisce.'),
      P(6, 'Rami dell\'albero', 'In ira, quando una creatura che vedi inizia il suo turno entro 9 m da te, con la reazione la fai avvolgere dai rami: tiro salvezza su Forza (CD 8 + modificatore di Forza + bonus di competenza) o viene teletrasportata in uno spazio libero che vedi entro 1,5 m da te (o il più vicino). Poi puoi ridurre la sua velocità a 0 fino alla fine del turno.'),
      P(10, 'Radici travolgenti', 'Nel tuo turno la portata delle armi da mischia con la proprietà Pesante o Versatile aumenta di 3 m. Quando colpisci con una di queste armi nel tuo turno puoi attivare la maestria Spingere o Rovesciare in aggiunta a un\'altra maestria che usi con quell\'arma.'),
      P(14, 'Viaggio lungo l\'albero', 'Quando entri in ira, e con un\'azione bonus mentre sei in ira, puoi teletrasportarti fino a 18 m in uno spazio libero che vedi. Una volta per ira la distanza sale a 45 m e puoi portare fino a sei creature consenzienti entro 3 m da te: arrivano in spazi liberi entro 3 m dalla tua destinazione.'),
    ]),
    SOTTO('zelota', 'Cammino dello Zelota', 'Path of the Zealot', ['zelota', 'zealot'], [
      P(3, 'Furia divina', 'In ognuno dei tuoi turni in ira, la prima creatura che colpisci con un\'arma o un colpo senz\'armi subisce danni extra pari a 1d6 + metà del tuo livello da barbaro (per difetto), necrotici o radiosi a tua scelta.'),
      P(3, 'Guerriero degli dei', 'Hai una riserva di 4d12 per curarti (5 dadi al 6°, 6 al 12°, 7 al 17° livello): con un\'azione bonus spendi dei dadi, li tiri e recuperi quei PF. La riserva si ricarica con un riposo lungo.'),
      P(6, 'Concentrazione fanatica', 'Una volta per ira, se fallisci un tiro salvezza puoi ritirarlo con un bonus pari al tuo bonus ai danni da ira; devi usare il nuovo risultato.'),
      P(10, 'Presenza zelante', 'Azione bonus: un grido di battaglia dà a un massimo di dieci altre creature a scelta entro 18 m vantaggio ai tiri per colpire e ai tiri salvezza fino all\'inizio del tuo turno successivo. Una volta per riposo lungo, oppure spendi un uso di Ira (senza azione) per poterla riusare.'),
      P(14, 'Ira degli dei', 'Quando entri in ira puoi assumere la forma di un guerriero divino per 1 minuto o finché scendi a 0 PF (una volta per riposo lungo). In questa forma: velocità di volare pari alla tua velocità e puoi librarti; resistenza ai danni necrotici, psichici e radiosi; quando una creatura entro 9 m da te sta per scendere a 0 PF, con la reazione puoi spendere un uso di Ira per portare invece i suoi PF a un valore pari al tuo livello da barbaro.'),
    ]),
  ],
  Bardo: [
    SOTTO('danza', 'Collegio della Danza', 'College of Dance', ['danza', 'dance'], [
      P(3, 'Passo abbagliante', 'Se non indossi armature né scudo: vantaggio alle prove di Intrattenere in cui balli; CA base 10 + DES + CAR (Difesa senza armatura); quando spendi un uso di Ispirazione bardica come parte di un\'azione, azione bonus o reazione, puoi fare anche un colpo senz\'armi; i colpi senz\'armi possono usare la Destrezza per colpire e, invece del danno normale, fanno danni contundenti pari a un tiro del dado di Ispirazione + DES (senza spendere il dado).'),
      P(6, 'Movimento ispirato', 'Quando un nemico che vedi finisce il turno entro 1,5 m da te, con la reazione e spendendo un uso di Ispirazione bardica ti muovi fino a metà della velocità; poi un alleato entro 9 m può muoversi fino a metà della sua velocità con la sua reazione. Questi movimenti non provocano attacchi di opportunità.'),
      P(6, 'Passi in tandem', 'Quando tiri l\'iniziativa, se non sei Incapacitato, puoi spendere un uso di Ispirazione bardica: tira il dado e tu e ogni alleato entro 9 m che ti vede o ti sente sommate il risultato all\'iniziativa.'),
      P(14, 'Evasione guidata', 'Quando un effetto ti permette un tiro salvezza su Destrezza per subire metà danni, se lo superi non subisci danni e se lo fallisci ne subisci la metà. Puoi estendere questo beneficio alle creature entro 1,5 m che fanno lo stesso tiro. Non funziona se sei Incapacitato.'),
    ]),
    SOTTO('fascino', 'Collegio del Fascino', 'College of Glamour', ['fascino', 'glamour'], [
      P(3, 'Magia seducente', 'Hai sempre preparati Charme su persone e Immagine speculare. Subito dopo aver lanciato un incantesimo di ammaliamento o illusione con uno slot, una creatura che vedi entro 18 m fa un tiro salvezza su Saggezza contro la tua CD: se fallisce è Affascinata o Spaventata (a tua scelta) per 1 minuto e ripete il tiro alla fine di ogni suo turno. Una volta per riposo lungo, oppure spendi un uso di Ispirazione bardica per riaverla.'),
      P(3, 'Manto di ispirazione', 'Azione bonus: spendi un uso di Ispirazione bardica e tira il dado. Fino a tante altre creature entro 18 m quanto il tuo modificatore di Carisma (minimo 1) ottengono PF temporanei pari al doppio del risultato e possono usare la reazione per muoversi fino alla loro velocità senza provocare attacchi di opportunità.'),
      P(6, 'Manto di maestà', 'Hai sempre preparato Comando. Con un\'azione bonus lanci Comando senza slot e assumi un aspetto ultraterreno per 1 minuto (o finché finisce la concentrazione): nel frattempo puoi lanciare Comando con un\'azione bonus senza slot. Chi è Affascinato da te fallisce in automatico il tiro salvezza contro questi Comando. Una volta per riposo lungo, oppure spendi uno slot di 3° livello o superiore per riaverlo.'),
      P(14, 'Maestà infrangibile', 'Azione bonus: per 1 minuto (o finché diventi Incapacitato) la prima volta in ogni turno che una creatura ti colpisce con un tiro per colpire deve superare un tiro salvezza su Carisma contro la tua CD, altrimenti l\'attacco manca. Una volta per riposo breve o lungo.'),
    ]),
    SOTTO('sapienza', 'Collegio della Sapienza', 'College of Lore', ['sapienza', 'conoscenza', 'lore'], [
      P(3, 'Competenze bonus', 'Ottieni la competenza in tre abilità a tua scelta.'),
      P(3, 'Parole taglienti', 'Quando una creatura che vedi entro 18 m fa un tiro per i danni o supera una prova di caratteristica o un tiro per colpire, con la reazione spendi un uso di Ispirazione bardica: tira il dado e sottrai il risultato dal suo tiro, riducendo i danni o trasformando il successo in fallimento.'),
      P(6, 'Scoperte magiche', 'Impari due incantesimi a scelta dalle liste del chierico, del druido o del mago (trucchetti o di un livello per cui hai slot). Li hai sempre preparati; quando sali di livello puoi sostituirne uno.'),
      P(14, 'Abilità impareggiabile', 'Quando fallisci una prova di caratteristica o un tiro per colpire puoi spendere un uso di Ispirazione bardica: tira il dado e sommalo al d20. Se fallisci comunque, l\'uso non viene speso.'),
    ]),
    SOTTO('valore', 'Collegio del Valore', 'College of Valor', ['valore', 'valor'], [
      P(3, 'Ispirazione in combattimento', 'Chi ha un tuo dado di Ispirazione bardica può usarlo anche così. Difesa: quando viene colpito da un tiro per colpire, con la reazione somma il dado alla sua CA contro quell\'attacco. Attacco: subito dopo aver colpito con un tiro per colpire, somma il dado ai danni contro quel bersaglio.'),
      P(3, 'Addestramento marziale', 'Competenza con le armi da guerra e addestramento alle armature medie e agli scudi. Puoi usare un\'arma semplice o da guerra come focus per gli incantesimi da bardo.'),
      P(6, 'Attacco extra', 'Attacchi due volte quando usi l\'azione di Attacco. Puoi sostituire uno di questi attacchi con un tuo trucchetto che si lancia con un\'azione.'),
      P(14, 'Magia da battaglia', 'Dopo aver lanciato un incantesimo con tempo di lancio di un\'azione, puoi fare un attacco con un\'arma come azione bonus.'),
    ]),
  ],
  Chierico: [
    SOTTO('vita', 'Dominio della Vita', 'Life Domain', ['vita', 'life'], [
      P(3, 'Discepolo della vita', 'Quando un incantesimo lanciato con uno slot fa recuperare PF a una creatura, nello stesso turno ne recupera altri 2 + il livello dello slot.'),
      P(3, 'Incantesimi del dominio', 'Hai sempre preparati: 3° livello Aiuto, Benedizione, Cura ferite, Ristorare inferiore; 5° Parola guaritrice di massa, Revivificare; 7° Aura di vita, Interdizione alla morte; 9° Ristorare superiore, Cura ferite di massa.'),
      P(3, 'Preservare la vita', 'Azione Magia, spendendo un uso di Incanalare divinità: distribuisci fino a 5 × il tuo livello da chierico PF tra creature Sanguinanti (sotto metà PF) entro 9 m, anche te. Non puoi portare nessuno oltre la metà dei suoi PF massimi.'),
      P(6, 'Guaritore benedetto', 'Subito dopo aver lanciato con uno slot un incantesimo che cura altre creature, recuperi anche tu 2 + il livello dello slot PF.'),
      P(17, 'Guarigione suprema', 'Quando curi con un incantesimo o con Incanalare divinità non tiri i dadi: ogni dado vale il massimo (es. 2d6 = 12).'),
    ]),
    SOTTO('luce', 'Dominio della Luce', 'Light Domain', ['luce', 'light'], [
      P(3, 'Incantesimi del dominio', 'Hai sempre preparati: 3° livello Mani brucianti, Luminescenza, Raggio rovente, Vedere invisibilità; 5° Luce diurna, Palla di fuoco; 7° Occhio arcano, Muro di fuoco; 9° Colpo infuocato, Scrutare.'),
      P(3, 'Radiosità dell\'alba', 'Azione Magia, spendendo un uso di Incanalare divinità: un lampo in un\'emanazione di 9 m dissolve l\'oscurità magica; le creature a tua scelta nell\'area fanno un tiro salvezza su Costituzione e subiscono 2d10 + il tuo livello da chierico danni radiosi (metà se riescono).'),
      P(3, 'Lampo di interdizione', 'Quando una creatura che vedi entro 9 m fa un tiro per colpire, con la reazione le imponi svantaggio. Usi pari al modificatore di Saggezza (minimo 1), recuperati con un riposo lungo.'),
      P(6, 'Lampo di interdizione migliorato', 'Recuperi gli usi di Lampo di interdizione anche con un riposo breve. Quando lo usi puoi dare al bersaglio dell\'attacco 2d6 + Saggezza PF temporanei.'),
      P(17, 'Corona di luce', 'Azione Magia: per 1 minuto emetti luce intensa in un raggio di 18 m e fioca per altri 9 m. I nemici nella luce intensa hanno svantaggio ai tiri salvezza contro Radiosità dell\'alba e contro gli incantesimi che infliggono danni da fuoco o radiosi. Usi pari al modificatore di Saggezza (minimo 1), recuperati con un riposo lungo.'),
    ]),
    SOTTO('inganno', 'Dominio dell\'Inganno', 'Trickery Domain', ['inganno', 'trickery'], [
      P(3, 'Benedizione dell\'imbroglione', 'Azione Magia: tu o una creatura consenziente entro 9 m avete vantaggio alle prove di Destrezza (Furtività) finché non completi un riposo lungo o usi di nuovo questo privilegio.'),
      P(3, 'Invocare duplicato', 'Azione bonus, spendendo un uso di Incanalare divinità: crei un\'illusione perfetta e intangibile di te in uno spazio libero entro 9 m, per 1 minuto (finisce se la congedi o sei Incapacitato). Puoi lanciare incantesimi come se fossi nel suo spazio (usando i tuoi sensi); se tu e l\'illusione siete entro 1,5 m da una creatura che la vede, hai vantaggio ad attaccarla; con un\'azione bonus la sposti fino a 9 m (restando entro 36 m da te).'),
      P(3, 'Incantesimi del dominio', 'Hai sempre preparati: 3° livello Charme su persone, Camuffare se stesso, Invisibilità, Passare senza tracce; 5° Trama ipnotica, Anti-individuazione; 7° Confusione, Porta dimensionale; 9° Dominare persone, Modificare memoria.'),
      P(6, 'Trasposizione dell\'imbroglione', 'Ogni volta che usi l\'azione bonus per creare o spostare l\'illusione di Invocare duplicato, puoi teletrasportarti scambiandoti di posto con lei.'),
      P(17, 'Duplicato migliorato', 'Distrazione condivisa: tu e i tuoi alleati avete vantaggio ad attaccare le creature entro 1,5 m dall\'illusione. Illusione guaritrice: quando l\'illusione finisce, tu o una creatura a scelta entro 1,5 m da lei recuperate PF pari al tuo livello da chierico.'),
    ]),
    SOTTO('guerra', 'Dominio della Guerra', 'War Domain', ['guerra', 'war'], [
      P(3, 'Colpo guidato', 'Quando tu o una creatura entro 9 m mancate con un tiro per colpire, puoi spendere un uso di Incanalare divinità per dare +10 a quel tiro. Se aiuti un\'altra creatura devi usare la reazione.'),
      P(3, 'Incantesimi del dominio', 'Hai sempre preparati: 3° livello Dardo guida, Arma magica, Scudo della fede, Arma spirituale; 5° Mantello del crociato, Guardiani spirituali; 7° Scudo di fuoco, Libertà di movimento; 9° Blocca mostri, Colpo del vento d\'acciaio.'),
      P(3, 'Sacerdote guerriero', 'Con un\'azione bonus fai un attacco con un\'arma o un colpo senz\'armi. Usi pari al modificatore di Saggezza (minimo 1), recuperati con un riposo breve o lungo.'),
      P(6, 'Benedizione del dio della guerra', 'Puoi spendere un uso di Incanalare divinità per lanciare Scudo della fede o Arma spirituale senza slot. Così lanciati non richiedono concentrazione: durano 1 minuto e finiscono se li lanci di nuovo, se sei Incapacitato o se muori.'),
      P(17, 'Avatar della battaglia', 'Ottieni resistenza ai danni contundenti, perforanti e taglienti.'),
    ]),
  ],
  Druido: [
    SOTTO('terra', 'Circolo della Terra', 'Circle of the Land', ['terra', 'land'], [
      P(3, 'Incantesimi del circolo', 'Dopo ogni riposo lungo scegli un tipo di terra e hai preparati i suoi incantesimi fino al tuo livello. Arida: 3° Sfocatura, Mani brucianti, Dardo di fuoco; 5° Palla di fuoco; 7° Avvizzimento; 9° Muro di pietra. Polare: 3° Nube di nebbia, Blocca persone, Raggio di gelo; 5° Tempesta di nevischio; 7° Tempesta di ghiaccio; 9° Cono di freddo. Temperata: 3° Passo velato, Stretta folgorante, Sonno; 5° Fulmine; 7° Libertà di movimento; 9° Camminare tra gli alberi. Tropicale: 3° Spruzzo acido, Raggio di malattia, Ragnatela; 5° Nube maleodorante; 7° Metamorfosi; 9° Piaga di insetti.'),
      P(3, 'Aiuto della terra', 'Azione Magia, spendendo un uso di Forma selvatica: scegli un punto entro 18 m; le creature a tua scelta in una sfera di 3 m di raggio fanno un tiro salvezza su Costituzione e subiscono 2d6 danni necrotici (metà se riescono), e una creatura a tua scelta nell\'area recupera 2d6 PF. Sale a 3d6 al 10° e 4d6 al 14° livello.'),
      P(6, 'Recupero naturale', 'Una volta per riposo lungo lanci senza slot uno degli incantesimi di 1° livello o superiore del circolo che hai preparati. Inoltre, una volta per riposo lungo, alla fine di un riposo breve recuperi slot per un totale di livelli pari a metà del tuo livello da druido (per eccesso), nessuno di 6° livello o superiore.'),
      P(10, 'Protezione della natura', 'Sei immune alla condizione Avvelenato e hai resistenza a un tipo di danno legato alla terra scelta: arida fuoco, polare freddo, temperata fulmine, tropicale veleno.'),
      P(14, 'Santuario della natura', 'Azione Magia, spendendo un uso di Forma selvatica: alberi e rampicanti spettrali riempiono un cubo di 4,5 m sul terreno entro 36 m, per 1 minuto (finisce se sei Incapacitato o muori). Tu e i tuoi alleati lì dentro avete mezza copertura e gli alleati ottengono la resistenza di Protezione della natura. Con un\'azione bonus sposti il cubo fino a 18 m (sempre entro 36 m da te).'),
    ]),
    SOTTO('luna', 'Circolo della Luna', 'Circle of the Moon', ['luna', 'moon'], [
      P(3, 'Forme del circolo', 'In forma selvatica: il grado di sfida massimo è il tuo livello da druido diviso 3 (per difetto); la tua CA è 13 + Saggezza se è più alta di quella della bestia; ottieni PF temporanei pari a 3 × il tuo livello da druido.'),
      P(3, 'Incantesimi del circolo', 'Hai sempre preparati: 3° livello Cura ferite, Raggio di luna, Scintilla stellare; 5° Evocare animali; 7° Fonte di luce lunare; 9° Cura ferite di massa. Puoi lanciarli anche in forma selvatica.'),
      P(6, 'Forme del circolo migliorate', 'In forma selvatica: i tuoi attacchi possono infliggere danni radiosi invece del loro tipo normale (scegli quando colpisci) e aggiungi il modificatore di Saggezza ai tiri salvezza su Costituzione.'),
      P(10, 'Passo di luna', 'Con un\'azione bonus ti teletrasporti fino a 9 m in uno spazio libero che vedi e hai vantaggio al prossimo tiro per colpire di questo turno. Usi pari al modificatore di Saggezza (minimo 1), recuperati con un riposo lungo; puoi riaverne uno spendendo uno slot di 2° livello o superiore.'),
      P(14, 'Forma lunare', 'Una volta per turno, quando colpisci con un attacco della forma selvatica, +2d10 danni radiosi. Quando usi Passo di luna puoi teletrasportare con te una creatura consenziente entro 3 m, che arriva entro 3 m dalla tua destinazione.'),
    ]),
    SOTTO('mare', 'Circolo del Mare', 'Circle of the Sea', ['mare', 'sea'], [
      P(3, 'Incantesimi del circolo', 'Hai sempre preparati: 3° livello Nube di nebbia, Folata di vento, Raggio di gelo, Frantumare, Onda tonante; 5° Fulmine, Respirare sott\'acqua; 7° Controllare l\'acqua, Tempesta di ghiaccio; 9° Evocare elementale, Blocca mostri.'),
      P(3, 'Collera del mare', 'Azione bonus, spendendo un uso di Forma selvatica: per 10 minuti sei circondato da un\'emanazione di spruzzi marini di 1,5 m (finisce se la congedi, la ricrei o sei Incapacitato). Quando la crei e con un\'azione bonus nei turni seguenti, una creatura che vedi nell\'emanazione fa un tiro salvezza su Costituzione contro la tua CD: se fallisce subisce danni da freddo pari a tanti d6 quanto il tuo modificatore di Saggezza (minimo 1) e, se è Grande o più piccola, viene spinta fino a 4,5 m lontano da te.'),
      P(6, 'Affinità acquatica', 'L\'emanazione di Collera del mare diventa di 3 m. Ottieni una velocità di nuotare pari alla tua velocità.'),
      P(10, 'Nato dalla tempesta', 'Mentre Collera del mare è attiva hai velocità di volare pari alla tua velocità e resistenza ai danni da freddo, fulmine e tuono.'),
      P(14, 'Dono dell\'oceano', 'Puoi creare l\'emanazione di Collera del mare intorno a una creatura consenziente entro 18 m invece che intorno a te: ne ottiene i benefici e usa la tua CD e la tua Saggezza. Spendendo due usi di Forma selvatica puoi crearla intorno a lei e a te insieme.'),
    ]),
    SOTTO('stelle', 'Circolo delle Stelle', 'Circle of the Stars', ['stelle', 'stars'], [
      P(3, 'Mappa stellare', 'Hai una mappa delle stelle (oggetto Minuscolo) che fa da focus druidico. Finché la tieni hai preparati Guida e Dardo guida, e puoi lanciare Dardo guida senza slot tante volte quanto il tuo modificatore di Saggezza (minimo 1) per riposo lungo. Se la perdi la ricrei con una cerimonia di 1 ora durante un riposo.'),
      P(3, 'Forma stellare', 'Azione bonus, spendendo un uso di Forma selvatica: per 10 minuti il tuo corpo diventa luminoso (luce intensa 3 m e fioca altri 3 m) mantenendo le tue statistiche. Scegli una costellazione. Arciere: quando attivi la forma e con un\'azione bonus nei turni seguenti, attacco a distanza con incantesimo entro 18 m, 1d8 + Saggezza danni radiosi. Calice: quando un incantesimo con slot cura una creatura, tu o un\'altra creatura entro 9 m recuperate 1d8 + Saggezza PF. Drago: nelle prove di Intelligenza o Saggezza e nei TS su Costituzione per la concentrazione, un 9 o meno sul d20 conta come 10.'),
      P(6, 'Presagio cosmico', 'Dopo ogni riposo lungo tiri un dado. Pari (Fortuna): quando una creatura che vedi entro 9 m sta per fare un tiro d20, con la reazione aggiungi 1d6. Dispari (Sventura): con la reazione sottrai 1d6. Usi pari al modificatore di Saggezza (minimo 1), recuperati con un riposo lungo.'),
      P(10, 'Costellazioni scintillanti', 'L\'1d8 di Arciere e Calice diventa 2d8; con il Drago hai velocità di volare 6 m e puoi librarti. All\'inizio di ogni tuo turno in forma stellare puoi cambiare costellazione.'),
      P(14, 'Pieno di stelle', 'In forma stellare diventi in parte incorporeo: resistenza ai danni contundenti, perforanti e taglienti.'),
    ]),
  ],
  Guerriero: [
    SOTTO('maestro-di-battaglia', 'Maestro di Battaglia', 'Battle Master', ['maestro di battaglia', 'battle master'], [
      P(3, 'Superiorità in combattimento', 'Conosci 3 manovre (2 in più al 7°, al 10° e al 15° livello; quando ne impari puoi sostituirne una). Hai 4 dadi di superiorità d8 (5 al 7°, 6 al 15° livello) che si spendono usando le manovre e si recuperano con un riposo breve o lungo. Una sola manovra per attacco. CD delle manovre: 8 + Forza o Destrezza (a scelta) + bonus di competenza.'),
      P(3, 'Manovre', 'Agguato: aggiungi il dado a una prova di Furtività o all\'iniziativa. Scambio di posto: nel tuo turno, spendendo 1,5 m di movimento, scambi di posto con una creatura consenziente entro 1,5 m; tu o lei ottenete il dado come bonus alla CA fino al tuo turno successivo. Colpo del comandante: rinunci a un attacco e un alleato che ti vede o sente attacca con la reazione, aggiungendo il dado ai danni. Presenza dominante: aggiungi il dado a una prova di Carisma (Intimidire, Intrattenere, Persuasione). Attacco disarmante: +dado ai danni e TS su Forza o il bersaglio lascia cadere un oggetto. Colpo distraente: +dado ai danni; il prossimo attacco di un altro contro il bersaglio ha vantaggio. Gioco di gambe evasivo: azione bonus, Disimpegno e il dado alla CA fino al tuo turno successivo. Attacco con finta: azione bonus, vantaggio al prossimo attacco contro una creatura entro 1,5 m e +dado ai danni. Attacco provocatorio: +dado ai danni e TS su Saggezza o il bersaglio ha svantaggio ad attaccare altri che te. Attacco in affondo: azione bonus, Scatto; se ti muovi in linea retta di almeno 1,5 m prima di colpire in mischia, +dado ai danni. Attacco di manovra: +dado ai danni e un alleato si muove con la reazione fino a metà velocità senza attacchi di opportunità dal bersaglio. Attacco minaccioso: +dado ai danni e TS su Saggezza o il bersaglio è Spaventato fino alla fine del tuo turno successivo. Parata: con la reazione riduci i danni di un attacco in mischia del dado + Forza o Destrezza. Attacco di precisione: quando manchi, aggiungi il dado al tiro per colpire. Attacco spingente: +dado ai danni e TS su Forza o il bersaglio (Grande o più piccolo) è spinto fino a 4,5 m. Radunare: azione bonus, un alleato entro 9 m ottiene PF temporanei pari al dado + metà del tuo livello da guerriero. Risposta: quando una creatura ti manca in mischia, con la reazione la attacchi e aggiungi il dado ai danni. Attacco ampio: un\'altra creatura entro 1,5 m dal bersaglio e a tua portata, se l\'attacco l\'avrebbe colpita, subisce danni pari al dado. Valutazione tattica: aggiungi il dado a una prova di Storia, Indagare o Intuizione. Attacco sbilanciante: +dado ai danni e TS su Forza o il bersaglio (Grande o più piccolo) cade Prono.'),
      P(3, 'Studioso della guerra', 'Competenza con un tipo di strumento da artigiano e in un\'abilità a scelta tra quelle del guerriero.'),
      P(7, 'Conosci il nemico', 'Azione bonus: scopri se una creatura che vedi entro 9 m ha immunità, resistenze o vulnerabilità, e quali. Una volta per riposo lungo, oppure spendi un dado di superiorità per riusarla.'),
      P(10, 'Superiorità in combattimento migliorata', 'I tuoi dadi di superiorità diventano d10.'),
      P(15, 'Implacabile', 'Una volta per turno, quando usi una manovra, puoi tirare 1d8 e usarlo al posto di un dado di superiorità senza spenderlo.'),
      P(18, 'Superiorità in combattimento suprema', 'I tuoi dadi di superiorità diventano d12.'),
    ]),
    SOTTO('campione', 'Campione', 'Champion', ['campione', 'champion'], [
      P(3, 'Critico migliorato', 'I tuoi tiri per colpire con armi e colpi senz\'armi sono critici con 19 o 20 sul d20.'),
      P(3, 'Atleta straordinario', 'Vantaggio ai tiri di iniziativa e alle prove di Forza (Atletica). Subito dopo un colpo critico puoi muoverti fino a metà della tua velocità senza provocare attacchi di opportunità.'),
      P(7, 'Stile di combattimento aggiuntivo', 'Ottieni un altro talento Stile di combattimento a scelta.'),
      P(10, 'Guerriero eroico', 'In combattimento, se inizi il turno senza Ispirazione eroica, puoi darla a te stesso.'),
      P(15, 'Critico superiore', 'I tuoi tiri per colpire con armi e colpi senz\'armi sono critici con 18, 19 o 20 sul d20.'),
      P(18, 'Sopravvissuto', 'Sfidare la morte: vantaggio ai tiri salvezza contro la morte e un 18-20 conta come un 20. Raduno eroico: all\'inizio di ogni tuo turno, se sei Sanguinante (sotto metà PF) e hai almeno 1 PF, recuperi 5 + Costituzione PF.'),
    ]),
    SOTTO('cavaliere-mistico', 'Cavaliere Mistico', 'Eldritch Knight', ['cavaliere mistico', 'eldritch knight'], [
      P(3, 'Incantesimi', 'Lanci incantesimi da mago con l\'Intelligenza (focus arcano). Conosci 2 trucchetti da mago (3 dal 10° livello) e prepari incantesimi da mago di 1° livello o superiore secondo la tabella del Cavaliere mistico (3 al 3° livello, fino a 13 al 20°; slot fino al 4° livello). Quando sali di livello puoi sostituire un trucchetto e un incantesimo; gli slot si recuperano con un riposo lungo.'),
      P(3, 'Legame con l\'arma', 'Con un rituale di 1 ora (anche durante un riposo breve) ti leghi a un\'arma: non puoi essere disarmato se non sei Incapacitato e, se è sul tuo stesso piano, la richiami in mano con un\'azione bonus. Al massimo due armi legate (ne richiami una alla volta).'),
      P(7, 'Magia da guerra', 'Quando usi l\'azione di Attacco puoi sostituire uno degli attacchi con un trucchetto da mago che si lancia con un\'azione.'),
      P(10, 'Colpo mistico', 'Quando colpisci una creatura con un\'arma, ha svantaggio al prossimo tiro salvezza contro un tuo incantesimo prima della fine del tuo turno successivo.'),
      P(15, 'Carica arcana', 'Quando usi Azione impetuosa puoi teletrasportarti fino a 9 m in uno spazio libero che vedi, prima o dopo l\'azione in più.'),
      P(18, 'Magia da guerra migliorata', 'Quando usi l\'azione di Attacco puoi sostituire due attacchi con un incantesimo da mago di 1° o 2° livello che si lancia con un\'azione.'),
    ]),
    SOTTO('guerriero-psionico', 'Guerriero Psionico', 'Psi Warrior', ['guerriero psionico', 'psi warrior'], [
      P(3, 'Potere psionico', 'Hai dadi di energia psionica: 4 d6 al 3° livello, 6 d8 al 5°, 8 d8 al 9°, 8 d10 all\'11°, 10 d10 al 13°, 12 d12 al 17°. Ne recuperi uno con un riposo breve, tutti con un riposo lungo. Campo protettivo: quando tu o una creatura che vedi entro 9 m subite danni, con la reazione spendi un dado e riduci il danno del risultato + Intelligenza (minimo 1). Colpo psionico: una volta per turno, subito dopo aver colpito e danneggiato con un\'arma un bersaglio entro 9 m, spendi un dado e infliggi il risultato + Intelligenza danni da forza. Movimento telecinetico (azione Magia): sposti fino a 9 m un oggetto libero Grande o più piccolo o una creatura consenziente (non te) che vedi entro 9 m, oppure porti in mano o via un oggetto Minuscolo; una volta per riposo breve o lungo, oppure spendi un dado per riusarlo.'),
      P(7, 'Adepto telecinetico', 'Balzo psionico: con un\'azione bonus hai velocità di volare pari al doppio della tua velocità fino a fine turno (una volta per riposo breve o lungo, o spendi un dado). Spinta telecinetica: quando infliggi danni con Colpo psionico, il bersaglio fa un tiro salvezza su Forza (CD 8 + Intelligenza + competenza): se fallisce puoi farlo cadere Prono o spostarlo fino a 3 m in orizzontale.'),
      P(10, 'Mente protetta', 'Resistenza ai danni psichici. Se inizi il turno Affascinato o Spaventato puoi spendere un dado psionico (senza azione) per porre fine a tutti gli effetti che ti danno quelle condizioni.'),
      P(15, 'Baluardo di forza', 'Azione bonus: fino a tante creature entro 9 m quanto il tuo modificatore di Intelligenza (minimo 1), te compreso, hanno mezza copertura per 1 minuto o finché sei Incapacitato. Una volta per riposo lungo, oppure spendi un dado psionico per riusarlo.'),
      P(18, 'Maestro telecinetico', 'Hai sempre preparato Telecinesi e puoi lanciarlo senza slot né componenti (con l\'Intelligenza). In ogni tuo turno in cui mantieni la concentrazione su di esso puoi fare un attacco con un\'arma come azione bonus. Una volta per riposo lungo, oppure spendi un dado psionico per rilanciarlo così.'),
    ]),
  ],
  Monaco: [
    SOTTO('misericordia', 'Guerriero della Misericordia', 'Warrior of Mercy', ['misericordia', 'mercy'], [
      P(3, 'Mano del dolore', 'Una volta per turno, quando colpisci con un colpo senz\'armi e infliggi danni, puoi spendere 1 punto concentrazione per aggiungere danni necrotici pari a un tiro del dado di Arti marziali + Saggezza.'),
      P(3, 'Mano della guarigione', 'Azione Magia: spendi 1 punto concentrazione e tocchi una creatura, che recupera un tiro del dado di Arti marziali + Saggezza PF. Con Raffica di colpi puoi sostituire uno dei colpi con questa cura senza spendere il punto per la cura.'),
      P(3, 'Strumenti della misericordia', 'Competenza in Intuizione e Medicina e con il kit da erborista.'),
      P(6, 'Tocco del medico', 'Mano del dolore può anche rendere il bersaglio Avvelenato fino alla fine del tuo turno successivo. Mano della guarigione può anche porre fine a una condizione tra Accecato, Assordato, Paralizzato, Avvelenato e Stordito.'),
      P(11, 'Raffica di guarigione e dolore', 'Con Raffica di colpi puoi sostituire ogni colpo con Mano della guarigione senza spendere punti per la cura; e quando un colpo della raffica infligge danni puoi usare Mano del dolore senza spendere il punto (sempre una volta per turno). Usi pari al modificatore di Saggezza (minimo 1), recuperati con un riposo lungo.'),
      P(17, 'Mano della misericordia suprema', 'Azione Magia: tocchi il cadavere di una creatura morta nelle ultime 24 ore e spendi 5 punti concentrazione: torna in vita con 4d10 + Saggezza PF, senza le condizioni Accecato, Assordato, Paralizzato, Avvelenato e Stordito. Una volta per riposo lungo.'),
    ]),
    SOTTO('ombra', 'Guerriero dell\'Ombra', 'Warrior of Shadow', ['ombra', 'shadow'], [
      P(3, 'Arti dell\'ombra', 'Oscurità: spendi 1 punto concentrazione per lanciare Oscurità senza componenti; tu vedi dentro l\'area e all\'inizio di ogni tuo turno puoi spostarla in uno spazio entro 18 m. Scurovisione 18 m (o +18 m se già ce l\'hai). Conosci Illusione minore (Saggezza).'),
      P(6, 'Passo dell\'ombra', 'Mentre sei in luce fioca o oscurità, con un\'azione bonus ti teletrasporti fino a 18 m in uno spazio libero che vedi, anch\'esso in luce fioca o oscurità; poi hai vantaggio al prossimo attacco in mischia di questo turno.'),
      P(11, 'Passo dell\'ombra migliorato', 'Quando usi Passo dell\'ombra puoi spendere 1 punto concentrazione per non dover partire e arrivare in luce fioca o oscurità; inoltre, con la stessa azione bonus, puoi fare un colpo senz\'armi subito dopo il teletrasporto.'),
      P(17, 'Manto d\'ombre', 'Azione Magia, mentre sei in luce fioca o oscurità: spendi 5 punti concentrazione e ti avvolgi di ombre per 1 minuto (finisce se sei Incapacitato o finisci il turno in luce intensa). Sei Invisibile, puoi attraversare spazi occupati come terreno difficile (se ci finisci il turno torni all\'ultimo spazio libero) e usi Raffica di colpi senza spendere punti.'),
    ]),
    SOTTO('elementi', 'Guerriero degli Elementi', 'Warrior of the Elements', ['elementi', 'elements'], [
      P(3, 'Sintonia elementale', 'All\'inizio del tuo turno puoi spendere 1 punto concentrazione: per 10 minuti (o finché sei Incapacitato) i tuoi colpi senz\'armi hanno 3 m di portata in più e possono infliggere danni da acido, freddo, fuoco, fulmine o tuono; quando lo fanno puoi imporre al bersaglio un tiro salvezza su Forza e, se fallisce, spostarlo fino a 3 m verso di te o lontano.'),
      P(3, 'Manipolare gli elementi', 'Conosci il trucchetto Elementalismo (Saggezza).'),
      P(6, 'Esplosione elementale', 'Azione Magia: spendi 2 punti concentrazione per un\'esplosione in una sfera di 6 m di raggio entro 36 m, con un tipo di danno a scelta (acido, freddo, fuoco, fulmine, tuono): tiro salvezza su Destrezza, tre tiri del dado di Arti marziali di danni, metà se riesce.'),
      P(11, 'Passo degli elementi', 'Mentre Sintonia elementale è attiva hai velocità di volare e di nuotare pari alla tua velocità.'),
      P(17, 'Epitome elementale', 'Con Sintonia elementale attiva: resistenza a un tipo tra acido, freddo, fuoco, fulmine e tuono (puoi cambiarlo all\'inizio di ogni turno); quando usi Passo del vento la velocità aumenta di 6 m e ogni creatura a scelta a cui arrivi entro 1,5 m subisce un tiro del dado di Arti marziali (una volta per turno); una volta per turno i tuoi colpi senz\'armi fanno un tiro del dado di Arti marziali di danni extra.'),
    ]),
    SOTTO('mano-aperta', 'Guerriero della Mano Aperta', 'Warrior of the Open Hand', ['mano aperta', 'open hand'], [
      P(3, 'Tecnica della mano aperta', 'Quando colpisci una creatura con un attacco di Raffica di colpi le imponi un effetto. Scompiglio: non può fare attacchi di opportunità fino all\'inizio del suo turno. Spinta: tiro salvezza su Forza o viene spinta fino a 4,5 m. Rovescio: tiro salvezza su Destrezza o cade Prona.'),
      P(6, 'Integrità del corpo', 'Con un\'azione bonus tiri il dado di Arti marziali e recuperi quel risultato + Saggezza PF (minimo 1). Usi pari al modificatore di Saggezza (minimo 1), recuperati con un riposo lungo.'),
      P(11, 'Passo rapido', 'Quando usi un\'azione bonus diversa da Passo del vento, subito dopo puoi usare anche Passo del vento.'),
      P(17, 'Palmo vibrante', 'Quando colpisci con un colpo senz\'armi puoi spendere 4 punti concentrazione per avviare vibrazioni innocue che durano tanti giorni quanto il tuo livello da monaco. Con un\'azione (o rinunciando a un attacco dell\'azione di Attacco) le fai terminare, se siete sullo stesso piano: tiro salvezza su Costituzione, 10d12 danni da forza, metà se riesce. Una sola creatura alla volta; puoi anche farle cessare senza danni.'),
    ]),
  ],
  Paladino: [
    SOTTO('devozione', 'Giuramento di Devozione', 'Oath of Devotion', ['devozione', 'devotion'], [
      P(3, 'Incantesimi del giuramento', 'Hai sempre preparati: 3° livello Protezione dal male e dal bene, Scudo della fede; 5° Aiuto, Zona di verità; 9° Faro di speranza, Dissolvi magie; 13° Libertà di movimento, Guardiano della fede; 17° Comunione, Colpo infuocato.'),
      P(3, 'Arma sacra', 'Quando usi l\'azione di Attacco puoi spendere un uso di Incanalare divinità per infondere un\'arma da mischia che impugni: per 10 minuti aggiungi il modificatore di Carisma (minimo +1) ai tiri per colpire con essa, i colpi possono fare danni radiosi invece del tipo normale e l\'arma emette luce intensa per 6 m e fioca per altri 6 m. Finisce se la riusi, se non porti l\'arma o quando vuoi.'),
      P(7, 'Aura di devozione', 'Tu e i tuoi alleati siete immuni alla condizione Affascinato nella tua Aura di protezione; un alleato Affascinato che entra nell\'aura non ne subisce gli effetti finché ci resta.'),
      P(15, 'Punizione protettiva', 'Ogni volta che lanci Punizione divina, tu e i tuoi alleati nella tua Aura di protezione avete mezza copertura fino all\'inizio del tuo turno successivo.'),
      P(20, 'Nimbo sacro', 'Azione bonus: per 10 minuti la tua Aura di protezione si riempie di luce solare intensa; hai vantaggio ai tiri salvezza imposti da immondi e non morti; ogni nemico che inizia il turno nell\'aura subisce danni radiosi pari a Carisma + bonus di competenza. Una volta per riposo lungo, oppure spendi uno slot di 5° livello per riusarlo.'),
    ]),
    SOTTO('gloria', 'Giuramento di Gloria', 'Oath of Glory', ['gloria', 'glory'], [
      P(3, 'Punizione ispiratrice', 'Subito dopo aver lanciato Punizione divina puoi spendere un uso di Incanalare divinità e distribuire 2d8 + il tuo livello da paladino PF temporanei tra creature a tua scelta entro 9 m (anche te).'),
      P(3, 'Incantesimi del giuramento', 'Hai sempre preparati: 3° livello Dardo guida, Eroismo; 5° Potenziare caratteristica, Arma magica; 9° Velocità, Protezione dall\'energia; 13° Costrizione, Libertà di movimento; 17° Conoscenza delle leggende, Presenza regale di Yolande.'),
      P(3, 'Atleta impareggiabile', 'Azione bonus, spendendo un uso di Incanalare divinità: per 1 ora hai vantaggio alle prove di Forza (Atletica) e Destrezza (Acrobazia) e i tuoi salti in lungo e in alto sono più lunghi di 3 m (il movimento costa normalmente).'),
      P(7, 'Aura di alacrità', 'La tua velocità aumenta di 3 m. Un alleato che entra per la prima volta nel turno nella tua Aura di protezione, o vi inizia il turno, ha +3 m di velocità fino alla fine del suo turno successivo.'),
      P(15, 'Difesa gloriosa', 'Quando tu o una creatura che vedi entro 3 m venite colpiti da un tiro per colpire, con la reazione date un bonus alla CA contro quell\'attacco pari al tuo Carisma (minimo +1); se l\'attacco manca, puoi fare un attacco con un\'arma contro l\'attaccante se è a portata. Usi pari al modificatore di Carisma (minimo 1), recuperati con un riposo lungo.'),
      P(20, 'Leggenda vivente', 'Azione bonus, per 10 minuti: vantaggio a tutte le prove di Carisma; una volta per turno, quando manchi con un attacco con un\'arma, puoi farlo colpire; se fallisci un tiro salvezza puoi ritirarlo con la reazione (devi usare il nuovo risultato). Una volta per riposo lungo, oppure spendi uno slot di 5° livello per riusarla.'),
    ]),
    SOTTO('antichi', 'Giuramento degli Antichi', 'Oath of the Ancients', ['antichi', 'ancients'], [
      P(3, 'Collera della natura', 'Azione Magia, spendendo un uso di Incanalare divinità: le creature a tua scelta che vedi entro 4,5 m fanno un tiro salvezza su Forza o sono Intralciate da rampicanti spettrali per 1 minuto (ripetono il tiro alla fine di ogni loro turno).'),
      P(3, 'Incantesimi del giuramento', 'Hai sempre preparati: 3° livello Colpo intrappolante, Parlare con gli animali; 5° Passo velato, Raggio di luna; 9° Crescita vegetale, Protezione dall\'energia; 13° Tempesta di ghiaccio, Pelle di pietra; 17° Comunione con la natura, Camminare tra gli alberi.'),
      P(7, 'Aura di interdizione', 'Tu e i tuoi alleati avete resistenza ai danni necrotici, psichici e radiosi nella tua Aura di protezione.'),
      P(15, 'Sentinella immortale', 'Quando scendi a 0 PF senza morire sul colpo, puoi invece restare a 1 PF e recuperare 3 × il tuo livello da paladino PF (una volta per riposo lungo). Inoltre non puoi essere invecchiato con la magia e smetti di invecchiare visibilmente.'),
      P(20, 'Campione degli antichi', 'Azione bonus, per 1 minuto: i nemici nella tua aura hanno svantaggio ai tiri salvezza contro i tuoi incantesimi e Incanalare divinità; all\'inizio di ogni tuo turno recuperi 10 PF; gli incantesimi che si lanciano con un\'azione puoi lanciarli con un\'azione bonus. Una volta per riposo lungo, oppure spendi uno slot di 5° livello per riusarlo.'),
    ]),
    SOTTO('vendetta', 'Giuramento di Vendetta', 'Oath of Vengeance', ['vendetta', 'vengeance'], [
      P(3, 'Incantesimi del giuramento', 'Hai sempre preparati: 3° livello Anatema, Marchio del cacciatore; 5° Blocca persone, Passo velato; 9° Velocità, Protezione dall\'energia; 13° Esilio, Porta dimensionale; 17° Blocca mostri, Scrutare.'),
      P(3, 'Voto di inimicizia', 'Quando usi l\'azione di Attacco puoi spendere un uso di Incanalare divinità contro una creatura che vedi entro 9 m: hai vantaggio ai tiri per colpire contro di lei per 1 minuto o finché lo riusi. Se scende a 0 PF prima, puoi trasferire il voto a un\'altra creatura entro 9 m (senza azione).'),
      P(7, 'Vendicatore implacabile', 'Quando colpisci una creatura con un attacco di opportunità puoi ridurre la sua velocità a 0 fino alla fine del turno; poi, con la stessa reazione, puoi muoverti fino a metà della tua velocità senza provocare attacchi di opportunità.'),
      P(15, 'Anima della vendetta', 'Subito dopo che la creatura sotto il tuo Voto di inimicizia fa un tiro per colpire (che colpisca o manchi), con la reazione puoi fare un attacco in mischia contro di lei, se è a portata.'),
      P(20, 'Angelo vendicatore', 'Azione bonus, per 10 minuti: ali spettrali con velocità di volare 18 m e possibilità di librarti; ogni nemico che inizia il turno nella tua Aura di protezione fa un tiro salvezza su Saggezza o è Spaventato per 1 minuto (o finché subisce danni), e gli attacchi contro di lui hanno vantaggio. Una volta per riposo lungo, oppure spendi uno slot di 5° livello per riusarlo.'),
    ]),
    // Non è nel Manuale del Giocatore 2024: dal documento OATHBREAKER.docx fornito dall'utente (versione aggiornata della
    // sottoclasse della Guida del DM 2014). Il documento non descrive il privilegio del 20° livello (Signore del terrore).
    SOTTO('giuramento-infranto', 'Giuramento Infranto', 'Oathbreaker', ['oathbreaker', 'giuramento infranto', 'infranto'], [
      P(3, 'Evocare non morti', 'Con un\'azione bonus spendi un uso di Incanalare divinità ed evochi tanti non morti quanto metà del tuo modificatore di Carisma (per eccesso, minimo 1), scheletri o zombi a scelta, in spazi liberi che vedi entro 9 m. Per 1 minuto sono tuoi alleati sotto il tuo controllo, poi diventano cenere. In combattimento agiscono subito dopo il tuo turno e obbediscono ai tuoi ordini a voce (senza azione); senza ordini fanno Schivata ed evitano il pericolo.'),
      P(3, 'Aspetto terrificante', 'Subito dopo aver lanciato Punizione divina puoi spendere un uso di Incanalare divinità: le creature che scegli in un\'emanazione di 9 m fanno un tiro salvezza su Saggezza o sono Spaventate per 1 minuto; ripetono il tiro alla fine di ogni loro turno.'),
      P(3, 'Incantesimi del giuramento', 'Hai sempre preparati (non contano nel limite): 3° livello Rimprovero infernale, Dardo stregato; 5° Corona di follia, Oscurità; 9° Paura, Evocare non morti; 13° Avvizzimento, Assassino fantasmatico; 17° Contagio, Colpo del vento d\'acciaio.'),
      P(7, 'Aura dell\'odio', 'Quando tu, o un immondo o un non morto tuo alleato che si trova nella tua Aura di protezione, colpite una creatura con un attacco in mischia, l\'attacco infligge danni necrotici extra pari al tuo modificatore di Carisma.'),
      P(15, 'Resistenza soprannaturale', 'Ottieni resistenza ai danni contundenti, perforanti e taglienti.'),
    ], 'Non è nel Manuale del Giocatore 2024: viene dal documento OATHBREAKER che mi hai fornito (versione aggiornata della sottoclasse della Guida del Dungeon Master 2014). Il documento non descrive il privilegio del 20° livello.'),
  ],
  Ranger: [
    SOTTO('signore-delle-bestie', 'Signore delle Bestie', 'Beast Master', ['signore delle bestie', 'beast master'], [
      P(3, 'Compagno primordiale', 'Evochi una bestia primordiale amichevole che obbedisce ai tuoi ordini (sparisce se muori): Bestia della terra (Media, CA 13 + tua Saggezza, PF 5 + 5 × livello da ranger, velocità 12 m e scalare 12 m; Colpo 1d8 + 2 + Saggezza contundenti, perforanti o taglienti, e se ha caricato per 6 m +1d6 e il bersaglio Grande o più piccolo cade Prono), Bestia del mare (Media, CA 13 + Saggezza, PF 5 + 5 × livello, nuotare 18 m, anfibia; Colpo 1d6 + 2 + Saggezza e il bersaglio è Afferrato) o Bestia del cielo (Piccola, CA 13 + Saggezza, PF 4 + 4 × livello, volare 18 m; Colpo 1d4 + 3 + Saggezza taglienti). Tiro per colpire = il tuo attacco con incantesimo; aggiunge il tuo bonus di competenza a prove e tiri salvezza. In combattimento agisce nel tuo turno e fa solo Schivata, a meno che con un\'azione bonus tu non le ordini un\'azione; puoi anche rinunciare a uno dei tuoi attacchi per farle usare il Colpo. Se è morta da meno di un\'ora, la riporti in vita toccandola (azione Magia) e spendendo uno slot. Dopo un riposo lungo puoi evocarne una diversa.'),
      P(7, 'Addestramento eccezionale', 'Quando con un\'azione bonus ordini alla bestia un\'azione, può anche fare Scatto, Disimpegno, Schivata o Aiuto con la sua azione bonus. I suoi attacchi possono infliggere danni da forza invece del tipo normale.'),
      P(11, 'Furia bestiale', 'Quando ordini alla bestia il Colpo, lo fa due volte. La prima volta in ogni turno che colpisce una creatura sotto il tuo Marchio del cacciatore, infligge danni da forza extra pari al danno extra del Marchio.'),
      P(15, 'Condividere incantesimi', 'Quando lanci un incantesimo che ha come bersaglio te stesso, puoi farne beneficiare anche la bestia se è entro 9 m da te.'),
    ]),
    SOTTO('viandante-fatato', 'Viandante Fatato', 'Fey Wanderer', ['viandante fatato', 'fey wanderer'], [
      P(3, 'Colpi terribili', 'Quando colpisci una creatura con un\'arma puoi infliggerle 1d4 danni psichici extra (1d6 dall\'11° livello), una sola volta per turno per ciascun bersaglio.'),
      P(3, 'Incantesimi del viandante', 'Hai sempre preparati: 3° livello Charme su persone; 5° Passo velato; 9° Evocare folletto; 13° Porta dimensionale; 17° Inganno. Hai anche un dono fatato (es. farfalle illusorie durante i riposi, fiori tra i capelli all\'alba, profumo di spezie).'),
      P(3, 'Fascino ultraterreno', 'Alle prove di Carisma aggiungi il modificatore di Saggezza (minimo +1). Competenza in un\'abilità a scelta tra Inganno, Intrattenere e Persuasione.'),
      P(7, 'Svolta seducente', 'Vantaggio ai tiri salvezza per evitare o terminare le condizioni Affascinato e Spaventato. Quando tu o una creatura che vedi entro 36 m superate uno di questi tiri, con la reazione costringi un\'altra creatura entro 36 m a un tiro salvezza su Saggezza contro la tua CD: se fallisce è Affascinata o Spaventata (a scelta) per 1 minuto, ripetendo il tiro alla fine di ogni suo turno.'),
      P(11, 'Rinforzi fatati', 'Lanci Evocare folletto senza componente materiale, e una volta per riposo lungo senza slot. Quando lo lanci puoi fare in modo che non richieda concentrazione: in quel caso dura 1 minuto.'),
      P(15, 'Viandante delle nebbie', 'Lanci Passo velato senza slot tante volte quanto il tuo modificatore di Saggezza (minimo 1) per riposo lungo. Quando lanci Passo velato puoi portare con te una creatura consenziente che vedi entro 1,5 m, che arriva entro 1,5 m dalla tua destinazione.'),
    ]),
    SOTTO('cacciatore-delle-tenebre', 'Cacciatore delle Tenebre', 'Gloom Stalker', ['cacciatore delle tenebre', 'gloom stalker'], [
      P(3, 'Agguato terrificante', 'Balzo dell\'agguato: all\'inizio del tuo primo turno di ogni combattimento la velocità aumenta di 3 m fino a fine turno. Colpo terribile: quando colpisci una creatura con un\'arma, +2d6 danni psichici (una volta per turno; usi pari al modificatore di Saggezza, minimo 1, recuperati con un riposo lungo). Bonus all\'iniziativa: aggiungi la Saggezza ai tiri di iniziativa.'),
      P(3, 'Incantesimi del cacciatore', 'Hai sempre preparati: 3° livello Camuffare se stesso; 5° Trucco della corda; 9° Paura; 13° Invisibilità superiore; 17° Sembrare.'),
      P(3, 'Vista dell\'ombra', 'Scurovisione 18 m (o +18 m se già ce l\'hai). Quando sei completamente nell\'oscurità sei Invisibile per le creature che contano sulla scurovisione per vederti.'),
      P(7, 'Mente di ferro', 'Competenza nei tiri salvezza su Saggezza (se l\'avevi già, su Intelligenza o Carisma a scelta).'),
      P(11, 'Raffica del cacciatore', 'Il danno di Colpo terribile diventa 2d8. Quando lo usi puoi aggiungere un effetto: Colpo improvviso (un altro attacco con la stessa arma contro una creatura diversa entro 1,5 m dal bersaglio e a portata) oppure Paura di massa (il bersaglio e ogni creatura entro 3 m da lui fanno un tiro salvezza su Saggezza o sono Spaventati fino all\'inizio del tuo turno successivo).'),
      P(15, 'Schivata d\'ombra', 'Quando una creatura ti attacca, con la reazione le imponi svantaggio; che l\'attacco colpisca o no, poi puoi teletrasportarti fino a 9 m in uno spazio libero che vedi.'),
    ]),
    SOTTO('cacciatore', 'Cacciatore', 'Hunter', ['cacciatore', 'hunter'], [
      P(3, 'Conoscenza del cacciatore', 'Finché una creatura è segnata dal tuo Marchio del cacciatore sai se ha immunità, resistenze o vulnerabilità, e quali.'),
      P(3, 'Preda del cacciatore', 'Scegli un\'opzione (cambiabile dopo un riposo breve o lungo). Uccisore di colossi: una volta per turno, quando colpisci con un\'arma una creatura che non ha tutti i PF, +1d8 danni. Distruttore di orde: una volta per turno, quando attacchi con un\'arma, puoi fare un altro attacco con la stessa arma contro una creatura diversa entro 1,5 m dal bersaglio, a portata e non ancora attaccata in questo turno.'),
      P(7, 'Tattiche difensive', 'Scegli un\'opzione (cambiabile dopo un riposo breve o lungo). Sfuggire all\'orda: gli attacchi di opportunità contro di te hanno svantaggio. Difesa dagli attacchi multipli: quando una creatura ti colpisce, ha svantaggio a tutti gli altri suoi tiri per colpire contro di te in quel turno.'),
      P(11, 'Preda del cacciatore superiore', 'Una volta per turno, quando danneggi una creatura segnata dal tuo Marchio del cacciatore, puoi infliggere il danno extra del Marchio anche a un\'altra creatura che vedi entro 9 m dalla prima.'),
      P(15, 'Difesa del cacciatore superiore', 'Quando subisci danni, con la reazione ottieni resistenza a quel danno e a ogni altro danno dello stesso tipo fino alla fine del turno.'),
    ]),
  ],
  Ladro: [
    SOTTO('mistificatore-arcano', 'Mistificatore Arcano', 'Arcane Trickster', ['mistificatore arcano', 'arcane trickster'], [
      P(3, 'Incantesimi', 'Lanci incantesimi da mago con l\'Intelligenza (focus arcano). Conosci Mano magica e altri 2 trucchetti da mago (uno in più al 10° livello) e prepari incantesimi da mago di 1° livello o superiore secondo la tabella del Mistificatore arcano (3 al 3° livello, fino a 13 al 20°; slot fino al 4° livello). Quando sali di livello puoi sostituire un trucchetto (non Mano magica) e un incantesimo.'),
      P(3, 'Lestezza con la mano magica', 'Puoi lanciare Mano magica con un\'azione bonus e rendere invisibile la mano; la controlli con un\'azione bonus e attraverso di lei puoi fare prove di Destrezza (Rapidità di mano).'),
      P(9, 'Imboscata magica', 'Se sei Invisibile quando lanci un incantesimo su una creatura, nello stesso turno ha svantaggio ai tiri salvezza contro quell\'incantesimo.'),
      P(13, 'Mistificatore versatile', 'Quando usi lo Sgambetto di Colpo astuto su una creatura, puoi usarlo anche su un\'altra creatura entro 1,5 m dalla mano spettrale.'),
      P(17, 'Ladro di incantesimi', 'Subito dopo che una creatura lancia un incantesimo che ti prende di mira o ti include nell\'area, con la reazione le imponi un tiro salvezza su Intelligenza contro la tua CD: se fallisce, l\'incantesimo non ha effetto su di te e, se è di 1° livello o superiore e di un livello che puoi lanciare, per 8 ore lo hai preparato tu e lei non può lanciarlo. Una volta per riposo lungo.'),
    ]),
    SOTTO('assassino', 'Assassino', 'Assassin', ['assassino', 'assassin'], [
      P(3, 'Assassinare', 'Vantaggio ai tiri di iniziativa. Nel primo round di ogni combattimento hai vantaggio ad attaccare le creature che non hanno ancora agito; se in quel round il tuo Attacco furtivo colpisce, il bersaglio subisce danni extra pari al tuo livello da ladro (stesso tipo dell\'arma).'),
      P(3, 'Strumenti dell\'assassino', 'Ottieni un kit da camuffamento e un kit da avvelenatore, e la competenza con entrambi.'),
      P(9, 'Esperto di infiltrazione', 'Mimetismo magistrale: dopo almeno 1 ora di studio imiti alla perfezione voce e/o scrittura di una persona. Mira mobile: Mira ferma non riduce più la tua velocità a 0.'),
      P(13, 'Armi avvelenate', 'Quando usi l\'opzione Veleno di Colpo astuto, il bersaglio subisce anche 2d6 danni da veleno ogni volta che fallisce il tiro salvezza; questo danno ignora la resistenza al veleno.'),
      P(17, 'Colpo mortale', 'Quando colpisci con l\'Attacco furtivo nel primo round di un combattimento, il bersaglio fa un tiro salvezza su Costituzione (CD 8 + Destrezza + competenza) o i danni dell\'attacco contro di lui raddoppiano.'),
    ]),
    SOTTO('lama-dell-anima', 'Lama dell\'Anima', 'Soulknife', ['lama dell anima', 'lama dell\'anima', 'soulknife'], [
      P(3, 'Potere psionico', 'Hai dadi di energia psionica: 4 d6 al 3° livello, 6 d8 al 5°, 8 d8 al 9°, 8 d10 all\'11°, 10 d10 al 13°, 12 d12 al 17°. Ne recuperi uno con un riposo breve, tutti con un riposo lungo. Abilità potenziata: se fallisci una prova con un\'abilità o uno strumento in cui sei competente, aggiungi un dado psionico (si spende solo se così riesci). Sussurri psichici (azione Magia): tu e fino a tante creature quanto il tuo bonus di competenza comunicate telepaticamente entro 1,5 km per tante ore quanto il risultato di un dado psionico (il primo uso dopo ogni riposo lungo non spende il dado).'),
      P(3, 'Lame psichiche', 'Quando usi l\'azione di Attacco o fai un attacco di opportunità puoi creare in una mano libera una lama psichica: arma semplice da mischia, 1d6 danni psichici + il modificatore usato, accurata, da lancio (18/36 m), maestria Tormentare (non conta tra le tue maestrie). Svanisce dopo l\'attacco. Dopo averla usata, con un\'azione bonus puoi attaccare con una seconda lama (danno 1d4) se hai l\'altra mano libera.'),
      P(9, 'Lame dell\'anima', 'Colpi guidati: se manchi con una lama psichica, aggiungi un dado psionico al tiro per colpire (si spende se così colpisci). Teletrasporto psichico: con un\'azione bonus spendi un dado psionico, lanci una lama verso uno spazio libero che vedi fino a 3 m × il risultato e ti teletrasporti lì.'),
      P(13, 'Velo psichico', 'Azione Magia: diventi Invisibile per 1 ora (o finché lo interrompi); finisce subito dopo che infliggi danni o costringi una creatura a un tiro salvezza. Una volta per riposo lungo, oppure spendi un dado psionico per riusarlo.'),
      P(17, 'Squarciare la mente', 'Quando infliggi l\'Attacco furtivo con le lame psichiche puoi imporre un tiro salvezza su Saggezza (CD 8 + Destrezza + competenza): se fallisce il bersaglio è Stordito per 1 minuto, ripetendo il tiro alla fine di ogni suo turno. Una volta per riposo lungo, oppure spendi tre dadi psionici per riusarlo.'),
    ]),
    SOTTO('furfante', 'Furfante', 'Thief', ['furfante', 'thief'], [
      P(3, 'Mani veloci', 'Con un\'azione bonus puoi: fare una prova di Destrezza (Rapidità di mano) per scassinare una serratura o disattivare una trappola con gli arnesi da scasso, o per borseggiare; oppure usare l\'azione Usare, o l\'azione Magia per attivare un oggetto magico che la richiede.'),
      P(3, 'Lavoro da scalatore', 'Hai velocità di scalare pari alla tua velocità. Puoi calcolare la distanza dei salti con la Destrezza invece che con la Forza.'),
      P(9, 'Furtività suprema', 'Nuova opzione di Colpo astuto. Attacco furtivo nascosto (1d6): se sei Invisibile grazie all\'azione Nascondersi, questo attacco non ti fa perdere la condizione se finisci il turno dietro copertura di tre quarti o totale.'),
      P(13, 'Usare oggetti magici', 'Puoi essere in sintonia con quattro oggetti magici alla volta. Quando usi una proprietà che spende cariche tira 1d6: con 6 non spendi le cariche. Puoi usare qualsiasi pergamena magica con l\'Intelligenza: trucchetti e incantesimi di 1° livello riescono sempre; per livelli superiori serve una prova di Intelligenza (Arcano) con CD 10 + livello dell\'incantesimo, altrimenti la pergamena si disintegra.'),
      P(17, 'Riflessi del ladro', 'Nel primo round di ogni combattimento fai due turni: il primo alla tua iniziativa normale, il secondo alla tua iniziativa meno 10.'),
    ]),
  ],
  Stregone: [
    SOTTO('aberrante', 'Stregoneria Aberrante', 'Aberrant Sorcery', ['aberrante', 'aberrant'], [
      P(3, 'Incantesimi psionici', 'Hai sempre preparati: 3° livello Braccia di Hadar, Calmare emozioni, Individuazione dei pensieri, Sussurri dissonanti, Scheggia mentale; 5° Fame di Hadar, Inviare; 7° Tentacoli neri di Evard, Evocare aberrazione; 9° Legame telepatico di Rary, Telecinesi.'),
      P(3, 'Discorso telepatico', 'Azione bonus: crei un legame telepatico con una creatura che vedi entro 9 m; potete comunicare entro tante miglia quanto il tuo Carisma (minimo 1) per tanti minuti quanto il tuo livello da stregone, usando una lingua che entrambi conoscete. Finisce se lo crei con un\'altra creatura.'),
      P(6, 'Stregoneria psionica', 'Gli incantesimi di 1° livello o superiore di Incantesimi psionici puoi lanciarli anche spendendo tanti punti stregoneria quanto il loro livello: così non richiedono componenti verbali, somatiche né materiali (tranne quelle consumate o con un costo).'),
      P(6, 'Difese psichiche', 'Resistenza ai danni psichici e vantaggio ai tiri salvezza per evitare o terminare le condizioni Affascinato e Spaventato.'),
      P(14, 'Rivelazione nella carne', 'Azione bonus: spendi 1 o più punti stregoneria e per 10 minuti ottieni un beneficio per punto. Adattamento acquatico: velocità di nuotare doppia della tua velocità e respiri sott\'acqua. Volo scintillante: velocità di volare pari alla tua velocità e puoi librarti. Vedere l\'invisibile: vedi le creature invisibili entro 18 m non dietro copertura totale. Movimento vermiforme: passi da fessure larghe 2,5 cm e con 1,5 m di movimento ti liberi da legacci non magici o dalla condizione Afferrato.'),
      P(18, 'Implosione distorcente', 'Azione Magia: ti teletrasporti in uno spazio libero che vedi entro 36 m; ogni creatura entro 9 m dal punto che lasci fa un tiro salvezza su Forza contro la tua CD: se fallisce subisce 5d10 danni da forza ed è trascinata verso quel punto, se riesce subisce metà danni. Una volta per riposo lungo, oppure spendi 5 punti stregoneria per riusarla.'),
    ]),
    SOTTO('meccanica', 'Stregoneria Meccanica', 'Clockwork Sorcery', ['meccanica', 'clockwork'], [
      P(3, 'Incantesimi meccanici', 'Hai sempre preparati: 3° livello Aiuto, Allarme, Ristorare inferiore, Protezione dal male e dal bene; 5° Dissolvi magie, Protezione dall\'energia; 7° Libertà di movimento, Evocare costrutto; 9° Ristorare superiore, Muro di forza. Mentre lanci incantesimi da stregone si manifesta l\'ordine (ingranaggi spettrali, lancette negli occhi, ticchettio…).'),
      P(3, 'Ristabilire l\'equilibrio', 'Quando una creatura che vedi entro 18 m sta per tirare un d20 con vantaggio o svantaggio, con la reazione annulli vantaggio e svantaggio per quel tiro. Usi pari al modificatore di Carisma (minimo 1), recuperati con un riposo lungo.'),
      P(6, 'Bastione della legge', 'Azione Magia: spendi da 1 a 5 punti stregoneria e crei un\'egida su te o su una creatura che vedi entro 9 m, fatta di tanti d8 quanti punti spesi. Quando la creatura subisce danni può spendere alcuni di quei dadi, tirarli e ridurre il danno del totale. Dura fino al tuo riposo lungo o finché la ricrei.'),
      P(14, 'Trance dell\'ordine', 'Azione bonus: per 1 minuto gli attacchi contro di te non possono avere vantaggio e nei tuoi tiri d20 un 9 o meno conta come 10. Una volta per riposo lungo, oppure spendi 5 punti stregoneria per riusarla.'),
      P(18, 'Cavalcata meccanica', 'Azione Magia: spiriti dell\'ordine riempiono un cubo di 9 m che parte da te e poi svaniscono. Curano fino a 100 PF divisi come vuoi tra le creature a tua scelta nel cubo, riparano gli oggetti danneggiati del tutto dentro il cubo e pongono fine agli incantesimi di 6° livello o inferiore su creature e oggetti a tua scelta nel cubo. Una volta per riposo lungo, oppure spendi 7 punti stregoneria per riusarla.'),
    ]),
    SOTTO('draconica', 'Stregoneria Draconica', 'Draconic Sorcery', ['draconica', 'draconic'], [
      P(3, 'Resilienza draconica', 'I tuoi PF massimi aumentano di 5 e di 1 ogni volta che sali di livello da stregone. Senza armatura la tua CA base è 10 + Destrezza + Carisma.'),
      P(3, 'Incantesimi draconici', 'Hai sempre preparati: 3° livello Alterare se stesso, Globo cromatico, Comando, Soffio del drago; 5° Paura, Volare; 7° Occhio arcano, Charme sui mostri; 9° Conoscenza delle leggende, Evocare drago.'),
      P(6, 'Affinità elementale', 'Scegli un tipo di danno: acido, freddo, fuoco, fulmine o veleno. Hai resistenza a quel tipo e, quando lanci un incantesimo che lo infligge, aggiungi il modificatore di Carisma a un tiro per i danni.'),
      P(14, 'Ali del drago', 'Azione bonus: ali draconiche per 1 ora, con velocità di volare 18 m. Una volta per riposo lungo, oppure spendi 3 punti stregoneria per riusarle.'),
      P(18, 'Compagno draconico', 'Lanci Evocare drago senza componente materiale, e una volta per riposo lungo senza slot. Quando lo lanci puoi fare in modo che non richieda concentrazione: in quel caso dura 1 minuto.'),
    ]),
    SOTTO('magia-selvaggia', 'Magia Selvaggia', 'Wild Magic Sorcery', ['magia selvaggia', 'wild magic'], [
      P(3, 'Impennata di magia selvaggia', 'Una volta per turno, subito dopo aver lanciato un incantesimo da stregone con uno slot, puoi tirare 1d20: con 20 tiri sulla tabella delle impennate della magia selvaggia (nel manuale) e ne subisci l\'effetto. Se l\'effetto è un incantesimo, la metamagia non lo modifica.'),
      P(3, 'Maree del caos', 'Prima di tirare puoi darti vantaggio a un tiro d20. Poi devi lanciare un incantesimo da stregone con uno slot o completare un riposo lungo per riusarlo; se lanci un incantesimo con slot prima del riposo lungo, tiri in automatico sulla tabella delle impennate.'),
      P(6, 'Piegare la fortuna', 'Subito dopo che un\'altra creatura che vedi tira il d20 per un tiro d20, con la reazione spendi 1 punto stregoneria e tiri 1d4: lo applichi come bonus o penalità al suo tiro.'),
      P(14, 'Caos controllato', 'Quando tiri sulla tabella delle impennate della magia selvaggia, tiri due volte e scegli quale risultato usare.'),
      P(18, 'Impennata domata', 'Subito dopo aver lanciato un incantesimo da stregone con uno slot puoi scegliere un effetto della tabella delle impennate invece di tirare (non l\'ultima riga; se l\'effetto prevede un tiro, lo fai). Una volta per riposo lungo.'),
    ]),
  ],
  Warlock: [
    SOTTO('arcifata', 'Patrono Arcifata', 'Archfey Patron', ['arcifata', 'signore fatato', 'archfey'], [
      P(3, 'Incantesimi dell\'arcifata', 'Hai sempre preparati: 3° livello Calmare emozioni, Luminescenza, Passo velato, Forza fantasmatica, Sonno; 5° Intermittenza, Crescita vegetale; 7° Dominare bestie, Invisibilità superiore; 9° Dominare persone, Sembrare.'),
      P(3, 'Passi fatati', 'Lanci Passo velato senza slot tante volte quanto il tuo Carisma (minimo 1) per riposo lungo. Ogni volta che lanci Passo velato puoi aggiungere un effetto. Passo ristoratore: tu o una creatura entro 3 m ottenete 1d10 PF temporanei. Passo provocatorio: le creature entro 1,5 m dal punto che lasci fanno un tiro salvezza su Saggezza o hanno svantaggio ad attaccare chiunque non sia te fino all\'inizio del tuo turno successivo.'),
      P(6, 'Fuga nebbiosa', 'Puoi lanciare Passo velato con la reazione quando subisci danni. Nuovi effetti di Passi fatati. Passo che svanisce: sei Invisibile fino all\'inizio del tuo turno successivo o finché attacchi, infliggi danni o lanci un incantesimo. Passo terribile: le creature entro 1,5 m dal punto che lasci o da quello in cui arrivi (a scelta) fanno un tiro salvezza su Saggezza o subiscono 2d10 danni psichici.'),
      P(10, 'Difese seducenti', 'Sei immune alla condizione Affascinato. Subito dopo che una creatura che vedi ti colpisce, con la reazione dimezzi il danno e la costringi a un tiro salvezza su Saggezza: se fallisce subisce danni psichici pari a quelli che hai subito tu. Una volta per riposo lungo, oppure spendi uno slot del patto per riusarla.'),
      P(14, 'Magia stregante', 'Subito dopo aver lanciato con un\'azione e uno slot un incantesimo di ammaliamento o illusione, puoi lanciare Passo velato come parte della stessa azione, senza slot.'),
    ]),
    SOTTO('celestiale', 'Patrono Celestiale', 'Celestial Patron', ['celestiale', 'celestial'], [
      P(3, 'Incantesimi celestiali', 'Hai sempre preparati: 3° livello Aiuto, Cura ferite, Dardo guida, Ristorare inferiore, Luce, Fiamma sacra; 5° Luce diurna, Revivificare; 7° Guardiano della fede, Muro di fuoco; 9° Ristorare superiore, Evocare celestiale.'),
      P(3, 'Luce guaritrice', 'Hai una riserva di d6 pari a 1 + il tuo livello da warlock. Con un\'azione bonus curi te o una creatura che vedi entro 18 m spendendo fino a tanti dadi quanto il tuo Carisma (minimo 1): recupera il totale tirato. La riserva si ricarica con un riposo lungo.'),
      P(6, 'Anima radiosa', 'Resistenza ai danni radiosi. Una volta per turno, quando un tuo incantesimo infligge danni radiosi o da fuoco, aggiungi il Carisma ai danni contro uno dei bersagli.'),
      P(10, 'Resilienza celestiale', 'Quando usi Astuzia magica o completi un riposo breve o lungo ottieni PF temporanei pari al tuo livello da warlock + Carisma, e fino a cinque creature che vedi ne ottengono metà del tuo livello + Carisma.'),
      P(14, 'Vendetta rovente', 'Quando tu o un alleato entro 18 m state per fare un tiro salvezza contro la morte, liberate energia radiosa: la creatura recupera metà dei suoi PF massimi e può rialzarsi dalla condizione Prono; le creature a tua scelta entro 9 m da lei subiscono 2d8 + Carisma danni radiosi e sono Accecate fino alla fine del turno. Una volta per riposo lungo.'),
    ]),
    SOTTO('immondo', 'Patrono Immondo', 'Fiend Patron', ['immondo', 'fiend'], [
      P(3, 'Benedizione dell\'oscuro', 'Quando riduci un nemico a 0 PF, o qualcun altro lo fa entro 3 m da te, ottieni PF temporanei pari a Carisma + livello da warlock (minimo 1).'),
      P(3, 'Incantesimi dell\'immondo', 'Hai sempre preparati: 3° livello Mani brucianti, Comando, Raggio rovente, Suggestione; 5° Palla di fuoco, Nube maleodorante; 7° Scudo di fuoco, Muro di fuoco; 9° Costrizione (Geas), Piaga di insetti.'),
      P(6, 'Fortuna dell\'oscuro', 'Quando fai una prova di caratteristica o un tiro salvezza puoi aggiungere 1d10, anche dopo aver visto il risultato ma prima dei suoi effetti. Usi pari al Carisma (minimo 1), una volta per tiro, recuperati con un riposo lungo.'),
      P(10, 'Resilienza immonda', 'Dopo ogni riposo breve o lungo scegli un tipo di danno (non forza): hai resistenza a quel tipo finché non ne scegli un altro.'),
      P(14, 'Scagliare all\'inferno', 'Una volta per turno, quando colpisci una creatura con un tiro per colpire, le imponi un tiro salvezza su Carisma: se fallisce sparisce attraverso i piani inferiori, subisce 8d10 danni psichici (se non è un immondo) ed è Incapacitata fino alla fine del tuo turno successivo, quando ritorna. Una volta per riposo lungo, oppure spendi uno slot del patto per riusarlo.'),
    ]),
    SOTTO('grande-antico', 'Patrono Grande Antico', 'Great Old One Patron', ['grande antico', 'great old one'], [
      P(3, 'Mente risvegliata', 'Azione bonus: crei un legame telepatico con una creatura che vedi entro 9 m; potete comunicare entro tante miglia quanto il tuo Carisma (minimo 1) per tanti minuti quanto il tuo livello da warlock, usando una lingua che entrambi conoscete.'),
      P(3, 'Incantesimi del Grande Antico', 'Hai sempre preparati: 3° livello Individuazione dei pensieri, Sussurri dissonanti, Forza fantasmatica, Risata incontenibile di Tasha; 5° Chiaroveggenza, Fame di Hadar; 7° Confusione, Evocare aberrazione; 9° Modificare memoria, Telecinesi.'),
      P(3, 'Incantesimi psichici', 'Quando lanci un incantesimo da warlock che infligge danni puoi trasformarli in danni psichici. Gli incantesimi da warlock di ammaliamento o illusione puoi lanciarli senza componenti verbali né somatiche.'),
      P(6, 'Combattente chiaroveggente', 'Quando crei un legame con Mente risvegliata puoi imporre alla creatura un tiro salvezza su Saggezza: se fallisce, per tutta la durata del legame ha svantaggio ad attaccarti e tu hai vantaggio ad attaccarla. Una volta per riposo breve o lungo, oppure spendi uno slot del patto per riusarlo.'),
      P(10, 'Maledizione occulta', 'Hai sempre preparato Maledizione; quando la lanci e scegli una caratteristica, il bersaglio ha anche svantaggio ai tiri salvezza di quella caratteristica.'),
      P(10, 'Scudo mentale', 'I tuoi pensieri non possono essere letti senza il tuo permesso. Resistenza ai danni psichici; chi ti infligge danni psichici subisce lo stesso danno che subisci tu.'),
      P(14, 'Creare schiavo', 'Quando lanci Evocare aberrazione puoi fare in modo che non richieda concentrazione (dura 1 minuto); l\'aberrazione ottiene PF temporanei pari al tuo livello da warlock + Carisma e, la prima volta in ogni turno che colpisce una creatura sotto la tua Maledizione, infligge danni psichici extra pari al danno extra della Maledizione.'),
    ]),
  ],
  Mago: [
    SOTTO('abiuratore', 'Abiuratore', 'Abjurer', ['abiuratore', 'abiurazione', 'abjurer'], [
      P(3, 'Sapiente dell\'abiurazione', 'Aggiungi gratis al libro due incantesimi da mago di abiurazione di livello massimo 2; ogni volta che ottieni slot di un livello nuovo ne aggiungi gratis un altro di un livello che puoi lanciare.'),
      P(3, 'Egida arcana', 'Quando lanci un incantesimo di abiurazione con uno slot puoi creare su di te un\'egida che dura fino al riposo lungo, con PF massimi pari a 2 × il tuo livello da mago + Intelligenza. Quando subisci danni li subisce prima l\'egida (applicando prima le tue resistenze); l\'eccesso tocca a te. Ogni incantesimo di abiurazione lanciato con slot le fa recuperare 2 × il livello dello slot; con un\'azione bonus puoi anche spendere uno slot per lo stesso recupero. Puoi crearla una volta per riposo lungo.'),
      P(6, 'Egida proiettata', 'Quando una creatura che vedi entro 9 m subisce danni, con la reazione la tua Egida arcana assorbe quei danni al suo posto (l\'eccesso va alla creatura).'),
      P(10, 'Spezzaincantesimi', 'Hai sempre preparati Controincantesimo e Dissolvi magie. Puoi lanciare Dissolvi magie con un\'azione bonus e aggiungere il bonus di competenza alla sua prova. Se uno di questi due incantesimi lanciato con uno slot non riesce a fermare l\'incantesimo bersaglio, lo slot non si spende.'),
      P(14, 'Resistenza agli incantesimi', 'Vantaggio ai tiri salvezza contro gli incantesimi e resistenza ai danni degli incantesimi.'),
    ]),
    SOTTO('divinatore', 'Divinatore', 'Diviner', ['divinatore', 'divinazione', 'diviner'], [
      P(3, 'Sapiente della divinazione', 'Aggiungi gratis al libro due incantesimi da mago di divinazione di livello massimo 2; ogni volta che ottieni slot di un livello nuovo ne aggiungi gratis un altro di un livello che puoi lanciare.'),
      P(3, 'Presagio', 'Dopo ogni riposo lungo tiri due d20 e annoti i risultati. Prima che tu o una creatura che vedi facciate un tiro d20, puoi sostituirlo con uno di questi risultati (una volta per turno; ogni risultato si usa una volta). Quelli non usati si perdono al riposo lungo successivo.'),
      P(6, 'Divinazione esperta', 'Quando lanci un incantesimo di divinazione con uno slot di 2° livello o superiore recuperi uno slot speso di livello inferiore (massimo 5°).'),
      P(10, 'Il terzo occhio', 'Con un\'azione bonus scegli un beneficio che dura fino al tuo prossimo riposo: scurovisione 36 m; leggere qualsiasi lingua; oppure lanciare Vedere invisibilità senza slot. Una volta per riposo breve o lungo.'),
      P(14, 'Presagio superiore', 'Per Presagio tiri tre d20 invece di due.'),
    ]),
    SOTTO('invocatore', 'Invocatore', 'Evoker', ['invocatore', 'invocazione', 'evoker'], [
      P(3, 'Sapiente dell\'invocazione', 'Aggiungi gratis al libro due incantesimi da mago di invocazione di livello massimo 2; ogni volta che ottieni slot di un livello nuovo ne aggiungi gratis un altro di un livello che puoi lanciare.'),
      P(3, 'Trucchetto potente', 'Quando un tuo trucchetto manca il bersaglio o questo supera il tiro salvezza, subisce comunque metà dei danni (ma nessun altro effetto).'),
      P(6, 'Plasmare incantesimi', 'Quando lanci un incantesimo di invocazione che colpisce creature che vedi, puoi sceglierne fino a 1 + il livello dell\'incantesimo: superano in automatico il tiro salvezza e non subiscono danni se ne subirebbero metà.'),
      P(10, 'Invocazione potenziata', 'Quando lanci un incantesimo da mago di invocazione aggiungi l\'Intelligenza a un tiro per i danni.'),
      P(14, 'Sovraccarico', 'Quando lanci con uno slot da 1° a 5° livello un incantesimo da mago che infligge danni, nel turno di lancio fa i danni massimi. La prima volta non succede nulla; se lo rifai prima di un riposo lungo subisci 2d12 danni necrotici per livello dello slot (+1d12 per livello a ogni uso successivo), che ignorano resistenze e immunità.'),
    ]),
    SOTTO('illusionista', 'Illusionista', 'Illusionist', ['illusionista', 'illusione', 'illusionist'], [
      P(3, 'Sapiente dell\'illusione', 'Aggiungi gratis al libro due incantesimi da mago di illusione di livello massimo 2; ogni volta che ottieni slot di un livello nuovo ne aggiungi gratis un altro di un livello che puoi lanciare.'),
      P(3, 'Illusioni migliorate', 'Lanci gli incantesimi di illusione senza componenti verbali e quelli con gittata di almeno 3 m guadagnano 18 m di gittata. Conosci Illusione minore (o un altro trucchetto da mago se l\'avevi già), che non conta nel limite: con un solo lancio crei sia un suono sia un\'immagine e puoi lanciarlo con un\'azione bonus.'),
      P(6, 'Creature fantasmatiche', 'Hai sempre preparati Evocare bestia ed Evocare folletto e puoi renderli illusioni (creatura spettrale). La versione illusoria di ciascuno puoi lanciarla una volta per riposo lungo senza slot, ma la creatura ha metà dei PF.'),
      P(10, 'Io illusorio', 'Quando una creatura ti colpisce con un tiro per colpire, con la reazione interponi un tuo duplicato illusorio: l\'attacco ti manca in automatico. Una volta per riposo breve o lungo, oppure spendi uno slot di 2° livello o superiore per riusarlo.'),
      P(14, 'Realtà illusoria', 'Quando lanci un incantesimo di illusione con uno slot, con un\'azione bonus durante l\'incantesimo puoi rendere reale per 1 minuto un oggetto inanimato e non magico che ne fa parte (non può infliggere danni né condizioni), es. un ponte su un baratro.'),
    ]),
  ],
  // «fine sottoclassi»
};

// ───────────────────────── Talenti (capitolo 5) ─────────────────────────
// cat: origine | generale | stile (Stile di combattimento) | epico (Dono epico). req = requisiti. Gli id dei talenti delle
// origini sono gli stessi di dati2024.js (così Robusto, Allerta, Fortunato, Rissaiolo… hanno anche l'effetto automatico).
const T = (id, nome, en, cat, req, testo, extra = {}) => ({ id, nome, en, cat, req, testo, ...extra });
const AUM = (car) => `Aumento: +1 a ${car} (massimo 20).`;
const AUM_EPICO = 'Aumento: +1 a una caratteristica a scelta (massimo 30).';
export const CATEGORIE_TALENTI = { origine: 'Talenti delle origini', generale: 'Talenti generali', stile: 'Stili di combattimento', epico: 'Doni epici' };
export const TALENTI = [
  // Origini
  T('allerta', 'Allerta', 'Alert', 'origine', '', 'Competenza all\'iniziativa: aggiungi il bonus di competenza ai tiri di iniziativa (l\'app lo somma). Scambio di iniziativa: subito dopo averla tirata puoi scambiarla con quella di un alleato consenziente nello stesso combattimento, se nessuno dei due è Incapacitato.'),
  T('artigiano', 'Artigiano', 'Crafter', 'origine', '', 'Competenza con tre strumenti da artigiano a scelta. Sconto del 20% su ogni oggetto non magico che compri. Lavorazione rapida: alla fine di un riposo lungo, se hai gli strumenti giusti e ne sei competente, crei un oggetto della tabella del manuale (es. scala, torcia, corda, rete, tenda, bastone ferrato), che dura fino al riposo lungo successivo.'),
  T('guaritore', 'Guaritore', 'Healer', 'origine', '', 'Medico da campo: con un kit da guaritore e un\'azione Usare curi una creatura entro 1,5 m; lei spende un dado vita, tu lo tiri e recupera il risultato + il tuo bonus di competenza. Cure ritirate: quando tiri un dado per curare con un incantesimo o con questo talento, puoi ritirare gli 1.'),
  T('fortunato', 'Fortunato', 'Lucky', 'origine', '', 'Hai punti fortuna pari al bonus di competenza, recuperati con un riposo lungo (l\'app li aggiunge alle risorse). Spendi 1 punto per avere vantaggio a un tuo tiro d20, oppure per imporre svantaggio a un tiro per colpire contro di te.'),
  T('iniziato-alla-magia', 'Iniziato alla magia', 'Magic Initiate', 'origine', '', 'Scegli la lista del chierico, del druido o del mago e la caratteristica (Intelligenza, Saggezza o Carisma). Impari due trucchetti di quella lista e un incantesimo di 1° livello sempre preparato, che puoi lanciare una volta senza slot (di nuovo dopo un riposo lungo) o con i tuoi slot. Quando sali di livello puoi sostituire uno di questi incantesimi.', { ripetibile: 'ogni volta con una lista diversa' }),
  T('musicista', 'Musicista', 'Musician', 'origine', '', 'Competenza con tre strumenti musicali. Canto incoraggiante: alla fine di un riposo breve o lungo suoni uno strumento e dai Ispirazione eroica a tanti alleati che ti sentono quanto il tuo bonus di competenza.'),
  T('attaccante-selvaggio', 'Attaccante selvaggio', 'Savage Attacker', 'origine', '', 'Una volta per turno, quando colpisci con un\'arma, tiri due volte i dadi dei danni dell\'arma e usi il risultato che preferisci.'),
  T('abile', 'Abile', 'Skilled', 'origine', '', 'Competenza in tre abilità o strumenti a tua scelta, in qualsiasi combinazione.', { ripetibile: 'sì' }),
  T('rissaiolo', 'Rissaiolo', 'Tavern Brawler', 'origine', '', 'Colpo senz\'armi potenziato: quando colpisci puoi infliggere 1d4 + Forza danni contundenti invece del danno normale (l\'app lo usa da sola). Danni ritirati: ritiri gli 1 sui dadi dei danni dei colpi senz\'armi. Armi improvvisate: ne sei competente. Spinta: una volta per turno, quando colpisci con un colpo senz\'armi nell\'azione di Attacco, oltre ai danni puoi spingere il bersaglio di 1,5 m.'),
  T('robusto', 'Robusto', 'Tough', 'origine', '', 'I tuoi PF massimi aumentano del doppio del tuo livello del personaggio e di altri 2 a ogni livello successivo (l\'app li somma).'),
  // Generali (livello 4+)
  T('aumento-caratteristiche', 'Aumento dei punteggi di caratteristica', 'Ability Score Improvement', 'generale', 'Livello 4+', '+2 a una caratteristica oppure +1 a due caratteristiche, senza superare 20.', { ripetibile: 'sì' }),
  T('attore', 'Attore', 'Actor', 'generale', 'Livello 4+, Carisma 13+', AUM('Carisma') + ' Imitazione: travestito da una persona reale o immaginaria, vantaggio alle prove di Carisma (Inganno o Intrattenere) per farti credere quella persona. Mimetismo: imiti suoni e voci; chi ti sente deve superare una prova di Saggezza (Intuizione) con CD 8 + Carisma + competenza per capire che è falso.'),
  T('atleta', 'Atleta', 'Athlete', 'generale', 'Livello 4+, Forza o Destrezza 13+', AUM('Forza o Destrezza') + ' Velocità di scalare pari alla tua velocità. Da Prono ti rialzi spendendo solo 1,5 m di movimento. Puoi fare un salto in lungo o in alto con rincorsa dopo appena 1,5 m.'),
  T('caricatore', 'Caricatore', 'Charger', 'generale', 'Livello 4+, Forza o Destrezza 13+', AUM('Forza o Destrezza') + ' Scatto migliorato: quando fai Scatto la velocità aumenta di 3 m. Attacco in carica: se ti muovi di almeno 3 m in linea retta verso un bersaglio subito prima di colpirlo in mischia con l\'azione di Attacco, ottieni +1d8 ai danni oppure lo spingi fino a 3 m (se non è più di una taglia più grande di te); una volta per turno.'),
  T('cuoco', 'Cuoco', 'Chef', 'generale', 'Livello 4+', AUM('Costituzione o Saggezza') + ' Competenza con gli utensili da cuoco. Pasto ristoratore: durante un riposo breve cucini per 4 + competenza creature; chi mangia e spende dadi vita recupera 1d8 PF in più. Leccornie: con 1 ora di lavoro o alla fine di un riposo lungo prepari tante leccornie quanto il bonus di competenza (durano 8 ore); mangiarne una (azione bonus) dà PF temporanei pari al tuo bonus di competenza.'),
  T('esperto-di-balestre', 'Esperto di balestre', 'Crossbow Expert', 'generale', 'Livello 4+, Destrezza 13+', AUM('Destrezza') + ' Ignori la proprietà Ricarica delle balestre e puoi caricarle anche senza una mano libera. Essere entro 1,5 m da un nemico non ti dà svantaggio con le balestre. Nell\'attacco extra della proprietà Leggera con una balestra leggera aggiungi il modificatore ai danni.'),
  T('frantumatore', 'Frantumatore', 'Crusher', 'generale', 'Livello 4+', AUM('Forza o Costituzione') + ' Una volta per turno, quando colpisci con danni contundenti, sposti il bersaglio di 1,5 m (se non è più di una taglia più grande di te). Con un critico contundente, gli attacchi contro quel bersaglio hanno vantaggio fino all\'inizio del tuo turno successivo.'),
  T('duellante-difensivo', 'Duellante difensivo', 'Defensive Duelist', 'generale', 'Livello 4+, Destrezza 13+', AUM('Destrezza') + ' Parata: se impugni un\'arma accurata e vieni colpito in mischia, con la reazione aggiungi il bonus di competenza alla CA contro gli attacchi in mischia fino all\'inizio del tuo turno successivo (anche contro quello che ti ha colpito).'),
  T('combattere-con-due-armi', 'Combattere con due armi', 'Dual Wielder', 'generale', 'Livello 4+, Forza o Destrezza 13+', AUM('Forza o Destrezza') + ' Quando attacchi con un\'arma Leggera nell\'azione di Attacco, puoi fare un attacco extra con un\'azione bonus con un\'altra arma da mischia che non sia a due mani (anche non Leggera); non aggiungi il modificatore ai danni, salvo se negativo. Estrai o riponi due armi non a due mani quando potresti farlo con una sola.'),
  T('resistente', 'Resistente', 'Durable', 'generale', 'Livello 4+', AUM('Costituzione') + ' Vantaggio ai tiri salvezza contro la morte. Con un\'azione bonus spendi un dado vita e recuperi PF pari al risultato.'),
  T('adepto-elementale', 'Adepto elementale', 'Elemental Adept', 'generale', 'Livello 4+, privilegio Incantesimi o Magia del patto', AUM('Intelligenza, Saggezza o Carisma') + ' Scegli acido, freddo, fuoco, fulmine o tuono: i tuoi incantesimi ignorano la resistenza a quel tipo e nei loro dadi di danno di quel tipo un 1 conta come 2.', { ripetibile: 'ogni volta con un tipo di danno diverso' }),
  T('tocco-fatato', 'Tocco fatato', 'Fey-Touched', 'generale', 'Livello 4+', AUM('Intelligenza, Saggezza o Carisma') + ' Hai sempre preparati Passo velato e un incantesimo di 1° livello di divinazione o ammaliamento a scelta; puoi lanciarli ciascuno una volta senza slot per riposo lungo, o con i tuoi slot. Usano la caratteristica aumentata.'),
  T('lottatore', 'Lottatore', 'Grappler', 'generale', 'Livello 4+, Forza o Destrezza 13+', AUM('Forza o Destrezza') + ' Una volta per turno, quando colpisci con un colpo senz\'armi nell\'azione di Attacco, puoi sia infliggere danni sia afferrare. Vantaggio agli attacchi contro chi stai afferrando. Spostare chi afferri (della tua taglia o più piccolo) non ti dimezza la velocità.'),
  T('maestro-delle-armi-possenti', 'Maestro delle armi possenti', 'Great Weapon Master', 'generale', 'Livello 4+, Forza 13+', AUM('Forza') + ' Quando colpisci con un\'arma Pesante nell\'azione di Attacco, aggiungi ai danni il bonus di competenza. Subito dopo un critico in mischia o aver portato una creatura a 0 PF con un\'arma da mischia, puoi fare un attacco con la stessa arma come azione bonus.'),
  T('pesantemente-corazzato', 'Pesantemente corazzato', 'Heavily Armored', 'generale', 'Livello 4+, addestramento alle armature medie', AUM('Costituzione o Forza') + ' Ottieni l\'addestramento alle armature pesanti.'),
  T('maestro-delle-armature-pesanti', 'Maestro delle armature pesanti', 'Heavy Armor Master', 'generale', 'Livello 4+, addestramento alle armature pesanti', AUM('Costituzione o Forza') + ' Quando indossi un\'armatura pesante e vieni colpito da un attacco, i danni contundenti, perforanti e taglienti di quell\'attacco si riducono del tuo bonus di competenza.'),
  T('leader-ispiratore', 'Leader ispiratore', 'Inspiring Leader', 'generale', 'Livello 4+, Saggezza o Carisma 13+', AUM('Saggezza o Carisma') + ' Alla fine di un riposo breve o lungo, con un discorso o un canto, fino a sei alleati entro 9 m (anche tu) ottengono PF temporanei pari al tuo livello del personaggio + il modificatore della caratteristica aumentata.'),
  T('mente-acuta', 'Mente acuta', 'Keen Mind', 'generale', 'Livello 4+, Intelligenza 13+', AUM('Intelligenza') + ' Scegli Arcano, Storia, Indagare, Natura o Religione: ne ottieni la competenza o, se l\'avevi, la maestria. Puoi fare l\'azione Studiare come azione bonus.'),
  T('leggermente-corazzato', 'Leggermente corazzato', 'Lightly Armored', 'generale', 'Livello 4+', AUM('Forza o Destrezza') + ' Ottieni l\'addestramento alle armature leggere e agli scudi.'),
  T('cacciatore-di-maghi', 'Cacciatore di maghi', 'Mage Slayer', 'generale', 'Livello 4+', AUM('Forza o Destrezza') + ' Quando danneggi una creatura che si sta concentrando, ha svantaggio al tiro salvezza per mantenere la concentrazione. Mente protetta: se fallisci un tiro salvezza su Intelligenza, Saggezza o Carisma puoi superarlo invece; una volta per riposo breve o lungo.'),
  T('addestramento-armi-da-guerra', 'Addestramento con le armi da guerra', 'Martial Weapon Training', 'generale', 'Livello 4+', AUM('Forza o Destrezza') + ' Ottieni la competenza con le armi da guerra.'),
  T('maestro-delle-armature-medie', 'Maestro delle armature medie', 'Medium Armor Master', 'generale', 'Livello 4+, addestramento alle armature medie', AUM('Forza o Destrezza') + ' Con un\'armatura media aggiungi fino a 3 invece di 2 alla CA, se hai Destrezza 16 o più.'),
  T('moderatamente-corazzato', 'Moderatamente corazzato', 'Moderately Armored', 'generale', 'Livello 4+, addestramento alle armature leggere', AUM('Forza o Destrezza') + ' Ottieni l\'addestramento alle armature medie.'),
  T('combattente-in-sella', 'Combattente in sella', 'Mounted Combatant', 'generale', 'Livello 4+', AUM('Forza, Destrezza o Saggezza') + ' In sella hai vantaggio ad attaccare le creature non in sella entro 1,5 m dalla cavalcatura e più piccole di lei di almeno una taglia. La cavalcatura, se la cavalchi e nessuno dei due è Incapacitato, non subisce danni se supera un TS su Destrezza da mezzi danni e ne subisce metà se lo fallisce. Puoi far colpire te invece della cavalcatura.'),
  T('osservatore', 'Osservatore', 'Observant', 'generale', 'Livello 4+, Intelligenza o Saggezza 13+', AUM('Intelligenza o Saggezza') + ' Scegli Intuizione, Indagare o Percezione: ne ottieni la competenza o, se l\'avevi, la maestria. Puoi fare l\'azione Cercare come azione bonus.'),
  T('perforatore', 'Perforatore', 'Piercer', 'generale', 'Livello 4+', AUM('Forza o Destrezza') + ' Una volta per turno, quando colpisci con danni perforanti, puoi ritirare uno dei dadi dei danni (devi usare il nuovo risultato). Con un critico perforante tiri un dado di danno in più.'),
  T('avvelenatore', 'Avvelenatore', 'Poisoner', 'generale', 'Livello 4+', AUM('Destrezza o Intelligenza') + ' I tuoi danni da veleno ignorano la resistenza al veleno. Competenza con il kit da avvelenatore: con 1 ora e 50 mo di materiali crei tante dosi quanto il bonus di competenza; con un\'azione bonus applichi una dose a un\'arma o munizione (dura 1 minuto o fino al colpo): chi subisce danni fa un TS su Costituzione (CD 8 + caratteristica aumentata + competenza) o subisce 2d8 danni da veleno ed è Avvelenato fino alla fine del tuo turno successivo.'),
  T('maestro-delle-armi-ad-asta', 'Maestro delle armi ad asta', 'Polearm Master', 'generale', 'Livello 4+, Forza o Destrezza 13+', AUM('Forza o Destrezza') + ' Dopo aver attaccato nell\'azione di Attacco con un bastone ferrato, una lancia o un\'arma Pesante con Portata, con un\'azione bonus attacchi con l\'altra estremità: 1d4 danni contundenti. Mentre impugni una di queste armi, con la reazione attacchi in mischia una creatura che entra nella tua portata.'),
  T('tenace', 'Tenace', 'Resilient', 'generale', 'Livello 4+', 'Scegli una caratteristica in cui non hai competenza nei tiri salvezza: +1 a quella caratteristica (massimo 20) e ottieni la competenza nei suoi tiri salvezza.'),
  T('celebrante-di-rituali', 'Celebrante di rituali', 'Ritual Caster', 'generale', 'Livello 4+, Intelligenza, Saggezza o Carisma 13+', AUM('Intelligenza, Saggezza o Carisma') + ' Hai sempre preparati tanti incantesimi rituali di 1° livello quanto il tuo bonus di competenza (uno in più ogni volta che il bonus cresce), lanciabili anche con i tuoi slot. Rituale rapido: una volta per riposo lungo lanci un rituale preparato con il tempo normale, senza slot.'),
  T('sentinella', 'Sentinella', 'Sentinel', 'generale', 'Livello 4+, Forza o Destrezza 13+', AUM('Forza o Destrezza') + ' Guardiano: subito dopo che una creatura entro 1,5 m da te fa Disimpegno o colpisce qualcuno che non sei tu, puoi farle un attacco di opportunità. Fermo: quando colpisci con un attacco di opportunità, la velocità della creatura diventa 0 per il resto del turno.'),
  T('tocco-dell-ombra', 'Tocco dell\'ombra', 'Shadow-Touched', 'generale', 'Livello 4+', AUM('Intelligenza, Saggezza o Carisma') + ' Hai sempre preparati Invisibilità e un incantesimo di 1° livello di illusione o necromanzia a scelta; puoi lanciarli ciascuno una volta senza slot per riposo lungo, o con i tuoi slot. Usano la caratteristica aumentata.'),
  T('tiratore-scelto', 'Tiratore scelto', 'Sharpshooter', 'generale', 'Livello 4+, Destrezza 13+', AUM('Destrezza') + ' I tuoi attacchi a distanza con armi ignorano mezza copertura e copertura di tre quarti. Essere entro 1,5 m da un nemico non ti dà svantaggio con le armi a distanza. Attaccare alla gittata lunga non ti dà svantaggio.'),
  T('maestro-degli-scudi', 'Maestro degli scudi', 'Shield Master', 'generale', 'Livello 4+, addestramento agli scudi', AUM('Forza') + ' Colpo di scudo: una volta per turno, se colpisci una creatura entro 1,5 m con un\'arma da mischia nell\'azione di Attacco, con lo scudo la costringi a un TS su Forza (CD 8 + Forza + competenza) o la spingi di 1,5 m o la fai cadere Prona. Interporre lo scudo: quando un effetto ti permette un TS su Destrezza per mezzi danni, se impugni uno scudo e lo superi, con la reazione non subisci danni.'),
  T('esperto-di-abilita', 'Esperto di abilità', 'Skill Expert', 'generale', 'Livello 4+', '+1 a una caratteristica a scelta (massimo 20). Competenza in un\'abilità a scelta. Maestria in un\'abilità in cui sei competente.'),
  T('furtivo', 'Furtivo', 'Skulker', 'generale', 'Livello 4+, Destrezza 13+', AUM('Destrezza') + ' Vista cieca entro 3 m. In combattimento hai vantaggio alle prove di Furtività dell\'azione Nascondersi. Se attacchi mentre sei nascosto e manchi, non riveli la tua posizione.'),
  T('fendente', 'Fendente', 'Slasher', 'generale', 'Livello 4+', AUM('Forza o Destrezza') + ' Una volta per turno, quando colpisci con danni taglienti, la velocità del bersaglio cala di 3 m fino all\'inizio del tuo turno successivo. Con un critico tagliente, il bersaglio ha svantaggio ai tiri per colpire fino all\'inizio del tuo turno successivo.'),
  T('veloce', 'Veloce', 'Speedy', 'generale', 'Livello 4+, Destrezza o Costituzione 13+', AUM('Destrezza o Costituzione') + ' La tua velocità aumenta di 3 m. Quando fai Scatto, per il resto del turno il terreno difficile non ti costa movimento extra. Gli attacchi di opportunità contro di te hanno svantaggio.'),
  T('cecchino-magico', 'Cecchino magico', 'Spell Sniper', 'generale', 'Livello 4+, privilegio Incantesimi o Magia del patto', AUM('Intelligenza, Saggezza o Carisma') + ' I tiri per colpire dei tuoi incantesimi ignorano mezza copertura e copertura di tre quarti; essere entro 1,5 m da un nemico non ti dà svantaggio con gli incantesimi; gli incantesimi con tiro per colpire e gittata di almeno 3 m guadagnano 18 m di gittata.'),
  T('telecinetico', 'Telecinetico', 'Telekinetic', 'generale', 'Livello 4+', AUM('Intelligenza, Saggezza o Carisma') + ' Conosci Mano magica: la lanci senza componenti verbali né somatiche, puoi renderla invisibile e ha 9 m di gittata in più. Con un\'azione bonus spingi telepaticamente una creatura che vedi entro 9 m: TS su Forza (CD 8 + caratteristica aumentata + competenza) o la sposti di 1,5 m verso di te o lontano.'),
  T('telepatico', 'Telepatico', 'Telepathic', 'generale', 'Livello 4+', AUM('Intelligenza, Saggezza o Carisma') + ' Puoi parlare telepaticamente con una creatura che vedi entro 18 m (capisce solo se conosce la lingua; non può risponderti così). Hai sempre preparato Individuazione dei pensieri: una volta per riposo lungo lo lanci senza slot né componenti, o con i tuoi slot.'),
  T('incantatore-da-guerra', 'Incantatore da guerra', 'War Caster', 'generale', 'Livello 4+, privilegio Incantesimi o Magia del patto', AUM('Intelligenza, Saggezza o Carisma') + ' Vantaggio ai TS su Costituzione per mantenere la concentrazione. Quando una creatura ti provoca un attacco di opportunità lasciando la tua portata, con la reazione puoi lanciarle invece un incantesimo da un\'azione che prenda di mira solo lei. Puoi eseguire le componenti somatiche anche con armi o scudo in mano.'),
  T('maestro-d-armi', 'Maestro d\'armi', 'Weapon Master', 'generale', 'Livello 4+', AUM('Forza o Destrezza') + ' Usi la proprietà di maestria di un tipo di arma semplice o da guerra in cui sei competente; dopo un riposo lungo puoi cambiarlo.'),
  // Stili di combattimento
  T('tiro', 'Tiro', 'Archery', 'stile', 'Privilegio Stile di combattimento', '+2 ai tiri per colpire con le armi a distanza.'),
  T('combattere-alla-cieca', 'Combattere alla cieca', 'Blind Fighting', 'stile', 'Privilegio Stile di combattimento', 'Hai la vista cieca entro 3 m.'),
  T('difesa', 'Difesa', 'Defense', 'stile', 'Privilegio Stile di combattimento', '+1 alla CA mentre indossi un\'armatura leggera, media o pesante.'),
  T('duellare', 'Duellare', 'Dueling', 'stile', 'Privilegio Stile di combattimento', '+2 ai danni con un\'arma da mischia impugnata in una mano, se non impugni altre armi.'),
  T('armi-possenti', 'Combattere con armi possenti', 'Great Weapon Fighting', 'stile', 'Privilegio Stile di combattimento', 'Quando tiri i danni di un\'arma da mischia a due mani o versatile impugnata con due mani, ogni 1 o 2 sui dadi conta come 3.'),
  T('intercettare', 'Intercettare', 'Interception', 'stile', 'Privilegio Stile di combattimento', 'Quando una creatura che vedi colpisce un\'altra creatura entro 1,5 m da te, con la reazione riduci il danno di 1d10 + bonus di competenza. Devi impugnare uno scudo o un\'arma semplice o da guerra.'),
  T('protezione', 'Protezione', 'Protection', 'stile', 'Privilegio Stile di combattimento', 'Quando una creatura che vedi attacca un bersaglio diverso da te entro 1,5 m da te, con la reazione interponi lo scudo (se lo impugni): svantaggio a quell\'attacco e a tutti gli altri contro quel bersaglio fino all\'inizio del tuo turno successivo, se resti entro 1,5 m.'),
  T('armi-da-lancio', 'Combattere con armi da lancio', 'Thrown Weapon Fighting', 'stile', 'Privilegio Stile di combattimento', '+2 ai danni quando colpisci con un attacco a distanza con un\'arma da lancio.'),
  T('due-armi', 'Combattere con due armi (stile)', 'Two-Weapon Fighting', 'stile', 'Privilegio Stile di combattimento', 'Nell\'attacco extra della proprietà Leggera aggiungi il modificatore di caratteristica ai danni.'),
  T('combattere-senz-armi', 'Combattere senz\'armi', 'Unarmed Fighting', 'stile', 'Privilegio Stile di combattimento', 'I tuoi colpi senz\'armi possono infliggere 1d6 + Forza danni contundenti (1d8 se non impugni armi né scudo). All\'inizio di ogni tuo turno puoi infliggere 1d4 danni contundenti a una creatura che stai afferrando.'),
  // Doni epici
  T('dono-bravura', 'Dono della bravura in combattimento', 'Boon of Combat Prowess', 'epico', 'Livello 19+', AUM_EPICO + ' Mira impareggiabile: quando manchi con un tiro per colpire puoi colpire invece; poi non puoi riusarlo fino all\'inizio del tuo turno successivo.'),
  T('dono-viaggio', 'Dono del viaggio dimensionale', 'Boon of Dimensional Travel', 'epico', 'Livello 19+', AUM_EPICO + ' Subito dopo l\'azione di Attacco o l\'azione Magia puoi teletrasportarti fino a 9 m in uno spazio libero che vedi.'),
  T('dono-resistenza', 'Dono della resistenza all\'energia', 'Boon of Energy Resistance', 'epico', 'Livello 19+', AUM_EPICO + ' Resistenza a due tipi tra acido, freddo, fuoco, fulmine, necrotici, veleno, psichici, radiosi e tuono (cambiabili dopo un riposo lungo). Quando subisci danni di uno di quei tipi, con la reazione costringi una creatura entro 18 m a un TS su Destrezza (CD 8 + Costituzione + competenza) o subisce 2d12 + Costituzione danni di quel tipo.'),
  T('dono-fato', 'Dono del fato', 'Boon of Fate', 'epico', 'Livello 19+', AUM_EPICO + ' Quando tu o una creatura entro 18 m superate o fallite un tiro d20, puoi tirare 2d4 e applicarli come bonus o penalità. Poi non puoi riusarlo finché non tiri l\'iniziativa o completi un riposo.'),
  T('dono-tempra', 'Dono della tempra', 'Boon of Fortitude', 'epico', 'Livello 19+', AUM_EPICO + ' I tuoi PF massimi aumentano di 40. Quando recuperi PF puoi recuperarne in più quanto la tua Costituzione (una volta per turno).'),
  T('dono-offesa', 'Dono dell\'offesa irresistibile', 'Boon of Irresistible Offense', 'epico', 'Livello 19+', '+1 a Forza o Destrezza (massimo 30). I tuoi danni contundenti, perforanti e taglienti ignorano sempre la resistenza. Quando fai 20 naturale su un tiro per colpire infliggi danni extra pari al punteggio della caratteristica aumentata.'),
  T('dono-recupero', 'Dono del recupero', 'Boon of Recovery', 'epico', 'Livello 19+', AUM_EPICO + ' Ultima resistenza: quando scenderesti a 0 PF puoi restare a 1 PF e recuperare metà dei PF massimi (una volta per riposo lungo). Riserva di dieci d10: con un\'azione bonus ne spendi alcuni e recuperi il totale; si ricarica con un riposo lungo.'),
  T('dono-abilita', 'Dono dell\'abilità', 'Boon of Skill', 'epico', 'Livello 19+', AUM_EPICO + ' Competenza in tutte le abilità e maestria in un\'abilità a scelta.'),
  T('dono-velocita', 'Dono della velocità', 'Boon of Speed', 'epico', 'Livello 19+', AUM_EPICO + ' Con un\'azione bonus fai Disimpegno, che pone fine anche alla condizione Afferrato su di te. La tua velocità aumenta di 9 m.'),
  T('dono-richiamo', 'Dono del richiamo degli incantesimi', 'Boon of Spell Recall', 'epico', 'Livello 19+, privilegio Incantesimi', '+1 a Intelligenza, Saggezza o Carisma (massimo 30). Quando lanci un incantesimo con uno slot da 1° a 4° livello tiri 1d4: se il risultato è uguale al livello dello slot, lo slot non si spende.'),
  T('dono-spirito-notte', 'Dono dello spirito della notte', 'Boon of the Night Spirit', 'epico', 'Livello 19+', AUM_EPICO + ' In luce fioca o oscurità puoi diventare Invisibile con un\'azione bonus (finisce appena fai un\'azione, un\'azione bonus o una reazione) e hai resistenza a tutti i danni tranne psichici e radiosi.'),
  T('dono-vista-vero', 'Dono della vista del vero', 'Boon of Truesight', 'epico', 'Livello 19+', AUM_EPICO + ' Hai la vista del vero entro 18 m.'),
];
export const talentoDaId = (id) => TALENTI.find((t) => t.id === id) || null;

// ───────────────────────── Funzioni per la scheda ─────────────────────────
import { SPECIE, BACKGROUND, TALENTI_ORIGINE } from './dati2024.js';
import { elencoClassi } from './regole.js';

const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

// Riconosce la sottoclasse scritta nella scheda (nome italiano, inglese o abbreviato, es. "Campione", "Path of the Berserker")
export function sottoclasseDi(classe, testo) {
  const t = norm(testo);
  const lista = SOTTOCLASSI[classe] || [];
  if (!t) return null;
  return lista.find((s) => norm(s.nome) === t || norm(s.en) === t || s.alias.some((a) => norm(a) === t))
    || lista.find((s) => t.includes(norm(s.nome)) || s.alias.some((a) => norm(a).length >= 4 && t.includes(norm(a))))
    || null;
}

// Privilegi ottenuti fino a un certo livello; per quelli che si ripetono (es. Aumento dei punteggi) i livelli già raggiunti
const finoA = (lista, livello) => (lista || []).filter((p) => p.liv <= livello)
  .map((p) => ({ ...p, livelli: [p.liv, ...(p.ripeti || [])].filter((l) => l <= livello) }));

// Tratti automatici del personaggio, a gruppi: specie, ogni classe e la sua sottoclasse
export function gruppiTratti(pg) {
  const gruppi = [];
  const s = SPECIE[pg.razza];
  if (s) gruppi.push({ id: 'specie', titolo: `Specie: ${pg.razza}`, voci: s.tratti.map((t) => ({ nome: t.titolo, testo: t.testo, info: '' })) });
  for (const c of elencoClassi(pg)) {
    const priv = PRIVILEGI_CLASSE[c.classe];
    if (!priv) continue;
    gruppi.push({ id: 'classe-' + c.classe, titolo: `${c.classe} · livello ${c.livello}`,
      voci: finoA(priv, c.livello).map((p) => ({ nome: p.nome, testo: p.testo, info: 'liv. ' + p.livelli.join(', ') })) });
    const sc = sottoclasseDi(c.classe, c.sottoclasse);
    if (sc) gruppi.push({ id: 'sotto-' + sc.id, titolo: `${sc.nome} (${c.classe})`, sottoclasse: sc,
      voci: finoA(sc.privilegi, c.livello).map((p) => ({ nome: p.nome, testo: p.testo, info: 'liv. ' + p.liv })) });
    else if (c.livello >= 3) gruppi.push({ id: 'sotto-mancante-' + c.classe, titolo: `Sottoclasse (${c.classe})`, voci: [], manca: true, classe: c.classe, scritta: c.sottoclasse || '' });
  }
  return gruppi;
}

// Talenti del personaggio: quello del background, quelli scelti dall'elenco (pg.talentiScelti) e quelli
// accesi con effetto automatico (pg.talenti) che non sono già tra i precedenti
export function talentiDelPg(pg) {
  const out = [];
  const bg = BACKGROUND.find((b) => b.nome === pg.background);
  if (bg?.talento) out.push({ id: bg.talento, fonte: `background ${bg.nome}` });
  for (const s of pg.talentiScelti || []) out.push({ id: s.id, uid: s.uid, fonte: 'scelto da te' });
  for (const id of pg.talenti || []) if (!out.some((t) => t.id === id)) out.push({ id, fonte: 'effetto automatico acceso', automatico: true });
  return out.map((t) => {
    const d = talentoDaId(t.id) || (TALENTI_ORIGINE[t.id] ? { nome: TALENTI_ORIGINE[t.id].nome, testo: TALENTI_ORIGINE[t.id].testo, cat: 'origine' } : null);
    return d ? { ...t, nome: d.nome, testo: d.testo, cat: d.cat, req: d.req || '' } : null;
  }).filter(Boolean);
}

// Privilegi di sottoclasse ottenuti esattamente a un livello (per il pannello "sali di livello")
export const privilegiSottoclasseAlLivello = (classe, testo, livello) => (sottoclasseDi(classe, testo)?.privilegi || []).filter((p) => p.liv === livello).map((p) => p.nome);
