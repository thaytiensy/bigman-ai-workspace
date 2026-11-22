/**
 * Controller Cảnh Văn Phòng 3D Hologram "Tổ Chức Nhân Viên AI".
 * Kế thừa kiến trúc Scene3D + OrbitControls + CSS2DRenderer + Speech Bubbles + Raycast
 * từ JuniorXcoder/hermes-virtual-office (MIT License) và reskin hoàn toàn thành:
 * - Văn phòng cao tầng kính hiện đại ban đêm nhìn ra thành phố phát sáng xanh cyan
 * - Biển tường nổi "TỔ CHỨC NHÂN VIÊN AI / SOLUTIONS" + màn hình dữ liệu 2 bên
 * - Bàn họp tròn hologram trung tâm xoay nhẹ nổi chữ "TỔ CHỨC NHÂN VIÊN AI"
 * - Nhân viên AI dạng hologram/cybernetic ngồi quanh bàn kèm màn hình dữ liệu 3D lơ lửng
 * - Tia sáng bàn giao liên phòng ban (Handoff Energy Beam) chạy trực tiếp trên mặt bàn 3D
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import {
  createBrandWallSignTexture,
  createHologramPanelTexture,
  createHologramTableTexture,
  createNightSkylineTexture,
  createObsidianFloorTexture,
} from './textures';
import {
  animateHologramAvatar,
  buildHologramAvatar,
  type HologramAvatarRig,
} from './hologramAvatar';
import type {
  CameraPreset,
  HandoffPulse,
  Office3DBot,
  Office3DCallbacks,
} from './types';

interface ManagedBotNode {
  bot: Office3DBot;
  rig: HologramAvatarRig;
  position: THREE.Vector3;
  phase: number;
  labelObj: CSS2DObject;
  speechEl: HTMLDivElement;
  speechTimer: number;
  ringAngle: number;
}

interface ActiveBeam {
  mesh: THREE.Mesh;
  spark: THREE.Mesh;
  curve: THREE.QuadraticBezierCurve3;
  age: number;
  duration: number;
}

export interface HologramOfficeController {
  syncBots: (bots: Office3DBot[], selectedBotId: string | null, highlightDeptId: string | null) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  focusBot: (botId: string) => void;
  setAutoRotate: (enabled: boolean) => void;
  say: (botId: string, text: string, durationMs?: number) => void;
  triggerHandoffBeam: (pulse: HandoffPulse) => void;
  resize: (width: number, height: number) => void;
  dispose: () => void;
}

const CAMERA_PRESETS: Record<CameraPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  // Góc quay Hero sát nhất với ảnh mẫu của anh: nhìn chính diện hơi cao xuống bàn họp tròn + biển tường + cửa kính thành phố
  hero: { pos: [0.3, 2.95, 7.6], target: [0, 1.35, -0.6] },
  table: { pos: [3.8, 3.6, 5.2], target: [0, 1.0, 0] },
  overview: { pos: [0.2, 7.4, 8.8], target: [0, 0.9, -0.4] },
  skyline: { pos: [-5.6, 2.7, 5.4], target: [2.2, 1.6, -1.8] },
};

export function createHologramOfficeScene(
  canvas: HTMLCanvasElement,
  labelOverlay: HTMLDivElement,
  callbacks: Office3DCallbacks = {}
): HologramOfficeController {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020914);
  scene.fog = new THREE.FogExp2(0x020b18, 0.032);

  const width = Math.max(canvas.clientWidth || 800, 320);
  const height = Math.max(canvas.clientHeight || 520, 280);

  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 120);
  camera.position.set(...CAMERA_PRESETS.hero.pos);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;

  // CSS2DRenderer cho nhãn vai trò sắc nét & bong bóng thoại (Hermes Virtual Office pattern)
  const labelRenderer = new CSS2DRenderer({ element: labelOverlay });
  labelRenderer.setSize(width, height);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.maxPolarAngle = Math.PI / 2 - 0.06;
  controls.minPolarAngle = 0.22;
  controls.minDistance = 3.8;
  controls.maxDistance = 16.5;
  controls.target.set(...CAMERA_PRESETS.hero.target);
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0.45;
  controls.update();

  // Smooth camera transition state
  let desiredPos: THREE.Vector3 | null = null;
  let desiredTarget: THREE.Vector3 | null = null;

  const stopCameraLerp = () => {
    desiredPos = null;
    desiredTarget = null;
  };
  controls.addEventListener('start', stopCameraLerp);

  // Track disposable textures/geometries created for static room
  const staticDisposables: Array<{ dispose: () => void }> = [];

  // ─── LIGHTING (Dark Cyan High-Rise Atmosphere) ───────────────────────────────
  const ambient = new THREE.AmbientLight(0x7dd3fc, 0.55);
  scene.add(ambient);

  const hemi = new THREE.HemisphereLight(0x38bdf8, 0x020814, 0.7);
  scene.add(hemi);

  // Center holographic table uplight
  const tableGlowLight = new THREE.PointLight(0x00f5ff, 3.6, 13, 1.5);
  tableGlowLight.position.set(0, 1.5, 0);
  scene.add(tableGlowLight);

  // Rim key light from city skyline windows
  const cityRimLight = new THREE.DirectionalLight(0x38bdf8, 1.45);
  cityRimLight.position.set(9, 6, -4);
  scene.add(cityRimLight);

  // Soft front fill light so cybernetic avatars shine clearly
  const frontFill = new THREE.DirectionalLight(0xbae6fd, 0.85);
  frontFill.position.set(-4, 5, 8);
  scene.add(frontFill);

  // ─── ARCHITECTURE: HIGH-RISE DARK GLASS OFFICE AT NIGHT ──────────────────────
  const roomGroup = new THREE.Group();
  scene.add(roomGroup);

  // Glossy dark obsidian floor
  const floorTex = createObsidianFloorTexture();
  staticDisposables.push(floorTex);
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTex,
    roughness: 0.14,
    metalness: 0.62,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 20), floorMat);
  floor.rotation.x = -Math.PI / 2;
  roomGroup.add(floor);

  // Glowing circular floor inlay ring beneath the conference table
  const floorNeonRing = new THREE.Mesh(
    new THREE.RingGeometry(3.45, 3.55, 72),
    new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
    })
  );
  floorNeonRing.rotation.x = -Math.PI / 2;
  floorNeonRing.position.y = 0.012;
  roomGroup.add(floorNeonRing);

  // Dark sleek matte architectural back wall
  const darkWallMat = new THREE.MeshStandardMaterial({
    color: 0x040f1d,
    roughness: 0.55,
    metalness: 0.35,
  });
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(14.5, 6.2, 0.25), darkWallMat);
  backWall.position.set(-2.2, 3.1, -6.4);
  roomGroup.add(backWall);

  // Vertical dark architectural wall pilasters
  const mullionMat = new THREE.MeshStandardMaterial({
    color: 0x0a1c30,
    roughness: 0.35,
    metalness: 0.72,
  });
  [-8.6, -5.8, -1.6, 2.2, 4.9].forEach((x) => {
    const pilaster = new THREE.Mesh(new THREE.BoxGeometry(0.14, 6.2, 0.32), mullionMat);
    pilaster.position.set(x, 3.1, -6.3);
    roomGroup.add(pilaster);
  });

  // Left sleek dark wall
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 6.2, 16), darkWallMat);
  leftWall.position.set(-9.4, 3.1, 1.4);
  roomGroup.add(leftWall);

  // Dark ceiling with glowing cyan recessed perimeter light cove (matching hero image!)
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 20),
    new THREE.MeshStandardMaterial({ color: 0x030c18, roughness: 0.75, metalness: 0.2 })
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 6.1;
  roomGroup.add(ceiling);

  const ceilingNeonMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
  [
    [0, 5.95, -5.8, 16.5, 0.07, 0.07],
    [0, 5.95, 5.2, 16.5, 0.07, 0.07],
    [-8.2, 5.95, -0.3, 0.07, 0.07, 11.1],
    [8.2, 5.95, -0.3, 0.07, 0.07, 11.1],
  ].forEach(([x, y, z, w, h, d]) => {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), ceilingNeonMat);
    strip.position.set(x, y, z);
    roomGroup.add(strip);
  });

  // Hero Illuminated Wall Brand Sign: "TỔ CHỨC NHÂN VIÊN AI / SOLUTIONS"
  const brandSignTex = createBrandWallSignTexture();
  staticDisposables.push(brandSignTex);
  const brandSign = new THREE.Mesh(
    new THREE.PlaneGeometry(5.8, 2.35),
    new THREE.MeshBasicMaterial({
      map: brandSignTex,
      transparent: true,
      depthWrite: false,
    })
  );
  brandSign.position.set(-2.2, 3.65, -6.18);
  roomGroup.add(brandSign);

  // Large holographic wall data monitors flanking the brand sign (matching reference photo!)
  const leftWallScreenTex = createHologramPanelTexture('manager', '#00f5ff', 'NEURAL NETWORK · SYSTEM KPI');
  const rightWallScreenTex = createHologramPanelTexture('researcher', '#38bdf8', 'LIVE TELEMETRY · 24/7');
  staticDisposables.push(leftWallScreenTex, rightWallScreenTex);

  const leftWallScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 2.1),
    new THREE.MeshBasicMaterial({ map: leftWallScreenTex, transparent: true, opacity: 0.88 })
  );
  leftWallScreen.position.set(-7.1, 3.35, -6.16);
  roomGroup.add(leftWallScreen);

  const rightWallScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(2.3, 2.3),
    new THREE.MeshBasicMaterial({ map: rightWallScreenTex, transparent: true, opacity: 0.85 })
  );
  rightWallScreen.position.set(2.85, 3.35, -6.16);
  roomGroup.add(rightWallScreen);

  // Panoramic Floor-to-Ceiling Glass Curtain Wall + Night City Skyline (right & back-right)
  const skylineTex = createNightSkylineTexture();
  staticDisposables.push(skylineTex);

  const skylineBack = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 7.6),
    new THREE.MeshBasicMaterial({ map: skylineTex })
  );
  skylineBack.position.set(7.5, 3.2, -9.2);
  roomGroup.add(skylineBack);

  const skylineRight = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 7.6),
    new THREE.MeshBasicMaterial({ map: skylineTex })
  );
  skylineRight.rotation.y = -Math.PI / 2;
  skylineRight.position.set(11.6, 3.2, 0.2);
  roomGroup.add(skylineRight);

  // Glass curtain wall mullions + subtle tinted glass sheen
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    roughness: 0.08,
    metalness: 0.1,
    transparent: true,
    opacity: 0.11,
    side: THREE.DoubleSide,
  });

  const rightGlass = new THREE.Mesh(new THREE.PlaneGeometry(16, 6.1), glassMat);
  rightGlass.rotation.y = -Math.PI / 2;
  rightGlass.position.set(8.6, 3.05, 1.2);
  roomGroup.add(rightGlass);

  for (let z = -6.2; z <= 8.2; z += 2.4) {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.1, 6.1, 0.1), mullionMat);
    frame.position.set(8.56, 3.05, z);
    roomGroup.add(frame);
  }
  const backRightGlass = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 6.1), glassMat);
  backRightGlass.position.set(6.8, 3.05, -6.3);
  roomGroup.add(backRightGlass);

  // Mezzanine glowing curved balcony strip visible on right side (signature detail from hero image!)
  const mezzanineEdge = new THREE.Mesh(
    new THREE.TorusGeometry(2.6, 0.04, 10, 48, Math.PI * 0.65),
    ceilingNeonMat
  );
  mezzanineEdge.rotation.x = Math.PI / 2;
  mezzanineEdge.rotation.z = Math.PI * 0.85;
  mezzanineEdge.position.set(8.8, 3.35, -3.2);
  roomGroup.add(mezzanineEdge);

  // ─── CENTERPIECE: CIRCULAR HOLOGRAPHIC CONFERENCE TABLE ──────────────────────
  const tableGroup = new THREE.Group();
  scene.add(tableGroup);

  const TABLE_R = 2.65;
  const TABLE_H = 0.78;

  // Pedestal base
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(1.15, 1.48, TABLE_H - 0.08, 40),
    new THREE.MeshStandardMaterial({ color: 0x051324, roughness: 0.25, metalness: 0.78 })
  );
  pedestal.position.y = (TABLE_H - 0.08) / 2;
  tableGroup.add(pedestal);

  // Glowing cyan base skirt ring
  const baseGlowRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.5, 0.032, 12, 64),
    new THREE.MeshBasicMaterial({ color: 0x00f5ff })
  );
  baseGlowRing.rotation.x = Math.PI / 2;
  baseGlowRing.position.y = 0.05;
  tableGroup.add(baseGlowRing);

  // Sleek dark rim drum
  const tableDrum = new THREE.Mesh(
    new THREE.CylinderGeometry(TABLE_R + 0.08, TABLE_R + 0.02, 0.11, 64),
    new THREE.MeshStandardMaterial({ color: 0x071a2f, roughness: 0.2, metalness: 0.85 })
  );
  tableDrum.position.y = TABLE_H - 0.05;
  tableGroup.add(tableDrum);

  // Top glowing holographic canvas surface
  const tableTex = createHologramTableTexture();
  staticDisposables.push(tableTex);
  const tableSurface = new THREE.Mesh(
    new THREE.CircleGeometry(TABLE_R, 64),
    new THREE.MeshBasicMaterial({ map: tableTex })
  );
  tableSurface.rotation.x = -Math.PI / 2;
  tableSurface.position.y = TABLE_H + 0.008;
  tableGroup.add(tableSurface);

  // Rotating floating holographic ring projected slightly above tabletop
  const holoRingMesh = new THREE.Mesh(
    new THREE.RingGeometry(1.18, 1.24, 64),
    new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    })
  );
  holoRingMesh.rotation.x = -Math.PI / 2;
  holoRingMesh.position.y = TABLE_H + 0.045;
  tableGroup.add(holoRingMesh);

  // Outer glowing neon table rim
  const outerRimGlow = new THREE.Mesh(
    new THREE.TorusGeometry(TABLE_R + 0.06, 0.026, 12, 80),
    new THREE.MeshBasicMaterial({ color: 0x00f5ff })
  );
  outerRimGlow.rotation.x = Math.PI / 2;
  outerRimGlow.position.y = TABLE_H - 0.01;
  tableGroup.add(outerRimGlow);

  // Mini glowing holographic wireframe crystal floating above table center
  const centerHoloCore = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.24, 1),
    new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.52,
    })
  );
  centerHoloCore.position.set(0, TABLE_H + 0.42, 0);
  tableGroup.add(centerHoloCore);

  // Floating ambient cyan holographic data particles
  const particleCount = 140;
  const pPos = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const a = (i / particleCount) * Math.PI * 2 * 3;
    const r = 1.4 + ((i * 37) % 60) * 0.11;
    pPos[i * 3] = Math.cos(a) * r;
    pPos[i * 3 + 1] = 0.6 + ((i * 53) % 45) * 0.1;
    pPos[i * 3 + 2] = Math.sin(a) * r;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.055,
      transparent: true,
      opacity: 0.55,
    })
  );
  scene.add(particles);

  // ─── DYNAMIC BOTS & HANDOFF ENERGY BEAMS ─────────────────────────────────────
  const botsGroup = new THREE.Group();
  scene.add(botsGroup);

  const beamsGroup = new THREE.Group();
  scene.add(beamsGroup);

  const botNodes = new Map<string, ManagedBotNode>();
  const activeBeams: ActiveBeam[] = [];
  let selectedBotIdState: string | null = null;

  function createBotLabelElement(bot: Office3DBot, isSelected: boolean, isDimmed: boolean) {
    const wrap = document.createElement('div');
    wrap.style.pointerEvents = 'auto';
    wrap.style.cursor = 'pointer';
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.alignItems = 'center';
    wrap.style.gap = '4px';
    wrap.style.opacity = isDimmed ? '0.32' : '1';
    wrap.style.transition = 'opacity 200ms ease, transform 200ms ease';

    // Speech bubble (hidden unless speaking)
    const speechEl = document.createElement('div');
    speechEl.style.display = 'none';
    speechEl.style.maxWidth = '210px';
    speechEl.style.padding = '5px 10px';
    speechEl.style.borderRadius = '10px';
    speechEl.style.background = 'rgba(2, 22, 40, 0.92)';
    speechEl.style.border = `1px solid ${bot.accentHex || '#00f5ff'}`;
    speechEl.style.boxShadow = `0 0 14px ${bot.accentHex || '#00f5ff'}55`;
    speechEl.style.color = '#e0f2fe';
    speechEl.style.fontSize = '11px';
    speechEl.style.fontWeight = '600';
    speechEl.style.lineHeight = '1.3';
    speechEl.style.textAlign = 'center';
    speechEl.style.whiteSpace = 'normal';
    wrap.appendChild(speechEl);

    // Pill nameplate matching hero image style ("AI Manager", "AI Marketer", ...)
    const pill = document.createElement('div');
    pill.style.display = 'inline-flex';
    pill.style.alignItems = 'center';
    pill.style.gap = '6px';
    pill.style.padding = '4px 10px';
    pill.style.borderRadius = '9999px';
    pill.style.background = isSelected
      ? 'rgba(0, 245, 255, 0.24)'
      : 'rgba(3, 19, 34, 0.84)';
    pill.style.border = `1px solid ${
      bot.isLocked
        ? 'rgba(148, 163, 184, 0.45)'
        : isSelected
        ? '#00f5ff'
        : `${bot.accentHex || '#00f5ff'}99`
    }`;
    pill.style.boxShadow = isSelected
      ? '0 0 18px rgba(0, 245, 255, 0.65)'
      : '0 2px 10px rgba(0, 0, 0, 0.45)';
    pill.style.backdropFilter = 'blur(6px)';
    pill.style.color = bot.isLocked ? '#94a3b8' : '#f0f9ff';
    pill.style.fontSize = '11px';
    pill.style.fontWeight = '700';
    pill.style.whiteSpace = 'nowrap';

    const dot = document.createElement('span');
    dot.style.width = '7px';
    dot.style.height = '7px';
    dot.style.borderRadius = '9999px';
    dot.style.background = bot.isLocked
      ? '#f59e0b'
      : bot.isActive
      ? bot.accentHex || '#00f5ff'
      : '#64748b';
    dot.style.boxShadow = bot.isActive && !bot.isLocked ? `0 0 8px ${bot.accentHex || '#00f5ff'}` : 'none';
    pill.appendChild(dot);

    const text = document.createElement('span');
    text.textContent = bot.isLocked
      ? `🔒 ${bot.name}`
      : `${bot.roleBadge} · ${bot.name}`;
    pill.appendChild(text);

    wrap.appendChild(pill);

    wrap.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (bot.isLocked) callbacks.onSelectLockedBot?.(bot.id);
      else callbacks.onSelectBot?.(bot.id);
    });

    return { wrap, speechEl };
  }

  function clearBots() {
    botNodes.forEach((node) => {
      botsGroup.remove(node.rig.root);
      node.rig.root.remove(node.labelObj);
      node.rig.disposeTextures();
    });
    botNodes.clear();
  }

  function syncBots(
    bots: Office3DBot[],
    selectedBotId: string | null,
    highlightDeptId: string | null
  ) {
    selectedBotIdState = selectedBotId;
    clearBots();

    const count = Math.max(bots.length, 1);
    // Distribute up to 8 bots neatly around the main glowing round table (like the hero image),
    // and any extra bots on a secondary outer executive ring so adding bots never overlaps!
    const innerMax = Math.min(count, 8);
    const outerCount = Math.max(0, count - innerMax);

    bots.forEach((bot, idx) => {
      let radius = 3.25;
      let angle = 0;

      if (idx < innerMax) {
        // Arrange around back/sides/front arc so key bots face the hero camera dramatically
        // Start from back-left to front-right evenly around 360 deg, placing Orbit/Manager at top-center (-PI/2)
        const baseOffset = -Math.PI;
        angle = baseOffset + (idx / innerMax) * Math.PI * 2;
        radius = 3.22;
      } else {
        const oIdx = idx - innerMax;
        angle = -Math.PI * 0.85 + (oIdx / Math.max(outerCount, 1)) * Math.PI * 1.7;
        radius = 4.95;
      }

      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;

      const rig = buildHologramAvatar(bot);
      rig.root.position.set(x, 0, z);
      // Face inward toward the center of the holographic table (0, 0, 0)
      rig.root.lookAt(0, 0, 0);

      const isDimmed = Boolean(highlightDeptId && bot.departmentId !== highlightDeptId);
      const isSelected = selectedBotId === bot.id;

      if (isDimmed) {
        rig.screenMaterial.opacity = 0.16;
      }

      const { wrap, speechEl } = createBotLabelElement(bot, isSelected, isDimmed);
      const labelObj = new CSS2DObject(wrap);
      labelObj.position.set(0, 1.98, 0);
      rig.root.add(labelObj);

      botsGroup.add(rig.root);

      botNodes.set(bot.id, {
        bot,
        rig,
        position: new THREE.Vector3(x, 0, z),
        phase: idx * 1.17,
        labelObj,
        speechEl,
        speechTimer: 0,
        ringAngle: angle,
      });
    });
  }

  function setCameraPreset(preset: CameraPreset) {
    const cfg = CAMERA_PRESETS[preset];
    desiredPos = new THREE.Vector3(...cfg.pos);
    desiredTarget = new THREE.Vector3(...cfg.target);
  }

  function focusBot(botId: string) {
    const node = botNodes.get(botId);
    if (!node) return;
    const p = node.position;
    // Position camera gracefully opposite/inward so both the bot and central table stay framed
    const dir = p.clone().normalize();
    desiredTarget = new THREE.Vector3(p.x * 0.72, 1.25, p.z * 0.72);
    desiredPos = new THREE.Vector3(
      p.x + dir.x * 2.8 + -dir.z * 1.6,
      2.45,
      p.z + dir.z * 2.8 + dir.x * 1.6
    );
  }

  function setAutoRotate(enabled: boolean) {
    controls.autoRotate = enabled;
  }

  function say(botId: string, text: string, durationMs = 4500) {
    const node = botNodes.get(botId);
    if (!node) return;
    node.speechEl.textContent = text;
    node.speechEl.style.display = 'block';
    node.speechTimer = durationMs / 1000;
  }

  function triggerHandoffBeam(pulse: HandoffPulse) {
    const fromNode = botNodes.get(pulse.fromBotId);
    const toNode = botNodes.get(pulse.toBotId);
    if (!fromNode || !toNode) return;

    const start = fromNode.position.clone().setY(1.18);
    const end = toNode.position.clone().setY(1.18);
    const mid = start
      .clone()
      .add(end)
      .multiplyScalar(0.5);
    mid.y = 2.05;

    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.032, 8, false);
    const color = new THREE.Color(pulse.colorHex || '#00f5ff');
    const tubeMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.9,
    });
    const mesh = new THREE.Mesh(tubeGeo, tubeMat);
    beamsGroup.add(mesh);

    const spark = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    spark.position.copy(start);
    beamsGroup.add(spark);

    activeBeams.push({
      mesh,
      spark,
      curve,
      age: 0,
      duration: 1.9,
    });

    if (pulse.label) {
      say(pulse.fromBotId, `→ ${pulse.label}`, 2400);
    }
  }

  // ─── RAYCASTING CLICK SELECTION ──────────────────────────────────────────────
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let pointerDownXY = { x: 0, y: 0 };

  const onPointerDown = (e: PointerEvent) => {
    pointerDownXY = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e: PointerEvent) => {
    const moved = Math.hypot(e.clientX - pointerDownXY.x, e.clientY - pointerDownXY.y);
    if (moved > 6) return; // user was orbiting, not clicking

    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    const targets: THREE.Object3D[] = [];
    botNodes.forEach((n) => targets.push(n.rig.hitTarget));
    const hits = raycaster.intersectObjects(targets, false);
    if (hits.length > 0) {
      const { botId, isLocked } = hits[0].object.userData as {
        botId?: string;
        isLocked?: boolean;
      };
      if (botId) {
        if (isLocked) callbacks.onSelectLockedBot?.(botId);
        else callbacks.onSelectBot?.(botId);
      }
    }
  };

  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointerup', onPointerUp);

  // ─── ANIMATION LOOP ──────────────────────────────────────────────────────────
  let rafId = 0;
  let lastTime = performance.now();
  let elapsed = 0;
  let disposed = false;

  const animateLoop = (now: number) => {
    if (disposed) return;
    rafId = requestAnimationFrame(animateLoop);

    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    elapsed += dt;

    // Smooth camera preset / focus interpolation
    if (desiredPos && desiredTarget) {
      camera.position.lerp(desiredPos, Math.min(1, dt * 4.5));
      controls.target.lerp(desiredTarget, Math.min(1, dt * 4.5));
      if (
        camera.position.distanceTo(desiredPos) < 0.05 &&
        controls.target.distanceTo(desiredTarget) < 0.05
      ) {
        desiredPos = null;
        desiredTarget = null;
      }
    }

    controls.update();

    // Animate holographic table elements & ambient particles
    holoRingMesh.rotation.z = elapsed * 0.35;
    centerHoloCore.rotation.y = elapsed * 0.7;
    centerHoloCore.rotation.x = Math.sin(elapsed * 0.5) * 0.25;
    centerHoloCore.position.y = TABLE_H + 0.42 + Math.sin(elapsed * 1.8) * 0.06;
    particles.rotation.y = elapsed * 0.035;
    tableGlowLight.intensity = 3.4 + Math.sin(elapsed * 2.2) * 0.35;

    // Animate each hologram avatar & decay speech bubbles
    botNodes.forEach((node) => {
      if (node.speechTimer > 0) {
        node.speechTimer -= dt;
        if (node.speechTimer <= 0) {
          node.speechEl.style.display = 'none';
        }
      }
      animateHologramAvatar(
        node.rig,
        elapsed,
        node.phase,
        node.bot.isActive && !node.bot.isLocked,
        selectedBotIdState === node.bot.id,
        node.speechTimer > 0
      );
    });

    // Animate cross-department handoff energy beams
    for (let i = activeBeams.length - 1; i >= 0; i--) {
      const b = activeBeams[i];
      b.age += dt;
      const progress = Math.min(1, b.age / b.duration);
      b.spark.position.copy(b.curve.getPoint(progress));
      const mat = b.mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = progress < 0.7 ? 0.92 : (1 - progress) * 3.0;

      if (b.age >= b.duration) {
        beamsGroup.remove(b.mesh);
        beamsGroup.remove(b.spark);
        b.mesh.geometry.dispose();
        mat.dispose();
        b.spark.geometry.dispose();
        (b.spark.material as THREE.Material).dispose();
        activeBeams.splice(i, 1);
      }
    }

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  };

  rafId = requestAnimationFrame(animateLoop);
  callbacks.onSceneReady?.();

  function resize(w: number, h: number) {
    if (w < 10 || h < 10) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    labelRenderer.setSize(w, h);
  }

  function dispose() {
    disposed = true;
    cancelAnimationFrame(rafId);
    controls.removeEventListener('start', stopCameraLerp);
    renderer.domElement.removeEventListener('pointerdown', onPointerDown);
    renderer.domElement.removeEventListener('pointerup', onPointerUp);
    controls.dispose();
    clearBots();
    activeBeams.forEach((b) => {
      b.mesh.geometry.dispose();
      (b.mesh.material as THREE.Material).dispose();
      b.spark.geometry.dispose();
      (b.spark.material as THREE.Material).dispose();
    });
    staticDisposables.forEach((d) => d.dispose());
    pGeo.dispose();
    renderer.dispose();
  }

  return {
    syncBots,
    setCameraPreset,
    focusBot,
    setAutoRotate,
    say,
    triggerHandoffBeam,
    resize,
    dispose,
  };
}
