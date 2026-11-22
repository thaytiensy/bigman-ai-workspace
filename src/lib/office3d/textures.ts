/**
 * Procedural Canvas Textures cho Văn Phòng 3D Hologram "Tổ Chức Nhân Viên AI".
 * Thiết kế theo nguyên lý zero-binary procedural canvas của Hermes Virtual Office (MIT),
 * reskin hoàn toàn sang phong cách văn phòng kính cao tầng đêm tông xanh cyan hologram.
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

/** Sàn đá obsidian tối bóng có vân phản chiếu nhẹ kiểu cao ốc hiện đại */
export function createObsidianFloorTexture(): THREE.CanvasTexture {
  const [cv, c] = makeCanvas(512, 512);
  const grad = c.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#071322');
  grad.addColorStop(0.5, '#0b1c30');
  grad.addColorStop(1, '#06101d');
  c.fillStyle = grad;
  c.fillRect(0, 0, 512, 512);

  // Subtle architectural tile joints
  c.strokeStyle = 'rgba(56, 189, 248, 0.14)';
  c.lineWidth = 2;
  c.strokeRect(1, 1, 510, 510);
  c.beginPath();
  c.moveTo(256, 0);
  c.lineTo(256, 512);
  c.moveTo(0, 256);
  c.lineTo(512, 256);
  c.stroke();

  // Soft cyan reflection specks
  c.fillStyle = 'rgba(34, 211, 238, 0.04)';
  for (let i = 0; i < 18; i++) {
    const x = ((i * 97) % 480) + 16;
    const y = ((i * 173) % 480) + 16;
    c.beginPath();
    c.arc(x, y, 18 + (i % 5) * 6, 0, Math.PI * 2);
    c.fill();
  }
  return finalizeTexture(cv, 6, 6);
}

