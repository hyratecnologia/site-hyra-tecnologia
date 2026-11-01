/* ==========================================================================
   Vibex AudioCar · carro 3D realista (Three.js + GLB) do topo e do "Por dentro do som"
   Um palco só, preso na tela: no início o carro gira; conforme a página rola,
   main.js manda a etapa (evento "step") e o carro abre a porta, a tampa ou
   entra no painel para mostrar cada parte do som. Sem WebGL, com economia de
   dados ou se o arquivo falhar, main.js desenha o carro em traço no lugar.
   O som instalado (meio forro nas portas, caixa com 2 subs, painel de módulos,
   tampão, tweeters, bateria e cabo de força) é montado aqui. "Ligar o som"
   toca uma batida gerada no navegador (Web Audio, sem arquivo de música);
   desligado, tudo pulsa no mesmo ritmo, em silêncio.
   Modelo: "Volkswagen Golf GTI (2025)" por geyges no Sketchfab (licença Standard).
   ========================================================================== */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const DEG = Math.PI / 180;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
const saveData = navigator.connection && navigator.connection.saveData;

/* dobradiças medidas no modelo (metros; frente do carro em -Z, motorista em -X) */
const HINGES = {
  fl: { nodes: ['EXT_DOOR_FL', 'INT_DOOR_FL'], at: [-0.93, 0.8, -0.84], axis: 'y', max: -68 },
  fr: { nodes: ['EXT_DOOR_FR', 'INT_DOOR_FR'], at: [0.93, 0.8, -0.84], axis: 'y', max: 68 },
  rl: { nodes: ['EXT_DOOR_RL', 'INT_DOOR_RL'], at: [-0.84, 0.8, 0.24], axis: 'y', max: -64 },
  rr: { nodes: ['EXT_DOOR_RR', 'INT_DOOR_RR'], at: [0.84, 0.8, 0.24], axis: 'y', max: 64 },
  tail: { nodes: ['EXT_TRUNK_LID', 'INT_TRUNK'], at: [0, 1.39, 1.46], axis: 'x', max: -82 }
};
const KEYS = Object.keys(HINGES);

/* cada etapa: o que abre, para onde a câmera vai e qual peça ganha a etiqueta.
   Câmera em graus (yaw 0 = lateral com a frente à esquerda, 90 = frente, 270 = traseira);
   zoom < 1 aproxima; tx/ty/tz movem o ponto que a câmera olha */
const STEPS = {
  inicio: { yaw: 322, pit: 17, zoom: 1.15, tz: .1, open: ['tail', 'fl', 'fr'] }, // depois da abertura: tampa e portas da frente abertas, tocando
  completo: { yaw: 318, pit: 20, zoom: .98, tz: .15, open: KEYS },
  portas: { yaw: 289, pit: 8, zoom: .19, tz: -0.4, tx: -1.24, ty: .55, open: ['fl', 'fr'], label: 'Meio forro · kit 2 vias e tweeter', anchor: 'door' },
  grave: { yaw: 302, pit: 30, zoom: .6, tz: 1.05, open: ['tail'], label: 'Caixa selada com 2 subs', anchor: 'sub' },
  modulos: { yaw: 298, pit: 36, zoom: .56, tz: 1.2, open: ['tail'], label: '2 módulos e processador', anchor: 'amp' },
  midia: { yaw: 270, pit: 8, zoom: .16, tz: -0.35, ty: .98, open: ['fl'], label: 'Central multimídia', anchor: 'screen' },
  bateria: { yaw: 42, pit: 26, zoom: .96, tz: -0.25, open: [], xray: true, label: 'Bateria, fusível e cabo', anchor: 'battery' }
};

function webgl() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (_) { return false; }
}

/* o mesmo ritmo da batida (96 bpm, bumbo nos tempos 0, 6 e 10 de 16), para pulsar em silêncio */
function pulse(t) {
  const step = 60000 / 96 / 4, pos = (t / step) % 16;
  let since = 99;
  for (const k of [0, 6, 10]) { const d = (pos - k + 16) % 16; if (d < since) since = d; }
  return Math.exp(-since * step / 110);
}

/* ---------------- arquivo do carro: baixa uma vez, cada palco usa uma cópia ---------------- */
let basePromise = null;
const progressFns = [];
function loadBase(onProgress) {
  if (onProgress) progressFns.push(onProgress);
  if (!basePromise) {
    basePromise = new Promise((ok, fail) => {
      new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load('modelo/carro.glb', (g) => ok(g.scene),
        (e) => { if (e.total) progressFns.forEach((f) => f(e.loaded / e.total)); }, fail);
    }).then((s) => (document.fonts ? document.fonts.ready.then(() => s) : s)); // o tampão escreve com a fonte do site
  }
  return basePromise;
}

