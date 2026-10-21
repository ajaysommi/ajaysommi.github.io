/* ==========================================================================
   Minimal: the field moves
   Design experiment, with minimal.css. Drives the abstract field behind the
   page with three things, all written onto the ground (.bg):

     --mx, --my   where the cursor is, -1 to 1 across the window, eased
                  slowly so the field drifts after the pointer.
     fade         the field's opacity, full at the top and down to about a
                  sixth once the hero has scrolled away, so the field steps
                  back behind the content.
     data-scene   the section being read. minimal.css gives each one its own
                  arrangement and the shapes glide and morph between them.

   And once, on arrival: the small marks wait a little way in from their
   places while the loader is up, and spread out to them as it lifts; the
   coloured ones then fade away.

   Only the ground's and the hero's own small subtrees restyle when these
   change, never the whole page. The cursor loop stops as soon as it has
   settled, and the scene only changes when the section does. With reduced
   motion the cursor and the scenes are ignored: the field holds its first
   arrangement and only fades.
   ========================================================================== */
(function minimalField() {
  const ground = document.querySelector('.bg');
  if (!ground) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');

  /* ---- arrival ---------------------------------------------------------- */
  const burst = [...ground.querySelectorAll('.m-dots, .m-dot, .m-square, .m-plus, .m-tri, .m-bit')];
  if (reduce.matches) ground.classList.add('m-settled');
  else if (burst.length) {
    burst.forEach((el) => el.classList.add('m-burst'));
    ground.classList.add('m-intro');
    const go = () => {
      if (!ground.classList.contains('m-intro')) return;
      ground.classList.add('m-bursting');
      ground.classList.remove('m-intro');
      // Partway out, the coloured marks start their fade, so they are gone
      // as the spread comes to rest. A running transition is not cut short
      // by a change of timing, so the spread itself finishes undisturbed,
      // and then the slow scene glide takes over.
      setTimeout(() => ground.classList.add('m-settled'), 900);
      setTimeout(() => ground.classList.remove('m-bursting'), 2900);
    };
    const loader = document.getElementById('pageLoader');
    const showing = () => loader.classList.contains('is-revealing') || loader.classList.contains('is-done');
    if (loader && !showing()) {
      // Fires as the lid uncovers the page, so the burst is seen as it
      // comes into view.
      const mo = new MutationObserver(() => {
        if (showing()) { mo.disconnect(); requestAnimationFrame(go); }
      });
      mo.observe(loader, { attributes: true, attributeFilter: ['class'] });
      setTimeout(go, 6600);   // the loader gives up at 4s, and its lid takes about 2s more
    } else {
      // No loader (the resume page): let the cluster be drawn once, then go.
      requestAnimationFrame(() => requestAnimationFrame(go));
    }
  }

  /* ---- cursor --------------------------------------------------------- */
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  let lastX = '', lastY = '';

  /* Two decimals is a twentieth of a pixel of drift, finer than anything
     can be seen; at three, the slow tail of every glide wrote a new value
     on every frame for a second or more, each one restyling the ground. */
  const frame = () => {
    raf = 0;
    x += (tx - x) * 0.05;
    y += (ty - y) * 0.05;
    if (Math.abs(tx - x) < 0.005) x = tx;
    if (Math.abs(ty - y) < 0.005) y = ty;
    const mx = x.toFixed(2), my = y.toFixed(2);
    if (mx !== lastX) { ground.style.setProperty('--mx', mx); lastX = mx; }
    if (my !== lastY) { ground.style.setProperty('--my', my); lastY = my; }
    if (x !== tx || y !== ty) raf = requestAnimationFrame(frame);
  };
  const wake = () => { if (!raf) raf = requestAnimationFrame(frame); };

  addEventListener('pointermove', (e) => {
    if (reduce.matches || !fine.matches || e.pointerType !== 'mouse') return;
    tx = (e.clientX / innerWidth) * 2 - 1;
    ty = (e.clientY / innerHeight) * 2 - 1;
    wake();
  }, { passive: true });

  // Leaving the window lets the field settle back to centre.
  document.addEventListener('pointerout', (e) => {
    if (!e.relatedTarget) { tx = 0; ty = 0; wake(); }
  });

  /* ---- scroll: fade and scene ------------------------------------------ */
  const scenes = [
    // The logo strip belongs to the opening: the hero's arrangement holds
    // through it, and the field first moves on reaching The Path.
    ['hero', '.hero'],
    ['path', '#experience'],
    ['education', '#education'],
    ['projects', '#projects'],
    ['skills', '#skills'],
    ['recs', '#recs'],
    ['contact', '#contact'],
  ].map(([name, sel]) => [name, document.querySelector(sel)]).filter(([, el]) => el);

  let lastOp = '', scene = '';
  /* The fade is written straight onto the field's opacity, not as a
     variable on the ground: a variable there made every shape's style be
     worked out again on every frame of a scroll, which on a phone was most
     of what made the field stutter. Opacity alone is the compositor's job. */
  const field = ground.querySelector('.m-field');
  // How strong the field is at its strongest, at the top of the page, and
  // where it settles once the hero has gone by. Quieter on a phone, where
  // the shapes sit behind the text rather than beside it.
  const phone = matchMedia('(max-width: 719px)');
  const PEAK = 0.34, REST = 0.08;
  const PHONE_PEAK = 0.24, PHONE_REST = 0.055;

  /* Reads, then writes: run with the site's other scroll effects in one
     pass per frame (reads first for all of them), so none of them makes
     another lay the page out again mid frame. */
  const job = () => {
    const y = scrollY, vh = innerHeight;
    // Faded fully once the first screen has gone by.
    const fade = Math.min(1, Math.max(0, y / (vh * 0.85)));
    const p = phone.matches ? PHONE_PEAK : PEAK, r = phone.matches ? PHONE_REST : REST;
    const op = (p + (r - p) * fade).toFixed(3);
    let now = scene;
    if (!reduce.matches && scenes.length) {
      // The section whose top has passed the middle of the screen.
      now = scenes[0][0];
      const mid = vh * 0.5;
      for (const [name, el] of scenes) {
        if (el.getBoundingClientRect().top <= mid) now = name;
        else break;
      }
      // The last section is too short to reach the middle; the end of the
      // page counts as arriving in it.
      if (y >= document.documentElement.scrollHeight - vh - 4) now = scenes[scenes.length - 1][0];
    }
    if (op === lastOp && now === scene) return;
    return () => {
      if (op !== lastOp) { if (field) field.style.opacity = op; lastOp = op; }
      if (now !== scene) { scene = now; ground.dataset.scene = now; }
    };
  };

  if (window.onScrollFrame) window.onScrollFrame(job);
  else {
    let ticking = false;
    const run = () => { ticking = false; const w = job(); if (w) w(); };
    const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } };
    addEventListener('scroll', request, { passive: true });
    addEventListener('resize', request, { passive: true });
    run();
  }
})();

