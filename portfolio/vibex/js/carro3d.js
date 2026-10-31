/* ==========================================================================
   Vibex AudioCar · carro 3D realista no hero (Three.js + GLB)
   Só o modelo aparece no topo. Sem WebGL, com economia de dados ou se o
   arquivo falhar, main.js desenha o carro em traço (engine.js) no lugar.
   Portas e tampa abrem por dobradiça; o som instalado (caixa com 2 subs,
   módulo, falantes das portas e tweeters) pulsa com uma batida gerada no
   próprio navegador (Web Audio, sem arquivo de música).
   Modelo: "Volkswagen Golf GTI (2025)" por geyges no Sketchfab (licença Standard).
   ========================================================================== */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const stage = document.getElementById('heroStage');
const svg = document.getElementById('heroCar');
const DEG = Math.PI / 180;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
const saveData = navigator.connection && navigator.connection.saveData;

/* cores da lataria: a primeira é a original do modelo */
const PAINTS = [
  { nome: 'Vermelho', hex: '#D01616' },
  { nome: 'Preto', hex: '#0B0B0D' },
  { nome: 'Grafite', hex: '#3A3D42' },
  { nome: 'Prata', hex: '#B9BEC4' },
  { nome: 'Branco', hex: '#E9EAEC' },
  { nome: 'Laranja', hex: '#FF5A0A' }
];

/* dobradiças medidas no modelo (metros; frente do carro em -Z, motorista em -X) */
const HINGES = {
  fl: { nodes: ['EXT_DOOR_FL', 'INT_DOOR_FL'], at: [-0.93, 0.8, -0.84], axis: 'y', max: -68 },
  fr: { nodes: ['EXT_DOOR_FR', 'INT_DOOR_FR'], at: [0.93, 0.8, -0.84], axis: 'y', max: 68 },
  rl: { nodes: ['EXT_DOOR_RL', 'INT_DOOR_RL'], at: [-0.84, 0.8, 0.24], axis: 'y', max: -64 },
  rr: { nodes: ['EXT_DOOR_RR', 'INT_DOOR_RR'], at: [0.84, 0.8, 0.24], axis: 'y', max: 64 },
  tail: { nodes: ['EXT_TRUNK_LID', 'INT_TRUNK'], at: [0, 1.39, 1.46], axis: 'x', max: -82 }
};

/* para onde a câmera vai quando algo abre (yaw/pit em graus, mesma convenção do traço) */
/* zoom < 1 aproxima; tz leva o centro da câmera para a frente (-) ou para trás (+) */
const VIEWS = {
  geral: { pit: 14, zoom: 1, tz: -0.05 },
  portas: { yaw: 28, pit: 16, zoom: .9, tz: -0.1 },
  tail: { yaw: 304, pit: 21, zoom: .7, tz: .9 }
};

function webgl() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (_) { return false; }
}

const traco = () => { if (window.VibexHeroTraco) window.VibexHeroTraco(); };
if (stage && svg && webgl() && !saveData) start(); else traco();

function viewName(deg) {
  if (deg < 22 || deg > 338 || (deg > 158 && deg < 202)) return 'Lateral';
  if (deg > 68 && deg < 112) return 'Frontal';
  if (deg > 248 && deg < 292) return 'Traseira';
  return '3/4';
}

/* ---------------- peças do som ---------------- */
const MAT = {
  carpet: new THREE.MeshStandardMaterial({ color: 0x17171a, roughness: 1 }),
  cone: new THREE.MeshStandardMaterial({ color: 0x1c1c20, roughness: .55, metalness: .2, side: THREE.DoubleSide }),
  surround: new THREE.MeshStandardMaterial({ color: 0x0c0c0e, roughness: .9 }),
  steel: new THREE.MeshStandardMaterial({ color: 0x8d939b, roughness: .3, metalness: 1 }),
  amp: new THREE.MeshStandardMaterial({ color: 0x232327, roughness: .35, metalness: .85 }),
  glow: new THREE.MeshStandardMaterial({ color: 0xff5a0a, emissive: 0xff5a0a, emissiveIntensity: .6, roughness: .4 })
};

function speaker(r) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(r, r * .07, 10, 48), MAT.steel);
  const glow = new THREE.Mesh(new THREE.TorusGeometry(r * 1.06, r * .025, 8, 48), MAT.glow);
  glow.position.z = .004;
  const surround = new THREE.Mesh(new THREE.TorusGeometry(r * .86, r * .1, 10, 48), MAT.surround);
  const move = new THREE.Group();
  const cone = new THREE.Mesh(new THREE.ConeGeometry(r * .8, r * .38, 48, 1, true), MAT.cone);
  cone.rotation.x = Math.PI / 2; cone.position.z = -r * .15;
  const cap = new THREE.Mesh(new THREE.SphereGeometry(r * .24, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), MAT.surround);
  cap.rotation.x = Math.PI / 2; cap.position.z = -r * .3;
  move.add(cone, cap, surround);
  g.add(ring, glow, move);
  g.userData.move = move; g.userData.r = r;
  return g;
}