/* ---------------- peças do som ---------------- */
const at = (m, x, y, z) => { m.position.set(x, y, z); return m; };
function makeMats() {
  const glow = () => new THREE.MeshStandardMaterial({ color: 0xff5a0a, emissive: 0xff5a0a, emissiveIntensity: .6, roughness: .4 });
  return {
    carpet: new THREE.MeshStandardMaterial({ color: 0x17171a, roughness: 1 }),
    mdf: new THREE.MeshStandardMaterial({ color: 0x2a2622, roughness: .9 }),
    cone: new THREE.MeshStandardMaterial({ color: 0x1c1c20, roughness: .55, metalness: .2, side: THREE.DoubleSide }),
    surround: new THREE.MeshStandardMaterial({ color: 0x0c0c0e, roughness: .9 }),
    steel: new THREE.MeshStandardMaterial({ color: 0x8d939b, roughness: .3, metalness: 1 }),
    amp: new THREE.MeshStandardMaterial({ color: 0x232327, roughness: .35, metalness: .85 }),
    dsp: new THREE.MeshStandardMaterial({ color: 0x101012, roughness: .5, metalness: .4 }),
    batt: new THREE.MeshStandardMaterial({ color: 0x3a3b40, roughness: .45, metalness: .2 }),
    plus: new THREE.MeshStandardMaterial({ color: 0xe5260e, roughness: .4 }),
    board: new THREE.MeshStandardMaterial({ color: 0xe9eaec, roughness: .35 }),
    alu: new THREE.MeshStandardMaterial({ color: 0xb4b9c0, roughness: .32, metalness: .9 }),
    gloss: new THREE.MeshPhysicalMaterial({ color: 0x0e0e11, roughness: .3, clearcoat: 1, clearcoatRoughness: .06 }),
    glowDoor: glow(), glowSub: glow(), glowMod: glow(), glowPow: glow(),
    led: new THREE.MeshStandardMaterial({ color: 0xff5a0a, emissive: 0xff5a0a, emissiveIntensity: .4 })
  };
}

function speaker(r, M, glowMat) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, r * .07, 10, 48), M.steel);
  const glow = new THREE.Mesh(new THREE.TorusGeometry(r * 1.06, r * .025, 8, 48), glowMat);
  glow.position.z = .004;
  const surround = new THREE.Mesh(new THREE.TorusGeometry(r * .86, r * .1, 10, 48), M.surround);
  const move = new THREE.Group();
  const cone = new THREE.Mesh(new THREE.ConeGeometry(r * .8, r * .38, 48, 1, true), M.cone);
  cone.rotation.x = Math.PI / 2; cone.position.z = -r * .15;
  const cap = new THREE.Mesh(new THREE.SphereGeometry(r * .24, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.surround);
  cap.rotation.x = Math.PI / 2; cap.position.z = -r * .3;
  move.add(cone, cap, surround);
  g.add(ring, glow, move);
  g.userData.move = move;
  return g;
}

function textPlate(txt, w, h, bg, bar) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64;
  const x = c.getContext('2d');
  x.fillStyle = bg || '#0d0d10'; x.fillRect(0, 0, 256, 64);
  x.fillStyle = bar || '#ff5a0a'; x.fillRect(0, 58, 256, 6);
  x.font = 'italic 900 40px Saira, Impact, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillStyle = '#f4f5f7'; x.fillText(txt, 128, 30);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: .6 }));
}

/* caixa selada com 2 subs de 10" virados para a tampa; na frente dela, placa com 2 módulos e o DSP */
function trunkRig(M) {
  const g = new THREE.Group();
  const W = .9, H = .36, D = .3;
  g.add(new THREE.Mesh(new THREE.BoxGeometry(W, H, D), M.carpet));
  const subs = [-.215, .215].map((x) => {
    const s = speaker(.118, M, M.glowSub); s.position.set(x, 0, D / 2 + .002); g.add(s); return s;
  });
  const tag = textPlate('VIBEX', .16, .04); tag.position.set(0, -H / 2 + .045, D / 2 + .003); g.add(tag);

  /* painel de módulos: placa clara com um módulo grande, um pequeno e o processador, ligados por cabo */
  const board = new THREE.Group(); board.position.set(0, -H / 2, D / 2 + .125); g.add(board);
  board.add(at(new THREE.Mesh(new THREE.BoxGeometry(.86, .014, .21), M.board), 0, .007, 0));
  const amp = (x, z, w, h, d, txt) => {
    const a = new THREE.Group(); a.position.set(x, .014, z); board.add(a);
    a.add(at(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M.alu), 0, h / 2, 0));
    const fins = Math.round(w / .022);
    for (let i = 0; i < fins; i++) a.add(at(new THREE.Mesh(new THREE.BoxGeometry(.004, .008, d * .55), M.alu), -w / 2 + .014 + i * (w - .028) / (fins - 1), h + .004, -d * .2));
    const p = textPlate(txt, w * .78, w * .78 / 4, '#2a2a30', '#e5260e'); p.rotation.x = -Math.PI / 2; p.position.set(0, h + .001, d * .3); a.add(p);
    a.add(at(new THREE.Mesh(new THREE.BoxGeometry(w + .004, .004, d + .004), M.glowMod), 0, .002, 0));
    a.add(at(new THREE.Mesh(new THREE.BoxGeometry(.03, .006, .004), M.led), w / 2 - .03, h * .6, d / 2 + .002));
    return a;
  };
  const amps = [amp(-.2, .005, .34, .055, .19, '3000W'), amp(.11, .03, .18, .045, .13, '400W')];
  const dsp = new THREE.Group(); dsp.position.set(.32, .014, -.04); board.add(dsp);
  dsp.add(at(new THREE.Mesh(new THREE.BoxGeometry(.16, .03, .1), M.dsp), 0, .015, 0));
  for (let i = 0; i < 6; i++) {
    const k = at(new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, .012, 12), M.steel), -.06 + i * .024, .036, .025);
    dsp.add(k);
  }
  dsp.add(at(new THREE.Mesh(new THREE.BoxGeometry(.03, .006, .004), M.led), .055, .02, .051));
  /* cabos RCA e de força deitados na placa */
  [[[.25, .02, -.03], [.2, .02, .06], [.2, .02, .09]], [[.27, .02, -.02], [.24, .02, .07], [.2, .02, .1]], [[.4, .02, -.08], [.38, .02, .07], [-.03, .02, .09]]].forEach((pts, i) => {
    const c = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
    board.add(new THREE.Mesh(new THREE.TubeGeometry(c, 24, i === 2 ? .006 : .003, 6), i === 2 ? M.plus : M.surround));
  });
  g.userData = { subs, amps, box: g.children[0], board };
  return g;
}

