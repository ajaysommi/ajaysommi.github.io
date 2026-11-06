/* ==========================================================================
   Small filled shapes, each one something from its era: floppies and
   prompts for 1983, the happy Mac and the bomb for 1991, CDs and @ signs
   for 1998, iPods and Wi-Fi for 2007, snakes and envelopes on the 2000
   phone, notes on the music player, app tiles on the touchscreen, and
   hourglasses among a little of everything on the era picker.

   SHAPES.layer() scatters a set of them as a background; SHAPES.burst()
   throws a handful out from a point.
   ========================================================================== */
window.SHAPES = (function () {
  /* 40 by 40, filled, holes by the even-odd rule. */
  const P = {
    hourglass: 'M9 4h22v4c0 6-6 9-8 12 2 3 8 6 8 12v4H9v-4c0-6 6-9 8-12-2-3-8-6-8-12z',
    clock: 'M20 3a17 17 0 1 1 0 34a17 17 0 1 1 0-34zM18.5 9v12.5l8 5 1.6-2.6-6.6-4V9z',
    calendar: 'M6 8h28v27H6zM9 18v14h22V18zM11 3h3v8h-3zM26 3h3v8h-3z',
    stopwatch: 'M20 9a14 14 0 1 1 0 28a14 14 0 1 1 0-28zM17 3h6v4h-6zM19 14v9l6-4z',
    floppy525: 'M4 4h32v32H4zM20 14a6 6 0 1 0 0 12a6 6 0 1 0 0-12zM18 29h4v6h-4z',
    cassette: 'M4 9h32v22H4zM11 15a4 4 0 1 0 0 8a4 4 0 1 0 0-8zM29 15a4 4 0 1 0 0 8a4 4 0 1 0 0-8z',
    crt: 'M5 5h30v22H5zM9 9v14h22V9zM14 29h12l2 6H12z',
    prompt: 'M5 8l12 9-12 9v-4l7-5-7-5zM19 27h16v4H19z',
    joystick: 'M18 10h4v16h-4zM20 2a5 5 0 1 1 0 10a5 5 0 1 1 0-10zM6 26h28v10H6z',
    cursor: 'M12 6h10v28H12z',
    floppy: 'M6 5h24l5 5v25H6zM11 5h16v9H11zM11 22h18v13H11z',
    happymac: 'M10 3h20v34H10zM13 6v15h14V6zM17 10h2v4h-2zM21 10h2v4h-2zM15 27h10v2H15z',
    bomb: 'M17 12a11 11 0 1 1 0 22a11 11 0 1 1 0-22zM24 11l4-4 2 2-4 4zM30 4l2-2 1.5 1.5-2 2z',
    watch: 'M14 3h12v6H14zM14 31h12v6H14zM20 9a11 11 0 1 1 0 22a11 11 0 1 1 0-22zM19 13v8h6v-2h-4v-6z',
    trash: 'M9 9h22v3H9zM16 5h8v4h-8zM11 13h18l-2 24H13z',
    brush: 'M27 4l9 9-14 14-9-9zM11 20l9 9-4 4c-3 3-9 3-11 1 3-1 2-5 6-9z',
    cd: 'M20 3a17 17 0 1 1 0 34a17 17 0 1 1 0-34zM20 15a5 5 0 1 0 0 10a5 5 0 1 0 0-10z',
    globe: 'M20 3a17 17 0 1 1 0 34a17 17 0 1 1 0-34zM20 6c-4 4-5 9-5 14s1 10 5 14c4-4 5-9 5-14s-1-10-5-14zM5 19h30v2H5z',
    at: 'M20 4a16 16 0 1 0 9 29l-1.6-2.5A13 13 0 1 1 33 20v2a3 3 0 0 1-6 0v-9h-3v1.5a7 7 0 1 0 1 9.5 6 6 0 0 0 11-3v-1A16 16 0 0 0 20 4zm0 12a4 4 0 1 1 0 8 4 4 0 0 1 0-8z',
    envelope: 'M4 9h32v22H4zM6 11l14 11 14-11z',
    puck: 'M20 4c9 0 15 6 15 16s-6 16-15 16S5 30 5 20 11 4 20 4zM19 4h2v10h-2z',
    star: 'M20 2l4.5 11.5L37 14l-9.7 8 3.3 12.5L20 27.5 9.4 34.5 12.7 22 3 14l12.5-.5z',
    bars: 'M4 30h5v6H4zM12 24h5v12h-5zM20 17h5v19h-5zM28 9h5v27h-5z',
    ipod: 'M11 3h18a3 3 0 0 1 3 3v28a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3zM12 7v11h16V7zM20 21a6.5 6.5 0 1 0 0 13a6.5 6.5 0 1 0 0-13z',
    video: 'M3 7h34v26H3zM6 14v16h28V14zM16 17l10 5-10 5z',
    wifi: 'M20 29a3.5 3.5 0 1 1 0 7a3.5 3.5 0 1 1 0-7zM10 21a14 14 0 0 1 20 0l-2.6 2.6a10.4 10.4 0 0 0-14.8 0zM4 15a22 22 0 0 1 32 0l-2.6 2.6a18.4 18.4 0 0 0-26.8 0z',
    magnifier: 'M17 4a12 12 0 1 1 0 24a12 12 0 1 1 0-24zM17 8a8 8 0 1 0 0 16a8 8 0 1 0 0-16zM25 25l3-3 9 9-3 3z',
    usb: 'M18 2h4v24h-4zM14 26h12v6l-6 6-6-6zM11 8h4v6h-4zM25 11h4v4h-4z',
    dock: 'M3 26h34l-4 8H7zM8 18h6v6H8zM17 16h6v8h-6zM26 18h6v6h-6z',
    snake: 'M4 6h22v5H4zM21 11h5v11h-5zM10 17h11v5H10zM10 22h5v10h-5zM31 14h4v4h-4z',
    candybar: 'M13 3h14a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H13a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zM13 8v11h14V8z',
    battery: 'M4 12h28v16H4zM32 16h4v8h-4zM7 15v10h18V15z',
    note: 'M14 6l18-3v22a5 5 0 1 1-3-4.6V9l-12 2v17a5 5 0 1 1-3-4.6z',
    headphones: 'M6 24a14 14 0 0 1 28 0v10h-7V24h4a11 11 0 0 0-22 0h4v10H6z',
    play: 'M12 6l22 14-22 14z',
    apps: 'M5 5h12v12H5zM23 5h12v12H23zM5 23h12v12H5zM23 23h12v12H23z',
    home: 'M20 4a16 16 0 1 1 0 32a16 16 0 1 1 0-32zM20 8a12 12 0 1 0 0 24a12 12 0 1 0 0-24zM14 14h12v12H14zM16 16v8h8v-8z',
    ripple: 'M20 14a6 6 0 1 1 0 12a6 6 0 1 1 0-12zM20 6a14 14 0 1 1 0 28a14 14 0 1 1 0-28zM20 9a11 11 0 1 0 0 22a11 11 0 1 0 0-22z',
    slide: 'M4 16h18V9l14 11-14 11v-7H4z',
    touch: 'M12 2h16a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4zM11 7v24h18V7z'
  };
  const SETS = {
    time: ['hourglass', 'clock', 'calendar', 'stopwatch', 'floppy525', 'cassette', 'happymac', 'floppy', 'cd', 'globe', 'candybar', 'ipod', 'touch'],
    1983: ['crt', 'prompt', 'floppy525', 'joystick', 'cassette', 'cursor'],
    1991: ['floppy', 'happymac', 'bomb', 'watch', 'trash', 'brush'],
    1998: ['cd', 'globe', 'at', 'envelope', 'puck', 'star', 'bars'],
    2007: ['ipod', 'video', 'wifi', 'magnifier', 'usb', 'dock'],
    nokia: ['snake', 'envelope', 'bars', 'battery', 'note', 'candybar'],
    pocket: ['note', 'cd', 'headphones', 'play', 'ipod'],
    iphone: ['apps', 'home', 'wifi', 'ripple', 'slide', 'battery', 'touch']
  };

  /* A steady pseudo-random sequence, so a layer looks the same each time. */
  const rnd = (seed) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const svg = (k, attrs) => `<svg viewBox="0 0 40 40" ${attrs}><path d="${P[k]}" fill="currentColor" fill-rule="evenodd"/></svg>`;
  /* Filled in: the openings in a shape (a CD's hole, a screen, a ring) are
     filled with a lighter wash of the same colour, every piece drawn whole
     underneath, so it reads as a solid thing with its detail still on it. */
  const solid = (k, attrs) => `<svg viewBox="0 0 40 40" ${attrs}><g opacity=".6">${P[k].split(/(?<=z)/i).filter((d) => d.trim()).map((d) => `<path d="${d.trim()}" fill="currentColor"/>`).join('')}</g><path d="${P[k]}" fill="currentColor" fill-rule="evenodd"/></svg>`;

  /* One shape to every cell of a grid shaped like the screen, placed
     somewhere in the middle of its cell: every part of the screen gets its
     share, and nothing lines up. Each turns and floats on its own clock,
     and sits at its own depth for the cursor. */
  const layer = (set, { count = 30, color = '#fff', opacity = 0.08, size = [26, 54], seed = 7, aspect = innerWidth / Math.max(1, innerHeight), filled = false } = {}) => {
    const r = rnd(seed), keys = SETS[set] || SETS.time;
    const cols = Math.max(2, Math.round(Math.sqrt(count * aspect))), rows = Math.max(2, Math.round(count / cols));
    let out = '', i = 0;
    for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++, i++) {
      const x = ((col + 0.25 + r() * 0.5) / cols) * 100, y = ((row + 0.25 + r() * 0.5) / rows) * 100;
      const s = size[0] + r() * (size[1] - size[0]), rot = Math.round(r() * 60 - 30);
      const o = (opacity * (0.7 + r() * 0.5)).toFixed(3);
      out += (filled ? solid : svg)(keys[(i * 5 + Math.floor(r() * 3)) % keys.length], `style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;width:${s.toFixed(0)}px;height:${s.toFixed(0)}px;opacity:${o};--o:${o};--tw:${(10 + Math.random() * 6).toFixed(1)}s;--twd:${(-Math.random() * 16).toFixed(1)}s;--rot:${rot}deg;--d:${(14 + r() * 14).toFixed(1)}s;--dl:${(-r() * 20).toFixed(1)}s;--z:${(0.3 + r() * 0.7).toFixed(2)}"`);
    }
    return `<div class="bg-shapes${filled ? ' is-filled' : ''}" aria-hidden="true" style="color:${color}">${out}</div>`;
  };

  /* A layer that starts empty: its shapes fly out from (x, y) one after
     another and land where they belong, with a small settle as they stick. */
  const arrive = (el, x, y, { stagger = 900 } = {}) => {
    if (!el || document.documentElement.classList.contains('reduced')) return;
    const box = el.getBoundingClientRect();
    /* Each shape is hidden outright until its turn (Safari lets a shape's
       own CSS animation show through a scripted fade's waiting time), then
       flies in from (x, y). */
    [...el.querySelectorAll('svg')].forEach((s, i) => {
      const b = s.getBoundingClientRect();
      const dx = x - (b.left + b.width / 2), dy = y - (b.top + b.height / 2);
      const o = +s.style.opacity || 0.1;
      s.style.visibility = 'hidden';
      setTimeout(() => {
        s.style.visibility = '';
        s.animate([
          { translate: `${dx}px ${dy}px`, scale: '0.3', opacity: 0 },
          { opacity: Math.min(1, o * 2), offset: 0.25 },
          { translate: '0 0', scale: '1', opacity: o }
        ], { duration: 1500 + Math.random() * 700, easing: 'cubic-bezier(.16, 1, .3, 1)' });
      }, Math.random() * stagger);
    });
    void box;
  };

  /* The cursor pushes the shapes a few pixels, nearer ones more. */
  const follow = (el) => {
    if (!el || matchMedia('(pointer: coarse)').matches) return;
    /* At most once a frame, and not at all once the layer is out of sight. */
    let x = 0, y = 0, due = 0;
    const write = () => {
      due = 0;
      el.style.setProperty('--mx', ((x / innerWidth - 0.5) * -14).toFixed(1) + 'px');
      el.style.setProperty('--my', ((y / innerHeight - 0.5) * -14).toFixed(1) + 'px');
    };
    addEventListener('pointermove', (e) => {
      if (document.documentElement.classList.contains('in-os')) return;
      x = e.clientX; y = e.clientY;
      if (!due) due = requestAnimationFrame(write);
    }, { passive: true });
  };

  /* The cursor as a solid thing moving through the layer. Each shape is a
     small round body with mass by its size: the cursor shoves the ones it
     meets out of its way, along the line between them, and drags them with
     it by its own speed, so a fast sweep throws them and a slow one nudges.
     A glancing hit sets a shape spinning. Shapes knock into each other, so
     a push travels through a crowd; each is tied to its home by a soft
     spring and slowed by the air, so they drift back and settle. When all
     are still, the loop sleeps. */
  const physics = (el, { radius = 34, active = () => true } = {}) => {
    if (!el || matchMedia('(pointer: coarse)').matches || document.documentElement.classList.contains('reduced')) return;
    el.classList.add('is-physical');
    const shapes = [...el.querySelectorAll('svg')];
    let bodies = [], mx = -1e4, my = -1e4, pmx = mx, pmy = my, cvx = 0, cvy = 0, raf = 0, last = 0, lastMove = 0;
    let ok = false;
    const measure = () => {
      const box = el.getBoundingClientRect();
      ok = box.width > 0;
      bodies = shapes.map((s, i) => {
        const old = bodies[i];
        /* Where it rests: its own place in the layer (it is drawn centred
           on its left and top), not wherever an animation has it now. */
        const w = parseFloat(s.style.width) || 30;
        return { s, hx: box.left + parseFloat(s.style.left) / 100 * box.width, hy: box.top + parseFloat(s.style.top) / 100 * box.height, r: w * 0.42, m: w * w, x: old ? old.x : 0, y: old ? old.y : 0, vx: old ? old.vx : 0, vy: old ? old.vy : 0, a: old ? old.a : 0, va: old ? old.va : 0 };
      });
    };
    const step = (t) => {
      raf = 0;
      const dt = Math.min(32, t - (last || t)) / 16.67; last = t;
      if (!active()) { last = 0; return; }
      const R = radius;
      let moving = t - lastMove < 120;
      // the cursor's speed, eased, so one jumpy event does not fling everything
      cvx += ((mx - pmx) / Math.max(dt, .5) - cvx) * .5; cvy += ((my - pmy) / Math.max(dt, .5) - cvy) * .5; pmx = mx; pmy = my;
      for (const b of bodies) {
        const px = b.hx + b.x, py = b.hy + b.y;
        const dx = px - mx, dy = py - my, d = Math.hypot(dx, dy), min = R + b.r;
        if (d < min && d > .01) {
          const nx = dx / d, ny = dy / d, push = min - d;
          b.x += nx * push; b.y += ny * push;
          // velocity of the cursor along the normal is handed over, heavier shapes take less
          /* Heavy things: a big shape takes much less of the shove than a
             small one, and nothing is thrown far. */
          const k = 420 / (420 + b.m * .9);
          const vn = Math.max(0, cvx * nx + cvy * ny);
          b.vx += nx * (Math.min(vn, 14) * .45 + push * .12) * k + cvx * .04 * k;
          b.vy += ny * (Math.min(vn, 14) * .45 + push * .12) * k + cvy * .04 * k;
          // the part of the sweep across the shape turns it, slowly
          b.va += ((cvx * -ny + cvy * nx) * .28) * k;
          moving = true;
        }
      }
      // shape against shape
      for (let i = 0; i < bodies.length; i++) {
        const A = bodies[i];
        for (let j = i + 1; j < bodies.length; j++) {
          const B = bodies[j];
          /* Two that already overlap where they rest only push when
             they are shoved closer than that. */
          const dx = (B.hx + B.x) - (A.hx + A.x), dy = (B.hy + B.y) - (A.hy + A.y), min = Math.min(A.r + B.r, Math.hypot(B.hx - A.hx, B.hy - A.hy) - .5);
          if (Math.abs(dx) > min || Math.abs(dy) > min) continue;
          const d = Math.hypot(dx, dy);
          if (d >= min || d < .01) continue;
          const nx = dx / d, ny = dy / d, over = (min - d), ma = A.m, mb = B.m, tot = ma + mb;
          A.x -= nx * over * mb / tot; A.y -= ny * over * mb / tot; B.x += nx * over * ma / tot; B.y += ny * over * ma / tot;
          const rv = (B.vx - A.vx) * nx + (B.vy - A.vy) * ny;
          if (rv < 0) { const imp = -(1 + .55) * rv / (1 / ma + 1 / mb); A.vx -= imp * nx / ma; A.vy -= imp * ny / ma; B.vx += imp * nx / mb; B.vy += imp * ny / mb; A.va -= rv * .4; B.va += rv * .4; }
        }
      }
      let energy = 0;
      for (const b of bodies) {
        // the spring home, and air
        b.vx += -b.x * .014 * dt; b.vy += -b.y * .014 * dt;
        const drag = Math.pow(.86, dt), spin = Math.pow(.88, dt);
        b.vx *= drag; b.vy *= drag; b.va *= spin;
        b.va += -b.a * .004 * dt;
        b.x += b.vx * dt; b.y += b.vy * dt; b.a += b.va * dt;
        energy = Math.max(energy, Math.abs(b.vx) + Math.abs(b.vy) + Math.abs(b.va) * .2 + (Math.abs(b.x) + Math.abs(b.y) + Math.abs(b.a) * .2) * .1);
        b.s.style.translate = `${b.x.toFixed(2)}px ${b.y.toFixed(2)}px`;
        b.s.style.rotate = `${b.a.toFixed(2)}deg`;
      }
      if (moving || energy > .04) raf = requestAnimationFrame(step);
      else last = 0;
    };
    const wake = () => { if (!raf) raf = requestAnimationFrame(step); };
    measure();
    addEventListener('resize', () => { measure(); wake(); });
    addEventListener('pointermove', (e) => {
      if (!active()) return;
      if (!ok) measure();
      if (mx < -1e3) { pmx = e.clientX; pmy = e.clientY; }
      mx = e.clientX; my = e.clientY; lastMove = performance.now();
      wake();
    }, { passive: true });
    document.addEventListener('pointerleave', () => { mx = my = pmx = pmy = -1e4; cvx = cvy = 0; });
    return { measure, wake };
  };

  /* A burst from (x, y): shapes thrown outward, turning, fading. */
  const burst = (x, y, set, { color = '#fff', count = 34, reach = 0.6 } = {}) => {
    if (document.documentElement.classList.contains('reduced')) return;
    const keys = SETS[set] || SETS.time, box = document.createElement('div');
    box.className = 'shape-burst';
    box.style.color = color;
    const far = Math.hypot(innerWidth, innerHeight) * reach;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + Math.random() * 0.4, d = far * (0.45 + Math.random() * 0.75);
      const s = 18 + Math.random() * 30;
      const el = document.createElement('i');
      el.innerHTML = svg(keys[i % keys.length], '');
      el.style.cssText = `left:${x}px;top:${y}px;width:${s}px;height:${s}px`;
      box.appendChild(el);
      el.animate([
        { transform: 'translate(-50%, -50%) scale(.2) rotate(0deg)', opacity: 0 },
        { opacity: 0.85, offset: 0.12 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d}px)) scale(${1 + Math.random() * 0.8}) rotate(${Math.random() * 300 - 150}deg)`, opacity: 0 }
      ], { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(.15,.7,.3,1)', fill: 'forwards' });
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 1500);
  };

  return { layer, burst, arrive, follow, physics, SETS };
})();
