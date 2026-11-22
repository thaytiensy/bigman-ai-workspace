/**
 * Cybernetic Hologram Avatar Rig cho Văn Phòng 3D "Tổ Chức Nhân Viên AI".
 * Thiết kế sát thẩm mỹ ảnh Hero:
 * - Ghế điều hành da đen cao cấp viền chrome, tựa đầu cong & dải đèn màu phòng ban
 * - Nhân viên AI Android Hologram xanh cyan bán trong suốt, phân biệt dáng nữ / nam / android,
 *   có vòng tai nghe phát sáng cyan, lõi năng lượng giữa ngực, khớp tay linh hoạt
 * - Đạo cụ đặc thù trên bàn: Laptop Hologram phát sáng (Engineer/Manager), Tablet (Researcher),
 *   hoặc cử chỉ thuyết trình tương tác (Marketer/Customer Support) + màn hình HUD 3D lơ lửng
 * - Chuyển động theo Duty State Machine 5 mức (meeting / a2a / desk / review / idle 0-token)
 */
import * as THREE from 'three';
import { createHologramPanelTexture } from './textures';
import type { DutyState, Office3DBot } from './types';

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
  floatingProp?: THREE.Object3D;
  hitTarget: THREE.Mesh;
  duty: DutyState;
  disposeTextures: () => void;
}

/** Ghế điều hành da đen bóng lưng cong viền kim loại chuẩn ảnh Hero */
function buildExecutiveChair(accentColor: THREE.Color, isLocked: boolean): THREE.Group {
  const chair = new THREE.Group();
  const leatherMat = new THREE.MeshStandardMaterial({
    color: 0x091321,
    roughness: 0.28,
    metalness: 0.24,
  });
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0x4b657e,
    roughness: 0.2,
    metalness: 0.88,
  });
  const trimMat = new THREE.MeshBasicMaterial({
    color: isLocked ? 0x64748b : accentColor,
    transparent: true,
    opacity: isLocked ? 0.3 : 0.78,
  });

  // 5-star base & piston
  const baseHub = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.064, 0.44, 14), chromeMat);
  baseHub.position.y = 0.24;
  chair.add(baseHub);

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.028, 0.35), chromeMat);
    leg.position.set(Math.sin(a) * 0.16, 0.05, Math.cos(a) * 0.16);
    leg.rotation.y = a;
    chair.add(leg);
  }

  // Contoured seat cushion
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.085, 0.54), leatherMat);
  seat.position.set(0, 0.48, -0.02);
  chair.add(seat);

  // Sculpted tall executive backrest + headrest
  const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.76, 0.068), leatherMat);
  backrest.position.set(0, 0.9, -0.27);
  backrest.rotation.x = -0.09;
  chair.add(backrest);

  const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.16, 0.072), leatherMat);
  headrest.position.set(0, 1.32, -0.305);
  headrest.rotation.x = -0.04;
  chair.add(headrest);

  // Glowing department color edge strip on backrest
  const strip = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.078), trimMat);
  strip.position.set(0, 1.24, -0.295);
  chair.add(strip);

  // Sleek curved chrome armrests with leather pads
  [-1, 1].forEach((side) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.24, 0.045), chromeMat);
    post.position.set(side * 0.295, 0.59, -0.04);
    chair.add(post);

    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.064, 0.035, 0.36), leatherMat);
    pad.position.set(side * 0.295, 0.71, -0.02);
    chair.add(pad);
  });

  return chair;
}

