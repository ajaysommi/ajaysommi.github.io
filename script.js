/* ==========================================================================
   Ajay Sommi portfolio behaviour
   Vanilla ES module, no dependencies. Every block is defensive: if an element
   is missing the feature quietly no-ops instead of throwing and killing the
   rest of the page.
   ========================================================================== */

const root = document.documentElement;
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const reduceMotionQuery = matchMedia('(prefers-reduced-motion: reduce)');
const coarsePointer = matchMedia('(hover: none)');
const prefersReduced = () => reduceMotionQuery.matches;

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/* ==========================================================================
   Boot loader
   Dismissed as soon as the page is usable. The old build faded it with a
   CSS animation, which prefers-reduced-motion disabled outright, leaving the
   overlay covering the page permanently. Driving it from JS fixes that.
   ========================================================================== */
(function loader() {
  const el = $('#pageLoader');
  if (!el) return;

  let done = false;
  const dismiss = () => {
    if (done) return;
    done = true;
    el.classList.add('is-done');
    setTimeout(() => el.remove(), 900);
  };

  const minShow = prefersReduced() ? 220 : 1150;
  const started = performance.now();
  const finish = () => setTimeout(dismiss, Math.max(0, minShow - (performance.now() - started)));

  if (document.readyState === 'complete') finish();
  else window.addEventListener('load', finish, { once: true });

  // Hard cap so a hung asset can never trap the visitor behind the overlay.
  setTimeout(dismiss, 4000);
})();

/* ==========================================================================
   Footer year
   ========================================================================== */
(function year() {
  const y = $('#y');
  if (y) y.textContent = String(new Date().getFullYear());
})();

/* ==========================================================================
   Toasts
   ========================================================================== */
const toast = (() => {
  const host = $('#toastHost');
  return (message) => {
    if (!host) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = '<i aria-hidden="true"></i><span></span>';
    el.querySelector('span').textContent = message;
    host.appendChild(el);
    setTimeout(() => {
      el.classList.add('is-out');
      el.addEventListener('animationend', () => el.remove(), { once: true });
    }, 2100);
  };
})();

/* ==========================================================================
   Copy-to-clipboard buttons
   ========================================================================== */
(function copyButtons() {
  $$('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        toast(`Copied ${text}`);
      } catch {
        // Clipboard API needs a secure context; fall back to a mail client.
        window.location.href = `mailto:${text}`;
      }
    });
  });
})();

/* ==========================================================================
   Theme cycling: midnight → daylight → terminal
   ========================================================================== */
const THEMES = ['midnight', 'daylight', 'terminal'];

function setTheme(name, announce = true) {
  if (!THEMES.includes(name)) return;
  root.dataset.theme = name;
  try { localStorage.setItem('as-theme', name); } catch {}
  const meta = document.querySelector('meta[name="theme-color"]:not([media])');
  if (meta) meta.content = name === 'daylight' ? '#eef2f8' : '#050814';
  if (announce) toast(`${name[0].toUpperCase()}${name.slice(1)} theme`);
}

(function themeToggle() {
  const btn = $('#themeBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const next = THEMES[(THEMES.indexOf(root.dataset.theme) + 1) % THEMES.length];
    // View Transitions give a free cross-fade where supported.
    if (document.startViewTransition && !prefersReduced()) {
      document.startViewTransition(() => setTheme(next));
    } else {
      setTheme(next);
    }
  });
})();

/* ==========================================================================
   Navigation: smooth scroll without polluting the URL, sticky state,
   current-section highlighting, mobile sheet.
   ========================================================================== */
(function navigation() {
  const nav = $('#siteNav');
  const toggle = $('#navToggle');
  const sheet = $('#mobileSheet');
  const scrim = $('#sheetScrim');

  const closeSheet = () => {
    if (!sheet || !scrim) return;
    sheet.classList.remove('is-open');
    scrim.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', 'Open menu');
    setTimeout(() => {
      if (!sheet.classList.contains('is-open')) { sheet.hidden = true; scrim.hidden = true; }
    }, 380);
  };

  const openSheet = () => {
    if (!sheet || !scrim) return;
    sheet.hidden = false;
    scrim.hidden = false;
    requestAnimationFrame(() => {
      sheet.classList.add('is-open');
      scrim.classList.add('is-open');
    });
    toggle?.setAttribute('aria-expanded', 'true');
    toggle?.setAttribute('aria-label', 'Close menu');
  };

  toggle?.addEventListener('click', () => {
    sheet?.classList.contains('is-open') ? closeSheet() : openSheet();
  });
  scrim?.addEventListener('click', closeSheet);

  // Delegated smooth scrolling for every in-page link.
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();
    closeSheet();
    target.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'start' });
    // Keep the URL clean so a refresh does not jump mid-page.
    history.replaceState(null, '', location.pathname + location.search);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sheet?.classList.contains('is-open')) closeSheet();
  });

  // Sticky shadow
  const onScroll = () => nav?.classList.toggle('is-stuck', window.scrollY > 12);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });
})();

/* ==========================================================================
   Scroll rail: progress bar and section dots
   ========================================================================== */
(function scrollRail() {
  const rail = $('.rail');
  const fill = $('.rail-fill');
  const list = $('.rail-dots');
  if (!rail || !fill || !list) return;

  const sections = [
    ['top', 'Top'],
    ['logos', 'Companies'],
    ['experience', 'The path'],
    ['education', 'Education'],
    ['projects', 'Projects'],
    ['skills', 'Skills'],
    ['recs', 'Recommendations'],
    ['contact', 'Contact'],
  ].filter(([id]) => document.getElementById(id));

  list.innerHTML = '';
  sections.forEach(([id, label]) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.target = id;
    btn.dataset.label = label;
    btn.setAttribute('aria-label', `Go to ${label}`);
    btn.addEventListener('click', () => {
      document.getElementById(id)?.scrollIntoView({
        behavior: prefersReduced() ? 'auto' : 'smooth',
        block: 'start',
      });
    });
    li.appendChild(btn);
    list.appendChild(li);
  });

  const dots = $$('button', list);
  const navLinks = $$('.nav-links a[href^="#"]');
  let ticking = false;

  const update = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    fill.style.height = `${clamp(max > 0 ? (scrollY / max) * 100 : 0, 0, 100)}%`;

    const line = scrollY + innerHeight * 0.32;
    let active = 0;
    sections.forEach(([id], i) => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top + scrollY <= line) active = i;
    });

    dots.forEach((d, i) => d.classList.toggle('is-active', i === active));
    const activeId = sections[active]?.[0];
    navLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === `#${activeId}`));
  };

  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();
})();

