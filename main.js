// main.js — Jibin Jose | 3D Portfolio Engine
// Ultra-Premium Version with Cinematic Intro & Advanced Movement

import * as THREE from 'three';
import { GLTFLoader }      from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader }     from 'three/examples/jsm/loaders/DRACOLoader.js';
import { FontLoader }      from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry }    from 'three/examples/jsm/geometries/TextGeometry.js';
import { EffectComposer }  from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass }      from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass }       from 'three/examples/jsm/postprocessing/BokehPass.js';
import { ShaderPass }      from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FilmPass }        from 'three/examples/jsm/postprocessing/FilmPass.js';
import { OutputPass }      from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RGBELoader as HDRLoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js';
import { Timer }           from 'three';
import { RESUME_POINTS }   from './resume_data.js';
import { renderContent }   from './modal_content.js';

// ─── Loaders ─────────────────────────────────────────────────────────────────
const textureLoader = new THREE.TextureLoader();
const fontLoader    = new FontLoader();
const dracoLoader   = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
const gltfLoader    = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// ─── DOM refs ────────────────────────────────────────────────────────────────
const introScreen     = document.getElementById('intro-screen');
const enterBtn        = document.getElementById('enter-btn');
const loadingScreen   = document.getElementById('loading-screen');
const loadingBar      = document.getElementById('loading-bar');
const loadingPct      = document.getElementById('loading-percent');
const loadingStatus   = document.getElementById('loading-status');
const startExpBtn     = document.getElementById('start-exp-btn');
const hud             = document.getElementById('hud');
const crosshair       = document.getElementById('crosshair');
const controlsHint    = document.getElementById('controls-hint');
const interactHint    = document.getElementById('interact-hint');
const resumeModal     = document.getElementById('resume-modal');
const modalOverlay    = document.getElementById('modal-overlay');
const modalClose      = document.getElementById('modal-close');
const modalIcon       = document.getElementById('modal-icon');
const modalCategory   = document.getElementById('modal-category');
const modalTitle      = document.getElementById('modal-title');
const modalBody       = document.getElementById('modal-body');
const minimapContainer = document.getElementById('minimap-container');
const minimapCanvas   = document.getElementById('minimap');
const pointCounter    = document.getElementById('point-counter');
const pointsVisited   = document.getElementById('points-visited');
const markersContainer = document.getElementById('markers-container');
const compassNeedle   = document.getElementById('compass-needle');
const introParticles  = document.getElementById('intro-particles');
const cinematicOverlay = document.getElementById('cinematic-overlay');
const cinematicText   = document.getElementById('cinematic-text');
const statX           = document.getElementById('stat-x');
const statZ           = document.getElementById('stat-z');

// ─── Audio Engine ─────────────────────────────────────────────────────────────
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.ambient = null;
    this.rain = null;
  }
  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.createAmbient();
    this.createRainSound();
  }
  playUI(type) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type === 'click' ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(type === 'click' ? 1200 : 200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.15);
    g.gain.setValueAtTime(0.04, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.connect(g); g.connect(this.ctx.destination);
    osc.start(); osc.stop(this.ctx.currentTime + 0.15);
  }
  createAmbient() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer; noise.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 350;
    const gain = this.ctx.createGain(); gain.gain.value = 0.015;
    noise.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
    this.ambient = { noise, gain };
    noise.start();
  }
  createRainSound() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer; noise.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass'; filter.frequency.value = 1000;
    const gain = this.ctx.createGain(); gain.gain.value = 0;
    noise.connect(filter); filter.connect(gain); gain.connect(this.ctx.destination);
    this.rain = { noise, gain };
    noise.start();
  }
  setRainVolume(v) { if(this.rain) this.rain.gain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.5); }
}
const audio = new AudioEngine();

// ─── State ────────────────────────────────────────────────────────────────────
let gameStarted       = false;
let scannerActive     = false;
let cinematicMode     = false;
let rainActive        = false;
let cinematicActive   = false;
let modalOpen         = false;
let nearbyPoint       = null;
let visitedSet        = new Set();
let pointMeshes       = [];
let markerDivs        = [];
let envLoaded         = false;
const clock           = new Timer();

