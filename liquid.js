/* ==========================================================================
   The nav bar's glass, on every page
   The pocket that slides under whichever link the pointer is on, the bar's
   environment and motion, and the small press on controls. Lived in
   script.js until the resume page needed the same bar; it has its own
   helpers so it runs on any page that has the nav.
   ========================================================================== */
(() => {
const root = document.documentElement;
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const reduceMotionQuery = matchMedia('(prefers-reduced-motion: reduce)');
const prefersReduced = () => reduceMotionQuery.matches;

/* ==========================================================================
   LIQUID GLASS
   Experiment branch. The bar is treated as one persistent piece of optical
   material that changes state, rather than as elements playing animations.
   The material itself (fill, frost, tint, contrast layers, the light on
   its edges) is CSS in the liquid layer; this is everything that has to be
   computed: the environment it sits in, and how it moves. There is no
   refraction: the glass is a soft blur in every browser.

   Pointer movement writes a handful of numbers per frame and never touches
   layout. Geometry is measured on resize and cached.
   ========================================================================== */
(function liquidGlass() {
  const bar = $('header.nav');
  if (!bar) return;

  const fab = $('.dock-fab');
  const reduced = prefersReduced;
  const clamp01 = (v) => clamp(v, 0, 1);
  /* Inline style writes that skip a value already there. The loop runs every
     frame while anything is settling, and most of what it writes on most
     frames has not moved; each write would still restyle the bar and re-run
     its backdrop filter. */
  const written = new WeakMap();
  const put = (el, prop, v) => {
    let m = written.get(el);
    if (!m) written.set(el, (m = {}));
    if (m[prop] === v) return;
    m[prop] = v;
    if (prop.startsWith('--')) el.style.setProperty(prop, v);
    else el.style[prop] = v;
  };

  /* ------------------------------------------------------------------------
     Environment

     The glass takes a faint colour from what is behind it and adjusts its
     own density so what is in front of it stays legible. A backdrop cannot
     be read back from script, so this estimates it from two things it can
     know: the ambient field, whose colours and positions are already
     written on .bg, and whatever element is actually under the bar at a few
     points along it. A photograph under a dark bar darkens the glass; a
     dark stretch under a light bar lifts it. Estimates ease toward their
     targets, so nothing ever switches.
     ------------------------------------------------------------------------ */
  const field = $('.bg');
  const env = { r: 120, g: 160, b: 230, dim: 0, lift: 0 };
  const envT = { ...env };
  const parseRGBA = (s) => {
    const m = s && s.match(/rgba?\(([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:[, /]+([\d.]+))?/);
    return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null;
  };
  const luma = (r, g, b) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  function underLuma(x, y) {
    const stack = document.elementsFromPoint(x, y);
    for (const el of stack) {
      if (el === bar || bar.contains(el) || el === fab || fab?.contains(el)) continue;
      if (el === field || field?.contains(el) || el === document.body || el === root) break;
      if (el.tagName === 'IMG' || el.tagName === 'VIDEO' || el.tagName === 'CANVAS') return 0.55;
      const c = parseRGBA(getComputedStyle(el).backgroundColor);
      if (c && c[3] > 0.35) return luma(c[0], c[1], c[2]);
    }
    return null;
  }

  function sampleEnv() {
    const rect = bar.getBoundingClientRect();
    const yPct = ((rect.top + rect.height / 2) / Math.max(innerHeight, 1)) * 100;

    // Ambient colour, weighted by each field's strength and nearness.
    let r = 0, g = 0, b = 0, wsum = 0;
    if (field) {
      for (let n = 1; n <= 5; n++) {
        const c = parseRGBA(field.style.getPropertyValue(`--f${n}c`));
        if (!c) continue;
        const fx = parseFloat(field.style.getPropertyValue(`--f${n}x`)) || 50;
        const fy = parseFloat(field.style.getPropertyValue(`--f${n}y`)) || 50;
        const dist = Math.hypot((fx - 50) * 0.55, fy - yPct);
        const w = c[3] * Math.exp(-((dist / 48) ** 2));
        r += c[0] * w; g += c[1] * w; b += c[2] * w; wsum += w;
      }
    }
    if (wsum > 0.001) {
      envT.r = r / wsum; envT.g = g / wsum; envT.b = b / wsum;
    }

    // What is actually behind it, at five points along its length.
    const pageL = luma(...(parseRGBA(getComputedStyle(root).backgroundColor) || [8, 12, 22, 1]).slice(0, 3));
    let sum = 0, count = 0;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < 5; i++) {
      const x = rect.left + rect.width * (0.1 + 0.2 * i);
      const l = underLuma(x, cy);
      sum += l === null ? pageL : l;
      count++;
    }
    const L = sum / count;
    const light = root.dataset.theme === 'daylight';
    envT.dim = light ? 0 : clamp((L - 0.28) * 0.9, 0, 0.42);
    envT.lift = light ? clamp((0.62 - L) * 0.9, 0, 0.38) : 0;
    wake();
  }

  /* Only what changed is written. --lg-dim feeds the backdrop filter, and
     every write to it re-runs the filter, whether or not the value moved. */
  let envSig = '';
  function writeEnv() {
    const v = `${env.r.toFixed(0)}, ${env.g.toFixed(0)}, ${env.b.toFixed(0)}`;
    const dim = env.dim.toFixed(3), lift = env.lift.toFixed(3);
    const sig = `${v}|${dim}|${lift}`;
    if (sig === envSig) return;
    envSig = sig;
    [bar, fab].forEach((el) => {
      if (!el) return;
      el.style.setProperty('--lg-env', v);
      el.style.setProperty('--lg-dim', dim);
      el.style.setProperty('--lg-lift', lift);
    });
  }

  let envTimer = 0, envLast = 0;
  const queueEnv = () => {
    const now = performance.now();
    // At most every 180ms while the page moves, and once more when it stops;
    // the estimate eases toward each sample, so the spacing never shows.
    if (now - envLast > 180) { envLast = now; sampleEnv(); return; }
    clearTimeout(envTimer);
    envTimer = setTimeout(() => { envLast = performance.now(); sampleEnv(); }, 190);
  };

  /* ------------------------------------------------------------------------
     Geometry, cached

     Everything the per frame loop needs is measured here, on resize and
     once the fonts land, and never while the pointer is moving.
     ------------------------------------------------------------------------ */
  const pocket = document.createElement('span');
  pocket.className = 'nav-pocket';
  pocket.setAttribute('aria-hidden', 'true');
  bar.prepend(pocket);

  // The home mark is left out: it stands on its own, with no pocket behind
  // it, so nothing frames it or crowds it as it moves.
  const ITEM_SEL = '.nav-links a, header.nav .icon-btn, header.nav a.cta';
  let items = [];
  let barRect = null, border = 1;

  function measure() {
    barRect = bar.getBoundingClientRect();
    border = parseFloat(getComputedStyle(bar).borderLeftWidth) || 0;
    items = $$(ITEM_SEL, bar)
      .filter((el) => el.offsetWidth > 0 && getComputedStyle(el).display !== 'none')
      .map((el) => {
        const r = (el.classList.contains('brand') ? el.querySelector('.brand-mark') || el : el).getBoundingClientRect();
        return { el, left: r.left - barRect.left - border, width: r.width };
      });
  }

  /* ------------------------------------------------------------------------
     Motion

     Damped springs on a unit mass, one clock. Values chosen from the spec's
     ranges and tuned by eye:

       pointer response    k 240, c 30   almost no overshoot
       pocket, leading     k 520, c 34   a touch of overshoot on arrival
       pocket, trailing    k 250, c 30   the back edge catches up late,
                                         which is the stretch
       press               k 700, c 46   fast in, fast out

     Distant moves raise the stiffness a little so a long trip across the
     bar does not feel sluggish, and scale the damping with it so the
     character of the motion stays the same.
     ------------------------------------------------------------------------ */
  const S = {
    near: 0, vNear: 0, tNear: 0,
    dx: 0, vDx: 0, tDx: 0,
    press: 0, vPress: 0, tPress: 0,
    L: 0, vL: 0, tL: 0,
    R: 0, vR: 0, tR: 0,
    op: 0, vOp: 0, tOp: 0,
  };

  const spring = (key, k, c, dt) => {
    const v = 'v' + key[0].toUpperCase() + key.slice(1);
    const t = 't' + key[0].toUpperCase() + key.slice(1);
    const a = -k * (S[key] - S[t]) - c * S[v];
    S[v] += a * dt;
    S[key] += S[v] * dt;
    return Math.abs(S[key] - S[t]) > 0.02 || Math.abs(S[v]) > 0.05;
  };

  /* The clock starts on the first frame it is given, not on
     performance.now() when it was asked for. The two are not the same
     clock: a frame callback requested from an input handler can run in the
     current frame, whose timestamp is already in the past, so measuring
     from performance.now() gives a negative step. A damped spring stepped
     backwards is an undamped one, and it grows without limit: that sent the
     pocket to a hundred and fifty thousand pixels wide on a press. dt is
     also clamped at zero for the same reason, and at a thirtieth of a
     second above so a stalled frame cannot fling anything. */
  let raf = 0, lastT = -1;
  function wake() {
    if (!raf) { lastT = -1; raf = requestAnimationFrame(frame); }
  }

  function frame(now) {
    if (lastT < 0) lastT = now;
    const dt = clamp((now - lastT) / 1000, 0, 1 / 30);
    lastT = now;
    const rm = reduced();
    let busy = false;

    // Environment eases toward its estimate.
    for (const k of ['r', 'g', 'b', 'dim', 'lift']) {
      const d = envT[k] - env[k];
      if (Math.abs(d) > (k.length === 1 ? 0.3 : 0.002)) { env[k] += d * Math.min(1, dt * 7); busy = true; }
      else env[k] = envT[k];
    }
    writeEnv();

    // Pointer response and press.
    busy = spring('near', 240, 30, dt) || busy;
    busy = spring('press', 700, 46, dt) || busy;
    if (!rm) busy = spring('dx', 240, 30, dt) || busy;
    else S.dx = 0;

    put(bar, '--lg-near', clamp01(S.near).toFixed(3));
    /* A tiny lean toward the pointer, a pixel or so, on the independent
       translate and scale properties so it composes with the transform that
       centres the bar. Sideways only: any vertical give read as the bar
       bobbing up and down under the pointer. */
    put(bar, 'translate', rm ? '' : `${S.dx.toFixed(2)}px 0`);
    put(bar, 'scale', rm ? '' : `${(1 + clamp01(S.near) * 0.0025 - clamp01(S.press) * 0.004).toFixed(4)} 1`);

    // Pocket.
    const dir = Math.sign((S.tL + S.tR) - (S.L + S.R));
    const dist = Math.abs((S.tL + S.tR) / 2 - (S.L + S.R) / 2);
    /* Long trips get stiffer so crossing the bar does not drag, and the
       trailing edge lags more on long trips than on short ones: next door,
       it keeps nearly level with the front and the move settles almost at
       once; across the bar, it falls behind and the stretch shows. Damping
       scales with stiffness so the character of the motion holds. */
    const boost = 1 + Math.min(dist / 420, 0.6);
    const near = 1 - Math.min(dist / 300, 1);
    const kLead = 520 * boost, kTrail = (250 + 230 * near) * boost;
    const lead = [kLead, 1.5 * Math.sqrt(kLead)];
    const trail = [kTrail, 1.86 * Math.sqrt(kTrail)];
    if (rm) {
      S.L = S.tL; S.R = S.tR; S.vL = S.vR = 0;
    } else {
      const [kL, cL] = dir > 0 ? trail : lead;
      const [kR, cR] = dir > 0 ? lead : trail;
      busy = spring('L', kL, cL, dt) || busy;
      busy = spring('R', kR, cR, dt) || busy;
    }
    busy = spring('op', rm ? 900 : 300, rm ? 60 : 34, dt) || busy;
    renderPocket();

    raf = busy ? requestAnimationFrame(frame) : 0;
  }

  function renderPocket() {
    const w = Math.max(0, S.R - S.L);
    const op = clamp01(S.op);
    put(pocket, 'opacity', op.toFixed(3));
    if (op < 0.005) return;

    /* It stretches and settles sideways only. It used to pinch in at the
       waist while stretched, and it shrank in both directions on a press;
       together they read as the bubble billowing up and down as it moved
       between tabs. Its height never changes now. */
    const pressK = 1 - clamp01(S.press) * 0.018;
    put(pocket, 'width', `${w.toFixed(2)}px`);
    put(pocket, 'transform', `translate3d(${S.L.toFixed(2)}px, -50%, 0) scale(${pressK.toFixed(4)}, 1)`);
  }

  /* ------------------------------------------------------------------------
     Where the pocket goes

     At rest it marks the current section. Pointing at an item takes it
     there; leaving the bar sends it back. Arriving from nothing it swells
     out from the middle of its target rather than fading in, and leaving
     for nothing it draws back into a point and goes, so it always reads as
     the same piece of glass.
     ------------------------------------------------------------------------ */
  let hovered = null, pressedItem = null;

  const itemFor = (el) => items.find((it) => it.el === el || it.el.contains(el));

  function retarget() {
    const cur = bar.querySelector('.nav-links a.is-current');
    const target = pressedItem || hovered || (cur && itemFor(cur)) || null;
    items.forEach((it) => it.el.classList.toggle('is-pocketed', !!target && it === target));

    if (!target) {
      const mid = (S.L + S.R) / 2;
      S.tL = S.tR = mid;
      S.tOp = 0;
    } else {
      if (S.op < 0.05) {
        const mid = target.left + target.width / 2;
        S.L = S.R = mid; S.vL = S.vR = 0;
      }
      S.tL = target.left;
      S.tR = target.left + target.width;
      S.tOp = 1;
    }
    wake();
  }

  /* ------------------------------------------------------------------------
     Input
     ------------------------------------------------------------------------ */
  let px = -1e4, py = -1e4, pointerKind = 'mouse';

  function pointerUpdate() {
    if (!barRect || pointerKind !== 'mouse' || reduced()) {
      S.tNear = 0; S.tDx = 0;
      wake();
      return;
    }
    const r = barRect;
    const ox = Math.max(r.left - px, 0, px - r.right);
    const oy = Math.max(r.top - py, 0, py - r.bottom);
    const near = clamp01(1 - Math.hypot(ox, oy) / 90);
    S.tNear = near;
    if (near > 0) {
      S.tDx = clamp((px - (r.left + r.width / 2)) / (r.width / 2), -1, 1) * 1.6 * near;
    } else {
      S.tDx = 0;
    }
    wake();
  }

  addEventListener('pointermove', (e) => {
    px = e.clientX; py = e.clientY; pointerKind = e.pointerType || 'mouse';
    pointerUpdate();
  }, { passive: true });

  /* Leaving the window: pointerout with nowhere to go. pointerleave on the
     document is not something browsers fire reliably. */
  document.addEventListener('pointerout', (e) => {
    if (!e.relatedTarget) { px = py = -1e4; pointerUpdate(); }
  });

  bar.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse') return;
    const it = itemFor(e.target);
    if (it && it !== hovered) { hovered = it; retarget(); }
    // The home mark has no pocket of its own: reaching it lets go of the
    // last link pointed at, rather than leaving that one lit.
    else if (!it && hovered && e.target.closest('.brand')) { hovered = null; retarget(); }
  });
  bar.addEventListener('pointerleave', () => { if (hovered) { hovered = null; retarget(); } });
  /* Leaving a link lets it go straight away, unless the pointer is going
     directly onto another one (then the pocket just slides across, with no
     flicker in between). */
  let releaseT = 0;
  bar.addEventListener('pointerout', (e) => {
    if (e.pointerType !== 'mouse' || !hovered) return;
    const from = itemFor(e.target), to = e.relatedTarget && itemFor(e.relatedTarget);
    if (!from || to === from) return;
    clearTimeout(releaseT);
    if (!to) releaseT = setTimeout(() => { if (hovered === from) { hovered = null; retarget(); } }, 40);
  });

  // Keyboard focus moves the pocket the same way a pointer does.
  bar.addEventListener('focusin', (e) => {
    const it = itemFor(e.target);
    if (it) { hovered = it; retarget(); }
    else if (hovered && e.target.closest('.brand')) { hovered = null; retarget(); }
  });
  bar.addEventListener('focusout', (e) => {
    if (!bar.contains(e.relatedTarget)) { hovered = null; retarget(); }
  });

  /* Press. The item and the pocket compress about 2% and the bar's shadow
     tightens, then all of it springs back. On a phone there is no hover and no current section in
     the dock, so this is also what brings the pocket up at all: it swells
     under the thumb and goes when the thumb lifts. */
  const release = () => {
    S.tPress = 0;
    bar.classList.remove('lg-bar-pressed');
    if (pressedItem) { pressedItem = null; retarget(); }
    wake();
  };
  bar.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    S.tPress = 1;
    bar.classList.add('lg-bar-pressed');
    const it = itemFor(e.target);
    if (it && e.pointerType !== 'mouse') { pressedItem = it; retarget(); }
    wake();
  }, { passive: true });
  ['pointerup', 'pointercancel'].forEach((t) => addEventListener(t, release, { passive: true }));
  addEventListener('blur', release);

  // The scroll spy decides the current section; the pocket follows it.
  /* Only is-current matters here. The pocket toggles is-pocketed on these
     same links, and reacting to that would just be the pocket reacting to
     itself. */
  const mo = new MutationObserver((recs) => {
    if (recs.some((r) => (r.oldValue || '').includes('is-current') !== r.target.classList.contains('is-current'))) retarget();
  });
  $$('.nav-links a', bar).forEach((a) => mo.observe(a, { attributes: true, attributeFilter: ['class'], attributeOldValue: true }));

  // The environment changes as the page moves under the glass.
  addEventListener('scroll', queueEnv, { passive: true });
  new MutationObserver(queueEnv).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  const relayout = () => {
    measure();
    retarget();
    queueEnv();
  };

  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(relayout, 140); }, { passive: true });
  document.fonts?.ready.then(relayout).catch(() => {});
  relayout();
})();

