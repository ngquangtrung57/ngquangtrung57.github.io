/**
 * Multimodal Attention Field — canvas 2D simulation for the hero panel.
 *
 * Tokens of three modalities (text / audio / vision) drift in a soft-bounded
 * field, linked by faint attention edges. The cursor acts as a query vector:
 * the top-k nearest tokens receive attention beams, glow, and a gentle pull.
 * Click fires a "generation pulse" that flashes tokens it sweeps past.
 * No deps, no WebGL, zero steady-state allocations.
 */

const TEXT = 0;
const AUDIO = 1;
const VISION = 2;

const COLORS = ['#5eead4', '#a78bfa', '#7dd3fc'] as const;
const GLYPHS = ['▁the', 'att', '<s>', 'kv', 'softmax', '▁gen', 'lah', '▁viB', 'q_k'];
const FONT = '9px "JetBrains Mono Variable", "JetBrains Mono", ui-monospace, monospace';

const K = 7; // top-k attended tokens
const EDGE_DIST = 130; // max neighbour edge length, px
const SIGMA2 = 2 * 160 * 160; // attention kernel width
const MARGIN = 40; // soft bounds inset
const PULSE_MS = 700;
const PULSE_R = 260;

interface Tok {
  x: number;
  y: number;
  vx: number;
  vy: number;
  m: number; // modality: TEXT | AUDIO | VISION
  r: number;
  phase: number;
  glyph: string;
  gw: number; // measured glyph width (text tokens)
  attn: number; // eased attention weight 0..1
  flash: number; // pulse flash 0..1
}

interface Pulse {
  x: number;
  y: number;
  age: number;
  on: boolean;
}