// Intro particles
(function spawnIntroParticles() {
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = 40 + Math.random() * 60 + '%';
    p.style.animationDelay = (Math.random() * 5) + 's';
    p.style.animationDuration = (4 + Math.random() * 4) + 's';
    const hue = Math.random() < .5 ? '#00e5ff' : '#7c3aed';
    p.style.background = hue;
    p.style.width = (1 + Math.random() * 3) + 'px';
    p.style.height = p.style.width;
    introParticles.appendChild(p);
  }
})();

// ─── THREE Setup ──────────────────────────────────────────────────────────────
const canvas = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#050810');
scene.fog = new THREE.FogExp2('#050810', 0.05);

const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 50, 50); // Cinematic start pos

// ─── Lighting ─────────────────────────────────────────────────────────────────
const ambientLight = new THREE.AmbientLight('#a0c4ff', 0.2);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight('#fff', '#050810', 0.6);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight('#fff8e7', 2.5);
sunLight.position.set(50, 100, 50);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(4096, 4096);
sunLight.shadow.camera.left = -50;
sunLight.shadow.camera.right = 50;
sunLight.shadow.camera.top = 50;
sunLight.shadow.camera.bottom = -50;
sunLight.shadow.bias = -0.0001;
scene.add(sunLight);

// Lens Flare
const flare0 = textureLoader.load('https://threejs.org/examples/textures/lensflare/lensflare0.png');
const flare3 = textureLoader.load('https://threejs.org/examples/textures/lensflare/lensflare3.png');

const lensflare = new Lensflare();
lensflare.addElement(new LensflareElement(flare0, 700, 0, sunLight.color));
lensflare.addElement(new LensflareElement(flare3, 60, 0.6));
lensflare.addElement(new LensflareElement(flare3, 70, 0.7));
lensflare.addElement(new LensflareElement(flare3, 120, 0.9));
lensflare.addElement(new LensflareElement(flare3, 70, 1));
sunLight.add(lensflare);

// "Flashlight" effect - simple point light attached to camera
const flashlight = new THREE.PointLight('#fff', 8, 15);
flashlight.position.set(0, 0, 0);
camera.add(flashlight);
scene.add(camera);

// ─── Post-processing ──────────────────────────────────────────────────────────
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Optimized Unreal Bloom
const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.4, 0.4, 0.9);
composer.addPass(bloom);

// Bokeh (Depth of Field)
const bokehPass = new BokehPass(scene, camera, {
  focus: 15.0,
  aperture: 0.00002,
  maxblur: 0.01
});
composer.addPass(bokehPass);

// Film Grain
const filmPass = new FilmPass(0.3, 0.2, 800, false);
composer.addPass(filmPass);