/** Biển tường nổi phát sáng: "TỔ CHỨC NHÂN VIÊN AI / SOLUTIONS" */
export function createBrandWallSignTexture(): THREE.CanvasTexture {
  const [cv, c] = makeCanvas(1024, 420);
  c.clearRect(0, 0, 1024, 420);

  // Subtle radial cyan ambient behind text
  const glow = c.createRadialGradient(540, 200, 30, 540, 200, 420);
  glow.addColorStop(0, 'rgba(0, 240, 255, 0.18)');
  glow.addColorStop(0.6, 'rgba(6, 182, 212, 0.05)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  c.fillStyle = glow;
  c.fillRect(0, 0, 1024, 420);

  // Line 1: TỔ CHỨC
  c.textAlign = 'left';
  c.textBaseline = 'middle';
  c.font = '800 108px "Segoe UI", system-ui, -apple-system, sans-serif';
  c.fillStyle = '#f0f9ff';
  c.shadowColor = 'rgba(56, 189, 248, 0.75)';
  c.shadowBlur = 22;
  c.fillText('TỔ CHỨC', 78, 120);

  // Line 2: NHÂN VIÊN
  c.font = '800 102px "Segoe UI", system-ui, -apple-system, sans-serif';
  c.fillStyle = '#e0f2fe';
  c.shadowColor = 'rgba(56, 189, 248, 0.65)';
  c.shadowBlur = 18;
  c.fillText('NHÂN VIÊN', 78, 238);

  // Glowing cyan AI badge next to NHÂN VIÊN
  c.font = '900 156px "Segoe UI", system-ui, -apple-system, sans-serif';
  c.fillStyle = '#00f5ff';
  c.shadowColor = '#00e5ff';
  c.shadowBlur = 34;
  c.fillText('AI', 662, 224);

  // Subtitle: S O L U T I O N S
  c.shadowColor = 'rgba(34, 211, 238, 0.6)';
  c.shadowBlur = 12;
  c.font = '600 34px "Segoe UI", system-ui, sans-serif';
  c.fillStyle = '#67e8f9';
  const letters = 'SOLUTIONS'.split('').join('   ');
  c.fillText(letters, 180, 336);

  return finalizeTexture(cv);
}

/** Mặt bàn họp tròn hologram trung tâm nổi chữ "TỔ CHỨC NHÂN VIÊN AI" + vòng dữ liệu */
export function createHologramTableTexture(): THREE.CanvasTexture {
  const size = 1024;
  const cx = size / 2;
  const cy = size / 2;
  const [cv, c] = makeCanvas(size, size);

  // Deep glassy dark navy base
  const bg = c.createRadialGradient(cx, cy, 40, cx, cy, 512);
  bg.addColorStop(0, '#072a40');
  bg.addColorStop(0.45, '#041b2d');
  bg.addColorStop(0.86, '#031222');
  bg.addColorStop(1, '#020b16');
  c.fillStyle = bg;
  c.fillRect(0, 0, size, size);

  // Concentric glowing cyan rings
  const ringRadii = [492, 466, 378, 250, 230, 178];
  ringRadii.forEach((r, idx) => {
    c.beginPath();
    c.arc(cx, cy, r, 0, Math.PI * 2);
    c.strokeStyle =
      idx === 0 || idx === 3
        ? 'rgba(0, 245, 255, 0.92)'
        : 'rgba(56, 189, 248, 0.42)';
    c.lineWidth = idx === 0 ? 7 : idx === 3 ? 4 : 2;
    c.shadowColor = '#00f0ff';
    c.shadowBlur = idx === 0 || idx === 3 ? 16 : 6;
    c.stroke();
  });
  c.shadowBlur = 0;

  // Radial sector dividers & tick marks
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const inner = i % 6 === 0 ? 360 : 450;
    const outer = 466;
    c.strokeStyle = i % 6 === 0 ? 'rgba(0, 245, 255, 0.65)' : 'rgba(56, 189, 248, 0.25)';
    c.lineWidth = i % 6 === 0 ? 2.5 : 1.2;
    c.beginPath();
    c.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
    c.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
    c.stroke();
  }

  // Holographic mini charts embedded around the outer ring sectors
  for (let s = 0; s < 6; s++) {
    const angle = (s / 6) * Math.PI * 2 + Math.PI / 12;
    const rx = cx + Math.cos(angle) * 320;
    const ry = cy + Math.sin(angle) * 320;
    c.save();
    c.translate(rx, ry);
    c.rotate(angle + Math.PI / 2);

    // Mini HUD card frame
    c.fillStyle = 'rgba(0, 229, 255, 0.08)';
    c.strokeStyle = 'rgba(34, 211, 238, 0.55)';
    c.lineWidth = 2;
    c.fillRect(-74, -36, 148, 72);
    c.strokeRect(-74, -36, 148, 72);

    if (s % 3 === 0) {
      // Bar chart
      for (let b = 0; b < 8; b++) {
        const h = 14 + ((b * 17 + s * 11) % 36);
        c.fillStyle = b % 2 === 0 ? '#00f5ff' : '#38bdf8';
        c.fillRect(-58 + b * 15, 24 - h, 9, h);
      }
    } else if (s % 3 === 1) {
      // Line wave chart
      c.strokeStyle = '#00f5ff';
      c.lineWidth = 3;
      c.beginPath();
      for (let p = 0; p <= 8; p++) {
        const px = -60 + p * 15;
        const py = Math.sin(p * 0.9 + s) * 16;
        if (p === 0) c.moveTo(px, py);
        else c.lineTo(px, py);
      }
      c.stroke();
    } else {
      // Radar / donut gauge
      c.beginPath();
      c.arc(-28, 0, 22, 0, Math.PI * 1.55);
      c.strokeStyle = '#00f5ff';
      c.lineWidth = 6;
      c.stroke();
      c.fillStyle = '#bae6fd';
      c.font = '700 14px monospace';
      c.fillText('98.4%', 8, 5);
    }
    c.restore();
  }

  // Center glowing title: TỔ CHỨC NHÂN VIÊN AI
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.shadowColor = '#00f5ff';
  c.shadowBlur = 24;
  c.fillStyle = '#f0f9ff';
  c.font = '800 50px "Segoe UI", system-ui, sans-serif';
  c.fillText('TỔ CHỨC', cx, cy - 30);

  c.font = '800 44px "Segoe UI", system-ui, sans-serif';
  c.fillStyle = '#e0f2fe';
  c.fillText('NHÂN VIÊN', cx - 36, cy + 28);

  c.fillStyle = '#00f5ff';
  c.font = '900 56px "Segoe UI", system-ui, sans-serif';
  c.fillText('AI', cx + 116, cy + 26);

  c.shadowBlur = 0;
  c.fillStyle = 'rgba(103, 232, 249, 0.8)';
  c.font = '600 16px monospace';
  c.fillText('MULTI-BOT HOLOGRAM COMMAND CORE', cx, cy + 80);

  return finalizeTexture(cv);
}

