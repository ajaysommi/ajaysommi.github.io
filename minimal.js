/* ==========================================================================
   Minimal: the field moves
   Design experiment, with minimal.css. Drives the abstract field behind the
   page with three things, all written onto the ground (.bg):

     --mx, --my   where the cursor is, -1 to 1 across the window, eased
                  slowly so the field drifts after the pointer. Also written
                  onto the hero, whose shape tiles drift with it.
     --fade       0 at the top, 1 once the hero has scrolled away, so the
                  field steps back behind the content.
     data-scene   the section being read. minimal.css gives each one its own
                  arrangement and the shapes glide and morph between them.

   Only the ground's and the hero's own small subtrees restyle when these
   change, never the whole page. The cursor loop stops as soon as it has
   settled, and the scene only changes when the section does. With reduced
   motion the cursor and the scenes are ignored: the field holds its first
   arrangement and only fades.
   ========================================================================== */
(function minimalField() {
  const ground = document.querySelector('.bg');
  if (!ground) return;
  const hero = document.getElementById('heroCard');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');

  /* ---- cursor --------------------------------------------------------- */
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  let lastX = '', lastY = '';

  const frame = () => {
    raf = 0;
    x += (tx - x) * 0.05;
    y += (ty - y) * 0.05;
    if (Math.abs(tx - x) < 0.002) x = tx;
    if (Math.abs(ty - y) < 0.002) y = ty;
    const mx = x.toFixed(3), my = y.toFixed(3);
    if (mx !== lastX) { ground.style.setProperty('--mx', mx); hero?.style.setProperty('--mx', mx); lastX = mx; }
    if (my !== lastY) { ground.style.setProperty('--my', my); hero?.style.setProperty('--my', my); lastY = my; }
    if (x !== tx || y !== ty) raf = requestAnimationFrame(frame);
  };
  const wake = () => { if (!raf) raf = requestAnimationFrame(frame); };

  addEventListener('pointermove', (e) => {
    if (reduce.matches || !fine.matches || e.pointerType !== 'mouse') return;
    tx = (e.clientX / innerWidth) * 2 - 1;
    ty = (e.clientY / innerHeight) * 2 - 1;
    wake();
  }, { passive: true });

  // Leaving the window lets the field settle back to centre.
  document.addEventListener('pointerout', (e) => {
    if (!e.relatedTarget) { tx = 0; ty = 0; wake(); }
  });

  /* ---- scroll: fade and scene ------------------------------------------ */
  const scenes = [
    ['hero', '.hero'],
    ['logos', '#logos'],
    ['path', '#experience'],
    ['education', '#education'],
    ['projects', '#projects'],
    ['skills', '#skills'],
    ['recs', '#recs'],
    ['contact', '#contact'],
  ].map(([name, sel]) => [name, document.querySelector(sel)]).filter(([, el]) => el);

  let lastFade = '', scene = '', ticking = false;

  const onScroll = () => {
    ticking = false;
    // Faded fully once the first screen has gone by.
    const fade = Math.min(1, Math.max(0, scrollY / (innerHeight * 0.85))).toFixed(3);
    if (fade !== lastFade) { ground.style.setProperty('--fade', fade); lastFade = fade; }

    if (reduce.matches || !scenes.length) return;
    // The section whose top has passed the middle of the screen.
    let now = scenes[0][0];
    const mid = innerHeight * 0.5;
    for (const [name, el] of scenes) {
      if (el.getBoundingClientRect().top <= mid) now = name;
      else break;
    }
    // The last section is too short to reach the middle; the end of the
    // page counts as arriving in it.
    if (scrollY >= document.documentElement.scrollHeight - innerHeight - 4) now = scenes[scenes.length - 1][0];
    if (now !== scene) { scene = now; ground.dataset.scene = now; }
  };

  const request = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  };
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request, { passive: true });
  onScroll();
})();