// Chromatic Aberration Shader
const ChromaticAberrationShader = {
  uniforms: {
    "tDiffuse": { value: null },
    "uAmount": { value: 0.0015 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uAmount;
    varying vec2 vUv;
    void main() {
      vec2 rUv = vUv + vec2(uAmount, 0.0);
      vec2 gUv = vUv;
      vec2 bUv = vUv - vec2(uAmount, 0.0);
      gl_FragColor = vec4(
        texture2D(tDiffuse, rUv).r,
        texture2D(tDiffuse, gUv).g,
        texture2D(tDiffuse, bUv).b,
        texture2D(tDiffuse, vUv).a
      );
    }
  `
};

const chromaticPass = new ShaderPass(ChromaticAberrationShader);
composer.addPass(chromaticPass);

// Output Pass (Essential for modern Three.js post-processing)
const outputPass = new OutputPass();
composer.addPass(outputPass);

// ─── Dust Particles ──────────────────────────────────────────────────────────
const dustCount = 800;
const dustGeo = new THREE.BufferGeometry();
const dustPos = new Float32Array(dustCount * 3);
const dustSpeeds = new Float32Array(dustCount);

for (let i = 0; i < dustCount; i++) {
  dustPos[i * 3 + 0] = (Math.random() - 0.5) * 100;
  dustPos[i * 3 + 1] = Math.random() * 40;
  dustPos[i * 3 + 2] = (Math.random() - 0.5) * 150;
  dustSpeeds[i] = 0.05 + Math.random() * 0.1;
}
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
const dustMat = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.05,
  transparent: true,
  opacity: 0.4,
  blending: THREE.AdditiveBlending
});
const dustParticles = new THREE.Points(dustGeo, dustMat);
scene.add(dustParticles);

// ─── God Rays (Volumetric Light) ─────────────────────────────────────────────
function createGodRays() {
  const rayGroup = new THREE.Group();
  const rayGeo = new THREE.PlaneGeometry(3, 40);
  const rayMat = new THREE.MeshBasicMaterial({
    color: 0xfff8e7,
    transparent: true,
    opacity: 0.15,
    alphaMap: textureLoader.load('https://threejs.org/examples/textures/lensflare/lensflare0.png'),
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  for (let i = 0; i < 12; i++) {
    const ray = new THREE.Mesh(rayGeo, rayMat);
    ray.position.set(
      (Math.random() - 0.5) * 60,
      20,
      (Math.random() - 0.5) * 60
    );
    ray.rotation.x = Math.PI * 0.1;
    ray.rotation.z = (Math.random() - 0.5) * 0.5;
    ray.scale.x = 2 + Math.random() * 5;
    rayGroup.add(ray);
  }
  scene.add(rayGroup);
  return rayGroup;
}
const godRays = createGodRays();

// ─── Mist System ─────────────────────────────────────────────────────────────
const mistCount = 200;
const mistGeo = new THREE.BufferGeometry();
const mistPos = new Float32Array(mistCount * 3);
for(let i=0; i<mistCount; i++) {
  mistPos[i*3+0] = (Math.random()-0.5)*100;
  mistPos[i*3+1] = Math.random()*15;
  mistPos[i*3+2] = (Math.random()-0.5)*150;
}
mistGeo.setAttribute('position', new THREE.BufferAttribute(mistPos, 3));
const mistMat = new THREE.PointsMaterial({
  size: 8, map: textureLoader.load('https://threejs.org/examples/textures/lensflare/lensflare0.png'),
  transparent: true, opacity: 0.1, color: '#a0c4ff', blending: THREE.AdditiveBlending, depthWrite: false
});
const mist = new THREE.Points(mistGeo, mistMat);
scene.add(mist);

// ─── Rain System ─────────────────────────────────────────────────────────────
const rainCount = 1500;
const rainGeo = new THREE.BufferGeometry();
const rainPos = new Float32Array(rainCount * 3);
for(let i=0; i<rainCount; i++) {
  rainPos[i*3+0] = (Math.random()-0.5)*80;
  rainPos[i*3+1] = Math.random()*50;
  rainPos[i*3+2] = (Math.random()-0.5)*120;
}
rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
const rainMat = new THREE.PointsMaterial({
  size: 0.15, transparent: true, opacity: 0, color: '#fff', depthWrite: false
});
const rain = new THREE.Points(rainGeo, rainMat);
scene.add(rain);

// ─── Scanner Grid Shader ─────────────────────────────────────────────────────
const ScannerShader = {
  uniforms: { "tDiffuse": { value: null }, "uTime": { value: 0 }, "uActive": { value: 0 } },
  vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uTime; uniform float uActive; varying vec2 vUv;
    void main() {
      lowp vec4 base = texture2D(tDiffuse, vUv);
      if (uActive > 0.5) {
        float line = step(0.98, fract(vUv.y * 25.0 + uTime * 1.5));
        float grid = step(0.995, fract(vUv.x * 20.0)) + step(0.995, fract(vUv.y * 20.0));
        base.rgb += vec3(0.0, 0.4, 0.5) * (line * 0.2 + grid * 0.15);
        base.rgb = mix(base.rgb, base.rgb * vec3(0.8, 1.2, 1.3), 0.5);
      }
      gl_FragColor = base;
    }`
};
const scannerPass = new ShaderPass(ScannerShader);
composer.insertPass(scannerPass, 2);

// ─── GLB Loader ───────────────────────────────────────────────────────────────
let envModel = null;
let floorY = 0;

function loadAssets() {
  loadingStatus.textContent = "Establishing forest connection...";
  
  const hdrPromise = new Promise(res => {
     new HDRLoader()
      .load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/equirectangular/venice_sunset_1k.hdr', (tex) => {
        tex.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = tex; res();
      }, undefined, () => {
        console.warn("HDR failing, using fallback"); res();
      });
  });

  const fontPromise = new Promise(res => {
    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_bold.typeface.json', 
      (f) => { init3DPoints(f); res(); },
      undefined,
      () => { console.warn("Font failing, using fallback"); res(); }
    );
  });

  const glbPromise = new Promise((res, rej) => {
    gltfLoader.load('/alishan-sacred-tree-station-segment-b.glb', 
      (gltf) => {
        envModel = gltf.scene;
        envModel.traverse(c => { if(c.isMesh) { c.castShadow=true; c.receiveShadow=true; } });
        scene.add(envModel); res();
      },
      (xhr) => {
        const pct = Math.round((xhr.loaded/xhr.total)*100) || 0;
        loadingBar.style.width = pct + '%';
        loadingPct.textContent = pct + '%';
        if (pct > 95) loadingStatus.textContent = "Almost there...";
      },
      (err) => { rej(err); }
    );
  });

  Promise.all([hdrPromise, fontPromise, glbPromise]).then(() => {
    if (envModel) {
      const bb = new THREE.Box3().setFromObject(envModel);
      floorY = bb.min.y;
    }
    envLoaded = true;
    onLoadComplete();
  }).catch(err => {
    console.error('Core Load Error:', err);
    loadingStatus.textContent = "Sync Error. Please refresh.";
  });
}

