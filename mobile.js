/* ==========================================================================
   PHONES: what the phone layout does (see mobile.css). Five tabs that follow
   a swipe, rows that open into sheets you can drag away, the off the clock
   stories in a full screen viewer, a deck of kind words to flick, and a
   few small pleasures: the portrait turns over to 2006, the email copies
   with a tap. The desktop's own links, menu and search keep working: when
   they would scroll to a desktop section, the matching tab opens instead.
   ========================================================================== */
(() => {
  'use strict';
  const mx = document.getElementById('mx');
  if (!mx) return;
  const phone = matchMedia('(max-width: 719px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const buzz = (ms = 8) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };

  /* ------------------------------------------------------------ hello */
  const g = $('[data-mx-greeting]', mx);
  if (g) { const h = new Date().getHours(); g.textContent = h >= 5 && h < 12 ? 'Good morning' : h >= 12 && h < 18 ? 'Good afternoon' : 'Good evening'; }

  // The mark: leans toward a finger resting on it, and a tap knocks its
  // pieces apart for a moment.
  const mark = $('.mx-mark', mx), aj = mark && $('.mx-aj', mark);
  if (mark && aj) {
    const tilt = (e) => {
      const r = mark.getBoundingClientRect();
      const x = clamp((e.clientX - r.left) / r.width - 0.5, -0.8, 0.8), y = clamp((e.clientY - r.top) / r.height - 0.5, -0.8, 0.8);
      aj.style.setProperty('--ry', (x * 40).toFixed(1) + 'deg'); aj.style.setProperty('--rx', (-y * 40).toFixed(1) + 'deg');
    };
    const rest = () => { mark.classList.remove('held'); aj.style.setProperty('--rx', '0deg'); aj.style.setProperty('--ry', '0deg'); };
    mark.addEventListener('pointerdown', (e) => { mark.classList.add('held'); tilt(e); try { mark.setPointerCapture(e.pointerId); } catch (err) {} });
    mark.addEventListener('pointermove', (e) => { if (mark.classList.contains('held')) tilt(e); });
    mark.addEventListener('pointerup', rest); mark.addEventListener('pointercancel', rest);
    mark.addEventListener('click', () => {
      mark.classList.add('pop'); buzz(10);
      setTimeout(() => mark.classList.remove('pop'), 190);
    });
  }
  // "Take a look" glides down to the tabs.
  const down = $('.mx-down', mx);
  if (down) down.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); window.scrollTo({ top: $('.mx-tabs', mx).getBoundingClientRect().top + scrollY, behavior: reduced ? 'auto' : 'smooth' }); });

  /* ------------------------------------------------------------- tabs */
  const tabs = $('.mx-tabs', mx), pager = $('.mx-pager', mx), ink = $('.mx-ink', tabs);
  const btns = $$('[role="tab"]', tabs), panels = $$('.mx-panel', pager);
  let cur = 0;
  const W = () => pager.clientWidth || 1;
  // Each list's items know their place, so they can arrive in order.
  panels.forEach((p) => ['.mx-tl > li', '.mx-projs > li', '.mx-story-b'].forEach((q) => $$(q, p).forEach((el, k) => el.style.setProperty('--k', Math.min(k, 8)))));
  const enter = (p) => {
    if (reduced || !p) return;
    p.classList.remove('enter'); void p.offsetWidth; p.classList.add('enter');
    clearTimeout(p._e); p._e = setTimeout(() => p.classList.remove('enter'), 1200);
  };
  const fit = () => { const p = panels[cur]; if (p) pager.style.height = p.offsetHeight + 'px'; };
  const placeInk = (f) => {
    const i = clamp(Math.floor(f), 0, btns.length - 1), j = clamp(i + 1, 0, btns.length - 1), t = f - i;
    const a = btns[i], b = btns[j];
    const x = a.offsetLeft + (b.offsetLeft - a.offsetLeft) * t, w = a.offsetWidth + (b.offsetWidth - a.offsetWidth) * t;
    const iw = Math.min(40, w * 0.5);
    ink.style.width = iw + 'px';
    ink.style.transform = `translateX(${(x + (w - iw) / 2).toFixed(1)}px)`;
  };
  const select = (i) => {
    if (i === cur) return;
    cur = i;
    btns.forEach((b, k) => b.setAttribute('aria-selected', String(k === i)));
    panels.forEach((p, k) => { p.inert = k !== i; });
    enter(panels[i]);
    fit();
  };
  let sraf = 0;
  pager.addEventListener('scroll', () => {
    cancelAnimationFrame(sraf);
    sraf = requestAnimationFrame(() => { const f = pager.scrollLeft / W(); placeInk(f); select(Math.round(f)); });
  }, { passive: true });
  const go = (i, smooth = true) => {
    tabs.classList.add('jump'); setTimeout(() => tabs.classList.remove('jump'), 460);
    // From deep in a long panel, come back up to the tabs first.
    const top = tabs.getBoundingClientRect().top;
    if (top <= 1) window.scrollTo({ top: tabs.offsetTop + mx.offsetTop - 0, behavior: reduced ? 'auto' : 'smooth' });
    pager.scrollTo({ left: i * W(), behavior: smooth && !reduced ? 'smooth' : 'auto' });
    placeInk(i); select(i);
  };
  btns.forEach((b, i) => b.addEventListener('click', () => go(i)));
  panels.forEach((p, k) => { p.inert = k !== 0; });
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(pager), panels.forEach((p) => new ResizeObserver(() => { if (p === panels[cur]) fit(); }).observe(p));
  addEventListener('resize', () => { pager.scrollLeft = cur * W(); placeInk(cur); fit(); });
  requestAnimationFrame(() => { placeInk(0); fit(); });

  /* Bring a tab into view from anywhere: scrolled to, then switched. */
  const TAB = { experience: 0, education: 0, projects: 1, offclock: 2, skills: 3, recs: 4 };
  const show = (key) => {
    if (key === 'top') { window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); return; }
    if (key === 'contact') { const c = $('#m-contact', mx); window.scrollTo({ top: c.getBoundingClientRect().top + scrollY - 20, behavior: reduced ? 'auto' : 'smooth' }); return; }
    if (!(key in TAB)) return;
    window.scrollTo({ top: tabs.offsetTop + mx.offsetTop, behavior: reduced ? 'auto' : 'smooth' });
    pager.scrollTo({ left: TAB[key] * W(), behavior: reduced ? 'auto' : 'smooth' });
    placeInk(TAB[key]); select(TAB[key]);
  };
  // The desktop's links, menu and search scroll to desktop sections; on a
  // phone those are put away, so they come here instead.
  const into = Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView = function (o) {
    if (phone.matches && this.id && (this.id in TAB || this.id === 'contact' || this.id === 'top') && !mx.contains(this)) { show(this.id); return; }
    return into.call(this, o);
  };
  $$('[data-mx-go]', mx).forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); show(a.dataset.mxGo); }));

  /* ------------------------------------------------------------ sheet */
  /* Slides up with a role or a project. Drag it down by the handle (or by
     the content, once that is scrolled to the top) and it goes away. */
  const scrim = $('.mx-scrim'), sheet = $('.mx-sheet'), sheetIn = sheet && $('.mx-sheet-in', sheet);
  let opener = null;
  const lock = (on) => document.documentElement.classList.toggle('mx-lock', on);
  const openSheet = (id, from) => {
    const t = document.getElementById(id);
    if (!t || !sheet) return;
    opener = from;
    sheetIn.innerHTML = '';
    sheetIn.appendChild(t.content.cloneNode(true));
    sheetIn.scrollTop = 0;
    scrim.hidden = false; sheet.hidden = false; lock(true);
    requestAnimationFrame(() => requestAnimationFrame(() => { scrim.classList.add('open'); sheet.classList.add('open'); }));
  };
  const closeSheet = () => {
    if (!sheet || sheet.hidden) return;
    sheet.classList.remove('open', 'drag'); sheet.style.transform = ''; scrim.classList.remove('open'); lock(false);
    setTimeout(() => { sheet.hidden = true; scrim.hidden = true; }, reduced ? 0 : 420);
    if (opener && opener.focus) opener.focus({ preventScroll: true });
  };
  $$('[data-sheet]:not(.mx-chip)', mx).forEach((b) => b.addEventListener('click', () => openSheet(b.dataset.sheet, b)));
  if (scrim) scrim.addEventListener('click', closeSheet);
  if (sheet) {
    let d = null;
    sheet.addEventListener('pointerdown', (e) => {
      const onGrab = e.target.closest('.mx-grab');
      if (!onGrab && (sheetIn.scrollTop > 0 || e.target.closest('.mxs-pics'))) return;
      d = { y: e.clientY, id: e.pointerId, t: performance.now(), dy: 0, on: false, grab: !!onGrab };
    });
    sheet.addEventListener('pointermove', (e) => {
      if (!d || e.pointerId !== d.id) return;
      d.dy = e.clientY - d.y;
      if (!d.on && (d.grab || d.dy > 8) && d.dy > 0) { d.on = true; sheet.classList.add('drag'); try { sheet.setPointerCapture(d.id); } catch (err) {} }
      if (d.on) sheet.style.transform = `translateY(${Math.max(0, d.dy)}px)`;
    });
    const end = (e) => {
      if (!d || e.pointerId !== d.id) return;
      const { dy, on, t } = d; d = null;
      if (!on) return;
      sheet.classList.remove('drag');
      const fast = dy / Math.max(1, performance.now() - t) > 0.6;
      if (dy > sheet.offsetHeight * 0.25 || fast) closeSheet(); else sheet.style.transform = '';
    };
    sheet.addEventListener('pointerup', end);
    sheet.addEventListener('pointercancel', end);
  }

  /* --------------------------------------------------------- projects */
  const filters = $$('.mx-filter button', mx), items = $$('.mx-projs li', mx);
  filters.forEach((f) => f.addEventListener('click', () => {
    filters.forEach((o) => o.setAttribute('aria-pressed', String(o === f)));
    let k = 0;
    items.forEach((li) => {
      const on = f.dataset.lang === 'all' || li.dataset.lang === f.dataset.lang;
      li.classList.toggle('out', !on);
      li.classList.remove('pop');
      if (on) { void li.offsetWidth; li.style.setProperty('--k', k++); li.classList.add('pop'); }
    });
    fit();
  }));

  /* ----------------------------------------------------------- skills */
  const groups = $$('.mx-groups button', mx), lists = $$('.mx-skills', mx), used = $('.mx-used', mx), hint = used && used.innerHTML;
  groups.forEach((b) => b.addEventListener('click', () => {
    groups.forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
    lists.forEach((l) => l.classList.toggle('on', l.dataset.g === b.dataset.g));
    $$('.mx-skill.on', mx).forEach((s) => s.classList.remove('on'));
    if (used) used.innerHTML = hint;
    b.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
    fit();
  }));
  $$('.mx-skill', mx).forEach((s) => s.addEventListener('click', () => {
    const on = !s.classList.contains('on');
    $$('.mx-skill.on', mx).forEach((o) => o.classList.remove('on'));
    if (!used) return;
    if (!on) { used.innerHTML = hint; return; }
    s.classList.add('on');
    used.innerHTML = '';
    const b = document.createElement('b'); b.textContent = s.textContent;
    used.append(b, s.dataset.used ? ` — used at ${s.dataset.used}.` : ' — one I bring to every team and class project.');
  }));

  /* ------------------------------------------------------------ words */
  (() => {
    const deck = $('.mx-deck', mx);
    if (!deck) return;
    let order = $$('.mx-note', deck);
    const dots = $$('.mx-dots i', mx), count = $('.mx-count', mx), n = order.length;
    const lay = (instant) => {
      order.forEach((el, d) => {
        const k = Math.min(d, 2);
        el.style.transition = instant ? 'none' : 'transform .6s cubic-bezier(.2,.8,.2,1), opacity .4s';
        el.style.zIndex = String(n - d);
        el.style.opacity = d < 3 ? '1' : '0';
        el.style.pointerEvents = d ? 'none' : 'auto';
        el.style.transform = `translate3d(0,${k * 10}px,0) scale(${1 - k * 0.05})`;
        el.setAttribute('aria-hidden', String(d !== 0));
      });
      const i = +order[0].dataset.i;
      dots.forEach((dt, k) => dt.classList.toggle('on', k === i));
      if (count) count.textContent = `${i + 1} / ${n}`;
    };
    const next = (dir) => {
      const el = order[0];
      el.style.transition = 'transform .4s cubic-bezier(.3,.6,.4,1), opacity .4s';
      el.style.transform = `translate3d(${dir * (deck.clientWidth + 60)}px,-10px,0) rotate(${dir * 14}deg)`;
      el.style.opacity = '0';
      setTimeout(() => { if (dir > 0) order.push(order.shift()); else order.push(order.shift()); lay(); }, reduced ? 0 : 230);
    };
    let d = null;
    deck.addEventListener('pointerdown', (e) => {
      const el = e.target.closest('.mx-note');
      if (!el || el !== order[0]) return;
      d = { el, x: e.clientX, id: e.pointerId, v: 0, lx: e.clientX, lt: performance.now(), dx: 0 };
      el.style.transition = 'none';
      try { el.setPointerCapture(e.pointerId); } catch (err) {}
    });
    deck.addEventListener('pointermove', (e) => {
      if (!d || e.pointerId !== d.id) return;
      const now = performance.now();
      d.v = d.v * 0.6 + ((e.clientX - d.lx) / Math.max(1, now - d.lt)) * 0.4; d.lx = e.clientX; d.lt = now;
      d.dx = e.clientX - d.x;
      d.el.style.transform = `translate3d(${d.dx}px,0,0) rotate(${d.dx * 0.05}deg)`;
    });
    const end = (e) => {
      if (!d || e.pointerId !== d.id) return;
      const { dx, lt } = d; let { v } = d; d = null;
      if (performance.now() - lt > 90) v = 0;
      if (Math.abs(dx) > deck.clientWidth * 0.25 || Math.abs(v) > 0.6) { buzz(); next(Math.sign(dx || v) || 1); } else lay();
    };
    deck.addEventListener('pointerup', end);
    deck.addEventListener('pointercancel', end);
    deck.addEventListener('click', (e) => { if (e.target.closest('.mx-note') === order[0] && !d) { /* a tap reads on */ } });
    // As tall as its longest note, so nothing is cut off.
    const size = () => {
      let h = 0;
      order.forEach((el) => { el.style.bottom = 'auto'; h = Math.max(h, el.offsetHeight); el.style.bottom = ''; });
      if (h) deck.style.height = h + 'px';
      fit();
    };
    lay(true); size();
    addEventListener('resize', size);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(size);
  })();

  /* ---------------------------------------------------------- stories */
  /* Like stories on a phone: each photo for a few seconds, bars along the
     top filling as it plays. Tap the right for the next, the left to go
     back, hold to pause, swipe down to close. */
  (() => {
    const v = $('.mx-viewer'), data = (() => { try { return JSON.parse($('#mx-stories-data').textContent); } catch (e) { return []; } })();
    if (!v || !data.length) return;
    const bars = $('.mxv-bars', v), img = $('.mxv-stage img', v), title = $('.mxv-title', v), capB = $('.mxv-cap b', v), capP = $('.mxv-cap p', v);
    const DUR = 6000;
    let s = 0, k = 0, t0 = 0, held = 0, paused = false, raf = 0, from = null;
    const bubbles = $$('.mx-story-b', mx);
    const paint = () => {
      const st = data[s];
      title.textContent = st.t;
      bars.innerHTML = st.s.map((_, i) => `<i class="${i < k ? 'done' : ''}"><b></b></i>`).join('');
      const [src, h, x] = st.s[k];
      img.classList.add('fade');
      const im = new Image();
      const put = () => { img.src = src; img.classList.remove('fade'); };
      im.onload = put; im.onerror = put; im.src = src;
      capB.textContent = h || ''; capP.textContent = x || '';
      if (st.s[k + 1]) new Image().src = st.s[k + 1][0];
      t0 = performance.now(); held = 0;
    };
    const step = (dir) => {
      const st = data[s];
      if (dir > 0) { if (k < st.s.length - 1) k++; else if (s < data.length - 1) { bubbles[s] && bubbles[s].classList.add('seen'); s++; k = 0; } else { bubbles[s] && bubbles[s].classList.add('seen'); close(); return; } }
      else { if (k > 0) k--; else if (s > 0) { s--; k = 0; } }
      paint();
    };
    const tick = (t) => {
      if (v.hidden) return;
      if (!paused) {
        const p = clamp((t - t0 - held) / DUR, 0, 1);
        const bar = bars.children[k] && bars.children[k].firstChild;
        if (bar) bar.style.transform = `scaleX(${p})`;
        if (p >= 1 && !reduced) step(1);
      }
      raf = requestAnimationFrame(tick);
    };
    let pausedAt = 0;
    const pause = (on) => { if (on && !paused) { paused = true; pausedAt = performance.now(); } else if (!on && paused) { paused = false; held += performance.now() - pausedAt; } };
    const open = (i, el) => {
      s = i; k = 0; from = el;
      v.hidden = false; lock(true);
      requestAnimationFrame(() => v.classList.add('open'));
      paint(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
    };
    function close() {
      v.classList.remove('open'); lock(false); cancelAnimationFrame(raf);
      setTimeout(() => { v.hidden = true; img.removeAttribute('src'); }, reduced ? 0 : 320);
      if (from && from.focus) from.focus({ preventScroll: true });
    }
    bubbles.forEach((b) => b.addEventListener('click', () => open(+b.dataset.story, b)));
    $('.mxv-x', v).addEventListener('click', close);
    // A tap moves on; a press held still pauses; a swipe down closes.
    let p = null;
    v.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.mxv-x')) return;
      p = { x: e.clientX, y: e.clientY, t: performance.now(), zone: e.target.closest('.mxv-zone') };
      const timer = setTimeout(() => { if (p) { p.hold = true; pause(true); } }, 220);
      p.timer = timer;
    });
    v.addEventListener('pointermove', (e) => { if (p && e.clientY - p.y > 0) v.style.transform = `translateY(${(e.clientY - p.y) * 0.5}px)`; });
    v.addEventListener('pointerup', (e) => {
      if (!p) return;
      clearTimeout(p.timer);
      const dy = e.clientY - p.y, dx = e.clientX - p.x, was = p; p = null;
      v.style.transform = '';
      if (was.hold) { pause(false); if (dy > 110) close(); return; }
      if (dy > 110) { close(); return; }
      if (Math.abs(dx) > 60) { step(dx < 0 ? 1 : -1); return; }
      if (was.zone) step(was.zone.classList.contains('mxv-next') ? 1 : -1);
    });
    v.addEventListener('pointercancel', () => { if (p) { clearTimeout(p.timer); if (p.hold) pause(false); p = null; v.style.transform = ''; } });
    document.addEventListener('keydown', (e) => {
      if (v.hidden) { if (e.key === 'Escape') closeSheet(); return; }
      if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') step(1); else if (e.key === 'ArrowLeft') step(-1);
    });
  })();

  /* ------------------------------------------------------- the eras */
  const yr = $('.mx-eras-y', mx);
  if (yr && !reduced) {
    const ys = yr.dataset.years.split(','); let i = 0;
    setInterval(() => { if (!phone.matches || document.hidden) return; i = (i + 1) % ys.length; yr.textContent = ys[i]; yr.classList.remove('roll'); void yr.offsetWidth; yr.classList.add('roll'); }, 2600);
  }

  /* ---------------------------------------------------------- scroll */
  /* As the page moves: the hello drifts back, things rise into place, and
     on the path the stop nearest the middle of the screen lights up. */
  const hero = $('.mx-hero', mx);
  const stops = $$('.mx-stop', mx);
  const rvs = [...$$('.mx-jar-s > *, .mx-eras, .mx-contact > *, .mx-foot', mx)];
  rvs.forEach((el, i) => { el.setAttribute('data-rv', ''); });
  $$('.mx-contact > *', mx).forEach((el, i) => el.style.setProperty('--rd', Math.min(i, 5)));
  $$('.mx-jar-s > *', mx).forEach((el, i) => el.style.setProperty('--rd', i));
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    rvs.forEach((el) => io.observe(el));
  } else rvs.forEach((el) => el.classList.add('in'));
  let lit = null, qraf = 0;
  const onScroll = () => {
    qraf = 0;
    if (!phone.matches) return;
    const vh = innerHeight;
    if (hero && !reduced) hero.style.setProperty('--p', clamp(scrollY / (vh * 0.75), 0, 1).toFixed(3));
    if (cur === 0) {
      let best = null, bd = 1e9;
      for (const s of stops) { const r = s.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) continue; const d = Math.abs(r.top + r.height / 2 - vh * 0.48); if (d < bd) { bd = d; best = s; } }
      if (best && bd > vh * 0.4) best = null;
      if (best !== lit) { if (lit) lit.classList.remove('lit'); lit = best; if (lit) lit.classList.add('lit'); }
    }
  };
  addEventListener('scroll', () => { if (!qraf) qraf = requestAnimationFrame(onScroll); }, { passive: true });
  onScroll();

  /* ------------------------------------------------------------- jar */
  /* The logos drop into a tray when it comes into view, and then they can
     be picked up and thrown. Plain circles: gravity, walls, and pushing
     each other apart. A tap that doesn't move opens that role. */
  const jar = $('.mx-jar', mx), chips = jar ? $$('.mx-chip', jar) : [];
  if (jar && chips.length) {
    const B = chips.map((el, i) => ({ el, x: 0, y: 0, vx: 0, vy: 0, r: 46, held: null, i }));
    let Wj = 0, Hj = 0, running = false, started = false, last = 0, still = 0;
    const size = () => {
      Wj = jar.clientWidth; Hj = jar.clientHeight;
      const d = Math.round(clamp(Wj * 0.27, 78, 104));
      B.forEach((b) => { b.r = d / 2; b.el.style.setProperty('--d', d + 'px'); });
    };
    // A thrown logo leans with its speed and settles back upright, so it stays readable.
    const place = () => B.forEach((b) => { b.a = (b.a || 0) + (clamp(b.vx * 0.012, -18, 18) - (b.a || 0)) * 0.18; b.el.style.transform = `translate(${(b.x - b.r).toFixed(1)}px, ${(b.y - b.r).toFixed(1)}px) rotate(${b.a.toFixed(1)}deg)`; });
    const drop = () => {
      size();
      B.forEach((b, i) => { b.x = b.r + 6 + ((i * 0.37 + 0.11) % 1) * (Wj - 2 * b.r - 12); b.y = -b.r - i * b.r * 1.15; b.vx = (i % 2 ? 1 : -1) * 40; b.vy = 0; });
      started = true; start();
    };
    const step = (dt) => {
      const G = 2200, e = 0.38, air = Math.pow(0.6, dt);
      let moving = 0;
      for (const b of B) {
        if (b.held) { const h = b.held; const nx = h.px, ny = h.py; b.vx = (nx - b.x) / Math.max(dt, 1 / 120); b.vy = (ny - b.y) / Math.max(dt, 1 / 120); b.x = nx; b.y = ny; continue; }
        b.vy += G * dt; b.vx *= air; b.vy *= air;
        b.x += b.vx * dt; b.y += b.vy * dt;
      }
      for (let it = 0; it < 4; it++) {
        for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++) {
          const a = B[i], c = B[j], dx = c.x - a.x, dy = c.y - a.y, min = a.r + c.r, d2 = dx * dx + dy * dy;
          if (d2 >= min * min || d2 === 0) continue;
          const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, o = min - d;
          const wa = a.held ? 0 : c.held ? 1 : 0.5, wc = c.held ? 0 : a.held ? 1 : 0.5;
          a.x -= nx * o * wa; a.y -= ny * o * wa; c.x += nx * o * wc; c.y += ny * o * wc;
          const rv = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
          if (rv < 0) { const imp = -(1 + e) * rv * 0.5; if (!a.held) { a.vx -= imp * nx; a.vy -= imp * ny; } if (!c.held) { c.vx += imp * nx; c.vy += imp * ny; } }
        }
        for (const b of B) {
          if (b.held) continue;
          if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx) * e; }
          if (b.x > Wj - b.r) { b.x = Wj - b.r; b.vx = -Math.abs(b.vx) * e; }
          if (b.y > Hj - b.r) { b.y = Hj - b.r; b.vy = -Math.abs(b.vy) * e; b.vx *= 0.96; if (Math.abs(b.vy) < 30) b.vy = 0; }
        }
      }
      for (const b of B) if (b.held || Math.abs(b.vx) + Math.abs(b.vy) > 12 || b.y < b.r) moving++;
      return moving;
    };
    const tick = (t) => {
      if (!running) return;
      const dt = Math.min(0.033, (t - (last || t)) / 1000) || 1 / 60; last = t;
      const m = step(dt / 2) + step(dt / 2);
      place();
      still = m ? 0 : still + 1;
      if (still > 40) { running = false; last = 0; return; }
      requestAnimationFrame(tick);
    };
    const start = () => { if (!running && started) { running = true; still = 0; last = 0; requestAnimationFrame(tick); } };
    if (reduced) { size(); B.forEach((b, i) => { const per = Math.floor(Wj / (b.r * 2)) || 1; b.x = b.r + (i % per) * b.r * 2; b.y = Hj - b.r - Math.floor(i / per) * b.r * 1.8; }); place(); started = true; }
    else if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => { if (es[0].isIntersecting && !started) { drop(); io.disconnect(); } }, { threshold: 0.35 });
      io.observe(jar);
    } else drop();
    addEventListener('resize', () => { if (!started) return; size(); B.forEach((b) => { b.x = clamp(b.x, b.r, Wj - b.r); b.y = Math.min(b.y, Hj - b.r); }); start(); });
    B.forEach((b) => {
      const el = b.el;
      el.addEventListener('pointerdown', (e) => {
        if (!started) return;
        const r = jar.getBoundingClientRect();
        b.held = { id: e.pointerId, px: e.clientX - r.left, py: e.clientY - r.top, ox: e.clientX, oy: e.clientY, t: performance.now(), moved: false };
        b.held.dx = b.x - b.held.px; b.held.dy = b.y - b.held.py; b.held.px += b.held.dx; b.held.py += b.held.dy;
        el.classList.add('held'); el.style.zIndex = 3;
        try { el.setPointerCapture(e.pointerId); } catch (err) {}
        buzz(6); start();
      });
      el.addEventListener('pointermove', (e) => {
        const h = b.held; if (!h || e.pointerId !== h.id) return;
        const r = jar.getBoundingClientRect();
        h.px = clamp(e.clientX - r.left + h.dx, b.r, Wj - b.r); h.py = clamp(e.clientY - r.top + h.dy, b.r, Hj - b.r);
        if (Math.hypot(e.clientX - h.ox, e.clientY - h.oy) > 6) h.moved = true;
      });
      const up = (e) => {
        const h = b.held; if (!h || e.pointerId !== h.id) return;
        b.held = null; el.classList.remove('held'); el.style.zIndex = '';
        const sp = Math.hypot(b.vx, b.vy), cap = 2600;
        if (sp > cap) { b.vx *= cap / sp; b.vy *= cap / sp; }
        if (!h.moved && performance.now() - h.t < 450 && e.type === 'pointerup') { b.vx = b.vy = 0; openSheet(el.dataset.sheet, el); }
        start();
      };
      el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
      el.addEventListener('click', (e) => { if (e.detail === 0) openSheet(el.dataset.sheet, el); });
    });
  }

  /* ---------------------------------------------------------- prints */
  // 2006 on top. A tap sends the top print to the back of the pile.
  const prints = $$('.mx-print', mx);
  prints.forEach((p) => p.addEventListener('click', () => {
    if (!p.classList.contains('top') || p.classList.contains('toss')) return;
    buzz(8);
    p.classList.add('toss');
    setTimeout(() => {
      prints.forEach((o) => o.classList.toggle('top', o !== p));
      p.classList.remove('toss');
    }, reduced ? 0 : 250);
  }));

  /* ---------------------------------------------------------- contact */
  // The site's own handler copies anything marked data-copy and says so;
  // the button just answers the tap.
  $$('[data-copy]', mx).forEach((b) => b.addEventListener('click', () => {
    b.classList.add('done'); buzz(12);
    setTimeout(() => b.classList.remove('done'), 1600);
  }));
})();
