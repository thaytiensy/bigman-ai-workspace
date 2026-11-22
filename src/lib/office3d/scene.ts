/**
 * Controller Cảnh Văn Phòng 3D Hologram "Tổ Chức Nhân Viên AI" v2.
 * Kế thừa kiến trúc Scene3D + OrbitControls + CSS2DRenderer + Speech Bubbles + Raycast
 * từ JuniorXcoder/hermes-virtual-office (MIT License) và nâng cấp trọn bộ đồ họa sát ảnh Hero:
 * - Kiến trúc văn phòng kính cao tầng đêm xanh cyan, tường mạch điện, dải đèn trần uốn cong
 * - Biển tường "TỔ CHỨC NHÂN VIÊN AI / SOLUTIONS" + 2 màn hình tường Neural & Globe + phòng phụ sau vách kính
 * - Bàn họp tròn hologram trung tâm + mô hình người hologram wireframe đứng nổi trên mặt bàn
 * - Bố trí giãn nở không giới hạn: vòng trung tâm (tối đa 8 bot) + cụm phòng ban vòng ngoài (9–40+ bot)
 * - Tia bàn giao A2A + nhãn vai trò kính mờ bo tròn chuẩn ảnh mẫu + nhãn trạng thái Duty 5 mức
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import {
  createBrandWallSignTexture,
  createCircuitWallTexture,
  createHologramFigureTexture,
  createHologramTableTexture,
  createNightSkylineTexture,
  createObsidianFloorTexture,
  createWallMonitorTexture,
} from './textures';
import {
  animateHologramAvatar,
  buildHologramAvatar,
  type HologramAvatarRig,
} from './hologramAvatar';
import { DUTY_META } from './officeStore';
import type {
  CameraPreset,
  HandoffPulse,
  Office3DBot,
  Office3DCallbacks,
} from './types';

interface ManagedBotNode {
  bot: Office3DBot;
  rig: HologramAvatarRig;
  podDesk?: THREE.Group;
  position: THREE.Vector3;
  phase: number;
  labelObj: CSS2DObject;
  speechEl: HTMLDivElement;
  speechTimer: number;
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
  // Góc quay Hero bám sát ảnh mẫu: chính diện hơi cao nhìn xuống bàn họp tròn, biển tường & thành phố đêm
  hero: { pos: [0.15, 2.75, 7.35], target: [0, 1.32, -0.75] },
  table: { pos: [3.9, 3.45, 5.1], target: [0, 0.98, 0] },
  overview: { pos: [0.2, 8.2, 10.6], target: [0, 0.9, -0.6] },
  skyline: { pos: [-5.4, 2.6, 5.5], target: [2.4, 1.65, -2.0] },
};

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

function sanitizeHexColor(hex: string | undefined, fallback = '#00f5ff'): string {
  return hex && HEX_COLOR_RE.test(hex) ? hex : fallback;
}

function disposeObject3D(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry && typeof mesh.geometry.dispose === 'function') {
      mesh.geometry.dispose();
    }
    const mat = mesh.material;
    if (Array.isArray(mat)) {
      mat.forEach((m) => {
        const textured = m as THREE.MeshBasicMaterial;
        if (textured.map) textured.map.dispose();
        m.dispose();
      });
    } else if (mat) {
      const textured = mat as THREE.MeshBasicMaterial;
      if (textured.map) textured.map.dispose();
      mat.dispose();
    }
  });
}

/** Bàn làm việc mini hologram cho các nhân viên ở vòng phòng ban mở rộng (khi > 8 bot) */
function buildOuterPodDesk(accentHex: string): THREE.Group {
  const g = new THREE.Group();
  const color = new THREE.Color(accentHex);

  const deskTop = new THREE.Mesh(
    new THREE.BoxGeometry(1.18, 0.05, 0.56),
    new THREE.MeshPhysicalMaterial({
      color: 0x052035,
      emissive: color,
      emissiveIntensity: 0.25,
      roughness: 0.18,
      metalness: 0.55,
      transparent: true,
      opacity: 0.88,
    })
  );
  deskTop.position.set(0, 0.78, 0.68);
  g.add(deskTop);

  const edge = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.02, 0.03),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 })
  );
  edge.position.set(0, 0.78, 0.96);
  g.add(edge);

  [-0.48, 0.48].forEach((lx) => {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.03, 0.76, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e354d, metalness: 0.8, roughness: 0.25 })
    );
    leg.position.set(lx, 0.38, 0.68);
    g.add(leg);
  });

  return g;
}

