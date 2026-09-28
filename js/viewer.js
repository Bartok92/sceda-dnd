// Visualizzatore 3D del personaggio (three.js): luci d'atmosfera, piedistallo,
// gesti touch, animazioni e oggetti agganciati alle ossa dello scheletro.
import * as THREE from '../vendor/three-bundle.js';
import { db } from './db.js';

const ALTEZZA = 1.8; // il personaggio viene sempre scalato a 1,8 "metri"

// Dimensione iniziale degli oggetti per slot (lato più lungo, in metri) e posizione di partenza
export const PREDEFINITI_SLOT = {
  testa:   { dim: 0.3, p: [0, 0.1, 0], r: [0, 0, 0] },
  collo:   { dim: 0.13, p: [0, -0.03, 0.1], r: [0, 0, 0] },
  schiena: { dim: 0.6, p: [0, 0, -0.16], r: [0, 0, 20] },
  manoDx:  { dim: 0.95, p: [0, 0, 0], r: [90, 0, 0] },
  manoSx:  { dim: 0.6, p: [0.06, 0, 0], r: [0, 90, 0] },
  cintura: { dim: 0.18, p: [0.14, 0, 0.1], r: [0, 0, 0] },
};

export const QUALITA = {
  massima: { tex: 4096, pr: 3, ombre: true },   // piena risoluzione Retina (iPhone Pro / Pro Max)
  alta: { tex: 4096, pr: 2, ombre: true },
  bilanciata: { tex: 2048, pr: 1.75, ombre: true },
  risparmio: { tex: 1024, pr: 1, ombre: false },
};

let renderer, scena, camera, controlli, orologio, contenitore, gruppoPersonaggio, marcatore, runeAnello, braci, torcia;
let luceContorno, luceRossa, matPietra, matOro; // riferimenti usati dai temi
let temaScena = 'grimorio';
let torciaBase = 3.2;

// Colori della scena per ogni tema grafico
const TEMI_3D = {
  grimorio: { nebbia: 0x120709, contorno: [0x7090ff, 1.6], rossa: [0xff3030, 0.8], torcia: [0xff8a2a, 3.2], oro: [0xd9a94e, 0x000000, 0], rune: [0xffffff, 0.55], pietra: [0x3a302c, 0x000000, 0], braci: 0.05 },
  lava: { nebbia: 0x080202, contorno: [0xff4a1a, 2.4], rossa: [0xff2208, 1.9], torcia: [0xff5a1a, 4.2], oro: [0xff6a1f, 0xff3000, 1.4], rune: [0xff6a2a, 0.9], pietra: [0x1a1312, 0x2a0400, 0.6], braci: 0.075 },
};
export function impostaTema(id) {
  temaScena = TEMI_3D[id] ? id : 'grimorio';
  if (!scena) return;
  const t = TEMI_3D[temaScena];
  scena.fog.color.setHex(t.nebbia);
  luceContorno.color.setHex(t.contorno[0]); luceContorno.intensity = t.contorno[1];
  luceRossa.color.setHex(t.rossa[0]); luceRossa.intensity = t.rossa[1];
  torcia.color.setHex(t.torcia[0]); torciaBase = t.torcia[1];
  matOro.color.setHex(t.oro[0]); matOro.emissive.setHex(t.oro[1]); matOro.emissiveIntensity = t.oro[2];
  matPietra.color.setHex(t.pietra[0]); matPietra.emissive.setHex(t.pietra[1]); matPietra.emissiveIntensity = t.pietra[2];
  runeAnello.material.color.setHex(t.rune[0]); runeAnello.material.opacity = t.rune[1];
  braci.material.size = t.braci;
}
let qualita = QUALITA.bilanciata;
let visibile = false, inPausa = false, animPausa = false;
let loader = null;
let mod = null; // { fileId, versioneId, pivot, gltf, ossa: Map, riposo: Map, mixer, azioni, clip }
const attaccati = new Map(); // idOggetto → { holder, inner, fileId, slot }
const cacheOggetti = new Map(); // fileId → Promise<Object3D>
let obiettivoCamera = null;
let caricamentoInCorso = null;
const ascoltatori = { stato: [] };

export const suStato = (fn) => ascoltatori.stato.push(fn);
const emetti = (s) => ascoltatori.stato.forEach((f) => f(s));

export function impostaQualita(nome) {
  qualita = QUALITA[nome] || QUALITA.bilanciata;
  if (renderer) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, qualita.pr));
    renderer.shadowMap.enabled = qualita.ombre;
    scena?.traverse((o) => { if (o.material) o.material.needsUpdate = true; });
    ridimensiona();
  }
}

