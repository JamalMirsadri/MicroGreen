import React, { useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const PLANT_STAGES = [
  { step: 0, label: 'Seed',        glow: 'rgba(70,42,8,0.5)',    fog: 'rgba(40,22,4,0.6)',   particles: 3  },
  { step: 1, label: 'Germinating', glow: 'rgba(18,60,12,0.45)',  fog: 'rgba(8,24,4,0.55)',   particles: 6  },
  { step: 2, label: 'Sprouting',   glow: 'rgba(22,80,18,0.50)',  fog: 'rgba(6,20,4,0.52)',   particles: 10 },
  { step: 3, label: 'Growing',     glow: 'rgba(28,100,24,0.55)', fog: 'rgba(4,16,4,0.48)',   particles: 14 },
  { step: 4, label: 'Maturing',    glow: 'rgba(34,120,28,0.60)', fog: 'rgba(4,14,4,0.44)',   particles: 18 },
  { step: 5, label: 'Flourishing', glow: 'rgba(40,145,32,0.65)', fog: 'rgba(3,12,4,0.40)',   particles: 26 },
  { step: 6, label: 'Fully Grown', glow: 'rgba(50,170,40,0.72)', fog: 'rgba(2,10,3,0.35)',   particles: 34 },
];

const PARTICLE_DATA = Array.from({ length: 36 }, (_, i) => ({
  left:     6  + ((i * 43 + 17) % 88),
  bottom:   10 + ((i * 29 + 11) % 52),
  size:     1  + (i % 4) * 0.7,
  duration: 5  + (i % 6) * 1.3,
  delay:    (i % 9) * 0.4,
  dx:       ((i % 5) - 2) * 16,
  dy:       45  + (i % 5) * 22,
  opacity:  0.18 + (i % 4) * 0.1,
}));

// ── Colour palette derived from mood ─────────────────────────────────────────
function getPalette(mood) {
  const p = {
    energetic: { h: '#7ed640', m: '#4a9a18', d: '#1e5008', s: '#b8f060', t: 'rgba(140,230,60,0.12)'  },
    calm:      { h: '#3ec890', m: '#1a9060', d: '#0a5030', s: '#80f0c0', t: 'rgba(60,200,140,0.12)'  },
    focused:   { h: '#40c8a8', m: '#1a8870', d: '#0a4840', s: '#80f0e0', t: 'rgba(60,200,180,0.12)'  },
    stressed:  { h: '#a0c030', m: '#607010', d: '#303808', s: '#d0f050', t: 'rgba(160,200,40,0.12)'  },
    tired:     { h: '#78b030', m: '#3a6010', d: '#1a3008', s: '#a8d860', t: 'rgba(120,180,50,0.12)'  },
    default:   { h: '#58c848', m: '#28781a', d: '#0e4010', s: '#90e870', t: 'rgba(80,200,70,0.12)'   },
  };
  return p[mood] || p.default;
}

// ── Ease helpers ──────────────────────────────────────────────────────────────
const easeOut  = t => 1 - Math.pow(1 - t, 3);
const easeIn   = t => t * t * t;
const smoothStep = t => t * t * (3 - 2 * t);

// ── Deep photorealistic soil ──────────────────────────────────────────────────
function drawSoil(ctx, W, H, soilY) {
  // Multi-layer gradient — topsoil → subsoil
  const g = ctx.createLinearGradient(0, soilY - 8, 0, H);
  g.addColorStop(0,    'rgba(55,30,8,0)');
  g.addColorStop(0.08, '#3a1e08');
  g.addColorStop(0.25, '#261208');
  g.addColorStop(0.55, '#180c04');
  g.addColorStop(1,    '#0e0803');
  ctx.fillStyle = g;
  ctx.fillRect(0, soilY - 8, W, H - soilY + 8);

  // Soil aggregate pebbles — organic scatter
  const aggs = [
    {x:0.06,y:1,rx:5,ry:2.5,rot:0.1},{x:0.14,y:0,rx:3.5,ry:2,rot:-0.2},
    {x:0.22,y:2,rx:6,ry:2,rot:0.15}, {x:0.30,y:1,rx:4,ry:2.5,rot:-0.1},
    {x:0.39,y:0,rx:3,ry:1.8,rot:0.3},{x:0.46,y:2,rx:5.5,ry:2,rot:0.0},
    {x:0.54,y:1,rx:4,ry:2.2,rot:-0.25},{x:0.62,y:0,rx:6,ry:2.5,rot:0.2},
    {x:0.70,y:2,rx:3.5,ry:1.8,rot:0.1},{x:0.78,y:1,rx:5,ry:2,rot:-0.15},
    {x:0.86,y:0,rx:4.5,ry:2.2,rot:0.3},{x:0.93,y:2,rx:3,ry:1.5,rot:-0.1},
  ];
  aggs.forEach(({ x, y, rx, ry, rot }, i) => {
    const px = x * W; const py = soilY + 1 + y;
    const c = 42 + (i % 5) * 7;
    const cg = ctx.createRadialGradient(px - rx * 0.3, py - ry * 0.3, 0, px, py, rx);
    cg.addColorStop(0, `rgba(${c+20},${c-8},${c-20},0.7)`);
    cg.addColorStop(1, `rgba(${c-10},${c-18},${c-28},0.3)`);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = cg;
    ctx.fill();
    ctx.restore();
  });

  // Surface moisture sheen
  const sheen = ctx.createLinearGradient(0, soilY - 4, 0, soilY + 6);
  sheen.addColorStop(0, 'rgba(100,65,22,0.35)');
  sheen.addColorStop(0.5, 'rgba(60,35,10,0.12)');
  sheen.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, soilY - 4, W, 10);
}

