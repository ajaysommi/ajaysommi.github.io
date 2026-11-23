/* ==========================================================================
   AROUND THE BLOCK: what the street does (see town.css).
   On a wide screen the block is the whole page and slides sideways (wheel,
   drag, arrow keys, the edge buttons). Hover anything and everything that
   belongs to that place glows. Click and
   the scene leans in, the story in a card beside it; arrows walk the stops
   in order, Esc or the x steps back. A JM Family car hauler backs up to the
   dealership once the block comes into view. The pointer: the Robotics For All
   rover comes over when it's near its corner (and keeps its distance), the
   Renaissance Jax robot drives over and locks its camera on it, the corner
   camera follows it near the building, and the dish on the lab's roof follows it
   through the sky.
   Also here: the finale at the bottom of the page.
   ========================================================================== */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------- the finale */
  const fin = document.getElementById('finale');
  if (fin) {
    const yr = fin.querySelector('.finale-yr'), ys = yr.dataset.years.split(',');
    let k = 0, timer = 0;
    const roll = () => { k = (k + 1) % ys.length; yr.textContent = ys[k]; yr.classList.remove('roll'); void yr.offsetWidth; yr.classList.add('roll'); };
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { fin.classList.add('in'); if (!reduced && !timer) timer = setInterval(roll, 2200); }
      else { clearInterval(timer); timer = 0; }
    }, { threshold: 0.4 }).observe(fin);
    else fin.classList.add('in');
  }

})();