function label() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64;
  const x = c.getContext('2d');
  x.fillStyle = '#0d0d10'; x.fillRect(0, 0, 256, 64);
  x.fillStyle = '#ff5a0a'; x.fillRect(0, 58, 256, 6);
  x.font = 'italic 900 40px Saira, Impact, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillStyle = '#f4f5f7'; x.fillText('VIBEX', 128, 30);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return new THREE.Mesh(new THREE.PlaneGeometry(.16, .04), new THREE.MeshStandardMaterial({ map: t, roughness: .6 }));
}

/* caixa selada com 2 subs de 10" virados para a tampa, módulo em cima */
function trunkRig() {
  const g = new THREE.Group();
  const W = .9, H = .36, D = .3;
  const box = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), MAT.carpet);
  g.add(box);
  const subs = [-.215, .215].map((x) => {
    const s = speaker(.118); s.position.set(x, 0, D / 2 + .002); g.add(s); return s;
  });
  const tag = label(); tag.position.set(0, -H / 2 + .045, D / 2 + .003); g.add(tag);
  const amp = new THREE.Mesh(new THREE.BoxGeometry(.42, .05, .24), MAT.amp);
  amp.position.set(0, H / 2 + .025, 0); g.add(amp);
  for (let i = 0; i < 9; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(.006, .012, .22), MAT.amp);
    fin.position.set(-.16 + i * .04, H / 2 + .056, 0); g.add(fin);
  }
  const led = new THREE.Mesh(new THREE.BoxGeometry(.05, .008, .006), MAT.glow.clone());
  led.position.set(.15, H / 2 + .03, .121); g.add(led);
  g.userData = { subs, led };
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