/** Laptop hologram phát sáng đặt trước mặt nhân viên AI (như ảnh mẫu) */
function buildHoloLaptop(accentColor: THREE.Color, isLocked: boolean): THREE.Group {
  const laptop = new THREE.Group();
  const baseMat = new THREE.MeshPhysicalMaterial({
    color: isLocked ? 0x334155 : 0x062d46,
    emissive: isLocked ? 0x0f172a : accentColor,
    emissiveIntensity: isLocked ? 0.1 : 0.45,
    transparent: true,
    opacity: isLocked ? 0.32 : 0.76,
    roughness: 0.15,
  });
  const screenMat = new THREE.MeshBasicMaterial({
    color: isLocked ? 0x64748b : 0x7ef9ff,
    transparent: true,
    opacity: isLocked ? 0.22 : 0.56,
    side: THREE.DoubleSide,
  });

  const base = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.014, 0.28), baseMat);
  laptop.add(base);

  const lid = new THREE.Mesh(new THREE.PlaneGeometry(0.41, 0.25), screenMat);
  lid.position.set(0, 0.115, 0.125);
  lid.rotation.x = -0.32;
  laptop.add(lid);

  const keyGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.36, 0.18),
    new THREE.MeshBasicMaterial({
      color: accentColor,
      transparent: true,
      opacity: isLocked ? 0.15 : 0.42,
    })
  );
  keyGlow.rotation.x = -Math.PI / 2;
  keyGlow.position.set(0, 0.009, -0.01);
  laptop.add(keyGlow);

  return laptop;
}