function creaLoader() {
  if (loader) return loader;
  loader = new THREE.GLTFLoader();
  const draco = new THREE.DRACOLoader();
  draco.setDecoderPath('vendor/draco/');
  draco.setDecoderConfig({ type: 'wasm' });
  loader.setDRACOLoader(draco);
  loader.setMeshoptDecoder(THREE.MeshoptDecoder);
  return loader;
}

let osservaDim = null, osservaVis = null;
export function init(el) {
  if (!renderer) creaRenderer();
  contenitore = el;
  el.prepend(renderer.domElement);
  osservaDim?.disconnect(); osservaVis?.disconnect();
  osservaDim = new ResizeObserver(ridimensiona); osservaDim.observe(el);
  osservaVis = new IntersectionObserver((v) => { visibile = v[0].isIntersecting; if (visibile) avviaCiclo(); }, { threshold: 0.05 });
  osservaVis.observe(el);
  ridimensiona();
  avviaCiclo();
}

function creaRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, qualita.pr));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = qualita.ombre;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.classList.add('tela3d');

  scena = new THREE.Scene();
  scena.fog = new THREE.Fog(0x120709, 6, 14);
  camera = new THREE.PerspectiveCamera(35, 1, 0.05, 50);
  camera.position.set(0, 1.3, 4.2);
  orologio = new THREE.Clock();

  creaAmbiente();
  creaLuci();
  creaPiedistallo();
  impostaTema(temaScena);
  gruppoPersonaggio = new THREE.Group();
  scena.add(gruppoPersonaggio);

  controlli = new THREE.OrbitControls(camera, renderer.domElement);
  controlli.enablePan = false;
  controlli.enableDamping = true;
  controlli.dampingFactor = 0.08;
  controlli.rotateSpeed = 0.7;
  controlli.minDistance = 0.4;
  controlli.maxDistance = 9;
  controlli.maxPolarAngle = Math.PI * 0.56;
  controlli.target.set(0, 0.95, 0);
  controlli.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
  controlli.addEventListener('start', () => (obiettivoCamera = null));

  // Doppio tap per ricentrare
  let ultimoTap = 0, x0 = 0, y0 = 0;
  renderer.domElement.addEventListener('pointerdown', (e) => { x0 = e.clientX; y0 = e.clientY; });
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (Math.hypot(e.clientX - x0, e.clientY - y0) > 12) return;
    const ora = performance.now();
    if (ora - ultimoTap < 320) { ricentra(); ultimoTap = 0; } else ultimoTap = ora;
  });
  renderer.domElement.addEventListener('dblclick', ricentra);

  document.addEventListener('visibilitychange', () => { inPausa = document.hidden; if (!inPausa) { orologio.getDelta(); avviaCiclo(); } });
  renderer.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); emetti({ errore: 'Il telefono ha liberato la memoria grafica: riapri la scheda.' }); });
}

function creaAmbiente() {
  // Riflessi calde da "sala di pietra illuminata dalle torce" per i materiali metallici
  const pm = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene();
  const geo = new THREE.SphereGeometry(10, 32, 16);
  const col = [];
  const pos = geo.getAttribute('position');
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 10;
    if (y > 0.5) c.setRGB(0.25, 0.2, 0.22);
    else if (y > 0) c.setRGB(0.9 - y, 0.55 - y * 0.6, 0.3 - y * 0.3);
    else c.setRGB(0.25 + y * 0.2, 0.06, 0.05);
    col.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  env.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  const pannello = (x, y, z, colore, s) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshBasicMaterial({ color: colore, side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m); };
  pannello(4, 4, 5, 0xffe2b0, 5);
  pannello(-6, 2, -3, 0x6a7cff, 3);
  pannello(-3, 5, 4, 0xffffff, 2.5);
  scena.environment = pm.fromScene(env, 0.04).texture;
  scena.environmentIntensity = 0.8;
  pm.dispose();
}