/* ==========================================================================
   Reveal on scroll
   ========================================================================== */
(function reveal() {
  const items = $$('[data-reveal]');
  if (!items.length) return;

  if (prefersReduced() || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      // Stagger siblings slightly so a grid does not pop in all at once.
      const siblings = Array.from(entry.target.parentElement?.children || []);
      const idx = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = `${Math.min(idx, 6) * 55}ms`;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  items.forEach((el) => io.observe(el));
})();


/* ==========================================================================
   Hero: scramble headline + role typewriter
   ========================================================================== */
(function heroText() {
  const heading = $('[data-scramble]');
  if (heading && !prefersReduced()) {
    const finalText = heading.textContent;
    const glyphs = '!<>_\\/[]{}~=+*^?#01';
    let frame = 0;
    const queue = Array.from(finalText).map((ch, i) => ({
      ch,
      start: Math.floor(i * 1.4),
      end: Math.floor(i * 1.4) + 14 + Math.floor(Math.random() * 12),
    }));

    const tick = () => {
      let output = '';
      let complete = 0;
      for (const item of queue) {
        if (frame >= item.end) { output += item.ch; complete++; }
        else if (frame >= item.start && item.ch.trim()) {
          output += glyphs[Math.floor(Math.random() * glyphs.length)];
        } else if (frame >= item.start) { output += item.ch; }
        else { output += ' '; }
      }
      heading.textContent = output;
      frame++;
      if (complete < queue.length) requestAnimationFrame(tick);
      else heading.textContent = finalText;
    };
    // Start after the loader clears so the effect is actually seen.
    setTimeout(() => requestAnimationFrame(tick), 1300);
  }

  const typed = $('#typedRole');
  if (!typed) return;

  const roles = [
    'software engineer who adapts to the problem',
    'C#/.NET · Python · SQL · React · Apex',
    'shipping things that hold up in production',
    'B.S. Computer Science, University of Florida',
  ];

  if (prefersReduced()) { typed.textContent = roles[0]; return; }

  let r = 0, i = 0, deleting = false;
  const loop = () => {
    const text = roles[r];
    i += deleting ? -1 : 1;
    typed.textContent = text.slice(0, i);

    let delay = deleting ? 26 : 52;
    if (!deleting && i === text.length) { delay = 1900; deleting = true; }
    else if (deleting && i === 0) { deleting = false; r = (r + 1) % roles.length; delay = 340; }
    setTimeout(loop, delay);
  };
  setTimeout(loop, 1800);
})();

/* ==========================================================================
   Pointer effects: background spotlight, card glow, magnetic buttons
   ========================================================================== */
(function pointerFx() {
  if (coarsePointer.matches || prefersReduced()) return;

  // Background spotlight follows the cursor.
  const spot = $('.spotlight');
  if (spot) {
    let raf = 0;
    addEventListener('pointermove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        spot.style.setProperty('--spot-x', `${e.clientX}px`);
        spot.style.setProperty('--spot-y', `${e.clientY}px`);
        spot.style.opacity = '1';
      });
    }, { passive: true });
    document.addEventListener('pointerleave', () => { spot.style.opacity = '0'; });
  }

  // Per-element glow: cards and the hero share the same --spot-* contract.
  $$('.card, .hero-card').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--spot-x', `${e.clientX - r.left}px`);
      el.style.setProperty('--spot-y', `${e.clientY - r.top}px`);
    }, { passive: true });
  });

  // Magnetic buttons that lean gently toward the cursor. Raw pointermove
  // deltas were driving the transform 1:1, which reads as skittish once the
  // mouse jitters even slightly; rAF-throttling and a real transition (the
  // element's own hover transition, left free instead of pinned per-frame)
  // settle it into a lazier, springier lean.
  $$('[data-magnetic]').forEach((el) => {
    const strength = 6;
    let raf = 0, pendingX = 0, pendingY = 0;

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      pendingX = ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * strength;
      pendingY = ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * strength * 0.5;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        el.style.transform = `translate(${pendingX.toFixed(1)}px, ${pendingY.toFixed(1)}px)`;
      });
    }, { passive: true });

    const reset = () => { cancelAnimationFrame(raf); raf = 0; el.style.transform = ''; };
    el.addEventListener('pointerleave', reset);
    el.addEventListener('blur', reset);
  });

  // 3D tilt on project cards.
  $$('.card.tilt').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-5px)`;
    }, { passive: true });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
})();

/* ==========================================================================
   Logo carousel
   Native horizontal scrolling everywhere (so phones can swipe), plus a CSS
   marquee that runs only while idle, plus pointer-drag on desktop.
   ========================================================================== */
(function logoCarousel() {
  const viewport = $('#logoMarquee');
  const track = $('#logoTrack');
  if (!viewport || !track) return;

  const originals = Array.from(track.children);
  if (!originals.length) return;

  const SPEED = 42;          // px per second of idle drift
  let setW = 0;              // width of one full set, including the trailing gap
  let raf = 0;
  let lastTs = 0;
  let paused = false;        // explicit pause button
  let idle = true;           // nobody is touching it
  let dragging = false;

  /* ---------- Clone enough sets that the strip can never run out ----------
     The old build cloned exactly once and animated a CSS transform, so
     scrolling by hand eventually hit the end of the track and stopped dead.
     Now the strip is a real infinite scroller: scrollLeft is wrapped by one
     set width, which is invisible because the content repeats exactly. */
  const addSet = () => {
    originals.forEach((node) => {
      const copy = node.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.setAttribute('tabindex', '-1');
      copy.dataset.clone = 'true';
      // Clones must not be reachable by keyboard or screen readers.
      copy.querySelectorAll('a, button').forEach((el) => el.setAttribute('tabindex', '-1'));
      track.appendChild(copy);
    });
  };

  const measure = () => {
    const firstClone = track.querySelector('[data-clone]');
    if (!firstClone) return 0;
    return firstClone.offsetLeft - originals[0].offsetLeft;
  };

  const build = () => {
    // Reset to a single set, then clone until the track is comfortably wider
    // than the viewport with a full spare set on either side.
    track.querySelectorAll('[data-clone]').forEach((n) => n.remove());
    addSet();
    setW = measure();
    if (setW <= 0) return;

    const needed = Math.max(3, Math.ceil((viewport.clientWidth * 2) / setW) + 2);
    while (track.children.length / originals.length < needed) addSet();

    // Park in the middle copy so there is room to scroll both directions.
    viewport.scrollLeft = setW;
  };

  build();
  addEventListener('resize', build, { passive: true });
  $$('img', track).forEach((img) => {
    if (!img.complete) img.addEventListener('load', build, { once: true });
  });
  if (document.fonts?.ready) document.fonts.ready.then(build).catch(() => {});

  /* Keep scrollLeft inside one set width of the middle copy. Because every
     set is identical, the jump is invisible. */
  const wrap = () => {
    if (setW <= 0) return;
    if (viewport.scrollLeft >= setW * 2) viewport.scrollLeft -= setW;
    else if (viewport.scrollLeft < setW * 0.5) viewport.scrollLeft += setW;
  };

  /* ---------- Idle drift ---------- */
  const tick = (ts) => {
    raf = requestAnimationFrame(tick);
    const dt = lastTs ? Math.min((ts - lastTs) / 1000, 0.05) : 0;
    lastTs = ts;
    if (paused || !idle || dragging) return;
    viewport.scrollLeft += SPEED * dt;
    wrap();
  };

  if (!prefersReduced()) raf = requestAnimationFrame(tick);

  const goBusy = () => { idle = false; };
  const goIdle = () => { idle = true; };

  let idleTimer;
  const bumpIdle = (delay = 1800) => {
    goBusy();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { if (!dragging) goIdle(); }, delay);
  };

  // Merely hovering does not pause the drift, only an actual interaction
  // does (drag, wheel, arrow keys, touch, keyboard focus) so the strip reads
  // as continuously alive, and manual scrolling always overrides it.
  viewport.addEventListener('focusin', goBusy);
  viewport.addEventListener('focusout', (e) => { if (!viewport.contains(e.relatedTarget)) bumpIdle(600); });

  viewport.addEventListener('scroll', () => { wrap(); }, { passive: true });
  viewport.addEventListener('touchstart', () => bumpIdle(2400), { passive: true });
  viewport.addEventListener('touchend', () => bumpIdle(2400), { passive: true });

  /* ---------- Pointer drag (desktop; touch uses native scrolling) ---------- */
  let startX = 0, startScroll = 0, moved = 0, lastX = 0, velocity = 0, glideRaf = 0;

  viewport.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch' || e.button !== 0) return;
    dragging = true;
    moved = 0;
    startX = lastX = e.clientX;
    startScroll = viewport.scrollLeft;
    velocity = 0;
    cancelAnimationFrame(glideRaf);
    viewport.classList.add('is-dragging');
    viewport.setPointerCapture(e.pointerId);
    goBusy();
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    e.preventDefault();
    const dx = e.clientX - startX;
    moved = Math.abs(dx);
    velocity = e.clientX - lastX;
    lastX = e.clientX;
    viewport.scrollLeft = startScroll - dx;
    wrap();
    // Re-base so wrapping mid-drag does not yank the strip.
    startScroll = viewport.scrollLeft + dx;
  });

  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove('is-dragging');
    try { viewport.releasePointerCapture(e.pointerId); } catch {}

    let v = velocity * 1.4;
    const glide = () => {
      if (Math.abs(v) < 0.4) { bumpIdle(400); return; }
      viewport.scrollLeft -= v;
      wrap();
      v *= 0.94;
      glideRaf = requestAnimationFrame(glide);
    };
    if (!prefersReduced() && Math.abs(v) > 1) glideRaf = requestAnimationFrame(glide);
    else bumpIdle(1200);
  };

  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);

  // A drag should not also trigger the link underneath.
  viewport.addEventListener('click', (e) => {
    if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; }
  }, true);

  /* ---------- Controls ---------- */
  const glideBy = (dist) => {
    cancelAnimationFrame(glideRaf);
    const from = viewport.scrollLeft;
    const start = performance.now();
    const dur = prefersReduced() ? 0 : 420;
    goBusy();
    const step = (now) => {
      const t = dur ? clamp((now - start) / dur, 0, 1) : 1;
      const eased = 1 - Math.pow(1 - t, 3);
      viewport.scrollLeft = from + dist * eased;
      wrap();
      if (t < 1) glideRaf = requestAnimationFrame(step);
      else bumpIdle(1600);
    };
    glideRaf = requestAnimationFrame(step);
  };

  const page = () => Math.max(180, viewport.clientWidth * 0.7);
  $('[data-marquee-prev]')?.addEventListener('click', () => glideBy(-page()));
  $('[data-marquee-next]')?.addEventListener('click', () => glideBy(page()));

  const toggleBtn = $('[data-marquee-toggle]');
  toggleBtn?.addEventListener('click', () => {
    paused = !paused;
    toggleBtn.setAttribute('aria-pressed', String(paused));
    toggleBtn.setAttribute('aria-label', paused ? 'Resume logo animation' : 'Pause logo animation');
  });

  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); glideBy(page()); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); glideBy(-page()); }
  });

  // Vertical wheel over the strip scrolls it sideways. It never blocks the
  // page now, because the strip has no ends to reach.
  viewport.addEventListener('wheel', (e) => {
    if (coarsePointer.matches) return;
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    e.preventDefault();
    viewport.scrollLeft += e.deltaY;
    wrap();
    bumpIdle();
  }, { passive: false });

  // Drop the drift loop while the section is offscreen.
  if ('IntersectionObserver' in window && !prefersReduced()) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !raf) { lastTs = 0; raf = requestAnimationFrame(tick); }
        else if (!entry.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
      });
    }, { rootMargin: '150px' }).observe(viewport);
  }
})();

/* ==========================================================================
   Shared scroll engine
   One rAF-throttled scroll listener drives every scroll-linked effect, so
   adding effects never adds listeners.
   ========================================================================== */
const onScrollFrame = (() => {
  const jobs = [];
  let ticking = false;

  const run = () => {
    ticking = false;
    for (const job of jobs) job();
  };

  const request = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(run); }
  };

  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request, { passive: true });

  return (job) => {
    jobs.push(job);
    job();
    return request;
  };
})();

/* Progress of an element through the viewport, 0 before it enters to 1 once
   it has fully passed. */
function viewportProgress(el, { start = 1, end = 0 } = {}) {
  const r = el.getBoundingClientRect();
  const h = innerHeight || 1;
  const from = h * start;
  const to = -r.height + h * end;
  const span = from - to;
  if (span <= 0) return 1;
  return clamp((from - r.top) / span, 0, 1);
}

/* ==========================================================================
   THE PATH: scroll-driven career circuit board
   ========================================================================== */
(function journey() {
  const scope = $('#journeyScope');
  const board = $('#journeyBoard');
  const cardsList = $('#journeyCards');
  if (!scope || !board || !cardsList) return;

  const cards = $$('.jcard', cardsList);
  if (!cards.length) return;

  const N = cards.length;
  scope.style.setProperty('--nodes', String(N));

  /* ---------- Layout the board ---------- */
  const BOARD_W = 560;
  const STEP = 250;                  // vertical distance between nodes
  const MARGIN = 150;                // breathing room at each end
  const BOARD_H = MARGIN * 2 + STEP * (N - 1);
  const LANES = [140, 300, 420, 260]; // x positions cycled to make the trace wander

  board.style.setProperty('--board-h', `${BOARD_H}px`);

  const points = cards.map((_, i) => ({
    x: LANES[i % LANES.length],
    y: MARGIN + STEP * i,
  }));

  /* PCB-style routing: run straight, then break at 45°, then straight again.
     Building the path from the points keeps it correct if roles are added. */
  const buildPath = (pts) => {
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      const dx = b.x - a.x;
      const diag = Math.min(Math.abs(dx), Math.abs(b.y - a.y) - 40);
      if (diag > 4) {
        d += ` L ${a.x} ${b.y - diag - 20}`;
        d += ` L ${b.x} ${b.y - 20}`;
        d += ` L ${b.x} ${b.y}`;
      } else {
        d += ` L ${b.x} ${b.y}`;
      }
    }
    return d;
  };

  const d = buildPath(points);
  const bed = $('#traceBed');
  const live = $('#traceLive');
  const svg = $('#boardTrace');
  if (svg) svg.setAttribute('viewBox', `0 0 ${BOARD_W} ${BOARD_H}`);
  bed?.setAttribute('d', d);
  live?.setAttribute('d', d);

  const traceLen = live?.getTotalLength?.() || 0;
  if (live && traceLen) {
    live.style.strokeDasharray = `${traceLen}`;
    live.style.strokeDashoffset = `${traceLen}`;
  }

  /* ---------- Build the nodes ---------- */
  const nodes = cards.map((card, i) => {
    const el = document.createElement('div');
    el.className = 'node';
    el.dataset.i = String(i);
    el.dataset.state = 'future';
    el.style.setProperty('--nx', `${points[i].x}px`);
    el.style.setProperty('--ny', `${points[i].y}px`);
    el.innerHTML =
      '<span class="node-mast"></span>' +
      '<span class="node-pad"></span>' +
      '<span class="node-card"><b></b><span></span></span>';
    el.querySelector('.node-card b').textContent = card.dataset.company || '';
    el.querySelector('.node-card > span').textContent = card.dataset.short || '';
    board.appendChild(el);
    return el;
  });

  const pulse = document.createElement('div');
  pulse.className = 'board-pulse';
  board.appendChild(pulse);

  /* ---------- Scroll wiring ---------- */
  const idxEl = $('#journeyIdx');
  const totalEl = $('#journeyTotal');
  const barEl = $('#journeyBar');
  if (totalEl) totalEl.textContent = String(N).padStart(2, '0');

  let activeIdx = -1;

  const setActive = (i) => {
    if (i === activeIdx) return;
    const prev = activeIdx;
    activeIdx = i;

    cards.forEach((c, k) => {
      c.classList.toggle('is-active', k === i);
      c.classList.toggle('is-leaving', k === prev && k !== i);
    });
    nodes.forEach((n, k) => {
      n.dataset.state = k < i ? 'past' : k === i ? 'active' : 'future';
    });
    if (idxEl) idxEl.textContent = String(i + 1).padStart(2, '0');
  };

  const update = () => {
    const sticky = scope.firstElementChild;
    const travel = scope.offsetHeight - (sticky?.offsetHeight || innerHeight);
    const top = scope.getBoundingClientRect().top;
    const p = travel > 0 ? clamp(-top / travel, 0, 1) : 0;

    // Dolly the board so the active node sits in the camera's sweet spot.
    const first = points[0].y;
    const lastY = points[N - 1].y;
    const y = first + (lastY - first) * p;
    board.style.setProperty('--board-y', `${-y + 120}px`);

    // Energise the trace behind the camera.
    if (live && traceLen) live.style.strokeDashoffset = `${traceLen * (1 - p)}`;

    // Move the current pulse along the path.
    if (traceLen && live.getPointAtLength) {
      const pt = live.getPointAtLength(traceLen * p);
      pulse.style.transform = `translate3d(${pt.x}px, ${pt.y}px, 0)`;
    }

    setActive(clamp(Math.round(p * (N - 1)), 0, N - 1));
    if (barEl) barEl.style.width = `${p * 100}%`;
  };

  if (prefersReduced()) {
    // No pinning games: show everything as a plain list.
    cards.forEach((c) => c.classList.add('is-active'));
    nodes.forEach((n) => { n.dataset.state = 'past'; });
    if (live && traceLen) live.style.strokeDashoffset = '0';
  } else {
    setActive(0);
    onScrollFrame(update);
  }
})();

/* ==========================================================================
   Apple-style scroll-linked flourishes
   ========================================================================== */
(function scrollFlourishes() {
  if (prefersReduced()) return;

  /* --- Hero drifts away as you leave it --- */
  const heroCard = $('#heroCard');
  if (heroCard) {
    onScrollFrame(() => {
      const p = clamp(scrollY / Math.max(innerHeight * 0.85, 1), 0, 1);
      heroCard.style.setProperty('--hero-p', p.toFixed(3));
    });
  }

  /* --- Quote lights up word by word --- */
  const quote = $('.section.quote blockquote');
  if (quote && !quote.querySelector('span')) {
    const words = quote.textContent.trim().split(/\s+/);
    quote.textContent = '';
    quote.classList.add('quote-words');
    words.forEach((w, i) => {
      const s = document.createElement('span');
      s.textContent = w;
      quote.appendChild(s);
      if (i < words.length - 1) quote.appendChild(document.createTextNode(' '));
    });

    const spans = $$('span', quote);
    onScrollFrame(() => {
      const p = viewportProgress(quote, { start: 0.9, end: 0.45 });
      const lit = Math.round(p * spans.length);
      spans.forEach((s, i) => s.classList.toggle('lit', i < lit));
    });
  }

  /* --- Section progress for lift / drift effects --- */
  const track = (el, opts) => {
    onScrollFrame(() => {
      el.style.setProperty('--sp', viewportProgress(el, opts).toFixed(3));
    });
  };

  const projectGrid = $('#projectGrid');
  if (projectGrid) {
    projectGrid.dataset.scrollLift = '';
    track(projectGrid, { start: 1, end: 0.55 });
  }

  const testimonials = $('.testimonials');
  if (testimonials) {
    testimonials.dataset.drift = '';
    track(testimonials, { start: 1, end: 0.2 });
  }

  /* --- Heading gradient sweep --- */
  $$('.section-head h2').forEach((h) => {
    onScrollFrame(() => {
      h.style.setProperty('--sweep', viewportProgress(h, { start: 0.95, end: 0.6 }).toFixed(3));
    });
  });

  /* --- Skill pills charge as their row scrolls in --- */
  $$('#skills .pills').forEach((row) => {
    row.dataset.charge = '';
    const items = $$('button, span', row);
    onScrollFrame(() => {
      const p = viewportProgress(row, { start: 0.92, end: 0.62 });
      items.forEach((item, i) => {
        // Each pill fills a little after the one before it.
        const local = clamp(p * items.length - i, 0, 1);
        item.style.setProperty('--charge', local.toFixed(3));
      });
    });
  });
})();

/* ==========================================================================
   Skill + project filtering
   Clicking a skill pill spotlights matching projects and experience.
   ========================================================================== */
(function filtering() {
  const grid = $('#projectGrid');
  if (!grid) return;

  const cards = $$('.card', grid);
  const filterChips = $$('#projectFilters .filter-chip');
  const skillButtons = $$('#skills .pills button');
  const status = $('#filterStatus');
  const statusTag = $('#filterTag');
  const empty = $('#emptyState');

  const tagsOf = (el) => (el.dataset.tags || '').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);

  // A skill label and a card tag do not always match exactly.
  const normalize = (value) => {
    const v = value.toLowerCase().trim();
    const aliases = {
      'microsoft azure': 'azure',
      'azure blob storage': 'azure',
      'node.js': 'node',
      'next.js': 'react',
      'salesforce (apex/lwc)': 'salesforce',
      'html & css': 'html',
      'html &amp; css': 'html',
      'rest apis': 'rest apis',
      'javascript': 'javascript',
    };
    return aliases[v] || v;
  };

  const matches = (el, needle) =>
    tagsOf(el).some((t) => t === needle || t.includes(needle) || needle.includes(t));

  let current = 'all';

  const apply = (raw, { scroll = false } = {}) => {
    const needle = raw === 'all' ? 'all' : normalize(raw);
    current = needle;

    let visible = 0;
    cards.forEach((card) => {
      const hit = needle === 'all' || matches(card, needle);
      card.classList.toggle('is-hidden', !hit);
      card.classList.toggle('is-lit', hit && needle !== 'all');
      if (hit) visible++;
    });

    filterChips.forEach((c) => c.classList.toggle('is-active', normalize(c.dataset.filter) === needle));
    skillButtons.forEach((b) => b.classList.toggle('is-active', needle !== 'all' && normalize(b.textContent) === needle));

    if (status && statusTag) {
      status.hidden = needle === 'all';
      statusTag.textContent = raw;
    }
    if (empty) empty.hidden = visible !== 0;

    if (scroll) {
      grid.closest('section')?.scrollIntoView({
        behavior: prefersReduced() ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  };

  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => apply(chip.dataset.filter));
  });

  skillButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const label = btn.textContent.trim();
      const needle = normalize(label);
      if (current === needle) { apply('all'); toast('Filter cleared'); return; }

      apply(label, { scroll: true });
      const hits = cards.filter((c) => !c.classList.contains('is-hidden')).length;
      toast(hits ? `${hits} project${hits === 1 ? '' : 's'} using ${label}` : `No projects tagged ${label} yet`);
    });
  });

  $('#filterClear')?.addEventListener('click', () => apply('all'));
  $('[data-filter-reset]')?.addEventListener('click', () => apply('all'));
})();

/* ==========================================================================
   Command palette (⌘K / Ctrl+K)
   ========================================================================== */
const palette = (() => {
  const dialog = $('#palette');
  const input = $('#paletteInput');
  const list = $('#paletteList');
  if (!dialog || !input || !list) return { open: () => {} };

  const go = (id) => () => document.getElementById(id)?.scrollIntoView({
    behavior: prefersReduced() ? 'auto' : 'smooth',
    block: 'start',
  });

  const commands = [
    { icon: '⌂', title: 'Top',              kind: 'section', run: go('top') },
    { icon: '≡', title: 'The path',         sub: 'Career journey, role by role', kind: 'section', run: go('experience') },
    { icon: '⌁', title: 'Education',        kind: 'section', run: go('education') },
    { icon: '▤', title: 'Projects',         kind: 'section', run: go('projects') },
    { icon: '✦', title: 'Skills & Tools',   kind: 'section', run: go('skills') },
    { icon: '❞', title: 'Recommendations',  kind: 'section', run: go('recs') },
    { icon: '✉', title: 'Contact',          kind: 'section', run: go('contact') },

    { icon: '↗', title: 'SommiScript',      sub: 'Custom language + Java interpreter', kind: 'project', run: () => window.open('https://github.com/ajaysommi/SommiScript', '_blank', 'noopener') },
    { icon: '↗', title: 'GatorGoods',       sub: 'MERN marketplace for UF students',   kind: 'project', run: () => window.open('https://github.com/ajaysommi/GatorGoods', '_blank', 'noopener') },
    { icon: '↗', title: 'BalanceTree',      sub: 'Self-balancing AVL tree in C++',     kind: 'project', run: () => window.open('https://github.com/ajaysommi/BalanceTree', '_blank', 'noopener') },
    { icon: '↗', title: 'Crash Fatality Analysis', sub: 'Vehicle safety data, 1996 to 2022', kind: 'project', run: () => window.open('https://github.com/ajaysommi/Car-Crash-Analyzation-Tool', '_blank', 'noopener') },

    { icon: '⎘', title: 'Copy email',       sub: 'ajaysommi7@gmail.com', kind: 'action', run: async () => {
        try { await navigator.clipboard.writeText('ajaysommi7@gmail.com'); toast('Copied ajaysommi7@gmail.com'); }
        catch { location.href = 'mailto:ajaysommi7@gmail.com'; }
      } },
    { icon: '⇩', title: 'Open resume',      sub: 'PDF + inline viewer', kind: 'action', run: () => { location.href = 'resume.html'; } },
    { icon: '⌘', title: 'GitHub profile',   kind: 'action', run: () => window.open('https://github.com/ajaysommi', '_blank', 'noopener') },
    { icon: 'in', title: 'LinkedIn profile', kind: 'action', run: () => window.open('https://www.linkedin.com/in/ajay-sommi/', '_blank', 'noopener') },

    { icon: '◐', title: 'Theme: Midnight',  kind: 'theme', run: () => setTheme('midnight') },
    { icon: '☀', title: 'Theme: Daylight',  kind: 'theme', run: () => setTheme('daylight') },
    { icon: '▮', title: 'Theme: Terminal',  kind: 'theme', run: () => setTheme('terminal') },
    { icon: '▸', title: 'Open terminal',    sub: 'Try `help`', kind: 'easter egg', run: () => terminal.open() },
    { icon: '🐊', title: 'Release the gators', kind: 'easter egg', run: () => gatorStorm(18) },
  ];

  let results = commands.slice();
  let selected = 0;

  const score = (cmd, q) => {
    const hay = `${cmd.title} ${cmd.sub || ''} ${cmd.kind}`.toLowerCase();
    if (!q) return 1;
    if (hay.startsWith(q)) return 100;
    if (cmd.title.toLowerCase().includes(q)) return 60;
    if (hay.includes(q)) return 30;
    // Loose subsequence match so "recs" finds "Recommendations".
    let i = 0;
    for (const ch of hay) if (ch === q[i]) i++;
    return i === q.length ? 10 : 0;
  };

  const render = () => {
    list.innerHTML = '';
    if (!results.length) {
      const li = document.createElement('li');
      li.className = 'palette-empty';
      li.textContent = 'No matches.';
      list.appendChild(li);
      return;
    }
    results.forEach((cmd, i) => {
      const li = document.createElement('li');
      li.className = i === selected ? 'is-selected' : '';
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(i === selected));

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML =
        `<span class="pal-icon"></span>` +
        `<span class="pal-text"><b></b>${cmd.sub ? '<small></small>' : ''}</span>` +
        `<span class="pal-kind"></span>`;
      btn.querySelector('.pal-icon').textContent = cmd.icon;
      btn.querySelector('b').textContent = cmd.title;
      if (cmd.sub) btn.querySelector('small').textContent = cmd.sub;
      btn.querySelector('.pal-kind').textContent = cmd.kind;

      btn.addEventListener('click', (e) => { e.preventDefault(); execute(cmd); });
      li.appendChild(btn);
      list.appendChild(li);
    });
  };

  const execute = (cmd) => {
    close();
    setTimeout(() => cmd.run(), 120);
  };

  const filter = () => {
    const q = input.value.trim().toLowerCase();
    results = commands
      .map((c) => ({ c, s: score(c, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.c);
    selected = 0;
    render();
  };

  const open = () => {
    if (dialog.open) return;
    input.value = '';
    filter();
    dialog.showModal();
    requestAnimationFrame(() => input.focus());
  };

  const close = () => { if (dialog.open) dialog.close(); };

  input.addEventListener('input', filter);

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || (e.key === 'n' && e.ctrlKey)) {
      e.preventDefault();
      selected = (selected + 1) % Math.max(results.length, 1);
      render();
      list.children[selected]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp' || (e.key === 'p' && e.ctrlKey)) {
      e.preventDefault();
      selected = (selected - 1 + Math.max(results.length, 1)) % Math.max(results.length, 1);
      render();
      list.children[selected]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selected]) execute(results[selected]);
    }
  });

  // Click on the backdrop closes.
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });

  $('#paletteBtn')?.addEventListener('click', open);

  return { open, close };
})();

/* ==========================================================================
   Mini terminal
   ========================================================================== */
const terminal = (() => {
  const panel = $('#terminal');
  const out = $('#termOut');
  const input = $('#termInput');
  if (!panel || !out || !input) return { open: () => {}, toggle: () => {} };

  const history = [];
  let historyIdx = -1;

  const write = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    out.appendChild(div);
    const body = $('#termBody');
    if (body) body.scrollTop = body.scrollHeight;
  };

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const COMMANDS = {
    help: () => write(
      `<span class="t-dim">Available commands</span>\n` +
      `  <span class="t-key">whoami</span>      who you're talking to\n` +
      `  <span class="t-key">skills</span>      the stack, grouped\n` +
      `  <span class="t-key">experience</span>  roles, newest first\n` +
      `  <span class="t-key">projects</span>    selected work\n` +
      `  <span class="t-key">education</span>   degree + coursework\n` +
      `  <span class="t-key">contact</span>     how to reach me\n` +
      `  <span class="t-key">resume</span>      open the resume\n` +
      `  <span class="t-key">theme</span>       [midnight|daylight|terminal]\n` +
      `  <span class="t-key">goto</span>        jump to a section\n` +
      `  <span class="t-key">gator</span>       chomp\n` +
      `  <span class="t-key">clear</span>       wipe the scrollback\n` +
      `  <span class="t-key">exit</span>        close this terminal`
    ),

    whoami: () => write(
      `ajay sommi\n` +
      `<span class="t-dim">Software engineer · Gainesville, FL · U.S. citizen</span>\n` +
      `B.S. Computer Science, University of Florida.\n` +
      `Backend services, cloud data plumbing, and internal tools\n` +
      `that hold up after the demo.`
    ),

    skills: () => write(
      `<span class="t-key">languages</span>  C#, C++, Python, Java, JavaScript, TypeScript, SQL\n` +
      `<span class="t-key">cloud</span>      Azure, Blob Storage, CosmosDB, Azure SQL, KQL, Power BI\n` +
      `<span class="t-key">frameworks</span> .NET, Blazor, React, Next.js, Node.js\n` +
      `<span class="t-key">devops</span>     Git, Azure DevOps, Docker, GitHub Actions`
    ),

    experience: () => write(
      `<span class="t-key">2026 on</span>    Software Engineering Intern · ADT\n` +
      `<span class="t-key">2026</span>       SWE Co-op, R&amp;D · Hunter Engineering\n` +
      `<span class="t-key">2025</span>       SWE Intern · JM Family Enterprises\n` +
      `<span class="t-key">2024</span>       SWE Intern · Southeast Toyota Distributors\n` +
      `<span class="t-key">2023/24</span>    AI Cybersecurity Researcher · FICS @ UF\n` +
      `<span class="t-key">2022/23</span>    SWE Intern · Robotics For All\n` +
      `<span class="t-key">2020</span>       SEO Analyst · Shiva Robotics Academy\n` +
      `<span class="t-key">2019/20</span>    Software Developer · Renaissance Jax\n` +
      `<span class="t-dim">Run \`goto experience\` to walk the path.</span>`
    ),

    projects: () => write(
      `<a href="https://github.com/ajaysommi/SommiScript" target="_blank" rel="noopener">SommiScript</a>      custom language + Java interpreter\n` +
      `<a href="https://github.com/ajaysommi/GatorGoods" target="_blank" rel="noopener">GatorGoods</a>       MERN marketplace for UF students\n` +
      `<a href="https://github.com/ajaysommi/BalanceTree" target="_blank" rel="noopener">BalanceTree</a>      self-balancing AVL tree in C++\n` +
      `<a href="https://github.com/ajaysommi/Car-Crash-Analyzation-Tool" target="_blank" rel="noopener">CrashAnalysis</a>    vehicle fatality trends, 1996 to 2022\n` +
      `WAD+FUSE         a real mountable file system in C++`
    ),

    education: () => write(
      `University of Florida, B.S. Computer Science\n` +
      `<span class="t-dim">Herbert Wertheim College of Engineering · Dec 2026</span>\n` +
      `UF AI Certificate. OS, databases, DSA, software engineering,\n` +
      `artificial intelligence, cybersecurity.`
    ),

    contact: () => write(
      `email     <a href="mailto:ajaysommi7@gmail.com">ajaysommi7@gmail.com</a>\n` +
      `github    <a href="https://github.com/ajaysommi" target="_blank" rel="noopener">github.com/ajaysommi</a>\n` +
      `linkedin  <a href="https://www.linkedin.com/in/ajay-sommi/" target="_blank" rel="noopener">in/ajay-sommi</a>`
    ),

    resume: () => { write(`<span class="t-dim">opening resume…</span>`); setTimeout(() => { location.href = 'resume.html'; }, 500); },

    theme: (arg) => {
      if (!arg) { write(`current: <span class="t-key">${root.dataset.theme}</span>  <span class="t-dim">usage: theme [midnight|daylight|terminal]</span>`); return; }
      if (!THEMES.includes(arg)) { write(`<span class="t-warn">unknown theme "${esc(arg)}"</span>. Try midnight, daylight or terminal`); return; }
      setTheme(arg, false);
      write(`theme → <span class="t-key">${arg}</span>`);
    },

    goto: (arg) => {
      const el = arg && document.getElementById(arg);
      if (!el) { write(`<span class="t-warn">no section "${esc(arg || '')}"</span>. Try top, experience, education, projects, skills, recs, contact`); return; }
      write(`<span class="t-dim">scrolling to ${esc(arg)}…</span>`);
      el.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'start' });
    },

    gator: () => { gatorStorm(14); write(`<span class="t-warn">🐊 chomp chomp</span>. Go gators`); },

    sudo: (arg) => {
      if ((arg || '').includes('hire')) {
        write(`<span class="t-key">Permission granted.</span> Resume: <a href="resume.html">resume.html</a>\nEmail: <a href="mailto:ajaysommi7@gmail.com">ajaysommi7@gmail.com</a>`);
        confetti();
      } else {
        write(`<span class="t-warn">ajay is not in the sudoers file. This incident has been reported.</span>`);
      }
    },

    clear: () => { out.innerHTML = ''; },
    exit: () => close(),
  };

  const ALIASES = { ls: 'help', man: 'help', '?': 'help', who: 'whoami', exp: 'experience', work: 'experience', proj: 'projects', edu: 'education', email: 'contact', cv: 'resume', quit: 'exit', close: 'exit' };

  const run = (raw) => {
    const line = raw.trim();
    write(`<span class="t-dim">ajay@portfolio ~ %</span> <span class="t-cmd">${esc(line)}</span>`);
    if (!line) return;

    history.unshift(line);
    historyIdx = -1;

    const [head, ...rest] = line.split(/\s+/);
    const name = ALIASES[head.toLowerCase()] || head.toLowerCase();
    const fn = COMMANDS[name];

    if (fn) fn(rest.join(' ').trim());
    else write(`<span class="t-warn">command not found: ${esc(head)}</span>. Type <span class="t-key">help</span>`);
  };

  const open = () => {
    if (!panel.hidden) { input.focus(); return; }
    panel.hidden = false;
    if (!out.childElementCount) {
      write(`<span class="t-dim">ajay-portfolio ${new Date().getFullYear()} · type </span><span class="t-key">help</span><span class="t-dim"> to get started</span>`);
    }
    requestAnimationFrame(() => input.focus());
  };

  const close = () => { panel.hidden = true; };
  const toggle = () => (panel.hidden ? open() : close());

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { run(input.value); input.value = ''; }
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIdx < history.length - 1) { historyIdx++; input.value = history[historyIdx]; }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) { historyIdx--; input.value = history[historyIdx]; }
      else { historyIdx = -1; input.value = ''; }
    } else if (e.key === 'Escape') { close(); }
  });

  $('#termClose')?.addEventListener('click', close);
  $('#termBody')?.addEventListener('click', () => input.focus());

  return { open, close, toggle };
})();

