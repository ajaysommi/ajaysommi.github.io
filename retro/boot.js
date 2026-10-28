/* ==========================================================================
   Start-up. After the loading screen the visitor picks what to run. On a
   computer that is a startup disk, one per era, and the system on it boots
   to fill the window: 1983 terminal, 1991 desktop, 1998 web, 2009 desktop.
   On a phone it is a handset: a 2000 candybar, a 2004 pocket player or a
   2007 touchscreen. Every system can come back here to pick another.
   Deep links (#1991, #2009, #nokia, #iphone ...) skip the picker.
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

  /* Behind both pickers: time itself, faint and slow. A clock face of
     ticks, rings turning at different speeds, the eras marked around them,
     and two hands sweeping. It fades up out of black. */
  const TIMEART = (() => {
    let ticks = '';
    for (let i = 0; i < 120; i++) { const a = i * 3, L = i % 10 === 0 ? 26 : i % 5 === 0 ? 16 : 8; ticks += `<line x1="500" y1="${70}" x2="500" y2="${70 + L}" transform="rotate(${a} 500 500)"/>`; }
    const years = ['1983', '1991', '1998', '2000', '2004', '2007', '2009', 'TODAY'];
    const yr = years.map((y, i) => `<text transform="rotate(${i * 45} 500 500)" x="500" y="150" text-anchor="middle">${y}</text>`).join('');
    let dots = '';
    for (let i = 0; i < 36; i++) dots += `<circle cx="500" cy="230" r="${i % 3 ? 2 : 4}" transform="rotate(${i * 10} 500 500)"/>`;
    return `<div class="pk-time" aria-hidden="true"><svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
      <g class="t-face" stroke="#fff" stroke-width="2" fill="none">${ticks}<circle cx="500" cy="500" r="430"/><circle cx="500" cy="500" r="392" stroke-dasharray="2 10"/></g>
      <g class="t-years" fill="#fff" font-family="Silkscreen, monospace" font-size="22" letter-spacing="6">${yr}</g>
      <g class="t-dots" fill="#fff">${dots}<circle cx="500" cy="500" r="270" fill="none" stroke="#fff" stroke-width="1.5"/></g>
      <g class="t-ring2" fill="none" stroke="#fff" stroke-width="1.5"><circle cx="500" cy="500" r="170" stroke-dasharray="40 14 4 14"/></g>
      <g class="t-min"><line x1="500" y1="500" x2="500" y2="140" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>
      <g class="t-hr"><line x1="500" y1="500" x2="500" y2="290" stroke="#fff" stroke-width="5" stroke-linecap="round"/></g>
      <circle cx="500" cy="500" r="7" fill="#fff"/>
    </svg></div>`;
  })();

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
    2009: `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="imA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3f4f6"/><stop offset="1" stop-color="#c3c7cc"/></linearGradient><radialGradient id="imS" cx=".55" cy=".45" r=".8"><stop offset="0" stop-color="#e7a3e0"/><stop offset=".35" stop-color="#9b3fa4"/><stop offset=".7" stop-color="#3a1a5c"/><stop offset="1" stop-color="#140b26"/></radialGradient><linearGradient id="imF" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9ea3a9"/><stop offset=".5" stop-color="#e3e6e9"/><stop offset="1" stop-color="#9ea3a9"/></linearGradient></defs><path d="M47 97h26l5 18H42z" fill="url(#imF)" stroke="#8f959c" stroke-width=".6"/><rect x="34" y="114" width="52" height="3.2" rx="1.6" fill="#c3c7cc" stroke="#8f959c" stroke-width=".5"/><rect x="4" y="10" width="112" height="88" rx="3" fill="url(#imA)" stroke="#8f959c" stroke-width=".8"/><rect x="5.2" y="13.2" width="109.6" height="66" rx="2" fill="#0b0b0c"/><rect x="11" y="18" width="98" height="56" fill="url(#imS)"/><path d="M11 40c22-14 52-20 98-10v8C70 28 40 34 11 52z" fill="#fff" opacity=".12"/><rect x="11" y="18" width="98" height="3" fill="#e8e8ec" opacity=".85"/><rect x="34" y="68" width="52" height="5" rx="1.5" fill="#fff" opacity=".35"/>${AJ(60, 89, .27, '#111')}<path d="M4.4 79.6h111.2" stroke="#b5bac0" stroke-width=".6"/></svg>`,
    now: `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="nwS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#eef1f5"/></linearGradient></defs><rect x="6" y="16" width="108" height="70" rx="4" fill="#1b1c1f" stroke="#55575c" stroke-width=".8"/><rect x="9" y="19" width="102" height="64" rx="1.5" fill="url(#nwS)"/><rect x="15" y="24" width="10" height="3" rx="1.5" fill="#ff6b35"/><rect x="78" y="24" width="27" height="3" rx="1.5" fill="#c9ced6"/><rect x="15" y="36" width="56" height="7" rx="2" fill="#1d1f24"/><rect x="15" y="46" width="44" height="7" rx="2" fill="#3d68ff"/><rect x="15" y="58" width="60" height="3" rx="1.5" fill="#aab1bc"/><rect x="15" y="64" width="50" height="3" rx="1.5" fill="#aab1bc"/><rect x="15" y="72" width="22" height="6" rx="3" fill="#1d1f24"/><circle cx="94" cy="54" r="12" fill="#e6ebf2"/>${AJ(94, 54, .38, '#1d1f24')}<path d="M52 86h16l3 14H49z" fill="#8a8d93" opacity=".45"/><rect x="40" y="100" width="40" height="3" rx="1.5" fill="#8a8d93" opacity=".35"/></svg>`
  };

  const ERAS = [
    { year: '1983', name: 'SOMMI-DOS', note: 'A command line. Type, or click the commands.', sys: () => window.TERM, art: ART[1983] },
    { year: '1991', name: 'SommiOS 7', note: 'Black and white windows, icons and a Trash.', sys: () => window.FINDER, art: ART[1991] },
    { year: '1998', name: 'SommiNet 98', note: 'A browser and a homepage, guestbook included.', sys: () => window.WEB, art: ART[1998] },
    { year: '2009', name: 'SommiOS X Snow Gator', note: 'A dock, Aqua windows and Spotlight.', sys: () => window.OSX, art: ART[2009] }
  ];
  /* The standard site sits in the same row, as the newest machine. */
  const OPTS = [...ERAS, { year: 'Today', name: 'Standard site', note: 'The regular portfolio, no time travel.', href: 'classic.html', art: ART.now }];

  const desk = () => {
    const host = document.getElementById('osHost');
    const pick = document.getElementById('picker');
    const screens = [];
    const booted = [];
    let cur = -1;
    let sel = Math.max(0, ERAS.findIndex((e) => e.year === store.get('era', '2009')));

    const api = {
      go: (i) => launch(i),
      picker: () => showPicker(),
      years: ERAS.map((e) => e.year),
      hint() {}, led() {}
    };

    pick.classList.add('is-desk-pick');
    pick.innerHTML = TIMEART + `
      <div class="sm-status"><span class="sm-bat"><i></i></span><span class="sm-clock"></span></div>
      <div class="pk-in">
        <div class="pk-head">${I.pxmark(36)}<h1>Choose an era</h1><p>Each one is the portfolio on a computer from its year.</p></div>
        <div class="pk-row" role="listbox" aria-label="Eras">${OPTS.map((e, i) => `<button type="button" class="pk-d${e.href ? ' is-now' : ''}" role="option" data-i="${i}"><span class="pk-art">${e.art}</span><span class="pk-y">${e.year}</span><b>${esc(e.name)}</b><span class="pk-n">${esc(e.note)}</span></button>`).join('')}</div>
        <p class="pk-foot">Click one to start it up · or use ← → and Return</p>
      </div>
      <div class="sm-power"><button type="button" data-p="off"><svg viewBox="0 0 24 24"><path d="M12 3v8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7.5 6.2a8 8 0 1 0 9 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span>Shut Down</span></button><button type="button" data-p="re"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M14 8l-5 4 5 4z" fill="currentColor"/></svg><span>Restart</span></button></div>`;
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
      const pw = e.target.closest('[data-p]');
      if (pw && pw.dataset.p === 're') { SFX.click(); fade(async () => { location.reload(); await wait(5000); }); }
      if (pw && pw.dataset.p === 'off') {
        SFX.click();
        const off = document.createElement('button');
        off.type = 'button'; off.className = 'sm-off'; off.setAttribute('aria-label', 'Power on');
        off.innerHTML = '<span>Press any key or click to start up</span>';
        const on = () => { off.remove(); removeEventListener('keydown', on); };
        off.addEventListener('click', on); addEventListener('keydown', on);
        document.body.appendChild(off);
      }
    });
    document.addEventListener('keydown', (e) => {
      if (pick.hidden || document.querySelector('.sm-off')) return;
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
      2009: `<div class="bz-chin"><span class="bz-badge">${I.mark(64, true)}</span></div>`
    };
    const bezel = document.createElement('div');
    bezel.className = 'bz';
    bezel.setAttribute('aria-hidden', 'true');
    host.appendChild(bezel);
    /* A way back to the eras from inside any system, out on the backdrop
       where it never covers the screen. */
    const eras = document.createElement('button');
    eras.type = 'button';
    eras.className = 'dk-eras';
    eras.hidden = true;
    eras.innerHTML = '\u2039 Eras';
    eras.addEventListener('click', () => { SFX.click(); showPicker(); });
    document.body.appendChild(eras);
    /* Photographed machines: the picture scaled to the window (the part in
       view, at least), the system's screen laid exactly over the picture's
       screen, and the AJ where the maker's logo was. Sizes are the
       picture's own pixels. */
    const PHOTO = {
      1991: { src: 'assets/images/bezels/mac-1991.webp', w: 1416, h: 1402, scr: [252, 271, 895, 600], r: 8, view: [0, 0, 1416, 1402], aj: [222, 1319, 50, false] },
      1998: { src: 'assets/images/bezels/imac-g3.webp', w: 1200, h: 1085, scr: [230, 211, 739, 554], r: 6, view: [0, 0, 1200, 1085], aj: [600, 850, 40, false] },
      2009: { src: 'assets/images/bezels/imac-2009.webp', w: 1864, h: 1270, scr: [83, 94, 1698, 930], r: 0, view: [0, 0, 1864, 1270], aj: [941, 1171, 58, true] }
    };
    let photo = null;
    const layout = () => {
      if (!photo) return;
      const pad = 26, W = innerWidth - pad * 2, H = innerHeight - pad * 2;
      const [vx, vy, vw, vh] = photo.view;
      const k = Math.min(W / vw, H / vh);
      const ox = (innerWidth - vw * k) / 2 - vx * k, oy = (innerHeight - vh * k) / 2 - vy * k;
      const dev = bezel.querySelector('.bz-dev');
      dev.style.transform = `translate(${ox}px, ${oy}px) scale(${k})`;
      const [sx, sy, sw, sh] = photo.scr;
      Object.entries({ '--pl': ox + sx * k, '--pt': oy + sy * k, '--pw': sw * k, '--ph': sh * k, '--pr': photo.r * k }).forEach(([n, v]) => host.style.setProperty(n, v + 'px'));
    };
    addEventListener('resize', layout);
    const dress = (i) => {
      eras.hidden = i < 0;
      photo = null;
      host.classList.remove('is-photo');
      if (i < 0) { delete host.dataset.era; bezel.innerHTML = ''; return; }
      const y = ERAS[i].year;
      host.dataset.era = y;
      if (PHOTO[y]) {
        photo = PHOTO[y];
        const [ax, ay, as, mono] = photo.aj;
        bezel.innerHTML = `<div class="bz-dev" style="width:${photo.w}px;height:${photo.h}px"><img src="${photo.src}" alt="" draggable="false" /><span class="bz-aj" style="left:${ax - as / 2}px;top:${ay - as / 2}px;width:${as}px;height:${as}px">${I.mark(as, mono)}</span></div>`;
        host.classList.add('is-photo');
        layout();
        return;
      }
      bezel.innerHTML = `<div class="bz-body"></div><div class="bz-frame"></div>${BEZEL[y]}`;
    };

    async function launch(i) {
      if (i === cur) return;
      const prev = cur;
      cur = i;
      store.set('era', ERAS[i].year);
      await fade(async () => {
        if (prev >= 0) { ERAS[prev].sys().leave(); screens[prev].hidden = true; }
        dress(i);
        pick.hidden = true;
        const s = screen(i);
        s.hidden = false;
        osOn(true);
        history.replaceState(null, '', '#' + ERAS[i].year);
      });
      const sys = ERAS[i].sys();
      if (!booted[i]) { booted[i] = true; await sys.boot(); }
      sys.resize && sys.resize();
      sys.enter();
    }

    async function showPicker() {
      const prev = cur;
      cur = -1;
      await fade(async () => {
        if (prev >= 0) { ERAS[prev].sys().leave(); screens[prev].hidden = true; }
        dress(-1);
        pick.hidden = false;
        osOn(false);
        history.replaceState(null, '', location.pathname + location.search);
        mark();
      });
      disks[sel].focus({ preventScroll: true });
    }

    addEventListener('resize', () => { if (cur >= 0) { const s = ERAS[cur].sys(); s.resize && s.resize(); } });

    READY.then(() => {
      const want = ERAS.findIndex((e) => '#' + e.year === location.hash);
      if (want >= 0) launch(want);
      else { pick.hidden = false; disks[sel].focus({ preventScroll: true }); }
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
    pick.innerHTML = TIMEART + `
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

    /* A small way back to this picker, outside every phone. */
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'mp-back';
    back.hidden = true;
    back.innerHTML = '\u2039 Eras';
    back.addEventListener('click', () => showPicker());
    document.body.appendChild(back);

    async function launch(id) {
      const p = PHONES.find((x) => x.id === id);
      if (!p || cur === id) return;
      store.set('phone', id);
      await fade(async () => {
        if (cur) rooms[cur].hidden = true;
        cur = id;
        pick.hidden = true;
        if (!rooms[id]) {
          const r = document.createElement('div');
          r.className = p.cls + ' phone-room';
          host.appendChild(r);
          rooms[id] = r;
          p.mod().start(r, () => showPicker());
        } else rooms[id].hidden = false;
        back.hidden = false;
        history.replaceState(null, '', '#' + id);
        SFX.music(id === 'iphone' ? 2007 : null);
      });
    }

    async function showPicker() {
      await fade(async () => {
        if (cur) rooms[cur].hidden = true;
        cur = null;
        SFX.music(null);
        back.hidden = true;
        pick.hidden = false;
        history.replaceState(null, '', location.pathname + location.search);
      });
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
    rz = setTimeout(() => { if (root.dataset.forced !== '1' && want() !== MODE) location.reload(); }, 250);
  });

  if (MODE === 'mobile') phones(); else desk();
})();