/** Dựng nhân viên AI Hologram chuẩn thẩm mỹ ảnh Hero */
export function buildHologramAvatar(bot: Office3DBot): HologramAvatarRig {
  const root = new THREE.Group();
  root.userData.botId = bot.id;

  const accent = new THREE.Color(bot.isLocked ? '#64748b' : bot.accentHex || '#00f5ff');
  const brightCyan = new THREE.Color(bot.isLocked ? '#94a3b8' : '#8efbff');

  const isFemale = bot.avatarStyle === 'female';
  const isManager = bot.screenKind === 'manager';

  // Executive chair
  const chair = buildExecutiveChair(accent, bot.isLocked);
  root.add(chair);

  // Translucent cyan holographic android materials
  const holoShellMat = new THREE.MeshPhysicalMaterial({
    color: bot.isLocked ? 0x334155 : 0x38e8ff,
    emissive: bot.isLocked ? 0x0f172a : accent,
    emissiveIntensity: bot.isLocked ? 0.18 : bot.isActive ? 0.72 : 0.34,
    roughness: 0.14,
    metalness: 0.28,
    transmission: 0.18,
    transparent: true,
    opacity: bot.isLocked ? 0.34 : bot.isActive ? 0.84 : 0.56,
  });

  const holoInnerMat = new THREE.MeshStandardMaterial({
    color: bot.isLocked ? 0x1e293b : 0x073452,
    emissive: bot.isLocked ? 0x09101c : accent,
    emissiveIntensity: bot.isLocked ? 0.1 : 0.5,
    roughness: 0.22,
    metalness: 0.55,
    transparent: true,
    opacity: bot.isLocked ? 0.38 : 0.88,
  });

  const wireMat = new THREE.MeshBasicMaterial({
    color: brightCyan,
    wireframe: true,
    transparent: true,
    opacity: bot.isLocked ? 0.12 : bot.isActive ? 0.28 : 0.16,
  });

  const glowMat = new THREE.MeshBasicMaterial({
    color: brightCyan,
    transparent: true,
    opacity: bot.isLocked ? 0.25 : 0.96,
  });

  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  // Pelvis & seated thighs
  const pelvis = new THREE.Mesh(
    new THREE.CylinderGeometry(isFemale ? 0.15 : 0.175, isFemale ? 0.17 : 0.16, 0.14, 16),
    holoInnerMat
  );
  pelvis.position.set(0, 0.57, 0.02);
  bodyGroup.add(pelvis);

  [-1, 1].forEach((side) => {
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.062, 0.25, 6, 10), holoShellMat);
    thigh.rotation.x = Math.PI / 2;
    thigh.position.set(side * 0.11, 0.56, 0.21);
    bodyGroup.add(thigh);

    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.3, 6, 10), holoInnerMat);
    shin.position.set(side * 0.11, 0.29, 0.35);
    bodyGroup.add(shin);
  });

  // Sculpted torso / chest armor
  const chest = new THREE.Group();
  chest.position.set(0, 0.72, 0.01);
  bodyGroup.add(chest);

  const topR = isManager ? 0.23 : isFemale ? 0.175 : 0.21;
  const botR = isFemale ? 0.125 : 0.155;
  const torsoMesh = new THREE.Mesh(new THREE.CylinderGeometry(topR, botR, 0.44, 18), holoShellMat);
  torsoMesh.position.y = 0.22;
  chest.add(torsoMesh);

  const torsoWire = new THREE.Mesh(
    new THREE.CylinderGeometry(topR + 0.008, botR + 0.008, 0.45, 12),
    wireMat
  );
  torsoWire.position.y = 0.22;
  chest.add(torsoWire);

  // Sleek cybernetic collar / shoulder plate
  const collar = new THREE.Mesh(new THREE.TorusGeometry(isFemale ? 0.11 : 0.125, 0.014, 8, 22), glowMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0, 0.44, 0.01);
  chest.add(collar);

  // Signature glowing chest energy core ring (straight from reference image!)
  const coreRing = new THREE.Mesh(new THREE.TorusGeometry(0.056, 0.011, 10, 26), glowMat);
  coreRing.position.set(0, 0.27, topR - 0.01);
  chest.add(coreRing);

  const coreDot = new THREE.Mesh(new THREE.SphereGeometry(0.024, 12, 12), glowMat);
  coreDot.position.set(0, 0.27, topR - 0.015);
  chest.add(coreDot);

  // Sculpted neck + android head + signature glowing ear-headset rings
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.062, 0.11, 12), holoInnerMat);
  neck.position.set(0, 0.49, 0.01);
  chest.add(neck);

  const head = new THREE.Group();
  head.position.set(0, 0.65, 0.02);
  chest.add(head);

  const cranium = new THREE.Mesh(
    new THREE.SphereGeometry(isFemale ? 0.132 : 0.14, 22, 18),
    holoShellMat
  );
  cranium.scale.set(0.92, 1.08, 0.98);
  head.add(cranium);

  const headWire = new THREE.Mesh(
    new THREE.SphereGeometry(isFemale ? 0.136 : 0.144, 12, 10),
    wireMat
  );
  headWire.scale.set(0.92, 1.08, 0.98);
  head.add(headWire);

  // Glowing holographic eyes / visor gleam
  [-1, 1].forEach((side) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 10), glowMat);
    eye.scale.set(1.3, 0.7, 0.7);
    eye.position.set(side * 0.044, 0.015, 0.125);
    head.add(eye);
  });

  // Signature glowing circular cybernetic headset ring on each ear (from reference photo!)
  [-1, 1].forEach((side) => {
    const earRing = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.0085, 8, 22), glowMat);
    earRing.rotation.y = Math.PI / 2;
    earRing.position.set(side * 0.126, 0.005, 0.0);
    head.add(earRing);

    const earCap = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.018, 14), holoInnerMat);
    earCap.rotation.z = Math.PI / 2;
    earCap.position.set(side * 0.122, 0.005, 0.0);
    head.add(earCap);
  });

  // Articulated arms (left & right shoulders + elbows + hands)
  const shoulderX = topR + 0.035;
  const buildArm = (side: -1 | 1) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * shoulderX, 0.39, 0.01);

    const pauldron = new THREE.Mesh(new THREE.SphereGeometry(0.068, 14, 12), holoShellMat);
    shoulder.add(pauldron);

    const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.043, 0.21, 6, 10), holoShellMat);
    upperArm.position.set(0, -0.14, 0.02);
    shoulder.add(upperArm);

    const elbow = new THREE.Group();
    elbow.position.set(0, -0.27, 0.03);
    shoulder.add(elbow);

    const elbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 10), holoInnerMat);
    elbow.add(elbowJoint);

    const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.036, 0.21, 6, 10), holoShellMat);
    forearm.rotation.x = Math.PI / 2.2;
    forearm.position.set(0, -0.02, 0.13);
    elbow.add(forearm);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 10), glowMat);
    hand.scale.set(0.95, 0.65, 1.25);
    hand.position.set(0, -0.02, 0.27);
    elbow.add(hand);

    chest.add(shoulder);
    return { shoulder, elbow };
  };

  const leftArm = buildArm(-1);
  const rightArm = buildArm(1);

  // Tabletop Hologram Laptop for Engineer / Manager / Commerce / Researcher
  if (
    bot.screenKind === 'code' ||
    bot.screenKind === 'manager' ||
    bot.screenKind === 'commerce' ||
    bot.screenKind === 'researcher'
  ) {
    const laptop = buildHoloLaptop(accent, bot.isLocked);
    laptop.position.set(0, 0.81, 0.66);
    root.add(laptop);
  }

  // Optional 3D floating role emblem orbiting gently next to HUD
  let floatingProp: THREE.Object3D | undefined;
  if (bot.screenKind === 'researcher' && !bot.isLocked) {
    const atom = new THREE.Group();
    [0, Math.PI / 3, (2 * Math.PI) / 3].forEach((rot) => {
      const orbit = new THREE.Mesh(
        new THREE.TorusGeometry(0.11, 0.006, 6, 24),
        new THREE.MeshBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0.72 })
      );
      orbit.rotation.set(rot, rot * 0.6, 0);
      atom.add(orbit);
    });
    atom.position.set(-0.52, 1.48, 0.34);
    root.add(atom);
    floatingProp = atom;
  } else if (bot.screenKind === 'support' && !bot.isLocked) {
    const commRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.085, 0.01, 8, 22),
      new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.78 })
    );
    commRing.position.set(0.52, 1.46, 0.34);
    root.add(commRing);
    floatingProp = commRing;
  }

  // Floating role-specific 3D holographic data screen hovering beside/front-right of bot
  const screenTex = createHologramPanelTexture(
    bot.screenKind,
    bot.isLocked ? '#64748b' : bot.accentHex || '#00f5ff',
    bot.roleBadge,
    bot.name
  );
  const screenMaterial = new THREE.MeshBasicMaterial({
    map: screenTex,
    transparent: true,
    opacity: bot.isLocked ? 0.26 : bot.isActive ? 0.92 : 0.56,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const holoScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.56), screenMaterial);
  holoScreen.position.set(isManager ? 0.0 : 0.42, 1.38, 0.46);
  holoScreen.rotation.y = isManager ? 0 : -0.26;
  root.add(holoScreen);

  // Glowing floor department aura ring under each bot's chair
  const auraRing = new THREE.Mesh(
    new THREE.RingGeometry(0.4, 0.48, 36),
    new THREE.MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: bot.isLocked ? 0.16 : bot.isActive ? 0.68 : 0.28,
      side: THREE.DoubleSide,
    })
  );
  auraRing.rotation.x = -Math.PI / 2;
  auraRing.position.set(0, 0.015, 0.02);
  root.add(auraRing);

  // Invisible hit volume for smooth raycast clicking
  const hitTarget = new THREE.Mesh(
    new THREE.CylinderGeometry(0.46, 0.46, 1.75, 10),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitTarget.position.set(0, 0.9, 0.14);
  hitTarget.userData.botId = bot.id;
  root.add(hitTarget);

  const disposeTextures = () => {
    screenTex.dispose();
  };

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
    floatingProp,
    hitTarget,
    duty: bot.duty,
    disposeTextures,
  };
}

