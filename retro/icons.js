/* ==========================================================================
   Icons, drawn the way they were drawn then: one pixel at a time on a 16 by
   16 grid. Each is a little bitmap below, turned into a crisp SVG on demand.
     # ink   o paper   . clear   g grey   b blue   r orange   y yellow   G green
   ========================================================================== */
window.ICONS = (function () {
  const C = { '#': '#000', o: '#fff', g: '#9b9b9b', b: '#3d68ff', r: '#ff6b35', y: '#f2c94c', G: '#2fae5a', d: '#555' };

  const B = {
    folder: [
      '................',
      '................',
      '..#####.........',
      '.#ooooo#........',
      '.#ooooo#######..',
      '.#oooooooooooo#.',
      '.##############.',
      '.#oooooooooooo#.',
      '.#oooooooooooo#.',
      '.#oooooooooooo#.',
      '.#oooooooooooo#.',
      '.#oooooooooooo#.',
      '.#oooooooooooo#.',
      '.#oooooooooooo#.',
      '.##############.',
      '................'
    ],
    doc: [
      '..########......',
      '..#oooooo##.....',
      '..#oooooo#o#....',
      '..#oooooo#oo#...',
      '..#oooooo####...',
      '..#ooooooooo#...',
      '..#o######oo#...',
      '..#ooooooooo#...',
      '..#o#######o#...',
      '..#ooooooooo#...',
      '..#o####oooo#...',
      '..#ooooooooo#...',
      '..#o######oo#...',
      '..#ooooooooo#...',
      '..###########...',
      '................'
    ],
    resume: [
      '..########......',
      '..#oooooo##.....',
      '..#oooooo#o#....',
      '..#orrroo#oo#...',
      '..#orrroo####...',
      '..#orrrooooo#...',
      '..#ooooooooo#...',
      '..#o#######o#...',
      '..#ooooooooo#...',
      '..#o####oooo#...',
      '..#ooooooooo#...',
      '..#o######oo#...',
      '..#ooooooooo#...',
      '..#o####oooo#...',
      '..###########...',
      '................'
    ],
    hd: [
      '................',
      '................',
      '................',
      '................',
      '.##############.',
      '.#oooooooooooo#.',
      '.#o##########o#.',
      '.#oooooooooooo#.',
      '.#oooooooooGGo#.',
      '.#oooooooooooo#.',
      '.##############.',
      '..#..........#..',
      '................',
      '................',
      '................',
      '................'
    ],
    trash: [
      '................',
      '......####......',
      '..############..',
      '..#oooooooooo#..',
      '..############..',
      '...##########...',
      '...#oo#oo#oo#...',
      '...#oo#oo#oo#...',
      '...#oo#oo#oo#...',
      '...#oo#oo#oo#...',
      '...#oo#oo#oo#...',
      '...#oo#oo#oo#...',
      '...#oo#oo#oo#...',
      '...#oo#oo#oo#...',
      '...##########...',
      '................'
    ],
    trashFull: [
      '.....#o#o#......',
      '....#oo#oo#.....',
      '..############..',
      '..#oooooooooo#..',
      '..############..',
      '...##########...',
      '..#oo#oo#oo#o#..',
      '...#oo#oo#oo#...',
      '...#oo#oo#oo#...',
      '...#oo#oo#oo#...',
      '...#oo#oo#oo#...',
      '...#oo#oo#oo#...',
      '...#oo#oo#oo#...',
      '...#oo#oo#oo#...',
      '...##########...',
      '................'
    ],
    mail: [
      '................',
      '................',
      '................',
      '.##############.',
      '.##oooooooooo##.',
      '.#o#oooooooo#o#.',
      '.#oo#oooooo#oo#.',
      '.#ooo#oooo#ooo#.',
      '.#oooo####oooo#.',
      '.#oooooooooooo#.',
      '.#ooooooooorro#.',
      '.##############.',
      '................',
      '................',
      '................',
      '................'
    ],
    book: [
      '................',
      '................',
      '..############..',
      '..#b#oooooooo#..',
      '..#b#oooooooo#..',
      '..#b#o######o#..',
      '..#b#oooooooo#..',
      '..#b#oo####oo#..',
      '..#b#oooooooo#..',
      '..#b#oooooooo#..',
      '..#b#oooooooo#..',
      '..#b#oooooooo#..',
      '..#b#oooooooo#..',
      '..############..',
      '...###########..',
      '................'
    ],
    app: [
      '................',
      '.......##.......',
      '......#oo#......',
      '.....#oooo#.....',
      '....#oobboo#....',
      '...#oobbbboo#...',
      '..#oobbbbbboo#..',
      '.#oobbbbbbbboo#.',
      '.#oorrrrrrrroo#.',
      '..#oorrrrrroo#..',
      '...#oorrrroo#...',
      '....#oorroo#....',
      '.....#oooo#.....',
      '......#oo#......',
      '.......##.......',
      '................'
    ],
    photo: [
      '................',
      '................',
      '.##############.',
      '.#oooooooooooo#.',
      '.#oooooooooyyo#.',
      '.#oooooooooyyo#.',
      '.#oooo#ooooooo#.',
      '.#ooo###oooooo#.',
      '.#oo#####oo#oo#.',
      '.#o##########o#.',
      '.#oooooooooooo#.',
      '.##############.',
      '................',
      '................',
      '................',
      '................'
    ],
    term: [
      '................',
      '................',
      '.##############.',
      '.#oooooooooooo#.',
      '.#o##########o#.',
      '.#o#G########o#.',
      '.#o##G#######o#.',
      '.#o#G##GGG###o#.',
      '.#o##########o#.',
      '.#o##########o#.',
      '.#oooooooooooo#.',
      '.##############.',
      '....########....',
      '...##########...',
      '................',
      '................'
    ],
    globe: [
      '................',
      '.....######.....',
      '...##bbbbbb##...',
      '..#bbGGbbbbbb#..',
      '.#bbGGGGbbbbbb#.',
      '.#bGGGGGGbbbbb#.',
      '#bbbGGGGbbbGGbb#',
      '#bbbbGGbbbGGGGb#',
      '#bbbbGGbbbbGGGb#',
      '#bbbbbGbbbbGGbb#',
      '.#bbbbbbbbbGbb#.',
      '.#bbbbbbbbbbbb#.',
      '..#bbbbbbbbbb#..',
      '...##bbbbbb##...',
      '.....######.....',
      '................'
    ],
    cap: [
      '................',
      '................',
      '................',
      '.......##.......',
      '.....##oo##.....',
      '...##oooooo##...',
      '.##oooooooooo##.',
      '#oooooooooooooo#',
      '.##oooooooooo##.',
      '...##oooooo##.#.',
      '...#o##oo##o#.#.',
      '...#oooooooo#.#.',
      '...#oooooooo#yy.',
      '....########....',
      '................',
      '................'
    ],
    wrench: [
      '..........##.##.',
      '.........#o#.#o#',
      '.........#oo#oo#',
      '..........#oooo#',
      '.........#ooo##.',
      '........#ooo#...',
      '.......#ooo#....',
      '......#ooo#.....',
      '.....#ooo#......',
      '....#ooo#.......',
      '...#ooo#........',
      '..#ooo#.........',
      '.#oo#oo#........',
      '.#o#.#o#........',
      '.#oo#oo#........',
      '..####..........'
    ],
    chip: [
      '................',
      '................',
      '...#.#.#.#.#....',
      '..############..',
      '###oooooooooo###',
      '..#oooooooooo#..',
      '###oo######oo###',
      '..#oo#bbbb#oo#..',
      '###oo#bbbb#oo###',
      '..#oo######oo#..',
      '###oooooooooo###',
      '..#oooooooooo#..',
      '..############..',
      '...#.#.#.#.#....',
      '................',
      '................'
    ],
    note: [
      '................',
      '..###########...',
      '..#o#o#o#o#o#...',
      '..###########...',
      '..#yyyyyyyyy#...',
      '..#y#######y#...',
      '..#yyyyyyyyy#...',
      '..#y#####yyy#...',
      '..#yyyyyyyyy#...',
      '..#y######yy#...',
      '..#yyyyyyyyy#...',
      '..#y####yyyy#...',
      '..#yyyyyyyyy#...',
      '..###########...',
      '................',
      '................'
    ],
    puzzle: [
      '................',
      '................',
      '.#############..',
      '.#ooo#ooo#ooo#..',
      '.#obo#ooo#oro#..',
      '.#ooo#ooo#ooo#..',
      '.#############..',
      '.#ooo#ooo#ooo#..',
      '.#ooo#obo#ooo#..',
      '.#ooo#ooo#ooo#..',
      '.#############..',
      '.#ooo#ooo#ggg#..',
      '.#oro#ooo#ggg#..',
      '.#ooo#ooo#ggg#..',
      '.#############..',
      '................'
    ],
    floppy: [
      '................',
      '.##############.',
      '.#o#ggggggg#oo#.',
      '.#o#gg##ggg#oo#.',
      '.#o#gg##ggg#oo#.',
      '.#o#ggggggg#oo#.',
      '.#o#########oo#.',
      '.#oooooooooooo#.',
      '.#o##########o#.',
      '.#o#oooooooo#o#.',
      '.#o#o#####oo#o#.',
      '.#o#oooooooo#o#.',
      '.#o#o####ooo#o#.',
      '.#o#oooooooo#o#.',
      '.##############.',
      '................'
    ],
    person: [
      '................',
      '.....######.....',
      '....#oooooo#....',
      '...#oooooooo#...',
      '...#oo#oo#oo#...',
      '...#oooooooo#...',
      '...#o#oooo#o#...',
      '...#oo####oo#...',
      '....#oooooo#....',
      '.....######.....',
      '...##########...',
      '..#oooooooooo#..',
      '.#oooooooooooo#.',
      '.#oooooooooooo#.',
      '.##############.',
      '................'
    ],
    egg: [
      '................',
      '................',
      '......####......',
      '.....#oooo#.....',
      '....#oooooo#....',
      '...#oooooooo#...',
      '...#oorroooo#...',
      '..#oooooobboo#..',
      '..#oooooooooo#..',
      '..#obboooorro#..',
      '..#oooooooooo#..',
      '...#oooooooo#...',
      '....##oooo##....',
      '......####......',
      '................',
      '................'
    ],
    mac: [
      '................',
      '...##########...',
      '...#oooooooo#...',
      '...#o######o#...',
      '...#o#oooo#o#...',
      '...#o#o#o##o#...',
      '...#o#oooo#o#...',
      '...#o######o#...',
      '...#oooooooo#...',
      '...#oo###ooo#...',
      '...#oooooooo#...',
      '...##########...',
      '...#oooooooo#...',
      '...##########...',
      '................',
      '................'
    ],
    alert: [
      '.......##.......',
      '......#oo#......',
      '......#oo#......',
      '.....#oooo#.....',
      '.....#o##o#.....',
      '....#oo##oo#....',
      '....#oo##oo#....',
      '...#ooo##ooo#...',
      '...#ooo##ooo#...',
      '..#oooo##oooo#..',
      '..#oooooooooo#..',
      '.#ooooo##ooooo#.',
      '.#ooooo##ooooo#.',
      '#oooooooooooooo#',
      '################',
      '................'
    ],
    bomb: [
      '..........#.#...',
      '...........#....',
      '.........##.#...',
      '........#.......',
      '.....####.......',
      '.....####.......',
      '...########.....',
      '..##o#######....',
      '.##o#########...',
      '.#o##########...',
      '.############...',
      '.############...',
      '.############...',
      '..##########....',
      '...########.....',
      '.....####.......'
    ]
  };

  const cache = {};
  /* Runs of one colour on a row become one rect, so even a busy icon is a
     handful of shapes. */
  const svg = (name, size = 32, extra = '') => {
    const key = name + size + extra;
    if (cache[key]) return cache[key];
    const rows = B[name] || B.doc;
    let rects = '';
    rows.forEach((row, y) => {
      let x = 0;
      while (x < 16) {
        const ch = row[x] || '.';
        let n = 1;
        while (x + n < 16 && (row[x + n] || '.') === ch) n++;
        if (ch !== '.' && C[ch]) rects += `<rect x="${x}" y="${y}" width="${n}" height="1" fill="${C[ch]}"/>`;
        x += n;
      }
    });
    return (cache[key] = `<svg class="px-ico ${extra}" viewBox="0 0 16 16" width="${size}" height="${size}" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`);
  };

  /* The AJ mark, the menu that every machine's top left corner opens. */
  const mark = (size = 16, mono = false) => `<svg class="aj-mark" viewBox="9 8.5 45 42" width="${size}" height="${size}" aria-hidden="true"><path d="M10.29 44.57 L30.86 9.90 L43.20 32.70 L43.20 36.19 L36.19 36.19 L30.86 26.67 L20.19 44.57Z" fill="currentColor"/><path d="M26.25 36.19 A13.16 13.16 0 0 0 52.57 36.19 L43.83 36.19 A4.42 4.42 0 0 1 34.99 36.19Z" fill="${mono ? 'currentColor' : '#ff6b35'}"/><rect x="43.83" y="24.60" width="8.74" height="11.79" fill="${mono ? 'currentColor' : '#3d68ff'}"/><circle cx="48.20" cy="17.40" r="5.60" fill="${mono ? 'currentColor' : '#3d68ff'}"/></svg>`;

  /* The speaker in each menu bar: sound on, or crossed out. */
  const spk = (muted) => `<svg viewBox="0 0 16 16" width="16" height="16" shape-rendering="crispEdges" aria-hidden="true"><path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor"/>${muted ? '<path d="M11 6l4 4M15 6l-4 4" stroke="currentColor" stroke-width="1.4"/>' : '<path d="M11 5.5q2 2.5 0 5M13 4q3.5 4 0 8" fill="none" stroke="currentColor" stroke-width="1.2"/>'}</svg>`;

  /* The AJ mark as screens draw it: the pixel version from the loader
     (window.AJ_PX). Hardware keeps the smooth mark above; anything shown
     on a pixel screen uses this. 'mono' draws every pixel in the screen's
     own ink, for one colour displays. */
  const PXC = { '#': 'currentColor', b: '#3d68ff', r: '#ff6b35' };
  const pxmark = (size = 16, mono = false) => {
    const rows = window.AJ_PX || [];
    let rects = '';
    rows.forEach((row, y) => {
      let x = 0;
      while (x < 16) {
        const ch = row[x] || '.';
        let n = 1;
        while (x + n < 16 && (row[x + n] || '.') === ch) n++;
        if (PXC[ch]) rects += `<rect x="${x}" y="${y}" width="${n}" height="1" fill="${mono ? 'currentColor' : PXC[ch]}"/>`;
        x += n;
      }
    });
    return `<svg class="aj-mark aj-px" viewBox="0 0 16 16" width="${size}" height="${size}" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
  };

  return { svg, mark, pxmark, spk, names: Object.keys(B) };
})();
