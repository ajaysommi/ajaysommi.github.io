/* ==========================================================================
   SOMMIA 3310, one of the phones on the phone picker: a 2000 candybar with
   a green monochrome screen and nothing but keys. The big Navi key does
   whatever the word above it says, C goes back, the rocker scrolls, and
   the number keys jump straight to a menu item.
   ========================================================================== */
window.NOKIA = { start(room, exit) {
  const P = window.PORTFOLIO;
  const { esc, dither, store, usedAt } = window.RETRO;
  const I = window.ICONS;
  const SFX = window.SFX;

  /* The handset is a photograph of the real one, rebadged; the screen and
     every key sit over their places in it. Positions are in the photo's
     own points (it is drawn at 369.6 by 680.8). */
  const BODY = 'assets/images/sommia-3310.webp';
  const AT = { 1: [76.8, 430, 50.4, 31.2], 2: [157.2, 443.2, 55.2, 26.4], 3: [241.2, 430, 51.6, 31.2], 4: [80.4, 476.8, 50.4, 31.2], 5: [157.2, 488.8, 55.2, 27.6], 6: [238.8, 476.8, 50.4, 31.2], 7: [82.8, 523.6, 50.4, 31.2], 8: [157.2, 536.8, 55.2, 27.6], 9: [236.4, 523.6, 50.4, 32.4], '*': [86.4, 571.6, 50.4, 30], 0: [158.4, 583.6, 52.8, 27.6], '#': [232.8, 571.6, 50.4, 30] };
  const KEYS = [['1', ''], ['2', 'abc'], ['3', 'def'], ['4', 'ghi'], ['5', 'jkl'], ['6', 'mno'], ['7', 'pqrs'], ['8', 'tuv'], ['9', 'wxyz'], ['*', '+'], ['0', '␣'], ['#', '⇧']];

  room.innerHTML = `
    <div class="nk-scale"><div class="nk is-photo" style="background-image:url(${BODY})">
      <button class="nk-power" type="button" aria-label="Power"></button>
      <div class="nk-ear" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
      <div class="nk-brand" aria-hidden="true">SOMMIA</div>
      <div class="nk-bezel"><div class="nk-lcd" role="application" aria-label="Phone screen" aria-live="polite"><div class="nk-view"></div><div class="nk-soft"></div></div></div>
      <div class="nk-cluster">
        <button class="nk-c" type="button" aria-label="C, back">C</button>
        <button class="nk-navi" type="button" aria-label="Navi key"></button>
        <div class="nk-rock"><button class="up" type="button" aria-label="Up">▲</button><button class="dn" type="button" aria-label="Down">▼</button></div>
      </div>
      <div class="nk-pad">${KEYS.map(([n, l]) => `<button type="button" data-k="${n}" aria-label="${n}" style="left:${AT[n][0]}px;top:${AT[n][1]}px;width:${AT[n][2]}px;height:${AT[n][3]}px"><b>${n}</b><span>${l}</span></button>`).join('')}</div>
      <div class="nk-mic" aria-hidden="true"></div>
    </div></div>`;

  const scaleBox = room.querySelector('.nk-scale');
  const dev = room.querySelector('.nk');
  const lcd = room.querySelector('.nk-lcd');
  const view = room.querySelector('.nk-view');
  const soft = room.querySelector('.nk-soft');

  /* Fits the room the browser really leaves, under the buttons on top. */
  const fit = () => {
    const v = window.RETRO.viewport();
    /* 56 points clear for the buttons on top, 26 at the bottom so a
       browser's toolbar never touches the phone. */
    const s = Math.min(1.2, (v.h - 82) / 690, (v.w - 24) / 380);
    scaleBox.style.transform = `scale(${s})`;
    scaleBox.style.marginTop = v.top + 56 + Math.max(0, (v.h - 82 - 690 * s) / 2) + 'px';
  };
  fit();
  addEventListener('retro-fit', fit);

  /* ------------------------------------------------------------- feedback */

  const beep = () => { if (store.get('nk-tones', true)) SFX.key(); if (navigator.vibrate) navigator.vibrate(6); };
  let litT = 0;
  const light = () => {
    dev.classList.add('is-lit');
    clearTimeout(litT);
    litT = setTimeout(() => dev.classList.remove('is-lit'), 12000);
  };

  /* -------------------------------------------------------------- screens */

  const ex = P.experience, pr = P.projects;
  const txt = (title, html) => ({ type: 'text', title, html, soft: 'Back' });
  const list = (title, items) => ({ type: 'list', title, items, soft: 'Select' });

  const MENU = [
    ['Messages', 'mail', () => list('Inbox', P.recs.map(([n, c, q]) => [n, () => push(txt(n.split(' ')[0], `<p class="nk-from">From: ${esc(n)}<br/>${esc(c)}</p><p>${esc(q)}</p>`))]))],
    ['Contacts', 'person', () => list('Ajay Sommi', [
      ['E-mail', () => push(confirm('E-mail', esc(P.email), () => { location.href = 'mailto:' + P.email; }))],
      ['GitHub', () => push(confirm('GitHub', 'github.com/<br/>ajaysommi', () => open(P.github)))],
      ['LinkedIn', () => push(confirm('LinkedIn', 'linkedin.com/in/<br/>ajay-sommi', () => open(P.linkedin)))],
      ['Resume', () => push(confirm('Resume', 'Open the<br/>resume PDF?', () => open(P.resume)))]
    ])],
    ['Profile', 'note', () => txt('Profile', `<p><b>Ajay Sommi</b><br/>${esc(P.title)}<br/>${esc(P.citizen)}</p><img data-src="${P.photo}" alt="" /><p>${esc(P.about[0])}</p><p>${esc(P.about[1])}</p>`)],
    ['Experience', 'doc', () => list('Experience', ex.map((e) => [`${e.year} ${e.short}`, () => push(role(e))]))],
    ['Projects', 'app', () => list('Projects', pr.map((p) => [p.name, () => push({ ...txt(p.name, `<p><b>${esc(p.full)}</b></p><p class="nk-dim">${esc(p.kind)} · ${esc(p.stack)}</p><p>${esc(p.text)}</p>${p.url ? '<p class="nk-dim">Navi: open on GitHub</p>' : '<p class="nk-dim">Source is private.</p>'}`), soft: p.url ? 'Open' : 'Back', act: p.url ? () => open(p.url) : null })]))],
    ['Off the Clock', 'wrench', () => list('Off the Clock', P.offclock.map((s) => [s.name, () => push(photos(s))]))],
    ['Skills', 'chip', () => list('Skills', P.skills.map(([g, l]) => [g, () => push(list(g.split(' ')[0], l.map((sk) => [sk, () => { const at = usedAt(sk); push(txt(sk, `<p><b>${esc(sk)}</b></p><p>${at.length ? 'Used at:<br/>' + at.map(esc).join('<br/>') : 'Coursework and side projects.'}</p>`)); }])))]))],
    ['Education', 'cap', () => { const e = P.education; return txt('Education', `<p><b>${esc(e.school)}</b></p><p>${esc(e.degree)}<br/>${esc(e.when)}</p><p>${esc(e.text)}</p>`); }],
    ['Extras', 'puzzle', () => list('Extras', [
      ['Composer', () => { SFX.tune(); window.EGGS.find('tune'); push(txt('Composer', '<p>♪ 8e2 8g2 8b2 8g2<br/>8a2 8c3 8b2 8g2<br/>8e2 8d2 8e2</p><p class="nk-dim">Now playing.</p>')); }],
      ['Clock', () => push(clock())],
      ['Fortune', () => push(txt('Fortune', `<p>“${esc(P.quote)}”</p>`))],
      ['Easter eggs', () => push(txt('Eggs', `<p>Found ${window.EGGS.count()} of ${window.EGGS.total}.</p>` + window.EGGS.list.map(([id, n]) => `<p>${window.EGGS.has(id) ? '★ ' + esc(n) : '☆ ???'}</p>`).join('')))]
    ])],
    ['Settings', 'mac', () => list('Settings', [
      [`Key tones: ${store.get('nk-tones', true) ? 'On' : 'Off'}`, () => { store.set('nk-tones', !store.get('nk-tones', true)); refresh(); }],
      ['Switch phone', () => exit()],
      ['Phone info', () => push(txt('Info', '<p><b>SOMMIA 3310</b></p><p>Software: v1.0<br/>Battery: 3 bars,<br/>forever.</p><p class="nk-dim">Built in 2026 by Ajay Sommi.</p>'))]
    ])]
  ];

  const role = (e) => txt(e.short, `<p><b>${esc(e.role)}</b></p><p class="nk-dim">${esc(e.org)}<br/>${esc(e.when)}<br/>${esc(e.where)}</p><p>${esc(e.text)}</p>${e.stats.map(([a, b]) => `<p>▸ ${esc(a)}: ${esc(b)}</p>`).join('')}<p class="nk-dim">${e.tags.map(esc).join(', ')}</p>`);
  const photos = (s) => ({ type: 'photo', title: s.name, story: s, i: 0, soft: 'Back' });
  const confirm = (title, body, go) => ({ type: 'text', title, html: `<p class="nk-big">${body}</p>`, soft: 'Open', act: go });
  const clock = () => txt('Clock', `<p class="nk-clock">${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p><p>${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '.')}</p>`);
  const open = (u) => window.open(u, '_blank', 'noopener');

  /* --------------------------------------------------------------- engine */

  const stack = [];
  let on = false;

  const push = (s) => { stack.push({ s, sel: 0 }); render(); };
  const back = () => {
    if (stack.length > 1) { stack.pop(); render(); }
    else if (stack[0].s.type !== 'standby') { stack[0] = { s: STANDBY(), sel: 0 }; render(); }
  };
  const refresh = () => {
    const top = stack[stack.length - 1];
    if (top.s.type === 'list' && top.s.title === 'Settings') top.s = MENU[9][2]();
    render();
  };

  const STANDBY = () => ({ type: 'standby', soft: 'Menu' });
  const MENUS = () => ({ type: 'menu', soft: 'Select' });

  const bars = (n, side) => `<div class="nk-bars ${side}">${[5, 4, 3, 2, 1].map((k) => `<i class="${k <= n ? 'on' : ''}" style="width:${3 + k * 1.6}px"></i>`).join('')}<span>${side === 'l' ? 'Y' : '▮'}</span></div>`;

  const scrollbar = (i, n) => `<div class="nk-sb"><i style="top:${n > 1 ? (i / (n - 1)) * 100 : 0}%"></i></div>`;

  const render = () => {
    const top = stack[stack.length - 1];
    const s = top.s;
    view.className = 'nk-view t-' + s.type;
    let html = '';
    if (s.type === 'standby') {
      html = `${bars(4, 'l')}${bars(3, 'r')}<div class="nk-op">SOMMIA</div><div class="nk-time">${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>`;
    } else if (s.type === 'menu') {
      const [name, ico] = MENU[top.sel];
      html = `<div class="nk-hd"><span>${esc(name)}</span><span>${top.sel + 1}</span></div><div class="nk-ico">${I.svg(ico, 48)}</div>${scrollbar(top.sel, MENU.length)}`;
    } else if (s.type === 'list') {
      const per = 4;
      const first = Math.max(0, Math.min(top.sel - 1, s.items.length - per));
      html = `<div class="nk-hd"><span>${esc(s.title)}</span><span>${top.sel + 1}</span></div><ul class="nk-list">${s.items.slice(first, first + per).map(([t], k) => `<li class="${first + k === top.sel ? 'on' : ''}">${esc(t)}</li>`).join('')}</ul>${scrollbar(top.sel, s.items.length)}`;
    } else if (s.type === 'text') {
      html = `<div class="nk-hd"><span>${esc(s.title)}</span></div><div class="nk-txt">${s.html}</div>`;
    } else if (s.type === 'photo') {
      const [src, t, d] = s.story.steps[s.i];
      html = `<div class="nk-hd"><span>${esc(s.title)}</span><span>${s.i + 1}/${s.story.steps.length}</span></div><div class="nk-txt"><img data-src="${src}" alt="" /><p><b>${esc(t)}</b> ${esc(d)}</p></div>`;
    }
    view.innerHTML = html;
    soft.textContent = s.soft || '';
    view.querySelectorAll('img[data-src]').forEach((im) => dither(im.dataset.src, 180).then((u) => { im.src = u; }));
  };

  const textScroll = (d) => {
    const t = view.querySelector('.nk-txt');
    if (t) t.scrollTop += d * 42;
  };

  const move = (d) => {
    const top = stack[stack.length - 1];
    const s = top.s;
    if (s.type === 'menu') { top.sel = (top.sel + d + MENU.length) % MENU.length; render(); }
    else if (s.type === 'list') { top.sel = (top.sel + d + s.items.length) % s.items.length; render(); }
    else if (s.type === 'text') textScroll(d);
    else if (s.type === 'photo') {
      const t = view.querySelector('.nk-txt');
      const atEnd = t && (d > 0 ? t.scrollTop + t.clientHeight >= t.scrollHeight - 2 : t.scrollTop <= 0);
      if (atEnd) { s.i = (s.i + d + s.story.steps.length) % s.story.steps.length; render(); } else textScroll(d);
    }
  };

  const navi = () => {
    const top = stack[stack.length - 1];
    const s = top.s;
    if (s.type === 'standby') { stack.push({ s: MENUS(), sel: 0 }); render(); return; }
    if (s.type === 'menu') { push(MENU[top.sel][2]()); return; }
    if (s.type === 'list') { s.items[top.sel][1](); return; }
    if (s.act) { s.act(); return; }
    back();
  };

  const digit = (k) => {
    const top = stack[stack.length - 1];
    const n = k === '0' ? 10 : +k;
    if (!n) return;
    if (top.s.type === 'standby') { stack.push({ s: MENUS(), sel: Math.min(n, MENU.length) - 1 }); render(); return; }
    if (top.s.type === 'menu' && n <= MENU.length) { top.sel = n - 1; render(); navi(); return; }
    if (top.s.type === 'list' && n <= top.s.items.length) { top.sel = n - 1; render(); }
  };

  /* ---------------------------------------------------------------- keys */

  const press = (fn) => () => { if (!on) return; beep(); light(); fn(); };
  room.querySelector('.nk-navi').addEventListener('click', press(navi));
  room.querySelector('.nk-c').addEventListener('click', press(back));
  room.querySelector('.nk-rock .up').addEventListener('click', press(() => move(-1)));
  room.querySelector('.nk-rock .dn').addEventListener('click', press(() => move(1)));
  room.querySelector('.nk-pad').addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (b) press(() => digit(b.dataset.k))(); });
  room.querySelector('.nk-power').addEventListener('click', () => { if (on) { beep(); exit(); } });
  document.addEventListener('keydown', (e) => {
    if (!on || !room.isConnected || room.offsetParent === null) return;
    const map = { ArrowUp: () => move(-1), ArrowDown: () => move(1), Enter: navi, Backspace: back, Escape: back };
    if (map[e.key]) { e.preventDefault(); press(map[e.key])(); }
    else if (/^[0-9]$/.test(e.key)) press(() => digit(e.key))();
  });

  /* ---------------------------------------------------------------- boot */

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  (async () => {
    await wait(250);
    light();
    view.className = 'nk-view t-boot';
    view.innerHTML = `<div class="nk-boot">${I.pxmark(56, true)}<div>SOMMIA</div></div>`;
    SFX.tune();
    await wait(1700);
    on = true;
    stack.push({ s: STANDBY(), sel: 0 });
    render();
    setInterval(() => { const t = stack[stack.length - 1]; if (t && t.s.type === 'standby') render(); }, 20000);
  })();
} };
