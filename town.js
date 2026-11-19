/* ==========================================================================
   AROUND THE BLOCK: what the street does (see town.css).
   Hover anything and everything that belongs to that place glows. Click and
   the scene leans in, the story in a card beside it; arrows walk the stops
   in order, Esc or the x steps back. The pointer: the Robotics For All
   rover comes over when it's near its corner (and keeps its distance), the
   Renaissance Jax robot drives over and locks its camera on it, the corner
   camera follows it near the building, and the dish on the roof follows it
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
  const W0 = 1200, H0 = 600, FULL = [0, 0, W0, H0];
  let vb = FULL.slice(), anim = 0, cur = null;
  const nameOf = (r) => (r.school ? 'University of Florida' : r.short);
  const yy = (r) => `’${String(r.year).slice(2)}`;

  /* ---------------------------------------------------------- the two robots */
  // Each lives in its own patch of lawn and never leaves it.
  const bots = {
    rfa: { el: $('.tw-rover', svg), flip: $('.tw-rover-flip', svg), pin: $('.tw-pin[data-id="rfa"]', svg), x: 1150, y: 556, tx: 1150, ty: 556, face: -1, idleAt: 0, box: [1012, 1172, 536, 566], reach: 110, keep: 46, pinDy: -78, speed: 150 },
    rjax: { el: $('.tw-frc', svg), flip: $('.tw-frc-flip', svg), pin: $('.tw-pin[data-id="rjax"]', svg), x: 340, y: 560, tx: 340, ty: 560, face: 1, idleAt: 0, box: [292, 392, 548, 584], reach: 150, keep: 70, pinDy: -48, speed: 120 }
  };
  const placeBot = (b) => {
    b.el.setAttribute('transform', `translate(${b.x.toFixed(1)} ${b.y.toFixed(1)})`);
    b.flip.setAttribute('transform', `scale(${b.face} 1)`);
    b.pin.setAttribute('transform', `translate(${b.x.toFixed(1)} ${(b.y + b.pinDy).toFixed(1)})`);
  };
  Object.values(bots).forEach(placeBot);
  // The competition robot's camera: on its target, or on the pointer when close.
  const turret = $('.tw-turret', svg), vision = $('.tw-vision', svg), reticle = $('.tw-reticle', svg);
  const TARGET = [424, 511];
  let aim = TARGET.slice();
  const aimCam = () => {
    const b = bots.rjax, cx = b.x + 13 * b.face, cy = b.y - 28;
    let a = Math.atan2(aim[1] - cy, (aim[0] - cx) * b.face) * 180 / Math.PI;
    a = clamp(a, -55, 55);
    turret.setAttribute('transform', `translate(13 -28) rotate(${a.toFixed(1)})`);
    const ex = cx + 7 * b.face * Math.cos(a * Math.PI / 180), ey = cy + 7 * Math.sin(a * Math.PI / 180);
    vision.setAttribute('d', `M${ex.toFixed(1)} ${ey.toFixed(1)} L${aim[0].toFixed(1)} ${aim[1].toFixed(1)}`);
    reticle.setAttribute('transform', `translate(${aim[0].toFixed(1)} ${aim[1].toFixed(1)})`);
  };
  aimCam();

  /* ---------------------------------------------------------- where things are */
  const pinOf = (id) => (bots[id] ? [bots[id].x, bots[id].y + bots[id].pinDy] : D.pin[id]);
  const zoomOf = (id) => (bots[id] ? [bots[id].x - 120, bots[id].y - 110, 240, 150] : D.roles[id].zoom);

  /* ---------------------------------------------------------- glow */
  // Everything that belongs to a place lights together.
  let lit = null;
  const glow = (id) => {
    if (lit === id) return;
    lit = id;
    hots.forEach((h) => { h.style.filter = id && h.dataset.id === id ? `url(#twGlow-${id})` : ''; });
  };
  // Generous, invisible hit areas, so a small move doesn't drop the hover
  // in the gaps between a thing's parts.
  const skip = $$('.tw-nohit', svg);
  skip.forEach((n) => { n.style.display = 'none'; });
  hots.forEach((h) => {
    const parts = h.firstElementChild && h.firstElementChild.tagName === 'g' ? [...h.firstElementChild.children] : [...h.children];
    const hit = document.createElementNS(NS, 'g');
    hit.setAttribute('class', 'tw-hit');
    parts.forEach((p) => {
      let b; try { b = p.getBBox(); } catch (e) { return; }
      if (!b || b.width * b.height === 0) return;
      const r = document.createElementNS(NS, 'rect');
      r.setAttribute('x', b.x - 4); r.setAttribute('y', b.y - 4); r.setAttribute('width', b.width + 8); r.setAttribute('height', b.height + 8);
      hit.appendChild(r);
    });
    h.insertBefore(hit, h.firstChild);
  });
  skip.forEach((n) => { n.style.display = ''; });

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
    const z = zoomOf(id), left = z[0] + z[2] / 2 > W0 / 2;
    panel.classList.toggle('left', left);
    panel.hidden = false;
    render(r);
    requestAnimationFrame(() => { panel.classList.add('open'); tween(frame(z, left), wasOpen ? 750 : 900); });
    tw.classList.add('zoomed');
    glow(null);
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
  const layers = $$('[data-depth]', svg).map((g) => [g, +g.dataset.depth]);
  const head = $('.tw-cctv-head', svg), dish = $('.tw-dish', svg), eyes = $$('.tw-follow', svg);
  const toSVG = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
  const resetParallax = () => layers.forEach(([g]) => { g.style.transform = ''; });
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
    const dx = b.tx - b.x, dy = b.ty - b.y, d = Math.hypot(dx, dy), sp = near ? b.speed : b.speed * 0.3;
    if (d > 1.5) {
      const k = Math.min(1, (sp * dt) / d);
      b.x += dx * k; b.y += dy * k;
    }
    // Face the pointer when it's close, otherwise the way it's going.
    if (near) b.face = ptr.x >= b.x ? 1 : -1; else if (Math.abs(dx) > 3) b.face = dx > 0 ? 1 : -1;
    b.el.classList.toggle('still', d <= 1.5);
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
      aim = [aim[0] + (want[0] - aim[0]) * Math.min(1, dt * 8), aim[1] + (want[1] - aim[1]) * Math.min(1, dt * 8)];
      aimCam();
    }
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
      const e = lastE, s = stage.getBoundingClientRect();
      const nx = (e.clientX - s.left) / s.width - 0.5, ny = (e.clientY - s.top) / s.height - 0.5;
      if (!cur && !reduced) layers.forEach(([g, d]) => { g.style.transform = `translate(${(-nx * d).toFixed(2)}px, ${(-ny * d * 0.4).toFixed(2)}px)`; });
      const p = toSVG(e);
      ptr = { x: p.x, y: p.y };
      const sky = p.y < 206;
      tw.classList.toggle('sky', sky);
      tw.classList.toggle('near', !sky);
      if (sky && dish) {
        // The dish sits on the roof at (986, 212); it turns its face to the pointer.
        const a = Math.atan2(p.x - 986, 212 - p.y) * 180 / Math.PI;
        dish.style.transform = `translate(0px, -16px) rotate(${clamp(a, -70, 70).toFixed(1)}deg)`;
      } else if (dish) dish.style.transform = '';
      if (!sky && head) {
        // The camera hangs off the showroom's corner at (452, 352), looking out to the left;
        // it turns only as far as its mount allows.
        const a = Math.atan2(p.y - 352, 452 - p.x) * 180 / Math.PI;
        head.style.transform = `rotate(${clamp(-a, -60, 25).toFixed(1)}deg)`;
      } else if (head) head.style.transform = '';
      eyes.forEach((el) => {
        const r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1;
        el.style.transform = `translate(${(dx / d * 2.4).toFixed(2)}px, ${(dy / d * 2.4).toFixed(2)}px)`;
      });
    });
  });
  stage.addEventListener('pointerleave', () => {
    resetParallax();
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
  addEventListener('resize', () => { if (cur) setVB(frame(zoomOf(cur), panel.classList.contains('left'))); });
  tw._bots = bots;
})();
