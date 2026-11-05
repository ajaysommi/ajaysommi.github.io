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

  /* The player is always white, as the 2003 one was; Settings changes the
     colour of the room behind it instead. */
  const BGS = [['lilac', 'Lilac'], ['sky', 'Sky'], ['mint', 'Mint'], ['sand', 'Sand'], ['slate', 'Slate']];
  room.dataset.bg = store.get('pod-bg', 'lilac');

  room.innerHTML = `
    <div class="pk-scale"><div class="pk is-off is-photo" style="background-image:url(assets/images/isommi-classic.webp)">
      <button class="pk-hold" type="button" aria-label="Hold switch" aria-pressed="false"><span>HOLD</span></button>
      <div class="pk-brand">${I.mark(14, true)} iSommi Classic</div>
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
      <div class="pk-btns">${[['prev', 'Back'], ['menu', 'Menu'], ['play', 'Play or pause'], ['next', 'Next']].map(([k, l]) => `<button type="button" data-b="${k}" aria-label="${l}"></button>`).join('')}</div>
    </div></div>`;

  const dev = room.querySelector('.pk');
  const scaleBox = room.querySelector('.pk-scale');

  /* A fixed shape, an iPod's proportions, scaled to the room the browser
     really leaves under the buttons on top. */
  const fit = () => {
    const v = window.RETRO.viewport();
    /* 16 points clear at the top, 72 at the bottom for the row of
       buttons under the phone (which sits above any browser toolbar). */
    const s = Math.min(1.35, (v.h - 88) / 603, (v.w - 24) / 346);
    scaleBox.style.transform = `scale(${s})`;
    scaleBox.style.marginTop = v.top + 16 + Math.max(0, (v.h - 88 - 603 * s) / 2) + 'px';
  };
  fit();
  addEventListener('retro-fit', fit);
  const lcd = room.querySelector('.pk-lcd');
  window.RETRO.zoomPics(lcd);
  room.addEventListener('contextmenu', (e) => e.preventDefault());
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
  /* The shared toast already announces an egg; the screen needn't repeat it. */

  /* ------------------------------------------------------------- screens */

  const li = (label, right = '›', ico) => ({ label, right, ico });

  const ditherIn = (root) => {
    root.querySelectorAll('img[data-src]').forEach((im) => {
      const w = Math.round(Math.min(view.clientWidth, 360) * (+im.dataset.k || 1));
      dither(im.dataset.src, w).then((u) => { im.src = u; });
    });
  };

  const textScreen = (t, html) => ({ type: 'text', title: t, html });

  const TOP04 = [['Yeah!', 'Usher feat. Lil Jon & Ludacris'], ['Burn', 'Usher'], ['If I Ain’t Got You', 'Alicia Keys'], ['This Love', 'Maroon 5'], ['The Way You Move', 'OutKast feat. Sleepy Brown'], ['Hey Ya!', 'OutKast'], ['Slow Jamz', 'Twista feat. Kanye West & Jamie Foxx'], ['Naughty Girl', 'Beyoncé'], ['Lean Back', 'Terror Squad'], ['Goodies', 'Ciara feat. Petey Pablo'], ['Toxic', 'Britney Spears'], ['Mr. Brightside', 'The Killers'], ['American Idiot', 'Green Day'], ['Jesus Walks', 'Kanye West'], ['Numb/Encore', 'Jay-Z & Linkin Park'], ['Drop It Like It’s Hot', 'Snoop Dogg feat. Pharrell'], ['Let’s Get It Started', 'The Black Eyed Peas'], ['Dragostea Din Tei', 'O-Zone'], ['Take Me Out', 'Franz Ferdinand'], ['Float On', 'Modest Mouse'], ['My Happy Ending', 'Avril Lavigne'], ['Pieces of Me', 'Ashlee Simpson'], ['Vertigo', 'U2']];
  const store04 = () => store.get('pk-store', []);
  const SCREENS = {
    main: () => ({
      type: 'menu', title: 'iSommi',
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
        [li('Music Store'), () => open('store')],
        [li('Games'), () => open('games')],
        [li('Extras'), () => open('extras')],
        [li('Settings'), () => open('settings')],
        [li('Switch device', '\u21c4'), () => exit()]
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
      return { type: 'text', title: p.name, nav: ['project', i, P.projects.length], html: `<h2>${esc(p.full)}</h2><div class="m">${esc(p.kind)} · ${esc(p.stack)}</div>${p.shot ? `<img class="pk-shot" src="${p.shot}" alt="" />` : ''}<p>${esc(p.text)}</p>${p.url ? `<a href="${p.url}" target="_blank" rel="noopener noreferrer">Open on GitHub ↗</a>` : '<div class="m">Source is private for now.</div>'}` };
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
    note: () => textScreen('Contact', `<img data-src="${P.kidPhoto}" alt="Ajay as a kid in 2006, at a computer" /><h2>Contact</h2><p>Email is the quickest way to reach me.</p><a href="mailto:${P.email}">${esc(P.email)}</a>`),
    extras: () => ({
      type: 'menu', title: 'Extras',
      items: [
        [li('Fortune', ''), () => open('fortune')],
        [li('Flashlight', ''), () => { lcd.classList.toggle('is-flash'); window.EGGS.find('light'); }],
        [li('Play a tune', '♪'), () => { window.SFX.tune(); window.EGGS.find('tune'); }],
        [li('Easter eggs', `${window.EGGS.count()}/${window.EGGS.total}`), () => open('eggs')],
        [li('More eras on a computer'), () => open('desk')],
        [li('Untitled', ''), () => open('letter')]
      ]
    }),
    fortune: () => {
      return textScreen('Fortune', `<p class="q" style="font-size:18px;margin-top:20px">“${esc(P.quote)}”</p>`);
    },
    eggs: () => textScreen('Easter eggs', window.EGGS.list.map(([id, n, d]) => window.EGGS.has(id) ? `<p>★ <b>${esc(n)}</b><br/><span class="m">${esc(d)}</span></p>` : '<p class="m">☆ ??? still hidden</p>').join('') + '<div class="hint">some only live on the desktop version</div>'),
    desk: () => textScreen('More eras', '<h2>There are whole computers.</h2><p>On a laptop or desktop, this portfolio boots a full operating system from the era you pick.</p><p>Open this page on a computer to try them.</p><p class="m">Or <a href="index.html">see the classic site</a>.</p>'),
    letter: () => textScreen('A Letter', window.STORY.html('pocket')),
    /* The Music Store, 2004: what everyone was buying, 99 cents a song. */
    store: () => ({ type: 'menu', title: 'Music Store', items: TOP04.map(([s, a], i) => [li(s, store04().includes(i) ? '✓' : '›'), () => open('song', i)]) }),
    song: (i) => {
      const [s, a] = TOP04[i], have = store04().includes(i);
      return { type: 'menu', title: 'Music Store', items: [
        [li(s, ''), () => {}],
        [li(a, ''), () => {}],
        [li(have ? 'Purchased' : 'Buy Song', have ? '✓' : '$0.99'), () => { if (have) return; store.set('pk-store', [...store04(), i]); say(`Downloaded “${s}”`); back(); }]
      ] };
    },
    games: () => ({ type: 'menu', title: 'Games', items: [[li('Laptop Rescue'), () => open('rescue')], [li('How to rescue'), () => open('rescuehelp')], [li('Most saved', String(store.get('pod-rescue-hi', 0))), () => say(`Most saved: ${store.get('pod-rescue-hi', 0)}`)], [li('Orbit'), () => open('orbit')], [li('How to play Orbit'), () => open('orbithelp')], [li('Best score', String(store.get('pod-orbit-hi', 0))), () => say(`Best: ${store.get('pod-orbit-hi', 0)}`)]] }),
    orbithelp: () => textScreen('Orbit', '<h2>Orbit</h2><p>Turn the wheel to swing the paddle around the ring and keep the ball inside.</p><p>Every return speeds it up. Every five, the paddle gets shorter. At 15 a second ball joins in.</p><p>Press the centre to launch or pause. MENU quits.</p><div class="hint">three balls to lose</div>'),
    orbit: () => ({ type: 'game', title: 'Orbit' }),
    rescue: () => ({ type: 'game', title: 'Laptop Rescue', play: 'rescue' }),
    rescuehelp: () => textScreen('Laptop Rescue', '<h2>Laptop Rescue</h2><p>Old MacBooks keep coming in. Turn the wheel to unscrew, pull parts and scrub off dried paste. Press the centre to commit.</p><p>Filing the connector is the risky part. Turn slowly, press inside the box. Go too far and the board shorts.</p><p>It really happened: a 2012 board in a 2011 MacBook Pro.</p>'),
    settings: () => ({
      type: 'menu', title: 'Settings',
      items: [
        [li('Background', (BGS.find((f) => f[0] === room.dataset.bg) || BGS[0])[1]), () => {
          const k = BGS.findIndex((f) => f[0] === room.dataset.bg);
          const n = BGS[(k + 1) % BGS.length];
          room.dataset.bg = n[0]; store.set('pod-bg', n[0]);
          window.EGGS.find('faceplate');
          refresh();
        }],
        [li('Clicker', store.get('clicker', true) ? 'On' : 'Off'), () => { store.set('clicker', !store.get('clicker', true)); refresh(); }],
        [li('Sound', window.SFX.muted ? 'Off' : 'On'), () => { window.SFX.toggle(); refresh(); }],
        [li('Backlight', store.get('backlight', 'auto') === 'auto' ? 'Auto' : 'Always'), () => { store.set('backlight', store.get('backlight', 'auto') === 'auto' ? 'always' : 'auto'); wake(); refresh(); }],
        [li('Contrast', ['Low', 'Medium', 'High'][store.get('pod-contrast', 1)]), () => { const c = (store.get('pod-contrast', 1) + 1) % 3; store.set('pod-contrast', c); lcd.style.filter = `contrast(${[.82, 1, 1.25][c]})`; refresh(); }],
        [li('About'), () => open('aboutdev')],
        [li('Switch device', '\u21c4'), () => exit()]
      ]
    }),
    aboutdev: () => textScreen('About', `<h2>iSommi Classic</h2><div class="m">Model AJ-26 · firmware 1.0</div><p>Capacity: 20 GB</p><p>Built in 2026 by Ajay Sommi.</p><div class="hint">try the HOLD switch on top</div>`)
  };

  /* ---------------------------------------------------------------- Orbit */

  /* A ring, a paddle on it, balls inside. The wheel is the only control:
     the paddle follows the thumb around the ring exactly as far as the
     thumb turns. A ball that reaches the ring off the paddle is lost. */
  let game = null;
  /* Laptop Rescue, on the wheel: turn to do the work, press the centre to
     commit. Every laptop ends the same way, shipped or shorted. */
  const rescue = (cv) => {
    const W = cv.clientWidth, H = cv.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = W * dpr; cv.height = H * dpr;
    const c = cv.getContext('2d');
    c.scale(dpr, dpr);
    const ink = getComputedStyle(lcd).getPropertyValue('--lcd-ink').trim() || '#1c2614';
    const font = getComputedStyle(document.body).getPropertyValue('--pixel') || 'monospace';
    const JOBS = {
      screws: { say: 'Turn to unscrew', hint: 'six screws', need: 900 },
      drive: { say: 'Turn: pull the HDD', hint: 'then in with the SSD', need: 500 },
      battery: { say: 'Turn: swap battery', hint: 'it has swollen', need: 500 },
      paste: { say: 'Turn to scrub paste', hint: 'it dried out', need: 700 },
      file: { say: 'File the connector', hint: 'press in the box', need: 0 },
      install: { say: 'Press: install OS', hint: 'unsupported. do it anyway', need: 0, presses: 2 },
      ship: { say: 'Turn: into the box', hint: 'good as new', need: 420 }
    };
    const g = { state: 'ready', saved: 0, lives: 3, time: 40, maxT: 40, queue: [], job: null, v: 0, spin: 0, msg: 'press the centre', pressed: 0, flash: 0, t: performance.now(), best: store.get('pod-rescue-hi', 0) };
    const nextJob = () => { const j = g.queue.shift(); if (!j) { newMac(); return; } g.job = j; g.v = 0; g.pressed = 0; };
    const newMac = () => {
      const n = g.saved < 2 ? 1 : g.saved < 5 ? 2 : 3;
      const faults = ['drive', 'battery', 'paste', 'file'].sort(() => Math.random() - .5).slice(0, n);
      g.queue = ['screws', ...faults, 'install', 'ship'];
      nextJob();
    };
    const finish = () => {
      g.state = 'over';
      if (g.saved > g.best) { g.best = g.saved; store.set('pod-rescue-hi', g.saved); g.msg = `new best: ${g.saved} saved`; }
      else g.msg = `${g.saved} saved · best ${g.best}`;
      window.SFX.error && window.SFX.error();
    };
    const lose = () => {
      g.lives--; g.flash = 500; say('Filed too far. It shorted');
      window.SFX.error && window.SFX.error();
      if (g.lives <= 0) { finish(); return; }
      newMac();
    };
    const draw = () => {
      c.clearRect(0, 0, W, H);
      c.fillStyle = ink; c.strokeStyle = ink;
      c.font = `600 13px ${font}`;
      c.textAlign = 'left'; c.fillText(`${g.saved} saved`, 6, 13);
      c.textAlign = 'right'; c.fillText('●'.repeat(Math.max(0, g.lives)) + '○'.repeat(3 - Math.max(0, g.lives)), W - 6, 13);
      c.textAlign = 'center';
      if (g.state !== 'play') {
        c.font = `600 16px ${font}`;
        c.fillText(g.state === 'over' ? 'Landfill' : 'Laptop Rescue', W / 2, H / 2 - 22);
        c.font = `12px ${font}`;
        c.fillText(g.state === 'over' ? g.msg : 'fix it. ship it.', W / 2, H / 2 + 2);
        c.fillText(g.state === 'over' ? 'centre to retry' : 'press the centre', W / 2, H / 2 + 20);
        return;
      }
      c.fillRect(6, 18, Math.max(0, (W - 12) * g.time / g.maxT), 3);
      const J = JOBS[g.job];
      c.font = `600 14px ${font}`; c.fillText(J.say, W / 2, 38);
      c.font = `11px ${font}`; c.fillText(J.hint, W / 2, 52);
      /* The laptop on the bench, or the part being worked on. */
      const lx = W / 2 - 46, ly = 60, lw = 92, lh = H - 60 - 26;
      if (g.job === 'ship') {
        const x = lx + (g.v / J.need) * (W - lw - lx - 6);
        c.lineWidth = 2; c.strokeRect(W - 40, ly + 4, 34, lh - 8);
        c.fillRect(x, ly + lh / 2 - 7, Math.min(lw, 50), 14);
      } else {
        c.lineWidth = 2; c.strokeRect(lx, ly, lw, lh);
        if (g.job === 'screws') {
          [[lx + 8, ly + 8], [lx + lw - 8, ly + 8], [lx + 8, ly + lh - 8], [lx + lw - 8, ly + lh - 8], [W / 2, ly + 8], [W / 2, ly + lh - 8]].forEach(([x, y], i) => {
            if (g.v > (i + 1) * 150) return;
            c.beginPath(); c.arc(x, y, 4, 0, Math.PI * 2); c.stroke();
            const a = g.v / 40; c.beginPath(); c.moveTo(x - Math.cos(a) * 3, y - Math.sin(a) * 3); c.lineTo(x + Math.cos(a) * 3, y + Math.sin(a) * 3); c.stroke();
          });
        } else if (g.job === 'paste') {
          const n = Math.ceil(10 * (1 - g.v / J.need));
          for (let i = 0; i < n; i++) c.fillRect(lx + 12 + (i % 5) * 14, ly + lh / 2 - 9 + Math.floor(i / 5) * 10, 9, 7);
        } else if (g.job === 'drive' || g.job === 'battery') {
          const out = g.v / J.need, name = g.job === 'drive' ? (out < .5 ? 'HDD' : 'SSD') : (out < .5 ? 'OLD' : 'NEW');
          const off = out < .5 ? out * 2 * (lw + 10) : (1 - out) * 2 * (lw + 10);
          c.save(); c.beginPath(); c.rect(lx, ly, lw, lh); c.clip();
          c.fillRect(lx + 12 + off, ly + lh / 2 - 12, lw - 24, 24);
          c.restore();
          if (out < .95) { c.font = `600 11px ${font}`; c.fillText(name, W / 2, ly + lh + 13); }
        } else if (g.job === 'file') {
          const bx = lx + 6, bw = lw - 12, by = ly + lh / 2 - 7;
          c.strokeRect(bx, by, bw, 14);
          c.fillRect(bx, by, bw * Math.min(1, g.v), 14);
          c.lineWidth = 1; c.strokeRect(bx + bw * .66, by - 5, bw * .17, 24);
        } else if (g.job === 'install') {
          c.font = `600 13px ${font}`; c.fillText(g.pressed ? 'not supported' : 'newest OS', W / 2, ly + lh / 2 - 2);
          c.font = `11px ${font}`; c.fillText(g.pressed ? 'install anyway?' : 'on a 2011 MacBook', W / 2, ly + lh / 2 + 14);
        }
      }
      if (g.flash > 0) { c.globalAlpha = .4; c.fillRect(0, 0, W, H); c.globalAlpha = 1; }
    };
    let raf = 0;
    const frame = (now) => {
      const dt = Math.min(50, now - g.t); g.t = now;
      if (g.state === 'play') {
        g.time -= dt / 1000;
        g.flash = Math.max(0, g.flash - dt);
        if (g.time <= 0) { g.msg = ''; finish(); }
      }
      draw();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return {
      turn: (deg) => {
        if (g.state !== 'play') return;
        const J = JOBS[g.job], d = Math.abs(deg);
        if (g.job === 'file') {
          g.v += d / 900;
          if (g.v > .83) lose();
          return;
        }
        if (!J.need) return;
        g.v += d;
        buzz();
        if (g.v >= J.need) {
          if (g.job === 'ship') {
            g.saved++;
            const bonus = Math.max(6, 11 - g.saved * .5);
            g.time = Math.min(g.maxT, g.time + bonus);
            say(g.saved === 1 ? 'One less in a landfill' : `Shipped. ${g.saved} saved`);
          }
          nextJob();
        }
      },
      press: () => {
        if (g.state === 'over') { Object.assign(g, { state: 'ready', saved: 0, lives: 3, time: g.maxT }); return; }
        if (g.state === 'ready') { g.state = 'play'; g.t = performance.now(); newMac(); return; }
        if (g.job === 'install') { g.pressed++; buzz(true); if (g.pressed >= JOBS.install.presses) nextJob(); return; }
        if (g.job === 'file') {
          if (g.v >= .66) { say('It clicked in'); buzz(true); nextJob(); }
          else { say('Not yet'); g.time -= 1; }
        }
      },
      stop: () => cancelAnimationFrame(raf)
    };
  };

  const orbit = (cv) => {
    const W = cv.clientWidth, H = cv.clientHeight, dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = W * dpr; cv.height = H * dpr;
    const c = cv.getContext('2d');
    c.scale(dpr, dpr);
    const css = getComputedStyle(lcd), ink = css.getPropertyValue('--lcd-ink').trim() || '#1c2614';
    const cx = W / 2, cy = H / 2 + 6, R = Math.min(W, H - 12) / 2 - 8;
    const g = { pa: -Math.PI / 2, hw: 0.42, balls: [], score: 0, lives: 3, state: 'ready', hits: 0, t: performance.now(), speed: R / 1000, msg: 'press the centre' };
    const launch = () => {
      const a = Math.random() * Math.PI * 2;
      g.balls.push({ x: cx, y: cy, vx: Math.cos(a) * g.speed, vy: Math.sin(a) * g.speed });
    };
    const norm = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
    const draw = () => {
      c.clearRect(0, 0, W, H);
      c.fillStyle = ink; c.strokeStyle = ink;
      c.font = `600 14px ${getComputedStyle(document.body).getPropertyValue('--pixel') || 'monospace'}`;
      c.textAlign = 'left'; c.fillText(String(g.score), 6, 14);
      c.textAlign = 'right'; c.fillText('●'.repeat(g.lives) + '○'.repeat(3 - g.lives), W - 6, 14);
      c.lineWidth = 1; c.setLineDash([2, 3]); c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
      c.lineWidth = 6; c.lineCap = 'butt'; c.beginPath(); c.arc(cx, cy, R, g.pa - g.hw, g.pa + g.hw); c.stroke();
      g.balls.forEach((b) => c.fillRect(b.x - 3, b.y - 3, 6, 6));
      c.fillRect(cx - 1, cy - 1, 2, 2);
      if (g.state !== 'play') {
        c.textAlign = 'center';
        c.font = `600 16px ${getComputedStyle(document.body).getPropertyValue('--pixel') || 'monospace'}`;
        c.fillText(g.state === 'over' ? 'Game over' : g.state === 'paused' ? 'Paused' : 'Orbit', cx, cy - 14);
        c.font = `13px ${getComputedStyle(document.body).getPropertyValue('--pixel') || 'monospace'}`;
        c.fillText(g.msg, cx, cy + 22);
      }
    };
    let raf = 0;
    const frame = (now) => {
      const dt = Math.min(40, now - g.t); g.t = now;
      if (g.state === 'play') {
        for (const b of g.balls.slice()) {
          b.x += b.vx * dt; b.y += b.vy * dt;
          const dx = b.x - cx, dy = b.y - cy, d = Math.hypot(dx, dy);
          if (d >= R - 6 && dx * b.vx + dy * b.vy > 0) {
            const a = Math.atan2(dy, dx), off = norm(a - g.pa);
            if (Math.abs(off) <= g.hw + 0.06) {
              // Back inward, angled by where it struck the paddle.
              const out = a + Math.PI + (off / g.hw) * 0.75 + (Math.random() - 0.5) * 0.12;
              const sp = Math.hypot(b.vx, b.vy) * 1.04;
              b.vx = Math.cos(out) * sp; b.vy = Math.sin(out) * sp;
              b.x = cx + Math.cos(a) * (R - 7); b.y = cy + Math.sin(a) * (R - 7);
              g.score++; g.hits++; buzz(true);
              if (g.hits % 5 === 0) g.hw = Math.max(0.16, g.hw * 0.88);
              if (g.score === 15 || g.score === 40) { g.speed = Math.hypot(b.vx, b.vy) * 0.85; launch(); say('Another ball!'); }
            } else if (d > R + 8) {
              g.balls.splice(g.balls.indexOf(b), 1);
              if (navigator.vibrate) navigator.vibrate(60);
              window.SFX.error && window.SFX.error();
              if (!g.balls.length) {
                g.lives--;
                if (g.lives <= 0) {
                  g.state = 'over';
                  const hi = store.get('pod-orbit-hi', 0);
                  if (g.score > hi) { store.set('pod-orbit-hi', g.score); g.msg = `new best: ${g.score}`; } else g.msg = `best ${hi} · centre to retry`;
                } else { g.state = 'ready'; g.msg = `${g.lives} left · press the centre`; }
              }
            }
          }
        }
      }
      draw();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return {
      turn: (deg) => { g.pa = norm(g.pa + deg * Math.PI / 180); },
      press: () => {
        if (g.state === 'over') { Object.assign(g, { hw: 0.42, balls: [], score: 0, lives: 3, hits: 0, speed: R / 1000, state: 'ready', msg: 'press the centre' }); return; }
        if (g.state === 'ready') { g.speed = Math.max(g.speed, R / 1000); launch(); g.state = 'play'; return; }
        g.state = g.state === 'play' ? 'paused' : 'play'; g.msg = 'press the centre';
      },
      stop: () => cancelAnimationFrame(raf)
    };
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
    if (game) { game.stop(); game = null; }
    if (s.type === 'game') p.innerHTML = `<canvas class="pk-game" aria-label="${esc(s.title)}"></canvas>`;
    view.innerHTML = '';
    view.appendChild(p);
    pane = p;
    /* Slid in, the pane is put plainly in its place. Mobile Safari can hold a
       stepped animation on its last step, a fifth of the way off the screen,
       so the end is not left to the animation alone. */
    if (dir) {
      const settle = () => { clearTimeout(t); p.removeEventListener('animationend', settle); p.classList.remove('in-r', 'in-l'); view.scrollLeft = 0; };
      const t = setTimeout(settle, 300);
      p.addEventListener('animationend', settle);
    }
    if (s.type === 'game') game = (s.play === 'rescue' ? rescue : orbit)(p.querySelector('canvas'));
    backBtn.hidden = stack.length <= 1;
    ditherIn(p);
    if (top.scroll) p.scrollTop = top.scroll;
    if (s.type === 'menu') scrollSel();
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
    // In a game the wheel steers continuously, degree for degree.
    if (game && on && !held) { game.turn(d); wt.acc = 0; return; }
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
      if (game && !(a < -45 && a >= -135)) return;
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
  hub.addEventListener('click', () => { if (!guard()) return; tap(); if (game) { game.press(); return; } select(); });
  /* MENU goes all the way out to the main menu. */
  const home = () => { if (stack.length <= 1) return; stack.length = 1; render(-1); };
  /* The four touch buttons over the wheel, as the 2003 model had them. */
  room.querySelector('.pk-btns').addEventListener('click', (e) => {
    const b = e.target.closest('[data-b]');
    if (!b || !guard()) return;
    tap();
    ({ prev: back, menu: home, play, next: () => step(1) })[b.dataset.b]();
  });
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
    if (game) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); game.turn(-14); return; }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); game.turn(14); return; }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); game.press(); return; }
    }
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
    b.innerHTML = `<div>${I.pxmark(72, true)}<div>iSOMMI</div><div class="dots">·</div></div>`;
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
  }

  Promise.resolve(room.landed).then(insert);
} };