/* --- Press, everywhere else ----------------------------------------------------
   The rest of the controls respond the same way, simpler: compress a
   percent and a half, a light under the pointer, spring back. CSS does the
   springing; this says where and when. The bar handles its own. */
(function liquidPress() {
  const SEL = [
    '.btn', '.filter-chip', '.pills button', '.contact a', '.card-repo',
    '.chip', '.chip-clear', '.carousel-ctrl .icon-btn', '.sheet-cta', '.lb-btn', '.st-btn', '.st-close',
    'header.nav .icon-btn', 'header.nav a.cta', 'header.nav .brand', '.dock-fab .icon-btn',
  ].join(',');

  $$(SEL).forEach((el) => el.classList.add('lg-press'));

  let active = null;
  const release = () => {
    if (!active) return;
    active.classList.remove('lg-pressed');
    active = null;
  };

  const press = (el, cx, cy) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--lg-px', `${clamp(((cx - r.left) / r.width) * 100, 0, 100).toFixed(1)}%`);
    el.style.setProperty('--lg-py', `${clamp(((cy - r.top) / r.height) * 100, 0, 100).toFixed(1)}%`);
    release();
    active = el;
    el.classList.add('lg-pressed');
  };

  document.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    const el = e.target.closest?.(SEL);
    if (el) press(el, e.clientX, e.clientY);
  }, { passive: true });

  ['pointerup', 'pointercancel', 'dragstart'].forEach((t) => addEventListener(t, release, { passive: true }));
  addEventListener('blur', release);

  document.addEventListener('keydown', (e) => {
    if (e.repeat || (e.key !== 'Enter' && e.key !== ' ')) return;
    const el = document.activeElement?.closest?.(SEL);
    if (!el) return;
    const r = el.getBoundingClientRect();
    press(el, r.left + r.width / 2, r.top + r.height / 2);
  });
  document.addEventListener('keyup', (e) => { if (e.key === 'Enter' || e.key === ' ') release(); });
})();
})();