/* meio forro da porta: painel brilhante moldado com 3 woofers, 2 médios, tweeter, placa VIBEX e LED na borda.
   Desenhado na superfície interna da porta (u = comprimento do carro, v = altura); side -1 = motorista */
function doorPanel(M, side) {
  const g = new THREE.Group();
  g.position.x = side * .655;
  g.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
  const U = (z) => (side < 0 ? -z : z); // z do carro para o x local do painel
  const outline = [[-.69, .4], [-.42, .375], [-.12, .385], [-.06, .44], [-.055, .58], [-.1, .675], [-.3, .7], [-.52, .72], [-.66, .69], [-.705, .6]];
  const shape = new THREE.Shape();
  outline.forEach(([z, y], i) => (i ? shape.lineTo(U(z), y) : shape.moveTo(U(z), y)));
  shape.closePath();
  const T = .03;
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: T, bevelEnabled: true, bevelThickness: .008, bevelSize: .01, bevelSegments: 3 }), M.gloss);
  g.add(body);
  const led = new THREE.CatmullRomCurve3(outline.map(([z, y]) => new THREE.Vector3(U(z), y, T + .009)), true, 'catmullrom', .3);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(led, 140, .0045, 6, true), M.glowDoor));
  const spk = [];
  const put = (z, y, r) => { const s = speaker(r, M, M.glowDoor); s.position.set(U(z), y, T + .008); g.add(s); spk.push(s); return s; };
  const big = put(-.565, .5, .085);
  put(-.36, .475, .068); put(-.19, .47, .062);
  put(-.33, .625, .04); put(-.22, .625, .04); put(-.12, .6, .024);
  const tag = textPlate('VIBEX', .13, .0325); tag.position.set(U(-.565), .625, T + .01); g.add(tag);
  g.userData = { spk, big };
  return g;
}

/* tampão do porta-malas no lugar do original: arte da Vibex, logo no meio, telas de alumínio e LED na borda */
function shelfRig(M) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
  const x = c.getContext('2d');
  x.fillStyle = '#0b0b0d'; x.fillRect(0, 0, 1024, 512);
  // telas furadas nas pontas
  [[40, 120], [770, 120]].forEach(([px, py]) => {
    x.fillStyle = '#1b1b20'; x.fillRect(px, py, 214, 270);
    x.fillStyle = '#3a3c42';
    for (let i = 0; i < 20; i++) for (let j = 0; j < 26; j++) x.fillRect(px + 6 + i * 10.4 + (j % 2) * 5, py + 6 + j * 10.2, 4, 4);
  });
  // faixas de pintura (laranja, âmbar e vermelho) contornando o meio
  const band = (off, color, w) => {
    x.strokeStyle = color; x.lineWidth = w; x.lineJoin = 'round'; x.beginPath();
    x.moveTo(30, 60 + off); x.bezierCurveTo(300, 20 + off, 420, 110 + off, 512, 70 + off); x.bezierCurveTo(610, 30 + off, 760, 100 + off, 994, 60 + off);
    x.moveTo(30, 452 - off); x.bezierCurveTo(300, 492 - off, 420, 402 - off, 512, 442 - off); x.bezierCurveTo(610, 482 - off, 760, 412 - off, 994, 452 - off);
    x.stroke();
  };
  band(0, '#e5260e', 22); band(18, '#ff5a0a', 16); band(32, '#ffb21a', 9);
  // logo: o V com o raio e a marca
  x.save(); x.translate(300, 160); x.scale(1.55, 1.55);
  x.fillStyle = (() => { const gr = x.createLinearGradient(0, 0, 0, 100); gr.addColorStop(0, '#FFC21A'); gr.addColorStop(.55, '#FF7A00'); gr.addColorStop(1, '#E23A00'); return gr; })();
  x.strokeStyle = '#1a0f08'; x.lineWidth = 5; x.lineJoin = 'round';
  const v = new Path2D('M4 6 H40 L62 62 L84 6 H116 L74 92 H44 Z'); x.fill(v); x.stroke(v);
  const bolt = new Path2D('M40 6 L30 40 L52 34 L38 74 L70 28 L48 34 L58 6 Z'); x.fillStyle = '#FFD24A'; x.lineWidth = 4; x.fill(bolt); x.stroke(bolt);
  x.restore();
  x.font = 'italic 900 118px Saira, Impact, sans-serif'; x.textBaseline = 'alphabetic';
  x.fillStyle = '#f4f5f7'; x.fillText('VIBEX', 498, 278);
  x.fillStyle = '#ff5a0a'; x.beginPath(); x.moveTo(512, 296); x.lineTo(752, 296); x.lineTo(740, 338); x.lineTo(500, 338); x.closePath(); x.fill();
  x.font = '800 30px Manrope, sans-serif'; x.fillStyle = '#0b0b0d'; x.fillText('A U D I O C A R', 532, 328);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;

  const g = new THREE.Group();
  const top = new THREE.MeshPhysicalMaterial({ map: tex, roughness: .25, clearcoat: 1, clearcoatRoughness: .08 });
  const W = 1.04, D = .5, H = .022;
  g.add(new THREE.Mesh(new THREE.BoxGeometry(W, H, D), [M.gloss, M.gloss, top, M.gloss, M.gloss, M.gloss]));
  const r = .035, hw = W / 2 - .02, hd = D / 2 - .02, y = H / 2 + .005;
  const led = new THREE.CurvePath();
  const L = (a, b) => led.add(new THREE.LineCurve3(new THREE.Vector3(...a), new THREE.Vector3(...b)));
  const Q = (a, b, c2) => led.add(new THREE.QuadraticBezierCurve3(new THREE.Vector3(...a), new THREE.Vector3(...b), new THREE.Vector3(...c2)));
  L([-hw + r, y, -hd], [hw - r, y, -hd]); Q([hw - r, y, -hd], [hw, y, -hd], [hw, y, -hd + r]);
  L([hw, y, -hd + r], [hw, y, hd - r]); Q([hw, y, hd - r], [hw, y, hd], [hw - r, y, hd]);
  L([hw - r, y, hd], [-hw + r, y, hd]); Q([-hw + r, y, hd], [-hw, y, hd], [-hw, y, hd - r]);
  L([-hw, y, hd - r], [-hw, y, -hd + r]); Q([-hw, y, -hd + r], [-hw, y, -hd], [-hw + r, y, -hd]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(led, 200, .005, 6, true), M.glowSub));
  return g;
}