function onLoadComplete() {
  loadingStatus.textContent = "System Ready. Forest Synchronized.";
  startExpBtn.classList.add('visible');
}

function init3DPoints(font) {
  const pointGeom = new THREE.SphereGeometry(0.15, 32, 32);

  RESUME_POINTS.forEach((pt, i) => {
    const color = [0x00e5ff, 0x7c3aed, 0x10b981][i % 3];
    const group = new THREE.Group();
    
    // Glowing Sphere
    const mat = new THREE.MeshStandardMaterial({
      color: color, emissive: color, emissiveIntensity: 3,
      roughness: 0, metalness: 0
    });
    const sphere = new THREE.Mesh(pointGeom, mat);
    group.add(sphere);

    // 3D Text Number
    const textGeo = new TextGeometry((i + 1).toString(), {
      font: font,
      size: 0.25,
      depth: 0.05,
    });
    textGeo.center();
    const textMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.5 });
    const textMesh = new THREE.Mesh(textGeo, textMat);
    textMesh.position.y = 0.35; // Closer to the sphere
    group.add(textMesh);

    group.position.set(pt.position.x, pt.position.y, pt.position.z);
    scene.add(group);
    pointMeshes.push(group);

    // Markers (DOM for labels only)
    const div = document.createElement('div');
    div.className = 'point-marker';
    div.innerHTML = `<div class="marker-label">${pt.category}: ${pt.label}</div>`;
    
    div.style.cursor = 'pointer';
    div.style.pointerEvents = 'auto';
    div.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(i);
    });

    markersContainer.appendChild(div);
    markerDivs.push(div);
  });
}

// ─── Controls ─────────────────────────────────────────────────────────────────
const keys = {};
let yaw = 0, pitch = 0;
let currentYaw = 0, currentPitch = 0;
const SPEED = 6, SPRINT = 12;
const EYE_H = 1.75;
const INTERACT_DIST = 4.5;
let stamina = 100;

