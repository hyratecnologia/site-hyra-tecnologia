/* ==========================================================================
   Vibex AudioCar · carro 3D realista no hero (Three.js + GLB)
   O traço em SVG (engine.js) aparece na hora e fica como reserva: quando o
   modelo carrega, ele assume o mesmo ângulo e o traço some. Sem WebGL, com
   economia de dados ou se o arquivo falhar, o traço continua lá.
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
  { id: 'vermelho', nome: 'Vermelho', hex: '#D01616' },
  { id: 'preto', nome: 'Preto', hex: '#0B0B0D' },
  { id: 'grafite', nome: 'Grafite', hex: '#3A3D42' },
  { id: 'prata', nome: 'Prata', hex: '#B9BEC4' },
  { id: 'branco', nome: 'Branco', hex: '#E9EAEC' },
  { id: 'laranja', nome: 'Laranja', hex: '#FF5A0A' }
];

function webgl() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (_) { return false; }
}

if (stage && svg && webgl() && !saveData) {
  if (document.readyState === 'complete') start();
  else addEventListener('load', start, { once: true });
}

function viewName(deg) {
  if (deg < 22 || deg > 338 || (deg > 158 && deg < 202)) return 'Lateral';
  if (deg > 68 && deg < 112) return 'Frontal';
  if (deg > 248 && deg < 292) return 'Traseira';
  return '3/4';
}

function start() {
  const canvas = document.createElement('canvas');
  canvas.className = 'car-gl';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Carro hatch em 3D. Arraste ou use as setas do teclado para girar.');
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

  /* começa no mesmo ângulo em que o traço está agora */
  const hero = window.VibexHero;
  const s = { yaw: hero ? hero.s.yaw : 35 * DEG, pit: hero ? hero.s.pit : 14 * DEG };
  let paint = null, dirty = true, visible = true, dragging = false, lastTouch = 0, last = 0, raf = 0;
  const angEl = document.getElementById('heroAng'), viewEl = document.getElementById('heroView');
  const hand = stage.querySelector('.hint');

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
    const d = camera.userData.dist || 10, cp = Math.cos(s.pit);
    camera.position.set(target.x - d * cp * Math.cos(s.yaw), target.y + d * Math.sin(s.pit), target.z - d * cp * Math.sin(s.yaw));
    camera.lookAt(target);
    const deg = Math.round(((s.yaw / DEG) % 360 + 360) % 360);
    if (angEl) angEl.textContent = ('00' + deg).slice(-3) + '°';
    if (viewEl) { const n = viewName(deg); if (viewEl.textContent !== n) viewEl.textContent = n; }
  }

  function tick(t) {
    raf = 0;
    const dt = last ? Math.min(t - last, 64) : 16; last = t;
    let more = false;
    if (!reduced && !dragging && visible && !document.hidden && t - lastTouch > 2600) { s.yaw += 7 * DEG * dt / 1000; dirty = true; more = true; }
    if (dirty) { place(); renderer.render(scene, camera); dirty = false; }
    if (more || dragging) kick(); else last = 0;
  }
  function kick() { if (!raf) raf = requestAnimationFrame(tick); }

  /* arrastar e teclado, com os mesmos limites do traço */
  let px = 0, py = 0;
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true; px = e.clientX; py = e.clientY; lastTouch = performance.now();
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
    e.preventDefault(); lastTouch = performance.now(); dirty = true; kick();
  });

  if ('IntersectionObserver' in window) new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) kick(); }).observe(stage);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { resize(); kick(); }, 120); });

  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  loader.load('modelo/carro.glb', (gltf) => {
    const car = gltf.scene;
    car.traverse((o) => {
      if (!o.isMesh) return;
      const m = o.material;
      if (m && /^Rojo Kings/.test(m.name)) paint = m;
    });
    scene.add(car);
    resize(); place();
    renderer.compile(scene, camera);
    if (hero) { s.yaw = hero.s.yaw; s.pit = hero.s.pit; hero.o.auto = 0; }
    dirty = true; kick();
    requestAnimationFrame(() => {
      stage.classList.add('gl-on');
      svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('tabindex', '-1');
      if (paint) swatches();
    });
  }, undefined, () => { canvas.remove(); renderer.dispose(); });

  function swatches() {
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
    stage.parentNode.appendChild(box);
  }
}
