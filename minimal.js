/* ==========================================================================
   Minimal: the field moves
   Design experiment, with minimal.css. Writes three numbers onto the page's
   ground and the hero, and the stylesheet turns them into a small shift of
   each layer of abstract shapes, by depth:

     --mx, --my   where the cursor is, -1 to 1 across the window, eased so
                  the field drifts after the pointer rather than jumping
     --sy         how far down the page you are, -1 to 1, so phones, which
                  have no cursor, still see the field move a little

   Only those two elements' own small subtrees restyle per frame, never the
   whole page, and the loop stops the moment everything has settled. With
   reduced motion nothing moves at all.
   ========================================================================== */
(function minimalField() {
  const ground = document.querySelector('.bg');
  if (!ground) return;
  const hero = document.getElementById('heroCard');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');

  let tx = 0, ty = 0, x = 0, y = 0, sy = 0, raf = 0;
  const last = { mx: '', my: '', sy: '' };

  const write = () => {
    const mx = x.toFixed(3), my = y.toFixed(3), s = sy.toFixed(3);
    if (mx !== last.mx) { ground.style.setProperty('--mx', mx); hero?.style.setProperty('--mx', mx); last.mx = mx; }
    if (my !== last.my) { ground.style.setProperty('--my', my); hero?.style.setProperty('--my', my); last.my = my; }
    if (s !== last.sy) { ground.style.setProperty('--sy', s); last.sy = s; }
  };

  const frame = () => {
    raf = 0;
    x += (tx - x) * 0.07;
    y += (ty - y) * 0.07;
    if (Math.abs(tx - x) < 0.0015) x = tx;
    if (Math.abs(ty - y) < 0.0015) y = ty;
    write();
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

  const onScroll = () => {
    if (reduce.matches) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    sy = max > 0 ? (scrollY / max) * 2 - 1 : 0;
    wake();
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