/** Màn hình hologram dữ liệu 3D lơ lửng theo từng vai trò nhân viên AI */
export function createHologramPanelTexture(
  kind: HologramScreenKind,
  accentHex = '#00f5ff',
  title = 'AI DATA'
): THREE.CanvasTexture {
  const [cv, c] = makeCanvas(512, 340);

  // Translucent cyan holographic glass backdrop
  const grad = c.createLinearGradient(0, 0, 512, 340);
  grad.addColorStop(0, 'rgba(4, 34, 58, 0.78)');
  grad.addColorStop(1, 'rgba(2, 18, 36, 0.86)');
  c.fillStyle = grad;
  c.fillRect(0, 0, 512, 340);

  // Scanline texture
  c.fillStyle = 'rgba(0, 245, 255, 0.04)';
  for (let y = 0; y < 340; y += 6) {
    c.fillRect(0, y, 512, 2);
  }

  // Neon HUD border + corner brackets
  c.strokeStyle = accentHex;
  c.lineWidth = 3;
  c.strokeRect(8, 8, 496, 324);

  // Header bar
  c.fillStyle = 'rgba(0, 245, 255, 0.14)';
  c.fillRect(8, 8, 496, 44);
  c.fillStyle = '#e0f2fe';
  c.font = '700 20px "Segoe UI", monospace';
  c.fillText(title.toUpperCase().slice(0, 28), 24, 37);

  // Live indicator dots
  c.fillStyle = accentHex;
  c.beginPath();
  c.arc(478, 30, 7, 0, Math.PI * 2);
  c.fill();

  if (kind === 'marketer' || kind === 'commerce') {
    // Campaign Gain + upward trend + bar chart (giống ảnh mẫu bên trái)
    c.fillStyle = '#7dd3fc';
    c.font = '600 15px monospace';
    c.fillText('CAMPAIGN GAIN +148%   |   GMV LIVE', 26, 82);

    // Area chart
    c.beginPath();
    const pts = [200, 175, 182, 146, 154, 118, 126, 94];
    c.moveTo(30, 210);
    pts.forEach((py, i) => c.lineTo(30 + i * 62, py));
    c.lineTo(30 + (pts.length - 1) * 62, 210);
    c.closePath();
    c.fillStyle = 'rgba(0, 245, 255, 0.22)';
    c.fill();

    c.beginPath();
    pts.forEach((py, i) => {
      if (i === 0) c.moveTo(30 + i * 62, py);
      else c.lineTo(30 + i * 62, py);
    });
    c.strokeStyle = accentHex;
    c.lineWidth = 4;
    c.stroke();

    // Bottom bars
    for (let i = 0; i < 12; i++) {
      const h = 24 + ((i * 19) % 58);
      c.fillStyle = i % 3 === 0 ? '#00f5ff' : '#38bdf8';
      c.fillRect(30 + i * 38, 312 - h, 22, h);
    }
  } else if (kind === 'manager') {
    // Executive dashboard (giống ảnh mẫu ở giữa)
    c.strokeStyle = accentHex;
    c.lineWidth = 10;
    c.beginPath();
    c.arc(110, 165, 58, -Math.PI / 2, Math.PI * 1.15);
    c.stroke();
    c.fillStyle = '#f0f9ff';
    c.font = '800 28px monospace';
    c.fillText('96%', 82, 175);

    // Network nodes
    const nodes = [
      [250, 118],
      [340, 102],
      [430, 134],
      [290, 195],
      [400, 204],
    ];
    c.strokeStyle = 'rgba(56, 189, 248, 0.65)';
    c.lineWidth = 2;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        c.beginPath();
        c.moveTo(nodes[i][0], nodes[i][1]);
        c.lineTo(nodes[j][0], nodes[j][1]);
        c.stroke();
      }
    }
    nodes.forEach(([nx, ny]) => {
      c.fillStyle = '#00f5ff';
      c.beginPath();
      c.arc(nx, ny, 8, 0, Math.PI * 2);
      c.fill();
    });

    // Bottom KPI bars
    c.fillStyle = '#bae6fd';
    c.font = '600 15px monospace';
    c.fillText('MULTI-BOT ORCHESTRATION · 24/7 ONLINE', 28, 266);
    c.fillStyle = 'rgba(0, 245, 255, 0.2)';
    c.fillRect(28, 282, 456, 22);
    c.fillStyle = accentHex;
    c.fillRect(28, 282, 392, 22);
  } else if (kind === 'researcher') {
    // Atom orbit + data matrix (giống ảnh mẫu bên phải)
    c.save();
    c.translate(145, 185);
    c.strokeStyle = accentHex;
    c.lineWidth = 3;
    for (let r = 0; r < 3; r++) {
      c.save();
      c.rotate((r * Math.PI) / 3);
      c.beginPath();
      c.ellipse(0, 0, 82, 32, 0, 0, Math.PI * 2);
      c.stroke();
      c.restore();
    }
    c.fillStyle = '#00f5ff';
    c.beginPath();
    c.arc(0, 0, 12, 0, Math.PI * 2);
    c.fill();
    c.restore();

    // Right research metrics
    const labels = ['TREND SCORE  94.2', 'KOC MATCH    88.7', 'SEO INTENT   91.5', 'MARKET FIT   96.0'];
    labels.forEach((lbl, idx) => {
      const y = 104 + idx * 54;
      c.fillStyle = '#bae6fd';
      c.font = '600 16px monospace';
      c.fillText(lbl, 265, y);
      c.fillStyle = 'rgba(56, 189, 248, 0.22)';
      c.fillRect(265, y + 10, 210, 12);
      c.fillStyle = accentHex;
      c.fillRect(265, y + 10, 150 + idx * 14, 12);
    });
  } else if (kind === 'support') {
    // Chat bubbles + mail + hotline icons (giống ảnh mẫu CSKH)
    c.strokeStyle = accentHex;
    c.lineWidth = 3;
    // Bubble 1
    c.fillStyle = 'rgba(0, 245, 255, 0.16)';
    c.fillRect(34, 82, 250, 62);
    c.strokeRect(34, 82, 250, 62);
    c.fillStyle = '#e0f2fe';
    c.font = '600 16px monospace';
    c.fillText('ZALO / MESSENGER 24/7', 50, 118);

    // Bubble 2
    c.fillStyle = 'rgba(52, 211, 153, 0.18)';
    c.fillRect(190, 166, 286, 66);
    c.strokeRect(190, 166, 286, 66);
    c.fillStyle = '#a7f3d0';
    c.fillText('AUTO REPLY: < 1.8 SEC', 212, 205);

    // SLA bar
    c.fillStyle = '#7dd3fc';
    c.font = '700 18px monospace';
    c.fillText('CSAT 4.9/5.0   ·   CHỐT ĐƠN +62%', 34, 284);
  } else {
    // Code / Engineering terminal
    const lines = [
      '> sync_department("Kỹ Thuật & QA")',
      '  ✓ Next.js 15 + Three.js WebGL OK',
      '  ✓ Multi-bot Handoff Bus: ACTIVE',
      '  ✓ Tenant RLS Isolation: 100%',
      '> deploy("production-cloud-247")',
      '  ⚡ Latency: 28ms | Tests: PASS',
    ];
    c.font = '600 17px monospace';
    lines.forEach((ln, i) => {
      c.fillStyle = ln.startsWith('>') ? '#00f5ff' : ln.includes('✓') ? '#34d399' : '#bae6fd';
      c.fillText(ln, 26, 98 + i * 36);
    });
  }

  return finalizeTexture(cv);
}