function creaLuci() {
  scena.add(new THREE.HemisphereLight(0xffe2c0, 0x2a0c0c, 0.7));
  const chiave = new THREE.DirectionalLight(0xffd6a0, 2.4);
  chiave.position.set(2.2, 4.2, 3);
  chiave.castShadow = true;
  chiave.shadow.mapSize.set(1024, 1024);
  Object.assign(chiave.shadow.camera, { left: -1.5, right: 1.5, top: 2.5, bottom: -0.5, near: 0.5, far: 12 });
  chiave.shadow.bias = -0.0005;
  chiave.shadow.normalBias = 0.02;
  scena.add(chiave);
  const contorno = luceContorno = new THREE.DirectionalLight(0x7090ff, 1.6);
  contorno.position.set(-3, 2.5, -3.5);
  scena.add(contorno);
  const rosso = luceRossa = new THREE.DirectionalLight(0xff3030, 0.8);
  rosso.position.set(3, 1, -3);
  scena.add(rosso);
  torcia = new THREE.PointLight(0xff8a2a, 3.5, 6, 1.6);
  torcia.position.set(-1.1, 0.6, 1.2);
  scena.add(torcia);
}

function texturaRune() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 512;
  const g = cv.getContext('2d');
  g.translate(256, 256);
  g.strokeStyle = '#ffcf70'; g.fillStyle = '#ffcf70'; g.lineWidth = 5;
  g.beginPath(); g.arc(0, 0, 246, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 200, 0, Math.PI * 2); g.stroke();
  const rune = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
  g.font = 'bold 34px serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let i = 0; i < rune.length; i++) {
    g.save(); g.rotate((i / rune.length) * Math.PI * 2); g.fillText(rune[i], 0, -223); g.restore();
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function creaPiedistallo() {
  const pietra = matPietra = new THREE.MeshStandardMaterial({ color: 0x3a302c, roughness: 0.92, metalness: 0.05 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.9, 0.16, 64), pietra);
  base.position.y = -0.08; base.receiveShadow = true; base.castShadow = true;
  scena.add(base);
  const gradino = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.02, 0.08, 64), pietra);
  gradino.position.y = -0.2; gradino.receiveShadow = true;
  scena.add(gradino);
  const oro = matOro = new THREE.MeshStandardMaterial({ color: 0xd9a94e, metalness: 1, roughness: 0.3 });
  const bordo = new THREE.Mesh(new THREE.TorusGeometry(0.79, 0.018, 12, 96), oro);
  bordo.rotation.x = Math.PI / 2; bordo.position.y = 0.0;
  scena.add(bordo);
  runeAnello = new THREE.Mesh(new THREE.CircleGeometry(0.74, 64), new THREE.MeshBasicMaterial({ map: texturaRune(), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
  runeAnello.rotation.x = -Math.PI / 2; runeAnello.position.y = 0.002;
  scena.add(runeAnello);
  const pavimento = new THREE.Mesh(new THREE.CircleGeometry(6, 48), new THREE.ShadowMaterial({ opacity: 0.45 }));
  pavimento.rotation.x = -Math.PI / 2; pavimento.position.y = -0.24; pavimento.receiveShadow = true;
  scena.add(pavimento);
  // Braci che salgono
  const N = 70; const p = new Float32Array(N * 3); const v = new Float32Array(N);
  for (let i = 0; i < N; i++) { const a = Math.random() * Math.PI * 2, r = 0.4 + Math.random() * 1.2; p[i * 3] = Math.cos(a) * r; p[i * 3 + 1] = Math.random() * 2.5; p[i * 3 + 2] = Math.sin(a) * r; v[i] = 0.1 + Math.random() * 0.25; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.userData.vel = v;
  const cv = document.createElement('canvas'); cv.width = cv.height = 32; const cx = cv.getContext('2d');
  const gr = cx.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,220,150,1)'); gr.addColorStop(0.4, 'rgba(255,120,40,0.6)'); gr.addColorStop(1, 'rgba(255,60,0,0)');
  cx.fillStyle = gr; cx.fillRect(0, 0, 32, 32);
  braci = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.05, map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  scena.add(braci);
  // Marcatore per mostrare l'osso selezionato
  marcatore = new THREE.Group();
  marcatore.add(new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), new THREE.MeshBasicMaterial({ color: 0x40ff90, depthTest: false, transparent: true, opacity: 0.9 })));
  marcatore.add(new THREE.AxesHelper(0.15));
  marcatore.traverse((o) => { o.renderOrder = 999; if (o.material) o.material.depthTest = false; });
  marcatore.visible = false;
}

function ridimensiona() {
  if (!contenitore) return;
  const w = contenitore.clientWidth, hh = contenitore.clientHeight;
  if (!w || !hh) return;
  renderer.setSize(w, hh, false);
  camera.aspect = w / hh;
  camera.updateProjectionMatrix();
}

