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

  const tw = document.getElementById('town');
  if (!tw) return;
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
    rfa: { el: $('.tw-rover', svg), flip: $('.tw-rover-flip', svg), pin: $('.tw-pin[data-id="rfa"]', svg), x: 1850, y: 556, vx: 0, vy: 0, tx: 1850, ty: 556, face: -1, idleAt: 0, box: [1712, 1872, 536, 566], reach: 110, keep: 50, pinDy: -78, k: 5, max: 70, s: 1, tilt: 0 },
    rjax: { el: $('.tw-frc', svg), flip: $('.tw-frc-flip', svg), pin: $('.tw-pin[data-id="rjax"]', svg), x: 632, y: 582, vx: 0, vy: 0, tx: 632, ty: 582, face: 1, idleAt: 0, box: [590, 676, 574, 588], reach: 140, keep: 64, pinDy: -40, k: 3, max: 45, s: 0.78, tilt: 0 }
  };
  const placeBot = (b) => {
    b.el.setAttribute('transform', `translate(${b.x.toFixed(1)} ${b.y.toFixed(1)})`);
    b.flip.setAttribute('transform', `scale(${(b.face * b.s).toFixed(3)} ${b.s}) rotate(${b.tilt.toFixed(1)})`);
    b.pin.setAttribute('transform', `translate(${b.x.toFixed(1)} ${(b.y + b.pinDy).toFixed(1)})`);
  };
  Object.values(bots).forEach(placeBot);
  // The competition robot's camera: on its target, or on the pointer when close.
  const turret = $('.tw-turret', svg), vision = $('.tw-vision', svg), reticle = $('.tw-reticle', svg);
  const TARGET = [714, 535];
  let aim = TARGET.slice();
  const aimCam = () => {
    const b = bots.rjax, cx = b.x + 13 * b.s * b.face, cy = b.y - 28 * b.s;
    let a = Math.atan2(aim[1] - cy, (aim[0] - cx) * b.face) * 180 / Math.PI;
    a = clamp(a, -55, 55);
    turret.setAttribute('transform', `translate(13 -28) rotate(${a.toFixed(1)})`);
    const ex = cx + 7 * b.s * b.face * Math.cos(a * Math.PI / 180), ey = cy + 7 * b.s * Math.sin(a * Math.PI / 180);
    vision.setAttribute('d', `M${ex.toFixed(1)} ${ey.toFixed(1)} L${aim[0].toFixed(1)} ${aim[1].toFixed(1)}`);
    reticle.setAttribute('transform', `translate(${aim[0].toFixed(1)} ${aim[1].toFixed(1)})`);
  };
  aimCam();
  // Its beam and its targeting box drift, slowly, toward the colour of
  // whatever the pointer is over: a lighter shade of it, so they still show.
  const RJ0 = [31, 209, 42], rjc = RJ0.slice();
  const rgbOf = (hex) => { const n = parseInt(hex.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  let rjSet = '';
  const tintBeam = (dt) => {
    const id = typeof over === 'string' ? over : null, t = id && D.roles[id] && id !== 'rjax' ? rgbOf(D.roles[id].tint).map((c) => c * 0.62 + 255 * 0.38) : RJ0;
    const k = Math.min(1, dt * 0.9);
    for (let i = 0; i < 3; i++) rjc[i] += (t[i] - rjc[i]) * k;
    const c = `rgb(${rjc.map((v) => Math.round(v)).join(',')})`;
    if (c !== rjSet) { rjSet = c; vision.style.stroke = c; reticle.style.setProperty('--rj', c); }
  };

  /* ---------------------------------------------------------- Hunter's lift */
  // Up, a pause, down, a pause; the scissor arms follow the platform, and
  // the HawkEye's two red beacons keep their lasers on the wheel targets.
  const plat = $('.tw-plat', svg), armA = $('.tw-arm-a', svg), armB = $('.tw-arm-b', svg), pivot = $('.tw-pivot', svg), lasers = $$('.tw-laser', svg);
  const BEACONS = [[916 + 75.4 * 0.0745, 370 + 112 * 0.2057], [916 + 75.4 * 0.923, 370 + 112 * 0.2057]], WHEELS = [1020, 1093];
  const lift = (now) => {
    const t = (now / 1000) % 9, u = t < 3 ? t / 3 : t < 4.5 ? 1 : t < 7.5 ? 1 - (t - 4.5) / 3 : 0;
    const h = 22 * (0.5 - 0.5 * Math.cos(Math.PI * u)), top = 466 - h;
    plat.setAttribute('transform', `translate(0 ${(-h).toFixed(2)})`);
    armA.setAttribute('d', `M1110 474 L1004 ${top.toFixed(1)}`);
    armB.setAttribute('d', `M1004 474 L1110 ${top.toFixed(1)}`);
    pivot.setAttribute('cy', ((474 + top) / 2).toFixed(1));
    lasers.forEach((l, i) => {
      const [bx, by] = BEACONS[i], tx = WHEELS[i], ty = 442 - h;
      l.setAttribute('points', `${bx},${by - 1.6} ${bx},${by + 1.6} ${tx},${(ty + 2).toFixed(1)} ${tx},${(ty - 2).toFixed(1)}`);
    });
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
  const SKIP = { toyota: '.tw-alarmin, .tw-cracks, .tw-carlights, .tw-shards, .tw-glassedge, .tw-wscrack, .tw-adtsticker', 'p-macbook': '.tw-mac-fire', 'p-civic': '.tw-civ-hood, .tw-civ-bay, .tw-engbay, .tw-civ-dmg', 'p-lid': '.tw-lidflap', 'p-iron': '.tw-hot-tip', tm: '.tw-tm-swirl', hunter: '.tw-plat, .tw-arm-a, .tw-arm-b, .tw-pivot, .tw-laser', rjax: '.tw-frc, .tw-vision, .tw-reticle', rfa: '.tw-rover', fics: '.tw-dish', adt: '.tw-cctv-head, .tw-adtbush, .tw-adt-alarm, .tw-adtsign-lit', jm: '.tw-hazards', edu: '.tw-gator, .tw-ripples, .tw-hall-n, .tw-night', shiva: '.tw-bars' };
  const halos = {};
  const stickers = $$('.tw-adtsticker', svg);
  const hotOf = (id) => hots.find((h) => h.dataset.id === id);
  let lit = null;
  const glow = (id) => {
    if (lit === id) return;
    if (lit) {
      if (halos[lit]) halos[lit].remove();
      const h = hotOf(lit); if (h) $$(LIVE[lit] || '.tw-none', h).forEach((n) => { n.style.filter = ''; });
    }
    if (lit === 'adt') stickers.forEach((n) => { n.style.filter = ''; });
    lit = id;
    if (id === 'adt') stickers.forEach((n) => { n.style.filter = 'url(#twGlow-adt)'; });
    const h = id && hotOf(id);
    if (!h) return;
    let g = halos[id];
    if (!g) {
      g = h.cloneNode(true);
      g.removeAttribute('data-id'); g.removeAttribute('style');
      g.setAttribute('class', 'tw-halo'); g.setAttribute('aria-hidden', 'true');
      g.setAttribute('filter', `url(#twHalo-${id})`);
      $$('.tw-hit, .tw-dmg' + (SKIP[id] ? ', ' + SKIP[id] : ''), g).forEach((n) => n.remove());
      halos[id] = g;
    }
    h.parentNode.insertBefore(g, h);
    $$(LIVE[id] || '.tw-none', h).forEach((n) => { n.style.filter = `url(#twGlow-${id})`; });
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
  const far = $('.tw-far', svg), panL = $('.tw-pan-l', tw), panR = $('.tw-pan-r', tw);
  // The sun and the moon hold their place on the screen and their size,
  // whether the street slides or leans in; only tilting up into the sky (the
  // opening) moves them, a little.
  const skyG = $('.tw-sky-fixed', svg), moonG = $('.tw-moon', svg), sunG = $('.tw-sun', svg), shoot = $('.tw-shooting', svg);
  let skyOff = 0;
  const placeSky = (b) => {
    const k = b[2] / vw;
    if (Math.abs(k - 1) < 0.003) skyOff = b[1] - (BOTTOM - vh);
    skyG.setAttribute('transform', `translate(${b[0].toFixed(2)} ${b[1].toFixed(2)}) scale(${k.toFixed(4)})`);
    const my = Math.max(60, vh * 0.15) - skyOff * 0.22;
    moonG.setAttribute('transform', `translate(${(vw * 0.8).toFixed(1)} ${my.toFixed(1)})`);
    sunG.setAttribute('transform', `translate(${(vw * 0.8).toFixed(1)} ${(my + 6).toFixed(1)})`);
  };
  const setVB = (b) => {
    vb = b; svg.setAttribute('viewBox', b.map((n) => n.toFixed(2)).join(' '));
    far.setAttribute('transform', `translate(${(b[0] * 0.6).toFixed(2)} ${((b[1] - (BOTTOM - vh)) * 0.4).toFixed(2)})`);
    placeSky(b);
    // the truck backs in once its waiting spot is well in view
    if (!arrived && camX < D.truck.right - vw * 0.15) arrive();
    panL.classList.toggle('on', !cur && camX > 4);
    panR.classList.toggle('on', !cur && camX < WORLD - vw - 4);
  };
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const tween = (to, ms = 850, fn = ease) => {
    cancelAnimationFrame(anim);
    if (reduced) { setVB(to); return; }
    // While the scene moves the glow steps aside (redrawing it at every
    // step of the zoom is the expensive part) and comes back when it lands.
    const from = vb.slice(), t0 = performance.now();
    svg.classList.add('tw-moving');
    const f = (t) => { const u = clamp((t - t0) / ms, 0, 1), k = fn(u); setVB(from.map((v, i) => v + (to[i] - v) * k)); if (u < 1) anim = requestAnimationFrame(f); else svg.classList.remove('tw-moving'); };
    anim = requestAnimationFrame(f);
  };
  const frame = (z, left) => {
    const [x, y, w, h] = z, cx = x + w / 2, cy = y + h / 2;
    const free = 1 - (panel.offsetWidth + 28) / stage.clientWidth, A = vh / vw;
    let fw = w / (free * 0.88), fh = fw * A;
    if (fh < h * 1.25) { fh = h * 1.25; fw = fh / A; }
    fw = Math.min(fw, vw); fh = fw * A;
    const fx = left ? cx - fw * (1 - free / 2) : cx - fw * (free / 2);
    return [fx, clamp(cy - fh / 2, BOTTOM - vh, BOTTOM - fh), fw, fh];
  };
  // Sliding along the street: the wheel (either direction), dragging, the
  // arrow keys and the two edge buttons.
  let glide = 0;
  const panTo = (x, ms = 600) => {
    cancelAnimationFrame(glide);
    const to = clamp(x, 0, Math.max(0, WORLD - vw));
    if (reduced || ms === 0) { camX = to; setVB(view()); return; }
    const from = camX, t0 = performance.now();
    const f = (t) => { const k = ease(clamp((t - t0) / ms, 0, 1)); camX = from + (to - from) * k; setVB(view()); if (k < 1) glide = requestAnimationFrame(f); };
    glide = requestAnimationFrame(f);
  };
  setVB(view());
  /* The opening: once the mark has flown up into the bar, the street starts
     up in the sky and slowly comes down to the visitor center. */
  // It eases in and out (smootherstep), so it starts and lands without a jolt,
  // and while it comes down the stars sparkle and one shoots across.
  let intro = false;
  const INTRO = 2700, RISE = 420;
  const smooth = (u) => u * u * u * (u * (u * 6 - 15) + 10);
  if (!reduced && document.documentElement.classList.contains('is-loading')) {
    intro = true;
    tw.classList.add('intro');
    setVB([camX, BOTTOM - vh - RISE, vw, vh]);
    const start = () => setTimeout(() => {
      if (!intro || cur) { tw.classList.remove('intro'); return; }
      tw.classList.add('shoot');
      tween(view(), INTRO, smooth);
      setTimeout(() => { intro = false; tw.classList.remove('intro'); hint(); }, INTRO + 150);
    }, 420);
    const mo = new MutationObserver(() => { if (!document.documentElement.classList.contains('is-loading')) { mo.disconnect(); start(); } });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  } else setTimeout(() => hint(), 900);
  if (shoot) shoot.setAttribute('transform', `translate(${(vw * 0.42).toFixed(1)} ${(vh * 0.16).toFixed(1)})`);

  /* ---------------------------------------------------------- how to get around */
  // Once the street has settled, a small card in the middle shows how to
  // move along it, with the gesture drawn out; it goes once you do.
  function hint() {
    try { if (sessionStorage.getItem('sommiville-hint')) return; sessionStorage.setItem('sommiville-hint', '1'); } catch (e) {}
    if (cur || !matchMedia('(min-width: 720px)').matches) return;
    const h = document.createElement('div');
    h.className = 'tw-hint';
    h.setAttribute('role', 'status');
    h.innerHTML = `<div class="tw-hint-pad" aria-hidden="true"><span class="tw-hint-dots"><i></i><i></i></span><span class="tw-hint-ar l"></span><span class="tw-hint-ar r"></span></div><p><b>Scroll sideways to look around</b><span>Swipe with two fingers on the trackpad, use the mouse wheel, or drag the street</span></p>`;
    stage.appendChild(h);
    const bye = () => { if (!h.isConnected || h.classList.contains('out')) return; h.classList.add('out'); setTimeout(() => h.remove(), 500); ['wheel', 'pointerdown', 'keydown'].forEach((t) => removeEventListener(t, bye, true)); };
    ['wheel', 'pointerdown', 'keydown'].forEach((t) => addEventListener(t, bye, true));
    setTimeout(bye, 7000);
  }

  /* ---------------------------------------------------------- the card */
  // Story first, then its photos, then the numbers, the connections and the tools.
  const logo = (L) => L[0] === L[1] ? `<img src="assets/logos/opt/${L[0]}.webp" alt="" />` : `<img class="lg-d" src="assets/logos/opt/${L[0]}.webp" alt="" /><img class="lg-l" src="assets/logos/opt/${L[1]}.webp" alt="" />`;
  const linksOf = (id) => D.links.filter((l) => l[0] === id || l[1] === id);
  const render = (r) => {
    const i = D.order.indexOf(r.id), p = D.roles[D.order[i - 1]], n = D.roles[D.order[i + 1]];
    panel.style.setProperty('--tint', r.tint);
    const links = linksOf(r.id);
    inner.innerHTML = `
      <div class="tw-p-top"><span class="tw-p-logo">${r.logo ? logo(r.logo) : r.gator ? `<img src="${r.gator}" alt="" style="max-height:42px" />` : ''}</span><span class="tw-p-yr">${yy(r)}</span></div>
      <h3>${esc(r.org)}</h3>
      <p class="tw-p-role">${esc(r.role)}</p>
      ${r.when || r.where ? `<p class="tw-p-when">${esc([r.when, r.where].filter(Boolean).join(' · '))}</p>` : ''}
      ${r.ph ? `<p class="tw-p-ph">PLACEHOLDER: ${esc(r.ph)}</p>` : ''}
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
  const lightbox = (src) => {
    const lb = document.createElement('div');
    lb.className = 'tw-lightbox';
    lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', 'Photo');
    lb.innerHTML = `<img src="${esc(src)}" alt="" /><button type="button" class="tw-lb-x" aria-label="Close photo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>`;
    lb.addEventListener('click', () => { lb.classList.add('out'); setTimeout(() => lb.remove(), 220); });
    document.body.appendChild(lb);
  };
  const open = (id) => {
    const r = D.roles[id];
    if (!r) return;
    if (r.special) { timeTravel(); return; }
    const wasOpen = !!cur;
    cur = id;
    const z = zoomOf(id), left = z[0] + z[2] / 2 > vb[0] + vb[2] / 2;
    cancelAnimationFrame(glide);
    // when the card closes, the street is left centred on this place
    camX = clamp(z[0] + z[2] / 2 - vw / 2, 0, Math.max(0, WORLD - vw));
    panel.classList.toggle('left', left);
    panel.hidden = false;
    render(r);
    requestAnimationFrame(() => { panel.classList.add('open'); tween(frame(z, left), wasOpen ? 750 : 900); });
    tw.classList.add('zoomed');
    // the Civic's hood swings up while its stop is open
    tw.classList.toggle('hood', id === 'p-civic');
    glow(null); glow(id);
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
    glow(null); over = null;
    chips.forEach((c) => c.classList.remove('on'));
  };

  // Clicking off the open place steps back out; clicking the place itself
  // again plays with it (see the damage, below).
  hots.forEach((h) => h.addEventListener('click', (e) => { e.stopPropagation(); if (dragged) return; if (cur === h.dataset.id) poke(h.dataset.id, e); else open(h.dataset.id); }));
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
  svg.addEventListener('click', () => { if (!dragged) close(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !cur) { const big = $('.tw-lightbox'); if (big) { big.remove(); return; } }
    if (!cur) {
      if (e.target.closest && e.target.closest('input, textarea')) return;
      if (e.key === 'ArrowRight') panTo(camX + vw * 0.4, 450);
      else if (e.key === 'ArrowLeft') panTo(camX - vw * 0.4, 450);
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
    if (!pin) return;
    const at = pin.getBoundingClientRect();
    label.style.setProperty('--tint', r.tint);
    label.innerHTML = `<b>${yy(r)}</b>${esc(nameOf(r))}`;
    label.style.left = (at.left + at.width / 2 - s.left) + 'px';
    label.style.top = (at.top - s.top) + 'px';
    label.classList.add('on');
  };
  let over = null, offT = 0;
  const hoverTo = (id) => {
    if (cur) return;
    clearTimeout(offT);
    if (id) { if (id !== over) { over = id; glow(id); showLabel(id); } return; }
    if (!over) return;
    offT = setTimeout(() => { over = null; glow(null); hideLabel(); }, 160);
  };
  const idAt = (t) => { if (!t || !t.closest) return null; if (t.closest('.tw-adtsticker')) return 'adt'; const h = t.closest('.tw-hot'); return h ? h.dataset.id : null; };
  svg.addEventListener('pointerover', (e) => hoverTo(idAt(e.target)));
  svg.addEventListener('pointerout', (e) => hoverTo(idAt(e.relatedTarget)));

  /* ---------------------------------------------------------- the pointer */
  const head = $('.tw-cctv-head', svg), dish = $('.tw-dish', svg), eyes = $$('.tw-follow', svg);
  const toSVG = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
  let ptr = null;
  // A robot comes over when the pointer is near its patch, stops short of
  // it, and otherwise ambles about inside the patch.
  const steer = (b, dt, now) => {
    const [x0, x1, y0, y1] = b.box;
    const near = ptr && !cur && ptr.x > x0 - b.reach && ptr.x < x1 + b.reach && ptr.y > y0 - b.reach && ptr.y < y1 + b.reach;
    if (near) {
      const side = ptr.x >= b.x ? -1 : 1;
      b.tx = clamp(ptr.x + side * b.keep, x0, x1); b.ty = clamp(ptr.y, y0, y1);
    } else if (now > b.idleAt) { b.tx = x0 + Math.random() * (x1 - x0); b.ty = y0 + Math.random() * (y1 - y0); b.idleAt = now + 3500 + Math.random() * 4000; }
    const dx = b.tx - b.x, dy = b.ty - b.y, d = Math.hypot(dx, dy);
    const k = near ? b.k : b.k * 0.5, damp = 2 * Math.sqrt(k);
    b.vx += (dx * k - b.vx * damp) * dt; b.vy += (dy * k - b.vy * damp) * dt;
    const sp = Math.hypot(b.vx, b.vy), cap = near ? b.max : b.max * 0.45;
    if (sp > cap) { b.vx *= cap / sp; b.vy *= cap / sp; }
    b.x = clamp(b.x + b.vx * dt, x0, x1); b.y = clamp(b.y + b.vy * dt, y0, y1);
    b.tilt += (clamp(b.vx * 0.14, -9, 9) * b.face - b.tilt) * Math.min(1, dt * 6);
    // Face the pointer when it's close, otherwise the way it's going.
    if (near) b.face = ptr.x >= b.x ? 1 : -1; else if (Math.abs(b.vx) > 4) b.face = b.vx > 0 ? 1 : -1;
    b.el.classList.toggle('still', sp < 3);
    if (near && !b.near) { b.el.classList.remove('hop'); void b.el.getBoundingClientRect(); b.el.classList.add('hop'); }
    b.near = near;
    b.el.classList.toggle('wave', near && sp < 6 && d < 6);
    placeBot(b);
    return near;
  };
  let running = false, lastT = 0, visible = true;
  const loop = (now) => {
    if (!running) return;
    const dt = Math.min(0.05, (now - (lastT || now)) / 1000); lastT = now;
    if (dt > 0 && !cur) {
      if (!bots.rfa.dead) steer(bots.rfa, dt, now);
      const close = !bots.rjax.dead && steer(bots.rjax, dt, now) && Math.hypot(ptr.x - bots.rjax.x, ptr.y - bots.rjax.y) < 230;
      const want = close ? [ptr.x, ptr.y] : TARGET;
      aim = [aim[0] + (want[0] - aim[0]) * Math.min(1, dt * 2.5), aim[1] + (want[1] - aim[1]) * Math.min(1, dt * 2.5)];
      aimCam();
    }
    if (dt > 0) { lift(now); tintBeam(dt); }
    requestAnimationFrame(loop);
  };
  const go = () => { if (running || reduced || !visible) return; running = true; lastT = 0; requestAnimationFrame(loop); };
  go();

  let praf = 0, lastE = null;
  stage.addEventListener('pointermove', (e) => {
    lastE = e;
    if (praf) return;
    praf = requestAnimationFrame(() => {
      praf = 0;
      const e = lastE;
      const p = toSVG(e);
      ptr = { x: p.x, y: p.y };
      const sky = p.y < 330;
      tw.classList.toggle('sky', sky);
      tw.classList.toggle('near', !sky);
      if (sky && dish) {
        // The dish sits on HiPerGator's roof at (3014, 388); it turns its face to the pointer.
        const a = Math.atan2(p.x - 3014, 388 - p.y) * 180 / Math.PI;
        dish.style.transform = `translate(0px, -16px) rotate(${clamp(a, -70, 70).toFixed(1)}deg)`;
      } else if (dish) dish.style.transform = '';
      if (!sky && head) {
        // The camera is up at the roofline at (1268, 350), looking down over its
        // sign; it turns only as far as its mount allows.
        let a = Math.atan2(350 - p.y, 1268 - p.x) * 180 / Math.PI;
        if (a > 90) a -= 360;
        head.style.transform = `rotate(${clamp(a, -160, -30).toFixed(1)}deg)`;
      } else if (head) head.style.transform = '';
      eyes.forEach((el) => {
        const r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1;
        el.style.transform = `translate(${(dx / d * 2.4).toFixed(2)}px, ${(dy / d * 2.4).toFixed(2)}px)`;
      });
    });
  });
  stage.addEventListener('pointerleave', () => {
    ptr = null;
    tw.classList.remove('sky', 'near');
    if (head) head.style.transform = '';
    if (dish) dish.style.transform = '';
    eyes.forEach((el) => { el.style.transform = ''; });
    if (!cur) { clearTimeout(offT); over = null; glow(null); hideLabel(); }
  });

  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    svg.classList.toggle('tw-paused', !visible);
    if (visible) go(); else running = false;
  }).observe(stage);
  stage.addEventListener('wheel', (e) => {
    if (cur || e.ctrlKey || document.documentElement.classList.contains('is-loading')) return;
    const k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? vw * scale : 1;
    const d = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * k;
    if (!d) return;
    e.preventDefault();
    cancelAnimationFrame(glide);
    if (intro) { intro = false; cancelAnimationFrame(anim); svg.classList.remove('tw-moving'); }
    camX = clamp(camX + d / scale, 0, Math.max(0, WORLD - vw));
    setVB(view());
  }, { passive: false });
  let drag = null, dragged = false;
  svg.addEventListener('pointerdown', (e) => {
    dragged = false;
    if (cur || e.button !== 0 || e.pointerType === 'touch') return;
    drag = { x: e.clientX, cam: camX, id: e.pointerId };
  });
  addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    if (!dragged && Math.abs(dx) < 6) return;
    if (!dragged) { dragged = true; tw.classList.add('dragging'); cancelAnimationFrame(glide); if (intro) { intro = false; cancelAnimationFrame(anim); svg.classList.remove('tw-moving'); } }
    camX = clamp(drag.cam - dx / scale, 0, Math.max(0, WORLD - vw));
    setVB(view());
  });
  addEventListener('pointerup', () => { if (!drag) return; drag = null; tw.classList.remove('dragging'); setTimeout(() => { dragged = false; }, 0); });
  panL.addEventListener('click', () => panTo(camX - vw * 0.6));
  panR.addEventListener('click', () => panTo(camX + vw * 0.6));
  const themeB = $('.tw-theme', tw);
  if (themeB) themeB.addEventListener('click', () => { const b = document.getElementById('themeBtn'); if (b) b.click(); });

  if (reduced) { arrived = true; tw.classList.add('arrive', 'parked'); }
  addEventListener('resize', () => { measure(); if (cur) setVB(frame(zoomOf(cur), panel.classList.contains('left'))); else setVB(view()); });
  /* ---------------------------------------------------------- the compact bar */
  // Home (and the logo) slide back to the visitor center; the weather and
  // the menu open small lists under the bar.
  const goHome = () => { if (cur) { camX = homeX(); close(); } else panTo(homeX(), 1100); };
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
  if (exit) exit.addEventListener('click', (e) => { e.stopPropagation(); if (dragged) e.preventDefault(); });

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
  // over the street; what settles (snow on the roofs and the lawn, the
  // leaves turning) is done in town.css. In the snow the rover shivers, then
  // puts on its jacket and beanie.
  const wxc = $('.tw-wx', stage), rover = bots.rfa.el;
  let wx = 'clear', parts = [], wxRaf = 0, wxLast = 0, coldT = 0, wxCam = null, snowT = 0;
  const snowAmt = document.getElementById('twSnowAmt');
  const sizeWx = () => { const d = Math.min(2, devicePixelRatio || 1); wxc.width = stage.clientWidth * d; wxc.height = stage.clientHeight * d; wxc.getContext('2d').setTransform(d, 0, 0, d, 0, 0); };
  const spawn = (mode, any) => {
    const w = stage.clientWidth, h = stage.clientHeight, y = any ? Math.random() * h : -20;
    const z = 0.75 + Math.random() * 0.45;
    if (mode === 'snow') return { x: Math.random() * w, y, z, vx: 0, r: (1 + Math.random() * 2.4) * z, vy: (28 + Math.random() * 46) * z, ph: Math.random() * 6.3, sw: 10 + Math.random() * 22 };
    if (mode === 'rain') return { x: Math.random() * (w + 200), y, z, vx: 0, l: (10 + Math.random() * 12) * z, vy: (820 + Math.random() * 380) * z };
    return { x: Math.random() * w, y, z, vx: 0, r: 3.4 + Math.random() * 2.8, vy: 36 + Math.random() * 40, ph: Math.random() * 6.3, sw: 30 + Math.random() * 40, rot: Math.random() * 6.3, c: ['#e9952f', '#c2541c', '#d9b13b', '#a8401a'][(Math.random() * 4) | 0] };
  };
  const wxLoop = (t) => {
    const dt = Math.min(0.05, (t - (wxLast || t)) / 1000); wxLast = t;
    const c = wxc.getContext('2d'), w = stage.clientWidth, h = stage.clientHeight;
    c.clearRect(0, 0, w, h);
    const night = /midnight|terminal/.test(document.documentElement.dataset.theme || '');
    // how far the street moved since the last frame, on screen
    let dx = 0;
    if (wxCam && Math.abs(vb[2] - wxCam[1]) < 0.01) dx = (vb[0] - wxCam[0]) * (w / vb[2]);
    wxCam = [vb[0], vb[2]];
    const wake = dt > 0 ? clamp(dx / dt, -4000, 4000) : 0, decay = Math.exp(-dt * 2.2);
    parts.forEach((p, i) => {
      p.x -= dx * p.z;
      p.vx = p.vx * decay + wake * 0.26 * p.z * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt - Math.abs(p.vx) * dt * (wx === 'rain' ? 0.05 : 0.35);
      if (p.x < -40) p.x += w + 80; else if (p.x > w + 40) p.x -= w + 80;
      if (wx === 'snow') { p.ph += dt * 1.3; const x = p.x + Math.sin(p.ph) * p.sw; c.fillStyle = night ? 'rgba(235,240,255,.9)' : 'rgba(255,255,255,.95)'; c.beginPath(); c.arc(x, p.y, p.r, 0, 6.283); c.fill(); }
      else if (wx === 'rain') { p.x -= p.vy * 0.16 * dt; const sk = 0.16 - p.vx / p.vy; c.strokeStyle = night ? 'rgba(170,190,230,.45)' : 'rgba(90,120,160,.45)'; c.lineWidth = 1.3 * p.z; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x + p.l * sk, p.y - p.l); c.stroke(); }
      else { p.ph += dt * 1.6; p.rot += dt * 2; const x = p.x + Math.sin(p.ph) * p.sw; c.save(); c.translate(x, p.y); c.rotate(p.rot); c.fillStyle = p.c; c.beginPath(); c.ellipse(0, 0, p.r * 1.6, p.r * 0.8, 0, 0, 6.283); c.fill(); c.restore(); }
      if (p.y > h + 20) parts[i] = spawn(wx, false);
    });
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
    // snow settles on top of everything it can, a little more every few seconds
    clearInterval(snowT);
    if (snowAmt) {
      let v = 0; snowAmt.setAttribute('flood-opacity', '0');
      if (mode === 'snow' && !reduced) snowT = setInterval(() => { v = Math.min(1, v + 0.03); snowAmt.setAttribute('flood-opacity', v.toFixed(2)); if (v >= 1) clearInterval(snowT); }, 600);
      else if (mode === 'snow') snowAmt.setAttribute('flood-opacity', '1');
    }
    rover.classList.remove('cold', 'jacket');
    if (mode === 'snow') { rover.classList.add('cold'); coldT = setTimeout(() => rover.classList.add('jacket'), 3200); }
    sizeWx();
    const n = mode === 'snow' ? 190 : mode === 'rain' ? 260 : mode === 'fall' ? 34 : 0;
    parts = Array.from({ length: reduced ? Math.round(n / 4) : n }, () => spawn(mode, true));
    if (n) wxRaf = requestAnimationFrame(wxLoop); else wxc.getContext('2d').clearRect(0, 0, wxc.width, wxc.height);
    tw.classList.toggle('wx-on', !!n);
  };
  document.querySelectorAll('#twWxPop [data-wx]').forEach((b) => b.addEventListener('click', () => { setWeather(b.dataset.wx); shut(); }));
  addEventListener('resize', () => { if (wx !== 'clear') sizeWx(); });

  /* ---------------------------------------------------------- the damage */
  // Click a place again while you're looking at it and it takes the hit:
  // the Civic's windows crack (and give way) and its bumpers fall off; the
  // MacBook's screen breaks, then it catches fire; the showroom glass
  // cracks, spreads and comes down, which sets off the alarm (the lights
  // inside drop, a red glow and a white strobe come on, the ADT sign lights
  // up, the police come), and a car hit through the broken glass goes off
  // too. Everything else wears it step by step: a nick, then more, then
  // worse, then smoke, then fire, and at last it blows up and sets the
  // ground around it alight. A fresh visit always starts clean.
  const fresh = () => ({ civ: { cr: D.civic.wins.map(() => []), sh: D.civic.wins.map(() => 0), fb: 0, rb: 0, dents: [] }, mac: 0, toy: 0, pts: [], cars: {}, police: 0 });
  let dmg = fresh();
  const hits = {};
  const damaged = () => dmg.mac || dmg.toy || dmg.civ.fb || dmg.civ.rb || dmg.civ.dents.length || dmg.civ.cr.some((c) => c.length) || Object.keys(hits).length;
  const save = () => { if (fixItem) fixItem.hidden = !damaged(); };
  const localPt = (el, e) => { const q = svg.createSVGPoint(); q.x = e.clientX; q.y = e.clientY; return q.matrixTransform(el.getScreenCTM().inverse()); };
  const inPoly = (x, y, poly) => { let o = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) o = !o; } return o; };
  const seeded = (n) => { let v = Math.abs(Math.floor(n * 9301 + 49297)) % 2147483646 + 1; return () => (v = (v * 16807) % 2147483647) / 2147483647; };
  // A crack: rays out from where it was hit, each bending a little, and a
  // broken ring around the middle.
  const crack = (x, y, size, seed, cls = 'tw-crk') => {
    const r = seeded(seed), n = 6 + Math.floor(r() * 4), ends = [];
    let d = '';
    for (let i = 0; i < n; i++) {
      let a = (i / n) * Math.PI * 2 + r() * 0.6, px = x, py = y;
      const L = size * (0.55 + r() * 0.6), segs = 2 + Math.floor(r() * 2);
      d += `M${x.toFixed(2)} ${y.toFixed(2)}`;
      for (let k = 1; k <= segs; k++) { a += (r() - 0.5) * 0.7; px += Math.cos(a) * L / segs; py += Math.sin(a) * L / segs; d += ` L${px.toFixed(2)} ${py.toFixed(2)}`; if (k === 1) ends.push([px, py]); }
    }
    ends.forEach(([ex, ey], i) => { if (r() < 0.75) { const [nx, ny] = ends[(i + 1) % ends.length]; d += ` M${ex.toFixed(2)} ${ey.toFixed(2)} L${nx.toFixed(2)} ${ny.toFixed(2)}`; } });
    return `<path d="${d}" class="${cls}"/>`;
  };
  const NSel = (tag, attrs) => { const n = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); return n; };
  const refresh = (id) => { if (halos[id]) { halos[id].remove(); delete halos[id]; } if (lit === id) { lit = null; glow(id); } };

  // The Civic
  const civHot = hotOf('p-civic'), civG = $('.tw-civ-dmg', civHot), winG = $$('.tw-civ-win', civHot), dentG = $('.tw-civ-dents', civHot), bumpF = $('.tw-bump-f', civHot), bumpR = $('.tw-bump-r', civHot);
  const drawCivic = () => {
    const c = dmg.civ;
    winG.forEach((g, i) => {
      const w = D.civic.wins[i];
      g.innerHTML = (c.sh[i] ? `<polygon points="${w.map((q) => q.join(',')).join(' ')}" class="tw-civ-hole"/>` + w.map(([x, y], k) => crack(x, y, 2.4, x * 7 + k, 'tw-crk tw-crk-edge')).join('') : '') + c.cr[i].map(([x, y]) => crack(x, y, 5.5, x * 13 + y, c.sh[i] ? 'tw-crk tw-crk-edge' : 'tw-crk')).join('');
    });
    dentG.innerHTML = c.dents.map(([x, y], k) => `<path d="M${(x - 1.6).toFixed(2)} ${(y + 0.4).toFixed(2)} q1.6 -1.6 3.2 0" class="tw-dent"/><path d="M${(x - 1).toFixed(2)} ${(y + 1.2).toFixed(2)} l2 -.2" class="tw-scuff" style="--k:${k}"/>`).join('');
    bumpF.classList.toggle('off', !!c.fb);
    bumpR.classList.toggle('off', !!c.rb);
  };
  // glass falling out of a window that gives way
  const fallGlass = (poly) => {
    const xs = poly.map((q) => q[0]), ys = poly.map((q) => q[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y1 = Math.max(...ys);
    for (let i = 0; i < 9; i++) {
      const x = x0 + Math.random() * (x1 - x0), y = y1 - Math.random() * 6;
      const sh = NSel('path', { d: `M${x.toFixed(2)} ${y.toFixed(2)} l${(1 + Math.random() * 1.6).toFixed(2)} ${(-1 - Math.random()).toFixed(2)} l${(0.4 + Math.random()).toFixed(2)} ${(1.6 + Math.random()).toFixed(2)} z`, class: 'tw-fallshard', style: `--fx:${((Math.random() - 0.5) * 14).toFixed(1)}px;--fy:${(D.civic.ground - y + Math.random() * 3).toFixed(1)}px;--fr:${(Math.random() * 400 - 200).toFixed(0)}deg;animation-delay:${(Math.random() * 0.15).toFixed(2)}s` });
      civG.appendChild(sh);
      setTimeout(() => sh.remove(), 1600);
    }
  };
  const pokeCivic = (e) => {
    const q = localPt(civG, e), c = dmg.civ;
    const inB = (b) => q.x >= b.x && q.x <= b.x + b.w && q.y >= b.y && q.y <= b.y + b.h;
    if (!c.fb && inB(D.civic.fb)) c.fb = 1;
    else if (!c.rb && inB(D.civic.rb)) c.rb = 1;
    else {
      const i = D.civic.wins.findIndex((w) => inPoly(q.x, q.y, w));
      if (i >= 0) {
        if (c.sh[i]) return;
        c.cr[i].push([+q.x.toFixed(2), +q.y.toFixed(2)]);
        if (c.cr[i].length >= 3) { c.sh[i] = 1; fallGlass(D.civic.wins[i]); }
      } else if (c.dents.length < 14) c.dents.push([+q.x.toFixed(2), +q.y.toFixed(2)]);
      else return;
    }
    drawCivic(); save(); refresh('p-civic');
  };

  // The MacBook
  const drawMac = () => { tw.classList.toggle('mac-lcd', dmg.mac >= 1); tw.classList.toggle('mac-fire', dmg.mac >= 2); };

  // The showroom
  const toyHot = hotOf('toyota'), crG = $('.tw-cracks', toyHot), showcars = $$('.tw-showcar', toyHot);
  const SIZE = [0, 5, 13, 30];
  let policeT = 0;
  const drawShowroom = (now) => {
    const broke = dmg.toy >= 4;
    crG.innerHTML = broke ? '' : dmg.pts.map(([x, y], k) => crack(x, y, SIZE[dmg.toy] * (k === dmg.pts.length - 1 ? 1 : 0.9), x * 3 + y * 5 + k, `tw-crk tw-crk-g lv${dmg.toy}`) + (dmg.toy >= 3 ? crack(x + 8, y - 6, 18, x + y, 'tw-crk tw-crk-g lv3') : '')).join('');
    tw.classList.toggle('glass-broke', broke);
    tw.classList.toggle('alarm', broke);
    if (broke && now) tw.classList.add('shatter');
    showcars.forEach((g) => { const on = !!dmg.cars[g.dataset.car]; g.classList.toggle('hit', on); g.classList.toggle('alarm', on); });
    clearTimeout(policeT);
    if (broke) { if (!dmg.police) policeT = setTimeout(() => { dmg.police = 1; tw.classList.add('police'); }, 9000); }
    else tw.classList.remove('police', 'shatter');
  };
  const pokeShowroom = (e) => {
    const car = e.target.closest && e.target.closest('.tw-showcar');
    if (dmg.toy >= 4) {
      if (!car || dmg.cars[car.dataset.car]) return;
      dmg.cars[car.dataset.car] = 1;
    } else {
      const q = localPt(crG, e);
      // onto the nearest pane of glass
      let best = null, bd = 1e9;
      D.glass.forEach(([x, y, w, h]) => { const cx = clamp(q.x, x + 6, x + w - 6), cy = clamp(q.y, y + 6, y + h - 6), d = Math.hypot(cx - q.x, cy - q.y); if (d < bd) { bd = d; best = [cx, cy]; } });
      dmg.pts.push(best.map((n) => +n.toFixed(1)));
      dmg.toy++;
    }
    drawShowroom(true); save(); refresh('toyota');
  };

  /* Everything else. Glass and screens crack; the rest dents and scorches.
     Marks land where it was hit; things that move carry their marks along. */
  const GLASSY = new Set(['vc', 'edu', 'fics', 'p-betai', 'p-oldlap', 'p-lcd', 'p-dehum', 'tm']);
  const BODY = { rjax: '.tw-frc-flip', rfa: '.tw-rover-shiver' };
  const boxes = {};
  // (the size goes on a group around it: the flicker animates the flame's own transform)
  const flame = (x, y, k, i = 0) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${k.toFixed(2)})"><path d="M0 0 c-2.4 -1.4 -2.6 -4 -1 -6.2 c.2 1.4 1 2 1.6 2.2 c-.4 -2.6 .6 -4.8 2.6 -6.2 c-.6 2.2 .4 3.8 1.4 4.8 c.6 -1 .7 -2 .5 -3 c1.8 2.4 1.8 5.6 -.6 8.4 z" class="tw-flame" style="--d:${(-i * 0.17 % 0.6).toFixed(2)}s"/></g>`;
  const add = (g, html) => { g.insertAdjacentHTML('beforeend', html); };
  const dmgRoot = (h) => { let g = h.querySelector(':scope > .tw-dmg'); if (!g) { g = NSel('g', { class: 'tw-dmg tw-nohit' }); h.appendChild(g); } return g; };
  const dmgIn = (h, id) => { const b = BODY[id] && $(BODY[id], h); if (!b) return dmgRoot(h); let g = b.querySelector(':scope > .tw-dmg'); if (!g) { g = NSel('g', { class: 'tw-dmg tw-nohit' }); b.appendChild(g); } return g; };
  const boom = (g, x, y, s) => {
    const fx = NSel('g', { class: 'tw-boom', transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s.toFixed(2)})` });
    fx.innerHTML = `<circle r="26" fill="url(#twBoom)" class="tw-boom-ball"/><circle r="12" class="tw-boom-flash"/>` + Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * 6.283 + Math.random() * 0.4, d = 18 + Math.random() * 26; return `<path d="M0 0 l${(1.4 + Math.random() * 2).toFixed(1)} -1 l.6 ${(1.6 + Math.random() * 1.4).toFixed(1)} z" class="tw-debris" style="--x:${(Math.cos(a) * d).toFixed(1)}px;--y:${(Math.sin(a) * d - 14).toFixed(1)}px;--r:${(Math.random() * 720 - 360).toFixed(0)}deg"/>`; }).join('');
    g.appendChild(fx);
    setTimeout(() => fx.remove(), 1500);
    stage.classList.remove('tw-shake'); void stage.offsetWidth; stage.classList.add('tw-shake');
  };
  // fire on the ground: a scorch, flames, a glow
  const groundFire = (g, x, y, s, i) => add(g, `<g class="tw-gfire" style="--i:${i}"><ellipse cx="${x.toFixed(1)}" cy="${(y + 1).toFixed(1)}" rx="${(16 * s).toFixed(1)}" ry="${(3.6 * s).toFixed(1)}" fill="url(#twScorch)"/><circle cx="${x.toFixed(1)}" cy="${(y - 4 * s).toFixed(1)}" r="${(14 * s).toFixed(1)}" fill="url(#twFireGlow)" class="tw-fireglow"/>${[-6, 0, 6].map((dx, k) => flame(x + dx * s, y, s * (0.8 + (k % 2) * 0.4), i * 3 + k)).join('')}</g>`);
  const pokeAny = (id, e) => {
    const h = hotOf(id); if (!h) return;
    const n = hits[id] = (hits[id] || 0) + 1;
    const root = dmgRoot(h), marks = dmgIn(h, id);
    if (!boxes[id]) { const b = h.getBBox(); boxes[id] = { x: b.x, y: b.y, w: b.width, h: b.height }; }
    const B = boxes[id], s = clamp(Math.sqrt(B.w * B.h) / 70, 0.35, 2.8);
    const q = localPt(marks, e), r = localPt(root, e);
    const glassy = GLASSY.has(id);
    if (n <= 4) {
      const big = n === 4 ? 1.8 : 1;
      if (glassy) add(marks, crack(q.x, q.y, 6 * s * big, q.x * 7 + q.y + n, 'tw-crk tw-crk-any'));
      else add(marks, `<g class="tw-nick"><ellipse cx="${q.x.toFixed(1)}" cy="${q.y.toFixed(1)}" rx="${(2.2 * s * big).toFixed(2)}" ry="${(1.4 * s * big).toFixed(2)}" class="tw-scorch"/><path d="M${(q.x - 2.4 * s * big).toFixed(1)} ${(q.y + 0.6 * s).toFixed(1)} q${(2.4 * s * big).toFixed(1)} ${(-2.6 * s * big).toFixed(1)} ${(4.8 * s * big).toFixed(1)} 0" class="tw-dent"/></g>`);
      if (n === 4) { add(root, `<g class="tw-gsmoke" transform="translate(${r.x.toFixed(1)} ${(r.y - 2 * s).toFixed(1)}) scale(${s.toFixed(2)})">${[0, 1, 2, 3].map((k) => `<circle cx="${(k - 1.5) * 2}" cy="0" r="${2.2 + (k % 2)}" style="--d:${(-k * 0.6).toFixed(1)}s;--dx:${k % 2 ? -7 : 7}px"/>`).join('')}</g>`); h.classList.add('smoking'); }
    } else if (n <= 6) {
      add(root, `<g class="tw-onfire"><circle cx="${r.x.toFixed(1)}" cy="${(r.y - 3 * s).toFixed(1)}" r="${(12 * s * (n - 3) / 2).toFixed(1)}" fill="url(#twFireGlow)" class="tw-fireglow"/>${Array.from({ length: n === 5 ? 3 : 6 }, (_, k) => flame(r.x + (k - (n === 5 ? 1 : 2.5)) * 3.4 * s, r.y + (k % 2) * 2 * s, s * (n === 5 ? 1 : 1.5) * (0.8 + (k % 3) * 0.2), k)).join('')}</g>`);
    } else if (n === 7) {
      boom(root, r.x, r.y, s * 1.6);
      h.classList.add('charred');
      if (bots[id]) bots[id].dead = true;
      const gy = B.y + B.h;
      add(root, `<g class="tw-onfire">${Array.from({ length: 7 }, (_, k) => flame(B.x + B.w * (0.15 + k * 0.12), B.y + B.h * (0.35 + (k % 3) * 0.2), s * 1.4 * (0.8 + (k % 2) * 0.5), k + 3)).join('')}</g>`);
      [-1, 1].forEach((side, k) => groundFire(root, r.x + side * (B.w / 2 + 12 * s), gy, s * 0.9, k));
    } else if (n <= 14) {
      // and it spreads, a little further each time
      const k = n - 7, side = k % 2 ? 1 : -1, gy = B.y + B.h;
      groundFire(root, r.x + side * (B.w / 2 + (12 + k * 11) * s), gy + (k % 3) * 2, s * (0.8 + Math.random() * 0.5), k + 2);
    } else return;
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
    if (id === 'p-civic') pokeCivic(e);
    else if (id === 'p-macbook') { if (dmg.mac >= 2) return; dmg.mac++; drawMac(); save(); }
    else if (id === 'toyota') pokeShowroom(e);
    else if (id === 'p-drive') pokeDrive(e);
    else pokeAny(id, e);
  }
  function repair() {
    dmg = fresh();
    Object.keys(hits).forEach((k) => delete hits[k]);
    $$('.tw-dmg', svg).forEach((g) => g.remove());
    hots.forEach((h) => h.classList.remove('charred', 'smoking'));
    Object.values(bots).forEach((b) => { b.dead = false; });
    if (hddRings) { hddRings.innerHTML = ''; hddRot.classList.remove('spin', 'fast'); }
    clearTimeout(policeT);
    tw.classList.remove('glass-broke', 'alarm', 'police', 'shatter');
    drawCivic(); drawMac(); drawShowroom(false); save();
    Object.keys(halos).forEach(refresh);
  }
  drawCivic(); drawMac(); drawShowroom(false);
  // Damage used to be kept between visits; it isn't any more.
  try { localStorage.removeItem('sommiville-damage'); } catch (e) {}
  if (fixItem) fixItem.hidden = true;

  tw._bots = bots;
  tw._weather = setWeather;
})();
