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

  /* Sound starts off. A small speaker in the corner turns it on (and off
     again); inside a desktop system the system's own menu bar has one. */
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
  const fade = async (fn) => {
    curtain.classList.add('is-on');
    await wait(380);
    await fn();
    curtain.classList.remove('is-on');
  };

  /* Behind both pickers: small filled shapes from every era, with
     hourglasses and clocks among them, shaded in softly. */
  const TIMEART = (mobile) => window.SHAPES.layer('time', mobile ? { count: 36, opacity: 0.055, size: [22, 42], seed: 11 } : { count: 60, opacity: 0.032, size: [26, 56], seed: 5 });

  /* The morph between a tile's drawing and the real machine. The drawing
     and the photograph fly the same path together: the drawing grows into
     a square over the machine, the photograph from the drawing's size into
     the machine itself. Mid-flight both blur and swap, so the drawing seems
     to sharpen into the real thing. Reversed, the machine shrinks back into
     its drawing. */
  const center = (r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
  const fit = (box, w, h) => { const k = Math.min(box.width / w, box.height / h); return { left: box.left + (box.width - w * k) / 2, top: box.top + (box.height - h * k) / 2, width: w * k, height: h * k }; };
  const clone = (node, r, z) => {
    const n = node.cloneNode(true);
    n.removeAttribute('id');
    n.classList.add('pk-fly');
    n.style.cssText += `;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;z-index:${z}`;
    document.body.appendChild(n);
    return n;
  };
  const go = (n, a, b, dur) => n.animate([{ transform: 'translate(0px, 0px) scale(1)' }, { transform: `translate(${b.left - a.left}px, ${b.top - a.top}px) scale(${b.width / a.width})` }], { duration: dur, easing: 'cubic-bezier(.65,0,.25,1)', fill: 'forwards' }).finished;
  const flight = async ({ glyph, glyphBox, photo, photoW, photoH, glass, device, back = false, dur = 820 }) => {
    const sq = Math.max(device.width, device.height);
    const gBig = { left: center(device).x - sq / 2, top: center(device).y - sq / 2, width: sq, height: sq };
    const pSmall = photo ? fit(glyphBox, photoW, photoH) : null;
    const [g0, g1] = back ? [gBig, glyphBox] : [glyphBox, gBig];
    const jobs = [];
    if (glyph) {
      const g = clone(glyph, g0, 8710);
      jobs.push(go(g, g0, g1, dur).then(() => g.remove()));
      g.animate(back ? [{ opacity: 0, filter: 'blur(6px)' }, { opacity: 0, offset: .35 }, { opacity: 1, filter: 'blur(0)', offset: .7 }, { opacity: 1, filter: 'blur(0)' }]
        : [{ opacity: 1, filter: 'blur(0)' }, { opacity: 1, filter: 'blur(0)', offset: .3 }, { opacity: 0, filter: 'blur(6px)', offset: .65 }, { opacity: 0 }], { duration: dur, fill: 'forwards' });
    }
    if (photo) {
      const [p0, p1] = back ? [device, pSmall] : [pSmall, device];
      /* The photograph, with its screen blacked out as the real one is. */
      const im = document.createElement('div');
      im.style.background = `url("${photo}") 0 0 / 100% 100% no-repeat`;
      if (glass) im.innerHTML = `<i style="position:absolute;left:${glass[0] / photoW * 100}%;top:${glass[1] / photoH * 100}%;width:${glass[2] / photoW * 100}%;height:${glass[3] / photoH * 100}%;background:${glass[5] || '#050506'};border-radius:${glass[4] / photoW * 100}% / ${glass[4] / photoH * 100}%"></i>`;
      const q = clone(im, p0, 8711);
      jobs.push(go(q, p0, p1, dur).then(() => q));
      q.animate(back ? [{ opacity: 1, filter: 'blur(0)' }, { opacity: 1, filter: 'blur(0)', offset: .3 }, { opacity: 0, filter: 'blur(6px)', offset: .65 }, { opacity: 0 }]
        : [{ opacity: 0, filter: 'blur(6px) brightness(1.4)' }, { opacity: 0, offset: .3 }, { opacity: 1, filter: 'blur(0) brightness(1)', offset: .72 }, { opacity: 1, filter: 'blur(0) brightness(1)' }], { duration: dur, fill: 'forwards' });
    }
    const out = await Promise.all(jobs);
    return out.find((x) => x && x.nodeType === 1) || null;
  };
  /* Arriving from another timeline: a flash and a ring of light thrown out
     from the machine's middle. */
  const arrival = (r, color = '#fff') => {
    if (root.classList.contains('reduced')) return;
    const c = center(r), d = Math.max(r.width, r.height);
    const glow = document.createElement('div'), ring = document.createElement('div'), ring2 = document.createElement('div');
    glow.className = 'tl-glow'; ring.className = 'tl-ring'; ring2.className = 'tl-ring';
    [glow, ring, ring2].forEach((e) => { e.style.cssText = `left:${c.x}px;top:${c.y}px;width:${d}px;height:${d}px;--c:${color}`; document.body.appendChild(e); });
    glow.animate([{ transform: 'translate(-50%,-50%) scale(.2)', opacity: .9 }, { transform: 'translate(-50%,-50%) scale(1.3)', opacity: 0 }], { duration: 650, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' });
    ring.animate([{ transform: 'translate(-50%,-50%) scale(.3)', opacity: .9 }, { transform: 'translate(-50%,-50%) scale(1.9)', opacity: 0 }], { duration: 800, easing: 'cubic-bezier(.15,.7,.3,1)', fill: 'forwards' });
    ring2.animate([{ transform: 'translate(-50%,-50%) scale(.2)', opacity: .6 }, { transform: 'translate(-50%,-50%) scale(1.4)', opacity: 0 }], { duration: 950, delay: 90, easing: 'cubic-bezier(.15,.7,.3,1)', fill: 'both' });
    setTimeout(() => [glow, ring, ring2].forEach((e) => e.remove()), 1150);
  };

  /* ================================================================ DESKTOP */

  /* Each era drawn as the computer it ran on: an Apple II-style terminal, a
     compact Macintosh, a Bondi iMac, the aluminium iMac (AJ on the chin,
     the stand only hinted at), and a modern display for the standard site. */
  /* The mark centred on (x, y): its drawing's middle is at 31.43, 27.24. */
  const AJ = (x, y, s, c) => `<g transform="translate(${(x - 31.43 * s).toFixed(2)} ${(y - 27.24 * s).toFixed(2)}) scale(${s})" style="color:${c}"><path d="M10.29 44.57 L30.86 9.90 L43.20 32.70 L43.20 36.19 L36.19 36.19 L30.86 26.67 L20.19 44.57Z M26.25 36.19 A13.16 13.16 0 0 0 52.57 36.19 L43.83 36.19 A4.42 4.42 0 0 1 34.99 36.19Z M43.83 24.60h8.74v11.79h-8.74z" fill="currentColor"/><circle cx="48.2" cy="17.4" r="5.6" fill="currentColor"/></g>`;
  const ART = {
    1983: `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="a2b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ece3cc"/><stop offset="1" stop-color="#c9bc9b"/></linearGradient></defs><rect x="22" y="10" width="76" height="62" rx="6" fill="url(#a2b)" stroke="#8d8063"/><rect x="29" y="16" width="62" height="46" rx="4" fill="#111"/><rect x="32" y="19" width="56" height="40" rx="3" fill="#0c1a0c"/><text x="36" y="32" font-family="VT323, monospace" font-size="9" fill="#5cff6b">SOMMI-DOS</text><text x="36" y="42" font-family="VT323, monospace" font-size="9" fill="#5cff6b">]_</text><rect x="52" y="72" width="16" height="6" fill="#b3a585"/><path d="M10 80h100l6 22a3 3 0 0 1-3 4H7a3 3 0 0 1-3-4z" fill="url(#a2b)" stroke="#8d8063"/>${[0, 1, 2].map((r) => `<rect x="${16 + r * 3}" y="${84 + r * 6}" width="${84 - r * 6}" height="4.5" rx="1" fill="#6d6250" opacity=".55"/>`).join('')}</svg>`,
    1991: `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="mcb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1ecdf"/><stop offset="1" stop-color="#cfc7b3"/></linearGradient></defs><path d="M28 6h64a6 6 0 0 1 6 6v92H22V12a6 6 0 0 1 6-6z" fill="url(#mcb)" stroke="#968d78"/><rect x="22" y="104" width="76" height="8" rx="2" fill="#bdb49e" stroke="#968d78"/><rect x="32" y="14" width="56" height="46" rx="5" fill="#3a3a36"/><rect x="36" y="18" width="48" height="38" rx="2" fill="#f4f4f0"/><rect x="36" y="18" width="48" height="5" fill="#fff" stroke="#222" stroke-width=".6"/><rect x="42" y="30" width="22" height="14" fill="#fff" stroke="#222" stroke-width=".8"/><rect x="42" y="30" width="22" height="3" fill="#222"/><rect x="66" y="44" width="10" height="8" fill="#fff" stroke="#222" stroke-width=".8"/><rect x="58" y="80" width="26" height="3" rx="1.5" fill="#55503f"/>${AJ(35, 79, .2, '#8b8270')}</svg>`,
    1998: `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="g3b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fd6e6"/><stop offset=".5" stop-color="#1f9fbd"/><stop offset="1" stop-color="#0e6f8a"/></linearGradient><linearGradient id="g3w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d9dee3"/></linearGradient></defs><path d="M60 6c26 0 44 4 46 14 3 17 3 46-2 66-3 12-20 18-44 18S19 98 16 86c-5-20-5-49-2-66C16 10 34 6 60 6z" fill="url(#g3b)" stroke="#0b5b72"/><path d="M60 10c22 0 38 3 40 11 2 14 2 34-1 49H21c-3-15-3-35-1-49 2-8 18-11 40-11z" fill="url(#g3w)"/><rect x="28" y="18" width="64" height="48" rx="3" fill="#1a1a1a"/><rect x="31" y="21" width="58" height="42" rx="1.5" fill="#2d6bd0"/><rect x="31" y="21" width="58" height="5" fill="#d8d8d8"/><rect x="38" y="31" width="44" height="26" fill="#fff"/><rect x="38" y="31" width="44" height="4" fill="#1e3f8a"/><path d="M28 78h64l-4 14H32z" fill="#0e6f8a" opacity=".5"/>${AJ(60, 85, .15, '#e6f4f8')}<path d="M44 104h32l4 10H40z" fill="url(#g3b)" stroke="#0b5b72"/></svg>`,
    2007: `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="imW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e3e6ea"/></linearGradient><linearGradient id="imQ" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fb0e0"/><stop offset=".55" stop-color="#3f78c4"/><stop offset="1" stop-color="#1f3f8f"/></linearGradient><linearGradient id="imF" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c9ccd1"/><stop offset=".5" stop-color="#f4f5f7"/><stop offset="1" stop-color="#c9ccd1"/></linearGradient></defs><path d="M47 96h26l5 18H42z" fill="url(#imF)" stroke="#b9bdc3" stroke-width=".6"/><rect x="34" y="113" width="52" height="3.2" rx="1.6" fill="#e3e6ea" stroke="#b9bdc3" stroke-width=".5"/><rect x="4" y="8" width="112" height="90" rx="5" fill="url(#imW)" stroke="#c3c7cc" stroke-width=".8"/><rect x="10" y="14" width="100" height="62" fill="#0b0b0c"/><rect x="12" y="16" width="96" height="58" fill="url(#imQ)"/><path d="M12 50c24-16 54-24 96-12v6C70 34 40 42 12 62z" fill="#fff" opacity=".18"/><path d="M40 16c10 18 20 34 38 58" stroke="#fff" stroke-opacity=".18" stroke-width="5" fill="none"/><rect x="12" y="16" width="96" height="2.6" fill="#f2f2f4"/><rect x="34" y="68" width="52" height="5" rx="1.5" fill="#fff" opacity=".4"/><circle cx="60" cy="11" r="1.1" fill="#222"/>${AJ(60, 87, .26, '#c7cacf')}</svg>`,

    now: `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="nwS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#eef1f5"/></linearGradient></defs><rect x="6" y="16" width="108" height="70" rx="4" fill="#1b1c1f" stroke="#55575c" stroke-width=".8"/><rect x="9" y="19" width="102" height="64" rx="1.5" fill="url(#nwS)"/><rect x="15" y="24" width="10" height="3" rx="1.5" fill="#ff6b35"/><rect x="78" y="24" width="27" height="3" rx="1.5" fill="#c9ced6"/><rect x="15" y="36" width="56" height="7" rx="2" fill="#1d1f24"/><rect x="15" y="46" width="44" height="7" rx="2" fill="#3d68ff"/><rect x="15" y="58" width="60" height="3" rx="1.5" fill="#aab1bc"/><rect x="15" y="64" width="50" height="3" rx="1.5" fill="#aab1bc"/><rect x="15" y="72" width="22" height="6" rx="3" fill="#1d1f24"/><circle cx="94" cy="54" r="12" fill="#e6ebf2"/>${AJ(94, 54, .38, '#1d1f24')}<path d="M52 86h16l3 14H49z" fill="#8a8d93" opacity=".45"/><rect x="40" y="100" width="40" height="3" rx="1.5" fill="#8a8d93" opacity=".35"/></svg>`
  };

  const ERAS = [
    { year: '1983', name: 'SOMMI-DOS', note: 'A command line. Type, or click the commands.', sys: () => window.TERM, art: ART[1983] },
    { year: '1991', name: 'SommiOS 7', note: 'Black and white windows, icons and a Trash.', sys: () => window.FINDER, art: ART[1991] },
    { year: '1998', name: 'SommiNet 98', note: 'A browser and a homepage, guestbook included.', sys: () => window.WEB, art: ART[1998] },
    { year: '2007', name: 'SommiOS X Gator', note: 'A dock, Aqua windows and Spotlight.', sys: () => window.OSX, art: ART[2007] }
  ];
  /* The standard site sits in the same row, as the newest machine. */
  const OPTS = [...ERAS, { year: 'Today', name: 'Standard site', note: 'The regular portfolio, no time travel.', href: 'classic.html', art: ART.now }];

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
      </div>
      <p class="pk-copy">${I.mark(18)}<span>\u00a9 ${new Date().getFullYear()} Ajay Sommi</span></p>`;
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
    bar.innerHTML = `<button type="button" class="dk-chip" data-k="eras">‹ Eras</button><span></span><a class="dk-chip" href="${window.PORTFOLIO.resume}" target="_blank" rel="noopener">Resume</a><a class="dk-chip" href="classic.html">Standard site</a>`;
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
      1991: { src: 'assets/images/bezels/mac-1991.webp', w: 1356, h: 1159, glass: [334, 186, 521, 372, 18], scr: [346, 197, 497, 349], r: 10, view: [215, 30, 755, 850], aj: [307, 769, 38, false] },
      1998: { src: 'assets/images/bezels/imac-g3.webp', w: 1419, h: 1108, glass: [306, 194, 878, 600, 20], scr: [352, 236, 786, 516], r: 12, view: [160, 30, 1180, 1010], aj: [738, 851, 38, false] },
      2007: { src: 'assets/images/bezels/imac-2007.webp', w: 1726, h: 1608, glass: [119, 119, 1484, 930, 0], scr: [137, 137, 1448, 894], r: 0, view: [42, 42, 1642, 1290], aj: [861, 1184, 132, true] }
    };
    let photo = null;
    /* The machine fills most of the window: room above and at the sides,
       none below, where it runs off the bottom edge. */
    const place = (ph) => {
      const [vx, vy, vw, vh] = ph.view;
      const k = Math.min((innerHeight * 0.935) / vh, (innerWidth * 0.9) / vw);
      return { k, ox: (innerWidth - vw * k) / 2 - vx * k, oy: innerHeight - vh * k - vy * k };
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
        bezel.innerHTML = `<div class="bz-dev" style="width:${photo.w}px;height:${photo.h}px"><img src="${photo.src}" alt="" draggable="false" /><i class="bz-glass" style="left:${photo.glass[0]}px;top:${photo.glass[1]}px;width:${photo.glass[2]}px;height:${photo.glass[3]}px;border-radius:${photo.glass[4]}px"></i><span class="bz-aj" style="left:${ax - as / 2}px;top:${ay - as / 2}px;width:${as}px;height:${as}px">${I.mark(as, mono)}</span></div>`;
        host.classList.add('is-photo');
        host.classList.remove('is-dark');
        /* The Bondi iMac's power button switches the picture tube off and on. */
        if (y === '1998') {
          const b = document.createElement('button');
          b.type = 'button'; b.className = 'bz-power'; b.setAttribute('aria-label', 'Display power');
          b.style.cssText = 'left:1003px;top:948px;width:44px;height:44px';
          b.addEventListener('click', () => { SFX.click(); host.classList.toggle('is-dark'); });
          bezel.querySelector('.bz-dev').appendChild(b);
        }
        layout();
        return;
      }
      bezel.innerHTML = `<div class="bz-body"></div><div class="bz-frame"></div>${BEZEL[y]}`;
    };

    /* Where the machine is on screen: the photograph's whole frame, or for
       1983 (drawn) the body of the drawing. */
    const deviceBox = (y) => {
      if (PHOTO[y]) { const ph = PHOTO[y], { k, ox, oy } = place(ph); return { left: ox, top: oy, width: ph.w * k, height: ph.h * k }; }
      const b = bezel.querySelector('.bz-body');
      const r = b ? b.getBoundingClientRect() : { left: innerWidth * 0.1, top: innerHeight * 0.14, width: innerWidth * 0.8, height: innerHeight };
      return { left: r.left, top: r.top, width: r.width, height: Math.min(r.height, innerHeight - r.top) };
    };
    const tileArt = (i) => disks[i] && disks[i].querySelector('.pk-art svg');
    const settle = (y) => {
      const r = deviceBox(y);
      arrival(r, y === '1983' ? '#7dff8a' : '#ffffff');
      window.SHAPES.arrive(backdrop.querySelector('.bg-shapes'), center(r).x, center(r).y);
    };

    async function launch(i) {
      if (i === cur) return;
      const prev = cur;
      cur = i;
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
        const land = await flight({ glyph: art, glyphBox: from, photo: ph && ph.src, photoW: ph && ph.w, photoH: ph && ph.h, glass: ph && ph.glass, device: deviceBox(y) });
        pick.hidden = true;
        pick.classList.remove('is-leaving');
        art.style.visibility = '';
        host.classList.remove('is-morph');
        backdrop.querySelector('.bg-shapes').style.visibility = '';
        settle(y);
        if (land) land.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).finished.then(() => land.remove());
      } else {
        await fade(async () => { pick.hidden = true; show(); });
        settle(y);
      }
      const sys = ERAS[i].sys();
      if (!booted[i]) { booted[i] = true; await sys.boot(); }
      sys.resize && sys.resize();
      sys.enter();
    }

    /* Back to the eras: the machine shrinks into its drawing on the tile
       while the picker fades up around it. */
    async function showPicker() {
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
        const left = flight({ glyph: art, glyphBox: to, photo: ph && ph.src, photoW: ph && ph.w, photoH: ph && ph.h, glass: ph && ph.glass, device: dev, back: true, dur: 720 });
        setTimeout(() => { screens[prev].hidden = true; dress(-1); }, 60);
        const land = await left;
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
    });
    pick.hidden = location.hash.length > 1;
  };

  /* ================================================================= PHONES */

  const PHONE_ART = {
    nokia: `<svg viewBox="0 0 74 122" aria-hidden="true"><rect x="2" y="2" width="70" height="118" rx="26" fill="#2f4372"/><rect x="2" y="2" width="70" height="118" rx="26" fill="url(#nkG)"/><defs><linearGradient id="nkG" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".3"/><stop offset=".5" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient></defs><rect x="13" y="16" width="48" height="38" rx="8" fill="#20252c"/><rect x="18" y="21" width="38" height="27" rx="2" fill="#b4d074"/><text x="37" y="38" text-anchor="middle" font-family="Pixelify Sans, monospace" font-size="7" font-weight="700" fill="#1d2a10">SOMMIA</text><rect x="25" y="59" width="24" height="9" rx="4.5" fill="#c4cbd8"/>${[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => `<ellipse cx="${20 + c * 17}" cy="${78 + r * 10}" rx="6.5" ry="3.6" fill="#d7dce6"/>`).join('')).join('')}</svg>`,
    pocket: `<svg viewBox="0 0 74 122" aria-hidden="true"><rect x="2" y="2" width="70" height="118" rx="12" fill="#f3f1ec" stroke="#c9c3b6"/><rect x="9" y="9" width="56" height="48" rx="4" fill="#2b2e2a"/><rect x="12" y="12" width="50" height="42" rx="2" fill="#c9dcb6"/><rect x="14" y="18" width="46" height="5" fill="#1c2614"/><rect x="14" y="26" width="34" height="3" fill="#55603f"/><rect x="14" y="32" width="40" height="3" fill="#55603f"/><circle cx="37" cy="88" r="24" fill="#fbfaf7" stroke="#d9d4c8"/><circle cx="37" cy="88" r="8.5" fill="#ece9e2" stroke="#d9d4c8"/></svg>`,
    now: `<svg viewBox="0 0 66 122" aria-hidden="true"><rect x="1" y="1" width="64" height="120" rx="12" fill="#1b1c1f" stroke="#55575c" stroke-width=".8"/><rect x="4" y="4" width="58" height="114" rx="9" fill="#f5f7fa"/><rect x="24.5" y="7.2" width="17" height="5" rx="2.5" fill="#1b1c1f"/><rect x="10" y="20" width="8" height="2.6" rx="1.3" fill="#ff6b35"/><rect x="10" y="30" width="40" height="6" rx="2" fill="#1d1f24"/><rect x="10" y="39" width="30" height="6" rx="2" fill="#3d68ff"/><rect x="10" y="50" width="44" height="2.4" rx="1.2" fill="#aab1bc"/><rect x="10" y="55" width="36" height="2.4" rx="1.2" fill="#aab1bc"/><circle cx="33" cy="82" r="15" fill="#e6ebf2"/>${AJ(33, 82, .5, '#1d1f24')}<rect x="10" y="104" width="22" height="6" rx="3" fill="#1d1f24"/></svg>`,
    iphone: `<svg viewBox="0 0 66 122" aria-hidden="true"><defs><linearGradient id="ipR" x1="0" x2="1"><stop offset="0" stop-color="#8d9298"/><stop offset=".3" stop-color="#f2f3f4"/><stop offset=".7" stop-color="#c5c9ce"/><stop offset="1" stop-color="#7f848a"/></linearGradient></defs><rect x="1" y="1" width="64" height="120" rx="11" fill="url(#ipR)"/><rect x="2.6" y="2.6" width="60.8" height="116.8" rx="9.6" fill="#0b0b0b"/><rect x="27" y="10" width="12" height="2" rx="1" fill="#2b2b2b"/><rect x="7.5" y="21" width="51" height="76.5" fill="#000"/>${[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => `<rect x="${10 + c * 12.2}" y="${25 + r * 14.5}" width="9" height="9" rx="2" fill="hsl(${(r * 4 + c) * 33} 70% 55%)"/>`).join('')).join('')}<rect x="7.5" y="84" width="51" height="13.5" fill="#a9a9a9"/>${[0, 1, 2, 3].map((c) => `<rect x="${10 + c * 12.2}" y="86.2" width="9" height="9" rx="2" fill="hsl(${120 + c * 70} 65% 55%)"/>`).join('')}<circle cx="33" cy="109" r="6.2" fill="#121212" stroke="#3a3a3a" stroke-width=".8"/><rect x="30.6" y="106.6" width="4.8" height="4.8" rx="1.2" fill="none" stroke="#9a9a9a" stroke-width=".7"/></svg>`
  };
  const PHONES = [
    { id: 'nokia', name: 'SOMMIA 3310', year: '2000', note: 'Keys only. Navi selects, C goes back.', mod: () => window.NOKIA, cls: 'nk-room' },
    { id: 'pocket', name: 'iSommi Classic', year: '2004', note: 'A click wheel and a tiny screen.', mod: () => window.POCKET, cls: 'pocket-room' },
    { id: 'iphone', name: 'iSommi 2G', year: '2007', note: 'Slide to unlock. The home button goes back.', mod: () => window.IPHONE, cls: 'iphone-room' }
  ];

  const PICKS = [...PHONES, { id: 'now', name: 'Standard site', year: 'Today', note: 'The regular portfolio, no time travel.', href: 'classic.html' }];
  const phones = () => {
    const host = document.getElementById('phoneHost');
    const pick = document.getElementById('picker');
    const rooms = {};
    let cur = null;
    let sel = Math.max(0, PHONES.findIndex((p) => p.id === store.get('phone', 'iphone')));

    pick.classList.add('is-phones');
    pick.innerHTML = TIMEART(true) + `
      <div class="mp-head">${I.pxmark(32)}<h1>Choose an era</h1><p>Each one is the portfolio on a device from its year.</p></div>
      <div class="mp-rail" role="listbox" aria-label="Eras">${PICKS.map((p, i) => `<button type="button" class="mp-card${p.href ? ' is-now' : ''}" role="option" data-i="${i}"><span class="mp-art">${PHONE_ART[p.id]}</span><span class="mp-y">${p.year}</span><b>${esc(p.name)}</b><span class="mp-n">${esc(p.note)}</span><span class="mp-on">${p.href ? 'Open' : 'Power on'}</span></button>`).join('')}</div>
      <div class="mp-dots">${PICKS.map((_, i) => `<i data-i="${i}"></i>`).join('')}</div>`;
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
    std.href = 'classic.html';
    std.hidden = true;
    std.textContent = 'Standard site';
    document.body.appendChild(std);
    const LOOK = { nokia: ['#243a6e', 0.18], pocket: ['#5b4a86', 0.18], iphone: ['#ffffff', 0.13] };

    /* The tile's drawing becomes the phone (and back), by the same flight
       as the computers, its photograph sharpening in mid-air. */
    const SHOT = { nokia: ['assets/images/sommia-3310.webp', 924, 1702, [232, 452, 470, 342, 40, '#a9c262']], pocket: ['assets/images/isommi-classic.webp', 947, 1661, [168, 151, 600, 489, 6, '#b3c0da']], iphone: ['retro/dev/iphone-2g.webp', 795, 1508, [68, 262, 661, 991, 0, '#000']] };
    const parts = (id) => {
      const room = rooms[id], card = cards[PICKS.findIndex((x) => x.id === id)];
      const dev = room.querySelector('.nk, .pk, .ip'), box = room.querySelector('.nk-scale, .pk-scale, .ip-scale');
      const shot = id !== 'iphone' || dev.classList.contains('is-photo') ? SHOT[id] : null;
      return { room, dev, box, shot, art: card && card.querySelector('.mp-art svg') };
    };
    const morph = async (id) => {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const { room, dev, box, shot, art } = parts(id);
      const layer = room.querySelector('.bg-shapes');
      if (!art || !dev) return;
      const from = art.getBoundingClientRect(), to = box.getBoundingClientRect();
      art.style.visibility = 'hidden';
      box.style.opacity = '0';
      if (layer) layer.style.visibility = 'hidden';
      pick.classList.add('is-leaving');
      const land = await flight({ glyph: art, glyphBox: from, photo: shot && shot[0], photoW: shot && shot[1], photoH: shot && shot[2], glass: shot && shot[3], device: to, dur: 760 });
      box.style.transition = 'opacity .3s ease';
      box.style.opacity = '';
      setTimeout(() => { box.style.transition = ''; }, 320);
      art.style.visibility = '';
      if (layer) layer.style.visibility = '';
      const c = { x: to.left + to.width / 2, y: to.top + to.height / 2 };
      arrival(to, id === 'nokia' ? '#cfe0ff' : '#ffffff');
      window.SHAPES.arrive(layer, c.x, c.y);
      if (land) land.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }).finished.then(() => land.remove());
    };

    async function launch(id) {
      const p = PHONES.find((x) => x.id === id);
      if (!p || cur === id) return;
      store.set('phone', id);
      const open = () => {
        if (cur) rooms[cur].hidden = true;
        cur = id;
        if (!rooms[id]) {
          const r = document.createElement('div');
          r.className = p.cls + ' phone-room' + (pick.hidden ? '' : ' no-intro');
          host.appendChild(r);
          rooms[id] = r;
          p.mod().start(r, () => showPicker());
          r.insertAdjacentHTML('afterbegin', window.SHAPES.layer(id, { count: 30, color: LOOK[id][0], opacity: LOOK[id][1], size: [24, 50], seed: id.length * 7 }));
        } else rooms[id].hidden = false;
        document.documentElement.dataset.phone = id;
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
    }

    async function showPicker() {
      const id = cur;
      const done = () => {
        if (cur) rooms[cur].hidden = true;
        cur = null;
        SFX.music(null);
        delete document.documentElement.dataset.phone;
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
        const left = flight({ glyph: art, glyphBox: to, photo: shot && shot[0], photoW: shot && shot[1], photoH: shot && shot[2], glass: shot && shot[3], device: from, back: true, dur: 680 });
        setTimeout(done, 60);
        const land = await left;
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