/** Chuyển động mượt theo Duty State Machine 5 mức (meeting / a2a / desk / review / idle) */
export function animateHologramAvatar(
  rig: HologramAvatarRig,
  elapsed: number,
  phase: number,
  isSelected: boolean,
  isActive: boolean,
  isLocked: boolean
): void {
  const t = elapsed + phase;
  const duty = rig.duty;

  // Breathing motion
  const breathSpeed = duty === 'idle' ? 1.1 : 2.1;
  rig.chest.position.y = 0.72 + Math.sin(t * breathSpeed) * 0.01;

  // Head motion by duty
  if (duty === 'meeting') {
    rig.head.rotation.y = Math.sin(t * 1.45) * 0.24;
    rig.head.rotation.x = Math.sin(t * 2.1) * 0.07;
  } else if (duty === 'a2a') {
    rig.head.rotation.y = Math.sin(t * 2.4) * 0.3;
    rig.head.rotation.x = -0.04;
  } else if (duty === 'review') {
    rig.head.rotation.y = Math.sin(t * 1.1) * 0.28;
    rig.head.rotation.x = 0.1;
  } else if (duty === 'desk') {
    rig.head.rotation.y = Math.sin(t * 0.75) * 0.14;
    rig.head.rotation.x = 0.08 + Math.sin(t * 1.5) * 0.03;
  } else {
    rig.head.rotation.y = Math.sin(t * 0.4) * 0.08;
    rig.head.rotation.x = 0.02;
  }

  // Arm gestures by duty
  if (isActive && !isLocked) {
    if (duty === 'meeting' || duty === 'a2a') {
      // Expressive hand presentation gesture (like AI Marketer & AI Customer Support in reference image!)
      rig.leftShoulder.rotation.x = -0.34 + Math.sin(t * 2.2) * 0.14;
      rig.rightShoulder.rotation.x = -0.42 + Math.cos(t * 2.0) * 0.16;
      rig.leftShoulder.rotation.z = 0.12;
      rig.rightShoulder.rotation.z = -0.14;
      rig.leftElbow.rotation.x = -0.25 + Math.sin(t * 2.6) * 0.1;
      rig.rightElbow.rotation.x = -0.3 + Math.cos(t * 2.3) * 0.12;
    } else if (duty === 'desk' || duty === 'review') {
      // Typing / working on hologram laptop
      rig.leftShoulder.rotation.x = -0.26 + Math.sin(t * 4.2) * 0.05;
      rig.rightShoulder.rotation.x = -0.26 + Math.cos(t * 4.5) * 0.05;
      rig.leftShoulder.rotation.z = 0.04;
      rig.rightShoulder.rotation.z = -0.04;
      rig.leftElbow.rotation.x = -0.2 + Math.sin(t * 5.2) * 0.06;
      rig.rightElbow.rotation.x = -0.2 + Math.cos(t * 5.5) * 0.06;
    } else {
      // Idle relaxed posture (0 token)
      rig.leftShoulder.rotation.x = -0.12;
      rig.rightShoulder.rotation.x = -0.12;
      rig.leftShoulder.rotation.z = 0.03;
      rig.rightShoulder.rotation.z = -0.03;
      rig.leftElbow.rotation.x = -0.08;
      rig.rightElbow.rotation.x = -0.08;
    }
  } else {
    rig.leftShoulder.rotation.x = -0.1;
    rig.rightShoulder.rotation.x = -0.1;
    rig.leftElbow.rotation.x = -0.06;
    rig.rightElbow.rotation.x = -0.06;
  }

  // Holographic panel gentle levitation
  rig.holoScreen.position.y = 1.38 + Math.sin(t * 1.7) * 0.028;

  // Orbiting 3D role prop
  if (rig.floatingProp) {
    rig.floatingProp.rotation.y = t * 0.9;
    rig.floatingProp.position.y = 1.48 + Math.sin(t * 2.1) * 0.035;
  }

  // Chest reactor core pulse
  const coreScale = 1 + Math.sin(t * (duty === 'idle' ? 1.4 : 3.6)) * 0.09;
  rig.coreRing.scale.setScalar(coreScale);

  // Floor aura ring selection/duty feedback
  const auraMat = rig.auraRing.material as THREE.MeshBasicMaterial;
  if (isSelected) {
    rig.auraRing.scale.setScalar(1.16 + Math.sin(t * 5) * 0.06);
    auraMat.opacity = 0.95;
  } else if (duty === 'meeting' || duty === 'a2a') {
    rig.auraRing.scale.setScalar(1.06 + Math.sin(t * 3.2) * 0.04);
    auraMat.opacity = 0.78;
  } else {
    rig.auraRing.scale.setScalar(1);
    auraMat.opacity = isLocked ? 0.16 : isActive ? (duty === 'idle' ? 0.34 : 0.58) : 0.24;
  }
}
