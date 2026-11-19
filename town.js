/* ==========================================================================
   THE PATH, ON A WIDE SCREEN: what the lot does (see town.css).
   Click a part and the scene leans in on it, with its story in a card
   beside it; the arrows walk the stops in order, Esc or the x steps back.
   While the pointer is over the scene the layers drift a little with it,
   the camera on the corner follows it, and so do the robot's eyes.
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

  const D = JSON.parse($('#town-data').textContent);
  const svg = $('.tw-svg', tw), stage = $('.tw-stage', tw), panel = $('.tw-panel', tw), inner = $('.tw-panel-in', panel);
  const label = $('.tw-label', tw), prevB = $('.tw-prev', panel), nextB = $('.tw-next', panel);
  const chips = $$('.tw-chip', tw), hots = $$('.tw-hot', svg);
  const FULL = [0, 0, 1200, 640];
  let vb = FULL.slice(), anim = 0, cur = null;

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
  // Frame the part in whatever the card leaves uncovered.
  const frame = (r, left) => {
    const [x, y, w, h] = r.zoom, cx = x + w / 2, cy = y + h / 2;
    const free = 1 - (panel.offsetWidth + 28) / stage.clientWidth;
    const A = FULL[3] / FULL[2];
    let vw = w / (free * 0.86), vh = vw * A;
    if (vh < h * 1.25) { vh = h * 1.25; vw = vh / A; }
    vw = Math.min(vw, 1200); vh = vw * A;
    const vx = left ? cx - vw * (1 - free / 2) : cx - vw * (free / 2);
    const vy = clamp(cy - vh / 2, -40, 640 - vh + 40);
    return [vx, vy, vw, vh];
  };

  /* ---------------------------------------------------------- the card */
  const pic = (L, cls = '') => L[0] === L[1] ? `<img class="${cls}" src="assets/logos/opt/${L[0]}.webp" alt="" />` : `<img class="${cls} lg-d" src="assets/logos/opt/${L[0]}.webp" alt="" /><img class="${cls} lg-l" src="assets/logos/opt/${L[1]}.webp" alt="" />`;
  const initials = (n) => n.split(' ').map((w) => w[0]).join('').slice(0, 2);
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
    cur = id;
    $$('.tw-big-pic', panel).forEach((n) => n.remove());
    const [x, , w] = r.zoom;
    const left = x + w / 2 > 640;
    panel.classList.toggle('left', left);
    panel.hidden = false;
    render(r);
    requestAnimationFrame(() => { panel.classList.add('open'); tween(frame(r, left), wasOpen ? 750 : 900); });
    tw.classList.add('zoomed');
    hots.forEach((h) => h.classList.toggle('hl', h.dataset.id === id));
    chips.forEach((c) => c.classList.toggle('on', c.dataset.id === id));
    const pin = $(`.tw-pin[data-id="${id}"]`, svg); if (pin) pin.classList.add('seen');
    hideLabel();
    resetParallax();
  };
  const close = () => {
    if (!cur) return;
    cur = null;
    panel.classList.remove('open');
    setTimeout(() => { if (!cur) panel.hidden = true; }, 360);
    tween(FULL, 800);
    tw.classList.remove('zoomed');
    hots.forEach((h) => h.classList.remove('hl'));
    chips.forEach((c) => c.classList.remove('on'));
  };

  hots.forEach((h) => h.addEventListener('click', (e) => { e.stopPropagation(); open(h.dataset.id); }));
  chips.forEach((c) => {
    c.addEventListener('click', () => { open(c.dataset.id); stage.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' }); });
    c.addEventListener('mouseenter', () => { if (!cur) hots.forEach((h) => h.classList.toggle('hl', h.dataset.id === c.dataset.id)); });
    c.addEventListener('mouseleave', () => { if (!cur) hots.forEach((h) => h.classList.remove('hl')); });
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
      label.style.setProperty('--tint', r.tint);
      label.innerHTML = `<b>’${String(r.year).slice(2)}</b>${esc(r.school ? 'University of Florida' : r.short)}`;
      const pin = $(`.tw-pin[data-id="${r.id}"]`, svg).getBoundingClientRect(), s = stage.getBoundingClientRect();
      label.style.left = (pin.left + pin.width / 2 - s.left) + 'px';
      label.style.top = (pin.top - s.top) + 'px';
      label.classList.add('on');
    });
    h.addEventListener('mouseleave', hideLabel);
  });

  /* ---------------------------------------------------------- the pointer */
  // Layers drift with the pointer; the camera and the robot's eyes follow it.
  const layers = $$('[data-depth]', svg).map((g) => [g, +g.dataset.depth]);
  const head = $('.tw-cctv-head', svg), eyes = $$('.tw-follow', svg);
  const toSVG = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
  const resetParallax = () => layers.forEach(([g]) => { g.style.transform = ''; });
  let praf = 0, last = null;
  stage.addEventListener('pointermove', (e) => {
    last = e;
    if (praf) return;
    praf = requestAnimationFrame(() => {
      praf = 0;
      const e = last, s = stage.getBoundingClientRect();
      const nx = (e.clientX - s.left) / s.width - 0.5, ny = (e.clientY - s.top) / s.height - 0.5;
      if (!cur && !reduced) layers.forEach(([g, d]) => { g.style.transform = `translate(${(-nx * d).toFixed(2)}px, ${(-ny * d * 0.5).toFixed(2)}px)`; });
      const p = toSVG(e);
      if (head) {
        // The camera is mounted at (518, 392) and looks out to the left.
        const a = Math.atan2(p.y - 392, 504 - p.x) * 180 / Math.PI;
        tw.classList.add('tracking');
        head.style.transform = `rotate(${clamp(-a, -75, 15).toFixed(1)}deg)`;
      }
      eyes.forEach((el) => {
        const r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1;
        el.style.transform = `translate(${(dx / d * 2.2).toFixed(2)}px, ${(dy / d * 2.2).toFixed(2)}px)`;
      });
    });
  });
  stage.addEventListener('pointerleave', () => {
    resetParallax();
    tw.classList.remove('tracking'); if (head) head.style.transform = '';
    eyes.forEach((el) => { el.style.transform = ''; });
  });

  // Nothing moves while the lot is off screen.
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { svg.style.setProperty('--run', e.isIntersecting ? 'running' : 'paused'); svg.classList.toggle('tw-paused', !e.isIntersecting); }).observe(stage);
  addEventListener('resize', () => { if (cur) { const r = D.roles[cur]; setVB(frame(r, panel.classList.contains('left'))); } });
})();
