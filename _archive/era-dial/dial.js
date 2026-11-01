/* ==========================================================================
   The way into the eras: a tuning dial for years. The needle rests on this
   year. Slide it back and the bar turns into each year it reaches; let go on
   one and that machine starts up, let go near the end and it swings home.
   A tap on the ruler does the same, and the arrow keys and Return work too.
   Now and then the needle stirs back a little on its own, the only hint it
   moves. Closed, it folds to a small chip until the page is loaded again.
   ========================================================================== */
(function eraBanner() {
  const wrap = document.getElementById('eraAd');
  if (!wrap) return;
  const root = document.documentElement;
  const dial = wrap.querySelector('.era-ad'), rail = wrap.querySelector('.ed-rail'), needle = wrap.querySelector('.ed-needle');
  const read = wrap.querySelector('.ed-read'), yearEl = wrap.querySelector('.ed-year'), cap = wrap.querySelector('.ed-cap');
  const ticks = wrap.querySelector('.ed-ticks');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone = matchMedia('(max-width: 719px)');
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const NOW = new Date().getFullYear();
  const ERAS = () => (phone.matches
    ? [[2000, 'Snake on it', 'nokia'], [2004, '1,000 songs', 'pocket'], [2007, 'Slide to unlock', 'iphone']]
    : [[1983, 'A blinking cursor', '1983'], [1991, 'One-bit windows', '1991'], [1998, 'Dialing up', '1998'], [2007, 'A dock that swells', '2007']]);

  const mini = document.getElementById('eraMini');
  const fold = (animate) => {
    wrap.classList.add('is-off');
    if (!mini) return;
    document.getElementById('eraMiniY').textContent = NOW;
    mini.hidden = false;
    if (animate) mini.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1.06)', offset: .7 }, { opacity: 1, transform: 'none' }], { duration: 340, easing: 'cubic-bezier(.2, .7, .3, 1)' });
  };
  wrap.querySelector('.era-ad-x').addEventListener('click', () => {
    wrap.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, easing: 'ease-in' }).finished.then(() => fold(true));
  });

  /* ---- the ruler ---- */
  let list = ERAS(), first = list[0][0], at = NOW, anim = 0, busy = false;
  /* The stops sit evenly along the ruler, with the years between spread to fit,
     so eras a few years apart don't crowd together. */
  const stops = () => [...list.map((e) => e[0]), NOW];
  const fx = (y) => {
    const s = stops(), i = Math.max(0, s.findIndex((v, k) => y <= s[k + 1]));
    return (i + (y - s[i]) / (s[i + 1] - s[i])) / (s.length - 1);
  };
  const fromX = (f) => {
    const s = stops(), p = f * (s.length - 1), i = Math.min(s.length - 2, Math.floor(p));
    return s[i] + (p - i) * (s[i + 1] - s[i]);
  };
  const nearest = (y) => list.reduce((b, e) => (Math.abs(e[0] - y) < Math.abs(b[0] - y) ? e : b));
  const build = () => {
    list = ERAS(); first = list[0][0];
    let html = '';
    for (let y = first; y <= NOW; y++) html += `<i style="left:${fx(y) * 100}%"${list.some((e) => e[0] === y) ? ' class="is-era"' : ''}></i>`;
    list.forEach((e) => { html += `<span style="left:${fx(e[0]) * 100}%">${e[0]}</span>`; });
    html += `<span style="left:100%">now</span>`;
    ticks.innerHTML = html;
    rail.setAttribute('aria-valuemin', first);
    rail.setAttribute('aria-valuemax', NOW);
    draw(NOW);
  };
  /* Close to a year with a machine, the needle's reading sticks to it. */
  const draw = (y) => {
    at = y;
    needle.style.translate = `${fx(y) * rail.clientWidth}px 0`;
    const n = nearest(y), on = Math.abs(fx(n[0]) - fx(y)) <= .05 ? n : null;
    const shown = on ? on[0] : Math.round(y);
    yearEl.textContent = shown;
    if (on) dial.dataset.y = on[0]; else delete dial.dataset.y;
    cap.textContent = on ? on[1] : y >= NOW - .05 ? 'slide back' : '';
    rail.setAttribute('aria-valuenow', shown);
    rail.setAttribute('aria-valuetext', on ? `${on[0]}. ${on[1]}` : String(shown));
  };
  const glide = (to, ms = 420) => new Promise((res) => {
    cancelAnimationFrame(anim);
    const from = at, t0 = performance.now();
    if (reduce) { draw(to); res(); return; }
    const f = (t) => {
      const q = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - q, 3);
      draw(from + (to - from) * e);
      if (q < 1) anim = requestAnimationFrame(f); else res();
    };
    anim = requestAnimationFrame(f);
  });
  const enter = async (era) => {
    busy = true;
    await glide(era[0], 300);
    await wait(240);
    location.href = `eras.html#${era[2]}`;
  };
  /* Letting go: past the halfway point back from now to the latest machine, it goes. */
  const release = () => {
    const n = nearest(at), last = list[list.length - 1][0];
    if (at > (last + NOW) / 2) glide(NOW); else enter(n);
  };
  // Back from an era through the browser's history, the needle is home again.
  addEventListener('pageshow', () => { busy = false; draw(NOW); });

  let grab = null;
  const toYear = (e) => { const r = rail.getBoundingClientRect(); return fromX(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))); };
  rail.addEventListener('pointerdown', (e) => {
    if (busy) return;
    cancelAnimationFrame(anim);
    calm();
    grab = { x: e.clientX, moved: false };
    try { rail.setPointerCapture(e.pointerId); } catch (x) {}
  });
  rail.addEventListener('pointermove', (e) => {
    if (!grab) return;
    if (!grab.moved && Math.abs(e.clientX - grab.x) < 3) return;
    grab.moved = true;
    draw(toYear(e));
  });
  const up = (e) => {
    if (!grab) return;
    const g = grab; grab = null;
    if (e.type === 'pointerup' && !g.moved) { const y = toYear(e); if (y > (list[list.length - 1][0] + NOW) / 2) glide(NOW); else enter(nearest(y)); return; }
    release();
  };
  rail.addEventListener('pointerup', up);
  rail.addEventListener('pointercancel', up);
  rail.addEventListener('keydown', (e) => {
    if (busy) return;
    const all = stops(), i = all.findIndex((y) => Math.abs(y - at) < .5);
    const from = i >= 0 ? i : all.length - 1;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); calm(); glide(all[Math.max(0, from - 1)], 260); }
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); calm(); glide(all[Math.min(all.length - 1, from + 1)], 260); }
    if (e.key === 'Enter' && at < NOW - .5) { e.preventDefault(); enter(nearest(at)); }
  });
  read.addEventListener('click', (e) => {
    if (at < NOW - .5) { e.preventDefault(); enter(nearest(at)); }   // it goes to the year showing
  });

  /* ---- the stir: a little way back and home, while the bar is on screen ---- */
  let stirT = 0, stirred = false;
  const calm = () => { clearTimeout(stirT); stirred = true; };
  const stir = async () => {
    if (stirred || reduce || grab || busy) return;
    if (!document.hidden && wrap.getBoundingClientRect().bottom > 0) {
      await glide(NOW - 4 - Math.random() * 3, 900);
      if (stirred) return;
      await wait(260);
      if (stirred) return;
      await glide(NOW, 800);
    }
    if (!stirred) stirT = setTimeout(stir, 9000);
  };
  phone.addEventListener('change', build);
  addEventListener('resize', () => draw(at), { passive: true });

  /* ---- arriving ---- */
  const instantly = () => {
    const before = wrap.getBoundingClientRect().height, above = wrap.getBoundingClientRect().top < 0;
    wrap.style.transition = 'none';
    wrap.classList.add('is-open', 'is-served', 'is-done');
    if (!phone.matches && (above || scrollY > 40)) scrollBy(0, wrap.getBoundingClientRect().height - before);
    requestAnimationFrame(() => { wrap.style.transition = ''; draw(NOW); });
  };
  const serve = async () => {
    build();
    if (reduce || (!phone.matches && scrollY > 40)) { instantly(); stirT = setTimeout(stir, 1400); return; }
    await wait(120);
    if (phone.matches) wrap.classList.add('is-open');
    else {
      /* The row opens in one step, and the page under it is slid from
         where it was down into its new place, as a transform the
         compositor runs: easing the row's own height laid the whole page
         out again on every frame. */
      const below = [];
      for (let n = wrap.nextElementSibling; n; n = n.nextElementSibling) below.push(n);
      const foot = document.querySelector('body > footer');
      if (foot) below.push(foot);
      const h0 = wrap.offsetHeight;
      wrap.style.transition = 'none';
      wrap.classList.add('is-open');
      const h = wrap.offsetHeight - h0;
      requestAnimationFrame(() => { wrap.style.transition = ''; });
      below.forEach((n) => n.animate([{ translate: `0 ${-h}px` }, { translate: '0 0' }], { duration: 720, easing: 'cubic-bezier(.3, .8, .25, 1)' }));
      await wait(90);
    }
    wrap.classList.add('is-served');
    draw(NOW);
    await wait(520);
    wrap.classList.add('is-done');
    stirT = setTimeout(stir, 1400);
  };

  // after the page has loaded and its loading screen has gone
  const go = () => setTimeout(serve, 700);
  if (!root.classList.contains('is-loading')) go();
  else {
    const mo = new MutationObserver(() => { if (!root.classList.contains('is-loading')) { mo.disconnect(); go(); } });
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
  }
})();