/* ==========================================================================
   Minimal: the portrait catches the cursor
   With a mouse over the hero portrait, the orange disc leads: it slides
   toward the cursor, at the same distance it sits at rest, and the blue
   arc turns to the opposite side. minimal.css eases both. On leaving, they
   go back to where they rest, orange low right and blue high left. The arc's turn is
   kept continuous, so passing round the bottom never spins it the long way.
   Mouse only, and not with reduced motion.
   ========================================================================== */
(function portraitLight() {
  const fig = document.querySelector('.hero-figure');
  if (!fig) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const REACH = 14;          // the disc's offset at rest, 10px each way
  let arc = 0;               // degrees, unwrapped

  const turnTo = (target) => {
    arc += ((target - arc) % 360 + 540) % 360 - 180;
    fig.style.setProperty('--fig-arc', arc.toFixed(1) + 'deg');
  };

  fig.addEventListener('pointermove', (e) => {
    if (reduce.matches || !fine.matches || e.pointerType !== 'mouse') return;
    const r = fig.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const len = Math.hypot(dx, dy);
    fig.classList.add('is-lit');
    // Right at the centre there is no direction to take; hold the last one.
    if (len < r.width * 0.06) return;
    fig.style.setProperty('--fig-ox', (dx / len * REACH).toFixed(1) + 'px');
    fig.style.setProperty('--fig-oy', (dy / len * REACH).toFixed(1) + 'px');
    // The arc rests facing up and left (-135deg) and turns to face away
    // from the cursor.
    turnTo(Math.atan2(dy, dx) * 180 / Math.PI - 45);
  });

  fig.addEventListener('pointerleave', () => {
    fig.classList.remove('is-lit');
    fig.style.removeProperty('--fig-ox');
    fig.style.removeProperty('--fig-oy');
    turnTo(0);
  });
})();
