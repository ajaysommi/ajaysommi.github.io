// Print a new valley study on the opening paper each visit. Only the logo uses
// wet brushwork. The surrounding landforms use flat inks like the town scene.
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
