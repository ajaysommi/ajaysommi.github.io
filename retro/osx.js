/* ==========================================================================
   2007: SommiOS X 10.4 "Gator". A parody of the desktop of its day:
   a translucent menu bar, Spotlight in the corner, a glass dock that
   swells under the pointer, Aqua windows with traffic lights. Every app in
   the dock is a part of the portfolio, and Time Machine goes back to the
   era picker.
   ========================================================================== */
window.OSX = (function () {
  const P = window.PORTFOLIO;
  const { esc, store, usedAt } = window.RETRO;
  const I = window.ICONS;
  const SFX = window.SFX;

  let root, api, deskEl, dockEl, menubar, spot;
  let active = false;
  let z = 50;
  const wins = new Map();

  const TINT = { rjax: '#2fae5a', shiva: '#f39c12', rfa: '#f2b705', fics: '#fa4616', toyota: '#eb0a1e', jm: '#00857c', hunter: '#b5121b', adt: '#1f6fd1' };
  const LOGO = { rfa: 'roboticsforall', fics: 'fics', toyota: 'toyota', jm: 'jm-family', hunter: 'hunter', adt: 'adt' };

  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const SW = () => root.clientWidth, SH = () => root.clientHeight;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const ext = (u) => window.open(u, '_blank', 'noopener');

  /* ---------------------------------------------------------------- icons */

  let gid = 0;
  /* Gradient ids are made unique per drawing, so icons never borrow each
     other's colours. */
  const art = (inner, defs = '') => {
    const k = 'g' + (++gid) + '_';
    const fix = (s) => s.replace(/id="(\w+)"/g, `id="${k}$1"`).replace(/url\(#(\w+)\)/g, `url(#${k}$1)`);
    return `<svg viewBox="0 0 128 128" aria-hidden="true"><defs>${fix(defs)}</defs>${fix(inner)}</svg>`;
  };
  const lg = (id, stops, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;
  const rg = (id, stops, cx = 0.5, cy = 0.5, r = 0.5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</radialGradient>`;
  const gloss = '<path d="M14 18q50-14 100 0v34q-50 14-100 0z" fill="#fff" opacity=".18"/>';
  const HN = 'font-family="Lucida Grande,Helvetica Neue,Helvetica,Arial,sans-serif"';

  const ICON = {
    /* Finder, with the AJ mark for a face: the A's diagonal is the
       profile between the two halves, the j's orange hook is the smile.
       It blinks now and then and grins under the pointer. */
    finder: () => art(`<rect x="8" y="8" width="112" height="112" rx="24" fill="url(#l)"/>
        <path d="M76 8h20a24 24 0 0 1 24 24v64a24 24 0 0 1-24 24H64q-7-18-3-36l-11-6 11-5q-4-20 15-45z" fill="url(#r)"/>
        <rect class="eye" x="34" y="36" width="9" height="22" rx="4.5" fill="#12305c"/><rect class="eye" x="86" y="36" width="9" height="22" rx="4.5" fill="#06183a"/>
        <path class="smile" d="M30 82q34 30 68 0l-6-2q-28 20-56 0z" fill="#ff6b35" stroke="#c94a1c" stroke-width="1.5"/>
        <circle cx="98" cy="22" r="6" fill="#3d68ff" stroke="#fff" stroke-width="2" opacity=".95"/>
        <path d="M8 32a24 24 0 0 1 24-24h64a24 24 0 0 1 24 24v14q-56 16-112 0z" fill="#fff" opacity=".22"/>`,
      lg('l', [[0, '#d2f0ff'], [1, '#62b6f3']]) + lg('r', [[0, '#66b9ff'], [1, '#1559c4']])),
    docs: () => ICON.folder('<path d="M50 66h20l8 8v24H50z"/><path d="M70 66v8h8" fill="none" stroke="#fff" stroke-opacity=".6"/>'),
    downloads: () => ICON.folder('<path d="M56 62h16v18h12L64 100 44 80h12z"/>'),
    about: () => art(`<rect x="18" y="10" width="92" height="108" rx="8" fill="url(#lth)"/><rect x="18" y="10" width="14" height="108" rx="6" fill="#5a3410"/>${[20, 40, 60, 80, 100].map((y) => `<rect x="22" y="${y}" width="6" height="2" fill="#c49a62"/>`).join('')}
        <rect x="38" y="20" width="64" height="88" rx="4" fill="#fbf8f0"/><clipPath id="c"><circle cx="70" cy="52" r="20"/></clipPath><image href="${P.photo}" x="46" y="28" width="48" height="48" clip-path="url(#c)" preserveAspectRatio="xMidYMid slice"/><circle cx="70" cy="52" r="20" fill="none" stroke="#c9b48a" stroke-width="2"/>
        <rect x="48" y="80" width="44" height="5" rx="2" fill="#8a7a5a"/><rect x="54" y="90" width="32" height="4" rx="2" fill="#bba985"/>`,
      lg('lth', [[0, '#a8743e'], [1, '#6e4419']])),
    experience: () => { const d = new Date(); return art(`<rect x="16" y="14" width="96" height="102" rx="8" fill="url(#pg)" stroke="#9a9a9a"/><path d="M16 22a8 8 0 0 1 8-8h80a8 8 0 0 1 8 8v20H16z" fill="url(#rd)"/><text x="64" y="37" text-anchor="middle" ${HN} font-weight="bold" font-size="17" fill="#fff">${d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</text>
        <text x="64" y="98" text-anchor="middle" ${HN} font-weight="bold" font-size="52" fill="#222">${d.getDate()}</text>${[0, 1, 2, 3].map((i) => `<path d="M${32 + i * 21} 12v8" stroke="#555" stroke-width="3" stroke-linecap="round"/>`).join('')}`,
      lg('pg', [[0, '#fff'], [1, '#e2e2e2']]) + lg('rd', [[0, '#f26b6b'], [1, '#b81515']])); },
    companies: () => ICON.folder('<path d="M50 66h28v34H50z"/><path d="M42 78h10v22H42zM76 74h10v26H76z"/>'),
    projects: () => art(`<rect x="12" y="12" width="104" height="104" rx="18" fill="url(#bp)"/>${[30, 48, 66, 84, 102].map((v) => `<path d="M${v} 14v100M14 ${v}h100" stroke="#fff" stroke-opacity=".14"/>`).join('')}
        <text x="58" y="78" text-anchor="middle" font-family="Menlo,Monaco,monospace" font-weight="bold" font-size="30" fill="#e6f2ff">&lt;/&gt;</text><g transform="rotate(40 92 92)"><rect x="88" y="62" width="8" height="52" rx="3" fill="url(#hd)"/><rect x="74" y="54" width="36" height="14" rx="3" fill="url(#mt)"/></g>${gloss}`,
      lg('bp', [[0, '#3f8be0'], [1, '#123e8a']]) + lg('hd', [[0, '#b98250'], [1, '#6e4116']]) + lg('mt', [[0, '#e9edf2'], [1, '#8d96a2']])),
    skills: () => { let t = ''; for (let i = 0; i < 18; i++) t += `<rect x="58" y="16" width="12" height="18" rx="3" transform="rotate(${i * 20} 64 64)"/>`; return art(`<rect x="10" y="10" width="108" height="108" rx="22" fill="url(#al)"/><g fill="url(#gr)">${t}<circle cx="64" cy="64" r="38"/></g><circle cx="64" cy="64" r="22" fill="url(#hb)"/><circle cx="64" cy="64" r="8" fill="#3c3c3c"/>${gloss}`,
      lg('al', [[0, '#f2f2f2'], [1, '#9a9a9a']]) + lg('gr', [[0, '#8a8a8a'], [1, '#3b3b3b']]) + rg('hb', [[0, '#f0f0f0'], [1, '#8a8a8a']])); },
    photos: () => art(`<g transform="rotate(-8 64 64)"><rect x="18" y="26" width="88" height="72" rx="3" fill="#fff" stroke="#bbb"/></g><g transform="rotate(5 64 64)"><rect x="20" y="22" width="90" height="76" rx="3" fill="#fff" stroke="#aaa"/><rect x="26" y="28" width="78" height="56" fill="url(#sk)"/><circle cx="86" cy="44" r="8" fill="#ffd84a"/><path d="M26 84q22-26 44-10t34-6v16H26z" fill="#3d9a2c"/></g>`,
      lg('sk', [[0, '#3c8ce8'], [1, '#bfe2ff']])),
    guestbook: () => art(`<path d="M64 16c30 0 52 18 52 41s-22 41-52 41q-10 0-19-3l-25 13 7-21C17 79 12 69 12 57c0-23 22-41 52-41z" fill="url(#bb)" stroke="#1d5bb8" stroke-width="2"/><path d="M22 50q42-30 84 0" fill="#fff" opacity=".35"/>
        <text x="64" y="70" text-anchor="middle" ${HN} font-size="26" fill="#fff">★★★</text>`,
      lg('bb', [[0, '#8cc4ff'], [1, '#2a74d8']])),
    education: () => art(`<rect x="18" y="58" width="92" height="52" rx="6" fill="url(#bk)"/><rect x="24" y="62" width="80" height="44" rx="3" fill="#fbf6ea"/><path d="M30 74h68M30 84h56M30 94h62" stroke="#c9bb98" stroke-width="3"/>
        <path d="M64 14 118 36 64 58 10 36z" fill="url(#cap)"/><path d="M34 46v18c0 8 14 14 30 14s30-6 30-14V46L64 58z" fill="#2a2a2a"/><path d="M108 40v30" stroke="#f2c230" stroke-width="3"/><circle cx="108" cy="73" r="5" fill="#f2c230"/>`,
      lg('bk', [[0, '#3f6fb8'], [1, '#1d3f78']]) + lg('cap', [[0, '#444'], [1, '#111']])),
    terminal: () => art(`<rect x="10" y="16" width="108" height="96" rx="10" fill="url(#fr)"/><rect x="18" y="24" width="92" height="74" rx="4" fill="#111"/><text x="26" y="52" font-family="Menlo,Monaco,monospace" font-weight="bold" font-size="20" fill="#e8e8e8">&gt;_</text>${gloss}`,
      lg('fr', [[0, '#d9d9d9'], [1, '#6a6a6a']])),
    safari: () => { let t = ''; for (let i = 0; i < 60; i++) t += `<line x1="64" y1="18" x2="64" y2="${i % 5 ? 22 : 26}" stroke="#fff" stroke-width="1.2" transform="rotate(${i * 6} 64 64)"/>`; return art(`<circle cx="64" cy="64" r="54" fill="url(#rim)"/><circle cx="64" cy="64" r="48" fill="url(#dl)"/>${t}<path d="M64 64 92 30 72 70z" fill="#e8302a"/><path d="M64 64 36 98 56 58z" fill="#f4f4f4"/><circle cx="64" cy="64" r="4" fill="#bbb"/>`,
      lg('rim', [[0, '#f5f5f5'], [1, '#9aa5b2']]) + rg('dl', [[0, '#a6dcff'], [0.75, '#2f8de0'], [1, '#155fb8']], 0.45, 0.4, 0.6)); },
    mail: () => art(`<path d="M14 36h100v64H14z" fill="url(#env)" stroke="#9aa6b6" stroke-width="2"/><path d="M15 37 64 74l49-37" fill="none" stroke="#a7b3c3" stroke-width="3"/><path d="M15 99 52 64M113 99 76 64" stroke="#c6d0dc" stroke-width="2"/>
        <rect x="80" y="16" width="34" height="40" fill="#fff" stroke="#c33" stroke-width="2" stroke-dasharray="4 2" transform="rotate(8 97 36)"/><rect x="85" y="21" width="24" height="30" fill="url(#st)" transform="rotate(8 97 36)"/>`,
      lg('env', [[0, '#ffffff'], [1, '#dfe5ee']]) + lg('st', [[0, '#5aa4f0'], [1, '#2059b0']])),
    preview: () => art(`<rect x="22" y="12" width="76" height="98" rx="3" fill="#fff" stroke="#aaa"/><rect x="30" y="20" width="40" height="10" fill="#ff6b35"/>${[38, 46, 54, 62, 70].map((y, i) => `<rect x="30" y="${y}" width="${i % 2 ? 44 : 58}" height="4" fill="#bbb"/>`).join('')}
        <circle cx="82" cy="80" r="22" fill="url(#gl)" stroke="#555" stroke-width="5"/><path d="M98 96l18 18" stroke="#333" stroke-width="10" stroke-linecap="round"/>`,
      rg('gl', [[0, '#ffffff', 0.9], [1, '#bfe0ff', 0.6]], 0.4, 0.35)),
    timemachine: () => { let t = ''; for (let i = 0; i < 12; i++) t += `<line x1="64" y1="34" x2="64" y2="40" stroke="#333" stroke-width="2.5" transform="rotate(${i * 30} 64 64)"/>`; return art(`<circle cx="64" cy="64" r="56" fill="url(#rg)"/><path d="M64 14a50 50 0 1 1-46 30" fill="none" stroke="url(#ar)" stroke-width="9"/><path d="M8 40l12 10 8-14z" fill="#7be34a"/><circle cx="64" cy="64" r="34" fill="url(#fc)" stroke="#999"/>${t}<path d="M64 64V44M64 64l14 8" stroke="#222" stroke-width="4" stroke-linecap="round"/>`,
      rg('rg', [[0, '#2b4d4d'], [1, '#0e1f22']]) + lg('ar', [[0, '#b5ff7a'], [1, '#3aa51a']]) + rg('fc', [[0, '#ffffff'], [1, '#d6d6d6']])); },
    /* The wire mesh can: see-through, a tight grid of holes, a polished rim. */
    trash: () => art(`<pattern id="mh" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="#d9dee4" opacity=".55"/><circle cx="2.5" cy="2.5" r="1.45" fill="#5b6672" opacity=".55"/></pattern>
        <path d="M24 30h80l-9 84a7 7 0 0 1-7 6H40a7 7 0 0 1-7-6z" fill="url(#gl)"/><path d="M24 30h80l-9 84a7 7 0 0 1-7 6H40a7 7 0 0 1-7-6z" fill="url(#mh)"/>
        <path d="M27 32l9 82a7 7 0 0 0 4 5" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="2"/><path d="M101 32l-9 82" fill="none" stroke="#6c7782" stroke-opacity=".5" stroke-width="2"/>
        <ellipse cx="64" cy="117" rx="27" ry="4.5" fill="none" stroke="#8a949e" stroke-width="2.5"/>
        <ellipse cx="64" cy="30" rx="42" ry="8" fill="url(#rim)" stroke="#7c8792" stroke-width="1.5"/><ellipse cx="64" cy="30.5" rx="36" ry="5" fill="#59636e" opacity=".55"/>`,
      lg('gl', [[0, '#f4f6f8', 0.85], [0.5, '#c4cbd3', 0.7], [1, '#e9edf1', 0.85]], 1, 0) + lg('rim', [[0, '#ffffff'], [0.5, '#c9d0d7'], [1, '#97a1ab']])),
    /* The internal disk: a slab of brushed aluminium seen a little from above. */
    hd: () => art(`<path d="M18 46 30 32h68l12 14z" fill="url(#tp)"/><rect x="10" y="46" width="108" height="50" rx="5" fill="url(#al)" stroke="#7d838b"/>
        <rect x="10" y="46" width="108" height="9" rx="4" fill="#fff" opacity=".55"/>${[20, 108].map((x) => `<circle cx="${x}" cy="86" r="3" fill="#8b929a" stroke="#5f666e" stroke-width=".8"/>`).join('')}
        <rect x="30" y="80" width="56" height="6" rx="3" fill="#5f666e" opacity=".75"/><circle cx="98" cy="83" r="3.6" fill="#62e06f" stroke="#2d8a37" stroke-width=".8"/>
        <path d="M10 92h108" stroke="#5f666e" stroke-opacity=".35"/>`,
      lg('al', [[0, '#f2f4f6'], [0.45, '#d4d8dd'], [1, '#9fa5ad']]) + lg('tp', [[0, '#e3e7eb'], [1, '#c3c9cf']])),
    /* A page with its corner turned down, the corner shading the page under it. */
    doc: () => art(`<path d="M28 10h52l22 22v86H28z" fill="url(#pp)" stroke="#a6abb2" stroke-width="1.5"/><path d="M80 10l22 22H86a6 6 0 0 1-6-6z" fill="url(#cn)" stroke="#a6abb2" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M80 32h22" stroke="#000" stroke-opacity=".08" stroke-width="4"/>${[46, 54, 62, 70, 78, 86, 94, 102].map((y, i) => `<rect x="38" y="${y}" width="${i % 4 === 3 ? 30 : 52}" height="3" rx="1.5" fill="#a9b0b8"/>`).join('')}`,
      lg('pp', [[0, '#ffffff'], [1, '#eef0f3']]) + lg('cn', [[0, '#ffffff'], [1, '#d7dbe0']], 1, 1)),
    folder: (sign = '') => art(`<path d="M14 30a6 6 0 0 1 6-6h26a6 6 0 0 1 5 2.6L55 32h53a6 6 0 0 1 6 6v10H14z" fill="url(#bk)"/><path d="M14 38h100" stroke="#fff" stroke-opacity=".5"/>
        <rect x="22" y="34" width="84" height="22" rx="2" fill="#fff" opacity=".85"/>
        <path d="M8 46a4 4 0 0 1 4-4h104a4 4 0 0 1 4 4l-4.4 62a8 8 0 0 1-8 7.4H20.4a8 8 0 0 1-8-7.4z" fill="url(#fr)"/>
        <path d="M9 47a4 4 0 0 1 4-4h102a4 4 0 0 1 4 4" fill="none" stroke="#fff" stroke-width="2" stroke-opacity=".9"/>
        <path d="M8.6 54h110.8l-.6 8H9.2z" fill="#fff" opacity=".18"/>
        <path d="M13 108a8 8 0 0 0 7.4 7.4h87.2a8 8 0 0 0 7.4-7.4" fill="none" stroke="#2f6db8" stroke-opacity=".35" stroke-width="2"/>
        ${sign ? `<g transform="translate(0 1.4)" fill="#fff" opacity=".55">${sign}</g><g fill="url(#sg)">${sign}</g>` : ''}`,
      lg('bk', [[0, '#9fcdf5'], [1, '#5f9fdf']]) + lg('fr', [[0, '#c4e3fe'], [.5, '#8fc4f5'], [1, '#5fa2e8']]) + lg('sg', [[0, '#3f7ec8', .75], [1, '#2a62ad', .8]])),
  };

  /* Snow Leopard's own icons, from Apple's 2009 Mac OS X pages, wherever
     the app has a match. Finder keeps the AJ face; folders and the Trash
     stay drawn. */
  const SL = { about: 'about', experience: 'ical', guestbook: 'ichat', skills: 'prefs', safari: 'safari', mail: 'mail', preview: 'preview', terminal: 'terminal', timemachine: 'timemachine', education: 'dictionary', photos: 'photobooth', projects: 'automator' };
  Object.entries(SL).forEach(([k, f]) => { ICON[k] = () => `<img class="sl-ic" src="assets/images/snowleopard/${f}.webp" alt="" draggable="false" />`; });

  /* --------------------------------------------------------------- apps */

  const APPS = {
    finder: { name: 'Finder', icon: 'finder' },
    about: { name: 'About Me', icon: 'about', keys: 'bio who profile ajay' },
    experience: { name: 'Experience', icon: 'experience', keys: 'work jobs career roles internships' },
    companies: { name: 'Companies', icon: 'companies', keys: 'employers logos toyota jm hunter adt fics' },
    projects: { name: 'Projects', icon: 'projects', keys: 'code github built apps' },
    skills: { name: 'Skills', icon: 'skills', keys: 'stack languages tools system preferences' },
    photos: { name: 'Off the Clock', icon: 'photos', keys: 'photos garage repairs macbook civic electronics builds' },
    guestbook: { name: 'Messages', icon: 'guestbook', keys: 'recommendations references testimonials chat guestbook' },
    education: { name: 'Education', icon: 'education', keys: 'school uf university florida degree' },
    terminal: { name: 'Terminal', icon: 'terminal', keys: 'shell command line' },
    safari: { name: 'Safari', icon: 'safari', keys: 'web browser classic portfolio site' },
    mail: { name: 'Mail', icon: 'mail', keys: 'contact email hello write' },
    preview: { name: 'Resume', icon: 'preview', keys: 'cv pdf preview resume' },
    timemachine: { name: 'Time Machine', icon: 'timemachine', keys: 'era switch 1983 1991 1998 back' },
    docs: { name: 'Documents', icon: 'docs', keys: 'files documents' },
    downloads: { name: 'Downloads', icon: 'downloads', keys: 'download resume pdf' },
    trash: { name: 'Trash', icon: 'trash' }
  };
  const DOCK = ['finder', 'about', 'safari', 'mail', 'guestbook', 'experience', 'photos', 'preview', 'companies', 'projects', 'education', 'terminal', 'timemachine', 'skills', '|', 'docs', 'downloads', 'trash'];

  /* ------------------------------------------------------------- windows */

  const front = () => [...wins.values()].filter((w) => !w.min).sort((a, b) => b.z - a.z)[0];
  const focus = (w) => {
    if (!w) { setAppName('Finder'); return; }
    w.z = ++z;
    w.el.style.zIndex = w.z;
    wins.forEach((o) => o.el.classList.toggle('is-front', o === w));
    setAppName(APPS[w.app] ? APPS[w.app].name : 'Finder');
  };

  /* Opens an app's window, or brings it forward if it is already open. */
  const open = async (app, arg) => {
    if (app === 'timemachine') { timeTravel(); return; }
    if (app === 'docs') { const f = wins.get('finder'); if (f) { if (f.min) restore(f); focus(f); f.show('docs'); return; } app = 'finder'; arg = 'docs'; }
    if (app === 'downloads') { const a = document.createElement('a'); a.href = P.resume; a.download = 'Ajay_Sommi_Resume.pdf'; a.click(); bounce('downloads'); return; }
    const def = SPECS[app];
    if (!def) return;
    const key = def.multi ? app + ':' + arg : app;
    const have = wins.get(key);
    if (have) { if (have.min) restore(have); focus(have); if (have.select) have.select(arg); return; }
    bounce(app);
    const spec = def(arg);
    const w = Math.min(spec.w || 640, SW() - 40);
    const ht = Math.min(spec.h || 460, SH() - 130);
    const n = wins.size % 7;
    const x = Math.max(10, Math.min(spec.x != null ? spec.x : Math.round((SW() - w) / 2) - 120 + n * 34, SW() - w - 10));
    const y = Math.max(32, Math.min(spec.y != null ? spec.y : 48 + n * 28, SH() - ht - 90));
    const el = h('div', 'ox-win' + (spec.cls ? ' ' + spec.cls : ''));
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', spec.title);
    el.innerHTML = `<div class="ox-tb${spec.toolbar ? ' has-tools' : ''}"><div class="ox-lights"><button class="lt close" type="button" aria-label="Close"></button><button class="lt min" type="button" aria-label="Minimize"></button><button class="lt zoom" type="button" aria-label="Zoom"></button></div><div class="ox-title">${esc(spec.title)}</div>${spec.toolbar ? `<div class="ox-tools">${spec.toolbar}</div>` : ''}</div><div class="ox-body"></div>${spec.status ? `<div class="ox-status">${spec.status}</div>` : ''}<div class="ox-grip" aria-hidden="true"></div>`;
    Object.assign(el.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: ht + 'px' });
    root.insertBefore(el, dockEl.parentElement);
    const rec = { key, app, el, body: el.querySelector('.ox-body'), z: 0, min: false, prev: null, spec };
    wins.set(key, rec);
    spec.render(rec.body, rec);
    wire(rec);
    focus(rec);
    markRunning();
    SFX.click();
  };

  const close = (rec) => {
    if (!rec) return;
    rec.spec.onClose && rec.spec.onClose();
    rec.el.classList.add('is-closing');
    setTimeout(() => rec.el.remove(), 160);
    wins.delete(rec.key);
    markRunning();
    focus(front());
  };

  const dockPos = (app) => {
    const d = dockEl.querySelector(`[data-app="${app}"]`);
    const r = (d || dockEl).getBoundingClientRect(), b = root.getBoundingClientRect();
    return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2 };
  };

  /* Minimising pours the window into its dock icon. */
  const minimize = (rec) => {
    const p = dockPos(rec.app);
    const r = rec.el.getBoundingClientRect(), b = root.getBoundingClientRect();
    const dx = p.x - (r.left - b.left + r.width / 2), dy = p.y - (r.top - b.top + r.height / 2);
    rec.el.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${dx}px, ${dy}px) scale(.06, .02)`, opacity: 0.2 }], { duration: 360, easing: 'cubic-bezier(.5,0,.8,.4)' }).finished.then(() => { rec.el.hidden = true; });
    rec.min = true;
    focus(front());
  };
  const restore = (rec) => {
    rec.el.hidden = false;
    rec.min = false;
    const p = dockPos(rec.app);
    const r = rec.el.getBoundingClientRect(), b = root.getBoundingClientRect();
    const dx = p.x - (r.left - b.left + r.width / 2), dy = p.y - (r.top - b.top + r.height / 2);
    rec.el.animate([{ transform: `translate(${dx}px, ${dy}px) scale(.06, .02)`, opacity: 0.2 }, { transform: 'none', opacity: 1 }], { duration: 320, easing: 'cubic-bezier(.2,.6,.4,1)' });
  };

  const wire = (rec) => {
    const { el } = rec;
    el.addEventListener('pointerdown', () => focus(rec), true);
    el.querySelector('.lt.close').addEventListener('click', () => close(rec));
    el.querySelector('.lt.min').addEventListener('click', () => minimize(rec));
    el.querySelector('.lt.zoom').addEventListener('click', () => {
      if (rec.prev) { Object.assign(el.style, rec.prev); rec.prev = null; }
      else { rec.prev = { left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height }; Object.assign(el.style, { left: '6px', top: '28px', width: SW() - 12 + 'px', height: SH() - 120 + 'px' }); }
    });
    const tb = el.querySelector('.ox-tb');
    tb.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button, input, a, .ox-seg')) return;
      e.preventDefault();
      const sx = e.clientX, sy = e.clientY, l = parseFloat(el.style.left), t = parseFloat(el.style.top);
      const mv = (ev) => { el.style.left = l + ev.clientX - sx + 'px'; el.style.top = Math.max(22, t + ev.clientY - sy) + 'px'; };
      const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); };
      addEventListener('pointermove', mv); addEventListener('pointerup', up);
    });
    tb.addEventListener('dblclick', (e) => { if (!e.target.closest('button, input, a')) minimize(rec); });
    el.querySelector('.ox-grip').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const sx = e.clientX, sy = e.clientY, w = el.offsetWidth, ht = el.offsetHeight;
      const mv = (ev) => { el.style.width = Math.max(320, w + ev.clientX - sx) + 'px'; el.style.height = Math.max(200, ht + ev.clientY - sy) + 'px'; };
      const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); };
      addEventListener('pointermove', mv); addEventListener('pointerup', up);
    });
  };

  /* An Aqua alert, centred, with the default button pulsing blue. */
  const alert = ({ title, text, buttons = ['OK'], icon }) => new Promise((resolve) => {
    const scrim = h('div', 'ox-scrim');
    const d = h('div', 'ox-alert', `<div class="ox-alert-ico">${icon || I.mark(64)}</div><div><b>${title}</b><p>${text || ''}</p><div class="ox-btns">${buttons.map((b, i) => `<button type="button" class="ax-btn${i === buttons.length - 1 ? ' is-default' : ''}">${esc(b)}</button>`).join('')}</div></div>`);
    scrim.appendChild(d);
    root.appendChild(scrim);
    const done = (v) => { scrim.remove(); document.removeEventListener('keydown', key, true); resolve(v); };
    d.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { SFX.click(); done(b.textContent); }));
    const key = (e) => { if (e.key === 'Enter') { e.preventDefault(); done(buttons[buttons.length - 1]); } if (e.key === 'Escape') { e.preventDefault(); done(null); } };
    document.addEventListener('keydown', key, true);
  });

  /* ------------------------------------------------------------- content */

  const tokens = (list) => `<div class="ax-tokens">${list.map((t) => `<span>${esc(t)}</span>`).join('')}</div>`;

  /* Cover Flow: the centre picture faces you, the rest turn away. */
  const coverflow = (box, pics) => {
    let c = Math.floor(pics.length / 2);
    box.innerHTML = `<div class="cf-stage">${pics.map((p, i) => `<button type="button" class="cf-item" data-i="${i}"><img src="${p}" alt="" /></button>`).join('')}</div>`;
    const items = [...box.querySelectorAll('.cf-item')];
    const lay = () => items.forEach((it, i) => {
      const o = i - c;
      it.style.zIndex = 100 - Math.abs(o);
      it.style.transform = o === 0 ? 'translateX(-50%) translateZ(40px)' : `translateX(calc(-50% + ${Math.sign(o) * (90 + Math.abs(o) * 46)}px)) rotateY(${-Math.sign(o) * 62}deg)`;
      it.classList.toggle('is-c', o === 0);
    });
    box.addEventListener('click', (e) => { const it = e.target.closest('.cf-item'); if (it) { c = +it.dataset.i; lay(); SFX.click(); } });
    lay();
  };

  const roleView = (pane, e) => {
    pane.innerHTML = `<div class="xp-head" style="--tint:${TINT[e.id]}"><div class="xp-logo">${LOGO[e.id] ? `<img src="assets/logos/opt/${LOGO[e.id]}.webp" alt="" />` : `<span>${esc(e.short.split(' ').map((w) => w[0]).join('').slice(0, 2))}</span>`}</div><div><h2>${esc(e.org)}</h2><p>${esc(e.role)}</p><p class="xp-meta">${esc(e.when)} · ${esc(e.where)}</p></div></div>
      ${e.stats.length ? `<div class="xp-stats">${e.stats.map(([a, b]) => `<div><b>${esc(a)}</b><span>${esc(b)}</span></div>`).join('')}</div>` : ''}
      <p class="xp-text">${esc(e.text)}</p>${tokens(e.tags)}${e.photos.length ? '<div class="cf"></div>' : ''}`;
    const cf = pane.querySelector('.cf');
    if (cf) coverflow(cf, e.photos);
    pane.scrollTop = 0;
  };

  const SPECS = {
    finder: (view) => ({
      title: 'Ajay HD', w: 720, h: 440,
      toolbar: '<div class="ox-seg"><button type="button" disabled>◀</button><button type="button" disabled>▶</button></div><div class="ox-search"><input type="search" placeholder="Search" aria-label="Search" data-spot /></div>',
      view,
      status: `${DOCK.filter((a) => !['|', 'trash', 'docs', 'downloads'].includes(a)).length} items, 112 GB available`,
      render: (b, rec) => {
        b.classList.add('fx');
        b.innerHTML = `<div class="fx-side"><h6>DEVICES</h6><button type="button" class="on" data-v="apps">${ICON.hd()}Ajay HD</button><h6>PLACES</h6><button type="button" data-v="apps">${ICON.folder()}Applications</button><button type="button" data-v="docs">${ICON.folder()}Documents</button><button type="button" data-v="desk">${ICON.folder()}Desktop</button></div><div class="fx-main"></div>`;
        const main = b.querySelector('.fx-main');
        const show = (v) => {
          const items = v === 'docs' ? [['preview', 'Resume.pdf', 'doc'], ['education', 'Education.rtf', 'doc'], ['welcome', 'Welcome.rtf', 'doc'], ['news07', window.PAPERS[2007].news.file, 'doc'], ['brochure07', window.PAPERS[2007].brochure.file, 'doc']] : v === 'desk' ? [['finder', 'Ajay HD', 'hd'], ['preview', 'Resume.pdf', 'doc'], ['welcome', 'Welcome.rtf', 'doc']] : DOCK.filter((a) => !['|', 'finder', 'docs', 'downloads', 'trash'].includes(a)).map((a) => [a, APPS[a].name, APPS[a].icon]);
          main.innerHTML = items.map(([a, n, i]) => `<button type="button" class="fx-ico" data-open="${a}">${ICON[i]()}<span>${esc(n)}</span></button>`).join('');
          b.querySelectorAll('.fx-side button').forEach((x) => x.classList.toggle('on', x.dataset.v === v && x.textContent.trim() !== 'Ajay HD' || (v === 'apps' && x.textContent.trim() === 'Ajay HD')));
        };
        b.querySelector('.fx-side').addEventListener('click', (e) => { const x = e.target.closest('[data-v]'); if (x) show(x.dataset.v); });
        main.addEventListener('dblclick', (e) => { const x = e.target.closest('[data-open]'); if (x) open(x.dataset.open); });
        main.addEventListener('click', (e) => { const x = e.target.closest('[data-open]'); main.querySelectorAll('.fx-ico').forEach((i) => i.classList.toggle('is-sel', i === x)); if (x && e.detail === 0) open(x.dataset.open); });
        show(rec.spec.view || 'apps');
        rec.show = show;
      }
    }),
    about: () => ({
      title: 'About Me', w: 620, h: 470, cls: 'is-plain',
      render: (b) => {
        b.innerHTML = `<div class="ab"><div class="ab-pic"><img src="${P.photo}" alt="Ajay Sommi outdoors in front of green hills" /></div><div><h1>Ajay Sommi</h1><p class="ab-sub">${esc(P.title)} · ${esc(P.citizen)} · UF Computer Science</p><p>${esc(P.about[0])}</p><p>${esc(P.about[1])}</p>
          <div class="ox-btns left"><button type="button" class="ax-btn is-default" data-open="experience">See the work</button><button type="button" class="ax-btn" data-open="preview">Resume</button><button type="button" class="ax-btn" data-open="mail">Say hello</button></div></div></div>`;
      }
    }),
    experience: (arg) => ({
      title: 'Experience', w: 840, h: 660, arg,
      toolbar: '<div class="ox-search"><input type="search" placeholder="Search roles" aria-label="Search roles" data-filter /></div>',
      render: (b, rec) => {
        b.classList.add('xp');
        const years = [...new Set(P.experience.map((e) => e.year))].reverse();
        b.innerHTML = `<div class="src">${years.map((y) => `<h6>${y}</h6>${P.experience.filter((e) => e.year === y).reverse().map((e) => `<button type="button" data-id="${e.id}"><i style="background:${TINT[e.id]}"></i>${esc(e.short)}</button>`).join('')}`).join('')}</div><div class="xp-pane"></div>`;
        const pane = b.querySelector('.xp-pane');
        rec.select = (id) => {
          const e = P.experience.find((x) => x.id === id) || P.experience[P.experience.length - 1];
          b.querySelectorAll('.src button').forEach((x) => x.classList.toggle('on', x.dataset.id === e.id));
          roleView(pane, e);
        };
        b.querySelector('.src').addEventListener('click', (e) => { const x = e.target.closest('[data-id]'); if (x) { SFX.click(); rec.select(x.dataset.id); } });
        rec.el.querySelector('[data-filter]').addEventListener('input', (ev) => {
          const q = ev.target.value.toLowerCase();
          b.querySelectorAll('.src button').forEach((x) => { const e = P.experience.find((r) => r.id === x.dataset.id); x.hidden = q && !(e.org + e.role + e.tags.join(' ') + e.text).toLowerCase().includes(q); });
        });
        rec.select(rec.spec.arg);
      }
    }),
    companies: () => ({
      title: 'Companies', w: 740, h: 580, cls: 'is-dark',
      status: 'Double-click a company to see the role',
      render: (b) => {
        b.innerHTML = `<div class="co">${[...P.experience].reverse().map((e) => `<button type="button" class="co-t" data-id="${e.id}" style="--tint:${TINT[e.id]}"><span class="co-l">${LOGO[e.id] ? `<img src="assets/logos/opt/${LOGO[e.id]}.webp" alt="${esc(e.org)}" />` : `<b>${esc(e.short)}</b>`}</span><span class="co-n">${esc(e.org)}</span><span class="co-y">${e.year} · ${esc(e.where)}</span></button>`).join('')}</div>`;
        b.addEventListener('click', (e) => { const t = e.target.closest('.co-t'); b.querySelectorAll('.co-t').forEach((x) => x.classList.toggle('is-sel', x === t)); if (t && (e.detail === 0 || e.detail === 2)) openRole(t.dataset.id); });
      }
    }),
    projects: () => ({
      title: 'Projects', w: 760, h: 470,
      render: (b) => {
        b.classList.add('xp');
        b.innerHTML = `<div class="src"><h6>PROJECTS</h6>${P.projects.map((p, i) => `<button type="button" data-i="${i}"><i style="background:hsl(${i * 57 + 200} 60% 55%)"></i>${esc(p.name)}</button>`).join('')}</div><div class="xp-pane"></div>`;
        const pane = b.querySelector('.xp-pane');
        const sel = (i) => {
          const p = P.projects[i];
          b.querySelectorAll('.src button').forEach((x) => x.classList.toggle('on', +x.dataset.i === i));
          pane.innerHTML = `<div class="xp-head" style="--tint:hsl(${i * 57 + 200} 60% 55%)"><div class="xp-logo">${ICON.projects()}</div><div><h2>${esc(p.full)}</h2><p>${esc(p.kind)}</p><p class="xp-meta">${esc(p.stack)}</p></div></div><p class="xp-text">${esc(p.text)}</p>${tokens(p.stack.split(' / '))}<div class="ox-btns left">${p.url ? `<button type="button" class="ax-btn is-default" data-url="${p.url}">View on GitHub</button>` : '<span class="xp-meta">Source is private for now.</span>'}</div>`;
        };
        b.addEventListener('click', (e) => { const x = e.target.closest('[data-i]'); if (x) { SFX.click(); sel(+x.dataset.i); } const u = e.target.closest('[data-url]'); if (u) ext(u.dataset.url); });
        sel(0);
      }
    }),
    skills: () => ({
      title: 'Skills', w: 740, h: 620, cls: 'is-prefs',
      toolbar: '<div class="ox-seg"><button type="button" data-all>Show All</button></div><div class="ox-search"><input type="search" placeholder="Search skills" aria-label="Search skills" data-find /></div>',
      render: (b, rec) => {
        const hue = (s) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
        const all = () => {
          b.innerHTML = P.skills.map(([g, list]) => `<div class="sp-row"><h6>${esc(g)}</h6><div class="sp-grid">${list.map((s) => `<button type="button" class="sp-i" data-s="${esc(s)}"><span class="sp-ic" style="--h:${hue(s)}">${esc(s.replace(/[^A-Za-z#+.]/g, '').slice(0, 2))}</span><span>${esc(s)}</span></button>`).join('')}</div></div>`).join('');
        };
        const pane = (s) => {
          const at = usedAt(s);
          b.innerHTML = `<div class="sp-pane"><span class="sp-ic big" style="--h:${hue(s)}">${esc(s.replace(/[^A-Za-z#+.]/g, '').slice(0, 2))}</span><h2>${esc(s)}</h2>${at.length ? `<p>Used at:</p><div class="ox-btns">${at.map((a) => { const e = P.experience.find((x) => x.short === a); return `<button type="button" class="ax-btn" data-role="${e.id}">${esc(a)}</button>`; }).join('')}</div>` : '<p>From coursework and side projects.</p>'}</div>`;
        };
        all();
        b.addEventListener('click', (e) => { const s = e.target.closest('[data-s]'); if (s) { SFX.click(); pane(s.dataset.s); } const r = e.target.closest('[data-role]'); if (r) openRole(r.dataset.role); });
        rec.el.querySelector('[data-all]').addEventListener('click', () => { all(); rec.el.querySelector('[data-find]').value = ''; });
        /* Searching shines a spotlight on the matches and dims the rest. */
        rec.el.querySelector('[data-find]').addEventListener('input', (ev) => {
          if (!b.querySelector('.sp-row')) all();
          const q = ev.target.value.trim().toLowerCase();
          b.classList.toggle('is-searching', !!q);
          b.querySelectorAll('.sp-i').forEach((x) => x.classList.toggle('is-hit', !!q && x.dataset.s.toLowerCase().includes(q)));
        });
      }
    }),
    photos: () => ({
      title: 'Off the Clock', w: 840, h: 620, cls: 'is-photos',
      render: (b) => {
        b.innerHTML = `<div class="ph-side"><h6>LIBRARY</h6><button type="button" data-a="all">🖼︎ Events</button><h6>ALBUMS</h6>${P.offclock.map((s, i) => `<button type="button" data-a="${i}">${esc(s.name)} <em>${s.steps.length}</em></button>`).join('')}</div><div class="ph-main"></div>`;
        const main = b.querySelector('.ph-main');
        const album = (i) => {
          b.querySelectorAll('.ph-side button').forEach((x) => x.classList.toggle('on', x.dataset.a === String(i)));
          if (i === 'all') {
            main.innerHTML = `<div class="ph-events">${P.offclock.map((s, k) => `<button type="button" class="ph-ev" data-a="${k}"><img src="${s.cover}" alt="" /><b>${esc(s.title)}</b><span>${s.steps.length} photos</span></button>`).join('')}</div>`;
            return;
          }
          const s = P.offclock[i];
          main.innerHTML = `<div class="ph-lede"><b>${esc(s.title)}</b><p>${esc(s.lede)}</p></div><div class="ph-grid">${s.steps.map((st, k) => `<button type="button" data-p="${k}"><img src="${st[0]}" alt="${esc(st[1])}" /></button>`).join('')}</div>`;
          main.dataset.album = i;
        };
        const big = (i, k) => {
          const s = P.offclock[i], st = s.steps[k];
          main.innerHTML = `<div class="ph-big"><img src="${st[0].replace('-480', '-960')}" alt="${esc(st[1])}" /><div class="ph-cap"><b>${esc(st[1])}</b> ${esc(st[2])}</div><div class="ph-ctl"><button type="button" class="ax-btn" data-back>◀ ${esc(s.name)}</button><span>${k + 1} of ${s.steps.length}</span><span><button type="button" class="ax-btn" data-step="-1">‹</button> <button type="button" class="ax-btn" data-step="1">›</button></span></div></div>`;
          main.dataset.k = k;
        };
        b.addEventListener('click', (e) => {
          const a = e.target.closest('[data-a]');
          if (a) { SFX.click(); album(a.dataset.a === 'all' ? 'all' : +a.dataset.a); return; }
          const p = e.target.closest('[data-p]');
          if (p) { big(+main.dataset.album, +p.dataset.p); return; }
          if (e.target.closest('[data-back]')) { album(+main.dataset.album); return; }
          const st = e.target.closest('[data-step]');
          if (st) { const n = P.offclock[+main.dataset.album].steps.length; big(+main.dataset.album, (+main.dataset.k + +st.dataset.step + n) % n); }
        });
        album('all');
      }
    }),
    guestbook: () => ({
      title: 'Messages', w: 760, h: 520, cls: 'is-chat',
      render: (b) => {
        /* Each recommendation is a conversation, unread until opened. White
           bubbles come in, blue ones go out; the box at the bottom sends. */
        const read = new Set(store.get('ox-chat-read', []));
        const sent = store.get('ox-chat-sent', {});
        const WHEN = ['9:41 AM', '9:12 AM', '8:05 AM', 'Yesterday', 'Yesterday', 'Thursday', 'Wednesday', 'Monday', 'Sunday', 'Sunday'];
        const av = (n) => `<span class="ch-av ini">${esc(n.split(' ').map((w) => w[0]).join(''))}</span>`;
        b.innerHTML = `<div class="ch-list"><div class="ch-find"><input type="search" placeholder="Search" aria-label="Search" /></div><div class="ch-people">${P.recs.map(([n, c, q], i) => `<button type="button" data-i="${i}" class="${read.has(i) ? '' : 'new'}">${av(n)}<span class="ch-tx"><b>${esc(n)}</b><em>${esc(q)}</em></span><time>${WHEN[i % WHEN.length]}</time></button>`).join('')}</div></div><div class="ch-main"></div>`;
        const main = b.querySelector('.ch-main');
        let cur = 0;
        const show = (i) => {
          cur = i;
          const [n, c, q] = P.recs[i];
          if (!read.has(i)) { read.add(i); store.set('ox-chat-read', [...read]); }
          b.querySelectorAll('.ch-people button').forEach((x) => { x.classList.toggle('on', +x.dataset.i === i); if (+x.dataset.i === i) x.classList.remove('new'); });
          main.innerHTML = `<div class="ch-head"><span>To:</span> ${esc(n)} <em>${esc(c)}</em></div><div class="ch-msgs"><div class="ch-day">${WHEN[i % WHEN.length]}</div><div class="ch-m in">${av(n)}<p>${esc(q)}</p></div>${(sent[i] || []).map((t) => `<div class="ch-m out"><p>${esc(t)}</p><span class="ch-av"><img src="${P.photo}" alt="" /></span></div>`).join('')}</div><form class="ch-send"><input type="text" placeholder="Message" aria-label="Message" autocomplete="off" /></form>`;
          const msgs = main.querySelector('.ch-msgs');
          msgs.scrollTop = msgs.scrollHeight;
          main.querySelector('.ch-send').addEventListener('submit', (e) => {
            e.preventDefault();
            const inp = e.target.querySelector('input'), t = inp.value.trim();
            if (!t) return;
            (sent[i] = sent[i] || []).push(t);
            store.set('ox-chat-sent', sent);
            msgs.insertAdjacentHTML('beforeend', `<div class="ch-m out is-new"><p>${esc(t)}</p><span class="ch-av"><img src="${P.photo}" alt="" /></span></div>`);
            msgs.scrollTop = msgs.scrollHeight;
            inp.value = '';
            SFX.click();
          });
        };
        b.querySelector('.ch-people').addEventListener('click', (e) => { const x = e.target.closest('[data-i]'); if (x) { SFX.click(); show(+x.dataset.i); } });
        b.querySelector('.ch-find input').addEventListener('input', (e) => { const v = e.target.value.toLowerCase(); b.querySelectorAll('.ch-people button').forEach((x) => { x.hidden = !x.textContent.toLowerCase().includes(v); }); });
        show(cur);
      }
    }),
    education: () => doc('Education.rtf', () => { const e = P.education; return `<h1>${esc(e.school)}</h1><p><b>${esc(e.degree)}</b><br/>${esc(e.college)}<br/>Graduating ${esc(e.when)}</p><p>${esc(e.text)}</p><p>${e.tags.map(esc).join(' · ')}</p>`; }),
    welcome: () => doc('Welcome.rtf', () => `<h1>Welcome to SommiOS X.</h1><p>This is my portfolio, as it would have run on a desktop in 2007.</p><p>• Everything about me is an app in the <b>dock</b> at the bottom. Click one to open it.<br/>• Click the <b>magnifying glass</b> in the top right (or press Ctrl+Space) and type what you want to see.<br/>• Windows move by their title bars. The red light closes one, the yellow puts it in the dock.<br/>• <b>Time Machine</b> in the dock takes you to another era.</p><p>Have a look around.</p><p>Ajay</p>`),
    /* The papers of 2007: the year's headlines and a product brochure. */
    news07: () => { const d = window.PAPERS[2007].news; return doc(d.file, () => `<h1>${esc(d.title)}</h1><p><i>${esc(d.sub)}</i></p>${d.items.map(([h, t]) => `<p><b>${esc(h)}.</b> ${esc(t)}</p>`).join('')}<p style="color:#888">${esc(d.foot)}</p>`); },
    brochure07: () => { const d = window.PAPERS[2007].brochure; return { ...doc(d.file, () => `<div class="bro07"><div class="bro07-hero"><div><h1>${esc(d.title)}</h1><p>${esc(d.sub)}</p></div><svg viewBox="0 0 120 80" aria-hidden="true"><defs><linearGradient id="b7a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef0f2"/><stop offset="1" stop-color="#a9aeb5"/></linearGradient><linearGradient id="b7s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fb0e0"/><stop offset="1" stop-color="#1f3f8f"/></linearGradient></defs><path d="M22 6h76a4 4 0 0 1 4 4v50H18V10a4 4 0 0 1 4-4z" fill="url(#b7a)"/><rect x="23" y="11" width="74" height="45" fill="url(#b7s)"/><path d="M6 60h108l-6 8H12z" fill="url(#b7a)"/><rect x="50" y="61" width="20" height="2" rx="1" fill="#8b9098"/></svg></div>${d.items.map(([h, t]) => `<div class="bro07-r"><b>${esc(h)}</b><span>${esc(t)}</span></div>`).join('')}<p class="bro07-f">${esc(d.foot)}</p></div>`), w: 560 }; },
    terminal: () => ({ title: 'Terminal — bash — 80×24', w: 640, h: 400, cls: 'is-term', render: term }),
    safari: (url) => ({
      title: 'Ajay Sommi · Software Engineer', w: Math.min(1060, SW() - 80), h: SH() - 140, cls: 'is-safari',
      toolbar: '<div class="ox-seg"><button type="button" data-b>◀</button><button type="button" data-f>▶</button></div><div class="ox-url"><input type="text" aria-label="Address" value="http://ajaysommi.github.io/" /></div><div class="ox-search"><input type="search" placeholder="Google" aria-label="Search the web" /></div>',
      render: (b, rec) => {
        b.innerHTML = '<div class="sf-bm"><button type="button" data-go="index.html">Portfolio (classic)</button><button type="button" data-go="Ajay_Sommi_Resume.pdf">Resume</button><button type="button" data-ext="github">GitHub ↗</button><button type="button" data-ext="linkedin">LinkedIn ↗</button></div><iframe title="Safari"></iframe>';
        const fr = b.querySelector('iframe');
        const addr = rec.el.querySelector('.ox-url input');
        /* Our own pages load directly; anything else typed goes through
           OLDWEB: the site as it was in 2007 (today's if there is no copy),
           and searches on that year's Google. Back and Forward walk the
           addresses visited here. */
        const hist = [];
        let pos = -1;
        const local = (u) => u === 'index.html' || /\.pdf(#|$)/i.test(u);
        const show = (u) => {
          if (local(u)) { fr.removeAttribute('srcdoc'); fr.removeAttribute('sandbox'); fr.onload = null; fr.src = u; addr.value = 'http://ajaysommi.github.io/' + (u === 'index.html' ? '' : u); return; }
          addr.value = 'http://' + window.OLDWEB.shown(u);
          window.OLDWEB.open(fr, u, 2007, { onNav: go });
        };
        function go(u) { hist.length = pos + 1; hist.push(u); pos = hist.length - 1; show(u); }
        b.addEventListener('click', (e) => { const g = e.target.closest('[data-go]'); if (g) go(g.dataset.go); const x = e.target.closest('[data-ext]'); if (x) ext(P[x.dataset.ext]); });
        rec.el.querySelector('[data-b]').addEventListener('click', () => { if (pos > 0) show(hist[--pos]); });
        rec.el.querySelector('[data-f]').addEventListener('click', () => { if (pos < hist.length - 1) show(hist[++pos]); });
        addr.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const v = addr.value.trim().replace(/^http:\/\/ajaysommi\.github\.io\/?$/, 'index.html'); if (v) go(v); } });
        const srch = rec.el.querySelector('.ox-search input');
        if (srch) srch.addEventListener('keydown', (e) => { if (e.key === 'Enter' && srch.value.trim()) go(srch.value.trim()); });
        go(url || 'index.html');
      }
    }),
    mail: () => ({
      title: 'New Message', w: 600, h: 480, cls: 'is-mail',
      toolbar: '<div class="ox-seg"><button type="button" data-send>✈︎ Send</button></div><div class="ox-seg"><button type="button" data-copy>Copy Address</button></div>',
      render: (b, rec) => {
        b.innerHTML = `<div class="ml-f"><label>To:</label><span class="ml-tok">Ajay Sommi &lt;${esc(P.email)}&gt;</span></div><div class="ml-f"><label for="mlS">Subject:</label><input id="mlS" type="text" value="Hello from your portfolio" /></div><textarea aria-label="Message">Hi Ajay,\n\n</textarea>`;
        const send = () => { const s = b.querySelector('#mlS').value, t = b.querySelector('textarea').value; location.href = `mailto:${P.email}?subject=${encodeURIComponent(s)}&body=${encodeURIComponent(t)}`; };
        rec.el.querySelector('[data-send]').addEventListener('click', send);
        rec.el.querySelector('[data-copy]').addEventListener('click', async () => { try { await navigator.clipboard.writeText(P.email); } catch (e) {} alert({ title: 'Address copied', text: `${esc(P.email)} is on the clipboard.`, icon: ICON.mail() }); });
        setTimeout(() => { const t = b.querySelector('textarea'); t.focus(); t.setSelectionRange(t.value.length, t.value.length); }, 60);
      }
    }),
    preview: () => ({
      title: 'Ajay_Sommi_Resume.pdf', w: 760, h: SH() - 130, cls: 'is-preview',
      toolbar: `<div class="ox-seg"><a href="${P.resume}" target="_blank" rel="noopener">Open in Browser</a></div><div class="ox-seg"><a href="${P.resume}" download>Download</a></div>`,
      render: (b) => { b.innerHTML = `<iframe title="Resume" src="${P.resume}#view=FitH"></iframe>`; }
    }),
    trash: () => {
      window.EGGS.find('trash');
      return {
        title: 'Trash', w: 560, h: 320, status: '3 items',
        render: (b) => {
          b.classList.add('fx');
          b.innerHTML = `<div class="fx-main" style="grid-column:1/-1">${[['oldsite', 'Portfolio (2025)', 'folder'], ['bugs', 'bugs.txt', 'doc'], ['old', 'Resume (2019).doc', 'doc']].map(([a, n, i]) => `<button type="button" class="fx-ico" data-t="${a}">${ICON[i]()}<span>${esc(n)}</span></button>`).join('')}</div>`;
          b.addEventListener('dblclick', (e) => {
            const t = e.target.closest('[data-t]');
            if (!t) return;
            if (t.dataset.t === 'oldsite') open('safari', 'index.html');
            if (t.dataset.t === 'bugs') alert({ title: 'bugs.txt', text: 'Known bugs: none listed.', icon: ICON.doc() });
            if (t.dataset.t === 'old') alert({ title: 'Resume_2019.pdf', text: 'An older resume, replaced by the current one.', icon: ICON.doc() });
          });
        }
      };
    }
  };
  SPECS.safari.multi = false;

  function doc(title, html) {
    return { title, w: 600, h: 480, cls: 'is-doc', render: (b) => { b.innerHTML = `<div class="te-ruler"></div><div class="te-page">${html()}</div>`; } };
  }

  const openRole = (id) => {
    const have = wins.get('experience');
    if (have) { if (have.min) restore(have); focus(have); have.select(id); return; }
    open('experience', id);
  };

  /* A small Terminal that knows its way around the dock. */
  function term(b, rec) {
    b.innerHTML = '<div class="tm-out"></div><div class="tm-line"><span>ajay@SommiBook:~$&nbsp;</span><input type="text" aria-label="Command" spellcheck="false" autocomplete="off" /></div>';
    const out = b.querySelector('.tm-out'), inp = b.querySelector('input');
    const say = (t) => { const d = h('div', '', t); out.appendChild(d); b.scrollTop = b.scrollHeight; };
    say('Last login: ' + new Date().toString().slice(0, 24) + ' on ttys000');
    say('Type <b>help</b> to see what this machine can do.');
    const run = (raw) => {
      say(`ajay@SommiBook:~$ ${esc(raw)}`);
      const [c, ...a] = raw.trim().toLowerCase().split(/\s+/);
      const app = Object.keys(APPS).find((k) => k === a[0] || APPS[k].name.toLowerCase().startsWith(a.join(' ')) && a.length);
      if (!c) return;
      if (c === 'help') say('open &lt;app&gt;  ls  whoami  about  resume  contact  era  clear  exit');
      else if (c === 'ls') say(DOCK.filter((x) => x !== '|').map((x) => APPS[x].name.replace(/ /g, '\\ ') + '.app').join('  '));
      else if (c === 'open') { if (app) { open(app); say(`Opening ${APPS[app].name}…`); } else say(`open: no app called ${esc(a.join(' '))}. Try ls.`); }
      else if (c === 'whoami') say('ajay');
      else if (c === 'about' || c === 'cat') { say(esc(P.about[1])); }
      else if (c === 'resume') { open('preview'); }
      else if (c === 'contact' || c === 'mail') { open('mail'); }
      else if (c === 'era' || c === 'tm' || c === 'timemachine') { timeTravel(); }
      else if (['1983', '1991', '1998'].includes(c)) { api.go(['1983', '1991', '1998'].indexOf(c)); }
      else if (c === 'uname') say('Darwin SommiBook 8.0.0 Darwin Kernel Version 8.0.0; Gator');
      else if (c === 'sudo') { window.EGGS.find('sudo'); say('ajay is not in the sudoers file. This incident will be reported.'); }
      else if (c === 'hire') { window.EGGS.find('hire'); say('Excellent decision. <a href="mailto:' + P.email + '">Send the offer</a>.'); }
      else if (c === 'clear') out.innerHTML = '';
      else if (c === 'exit') close(rec);
      else say(`-bash: ${esc(c)}: command not found`);
    };
    const hist = []; let hi = 0;
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { run(inp.value); if (inp.value.trim()) hist.push(inp.value); hi = hist.length; inp.value = ''; }
      if (e.key === 'ArrowUp' && hi > 0) { e.preventDefault(); inp.value = hist[--hi]; }
      if (e.key === 'ArrowDown') { e.preventDefault(); inp.value = hist[++hi] || ''; hi = Math.min(hi, hist.length); }
    });
    b.addEventListener('click', () => inp.focus());
    setTimeout(() => inp.focus(), 60);
  }

  /* --------------------------------------------------------------- dock */

  const buildDock = () => {
    dockEl.innerHTML = DOCK.map((a) => a === '|' ? '<span class="dk-sep" aria-hidden="true"></span>' : `<button type="button" class="dk-i" data-app="${a}" aria-label="${esc(APPS[a].name)}"><span class="dk-ic">${ICON[APPS[a].icon]()}</span><span class="dk-lbl">${esc(APPS[a].name)}</span><i class="dk-run"></i></button>`).join('');
    sizeDock();
  };
  let base = 54;
  const sizeDock = () => {
    const n = DOCK.length;
    base = Math.max(34, Math.min(54, Math.floor((SW() - 120) / n) - 6));
    dockEl.style.setProperty('--ds', base + 'px');
    dockEl.querySelectorAll('.dk-i').forEach((d) => { d.style.width = base + 'px'; });
  };
  /* The dock swells under the pointer, falling off with distance. */
  /* Centres are measured once with the dock at rest (in the dock's own
     coordinates, so scaling the page doesn't matter), and every change is
     written in one frame: nothing is read while widths change. */
  let rest = null, want = null, raf = 0;
  const magnify = (x) => {
    want = x;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const items = [...dockEl.querySelectorAll('.dk-i')];
      if (want == null) { items.forEach((d) => { d.style.width = base + 'px'; }); rest = null; return; }
      if (!rest) {
        const r0 = dockEl.getBoundingClientRect(), k = r0.width / dockEl.offsetWidth || 1;
        rest = { left: r0.left, k, c: items.map((d) => d.offsetLeft + d.offsetWidth / 2) };
      }
      const px = (want - rest.left) / rest.k;
      items.forEach((d, i) => {
        const dist = Math.abs(px - rest.c[i]);
        d.style.width = base * (1 + 0.75 * Math.max(0, 1 - dist / (base * 3))) + 'px';
      });
    });
  };
  const markRunning = () => {
    const run = new Set([...wins.values()].map((w) => w.app));
    dockEl.querySelectorAll('.dk-i').forEach((d) => d.classList.toggle('is-run', run.has(d.dataset.app) || d.dataset.app === 'finder'));
  };
  const bounce = (app) => {
    const d = dockEl.querySelector(`[data-app="${app}"] .dk-ic`);
    if (!d) return;
    /* Thrown up off the shelf and falling back under gravity: a high first
       bounce, each one lower, never sinking below the glass. Time in the
       air goes with the square root of the height, as it does. */
    const H = d.offsetHeight * 0.9, hops = [1, 0.5, 0.24, 0.1];
    const t = hops.map((k) => Math.sqrt(k));
    const total = t.reduce((a, b) => a + b, 0);
    const kf = [{ transform: 'translateY(0)', offset: 0, easing: 'cubic-bezier(.2,.6,.35,1)' }];
    let at = 0;
    hops.forEach((k, i) => {
      kf.push({ transform: `translateY(${-H * k}px)`, offset: (at + t[i] / 2) / total, easing: 'cubic-bezier(.65,0,.8,.4)' });
      at += t[i];
      kf.push({ transform: 'translateY(0)', offset: at / total, easing: 'cubic-bezier(.2,.6,.35,1)' });
    });
    d.animate(kf, { duration: 950 });
  };

  /* ---------------------------------------------------------- menu bar */

  const setAppName = (n) => { const e = menubar.querySelector('[data-m="app"]'); if (e) e.textContent = n; };

  const MENUS = () => {
    const f = front();
    const appName = f && APPS[f.app] ? APPS[f.app].name : 'Finder';
    return {
      mark: [
        ['About This Portfolio', () => alert({ title: 'SommiOS X', text: `Version 10.4 “Gator”<br/><br/>Built by Ajay Sommi<br/>${P.experience.length} roles, ${P.projects.length} projects<br/>Startup disk: Ajay HD`, icon: I.mark(64) })],
        ['Software Update…', () => { window.EGGS.find('update'); alert({ title: 'Your software is up to date.', text: 'No updates are available for this portfolio.', icon: ICON.hd() }); }],
        '-',
        ['System Preferences…', () => open('skills')],
        ['Dock', null],
        '-',
        ['Restart in Another Era…', () => timeTravel()],
        ['Shut Down…', shutdown]
      ],
      app: [[`About ${appName}`, () => alert({ title: appName, text: 'Part of the portfolio of Ajay Sommi.', icon: f ? ICON[APPS[f.app].icon]() : ICON.finder() })], '-', [`Hide ${appName}`, f ? () => minimize(f) : null], [`Quit ${appName}`, f ? () => close(f) : null]],
      file: [['New Message', () => open('mail')], ['Open Resume', () => open('preview')], '-', ['Close Window', f ? () => close(f) : null, '⌘W']],
      edit: [['Undo', null, '⌘Z'], '-', ['Copy Email Address', async () => { try { await navigator.clipboard.writeText(P.email); } catch (e) {} }]],
      view: [['Show Dock', null], ['Enter Full Screen', () => { const d = document.documentElement; if (d.requestFullscreen) d.requestFullscreen().catch(() => {}); }]],
      win: [['Minimize', f ? () => minimize(f) : null, '⌘M'], ['Zoom', f ? () => f.el.querySelector('.lt.zoom').click() : null], '-', ...[...wins.values()].map((w) => [w.spec.title, () => { if (w.min) restore(w); focus(w); }])],
      help: [['Search Spotlight', () => toggleSpot(true)], ['Read Welcome.rtf', () => open('welcome')]]
    };
  };

  let openMenu = null;
  const closeMenus = () => { root.querySelectorAll('.ox-drop').forEach((d) => d.remove()); menubar.querySelectorAll('.is-open').forEach((m) => m.classList.remove('is-open')); openMenu = null; };
  const showMenu = (btn) => {
    closeMenus();
    const list = MENUS()[btn.dataset.m];
    if (!list) return;
    const d = h('div', 'ox-drop');
    list.forEach((it) => {
      if (it === '-') { d.appendChild(h('hr')); return; }
      const [l, fn, k] = it;
      const b = h('button', '', `<span>${esc(l)}</span><span class="k">${k || ''}</span>`);
      b.type = 'button';
      if (!fn) b.disabled = true;
      b.addEventListener('click', () => { closeMenus(); fn && fn(); });
      d.appendChild(b);
    });
    d.style.left = btn.offsetLeft + 'px';
    root.appendChild(d);
    btn.classList.add('is-open');
    openMenu = btn;
  };

  /* ---------------------------------------------------------- spotlight */

  const INDEX = () => {
    const r = [];
    Object.entries(APPS).forEach(([k, a]) => { if (k !== 'trash') r.push(['Applications', a.name, ICON[a.icon](), () => open(k), (a.name + ' ' + (a.keys || '')).toLowerCase()]); });
    P.experience.forEach((e) => r.push(['Roles', `${e.org} — ${e.role}`, `<i class="sp-dot" style="background:${TINT[e.id]}"></i>`, () => openRole(e.id), (e.org + ' ' + e.short + ' ' + e.role + ' ' + e.tags.join(' ')).toLowerCase()]));
    P.projects.forEach((p) => r.push(['Projects', p.full, ICON.projects(), () => open('projects'), (p.full + ' ' + p.stack).toLowerCase()]));
    P.skills.forEach(([g, l]) => l.forEach((s) => r.push(['Skills', s, ICON.skills(), () => open('skills'), (s + ' ' + g).toLowerCase()])));
    r.push(['Documents', 'Ajay_Sommi_Resume.pdf', ICON.doc(), () => open('preview'), 'resume cv pdf']);
    r.push(['Documents', window.PAPERS[2007].news.file, ICON.doc(), () => open('news07'), 'news headlines 2007 iphone kindle android']);
    r.push(['Documents', window.PAPERS[2007].brochure.file, ICON.doc(), () => open('brochure07'), 'brochure sommibook laptop']);
    return r;
  };
  const toggleSpot = (on) => {
    const want = on == null ? spot.hidden : on;
    spot.hidden = !want;
    menubar.querySelector('[data-spot]').classList.toggle('is-open', want);
    if (want) { const i = spot.querySelector('input'); i.value = ''; spotRender(''); setTimeout(() => i.focus(), 20); }
  };
  let hits = [];
  const spotRender = (q) => {
    const res = spot.querySelector('.sp-res');
    q = q.trim().toLowerCase();
    if (!q) { res.innerHTML = ''; hits = []; return; }
    hits = INDEX().filter((x) => x[4].includes(q) || x[1].toLowerCase().includes(q)).slice(0, 14);
    const groups = {};
    hits.forEach((x) => { (groups[x[0]] = groups[x[0]] || []).push(x); });
    let n = 0;
    res.innerHTML = (hits.length ? `<div class="sp-g"><span>Top Hit</span><div><button type="button" class="on" data-n="0">${hits[0][2]}${esc(hits[0][1])}</button></div></div>` : '<div class="sp-none">No results</div>') +
      Object.entries(groups).map(([g, l]) => `<div class="sp-g"><span>${g}</span><div>${l.map((x) => `<button type="button" data-n="${hits.indexOf(x)}">${x[2]}${esc(x[1])}</button>`).join('')}</div></div>`).join('');
    void n;
  };

  /* ---------------------------------------------------------- era & power */

  async function timeTravel() {
    window.EGGS.find('timemachine');
    const s = h('div', 'ox-warp', '<i></i>'.repeat(60));
    s.querySelectorAll('i').forEach((i) => { i.style.setProperty('--a', Math.random() * 360 + 'deg'); i.style.animationDelay = Math.random() * 0.5 + 's'; });
    root.appendChild(s);
    SFX.whoosh();
    await wait(1100);
    s.remove();
    api.picker();
  }

  async function shutdown() {
    const r = await alert({ title: 'Are you sure you want to shut down your portfolio?', text: 'You can start it again, or start up from another era.', buttons: ['Cancel', 'Restart in Another Era', 'Shut Down'], icon: I.mark(64) });
    if (r === 'Shut Down' || r === 'Restart in Another Era') {
      root.classList.add('is-off');
      await wait(700);
      root.classList.remove('is-off');
      api.picker();
    }
  }

  /* ------------------------------------------------------------- build */

  const build = (scr, deskApi) => {
    api = deskApi;
    root = h('div', 'ox');
    root.innerHTML = `
      <div class="ox-wall" aria-hidden="true"></div>
      <div class="ox-menubar" role="menubar">
        <button type="button" class="m mk" data-m="mark" aria-label="AJ menu">${I.mark(15, true)}</button>
        <button type="button" class="m b" data-m="app">Finder</button>
        <button type="button" class="m" data-m="file">File</button><button type="button" class="m" data-m="edit">Edit</button><button type="button" class="m" data-m="view">View</button><button type="button" class="m" data-m="win">Window</button><button type="button" class="m" data-m="help">Help</button>
        <span class="sp"></span>
        <span class="st" aria-hidden="true"><svg viewBox="0 -1.5 18 14.5" width="18" height="14.5" style="overflow:visible"><path d="M9 12.5 6.6 9.9a3.4 3.4 0 0 1 4.8 0zM4.4 7.6a6.4 6.4 0 0 1 9.2 0l1.5-1.6a8.6 8.6 0 0 0-12.2 0zM1.3 4.3a11 11 0 0 1 15.4 0L18 3A12.8 12.8 0 0 0 0 3z" fill="currentColor"/></svg></span>
        <button type="button" class="st snd" data-snd aria-label="Toggle sound">${I.spk(SFX.muted)}</button>
        <span class="st bat" aria-hidden="true"><i></i></span>
        <span class="st clk"></span>
        <button type="button" class="st spot" data-spot aria-label="Spotlight"><svg viewBox="0 0 16 16" width="15" height="15"><circle cx="6.5" cy="6.5" r="4.6" fill="none" stroke="currentColor" stroke-width="2"/><path d="m10 10 4.5 4.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button>
      </div>
      <div class="ox-desk"></div>
      <div class="ox-spot" hidden><div class="sp-bar"><b>Spotlight</b><input type="search" aria-label="Spotlight search" placeholder="" /></div><div class="sp-res"></div></div>
      <div class="ox-dockwrap"><div class="ox-shelf" aria-hidden="true"></div><div class="ox-dock" role="toolbar" aria-label="Dock"></div></div>`;
    scr.appendChild(root);
    menubar = root.querySelector('.ox-menubar');
    deskEl = root.querySelector('.ox-desk');
    window.RETRO.marquee(root, { isBg: (t) => t === root || t === deskEl, items: () => [...deskEl.querySelectorAll('.dt-i')], sel: 'is-sel', cls: 'sel-07' });
    dockEl = root.querySelector('.ox-dock');
    spot = root.querySelector('.ox-spot');

    deskEl.innerHTML = [['finder', 'Ajay HD', 'hd'], ['preview', 'Resume.pdf', 'doc'], ['welcome', 'Welcome.rtf', 'doc'], ['news07', window.PAPERS[2007].news.file, 'doc'], ['brochure07', window.PAPERS[2007].brochure.file, 'doc']].map(([a, n, i]) => `<button type="button" class="dt-i" data-open="${a}">${ICON[i]()}<span>${esc(n)}</span></button>`).join('');
    buildDock();

    const clk = menubar.querySelector('.clk');
    const tick = () => { clk.textContent = new Date().toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' }).replace(',', ''); };
    tick(); setInterval(tick, 15000);
    document.addEventListener('sfx-mute', (e) => { menubar.querySelector('[data-snd]').innerHTML = I.spk(e.detail); });

    menubar.addEventListener('pointerdown', (e) => {
      const m = e.target.closest('.m');
      if (m) { e.preventDefault(); if (openMenu === m) closeMenus(); else showMenu(m); return; }
      if (e.target.closest('[data-snd]')) { SFX.toggle(); return; }
      if (e.target.closest('[data-spot]')) { e.preventDefault(); toggleSpot(); }
    });
    menubar.addEventListener('pointerover', (e) => { const m = e.target.closest('.m'); if (openMenu && m && m !== openMenu) showMenu(m); });
    root.addEventListener('pointerdown', (e) => {
      if (openMenu && !e.target.closest('.ox-drop, .ox-menubar')) closeMenus();
      if (!spot.hidden && !e.target.closest('.ox-spot, [data-spot]')) toggleSpot(false);
      if (e.target === deskEl) deskEl.querySelectorAll('.dt-i').forEach((x) => x.classList.remove('is-sel'));
    });
    root.addEventListener('click', (e) => {
      const o = e.target.closest('[data-open]');
      if (o && !o.closest('.fx-main')) {
        if (o.classList.contains('dt-i')) { deskEl.querySelectorAll('.dt-i').forEach((x) => x.classList.toggle('is-sel', x === o)); if (e.detail === 0) open(o.dataset.open); }
        else open(o.dataset.open);
      }
    });
    deskEl.addEventListener('dblclick', (e) => { const o = e.target.closest('[data-open]'); if (o) open(o.dataset.open); });
    root.addEventListener('input', (e) => {
      if (e.target.matches('[data-spot]')) { toggleSpot(true); spot.querySelector('input').value = e.target.value; spotRender(e.target.value); e.target.value = ''; spot.querySelector('input').focus(); }
    });

    const si = spot.querySelector('input');
    si.addEventListener('input', () => spotRender(si.value));
    si.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && hits[0]) { toggleSpot(false); hits[0][3](); }
      if (e.key === 'Escape') toggleSpot(false);
    });
    spot.addEventListener('click', (e) => { const b = e.target.closest('[data-n]'); if (b) { toggleSpot(false); hits[+b.dataset.n][3](); } });

    dockEl.addEventListener('pointermove', (e) => magnify(e.clientX));
    dockEl.addEventListener('pointerleave', () => magnify(null));
    dockEl.addEventListener('click', (e) => {
      const d = e.target.closest('.dk-i');
      if (!d) return;
      const a = d.dataset.app;
      const w = [...wins.values()].filter((x) => x.app === a);
      if (w.length) { w.forEach((x) => { if (x.min) restore(x); }); focus(w[w.length - 1]); return; }
      open(a);
    });

    document.addEventListener('keydown', (e) => {
      if (!active) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.code === 'Space') { e.preventDefault(); toggleSpot(); return; }
      if (e.target.closest && e.target.closest('input, textarea')) return;
      const f = front();
      if (mod && e.key.toLowerCase() === 'w' && f) { e.preventDefault(); close(f); }
      if (mod && e.key.toLowerCase() === 'm' && f) { e.preventDefault(); minimize(f); }
      if (e.key === 'Escape') { closeMenus(); toggleSpot(false); }
    });
  };

  const boot = async () => {
    const b = h('div', 'ox-boot', `${I.mark(96, true)}<span class="ox-spin">${'<i></i>'.repeat(12)}</span>`);
    root.appendChild(b);
    root.classList.add('is-booting');
    SFX.chime();
    await wait(2200);
    b.classList.add('is-gone');
    root.classList.remove('is-booting');
    await wait(500);
    b.remove();
    sizeDock();
    markRunning();
    if (!store.get('ox-welcome', false)) { store.set('ox-welcome', true); open('welcome'); }
  };

  return {
    build,
    boot,
    enter() { active = true; },
    leave() { active = false; closeMenus(); },
    resize() { sizeDock(); }
  };
})();
