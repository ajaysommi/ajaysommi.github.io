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
  // scrolls sideways. Things keep the size they had in the old framed
  // scene (about 0.95px a unit), the extra window shows more of the street
  // and more sky.
  const WORLD = D.W, BOTTOM = 676;
  let scale = 1, vw = 1200, vh = 600, camX = 0;
  const measure = () => {
    const w = stage.clientWidth || innerWidth, h = stage.clientHeight || innerHeight;
    scale = clamp(h / 940, 0.72, 1.12);
    vw = w / scale; vh = h / scale;
    camX = clamp(camX, 0, Math.max(0, WORLD - vw));
  };
  const view = () => [camX, BOTTOM - vh, vw, vh];
  measure();
  let vb = view(), anim = 0, cur = null;
  const nameOf = (r) => (r.school ? 'University of Florida' : r.short);
  const yy = (r) => `’${String(r.year).slice(2)}`;

  /* ---------------------------------------------------------- the two robots */
  // Each lives in its own patch of lawn and never leaves it.
  // They move like something with a little weight: a soft spring toward
  // where they want to be, never faster than an amble.
  const bots = {
    rfa: { el: $('.tw-rover', svg), flip: $('.tw-rover-flip', svg), pin: $('.tw-pin[data-id="rfa"]', svg), x: 1850, y: 556, vx: 0, vy: 0, tx: 1850, ty: 556, face: -1, idleAt: 0, box: [1712, 1872, 536, 566], reach: 110, keep: 50, pinDy: -78, k: 5, max: 70, s: 1, tilt: 0 },
    rjax: { el: $('.tw-frc', svg), flip: $('.tw-frc-flip', svg), pin: $('.tw-pin[data-id="rjax"]', svg), x: 670, y: 562, vx: 0, vy: 0, tx: 670, ty: 562, face: 1, idleAt: 0, box: [626, 718, 552, 582], reach: 140, keep: 64, pinDy: -40, k: 3, max: 45, s: 0.78, tilt: 0 }
  };
  const placeBot = (b) => {
    b.el.setAttribute('transform', `translate(${b.x.toFixed(1)} ${b.y.toFixed(1)})`);
    b.flip.setAttribute('transform', `scale(${(b.face * b.s).toFixed(3)} ${b.s}) rotate(${b.tilt.toFixed(1)})`);
    b.pin.setAttribute('transform', `translate(${b.x.toFixed(1)} ${(b.y + b.pinDy).toFixed(1)})`);
  };
  Object.values(bots).forEach(placeBot);
  // The competition robot's camera: on its target, or on the pointer when close.
  const turret = $('.tw-turret', svg), vision = $('.tw-vision', svg), reticle = $('.tw-reticle', svg);
  const TARGET = [754, 511];
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
  const LIVE = { hunter: '.tw-plat', rjax: '.tw-frc', rfa: '.tw-rover', fics: '.tw-dish', adt: '.tw-cambody', edu: '.tw-gator', shiva: '.tw-bars' };
  const SKIP = { hunter: '.tw-plat, .tw-arm-a, .tw-arm-b, .tw-pivot, .tw-laser', rjax: '.tw-frc, .tw-vision, .tw-reticle', rfa: '.tw-rover', fics: '.tw-dish', adt: '.tw-cctv-head', jm: '.tw-hazards', edu: '.tw-gator, .tw-ripples', shiva: '.tw-bars' };
  const halos = {};
  const hotOf = (id) => hots.find((h) => h.dataset.id === id);
  let lit = null;
  const glow = (id) => {
    if (lit === id) return;
    if (lit) {
      if (halos[lit]) halos[lit].remove();
      const h = hotOf(lit); if (h) $$(LIVE[lit] || '.tw-none', h).forEach((n) => { n.style.filter = ''; });
    }
    lit = id;
    const h = id && hotOf(id);
    if (!h) return;
    let g = halos[id];
    if (!g) {
      g = h.cloneNode(true);
      g.removeAttribute('data-id'); g.removeAttribute('style');
      g.setAttribute('class', 'tw-halo'); g.setAttribute('aria-hidden', 'true');
      g.setAttribute('filter', `url(#twHalo-${id})`);
      $$('.tw-hit' + (SKIP[id] ? ', ' + SKIP[id] : ''), g).forEach((n) => n.remove());
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
  const far = $('.tw-far', svg), panL = $('.tw-pan-l', tw), panR = $('.tw-pan-r', tw);
  const setVB = (b) => {
    vb = b; svg.setAttribute('viewBox', b.map((n) => n.toFixed(2)).join(' '));
    far.setAttribute('transform', `translate(${(b[0] * 0.6).toFixed(2)} ${((b[1] - (BOTTOM - vh)) * 0.4).toFixed(2)})`);
    panL.classList.toggle('on', !cur && camX > 4);
    panR.classList.toggle('on', !cur && camX < WORLD - vw - 4);
  };
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const tween = (to, ms = 850) => {
    cancelAnimationFrame(anim);
    if (reduced) { setVB(to); return; }
    // While the scene moves the glow steps aside (redrawing it at every
    // step of the zoom is the expensive part) and comes back when it lands.
    const from = vb.slice(), t0 = performance.now();
    svg.classList.add('tw-moving');
    const f = (t) => { const k = ease(clamp((t - t0) / ms, 0, 1)); setVB(from.map((v, i) => v + (to[i] - v) * k)); if (k < 1) anim = requestAnimationFrame(f); else svg.classList.remove('tw-moving'); };
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
      <p class="tw-p-when">${esc(r.when)} · ${esc(r.where)}</p>
      ${r.about ? `<p class="tw-p-about">${esc(r.about)}</p>` : ''}
      <p class="tw-p-text">${esc(r.text)}</p>
      ${r.photos.length ? `<div class="tw-p-pics">${r.photos.map((s) => `<button type="button" aria-label="Open photo"><img src="${s}" alt="" loading="lazy" decoding="async" /></button>`).join('')}</div>` : ''}
      ${r.stats.length ? `<ul class="tw-p-stats">${r.stats.map(([a, b]) => `<li><b>${esc(a)}</b><span>${esc(b)}</span></li>`).join('')}</ul>` : ''}
      ${links.length ? `<div class="tw-p-links"><h4>How it connects</h4>${links.map(([a, b, long]) => { const o = D.roles[a === r.id ? b : a]; return `<button type="button" class="tw-p-link" data-go="${o.id}" style="--lt:${o.tint}"><b>${esc(nameOf(o))} ${yy(o)}</b> ${esc(long)}</button>`; }).join('')}</div>` : ''}
      <ul class="tw-p-tags">${r.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
    inner.scrollTop = 0;
    inner.classList.remove('swap'); void inner.offsetWidth; inner.classList.add('swap');
    prevB.hidden = !p; nextB.hidden = !n;
    if (p) { $('span', prevB).textContent = p.school ? 'UF' : p.short; prevB.dataset.id = p.id; }
    if (n) { $('span', nextB).textContent = n.school ? 'UF' : n.short; nextB.dataset.id = n.id; }
    nextB.style.marginLeft = 'auto';
    $$('.tw-p-link', inner).forEach((b) => b.addEventListener('click', () => open(b.dataset.go)));
    $$('.tw-p-pics button', inner).forEach((b) => b.addEventListener('click', () => {
      const big = document.createElement('div');
      big.className = 'tw-big-pic';
      big.innerHTML = `<img src="${b.querySelector('img').src}" alt="" />`;
      big.addEventListener('click', () => big.remove());
      panel.appendChild(big);
    }));
  };

  const open = (id) => {
    const r = D.roles[id];
    if (!r) return;
    const wasOpen = !!cur;
    cur = id;
    $$('.tw-big-pic', panel).forEach((n) => n.remove());
    const z = zoomOf(id), left = z[0] + z[2] / 2 > vb[0] + vb[2] / 2;
    cancelAnimationFrame(glide);
    // when the card closes, the street is left centred on this place
    camX = clamp(z[0] + z[2] / 2 - vw / 2, 0, Math.max(0, WORLD - vw));
    panel.classList.toggle('left', left);
    panel.hidden = false;
    render(r);
    requestAnimationFrame(() => { panel.classList.add('open'); tween(frame(z, left), wasOpen ? 750 : 900); });
    tw.classList.add('zoomed');
    glow(null); glow(id);
    if (id === 'jm') tw.classList.add('arrive', 'parked');
    chips.forEach((c) => c.classList.toggle('on', c.dataset.id === id));
    const pin = $(`.tw-pin[data-id="${id}"]`, svg); if (pin) pin.classList.add('seen');
    hideLabel(); panL.classList.remove('on'); panR.classList.remove('on');
  };
  const close = () => {
    if (!cur) return;
    cur = null;
    panel.classList.remove('open');
    setTimeout(() => { if (!cur) panel.hidden = true; }, 360);
    tween(view(), 800);
    tw.classList.remove('zoomed');
    glow(null); over = null;
    chips.forEach((c) => c.classList.remove('on'));
  };

  // Clicking the place that's open (or anywhere off it) steps back out.
  hots.forEach((h) => h.addEventListener('click', (e) => { e.stopPropagation(); if (dragged) return; if (cur === h.dataset.id) close(); else open(h.dataset.id); }));
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
    if (!cur) {
      if (e.target.closest && e.target.closest('input, textarea')) return;
      if (e.key === 'ArrowRight') panTo(camX + vw * 0.4, 450);
      else if (e.key === 'ArrowLeft') panTo(camX - vw * 0.4, 450);
      return;
    }
    if (e.key === 'Escape') { const big = $('.tw-big-pic', panel); if (big) big.remove(); else close(); }
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
  svg.addEventListener('pointerover', (e) => { const h = e.target.closest && e.target.closest('.tw-hot'); hoverTo(h ? h.dataset.id : null); });
  svg.addEventListener('pointerout', (e) => { const to = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.tw-hot'); hoverTo(to ? to.dataset.id : null); });

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
      steer(bots.rfa, dt, now);
      const close = steer(bots.rjax, dt, now) && Math.hypot(ptr.x - bots.rjax.x, ptr.y - bots.rjax.y) < 230;
      const want = close ? [ptr.x, ptr.y] : TARGET;
      aim = [aim[0] + (want[0] - aim[0]) * Math.min(1, dt * 2.5), aim[1] + (want[1] - aim[1]) * Math.min(1, dt * 2.5)];
      aimCam();
    }
    if (dt > 0) lift(now);
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
      const sky = p.y < 222;
      tw.classList.toggle('sky', sky);
      tw.classList.toggle('near', !sky);
      if (sky && dish) {
        // The dish sits on the FICS lab's roof at (274, 284); it turns its face to the pointer.
        const a = Math.atan2(p.x - 274, 284 - p.y) * 180 / Math.PI;
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
    if (cur || e.ctrlKey) return;
    const k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? vw * scale : 1;
    const d = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * k;
    if (!d) return;
    e.preventDefault();
    cancelAnimationFrame(glide);
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
    if (!dragged) { dragged = true; tw.classList.add('dragging'); cancelAnimationFrame(glide); }
    camX = clamp(drag.cam - dx / scale, 0, Math.max(0, WORLD - vw));
    setVB(view());
  });
  addEventListener('pointerup', () => { if (!drag) return; drag = null; tw.classList.remove('dragging'); setTimeout(() => { dragged = false; }, 0); });
  panL.addEventListener('click', () => panTo(camX - vw * 0.6));
  panR.addEventListener('click', () => panTo(camX + vw * 0.6));
  const themeB = $('.tw-theme', tw);
  if (themeB) themeB.addEventListener('click', () => { const b = document.getElementById('themeBtn'); if (b) b.click(); });

  if (reduced || !('IntersectionObserver' in window)) tw.classList.add('arrive', 'parked');
  else {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTimeout(() => tw.classList.add('arrive'), 700); io.disconnect(); } }, { threshold: 0.55 });
    io.observe(stage);
  }
  addEventListener('resize', () => { measure(); if (cur) setVB(frame(zoomOf(cur), panel.classList.contains('left'))); else setVB(view()); });
  tw._bots = bots;
})();