(function startTown() {
  'use strict';
  const tw = document.getElementById('town');
  if (!tw) return;
  // Measure each landmark only once the street has a layout. On phones the
  // separate tabbed portfolio can start without building hundreds of hit areas.
  const wide = matchMedia('(min-width: 720px)');
  if (!wide.matches) {
    wide.addEventListener('change', startTown, { once: true });
    return;
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const NS = 'http://www.w3.org/2000/svg';

  const D = JSON.parse($('#town-data').textContent);
  const svg = $('.tw-svg', tw), stage = $('.tw-stage', tw), panel = $('.tw-panel', tw), inner = $('.tw-panel-in', panel);
  const label = $('.tw-label', tw), prevB = $('.tw-prev', panel), nextB = $('.tw-next', panel);
  const chips = $$('.tw-chip', tw), hots = $$('.tw-hot', svg);
  // The camera: the block is WORLD units wide and fills the window; it
  // scrolls sideways. The window shows about 640 units top to bottom, so
  // the street and the buildings take up most of it and the sky the rest.
  const WORLD = D.W, BOTTOM = 676;
  let scale = 1, vw = 1200, vh = 600, camX = 0;
  const measure = () => {
    const w = stage.clientWidth || innerWidth, h = stage.clientHeight || innerHeight;
    scale = clamp(h / 640, 0.8, 1.7);
    vw = w / scale; vh = h / scale;
    camX = clamp(camX, 0, Math.max(0, WORLD - vw));
  };
  const view = () => [camX, BOTTOM - vh, vw, vh];
  measure();
  // Everyone starts at the visitor center; work is to the left, what I've built to the right.
  const homeX = () => clamp(D.home - vw / 2, 0, Math.max(0, WORLD - vw));
  camX = homeX();
  let vb = view(), anim = 0, cur = null;
  const nameOf = (r) => (r.school ? 'University of Florida' : r.short);
  const yy = (r) => r.badge || `’${String(r.year).slice(2)}`;

  /* ---------------------------------------------------------- the two robots */
  // Each lives in its own patch of lawn and never leaves it.
  // They move like something with a little weight: a soft spring toward
  // where they want to be, never faster than an amble.
  const bots = {
    rfa: { el: $('.tw-rover', svg), flip: $('.tw-rover-flip', svg), pin: $('.tw-pin[data-id="rfa"]', svg), x: 930, y: 556, vx: 0, vy: 0, tx: 930, ty: 556, face: -1, idleAt: 0, box: [850, 990, 536, 566], reach: 110, keep: 50, pinDy: -78, k: 5, max: 70, s: 1, tilt: 0 },
    rjax: { el: $('.tw-frc', svg), flip: $('.tw-frc-flip', svg), pin: $('.tw-pin[data-id="rjax"]', svg), x: 632, y: 578, vx: 0, vy: 0, tx: 632, ty: 578, face: 1, idleAt: 0, box: [602, 670, 574, 580], reach: 140, keep: 64, pinDy: -58, k: 3, max: 45, s: 0.78, tilt: 0 }
  };
  const placeBot = (b) => {
    b.el.setAttribute('transform', `translate(${b.x.toFixed(1)} ${b.y.toFixed(1)})`);
    b.flip.setAttribute('transform', `scale(${(b.face * b.s).toFixed(3)} ${b.s}) rotate(${b.tilt.toFixed(1)})`);
    b.pin.setAttribute('transform', `translate(${b.x.toFixed(1)} ${(b.y + b.pinDy).toFixed(1)})`);
    if (b.num) b.num.setAttribute('transform', `scale(${b.face} 1)`);
  };
  bots.rjax.num = $('.tw-frc-86', svg);
  Object.values(bots).forEach(placeBot);
  // The competition robot's camera: on its target, or on the pointer when close.
  const turret = $('.tw-turret', svg), vision = $('.tw-vision', svg), reticle = $('.tw-reticle', svg);
  const TARGET = [714, 535];
  let aim = TARGET.slice();
  const aimCam = () => {
    const b = bots.rjax, cx = b.x + 23 * b.s * b.face, cy = b.y - 48 * b.s;
    let a = Math.atan2(aim[1] - cy, (aim[0] - cx) * b.face) * 180 / Math.PI;
    a = clamp(a, -55, 55);
    turret.setAttribute('transform', `translate(23 -48) rotate(${a.toFixed(1)})`);
    const ex = cx + 7 * b.s * b.face * Math.cos(a * Math.PI / 180), ey = cy + 7 * b.s * Math.sin(a * Math.PI / 180);
    vision.setAttribute('d', `M${ex.toFixed(1)} ${ey.toFixed(1)} L${aim[0].toFixed(1)} ${aim[1].toFixed(1)}`);
    reticle.setAttribute('transform', `translate(${aim[0].toFixed(1)} ${aim[1].toFixed(1)})`);
  };
  aimCam();
  // Its beam and its targeting box drift, slowly, toward the colour of
  // whatever the pointer is over: a lighter shade of it, so they still show.
  const RJ0 = [31, 209, 42], rjc = RJ0.slice();
  const rgbOf = (hex) => { const n = parseInt(hex.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  let rjSet = '', overCol = null;
  // a shade of a colour that still stands apart from it: lighter on dark things, deeper on light ones
  const shade = (c) => { const l = (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255; return l > 0.6 ? c.map((v) => v * 0.62) : c.map((v) => v * 0.6 + 255 * 0.4); };
  // the first solid colour under the pointer (patterns and glows are looked through)
  const colOf = (e) => {
    for (const t of document.elementsFromPoint(e.clientX, e.clientY)) {
      if (t === svg || !svg.contains(t)) break;
      if (t.closest('.tw-rover, .tw-frc, .tw-vision, .tw-reticle, .tw-halo')) continue;
      const h = t.closest('.tw-hot'), id = h && h.dataset.id;
      if (t.tagName === 'image') { if (id && id !== 'rjax' && D.roles[id]) return rgbOf(D.roles[id].tint); continue; }
      const cs = getComputedStyle(t), m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/.exec(cs.fill || '');
      if (m && (m[4] === undefined || +m[4] > 0.3) && +cs.opacity > 0.3) return [+m[1], +m[2], +m[3]];
    }
    return null;
  };
  const tintBeam = (dt) => {
    const t = overCol ? shade(overCol) : RJ0;
    const k = Math.min(1, dt * 7);
    for (let i = 0; i < 3; i++) rjc[i] += (t[i] - rjc[i]) * k;
    const c = `rgb(${rjc.map((v) => Math.round(v)).join(',')})`;
    if (c !== rjSet) { rjSet = c; vision.style.stroke = c; reticle.style.setProperty('--rj', c); }
  };

  /* ---------------------------------------------------------- Hunter's lift */
  // Up, a pause, down, a pause; the scissor arms follow the platform, and
  // the HawkEye's two red beacons keep their lasers on the wheel targets.
  const plat = $('.tw-plat', svg), armA = $('.tw-arm-a', svg), armB = $('.tw-arm-b', svg), pivot = $('.tw-pivot', svg), lasers = $$('.tw-laser', svg);
  const BEACONS = [[916 + 75.4 * 0.0745, 370 + 112 * 0.2057], [916 + 75.4 * 0.923, 370 + 112 * 0.2057]], WHEELS = [1032, 1105];
  for (const beam of lasers) {
    const [x, y] = BEACONS[Number(beam.dataset.b)];
    beam.setAttribute('x1', x);
    beam.setAttribute('y1', y);
    beam.setAttribute('x2', WHEELS[Number(beam.dataset.w)]);
  }
  let lastLiftHeight;
  const lift = (now) => {
    const t = (now / 1000) % 9, u = t < 3 ? t / 3 : t < 4.5 ? 1 : t < 7.5 ? 1 - (t - 4.5) / 3 : 0;
    const h = Math.round(2200 * (0.5 - 0.5 * Math.cos(Math.PI * u))) / 100;
    if (h === lastLiftHeight) return;
    lastLiftHeight = h;
    const top = 466 - h;
    plat.setAttribute('transform', `translate(0 ${-h})`);
    armA.setAttribute('d', `M1110 474 L1004 ${top.toFixed(1)}`);
    armB.setAttribute('d', `M1004 474 L1110 ${top.toFixed(1)}`);
    pivot.setAttribute('cy', ((474 + top) / 2).toFixed(1));
    const targetY = (445.7 - h).toFixed(2);
    for (const beam of lasers) beam.setAttribute('y2', targetY);
  };
  lift(0);

  /* ---------------------------------------------------------- where things are */
  const pinOf = (id) => (bots[id] ? [bots[id].x, bots[id].y + bots[id].pinDy] : D.pin[id]);
  const zoomOf = (id) => (bots[id] ? [bots[id].x - 120, bots[id].y - 110, 240, 150] : D.roles[id].zoom);

  /* ---------------------------------------------------------- glow */
  // Everything that belongs to a place lights together. A filter redrawn
  // every frame is what makes a zoomed scene crawl (in Safari above all),
  // so the halo comes from a still copy of the place tucked behind it,
  // drawn once. Only the parts that move (the lift, the robots, the dish,
  // the camera, the gator) carry a small live glow of their own.
  const LIVE = { 'p-civic': '.tw-civ-hood', 'p-lid': '.tw-lidflap', tm: '.tw-tm-swirl', hunter: '.tw-plat', rjax: '.tw-frc', rfa: '.tw-rover', fics: '.tw-dish', adt: '.tw-cambody', edu: '.tw-gator', shiva: '.tw-bars' };
  const SKIP = { toyota: '.tw-alarmin, .tw-dooralarm, .tw-door-fractures, .tw-cracks, .tw-carlights, .tw-car-fractures, .tw-adtsticker, .tw-snowimg, .tw-textsnow', 'p-betai': '.tw-tvlcd, .tw-bwcr, .tw-hedge, .tw-winglass, .tw-winsheen', 'p-macbook': '.tw-mac-fire', 'p-civic': '.tw-civ-hood, .tw-civ-bay, .tw-engbay, .tw-civ-dmg', 'p-lid': '.tw-lidflap', 'p-iron': '.tw-hot-tip', tm: '.tw-tm-swirl', hunter: '.tw-plat, .tw-arm-a, .tw-arm-b, .tw-pivot, .tw-laser', rjax: '.tw-frc, .tw-vision, .tw-reticle', rfa: '.tw-rover', fics: '.tw-dish', adt: '.tw-cctv-head, .tw-adtbush, .tw-adt-alarm, .tw-adtsign-lit', jm: '.tw-hazards, .tw-tcars, .tw-snowimg', edu: '.tw-gator, .tw-ripples, .tw-hall-in, .tw-hall-gl, .tw-hall-cr, .tw-hallglow, .tw-snowimg', shiva: '.tw-bars, .tw-bb-beams, .tw-bb-wash' };
  SKIP.hunter += ', .tw-hk-lcd'; SKIP['p-civic'] += ', .tw-snowimg';
  // The flag changes position when the first letter is opened.
  LIVE.recs = '.tw-mb-flag'; SKIP.recs = '.tw-mb-flag';
  const halos = {};
  const stickers = $$('.tw-adtsticker', svg);
  // A filter's region is a box around what it's on; sized as a share of that
  // box, a small or thin thing's glow got cut off square. So each gets its own
  // copy of the filter, sized to it with room to spare, in its own units.
  const defs = $('defs', svg);
  let nf = 0;
  const fitted = (node, base) => {
    if (node._fit && node._fit[0] === base) return node._fit[1];
    let b = null; try { b = node.getBBox(); } catch (e) {}
    let url = `url(#${base})`;
    if (b && (b.width || b.height)) {
      const c = document.getElementById(base).cloneNode(true), m = 28;
      c.id = `${base}-${++nf}`;
      c.setAttribute('filterUnits', 'userSpaceOnUse');
      c.setAttribute('x', (b.x - m).toFixed(1)); c.setAttribute('y', (b.y - m).toFixed(1));
      c.setAttribute('width', (b.width + 2 * m).toFixed(1)); c.setAttribute('height', (b.height + 2 * m).toFixed(1));
      // a big place gets a wider glow, or it's lost along its long edges
      if (Math.max(b.width, b.height) > 300) { const bl = c.querySelector('feGaussianBlur'); if (bl) bl.setAttribute('stdDeviation', '9'); c.setAttribute('x', (b.x - 46).toFixed(1)); c.setAttribute('y', (b.y - 46).toFixed(1)); c.setAttribute('width', (b.width + 92).toFixed(1)); c.setAttribute('height', (b.height + 92).toFixed(1)); }
      defs.appendChild(c);
      url = `url(#${c.id})`;
    }
    node._fit = [base, url];
    return url;
  };
  const hotOf = (id) => hots.find((h) => h.dataset.id === id);
  let lit = null;
  const glow = (id) => {
    if (lit === id) return;
    if (lit) {
      if (halos[lit]) { halos[lit].remove(); halos[lit]._lite.remove(); }
      const h = hotOf(lit); if (h) $$(LIVE[lit] || '.tw-none', h).forEach((n) => { n.style.filter = ''; });
      if (lit === 'adt') stickers.forEach((n) => { n.style.filter = ''; });
    }
    lit = id;
    if (id === 'adt') stickers.forEach((n) => { n.style.filter = fitted(n, 'twGlow-adt'); });
    const h = id && hotOf(id);
    if (!h) return;
    let g = halos[id];
    if (!g) {
      g = h.cloneNode(true);
      g.removeAttribute('data-id'); g.removeAttribute('style');
      g.setAttribute('class', 'tw-halo'); g.setAttribute('aria-hidden', 'true');
      g.setAttribute('filter', fitted(h, `twHalo-${id}`));
      $$('.tw-hit, .tw-dmg, .tw-pane-damage, .tw-fallshard' + (SKIP[id] ? ', ' + SKIP[id] : ''), g).forEach((n) => n.remove());
      $$('.tw-bump.off', g).forEach((n) => n.classList.remove('off'));
      $$('.tw-snowimg, .tw-textsnow, .tw-snowy', g).forEach((n) => n.remove());
      // and a light copy for while the scene leans in: the place's shapes in
      // its colour, outlined thick, no blur (the blur redrawn every frame of
      // a zoom is what made it crawl), so the glow never goes out
      const lite = g.cloneNode(true);
      lite.removeAttribute('filter');
      lite.setAttribute('class', 'tw-halo tw-halo-lite');
      lite.style.setProperty('--tint', getComputedStyle(h).getPropertyValue('--tint'));
      $$('image, text, .tw-nohit, .tw-night, .tw-vc-halo', lite).forEach((n) => n.remove());
      g._lite = lite;
      halos[id] = g;
    }
    h.parentNode.insertBefore(g._lite, h);
    h.parentNode.insertBefore(g, h);
    // the open place keeps its glow while the scene leans in
    g.classList.toggle('keep', id === cur); g._lite.classList.toggle('keep', id === cur);
    $$(LIVE[id] || '.tw-none', h).forEach((n) => { n.style.filter = fitted(n, `twGlow-${id}`); });
  };
  // Generous, invisible hit areas, so a small move doesn't drop the hover
  // in the gaps between a thing's parts.
  const skip = $$('.tw-nohit', svg);
  skip.forEach((n) => { n.style.display = 'none'; });
  hots.forEach((h) => {
    const parts = h.firstElementChild && h.firstElementChild.tagName === 'g' ? [...h.firstElementChild.children] : [...h.children];
    const hit = document.createElementNS(NS, 'g');
    hit.setAttribute('class', 'tw-hit');
    const back = h.getCTM().inverse();
    parts.forEach((p) => {
      // only what is drawn counts: Chrome measures hidden pieces too (ADT's
      // alarm glow, a big circle, made the dealership wall part of ADT)
      if (p.matches('.tw-nohit, .tw-snowimg, .tw-snowy, .tw-textsnow')) return;
      let b; try { b = p.getBBox(); } catch (e) { return; }
      if (!b || b.width * b.height === 0) return;
      const m = back.multiply(p.getCTM()), pt = svg.createSVGPoint();
      const xs = [], ys = [];
      [[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]].forEach(([x, y]) => { pt.x = x; pt.y = y; const q = pt.matrixTransform(m); xs.push(q.x); ys.push(q.y); });
      const x0 = Math.min(...xs), y0 = Math.min(...ys);
      const r = document.createElementNS(NS, 'rect');
      r.setAttribute('x', x0 - 1); r.setAttribute('y', y0 - 1); r.setAttribute('width', Math.max(...xs) - x0 + 2); r.setAttribute('height', Math.max(...ys) - y0 + 2);
      hit.appendChild(r);
    });
    h.insertBefore(hit, h.firstChild);
  });
  skip.forEach((n) => { n.style.display = ''; });

  /* ---------------------------------------------------------- the lean in */
  let arrived = false;
  const arrive = () => { arrived = true; tw.classList.add('arrive'); };
  const cam = $('.tw-cam', svg), far = $('.tw-far', svg), panL = $('.tw-pan-l', tw), panR = $('.tw-pan-r', tw);
  // The sun and the moon are in the sky, with the stars: set once, where
  // they look right from the visitor center; after that they move as the
  // sky does (a little as the street slides, out of view as it leans in).
  const moonG = $('.tw-moon', svg), sunG = $('.tw-sun', svg);
  const placeOrbs = () => {
    const x = homeX() * 0.4 + vw * 0.8, y = BOTTOM - vh + Math.max(64, vh * 0.16);
    moonG.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    sunG.setAttribute('transform', `translate(${x.toFixed(1)} ${(y + 6).toFixed(1)})`);
  };
  placeOrbs();
  // The colour of the sky at the top of the window (night or day, greyer in
  // rain or snow), for the browser's own bar and the page behind the street.
  const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const skyAt = (y, night) => {
    const st = night ? D.sky.night : D.sky.day, t = clamp((y + 700) / 1300, 0, 1);
    let i = 1; while (i < st.length - 1 && st[i][0] < t) i++;
    const [o0, c0] = st[i - 1], [o1, c1] = st[i];
    return mix(hex(c0), hex(c1), clamp((t - o0) / (o1 - o0 || 1), 0, 1));
  };
  let barOn = false, barSet = '', barMeta = null, farY = 0, wxGrey = 0;
  const isNight = () => /midnight|terminal/.test(document.documentElement.dataset.theme || '');
  const barColour = () => {
    const n = isNight();
    let c = skyAt(vb[1] - farY + 2, n);
    if (wxGrey) c = mix(c, hex(n ? '#0b0f1d' : '#77828f'), wxGrey);
    return '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  };
  const paintBar = () => {
    if (!barOn) return;
    const c = barColour();
    if (c === barSet) return;
    barSet = c;
    if (!barMeta) barMeta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (barMeta) barMeta.content = c;
    stage.style.backgroundColor = c;
  };
  // script.js asks for it when the theme changes
  window.__twBar = () => { if (!barOn) return null; barSet = ''; requestAnimationFrame(paintBar); return barColour(); };
  let explored = false, actorFrame = 0, lastT = 0, visible = true;
  let showRover = false, showRobot = false, showLift = false, showCctv = false, showDish = false;
  const syncActors = () => {
    const inView = (left, right) => left < vb[0] + vb[2] + 90 && right > vb[0] - 90;
    showRover = inView(bots.rfa.box[0], bots.rfa.box[1]);
    showRobot = inView(bots.rjax.box[0], TARGET[0]);
    const [bayX, , bayWidth] = D.roles.hunter.zoom;
    const liftInView = inView(bayX, bayX + bayWidth);
    if (showLift !== liftInView) svg.classList.toggle('tw-bay-visible', liftInView);
    showLift = liftInView;
    showCctv = inView(1180, 1360);
    showDish = inView(3020, 3140);
    if (!actorFrame && visible && !reduced && (showRover || showRobot || showLift || showCctv || showDish)) {
      lastT = 0;
      actorFrame = requestAnimationFrame(tickActors);
    }
  };
  let base = null, camOn = false, barT = 0;
  const placeVB = (b, moving) => {
    vb = b;
    // Use the same camera transform for zooms and pans, rebasing long trips
    // before their offset grows beyond the current viewport.
    if (moving && base && Math.abs(base[0] - b[0]) < vw * .9) {
      const s = base[2] / b[2];
      cam.style.transform = `translate(${(base[0] - s * b[0]).toFixed(3)}px, ${(base[1] - s * b[1]).toFixed(3)}px) scale(${s.toFixed(5)})`;
      camOn = true;
    } else {
      base = b.slice(); svg.setAttribute('viewBox', b.map((n) => n.toFixed(2)).join(' '));
      if (camOn) { cam.style.transform = ''; camOn = false; }
    }
    farY = (b[1] - (BOTTOM - vh)) * 0.12;
    far.style.transform = `translate(${(b[0] * 0.6).toFixed(2)}px, ${farY.toFixed(2)}px)`;
    // the browser bar's colour follows the sky, a few times a second while moving
    const now = performance.now();
    if (!moving || now - barT > 140) { barT = now; paintBar(); }
    syncActors();
    // the truck backs in once its waiting spot is well in view
    if (!arrived && camX < D.truck.right - vw * 0.15) arrive();
    // the edge arrows wait until the street has been moved at least once
    panL.classList.toggle('on', explored && !cur && camX > 4);
    panR.classList.toggle('on', explored && !cur && camX < WORLD - vw - 4);
  };
  const setVB = (b) => placeVB(b, false);
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let zoomUntil = 0;
  const zooming = () => performance.now() < zoomUntil;
  const tween = (to, ms = 850, fn = ease, done) => {
    cancelAnimationFrame(anim);
    zoomUntil = reduced ? 0 : performance.now() + ms + 40;
    if (reduced) { setVB(to); done?.(); return; }
    // While the scene moves the glow steps aside (redrawing it at every
    // step of the zoom is the expensive part) and comes back when it lands.
    if (camOn) setVB(vb);
    const from = vb.slice(), t0 = performance.now();
    svg.classList.add('tw-moving', 'tw-zooming'); svg.classList.toggle('tw-glide', ms >= 2000);
    const f = (t) => { const u = clamp((t - t0) / ms, 0, 1), k = fn(u); placeVB(from.map((v, i) => v + (to[i] - v) * k), u < 1); if (u < 1) anim = requestAnimationFrame(f); else { svg.classList.remove('tw-moving', 'tw-zooming', 'tw-glide'); done?.(); } };
    anim = requestAnimationFrame(f);
  };
  const frame = (z, left) => {
    const [x, y, w, h] = z, cx = x + w / 2, cy = y + h / 2;
    const free = clamp(1 - (panel.offsetWidth + 28) / (stage.clientWidth || innerWidth), 0.3, 1), A = vh / vw;
    let fw = w / (free * 0.88), fh = fw * A;
    if (fh < h * 1.25) { fh = h * 1.25; fw = fh / A; }
    fw = Math.min(fw, Math.max(vw, w / (free * 0.96))); fh = fw * A;
    const fx = left ? cx - fw * (1 - free / 2) : cx - fw * (free / 2);
    return [fx, clamp(cy - fh / 2, BOTTOM - vh, BOTTOM - fh), fw, fh];
  };
  // Sliding along the street: the wheel (either direction), dragging, the
  // arrow keys and the two edge buttons.
  let glide = 0;
  const panTo = (x, ms = 600) => {
    cancelAnimationFrame(glide); if (typeof glideStop === 'function') glideStop();
    const to = clamp(x, 0, Math.max(0, WORLD - vw));
    if (reduced || ms === 0) { camX = to; setVB(view()); return; }
    const from = camX, t0 = performance.now();
    const f = (t) => {
      const k = ease(clamp((t - t0) / ms, 0, 1));
      camX = from + (to - from) * k;
      slid(); placeVB(view(), k < 1);
      if (k < 1) glide = requestAnimationFrame(f);
    };
    glide = requestAnimationFrame(f);
  };
  /* Gliding: the wheel, a trackpad and the arrow keys only say where the
     street should be; once a frame it eases there, so the motion is smooth
     and the scene is laid out once per frame however fast the input comes.
     Holding an arrow key keeps it rolling at an even pace. */
  let gTo = null, gRaf = 0, gT = 0, keyDir = 0;
  const glideStep = (t) => {
    const dt = Math.min(0.05, Math.max(0.001, (t - gT) / 1000)); gT = t;
    const max = Math.max(0, WORLD - vw);
    if (keyDir) gTo = clamp(gTo + keyDir * 820 / scale * dt, 0, max);
    const d = gTo - camX;
    camX = Math.abs(d) < 0.2 && !keyDir ? gTo : camX + d * (1 - Math.exp(-dt * 15));
    const moving = camX !== gTo || !!keyDir;
    slid(); placeVB(view(), moving);
    if (moving) gRaf = requestAnimationFrame(glideStep); else { gRaf = 0; gTo = null; }
  };
  const glideBy = (dx) => {
    cancelAnimationFrame(glide);
    gTo = clamp((gTo === null ? camX : gTo) + dx, 0, Math.max(0, WORLD - vw));
    if (reduced) { camX = gTo; gTo = null; setVB(view()); return; }
    if (!gRaf) { gT = performance.now(); gRaf = requestAnimationFrame(glideStep); }
  };
  const glideStop = () => { cancelAnimationFrame(gRaf); gRaf = 0; gTo = null; keyDir = 0; };
  document.addEventListener('keyup', (e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') keyDir = 0; });
  addEventListener('blur', () => { keyDir = 0; });
  setVB(view());
  /* The opening: the street starts up in the sky, and the moment the mark
     sets off for the corner it comes down to the visitor center in one
     continuous glide: slowest up among the stars, easing in and out so it
     starts and lands without a jolt. Half a second after it lands, the lamps
     on the welcome sign come on (after dark). */
  let intro = false;
  // it starts high enough that only sky and stars show (the hills too are out of sight)
  const INTRO = 4100, RISE = 480;
  const smooth = (u) => u * u * u * (u * (u * 6 - 15) + 10);
  const glideDown = (u) => Math.pow(smooth(u), 1.75);
  const lampsOn = () => setTimeout(() => tw.classList.add('signlit'), 500);
  const flyAway = () => { const b = $('.tw-bfly', svg); if (!b || tw.classList.contains('bfly-away')) return; tw.classList.add('bfly-away'); setTimeout(() => b.remove(), 4200); };
  const loader = document.getElementById('pageLoader');
  const startBar = () => { if (barOn) return; barOn = true; paintBar(); };
  if (!reduced && loader && document.documentElement.classList.contains('is-loading')) {
    intro = true;
    tw.classList.add('intro');
    setVB([camX, BOTTOM - vh - RISE, vw, vh]);
    tw._pre = $$('image', svg).filter((im) => im.getBoundingClientRect().width).map((im) => { const i = new Image(); i.src = im.getAttribute('href'); if (i.decode) i.decode().catch(() => {}); return i; });
    let begun = false;
    const begin = () => {
      if (begun) return; begun = true;
      if (!intro || cur) { intro = false; tw.classList.remove('intro'); lampsOn(); hint(); setTimeout(flyAway, 1200); return; }
      tween(view(), INTRO, glideDown);
      setTimeout(() => { intro = false; tw.classList.remove('intro'); lampsOn(); hint(); flyAway(); }, INTRO + 80);
    };
    // the street starts down as the mark takes off; the browser's bar turns
    // sky coloured once the loading screen has cleared
    const mo = new MutationObserver(() => {
      const gone = !document.documentElement.classList.contains('is-loading');
      if (loader.classList.contains('is-flying') || loader.classList.contains('is-revealing') || gone) begin();
      if (loader.classList.contains('is-revealing') || gone) { startBar(); mo.disconnect(); }
    });
    mo.observe(loader, { attributes: true, attributeFilter: ['class'] });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    setTimeout(() => { begin(); startBar(); }, 7500);
  } else { startBar(); lampsOn(); setTimeout(() => hint(), 700); setTimeout(flyAway, 1600); }

  /* ---------------------------------------------------------- how to get around */
  // Once the street has settled, a small card in the middle shows how to
  // move along it, with the gesture drawn out; it goes once you do.
  function hint() {
    if (cur || !matchMedia('(min-width: 720px)').matches || $('.tw-hint', stage)) return;
    const h = document.createElement('div');
    h.className = 'tw-hint';
    h.setAttribute('role', 'status');
    h.innerHTML = `<div class="tw-hint-g" aria-hidden="true"><div class="tw-hint-pad"><span class="tw-hint-dots"><i></i><i></i></span><span class="tw-hint-ar l"></span><span class="tw-hint-ar r"></span></div><span class="tw-hint-or">or</span><div class="tw-hint-mouse"><span class="tw-hint-wheel"></span><span class="tw-hint-cable"></span></div></div><p><b>Scroll to look around</b><span>Two-finger swipe on a trackpad,<br>or roll the mouse wheel.<br>You can also drag the street.</span></p>`;
    stage.appendChild(h);
    const bye = () => { if (!h.isConnected || h.classList.contains('out')) return; h.classList.add('out'); setTimeout(() => h.remove(), 500); ['wheel', 'pointerdown', 'keydown'].forEach((t) => removeEventListener(t, bye, true)); };
    ['wheel', 'pointerdown', 'keydown'].forEach((t) => addEventListener(t, bye, true));
    setTimeout(bye, 8000);
  }

  /* ---------------------------------------------------------- the card */
  // Story first, then its photos, then the numbers, the connections and the tools.
  const logo = (L) => L[0] === L[1] ? `<img src="assets/logos/opt/${L[0]}.webp" alt="" />` : `<img class="lg-d" src="assets/logos/opt/${L[0]}.webp" alt="" /><img class="lg-l" src="assets/logos/opt/${L[1]}.webp" alt="" />`;
  const linksOf = (id) => D.links.filter((l) => l[0] === id || l[1] === id);
  // The visitor center's card: a postcard from Sommiville, a stamp with my
  // face on it, a postmark with today's date, a note, a photo from when I was
  // little, and my name at the bottom.
  const postcard = (r) => {
    const d = new Date(), day = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
    return `<div class="tw-pc">
      <div class="tw-pc-letter">
        <div class="tw-pc-top"><span class="tw-pc-greet">Greetings from</span><span class="tw-pc-town">SOMMIVILLE</span></div>
        <div class="tw-pc-stampwrap"><span class="tw-pc-stamp"><img src="${r.photos[0]}" alt="Ajay Sommi" /></span><span class="tw-pc-mark" aria-hidden="true"><b>VISITOR CENTER</b><i>${esc(day)}</i></span></div>
        <div class="tw-pc-note">${r.lines.map((l) => `<p>${esc(l)}</p>`).join('')}</div>
        <figure class="tw-pc-snap"><button type="button" aria-label="Open photo"><img src="${r.photos[1]}" alt="" loading="lazy" decoding="async" /></button><figcaption>20+ years of experience</figcaption></figure>
        ${r.quote ? `<blockquote class="tw-pc-quote">“${esc(r.quote)}”</blockquote>` : ''}
        <p class="tw-pc-sign">See you around town,<b>Ajay Sommi</b></p>
      </div>
      <div class="tw-pc-destinations">
        <a href="resume.html">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h8l4 4v13H6zM14 3.5v4h4M9 12h6m-6 4h6"/></svg>
          <span>Resume</span>
        </a>
        <a href="classic.html">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M3.5 9h17M8 13h8m-8 3h5"/></svg>
          <span>Classic Portfolio</span>
        </a>
      </div>
    </div>`;
  };
  const openedLetters = new Set();
  const letterInks = ['#9c5145', '#50756b', '#776282', '#9d643f'];
  const letters = (r) => `
    <div class="tw-mail-tray">
      <h3 class="tw-mail-title">${esc(r.org)}</h3>
      <p class="tw-mail-intro">Pick an envelope to read a recommendation from someone I’ve worked with.</p>
      <ul class="tw-mail-stack">${r.letters.map(([name, org, , stamp], i) => `
        <li><button type="button" class="tw-envelope" aria-expanded="false" data-letter="${i}" style="--letter-ink:${letterInks[i % letterInks.length]}">
          <span class="tw-envelope-postage" aria-hidden="true"><span>${stamp ? `<img src="assets/logos/opt/${esc(stamp)}.webp" alt="">` : esc(name[0])}</span></span>
          <span class="tw-envelope-to" aria-hidden="true">To Ajay Sommi</span>
          <span class="tw-envelope-from">From <b>${esc(name)}</b></span>
          <span class="tw-envelope-org">${esc(org)}</span>
          ${openedLetters.has(i) ? '<small class="tw-envelope-read">Opened</small>' : ''}
        </button></li>`).join('')}</ul>
      <p class="tw-mail-source"><a href="${esc(r.linkedin)}" target="_blank" rel="noopener">Recommendations on LinkedIn</a></p>
    </div>`;
  const wireLetters = (r, returnTo) => {
    const tray = $('.tw-mail-tray', inner);
    if (returnTo !== undefined) tray.querySelector(`[data-letter="${returnTo}"]`).focus();
    tray.addEventListener('click', (event) => {
      const button = event.target.closest('[data-letter]');
      if (button) openEnvelope(r, Number(button.dataset.letter));
    });
  };
  const openEnvelope = (r, i) => {
    const [name, org, quote] = r.letters[i];
    const button = inner.querySelector(`[data-letter="${i}"]`);
    const item = button.parentElement;
    const previous = inner.querySelector('.tw-open-mail');
    const closing = previous?.parentElement === item;
    if (previous) {
      previous.parentElement.querySelector('button').setAttribute('aria-expanded', 'false');
      previous.remove();
    }
    if (closing) return;
    button.setAttribute('aria-expanded', 'true');
    const paper = document.createElement('article');
    paper.className = 'tw-open-mail tw-letter-sheet';
    paper.style.setProperty('--letter-ink', letterInks[i % letterInks.length]);
    paper.innerHTML = `<p class="tw-letter-to">To Ajay Sommi</p>
      <h3 class="tw-letter-title" tabindex="-1">A letter from ${esc(name)}</h3>
      <blockquote>${esc(quote)}</blockquote>
      <p class="tw-letter-signature">${esc(name)}<span>${esc(org)}</span></p>`;
    item.insertBefore(paper, button);
    paper.querySelector('h3').focus({preventScroll:true});
    const inset = Math.min(72, inner.clientHeight * .14);
    const offset = paper.getBoundingClientRect().top - inner.getBoundingClientRect().top - inset;
    if (offset < 0 || offset > inner.clientHeight * .2) {
      inner.scrollBy({ top: offset, behavior: reduced ? 'instant' : 'smooth' });
    }
    openedLetters.add(i);
    $('.tw-hot[data-id="recs"] .tw-mailbox', svg).classList.add('seen');
  };
  // where each place lives on the web (the same links as the classic site's logo strip)
  const SITES = {
    adt: ['adt.com', 'https://en.wikipedia.org/wiki/ADT_Inc.'], hunter: ['hunter.com', 'https://www.hunter.com'],
    jm: ['JM Family', 'https://en.wikipedia.org/wiki/JM_Family_Enterprises'], toyota: ['Southeast Toyota', 'https://en.wikipedia.org/wiki/Southeast_Toyota_Distributors'],
    fics: ['FICS Research', 'https://fics.institute.ufl.edu'], shiva: ['shivarobotics.com', 'https://www.shivarobotics.com'], rfa: ['roboticsforall.net', 'https://www.roboticsforall.net'], edu: ['ufl.edu', 'https://www.ufl.edu']
  };
  SITES.adt[0] = 'About ADT'; SITES.jm[0] = 'About JM Family'; SITES.toyota[0] = 'About Southeast Toyota';
  const rest = (r, links) => `
      ${r.about ? `<p class="tw-p-about">${esc(r.about)}</p>` : ''}
      <p class="tw-p-text">${esc(r.text)}</p>
      ${r.quote ? `<blockquote class="tw-p-quote">“${esc(r.quote)}”</blockquote>` : ''}
      ${r.photos.length ? `<div class="tw-p-pics">${r.photos.map((s) => `<button type="button" aria-label="Open photo"><img src="${s}" alt="" loading="lazy" decoding="async" /></button>`).join('')}</div>` : ''}
      ${r.steps ? `<ol class="tw-p-steps">${r.steps.map(([f, t, c]) => `<li><button type="button" aria-label="Open photo"><img src="${f}" alt="" loading="lazy" decoding="async" /></button><div><b>${esc(t)}</b><span>${esc(c)}</span></div></li>`).join('')}</ol>` : ''}
      ${r.stats.length ? `<ul class="tw-p-stats">${r.stats.map(([a, b]) => `<li><b>${esc(a)}</b><span>${esc(b)}</span></li>`).join('')}</ul>` : ''}
      ${links.length ? `<div class="tw-p-links"><h4>How it connects</h4>${links.map(([a, b, long]) => { const o = D.roles[a === r.id ? b : a]; return `<button type="button" class="tw-p-link" data-go="${o.id}" style="--lt:${o.tint}"><b>${esc(nameOf(o))} ${yy(o)}</b> ${esc(long)}</button>`; }).join('')}</div>` : ''}
      ${r.url ? `<p class="tw-p-gos"><a class="tw-p-go" href="${esc(r.url)}" target="_blank" rel="noopener">See the code ↗</a></p>` : ''}
      ${r.go ? `<p class="tw-p-gos">${r.go.map(([t, u]) => `<a class="tw-p-go" href="${esc(u)}"${/^https?:/.test(u) ? ' target="_blank" rel="noopener"' : ''}>${esc(t)}</a>`).join('')}</p>` : ''}
      ${r.tags.length ? `<ul class="tw-p-tags">${r.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}`;
  const render = (r) => {
    const i = D.order.indexOf(r.id), p = D.roles[D.order[i - 1]], n = D.roles[D.order[i + 1]];
    panel.style.setProperty('--tint', r.tint);
    const links = linksOf(r.id);
    panel.classList.toggle('tw-postcard', !!r.postcard);
    panel.classList.toggle('tw-mail-panel', !!r.letters);
    if (r.postcard) panel.classList.remove('tw-oc', 'tw-oc-one', 'tw-oc-two');
    if (r.postcard) {
      inner.innerHTML = postcard(r);
      inner.scrollTop = 0;
      inner.classList.remove('swap'); void inner.offsetWidth; inner.classList.add('swap');
      prevB.hidden = nextB.hidden = true;
      $$('.tw-pc-snap button', inner).forEach((b) => b.addEventListener('click', () => lightbox(b.querySelector('img').src)));
      return;
    }
    if (r.letters) {
      panel.classList.remove('tw-oc', 'tw-oc-one', 'tw-oc-two');
      inner.innerHTML = letters(r);
      inner.scrollTop = 0;
      inner.classList.remove('swap'); void inner.offsetWidth; inner.classList.add('swap');
      prevB.hidden = nextB.hidden = true;
      wireLetters(r);
      return;
    }
    const side = /^p-/.test(r.id);
    const [kind, subj] = side ? (/ · /.test(r.role) ? r.role.split(' · ') : ['Side project', r.role]) : [];
    const oc = side && kind === 'Off the clock';
    panel.classList.toggle('tw-oc', oc);
    panel.classList.toggle('tw-oc-one', oc && !r.steps && r.photos.length === 1);
    panel.classList.toggle('tw-oc-two', oc && !r.steps && r.photos.length === 2);
    inner.innerHTML = side ? `
      <div class="tw-p-eyebrow"><span class="tw-p-chip">${esc(kind)}</span></div>
      <h3 class="tw-p-sideh">${esc(r.org)}</h3>
      ${subj ? `<p class="tw-p-subj">${esc(subj.charAt(0).toUpperCase() + subj.slice(1))}</p>` : ''}
      ${r.when ? `<p class="tw-p-stack">${esc(r.when)}</p>` : ''}` + rest(r, links) : `
      <div class="tw-p-top"><span class="tw-p-logo">${r.logo ? logo(r.logo) : r.gator ? `<img src="${r.gator}" alt="" style="max-height:42px" />` : ''}</span><span class="tw-p-yr">${yy(r)}</span></div>
      <h3>${esc(r.org)}</h3>
      <p class="tw-p-role">${esc(r.role)}</p>
      ${r.when || r.where ? `<p class="tw-p-meta">${r.when ? `<span><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="3.2" width="12" height="10.6" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M2.6 6.6h10.8M5.4 1.8v2.8M10.6 1.8v2.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>${esc(r.when.replace(' to ', ' – '))}</span>` : ''}${r.where ? `<span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 14.6s4.8-4.4 4.8-8.2A4.8 4.8 0 0 0 3.2 6.4c0 3.8 4.8 8.2 4.8 8.2z" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="6.4" r="1.7" fill="currentColor"/></svg>${esc(r.where)}</span>` : ''}</p>` : ''}
      ${SITES[r.id] ? `<p class="tw-p-site"><a href="${SITES[r.id][1]}" target="_blank" rel="noopener">${esc(SITES[r.id][0])}<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5h6.5V10M12.2 3.8 4 12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></a></p>` : ''}
` + rest(r, links);
    inner.scrollTop = 0;
    inner.classList.remove('swap'); void inner.offsetWidth; inner.classList.add('swap');
    prevB.hidden = !p; nextB.hidden = !n;
    if (p) { $('span', prevB).textContent = p.school ? 'UF' : p.short; prevB.dataset.id = p.id; }
    if (n) { $('span', nextB).textContent = n.school ? 'UF' : n.short; nextB.dataset.id = n.id; }
    nextB.style.marginLeft = 'auto';
    $$('.tw-p-link', inner).forEach((b) => b.addEventListener('click', () => open(b.dataset.go)));
    $$('.tw-p-pics button, .tw-p-steps button', inner).forEach((b) => b.addEventListener('click', () => lightbox(b.querySelector('img').src)));
  };

  // A photo from a card opens over the whole window; a click or Esc puts it back.
  const lightbox = (src, caption) => {
    const lb = document.createElement('div');
    lb.className = 'tw-lightbox';
    lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', 'Photo');
    lb.innerHTML = `<img src="${esc(src)}" alt="" /><button type="button" class="tw-lb-x ui-close" aria-label="Close photo"></button>`;
    lb.addEventListener('click', () => { lb.classList.add('out'); setTimeout(() => lb.remove(), 220); });
    if (caption) { const note = document.createElement('p'); note.textContent = caption; lb.appendChild(note); lb.classList.add('captioned'); }
    document.body.appendChild(lb);
  };
  let keepsake = null;
  const photos = {
    baby: {
      file: 'baby-photo.webp', width: 1500, height: 1125,
      label: 'Camry childhood photo', alt: 'Me as a baby in the plaid car seat.',
      caption: 'I was only a few months old when my family brought me home in our green ’96 Camry, in that plaid seat.',
    },
    trike: {
      file: 'trike-photo.webp', width: 640, height: 480, label: 'Tricycle photo',
      alt: 'Me as a child with the red and blue tricycle.',
    },
  };
  const keepsakeFrame = () => {
    const { item, card } = keepsake;
    const [x, y] = item.dataset.anchor.split(' ').map(Number);
    const matrix = svg.getScreenCTM().inverse().multiply(item.getScreenCTM());
    const p = new DOMPoint(x, y).matrixTransform(matrix);
    const bounds = item.getBBox();
    const right = new DOMPoint(bounds.x + bounds.width, y).matrixTransform(matrix);
    const w = Math.min(vw, Math.max(205, 225 * vw / 900)), h = w * vh / vw;
    const toWorld = w / stage.clientWidth;
    const gap = clamp(stage.clientWidth * .04, 28, 72);
    return [right.x - (card.offsetLeft - gap) * toWorld, p.y - h * .5, w, h];
  };
  const settleKeepsake = () => {
    if (!keepsake?.imageReady || !keepsake.cameraReady || tw.classList.contains('memory-settled')) return;
    tw.classList.add('memory-settled');
    $('.tw-memory-close', keepsake.card).focus({ preventScroll: true });
  };
  const closeKeepsake = (restoreFocus = false, returnView = true) => {
    if (!keepsake) return;
    const { item, card } = keepsake;
    keepsake = null;
    item.classList.remove('memory-open');
    item.setAttribute('aria-expanded', 'false');
    card.remove();
    tw.classList.remove('memory-view', 'memory-settled');
    if (returnView) tween(view(), 500);
    else {
      cancelAnimationFrame(anim);
      zoomUntil = 0;
      svg.classList.remove('tw-moving', 'tw-zooming', 'tw-glide');
    }
    if (restoreFocus) item.focus({ preventScroll: true });
  };
  const openKeepsake = (item) => {
    if (keepsake?.item === item) { closeKeepsake(true); return; }
    if (cur === 'adt') return;
    if (cur) close();
    closeKeepsake(false, false);
    cancelAnimationFrame(glide); glideStop();
    hideLabel(); glow(null); over = null;
    const photo = photos[item.dataset.memory];
    const card = document.createElement('aside');
    card.className = 'tw-memory-card';
    if (photo.caption) card.classList.add('has-caption');
    card.style.setProperty('--photo-ratio', photo.width / photo.height);
    card.setAttribute('aria-label', photo.label);
    card.innerHTML = `<div class="tw-memory-header">
        <button class="tw-memory-close ui-close" type="button" aria-label="Close photo"></button>
      </div>
      <img src="assets/images/town/${photo.file}" alt="${esc(photo.alt)}" width="${photo.width}" height="${photo.height}">
      ${photo.caption ? `<p>${esc(photo.caption)}</p>` : ''}`;
    stage.append(card);
    const opened = keepsake = { item, card, imageReady: false, cameraReady: false };
    item.classList.add('memory-open');
    item.setAttribute('aria-expanded', 'true');
    tw.classList.add('memory-view');
    $('.tw-memory-close', card).addEventListener('click', () => closeKeepsake(true));
    $('img', card).decode().catch(() => {}).then(() => {
      if (keepsake !== opened) return;
      opened.imageReady = true;
      settleKeepsake();
    });
    tween(keepsakeFrame(), 670, ease, () => {
      opened.cameraReady = true;
      settleKeepsake();
    });
  };
  $$('[data-memory]', svg).forEach((item) => {
    const rim = item.querySelector('.tw-keepsake-rim');
    item.setAttribute('aria-expanded', 'false');
    rim.setAttribute('filter', fitted(rim, item.dataset.memory === 'trike' ? 'twHalo-toyota' : 'twHalo-vc'));
    item.addEventListener('pointerenter', () => item.classList.add('memory-hover'));
    item.addEventListener('pointerleave', () => item.classList.remove('memory-hover'));
    const show = (e) => {
      e.stopPropagation();
      if (dragged && e.type === 'click') return;
      if (intro) return;
      openKeepsake(item);
    };
    item.addEventListener('click', show);
    item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(e); } });
  });
  const open = (id) => {
    const r = D.roles[id];
    if (!r) return;
    closeKeepsake(false, false);
    if (r.special) { timeTravel(); return; }
    const wasOpen = !!cur;
    cur = id;
    const z = zoomOf(id), left = z[0] + z[2] / 2 > vb[0] + vb[2] / 2;
    cancelAnimationFrame(glide); glideStop();
    // when the card closes, the street is left centred on this place
    camX = clamp(z[0] + z[2] / 2 - vw / 2, 0, Math.max(0, WORLD - vw));
    panel.classList.toggle('left', left);
    panel.hidden = false;
    render(r);
    requestAnimationFrame(() => {
      if (cur !== id) return;
      panel.classList.add('open');
      tween(frame(z, left), wasOpen ? 750 : 900);
    });
    tw.classList.add('zoomed');
    // the Civic's hood swings up while its stop is open
    tw.classList.toggle('hood', id === 'p-civic');
    hots.forEach((x) => x.classList.toggle('tw-cur', x.dataset.id === id));
    if (lit !== id) { glow(null); glow(id); } else if (halos[id]) { halos[id].classList.add('keep'); halos[id]._lite.classList.add('keep'); }
    if (id === 'jm') { arrived = true; tw.classList.add('arrive', 'parked'); }
    chips.forEach((c) => c.classList.toggle('on', c.dataset.id === id));
    const pin = $(`.tw-pin[data-id="${id}"]`, svg); if (pin) pin.classList.add('seen');
    hideLabel(); panL.classList.remove('on'); panR.classList.remove('on');
  };
  const close = () => {
    if (!cur) return;
    cur = null;
    tw.classList.remove('hood');
    panel.classList.remove('open');
    setTimeout(() => { if (!cur) panel.hidden = true; }, 360);
    tween(view(), 800);
    tw.classList.remove('zoomed');
    hots.forEach((x) => x.classList.remove('tw-cur'));
    glow(null); over = null;
    chips.forEach((c) => c.classList.remove('on'));
  };

  // ADT is a read-only stop. Catch outside clicks before scene objects can
  // interpret them as clicks on a landmark or as damage.
  stage.addEventListener('click', (event) => {
    if (cur !== 'adt' || dragged || panel.contains(event.target)) return;
    event.stopPropagation();
    close();
  }, true);
  // Clicking off the open place steps back out; clicking the place itself
  // again plays with it (see the damage, below).
  hots.forEach((h) => h.addEventListener('click', (e) => {
    e.stopPropagation(); if (dragged) return;
    if (keepsake) { closeKeepsake(); return; }
    if (cur === h.dataset.id) poke(h.dataset.id, e);
    // Hunter's stop sits on the dealership. Clicking off returns to the street.
    else if (cur === 'hunter') close();
    else open(h.dataset.id);
  }));
  stickers.forEach((n) => {
    n.addEventListener('click', (e) => { e.stopPropagation(); if (!dragged && cur !== 'adt') open('adt'); });
  });
  chips.forEach((c) => {
    c.addEventListener('click', () => { open(c.dataset.id); stage.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' }); });
    c.addEventListener('mouseenter', () => { if (!cur) glow(c.dataset.id); });
    c.addEventListener('mouseleave', () => { if (!cur) glow(null); });
  });
  $('.tw-x', panel).addEventListener('click', close);
  prevB.addEventListener('click', () => open(prevB.dataset.id));
  nextB.addEventListener('click', () => open(nextB.dataset.id));
  svg.addEventListener('click', () => { if (!dragged) { if (keepsake) closeKeepsake(); else close(); } });
  document.addEventListener('keydown', (e) => {
    if (!stage.clientWidth || e.target.closest('select, input, textarea, [role="menu"]')) return;
    if (keepsake) {
      if (e.key === 'Escape') closeKeepsake(true);
      if (/^Arrow|^Page|^Home$|^End$/.test(e.key)) e.preventDefault();
      return;
    }
    if (e.key === 'Escape' && !cur) { const big = $('.tw-lightbox'); if (big) { big.remove(); return; } }
    if ((intro || zooming()) && /^Arrow|^Page|^Home$|^End$/.test(e.key)) { e.preventDefault(); return; }
    if (!cur) {
      if (e.target.closest && e.target.closest('input, textarea')) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') explored = true;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        if (reduced) { glideBy(dir * vw * .08); return; }
        if (!e.repeat) glideBy(dir * vw * 0.1);
        keyDir = dir;
        if (!gRaf) { gT = performance.now(); gTo = gTo === null ? camX : gTo; gRaf = requestAnimationFrame(glideStep); }
      }
      return;
    }
    if (e.key === 'Escape') { const big = $('.tw-lightbox'); if (big) big.remove(); else close(); }
    else if (e.key === 'ArrowRight' && !nextB.hidden) open(nextB.dataset.id);
    else if (e.key === 'ArrowLeft' && !prevB.hidden) open(prevB.dataset.id);
  });

  /* ---------------------------------------------------------- hover */
  // What's under the pointer decides; a short grace period covers the
  // moment between one part and the next.
  const hideLabel = () => label.classList.remove('on');
  const showLabel = (id) => {
    const r = D.roles[id], s = stage.getBoundingClientRect(), pin = $(`.tw-pin[data-id="${id}"]`, svg);
    if (!pin) { hideLabel(); return; }
    const at = pin.getBoundingClientRect();
    label.style.setProperty('--tint', r.tint);
    label.innerHTML = `<b>${yy(r)}</b>${esc(nameOf(r))}`;
    label.style.left = (at.left + at.width / 2 - s.left) + 'px';
    label.style.top = (at.top - s.top) + 'px';
    label.classList.add('on');
  };
  let over = null, offT = 0;
  let sliding = 0, pendingHover;
  const slid = () => {
    if (!sliding) { svg.classList.add('tw-moving'); hideLabel(); }
    clearTimeout(sliding);
    sliding = setTimeout(() => {
      sliding = 0;
      if (!zooming()) {
        if (camOn) setVB(vb);
        svg.classList.remove('tw-moving');
      }
      if (pendingHover !== undefined) {
        const id = pendingHover;
        pendingHover = undefined;
        hoverTo(id);
      }
    }, 160);
  };
  const hoverTo = (id) => {
    if (intro || document.documentElement.classList.contains('is-loading') || cur || keepsake) return;
    if (sliding) { pendingHover = id; return; }
    clearTimeout(offT);
    if (id) { if (id !== over) { over = id; glow(id); showLabel(id); } return; }
    if (!over) return;
    offT = setTimeout(() => { over = null; glow(null); hideLabel(); }, 160);
  };
  const idAt = (t) => { if (!t || !t.closest) return null; if (t.closest('.tw-adtsticker')) return 'adt'; const h = t.closest('.tw-hot'); return h ? h.dataset.id : null; };
  svg.addEventListener('pointerover', (e) => { if (showRobot && !sliding && !zooming()) overCol = colOf(e); hoverTo(idAt(e.target)); });
  let colT = 0; svg.addEventListener('pointermove', (e) => { const n = performance.now(); if (showRobot && !sliding && !zooming() && n - colT > 45) { colT = n; overCol = colOf(e); } });
  svg.addEventListener('pointerout', (e) => hoverTo(idAt(e.relatedTarget)));

  /* ---------------------------------------------------------- the pointer */
  const head = $('.tw-cctv-head', svg), dish = $('.tw-dish', svg), eyes = $$('.tw-follow', svg);
  const toSVG = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(cam.getScreenCTM().inverse()); };
  let ptr = null;
  /* The security camera and the FICS dish sweep on their own. When the
     pointer is near, each turns to follow it; when the pointer goes, it eases
     back into its sweep from wherever it was looking (joining the sweep at the
     nearest point, so it never jumps). */
  const turner = (el, rest, swing, period, draw) => {
    const t = { aim: null, a: rest, phase: 0, from: rest, back: 1, rest };
    t.draw = (a) => { if (el) el.style.transform = draw(a); };
    t.step = (dt) => {
      if (!el || zooming()) return;
      if (t.aim !== null) {
        t.a += (t.aim - t.a) * (1 - Math.exp(-dt * 9));
        t.back = 0; t.from = t.a;
      } else {
        if (t.back === 0) {
          // start the sweep where it's already pointing, headed back to the middle
          const u = clamp((t.a - rest) / swing, -1, 1);
          t.phase = u > 0 ? Math.PI - Math.asin(u) : Math.asin(u);
        }
        t.phase += dt * 2 * Math.PI / period;
        const sweep = rest + swing * Math.sin(t.phase);
        t.back = Math.min(1, t.back + dt / 1.2);
        const k = t.back * t.back * (3 - 2 * t.back);
        t.a = t.from + (sweep - t.from) * k;
      }
      t.draw(t.a);
    };
    // with reduced motion there's no sweep: it simply looks, or rests
    t.set = (aim) => { t.aim = aim; if (reduced) t.draw(aim === null ? rest : aim); };
    return t;
  };
  const cctv = turner(head, -104, 22, 7, (a) => `rotate(${a.toFixed(2)}deg)`);
  const dishT = turner(dish, 0, 30, 9, (a) => `translate(0px, -16px) rotate(${a.toFixed(2)}deg)`);
  // A robot comes over when the pointer is near its patch, stops short of
  // it, and otherwise ambles about inside the patch.
  const steer = (b, dt, now) => {
    const [x0, x1, y0, y1] = b.box;
    const near = !b.scared && ptr && !cur && ptr.x > x0 - b.reach && ptr.x < x1 + b.reach && ptr.y > y0 - b.reach && ptr.y < y1 + b.reach;
    if (b.scared) { b.tx = x1; b.ty = y0; }
    else if (near) {
      const side = ptr.x >= b.x ? -1 : 1;
      b.tx = clamp(ptr.x + side * b.keep, x0, x1); b.ty = clamp(ptr.y, y0, y1);
    } else if (now > b.idleAt) { b.tx = x0 + Math.random() * (x1 - x0); b.ty = y0 + Math.random() * (y1 - y0); b.idleAt = now + 3500 + Math.random() * 4000; }
    const dx = b.tx - b.x, dy = b.ty - b.y, d = Math.hypot(dx, dy);
    const k = near || b.scared ? b.k * 1.4 : b.k * 0.5, damp = 2 * Math.sqrt(k);
    b.vx += (dx * k - b.vx * damp) * dt; b.vy += (dy * k - b.vy * damp) * dt;
    const sp = Math.hypot(b.vx, b.vy), cap = near ? b.max : b.scared ? b.max * 1.5 : b.max * 0.45;
    if (sp > cap) { b.vx *= cap / sp; b.vy *= cap / sp; }
    b.x = clamp(b.x + b.vx * dt, x0, x1); b.y = clamp(b.y + b.vy * dt, y0, y1);
    b.tilt += (clamp(b.vx * 0.14, -9, 9) * b.face - b.tilt) * Math.min(1, dt * 6);
    // Face the pointer when it's close, otherwise the way it's going.
    if (b.scared && d < 4) b.face = -1; else if (near) b.face = ptr.x >= b.x ? 1 : -1; else if (Math.abs(b.vx) > 4) b.face = b.vx > 0 ? 1 : -1;
    b.el.classList.toggle('still', sp < 3);
    if (near && !b.near) { b.el.classList.remove('hop'); void b.el.getBoundingClientRect(); b.el.classList.add('hop'); }
    b.near = near;
    b.el.classList.toggle('wave', near && sp < 6 && d < 6);
    placeBot(b);
    return near;
  };
  // The robots and alignment lift only repaint while that part of the block is in view.
  function tickActors(now) {
    actorFrame = 0;
    if (!visible || !(showRover || showRobot || showLift || showCctv || showDish)) return;
    const dt = Math.min(0.05, (now - (lastT || now)) / 1000); lastT = now;
    if (dt > 0 && showRover && (!cur || bots.rfa.scared)) {
      if (!bots.rfa.dead) steer(bots.rfa, dt, now);
    }
    if (dt > 0 && showRobot && !cur) {
      const close = !bots.rjax.dead && steer(bots.rjax, dt, now) && Math.hypot(ptr.x - bots.rjax.x, ptr.y - bots.rjax.y) < 230;
      const want = close ? [ptr.x, ptr.y] : TARGET;
      aim = [aim[0] + (want[0] - aim[0]) * Math.min(1, dt * 2.5), aim[1] + (want[1] - aim[1]) * Math.min(1, dt * 2.5)];
      aimCam();
    }
    if (dt > 0 && showLift) lift(now);
    if (dt > 0 && showRobot) tintBeam(dt);
    if (dt > 0 && showCctv) cctv.step(dt);
    if (dt > 0 && showDish) dishT.step(dt);
    actorFrame = requestAnimationFrame(tickActors);
  }

  let praf = 0, lastE = null;
  stage.addEventListener('pointermove', (e) => {
    lastE = e;
    if (praf) return;
    praf = requestAnimationFrame(() => {
      praf = 0;
      if (sliding || zooming()) return;
      const e = lastE;
      const p = toSVG(e);
      ptr = { x: p.x, y: p.y };
      const sky = p.y < 330;
      tw.classList.toggle('sky', sky);
      tw.classList.toggle('near', !sky);
      const dishOn = !!dish && (p.y < 376 || Math.hypot(p.x - 3080, p.y - 382) < 120);
      tw.classList.toggle('dishon', dishOn);
      if (dishOn) {
        // The dish sits on HiPerGator's roof at (3080, 382); it turns its face to the pointer.
        const a = Math.atan2(p.x - 3080, 382 - p.y) * 180 / Math.PI;
        dishT.set(clamp(a, -70, 70));
      } else dishT.set(null);
      if (!sky && head) {
        // The camera is up at the roofline at (1268, 350), looking down over its
        // sign; it turns only as far as its mount allows.
        let a = Math.atan2(350 - p.y, 1268 - p.x) * 180 / Math.PI;
        if (a > 90) a -= 360;
        cctv.set(clamp(a, -160, -30));
      } else cctv.set(null);
      // (the rover is drawn flipped when it faces left, so its eyes' x is too)
      const fx = bots.rfa.face < 0 ? -1 : 1;
      if (showRover) eyes.forEach((el) => {
        const r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1;
        el.style.transform = `translate(${(dx / d * 2.4 * fx).toFixed(2)}px, ${(dy / d * 2.4).toFixed(2)}px)`;
      });
    });
  });
  stage.addEventListener('pointerleave', () => {
    ptr = null;
    tw.classList.remove('sky', 'near', 'dishon');
    cctv.set(null);
    dishT.set(null);
    eyes.forEach((el) => { el.style.transform = ''; });
    if (!cur) { clearTimeout(offT); over = null; glow(null); hideLabel(); }
  });

  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    svg.classList.toggle('tw-paused', !visible);
    syncActors();
  }).observe(stage);
  const blockIntroScroll = (event) => {
    if (intro && !event.ctrlKey) event.preventDefault();
  };
  window.addEventListener('wheel', blockIntroScroll, { passive: false, capture: true });
  window.addEventListener('touchmove', blockIntroScroll, { passive: false, capture: true });
  /* A swipe keeps the direction it started in: once two fingers move the
     street sideways, moving them up and down without lifting does nothing,
     until the trackpad has been still for a moment (its coasting counts as
     the same swipe). Sideways gets a little more travel, since a sideways
     swipe is shorter than an up-and-down one. */
  let wheelAxis = null, wheelLast = -1e9;
  const SIDE_GAIN = 1.35, SWIPE_GAP = 700;
  stage.addEventListener('wheel', (e) => {
    if (intro || cur || keepsake || e.ctrlKey || e.target.closest('.tw-wayfinding') || document.documentElement.classList.contains('is-loading')) return;
    const k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? vw * scale : 1;
    const ax = Math.abs(e.deltaX), ay = Math.abs(e.deltaY);
    if (!ax && !ay || zooming()) return;
    e.preventDefault();
    if (!wheelAxis || e.timeStamp - wheelLast > SWIPE_GAP) wheelAxis = ax > ay ? 'x' : 'y';
    wheelLast = e.timeStamp;
    const d = wheelAxis === 'x' ? e.deltaX * k * SIDE_GAIN : e.deltaY * k;
    if (!d) return;
    explored = true;
    glideBy(d / scale);
  }, { passive: false });
  let drag = null, dragged = false, dragFrame = 0;
  const paintDrag = () => {
    dragFrame = 0;
    if (!drag || !dragged) return;
    camX = clamp(drag.cam - (drag.lastX - drag.startX) / scale, 0, Math.max(0, WORLD - vw));
    explored = true;
    slid(); placeVB(view(), true);
  };
  svg.addEventListener('pointerdown', (e) => {
    if (!e.isPrimary || e.button !== 0 || drag) return;
    dragged = false;
    if (intro || cur || keepsake || zooming()) return;
    cancelAnimationFrame(glide); glideStop();
    drag = { startX: e.clientX, lastX: e.clientX, cam: camX, id: e.pointerId, time: e.timeStamp, speed: 0 };
  });
  addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!dragged && Math.abs(e.clientX - drag.startX) < 6) return;
    if (!dragged) {
      dragged = true; tw.classList.add('dragging');
      svg.setPointerCapture(e.pointerId);
    }
    const dt = Math.max(4, e.timeStamp - drag.time);
    const velocity = clamp((drag.lastX - e.clientX) / dt, -2.4, 2.4);
    drag.speed += (velocity - drag.speed) * (1 - Math.exp(-dt / 25));
    drag.time = e.timeStamp; drag.lastX = e.clientX;
    if (!dragFrame) dragFrame = requestAnimationFrame(paintDrag);
  });
  const endDrag = e => {
    if (!drag || e.pointerId !== drag.id) return;
    cancelAnimationFrame(dragFrame); paintDrag();
    if (e.type === 'pointerup' && dragged && !reduced && e.timeStamp - drag.time < 75) {
      glideBy(drag.speed * 150 / scale);
    }
    drag = null; tw.classList.remove('dragging');
    setTimeout(() => { dragged = false; }, 0);
  };
  addEventListener('pointerup', endDrag);
  addEventListener('pointercancel', endDrag);
  svg.addEventListener('lostpointercapture', endDrag);
  panL.addEventListener('click', () => { if (!keepsake && !zooming()) panTo(camX - vw * 0.6); });
  panR.addEventListener('click', () => { if (!keepsake && !zooming()) panTo(camX + vw * 0.6); });
  const themeB = $('.tw-theme', tw);
  if (themeB) themeB.addEventListener('click', () => { const b = document.getElementById('themeBtn'); if (b) b.click(); });

  if (reduced) { arrived = true; tw.classList.add('arrive', 'parked'); }
  addEventListener('resize', () => { if (!stage.clientWidth || !stage.clientHeight) return; measure(); if (keepsake) { cancelAnimationFrame(anim); zoomUntil = 0; svg.classList.remove('tw-moving', 'tw-zooming'); setVB(keepsakeFrame()); keepsake.cameraReady = true; settleKeepsake(); } else if (cur) setVB(frame(zoomOf(cur), panel.classList.contains('left'))); else setVB(view()); });
  /* ---------------------------------------------------------- the compact bar */
  // Home (and the logo) slide back to the visitor center; the weather and
  // the menu open small lists under the bar.
  const goHome = () => { closeKeepsake(false, false); if (cur) { camX = homeX(); close(); } else panTo(homeX(), 1100); };
  const brand = document.querySelector('header.nav .brand');
  if (brand) brand.addEventListener('click', (e) => { if (!matchMedia('(min-width: 720px)').matches) return; e.preventDefault(); goHome(); });
  const pops = [['twWx', 'twWxPop'], ['twMenu', 'twMenuPop']].map(([b, p]) => [document.getElementById(b), document.getElementById(p)]).filter(([b, p]) => b && p);
  const shut = () => pops.forEach(([b, p]) => { p.hidden = true; b.setAttribute('aria-expanded', 'false'); });
  pops.forEach(([b, p]) => b.addEventListener('click', (e) => { e.stopPropagation(); const was = !p.hidden; shut(); if (!was) { p.hidden = false; b.setAttribute('aria-expanded', 'true'); } }));
  document.addEventListener('click', (e) => { if (!e.target.closest('.tw-popwrap')) shut(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') shut(); });
  const fixItem = document.querySelector('#twMenuPop [data-go="fix"]');
  if (fixItem) fixItem.addEventListener('click', () => { shut(); repair(); });
  const exit = $('.tw-exit', svg);
  if (exit) exit.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); if (dragged) return; if (window.hopTo) window.hopTo('classic.html'); else location.href = 'classic.html'; });

  /* ---------------------------------------------------------- the time machine */
  // Its display rolls through the eras it can take you to.
  const tmYr = $('.tw-tm-yr', svg);
  if (tmYr && !reduced) { const ys = ['1977', '1984', '1998', '2007']; let k = 0; setInterval(() => { k = (k + 1) % ys.length; tmYr.textContent = ys[k]; }, 1400); }
  // Stepping in plays the standard site's own trip to the eras: the mark
  // flies from the bar to the middle and the era picker loads (hop.js).
  function timeTravel() {
    if (window.hopTo) window.hopTo('eras.html'); else location.href = 'eras.html';
  }

  /* ---------------------------------------------------------- weather */
  // Clear, rain, snow or fall. The falling things are drawn on a canvas
  // over the street. What settles (snow on the roofs, the cars, the letters
  // and the lawn; the leaves turning) builds up a step every half second,
  // and melts off the same way when the weather changes: a few steps cost
  // far less than redrawing the whole street every frame. In the snow the
  // rover shivers, then puts on its jacket and beanie.
  const wxc = $('.tw-wx', stage), rover = bots.rfa.el, wctx = wxc.getContext('2d');
  let wx = 'clear', parts = [], wxRaf = 0, wxLast = 0, coldT = 0, wxCam = null;
  let snowV = 0, fallV = 0, settleT = 0;
  let settleAt = 0;
  const settle = () => {
    const ts = wx === 'snow' ? 1 : 0, tf = wx === 'fall' ? 1 : 0;
    const now = performance.now(), dt = settleAt ? Math.min(0.6, (now - settleAt) / 1000) : 0; settleAt = now;
    // building up: a step every half second; melting: many small steps, so it fades away evenly
    snowV = reduced ? ts : snowV + clamp(ts - snowV, -0.3 * dt, 0.066 * dt);
    fallV = reduced ? tf : fallV + clamp(tf - fallV, -0.4 * dt, 0.18 * dt);
    tw.style.setProperty('--snow', snowV.toFixed(3));
    tw.style.setProperty('--fall', fallV.toFixed(3));
    tw.classList.toggle('snowy', snowV > 0.002);
    if (Math.abs(ts - snowV) < 0.002 && Math.abs(tf - fallV) < 0.002) { clearInterval(settleT); settleT = 0; }
  };
  // the canvas at the screen's own size (one pixel per point is plenty for rain and snow)
  const sizeWx = () => { wxc.width = stage.clientWidth; wxc.height = stage.clientHeight; };
  const spawn = (mode, any) => {
    const w = stage.clientWidth, h = stage.clientHeight, y = any ? Math.random() * h : -20;
    const z = 0.75 + Math.random() * 0.45;
    if (mode === 'snow') return { x: Math.random() * w, y, z, vx: 0, r: (1 + Math.random() * 2.4) * z, vy: (28 + Math.random() * 46) * z, ph: Math.random() * 6.3, sw: 10 + Math.random() * 22 };
    if (mode === 'rain') return { x: Math.random() * (w + 200), y, z, vx: 0, l: (10 + Math.random() * 12) * z, vy: (820 + Math.random() * 380) * z };
    return { x: Math.random() * w, y, z, vx: 0, r: 3.4 + Math.random() * 2.8, vy: 36 + Math.random() * 40, ph: Math.random() * 6.3, sw: 30 + Math.random() * 40, rot: Math.random() * 6.3, c: ['#e9952f', '#c2541c', '#d9b13b', '#a8401a'][(Math.random() * 4) | 0] };
  };
  const wxLoop = (t) => {
    const dt = Math.min(0.05, (t - (wxLast || t)) / 1000); wxLast = t;
    const c = wctx, w = wxc.width, h = wxc.height;
    c.clearRect(0, 0, w, h);
    const night = isNight();
    // how far the street moved since the last frame, on screen
    let dx = 0;
    if (wxCam && Math.abs(vb[2] - wxCam[1]) < 0.01) dx = (vb[0] - wxCam[0]) * (w / vb[2]);
    wxCam = [vb[0], vb[2]];
    const wake = dt > 0 ? clamp(dx / dt, -4000, 4000) : 0, decay = Math.exp(-dt * 2.2);
    if (wx === 'snow') { c.fillStyle = night ? 'rgba(235,240,255,.9)' : 'rgba(255,255,255,.95)'; c.beginPath(); }
    else if (wx === 'rain') { c.strokeStyle = night ? 'rgba(170,190,230,.45)' : 'rgba(90,120,160,.45)'; c.lineWidth = 1.2; c.beginPath(); }
    for (let i = 0; i < parts.length; i++) {
      let p = parts[i];
      p.x -= dx * p.z;
      p.vx = p.vx * decay + wake * 0.26 * p.z * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt - Math.abs(p.vx) * dt * (wx === 'rain' ? 0.05 : 0.35);
      if (p.x < -40) p.x += w + 80; else if (p.x > w + 40) p.x -= w + 80;
      if (p.y > h + 20) { p = parts[i] = spawn(wx, false); }
      if (wx === 'snow') { p.ph += dt * 1.3; const x = p.x + Math.sin(p.ph) * p.sw; c.moveTo(x + p.r, p.y); c.arc(x, p.y, p.r, 0, 6.283); }
      else if (wx === 'rain') { p.x -= p.vy * 0.16 * dt; const sk = 0.16 - p.vx / p.vy; c.moveTo(p.x, p.y); c.lineTo(p.x + p.l * sk, p.y - p.l); }
      else { p.ph += dt * 1.6; p.rot += dt * 2; const x = p.x + Math.sin(p.ph) * p.sw; c.save(); c.translate(x, p.y); c.rotate(p.rot); c.fillStyle = p.c; c.beginPath(); c.ellipse(0, 0, p.r * 1.6, p.r * 0.8, 0, 0, 6.283); c.fill(); c.restore(); }
    }
    if (wx === 'snow') c.fill(); else if (wx === 'rain') c.stroke();
    wxRaf = requestAnimationFrame(wxLoop);
  };
  const setWeather = (mode) => {
    if (!['clear', 'rain', 'snow', 'fall'].includes(mode)) return;
    wx = mode;
    tw.classList.remove('wx-rain', 'wx-snow', 'wx-fall');
    if (mode !== 'clear') tw.classList.add('wx-' + mode);
    document.querySelectorAll('#twWxPop [data-wx]').forEach((b) => { const on = b.dataset.wx === mode; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
    cancelAnimationFrame(wxRaf); wxLast = 0; wxCam = null;
    clearTimeout(coldT);
    clearInterval(settleT); settleAt = performance.now();
    settleT = setInterval(settle, (mode !== 'snow' && snowV > 0.002) || (mode !== 'fall' && fallV > 0.002) ? 40 : 450);
    settle();
    wxGrey = mode === 'rain' ? 0.5 : mode === 'snow' ? 0.32 : 0; barSet = ''; paintBar();
    rover.classList.remove('cold', 'jacket');
    if (mode === 'snow') { rover.classList.add('cold'); coldT = setTimeout(() => rover.classList.add('jacket'), 3200); }
    sizeWx();
    const n = mode === 'snow' ? 190 : mode === 'rain' ? 240 : mode === 'fall' ? 34 : 0;
    parts = Array.from({ length: reduced ? Math.round(n / 4) : n }, () => spawn(mode, true));
    if (n) wxRaf = requestAnimationFrame(wxLoop); else wctx.clearRect(0, 0, wxc.width, wxc.height);
    tw.classList.toggle('wx-on', !!n);
  };
  document.querySelectorAll('#twWxPop [data-wx]').forEach((b) => b.addEventListener('click', () => { setWeather(b.dataset.wx); shut(); }));
  addEventListener('resize', () => { if (wx !== 'clear') sizeWx(); });

  /* ---------------------------------------------------------- the damage */
  // Click a place again while you're looking at it and it takes the hit.
  // The Civic's windows crack (and give way) and its bumpers fall off; the
  // MacBook's screen breaks, then it catches fire. The showroom glass takes
  // a good few hits before it comes down, and that sets off the alarm: the
  // lights inside go out but for a red emergency light in the corner and a
  // white strobe, the ADT sign lights up, the rover runs for its corner, the
  // police come; a car hit through the broken glass goes off too. A car on
  // the truck, dented or cracked, sets off its own alarm. Malachowsky's
  // windows crack and give way, one at a time; the HawkEye's screen and the
  // BetAI TV break (the TV once its window is gone); the house's windows and
  // its door give in if you keep at them, its ADT sign lights up and the
  // police come. Everything else takes nicks and cracks. A fresh visit always
  // starts clean.
  const fresh = () => ({ civ: { fb: 0, rb: 0, dents: [] }, mac: 0, toy: 0, cars: {}, police: 0, tcars: {}, hk: 0, tv: 0, hdoor: 0, home: 0 });
  let dmg = fresh();
  const hits = {};
  const damaged = () => paneHits || dmg.mac || dmg.toy || dmg.civ.fb || dmg.civ.rb || dmg.civ.dents.length || Object.keys(hits).length || Object.keys(dmg.tcars).length || dmg.hk || dmg.hdoor;
  const save = () => { if (fixItem) fixItem.hidden = !damaged(); };
  const localPt = (el, e) => { const q = svg.createSVGPoint(); q.x = e.clientX; q.y = e.clientY; return q.matrixTransform(el.getScreenCTM().inverse()); };
  const inPoly = (x, y, poly) => { let o = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) o = !o; } return o; };
  const seeded = (n) => { let v = Math.abs(Math.floor(n * 9301 + 49297)) % 2147483646 + 1; return () => (v = (v * 16807) % 2147483647) / 2147483647; };
  const NSel = (tag, attrs) => { const n = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); return n; };
  const refresh = (id) => { if (halos[id]) { halos[id].remove(); halos[id]._lite.remove(); delete halos[id]; } if (lit === id) { lit = null; glow(id); } };
  const add = (g, html) => { g.insertAdjacentHTML('beforeend', html); };
  // a dent: a dark crease and a little bare metal
  const nick = (x, y, k) => `<g class="tw-nick"><ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(2.2 * k).toFixed(2)}" ry="${(1.4 * k).toFixed(2)}" class="tw-scorch"/><path d="M${(x - 2.4 * k).toFixed(1)} ${(y + 0.6 * k).toFixed(1)} q${(2.4 * k).toFixed(1)} ${(-2.6 * k).toFixed(1)} ${(4.8 * k).toFixed(1)} 0" class="tw-dent"/></g>`;
  // glass falling out of a window that gives way, down to the ground
  const fallShards = (g, poly, ground) => {
    if (reduced) return;
    const xs = poly.map((q) => q[0]), ys = poly.map((q) => q[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y1 = Math.max(...ys);
    const n = clamp(Math.round((x1 - x0) / 2.4), 5, 12);
    for (let i = 0; i < n; i++) {
      const x = x0 + Math.random() * (x1 - x0), y = y1 - Math.random() * 6;
      const sh = NSel('path', { d: `M${x.toFixed(2)} ${y.toFixed(2)} l${(1 + Math.random() * 1.6).toFixed(2)} ${(-1 - Math.random()).toFixed(2)} l${(0.4 + Math.random()).toFixed(2)} ${(1.6 + Math.random()).toFixed(2)} z`, class: 'tw-fallshard', style: `--fx:${((Math.random() - 0.5) * 14).toFixed(1)}px;--fy:${(ground - y + Math.random() * 3).toFixed(1)}px;--fr:${(Math.random() * 400 - 200).toFixed(0)}deg;animation-delay:${(Math.random() * 0.15).toFixed(2)}s` });
      g.appendChild(sh);
      setTimeout(() => sh.remove(), 1600);
    }
  };

  const glassFracture = (x, y, size, seed, strength, dark = false) => {
    const random = seeded(seed);
    const point = (x, y) => `${x.toFixed(2)} ${y.toFixed(2)}`;
    const spokes = 5 + Math.floor(random() * 3);
    const joints = [];
    let roots = '', tips = '';
    for (let i = 0; i < spokes; i++) {
      const angle = (i + random() * .68) * Math.PI * 2 / spokes;
      const reach = size * (.45 + random() * .75);
      const dx = Math.cos(angle), dy = Math.sin(angle);
      const joint = [x + dx * reach * .35, y + dy * reach * .35];
      const bend = (random() - .5) * reach * .27;
      const middle = [x + dx * reach * .68 - dy * bend, y + dy * reach * .68 + dx * bend];
      joints.push(joint);
      roots += `M${point(x, y)}L${point(...joint)}L${point(...middle)}`;
      tips += `M${point(...middle)}l${point(dx * reach * .32, dy * reach * .32)}`;
      if (random() < .65) {
        const fork = angle + (i % 2 ? .62 : -.62);
        tips += `M${point(...joint)}l${point(Math.cos(fork) * reach * .4, Math.sin(fork) * reach * .4)}`;
      }
    }
    if (strength > 1) {
      joints.forEach(([jx, jy], index) => {
        if (random() < .38) return;
        const [nx, ny] = joints[(index + 1) % spokes];
        tips += `M${point(jx, jy)}L${point((jx + nx) * .46 + x * .08, (jy + ny) * .46 + y * .08)}L${point(nx, ny)}`;
      });
    }
    return `<g class="tw-fracture${dark ? ' tw-fracture-dark' : ''}" opacity="${.58 + .13 * strength}">
      <path class="tw-fracture-rim" d="${roots}" transform="translate(.18 .23)"/>
      <path class="tw-fracture-root" d="${roots}"/>
      <path class="tw-fracture-tip" d="${tips}"/>
      <circle cx="${x}" cy="${y}" r="${.35 + strength * .15}"/>
    </g>`;
  };
  const rectPane = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  const circlePane = (x, y, r) => Array.from({ length: 24 }, (_, i) => {
    const angle = i * Math.PI / 12;
    return [x + r * Math.cos(angle), y + r * Math.sin(angle)];
  });
  const glassPoints = (poly) => poly.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  // Nearby strikes deepen an existing impact instead of stacking identical
  // spiderwebs. Keep the first impact as its anchor so growth stays coherent.
  const impactGroups = (points, radius) => {
    const groups = [];
    for (const [x, y] of points) {
      const hit = groups.find(p => Math.hypot(p.x - x, p.y - y) < radius);
      if (hit) hit.count++;
      else groups.push({ x, y, count: 1 });
    }
    return groups;
  };
  const paneScale = (poly) => {
    const xs = poly.map(([x]) => x), ys = poly.map(([, y]) => y);
    return clamp(Math.min(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)), 3, 40);
  };
  const paneFractures = (points, scale, dark = false) => {
    const level = Math.min(3, Math.ceil(points.length / 2));
    return impactGroups(points, clamp(scale * .23, 1.4, 7)).map(({ x, y, count }, i) => {
      const size = scale * clamp(.18 + count * .18 + points.length * .045, .32, 1.24);
      return glassFracture(x, y, size, x * 3 + y * 5 + i, level, dark);
    }).join('');
  };
  // A cluster opens a hole at its anchor. The surrounding wedges share
  // the same serrated edge and can detach one at a time.
  const fracturePieces = (poly, center, scale) => {
    const random = seeded(center[0] * 11 + center[1] * 7);
    const reach = Math.max(...poly.map(([x, y]) => Math.hypot(x - center[0], y - center[1]))) * 2.5;
    const radius = scale * .39;
    const offset = random() * Math.PI * 2, count = 10;
    const polar = (a, r) => [center[0] + Math.cos(a) * r, center[1] + Math.sin(a) * r];
    const tornEdge = (angle) => {
      const shape = 1 + .28 * Math.cos(angle - offset) + .19 * Math.sin(angle * 3 + offset);
      return polar(angle, radius * shape * (.85 + random() * .30));
    };
    const edges = Array.from({ length: count }, (_, i) => {
      const angle = offset + Math.PI * 2 * (i + random() * .32) / count;
      return { angle, inner: tornEdge(angle), outer: polar(angle, reach) };
    });
    const chunks = edges.map((edge, i) => {
      const next = edges[(i + 1) % count];
      const end = i === count - 1 ? next.angle + Math.PI * 2 : next.angle;
      const inner = [edge.inner, ...[.12, .24, .36, .48, .61, .74, .86].map(t => tornEdge(edge.angle + (end - edge.angle) * t)), next.inner];
      return { inner, poly: [...inner, next.outer, edge.outer], gone: false };
    });
    return { chunks, opening: chunks.flatMap(chunk => chunk.inner.slice(0, -1)) };
  };
  const paintBreak = (pane) => {
    const polygons = [pane.opening, ...pane.chunks.filter(chunk => chunk.gone).map(chunk => chunk.poly)];
    if (pane.holes) {
      pane.cutout ??= NSel('g', { 'clip-path': `url(#${pane.id})`, class: 'tw-pane-cutout' });
      if (!pane.cutout.parentNode) pane.holes.append(pane.cutout);
      pane.cutout.replaceChildren(...polygons.map(poly => NSel('polygon', { points: glassPoints(poly), fill: '#000' })));
    }
    const hole = pane.holes ? '' : polygons.map(poly => `<polygon class="tw-pane-opening" points="${glassPoints(poly)}"/>`).join('');
    pane.marks.innerHTML = hole + pane.chunks.filter(chunk => !chunk.gone).map(chunk => `
      <g class="tw-glass-chunk">
        <polygon points="${glassPoints(chunk.poly)}"/>
        <polygon points="${glassPoints(chunk.poly)}" fill="url(#twGlassGrain)"/>
        <polyline points="${glassPoints(chunk.inner)}"/>
      </g>`).join('');
  };
  let paneDamage = new WeakMap(), nextPane = 0, paneHits = 0;
  const strikePane = (root, key, poly, q, options = {}) => {
    const { dark = false, threshold = 4, holes = null, debris = root, ground = Math.max(...poly.map(([, y]) => y)) + 12 } = options;
    let panes = paneDamage.get(root);
    if (!panes) { panes = new Map(); paneDamage.set(root, panes); }
    let pane = panes.get(key);
    if (!pane) {
      const id = `twImpactPane-${++nextPane}`;
      const layer = NSel('g', { class: 'tw-pane-damage tw-nohit', 'aria-hidden': 'true' });
      const clip = NSel('clipPath', { id });
      clip.append(NSel('polygon', { points: glassPoints(poly) }));
      const marks = NSel('g', { 'clip-path': `url(#${id})` });
      layer.append(clip, marks);
      root.append(layer);
      pane = { id, marks, points: [], scale: paneScale(poly), holes };
      panes.set(key, pane);
    }
    if (pane.chunks) {
      const chunk = pane.chunks.find(piece => inPoly(q.x, q.y, piece.poly));
      if (!chunk || chunk.gone) return 'hole';
      chunk.gone = true;
      paintBreak(pane);
      fallShards(debris, rectPane(q.x - 1.9, q.y - 1, 3.8, 2), ground);
      return 'chunk';
    }

    pane.points.push([q.x, q.y]);
    if (pane.points.length > 64) pane.points.shift();
    const radius = clamp(pane.scale * .23, 1.4, 7);
    const impact = impactGroups(pane.points, radius).find(group => threshold && group.count >= threshold);
    paneHits++;
    if (impact) {
      Object.assign(pane, fracturePieces(poly, [impact.x, impact.y], pane.scale));
      paintBreak(pane);
      fallShards(debris, rectPane(impact.x - 2.8, impact.y - 1, 5.6, 2), ground);
      return 'break';
    }
    pane.marks.innerHTML = paneFractures(pane.points.slice(-30), pane.scale, dark);
    return 'crack';
  };
  const spritePanes = (image, regions, sourceWidth = 1, sourceHeight = 1) => {
    const x = +image.getAttribute('x'), y = +image.getAttribute('y');
    const sx = +image.getAttribute('width') / sourceWidth, sy = +image.getAttribute('height') / sourceHeight;
    return regions.map(poly => poly.map(([px, py]) => [x + px * sx, y + py * sy]));
  };
  const shapePane = (shape) => {
    if (shape.dataset.pane) return shape.dataset.pane.split(' ').map(pair => pair.split(',').map(Number));
    if (shape.localName === 'circle') return circlePane(shape.cx.baseVal.value, shape.cy.baseVal.value, shape.r.baseVal.value);
    const [x, y, w, h, rx] = ['x', 'y', 'width', 'height', 'rx'].map(name => +shape.getAttribute(name));
    if (!rx) return rectPane(x, y, w, h);
    const r = Math.min(rx, w / 2, h / 2);
    return [[x + w - r, y + r], [x + w - r, y + h - r], [x + r, y + h - r], [x + r, y + r]].flatMap(([cx, cy], corner) =>
      Array.from({ length: 5 }, (_, i) => {
        const angle = (corner - 1 + i / 4) * Math.PI / 2;
        return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
      })
    );
  };
  const cutPane = (poly, axis, edge, sign) => poly.flatMap((point, i) => {
    const prev = poly[(i + poly.length - 1) % poly.length];
    const inside = sign * (point[axis] - edge) >= 0;
    const prevInside = sign * (prev[axis] - edge) >= 0;
    if (inside === prevInside) return inside ? [point] : [];
    const t = (edge - prev[axis]) / (point[axis] - prev[axis]);
    const crossing = prev.map((v, j) => v + (point[j] - v) * t);
    return inside ? [crossing, point] : [crossing];
  });
  const glassAt = (hot, e) => {
    const shapes = $$('[data-fracture-pane]', hot).reverse();
    for (const [index, shape] of shapes.entries()) {
      const q = localPt(shape, e);
      let poly = shapePane(shape), key = String(index);
      if (!inPoly(q.x, q.y, poly)) continue;
      if (shape.dataset.paneGrid) {
        for (const [axis, list] of shape.dataset.paneGrid.split(';').entries()) {
          const value = axis === 0 ? q.x : q.y;
          for (const edge of list.split(',').filter(Boolean).map(Number)) {
            const sign = value >= edge ? 1 : -1;
            key += sign === 1 ? '+' : '-';
            poly = cutPane(poly, axis, edge + sign * .65, sign);
          }
        }
        if (!inPoly(q.x, q.y, poly)) return null;
      }
      return { shape, key, poly, q };
    }
    return null;
  };
  // The Civic
  const civHot = hotOf('p-civic'), civG = $('.tw-civ-dmg', civHot), winG = $$('.tw-civ-win', civHot), dentG = $('.tw-civ-dents', civHot), bumpF = $('.tw-bump-f', civHot), bumpR = $('.tw-bump-r', civHot);
  const drawCivic = () => {
    const c = dmg.civ;
    dentG.innerHTML = c.dents.map(([x, y], k) => `<path d="M${(x - 1.6).toFixed(2)} ${(y + 0.4).toFixed(2)} q1.6 -1.6 3.2 0" class="tw-dent"/><path d="M${(x - 1).toFixed(2)} ${(y + 1.2).toFixed(2)} l2 -.2" class="tw-scuff" style="--k:${k}"/>`).join('');
    bumpF.classList.toggle('off', !!c.fb);
    bumpR.classList.toggle('off', !!c.rb);
  };
  const pokeCivic = (e) => {
    const q = localPt(civG, e), c = dmg.civ;
    const inB = (b) => q.x >= b.x && q.x <= b.x + b.w && q.y >= b.y && q.y <= b.y + b.h;
    if (!c.fb && inB(D.civic.fb)) c.fb = 1;
    else if (!c.rb && inB(D.civic.rb)) c.rb = 1;
    else {
      const i = D.civic.wins.findIndex((w) => inPoly(q.x, q.y, w));
      if (i >= 0) {
        strikePane(winG[i], i, D.civic.wins[i], q, { dark: true, threshold: 3, debris: civG, ground: D.civic.ground });
      } else if (c.dents.length < 14) c.dents.push([+q.x.toFixed(2), +q.y.toFixed(2)]);
      else return;
    }
    drawCivic(); save(); refresh('p-civic');
  };

  // The MacBook
  const macCr = $('.tw-mac-fractures', svg);
  const pokeMac = (e) => {
    if (dmg.mac >= 2) return;
    const q = localPt(macCr, e), pane = shapePane($('#twMacScr rect', svg));
    if (!inPoly(q.x, q.y, pane)) return;
    dmg.mac++;
    strikePane(macCr, 0, pane, q, { dark: true, threshold: 0 });
    drawMac(); save();
  };
  const drawMac = () => { tw.classList.toggle('mac-lcd', dmg.mac >= 1); tw.classList.toggle('mac-fire', dmg.mac >= 2); };

  // Only the opening in a broken display window exposes the car behind it.
  const toyHot = hotOf('toyota'), crG = $('.tw-cracks', toyHot), showcars = $$('.tw-showcar', toyHot);
  const showroomDoor = $('.tw-door-fractures', toyHot), showHoles = $('#twShowroomHoles', svg);
  const displayPanes = [
    rectPane(462, 342, 100, 140),
    [[658,356],[775,356],[775,387.5],[751,387.5],[751,482],[658,482]],
    [[775,356],[890,356],[890,482],[801,482],[801,387.5],[775,387.5]],
  ];
  const showroomDoors = [rectPane(760, 426, 15, 56), rectPane(777, 426, 15, 56)];
  let policeT = 0;
  const scare = (on) => { bots.rfa.scared = on; bots.rfa.el.classList.toggle('scared', on); };
  const drawShowroom = () => {
    tw.classList.toggle('glass-broke', !!dmg.toy);
    tw.classList.toggle('alarm', !!dmg.toy);
    scare(!!dmg.toy);
    showcars.forEach(g => {
      const on = !!dmg.cars[g.dataset.car];
      g.classList.toggle('hit', on);
      g.classList.toggle('alarm', on);
    });
  };
  const pokeShowroom = (e) => {
    const q = localPt(crG, e);
    const door = showroomDoors.findIndex(poly => inPoly(q.x, q.y, poly));
    const bay = displayPanes.findIndex(poly => inPoly(q.x, q.y, poly));
    if (door < 0 && bay < 0) return;
    const result = door >= 0
      ? strikePane(showroomDoor, door, showroomDoors[door], q, { threshold: 4, holes: showHoles, debris: crG.parentNode, ground: 486 })
      : strikePane(crG, bay, displayPanes[bay], q, { threshold: 4, holes: showHoles, debris: crG.parentNode, ground: 486 });
    if (result === 'break' && !dmg.toy) {
      dmg.toy = 1;
      policeT = setTimeout(() => { dmg.police = 1; tw.classList.add('police'); }, 9000);
    }
    if (result === 'hole' && door < 0) {
      const car = showcars.find(g => inPoly(q.x, q.y, shapePane($('.tw-carimg', g))));
      if (car) {
        const root = $('.tw-car-fractures', car), poly = shapePane(root);
        if (inPoly(q.x, q.y, poly)) strikePane(root, 0, poly, q, { dark: true, ground: 475 });
        dmg.cars[car.dataset.car] = 1;
      }
    }
    drawShowroom(); save();
  };

  // The cars on the truck: each one hit sets off its own alarm.
  // (where each sits on the picture, and its headlights and taillights)
  const TCARS = [
    [0.178, 0.377, 0.006, 0.305], [0.381, 0.599, 0.019, 0.305], [0.601, 0.787, 0.057, 0.305], [0.793, 0.981, 0.019, 0.305],
    [0.184, 0.37, 0.406, 0.724], [0.394, 0.57, 0.46, 0.724], [0.597, 0.773, 0.406, 0.724], [0.799, 0.979, 0.406, 0.724]
  ];
  const jmHot = hotOf('jm'), tcG = $('.tw-tcars', jmHot);
  const truckPanes = D.truck.glass.flatMap(({ car, panes }) =>
    spritePanes($('.tw-truckimg', jmHot), panes, 3944, 876).map((poly, i) => ({ car, key: `${car}:${i}`, poly }))
  );
  const pokeTruck = (e) => {
    const T = D.truck, q = localPt(tcG, e), fx = (q.x - T.x) / T.w, fy = (q.y - T.y) / T.h;
    const pane = truckPanes.find(({ poly }) => inPoly(q.x, q.y, poly));
    const i = pane ? pane.car : TCARS.findIndex(([a, b, c, d]) => fx >= a && fx <= b && fy >= c && fy <= d);
    if (pane) strikePane(tcG, pane.key, pane.poly, q, { dark: true, ground: T.y + T.h });
    if (i < 0) { if (pane) save(); else pokeAny('jm', e); return; }
    const n = dmg.tcars[i] || 0;
    if (n < 6) dmg.tcars[i] = n + 1;
    const [a, b, c, d] = TCARS[i];
    if (!pane && n < 6) add(tcG, nick(q.x, q.y, 0.75));
    if (n === 0) {
      const P = (u, v) => [(T.x + u * T.w).toFixed(1), (T.y + v * T.h).toFixed(1)];
      const hd = P(a + 0.012, c + (d - c) * 0.5), tl = P(b - 0.01, c + (d - c) * 0.4);
      add(tcG, `<g class="tw-tc-al"><g class="tw-tc-w"><circle cx="${hd[0]}" cy="${hd[1]}" r="12" fill="url(#twLedBulb)"/><circle cx="${hd[0]}" cy="${hd[1]}" r="1.6" class="tw-proj"/><polygon points="${hd[0]},${(+hd[1] - 2).toFixed(1)} ${hd[0]},${(+hd[1] + 2).toFixed(1)} ${(+hd[0] - 34).toFixed(1)},${(+hd[1] + 10).toFixed(1)} ${(+hd[0] - 34).toFixed(1)},${(+hd[1] - 6).toFixed(1)}" fill="url(#twLed)" opacity=".75"/></g><g class="tw-tc-a"><circle cx="${hd[0]}" cy="${hd[1]}" r="10" fill="url(#twHaz)"/><circle cx="${tl[0]}" cy="${tl[1]}" r="10" fill="url(#twHaz)"/><circle cx="${hd[0]}" cy="${hd[1]}" r="1.6" fill="#ffd27a"/><circle cx="${tl[0]}" cy="${tl[1]}" r="1.6" fill="#ffd27a"/></g><g class="tw-tc-r"><circle cx="${tl[0]}" cy="${tl[1]}" r="10" fill="url(#twTail)"/></g></g>`);
    }
    save();
  };

  // The HawkEye's screen
  const hkHot = hotOf('hunter'), hkG = $('.tw-hk-lcd', hkHot), hkCr = $('.tw-hk-cr', hkHot);
  const inkAt = (root, q, r) => add(root, `<circle cx="${q.x.toFixed(1)}" cy="${q.y.toFixed(1)}" r="${r.toFixed(2)}" class="tw-lcd-ink"/>`);
  const screenPane = (id) => shapePane($(`#${id} rect`, svg));
  const hkPane = screenPane('twHkScr');
  const pokeHunter = (e) => {
    const q = localPt(hkG, e);
    if (!inPoly(q.x, q.y, hkPane) || dmg.hk >= 4) return;
    dmg.hk++;
    inkAt(hkCr, q, .7 + dmg.hk * .25);
    strikePane(hkCr, 0, hkPane, q, { dark: true, threshold: 0 });
    hkHot.classList.add('lcd' + dmg.hk);
    save();
  };

  // BetAI: the living room window, then the TV behind it
  const betHot = hotOf('p-betai'), bwG = $('.tw-bwcr', betHot), tvCr = $('.tw-tvlcd-cr', betHot);
  const WIN = rectPane(3414, 404, 48, 36);
  const tvPane = screenPane('twTvScr');
  const betHoles = $('#twBetHoles', svg);
  const pokeBet = (e) => {
    const q = localPt(bwG, e);
    if (!inPoly(q.x, q.y, WIN)) return;
    const left = q.x < 3438, x = left ? 3414 : 3438;
    const result = strikePane(bwG, +left, rectPane(x, 404, 24, 36), q, { threshold: 6, holes: betHoles, ground: 486 });
    if (result === 'break') houseAlarm();
    if (result === 'hole' && dmg.tv < 4 && inPoly(q.x, q.y, tvPane)) {
      dmg.tv++;
      inkAt(tvCr, q, .6 + dmg.tv * .25);
      strikePane(tvCr, 0, tvPane, q, { dark: true, threshold: 0 });
      betHot.classList.add('tv' + dmg.tv);
    }
    save();
  };

  // The house: its windows give way after a few hits, the door after a few
  // more; either sets off its alarm (the ADT sign, then the police).
  const HOME_STOPS = new Set(['p-betai', 'p-avl', 'p-gatorgoods', 'p-sommiscript']);
  const hwins = $$('.tw-hwin', svg), hdoor = $('.tw-hdoor', svg);
  let homeT = 0;
  function houseAlarm() {
    if (dmg.home) return;
    dmg.home = 1;
    tw.classList.add('home-alarm');
    clearTimeout(homeT);
    homeT = setTimeout(() => tw.classList.add('police-home'), 6000);
  }
  const doorGlass = (side) => {
    const halfArc = Array.from({ length: 13 }, (_, i) => {
      const angle = -Math.PI / 2 + side * i * Math.PI / 24;
      return [3509 + 9 * Math.cos(angle), 445 + 9 * Math.sin(angle)];
    });
    return [...halfArc, [3509 + 9 * side, 447], [3509, 447]];
  };
  const doorPanes = [doorGlass(-1), doorGlass(1)];
  const pokeHouse = (el, e) => {
    const g = $('.tw-hcr', el), q = localPt(g, e);
    if (el === hdoor) {
      const i = doorPanes.findIndex(poly => inPoly(q.x, q.y, poly));
      if (i >= 0) {
        if (strikePane(g, i, doorPanes[i], q, { ground: 486 }) === 'break') houseAlarm();
      } else if (dmg.hdoor < 8) {
        dmg.hdoor++;
        if (dmg.hdoor === 8) { el.classList.add('open'); houseAlarm(); }
        else add(g, nick(q.x, q.y, .7 + dmg.hdoor * .06));
      }
    } else {
      const full = shapePane($('.tw-homewin', el));
      if (!inPoly(q.x, q.y, full)) return;
      const glass = $('.tw-homewin', el);
      const crossX = +glass.getAttribute('x') + 12, crossY = +glass.getAttribute('y') + 14;
      const col = +(q.x >= crossX), row = +(q.y >= crossY);
      const vertical = col ? 1 : -1, horizontal = row ? 1 : -1;
      const pane = cutPane(cutPane(full, 0, crossX + vertical * .55, vertical), 1, crossY + horizontal * .55, horizontal);
      if (!inPoly(q.x, q.y, pane)) return;
      const result = strikePane(g, row * 2 + col, pane, q, { threshold: 6, ground: 486 });
      if (result === 'break') houseAlarm();
    }
    save();
  };
  [...hwins, hdoor].forEach((el) => el && el.addEventListener('click', (e) => {
    if (dragged || keepsake || (cur && !HOME_STOPS.has(cur))) return;
    e.stopPropagation();
    pokeHouse(el, e);
  }));
  const attic = $('.tw-attic-glass', svg);
  attic.addEventListener('click', (e) => {
    if (dragged || keepsake || (cur && !HOME_STOPS.has(cur))) return;
    e.stopPropagation();
    strikePane(attic.parentNode, 'attic', shapePane(attic), localPt(attic, e));
    save();
  });

  // Malachowsky Hall: each window cracks, then gives way (the glass gone,
  // the rooms behind it plain to see).
  const hallCr = $('.tw-hall-cr', svg), hallHoles = $('.tw-hall-holes', svg);
  const pokeHall = (e) => {
    const q = localPt(hallCr, e), i = D.hall.polys.findIndex((p) => inPoly(q.x, q.y, p));
    if (i < 0) { pokeAny('edu', e); return; }
    const result = strikePane(hallCr, i, D.hall.polys[i], q, { threshold: 3, holes: hallHoles, ground: D.hall.ground });
    if (result === 'break') $('.tw-hall-gl', svg).setAttribute('mask', 'url(#twHallMask)');
    save();
  };

  /* Everything else: glass and screens crack; the rest takes nicks. Marks
     land where it was hit; things that move carry their marks along. */
  const BODY = { rjax: '.tw-frc-flip', rfa: '.tw-rover-shiver' };
  const boxes = {};
  const dmgRoot = (h) => { let g = h.querySelector(':scope > .tw-dmg'); if (!g) { g = NSel('g', { class: 'tw-dmg tw-nohit' }); h.appendChild(g); } return g; };
  const dmgIn = (h, id) => { const b = BODY[id] && $(BODY[id], h); if (!b) return dmgRoot(h); let g = b.querySelector(':scope > .tw-dmg'); if (!g) { g = NSel('g', { class: 'tw-dmg tw-nohit' }); b.appendChild(g); } return g; };
  const pokeAny = (id, e) => {
    const h = hotOf(id); if (!h) return;
    // the welcome sign is solid wood: nothing to crack
    if (e.target.closest && e.target.closest('.tw-woodsign')) return;
    // bushes and trees don't dent: clicking one just steps back out
    if (e.target.closest && e.target.closest('.tw-leaf, .tw-leaf2, .tw-canopy')) { close(); return; }
    const glass = glassAt(h, e);
    if (glass) {
      const { shape, key, poly, q } = glass;
      const layer = shape.dataset.fractureLayer;
      const root = layer ? $(`[data-glass-layer="${layer}"]`, shape.parentNode) : shape.parentNode;
      strikePane(root, key, poly, q, { dark: shape.dataset.fracturePane === 'dark', threshold: shape.dataset.fracturePane === 'dark' ? 0 : 4 });
      save();
      return;
    }
    const n = (hits[id] || 0) + 1;
    if (n > 6) return;
    hits[id] = n;
    const marks = dmgIn(h, id);
    if (!boxes[id]) { const b = h.getBBox(); boxes[id] = { x: b.x, y: b.y, w: b.width, h: b.height }; }
    const B = boxes[id], s = clamp(Math.sqrt(B.w * B.h) / 70, 0.35, 2), q = localPt(marks, e), big = 1 + (n - 1) * 0.14;
    add(marks, nick(q.x, q.y, s * big));
    refresh(id); save();
  };

  // The hard drive: a tap leaves a spot and sets the platter spinning; press
  // and hold and the head scores a ring all the way round as it spins.
  const hddRot = $('.tw-hdd-rot', svg), hddRings = $('.tw-hdd-rings', svg);
  let hddHold = 0, hddRing = null, hddHeld = false;
  const pokeDrive = (e) => {
    if (hddHeld) { hddHeld = false; return; }
    const n = hits['p-drive'] || 0;
    if (n >= 3) { pokeAny('p-drive', e); return; }
    hits['p-drive'] = n + 1;
    hddRot.classList.add('spin');
    const [cx, cy, R] = hddRot.dataset.c.split(',').map(Number), a = n * 2.1 + 0.8, d = R * (0.35 + n * 0.17);
    add(hddRings, `<circle cx="${(cx + Math.cos(a) * d).toFixed(2)}" cy="${(cy + Math.sin(a) * d).toFixed(2)}" r="${(0.4 + n * 0.12).toFixed(2)}" class="tw-hdd-spot"/>`);
    save(); refresh('p-drive');
  };
  if (hddRot) {
    const dh = hotOf('p-drive');
    dh.addEventListener('pointerdown', (e) => {
      if (cur !== 'p-drive' || e.button !== 0) return;
      clearTimeout(hddHold);
      hddHold = setTimeout(() => {
        const [cx, cy, R] = hddRot.dataset.c.split(',').map(Number), q = localPt(hddRot.parentNode, e);
        const rr = clamp(Math.hypot(q.x - cx, q.y - cy), R * 0.22, R * 0.96), C = 2 * Math.PI * rr;
        hddRot.classList.add('spin', 'fast');
        hddRing = NSel('circle', { cx, cy, r: rr.toFixed(2), class: 'tw-hdd-scratch', 'stroke-dasharray': C.toFixed(2), 'stroke-dashoffset': C.toFixed(2) });
        hddRings.appendChild(hddRing);
        hddHeld = true;
        const ring = hddRing, t0 = performance.now();
        const draw = (t) => { if (ring !== hddRing) return; const u = Math.min(1, (t - t0) / 1300); ring.setAttribute('stroke-dashoffset', (C * (1 - u)).toFixed(2)); if (u < 1) requestAnimationFrame(draw); };
        requestAnimationFrame(draw);
        hits['p-drive'] = Math.max(1, hits['p-drive'] || 0); save();
      }, 260);
    });
    const up = () => {
      clearTimeout(hddHold);
      if (hddRing) { hddRing = null; hddRot.classList.remove('fast'); refresh('p-drive'); }
    };
    addEventListener('pointerup', up); addEventListener('pointercancel', up);
  }

  function poke(id, e) {
    if (cur === 'adt' || id === 'adt' || keepsake) return;
    if (id === 'p-civic') pokeCivic(e);
    else if (id === 'p-macbook') pokeMac(e);
    else if (id === 'toyota') pokeShowroom(e);
    else if (id === 'p-drive') pokeDrive(e);
    else if (id === 'jm') pokeTruck(e);
    else if (id === 'hunter') pokeHunter(e);
    else if (id === 'p-betai') pokeBet(e);
    else if (id === 'edu') pokeHall(e);
    else pokeAny(id, e);
  }
  function repair() {
    dmg = fresh();
    paneDamage = new WeakMap(); paneHits = 0;
    $$('.tw-pane-damage, .tw-fallshard', svg).forEach(layer => layer.remove());
    Object.keys(hits).forEach((k) => delete hits[k]);
    $$('.tw-dmg', svg).forEach((g) => g.remove());
    [tcG, hkCr, bwG, tvCr, hallCr, hallHoles, crG, showroomDoor, showHoles, betHoles].forEach((g) => { if (g) g.innerHTML = ''; });
    $('.tw-hall-gl', svg).removeAttribute('mask'); tw.classList.remove('hall-holed');
    $$('.tw-hcr', svg).forEach((g) => { g.innerHTML = ''; });
    hwins.forEach((w) => w.classList.remove('broke'));
    if (hdoor) hdoor.classList.remove('open');
    hkHot.classList.remove('lcd1', 'lcd2', 'lcd3', 'lcd4');
    betHot.classList.remove('bw-broke', 'tv1', 'tv2', 'tv3', 'tv4');
    Object.values(bots).forEach((b) => { b.dead = false; });
    if (hddRings) { hddRings.innerHTML = ''; hddRot.classList.remove('spin', 'fast'); }
    clearTimeout(policeT); clearTimeout(homeT);
    tw.classList.remove('glass-broke', 'alarm', 'police', 'shatter', 'home-alarm', 'police-home');
    drawCivic(); drawMac(); drawShowroom(); save();
    Object.keys(halos).forEach(refresh);
  }
  drawCivic(); drawMac(); drawShowroom();
  // Damage used to be kept between visits; it isn't any more.
  try { localStorage.removeItem('sommiville-damage'); } catch (e) {}
  if (fixItem) fixItem.hidden = true;

  tw._bots = bots;
  tw._weather = setWeather;
  tw._poke = (id, e) => poke(id, e);
})();