function requestPointerLock() {
  if (canvas.requestPointerLock) canvas.requestPointerLock();
}

document.addEventListener('mousemove', (e) => {
  if (modalOpen || !document.pointerLockElement) return;
  yaw -= e.movementX * 0.002;
  pitch -= e.movementY * 0.002;
  pitch = Math.max(-1.5, Math.min(1.5, pitch));
});

document.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'KeyE' && nearbyPoint !== null && !modalOpen) openModal(nearbyPoint);
  if (e.code === 'Escape') closeModal();
  
  if (gameStarted && !modalOpen) {
    if (e.code === 'KeyV') toggleScanner();
    if (e.code === 'KeyC') toggleCinematic();
    if (e.code === 'KeyR') toggleRain();
  }
});

function toggleScanner() {
  scannerActive = !scannerActive;
  audio.playUI('click');
  scannerPass.uniforms.uActive.value = scannerActive ? 1 : 0;
  document.body.classList.toggle('scanner-mode', scannerActive);
}

function toggleCinematic() {
  cinematicMode = !cinematicMode;
  audio.playUI('click');
  document.getElementById('cinematic-bars').classList.toggle('active', cinematicMode);
}

function toggleRain() {
  rainActive = !rainActive;
  audio.playUI('click');
  audio.setRainVolume(rainActive ? 0.05 : 0);
  gsap.to(rainMat, { opacity: rainActive ? 0.4 : 0, duration: 2 });
}

// Debug tool: None
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

document.addEventListener('keyup', (e) => keys[e.code] = false);

// ─── UI Actions ───────────────────────────────────────────────────────────────
window.addEventListener('start-portfolio', () => {
  loadAssets();
});

enterBtn.addEventListener('click', () => {
  window.startLoadingFlow();
});

startExpBtn.addEventListener('click', () => {
  loadingScreen.classList.remove('active');
  loadingScreen.classList.add('done');
  startCinematic();
});

function openModal(idx) {
  audio.playUI('click');
  const pt = RESUME_POINTS[idx];
  modalIcon.textContent = pt.icon;
  modalCategory.textContent = pt.category;
  modalTitle.textContent = pt.label;
  modalBody.innerHTML = renderContent(pt.content);
  resumeModal.classList.remove('hidden');
  modalOpen = true;
  document.exitPointerLock();

  if (!visitedSet.has(idx)) {
    visitedSet.add(idx);
    markerDivs[idx].classList.add('visited');
    pointsVisited.textContent = visitedSet.size;
  }
}

