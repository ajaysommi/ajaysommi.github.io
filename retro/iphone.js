/* ==========================================================================
   iPhone 2G, one of the phones on the phone picker. The handset is a photograph (retro/dev/iphone-2g.webp, kept out
   of git) when it is present, with the live screen laid exactly over its display: in that
   photo the display is the 661 by 991 pixel box at (68, 262), a 2:3 box
   the 320 by 480 point screen fills at 2.0656 pixels a point. Without the
   photo, a drawn handset stands in.

   The software follows the first iPhone OS: lock screen and slide to
   unlock, a springboard laid out on the original grid (75 point columns,
   90 point rows) over a perforated dock, blue-grey bars, pinstripes. Every
   app is a part of the portfolio.
   ========================================================================== */
window.IPHONE = { start(room, exit) {

  const P = window.PORTFOLIO;
  const { esc } = window.RETRO;
  const I = window.ICONS;
  const SFX = window.SFX;
  const PHOTO = 'retro/dev/iphone-2g.webp';

  room.innerHTML = `
    <div class="ip-scale"><div class="ip">
      <button class="ip-btn ip-sleep" type="button" aria-label="Sleep/Wake"></button>
      <span class="ip-btn ip-ring" aria-hidden="true"></span>
      <button class="ip-btn ip-vol up" type="button" aria-label="Volume up"></button>
      <button class="ip-btn ip-vol dn" type="button" aria-label="Volume down"></button>
      <div class="ip-face">
        <span class="ip-ear" aria-hidden="true"></span>
        <div class="ip-screen" data-bar="trans" role="application" aria-label="Phone screen">
          <div class="ip-status"><span class="l"><span class="ip-sig"><i></i><i></i><i></i><i></i><i></i></span>SOMMI<svg class="ip-wifi" viewBox="0 0 15 11"><path d="M7.5 10.5 5.3 8.1a3.2 3.2 0 0 1 4.4 0zM3.6 6.4a5.6 5.6 0 0 1 7.8 0l1.4-1.5a7.7 7.7 0 0 0-10.6 0zM.8 3.4a9.7 9.7 0 0 1 13.4 0L15 2.5A11 11 0 0 0 0 2.5z" fill="currentColor"/></svg></span><span class="c"></span><span class="r"><span class="ip-bat"><i></i></span></span></div>
          <div class="ip-board is-flying"><div class="ip-grid"></div><div class="ip-dock"></div></div>
          <div class="ip-lock"><div class="top"><div class="time"></div><div class="date"></div></div><div class="bot"><div class="ip-slider"><div class="txt">slide to unlock</div><div class="ip-knob" role="slider" aria-label="Slide to unlock" tabindex="0"><svg viewBox="0 0 30 22"><path d="M3 8h13V3l11 8-11 8v-5H3z" fill="url(#ipArrow)" stroke="#7c7c7c" stroke-width=".8"/><defs><linearGradient id="ipArrow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b5b5b5"/><stop offset="1" stop-color="#7a7a7a"/></linearGradient></defs></svg></div></div></div></div>
          <div class="ip-boot">${I.mark(84, true)}</div>
          <div class="ip-off"></div>
        </div>
      </div>
      <button class="ip-home" type="button" aria-label="Home"><span class="ip-press" aria-hidden="true"></span></button>
    </div></div>
    <div class="ip-note">Slide to unlock \u00b7 the home button closes apps \u00b7 the top button sleeps</div>`;

  const scaleBox = room.querySelector('.ip-scale');
  const dev = room.querySelector('.ip');
  const scr = room.querySelector('.ip-screen');
  const statusC = room.querySelector('.ip-status .c');
  const board = room.querySelector('.ip-board');
  const grid = room.querySelector('.ip-grid');
  const dock = room.querySelector('.ip-dock');
  const lock = room.querySelector('.ip-lock');
  const knob = room.querySelector('.ip-knob');
  const slideTxt = room.querySelector('.ip-slider .txt');
  const off = room.querySelector('.ip-off');
  const boot = room.querySelector('.ip-boot');
  const homeBtn = room.querySelector('.ip-home');

  /* The photographed handset, when it is there. */
  const photo = new Image();
  photo.onload = () => { dev.classList.add('is-photo'); dev.style.setProperty('--photo', `url("${new URL(PHOTO, location.href).href}")`); fit(); };
  photo.src = PHOTO;

  const fit = () => {
    const w = dev.classList.contains('is-photo') ? 385 : 396;
    const h = dev.classList.contains('is-photo') ? 730 : 748;
    const s = Math.min(1.3, (innerHeight - 60) / h, (innerWidth - 30) / w);
    scaleBox.style.transform = `scale(${s})`;
  };
  fit();
  addEventListener('resize', fit);

  /* The home button sinks while it is held and comes back exactly as the
     photograph shows it when let go. */
  const press = (on) => homeBtn.classList.toggle('is-down', on);
  homeBtn.addEventListener('pointerdown', () => press(true));
  ['pointerup', 'pointerleave', 'pointercancel', 'blur'].forEach((ev) => homeBtn.addEventListener(ev, () => press(false)));
  homeBtn.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') press(true); });
  homeBtn.addEventListener('keyup', () => press(false));

  /* ---------------------------------------------------------------- clock */

  const now = () => new Date();
  const hm = (d, ampm = true) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(ampm ? /$/ : / ?[AP]M$/, '');
  const tickClock = () => {
    const d = now();
    lock.querySelector('.time').textContent = hm(d, false);
    lock.querySelector('.date').textContent = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    statusC.innerHTML = state === 'locked' ? '<svg class="ip-lockglyph" viewBox="0 0 9 11"><path d="M2 5V3.4a2.5 2.5 0 0 1 5 0V5" fill="none" stroke="currentColor" stroke-width="1.4"/><rect y="5" width="9" height="6" rx="1" fill="currentColor"/></svg>' : hm(d);
  };

  /* ---------------------------------------------------------------- icons */

  const lg = (id, stops, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
  const rg = (id, stops, cx = 0.5, cy = 0.5, r = 0.5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</radialGradient>`;
  const svg = (inner, defs = '') => `<svg viewBox="0 0 57 57" aria-hidden="true"><defs>${defs}</defs>${inner}</svg>`;
  const HN = 'font-family="Helvetica Neue,Helvetica,Arial,sans-serif"';

  const ICON = {
    experience: () => {
      const d = now();
      return svg(`<rect width="57" height="57" fill="url(#bg)"/><rect width="57" height="17" fill="url(#hd)"/><rect y="17" width="57" height="1" fill="#8d1010" opacity=".5"/>
        <text x="28.5" y="13" text-anchor="middle" ${HN} font-weight="bold" font-size="11" fill="#fff">${d.toLocaleDateString('en-US', { weekday: 'long' })}</text>
        <text x="28.5" y="50" text-anchor="middle" ${HN} font-weight="bold" font-size="33" fill="#1b1b1b" letter-spacing="-1">${d.getDate()}</text>`,
      lg('bg', [[0, '#ffffff'], [1, '#d7d7d7']]) + lg('hd', [[0, '#f37373'], [0.5, '#d42a2a'], [1, '#b11414']]));
    },
    projects: () => svg(`<rect width="57" height="57" fill="url(#wood)"/><rect x="5" y="6" width="47" height="36" rx="9" fill="#3a2410" opacity=".55"/><rect x="6" y="7" width="45" height="34" rx="8" fill="url(#scr)" stroke="#2a1806" stroke-width="1"/>
        <text x="28.5" y="30" text-anchor="middle" font-family="Menlo,Monaco,monospace" font-weight="bold" font-size="13" fill="#d9ffcf" opacity=".9">&lt;/&gt;</text>
        <circle cx="13" cy="49" r="3.4" fill="url(#knob)"/><circle cx="44" cy="49" r="3.4" fill="url(#knob)"/>${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${22 + i * 2.4}" y="46" width="1.2" height="6" fill="#3a2410" opacity=".6"/>`).join('')}`,
      lg('wood', [[0, '#d39a5c'], [0.5, '#a8682c'], [1, '#7a4517']]) + rg('scr', [[0, '#9fb08c'], [0.8, '#5c6c4f'], [1, '#3e4b35']], 0.5, 0.35, 0.7) + rg('knob', [[0, '#f2e6cf'], [1, '#6e5a3a']], 0.4, 0.35)),
    builds: () => {
      let pet = '';
      for (let i = 0; i < 16; i++) pet += `<ellipse cx="29" cy="15" rx="3.4" ry="9" fill="url(#pt)" transform="rotate(${i * 22.5} 29 25)"/>`;
      return svg(`<rect width="57" height="57" fill="url(#sky)"/><ellipse cx="12" cy="44" rx="16" ry="5" fill="#fff" opacity=".7"/><path d="M28 33q3 12 0 24h3q2-12-1-24z" fill="#3c8a20"/><path d="M30 46q9-9 16-5-7 7-16 7z" fill="#4fae2a"/>${pet}<circle cx="29" cy="25" r="7.5" fill="url(#ctr)"/>`,
        lg('sky', [[0, '#4aa2ff'], [0.6, '#9fd0ff'], [1, '#d9eeff']]) + lg('pt', [[0, '#ffe36b'], [1, '#f2a900']]) + rg('ctr', [[0, '#7a4a17'], [1, '#3a2006']]));
    },
    skills: () => {
      const gear = (cx, cy, r, n, fill) => { let s = ''; for (let i = 0; i < n; i++) s += `<rect x="${cx - 2.4}" y="${cy - r - 3.6}" width="4.8" height="7.2" rx="1" transform="rotate(${i * 360 / n} ${cx} ${cy})"/>`; return `<g fill="${fill}">${s}<circle cx="${cx}" cy="${cy}" r="${r}"/></g><circle cx="${cx}" cy="${cy}" r="${r * 0.62}" fill="url(#gin)"/><circle cx="${cx}" cy="${cy}" r="${r * 0.22}" fill="#3a3a3a"/>`; };
      return svg(`<rect width="57" height="57" fill="url(#bg)"/>${[...Array(9)].map((_, i) => `<circle cx="${6 + (i % 3) * 22}" cy="${6 + Math.floor(i / 3) * 22}" r="1.3" fill="#7d7d7d" opacity=".5"/>`).join('')}${gear(29, 30, 15, 16, 'url(#gm)')}`,
        lg('bg', [[0, '#e9e9e9'], [1, '#8f8f8f']]) + lg('gm', [[0, '#9a9a9a'], [1, '#4a4a4a']]) + rg('gin', [[0, '#d9d9d9'], [1, '#7a7a7a']]));
    },
    education: () => svg(`<rect width="57" height="57" fill="url(#sky)"/><path d="M28.5 13 50 22 28.5 31 7 22z" fill="#1d1d1d"/><path d="M15 25v9c0 3 6 6 13.5 6S42 37 42 34v-9l-13.5 6z" fill="#2b2b2b"/><path d="M46 23v11" stroke="#f2c230" stroke-width="1.6"/><circle cx="46" cy="35" r="2.2" fill="#f2c230"/>
        <text x="42" y="52" text-anchor="middle" ${HN} font-weight="bold" font-size="11" fill="#fff">UF</text>`,
    lg('sky', [[0, '#2f8bff'], [0.55, '#53a6ff'], [1, '#9ad0ff']])),
    impact: () => svg(`<rect width="57" height="57" fill="url(#bg)"/>${[12, 26, 40].map((x) => `<line x1="${x}" y1="6" x2="${x}" y2="46" stroke="#fff" stroke-opacity=".25"/>`).join('')}<path d="M3 36 8 30l5 4 5-10 5 7 5-13 6 9 5-6 5 4 5-11 3 2" fill="none" stroke="#fff" stroke-width="2"/>
        <rect y="46" width="57" height="11" fill="#0c3f8a" opacity=".55"/><text x="4" y="54" ${HN} font-size="6.5" fill="#fff">2019</text><text x="53" y="54" text-anchor="end" ${HN} font-size="6.5" fill="#fff">2026</text>`,
    lg('bg', [[0, '#5aa8ff'], [0.55, '#2a7ff0'], [1, '#1758c9']])),
    places: () => svg(`<rect width="57" height="57" fill="#ece5d2"/><path d="M0 0h20v18H0z" fill="#d9e8c4"/><path d="M36 38h21v19H36z" fill="#d9e8c4"/><path d="M-2 22 59 26" stroke="#fff" stroke-width="7"/><path d="M-2 22 59 26" stroke="#f6c845" stroke-width="4"/><path d="M22 -2 26 59" stroke="#fff" stroke-width="5"/><path d="M8 40q16 2 22 18" stroke="#fff" stroke-width="3" fill="none"/>
        <path d="M34 4h17v8q0 5-8.5 8Q34 17 34 12z" fill="#2257c9" stroke="#fff" stroke-width="1.2"/><path d="M34 4h17v3H34z" fill="#d62b2b"/><text x="42.5" y="15" text-anchor="middle" ${HN} font-weight="bold" font-size="7" fill="#fff">280</text>
        <circle cx="20" cy="31" r="4.6" fill="url(#pin)"/><path d="M19.3 35h1.4v9h-1.4z" fill="#8a8a8a"/>`,
    rg('pin', [[0, '#ff8f8f'], [0.6, '#d61010'], [1, '#900']], 0.35, 0.35)),
    guestbook: () => svg(`<rect width="57" height="57" fill="url(#bg)"/><ellipse cx="28.5" cy="26" rx="20" ry="15" fill="#fff"/><path d="M15 36q-1 7-8 10 11 0 15-7z" fill="#fff"/>
        <text x="28.5" y="31.5" text-anchor="middle" ${HN} font-weight="bold" font-size="15" fill="#2ea51a">★★★</text>`,
    lg('bg', [[0, '#8fe85e'], [0.5, '#3dbb26'], [1, '#1d9a12']])),
    about: () => svg(`<rect width="57" height="57" fill="url(#pad)"/>${[24, 31, 38, 45, 52].map((y) => `<line x1="0" y1="${y}" x2="57" y2="${y}" stroke="#d3b95a" stroke-width=".8"/>`).join('')}<line x1="9" y1="15" x2="9" y2="57" stroke="#e6a0a0" stroke-width=".8"/>
        <rect width="57" height="15" fill="url(#lth)"/><rect y="14" width="57" height="1.5" fill="#3a230b"/>${[...Array(14)].map((_, i) => `<rect x="${2 + i * 4}" y="2" width="2" height="1" fill="#e9cfa6" opacity=".55"/>`).join('')}`,
    lg('pad', [[0, '#fff7b0'], [1, '#f4dc6a']]) + lg('lth', [[0, '#9a6a3c'], [0.5, '#6b4219'], [1, '#4d2c0c']])),
    github: () => svg(`<rect width="57" height="57" fill="url(#bg)"/><text x="28.5" y="36" text-anchor="middle" font-family="Menlo,Monaco,monospace" font-weight="bold" font-size="22" fill="#fff">{ }</text>`,
      lg('bg', [[0, '#5b5f66'], [1, '#1e2126']])),
    linkedin: () => svg(`<rect width="57" height="57" fill="url(#bg)"/><text x="28.5" y="40" text-anchor="middle" ${HN} font-weight="bold" font-size="30" fill="#fff" letter-spacing="-1">in</text>`,
      lg('bg', [[0, '#5aa4e6'], [0.5, '#1f78c9'], [1, '#0d5ba6']])),
    contact: () => svg(`<rect width="57" height="57" fill="url(#bg)"/><path d="M16.5 10.5c2.6-1.9 5.4-.5 6.4 2.4l1.8 5c.9 2.6-.6 3.9-2.5 5 1.2 4.6 4.7 8.9 9.2 10.8 1.2-1.8 3-3.3 5.6-2.4l5.2 2.2c2.8 1.2 3.8 3.9 1.9 6.5-2.2 3.4-6.8 5.2-11.2 3.7C22 40.5 13.8 32 11 22.4c-1.3-4.6.7-9.4 5.5-11.9z" fill="#fff"/>`,
      lg('bg', [[0, '#8fe85e'], [0.5, '#3dbb26'], [1, '#1d9a12']])),
    email: () => svg(`<rect width="57" height="57" fill="url(#sky)"/><ellipse cx="13" cy="50" rx="15" ry="5" fill="#fff" opacity=".85"/><ellipse cx="44" cy="52" rx="16" ry="5" fill="#fff" opacity=".7"/>
        <rect x="8" y="15" width="41" height="27" rx="1.5" fill="url(#env)" stroke="#a6b4c8" stroke-width=".8"/><path d="M8.5 16 28.5 31 48.5 16" fill="none" stroke="#9aa9bf" stroke-width="1.4"/><path d="M8.5 41.5 23 27M48.5 41.5 34 27" stroke="#c4cfdc" stroke-width="1"/>`,
    lg('sky', [[0, '#3a8dff'], [0.6, '#7ab9ff'], [1, '#c6e2ff']]) + lg('env', [[0, '#ffffff'], [1, '#e2e8f0']])),
    resume: () => svg(`<rect width="57" height="57" fill="url(#bg)"/><path d="M12 6h25l9 9v37H12z" fill="#fff" stroke="#b9b9b9"/><path d="M37 6v9h9" fill="#e9e9e9" stroke="#b9b9b9"/><rect x="16" y="12" width="17" height="5" fill="#ff6b35"/>
        ${[22, 27, 32, 37, 42, 47].map((y, i) => `<rect x="16" y="${y}" width="${i % 3 === 2 ? 18 : 26}" height="2" fill="#9a9a9a"/>`).join('')}`,
    lg('bg', [[0, '#d8dce2'], [1, '#8e959f']])),
    web: () => {
      let t = '';
      for (let i = 0; i < 48; i++) t += `<line x1="28.5" y1="8.5" x2="28.5" y2="${i % 4 ? 10.5 : 12.5}" stroke="#fff" stroke-width=".7" transform="rotate(${i * 7.5} 28.5 28.5)"/>`;
      return svg(`<rect width="57" height="57" fill="url(#bg)"/><circle cx="28.5" cy="28.5" r="21" fill="url(#dial)" stroke="#fff" stroke-width="1.6"/>${t}
          <text x="28.5" y="17.5" text-anchor="middle" ${HN} font-weight="bold" font-size="5" fill="#fff">N</text><path d="M28.5 28.5 41 15l-9.6 16z" fill="#e8302a"/><path d="M28.5 28.5 16 42l9.6-16z" fill="#fff"/><circle cx="28.5" cy="28.5" r="1.5" fill="#999"/>`,
      lg('bg', [[0, '#f2f6fb'], [1, '#a9bcd2']]) + rg('dial', [[0, '#9ad6ff'], [0.7, '#2f8de0'], [1, '#1460b8']], 0.45, 0.4, 0.6));
    }
  };

  /* --------------------------------------------------------------- shell */

  let state = 'boot';
  let current = null;

  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const setBar = (b) => { scr.dataset.bar = b; };

  /* An app: a nav bar over a stack of pages that slide, as in the
     original UINavigationController. */
  const makeApp = (def, from) => {
    const el = h('div', 'ip-app');
    const r = from ? from.getBoundingClientRect() : null;
    const s = scr.getBoundingClientRect();
    if (r) {
      const k = s.width / 320;
      el.style.setProperty('--ox', ((r.left + r.width / 2 - s.left) / k) + 'px');
      el.style.setProperty('--oy', ((r.top + r.height / 2 - s.top) / k) + 'px');
    }
    scr.appendChild(el);
    const app = { el, stack: [], def };
    if (def.bare) { setBar(def.bar || 'black'); def.open(app); return app; }
    const nb = h('div', 'nb' + (def.nb ? ' ' + def.nb : ''), '<span class="t"></span>');
    const vw = h('div', 'vw');
    el.append(nb, vw);
    app.nb = nb; app.vw = vw;
    setBar(def.bar || 'gray');
    app.push = (title, fill, opts = {}) => {
      const pg = h('div', 'pg');
      const prev = app.stack[app.stack.length - 1];
      fill(pg, app);
      vw.appendChild(pg);
      app.stack.push({ title, pg, opts });
      if (prev && !opts.instant) { prev.pg.classList.add('out-l'); pg.classList.add('in-r'); setTimeout(() => { prev.pg.style.visibility = 'hidden'; prev.pg.classList.remove('out-l'); }, 300); }
      else if (prev) prev.pg.style.visibility = 'hidden';
      drawBar();
      return pg;
    };
    app.pop = () => {
      if (app.stack.length < 2) return;
      const top = app.stack.pop();
      const prev = app.stack[app.stack.length - 1];
      prev.pg.style.visibility = '';
      prev.pg.classList.add('in-l');
      top.pg.classList.add('out-r');
      setTimeout(() => { top.pg.remove(); prev.pg.classList.remove('in-l'); }, 300);
      drawBar();
      SFX.click();
    };
    const drawBar = () => {
      const top = app.stack[app.stack.length - 1];
      nb.querySelectorAll('.nbb').forEach((b) => b.remove());
      nb.querySelector('.t').textContent = top.title;
      if (app.stack.length > 1) {
        const b = h('button', 'nbb l', `<span>${esc(app.stack[app.stack.length - 2].title)}</span>`);
        b.type = 'button';
        b.addEventListener('click', app.pop);
        nb.appendChild(b);
      }
      if (top.opts.right) {
        const b = h('button', 'nbb r' + (top.opts.blue ? ' blue' : ''), esc(top.opts.right[0]));
        b.type = 'button';
        b.addEventListener('click', top.opts.right[1]);
        nb.appendChild(b);
      }
      /* The title stays centred and gives way to the buttons, truncating
         rather than running underneath them. */
      const side = Math.max(0, ...[...nb.querySelectorAll('.nbb')].map((b) => b.offsetWidth + (b.classList.contains('l') ? 26 : 12)));
      nb.querySelector('.t').style.maxWidth = (320 - side * 2 - 8) + 'px';
    };
    def.open(app);
    return app;
  };

  let quietUntil = 0;
  const openApp = (id, from) => {
    if (current || state !== 'home' || performance.now() < quietUntil) return;
    SFX.click();
    if (APPS[id].link) { ext(APPS[id].link); return; }
    current = makeApp(APPS[id], from);
    state = 'app';
  };
  const closeApp = () => {
    if (!current) return;
    const a = current;
    current = null;
    a.def.onClose && a.def.onClose();
    a.el.classList.add('is-closing');
    setTimeout(() => a.el.remove(), 320);
    setBar('black');
    state = 'home';
    tickClock();
  };

  /* A plain, tappable list. */
  const plain = (pg, rows) => {
    const ul = h('ul', 'pl');
    rows.forEach((r) => {
      if (r.header) { ul.appendChild(h('li', 'sh', esc(r.header))); return; }
      const li = h('li', (r.go ? 'chev ' : '') + (r.sub ? 'two' : ''), `${r.img ? `<img src="${r.img}" alt="" />` : ''}${r.lead || ''}<span class="tx">${esc(r.text)}${r.sub ? `<span class="sub">${esc(r.sub)}</span>` : ''}</span>${r.rt ? `<span class="rt">${esc(r.rt)}</span>` : ''}`);
      if (r.go) li.addEventListener('click', () => { SFX.click(); r.go(); });
      ul.appendChild(li);
    });
    pg.appendChild(ul);
    return ul;
  };
  /* Grouped rows, label on the left in grey (as in Contacts). */
  const group = (rows) => `<div class="gp">${rows.map(([k, v, n]) => `<div class="row">${k ? `<span class="k">${esc(k)}</span>` : ''}<span class="v${n ? ' n' : ''}">${v}</span></div>`).join('')}</div>`;
  /* Grouped rows, bold label left and value right (as in Settings). */
  const kv = (rows) => `<div class="gp">${rows.map(([k, v]) => `<div class="row"><span class="v">${esc(k)}</span><span class="rv">${esc(v)}</span></div>`).join('')}</div>`;
  const ext = (url) => window.open(url, '_blank', 'noopener');

  /* Safari, of the time: the address on top, the toolbar below. */
  const safari = (app, url, label) => {
    app.el.innerHTML = `<div class="saf-top"><span>${esc(label)}</span><a href="${url}" target="_blank" rel="noopener">Open</a></div><iframe class="saf-frame" src="${url}" title="${esc(label)}"></iframe><div class="saf-bot"><span>◀</span><span style="opacity:.4">▶</span><span>+</span><span>☰</span><span>⧉</span></div>`;
  };

  /* ----------------------------------------------------------------- apps */

  const roleDetail = (e) => (pg) => {
    pg.innerHTML = `<div class="pin">${group([['', `${esc(e.role)}<br/><span style="font-weight:normal;color:#4c566c">${esc(e.org)}</span>`]])}
      ${group([['starts', esc(e.when.split(' to ')[0]), 1], ['ends', esc(e.when.split(' to ')[1] || ''), 1], ['location', esc(e.where), 1]])}
      <div class="gl">Notes</div><div class="gp"><div class="txt">${esc(e.text)}</div></div>
      ${e.stats.length ? `<div class="gl">Results</div>${group(e.stats.map(([a, b]) => [a, esc(b), 1]))}` : ''}
      <div class="gl">Tools</div><div class="gp"><div class="txt">${e.tags.map(esc).join(' · ')}</div></div>
      ${e.photos.length ? `<div class="gp"><div class="thumbs">${e.photos.map((p) => `<img src="${p}" alt="" />`).join('')}</div></div>` : ''}</div>`;
  };

  const NOTES = [
    ['About me', `${P.about[0]}\n\n${P.about[1]}`],
    ['Off the clock', `“${P.quote}”\n\nRepairs, teardowns and builds: see Builds.`],
    ['To do', `Graduate from UF (Dec 2026)\nFind a great team\nSay hi: ${P.email}`]
  ];

  const APPS = {
    experience: { name: 'Experience', open(app) {
      const rows = [];
      [...P.experience].reverse().forEach((e, i, arr) => {
        if (i === 0 || arr[i - 1].year !== e.year) rows.push({ header: String(e.year) });
        rows.push({ text: e.short, sub: e.role, rt: e.when.split(' ')[0], go: () => app.push(e.short, roleDetail(e)) });
      });
      app.push('Experience', (pg) => plain(pg, rows));
    } },
    projects: { name: 'Projects', open(app) {
      app.push('Projects', (pg) => plain(pg, P.projects.map((p) => ({ text: p.name, sub: p.stack, go: () => app.push(p.name, (x) => {
        x.innerHTML = `<div class="pin">${group([['', `${esc(p.full)}<br/><span style="font-weight:normal;color:#4c566c">${esc(p.kind)}</span>`]])}<div class="gp"><div class="txt">${esc(p.text)}</div></div>${group([['stack', esc(p.stack), 1]])}${p.url ? '<button class="gbtn" type="button" data-go>View on GitHub</button>' : '<div class="gl" style="text-align:center">Source is private for now</div>'}</div>`;
        const b = x.querySelector('[data-go]');
        if (b) b.addEventListener('click', () => ext(p.url));
      }) }))));
    } },
    builds: { name: 'Builds', open(app) {
      app.push('Off the Clock', (pg) => plain(pg, P.offclock.map((s) => ({ text: `${s.name} (${s.steps.length})`, img: s.cover, go: () => app.push(s.name, (p) => {
        p.innerHTML = `<div style="padding:8px 10px;font:13px/1.4 'Helvetica Neue',Arial;color:#555">${esc(s.lede)}</div><div class="grid4">${s.steps.map((st, k) => `<img src="${st[0]}" data-k="${k}" alt="${esc(st[1])}" />`).join('')}</div>`;
        p.addEventListener('click', (ev) => { const im = ev.target.closest('img[data-k]'); if (im) viewer(app, s, +im.dataset.k); });
      }) }))));
    } },
    skills: { name: 'Skills', open(app) {
      app.push('Skills', (pg) => {
        pg.innerHTML = `<div class="pin">${P.skills.map(([gname, list], i) => `<div class="gp"><div class="row chev" data-s="${i}"><span class="v">${esc(gname)}</span><span class="rv">${list.length}</span></div></div>`).join('')}<div class="gp"><div class="row chev" data-k="about"><span class="v">About This Portfolio</span></div><div class="row chev" data-k="switch"><span class="v">Switch Phone\u2026</span></div></div></div>`;
        pg.addEventListener('click', (ev) => {
          const r = ev.target.closest('.row');
          if (!r) return;
          SFX.click();
          if (r.dataset.k === 'switch') { exit(); return; }
          if (r.dataset.k) {
            const photos = P.experience.reduce((a, e) => a + e.photos.length, 0) + P.offclock.reduce((a, s) => a + s.steps.length, 0);
            app.push('About', (p) => { p.innerHTML = `<div class="pin">${kv([['Name', 'Ajay Sommi'], ['Roles', String(P.experience.length)], ['Projects', String(P.projects.length)], ['Photos', String(photos)], ['Skills', String(P.skills.reduce((a, s) => a + s[1].length, 0))], ['Capacity', '1 portfolio'], ['Available', 'Dec 2026'], ['Version', '1.0 (26A543a)'], ['Model', 'AJ-26']])}</div>`; });
          } else {
            const [gname, list] = P.skills[+r.dataset.s];
            app.push(gname, (p) => { p.innerHTML = `<div class="pin">${group(list.map((s) => { const at = window.RETRO.usedAt(s); return ['', `${esc(s)}${at.length ? `<br/><span style="font-weight:normal;font-size:13px;color:#385487">${esc(at.join(', '))}</span>` : ''}`]; }))}</div>`; });
          }
        });
      });
    } },
    education: { name: 'Education', bare: true, bar: 'black', open(app) {
      const e = P.education;
      app.el.style.background = '#111';
      app.el.innerHTML = `<div class="wx"><div class="wx-card"><div class="hd"><div class="city">Gainesville</div><div class="hi">${esc(e.school)}<br/>Class of ${esc(e.when)}</div><div class="tmp">26°</div></div>
        <ul>${[['Mon', 'Operating Systems', '☀'], ['Tue', 'Databases', '⛅'], ['Wed', 'Algorithms', '☀'], ['Thu', 'Software Engineering', '☁'], ['Fri', 'Artificial Intelligence', '☀'], ['Sat', 'Cybersecurity', '⚡']].map(([d, c, i]) => `<li><span>${d}</span><span>${i} ${esc(c)}</span></li>`).join('')}</ul></div>
        <div class="wx-foot">${esc(e.degree)} · ${esc(e.college)}<br/>Forecast: AI Certificate, 100% chance.</div></div>`;
    } },
    impact: { name: 'Impact', bar: 'black', nb: 'black', open(app) {
      const T = [
        ['CLAIMS', '-20%', 'dn', 'toyota', 'Tire warranty claims cut by catching costly recalls early.'],
        ['SAVED', '+$150K', 'up', 'toyota', 'Saved on prevented tire package recalls.'],
        ['ENTRY', '5×', 'up', 'toyota', 'Data entry made five times faster with a live dashboard.'],
        ['HOURS', '+350/yr', 'up', 'toyota', 'Hours a year saved by automating a file transfer.'],
        ['UNITS', '100K+', 'up', 'hunter', 'Alignment machines that can now be reset remotely, worldwide.'],
        ['EVENTS', '100K+', 'up', 'jm', 'Dealership events analysed by a service built at JM Family.'],
        ['SEARCH', '+20%', 'up', 'shiva', 'Search visits grown in one summer.']
      ];
      app.push('Impact', (pg) => {
        pg.innerHTML = `<div class="stk">${T.map(([s, v, c], i) => `<div class="row${i === 0 ? ' on' : ''}" data-i="${i}"><span class="s">${s}</span><span class="c ${c}">${v}</span></div>`).join('')}<div class="panel"></div></div>`;
        pg.style.background = '#000';
        const panel = pg.querySelector('.panel');
        const show = (i) => {
          const [s, v, dir, rid, d] = T[i];
          const e = P.experience.find((x) => x.id === rid);
          let pts = '', y = 40;
          for (let k = 0; k <= 12; k++) { y = Math.max(6, Math.min(54, y + (Math.sin(k * 1.7 + i) * 9) - (dir === 'up' ? 3 : -3))); pts += `${k * 25},${y} `; }
          panel.innerHTML = `<b>${s} ${v}</b>${esc(d)}<svg viewBox="0 0 300 60" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="${dir === 'up' ? '#7be05a' : '#ff6b6b'}" stroke-width="2"/></svg><span style="color:#aaa">${esc(e.org)} · ${e.year}</span>`;
          pg.querySelectorAll('.row').forEach((r, k) => r.classList.toggle('on', k === i));
        };
        pg.addEventListener('click', (ev) => { const r = ev.target.closest('.row'); if (r) { SFX.click(); show(+r.dataset.i); } });
        show(0);
      });
    } },
    places: { name: 'Places', bare: true, bar: 'gray', open(app) {
      const US = [[-124.7, 48.4], [-124, 42], [-122.4, 37.8], [-120.6, 34.6], [-117.1, 32.5], [-114.7, 32.7], [-111, 31.3], [-106.5, 31.8], [-103, 29], [-99.5, 26.4], [-97.2, 25.9], [-97.4, 27.8], [-94.7, 29.4], [-90, 29.2], [-89, 30.2], [-85, 29.7], [-83, 29], [-82.5, 27.5], [-81.7, 25.2], [-80.4, 25.2], [-80, 26.8], [-81.2, 30.3], [-79, 33.6], [-75.5, 35.3], [-76, 37], [-74, 40.5], [-70, 41.6], [-70.5, 43], [-67, 44.8], [-67.8, 47.1], [-69.2, 47.4], [-71.5, 45], [-75, 45], [-79, 43.3], [-83, 42], [-82.5, 45.3], [-84.6, 46.5], [-88, 48], [-95, 49], [-123, 49]];
      const X = (lon) => (lon + 126) / 60 * 320, Y = (lat) => (50 - lat) / 26 * 177 * 1.25;
      const CITIES = [['Jacksonville, FL', 30.33, -81.66, 'rjax'], ['Palo Alto, CA', 37.44, -122.14, 'rfa'], ['Gainesville, FL', 29.65, -82.32, 'fics'], ['Deerfield Beach, FL', 26.32, -80.1, 'jm'], ['St. Louis, MO', 38.63, -90.2, 'hunter'], ['Boca Raton, FL', 26.0, -80.13, 'adt']];
      app.el.innerHTML = `<div class="map" style="top:20px"><div class="map-bar"><span>Places I’ve worked</span></div><svg viewBox="0 0 320 240" height="240"><path d="M${US.map(([a, b]) => `${X(a).toFixed(1)} ${Y(b).toFixed(1)}`).join('L')}Z" fill="#f2efe9" stroke="#c9c0ad"/><path d="M${X(-120)} ${Y(47)}L${X(-90)} ${Y(41)}L${X(-80)} ${Y(35)}M${X(-117)} ${Y(33)}L${X(-97)} ${Y(32)}L${X(-82)} ${Y(30)}" stroke="#f3c64c" stroke-width="1.6" fill="none"/></svg>${CITIES.map(([n, la, lo], i) => `<button class="pin-d" type="button" data-i="${i}" style="left:${X(lo)}px;top:${30 + Y(la)}px;animation-delay:${i * 0.12}s" aria-label="${esc(n)}"></button>`).join('')}<div class="tbar" style="background:linear-gradient(180deg,#b0bccd,#6d84a2)"><button type="button" data-list style="font-size:13px;width:auto">List</button></div></div>`;
      const map = app.el.querySelector('.map');
      map.addEventListener('click', (ev) => {
        const p = ev.target.closest('.pin-d');
        map.querySelectorAll('.callout').forEach((c) => c.remove());
        if (p) {
          const [n, , , id] = CITIES[+p.dataset.i];
          const e = P.experience.find((x) => x.id === id);
          const c = h('div', 'callout', `${esc(e.short)}<span>${esc(n)} · ${e.year}</span>`);
          c.style.left = p.style.left; c.style.top = p.style.top;
          map.appendChild(c);
          SFX.click();
        }
        if (ev.target.closest('[data-list]')) {
          const l = h('div', 'pg');
          l.style.top = '30px'; l.style.bottom = '44px'; l.style.zIndex = 3;
          plain(l, CITIES.map(([n, , , id]) => { const e = P.experience.find((x) => x.id === id); return { text: e.short, sub: n, rt: String(e.year), go: () => l.remove() }; }));
          map.appendChild(l);
        }
      });
    } },
    guestbook: { name: 'Guestbook', open(app) {
      app.push('Guestbook', (pg) => plain(pg, P.recs.map(([n, c, q]) => ({ text: n, sub: q, rt: c.split(' ')[0], go: () => app.push(n.split(' ')[0], (p) => {
        p.innerHTML = `<div class="sms"><div class="day">${esc(c)}</div><div class="bub in">${esc(q)}</div><div class="bub out">Thank you, ${esc(n.split(' ')[0])}! That means a lot.</div></div><div class="sms-bar"><span></span><b>Send</b></div>`;
        p.style.background = '#dbe2ed';
      }) }))));
    } },
    about: { name: 'About', nb: 'notes', open(app) {
      const note = ([, b]) => (p) => { p.innerHTML = `<div class="note"><div class="d">${new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>${esc(b).replace(/\n/g, '<br/>')}</div>`; };
      app.push(`Notes (${NOTES.length})`, (pg) => {
        const ul = plain(pg, NOTES.map((n) => ({ text: n[0], rt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), go: () => app.push(n[0], note(n)) })));
        ul.classList.add('note-list');
        pg.style.background = '#fff8b8';
      });
      app.push(NOTES[0][0], note(NOTES[0]), { instant: true });
    } },
    github: { name: 'GitHub', link: P.github },
    linkedin: { name: 'LinkedIn', link: P.linkedin },
    contact: { name: 'Contact', open(app) {
      app.push('Info', (pg) => {
        pg.innerHTML = `<div class="pin"><div style="display:flex;gap:12px;align-items:center;margin:0 12px 14px"><img src="${P.photo}" alt="" style="width:64px;height:64px;border-radius:6px;border:1px solid #888;object-fit:cover"/><div style="font:bold 20px 'Helvetica Neue',Arial">Ajay Sommi<div style="font:14px 'Helvetica Neue',Arial;color:#4c566c">${esc(P.title)}</div></div></div>
          <div class="gp"><div class="row chev" data-u="mailto:${P.email}"><span class="k">email</span><span class="v n">${esc(P.email)}</span></div></div>
          <div class="gp"><div class="row chev" data-u="${P.github}"><span class="k">home page</span><span class="v n">github.com/ajaysommi</span></div><div class="row chev" data-u="${P.linkedin}"><span class="k">work</span><span class="v n">linkedin.com/in/ajay-sommi</span></div></div>
          <div class="gp"><div class="row chev" data-u="${P.resume}"><span class="k">resume</span><span class="v n">Ajay_Sommi_Resume.pdf</span></div></div>
          <button class="gbtn" type="button" data-u="mailto:${P.email}">Send Email</button></div>`;
        pg.addEventListener('click', (ev) => { const r = ev.target.closest('[data-u]'); if (r) { const u = r.dataset.u; if (u.startsWith('mailto')) location.href = u; else ext(u); } });
      });
    } },
    email: { name: 'Email', open(app) {
      const M = [
        ['Ajay Sommi', 'Let’s talk', `Hi there,\n\nThanks for stopping by. I’m a software engineer graduating from UF in December 2026, and I’m looking for a team that cares about the people using what it builds.\n\nReply to this and it goes straight to me.\n\nAjay`],
        ['GitHub', 'Your repositories', `SommiScript, GatorGoods, BalanceTree and more are at github.com/ajaysommi.`],
        ['LinkedIn', 'Recommendations', `${P.recs.length} people have written recommendations for Ajay. Read them in Guestbook.`]
      ];
      app.push('Inbox (1)', (pg) => plain(pg, M.map(([f, s, b], i) => ({ text: f, sub: `${s} — ${b.replace(/\n/g, ' ')}`, rt: i ? 'Oct 2026' : hm(now()), go: () => app.push(s, (p) => {
        p.innerHTML = `<div style="border-bottom:1px solid #ccc;padding:8px 10px;font:14px 'Helvetica Neue',Arial;color:#7a7a7a">From: <b style="color:#000">${esc(f)}</b><br/>Subject: <b style="color:#000">${esc(s)}</b></div><div style="padding:12px 12px 30px;font:15px/1.45 'Helvetica Neue',Arial">${esc(b).replace(/\n/g, '<br/>')}</div>`;
      }, { right: ['Reply', () => { location.href = 'mailto:' + P.email + '?subject=' + encodeURIComponent('Re: ' + s); }], blue: true }) }))));
    } },
    resume: { name: 'Resume', bare: true, bar: 'gray', open(app) { safari(app, P.resume + '#view=FitH', 'ajaysommi.github.io/' + P.resume); } },
    web: { name: 'Portfolio', bare: true, bar: 'gray', open(app) { safari(app, 'classic.html', 'ajaysommi.github.io'); } }
  };

  const viewer = (app, s, k) => {
    const v = h('div', 'photo-view');
    const draw = () => { v.innerHTML = `<img src="${s.steps[k][0].replace('-480', '-960')}" alt="${esc(s.steps[k][1])}" /><div class="cap"><b>${esc(s.steps[k][1])}</b>${esc(s.steps[k][2])}</div><div class="tbar"><button type="button" data-d="-1">◀</button><button type="button" data-x style="font-size:13px">Done</button><button type="button" data-d="1">▶</button></div>`; };
    draw();
    v.addEventListener('click', (ev) => {
      const b = ev.target.closest('button');
      if (!b) return;
      if (b.hasAttribute('data-x')) { v.remove(); setBar('gray'); return; }
      k = (k + +b.dataset.d + s.steps.length) % s.steps.length;
      draw();
    });
    let x0 = null;
    v.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    v.addEventListener('pointerup', (e) => { if (x0 !== null && Math.abs(e.clientX - x0) > 40) { k = (k + (e.clientX < x0 ? 1 : -1) + s.steps.length) % s.steps.length; draw(); } x0 = null; });
    app.el.appendChild(v);
    setBar('black');
  };

  /* ----------------------------------------------------------- springboard */

  /* The original grid: icons 57 points square, columns 75 apart starting
     19 in, rows 90 apart starting 19 under the status bar. */
  const GRID = ['experience', 'projects', 'builds', 'skills', 'education', 'impact', 'places', 'guestbook', 'about', 'github', 'linkedin'];
  const DOCK = ['contact', 'email', 'resume', 'web'];
  const iconBtn = (id) => {
    /* Each icon's gradients get ids of their own; shared ids would let the
       first icon's colours paint every other icon. */
    const art = ICON[id]().replace(/id="(\w+)"/g, `id="ic-${id}-$1"`).replace(/url\(#(\w+)\)/g, `url(#ic-${id}-$1)`);
    const b = h('button', 'ip-icon', `<span class="ic">${art}</span><span class="lbl">${esc(APPS[id].name)}</span>`);
    b.type = 'button';
    b.setAttribute('aria-label', APPS[id].name);
    b.addEventListener('click', () => openApp(id, b));
    return b;
  };
  const drawBoard = () => {
    grid.innerHTML = '';
    dock.innerHTML = '';
    GRID.forEach((id, i) => {
      const b = iconBtn(id);
      const c = i % 4, r = Math.floor(i / 4);
      b.style.left = 19.4 - 8.5 + c * 75 + 'px';
      b.style.top = 19.2 + r * 90.4 + 'px';
      /* Before unlocking, each icon waits off toward its nearest edge. */
      b.style.transform = `translate(${(c - 1.5) * 90}px, ${(r - 1) * 140}px) scale(.6)`;
      grid.appendChild(b);
    });
    DOCK.forEach((id, i) => {
      const b = iconBtn(id);
      b.style.left = 19.4 - 8.5 + i * 75 + 'px';
      b.style.top = '10.6px';
      b.style.transform = 'translateY(90px)';
      dock.appendChild(b);
    });
  };
  const flyIn = () => {
    board.classList.remove('is-flying');
    requestAnimationFrame(() => room.querySelectorAll('.ip-icon').forEach((b, i) => { b.style.transitionDelay = (i % 4) * 25 + 'ms'; b.style.transform = ''; }));
  };
  const flyOut = () => {
    board.classList.add('is-flying');
    drawBoard();
  };

  /* ------------------------------------------------------------- unlocking */

  let drag = null;
  const MAXX = 280 - 72 - 8;
  knob.addEventListener('pointerdown', (e) => {
    if (state !== 'locked') return;
    knob.setPointerCapture(e.pointerId);
    knob.classList.remove('is-back');
    drag = { x: e.clientX, k: scr.getBoundingClientRect().width / 320 };
  });
  knob.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const x = Math.max(0, Math.min(MAXX, (e.clientX - drag.x) / drag.k));
    knob.style.transform = `translateX(${x}px)`;
    slideTxt.style.opacity = String(Math.max(0, 1 - x / 90));
  });
  const release = (e) => {
    if (!drag) return;
    const x = Math.max(0, Math.min(MAXX, (e.clientX - drag.x) / drag.k));
    drag = null;
    if (x >= MAXX - 4) unlock();
    else { knob.classList.add('is-back'); knob.style.transform = ''; slideTxt.style.opacity = ''; }
  };
  knob.addEventListener('pointerup', release);
  knob.addEventListener('pointercancel', release);
  knob.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' || e.key === 'Enter') unlock(); });

  function unlock() {
    if (state !== 'locked') return;
    state = 'home';
    quietUntil = performance.now() + 600;
    SFX.click();
    lock.classList.add('is-gone');
    setBar('black');
    tickClock();
    setTimeout(flyIn, 150);
  }
  function relock() {
    if (current) { current.el.remove(); current.def.onClose && current.def.onClose(); current = null; }
    state = 'locked';
    setBar('trans');
    knob.style.transform = '';
    slideTxt.style.opacity = '';
    lock.classList.remove('is-gone');
    flyOut();
    tickClock();
  }

  /* --------------------------------------------------------------- buttons */

  let asleep = false;
  homeBtn.addEventListener('click', () => {
    if (state === 'boot') return;
    if (asleep) { wake(); return; }
    if (state === 'app') { SFX.click(); closeApp(); return; }
    if (state === 'locked') { knob.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(18px)' }, { transform: 'translateX(0)' }], { duration: 380, easing: 'ease-out' }); }
  });
  const wake = () => { asleep = false; off.classList.remove('on'); };
  room.querySelector('.ip-sleep').addEventListener('click', () => {
    if (state === 'boot') return;
    if (asleep) { wake(); return; }
    asleep = true;
    off.classList.add('on');
    SFX.click();
    setTimeout(relock, 360);
  });
  room.querySelectorAll('.ip-vol').forEach((b) => b.addEventListener('click', () => SFX.beep()));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && state === 'app') closeApp(); });

  /* ------------------------------------------------------------------ boot */

  lock.style.backgroundImage = `url(${P.photo.replace('-480', '-960')})`;
  drawBoard();
  (window.READY || Promise.resolve()).then(() => {
    setTimeout(() => {
      boot.classList.add('is-gone');
      state = 'locked';
      tickClock();
      setInterval(tickClock, 10000);
    }, 1600);
  });
} };
