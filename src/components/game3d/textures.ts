import * as THREE from 'three';

/**
 * Procedural PBR Textures for WILDLANDS: The Lost Kingdom
 * 100% in-code generated (Zero 404 dependencies)
 */

export function createGrassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base lush forest green gradient
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#2d4a22');
  grad.addColorStop(0.5, '#3b5e2b');
  grad.addColorStop(1, '#253d1c');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Micro-blades & soil flecks
  for (let i = 0; i < 18000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const len = 3 + Math.random() * 6;
    const angle = (Math.random() - 0.5) * 0.8;
    ctx.strokeStyle = Math.random() > 0.4 ? 'rgba(74, 119, 52, 0.35)' : 'rgba(38, 59, 28, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.sin(angle) * len, y - Math.cos(angle) * len);
    ctx.stroke();
  }

  // Soft moss & earth patches
  for (let i = 0; i < 40; i++) {
    const cx = Math.random() * 512;
    const cy = Math.random() * 512;
    const r = 20 + Math.random() * 50;
    const patchGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
    patchGrad.addColorStop(0, 'rgba(92, 128, 64, 0.22)');
    patchGrad.addColorStop(0.7, 'rgba(60, 48, 32, 0.15)');
    patchGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = patchGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createAncientStoneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Weathered granite base
  ctx.fillStyle = '#4a4d4f';
  ctx.fillRect(0, 0, 512, 512);

  // Stone grain & pores
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 45;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Ancient cracks & weathered chisel lines
  ctx.strokeStyle = 'rgba(25, 27, 28, 0.55)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 18; i++) {
    let px = Math.random() * 512;
    let py = Math.random() * 512;
    ctx.beginPath();
    ctx.moveTo(px, py);
    for (let s = 0; s < 4; s++) {
      px += (Math.random() - 0.5) * 70;
      py += (Math.random() - 0.5) * 70;
      ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // Ancient green lichen patches
  for (let i = 0; i < 25; i++) {
    const lx = Math.random() * 512;
    const ly = Math.random() * 512;
    const lr = 15 + Math.random() * 35;
    const lGrad = ctx.createRadialGradient(lx, ly, 1, lx, ly, lr);
    lGrad.addColorStop(0, 'rgba(88, 120, 68, 0.45)');
    lGrad.addColorStop(0.8, 'rgba(62, 85, 48, 0.2)');
    lGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = lGrad;
    ctx.beginPath();
    ctx.arc(lx, ly, lr, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createRuneEmissiveTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 256, 256);

  // Glowing ancient arcane runes
  ctx.strokeStyle = '#f59e0b';
  ctx.shadowColor = '#fbbf24';
  ctx.shadowBlur = 12;
  ctx.lineWidth = 4;

  // Central solar crest
  ctx.beginPath();
  ctx.arc(128, 128, 48, 0, Math.PI * 2);
  ctx.stroke();

  // Geometric rays
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(128 + Math.cos(angle) * 52, 128 + Math.sin(angle) * 52);
    ctx.lineTo(128 + Math.cos(angle) * 85, 128 + Math.sin(angle) * 85);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
