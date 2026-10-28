/* ==========================================================================
   The pocket device, one of the phones on the phone picker: a handheld
   with a monochrome screen and a touch wheel. It powers on when chosen.
   Turn the wheel to move through a menu, press the middle to choose, the
   top of the ring goes back; the screen itself can be tapped and swiped
   too. Nothing here needs a keyboard.
   ========================================================================== */
window.POCKET = { start(room, exit) {

  const P = window.PORTFOLIO;
  const { esc, dither, store } = window.RETRO;
  const I = window.ICONS;

  const FACES = [['snow', 'Snow'], ['graphite', 'Graphite'], ['ocean', 'Ocean'], ['tangerine', 'Tangerine'], ['grape', 'Grape']];

  room.innerHTML = `
    <div class="pk-scale"><div class="pk is-off" data-face="${store.get('face', 'snow')}">
      <button class="pk-hold" type="button" aria-label="Hold switch" aria-pressed="false"><span>HOLD</span></button>
      <div class="pk-brand">${I.mark(14, true)} Sommi Pocket</div>
      <div class="pk-lcd-frame"><div class="pk-lcd" role="application" aria-label="Pocket screen">
        <div class="lcd-bar"><button class="lcd-back" type="button" aria-label="Back" hidden>\u2039</button><span class="lk" aria-hidden="true"></span><span class="t">Sommi</span><span class="bat" aria-hidden="true"><i></i></span></div>
        <div class="lcd-view"></div>
        <div class="lcd-banner" role="status"></div>
      </div></div>
      <div class="pk-wheel-wrap"><div class="pk-wheel" aria-label="Click wheel">
        <span class="lb t">MENU</span>
        <span class="lb l"><svg viewBox="0 0 20 14"><path d="M10 7 20 0v14zM0 7l10-7v14z"/></svg></span>
        <span class="lb r"><svg viewBox="0 0 20 14"><path d="M10 7 0 0v14zM20 7 10 0v14z"/></svg></span>
        <span class="lb b"><svg viewBox="0 0 20 14"><path d="M0 0l9 7-9 7zM12 0h3v14h-3zM17 0h3v14h-3z"/></svg></span>
        <button class="zone t" type="button" aria-label="Menu, go back"></button>
        <button class="zone l" type="button" aria-label="Previous"></button>
        <button class="zone r" type="button" aria-label="Next"></button>
        <button class="zone b" type="button" aria-label="Play"></button>
        <button class="pk-hub" type="button" aria-label="Select"></button>
        <i class="dot"></i>
      </div></div>
      <span class="pk-slot" aria-hidden="true"></span>
    </div></div>`;

  const dev = room.querySelector('.pk');
  const scaleBox = room.querySelector('.pk-scale');

  /* A fixed shape, an iPod's proportions, scaled to the room the browser
     really leaves under the buttons on top. */
  const fit = () => {
    const v = window.RETRO.viewport();
    const s = Math.min(1.35, (v.h - 60) / 545, (v.w - 24) / 335);
    scaleBox.style.transform = `scale(${s})`;
    scaleBox.style.marginTop = v.top + 46 + Math.max(0, (v.h - 60 - 545 * s) / 2) + 'px';
  };
  fit();
  addEventListener('resize', fit);
  if (window.visualViewport) visualViewport.addEventListener('resize', fit);
  const lcd = room.querySelector('.pk-lcd');
  const view = room.querySelector('.lcd-view');
  const title = room.querySelector('.lcd-bar .t');
  const lock = room.querySelector('.lcd-bar .lk');
  const backBtn = room.querySelector('.lcd-back');
  const banner = room.querySelector('.lcd-banner');
  const wheel = room.querySelector('.pk-wheel');
  const hub = room.querySelector('.pk-hub');
  const hold = room.querySelector('.pk-hold');

  let on = false, held = false;
  const stack = [];
  let pane = null;

  /* ------------------------------------------------------------- feedback */

  const iosTick = () => {
    const label = document.createElement('label');
    label.style.display = 'none';
    const sw = document.createElement('input');
    sw.type = 'checkbox';
    sw.setAttribute('switch', '');
    label.appendChild(sw);
    document.body.appendChild(label);
    label.click();
    label.remove();
  };
  const buzz = (strong) => {
    if (store.get('clicker', true)) window.SFX.detent();
    if (navigator.vibrate) navigator.vibrate(strong ? 12 : 4);
  };
  const tap = () => { buzz(true); try { iosTick(); } catch (e) {} };

  let litT = 0;
  const wake = () => {
    lcd.classList.add('is-lit');
    clearTimeout(litT);
    if (store.get('backlight', 'auto') === 'auto') litT = setTimeout(() => lcd.classList.remove('is-lit'), 9000);
  };

  let banT = 0;
  const say = (t) => {
    banner.textContent = t;
    banner.classList.add('is-on');
    clearTimeout(banT);
    banT = setTimeout(() => banner.classList.remove('is-on'), 2200);
  };
  document.addEventListener('egg', () => say(`★ Egg found! ${window.EGGS.count()} of ${window.EGGS.total}`));

  /* ------------------------------------------------------------- screens */

  const li = (label, right = '›', ico) => ({ label, right, ico });

  const ditherIn = (root) => {
    root.querySelectorAll('img[data-src]').forEach((im) => {
      const w = Math.round(Math.min(view.clientWidth, 360) * (+im.dataset.k || 1));
      dither(im.dataset.src, w).then((u) => { im.src = u; });
    });
  };

  const textScreen = (t, html) => ({ type: 'text', title: t, html });

  const SCREENS = {
    main: () => ({
      type: 'menu', title: 'Sommi',
      items: [
        [li('About Me'), () => open('about')],
        [li('Experience'), () => open('work')],
        [li('Projects'), () => open('projects')],
        [li('Off the Clock'), () => open('garage')],
        [li('Skills'), () => open('skills')],
        [li('Education'), () => open('school')],
        [li('Guestbook'), () => open('recs')],
        [li('Contact'), () => open('contact')],
        [li('Resume', '↗'), () => window.open(P.resume, '_blank', 'noopener')],
        [li('Extras'), () => open('extras')],
        [li('Settings'), () => open('settings')],
        [li('Switch phone', '\u21c4'), () => exit()]
      ]
    }),
    about: () => textScreen('About', `<img data-src="${P.photo}" alt="Ajay Sommi outdoors in front of green hills" /><h2>Ajay Sommi</h2><div class="m">Software Engineer · ${esc(P.citizen)}</div><p>${esc(P.about[0])}</p><p>${esc(P.about[1])}</p><div class="hint">turn the wheel to scroll · MENU goes back</div>`),
    work: () => ({ type: 'menu', title: 'Experience', items: P.experience.map((e, i) => [li(`${e.year}  ${e.short}`), () => open('role', i)]) }),
    role: (i) => {
      const e = P.experience[i];
      return {
        type: 'text', title: e.short, nav: ['role', i, P.experience.length],
        html: `<h2>${esc(e.role)}</h2><div class="m">${esc(e.org)}<br/>${esc(e.when)} · ${esc(e.where)}</div><p>${esc(e.text)}</p>
          ${e.stats.map(([a, b]) => `<div class="stat"><b>${esc(a)}</b>${esc(b)}</div>`).join('')}
          <div class="tags">${e.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
          ${e.photos.length ? `<div class="strip">${e.photos.map((p) => `<img data-src="${p}" data-k=".4" alt="" />`).join('')}</div>` : ''}
          <div class="hint">◀◀ ▶▶ for the previous or next role</div>`
      };
    },
    projects: () => ({ type: 'menu', title: 'Projects', items: P.projects.map((p, i) => [li(p.name), () => open('project', i)]) }),
    project: (i) => {
      const p = P.projects[i];
      return { type: 'text', title: p.name, nav: ['project', i, P.projects.length], html: `<h2>${esc(p.full)}</h2><div class="m">${esc(p.kind)} · ${esc(p.stack)}</div><p>${esc(p.text)}</p>${p.url ? `<a href="${p.url}" target="_blank" rel="noopener noreferrer">Open on GitHub ↗</a>` : '<div class="m">Source is private for now.</div>'}` };
    },
    garage: () => ({ type: 'menu', title: 'Off the Clock', items: P.offclock.map((s, i) => [li(s.name), () => open('story', i)]) }),
    story: (i, k = 0) => ({ type: 'story', title: P.offclock[i].name, story: i, slide: k }),
    skills: () => ({ type: 'menu', title: 'Skills', items: P.skills.map(([g, list], i) => [li(g, String(list.length)), () => open('skillset', i)]) }),
    skillset: (i) => {
      const [g, list] = P.skills[i];
      return { type: 'menu', title: g, items: list.map((s) => [li(s, ''), () => { const at = window.RETRO.usedAt(s); say(at.length ? `${s}: ${at.join(', ')}` : `${s}: coursework & projects`); }]) };
    },
    school: () => {
      const e = P.education;
      return textScreen('Education', `<img data-src="${e.logo}" data-k=".45" alt="University of Florida" style="width:45%;border:0" /><h2>${esc(e.school)}</h2><div class="m">${esc(e.degree)}<br/>${esc(e.college)} · ${esc(e.when)}</div><p>${esc(e.text)}</p><div class="tags">${e.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>`);
    },
    recs: () => ({ type: 'menu', title: 'Guestbook', items: P.recs.map(([n, c], i) => [li(n, ''), () => open('rec', i)]) }),
    rec: (i) => { const [n, c, q] = P.recs[i]; return { type: 'text', title: 'Guestbook', nav: ['rec', i, P.recs.length], html: `<p class="q">“${esc(q)}”</p><h3>${esc(n)}</h3><div class="m">${esc(c)}</div>` }; },
    contact: () => ({
      type: 'menu', title: 'Contact',
      items: [
        [li('Email', '↗'), () => { location.href = 'mailto:' + P.email; }],
        [li('Copy email', ''), async () => { try { await navigator.clipboard.writeText(P.email); say('Copied ' + P.email); } catch (e) { say(P.email); } }],
        [li('GitHub', '↗'), () => window.open(P.github, '_blank', 'noopener')],
        [li('LinkedIn', '↗'), () => window.open(P.linkedin, '_blank', 'noopener')],
        [li('Resume', '↗'), () => window.open(P.resume, '_blank', 'noopener')],
        [li('A note'), () => open('note')]
      ]
    }),
    note: () => textScreen('Contact', `<img data-src="${P.kidPhoto}" alt="Ajay as a kid in 2006, at a computer" /><h2>20+ years of experience.</h2><p>Let’s not be strangers.</p><a href="mailto:${P.email}">${esc(P.email)}</a>`),
    extras: () => ({
      type: 'menu', title: 'Extras',
      items: [
        [li('Fortune', ''), () => open('fortune')],
        [li('Flashlight', ''), () => { lcd.classList.toggle('is-flash'); window.EGGS.find('light'); }],
        [li('Play a tune', '♪'), () => { window.SFX.tune(); window.EGGS.find('tune'); }],
        [li('Easter eggs', `${window.EGGS.count()}/${window.EGGS.total}`), () => open('eggs')],
        [li('Desktop version'), () => open('desk')]
      ]
    }),
    fortune: () => {
      const F = [P.quote, 'It works on my machine. This is that machine.', 'Have you tried turning it off and on again?', 'The best error message is the one that never shows up.', 'A 2007 Civic and 200,000 miles: the fix is usually in a tutorial somewhere.'];
      return textScreen('Fortune', `<p class="q" style="font-size:18px;margin-top:20px">“${esc(F[Math.floor(Math.random() * F.length)])}”</p><div class="hint">MENU, then Fortune again for another</div>`);
    },
    eggs: () => textScreen('Easter eggs', window.EGGS.list.map(([id, n, d]) => window.EGGS.has(id) ? `<p>★ <b>${esc(n)}</b><br/><span class="m">${esc(d)}</span></p>` : '<p class="m">☆ ??? still hidden</p>').join('') + '<div class="hint">some only live on the desktop version</div>'),
    desk: () => textScreen('Desktop version', '<h2>There are whole computers.</h2><p>On a laptop or desktop, this portfolio boots a full operating system from the era you pick: a 1983 terminal, a 1991 desktop, the 1998 web or a 2009 desktop.</p><p>Open this page on a computer to try it.</p><p class="m">Or <a href="classic.html">see the classic site</a>.</p>'),
    settings: () => ({
      type: 'menu', title: 'Settings',
      items: [
        [li('Faceplate', (FACES.find((f) => f[0] === dev.dataset.face) || FACES[0])[1]), () => {
          const k = FACES.findIndex((f) => f[0] === dev.dataset.face);
          const n = FACES[(k + 1) % FACES.length];
          dev.dataset.face = n[0]; store.set('face', n[0]);
          window.EGGS.find('faceplate');
          refresh();
        }],
        [li('Clicker', store.get('clicker', true) ? 'On' : 'Off'), () => { store.set('clicker', !store.get('clicker', true)); refresh(); }],
        [li('Sound', window.SFX.muted ? 'Off' : 'On'), () => { window.SFX.toggle(); refresh(); }],
        [li('Backlight', store.get('backlight', 'auto') === 'auto' ? 'Auto' : 'Always'), () => { store.set('backlight', store.get('backlight', 'auto') === 'auto' ? 'always' : 'auto'); wake(); refresh(); }],
        [li('About'), () => open('aboutdev')],
        [li('Switch phone', '\u21c4'), () => exit()]
      ]
    }),
    aboutdev: () => textScreen('About', `<h2>Sommi Pocket</h2><div class="m">Model AJ-26 · firmware 1.0</div><p>Capacity: one portfolio.<br/>Battery: 80%, forever.</p><p>Built in 2026 by Ajay Sommi.</p><div class="hint">try the HOLD switch on top</div>`)
  };

  /* ------------------------------------------------------------- render */

  const render = (dir) => {
    const top = stack[stack.length - 1];
    const s = top.screen;
    title.textContent = s.title;
    const p = document.createElement('div');
    p.className = 'lcd-pane' + (dir ? (dir > 0 ? ' in-r' : ' in-l') : '');
    if (s.type === 'menu') {
      p.innerHTML = `<ul class="lcd-list" role="listbox" aria-label="${esc(s.title)}">${s.items.map(([it], i) => `<li role="option" data-i="${i}" class="${i === top.sel ? 'is-sel' : ''}" aria-selected="${i === top.sel}"><span class="l">${esc(it.label)}</span><span class="r">${esc(it.right)}</span></li>`).join('')}</ul>`;
    } else if (s.type === 'text') {
      p.innerHTML = `<div class="lcd-text">${s.html}</div>`;
    } else if (s.type === 'story') {
      const st = P.offclock[s.story];
      const [src, t, d] = st.steps[top.slide || 0];
      title.textContent = `${st.name} ${(top.slide || 0) + 1}/${st.steps.length}`;
      p.innerHTML = `<div class="lcd-story"><div class="ph"><img data-src="${src}" alt="${esc(t)}" /></div><div class="cp"><b>${esc(t)}</b> ${esc(d)}</div></div>`;
      p.style.overflow = 'hidden';
      if (top.color) { const im = p.querySelector('img'); im.removeAttribute('data-src'); im.src = src; im.classList.add('is-color'); }
    }
    view.innerHTML = '';
    view.appendChild(p);
    pane = p;
    backBtn.hidden = stack.length <= 1;
    ditherIn(p);
    if (s.type === 'menu') scrollSel();
    if (top.scroll) p.scrollTop = top.scroll;
  };

  const refresh = () => {
    const top = stack[stack.length - 1];
    const fresh = SCREENS[top.key](...top.args);
    top.screen = fresh;
    render(0);
  };

  const open = (key, ...args) => {
    const cur = stack[stack.length - 1];
    if (cur && pane) cur.scroll = pane.scrollTop;
    stack.push({ key, args, screen: SCREENS[key](...args), sel: 0, slide: args[1] || 0 });
    render(1);
  };
  const back = () => {
    if (stack.length <= 1) { say('This is the main menu'); return; }
    stack.pop();
    const top = stack[stack.length - 1];
    top.screen = SCREENS[top.key](...top.args);
    render(-1);
  };

  const scrollSel = () => {
    const el = pane && pane.querySelector('li.is-sel');
    if (!el) return;
    const r = el.offsetTop, h = el.offsetHeight;
    if (r < pane.scrollTop) pane.scrollTop = r;
    else if (r + h > pane.scrollTop + pane.clientHeight) pane.scrollTop = r + h - pane.clientHeight;
  };

  const move = (d) => {
    const top = stack[stack.length - 1];
    const s = top.screen;
    if (s.type === 'menu') {
      const n = Math.max(0, Math.min(s.items.length - 1, top.sel + d));
      if (n === top.sel) return;
      top.sel = n;
      pane.querySelectorAll('li').forEach((l, i) => { l.classList.toggle('is-sel', i === n); l.setAttribute('aria-selected', i === n); });
      scrollSel();
      buzz();
    } else if (s.type === 'text') {
      pane.scrollTop += d * 34;
      buzz();
    } else if (s.type === 'story') {
      step(d);
    }
  };

  const step = (d) => {
    const top = stack[stack.length - 1];
    const s = top.screen;
    if (s.type === 'story') {
      const n = P.offclock[s.story].steps.length;
      const k = (top.slide || 0) + d;
      if (k < 0 || k >= n) { say(k < 0 ? 'First photo' : 'Last photo'); return; }
      top.slide = k;
      render(d);
      buzz(true);
      return;
    }
    if (s.nav) {
      const [key, i, n] = s.nav;
      const j = i + d;
      if (j < 0 || j >= n) { say(j < 0 ? 'This is the first one' : 'This is the last one'); return; }
      stack.pop();
      stack.push({ key, args: [j], screen: SCREENS[key](j), sel: 0 });
      render(d);
      buzz(true);
    } else if (s.type === 'menu') move(d);
  };

  const select = () => {
    const top = stack[stack.length - 1];
    const s = top.screen;
    if (s.type === 'menu') { s.items[top.sel][1](); }
    else if (s.type === 'story') step(1);
    else if (s.type === 'text') { pane.scrollTop += pane.clientHeight * 0.7; }
  };

  const play = () => {
    const top = stack[stack.length - 1];
    if (top.screen.type === 'story') { top.color = !top.color; render(0); say(top.color ? 'Colour' : 'One bit'); return; }
    window.SFX.tune();
    window.EGGS.find('tune');
    say('♪ now playing: boot.mid');
  };

  /* -------------------------------------------------------------- input */

  const guard = () => {
    if (!on) return false;
    wake();
    if (held) { say('HOLD is on'); return false; }
    return true;
  };

  /* The wheel: angle around the centre, a detent every 15 degrees. A press
     that barely turns is a press of whichever button is under it. */
  let wt = null;
  const angleOf = (e) => {
    const r = wheel.getBoundingClientRect();
    return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI;
  };
  wheel.addEventListener('pointerdown', (e) => {
    if (e.target === hub) return;
    wheel.setPointerCapture(e.pointerId);
    const a0 = angleOf(e);
    wt = { id: e.pointerId, a: a0, a0, acc: 0, turned: 0, t: performance.now() };
  });
  wheel.addEventListener('pointermove', (e) => {
    if (!wt || e.pointerId !== wt.id) return;
    const a = angleOf(e);
    let d = a - wt.a;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    wt.a = a;
    wt.acc += d;
    wt.turned += Math.abs(d);
    const dot = wheel.querySelector('.dot');
    const r = wheel.getBoundingClientRect();
    dot.style.transform = `rotate(${a}deg) translate(${r.width * 0.33}px)`;
    if (wt.turned > 8) wheel.classList.add('is-turning');
    while (Math.abs(wt.acc) >= 15) {
      const s = Math.sign(wt.acc);
      wt.acc -= s * 15;
      if (guard()) move(s);
    }
  });
  const wheelUp = (e) => {
    if (!wt || e.pointerId !== wt.id) return;
    const w = wt;
    wt = null;
    wheel.classList.remove('is-turning');
    /* A press that barely turned is a button press. Which button is read
       from the angle, so the whole quarter of the ring counts: the top
       quarter is MENU (back), wherever on it the thumb lands. */
    if (w.turned < 12) {
      if (!guard()) return;
      tap();
      const a = w.a0;
      if (a < -45 && a >= -135) back();
      else if (a >= -45 && a < 45) step(1);
      else if (a >= 45 && a < 135) play();
      else step(-1);
    }
  };
  wheel.addEventListener('pointerup', wheelUp);
  wheel.addEventListener('pointercancel', wheelUp);
  /* Keyboard and switch access still reach every button. */
  wheel.querySelectorAll('.zone').forEach((z) => z.addEventListener('click', (e) => {
    if (e.detail !== 0 || !guard()) return;
    if (z.classList.contains('t')) back();
    else if (z.classList.contains('l')) step(-1);
    else if (z.classList.contains('r')) step(1);
    else play();
  }));
  hub.addEventListener('click', () => { if (!guard()) return; tap(); select(); });
  backBtn.addEventListener('click', (e) => { e.stopPropagation(); if (!guard()) return; tap(); back(); });

  /* Tapping the screen chooses what was tapped. */
  view.addEventListener('click', (e) => {
    if (!guard()) return;
    const l = e.target.closest('li[data-i]');
    if (l) {
      const top = stack[stack.length - 1];
      top.sel = +l.dataset.i;
      pane.querySelectorAll('li').forEach((x, i) => x.classList.toggle('is-sel', i === top.sel));
      tap();
      select();
      return;
    }
    if (e.target.closest('.lcd-story .ph')) { tap(); step(1); }
  });
  /* A sideways swipe on the screen goes back, the way phones do. */
  let sx = null, sy = null, sx0 = 0;
  view.addEventListener('touchstart', (e) => { sx = sx0 = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  view.addEventListener('touchend', (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    sx = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && guard()) {
      const s = stack[stack.length - 1].screen;
      /* From the left edge, a swipe always goes back, as on a phone. */
      if (dx > 0 && sx0 - view.getBoundingClientRect().left < 36) back();
      else if (s.type === 'story' || s.nav) step(dx < 0 ? 1 : -1);
      else if (dx > 0) back();
    }
  }, { passive: true });

  hold.addEventListener('click', () => {
    held = !held;
    hold.classList.toggle('is-on', held);
    hold.setAttribute('aria-pressed', held);
    lock.textContent = held ? '🔒' : '';
    tap();
    if (on) say(held ? 'HOLD on' : 'HOLD off');
    window.EGGS.find('hold');
  });

  /* Keys still work, for anyone who has one. */
  document.addEventListener('keydown', (e) => {
    if (!on) { if (e.key === 'Enter' || e.key === ' ') insert(); return; }
    if (!guard()) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'Enter') select();
    else if (e.key === 'Escape' || e.key === 'Backspace') back();
  });

  /* ---------------------------------------------------------------- boot */



  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  let inserting = false;
  async function insert() {
    if (on || inserting) return;
    inserting = true;
    await wait(200);
    dev.classList.remove('is-off');
    await wait(350);
    lcd.classList.add('is-lit');
    const b = document.createElement('div');
    b.className = 'lcd-boot';
    b.innerHTML = `<div>${I.pxmark(72, true)}<div>SOMMI POCKET</div><div class="dots">·</div></div>`;
    lcd.appendChild(b);
    window.SFX.chime();
    const dots = b.querySelector('.dots');
    for (let i = 1; i <= 6; i++) { await wait(170); dots.textContent = '■ '.repeat(i).trim(); }
    await wait(250);
    b.remove();
    on = true;
    stack.length = 0;
    stack.push({ key: 'main', args: [], screen: SCREENS.main(), sel: 0 });
    render(0);
    wake();
    say('Turn the wheel · press the middle · MENU goes back');
  }

  insert();
} };