// ── 3D-shaded organic leaf ────────────────────────────────────────────────────
function drawLeaf(ctx, bx, by, len, wid, angleDeg, t, pal, depthShade = 0) {
  if (t <= 0.02) return;
  const et = easeOut(t);
  const a   = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(a); const sin = Math.sin(a);

  // Leaf tip
  const tx = bx + cos * len * et;
  const ty = by + sin * len * et;

  // Perpendicular (determines blade width)
  const px = -sin; const py = cos;
  const hw = wid * et * 0.5;

  // Left & right blade bezier control points — asymmetric for organic look
  const mid = 0.52; // peak width position along midrib
  const lcp1x = bx + cos * len * 0.25 * et + px * hw * 1.15;
  const lcp1y = by + sin * len * 0.25 * et + py * hw * 1.15;
  const lcp2x = bx + cos * len * mid  * et + px * hw * 0.95;
  const lcp2y = by + sin * len * mid  * et + py * hw * 0.95;
  const rcp1x = bx + cos * len * 0.25 * et - px * hw * 0.75;
  const rcp1y = by + sin * len * 0.25 * et - py * hw * 0.75;
  const rcp2x = bx + cos * len * mid  * et - px * hw * 0.55;
  const rcp2y = by + sin * len * mid  * et - py * hw * 0.55;

  // ── Main leaf body — subsurface scattering simulation ──
  const shade = Math.max(0, Math.min(1, depthShade)); // 0=front 1=back
  const r0 = parseInt(pal.h.slice(1,3),16);
  const g0 = parseInt(pal.h.slice(3,5),16);
  const b0 = parseInt(pal.h.slice(5,7),16);
  const r1 = parseInt(pal.d.slice(1,3),16);
  const g1 = parseInt(pal.d.slice(3,5),16);
  const b1 = parseInt(pal.d.slice(5,7),16);

  // SSS: edges and underside are darker + slightly warmer
  const sssR = Math.round(r1 + (r0 - r1) * 0.5);
  const sssG = Math.round(g1 + (g0 - g1) * 0.6);
  const sssB = Math.round(b1 + (b0 - b1) * 0.35);

  // Gradient along length (base→tip) fades to shadow
  const lgrad = ctx.createLinearGradient(bx, by, tx, ty);
  lgrad.addColorStop(0,    `rgba(${r1},${g1},${b1},${0.9 - shade * 0.3})`);
  lgrad.addColorStop(0.28, `rgba(${r0},${g0},${b0},${0.97 - shade * 0.25})`);
  lgrad.addColorStop(0.58, `rgba(${sssR},${sssG},${sssB},${0.9 - shade * 0.2})`);
  lgrad.addColorStop(1,    `rgba(${r1},${g1},${b1},${0.7 - shade * 0.2})`);

  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.bezierCurveTo(lcp1x, lcp1y, lcp2x, lcp2y, tx, ty);
  ctx.bezierCurveTo(rcp2x, rcp2y, rcp1x, rcp1y, bx, by);
  ctx.fillStyle = lgrad;
  ctx.fill();

  // ── Ambient occlusion shadow at base ──
  const aoR = 6 * et;
  const ao = ctx.createRadialGradient(bx, by, 0, bx, by, aoR);
  ao.addColorStop(0,   'rgba(0,0,0,0.28)');
  ao.addColorStop(0.6, 'rgba(0,0,0,0.08)');
  ao.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.beginPath();
  ctx.ellipse(bx, by, aoR, aoR * 0.6, a, 0, Math.PI * 2);
  ctx.fillStyle = ao; ctx.fill();

  // ── Top-surface rim light (directional from upper-left) ──
  if (shade < 0.7) {
    const rimG = ctx.createLinearGradient(lcp1x, lcp1y, rcp1x, rcp1y);
    rimG.addColorStop(0,   `rgba(${Math.min(255,r0+40)},${Math.min(255,g0+30)},${Math.min(255,b0+10)},${0.22 * (1-shade)})`);
    rimG.addColorStop(0.5, `rgba(${Math.min(255,r0+20)},${Math.min(255,g0+15)},${Math.min(255,b0+5)},${0.10 * (1-shade)})`);
    rimG.addColorStop(1,   'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.bezierCurveTo(lcp1x, lcp1y, lcp2x, lcp2y, tx, ty);
    ctx.strokeStyle = rimG;
    ctx.lineWidth = 1.5 * et * (1 - shade);
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // ── Midrib vein ──
  const midMx = bx + cos * len * 0.5 * et + px * hw * 0.18;
  const midMy = by + sin * len * 0.5 * et + py * hw * 0.18;
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.quadraticCurveTo(midMx, midMy, tx, ty);
  ctx.strokeStyle = `rgba(${r1-10},${g1+5},${b1},${0.55 - shade * 0.2})`;
  ctx.lineWidth = Math.max(0.4, 0.9 * et - shade * 0.3);
  ctx.lineCap = 'round'; ctx.stroke();

  // ── Lateral veins (appear as leaf matures) ──
  if (t > 0.55) {
    const vt = smoothStep((t - 0.55) / 0.45);
    for (let v = 1; v <= 3; v++) {
      const vf  = v * 0.22;
      const vbx = bx + cos * len * vf * et;
      const vby = by + sin * len * vf * et;
      const vex = vbx + px * hw * 0.65 * (1 - vf * 0.5) * vt;
      const vey = vby + py * hw * 0.65 * (1 - vf * 0.5) * vt;
      ctx.beginPath(); ctx.moveTo(vbx, vby); ctx.lineTo(vex, vey);
      ctx.strokeStyle = `rgba(${r1},${g1+8},${b1},${0.32 * vt * (1-shade*0.4)})`;
      ctx.lineWidth = 0.45; ctx.stroke();
    }
  }

  // ── Water-bead dew drops on surface ──
  if (t > 0.8 && shade < 0.5) {
    const dewT = (t - 0.8) / 0.2;
    const dropX = bx + cos * len * 0.45 * et + px * hw * 0.3;
    const dropY = by + sin * len * 0.45 * et + py * hw * 0.3;
    const dr = 2.2 * dewT;
    const dg = ctx.createRadialGradient(dropX - dr*0.35, dropY - dr*0.35, 0, dropX, dropY, dr);
    dg.addColorStop(0,   'rgba(220,245,255,0.95)');
    dg.addColorStop(0.5, 'rgba(180,225,245,0.55)');
    dg.addColorStop(1,   'rgba(140,200,230,0.05)');
    ctx.beginPath(); ctx.arc(dropX, dropY, dr, 0, Math.PI * 2);
    ctx.fillStyle = dg; ctx.fill();
  }
}

// ── Organic curved stem with 3D thickness ────────────────────────────────────
function drawStem(ctx, bx, by, tx, ty, cx1, cy1, cx2, cy2, width, pal, t) {
  if (t <= 0) return;
  const et = easeOut(t);

  // Sample point along bezier at et
  const bt = et;
  const bx2 = Math.pow(1-bt,3)*bx + 3*Math.pow(1-bt,2)*bt*cx1 + 3*(1-bt)*bt*bt*cx2 + bt*bt*bt*tx;
  const by2 = Math.pow(1-bt,3)*by + 3*Math.pow(1-bt,2)*bt*cy1 + 3*(1-bt)*bt*bt*cy2 + bt*bt*bt*ty;

  const r1v = parseInt(pal.d.slice(1,3),16);
  const g1v = parseInt(pal.d.slice(3,5),16);
  const b1v = parseInt(pal.d.slice(5,7),16);
  const r0v = parseInt(pal.m.slice(1,3),16);
  const g0v = parseInt(pal.m.slice(3,5),16);
  const b0v = parseInt(pal.m.slice(5,7),16);

  // Shadow side
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.bezierCurveTo(cx1, cy1, cx2, cy2, bx2, by2);
  const sg = ctx.createLinearGradient(bx, by, bx2, by2);
  sg.addColorStop(0,   `rgba(${r1v-8},${g1v},${b1v},1)`);
  sg.addColorStop(0.5, `rgba(${r0v},${g0v},${b0v},0.95)`);
  sg.addColorStop(1,   `rgba(${r0v+10},${g0v+12},${b0v+4},0.85)`);
  ctx.strokeStyle = sg;
  ctx.lineWidth = width + 0.8;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();

  // Highlight side
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.bezierCurveTo(cx1 - 1.5, cy1, cx2 - 1, cy2, bx2, by2);
  const hg = ctx.createLinearGradient(bx, by, bx2, by2);
  hg.addColorStop(0,   `rgba(${r0v+15},${g0v+18},${b0v+6},0.9)`);
  hg.addColorStop(0.6, `rgba(${r0v+8},${g0v+10},${b0v+3},0.6)`);
  hg.addColorStop(1,   `rgba(${r0v},${g0v},${b0v},0.0)`);
  ctx.strokeStyle = hg;
  ctx.lineWidth = width * 0.38;
  ctx.lineCap = 'round'; ctx.stroke();
}

// ── Seed stage ────────────────────────────────────────────────────────────────
function drawSeed(ctx, W, H, t, pal) {
  const soilY = H * 0.70;
  drawSoil(ctx, W, H, soilY);

  const cx = W / 2;
  // Seed nestled just above soil surface, partially buried
  const cy = soilY - 14 + (1-t) * 8;

  // Ambient glow deepening as seed activates
  const aura = ctx.createRadialGradient(cx, cy, 0, cx, cy, 35 + t * 15);
  aura.addColorStop(0,   pal.t.replace('0.12', `${0.08 + t * 0.14}`));
  aura.addColorStop(0.6, pal.t.replace('0.12', `${0.03 + t * 0.06}`));
  aura.addColorStop(1,   'transparent');
  ctx.fillStyle = aura;
  ctx.beginPath(); ctx.ellipse(cx, cy, 35 + t*15, 28 + t*10, 0, 0, Math.PI*2); ctx.fill();

  // Hull shadow
  ctx.beginPath(); ctx.ellipse(cx + 2, cy + 3, 14, 17, -0.1, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fill();

  // Outer hull — rich chestnut with 3D curvature
  const hullG = ctx.createRadialGradient(cx - 4, cy - 7, 1, cx, cy, 17);
  hullG.addColorStop(0,   '#6e421a');
  hullG.addColorStop(0.3, '#4c2c0a');
  hullG.addColorStop(0.7, '#361e06');
  hullG.addColorStop(1,   '#1c0e02');
  ctx.beginPath(); ctx.ellipse(cx, cy, 13, 17, -0.1, 0, Math.PI*2);
  ctx.fillStyle = hullG; ctx.fill();

  // Hull surface texture ridge
  ctx.beginPath();
  ctx.moveTo(cx - 4, cy - 14); ctx.quadraticCurveTo(cx - 6, cy, cx - 3, cy + 14);
  ctx.strokeStyle = 'rgba(30,16,4,0.45)'; ctx.lineWidth = 1.2; ctx.stroke();

  // Top specular
  ctx.beginPath(); ctx.ellipse(cx - 3.5, cy - 7, 3.5, 5.5, -0.25, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(180,130,60,0.16)'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx - 2.5, cy - 8, 1.5, 2.5, -0.2, 0, Math.PI*2);
  ctx.fillStyle = 'rgba(220,180,100,0.22)'; ctx.fill();

  // Life energy pulse ring (activates with progress)
  if (t > 0.2) {
    const pt = easeOut((t - 0.2) / 0.8);
    const ring = ctx.createRadialGradient(cx, cy, 13, cx, cy, 13 + pt * 18);
    ring.addColorStop(0,   `rgba(${parseInt(pal.h.slice(1,3),16)},${parseInt(pal.h.slice(3,5),16)},${parseInt(pal.h.slice(5,7),16)},${0.30 * pt})`);
    ring.addColorStop(0.5, pal.t.replace('0.12', `${0.12 * pt}`));
    ring.addColorStop(1,   'transparent');
    ctx.beginPath(); ctx.arc(cx, cy, 13 + pt * 18, 0, Math.PI*2);
    ctx.fillStyle = ring; ctx.fill();
  }

  // Radicle (taproot) emerging from base
  if (t > 0.4) {
    const rt = easeOut((t - 0.4) / 0.6);
    const roots = [
      { cp1x: cx - 3, cp2x: cx - 12, ex: cx - 20, dy1: 0.4, dy2: 0.7, ey: 1.0 },
      { cp1x: cx + 3, cp2x: cx + 14, ex: cx + 22, dy1: 0.4, dy2: 0.65, ey: 0.95 },
      { cp1x: cx,     cp2x: cx - 4,  ex: cx - 6,  dy1: 0.35, dy2: 0.65, ey: 1.0 },
      { cp1x: cx + 1, cp2x: cx + 5,  ex: cx + 8,  dy1: 0.3, dy2: 0.6,  ey: 0.9 },
    ];
    roots.forEach((r, ri) => {
      const rLen = 32 + ri * 6;
      const rT = Math.min(1, rt * 1.3 - ri * 0.2);
      if (rT <= 0) return;
      const ex = r.ex; const ey = soilY + 4 + rLen * rT;
      ctx.beginPath();
      ctx.moveTo(cx, soilY + 2);
      ctx.bezierCurveTo(r.cp1x, soilY + rLen * r.dy1 * rT, r.cp2x, soilY + rLen * r.dy2 * rT, ex, ey);
      const rg = ctx.createLinearGradient(cx, soilY, ex, ey);
      rg.addColorStop(0,   'rgba(55,30,8,0.7)');
      rg.addColorStop(0.5, 'rgba(38,20,5,0.5)');
      rg.addColorStop(1,   'rgba(22,10,2,0.2)');
      ctx.strokeStyle = rg;
      ctx.lineWidth = Math.max(0.5, 1.4 - ri * 0.2);
      ctx.lineCap = 'round'; ctx.stroke();
    });
  }
}

// ── Leaf configs per step ─────────────────────────────────────────────────────
const LEAF_SETS = {
  1: [
    { f:0.30, len:26, w:10, ang:148, start:0.38, depth:0.0 },
    { f:0.30, len:26, w:10, ang:32,  start:0.48, depth:0.1 },
  ],
  2: [
    { f:0.26, len:34, w:13, ang:145, start:0.28, depth:0.0 },
    { f:0.26, len:34, w:13, ang:35,  start:0.36, depth:0.1 },
    { f:0.52, len:26, w:10, ang:148, start:0.54, depth:0.15 },
    { f:0.52, len:26, w:10, ang:32,  start:0.62, depth:0.22 },
  ],
  3: [
    { f:0.16, len:44, w:16, ang:143, start:0.18, depth:0.0 },
    { f:0.16, len:44, w:16, ang:37,  start:0.26, depth:0.08 },
    { f:0.36, len:38, w:14, ang:146, start:0.36, depth:0.12 },
    { f:0.36, len:38, w:14, ang:34,  start:0.44, depth:0.18 },
    { f:0.58, len:30, w:12, ang:150, start:0.56, depth:0.22 },
    { f:0.58, len:30, w:12, ang:30,  start:0.64, depth:0.28 },
  ],
  4: [
    { f:0.10, len:54, w:18, ang:140, start:0.10, depth:0.0  },
    { f:0.10, len:54, w:18, ang:40,  start:0.17, depth:0.06 },
    { f:0.27, len:48, w:17, ang:143, start:0.26, depth:0.10 },
    { f:0.27, len:48, w:17, ang:37,  start:0.33, depth:0.15 },
    { f:0.46, len:42, w:15, ang:146, start:0.44, depth:0.18 },
    { f:0.46, len:42, w:15, ang:34,  start:0.51, depth:0.22 },
    { f:0.65, len:34, w:13, ang:150, start:0.62, depth:0.26 },
    { f:0.65, len:34, w:13, ang:30,  start:0.69, depth:0.30 },
  ],
  5: [
    { f:0.06, len:62, w:21, ang:138, start:0.06, depth:0.0  },
    { f:0.06, len:62, w:21, ang:42,  start:0.12, depth:0.05 },
    { f:0.20, len:56, w:19, ang:141, start:0.20, depth:0.08 },
    { f:0.20, len:56, w:19, ang:39,  start:0.27, depth:0.12 },
    { f:0.35, len:50, w:18, ang:144, start:0.34, depth:0.14 },
    { f:0.35, len:50, w:18, ang:36,  start:0.41, depth:0.18 },
    { f:0.52, len:43, w:16, ang:147, start:0.50, depth:0.20 },
    { f:0.52, len:43, w:16, ang:33,  start:0.57, depth:0.24 },
    { f:0.68, len:36, w:14, ang:151, start:0.66, depth:0.26 },
    { f:0.68, len:36, w:14, ang:29,  start:0.73, depth:0.30 },
  ],
  6: [
    { f:0.04, len:70, w:23, ang:136, start:0.04, depth:0.0  },
    { f:0.04, len:70, w:23, ang:44,  start:0.09, depth:0.04 },
    { f:0.16, len:64, w:22, ang:139, start:0.16, depth:0.07 },
    { f:0.16, len:64, w:22, ang:41,  start:0.22, depth:0.10 },
    { f:0.28, len:58, w:20, ang:142, start:0.28, depth:0.12 },
    { f:0.28, len:58, w:20, ang:38,  start:0.34, depth:0.15 },
    { f:0.42, len:52, w:18, ang:145, start:0.40, depth:0.17 },
    { f:0.42, len:52, w:18, ang:35,  start:0.46, depth:0.20 },
    { f:0.56, len:46, w:17, ang:148, start:0.54, depth:0.22 },
    { f:0.56, len:46, w:17, ang:32,  start:0.60, depth:0.25 },
    { f:0.70, len:40, w:15, ang:152, start:0.68, depth:0.28 },
    { f:0.70, len:40, w:15, ang:28,  start:0.74, depth:0.32 },
  ],
};

// ── Main draw ─────────────────────────────────────────────────────────────────
function drawPlant(ctx, W, H, step, progress, selT, pal) {
  ctx.clearRect(0, 0, W, H);
  const soilY = H * 0.72;

  if (step === 0) {
    drawSeed(ctx, W, H, progress, pal);
    return;
  }

  drawSoil(ctx, W, H, soilY);

  const cx = W / 2;
  const stemH = (70 + step * 26) * easeOut(progress);
  const stemTop = soilY - stemH;

  // Phototrophic S-curve control points
  const cp1x = cx - 3; const cp1y = soilY - stemH * 0.28;
  const cp2x = cx + 2; const cp2y = soilY - stemH * 0.68;
  const stemW = 2.2 + step * 0.65;

  drawStem(ctx, cx, soilY, cx, stemTop, cp1x, cp1y, cp2x, cp2y, stemW, pal, Math.min(1, progress * 1.5));

  // Leaves — back-to-front painter's sort (higher depth index drawn first)
  const leaves = (LEAF_SETS[step] || LEAF_SETS[1]).slice();
  leaves.sort((a, b) => b.depth - a.depth);

  leaves.forEach(({ f, len, w, ang, start, depth }) => {
    const leafT = Math.min(1, Math.max(0, (progress - start) / (0.85 - start + 0.01)));
    // Attach point along bezier
    const bt = f;
    const ax = Math.pow(1-bt,3)*cx + 3*Math.pow(1-bt,2)*bt*cp1x + 3*(1-bt)*bt*bt*cp2x + bt*bt*bt*cx;
    const ay = Math.pow(1-bt,3)*soilY + 3*Math.pow(1-bt,2)*bt*cp1y + 3*(1-bt)*bt*bt*cp2y + bt*bt*bt*stemTop;
    drawLeaf(ctx, ax, ay, len, w, ang, leafT, pal, depth);
  });

  // Apical bud
  if (progress > 0.55) {
    const bt = easeOut((progress - 0.55) / 0.45);
    const br = (2.5 + step * 0.6) * bt;
    const bg = ctx.createRadialGradient(cx - br * 0.3, stemTop - br * 0.3, 0, cx, stemTop, br * 2.5);
    bg.addColorStop(0,   pal.h + 'ff');
    bg.addColorStop(0.5, pal.m + 'cc');
    bg.addColorStop(1,   'transparent');
    ctx.beginPath(); ctx.arc(cx, stemTop, br * 2.5, 0, Math.PI*2);
    ctx.fillStyle = bg; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, stemTop, br, 0, Math.PI*2);
    const bc = ctx.createRadialGradient(cx - br*0.4, stemTop - br*0.4, 0, cx, stemTop, br);
    bc.addColorStop(0, pal.s + 'ff'); bc.addColorStop(1, pal.h + 'cc');
    ctx.fillStyle = bc; ctx.fill();
  }

  // Selection bloom — fresh leaf flush from apex
  if (selT > 0 && selT < 1) {
    const st = easeOut(selT);
    const newLen = (12 + step * 4.5) * st;
    drawLeaf(ctx, cx, stemTop + 3, newLen, newLen * 0.48, 145, st * 0.85, pal, 0.0);
    drawLeaf(ctx, cx, stemTop + 3, newLen, newLen * 0.48,  35, st * 0.85, pal, 0.05);
    // Moisture ring
    const mr = 28 * st;
    const mg = ctx.createRadialGradient(cx, stemTop, 0, cx, stemTop, mr);
    mg.addColorStop(0,   pal.t.replace('0.12', '0.18'));
    mg.addColorStop(0.6, pal.t.replace('0.12', '0.06'));
    mg.addColorStop(1,   'transparent');
    ctx.beginPath(); ctx.arc(cx, stemTop, mr, 0, Math.PI*2);
    ctx.fillStyle = mg; ctx.fill();
  }
}

// ── Animated canvas ───────────────────────────────────────────────────────────
function AnimatedPlant({ step, selected, pal }) {
  const canvasRef    = useRef(null);
  const progressRef  = useRef(0);
  const selTRef      = useRef(0);
  const rafRef       = useRef(null);
  const stepRef      = useRef(step);
  const selectedRef  = useRef(selected);

  useEffect(() => {
    if (stepRef.current !== step) {
      progressRef.current = 0;
      stepRef.current = step;
    }
  }, [step]);

  useEffect(() => {
    if (selected !== null && selected !== selectedRef.current) {
      selTRef.current = 0.001;
    }
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    let last = null;
    const tick = (now) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;

      if (progressRef.current < 1)
        progressRef.current = Math.min(1, progressRef.current + dt * 0.48);

      if (selTRef.current > 0 && selTRef.current < 1)
        selTRef.current = Math.min(1, selTRef.current + dt * 1.4);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        drawPlant(ctx, canvas.width, canvas.height, stepRef.current, progressRef.current, selTRef.current, pal);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [pal]);

  return (
    <canvas
      ref={canvasRef}
      width={290}
      height={360}
      style={{ width: '100%', height: '100%', imageRendering: 'auto' }}
    />
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function PlantStage({ step, answers, selected }) {
  const mood  = answers?.mood;
  const pal   = useMemo(() => getPalette(mood), [mood]);
  const stage = PLANT_STAGES[Math.min(step, PLANT_STAGES.length - 1)];
  const particles = useMemo(() => PARTICLE_DATA.slice(0, stage.particles), [stage.particles]);

  return (
    <div className="relative flex flex-col items-center justify-end h-full min-h-[300px] overflow-hidden">

      {/* Volumetric ground fog — cinematic depth */}
      <motion.div
        key={`fog-${step}`}
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '40%' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.5, ease: 'easeInOut' }}
      >
        <div className="w-full h-full" style={{
          background: `linear-gradient(to top, ${stage.fog} 0%, transparent 100%)`
        }} />
      </motion.div>

      {/* Radial growth glow */}
      <motion.div
        key={`glow-${step}`}
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.2, ease: 'easeInOut' }}
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 72%, ${stage.glow}, transparent 70%)`,
        }}
      />

      {/* Canvas — cross-fade between stages */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`plant-${step}`}
          className="relative z-10 w-full h-full flex items-end justify-center"
          initial={{ opacity: 0, filter: 'blur(4px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: 'blur(3px)' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <AnimatedPlant step={step} selected={selected} pal={pal} />
        </motion.div>
      </AnimatePresence>

      {/* Floating spores */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <motion.div
            key={`p-${step}-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${p.left}%`, bottom: `${p.bottom}%`,
              width: `${p.size}px`, height: `${p.size}px`,
              background: step > 1
                ? `rgba(90,190,70,${p.opacity})`
                : `rgba(150,110,45,${p.opacity * 0.7})`,
              filter: 'blur(0.6px)',
            }}
            animate={{ y: [0, -p.dy], x: [0, p.dx], opacity: [0, p.opacity, 0] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
      </div>

      {/* Stage label */}
      <motion.div
        key={`lbl-${step}`}
        className="absolute top-3 left-0 right-0 text-center pointer-events-none"
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <span className="font-body text-[9px] uppercase tracking-[0.30em] text-white/20">
          {stage.label}
        </span>
      </motion.div>
    </div>
  );
}