let cicloAttivo = false;
function avviaCiclo() {
  if (cicloAttivo) return;
  cicloAttivo = true;
  renderer.setAnimationLoop(fotogramma);
}
function fotogramma() {
  if (!visibile || inPausa) { renderer.setAnimationLoop(null); cicloAttivo = false; return; }
  const dt = Math.min(orologio.getDelta(), 0.1);
  const t = orologio.elapsedTime;
  if (mod?.mixer && !animPausa) mod.mixer.update(dt);
  if (runeAnello) runeAnello.rotation.z += dt * 0.08;
  if (torcia) torcia.intensity = torciaBase + Math.sin(t * 9) * 0.35 + Math.sin(t * 23.7) * 0.25;
  if (braci) {
    const p = braci.geometry.getAttribute('position'); const v = braci.geometry.userData.vel;
    for (let i = 0; i < v.length; i++) {
      let y = p.getY(i) + v[i] * dt; if (y > 2.6) y = 0;
      p.setY(i, y); p.setX(i, p.getX(i) + Math.sin(t * 2 + i) * 0.0008);
    }
    p.needsUpdate = true;
  }
  if (obiettivoCamera) {
    controlli.target.lerp(obiettivoCamera.target, 0.12);
    camera.position.lerp(obiettivoCamera.pos, 0.12);
    if (camera.position.distanceTo(obiettivoCamera.pos) < 0.005) obiettivoCamera = null;
  }
  controlli.update();
  renderer.render(scena, camera);
}

export function ricentra() {
  const fovV = THREE.MathUtils.degToRad(camera.fov);
  const fovH = 2 * Math.atan(Math.tan(fovV / 2) * camera.aspect);
  const altezza = ALTEZZA + 0.75, larghezza = 2.2;
  const d = Math.max((altezza / 2) / Math.tan(fovV / 2), (larghezza / 2) / Math.tan(fovH / 2)) * 1.08;
  obiettivoCamera = { target: new THREE.Vector3(0, 0.8, 0), pos: new THREE.Vector3(0, 1.15, d) };
}

export function focalizza(oggetto3d, distanza = 0.9) {
  const p = new THREE.Vector3(); oggetto3d.getWorldPosition(p);
  const dir = camera.position.clone().sub(controlli.target).normalize();
  obiettivoCamera = { target: p, pos: p.clone().add(dir.multiplyScalar(distanza)) };
}

// ───────────── Caricamento dei file ─────────────

async function leggiBuffer(fileId) {
  const f = await db.leggi('file', fileId);
  if (!f) throw new Error('File 3D non trovato nell\'archivio del telefono');
  return f.dati;
}

export async function analizzaBuffer(buffer) {
  const gltf = await creaLoader().parseAsync(buffer.slice(0), '');
  return { gltf, ...statistiche(gltf.scene), ossa: elencoOssa(gltf.scene), animazioni: gltf.animations.map((a) => a.name) };
}

function statistiche(root) {
  let triangoli = 0, texMax = 0, nTex = 0; const viste = new Set();
  root.traverse((o) => {
    if (o.isMesh && o.geometry) {
      const g = o.geometry; triangoli += (g.index ? g.index.count : g.getAttribute('position').count) / 3;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => Object.values(m || {}).forEach((t) => {
        if (t?.isTexture && t.image && !viste.has(t)) { viste.add(t); nTex++; texMax = Math.max(texMax, t.image.width || 0, t.image.height || 0); }
      }));
    }
  });
  return { triangoli: Math.round(triangoli), texMax, nTex };
}

export function elencoOssa(root) {
  const ossa = []; const viste = new Set();
  root.traverse((o) => {
    if (o.isBone && !viste.has(o)) {
      viste.add(o);
      let prof = 0, p = o.parent; while (p && p.isBone) { prof++; p = p.parent; }
      ossa.push({ nome: o.name, prof });
    }
  });
  return ossa;
}

// Riduce le texture troppo grandi per non saturare la memoria dell'iPhone
function limitaTexture(root) {
  const max = qualita.tex; const fatte = new Set(); let ridotte = 0;
  root.traverse((o) => {
    if (!o.isMesh) return;
    (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
      if (!m) return;
      for (const k of Object.keys(m)) {
        const t = m[k];
        if (!t?.isTexture || fatte.has(t) || !t.image) continue;
        fatte.add(t);
        const { width: w, height: hh } = t.image;
        if (w > max || hh > max) {
          const s = max / Math.max(w, hh);
          const cv = document.createElement('canvas'); cv.width = Math.round(w * s); cv.height = Math.round(hh * s);
          cv.getContext('2d').drawImage(t.image, 0, 0, cv.width, cv.height);
          t.image.close?.();
          t.image = cv; t.needsUpdate = true; ridotte++;
        }
        t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      }
    });
  });
  return ridotte;
}

