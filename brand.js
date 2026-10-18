/* ==========================================================================
   The home mark in the nav, on every page
   Pressing it plays the loading screen's assembly again: the A rises, the
   hook swings in, the stem grows and the dot drops on. On desktop it also
   notices the pointer: within reach it leans a little toward it and its eye
   (the blue dot) shifts a touch further, never leaving its own spot, and a
   press pushes it in with the eye shut until the assembly reopens it.
   ========================================================================== */
(function brandMark() {
  const link = document.querySelector('header.nav .brand');
  const mark = link && link.querySelector('.brand-mark');
  if (!mark) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  // The class comes off when the dot lands, so a second press replays it.
  link.addEventListener('click', () => {
    if (reduce.matches) return;
    mark.classList.remove('is-assembling');
    void mark.offsetWidth;   // restart the animation from the top
    mark.classList.add('is-assembling');
    const dot = mark.querySelector('.brand-aj circle');
    if (dot) dot.addEventListener('animationend', () => mark.classList.remove('is-assembling'), { once: true });
  });

  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  if (!fine.matches || reduce.matches) return;

  const REACH = 150;     // px from the mark's centre where it starts to notice
  const LEAN = 1.8;      // px the whole mark leans, at most
  const LOOK = 1.1;      // how far the eye shifts, at most, in the mark's own units
  let raf = 0, px = -9999, py = -9999;
  const look = () => {
    raf = 0;
    const r = mark.getBoundingClientRect();
    const dx = px - (r.left + r.width / 2), dy = py - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy);
    const k = d < REACH ? 1 - d / REACH : 0;
    const ux = d ? dx / d : 0, uy = d ? dy / d : 0;
    const e = Math.min(1, k * 1.5);
    mark.style.setProperty('--lean-x', `${(ux * k * LEAN).toFixed(2)}px`);
    mark.style.setProperty('--lean-y', `${(uy * k * LEAN).toFixed(2)}px`);
    mark.style.setProperty('--eye-x', `${(ux * e * LOOK).toFixed(2)}px`);
    mark.style.setProperty('--eye-y', `${(uy * e * LOOK).toFixed(2)}px`);
  };
  addEventListener('pointermove', (ev) => {
    if (ev.pointerType !== 'mouse') return;
    px = ev.clientX; py = ev.clientY;
    if (!raf) raf = requestAnimationFrame(look);
  }, { passive: true });
  document.addEventListener('pointerleave', () => { px = py = -9999; if (!raf) raf = requestAnimationFrame(look); });

  link.addEventListener('pointerdown', (ev) => {
    if (ev.pointerType === 'mouse' && ev.button === 0) mark.classList.add('is-pressed');
  });
  const release = () => mark.classList.remove('is-pressed');
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((t) => link.addEventListener(t, release));
  mark.classList.add('has-eye');
})();
