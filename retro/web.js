/* ==========================================================================
   1998: SommiNet. A browser, and a personal homepage of the time: tiled
   background, a marquee, a hit counter, a guestbook, a webring. The
   Location bar takes whatever you type (/work, projects, guestbook) and
   pages load the way they did on a modem, a few rows of picture at a time.
   ========================================================================== */
window.WEB = (function () {
  const P = window.PORTFOLIO;
  const { esc, store } = window.RETRO;
  const I = window.ICONS;
  const HOST = 'http://www.sommi.net/~ajay/';

  let root, page, loc, status, prog, throb, back, fwd, api, titleEl, modem;
  let hist = [], hpos = -1;
  let loadT = 0;

  /* ---------------------------------------------------------------- pages */

  const nav = () => `<div class="navbar">${[['index', 'Home'], ['work', 'Work'], ['projects', 'Projects'], ['garage', 'Garage'], ['skills', 'Skills'], ['school', 'School'], ['guestbook', 'Guestbook'], ['contact', 'E-mail me'], ['resume', 'Résumé']].map(([p, n]) => `<a href="#" data-go="${p}">${n}</a>`).join('')}</div>`;

  const visits = () => {
    const n = store.get('visits', 0) + 1;
    store.set('visits', n);
    return String(1337 + n * 7).padStart(7, '0');
  };

  const footer = () => `<hr/><div class="center small">
      <p>Best viewed with SurfBoard 3.0 at 800&times;600 &middot; Made with Notepad</p>
      <p>You are visitor number <span class="counter" data-counter title="It counts.">${visits().split('').map((d) => `<span>${d}</span>`).join('')}</span></p>
      <p>Last updated: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
    </div>
    <div class="ring">« <a href="#" data-ring="prev">Prev</a> | <b>The Engineers’ Webring</b> | <a href="#" data-ring="rand">Random</a> | <a href="#" data-ring="next">Next</a> »<br/><span class="small">This site is a proud member. Prev and Next lead to other decades.</span></div>`;

  const shell = (title, body) => ({ title, html: `<div class="pg"><div class="pg-in">${body}${footer()}</div></div>` });

  const PAGES = {
    index: () => shell('Ajay Sommi’s Home Page', `
      <h1>~ Ajay Sommi ~</h1>
      <p class="center"><i>Software Engineer &middot; ${esc(P.citizen)} &middot; University of Florida, Computer Science</i></p>
      <div class="mq"><span>★ Welcome to my corner of the Information Superhighway! ★ Now booking: full-time software engineering roles ★ Sign my guestbook! ★</span></div>
      <table class="lay"><tr><td style="width:240px"><span class="frame"><img class="slow" src="${P.photo}" width="220" height="220" alt="Ajay Sommi outdoors in front of green hills" /></span></td>
      <td><h2 style="margin-top:0">Welcome! <span class="new">NEW!</span></h2><p>${esc(P.about[0])}</p><p>${esc(P.about[1])}</p></td></tr></table>
      ${nav()}
      <div class="uc"><span>⚠ THIS SITE IS ALWAYS UNDER CONSTRUCTION ⚠</span></div>
      <h3>What’s new</h3>
      <ul>
        <li><b>Oct 2026:</b> Wrapped up at <a href="#" data-go="work/adt">ADT</a>, where I pitched an AI false alarm check to leadership.</li>
        <li><b>May 2026:</b> Finished a co-op at <a href="#" data-go="work/hunter">Hunter Engineering</a>: remote resets for 100,000+ machines.</li>
        <li><b>Dec 2026:</b> Graduating from <a href="#" data-go="school">UF</a>, AI Certificate included.</li>
        <li>Brought a <a href="#" data-go="garage/macbook">MacBook back from the dead</a>. Pictures inside!</li>
      </ul>
      <table class="lay"><tr><td style="vertical-align:top"><h3>Hot off the wire</h3><p class="small"><a href="#" data-go="news">What’s New on the Web in 1998</a>: Windows 98, a search engine called Google, and the iMac.</p></td>
      <td style="width:230px;vertical-align:top"><a href="#" data-go="shop" class="ad98"><b>SommiNet 56K!</b><span>Surf at top speed. Click here!</span></a></td></tr></table>`),

    /* The papers of 1998: a news page of the year, and an advert. */
    news: () => {
      const d = window.PAPERS[1998].news;
      return shell(d.title, `<h1>${esc(d.title)}</h1><p class="center"><i>${esc(d.sub)}</i></p><hr/>${d.items.map(([h, t]) => `<h3><span class="new">NEW!</span> ${esc(h)}</h3><p>${esc(t)}</p>`).join('')}<hr/><p class="small center">${esc(d.foot)} &nbsp;|&nbsp; <a href="#" data-go="index">&laquo; Home</a></p>`);
    },
    shop: () => {
      const d = window.PAPERS[1998].brochure;
      return shell(d.title, `<div class="ad98-page"><h1>${esc(d.title)}</h1><p class="center"><b>${esc(d.sub)}</b></p><table class="ad98-t">${d.items.map(([h, t]) => `<tr><td>★ <b>${esc(h)}</b></td><td>${esc(t)}</td></tr>`).join('')}</table><p class="small center">${esc(d.foot)}</p></div><p class="center"><a href="#" data-go="index">&laquo; Back to my home page</a></p>`);
    },

    work: (id) => {
      if (id) {
        const i = P.experience.findIndex((e) => e.id === id);
        const e = P.experience[i];
        if (!e) return null;
        return shell(`${e.short} · Work`, `
          <p class="small"><a href="#" data-go="index">Home</a> &gt; <a href="#" data-go="work">Work</a> &gt; ${esc(e.short)}</p>
          <h1 style="text-align:left;font-size:34px">${esc(e.role)}</h1>
          <h3 style="margin-top:0">${esc(e.org)} &middot; ${esc(e.when)} &middot; ${esc(e.where)}</h3>
          <p>${esc(e.text)}</p>
          ${e.stats.length ? `<table class="grid"><tr><th>Number</th><th>What it means</th></tr>${e.stats.map(([a, b]) => `<tr><td><b>${esc(a)}</b></td><td>${esc(b)}</td></tr>`).join('')}</table>` : ''}
          <p><b>Tools:</b> ${e.tags.map((t) => `<code>${esc(t)}</code>`).join(' ')}</p>
          ${e.photos.length ? `<div class="photos">${e.photos.map((p) => `<img class="slow" src="${p}" alt="${esc(e.short)}" />`).join('')}</div>` : ''}
          <p class="center">${i > 0 ? `<a href="#" data-go="work/${P.experience[i - 1].id}">&laquo; ${esc(P.experience[i - 1].short)}</a>` : ''} &nbsp;|&nbsp; <a href="#" data-go="work">All work</a> &nbsp;|&nbsp; ${i < P.experience.length - 1 ? `<a href="#" data-go="work/${P.experience[i + 1].id}">${esc(P.experience[i + 1].short)} &raquo;</a>` : ''}</p>`);
      }
      return shell('Work · Ajay Sommi', `
        <h1>My Work</h1><p class="center">Every role so far, from a robotics vision system in high school to identity infrastructure in the cloud.</p>
        <table class="grid"><tr><th>Year</th><th>Where</th><th>What</th></tr>
        ${P.experience.map((e) => `<tr><td>${e.year}</td><td><a href="#" data-go="work/${e.id}">${esc(e.org)}</a><br/><span class="small">${esc(e.where)}</span></td><td>${esc(e.role)}</td></tr>`).join('')}</table>
        ${nav()}`);
    },

    projects: () => shell('Cool Stuff I Built', `
      <h1>Cool Stuff I Built</h1><p class="center">Click the <b>[source]</b> links to see the code. Some are private for now.</p>
      ${P.projects.map((p) => `<h3>▶ ${esc(p.full)}</h3><p>${esc(p.text)}<br/><span class="small"><b>${esc(p.kind)}</b> &middot; ${esc(p.stack)}</span> ${p.url ? `<a href="${p.url}" target="_blank" rel="noopener noreferrer">[source]</a>` : '<span class="small">[private]</span>'}</p>`).join('')}
      ${nav()}`),

    garage: (id) => {
      if (id) {
        const s = P.offclock.find((x) => x.id === id);
        if (!s) return null;
        return shell(s.title, `
          <p class="small"><a href="#" data-go="index">Home</a> &gt; <a href="#" data-go="garage">Garage</a> &gt; ${esc(s.name)}</p>
          <h1 style="font-size:32px">${esc(s.title)}</h1><p>${esc(s.lede)}</p>
          ${s.steps.map(([src, t, d]) => `<div class="story"><img class="slow" src="${src}" alt="${esc(t)}" /><div><h3 style="margin-top:0">${esc(t)}</h3><p>${esc(d)}</p></div></div>`).join('')}
          <p class="center"><a href="#" data-go="garage">&laquo; Back to the garage</a></p>`);
      }
      return shell('The Garage', `
        <h1>The Garage</h1><p class="center">Repairs, teardowns and builds I’ve taken on outside of work.</p>
        <table class="lay"><tr>${P.offclock.map((s) => `<td class="center"><a href="#" data-go="garage/${s.id}"><img class="slow" src="${s.cover}" alt="" style="width:180px;height:180px;object-fit:cover;border:2px solid #000;margin:0 auto" /></a><br/><a href="#" data-go="garage/${s.id}">${esc(s.title)}</a></td>`).join('')}</tr></table>
        <p class="center"><i>“${esc(P.quote)}”</i></p>${nav()}`);
    },

    skills: () => shell('Skills', `
      <h1>Skills &amp; Tools</h1>
      ${P.skills.map(([g, list]) => `<h3>${esc(g)}</h3><ul class="skills">${list.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`).join('')}
      ${nav()}`),

    school: () => {
      const e = P.education;
      return shell('School', `<h1>School</h1>
        <table class="lay"><tr><td style="width:150px"><img class="slow" src="${e.logo}" width="140" alt="University of Florida" /></td><td>
        <h2 style="margin-top:0">${esc(e.school)}</h2><p><b>${esc(e.degree)}</b>, ${esc(e.college)}<br/>${esc(e.when)}</p><p>${esc(e.text)}</p>
        <p>${e.tags.map((t) => `<code>${esc(t)}</code>`).join(' ')}</p></td></tr></table>${nav()}`);
    },

    guestbook: () => {
      const mine = store.get('gb', []);
      return shell('Guestbook', `<h1>Guestbook</h1><p class="center">Thanks for stopping by! Here’s what folks have said.</p>
        <form data-gb><b>Sign the guestbook!</b><br/><span class="small">Entries are saved on this computer only. It’s 1998; the server is a shoebox.</span><br/><br/>
          <label>Your name<input name="n" maxlength="40" required /></label>
          <label>Comments<textarea name="c" rows="3" maxlength="400" required></textarea></label>
          <button type="submit">Sign it</button></form>
        ${mine.map(([n, c, d]) => `<div class="gb"><div class="h"><span>${esc(n)} <span class="new" style="animation:none">YOU</span></span><span>${esc(d)}</span></div><div class="b">${esc(c)}</div></div>`).join('')}
        ${P.recs.map(([n, c, q]) => `<div class="gb"><div class="h"><span>${esc(n)}</span><span>${esc(c)}</span></div><div class="b">${esc(q)}</div></div>`).join('')}
        <p class="center">More on <a href="${P.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a>.</p>`);
    },

    contact: () => shell('E-mail me!', `<h1>E-mail me!</h1>
      <table class="lay"><tr><td style="width:250px"><span class="frame"><img class="slow" src="${P.kidPhoto}" width="230" alt="Ajay as a kid in 2006, at a computer" /></span></td>
      <td><h2 style="margin-top:0">Contact</h2><p>Email is the quickest way to reach me.</p>
      <p><span class="mail-anim">✉️</span> <a href="mailto:${P.email}"><b>${esc(P.email)}</b></a></p>
      <p>💾 <a href="${P.github}" target="_blank" rel="noopener noreferrer">My GitHub</a><br/>💼 <a href="${P.linkedin}" target="_blank" rel="noopener noreferrer">My LinkedIn</a><br/>📄 <a href="#" data-go="resume">My Résumé</a></p></td></tr></table>${nav()}`),

    resume: () => ({ title: 'Résumé', html: `<div style="display:flex;flex-direction:column;height:100%"><div class="pg" style="min-height:0;padding:8px 12px;flex:none"><a href="#" data-go="index">&laquo; Home</a> &nbsp; <a href="${P.resume}" target="_blank" rel="noopener">Open in a new window</a> &nbsp; <a href="${P.resume}" download>Download</a></div><iframe class="pdf-frame" style="flex:1" src="${P.resume}#view=FitH" title="Resume"></iframe></div>`, full: true }),

    source: (from) => {
      window.EGGS.find('source');
      const src = `<!-- ${HOST}${from || 'index'}.html -->
<HTML>
<HEAD>
<TITLE>Ajay Sommi's Home Page</TITLE>
<!-- Hi! If you're reading this, you're my kind of person. -->
<!-- The site you're on was hand built, no templates.     -->
<!-- If you're hiring: ${P.email}                     -->
</HEAD>
<BODY BACKGROUND="stars.gif" TEXT="#000000" LINK="#0000EE">
<CENTER><H1>~ Ajay Sommi ~</H1></CENTER>
<MARQUEE>Now booking: full-time software engineering roles</MARQUEE>
<IMG SRC="me.jpg" WIDTH=220 HEIGHT=220>
<!-- TODO: finish the site. (it is never finished.) -->
<IMG SRC="counter.cgi">
</BODY>
</HTML>`;
      return { title: `Source of ${from || 'index'}.html`, html: `<div class="pg" style="background:#fff"><div class="src">${esc(src)}</div></div>` };
    },

    about: () => ({ title: 'About SurfBoard', html: `<div class="pg"><div class="pg-in center"><h1>SurfBoard 3.0</h1><p>A browser that exists only in this portfolio.</p><p>Built in 2026 by Ajay Sommi, with nostalgia for a time he was too young to remember.</p><p><a href="#" data-go="index">Back home</a></p></div></div>` })
  };

  const ALIAS = {
    '': 'index', home: 'index', 'index.html': 'index', 'index.htm': 'index', default: 'index',
    experience: 'work', jobs: 'work', path: 'work', career: 'work',
    code: 'projects', stuff: 'projects', portfolio: 'projects',
    offclock: 'garage', 'off-the-clock': 'garage', hobbies: 'garage', builds: 'garage',
    stack: 'skills', tools: 'skills',
    education: 'school', uf: 'school',
    recs: 'guestbook', recommendations: 'guestbook', refs: 'guestbook', testimonials: 'guestbook',
    email: 'contact', mail: 'contact', 'e-mail': 'contact', hello: 'contact',
    cv: 'resume', 'résumé': 'resume'
  };

  const parse = (raw) => {
    let s = raw.trim().toLowerCase();
    if (s.startsWith('about:')) return ['about'];
    if (s.startsWith('view-source:')) return ['source', s.replace('view-source:', '').replace(/^.*\/~ajay\/?/, '').replace(/\.html?$/, '')];
    const outside = s.match(/^(?:https?:\/\/)?(?:www\.)?([a-z0-9-]+\.[a-z.]+)/);
    if (outside && !outside[1].includes('sommi.net')) return ['outside', raw.trim()];
    s = s.replace(/^(https?:\/\/)?(www\.)?sommi\.net/, '').replace(/^\/?~ajay/, '').replace(/^\/+|\/+$/g, '').replace(/\.html?$/, '');
    let [a, b] = s.split('/');
    a = ALIAS[a] !== undefined ? ALIAS[a] : a;
    if (!b) {
      const role = P.experience.find((e) => e.id === a || e.short.toLowerCase().replace(/\s+/g, '') === a.replace(/\s+/g, ''));
      if (role) return ['work', role.id];
      const st = P.offclock.find((x) => x.id === a);
      if (st) return ['garage', st.id];
    }
    return [a, b];
  };

  const notFound = (path) => ({ title: '404 Not Found', html: `<div class="pg" style="background:#fff"><div class="pg-in err"><h1>Not Found</h1><p>The requested URL /~ajay/${esc(path)} was not found on this server.</p><p>Maybe you meant one of these: ${['work', 'projects', 'garage', 'skills', 'school', 'guestbook', 'contact', 'resume'].map((p) => `<a href="#" data-go="${p}">${p}</a>`).join(', ')}?</p><hr/><address>Apache/1.3.3 Server at www.sommi.net Port 80</address></div></div>` });
  const offline = (host) => ({ title: 'Unable to connect', html: `<div class="pg" style="background:#fff"><div class="pg-in err"><h1>Unable to connect</h1><p>SurfBoard can’t reach <b>${esc(host)}</b> from 1998.</p><p>The modem is busy dialling the only site on this desk. <a href="#" data-go="index">Go home</a>.</p></div></div>` });

  /* -------------------------------------------------------------- loading */

  const setStatus = (t) => { status.textContent = t; };

  const load = (raw, push = true) => {
    let [a, b] = parse(raw);
    let pg;
    if (a === 'outside' || a === 'search') pg = outsidePage();
    else if (a === 'offline') pg = offline(b);
    else if (a === 'source') pg = PAGES.source(b);
    else pg = PAGES[a] ? PAGES[a](b) : null;
    const path = a === 'offline' ? b : (a === 'index' ? '' : a + (b ? '/' + b : '') + '.html');
    /* Words that aren't one of these pages are a search. */
    if (!pg && !b && raw.trim() && !/[\/~:]/.test(raw.trim())) { a = 'search'; b = raw.trim(); pg = outsidePage(); }
    if (!pg) pg = notFound(raw.replace(/^.*~ajay\/?/, ''));
    const url = a === 'outside' || a === 'search' ? 'http://' + window.OLDWEB.shown(b) : a === 'offline' ? 'http://' + b + '/' : a === 'source' ? 'view-source:' + HOST + (b || 'index') + '.html' : a === 'about' ? 'about:surfboard' : HOST + path;
    if (push) { hist = hist.slice(0, hpos + 1); hist.push(raw); hpos = hist.length - 1; }
    back.disabled = hpos <= 0;
    fwd.disabled = hpos >= hist.length - 1;
    loc.value = url;
    titleEl.textContent = 'SurfBoard: ' + pg.title;

    clearInterval(loadT);
    throb.classList.add('is-busy');
    modem.forEach((m, i) => m.classList.toggle('on', i < 2));
    setStatus('Contacting host: www.sommi.net...');
    prog.style.width = '0%';
    page.scrollTop = 0;
    page.innerHTML = pg.html;
    if (pg.full) page.style.overflow = 'hidden'; else page.style.overflow = '';
    let p = 0;
    const steps = ['Host contacted. Waiting for reply...', 'Transferring data...', 'Reading images...', 'Document: Done'];
    loadT = setInterval(() => {
      p += 14 + Math.random() * 20;
      modem[2].classList.toggle('on');
      prog.style.width = Math.min(100, p) + '%';
      setStatus(p >= 100 ? steps[3] : steps[Math.min(2, Math.floor(p / 34))] + ` (${Math.min(99, Math.round(p))}% of ${Math.round(8 + pg.html.length / 1024)}K)`);
      if (p >= 100) {
        clearInterval(loadT);
        throb.classList.remove('is-busy');
        modem.forEach((m, i) => m.classList.toggle('on', i === 0));
        setTimeout(() => { prog.style.width = '0%'; }, 600);
      }
    }, 140);
    wirePage();
    /* Somewhere else on the web: as it was in 1998, through OLDWEB. */
    if (a === 'outside' || a === 'search') window.OLDWEB.open(page.querySelector('.old-frame'), b, 1998, { onNav: (u) => load(u) });
  };
  const outsidePage = () => ({ title: 'Netsite', html: '<iframe class="pdf-frame old-frame" style="width:100%;height:100%;border:0;display:block;background:#fff" title="Web page"></iframe>', full: true });

  const wirePage = () => {
    const form = page.querySelector('[data-gb]');
    if (form) form.addEventListener('submit', (e) => {
      e.preventDefault();
      const n = form.n.value.trim(), c = form.c.value.trim();
      if (!n || !c) return;
      const list = store.get('gb', []);
      list.unshift([n, c, new Date().toLocaleDateString()]);
      store.set('gb', list.slice(0, 10));
      window.EGGS.find('guestbook');
      load('guestbook', false);
    });
  };

  /* -------------------------------------------------------------- menus */

  const MENUS = [
    ['mark', I.pxmark(16), [['About This Computer', () => APPS98.about()], ['About SurfBoard', () => load('about:')], '-', ['Calculator', () => APPS98.calc()], ['Note Pad', () => APPS98.note()], ['Appearance', () => APPS98.appear()], '-', ['Restart in Another Era\u2026', () => api.picker()]]],
    ['file', 'File', [['Open Location…', () => { loc.focus(); loc.select(); }, '⌘L'], ['Print…', () => { setStatus('To print the résumé, open the Résumé page and use Download.'); }, '⌘P']]],
    ['view', 'View', [['Reload', () => load(hist[hpos] || 'index', false), '⌘R'], ['Page Source', () => load('view-source:' + (hist[hpos] || 'index')), '⌘U']]],
    ['go', 'Go', [['Back', () => goBack(), '⌘['], ['Forward', () => goFwd(), '⌘]'], '-', ['Home', () => load('index')], ['Work', () => load('work')], ['Projects', () => load('projects')], ['Guestbook', () => load('guestbook')]]],
    ['special', 'Special', [['Empty Trash…', () => note('Trash', ALERTS.trash, 'trash')], ['Open Macintosh HD', () => folder('hd')], '-', ['Restart in Another Era\u2026', () => api.picker()]]],
    ['bm', 'Bookmarks', [['GitHub', () => window.open(P.github, '_blank', 'noopener')], ['LinkedIn', () => window.open(P.linkedin, '_blank', 'noopener')], ['The Garage', () => load('garage')], ['Résumé', () => load('resume')]]]
  ];

  let openMenu = null;
  const closeMenus = () => { root.querySelectorAll('.nt-drop').forEach((d) => d.remove()); root.querySelectorAll('.nt-menubar .m.is-open').forEach((m) => m.classList.remove('is-open')); openMenu = null; };
  const showMenu = (btn) => {
    closeMenus();
    const def = MENUS.find((m) => m[0] === btn.dataset.m);
    const drop = document.createElement('div');
    drop.className = 'nt-drop';
    def[2].forEach((it) => {
      if (it === '-') { drop.appendChild(document.createElement('hr')); return; }
      let [label, fn, k] = it;
      if (label.startsWith('Easter Eggs')) label = `Easter Eggs found: ${window.EGGS.count()} of ${window.EGGS.total}`;
      const b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = `<span>${esc(label)}</span><span>${k || ''}</span>`;
      if (!fn) b.disabled = true;
      b.addEventListener('click', () => { closeMenus(); fn && fn(); });
      drop.appendChild(b);
    });
    drop.style.left = btn.offsetLeft + 'px';
    root.appendChild(drop);
    btn.classList.add('is-open');
    openMenu = btn;
  };

  const goBack = () => { if (hpos > 0) { hpos--; load(hist[hpos], false); } };
  const goFwd = () => { if (hpos < hist.length - 1) { hpos++; load(hist[hpos], false); } };

  /* ------------------------------------------------------------- toolbar */

  const tb = {
    back: '<path d="M14 5 6 11l8 6" fill="none" stroke="currentColor" stroke-width="2.4"/>',
    fwd: '<path d="M8 5l8 6-8 6" fill="none" stroke="currentColor" stroke-width="2.4"/>',
    reload: '<path d="M17 8a6.5 6.5 0 1 0 1 5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M18 3v6h-6" fill="none" stroke="currentColor" stroke-width="2.2"/>',
    home: '<path d="M3 11 11 4l8 7v8h-5v-5H8v5H3z" fill="currentColor"/>',
    book: '<path d="M4 4h6a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4zM20 4h-6a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h6z" fill="none" stroke="currentColor" stroke-width="2"/>',
    mail: '<path d="M3 6h16v11H3zM3 6l8 6 8-6" fill="none" stroke="currentColor" stroke-width="2"/>',
    src: '<path d="M8 6 3 11l5 5M14 6l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.2"/>'
  };
  const tbtn = (k, label, act) => `<button type="button" class="bev" data-t="${act}"><svg viewBox="0 0 22 22" aria-hidden="true">${tb[k]}</svg>${label}</button>`;

  /* --------------------------------------------------------------- build */

  /* ---------------------------------------------------------- the desk */

  /* What sits on the desk and in its folders. Codes: page: opens a page
     in SurfBoard, win: a folder, app: a program, alert: a note. */
  const DESK = [['globe', 'SurfBoard', 'app:surf'], ['hd', 'Macintosh HD', 'win:hd'], ['folder', 'Documents', 'win:docs'], ['resume', 'Résumé', 'page:resume'], ['book', 'Guestbook', 'page:guestbook'], ['mail', 'E-mail', 'page:contact']];
  const FOLDERS = {
    hd: ['Macintosh HD', [['folder', 'Applications', 'win:apps'], ['folder', 'Documents', 'win:docs'], ['folder', 'System Folder', 'win:sys'], ['globe', 'SurfBoard', 'app:surf']], '4 items · 1.2 GB available'],
    apps: ['Applications', [['globe', 'SurfBoard', 'app:surf'], ['note', 'Note Pad', 'app:note'], ['chip', 'Calculator', 'app:calc'], ['puzzle', 'Appearance', 'app:appear']], '4 items'],
    docs: ['Documents', [['resume', 'Résumé', 'page:resume'], ['doc', 'What’s New ’98', 'page:news'], ['doc', '56K Modem Ad', 'page:shop'], ['folder', 'Projects', 'page:projects'], ['photo', 'Garage Photos', 'page:garage'], ['cap', 'School', 'page:school']], '6 items'],
    sys: ['System Folder', [['mac', 'System', 'alert:sys'], ['app', 'Finder', 'alert:finder'], ['folder', 'Extensions', 'win:ext'], ['puzzle', 'Appearance', 'app:appear']], '4 items'],
    ext: ['Extensions', [['chip', '56K Modem Enabler', 'alert:ext'], ['chip', 'QuickTime™ 3.0', 'alert:ext'], ['chip', 'Portfolio Accelerator', 'alert:ext'], ['chip', 'Nostalgia Driver', 'alert:ext']], '4 items'],
    trash: ['Trash', [], 'empty']
  };
  const ALERTS = {
    sys: 'This is the System file. It is what makes this an Apple-style desk instead of a pile of icons. Best left where it is.',
    finder: 'The Finder is already running. It is the desk you are looking at.',
    ext: 'This extension loaded at start-up. If something goes wrong, restart with Shift held down. (Nothing will go wrong.)',
    trash: 'The Trash is already empty. Nothing ever gets thrown away in this portfolio.'
  };
  const icoBtn = (ic, n, go, cls = 'p8-ico') => `<button type="button" class="${cls}" data-open="${go}"><span>${I.svg(ic, 32)}</span><b>${esc(n)}</b></button>`;

  /* Platinum windows: a title bar to drag them by, a close box on the
     left, a box on the right that rolls the window up into its title. */
  let zTop = 10;
  const wins = {};
  const front = (w) => { w.style.zIndex = ++zTop; root.querySelectorAll('.p8, .br').forEach((x) => x.classList.toggle('is-back', x !== w)); };
  const openWin = (id, title, w, h, html, info) => {
    if (wins[id]) { wins[id].classList.remove('is-closed', 'is-shaded'); front(wins[id]); return wins[id]; }
    const n = Object.keys(wins).length % 6;
    const W = root.clientWidth, H = root.clientHeight;
    const el = document.createElement('div');
    el.className = 'p8 plat';
    w = Math.min(w, W - 24); h = Math.min(h, H - 40);
    el.style.cssText = `left:${Math.max(8, Math.min(W - w - 8, 30 + n * 22))}px;top:${Math.max(30, Math.min(H - h - 8, 40 + n * 20))}px;width:${w}px;height:${h}px`;
    el.innerHTML = `<div class="br-title"><button type="button" class="tb l" data-x aria-label="Close window"></button><span class="ttl">${esc(title)}</span><button type="button" class="tb r" data-shade aria-label="Collapse window"></button></div>${info ? `<div class="p8-info">${info}</div>` : ''}<div class="p8-body bev-in"></div>`;
    root.appendChild(el);
    wins[id] = el;
    front(el);
    el.querySelector('[data-x]').addEventListener('click', () => { window.SFX.click(); el.remove(); delete wins[id]; });
    el.querySelector('[data-shade]').addEventListener('click', () => { window.SFX.click(); el.classList.toggle('is-shaded'); });
    const bar = el.querySelector('.br-title');
    bar.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      e.preventDefault();
      const k = root.getBoundingClientRect().width / root.offsetWidth;
      const sx = e.clientX, sy = e.clientY, ox = el.offsetLeft, oy = el.offsetTop;
      const mv = (ev) => {
        el.style.left = Math.max(-el.offsetWidth + 60, Math.min(root.clientWidth - 40, ox + (ev.clientX - sx) / k)) + 'px';
        el.style.top = Math.max(24, Math.min(root.clientHeight - 20, oy + (ev.clientY - sy) / k)) + 'px';
      };
      const upd = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', upd); };
      addEventListener('pointermove', mv); addEventListener('pointerup', upd);
    });
    const body = el.querySelector('.p8-body');
    body.innerHTML = html;
    return el;
  };
  const folder = (id) => {
    const [t, items, info] = FOLDERS[id];
    openWin('f-' + id, t, 340, 220, items.length ? `<div class="p8-grid">${items.map(([ic, n, go]) => icoBtn(ic, n, go)).join('')}</div>` : '<div class="p8-empty">The Trash is empty.</div>', `<span>${items.length} item${items.length === 1 ? '' : 's'}</span><span>${esc(info === 'empty' ? '' : info.split(' · ')[1] || '')}</span>`);
  };
  const note = (title, text, icon = 'alert') => {
    const el = openWin('a-' + title, title, 320, 150, `<div class="p8-alert">${I.svg(icon, 32)}<p>${esc(text)}</p></div><div class="p8-btns"><button type="button" class="bev ok">OK</button></div>`);
    el.querySelector('.ok').addEventListener('click', () => el.querySelector('[data-x]').click());
    window.SFX.beep();
  };
  const APPS98 = {
    surf: () => { const b = root.querySelector('.br'); b.classList.remove('is-closed', 'is-shaded'); front(b); if (!hist.length) load('index'); },
    note: () => {
      const el = openWin('note', 'Note Pad', 300, 240, `<textarea class="p8-note" spellcheck="false" aria-label="Note Pad"></textarea>`);
      const ta = el.querySelector('textarea');
      if (!ta.value) ta.value = store.get('np98', 'Notes to self, 1998:\n\n- Finish my home page\n- Sign up for more free hours\n- Ask about the 56K modem');
      ta.addEventListener('input', () => store.set('np98', ta.value));
    },
    calc: () => {
      const el = openWin('calc', 'Calculator', 190, 250, `<div class="p8-calc"><div class="d bev-in">0</div>${['C', '=', '/', '*', '7', '8', '9', '-', '4', '5', '6', '+', '1', '2', '3', '.', '0'].map((k) => `<button type="button" class="bev${k === '0' ? ' w' : ''}" data-k="${k}">${k}</button>`).join('')}</div>`);
      const d = el.querySelector('.d');
      let acc = null, op = null, cur = '0', fresh = true;
      const calc = (a, b, o) => (o === '+' ? a + b : o === '-' ? a - b : o === '*' ? a * b : o === '/' ? (b === 0 ? NaN : a / b) : b);
      const show = (v) => { d.textContent = Number.isFinite(+v) ? String(+(+v).toPrecision(10)) : 'Error'; };
      el.querySelector('.p8-calc').addEventListener('click', (e) => {
        const k = e.target.closest('[data-k]');
        if (!k) return;
        window.SFX.key();
        const v = k.dataset.k;
        if (/[0-9.]/.test(v)) { cur = fresh ? (v === '.' ? '0.' : v) : (v === '.' && cur.includes('.') ? cur : cur + v); fresh = false; show(cur); return; }
        if (v === 'C') { acc = null; op = null; cur = '0'; fresh = true; show(cur); return; }
        const n = parseFloat(cur);
        acc = acc == null ? n : (fresh ? acc : calc(acc, n, op));
        op = v === '=' ? null : v; fresh = true; cur = String(acc); show(acc);
        if (v === '=') acc = null;
      });
    },
    appear: () => {
      const C = [['Jelly (picture)', ''], ['Bondi Blue', '#1a8ba3'], ['Grape', '#5d3f8e'], ['Tangerine', '#d9772b'], ['Lime', '#5c9c3a'], ['Strawberry', '#b8405a'], ['Graphite', '#5f6670'], ['Classic', '#3b6ea5']];
      const el = openWin('appear', 'Appearance', 300, 280, `<div class="p8-appear"><p>Desktop colour:</p>${C.map(([n, c]) => `<button type="button" class="bev sw" data-c="${c}"><i style="background:${c || 'url(assets/images/jelly-wallpaper.webp) center / cover'}"></i>${n}</button>`).join('')}</div>`);
      el.querySelector('.p8-appear').addEventListener('click', (e) => { const b = e.target.closest('[data-c]'); if (!b) return; window.SFX.click(); root.style.setProperty('--desk', b.dataset.c); root.classList.toggle('has-color', !!b.dataset.c); store.set('nt-desk-color', b.dataset.c); });
    },
    about: () => {
      openWin('about', 'About This Computer', 360, 180, `<div class="p8-about"><div class="hd">${I.pxmark(40)}<div><b>SommiNet 98</b><span>Built-in memory: 64 MB<br/>Virtual memory: Off<br/>Largest unused block: 41.2 MB</span></div></div><div class="mem"><span>SommiNet 98</span><i style="width:26%"></i><span>16.8 MB</span></div><div class="mem"><span>SurfBoard</span><i style="width:10%"></i><span>6.0 MB</span></div></div>`);
    }
  };
  const act = (code) => {
    const [kind, arg] = code.split(':');
    if (kind === 'page') { APPS98.surf(); load(arg); return; }
    if (kind === 'win') { folder(arg); return; }
    if (kind === 'app') { APPS98[arg](); return; }
    if (kind === 'alert') note(arg === 'ext' ? 'Extension' : arg === 'finder' ? 'Finder' : 'System', ALERTS[arg] || '');
  };

  const build = (scr, deskApi) => {
    api = deskApi;
    root = document.createElement('div');
    root.className = 'nt';
    root.innerHTML = `
      <div class="nt-menubar" role="menubar">
        ${MENUS.map(([k, l]) => `<button type="button" class="m" data-m="${k}" ${k === 'mark' ? 'aria-label="AJ menu"' : ''}>${l}</button>`).join('')}
        <span class="spacer"></span><button type="button" class="m spk" data-spk aria-label="Toggle sound">${window.ICONS.spk(window.SFX.muted)}</button><span class="clock"></span>
      </div>
      <div class="nt-desk">${DESK.map(([ic, n, go]) => icoBtn(ic, n, go, 'nt-ico')).join('')}</div>${icoBtn('trash', 'Trash', 'win:trash', 'nt-ico nt-trash')}
      <div class="br plat">
        <div class="br-title"><button type="button" class="tb l" data-win="close" aria-label="Close window"></button><span class="ttl">SurfBoard</span><button type="button" class="tb r" data-win="shade" aria-label="Collapse window"></button></div>
        <div class="br-tools">
          ${tbtn('back', 'Back', 'back')}${tbtn('fwd', 'Forward', 'fwd')}${tbtn('reload', 'Reload', 'reload')}${tbtn('home', 'Home', 'home')}
          <span class="sep"></span>
          ${tbtn('book', 'Guestbook', 'guestbook')}${tbtn('mail', 'E-mail', 'contact')}${tbtn('src', 'Source', 'source')}
          <div class="throb bev-in" aria-hidden="true">${I.pxmark(28, true)}<i class="star"></i></div>
        </div>
        <form class="br-loc" autocomplete="off"><label for="ntLoc">Location:</label><input id="ntLoc" class="bev-in" type="text" spellcheck="false" autocapitalize="off" /><button type="submit" class="go bev">Go</button></form>
        <div class="br-links">${[['index', 'Home'], ['work', 'Work'], ['projects', 'Projects'], ['garage', 'Garage'], ['skills', 'Skills'], ['school', 'School'], ['guestbook', 'Guestbook'], ['contact', 'E-mail'], ['resume', 'Résumé']].map(([p, l]) => `<button type="button" class="bev" data-go="${p}">${l}</button>`).join('')}</div>
        <div class="br-page bev-in" tabindex="0"></div>
        <div class="br-status"><span class="lock" aria-hidden="true">🔓</span><span class="msg bev-in"></span><span class="modem" title="Modem lights"><i></i><i></i><i></i></span><span class="prog bev-in"><i></i></span></div>
      </div>`;
    scr.appendChild(root);
    page = root.querySelector('.br-page');
    loc = root.querySelector('#ntLoc');
    status = root.querySelector('.br-status .msg');
    prog = root.querySelector('.br-status .prog i');
    throb = root.querySelector('.throb');
    titleEl = root.querySelector('.br-title .ttl');
    modem = [...root.querySelectorAll('.modem i')];
    back = root.querySelector('[data-t="back"]');
    fwd = root.querySelector('[data-t="fwd"]');
    root.querySelector('.br').style.visibility = 'hidden';

    const clock = root.querySelector('.clock');
    const tick = () => { clock.textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); };
    tick(); setInterval(tick, 15000);
    document.addEventListener('sfx-mute', (e) => { root.querySelector('[data-spk]').innerHTML = window.ICONS.spk(e.detail); });

    root.querySelector('.br-loc').addEventListener('submit', (e) => { e.preventDefault(); load(loc.value); page.focus({ preventScroll: true }); });
    loc.addEventListener('focus', () => loc.select());

    root.addEventListener('pointerdown', (e) => {
      const m = e.target.closest('.nt-menubar .m');
      if (m) {
        if (m.hasAttribute('data-spk')) { window.SFX.toggle(); return; }
        e.preventDefault();
        if (openMenu === m) closeMenus(); else showMenu(m);
        return;
      }
      if (openMenu && !e.target.closest('.nt-drop')) closeMenus();
    });
    root.addEventListener('pointerover', (e) => { const m = e.target.closest('.nt-menubar .m'); if (openMenu && m && m !== openMenu && !m.hasAttribute('data-spk')) showMenu(m); });

    /* The browser is a window on a desktop: the left box closes it, the
       right one rolls it up to its title bar; the icons open it again. */
    const win = root.querySelector('.br');
    root.addEventListener('click', (e) => {
      const w = e.target.closest('[data-win]');
      if (w) { window.SFX.click(); if (w.dataset.win === 'close') win.classList.add('is-closed'); else win.classList.toggle('is-shaded'); return; }
      /* Icons, on the desktop or in a folder: a click selects, a double
         click (or Return) opens, as the Finder had it. */
      const o = e.target.closest('[data-open]');
      if (o) {
        const scope = o.parentElement;
        root.querySelectorAll('.nt-ico.on, .p8-ico.on').forEach((x) => { if (x !== o) x.classList.remove('on'); });
        o.classList.add('on');
        if (e.detail === 0 || e.detail === 2) { window.SFX.click(); act(o.dataset.open); }
        void scope;
        return;
      }
      if (e.target === root || e.target.classList.contains('nt-desk')) root.querySelectorAll('.nt-ico.on').forEach((x) => x.classList.remove('on'));
    });
    root.addEventListener('pointerdown', (e) => {
      const w = e.target.closest('.p8, .br');
      if (w) front(w);
    }, true);
    window.RETRO.marquee(root, { isBg: (t) => t === root || t.classList.contains('nt-desk'), items: () => [...root.querySelectorAll('.nt-ico')], sel: 'on', cls: 'sel-98' });
    const deskColor = store.get('nt-desk-color', null);
    if (deskColor) { root.style.setProperty('--desk', deskColor); root.classList.add('has-color'); }
    root.addEventListener('click', (e) => {
      const g = e.target.closest('[data-go]');
      if (g) { e.preventDefault(); window.SFX.click(); load(g.dataset.go); return; }
      const t = e.target.closest('[data-t]');
      if (t) {
        window.SFX.click();
        const a = t.dataset.t;
        if (a === 'back') goBack();
        else if (a === 'fwd') goFwd();
        else if (a === 'reload') load(hist[hpos] || 'index', false);
        else if (a === 'home') load('index');
        else if (a === 'source') load('view-source:' + (hist[hpos] || 'index'));
        else load(a);
        return;
      }
      const r = e.target.closest('[data-ring]');
      if (r) {
        e.preventDefault();
        if (r.dataset.ring === 'prev') api.go(1);
        else if (r.dataset.ring === 'next') {
          setStatus('Following the webring into the future...');
          setTimeout(() => window.open('index.html', '_blank', 'noopener'), 300);
        } else load(['work', 'projects', 'garage', 'skills', 'guestbook'][Math.floor(Math.random() * 5)]);
        return;
      }
      if (e.target.closest('[data-counter]')) {
        window.EGGS.find('counter');
        setStatus('Hit counter: you clicked it. That counts as two visits now.');
        store.set('visits', store.get('visits', 0) + 1);
      }
    });
    page.addEventListener('mouseover', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      const g = a.dataset.go;
      setStatus(g ? HOST + g + '.html' : a.getAttribute('href') || '');
    });

    document.addEventListener('keydown', (e) => {
      if (!root.classList.contains('is-live')) return;
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const k = e.key.toLowerCase();
      if (k === 'l') { e.preventDefault(); loc.focus(); loc.select(); }
      if (k === 'u') { e.preventDefault(); load('view-source:' + (hist[hpos] || 'index')); }
      if (k === '[') { e.preventDefault(); goBack(); }
      if (k === ']') { e.preventDefault(); goFwd(); }
    });
  };

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const boot = async () => {
    const b = document.createElement('div');
    b.className = 'nt-boot';
    b.innerHTML = `<div class="splash"><div class="logo">${I.pxmark(52)}<span>SommiNet 98</span></div><p>Starting up…</p><div class="bar bev-in"><i></i></div></div>`;
    root.appendChild(b);
    window.SFX.chime();
    const bar = b.querySelector('.bar i');
    for (let i = 1; i <= 8; i++) { await wait(150); bar.style.width = i * 12.5 + '%'; }
    await wait(250);
    b.remove();
    root.querySelector('.br').style.visibility = '';
    const d = document.createElement('div');
    d.className = 'dial';
    d.innerHTML = `<div class="t">Connecting to SommiNet</div><div class="b">${I.svg('globe', 32)}<div class="steps"><div>Dialing 555-0198...</div><div>Verifying username...</div><div>Connected at 56,000 bps</div></div></div>`;
    root.appendChild(d);
    window.SFX.modem();
    const st = d.querySelectorAll('.steps div');
    for (let i = 0; i < st.length; i++) { st.forEach((s, k) => s.classList.toggle('on', k === i)); await wait(i === 1 ? 900 : 650); }
    d.remove();
    load('index');
  };

  return {
    build,
    boot,
    enter() { root.classList.add('is-live'); },
    leave() { root.classList.remove('is-live'); closeMenus(); }
  };
})();