/** Toàn cảnh đường chân trời thành phố đêm xanh cyan ngoài tường kính cao tầng */
export function createNightSkylineTexture(): THREE.CanvasTexture {
  const [cv, c] = makeCanvas(1024, 512);
  const sky = c.createLinearGradient(0, 0, 0, 512);
  sky.addColorStop(0, '#010712');
  sky.addColorStop(0.55, '#04162b');
  sky.addColorStop(1, '#082c46');
  c.fillStyle = sky;
  c.fillRect(0, 0, 1024, 512);

  // Distant cyan horizon glow
  const hz = c.createRadialGradient(512, 460, 40, 512, 460, 520);
  hz.addColorStop(0, 'rgba(0, 240, 255, 0.38)');
  hz.addColorStop(0.55, 'rgba(14, 116, 144, 0.16)');
  hz.addColorStop(1, 'rgba(0, 0, 0, 0)');
  c.fillStyle = hz;
  c.fillRect(0, 0, 1024, 512);

  // Skyscrapers silhouette + glowing windows
  let x = 12;
  let idx = 0;
  while (x < 1024) {
    const w = 36 + ((idx * 29) % 58);
    const h = 110 + ((idx * 83) % 280);
    const y = 512 - h;

    c.fillStyle = idx % 2 === 0 ? '#030f1e' : '#061a30';
    c.fillRect(x, y, w, h);

    // Glowing roof trim on tall towers
    if (h > 250) {
      c.fillStyle = '#00f0ff';
      c.fillRect(x, y, w, 3);
    }

    // Lit cyan/ice-blue skyscraper windows
    for (let wy = y + 14; wy < 495; wy += 16) {
      for (let wx = x + 6; wx < x + w - 8; wx += 11) {
        if ((wx * 7 + wy * 13 + idx) % 5 !== 0) {
          c.fillStyle =
            (wx + wy) % 3 === 0
              ? 'rgba(0, 245, 255, 0.52)'
              : 'rgba(186, 230, 253, 0.28)';
          c.fillRect(wx, wy, 5, 7);
        }
      }
    }

    x += w + 8 + ((idx * 11) % 14);
    idx++;
  }

  return finalizeTexture(cv);
}
