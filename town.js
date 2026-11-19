/* ==========================================================================
   AROUND THE BLOCK: what the street does (see town.css).
   Hover anything and everything that belongs to that place glows, with
   threads out to the jobs it led to or came from. Click and the scene
   leans in, the story in a card beside it; arrows walk the stops in order,
   Esc or the x steps back. The pointer: on the grass the rover follows it,
   near the building the corner camera does, up in the sky the dish on the
   roof does, and in the road it's a cone the traffic has to stop for
   (drivers react a beat late, so a sudden cone can cause a small pile up).
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
  const chips = $$('.tw-chip', tw), hots = $$('.tw-hot', svg), linksG = $('.tw-links', svg);
  const W0 = 1200, H0 = 640, FULL = [0, 0, W0, H0];
  let vb = FULL.slice(), anim = 0, cur = null;
  const nameOf = (r) => (r.school ? 'University of Florida' : r.short);
  const yy = (r) => `’${String(r.year).slice(2)}`;

  /* ---------------------------------------------------------- the rover */
  const roverEl = $('.tw-rover', svg), flipEl = $('.tw-rover-flip', svg), roverPin = $('.tw-pin[data-id="rfa"]', svg);
  const rover = { x: 600, y: 538, tx: 600, ty: 538, face: 1, idleAt: 0 };
  const placeRover = () => {
    roverEl.setAttribute('transform', `translate(${rover.x.toFixed(1)} ${rover.y.toFixed(1)})`);
    flipEl.setAttribute('transform', `scale(${rover.face} 1)`);
    roverPin.setAttribute('transform', `translate(${rover.x.toFixed(1)} ${(rover.y - 76).toFixed(1)})`);
  };
  placeRover();

  /* ---------------------------------------------------------- where things are */
  const pinOf = (id) => (id === 'rfa' ? [rover.x, rover.y - 76] : D.pin[id]);
  const zoomOf = (id) => (id === 'rfa' ? [rover.x - 110, 440, 220, 120] : D.roles[id].zoom);
  const linksOf = (id) => D.links.filter((l) => l[0] === id || l[1] === id);

  /* ---------------------------------------------------------- glow and threads */
  // Everything that belongs to a place lights together; its threads come out.
  let lit = null;
  const glow = (id) => {
    if (lit === id) return;
    lit = id;
    hots.forEach((h) => { h.style.filter = id && h.dataset.id === id ? `url(#twGlow-${id})` : ''; });
    tw.classList.toggle('link-th', id === 'toyota' || id === 'hunter');
    linksG.innerHTML = '';
    if (!id) return;
    linksOf(id).forEach(([a, b, word]) => {
      const other = a === id ? b : a, [x1, y1] = pinOf(id), [x2, y2] = pinOf(other);
      const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - 50 - Math.abs(x2 - x1) * 0.12;
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'tw-link');
      g.style.setProperty('--tint', D.roles[other].tint);
      const d = `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`;
      const w = word.length * 6.4 + 16, lx = (x1 + 2 * mx + x2) / 4, ly = (y1 + 2 * my + y2) / 4;
      g.innerHTML = `<path class="tw-link-bed" d="${d}"/><path d="${d}"/><rect x="${lx - w / 2}" y="${ly - 10}" width="${w}" height="20" rx="10"/><text x="${lx}" y="${ly + 4}" text-anchor="middle">${esc(word)}</text>`;
      linksG.appendChild(g);
    });
  };

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
  const frame = (z, left) => {
    const [x, y, w, h] = z, cx = x + w / 2, cy = y + h / 2;
    const free = 1 - (panel.offsetWidth + 28) / stage.clientWidth, A = H0 / W0;
    let vw = w / (free * 0.88), vh = vw * A;
    if (vh < h * 1.2) { vh = h * 1.2; vw = vh / A; }
    vw = Math.min(vw, W0); vh = vw * A;
    const vx = left ? cx - vw * (1 - free / 2) : cx - vw * (free / 2);
    return [vx, clamp(cy - vh / 2, -30, H0 - vh + 10), vw, vh];
  };

  /* ---------------------------------------------------------- the card */
  const logo = (L) => L[0] === L[1] ? `<img src="assets/logos/opt/${L[0]}.webp" alt="" />` : `<img class="lg-d" src="assets/logos/opt/${L[0]}.webp" alt="" /><img class="lg-l" src="assets/logos/opt/${L[1]}.webp" alt="" />`;
  const render = (r) => {
    const i = D.order.indexOf(r.id), p = D.roles[D.order[i - 1]], n = D.roles[D.order[i + 1]];
    panel.style.setProperty('--tint', r.tint);
    const links = linksOf(r.id);
    inner.innerHTML = `
      <div class="tw-p-top"><span class="tw-p-logo">${r.logo ? logo(r.logo) : r.gator ? `<img src="${r.gator}" alt="" style="max-height:42px" />` : ''}</span><span class="tw-p-yr">${yy(r)}</span></div>
      <h3>${esc(r.org)}</h3>
      <p class="tw-p-role">${esc(r.role)}</p>
      <p class="tw-p-when">${esc(r.when)} · ${esc(r.where)}</p>
      <p class="tw-p-text">${esc(r.text)}</p>
      ${r.stats.length ? `<ul class="tw-p-stats">${r.stats.map(([a, b]) => `<li><b>${esc(a)}</b><span>${esc(b)}</span></li>`).join('')}</ul>` : ''}
      ${links.length ? `<div class="tw-p-links"><h4>How it connects</h4>${links.map(([a, b, , long]) => { const o = D.roles[a === r.id ? b : a]; return `<button type="button" class="tw-p-link" data-go="${o.id}" style="--lt:${o.tint}"><b>${esc(nameOf(o))} ${yy(o)}</b> ${esc(long)}</button>`; }).join('')}</div>` : ''}
      <ul class="tw-p-tags">${r.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      ${r.photos.length ? `<div class="tw-p-pics">${r.photos.map((s) => `<button type="button" aria-label="Open photo"><img src="${s}" alt="" loading="lazy" decoding="async" /></button>`).join('')}</div>` : ''}`;
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
    const z = zoomOf(id), left = z[0] + z[2] / 2 > W0 / 2;
    panel.classList.toggle('left', left);
    panel.hidden = false;
    render(r);
    requestAnimationFrame(() => { panel.classList.add('open'); tween(frame(z, left), wasOpen ? 750 : 900); });
    tw.classList.add('zoomed');
    lit = null; glow(id);
    chips.forEach((c) => c.classList.toggle('on', c.dataset.id === id));
    const pin = $(`.tw-pin[data-id="${id}"]`, svg); if (pin) pin.classList.add('seen');
    hideLabel(); resetParallax();
  };
  const close = () => {
    if (!cur) return;
    cur = null;
    panel.classList.remove('open');
    setTimeout(() => { if (!cur) panel.hidden = true; }, 360);
    tween(FULL, 800);
    tw.classList.remove('zoomed');
    glow(null);
    chips.forEach((c) => c.classList.remove('on'));
  };

  hots.forEach((h) => h.addEventListener('click', (e) => { e.stopPropagation(); open(h.dataset.id); }));
  chips.forEach((c) => {
    c.addEventListener('click', () => { open(c.dataset.id); stage.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' }); });
    c.addEventListener('mouseenter', () => { if (!cur) glow(c.dataset.id); });
    c.addEventListener('mouseleave', () => { if (!cur) glow(null); });
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
  const showLabel = (id) => {
    const r = D.roles[id], s = stage.getBoundingClientRect();
    const pin = $(`.tw-pin[data-id="${id}"]`, svg);
    if (!pin) return;
    const at = pin.getBoundingClientRect();
    label.style.setProperty('--tint', r.tint);
    label.innerHTML = `<b>${yy(r)}</b>${esc(nameOf(r))}`;
    label.style.left = (at.left + at.width / 2 - s.left) + 'px';
    label.style.top = (at.top - s.top) + 'px';
    label.classList.add('on');
  };
  hots.forEach((h) => {
    h.addEventListener('mouseenter', () => { if (cur) return; glow(h.dataset.id); showLabel(h.dataset.id); });
    h.addEventListener('mouseleave', (e) => {
      if (cur) return;
      const to = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.tw-hot');
      if (to && to.dataset.id === h.dataset.id) return;
      glow(null); hideLabel();
    });
  });

  /* ---------------------------------------------------------- the street */
  const traffic = $('.tw-traffic', svg), cone = $('.tw-cone-pt', svg);
  const LANES = [{ y: 584, dir: 1 }, { y: 624, dir: -1 }];
  const PAINT = ['#e1262d', '#eceae4', '#2f62c9', '#4a4d55', '#c9a77f', '#1f7a5a'];
  const cars = [];
  [[0, 'twSedan', 0], [0, 'twSuv', 1], [0, 'twSedan', 2], [1, 'twSuv', 3], [1, 'twSedan', 4], [1, 'twSuv', 5]].forEach(([l, sym, k]) => {
    const g = document.createElementNS(NS, 'g'), u = document.createElementNS(NS, 'use');
    g.setAttribute('class', 'tw-car'); g.style.setProperty('--paint', PAINT[k]);
    u.setAttribute('href', '#' + sym);
    g.appendChild(u); traffic.appendChild(g);
    const lane = LANES[l], s = 0.44, half = 84 * s;
    const n = cars.filter((c) => c.lane === lane).length;
    cars.push({ g, lane, s, half, x: lane.dir > 0 ? 420 - n * (half * 2 + 62) : 780 + n * (half * 2 + 62), v: 160, vmax: 160, react: 0.5 + Math.random() * 0.35, saw: -1, braking: false, crash: 0 });
  });
  let pt = null;
  const draw = (c) => { c.g.setAttribute('transform', `translate(${c.x.toFixed(1)} ${c.lane.y}) scale(${(c.lane.dir * c.s).toFixed(3)} ${c.s})`); };
  const bang = (x, y) => {
    const b = document.createElementNS(NS, 'path');
    b.setAttribute('d', 'M0 -14 L4 -4 L13 -7 L6 1 L11 10 L2 5 L-4 13 L-4 3 L-14 2 L-5 -3 Z');
    b.setAttribute('fill', '#ffcf3d'); b.setAttribute('stroke', '#e0473b'); b.setAttribute('stroke-width', '2.2');
    b.setAttribute('transform', `translate(${x} ${y - 22})`);
    b.setAttribute('class', 'tw-bang');
    traffic.appendChild(b);
    setTimeout(() => b.remove(), 900);
  };
  let t = 0;
  const drive = (dt) => {
    t += dt;
    for (const lane of LANES) {
      const L = cars.filter((c) => c.lane === lane).sort((a, b) => (b.x - a.x) * lane.dir);
      L.forEach((c, i) => {
        const ahead = L[i - 1], front = c.x + c.half * lane.dir;
        let gap = Infinity, isCone = false, aheadBraking = false;
        if (ahead) { gap = (ahead.x - ahead.half * lane.dir - front) * lane.dir; aheadBraking = ahead.braking || ahead.crash > t || ahead.v < 20; }
        if (pt && pt.lane === lane) { const g = (pt.x - 12 * lane.dir - front) * lane.dir; if (g > -6 && g < gap) { gap = g; isCone = true; aheadBraking = false; } }
        if (c.crash > t) { c.v = 0; c.braking = true; return; }
        if (aheadBraking) { if (c.saw < 0) c.saw = t; } else c.saw = -1;
        const noticed = isCone ? gap < 200 : (c.saw >= 0 && t - c.saw > c.react) || gap < 16;
        // Seen in time, a gentle stop; dropped right in front, a hard one. Behind a car, only as hard as its stop needs.
        const room = isCone ? gap - 10 : gap + (ahead ? (ahead.v * ahead.v) / (2 * 430) : 0) - 12;
        const dec = clamp((c.v * c.v) / (2 * Math.max(room, 1)), 60, isCone ? 760 : 430), stopDist = (c.v * c.v) / (2 * dec) + 8;
        c.braking = noticed && (isCone || gap < stopDist + 30);
        if (c.braking) c.v = Math.max(0, c.v - dec * dt);
        else if (gap > 60 || !ahead) c.v = Math.min(c.vmax, c.v + 150 * dt);
        c.x += c.v * dt * lane.dir;
        const after = isCone ? (pt.x - 12 * lane.dir - (c.x + c.half * lane.dir)) * lane.dir : ahead ? (ahead.x - ahead.half * lane.dir - (c.x + c.half * lane.dir)) * lane.dir : Infinity;
        if (after < 0) {
          c.x += after * lane.dir;
          if (!isCone && ahead && c.v > 30) {
            ahead.crash = Math.max(ahead.crash, t + 2.4); c.crash = t + 2.6;
            [c, ahead].forEach((k) => { k.g.classList.remove('crashed'); void k.g.getBoundingClientRect(); k.g.classList.add('crashed'); });
            bang(c.x + c.half * lane.dir, lane.y);
          }
          c.v = 0;
        }
      });
      L.forEach((c) => {
        if (lane.dir > 0 && c.x - c.half > W0 + 40) c.x = Math.min(-120, ...L.filter((o) => o !== c).map((o) => o.x - o.half * 2 - 62));
        if (lane.dir < 0 && c.x + c.half < -40) c.x = Math.max(W0 + 120, ...L.filter((o) => o !== c).map((o) => o.x + o.half * 2 + 62));
        c.g.classList.toggle('braking', c.braking && c.v > 0.5);
        if (c.crash < t) c.g.classList.remove('crashed');
        draw(c);
      });
    }
  };

  /* The rover: chases the pointer on the grass, otherwise ambles about. */
  let onGrass = false;
  const roam = (dt, now) => {
    if (!onGrass && now > rover.idleAt) { rover.tx = 300 + Math.random() * 420; rover.ty = 528 + Math.random() * 16; rover.idleAt = now + 4000 + Math.random() * 4000; }
    const dx = rover.tx - rover.x, dy = rover.ty - rover.y, d = Math.hypot(dx, dy);
    const sp = onGrass ? 240 : 60;
    if (d > 2) {
      const k = Math.min(1, (sp * dt) / d);
      rover.x += dx * k; rover.y += dy * k;
      if (Math.abs(dx) > 3) rover.face = dx > 0 ? 1 : -1;
      roverEl.classList.remove('still');
    } else roverEl.classList.add('still');
    placeRover();
  };

  let running = false, lastT = 0, visible = true;
  const loop = (now) => {
    if (!running) return;
    const dt = Math.min(0.05, (now - (lastT || now)) / 1000); lastT = now;
    if (dt > 0) { drive(dt); if (!cur) roam(dt, now); }
    requestAnimationFrame(loop);
  };
  const go = () => { if (running || reduced || !visible) return; running = true; lastT = 0; requestAnimationFrame(loop); };
  cars.forEach(draw);
  go();

  /* ---------------------------------------------------------- the pointer */
  const layers = $$('[data-depth]', svg).map((g) => [g, +g.dataset.depth]);
  const head = $('.tw-cctv-head', svg), dish = $('.tw-dish', svg), eyes = $$('.tw-follow', svg);
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
      // Where is the pointer: sky, near the building, grass, or road?
      const road = !cur && p.y > 558, grass = !cur && !road && p.y > 486, sky = p.y < 228;
      if (road) {
        const lane = p.y < 605 ? LANES[0] : LANES[1];
        pt = { lane, x: clamp(p.x, 10, W0 - 10) };
        cone.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${lane.y + 2})`); cone.setAttribute('opacity', '1');
        stage.classList.add('on-road');
      } else { pt = null; cone.setAttribute('opacity', '0'); stage.classList.remove('on-road'); }
      onGrass = grass;
      if (grass) { rover.tx = clamp(p.x, 40, W0 - 40); rover.ty = clamp(p.y + 18, 520, 548); }
      tw.classList.toggle('sky', sky);
      tw.classList.toggle('near', !sky);
      if (sky && dish) {
        // The dish sits on the roof at (986, 210); it turns its face to the pointer.
        const a = Math.atan2(p.x - 986, 210 - p.y) * 180 / Math.PI;
        dish.style.transform = `translate(0px, -16px) rotate(${clamp(a, -70, 70).toFixed(1)}deg)`;
      } else if (dish) dish.style.transform = '';
      if (!sky && head) {
        // The camera hangs off the showroom's corner at (450, 300), looking out to the left.
        const a = Math.atan2(p.y - 300, 450 - p.x) * 180 / Math.PI;
        head.style.transform = `rotate(${clamp(-a, -75, 70).toFixed(1)}deg)`;
      } else if (head) head.style.transform = '';
      eyes.forEach((el) => {
        const r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1;
        el.style.transform = `translate(${(dx / d * 2.4).toFixed(2)}px, ${(dy / d * 2.4).toFixed(2)}px)`;
      });
    });
  });
  stage.addEventListener('pointerleave', () => {
    resetParallax();
    pt = null; onGrass = false; cone.setAttribute('opacity', '0'); stage.classList.remove('on-road');
    tw.classList.remove('sky', 'near');
    if (head) head.style.transform = '';
    if (dish) dish.style.transform = '';
    eyes.forEach((el) => { el.style.transform = ''; });
    if (!cur) { glow(null); hideLabel(); }
  });

  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    svg.classList.toggle('tw-paused', !visible);
    if (visible) go(); else running = false;
  }).observe(stage);
  addEventListener('resize', () => { if (cur) setVB(frame(zoomOf(cur), panel.classList.contains('left'))); });
  tw._cars = cars; tw._rover = rover;
})();
