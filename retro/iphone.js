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
          <div class="ip-lock" style="background-image:url(${WALL})"><div class="top"><div class="time"></div><div class="date"></div></div><div class="ip-lk-note" hidden><img src="assets/images/ios/sms.webp" alt="" /><b></b><span>now</span></div><div class="bot"><div class="ip-slider"><div class="txt">slide to unlock</div><div class="ip-knob" role="slider" aria-label="Slide to unlock" tabindex="0"><svg viewBox="0 0 40 28"><defs><linearGradient id="kar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c4c4c4"/><stop offset=".48" stop-color="#9a9a9a"/><stop offset=".52" stop-color="#7f7f7f"/><stop offset="1" stop-color="#6a6a6a"/></linearGradient><linearGradient id="kgl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity=".05"/></linearGradient><clipPath id="kcl"><path d="M3.5 9.5h17.5V3l16 11-16 11v-6.5H3.5z"/></clipPath></defs><path d="M3.5 10.5h17.5V4l16 11-16 11v-6.5H3.5z" fill="#fff" opacity=".9"/><path d="M3.5 9.5h17.5V3l16 11-16 11v-6.5H3.5z" fill="url(#kar)" stroke="#5a5a5a" stroke-width=".8" stroke-linejoin="round"/><rect x="0" y="0" width="40" height="14" fill="url(#kgl)" clip-path="url(#kcl)"/></svg></div></div></div></div>
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
    /* 56 points clear for the buttons on top, 26 at the bottom so a
       browser's toolbar never touches the phone. */
    const s = Math.min(1.3, (v.h - 82) / h, (v.w - 24) / w);
    scaleBox.style.transform = `scale(${s})`;
    scaleBox.style.marginTop = v.top + 56 + Math.max(0, (v.h - 82 - h * s) / 2) + 'px';
  };
  fit();
  addEventListener('retro-fit', fit);

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
  const GREEN = lg('g', [[0, '#b4f497'], [0.48, '#56cf3f'], [0.52, '#3fbf2c'], [1, '#22a01a']]);

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
        <text x="51" y="50" text-anchor="end" ${HV} font-weight="bold" font-size="13" fill="#fff">73°</text>`,
      lg('bg', [[0, '#6ab9ff'], [0.5, '#2f86f0'], [1, '#1758cc']]) + rg('glow', [[0, '#ffe680', 0.75], [1, '#ffe680', 0]]) + rg('sun', [[0, '#fff6a6'], [0.6, '#ffc61a'], [1, '#f39400']], 0.4, 0.35)),
    settings: () => {
      const gear = (cx, cy, r, n, w) => { let t = ''; for (let i = 0; i < n; i++) t += `<rect x="${cx - w / 2}" y="${cy - r - 4}" width="${w}" height="7" rx="1.1" transform="rotate(${i * 360 / n} ${cx} ${cy})"/>`; return t; };
      return ic(`<rect width="57" height="57" fill="url(#bg)"/><rect x="2.5" y="2.5" width="52" height="52" rx="8" fill="url(#in)"/>
        <g fill="url(#gr)">${gear(28.5, 28.5, 17, 16, 5)}<circle cx="28.5" cy="28.5" r="17"/></g><circle cx="28.5" cy="28.5" r="12" fill="url(#hub)"/><circle cx="28.5" cy="28.5" r="7" fill="url(#gr)"/><circle cx="28.5" cy="28.5" r="3.2" fill="#3d3d3d"/>`,
      lg('bg', [[0, '#e9e9e9'], [1, '#6d6d6d']]) + rg('in', [[0, '#7a7a7a'], [1, '#3b3b3b']], 0.5, 0.4, 0.7) + lg('gr', [[0, '#f2f2f2'], [0.5, '#bdbdbd'], [1, '#8a8a8a']]) + rg('hub', [[0, '#9a9a9a'], [1, '#5a5a5a']]));
    },
    notes: () => ic(`<rect width="57" height="57" fill="url(#pad)"/>${[23, 29.5, 36, 42.5, 49].map((y) => `<line x1="0" y1="${y}" x2="57" y2="${y}" stroke="#cbb75c" stroke-width=".7"/>`).join('')}
        <rect width="57" height="15" fill="url(#lth)"/><rect y="14.2" width="57" height="1.6" fill="#3a1f05"/>${[...Array(14)].map((_, i) => `<rect x="${2 + i * 4}" y="2.4" width="2" height=".9" fill="#e6c79a" opacity=".55"/>`).join('')}`,
      lg('pad', [[0, '#fff8b8'], [1, '#f3d75e']]) + lg('lth', [[0, '#9e6e3c'], [0.5, '#6a4016'], [1, '#4a2908']])),
    phone: () => ic(`<rect width="57" height="57" fill="url(#g)"/><path d="M17.6 9.6c2.5-1.7 5.1-.5 6 2.3l1.7 4.7c.8 2.4-.5 3.7-2.3 4.7 1.1 4.3 4.4 8.3 8.6 10.1 1.1-1.7 2.8-3.1 5.2-2.2l4.9 2.1c2.6 1.1 3.5 3.7 1.8 6.1-2.1 3.2-6.3 4.9-10.5 3.5-9.4-3.3-17-11.2-19.7-20.2-1.2-4.3.6-8.8 4.3-11.1z" fill="#fff"/>`, GREEN),
    mail: () => ic(`<rect width="57" height="57" fill="url(#sky)"/><ellipse cx="11" cy="48" rx="15" ry="6" fill="#fff" opacity=".9"/><ellipse cx="44" cy="51" rx="16" ry="6" fill="#fff" opacity=".8"/><ellipse cx="30" cy="54" rx="12" ry="4" fill="#fff" opacity=".85"/>
        <rect x="8" y="15" width="41" height="27" rx="1.2" fill="url(#env)" stroke="#9aaac0" stroke-width=".7"/><path d="M8.4 15.6 28.5 31 48.6 15.6" fill="none" stroke="#9aaac0" stroke-width="1.3"/><path d="M8.4 41.5 23 27.6M48.6 41.5 34 27.6" stroke="#c5d0dd" stroke-width=".9"/>`,
      lg('sky', [[0, '#1f5fd2'], [0.55, '#5ca3f0'], [1, '#bfe0fb']]) + lg('env', [[0, '#ffffff'], [1, '#dde4ee']])),
    safari: () => { let t = ''; for (let i = 0; i < 48; i++) t += `<line x1="28.5" y1="9.5" x2="28.5" y2="${i % 4 ? 11.2 : 12.6}" stroke="#fff" stroke-width=".6" transform="rotate(${i * 7.5} 28.5 28.5)"/>`; return ic(`<rect width="57" height="57" fill="url(#bg)"/><circle cx="28.5" cy="28.5" r="22" fill="url(#rim)"/><circle cx="28.5" cy="28.5" r="19.5" fill="url(#dial)"/>${t}
        ${[['N', 28.5, 17.6], ['S', 28.5, 43.4], ['E', 41.6, 30.4], ['W', 15.4, 30.4]].map(([l, x, y]) => `<text x="${x}" y="${y}" text-anchor="middle" ${HV} font-weight="bold" font-size="4.6" fill="#fff">${l}</text>`).join('')}
        <path d="M28.5 28.5 40 15.5 31.4 31.2z" fill="#e3261d"/><path d="M28.5 28.5 17 41.5 25.6 25.8z" fill="#f2f2f2"/><circle cx="28.5" cy="28.5" r="1.6" fill="#999"/>`,
      lg('bg', [[0, '#8cc8ff'], [0.5, '#3d8fe8'], [1, '#1d63c7']]) + lg('rim', [[0, '#ffffff'], [1, '#c3ccd8']]) + rg('dial', [[0, '#bfe6ff'], [0.7, '#4aa0ea'], [1, '#1c66c0']], 0.45, 0.38, 0.62)); },
    clipAJ: () => ic(`<rect width="57" height="57" fill="url(#bg)"/><g transform="translate(5.5 6) scale(.74)"><path d="${MARK.a}" fill="#fff"/><path d="${MARK.j}" fill="#ff6b35"/><path d="${MARK.stem}" fill="#5c86ff"/><path d="${MARK.dot}" fill="#5c86ff"/></g>`,
      lg('bg', [[0, '#3a3f4a'], [1, '#101318']])),
    clipGH: () => ic(`<rect width="57" height="57" fill="url(#bg)"/><g transform="translate(10 10.5) scale(2.32)"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" fill="#fff"/></g>`,
      lg('bg', [[0, '#5b5f66'], [0.5, '#2c2f35'], [1, '#121418']])),
    clipIN: () => ic(`<rect width="57" height="57" fill="url(#bg)"/><text x="28.5" y="40" text-anchor="middle" ${HV} font-weight="bold" font-size="30" fill="#fff" letter-spacing="-1">in</text>`,
      lg('bg', [[0, '#5eaaf0'], [0.5, '#1f78c9'], [1, '#0b5aa5']]))
  };

  /* The springboard's own artwork, taken from the 2007 home screen. The
     calendar and weather faces are left blank and lettered live. */
  const ART = { sms: 'sms', calendar: 'calendar', photos: 'photos', camera: 'camera', tv: 'youtube', stocks: 'stocks', maps: 'maps', weather: 'weather', settings: 'settings', notes: 'notes', phone: 'phone', mail: 'mail', safari: 'safari', ipod: 'ipod' };
  Object.keys(ART).forEach((k) => {
    ICON[k] = () => {
      let over = '';
      if (k === 'calendar') { const d = now(); over = `<span class="ic-wd">${d.toLocaleDateString('en-US', { weekday: 'long' })}</span><span class="ic-dd">${d.getDate()}</span>`; }
      if (k === 'weather') over = '<span class="ic-tp">73\u00b0</span>';
      return `<img class="ic-img" src="assets/images/ios/${ART[k]}.webp" alt="" draggable="false" />${over}`;
    };
  });

  /* Small row icons for the Settings-style tables. */
  const mini = (bg, glyph) => `<span class="mi" style="--mi:${bg}">${glyph}</span>`;

  /* --------------------------------------------------------------- shell */

  let state = 'boot';
  let current = null;

  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const setBar = (b) => { scr.dataset.bar = b; };
  const ext = (url) => window.open(url, '_blank', 'noopener');
  /* Email buttons open a new message in the phone's own Mail. */
  let pendingMail = null;
  const writeMail = (subject = '', body = '') => {
    pendingMail = { subject, body };
    if (current && current.def === APPS.email && current.compose) { current.compose(P.email, subject, body); pendingMail = null; return; }
    if (current) { closeApp(); setTimeout(() => openApp('email', null), 380); } else openApp('email', null);
  };
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
    let target = null, mode = 'abc', shift = true, caps = false, lastShift = 0;
    const draw = () => {
      el.innerHTML = KB_ROWS[mode].map((row, r) => `<div class="kb-r r${r}">${row.map((k) => {
        const wide = k === 'space' ? ' sp' : k === 'return' ? ' ret' : (k === '.?123' || k === 'ABC') ? ' mode' : (k === '⇧' || k === '⌫' || k === '#+=') ? ' fn' : '';
        const label = k.length === 1 && mode === 'abc' && shift ? k.toUpperCase() : k === 'return' && target && target.ret ? target.ret : k;
        return `<button type="button" class="kb-k${wide}${k === '⇧' && shift ? ' on' : ''}${k === '⇧' && caps ? ' caps' : ''}" data-k="${esc(k)}">${esc(label)}</button>`;
      }).join('')}</div>`).join('');
      el.appendChild(pop);
    };
    const type = (k) => {
      if (!target) return;
      if (k === '⌫') target.back();
      else if (k === 'return') target.enter();
      else if (k === 'space') target.insert(' ');
      else if (k === '⇧') { const t = performance.now(); if (caps) { caps = false; shift = false; } else if (shift && t - lastShift < 350) caps = true; else shift = !shift; lastShift = t; draw(); return; }
      else if (k === '.?123' || k === '#+=') { mode = 'num'; draw(); return; }
      else if (k === 'ABC') { mode = 'abc'; draw(); return; }
      else { target.insert(mode === 'abc' && shift ? k.toUpperCase() : k); if (shift && !caps && mode === 'abc') { shift = false; draw(); } }
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
      show(t) { if (target && target !== t && target.blur) target.blur(); target = t; caps = false; shift = !t.value || /[.!?]\s*$/.test(t.value); mode = 'abc'; draw(); el.classList.add('on'); scr.classList.add('kb-on'); },
      hide() { if (target && target.blur) target.blur(); target = null; el.classList.remove('on'); scr.classList.remove('kb-on'); },
      get target() { return target; }
    };
  })();

  /* A text field drawn by hand: a caret that blinks, a value the keyboard
     edits. Tapping it brings the keyboard up. */
  const field = (el, { value = '', placeholder = '', multi = false, ret = 'return', onEnter, onChange, selectAll = false, clearBtn = false } = {}) => {
    el.classList.add('fld');
    if (multi) el.classList.add('multi');
    /* selectAll: focusing highlights everything, so the first key typed
       replaces it, as an address bar does. clearBtn: a grey x empties it.
       The caret sits wherever the field was tapped, and stays in view. */
    const reveal = () => {
      const c = el.querySelector('.caret');
      if (!c || !el.classList.contains('on')) return;
      if (!multi) { el.scrollLeft = Math.max(0, c.offsetLeft - el.clientWidth + 24); return; }
      let sc = el;
      while (sc && sc !== scr && !(/(auto|scroll)/.test(getComputedStyle(sc).overflowY) && sc.scrollHeight > sc.clientHeight)) sc = sc.parentElement;
      if (!sc || sc === scr) return;
      const cr = c.getBoundingClientRect(), sr = sc.getBoundingClientRect(), k = sr.height / sc.clientHeight || 1;
      if (cr.bottom > sr.bottom - 8 * k) sc.scrollTop += (cr.bottom - sr.bottom) / k + 24;
      else if (cr.top < sr.top) sc.scrollTop -= (sr.top - cr.top) / k + 12;
    };
    const f = {
      value, ret, sel: false, pos: value.length, last: value,
      render() {
        if (f.value !== f.last) { f.pos = f.value.length; f.last = f.value; }
        f.pos = Math.max(0, Math.min(f.pos, f.value.length));
        const a = esc(f.value.slice(0, f.pos)), b = esc(f.value.slice(f.pos));
        const body = !f.value ? `<i class="caret"></i><span class="ph">${esc(placeholder)}</span>` : f.sel ? `<span class="hl">${esc(f.value)}</span><i class="caret"></i>` : `<span class="t0">${a}</span><i class="caret"></i><span class="t1">${b}</span>`;
        el.innerHTML = body + (clearBtn && f.value && el.classList.contains('on') ? '<button type="button" class="fld-x" aria-label="Clear">×</button>' : '');
        onChange && onChange(f.value);
        if (el.classList.contains('on')) reveal(); else if (!multi) el.scrollLeft = 0;
      },
      set(v, at) { f.value = v; f.last = v; f.pos = at; f.render(); },
      insert(s) { if (f.sel) { f.sel = false; f.set(s, s.length); return; } f.set(f.value.slice(0, f.pos) + s + f.value.slice(f.pos), f.pos + s.length); },
      back() { if (f.sel) { f.sel = false; f.set('', 0); return; } if (!f.pos) return; f.set(f.value.slice(0, f.pos - 1) + f.value.slice(f.pos), f.pos - 1); },
      enter() { f.sel = false; if (onEnter) onEnter(f); else if (multi) f.insert('\n'); },
      focus() { el.classList.add('on'); f.sel = selectAll && !!f.value; f.pos = f.value.length; f.render(); kb.show(f); },
      blur() { el.classList.remove('on'); f.sel = false; f.render(); },
      clear() { f.sel = false; f.set('', 0); }
    };
    /* Where in the text a tap landed. */
    const hit = (x, y) => {
      let node, off;
      if (document.caretPositionFromPoint) { const r = document.caretPositionFromPoint(x, y); if (r) { node = r.offsetNode; off = r.offset; } }
      else if (document.caretRangeFromPoint) { const r = document.caretRangeFromPoint(x, y); if (r) { node = r.startContainer; off = r.startOffset; } }
      if (!node) return f.value.length;
      const span = node.nodeType === 3 ? node.parentElement : node;
      if (span && span.classList.contains('t0')) return off;
      if (span && span.classList.contains('t1')) return f.pos + off;
      return f.value.length;
    };
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (e.target.closest('.fld-x')) { SFX.click(); f.clear(); if (!el.classList.contains('on')) f.focus(); return; }
      if (el.classList.contains('on') && f.sel) { f.sel = false; f.render(); return; }
      const at = f.value && !f.sel ? hit(e.clientX, e.clientY) : f.value.length;
      if (!el.classList.contains('on')) { f.focus(); if (!selectAll) { f.pos = at; f.render(); } return; }
      f.pos = at; f.render();
    });
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
      <path d="M${w - 5.5} .5H12.6L2.3 13.1Q.8 15 2.3 16.9L12.6 29.5H${w - 5.5}A5 5 0 0 0 ${w - .5} 24.5V5.5A5 5 0 0 0 ${w - 5.5} .5Z" fill="url(#${k})" stroke="${C[4]}" stroke-width="1" stroke-linejoin="round"/></svg>`);
  };

  /* An app: a nav bar over a stack of sliding pages. */
  const makeApp = (def, from) => {
    const el = h('div', 'ip-app' + (def.cls ? ' ' + def.cls : ''));
    void from;
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
      /* The page underneath hides once the new one has slid over it, but
         only if it is still underneath: a quick Back must not hide it. */
      if (prev && !opts.instant) { prev.pg.classList.add('out-l'); pg.classList.add('in-r'); setTimeout(() => { prev.pg.classList.remove('out-l'); if (app.stack[app.stack.length - 1] !== prev) prev.pg.style.visibility = 'hidden'; }, 300); }
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
      /* Extra icon buttons, packed to the left of the right-hand one. */
      let x = 6 + (nb.querySelector('.nbb.r') ? nb.querySelector('.nbb.r').offsetWidth + 6 : 0);
      (top.opts.tools || []).slice().reverse().forEach(([svg, label, fn]) => {
        const t = h('button', 'nbb ico', svg);
        t.type = 'button';
        t.setAttribute('aria-label', label);
        t.style.right = x + 'px';
        t.addEventListener('click', (e) => { SFX.click(); fn(e); });
        nb.appendChild(t);
        x += t.offsetWidth + 6;
      });
      const tt = nb.querySelector('.t');
      if (top.opts.tools) {
        const l = nb.querySelector('.nbb.l, .nbb.ll');
        Object.assign(tt.style, { position: 'absolute', left: (l ? l.offsetLeft + l.offsetWidth + 8 : 10) + 'px', right: x + 2 + 'px', maxWidth: 'none', textAlign: 'left' });
      } else {
        Object.assign(tt.style, { position: '', left: '', right: '', textAlign: '' });
        const side = Math.max(0, ...[...nb.querySelectorAll('.nbb')].map((b) => b.offsetWidth + 10));
        tt.style.maxWidth = (320 - side * 2 - 8) + 'px';
      }
    };
    def.open(app);
    return app;
  };

  let quietUntil = 0;
  const openApp = (id, from) => {
    if (current || state !== 'home' || performance.now() < quietUntil) return;
    SFX.click();
    if (APPS[id].link) { ext(APPS[id].link); return; }
    board.classList.add('is-converge');
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
    setTimeout(() => { flyOut(); board.classList.remove('is-converge'); requestAnimationFrame(flyIn); }, 140);
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

  /* Safari: tabs, an address bar that goes anywhere (or searches), back
     and forward, bookmarks you can add to. Most sites refuse to be framed,
     so outside pages are fetched through a reader service and shown here
     with their scripts left off; taps on links and forms come back through
     Safari, which keeps each page's own history. Searches go to
     DuckDuckGo's plain results page. */
  const safari = (app, url, label) => {
    const tab = (u) => ({ url: u, hist: u ? [u] : [], pos: u ? 0 : -1 });
    const tabsList = [tab(url)];
    let cur = 0, token = 0;
    const marks = store.get('ip-marks', null) || [['Portfolio', 'classic.html'], ['Resume', P.resume], ['GitHub', P.github], ['LinkedIn', P.linkedin], ['Wikipedia', 'https://en.m.wikipedia.org/']];
    app.el.classList.add('is-safari');
    app.el.innerHTML = `<div class="saf-top"><span class="saf-url"></span><i class="saf-prog"></i><button type="button" class="saf-rl" aria-label="Reload">↻</button></div><div class="saf-view"><iframe class="saf-frame" title="${esc(label)}"></iframe><div class="saf-note" hidden><span>This page couldn’t be loaded.</span><a target="_blank" rel="noopener">Open it in a new tab</a></div></div><div class="saf-bot"><button type="button" data-a="b" aria-label="Back">◀</button><button type="button" data-a="f" aria-label="Forward">▶</button><button type="button" data-a="add" aria-label="Add bookmark"><svg viewBox="0 0 22 22" width="22" height="22"><path d="M11 3v16M3 11h16" stroke="#fff" stroke-width="3.6" stroke-linecap="square"/></svg></button><button type="button" data-a="bm" aria-label="Bookmarks"><span class="bk"></span></button><button type="button" data-a="pg" aria-label="Pages"><span class="pg2"><b>1</b></span></button></div>`;
    const fr = app.el.querySelector('.saf-frame'), note = app.el.querySelector('.saf-note'), cnt = app.el.querySelector('.pg2 b'), prog = app.el.querySelector('.saf-prog');
    /* Our own pages load directly; everything typed goes through OLDWEB,
       which finds the site as it was in 2007 (or today's, failing that)
       and dresses searches as that year's Google. */
    const local = (u) => u === 'classic.html' || /\.pdf(#|$)/i.test(u);
    const pretty = (u) => !u ? '' : local(u) ? 'ajaysommi.github.io/' + (u === 'classic.html' ? '' : u.replace(/#.*$/, '')) : window.OLDWEB.shown(u);
    const resolve = (v) => { v = v.trim(); return v || null; };
    const progress = (on) => { prog.classList.toggle('on', on); if (!on) { prog.classList.add('done'); setTimeout(() => prog.classList.remove('done'), 300); } };
    const load = async (u) => {
      const my = ++token;
      note.hidden = true;
      if (!u || local(u)) { fr.removeAttribute('srcdoc'); fr.removeAttribute('sandbox'); fr.dataset.kind = ''; fr.onload = null; fr.src = u || 'about:blank'; progress(false); return; }
      await window.OLDWEB.open(fr, u, 2007, { onNav: (x) => { if (my === token) go(x); }, onState: (st) => { if (my === token) progress(st === 'loading'); } });
    };
    const show = (fresh) => {
      const t = tabsList[cur];
      addr.value = pretty(t.url); addr.render();
      cnt.textContent = tabsList.length;
      load(t.url);
    };
    const go = (u) => {
      const t = tabsList[cur];
      t.hist = t.hist.slice(0, t.pos + 1);
      t.hist.push(u); t.pos = t.hist.length - 1; t.url = u;
      show();
    };
    const addr = field(app.el.querySelector('.saf-url'), { placeholder: 'Search or type an address', ret: 'Go', selectAll: true, clearBtn: true, onEnter: (f) => { const u = resolve(f.value); if (!u) return; kb.hide(); go(u); } });
    app.el.querySelector('.saf-rl').addEventListener('click', () => { SFX.click(); show(true); });
    /* The page switcher: one card per tab, New Page, close, Done. */
    const pages = () => {
      const o = h('div', 'saf-pages');
      const draw = () => {
        o.innerHTML = `<div class="sp-card"><button type="button" class="sp-x" aria-label="Close page">×</button><b>${esc(pretty(tabsList[cur].url) || 'Untitled')}</b><span>${cur + 1} of ${tabsList.length}</span></div><div class="sp-nav"><button type="button" data-d="-1">◀</button><span>${tabsList.map((_, i) => `<i class="${i === cur ? 'on' : ''}"></i>`).join('')}</span><button type="button" data-d="1">▶</button></div><div class="sp-bar"><button type="button" data-new>New Page</button><button type="button" data-done>Done</button></div>`;
      };
      draw();
      o.addEventListener('click', (e) => {
        e.stopPropagation();
        const b = e.target.closest('button');
        if (!b) return;
        SFX.click();
        if (b.dataset.d) { cur = (cur + +b.dataset.d + tabsList.length) % tabsList.length; draw(); }
        if (b.classList.contains('sp-x')) { if (tabsList.length > 1) { tabsList.splice(cur, 1); cur = Math.min(cur, tabsList.length - 1); draw(); } else { tabsList[0] = tab(''); o.remove(); show(); addr.focus(); } }
        if (b.hasAttribute('data-new')) { if (tabsList.length >= 8) { alertBox('Too Many Pages', 'Close a page before opening another.'); return; } tabsList.push(tab('')); cur = tabsList.length - 1; o.remove(); show(); addr.focus(); }
        if (b.hasAttribute('data-done')) { o.remove(); show(); }
      });
      app.el.appendChild(o);
    };
    app.el.querySelector('.saf-bot').addEventListener('click', async (e) => {
      const b = e.target.closest('[data-a]');
      if (!b) return;
      SFX.click();
      const a = b.dataset.a;
      const t = tabsList[cur];
      if (a === 'b' && t.pos > 0) { t.pos--; t.url = t.hist[t.pos]; show(); }
      if (a === 'f' && t.pos < t.hist.length - 1) { t.pos++; t.url = t.hist[t.pos]; show(); }
      if (a === 'add') {
        const u = tabsList[cur].url;
        if (!u) { alertBox('Nothing to Bookmark', 'Open a page first.'); return; }
        if (!marks.some((m) => m[1] === u)) { marks.push([pretty(u).slice(0, 24), u]); store.set('ip-marks', marks); }
        alertBox('Bookmark Added', esc(pretty(u)));
      }
      if (a === 'pg') pages();
      if (a === 'bm') {
        const r = await alertBox('Bookmarks', '', [...marks.map((m) => m[0]), 'Cancel']);
        const m = marks.find((x) => x[0] === r);
        if (m) go(m[1]);
      }
    });
    show();
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
        pg.insertAdjacentHTML('beforeend', `<div class="gp"><div class="row"><span class="k">Starts</span><span class="v n">${now().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span></div></div>`);
        setTimeout(() => title.focus(), 320);
        entry.opts.left = ['Cancel', () => app.pop()];
        entry.opts.right = ['Done', () => {
          const t = title.value || 'Interview with Ajay';
          mine.push({ t, d: now().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), ts: Date.now() });
          store.set('ip-events', mine);
          void where;
          app.pop();
          render();
          alertBox('Event Added', `“${esc(t)}” is on the calendar for today.`);
        }];
        entry.opts.blue = true;
      })]
    });
  };

  /* Text messages: tap the field, type, Send, and it goes up the screen.
     A reply comes back. */
  const convo = {};
  /* Every recommendation arrives unread; reading one clears its dot, and
     the count shows on the icon and the lock screen. */
  const smsRead = new Set(store.get('ip-sms-read', []));
  let noteSeen = false;
  const unreadCount = () => P.recs.filter((_, i) => !smsRead.has(i)).length;
  const showUnread = () => {
    const n = unreadCount();
    const note = room.querySelector('.ip-lk-note');
    if (note) { note.hidden = !n || noteSeen; note.querySelector('b').textContent = n >= 9 ? '9+ Messages' : `${n} New Message${n === 1 ? '' : 's'}`; }
    badge('guestbook', n);
    badge('email', MAIL_N - mailRead.size);
  };
  const badge = (id, n) => {
    const ic = room.querySelector(`.ip-icon[data-id="${id}"]`);
    if (!ic) return;
    let bd = ic.querySelector('.badge');
    if (!n) { if (bd) bd.remove(); return; }
    if (!bd) { bd = h('span', 'badge'); ic.appendChild(bd); }
    bd.textContent = n;
  };
  /* Mail works the same way: everything in the Inbox starts unread. */
  const MAIL_N = 3;
  const mailRead = new Set(store.get('ip-mail-read', []).filter((i) => i < MAIL_N));
  const messages = (app) => {
    const thread = (p, i) => {
      const [n, c, q] = P.recs[i];
      if (!convo[i]) convo[i] = [['in', q]];
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
      const go = (x) => {
        const t = x.value.trim();
        if (!t) return;
        add('out', t);
        x.clear();
      };
      const f = field(p.querySelector('.sms-field'), { ret: 'Send', onEnter: (x) => go(x), onChange: (v) => send.classList.toggle('on', !!v.trim()) });
      send.addEventListener('click', () => go(f));
      setTimeout(() => { box.scrollTop = box.scrollHeight; }, 50);
    };
    app.push('Text Messages', (pg, a, entry) => {
      const ul = plain(pg, P.recs.map(([n, c, q], i) => ({ id: i, text: n, sub: q, rt: c.split(' ')[0], cls: 'sms-row' + (smsRead.has(i) ? '' : ' unread'), go: () => (smsRead.add(i), store.set('ip-sms-read', [...smsRead]), setTimeout(() => { const li = pg.querySelector(`.sms-row[data-id="${i}"]`); if (li) li.classList.remove('unread'); showUnread(); }, 320)) && app.push(n.split(' ')[0], (p) => thread(p, i), { back: 'Messages', right: ['Clear', () => { convo[i] = []; app.stack[app.stack.length - 1].pg.querySelectorAll('.bub').forEach((b) => { b.classList.add('gone'); setTimeout(() => b.remove(), 250); }); }] }) })));
      editable(app, entry, ul);
    });
  };

  /* Notes: every note can be edited, new ones made, sent or thrown away. */
  const NOTES_DEFAULT = [
    ['About me', `${P.about[0]}\n\n${P.about[1]}`],
    ['Education', `${P.education.school}\n${P.education.degree}\n${P.education.college}\nGraduating ${P.education.when}\n\n${P.education.text}`],
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
      p.innerHTML = `<div class="note"><div class="d"><span>Today</span><span>${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} &nbsp;${hm(d)}</span></div><div class="note-body"></div></div>`;
      field(p.querySelector('.note-body'), { value: notes[i][1], multi: true, onChange: (v) => { notes[i][1] = v; save(); } });
      if (fresh) setTimeout(() => p.querySelector('.note-body').click(), 340);
      /* Swipe sideways to move between notes. */
      let x0 = null;
      p.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
      p.addEventListener('pointerup', (e) => {
        if (x0 === null || Math.abs(e.clientX - x0) < 60) { x0 = null; return; }
        const j = i + (e.clientX < x0 ? 1 : -1);
        x0 = null;
        if (j >= 0 && j < notes.length) { app.pop(); setTimeout(() => open(j), 320); }
      });
      entry.opts.tools = [
        ['<svg viewBox="0 0 22 18" width="22" height="18"><path d="M2 6.5v9.5h15.5V12" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/><path d="M6 12c1-4.5 4.5-6.5 9-6.5V2.5L20.5 7 15 11.5V8.5C11.5 8.5 8.5 9.5 6 12z" fill="#fff"/></svg>', 'Email this note', () => writeMail(named(notes[i]), notes[i][1])],
        ['<svg viewBox="0 0 16 19" width="16" height="19"><path d="M1 4h14M5.5 4V1.8h5V4" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/><path d="M2.6 5.6h10.8l-1 12.4H3.6z" fill="#fff"/><path d="M6 8v8M8 8v8M10 8v8" stroke="#8a5d2a" stroke-width="1"/></svg>', 'Delete note', async () => {
          const r = await alertBox('Delete Note', 'This note will be thrown away.', ['Cancel', 'Delete']);
          if (r === 'Delete') { notes.splice(i, 1); save(); list(); }
        }]
      ];
      entry.opts.right = ['+', () => { notes.push(['', '']); save(); app.pop(); setTimeout(() => open(notes.length - 1, true), 320); }];
      entry.opts.onPop = () => setTimeout(list, 310);
    }, { back: 'Notes' });
    list();
  };

  /* Phone: Favorites, Recents, Contacts, Keypad and Voicemail all work.
     The keypad dials anything, and the network politely declines. */
  const phoneApp = (app) => {
    const card = store.get('ip-card', null) || { email: P.email, home: 'github.com/ajaysommi', work: 'linkedin.com/in/ajay-sommi', notes: 'Software engineer. Graduating December 2026.' };
    delete card.mobile;
    const favs = (store.get('ip-favs', null) || [['Ajay Sommi', 'email', P.email]]).filter((f) => !/555/.test(f[2]));
    let toTab = () => {};
    const allRecents = () => [...P.experience].reverse().map((e) => [e.short, e.where, e.when.split(' to ')[1] || e.when]);
    let recents = allRecents();
    const call = async (num) => {
      const digits = String(num).replace(/\D/g, '');
      if (!digits) { alertBox('Enter a Number', 'Type a number on the keypad first.'); return; }
      if (digits === '911') { alertBox('Emergency Calls Unavailable', 'This phone can’t place real calls.'); return; }
      if (['1983', '1991', '1998', '2009'].includes(digits)) {
        const r = await alertBox('Switch Era', `Dialing ${digits} opens the ${digits} version of this portfolio.`, ['Cancel', 'Go']);
        if (r === 'Go') exit();
        return;
      }
      const r = await alertBox('Cellular Network Not Available', 'This phone can’t place calls. You can send an email instead.', ['Dismiss', 'Email']);
      if (r === 'Email') writeMail('Hello');
    };
    const F = [['email', 'email'], ['home page', 'home'], ['work', 'work'], ['notes', 'notes']];
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
        if (r) { const f = r.dataset.k; if (f === 'email') writeMail('Hello'); else if (f === 'home') ext(P.github); else if (f === 'work') ext(P.linkedin); else alertBox('Notes', esc(card.notes)); }
        const act = e.target.closest('[data-act]');
        if (act && act.dataset.act === 'text') { closeApp(); setTimeout(() => openApp('guestbook', null), 360); }
        if (act && act.dataset.act === 'fav') { if (!favs.some((f) => f[1] === 'email')) favs.push(['Ajay Sommi', 'email', P.email]); store.set('ip-favs', favs); alertBox('Added to Favorites'); }
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
        if (a.dataset.a === 'add') { if (!num) { alertBox('Enter a Number', 'Type a number on the keypad first.'); return; } favs.push([fmt(num), 'mobile', num]); store.set('ip-favs', favs); alertBox('Added to Favorites', `${esc(fmt(num))} is in Favorites now.`); }
      });
      draw();
    };
    /* Voicemail as it was: the list over a dark panel holding the scrubber,
       Call Back and Delete. Tap a message to play it (the selected row
       turns blue); the round blue button opens what was said. */
    const vmDeleted = new Set(store.get('ip-vm-del', []));
    const WHEN = ['5:34 AM', '2:22 AM', 'Saturday', 'Saturday', 'Friday', 'Thursday', 'Wednesday', 'Monday', 'Sunday', 'Sunday'];
    const dur = (i) => 8 + P.recs[i][2].length % 40;
    const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    const voicemail = (pg, a, entry) => {
      pg.classList.add('vm-pg');
      const heard = new Set(store.get('ip-vm-heard', []));
      let sel = -1, timer = 0, at = 0, speaker = false;
      pg.innerHTML = `<ul class="vm-list"></ul><div class="vm-panel"><div class="vm-scrub"><span class="t0">0:00</span><div class="vm-track"><i class="fill"></i><b class="knob"></b></div><span class="t1">-0:00</span></div><div class="vm-btns"><button type="button" class="vm-call"><svg viewBox="0 0 20 20" width="17" height="17"><path d="M6 2.4c1-.6 2 0 2.4.9l.8 2c.3.9-.2 1.5-.9 1.9.5 1.7 1.8 3.2 3.4 4 .5-.7 1.1-1.2 2-.9l2 .8c1 .4 1.4 1.4.7 2.4-.9 1.3-2.5 1.9-4.1 1.3C8.6 13.5 5.6 10.4 4.6 7c-.5-1.7.2-3.5 1.4-4.6z" fill="#fff"/></svg>Call Back</button><button type="button" class="vm-del">Delete</button></div></div>`;
      const list = pg.querySelector('.vm-list'), fill = pg.querySelector('.fill'), knob = pg.querySelector('.knob'), t0 = pg.querySelector('.t0'), t1 = pg.querySelector('.t1');
      const scrub = () => { const d = sel >= 0 ? dur(sel) : 0, f = d ? at / d : 0; fill.style.width = f * 100 + '%'; knob.style.left = f * 100 + '%'; t0.textContent = clock(at); t1.textContent = '-' + clock(Math.max(0, d - at)); };
      const draw = () => {
        list.innerHTML = P.recs.map(([n], i) => vmDeleted.has(i) ? '' : `<li class="vm-r${i === sel ? ' sel' : ''}${heard.has(i) ? '' : ' new'}" data-i="${i}"><span class="st"></span><b>${esc(n)}</b><span class="when">${WHEN[i % WHEN.length]}</span><button type="button" class="vm-i" aria-label="Details"></button></li>`).join('') + `<li class="vm-r vm-trash"><b>Deleted Messages</b><span class="n">${vmDeleted.size || ''}</span></li>`;
        scrub();
      };
      const stop = () => { clearInterval(timer); timer = 0; };
      const play = (i) => {
        stop(); sel = i; at = 0; heard.add(i); store.set('ip-vm-heard', [...heard]); draw();
        timer = setInterval(() => { at = Math.min(dur(sel), at + .25); scrub(); if (at >= dur(sel)) stop(); }, 250);
      };
      list.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (!li) return;
        SFX.click();
        if (li.classList.contains('vm-trash')) {
          app.push('Deleted', (p2) => plain(p2, vmDeleted.size ? [...vmDeleted].map((i) => ({ text: P.recs[i][0], sub: 'Tap to undelete', go: () => { vmDeleted.delete(i); store.set('ip-vm-del', [...vmDeleted]); app.pop(); setTimeout(draw, 320); } })) : [{ text: 'No Deleted Messages', cls: 'none' }]), { back: 'Voicemail' });
          return;
        }
        const i = +li.dataset.i;
        if (e.target.closest('.vm-i')) { const [n, c, q] = P.recs[i]; app.push(n.split(' ')[0], (p2) => { p2.innerHTML = `<div class="ml-h">From: <b>${esc(n)}</b><br/>${esc(c)}</div><div class="ml-b">“${esc(q)}”</div>`; }, { back: 'Voicemail' }); return; }
        play(i);
      });
      pg.querySelector('.vm-call').addEventListener('click', () => { SFX.click(); call(sel >= 0 ? '0' : ''); });
      pg.querySelector('.vm-del').addEventListener('click', () => {
        SFX.click();
        if (sel < 0) { alertBox('No Message Selected', 'Tap a message first.'); return; }
        stop(); vmDeleted.add(sel); store.set('ip-vm-del', [...vmDeleted]); sel = -1; at = 0; draw();
      });
      entry.opts.right = ['Speaker', () => { speaker = !speaker; entry.opts.right = ['Speaker', entry.opts.right[1]]; entry.opts.blue = speaker; app.redraw(); }];
      app.def.onClose = stop;
      draw();
    };
    const favorites = (pg, a, entry) => {
      const ul = plain(pg, favs.map(([n, kind, num], i) => ({ id: i, text: n, rt: kind, go: () => (kind === 'email' ? writeMail('Hello') : call(num)), onDelete: () => { favs.splice(i, 1); store.set('ip-favs', favs); } })));
      editable(app, entry, ul);
      entry.opts.right = ['+', () => toTab(3)];
    };
    const recentsPage = (pg, a, entry) => {
      const draw = () => { pg.innerHTML = ''; plain(pg, recents.length ? recents.map(([n, w, d]) => ({ text: n, sub: w, rt: d, go: () => call('0') })) : [{ text: 'No Recents', cls: 'none' }]); };
      draw();
      entry.opts.seg = seg(['All', 'Missed'], 0, (i) => { recents = i ? allRecents().filter((_, k) => k % 3 === 0) : allRecents(); draw(); }, 'small');
      entry.opts.right = ['Clear', async () => { const r = await alertBox('Clear All Recents', '', ['Cancel', 'Clear All Recents']); if (r !== 'Cancel') { recents = []; draw(); } }];
    };
    const bar = tabs(app, [['Favorites', TAB.star], ['Recents', TAB.clock], ['Contacts', TAB.person], ['Keypad', TAB.keypad], ['Voicemail', TAB.vm]], 2, (i) => {
      app.el.classList.toggle('no-nb', i === 3);
      [() => app.reset('Favorites', favorites), () => app.reset('Recents', recentsPage), () => app.reset('Info', showCard(false)), () => app.reset('', keypad), () => app.reset('Voicemail', voicemail, { left: ['Greeting', () => alertBox('Greeting', 'The default greeting is in use.')] })][i]();
    });
    toTab = (i) => bar.querySelectorAll('button')[i].click();
  };

  /* Mail: Mailboxes, the inbox, reading, replying and writing. */
  const mailApp = (app) => {
    const M = [
      ['Ajay Sommi', 'Let’s talk', `Hi there,\n\nThanks for stopping by. I’m a software engineer graduating from UF in December 2026, and I’m looking for a team that cares about the people using what it builds.\n\nReply to this and it goes straight to me.\n\nAjay`],
      ['GitHub', 'Your repositories', 'SommiScript, GatorGoods, BalanceTree and more are at github.com/ajaysommi.'],
      ['LinkedIn', 'Recommendations', `${P.recs.length} people have written recommendations for Ajay. Read them in Text Messages.`]
    ];
    const sent = [];
    const compose = (to, subject, body) => app.push('New Message', (pg, a, entry) => {
      pg.classList.add('ml-new');
      pg.innerHTML = `<div class="ml-row"><span>To:</span><b class="ml-tok">${esc(to)}</b></div><div class="ml-row"><span>Subject:</span><span class="v" data-s></span></div><div class="ml-body" data-b></div>`;
      const b = field(pg.querySelector('[data-b]'), { multi: true, value: body || '' });
      const s = field(pg.querySelector('[data-s]'), { value: subject || '', ret: 'Next', onEnter: () => b.focus() });
      setTimeout(() => b.focus(), 340);
      entry.opts.left = ['Cancel', () => app.pop()];
      entry.opts.right = ['Send', () => { sent.push([s.value || '(no subject)', b.value]); app.pop(); mailto(s.value, b.value); setTimeout(() => alertBox('Message Ready', 'Your mail app has opened with the message filled in. A copy is in Sent.'), 350); }];
      entry.opts.blue = true;
    });
    const unread = () => M.length - mailRead.size;
    const inboxTitle = () => unread() ? `Inbox (${unread()})` : 'Inbox';
    const inbox = (pg, a, entry) => {
      const ul = plain(pg, M.map(([f, s, body], i) => ({ id: i, text: f, sub: `${s} — ${body.replace(/\n/g, ' ')}`, rt: i ? 'Oct 2026' : hm(now()), cls: mailRead.has(i) ? '' : 'unread', go: () => { if (!mailRead.has(i)) { mailRead.add(i); store.set('ip-mail-read', [...mailRead]); entry.title = inboxTitle(); setTimeout(() => { const li = pg.querySelector(`li[data-id="${i}"]`); if (li) li.classList.remove('unread'); showUnread(); }, 320); } app.push(s, (p) => {
        p.innerHTML = `<div class="ml-h">From: <b>${esc(f)}</b><br/>Subject: <b>${esc(s)}</b></div><div class="ml-b">${esc(body).replace(/\n/g, '<br/>')}</div>`;
      }, { right: ['Reply', () => compose(P.email, 'Re: ' + s)], blue: true, back: 'Inbox' }); } })));
      entry.opts.right = ['Edit', () => { const on = ul.classList.toggle('editing'); entry.opts.right = [on ? 'Done' : 'Edit', entry.opts.right[1]]; entry.opts.blue = on; app.redraw(); }];
    };
    const box = (name, rows) => app.push(name, (pg) => { plain(pg, rows.length ? rows : [{ text: 'No Mail', cls: 'none' }]); }, { back: 'Mailboxes' });
    app.push('Mailboxes', (pg) => plain(pg, [
      { text: 'Inbox', rt: unread() ? String(unread()) : '', go: () => app.push(inboxTitle(), inbox, { back: 'Mailboxes' }) },
      { text: 'Drafts', go: () => box('Drafts', [{ text: 'Offer letter', sub: 'Dear Ajay, we’d love to have you…', go: () => compose(P.email, 'Offer') }]) },
      { text: 'Sent', go: () => box('Sent', sent.map(([s, b]) => ({ text: s, sub: b }))) },
      { text: 'Trash', go: () => box('Trash', [{ text: 'Old resume (2019)', sub: 'Replaced by the current one.' }]) }
    ]));
    app.push(inboxTitle(), inbox, { instant: true, back: 'Mailboxes' });
    app.compose = compose;
    if (pendingMail) { const m = pendingMail; pendingMail = null; setTimeout(() => compose(P.email, m.subject, m.body), 380); }
    app.el.appendChild(h('div', 'ml-tb', '<button type="button" data-a="r" aria-label="Check mail">↻</button><span>Updated just now</span><button type="button" data-a="c" aria-label="Compose">✎</button>'));
    app.el.querySelector('.ml-tb').addEventListener('click', (e) => { const b = e.target.closest('[data-a]'); if (!b) return; SFX.click(); if (b.dataset.a === 'c') compose(P.email, ''); else alertBox('No New Mail'); });
  };

  const APPS = {
    guestbook: { name: 'Text', icon: 'sms', open: messages },
    experience: { name: 'Calendar', icon: 'calendar', open: calendar },
    builds: { name: 'Photos', icon: 'photos', cls: 'is-photos', open(app) {
      app.push('Photo Albums', (pg) => plain(pg, P.offclock.map((s) => ({ text: `${s.name} (${s.steps.length})`, img: s.cover, cls: 'alb', go: () => app.push(s.name, (p) => {
        p.classList.add('ph-pg');
        p.innerHTML = `<div class="grid4">${s.steps.map((st, k) => `<img src="${st[0]}" data-k="${k}" alt="${esc(st[1])}" />`).join('')}</div><div class="ph-lede">${esc(s.lede)}</div>`;
        p.addEventListener('click', (ev) => { const im = ev.target.closest('img[data-k]'); if (im) viewer(app, s, +im.dataset.k); });
      }, { right: ['Play', () => viewer(app, s, 0).play()] }) }))));
    } },
    about: { name: 'About Me', icon: 'ipod', nb: 'black', bar: 'black', cls: 'is-yt', open(app) {
      /* The story as an iPod: each chapter a playlist, each fact a track.
         Now Playing shows its picture as the album art; tap the art for the
         words. Tracks play through on their own, one into the next. */
      const G = 'assets/images/uf-gator-640.webp';
      const PL = [
        ['About Me', [
          { t: 'Hello', a: 'About Me', img: P.photo, x: `${P.about[0]} ${P.title}, ${P.citizen}.` },
          { t: 'Problem Solver', a: 'About Me', img: P.photo, x: P.about[1] },
          { t: 'Where It Started', a: 'About Me', img: P.kidPhoto, x: `“${P.quote}”` }
        ]],
        ['Education', [{ t: P.education.degree, a: P.education.school, img: G, fit: 1, x: `${P.education.college}. Graduating ${P.education.when}. ${P.education.text}` }]],
        ['Career', [...P.experience].reverse().map((e) => ({ t: e.org, a: e.role, img: e.photos[0] || G, fit: !e.photos[0], x: `${e.when} · ${e.where}. ${e.text}` }))],
        ['Off the Clock', P.offclock.map((o) => ({ t: o.name, a: o.title, img: o.cover || (o.steps[0] && o.steps[0][0]), x: o.lede }))]
      ];
      const len = (tr) => 60 + tr.x.length % 150;
      const clk = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
      const nowPlaying = (list, k) => {
        const v = h('div', 'np');
        let at = 0, playing = true, words = false;
        const draw = () => {
          const tr = list[k];
          v.innerHTML = `<div class="np-top"><button type="button" class="np-back" aria-label="Back"></button><div class="np-ti"><span>Ajay Sommi</span><b>${esc(tr.t)}</b><span>${esc(tr.a)}</span></div><button type="button" class="np-list" aria-label="Words"></button></div>
            <div class="np-scrub"><span class="t0"></span><div class="np-track"><i></i><b></b></div><span class="t1"></span></div>
            <div class="np-art${tr.fit ? ' fit' : ''}"><img src="${tr.img}" alt="" /><div class="np-words"${words ? '' : ' hidden'}><p>${esc(tr.x)}</p></div></div>
            <div class="np-ctl"><button type="button" data-c="-1" aria-label="Previous"><svg viewBox="0 0 40 24"><path d="M18 12 32 3v18zM4 12 18 3v18z" fill="url(#npg)"/><defs><linearGradient id="npg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#bbb"/></linearGradient></defs></svg></button><button type="button" data-c="0" aria-label="Play or pause">${playing ? '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="5" height="18" fill="#eee"/><rect x="14" y="3" width="5" height="18" fill="#eee"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M6 3l15 9-15 9z" fill="#eee"/></svg>'}</button><button type="button" data-c="1" aria-label="Next"><svg viewBox="0 0 40 24"><path d="M22 12 8 3v18zM36 12 22 3v18z" fill="#eee"/></svg></button></div>`;
          tick();
        };
        const tick = () => {
          const d = len(list[k]);
          const f = Math.min(1, at / d);
          v.querySelector('.np-track i').style.width = f * 100 + '%';
          v.querySelector('.np-track b').style.left = f * 100 + '%';
          v.querySelector('.t0').textContent = clk(at);
          v.querySelector('.t1').textContent = '-' + clk(d - at);
        };
        const go = (d) => { k = (k + d + list.length) % list.length; at = 0; draw(); };
        const timer = setInterval(() => { if (!playing) return; at += 1; if (at >= len(list[k])) go(1); else tick(); }, 1000);
        v.addEventListener('click', (e) => {
          if (e.target.closest('.np-back')) { SFX.click(); clearInterval(timer); v.classList.add('out'); setTimeout(() => v.remove(), 260); setBar('black'); return; }
          if (e.target.closest('.np-list') || e.target.closest('.np-art')) { words = !words; v.querySelector('.np-words').hidden = !words; return; }
          const c = e.target.closest('[data-c]');
          if (!c) return;
          SFX.click();
          if (c.dataset.c === '0') { playing = !playing; draw(); } else go(+c.dataset.c);
        });
        app.def.onClose = () => clearInterval(timer);
        draw();
        app.el.appendChild(v);
      };
      const songs = (list) => (pg) => plain(pg, list.map((tr, i) => ({ text: tr.t, sub: tr.a, img: tr.img, rt: clk(len(tr)), cls: 'yt-row', go: () => nowPlaying(list, i) })));
      app.push('Playlists', (pg) => plain(pg, PL.map(([n, list]) => ({ text: n, sub: `${list.length} song${list.length === 1 ? '' : 's'}`, img: list[0].img, cls: 'yt-row', go: () => app.push(n, songs(list), { back: 'Playlists' }) }))), { right: ['Now Playing', () => nowPlaying(PL[0][1], 0)] });
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
        if (a && a.dataset.a === 'i') alertBox('About Impact', 'Figures from internship work at Southeast Toyota, Hunter Engineering, JM Family and Shiva Robotics.');
        if (a && a.dataset.a === 'aj') { closeApp(); setTimeout(() => openApp('experience', null), 360); }
      });
      show();
    } },
    places: { name: 'Maps', icon: 'maps', bare: true, bar: 'gray', open(app) {
      /* A real map: OpenStreetMap tiles, or satellite imagery, with a pin
         for every place worked. Drag to move, double-tap or + to zoom,
         and List shows them as a list that leads back to the map. */
      const CITIES = [['Jacksonville, FL', 30.332, -81.656, 'rjax'], ['Palo Alto, CA', 37.442, -122.143, 'rfa'], ['Gainesville, FL', 29.652, -82.325, 'fics'], ['Deerfield Beach, FL', 26.318, -80.1, 'jm'], ['St. Louis, MO', 38.627, -90.199, 'hunter'], ['Boca Raton, FL', 26.368, -80.128, 'adt']];
      const W = 320, H = 480 - 20 - 32 - 44;
      let z = 4, mode = 'map';
      const wp = (lat, lon, zz) => { const s = 256 * 2 ** zz, r = Math.sin(lat * Math.PI / 180); return [(lon + 180) / 360 * s, (0.5 - Math.log((1 + r) / (1 - r)) / (4 * Math.PI)) * s]; };
      /* Start framed on the whole country, every pin in view. */
      const fitAll = () => {
        const a = wp(49.5, -125, 0), b = wp(24, -66.5, 0);
        z = Math.log2(Math.min((W - 4) / (b[0] - a[0]), (H - 20) / (b[1] - a[1])));
        [cx, cy] = wp(37, -96, z);
      };
      let cx = 0, cy = 0;
      fitAll();
      app.el.innerHTML = `<div class="mp2"><div class="map-bar"><span class="mb-f"></span></div><div class="mp-view"><div class="mp-tiles"></div><div class="mp-pins"></div><div class="mp-zoom"><button type="button" data-z="1" aria-label="Zoom in">+</button><button type="button" data-z="-1" aria-label="Zoom out">−</button></div><div class="mp-attr">Esri, HERE, Garmin, © OpenStreetMap</div></div><div class="mp-list pg" hidden></div><div class="mp-tb"></div></div>`;
      const view = app.el.querySelector('.mp-view'), tilesEl = app.el.querySelector('.mp-tiles'), pinsEl = app.el.querySelector('.mp-pins'), list = app.el.querySelector('.mp-list');
      const url = (x, y, zz, kind) => kind === 'map' ? `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${zz}/${y}/${x}` : kind === 'sat' ? `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zz}/${y}/${x}` : `https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/${zz}/${y}/${x}`;
      let open = -1;
      /* Zoom can sit between tile levels: the nearest level is drawn and
         scaled to fit. */
      const draw = () => {
        const zi = Math.max(2, Math.min(17, Math.round(z))), n = 2 ** zi, ts = 256 * 2 ** (z - zi);
        const L = cx - W / 2, T = cy - H / 2;
        const x0 = Math.floor(L / ts), x1 = Math.floor((L + W) / ts), y0 = Math.max(0, Math.floor(T / ts)), y1 = Math.min(n - 1, Math.floor((T + H) / ts));
        let html = '';
        for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
          const wx = ((tx % n) + n) % n, st = `left:${tx * ts - L}px;top:${ty * ts - T}px;width:${ts + .5}px;height:${ts + .5}px`;
          html += `<img src="${url(wx, ty, zi, mode === 'sat' ? 'sat' : 'map')}" style="${st}" alt="" draggable="false" />`;
          if (mode === 'sat') html += `<img src="${url(wx, ty, zi, 'lbl')}" style="${st}" alt="" draggable="false" />`;
        }
        tilesEl.innerHTML = html;
        pinsEl.innerHTML = CITIES.map(([nme, la, lo], i) => { const [px, py] = wp(la, lo, z); return `<button type="button" class="pin-d" data-i="${i}" style="left:${px - L}px;top:${py - T}px" aria-label="${esc(nme)}"></button>`; }).join('');
        if (open >= 0) callout(open, true);
      };
      const callout = (i, keep) => {
        pinsEl.querySelectorAll('.callout').forEach((c) => c.remove());
        open = i;
        if (i < 0) return;
        const p = pinsEl.querySelector(`.pin-d[data-i="${i}"]`);
        const [nme, , , id] = CITIES[i];
        const e = P.experience.find((x) => x.id === id);
        const c = h('button', 'callout', `<span class="co-t">${esc(e.short)}<em>${esc(nme)} · ${e.year}</em></span><span class="co-go">›</span>`);
        c.type = 'button';
        c.style.left = p.style.left; c.style.top = p.style.top;
        c.addEventListener('click', (ev) => { ev.stopPropagation(); alertBox(e.org, `${esc(e.role)}<br/>${esc(e.when)}`); });
        pinsEl.appendChild(c);
        if (!keep) SFX.click();
      };
      const go = (i, zz = 9) => { const [, la, lo] = CITIES[i]; z = zz; [cx, cy] = wp(la, lo, z); open = i; draw(); };
      const zoom = (d, px = W / 2, py = H / 2) => {
        const nz = Math.max(2, Math.min(17, Math.round(z) + d));
        if (nz === z) return;
        const k = 2 ** (nz - z);
        const wx = cx - W / 2 + px, wy = cy - H / 2 + py;
        cx = wx * k - (px - W / 2); cy = wy * k - (py - H / 2); z = nz;
        draw();
      };
      let drag = null, moved = 0;
      view.addEventListener('pointerdown', (e) => { if (e.target.closest('.callout, .mp-zoom')) return; drag = { x: e.clientX, y: e.clientY, cx, cy, k: scr.getBoundingClientRect().width / 320 }; moved = 0; try { view.setPointerCapture(e.pointerId); } catch (x) {} });
      view.addEventListener('pointermove', (e) => { if (!drag) return; const dx = (e.clientX - drag.x) / drag.k, dy = (e.clientY - drag.y) / drag.k; moved = Math.max(moved, Math.abs(dx) + Math.abs(dy)); cx = drag.cx - dx; cy = drag.cy - dy; draw(); });
      view.addEventListener('pointerup', (e) => {
        if (!drag) return;
        drag = null;
        if (moved > 4) return;
        const pin = document.elementFromPoint(e.clientX, e.clientY);
        const p = pin && pin.closest('.pin-d');
        if (p) callout(+p.dataset.i); else callout(-1);
      });
      view.addEventListener('dblclick', (e) => { const r = view.getBoundingClientRect(), k = r.width / 320; zoom(1, (e.clientX - r.left) / k, (e.clientY - r.top) / k); });
      view.addEventListener('wheel', (e) => { e.preventDefault(); const r = view.getBoundingClientRect(), k = r.width / 320; zoom(e.deltaY < 0 ? 1 : -1, (e.clientX - r.left) / k, (e.clientY - r.top) / k); }, { passive: false });
      app.el.querySelector('.mp-zoom').addEventListener('click', (e) => { const b = e.target.closest('[data-z]'); if (b) { SFX.click(); zoom(+b.dataset.z); } });
      plain(list, CITIES.map(([nme, , , id], i) => { const e = P.experience.find((x) => x.id === id); return { text: e.short, sub: nme, rt: String(e.year), go: () => { setMode('map'); go(i); } }; }));
      const setMode = (m) => {
        list.hidden = m !== 'list';
        if (m !== 'list') { mode = m; draw(); }
        ctl.querySelectorAll('button').forEach((b, k) => b.classList.toggle('on', ['map', 'sat', 'list'][k] === m));
      };
      const ctl = seg(['Map', 'Satellite', 'List'], 0, (i) => setMode(['map', 'sat', 'list'][i]), 'map-seg');
      app.el.querySelector('.mp-tb').appendChild(ctl);
      field(app.el.querySelector('.mb-f'), { placeholder: 'Search places', ret: 'Search', onEnter: (f) => {
        const q = f.value.toLowerCase().trim();
        const i = CITIES.findIndex(([nme, , , id]) => (nme + ' ' + P.experience.find((x) => x.id === id).org).toLowerCase().includes(q));
        kb.hide();
        if (q && i >= 0) { setMode(mode === 'sat' ? 'sat' : 'map'); go(i); } else alertBox('No Results Found', `No matches for “${esc(f.value)}”.`);
      } });
      draw();
    } },
    weather: { name: 'Weather', icon: 'weather', bare: true, bar: 'black', open(app) {
      /* Live weather for the places worked, from Open-Meteo. Swipe or tap
         the dots to move between cities; i shows the list of them. */
      const C = [['Gainesville', 29.652, -82.325], ['Jacksonville', 30.332, -81.656], ['Boca Raton', 26.368, -80.128], ['St. Louis', 38.627, -90.199], ['Palo Alto', 37.442, -122.143], ['Deerfield Beach', 26.318, -80.1]];
      const cache = {};
      let k = 0, flipped = false;
      const ST = { Gainesville: 'Florida', Jacksonville: 'Florida', 'Boca Raton': 'Florida', 'St. Louis': 'Missouri', 'Palo Alto': 'California', 'Deerfield Beach': 'Florida' };
      const words = (c) => c === 0 ? 'Clear' : c <= 2 ? 'Partly Cloudy' : c === 3 ? 'Cloudy' : c <= 48 ? 'Fog' : c <= 57 ? 'Drizzle' : c <= 67 ? 'Rain' : c <= 77 ? 'Snow' : c <= 82 ? 'Showers' : 'Thunderstorms';
      /* Small drawn icons for the rows: a sun, a sun behind cloud, cloud,
         rain, snow, a storm. The big one over the card is the same, larger. */
      const kind = (c, day = 1) => c === 0 ? (day ? 'sun' : 'moon') : c <= 2 ? (day ? 'part' : 'moon') : c <= 48 ? 'cloud' : c <= 67 || (c >= 80 && c <= 82) ? 'rain' : c <= 77 ? 'snow' : 'storm';
      let gid = 0;
      const art = (t, big) => {
        const g = 'wxg' + (++gid);
        const sun = `<radialGradient id="${g}s" cx=".42" cy=".38" r=".62"><stop offset="0" stop-color="#fffbd2"/><stop offset=".45" stop-color="#ffe14a"/><stop offset="1" stop-color="#f3a20c"/></radialGradient><radialGradient id="${g}h"><stop offset=".55" stop-color="#ffd84a" stop-opacity=".55"/><stop offset="1" stop-color="#ffb000" stop-opacity="0"/></radialGradient>`;
        const cloud = `<linearGradient id="${g}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#c9d3df"/></linearGradient>`;
        const S = `${big ? `<circle cx="50" cy="44" r="40" fill="url(#${g}h)"/>` : ''}<circle cx="50" cy="44" r="26" fill="url(#${g}s)"/>`;
        const Cl = (x, y, s, o = 1) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}"><path d="M10 30a10 10 0 0 1 3-19 14 14 0 0 1 26-3 11 11 0 0 1 15 10 9 9 0 0 1-2 12z" fill="url(#${g}c)"/></g>`;
        const body = { sun: S, moon: `<mask id="${g}m"><rect width="100" height="92" fill="#fff"/><circle cx="63" cy="34" r="21" fill="#000"/></mask><radialGradient id="${g}g"><stop offset=".5" stop-color="#dfe6ff" stop-opacity=".35"/><stop offset="1" stop-color="#dfe6ff" stop-opacity="0"/></radialGradient>${big ? `<circle cx="48" cy="46" r="38" fill="url(#${g}g)"/>` : ''}<circle cx="48" cy="46" r="25" fill="#f2f4fb" mask="url(#${g}m)"/>`, part: S + Cl(28, 46, 1.1, .95), cloud: Cl(14, 22, 1.3), rain: Cl(14, 18, 1.3) + '<path d="M34 72l-4 9M50 72l-4 9M66 72l-4 9" stroke="#9cc7ff" stroke-width="4" stroke-linecap="round"/>', snow: Cl(14, 18, 1.3) + '<g fill="#fff"><circle cx="34" cy="78" r="3.5"/><circle cx="50" cy="82" r="3.5"/><circle cx="66" cy="78" r="3.5"/></g>', storm: Cl(14, 16, 1.3) + '<path d="M50 62l-9 15h8l-5 13 15-19h-9l6-9z" fill="#ffd84a"/>' }[t];
        return `<svg viewBox="0 0 100 92" aria-hidden="true"><defs>${sun}${cloud}</defs>${body}</svg>`;
      };
      app.el.innerHTML = '<div class="wx2"><div class="wx-card"></div><div class="wx-dots"></div></div>';
      const card = app.el.querySelector('.wx-card'), dots = app.el.querySelector('.wx-dots');
      const load = async (i) => {
        if (cache[i]) return cache[i];
        const [, la, lo] = C[i];
        const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&current=temperature_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto&forecast_days=6`);
        if (!r.ok) throw new Error('weather');
        return (cache[i] = await r.json());
      };
      const draw = async () => {
        dots.innerHTML = C.map((_, i) => `<i class="${i === k ? 'on' : ''}"></i>`).join('');
        if (flipped) {
          card.className = 'wx-card back';
          card.innerHTML = `<div class="wx-bh"><b>Cities</b><button type="button" data-a="done">Done</button></div><ul>${C.map(([n], i) => `<li><button type="button" data-c="${i}">${esc(n)}</button></li>`).join('')}</ul><p class="wx-src">Forecasts from Open-Meteo.</p>`;
          return;
        }
        const [name] = C[k];
        card.className = 'wx-card';
        card.innerHTML = `<div class="wx-art"></div><div class="hd"><div class="city">${esc(name)}</div><div class="st">${esc(ST[name])}</div><div class="cond">Loading…</div><div class="tmp">–<sup>°</sup></div></div><ul></ul><div class="wx-foot"><span class="wx-by">Open-Meteo</span><span class="upd"></span><button type="button" data-a="info" aria-label="Cities">i</button></div>`;
        try {
          const d = await load(k);
          if (C[k][0] !== name || flipped) return;
          const day = d.current.is_day;
          card.classList.toggle('night', !day);
          card.querySelector('.wx-art').innerHTML = art(kind(d.current.weather_code, day), true);
          card.querySelector('.tmp').innerHTML = Math.round(d.current.temperature_2m) + '<sup>°</sup>';
          card.querySelector('.cond').textContent = words(d.current.weather_code);
          card.querySelector('ul').innerHTML = d.daily.time.map((t, i) => `<li><span class="dd">${new Date(t + 'T12:00').toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()}</span><span class="ii">${art(kind(d.daily.weather_code[i]))}</span><span class="gg">${Math.round(d.daily.temperature_2m_max[i])}°</span><span class="lo">${Math.round(d.daily.temperature_2m_min[i])}°</span></li>`).join('');
          const n = now();
          card.querySelector('.upd').innerHTML = `Updated ${n.getMonth() + 1}/${n.getDate()}/${String(n.getFullYear()).slice(2)} <b>${hm(n)}</b>`;
        } catch (x) {
          card.querySelector('.cond').textContent = 'Weather is unavailable right now.';
        }
      };
      const step = (d) => { k = (k + d + C.length) % C.length; SFX.click(); draw(); };
      app.el.addEventListener('click', (e) => {
        const a = e.target.closest('[data-a]');
        if (a) { SFX.click(); flipped = a.dataset.a === 'info'; card.classList.add('flip'); setTimeout(() => { card.classList.remove('flip'); draw(); }, 180); return; }
        const c = e.target.closest('[data-c]');
        if (c) { k = +c.dataset.c; flipped = false; draw(); return; }
        const dot = e.target.closest('.wx-dots i');
        if (dot) { k = [...dots.children].indexOf(dot); draw(); }
      });
      let x0 = null;
      app.el.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
      app.el.addEventListener('pointerup', (e) => { if (x0 !== null && Math.abs(e.clientX - x0) > 40 && !flipped) step(e.clientX < x0 ? 1 : -1); x0 = null; });
      draw();
    } },
    skills: { name: 'Settings', icon: 'settings', open(app) {
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
            else { sw.classList.remove('on'); setTimeout(() => { sw.classList.add('on'); alertBox('Open to Work', 'This setting stays on.'); }, 250); }
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
                  if (rr === 'Reset') { ['ip-notes', 'ip-events', 'ip-card', 'ip-read'].forEach((k) => store.set(k, null)); alertBox('Reset Complete'); }
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
    contact: { name: 'Phone', icon: 'phone', open: phoneApp },
    email: { name: 'Mail', icon: 'mail', open: mailApp },
    resume: { name: 'Web', icon: 'safari', bare: true, bar: 'gray', open(app) { safari(app, P.resume + '#view=FitH', 'ajaysommi.github.io/' + P.resume); } }
  };

  const viewer = (app, s, k, bar = 'gray') => {
    const v = h('div', 'photo-view');
    let auto = 0;
    const api = {};
    const draw = () => { v.innerHTML = `<div class="pv-top"><button type="button" data-x>Done</button><b>${k + 1} of ${s.steps.length}</b><span></span></div><img src="${s.steps[k][0].replace('-480', '-960')}" alt="${esc(s.steps[k][1])}" /><div class="cap"><b>${esc(s.steps[k][1])}</b>${esc(s.steps[k][2])}</div><div class="tbar"><button type="button" data-d="-1">◀</button><button type="button" data-p>${auto ? '❙❙' : '▶'}</button><button type="button" data-d="1">▶▶</button></div>`; };
    const step = (d) => { k = (k + d + s.steps.length) % s.steps.length; draw(); };
    draw();
    v.addEventListener('click', (ev) => {
      const b = ev.target.closest('button');
      if (!b) return;
      if (b.hasAttribute('data-x')) { clearInterval(auto); v.remove(); setBar(bar); api.onDone && api.onDone(); return; }
      if (b.hasAttribute('data-p')) { if (auto) { clearInterval(auto); auto = 0; } else auto = setInterval(() => step(1), 2200); draw(); return; }
      step(+b.dataset.d);
    });
    let x0 = null;
    v.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    v.addEventListener('pointerup', (e) => { if (x0 !== null && Math.abs(e.clientX - x0) > 40) step(e.clientX < x0 ? 1 : -1); x0 = null; });
    app.el.appendChild(v);
    setBar('black');
    api.play = () => { auto = setInterval(() => step(1), 2200); draw(); };
    return api;
  };

  /* ----------------------------------------------------------- springboard */

  /* The original grid: icons 57 points square, columns 75 apart starting
     19 in, rows 90 apart starting 19 under the status bar. */
  const GRID = ['guestbook', 'experience', 'builds', 'portfolio', 'projects', 'impact', 'places', 'weather', 'skills', 'notes', 'github', 'linkedin'];
  const DOCK = ['contact', 'email', 'resume', 'about'];
  const iconBtn = (id) => {
    const b = h('button', 'ip-icon', `<span class="ic">${ICON[APPS[id].icon]()}</span><span class="lbl">${esc(APPS[id].name)}</span>`);
    b.type = 'button';
    b.setAttribute('aria-label', APPS[id].name);
    b.dataset.id = id;
    b.addEventListener('click', () => openApp(id, b));
    return b;
  };
  /* Each icon knows the way to the middle (--cx, --cy) for when an app
     opens, and starts out beyond the edges along that same line, so the
     board flies together from outside in, the outer icons landing first. */
  const place = (b, x, y) => {
    const cx = 160 - (x + 28.5), cy = 240 - (y + 28.5), d = Math.hypot(cx, cy);
    b.style.setProperty('--cx', cx + 'px');
    b.style.setProperty('--cy', cy + 'px');
    b.dataset.d = d;
    b.style.transition = 'none';
    b.style.transform = `translate(${-cx * 1.6}px, ${-cy * 1.6}px) scale(1.5)`;
  };
  const drawBoard = () => {
    grid.innerHTML = '';
    dock.innerHTML = '';
    GRID.forEach((id, i) => {
      const b = iconBtn(id);
      const c = i % 4, r = Math.floor(i / 4);
      b.style.left = 19.4 - 8.5 + c * 75 + 'px';
      b.style.top = 19.2 + r * 90.4 + 'px';
      grid.appendChild(b);
      place(b, 19.4 + c * 75, 20 + 19.2 + r * 90.4);
    });
    DOCK.forEach((id, i) => {
      const b = iconBtn(id);
      b.style.left = 19.4 - 8.5 + i * 75 + 'px';
      b.style.top = '10.6px';
      dock.appendChild(b);
      place(b, 19.4 + i * 75, 388.8 + 10.6);
    });
    showUnread();
  };
  const flyIn = (unlocking) => {
    const icons = [...room.querySelectorAll('.ip-icon')];
    const far = Math.max(...icons.map((b) => +b.dataset.d));
    void board.offsetWidth;
    board.classList.remove('is-flying');
    /* Slow off the mark, then faster and faster until they hit their
       places: an ease-in with no settle, the outer ring a beat ahead. */
    icons.forEach((b) => {
      /* Unlocking takes its time, a smooth sweep in; Home is quicker. */
      b.style.transition = unlocking ? 'transform .5s cubic-bezier(.32, 0, .58, 1), opacity .3s ease' : 'transform .2s cubic-bezier(.97, 0, 1, .02), opacity .06s linear';
      b.style.transitionDelay = Math.round((1 - +b.dataset.d / far) * (unlocking ? 50 : 20)) + 'ms';
      b.style.transform = '';
    });
    setTimeout(() => icons.forEach((b) => { b.style.transition = ''; b.style.transitionDelay = ''; }), unlocking ? 650 : 360);
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
    else { knob.classList.add('is-back'); knob.style.transform = ''; slideTxt.style.opacity = ''; armSleep(); }
  };
  knob.addEventListener('pointerup', release);
  knob.addEventListener('pointercancel', release);
  knob.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' || e.key === 'Enter') unlock(); });

  function unlock() {
    if (state !== 'locked') return;
    state = 'home';
    noteSeen = true;
    quietUntil = performance.now() + 600;
    SFX.click();
    lock.classList.add('is-gone');
    clearTimeout(sleepT);
    setBar('black');
    tickClock();
    setTimeout(() => flyIn(true), 150);
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
    armSleep();
    tickClock();
  }

  /* --------------------------------------------------------------- buttons */

  let asleep = false;
  homeBtn.addEventListener('click', () => {
    if (state === 'boot') return;
    if (asleep) { wake(); return; }
    if (state === 'app') { SFX.click(); closeApp(); return; }
    if (state === 'locked') armSleep();
    if (state === 'locked') knob.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(16px)' }, { transform: 'translateX(0)' }], { duration: 380, easing: 'ease-out' });
  });
  const wake = () => { asleep = false; off.classList.remove('on'); if (state === 'locked') armSleep(); };
  /* Left on the lock screen, the display goes dark after a few seconds,
     as the real one did; the home or sleep button wakes it. */
  let sleepT = 0;
  function armSleep() {
    clearTimeout(sleepT);
    sleepT = setTimeout(() => { if (state === 'locked' && !asleep && !drag) { asleep = true; off.classList.add('on'); } }, 4000);
  }
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
    setTimeout(() => boot.classList.add('is-shine'), 250);
    setTimeout(() => boot.classList.add('is-out'), 1150);
    setTimeout(() => {
      boot.classList.add('is-gone');
      state = 'locked';
      tickClock();
      setInterval(tickClock, 10000);
      armSleep();
    }, 1650);
  });
} };
