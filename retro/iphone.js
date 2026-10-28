/* ==========================================================================
   iPhone 2G, one of the phones on the era picker. The handset is a
   photograph (retro/dev/iphone-2g.webp, kept out of git) when it is
   present, with the live screen laid exactly over its display: in that
   photo the display is the 661 by 991 pixel box at (68, 262), a 2:3 box
   the 320 by 480 point screen fills at 2.0656 pixels a point. Without the
   photo, a drawn handset stands in.

   The software follows the first iPhone OS as closely as it can: the
   silver boot mark, slide to unlock, the springboard grid over a
   perforated dock, glossy icons, blue-grey bars with arrow-shaped back
   buttons, pinstriped tables, bubbly text messages. Every app is a part
   of the portfolio.
   ========================================================================== */
window.IPHONE = { start(room, exit) {

  const P = window.PORTFOLIO;
  const { esc, store, usedAt } = window.RETRO;
  const SFX = window.SFX;
  const PHOTO = 'retro/dev/iphone-2g.webp';
  const WALL = 'assets/images/iphone-wallpaper.webp';
  const HV = "font-family=\"Helvetica,Helvetica Neue,Arial,sans-serif\"";

  /* The AJ mark's four shapes, for the silver boot logo. */
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
          <div class="ip-status"><span class="l"><span class="ip-sig"><i></i><i></i><i></i><i></i><i></i></span><b>SOMMI</b><span class="ip-edge">E</span></span><span class="c"></span><span class="r"><span class="ip-bat"><i></i></span></span></div>
          <div class="ip-board is-flying"><div class="ip-grid"></div><div class="ip-dock"></div></div>
          <div class="ip-lock" style="background-image:url(${WALL})"><div class="top"><div class="time"></div><div class="date"></div></div><div class="bot"><div class="ip-slider"><div class="txt">slide to unlock</div><div class="ip-knob" role="slider" aria-label="Slide to unlock" tabindex="0"><svg viewBox="0 0 34 24"><defs><linearGradient id="kar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9d9d9d"/><stop offset="1" stop-color="#6b6b6b"/></linearGradient></defs><path d="M4 8.5h14V3.5L30 12 18 20.5v-5H4z" fill="url(#kar)" stroke="#5d5d5d" stroke-width=".6" stroke-linejoin="round"/></svg></div></div></div></div>
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
  const GREEN = lg('g', [[0, '#9cef77'], [0.5, '#4cc43a'], [1, '#1f9b1b']]);

  const ICON = {
    sms: () => ic(`<rect width="57" height="57" fill="url(#g)"/><path d="M28.5 10c12.4 0 21.5 7.4 21.5 16.6S40.9 43.2 28.5 43.2c-2.3 0-4.6-.3-6.6-.8L12 48.6l3.3-8.8C10 36.8 7 32 7 26.6 7 17.4 16.1 10 28.5 10z" fill="#fff"/>
        <text x="28.5" y="31.5" text-anchor="middle" ${HV} font-weight="bold" font-size="13.5" fill="#33a724" letter-spacing="-.3">SMS</text>`, GREEN),
    calendar: () => { const d = now(); return ic(`<rect width="57" height="57" fill="url(#w)"/><rect width="57" height="17" fill="url(#r)"/><rect y="17" width="57" height=".8" fill="#7d0d0d" opacity=".55"/>
        <text x="28.5" y="12.6" text-anchor="middle" ${HV} font-weight="bold" font-size="10.5" fill="#fff">${d.toLocaleDateString('en-US', { weekday: 'long' })}</text>
        <text x="28.5" y="50" text-anchor="middle" ${HV} font-weight="bold" font-size="34" fill="#1d1d1d" letter-spacing="-1.5">${d.getDate()}</text>`,
      lg('w', [[0, '#ffffff'], [0.6, '#f1f1f1'], [1, '#d4d4d4']]) + lg('r', [[0, '#f57a7a'], [0.5, '#df2b2b'], [1, '#b30f0f']])); },
    photos: () => {
      let pet = '';
      for (let i = 0; i < 18; i++) pet += `<ellipse cx="27" cy="11" rx="3.6" ry="9.2" fill="url(#p)" stroke="#d98a00" stroke-width=".35" transform="rotate(${i * 20} 27 23)"/>`;
      return ic(`<rect width="57" height="57" fill="url(#s)"/><ellipse cx="9" cy="49" rx="13" ry="4.5" fill="#fff" opacity=".75"/><ellipse cx="48" cy="52" rx="12" ry="4" fill="#fff" opacity=".6"/>
        <path d="M27 30q4 12 1 27h3.4q2-14-1.6-27z" fill="#2f7a17"/><path d="M30 45q10-10 18-6-8 8-18 8z" fill="#43a522"/><path d="M28 50q-8-8-15-4 7 6 15 6z" fill="#3b961d"/>${pet}<circle cx="27" cy="23" r="8" fill="url(#c)"/>`,
      lg('s', [[0, '#2774d4'], [0.55, '#64abeb'], [1, '#bfe0fb']]) + lg('p', [[0, '#ffe76a'], [1, '#f5a500']]) + rg('c', [[0, '#8a5a1e'], [0.7, '#4c2a08'], [1, '#2e1704']]));
    },
    camera: () => ic(`<rect width="57" height="57" fill="url(#bg)"/><circle cx="28.5" cy="28.5" r="20" fill="url(#ring)"/><circle cx="28.5" cy="28.5" r="15.5" fill="#0d0d0f"/><circle cx="28.5" cy="28.5" r="11" fill="url(#lens)"/>
        <circle cx="28.5" cy="28.5" r="5" fill="#05070c"/><ellipse cx="24" cy="23.5" rx="3.6" ry="2.4" fill="#fff" opacity=".7" transform="rotate(-30 24 23.5)"/><circle cx="33" cy="33" r="1.6" fill="#7fb0ff" opacity=".8"/>`,
      lg('bg', [[0, '#f6f6f6'], [0.5, '#cfcfcf'], [1, '#8a8a8a']]) + lg('ring', [[0, '#e8e8e8'], [1, '#5e5e5e']]) + rg('lens', [[0, '#3e64b8'], [0.6, '#162a5e'], [1, '#05070c']], 0.4, 0.35)),
    tv: () => ic(`<rect width="57" height="57" fill="url(#wood)"/><rect x="4.5" y="5.5" width="48" height="36" rx="9" fill="#5a3412" opacity=".7"/><rect x="6" y="7" width="45" height="33" rx="8" fill="url(#scr)" stroke="#3c2208" stroke-width=".8"/>
        <path d="M8 13q20-7 41 0v8q-20 6-41 0z" fill="#fff" opacity=".2"/><text x="28.5" y="29" text-anchor="middle" font-family="Menlo,Monaco,monospace" font-weight="bold" font-size="11" fill="#e6f2d6" opacity=".8">&lt;/&gt;</text>
        <rect x="6" y="44" width="45" height="9" rx="2" fill="#3c2208" opacity=".45"/><circle cx="12" cy="48.5" r="3.2" fill="url(#k)"/><circle cx="45" cy="48.5" r="3.2" fill="url(#k)"/>${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${20.5 + i * 2.4}" y="45.5" width="1.2" height="6" fill="#2a1604" opacity=".7"/>`).join('')}`,
      lg('wood', [[0, '#d9a66a'], [0.5, '#a96e33'], [1, '#6f4116']]) + rg('scr', [[0, '#b9c6a3'], [0.75, '#6f7f5c'], [1, '#3c4a32']], 0.45, 0.3, 0.75) + rg('k', [[0, '#f4ead4'], [1, '#6e5a3a']], 0.4, 0.35)),
    stocks: () => ic(`<rect width="57" height="57" fill="url(#bg)"/>${[11, 23, 35, 47].map((x) => `<line x1="${x}" y1="4" x2="${x}" y2="47" stroke="#fff" stroke-opacity=".35" stroke-width=".7"/>`).join('')}
        <path d="M0 34l4-3 4 2 4-7 4 5 4-9 4 6 4-3 4 4 4-10 4 5 4-4 4 3 5-6" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/>
        <rect y="47" width="57" height="10" fill="#0f4aa6" opacity=".55"/><text x="4" y="54.5" ${HV} font-size="6" fill="#fff">'19</text><text x="24" y="54.5" ${HV} font-size="6" fill="#fff">'22</text><text x="46" y="54.5" ${HV} font-size="6" fill="#fff">'26</text>`,
      lg('bg', [[0, '#8cc8ff'], [0.45, '#3f92ef'], [1, '#1756c3']])),
    maps: () => ic(`<rect width="57" height="57" fill="#ede3c9"/><path d="M0 0h22v19H0zM37 37h20v20H37z" fill="#cfe2b4"/><path d="M38 0h19v14H38z" fill="#b9d3ea"/>
        <path d="M-2 24 59 30" stroke="#fff" stroke-width="7.5"/><path d="M-2 24 59 30" stroke="#f3c03c" stroke-width="4.5"/><path d="M23 -2 27 59" stroke="#fff" stroke-width="6"/><path d="M23 -2 27 59" stroke="#f3c03c" stroke-width="3"/><path d="M6 44q14 0 18 15" stroke="#fff" stroke-width="2.6" fill="none"/>
        <path d="M33 3h16v9q0 5.5-8 8.5-8-3-8-8.5z" fill="#1f50c4" stroke="#fff" stroke-width="1.1"/><path d="M33 3h16v3.4H33z" fill="#d42222"/><text x="41" y="14.6" text-anchor="middle" ${HV} font-weight="bold" font-size="6.6" fill="#fff">280</text>
        <path d="M17.6 33.5h1.3v11h-1.3z" fill="#7a7a7a"/><circle cx="18.2" cy="30" r="4.8" fill="url(#pin)"/><circle cx="16.8" cy="28.6" r="1.4" fill="#fff" opacity=".8"/>`,
      rg('pin', [[0, '#ff8d8d'], [0.6, '#d40f0f'], [1, '#8f0000']], 0.35, 0.35)),
    weather: () => ic(`<rect width="57" height="57" fill="url(#bg)"/><circle cx="30" cy="22" r="17" fill="url(#glow)"/><circle cx="30" cy="22" r="11" fill="url(#sun)"/>
        <text x="50" y="50" text-anchor="end" ${HV} font-weight="bold" font-size="13" fill="#fff">26°</text>`,
      lg('bg', [[0, '#5fb4ff'], [0.5, '#2f86f0'], [1, '#165ad0']]) + rg('glow', [[0, '#ffe680', 0.7], [1, '#ffe680', 0]]) + rg('sun', [[0, '#fff6a6'], [0.6, '#ffc61a'], [1, '#f39400']], 0.4, 0.35)),
    settings: () => { let t = ''; for (let i = 0; i < 16; i++) t += `<rect x="25.9" y="5.5" width="5.2" height="8" rx="1.2" transform="rotate(${i * 22.5} 28.5 28.5)"/>`; return ic(`<rect width="57" height="57" fill="url(#bg)"/><rect x="3" y="3" width="51" height="51" rx="8" fill="url(#in)"/>
        <g fill="url(#gr)">${t}<circle cx="28.5" cy="28.5" r="17"/></g><circle cx="28.5" cy="28.5" r="11.5" fill="url(#hub)"/><circle cx="28.5" cy="28.5" r="5" fill="#4b4b4b"/><circle cx="28.5" cy="28.5" r="2.6" fill="#bdbdbd"/>`,
      lg('bg', [[0, '#e3e3e3'], [1, '#7b7b7b']]) + rg('in', [[0, '#9a9a9a'], [1, '#5b5b5b']]) + lg('gr', [[0, '#d2d2d2'], [1, '#7b7b7b']]) + rg('hub', [[0, '#f2f2f2'], [1, '#8a8a8a']], 0.4, 0.35)); },
    notes: () => ic(`<rect width="57" height="57" fill="url(#pad)"/>${[23, 29.5, 36, 42.5, 49].map((y) => `<line x1="0" y1="${y}" x2="57" y2="${y}" stroke="#c9b45a" stroke-width=".7"/>`).join('')}
        <rect width="57" height="15" fill="url(#lth)"/><rect y="14.2" width="57" height="1.6" fill="#3a1f05"/>${[...Array(14)].map((_, i) => `<rect x="${2 + i * 4}" y="2.4" width="2" height=".9" fill="#e6c79a" opacity=".55"/>`).join('')}`,
      lg('pad', [[0, '#fff6b0'], [1, '#f2d35a']]) + lg('lth', [[0, '#a0703e'], [0.5, '#6e4318'], [1, '#4b2a09']])),
    phone: () => ic(`<rect width="57" height="57" fill="url(#g)"/><path d="M17.6 9.6c2.5-1.7 5.1-.5 6 2.3l1.7 4.7c.8 2.4-.5 3.7-2.3 4.7 1.1 4.3 4.4 8.3 8.6 10.1 1.1-1.7 2.8-3.1 5.2-2.2l4.9 2.1c2.6 1.1 3.5 3.7 1.8 6.1-2.1 3.2-6.3 4.9-10.5 3.5-9.4-3.3-17-11.2-19.7-20.2-1.2-4.3.6-8.8 4.3-11.1z" fill="#fff"/>`, GREEN),
    mail: () => ic(`<rect width="57" height="57" fill="url(#sky)"/><ellipse cx="11" cy="48" rx="15" ry="6" fill="#fff" opacity=".9"/><ellipse cx="44" cy="51" rx="16" ry="6" fill="#fff" opacity=".8"/><ellipse cx="30" cy="54" rx="12" ry="4" fill="#fff" opacity=".85"/>
        <rect x="8" y="15" width="41" height="27" rx="1.2" fill="url(#env)" stroke="#9aaac0" stroke-width=".7"/><path d="M8.4 15.6 28.5 31 48.6 15.6" fill="none" stroke="#9aaac0" stroke-width="1.3"/><path d="M8.4 41.5 23 27.6M48.6 41.5 34 27.6" stroke="#c5d0dd" stroke-width=".9"/>`,
      lg('sky', [[0, '#2f7ce6'], [0.6, '#79b9f6'], [1, '#c5e3fb']]) + lg('env', [[0, '#ffffff'], [1, '#dfe6ef']])),
    safari: () => { let t = ''; for (let i = 0; i < 48; i++) t += `<line x1="28.5" y1="9.5" x2="28.5" y2="${i % 4 ? 11.2 : 12.6}" stroke="#fff" stroke-width=".6" transform="rotate(${i * 7.5} 28.5 28.5)"/>`; return ic(`<rect width="57" height="57" fill="url(#bg)"/><circle cx="28.5" cy="28.5" r="22" fill="url(#rim)"/><circle cx="28.5" cy="28.5" r="19.5" fill="url(#dial)"/>${t}
        ${[['N', 28.5, 17.6], ['S', 28.5, 43.4], ['E', 41.6, 30.4], ['W', 15.4, 30.4]].map(([l, x, y]) => `<text x="${x}" y="${y}" text-anchor="middle" ${HV} font-weight="bold" font-size="4.6" fill="#fff">${l}</text>`).join('')}
        <path d="M28.5 28.5 40 15.5 31.4 31.2z" fill="#e3261d"/><path d="M28.5 28.5 17 41.5 25.6 25.8z" fill="#f2f2f2"/><circle cx="28.5" cy="28.5" r="1.6" fill="#999"/>`,
      lg('bg', [[0, '#f4f8fd'], [1, '#a9bdd6']]) + lg('rim', [[0, '#ffffff'], [1, '#b8c2cf']]) + rg('dial', [[0, '#a8deff'], [0.75, '#2c88e2'], [1, '#1259b3']], 0.45, 0.38, 0.62)); },
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

  /* The back button, shaped as it was: a point on the left, glossy. */
  let bid = 0;
  const backBtn = (label, theme) => {
    const k = 'bb' + (++bid);
    const C = theme === 'black' ? ['#717171', '#3a3a3a', '#262626', '#1a1a1a', '#000'] : theme === 'notes' ? ['#cfa778', '#9a6b35', '#8a5d2a', '#7a5222', '#3f2408'] : ['#a3b5cd', '#7690b4', '#5f7ea8', '#56769f', '#33496b'];
    const b = h('button', 'nbb l', `<svg class="arw" viewBox="0 0 13 30" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C[0]}"/><stop offset=".5" stop-color="${C[1]}"/><stop offset=".51" stop-color="${C[2]}"/><stop offset="1" stop-color="${C[3]}"/></linearGradient></defs><path d="M13.5 .5H11.6L2.4 13.4Q1.4 15 2.4 16.6L11.6 29.5H13.5" fill="url(#${k})" stroke="${C[4]}" stroke-width="1"/></svg><span>${esc(label)}</span>`);
    b.type = 'button';
    return b;
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
    scr.appendChild(el);
    const app = { el, stack: [], def };
    if (def.bare) { setBar(def.bar || 'black'); def.open(app); return app; }
    const nb = h('div', 'nb' + (def.nb ? ' ' + def.nb : ''), '<span class="t"></span>');
    const vw = h('div', 'vw');
    el.append(nb, vw);
    app.nb = nb; app.vw = vw;
    setBar(def.bar || 'gray');
    app.push = (title, fill, opts = {}) => {
      const pg = h('div', 'pg' + (opts.cls ? ' ' + opts.cls : ''));
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
    app.redraw = () => drawBar();
    const drawBar = () => {
      const top = app.stack[app.stack.length - 1];
      nb.querySelectorAll('.nbb, .seg').forEach((b) => b.remove());
      nb.querySelector('.t').textContent = top.title;
      nb.classList.toggle('has-seg', !!top.opts.seg);
      if (app.stack.length > 1) {
        const b = backBtn(top.opts.back || app.stack[app.stack.length - 2].title, def.nb);
        b.addEventListener('click', app.pop);
        nb.appendChild(b);
      } else if (top.opts.left) {
        const b = h('button', 'nbb ll', esc(top.opts.left[0]));
        b.type = 'button';
        b.addEventListener('click', top.opts.left[1]);
        nb.appendChild(b);
      }
      if (top.opts.right) {
        const b = h('button', 'nbb r' + (top.opts.blue ? ' blue' : '') + (top.opts.right[0] === '+' ? ' plus' : ''), esc(top.opts.right[0]));
        b.type = 'button';
        b.addEventListener('click', top.opts.right[1]);
        nb.appendChild(b);
      }
      if (top.opts.seg) nb.appendChild(top.opts.seg);
      const side = Math.max(0, ...[...nb.querySelectorAll('.nbb')].map((b) => b.offsetWidth + (b.classList.contains('l') ? 22 : 10)));
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

  /* Tables. */
  const plain = (pg, rows) => {
    const ul = h('ul', 'pl');
    rows.forEach((r) => {
      if (r.header) { ul.appendChild(h('li', 'sh', esc(r.header))); return; }
      const li = h('li', (r.go ? 'chev ' : '') + (r.sub ? 'two ' : '') + (r.cls || ''), `${r.img ? `<img src="${r.img}" alt="" />` : ''}${r.lead || ''}<span class="tx">${esc(r.text)}${r.sub ? `<span class="sub">${esc(r.sub)}</span>` : ''}</span>${r.rt ? `<span class="rt">${esc(r.rt)}</span>` : ''}`);
      if (r.go) li.addEventListener('click', () => { SFX.click(); r.go(); });
      ul.appendChild(li);
    });
    pg.appendChild(ul);
    return ul;
  };
  const group = (rows) => `<div class="gp">${rows.map(([k, v, n]) => `<div class="row">${k ? `<span class="k">${esc(k)}</span>` : ''}<span class="v${n ? ' n' : ''}">${v}</span></div>`).join('')}</div>`;
  const kv = (rows) => `<div class="gp">${rows.map(([k, v]) => `<div class="row"><span class="v">${esc(k)}</span><span class="rv">${esc(v)}</span></div>`).join('')}</div>`;
  const toggle = (on, key) => `<button type="button" class="sw${on ? ' on' : ''}" data-sw="${key}" role="switch" aria-checked="${on}"><span class="sw-on">ON</span><span class="sw-off">OFF</span><i></i></button>`;

  /* A segmented control, as in Calendar's nav bar. */
  const seg = (items, sel, on) => {
    const s = h('div', 'seg', items.map((x, i) => `<button type="button" class="${i === sel ? 'on' : ''}" data-i="${i}">${esc(x)}</button>`).join(''));
    s.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (!b) return; s.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); SFX.click(); on(+b.dataset.i); });
    return s;
  };

  /* Safari: the address on top, the toolbar below. */
  const safari = (app, url, label) => {
    app.el.innerHTML = `<div class="saf-top"><span class="saf-url">${esc(label)}</span><a href="${url}" target="_blank" rel="noopener" class="saf-open">Open</a></div><iframe class="saf-frame" src="${url}" title="${esc(label)}"></iframe><div class="saf-bot"><span>◀</span><span class="dim">▶</span><span>+</span><span class="bk"></span><span class="pg2"></span></div>`;
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

  /* Calendar: List, Day and Month, as the first Calendar had them. */
  const calendar = (app) => {
    let view = 0;
    let month = new Date(now().getFullYear(), now().getMonth(), 1);
    const roles = [...P.experience].reverse();
    const listView = (pg) => {
      const rows = [];
      roles.forEach((e, i, arr) => {
        if (i === 0 || arr[i - 1].year !== e.year) rows.push({ header: String(e.year) });
        const s = span(e);
        rows.push({ text: e.short, lead: `<span class="cal-t">${MONTHS[s.start.m]}<br/><em>${MONTHS[s.end.m]}</em></span>`, cls: 'cal-row', go: () => app.push(e.short, roleDetail(e), { back: 'Calendar' }) });
      });
      plain(pg, rows);
    };
    /* Day view, with years for hours: each role a blue block where it fell. */
    const dayView = (pg) => {
      const y0 = 2019, y1 = 2027, H = 62;
      pg.classList.add('cal-day');
      pg.innerHTML = `<div class="cal-dh">◀ <b>Career</b> <span>2019 – 2026</span> ▶</div><div class="cal-hrs" style="height:${(y1 - y0) * H + 20}px">${[...Array(y1 - y0)].map((_, i) => `<div class="hr" style="top:${i * H + 10}px"><span>${y0 + i}</span></div>`).join('')}
        ${roles.map((e, i) => { const s = span(e); const a = (s.start.y - y0 + s.start.m / 12) * H + 10, b = (s.end.y - y0 + (s.end.m + 1) / 12) * H + 10; return `<button type="button" class="ev" data-i="${i}" style="top:${a}px;height:${Math.max(22, b - a - 2)}px;left:${i % 2 ? 150 : 56}px">${esc(e.short)}<span>${esc(e.role)}</span></button>`; }).join('')}</div>`;
      pg.addEventListener('click', (ev) => { const b = ev.target.closest('.ev'); if (b) { SFX.click(); const e = roles[+b.dataset.i]; app.push(e.short, roleDetail(e), { back: 'Calendar' }); } });
    };
    /* Month view: a real month; days a role started or ended get a dot. */
    const monthView = (pg) => {
      const draw = () => {
        const y = month.getFullYear(), m = month.getMonth();
        const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate(), prevDays = new Date(y, m, 0).getDate();
        const marks = {};
        P.experience.forEach((e) => { const s = span(e); if (s.start.y === y && s.start.m === m) (marks[1] = marks[1] || []).push(`${e.short} started`); if (s.end.y === y && s.end.m === m) (marks[days] = marks[days] || []).push(`${e.short} wrapped up`); });
        if (y === 2026 && m === 11) (marks[15] = marks[15] || []).push('Graduates from UF');
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
        const show = (d) => { evs.innerHTML = (marks[d] || []).map((x) => `<li><span class="cal-t">All-day</span><span class="tx">${esc(x)}</span></li>`).join('') || (Object.keys(marks).length ? '' : '<li class="none"><span class="tx">No events. Try another month.</span></li>'); };
        pg.querySelectorAll('.cd[data-d]').forEach((c) => c.addEventListener('click', () => { if (!c.dataset.d) return; pg.querySelectorAll('.cd').forEach((x) => x.classList.toggle('sel', x === c)); show(+c.dataset.d); }));
        pg.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => { month = new Date(y, m + +b.dataset.m, 1); draw(); }));
        const firstMark = Object.keys(marks)[0];
        show(firstMark || t.getDate());
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
    app.push('', (pg) => listView(pg), { seg: control, left: ['Today', () => { month = new Date(now().getFullYear(), now().getMonth(), 1); view = 2; control.querySelectorAll('button').forEach((b, k) => b.classList.toggle('on', k === 2)); render(); }], right: ['+', () => app.push('New Event', (pg) => { pg.classList.add('pin'); pg.innerHTML = `${group([['', 'Your team'], ['', 'Ajay Sommi, Software Engineer']])}<div class="gp"><div class="txt">Starts whenever you are ready. <a href="mailto:${P.email}">Send the invite</a>.</div></div>`; }, { back: 'Cancel' })] });
  };

  /* Text messages, bubbly, as they were. */
  const messages = (app) => {
    app.push('Text Messages', (pg) => plain(pg, P.recs.map(([n, c, q]) => ({ text: n, sub: q, rt: c.split(' ')[0], cls: 'sms-row', go: () => app.push(n.split(' ')[0], (p) => {
      p.classList.add('sms-pg');
      p.innerHTML = `<div class="sms"><div class="day">${esc(c)}</div><div class="bub in"><span>${esc(q)}</span></div><div class="bub out"><span>Thank you, ${esc(n.split(' ')[0])}! That means a lot.</span></div></div>`;
      const bar = h('div', 'sms-bar', '<span class="sms-field"></span><button type="button" class="sms-send">Send</button>');
      p.appendChild(bar);
    }, { right: ['Clear', () => {}], back: 'Messages' }) }))), { left: ['Edit', () => {}] });
  };

  const NOTES = [
    ['About me', `${P.about[0]}\n\n${P.about[1]}`],
    ['Off the clock', `“${P.quote}”\n\nRepairs, teardowns and builds: see Builds.`],
    ['To do', `Graduate from UF (Dec 2026)\nFind a great team\nSay hi: ${P.email}`]
  ];
  const notePage = ([t, b]) => (p) => {
    p.classList.add('note-pg');
    const d = now();
    p.innerHTML = `<div class="note"><div class="d"><span>Today</span><span>${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} &nbsp;${hm(d)}</span></div>${esc(b).replace(/\n/g, '<br/>')}</div><div class="note-tb"><span>⇦</span><span>✉</span><span>🗑︎</span><span>⇨</span></div>`;
  };

  const APPS = {
    guestbook: { name: 'Guestbook', icon: 'sms', open: messages },
    experience: { name: 'Experience', icon: 'calendar', open: calendar },
    builds: { name: 'Builds', icon: 'photos', cls: 'is-photos', open(app) {
      app.push('Photo Albums', (pg) => plain(pg, P.offclock.map((s) => ({ text: `${s.name} (${s.steps.length})`, img: s.cover, cls: 'alb', go: () => app.push(s.name, (p) => {
        p.classList.add('ph-pg');
        p.innerHTML = `<div class="grid4">${s.steps.map((st, k) => `<img src="${st[0]}" data-k="${k}" alt="${esc(st[1])}" />`).join('')}</div><div class="ph-lede">${esc(s.lede)}</div>`;
        p.addEventListener('click', (ev) => { const im = ev.target.closest('img[data-k]'); if (im) viewer(app, s, +im.dataset.k); });
      }) }))));
    } },
    about: { name: 'About Me', icon: 'camera', bare: true, bar: 'black', open(app) {
      app.el.innerHTML = `<div class="cam" style="background-image:url(${WALL})"><div class="iris">${[0, 1, 2, 3, 4, 5].map((i) => `<i style="--r:${i * 60}deg;transform:rotate(${i * 60}deg)"></i>`).join('')}</div><div class="flash"></div>
        <div class="cam-card"><b>Ajay Sommi</b><span>${esc(P.title)} · ${esc(P.citizen)}</span><p>${esc(P.about[1])}</p></div>
        <div class="bar"><button class="shut" type="button" aria-label="Take picture"><svg viewBox="0 0 30 22" width="30" height="22"><rect x="2" y="5" width="26" height="16" rx="3" fill="#333"/><circle cx="15" cy="13" r="5.5" fill="#bbb" stroke="#333" stroke-width="2"/><rect x="10" y="2" width="10" height="4" rx="1" fill="#333"/></svg></button></div></div>`;
      const cam = app.el.querySelector('.cam');
      setTimeout(() => cam.classList.add('is-open'), 250);
      app.el.querySelector('.shut').addEventListener('click', () => {
        const f = app.el.querySelector('.flash');
        SFX.insert();
        f.classList.add('on');
        cam.classList.remove('is-open');
        setTimeout(() => { f.classList.remove('on'); cam.classList.add('is-open'); }, 500);
      });
    } },
    projects: { name: 'Projects', icon: 'tv', cls: 'is-yt', bar: 'black', nb: 'black', open(app) {
      app.push('Featured', (pg) => plain(pg, P.projects.map((p, i) => ({ text: p.name, sub: p.stack, cls: 'yt-row', lead: `<span class="yt-th" style="--h:${i * 57 + 200}">${esc(p.name.slice(0, 2))}</span>`, go: () => app.push(p.name, (x) => {
        x.classList.add('pin');
        x.innerHTML = `${group([['', `${esc(p.full)}<br/><span style="font-weight:normal;color:#4c566c">${esc(p.kind)}</span>`]])}<div class="gp"><div class="txt">${esc(p.text)}</div></div>${group([['stack', esc(p.stack), 1]])}${p.url ? '<button class="gbtn" type="button" data-go>View on GitHub</button>' : '<div class="gl" style="text-align:center">Source is private for now</div>'}`;
        const b = x.querySelector('[data-go]');
        if (b) b.addEventListener('click', () => ext(p.url));
      }) }))));
      app.el.appendChild(h('div', 'tabs', ['Featured', 'Most Viewed', 'Bookmarks', 'Search', 'More'].map((n, i) => `<button type="button" class="${i ? '' : 'on'}"><svg viewBox="0 0 30 26"><path d="${['M15 2l3.8 8 8.6.9-6.4 5.8 1.9 8.5L15 21l-7.9 4.2L9 16.7 2.6 10.9l8.6-.9z', 'M3 22h5V12H3zM12 22h5V4h-5zM21 22h5V8h-5z', 'M6 3h18v21l-9-6-9 6z', 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zm0 3a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm6 12 8 7-2 2-7-8z', 'M4 12h5v5H4zM12.5 12h5v5h-5zM21 12h5v5h-5z'][i]}"/></svg>${n}</button>`).join('')));
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
      app.el.innerHTML = `<div class="stk"><div class="stk-list">${T.map(([s, v, c, d], i) => `<button type="button" class="row${i === 0 ? ' on' : ''}" data-i="${i}"><span class="s">${s}</span><span class="p">${v}</span><span class="c ${d}">${c}</span></button>`).join('')}</div><div class="stk-panel"><div class="stk-tabs">${['1y', '2y', '3y', '5y', '7y'].map((r, i) => `<span class="${i === 4 ? 'on' : ''}">${r}</span>`).join('')}</div><svg viewBox="0 0 280 90" preserveAspectRatio="none"></svg><div class="stk-ax"><span>2019</span><span>2021</span><span>2023</span><span>2026</span></div><p class="stk-d"></p></div><div class="stk-foot"><b>AJ</b><span>Updated today</span><b>i</b></div></div>`;
      const svg = app.el.querySelector('.stk-panel svg'), d = app.el.querySelector('.stk-d');
      const show = (i) => {
        const [s, v, , dir, rid, text] = T[i];
        const e = P.experience.find((x) => x.id === rid);
        let pts = '', y = dir === 'up' ? 78 : 18;
        for (let k = 0; k <= 28; k++) { y = Math.max(6, Math.min(84, y + (Math.sin(k * 1.9 + i) * 7) - (dir === 'up' ? 2.4 : -2.4))); pts += `${k * 10},${y.toFixed(1)} `; }
        svg.innerHTML = `${[20, 45, 70].map((g) => `<line x1="0" x2="280" y1="${g}" y2="${g}" stroke="#fff" stroke-opacity=".15"/>`).join('')}<polyline points="${pts}" fill="none" stroke="#fff" stroke-width="1.6"/>`;
        d.innerHTML = `<b>${s} ${v}</b> · ${esc(e.org)}, ${e.year}<br/>${esc(text)}`;
        app.el.querySelectorAll('.stk .row').forEach((r, k) => r.classList.toggle('on', k === i));
      };
      app.el.querySelector('.stk-list').addEventListener('click', (ev) => { const r = ev.target.closest('.row'); if (r) { SFX.click(); show(+r.dataset.i); } });
      show(0);
    } },
    places: { name: 'Places', icon: 'maps', bare: true, bar: 'gray', open(app) {
      const US = [[-124.7, 48.4], [-124, 42], [-122.4, 37.8], [-120.6, 34.6], [-117.1, 32.5], [-114.7, 32.7], [-111, 31.3], [-106.5, 31.8], [-103, 29], [-99.5, 26.4], [-97.2, 25.9], [-97.4, 27.8], [-94.7, 29.4], [-90, 29.2], [-89, 30.2], [-85, 29.7], [-83, 29], [-82.5, 27.5], [-81.7, 25.2], [-80.4, 25.2], [-80, 26.8], [-81.2, 30.3], [-79, 33.6], [-75.5, 35.3], [-76, 37], [-74, 40.5], [-70, 41.6], [-70.5, 43], [-67, 44.8], [-67.8, 47.1], [-69.2, 47.4], [-71.5, 45], [-75, 45], [-79, 43.3], [-83, 42], [-82.5, 45.3], [-84.6, 46.5], [-88, 48], [-95, 49], [-123, 49]];
      const X = (lon) => (lon + 126) / 60 * 320, Y = (lat) => (50 - lat) / 26 * 177 * 1.25;
      const CITIES = [['Jacksonville, FL', 30.33, -81.66, 'rjax'], ['Palo Alto, CA', 37.44, -122.14, 'rfa'], ['Gainesville, FL', 29.65, -82.32, 'fics'], ['Deerfield Beach, FL', 26.32, -80.1, 'jm'], ['St. Louis, MO', 38.63, -90.2, 'hunter'], ['Boca Raton, FL', 26.0, -80.13, 'adt']];
      app.el.innerHTML = `<div class="map" style="top:20px"><div class="map-bar"><span class="mb-bk"></span><span class="mb-f">Places I’ve worked</span></div><svg viewBox="0 0 320 240" height="240"><path d="M${US.map(([a, b]) => `${X(a).toFixed(1)} ${Y(b).toFixed(1)}`).join('L')}Z" fill="#f2efe9" stroke="#c9c0ad"/><path d="M${X(-120)} ${Y(47)}L${X(-90)} ${Y(41)}L${X(-80)} ${Y(35)}M${X(-117)} ${Y(33)}L${X(-97)} ${Y(32)}L${X(-82)} ${Y(30)}" stroke="#f3c64c" stroke-width="1.6" fill="none"/></svg>${CITIES.map(([n, la, lo], i) => `<button class="pin-d" type="button" data-i="${i}" style="left:${X(lo)}px;top:${30 + Y(la)}px;animation-delay:${i * 0.12}s" aria-label="${esc(n)}"></button>`).join('')}<div class="tbar map-tb"><button type="button" data-list>List</button></div></div>`;
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
    education: { name: 'Education', icon: 'weather', bare: true, bar: 'black', open(app) {
      const e = P.education;
      const W = [['OPERATING SYS.', '☀', 'A'], ['DATABASES', '⛅', 'A'], ['ALGORITHMS', '☀', 'A'], ['SOFTWARE ENG.', '☁', 'A'], ['A.I.', '☀', 'A'], ['SECURITY', '⚡', 'A']];
      app.el.style.background = '#000';
      app.el.innerHTML = `<div class="wx"><div class="wx-card"><div class="wx-sun"></div><div class="hd"><div class="city">Gainesville</div><div class="hi">UF · Class of Dec 2026</div><div class="tmp">26°</div></div>
        <ul>${W.map(([d, i, g]) => `<li><span class="dd">${d}</span><span class="ii">${i}</span><span class="gg">${g}</span></li>`).join('')}</ul>
        <div class="wx-foot"><b>AJ</b><span>${esc(e.degree)}</span><b>i</b></div></div></div>`;
    } },
    skills: { name: 'Skills', icon: 'settings', open(app) {
      const ICO = [['#3d7fe0', '⌨'], ['#5aa0e8', '☁'], ['#8a6ad8', '⧉'], ['#2fa36a', '⇄'], ['#f08b2a', '⚒'], ['#d24b4b', '♥']];
      app.push('Settings', (pg) => {
        pg.classList.add('pin');
        const draw = () => {
          pg.innerHTML = `<div class="gp"><div class="row sw-row">${mini('#2c8bf0', '✈')}<span class="v">Open to Work</span>${toggle(true, 'work')}</div><div class="row sw-row">${mini('#7a7a7a', '♪')}<span class="v">Sound</span>${toggle(!SFX.muted, 'sound')}</div></div>
            <div class="gp">${P.skills.map(([gname, list], i) => `<div class="row chev" data-s="${i}">${mini(ICO[i][0], ICO[i][1])}<span class="v">${esc(gname)}</span><span class="rv">${list.length}</span></div>`).join('')}</div>
            <div class="gp"><div class="row chev" data-k="about">${mini('#8e8e8e', '⚙')}<span class="v">General</span></div><div class="row chev" data-k="switch">${mini('#c98a2e', '⇄')}<span class="v">Switch Era</span></div></div>`;
        };
        draw();
        pg.addEventListener('click', (ev) => {
          const sw = ev.target.closest('[data-sw]');
          if (sw) {
            if (sw.dataset.sw === 'sound') SFX.toggle();
            else { sw.classList.add('on'); }
            if (sw.dataset.sw === 'sound') { sw.classList.toggle('on', !SFX.muted); sw.setAttribute('aria-checked', String(!SFX.muted)); }
            return;
          }
          const r = ev.target.closest('.row');
          if (!r) return;
          SFX.click();
          if (r.dataset.k === 'switch') { exit(); return; }
          if (r.dataset.k) {
            const photos = P.experience.reduce((a, e) => a + e.photos.length, 0) + P.offclock.reduce((a, s) => a + s.steps.length, 0);
            app.push('General', (p) => { p.classList.add('pin'); p.innerHTML = `<div class="gp"><div class="row chev" data-ab>${mini('#8e8e8e', 'i')}<span class="v">About</span></div></div>`; p.addEventListener('click', () => app.push('About', (q) => { q.classList.add('pin'); q.innerHTML = kv([['Name', 'Ajay Sommi'], ['Roles', String(P.experience.length)], ['Projects', String(P.projects.length)], ['Photos', String(photos)], ['Skills', String(P.skills.reduce((a, s) => a + s[1].length, 0))], ['Capacity', '1 portfolio'], ['Available', 'Dec 2026'], ['Version', '1.0 (26A543a)'], ['Model', 'AJ-26']]); })); });
          } else if (r.dataset.s) {
            const [gname, list] = P.skills[+r.dataset.s];
            app.push(gname, (p) => { p.classList.add('pin'); p.innerHTML = group(list.map((s) => { const at = usedAt(s); return ['', `${esc(s)}${at.length ? `<br/><span style="font-weight:normal;font-size:13px;color:#385487">${esc(at.join(', '))}</span>` : ''}`]; })); });
          }
        });
      });
    } },
    notes: { name: 'Notes', icon: 'notes', nb: 'notes', open(app) {
      app.push(`Notes (${NOTES.length})`, (pg) => {
        pg.classList.add('note-list-pg');
        const ul = plain(pg, NOTES.map((n) => ({ text: n[0], rt: now().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), go: () => app.push(n[0], notePage(n), { back: 'Notes', right: ['+', () => {}] }) })));
        ul.classList.add('note-list');
      }, { right: ['+', () => {}] });
    } },
    portfolio: { name: 'Portfolio', icon: 'clipAJ', bare: true, bar: 'gray', open(app) { safari(app, 'classic.html', 'ajaysommi.github.io'); } },
    github: { name: 'GitHub', icon: 'clipGH', link: P.github },
    linkedin: { name: 'LinkedIn', icon: 'clipIN', link: P.linkedin },
    contact: { name: 'Contact', icon: 'phone', open(app) {
      app.push('Info', (pg) => {
        pg.classList.add('pin');
        pg.innerHTML = `<div class="ct-head"><img src="${P.photo}" alt="" /><div><b>Ajay Sommi</b><span>${esc(P.title)}</span></div></div>
          <div class="gp"><div class="row chev" data-u="mailto:${P.email}"><span class="k">email</span><span class="v n">${esc(P.email)}</span></div></div>
          <div class="gp"><div class="row chev" data-u="${P.github}"><span class="k">home page</span><span class="v n">github.com/ajaysommi</span></div><div class="row chev" data-u="${P.linkedin}"><span class="k">work</span><span class="v n">linkedin.com/in/ajay-sommi</span></div></div>
          <div class="gp"><div class="row chev" data-u="${P.resume}"><span class="k">resume</span><span class="v n">Ajay_Sommi_Resume.pdf</span></div></div>
          <button class="gbtn" type="button" data-u="mailto:${P.email}">Send Email</button>`;
        pg.addEventListener('click', (ev) => { const r = ev.target.closest('[data-u]'); if (r) { const u = r.dataset.u; if (u.startsWith('mailto')) location.href = u; else ext(u); } });
      }, { left: ['Edit', () => {}] });
      app.el.appendChild(h('div', 'tabs', ['Favorites', 'Recents', 'Contacts', 'Keypad', 'Voicemail'].map((n, i) => `<button type="button" class="${i === 2 ? 'on' : ''}"><svg viewBox="0 0 30 26"><path d="${['M15 2l3.8 8 8.6.9-6.4 5.8 1.9 8.5L15 21l-7.9 4.2L9 16.7 2.6 10.9l8.6-.9z', 'M15 2a11 11 0 1 1 0 22 11 11 0 0 1 0-22zm-1 5v7l6 4 1-2-5-3V7z', 'M15 3a6 6 0 1 1 0 12 6 6 0 0 1 0-12zM3 26c1-7 6-10 12-10s11 3 12 10z', 'M5 3h4v4H5zM13 3h4v4h-4zM21 3h4v4h-4zM5 11h4v4H5zM13 11h4v4h-4zM21 11h4v4h-4zM5 19h4v4H5zM13 19h4v4h-4zM21 19h4v4h-4z', 'M8 7a6 6 0 1 1 0 12A6 6 0 0 1 8 7zm14 0a6 6 0 1 1 0 12 6 6 0 0 1 0-12zM8 17h14v2H8z'][i]}"/></svg>${n}</button>`).join('')));
    } },
    email: { name: 'Email', icon: 'mail', open(app) {
      const M = [
        ['Ajay Sommi', 'Let’s talk', `Hi there,\n\nThanks for stopping by. I’m a software engineer graduating from UF in December 2026, and I’m looking for a team that cares about the people using what it builds.\n\nReply to this and it goes straight to me.\n\nAjay`],
        ['GitHub', 'Your repositories', `SommiScript, GatorGoods, BalanceTree and more are at github.com/ajaysommi.`],
        ['LinkedIn', 'Recommendations', `${P.recs.length} people have written recommendations for Ajay. Read them in Guestbook.`]
      ];
      app.push('Inbox (1)', (pg) => plain(pg, M.map(([f, s, b], i) => ({ text: f, sub: `${s} — ${b.replace(/\n/g, ' ')}`, rt: i ? 'Oct 2026' : hm(now()), cls: i ? '' : 'unread', go: () => app.push(s, (p) => {
        p.innerHTML = `<div class="ml-h">From: <b>${esc(f)}</b><br/>Subject: <b>${esc(s)}</b></div><div class="ml-b">${esc(b).replace(/\n/g, '<br/>')}</div>`;
      }, { right: ['Reply', () => { location.href = 'mailto:' + P.email + '?subject=' + encodeURIComponent('Re: ' + s); }], blue: true, back: 'Inbox' }) }))), { left: ['Mailboxes', () => {}] });
    } },
    resume: { name: 'Resume', icon: 'safari', bare: true, bar: 'gray', open(app) { safari(app, P.resume + '#view=FitH', 'ajaysommi.github.io/' + P.resume); } }
  };

  const viewer = (app, s, k) => {
    const v = h('div', 'photo-view');
    const draw = () => { v.innerHTML = `<div class="pv-top"><button type="button" data-x>Done</button><b>${k + 1} of ${s.steps.length}</b><span></span></div><img src="${s.steps[k][0].replace('-480', '-960')}" alt="${esc(s.steps[k][1])}" /><div class="cap"><b>${esc(s.steps[k][1])}</b>${esc(s.steps[k][2])}</div><div class="tbar"><button type="button" data-d="-1">◀</button><button type="button" data-d="1">▶</button></div>`; };
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
  const MAXX = 266 - 84;
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
    slideTxt.style.opacity = String(Math.max(0, 1 - x / 80));
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
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && state === 'app' && room.offsetParent) closeApp(); });

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
