/**
 * Cybernetic Hologram Avatar Rig cho Văn Phòng 3D "Tổ Chức Nhân Viên AI".
 * Kế thừa cấu trúc khớp cơ thể phân cấp (hips / chest / head / articulated shoulders & elbows)
 * từ Hermes Virtual Office (MIT License) và reskin hoàn toàn sang nhân viên AI hologram/cybernetic
 * phát sáng xanh cyan ngồi quanh bàn họp tròn hologram giống sát ảnh mẫu.
 */
import * as THREE from 'three';
import { createHologramPanelTexture } from './textures';
import type { Office3DBot } from './types';

export interface HologramAvatarRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  head: THREE.Group;
  chest: THREE.Group;
  leftShoulder: THREE.Group;
  rightShoulder: THREE.Group;
  leftElbow: THREE.Group;
  rightElbow: THREE.Group;
  coreRing: THREE.Mesh;
  holoScreen: THREE.Mesh;
  screenMaterial: THREE.MeshBasicMaterial;
  auraRing: THREE.Mesh;
  hitTarget: THREE.Mesh;
  disposeTextures: () => void;
}

/** Tạo ghế điều hành lưng cao màu đen bóng viền kim loại giống ảnh mẫu */
function buildExecutiveChair(accentColor: THREE.Color, isLocked: boolean): THREE.Group {
  const chair = new THREE.Group();
  const leatherMat = new THREE.MeshStandardMaterial({
    color: 0x0b1523,
    roughness: 0.32,
    metalness: 0.28,
  });
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0x3b536b,
    roughness: 0.25,
    metalness: 0.85,
  });
  const trimMat = new THREE.MeshBasicMaterial({
    color: isLocked ? 0x64748b : accentColor,
    transparent: true,
    opacity: isLocked ? 0.35 : 0.72,
  });

  // 5-star base & cylinder
  const baseHub = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.42, 12), chromeMat);
  baseHub.position.y = 0.24;
  chair.add(baseHub);

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.34), chromeMat);
    leg.position.set(Math.sin(a) * 0.16, 0.05, Math.cos(a) * 0.16);
    leg.rotation.y = a;
    chair.add(leg);
  }

  // Seat cushion
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.08, 0.54), leatherMat);
  seat.position.set(0, 0.48, -0.02);
  chair.add(seat);

  // Tall sculpted backrest
  const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.78, 0.07), leatherMat);
  backrest.position.set(0, 0.9, -0.27);
  backrest.rotation.x = -0.08;
  chair.add(backrest);

  // Subtle glowing edge strip on backrest
  const strip = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.018, 0.08), trimMat);
  strip.position.set(0, 1.24, -0.29);
  chair.add(strip);

  // Armrests
  [-1, 1].forEach((side) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.05), chromeMat);
    post.position.set(side * 0.29, 0.58, -0.04);
    chair.add(post);

    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.035, 0.34), leatherMat);
    pad.position.set(side * 0.29, 0.7, -0.04);
    chair.add(pad);
  });

  return chair;
}