function prepara(root) {
  root.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true; o.receiveShadow = true;
      if (o.isSkinnedMesh) o.frustumCulled = false;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => { if (m && 'envMapIntensity' in m) m.envMapIntensity = 1; });
    }
  });
}

function libera(root) {
  root.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    mats.forEach((m) => { Object.values(m).forEach((t) => t?.isTexture && t.dispose()); m.dispose(); });
  });
}

// Mostra una versione del personaggio. versione = { id, fileId, ossa:{slot:nomeOsso} }
export async function mostraPersonaggio(versione, { animazione } = {}) {
  if (!versione) { rimuoviPersonaggio(); emetti({ vuoto: true }); return null; }
  if (mod && mod.fileId === versione.fileId && mod.versioneId === versione.id) { mod.mappa = versione.ossa || {}; return mod; }
  const mio = Symbol();
  caricamentoInCorso = mio;
  emetti({ caricamento: true });
  try {
    const buffer = await leggiBuffer(versione.fileId);
    const gltf = await creaLoader().parseAsync(buffer, '');
    if (caricamentoInCorso !== mio) { libera(gltf.scene); return null; }
    const info = { ...statistiche(gltf.scene), dimensione: buffer.byteLength };
    info.ridotte = limitaTexture(gltf.scene);
    prepara(gltf.scene);
    rimuoviPersonaggio();

    const pivot = new THREE.Group();
    pivot.add(gltf.scene);
    // Misura e normalizza: altezza 1,8, piedi a terra, centrato
    gltf.scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(gltf.scene, true);
    const size = box.getSize(new THREE.Vector3());
    const s = size.y > 0 ? ALTEZZA / size.y : 1;
    pivot.scale.setScalar(s);
    const centro = box.getCenter(new THREE.Vector3());
    pivot.position.set(-centro.x * s, -box.min.y * s, -centro.z * s);
    gruppoPersonaggio.add(pivot);
    pivot.updateMatrixWorld(true);

    // Posa di riposo delle ossa (serve per orientare gli oggetti in modo coerente)
    const ossa = new Map(), riposo = new Map();
    gltf.scene.traverse((o) => {
      if (o.isBone) {
        ossa.set(o.name, o);
        riposo.set(o.name, { q: o.getWorldQuaternion(new THREE.Quaternion()), s: o.getWorldScale(new THREE.Vector3()).x || 1, y: o.getWorldPosition(new THREE.Vector3()).y });
      }
    });
    const mixer = gltf.animations.length ? new THREE.AnimationMixer(gltf.scene) : null;
    mod = { fileId: versione.fileId, versioneId: versione.id, pivot, gltf, ossa, riposo, mixer, azione: null, mappa: versione.ossa || {}, info };
    avviaAnimazione(animazione);
    attaccati.clear();
    ricentra();
    emetti({ pronto: true, info, animazioni: gltf.animations.map((a) => a.name) });
    return mod;
  } catch (e) {
    console.error(e);
    emetti({ errore: 'Impossibile caricare il modello: ' + (e.message || e) });
    return null;
  } finally {
    if (caricamentoInCorso === mio) caricamentoInCorso = null;
  }
}

export function rimuoviPersonaggio() {
  if (!mod) return;
  mod.mixer?.stopAllAction();
  gruppoPersonaggio.remove(mod.pivot);
  libera(mod.pivot);
  mod = null;
  attaccati.clear();
  marcatore.removeFromParent();
}

export const animazioni = () => mod?.gltf.animations.map((a) => a.name) || [];
export const animazioneCorrente = () => mod?.azione?.getClip().name || '';

export function avviaAnimazione(nome) {
  if (!mod?.mixer) return;
  const clips = mod.gltf.animations;
  const clip = clips.find((c) => c.name === nome) || clips.find((c) => /idle|riposo|stand|breath/i.test(c.name)) || clips[0];
  if (!clip) return;
  const nuova = mod.mixer.clipAction(clip);
  nuova.reset().setLoop(THREE.LoopRepeat, Infinity).play();
  if (mod.azione && mod.azione !== nuova) mod.azione.crossFadeTo(nuova, 0.35, false);
  mod.azione = nuova;
}
export function pausaAnimazione(v) {
  animPausa = v;
  if (v && mod?.mixer) { /* resta nella posa corrente */ }
}
export const animazioneInPausa = () => animPausa;

