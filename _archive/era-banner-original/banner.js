/* ==========================================================================
   The way into the eras (the banner over the hero; on a phone, a pill
   floating over the bottom nav). It waits for the page to finish loading;
   then it launches out from the direction of the nav's AJ mark (on desktop the page eases down to make room), landing
   with a glow while its machines give a short dance. If the page has already been scrolled, or
   motion is reduced, it is simply there (scrolled for, so nothing jumps).
   Once up, the year in it moves through the eras of this visitor's kind
   of device, scrambling through digits and landing in each era's type,
   and the matching machine lifts. Closed, it folds into a small chip in the
   corner (above the menu bar on a phone) until the page is loaded again.
   ========================================================================== */
(function eraBanner() {
  const wrap = document.getElementById('eraAd');
  if (!wrap) return;
  const root = document.documentElement;
  const box = wrap.querySelector('.era-ad-box'), ad = wrap.querySelector('.era-ad');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const RAINBOW = ['#61bb46', '#fdb827', '#f5821f', '#e03a3e', '#963d97', '#009ddc'];

  const mini = document.getElementById('eraMini');
  const fold = (animate) => {
    wrap.classList.add('is-off');
    if (!mini) return;
    mini.hidden = false;
    if (animate) mini.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1.06)', offset: .7 }, { opacity: 1, transform: 'none' }], { duration: 340, easing: 'cubic-bezier(.2, .7, .3, 1)' });
  };
  wrap.querySelector('.era-ad-x').addEventListener('click', () => {
    wrap.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, easing: 'ease-in' }).finished.then(() => fold(true));
  });

  /* ---- the year ---- */
  const yr = wrap.querySelector('.era-yr');
  const phone = matchMedia('(max-width: 719px)');
  const years = () => (phone.matches ? ['2000', '2004', '2007'] : ['1983', '1991', '1998', '2007']);
  const light = (y) => wrap.querySelectorAll('.era-dv').forEach((d) => d.classList.toggle('is-on', d.dataset.y === y && getComputedStyle(d).display !== 'none'));
  const land = (y) => { yr.textContent = y; yr.dataset.y = y; yr.classList.remove('is-scramble'); light(y); };
  let k = 0;
  land(years()[0]);
  phone.addEventListener('change', () => { k = 0; land(years()[0]); });
  const cycle = () => {
    if (reduce) return;
    let seen = true, timer = 0;
    const step = () => {
      const list = years();
      k = (k + 1) % list.length;
      const y = list[k];
      yr.classList.add('is-scramble');
      let n = 0;
      const roll = setInterval(() => {
        n++;
        // the digits settle left to right
        yr.textContent = y.split('').map((c, i) => (n > 3 + i * 2 ? c : Math.floor(Math.random() * 10))).join('');
        if (n > 9) { clearInterval(roll); land(y); }
      }, 45);
    };
    const run = () => { clearInterval(timer); if (seen && !document.hidden) timer = setInterval(step, 2400); };
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; run(); }).observe(wrap);
    document.addEventListener('visibilitychange', run);
    run();
  };

  /* ---- arriving ---- */
  const navMark = () => {
    const m = document.querySelector('header.nav .brand-mark svg.brand-aj');
    const r = m && m.getBoundingClientRect();
    return r && r.width > 0 && r.bottom > 0 && r.top < innerHeight ? m : null;
  };
  const instantly = () => {
    const before = wrap.getBoundingClientRect().height, above = wrap.getBoundingClientRect().top < 0;
    wrap.style.transition = 'none';
    wrap.classList.add('is-open', 'is-served', 'is-done');
    if (!phone.matches && (above || scrollY > 40)) scrollBy(0, wrap.getBoundingClientRect().height - before);
    requestAnimationFrame(() => { wrap.style.transition = ''; });
    cycle();
  };
  const sparkle = () => {
    const r = ad.getBoundingClientRect();
    for (let i = 0; i < 12; i++) {
      const e = document.createElement('i');
      e.className = 'era-spark';
      // around the edge: along the top and bottom, and off both ends
      const side = i % 4, f = Math.random();
      const x = side < 2 ? r.left + f * r.width : side === 2 ? r.left : r.right;
      const y = side === 0 ? r.top : side === 1 ? r.bottom : r.top + f * r.height;
      const dx = side === 2 ? -1 : side === 3 ? 1 : (f - .5) * .8, dy = side === 0 ? -1 : side === 1 ? 1 : (Math.random() - .5);
      const d = 16 + Math.random() * 22, sc = .6 + Math.random() * .7;
      e.style.cssText = `left:${x}px;top:${y}px;--c:${RAINBOW[i % 6]}`;
      document.body.appendChild(e);
      e.animate([
        { transform: 'translate(0,0) scale(0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx * d * .6}px,${dy * d * .6}px) scale(${sc}) rotate(45deg)`, opacity: 1, offset: .45 },
        { transform: `translate(${dx * d}px,${dy * d}px) scale(0) rotate(90deg)`, opacity: 0 }
      ], { duration: 700 + Math.random() * 300, delay: Math.random() * 180, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'both' }).finished.then(() => e.remove());
    }
  };
  const serve = async () => {
    const mark = navMark();
    if (reduce || !mark || (!phone.matches && scrollY > 40)) { instantly(); return; }
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
    // the pop plays out in full before it is set down
    await new Promise((r) => {
      const end = (e) => { if (e.animationName === 'era-ad-launch') { clearTimeout(t); ad.removeEventListener('animationend', end); r(); } };
      const t = setTimeout(() => { ad.removeEventListener('animationend', end); r(); }, 600);
      ad.addEventListener('animationend', end);
    });
    // landing: a glow (and on a phone, a few sparkles)
    ad.classList.add('is-glow');
    wrap.classList.add('is-done', 'is-dance');
    if (phone.matches) sparkle();
    setTimeout(() => ad.classList.remove('is-glow'), 1100);
    cycle();
  };

  // after the page has loaded and its loading screen has gone
  const go = () => setTimeout(serve, 700);
  if (!root.classList.contains('is-loading')) go();
  else {
    const mo = new MutationObserver(() => { if (!root.classList.contains('is-loading')) { mo.disconnect(); go(); } });
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
  }
})();
