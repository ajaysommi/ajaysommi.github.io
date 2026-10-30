/* ==========================================================================
   Start-up. After the loading screen the visitor picks what to run. On a
   computer that is a startup disk, one per era, and the system on it boots
   to fill the window: 1983 terminal, 1991 desktop, 1998 web, 2007 desktop.
   On a phone it is a handset: a 2000 candybar, a 2004 pocket player or a
   2007 touchscreen. Every system can come back here to pick another.
   Deep links (#1991, #2007, #nokia, #iphone ...) skip the picker.
   ========================================================================== */
(function start() {
  const root = document.documentElement;
  const MODE = root.dataset.mode;
  const { esc, store } = window.RETRO;
  const I = window.ICONS;
  const SFX = window.SFX;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const READY = window.READY || Promise.resolve();

  const curtain = document.getElementById('curtain');

  /* Sound starts off. A small speaker in a corner turns it on (and off
     again): top right on a computer, bottom right on a phone; inside a
     desktop system the system's own menu bar has one. On the pickers the
     way back to the standard site sits in the corner opposite it. */
  const snd = document.createElement('button');
  snd.type = 'button';
  snd.className = 'snd-toggle';
  const sndDraw = () => {
    snd.innerHTML = `${I.spk(SFX.muted)}<span>${SFX.muted ? 'Sound off' : 'Sound on'}</span>`;
    snd.setAttribute('aria-pressed', String(!SFX.muted));
    snd.setAttribute('aria-label', SFX.muted ? 'Turn sound on' : 'Turn sound off');
  };
  sndDraw();
  snd.addEventListener('click', () => SFX.toggle());
  document.addEventListener('sfx-mute', sndDraw);
  document.body.appendChild(snd);
  const osOn = (on) => root.classList.toggle('os-on', on);
  /* The curtain is only in the page while it is used: Safari 26 would
     otherwise read its black, even invisible, as the colour for its bars. */
  const fade = async (fn) => {
    curtain.style.display = 'block';
    void curtain.offsetWidth;
    curtain.classList.add('is-on');
    await wait(380);
    await fn();
    curtain.classList.remove('is-on');
    setTimeout(() => { if (!curtain.classList.contains('is-on')) curtain.style.display = ''; }, 420);
  };

  /* Back to the standard site: the trip here run backwards. The paper of
     the standard site's loading screen comes up over the picker, and the
     pixel mark at the top lifts off and flies to where that screen draws
     its own mark, growing as it goes and turning, piece by piece, from
     pixels back into the smooth mark. The standard site then opens with it
     already standing there (its loader's mk-landed), finishes its bar and
     sends the mark up into the nav as usual. */
  const SMOOTH = '<path class="sm-a" d="M10.29 44.57 L30.86 9.90 L43.20 32.70 L43.20 36.19 L36.19 36.19 L30.86 26.67 L20.19 44.57Z"/>' +
    '<path d="M26.25 36.19 A13.16 13.16 0 0 0 52.57 36.19 L43.83 36.19 A4.42 4.42 0 0 1 34.99 36.19Z" fill="#ff6b35"/>' +
    '<rect x="43.83" y="24.60" width="8.74" height="11.79" fill="#3d68ff"/><circle cx="48.20" cy="17.40" r="5.60" fill="#3d68ff"/>';
  const PX_VB = [8.86, 8.82, 44, 44];   // where the 16 by 16 pixel mark sits over the smooth one
  let leaving = false;
  const toClassic = (href) => {
    const pick = document.getElementById('picker');
    const src = pick && !pick.hidden && pick.querySelector('.pk-head svg, .mp-head svg');
    if (leaving) return;
    if (!src || root.classList.contains('reduced')) { location.href = href; return; }
    leaving = true;
    const light = root.dataset.theme === 'daylight';
    const paperC = light ? '#f2f0eb' : '#121212', inkC = light ? '#141414' : '#edebe6';
    // The standard site's loader: its mark, then a 30px gap and an 11px bar
    // (86 by 75, 25px and 9px on a phone), centred in the large viewport.
    const probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100vh;height:100lvh;visibility:hidden';
    document.body.appendChild(probe);
    const lvh = probe.offsetHeight;
    probe.remove();
    const small = innerWidth <= 719;
    const mw = small ? 86 : 112, mh = small ? 75 : 97, col = mh + (small ? 34 : 41);
    const box = { left: (root.clientWidth - mw) / 2, top: (lvh - col) / 2, width: mw, height: mh };
    const VB = [8, 8, 48, 42];
    const k1 = Math.min(box.width / VB[2], box.height / VB[3]);
    const L = box.left + (box.width - VB[2] * k1) / 2, T = box.top + (box.height - VB[3] * k1) / 2;
    // the pixel grid's centre, in the frame, and how much smaller it starts
    const gx = (PX_VB[0] + PX_VB[2] / 2 - VB[0]) * k1, gy = (PX_VB[1] + PX_VB[3] / 2 - VB[1]) * k1;
    const r = src.getBoundingClientRect();
    const k0 = r.width / (PX_VB[2] * k1);
    const dx = r.left + r.width / 2 - (L + gx), dy = r.top + r.height / 2 - (T + gy);

    const paper = document.createElement('div');
    paper.style.cssText = `position:fixed;inset:0;z-index:2147483000;background:${paperC};opacity:0;transition:opacity .38s ease`;
    document.body.appendChild(paper);
    const frame = document.createElement('div');
    frame.style.cssText = `position:fixed;z-index:2147483001;pointer-events:none;left:${L}px;top:${T}px;width:${VB[2] * k1}px;height:${VB[3] * k1}px;will-change:transform`;
    const NS = 'http://www.w3.org/2000/svg';
    const f = document.createElementNS(NS, 'svg');
    f.setAttribute('viewBox', VB.join(' '));
    f.innerHTML = SMOOTH;
    f.style.cssText = `display:block;width:100%;height:100%;overflow:visible;transform-origin:${gx}px ${gy}px;will-change:transform`;
    f.querySelector('.sm-a').setAttribute('fill', inkC);
    const smooth = [...f.children];
    smooth.forEach((n) => { n.style.opacity = '0'; });
    const g = document.createElementNS(NS, 'svg');
    ['x', 'y', 'width', 'height'].forEach((a, i) => g.setAttribute(a, PX_VB[i]));
    g.setAttribute('viewBox', '0 0 16 16');
    g.setAttribute('shape-rendering', 'crispEdges');
    const pxInk = { '#': light ? '#1c1a17' : '#e9e4d8', b: '#3d68ff', r: '#ff6b35' };
    const cells = [];
    (window.AJ_PX || []).forEach((row, y) => [...row].forEach((ch, x) => {
      if (!pxInk[ch]) return;
      const c = document.createElementNS(NS, 'rect');
      c.setAttribute('x', x); c.setAttribute('y', y); c.setAttribute('width', 1.02); c.setAttribute('height', 1.02);
      c.setAttribute('fill', pxInk[ch]);
      c.dataset.ch = ch;
      g.appendChild(c);
      cells.push(c);
    }));
    f.appendChild(g);
    frame.appendChild(f);
    document.body.appendChild(frame);

    const FLY = 760;
    // Pixels go in a shuffled order, but roughly top to bottom, as they
    // came in; each piece of the smooth mark comes up as its own pixels
    // start to go, so the mark is never missing.
    cells.sort((a, b) => (+a.getAttribute('y') + Math.random() * 6) - (+b.getAttribute('y') + Math.random() * 6));
    const at = new Map();
    cells.forEach((c, i) => {
      const t = 140 + (FLY - 260) * Math.pow(i / cells.length, .85);
      at.set(c, t);
      c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 110, delay: t, fill: 'forwards' });
    });
    const piece = (n) => (n.classList.contains('sm-a') ? (c) => c.dataset.ch === '#'
      : n.tagName === 'circle' ? (c) => c.dataset.ch === 'b' && +c.getAttribute('y') < 5
      : n.tagName === 'rect' ? (c) => c.dataset.ch === 'b' && +c.getAttribute('y') >= 5
      : (c) => c.dataset.ch === 'r');
    smooth.forEach((n) => {
      const times = cells.filter(piece(n)).map((c) => at.get(c)).sort((a, b) => a - b);
      if (!times.length) return;
      const start = Math.max(0, times[0] - 60), end = times[Math.floor(times.length * .55)] + 110;
      n.animate([{ opacity: 0 }, { opacity: 1 }], { duration: Math.max(80, end - start), delay: start, easing: 'ease-out', fill: 'forwards' });
    });

    src.style.visibility = 'hidden';
    void paper.offsetWidth;
    paper.style.opacity = '1';
    if (themeColor) themeColor.content = paperC;
    root.style.backgroundColor = paperC;
    // Across and down on their own curves, as on the way here.
    frame.animate([{ transform: `translateX(${dx}px)` }, { transform: 'none' }], { duration: FLY, easing: 'cubic-bezier(.45, 0, .2, 1)', fill: 'forwards' });
    f.animate([{ transform: `translateY(${dy}px) scale(${k0})` }, { transform: 'none' }], { duration: FLY, easing: 'cubic-bezier(.55, 0, .25, 1.06)', fill: 'forwards' })
      .finished.then(() => {
        try { sessionStorage.setItem('hop-home', '1'); } catch (e) {}
        location.href = href;
      });
    // Back here from the standard site with the back button: the picker as it was.
    addEventListener('pageshow', (e) => {
      if (!e.persisted) return;
      paper.remove(); frame.remove(); src.style.visibility = ''; leaving = false;
    }, { once: true });
  };
  const themeColor = document.querySelector('meta[name="theme-color"]');
  document.addEventListener('click', (e) => {
    const a = e.target.closest('.pk-home');
    if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    toClassic(a.href);
  });

  /* Behind both pickers: small filled shapes from every era, with
     hourglasses and clocks among them, shaded in softly. */
  const LIGHT = root.dataset.theme === 'daylight';
  const TIMEART = (mobile) => window.SHAPES.layer('time', { ...(mobile ? { count: 36, opacity: LIGHT ? 0.05 : 0.034, size: [22, 42], seed: 11 } : { count: 60, opacity: LIGHT ? 0.045 : 0.032, size: [26, 56], seed: 5 }), color: LIGHT ? '#1c1a17' : '#fff' });

  /* The morph between a tile's drawing and the real machine. The drawing
     and the photograph fly the same path together: the drawing grows into
     a square over the machine, the photograph from the drawing's size into
     the machine itself. Mid-flight both blur and swap, so the drawing seems
     to sharpen into the real thing. Reversed, the machine shrinks back into
     its drawing. */
  const center = (r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
  const fit = (box, w, h) => { const k = Math.min(box.width / w, box.height / h); return { left: box.left + (box.width - w * k) / 2, top: box.top + (box.height - h * k) / 2, width: w * k, height: h * k }; };
  const clone = (node, r, z) => {
    const sh = node.isConnected ? getComputedStyle(node).filter : 'none';
    const n = node.cloneNode(true);
    if (sh && sh !== 'none') n.style.filter = sh;
    n.removeAttribute('id');
    n.classList.add('pk-fly');
    n.style.cssText += `;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;z-index:${z};visibility:visible`;
    document.body.appendChild(n);
    return n;
  };
  const go = (n, a, b, dur) => n.animate([{ transform: 'translate(0px, 0px) scale(1)' }, { transform: `translate(${b.left - a.left}px, ${b.top - a.top}px) scale(${b.width / a.width})` }], { duration: dur, easing: 'cubic-bezier(.45,0,.2,1)', fill: 'forwards' }).finished;
  /* A screen's corners: one radius, or [across, down] at the top and at the
     bottom, for a tube whose opening arches. In px, or as a share of the
     picture when given its size. */
  const round = (r, w, h) => {
    const [ta, td, ba, bd] = Array.isArray(r) ? r : [r, r, r, r];
    const x = (v) => (w ? `${v / w * 100}%` : `${v}px`), y = (v) => (h ? `${v / h * 100}%` : `${v}px`);
    return `${x(ta)} ${x(ta)} ${x(ba)} ${x(ba)} / ${y(td)} ${y(td)} ${y(bd)} ${y(bd)}`;
  };
  const flight = async ({ glyph, glyphBox, photo, photoW, photoH, glass, device, focus, back = false, dur = 820 }) => {
    /* The drawing travels to the part of the machine it depicts (focus),
       keeping its own shape, never larger than the machine. Only opacity
       and transforms animate, so every frame stays cheap. */
    const gBig = fit(focus || device, glyphBox.width, glyphBox.height);
    /* The photograph starts with the part it shows (focus) fitted where
       the drawing is, so both begin and end in register. */
    let pStart = null;
    if (photo) {
      const f = focus || device, fb = fit(glyphBox, f.width, f.height), s0 = fb.width / f.width;
      pStart = { left: fb.left - (f.left - device.left) * s0, top: fb.top - (f.top - device.top) * s0, width: device.width * s0, height: device.height * s0 };
    }
    const [g0, g1] = back ? [gBig, glyphBox] : [glyphBox, gBig];
    const jobs = [];
    if (glyph) {
      const g = clone(glyph, g0, 8710);
      if (!photo) { jobs.push(go(g, g0, g1, dur).then(() => g)); if (back) g.animate([{ opacity: 0 }, { opacity: 1, offset: .3 }, { opacity: 1 }], { duration: dur, fill: 'forwards' }); }
      else {
        jobs.push(go(g, g0, g1, dur).then(() => g.remove()));
        g.animate(back ? [{ opacity: 0 }, { opacity: 0, offset: .4 }, { opacity: 1, offset: .8 }, { opacity: 1 }]
          : [{ opacity: 1 }, { opacity: 1, offset: .2 }, { opacity: 0, offset: .6 }, { opacity: 0 }], { duration: dur, fill: 'forwards' });
      }
    }
    if (photo) {
      const [p0, p1] = back ? [device, pStart] : [pStart, device];
      const im = document.createElement('div');
      im.style.background = `url("${photo}") 0 0 / 100% 100% no-repeat`;
      if (glass) im.innerHTML = `<i style="position:absolute;left:${glass[0] / photoW * 100}%;top:${glass[1] / photoH * 100}%;width:${glass[2] / photoW * 100}%;height:${glass[3] / photoH * 100}%;background:${glass[5] || '#050506'};border-radius:${round(glass[4], glass[2], glass[3])}"></i>`;
      const q = clone(im, p0, 8711);
      q.style.willChange = 'transform, opacity';
      jobs.push(go(q, p0, p1, dur).then(() => q));
      q.animate(back ? [{ opacity: 1 }, { opacity: 1, offset: .25 }, { opacity: 0, offset: .65 }, { opacity: 0 }]
        : [{ opacity: 0 }, { opacity: 0, offset: .15 }, { opacity: 1, offset: .55 }, { opacity: 1 }], { duration: dur, fill: 'forwards' });
    }
    const out = await Promise.all(jobs);
    return out.find((x) => x && x.nodeType === 1) || null;
  };
  /* Arriving from another timeline: a soft burst of light behind the
     machine, no shape to it, swelling and fading. It sits in the room,
     under the machine. */
  const arrival = (r, color = '#fff', into = document.body) => {
    if (root.classList.contains('reduced')) return;
    const c = center(r), d = Math.max(r.width, r.height) * 1.5;
    const g = document.createElement('div');
    g.className = 'tl-back';
    g.style.cssText = `left:${c.x}px;top:${c.y}px;width:${d}px;height:${d}px;--c:${color}`;
    const under = into.querySelector(':scope > .bz');
    if (under) into.insertBefore(g, under); else into.appendChild(g);
    g.animate([
      { transform: 'translate(-50%,-50%) scale(.35)', opacity: 0 },
      { transform: 'translate(-50%,-50%) scale(.85)', opacity: 1, offset: .22 },
      { transform: 'translate(-50%,-50%) scale(1.35)', opacity: 0 }
    ], { duration: 1700, easing: 'cubic-bezier(.2,.6,.3,1)', fill: 'forwards' }).finished.then(() => g.remove());
  };

  /* ================================================================ DESKTOP */

  /* Each era drawn as the computer it ran on: an Apple II-style terminal, a
     compact Macintosh, a Bondi iMac, the aluminium iMac (AJ on the chin,
     the stand only hinted at), and a modern display for the standard site. */
  /* The mark centred on (x, y): its drawing's middle is at 31.43, 27.24. */
  const AJ = (x, y, s, c) => `<g transform="translate(${(x - 31.43 * s).toFixed(2)} ${(y - 27.24 * s).toFixed(2)}) scale(${s})" fill="${c}"><path d="M10.29 44.57 L30.86 9.90 L43.20 32.70 L43.20 36.19 L36.19 36.19 L30.86 26.67 L20.19 44.57Z M26.25 36.19 A13.16 13.16 0 0 0 52.57 36.19 L43.83 36.19 A4.42 4.42 0 0 1 34.99 36.19Z M43.83 24.60h8.74v11.79h-8.74z"/><circle cx="48.2" cy="17.4" r="5.6"/></g>`;
  const ART = {
    1983: `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="a2b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ece3cc"/><stop offset="1" stop-color="#c9bc9b"/></linearGradient></defs><rect x="22" y="10" width="76" height="62" rx="6" fill="url(#a2b)" stroke="#8d8063"/><rect x="29" y="16" width="62" height="46" rx="4" fill="#111"/><rect x="32" y="19" width="56" height="40" rx="3" fill="#0c1a0c"/><text x="36" y="32" font-family="VT323, monospace" font-size="9" fill="#5cff6b">SOMMI-DOS</text><text x="36" y="42" font-family="VT323, monospace" font-size="9" fill="#5cff6b">]_</text><rect x="52" y="72" width="16" height="6" fill="#b3a585"/><path d="M10 80h100l6 22a3 3 0 0 1-3 4H7a3 3 0 0 1-3-4z" fill="url(#a2b)" stroke="#8d8063"/>${[0, 1, 2].map((r) => `<rect x="${16 + r * 3}" y="${84 + r * 6}" width="${84 - r * 6}" height="4.5" rx="1" fill="#6d6250" opacity=".55"/>`).join('')}</svg>`,
    1991: `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="mcb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1ecdf"/><stop offset="1" stop-color="#cfc7b3"/></linearGradient></defs><path d="M28 6h64a6 6 0 0 1 6 6v92H22V12a6 6 0 0 1 6-6z" fill="url(#mcb)" stroke="#968d78"/><rect x="22" y="104" width="76" height="8" rx="2" fill="#bdb49e" stroke="#968d78"/><rect x="32" y="14" width="56" height="46" rx="5" fill="#3a3a36"/><rect x="36" y="18" width="48" height="38" rx="2" fill="#f4f4f0"/><rect x="36" y="18" width="48" height="5" fill="#fff" stroke="#222" stroke-width=".6"/><rect x="42" y="30" width="22" height="14" fill="#fff" stroke="#222" stroke-width=".8"/><rect x="42" y="30" width="22" height="3" fill="#222"/><rect x="66" y="44" width="10" height="8" fill="#fff" stroke="#222" stroke-width=".8"/><rect x="58" y="80" width="26" height="3" rx="1.5" fill="#55503f"/><linearGradient id="mcR" gradientUnits="userSpaceOnUse" x1="0" y1="11.8" x2="0" y2="49.4">${[['#61bb46', 0], ['#fdb827', 1], ['#f5821f', 2], ['#e03a3e', 3], ['#963d97', 4], ['#009ddc', 5]].map(([c, i]) => `<stop offset="${i / 6}" stop-color="${c}"/><stop offset="${(i + 1) / 6}" stop-color="${c}"/>`).join('')}</linearGradient>${AJ(35, 79.2, .25, 'url(#mcR)')}</svg>`,
    1998: `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="g3b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fd6e6"/><stop offset=".5" stop-color="#1f9fbd"/><stop offset="1" stop-color="#0e6f8a"/></linearGradient><linearGradient id="g3w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d9dee3"/></linearGradient></defs><path d="M60 6c26 0 44 4 46 14 3 17 3 46-2 66-3 12-20 18-44 18S19 98 16 86c-5-20-5-49-2-66C16 10 34 6 60 6z" fill="url(#g3b)" stroke="#0b5b72"/><path d="M60 10c22 0 38 3 40 11 2 14 2 34-1 49H21c-3-15-3-35-1-49 2-8 18-11 40-11z" fill="url(#g3w)"/><rect x="28" y="18" width="64" height="48" rx="3" fill="#1a1a1a"/><rect x="31" y="21" width="58" height="42" rx="1.5" fill="#2d6bd0"/><rect x="31" y="21" width="58" height="5" fill="#d8d8d8"/><rect x="38" y="31" width="44" height="26" fill="#fff"/><rect x="38" y="31" width="44" height="4" fill="#1e3f8a"/><path d="M28 78h64l-4 14H32z" fill="#0e6f8a" opacity=".5"/><linearGradient id="g3L" gradientUnits="userSpaceOnUse" x1="0" y1="11" x2="0" y2="50"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfeaf2"/></linearGradient>${AJ(60, 85, .19, '#0b5b72').replace('<g ', '<g opacity=".35" ').replace(/translate\(([\d.]+) ([\d.]+)\)/, (m, x, y) => `translate(${x} ${(+y + .5).toFixed(2)})`)}${AJ(60, 85, .19, 'url(#g3L)')}<path d="M44 104h32l4 10H40z" fill="url(#g3b)" stroke="#0b5b72"/></svg>`,
    2007: `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="imW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e3e6ea"/></linearGradient><linearGradient id="imQ" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fb0e0"/><stop offset=".55" stop-color="#3f78c4"/><stop offset="1" stop-color="#1f3f8f"/></linearGradient><linearGradient id="imF" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c9ccd1"/><stop offset=".5" stop-color="#f4f5f7"/><stop offset="1" stop-color="#c9ccd1"/></linearGradient></defs><path d="M47 96h26l5 18H42z" fill="url(#imF)" stroke="#b9bdc3" stroke-width=".6"/><rect x="34" y="113" width="52" height="3.2" rx="1.6" fill="#e3e6ea" stroke="#b9bdc3" stroke-width=".5"/><rect x="4" y="8" width="112" height="90" rx="5" fill="url(#imW)" stroke="#c3c7cc" stroke-width=".8"/><rect x="10" y="14" width="100" height="62" fill="#0b0b0c"/><rect x="12" y="16" width="96" height="58" fill="url(#imQ)"/><path d="M12 50c24-16 54-24 96-12v6C70 34 40 42 12 62z" fill="#fff" opacity=".18"/><path d="M40 16c10 18 20 34 38 58" stroke="#fff" stroke-opacity=".18" stroke-width="5" fill="none"/><rect x="12" y="16" width="96" height="2.6" fill="#f2f2f4"/><rect x="34" y="68" width="52" height="5" rx="1.5" fill="#fff" opacity=".4"/><circle cx="60" cy="11" r="1.1" fill="#222"/><linearGradient id="imL" gradientUnits="userSpaceOnUse" x1="0" y1="11" x2="0" y2="50"><stop offset="0" stop-color="#eef0f3"/><stop offset=".45" stop-color="#c4c8ce"/><stop offset=".55" stop-color="#aeb3ba"/><stop offset="1" stop-color="#cfd3d8"/></linearGradient>${AJ(60, 87.4, .3, '#ffffff').replace('<g ', '<g opacity=".9" ')}${AJ(60, 87, .3, 'url(#imL)')}</svg>`,

    now: `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="nwS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#eef1f5"/></linearGradient></defs><rect x="6" y="16" width="108" height="70" rx="4" fill="#1b1c1f" stroke="#55575c" stroke-width=".8"/><rect x="9" y="19" width="102" height="64" rx="1.5" fill="url(#nwS)"/><rect x="15" y="24" width="10" height="3" rx="1.5" fill="#ff6b35"/><rect x="78" y="24" width="27" height="3" rx="1.5" fill="#c9ced6"/><rect x="15" y="36" width="56" height="7" rx="2" fill="#1d1f24"/><rect x="15" y="46" width="44" height="7" rx="2" fill="#3d68ff"/><rect x="15" y="58" width="60" height="3" rx="1.5" fill="#aab1bc"/><rect x="15" y="64" width="50" height="3" rx="1.5" fill="#aab1bc"/><rect x="15" y="72" width="22" height="6" rx="3" fill="#1d1f24"/><circle cx="94" cy="54" r="12" fill="#e6ebf2"/>${AJ(94, 54, .38, '#1d1f24')}<path d="M52 86h16l3 14H49z" fill="#8a8d93" opacity=".45"/><rect x="40" y="100" width="40" height="3" rx="1.5" fill="#8a8d93" opacity=".35"/></svg>`
  };

  const ERAS = [
    { year: '1983', name: 'SOMMI-DOS', note: 'A command line. Type, or click the commands.', sys: () => window.TERM, art: ART[1983] },
    { year: '1991', name: 'SommiOS 7', note: 'Black and white windows, icons and a Trash.', sys: () => window.FINDER, art: ART[1991] },
    { year: '1998', name: 'SommiNet 98', note: 'A browser and a homepage, guestbook included.', sys: () => window.WEB, art: ART[1998] },
    { year: '2007', name: 'SommiOS X Gator', note: 'A dock, Aqua windows and Spotlight.', sys: () => window.OSX, art: ART[2007] }
  ];
  /* The standard site sits in the same row, as the newest machine. */
  const OPTS = ERAS;

  const desk = () => {
    const host = document.getElementById('osHost');
    const pick = document.getElementById('picker');
    const screens = [];
    const booted = [];
    let cur = -1;
    let sel = Math.max(0, ERAS.findIndex((e) => e.year === store.get('era', '2007')));

    const api = {
      go: (i) => launch(i),
      picker: () => showPicker(),
      years: ERAS.map((e) => e.year),
      hint() {}, led() {}
    };

    pick.classList.add('is-desk-pick');
    pick.innerHTML = TIMEART(false) + `
      <div class="sm-status"><span class="sm-bat"><i></i></span><span class="sm-clock"></span></div>
      <div class="pk-in">
        <div class="pk-head">${I.pxmark(36)}<h1>Choose an era</h1><p>Each one is the portfolio on a computer from its year.</p></div>
        <div class="pk-row" role="listbox" aria-label="Eras">${OPTS.map((e, i) => `<button type="button" class="pk-d${e.href ? ' is-now' : ''}" role="option" data-i="${i}"><span class="pk-art">${e.art}</span><span class="pk-y">${e.year}</span><b>${esc(e.name)}</b><span class="pk-n">${esc(e.note)}</span></button>`).join('')}</div>
        <p class="pk-foot">Click one to start it up · or use ← → and Return</p>
      </div><a class="pk-home" href="index.html">‹ Standard site</a>`;
    const tick = () => { const c = pick.querySelector('.sm-clock'); if (c) c.textContent = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); };
    tick(); setInterval(tick, 15000);
    const disks = [...pick.querySelectorAll('.pk-d')];
    const N = OPTS.length;
    const mark = () => disks.forEach((d, i) => { d.classList.toggle('is-sel', i === sel); d.setAttribute('aria-selected', i === sel); });
    mark();
    const choose = (i) => { if (OPTS[i].href) { fade(async () => { location.href = OPTS[i].href; await wait(5000); }); return; } launch(i); };
    pick.addEventListener('pointerover', (e) => { const d = e.target.closest('.pk-d'); if (d) { sel = +d.dataset.i; mark(); } });
    pick.addEventListener('click', (e) => {
      const d = e.target.closest('.pk-d');
      if (d) { sel = +d.dataset.i; mark(); SFX.click(); choose(sel); return; }
    });
    document.addEventListener('keydown', (e) => {
      if (pick.hidden) return;
      if (e.key === 'ArrowRight') { sel = (sel + 1) % N; mark(); disks[sel].focus(); }
      if (e.key === 'ArrowLeft') { sel = (sel - 1 + N) % N; mark(); disks[sel].focus(); }
      if (e.key === 'Enter' && !e.target.closest('a')) { e.preventDefault(); choose(sel); }
    });

    const screen = (i) => {
      if (screens[i]) return screens[i];
      const s = document.createElement('div');
      s.className = 'os-screen';
      s.hidden = true;
      host.appendChild(s);
      screens[i] = s;
      ERAS[i].sys().build(s, api, i);
      return s;
    };

    /* Each system runs inside a close-up of its computer: the bezel around
       the screen and the chin below it, the colour AJ where the maker's
       logo was. */
    const MARK = I.mark(64);
    const BEZEL = {
      1983: `<div class="bz-chin"><span class="bz-badge">${MARK}<b>SOMMI //e</b></span><i class="bz-led"></i></div>`,
      1991: `<div class="bz-chin"><span class="bz-badge">${MARK}</span><span class="bz-floppy"><i></i></span></div>`,
      1998: `<div class="bz-chin"><span class="bz-spk l"></span><span class="bz-mid">${MARK}<i class="bz-cd"></i></span><span class="bz-spk r"></span></div>`,
      2007: `<div class="bz-chin"><span class="bz-badge">${I.mark(64, true)}</span></div>`
    };
    const bezel = document.createElement('div');
    bezel.className = 'bz';
    bezel.setAttribute('aria-hidden', 'true');
    host.appendChild(bezel);
    /* Inside a system: a bar along the top on the backdrop, back to the
       eras on the left, the resume and the standard site on the right,
       coloured to suit the era. */
    const bar = document.createElement('div');
    bar.className = 'dk-bar';
    bar.hidden = true;
    bar.innerHTML = `<button type="button" class="dk-chip" data-k="eras">‹ Eras</button><span></span><a class="dk-chip" href="${window.PORTFOLIO.resume}" target="_blank" rel="noopener">Resume</a><a class="dk-chip" href="index.html">Standard site</a>`;
    bar.querySelector('[data-k="eras"]').addEventListener('click', () => { SFX.click(); showPicker(); });
    document.body.appendChild(bar);
    /* Shapes of the era behind the machine. */
    const LOOK = { 1983: ['#5cff6b', 0.07], 1991: ['#8b7f62', 0.2], 1998: ['#1a8ba3', 0.2], 2007: ['#6f86a6', 0.17] };
    const backdrop = document.createElement('div');
    backdrop.className = 'dk-shapes';
    host.insertBefore(backdrop, host.firstChild);

    /* Photographed machines, in the picture's own pixels: its screen, the
       part kept in view (down to the chin, the keyboard and stand left
       below the window), and where the AJ replaces the maker's logo. */
    const PHOTO = {
      1991: { src: 'assets/images/bezels/mac-1991.webp', w: 1356, h: 1159, glass: [319, 161, 551, 427, [120, 14, 120, 14]], scr: [346, 197, 497, 349], r: 10, view: [215, 30, 755, 770], aj: [307, 769, 38, false] },
      1998: { src: 'assets/images/bezels/imac-g3.webp', w: 1419, h: 1108, glass: [304, 192, 880, 602, 20], scr: [352, 236, 786, 516], r: 12, view: [160, 30, 1180, 960], aj: [738, 851, 38, false] },
      2007: { src: 'assets/images/bezels/imac-2007.webp', w: 1726, h: 1608, glass: [119, 119, 1484, 930, 0], scr: [128, 128, 1466, 912], r: 0, view: [42, 42, 1642, 1250], aj: [861, 1184, 132, true] }
    };
    let photo = null;
    /* The machine fills most of the window: room above and at the sides,
       none below, where it runs off the bottom edge. */
    const TOP = 66;
    const place = (ph) => {
      /* The top of the machine sits just under the buttons; it is as large
         as the height allows from there, and runs off the bottom. */
      const [vx, vy, vw, vh] = ph.view;
      const k = Math.min((innerHeight - TOP) / vh, (innerWidth * 0.94) / vw);
      return { k, ox: (innerWidth - vw * k) / 2 - vx * k, oy: TOP - vy * k };
    };
    const layout = () => {
      if (!photo) return;
      const { k, ox, oy } = place(photo);
      bezel.querySelector('.bz-dev').style.transform = `translate(${ox}px, ${oy}px) scale(${k})`;
      const [sx, sy, sw, sh] = photo.scr;
      Object.entries({ '--pl': ox + sx * k, '--pt': oy + sy * k, '--pw': sw * k, '--ph': sh * k, '--pr': photo.r * k }).forEach(([n, v]) => host.style.setProperty(n, v + 'px'));
    };
    addEventListener('resize', layout);
    const dress = (i) => {
      bar.hidden = i < 0;
      photo = null;
      host.classList.remove('is-photo');
      if (i < 0) { delete host.dataset.era; delete document.documentElement.dataset.era; bezel.innerHTML = ''; backdrop.innerHTML = ''; return; }
      const y = ERAS[i].year;
      host.dataset.era = y;
      document.documentElement.dataset.era = y;
      backdrop.innerHTML = window.SHAPES.layer(y, { count: 46, color: LOOK[y][0], opacity: LOOK[y][1], size: [26, 60], seed: +y });
      if (PHOTO[y]) {
        photo = PHOTO[y];
        const [ax, ay, as, mono] = photo.aj;
        bezel.innerHTML = `<div class="bz-dev" style="width:${photo.w}px;height:${photo.h}px"><img src="${photo.src}" alt="" draggable="false" /><i class="bz-glass" style="left:${photo.glass[0]}px;top:${photo.glass[1]}px;width:${photo.glass[2]}px;height:${photo.glass[3]}px;border-radius:${round(photo.glass[4])}"></i><span class="bz-aj" style="left:${ax - as / 2}px;top:${ay - as / 2}px;width:${as}px;height:${as}px">${I.mark(as, mono)}</span></div>`;
        host.classList.add('is-photo');
        host.classList.remove('is-dark');
        /* The Bondi iMac's power button switches the picture tube off and on. */
        if (y === '1998') {
          const b = document.createElement('button');
          b.type = 'button'; b.className = 'bz-power'; b.setAttribute('aria-label', 'Display power');
          b.style.cssText = 'left:1003px;top:948px;width:44px;height:44px';
          b.addEventListener('click', () => { SFX.click(); host.classList.toggle('is-dark'); });
          bezel.querySelector('.bz-dev').appendChild(b);
          /* The CD tray: nothing to eject, and the screen says so. */
          const cd = document.createElement('button');
          cd.type = 'button'; cd.className = 'bz-power'; cd.setAttribute('aria-label', 'CD-ROM drive');
          cd.style.cssText = 'left:525px;top:905px;width:440px;height:60px;border-radius:12px';
          cd.addEventListener('click', () => {
            SFX.click();
            const s = screens[i];
            if (!s || host.classList.contains('is-dark') || s.querySelector('.cd-alert')) return;
            const m = document.createElement('div');
            m.className = 'cd-alert';
            m.innerHTML = `<div class="cd-box">${I.svg('alert', 32)}<div><b>The CD-ROM drive is empty.</b><p>Everything this portfolio needs is already on the hard disk. No discs were harmed.</p></div><button type="button">OK</button></div>`;
            m.querySelector('button').addEventListener('click', () => { SFX.click(); m.remove(); });
            s.appendChild(m);
          });
          bezel.querySelector('.bz-dev').appendChild(cd);
        }
        layout();
        return;
      }
      bezel.innerHTML = `<div class="bz-body"></div><div class="bz-frame"></div>${BEZEL[y]}`;
    };

    /* The startup disk: SommiOS on a 3.5 inch floppy, its label as the
       system disks of the day had it, with the AJ where the rainbow apple
       was. Drawn in millimetres, shutter at the bottom. */
    const FLOPPY = `<svg viewBox="0 0 90 94" aria-hidden="true"><defs><linearGradient id="fpB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b2b2e"/><stop offset="1" stop-color="#141416"/></linearGradient><linearGradient id="fpS" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b8b6b2"/><stop offset=".35" stop-color="#d9d7d3"/><stop offset=".65" stop-color="#c3c1bd"/><stop offset="1" stop-color="#a3a19d"/></linearGradient><linearGradient id="fpL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f5f2"/><stop offset="1" stop-color="#e9e8e4"/></linearGradient></defs>`
      + `<path d="M3 .5h84a2.5 2.5 0 0 1 2.5 2.5v88a2.5 2.5 0 0 1-2.5 2.5H5.5L.5 88.5V3A2.5 2.5 0 0 1 3 .5z" fill="url(#fpB)"/>`
      + `<path d="M15.5 57h59a1.5 1.5 0 0 1 1.5 1.5V93.5H14V58.5a1.5 1.5 0 0 1 1.5-1.5z" fill="#232326"/>`
      + `<rect x="5.2" y="6.4" width="3.6" height="3.6" fill="#050505"/><rect x="81.2" y="6.4" width="3.6" height="3.6" fill="#050505"/>`
      + `<rect x="12.4" y="2.6" width="66.8" height="52.6" rx="1.4" fill="url(#fpL)"/><rect x="12.4" y="2.6" width="66.8" height="52.6" rx="1.4" fill="none" stroke="#000" stroke-opacity=".18" stroke-width=".3"/>`
      + `<text x="17.6" y="16.6" font-family="'Apple Garamond', Garamond, 'EB Garamond', 'Times New Roman', serif" font-size="8.4" fill="#1d1d1f" letter-spacing="-.1">SommiOS</text>`
      + `<text x="17.8" y="22.8" font-family="'Apple Garamond', Garamond, 'EB Garamond', 'Times New Roman', serif" font-size="3.7" fill="#4a4a4d">System Startup</text>`
      + `<g fill="none" stroke="#3a3a3c" stroke-width=".45"><rect x="20" y="28" width="16.4" height="20.6" rx="1"/><rect x="22.2" y="30" width="12" height="9.4" rx=".6"/><path d="M20 45.2h16.4M28.6 43h4.6"/></g><g fill="#3a3a3c">${[0, 1, 2, 3, 4].map((x) => `<rect x="${23.2 + x * 1.5}" y="31.2" width=".7" height=".7"/>`).join('')}${[0, 1].map((x) => `<rect x="${23.2 + x * 1.5}" y="32.8" width=".7" height=".7"/>`).join('')}<rect x="23.2" y="34.4" width=".7" height=".7"/></g>`
      + `<g transform="translate(64.6 6.2) scale(.2)"><path d="M10.29 44.57 L30.86 9.90 L43.20 32.70 L43.20 36.19 L36.19 36.19 L30.86 26.67 L20.19 44.57Z" fill="#1d1d1f"/><path d="M26.25 36.19 A13.16 13.16 0 0 0 52.57 36.19 L43.83 36.19 A4.42 4.42 0 0 1 34.99 36.19Z" fill="#ff6b35"/><rect x="43.83" y="24.6" width="8.74" height="11.79" fill="#3d68ff"/><circle cx="48.2" cy="17.4" r="5.6" fill="#3d68ff"/></g>`
      + `<rect x="22.8" y="62.6" width="45" height="30.9" rx=".6" fill="url(#fpS)"/><rect x="29.7" y="64.6" width="11.3" height="24.6" fill="#0b0b0c"/><path d="M22.8 63.2h45" stroke="#fff" stroke-opacity=".5" stroke-width=".4"/>`
      + `</svg>`;
    /* The slot, in the photograph's pixels: the dark slit of the drive. */
    const SLOT = { x0: 603, x1: 881, y0: 703, y1: 717 };
    const DISK_W = 262, DISK_H = 274;
    /* Asked for by the 1991 system as it starts: the disk rests beside the
       machine, and a click (or a drag) puts it in. It turns over so the
       shutter leads, tips flat to the angle of the slot, lines up with it
       and slides in, vanishing into the slit; then the drive clunks and
       the system starts up from it. */
    api.disk = () => new Promise((resolve) => {
      const dev = bezel.querySelector('.bz-dev');
      if (!dev || host.dataset.era !== '1991' || !photo) { resolve(); return; }
      const drive = document.createElement('div');
      drive.className = 'bz-drive';
      const cx = (SLOT.x0 + SLOT.x1) / 2;
      Object.assign(drive.style, { width: photo.w + 'px', height: photo.h + 'px', perspectiveOrigin: `${cx}px 600px` });
      drive.innerHTML = `<div class="bz-disk" role="button" tabindex="0" aria-label="Insert the startup disk" style="left:${cx - DISK_W / 2}px;top:${SLOT.y0 + 9}px;width:${DISK_W}px;height:${DISK_H}px"><div class="bz-disk-in">${FLOPPY}</div></div><span class="bz-hint">Insert the disk</span>`;
      dev.appendChild(drive);
      const disk = drive.querySelector('.bz-disk'), hint = drive.querySelector('.bz-hint');
      // Where it rests: beside the machine on the right, as far over as the window shows.
      const { k, ox } = place(photo);
      const visRight = (innerWidth - ox) / k;
      const restX = Math.max(1040, Math.min(1110, visRight - DISK_W * .44 - 20));
      let X = restX - cx, Y = 740 - (SLOT.y0 + 9), R = 174, S = .85;
      const T = (x, y, r, a, t, sc) => `translate(${x}px, ${y}px) rotateZ(${r}deg) rotateX(${a}deg) translateY(${t}px) scale(${sc})`;
      const rest = () => { disk.style.transform = T(X, Y, R, 0, 0, S); };
      rest();
      Object.assign(hint.style, { left: Math.min(restX, visRight - 120) + 'px', top: 740 - DISK_H * S - 46 + 'px' });
      drive.classList.add('is-on');
      let drag = null, gone = false;
      const insert = () => {
        if (gone) return;
        gone = true;
        SFX.click();
        drive.classList.add('is-going');
        const a = disk.animate([
          { transform: T(X, Y, R, 0, 0, S), easing: 'cubic-bezier(.3, 0, .5, 1)' },
          { transform: T(X - 14, Y - 34, R - 6, 0, 0, .9), offset: .16, easing: 'cubic-bezier(.45, 0, .25, 1)' },
          { transform: T(0, 22, 0, 82, 0, 1), offset: .6, easing: 'cubic-bezier(.4, 0, .4, 1)' },
          { transform: T(0, 0, 0, 82, 0, 1), offset: .74, easing: 'cubic-bezier(.5, 0, .2, 1)' },
          { transform: T(0, 0, 0, 82, -DISK_H - 6, 1) }
        ], { duration: 1650, fill: 'forwards' });
        setTimeout(() => drive.classList.add('is-in'), 1650 * .6);
        setTimeout(() => SFX.insert(), 1650 * .82);
        a.finished.then(() => { drive.remove(); resolve(); });
      };
      disk.addEventListener('pointerdown', (e) => {
        if (gone) return;
        e.preventDefault();
        try { disk.setPointerCapture(e.pointerId); } catch (x) {}
        const kk = dev.getBoundingClientRect().width / photo.w;
        drag = { x: e.clientX, y: e.clientY, X, Y, kk, moved: 0 };
        drive.classList.add('is-held');
      });
      disk.addEventListener('pointermove', (e) => {
        if (!drag) return;
        const dx = (e.clientX - drag.x) / drag.kk, dy = (e.clientY - drag.y) / drag.kk;
        drag.moved = Math.max(drag.moved, Math.hypot(dx, dy));
        X = drag.X + dx; Y = drag.Y + dy;
        rest();
      });
      const up = () => { if (!drag) return; drag = null; drive.classList.remove('is-held'); insert(); };
      disk.addEventListener('pointerup', up);
      disk.addEventListener('pointercancel', up);
      disk.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); insert(); } });
    });

    /* Where the machine is on screen: the photograph's whole frame, or for
       1983 (drawn) the body of the drawing. */
    const focusBox = (y) => {
      if (!PHOTO[y]) return null;
      const ph = PHOTO[y], { k, ox, oy } = place(ph), [vx, vy, vw] = ph.view;
      return { left: ox + vx * k, top: oy + vy * k, width: vw * k, height: Math.min(vw * k * 1.0, innerHeight - (oy + vy * k)) };
    };
    const deviceBox = (y) => {
      if (PHOTO[y]) { const ph = PHOTO[y], { k, ox, oy } = place(ph); return { left: ox, top: oy, width: ph.w * k, height: ph.h * k }; }
      const b = bezel.querySelector('.bz-body');
      const r = b ? b.getBoundingClientRect() : { left: innerWidth * 0.1, top: innerHeight * 0.14, width: innerWidth * 0.8, height: innerHeight };
      return { left: r.left, top: r.top, width: r.width, height: Math.min(r.height, innerHeight - r.top) };
    };
    const tileArt = (i) => disks[i] && disks[i].querySelector('.pk-art svg');
    const GLOW = { 1983: '#7dff8a', 1991: '#fff6dc', 1998: '#bff4ff', 2007: '#e6f0ff' };
    const settle = (y) => {
      const r = deviceBox(y);
      window.SHAPES.arrive(backdrop.querySelector('.bg-shapes'), center(r).x, center(r).y);
    };

    /* One transition at a time: clicks during a flight are ignored. */
    let busy = false;
    const once = (fn) => async (...a) => { if (busy) return; busy = true; try { await fn(...a); } finally { busy = false; } };
    const launch = once(launchNow);
    const showPicker = once(pickerNow);
    async function launchNow(i) {
      if (i === cur) return;
      const prev = cur;
      cur = i;
      let bootP = null;
      const y = ERAS[i].year;
      store.set('era', y);
      const show = () => {
        if (prev >= 0) { ERAS[prev].sys().leave(); screens[prev].hidden = true; }
        dress(i);
        const s = screen(i);
        s.hidden = false;
        osOn(true);
        history.replaceState(null, '', '#' + y);
      };
      const art = tileArt(i);
      if (prev < 0 && !pick.hidden && art) {
        /* The room comes up empty under the flying drawing; the machine
           lands, flashes in, and the era's shapes fly out and stick. */
        host.classList.add('is-morph');
        show();
        backdrop.querySelector('.bg-shapes').style.visibility = 'hidden';
        const from = art.getBoundingClientRect();
        art.style.visibility = 'hidden';
        pick.classList.add('is-leaving');
        const ph = PHOTO[y];
        setTimeout(() => arrival(deviceBox(y), GLOW[y], host), 380);
        const land = await flight({ glyph: art, glyphBox: from, photo: ph && ph.src, photoW: ph && ph.w, photoH: ph && ph.h, glass: ph && ph.glass, device: deviceBox(y), focus: focusBox(y) });
        pick.hidden = true;
        pick.classList.remove('is-leaving');
        art.style.visibility = '';
        /* Booting starts once it has landed (it is heavy work), and the
           screen shows only after its start-up screen is up, never a
           finished desktop first. */
        const sys0 = ERAS[i].sys();
        if (!booted[i]) { booted[i] = true; bootP = sys0.boot(); }
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        host.classList.remove('is-morph');
        backdrop.querySelector('.bg-shapes').style.visibility = '';
        settle(y);
        if (land) land.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).finished.then(() => land.remove());
      } else {
        await fade(async () => { pick.hidden = true; show(); });
        settle(y);
      }
      /* Landed: the eras button works again even while it boots. */
      busy = false;
      const sys = ERAS[i].sys();
      if (bootP) await bootP;
      else if (!booted[i]) { booted[i] = true; await sys.boot(); }
      if (cur !== i) return;
      sys.resize && sys.resize();
      sys.enter();
    }

    /* Back to the eras: the machine shrinks into its drawing on the tile
       while the picker fades up around it. */
    async function pickerNow() {
      const prev = cur;
      cur = -1;
      const y = prev >= 0 ? ERAS[prev].year : null;
      const art = prev >= 0 ? tileArt(prev) : null;
      if (art) {
        const dev = deviceBox(y);
        ERAS[prev].sys().leave();
        host.classList.add('is-morph');
        pick.hidden = false;
        pick.classList.add('is-returning');
        osOn(false);
        mark();
        const to = art.getBoundingClientRect();
        art.style.visibility = 'hidden';
        const ph = PHOTO[y];
        const left = flight({ glyph: art, glyphBox: to, photo: ph && ph.src, photoW: ph && ph.w, photoH: ph && ph.h, glass: ph && ph.glass, device: dev, focus: focusBox(y), back: true, dur: 720 });
        const land = await left;
        screens[prev].hidden = true;
        dress(-1);
        if (land) land.remove();
        art.style.visibility = '';
        pick.classList.remove('is-returning');
        host.classList.remove('is-morph');
        history.replaceState(null, '', location.pathname + location.search);
      } else {
        await fade(async () => {
          if (prev >= 0) { ERAS[prev].sys().leave(); screens[prev].hidden = true; }
          dress(-1);
          pick.hidden = false;
          osOn(false);
          history.replaceState(null, '', location.pathname + location.search);
          mark();
        });
      }
      disks[sel].focus({ preventScroll: true });
    }

    addEventListener('resize', () => { if (cur >= 0) { const s = ERAS[cur].sys(); s.resize && s.resize(); } });

    READY.then(() => {
      const want = ERAS.findIndex((e) => '#' + e.year === location.hash);
      if (want >= 0) launch(want);
      else { pick.hidden = false; disks[sel].focus({ preventScroll: true }); }
      window.SHAPES.follow(pick.querySelector('.bg-shapes'));
      /* While the picker sits there, each system is put together out of
         sight and each machine's photograph decoded, one per idle moment,
         so a click only has to fly: building a system on the click held
         up the first frames of the flight. */
      const idle = window.requestIdleCallback || ((f) => setTimeout(f, 200));
      const jobs = [];
      Object.values(PHOTO).forEach((ph) => jobs.push(() => { const im = new Image(); im.src = ph.src; if (im.decode) im.decode().catch(() => {}); }));
      ERAS.forEach((_, i) => jobs.push(() => { if (!screens[i]) screen(i); }));
      const next = () => { const j = jobs.shift(); if (!j) return; idle(() => { try { j(); } catch (e) {} next(); }, { timeout: 2500 }); };
      setTimeout(next, 1400);
    });
    pick.hidden = location.hash.length > 1;
  };

  /* ================================================================= PHONES */

  const PHONE_ART = {
    /* Traced over the phone's own photograph, in its pixels, so the
       drawing and the photo match shape for shape as one becomes the
       other: the waisted body, the silver surround dipping into the
       navigation keys, and keys in rows that curve down at the sides. */
    nokia: `<svg viewBox="100 14 724 1666" aria-hidden="true"><defs><linearGradient id="nkG" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset=".22" stop-color="#fff" stop-opacity=".07"/><stop offset=".5" stop-color="#fff" stop-opacity=".12"/><stop offset=".78" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient><linearGradient id="nkS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6e8eb"/><stop offset="1" stop-color="#b7bbc1"/></linearGradient><radialGradient id="nkK" cx=".45" cy=".35" r=".7"><stop offset="0" stop-color="#f4f5f6"/><stop offset="1" stop-color="#b9bdc3"/></radialGradient></defs><path d="M462 24C640 24 742 40 768 140C798 262 811 500 811 800C811 1100 800 1300 782 1450C762 1600 700 1666 462 1666C224 1666 162 1600 142 1450C124 1300 112 1100 112 800C112 500 126 262 156 140C182 40 284 24 462 24Z" fill="#2c3a5e"/><path d="M462 24C640 24 742 40 768 140C798 262 811 500 811 800C811 1100 800 1300 782 1450C762 1600 700 1666 462 1666C224 1666 162 1600 142 1450C124 1300 112 1100 112 800C112 500 126 262 156 140C182 40 284 24 462 24Z" fill="url(#nkG)"/><path d="M462 44C632 44 728 58 742 150L748 770C748 960 622 1078 462 1078C302 1078 176 960 176 770L182 150C196 58 292 44 462 44Z" fill="url(#nkS)"/><path d="M462 70C618 70 704 84 714 164L718 760C718 842 668 868 610 868L314 868C256 868 206 842 206 760L210 164C220 84 306 70 462 70Z" fill="#2f3e64"/><path d="M462 70C618 70 704 84 714 164L718 760C718 842 668 868 610 868L314 868C256 868 206 842 206 760L210 164C220 84 306 70 462 70Z" fill="url(#nkG)" opacity=".6"/>${[92, 126, 160, 194, 228].map((y) => `<ellipse cx="462" cy="${y}" rx="15" ry="11" fill="#141a2a"/>`).join('')}<rect x="352" y="326" width="221" height="50" rx="4" fill="#15171b"/><text x="462" y="364" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" fill="#e8e8e8" letter-spacing="1">SOMMIA</text><rect x="222" y="450" width="486" height="348" rx="34" fill="#a9c262"/><rect x="222" y="450" width="486" height="348" rx="34" fill="#000" opacity=".06"/><g fill="#1d2a10" font-family="Pixelify Sans, monospace" font-weight="700"><text x="648" y="510" text-anchor="end" font-size="50">12:00</text><text x="465" y="772" text-anchor="middle" font-size="54">Menu</text></g><g fill="#1d2a10">${[0, 1, 2, 3].map((k) => `<rect x="244" y="${690 - k * 34}" width="${10 + k * 4}" height="24"/>`).join('')}<rect x="672" y="580" width="16" height="130"/></g><path d="M330 900C330 870 400 862 462 862C524 862 594 870 594 900C594 930 524 938 462 938C400 938 330 930 330 900Z" fill="url(#nkK)" stroke="#8e939a" stroke-width="3"/><rect x="408" y="890" width="108" height="9" rx="4.5" fill="#3aa4e6"/><rect x="222" y="910" width="126" height="78" rx="22" transform="rotate(14 285 949)" fill="url(#nkK)" stroke="#8e939a" stroke-width="3"/><rect x="510" y="930" width="190" height="96" rx="24" transform="rotate(-16 605 978)" fill="url(#nkK)" stroke="#8e939a" stroke-width="3"/>${[[1118, 1140, 1108], [1230, 1255, 1222], [1345, 1370, 1338], [1460, 1488, 1455]].map((r, k) => [[258 + k * 9, r[0], 9], [462, r[1], 0], [665 - k * 8, r[2], -9]].map(([x, y, a]) => `<ellipse cx="${x}" cy="${y}" rx="72" ry="42" transform="rotate(${a} ${x} ${y})" fill="url(#nkK)" stroke="#7d828a" stroke-width="3"/>`).join('')).join('')}</svg>`,
    pocket: `<svg viewBox="0 0 74 122" aria-hidden="true"><rect x="2" y="2" width="70" height="118" rx="12" fill="#f3f1ec" stroke="#c9c3b6"/><rect x="9" y="9" width="56" height="48" rx="4" fill="#2b2e2a"/><rect x="12" y="12" width="50" height="42" rx="2" fill="#c9dcb6"/><rect x="14" y="18" width="46" height="5" fill="#1c2614"/><rect x="14" y="26" width="34" height="3" fill="#55603f"/><rect x="14" y="32" width="40" height="3" fill="#55603f"/><circle cx="37" cy="88" r="24" fill="#fbfaf7" stroke="#d9d4c8"/><circle cx="37" cy="88" r="8.5" fill="#ece9e2" stroke="#d9d4c8"/></svg>`,
    now: `<svg viewBox="0 0 66 122" aria-hidden="true"><rect x="1" y="1" width="64" height="120" rx="12" fill="#1b1c1f" stroke="#55575c" stroke-width=".8"/><rect x="4" y="4" width="58" height="114" rx="9" fill="#f5f7fa"/><rect x="24.5" y="7.2" width="17" height="5" rx="2.5" fill="#1b1c1f"/><rect x="10" y="20" width="8" height="2.6" rx="1.3" fill="#ff6b35"/><rect x="10" y="30" width="40" height="6" rx="2" fill="#1d1f24"/><rect x="10" y="39" width="30" height="6" rx="2" fill="#3d68ff"/><rect x="10" y="50" width="44" height="2.4" rx="1.2" fill="#aab1bc"/><rect x="10" y="55" width="36" height="2.4" rx="1.2" fill="#aab1bc"/><circle cx="33" cy="82" r="15" fill="#e6ebf2"/>${AJ(33, 82, .5, '#1d1f24')}<rect x="10" y="104" width="22" height="6" rx="3" fill="#1d1f24"/></svg>`,
    iphone: `<svg viewBox="0 0 66 122" aria-hidden="true"><defs><linearGradient id="ipR" x1="0" x2="1"><stop offset="0" stop-color="#8d9298"/><stop offset=".3" stop-color="#f2f3f4"/><stop offset=".7" stop-color="#c5c9ce"/><stop offset="1" stop-color="#7f848a"/></linearGradient></defs><rect x="1" y="1" width="64" height="120" rx="11" fill="url(#ipR)"/><rect x="2.6" y="2.6" width="60.8" height="116.8" rx="9.6" fill="#0b0b0b"/><rect x="27" y="10" width="12" height="2" rx="1" fill="#2b2b2b"/><rect x="7.5" y="21" width="51" height="76.5" fill="#000"/>${[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => `<rect x="${10 + c * 12.2}" y="${25 + r * 14.5}" width="9" height="9" rx="2" fill="hsl(${(r * 4 + c) * 33} 70% 55%)"/>`).join('')).join('')}<rect x="7.5" y="84" width="51" height="13.5" fill="#a9a9a9"/>${[0, 1, 2, 3].map((c) => `<rect x="${10 + c * 12.2}" y="86.2" width="9" height="9" rx="2" fill="hsl(${120 + c * 70} 65% 55%)"/>`).join('')}<circle cx="33" cy="109" r="6.2" fill="#121212" stroke="#3a3a3a" stroke-width=".8"/><rect x="30.6" y="106.6" width="4.8" height="4.8" rx="1.2" fill="none" stroke="#9a9a9a" stroke-width=".7"/></svg>`
  };
  const PHONES = [
    { id: 'nokia', name: 'SOMMIA 3310', year: '2000', note: 'Keys only. Navi selects, C goes back.', mod: () => window.NOKIA, cls: 'nk-room' },
    { id: 'pocket', name: 'iSommi Classic', year: '2004', note: 'A click wheel and a tiny screen.', mod: () => window.POCKET, cls: 'pocket-room' },
    { id: 'iphone', name: 'iSommi 2G', year: '2007', note: 'Slide to unlock. The home button goes back.', mod: () => window.IPHONE, cls: 'iphone-room' }
  ];

  const PICKS = PHONES;
  const phones = () => {
    const host = document.getElementById('phoneHost');
    const pick = document.getElementById('picker');
    const rooms = {};
    let cur = null;
    let sel = Math.max(0, PHONES.findIndex((p) => p.id === store.get('phone', 'pocket')));

    /* The browser's own bars, above and below the page, take the colours
       of whatever is on screen: its top edge for the status bar, its
       bottom edge for the toolbar, so the room runs on under them. */
    const EDGE = {
      pick: LIGHT ? ['#f4f2ed', '#e4e1da'] : ['#2a2a2c', '#121214'], nokia: ['#9aa8c6', '#74859e'], iphone: ['#515257', '#2e2f33'],
      pocket: ['#dcd6e8', '#beb4d0'], 'pocket-sky': ['#d2e1f3', '#a8bfdc'], 'pocket-mint': ['#d3ece0', '#a5d2b7'],
      'pocket-sand': ['#ece2cf', '#d0bf9f'], 'pocket-slate': ['#3e434d', '#202228']
    };
    /* The rooms themselves run on under Safari's bars (see .phone-host);
       its status bar and the page behind take the matching colours. */
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    const tint = (id) => {
      const bg = id === 'pocket' && rooms.pocket && rooms.pocket.dataset.bg;
      const [top, bottom] = EDGE[bg && EDGE['pocket-' + bg] ? 'pocket-' + bg : id] || EDGE.pick;
      if (themeMeta) themeMeta.content = top;
      document.documentElement.style.backgroundColor = bottom;
      document.body.style.background = `linear-gradient(${top}, ${bottom}) ${bottom}`;
    };
    tint('pick');

    pick.classList.add('is-phones');
    pick.innerHTML = TIMEART(true) + `
      <div class="mp-head">${I.pxmark(32)}<h1>Choose an era</h1><p>Each one is the portfolio on a device from its year.</p></div>
      <div class="mp-rail" role="listbox" aria-label="Eras">${PICKS.map((p, i) => `<button type="button" class="mp-card${p.href ? ' is-now' : ''}" role="option" data-i="${i}"><span class="mp-art">${PHONE_ART[p.id]}</span><span class="mp-y">${p.year}</span><b>${esc(p.name)}</b><span class="mp-n">${esc(p.note)}</span><span class="mp-on">${p.href ? 'Open' : 'Power on'}</span></button>`).join('')}</div>
      <div class="mp-dots">${PICKS.map((_, i) => `<i data-i="${i}"></i>`).join('')}</div><a class="pk-home" href="index.html">‹ Standard site</a>`;
    const rail = pick.querySelector('.mp-rail');
    const cards = [...pick.querySelectorAll('.mp-card')];
    const dots = [...pick.querySelectorAll('.mp-dots i')];
    const markDots = () => {
      const c = rail.scrollLeft + rail.clientWidth / 2;
      let best = 0, bd = 1e9;
      cards.forEach((card, i) => { const d = Math.abs(card.offsetLeft + card.offsetWidth / 2 - c); if (d < bd) { bd = d; best = i; } });
      sel = best;
      dots.forEach((d, i) => d.classList.toggle('on', i === best));
      cards.forEach((d, i) => d.classList.toggle('is-sel', i === best));
    };
    rail.addEventListener('scroll', () => requestAnimationFrame(markDots), { passive: true });
    const center = (i, smooth) => { const c = cards[i]; rail.scrollTo({ left: c.offsetLeft - (rail.clientWidth - c.offsetWidth) / 2, behavior: smooth ? 'smooth' : 'auto' }); };
    pick.addEventListener('click', (e) => {
      const d = e.target.closest('.mp-dots i');
      if (d) { center(+d.dataset.i, true); return; }
      const c = e.target.closest('.mp-card');
      if (!c) return;
      const i = +c.dataset.i;
      if (i !== sel) { center(i, true); return; }
      if (PICKS[i].href) { fade(async () => { location.href = PICKS[i].href; await wait(5000); }); return; }
      launch(PHONES[i].id);
    });


    /* Over a phone: back to the eras on the left; the standard site and
       the sound switch on the right. Their colours follow the phone. */
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'mp-back';
    back.hidden = true;
    back.innerHTML = '‹ Eras';
    back.addEventListener('click', () => showPicker());
    document.body.appendChild(back);
    const std = document.createElement('a');
    std.className = 'mp-site';
    std.href = 'index.html';
    std.hidden = true;
    std.textContent = 'Standard site';
    document.body.appendChild(std);
    const LOOK = { nokia: ['#243a6e', 0.18], pocket: ['#5b4a86', 0.18], iphone: ['#ffffff', 0.13] };

    /* The tile's drawing becomes the phone (and back), by the same flight
       as the computers, its photograph sharpening in mid-air. */
    const SHOT = { nokia: ['assets/images/sommia-3310.webp', 924, 1702, [232, 452, 470, 342, 40, '#a9c262']], pocket: ['assets/images/isommi-classic.webp', 947, 1661, [168, 151, 600, 489, 6, '#b3c0da']], iphone: ['assets/images/iphone-2g.webp?v=3', 795, 1508, [68, 262, 661, 991, 0, '#000']] };
    /* The photographs are fetched and decoded while the picker is up, so
       the first flight has its picture as surely as every later one. */
    const SHOTS = {};
    Object.keys(SHOT).forEach((id) => {
      const im = new Image();
      im.src = SHOT[id][0];
      SHOTS[id] = (im.decode ? im.decode() : new Promise((r) => { im.onload = r; })).catch(() => {});
    });
    const within = (p, ms) => Promise.race([p || Promise.resolve(), wait(ms)]);
    const parts = (id) => {
      const room = rooms[id], card = cards[PICKS.findIndex((x) => x.id === id)];
      const dev = room.querySelector('.nk, .pk, .ip'), box = room.querySelector('.nk-scale, .pk-scale, .ip-scale');
      const shot = id !== 'iphone' || dev.classList.contains('is-photo') ? SHOT[id] : null;
      return { room, dev, box, shot, art: card && card.querySelector('.mp-art svg') };
    };
    const morph = async (id) => {
      /* A phone opened for the first time is laid out at its final size
         (the iPhone waits on its photograph for that) before it is
         measured, and its picture is ready to fly. */
      await within(Promise.all([rooms[id].ready, SHOTS[id]]), 1500);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const { room, dev, box, shot, art } = parts(id);
      const layer = room.querySelector('.bg-shapes');
      if (!art || !dev) return;
      const from = art.getBoundingClientRect(), to = box.getBoundingClientRect();
      art.style.visibility = 'hidden';
      box.style.opacity = '0';
      if (layer) layer.style.visibility = 'hidden';
      pick.classList.add('is-leaving');
      setTimeout(() => arrival(to, id === 'nokia' ? '#dbe7ff' : id === 'pocket' ? '#f3ecff' : '#ffffff', room), 340);
      const land = await flight({ glyph: art, glyphBox: from, photo: shot && shot[0], photoW: shot && shot[1], photoH: shot && shot[2], glass: shot && shot[3], device: to, dur: 760 });
      box.style.transition = 'opacity .3s ease';
      box.style.opacity = '';
      setTimeout(() => { box.style.transition = ''; }, 320);
      art.style.visibility = '';
      if (layer) layer.style.visibility = '';
      const c = { x: to.left + to.width / 2, y: to.top + to.height / 2 };
      window.SHAPES.arrive(layer, c.x, c.y);
      if (land) land.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).finished.then(() => land.remove());
    };

    let busy = false;
    const once = (fn) => async (...a) => { if (busy) return; busy = true; try { await fn(...a); } finally { busy = false; } };
    const launch = once(launchNow);
    const showPicker = once(pickerNow);
    async function launchNow(id) {
      const p = PHONES.find((x) => x.id === id);
      if (!p || cur === id) return;
      store.set('phone', id);
      const open = () => {
        if (cur) rooms[cur].hidden = true;
        cur = id;
        if (!rooms[id]) {
          const r = document.createElement('div');
          r.className = p.cls + ' phone-room' + (pick.hidden ? '' : ' no-intro');
          // The phone starts up once it is in the hand, not mid-flight.
          r.landed = new Promise((res) => { r.land = res; });
          host.appendChild(r);
          rooms[id] = r;
          p.mod().start(r, () => showPicker());
          new MutationObserver(() => { if (cur === id) tint(id); }).observe(r, { attributes: true, attributeFilter: ['data-bg'] });
          r.insertAdjacentHTML('afterbegin', window.SHAPES.layer(id, { count: 30, color: LOOK[id][0], opacity: LOOK[id][1], size: [24, 50], seed: id.length * 7 }));
        } else rooms[id].hidden = false;
        document.documentElement.dataset.phone = id;
        tint(id);
        back.hidden = false;
        std.hidden = false;
        history.replaceState(null, '', '#' + id);
        SFX.music(id === 'iphone' ? 2007 : null);
      };
      if (!pick.hidden) {
        open();
        await morph(id);
        pick.hidden = true;
        pick.classList.remove('is-leaving');
      } else await fade(async () => open());
      if (rooms[id].land) rooms[id].land();
    }

    async function pickerNow() {
      const id = cur;
      const done = () => {
        if (cur) rooms[cur].hidden = true;
        cur = null;
        SFX.music(null);
        delete document.documentElement.dataset.phone;
        tint('pick');
        back.hidden = true;
        std.hidden = true;
        history.replaceState(null, '', location.pathname + location.search);
      };
      const card = id && cards[PICKS.findIndex((x) => x.id === id)];
      if (card) {
        /* The phone shrinks back into its drawing on the tile. */
        sel = PICKS.findIndex((x) => x.id === id);
        pick.hidden = false;
        center(sel, false);
        markDots();
        const { dev, box, shot, art } = parts(id);
        const to = art.getBoundingClientRect(), from = box.getBoundingClientRect();
        art.style.visibility = 'hidden';
        box.style.opacity = '0';
        pick.classList.add('is-returning');
        tint('pick');   // the bars start changing with the flight, not after it
        const left = flight({ glyph: art, glyphBox: to, photo: shot && shot[0], photoW: shot && shot[1], photoH: shot && shot[2], glass: shot && shot[3], device: from, back: true, dur: 680 });
        const land = await left;
        done();
        if (land) land.remove();
        art.style.visibility = '';
        box.style.opacity = '';
        pick.classList.remove('is-returning');
        return;
      }
      await fade(async () => { done(); pick.hidden = false; });
      center(sel, false);
      markDots();
    }

    READY.then(() => {
      const want = PHONES.find((p) => '#' + p.id === location.hash);
      if (want) launch(want.id);
      else { pick.hidden = false; center(sel, false); markDots(); }
    });
    pick.hidden = PHONES.some((p) => '#' + p.id === location.hash);
    requestAnimationFrame(() => { center(sel, false); markDots(); });
  };

  /* Crossing between phone and computer sizes (a rotated tablet, a
     resized window, a browser's device toolbar) restarts on the right
     picker, unless the address bar forces one. */
  const want = () => (matchMedia('(max-width: 760px), (max-height: 520px) and (pointer: coarse)').matches ? 'mobile' : 'desk');
  let rz = 0;
  addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => { if (MODE === 'mobile' && matchMedia('(pointer: coarse)').matches) return; if (root.dataset.forced !== '1' && want() !== MODE) location.reload(); }, 250);
  });

  if (MODE === 'mobile') phones(); else desk();
})();