/* equalizador na tela da central (fica por cima da tela do modelo, inclinada como ela) */
function eqScreen() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const x = c.getContext('2d'), tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(.305, .158), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, toneMapped: false }));
  m.position.set(.008, .982, -.524); m.rotation.x = -.3; m.translateZ(.012);
  let lastT = -1;
  m.userData.draw = (t, on) => {
    m.material.opacity = on; m.visible = on > .01;
    if (!m.visible || t - lastT < 66) return; lastT = t;
    x.fillStyle = '#0b0b0e'; x.fillRect(0, 0, 256, 128);
    x.fillStyle = '#f4f5f7'; x.font = '700 14px Manrope, sans-serif'; x.fillText('VIBEX · AO VIVO', 14, 24);
    const lv = reduced ? .5 : pulse(t);
    for (let i = 0; i < 16; i++) {
      const hgt = 10 + (i < 5 ? lv * 70 : 0) + (Math.sin(t / 140 + i * 1.7) * .5 + .5) * (i < 5 ? 15 : 45) * (reduced ? .5 : 1);
      x.fillStyle = i < 5 ? '#ff5a0a' : '#ffb21a';
      x.fillRect(14 + i * 14.5, 114 - hgt, 10, hgt);
    }
    tex.needsUpdate = true;
  };
  return m;
}

/* bateria no cofre, fusível perto dela e o cabo de força correndo pelo assoalho até os módulos */
function powerRig(M) {
  const g = new THREE.Group();
  const batt = new THREE.Group(); batt.position.set(-.45, .72, -1.45); g.add(batt);
  batt.add(new THREE.Mesh(new THREE.BoxGeometry(.24, .18, .17), M.batt));
  batt.add(at(new THREE.Mesh(new THREE.BoxGeometry(.244, .012, .174), M.glowPow), 0, .07, 0));
  batt.add(at(new THREE.Mesh(new THREE.CylinderGeometry(.014, .014, .025, 16), M.plus), .07, .1, .04));
  batt.add(at(new THREE.Mesh(new THREE.CylinderGeometry(.014, .014, .025, 16), M.surround), -.07, .1, .04));
  const plate = textPlate('12V', .12, .03); plate.position.set(0, .02, .0855); batt.add(plate);
  const fuse = new THREE.Group(); fuse.position.set(-.27, .84, -1.42); g.add(fuse);
  fuse.add(new THREE.Mesh(new THREE.BoxGeometry(.05, .035, .1), M.dsp));
  fuse.add(at(new THREE.Mesh(new THREE.BoxGeometry(.03, .01, .06), M.glowPow), 0, .02, 0));

  /* textura listrada que corre pelo cabo: a energia andando */
  const c = document.createElement('canvas'); c.width = 64; c.height = 8;
  const x = c.getContext('2d'); x.fillStyle = '#7a0f05'; x.fillRect(0, 0, 64, 8); x.fillStyle = '#ffb21a'; x.fillRect(0, 0, 18, 8);
  const tex = new THREE.CanvasTexture(c); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(26, 1); tex.colorSpace = THREE.SRGBColorSpace;
  const cableMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthTest: false });
  const path = new THREE.CatmullRomCurve3([
    [-.38, .83, -1.41], [-.27, .86, -1.42], [-.2, .8, -1.22], [-.55, .5, -1.0], [-.63, .25, -.7],
    [-.63, .25, .55], [-.55, .4, 1.25], [-.32, .6, 1.72]
  ].map((p) => new THREE.Vector3(...p)));
  const cable = new THREE.Mesh(new THREE.TubeGeometry(path, 120, .011, 8), cableMat);
  cable.renderOrder = 10; g.add(cable);
  g.userData = { batt, tex, cableMat };
  return g;
}