function closeModal() {
  resumeModal.classList.add('hidden');
  modalOpen = false;
  if (gameStarted) requestPointerLock();
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

// ─── Cinematic ────────────────────────────────────────────────────────────────
let introT = 0;
function startCinematic() {
  cinematicActive = true;
  cinematicOverlay.classList.add('visible');
  
  setTimeout(() => cinematicText.classList.add('show'), 500);
  setTimeout(() => {
    cinematicText.classList.remove('show');
    setTimeout(() => {
      cinematicText.textContent = "Discovering Jibin Jose's Portfolio";
      cinematicText.classList.add('show');
    }, 1000);
  }, 2500);

  // Transition to game control after delay
  setTimeout(() => {
    audio.init();
    cinematicActive = false;
    cinematicOverlay.classList.remove('visible');
    gameStarted = true;
    canvas.classList.add('active');
    
    hud.classList.add('visible');
    crosshair.classList.add('visible');
    controlsHint.classList.add('visible');
    minimapContainer.classList.add('visible');
    pointCounter.classList.add('visible');
    
    requestPointerLock();
  }, 7000);
}

// ─── Minimap ──────────────────────────────────────────────────────────────────
const mmCtx = minimapCanvas.getContext('2d');
function drawMinimap() {
  mmCtx.clearRect(0,0,120,120);
  mmCtx.fillStyle = '#050810'; mmCtx.beginPath(); mmCtx.arc(60,60,60,0,Math.PI*2); mmCtx.fill();
  
  // Points
  RESUME_POINTS.forEach((pt, i) => {
    const x = 60 + (pt.position.x / 40) * 120;
    const z = 60 + (pt.position.z / 60) * 120;
    mmCtx.fillStyle = visitedSet.has(i) ? '#10b981' : '#00e5ff';
    mmCtx.beginPath(); mmCtx.arc(x, z, 3, 0, Math.PI*2); mmCtx.fill();
  });

  // Player
  const px = 60 + (camera.position.x / 40) * 120;
  const pz = 60 + (camera.position.z / 60) * 120;
  mmCtx.save(); mmCtx.translate(px, pz); mmCtx.rotate(-yaw);
  mmCtx.fillStyle = '#fff'; mmCtx.beginPath(); mmCtx.moveTo(0,-6); mmCtx.lineTo(4,4); mmCtx.lineTo(-4,4); mmCtx.fill();
  mmCtx.restore();
}

// ─── Animation Loop ────────────────────────────────────────────────────────────
const _move = new THREE.Vector3();
const _euler = new THREE.Euler(0,0,0,'YXZ');
const _fwd = new THREE.Vector3();
const _rgt = new THREE.Vector3();

// Ground snapping ray
const downRay = new THREE.Raycaster();
downRay.ray.direction.set(0, -1, 0);

// Smooth movement state
const targetPos = new THREE.Vector3();
const targetRot = new THREE.Euler();
let firstUpdate = true;

function animate() {
  requestAnimationFrame(animate);
  clock.update();
  const dt = clock.getDelta();

  if (cinematicActive) {
    introT += dt * 0.12;
    const introPos = new THREE.Vector3();
    introPos.lerpVectors(new THREE.Vector3(0, 40, 50), new THREE.Vector3(2, floorY + EYE_H, 10), Math.min(introT, 1));
    camera.position.lerp(introPos, 0.05);
    camera.lookAt(0, floorY + 2, -20);
    targetPos.copy(camera.position);
  }

  if (gameStarted && !modalOpen) {
    if (firstUpdate) {
      targetPos.copy(camera.position);
      firstUpdate = false;
    }
    
    currentYaw += (yaw - currentYaw) * 0.12;
    currentPitch += (pitch - currentPitch) * 0.12;
    camera.rotation.set(currentPitch, currentYaw, 0, 'YXZ');

    const sprintKey = keys['ShiftLeft'] || keys['ShiftRight'];
    let moveSpeed = SPEED;

    if (sprintKey && stamina > 0 && _move.lengthSq() > 0) {
      moveSpeed = SPRINT;
      stamina = Math.max(0, stamina - dt * 40);
    } else {
      stamina = Math.min(100, stamina + dt * 20);
    }
    
    const staminaBar = document.getElementById('stamina-fill');
    if (staminaBar) {
      staminaBar.style.width = stamina + '%';
      staminaBar.parentElement.style.opacity = stamina < 100 ? 1 : 0;
    }

    _euler.set(0, currentYaw, 0);
    _fwd.set(0, 0, -1).applyEuler(_euler);
    _rgt.set(1, 0, 0).applyEuler(_euler);
    _move.set(0, 0, 0);

    if (keys['KeyW']) _move.add(_fwd); if (keys['KeyS']) _move.addScaledVector(_fwd, -1);
    if (keys['KeyA']) _move.addScaledVector(_rgt, -1); if (keys['KeyD']) _move.add(_rgt);

    if (_move.lengthSq() > 0) {
      targetPos.addScaledVector(_move.normalize(), moveSpeed * dt);
    }
    
    // Ground Snapping
    if (envModel) {
      downRay.ray.origin.copy(targetPos).add(new THREE.Vector3(0, 5, 0));
      const intersects = downRay.intersectObject(envModel, true);
      if (intersects.length > 0) {
        targetPos.y = intersects[0].point.y + EYE_H;
      }
    }
    
    // Smooth camera position lerp
    camera.position.lerp(targetPos, 0.1);
    
    // Breathing & Bobbing
    const time = Date.now() * 0.001;
    const breathing = Math.sin(time * 0.5) * 0.02;
    const sway = Math.cos(time * 0.3) * 0.01;
    camera.position.y += breathing;
    camera.position.x += sway;

    if (_move.lengthSq() > 1e-5) {
      camera.position.y += Math.sin(time * 10) * 0.05;
      if (Math.random() < 0.01) audio.playUI('step'); // Subtle feedback
    }

    // God Rays pulse
    godRays.children.forEach((ray, i) => {
      ray.material.opacity = (0.1 + Math.sin(time + i) * 0.05);
      ray.lookAt(camera.position);
    });

    // Mist Animation
    const mistPosAttr = mistGeo.attributes.position.array;
    for(let i=0; i<mistCount; i++) {
       mistPosAttr[i*3+0] += Math.sin(time + i) * 0.01;
       mistPosAttr[i*3+2] += Math.cos(time + i) * 0.01;
    }
    mistGeo.attributes.position.needsUpdate = true;

    // Rain Animation
    if (rainActive) {
      const rp = rainGeo.attributes.position.array;
      for(let i=0; i<rainCount; i++) {
        rp[i*3+1] -= 0.8;
        if(rp[i*3+1] < 0) rp[i*3+1] = 50;
      }
      rainGeo.attributes.position.needsUpdate = true;
    }

    // Scanner Shader
    scannerPass.uniforms.uTime.value = time;

    // Compass
    compassNeedle.style.transform = `rotate(${-currentYaw}rad)`;

    // Update Stats
    statX.textContent = camera.position.x.toFixed(2);
    statZ.textContent = camera.position.z.toFixed(2);
    
    // HUD Tilt
    const tx = (yaw - currentYaw) * 15;
    const ty = (pitch - currentPitch) * 15;
    hud.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotateY(${tx*0.2}deg) rotateX(${-ty*0.2}deg)`;

    // Points proximity
    let closest = -1, minD = Infinity;
    RESUME_POINTS.forEach((pt, i) => {
      const d = camera.position.distanceTo(new THREE.Vector3(pt.position.x, pt.position.y, pt.position.z));
      if (d < minD) { minD = d; closest = i; }
      pointMeshes[i].position.y = pt.position.y + Math.sin(Date.now()*0.002 + i)*0.2;
    });

    if (minD < INTERACT_DIST) {
      nearbyPoint = closest;
      interactHint.classList.remove('hidden');
      crosshair.classList.add('near');
    } else {
      nearbyPoint = null;
      interactHint.classList.add('hidden');
      crosshair.classList.remove('near');
    }

    // Markers projection
    const vec = new THREE.Vector3();
    RESUME_POINTS.forEach((pt, i) => {
      vec.set(pt.position.x, pt.position.y + 0.5, pt.position.z).project(camera);
      const visible = vec.z < 1 && vec.x > -1 && vec.x < 1 && vec.y > -1 && vec.y < 1;
      markerDivs[i].style.opacity = visible ? 1 : 0;
      if (visible) {
        markerDivs[i].style.left = (vec.x * 0.5 + 0.5) * window.innerWidth + 'px';
        markerDivs[i].style.top = (-vec.y * 0.5 + 0.5) * window.innerHeight + 'px';
      }
    });

    // Dust Animation
    const positions = dustGeo.attributes.position.array;
    for (let i = 0; i < dustCount; i++) {
      positions[i * 3 + 1] -= dustSpeeds[i] * dt * 5;
      if (positions[i * 3 + 1] < 0) positions[i * 3 + 1] = 40;
    }
    dustGeo.attributes.position.needsUpdate = true;

    // Bokeh Focus Adjust
    bokehPass.uniforms.focus.value = THREE.MathUtils.lerp(bokehPass.uniforms.focus.value, nearbyPoint !== null ? 2.5 : 15.0, 0.05);

    drawMinimap();
  }

  composer.render();
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