function rgbOf(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
  t: number
): string {
  const r = Math.round(a[0] + (b[0] - a[0]) * t);
  const g = Math.round(a[1] + (b[1] - a[1]) * t);
  const bl = Math.round(a[2] + (b[2] - a[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

const WHITE: readonly [number, number, number] = [255, 255, 255];
const RGB = COLORS.map(rgbOf);

/** Midpoint colours for edges between modality pairs, flat 3x3. */
const EDGE_COLORS: string[] = [];
for (let a = 0; a < 3; a++) {
  for (let b = 0; b < 3; b++) {
    EDGE_COLORS.push(mix(RGB[a] ?? WHITE, RGB[b] ?? WHITE, 0.5));
  }
}

/** 9-step ramp from each modality colour to white, flat 3x9 (flash mix). */
const FLASH_RAMP: string[] = [];
for (let m = 0; m < 3; m++) {
  for (let s = 0; s < 9; s++) {
    FLASH_RAMP.push(mix(RGB[m] ?? WHITE, WHITE, s / 8));
  }
}

/** Pre-rendered radial glow sprite for one colour (cheap shadowBlur stand-in). */
function makeGlow(color: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const g = c.getContext('2d');
  if (g) {
    const [r, gr, b] = rgbOf(color);
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, `rgba(${r},${gr},${b},0.5)`);
    grad.addColorStop(0.5, `rgba(${r},${gr},${b},0.12)`);
    grad.addColorStop(1, `rgba(${r},${gr},${b},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
  }
  return c;
}

export function mountAttentionField(panel: HTMLElement, canvas: HTMLCanvasElement): void {
  const maybeCtx = canvas.getContext('2d');
  if (!maybeCtx) return;
  const ctx: CanvasRenderingContext2D = maybeCtx;

  let W = panel.clientWidth || 480;
  let H = panel.clientHeight || 420;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  const glow = [makeGlow(COLORS[0]), makeGlow(COLORS[1]), makeGlow(COLORS[2])];

  // --- tokens (~40% text / 30% audio / 30% vision) ---
  const N = W < 480 ? 26 : 48;
  const tokens: Tok[] = [];
  ctx.font = FONT;
  for (let i = 0; i < N; i++) {
    const m = i % 10 < 4 ? TEXT : i % 10 < 7 ? AUDIO : VISION;
    const glyph = m === TEXT ? (GLYPHS[i % GLYPHS.length] ?? 'tok') : '';
    tokens.push({
      x: MARGIN + Math.random() * Math.max(1, W - 2 * MARGIN),
      y: MARGIN + Math.random() * Math.max(1, H - 2 * MARGIN),
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      m,
      r: 3 + Math.random() * 2,
      phase: Math.random() * Math.PI * 2,
      glyph,
      gw: glyph ? ctx.measureText(glyph).width : 0,
      attn: 0,
      flash: 0,
    });
  }

  // scratch buffers — reused every frame, no per-frame allocation
  const weights = new Float32Array(N);
  const topIdx = new Int32Array(K);
  const isTop = new Uint8Array(N);
  const pulses: Pulse[] = [
    { x: 0, y: 0, age: 0, on: false },
    { x: 0, y: 0, age: 0, on: false },
  ];
  const topCount = Math.min(K, N);

  // query state
  let qx = W / 2;
  let qy = H / 2;
  let tx = qx;
  let ty = qy;
  let hasPointer = false;

  // loop state
  let t = 0; // sim time, seconds
  let last = 0;
  let raf = 0;
  let running = false;
  let inView = true;
  let reduced = false;

  // ------------------------------------------------------------ sizing

  function sizeCanvas(): void {
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function resize(): void {
    const w = panel.clientWidth;
    const h = panel.clientHeight;
    if (w === 0 || h === 0) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (w !== W || h !== H) {
      const sx = w / W;
      const sy = h / H;
      for (const tk of tokens) {
        tk.x *= sx;
        tk.y *= sy;
      }
      qx *= sx;
      qy *= sy;
      tx *= sx;
      ty *= sy;
      W = w;
      H = h;
    }
    sizeCanvas();
    if (reduced) renderStatic();
  }

  // ------------------------------------------------------------ simulation

  function step(now: number): void {
    const dt = Math.min(now - last, 50);
    last = now;
    const k = dt / (1000 / 60); // 1.0 at 60fps
    t += dt / 1000;

    const friction = Math.pow(0.985, k);
    const flashDecay = Math.pow(0.92, k);

    // physics: wander + soft bounds + clamp
    for (const tk of tokens) {
      tk.vx += 0.015 * Math.sin(t * 0.3 + tk.phase) * k;
      tk.vy += 0.015 * Math.cos(t * 0.27 + tk.phase * 1.3) * k;
      if (tk.x < MARGIN) tk.vx += (MARGIN - tk.x) * 0.002 * k;
      else if (tk.x > W - MARGIN) tk.vx -= (tk.x - W + MARGIN) * 0.002 * k;
      if (tk.y < MARGIN) tk.vy += (MARGIN - tk.y) * 0.002 * k;
      else if (tk.y > H - MARGIN) tk.vy -= (tk.y - H + MARGIN) * 0.002 * k;
      tk.vx *= friction;
      tk.vy *= friction;
      const sp2 = tk.vx * tk.vx + tk.vy * tk.vy;
      if (sp2 > 0.36) {
        const s = 0.6 / Math.sqrt(sp2);
        tk.vx *= s;
        tk.vy *= s;
      }
      tk.x += tk.vx * k;
      tk.y += tk.vy * k;
      tk.flash = tk.flash < 0.02 ? 0 : tk.flash * flashDecay;
    }

    // query: autonomous Lissajous when idle, smooth lerp to target
    if (!hasPointer) {
      tx = W / 2 + 0.35 * W * Math.sin(0.21 * t);
      ty = H / 2 + 0.3 * H * Math.sin(0.34 * t + 1.3);
    }
    const ql = Math.min(1, (hasPointer ? 0.18 : 0.05) * k);
    qx += (tx - qx) * ql;
    qy += (ty - qy) * ql;

    // attention weights + top-k partial selection
    isTop.fill(0);
    for (let i = 0; i < N; i++) {
      const tk = tokens[i];
      if (!tk) continue;
      const dx = tk.x - qx;
      const dy = tk.y - qy;
      weights[i] = Math.exp(-(dx * dx + dy * dy) / SIGMA2);
    }
    for (let s = 0; s < topCount; s++) {
      let best = -1;
      let bw = -1;
      for (let i = 0; i < N; i++) {
        const w = weights[i] ?? 0;
        if (!isTop[i] && w > bw) {
          bw = w;
          best = i;
        }
      }
      topIdx[s] = best;
      if (best >= 0) isTop[best] = 1;
    }
    let sum = 0;
    for (let s = 0; s < topCount; s++) sum += weights[topIdx[s] ?? 0] ?? 0;
    if (sum > 0) {
      for (let s = 0; s < topCount; s++) {
        const i = topIdx[s] ?? 0;
        weights[i] = (weights[i] ?? 0) / sum;
      }
    }

    // ease attn toward normalized weight; gentle pull toward the query
    for (let i = 0; i < N; i++) {
      const tk = tokens[i];
      if (!tk) continue;
      const target = isTop[i] ? (weights[i] ?? 0) : 0;
      tk.attn += (target - tk.attn) * Math.min(1, 0.1 * k);
      if (isTop[i] && target > 0.001) {
        const dx = qx - tk.x;
        const dy = qy - tk.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = Math.min(0.02, 0.008 * target) * k;
        tk.vx += (dx / d) * f;
        tk.vy += (dy / d) * f;
      }
    }

    // generation pulses: age, flash tokens swept by the ring
    for (const p of pulses) {
      if (!p.on) continue;
      p.age += dt;
      if (p.age >= PULSE_MS) {
        p.on = false;
        continue;
      }
      const rad = PULSE_R * (p.age / PULSE_MS);
      for (const tk of tokens) {
        const dx = tk.x - p.x;
        const dy = tk.y - p.y;
        if (Math.abs(Math.sqrt(dx * dx + dy * dy) - rad) < 18) tk.flash = 1;
      }
    }

    render();
  }

  // ------------------------------------------------------------ rendering

  function render(): void {
    ctx.clearRect(0, 0, W, H);
    drawGlows();
    drawEdges();
    drawBeams();
    drawTokens();
    drawPulses();
    drawQuery();
    ctx.globalAlpha = 1;
  }

  function renderStatic(): void {
    ctx.clearRect(0, 0, W, H);
    drawGlows();
    drawEdges();
    drawTokens();
    ctx.globalAlpha = 1;
  }

  function drawGlows(): void {
    for (const tk of tokens) {
      const sprite = glow[tk.m];
      if (!sprite) continue;
      const s = tk.r * 7 * (1 + 0.8 * tk.attn);
      ctx.globalAlpha = 0.28 + 0.4 * tk.attn;
      ctx.drawImage(sprite, tk.x - s / 2, tk.y - s / 2, s, s);
    }
  }

  function drawEdges(): void {
    ctx.lineWidth = 1;
    const r2 = EDGE_DIST * EDGE_DIST;
    for (let i = 0; i < N; i++) {
      const a = tokens[i];
      if (!a) continue;
      let i1 = -1;
      let i2 = -1;
      let d1 = r2;
      let d2 = r2;
      for (let j = 0; j < N; j++) {
        if (j === i) continue;
        const b = tokens[j];
        if (!b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = dx * dx + dy * dy;
        if (d < d1) {
          d2 = d1;
          i2 = i1;
          d1 = d;
          i1 = j;
        } else if (d < d2) {
          d2 = d;
          i2 = j;
        }
      }
      drawEdge(a, i1, d1);
      drawEdge(a, i2, d2);
    }
  }

  function drawEdge(a: Tok, j: number, d2: number): void {
    if (j < 0) return;
    const b = tokens[j];
    if (!b) return;
    const d = Math.sqrt(d2);
    ctx.globalAlpha = (1 - d / EDGE_DIST) * 0.25 + (a.m !== b.m ? 0.1 : 0);
    ctx.strokeStyle = EDGE_COLORS[a.m * 3 + b.m] ?? COLORS[0];
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  function drawBeams(): void {
    ctx.strokeStyle = COLORS[TEXT];
    for (let s = 0; s < topCount; s++) {
      const i = topIdx[s] ?? -1;
      if (i < 0) continue;
      const tk = tokens[i];
      if (!tk) continue;
      const w = weights[i] ?? 0;
      if (w < 0.015) continue;
      const dx = tk.x - qx;
      const dy = tk.y - qy;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const bow = d * 0.12 * (i % 2 === 0 ? 1 : -1);
      ctx.globalAlpha = 0.15 + 0.55 * w;
      ctx.lineWidth = 0.5 + 3 * w;
      ctx.beginPath();
      ctx.moveTo(qx, qy);
      ctx.quadraticCurveTo(
        (qx + tk.x) / 2 - (dy / d) * bow,
        (qy + tk.y) / 2 + (dx / d) * bow,
        tk.x,
        tk.y
      );
      ctx.stroke();
    }
  }

  function drawTokens(): void {
    ctx.font = FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < N; i++) {
      const tk = tokens[i];
      if (!tk) continue;
      const scale = 1 + 0.6 * Math.min(1, tk.attn);
      const col =
        tk.flash > 0.02
          ? (FLASH_RAMP[tk.m * 9 + Math.min(8, Math.round(tk.flash * 8))] ?? COLORS[0])
          : (COLORS[tk.m] ?? COLORS[0]);
      ctx.save();
      ctx.translate(tk.x, tk.y);
      ctx.scale(scale, scale);
      // shadowBlur is expensive — only the <=7 attended tokens get it
      if (isTop[i] === 1 && tk.attn > 0.05) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = col;
      }
      ctx.globalAlpha = 0.9;
      if (tk.m === TEXT) drawText(tk, col);
      else if (tk.m === AUDIO) drawAudio(tk, col);
      else drawVision(tk, col);
      ctx.restore();
    }
  }

  function drawText(tk: Tok, col: string): void {
    const w = tk.gw + 8;
    const h = 13;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 3);
    ctx.fillStyle = 'rgba(6, 9, 19, 0.75)';
    ctx.fill();
    ctx.strokeStyle = col;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.55;
    ctx.stroke();
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = col;
    ctx.fillText(tk.glyph, 0, 0.5);
  }

  function drawAudio(tk: Tok, col: string): void {
    ctx.fillStyle = col;
    for (let i = 0; i < 4; i++) {
      const h = 3.2 + 3 * (0.5 + 0.5 * Math.sin(t * 2 + tk.phase + i * 0.9));
      ctx.fillRect(-4.8 + i * 2.6, -h / 2, 1.6, h);
    }
  }

  function drawVision(tk: Tok, col: string): void {
    const s = tk.r * 2.4;
    ctx.rotate(0.2 * Math.sin(t * 0.35 + tk.phase));
    ctx.strokeStyle = col;
    ctx.lineWidth = 0.9;
    ctx.strokeRect(-s / 2, -s / 2, s, s);
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(0, -s / 2);
    ctx.lineTo(0, s / 2);
    ctx.moveTo(-s / 2, 0);
    ctx.lineTo(s / 2, 0);
    ctx.stroke();
  }

  function drawPulses(): void {
    ctx.strokeStyle = COLORS[TEXT];
    ctx.lineWidth = 1.5;
    for (const p of pulses) {
      if (!p.on) continue;
      const f = p.age / PULSE_MS;
      ctx.globalAlpha = 0.45 * (1 - f);
      ctx.beginPath();
      ctx.arc(p.x, p.y, PULSE_R * f, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawQuery(): void {
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = COLORS[TEXT];
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(qx, qy, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = COLORS[TEXT];
    ctx.textAlign = 'left';
    ctx.fillText('q', qx + 9, qy - 7);
  }

  // ------------------------------------------------------------ loop control

  function frame(now: number): void {
    raf = requestAnimationFrame(frame);
    step(now);
  }

  function start(): void {
    if (running) return;
    running = true;
    last = performance.now(); // avoid dt spike on resume
    raf = requestAnimationFrame(frame);
  }

  function stop(): void {
    if (!running) return;
    running = false;
    cancelAnimationFrame(raf);
  }

  function sync(): void {
    if (!reduced && inView && !document.hidden) start();
    else stop();
  }

  // ------------------------------------------------------------ input

  function pointAt(e: PointerEvent): void {
    const rect = panel.getBoundingClientRect();
    tx = e.clientX - rect.left;
    ty = e.clientY - rect.top;
    hasPointer = true;
  }

  function spawnPulse(x: number, y: number): void {
    let p: Pulse | undefined;
    for (const c of pulses) {
      if (!c.on) {
        p = c;
        break;
      }
      if (!p || c.age > p.age) p = c; // reuse the oldest
    }
    if (!p) return;
    p.x = x;
    p.y = y;
    p.age = 0;
    p.on = true;
  }

  function onMove(e: PointerEvent): void {
    pointAt(e);
  }

  function onDown(e: PointerEvent): void {
    pointAt(e);
    spawnPulse(tx, ty);
  }

  function onUp(e: PointerEvent): void {
    if (e.pointerType === 'touch') hasPointer = false;
  }

  function onLeave(): void {
    hasPointer = false;
  }

  function attach(): void {
    panel.addEventListener('pointermove', onMove);
    panel.addEventListener('pointerdown', onDown);
    panel.addEventListener('pointerup', onUp);
    panel.addEventListener('pointerleave', onLeave);
  }

  function detach(): void {
    panel.removeEventListener('pointermove', onMove);
    panel.removeEventListener('pointerdown', onDown);
    panel.removeEventListener('pointerup', onUp);
    panel.removeEventListener('pointerleave', onLeave);
  }

  // ------------------------------------------------------------ wiring

  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

  function applyMode(): void {
    reduced = mq.matches;
    if (reduced) {
      stop();
      detach();
      hasPointer = false;
      renderStatic();
    } else {
      attach();
      sync();
    }
  }

  const ro = new ResizeObserver(resize);
  ro.observe(panel);

  const io = new IntersectionObserver(
    (entries) => {
      const e = entries[entries.length - 1];
      if (e) inView = e.isIntersecting;
      sync();
    },
    { threshold: 0 }
  );
  io.observe(panel);

  document.addEventListener('visibilitychange', sync);
  mq.addEventListener('change', applyMode);

  sizeCanvas();
  applyMode();
}
