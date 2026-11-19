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

  // Then and now: the portrait turns over to 2006, and back.
  const ava = $('.mx-ava', mx);
  if (ava) ava.addEventListener('click', () => {
    if (ava.classList.contains('turning')) return;
    ava.classList.add('turning');
    setTimeout(() => { const on = ava.classList.toggle('flipped'); ava.setAttribute('aria-pressed', String(on)); ava.classList.remove('turning'); }, reduced ? 0 : 200);
  });

  // The shapes: each tap turns the composition a quarter.
  const mark = $('.mx-mark', mx);
  let turns = 0;
  if (mark) mark.addEventListener('click', () => { turns++; mark.style.transform = `rotate(${turns * 90}deg)`; buzz(6); });
  // "Take a look" glides down to the tabs.
  const down = $('.mx-down', mx);
  if (down) down.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); window.scrollTo({ top: $('.mx-tabs', mx).getBoundingClientRect().top + scrollY, behavior: reduced ? 'auto' : 'smooth' }); });

  /* ------------------------------------------------------------- tabs */
  const tabs = $('.mx-tabs', mx), pager = $('.mx-pager', mx), ink = $('.mx-ink', tabs);
  const btns = $$('[role="tab"]', tabs), panels = $$('.mx-panel', pager);
  let cur = 0;
  const W = () => pager.clientWidth || 1;
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
  $$('[data-sheet]', mx).forEach((b) => b.addEventListener('click', () => openSheet(b.dataset.sheet, b)));
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

  /* ---------------------------------------------------------- contact */
  // The site's own handler copies anything marked data-copy and says so;
  // the button just answers the tap.
  $$('[data-copy]', mx).forEach((b) => b.addEventListener('click', () => {
    b.classList.add('done'); buzz(12);
    setTimeout(() => b.classList.remove('done'), 1600);
  }));
})();
