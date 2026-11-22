/**
 * Procedural Canvas Textures cho Văn Phòng 3D Hologram "Tổ Chức Nhân Viên AI".
 * Thiết kế không cần file ảnh nặng (zero-binary), dựng sắc nét từng chi tiết theo đúng
 * thẩm mỹ ảnh Hero: tường mạch điện phát sáng cyan, biển hiệu "TỔ CHỨC NHÂN VIÊN AI / SOLUTIONS",
 * màn hình mạng neural & quả cầu hologram, mặt bàn họp tròn hologram có mô hình người wireframe,
 * cửa kính cao ốc đêm nhìn ra thành phố cyan và bộ HUD đặc thù từng vai trò nhân viên AI.
 */
import * as THREE from 'three';
import type { HologramScreenKind } from './types';

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext('2d')!;
  return [cv, ctx];
}

function finalizeTexture(cv: HTMLCanvasElement, repeatX = 1, repeatY = 1): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  if (repeatX > 1 || repeatY > 1) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
  }
  return tex;
}

/** Sàn đá obsidian tối bóng phản chiếu ánh sáng cyan kiểu văn phòng cao tầng */
export function createObsidianFloorTexture(): THREE.CanvasTexture {
  const [cv, c] = makeCanvas(512, 512);
  const grad = c.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#040d1a');
  grad.addColorStop(0.5, '#071729');
  grad.addColorStop(1, '#030a14');
  c.fillStyle = grad;
  c.fillRect(0, 0, 512, 512);

  // Subtle architectural glossy tile grid
  c.strokeStyle = 'rgba(34, 211, 238, 0.14)';
  c.lineWidth = 1.5;
  c.strokeRect(1, 1, 510, 510);
  c.beginPath();
  c.moveTo(256, 0);
  c.lineTo(256, 512);
  c.moveTo(0, 256);
  c.lineTo(512, 256);
  c.stroke();

  // Soft cyan specular reflections
  for (let i = 0; i < 16; i++) {
    const x = ((i * 97) % 480) + 16;
    const y = ((i * 173) % 480) + 16;
    const rg = c.createRadialGradient(x, y, 2, x, y, 34);
    rg.addColorStop(0, 'rgba(0, 245, 255, 0.05)');
    rg.addColorStop(1, 'rgba(0, 245, 255, 0)');
    c.fillStyle = rg;
    c.beginPath();
    c.arc(x, y, 34, 0, Math.PI * 2);
    c.fill();
  }
  return finalizeTexture(cv, 6, 6);
}

/** Tường tối khắc đường mạch điện cyan tinh tế giống bức tường bên trái ảnh mẫu */
export function createCircuitWallTexture(): THREE.CanvasTexture {
  const [cv, c] = makeCanvas(1024, 512);
  const bg = c.createLinearGradient(0, 0, 1024, 512);
  bg.addColorStop(0, '#040c18');
  bg.addColorStop(0.55, '#061526');
  bg.addColorStop(1, '#030b16');
  c.fillStyle = bg;
  c.fillRect(0, 0, 1024, 512);

  // Subtle architectural panel seams
  c.strokeStyle = 'rgba(56, 189, 248, 0.08)';
  c.lineWidth = 2;
  for (let x = 128; x < 1024; x += 128) {
    c.beginPath();
    c.moveTo(x, 0);
    c.lineTo(x, 512);
    c.stroke();
  }

  // Glowing cyan PCB circuit traces
  const traces: Array<Array<[number, number]>> = [
    [[40, 420], [180, 420], [230, 370], [340, 370]],
    [[70, 350], [150, 350], [195, 305], [290, 305]],
    [[110, 120], [220, 120], [260, 80], [410, 80]],
    [[640, 95], [760, 95], [810, 145], [960, 145]],
    [[680, 410], [800, 410], [845, 365], [980, 365]],
    [[20, 210], [95, 210], [135, 250], [240, 250]],
    [[780, 255], [860, 255], [900, 215], [1005, 215]],
  ];

  c.lineWidth = 2.2;
  traces.forEach((pts, idx) => {
    c.strokeStyle = idx % 2 === 0 ? 'rgba(0, 245, 255, 0.24)' : 'rgba(56, 189, 248, 0.16)';
    c.beginPath();
    pts.forEach(([px, py], i) => (i === 0 ? c.moveTo(px, py) : c.lineTo(px, py)));
    c.stroke();

    // Glowing terminal nodes
    const last = pts[pts.length - 1];
    c.fillStyle = 'rgba(103, 232, 249, 0.55)';
    c.beginPath();
    c.arc(last[0], last[1], 4.2, 0, Math.PI * 2);
    c.fill();
  });

  return finalizeTexture(cv);
}

