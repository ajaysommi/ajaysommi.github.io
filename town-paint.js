// Print a new valley study on the opening paper each visit.
(() => {
  const paper = document.querySelector('.town-paint-paper');
  if (!paper || !matchMedia('(min-width: 720px)').matches) return;
  const loader = paper.parentElement;
  if (loader.matches('.is-flying, .is-done')) return;
  const field = paper.querySelector('svg');
  const between = (a, b) => a + Math.random() * (b - a);
  const svg = (parent, tag, attributes) => {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
    parent.append(node);
    return node;
  };
  const path = (parent, d, fill, opacity) => svg(parent, 'path', { d, fill, opacity });
  const coord = n => n.toFixed(2);
  const pigments = ['var(--paint-moss)', 'var(--paint-water)', 'var(--paint-clay)', 'var(--paint-ochre)'];
  if (Math.random() < 0.5) [pigments[0], pigments[1]] = [pigments[1], pigments[0]];
  const glaze = pigments[Math.random() < 0.5 ? 2 : 3];

  // A tile of cotton rag paper. Crossing threads have a lit and a shadowed
  // edge, interspersed with pulp and a few longer fibres. Draw it only once.
  const cloth = document.createElement('canvas');
  cloth.width = cloth.height = 192;
  const ctx = cloth.getContext('2d');
  if (ctx) {
    const grain = ctx.createImageData(192, 192);
    for (let i = 0; i < grain.data.length; i += 4) {
      const shade = Math.random() < .5 ? 48 : 247;
      grain.data[i] = shade;
      grain.data[i + 1] = shade - 4;
      grain.data[i + 2] = shade - 12;
      grain.data[i + 3] = between(0, 22);
    }
    ctx.putImageData(grain, 0, 0);
    for (let y = 0; y < 192; y += 3) {
      for (let x = 0; x < 192; x += 3) {
        const warp = (x + y) % 6 === 0;
        const start = between(-.5, .5), length = between(1.6, 3.4);
        ctx.fillStyle = 'rgba(87,72,52,.11)';
        ctx.fillRect(x + start, y, warp ? .7 : length, warp ? length : .7);
        ctx.fillStyle = 'rgba(255,243,216,.11)';
        ctx.fillRect(x + start + .7, y + .7, warp ? .7 : length, warp ? length : .7);
      }
    }
    for (let i = 0; i < 94; i++) {
      const x = between(0, 192), y = between(0, 192);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 2, y - 1, x + between(3, 9), y + between(-2, 1));
      ctx.lineWidth = between(.35, .8);
      ctx.strokeStyle = 'rgba(141,123,91,.17)';
      ctx.stroke();
    }
    loader.style.setProperty('--paint-linen', `url("${cloth.toDataURL()}")`);
  }

  // The slope is shared by all ink layers within a corner. Spacing varies
  // along the slope so the lowland, ridge and bank separate and meet again.
  function relief(parent, width, height, inks) {
    const bend = between(-.12, .12), phase = between(0, 2 * Math.PI);
    const drift = between(.09, .17);
    function shore(t, level) {
      const envelope = Math.sin(Math.PI * t);
      const x = width * (t + .10 * envelope * Math.sin(2 * Math.PI * t + phase));
      const y = height * (1 - t + envelope * (bend + drift * Math.sin(2 * Math.PI * t) + .045 * Math.sin(5 * Math.PI * t + phase)));
      return [level * x, level * y + (1 - level) * height * .16 * envelope * Math.sin(3 * Math.PI * t + phase)];
    }
    const pair = ([x, y]) => coord(x) + ' ' + coord(y);
    function line(level, start = 0, end = 1) {
      const pts = Array.from({ length: 27 }, (_, i) => shore(start + (end - start) * i / 26, level));
      let d = 'M' + pair(pts[0]);
      for (let i = 1; i < pts.length - 1; i++) {
        const [x, y] = pts[i], next = pts[i + 1];
        d += 'Q' + pair(pts[i]) + ' ' + pair([(x + next[0]) / 2, (y + next[1]) / 2]);
      }
      return d + 'L' + pair(pts[pts.length - 1]);
    }
    function rule(level, start, end, ink, opacity, weight) {
      svg(parent, 'path', { d: line(level, start, end), fill: 'none', stroke: ink,
        opacity, 'stroke-width': weight, 'stroke-linecap': 'round', pathLength: 1, class: 'town-contour' });
    }
    [1, .79, .57].forEach((level, i) => {
      path(parent, line(level) + ' L0 0Z', inks[i], [.38, .46, .47][i]);
      rule(level, .03, .96, inks[i], .50, .8);
    });
    // Short contours and a broken line of sunlit ink, like the marks on the
    // mountain faces and meadow in the scene. Leave clear paper between them.
    rule(1.045, .08, .54, inks[1], .38, .8);
    rule(1.045, .565, .71, inks[1], .32, .8);
    rule(.85, .25, .89, 'var(--paint-highlight)', .70, 1.3);
    rule(.61, .06, .41, 'var(--paint-highlight)', .64, .9);
    for (let i = 0; i < 65; i++) {
      const [x, y] = shore(between(.05, .95), between(.27, .97));
      svg(parent, 'path', { d: `M${coord(x)} ${coord(y)}q1.4 -.6 ${coord(between(1.6, 5))} -1.4`,
        stroke: i % 3 ? inks[2] : 'var(--paint-highlight)', opacity: between(.22, .53), fill: 'none',
        'stroke-width': between(.65, 1.45), 'stroke-linecap': 'round' });
    }
  }
  const flip = Math.random() < .5;
  const print = svg(field, 'g', { transform: flip ? 'translate(1000 0) scale(-1 1)' : 'translate(0 0)' });
  const ridge = svg(print, 'g', { transform: 'translate(1000 0) scale(-1 1)' });
  const ridgeLayers = svg(ridge, 'g', { class: 'town-relief' });
  relief(ridgeLayers, between(470, 700), between(210, 318), ['var(--paint-distance)', 'var(--paint-ridge)', 'var(--paint-water)']);
  const meadow = svg(print, 'g', { transform: 'translate(0 700) scale(1 -1)' });
  const meadowLayers = svg(meadow, 'g', { class: 'town-relief' });
  meadowLayers.style.setProperty('--print-delay', '120ms');
  relief(meadowLayers, between(540, 750), between(215, 345), ['var(--paint-meadow)', 'var(--paint-wood)', 'var(--paint-moss)']);

  // Cut a small landscape into the A. Its hills and firs are deliberately
  // broad enough to read at the mark's final size. Leave the dot solid.
  const ridgeShift = between(-1.1, 1.1).toFixed(2);
  for (const [i, part] of [...loader.querySelectorAll('.m-load-mark .mk:not(.mk-dot)')].entries()) {
    const silhouette = part.firstElementChild;
    const defs = svg(part, 'defs', {});
    const clip = svg(defs, 'clipPath', { id: 'town-ink-' + i });
    clip.append(silhouette.cloneNode(true));
    const surface = svg(part, 'g', { 'clip-path': `url(#town-ink-${i})`, class: 'town-ink' });
    const print = svg(surface, 'g', { class: 'town-brush' });
    if (part.classList.contains('mk-a')) {
      const hills = svg(print, 'g', { transform: `translate(${ridgeShift} 0)` });
      path(hills, 'M6 8H48V46H6Z', 'var(--paint-distance)', .78);
      path(hills, 'M6 28L18 24 23 25 30 19 35 22 39 21 48 26V46H6Z', 'var(--paint-water)', 1);
      path(hills, 'M6 36Q15 35 22 30T34 27Q41 26 48 23V46H6Z', 'var(--paint-wood)', 1);
      path(hills, 'M6 42Q14 37 22 37T38 31L48 30V46H6Z', '#344e49', 1);
      // Two uneven tiers and a short trunk, like the pines on the street.
      const fir = 'M0 0l-1.3 3.4 .7-.3-1.3 2.6 1.6-.4v1.1h.6V5.3l1.5.4-1.3-2.6 .7.3Z';
      for (const [x, y, scale] of [[16.6, 36, .72], [19.5, 32.8, 1.02], [22.4, 34.1, .64], [38.2, 26.7, .86]]) {
        svg(hills, 'path', { d: fir, fill: '#344e49', transform: `translate(${x} ${y}) scale(${scale})` });
      }
      path(hills, 'M26 22.7L30 19l2.8 1.7-2.6-.7Z', 'var(--paint-highlight)', .75);
    } else if (part.classList.contains('mk-j')) {
      // A warm bank along the foot of the J, with two little grass tufts.
      path(print, 'M24 40Q31 44 37 43T47 39L54 38V52H24Z', '#bd5236', 1);
      svg(print, 'path', { d: 'M34 44.6l-.6-1.2m.6 1.2 .8-1.5m9.6-.6 .7-1.1', fill: 'none',
        stroke: 'var(--paint-highlight)', 'stroke-width': .38, 'stroke-linecap': 'round', opacity: .8 });
    } else {
      path(print, 'M42 34L47 31.5 49 32 54 28.6V38H42Z', 'var(--paint-water)', .60);
    }
  }

  // Match the straight wet stroke to the curved one at the instant it bends.
  const smile = loader.querySelector('.m-load-smile');
  const defs = svg(smile, 'defs', {});
  const gradient = svg(defs, 'linearGradient', { id: 'town-smile-ink', gradientUnits: 'userSpaceOnUse', x1: 0, x2: 152, y1: 0, y2: 0 });
  [pigments[0], pigments[1], glaze].forEach((color, i) => {
    svg(gradient, 'stop', { offset: i / 2, 'stop-color': color });
    loader.style.setProperty('--stroke-' + i, color);
  });
  loader.classList.add('town-painted');
})();