/* ---------------- batida (Web Audio) ---------------- */
function makeBeat() {
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
  const ctx = new AC();
  const master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
  // saturação para o grave aparecer até em alto-falante de celular
  const sat = ctx.createWaveShaper(), curve = new Float32Array(1024);
  for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; curve[i] = Math.tanh(x * 2.4); }
  sat.curve = curve; sat.connect(master);
  const noise = ctx.createBuffer(1, ctx.sampleRate * .2, ctx.sampleRate);
  const nd = noise.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

  const BPM = 96, STEP = 60 / BPM / 4;
  const KICK = [0, 6, 10], CLAP = [4, 12], BASS = [41.2, 41.2, 49, 36.7]; // mi, mi, sol, ré
  const hits = []; // [tempo, força] para a animação acompanhar o grave
  let step = 0, next = 0, timer = 0, bar = 0;

  function kick(t, f) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(f, t + .09);
    g.gain.setValueAtTime(1, t); g.gain.exponentialRampToValueAtTime(.001, t + .55);
    o.connect(g); g.connect(sat); o.start(t); o.stop(t + .6);
    hits.push([t, 1]);
  }
  function clap(t) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noise; f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = .8;
    g.gain.setValueAtTime(.32, t); g.gain.exponentialRampToValueAtTime(.001, t + .16);
    s.connect(f); f.connect(g); g.connect(master); s.start(t);
  }
  function hat(t, v) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noise; f.type = 'highpass'; f.frequency.value = 7000;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + .05);
    s.connect(f); f.connect(g); g.connect(master); s.start(t);
  }
  function schedule() {
    while (next < ctx.currentTime + .12) {
      const s = step % 16;
      if (KICK.includes(s)) kick(next, BASS[bar % 4]);
      if (CLAP.includes(s)) clap(next);
      if (s % 2 === 0) hat(next, s % 4 === 2 ? .09 : .05);
      next += STEP; step++; if (step % 16 === 0) bar++;
    }
    while (hits.length && hits[0][0] < ctx.currentTime - 1) hits.shift();
  }
  return {
    on: false,
    start() {
      if (ctx.state === 'suspended') ctx.resume();
      step = 0; bar = 0; next = ctx.currentTime + .08;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(.55, ctx.currentTime, .05);
      schedule(); timer = setInterval(schedule, 25); this.on = true;
    },
    stop() {
      clearInterval(timer); this.on = false;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime, .06);
      hits.length = 0;
    },
    level() {
      const now = ctx.currentTime; let v = 0;
      for (const [t, a] of hits) if (t <= now) v += a * Math.exp(-(now - t) / .11);
      return Math.min(1, v);
    }
  };
}

