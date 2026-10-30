/* ==========================================================================
   1991: SommiOS 7. A desktop of icons and windows in black and white, with
   a little colour where the hardware allowed it. Double-click to open,
   drag by the title bar, close with the box at the top left. Photos are
   dithered to one bit, the way the screen would have shown them, and can
   be shown in colour on request. Command-F finds anything by typing.
   ========================================================================== */
window.FINDER = (function () {
  const P = window.PORTFOLIO;
  const { esc, ditherAll, dither, usedAt, store } = window.RETRO;
  const I = window.ICONS;
  const touch = matchMedia('(pointer: coarse)').matches;

  let root, deskEl, menubar, api;
  let active = false;
  let z = 20;
  const wins = new Map();
  let selected = null;
  let cascade = 0;

  /* ------------------------------------------------------------- catalog */

  const ITEMS = {
    hd: { name: 'Ajay HD', icon: 'hd', kind: 'disk' },
    readme: { name: 'Read Me First', icon: 'doc', kind: 'document' },
    about: { name: 'About Me', icon: 'person', kind: 'document', keys: 'bio who ajay me' },
    experience: { name: 'Experience', icon: 'folder', kind: 'folder', keys: 'work jobs path career roles' },
    projects: { name: 'Projects', icon: 'folder', kind: 'folder', keys: 'code built apps github' },
    offclock: { name: 'Off the Clock', icon: 'folder', kind: 'folder', keys: 'garage hobbies repairs builds' },
    skills: { name: 'Skills', icon: 'chip', kind: 'control panel', keys: 'stack languages tools tech' },
    education: { name: 'Education', icon: 'cap', kind: 'document', keys: 'school uf university florida degree' },
    recs: { name: 'Guestbook', icon: 'book', kind: 'document', keys: 'recommendations references testimonials refs' },
    contact: { name: 'Contact', icon: 'mail', kind: 'document', keys: 'email hello mail reach linkedin github' },
    resume: { name: 'Resume.pdf', icon: 'resume', kind: 'PDF document', keys: 'cv' },
    internet: { name: 'Internet', icon: 'globe', kind: 'alias', keys: 'web 1998 browser' },
    trash: { name: 'Trash', icon: 'trash', kind: 'trash' },
    system: { name: 'System Folder', icon: 'folder', kind: 'folder' },
    eggs: { name: 'Easter Eggs', icon: 'egg', kind: 'document', keys: 'secrets' },
    computer: { name: 'About This Computer', icon: 'mac', kind: 'desk accessory' },
    puzzle: { name: 'Puzzle', icon: 'puzzle', kind: 'desk accessory', keys: 'game fifteen' },
    notepad: { name: 'Note Pad', icon: 'note', kind: 'desk accessory', keys: 'notes write' },
    scrapbook: { name: 'Scrapbook', icon: 'photo', kind: 'desk accessory', keys: 'photos pictures gallery' },
    oldsite: { name: 'Portfolio (2025)', icon: 'folder', kind: 'folder' },
    bugs: { name: 'bugs.txt', icon: 'doc', kind: 'document' },
    jquery: { name: 'jquery.min.js', icon: 'doc', kind: 'document' },
    dontopen: { name: 'Don’t Open Me', icon: 'app', kind: 'application' }
  };
  ITEMS.papers = { name: 'News & Brochures', icon: 'folder', kind: 'folder', keys: 'news brochure 1991 newsletter papers' };
  ITEMS['paper:news'] = { name: window.PAPERS[1991].news.file, icon: 'doc', kind: 'document', keys: 'news newsletter 1991 system 7 linux web' };
  ITEMS['paper:brochure'] = { name: window.PAPERS[1991].brochure.file, icon: 'doc', kind: 'document', keys: 'brochure sommios 7' };
  P.experience.forEach((e) => { ITEMS['role:' + e.id] = { name: e.short, icon: 'doc', kind: 'document', keys: (e.org + ' ' + e.role + ' ' + e.tags.join(' ')).toLowerCase(), year: e.year }; });
  P.projects.forEach((p) => { ITEMS['project:' + p.id] = { name: p.name, icon: 'app', kind: 'application', keys: (p.full + ' ' + p.stack).toLowerCase() }; });
  P.offclock.forEach((s) => { ITEMS['story:' + s.id] = { name: s.name, icon: 'photo', kind: 'slideshow', keys: s.title.toLowerCase() }; });

  const DESKTOP = ['hd', 'about', 'experience', 'projects', 'offclock', 'skills', 'education', 'recs', 'contact', 'resume', 'readme', 'internet'];

  /* --------------------------------------------------------------- utils */

  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const local = (r) => { const b = root.getBoundingClientRect(); return { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height }; };
  const SW = () => root.clientWidth, SH = () => root.clientHeight;
  const ico = (id, size = 32) => I.svg((ITEMS[id] || {}).icon || 'doc', size);

  /* The outlines that grow from an icon into its window. */
  const zoomRects = (a, b, reverse) => new Promise((resolve) => {
    if (!a || document.documentElement.classList.contains('reduced')) return resolve();
    const steps = 8, els = [];
    for (let i = 1; i <= steps; i++) {
      const t = reverse ? 1 - i / steps : i / steps;
      const r = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, w: a.w + (b.w - a.w) * t, h: a.h + (b.h - a.h) * t };
      const e = h('div', 'zoomrect');
      Object.assign(e.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px', opacity: 0 });
      root.appendChild(e);
      els.push(e);
    }
    els.forEach((e, i) => setTimeout(() => { e.style.opacity = 1; setTimeout(() => e.remove(), 70); }, i * 22));
    setTimeout(resolve, steps * 22 + 30);
  });

  /* -------------------------------------------------------------- windows */

  const front = () => [...wins.values()].sort((a, b) => b.z - a.z)[0];
  const focusWin = (w) => {
    if (!w) return;
    w.z = ++z;
    w.el.style.zIndex = w.z;
    wins.forEach((o) => o.el.classList.toggle('is-front', o === w));
  };

  const openWin = async (id, from) => {
    const spec = SPECS[id] ? SPECS[id]() : null;
    if (!spec) return;
    if (spec.action) { spec.action(); return; }
    if (wins.has(id)) { focusWin(wins.get(id)); return; }
    const w = Math.min(spec.w || 480, SW() - 30);
    const ht = Math.min(spec.h || 420, SH() - 50);
    const n = cascade++ % 8;
    const x = Math.max(10, Math.min(spec.x != null ? spec.x : 60 + n * 26, SW() - w - 10));
    const y = Math.max(32, Math.min(spec.y != null ? spec.y : 48 + n * 24, SH() - ht - 10));
    const el = h('div', 'win' + (spec.cls ? ' ' + spec.cls : ''));
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', spec.title);
    el.innerHTML = `<div class="win-title"><button class="win-box win-close" aria-label="Close window" type="button"></button><span class="win-name">${esc(spec.title)}</span><button class="win-box win-zoom" aria-label="Zoom window" type="button"></button></div>${spec.info ? `<div class="win-info">${spec.info}</div>` : ''}<div class="win-body"></div><div class="win-grow" aria-hidden="true"></div>`;
    Object.assign(el.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: ht + 'px' });
    const body = el.querySelector('.win-body');
    const rec = { id, el, body, z: 0, from, spec, prev: null };
    const iconEl = from || root.querySelector(`.fd-icon[data-id="${CSS.escape(id)}"]`);
    if (iconEl) iconEl.classList.add('is-open');
    await zoomRects(iconEl ? local(iconEl.getBoundingClientRect()) : { x: x + w / 2, y: y + ht / 2, w: 2, h: 2 }, { x, y, w, h: ht });
    root.appendChild(el);
    wins.set(id, rec);
    focusWin(rec);
    spec.render(body, rec);
    ditherAll(body);
    wireWin(rec);
    window.SFX.click();
  };

  const closeWin = async (id) => {
    const w = wins.get(id);
    if (!w) return;
    const r = local(w.el.getBoundingClientRect());
    w.spec.onClose && w.spec.onClose();
    w.el.remove();
    wins.delete(id);
    const iconEl = root.querySelector(`.fd-icon[data-id="${CSS.escape(id)}"]`);
    if (iconEl) iconEl.classList.remove('is-open');
    focusWin(front());
    await zoomRects(r, iconEl ? local(iconEl.getBoundingClientRect()) : { x: r.x + r.w / 2, y: r.y + r.h / 2, w: 2, h: 2 });
  };

  /* Dragging a window moves a dotted outline; the window follows on
     release, as it did when redrawing a whole window was expensive. */
  const outlineDrag = (e, rec, mode) => {
    e.preventDefault();
    const start = local(rec.el.getBoundingClientRect());
    const sx = e.clientX, sy = e.clientY;
    const ghost = h('div', 'zoomrect');
    ghost.style.zIndex = 799;
    let moved = false;
    const place = (r) => Object.assign(ghost.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
    let cur = { ...start };
    const move = (ev) => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (!moved && Math.hypot(dx, dy) < 3) return;
      if (!moved) { moved = true; root.appendChild(ghost); }
      if (mode === 'move') cur = { ...start, x: Math.max(-start.w + 60, Math.min(SW() - 60, start.x + dx)), y: Math.max(25, Math.min(SH() - 22, start.y + dy)) };
      else cur = { ...start, w: Math.max(220, Math.min(SW() - start.x - 2, start.w + dx)), h: Math.max(120, Math.min(SH() - start.y - 2, start.h + dy)) };
      place(cur);
    };
    const up = () => {
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
      if (!moved) return;
      ghost.remove();
      Object.assign(rec.el.style, { left: cur.x + 'px', top: cur.y + 'px', width: cur.w + 'px', height: cur.h + 'px' });
    };
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
  };

  const wireWin = (rec) => {
    const { el } = rec;
    el.addEventListener('pointerdown', () => focusWin(rec), true);
    el.querySelector('.win-close').addEventListener('click', (e) => { e.stopPropagation(); closeWin(rec.id); });
    el.querySelector('.win-zoom').addEventListener('click', (e) => {
      e.stopPropagation();
      if (rec.prev) { Object.assign(el.style, rec.prev); rec.prev = null; }
      else {
        rec.prev = { left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height };
        Object.assign(el.style, { left: '8px', top: '32px', width: SW() - 16 + 'px', height: SH() - 40 + 'px' });
      }
    });
    const title = el.querySelector('.win-title');
    title.addEventListener('pointerdown', (e) => { if (!e.target.closest('.win-box')) outlineDrag(e, rec, 'move'); });
    title.addEventListener('dblclick', (e) => { if (!e.target.closest('.win-box')) el.classList.toggle('is-collapsed'); });
    el.querySelector('.win-grow').addEventListener('pointerdown', (e) => outlineDrag(e, rec, 'size'));
  };

  /* ---------------------------------------------------------------- dialogs */

  const dialog = ({ icon = 'alert', html, buttons = ['OK'], cls = '' }) => new Promise((resolve) => {
    const scrim = h('div', 'dlg-scrim');
    const d = h('div', 'dlg ' + cls);
    d.setAttribute('role', 'alertdialog');
    d.innerHTML = `<div class="dlg-in">${I.svg(icon, 32)}<div class="dlg-txt">${html}<div class="btns"></div></div></div>`;
    const row = d.querySelector('.btns');
    const done = (v) => { scrim.remove(); d.remove(); document.removeEventListener('keydown', key, true); resolve(v); };
    buttons.forEach((b, i) => {
      const btn = h('button', 'btn' + (i === buttons.length - 1 ? ' is-default' : ''), esc(b));
      btn.type = 'button';
      btn.addEventListener('click', () => { window.SFX.click(); done(b); });
      row.appendChild(btn);
    });
    const key = (e) => {
      if (e.key === 'Enter' && !e.target.matches('input')) { e.preventDefault(); e.stopPropagation(); done(buttons[buttons.length - 1]); }
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); done(null); }
    };
    document.addEventListener('keydown', key, true);
    root.appendChild(scrim);
    root.appendChild(d);
    const def = row.lastChild;
    setTimeout(() => (d.querySelector('input') || def).focus({ preventScroll: true }), 30);
  });

  const alert = (html, icon) => { window.SFX.beep(); return dialog({ html, icon }); };

  /* ------------------------------------------------------------- renderers */

  const folderGrid = (ids) => (body) => {
    const g = h('div', 'fd-grid');
    ids.forEach((id) => g.appendChild(iconEl(id)));
    body.appendChild(g);
  };

  const navBtns = (list, i, prefix) => `<div class="btns">${i > 0 ? `<button class="btn" data-open="${prefix}${list[i - 1]}" data-replace>◀ ${esc(ITEMS[prefix + list[i - 1]].name)}</button>` : ''}${i < list.length - 1 ? `<button class="btn" data-open="${prefix}${list[i + 1]}" data-replace>${esc(ITEMS[prefix + list[i + 1]].name)} ▶</button>` : ''}</div>`;

  /* A slideshow of pictures: one bit by default, colour on request. */
  const viewer = (slides, startAt = 0, lede) => (body, rec) => {
    let i = startAt, color = false;
    body.innerHTML = `<div class="viewer">${lede ? `<div class="cap" style="border:0;border-bottom:1px solid #000;font-size:14px">${esc(lede)}</div>` : ''}<div class="stage"><img alt="" /></div><div class="cap"></div><div class="ctl"><button class="btn" data-a="prev" type="button">◀</button><label><input type="checkbox" data-a="color" /> Show in colour</label><span class="n"></span><button class="btn is-default" data-a="next" type="button">▶</button></div></div>`;
    body.style.overflow = 'auto';
    const img = body.querySelector('.stage img');
    const cap = body.querySelector('.cap:not([style])');
    const n = body.querySelector('.n');
    const show = () => {
      const [src, t, d] = slides[i];
      img.alt = t || '';
      cap.innerHTML = `<b>${esc(t || '')}</b> ${esc(d || '')}`;
      n.textContent = `${i + 1} of ${slides.length}`;
      if (color) { img.src = src.replace('-480', '-960').replace('-400', '-800'); img.style.imageRendering = 'auto'; }
      else { img.style.imageRendering = ''; dither(src, 420).then((u) => { if (slides[i][0] === src && !color) img.src = u; }); }
    };
    body.addEventListener('click', (e) => {
      const a = e.target.closest('[data-a]');
      if (!a) return;
      if (a.dataset.a === 'prev') { i = (i - 1 + slides.length) % slides.length; show(); }
      if (a.dataset.a === 'next') { i = (i + 1) % slides.length; show(); }
    });
    body.querySelector('[data-a="color"]').addEventListener('change', (e) => { color = e.target.checked; show(); });
    rec.key = (e) => { if (e.key === 'ArrowLeft') { i = (i - 1 + slides.length) % slides.length; show(); } if (e.key === 'ArrowRight') { i = (i + 1) % slides.length; show(); } };
    show();
  };

  const roleIds = P.experience.map((e) => e.id);
  const projIds = P.projects.map((p) => p.id);

  const SPECS = {
    hd: () => ({
      title: 'Ajay HD', w: 560, h: 380,
      info: `<span>${DESKTOP.length + 1} items</span><span>1.3 MB in disk</span><span>18 MB available</span>`,
      render: folderGrid(['about', 'experience', 'projects', 'offclock', 'skills', 'education', 'recs', 'contact', 'resume', 'papers', 'system'])
    }),
    papers: () => ({ title: 'News & Brochures', w: 380, h: 200, info: '<span>2 items</span><span>from the dealer’s counter</span>', render: folderGrid(['paper:news', 'paper:brochure']) }),
    /* The newsletter as a folded sheet, the brochure as a dealer's leaflet. */
    'paper:news': () => {
      const d = window.PAPERS[1991].news;
      return { title: d.file, w: 470, h: Math.min(520, SH() - 70), render: (b) => { b.innerHTML = `<div class="doc paper"><div class="pp-mast"><h1>${esc(d.title)}</h1><div class="meta">${esc(d.sub)}</div></div>${d.items.map(([h, t]) => `<h3>${esc(h)}</h3><p>${esc(t)}</p>`).join('')}<p class="meta" style="margin-top:14px">${esc(d.foot)}</p></div>`; } };
    },
    'paper:brochure': () => {
      const d = window.PAPERS[1991].brochure;
      return { title: d.file, w: 440, h: Math.min(460, SH() - 70), render: (b) => { b.innerHTML = `<div class="doc paper is-ad"><div class="pp-hero">${I.pxmark(48)}<div><h1>${esc(d.title)}</h1><div class="meta" style="margin:0">${esc(d.sub)}</div></div></div>${d.items.map(([h, t]) => `<div class="pp-row"><b>${esc(h)}</b><span>${esc(t)}</span></div>`).join('')}<p class="meta" style="margin-top:14px;text-align:center">${esc(d.foot)}</p></div>`; } };
    },
    system: () => ({ title: 'System Folder', w: 420, h: 240, info: '<span>4 items</span><span>please don’t touch</span>', render: folderGrid(['eggs', 'computer', 'readme', 'scrapbook']) }),
    readme: () => ({
      title: 'Read Me First', w: 470, h: 430, x: 40, y: 50,
      render: (b) => {
        b.innerHTML = `<div class="doc"><h2>Welcome to SommiOS.</h2>
          <p>This is the portfolio as it would have looked on a desktop in 1991.</p>
          <p>• <b>Double-click</b> any icon to open it.<br/>• Drag windows by their <b>title bars</b>. The box at the top left closes one.<br/>• Press <b>⌘F</b> (or Ctrl+F) and just type what you want to see.<br/>• <b>Special › Restart in Another Era</b> starts up from a different year.<br/>• The newsletter and brochures that came with it are in <b>Ajay HD</b>.</p>
          <p>Some things here are not what they seem. The Trash is a good place to start.</p>
          <div class="btns"><button class="btn is-default" data-open="about">Start with About Me</button><button class="btn" data-open="find">Find…</button></div></div>`;
      }
    }),
    about: () => ({
      title: 'About Me', w: 600, h: 540,
      render: (b) => {
        b.innerHTML = `<div class="doc"><div class="row"><img class="dpic" data-dither="${P.photo}" data-dw="170" width="170" alt="Ajay Sommi outdoors in front of green hills" />
          <div><h1>Ajay Sommi</h1><div class="meta">Software Engineer · ${esc(P.citizen)} · UF Computer Science</div><p>${esc(P.about[0])}</p></div></div>
          <p style="margin-top:14px">${esc(P.about[1])}</p>
          <div class="btns"><button class="btn is-default" data-open="experience">See the work</button><button class="btn" data-open="resume">Resume</button><button class="btn" data-open="contact">Say hello</button></div></div>`;
      }
    }),
    experience: () => ({
      title: 'Experience', w: 620, h: 360,
      info: `<span>${P.experience.length} items</span><span>2019 to 2026</span><span>oldest first</span>`,
      render: (b) => {
        b.innerHTML = `<table class="fd-list"><thead><tr><th class="is-sort">Name</th><th>Role</th><th>Year</th><th>Where</th></tr></thead><tbody>${P.experience.map((e) => `<tr class="row" data-row="role:${e.id}" tabindex="0"><td>${I.svg('doc', 16)}${esc(e.short)}</td><td>${esc(e.role)}</td><td>${e.year}</td><td>${esc(e.where)}</td></tr>`).join('')}</tbody></table>`;
      }
    }),
    projects: () => ({ title: 'Projects', w: 470, h: 300, info: `<span>${P.projects.length} items</span><span>double-click to open</span>`, render: folderGrid(projIds.map((p) => 'project:' + p)) }),
    offclock: () => ({ title: 'Off the Clock', w: 400, h: 230, info: '<span>3 items</span><span>repairs, teardowns, builds</span>', render: folderGrid(P.offclock.map((s) => 'story:' + s.id)) }),
    skills: () => ({
      title: 'Skills', w: 460, h: 470,
      info: '<span class="si">Click a skill to see where it was used</span>',
      render: (b, rec) => {
        b.innerHTML = `<div class="disclose">${P.skills.map(([g, list], k) => `<details ${k === 0 ? 'open' : ''}><summary>${I.svg('folder', 16)}${esc(g)}<span class="n">${list.length}</span></summary><ul>${list.map((s) => `<li><button type="button" data-skill="${esc(s)}">${esc(s)}</button></li>`).join('')}</ul></details>`).join('')}</div>`;
        b.addEventListener('click', (e) => {
          const s = e.target.closest('[data-skill]');
          if (!s) return;
          b.querySelectorAll('[data-skill]').forEach((x) => x.classList.toggle('is-sel', x === s));
          const at = usedAt(s.dataset.skill);
          rec.el.querySelector('.si').textContent = at.length ? `${s.dataset.skill}: used at ${at.join(', ')}` : `${s.dataset.skill}: coursework and side projects`;
        });
      }
    }),
    education: () => ({
      title: 'Education', w: 540, h: 400,
      render: (b) => {
        const e = P.education;
        b.innerHTML = `<div class="doc"><div class="row"><img class="dpic" data-dither="${e.logo}" data-dw="110" width="110" alt="University of Florida" style="border:0" /><div><h2>${esc(e.school)}</h2><div class="meta">${esc(e.degree)} · ${esc(e.college)} · ${esc(e.when)}</div></div></div><p style="margin-top:12px">${esc(e.text)}</p><div class="keys">${e.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div></div>`;
      }
    }),
    recs: () => ({
      title: 'Guestbook', w: 480, h: 520,
      info: `<span>${P.recs.length} entries</span><span>more on LinkedIn</span>`,
      render: (b) => { b.innerHTML = P.recs.map(([n, c, q]) => `<div class="sticky">“${esc(q)}”<b>${esc(n)} · ${esc(c)}</b></div>`).join('') + `<div class="doc" style="padding:12px 16px"><a href="${P.linkedin}" target="_blank" rel="noopener noreferrer">More on LinkedIn →</a></div>`; }
    }),
    contact: () => ({
      title: 'Contact', w: 520, h: 440,
      render: (b) => {
        b.innerHTML = `<div class="doc"><div class="row"><img class="dpic" data-dither="${P.kidPhoto}" data-dw="170" width="170" alt="Ajay as a kid in 2006, at a computer" /><div><h2>Contact</h2><p>Email is the quickest way to reach me.</p><p class="meta">To: ${esc(P.email)}</p></div></div>
          <div class="btns"><a class="btn is-default" href="mailto:${P.email}">Write an email</a><button class="btn" type="button" data-act="copy">Copy address</button></div>
          <div class="btns"><a class="btn" href="${P.github}" target="_blank" rel="noopener noreferrer">GitHub</a><a class="btn" href="${P.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a><button class="btn" type="button" data-open="resume">Resume</button></div></div>`;
      }
    }),
    resume: () => ({
      title: 'Resume.pdf', w: 760, h: SH() - 60, cls: 'is-pdf',
      info: `<span>Ajay Sommi · Resume</span><span><a href="${P.resume}" target="_blank" rel="noopener">Open in a new tab</a> · <a href="${P.resume}" download>Download</a></span>`,
      render: (b) => { b.style.overflow = 'hidden'; b.innerHTML = `<iframe class="pdf-frame" src="${P.resume}#view=FitH" title="Resume"></iframe>`; }
    }),
    internet: () => ({
      action: async () => {
        const r = await dialog({ icon: 'globe', html: '<p><b>The Internet hasn’t reached this desk yet.</b></p><p>It shows up around 1998. Travel there now?</p>', buttons: ['Not yet', 'Travel to 1998'] });
        if (r === 'Travel to 1998') api.go(2);
      }
    }),
    trash: () => {
      window.EGGS.find('trash');
      return { title: 'Trash', w: 440, h: 240, info: '<span>4 items</span><span>none of them can be thrown away</span>', render: folderGrid(['oldsite', 'bugs', 'jquery', 'dontopen']) };
    },
    oldsite: () => ({
      action: async () => {
        const r = await dialog({ icon: 'folder', html: '<p><b>Portfolio (2025)</b> is the modern version of this site: glass, gradients and a scroll.</p><p>Open it in a new window?</p>', buttons: ['Cancel', 'Open'] });
        if (r === 'Open') window.open('index.html', '_blank', 'noopener');
      }
    }),
    bugs: () => ({ title: 'bugs.txt', w: 360, h: 200, render: (b) => { b.innerHTML = '<div class="doc"><p>Known bugs: none listed.</p></div>'; } }),
    jquery: () => ({ title: 'jquery.min.js', w: 380, h: 210, render: (b) => { b.innerHTML = '<div class="doc"><p>Retired with honours from the old site.</p><p class="meta">$(\'thank you\').fadeOut();</p></div>'; } }),
    dontopen: () => ({
      action: async () => {
        window.EGGS.find('bomb');
        window.SFX.error();
        const r = await dialog({ icon: 'bomb', cls: 'bombbox', html: '<p><b>Sorry, a system error occurred.</b></p><p>“Don’t Open Me”<br/>Error type 26: too much curiosity</p><p class="meta">Curiosity is not a bug. But you knew that.</p>', buttons: ['Restart', 'Resume'] });
        if (r === 'Resume') openWin('resume');
        if (r === 'Restart') restart();
      }
    }),
    eggs: () => ({
      title: 'Easter Eggs', w: 440, h: 460,
      info: `<span>${window.EGGS.count()} of ${window.EGGS.total} found</span><span>across every machine</span>`,
      render: (b) => {
        b.innerHTML = `<div class="doc" style="padding:12px 16px">${window.EGGS.list.map(([id, n, d]) => window.EGGS.has(id) ? `<p>★ <b>${esc(n)}</b><br/><span class="meta">${esc(d)}</span></p>` : '<p style="color:#888">☆ ??? <span class="meta">still hidden</span></p>').join('')}</div>`;
      }
    }),
    computer: () => ({
      title: 'About This Computer', w: 500, h: 290,
      render: (b) => {
        b.innerHTML = `<div class="about-mem"><div style="display:flex;gap:14px;align-items:center;margin-bottom:12px">${I.svg('mac', 32)}<div><b style="font-size:17px">SommiOS 7.1</b><br/>© 1991 Sommi Systems.</div></div>
          <div>Total Memory: 4,096K · Largest Unused Block: 0K</div><hr style="border:0;border-top:1px solid #000;margin:8px 0"/>
          <div class="r">${I.svg('person', 16)}<span>Portfolio</span><div class="bar"><i style="width:56%"></i></div></div>
          <div class="r">${I.svg('chip', 16)}<span>Curiosity</span><div class="bar"><i style="width:100%"></i></div></div>
          <div class="r">${I.svg('wrench', 16)}<span>Side projects</span><div class="bar"><i style="width:72%"></i></div></div>
          <div class="r">${I.svg('mac', 16)}<span>System Software</span><div class="bar"><i style="width:18%"></i></div></div></div>`;
      }
    }),
    notepad: () => ({
      title: 'Note Pad', w: 360, h: 300,
      render: (b) => {
        b.style.overflow = 'hidden';
        const t = h('textarea', 'notepad');
        t.setAttribute('aria-label', 'Note Pad');
        t.value = store.get('notepad', 'Notes stay on your computer.\n\nThings to remember:\n- email Ajay\n- ');
        t.addEventListener('input', () => store.set('notepad', t.value));
        b.appendChild(t);
        setTimeout(() => t.focus(), 50);
      }
    }),
    scrapbook: () => {
      const slides = [];
      P.experience.forEach((e) => e.photos.forEach((p) => slides.push([p, e.short + '.', e.role + ', ' + e.when])));
      return { title: 'Scrapbook', w: 560, h: 560, render: viewer(slides) };
    },
    puzzle: () => ({ title: 'Puzzle', w: 340, h: 400, render: puzzle }),
    find: () => ({ action: find })
  };
  P.experience.forEach((e, i) => {
    SPECS['role:' + e.id] = () => ({
      title: e.short, w: 600, h: Math.min(600, SH() - 70),
      render: (b) => {
        b.innerHTML = `<div class="doc"><div class="meta">${e.year} · ${esc(e.when)} · ${esc(e.where)}</div><h1>${esc(e.role)}</h1><h2 style="font-weight:500">${esc(e.org)}</h2><p style="margin-top:12px">${esc(e.text)}</p>
          ${e.stats.length ? `<div class="stats">${e.stats.map(([a, c]) => `<div><b>${esc(a)}</b><span>${esc(c)}</span></div>`).join('')}</div>` : ''}
          <div class="keys">${e.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
          ${e.photos.length ? `<div class="pics">${e.photos.map((p, k) => `<button type="button" data-photo="${e.id}:${k}" aria-label="Open photo ${k + 1}"><img data-dither="${p}" data-dw="128" alt="" /></button>`).join('')}</div>` : ''}
          ${navBtns(roleIds, i, 'role:')}</div>`;
      }
    });
  });
  P.projects.forEach((p, i) => {
    SPECS['project:' + p.id] = () => ({
      title: p.name, w: 500, h: 360,
      render: (b) => {
        b.innerHTML = `<div class="doc"><div style="display:flex;gap:14px;align-items:center">${I.svg('app', 32)}<div><h2>${esc(p.full)}</h2><div class="meta" style="margin:0">${esc(p.kind)} · ${esc(p.stack)}</div></div></div><p style="margin-top:14px">${esc(p.text)}</p>
          <div class="btns">${p.url ? `<a class="btn is-default" href="${p.url}" target="_blank" rel="noopener noreferrer">Open on GitHub</a>` : '<span class="meta">Source is private for now.</span>'}</div>${navBtns(projIds, i, 'project:')}</div>`;
      }
    });
  });
  P.offclock.forEach((s) => {
    SPECS['story:' + s.id] = () => ({ title: s.title, w: 600, h: Math.min(680, SH() - 60), render: viewer(s.steps, 0, s.lede) });
  });

  /* Opening a photo from a role opens it in a slideshow of that role. */
  const openPhoto = (key) => {
    const [rid, k] = key.split(':');
    const e = P.experience.find((x) => x.id === rid);
    const id = 'photo:' + rid;
    SPECS[id] = () => ({ title: e.short + ' photos', w: 560, h: 540, render: viewer(e.photos.map((p, n) => [p, e.short, `Photo ${n + 1} of ${e.photos.length}`]), +k) });
    if (wins.has(id)) closeWin(id).then(() => openWin(id)); else openWin(id);
  };

  /* --------------------------------------------------------------- puzzle */

  function puzzle(b) {
    const N = 4, T = 72;
    b.innerHTML = `<div class="doc" style="padding:10px 14px 4px;text-align:center"><div class="meta" style="margin:0">Put the picture back together.</div></div><div class="puz" style="grid-template-columns:repeat(${N},${T}px)"></div><div class="btns" style="justify-content:center;margin:6px 0 10px"><button class="btn" data-a="mix" type="button">Shuffle</button><label style="font-size:13px"><input type="checkbox" data-a="num" /> Numbers</label></div>`;
    const grid = b.querySelector('.puz');
    let tiles = [...Array(N * N).keys()];
    let url = '';
    const draw = () => {
      grid.innerHTML = '';
      tiles.forEach((t, pos) => {
        const btn = h('button', t === N * N - 1 ? 'gap' : '', t === N * N - 1 ? '' : String(t + 1));
        btn.type = 'button';
        if (t !== N * N - 1 && url) {
          btn.style.backgroundImage = `url(${url})`;
          btn.style.backgroundSize = `${N * T}px ${N * T}px`;
          btn.style.backgroundPosition = `${-(t % N) * T}px ${-Math.floor(t / N) * T}px`;
        }
        btn.addEventListener('click', () => slide(pos));
        grid.appendChild(btn);
      });
    };
    const gapAt = () => tiles.indexOf(N * N - 1);
    const adj = (a, g) => (Math.abs(a - g) === 1 && Math.floor(a / N) === Math.floor(g / N)) || Math.abs(a - g) === N;
    let mixed = false;
    const slide = (pos) => {
      const g = gapAt();
      if (!adj(pos, g)) return;
      [tiles[pos], tiles[g]] = [tiles[g], tiles[pos]];
      window.SFX.click();
      draw();
      if (mixed && tiles.every((t, k) => t === k)) {
        mixed = false;
        window.EGGS.find('puzzle');
        dialog({ icon: 'puzzle', html: '<p><b>Solved.</b></p>' });
      }
    };
    const shuffle = () => {
      for (let k = 0; k < 160; k++) {
        const g = gapAt();
        const opts = [g - 1, g + 1, g - N, g + N].filter((p) => p >= 0 && p < N * N && adj(p, g));
        const p = opts[Math.floor(Math.random() * opts.length)];
        [tiles[p], tiles[g]] = [tiles[g], tiles[p]];
      }
      mixed = true;
      draw();
    };
    b.querySelector('[data-a="mix"]').addEventListener('click', shuffle);
    b.querySelector('[data-a="num"]').addEventListener('change', (e) => grid.classList.toggle('is-num', e.target.checked));
    dither(P.photo, N * T).then((u) => { url = u; shuffle(); });
    draw();
  }

  /* ----------------------------------------------------------------- find */

  async function find() {
    if (root.querySelector('.dlg')) return;
    const scrim = h('div', 'dlg-scrim');
    const d = h('div', 'dlg');
    d.innerHTML = `<div class="dlg-in" style="flex-direction:column;gap:8px;min-width:360px"><div style="display:flex;gap:10px;align-items:center">${I.svg('hd', 32)}<b>Find what you want to see</b></div><input type="text" aria-label="Find" placeholder="try: toyota, projects, resume, c#" /><div class="find-res" role="listbox"></div><div class="btns" style="justify-content:flex-end;margin-top:4px"><button class="btn" data-a="x" type="button">Cancel</button><button class="btn is-default" data-a="go" type="button">Open</button></div></div>`;
    root.appendChild(scrim);
    root.appendChild(d);
    const inp = d.querySelector('input');
    const res = d.querySelector('.find-res');
    let hits = [], k = 0;
    const close = () => { scrim.remove(); d.remove(); };
    const search = () => {
      const q = inp.value.trim().toLowerCase();
      const all = Object.keys(SPECS).filter((id) => ITEMS[id] && !['oldsite', 'bugs', 'jquery', 'dontopen', 'trash', 'system', 'hd'].includes(id));
      hits = q ? all.filter((id) => (ITEMS[id].name + ' ' + (ITEMS[id].keys || '')).toLowerCase().includes(q)) : [];
      if (q && !hits.length) {
        const sk = P.skills.flatMap((s) => s[1]).find((s) => s.toLowerCase().includes(q));
        if (sk) hits = P.experience.filter((e) => usedAt(sk).includes(e.short)).map((e) => 'role:' + e.id);
        if (!hits.length && sk) hits = ['skills'];
      }
      k = 0;
      res.innerHTML = hits.slice(0, 8).map((id, n) => `<button type="button" data-id="${id}" class="${n === 0 ? 'is-sel' : ''}">${ico(id, 16)}${esc(ITEMS[id].name)}<span style="margin-left:auto;opacity:.6">${esc(ITEMS[id].kind)}</span></button>`).join('') || (q ? '<div class="meta" style="padding:4px 6px">Nothing by that name. Try a company, a skill or a section.</div>' : '');
    };
    const go = (id) => { if (!id) return; close(); openWin(id); };
    inp.addEventListener('input', search);
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); go(hits[k]); }
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        k = Math.max(0, Math.min(Math.min(hits.length, 8) - 1, k + (e.key === 'ArrowDown' ? 1 : -1)));
        res.querySelectorAll('button').forEach((b, n) => b.classList.toggle('is-sel', n === k));
      }
    });
    res.addEventListener('click', (e) => { const b = e.target.closest('[data-id]'); if (b) go(b.dataset.id); });
    d.querySelector('[data-a="x"]').addEventListener('click', close);
    d.querySelector('[data-a="go"]').addEventListener('click', () => go(hits[k]));
    setTimeout(() => inp.focus(), 30);
  }

  /* ----------------------------------------------------------------- icons */

  function iconEl(id) {
    const it = ITEMS[id];
    const b = h('button', 'fd-icon', `${I.svg(id === 'trash' && window.EGGS.has('trash') ? 'trashFull' : it.icon, 32)}<span class="lbl">${esc(it.name)}</span>`);
    b.type = 'button';
    b.dataset.id = id;
    b.setAttribute('aria-label', `${it.name}, ${it.kind}`);
    if (wins.has(id)) b.classList.add('is-open');
    return b;
  }

  const select = (el) => {
    root.querySelectorAll('.fd-icon.is-sel, tr.row.is-sel').forEach((x) => x !== el && x.classList.remove('is-sel'));
    selected = el || null;
    if (el) el.classList.add('is-sel');
  };

  const positions = () => store.get('icons', {});
  const layoutIcons = () => {
    deskEl.innerHTML = '';
    const saved = positions();
    /* Columns from the right edge. Only the first keeps room at its foot
       for the Trash; on a small screen the spacing tightens, a step at a
       time, until every icon is on the screen. */
    const H = SH() - 25, W = SW();
    const cap = (c, rowH) => Math.max(1, Math.floor((H - (c === 0 ? 96 : 14)) / rowH));
    const cols = (rowH) => { let n = DESKTOP.length, c = 0; while (n > 0) { n -= cap(c, rowH); c++; } return c; };
    let colW = 104, rowH = 74;
    for (const [cw, rh] of [[104, 74], [96, 68], [88, 64], [82, 60], [76, 58]]) { colW = cw; rowH = rh; if (112 + (cols(rh) - 1) * cw <= W) break; }
    let col = 0, row = 0;
    DESKTOP.forEach((id) => {
      if (row >= cap(col, rowH)) { col++; row = 0; }
      const el = iconEl(id);
      let x = W - 112 - col * colW, y = 10 + row * rowH;
      row++;
      if (saved[id]) { x = Math.min(saved[id][0], SW() - 100); y = Math.min(saved[id][1], SH() - 100); }
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      deskEl.appendChild(el);
    });
    const tr = iconEl('trash');
    tr.style.left = SW() - 112 + 'px';
    tr.style.top = SH() - 25 - 86 + 'px';
    deskEl.appendChild(tr);
  };

  /* Icons on the desktop can be dragged around, and onto the Trash. */
  const iconDrag = (e, el) => {
    if (!el.parentElement || el.parentElement !== deskEl) return;
    const sx = e.clientX, sy = e.clientY;
    const start = { x: parseFloat(el.style.left), y: parseFloat(el.style.top) };
    let ghost = null;
    const trash = deskEl.querySelector('[data-id="trash"]');
    const overTrash = (ev) => { const r = trash.getBoundingClientRect(); return ev.clientX > r.left && ev.clientX < r.right && ev.clientY > r.top && ev.clientY < r.bottom; };
    const move = (ev) => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (!ghost && Math.hypot(dx, dy) < 5) return;
      if (!ghost) { ghost = el.cloneNode(true); ghost.classList.add('fd-ghost'); deskEl.appendChild(ghost); }
      ghost.style.left = start.x + dx + 'px';
      ghost.style.top = start.y + dy + 'px';
      trash.classList.toggle('is-drop', el !== trash && overTrash(ev));
    };
    const up = async (ev) => {
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
      if (!ghost) return;
      ghost.remove();
      trash.classList.remove('is-drop');
      const id = el.dataset.id;
      if (el !== trash && overTrash(ev)) {
        if (id === 'resume') { window.EGGS.find('keepresume'); await dialog({ icon: 'resume', html: '<p><b>Are you sure?</b></p><p>Recruiters love this one. It’s staying right where it is.</p>', buttons: ['Keep It'] }); }
        else await alert(`<p>“${esc(ITEMS[id].name)}” can’t be thrown away.</p><p>It’s part of the portfolio.</p>`);
        return;
      }
      const x = Math.max(0, Math.min(SW() - 100, Math.round((start.x + ev.clientX - sx) / 8) * 8));
      const y = Math.max(0, Math.min(SH() - 110, Math.round((start.y + ev.clientY - sy) / 8) * 8));
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      if (id !== 'trash') { const p = positions(); p[id] = [x, y]; store.set('icons', p); }
    };
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
  };

  /* ------------------------------------------------------------------ menus */

  const PATTERNS = [['violet', 'Twilight'], ['classic', 'Classic Grey'], ['teal', 'Lagoon'], ['dune', 'Dune'], ['bricks', 'Bricks'], ['weave', 'Weave']];
  const MENUS = () => [
    ['mark', I.pxmark(16), [
      ['About This Computer…', () => openWin('computer')],
      ['Easter Eggs…', () => openWin('eggs'), `${window.EGGS.count()}/${window.EGGS.total}`],
      '-',
      ['Note Pad', () => openWin('notepad')],
      ['Puzzle', () => openWin('puzzle')],
      ['Scrapbook', () => openWin('scrapbook')],
      '-',
      ['Restart in Another Era\u2026', () => api.picker()]
    ]],
    ['file', 'File', [
      ['New Folder', null, '⌘N'],
      ['Open', () => selected && openSel(), '⌘O'],
      ['Close Window', () => { const f = front(); f && closeWin(f.id); }, '⌘W'],
      '-',
      ['Get Info', () => selected && info(selected.dataset.id || selected.dataset.row), '⌘I'],
      ['Find…', find, '⌘F'],
      '-',
      ['Print…', () => alert('<p><b>No printer is connected.</b></p><p>It’s 1991. Try the resume’s Download link instead.</p>'), '⌘P'],
      '-',
      ['Shut Down', shutdown]
    ]],
    ['edit', 'Edit', [
      ['Undo', null, '⌘Z'],
      '-',
      ['Cut', null, '⌘X'], ['Copy', null, '⌘C'], ['Paste', null, '⌘V'],
      '-',
      ['Copy Email Address', copyEmail]
    ]],
    ['view', 'View', PATTERNS.map(([k, n]) => [`Pattern: ${n}`, () => setPattern(k), '', root.dataset.pat === k])],
    ['special', 'Special', [
      ['Clean Up Desktop', () => { store.set('icons', {}); layoutIcons(); }],
      ['Empty Trash…', () => alert('<p>The Trash contains 4 items that can’t be thrown away.</p><p>They’re load-bearing.</p>')],
      '-',
      ['Restart', restart],
      ['Restart in Another Era\u2026', () => api.picker()],
      ['Shut Down', shutdown]
    ]]
  ];

  let openMenu = null;
  const closeMenus = () => {
    root.querySelectorAll('.fd-drop').forEach((d) => d.remove());
    menubar.querySelectorAll('.m.is-open').forEach((m) => m.classList.remove('is-open'));
    openMenu = null;
  };
  const showMenu = (btn) => {
    closeMenus();
    const def = MENUS().find((m) => m[0] === btn.dataset.m);
    const drop = h('div', 'fd-drop');
    drop.setAttribute('role', 'menu');
    def[2].forEach((it) => {
      if (it === '-') { drop.appendChild(h('hr')); return; }
      const [label, fn, k, checked] = it;
      const b = h('button', checked ? 'is-checked' : '', `<span>${esc(label)}</span><span class="k">${k || ''}</span>`);
      b.type = 'button';
      b.setAttribute('role', 'menuitem');
      if (!fn) b.disabled = true;
      b.addEventListener('click', () => { closeMenus(); window.SFX.click(); fn && fn(); });
      drop.appendChild(b);
    });
    drop.style.left = btn.offsetLeft + 'px';
    root.appendChild(drop);
    btn.classList.add('is-open');
    openMenu = btn;
  };

  const setPattern = (k) => { root.dataset.pat = k; store.set('pattern', k); window.EGGS.find('pattern'); };
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(P.email); } catch (e) {}
    dialog({ icon: 'mail', html: `<p>Copied <b>${esc(P.email)}</b> to the Clipboard.</p>` });
  };
  const info = (id) => {
    if (!id || !ITEMS[id]) return;
    const it = ITEMS[id];
    const wid = 'info:' + id;
    SPECS[wid] = () => ({ title: `${it.name} Info`, w: 340, h: 280, render: (b) => { b.innerHTML = `<div class="doc" style="font-size:14px"><div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">${ico(id, 32)}<b style="font-family:var(--pixel);font-size:16px">${esc(it.name)}</b></div><p><b>Kind:</b> ${esc(it.kind)}<br/><b>Where:</b> Ajay HD<br/><b>Created:</b> ${it.year || 1991}<br/><b>Size:</b> ${(it.name.length * 37) % 900 + 12}K on disk</p><p class="meta">Comments: handle with curiosity.</p></div>`; } });
    openWin(wid);
  };

  /* ---------------------------------------------------------- boot and power */

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* Switched on with no disk in the drive, the Macintosh shows a disk
     with a question mark, blinking, until one goes in. */
  const NODISK = (() => {
    const q = ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..'];
    let px = '';
    q.forEach((r, y) => [...r].forEach((c, x) => { if (c === '#') px += `<rect x="${11 + x * 2}" y="${14 + y * 2}" width="2" height="2"/>`; }));
    return `<svg viewBox="0 0 32 32" shape-rendering="crispEdges" aria-hidden="true"><path d="M4 3h22l3 3v23H4z" fill="#fff" stroke="#000" stroke-width="1"/><rect x="9.5" y="3.5" width="13" height="8" fill="#fff" stroke="#000"/><rect x="18" y="5" width="3" height="5" fill="#000"/><g class="q" fill="#000">${px}</g></svg>`;
  })();
  async function bootSeq(first) {
    if (first && api && api.disk) {
      const nd = h('div', 'fd-boot fd-nodisk', `<div class="nodisk">${NODISK}</div>`);
      root.appendChild(nd);
      await api.disk();
      await wait(700);
      nd.remove();
    }
    const b = h('div', 'fd-boot');
    b.innerHTML = `<div class="hello">${I.pxmark(64)}</div>`;
    root.appendChild(b);
    window.SFX.chime();
    await wait(1100);
    b.innerHTML = '<div class="welcome"><div><h2>Welcome to SommiOS</h2><div class="bar"><i></i></div></div></div><div class="ext"></div>';
    const bar = b.querySelector('.bar i');
    const ext = b.querySelector('.ext');
    const marching = ['floppy', 'chip', 'note', 'puzzle', 'mail', 'book', 'photo', 'globe', 'cap', 'wrench'];
    for (let i = 0; i < marching.length; i++) {
      await wait(130);
      const s = h('span', '', I.svg(marching[i], 32));
      ext.appendChild(s);
      bar.style.width = ((i + 1) / marching.length) * 100 + '%';
    }
    await wait(350);
    b.remove();
  }

  async function drawDesktop() {
    layoutIcons();
    menubar.hidden = false;
    if (!store.get('saw-readme', false)) { store.set('saw-readme', true); await wait(250); openWin('readme'); }
  }

  async function restart() {
    [...wins.keys()].forEach((id) => { wins.get(id).el.remove(); wins.delete(id); });
    deskEl.innerHTML = '';
    menubar.hidden = true;
    root.querySelectorAll('.dlg, .dlg-scrim, .fd-shutdown').forEach((x) => x.remove());
    await bootSeq();
    await drawDesktop();
  }

  async function shutdown() {
    const s = h('div', 'fd-shutdown', `<div class="dlg"><div class="dlg-in">${I.svg('mac', 32)}<div class="dlg-txt"><p>It is now safe to switch off your portfolio.</p><p class="meta" style="color:#555">Or start up from another era.</p><div class="btns"><button class="btn" type="button" data-a="fw">Another era</button><button class="btn is-default" type="button" data-a="r">Restart</button></div></div></div></div>`);
    root.appendChild(s);
    s.querySelector('[data-a="r"]').addEventListener('click', restart);
    s.querySelector('[data-a="fw"]').addEventListener('click', () => { s.remove(); api.picker(); });
  }

  /* --------------------------------------------------------------- wiring */

  const openSel = () => {
    if (!selected) return;
    const id = selected.dataset.id || selected.dataset.row;
    if (id) openWin(id, selected.dataset.id ? selected : null);
  };

  const replaceWin = (fromEl, id) => {
    const w = fromEl.closest('.win');
    const rec = w && [...wins.values()].find((r) => r.el === w);
    const pos = rec ? { left: w.style.left, top: w.style.top } : null;
    if (rec) { rec.el.remove(); wins.delete(rec.id); }
    openWin(id).then(() => { const n = wins.get(id); if (n && pos) Object.assign(n.el.style, pos); });
  };

  function build(scr, deskApi) {
    api = deskApi;
    root = h('div', 'fd');
    root.dataset.pat = store.get('pattern', 'violet');
    root.innerHTML = '<div class="fd-corners"></div>';
    menubar = h('div', 'fd-menubar');
    menubar.setAttribute('role', 'menubar');
    menubar.hidden = true;
    MENUS().forEach(([k, label]) => {
      const b = h('button', 'm', label);
      b.type = 'button';
      b.dataset.m = k;
      if (k === 'mark') b.setAttribute('aria-label', 'AJ menu');
      menubar.appendChild(b);
    });
    menubar.insertAdjacentHTML('beforeend', `<span class="spacer"></span><button class="m spk" type="button" data-spk aria-label="Toggle sound">${window.SFX.muted ? '🔇' : '🔈'}</button><span class="clock"></span>`);
    root.appendChild(menubar);
    deskEl = h('div', 'fd-desk');
    root.appendChild(deskEl);
    window.RETRO.marquee(deskEl, { isBg: (t) => t === deskEl, items: () => [...deskEl.querySelectorAll('.fd-icon')], sel: 'is-sel', cls: 'sel-91' });
    scr.appendChild(root);

    const clock = menubar.querySelector('.clock');
    const tick = () => { clock.textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); };
    tick(); setInterval(tick, 15000);
    document.addEventListener('sfx-mute', (e) => { menubar.querySelector('[data-spk]').textContent = e.detail ? '🔇' : '🔈'; });

    menubar.addEventListener('pointerdown', (e) => {
      const b = e.target.closest('.m');
      if (!b) return;
      if (b.hasAttribute('data-spk')) { window.SFX.toggle(); return; }
      e.preventDefault();
      if (openMenu === b) closeMenus(); else showMenu(b);
    });
    menubar.addEventListener('pointerover', (e) => { const b = e.target.closest('.m'); if (openMenu && b && b !== openMenu && !b.hasAttribute('data-spk')) showMenu(b); });
    menubar.addEventListener('keydown', (e) => { const b = e.target.closest('.m'); if (b && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) { e.preventDefault(); if (b.hasAttribute('data-spk')) window.SFX.toggle(); else { showMenu(b); const f = root.querySelector('.fd-drop button:not([disabled])'); f && f.focus(); } } });

    root.addEventListener('pointerdown', (e) => {
      if (openMenu && !e.target.closest('.fd-drop') && !e.target.closest('.fd-menubar')) closeMenus();
      const ic = e.target.closest('.fd-icon');
      const row = e.target.closest('tr.row');
      if (ic) { select(ic); iconDrag(e, ic); }
      else if (row) select(row);
      else if (!e.target.closest('.win') && !e.target.closest('.dlg')) select(null);
    });
    root.addEventListener('dblclick', (e) => {
      const ic = e.target.closest('.fd-icon');
      const row = e.target.closest('tr.row');
      if (ic) openWin(ic.dataset.id, ic);
      else if (row) openWin(row.dataset.row);
    });
    root.addEventListener('click', (e) => {
      const o = e.target.closest('[data-open]');
      if (o) {
        if (o.hasAttribute('data-replace')) replaceWin(o, o.dataset.open);
        else openWin(o.dataset.open);
        return;
      }
      const ph = e.target.closest('[data-photo]');
      if (ph) { openPhoto(ph.dataset.photo); return; }
      const c = e.target.closest('[data-act="copy"]');
      if (c) { copyEmail(); return; }
      /* Touch has no double-click worth relying on: one tap opens. */
      if (touch || e.detail === 0) {
        const ic = e.target.closest('.fd-icon');
        const row = e.target.closest('tr.row');
        if (ic && (touch || e.detail === 0)) openWin(ic.dataset.id, ic);
        else if (row && touch) openWin(row.dataset.row);
      }
    });
    root.addEventListener('keydown', (e) => {
      const row = e.target.closest('tr.row');
      if (row && e.key === 'Enter') openWin(row.dataset.row);
    });

    /* Keyboard, the Finder's way: shortcuts with Command (or Ctrl), and
       typing a name selects the icon that starts with it. */
    let typed = '', typedT = 0;
    document.addEventListener('keydown', (e) => {
      if (!active) return;
      if (e.target.closest && e.target.closest('input, textarea, [contenteditable]')) return;
      if (root.querySelector('.dlg')) return;
      const mod = e.metaKey || e.ctrlKey;
      const k = e.key.toLowerCase();
      if (mod && k === 'f') { e.preventDefault(); find(); return; }
      if (mod && k === 'w') { e.preventDefault(); const f = front(); f && closeWin(f.id); return; }
      if (mod && k === 'o') { e.preventDefault(); openSel(); return; }
      if (mod && k === 'i') { e.preventDefault(); selected && info(selected.dataset.id || selected.dataset.row); return; }
      if (mod && k === 'p') { e.preventDefault(); alert('<p><b>No printer is connected.</b></p><p>It’s 1991. Try the resume’s Download link instead.</p>'); return; }
      if (e.key === 'Escape') { closeMenus(); return; }
      const f = front();
      if (f && f.key && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { f.key(e); return; }
      if (e.key === 'Enter') { openSel(); return; }
      if (!mod && e.key.length === 1 && /\S/.test(e.key)) {
        clearTimeout(typedT);
        typed += k;
        typedT = setTimeout(() => { typed = ''; }, 900);
        const hit = [...deskEl.querySelectorAll('.fd-icon')].find((x) => ITEMS[x.dataset.id].name.toLowerCase().startsWith(typed));
        if (hit) { select(hit); hit.focus({ preventScroll: true }); }
      }
    });
  }

  return {
    build,
    async boot() { await bootSeq(true); await drawDesktop(); },
    enter() { active = true; },
    leave() { active = false; closeMenus(); },
    resize() { if (!menubar.hidden) layoutIcons(); }
  };
})();
