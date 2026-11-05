/* ==========================================================================
   Time travel, between the standard site and the eras.

   Leaving: the page is pulled away into the past. Space around it starts to
   ripple, a little and then a lot, as if the page were seen through moving
   water; it falls away from you, turning; its light stretches toward red as
   it recedes, the way light from something moving away does, and its
   colours pull apart, red one way and blue the other. Then it is a dim red
   ember in the dark, and the eras page opens out of that dark.

   Arriving on the eras page: the same in reverse and quicker. The page
   comes in already near, shifted toward blue, rippling, and settles.

   Everything is one SVG filter (the ripple, the colour split and the
   shift) and a transform on the page, driven frame by frame. Reduced
   motion skips all of it.
   ========================================================================== */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'aj-warp';
  const NS = 'http://www.w3.org/2000/svg';
  const ease = {
    in: (t) => t * t * t,
    out: (t) => 1 - Math.pow(1 - t, 3),
    inOut: (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
  };
  const lerp = (a, b, t) => a + (b - a) * t;

  /* The filter: noise that flows, used to displace the page; the page
     split into its red and its green and blue, each moved its own way; and
     a colour matrix that leans every colour toward red (or blue). */
  const build = () => {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:fixed;width:0;height:0;pointer-events:none';
    svg.innerHTML = `<filter id="aj-warp" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.009" numOctaves="2" seed="7" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" result="moved"/>
      <feColorMatrix in="moved" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red"/>
      <feOffset in="red" dx="0" dy="0" result="redOff"/>
      <feColorMatrix in="moved" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="cyan"/>
      <feOffset in="cyan" dx="0" dy="0" result="cyanOff"/>
      <feBlend in="redOff" in2="cyanOff" mode="screen" result="split"/>
      <feColorMatrix in="split" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"/>
    </filter>`;
    document.body.appendChild(svg);
    const q = (s) => svg.querySelector(s);
    return {
      svg,
      noise: q('feTurbulence'), disp: q('feDisplacementMap'),
      red: q('feOffset[result="redOff"]'), cyan: q('feOffset[result="cyanOff"]'),
      shift: q('feColorMatrix:not([result])')
    };
  };
  /* k from -1 (toward blue) through 0 (as is) to 1 (toward red); dim from 1
     (as bright) down. */
  const matrix = (k, dim) => {
    const r = Math.max(0, k), b = Math.max(0, -k);
    const rows = [
      [lerp(1, 1.05, r) * dim, lerp(0, .55, r) * dim, lerp(0, .25, r) * dim],
      [lerp(0, .08, b) * dim, lerp(1, .42, r) * dim, lerp(0, .2, b) * dim],
      [lerp(0, .25, b) * dim, lerp(0, .35, b) * dim, lerp(lerp(1, .18, r), 1.1, b) * dim]
    ];
    return rows.map((row) => row.join(' ') + ' 0 0').join('  ') + '  0 0 0 1 0';
  };

  /* A vignette that closes in, warm at its edge, over everything. */
  const veil = () => {
    const v = document.createElement('div');
    v.setAttribute('aria-hidden', 'true');
    v.style.cssText = 'position:fixed;inset:0;z-index:2147483646;pointer-events:none;opacity:0;background:radial-gradient(closest-side at 50% 50%, rgba(0,0,0,0) var(--r, 120%), rgba(30,4,2,.55) calc(var(--r, 120%) + 18%), #060203 calc(var(--r, 120%) + 40%))';
    document.documentElement.appendChild(v);
    return v;
  };

  /* Leaving for the eras page. */
  let going = false;
  /* A phone gets the same fall and the same shift to red, drawn with the
     browser's plain colour filters, which it can keep up with. */
  const light = matchMedia('(pointer: coarse)').matches;
  const leave = (href) => {
    going = true;
    const f = build(), v = veil();
    const root = document.documentElement, body = document.body;
    const sy = scrollY, vh = innerHeight;
    /* Things pinned to the window (the menu bar) would jump to the top of
       the page once the page is moved; they are set down where they are. */
    const pinned = [];
    for (const el of body.querySelectorAll('*')) {
      if (getComputedStyle(el).position !== 'fixed') continue;
      const r = el.getBoundingClientRect();
      if (!r.width || r.bottom < 0 || r.top > vh) continue;
      pinned.push([el, el.getAttribute('style')]);
      Object.assign(el.style, { position: 'absolute', top: r.top + sy + 'px', left: r.left + 'px', width: r.width + 'px', height: r.height + 'px', right: 'auto', bottom: 'auto', margin: '0', transform: 'none' });
    }
    /* Only what is on screen goes through the filter: the whole length of
       the page would be far too much to bend sixty times a second. */
    const fe = f.svg.querySelector('filter');
    Object.entries({ filterUnits: 'userSpaceOnUse', primitiveUnits: 'userSpaceOnUse', x: -innerWidth * .25, y: sy - vh * .25, width: innerWidth * 1.5, height: vh * 1.5 }).forEach(([k, v]) => fe.setAttribute(k, v));
    root.style.background = '#060203';
    root.style.overflow = 'hidden';
    body.style.transformOrigin = `50% ${sy + vh / 2}px`;
    body.style.filter = light ? '' : 'url(#aj-warp)';
    body.style.willChange = 'transform, filter';
    const D = 1800, t0 = performance.now();
    try { sessionStorage.setItem(KEY, String(Date.now())); } catch (e) {}
    const step = (now) => {
      const t = Math.min(1, (now - t0) / D);
      // the ripple swells, then the page is too far away to see it
      const w = Math.sin(Math.min(1, t / .82) * Math.PI) ;
      const flow = now * .00012;
      f.noise.setAttribute('baseFrequency', `${(0.0016 + t * 0.0022).toFixed(5)} ${(0.0032 + t * 0.004 + Math.sin(flow) * 0.0006).toFixed(5)}`);
      f.disp.setAttribute('scale', (ease.inOut(w) * 70).toFixed(1));
      const split = ease.in(t) * 26;
      f.red.setAttribute('dx', split.toFixed(1)); f.red.setAttribute('dy', (split * .35).toFixed(1));
      f.cyan.setAttribute('dx', (-split).toFixed(1)); f.cyan.setAttribute('dy', (-split * .35).toFixed(1));
      // redder and dimmer as it recedes
      f.shift.setAttribute('values', matrix(ease.inOut(Math.min(1, t * 1.25)), lerp(1, .35, ease.in(t))));
      // it falls away, turning, tilting back
      const s = lerp(1, .06, ease.in(t)), rot = ease.in(t) * -38, tilt = ease.inOut(t) * 28;
      body.style.transform = `perspective(1400px) translateZ(0) rotateX(${tilt.toFixed(2)}deg) rotate(${rot.toFixed(2)}deg) scale(${s.toFixed(4)})`;
      if (light) { const k = ease.inOut(Math.min(1, t * 1.25)); body.style.filter = `sepia(${k.toFixed(3)}) saturate(${(1 + k * 3).toFixed(3)}) hue-rotate(${(-28 * k).toFixed(1)}deg) brightness(${lerp(1, .4, ease.in(t)).toFixed(3)}) blur(${(ease.in(t) * 3).toFixed(2)}px)`; }
      v.style.opacity = String(Math.min(1, t * 1.6));
      v.style.setProperty('--r', (lerp(120, 0, ease.in(t))).toFixed(1) + '%');
      if (t < 1) requestAnimationFrame(step);
      else location.href = href;
    };
    requestAnimationFrame(step);
    /* Back to this page from the browser's history: put it all back. */
    addEventListener('pageshow', (e) => {
      if (!e.persisted) return;
      going = false;
      body.style.transform = body.style.filter = body.style.willChange = body.style.transformOrigin = '';
      root.style.background = root.style.overflow = '';
      f.svg.remove(); v.remove();
      pinned.forEach(([el, st]) => { if (st == null) el.removeAttribute('style'); else el.setAttribute('style', st); });
    }, { once: true });
  };

  /* Arriving on the eras page from the standard site. */
  const arrive = () => {
    let at = 0;
    try { at = +sessionStorage.getItem(KEY) || 0; sessionStorage.removeItem(KEY); } catch (e) {}
    if (!at || Date.now() - at > 8000) return;
    const f = build(), body = document.body;
    body.style.filter = light ? '' : 'url(#aj-warp)';
    body.style.willChange = 'transform, filter';
    const D = 1100, t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / D), e = ease.out(t);
      const w = 1 - e;
      f.noise.setAttribute('baseFrequency', `${(0.0018 + w * 0.002).toFixed(5)} ${(0.0036 + w * 0.003).toFixed(5)}`);
      f.disp.setAttribute('scale', (w * w * 60).toFixed(1));
      const split = w * w * 18;
      f.red.setAttribute('dx', (-split).toFixed(1)); f.cyan.setAttribute('dx', split.toFixed(1));
      // coming toward you, its light is shifted the other way, to blue
      f.shift.setAttribute('values', matrix(-w * .8, lerp(.5, 1, e)));
      if (light) body.style.filter = `hue-rotate(${(w * 40).toFixed(1)}deg) saturate(${(1 + w).toFixed(3)}) brightness(${lerp(.5, 1, e).toFixed(3)}) blur(${(w * 3).toFixed(2)}px)`;
      body.style.transform = `scale(${lerp(1.35, 1, e).toFixed(4)}) rotate(${(w * 10).toFixed(2)}deg)`;
      if (t < 1) requestAnimationFrame(step);
      else { body.style.transform = body.style.filter = body.style.willChange = ''; f.svg.remove(); }
    };
    requestAnimationFrame(step);
  };

  if (reduce) return;
  if (document.getElementById('picker') || /eras\.html$/.test(location.pathname)) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrive); else arrive();
    return;
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href="eras.html"]');
    if (!a || going || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    leave(a.href);
  }, true);
})();
