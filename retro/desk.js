/* ==========================================================================
   The desk. Three machines stand on it in a row, oldest on the left. The
   visit starts looking at the first one with a disk lying in front of it;
   the disk goes in, the machine boots and the camera moves into its screen
   until the screen is the browser window. From then on, scrolling past the
   end of whatever is under the pointer pulls back out, slides along the desk
   to the next machine and goes in again: a scroll is a step through time.

   Machines are the three systems (term.js, finder.js, web.js). Each gets a
   screen to draw into and is told when it is being looked at.
   ========================================================================== */
(function desk() {
  if (document.documentElement.dataset.mode !== 'desk') return;

  const room = document.getElementById('room');
  const track = document.getElementById('track');
  const hud = document.getElementById('hud');
  const hint = document.getElementById('hudHint');
  const eras = hud.querySelector('.hud-eras');
  const meter = document.getElementById('scrollMeter');
  const smFill = document.getElementById('smFill');
  const smLabel = document.getElementById('smLabel');
  const reduced = document.documentElement.classList.contains('reduced');
  const SYS = [window.TERM, window.FINDER, window.WEB];
  const YEARS = ['1983', '1991', '1998'];
  const NAMES = ['the terminal', 'the desktop', 'the web'];

  let W = innerWidth, H = innerHeight;
  let cur = 0;
  let state = 'intro';           /* intro, inserting, in, travel */
  let cam = { s: 1, x: 0, y: 0 };
  const booted = [false, false, false];
  const geo = [];                /* per machine: box and screen in track units */
  let floppyRest = { x: 0, y: 0 };

  const setVars = () => {
    W = innerWidth; H = innerHeight;
    document.documentElement.style.setProperty('--W', W + 'px');
    document.documentElement.style.setProperty('--H', H + 'px');
  };
  setVars();

  /* ------------------------------------------------------------ building */

  const mark = window.ICONS.mark;
  const MACHINE_HTML = [
    `<div class="mc-case">
       <div class="mc-screen"><div class="off"></div></div>
       <span class="badge">SOMMI&nbsp;TERMINAL</span>
       <span class="led is-on"></span>
     </div>
     <div class="unit">
       <span class="badge">SOMMI&middot;83<small>PERSONAL COMPUTER</small></span>
       <span class="stripes"><i></i><i></i><i></i><i></i></span>
       <div class="drive"><span class="slot"></span><span class="eject"></span><span class="led"></span></div>
     </div>
     <div class="kbd"><span class="row"></span><span class="row"></span><span class="row"></span><span class="row"></span></div>`,
    `<div class="mc-case">
       <div class="mc-screen"><div class="off"></div></div>
       <div class="chin">
         <span class="mark-badge">${mark(48, true)}</span>
         <span class="badge">SommiTosh SE</span>
         <div class="drive"><span class="slot"></span><span class="led"></span></div>
         <span class="vents"></span>
       </div>
     </div>
     <div class="foot"></div>`,
    `<div class="mc-case">
       <div class="mc-screen"><div class="off"></div></div>
       <div class="chin">
         <span class="grille l"></span><span class="grille r"></span>
         <span class="mark-badge">${mark(48, true)}</span>
         <span class="tray"></span>
         <span class="badge">SommiNet 98</span>
       </div>
     </div>
     <div class="stand"></div>`
  ];

  const machines = MACHINE_HTML.map((html, i) => {
    const el = document.createElement('section');
    el.className = 'mc mc-' + i;
    el.innerHTML = html;
    el.setAttribute('aria-label', `${YEARS[i]} computer`);
    track.appendChild(el);
    return el;
  });
  const screens = machines.map((m) => m.querySelector('.mc-screen'));

  const deskEl = document.createElement('div');
  deskEl.className = 'desk';
  track.prepend(deskEl);

  const shadows = machines.map(() => {
    const s = document.createElement('div');
    s.className = 'desk-shadow';
    track.insertBefore(s, machines[0]);
    return s;
  });

  /* Things on the desk. */
  const props = document.createElement('div');
  props.innerHTML = `
    <div class="prop mug" data-p="mug"></div>
    <div class="prop stack" data-p="stack"><i style="background:#2f3a52"></i><i style="background:#7a2c2c"></i><i style="background:#2c5e3c"></i><i style="background:#222"></i></div>
    <div class="prop note" data-p="note0">SCROLL&nbsp;&darr;<br/>= TIME TRAVEL</div>
    <div class="prop note" data-p="note1" style="transform:rotate(2.5deg);background:#9fe0f2">double-click<br/>everything</div>
    <div class="prop note" data-p="note2" style="transform:rotate(-1.5deg);background:#ffc6e0">try the<br/>address bar</div>`;
  [...props.children].forEach((p) => track.appendChild(p));
  const prop = (k) => track.querySelector(`[data-p="${k}"]`);

  /* The disk. */
  const floppy = document.createElement('button');
  floppy.type = 'button';
  floppy.className = 'floppy is-idle';
  floppy.setAttribute('aria-label', 'Portfolio disk. Press to insert it into the drive');
  floppy.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true">
      <path d="M6 4h80l10 10v80a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" fill="#1d2230"/>
      <path d="M6 4h80l10 10v80a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" fill="none" stroke="#000" stroke-opacity=".4"/>
      <rect x="24" y="4" width="50" height="30" rx="1.5" fill="#c9ccd2"/>
      <rect x="24" y="4" width="50" height="30" rx="1.5" fill="url(#mt)"/>
      <rect x="54" y="9" width="11" height="20" rx="1" fill="#1d2230"/>
      <rect x="14" y="44" width="72" height="50" rx="2" fill="#f4efe3"/>
      <rect x="14" y="44" width="72" height="7" fill="#ff6b35"/>
      <rect x="14" y="51" width="72" height="3" fill="#3d68ff"/>
      <text x="20" y="66" font-family="Pixelify Sans, monospace" font-size="9" font-weight="700" fill="#1a1a1a">AJAY SOMMI</text>
      <text x="20" y="77" font-family="Pixelify Sans, monospace" font-size="6.6" fill="#333">portfolio &#8217;26</text>
      <text x="20" y="88" font-family="VT323, monospace" font-size="7" fill="#666">1.44 MB &#183; HD &#183; DO NOT BEND</text>
      <rect x="8" y="88" width="4" height="4" fill="#0e121a"/>
      <defs><linearGradient id="mt" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".25"/></linearGradient></defs>
    </svg>`;
  track.appendChild(floppy);

  /* Era buttons along the left edge. */
  YEARS.forEach((y, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = y;
    b.title = `Go to ${y}, ${NAMES[i]}`;
    b.addEventListener('click', () => go(i));
    eras.appendChild(b);
  });
  const markEra = () => [...eras.children].forEach((b, i) => b.setAttribute('aria-current', i === cur ? 'true' : 'false'));

  /* ------------------------------------------------------------- layout */

  const layout = () => {
    track.style.transition = 'none';
    track.style.transform = 'none';
    const gap = W * 0.42;
    let x = 0;
    const sizes = machines.map((m) => ({ w: m.offsetWidth, h: m.offsetHeight }));
    const deskY = Math.max(...sizes.map((s) => s.h));
    machines.forEach((m, i) => {
      const { w, h } = sizes[i];
      const top = deskY - h + (i === 0 ? 0 : -H * 0.06);
      m.style.left = x + 'px';
      m.style.top = top + 'px';
      geo[i] = { x, y: top, w, h };
      const sh = shadows[i];
      sh.style.left = x - w * 0.05 + 'px';
      sh.style.width = w * 1.1 + 'px';
      sh.style.top = top + h - H * 0.05 + 'px';
      sh.style.height = H * 0.12 + 'px';
      x += w + gap;
    });
    /* Where each screen sits, measured exactly: the camera must land on
       whole pixels or every letter on the screen goes soft. */
    const tr = track.getBoundingClientRect();
    screens.forEach((sc, i) => { const r = sc.getBoundingClientRect(); geo[i].sx = r.left - tr.left; geo[i].sy = r.top - tr.top; });
    const deskTop = deskY - H * 0.36;
    deskEl.style.left = -W * 2 + 'px';
    deskEl.style.width = x + W * 4 + 'px';
    deskEl.style.top = deskTop + 'px';
    deskEl.style.height = H * 3 + 'px';

    /* Props, placed relative to the machines. */
    const g0 = geo[0], g1 = geo[1], g2 = geo[2];
    const place = (el, l, t, w, h) => { el.style.left = l + 'px'; el.style.top = t + 'px'; if (w) el.style.width = w + 'px'; if (h) el.style.height = h + 'px'; };
    place(prop('mug'), g0.x - W * 0.2, deskY - H * 0.24, W * 0.07, H * 0.16);
    const st = prop('stack');
    place(st, g1.x + g1.w + W * 0.1, g2.y + g2.h - H * 0.09, W * 0.16);
    place(prop('note0'), g0.x + W * 0.36, g0.y + H * 1.2);
    prop('note0').style.fontSize = H * 0.024 + 'px';
    place(prop('note1'), g1.x + W * 0.36, g1.y + H * 1.13);
    prop('note1').style.fontSize = H * 0.024 + 'px';
    place(prop('note2'), g2.x + W * 0.03, g2.y + H * 1.12);
    prop('note2').style.fontSize = H * 0.024 + 'px';

    /* The disk rests on the desk to the right of the keyboard. */
    floppyRest = { x: g0.x + g0.w + W * 0.03, y: deskY - W * 0.165 - H * 0.01 };
    if (state === 'intro') { floppy.style.left = floppyRest.x + 'px'; floppy.style.top = floppyRest.y + 'px'; }

    track.offsetWidth;
    track.style.transition = '';
    applyCam(cam, 0);
  };

  /* -------------------------------------------------------------- camera */

  const full = (i) => ({ s: 1, x: -geo[i].sx, y: -geo[i].sy });
  const view = (i) => {
    const g = geo[i];
    let bx = g.x, bw = g.w;
    if (i === 0 && state !== 'in') { bx = g.x - W * 0.05; bw = g.w + W * 0.3; }
    const s = Math.min((W * 0.8) / bw, (H * 0.8) / g.h);
    return { s, x: W / 2 - s * (bx + bw / 2), y: H * 0.5 - s * (g.y + g.h / 2) };
  };

  let camTimer = 0;
  const applyCam = (c, ms) => new Promise((resolve) => {
    cam = c;
    clearTimeout(camTimer);
    if (!ms || reduced) {
      room.classList.remove('is-moving');
      track.style.transform = `translate3d(${c.x}px, ${c.y}px, 0) scale(${c.s})`;
      return resolve();
    }
    room.style.setProperty('--cam-t', ms + 'ms');
    room.classList.add('is-moving');
    requestAnimationFrame(() => {
      track.style.transform = `translate3d(${c.x}px, ${c.y}px, 0) scale(${c.s})`;
    });
    camTimer = setTimeout(() => { room.classList.remove('is-moving'); resolve(); }, ms + 40);
  });

  /* --------------------------------------------------------- focus, inert */

  const setInert = () => {
    screens.forEach((sc, i) => {
      const live = state === 'in' && i === cur;
      sc.inert = !live;
      machines[i].classList.toggle('is-active', i === cur);
    });
  };

  const say = (t) => { const l = document.getElementById('srLive'); if (l) l.textContent = t; };
  let hintT = 0;
  const showHint = (html, ms) => {
    clearTimeout(hintT);
    hint.innerHTML = html;
    if (ms) hintT = setTimeout(() => { hint.innerHTML = ''; }, ms);
  };

  /* ------------------------------------------------------------- systems */

  const api = {
    go: (i) => go(i),
    next: () => go(cur + 1),
    prev: () => go(cur - 1),
    years: YEARS,
    get era() { return cur; },
    led(i, on) {
      const l = machines[i].querySelector('.drive .led');
      if (l) l.className = 'led' + (on === 'busy' ? ' is-busy' : on ? ' is-on' : '');
    },
    hint: showHint
  };
  SYS.forEach((sys, i) => sys && sys.build(screens[i], api, i));

  const powerOn = (i) => machines[i].classList.add('is-on');

  /* --------------------------------------------------------------- intro */

  const slotRect = () => machines[0].querySelector('.drive .slot').getBoundingClientRect();
  const driveEl = machines[0].querySelector('.drive');

  let started = false;
  const insert = async () => {
    if (state !== 'intro' || !started) return;
    state = 'inserting';
    showHint('');
    floppy.classList.remove('is-idle');
    floppy.disabled = true;
    const sr = slotRect();
    const s = cam.s;
    /* The slot's centre in track units. */
    const tx = (sr.left + sr.width / 2 - cam.x) / s;
    const ty = (sr.top + sr.height / 2 - cam.y) / s;
    const fw = floppy.offsetWidth;
    const from = { left: floppy.style.left, top: floppy.style.top };
    const to = { left: tx - fw / 2 + 'px', top: ty + 'px' };
    if (!reduced) {
      await floppy.animate([{ ...from, transform: 'none' }, { ...to, transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }).finished;
      floppy.style.left = to.left; floppy.style.top = to.top;
      await floppy.animate([{ transform: 'perspective(700px) rotateX(0)' }, { transform: 'perspective(700px) rotateX(-89deg)' }], { duration: 380, easing: 'cubic-bezier(.5,0,.8,.4)', fill: 'forwards' }).finished;
    }
    floppy.classList.add('is-gone');
    driveEl.classList.remove('is-glow');
    window.SFX.insert();
    api.led(0, 'busy');
    await startFirst();
  };

  const startFirst = async (fast) => {
    powerOn(0);
    const boot = window.TERM.boot(fast);
    await wait(fast ? 50 : 900);
    state = 'travel';
    await applyCam(full(0), fast ? 600 : 1500);
    state = 'in';
    room.classList.add('is-in');
    booted[0] = true;
    setInert();
    hud.hidden = false;
    markEra();
    await boot;
    api.led(0, false);
    SYS[0].enter();
    const want = YEARS.indexOf(location.hash.slice(1));
    if (want > 0) go(want);
    else showHint('Type a command or click one &middot; <kbd>scroll &darr;</kbd> to travel to 1991', 7000);
  };

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* Dragging the disk. Pointer movement is divided by the camera's scale,
     since the disk lives on the scaled desk. */
  let drag = null;
  floppy.addEventListener('pointerdown', (e) => {
    if (state !== 'intro' || !started) return;
    floppy.setPointerCapture(e.pointerId);
    floppy.classList.remove('is-idle');
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, l: parseFloat(floppy.style.left), t: parseFloat(floppy.style.top), moved: 0 };
  });
  floppy.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.moved = Math.max(drag.moved, Math.hypot(dx, dy));
    floppy.style.left = drag.l + dx / cam.s + 'px';
    floppy.style.top = drag.t + dy / cam.s + 'px';
    driveEl.classList.toggle('is-glow', nearSlot());
  });
  const nearSlot = () => {
    const f = floppy.getBoundingClientRect();
    const s = slotRect();
    return Math.abs(f.left + f.width / 2 - (s.left + s.width / 2)) < s.width * 0.6 && Math.abs(f.top - s.top) < f.height * 0.9;
  };
  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const moved = drag.moved;
    drag = null;
    if (moved < 6 || nearSlot()) { insert(); return; }
    driveEl.classList.remove('is-glow');
    floppy.animate([{ left: floppy.style.left, top: floppy.style.top }, { left: floppyRest.x + 'px', top: floppyRest.y + 'px' }], { duration: 420, easing: 'cubic-bezier(.3,1.4,.5,1)' });
    floppy.style.left = floppyRest.x + 'px';
    floppy.style.top = floppyRest.y + 'px';
    floppy.classList.add('is-idle');
    showHint('Almost. Drop it on the <b>drive slot</b>, under the screen &middot; or just click the disk');
  };
  floppy.addEventListener('pointerup', endDrag);
  floppy.addEventListener('pointercancel', endDrag);
  floppy.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); insert(); } });
  floppy.addEventListener('click', (e) => { if (e.detail === 0) insert(); });

  document.addEventListener('keydown', (e) => {
    if (state === 'intro' && (e.key === 'Enter') && document.activeElement !== floppy) { e.preventDefault(); insert(); }
  });

  /* -------------------------------------------------------------- travel */

  const go = async (i) => {
    if (i < 0 || i >= machines.length || i === cur || state !== 'in') return;
    const from = cur;
    state = 'travel';
    SYS[from].leave();
    setInert();
    showHint('');
    hideMeter();
    window.SFX.whoosh();
    room.classList.remove('is-in');
    say(`Travelling to ${YEARS[i]}, ${NAMES[i]}`);
    await applyCam(view(from), 950);
    cur = i;
    markEra();
    await applyCam(view(i), Math.abs(i - from) > 1 ? 1500 : 1100);
    const first = !booted[i];
    powerOn(i);
    let boot = null;
    if (first) boot = SYS[i].boot();
    await applyCam(full(i), 1200);
    room.classList.add('is-in');
    state = 'in';
    setInert();
    if (boot) await boot;
    booted[i] = true;
    SYS[i].enter();
    history.replaceState(null, '', '#' + YEARS[i]);
    lockUntil = performance.now() + 900;
    if (first) {
      const nxt = YEARS[i + 1];
      showHint(nxt ? `<kbd>scroll &darr;</kbd> past the end for ${nxt} &middot; <kbd>&uarr;</kbd> back to ${YEARS[i - 1]}` : `This is the end of the line &middot; <kbd>scroll &uarr;</kbd> to go back`, 6000);
    }
  };

  /* Scrolling past the end of what is under the pointer winds a dial; a
     full turn travels. Anything that can still scroll the same way gets the
     scroll instead, so reading a long window never time travels by accident. */
  let acc = 0, accT = 0, lockUntil = 0;
  const THRESH = 520;

  const canScroll = (el, dy) => {
    const top = screens[cur];
    for (let n = el; n && n !== top && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (!/(auto|scroll)/.test(cs.overflowY)) continue;
      if (n.scrollHeight <= n.clientHeight + 1) continue;
      if (dy > 0 && n.scrollTop + n.clientHeight < n.scrollHeight - 1) return true;
      if (dy < 0 && n.scrollTop > 0) return true;
    }
    return false;
  };

  const hideMeter = () => { acc = 0; meter.classList.remove('is-on'); };
  const showMeter = () => {
    const dir = acc > 0 ? 1 : -1;
    const target = cur + dir;
    const ok = target >= 0 && target < machines.length;
    smLabel.innerHTML = ok ? `${dir > 0 ? 'Keep scrolling' : 'Keep scrolling up'} to travel to <b>${YEARS[target]}</b>` : (dir > 0 ? 'The end of the timeline. Scroll up to go back.' : 'This is where it all starts.');
    const p = ok ? Math.min(1, Math.abs(acc) / THRESH) : 0;
    smFill.style.strokeDashoffset = String(94.25 * (1 - p));
    meter.classList.add('is-on');
    return ok && p >= 1 ? target : -1;
  };

  const feed = (dy, target) => {
    if (state !== 'in' || performance.now() < lockUntil) return false;
    if (target && canScroll(target, dy)) { hideMeter(); return false; }
    const now = performance.now();
    if (now - accT > 450 || Math.sign(dy) !== Math.sign(acc)) acc = 0;
    accT = now;
    acc += dy;
    const t = showMeter();
    clearTimeout(feed.t);
    feed.t = setTimeout(hideMeter, 900);
    if (t >= 0) { hideMeter(); go(t); }
    return true;
  };

  room.addEventListener('wheel', (e) => {
    if (state === 'intro' || state === 'inserting' || state === 'travel') { e.preventDefault(); return; }
    let dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? H : 1);
    if (Math.abs(e.deltaX) > Math.abs(dy)) return;
    if (feed(Math.max(-120, Math.min(120, dy)), e.target)) e.preventDefault();
  }, { passive: false });

  /* Touch screens on the desk (tablets) drag the same dial. */
  let ty0 = null;
  room.addEventListener('touchstart', (e) => { ty0 = e.touches.length === 1 ? e.touches[0].clientY : null; }, { passive: true });
  room.addEventListener('touchmove', (e) => {
    if (ty0 === null) return;
    const y = e.touches[0].clientY;
    const dy = (ty0 - y) * 1.6;
    ty0 = y;
    feed(dy, e.target);
  }, { passive: true });

  /* -------------------------------------------------------------- resize */

  let rz = 0;
  addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => {
      const nowPocket = matchMedia('(max-width: 760px), (max-height: 520px) and (pointer: coarse)').matches;
      if (nowPocket && document.documentElement.dataset.forced !== '1') { location.reload(); return; }
      setVars();
      layout();
      applyCam(state === 'in' ? full(cur) : view(cur), 0);
      SYS.forEach((s) => s && s.resize && s.resize());
    }, 120);
  });

  /* --------------------------------------------------------------- start */

  const start = () => {
    started = true;
    powerOn(0);
    layout();
    applyCam(view(0), 0);
    setInert();
    hud.hidden = false;
    floppy.style.left = floppyRest.x + 'px';
    floppy.style.top = floppyRest.y + 'px';
    showHint('Drag the disk into the drive &middot; or press <kbd>Enter</kbd>');
  };

  /* The desk is laid out under the loading screen, so it is already
     standing there when the lights come up. */
  const ready = window.READY || Promise.resolve();
  (document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, wait(1200)]) : Promise.resolve()).then(() => {
    powerOn(0);
    layout();
    applyCam(view(0), 0);
    return ready;
  }).then(start);
})();