/* ---------------- palco ---------------- */
function start() {
  const canvas = document.createElement('canvas');
  canvas.className = 'car-gl';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Carro hatch em 3D com o som instalado. Arraste ou use as setas do teclado para girar.');
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

  const s = { yaw: 35 * DEG, pit: 14 * DEG, zoom: 1, tz: -0.05 };
  const open = { fl: 0, fr: 0, rl: 0, rr: 0, tail: 0 }, want = { fl: 0, fr: 0, rl: 0, rr: 0, tail: 0 };
  const pivots = {};
  let car = null, rig = null, paint = null, beat = null, glowL = 0;
  let dirty = true, visible = true, dragging = false, lastTouch = 0, last = 0, raf = 0, tw = null;
  const angEl = document.getElementById('heroAng'), viewEl = document.getElementById('heroView');
  const hand = stage.querySelector('.hint');
  const doorSpk = [];

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const vf = camera.fov * DEG / 2, hf = Math.atan(Math.tan(vf) * camera.aspect);
    camera.userData.dist = R / Math.sin(Math.min(vf, hf));
    camera.updateProjectionMatrix(); dirty = true;
  }

  /* yaw 0 = lateral com a frente à esquerda, 90 = frente, 270 = traseira (igual ao traço) */
  function place() {
    const d = (camera.userData.dist || 10) * s.zoom, cp = Math.cos(s.pit);
    target.z = s.tz;
    camera.position.set(target.x - d * cp * Math.cos(s.yaw), target.y + d * Math.sin(s.pit), target.z - d * cp * Math.sin(s.yaw));
    camera.lookAt(target);
    const deg = Math.round(((s.yaw / DEG) % 360 + 360) % 360);
    if (angEl) angEl.textContent = ('00' + deg).slice(-3) + '°';
    if (viewEl) { const n = viewName(deg); if (viewEl.textContent !== n) viewEl.textContent = n; }
  }

  /* gira a câmera até um ângulo pelo caminho mais curto */
  function lookAt(v) {
    if (dragging) return;
    const cur = s.yaw;
    let to = v.yaw === undefined ? cur : v.yaw * DEG;
    to = cur + ((((to - cur) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI);
    if (reduced) { s.yaw = to; s.pit = v.pit * DEG; s.zoom = v.zoom; s.tz = v.tz; dirty = true; return; }
    tw = { t0: performance.now(), dur: 1100, y0: cur, y1: to, p0: s.pit, p1: v.pit * DEG, z0: s.zoom, z1: v.zoom, t0z: s.tz, t1z: v.tz };
  }
  /* depois de fechar algo, a câmera volta para o que ainda está aberto */
  function settle() {
    if (want.tail) lookAt(VIEWS.tail);
    else if (want.fl) lookAt(VIEWS.portas);
    else lookAt(VIEWS.geral);
  }

  const anyOpen = () => Object.keys(want).some((k) => want[k]);

  function tick(t) {
    raf = 0;
    const dt = last ? Math.min(t - last, 64) : 16; last = t;
    let more = false;

    if (tw) {
      const k = Math.min(1, (t - tw.t0) / tw.dur), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      s.yaw = tw.y0 + (tw.y1 - tw.y0) * e; s.pit = tw.p0 + (tw.p1 - tw.p0) * e;
      s.zoom = tw.z0 + (tw.z1 - tw.z0) * e; s.tz = tw.t0z + (tw.t1z - tw.t0z) * e;
      if (k >= 1) { tw = null; lastTouch = t; }
      dirty = true; more = true;
    } else if (!reduced && !dragging && visible && !document.hidden && !anyOpen() && !(beat && beat.on) && t - lastTouch > 2600) {
      s.yaw += 7 * DEG * dt / 1000; dirty = true; more = true;
    }

    /* portas e tampa: aproximação suave */
    const a = reduced ? 1 : 1 - Math.exp(-dt / 160);
    for (const k in open) {
      const d = want[k] - open[k];
      if (Math.abs(d) > .001) { open[k] += d * a; more = true; dirty = true; } else if (open[k] !== want[k]) { open[k] = want[k]; dirty = true; }
      const p = pivots[k]; if (!p) continue;
      const e = open[k] * open[k] * (3 - 2 * open[k]), ang = HINGES[k].max * DEG * e;
      if (HINGES[k].axis === 'y') p.rotation.y = ang; else p.rotation.x = ang;
    }

    /* som: cones, brilho, luz do porta-malas e o carro tremendo de leve */
    const lv = beat && beat.on ? beat.level() : 0;
    glowL += (lv - glowL) * .5;
    if (beat && beat.on) { more = true; dirty = true; }
    if (rig) {
      rig.userData.subs.forEach((sp) => { sp.userData.move.position.z = lv * .028; });
      rig.userData.led.material.emissiveIntensity = beat && beat.on ? 1.5 + lv * 3 : .4;
    }
    doorSpk.forEach((sp) => { sp.userData.move.position.z = lv * .008; });
    MAT.glow.emissiveIntensity = .6 + glowL * 4;
    trunkLight.intensity = open.tail * (1.2 + glowL * 5);
    if (car) { car.position.y = reduced ? 0 : lv * .006; car.rotation.z = reduced ? 0 : Math.sin(t / 37) * lv * .0025; }
    stage.style.setProperty('--pulse', glowL.toFixed(3));

    if (dirty) { place(); renderer.render(scene, camera); dirty = false; }
    if (more || dragging) kick(); else last = 0;
  }
  function kick() { if (!raf) raf = requestAnimationFrame(tick); }

  /* arrastar e teclado, com os mesmos limites do traço */
  let px = 0, py = 0;
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true; tw = null; px = e.clientX; py = e.clientY; lastTouch = performance.now();
    canvas.setPointerCapture(e.pointerId); canvas.classList.add('is-grabbing');
    if (hand) hand.classList.add('gone'); kick();
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    s.yaw += (e.clientX - px) * 0.45 * DEG;
    s.pit = Math.min(42 * DEG, Math.max(-4 * DEG, s.pit + (e.clientY - py) * 0.3 * DEG));
    px = e.clientX; py = e.clientY; lastTouch = performance.now(); dirty = true; kick();
  });
  const up = () => { if (!dragging) return; dragging = false; lastTouch = performance.now(); canvas.classList.remove('is-grabbing'); kick(); };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  canvas.tabIndex = 0;
  canvas.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') s.yaw -= 10 * DEG;
    else if (e.key === 'ArrowRight') s.yaw += 10 * DEG;
    else if (e.key === 'ArrowUp') s.pit = Math.min(42 * DEG, s.pit + 5 * DEG);
    else if (e.key === 'ArrowDown') s.pit = Math.max(-4 * DEG, s.pit - 5 * DEG);
    else return;
    e.preventDefault(); tw = null; lastTouch = performance.now(); dirty = true; kick();
  });

  if ('IntersectionObserver' in window) new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) kick(); }).observe(stage);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && beat && beat.on) setSound(false);
    if (!document.hidden) kick();
  });
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { resize(); kick(); }, 120); });

  /* aviso de carregamento no lugar do carro */
  const load = document.createElement('div');
  load.className = 'car-load'; load.setAttribute('role', 'status');
  load.innerHTML = '<span>Carregando o carro 3D</span><i><b></b></i>';
  stage.appendChild(load);
  const prog = load.querySelector('b');

  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  loader.load('modelo/carro.glb', (gltf) => {
    car = gltf.scene;
    car.traverse((o) => {
      if (o.isMesh && o.material && /^Rojo Kings/.test(o.material.name)) paint = o.material;
    });
    scene.add(car);
    car.updateMatrixWorld(true);

    /* cada porta e a tampa ganham um eixo na dobradiça */
    for (const k in HINGES) {
      const h = HINGES[k], p = new THREE.Group();
      p.position.set(h.at[0], h.at[1], h.at[2]); car.add(p); p.updateMatrixWorld(true);
      h.nodes.forEach((n) => { const o = car.getObjectByName(n); if (o) p.attach(o); });
      pivots[k] = p;
    }

    /* som instalado: aro aceso nos falantes das portas, tweeters no painel e a caixa no porta-malas */
    [['fl', -.672, .495, -.55, .07], ['fr', .672, .495, -.55, .07], ['rl', -.66, .6, .52, .065], ['rr', .66, .6, .52, .065]].forEach(([k, x, y, z, r]) => {
      const sp = speaker(r); sp.position.set(x, y, z); sp.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
      car.add(sp); pivots[k].attach(sp); doorSpk.push(sp);
    });
    [-.6, .6].forEach((x) => {
      const tw2 = speaker(.022); tw2.position.set(x, 1.085, -.7); tw2.rotation.x = -Math.PI / 2 + .35; car.add(tw2); doorSpk.push(tw2);
    });
    rig = trunkRig(); rig.position.set(0, .76, 1.52); car.add(rig);

    resize(); place();
    renderer.compile(scene, camera);
    dirty = true; kick();
    requestAnimationFrame(() => {
      stage.classList.add('gl-on'); load.remove();
      svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('tabindex', '-1');
      controls();
    });
  }, (e) => {
    if (e.total) prog.style.width = Math.round(e.loaded / e.total * 100) + '%';
  }, () => { canvas.remove(); load.remove(); renderer.dispose(); traco(); });

  /* ---------------- botões ---------------- */
  let btnDoors, btnTail, btnSound;
  function setDoors(on) {
    ['fl', 'fr', 'rl', 'rr'].forEach((k) => { want[k] = on ? 1 : 0; });
    btnDoors.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (on) lookAt(VIEWS.portas); else settle();
    kick();
  }
  function setTail(on) {
    want.tail = on ? 1 : 0;
    btnTail.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (on) lookAt(VIEWS.tail); else settle();
    kick();
  }
  function setSound(on) {
    if (!beat) beat = makeBeat();
    if (!beat) return;
    if (on) { beat.start(); if (!want.tail) setTail(true); else lookAt(VIEWS.tail); }
    else beat.stop();
    btnSound.setAttribute('aria-pressed', on ? 'true' : 'false');
    btnSound.querySelector('b').textContent = on ? 'Desligar o som' : 'Ligar o som';
    stage.classList.toggle('is-playing', on);
    kick();
  }

  function controls() {
    const bar = document.createElement('div');
    bar.className = 'car-ctl';

    const acts = document.createElement('div');
    acts.className = 'car-acts'; acts.setAttribute('role', 'group'); acts.setAttribute('aria-label', 'Animações do carro');
    const mk = (txt, fn, cls) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'ctl' + (cls ? ' ' + cls : ''); b.setAttribute('aria-pressed', 'false');
      b.innerHTML = (cls === 'snd' ? '<i class="eq" aria-hidden="true"><span></span><span></span><span></span></i>' : '') + '<b>' + txt + '</b>';
      b.addEventListener('click', () => fn(b.getAttribute('aria-pressed') !== 'true'));
      acts.appendChild(b); return b;
    };
    btnSound = mk('Ligar o som', setSound, 'snd');
    btnDoors = mk('Portas', setDoors);
    btnTail = mk('Porta-malas', setTail);
    bar.appendChild(acts);

    if (paint) {
      const box = document.createElement('div');
      box.className = 'paint'; box.setAttribute('role', 'group'); box.setAttribute('aria-label', 'Cor da lataria');
      box.innerHTML = '<span class="paint-k">Cor</span>';
      PAINTS.forEach((p, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'sw'; b.style.setProperty('--c', p.hex);
        b.setAttribute('aria-label', p.nome); b.title = p.nome;
        b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
        b.addEventListener('click', () => {
          paint.color.set(p.hex); dirty = true; kick();
          box.querySelectorAll('.sw').forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
        });
        box.appendChild(b);
      });
      bar.appendChild(box);
    }
    stage.parentNode.appendChild(bar);
  }
}
