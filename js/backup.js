// Backup completo in un file .zip: backup.json (personaggi e impostazioni) + cartella modelli/ con i .glb.
import { db } from './db.js';
import { avviso, fmtMB } from './ui.js';

// ───── CRC32 ─────
const TAB = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(u8) { let c = 0xffffffff; for (let i = 0; i < u8.length; i++) c = TAB[(c ^ u8[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }

// ───── Scrittura zip (senza compressione, compatibile con qualsiasi programma) ─────
export function creaZip(voci) {
  const enc = new TextEncoder();
  const parti = []; const centrale = []; let offset = 0;
  const ora = new Date();
  const dosT = (ora.getHours() << 11) | (ora.getMinutes() << 5) | (ora.getSeconds() >> 1);
  const dosD = ((ora.getFullYear() - 1980) << 9) | ((ora.getMonth() + 1) << 5) | ora.getDate();
  for (const v of voci) {
    const nome = enc.encode(v.nome); const dati = v.dati instanceof Uint8Array ? v.dati : new Uint8Array(v.dati);
    const crc = crc32(dati);
    const loc = new DataView(new ArrayBuffer(30));
    loc.setUint32(0, 0x04034b50, true); loc.setUint16(4, 20, true); loc.setUint16(6, 0x0800, true); loc.setUint16(8, 0, true);
    loc.setUint16(10, dosT, true); loc.setUint16(12, dosD, true); loc.setUint32(14, crc, true);
    loc.setUint32(18, dati.length, true); loc.setUint32(22, dati.length, true); loc.setUint16(26, nome.length, true); loc.setUint16(28, 0, true);
    parti.push(loc.buffer, nome, dati);
    const cen = new DataView(new ArrayBuffer(46));
    cen.setUint32(0, 0x02014b50, true); cen.setUint16(4, 20, true); cen.setUint16(6, 20, true); cen.setUint16(8, 0x0800, true); cen.setUint16(10, 0, true);
    cen.setUint16(12, dosT, true); cen.setUint16(14, dosD, true); cen.setUint32(16, crc, true);
    cen.setUint32(20, dati.length, true); cen.setUint32(24, dati.length, true); cen.setUint16(28, nome.length, true);
    cen.setUint32(42, offset, true);
    centrale.push(cen.buffer, nome);
    offset += 30 + nome.length + dati.length;
  }
  const dimCentrale = centrale.reduce((s, p) => s + (p.byteLength ?? p.length), 0);
  const fine = new DataView(new ArrayBuffer(22));
  fine.setUint32(0, 0x06054b50, true); fine.setUint16(8, voci.length, true); fine.setUint16(10, voci.length, true);
  fine.setUint32(12, dimCentrale, true); fine.setUint32(16, offset, true);
  return new Blob([...parti, ...centrale, fine.buffer], { type: 'application/zip' });
}

// ───── Lettura zip ─────
async function leggiZip(buffer) {
  const dv = new DataView(buffer); const u8 = new Uint8Array(buffer);
  let e = -1;
  for (let i = buffer.byteLength - 22; i >= Math.max(0, buffer.byteLength - 65557); i--) if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; }
  if (e < 0) throw new Error('Il file non è un backup valido (zip non riconosciuto)');
  const n = dv.getUint16(e + 10, true); let p = dv.getUint32(e + 16, true);
  const dec = new TextDecoder(); const voci = {};
  for (let k = 0; k < n; k++) {
    if (dv.getUint32(p, true) !== 0x02014b50) throw new Error('Backup danneggiato');
    const metodo = dv.getUint16(p + 10, true), comp = dv.getUint32(p + 20, true);
    const ln = dv.getUint16(p + 28, true), lx = dv.getUint16(p + 30, true), lc = dv.getUint16(p + 32, true), off = dv.getUint32(p + 42, true);
    const nome = dec.decode(u8.subarray(p + 46, p + 46 + ln));
    const inizio = off + 30 + dv.getUint16(off + 26, true) + dv.getUint16(off + 28, true);
    voci[nome] = { metodo, dati: buffer.slice(inizio, inizio + comp) };
    p += 46 + ln + lx + lc;
  }
  return voci;
}
async function estrai(v) {
  if (v.metodo === 0) return v.dati;
  if (v.metodo === 8 && 'DecompressionStream' in window) return new Response(new Blob([v.dati]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer();
  throw new Error('Formato di compressione non supportato');
}

const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

async function consegna(blob, nomeFile) {
  const file = new File([blob], nomeFile, { type: 'application/zip' });
  if (isIOS() && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: nomeFile }); return true; }
    catch (e) { if (e.name === 'AbortError') return false; }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = nomeFile;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  return true;
}

// Esporta tutti i personaggi (o solo quelli indicati) con i loro modelli 3D
export async function esportaBackup(idPersonaggi = null) {
  let personaggi = await db.tutti('personaggi');
  if (idPersonaggi) personaggi = personaggi.filter((p) => idPersonaggi.includes(p.id));
  const usati = new Set();
  personaggi.forEach((p) => { p.modelli?.forEach((m) => usati.add(m.fileId)); p.inventario?.forEach((o) => o.modello && usati.add(o.modello)); });
  const elenco = (await db.elencoFile()).filter((f) => usati.has(f.id));
  const voci = []; const infoFile = [];
  for (const f of elenco) {
    const rec = await db.leggi('file', f.id);
    const percorso = `modelli/${f.id}.glb`;
    voci.push({ nome: percorso, dati: rec.dati });
    infoFile.push({ id: f.id, nome: f.nome, dimensione: f.dimensione, tipo: f.tipo, percorso });
  }
  const impostazioni = idPersonaggi ? [] : await db.tutti('impostazioni');
  const json = { app: 'scheda-dnd', formato: 1, data: new Date().toISOString(), personaggi, file: infoFile, impostazioni };
  voci.unshift({ nome: 'backup.json', dati: new TextEncoder().encode(JSON.stringify(json, null, 1)) });
  const blob = creaZip(voci);
  const d = new Date();
  const nomeFile = `scheda-dnd-${idPersonaggi && personaggi.length === 1 ? personaggi[0].nome.replace(/[^\w-]+/g, '_') + '-' : ''}${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}.zip`;
  const ok = await consegna(blob, nomeFile);
  if (ok) {
    await db.salvaImpostazione('ultimoBackup', Date.now());
    avviso(`Backup pronto: ${personaggi.length} personaggi, ${elenco.length} modelli 3D (${fmtMB(blob.size)})`);
  }
  return ok;
}

// Importa un backup. modo: 'unisci' | 'sostituisci'
export async function importaBackup(file, modo = 'unisci') {
  const voci = await leggiZip(await file.arrayBuffer());
  if (!voci['backup.json']) throw new Error('Nel file manca backup.json');
  const json = JSON.parse(new TextDecoder().decode(await estrai(voci['backup.json'])));
  if (json.app !== 'scheda-dnd') throw new Error('Questo non è un backup della Scheda D&D');
  if (modo === 'sostituisci') { await db.svuota('personaggi'); await db.svuota('file'); }
  let nf = 0;
  for (const f of json.file || []) {
    const v = voci[f.percorso]; if (!v) continue;
    await db.scrivi('file', { id: f.id, nome: f.nome, dimensione: f.dimensione, tipo: f.tipo, dati: await estrai(v), creato: Date.now() });
    nf++;
  }
  for (const p of json.personaggi || []) await db.scrivi('personaggi', p);
  for (const i of json.impostazioni || []) if (i.chiave !== 'ultimoBackup') await db.scrivi('impostazioni', i);
  return { personaggi: (json.personaggi || []).length, file: nf };
}
