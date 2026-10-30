/* ==========================================================================
   SOMMIA 3310, one of the phones on the phone picker: a 2000 candybar with
   a green monochrome screen and nothing but keys. The big Navi key does
   whatever the word above it says, C goes back, the rocker scrolls, and
   the number keys bring up the dialler.
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
    /* 16 points clear at the top, 72 at the bottom for the row of
       buttons under the phone (which sits above any browser toolbar). */
    const s = Math.min(1.2, (v.h - 88) / 690, (v.w - 24) / 380);
    scaleBox.style.transform = `scale(${s})`;
    scaleBox.style.marginTop = v.top + 16 + Math.max(0, (v.h - 88 - 690 * s) / 2) + 'px';
  };
  fit();
  addEventListener('retro-fit', fit);
  window.RETRO.zoomPics(lcd);
  room.addEventListener('contextmenu', (e) => e.preventDefault());

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
    ['Games', 'puzzle', () => list('Games', [
      ['Snake II', () => push(snake())],
      ['Text Race', () => push({ type: 'tap', title: 'Text Race', soft: 'Start' })],
      ['Top score', () => push(txt('Top score', `<p class="nk-big">Snake II</p><p>${store.get('nk-snake-hi', 0)} points</p><p class="nk-big">Text Race</p><p>${store.get('nk-tap-hi', 0)} words</p>`))]
    ])],
    ['Extras', 'egg', () => list('Extras', [
      ['More eras', () => push(txt('More eras', '<p>This phone is one of three in this portfolio.</p><p>Open it on a computer and there are four more machines to use.</p>'))],
      ['Composer', () => { SFX.tune(); window.EGGS.find('tune'); push(txt('Composer', '<p>♪ 8e2 8g2 8b2 8g2<br/>8a2 8c3 8b2 8g2<br/>8e2 8d2 8e2</p><p class="nk-dim">Now playing.</p>')); }],
      ['Clock', () => push(clock())],
      ['Fortune', () => push(txt('Fortune', `<p>“${esc(P.quote)}”</p>`))],
      ['Easter eggs', () => push(txt('Eggs', `<p>Found ${window.EGGS.count()} of ${window.EGGS.total}.</p>` + window.EGGS.list.map(([id, n]) => `<p>${window.EGGS.has(id) ? '★ ' + esc(n) : '☆ ???'}</p>`).join('')))]
    ])],
    ['Settings', 'mac', () => list('Settings', [
      [`Key tones: ${store.get('nk-tones', true) ? 'On' : 'Off'}`, () => { store.set('nk-tones', !store.get('nk-tones', true)); refresh(); }],
      ['Switch device', () => exit()],
      ['Phone info', () => push(txt('Info', '<p><b>SOMMIA 3310</b></p><p>Software: v1.0</p><p class="nk-dim">Built in 2026 by Ajay Sommi.</p>'))]
    ])]
  ];

  const role = (e) => txt(e.short, `<p><b>${esc(e.role)}</b></p><p class="nk-dim">${esc(e.org)}<br/>${esc(e.when)}<br/>${esc(e.where)}</p><p>${esc(e.text)}</p>${e.stats.map(([a, b]) => `<p>▸ ${esc(a)}: ${esc(b)}</p>`).join('')}<p class="nk-dim">${e.tags.map(esc).join(', ')}</p>`);
  const photos = (s) => ({ type: 'photo', title: s.name, story: s, i: 0, soft: 'Back' });
  const confirm = (title, body, go) => ({ type: 'text', title, html: `<p class="nk-big">${body}</p>`, soft: 'Open', act: go });
  const clock = () => txt('Clock', `<p class="nk-clock">${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p><p>${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '.')}</p>`);
  const open = (u) => window.open(u, '_blank', 'noopener');

  /* ---------------------------------------------------------------- Snake */

  /* Snake II, as the 3310 had it: the snake runs on a grid of square
     pixels, 2 4 6 8 (or the arrows, or a swipe on the screen) steer it,
     the rocker turns it left or right, each bite makes it longer and a
     little faster, and running into itself ends the game. It goes through
     the edges and comes out the other side. Navi pauses; C leaves. */
  const snake = () => ({ type: 'game', title: 'Snake II', soft: 'Pause' });
  let game = null;
  const startSnake = () => {
    const cv = document.createElement('canvas');
    cv.className = 'nk-game';
    view.appendChild(cv);
    const box = view.getBoundingClientRect(), k = box.width / view.offsetWidth;
    const CW = 22, CH = 12;
    const px = Math.floor(Math.min((view.clientWidth - 8) / CW, (view.clientHeight - 20) / CH));
    cv.width = CW * px; cv.height = CH * px;
    const ctx = cv.getContext('2d');
    const ink = '#1d2a10';
    const g = { s: [[6, 6], [5, 6], [4, 6], [3, 6]], d: [1, 0], q: [], food: null, score: 0, tick: 190, over: false, paused: false, t: 0 };
    const place = () => { let f; do { f = [Math.floor(Math.random() * CW), Math.floor(Math.random() * CH)]; } while (g.s.some(([x, y]) => x === f[0] && y === f[1])); g.food = f; };
    place();
    const draw = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = ink;
      g.s.forEach(([x, y]) => ctx.fillRect(x * px + 1, y * px + 1, px - 1, px - 1));
      const [fx, fy] = g.food;
      ctx.fillRect(fx * px + px / 2 - 1, fy * px + 1, 2, px - 2); ctx.fillRect(fx * px + 1, fy * px + px / 2 - 1, px - 2, 2);
      soft.textContent = g.over ? 'Again' : g.paused ? 'Go on' : 'Pause';
      const hd = view.querySelector('.nk-hd span:last-child');
      if (hd) hd.textContent = g.score;
      if (g.over) {
        ctx.fillStyle = 'rgba(169,194,98,.85)'; ctx.fillRect(px * 3, px * 3, cv.width - px * 6, px * 6);
        ctx.fillStyle = ink; ctx.font = `bold ${px * 1.6}px 'Pixelify Sans', monospace`; ctx.textAlign = 'center';
        ctx.fillText('Game over', cv.width / 2, px * 5.4);
        ctx.font = `${px * 1.3}px 'Pixelify Sans', monospace`; ctx.fillText(`${g.score} · best ${store.get('nk-snake-hi', 0)}`, cv.width / 2, px * 7.4);
      }
    };
    const step = () => {
      if (g.q.length) { const n = g.q.shift(); if (n[0] !== -g.d[0] || n[1] !== -g.d[1]) g.d = n; }
      const [hx, hy] = g.s[0];
      const nx = (hx + g.d[0] + CW) % CW, ny = (hy + g.d[1] + CH) % CH;
      if (g.s.slice(0, -1).some(([x, y]) => x === nx && y === ny)) {
        g.over = true;
        if (g.score > store.get('nk-snake-hi', 0)) store.set('nk-snake-hi', g.score);
        SFX.error && SFX.error();
        if (navigator.vibrate) navigator.vibrate(120);
        draw();
        return;
      }
      g.s.unshift([nx, ny]);
      if (nx === g.food[0] && ny === g.food[1]) { g.score += 7 + Math.floor(g.s.length / 5); g.tick = Math.max(70, g.tick - 6); place(); beep(); }
      else g.s.pop();
      draw();
    };
    const loop = (now) => {
      if (!game || game.g !== g) return;
      if (!g.over && !g.paused && now - g.t >= g.tick) { g.t = now; step(); }
      requestAnimationFrame(loop);
    };
    const turn = (d) => { if (g.over) return; const last = g.q.length ? g.q[g.q.length - 1] : g.d; if ((d[0] !== last[0] || d[1] !== last[1]) && g.q.length < 3) g.q.push(d); };
    /* A swipe across the screen steers too, for a thumb on a touchscreen. */
    let sw = null;
    cv.addEventListener('pointerdown', (e) => { sw = [e.clientX, e.clientY]; });
    cv.addEventListener('pointerup', (e) => {
      if (!sw) return;
      const dx = e.clientX - sw[0], dy = e.clientY - sw[1]; sw = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 14) return;
      turn(Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]);
    });
    game = {
      g,
      dir: (k) => { const D = { 2: [0, -1], 8: [0, 1], 4: [-1, 0], 6: [1, 0] }; if (D[k]) turn(D[k]); },
      rot: (s) => { const last = g.q.length ? g.q[g.q.length - 1] : g.d; turn(s < 0 ? [last[1], -last[0]] : [-last[1], last[0]]); },
      navi: () => { if (g.over) { stopSnake(); view.innerHTML = '<div class="nk-hd"><span>Snake II</span><span>0</span></div>'; startSnake(); return; } g.paused = !g.paused; draw(); },
      stop: () => { game = null; }
    };
    draw();
    requestAnimationFrame(loop);
  };
  const stopSnake = () => { if (game) game.stop(); };

  /* ------------------------------------------------------------ Text Race */

  /* A word comes up, and it has to be keyed in the old way before the bar
     runs out: 2 for A, 2 2 for B, 2 2 2 for C. Wait a moment or press
     another key and the letter sets. C rubs one out; with nothing left to rub
     out, it leaves the game. */
  const LETTERS = { 2: 'abc', 3: 'def', 4: 'ghi', 5: 'jkl', 6: 'mno', 7: 'pqrs', 8: 'tuv', 9: 'wxyz' };
  const WORDS = ['hello', 'call', 'home', 'later', 'phone', 'text', 'meet', 'soon', 'snake', 'menu', 'thanks', 'friend', 'signal', 'battery', 'tomorrow'];
  let tap = null;
  const startTap = () => {
    const box = view.querySelector('.nk-tap');
    const t = { score: 0, word: '', typed: '', cur: null, curK: '', curAt: 0, left: 0, all: 0, on: false, last: 0, raf: 0, over: false };
    const draw = () => {
      const live = t.cur != null ? t.cur : '';
      box.innerHTML = t.on || t.over
        ? `<div class="nk-tap-w">${esc(t.word.toUpperCase())}</div><div class="nk-tap-t">${esc((t.typed + live).toUpperCase())}<i></i></div><div class="nk-tap-b"><i style="width:${Math.max(0, t.left / t.all * 100)}%"></i></div>`
        : '<p>Key in each word on the number keys before time runs out. C deletes, or leaves.</p>';
      const hd = view.querySelector('.nk-hd span:last-child');
      if (hd) hd.textContent = t.score;
      soft.textContent = t.over ? 'Again' : t.on ? 'Skip' : 'Start';
      if (t.over) box.insertAdjacentHTML('beforeend', `<p class="nk-tap-o">Time! ${t.score} words · best ${store.get('nk-tap-hi', 0)}</p>`);
    };
    const next = () => { t.word = WORDS[Math.floor(Math.random() * WORDS.length)]; t.typed = ''; t.cur = null; t.all = Math.max(5000, 16000 - t.score * 700) + t.word.length * 300; t.left = t.all; draw(); };
    const set = () => { if (t.cur != null) { t.typed += t.cur; t.cur = null; } };
    const check = () => { if (t.typed + (t.cur || '') === t.word) { t.score++; set(); beep(); next(); } };
    const frame = (now) => {
      if (!tap || tap.t !== t) return;
      t.raf = requestAnimationFrame(frame);
      if (!t.on) return;
      t.left -= now - t.last; t.last = now;
      if (t.cur != null && now - t.curAt > 1000) { set(); draw(); }
      const b = box.querySelector('.nk-tap-b i');
      if (b) b.style.width = Math.max(0, t.left / t.all * 100) + '%';
      if (t.left <= 0) { t.on = false; t.over = true; if (t.score > store.get('nk-tap-hi', 0)) store.set('nk-tap-hi', t.score); SFX.error && SFX.error(); draw(); }
    };
    tap = {
      t,
      key: (k) => {
        if (!t.on || !LETTERS[k]) return;
        const now = performance.now();
        if (t.curK === k && t.cur != null && now - t.curAt < 1000) { const L = LETTERS[k]; t.cur = L[(L.indexOf(t.cur) + 1) % L.length]; }
        else { set(); t.cur = LETTERS[k][0]; }
        t.curK = k; t.curAt = now;
        draw(); check();
      },
      back: () => { if (!t.on || (t.cur == null && !t.typed)) return false; if (t.cur != null) t.cur = null; else t.typed = t.typed.slice(0, -1); draw(); return true; },
      navi: () => { if (t.on) { next(); return; } t.score = t.over ? 0 : t.score; t.over = false; t.on = true; t.last = performance.now(); next(); }
    };
    draw();
    t.raf = requestAnimationFrame(frame);
  };
  const stopTap = () => { tap = null; };

  /* -------------------------------------------------------------- dialler */

  const dialler = () => ({ type: 'dial', num: '', soft: 'Call' });
  let callT = 0;
  const placeCall = (num) => {
    clearTimeout(callT);
    const end = () => { clearTimeout(callT); stack.splice(1); render(); };
    push({ type: 'text', title: 'Calling', html: `<p class="nk-big">${esc(num)}</p><p>Calling...</p>`, soft: 'End', act: end });
    const mine = stack[stack.length - 1];
    callT = setTimeout(() => {
      if (stack[stack.length - 1] !== mine) return;
      mine.s = { type: 'text', title: 'Call', html: `<p class="nk-big">${esc(num)}</p><p>No answer</p>`, soft: 'OK', act: end };
      render();
    }, 4000);
  };

  /* --------------------------------------------------------------- engine */

  const stack = [];
  let on = false;

  const push = (s) => { stack.push({ s, sel: 0 }); render(); };
  const back = () => {
    const t0 = stack[stack.length - 1];
    if (t0 && t0.s.type === 'dial' && t0.s.num) { t0.s.num = t0.s.num.slice(0, -1); render(); return; }
    if (t0 && t0.s.type === 'tap' && tap && tap.back()) return;
    if (stack.length > 1) { stack.pop(); render(); }
    else if (stack[0].s.type !== 'standby') { stack[0] = { s: STANDBY(), sel: 0 }; render(); }
  };
  const refresh = () => {
    const top = stack[stack.length - 1];
    if (top.s.type === 'list' && top.s.title === 'Settings') top.s = MENU.find((m) => m[0] === 'Settings')[2]();
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
    } else if (s.type === 'dial') {
      html = `<div class="nk-dial">${esc(s.num)}</div>`;
    } else if (s.type === 'tap') {
      html = `<div class="nk-hd"><span>${esc(s.title)}</span><span>0</span></div><div class="nk-tap"></div>`;
    } else if (s.type === 'game') {
      html = `<div class="nk-hd"><span>${esc(s.title)}</span><span>0</span></div>`;
    } else if (s.type === 'photo') {
      const [src, t, d] = s.story.steps[s.i];
      html = `<div class="nk-hd"><span>${esc(s.title)}</span><span>${s.i + 1}/${s.story.steps.length}</span></div><div class="nk-txt"><img data-src="${src}" alt="" /><p><b>${esc(t)}</b> ${esc(d)}</p></div>`;
    }
    stopSnake();
    stopTap();
    view.innerHTML = html;
    soft.textContent = s.soft || '';
    if (s.type === 'game') startSnake();
    if (s.type === 'tap') startTap();
    view.querySelectorAll('img[data-src]').forEach((im) => dither(im.dataset.src, 180).then((u) => { im.src = u; }));
  };

  const textScroll = (d) => {
    const t = view.querySelector('.nk-txt');
    if (t) t.scrollTop += d * 42;
  };

  const move = (d) => {
    const top = stack[stack.length - 1];
    const s = top.s;
    if (s.type === 'game') { if (game) game.rot(d); return; }
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
    if (s.type === 'game') { if (game) game.navi(); return; }
    if (s.type === 'tap') { if (tap) tap.navi(); return; }
    if (s.type === 'dial') { if (s.num) placeCall(s.num); return; }
    if (s.act) { s.act(); return; }
    back();
  };

  const digit = (k) => {
    const top = stack[stack.length - 1];
    if (top.s.type === 'game') { if (game) game.dir(k); return; }
    if (top.s.type === 'tap') { if (tap) tap.key(k); return; }
    if (top.s.type === 'dial') { if (top.s.num.length < 18) { top.s.num += k; render(); } return; }
    const d = dialler();
    d.num = k;
    push(d);
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
    const inGame = stack.length && stack[stack.length - 1].s.type === 'game';
    const map = inGame ? { ArrowUp: () => digit('2'), ArrowDown: () => digit('8'), ArrowLeft: () => digit('4'), ArrowRight: () => digit('6'), Enter: navi, ' ': navi, Backspace: back, Escape: back }
      : { ArrowUp: () => move(-1), ArrowDown: () => move(1), Enter: navi, Backspace: back, Escape: back };
    if (map[e.key]) { e.preventDefault(); press(map[e.key])(); }
    else if (/^[0-9*#]$/.test(e.key)) press(() => digit(e.key))();
  });

  /* ---------------------------------------------------------------- boot */

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  (async () => {
    await room.landed;
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