/** Dựng nhân viên AI dạng người máy hologram xanh cyan + màn hình dữ liệu nổi 3D */
export function buildHologramAvatar(bot: Office3DBot): HologramAvatarRig {
  const root = new THREE.Group();
  root.userData.botId = bot.id;

  const accent = new THREE.Color(bot.isLocked ? '#64748b' : bot.accentHex || '#00f5ff');
  const brightCyan = new THREE.Color(bot.isLocked ? '#94a3b8' : '#7ef9ff');

  // Executive chair
  const chair = buildExecutiveChair(accent, bot.isLocked);
  root.add(chair);

  // Holographic cybernetic body materials
  const holoShellMat = new THREE.MeshPhysicalMaterial({
    color: bot.isLocked ? 0x334155 : accent,
    emissive: bot.isLocked ? 0x0f172a : accent,
    emissiveIntensity: bot.isLocked ? 0.2 : bot.isActive ? 0.65 : 0.35,
    roughness: 0.18,
    metalness: 0.35,
    transparent: true,
    opacity: bot.isLocked ? 0.36 : bot.isActive ? 0.82 : 0.58,
  });

  const holoInnerMat = new THREE.MeshStandardMaterial({
    color: bot.isLocked ? 0x1e293b : 0x062c44,
    emissive: bot.isLocked ? 0x09101c : accent,
    emissiveIntensity: bot.isLocked ? 0.1 : 0.45,
    roughness: 0.25,
    metalness: 0.6,
    transparent: true,
    opacity: bot.isLocked ? 0.4 : 0.88,
  });

  const wireMat = new THREE.MeshBasicMaterial({
    color: brightCyan,
    wireframe: true,
    transparent: true,
    opacity: bot.isLocked ? 0.14 : bot.isActive ? 0.32 : 0.18,
  });

  const glowMat = new THREE.MeshBasicMaterial({
    color: brightCyan,
    transparent: true,
    opacity: bot.isLocked ? 0.25 : 0.95,
  });

  const bodyGroup = new THREE.Group();
  // Local +Z faces toward the center of the round table
  root.add(bodyGroup);

  // Seated pelvis & thighs
  const hips = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.15, 0.16, 12), holoInnerMat);
  hips.position.set(0, 0.58, -0.02);
  bodyGroup.add(hips);

  [-1, 1].forEach((s) => {
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.068, 0.26, 6, 10), holoShellMat);
    thigh.rotation.x = Math.PI / 2;
    thigh.position.set(s * 0.11, 0.55, 0.16);
    bodyGroup.add(thigh);

    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.056, 0.32, 6, 10), holoInnerMat);
    shin.position.set(s * 0.11, 0.32, 0.3);
    bodyGroup.add(shin);
  });

  // Sculpted robotic chest + glowing core
  const chest = new THREE.Group();
  chest.position.set(0, 0.66, -0.02);
  bodyGroup.add(chest);

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.14, 0.46, 14), holoShellMat);
  torso.position.set(0, 0.24, 0);
  chest.add(torso);

  const torsoWire = new THREE.Mesh(new THREE.CylinderGeometry(0.206, 0.146, 0.465, 10), wireMat);
  torsoWire.position.set(0, 0.24, 0);
  chest.add(torsoWire);

  // Shoulder armor pads
  [-1, 1].forEach((s) => {
    const pad = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 10), holoShellMat);
    pad.scale.set(1.1, 0.72, 1);
    pad.position.set(s * 0.23, 0.42, 0);
    chest.add(pad);
  });

  // Glowing reactor ring on chest
  const coreRing = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.014, 10, 24), glowMat);
  coreRing.position.set(0, 0.28, 0.175);
  chest.add(coreRing);

  const coreDot = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 10), glowMat);
  coreDot.position.set(0, 0.28, 0.17);
  chest.add(coreDot);

  // Articulated neck & cybernetic head
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.062, 0.11, 10), holoInnerMat);
  neck.position.set(0, 0.51, 0);
  chest.add(neck);

  const head = new THREE.Group();
  head.position.set(0, 0.65, 0.01);
  chest.add(head);

  const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.145, 18, 16), holoShellMat);
  cranium.scale.set(0.92, 1.08, 0.96);
  head.add(cranium);

  const craniumWire = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), wireMat);
  craniumWire.scale.set(0.92, 1.08, 0.96);
  head.add(craniumWire);

  // Glowing eyes & ear sensor rings (like the cybernetic androids in the hero image)
  [-1, 1].forEach((s) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), glowMat);
    eye.position.set(s * 0.048, 0.018, 0.128);
    head.add(eye);

    const earRing = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.008, 8, 18), glowMat);
    earRing.rotation.y = Math.PI / 2;
    earRing.position.set(s * 0.138, 0.0, -0.01);
    head.add(earRing);
  });

  // Articulated arms (Hermes shoulder -> elbow joint hierarchy)
  const makeArm = (side: -1 | 1) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.24, 0.4, 0);
    chest.add(shoulder);

    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.22, 6, 10), holoInnerMat);
    upper.position.set(0, -0.14, 0);
    shoulder.add(upper);

    const elbow = new THREE.Group();
    elbow.position.set(0, -0.28, 0);
    shoulder.add(elbow);

    const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.044, 0.22, 6, 10), holoShellMat);
    fore.position.set(0, -0.12, 0.04);
    fore.rotation.x = -0.35;
    elbow.add(fore);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 8), glowMat);
    hand.position.set(0, -0.24, 0.11);
    elbow.add(hand);

    return { shoulder, elbow };
  };

  const leftArm = makeArm(-1);
  const rightArm = makeArm(1);

  // Default seated typing/presenting posture
  leftArm.shoulder.rotation.set(-0.55, 0, 0.14);
  leftArm.elbow.rotation.set(-0.85, 0, 0);
  rightArm.shoulder.rotation.set(-0.55, 0, -0.14);
  rightArm.elbow.rotation.set(-0.85, 0, 0);

  // Floating translucent holographic data screen beside/in front of avatar
  const screenTex = createHologramPanelTexture(
    bot.screenKind,
    bot.isLocked ? '#64748b' : bot.accentHex || '#00f5ff',
    `${bot.roleBadge} · ${bot.name}`
  );
  const screenMaterial = new THREE.MeshBasicMaterial({
    map: screenTex,
    transparent: true,
    opacity: bot.isLocked ? 0.24 : bot.isActive ? 0.9 : 0.55,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const holoScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.62), screenMaterial);
  holoScreen.position.set(0.46, 1.38, 0.36);
  holoScreen.rotation.y = -0.22;
  root.add(holoScreen);

  // Holographic laptop / tablet projected in front of bot on table edge
  const tablet = new THREE.Mesh(
    new THREE.PlaneGeometry(0.42, 0.26),
    new THREE.MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: bot.isLocked ? 0.15 : 0.42,
      side: THREE.DoubleSide,
    })
  );
  tablet.position.set(0, 0.88, 0.48);
  tablet.rotation.x = -0.35;
  root.add(tablet);

  // Base floor hologram aura ring under chair
  const auraRing = new THREE.Mesh(
    new THREE.RingGeometry(0.42, 0.48, 32),
    new THREE.MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: bot.isLocked ? 0.12 : bot.isActive ? 0.55 : 0.25,
      side: THREE.DoubleSide,
    })
  );
  auraRing.rotation.x = -Math.PI / 2;
  auraRing.position.y = 0.02;
  root.add(auraRing);

  // Invisible generous raycast hit target so clicking anywhere on the avatar works reliably
  const hitTarget = new THREE.Mesh(
    new THREE.CylinderGeometry(0.48, 0.48, 1.75, 10),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitTarget.position.set(0, 0.92, 0.05);
  hitTarget.userData.botId = bot.id;
  hitTarget.userData.isLocked = bot.isLocked;
  root.add(hitTarget);

  return {
    root,
    bodyGroup,
    head,
    chest,
    leftShoulder: leftArm.shoulder,
    rightShoulder: rightArm.shoulder,
    leftElbow: leftArm.elbow,
    rightElbow: rightArm.elbow,
    coreRing,
    holoScreen,
    screenMaterial,
    auraRing,
    hitTarget,
    disposeTextures: () => {
      screenTex.dispose();
    },
  };
}