/* ==========================================================================
   Confetti + gator storm
   ========================================================================== */
function confetti(count = 90) {
  if (prefersReduced()) return;
  const colors = ['#71FFE9', '#3BA4F6', '#FA4616', '#0021A5', '#ffffff'];
  for (let i = 0; i < count; i++) {
    const bit = document.createElement('div');
    bit.className = 'confetti-bit';
    bit.style.left = `${Math.random() * 100}vw`;
    bit.style.top = `${-10 - Math.random() * 20}vh`;
    bit.style.background = colors[Math.floor(Math.random() * colors.length)];
    bit.style.setProperty('--dx', `${(Math.random() - 0.5) * 320}px`);
    bit.style.setProperty('--spin', `${Math.random() * 1080}deg`);
    bit.style.setProperty('--dur-fall', `${1.9 + Math.random() * 1.7}s`);
    document.body.appendChild(bit);
    bit.addEventListener('animationend', () => bit.remove(), { once: true });
  }
}

function flyGator(x, y) {
  if (prefersReduced()) return;
  const emojis = ['🐊', '🧡', '💙', '🏈', '🎓', '📘', '📚', '💻', '📎', '🌴'];
  const el = document.createElement('div');
  el.className = 'flying-gator';
  el.textContent = emojis[Math.floor(Math.random() * emojis.length)];

  const w = innerWidth, h = innerHeight;
  const ends = [
    { x: w + 90, y: Math.random() * h },
    { x: -90, y: Math.random() * h },
    { x: Math.random() * w, y: -90 },
    { x: Math.random() * w, y: h + 90 },
  ];
  const end = ends[Math.floor(Math.random() * ends.length)];

  el.style.setProperty('--start-x', `${x}px`);
  el.style.setProperty('--start-y', `${y}px`);
  el.style.setProperty('--end-x', `${end.x}px`);
  el.style.setProperty('--end-y', `${end.y}px`);
  el.style.setProperty('--spin', `${(Math.random() - 0.5) * 720}deg`);

  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove(), { once: true });
}

