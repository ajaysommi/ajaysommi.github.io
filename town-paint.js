// A few translucent passes of a loaded brush. Generate the paths once per visit.
// Each pass tapers with pressure, leaving individual bristles at its dry end.
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

  function brush(parent, length, width, bend, color, opacity) {
    const phase = between(-2, 2);
    // All filaments follow the same wrist movement. Small variations in width
    // break the edges without introducing a shimmer as the brush is revealed.
    function point(t, offset) {
      const arc = Math.sin(Math.PI * t);
      const spine = bend * arc + 0.035 * length * Math.sin(2 * Math.PI * t + phase);
      const pressure = Math.pow(Math.max(0, arc), .7) * (1.08 - .32 * t);
      const tooth = 1 + .048 * Math.sin(38 * t + phase) + .024 * Math.sin(101 * t);
      return coord(length * t) + ',' + coord(spine + offset * pressure * tooth);
    }
    function ribbon(start, end, low, high) {
      const top = [], bottom = [];
      for (let i = 0; i <= 50; i++) {
        const t = start + (end - start) * i / 50;
        top.push(point(t, high));
        bottom.push(point(t, low));
      }
      return 'M' + top.concat(bottom.reverse()).join('L') + 'Z';
    }
    path(parent, ribbon(0, 1, -width * .48, width * .48), color, opacity * .53);
    for (let i = 0; i < 18; i++) {
      const edge = between(-.57, .57) * width;
      path(parent, ribbon(between(0, .15), between(.76, 1), edge, edge + between(.008, .115) * width), color, opacity * between(.32, .86));
    }
    // A few tiny satellites of pigment, grouped around the sweep.
    for (let i = 0; i < 22; i++) {
      const t = between(.18, .92);
      const [cx, cy] = point(t, between(-.72, .75) * width).split(',');
      svg(parent, 'ellipse', { cx, cy, rx: between(.4, 2), ry: between(.35, 1.1), fill: color, opacity: opacity * between(.55, 1.4) });
    }
  }

  // Short uneven threads catch light where the warp crosses the weft.
  // One small repeat supplies both the screen and the wet paint on the bar.
  const cloth = document.createElement('canvas');
  cloth.width = cloth.height = 96;
  const ctx = cloth.getContext('2d');
  if (ctx) {
    for (let i = 0; i < 32; i++) {
      for (let j = 0; j < 32; j++) {
        const upright = (i + j) % 2 === 0;
        const x = i * 3 + between(-.5, .5), y = j * 3 + between(-.5, .5);
        ctx.fillStyle = `rgba(140,128,105,${between(.025, .13)})`;
        ctx.fillRect(x, y, upright ? 1 : between(2, 4), upright ? between(2, 4) : 1);
      }
    }
    loader.style.setProperty('--paint-linen', `url("${cloth.toDataURL()}")`);
  }

  const fieldDefs = svg(field, 'defs', {});
  const edge = svg(fieldDefs, 'linearGradient', { id: 'town-brush-edge' });
  svg(edge, 'stop', { offset: '.82', 'stop-color': 'white' });
  svg(edge, 'stop', { offset: '1', 'stop-color': 'white', 'stop-opacity': 0 });
  const mirror = Math.random() < .5;
  const composition = svg(field, 'g', { transform: mirror ? 'translate(1000 0) scale(-1 1)' : 'translate(0 0)' });
  function sweep(x, y, angle, length, width, bend, color, opacity, delay) {
    const axis = svg(composition, 'g', { transform: `translate(${x} ${y}) rotate(${angle})` });
    const id = 'town-sweep-' + delay;
    const mask = svg(fieldDefs, 'mask', { id, maskUnits: 'userSpaceOnUse', x: -5, y: -240, width: length + 10, height: 480 });
    const tip = svg(mask, 'rect', { x: -length * .3, y: -240, width: length * 1.6, height: 480, fill: 'url(#town-brush-edge)', class: 'town-brush-tip' });
    tip.style.setProperty('--brush-travel', -length * 1.3 + 'px');
    tip.style.setProperty('--brush-delay', delay + 'ms');
    tip.style.setProperty('--brush-time', Math.round(between(950, 1610)) + 'ms');
    const stroke = svg(axis, 'g', { mask: `url(#${id})` });
    brush(stroke, length, width, bend, color, opacity);
  }
  const y = between(135, 260), angle = between(-20, -8);
  sweep(-145, y, angle, between(590, 780), between(86, 138), between(30, 70), pigments[0], .17, 0);
  sweep(-90, y + between(16, 48), angle - 5, between(390, 540), 36, 46, pigments[1], .15, 140);
  const lower = between(435, 545), slant = between(147, 166);
  sweep(1090, lower, slant, between(570, 745), between(95, 150), between(-65, -25), pigments[1], .17, 70);
  sweep(1050, lower + between(12, 45), slant - 3, between(470, 650), between(20, 47), -33, glaze, .23, 220);

  // The texture sits inside each moving piece, so its painted edge follows the
  // original AJ silhouette through assembly and the flight to the navigation.
  for (const [i, part] of [...loader.querySelectorAll('.m-load-mark .mk')].entries()) {
    const silhouette = part.firstElementChild;
    const defs = svg(part, 'defs', {});
    const clip = svg(defs, 'clipPath', { id: 'town-ink-' + i });
    clip.append(silhouette.cloneNode(true));
    const surface = svg(part, 'g', { 'clip-path': `url(#town-ink-${i})`, class: 'town-ink' });
    const paint = svg(surface, 'g', { transform: 'translate(3 37) rotate(-28)', class: 'town-brush' });
    brush(paint, 61, i === 0 ? 22 : 15, -3, i === 0 ? pigments[0] : glaze, .85);
    for (let layer = 0; layer < 3; layer++) {
      const flecks = Array.from({ length: 48 }, () => `M${coord(between(9, 55))},${coord(between(8, 50))}l.62,-.14`);
      svg(surface, 'path', { d: flecks.join(''), stroke: 'var(--bg)', 'stroke-width': between(.18, .42), opacity: between(.25, .55) });
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