/** Pure pose animation per frame (derived from Hermes anim.ts pattern) */
export function animateHologramAvatar(
  rig: HologramAvatarRig,
  t: number,
  phase: number,
  isActive: boolean,
  isSelected: boolean,
  isSpeaking: boolean
) {
  const speed = isSpeaking ? 3.8 : isActive ? 1.9 : 0.8;
  const breath = Math.sin(t * speed + phase);
  const sway = Math.cos(t * 0.9 + phase);

  // Subtle living torso & head movement
  rig.chest.rotation.x = 0.04 + breath * 0.025;
  rig.head.rotation.y = sway * (isSpeaking ? 0.2 : 0.11);
  rig.head.rotation.x = Math.sin(t * 1.4 + phase) * 0.04;

  // Typing / presenting hand gestures
  if (isSpeaking) {
    rig.rightShoulder.rotation.x = -0.82 + Math.sin(t * 4.5 + phase) * 0.18;
    rig.rightElbow.rotation.x = -0.52 + Math.cos(t * 4.2 + phase) * 0.16;
    rig.leftShoulder.rotation.x = -0.62 + Math.cos(t * 3.1 + phase) * 0.1;
  } else if (isActive) {
    rig.leftShoulder.rotation.x = -0.58 + Math.sin(t * 2.4 + phase) * 0.06;
    rig.rightShoulder.rotation.x = -0.58 + Math.cos(t * 2.6 + phase) * 0.06;
    rig.leftElbow.rotation.x = -0.82 + Math.sin(t * 5.2 + phase) * 0.05;
    rig.rightElbow.rotation.x = -0.82 + Math.cos(t * 5.6 + phase) * 0.05;
  } else {
    rig.leftShoulder.rotation.x = -0.45;
    rig.rightShoulder.rotation.x = -0.45;
  }

  // Gentle floating bob of the holographic monitor panel
  rig.holoScreen.position.y = 1.38 + Math.sin(t * 1.6 + phase) * 0.045;
  rig.coreRing.rotation.z = t * (isActive ? 1.4 : 0.3) + phase;

  // Highlight selected or speaking avatar aura ring
  const auraScale = isSelected ? 1.24 + Math.sin(t * 4) * 0.06 : isSpeaking ? 1.15 : 1.0;
  rig.auraRing.scale.setScalar(auraScale);
}
