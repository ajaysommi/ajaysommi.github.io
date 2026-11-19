/* ==========================================================================
   THE PATH, ON A WIDE SCREEN: what the shop does (see town.css).
   Click a room (or its year on the thread) and the drawing leans in on it,
   with its story in a card beside it; the arrows walk the stops in order,
   Esc or the x steps back. The pointer: the layers drift a little with it,
   the camera on the corner follows it, so do the robot's eyes, and stood
   in the road it becomes a cone the traffic has to stop for. Drivers react
   a beat late, so a sudden cone can leave a small pile up behind it.
   ========================================================================== */
(() => {
  'use strict';
  const tw = document.getElementById('town');
  if (!tw) return;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const NS = 'http://www.w3.org/2000/svg';

  const D = JSON.parse($('#town-data').textContent);
  const svg = $('.tw-svg', tw), stage = $('.tw-stage', tw), panel = $('.tw-panel', tw), inner = $('.tw-panel-in', panel);
  const label = $('.tw-label', tw), prevB = $('.tw-prev', panel), nextB = $('.tw-next', panel);
  const chips = $$('.tw-chip', tw), hots = $$('.tw-hot', svg);
  const W0 = 1200, H0 = 700, FULL = [0, 0, W0, H0];
  let vb = FULL.slice(), anim = 0, cur = null;
  const mark = (id, on) => hots.forEach((h) => { if (h.dataset.id === id) h.classList.toggle('hl', on); });

  /* ---------------------------------------------------------- the lean in */
  const setVB = (b) => { vb = b; svg.setAttribute('viewBox', b.map((n) => n.toFixed(2)).join(' ')); };
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const tween = (to, ms = 850) => {
    cancelAnimationFrame(anim);
    if (reduced) { setVB(to); return; }
    const from = vb.slice(), t0 = performance.now();
    const f = (t) => { const k = ease(clamp((t - t0) / ms, 0, 1)); setVB(from.map((v, i) => v + (to[i] - v) * k)); if (k < 1) anim = requestAnimationFrame(f); };
    anim = requestAnimationFrame(f);
  };
  // Frame the room in whatever the card leaves uncovered.
  const frame = (r, left) => {
    const [x, y, w, h] = r.zoom, cx = x + w / 2, cy = y + h / 2;
    const free = 1 - (panel.offsetWidth + 28) / stage.clientWidth, A = H0 / W0;
    let vw = w / (free * 0.9), vh = vw * A;
    if (vh < h * 1.18) { vh = h * 1.18; vw = vh / A; }
    vw = Math.min(vw, W0); vh = vw * A;
    const vx = left ? cx - vw * (1 - free / 2) : cx - vw * (free / 2);
    return [vx, clamp(cy - vh / 2, -20, H0 - vh + 20), vw, vh];
  };

  /* ---------------------------------------------------------- the card */
  const pic = (L) => L[0] === L[1] ? `<img src="assets/logos/opt/${L[0]}.webp" alt="" />` : `<img class="lg-d" src="assets/logos/opt/${L[0]}.webp" alt="" /><img class="lg-l" src="assets/logos/opt/${L[1]}.webp" alt="" />`;
  const initials = (n) => n.split(' ').map((w) => w[0]).join('').slice(0, 2);
  const nameOf = (r) => (r.school ? 'University of Florida' : r.short);
  const render = (r) => {
    const i = D.order.indexOf(r.id), p = D.roles[D.order[i - 1]], n = D.roles[D.order[i + 1]];
    panel.style.setProperty('--tint', r.tint);
    inner.innerHTML = `
      <div class="tw-p-top"><span class="tw-p-logo">${r.logo ? pic(r.logo) : r.gator ? `<img src="${r.gator}" alt="" style="max-height:42px" />` : `<span class="tw-p-mono">${esc(initials(r.short))}</span>`}</span><span class="tw-p-yr">’${String(r.year).slice(2)}</span></div>
      <h3>${esc(r.org)}</h3>
      <p class="tw-p-role">${esc(r.role)}</p>
      <p class="tw-p-when">${esc(r.when)} · ${esc(r.where)}</p>
      <p class="tw-p-text">${esc(r.text)}</p>
      ${r.stats.length ? `<ul class="tw-p-stats">${r.stats.map(([a, b]) => `<li><b>${esc(a)}</b><span>${esc(b)}</span></li>`).join('')}</ul>` : ''}
      <ul class="tw-p-tags">${r.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      ${r.photos.length ? `<div class="tw-p-pics">${r.photos.map((s) => `<button type="button" aria-label="Open photo"><img src="${s}" alt="" loading="lazy" decoding="async" /></button>`).join('')}</div>` : ''}`;
    inner.scrollTop = 0;
    inner.classList.remove('swap'); void inner.offsetWidth; inner.classList.add('swap');
    prevB.hidden = !p; nextB.hidden = !n;
    if (p) { $('span', prevB).textContent = p.school ? 'UF' : p.short; prevB.dataset.id = p.id; }
    if (n) { $('span', nextB).textContent = n.school ? 'UF' : n.short; nextB.dataset.id = n.id; }
    nextB.style.marginLeft = 'auto';
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
    if (cur) mark(cur, false);
    cur = id;
    $$('.tw-big-pic', panel).forEach((n) => n.remove());
    const left = r.zoom[0] + r.zoom[2] / 2 > W0 / 2;
    panel.classList.toggle('left', left);
    panel.hidden = false;
    render(r);
    requestAnimationFrame(() => { panel.classList.add('open'); tween(frame(r, left), wasOpen ? 750 : 900); });
    tw.classList.add('zoomed');
    mark(id, true);
    chips.forEach((c) => c.classList.toggle('on', c.dataset.id === id));
    hideLabel(); resetParallax();
  };
  const close = () => {
    if (!cur) return;
    mark(cur, false);
    cur = null;
    panel.classList.remove('open');
    setTimeout(() => { if (!cur) panel.hidden = true; }, 360);
    tween(FULL, 800);
    tw.classList.remove('zoomed');
    chips.forEach((c) => c.classList.remove('on'));
  };

  hots.forEach((h) => h.addEventListener('click', (e) => { e.stopPropagation(); open(h.dataset.id); }));
  chips.forEach((c) => {
    c.addEventListener('click', () => { open(c.dataset.id); stage.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' }); });
    c.addEventListener('mouseenter', () => { if (!cur) mark(c.dataset.id, true); });
    c.addEventListener('mouseleave', () => { if (!cur) mark(c.dataset.id, false); });
  });
  $('.tw-x', panel).addEventListener('click', close);
  prevB.addEventListener('click', () => open(prevB.dataset.id));
  nextB.addEventListener('click', () => open(nextB.dataset.id));
  svg.addEventListener('click', () => close());
  document.addEventListener('keydown', (e) => {
    if (!cur) return;
    if (e.key === 'Escape') { const big = $('.tw-big-pic', panel); if (big) big.remove(); else close(); }
    else if (e.key === 'ArrowRight' && !nextB.hidden) open(nextB.dataset.id);
    else if (e.key === 'ArrowLeft' && !prevB.hidden) open(prevB.dataset.id);
  });

  /* ---------------------------------------------------------- the name on hover */
  const hideLabel = () => label.classList.remove('on');
  hots.forEach((h) => {
    h.addEventListener('mouseenter', () => {
      if (cur) return;
      const r = D.roles[h.dataset.id];
      mark(r.id, true);
      label.style.setProperty('--tint', r.tint);
      label.innerHTML = `<b>’${String(r.year).slice(2)}</b>${esc(nameOf(r))}`;
      const at = ($(`.tw-node[data-id="${r.id}"]`, svg) || h).getBoundingClientRect(), s = stage.getBoundingClientRect();
      label.style.left = (at.left + at.width / 2 - s.left) + 'px';
      label.style.top = (at.top - s.top) + 'px';
      label.classList.add('on');
    });
    h.addEventListener('mouseleave', () => { hideLabel(); if (!cur) mark(h.dataset.id, false); });
  });

  /* ---------------------------------------------------------- the street */
  /* Two lanes, three cars each, driving close. Each driver brakes for the
     car ahead only once they notice it braking, a beat late; they see a
     cone at once. Too close and too fast, and they hit. */
  const traffic = $('.tw-traffic', svg), cone = $('.tw-cone-pt', svg);
  const LANES = [{ y: 640, dir: 1 }, { y: 690, dir: -1 }];
  const PAINT = ['#d42a30', '#e6e3dc', '#2f62c9', '#4a4d55', '#c9b48a', '#1f7a5a'];
  const cars = [];
  [[0, 'twSedan', 0], [0, 'twSuv', 1], [0, 'twSedan', 2], [1, 'twSuv', 3], [1, 'twSedan', 4], [1, 'twSuv', 5]].forEach(([l, sym, k], i) => {
    const g = document.createElementNS(NS, 'g'), u = document.createElementNS(NS, 'use');
    g.setAttribute('class', 'tw-car'); g.style.setProperty('--paint', PAINT[k]);
    u.setAttribute('href', '#' + sym);
    g.appendChild(u); traffic.appendChild(g);
    const lane = LANES[l], s = 0.62, half = 82 * s;
    const n = cars.filter((c) => c.lane === lane).length;
    cars.push({ g, lane, s, half, x: lane.dir > 0 ? 420 - n * (half * 2 + 62) : 780 + n * (half * 2 + 62), v: 170, vmax: 170, react: 0.5 + Math.random() * 0.35, saw: -1, braking: false, crash: 0 });
  });
  let pt = null; // the cone: { lane, x }
  const draw = (c) => { c.g.setAttribute('transform', `translate(${c.x.toFixed(1)} ${c.lane.y}) scale(${(c.lane.dir * c.s).toFixed(3)} ${c.s})`); };
  const bang = (x, y) => {
    const b = document.createElementNS(NS, 'path');
    b.setAttribute('d', 'M0 -16 L4 -5 L15 -8 L7 1 L13 11 L2 6 L-5 15 L-5 4 L-16 2 L-6 -4 Z');
    b.setAttribute('fill', '#ffcf3d'); b.setAttribute('stroke', '#e0473b'); b.setAttribute('stroke-width', '2.4');
    b.setAttribute('transform', `translate(${x} ${y - 30})`);
    b.setAttribute('class', 'tw-bang');
    traffic.appendChild(b);
    setTimeout(() => b.remove(), 900);
  };
  let t = 0;
  const step = (dt) => {
    t += dt;
    for (const lane of LANES) {
      const L = cars.filter((c) => c.lane === lane).sort((a, b) => (b.x - a.x) * lane.dir); // front first
      L.forEach((c, i) => {
        const ahead = L[i - 1];
        const front = c.x + c.half * lane.dir;
        let gap = Infinity, isCone = false, aheadBraking = false;
        if (ahead) { gap = (ahead.x - ahead.half * lane.dir - front) * lane.dir; aheadBraking = ahead.braking || ahead.crash > t || ahead.v < 20; }
        if (pt && pt.lane === lane) { const g = (pt.x - 14 * lane.dir - front) * lane.dir; if (g > -6 && g < gap) { gap = g; isCone = true; aheadBraking = false; } }
        if (c.crash > t) { c.v = 0; c.braking = true; return; }
        // Notice the car ahead braking, a beat late.
        if (aheadBraking) { if (c.saw < 0) c.saw = t; } else c.saw = -1;
        const noticed = isCone ? gap < 200 : (c.saw >= 0 && t - c.saw > c.react) || gap < 16;
        // Seen in good time, a cone gets a gentle stop; dropped right in front, a hard one.
        // Behind a car, brake as hard as its own stop needs, never harder.
        const room = isCone ? gap - 10 : gap + (ahead ? (ahead.v * ahead.v) / (2 * 430) : 0) - 12;
        const dec = clamp((c.v * c.v) / (2 * Math.max(room, 1)), 60, isCone ? 760 : 430), stopDist = (c.v * c.v) / (2 * dec) + 8;
        c.braking = noticed && (isCone || gap < stopDist + 30);
        if (c.braking) c.v = Math.max(0, c.v - dec * dt);
        else if (gap > 60 || !ahead) c.v = Math.min(c.vmax, c.v + 150 * dt);
        // Close behind: hold speed. Only a driver who has noticed slows down.
        c.x += c.v * dt * lane.dir;
        const after = isCone ? (pt.x - 14 * lane.dir - (c.x + c.half * lane.dir)) * lane.dir : ahead ? (ahead.x - ahead.half * lane.dir - (c.x + c.half * lane.dir)) * lane.dir : Infinity;
        if (after < 0) {
          // Into the cone: stop dead at it. Into a car: a bump, both shaken.
          c.x += after * lane.dir;
          if (!isCone && ahead && c.v > 30) {
            ahead.crash = Math.max(ahead.crash, t + 2.4); c.crash = t + 2.6;
            ahead.v = Math.min(ahead.v, 0); c.v = 0;
            [c, ahead].forEach((k) => { k.g.classList.remove('crashed'); void k.g.getBoundingClientRect(); k.g.classList.add('crashed'); });
            bang(c.x + c.half * lane.dir, lane.y);
          }
          c.v = 0;
        }
      });
      // Off one end, back on at the other once there's room.
      L.forEach((c) => {
        if (lane.dir > 0 && c.x - c.half > W0 + 40) { const back = Math.min(-120, ...L.filter((o) => o !== c).map((o) => o.x - o.half * 2 - 60)); c.x = back; }
        if (lane.dir < 0 && c.x + c.half < -40) { const back = Math.max(W0 + 120, ...L.filter((o) => o !== c).map((o) => o.x + o.half * 2 + 60)); c.x = back; }
        c.g.classList.toggle('braking', c.braking && c.v > 0.5);
        if (c.crash < t) c.g.classList.remove('crashed');
        draw(c);
      });
    }
  };
  let running = false, lastT = 0, visible = true;
  const loop = (now) => {
    if (!running) return;
    const dt = Math.min(0.05, (now - (lastT || now)) / 1000); lastT = now;
    if (dt > 0) step(dt);
    requestAnimationFrame(loop);
  };
  const go = () => { if (running || reduced || !visible) return; running = true; lastT = 0; requestAnimationFrame(loop); };
  cars.forEach(draw);
  go();

  /* ---------------------------------------------------------- the pointer */
  const layers = $$('[data-depth]', svg).map((g) => [g, +g.dataset.depth]);
  const head = $('.tw-cctv-head', svg), eyes = $$('.tw-follow', svg);
  const toSVG = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
  const resetParallax = () => layers.forEach(([g]) => { g.style.transform = ''; });
  let praf = 0, lastE = null;
  stage.addEventListener('pointermove', (e) => {
    lastE = e;
    if (praf) return;
    praf = requestAnimationFrame(() => {
      praf = 0;
      const e = lastE, s = stage.getBoundingClientRect();
      const nx = (e.clientX - s.left) / s.width - 0.5, ny = (e.clientY - s.top) / s.height - 0.5;
      if (!cur && !reduced) layers.forEach(([g, d]) => { g.style.transform = `translate(${(-nx * d).toFixed(2)}px, ${(-ny * d * 0.4).toFixed(2)}px)`; });
      const p = toSVG(e);
      // The cone: in a lane, on the road, while the whole shop is in view.
      const lane = !cur && p.y > 614 ? (p.y < 666 ? LANES[0] : LANES[1]) : null;
      if (lane) {
        pt = { lane, x: clamp(p.x, 10, W0 - 10) };
        cone.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${lane.y + 2})`); cone.setAttribute('opacity', '1');
        stage.classList.add('on-road');
      } else { pt = null; cone.setAttribute('opacity', '0'); stage.classList.remove('on-road'); }
      if (head) {
        // The camera hangs off the left corner at (26, 392) and looks out to the left.
        const a = Math.atan2(p.y - 392, 26 - p.x) * 180 / Math.PI;
        tw.classList.add('tracking');
        head.style.transform = `rotate(${clamp(-a, -70, 30).toFixed(1)}deg)`;
      }
      eyes.forEach((el) => {
        const r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1;
        el.style.transform = `translate(${(dx / d * 2.4).toFixed(2)}px, ${(dy / d * 2.4).toFixed(2)}px)`;
      });
    });
  });
  stage.addEventListener('pointerleave', () => {
    resetParallax();
    pt = null; cone.setAttribute('opacity', '0'); stage.classList.remove('on-road');
    tw.classList.remove('tracking'); if (head) head.style.transform = '';
    eyes.forEach((el) => { el.style.transform = ''; });
  });

  // Nothing moves while the shop is off screen.
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    svg.classList.toggle('tw-paused', !visible);
    if (visible) go(); else running = false;
  }).observe(stage);
  addEventListener('resize', () => { if (cur) setVB(frame(D.roles[cur], panel.classList.contains('left'))); });
  // For tests: where the cars are.
  tw._cars = cars;
})();