/** Biển tường nổi phát sáng: "TỔ CHỨC NHÂN VIÊN AI / SOLUTIONS" chuẩn ảnh mẫu */
export function createBrandWallSignTexture(): THREE.CanvasTexture {
  const [cv, c] = makeCanvas(1280, 520);
  c.clearRect(0, 0, 1280, 520);

  const glow = c.createRadialGradient(690, 250, 40, 690, 250, 520);
  glow.addColorStop(0, 'rgba(0, 245, 255, 0.24)');
  glow.addColorStop(0.55, 'rgba(6, 182, 212, 0.08)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  c.fillStyle = glow;
  c.fillRect(0, 0, 1280, 520);

  c.textAlign = 'left';
  c.textBaseline = 'middle';

  // Line 1: TỔ CHỨC
  c.font = '800 132px "Segoe UI", system-ui, -apple-system, sans-serif';
  c.fillStyle = '#f8fafc';
  c.shadowColor = 'rgba(56, 189, 248, 0.8)';
  c.shadowBlur = 24;
  c.fillText('TỔ CHỨC', 88, 152);

  // Line 2: NHÂN VIÊN
  c.font = '800 124px "Segoe UI", system-ui, -apple-system, sans-serif';
  c.fillStyle = '#e0f2fe';
  c.shadowColor = 'rgba(56, 189, 248, 0.7)';
  c.shadowBlur = 20;
  c.fillText('NHÂN VIÊN', 88, 296);

  // Glowing cyan AI letters
  c.font = '900 198px "Segoe UI", system-ui, -apple-system, sans-serif';
  c.fillStyle = '#00f5ff';
  c.shadowColor = '#00e5ff';
  c.shadowBlur = 42;
  c.fillText('AI', 816, 282);

  // Subtitle: S O L U T I O N S
  c.shadowColor = 'rgba(34, 211, 238, 0.7)';
  c.shadowBlur = 14;
  c.font = '600 42px "Segoe UI", system-ui, sans-serif';
  c.fillStyle = '#67e8f9';
  c.fillText('SOLUTIONS'.split('').join('   '), 220, 422);

  return finalizeTexture(cv);
}

/** Màn hình tường dữ liệu lớn (trái: mạng neural & phân tích · giữa: quả cầu hologram) */
export function createWallMonitorTexture(kind: 'left_neural' | 'center_globe'): THREE.CanvasTexture {
  const [cv, c] = makeCanvas(512, 680);

  const bg = c.createLinearGradient(0, 0, 0, 680);
  bg.addColorStop(0, 'rgba(5, 28, 46, 0.94)');
  bg.addColorStop(1, 'rgba(3, 15, 29, 0.96)');
  c.fillStyle = bg;
  c.fillRect(0, 0, 512, 680);

  // Crisp glowing frame
  c.strokeStyle = 'rgba(0, 245, 255, 0.72)';
  c.lineWidth = 4;
  c.strokeRect(8, 8, 496, 664);

  // Header strip
  c.fillStyle = 'rgba(0, 245, 255, 0.14)';
  c.fillRect(10, 10, 492, 46);
  c.fillStyle = '#7ef9ff';
  c.font = '700 18px "Segoe UI", system-ui, sans-serif';
  c.fillText(
    kind === 'left_neural' ? 'NEURAL MATRIX · MULTI-AGENT CORE' : 'GLOBAL TELEMETRY · 24/7 CLOUD',
    26,
    39
  );

  if (kind === 'left_neural') {
    // Neural network mesh (top half)
    const nodes: Array<[number, number]> = [
      [110, 120], [210, 95], [320, 115], [415, 145],
      [145, 215], [255, 195], [360, 225],
      [115, 305], [235, 290], [345, 315], [425, 275],
    ];
    c.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    c.lineWidth = 1.6;
    nodes.forEach((a, i) => {
      nodes.forEach((b, j) => {
        if (j > i && Math.hypot(a[0] - b[0], a[1] - b[1]) < 155) {
          c.beginPath();
          c.moveTo(a[0], a[1]);
          c.lineTo(b[0], b[1]);
          c.stroke();
        }
      });
    });
    nodes.forEach(([nx, ny], i) => {
      c.fillStyle = i % 3 === 0 ? '#00f5ff' : '#7ef9ff';
      c.shadowColor = '#00f5ff';
      c.shadowBlur = 10;
      c.beginPath();
      c.arc(nx, ny, i % 3 === 0 ? 6 : 4, 0, Math.PI * 2);
      c.fill();
    });
    c.shadowBlur = 0;

    // Waveform + dual bar cards (bottom half)
    c.strokeStyle = 'rgba(0, 245, 255, 0.85)';
    c.lineWidth = 3;
    c.beginPath();
    for (let x = 32; x <= 480; x += 12) {
      const y = 415 + Math.sin(x * 0.04) * 32 + Math.cos(x * 0.09) * 14;
      if (x === 32) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.stroke();

    // Bottom metrics boxes
    for (let box = 0; box < 2; box++) {
      const bx = 28 + box * 234;
      c.fillStyle = 'rgba(6, 40, 64, 0.72)';
      c.fillRect(bx, 488, 220, 154);
      c.strokeStyle = 'rgba(56, 189, 248, 0.42)';
      c.lineWidth = 1.5;
      c.strokeRect(bx, 488, 220, 154);
      for (let i = 0; i < 6; i++) {
        const bh = 28 + ((i * 23 + box * 19) % 86);
        c.fillStyle = i % 2 === 0 ? 'rgba(0, 245, 255, 0.75)' : 'rgba(56, 189, 248, 0.55)';
        c.fillRect(bx + 18 + i * 31, 622 - bh, 18, bh);
      }
    }
  } else {
    // Wireframe hologram globe (top half)
    const gx = 256;
    const gy = 215;
    const gr = 122;
    const rg = c.createRadialGradient(gx, gy, 10, gx, gy, gr);
    rg.addColorStop(0, 'rgba(0, 245, 255, 0.25)');
    rg.addColorStop(1, 'rgba(0, 245, 255, 0.02)');
    c.fillStyle = rg;
    c.beginPath();
    c.arc(gx, gy, gr, 0, Math.PI * 2);
    c.fill();

    c.strokeStyle = 'rgba(0, 245, 255, 0.78)';
    c.lineWidth = 2;
    c.beginPath();
    c.arc(gx, gy, gr, 0, Math.PI * 2);
    c.stroke();

    for (let i = -3; i <= 3; i++) {
      const ry = Math.abs(i) * 26 + 18;
      c.strokeStyle = 'rgba(56, 189, 248, 0.36)';
      c.beginPath();
      c.ellipse(gx, gy, gr * Math.cos((i * Math.PI) / 9), gr, 0, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.ellipse(gx, gy, gr, ry * 0.45, 0, 0, Math.PI * 2);
      c.stroke();
    }

    // Orbit ring & glowing dots
    c.strokeStyle = 'rgba(103, 232, 249, 0.8)';
    c.beginPath();
    c.ellipse(gx, gy, 152, 42, -0.22, 0, Math.PI * 2);
    c.stroke();

    // Telemetry bars & status lines (bottom half)
    for (let row = 0; row < 5; row++) {
      const ry = 385 + row * 50;
      c.fillStyle = 'rgba(56, 189, 248, 0.14)';
      c.fillRect(30, ry, 452, 34);
      const pct = 0.48 + ((row * 17) % 45) / 100;
      c.fillStyle = row % 2 === 0 ? 'rgba(0, 245, 255, 0.72)' : 'rgba(52, 211, 153, 0.65)';
      c.fillRect(30, ry, 452 * pct, 34);
      c.fillStyle = '#e0f2fe';
      c.font = '600 14px "Segoe UI", system-ui, sans-serif';
      c.fillText(`NODE 0${row + 1} · ACTIVE`, 44, ry + 22);
    }
  }

  return finalizeTexture(cv);
}

/** Mặt bàn họp tròn hologram trung tâm chuẩn ảnh mẫu: 2 vòng neon + chữ nổi + biểu đồ rực rỡ */
export function createHologramTableTexture(): THREE.CanvasTexture {
  const size = 1024;
  const cx = size / 2;
  const cy = size / 2;
  const [cv, c] = makeCanvas(size, size);

  // Deep reflective sapphire glass base
  const bg = c.createRadialGradient(cx, cy, 35, cx, cy, 512);
  bg.addColorStop(0, '#093450');
  bg.addColorStop(0.42, '#052036');
  bg.addColorStop(0.84, '#031324');
  bg.addColorStop(1, '#020b16');
  c.fillStyle = bg;
  c.fillRect(0, 0, size, size);

  // Luminous concentric HUD rings
  const rings = [
    { r: 496, lw: 9, color: 'rgba(0, 245, 255, 0.96)', blur: 22 },
    { r: 472, lw: 4, color: 'rgba(103, 232, 249, 0.72)', blur: 10 },
    { r: 388, lw: 2.5, color: 'rgba(56, 189, 248, 0.45)', blur: 6 },
    { r: 256, lw: 5, color: 'rgba(0, 245, 255, 0.92)', blur: 18 },
    { r: 232, lw: 2, color: 'rgba(125, 211, 252, 0.48)', blur: 4 },
    { r: 176, lw: 2, color: 'rgba(56, 189, 248, 0.32)', blur: 2 },
  ];
  rings.forEach((ring) => {
    c.beginPath();
    c.arc(cx, cy, ring.r, 0, Math.PI * 2);
    c.strokeStyle = ring.color;
    c.lineWidth = ring.lw;
    c.shadowColor = '#00f5ff';
    c.shadowBlur = ring.blur;
    c.stroke();
  });
  c.shadowBlur = 0;

  // Radial divider spokes & precision dial ticks
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const major = i % 9 === 0;
    const r0 = major ? 256 : 454;
    const r1 = major ? 468 : 468;
    c.beginPath();
    c.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    c.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    c.strokeStyle = major ? 'rgba(0, 245, 255, 0.42)' : 'rgba(56, 189, 248, 0.28)';
    c.lineWidth = major ? 2 : 1.2;
    c.stroke();
  }

  // Vibrant holographic data panels along the outer ring (matching the reference table!)
  for (let s = 0; s < 8; s++) {
    const angle = (s / 8) * Math.PI * 2 + 0.16;
    c.save();
    c.translate(cx, cy);
    c.rotate(angle);

    // Translucent wedge panel
    c.fillStyle = 'rgba(0, 229, 255, 0.1)';
    c.strokeStyle = 'rgba(56, 189, 248, 0.48)';
    c.lineWidth = 1.6;
    c.fillRect(276, -54, 168, 108);
    c.strokeRect(276, -54, 168, 108);

    if (s % 3 === 0) {
      // Glowing multi-bar histogram
      for (let b = 0; b < 7; b++) {
        const bh = 22 + ((b * 19 + s * 13) % 64);
        c.fillStyle = b % 3 === 0 ? 'rgba(0, 245, 255, 0.88)' : b % 3 === 1 ? 'rgba(52, 211, 153, 0.78)' : 'rgba(129, 140, 248, 0.72)';
        c.fillRect(290 + b * 20, 42 - bh, 12, bh);
      }
    } else if (s % 3 === 1) {
      // Glowing radial pie / donut telemetry
      c.beginPath();
      c.arc(330, 0, 32, 0, Math.PI * 1.45);
      c.strokeStyle = '#00f5ff';
      c.lineWidth = 8;
      c.stroke();
      c.beginPath();
      c.arc(330, 0, 32, Math.PI * 1.5, Math.PI * 1.92);
      c.strokeStyle = '#34d399';
      c.lineWidth = 8;
      c.stroke();
      for (let r = 0; r < 4; r++) {
        c.fillStyle = 'rgba(125, 211, 252, 0.65)';
        c.fillRect(376, -32 + r * 18, 52 - r * 7, 7);
      }
    } else {
      // Smooth neon area trend curve
      c.strokeStyle = '#00f5ff';
      c.lineWidth = 3;
      c.beginPath();
      for (let k = 0; k < 7; k++) {
        const px = 288 + k * 23;
        const py = 26 - ((k * 17 + s * 11) % 62);
        if (k === 0) c.moveTo(px, py);
        else c.lineTo(px, py);
      }
      c.stroke();
      c.strokeStyle = 'rgba(244, 114, 182, 0.75)';
      c.lineWidth = 2;
      c.beginPath();
      for (let k = 0; k < 7; k++) {
        const px = 288 + k * 23;
        const py = 32 - ((k * 29 + s * 7) % 44);
        if (k === 0) c.moveTo(px, py);
        else c.lineTo(px, py);
      }
      c.stroke();
    }
    c.restore();
  }

  // Center luminous brand emblem: "TỔ CHỨC NHÂN VIÊN AI"
  const centerGlow = c.createRadialGradient(cx, cy, 10, cx, cy, 215);
  centerGlow.addColorStop(0, 'rgba(0, 245, 255, 0.28)');
  centerGlow.addColorStop(0.65, 'rgba(6, 182, 212, 0.08)');
  centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  c.fillStyle = centerGlow;
  c.beginPath();
  c.arc(cx, cy, 215, 0, Math.PI * 2);
  c.fill();

  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillStyle = '#f8fafc';
  c.shadowColor = '#00f5ff';
  c.shadowBlur = 24;
  c.font = '900 54px "Segoe UI", system-ui, sans-serif';
  c.fillText('TỔ CHỨC', cx, cy - 34);
  c.font = '900 48px "Segoe UI", system-ui, sans-serif';
  c.fillStyle = '#e0f2fe';
  c.fillText('NHÂN VIÊN', cx - 34, cy + 28);
  c.fillStyle = '#00f5ff';
  c.font = '900 62px "Segoe UI", system-ui, sans-serif';
  c.fillText('AI', cx + 132, cy + 26);

  c.shadowBlur = 8;
  c.fillStyle = 'rgba(103, 232, 249, 0.9)';
  c.font = '700 18px "Segoe UI", system-ui, sans-serif';
  c.fillText('MULTI-AGENT HOLOGRAM HUB', cx, cy + 90);

  return finalizeTexture(cv);
}

/** Hình chiếu người hologram wireframe đứng nhỏ nổi trên mặt bàn họp (chi tiết đắt giá của ảnh mẫu!) */
export function createHologramFigureTexture(): THREE.CanvasTexture {
  const [cv, c] = makeCanvas(256, 384);
  c.clearRect(0, 0, 256, 384);

  const cx = 128;
  // Base light cone
  const cone = c.createLinearGradient(cx, 360, cx, 120);
  cone.addColorStop(0, 'rgba(0, 245, 255, 0.55)');
  cone.addColorStop(0.5, 'rgba(0, 245, 255, 0.16)');
  cone.addColorStop(1, 'rgba(0, 245, 255, 0)');
  c.fillStyle = cone;
  c.beginPath();
  c.moveTo(cx - 64, 365);
  c.lineTo(cx + 64, 365);
  c.lineTo(cx + 28, 90);
  c.lineTo(cx - 28, 90);
  c.closePath();
  c.fill();

  // Holographic humanoid silhouette wireframe
  c.strokeStyle = 'rgba(126, 249, 255, 0.95)';
  c.fillStyle = 'rgba(0, 245, 255, 0.34)';
  c.shadowColor = '#00f5ff';
  c.shadowBlur = 14;
  c.lineWidth = 2.4;

  // Head
  c.beginPath();
  c.arc(cx, 72, 22, 0, Math.PI * 2);
  c.fill();
  c.stroke();

  // Torso
  c.beginPath();
  c.moveTo(cx - 32, 108);
  c.lineTo(cx + 32, 108);
  c.lineTo(cx + 22, 210);
  c.lineTo(cx - 22, 210);
  c.closePath();
  c.fill();
  c.stroke();

  // Arms
  c.beginPath();
  c.moveTo(cx - 34, 114);
  c.lineTo(cx - 52, 198);
  c.moveTo(cx + 34, 114);
  c.lineTo(cx + 52, 198);
  c.stroke();

  // Legs
  c.beginPath();
  c.moveTo(cx - 16, 210);
  c.lineTo(cx - 20, 344);
  c.moveTo(cx + 16, 210);
  c.lineTo(cx + 20, 344);
  c.stroke();

  // Horizontal holographic scanlines across figure
  c.shadowBlur = 0;
  c.strokeStyle = 'rgba(224, 242, 254, 0.55)';
  c.lineWidth = 1;
  for (let y = 58; y < 348; y += 9) {
    c.beginPath();
    c.moveTo(cx - 42, y);
    c.lineTo(cx + 42, y);
    c.stroke();
  }

  return finalizeTexture(cv);
}

/** Khung cảnh đường chân trời thành phố cao tầng ban đêm ánh sáng xanh cyan qua cửa kính */
export function createNightSkylineTexture(): THREE.CanvasTexture {
  const [cv, c] = makeCanvas(1280, 560);

  const sky = c.createLinearGradient(0, 0, 0, 560);
  sky.addColorStop(0, '#020b18');
  sky.addColorStop(0.45, '#062038');
  sky.addColorStop(0.82, '#0a3a5c');
  sky.addColorStop(1, '#051a2e');
  c.fillStyle = sky;
  c.fillRect(0, 0, 1280, 560);

  // Ambient cyan city horizon glow
  const horizon = c.createRadialGradient(880, 440, 20, 880, 440, 460);
  horizon.addColorStop(0, 'rgba(0, 245, 255, 0.32)');
  horizon.addColorStop(0.5, 'rgba(14, 165, 233, 0.14)');
  horizon.addColorStop(1, 'rgba(0, 0, 0, 0)');
  c.fillStyle = horizon;
  c.fillRect(0, 0, 1280, 560);

  // Skyscrapers silhouette + glowing windows + cyan neon rooftop spires
  const buildings = [
    [18, 80, 220], [108, 96, 305], [216, 74, 245], [304, 114, 375],
    [432, 86, 290], [534, 120, 415], [668, 92, 330], [776, 134, 468],
    [926, 98, 365], [1040, 116, 430], [1168, 96, 310],
  ];

  buildings.forEach(([x, w, h], idx) => {
    const y = 560 - h;
    const bGrad = c.createLinearGradient(x, y, x, 560);
    bGrad.addColorStop(0, idx % 2 === 0 ? '#07243b' : '#092c47');
    bGrad.addColorStop(1, '#020d1a');
    c.fillStyle = bGrad;
    c.fillRect(x, y, w, h);

    // Neon cyan edge highlight on iconic towers
    c.strokeStyle = idx >= 6 ? 'rgba(0, 245, 255, 0.65)' : 'rgba(56, 189, 248, 0.36)';
    c.lineWidth = idx >= 6 ? 2.5 : 1.5;
    c.strokeRect(x, y, w, h);

    // Tall tower spire on right skyline (matching the lit spire in the reference image)
    if (idx === 7 || idx === 9) {
      c.beginPath();
      c.moveTo(x + w / 2, y);
      c.lineTo(x + w / 2, y - 52);
      c.strokeStyle = '#00f5ff';
      c.lineWidth = 3;
      c.stroke();
    }

    // Illuminated window matrix
    for (let wy = y + 14; wy < 546; wy += 13) {
      for (let wx = x + 9; wx < x + w - 12; wx += 12) {
        const hash = (wx * 31 + wy * 17 + idx * 13) % 10;
        if (hash > 3) {
          c.fillStyle =
            hash > 7
              ? 'rgba(126, 249, 255, 0.82)'
              : hash > 5
                ? 'rgba(56, 189, 248, 0.45)'
                : 'rgba(186, 230, 253, 0.22)';
          c.fillRect(wx, wy, 6, 5);
        }
      }
    }
  });

  return finalizeTexture(cv);
}

/** Màn hình hologram dữ liệu nổi cạnh từng nhân viên AI (khớp từng vai trò trong ảnh mẫu) */
export function createHologramPanelTexture(
  kind: HologramScreenKind,
  accentHex: string,
  roleBadge: string,
  botName: string
): THREE.CanvasTexture {
  const [cv, c] = makeCanvas(512, 340);
  c.clearRect(0, 0, 512, 340);

  // Translucent cyan holographic glass backdrop
  const bg = c.createLinearGradient(0, 0, 512, 340);
  bg.addColorStop(0, 'rgba(6, 36, 58, 0.84)');
  bg.addColorStop(1, 'rgba(4, 22, 38, 0.72)');
  c.fillStyle = bg;
  c.fillRect(10, 10, 492, 320);

  // Neon outer border + corner brackets
  c.strokeStyle = accentHex;
  c.lineWidth = 3;
  c.shadowColor = accentHex;
  c.shadowBlur = 12;
  c.strokeRect(10, 10, 492, 320);
  c.shadowBlur = 0;

  // Top header bar
  c.fillStyle = 'rgba(0, 245, 255, 0.16)';
  c.fillRect(12, 12, 488, 46);
  c.fillStyle = '#e0f2fe';
  c.font = '700 20px "Segoe UI", system-ui, sans-serif';
  c.fillText(`${roleBadge.toUpperCase()} · ${botName}`, 24, 42);

  // Live pulse indicator
  c.fillStyle = '#34d399';
  c.beginPath();
  c.arc(476, 35, 6, 0, Math.PI * 2);
  c.fill();

  if (kind === 'marketer') {
    c.fillStyle = '#7ef9ff';
    c.font = '600 16px "Segoe UI", system-ui, sans-serif';
    c.fillText('Campaign Gain +142%', 26, 86);

    // Filled area growth line
    c.beginPath();
    c.moveTo(28, 198);
    const pts = [194, 178, 162, 170, 140, 126, 104, 88];
    pts.forEach((y, i) => c.lineTo(28 + i * 64, y));
    c.lineTo(476, 198);
    c.closePath();
    const fillG = c.createLinearGradient(0, 88, 0, 200);
    fillG.addColorStop(0, 'rgba(0, 245, 255, 0.36)');
    fillG.addColorStop(1, 'rgba(0, 245, 255, 0.02)');
    c.fillStyle = fillG;
    c.fill();

    c.strokeStyle = '#00f5ff';
    c.lineWidth = 3.5;
    c.beginPath();
    pts.forEach((y, i) => (i === 0 ? c.moveTo(28, y) : c.lineTo(28 + i * 64, y)));
    c.stroke();

    // Bottom bar chart
    for (let i = 0; i < 8; i++) {
      const h = 28 + ((i * 19 + 21) % 72);
      c.fillStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.8)' : 'rgba(52, 211, 153, 0.78)';
      c.fillRect(32 + i * 56, 306 - h, 34, h);
    }
  } else if (kind === 'code') {
    const lines = [
      'async function syncDepartmentPod() {',
      '  const duty = computeBotDuty(agent);',
      '  if (duty === "a2a") emitBeam(peer);',
      '  const res = await runByokStream();',
      '  verifyEvidence(res.diff, "QA_PASS");',
      '  return { status: 200, zeroLeak: true };',
      '}',
      '// CI v1.0.0: 0 errors · 100% pass',
    ];
    c.font = '600 17px Consolas, monospace';
    lines.forEach((line, i) => {
      c.fillStyle =
        i === 0 || i === 6
          ? '#67e8f9'
          : i === 7
            ? '#34d399'
            : i % 2 === 0
              ? '#bae6fd'
              : '#38bdf8';
      c.fillText(line, 26, 98 + i * 29);
    });
  } else if (kind === 'manager') {
    // 3 circular KPI gauges (matching AI Manager's screen in photo)
    const gauges = [
      { x: 100, label: 'SLA 99%', pct: 0.94, color: '#00f5ff' },
      { x: 256, label: 'TOKEN -74%', pct: 0.78, color: '#34d399' },
      { x: 412, label: 'SYNC 100%', pct: 0.98, color: '#38bdf8' },
    ];
    gauges.forEach((g) => {
      c.beginPath();
      c.arc(g.x, 146, 48, 0, Math.PI * 2);
      c.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      c.lineWidth = 10;
      c.stroke();

      c.beginPath();
      c.arc(g.x, 146, 48, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * g.pct);
      c.strokeStyle = g.color;
      c.lineWidth = 10;
      c.stroke();

      c.fillStyle = '#f8fafc';
      c.font = '700 15px "Segoe UI", system-ui, sans-serif';
      c.textAlign = 'center';
      c.fillText(g.label, g.x, 151);
    });
    c.textAlign = 'left';

    // Executive multi-column telemetry bars
    for (let i = 0; i < 12; i++) {
      const h = 24 + ((i * 23 + 17) % 68);
      c.fillStyle = i % 3 === 0 ? 'rgba(0, 245, 255, 0.82)' : 'rgba(56, 189, 248, 0.56)';
      c.fillRect(32 + i * 38, 308 - h, 24, h);
    }
  } else if (kind === 'researcher') {
    // Glowing Bohr atom orbit icon (left) — directly from reference photo!
    const ax = 135;
    const ay = 185;
    c.strokeStyle = '#00f5ff';
    c.lineWidth = 3;
    [0, Math.PI / 3, (2 * Math.PI) / 3].forEach((rot) => {
      c.save();
      c.translate(ax, ay);
      c.rotate(rot);
      c.beginPath();
      c.ellipse(0, 0, 74, 26, 0, 0, Math.PI * 2);
      c.stroke();
      c.restore();
    });
    c.fillStyle = '#7ef9ff';
    c.beginPath();
    c.arc(ax, ay, 10, 0, Math.PI * 2);
    c.fill();

    // Erlenmeyer research flask icon (right)
    c.strokeStyle = '#67e8f9';
    c.lineWidth = 3.5;
    c.beginPath();
    c.moveTo(352, 108);
    c.lineTo(352, 152);
    c.lineTo(312, 242);
    c.lineTo(428, 242);
    c.lineTo(388, 152);
    c.lineTo(388, 108);
    c.stroke();
    c.fillStyle = 'rgba(0, 245, 255, 0.38)';
    c.beginPath();
    c.moveTo(324, 212);
    c.lineTo(416, 212);
    c.lineTo(426, 240);
    c.lineTo(314, 240);
    c.closePath();
    c.fill();

    // Research telemetry footer
    c.fillStyle = '#bae6fd';
    c.font = '600 15px "Segoe UI", system-ui, sans-serif';
    c.fillText('KOC & MARKET DISCOVERY · 94.8% CONFIDENCE', 28, 298);
  } else if (kind === 'support') {
    // Chat bubbles + envelope + phone badges (matching AI Customer Support in reference photo!)
    // Large chat bubble
    c.fillStyle = 'rgba(0, 245, 255, 0.16)';
    c.strokeStyle = '#00f5ff';
    c.lineWidth = 3;
    c.fillRect(34, 86, 240, 104);
    c.strokeRect(34, 86, 240, 104);
    c.fillStyle = '#e0f2fe';
    c.fillRect(56, 114, 168, 10);
    c.fillRect(56, 138, 196, 10);
    c.fillRect(56, 162, 126, 10);

    // Mail envelope icon
    c.strokeStyle = '#67e8f9';
    c.strokeRect(314, 88, 154, 96);
    c.beginPath();
    c.moveTo(314, 88);
    c.lineTo(391, 144);
    c.lineTo(468, 88);
    c.stroke();

    // Secondary reply bubble + SLA meter
    c.fillStyle = 'rgba(52, 211, 153, 0.18)';
    c.strokeStyle = '#34d399';
    c.fillRect(190, 214, 278, 88);
    c.strokeRect(190, 214, 278, 88);
    c.fillStyle = '#a7f3d0';
    c.font = '700 18px "Segoe UI", system-ui, sans-serif';
    c.fillText('CSKH 24/7 · Phản hồi < 8s', 214, 252);
    c.font = '600 15px "Segoe UI", system-ui, sans-serif';
    c.fillText('Zalo & Inbox Auto-Sync ON', 214, 282);

    // Phone icon circle
    c.beginPath();
    c.arc(98, 258, 42, 0, Math.PI * 2);
    c.fillStyle = 'rgba(0, 245, 255, 0.18)';
    c.fill();
    c.strokeStyle = '#00f5ff';
    c.stroke();
    c.fillStyle = '#7ef9ff';
    c.font = '700 28px "Segoe UI", sans-serif';
    c.textAlign = 'center';
    c.fillText('☎', 98, 268);
    c.textAlign = 'left';
  } else {
    // Commerce / TikTok Shop GMV Flywheel
    c.fillStyle = '#34d399';
    c.font = '700 20px "Segoe UI", system-ui, sans-serif';
    c.fillText('GMV FLYWHEEL · +68% WoW', 28, 92);

    for (let i = 0; i < 6; i++) {
      const h = 38 + ((i * 27 + 25) % 92);
      c.fillStyle = i >= 4 ? 'rgba(52, 211, 153, 0.86)' : 'rgba(0, 245, 255, 0.72)';
      c.fillRect(36 + i * 74, 246 - h, 46, h);
    }
    c.fillStyle = '#bae6fd';
    c.font = '600 15px "Segoe UI", system-ui, sans-serif';
    c.fillText('CTR 4.2% · CR 3.8% · LDR 1.1% (AN TOÀN)', 28, 296);
  }

  return finalizeTexture(cv);
}