// Mostra un marcatore sull'osso (schermata di associazione)
export function evidenziaOsso(nome) {
  marcatore.removeFromParent();
  const osso = mod?.ossa.get(nome);
  if (!osso) { marcatore.visible = false; return; }
  const r = mod.riposo.get(nome);
  marcatore.scale.setScalar(1 / r.s);
  osso.add(marcatore);
  marcatore.visible = true;
}

// ───────────── Oggetti agganciati ─────────────

async function caricaOggetto(fileId) {
  if (!cacheOggetti.has(fileId)) {
    cacheOggetti.set(fileId, (async () => {
      const buf = await leggiBuffer(fileId);
      const gltf = await creaLoader().parseAsync(buf, '');
      limitaTexture(gltf.scene); prepara(gltf.scene);
      return gltf.scene;
    })().catch((e) => { cacheOggetti.delete(fileId); throw e; }));
  }
  return (await cacheOggetti.get(fileId)).clone(true);
}

export function dimenticaOggetto(fileId) { cacheOggetti.delete(fileId); }

// oggetti: [{ id, slot, modello, regolazione:{p,r,s} }]
export async function sincronizzaOggetti(oggetti) {
  if (!mod) return;
  const corrente = mod;
  const voluti = new Map(oggetti.filter((o) => o.modello && mod.mappa[o.slot] && mod.ossa.has(mod.mappa[o.slot])).map((o) => [o.id, o]));
  // Rimuovi ciò che non serve più
  for (const [id, a] of attaccati) {
    const o = voluti.get(id);
    if (!o || o.modello !== a.fileId || o.slot !== a.slot || mod.mappa[o.slot] !== a.osso) { a.holder.removeFromParent(); attaccati.delete(id); }
  }
  for (const o of voluti.values()) {
    if (attaccati.has(o.id)) { applicaRegolazione(o.id, o.regolazione); continue; }
    let obj;
    try { obj = await caricaOggetto(o.modello); } catch (e) { emetti({ errore: `Oggetto 3D non caricato: ${e.message}` }); continue; }
    if (mod !== corrente || attaccati.has(o.id)) continue;
    const nomeOsso = mod.mappa[o.slot];
    const osso = mod.ossa.get(nomeOsso); const r = mod.riposo.get(nomeOsso);
    const holder = new THREE.Group();
    holder.quaternion.copy(r.q).invert();
    holder.scale.setScalar(1 / r.s);
    const inner = new THREE.Group();
    // Normalizza la dimensione dell'oggetto
    const box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(new THREE.Vector3());
    const dimMax = Math.max(size.x, size.y, size.z) || 1;
    const norm = new THREE.Group();
    norm.scale.setScalar((PREDEFINITI_SLOT[o.slot]?.dim || 0.4) / dimMax);
    if (!box.containsPoint(new THREE.Vector3())) obj.position.sub(box.getCenter(new THREE.Vector3()));
    norm.add(obj); inner.add(norm); holder.add(inner);
    osso.add(holder);
    attaccati.set(o.id, { holder, inner, fileId: o.modello, slot: o.slot, osso: nomeOsso });
    applicaRegolazione(o.id, o.regolazione);
  }
}

export function regolazionePredefinita(slot) {
  const d = PREDEFINITI_SLOT[slot] || { p: [0, 0, 0], r: [0, 0, 0] };
  const reg = { p: [...d.p], r: [...d.r], s: 1 };
  // L'elmo va in cima alla testa: uso l'altezza del modello rispetto all'osso della testa
  const osso = mod?.mappa?.[slot];
  if (slot === 'testa' && osso && mod.riposo.get(osso)) {
    const y = mod.riposo.get(osso).y;
    reg.p[1] = Math.round(Math.max(0.05, ALTEZZA - y - d.dim * 0.35) * 1000) / 1000;
  }
  return reg;
}

export function applicaRegolazione(id, reg) {
  const a = attaccati.get(id); if (!a) return;
  const g = reg || regolazionePredefinita(a.slot);
  a.inner.position.set(...g.p);
  a.inner.rotation.set(...g.r.map(THREE.MathUtils.degToRad));
  a.inner.scale.setScalar(g.s || 1);
}
export const oggettoAgganciato = (id) => attaccati.get(id)?.inner || null;
export const modelloCorrente = () => mod;
export const pronto = () => !!renderer;
