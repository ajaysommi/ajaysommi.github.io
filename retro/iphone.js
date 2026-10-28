/* ==========================================================================
   iPhone 2G, one of the phones on the era picker. The handset is a
   photograph (retro/dev/iphone-2g.webp, kept out of git) when it is
   present, with the live screen laid exactly over its display: in that
   photo the display is the 661 by 991 pixel box at (68, 262), a 2:3 box
   the 320 by 480 point screen fills at 2.0656 pixels a point. Without the
   photo, a drawn handset stands in.

   The software follows the first iPhone OS as closely as it can, and
   everything on it works: the keyboard types, messages send, notes and
   contacts can be edited, the dialler dials (into a polite error), and
   every Edit, Clear and + does what it says.
   ========================================================================== */
window.IPHONE = { start(room, exit) {

  const P = window.PORTFOLIO;
  const { esc, store, usedAt } = window.RETRO;
  const SFX = window.SFX;
  const PHOTO = 'retro/dev/iphone-2g.webp';
  const WALL = 'assets/images/iphone-wallpaper.webp';
  const HV = 'font-family="Helvetica,Helvetica Neue,Arial,sans-serif"';

  /* The AJ mark's four shapes, for the silver boot logo and the web clip. */
  const MARK = {
    a: 'M10.29 44.57 L30.86 9.90 L43.20 32.70 L43.20 36.19 L36.19 36.19 L30.86 26.67 L20.19 44.57Z',
    j: 'M26.25 36.19 A13.16 13.16 0 0 0 52.57 36.19 L43.83 36.19 A4.42 4.42 0 0 1 34.99 36.19Z',
    stem: 'M43.83 24.6h8.74v11.79h-8.74z',
    dot: 'M48.2 11.8a5.6 5.6 0 1 1 0 11.2a5.6 5.6 0 1 1 0-11.2z'
  };
  const SILVER = `<svg class="ip-silver" viewBox="6 6 52 44" aria-hidden="true">
      <defs>
        <linearGradient id="slv" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#e3e3e3"/><stop offset=".5" stop-color="#c4c4c4"/><stop offset=".78" stop-color="#ececec"/><stop offset="1" stop-color="#a9a9a9"/></linearGradient>
        <linearGradient id="shn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
        <clipPath id="mclip"><path d="${MARK.a}"/><path d="${MARK.j}"/><path d="${MARK.stem}"/><path d="${MARK.dot}"/></clipPath>
      </defs>
      <g fill="url(#slv)" stroke="#7d7d7d" stroke-width=".55" stroke-linejoin="round"><path d="${MARK.a}"/><path d="${MARK.j}"/><path d="${MARK.stem}"/><path d="${MARK.dot}"/></g>
      <g fill="none" stroke="#fff" stroke-opacity=".8" stroke-width=".35" transform="translate(.35 .35)"><path d="${MARK.a}"/><path d="${MARK.dot}"/></g>
      <path d="M8 40 Q30 22 56 18" stroke="#9a9a9a" stroke-width=".7" fill="none" clip-path="url(#mclip)"/>
      <g clip-path="url(#mclip)"><rect class="ip-shine" x="-20" y="0" width="14" height="60" fill="url(#shn)" transform="skewX(-20)"/></g>
      <path class="ip-spark" d="M52 10l1.1 3.4 3.4 1.1-3.4 1.1L52 19l-1.1-3.4-3.4-1.1 3.4-1.1z" fill="#fff"/>
    </svg>`;

  room.innerHTML = `
    <div class="ip-scale"><div class="ip">
      <button class="ip-btn ip-sleep" type="button" aria-label="Sleep/Wake"></button>
      <span class="ip-btn ip-ring" aria-hidden="true"></span>
      <button class="ip-btn ip-vol up" type="button" aria-label="Volume up"></button>
      <button class="ip-btn ip-vol dn" type="button" aria-label="Volume down"></button>
      <div class="ip-face">
        <span class="ip-ear" aria-hidden="true"></span>
        <div class="ip-screen" data-bar="trans" role="application" aria-label="Phone screen">
          <div class="ip-status"><span class="l"><span class="ip-sig"><i></i><i></i><i></i><i></i><i></i></span><b class="car">SOMMI</b><span class="ip-edge">E</span></span><span class="c"></span><span class="r"><span class="ip-bat"><i></i></span></span></div>
          <div class="ip-board is-flying"><div class="ip-grid"></div><div class="ip-dock"></div></div>
          <div class="ip-lock" style="background-image:url(${WALL})"><div class="top"><div class="time"></div><div class="date"></div></div><div class="bot"><div class="ip-slider"><div class="txt">slide to unlock</div><div class="ip-knob" role="slider" aria-label="Slide to unlock" tabindex="0"><svg viewBox="0 0 34 24"><defs><linearGradient id="kar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a3a3a3"/><stop offset="1" stop-color="#6d6d6d"/></linearGradient></defs><path d="M5 9h13V4l11 8-11 8v-5H5z" fill="url(#kar)" stroke="#5f5f5f" stroke-width=".6" stroke-linejoin="round"/></svg></div></div></div></div>
          <div class="ip-boot">${SILVER}</div>
          <div class="ip-off"></div>
        </div>
      </div>
      <button class="ip-home" type="button" aria-label="Home"><span class="ip-press" aria-hidden="true"></span></button>
    </div></div>`;

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

  /* Same size and shape as ever, scaled to the room the browser leaves
     under the buttons on top. */
  const fit = () => {
    const v = window.RETRO.viewport();
    const w = dev.classList.contains('is-photo') ? 385 : 396;
    const h = dev.classList.contains('is-photo') ? 730 : 748;
    const s = Math.min(1.3, (v.h - 56) / h, (v.w - 24) / w);
    scaleBox.style.transform = `scale(${s})`;
    scaleBox.style.marginTop = v.top + 44 + Math.max(0, (v.h - 56 - h * s) / 2) + 'px';
  };
  fit();
  addEventListener('resize', fit);
  if (window.visualViewport) visualViewport.addEventListener('resize', fit);

  /* The home button sinks while held and is the photograph again when
     let go. */
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

  /* Drawn after the 2007 springboard: a glossy 57 point tile, the same
     subjects and colour grading. Gradient ids are made unique per icon. */
  let gid = 0;
  const ic = (inner, defs = '') => {
    const k = 'i' + (++gid) + '_';
    const fix = (s) => s.replace(/id="(\w+)"/g, `id="${k}$1"`).replace(/url\(#(\w+)\)/g, `url(#${k}$1)`);
    return `<svg viewBox="0 0 57 57" aria-hidden="true"><defs>${fix(defs)}</defs>${fix(inner)}</svg>`;
  };
  const lg = (id, stops, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;
  const rg = (id, stops, cx = 0.5, cy = 0.5, r = 0.5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</radialGradient>`;
  const GREEN = lg('g', [[0, '#8fe36a'], [0.5, '#45bb35'], [1, '#1c9216']]);

  const ICON = {
    sms: () => ic(`<rect width="57" height="57" fill="url(#g)"/><path d="M28.5 10.5c12.2 0 21.3 7.2 21.3 16.3S40.7 43 28.5 43c-2.3 0-4.5-.3-6.5-.8l-9.6 6 3.2-8.6C10.3 36.6 7.2 32 7.2 26.8 7.2 17.7 16.3 10.5 28.5 10.5z" fill="#fff"/>
        <text x="28.5" y="31.6" text-anchor="middle" ${HV} font-weight="bold" font-size="13.5" fill="#2fa321" letter-spacing="-.3">SMS</text>`, GREEN),
    calendar: () => { const d = now(); return ic(`<rect width="57" height="57" fill="url(#w)"/><rect width="57" height="17" fill="url(#r)"/><rect y="17" width="57" height=".8" fill="#7d0d0d" opacity=".5"/>
        <text x="28.5" y="12.6" text-anchor="middle" ${HV} font-weight="bold" font-size="10.5" fill="#fff">${d.toLocaleDateString('en-US', { weekday: 'long' })}</text>
        <text x="28.5" y="50.5" text-anchor="middle" ${HV} font-weight="bold" font-size="35" fill="#1b1b1b" letter-spacing="-1.5">${d.getDate()}</text>`,
      lg('w', [[0, '#ffffff'], [0.6, '#f3f3f3'], [1, '#d2d2d2']]) + lg('r', [[0, '#f37b7b'], [0.5, '#dd2a2a'], [1, '#b00d0d']])); },
    photos: () => {
      let pet = '';
      for (let i = 0; i < 18; i++) pet += `<ellipse cx="27" cy="11" rx="3.6" ry="9.2" fill="url(#p)" stroke="#d98a00" stroke-width=".35" transform="rotate(${i * 20} 27 23)"/>`;
      return ic(`<rect width="57" height="57" fill="url(#s)"/><ellipse cx="9" cy="49" rx="13" ry="4.5" fill="#fff" opacity=".75"/><ellipse cx="48" cy="52" rx="12" ry="4" fill="#fff" opacity=".6"/>
        <path d="M27 30q4 12 1 27h3.4q2-14-1.6-27z" fill="#2f7a17"/><path d="M30 45q10-10 18-6-8 8-18 8z" fill="#43a522"/><path d="M28 50q-8-8-15-4 7 6 15 6z" fill="#3b961d"/>${pet}<circle cx="27" cy="23" r="8" fill="url(#c)"/>`,
      lg('s', [[0, '#2774d4'], [0.55, '#64abeb'], [1, '#bfe0fb']]) + lg('p', [[0, '#ffe76a'], [1, '#f5a500']]) + rg('c', [[0, '#8a5a1e'], [0.7, '#4c2a08'], [1, '#2e1704']]));
    },
    camera: () => ic(`<rect width="57" height="57" fill="url(#bg)"/><circle cx="28.5" cy="28.5" r="20" fill="url(#ring)"/><circle cx="28.5" cy="28.5" r="15.5" fill="#0d0d0f"/><circle cx="28.5" cy="28.5" r="11" fill="url(#lens)"/>
        <circle cx="28.5" cy="28.5" r="5" fill="#05070c"/><ellipse cx="24" cy="23.5" rx="3.6" ry="2.4" fill="#fff" opacity=".7" transform="rotate(-30 24 23.5)"/><circle cx="33" cy="33" r="1.6" fill="#7fb0ff" opacity=".8"/>`,
      lg('bg', [[0, '#f8f8f8'], [0.5, '#d0d0d0'], [1, '#8a8a8a']]) + lg('ring', [[0, '#ececec'], [1, '#5e5e5e']]) + rg('lens', [[0, '#3e64b8'], [0.6, '#162a5e'], [1, '#05070c']], 0.4, 0.35)),
    tv: () => ic(`<rect width="57" height="57" fill="url(#wood)"/><rect x="4.5" y="5.5" width="48" height="36" rx="9" fill="#6b4318" opacity=".55"/><rect x="6" y="7" width="45" height="33" rx="8.5" fill="url(#scr)" stroke="#4d3008" stroke-width=".8"/>
        <path d="M8 13q20-7 41 0v9q-20 6-41 0z" fill="#fff" opacity=".22"/>
        <rect x="6" y="44" width="45" height="9" rx="2" fill="#4d3008" opacity=".35"/><circle cx="12" cy="48.5" r="3.2" fill="url(#k)"/><circle cx="45" cy="48.5" r="3.2" fill="url(#k)"/>${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${20.5 + i * 2.4}" y="45.5" width="1.2" height="6" fill="#3a2406" opacity=".6"/>`).join('')}`,
      lg('wood', [[0, '#e7c486'], [0.5, '#c9944e'], [1, '#93622a']]) + rg('scr', [[0, '#c3cdb0'], [0.75, '#7a8a67'], [1, '#46553a']], 0.45, 0.3, 0.75) + rg('k', [[0, '#f8f0dc'], [1, '#7a6642']], 0.4, 0.35)),
    stocks: () => ic(`<rect width="57" height="57" fill="url(#bg)"/>${[11, 23, 35, 47].map((x) => `<line x1="${x}" y1="4" x2="${x}" y2="47" stroke="#fff" stroke-opacity=".38" stroke-width=".7"/>`).join('')}
        <path d="M0 34l4-3 4 2 4-7 4 5 4-9 4 6 4-3 4 4 4-10 4 5 4-4 4 3 5-6" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/>
        <rect y="47" width="57" height="10" fill="#0f4aa6" opacity=".5"/><text x="4" y="54.5" ${HV} font-size="6" fill="#fff">'19</text><text x="24" y="54.5" ${HV} font-size="6" fill="#fff">'22</text><text x="46" y="54.5" ${HV} font-size="6" fill="#fff">'26</text>`,
      lg('bg', [[0, '#9ed2ff'], [0.45, '#4597ef'], [1, '#1756c3']])),
    maps: () => ic(`<rect width="57" height="57" fill="#ede3c9"/><path d="M0 0h22v19H0zM37 37h20v20H37z" fill="#cfe2b4"/><path d="M38 0h19v14H38z" fill="#b9d3ea"/>
        <path d="M-2 24 59 30" stroke="#fff" stroke-width="7.5"/><path d="M-2 24 59 30" stroke="#f3c03c" stroke-width="4.5"/><path d="M23 -2 27 59" stroke="#fff" stroke-width="6"/><path d="M23 -2 27 59" stroke="#f3c03c" stroke-width="3"/><path d="M6 44q14 0 18 15" stroke="#fff" stroke-width="2.6" fill="none"/>
        <path d="M33 3h16v9q0 5.5-8 8.5-8-3-8-8.5z" fill="#1f50c4" stroke="#fff" stroke-width="1.1"/><path d="M33 3h16v3.4H33z" fill="#d42222"/><text x="41" y="14.6" text-anchor="middle" ${HV} font-weight="bold" font-size="6.6" fill="#fff">280</text>
        <path d="M17.6 33.5h1.3v11h-1.3z" fill="#7a7a7a"/><circle cx="18.2" cy="30" r="4.8" fill="url(#pin)"/><circle cx="16.8" cy="28.6" r="1.4" fill="#fff" opacity=".8"/>`,
      rg('pin', [[0, '#ff8d8d'], [0.6, '#d40f0f'], [1, '#8f0000']], 0.35, 0.35)),
    weather: () => ic(`<rect width="57" height="57" fill="url(#bg)"/><circle cx="30" cy="23" r="17" fill="url(#glow)"/><circle cx="30" cy="23" r="11.5" fill="url(#sun)"/>
        <text x="51" y="50" text-anchor="end" ${HV} font-weight="bold" font-size="13" fill="#fff">26°</text>`,
      lg('bg', [[0, '#6ab9ff'], [0.5, '#2f86f0'], [1, '#1758cc']]) + rg('glow', [[0, '#ffe680', 0.75], [1, '#ffe680', 0]]) + rg('sun', [[0, '#fff6a6'], [0.6, '#ffc61a'], [1, '#f39400']], 0.4, 0.35)),
    settings: () => {
      const gear = (cx, cy, r, n, w) => { let t = ''; for (let i = 0; i < n; i++) t += `<rect x="${cx - w / 2}" y="${cy - r - 4}" width="${w}" height="7" rx="1.1" transform="rotate(${i * 360 / n} ${cx} ${cy})"/>`; return t; };
      return ic(`<rect width="57" height="57" fill="url(#bg)"/><rect x="2.5" y="2.5" width="52" height="52" rx="8" fill="url(#in)"/>
        <g fill="#6f6f6f" opacity=".6">${gear(44, 13, 9, 10, 3.6)}<circle cx="44" cy="13" r="9"/></g>
        <g fill="url(#gr)">${gear(26, 31, 16, 16, 5)}<circle cx="26" cy="31" r="16"/></g><circle cx="26" cy="31" r="11" fill="url(#hub)"/><circle cx="26" cy="31" r="6.5" fill="url(#gr)"/><circle cx="26" cy="31" r="3" fill="#3d3d3d"/>`,
      lg('bg', [[0, '#e9e9e9'], [1, '#6d6d6d']]) + rg('in', [[0, '#7a7a7a'], [1, '#3b3b3b']], 0.5, 0.4, 0.7) + lg('gr', [[0, '#f2f2f2'], [0.5, '#bdbdbd'], [1, '#8a8a8a']]) + rg('hub', [[0, '#9a9a9a'], [1, '#5a5a5a']]));
    },
    notes: () => ic(`<rect width="57" height="57" fill="url(#pad)"/>${[23, 29.5, 36, 42.5, 49].map((y) => `<line x1="0" y1="${y}" x2="57" y2="${y}" stroke="#cbb75c" stroke-width=".7"/>`).join('')}
        <rect width="57" height="15" fill="url(#lth)"/><rect y="14.2" width="57" height="1.6" fill="#3a1f05"/>${[...Array(14)].map((_, i) => `<rect x="${2 + i * 4}" y="2.4" width="2" height=".9" fill="#e6c79a" opacity=".55"/>`).join('')}`,
      lg('pad', [[0, '#fff8b8'], [1, '#f3d75e']]) + lg('lth', [[0, '#9e6e3c'], [0.5, '#6a4016'], [1, '#4a2908']])),
    phone: () => ic(`<rect width="57" height="57" fill="url(#g)"/><path d="M17.6 9.6c2.5-1.7 5.1-.5 6 2.3l1.7 4.7c.8 2.4-.5 3.7-2.3 4.7 1.1 4.3 4.4 8.3 8.6 10.1 1.1-1.7 2.8-3.1 5.2-2.2l4.9 2.1c2.6 1.1 3.5 3.7 1.8 6.1-2.1 3.2-6.3 4.9-10.5 3.5-9.4-3.3-17-11.2-19.7-20.2-1.2-4.3.6-8.8 4.3-11.1z" fill="#fff"/>`, GREEN),
    mail: () => ic(`<rect width="57" height="57" fill="url(#sky)"/><ellipse cx="11" cy="48" rx="15" ry="6" fill="#fff" opacity=".9"/><ellipse cx="44" cy="51" rx="16" ry="6" fill="#fff" opacity=".8"/><ellipse cx="30" cy="54" rx="12" ry="4" fill="#fff" opacity=".85"/>
        <rect x="8" y="15" width="41" height="27" rx="1.2" fill="url(#env)" stroke="#9aaac0" stroke-width=".7"/><path d="M8.4 15.6 28.5 31 48.6 15.6" fill="none" stroke="#9aaac0" stroke-width="1.3"/><path d="M8.4 41.5 23 27.6M48.6 41.5 34 27.6" stroke="#c5d0dd" stroke-width=".9"/>`,
      lg('sky', [[0, '#2f7ce6'], [0.6, '#79b9f6'], [1, '#c5e3fb']]) + lg('env', [[0, '#ffffff'], [1, '#dfe6ef']])),
    safari: () => { let t = ''; for (let i = 0; i < 48; i++) t += `<line x1="28.5" y1="9.5" x2="28.5" y2="${i % 4 ? 11.2 : 12.6}" stroke="#fff" stroke-width=".6" transform="rotate(${i * 7.5} 28.5 28.5)"/>`; return ic(`<rect width="57" height="57" fill="url(#bg)"/><circle cx="28.5" cy="28.5" r="22" fill="url(#rim)"/><circle cx="28.5" cy="28.5" r="19.5" fill="url(#dial)"/>${t}
        ${[['N', 28.5, 17.6], ['S', 28.5, 43.4], ['E', 41.6, 30.4], ['W', 15.4, 30.4]].map(([l, x, y]) => `<text x="${x}" y="${y}" text-anchor="middle" ${HV} font-weight="bold" font-size="4.6" fill="#fff">${l}</text>`).join('')}
        <path d="M28.5 28.5 40 15.5 31.4 31.2z" fill="#e3261d"/><path d="M28.5 28.5 17 41.5 25.6 25.8z" fill="#f2f2f2"/><circle cx="28.5" cy="28.5" r="1.6" fill="#999"/>`,
      lg('bg', [[0, '#cfe6ff'], [1, '#4f8fda']]) + lg('rim', [[0, '#ffffff'], [1, '#b8c2cf']]) + rg('dial', [[0, '#a8deff'], [0.75, '#2c88e2'], [1, '#1259b3']], 0.45, 0.38, 0.62)); },
    clipAJ: () => ic(`<rect width="57" height="57" fill="url(#bg)"/><g transform="translate(5.5 6) scale(.74)"><path d="${MARK.a}" fill="#fff"/><path d="${MARK.j}" fill="#ff6b35"/><path d="${MARK.stem}" fill="#5c86ff"/><path d="${MARK.dot}" fill="#5c86ff"/></g>`,
      lg('bg', [[0, '#3a3f4a'], [1, '#101318']])),
    clipGH: () => ic(`<rect width="57" height="57" fill="url(#bg)"/><text x="28.5" y="37" text-anchor="middle" font-family="Menlo,Monaco,monospace" font-weight="bold" font-size="21" fill="#fff">{ }</text>`,
      lg('bg', [[0, '#62666e'], [1, '#1d2026']])),
    clipIN: () => ic(`<rect width="57" height="57" fill="url(#bg)"/><text x="28.5" y="40" text-anchor="middle" ${HV} font-weight="bold" font-size="30" fill="#fff" letter-spacing="-1">in</text>`,
      lg('bg', [[0, '#5eaaf0'], [0.5, '#1f78c9'], [1, '#0b5aa5']]))
  };

  /* Small row icons for the Settings-style tables. */
  const mini = (bg, glyph) => `<span class="mi" style="--mi:${bg}">${glyph}</span>`;

  /* --------------------------------------------------------------- shell */

  let state = 'boot';
  let current = null;

  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const setBar = (b) => { scr.dataset.bar = b; };
  const ext = (url) => window.open(url, '_blank', 'noopener');
  const mailto = (subject, body) => { location.href = `mailto:${P.email}?subject=${encodeURIComponent(subject || '')}${body ? '&body=' + encodeURIComponent(body) : ''}`; };

  /* ---------------------------------------------------------------- alert */

  /* The alert of the time: a dark glass panel that pops in with a little
     overshoot, a bold title and a full width button per choice. */
  const alertBox = (title, msg, buttons = ['Dismiss']) => new Promise((resolve) => {
    const s = h('div', 'ip-alert-scrim');
    const a = h('div', 'ip-alert', `<b>${esc(title)}</b>${msg ? `<p>${msg}</p>` : ''}<div class="ip-al-btns${buttons.length === 2 ? ' two' : ''}">${buttons.map((b, i) => `<button type="button" class="${i === buttons.length - 1 && buttons.length > 1 ? 'dflt' : ''}">${esc(b)}</button>`).join('')}</div>`);
    s.appendChild(a);
    scr.appendChild(s);
    SFX.beep();
    a.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      a.classList.add('is-out');
      s.classList.add('is-out');
      setTimeout(() => s.remove(), 220);
      resolve(b.textContent);
    }));
  });

  /* ------------------------------------------------------------- keyboard */

  /* The keyboard: a key pops up a magnified copy of itself while pressed,
     shift, numbers, delete and return all work, and a real keyboard types
     into it too. Anything with insert/back/enter can be its target. */
  const KB_ROWS = {
    abc: [['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'], ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], ['⇧', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '⌫'], ['.?123', 'space', 'return']],
    num: [['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'], ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'], ['#+=', '.', ',', '?', '!', "'", '⌫'], ['ABC', 'space', 'return']]
  };
  /* Whether this phone is on screen (fixed rooms have no offsetParent). */
  const shown = () => room.isConnected && !room.hidden && room.getClientRects().length > 0;
  const kb = (() => {
    const el = h('div', 'kb');
    const pop = h('div', 'kb-pop');
    let target = null, mode = 'abc', shift = true;
    const draw = () => {
      el.innerHTML = KB_ROWS[mode].map((row, r) => `<div class="kb-r r${r}">${row.map((k) => {
        const wide = k === 'space' ? ' sp' : k === 'return' ? ' ret' : (k === '.?123' || k === 'ABC') ? ' mode' : (k === '⇧' || k === '⌫' || k === '#+=') ? ' fn' : '';
        const label = k.length === 1 && mode === 'abc' && shift ? k.toUpperCase() : k === 'return' && target && target.ret ? target.ret : k;
        return `<button type="button" class="kb-k${wide}${k === '⇧' && shift ? ' on' : ''}" data-k="${esc(k)}">${esc(label)}</button>`;
      }).join('')}</div>`).join('');
      el.appendChild(pop);
    };
    const type = (k) => {
      if (!target) return;
      if (k === '⌫') target.back();
      else if (k === 'return') target.enter();
      else if (k === 'space') target.insert(' ');
      else if (k === '⇧') { shift = !shift; draw(); return; }
      else if (k === '.?123' || k === '#+=') { mode = 'num'; draw(); return; }
      else if (k === 'ABC') { mode = 'abc'; draw(); return; }
      else { target.insert(mode === 'abc' && shift ? k.toUpperCase() : k); if (shift && mode === 'abc') { shift = false; draw(); } }
      SFX.key();
    };
    el.addEventListener('pointerdown', (e) => {
      const b = e.target.closest('.kb-k');
      if (!b) return;
      e.preventDefault();
      b.classList.add('dn');
      const k = b.dataset.k;
      if (k.length === 1 && k !== '⇧' && k !== '⌫') {
        const r = b.getBoundingClientRect(), s = el.getBoundingClientRect(), z = s.width / 320;
        pop.textContent = b.textContent;
        pop.style.left = ((r.left - s.left) / z + r.width / z / 2) + 'px';
        pop.style.top = ((r.top - s.top) / z) + 'px';
        pop.classList.add('on');
      }
      const up = () => { b.classList.remove('dn'); pop.classList.remove('on'); removeEventListener('pointerup', up); type(k); };
      addEventListener('pointerup', up);
    });
    document.addEventListener('keydown', (e) => {
      if (!target || !shown() || e.metaKey || e.ctrlKey) return;
      if (e.key === 'Backspace') { e.preventDefault(); target.back(); }
      else if (e.key === 'Enter') { e.preventDefault(); target.enter(); }
      else if (e.key.length === 1) { e.preventDefault(); target.insert(e.key); }
      else return;
      SFX.key();
    });
    draw();
    scr.appendChild(el);
    return {
      show(t) { if (target && target !== t && target.blur) target.blur(); target = t; shift = !t.value || /[.!?]\s*$/.test(t.value); mode = 'abc'; draw(); el.classList.add('on'); scr.classList.add('kb-on'); },
      hide() { if (target && target.blur) target.blur(); target = null; el.classList.remove('on'); scr.classList.remove('kb-on'); },
      get target() { return target; }
    };
  })();

  /* A text field drawn by hand: a caret that blinks, a value the keyboard
     edits. Tapping it brings the keyboard up. */
  const field = (el, { value = '', placeholder = '', multi = false, ret = 'return', onEnter, onChange } = {}) => {
    el.classList.add('fld');
    if (multi) el.classList.add('multi');
    const f = {
      value, ret,
      render() { el.innerHTML = `${f.value ? esc(f.value).replace(/\n/g, '<br/>') : `<span class="ph">${esc(placeholder)}</span>`}<i class="caret"></i>`; onChange && onChange(f.value); if (multi) el.scrollTop = el.scrollHeight; },
      insert(s) { f.value += s; f.render(); },
      back() { f.value = f.value.slice(0, -1); f.render(); },
      enter() { if (onEnter) onEnter(f); else if (multi) f.insert('\n'); },
      focus() { el.classList.add('on'); kb.show(f); },
      blur() { el.classList.remove('on'); },
      clear() { f.value = ''; f.render(); }
    };
    el.addEventListener('click', (e) => { e.stopPropagation(); f.focus(); });
    f.render();
    return f;
  };

  /* -------------------------------------------------------------- the app */

  /* The back button: one shape, its point on the left, glossy as the bar.
     Drawn to the button's own width once its label is laid out. */
  let bid = 0;
  const THEMES = {
    blue: ['#a6b8cf', '#7892b6', '#6280aa', '#5a79a2', '#2f4466'],
    black: ['#727272', '#3c3c3c', '#272727', '#1b1b1b', '#000'],
    notes: ['#cfa778', '#9a6b35', '#8a5d2a', '#7a5222', '#3f2408']
  };
  const shapeBack = (b, theme) => {
    const C = THEMES[theme] || THEMES.blue;
    const w = Math.ceil(b.offsetWidth), k = 'bb' + (++bid);
    b.insertAdjacentHTML('afterbegin', `<svg class="bsh" width="${w}" height="30" viewBox="0 0 ${w} 30" aria-hidden="true"><defs><linearGradient id="${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C[0]}"/><stop offset=".5" stop-color="${C[1]}"/><stop offset=".51" stop-color="${C[2]}"/><stop offset="1" stop-color="${C[3]}"/></linearGradient></defs>
      <path d="M${w - 5.5} .5H12.4L.9 15l11.5 14.5H${w - 5.5}A5 5 0 0 0 ${w - .5} 24.5V5.5A5 5 0 0 0 ${w - 5.5} .5Z" fill="url(#${k})" stroke="${C[4]}" stroke-width="1"/>
      <path d="M${w - 5.5} 1.5H12.9L2.2 15" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1"/></svg>`);
  };

  /* An app: a nav bar over a stack of sliding pages. */
  const makeApp = (def, from) => {
    const el = h('div', 'ip-app' + (def.cls ? ' ' + def.cls : ''));
    const r = from ? from.getBoundingClientRect() : null;
    const s = scr.getBoundingClientRect();
    if (r) {
      const k = s.width / 320;
      el.style.setProperty('--ox', ((r.left + r.width / 2 - s.left) / k) + 'px');
      el.style.setProperty('--oy', ((r.top + r.height / 2 - s.top) / k) + 'px');
    }
    scr.insertBefore(el, scr.querySelector('.kb'));
    const app = { el, stack: [], def };
    if (def.bare) { setBar(def.bar || 'black'); def.open(app); return app; }
    const nb = h('div', 'nb' + (def.nb ? ' ' + def.nb : ''), '<span class="t"></span>');
    const vw = h('div', 'vw');
    el.append(nb, vw);
    app.nb = nb; app.vw = vw;
    setBar(def.bar || 'gray');
    app.push = (title, fill, opts = {}) => {
      kb.hide();
      const pg = h('div', 'pg' + (opts.cls ? ' ' + opts.cls : ''));
      const prev = app.stack[app.stack.length - 1];
      const entry = { title, pg, opts };
      app.stack.push(entry);
      fill(pg, app, entry);
      vw.appendChild(pg);
      if (prev && !opts.instant) { prev.pg.classList.add('out-l'); pg.classList.add('in-r'); setTimeout(() => { prev.pg.style.visibility = 'hidden'; prev.pg.classList.remove('out-l'); }, 300); }
      else if (prev) prev.pg.style.visibility = 'hidden';
      drawBar();
      return pg;
    };
    app.pop = () => {
      if (app.stack.length < 2) return;
      kb.hide();
      const top = app.stack.pop();
      top.opts.onPop && top.opts.onPop();
      const prev = app.stack[app.stack.length - 1];
      prev.pg.style.visibility = '';
      prev.pg.classList.add('in-l');
      top.pg.classList.add('out-r');
      setTimeout(() => { top.pg.remove(); prev.pg.classList.remove('in-l'); }, 300);
      drawBar();
      SFX.click();
    };
    app.reset = (title, fill, opts) => { kb.hide(); app.stack.forEach((x) => x.pg.remove()); app.stack.length = 0; app.push(title, fill, opts); };
    app.redraw = () => drawBar();
    const btn = (cls, label, fn) => { const b = h('button', 'nbb ' + cls, label === '+' ? '+' : `<span>${esc(label)}</span>`); b.type = 'button'; b.addEventListener('click', (e) => { SFX.click(); fn(e); }); nb.appendChild(b); return b; };
    const drawBar = () => {
      const top = app.stack[app.stack.length - 1];
      nb.querySelectorAll('.nbb, .seg').forEach((b) => b.remove());
      nb.querySelector('.t').textContent = top.title;
      nb.classList.toggle('has-seg', !!top.opts.seg);
      if (top.opts.left) btn('ll' + (top.opts.leftBlue ? ' blue' : ''), top.opts.left[0], top.opts.left[1]);
      else if (app.stack.length > 1) {
        const b = btn('l', top.opts.back || app.stack[app.stack.length - 2].title, app.pop);
        shapeBack(b, def.nb);
      }
      if (top.opts.right) btn('r' + (top.opts.blue ? ' blue' : '') + (top.opts.right[0] === '+' ? ' plus' : ''), top.opts.right[0], top.opts.right[1]);
      if (top.opts.seg) nb.appendChild(top.opts.seg);
      const side = Math.max(0, ...[...nb.querySelectorAll('.nbb')].map((b) => b.offsetWidth + 10));
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
    kb.hide();
    const a = current;
    current = null;
    a.def.onClose && a.def.onClose();
    scr.querySelectorAll('.ip-alert-scrim').forEach((x) => x.remove());
    a.el.classList.add('is-closing');
    setTimeout(() => a.el.remove(), 320);
    setBar('black');
    state = 'home';
    tickClock();
  };

  /* Tables. */
  const plain = (pg, rows) => {
    const ul = h('ul', 'pl');
    rows.forEach((r) => {
      if (r.header) { ul.appendChild(h('li', 'sh', esc(r.header))); return; }
      const li = h('li', (r.go ? 'chev ' : '') + (r.sub ? 'two ' : '') + (r.cls || ''), `<button type="button" class="del-dot" aria-label="Delete"></button>${r.img ? `<img src="${r.img}" alt="" />` : ''}${r.lead || ''}<span class="tx">${esc(r.text)}${r.sub ? `<span class="sub">${esc(r.sub)}</span>` : ''}</span>${r.rt ? `<span class="rt">${esc(r.rt)}</span>` : ''}<button type="button" class="del-btn">Delete</button>`);
      if (r.id != null) li.dataset.id = r.id;
      li.addEventListener('click', (e) => {
        if (ul.classList.contains('editing')) {
          if (e.target.closest('.del-dot')) { li.classList.toggle('arm'); return; }
          if (e.target.closest('.del-btn')) { li.classList.add('gone'); setTimeout(() => { li.remove(); r.onDelete && r.onDelete(); }, 260); return; }
          return;
        }
        if (r.go) { SFX.click(); r.go(); }
      });
      ul.appendChild(li);
    });
    pg.appendChild(ul);
    return ul;
  };
  /* Edit, the way it worked: red circles, a tap turns one, Delete removes. */
  const editable = (app, entry, ul) => {
    entry.opts.left = ['Edit', () => {
      const on = !ul.classList.contains('editing');
      ul.classList.toggle('editing', on);
      ul.querySelectorAll('li').forEach((li) => li.classList.remove('arm'));
      entry.opts.left = [on ? 'Done' : 'Edit', entry.opts.left[1]];
      entry.opts.leftBlue = on;
      app.redraw();
    }];
  };
  const group = (rows) => `<div class="gp">${rows.map(([k, v, n]) => `<div class="row">${k ? `<span class="k">${esc(k)}</span>` : ''}<span class="v${n ? ' n' : ''}">${v}</span></div>`).join('')}</div>`;
  const kv = (rows) => `<div class="gp">${rows.map(([k, v]) => `<div class="row"><span class="v">${esc(k)}</span><span class="rv">${esc(v)}</span></div>`).join('')}</div>`;
  const toggle = (on, key) => `<button type="button" class="sw${on ? ' on' : ''}" data-sw="${key}" role="switch" aria-checked="${on}"><span class="sw-on">ON</span><span class="sw-off">OFF</span><i></i></button>`;

  /* A segmented control, as in Calendar's nav bar. */
  const seg = (items, sel, on, cls = '') => {
    const s = h('div', 'seg ' + cls, items.map((x, i) => `<button type="button" class="${i === sel ? 'on' : ''}" data-i="${i}">${esc(x)}</button>`).join(''));
    s.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (!b) return; s.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); SFX.click(); on(+b.dataset.i); });
    return s;
  };

  /* A tab bar whose every tab shows its own page. */
  const tabs = (app, items, start, show) => {
    const t = h('div', 'tabs', items.map(([n, d], i) => `<button type="button" class="${i === start ? 'on' : ''}" data-i="${i}"><svg viewBox="0 0 30 26"><path d="${d}"/></svg>${n}</button>`).join(''));
    t.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (!b) return; t.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); SFX.click(); show(+b.dataset.i); });
    app.el.appendChild(t);
    show(start);
    return t;
  };
  const TAB = {
    star: 'M15 2l3.8 8 8.6.9-6.4 5.8 1.9 8.5L15 21l-7.9 4.2L9 16.7 2.6 10.9l8.6-.9z',
    clock: 'M15 2a11 11 0 1 1 0 22 11 11 0 0 1 0-22zm-1 5v7l6 4 1-2-5-3V7z',
    person: 'M15 3a6 6 0 1 1 0 12 6 6 0 0 1 0-12zM3 26c1-7 6-10 12-10s11 3 12 10z',
    keypad: 'M5 2h5v5H5zM12.5 2h5v5h-5zM20 2h5v5h-5zM5 9.5h5v5H5zM12.5 9.5h5v5h-5zM20 9.5h5v5h-5zM5 17h5v5H5zM12.5 17h5v5h-5zM20 17h5v5h-5z',
    vm: 'M8 7a6 6 0 1 1 0 12A6 6 0 0 1 8 7zm14 0a6 6 0 1 1 0 12 6 6 0 0 1 0-12zM8 17h14v2H8z',
    bars: 'M3 22h5V12H3zM12 22h5V4h-5zM21 22h5V8h-5z',
    book: 'M6 3h18v21l-9-6-9 6z',
    search: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zm0 3a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm6 12 8 7-2 2-7-8z',
    more: 'M4 12h5v5H4zM12.5 12h5v5h-5zM21 12h5v5h-5z'
  };

  /* Safari: the address on top, a working toolbar below. */
  const safari = (app, url, label) => {
    const marks = [['Portfolio', 'classic.html'], ['Resume', P.resume], ['GitHub', P.github], ['LinkedIn', P.linkedin]];
    app.el.innerHTML = `<div class="saf-top"><span class="saf-url">${esc(label)}</span><a href="${url}" target="_blank" rel="noopener" class="saf-open">Open</a></div><iframe class="saf-frame" src="${url}" title="${esc(label)}"></iframe><div class="saf-bot"><button type="button" data-a="b">◀</button><button type="button" data-a="f">▶</button><button type="button" data-a="add">+</button><button type="button" data-a="bm"><span class="bk"></span></button><button type="button" data-a="pg"><span class="pg2"></span></button></div>`;
    const fr = app.el.querySelector('.saf-frame'), u = app.el.querySelector('.saf-url'), o = app.el.querySelector('.saf-open');
    const go = (href) => {
      if (/^https?:/.test(href)) { ext(href); return; }
      fr.src = href; u.textContent = 'ajaysommi.github.io/' + (href === 'classic.html' ? '' : href); o.href = href;
    };
    app.el.querySelector('.saf-bot').addEventListener('click', async (e) => {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      SFX.click();
      const a = b.dataset.a;
      if (a === 'b') { try { fr.contentWindow.history.back(); } catch (x) {} }
      if (a === 'f') { try { fr.contentWindow.history.forward(); } catch (x) {} }
      if (a === 'add') alertBox('Bookmark Added', 'Saved to Bookmarks. It was already there, but it’s a good page.');
      if (a === 'pg') alertBox('1 Page', 'One page is open: the one about Ajay. That’s all you need.');
      if (a === 'bm') {
        const r = await alertBox('Bookmarks', '', [...marks.map((m) => m[0]), 'Cancel']);
        const m = marks.find((x) => x[0] === r);
        if (m) go(m[1]);
      }
    });
  };

  /* ---------------------------------------------------------- app content */

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const span = (e) => {
    const [a, b] = e.when.split(' to ');
    const p = (s) => { const [m, y] = s.split(' '); return { m: MONTHS.indexOf(m.slice(0, 3)), y: +y }; };
    return { start: p(a), end: p(b || a) };
  };

  const roleDetail = (e) => (pg) => {
    pg.classList.add('pin');
    pg.innerHTML = `${group([['', `${esc(e.role)}<br/><span style="font-weight:normal;color:#4c566c">${esc(e.org)}</span>`]])}
      ${group([['starts', esc(e.when.split(' to ')[0]), 1], ['ends', esc(e.when.split(' to ')[1] || ''), 1], ['location', esc(e.where), 1]])}
      <div class="gp"><div class="txt">${esc(e.text)}</div></div>
      ${e.stats.length ? group(e.stats.map(([a, b]) => [a, esc(b), 1])) : ''}
      <div class="gp"><div class="txt sub">${e.tags.map(esc).join(' · ')}</div></div>
      ${e.photos.length ? `<div class="gp"><div class="thumbs">${e.photos.map((p) => `<img src="${p}" alt="" />`).join('')}</div></div>` : ''}`;
  };

  /* A little form: labelled fields that the keyboard fills in. */
  const form = (pg, rows) => {
    pg.classList.add('pin');
    pg.innerHTML = `<div class="gp">${rows.map(([k], i) => `<div class="row frm"><span class="k">${esc(k)}</span><span class="v n" data-f="${i}"></span></div>`).join('')}</div>`;
    return rows.map(([, ph, v], i) => field(pg.querySelector(`[data-f="${i}"]`), { placeholder: ph, value: v || '', ret: 'Next' }));
  };

  /* Calendar: List, Day and Month, and + makes a real event. */
  const calendar = (app) => {
    let view = 0;
    let month = new Date(now().getFullYear(), now().getMonth(), 1);
    const mine = store.get('ip-events', []) || [];
    const roles = [...P.experience].reverse();
    const listView = (pg) => {
      const rows = [];
      if (mine.length) { rows.push({ header: 'Your events' }); mine.forEach((m) => rows.push({ text: m.t, lead: `<span class="cal-t">${esc(m.d)}<br/><em>All-day</em></span>`, cls: 'cal-row' })); }
      roles.forEach((e, i, arr) => {
        if (i === 0 || arr[i - 1].year !== e.year) rows.push({ header: String(e.year) });
        const s = span(e);
        rows.push({ text: e.short, lead: `<span class="cal-t">${MONTHS[s.start.m]}<br/><em>${MONTHS[s.end.m]}</em></span>`, cls: 'cal-row', go: () => app.push(e.short, roleDetail(e), { back: 'Calendar' }) });
      });
      plain(pg, rows);
    };
    const dayView = (pg) => {
      const y0 = 2019, y1 = 2027, H = 62;
      pg.classList.add('cal-day');
      pg.innerHTML = `<div class="cal-dh"><button type="button" data-y="-1">◀</button><b>Career</b><span>2019 – 2026</span><button type="button" data-y="1">▶</button></div><div class="cal-hrs" style="height:${(y1 - y0) * H + 20}px">${[...Array(y1 - y0)].map((_, i) => `<div class="hr" style="top:${i * H + 10}px"><span>${y0 + i}</span></div>`).join('')}
        ${roles.map((e, i) => { const s = span(e); const a = (s.start.y - y0 + s.start.m / 12) * H + 10, b = (s.end.y - y0 + (s.end.m + 1) / 12) * H + 10; return `<button type="button" class="ev" data-i="${i}" style="top:${a}px;height:${Math.max(22, b - a - 2)}px;left:${i % 2 ? 150 : 56}px">${esc(e.short)}<span>${esc(e.role)}</span></button>`; }).join('')}</div>`;
      pg.addEventListener('click', (ev) => {
        const b = ev.target.closest('.ev');
        if (b) { SFX.click(); const e = roles[+b.dataset.i]; app.push(e.short, roleDetail(e), { back: 'Calendar' }); }
        const y = ev.target.closest('[data-y]');
        if (y) pg.scrollBy({ top: +y.dataset.y * H * 2, behavior: 'smooth' });
      });
    };
    const monthView = (pg) => {
      const draw = () => {
        const y = month.getFullYear(), m = month.getMonth();
        const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate(), prevDays = new Date(y, m, 0).getDate();
        const marks = {};
        const add = (d, t) => { (marks[d] = marks[d] || []).push(t); };
        P.experience.forEach((e) => { const s = span(e); if (s.start.y === y && s.start.m === m) add(1, `${e.short} started`); if (s.end.y === y && s.end.m === m) add(days, `${e.short} wrapped up`); });
        if (y === 2026 && m === 11) add(15, 'Graduates from UF');
        mine.forEach((ev) => { const d = new Date(ev.ts); if (d.getFullYear() === y && d.getMonth() === m) add(d.getDate(), ev.t); });
        const t = now();
        const cells = [];
        for (let i = 0; i < 42; i++) {
          const d = i - first + 1;
          const inM = d >= 1 && d <= days;
          const label = inM ? d : d < 1 ? prevDays + d : d - days;
          const today = inM && y === t.getFullYear() && m === t.getMonth() && d === t.getDate();
          cells.push(`<button type="button" class="cd${inM ? '' : ' out'}${today ? ' today' : ''}" data-d="${inM ? d : ''}">${label}${inM && marks[d] ? '<i></i>' : ''}</button>`);
        }
        const rows = Math.ceil((first + days) / 7);
        pg.innerHTML = `<div class="cal-mh"><button type="button" data-m="-1">◀</button><b>${month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</b><button type="button" data-m="1">▶</button></div><div class="cal-wd">${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((w) => `<span>${w}</span>`).join('')}</div><div class="cal-grid">${cells.slice(0, rows * 7).join('')}</div><ul class="pl cal-ev"></ul>`;
        const evs = pg.querySelector('.cal-ev');
        const show = (d) => { evs.innerHTML = (marks[d] || []).map((x) => `<li><span class="cal-t">All-day</span><span class="tx">${esc(x)}</span></li>`).join('') || '<li class="none"><span class="tx">No events</span></li>'; };
        pg.querySelectorAll('.cd').forEach((c) => c.addEventListener('click', () => {
          if (!c.dataset.d) { month = new Date(y, m + (+c.textContent > 15 ? -1 : 1), 1); draw(); return; }
          pg.querySelectorAll('.cd').forEach((x) => x.classList.toggle('sel', x === c)); show(+c.dataset.d);
        }));
        pg.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => { month = new Date(y, m + +b.dataset.m, 1); draw(); }));
        show(Object.keys(marks)[0] || t.getDate());
      };
      draw();
    };
    const render = () => {
      const pg = app.vw.querySelector('.pg');
      pg.innerHTML = '';
      pg.className = 'pg';
      [listView, dayView, monthView][view](pg);
    };
    const control = seg(['List', 'Day', 'Month'], 0, (i) => { view = i; render(); });
    app.push('', (pg) => listView(pg), {
      seg: control,
      left: ['Today', () => { month = new Date(now().getFullYear(), now().getMonth(), 1); view = 2; control.querySelectorAll('button').forEach((b, k) => b.classList.toggle('on', k === 2)); render(); }],
      right: ['+', () => app.push('Add Event', (pg, a, entry) => {
        const [title, where] = form(pg, [['Title', 'Interview with Ajay'], ['Location', 'Your office, or a call']]);
        pg.insertAdjacentHTML('beforeend', `<div class="gp"><div class="row"><span class="k">Starts</span><span class="v n">${now().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span></div></div><div class="gl" style="text-align:center;font-size:14px">Done adds it here and drafts the invite.</div>`);
        setTimeout(() => title.focus(), 320);
        entry.opts.left = ['Cancel', () => app.pop()];
        entry.opts.right = ['Done', () => {
          const t = title.value || 'Interview with Ajay';
          mine.push({ t, d: now().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), ts: Date.now() });
          store.set('ip-events', mine);
          app.pop();
          render();
          mailto(t, `Hi Ajay,\n\n${t}${where.value ? ' at ' + where.value : ''}. When works for you?`);
        }];
        entry.opts.blue = true;
      })]
    });
  };

  /* Text messages: tap the field, type, Send, and it goes up the screen.
     A reply comes back. */
  const convo = {};
  const messages = (app) => {
    const REPLIES = [
      'Got it! Every message here is read. For a real answer, email me at ' + P.email + '.',
      'Ha, thanks. The fastest way to reach me is still email: ' + P.email,
      'Message received. I’ll take that as a yes on the interview.'
    ];
    const thread = (p, i) => {
      const [n, c, q] = P.recs[i];
      if (!convo[i]) convo[i] = [['in', q], ['out', `Thank you, ${n.split(' ')[0]}! That means a lot.`]];
      p.classList.add('sms-pg');
      p.innerHTML = `<div class="sms"><div class="day">${esc(c)}</div>${convo[i].map(([d, t]) => `<div class="bub ${d}"><span>${esc(t)}</span></div>`).join('')}</div><div class="sms-bar"><span class="sms-field"></span><button type="button" class="sms-send">Send</button></div>`;
      const box = p.querySelector('.sms');
      const send = p.querySelector('.sms-send');
      const add = (d, t) => {
        convo[i].push([d, t]);
        const b = h('div', `bub ${d} is-new`, `<span>${esc(t)}</span>`);
        box.appendChild(b);
        box.scrollTop = box.scrollHeight;
        SFX.click();
      };
      let replied = 0;
      const go = (x) => {
        const t = x.value.trim();
        if (!t) return;
        add('out', t);
        x.clear();
        setTimeout(() => add('in', REPLIES[replied++ % REPLIES.length]), 1100);
      };
      const f = field(p.querySelector('.sms-field'), { ret: 'Send', onEnter: (x) => go(x), onChange: (v) => send.classList.toggle('on', !!v.trim()) });
      send.addEventListener('click', () => go(f));
      setTimeout(() => { box.scrollTop = box.scrollHeight; }, 50);
    };
    app.push('Text Messages', (pg, a, entry) => {
      const ul = plain(pg, P.recs.map(([n, c, q], i) => ({ id: i, text: n, sub: q, rt: c.split(' ')[0], cls: 'sms-row', go: () => app.push(n.split(' ')[0], (p) => thread(p, i), { back: 'Messages', right: ['Clear', () => { convo[i] = []; app.stack[app.stack.length - 1].pg.querySelectorAll('.bub').forEach((b) => { b.classList.add('gone'); setTimeout(() => b.remove(), 250); }); }] }) })));
      editable(app, entry, ul);
    });
  };

  /* Notes: every note can be edited, new ones made, sent or thrown away. */
  const NOTES_DEFAULT = [
    ['About me', `${P.about[0]}\n\n${P.about[1]}`],
    ['Off the clock', `“${P.quote}”\n\nRepairs, teardowns and builds: see Builds.`],
    ['To do', `Graduate from UF (Dec 2026)\nFind a great team\nSay hi: ${P.email}`]
  ];
  const notesApp = (app) => {
    const notes = store.get('ip-notes', null) || NOTES_DEFAULT.map((n) => [...n]);
    const save = () => store.set('ip-notes', notes);
    const named = (n) => n[0] || (n[1].split('\n')[0] || 'New Note').slice(0, 28);
    const list = () => app.reset(`Notes (${notes.length})`, (pg, a, entry) => {
      pg.classList.add('note-list-pg');
      const ul = plain(pg, notes.map((n, i) => ({ id: i, text: named(n), rt: now().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), go: () => open(i), onDelete: () => { notes.splice(i, 1); save(); list(); } })));
      ul.classList.add('note-list');
      entry.opts.right = ['+', () => { notes.push(['', '']); save(); open(notes.length - 1, true); }];
      editable(app, entry, ul);
    });
    const open = (i, fresh) => app.push(named(notes[i]), (p, a, entry) => {
      p.classList.add('note-pg');
      const d = now();
      p.innerHTML = `<div class="note"><div class="d"><span>Today</span><span>${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} &nbsp;${hm(d)}</span></div><div class="note-body"></div></div><div class="note-tb"><button type="button" data-a="prev" aria-label="Previous note">⇦</button><button type="button" data-a="mail" aria-label="Email this note">✉</button><button type="button" data-a="trash" aria-label="Delete note"><svg viewBox="0 0 16 18" width="16" height="18"><path d="M2 4h12M6 4V2h4v2M3.5 4l1 12h7l1-12" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></button><button type="button" data-a="next" aria-label="Next note">⇨</button></div>`;
      field(p.querySelector('.note-body'), { value: notes[i][1], multi: true, onChange: (v) => { notes[i][1] = v; save(); } });
      if (fresh) setTimeout(() => p.querySelector('.note-body').click(), 340);
      p.querySelector('.note-tb').addEventListener('click', async (e) => {
        const b = e.target.closest('[data-a]');
        if (!b) return;
        SFX.click();
        const k = b.dataset.a;
        if (k === 'prev') { if (i > 0) { app.pop(); setTimeout(() => open(i - 1), 320); } else alertBox('First Note', 'There’s nothing before this one.'); }
        if (k === 'next') { if (i < notes.length - 1) { app.pop(); setTimeout(() => open(i + 1), 320); } else alertBox('Last Note', 'Tap + to start a new one.'); }
        if (k === 'mail') mailto(named(notes[i]), notes[i][1]);
        if (k === 'trash') {
          const r = await alertBox('Delete Note', 'This note will be thrown away.', ['Cancel', 'Delete']);
          if (r === 'Delete') { notes.splice(i, 1); save(); list(); }
        }
      });
      entry.opts.right = ['+', () => { notes.push(['', '']); save(); app.pop(); setTimeout(() => open(notes.length - 1, true), 320); }];
      entry.opts.onPop = () => setTimeout(list, 310);
    }, { back: 'Notes' });
    list();
  };

  /* Phone: Favorites, Recents, Contacts, Keypad and Voicemail all work.
     The keypad dials anything, and the network politely declines. */
  const phoneApp = (app) => {
    const card = store.get('ip-card', null) || { mobile: '(555) 252-9726', email: P.email, home: 'github.com/ajaysommi', work: 'linkedin.com/in/ajay-sommi', notes: 'Software engineer. Graduating December 2026.' };
    const allRecents = () => [...P.experience].reverse().map((e) => [e.short, e.where, e.when.split(' to ')[1] || e.when]);
    let recents = allRecents();
    const call = async (num) => {
      const digits = String(num).replace(/\D/g, '');
      if (!digits) { alertBox('Enter a Number', 'Dial something first. A-J-A-Y works.'); return; }
      if (digits === '2529' || digits === '5552529726') {
        const r = await alertBox('Calling Ajay…', 'He’s not on this network, but his inbox always picks up.', ['Dismiss', 'Email Ajay']);
        if (r === 'Email Ajay') mailto('Saw your portfolio');
        return;
      }
      if (digits === '911') { await alertBox('Emergency Calls Unavailable', 'This is a portfolio. In a real emergency, please use a real phone.'); return; }
      if (['1983', '1991', '1998', '2009'].includes(digits)) {
        const r = await alertBox('Time Machine', `Dialling ${digits} reaches another era. Go there?`, ['Cancel', 'Go']);
        if (r === 'Go') exit();
        return;
      }
      const r = await alertBox('Cellular Network Not Available', 'This iPhone only runs on the SOMMI network. Try E-mail instead, or dial A-J-A-Y.', ['Dismiss', 'E-mail']);
      if (r === 'E-mail') mailto('Hello from your portfolio');
    };
    const F = [['mobile', 'mobile'], ['email', 'email'], ['home page', 'home'], ['work', 'work'], ['notes', 'notes']];
    const showCard = (edit) => (pg, a, entry) => {
      pg.classList.add('pin');
      pg.innerHTML = `<div class="ct-head"><img src="${P.photo}" alt="" /><div><b>Ajay Sommi</b><span>${esc(P.title)}</span></div></div>
        <div class="gp">${F.map(([k, f]) => `<div class="row${edit ? ' frm' : ' chev'}" data-k="${f}"><span class="k">${esc(k)}</span><span class="v n" data-v="${f}">${esc(card[f])}</span></div>`).join('')}</div>
        ${edit ? '' : '<div class="ct-btns"><button class="gbtn" type="button" data-act="text">Text Message</button><button class="gbtn" type="button" data-act="fav">Add to Favorites</button></div>'}`;
      const fields = {};
      if (edit) F.forEach(([, f]) => { fields[f] = field(pg.querySelector(`[data-v="${f}"]`), { value: card[f], ret: 'Next' }); });
      pg.addEventListener('click', (e) => {
        if (edit) return;
        const r = e.target.closest('[data-k]');
        if (r) { const f = r.dataset.k; if (f === 'mobile') call(card.mobile); else if (f === 'email') mailto('Hello'); else if (f === 'home') ext(P.github); else if (f === 'work') ext(P.linkedin); else alertBox('Notes', esc(card.notes)); }
        const act = e.target.closest('[data-act]');
        if (act && act.dataset.act === 'text') { closeApp(); setTimeout(() => openApp('guestbook', null), 360); }
        if (act && act.dataset.act === 'fav') alertBox('Added to Favorites', 'Ajay is already your favourite. Good choice.');
      });
      entry.opts.right = [edit ? 'Done' : 'Edit', () => {
        if (edit) { Object.keys(fields).forEach((f) => { card[f] = fields[f].value; }); store.set('ip-card', card); }
        app.reset('Info', showCard(!edit));
      }];
      entry.opts.blue = edit;
      if (edit) entry.opts.left = ['Cancel', () => app.reset('Info', showCard(false))];
    };
    const keypad = (pg) => {
      pg.classList.add('kp-pg');
      const L = ['', 'ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQRS', 'TUV', 'WXYZ'];
      pg.innerHTML = `<div class="kp-num"></div><div class="kp-grid">${'123456789*0#'.split('').map((k, i) => `<button type="button" data-k="${k}"><b>${k}</b><span>${i < 9 ? L[i] : k === '0' ? '+' : ''}</span></button>`).join('')}<button type="button" class="kp-add" data-a="add" aria-label="Add contact"><svg viewBox="0 0 30 22" width="30" height="22"><path d="M18 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10zM8 21c1-5 5-7 10-7s9 2 10 7zM6 6v3H3v2h3v3h2v-3h3V9H8V6z" fill="currentColor"/></svg></button><button type="button" class="kp-call" data-a="call"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M6.6 2.5c1.2-.8 2.4-.2 2.8 1l.9 2.4c.4 1.1-.2 1.8-1.1 2.3.5 2.1 2.1 4 4.1 4.9.5-.8 1.3-1.5 2.5-1.1l2.3 1c1.3.6 1.7 1.8.9 2.9-1 1.6-3 2.4-5 1.7C8.4 16 4.7 12.3 3.4 8 2.8 5.9 3.7 3.7 6.6 2.5z" fill="#fff"/></svg>Call</button><button type="button" class="kp-del" data-a="del" aria-label="Delete">⌫</button></div>`;
      let num = '';
      const out = pg.querySelector('.kp-num');
      const fmt = (d) => d.length <= 3 ? d : d.length <= 7 ? `${d.slice(0, 3)}-${d.slice(3)}` : d.length <= 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : d;
      const draw = () => { out.textContent = /^\d+$/.test(num) ? fmt(num) : num; };
      pg.addEventListener('click', (e) => {
        const k = e.target.closest('[data-k]');
        if (k) { num += k.dataset.k; draw(); SFX.beep(); return; }
        const a = e.target.closest('[data-a]');
        if (!a) return;
        if (a.dataset.a === 'del') { num = num.slice(0, -1); draw(); }
        if (a.dataset.a === 'call') call(num);
        if (a.dataset.a === 'add') alertBox('Add to Contacts', num ? `${esc(fmt(num))} is saved. Ajay is still the only contact worth having.` : 'Dial a number first.');
      });
      draw();
    };
    const voicemail = (pg) => {
      pg.innerHTML = '<div class="vm-player"><button type="button" class="vm-play" aria-label="Play">▶</button><div class="vm-bar"><i></i></div><span class="vm-t">0:00</span></div><div class="vm-text">Tap a message to play it.</div>';
      const ul = plain(pg, P.recs.map(([n, c, q], i) => ({ id: i, text: n, sub: c, rt: `0:${String(20 + q.length % 39).padStart(2, '0')}`, cls: 'vm-row' })));
      const text = pg.querySelector('.vm-text'), bar = pg.querySelector('.vm-bar i'), t = pg.querySelector('.vm-t');
      let timer = 0, cur = 0;
      const play = (i) => {
        cur = i;
        ul.querySelectorAll('li').forEach((x, k) => { x.classList.toggle('sel', k === i); if (k === i) x.classList.add('heard'); });
        clearInterval(timer);
        const q = P.recs[i][2];
        let k = 0;
        text.textContent = '';
        timer = setInterval(() => { k += 2; text.textContent = q.slice(0, k); bar.style.width = Math.min(100, k / q.length * 100) + '%'; t.textContent = `0:${String(Math.round(k / 6)).padStart(2, '0')}`; if (k >= q.length) clearInterval(timer); }, 30);
      };
      ul.querySelectorAll('li').forEach((li, i) => li.addEventListener('click', () => play(i)));
      pg.querySelector('.vm-play').addEventListener('click', () => play(cur));
      app.def.onClose = () => clearInterval(timer);
    };
    const favorites = (pg, a, entry) => {
      const ul = plain(pg, [{ text: 'Ajay Sommi', rt: 'mobile', go: () => call(card.mobile) }, { text: 'Ajay Sommi', rt: 'email', go: () => mailto('Hello') }]);
      editable(app, entry, ul);
      entry.opts.right = ['+', () => alertBox('Add Favorite', 'Your only option is Ajay, and he’s already here.')];
    };
    const recentsPage = (pg, a, entry) => {
      const draw = () => { pg.innerHTML = ''; plain(pg, recents.length ? recents.map(([n, w, d]) => ({ text: n, sub: w, rt: d, go: () => call('0') })) : [{ text: 'No Recents', cls: 'none' }]); };
      draw();
      entry.opts.seg = seg(['All', 'Missed'], 0, (i) => { recents = i ? allRecents().filter((_, k) => k % 3 === 0) : allRecents(); draw(); }, 'small');
      entry.opts.right = ['Clear', async () => { const r = await alertBox('Clear All Recents', '', ['Cancel', 'Clear All Recents']); if (r !== 'Cancel') { recents = []; draw(); } }];
    };
    tabs(app, [['Favorites', TAB.star], ['Recents', TAB.clock], ['Contacts', TAB.person], ['Keypad', TAB.keypad], ['Voicemail', TAB.vm]], 2, (i) => {
      app.el.classList.toggle('no-nb', i === 3);
      [() => app.reset('Favorites', favorites), () => app.reset('Recents', recentsPage), () => app.reset('Info', showCard(false)), () => app.reset('', keypad), () => app.reset('Voicemail', voicemail, { left: ['Greeting', () => alertBox('Greeting', '“Hi, you’ve reached Ajay. Leave a message, or better, an offer.”')] })][i]();
    });
  };

  /* Mail: Mailboxes, the inbox, reading, replying and writing. */
  const mailApp = (app) => {
    const M = [
      ['Ajay Sommi', 'Let’s talk', `Hi there,\n\nThanks for stopping by. I’m a software engineer graduating from UF in December 2026, and I’m looking for a team that cares about the people using what it builds.\n\nReply to this and it goes straight to me.\n\nAjay`],
      ['GitHub', 'Your repositories', 'SommiScript, GatorGoods, BalanceTree and more are at github.com/ajaysommi.'],
      ['LinkedIn', 'Recommendations', `${P.recs.length} people have written recommendations for Ajay. Read them in Guestbook.`]
    ];
    const sent = [];
    const compose = (to, subject) => app.push('New Message', (pg, a, entry) => {
      pg.classList.add('ml-new');
      pg.innerHTML = `<div class="ml-row"><span>To:</span><b class="ml-tok">${esc(to)}</b></div><div class="ml-row"><span>Subject:</span><span class="v" data-s></span></div><div class="ml-body" data-b></div>`;
      const b = field(pg.querySelector('[data-b]'), { multi: true });
      const s = field(pg.querySelector('[data-s]'), { value: subject || '', ret: 'Next', onEnter: () => b.focus() });
      setTimeout(() => b.focus(), 340);
      entry.opts.left = ['Cancel', () => app.pop()];
      entry.opts.right = ['Send', () => { sent.push([s.value || '(no subject)', b.value]); app.pop(); mailto(s.value, b.value); }];
      entry.opts.blue = true;
    });
    const inbox = (pg, a, entry) => {
      const ul = plain(pg, M.map(([f, s, body], i) => ({ id: i, text: f, sub: `${s} — ${body.replace(/\n/g, ' ')}`, rt: i ? 'Oct 2026' : hm(now()), cls: i || store.get('ip-read', false) ? '' : 'unread', go: () => { store.set('ip-read', true); app.push(s, (p) => {
        p.innerHTML = `<div class="ml-h">From: <b>${esc(f)}</b><br/>Subject: <b>${esc(s)}</b></div><div class="ml-b">${esc(body).replace(/\n/g, '<br/>')}</div>`;
      }, { right: ['Reply', () => compose(P.email, 'Re: ' + s)], blue: true, back: 'Inbox' }); } })));
      entry.opts.right = ['Edit', () => { const on = ul.classList.toggle('editing'); entry.opts.right = [on ? 'Done' : 'Edit', entry.opts.right[1]]; entry.opts.blue = on; app.redraw(); }];
    };
    const box = (name, rows) => app.push(name, (pg) => { plain(pg, rows.length ? rows : [{ text: 'No Mail', cls: 'none' }]); }, { back: 'Mailboxes' });
    app.push('Mailboxes', (pg) => plain(pg, [
      { text: 'Inbox', rt: '1', go: () => app.push('Inbox (1)', inbox, { back: 'Mailboxes' }) },
      { text: 'Drafts', go: () => box('Drafts', [{ text: 'Offer letter', sub: 'Dear Ajay, we’d love to have you…', go: () => compose(P.email, 'Offer') }]) },
      { text: 'Sent', go: () => box('Sent', sent.map(([s, b]) => ({ text: s, sub: b }))) },
      { text: 'Trash', go: () => box('Trash', [{ text: 'Old resume (2019)', sub: 'Listed “Microsoft Word” as a skill. Deleted.' }]) }
    ]));
    app.push('Inbox (1)', inbox, { instant: true, back: 'Mailboxes' });
    app.el.appendChild(h('div', 'ml-tb', '<button type="button" data-a="r" aria-label="Check mail">↻</button><span>Updated just now</span><button type="button" data-a="c" aria-label="Compose">✎</button>'));
    app.el.querySelector('.ml-tb').addEventListener('click', (e) => { const b = e.target.closest('[data-a]'); if (!b) return; SFX.click(); if (b.dataset.a === 'c') compose(P.email, ''); else alertBox('No New Mail', 'Ajay’s inbox is the one that matters. Write to it.'); });
  };

  const APPS = {
    guestbook: { name: 'Guestbook', icon: 'sms', open: messages },
    experience: { name: 'Experience', icon: 'calendar', open: calendar },
    builds: { name: 'Builds', icon: 'photos', cls: 'is-photos', open(app) {
      app.push('Photo Albums', (pg) => plain(pg, P.offclock.map((s) => ({ text: `${s.name} (${s.steps.length})`, img: s.cover, cls: 'alb', go: () => app.push(s.name, (p) => {
        p.classList.add('ph-pg');
        p.innerHTML = `<div class="grid4">${s.steps.map((st, k) => `<img src="${st[0]}" data-k="${k}" alt="${esc(st[1])}" />`).join('')}</div><div class="ph-lede">${esc(s.lede)}</div>`;
        p.addEventListener('click', (ev) => { const im = ev.target.closest('img[data-k]'); if (im) viewer(app, s, +im.dataset.k); });
      }, { right: ['Play', () => viewer(app, s, 0).play()] }) }))));
    } },
    about: { name: 'About Me', icon: 'camera', bare: true, bar: 'black', open(app) {
      app.el.innerHTML = `<div class="cam" style="background-image:url(${WALL})"><div class="iris">${[0, 1, 2, 3, 4, 5].map((i) => `<i style="--r:${i * 60}deg;transform:rotate(${i * 60}deg)"></i>`).join('')}</div><div class="flash"></div>
        <div class="cam-card"><b>Ajay Sommi</b><span>${esc(P.title)} · ${esc(P.citizen)}</span><p>${esc(P.about[1])}</p></div>
        <div class="bar"><button class="roll" type="button" aria-label="Camera Roll"><img src="${P.photo}" alt="" /></button><button class="shut" type="button" aria-label="Take picture"><svg viewBox="0 0 30 22" width="30" height="22"><rect x="2" y="5" width="26" height="16" rx="3" fill="#333"/><circle cx="15" cy="13" r="5.5" fill="#bbb" stroke="#333" stroke-width="2"/><rect x="10" y="2" width="10" height="4" rx="1" fill="#333"/></svg></button><span class="roll-sp"></span></div></div>`;
      const cam = app.el.querySelector('.cam');
      setTimeout(() => cam.classList.add('is-open'), 250);
      app.el.querySelector('.shut').addEventListener('click', () => {
        const f = app.el.querySelector('.flash');
        SFX.insert();
        f.classList.add('on');
        cam.classList.remove('is-open');
        setTimeout(() => { f.classList.remove('on'); cam.classList.add('is-open'); }, 500);
      });
      app.el.querySelector('.roll').addEventListener('click', () => { closeApp(); setTimeout(() => openApp('builds', null), 360); });
    } },
    projects: { name: 'Projects', icon: 'tv', cls: 'is-yt', bar: 'black', nb: 'black', open(app) {
      const row = (p) => ({ text: p.name, sub: p.stack, cls: 'yt-row', lead: `<span class="yt-th" style="--h:${P.projects.indexOf(p) * 57 + 200}">${esc(p.name.slice(0, 2))}</span>`, go: () => app.push(p.name, (x) => {
        x.classList.add('pin');
        x.innerHTML = `${group([['', `${esc(p.full)}<br/><span style="font-weight:normal;color:#4c566c">${esc(p.kind)}</span>`]])}<div class="gp"><div class="txt">${esc(p.text)}</div></div>${group([['stack', esc(p.stack), 1]])}${p.url ? '<button class="gbtn" type="button" data-go>View on GitHub</button>' : '<div class="gl" style="text-align:center">Source is private for now</div>'}`;
        const b = x.querySelector('[data-go]');
        if (b) b.addEventListener('click', () => ext(p.url));
      }) });
      tabs(app, [['Featured', TAB.star], ['Most Viewed', TAB.bars], ['Bookmarks', TAB.book], ['Search', TAB.search], ['More', TAB.more]], 0, (i) => {
        if (i === 0) app.reset('Featured', (pg) => plain(pg, P.projects.map(row)));
        if (i === 1) app.reset('Most Viewed', (pg) => plain(pg, [...P.projects].reverse().map(row)));
        if (i === 2) app.reset('Bookmarks', (pg) => plain(pg, P.projects.filter((p) => p.url).map(row)));
        if (i === 3) app.reset('Search', (pg) => {
          pg.innerHTML = '<div class="srch"><span class="srch-f"></span></div><div class="srch-res"></div>';
          const res = pg.querySelector('.srch-res');
          const draw = (q) => { res.innerHTML = ''; plain(res, P.projects.filter((p) => !q || (p.full + p.stack + p.text).toLowerCase().includes(q.toLowerCase())).map(row)); };
          field(pg.querySelector('.srch-f'), { placeholder: 'Search projects', ret: 'Search', onChange: draw, onEnter: () => kb.hide() });
          setTimeout(() => pg.querySelector('.srch-f').click(), 120);
        });
        if (i === 4) app.reset('More', (pg) => plain(pg, [{ text: 'GitHub', go: () => ext(P.github) }, { text: 'LinkedIn', go: () => ext(P.linkedin) }, { text: 'Classic website', go: () => ext('classic.html') }, { text: 'Resume', go: () => ext(P.resume) }]));
      });
    } },
    impact: { name: 'Impact', icon: 'stocks', bare: true, bar: 'black', open(app) {
      const T = [
        ['CLAIMS', '20%', '-20%', 'dn', 'toyota', 'Tire warranty claims cut by catching costly recalls early.'],
        ['SAVED', '$150K', '+150K', 'up', 'toyota', 'Saved on prevented tire package recalls.'],
        ['ENTRY', '5×', '+400%', 'up', 'toyota', 'Data entry made five times faster with a live dashboard.'],
        ['HOURS', '350/yr', '+350', 'up', 'toyota', 'Hours a year saved by automating a file transfer.'],
        ['UNITS', '100K+', '+100K', 'up', 'hunter', 'Alignment machines that can now be reset remotely, worldwide.'],
        ['EVENTS', '100K+', '+100K', 'up', 'jm', 'Dealership events analysed by a service built at JM Family.'],
        ['SEARCH', '+20%', '+20%', 'up', 'shiva', 'Search visits grown in one summer.']
      ];
      const R = [['1y', 6], ['2y', 10], ['3y', 14], ['5y', 20], ['7y', 28]];
      let sel = 0, range = 4;
      app.el.innerHTML = `<div class="stk"><div class="stk-list">${T.map(([s, v, c, d], i) => `<button type="button" class="row${i === 0 ? ' on' : ''}" data-i="${i}"><span class="s">${s}</span><span class="p">${v}</span><span class="c ${d}">${c}</span></button>`).join('')}</div><div class="stk-panel"><div class="stk-tabs">${R.map(([r], i) => `<button type="button" class="${i === 4 ? 'on' : ''}" data-r="${i}">${r}</button>`).join('')}</div><svg viewBox="0 0 280 90" preserveAspectRatio="none"></svg><div class="stk-ax"><span>2019</span><span>2021</span><span>2023</span><span>2026</span></div><p class="stk-d"></p></div><div class="stk-foot"><button type="button" data-a="aj">AJ</button><span>Updated today</span><button type="button" data-a="i">i</button></div></div>`;
      const svg = app.el.querySelector('.stk-panel svg'), d = app.el.querySelector('.stk-d');
      const show = () => {
        const [s, v, , dir, rid, text] = T[sel];
        const e = P.experience.find((x) => x.id === rid);
        const n = R[range][1];
        let pts = '', y = dir === 'up' ? 78 : 18;
        for (let k = 0; k <= n; k++) { y = Math.max(6, Math.min(84, y + (Math.sin(k * 1.9 + sel) * 7) - (dir === 'up' ? 60 / n : -60 / n))); pts += `${(k * 280 / n).toFixed(1)},${y.toFixed(1)} `; }
        svg.innerHTML = `${[20, 45, 70].map((g) => `<line x1="0" x2="280" y1="${g}" y2="${g}" stroke="#fff" stroke-opacity=".15"/>`).join('')}<polyline points="${pts}" fill="none" stroke="#fff" stroke-width="1.6"/>`;
        d.innerHTML = `<b>${s} ${v}</b> · ${esc(e.org)}, ${e.year}<br/>${esc(text)}`;
        app.el.querySelectorAll('.stk .row').forEach((r, k) => r.classList.toggle('on', k === sel));
        app.el.querySelectorAll('.stk-tabs button').forEach((r, k) => r.classList.toggle('on', k === range));
      };
      app.el.addEventListener('click', (ev) => {
        const r = ev.target.closest('.row'); if (r) { SFX.click(); sel = +r.dataset.i; show(); return; }
        const t = ev.target.closest('[data-r]'); if (t) { SFX.click(); range = +t.dataset.r; show(); return; }
        const a = ev.target.closest('[data-a]');
        if (a && a.dataset.a === 'i') alertBox('About Impact', 'Real numbers from Ajay’s internships. Past performance is a strong indicator of future results.');
        if (a && a.dataset.a === 'aj') { closeApp(); setTimeout(() => openApp('experience', null), 360); }
      });
      show();
    } },
    places: { name: 'Places', icon: 'maps', bare: true, bar: 'gray', open(app) {
      const US = [[-124.7, 48.4], [-124, 42], [-122.4, 37.8], [-120.6, 34.6], [-117.1, 32.5], [-114.7, 32.7], [-111, 31.3], [-106.5, 31.8], [-103, 29], [-99.5, 26.4], [-97.2, 25.9], [-97.4, 27.8], [-94.7, 29.4], [-90, 29.2], [-89, 30.2], [-85, 29.7], [-83, 29], [-82.5, 27.5], [-81.7, 25.2], [-80.4, 25.2], [-80, 26.8], [-81.2, 30.3], [-79, 33.6], [-75.5, 35.3], [-76, 37], [-74, 40.5], [-70, 41.6], [-70.5, 43], [-67, 44.8], [-67.8, 47.1], [-69.2, 47.4], [-71.5, 45], [-75, 45], [-79, 43.3], [-83, 42], [-82.5, 45.3], [-84.6, 46.5], [-88, 48], [-95, 49], [-123, 49]];
      const X = (lon) => (lon + 126) / 60 * 320, Y = (lat) => (50 - lat) / 26 * 177 * 1.25;
      const CITIES = [['Jacksonville, FL', 30.33, -81.66, 'rjax'], ['Palo Alto, CA', 37.44, -122.14, 'rfa'], ['Gainesville, FL', 29.65, -82.32, 'fics'], ['Deerfield Beach, FL', 26.32, -80.1, 'jm'], ['St. Louis, MO', 38.63, -90.2, 'hunter'], ['Boca Raton, FL', 26.0, -80.13, 'adt']];
      app.el.innerHTML = `<div class="map" style="top:20px"><div class="map-bar"><span class="mb-f"></span></div><svg viewBox="0 0 320 240" height="240"><path d="M${US.map(([a, b]) => `${X(a).toFixed(1)} ${Y(b).toFixed(1)}`).join('L')}Z" fill="#f2efe9" stroke="#c9c0ad"/><path d="M${X(-120)} ${Y(47)}L${X(-90)} ${Y(41)}L${X(-80)} ${Y(35)}M${X(-117)} ${Y(33)}L${X(-97)} ${Y(32)}L${X(-82)} ${Y(30)}" stroke="#f3c64c" stroke-width="1.6" fill="none"/></svg>${CITIES.map(([n, la, lo], i) => `<button class="pin-d" type="button" data-i="${i}" style="left:${X(lo)}px;top:${32 + Y(la)}px;animation-delay:${i * 0.12}s" aria-label="${esc(n)}"></button>`).join('')}<div class="tbar map-tb"><button type="button" data-a="loc" aria-label="Show where I am">➤</button><button type="button" data-list>List</button></div></div>`;
      const map = app.el.querySelector('.map');
      const callout = (i) => {
        map.querySelectorAll('.callout').forEach((c) => c.remove());
        const p = map.querySelector(`.pin-d[data-i="${i}"]`);
        const [n, , , id] = CITIES[i];
        const e = P.experience.find((x) => x.id === id);
        const c = h('div', 'callout', `${esc(e.short)}<span>${esc(n)} · ${e.year}</span>`);
        c.style.left = p.style.left; c.style.top = p.style.top;
        map.appendChild(c);
      };
      field(map.querySelector('.mb-f'), { placeholder: 'Search places I’ve worked', ret: 'Search', onEnter: (f) => {
        const q = f.value.toLowerCase().trim();
        const i = CITIES.findIndex(([n, , , id]) => (n + ' ' + P.experience.find((x) => x.id === id).org).toLowerCase().includes(q));
        kb.hide();
        if (q && i >= 0) callout(i); else alertBox('No Results Found', `Ajay hasn’t worked in “${esc(f.value)}” yet. Maybe that’s next.`);
      } });
      map.addEventListener('click', (ev) => {
        const p = ev.target.closest('.pin-d');
        if (p) { SFX.click(); callout(+p.dataset.i); }
        if (ev.target.closest('[data-a="loc"]')) { SFX.click(); callout(5); }
        if (ev.target.closest('[data-list]')) {
          const l = h('div', 'pg');
          l.style.top = '32px'; l.style.bottom = '44px'; l.style.zIndex = 3;
          plain(l, CITIES.map(([n, , , id], i) => { const e = P.experience.find((x) => x.id === id); return { text: e.short, sub: n, rt: String(e.year), go: () => { l.remove(); callout(i); } }; }));
          map.appendChild(l);
        }
      });
    } },
    education: { name: 'Education', icon: 'weather', bare: true, bar: 'black', open(app) {
      const e = P.education;
      const W = [['OPERATING SYS.', '☀', 'A'], ['DATABASES', '⛅', 'A'], ['ALGORITHMS', '☀', 'A'], ['SOFTWARE ENG.', '☁', 'A'], ['A.I.', '☀', 'A'], ['SECURITY', '⚡', 'A']];
      app.el.style.background = '#000';
      app.el.innerHTML = `<div class="wx"><div class="wx-card"><div class="wx-sun"></div><div class="hd"><div class="city">Gainesville</div><div class="hi">UF · Class of Dec 2026</div><div class="tmp">26°</div></div>
        <ul>${W.map(([d, i, g]) => `<li><span class="dd">${d}</span><span class="ii">${i}</span><span class="gg">${g}</span></li>`).join('')}</ul>
        <div class="wx-foot"><button type="button" data-a="uf">UF</button><span>${esc(e.degree)}</span><button type="button" data-a="i">i</button></div></div></div>`;
      app.el.addEventListener('click', (ev) => {
        const a = ev.target.closest('[data-a]');
        if (!a) return;
        SFX.click();
        if (a.dataset.a === 'i') alertBox('Forecast', `${esc(e.degree)}, ${esc(e.college)}.<br/>AI Certificate: 100% chance.`);
        else ext('https://www.ufl.edu');
      });
    } },
    skills: { name: 'Skills', icon: 'settings', open(app) {
      const ICO = [['#3d7fe0', '⌨'], ['#5aa0e8', '☁'], ['#8a6ad8', '⧉'], ['#2fa36a', '⇄'], ['#f08b2a', '⚒'], ['#d24b4b', '♥']];
      app.push('Settings', (pg) => {
        pg.classList.add('pin');
        pg.innerHTML = `<div class="gp"><div class="row sw-row">${mini('#f0941d', '✈')}<span class="v">Open to Work</span>${toggle(true, 'work')}</div><div class="row sw-row">${mini('#7a7a7a', '♪')}<span class="v">Sound</span>${toggle(!SFX.muted, 'sound')}</div></div>
          <div class="gp">${P.skills.map(([gname, list], i) => `<div class="row chev" data-s="${i}">${mini(ICO[i][0], ICO[i][1])}<span class="v">${esc(gname)}</span><span class="rv">${list.length}</span></div>`).join('')}</div>
          <div class="gp"><div class="row chev" data-k="wall">${mini('#5f8f4a', '❀')}<span class="v">Wallpaper</span></div><div class="row chev" data-k="about">${mini('#8e8e8e', '⚙')}<span class="v">General</span></div><div class="row chev" data-k="switch">${mini('#c98a2e', '⇄')}<span class="v">Switch Era</span></div></div>`;
        pg.addEventListener('click', (ev) => {
          const sw = ev.target.closest('[data-sw]');
          if (sw) {
            if (sw.dataset.sw === 'sound') { SFX.toggle(); sw.classList.toggle('on', !SFX.muted); sw.setAttribute('aria-checked', String(!SFX.muted)); }
            else { sw.classList.remove('on'); setTimeout(() => { sw.classList.add('on'); alertBox('Nice Try', 'Ajay is always open to work. This switch is stuck on.'); }, 250); }
            return;
          }
          const r = ev.target.closest('.row');
          if (!r) return;
          SFX.click();
          if (r.dataset.k === 'switch') { exit(); return; }
          if (r.dataset.k === 'wall') { app.push('Wallpaper', (p) => { p.innerHTML = `<div class="wall-pv" style="background-image:url(${WALL})"></div>`; }); return; }
          if (r.dataset.k === 'about') {
            const photos = P.experience.reduce((a, e) => a + e.photos.length, 0) + P.offclock.reduce((a, s) => a + s.steps.length, 0);
            app.push('General', (p) => {
              p.classList.add('pin');
              p.innerHTML = `<div class="gp"><div class="row chev" data-ab>${mini('#8e8e8e', 'i')}<span class="v">About</span></div><div class="row chev" data-rs>${mini('#d24b4b', '↺')}<span class="v">Reset</span></div></div>`;
              p.addEventListener('click', async (e2) => {
                if (e2.target.closest('[data-ab]')) app.push('About', (q) => { q.classList.add('pin'); q.innerHTML = kv([['Name', 'Ajay Sommi'], ['Roles', String(P.experience.length)], ['Projects', String(P.projects.length)], ['Photos', String(photos)], ['Skills', String(P.skills.reduce((a, s) => a + s[1].length, 0))], ['Capacity', '1 portfolio'], ['Available', 'Dec 2026'], ['Version', '1.0 (26A543a)'], ['Model', 'AJ-26']]); });
                if (e2.target.closest('[data-rs]')) {
                  const rr = await alertBox('Reset All Settings', 'Your notes, events and edits on this phone will be cleared.', ['Cancel', 'Reset']);
                  if (rr === 'Reset') { ['ip-notes', 'ip-events', 'ip-card', 'ip-read'].forEach((k) => store.set(k, null)); alertBox('Reset Complete', 'Everything is back to how Ajay left it.'); }
                }
              });
            });
          } else if (r.dataset.s) {
            const [gname, list] = P.skills[+r.dataset.s];
            app.push(gname, (p) => { p.classList.add('pin'); p.innerHTML = group(list.map((s) => { const at = usedAt(s); return ['', `${esc(s)}${at.length ? `<br/><span style="font-weight:normal;font-size:13px;color:#385487">${esc(at.join(', '))}</span>` : ''}`]; })); });
          }
        });
      });
    } },
    notes: { name: 'Notes', icon: 'notes', nb: 'notes', open: notesApp },
    portfolio: { name: 'Portfolio', icon: 'clipAJ', bare: true, bar: 'gray', open(app) { safari(app, 'classic.html', 'ajaysommi.github.io'); } },
    github: { name: 'GitHub', icon: 'clipGH', link: P.github },
    linkedin: { name: 'LinkedIn', icon: 'clipIN', link: P.linkedin },
    contact: { name: 'Contact', icon: 'phone', open: phoneApp },
    email: { name: 'Email', icon: 'mail', open: mailApp },
    resume: { name: 'Resume', icon: 'safari', bare: true, bar: 'gray', open(app) { safari(app, P.resume + '#view=FitH', 'ajaysommi.github.io/' + P.resume); } }
  };

  const viewer = (app, s, k) => {
    const v = h('div', 'photo-view');
    let auto = 0;
    const draw = () => { v.innerHTML = `<div class="pv-top"><button type="button" data-x>Done</button><b>${k + 1} of ${s.steps.length}</b><span></span></div><img src="${s.steps[k][0].replace('-480', '-960')}" alt="${esc(s.steps[k][1])}" /><div class="cap"><b>${esc(s.steps[k][1])}</b>${esc(s.steps[k][2])}</div><div class="tbar"><button type="button" data-d="-1">◀</button><button type="button" data-p>${auto ? '❙❙' : '▶'}</button><button type="button" data-d="1">▶▶</button></div>`; };
    const step = (d) => { k = (k + d + s.steps.length) % s.steps.length; draw(); };
    draw();
    v.addEventListener('click', (ev) => {
      const b = ev.target.closest('button');
      if (!b) return;
      if (b.hasAttribute('data-x')) { clearInterval(auto); v.remove(); setBar('gray'); return; }
      if (b.hasAttribute('data-p')) { if (auto) { clearInterval(auto); auto = 0; } else auto = setInterval(() => step(1), 2200); draw(); return; }
      step(+b.dataset.d);
    });
    let x0 = null;
    v.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    v.addEventListener('pointerup', (e) => { if (x0 !== null && Math.abs(e.clientX - x0) > 40) step(e.clientX < x0 ? 1 : -1); x0 = null; });
    app.el.appendChild(v);
    setBar('black');
    return { play() { auto = setInterval(() => step(1), 2200); draw(); } };
  };

  /* ----------------------------------------------------------- springboard */

  /* The original grid: icons 57 points square, columns 75 apart starting
     19 in, rows 90 apart starting 19 under the status bar. */
  const GRID = ['guestbook', 'experience', 'builds', 'about', 'projects', 'impact', 'places', 'education', 'skills', 'notes', 'github', 'linkedin'];
  const DOCK = ['contact', 'email', 'resume', 'portfolio'];
  const iconBtn = (id) => {
    const b = h('button', 'ip-icon', `<span class="ic">${ICON[APPS[id].icon]()}</span><span class="lbl">${esc(APPS[id].name)}</span>`);
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
  const flyOut = () => { board.classList.add('is-flying'); drawBoard(); };

  /* ------------------------------------------------------------- unlocking */

  let drag = null;
  const MAXX = 278 - 2 - 67.5 - 8;
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
    slideTxt.style.opacity = String(Math.max(0, 1 - x / 70));
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
    kb.hide();
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
    if (state === 'locked') knob.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(16px)' }, { transform: 'translateX(0)' }], { duration: 380, easing: 'ease-out' });
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
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && state === 'app' && shown()) { if (kb.target) kb.hide(); else closeApp(); } });
  /* Tapping anywhere outside a field puts the keyboard away. */
  scr.addEventListener('click', (e) => { if (kb.target && !e.target.closest('.kb, .fld, .nbb, .sms-send')) kb.hide(); });

  /* ------------------------------------------------------------------ boot */

  /* The silver mark: it settles, a shine crosses it, a sparkle glints on
     its corner, then it swells and fades into the lock screen. */
  drawBoard();
  (window.READY || Promise.resolve()).then(() => {
    boot.classList.add('is-on');
    setTimeout(() => boot.classList.add('is-shine'), 700);
    setTimeout(() => boot.classList.add('is-out'), 2300);
    setTimeout(() => {
      boot.classList.add('is-gone');
      state = 'locked';
      tickClock();
      setInterval(tickClock, 10000);
    }, 2950);
  });
} };