/* ---------------- palco: carro, câmera, portas e arrastar ---------------- */
function viewer(stage, o) {
  const canvas = document.createElement('canvas');
  canvas.className = 'car-gl';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', o.aria);
  stage.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, coarse ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  /* luz quente de um lado, como a foto de oficina pede */
  const warm = new THREE.DirectionalLight(0xff7a1a, 2.2); warm.position.set(-4, 2.5, 3); scene.add(warm);
  const key = new THREE.DirectionalLight(0xffffff, 1.2); key.position.set(3, 5, -2); scene.add(key);
  /* luz do porta-malas: acende com a tampa e pulsa com o grave */
  const trunkLight = new THREE.PointLight(0xff6a1a, 0, 1.6, 1.5); trunkLight.position.set(0, 1.15, 1.7); scene.add(trunkLight);

  /* sombra de contato no chão */
  const sc = document.createElement('canvas'); sc.width = sc.height = 128;
  const g = sc.getContext('2d'), grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(0,0,0,.85)'); grd.addColorStop(.55, 'rgba(0,0,0,.45)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 5.2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.002; scene.add(shadow);

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  const target = new THREE.Vector3(0, 0.62, -0.05);
  const R = 1.95; // raio que cabe o carro em qualquer ângulo

  const v = {
    stage, canvas, scene, camera, renderer, trunkLight,
    s: { yaw: o.yaw * DEG, pit: o.pit * DEG, zoom: 1, tz: -0.05, ty: .62, tx: 0 },
    open: { fl: 0, fr: 0, rl: 0, rr: 0, tail: 0 }, want: { fl: 0, fr: 0, rl: 0, rr: 0, tail: 0 },
    pivots: {}, M: makeMats(), doorSpk: [], car: null, rig: null, tw: null,
    dirty: true, visible: true, dragging: false, lastTouch: 0
  };
  let last = 0, raf = 0;

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const vf = camera.fov * DEG / 2, hf = Math.atan(Math.tan(vf) * camera.aspect);
    camera.userData.dist = R / Math.sin(Math.min(vf, hf));
    camera.updateProjectionMatrix(); v.dirty = true;
  }

  /* yaw 0 = lateral com a frente à esquerda, 90 = frente, 270 = traseira (igual ao traço) */
  function place() {
    const s = v.s, d = (camera.userData.dist || 10) * s.zoom, cp = Math.cos(s.pit);
    target.z = s.tz; target.y = s.ty; target.x = s.tx;
    camera.position.set(target.x - d * cp * Math.cos(s.yaw), target.y + d * Math.sin(s.pit), target.z - d * cp * Math.sin(s.yaw));
    camera.lookAt(target);
  }

  /* gira a câmera até um ângulo pelo caminho mais curto */
  v.lookAt = function (to, dur) {
    if (v.dragging) return;
    const s = v.s, cur = s.yaw;
    let y = to.yaw === undefined ? cur : to.yaw * DEG;
    y = cur + ((((y - cur) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI);
    if (reduced) { s.yaw = y; s.pit = to.pit * DEG; s.zoom = to.zoom; s.tz = to.tz; s.ty = to.ty || .62; s.tx = to.tx || 0; v.dirty = true; v.kick(); return; }
    v.tw = { t0: performance.now(), dur: dur || 1100, y0: cur, y1: y, p0: s.pit, p1: to.pit * DEG, z0: s.zoom, z1: to.zoom, a0: s.tz, a1: to.tz, b0: s.ty, b1: to.ty || .62, c0: s.tx, c1: to.tx || 0 };
    v.kick();
  };
  v.anyOpen = () => KEYS.some((k) => v.want[k]);

  function tick(t) {
    raf = 0;
    const dt = last ? Math.min(t - last, 64) : 16; last = t;
    const s = v.s;
    let more = false;

    if (v.tw) {
      const tw = v.tw, k = Math.min(1, (t - tw.t0) / tw.dur), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      s.yaw = tw.y0 + (tw.y1 - tw.y0) * e; s.pit = tw.p0 + (tw.p1 - tw.p0) * e;
      s.zoom = tw.z0 + (tw.z1 - tw.z0) * e; s.tz = tw.a0 + (tw.a1 - tw.a0) * e; s.ty = tw.b0 + (tw.b1 - tw.b0) * e; s.tx = tw.c0 + (tw.c1 - tw.c0) * e;
      if (k >= 1) { v.tw = null; v.lastTouch = t; }
      v.dirty = true; more = true;
    } else if (o.spin && o.spin(t)) {
      s.yaw += 7 * DEG * dt / 1000; v.dirty = true; more = true;
    }

    /* portas e tampa: aproximação suave */
    const a = reduced ? 1 : 1 - Math.exp(-dt / 160);
    for (const k of KEYS) {
      const d = v.want[k] - v.open[k];
      if (Math.abs(d) > .001) { v.open[k] += d * a; more = true; v.dirty = true; } else if (v.open[k] !== v.want[k]) { v.open[k] = v.want[k]; v.dirty = true; }
      const p = v.pivots[k]; if (!p) continue;
      const x = v.open[k], ang = HINGES[k].max * DEG * x * x * (3 - 2 * x);
      if (HINGES[k].axis === 'y') p.rotation.y = ang; else p.rotation.x = ang;
    }

    if (v.car && o.onTick && o.onTick(t, dt)) { more = true; v.dirty = true; }

    if (v.dirty) { place(); renderer.render(scene, camera); v.dirty = false; if (o.onRender) o.onRender(); }
    if (more || v.dragging) v.kick(); else last = 0;
  }
  v.kick = function () { if (!raf) raf = requestAnimationFrame(tick); };

  /* retângulo em pixels que a peça ocupa na tela. A caixa é medida uma vez no espaço da própria peça,
     para acompanhar a porta girando sem inchar como uma caixa alinhada ao mundo */
  const tmp = new THREE.Vector3(), inv = new THREE.Matrix4(), rel = new THREE.Matrix4();
  v.toRect = function (obj) {
    let box = obj.userData.localBox;
    if (!box) {
      box = new THREE.Box3(); obj.updateMatrixWorld(true); inv.copy(obj.matrixWorld).invert();
      obj.traverse((m) => {
        if (!m.isMesh) return;
        if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
        box.union(m.geometry.boundingBox.clone().applyMatrix4(rel.multiplyMatrices(inv, m.matrixWorld)));
      });
      obj.userData.localBox = box;
    }
    const w = stage.clientWidth, h = stage.clientHeight, r = { x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9, front: true };
    for (let i = 0; i < 8; i++) {
      tmp.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).applyMatrix4(obj.matrixWorld).project(camera);
      if (tmp.z > 1) r.front = false;
      const x = (tmp.x + 1) / 2 * w, y = (1 - tmp.y) / 2 * h;
      r.x0 = Math.min(r.x0, x); r.x1 = Math.max(r.x1, x); r.y0 = Math.min(r.y0, y); r.y1 = Math.max(r.y1, y);
    }
    return r;
  };

  /* arrastar e teclado, com os mesmos limites do traço */
  let px = 0, py = 0;
  canvas.addEventListener('pointerdown', (e) => {
    v.dragging = true; v.tw = null; px = e.clientX; py = e.clientY; v.lastTouch = performance.now();
    canvas.setPointerCapture(e.pointerId); canvas.classList.add('is-grabbing');
    v.kick();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!v.dragging) return;
    v.s.yaw += (e.clientX - px) * 0.45 * DEG;
    v.s.pit = Math.min(42 * DEG, Math.max(-4 * DEG, v.s.pit + (e.clientY - py) * 0.3 * DEG));
    px = e.clientX; py = e.clientY; v.lastTouch = performance.now(); v.dirty = true; v.kick();
  });
  const up = () => { if (!v.dragging) return; v.dragging = false; v.lastTouch = performance.now(); canvas.classList.remove('is-grabbing'); v.kick(); };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  canvas.tabIndex = 0;
  canvas.addEventListener('keydown', (e) => {
    const s = v.s;
    if (e.key === 'ArrowLeft') s.yaw -= 10 * DEG;
    else if (e.key === 'ArrowRight') s.yaw += 10 * DEG;
    else if (e.key === 'ArrowUp') s.pit = Math.min(42 * DEG, s.pit + 5 * DEG);
    else if (e.key === 'ArrowDown') s.pit = Math.max(-4 * DEG, s.pit - 5 * DEG);
    else return;
    e.preventDefault(); v.tw = null; v.lastTouch = performance.now(); v.dirty = true; v.kick();
  });

  if ('IntersectionObserver' in window) new IntersectionObserver((es) => { v.visible = es[0].isIntersecting; if (v.visible) v.kick(); }).observe(stage);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) v.kick(); });
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { resize(); v.kick(); }, 120); });

  /* aviso de carregamento no lugar do carro */
  const load = document.createElement('div');
  load.className = 'car-load'; load.setAttribute('role', 'status');
  load.innerHTML = '<span>Carregando o carro 3D</span><i><b></b></i>';
  stage.appendChild(load);
  const prog = load.querySelector('b');

  loadBase((f) => { prog.style.width = Math.round(f * 100) + '%'; }).then((base) => {
    const car = base.clone(true), M = v.M;
    v.car = car;
    /* materiais que mudam por palco (cor, telas, transparência) ganham cópia própria */
    const own = new Map(), mine = (m) => { if (!own.has(m)) own.set(m, m.clone()); return own.get(m); };
    car.traverse((x) => {
      if (!x.isMesh || !x.material) return;
      const n = x.material.name;
      if (/^Rojo Kings/.test(n)) { x.material = mine(x.material); v.paint = x.material; }
      else if (/^Golf GTI MY25 Screen/.test(n)) { x.material = mine(x.material); (v.screens = v.screens || new Set()).add(x.material); }
      else if (o.xray && /^Ext_/.test(x.name)) x.material = mine(x.material);
      if (o.xray && /^Ext_/.test(x.name)) (v.shell = v.shell || new Set()).add(x.material);
    });
    scene.add(car);
    car.updateMatrixWorld(true);

    /* cada porta e a tampa ganham um eixo na dobradiça */
    for (const k of KEYS) {
      const h = HINGES[k], p = new THREE.Group();
      p.position.set(h.at[0], h.at[1], h.at[2]); car.add(p); p.updateMatrixWorld(true);
      h.nodes.forEach((n) => { const x = car.getObjectByName(n); if (x) p.attach(x); });
      v.pivots[k] = p;
    }

    /* som instalado: meio forro nas portas da frente, aro aceso nos falantes de trás, tweeters no painel,
       caixa e módulos no porta-malas e o tampão da Vibex no lugar do original */
    [['fl', -1], ['fr', 1]].forEach(([k, side]) => {
      const pn = doorPanel(M, side); car.add(pn); v.pivots[k].attach(pn);
      v.doorSpk.push(...pn.userData.spk);
      if (k === 'fl') v.panelFL = pn;
    });
    [['rl', -.66, .6, .52, .065], ['rr', .66, .6, .52, .065]].forEach(([k, x, y, z, r]) => {
      const sp = speaker(r, M, M.glowDoor); sp.position.set(x, y, z); sp.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
      car.add(sp); v.pivots[k].attach(sp); v.doorSpk.push(sp);
    });
    [-.6, .6].forEach((x) => {
      const t = speaker(.022, M, M.glowDoor); t.position.set(x, 1.085, -.7); t.rotation.x = -Math.PI / 2 + .35; car.add(t); v.doorSpk.push(t);
    });
    v.rig = trunkRig(M); v.rig.position.set(0, .76, 1.52); car.add(v.rig);
    car.traverse((x) => { if (/^Int_Back_Shelf/.test(x.name)) x.visible = false; });
    const shelf = shelfRig(M); shelf.position.set(0, 1.05, 1.57); car.add(shelf);

    if (o.ready) o.ready(v);
    resize(); place();
    renderer.compile(scene, camera);
    v.dirty = true; v.kick();
    requestAnimationFrame(() => {
      stage.classList.add('gl-on'); load.remove();
      if (o.fallbackSvg) { o.fallbackSvg.setAttribute('aria-hidden', 'true'); o.fallbackSvg.setAttribute('tabindex', '-1'); }
    });
  }, () => { canvas.remove(); load.remove(); renderer.dispose(); if (o.fail) o.fail(); });

  return v;
}