function gatorStorm(n = 12) {
  for (let i = 0; i < n; i++) {
    setTimeout(() => flyGator(Math.random() * innerWidth, innerHeight * (0.3 + Math.random() * 0.5)), i * 90);
  }
}

/* The gator flourish is opt-in now: reachable via the terminal `gator`
   command, the command palette, and the Konami code, not fired at anyone
   who happens to hover the education card. */

/* ==========================================================================
   Global keyboard shortcuts
   ========================================================================== */
(function shortcuts() {
  const isTyping = (el) =>
    el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);

  document.addEventListener('keydown', (e) => {
    // ⌘K / Ctrl+K opens the command palette
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      palette.open();
      return;
    }
    if (isTyping(document.activeElement)) return;

    // "/" focuses the palette too, like most dev tools.
    if (e.key === '/') { e.preventDefault(); palette.open(); return; }
    // "~" or "`" toggles the terminal.
    if (e.key === '~' || e.key === '`') { e.preventDefault(); terminal.toggle(); return; }
    // "t" cycles the theme.
    if (e.key.toLowerCase() === 't' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      setTheme(THEMES[(THEMES.indexOf(root.dataset.theme) + 1) % THEMES.length]);
    }
  });

  // Konami code
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let pos = 0;
  document.addEventListener('keydown', (e) => {
    if (isTyping(document.activeElement)) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    pos = key === KONAMI[pos] ? pos + 1 : (key === KONAMI[0] ? 1 : 0);
    if (pos === KONAMI.length) {
      pos = 0;
      confetti(140);
      gatorStorm(20);
      toast('Konami unlocked. Go gators 🐊');
    }
  });
})();

/* ==========================================================================
   Live local time chip (America/New_York, Gainesville)
   ========================================================================== */
(function localTime() {
  const el = $('#localTime');
  if (!el) return;

  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
  });

  const tick = () => { el.textContent = `Gainesville, FL · ${fmt.format(new Date())}`; };
  tick();
  setInterval(tick, 30_000);
})();

/* ==========================================================================
   Console greeting for the curious
   ========================================================================== */
console.log(
  '%cAjay Sommi%c\nPoking around the console? Try pressing ~ on the page for a terminal,\nor ⌘K for the command palette.\n\nmailto:ajaysommi7@gmail.com',
  'font-size:20px;font-weight:700;color:#71FFE9',
  'color:#9fb2c4;font-family:monospace;line-height:1.6'
);
