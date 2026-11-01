/* ==========================================================================
   The way into the eras: a loose corner of the page. A few seconds after the
   page settles it curls up a little, and now and then a draught lifts it.
   Pull it and the page folds back over the pull: the fold is the line halfway
   between the corner and the pointer, whatever is on the corner's side of it
   shows what's underneath, and the same shape mirrored over the fold is the
   back of the paper. Pull far enough, or just tap it, and the page turns
   over all the way into the eras.
   ========================================================================== */
(function eraPeel() {
  const hit = document.getElementById('eraPeel');
  if (!hit || window.self !== window.top) return;
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = matchMedia('(max-width: 719px)');
  const REST = 26, BREEZE = 46, HOVER = 84;

  const under = document.createElement('div');
  under.className = 'pe-under';
  under.setAttribute('aria-hidden', 'true');
  const shade = document.createElement('div');
  shade.className = 'pe-shade';
  shade.setAttribute('aria-hidden', 'true');
  const paper = document.createElement('div');
  paper.className = 'pe-paper';
  shade.appendChild(paper);
  document.body.append(under, shade);
  const writeUnder = () => {
    under.innerHTML = phone.matches
      ? '<pre>SOMMIA\nSearching for network\n\nMenu <i></i></pre>'
      : '<pre>SOMMI-DOS  1.0\n(C) 1983\n\n640K OK\n\nA:\\> <i></i></pre>';
  };
  writeUnder();

  /* The corner it comes from, and the way in from there. */
  const corner = () => (phone.matches ? { x: innerWidth, y: 0, ax: -1, ay: 1 } : { x: innerWidth, y: innerHeight, ax: -1, ay: -1 });
  let d = 0, goal = 0, raf = 0, pull = null, held = null, leaving = false, stirT = 0;

  const toCss = (pts) => `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(',')})`;
  const paint = () => {
    const c = corner();
    const P = pull || { x: c.x + c.ax * d * .96, y: c.y + c.ay * d * 1.04 };
    const dist = Math.hypot(P.x - c.x, P.y - c.y);
    if (dist < 1) { under.style.display = shade.style.display = 'none'; return; }
    under.style.display = shade.style.display = '';
    const W = innerWidth, H = innerHeight;
    const M = { x: (c.x + P.x) / 2, y: (c.y + P.y) / 2 }, nx = (c.x - P.x) / dist, ny = (c.y - P.y) / dist;
    const side = ([x, y]) => (x - M.x) * nx + (y - M.y) * ny;
    /* The screen's rectangle, cut along the fold. */
    const rect = [[0, 0], [W, 0], [W, H], [0, H]], cut = [];
    rect.forEach((a, i) => {
      const b = rect[(i + 1) % 4], sa = side(a), sb = side(b);
      if (sa >= 0) cut.push(a);
      if ((sa >= 0) !== (sb >= 0)) { const t = sa / (sa - sb); cut.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    });
    const flap = cut.map(([x, y]) => { const s = side([x, y]) * 2; return [x - s * nx, y - s * ny]; });
    under.style.clipPath = toCss(cut);
    paper.style.clipPath = toCss(flap);
    /* The paper is darkest in the crease, catches the light, then falls off to its tip. */
    const dx = -nx, dy = -ny, L = Math.abs(W * dx) + Math.abs(H * dy);
    const at = (x, y) => (((x - W / 2) * dx + (y - H / 2) * dy) / L + .5) * 100;
    const t0 = at(M.x, M.y), t1 = at(P.x, P.y);
    paper.style.background = `linear-gradient(${Math.atan2(dx, -dy) * 180 / Math.PI}deg, var(--pe-a) ${t0}%, var(--pe-b) ${t0 + (t1 - t0) * .4}%, var(--pe-c) ${t1}%)`;
  };

  const ease = () => {
    raf = 0;
    if (pull) return;
    d += (goal - d) * .14;
    if (Math.abs(goal - d) < .2) d = goal; else raf = requestAnimationFrame(ease);
    paint();
  };
  const toward = (v) => { goal = v; if (reduce) { d = v; paint(); return; } if (!raf) raf = requestAnimationFrame(ease); };

  /* Now and then, while nobody is touching it. */
  const breeze = () => {
    clearTimeout(stirT);
    if (reduce) return;
    stirT = setTimeout(() => {
      if (!document.hidden && !held && !pull && goal === REST) { toward(BREEZE); setTimeout(() => { if (goal === BREEZE) toward(REST); }, 620); }
      breeze();
    }, 9000 + Math.random() * 5000);
  };

  /* All the way over: the fold runs out past the far corner of the screen. */
  const turnOver = () => {
    if (leaving) return;
    leaving = true;
    clearTimeout(stirT);
    cancelAnimationFrame(raf);
    root.classList.add('is-peeling');
    const c = corner();
    const from = pull || { x: c.x + c.ax * d, y: c.y + c.ay * d };
    const to = { x: c.x + c.ax * innerWidth * 2.1, y: c.y + c.ay * innerHeight * 2.1 };
    const go = () => { location.href = hit.getAttribute('href'); };
    if (reduce) { pull = to; paint(); go(); return; }
    const t0 = performance.now(), ms = 620;
    const f = (t) => {
      const q = Math.min(1, (t - t0) / ms), e = q * q * (3 - 2 * q);
      pull = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e };
      paint();
      if (q < 1) requestAnimationFrame(f); else setTimeout(go, 200);
    };
    requestAnimationFrame(f);
  };

  /* ---- taking hold of it ---- */
  hit.addEventListener('pointerdown', (e) => {
    if (leaving || e.button > 0) return;
    held = { x: e.clientX, y: e.clientY, moved: false };
    try { hit.setPointerCapture(e.pointerId); } catch (x) {}
    hit.classList.add('is-held');
  });
  hit.addEventListener('pointermove', (e) => {
    if (!held) return;
    if (!held.moved && Math.hypot(e.clientX - held.x, e.clientY - held.y) < 4) return;
    if (!held.moved) { held.moved = true; root.classList.add('is-peeling'); cancelAnimationFrame(raf); raf = 0; }
    pull = { x: e.clientX, y: e.clientY };
    paint();
  });
  const letGo = (e) => {
    if (!held) return;
    const moved = held.moved;
    held = null;
    hit.classList.remove('is-held');
    if (!moved) return;
    hit.dataset.dragged = '1';
    setTimeout(() => { delete hit.dataset.dragged; }, 60);
    const c = corner(), far = Math.hypot(pull.x - c.x, pull.y - c.y);
    if (e.type === 'pointerup' && far > Math.min(innerWidth, innerHeight) * .3) { turnOver(); return; }
    /* Not far enough: it falls back. */
    d = far; pull = null;
    root.classList.remove('is-peeling');
    toward(REST);
  };
  hit.addEventListener('pointerup', letGo);
  hit.addEventListener('pointercancel', letGo);
  hit.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    if (!hit.dataset.dragged) turnOver();
  });
  hit.addEventListener('contextmenu', (e) => { if (phone.matches) e.preventDefault(); });
  if (!matchMedia('(pointer: coarse)').matches) {
    hit.addEventListener('pointerenter', () => { if (!held && !leaving) toward(HOVER); });
    hit.addEventListener('pointerleave', () => { if (!held && !leaving) toward(REST); });
  }
  hit.addEventListener('focus', () => { if (hit.matches(':focus-visible')) toward(HOVER); });
  hit.addEventListener('blur', () => toward(REST));

  addEventListener('resize', () => { if (!pull) paint(); }, { passive: true });
  phone.addEventListener('change', () => { writeUnder(); paint(); });
  // Back from the eras through the browser's history: the corner is as it was.
  addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    leaving = false; pull = null; d = REST; goal = REST;
    root.classList.remove('is-peeling');
    paint();
    breeze();
  });

  /* ---- coming loose, a little after the page has settled ---- */
  const show = () => setTimeout(() => { hit.hidden = false; toward(REST); breeze(); }, 2600);
  if (!root.classList.contains('is-loading')) show();
  else {
    const mo = new MutationObserver(() => { if (!root.classList.contains('is-loading')) { mo.disconnect(); show(); } });
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
  }
})();