/* ==================== PALCO DO TOPO + POR DENTRO DO SOM ==================== */
function story() {
  const show = document.getElementById('show'), stage = document.getElementById('carStage'), svg = document.getElementById('carSvg');
  if (!show || !stage || !svg || !window.VibexStory) return;
  const btn = document.getElementById('soundBtn');
  let cur = window.VibexStory.step() || 'inicio', beat = null, glowL = 0, fade = 0, power = null, v = null;
  /* abertura: parado, depois gira, depois abre tampa e portas e começa a tocar (o som só sai pelo botão) */
  let intro = reduced ? 'done' : 'still', t0 = 0, playing = reduced;
  const focus = { portas: 0, grave: 0, modulos: 0, midia: 0, bateria: 0 };
  const anchors = {};

  function apply(k, animate) {
    cur = k;
    const L = STEPS[k];
    if (window.VibexCalloutText) window.VibexCalloutText(L.label || '');
    if (!v || !v.car) return;
    if (k === 'inicio' && intro !== 'done') return; // a abertura cuida do carro
    if (k !== 'inicio' && intro !== 'done') { intro = 'done'; playing = true; }
    KEYS.forEach((d) => { v.want[d] = L.open.includes(d) ? 1 : 0; });
    v.lookAt(L, animate ? 1300 : 1);
    v.kick();
  }
  stage.addEventListener('step', (e) => apply(e.detail.k, true));

  function setSound(on) {
    if (!beat) beat = makeBeat();
    if (!beat) return;
    if (on) beat.start(); else beat.stop();
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.querySelector('b').textContent = on ? 'Desligar o som' : 'Ligar o som';
    v.kick();
  }
  btn.addEventListener('click', () => setSound(!(beat && beat.on)));
  /* o som para quando a pessoa sai do topo ou troca de aba */
  document.addEventListener('visibilitychange', () => { if (document.hidden && beat && beat.on) setSound(false); });
  if ('IntersectionObserver' in window) new IntersectionObserver((es) => { if (!es[0].isIntersecting && beat && beat.on) setSound(false); }).observe(show);

  document.querySelectorAll('#paint .sw').forEach((b, i, all) => {
    b.addEventListener('click', () => {
      if (!v || !v.paint) return;
      v.paint.color.set(b.getAttribute('data-c')); v.dirty = true; v.kick();
      all.forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    });
  });

  v = viewer(stage, {
    aria: 'Carro hatch em 3D com o som instalado. Arraste para girar.',
    yaw: 35, pit: 14, xray: true, fallbackSvg: svg,
    fail: () => { if (window.VibexTraco) window.VibexTraco(); },
    spin: (t) => cur === 'inicio' && intro === 'done' && !reduced && !v.dragging && v.visible && !document.hidden && t - v.lastTouch > 1800,
    ready: (vv) => {
      power = powerRig(vv.M); power.visible = false; vv.car.add(power);
      anchors.door = vv.panelFL;
      anchors.sub = vv.rig.userData.box;
      anchors.amp = vv.rig.userData.board;
      anchors.battery = power.userData.batt;
      anchors.screen = eqScreen(); vv.car.add(anchors.screen);
      t0 = performance.now();
      apply(cur, false);
      show.classList.add('gl-on');
    },
    onTick: (t, dt) => {
      if (intro === 'still' && t - t0 > 1200) { intro = 'spin'; v.lookAt({ yaw: v.s.yaw / DEG + 175, pit: 16, zoom: 1, tz: -0.05 }, 2600); }
      else if (intro === 'spin' && !v.tw) { intro = 'done'; playing = true; if (cur === 'inicio') apply('inicio', true); }
      const M = v.M, L = STEPS[cur], on = !!(beat && beat.on), live = on || playing;
      /* com som: o grave de verdade; tocando sem som: o mesmo ritmo; antes da abertura: fraco */
      const lv = on ? beat.level() : (reduced ? .3 : pulse(t) * (playing ? 1 : .5));
      glowL += ((live && !reduced ? lv : 0) - glowL) * .5;
      for (const k in focus) {
        const want = cur === k || (cur === 'completo' && k !== 'bateria' && k !== 'midia') || (live && k !== 'bateria' && k !== 'midia') ? 1 : 0;
        focus[k] += (want - focus[k]) * Math.min(1, dt / 180);
      }
      M.glowDoor.emissiveIntensity = .15 + focus.portas * (.6 + lv * 3.5);
      v.doorSpk.forEach((sp) => { sp.userData.move.position.z = focus.portas * lv * .008; });
      M.glowSub.emissiveIntensity = .15 + focus.grave * (.6 + lv * 4);
      v.rig.userData.subs.forEach((sp) => { sp.userData.move.position.z = focus.grave * lv * .028; });
      M.glowMod.emissiveIntensity = .1 + focus.modulos * (.5 + lv * 2.5);
      M.led.emissiveIntensity = .3 + focus.modulos * (Math.floor(t / 260) % 2 ? 3.5 : .8);
      if (v.screens) v.screens.forEach((m) => { m.emissiveIntensity = 1 + focus.midia * lv * 2.2; });
      anchors.screen.userData.draw(t, focus.midia);
      v.trunkLight.intensity = v.open.tail * (1 + (focus.grave + focus.modulos) * lv * 3);
      /* com o som ligado o carro treme de leve e a luz do chão acompanha */
      v.car.position.y = reduced ? 0 : glowL * .006; v.car.rotation.z = reduced ? 0 : Math.sin(t / 37) * glowL * .0025;
      stage.style.setProperty('--pulse', glowL.toFixed(3));

      /* elétrica: lataria some como num raio-X e a energia corre pelo cabo */
      let busy = !reduced || on;
      const fw = L.xray ? 1 : 0;
      if (Math.abs(fw - fade) > .002) { fade += (fw - fade) * Math.min(1, dt / 220); busy = true; } else fade = fw;
      if (v.shell) v.shell.forEach((m) => {
        if (m.userData.op === undefined) m.userData.op = m.opacity;
        const vis = fade > .001;
        if (m.transparent !== (vis || m.userData.op < 1)) { m.transparent = vis || m.userData.op < 1; m.needsUpdate = true; }
        m.opacity = m.userData.op * (1 - fade * .86);
        m.depthWrite = fade < .5;
      });
      power.visible = fade > .01;
      power.userData.cableMat.opacity = fade;
      M.glowPow.emissiveIntensity = .5 + fade * lv * 3;
      power.userData.tex.offset.x -= dt * .0016 * (reduced ? 0 : 1);

      /* etiqueta: a bolinha fica na borda da peça, do lado da etiqueta (que vai para o lado oposto do quadro) */
      const a = anchors[L.anchor];
      if (a && !v.tw && window.VibexCallout) {
        const w = stage.clientWidth, h = stage.clientHeight, r = v.toRect(a);
        const left = (r.x0 + r.x1) / 2 > w / 2;
        const ins = (r.x1 - r.x0) * .14, x = Math.max(8, Math.min(w - 8, left ? r.x0 + ins : r.x1 - ins)), y = Math.max(8, Math.min(h - 8, r.y0 + (r.y1 - r.y0) * .7));
        if (r.front) window.VibexCallout(x, y, w, h, left); else window.VibexCalloutOff();
      } else if (window.VibexCalloutOff) window.VibexCalloutOff();
      return busy && v.visible && !document.hidden;
    }
  });
}

if (webgl() && !saveData) story();
else if (window.VibexTraco) window.VibexTraco();
