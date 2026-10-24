/* ==========================================================================
   iPhone 2G simulator, for development only (?device=iphone on a local
   host). A lock screen with slide to unlock, a springboard of glossy icons
   over a reflective dock, and the first iPhone OS's apps, each holding a
   piece of the portfolio: Calendar is the career, Text the guestbook,
   Photos the garage, Notes the about page, and so on. The home button
   closes whatever is open; the top button sleeps and wakes the screen.
   ========================================================================== */
(function iphone() {
  if (document.documentElement.dataset.mode !== 'iphone') return;

  const P = window.PORTFOLIO;
  const { esc } = window.RETRO;
  const I = window.ICONS;
  const room = document.getElementById('iphoneRoom');
  const SFX = window.SFX;

  room.innerHTML = `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="ipTabBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd0ff"/><stop offset=".5" stop-color="#2a8ff2"/><stop offset=".51" stop-color="#1477e0"/><stop offset="1" stop-color="#3a9cf5"/></linearGradient></defs></svg>
    <div class="ip-scale"><div class="ip">
      <button class="ip-btn ip-sleep" type="button" aria-label="Sleep/Wake"></button>
      <span class="ip-btn ip-ring" aria-hidden="true"></span>
      <button class="ip-btn ip-vol up" type="button" aria-label="Volume up"></button>
      <button class="ip-btn ip-vol dn" type="button" aria-label="Volume down"></button>
      <div class="ip-face">
        <span class="ip-ear" aria-hidden="true"></span>
        <div class="ip-screen" data-bar="trans" role="application" aria-label="Phone screen">
          <div class="ip-status"><span class="l"><span class="ip-sig"><i></i><i></i><i></i><i></i><i></i></span>SOMMI <span class="ip-edge">E</span></span><span class="c"></span><span class="r"><span class="ip-bat"><i></i></span></span></div>
          <div class="ip-board is-flying"><div class="ip-grid"></div><div class="ip-dock"></div></div>
          <div class="ip-lock"><div class="top"><div class="time"></div><div class="date"></div></div><div class="bot"><div class="ip-slider"><div class="txt">slide to unlock</div><div class="ip-knob" role="slider" aria-label="Slide to unlock" tabindex="0"><svg viewBox="0 0 30 22"><path d="M2 8h14V2l12 9-12 9v-6H2z" fill="#8a8a8a" stroke="#6a6a6a"/></svg></div></div></div></div>
          <div class="ip-boot">${I.mark(84, true)}</div>
          <div class="ip-off"></div>
        </div>
      </div>
      <button class="ip-home" type="button" aria-label="Home"></button>
    </div></div>
    <div class="ip-note">Development preview · iPhone 2G · drag the slider, then the home button closes apps</div>`;

  const scaleBox = room.querySelector('.ip-scale');
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

  const fit = () => {
    const s = Math.min(1.25, (innerHeight - 50) / 760, (innerWidth - 30) / 410);
    scaleBox.style.transform = `scale(${s})`;
  };
  fit();
  addEventListener('resize', fit);

  /* ---------------------------------------------------------------- clock */

  const now = () => new Date();
  const hm = (d, ampm = true) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).replace(ampm ? /$/ : / ?[AP]M$/, '');
  const tickClock = () => {
    const d = now();
    lock.querySelector('.time').textContent = hm(d, false);
    lock.querySelector('.date').textContent = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    statusC.innerHTML = state === 'locked' ? '<svg class="ip-lockglyph" viewBox="0 0 9 11"><path d="M2 5V3.4a2.5 2.5 0 0 1 5 0V5" fill="none" stroke="#fff" stroke-width="1.4"/><rect y="5" width="9" height="6" rx="1" fill="#fff"/></svg>' : hm(d);
  };

  /* ---------------------------------------------------------------- icons */

  const g = (id, a, b, dir = 'v') => `<linearGradient id="${id}" x1="0" y1="0" x2="${dir === 'v' ? 0 : 1}" y2="${dir === 'v' ? 1 : 0}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const svg = (inner, defs = '') => `<svg viewBox="0 0 57 57" aria-hidden="true"><defs>${defs}</defs>${inner}</svg>`;
  const clockFace = (d, size = 57, dark = true) => {
    const h = d.getHours() % 12, m = d.getMinutes();
    const ha = (h + m / 60) * 30, ma = m * 6;
    const c = size / 2, r = size * 0.4;
    let ticks = '';
    for (let i = 0; i < 12; i++) ticks += `<line x1="${c}" y1="${c - r + 2}" x2="${c}" y2="${c - r + (i % 3 ? 4 : 7)}" stroke="${dark ? '#000' : '#fff'}" stroke-width="${i % 3 ? 1 : 2}" transform="rotate(${i * 30} ${c} ${c})"/>`;
    return `<circle cx="${c}" cy="${c}" r="${r}" fill="${dark ? '#fff' : '#111'}" stroke="${dark ? '#bbb' : '#555'}"/>${ticks}<line x1="${c}" y1="${c}" x2="${c}" y2="${c - r * 0.55}" stroke="${dark ? '#000' : '#fff'}" stroke-width="2.6" stroke-linecap="round" transform="rotate(${ha} ${c} ${c})"/><line x1="${c}" y1="${c}" x2="${c}" y2="${c - r * 0.82}" stroke="${dark ? '#000' : '#fff'}" stroke-width="1.8" stroke-linecap="round" transform="rotate(${ma} ${c} ${c})"/><line x1="${c}" y1="${c + 4}" x2="${c}" y2="${c - r * 0.85}" stroke="#d00" stroke-width=".8" transform="rotate(${d.getSeconds() * 6} ${c} ${c})"/><circle cx="${c}" cy="${c}" r="1.6" fill="${dark ? '#000' : '#fff'}"/>`;
  };

  const ICON = {
    sms: () => svg(`<rect width="57" height="57" fill="url(#a)"/><ellipse cx="28.5" cy="26" rx="19" ry="14" fill="#fff"/><path d="M16 35q-1 6-7 9 10 0 14-6z" fill="#fff"/>`, g('a', '#a4f272', '#25a514')),
    cal: () => { const d = now(); return svg(`<rect width="57" height="57" fill="url(#a)"/><rect width="57" height="16" fill="url(#b)"/><text x="28.5" y="12" text-anchor="middle" font-family="Helvetica Neue,Helvetica,Arial" font-weight="bold" font-size="10" fill="#fff">${d.toLocaleDateString('en-US', { weekday: 'long' })}</text><text x="28.5" y="48" text-anchor="middle" font-family="Helvetica Neue,Helvetica,Arial" font-weight="bold" font-size="32" fill="#222">${d.getDate()}</text>`, g('a', '#ffffff', '#d9d9d9') + g('b', '#ef5a5a', '#b51010')); },
    photos: () => {
      let pet = '';
      for (let i = 0; i < 14; i++) pet += `<ellipse cx="28.5" cy="16" rx="3.6" ry="8.5" fill="#ffd21f" stroke="#e39b00" stroke-width=".6" transform="rotate(${i * 25.7} 28.5 25)"/>`;
      return svg(`<rect width="57" height="57" fill="url(#a)"/><path d="M28 34q2 12-2 23h4q3-12 0-23z" fill="#3b8a1e"/><path d="M29 46q8-8 14-6-6 7-14 8z" fill="#4aa52a"/>${pet}<circle cx="28.5" cy="25" r="7" fill="url(#c)"/>`, g('a', '#8cc8ff', '#2f78d8') + `<radialGradient id="c"><stop offset="0" stop-color="#8a5a1c"/><stop offset="1" stop-color="#4a2a08"/></radialGradient>`);
    },
    camera: () => svg(`<rect width="57" height="57" fill="url(#a)"/><rect x="6" y="15" width="45" height="30" rx="5" fill="#2a2a2a" stroke="#555"/><circle cx="28.5" cy="30" r="12" fill="#111" stroke="#777" stroke-width="2"/><circle cx="28.5" cy="30" r="7" fill="url(#c)"/><circle cx="25.5" cy="27" r="2" fill="#fff" opacity=".8"/><rect x="40" y="18" width="7" height="4" rx="1" fill="#888"/>`, g('a', '#b9b9b9', '#4c4c4c') + `<radialGradient id="c"><stop offset="0" stop-color="#4b6cc4"/><stop offset="1" stop-color="#0a0f2a"/></radialGradient>`),
    projects: () => svg(`<rect width="57" height="57" fill="url(#a)"/><rect x="8" y="12" width="41" height="30" rx="4" fill="#111" stroke="#666"/><text x="28.5" y="33" text-anchor="middle" font-family="Menlo,Monaco,monospace" font-weight="bold" font-size="14" fill="#7cff7a">&lt;/&gt;</text><rect x="22" y="44" width="13" height="4" fill="#555"/>`, g('a', '#d33b3b', '#7a0d0d')),
    stocks: () => svg(`<rect width="57" height="57" fill="#000"/><rect y="0" width="57" height="20" fill="url(#a)"/><path d="M5 44l9-6 7 3 8-12 7 5 8-14 8-5" fill="none" stroke="#fff" stroke-width="2.4"/><path d="M5 44l9-6 7 3 8-12 7 5 8-14 8-5V57H5z" fill="#3a6ad8" opacity=".55"/>`, g('a', '#4d79c9', '#122f6a')),
    maps: () => svg(`<rect width="57" height="57" fill="#efe9da"/><path d="M0 40q20-6 30 4t27 2V57H0z" fill="#9ec0e0"/><path d="M-2 18 59 30M18 -2 30 59" stroke="#fff" stroke-width="5"/><path d="M-2 18 59 30M18 -2 30 59" stroke="#f3c64c" stroke-width="2"/><path d="M40 -2 44 59" stroke="#fff" stroke-width="3"/><rect x="34" y="8" width="11" height="9" rx="1.5" fill="#fff" stroke="#3a6ad8"/><text x="39.5" y="15.5" text-anchor="middle" font-size="6" font-weight="bold" fill="#3a6ad8" font-family="Helvetica Neue,Arial">280</text><circle cx="27" cy="24" r="4.5" fill="#d00"/><path d="M26.2 27h1.6v9h-1.6z" fill="#999"/>`),
    weather: () => svg(`<rect width="57" height="57" fill="url(#a)"/><circle cx="34" cy="21" r="11" fill="url(#s)"/><path d="M12 42a7 7 0 0 1 3-13 9 9 0 0 1 17-1 6 6 0 0 1 10 6 5 5 0 0 1-1 9z" fill="#fff"/><text x="10" y="17" font-family="Helvetica Neue,Arial" font-weight="bold" font-size="11" fill="#fff">73°</text>`, g('a', '#62a8ff', '#1f5bc6') + g('s', '#fff27a', '#ffb000')),
    clock: () => svg(`<rect width="57" height="57" fill="url(#a)"/>${clockFace(now())}`, g('a', '#4a4a4a', '#000')),
    calc: () => svg(`<rect width="57" height="57" fill="url(#a)"/>${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<rect x="${7 + c * 12}" y="${10 + r * 12}" width="10" height="10" rx="2" fill="#5a5a5a" stroke="#222"/>`).join('')).join('')}<rect x="43" y="10" width="8" height="22" rx="2" fill="#6c7f99" stroke="#222"/><rect x="43" y="34" width="8" height="12" rx="2" fill="#f28a1c" stroke="#222"/><text x="47" y="25" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold" font-family="Arial">+</text><text x="47" y="43" text-anchor="middle" fill="#fff" font-size="9" font-weight="bold" font-family="Arial">=</text>`, g('a', '#3d3d3d', '#111')),
    notes: () => svg(`<rect width="57" height="57" fill="url(#a)"/>${[22, 30, 38, 46, 54].map((y) => `<line x1="0" y1="${y}" x2="57" y2="${y}" stroke="#d9c76a" stroke-width="1"/>`).join('')}<rect width="57" height="13" fill="url(#b)"/>${[6, 14, 22, 30, 38, 46].map((x) => `<rect x="${x}" y="11" width="4" height="4" rx="1" fill="#5a3a12"/>`).join('')}`, g('a', '#fff5a8', '#f2d65a') + g('b', '#b98b55', '#6e4818')),
    settings: () => {
      const gear = (cx, cy, r, n) => { let s = ''; for (let i = 0; i < n; i++) s += `<rect x="${cx - 2.6}" y="${cy - r - 3.5}" width="5.2" height="7" rx="1" transform="rotate(${i * 360 / n} ${cx} ${cy})"/>`; return `<g fill="#555">${s}<circle cx="${cx}" cy="${cy}" r="${r}"/></g><circle cx="${cx}" cy="${cy}" r="${r * 0.42}" fill="#b6bcc3"/>`; };
      return svg(`<rect width="57" height="57" fill="url(#a)"/>${gear(24, 30, 12, 10)}${gear(42, 15, 7, 8)}`, g('a', '#d7dce1', '#7b838c'));
    },
    phone: () => svg(`<rect width="57" height="57" fill="url(#a)"/><path d="M17 10c3-2 6 0 7 3l2 6c1 3-1 4-3 5 1 5 5 10 10 12 1-2 3-4 6-3l6 3c3 1 4 4 2 7-2 4-7 6-12 4C24 43 14 33 11 22c-1-5 2-10 6-12z" fill="#fff"/>`, g('a', '#9ef06a', '#1f9a14')),
    mail: () => svg(`<rect width="57" height="57" fill="url(#a)"/><ellipse cx="14" cy="12" rx="10" ry="4" fill="#fff" opacity=".6"/><ellipse cx="44" cy="9" rx="9" ry="3.5" fill="#fff" opacity=".5"/><rect x="8" y="18" width="41" height="27" rx="2" fill="#fff" stroke="#aac"/><path d="M8.5 19 28.5 34 48.5 19" fill="none" stroke="#8a9ab5" stroke-width="1.6"/>`, g('a', '#9ad2ff', '#1c6fdc')),
    safari: () => {
      let t = '';
      for (let i = 0; i < 36; i++) t += `<line x1="28.5" y1="8" x2="28.5" y2="${i % 3 ? 10 : 12}" stroke="#fff" stroke-width=".8" transform="rotate(${i * 10} 28.5 28.5)"/>`;
      return svg(`<rect width="57" height="57" fill="url(#a)"/><circle cx="28.5" cy="28.5" r="22" fill="url(#c)" stroke="#fff" stroke-width="1.5"/>${t}<path d="M28.5 28.5 40 15 32 31z" fill="#e33"/><path d="M28.5 28.5 17 42 25 26z" fill="#fff"/>`, g('a', '#e9f3ff', '#9fb8d6') + `<radialGradient id="c"><stop offset="0" stop-color="#6ec0ff"/><stop offset="1" stop-color="#1257b8"/></radialGradient>`);
    },
    ipod: () => svg(`<rect width="57" height="57" fill="url(#a)"/><path d="M24 14l18-4v26a6 6 0 1 1-3-5V18l-12 3v18a6 6 0 1 1-3-5z" fill="#fff"/>`, g('a', '#ffc35a', '#f06a0a'))
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
      if (prev) { prev.pg.classList.add('out-l'); pg.classList.add('in-r'); setTimeout(() => { prev.pg.style.visibility = 'hidden'; prev.pg.classList.remove('out-l'); }, 300); }
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
    setBar('trans');
    state = 'home';
    tickClock();
  };

  /* Rows: a tappable plain list. */
  const plain = (pg, rows) => {
    const ul = h('ul', 'pl');
    rows.forEach((r) => {
      if (r.header) { ul.appendChild(h('li', 'sh', esc(r.header))).style.cursor = 'default'; return; }
      const li = h('li', (r.go ? 'chev ' : '') + (r.sub ? 'two' : ''), `${r.img ? `<img src="${r.img}" alt="" />` : ''}${r.lead || ''}<span class="tx">${esc(r.text)}${r.sub ? `<span class="sub">${esc(r.sub)}</span>` : ''}</span>${r.rt ? `<span class="rt">${esc(r.rt)}</span>` : ''}`);
      if (r.go) li.addEventListener('click', () => { SFX.click(); r.go(); });
      ul.appendChild(li);
    });
    pg.appendChild(ul);
    return ul;
  };
  const group = (rows) => `<div class="gp">${rows.map(([k, v, n]) => `<div class="row">${k ? `<span class="k">${esc(k)}</span>` : ''}<span class="v${n ? ' n' : ''}">${v}</span></div>`).join('')}</div>`;
  const ext = (url) => window.open(url, '_blank', 'noopener');

  /* ----------------------------------------------------------------- apps */

  const roleDetail = (e) => (pg) => {
    pg.innerHTML = `<div class="pin">${group([['', `${esc(e.role)}<br/><span style="font-weight:normal;color:#4c566c">${esc(e.org)}</span>`]])}
      ${group([['starts', esc(e.when.split(' to ')[0]), 1], ['ends', esc(e.when.split(' to ')[1] || ''), 1], ['location', esc(e.where), 1]])}
      <div class="gl">Notes</div><div class="gp"><div class="txt">${esc(e.text)}</div></div>
      ${e.stats.length ? `<div class="gl">Results</div>${group(e.stats.map(([a, b]) => [a, esc(b), 1]))}` : ''}
      <div class="gl">Tools</div><div class="gp"><div class="txt">${e.tags.map(esc).join(' · ')}</div></div>
      ${e.photos.length ? `<div class="gp"><div class="thumbs">${e.photos.map((p) => `<img src="${p}" alt="" />`).join('')}</div></div>` : ''}</div>`;
  };

  const APPS = {
    sms: { name: 'Text', open(app) {
      app.push('Text Messages', (pg) => plain(pg, P.recs.map(([n, c, q]) => ({ text: n, sub: q, rt: c.split(' ')[0], go: () => app.push(n.split(' ')[0], (p) => {
        p.innerHTML = `<div class="sms"><div class="day">${esc(c)}</div><div class="bub in">${esc(q)}</div><div class="bub out">Thank you, ${esc(n.split(' ')[0])}! That means a lot.</div></div><div class="sms-bar"><span></span><b>Send</b></div>`;
        p.style.background = '#dbe2ed';
      }) }))));
    } },
    cal: { name: 'Calendar', open(app) {
      const rows = [];
      [...P.experience].reverse().forEach((e, i, arr) => {
        if (i === 0 || arr[i - 1].year !== e.year) rows.push({ header: String(e.year) });
        rows.push({ text: e.short, sub: e.role, rt: e.when.split(' ')[0], go: () => app.push(e.short, roleDetail(e)) });
      });
      app.push('Experience', (pg) => plain(pg, rows));
    } },
    photos: { name: 'Photos', open(app) {
      app.push('Photo Albums', (pg) => plain(pg, P.offclock.map((s) => ({ text: `${s.name} (${s.steps.length})`, img: s.cover, go: () => app.push(s.name, (p) => {
        p.innerHTML = `<div style="padding:8px 10px;font:13px/1.4 'Helvetica Neue',Arial;color:#555">${esc(s.lede)}</div><div class="grid4">${s.steps.map((st, k) => `<img src="${st[0]}" data-k="${k}" alt="${esc(st[1])}" />`).join('')}</div>`;
        p.addEventListener('click', (ev) => { const im = ev.target.closest('img[data-k]'); if (im) viewer(app, s, +im.dataset.k); });
      }) }))));
    } },
    camera: { name: 'Camera', bare: true, open(app) {
      app.el.innerHTML = `<div class="cam" style="background-image:url(${P.photo})"><div class="iris">${[0, 1, 2, 3, 4, 5].map((i) => `<i style="--r:${i * 60}deg;transform:rotate(${i * 60}deg)"></i>`).join('')}</div><div class="flash"></div><div class="bar"><button class="shut" type="button" aria-label="Take picture"><svg viewBox="0 0 30 22" width="30" height="22"><rect x="2" y="5" width="26" height="16" rx="3" fill="#333"/><circle cx="15" cy="13" r="5.5" fill="#bbb" stroke="#333" stroke-width="2"/><rect x="10" y="2" width="10" height="4" rx="1" fill="#333"/></svg></button></div></div>`;
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
    projects: { name: 'Projects', open(app) {
      app.push('Projects', (pg) => plain(pg, P.projects.map((p) => ({ text: p.name, sub: p.stack, go: () => app.push(p.name, (x) => {
        x.innerHTML = `<div class="pin">${group([['', `${esc(p.full)}<br/><span style="font-weight:normal;color:#4c566c">${esc(p.kind)}</span>`]])}<div class="gp"><div class="txt">${esc(p.text)}</div></div>${group([['stack', esc(p.stack), 1]])}${p.url ? '<button class="gbtn" type="button" data-go>View on GitHub</button>' : '<div class="gl" style="text-align:center">Source is private for now</div>'}</div>`;
        const b = x.querySelector('[data-go]');
        if (b) b.addEventListener('click', () => ext(p.url));
      }) }))));
    } },
    stocks: { name: 'Stocks', bar: 'black', nb: 'black', open(app) {
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
          const [s, v, , rid, d] = T[i];
          const e = P.experience.find((x) => x.id === rid);
          let pts = '', y = 40;
          for (let k = 0; k <= 12; k++) { y = Math.max(6, Math.min(54, y + (Math.sin(k * 1.7 + i) * 9) - (T[i][2] === 'up' ? 3 : -3))); pts += `${k * 25},${y} `; }
          panel.innerHTML = `<b>${s} ${v}</b>${esc(d)}<svg viewBox="0 0 300 60" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="${T[i][2] === 'up' ? '#7be05a' : '#ff6b6b'}" stroke-width="2"/></svg><span style="color:#aaa">${esc(e.org)} · ${e.year}</span>`;
          pg.querySelectorAll('.row').forEach((r, k) => r.classList.toggle('on', k === i));
        };
        pg.addEventListener('click', (ev) => { const r = ev.target.closest('.row'); if (r) { SFX.click(); show(+r.dataset.i); } });
        show(0);
      });
    } },
    maps: { name: 'Maps', bare: true, open(app) {
      const US = [[-124.7, 48.4], [-124, 42], [-122.4, 37.8], [-120.6, 34.6], [-117.1, 32.5], [-114.7, 32.7], [-111, 31.3], [-106.5, 31.8], [-103, 29], [-99.5, 26.4], [-97.2, 25.9], [-97.4, 27.8], [-94.7, 29.4], [-90, 29.2], [-89, 30.2], [-85, 29.7], [-83, 29], [-82.5, 27.5], [-81.7, 25.2], [-80.4, 25.2], [-80, 26.8], [-81.2, 30.3], [-79, 33.6], [-75.5, 35.3], [-76, 37], [-74, 40.5], [-70, 41.6], [-70.5, 43], [-67, 44.8], [-67.8, 47.1], [-69.2, 47.4], [-71.5, 45], [-75, 45], [-79, 43.3], [-83, 42], [-82.5, 45.3], [-84.6, 46.5], [-88, 48], [-95, 49], [-123, 49]];
      const X = (lon) => (lon + 126) / 60 * 320, Y = (lat) => (50 - lat) / 26 * 177 * 1.25;
      const CITIES = [['Jacksonville, FL', 30.33, -81.66, 'rjax'], ['Palo Alto, CA', 37.44, -122.14, 'rfa'], ['Gainesville, FL', 29.65, -82.32, 'fics'], ['Deerfield Beach, FL', 26.32, -80.1, 'jm'], ['St. Louis, MO', 38.63, -90.2, 'hunter'], ['Boca Raton, FL', 26.0, -80.13, 'adt']];
      app.el.innerHTML = `<div class="map" style="top:20px"><div class="map-bar"><span>Places I’ve worked</span></div><svg viewBox="0 0 320 240" height="240"><path d="M${US.map(([a, b]) => `${X(a).toFixed(1)} ${Y(b).toFixed(1)}`).join('L')}Z" fill="#f2efe9" stroke="#c9c0ad"/><path d="M${X(-120)} ${Y(47)}L${X(-90)} ${Y(41)}L${X(-80)} ${Y(35)}M${X(-117)} ${Y(33)}L${X(-97)} ${Y(32)}L${X(-82)} ${Y(30)}" stroke="#f3c64c" stroke-width="1.6" fill="none"/></svg>${CITIES.map(([n, la, lo, id], i) => `<button class="pin-d" type="button" data-i="${i}" style="left:${X(lo)}px;top:${30 + Y(la)}px;animation-delay:${i * 0.12}s" aria-label="${esc(n)}"></button>`).join('')}<div class="tbar" style="background:linear-gradient(180deg,#b0bccd,#6d84a2)"><button type="button" data-list style="font-size:13px;width:auto">List</button></div></div>`;
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
    weather: { name: 'Weather', bare: true, bar: 'black', open(app) {
      const e = P.education;
      app.el.innerHTML = `<div class="wx"><div class="wx-card"><div class="hd"><div class="city">Gainesville</div><div class="hi">${esc(e.school)}<br/>Class of ${esc(e.when)}</div><div class="tmp">26°</div></div>
        <ul>${[['Mon', 'Operating Systems', '☀'], ['Tue', 'Databases', '⛅'], ['Wed', 'Algorithms', '☀'], ['Thu', 'Software Eng.', '☁'], ['Fri', 'Artificial Intelligence', '☀'], ['Sat', 'Cybersecurity', '⚡']].map(([d, c, i]) => `<li><span>${d}</span><span>${i} ${esc(c)}</span></li>`).join('')}</ul></div>
        <div class="wx-foot">${esc(e.degree)} · ${esc(e.college)}<br/>Forecast: AI Certificate, 100% chance.</div></div>`;
      app.el.style.paddingTop = '20px';
      app.el.style.background = '#111';
    } },
    clock: { name: 'Clock', open(app) {
      const C = [['Jacksonville', 'America/New_York'], ['Palo Alto', 'America/Los_Angeles'], ['St. Louis', 'America/Chicago'], ['Boca Raton', 'America/New_York'], ['Gainesville', 'America/New_York']];
      let t = 0;
      app.push('World Clock', (pg) => {
        const draw = () => {
          pg.innerHTML = '';
          const ul = plain(pg, C.map(([n, tz]) => {
            const d = new Date(new Date().toLocaleString('en-US', { timeZone: tz }));
            const day = d.getHours() >= 6 && d.getHours() < 18;
            return { text: n, sub: 'Worked here', rt: ' ', lead: `<svg viewBox="0 0 52 52">${clockFace(d, 52, day)}</svg>`, tz };
          }));
          ul.classList.add('wc');
          ul.querySelectorAll('li').forEach((li, i) => { li.querySelector('.rt').outerHTML = `<span class="tm">${new Date().toLocaleTimeString('en-US', { timeZone: C[i][1], hour: 'numeric', minute: '2-digit' })}</span>`; });
        };
        draw();
        t = setInterval(draw, 1000);
      });
      app.def.onClose = () => clearInterval(t);
      const tabs = h('div', 'tabs', ['World Clock', 'Alarm', 'Stopwatch', 'Timer'].map((n, i) => `<button type="button" class="${i ? '' : 'on'}"><svg viewBox="0 0 30 26"><circle cx="15" cy="13" r="10"/></svg>${n}</button>`).join(''));
      app.el.appendChild(tabs);
    } },
    calc: { name: 'Calculator', bare: true, bar: 'black', open(app) {
      app.el.style.background = '#111';
      app.el.innerHTML = `<div class="calc" style="top:20px"><div class="disp">0</div><div class="keys">${['C', '±', '÷', '×', '7', '8', '9', '−', '4', '5', '6', '+', '1', '2', '3', '=', '0', '.'].map((k) => `<button type="button" class="${/[÷×−+±C]/.test(k) ? 'op' : ''}${k === '=' ? ' eq' : ''}${k === '0' ? ' zero' : ''}">${k}</button>`).join('')}</div></div>`;
      const disp = app.el.querySelector('.disp');
      let cur = '0', acc = null, op = null, fresh = true;
      const run = (a, b, o) => o === '+' ? a + b : o === '−' ? a - b : o === '×' ? a * b : b === 0 ? NaN : a / b;
      const show = (v) => { const s = String(Math.round(v * 1e8) / 1e8); disp.textContent = s.length > 9 ? Number(v).toExponential(3) : s; if (s === '1337') { window.EGGS.toast('<b>1337</b><span>takes one to know one</span>'); } };
      app.el.querySelector('.keys').addEventListener('click', (ev) => {
        const k = ev.target.closest('button');
        if (!k) return;
        SFX.click();
        const v = k.textContent;
        if (/[0-9]/.test(v)) { cur = fresh ? v : (cur === '0' ? v : cur + v); fresh = false; disp.textContent = cur; }
        else if (v === '.') { if (fresh) { cur = '0.'; fresh = false; } else if (!cur.includes('.')) cur += '.'; disp.textContent = cur; }
        else if (v === 'C') { cur = '0'; acc = null; op = null; fresh = true; disp.textContent = '0'; }
        else if (v === '±') { cur = String(-parseFloat(cur)); disp.textContent = cur; }
        else if (v === '=') { if (op !== null && acc !== null) { const r = run(acc, parseFloat(cur), op); show(r); cur = String(r); acc = null; op = null; fresh = true; } }
        else { if (op !== null && acc !== null && !fresh) { acc = run(acc, parseFloat(cur), op); show(acc); } else acc = parseFloat(cur); op = v; fresh = true; }
      });
    } },
    notes: { name: 'Notes', nb: 'notes', open(app) {
      const N = [
        ['About me', `${P.about[0]}\n\n${P.about[1]}`],
        ['Education', `${P.education.school}\n${P.education.degree}, ${P.education.when}\n\n${P.education.text}`],
        ['Off the clock', `“${P.quote}”`],
        ['To do', 'Graduate (Dec 2026)\nFind a great team\nEmail: ' + P.email]
      ];
      app.push(`Notes (${N.length})`, (pg) => {
        const ul = plain(pg, N.map(([t, b]) => ({ text: t, rt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), go: () => app.push(t, (p) => { p.innerHTML = `<div class="note"><div class="d">${new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>${esc(b).replace(/\n/g, '<br/>')}</div>`; }) })));
        ul.classList.add('note-list');
        pg.style.background = '#fff8b8';
      });
    } },
    settings: { name: 'Settings', open(app) {
      app.push('Settings', (pg) => {
        pg.innerHTML = `<div class="pin"><div class="gp"><div class="row chev" data-k="about"><span class="v">General</span></div></div><div class="gl">Skills</div><div class="gp">${P.skills.map(([gname, list], i) => `<div class="row chev" data-s="${i}"><span class="v">${esc(gname)}</span><span class="rv">${list.length}</span></div>`).join('')}</div></div>`;
        pg.addEventListener('click', (ev) => {
          const r = ev.target.closest('.row');
          if (!r) return;
          SFX.click();
          if (r.dataset.k) app.push('About', (p) => { p.innerHTML = `<div class="pin">${group([['Name', 'Ajay Sommi'], ['Role', esc(P.title)], ['Status', esc(P.citizen)], ['School', 'UF, CS ’26'], ['Version', '1.0 (26A)', 1], ['Capacity', 'one portfolio', 1]])}</div>`; });
          else {
            const [gname, list] = P.skills[+r.dataset.s];
            app.push(gname, (p) => { p.innerHTML = `<div class="pin">${group(list.map((s) => { const at = window.RETRO.usedAt(s); return ['', `${esc(s)}${at.length ? `<br/><span style="font-weight:normal;font-size:13px;color:#385487">${esc(at.join(', '))}</span>` : ''}`]; }))}</div>`; });
          }
        });
      });
    } },
    phone: { name: 'Phone', open(app) {
      const card = (pg) => {
        pg.innerHTML = `<div class="pin"><div style="display:flex;gap:12px;align-items:center;margin:0 12px 14px"><img src="${P.photo}" alt="" style="width:64px;height:64px;border-radius:6px;border:1px solid #888;object-fit:cover"/><div style="font:bold 20px 'Helvetica Neue',Arial">Ajay Sommi<div style="font:14px 'Helvetica Neue',Arial;color:#4c566c">${esc(P.title)}</div></div></div>
          <div class="gp"><div class="row chev" data-u="mailto:${P.email}"><span class="k">email</span><span class="v n">${esc(P.email)}</span></div></div>
          <div class="gp"><div class="row chev" data-u="${P.github}"><span class="k">home page</span><span class="v n">github.com/ajaysommi</span></div><div class="row chev" data-u="${P.linkedin}"><span class="k">work</span><span class="v n">linkedin.com/in/ajay-sommi</span></div></div>
          <div class="gp"><div class="row chev" data-u="${P.resume}"><span class="k">resume</span><span class="v n">Ajay_Sommi_Resume.pdf</span></div></div></div>`;
        pg.addEventListener('click', (ev) => { const r = ev.target.closest('[data-u]'); if (r) { const u = r.dataset.u; if (u.startsWith('mailto')) location.href = u; else ext(u); } });
      };
      const recents = (pg) => plain(pg, [...P.experience].reverse().map((e) => ({ text: e.short, sub: e.role, rt: e.when.split(' to ')[1] || '' })));
      const voicemail = (pg) => plain(pg, P.recs.map(([n, c, q]) => ({ text: n, sub: q, rt: c.split(' ')[0] })));
      const pad = (pg) => {
        pg.innerHTML = `<div style="background:#000;min-height:100%;padding:10px"><div class="pd" style="height:60px;color:#fff;font:36px 'Helvetica Neue',Arial;text-align:center"></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2px">${'123456789*0#'.split('').map((k) => `<button type="button" style="height:62px;border:0;font:bold 30px 'Helvetica Neue',Arial;color:#fff;background:linear-gradient(180deg,#666,#333 50%,#222 51%,#3a3a3a);cursor:pointer">${k}</button>`).join('')}</div></div>`;
        const d = pg.querySelector('.pd');
        pg.addEventListener('click', (ev) => { const b = ev.target.closest('button'); if (b) { SFX.beep(); d.textContent = (d.textContent + b.textContent).slice(-12); } });
      };
      const T = [['Favorites', (pg) => plain(pg, [{ text: 'Ajay Sommi', rt: 'email', go: () => { location.href = 'mailto:' + P.email; } }])], ['Recents', recents], ['Contacts', card], ['Keypad', pad], ['Voicemail', voicemail]];
      app.push('Ajay Sommi', card);
      const tabs = h('div', 'tabs', T.map(([n], i) => `<button type="button" class="${i === 2 ? 'on' : ''}" data-t="${i}"><svg viewBox="0 0 30 26">${['<path d="M15 2l3.8 8 8.6.9-6.4 5.8 1.9 8.5L15 21l-7.9 4.2L9 16.7 2.6 10.9l8.6-.9z"/>', '<circle cx="15" cy="13" r="11"/>', '<circle cx="15" cy="9" r="6"/><path d="M3 26c1-8 6-11 12-11s11 3 12 11z"/>', [0, 1, 2].map((r) => [0, 1, 2].map((c) => `<circle cx="${7 + c * 8}" cy="${5 + r * 8}" r="3"/>`).join('')).join(''), '<circle cx="8" cy="13" r="6"/><circle cx="22" cy="13" r="6"/><rect x="8" y="17" width="14" height="2"/>'][i]}</svg>${n}</button>`).join(''));
      app.el.appendChild(tabs);
      tabs.addEventListener('click', (ev) => {
        const b = ev.target.closest('[data-t]');
        if (!b) return;
        SFX.click();
        tabs.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
        app.vw.innerHTML = '';
        app.stack.length = 0;
        const [n, f] = T[+b.dataset.t];
        app.push(n === 'Contacts' ? 'Ajay Sommi' : n, f);
      });
    } },
    mail: { name: 'Mail', open(app) {
      const M = [
        ['Ajay Sommi', 'Let’s talk', `Hi there,\n\nThanks for stopping by. I’m a software engineer graduating from UF in December 2026, and I’m looking for a team that cares about the people using what it builds.\n\nReply to this and it goes straight to me.\n\nAjay`],
        ['GitHub', 'Your repositories', `SommiScript, GatorGoods, BalanceTree and more are at github.com/ajaysommi.`],
        ['LinkedIn', 'Recommendations', `${P.recs.length} people have written recommendations for Ajay. Read them in Text.`]
      ];
      app.push('Inbox (1)', (pg) => plain(pg, M.map(([f, s, b], i) => ({ text: f, sub: `${s} — ${b.replace(/\n/g, ' ')}`, rt: i ? 'Oct 2026' : hm(now()), go: () => app.push(s, (p) => {
        p.innerHTML = `<div style="border-bottom:1px solid #ccc;padding:8px 10px;font:14px 'Helvetica Neue',Arial;color:#7a7a7a">From: <b style="color:#000">${esc(f)}</b><br/>Subject: <b style="color:#000">${esc(s)}</b></div><div style="padding:12px 12px 30px;font:15px/1.45 'Helvetica Neue',Arial">${esc(b).replace(/\n/g, '<br/>')}</div>`;
      }, { right: ['Reply', () => { location.href = 'mailto:' + P.email + '?subject=' + encodeURIComponent('Re: ' + s); }], blue: true }) }))));
    } },
    safari: { name: 'Safari', bare: true, bar: 'gray', open(app) {
      app.el.innerHTML = `<div class="saf-top"><span>ajaysommi.github.io/${P.resume}</span><a href="${P.resume}" target="_blank" rel="noopener">Open</a></div><iframe class="saf-frame" src="${P.resume}#view=FitH" title="Resume"></iframe><div class="saf-bot"><span>◀</span><span style="opacity:.4">▶</span><span>+</span><span>☰</span><span>⧉</span></div>`;
    } },
    ipod: { name: 'iPod', bare: true, bar: 'black', open(app) {
      const songs = [['Insert Disk', 'insert'], ['Startup Chord', 'chime'], ['56k Handshake', 'modem'], ['Pocket Theme', 'tune']];
      let k = 3;
      app.el.innerHTML = `<div class="np" style="top:20px"><div class="art" style="background-image:url(${P.photo})"><div class="meta"><span>Ajay Sommi</span><b></b><span>Portfolio ’26</span></div></div><div class="ctl"><div class="b"><button type="button" data-a="-1">⏮</button><button type="button" data-a="0">▶</button><button type="button" data-a="1">⏭</button></div><div class="vol"></div></div></div>`;
      const title = app.el.querySelector('.meta b');
      const play = () => { title.textContent = songs[k][0]; SFX[songs[k][1]](); };
      title.textContent = songs[k][0];
      app.el.addEventListener('click', (ev) => { const b = ev.target.closest('[data-a]'); if (!b) return; k = (k + +b.dataset.a + songs.length) % songs.length; play(); });
    } }
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

  const GRID = ['sms', 'cal', 'photos', 'camera', 'projects', 'stocks', 'maps', 'weather', 'clock', 'calc', 'notes', 'settings'];
  const DOCK = ['phone', 'mail', 'safari', 'ipod'];
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
      b.style.left = 1 + c * 79.5 + 'px';
      b.style.top = 10 + r * 88 + 'px';
      /* Before unlocking, each icon waits off toward its nearest edge. */
      b.style.transform = `translate(${(c - 1.5) * 90}px, ${(r - 1.5) * 120}px) scale(.6)`;
      grid.appendChild(b);
    });
    DOCK.forEach((id, i) => {
      const b = iconBtn(id);
      b.style.left = 1 + i * 79.5 + 'px';
      b.style.top = '9px';
      b.style.transform = 'translateY(80px)';
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
  room.querySelector('.ip-home').addEventListener('click', () => {
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
})();