export function createHologramOfficeScene(
  canvas: HTMLCanvasElement,
  labelOverlay: HTMLDivElement,
  callbacks: Office3DCallbacks = {}
): HologramOfficeController {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020812);
  scene.fog = new THREE.FogExp2(0x020b18, 0.026);

  const width = Math.max(canvas.clientWidth || 800, 320);
  const height = Math.max(canvas.clientHeight || 520, 280);

  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 130);
  camera.position.set(...CAMERA_PRESETS.hero.pos);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.24;

  const labelRenderer = new CSS2DRenderer({ element: labelOverlay });
  labelRenderer.setSize(width, height);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.maxPolarAngle = Math.PI / 2 - 0.05;
  controls.minPolarAngle = 0.2;
  controls.minDistance = 3.6;
  controls.maxDistance = 22;
  controls.target.set(...CAMERA_PRESETS.hero.target);
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0.42;
  controls.update();

  let desiredPos: THREE.Vector3 | null = null;
  let desiredTarget: THREE.Vector3 | null = null;
  const stopCameraLerp = () => {
    desiredPos = null;
    desiredTarget = null;
  };
  controls.addEventListener('start', stopCameraLerp);

  const staticGroup = new THREE.Group();
  scene.add(staticGroup);

  // ─── LIGHTING (Dark Cyan High-Rise Atmosphere) ───────────────────────────────
  const hemiLight = new THREE.HemisphereLight(0x7ef9ff, 0x041326, 0.92);
  scene.add(hemiLight);

  const tableUpLight = new THREE.PointLight(0x00f5ff, 4.2, 16, 1.5);
  tableUpLight.position.set(0, 1.35, 0);
  scene.add(tableUpLight);

  const wallSignLight = new THREE.PointLight(0x22d3ee, 2.8, 14, 1.5);
  wallSignLight.position.set(-1.6, 3.5, -4.4);
  scene.add(wallSignLight);

  const skylineRimLight = new THREE.DirectionalLight(0x38bdf8, 1.35);
  skylineRimLight.position.set(8.5, 5.2, -5.5);
  scene.add(skylineRimLight);

  const frontFillLight = new THREE.DirectionalLight(0x93c5fd, 0.65);
  frontFillLight.position.set(-3, 4.8, 9);
  scene.add(frontFillLight);

  // ─── FLOOR & HIGH-RISE ARCHITECTURE (MATCHING REFERENCE IMAGE) ───────────────
  const floorTex = createObsidianFloorTexture();
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(34, 34),
    new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.2,
      metalness: 0.62,
    })
  );
  floor.rotation.x = -Math.PI / 2;
  staticGroup.add(floor);

  const gridHelper = new THREE.GridHelper(28, 28, 0x00f5ff, 0x0a2942);
  gridHelper.position.y = 0.004;
  (gridHelper.material as THREE.Material).transparent = true;
  (gridHelper.material as THREE.Material).opacity = 0.16;
  staticGroup.add(gridHelper);

  // Circuit-etched dark obsidian walls (back-left & left wall matching photo)
  const circuitWallTex = createCircuitWallTexture();
  const wallMat = new THREE.MeshStandardMaterial({
    map: circuitWallTex,
    roughness: 0.52,
    metalness: 0.34,
  });

  const backWall = new THREE.Mesh(new THREE.BoxGeometry(10.6, 6.2, 0.28), wallMat);
  backWall.position.set(-3.3, 3.1, -6.2);
  staticGroup.add(backWall);

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.28, 6.2, 14.5), wallMat);
  leftWall.position.set(-8.5, 3.1, 0.8);
  staticGroup.add(leftWall);

  // Brand Wall Signage: "TỔ CHỨC NHÂN VIÊN AI / SOLUTIONS"
  const signTex = createBrandWallSignTexture();
  const signPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(5.6, 2.28),
    new THREE.MeshBasicMaterial({
      map: signTex,
      transparent: true,
      depthWrite: false,
    })
  );
  signPlane.position.set(-2.35, 3.58, -6.02);
  staticGroup.add(signPlane);

  // Large Wall Monitor 1 (Left wall — Neural Matrix, like left side of reference image)
  const leftMonitorTex = createWallMonitorTexture('left_neural');
  const leftMonitor = new THREE.Mesh(
    new THREE.PlaneGeometry(2.65, 3.35),
    new THREE.MeshBasicMaterial({ map: leftMonitorTex, transparent: true, opacity: 0.94 })
  );
  leftMonitor.position.set(-6.95, 3.32, -5.98);
  staticGroup.add(leftMonitor);

  // Side console desk on the left with dual monitors (subtle detail from photo)
  const sideDesk = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.08, 0.72),
    new THREE.MeshStandardMaterial({ color: 0x071a2d, roughness: 0.25, metalness: 0.7 })
  );
  sideDesk.position.set(-6.95, 0.82, -5.2);
  staticGroup.add(sideDesk);

  [-0.42, 0.42].forEach((mx) => {
    const miniMon = new THREE.Mesh(
      new THREE.PlaneGeometry(0.72, 0.44),
      new THREE.MeshBasicMaterial({ color: 0x0e4f70, transparent: true, opacity: 0.82 })
    );
    miniMon.position.set(-6.95 + mx, 1.16, -5.36);
    staticGroup.add(miniMon);
  });

  // Large Wall Monitor 2 (Back-center right of brand sign — Wireframe Globe, like behind AI Manager)
  const globeMonitorTex = createWallMonitorTexture('center_globe');
  const globeMonitor = new THREE.Mesh(
    new THREE.PlaneGeometry(1.78, 2.52),
    new THREE.MeshBasicMaterial({ map: globeMonitorTex, transparent: true, opacity: 0.92 })
  );
  globeMonitor.position.set(1.05, 3.34, -5.98);
  staticGroup.add(globeMonitor);

  // Ceiling + Signature Curved Glowing Cyan Ceiling Light Strips (from photo!)
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 18),
    new THREE.MeshStandardMaterial({ color: 0x030c18, roughness: 0.45, metalness: 0.4 })
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, 6.1, -0.5);
  staticGroup.add(ceiling);

  const cyanStripMat = new THREE.MeshBasicMaterial({ color: 0x00f5ff });
  // Straight architectural light bars on top ceiling
  [
    { pos: [-2.6, 6.02, -5.6], size: [11.2, 0.07, 0.08] },
    { pos: [-7.9, 6.02, 0.2], size: [0.08, 0.07, 11.6] },
    { pos: [1.8, 6.02, -3.4], size: [8.4, 0.06, 0.08] },
  ].forEach((b) => {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(b.size[0], b.size[1], b.size[2]), cyanStripMat);
    strip.position.set(b.pos[0], b.pos[1], b.pos[2]);
    staticGroup.add(strip);
  });

  // Curved glowing cyan architectural ceiling soffit arc on the right glass wing (signature detail from photo!)
  const curvedArcCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(3.0, 3.55, -5.8),
    new THREE.Vector3(6.6, 3.55, -2.5),
    new THREE.Vector3(7.9, 3.55, 2.8)
  );
  const curvedSoffitTube = new THREE.Mesh(
    new THREE.TubeGeometry(curvedArcCurve, 40, 0.042, 8, false),
    cyanStripMat
  );
  staticGroup.add(curvedSoffitTube);

  const upperArcCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(2.4, 5.75, -5.8),
    new THREE.Vector3(6.8, 5.75, -2.2),
    new THREE.Vector3(8.2, 5.75, 3.4)
  );
  const upperSoffitTube = new THREE.Mesh(
    new THREE.TubeGeometry(upperArcCurve, 40, 0.045, 8, false),
    cyanStripMat
  );
  staticGroup.add(upperSoffitTube);

  // Panoramic Night Skyline through Floor-to-Ceiling Glass Curtain Wall (right & back-right)
  const skylineTex = createNightSkylineTexture();
  const skylineMat = new THREE.MeshBasicMaterial({ map: skylineTex });

  const skylineBackRight = new THREE.Mesh(new THREE.PlaneGeometry(11.6, 6.8), skylineMat);
  skylineBackRight.position.set(6.5, 3.25, -7.2);
  staticGroup.add(skylineBackRight);

  const skylineRight = new THREE.Mesh(new THREE.PlaneGeometry(15.5, 6.8), skylineMat);
  skylineRight.rotation.y = -Math.PI / 2;
  skylineRight.position.set(10.6, 3.25, -0.4);
  staticGroup.add(skylineRight);

  // Sleek tall glass curtain wall & dark chrome vertical mullions
  const mullionMat = new THREE.MeshStandardMaterial({
    color: 0x0b1f33,
    metalness: 0.85,
    roughness: 0.2,
  });
  const glassPaneMat = new THREE.MeshPhysicalMaterial({
    color: 0x0e4d6c,
    transparent: true,
    opacity: 0.14,
    roughness: 0.08,
    metalness: 0.15,
  });

  const backGlass = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 6.2), glassPaneMat);
  backGlass.position.set(6.4, 3.1, -6.15);
  staticGroup.add(backGlass);

  for (let i = 0; i <= 5; i++) {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.11, 6.2, 0.14), mullionMat);
    col.position.set(2.1 + i * 1.65, 3.1, -6.12);
    staticGroup.add(col);
  }
  for (let i = 0; i <= 6; i++) {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.14, 6.2, 0.11), mullionMat);
    col.position.set(8.6, 3.1, -5.6 + i * 2.0);
    staticGroup.add(col);
  }

  // Adjacent Glass Office Pod visible on far-right background (matching the coworkers wing in photo)
  const wingDesk = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.07, 1.0),
    new THREE.MeshStandardMaterial({ color: 0x0a2238, metalness: 0.6, roughness: 0.3 })
  );
  wingDesk.position.set(6.8, 0.8, -3.5);
  staticGroup.add(wingDesk);

  [-0.7, 0.7].forEach((dx) => {
    const wingScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.65, 0.4),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.42 })
    );
    wingScreen.position.set(6.8 + dx, 1.12, -3.5);
    staticGroup.add(wingScreen);
  });

  // ─── CENTERPIECE CIRCULAR HOLOGRAM CONFERENCE TABLE ──────────────────────────
  const tableGroup = new THREE.Group();
  staticGroup.add(tableGroup);

  const TABLE_RADIUS = 2.08;
  const TABLE_HEIGHT = 0.78;

  const pedestalMat = new THREE.MeshStandardMaterial({
    color: 0x071728,
    roughness: 0.24,
    metalness: 0.85,
  });

  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.64, 0.96, TABLE_HEIGHT - 0.08, 36),
    pedestalMat
  );
  pedestal.position.y = (TABLE_HEIGHT - 0.08) / 2;
  tableGroup.add(pedestal);

  const pedestalRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.84, 0.022, 12, 48),
    new THREE.MeshBasicMaterial({ color: 0x00f5ff })
  );
  pedestalRing.rotation.x = Math.PI / 2;
  pedestalRing.position.y = 0.06;
  tableGroup.add(pedestalRing);

  // Dark chrome table chassis
  const tableBody = new THREE.Mesh(
    new THREE.CylinderGeometry(TABLE_RADIUS + 0.06, TABLE_RADIUS + 0.02, 0.1, 64),
    pedestalMat
  );
  tableBody.position.y = TABLE_HEIGHT - 0.04;
  tableGroup.add(tableBody);

  // Double neon cyan outer rim rings (iconic visual from reference photo!)
  const rimOuter = new THREE.Mesh(
    new THREE.TorusGeometry(TABLE_RADIUS + 0.075, 0.026, 14, 72),
    new THREE.MeshBasicMaterial({ color: 0x00f5ff })
  );
  rimOuter.rotation.x = Math.PI / 2;
  rimOuter.position.y = TABLE_HEIGHT + 0.014;
  tableGroup.add(rimOuter);

  const rimInner = new THREE.Mesh(
    new THREE.TorusGeometry(TABLE_RADIUS - 0.05, 0.014, 10, 72),
    new THREE.MeshBasicMaterial({ color: 0x7ef9ff, transparent: true, opacity: 0.85 })
  );
  rimInner.rotation.x = Math.PI / 2;
  rimInner.position.y = TABLE_HEIGHT + 0.02;
  tableGroup.add(rimInner);

  // Glowing Hologram Tabletop Display
  const tableTex = createHologramTableTexture();
  const tableTop = new THREE.Mesh(
    new THREE.CircleGeometry(TABLE_RADIUS, 64),
    new THREE.MeshBasicMaterial({ map: tableTex })
  );
  tableTop.rotation.x = -Math.PI / 2;
  tableTop.position.y = TABLE_HEIGHT + 0.018;
  tableGroup.add(tableTop);

  // Subtle rotating holographic scanner ring above tabletop
  const holoRing = new THREE.Mesh(
    new THREE.RingGeometry(1.06, 1.12, 64),
    new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    })
  );
  holoRing.rotation.x = -Math.PI / 2;
  holoRing.position.y = TABLE_HEIGHT + 0.04;
  tableGroup.add(holoRing);

  // Standing Wireframe Hologram Human Projection rising on the right side of the table (from reference photo!)
  const figureTex = createHologramFigureTexture();
  const holoFigure = new THREE.Mesh(
    new THREE.PlaneGeometry(0.46, 0.68),
    new THREE.MeshBasicMaterial({
      map: figureTex,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  holoFigure.position.set(0.88, TABLE_HEIGHT + 0.35, 0.56);
  tableGroup.add(holoFigure);

  const holoFigureBase = new THREE.Mesh(
    new THREE.RingGeometry(0.12, 0.17, 28),
    new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide,
    })
  );
  holoFigureBase.rotation.x = -Math.PI / 2;
  holoFigureBase.position.set(0.88, TABLE_HEIGHT + 0.026, 0.56);
  tableGroup.add(holoFigureBase);

  // Ambient cyan floating data particles
  const particleCount = 110;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const r = 1.6 + (i % 14) * 0.52;
    const a = i * 1.17;
    particlePositions[i * 3] = Math.cos(a) * r;
    particlePositions[i * 3 + 1] = 0.5 + (i % 10) * 0.48;
    particlePositions[i * 3 + 2] = Math.sin(a) * r;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particles = new THREE.Points(
    particleGeo,
    new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.048,
      transparent: true,
      opacity: 0.52,
    })
  );
  staticGroup.add(particles);

  // ─── DYNAMIC BOTS, EXPANDABLE PODS & A2A HANDOFF BEAMS ───────────────────────
  const botsGroup = new THREE.Group();
  scene.add(botsGroup);

  const beamsGroup = new THREE.Group();
  scene.add(beamsGroup);

  const botNodes = new Map<string, ManagedBotNode>();
  const activeBeams: ActiveBeam[] = [];
  let currentSelectedId: string | null = null;

  function createBotLabelElement(
    bot: Office3DBot,
    isSelected: boolean,
    isDimmed: boolean
  ): { wrapper: HTMLDivElement; speechEl: HTMLDivElement } {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '4px';
    wrapper.style.pointerEvents = 'auto';
    wrapper.style.cursor = 'pointer';
    wrapper.style.transition = 'opacity 180ms ease, transform 180ms ease';
    wrapper.style.opacity = isDimmed ? '0.28' : '1';
    wrapper.style.userSelect = 'none';

    const speechEl = document.createElement('div');
    speechEl.style.display = 'none';
    speechEl.style.maxWidth = '230px';
    speechEl.style.padding = '5px 10px';
    speechEl.style.borderRadius = '10px';
    speechEl.style.background = 'rgba(2, 16, 30, 0.94)';
    speechEl.style.border = `1px solid ${sanitizeHexColor(bot.accentHex)}`;
    speechEl.style.color = '#e0f2fe';
    speechEl.style.fontSize = '11px';
    speechEl.style.lineHeight = '1.35';
    speechEl.style.textAlign = 'center';
    speechEl.style.boxShadow = '0 6px 20px rgba(0, 245, 255, 0.24)';
    wrapper.appendChild(speechEl);

    // Crisp rounded glass pill matching the hero image ("AI Marketer", "AI Manager", "AI Researcher", "AI Customer Support")
    const pill = document.createElement('div');
    const safeAccent = sanitizeHexColor(bot.accentHex);
    const dutyMeta = DUTY_META[bot.duty];
    pill.style.display = 'flex';
    pill.style.flexDirection = 'column';
    pill.style.alignItems = 'center';
    pill.style.padding = '5px 12px';
    pill.style.borderRadius = '9999px';
    pill.style.background = isSelected
      ? 'rgba(0, 72, 102, 0.92)'
      : 'rgba(4, 24, 42, 0.84)';
    pill.style.backdropFilter = 'blur(8px)';
    pill.style.border = `1.5px solid ${bot.isLocked ? 'rgba(148,163,184,0.45)' : isSelected ? '#00f5ff' : safeAccent}`;
    pill.style.boxShadow = isSelected
      ? '0 0 18px rgba(0, 245, 255, 0.55)'
      : '0 4px 14px rgba(0, 0, 0, 0.55)';

    const topRow = document.createElement('div');
    topRow.style.display = 'flex';
    topRow.style.alignItems = 'center';
    topRow.style.gap = '6px';

    const dot = document.createElement('span');
    dot.style.width = '7px';
    dot.style.height = '7px';
    dot.style.borderRadius = '9999px';
    dot.style.background = bot.isLocked
      ? '#64748b'
      : bot.isActive
        ? dutyMeta.colorHex
        : '#475569';
    topRow.appendChild(dot);

    const roleSpan = document.createElement('span');
    roleSpan.textContent = bot.roleBadge;
    roleSpan.style.color = bot.isLocked ? '#cbd5e1' : '#f8fafc';
    roleSpan.style.fontWeight = '700';
    roleSpan.style.fontSize = '11.5px';
    roleSpan.style.letterSpacing = '0.015em';
    roleSpan.style.whiteSpace = 'nowrap';
    topRow.appendChild(roleSpan);

    pill.appendChild(topRow);

    const subRow = document.createElement('div');
    subRow.style.fontSize = '9.5px';
    subRow.style.color = bot.isLocked ? '#94a3b8' : '#7ef9ff';
    subRow.style.whiteSpace = 'nowrap';
    subRow.textContent = bot.isLocked
      ? `${bot.name} · Khóa (Cloud)`
      : `${bot.name} · ${dutyMeta.shortLabel}`;
    pill.appendChild(subRow);

    wrapper.appendChild(pill);

    wrapper.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (bot.isLocked) {
        callbacks.onSelectLockedBot?.(bot.id);
      } else {
        callbacks.onSelectBot?.(bot.id);
      }
    });

    wrapper.addEventListener('dblclick', (ev) => {
      ev.stopPropagation();
      if (!bot.isLocked) {
        callbacks.onPeekBot?.(bot.id);
      }
    });

    return { wrapper, speechEl };
  }

  function clearBots(): void {
    botNodes.forEach((node) => {
      botsGroup.remove(node.rig.root);
      node.rig.root.remove(node.labelObj);
      if (node.labelObj.element.parentNode) {
        node.labelObj.element.parentNode.removeChild(node.labelObj.element);
      }
      node.rig.disposeTextures();
      disposeObject3D(node.rig.root);
      if (node.podDesk) {
        botsGroup.remove(node.podDesk);
        disposeObject3D(node.podDesk);
      }
    });
    botNodes.clear();
  }

  function syncBots(
    bots: Office3DBot[],
    selectedBotId: string | null,
    highlightDeptId: string | null
  ): void {
    currentSelectedId = selectedBotId;
    clearBots();

    if (bots.length === 0) return;

    // Sort so AI Manager / Orbit sits at index 0 (hero center seat facing camera!), active bots first
    const ordered = [...bots].sort((a, b) => {
      const aMgr = a.screenKind === 'manager' ? 0 : 1;
      const bMgr = b.screenKind === 'manager' ? 0 : 1;
      if (aMgr !== bMgr) return aMgr - bMgr;
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return 0;
    });

    // Dynamic scalable layout:
    // - Up to 8 bots sit gracefully around the centerpiece circular conference table
    // - Bot 9+ automatically expand into Outer Department Hologram Pods (zero crowding, unlimited expansion!)
    const MAX_INNER_SEATS = 8;
    const innerBots = ordered.slice(0, MAX_INNER_SEATS);
    const outerBots = ordered.slice(MAX_INNER_SEATS);

    // Hero-balanced inner seating angles: seat 0 at back-center (PI, facing camera directly like AI Manager!)
    const innerCount = innerBots.length;
    const innerRadius = innerCount <= 5 ? 2.58 : innerCount <= 6 ? 2.68 : 2.86;

    const placeBot = (
      bot: Office3DBot,
      x: number,
      z: number,
      lookX: number,
      lookZ: number,
      idx: number,
      withPodDesk: boolean
    ) => {
      const rig = buildHologramAvatar(bot);
      rig.root.position.set(x, 0, z);
      rig.root.lookAt(lookX, 0, lookZ);
      botsGroup.add(rig.root);

      let podDesk: THREE.Group | undefined;
      if (withPodDesk) {
        podDesk = buildOuterPodDesk(sanitizeHexColor(bot.accentHex));
        podDesk.position.set(x, 0, z);
        podDesk.lookAt(lookX, 0, lookZ);
        botsGroup.add(podDesk);
      }

      const isSelected = bot.id === selectedBotId;
      const isDimmed = Boolean(highlightDeptId && bot.departmentId !== highlightDeptId);

      if (isDimmed) {
        rig.screenMaterial.opacity = 0.16;
      }

      const { wrapper, speechEl } = createBotLabelElement(bot, isSelected, isDimmed);
      const labelObj = new CSS2DObject(wrapper);
      labelObj.position.set(0, 1.98, 0.06);
      rig.root.add(labelObj);

      botNodes.set(bot.id, {
        bot,
        rig,
        podDesk,
        position: new THREE.Vector3(x, 0, z),
        phase: idx * 0.83,
        labelObj,
        speechEl,
        speechTimer: 0,
      });
    };

    // Place Inner Conference Table Bots (arcing symmetrically around back-center like the Hero photo)
    const heroAnglesFor5 = [
      Math.PI,          // 0: Center (AI Manager)
      Math.PI * 0.65,   // 1: Back-right (AI Researcher)
      Math.PI * 1.35,   // 2: Back-left (AI Engineer)
      Math.PI * 0.34,   // 3: Front-right (AI Customer Support)
      Math.PI * 1.66,   // 4: Front-left (AI Marketer)
    ];

    innerBots.forEach((bot, idx) => {
      const angle =
        innerCount <= 5
          ? heroAnglesFor5[idx]
          : Math.PI + (idx / innerCount) * Math.PI * 2;
      const x = Math.sin(angle) * innerRadius;
      const z = Math.cos(angle) * innerRadius;
      placeBot(bot, x, z, 0, 0, idx, false);
    });

    // Place Outer Expandable Department Pods (9..40+ bots in expanding semi-rings)
    outerBots.forEach((bot, idx) => {
      const ringTier = Math.floor(idx / 10);
      const indexInTier = idx % 10;
      const tierCount = Math.min(10, outerBots.length - ringTier * 10);
      const outerRadius = 4.95 + ringTier * 2.15;
      // Wide panoramic horseshoe arc around the table so Hero view sees all expanded pods cleanly
      const span = Math.PI * 1.32;
      const startAngle = Math.PI - span / 2;
      const step = tierCount > 1 ? span / (tierCount - 1) : 0;
      const angle = tierCount === 1 ? Math.PI * 0.85 : startAngle + indexInTier * step;

      const x = Math.sin(angle) * outerRadius;
      const z = Math.cos(angle) * outerRadius;
      placeBot(bot, x, z, 0, 0, innerCount + idx, true);
    });
  }

  function setCameraPreset(preset: CameraPreset): void {
    const cfg = CAMERA_PRESETS[preset];
    desiredPos = new THREE.Vector3(...cfg.pos);
    desiredTarget = new THREE.Vector3(...cfg.target);
  }

  function focusBot(botId: string): void {
    const node = botNodes.get(botId);
    if (!node) return;
    const dir = node.position.clone().normalize();
    if (dir.lengthSq() < 0.01) dir.set(0, 0, 1);
    desiredPos = node.position
      .clone()
      .add(dir.multiplyScalar(2.65))
      .add(new THREE.Vector3(0, 2.1, 0));
    desiredTarget = node.position.clone().add(new THREE.Vector3(0, 1.2, 0));
  }

  function setAutoRotate(enabled: boolean): void {
    controls.autoRotate = enabled;
  }

  function say(botId: string, text: string, durationMs = 4600): void {
    const node = botNodes.get(botId);
    if (!node) return;
    node.speechEl.textContent = text;
    node.speechEl.style.display = 'block';
    node.speechTimer = durationMs / 1000;
  }

  function triggerHandoffBeam(pulse: HandoffPulse): void {
    const fromNode = botNodes.get(pulse.fromBotId);
    const toNode = botNodes.get(pulse.toBotId);
    if (!fromNode || !toNode) return;

    const p0 = fromNode.position.clone().add(new THREE.Vector3(0, 1.32, 0));
    const p2 = toNode.position.clone().add(new THREE.Vector3(0, 1.32, 0));
    const mid = p0.clone().add(p2).multiplyScalar(0.5);
    mid.y += 1.05;

    const curve = new THREE.QuadraticBezierCurve3(p0, mid, p2);
    const color = new THREE.Color(sanitizeHexColor(pulse.colorHex));

    const tubeGeo = new THREE.TubeGeometry(curve, 36, 0.024, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.92,
    });
    const mesh = new THREE.Mesh(tubeGeo, tubeMat);
    beamsGroup.add(mesh);

    const sparkGeo = new THREE.SphereGeometry(0.085, 12, 12);
    const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const spark = new THREE.Mesh(sparkGeo, sparkMat);
    spark.position.copy(p0);
    beamsGroup.add(spark);

    activeBeams.push({ mesh, spark, curve, age: 0, duration: 2.3 });
    if (pulse.label) {
      say(pulse.fromBotId, `→ ${toNode.bot.name}: ${pulse.label}`, 3600);
    }
  }

  // Raycast clicking on 3D hologram bots
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let pointerDownPos = { x: 0, y: 0 };

  const onPointerDown = (e: PointerEvent) => {
    pointerDownPos = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e: PointerEvent) => {
    const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
    if (dist > 6) return;

    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const targets: THREE.Object3D[] = [];
    botNodes.forEach((n) => targets.push(n.rig.hitTarget));
    const hits = raycaster.intersectObjects(targets, false);
    if (hits.length > 0) {
      const botId = hits[0].object.userData.botId as string | undefined;
      if (botId) {
        const node = botNodes.get(botId);
        if (node?.bot.isLocked) {
          callbacks.onSelectLockedBot?.(botId);
        } else {
          callbacks.onSelectBot?.(botId);
        }
      }
    }
  };

  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointerup', onPointerUp);

  // ─── ANIMATION LOOP ──────────────────────────────────────────────────────────
  let rafId = 0;
  let lastTime = performance.now();
  let elapsed = 0;

  const animate = (now: number) => {
    rafId = requestAnimationFrame(animate);
    const dt = Math.min((now - lastTime) / 1000, 0.08);
    lastTime = now;
    elapsed += dt;

    // Gentle holographic table animations
    holoRing.rotation.z = elapsed * 0.3;
    particles.rotation.y = elapsed * 0.035;
    holoFigure.lookAt(camera.position.x, holoFigure.position.y, camera.position.z);
    holoFigure.position.y = TABLE_HEIGHT + 0.35 + Math.sin(elapsed * 2.1) * 0.022;
    tableUpLight.intensity = 4.0 + Math.sin(elapsed * 2.2) * 0.35;

    // Smooth camera preset transition
    if (desiredPos && desiredTarget) {
      camera.position.lerp(desiredPos, 0.08);
      controls.target.lerp(desiredTarget, 0.08);
      if (
        camera.position.distanceTo(desiredPos) < 0.05 &&
        controls.target.distanceTo(desiredTarget) < 0.05
      ) {
        desiredPos = null;
        desiredTarget = null;
      }
    }

    // Animate bots & speech bubbles
    botNodes.forEach((node) => {
      animateHologramAvatar(
        node.rig,
        elapsed,
        node.phase,
        node.bot.id === currentSelectedId,
        node.bot.isActive,
        node.bot.isLocked
      );

      if (node.speechTimer > 0) {
        node.speechTimer -= dt;
        if (node.speechTimer <= 0) {
          node.speechEl.style.display = 'none';
        }
      }
    });

    // Animate A2A handoff energy beams
    for (let i = activeBeams.length - 1; i >= 0; i--) {
      const b = activeBeams[i];
      b.age += dt;
      const progress = Math.min(b.age / b.duration, 1);
      b.spark.position.copy(b.curve.getPoint(progress));
      const mat = b.mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = progress < 0.7 ? 0.92 : (1 - progress) * 3;
      if (b.age >= b.duration) {
        beamsGroup.remove(b.mesh);
        beamsGroup.remove(b.spark);
        b.mesh.geometry.dispose();
        (b.mesh.material as THREE.Material).dispose();
        b.spark.geometry.dispose();
        (b.spark.material as THREE.Material).dispose();
        activeBeams.splice(i, 1);
      }
    }

    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  };

  rafId = requestAnimationFrame(animate);
  callbacks.onSceneReady?.();

  function resize(w: number, h: number): void {
    const safeW = Math.max(w, 280);
    const safeH = Math.max(h, 240);
    camera.aspect = safeW / safeH;
    camera.updateProjectionMatrix();
    renderer.setSize(safeW, safeH, false);
    labelRenderer.setSize(safeW, safeH);
  }

  function dispose(): void {
    cancelAnimationFrame(rafId);
    controls.removeEventListener('start', stopCameraLerp);
    renderer.domElement.removeEventListener('pointerdown', onPointerDown);
    renderer.domElement.removeEventListener('pointerup', onPointerUp);
    controls.dispose();
    clearBots();
    activeBeams.forEach((b) => {
      beamsGroup.remove(b.mesh);
      beamsGroup.remove(b.spark);
      b.mesh.geometry.dispose();
      (b.mesh.material as THREE.Material).dispose();
      b.spark.geometry.dispose();
      (b.spark.material as THREE.Material).dispose();
    });
    activeBeams.length = 0;
    disposeObject3D(staticGroup);
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
