/* ==========================================================================
   SommiPaint, on the 1991 Mac: a one-bit painting program in the manner of
   the first paint programs. It takes the whole screen, with its own menu
   bar (File, Edit, Goodies, Font, FontSize, Style), the tools down the left,
   the line widths under them, the patterns along the bottom, and the
   picture in a window called untitled.

   The picture is a page of 576 by 720 dots, each black or white, so all it
   draws is pixels. It is laid out at the original screen's 512 by 342 and
   scaled to fit. File > Save to Your Computer… downloads it as a PNG.
   ========================================================================== */
window.SOMMIPAINT = (function () {
  const W = 576, H = 720;            // the page
  const VW = 410, VH = 236;          // the window onto it
  const FAT = 8;                     // FatBits: each dot drawn this big

  /* Patterns, eight rows of eight dots, the leftmost dot the top bit. */
  const PATS = [
    'ffffffffffffffff', '0000000000000000', 'aa55aa55aa55aa55', '8822882288228822', '8800220088002200', 'dd77dd77dd77dd77',
    'ff00ff00ff00ff00', 'aaaaaaaaaaaaaaaa', '0102040810204080', '8040201008040201', 'ff808080ff080808', '8142241818244281',
    'ff888888ff888888', '8000080080000800', '1028448244281000', '0f0f0f0ff0f0f0f0', '7fbfdfeff7fbfdfe', 'eeddbb77eeddbb77',
    '8844221188442211', '1122448811224488', 'f0e0c08001030f1f', '00182424180000', '2050885020000000', '8080808080808080',
    'ff000000ff000000', 'cc33cc33cc33cc33', '6699996666999966', 'f8747227478f0000', '3c4281818181423c', '1038fe3810000000',
    '0044280010280044', '8855225588552255', 'aa00aa00aa00aa00', '1188442211884422', 'e7dbbd7e7ebddbe7', '55aa55aa55aa55aa'.replace(/../g, (h) => h),
    '7e8181818181817e', '0018183c3c181800'
  ].map((s) => { const p = s.padEnd(16, '0'); return [...Array(8)].map((_, i) => parseInt(p.substr(i * 2, 2), 16)); });

  /* Brush shapes: offsets from the centre. */
  const disc = (r) => { const o = []; for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * .6) o.push([x, y]); return o; };
  const box = (a, b) => { const o = []; for (let y = -b; y <= b; y++) for (let x = -a; x <= a; x++) o.push([x, y]); return o; };
  const slash = (n, dir) => { const o = []; for (let i = -n; i <= n; i++) { o.push([i * dir, -i]); o.push([i * dir + 1, -i]); } return o; };
  const BRUSHES = [disc(0), disc(1), disc(2), disc(3), disc(4), disc(6), box(0, 0), box(1, 1), box(2, 2), box(3, 3), box(5, 0), box(0, 5), slash(3, 1), slash(3, -1), slash(6, 1), slash(6, -1)];

  /* The tools, two to a row, in the order the palette shows them. */
  const TOOLS = ['lasso', 'select', 'hand', 'text', 'bucket', 'spray', 'brush', 'pencil', 'line', 'eraser', 'rect', 'frect', 'rrect', 'frrect', 'oval', 'foval', 'blob', 'fblob', 'poly', 'fpoly'];
  const T = 'fill="none" stroke="#000" stroke-width="1.1"';
  // The filled tools' grey: a plain mid-grey, which every browser draws the same.
  const G = 'fill="#8c8c8c" stroke="#000" stroke-width="1.1"';
  const ICON = {
    lasso: `<path d="M5 10c-2-4 4-7 9-6 5 1 5 5 0 6-3 .8-6 .3-7-1M7 9.5c-.5 2 1 3 0 5" ${T}/>`,
    select: `<rect x="3.5" y="3.5" width="13" height="11" fill="none" stroke="#000" stroke-dasharray="2 1.5"/>`,
    hand: `<path d="M7 16V8.5c0-1 1.6-1 1.6 0V12V5.5c0-1 1.7-1 1.7 0V12V4.5c0-1 1.7-1 1.7 0V12V6c0-1 1.6-1 1.6 0v6.5c0 2-1 3.5-2.8 3.5H9c-1.5 0-2.4-1-3.6-2.6L3.6 11c-.6-.9.5-1.7 1.3-1L7 12" ${T}/>`,
    text: `<text x="10" y="15" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="15">A</text>`,
    bucket: `<path d="M4 9l5-5 6 6-5 5zM4 9l6 1M15 10c1 2 2 3 1.4 4.4" ${T}/><path d="M15.6 13.2c.6 1.2.9 2 .4 2.6" stroke="#000" stroke-width="1.6"/>`,
    spray: `<path d="M9 7h5v9H9zM10 5h3v2h-3z" ${T}/><path d="M4 4h1M3 6h1M5 6h1M4 8h1M6 4h1" stroke="#000"/>`,
    brush: `<path d="M9 2h3v8H9z" ${T}/><path d="M8 10h5l1 3c-1 2-3 3-3.5 4.5C10 16 8 15 7 13z" fill="#000"/>`,
    pencil: `<path d="M13 2.5l3 3-8.5 8.5-4 1 1-4z M11.5 4l3 3M5.5 11.5l2.5 2.5" ${T}/>`,
    line: `<path d="M4 4l12 11" stroke="#000" stroke-width="1.4"/>`,
    eraser: `<path d="M3 13l7-8h7l-7 8z M3 13v2h7l7-8V5" ${T}/>`,
    rect: `<rect x="3.5" y="4.5" width="13" height="10" ${T}/>`,
    frect: `<rect x="3.5" y="4.5" width="13" height="10" ${G}/>`,
    rrect: `<rect x="3.5" y="4.5" width="13" height="10" rx="3" ${T}/>`,
    frrect: `<rect x="3.5" y="4.5" width="13" height="10" rx="3" ${G}/>`,
    oval: `<ellipse cx="10" cy="9.5" rx="6.5" ry="5" ${T}/>`,
    foval: `<ellipse cx="10" cy="9.5" rx="6.5" ry="5" ${G}/>`,
    blob: `<path d="M5 6c2-3 4 0 6-1s5-2 5 2-3 3-3 5-6 3-8 1-2-5 0-7z" ${T}/>`,
    fblob: `<path d="M5 6c2-3 4 0 6-1s5-2 5 2-3 3-3 5-6 3-8 1-2-5 0-7z" ${G}/>`,
    poly: `<path d="M4 15l2-10 6 3 5-3-1 10z" ${T}/>`,
    fpoly: `<path d="M4 15l2-10 6 3 5-3-1 10z" ${G}/>`
  };
  const svgIcon = (k) => `<svg viewBox="0 0 20 19" width="20" height="19" aria-hidden="true" shape-rendering="crispEdges">${ICON[k]}</svg>`;
  const FONTS = [['Chicago', "'Pixelify Sans', Chicago, sans-serif"], ['Geneva', 'Geneva, Verdana, sans-serif'], ['New York', "'New York', Georgia, 'Times New Roman', serif"], ['Monaco', 'Monaco, Menlo, monospace'], ['Venice', "'Apple Chancery', 'Snell Roundhand', cursive"], ['Athens', "'Courier New', Courier, monospace"]];
  const SIZES = [9, 10, 12, 14, 18, 24, 36];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  const open = (screen, { onQuit } = {}) => {
    if (screen.querySelector(':scope > .spnt')) return;
    const SFX = window.SFX || { click() {}, beep() {} };

    /* ------------------------------------------------------------ state */
    let doc = new Uint8Array(W * H);          // 1 = black
    let saved = doc.slice();
    let undoBuf = null;
    let tool = 'pencil', pat = 0, lineW = 1, brush = 2;
    let vx = 0, vy = 0;                       // the window's place on the page
    let fat = false, fx = 0, fy = 0;          // FatBits and its place
    let grid = false, mirror = false;
    let font = 0, size = 12, style = { bold: false, italic: false, underline: false, outline: false, shadow: false }, align = 'left';
    let sel = null;                            // { x, y, w, h, mask, pix, floating }
    let clip = null;
    let text = null;                           // { x, y, s }
    let poly = null;                           // points while a polygon is drawn

    /* -------------------------------------------------------------- DOM */
    const el = h('div', 'spnt');
    el.innerHTML = `<div class="smp-stage">
      <div class="smp-bar">${[['apple', '<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M8 4c1-2 3-2.5 3.5-2.5C11.4 3 10 4.4 8 4zM11 5c1.6 0 2.6.9 3 1.5-2.6 1.3-2.2 5 .3 6-.6 1.6-1.8 3.2-3 3.2-1 0-1.4-.6-2.6-.6s-1.6.6-2.6.6C4.6 15.7 2 12.4 2 9.2 2 6.6 3.7 5 5.5 5c1 0 1.9.7 2.5.7S9.8 5 11 5z" fill="#000"/></svg>'], ['file', 'File'], ['edit', 'Edit'], ['goodies', 'Goodies'], ['font', 'Font'], ['size', 'FontSize'], ['style', 'Style']].map(([k, l]) => `<button type="button" class="smp-m" data-m="${k}">${l}</button>`).join('')}</div>
      <div class="smp-tools">${TOOLS.map((t) => `<button type="button" data-t="${t}" aria-label="${t}">${svgIcon(t)}</button>`).join('')}</div>
      <div class="smp-widths">${[0, 1, 2, 3, 4].map((w) => `<button type="button" data-w="${w}"><i style="height:${w || 1}px"${w ? '' : ' class="dot"'}></i></button>`).join('')}</div>
      <div class="smp-win"><div class="smp-title"><button type="button" class="smp-close" aria-label="Close"></button><span>untitled</span></div><div class="smp-view"><canvas class="smp-c" width="${VW}" height="${VH}"></canvas><canvas class="smp-o" width="${VW}" height="${VH}"></canvas></div></div>
      <div class="smp-pats"><div class="smp-cur"><canvas width="32" height="24"></canvas></div><div class="smp-grid">${PATS.map((_, i) => `<button type="button" data-p="${i}"><canvas width="16" height="12"></canvas></button>`).join('')}</div></div>
      <input class="smp-file" type="file" accept="image/*" hidden />
    </div>`;
    screen.appendChild(el);
    const stage = el.querySelector('.smp-stage');
    const cv = el.querySelector('.smp-c'), ov = el.querySelector('.smp-o');
    const cx = cv.getContext('2d'), ox = ov.getContext('2d');
    const img = cx.createImageData(VW, VH);
    const fileIn = el.querySelector('input[type=file]');

    const fit = () => {
      const r = screen.getBoundingClientRect(), w = screen.clientWidth, hh = screen.clientHeight;
      if (!w || !hh) return;
      stage.style.transform = `scale(${w / 512}, ${hh / 342})`;
      void r;
    };
    fit();
    const ro = window.ResizeObserver ? new ResizeObserver(fit) : null;
    ro && ro.observe(screen);

    /* Pattern swatches. */
    const drawPat = (c, p, scale = 1) => {
      const g = c.getContext('2d'), w = c.width, hh = c.height;
      g.fillStyle = '#fff'; g.fillRect(0, 0, w, hh); g.fillStyle = '#000';
      for (let y = 0; y < hh; y += scale) for (let x = 0; x < w; x += scale) if ((PATS[p][(y / scale) & 7] >> (7 - ((x / scale) & 7))) & 1) g.fillRect(x, y, scale, scale);
    };
    el.querySelectorAll('.smp-grid canvas').forEach((c, i) => drawPat(c, i));
    const showUi = () => {
      el.querySelectorAll('.smp-tools button').forEach((b) => b.classList.toggle('on', b.dataset.t === tool));
      el.querySelectorAll('.smp-widths button').forEach((b) => b.classList.toggle('on', +b.dataset.w === lineW));
      drawPat(el.querySelector('.smp-cur canvas'), pat);
      el.classList.toggle('is-fat', fat);
    };

    /* --------------------------------------------------------- the page */
    const inPage = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
    const get = (x, y) => (inPage(x, y) ? doc[y * W + x] : 0);
    const set = (x, y, v) => { if (inPage(x, y)) doc[y * W + x] = v; };
    const pbit = (p, x, y) => (PATS[p][y & 7] >> (7 - (x & 7))) & 1;
    const paint = (x, y) => set(x, y, pbit(pat, x, y));
    const mirrorX = (x) => vx + VW - 1 - (x - vx);
    const stamp = (x, y, shape, fn) => { shape.forEach(([a, b]) => { fn(x + a, y + b); if (mirror) fn(mirrorX(x + a), y + b); }); };
    const line = (x0, y0, x1, y1, fn) => {
      let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx + dy;
      for (;;) { fn(x0, y0); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
    };
    const keep = () => { undoBuf = doc.slice(); };
    /* The line width chosen below the tools also thickens the pencil and the
       brush: their shape is grown by a round pen of that width. */
    const thick = (shape, w) => {
      if (w <= 1) return shape;
      const d = disc(w - 1), s = new Set();
      shape.forEach(([a, b]) => d.forEach(([u, v]) => s.add((a + u) + ',' + (b + v))));
      return [...s].map((t) => t.split(',').map(Number));
    };

    /* Shapes are drawn into a scratch canvas and read back as dots, with no
       smoothing: whatever crosses half a dot is a dot. */
    const scratch = document.createElement('canvas');
    const shapeMask = (draw, bx, by, bw, bh) => {
      scratch.width = Math.max(1, bw); scratch.height = Math.max(1, bh);
      const g = scratch.getContext('2d', { willReadFrequently: true });
      g.clearRect(0, 0, bw, bh); g.save(); g.translate(-bx, -by); draw(g); g.restore();
      const d = g.getImageData(0, 0, bw, bh).data, m = new Uint8Array(bw * bh);
      for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 110 ? 1 : 0;
      return m;
    };
    const pathOf = (kind, a, b, pts) => (g) => {
      g.beginPath();
      const x = Math.min(a.x, b.x) + .5, y = Math.min(a.y, b.y) + .5, w = Math.abs(b.x - a.x), hh = Math.abs(b.y - a.y);
      if (kind === 'rect') g.rect(x, y, w, hh);
      else if (kind === 'rrect') { const r = Math.min(8, w / 2, hh / 2); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + hh, r); g.arcTo(x + w, y + hh, x, y + hh, r); g.arcTo(x, y + hh, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
      else if (kind === 'oval') g.ellipse(x + w / 2, y + hh / 2, Math.max(.5, w / 2), Math.max(.5, hh / 2), 0, 0, Math.PI * 2);
      else { pts.forEach((p, i) => (i ? g.lineTo(p.x + .5, p.y + .5) : g.moveTo(p.x + .5, p.y + .5))); g.closePath(); }
    };
    const putShape = (kind, filled, a, b, pts) => {
      const xs = pts ? pts.map((p) => p.x) : [a.x, b.x], ys = pts ? pts.map((p) => p.y) : [a.y, b.y];
      const pad = lineW + 2, bx = Math.min(...xs) - pad, by = Math.min(...ys) - pad, bw = Math.max(...xs) - bx + pad + 1, bh = Math.max(...ys) - by + pad + 1;
      const path = pathOf(kind, a, b, pts);
      if (filled) { const m = shapeMask((g) => { path(g); g.fill(); }, bx, by, bw, bh); for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) if (m[y * bw + x]) paint(bx + x, by + y); }
      if (lineW) { const m = shapeMask((g) => { path(g); g.lineWidth = lineW; g.stroke(); }, bx, by, bw, bh); for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) if (m[y * bw + x]) set(bx + x, by + y, 1); }
    };
    const fill = (sx, sy) => {
      if (!inPage(sx, sy)) return;
      const from = get(sx, sy), seen = new Uint8Array(W * H), st = [sx, sy];
      while (st.length) {
        const y = st.pop(), x = st.pop();
        if (!inPage(x, y) || seen[y * W + x] || doc[y * W + x] !== from) continue;
        let l = x, r = x;
        while (l > 0 && !seen[y * W + l - 1] && doc[y * W + l - 1] === from) l--;
        while (r < W - 1 && !seen[y * W + r + 1] && doc[y * W + r + 1] === from) r++;
        for (let i = l; i <= r; i++) { seen[y * W + i] = 1; st.push(i, y - 1, i, y + 1); }
      }
      for (let i = 0; i < seen.length; i++) if (seen[i]) doc[i] = pbit(pat, i % W, (i / W) | 0);
    };

    /* Text, set in the chosen font, size and style, and stamped as dots. */
    const textMask = (t) => {
      const lines = t.s.split('\n'), lh = Math.round(size * 1.25);
      const fam = FONTS[font][1], f = `${style.italic ? 'italic ' : ''}${style.bold ? 'bold ' : ''}${size}px ${fam}`;
      const g0 = scratch.getContext('2d'); g0.font = f;
      const widths = lines.map((l) => Math.ceil(g0.measureText(l).width));
      const bw = Math.max(4, ...widths) + 6, bh = lines.length * lh + 6;
      let m = shapeMask((g) => {
        g.font = f; g.fillStyle = '#000'; g.textBaseline = 'alphabetic';
        lines.forEach((l, i) => {
          const w = widths[i], x = align === 'left' ? 2 : align === 'center' ? (bw - w) / 2 : bw - w - 3, y = 2 + (i + 1) * lh - Math.round(size * .3);
          g.fillText(l, x, y);
          if (style.underline) g.fillRect(x, y + 2, w, Math.max(1, Math.round(size / 12)));
        });
      }, 0, 0, bw, bh);
      if (style.outline || style.shadow) {
        const o = new Uint8Array(bw * bh), at = (x, y) => (x >= 0 && y >= 0 && x < bw && y < bh ? m[y * bw + x] : 0);
        for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
          const near = at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1) || (style.shadow && (at(x - 1, y - 1) || at(x - 2, y - 2) || at(x - 2, y - 1) || at(x - 1, y - 2)));
          o[y * bw + x] = near && !m[y * bw + x] ? 1 : 0;
        }
        m = o;
      }
      const ox0 = align === 'left' ? t.x - 2 : align === 'center' ? t.x - bw / 2 : t.x - bw + 3;
      return { m, bw, bh, x: Math.round(ox0), y: t.y - Math.round(size * .95) - 2 };
    };
    const commitText = () => {
      if (!text) return;
      if (text.s) { keep(); const { m, bw, bh, x, y } = textMask(text); for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++) if (m[j * bw + i]) set(x + i, y + j, 1); }
      text = null; render();
    };

    /* Selections float above the page while they are moved. */
    const lift = () => {
      if (!sel || sel.floating) return;
      keep();
      sel.pix = new Uint8Array(sel.w * sel.h);
      for (let y = 0; y < sel.h; y++) for (let x = 0; x < sel.w; x++) if (sel.mask[y * sel.w + x]) { sel.pix[y * sel.w + x] = get(sel.x + x, sel.y + y); set(sel.x + x, sel.y + y, 0); }
      sel.floating = true;
    };
    const drop = () => {
      if (sel && sel.floating) for (let y = 0; y < sel.h; y++) for (let x = 0; x < sel.w; x++) if (sel.mask[y * sel.w + x]) set(sel.x + x, sel.y + y, sel.pix[y * sel.w + x]);
      sel = null; render();
    };
    const pixelsOf = (s) => { const p = new Uint8Array(s.w * s.h); for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) p[y * s.w + x] = s.floating ? s.pix[y * s.w + x] : get(s.x + x, s.y + y); return p; };
    const rectSel = (x, y, w, hh) => ({ x, y, w, h: hh, mask: new Uint8Array(w * hh).fill(1), floating: false });

    /* ----------------------------------------------------------- render */
    let ants = 0;
    const render = () => {
      const d = img.data;
      if (!fat) {
        for (let y = 0; y < VH; y++) for (let x = 0; x < VW; x++) {
          const v = get(vx + x, vy + y) ? 0 : 255, i = (y * VW + x) * 4;
          d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
        }
      } else {
        for (let y = 0; y < VH; y++) for (let x = 0; x < VW; x++) {
          const px = fx + ((x / FAT) | 0), py = fy + ((y / FAT) | 0), edge = x % FAT === FAT - 1 || y % FAT === FAT - 1;
          const v = get(px, py) ? 0 : (edge ? 238 : 255), i = (y * VW + x) * 4;
          d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
        }
      }
      cx.putImageData(img, 0, 0);
      overlay();
    };
    const toView = (x, y) => (fat ? { x: (x - fx) * FAT, y: (y - fy) * FAT, k: FAT } : { x: x - vx, y: y - vy, k: 1 });
    let preview = null;
    const overlay = () => {
      ox.clearRect(0, 0, VW, VH);
      if (grid && !fat) { ox.fillStyle = 'rgba(0,0,0,.25)'; for (let x = (8 - (vx & 7)) & 7; x < VW; x += 8) for (let y = (8 - (vy & 7)) & 7; y < VH; y += 8) ox.fillRect(x, y, 1, 1); }
      if (sel) {
        const a = toView(sel.x, sel.y);
        if (sel.floating) {
          for (let y = 0; y < sel.h; y++) for (let x = 0; x < sel.w; x++) if (sel.mask[y * sel.w + x]) { ox.fillStyle = sel.pix[y * sel.w + x] ? '#000' : '#fff'; ox.fillRect(a.x + x * a.k, a.y + y * a.k, a.k, a.k); }
        }
        ox.save(); ox.setLineDash([3, 3]); ox.lineDashOffset = -ants; ox.strokeStyle = '#000'; ox.lineWidth = 1;
        if (sel.outline) { ox.beginPath(); sel.outline.forEach((p, i) => { const q = toView(p.x + (sel.x - sel.ox), p.y + (sel.y - sel.oy)); i ? ox.lineTo(q.x + .5, q.y + .5) : ox.moveTo(q.x + .5, q.y + .5); }); ox.closePath(); ox.stroke(); ox.strokeStyle = '#fff'; ox.lineDashOffset = -ants + 3; ox.stroke(); }
        else { ox.strokeRect(a.x + .5, a.y + .5, sel.w * a.k - 1, sel.h * a.k - 1); ox.strokeStyle = '#fff'; ox.lineDashOffset = -ants + 3; ox.strokeRect(a.x + .5, a.y + .5, sel.w * a.k - 1, sel.h * a.k - 1); }
        ox.restore();
      }
      if (preview) preview();
      if (text) {
        const { m, bw, bh, x, y } = textMask(text), a = toView(x, y);
        ox.fillStyle = '#000';
        for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++) if (m[j * bw + i]) ox.fillRect(a.x + i * a.k, a.y + j * a.k, a.k, a.k);
        if ((ants >> 3) & 1) { const c = toView(text.x + (align === 'left' ? Math.ceil(scratch.getContext('2d').measureText(text.s.split('\n').pop()).width) : 0), text.y - size); ox.fillRect(c.x, c.y, 1, size * c.k + 2); }
      }
    };
    const antsT = setInterval(() => { if (!el.isConnected) { clearInterval(antsT); return; } if (sel || text) { ants = (ants + 1) % 16; overlay(); } }, 120);

    /* A preview of a shape or line drawn straight onto the overlay. */
    const previewMask = (m, bx, by, bw, bh) => () => {
      ox.fillStyle = '#000';
      for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) if (m[y * bw + x]) { const a = toView(bx + x, by + y); ox.fillRect(a.x, a.y, a.k, a.k); }
    };

    /* ----------------------------------------------------------- input */
    const at = (e) => {
      const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * VW / r.width, y = (e.clientY - r.top) * VH / r.height;
      let px = fat ? fx + Math.floor(x / FAT) : vx + Math.floor(x), py = fat ? fy + Math.floor(y / FAT) : vy + Math.floor(y);
      return { x: px, y: py, vx: x, vy: y };
    };
    const snap = (p) => (grid ? { x: Math.round(p.x / 8) * 8, y: Math.round(p.y / 8) * 8 } : p);
    const constrain = (a, b, e, square) => {
      if (!e.shiftKey) return b;
      if (square) { const d = Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y)); return { x: a.x + Math.sign(b.x - a.x || 1) * d, y: a.y + Math.sign(b.y - a.y || 1) * d }; }
      return Math.abs(b.x - a.x) > Math.abs(b.y - a.y) ? { x: b.x, y: a.y } : { x: a.x, y: b.y };
    };
    let drag = null, lastTap = { t: 0, tool: '' };
    const view = el.querySelector('.smp-view');
    view.addEventListener('pointerdown', (e) => {
      if (e.button) return;
      e.preventDefault();
      closeMenu();
      view.setPointerCapture(e.pointerId);
      const p = at(e), s = snap(p);
      if (tool !== 'text') commitText();
      if (tool === 'poly' || tool === 'fpoly') {
        const now = performance.now();
        if (!poly) { keep(); poly = [s]; }
        else if (now - (poly.t || 0) < 320 || (Math.abs(s.x - poly[0].x) < 3 && Math.abs(s.y - poly[0].y) < 3 && poly.length > 2)) { putShape('poly', tool === 'fpoly', null, null, poly); poly = null; preview = null; render(); return; }
        else poly.push(s);
        poly.t = now;
        return;
      }
      if (sel && (tool === 'select' || tool === 'lasso') && p.x >= sel.x && p.y >= sel.y && p.x < sel.x + sel.w && p.y < sel.y + sel.h && sel.mask[(p.y - sel.y) * sel.w + (p.x - sel.x)]) {
        lift();
        drag = { kind: 'move', dx: p.x - sel.x, dy: p.y - sel.y };
        return;
      }
      if (sel) drop();
      const a = s;
      switch (tool) {
        case 'pencil': keep(); drag = { kind: 'pencil', v: get(p.x, p.y) ? 0 : 1, last: p, pen: thick([[0, 0]], lineW) }; stamp(p.x, p.y, drag.pen, (x, y) => set(x, y, drag.v)); break;
        case 'brush': keep(); drag = { kind: 'brush', last: p, pen: thick(BRUSHES[brush], lineW) }; stamp(p.x, p.y, drag.pen, paint); break;
        case 'eraser': keep(); drag = { kind: 'eraser', last: p }; stamp(p.x, p.y, box(fat ? 1 : 7, fat ? 1 : 7), (x, y) => set(x, y, 0)); break;
        case 'spray': keep(); drag = { kind: 'spray', p }; break;
        case 'bucket': keep(); fill(p.x, p.y); break;
        case 'hand': drag = { kind: 'hand', sx: e.clientX, sy: e.clientY, vx0: fat ? fx : vx, vy0: fat ? fy : vy }; break;
        case 'text': commitText(); text = { x: p.x, y: p.y + size, s: '' }; break;
        case 'select': drag = { kind: 'select', a: p, b: p }; break;
        case 'lasso': drag = { kind: 'lasso', pts: [p] }; break;
        case 'blob': case 'fblob': keep(); drag = { kind: 'blob', pts: [p] }; break;
        default: keep(); drag = { kind: 'shape', a, b: a }; break;
      }
      render();
    });
    view.addEventListener('pointermove', (e) => {
      if (poly && !drag) {
        const s = snap(at(e)), pts = [...poly, s];
        preview = () => { ox.strokeStyle = '#000'; ox.lineWidth = fat ? FAT : 1; ox.beginPath(); pts.forEach((q, i) => { const v = toView(q.x, q.y); i ? ox.lineTo(v.x + .5, v.y + .5) : ox.moveTo(v.x + .5, v.y + .5); }); ox.stroke(); };
        overlay();
      }
      if (!drag) return;
      const p = at(e);
      const k = drag.kind;
      if (k === 'pencil') { line(drag.last.x, drag.last.y, p.x, p.y, (x, y) => stamp(x, y, drag.pen, (a, b) => set(a, b, drag.v))); drag.last = p; render(); }
      else if (k === 'brush') { line(drag.last.x, drag.last.y, p.x, p.y, (x, y) => stamp(x, y, drag.pen, paint)); drag.last = p; render(); }
      else if (k === 'eraser') { const r = fat ? 1 : 7; line(drag.last.x, drag.last.y, p.x, p.y, (x, y) => stamp(x, y, box(r, r), (a, b) => set(a, b, 0))); drag.last = p; render(); }
      else if (k === 'spray') drag.p = p;
      else if (k === 'hand') {
        const r = cv.getBoundingClientRect(), kk = (fat ? 1 / FAT : 1) * VW / r.width;
        const nx = Math.round(drag.vx0 - (e.clientX - drag.sx) * kk), ny = Math.round(drag.vy0 - (e.clientY - drag.sy) * kk);
        if (fat) { fx = Math.max(0, Math.min(W - VW / FAT, nx)); fy = Math.max(0, Math.min(H - VH / FAT, ny)); } else { vx = Math.max(0, Math.min(W - VW, nx)); vy = Math.max(0, Math.min(H - VH, ny)); }
        render();
      } else if (k === 'move') { sel.x = p.x - drag.dx; sel.y = p.y - drag.dy; overlay(); }
      else if (k === 'select') { drag.b = p; const x = Math.min(drag.a.x, p.x), y = Math.min(drag.a.y, p.y), w = Math.abs(p.x - drag.a.x), hh = Math.abs(p.y - drag.a.y); preview = () => { ox.save(); ox.setLineDash([3, 3]); ox.strokeStyle = '#000'; const v = toView(x, y); ox.strokeRect(v.x + .5, v.y + .5, w * v.k, hh * v.k); ox.restore(); }; overlay(); }
      else if (k === 'lasso' || k === 'blob') {
        drag.pts.push(p);
        const pts = drag.pts;
        preview = () => { ox.strokeStyle = '#000'; ox.lineWidth = 1; ox.beginPath(); pts.forEach((q, i) => { const v = toView(q.x, q.y); i ? ox.lineTo(v.x + .5, v.y + .5) : ox.moveTo(v.x + .5, v.y + .5); }); if (k === 'lasso') ox.setLineDash([2, 2]); ox.stroke(); ox.setLineDash([]); };
        overlay();
      } else if (k === 'shape') {
        const sq = /rect|oval/.test(tool);
        drag.b = constrain(drag.a, snap(p), e, sq);
        const a = drag.a, b = drag.b;
        if (tool === 'line') {
          const pts = []; line(a.x, a.y, b.x, b.y, (x, y) => pts.push([x, y]));
          const r = Math.floor((lineW || 1) / 2);
          preview = () => { ox.fillStyle = '#000'; pts.forEach(([x, y]) => { const v = toView(x - r, y - r); ox.fillRect(v.x, v.y, (lineW || 1) * v.k, (lineW || 1) * v.k); }); };
        } else {
          const kind = tool.replace(/^f/, ''), filled = tool[0] === 'f';
          const pad = lineW + 2, bx = Math.min(a.x, b.x) - pad, by = Math.min(a.y, b.y) - pad, bw = Math.abs(b.x - a.x) + pad * 2 + 1, bh = Math.abs(b.y - a.y) + pad * 2 + 1;
          const path = pathOf(kind, a, b);
          const mf = filled ? shapeMask((g) => { path(g); g.fill(); }, bx, by, bw, bh) : null;
          const ms = lineW ? shapeMask((g) => { path(g); g.lineWidth = lineW; g.stroke(); }, bx, by, bw, bh) : null;
          preview = () => {
            for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
              const on = ms && ms[y * bw + x] ? 1 : mf && mf[y * bw + x] ? pbit(pat, bx + x, by + y) + 2 : 0;
              if (!on) continue;
              ox.fillStyle = on === 1 || on === 3 ? '#000' : '#fff';
              const v = toView(bx + x, by + y); ox.fillRect(v.x, v.y, v.k, v.k);
            }
          };
        }
        overlay();
      }
    });
    const end = () => {
      if (!drag) return;
      const k = drag.kind, d = drag;
      drag = null;
      if (k === 'shape') {
        preview = null;
        const a = d.a, b = d.b;
        if (tool === 'line') { const wdt = lineW || 1, r = Math.floor(wdt / 2), pen = []; for (let j = 0; j < wdt; j++) for (let i = 0; i < wdt; i++) pen.push([i - r, j - r]); line(a.x, a.y, b.x, b.y, (x, y) => stamp(x, y, pen, (q, w) => set(q, w, 1))); }
        else if (a.x !== b.x || a.y !== b.y) putShape(tool.replace(/^f/, ''), tool[0] === 'f', a, b);
      } else if (k === 'blob') { preview = null; if (d.pts.length > 2) putShape('poly', tool === 'fblob', null, null, d.pts); }
      else if (k === 'select') {
        preview = null;
        const x = Math.min(d.a.x, d.b.x), y = Math.min(d.a.y, d.b.y), w = Math.abs(d.b.x - d.a.x), hh = Math.abs(d.b.y - d.a.y);
        if (w > 1 && hh > 1) sel = rectSel(x, y, w, hh);
      } else if (k === 'lasso') {
        preview = null;
        if (d.pts.length > 3) {
          const xs = d.pts.map((q) => q.x), ys = d.pts.map((q) => q.y), bx = Math.min(...xs), by = Math.min(...ys), bw = Math.max(...xs) - bx + 1, bh = Math.max(...ys) - by + 1;
          const mask = shapeMask((g) => { g.beginPath(); d.pts.forEach((q, i) => (i ? g.lineTo(q.x + .5, q.y + .5) : g.moveTo(q.x + .5, q.y + .5))); g.closePath(); g.fill(); }, bx, by, bw, bh);
          // What the loop encloses is the selection.
          sel = { x: bx, y: by, w: bw, h: bh, mask, floating: false, outline: d.pts, ox: bx, oy: by };
        }
      }
      render();
    };
    view.addEventListener('pointerup', end);
    view.addEventListener('pointercancel', end);
    /* The spray can keeps spraying while it is held still. */
    const sprayT = setInterval(() => {
      if (!el.isConnected) { clearInterval(sprayT); return; }
      if (!drag || drag.kind !== 'spray') return;
      for (let i = 0; i < 14; i++) { const a = Math.random() * 6.283, r = Math.random() * 9; const x = Math.round(drag.p.x + Math.cos(a) * r), y = Math.round(drag.p.y + Math.sin(a) * r); paint(x, y); if (mirror) paint(mirrorX(x), y); }
      render();
    }, 30);

    /* Double clicks on a tool, as in the original: the eraser clears the
       window, the marquee selects it all, the pencil turns FatBits on and
       off, the brush picks its shape, the hand shows the whole page. */
    el.querySelector('.smp-tools').addEventListener('click', (e) => {
      const b = e.target.closest('[data-t]');
      if (!b) return;
      SFX.click();
      const t = b.dataset.t, now = performance.now(), dbl = lastTap.tool === t && now - lastTap.t < 380;
      lastTap = { t: now, tool: t };
      commitText(); if (sel) drop(); poly = null; preview = null;
      tool = t;
      if (dbl) {
        if (t === 'eraser') { keep(); for (let y = 0; y < VH; y++) for (let x = 0; x < VW; x++) set(vx + x, vy + y, 0); }
        if (t === 'select') { sel = rectSel(vx, vy, VW, VH); }
        if (t === 'pencil') toggleFat(vx + VW / 2, vy + VH / 2);
        if (t === 'brush') brushDialog();
        if (t === 'hand') showPage();
      }
      showUi(); render();
    });
    el.querySelector('.smp-widths').addEventListener('click', (e) => { const b = e.target.closest('[data-w]'); if (!b) return; SFX.click(); lineW = +b.dataset.w; showUi(); });
    let lastPat = { t: 0, p: -1 };
    el.querySelector('.smp-grid').addEventListener('click', (e) => {
      const b = e.target.closest('[data-p]');
      if (!b) return;
      SFX.click();
      const now = performance.now(), dbl = lastPat.p === +b.dataset.p && now - lastPat.t < 380;
      lastPat = { t: now, p: +b.dataset.p };
      pat = +b.dataset.p; showUi();
      if (dbl) editPattern();
    });
    el.querySelector('.smp-close').addEventListener('click', () => { SFX.click(); newPic(); });

    /* ----------------------------------------------------------- goodies */
    const toggleFat = (cx0, cy0) => {
      fat = !fat;
      if (fat) { fx = Math.max(0, Math.min(W - VW / FAT, Math.round(cx0 - VW / FAT / 2))); fy = Math.max(0, Math.min(H - VH / FAT, Math.round(cy0 - VH / FAT / 2))); }
      showUi(); render();
    };
    const dialog = (html, buttons = ['OK']) => new Promise((res) => {
      const d = h('div', 'smp-dlg', `<div class="smp-dbox">${html}<div class="smp-dbtns">${buttons.map((b, i) => `<button type="button" data-i="${i}"${i === buttons.length - 1 ? ' class="def"' : ''}>${esc(b)}</button>`).join('')}</div></div>`);
      stage.appendChild(d);
      d.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) { SFX.click(); d.remove(); res(+b.dataset.i); } });
      d.__res = res;
    });
    const brushDialog = () => {
      const d = h('div', 'smp-dlg', `<div class="smp-dbox"><p><b>Brush Shape</b></p><div class="smp-brushes">${BRUSHES.map((s, i) => `<button type="button" data-b="${i}" class="${i === brush ? 'on' : ''}"><canvas width="16" height="16"></canvas></button>`).join('')}</div><div class="smp-dbtns"><button type="button" class="def" data-ok>OK</button></div></div>`);
      stage.appendChild(d);
      d.querySelectorAll('.smp-brushes canvas').forEach((c, i) => { const g = c.getContext('2d'); g.fillStyle = '#000'; BRUSHES[i].forEach(([x, y]) => g.fillRect(8 + x, 8 + y, 1, 1)); });
      d.addEventListener('click', (e) => { const b = e.target.closest('[data-b]'); if (b) { SFX.click(); brush = +b.dataset.b; d.querySelectorAll('[data-b]').forEach((x) => x.classList.toggle('on', x === b)); } if (e.target.closest('[data-ok]')) { SFX.click(); d.remove(); } });
    };
    const editPattern = () => {
      const bits = PATS[pat].slice();
      const d = h('div', 'smp-dlg', `<div class="smp-dbox"><p><b>Edit Pattern</b></p><div class="smp-pe"><div class="smp-pebits">${[...Array(64)].map((_, i) => `<button type="button" data-q="${i}"></button>`).join('')}</div><canvas width="48" height="48"></canvas></div><div class="smp-dbtns"><button type="button" data-c>Cancel</button><button type="button" class="def" data-ok>OK</button></div></div>`);
      stage.appendChild(d);
      const paintBits = () => { d.querySelectorAll('[data-q]').forEach((b) => { const i = +b.dataset.q; b.classList.toggle('on', !!((bits[i >> 3] >> (7 - (i & 7))) & 1)); }); const c = d.querySelector('canvas'), g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 48, 48); g.fillStyle = '#000'; for (let y = 0; y < 48; y++) for (let x = 0; x < 48; x++) if ((bits[y & 7] >> (7 - (x & 7))) & 1) g.fillRect(x, y, 1, 1); };
      paintBits();
      d.addEventListener('click', (e) => {
        const b = e.target.closest('[data-q]');
        if (b) { const i = +b.dataset.q; bits[i >> 3] ^= 1 << (7 - (i & 7)); paintBits(); return; }
        if (e.target.closest('[data-ok]')) { SFX.click(); PATS[pat] = bits; drawPat(el.querySelectorAll('.smp-grid canvas')[pat], pat); showUi(); d.remove(); }
        if (e.target.closest('[data-c]')) { SFX.click(); d.remove(); }
      });
    };
    /* The whole page, small: click where the window should go. */
    const showPage = () => {
      const k = 0.4, d = h('div', 'smp-dlg', `<div class="smp-dbox smp-page"><p><b>Show Page</b>: click to move the window.</p><canvas width="${W * k}" height="${H * k}"></canvas><div class="smp-dbtns"><button type="button" class="def" data-ok>OK</button></div></div>`);
      stage.appendChild(d);
      const c = d.querySelector('canvas'), g = c.getContext('2d');
      const draw = () => {
        const im = g.createImageData(c.width, c.height);
        for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) { const v = get((x / k) | 0, (y / k) | 0) ? 0 : 255, i = (y * c.width + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
        g.putImageData(im, 0, 0); g.strokeStyle = '#000'; g.setLineDash([2, 2]); g.strokeRect(vx * k + .5, vy * k + .5, VW * k, VH * k);
      };
      draw();
      c.addEventListener('click', (e) => { const r = c.getBoundingClientRect(); vx = Math.max(0, Math.min(W - VW, Math.round((e.clientX - r.left) / r.width * W - VW / 2))); vy = Math.max(0, Math.min(H - VH, Math.round((e.clientY - r.top) / r.height * H - VH / 2))); fat = false; draw(); showUi(); render(); });
      d.querySelector('[data-ok]').addEventListener('click', () => { SFX.click(); d.remove(); });
    };

    /* ------------------------------------------------------------ edit */
    const area = () => sel || rectSel(vx, vy, VW, VH);
    const transform = (fn) => {
      const s = area(); const was = !!sel;
      if (!s.floating) { sel = s; lift(); }
      const { w, h: hh } = sel, p = sel.pix, m = sel.mask;
      const r = fn(w, hh);
      const np = new Uint8Array(r.w * r.h), nm = new Uint8Array(r.w * r.h);
      for (let y = 0; y < hh; y++) for (let x = 0; x < w; x++) { const [a, b] = r.map(x, y); np[b * r.w + a] = p[y * w + x]; nm[b * r.w + a] = m[y * w + x]; }
      sel.pix = np; sel.mask = nm; sel.w = r.w; sel.h = r.h; sel.outline = null;
      if (!was) drop(); else render();
    };
    const edit = {
      undo() { if (!undoBuf) return; const cur = doc; doc = undoBuf; undoBuf = cur; sel = null; render(); },
      cut() { if (!sel) return; clip = { w: sel.w, h: sel.h, mask: sel.mask.slice(), pix: pixelsOf(sel) }; edit.clear(); },
      copy() { if (!sel) return; clip = { w: sel.w, h: sel.h, mask: sel.mask.slice(), pix: pixelsOf(sel) }; },
      paste() { if (!clip) return; if (sel) drop(); keep(); sel = { x: vx + Math.max(0, (VW - clip.w) >> 1), y: vy + Math.max(0, (VH - clip.h) >> 1), w: clip.w, h: clip.h, mask: clip.mask.slice(), pix: clip.pix.slice(), floating: true }; tool = 'select'; showUi(); render(); },
      clear() { if (!sel) return; if (!sel.floating) { keep(); for (let y = 0; y < sel.h; y++) for (let x = 0; x < sel.w; x++) if (sel.mask[y * sel.w + x]) set(sel.x + x, sel.y + y, 0); } sel = null; render(); },
      invert() { const s = area(); if (!s.floating) keep(); for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) if (s.mask[y * s.w + x]) { if (s.floating) s.pix[y * s.w + x] ^= 1; else set(s.x + x, s.y + y, get(s.x + x, s.y + y) ^ 1); } render(); },
      fill() { const s = area(); if (!s.floating) keep(); for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) if (s.mask[y * s.w + x]) { const v = pbit(pat, s.x + x, s.y + y); if (s.floating) s.pix[y * s.w + x] = v; else set(s.x + x, s.y + y, v); } render(); },
      trace() {
        const s = area(); if (!s.floating) keep();
        const src = pixelsOf(s), o = new Uint8Array(src.length), q = (x, y) => (x >= 0 && y >= 0 && x < s.w && y < s.h ? src[y * s.w + x] : 0);
        for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) o[y * s.w + x] = !src[y * s.w + x] && (q(x - 1, y) || q(x + 1, y) || q(x, y - 1) || q(x, y + 1)) ? 1 : 0;
        for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) if (s.mask[y * s.w + x]) { if (s.floating) s.pix[y * s.w + x] = o[y * s.w + x]; else set(s.x + x, s.y + y, o[y * s.w + x]); }
        render();
      },
      flipH() { transform((w, hh) => ({ w, h: hh, map: (x, y) => [w - 1 - x, y] })); },
      flipV() { transform((w, hh) => ({ w, h: hh, map: (x, y) => [x, hh - 1 - y] })); },
      rotate() { transform((w, hh) => ({ w: hh, h: w, map: (x, y) => [hh - 1 - y, x] })); },
      selectAll() { if (sel) drop(); sel = rectSel(vx, vy, VW, VH); tool = 'select'; showUi(); render(); }
    };

    /* ------------------------------------------------------------ files */
    const newPic = async () => {
      if (!doc.every((v, i) => v === saved[i])) { const r = await dialog('<p>Save changes to “untitled” before closing?</p>', ['Don’t Save', 'Cancel', 'Save']); if (r === 1) return; if (r === 2) savePic(); }
      keep(); doc = new Uint8Array(W * H); saved = doc.slice(); sel = null; text = null; vx = vy = 0; fat = false; showUi(); render();
    };
    /* The page goes to the visitor's own computer as a PNG: every dot drawn
       as a crisp square, at twice its size so it opens large enough to
       see, cropped to what was drawn (with a margin). */
    const savePic = () => {
      commitText(); if (sel) drop();
      let x0 = W, y0 = H, x1 = -1, y1 = -1;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (doc[y * W + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      if (x1 < 0) { x0 = vx; y0 = vy; x1 = vx + VW - 1; y1 = vy + VH - 1; } else { x0 = Math.max(0, x0 - 16); y0 = Math.max(0, y0 - 16); x1 = Math.min(W - 1, x1 + 16); y1 = Math.min(H - 1, y1 + 16); }
      const S = 2, w = (x1 - x0 + 1), hh = (y1 - y0 + 1), c = document.createElement('canvas');
      c.width = w * S; c.height = hh * S;
      const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.fillStyle = '#000';
      for (let y = 0; y < hh; y++) for (let x = 0; x < w; x++) if (doc[(y0 + y) * W + x0 + x]) g.fillRect(x * S, y * S, S, S);
      c.toBlob((b) => {
        if (!b) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = 'SommiPaint.png';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      }, 'image/png');
      saved = doc.slice();
    };
    /* A picture from the visitor's computer, dithered down to black and
       white dots the way a scanner of the day would have. */
    fileIn.addEventListener('change', () => {
      const f = fileIn.files && fileIn.files[0];
      if (!f) return;
      const im = new Image();
      im.onload = () => {
        const k = Math.min(VW / im.width, VH / im.height, 1), w = Math.round(im.width * k), hh = Math.round(im.height * k);
        const c = document.createElement('canvas'); c.width = w; c.height = hh;
        const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0, w, hh);
        const d = g.getImageData(0, 0, w, hh).data, L = new Float32Array(w * hh);
        for (let i = 0; i < L.length; i++) L[i] = (d[i * 4] * .3 + d[i * 4 + 1] * .59 + d[i * 4 + 2] * .11) / 255;
        const pix = new Uint8Array(w * hh);
        for (let y = 0; y < hh; y++) for (let x = 0; x < w; x++) {
          const i = y * w + x, v = L[i] < .5 ? 0 : 1, e = (L[i] - v) / 8;
          pix[i] = v ? 0 : 1;
          [[1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [0, 2]].forEach(([a, b]) => { const xx = x + a, yy = y + b; if (xx >= 0 && xx < w && yy < hh) L[yy * w + xx] += e; });
        }
        if (sel) drop(); keep();
        sel = { x: vx + ((VW - w) >> 1), y: vy + ((VH - hh) >> 1), w, h: hh, mask: new Uint8Array(w * hh).fill(1), pix, floating: true };
        tool = 'select'; showUi(); render();
        URL.revokeObjectURL(im.src);
      };
      im.src = URL.createObjectURL(f);
      fileIn.value = '';
    });

    /* ------------------------------------------------------------ menus */
    const quit = async () => {
      if (!doc.every((v, i) => v === saved[i])) { const r = await dialog('<p>Save changes to “untitled” before quitting?</p>', ['Don’t Save', 'Cancel', 'Save']); if (r === 1) return; if (r === 2) savePic(); }
      close();
    };
    const MENUS = () => ({
      apple: [['About SommiPaint…', () => dialog('<p><b>SommiPaint</b></p><p>Draw with the tools on the left in the patterns along the bottom. Everything you draw is black and white dots.</p><p>Save to Your Computer… in the File menu keeps your picture.</p>')]],
      file: [['New', newPic, '⌘N'], ['Open…', () => fileIn.click(), '⌘O'], '-', ['Save to Your Computer…', savePic, '⌘S'], ['Revert', () => { keep(); doc = saved.slice(); sel = null; render(); }], '-', ['Print…', () => dialog('<p>No printer is connected.</p><p>Save to Your Computer… and print it from there.</p>')], '-', ['Quit', quit, '⌘Q']],
      edit: [['Undo', undoBuf ? edit.undo : null, '⌘Z'], '-', ['Cut', sel ? edit.cut : null, '⌘X'], ['Copy', sel ? edit.copy : null, '⌘C'], ['Paste', clip ? edit.paste : null, '⌘V'], ['Clear', sel ? edit.clear : null], ['Select All', edit.selectAll, '⌘A'], '-', ['Invert', edit.invert], ['Fill', edit.fill], ['Trace Edges', edit.trace], ['Flip Horizontal', edit.flipH], ['Flip Vertical', edit.flipV], ['Rotate', edit.rotate]],
      goodies: [['Grid', () => { grid = !grid; render(); }, '', grid], ['FatBits', () => toggleFat(vx + VW / 2, vy + VH / 2), '', fat], ['Show Page', showPage], '-', ['Edit Pattern…', editPattern], ['Brush Shape…', brushDialog], ['Brush Mirrors', () => { mirror = !mirror; }, '', mirror], '-', ['Short Cuts…', () => dialog('<p><b>Short Cuts</b></p><p>Double-click the eraser to clear the window, the selection box to select it all, the pencil for FatBits, the brush for its shapes, the hand to see the whole page, and a pattern to edit it.</p><p>Hold Shift to keep lines straight and shapes square. Drag a selection to move it.</p>')]],
      font: FONTS.map(([n], i) => [n, () => { font = i; overlay(); }, '', font === i]),
      size: SIZES.map((s) => [String(s), () => { size = s; overlay(); }, '', size === s]),
      style: [['Plain', () => { Object.keys(style).forEach((k) => { style[k] = false; }); overlay(); }, '', !Object.values(style).some(Boolean)], ...['bold', 'italic', 'underline', 'outline', 'shadow'].map((k) => [k[0].toUpperCase() + k.slice(1), () => { style[k] = !style[k]; overlay(); }, '', style[k], k]), '-', ...['left', 'center', 'right'].map((a) => [`Align ${a === 'center' ? 'Middle' : a[0].toUpperCase() + a.slice(1)}`, () => { align = a; overlay(); }, '', align === a])]
    });
    let openM = null;
    const closeMenu = () => { stage.querySelectorAll('.smp-drop').forEach((d) => d.remove()); stage.querySelectorAll('.smp-m.on').forEach((b) => b.classList.remove('on')); openM = null; };
    const showMenu = (b) => {
      closeMenu();
      openM = b; b.classList.add('on');
      const d = h('div', 'smp-drop');
      MENUS()[b.dataset.m].forEach((it) => {
        if (it === '-') { d.appendChild(h('hr')); return; }
        const [label, fn, key, on, st] = it;
        const x = h('button', (on ? 'chk ' : '') + (st ? 'st-' + st : ''), `<span>${esc(label)}</span><span class="k">${key || ''}</span>`);
        x.type = 'button'; if (!fn) x.disabled = true;
        x.addEventListener('click', () => { closeMenu(); SFX.click(); fn && fn(); });
        d.appendChild(x);
      });
      d.style.left = b.offsetLeft + 'px';
      stage.appendChild(d);
    };
    const bar = el.querySelector('.smp-bar');
    bar.addEventListener('pointerdown', (e) => { const b = e.target.closest('.smp-m'); if (!b) return; e.preventDefault(); if (openM === b) closeMenu(); else showMenu(b); });
    bar.addEventListener('pointerover', (e) => { const b = e.target.closest('.smp-m'); if (openM && b && b !== openM) showMenu(b); });
    stage.addEventListener('pointerdown', (e) => { if (openM && !e.target.closest('.smp-drop, .smp-bar')) closeMenu(); }, true);

    /* ---------------------------------------------------------- keyboard */
    const key = (e) => {
      if (!el.isConnected) return;
      if (stage.querySelector('.smp-dlg')) { if (e.key === 'Escape' || e.key === 'Enter') { const d = stage.querySelector('.smp-dlg'); const b = d.querySelector(e.key === 'Enter' ? '.def' : '[data-c], [data-i="1"]') || d.querySelector('.def'); b && b.click(); e.preventDefault(); } e.stopImmediatePropagation(); return; }
      const mod = e.metaKey || e.ctrlKey, k = e.key.toLowerCase();
      if (mod) {
        const map = { z: edit.undo, x: edit.cut, c: edit.copy, v: edit.paste, a: edit.selectAll, s: savePic, n: newPic, o: () => fileIn.click(), q: quit };
        if (map[k]) { e.preventDefault(); e.stopImmediatePropagation(); map[k](); }
        return;
      }
      if (text) {
        if (e.key === 'Backspace') text.s = text.s.slice(0, -1);
        else if (e.key === 'Enter') text.s += '\n';
        else if (e.key === 'Escape') { commitText(); }
        else if (e.key.length === 1) text.s += e.key;
        else return;
        e.preventDefault(); e.stopImmediatePropagation(); overlay(); return;
      }
      if ((e.key === 'Backspace' || e.key === 'Delete') && sel) { e.preventDefault(); e.stopImmediatePropagation(); edit.clear(); return; }
      if (e.key === 'Escape') { if (sel) drop(); poly = null; preview = null; render(); }
      e.stopImmediatePropagation();
    };
    document.addEventListener('keydown', key, true);

    const close = () => {
      document.removeEventListener('keydown', key, true);
      ro && ro.disconnect();
      el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160 }).finished.then(() => { el.remove(); onQuit && onQuit(); });
    };

    showUi();
    render();
    return { close };
  };

  return { open };
})();
