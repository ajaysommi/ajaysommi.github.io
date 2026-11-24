/* Builds the desktop scene for the work history (the block between the
   "town:start" and "town:end" markers in index.html): one block of a small
   town where every place I've worked has a spot. A Toyota dealership in the
   middle, with Hunter's alignment rack in its service bay; a JM Family car
   hauler backing up to it; the FICS lab on the corner; Shiva's billboard, the
   Renaissance Jax robot and the Robotics For All rover out on the lawn;
   ADT's sign and camera by the showroom; the UF pond.
   Facts come from retro/content.js; the stories here are told a little more
   plainly (see STORY).
   On a wide screen it is the whole page: it fills the window and scrolls
   sideways (town.css, town.js).
   Run: node tools/build-town.js */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const window = {};
const src = fs.readFileSync(path.join(root, 'retro/content.js'), 'utf8');
new Function('window', src.slice(0, src.indexOf('/* Small helpers every machine shares. */')))(window);
const P = window.PORTFOLIO;
const { STORY, ABOUT, PROJ_TEXT } = require('./copy.js');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const has = (f) => fs.existsSync(path.join(root, f));
const big = (s) => { for (const k of ['-800', '-960']) { const f = s.replace(/-(400|480)\.webp$/, k + '.webp'); if (f !== s && has(f)) return f; } return s; };

const TINT = { vc: '#19633a', tm: '#8b5cf6', rjax: '#1fd12a', shiva: '#2f7fb5', rfa: '#f2b705', fics: '#fa4616', toyota: '#eb0a1e', jm: '#00857c', hunter: '#d0202e', adt: '#1f6fd1', edu: '#0021a5' };
const LOGO = { rfa: ['roboticsforall', 'roboticsforall'], fics: ['fics', 'fics-light'], toyota: ['toyota', 'toyota-light'], jm: ['jm-family', 'jm-family-light'], hunter: ['hunter', 'hunter-light'], adt: ['adt', 'adt'], shiva: ['shiva', 'shiva'], rjax: ['renaissance-jax', 'renaissance-jax'] };

/* Each story, told plainly: what changed because of the work, then how. */


/* The block is wider now (it fills the window and scrolls sideways), so
   each place keeps its drawing and is moved along the street by OFF. */
/* Everything from the visitor center east is drawn in its own coordinates
   and slid back west by EAST, so the gap after the dealership stays short. */
const EAST = 320;
// The UF corner grew (a bigger Malachowsky Hall, more room around the bus
// stop), so the home and everything past it moves east by SH.
const SH = 280;
const WORLD = 5180 + SH - EAST;
const HOME = 2850 - EAST;   // the visitor center, where the street starts
const OFF = { edu: -EAST, fics: -EAST, shiva: 230, rjax: 330, toyota: 700, hunter: 700, adt: 700, vc: -EAST, tm: -EAST };
// The home (the house, the garage and the bench) sits east of Malachowsky Hall,
// drawn in its own coordinates and slid along by HOMESH.
const HOMESH = 700 + SH;
// The truck waits a little way up the street and backs in once you get near.
const TRUCK_WAIT = 110;

/* What each place is, for anyone who hasn't heard of it. */


/* East of the visitor center: what I've built.
   First the garage: my Civic out front, steaming, and beside it a wide
   workbench with everything else I've opened up (the MacBook, the Arduino,
   the dead hard drive, the pencil soldering iron, the self opening lid,
   the old laptop, the dehumidifier). Each is its own stop; the stories are
   the real ones from retro/content.js. */
const OC = Object.fromEntries(P.offclock.map((o) => [o.id, o]));
const EL = OC.electronics.steps;
const BENCH = [
  { id: 'p-civic', name: 'My Civic', tint: '#2b4bb3', zoom: [3528, 440, 214, 96], pin: [3655, 458] },
  { id: 'p-macbook', name: 'MacBook', tint: '#8a8f99', zoom: [3757, 418, 120, 66], pin: [3817, 449] },
  { id: 'p-lcd', name: 'Arduino', tint: '#0ea5e9', step: [0], title: 'My first Arduino circuit', zoom: [3790, 418, 120, 66], pin: [3850, 446] },
  { id: 'p-drive', name: 'Hard drive', tint: '#64748b', step: [1], title: 'The dead hard drive', zoom: [3821, 418, 120, 66], pin: [3881, 453] },
  { id: 'p-iron', name: 'Pencil iron', tint: '#f59e0b', step: [2], title: 'The homemade soldering iron', zoom: [3856, 418, 120, 66], pin: [3916, 453] },
  { id: 'p-lid', name: 'Auto lid', tint: '#14b8a6', step: [5, 6], role: 'Off the clock · a college group project', title: 'The self-opening toilet lid', zoom: [3900, 418, 120, 66], pin: [3960, 450] },
  { id: 'p-oldlap', name: 'Old laptop', tint: '#475569', step: [4], badge: 'Try', role: 'Off the clock · an experiment, just for fun', title: 'The smallest OS I could find', zoom: [3936, 418, 120, 66], pin: [3996, 449] },
  { id: 'p-dehum', name: 'Dehumidifier', tint: '#38bdf8', step: [3], role: 'Off the clock · a teardown', title: 'Why did the dehumidifier stop?', zoom: [3971, 418, 120, 66], pin: [4031, 438] }
];
/* Then the software, each as a real thing around the house: the balanced
   tree is a topiary trimmed into a perfect binary tree, the marketplace is a
   yard sale out front, the language is chalked on a sidewalk sign, the
   betting model is the game on the living room TV, the file system is the
   filing cabinet in the garage, and the crash analysis is a crash test dummy
   resting against a stack of tires past the bench. Drawn in project() below;
   the cards use the real write ups from retro/content.js. */
const PROJECTS = [
  { id: 'p-avl', src: ['projects', 'avl'], name: 'BalanceTree', tint: '#65a30d', zoom: [3312, 372, 116, 124], pin: [3366, 398] },
  { id: 'p-gatorgoods', src: ['projects', 'gatorgoods'], name: 'GatorGoods', tint: '#fa4616', zoom: [3354, 474, 128, 104], pin: [3408, 504] },
  { id: 'p-sommiscript', src: ['projects', 'sommiscript'], name: 'SommiScript', tint: '#f59e0b', zoom: [3436, 508, 72, 60], pin: [3470, 522] },
  { id: 'p-betai', src: ['projects', 'betai'], name: 'BetAI', tint: '#16a34a', zoom: [3388, 368, 88, 76], pin: [3434, 392] },
  { id: 'p-wadfs', src: ['projects', 'wadfs'], name: 'WAD FS', tint: '#7c3aed', zoom: [3546, 404, 84, 84], pin: [3579, 430] },
  { id: 'p-crash', src: ['projects', 'crash'], name: 'Crash Analysis', tint: '#dc2626', zoom: [4086, 424, 100, 80], pin: [4130, 448] }
];
PROJECTS.forEach((p) => { TINT[p.id] = p.tint; OFF[p.id] = HOMESH - EAST; });
BENCH.forEach((p) => { TINT[p.id] = p.tint; OFF[p.id] = HOMESH - EAST; });
TINT.recs = '#a68154'; OFF.recs = HOMESH - EAST;

/* Where each stop is: the box the scene leans in to, and its pin. */
const SPOT = {
  shiva: { zoom: [196, 186, 190, 110], pin: [290, 196] },
  rjax: { zoom: null, pin: null },
  rfa: { zoom: null, pin: null },
  edu: { zoom: [3480, 236, 860, 330], pin: [4060, 470] },
  jm: { zoom: [410, 292, 644, 240], pin: [524, 420] },
  toyota: { zoom: [456, 200, 450, 290], pin: [640, 230] },
  hunter: { zoom: [902, 330, 236, 160], pin: [1020, 360] },
  fics: { zoom: [3352, 360, 210, 176], pin: [3425, 398] },
  adt: { zoom: [548, 334, 110, 180], pin: [610, 424] },
  vc: { zoom: [2560, 280, 580, 230], pin: [2960, 290] },
  recs: { zoom: [3700, 507, 180, 115], pin: [3791, 548] },
  tm: { zoom: [5040 + SH, 400, 120, 100], pin: null },
  ...Object.fromEntries(BENCH.map((p) => [p.id, { zoom: p.zoom, pin: p.pin }])),
  ...Object.fromEntries(PROJECTS.map((p) => [p.id, { zoom: p.zoom, pin: p.pin }]))
};
/* How the jobs lead into each other, for each card. */
const LINKS = [
  ['rjax', 'shiva', 'Building a competition robot led to helping a robotics academy reach families.'],
  ['shiva', 'rfa', 'Not affiliated, but similar work: both teach kids robotics, and at both I helped families find classes and sign up.'],
  ['fics', 'edu', 'FICS is UF’s cybersecurity research institute.'],
  ['fics', 'jm', 'What I learned testing AI at FICS carried over to setting up GPT agents at JM.'],
  ['fics', 'adt', 'Studying how AI fails at FICS fed into designing an AI check at ADT.'],
  ['jm', 'toyota', 'Southeast Toyota is a JM Family company; its trucks deliver the new cars to dealerships like this one.'],
  ['toyota', 'hunter', 'Toyota’s tire data came from Hunter machines, which I later built software for.']
];

const roles = P.experience.map((e) => ({
  id: e.id, org: e.org, short: e.short, role: e.role, when: e.when, where: e.where, year: e.year,
  text: STORY[e.id] || e.text, about: ABOUT[e.id] || '', stats: e.stats, tags: e.tags, photos: e.photos.map(big), logo: LOGO[e.id] || null, tint: TINT[e.id]
}));
const E = P.education;
roles.push({ id: 'edu', org: E.school, short: 'UF', role: `${E.degree}, ${E.college}`, when: E.when, where: 'Gainesville, FL', year: 2026, text: E.text, about: '', stats: [], tags: E.tags, photos: [], logo: null, gator: E.logo, tint: TINT.edu, school: true });
const HELLO = [
  'Hi, I’m Ajay Sommi, a software engineer, and this is Sommiville. Thanks for stopping by, and make yourself at home.',
  'I’m a Gator, a proud University of Florida graduate, and I’m happiest when I’m figuring out how something works, usually by opening it up to look inside.',
  'Wander around, poke at whatever catches your eye, and say hi if you’d like.'
];
roles.push({ id: 'vc', org: 'Welcome to Sommiville', short: 'Visitor center', badge: 'Start', role: P.name, when: '', where: '', text: HELLO.join(' '), lines: HELLO, quote: P.quote, about: '', stats: [], tags: [], photos: [big(P.photo), 'assets/images/offclock/kid-2006-640.webp'], logo: null, tint: TINT.vc, postcard: true });
const ORGLOGO = { 'JM Family': LOGO.jm, 'Hunter Engineering': LOGO.hunter, 'Southeast Toyota': LOGO.toyota, 'Robotics For All': LOGO.rfa };
roles.push({ id: 'recs', org: 'Kind words', short: 'Mailbox', badge: 'Mail', role: '', when: '', where: '', text: '', about: '', stats: [], tags: [], photos: [], logo: null, tint: TINT.recs, letters: P.recs.map(([n, o, q]) => [n, o, q, ORGLOGO[o] ? ORGLOGO[o][1] : '']), linkedin: P.linkedin });
roles.push({ id: 'tm', org: 'Time machine', short: 'A strange portal', badge: '1977', role: '', when: '', where: '', text: '', about: '', stats: [], tags: [], photos: [], logo: null, tint: TINT.tm, special: true });
const stepsOf = (list) => list.map(([f, t, c]) => [big(f), t, c]);
BENCH.forEach((p) => {
  const base = { id: p.id, short: p.name, badge: 'Fix', when: '', where: '', about: '', stats: [], tags: [], photos: [], logo: null, tint: p.tint };
  if (p.id === 'p-civic') roles.push({ ...base, org: OC.civic.title, role: 'Off the clock · my Civic', text: OC.civic.lede, steps: stepsOf(OC.civic.steps) });
  else if (p.id === 'p-macbook') roles.push({ ...base, org: OC.macbook.title, role: 'Off the clock · my 2011 MacBook Pro', text: OC.macbook.lede, steps: stepsOf(OC.macbook.steps) });
  else {
    const st = p.step.map((k) => EL[k]);
    roles.push({ ...base, badge: p.badge || base.badge, org: p.title, role: p.role || 'Off the clock · learning electronics', about: p.id === 'p-lcd' ? OC.electronics.lede : '', text: st.map((x) => x[2]).join(' '), photos: st.map((x) => big(x[0])) });
  }
});
PROJECTS.forEach((p) => {
  const s = P[p.src[0]].find((q) => q.id === p.src[1]) || {};
  roles.push({ id: p.id, org: s.full, short: p.name, badge: 'Build', role: s.kind, when: s.stack, where: '', text: PROJ_TEXT[p.src[1]] || s.text, about: '', stats: [], tags: String(s.stack || '').split(' / '), photos: s.shot ? [big(s.shot)] : [], logo: null, tint: p.tint, url: s.url || '' });
});
const order = roles.map((r) => r.id);
const guideGroups = [
  ['Around town', ['vc', 'edu', 'tm']],
  ['Work history', [...P.experience].reverse().map(job => job.id)],
  ['Software projects', PROJECTS.map(project => project.id)],
  ['At the workbench', BENCH.map(project => project.id)]
];
const guideOptions = guideGroups.map(([group, stops]) => `<optgroup label="${esc(group)}">
  ${stops.map(id => {
    const stop = roles.find(role => role.id === id);
    return `<option value="${id}">${esc(stop.school ? stop.org : stop.short)}</option>`;
  }).join('')}
</optgroup>`).join('');

/* ---------------------------------------------------------------- drawing */
const img = (id, x, y, w, h, cls = '') => {
  const [d, l] = LOGO[id];
  const one = (f, c) => `<image class="${c}" href="assets/logos/opt/${f}.webp" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`;
  return d === l ? one(d, cls) : one(d, `${cls} tw-lg-d`) + one(l, `${cls} tw-lg-l`);
};
const pic = (f, x, y, w, h, cls = '') => `<image class="${cls}" href="assets/images/town/${f}.webp" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMax meet"/>`;
// Expansion joints across a walk (a trapezoid, top edge to bottom edge), a slab every so often.
const slabs = (tl, tr, br, bl, step = 13) => {
  const n = Math.max(1, Math.round((bl[1] - tl[1]) / step)); let d = '';
  for (let i = 1; i < n; i++) { const t = i / n, y = tl[1] + (bl[1] - tl[1]) * t, x0 = tl[0] + (bl[0] - tl[0]) * t, x1 = tr[0] + (br[0] - tr[0]) * t; d += `M${x0.toFixed(1)} ${y.toFixed(1)} H${x1.toFixed(1)} `; }
  return `<path d="${[tl, tr, br, bl].map((p, i) => (i ? 'L' : 'M') + p.join(' ')).join(' ')} Z" fill="url(#twConcrete)" class="tw-nohit"/><path d="${d}" class="tw-joint tw-nohit"/>`;
};
const pothole = (x, y, s = 1) => `<g class="tw-nohit" transform="translate(${x} ${y}) scale(${s})"><path d="M-8 0 q1 -2.4 5 -2.6 q4 -.6 7.4 .4 q4 .8 3.4 2.4 q-.8 2 -6 2.2 q-5.6 .4 -8.4 -.6 q-1.8 -.6 -1.4 -1.8 z" class="tw-ph-rim"/><path d="M-6 .1 q1 -1.6 4.4 -1.7 q3.4 -.4 6 .3 q3 .6 2.4 1.6 q-.8 1.3 -4.8 1.4 q-4.4 .2 -6.6 -.4 q-1.6 -.5 -1.4 -1.2 z" class="tw-ph-hole"/><circle cx="-9.6" cy="1.4" r=".5" class="tw-gravel"/><circle cx="9.4" cy="-.6" r=".4" class="tw-gravel"/><circle cx="6.6" cy="2.6" r=".35" class="tw-gravel"/></g>`;

const hot = (id, inner) => `<g class="tw-hot" data-id="${id}" style="--tint:${TINT[id]}">${inner}</g>`;
const { definitions: landscapeDefs, tree, bush, pine, distantWoods } = require('./town-landscape');
/* Where the grass meets the sky: never a ruler line. A bumpy edge with
   tufts along it, and over the lawn, clumps of grass and wildflowers. */
let gseed = 11;
const grnd = () => ((gseed = (gseed * 16807) % 2147483647) / 2147483647);
const grassEdge = () => {
  let d = `M-800 480 L-800 ${470}`, x = -800;
  while (x < WORLD + 800) {
    const step = 5 + grnd() * 12, y = 467.5 + grnd() * 4.5;
    if (grnd() < 0.3) { d += ` L${(x + step * 0.3).toFixed(1)} ${(y - 3 - grnd() * 4).toFixed(1)} L${(x + step * 0.5).toFixed(1)} ${(y + 1).toFixed(1)} L${(x + step * 0.7).toFixed(1)} ${(y - 2 - grnd() * 3).toFixed(1)}`; }
    x += step; d += ` Q${(x - step / 2).toFixed(1)} ${(y - 2.4).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d + ` L${WORLD + 800} 480 Z`;
};
const lawn = () => {
  const tufts = [], flowers = [];
  for (let i = 0; i < 420; i++) {
    const x = -200 + grnd() * (WORLD + 400), y = 492 + grnd() * 104, k = 0.7 + grnd() * 0.7;
    tufts.push(`M${x.toFixed(1)} ${y.toFixed(1)} l${(-2 * k).toFixed(1)} ${(-5 * k).toFixed(1)} M${x.toFixed(1)} ${y.toFixed(1)} l${(0.4 * k).toFixed(1)} ${(-6.4 * k).toFixed(1)} M${x.toFixed(1)} ${y.toFixed(1)} l${(2.4 * k).toFixed(1)} ${(-4.6 * k).toFixed(1)}`);
  }
  for (let i = 0; i < 150; i++) {
    const x = -200 + grnd() * (WORLD + 400), y = 496 + grnd() * 100;
    const size = (.65 + grnd() * .4).toFixed(2);
    const colour = ['#f9f0d3', '#edba62', '#e2948a', '#b295bb'][Math.floor(grnd() * 4)];
    flowers.push(`<use href="#twDaisy" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${size})" style="--c:${colour}"/>`);
  }
  return `<path d="${tufts.join(' ')}" class="tw-tuft"/><g class="tw-flowers">${flowers.join('')}</g>`;
};
/* A big red gift bow (the picture) up on the hood, clear of the grille. */
const bow = (cx, cy, w) => `<image href="assets/images/town/bow.webp" x="${(cx - w / 2).toFixed(1)}" y="${(cy - w * 0.799 * 0.6).toFixed(1)}" width="${w.toFixed(1)}" height="${(w * 0.799).toFixed(1)}" class="tw-bow"/>`;
/* The projects, as things around the house (see PROJECTS). Each is its
   own stop; they're placed in the home's own coordinates. */
const PROJ = {
  // A topiary trimmed into a perfectly balanced binary tree, a spirit level
  // hung on its trunk to prove it.
  'p-avl': () => {
    const L1 = [[3348, 425], [3384, 425]], L2 = [[3339, 447], [3357, 447], [3375, 447], [3393, 447]];
    return hot('p-avl', `<g>
      <ellipse cx="3366" cy="491" rx="24" ry="3.6" class="tw-mulch"/>
      <path d="M3366 491 V402 M3366 404 L3348 425 M3366 404 L3384 425 M3348 425 L3339 447 M3348 425 L3357 447 M3384 425 L3375 447 M3384 425 L3393 447" class="tw-avl-br"/>
      <path d="M3365.1 487q1-8 .5-13m-.4-10 .8-16m-16.1-22 8-11m20 11-6.5-9" fill="none" stroke="#be986c" stroke-width=".8" stroke-linecap="round"/>
      ${[...L2, ...L1, [3366, 402]].map(([x,y],i) => `<use href="#twTopiaryArt" transform="translate(${x} ${y}) scale(${i < 4 ? .85 : i < 6 ? .96 : 1.08})" class="tw-avl-n"/>`).join('')}
      <path d="M3366 466 v4" class="tw-avl-str"/><rect x="3353" y="470" width="26" height="5" rx="1.4" class="tw-level"/><rect x="3362.6" y="471.2" width="6.8" height="2.6" rx="1.3" class="tw-level-v"/><ellipse cx="3366" cy="472.5" rx="1.6" ry="1" class="tw-level-b"/>
    </g>`);
  },
  // A yard sale on the lawn: a striped umbrella, a table of odds and ends
  // with price tags, a cardboard sign.
  'p-gatorgoods': () => hot('p-gatorgoods', `<g>
      <ellipse cx="3412" cy="563" rx="30" ry="3" class="tw-carshadow"/>
      <path d="M3412 561 V503" class="tw-umbpole"/>
      <path d="M3386 513 Q3412 490 3438 513 Q3432 510.6 3425 513 Q3418.5 510.4 3412 513 Q3405.5 510.4 3399 513 Q3392 510.6 3386 513 Z" class="tw-umb-o"/>
      <path d="M3412 499.6 Q3404 505 3399 513 Q3405.5 510.4 3412 513 Z M3412 499.6 Q3420 505 3425 513 Q3431.8 510.6 3438 513 Q3426 501 3412 499.6 Z" class="tw-umb-b"/>
      <path d="M3386 513q6.4-2.2 13 0 6.3-2.2 13 0 6.3-2.2 13 0 6.3-2.2 13 0v2q-6.2-1.8-13 .1-6.3-2-13-.1-6.3-2.1-13 0-6.3-2-13 .1z" fill="#a66c4d"/>
      <path d="M3410.9 500.7q-7.3 4.9-11.8 11.2m13-11.3q7.7 5.7 12 11.1" fill="none" stroke="#f8d7a1" stroke-width=".65" opacity=".7"/>
      <circle cx="3412" cy="499.4" r="1.4" class="tw-umbtop"/>
      <rect x="3392" y="535" width="4.4" height="11" rx=".6" fill="#2b6fe0"/><rect x="3396.6" y="537" width="3.6" height="9" rx=".6" fill="#e9952f"/><rect x="3400.4" y="539" width="5" height="7" rx=".6" fill="#f2efe6"/>
      <path d="M3410 546 v-7 M3407 539 h6 l-1.4 -5 h-3.2 z" class="tw-gg-lamp"/>
      <path d="M3418 546 h7 v-6 h-7 z M3425 541.4 q2.6 0 2.6 2 q0 2 -2.6 2" class="tw-gg-mug"/>
      <circle cx="3432" cy="541.6" r="4.4" class="tw-gg-ball"/><path d="M3427.8 541.6 h8.4 M3432 537.2 q-2.4 4.4 0 8.8 M3432 537.2 q2.4 4.4 0 8.8" class="tw-gg-seam"/>
      ${[[3398, 533], [3411, 535], [3423, 537]].map(([x, y]) => `<path d="M${x} ${y} l2.2 -2.6" class="tw-gg-str"/><rect x="${x + 1.4}" y="${y - 5.8}" width="4.6" height="3.2" rx=".5" class="tw-gg-tag" transform="rotate(-18 ${x + 3.7} ${y - 4.2})"/>`).join('')}
      <rect x="3388" y="546" width="48" height="3.4" rx="1" class="tw-gg-top"/>
      <path d="M3391 549 l-1.6 13 M3433 549 l1.6 13" class="tw-gg-leg"/>
      <rect x="3392" y="549.4" width="40" height="8" rx=".8" class="tw-gg-banner"/>
      <text x="3412" y="555.2" class="tw-gg-t" text-anchor="middle">GATOR GOODS</text>
      <g transform="rotate(-8 3446 562)"><rect x="3439" y="547" width="16" height="13" rx="1" class="tw-gg-card"/><text x="3447" y="555.6" class="tw-gg-sale" text-anchor="middle">SALE</text></g>
    </g>`),
  // A chalkboard sign by the front walk, with a little of the language on it.
  'p-sommiscript': () => hot('p-sommiscript', `<g>
      <ellipse cx="3470" cy="563" rx="19" ry="2.2" class="tw-carshadow"/>
      <path d="M3454 563 L3461 522 M3486 563 L3479 522" class="tw-aframe"/>
      <rect x="3455" y="521" width="30" height="33" rx="1.8" class="tw-chalkfr"/>
      <rect x="3457" y="523" width="26" height="29" rx=".9" class="tw-chalk"/>
      <text x="3470" y="529.6" class="tw-chalk-h" text-anchor="middle">SommiScript</text>
      <path d="M3457.8 552.8h24.4m-24.4 1.2h5" stroke="#efd4a3" stroke-width=".5"/><path d="M3461 553h4m1.1 0h1.7" stroke="#f3e9d1" stroke-width=".95" stroke-linecap="round"/>
      <path d="M3460 531.6 h20" class="tw-chalk-l"/>
      <text x="3460" y="536.8" class="tw-chalk-t">let x = 6 * 7</text>
      <text x="3460" y="541.6" class="tw-chalk-t">say x</text>
      <text x="3460" y="546.6" class="tw-chalk-t tw-chalk-o">› 42</text>
      <path d="M3474.6 544.4 q1.8 1.8 3.6 0 M3475.2 541.8 h.01 M3477.6 541.8 h.01" class="tw-chalk-l"/>
    </g>`),
  // The game on the living room TV, with the model's odds up in the corner.
  'p-betai': () => hot('p-betai', `<g>
      <rect x="3414" y="404" width="48" height="36" rx="1.6" class="tw-livwin"/>
      <rect x="3414" y="404" width="48" height="36" rx="1.6" fill="url(#twTvGlow)" class="tw-tvglow"/>
      <rect x="3423" y="410.6" width="30" height="19" rx="1.2" class="tw-tv"/>
      <rect x="3424.4" y="412" width="27.2" height="16.2" class="tw-tvscr"/>
      <path d="M3424.4 420.1 h27.2 M3438 412 v16.2 M3431.2 412 v16.2 M3444.8 412 v16.2" class="tw-tvline"/>
      <circle cx="3438" cy="420.1" r="2.4" class="tw-tvline"/>
      <circle cx="3433" cy="423.6" r=".9" class="tw-tvp a"/><circle cx="3442.6" cy="417.2" r=".9" class="tw-tvp b"/><circle cx="3436.4" cy="415.8" r=".7" class="tw-tvball"/>
      <rect x="3425.2" y="412.8" width="11.4" height="4.2" rx=".6" class="tw-tvbug"/><text x="3426.2" y="416.1" class="tw-tvodds">62%</text>
      <g class="tw-tvbars">${[0, 1, 2].map((k) => `<rect x="${3445.6 + k * 1.9}" y="${413 + k * 0.8}" width="1.2" height="${3.8 - k * 0.8}" style="--i:${k}"/>`).join('')}</g>
      <rect x="3436.4" y="429.6" width="3.2" height="2.6" class="tw-tvstand"/><rect x="3427" y="432" width="22" height="8" rx=".8" class="tw-tvcab"/>
      <g class="tw-tvlcd" clip-path="url(#twTvScr)"><rect x="3424.4" y="412" width="27.2" height="16.2" class="tw-tvlcd-bleed"/>${[[3428, '#ff2bd6'], [3431.6, '#29f0ff'], [3440.2, '#3dff6e'], [3446, '#fff']].map(([x, c]) => `<rect x="${x}" y="412" width=".7" height="16.2" fill="${c}" class="tw-tvlcd-bar"/>`).join('')}<g class="tw-tvlcd-cr"></g></g>
      <path d="M3414 404 h7 q-2.4 18 1 36 h-8 z M3462 404 h-7 q2.4 18 -1 36 h8 z" class="tw-curtain"/>
      <rect x="3414" y="404" width="48" height="36" rx="1.6" class="tw-winglass" mask="url(#twBetGlassMask)"/><path d="M3420 404 l-6 12 M3434 404 l-14 28 M3440 404 l-4 8" class="tw-winsheen" mask="url(#twBetGlassMask)"/>
      <g class="tw-bwcr"></g>
      <path d="M3414 404 l6 0 l-3 7 l5 4 l-8 4 z M3462 404 l-7 0 l4 6 l-5 6 l8 3 z M3414 440 l0 -9 l6 5 l4 4 z M3462 440 l0 -8 l-6 4 l-3 4 z M3436 404 l5 0 l-2 5 z" class="tw-hedge"/>
      <path d="M3438 404 V440 M3414 422 h4 M3458 422 h4" class="tw-mull"/>
      <rect x="3411" y="440" width="54" height="3.4" rx="1" class="tw-sill"/>
    </g>`),
  // A filing cabinet in the garage, folders sticking up out of the top drawer.
  'p-wadfs': () => hot('p-wadfs', `<g transform="translate(3567 432)">
      <path d="m.3.65 2.1-2.3h20.1l1.55 2.05-.7 2.2H.6Z" fill="#595d5e" stroke="#444847" stroke-width=".6"/>
      ${['#8a779f', '#c29b60', '#85a38a', '#8199ac', '#af7968'].map((c, k) => `<g transform="translate(${2.4 + k * 3.85} ${-3.5 - (k % 2) * 1.35}) rotate(${k - 2} 2 4)">
        <path d="M0 1.05V.2h1.65L2-.48h1.7l.35 1.2v3.56h-4Z" fill="${c}" stroke="#625c50" stroke-width=".32"/>
        <path d="M.55.56h1.12l.38-.41h1.12" fill="none" stroke="#e1d3b8" stroke-width=".34"/>
      </g>`).join('')}
      <rect x=".35" y=".45" width="23.4" height="53.35" rx="1.25" class="tw-cab"/>
      <path d="M1.05 1.5q9.5-.7 21.3-.28m-21 50.25V2.3" fill="none" stroke="#cdcec3" stroke-width=".49"/>
      <path d="M22.2 1.55h1.1v51.27l-1.18.33Z" fill="#59605f" opacity=".76"/>
      ${['WAD', 'DIR', 'LUMP', 'FUSE'].map((name, k) => `<g transform="translate(1.82 ${2.55 + k * 12.4})">
        <rect x=".2" y=".55" width="19.65" height="11.35" rx=".88" fill="#5e6464"/>
        <rect width="19.55" height="10.95" rx=".77" class="tw-drawer"/>
        <path d="M.8 9.95V.85h17.9" stroke="#d3d3c7" stroke-width=".36" fill="none"/>
        <rect x="5.65" y="1.45" width="8.2" height="4.05" rx=".48" fill="#737875"/>
        <rect x="6.22" y="1.91" width="7.1" height="3.02" rx=".18" class="tw-drlabel"/>
        <text x="9.75" y="4.27" class="tw-drlabel-t" text-anchor="middle">${name}</text>
        <path d="M6.5 7.55q.25-.55.85-.55h4.85q.63 0 .85.55l-.12 1.4h-1v-.69H7.7v.69H6.62Z" fill="#535a59"/>
        <path d="M7.17 7.48h5.16" stroke="#c7c7b7" stroke-width=".42"/>
      </g>`).join('')}
      <path d="M1.15 52.3h21.3m-19.6 1.4h2.2m14.4 0h2.2" stroke="#464c48" stroke-width=".7" fill="none"/>
    </g>`),
  // A crash test dummy taking a break against a stack of tires, its chart
  // on a stand beside it.
  'p-crash': () => hot('p-crash', `<g>
      <ellipse cx="4134" cy="500" rx="38" ry="3.4" class="tw-carshadow"/>
      ${[0, 1, 2].map((k) => `<rect x="${4124 + (k % 2) * 1.4}" y="${489 - k * 10}" width="34" height="10.4" rx="5" class="tw-tire2"/><path d="M${4129 + (k % 2) * 1.4} ${491.5 - k * 10} h24 M${4129 + (k % 2) * 1.4} ${496.5 - k * 10} h24" class="tw-tread"/>`).join('')}
      <path d="M4118 486 L4104 494 L4097 494 M4121 486 L4110 497 L4103 498" class="tw-dummy-limb"/>
      <rect x="4112" y="465" width="13" height="23" rx="5" class="tw-dummy"/>
      <path d="M4114 470 L4106 482 L4104 488" class="tw-dummy-limb"/>
      <circle cx="4119" cy="458" r="6.6" class="tw-dummy"/>
      <path d="M4119 451.4 a6.6 6.6 0 0 1 6.6 6.6 h-6.6 z M4119 458 v6.6 a6.6 6.6 0 0 1 -6.6 -6.6 z" class="tw-dummy-mk"/>
      <circle cx="4118.5" cy="475" r="3" class="tw-dummy-tgt"/><path d="M4118.5 472 a3 3 0 0 1 3 3 h-3 z M4118.5 475 v3 a3 3 0 0 1 -3 -3 z" class="tw-dummy-mk"/>
      <path d="M4096 500 l3.4 -11 h3.2 l3.4 11 z" class="tw-tcone"/><path d="M4097.6 494.6 h7" class="tw-tcone-s"/>
      <path d="M4170 501 l4 -24 M4186 501 l-4 -24 M4178 477 v24" class="tw-aframe"/>
      <rect x="4166" y="452" width="24" height="26" rx="1.4" class="tw-chartb"/>
      <path d="M4169.4 474 V456 M4169.4 474 H4187" class="tw-chart-ax"/>
      <path d="M4170.4 470 L4174 467 L4177.4 468.6 L4180.6 461 L4183.4 463 L4186 458" class="tw-chart-ln"/>
      <path d="M4180.6 461 l-1.4 -2 h2.8 z" class="tw-chart-pt"/>
    </g>`)
};

/* A tiny "secured by ADT" sticker, on the doors around town. They light
   up with ADT's stop, and clicking one opens it. */
const sticker = (x, y, w = 9, holes = '') => `<image href="assets/images/town/adt-sticker.webp" x="${x}" y="${y}" width="${w}" height="${(w / 2.79).toFixed(2)}" class="tw-adtsticker"${holes ? ` data-glass-sticker="${holes}"` : ''}/>`;

/* The visitor center, after a national park one: a big timber gable with a
   wall of warm glass, wood siding, a WELCOME CENTER plaque, steps and
   benches, pines behind; out front, a routed wood sign on a stone base. */
const VC = { l: 2796, r: 3124, c: 2960, eave: 404, apex: 304, base: 486 };
// Malachowsky Hall: the drawing, 820 wide, standing on the lawn.
const MALW = JSON.parse(fs.readFileSync(path.join(__dirname, 'malachowsky-windows.json'), 'utf8'));
const MAL = { x: 3500, w: 820 }; MAL.h = MAL.w * MALW.h / MALW.w; MAL.y = 494 - MAL.h;
// the roof's top edge (the line its shingles start from), above the wall line
const roofTop = (x) => (VC.eave + 6) - ((VC.eave + 6) - (VC.apex - 4)) * (1 - Math.abs(x - VC.c) / (VC.c - VC.l + 14));
const roofY = (x) => VC.apex + (VC.eave - VC.apex) * Math.abs(x - VC.c) / (VC.c - VC.l + 12);
// A vertical fade skewed to sit flush beneath each straight roof slope.
const gableShadow = (left, center, right, peak, slope, depth, opacity) => {
  const wing = (x, width, direction) =>
    `<rect width="${width}" height="${depth}" transform="translate(${x} ${peak + Math.abs(x - center) * slope}) skewY(${direction * Math.atan(slope) * 180 / Math.PI})"/>`;
  return `<g fill="url(#twEaveShadow)" opacity="${opacity}" class="tw-nohit">${wing(left, center - left, -1)}${wing(center, right - center, 1)}</g>`;
};
const visitorCenter = () => {
  const gl = 2900, gr = 3020, gy = roofY(gl) + 4;
  const glassApex = VC.apex + 14;
  // The artwork extends beneath the eaves; hits only count below the visible fascia.
  const glassShoulder = VC.apex + 11.4 + (VC.eave - VC.apex) * (gr - VC.c) / (VC.r - VC.c + 6);
  const batt = (a, b) => Array.from({ length: Math.floor((b - a) / 8) }, (_, i) => `M${a + 4 + i * 8} ${VC.eave + 2} V${VC.base}`).join(' ');
  return `
      <ellipse cx="${VC.c}" cy="470" rx="230" ry="70" class="tw-vc-halo tw-nohit"/>
      <rect x="${VC.l + 8}" y="${VC.eave - 2}" width="${VC.r - VC.l - 16}" height="${VC.base - VC.eave + 2}" class="tw-vcwood tw-fo"/>
      <path d="M${VC.l + 8} ${VC.eave - 1} L${VC.c} ${VC.apex + 6} L${VC.r - 8} ${VC.eave - 1} Z" class="tw-vcwood"/>
      <path d="M2804 486V405L2960 310l156 95v81z" fill="url(#twTimber)" class="tw-nohit"/>
      <path d="${Array.from({ length: Math.floor((VC.r - VC.l - 16) / 8) }, (_, i) => VC.l + 12 + i * 8).filter((x) => x < gl - 2 || x > gr + 2).map((x) => `M${x} ${(roofY(x) + 9).toFixed(1)} V${VC.eave - 1}`).join(' ')}" class="tw-batten"/>
      <path d="${batt(VC.l + 8, gl)} ${batt(gr, VC.r - 8)}" class="tw-batten"/>
      <path d="M${gl} ${VC.base} V${gy} L${VC.c} ${VC.apex + 14} L${gr} ${gy} V${VC.base} Z" fill="url(#twVcGlass)" class="tw-vcglass" data-fracture-pane data-fracture-layer="center" data-pane-grid="2930,2960,2990;430,458" data-pane="${gl + 2},${VC.base} ${gl + 2},${glassShoulder} ${VC.c},${glassApex} ${gr - 2},${glassShoulder} ${gr - 2},${VC.base}"/>
      <g class="tw-lobby tw-nohit">
        <path d="M2902 453q19-2 38 0v30h-38zm82-13h34v44h-34z" fill="#93704a"/>
        <path d="M2902 454h38m44-12h34m-33 12h31m-29 14h29" fill="none" stroke="#efd2a0" stroke-width="2"/>
        <path d="M2990 440v-8h4v8m2 0v-6h3v6m3 0 2-9 3 1-2 8m2 12v-6h4v6" fill="#687d72"/>
        <path d="M2910 452l2-18 14-1 2 19z" fill="#694c3a"/>
        <image href="assets/images/town/park-print.svg" x="2912.8" y="434" width="12" height="17.5" preserveAspectRatio="xMidYMid slice"/>
        <path d="M2901 400l32-53 9-5-41 77zm0 30 45-72-28 54-17 32zm85-60 10-22 7 4-17 29z" fill="#fff3c8" opacity=".42"/>
        <path d="M2910 451q12-2 22 0m59-27 12-.4" fill="none" stroke="#fff1bb" stroke-linecap="round"/>
      </g>
      <g data-glass-layer="center" class="tw-nohit"></g>
      <path d="M${gl + 6} ${gy + 14} L${VC.c} ${VC.apex + 30} L${gr - 6} ${gy + 14} M${gl + 4} ${gy + 20} H${gr - 4} M${VC.c} ${VC.apex + 30} V${gy + 20} M${VC.c - 30} ${gy + 2} V${gy + 20} M${VC.c + 30} ${gy + 2} V${gy + 20}" class="tw-beam"/>
      ${[VC.c - 34, VC.c, VC.c + 34].map((x) => `<path d="M${x} ${gy + 20} V${gy + 34}" class="tw-beam-t"/><circle cx="${x}" cy="${gy + 37}" r="3.4" class="tw-pendant"/>`).join('')}
      <path d="M${gl + 30} ${gy + 4} V${VC.base} M${VC.c} ${gy + 20} V${VC.base} M${gr - 30} ${gy + 4} V${VC.base} M${gl} 430 H${gr} M${gl} 458 H${gr}" class="tw-mull"/>
      <rect x="${gl - 4}" y="${gy - 2}" width="6" height="${VC.base - gy + 2}" class="tw-vcpost"/><rect x="${gr - 2}" y="${gy - 2}" width="6" height="${VC.base - gy + 2}" class="tw-vcpost"/>
      <!-- log corners, a stone skirt along the walls -->
      <rect x="${VC.l + 5}" y="${VC.eave - 2}" width="8" height="${VC.base - VC.eave + 2}" rx="3" class="tw-log"/><rect x="${VC.r - 13}" y="${VC.eave - 2}" width="8" height="${VC.base - VC.eave + 2}" rx="3" class="tw-log"/>
      ${[[VC.l + 13, gl - 5], [gr + 5, VC.r - 13]].map(([a, b]) => `<rect x="${a}" y="474" width="${b - a}" height="12" class="tw-skirt"/>` + Array.from({ length: Math.floor((b - a) / 9) }, (_, i) => `<rect x="${(a + 1 + i * 9 + (i % 2) * 1.5).toFixed(1)}" y="${475 + (i % 2) * 5.2}" width="${7 - (i % 3)}" height="4.8" rx="1.6" class="tw-skirt-s"/>`).join('')).join('')}
      <rect x="${VC.l + 13}" y="472.4" width="${gl - VC.l - 18}" height="2" class="tw-skirtcap"/><rect x="${gr + 5}" y="472.4" width="${VC.r - gr - 18}" height="2" class="tw-skirtcap"/>
      <!-- the window: a trimmed frame, a sill and a flower box -->
      <rect x="2811" y="417" width="78" height="56" rx="2" class="tw-vctrim"/>
      <rect x="2814" y="420" width="72" height="50" rx="2" data-fracture-pane data-fracture-layer="west" data-pane-grid="2838,2862;445" fill="url(#twVcGlass)"/>
      <g class="tw-nohit"><path d="M2815 460h70v9h-70z" fill="#987c5a"/><path d="M2820 460l2-6h6l1 6zm42 0 1-5h10l1 5z" fill="#ad7753"/>
      <path d="M2825 455q-9-6-6-10 5 2 6 7-1-9 3-12 3 6-1 12 4-6 8-5-1 6-8 8zm43 0q-6-4-5-8 4 .8 5 5 0-8 4-10 1 6-2 11 4-5 8-3-3 4-10 5z" fill="#5b7b68"/>
      <path d="M2815 437l13-17h5l-18 25zm37 7 16-24h6l-22 32z" fill="#fff6d4" opacity=".34"/></g>
      <g data-glass-layer="west" class="tw-nohit"></g>
      <path d="M2838 420 V470 M2862 420 V470 M2814 445 H2886" class="tw-mull"/>
      <rect x="2808" y="470" width="84" height="3.4" rx="1" class="tw-sill"/>
      ${[2818, 2826, 2834, 2842, 2850, 2858, 2866, 2874, 2882].map((x, k) => `<circle cx="${x}" cy="${474 - (k % 2) * 1.6}" r="3.2" class="${k % 2 ? 'tw-leaf2' : 'tw-leaf'}"/><circle cx="${x + 1.2}" cy="${472.4 - (k % 2) * 1.6}" r="1.2" class="tw-flower" style="--c:${['#ff6b8b', '#ffd166', '#f8f4ea', '#c084fc'][k % 4]}"/>`).join('')}
      <rect x="2812" y="474" width="76" height="7" rx="1.2" class="tw-fbox"/>
      <rect x="3032" y="416" width="78" height="30" rx="2" class="tw-vcplaque"/>
      <text x="3071" y="429" class="tw-vcplaque-t" text-anchor="middle">WELCOME</text><text x="3071" y="441" class="tw-vcplaque-t" text-anchor="middle">CENTER</text>
      <rect x="3033" y="449" width="76" height="28" rx="2" class="tw-vctrim"/>
      <rect x="3036" y="452" width="70" height="22" rx="2" data-fracture-pane data-fracture-layer="east" data-pane-grid="3071;" fill="url(#twVcGlass)"/><g data-glass-layer="east" class="tw-nohit"></g><path d="M3071 452 V474" class="tw-mull"/>${sticker(3092, 455)}
      <rect x="3030" y="474" width="82" height="3.4" rx="1" class="tw-sill"/>
      <!-- double glass doors in the middle of the glass front, with handles; a lantern either side -->
      <rect x="${VC.c - 21}" y="440" width="42" height="46" class="tw-vcdoorf"/>
      <rect x="${VC.c - 18}" y="443" width="17" height="43" fill="url(#twVcGlass)" class="tw-vcdoor" data-fracture-pane data-fracture-layer="doors"/><rect x="${VC.c + 1}" y="443" width="17" height="43" fill="url(#twVcGlass)" class="tw-vcdoor" data-fracture-pane data-fracture-layer="doors"/>
      <g data-glass-layer="doors" class="tw-nohit"></g>
      <path d="M${VC.c - 4} 458 v10 M${VC.c + 4} 458 v10" class="tw-vchandle"/>
      ${[gl - 12, gr + 12].map((x) => `<g transform="translate(${x} 444)"><path d="M0 -10 v4" class="tw-vchandle"/><path d="M-4 -6 h8 l-1 10 h-6 z" class="tw-lantern"/><rect x="-2.6" y="-4.6" width="5.2" height="7.2" class="tw-lantern-g"/><path d="M-5 -6 h10" class="tw-vchandle"/><circle r="9" cy="-1" fill="url(#twBulb)" class="tw-night tw-nohit"/></g>`).join('')}
      ${gableShadow(VC.l + 8, VC.c, VC.r - 8, VC.apex + 9.5, (VC.eave - VC.apex) / (VC.c - VC.l + 6), 12, .85)}
      <!-- a stone chimney on the left slope -->
      <clipPath id="twVcChim"><path d="M2852 ${(roofTop(2852) - 40).toFixed(1)} H2874 V${(roofTop(2874) + 3).toFixed(1)} L2852 ${(roofTop(2852) + 3).toFixed(1)} Z"/></clipPath>
      <g clip-path="url(#twVcChim)"><rect x="2852" y="${(roofTop(2852) - 34).toFixed(1)}" width="22" height="46" class="tw-chim"/>
      <path d="${[0, 1, 2, 3, 4].map((k) => `M2852 ${(roofTop(2852) - 34 + 8 + k * 8).toFixed(1)} H2874`).join(' ')} ${[0, 1, 2, 3, 4].map((k) => `M${2858 + (k % 2) * 8} ${(roofTop(2852) - 34 + k * 8).toFixed(1)} v8`).join(' ')}" class="tw-chim-l"/></g>
      <rect x="2849" y="${(roofTop(2852) - 38).toFixed(1)}" width="28" height="5" rx="1" class="tw-chimcap"/>
      <path d="M${VC.l - 14} ${VC.eave + 6} L${VC.c} ${VC.apex - 4} L${VC.r + 14} ${VC.eave + 6} L${VC.r + 6} ${VC.eave + 10} L${VC.c} ${VC.apex + 10} L${VC.l - 6} ${VC.eave + 10} Z" class="tw-vcroof"/>
      <path d="M${VC.l - 14} ${VC.eave + 6} L${VC.c} ${VC.apex - 4} L${VC.r + 14} ${VC.eave + 6} L${VC.r + 6} ${VC.eave + 10} L${VC.c} ${VC.apex + 10} L${VC.l - 6} ${VC.eave + 10} Z" fill="url(#twShingles)" class="tw-nohit" opacity=".55"/>
      <!-- rafter tails under the eaves, and timber brackets at each end -->
      <path d="${Array.from({ length: 15 }, (_, i) => VC.l - 2 + i * 11).filter((x) => x < VC.c - 6).map((x) => { const y = VC.eave + 10 - (x - VC.l + 6) * (VC.eave - VC.apex) / (VC.c - VC.l + 6); return `M${x} ${y.toFixed(1)} l-2 4`; }).join(' ')} ${Array.from({ length: 15 }, (_, i) => VC.r + 2 - i * 11).filter((x) => x > VC.c + 6).map((x) => { const y = VC.eave + 10 - (VC.r + 6 - x) * (VC.eave - VC.apex) / (VC.r + 6 - VC.c); return `M${x} ${y.toFixed(1)} l2 4`; }).join(' ')}" class="tw-rafter"/>
      <path d="M${VC.l + 10} ${VC.eave + 30} L${VC.l - 4} ${VC.eave + 10} M${VC.l + 10} ${VC.eave + 30} V${VC.eave + 12} M${VC.r - 10} ${VC.eave + 30} L${VC.r + 4} ${VC.eave + 10} M${VC.r - 10} ${VC.eave + 30} V${VC.eave + 12}" class="tw-knee"/>
      <path d="M${VC.c - 6} ${VC.apex - 2} h12 l-6 -5 z" class="tw-ridgecap"/>
      <path d="M${VC.l - 14} ${VC.eave + 6} L${VC.c} ${VC.apex - 4} L${VC.r + 14} ${VC.eave + 6}" class="tw-vcfascia"/>
      <rect x="${VC.l - 12}" y="486" width="${VC.r - VC.l + 24}" height="9" class="tw-vcdeck"/>
      <path d="M${VC.c - 52} 495 h104 v6 h-104 z M${VC.c - 58} 501 h116 v6 h-116 z" class="tw-vcstep"/>
      <path d="M2908 495.5h104m-110 6h116" fill="none" stroke="#fff0cc" opacity=".75" stroke-width="1.2"/>
      <path d="M2910 500h100m-106 6h112" fill="none" stroke="#514639" opacity=".58"/>
      <!-- planters by the steps -->
      ${[VC.c - 70, VC.c + 70].map((x) => `<path d="M${x - 7} 488 h14 l-2 11 h-10 z" class="tw-pot"/><circle cx="${x - 4}" cy="485" r="4.4" class="tw-leaf2"/><circle cx="${x + 4}" cy="485" r="4.6" class="tw-leaf"/><circle cx="${x}" cy="481" r="5" class="tw-leaf"/>${[[-4, 483], [3, 480], [5, 485], [-1, 478.6]].map(([dx, dy], k) => `<circle cx="${x + dx}" cy="${dy}" r="1.3" class="tw-flower" style="--c:${['#ffd166', '#ff8fab', '#ffffff', '#ff6b8b'][k]}"/>`).join('')}`).join('')}
      ${[2832, 3088].map((x) => `<rect x="${x - 16}" y="478" width="32" height="3" rx="1" class="tw-bench"/><rect x="${x - 14}" y="481" width="2.4" height="5" class="tw-bench"/><rect x="${x + 11.6}" y="481" width="2.4" height="5" class="tw-bench"/>`).join('')}
      <g transform="translate(3140 486)"><rect x="-1.4" y="-150" width="2.8" height="150" class="tw-pole"/><path d="M1.4-148q7-3 15-.8 7 2 13-.3l-6 8 5.6 6.9q-6.2 2.7-13.5.3-7.4-2.3-14.1 1z" class="tw-vcflag"/><path d="M2.8-146.8q7-2.4 13.2-.4m1.4.5q4.5 1.2 7.5.6" fill="none" stroke="#ffe3a0" stroke-width=".8"/><path d="M11 -136.4 l3.4 -7.4 l3.4 7.4 z M13.6 -136.4 h1.6 v2 h-1.6 z" class="tw-vcflag-p"/></g>
      <g class="tw-woodsign">
        <path d="M2596 486 q-4 -26 10 -28 h130 q14 2 10 28 z" class="tw-stone"/>
        <g transform="translate(2597 461)" class="tw-sign-stones tw-nohit">
          <path d="m2 16 3-9 8-4 10 1 1 8-7 6-13 1z m24-12 10-2 9 1 3 7-7 5-13-1z m25 0 16-2 7 3-2 8-17 2-6-5z m27 1 12-2 10 2-1 7-12 3-10-3z m25 0 14-3 8 4-1 6-13 2-9-3z m26 0 10-1 7 5 2 8-13-1-8-5z M2 22l1-3 15-1 6-5 12 3 1 7z m38-4 11-4 9 3 10-.3 2 6.6-33 .5z m35-.4 10-3 12 1 7 3-1 4.7-28-.6z m32 .7 13-4 10 .5 8 3 8 1.2 1.3 4.1-41-.3z"/>
          <path d="m9 8 6-2 4 .6m12-.5 7-1m17 1 10-1m16 2 6-1.5m20 .6 8-1.2m18 2 6 1m-93 12 6-1.7m32 .2 5-.4m22 1 8-1" class="tw-stone-glints"/>
        </g>
        ${Array.from({ length: 16 }, (_, i) => 2598 + i * 10).map((x, k) => `<circle cx="${x}" cy="${488 + (k % 3)}" r="${3.6 + (k % 2)}" class="${k % 2 ? 'tw-leaf2' : 'tw-leaf'}"/><circle cx="${x + 1.4}" cy="${485.4 + (k % 3)}" r="1.4" class="tw-flower" style="--c:${['#ff6b8b', '#ffd166', '#c084fc', '#ffffff', '#ff8fab'][k % 5]}"/>`).join('')}
        <rect x="2604" y="378" width="10" height="84" rx="3" class="tw-log"/><rect x="2730" y="378" width="10" height="84" rx="3" class="tw-log"/>
        <path d="M2604 378 l5 -7 l5 7 z M2730 378 l5 -7 l5 7 z" class="tw-logcap"/>
        <path d="M2607 384 v70 M2611 390 v60 M2733 386 v66 M2737 392 v58" class="tw-bark"/>
        <path d="M2654 452 v10 M2690 452 v10" class="tw-chainl"/>
        <rect x="2648" y="461" width="48" height="14" rx="3" class="tw-wood2"/><text x="2672" y="471.4" class="tw-pop" text-anchor="middle">POP. 1</text>
        <rect x="2568" y="388" width="208" height="64" rx="7" class="tw-wood"/>
        <rect x="2568" y="388" width="208" height="64" rx="7" fill="url(#twGrain)" class="tw-nohit" opacity=".9"/>
        <rect x="2575" y="395" width="194" height="50" rx="4" class="tw-wood-ln"/>
        <rect x="2579" y="399" width="186" height="42" rx="3" class="tw-wood-ln2"/>
        ${[[2574, 393.6], [2770, 393.6], [2574, 446.4], [2770, 446.4]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.7" class="tw-bolt"/>`).join('')}
        <text x="2672" y="412" class="tw-wel-s tw-textsnow" text-anchor="middle">Welcome to</text><text x="2672" y="413" class="tw-wel-s" text-anchor="middle">Welcome to</text>
        <text x="2672" y="440" class="tw-wel-b tw-wel-sh tw-nohit" text-anchor="middle" filter="url(#twTextSh)">SOMMIVILLE</text>
        <text x="2672.4" y="438.4" class="tw-wel-b tw-wel-edge" text-anchor="middle">SOMMIVILLE</text>
        <text x="2672" y="435.7" class="tw-wel-b tw-textsnow" text-anchor="middle">SOMMIVILLE</text><text x="2672" y="437" class="tw-wel-b" text-anchor="middle">SOMMIVILLE</text>
        <!-- two lamps on top shine down on it after dark -->
        <path d="M2609 379 q0 -10 11 -12 M2735 379 q0 -10 -11 -12" class="tw-lamparm2"/>
        <g class="tw-signlight tw-nohit" filter="url(#twSoftLight)"><polygon points="2618,371 2628,369 2700,450 2576,452" fill="url(#twSignBeam)"/><polygon points="2716,369 2726,371 2768,452 2644,450" fill="url(#twSignBeam)"/><ellipse cx="2640" cy="418" rx="66" ry="30" fill="url(#twSignWash)"/><ellipse cx="2704" cy="418" rx="66" ry="30" fill="url(#twSignWash)"/><circle cx="2623" cy="370" r="4.6" fill="url(#twBulb)"/><circle cx="2721" cy="370" r="4.6" fill="url(#twBulb)"/></g>
        <g transform="translate(2622 367) rotate(32)"><rect x="-5.4" y="-3.2" width="10.8" height="6.4" rx="2.2" class="tw-lamphead"/></g><g transform="translate(2722 367) rotate(-32)"><rect x="-5.4" y="-3.2" width="10.8" height="6.4" rx="2.2" class="tw-lamphead"/></g>
      </g>
      <g class="tw-night tw-nohit"><ellipse cx="${VC.c}" cy="420" rx="70" ry="56" fill="url(#twVcLight)"/><ellipse cx="2850" cy="446" rx="44" ry="30" fill="url(#twVcLight)"/><ellipse cx="3071" cy="462" rx="38" ry="20" fill="url(#twVcLight)"/></g>`;
};

/* The garden out front: flower borders along the walk, round shrubs, a
   bird bath, a sundial in a ring of flowers, little lamps along the path,
   and a blue butterfly that leaves once the street has come into view. */
const garden = () => {
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const edge = (side, y) => VC.c + side * (58 + 11.5 * (y - 507) / 93);
  const COL = ['#db8b72', '#ebbd61', '#b399ba', '#fff0cb', '#e0a4a1', '#96adbc', '#eaa46a'];
  let beds = '', blooms = '';
  [-1, 1].forEach((side) => {
    const pts = [512, 596].map((y) => [edge(side, y) + side * 2, y]), out = [596, 512].map((y) => [edge(side, y) + side * 15, y]);
    beds += `<path d="M${[...pts, ...out].map((p) => p.map((n) => n.toFixed(1)).join(' ')).join(' L')} Z" class="tw-soil"/>`;
    for (let i = 0; i < 44; i++) {
      const y = 515 + rnd() * 78, x = edge(side, y) + side * (4 + rnd() * 10), r = 2 + rnd() * 1.4;
      blooms += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" class="${i % 2 ? 'tw-leaf2' : 'tw-leaf'}"/>`;
      blooms += `<circle cx="${(x + (rnd() - .5) * 2).toFixed(1)}" cy="${(y - r * .7).toFixed(1)}" r="${(1 + rnd() * .5).toFixed(2)}" class="tw-flower" style="--c:${COL[Math.floor(rnd() * COL.length)]}"/>`;
    }
  });
  const shrub = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><ellipse cx="0" cy="0" rx="10" ry="2" class="tw-root-shadow"/><use href="#twTopiaryArt" transform="translate(0 -8)"/></g>`;
  const lamp = (x, y) => `<g transform="translate(${x} ${y})"><rect x="-.7" y="-9" width="1.4" height="9" class="tw-glamp-p"/><path d="M-2.4 -12 h4.8 l-.8 3 h-3.2 z" class="tw-glamp"/><rect x="-1.4" y="-11.2" width="2.8" height="1.8" class="tw-lantern-g"/><circle cy="-10" r="7" fill="url(#twBulb)" class="tw-night tw-nohit"/></g>`;
  const ring = Array.from({ length: 14 }, (_, i) => { const a = i / 14 * Math.PI * 2, x = VC.c + 126 + Math.cos(a) * 15, y = 552 + Math.sin(a) * 5; return `<circle cx="${x.toFixed(1)}" cy="${(y - 1).toFixed(1)}" r="2.4" class="${i % 2 ? 'tw-leaf2' : 'tw-leaf'}"/><circle cx="${x.toFixed(1)}" cy="${(y - 2.6).toFixed(1)}" r="1.2" class="tw-flower" style="--c:${COL[i % COL.length]}"/>`; }).join('');
  return `<g class="tw-garden">
    ${beds}${blooms}
    ${shrub(VC.c - 84, 513, 1)}${shrub(VC.c + 84, 513, 1)}${shrub(VC.c - 150, 530, .8)}${shrub(VC.c + 158, 528, .75)}
    <!-- a full bed along the front of the deck, either side of the steps: soil, two rows of shrubs, flowers, a few spikes of lavender -->
    ${[[VC.l - 12, VC.c - 60], [VC.c + 60, VC.r + 12]].map(([a, b]) => {
      let o = `<path d="M${a} 495 H${b} V503.6 Q${(a + b) / 2} 505.4 ${a} 503.6 Z" class="tw-soil"/>`;
      const n = Math.floor((b - a) / 6.4);
      for (let i = 0; i <= n; i++) { const x = a + 2 + i * ((b - a - 4) / n), r = 4.2 + ((i * 7) % 5) * .45; o += `<circle cx="${x.toFixed(1)}" cy="${(496.6 - (i % 2) * 1.4).toFixed(1)}" r="${r.toFixed(2)}" class="${i % 3 ? 'tw-leaf2' : 'tw-leaf'}"/>`; }
      for (let i = 0; i <= n; i += 3) { const x = a + 5 + i * ((b - a - 8) / n); o += `<path d="M${x.toFixed(1)} 498 v-11 M${(x + 1.6).toFixed(1)} 498 v-8.6 M${(x - 1.6).toFixed(1)} 498 v-9.4" class="tw-lav-s"/><path d="M${x.toFixed(1)} 487 v-4 M${(x + 1.6).toFixed(1)} 489.4 v-3.4 M${(x - 1.6).toFixed(1)} 488.6 v-3.6" class="tw-lav"/>`; }
      for (let i = 0; i <= n; i++) { const x = a + 4 + i * ((b - a - 8) / n), y = 500.6 + (i % 2) * 1.2; o += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(3.4 + (i % 3) * .5).toFixed(2)}" class="${i % 2 ? 'tw-leaf' : 'tw-leaf2'}"/><circle cx="${(x + .6).toFixed(1)}" cy="${(y - 2.6).toFixed(1)}" r="1.35" class="tw-flower" style="--c:${COL[(i * 3) % COL.length]}"/><circle cx="${(x - 1.8).toFixed(1)}" cy="${(y - .6).toFixed(1)}" r="1.1" class="tw-flower" style="--c:${COL[(i * 5 + 2) % COL.length]}"/>`; }
      return o;
    }).join('')}
    <!-- clumps of flowers out on the lawn -->
    ${[[VC.c - 196, 566], [VC.c - 100, 586], [VC.c + 100, 582], [VC.c + 196, 562], [VC.c - 170, 512], [VC.c + 178, 586]].map(([x, y], j) => Array.from({ length: 6 }, (_, i) => { const a = i / 6 * Math.PI * 2, px = x + Math.cos(a) * 4.4, py = y + Math.sin(a) * 1.8; return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="2.2" class="tw-leaf2"/><circle cx="${px.toFixed(1)}" cy="${(py - 1.8).toFixed(1)}" r="1.15" class="tw-flower" style="--c:${COL[(i + j * 2) % COL.length]}"/>`; }).join('')).join('')}
    ${lamp(edge(-1, 532) - 1, 532)}${lamp(edge(1, 532) + 1, 532)}${lamp(edge(-1, 572) - 1, 572)}${lamp(edge(1, 572) + 1, 572)}
    <!-- a bird bath, with a little bird on its rim -->
    <g transform="translate(${VC.c - 122} 556) scale(1.4)"><ellipse cx="0" cy="0" rx="9" ry="2" class="tw-carshadow"/><path d="M-5 0 h10 l-2 -3 h-6 z M-2 -3 h4 v-11 h-4 z" class="tw-bath"/><path d="M-11 -16 q11 7 22 0 z" class="tw-bath"/><ellipse cx="0" cy="-16" rx="9.4" ry="1.6" class="tw-bathwater"/>
      <g transform="translate(7 -17.4)"><ellipse cx="0" cy="-2" rx="2.6" ry="2" class="tw-bird"/><circle cx="2" cy="-3.6" r="1.4" class="tw-bird"/><path d="M3.2 -3.8 l1.4 .4 l-1.4 .5 z" class="tw-beak"/><path d="M-2.2 -2 l-2 -1" class="tw-birdtail"/></g></g>
    <!-- a sundial in a ring of flowers -->
    <ellipse cx="${VC.c + 126}" cy="552" rx="19" ry="6.4" class="tw-soil"/>${ring}
    <g transform="translate(${VC.c + 126} 552)"><path d="M-2.6 0 h5.2 v-10 h-5.2 z" class="tw-bath"/><ellipse cx="0" cy="-10.6" rx="6" ry="1.6" class="tw-dial"/><path d="M0 -10.6 l2.6 -3.2 v3" class="tw-gnomon"/></g>
    <!-- the butterfly: it flutters about the flowers, then leaves -->
    <g class="tw-bfly tw-nohit" aria-hidden="true"><g class="tw-bfly-path"><g class="tw-bfly-bob">
      <g class="tw-bfly-w"><path d="M0 0 C-5 -6 -9 -3 -6 1 C-8 4 -4 6 0 1 Z" class="tw-bfly-wing"/><path d="M0 0 C5 -6 9 -3 6 1 C8 4 4 6 0 1 Z" class="tw-bfly-wing"/></g>
      <path d="M0 -2.4 V2.6" class="tw-bfly-body"/></g></g></g>
  </g>`;
};

/* The way to the classic portfolio: a bus stop for the Classic Line. */
const busStop = () => `
    <a href="classic.html" class="tw-exit" aria-label="Take the Classic Line to the classic portfolio" transform="translate(30 104)">
      <rect x="3142" y="408" width="100" height="8" rx="2" class="tw-shelter"/>
      <path d="M3144 410h96m-89 1v3m9-3v3m9-3v3m9-3v3m9-3v3m9-3v3m9-3v3m9-3v3m9-3v3" stroke="#ddc997" stroke-width=".85" opacity=".7" fill="none"/>
      <rect x="3148" y="416" width="4" height="70" class="tw-shelter"/><rect x="3232" y="416" width="4" height="70" class="tw-shelter"/>
      <rect x="3152" y="418" width="80" height="58" class="tw-shglass"/>
      <path d="M3154 419h77l-12 9h-66z" fill="#485b5a" opacity=".22"/><path d="M3155 446l17-25h3l-20 31zm60 28 15-25v5l-12 20z" fill="#fff4dd" opacity=".48"/>
      <rect x="3160" y="424" width="64" height="38" rx="2" class="tw-poster"/>
      <text x="3192" y="434" class="tw-poster-t" text-anchor="middle">CLASSIC LINE</text>
      <path d="M3168 448 H3214" class="tw-route"/>${[3168, 3184, 3200, 3214].map((x, i) => `<circle cx="${x}" cy="448" r="${i === 3 ? 3.2 : 2.2}" class="tw-route-st${i === 3 ? ' end' : ''}"/>`).join('')}
      <text x="3192" y="458" class="tw-poster-s" text-anchor="middle">to the Classic Portfolio</text>
      <rect x="3158" y="468" width="68" height="3.4" rx="1" class="tw-bench"/><rect x="3162" y="471" width="2.4" height="15" class="tw-bench"/><rect x="3219" y="471" width="2.4" height="15" class="tw-bench"/>
      <rect x="3266" y="370" width="4" height="116" class="tw-pole"/>
      <circle cx="3268" cy="370" r="15" class="tw-bus-sign"/><text x="3268" y="374" class="tw-bus-t" text-anchor="middle">BUS</text>
      <rect x="3238" y="390" width="60" height="44" rx="4" class="tw-bus-plate"/>
      <text x="3268" y="401" class="tw-bus-r" text-anchor="middle">ROUTE C</text>
      <text x="3268" y="414" class="tw-bus-n" text-anchor="middle">Classic</text>
      <text x="3268" y="426" class="tw-bus-n" text-anchor="middle">Portfolio ↗</text>
    </a>`;

/* The garage, with my Civic out front. The car is the picture with its hood
   cut out into its own piece (civic-body / civic-hood): opening its stop
   swings the hood up on its hinge, and the engine bay is drawn under it. */
const CV = { x: 3588, ground: 528, w: 140 };
CV.u = CV.w / 900; CV.h = 364 * CV.u; CV.y = CV.ground - CV.h;
const cv = (px, py) => [CV.x + px * CV.u, CV.y + py * CV.u];
const HOOD = [[30.4, 193.7], [67.2, 172.2], [106.4, 158.4], [153.0, 148.6], [187.4, 141.7], [215.8, 144.7], [218.7, 160.4], [153.0, 168.2], [104.0, 177.1], [65.7, 187.8], [41.2, 199.6]].map(([x, y]) => cv(x, y));
const HINGE = cv(217.3, 150), HOOD_UP = 63;
// The bumpers (cut out of the picture, civic-fbump / civic-rbump) and the windows, for the damage.
const box = (x0, y0, x1, y1) => { const [x, y] = cv(x0, y0), [X, Y] = cv(x1, y1); return { x, y, w: X - x, h: Y - y }; };
const FB = box(0, 224, 113, 341), RB = box(797, 215, 900, 341);
const WINS = [
  [[218,147],[249,131],[306,104],[350,84],[365,80],[354,87],[308,111],[253,136],[220,151]],
  [[326,121],[365,103],[405,89],[453,80],[505,76],[485,151],[342,155],[344,141],[340,130]],
  [[537,75],[579,77],[615,82],[643,90],[666,100],[664,145],[528,151]],
  [[678,105],[690,112],[699,124],[705,143],[676,145]],
  [[264,153],[289,138],[287,155]],
].map((w) => w.map(([x, y]) => cv(x, y).map((n) => +n.toFixed(2))));
// where the hood's front edge ends up, open, for the prop rod
const hoodAt = ([x, y]) => { const [hx, hy] = HINGE, a = HOOD_UP * Math.PI / 180; return [hx + (x - hx) * Math.cos(a) - (y - hy) * Math.sin(a), hy + (x - hx) * Math.sin(a) + (y - hy) * Math.cos(a)]; };
// the rod meets the underside of the hood a little back from its front edge
const ROD = hoodAt(cv(60, 190));
/* The house: lap siding, a shingled roof, a brick chimney, shutters, a
   porch over the door; the projects are around it (PROJ). Edges bow a
   little, nothing ruler straight. */
// The house is drawn a touch bigger than its plan, about the middle of its base.
const HK = 1.12, HX = 3470, HY = 486;
const houseT = `translate(${HX} ${HY}) scale(${HK}) translate(${-HX} ${-HY})`;
// A window that can be broken: glass, then cracks, then a hole.
const hwin = (i, x, y) => `<g class="tw-hwin" data-w="${i}"><rect x="${x - 7}" y="${y}" width="6" height="28" rx=".8" class="tw-shutter"/><rect x="${x + 25}" y="${y}" width="6" height="28" rx=".8" class="tw-shutter"/><rect x="${x}" y="${y}" width="24" height="28" rx="1.4" fill="url(#twVcGlass)" class="tw-homewin"/><rect x="${x}" y="${y}" width="24" height="28" rx="1.4" class="tw-hhole"/><path d="M${x + 1.4} ${y + 1.4} h21.2 v6 q-10.6 4 -21.2 0 z" class="tw-valance"/><g class="tw-hcr"></g><path d="M${x} ${y} l4 0 l-2 6 l4 4 l-6 3 z M${x + 24} ${y} l-5 0 l3 5 l-4 6 l6 2 z M${x} ${y + 28} l0 -8 l5 5 l3 3 z M${x + 24} ${y + 28} l0 -7 l-5 4 l-2 3 z" class="tw-hedge"/><path d="M${x + 12} ${y} V${y + 28} M${x} ${y + 14} H${x + 24}" class="tw-mull"/><rect x="${x - 3}" y="${y + 28}" width="30" height="3" rx="1" class="tw-sill"/></g>`;
const home = () => `
    <g class="tw-house-k" transform="${houseT}">
    <rect x="3497" y="246" width="17" height="60" class="tw-chimney"/><rect x="3497" y="246" width="17" height="60" fill="url(#twBricks)" class="tw-nohit"/>
    <path d="M3494.4 247.4 q5.6 -1.4 11 -.6 q5.6 -.6 11.2 .4 v-5 q-5.6 -.8 -11.2 -.2 q-5.4 -.6 -11 .4 z" class="tw-chimcap"/>
    <path d="M3404.6 324 Q3470 322.6 3536.6 324.4 L3536 486 Q3470 486.8 3405.2 486 Z" class="tw-housewall tw-fo"/>
    <path d="M3404.6 324 Q3470 322.6 3536.6 324.4 L3536 486 Q3470 486.8 3405.2 486 Z" fill="url(#twSiding)" class="tw-nohit"/>
    <path d="M3404.6 324 Q3470 322.6 3536.6 324.4 L3536.4 360 H3404.8 Z" fill="url(#twEaveShade)" class="tw-nohit"/>
    <path d="M3405 326 V485.4 M3535.8 326 V485.4" class="tw-trim"/>
    ${hwin(0, 3416, 342)}${hwin(1, 3494, 342)}
    <rect x="3414" y="373" width="28" height="5" rx="1.4" class="tw-planter"/>${[3417, 3423, 3429, 3435, 3440].map((x, k) => `<circle cx="${x}" cy="${372 - (k % 2)}" r="${2.6 + (k % 2) * 0.6}" class="${k % 2 ? 'tw-leaf2' : 'tw-leaf'}"/><circle cx="${x + 1}" cy="${370 - (k % 2)}" r="1.1" class="tw-flower" style="--c:${['#ff6b8b', '#ffd166', '#ff8fab', '#f9f871', '#ff6b8b'][k]}"/>`).join('')}
    <path d="M3392 333 Q3417 309 3440 286 Q3470.6 284.4 3501 286 Q3525 309 3549.4 333.4 Q3470 330.6 3392 333 Z" class="tw-roof"/>
    <path d="M3392 333 Q3417 309 3440 286 Q3470.6 284.4 3501 286 Q3525 309 3549.4 333.4 Q3470 330.6 3392 333 Z" fill="url(#twShingles)" class="tw-nohit"/>
    <path d="M3392 333 Q3417 309 3440 286 Q3470.6 284.4 3501 286 Q3525 309 3549.4 333.4 Q3470 330.6 3392 333 Z" fill="url(#twRoofShade)" class="tw-nohit"/>
    <path d="M3395 333.2 Q3470 330.4 3546.6 333.6" class="tw-fascia"/>
    <path d="M3392 333 Q3417 309 3440 286 Q3470.6 284.4 3501 286 Q3525 309 3549.4 333.4" class="tw-roofedge"/>
    <circle cx="3470.4" cy="301" r="7.6" class="tw-atticfr"/><circle cx="3470.4" cy="301" r="5.8" fill="url(#twVcGlass)" class="tw-homewin tw-attic-glass"/><path d="M3470.4 295.2 V306.8 M3464.6 301 H3476.2" class="tw-mull"/>
    <rect x="3496" y="430" width="26" height="56" class="tw-doorway"/>
    <g class="tw-hdoor"><g class="tw-hdoor-in">
      <rect x="3496" y="430" width="26" height="56" rx="2" class="tw-homedoor"/><path d="M3499.6 459 h18.8 v23 h-18.8 z" class="tw-doorpanel"/><circle cx="3517.6" cy="458" r="1.4" class="tw-knob"/>
      <path d="M3500 445 a9 9 0 0 1 18 0 v2 h-18 z" fill="url(#twVcGlass)"/><path d="M3509 436 V447" class="tw-mull"/>${sticker(3500, 450, 7)}
      <g class="tw-hcr"></g>
    </g></g>
    <rect x="3487" y="427" width="2.6" height="59" class="tw-post"/><rect x="3528.4" y="427" width="2.6" height="59" class="tw-post"/>
    <path d="M3486 426 Q3509 424 3532 426 v10 h-46z" fill="url(#twPorchShade)"/>
    <path d="M3484.6 427 L3509 410.4 L3533.4 427 Q3509 425.4 3484.6 427 Z" class="tw-roof"/><path d="M3484.6 427 L3509 410.4 L3533.4 427 Q3509 425.4 3484.6 427 Z" fill="url(#twShingles)" class="tw-nohit"/><path d="M3485.6 427.2 Q3509 425.4 3532.4 427.2" class="tw-fascia"/>
    <circle cx="3492.6" cy="438" r="14" fill="url(#twVcLight)" class="tw-porchglow"/><rect x="3490" y="435" width="5.4" height="8" rx="1.6" class="tw-porchlamp"/>
    <path d="M3492 486 h34 v3 h-34 z M3489 489 h40 v3.4 h-40 z" class="tw-vcstep"/>
    ${PROJ['p-betai']()}
    </g>
    <path d="M3501 493.4 h27 l8.7 106.6 h-44.4 z" class="tw-walk"/>
    ${slabs([3501, 493.4], [3528, 493.4], [3536.7, 600], [3492.3, 600], 13)}
    ${[[3410, 498, .58], [3444, 499, .62], [3550, 498, .52]].map(([x, y, k]) => bush(x, y, k)).join('')}
    ${[3400, 3408, 3416, 3424, 3432, 3442, 3452, 3462].map((x, k) => `<circle cx="${x}" cy="${491 - (k % 3)}" r="1.5" class="tw-flower" style="--c:${['#ff6b8b', '#ffd166', '#c084fc', '#ff8fab'][k % 4]}"/>`).join('')}
    <!-- ADT's little yard sign; it lights up if the house is broken into -->
    <g class="tw-yardsign"><ellipse cx="3480" cy="514" rx="22" ry="3.4" fill="url(#twAdtPool)" class="tw-yard-pool tw-nohit"/><circle cx="3480" cy="500" r="20" fill="url(#twAdtGlow)" class="tw-yard-glow tw-nohit"/>
      <image href="assets/images/town/adt-sign.webp?v=2" x="3473" y="490" width="14" height="22.75" preserveAspectRatio="xMidYMax meet" class="tw-adtsign"/><image href="assets/images/town/snow-adt.webp" x="3473" y="489.165" width="14" height="23.585" preserveAspectRatio="xMidYMax meet" class="tw-snowimg"/>
      <image href="assets/images/town/adt-sign-lit.webp" x="3473" y="490" width="14" height="22.75" preserveAspectRatio="xMidYMax meet" class="tw-yard-lit tw-nohit" filter="url(#twAdtLit)"/></g>
    ${PROJ['p-avl']()}
    ${PROJ['p-gatorgoods']()}
    ${PROJ['p-sommiscript']()}
    ${mailbox()}`;
// The mailbox at the curb by the drive: letters from people I've worked with
// (their LinkedIn recommendations). Its flag is up until it has been opened.
const mailbox = () => hot('recs', `<g class="tw-mailbox" transform="translate(3790 597)">
      <ellipse cx="0" cy=".6" rx="16" ry="2" class="tw-root-shadow tw-nohit"/>
      <path d="M-3-30h6v30h-6z M3-22l8-8h-3l-5 5z" class="tw-mb-post tw-mb-ol"/>
      <path d="M-1.6-23q.7 5 .1 10t.3 9m2-16v7" class="tw-mb-grain"/>
      <rect x="-18" y="-31" width="36" height="3.2" rx=".6" class="tw-mb-post tw-mb-ol"/>
      <path d="M-18-31v-10q0-9 8-9h20q8 0 8 9v10z" class="tw-mb-body tw-mb-ol"/>
      <path d="M-18-31v-10q0-9 8-9 8 0 8 9v10z" class="tw-mb-door tw-mb-ol"/>
      <path d="M-15.8-34v-7q0-6 5.8-7m7.4.2H9q4.9 0 6.8 4.2" class="tw-mb-shine"/>
      <path d="M-15-33h10m5-.3h15M2-44H11" class="tw-mb-seam"/>
      <rect x="-12.8" y="-42.7" width="5.6" height="2.1" rx=".65" class="tw-mb-handle tw-mb-ol"/>
      <path d="M-14-31.8v2m8-2v2" stroke-width="1.4" class="tw-mb-brass"/>
      <circle cx="2" cy="-44" r=".6" class="tw-mb-handle"/><circle cx="11" cy="-44" r=".6" class="tw-mb-handle"/>
      <g transform="translate(13 -35)"><g class="tw-mb-flag">
        <path d="M-.75 0v-15h7.8v4.6H.75V0z" class="tw-mb-red tw-mb-ol"/>
        <path d="M1-14h4.8" class="tw-mb-shine"/>
      </g><circle r="1.25" class="tw-mb-handle tw-mb-ol"/></g>
    </g>`);
// Local coordinates follow the original Camry sprite (66 × 44). The tire
// contact line is y=41, shared by the chocks and the driveway threshold.
const storedCamry = () => {
  const body = '<image href="assets/images/town/memory-camry.webp" width="66" height="44"/>';
  const cover = '<image href="assets/images/town/camry-cover.svg" width="66" height="44"/>';
  // Trim the original cutout's translucent backdrop, including from its hover silhouette.
  const seat = '<g transform="translate(6 1.14) scale(.15625)"><image href="assets/images/town/memory-seat.webp" width="160" height="107" clip-path="url(#twCarrierEdge)"/></g>';
  const chock = (x) => `<g transform="translate(${x} 41)" stroke-linejoin="round">
      <path d="m-3.4.72.9-2.15 3.32-.44 2.65 1.95-.34.88-5.94.43Z" fill="#a3855d" stroke="#514936" stroke-width=".42"/>
      <path d="m-2.43-1.44 3.25-.39 2.49 1.9-3.18.22Z" fill="#baa07a"/>
      <path d="m-2.7.45 2.16-.17m.87-.93 1.75-.1m-2.7-.7 1.65-.12" stroke="#6e5c44" stroke-width=".31" fill="none"/>
    </g>`;
  return `<g data-memory="baby" data-anchor="33 21" role="button" tabindex="0" aria-label="Open family Camry photo" transform="translate(3692 486) scale(.95) translate(-33 -41)">
    <g class="tw-keepsake-rim" aria-hidden="true">${body}${cover}${seat}</g>
    <g fill="url(#twParkedShadow)" pointer-events="none">
      <ellipse cx="35.5" cy="40.1" rx="33" ry="4.5" opacity=".66"/>
      <ellipse cx="33" cy="40.8" rx="27.5" ry="2.2"/>
      <ellipse cx="11.1" cy="41.15" rx="5.15" ry="1.15"/><ellipse cx="54.7" cy="41.15" rx="5.15" ry="1.15"/>
    </g>
    <g filter="url(#twGarageBounce)">
      ${body}
      <!-- The plate is on the wall; just its backing and mounting holes are left. -->
      <rect x="26.95" y="31.55" width="12.15" height="5.6" rx=".62" fill="#414d4b" stroke="#283332" stroke-width=".38"/>
      <path d="M28.05 33.05h.27m9.12 0h.27m-9.66 2.63h.27m9.12 0h.27" stroke="#202827" stroke-width=".62" stroke-linecap="round"/>
      <path d="M28.2 32.65h.3m9 0h.3" stroke="#aaa68c" stroke-width=".28"/>
      ${cover}
      <ellipse cx="19.1" cy="16.9" rx="8.35" ry="1.3" fill="url(#twParkedShadow)"/>
      ${seat}
      ${chock(11)}${chock(54.8)}
    </g>
  </g>`;
};

// Door casing and jambs sit in front of the bay. The steel rails, stop bead
// and rolled bottom seal give the opening thickness without adding a floor.
const garageCasing = () => `<g transform="translate(3566 400)" class="tw-garage-casing" pointer-events="none" aria-hidden="true" stroke-linejoin="round" stroke-linecap="round">
    <path d="M-3.1-4.4h184.2v90.2h-3.4V2.9H.3v82.9h-3.4Z" fill="var(--casing)" stroke="#645e52" stroke-width=".74"/>
    <path d="M-2.5 85.4V-3.5l2.8 2.8m180.2 85.9V-3.5l-2.9 2.8" fill="none" stroke="#ece2ca" stroke-width=".6" opacity=".63"/>
    <path d="M.4 3.1h2.15v82.5H.4zm175.1 0h2.15v82.5h-2.15z" fill="#575950"/>
    <path d="M1.55 4.4v79m175-79v79" stroke="#b4b1a2" stroke-width=".43"/>
    <path d="M.2 2.7h177.6v6.2H.2z" fill="url(#twPorchShade)"/>
    <path d="M-3.5-4.25q92.5-.55 185-.05v6.55q-91.5.36-185 .04Z" fill="var(--enamel)" stroke="#4c4e49" stroke-width=".9"/>
    <path d="M-3.65-4.65h185.3l.45 1.05-186.2.1Z" fill="var(--cap)" stroke="#62645b" stroke-width=".47"/>
    <path d="M-3.2 2.22h184.4v1.62L-3.2 4Z" fill="#424641"/>
    ${[0, 1, 2, 3, 4].map(i => `<g transform="translate(${.9 + i * 35.55} -2.7)">
      <path d="M.1 0h33l-.55 3.55H.62Z" fill="#5d615a" opacity=".31"/>
      <path d="M.95.57h31.4l-.27 2.27H1.27Z" fill="var(--enamel)"/>
      <path d="M1.3 2.95h30.65" stroke="var(--cap)" stroke-width=".4"/>
    </g>`).join('')}
    <path d="M85.15 1.6h7.7l-.35 1.02h-7.05Z" fill="#6b6c62" stroke="#52544b" stroke-width=".36"/>
    ${[1.5, 176.5].map(x => `<g transform="translate(${x} 0)" fill="#898d80" stroke="#4e534d" stroke-width=".35">
      <rect x="-.8" y="15" width="1.6" height="3" rx=".35"/><rect x="-.8" y="63.8" width="1.6" height="3" rx=".35"/>
    </g>`).join('')}
    <!-- A small enamel gooseneck lamp beside the door. -->
    <g transform="translate(192.5 18)">
      <ellipse cx="1" cy="3.8" rx="10.8" ry="12.4" fill="url(#twVcLight)" class="tw-night"/>
      <path d="M.95.05q2.3 0 2.1 2.65-.15 2.1-2.17 2-2.08-.1-2.08-2.32T.95.05Z" fill="#686555" opacity=".4"/>
      <ellipse cy=".4" rx="1.8" ry="2.15" fill="#575e53" stroke="#494b43" stroke-width=".5"/>
      <path d="M-.2.12q-.42-4.43-3.05-3.92-1.75.38-1.45 2.95" fill="none" stroke="#454c43" stroke-width="1.1"/>
      <path d="M-8.7 3q.43-1.36 1.55-1.84l1.43-1.32.1-1.14h1.61l.22 1.12 1.67 1.3Q-.8 1.6-.45 3.05q-4.02 1.2-8.25-.05Z" fill="#69796a" stroke="#434e44" stroke-width=".55"/>
      <ellipse cx="-4.6" cy="3.04" rx="3.6" ry=".64" fill="#bfb69c"/><path d="M-6 3.26q.07 2.21 1.38 2.25 1.13-.03 1.34-2.19Z" fill="var(--lamp-glass)" stroke="#9b937e" stroke-width=".34"/>
      <path d="m-7.1 1.75 2.06-1.33m2.22-1.58q1.08.95 1.02 1.8" stroke="#b3b9a2" stroke-width=".39" fill="none"/>
    </g>
  </g>`;

const garage = () => {
  const [hx, hy] = HINGE, [ix, iy] = cv(39.237, 143.706);
  return [`
    <rect x="3536" y="378" width="238" height="108" class="tw-house"/><path d="M3536 381 V486 H3774 V381" fill="none" class="tw-fo tw-nohit"/>
    <rect x="3537" y="379" width="236" height="106" fill="url(#twSiding)" opacity=".48" pointer-events="none"/>
    <path d="M3534 379 L3655 330 L3776 379 Z" class="tw-house"/><path d="M3534 379 L3655 330 L3776 379 Z" fill="url(#twSiding)" class="tw-nohit"/>
    ${gableShadow(3536, 3655, 3774, 332, 52 / 123, 12, .78)}
    <g transform="translate(3655 358)" pointer-events="none" aria-hidden="true">
      <ellipse cx=".5" cy="1.05" rx="7.6" ry="7.2" fill="#4d4233" opacity=".37"/>
      <circle r="7.25" class="tw-atticfr"/><circle r="5.98" fill="#4b4e43"/>
      ${[[-3.8, 3.8], [-1.7, 5.37], [.45, 5.48], [2.6, 4.55]].map(([y, w]) => `<path d="M${-w} ${y}q${w}-.23 ${2 * w} 0l-.6 1.05h-${2 * w - 1.2}Z" fill="#baa98a"/><path d="M${-w + .25} ${y}h${2 * w - .5}" stroke="#dbcaae" stroke-width=".33"/>`).join('')}
      <path d="M-6.38-.45v.9m12.76-.9v.9" stroke="#958974" stroke-width=".4"/>
    </g>
    <path d="M3524 380 Q3590 352 3655 324.4 Q3720 352 3786 380 L3778 384.6 Q3716 358 3655 332.6 Q3594 358 3532 384.6 Z" class="tw-roof"/><path d="M3524 380 Q3590 352 3655 324.4 Q3720 352 3786 380 L3778 384.6 Q3716 358 3655 332.6 Q3594 358 3532 384.6 Z" fill="url(#twShingles)" class="tw-nohit"/>
    <g fill="none" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true" pointer-events="none">
      <path d="M3778.8 384.85v1.35l-8.1 4.05v88.95l2.1 3.7" stroke="#635c50" opacity=".39" stroke-width="2.9"/>
      <path d="M3778.1 384.5v1.15l-8.55 4.1v88.6l2.2 3.55" stroke="#9e9787" stroke-width="2.35"/>
      <path d="M3777.55 384.65v.66l-8.6 4.08v89.1" stroke="#d8cdb8" stroke-width=".66"/>
      <path d="M3768.1 408.1h2.8m-2.8 49.8h2.8" stroke="#776f60" stroke-width="1.13"/>
    </g>
    <path d="M3566 486 H3744 L3769 600 H3541 Z" class="tw-drive"/>
    <path d="M3566 486 H3744 L3769 600 H3541 Z" fill="url(#twConcrete)" class="tw-nohit"/>
    <path d="M3559.4 518 H3750.6 M3550 563 H3760 M3655 486 V600" class="tw-joint tw-nohit"/>
    <path d="M3700 566 l5 4 l1.4 6 l4 3.6 M3596 588 l6 -2 l3 3" class="tw-dcrack tw-nohit"/>
    <path d="M3614 534 L3606 600 M3700 534 L3708 600" class="tw-tracks tw-nohit"/>
    <ellipse cx="3610" cy="531.6" rx="11" ry="2" class="tw-oil tw-nohit"/><ellipse cx="3604" cy="534" rx="4.4" ry="1" class="tw-oil tw-nohit"/><ellipse cx="3676" cy="583" rx="6" ry="1.4" class="tw-oil tw-nohit"/>
    <rect x="3566" y="400" width="178" height="86" class="tw-gint"/>
    <rect x="3566" y="400" width="178" height="86" fill="url(#twGarageLight)" class="tw-glight"/>
    <rect x="3566" y="400" width="178" height="86" fill="url(#twDrywall)" pointer-events="none"/>
    <image href="assets/images/town/garage-workshop.svg?v=2" x="3566" y="400" width="178" height="86" pointer-events="none" aria-hidden="true"/>
    <image href="assets/images/town/memory-sketch.webp" x="3725.4" y="417.8" width="10.5" height="8" transform="rotate(2 3731 426)" pointer-events="none"/>
    ${PROJ['p-wadfs']()}
    `, `
    <rect x="3566" y="400" width="178" height="86" fill="url(#twBaySides)" pointer-events="none"/>
    ${garageCasing()}
    ${home()}
    <g clip-path="url(#twGarBleed)"><path d="M3524 380 Q3590 352 3655 324.4 Q3720 352 3786 380 L3778 384.6 Q3716 358 3655 332.6 Q3594 358 3532 384.6 Z" class="tw-roof tw-nohit"/><path d="M3524 380 Q3590 352 3655 324.4 Q3720 352 3786 380 L3778 384.6 Q3716 358 3655 332.6 Q3594 358 3532 384.6 Z" fill="url(#twShingles)" class="tw-nohit"/></g>
    <g data-memory="trike" data-anchor="3832 538" transform="translate(-105 22)" role="button" tabindex="0" aria-label="Open tricycle photo"><ellipse cx="3832.5" cy="549.5" rx="14.7" ry="2" fill="url(#twParkedShadow)" opacity=".75"/><g class="tw-keepsake-rim" aria-hidden="true"><image href="assets/images/town/memory-trike.webp" x="3817" y="526" width="31" height="24"/></g><image href="assets/images/town/memory-trike.webp" x="3817" y="526" width="31" height="24"/></g>
    <g class="tw-civtools tw-nohit" aria-hidden="true">
      ${[['oil', 3556, 535, 6, 12.6], ['acpro', 3562.6, 536.4, 9.2, 18.2], ['stand1', 3592, 557, 9.8, 14.2], ['stand2', 3605, 557, 9.6, 17.2], ['torque', 3620, 553, 19, 2.1], ['feeler', 3643, 552, 4.4, 2.6]].map(([n, x, b, w, h]) => `<ellipse cx="${(x + w / 2).toFixed(1)}" cy="${b}" rx="${(w * 0.48).toFixed(1)}" ry="${Math.max(0.5, Math.min(1.2, w * 0.08)).toFixed(2)}" class="tw-carshadow"/><image href="assets/images/town/tool-${n}.webp" x="${x}" y="${(b - h).toFixed(2)}" width="${w}" height="${h}" preserveAspectRatio="none"/>`).join('')}
      <ellipse cx="3585.2" cy="538.6" rx="11.6" ry="1.5" transform="rotate(-6.6 3585.2 538.6)" class="tw-carshadow"/><image href="assets/images/town/tool-jack.webp" x="3572.6" y="526.2" width="24" height="13.33" preserveAspectRatio="none"/>
      <ellipse cx="3578" cy="544.4" rx="12" ry=".6" class="tw-carshadow"/><image href="assets/images/town/tool-handle.webp" x="3566" y="542.2" width="24" height="2" preserveAspectRatio="none"/>
    </g>
    ${hot('p-civic', `
    <g>
      <path d="M${HOOD.map((p) => p.map((n) => n.toFixed(2)).join(' ')).join(' L')} Z" class="tw-engbay"/>
      <g class="tw-civ-bay"><g clip-path="url(#twCivBay)">
        <rect x="${(CV.x + 14).toFixed(1)}" y="${(hy - 2).toFixed(1)}" width="18" height="7" rx="2" class="tw-engine"/>
        <rect x="${(CV.x + 6).toFixed(1)}" y="${(hy + 1).toFixed(1)}" width="8" height="5" rx="1.6" class="tw-airbox"/>
        <circle cx="${(CV.x + 29).toFixed(1)}" cy="${(hy - 1).toFixed(1)}" r="1.3" class="tw-capy"/><circle cx="${(CV.x + 19).toFixed(1)}" cy="${(hy - 2.2).toFixed(1)}" r="1" class="tw-capy"/></g>
        <path d="M${(CV.x + 7).toFixed(1)} ${(hy + 6).toFixed(1)} L${ROD[0].toFixed(1)} ${ROD[1].toFixed(1)}" class="tw-prop"/>
      </g>
      <ellipse cx="${CV.x + CV.w / 2}" cy="${CV.ground}" rx="${CV.w * 0.46}" ry="3" class="tw-carshadow"/>
      ${[FB, RB].map((b) => `<rect x="${(b.x + b.w * 0.08).toFixed(2)}" y="${(b.y + b.h * 0.18).toFixed(2)}" width="${(b.w * 0.84).toFixed(2)}" height="${(b.h * 0.6).toFixed(2)}" rx="1" class="tw-crashbar"/><path d="M${(b.x + b.w * 0.1).toFixed(2)} ${(b.y + b.h * 0.34).toFixed(2)} h${(b.w * 0.8).toFixed(2)}" class="tw-crashbar-l"/>`).join('')}
      <image href="assets/images/town/civic-body2.webp" x="${CV.x}" y="${CV.y.toFixed(2)}" width="${CV.w}" height="${CV.h.toFixed(2)}" preserveAspectRatio="none"/>
      <image href="assets/images/town/snow-civic.webp" x="${CV.x}" y="${CV.y.toFixed(2)}" width="${CV.w}" height="${CV.h.toFixed(2)}" preserveAspectRatio="none" class="tw-snowimg"/>
      ${[['f', FB], ['r', RB]].map(([k, b]) => `<g class="tw-bump tw-bump-${k}"><image href="assets/images/town/civic-${k}bump.webp" x="${b.x.toFixed(2)}" y="${b.y.toFixed(2)}" width="${b.w.toFixed(2)}" height="${b.h.toFixed(2)}" preserveAspectRatio="none"/></g>`).join('')}
      <g class="tw-civ-dmg">${WINS.map((w, i) => `<g clip-path="url(#twCivWin${i})" class="tw-civ-win" data-w="${i}"></g>`).join('')}<g class="tw-civ-dents"></g></g>
      <g transform="translate(${hx.toFixed(2)} ${hy.toFixed(2)})"><g class="tw-civ-hood" style="transform-origin:${((217.3 - 39.237) / 180 * 100).toFixed(1)}% ${((150 - 143.706) / 56 * 100).toFixed(1)}%;--up:${HOOD_UP}deg"><path d="M${HOOD.slice(6).map(([x, y]) => `${(x - hx).toFixed(2)} ${(y - hy).toFixed(2)}`).join(' L')}" class="tw-hood-under"/><image href="assets/images/town/civic-hood.webp" x="${(ix - hx).toFixed(2)}" y="${(iy - hy).toFixed(2)}" width="${(180 * CV.u).toFixed(2)}" height="${(56 * CV.u).toFixed(2)}" preserveAspectRatio="none"/></g></g>
    </g>`)}
    <g class="tw-steam" aria-hidden="true">${[0, 1, 2, 3, 4].map((k) => `<circle cx="${(CV.x + 8 + k * 4.5).toFixed(1)}" cy="${(HINGE[1] - 2).toFixed(1)}" r="${3 + (k % 2)}" style="--d:${(-k * 0.55).toFixed(2)}s;--dx:${k % 2 ? -5 : 4}px"/>`).join('')}</g>
    <g class="tw-civ-tags" aria-hidden="true">${[['Spark plugs', 3615.4, 495.4, 470], ['Throttle body', 3610, 496.5, 478], ['AC compressor', 3604.6, 497.7, 486], ['Transmission', 3599.2, 499.3, 494]].map(([t, x, y, ty], i) => { return `<g style="--i:${i}"><path d="M3579 ${ty - 1.3} H3583 L${x} ${y}" class="tw-tag-l"/><circle cx="${x}" cy="${y}" r="1.25" class="tw-tag-ring"/><circle cx="${x}" cy="${y}" r=".6" class="tw-tag-d"/><text x="3578" y="${ty}" text-anchor="end" class="tw-tag-t">${t}</text></g>`; }).join('')}</g>`];
};

/* The workbench beside it: a lean to with a pegboard, a lamp, and
   everything else I've taken apart, each its own stop. */
const bench = () => `
    <rect x="3774" y="398" width="300" height="88" class="tw-fence tw-fo"/>
    <path d="${Array.from({ length: 18 }, (_, i) => `M${3790 + i * 16.5} 400 V486`).join(' ')}" class="tw-fence-l"/>
    <path d="M3766 390 H4082 L4076 400 H3772 Z" class="tw-awn"/>
    <rect x="3774" y="398" width="300" height="88" fill="url(#twGrain)" class="tw-nohit"/>
    <path d="M3775 400h298v8h-298z" class="tw-workshop-eave"/>
    <path d="M3776 391h295m-264 1-3 7m50-7-3 7m50-7-3 7m50-7-3 7m50-7-3 7m50-7-3 7" class="tw-workshop-light"/>
    <rect x="3797" y="406" width="256" height="48" rx="2" class="tw-workshop-frame"/>
    <rect x="3800" y="408" width="250" height="44" rx="2" class="tw-peg"/>
    <rect x="3800" y="408" width="250" height="44" rx="2" fill="url(#twPegHoles)" class="tw-nohit"/>
    <g class="tw-tools">
      <path d="M3803 410h244m-244 40h244" class="tw-workshop-light"/>
      <path d="M3814 412q0-3 2-3m16 4q0-3 2-3m30 4q0-3 2-3m65 8q0-5 2-5m15 5q0-4 2-4m46 17v5m40-5v5" class="tw-workshop-dark"/>
      <!-- a hammer -->
      <rect x="3813.4" y="417" width="3.2" height="22" rx="1.2" class="tw-woodhandle"/><path d="M3808 413 h13 v5 h-13 z M3821 413.4 q4 1 5 4.4 l-1.6 .4 q-1.2 -2.4 -3.4 -2.6" class="tw-steel"/>
      <path d="M3814.5 420v17m-5-22h10m66 7h23m-82-6h.1" class="tw-workshop-light"/>
      <!-- a wrench -->
      <path d="M3831 418 h3 v19 h-3 z" class="tw-steel"/><circle cx="3832.5" cy="416" r="3.4" class="tw-steel"/><rect x="3831.4" y="412.4" width="2.2" height="3.6" class="tw-pegcut"/><circle cx="3832.5" cy="439" r="2.6" class="tw-steel"/><circle cx="3832.5" cy="439" r="1.2" class="tw-pegcut"/>
      <!-- three screwdrivers -->
      ${[[3842, '#d93a2b'], [3848, '#f2b705'], [3854, '#2a6fd8']].map(([x, c]) => `<rect x="${x - 1.7}" y="414" width="3.4" height="8" rx="1.3" fill="${c}"/><path d="M${x} 422 V436" class="tw-shaft"/>`).join('')}
      <!-- pliers -->
      <path d="M3866 414 l-1.2 7 M3870 414 l1.2 7" class="tw-jaw"/><circle cx="3868" cy="422" r="1.4" class="tw-steel"/><path d="M3866.8 423 l-3 13 M3869.2 423 l3 13" class="tw-grip"/>
      <!-- a hand saw -->
      <path d="M3884 416 h4 l1.4 3 h22 v6.4 l-23.4 4 z" class="tw-sawblade"/><path d="M3889.4 429.4 l1 -1.4 l1 1.2 l1 -1.4 l1 1.2 l1 -1.4 l1 1.2 l1 -1.4 l1 1.2 l1 -1.4 l1 1.2 l1 -1.4 l1 1.2 l1 -1.4 l1 1.2 l1 -1.4 l1 1.2 l1 -1.4 l1 1.2 l1 -1.4 l1 1.2" class="tw-teeth"/><path d="M3880 414 q-2 0 -2 3 v8 q0 3 3 3 h4 v-14 z M3880.6 417 h2.4 v7 h-2.4 z" class="tw-sawhandle"/>
      <!-- a spool of wire -->
      <circle cx="3930" cy="426" r="8" class="tw-wire"/><circle cx="3930" cy="426" r="6" class="tw-wire"/><circle cx="3930" cy="426" r="4" class="tw-wire"/><circle cx="3930" cy="426" r="2" class="tw-spool"/>
      <!-- a tape measure, two clamps -->
      <rect x="3942" y="420" width="10" height="10" rx="3" class="tw-tape-m"/><circle cx="3947" cy="425" r="2.2" class="tw-tape-c"/><path d="M3952 428 h3" class="tw-tape-t"/>
      ${[3962, 3972].map((x) => `<path d="M${x} 414 h6 v20 h-6 M${x} 418 h3 M${x} 430 h3" class="tw-clamp2"/><path d="M${x + 3} 418 V430" class="tw-shaft"/>`).join('')}
      <path d="M3990 432 H4040" class="tw-shelf"/><path d="M3993 432 l3 3 v-3 M4037 432 l-3 3 v-3" class="tw-bracket"/>
      <rect x="3994" y="422" width="10" height="10" class="tw-box"/><path d="M3999 422 v10" class="tw-tape"/><rect x="4008" y="425" width="14" height="7" class="tw-box"/><rect x="4026" y="424" width="9" height="8" rx="1" class="tw-jar"/><rect x="4025.6" y="422.6" width="9.8" height="2" rx=".6" class="tw-canlid"/>
      <path d="M3832.5 423v12m33-10-2 8m6-8 1.7 7m58-12a6 6 0 0 1 5 2m13 1h3m44 1h7m10 2h9m7 0h5" class="tw-workshop-light"/>
      <path d="M3919 441l3-2h17l4 3-3 3h-17z" class="tw-workshop-notice"/>
      <path d="M3925 441.7h10m-10 1.6h7" class="tw-workshop-dark"/>
    </g>
    <path d="M3798 468 L3806 440 L3824 438" class="tw-lamparm"/><path d="M3818 434 l14 2 l-4 8 l-12 -2 z" class="tw-lampshade"/>
    <polygon points="3820,442 3830,444 3846,468 3800,468" class="tw-lampcone tw-nohit"/>
    <rect x="3790" y="468" width="270" height="5" rx="1" class="tw-benchtop"/><rect x="3790" y="468" width="270" height="5" rx="1" fill="url(#twGrain)" class="tw-nohit"/><path d="M3790 468.6 H4060" class="tw-benchedge"/>
    <path d="M3797 473h256v5h-256z" class="tw-workshop-frame"/>
    <path d="M3799 475h252m-250 20h248" class="tw-workshop-light"/>
    <path d="M3800 478l11 9h-4l-7-6m249-3-11 9h4l7-6" class="tw-workshop-frame"/>
    <!-- under the bench: a drawer unit, a stool, a bucket -->
    <rect x="3806" y="474" width="34" height="20" rx="1" class="tw-drawers"/>${[0, 1, 2].map((k) => `<path d="M3807.6 ${480 + k * 6} h30.8" class="tw-drawerline"/><rect x="3820" y="${476.4 + k * 6}" width="8" height="1.4" rx=".6" class="tw-drawerpull"/>`).join('')}
    <rect x="3964" y="478" width="16" height="2.4" rx="1" class="tw-stool"/><path d="M3966 480.4 l-2 25 M3978 480.4 l2 25 M3965 494 h14" class="tw-stool-l"/>
    <path d="M4028 492 h13 l-1.6 13 h-9.8 z" class="tw-bucket"/><path d="M4028.6 492 q6 -6 11.8 0" class="tw-bucket-h"/>
    <rect x="3794" y="473" width="5" height="33" class="tw-benchleg"/><rect x="4051" y="473" width="5" height="33" class="tw-benchleg"/>
    <rect x="3794" y="494" width="262" height="3" class="tw-benchleg"/>
    ${hot('p-macbook', `<g>
      <image href="assets/images/town/macbook.webp" x="3806" y="455.7" width="22" height="12.3" preserveAspectRatio="none"/>
      <g class="tw-mac-lcd" clip-path="url(#twMacScr)">
        <rect x="3808.6" y="456.4" width="16.8" height="10.1" class="tw-lcd-bleed"/>
        ${[[3810, '#ff2bd6'], [3811.2, '#29f0ff'], [3816.5, '#3dff6e'], [3821, '#fff'], [3823.4, '#ff2bd6']].map(([x, c]) => `<rect x="${x}" y="456.4" width=".5" height="10.1" fill="${c}"/>`).join('')}
        <g class="tw-mac-fractures"></g>
        <circle cx="3818" cy="461" r="1.6" class="tw-lcd-ink"/>
      </g>
      <g class="tw-mac-fire tw-nohit">${[[3812, 1], [3817.5, 1.35], [3823, 1.1]].map(([x, k], i) => `<path d="M${x} 466 c-2.4 -1.4 -2.6 -4 -1 -6.2 c.2 1.4 1 2 1.6 2.2 c-.4 -2.6 .6 -4.8 2.6 -6.2 c-.6 2.2 .4 3.8 1.4 4.8 c.6 -1 .7 -2 .5 -3 c1.8 2.4 1.8 5.6 -.6 8.4 z" transform="translate(${x} 466) scale(${k}) translate(${-x} -466)" class="tw-flame" style="--d:${(-i * 0.23).toFixed(2)}s"/>`).join('')}<circle cx="3818" cy="462" r="9" fill="url(#twFireGlow)" class="tw-fireglow"/></g>
    </g>`)}
    <g class="tw-smoke" aria-hidden="true">${[0, 1, 2].map((k) => `<circle cx="${3815 + k * 2.6}" cy="455" r="${1.6 + k * 0.3}" style="--d:${(-k * 0.8).toFixed(1)}s;--dx:${k % 2 ? -3 : 3}px"/>`).join('')}${[0, 1, 2, 3, 4].map((k) => `<circle class="tw-smoke-x" cx="${3810 + k * 4}" cy="452" r="${2.2 + (k % 2)}" style="--d:${(-k * 0.5).toFixed(1)}s;--dx:${k % 2 ? -5 : 5}px"/>`).join('')}</g>
    ${hot('p-lcd', `<g>
      <rect x="3840" y="464" width="20" height="4" rx="1" class="tw-pcb"/>
      <rect x="3842" y="451" width="16" height="12" rx="1" class="tw-lcdcase"/><rect x="3843.5" y="453" width="13" height="7" class="tw-lcd" data-fracture-pane="dark"/>
      <text x="3850" y="458.2" class="tw-lcd-t" text-anchor="middle">HELLO</text><rect x="3846" y="463" width="2" height="1" class="tw-pin2"/><rect x="3852" y="463" width="2" height="1" class="tw-pin2"/>
    </g>`)}
    ${hot('p-drive', `<g>
      <image href="assets/images/town/hdd.webp" x="3873.2" y="448.80" width="15.4" height="19.2" preserveAspectRatio="none"/>
      <g class="tw-hdd-rot" style="transform-origin:3880.84px 456.48px" data-c="3880.84,456.48,6.47"><circle cx="3884.85" cy="455.19" r=".55" class="tw-hdd-spot"/><g class="tw-hdd-rings"></g></g>
    </g>`)}
    ${hot('p-iron', `<g>
      <path d="M3900 466.5 L3922 461.5" class="tw-pencil"/><path d="M3900 466.5 L3897.5 467.1" class="tw-lead"/><path d="M3922 461.5 l2.4 -.55" class="tw-eraser"/>
      <circle cx="3897.4" cy="467" r="1.5" class="tw-hot-tip tw-nohit"/>
      <path d="M3924 461 q6 -6 10 2 M3924 461.6 q5 -3 10 3" class="tw-wires"/>
      <rect x="3932" y="461" width="8" height="7" rx="1.2" class="tw-charger"/>
    </g>`)}
    ${hot('p-lid', `<g>
      <path d="M3944 461 h22 q0 7 -11 7 q-11 0 -11 -7 z" class="tw-bowl"/>
      <g transform="translate(3966 461)"><g class="tw-lidflap"><path d="M0 0 h-22 a11 2 0 0 0 22 0 z" class="tw-lidp"/></g></g>
      <rect x="3966" y="463" width="6" height="5" rx="1" class="tw-servo"/>
    </g>`)}
    ${hot('p-oldlap', `<g>
      <path d="M3982 466 h26 l2 2 h-30 z" class="tw-oldbase"/>
      <rect x="3984" y="452" width="22" height="14" rx="1" class="tw-oldlid"/><rect x="3986" y="454" width="18" height="10" class="tw-oldscr" data-fracture-pane="dark"/>
      <path d="M3987.5 456.5 h6 M3987.5 459 h10 M3987.5 461.5 h4" class="tw-oldtxt"/>
    </g>`)}
    ${hot('p-dehum', `<g>
      <rect x="4018" y="440" width="26" height="28" rx="3" class="tw-dehum"/>
      <path d="M4022 445 h18 M4022 448 h18 M4022 451 h18" class="tw-grille"/>
      <rect x="4021" y="454" width="11" height="12" rx="1" class="tw-dehum-in"/><path d="M4023 456 v8 M4025.5 456 v8 M4028 456 v8 M4030.5 456 v8" class="tw-fins"/>
      <rect x="4034" y="456" width="7" height="10" rx="1" class="tw-tank"/>
      <path d="M4044 446 l6 3 v14 l-6 3" class="tw-panel-off"/>
    </g>`)}
    ${PROJ['p-crash']()}`;

/* A showroom: amber light, spots shining down onto the cars, glass in front.
   The cars are cut from one drawing (a Prius, a bZ and a Grand Highlander),
   each with its own daytime running lights traced out (car-*-drl): when its
   alarm goes off those strips light up, white, then amber, out of step. */
// l: the headlamps; p: the LED low-beam projectors under the running lights
// The windshields occupy different portions of the tinted and untinted sprites.
const CAR_GLASS = {
  prius: [[.146,.281],[.18,.171],[.221,.078],[.246,.052],[.75,.052],[.775,.081],[.818,.177],[.855,.281]],
  bz: [[.144,.298],[.183,.171],[.223,.083],[.248,.063],[.752,.063],[.777,.086],[.817,.175],[.854,.298]],
  gh: [[.146,.273],[.184,.157],[.227,.075],[.25,.064],[.75,.064],[.776,.078],[.815,.159],[.854,.273]],
};
const CAR = { prius: { a: 0.742, l: [[0.169, 0.463], [0.835, 0.464]], p: [[0.135, 0.487], [0.865, 0.487]] }, bz: { a: 0.781, l: [[0.192, 0.432], [0.811, 0.432]], p: [[0.125, 0.405], [0.875, 0.405]] }, gh: { a: 0.814, l: [[0.152, 0.388], [0.847, 0.387]], p: [[0.112, 0.425], [0.888, 0.425]] } };
const showroomRow = (edges, top, bottom) =>
  edges.slice(1).map((right, i) => [edges[i], top, right - edges[i], bottom - top]);
const SHOWROOM_WINDOWS = [
  ...showroomRow([462, 512, 562], 342, 392),
  ...showroomRow([462, 512, 562], 392, 482),
  ...showroomRow([658, 704.5, 751, 801, 845.5, 890], 356, 387.5),
  ...showroomRow([658, 704.5, 751], 387.5, 482),
  ...showroomRow([801, 845.5, 890], 387.5, 482)
];
const showroomFrames = SHOWROOM_WINDOWS.map(([x, y, w, h]) => `M${x} ${y}h${w}v${h}h${-w}Z`).join(' ');
/* A Toyota in profile, for the posters: a few body shapes, its own colour. */
const PROFILE = {
  van: { b: [[0, .6], [.03, .44], [.17, .36], [.31, .13], [.95, .11], [1, .3], [1, .62]], w: [[.33, .17], [.93, .15], [.95, .34], [.24, .36]], r: [.2, .8] },
  suv: { b: [[0, .6], [.02, .42], [.2, .35], [.3, .12], [.86, .1], [.98, .3], [1, .6]], w: [[.32, .16], [.84, .14], [.92, .33], [.24, .35]], r: [.2, .8] },
  boxy: { b: [[0, .6], [.02, .35], [.21, .31], [.25, .09], [.96, .09], [1, .14], [1, .6]], w: [[.27, .13], [.93, .13], [.93, .3], [.25, .31]], r: [.2, .8] },
  sedan: { b: [[0, .62], [.04, .48], [.24, .42], [.36, .2], [.64, .18], [.8, .4], [.97, .44], [1, .62]], w: [[.38, .23], [.62, .21], [.75, .4], [.3, .42]], r: [.2, .8] },
  truck: { b: [[0, .6], [.02, .42], [.21, .36], [.29, .12], [.55, .12], [.57, .36], [1, .37], [1, .62]], w: [[.31, .16], [.53, .16], [.53, .34], [.24, .36]], r: [.2, .82] },
  sport: { b: [[0, .66], [.05, .52], [.32, .44], [.46, .25], [.64, .23], [.84, .42], [1, .48], [1, .66]], w: [[.47, .28], [.62, .26], [.74, .42], [.38, .44]], r: [.21, .79] }
};
const profile = (kind, x, y, w, col) => {
  const P = PROFILE[kind], h = w * 0.42, pt = ([u, v]) => `${(x + u * w).toFixed(2)},${(y + v * h).toFixed(2)}`;
  const body = `<polygon points="${P.b.map(pt).join(' ')} ${pt([1, .8])} ${pt([0, .8])}" fill="${col}" class="tw-pp-body"/>`;
  const win = `<polygon points="${P.w.map(pt).join(' ')}" class="tw-pp-win"/>`;
  const wheels = P.r.map((u) => `<circle cx="${(x + u * w).toFixed(2)}" cy="${(y + .8 * h).toFixed(2)}" r="${(w * .085).toFixed(2)}" class="tw-pp-tyre"/><circle cx="${(x + u * w).toFixed(2)}" cy="${(y + .8 * h).toFixed(2)}" r="${(w * .035).toFixed(2)}" class="tw-pp-hub"/>`).join('');
  return body + win + wheels;
};
// [centre, width, model, body, colour, backdrop]
const POSTERS = {
  wing: [[482, 25, 'COROLLA', 'sedan', '#e8e4da', 'b'], [512, 25, 'SUPRA', 'sport', '#d93a2b', 's'], [542, 25, '4RUNNER', 'boxy', '#5a6b4a', 'b']],
  main: [[672, 25, 'CAMRY', 'sedan', '#9aa3ad', 's'], [702, 25, 'SIENNA', 'van', '#c9c2b4', 'b'], [732, 25, 'TACOMA', 'truck', '#c0392b', 's'],
         [816, 25, 'TUNDRA', 'truck', '#3b4a5c', 'b'], [846, 25, 'LAND CRUISER', 'boxy', '#e6dcc4', 's'], [876, 25, 'PRIUS', 'sedan', '#3a7bd5', 'b']]
};
const poster = ([cx, w, name, kind, col, bg], top) => {
  const h = w * 0.78, x = cx - w / 2, m = w * 0.07;
  const sky = bg === 's' ? 'url(#twPosterSun)' : 'url(#twPosterSky)';
  const ih = h - m * 2;
  return `<g class="tw-poster-f"><rect x="${x.toFixed(2)}" y="${top}" width="${w}" height="${h.toFixed(2)}" class="tw-pp-frame"/>
    <rect x="${(x + m).toFixed(2)}" y="${(top + m).toFixed(2)}" width="${(w - m * 2).toFixed(2)}" height="${ih.toFixed(2)}" fill="${sky}"/>
    <path d="M${(x + m).toFixed(2)} ${(top + m + ih * .62).toFixed(2)} l${((w - m * 2) * .35).toFixed(2)} ${(-ih * .3).toFixed(2)} l${((w - m * 2) * .25).toFixed(2)} ${(ih * .16).toFixed(2)} l${((w - m * 2) * .4).toFixed(2)} ${(-ih * .22).toFixed(2)} V${(top + m + ih).toFixed(2)} H${(x + m).toFixed(2)} Z" class="tw-pp-hill"/>
    <path d="M${(x + w - m - (w - m * 2) * .3).toFixed(2)} ${(top + m + ih).toFixed(2)} l${((w - m * 2) * .12).toFixed(2)} ${(-ih * .16).toFixed(2)} h${((w - m * 2) * .06).toFixed(2)} l${(-(w - m * 2) * .12).toFixed(2)} ${(ih * .16).toFixed(2)} z M${(x + w - m - (w - m * 2) * .14).toFixed(2)} ${(top + m + ih).toFixed(2)} l${((w - m * 2) * .12).toFixed(2)} ${(-ih * .16).toFixed(2)} h${((w - m * 2) * .02).toFixed(2)} v${(ih * .16).toFixed(2)} z" class="tw-pp-stripe"/>
    ${profile(kind, x + m + (w - m * 2) * .12, top + m + ih * .36, (w - m * 2) * .76, col)}
    </g>`;
};
const showroom = (x, y, w, h, cars, em = 'l') => {
  const ex = em === 'l' ? x + 9 : x + w - 9;
  const spots = cars.map((c) => c.cx), fy = y + h - 8;
  // Soft, angled reflections with a narrow secondary edge, one per bay.
  const shine = cars.map(({ cx }) => {
    const top = y - h * .09, bottom = y + h * .94;
    const start = cx + w * .12, end = start - h * .29;
    return `<path d="M${start} ${top} h11 L${end + 6} ${bottom} H${end} Z"/>
      <path d="M${start + 14} ${top} h2.4 L${end + 12} ${bottom} h-1.3 Z" opacity=".58"/>`;
  }).join('');
  // the back wall: a plain wall, a baseboard, and the posters
  const ps = POSTERS[em === 'l' ? 'main' : 'wing'];
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="tw-int"/>
      <rect x="${x}" y="${y + h - 22}" width="${w}" height="3" class="tw-baseboard"/>
      ${em === 'l' ? `<image href="assets/images/town/mural.webp" x="${x + 2}" y="${y + 10}" width="${w - 4}" height="${((w - 4) / 8.09).toFixed(2)}" preserveAspectRatio="none" class="tw-mural"/>` : ''}
      ${spots.map((cx, i) => `<polygon points="${cx - 10},${y} ${cx + 10},${y} ${cx + 44},${fy} ${cx - 44},${fy}" class="tw-spotcone" style="--i:${i}"/><rect x="${cx - 9}" y="${y}" width="18" height="4" rx="2" class="tw-lamp"/>`).join('')}
      <rect x="${x}" y="${fy}" width="${w}" height="8" class="tw-showfloor"/>
      ${spots.map((cx, i) => `<ellipse cx="${cx}" cy="${fy + 1}" rx="46" ry="6" class="tw-pool" style="--i:${i}"/>`).join('')}
      <!-- the reception and lounge from the mural picture, standing on the floor (one scale for both rooms) -->
      ${(() => { const k = 232 / 1476, fw = em === 'l' ? 1476 * k : 584 * k, fh = 318 * k; return `<image href="assets/images/town/${em === 'l' ? 'furn-r' : 'furn-l'}.webp" x="${(em === 'l' ? x : x + 4).toFixed(1)}" y="${(fy + 0.6 - fh).toFixed(2)}" width="${fw.toFixed(2)}" height="${fh.toFixed(2)}" preserveAspectRatio="none" class="tw-furn"/>`; })()}
      <g class="tw-alarmin tw-nohit" clip-path="url(#twShowGlass)"><rect x="${x}" y="${y}" width="${w}" height="${h}" class="tw-alarm-dark"/><circle cx="${ex}" cy="${y + 9}" r="30" fill="url(#twEmerg)"/><rect x="${ex - 4.5}" y="${y + 4}" width="9" height="4.6" rx="1.2" class="tw-emerg-box"/><rect x="${x}" y="${y}" width="${w}" height="${h}" class="tw-alarm-white"/></g>
      ${cars.map((c) => { const K = CAR[c.f], H = c.w * K.a, x0 = c.cx - c.w / 2, y0 = fy + 3 - H, at = (fx, fy2) => [(x0 + c.w * fx).toFixed(1), (y0 + H * fy2).toFixed(1)];
        const drl = (cls, f) => `<image href="assets/images/town/car-${c.f}-drl.webp" x="${x0.toFixed(1)}" y="${y0.toFixed(1)}" width="${c.w}" height="${H.toFixed(1)}" preserveAspectRatio="none" class="${cls}" filter="url(#${f})"/>`;
        return `<ellipse cx="${c.cx}" cy="${fy + 1.5}" rx="${c.w * 0.46}" ry="3.2" class="tw-carshadow"/><g class="tw-showcar" data-car="${c.f}">`
          // behind the glass: softened toward the room, by day and at night (baked into the pictures)
          + ['g tw-dayonly', 'gn tw-nightcar'].map((v) => { const [sfx, cls] = v.split(' '); return `<image href="assets/images/town/car-${c.f}-${sfx}.webp" x="${x0.toFixed(1)}" y="${y0.toFixed(1)}" width="${c.w}" height="${H.toFixed(1)}" preserveAspectRatio="none" class="tw-carimg ${cls}"/>` + bow(c.cx, y0 + H * 0.125 - c.w * 0.4 * 0.799 * 0.4, c.w * 0.4).replace('bow.webp', `bow-${sfx}.webp`).replace('class="tw-bow"', `class="tw-bow ${cls}"`); }).join('')
          + `<g class="tw-car-fractures" data-pane="${CAR_GLASS[c.f].map(([x, y]) => at(x, y).join(',')).join(' ')}"></g>`
          + `<g class="tw-carlights tw-nohit"><g class="tw-heads">${K.l.map(([a, b]) => { const [px, py] = at(a, b); return `<ellipse cx="${px}" cy="${py}" rx="9" ry="5" fill="url(#twLedBulb)" opacity=".7"/>`; }).join('')}${K.p.map(([a, b]) => { const [px, py] = at(a, b); return `<circle cx="${px}" cy="${py}" r="4.6" fill="url(#twLedBulb)"/><circle cx="${px}" cy="${py}" r="1.15" class="tw-proj"/>`; }).join('')}${drl('tw-drl', 'twDrlW')}</g>`
          + `<g class="tw-hzs">${K.l.map(([a, b]) => { const [px, py] = at(a, b); return `<ellipse cx="${px}" cy="${py}" rx="8" ry="4.4" fill="url(#twHaz)" opacity=".8"/>`; }).join('')}${drl('tw-drl', 'twDrlA')}</g></g></g>`; }).join('')}
      <!-- the alarm's white strobe catching the cars, in step with it -->
      <g class="tw-strobecars tw-nohit">${cars.map((c) => { const H = c.w * CAR[c.f].a; return `<image href="assets/images/town/car-${c.f}.webp" x="${(c.cx - c.w / 2).toFixed(1)}" y="${(fy + 3 - H).toFixed(1)}" width="${c.w}" height="${H.toFixed(1)}" preserveAspectRatio="none" filter="url(#twWhiteOut)"/>` + bow(c.cx, fy + 3 - H + H * 0.125 - c.w * 0.4 * 0.799 * 0.4, c.w * 0.4).replace('class="tw-bow"', 'filter="url(#twWhiteOut)"'); }).join('')}</g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" class="tw-glassover" mask="url(#twShowroomMask)"/>
      <g class="tw-shine tw-nohit" mask="url(#twShowroomMask)" clip-path="url(#twShowGlass)" fill="url(#twGlassReflection)" aria-hidden="true">${shine}</g>`;
};

// Stars: scattered at random (the same random every build), each with its own size and slow breath.
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const STARS = Array.from({ length: 210 }, () => { const r = rnd(); return `<circle cx="${(rnd() * WORLD).toFixed(1)}" cy="${(-560 + rnd() * 820).toFixed(1)}" r="${(0.5 + r * r * 1.6).toFixed(2)}" style="--t:${(3 + rnd() * 6).toFixed(1)}s;--d:${(-rnd() * 9).toFixed(1)}s;--lo:${(0.15 + rnd() * 0.35).toFixed(2)}"/>`; }).join('');

const SPARKS = Array.from({ length: 22 }, () => { const x = rnd() * WORLD, y = -520 + rnd() * 700, k = 0.6 + rnd() * 0.9; return `<path d="M0 -6 Q.7 -.7 6 0 Q.7 .7 0 6 Q-.7 .7 -6 0 Q-.7 -.7 0 -6 Z" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${k.toFixed(2)})" style="--t:${(2.4 + rnd() * 3.4).toFixed(1)}s;--d:${(-rnd() * 6).toFixed(1)}s"/>`; }).join('');

/* The police SUV (the picture), the size of the other cars, its lights all
   flashing: the bar on the roof, the headlights, red and blue on the bull bar
   and the mirror, the taillights. */
const PC = { w: 236, ground: 671 }; PC.h = PC.w * 689 / 1649;
const police = (x, cls) => {
  const top = PC.ground - PC.h, at = (fx, fy) => [(x + fx * PC.w).toFixed(1), (top + fy * PC.h).toFixed(1)];
  const glow = (p, r, g, c) => `<circle cx="${p[0]}" cy="${p[1]}" r="${r}" fill="url(#${g})" class="${c}"/>`;
  const dot = (p, r, c) => `<circle cx="${p[0]}" cy="${p[1]}" r="${r}" class="${c}"/>`;
  const R1 = at(0.545, 0.03), B1 = at(0.636, 0.03), HD = at(0.115, 0.433), BR = at(0.03, 0.47), BB = at(0.03, 0.6), MI = at(0.384, 0.3), TL = at(0.945, 0.42);
  return `<g class="tw-police ${cls}" aria-hidden="true">
      <ellipse cx="${(x + PC.w / 2).toFixed(1)}" cy="${PC.ground}" rx="${(PC.w * 0.45).toFixed(1)}" ry="4.6" class="tw-carshadow"/>
      <image href="assets/images/town/police.webp" x="${x}" y="${top.toFixed(2)}" width="${PC.w}" height="${PC.h.toFixed(2)}" preserveAspectRatio="none"/>
      <image href="assets/images/town/snow-police.webp" x="${x}" y="${top.toFixed(2)}" width="${PC.w}" height="${PC.h.toFixed(2)}" preserveAspectRatio="none" class="tw-snowimg"/>
      <g class="tw-pl tw-pl-r">${glow(R1, 26, 'twPlR', '')}${dot(R1, 3.2, 'tw-pl-rc')}${glow(BR, 9, 'twPlR', '')}${dot(BR, 1.3, 'tw-pl-rc')}${glow(MI, 9, 'twPlR', '')}${glow(TL, 12, 'twPlR', '')}${dot(TL, 2, 'tw-pl-rc')}</g>
      <g class="tw-pl tw-pl-b">${glow(B1, 26, 'twPlB', '')}${dot(B1, 3.2, 'tw-pl-bc')}${glow(BB, 9, 'twPlB', '')}${dot(BB, 1.3, 'tw-pl-bc')}${glow(MI, 9, 'twPlB', '')}${glow(TL, 12, 'twPlB', '')}${dot(TL, 2, 'tw-pl-bc')}</g>
      <g class="tw-pl tw-pl-w">${glow(HD, 14, 'twLedBulb', '')}${dot(HD, 2.2, 'tw-pl-wc')}<polygon points="${HD[0]},${(+HD[1] - 3).toFixed(1)} ${HD[0]},${(+HD[1] + 3).toFixed(1)} ${(+HD[0] - 70).toFixed(1)},${(+HD[1] + 22).toFixed(1)} ${(+HD[0] - 70).toFixed(1)},${(+HD[1] - 12).toFixed(1)}" fill="url(#twLed)" opacity=".7"/></g>
    </g>`;
};
// The moon's crescent, worked out from its two circles.
const MOON = (() => { const R = 30, r2 = 27, cx = 16, cy = -10, d = Math.hypot(cx, cy), a = (R * R - r2 * r2 + d * d) / (2 * d), h = Math.sqrt(R * R - a * a), px = a * cx / d, py = a * cy / d, ox = -cy / d * h, oy = cx / d * h; const p1 = [px + ox, py + oy], p2 = [px - ox, py - oy]; return `M${p1[0].toFixed(2)} ${p1[1].toFixed(2)} A${R} ${R} 0 1 1 ${p2[0].toFixed(2)} ${p2[1].toFixed(2)} A${r2} ${r2} 0 0 0 ${p1[0].toFixed(2)} ${p1[1].toFixed(2)} Z`; })();
const SKY_DAY = [[0, '#2779c8'], [.45, '#4f9fe0'], [.62, '#7cb9e9'], [.8, '#c4e0f2'], [.92, '#e3eef0'], [1, '#eef2ea']];
const SKY_NIGHT = [[0, '#090f26'], [.55, '#1c2b4a'], [.80, '#414769'], [1, '#8d6877']];
const skyHex = (st, y) => {
  const t = Math.min(1, Math.max(0, (y + 700) / 1300)); let i = 1; while (i < st.length - 1 && st[i][0] < t) i++;
  const [o0, c0] = st[i - 1], [o1, c1] = st[i], u = Math.min(1, Math.max(0, (t - o0) / (o1 - o0 || 1)));
  const h = (c) => [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16));
  const a = h(c0), b = h(c1); return '#' + a.map((v, k) => Math.round(v + (b[k] - v) * u).toString(16).padStart(2, '0')).join('');
};
/* Hunter's RAV4 (the picture, cut out): its wheels on the targets at 1020
   and 1093, its tyres on the lift. */
const RAV = { s: 73 / 1150 }; RAV.w = 1881 * RAV.s; RAV.h = 709 * RAV.s; RAV.x = 1020 - 353 * RAV.s; RAV.y = 455.6 - RAV.h; RAV.wy = RAV.y + 553 * RAV.s;
const TK = { x: 478, w: 620, ground: 486 };
TK.s = TK.w / 1972; TK.h = 438 * TK.s; TK.y = TK.ground - TK.h;
const TRUCK_GLASS = [
  { car: -1, panes: [[[246,491],[293,482],[347,369],[315,363],[278,414]],[[375,479],[484,461],[491,373],[469,368],[404,368],[375,399]]] },
  { car: 0, panes: [[[973,102],[1007,65],[1062,39],[1130,37],[1118,100]],[[1147,37],[1290,43],[1313,82],[1291,96],[1140,100]],[[1302,44],[1352,81],[1324,95]]] },
  { car: 1, panes: [[[1750,102],[1796,59],[1847,35],[1904,34],[1893,101]],[[1923,34],[2029,35],[2042,50],[2044,91],[2028,102],[1919,102]]] },
  { car: 2, panes: [[[2586,133],[2636,95],[2709,70],[2760,65],[2749,128]],[[2784,65],[2869,73],[2946,108],[2914,122],[2774,128]]] },
  { car: 3, panes: [[[3350,112],[3408,66],[3464,44],[3538,43],[3524,108]],[[3550,45],[3679,51],[3705,85],[3684,104],[3540,109]],[[3690,51],[3748,82],[3721,101]]] },
  { car: 4, panes: [[[959,448],[1005,414],[1069,383],[1124,382],[1113,450]],[[1144,382],[1283,384],[1305,416],[1295,439],[1138,449]],[[1299,384],[1340,421],[1311,439]]] },
  { car: 5, panes: [[[1695,455],[1732,436],[1770,426],[1783,470],[1740,468]],[[1790,425],[1854,422],[1871,473],[1798,470]],[[1880,421],[1943,427],[2028,468],[2004,479],[1891,476]]] },
  { car: 6, panes: [[[2460,427],[2519,392],[2544,391],[2530,443],[2487,442]],[[2552,393],[2645,391],[2663,448],[2545,443]],[[2669,394],[2710,395],[2775,420],[2829,458],[2691,449]]] },
  { car: 7, panes: [[[3259,430],[3293,400],[3313,399],[3301,454],[3282,450]],[[3325,399],[3419,398],[3455,465],[3318,454]],[[3443,400],[3509,400],[3602,446],[3582,466],[3477,465]]] },
];
const tk = (px, py) => [TK.x + px * TK.s, TK.y + py * TK.s];
// Its own amber lights (the cab's corner and roof lights, the trailer's side
// markers), flashing as hazards; never the cars it carries.
const HAZ = [[48, 327], [166, 162], [186, 160], [350, 328], [755, 392], [1552, 328], [1953, 370], [1934, 156]].map(([x, y]) => tk(x, y));
const HEAD = tk(34, 330);

/* The hills: a far range of rocky peaks (jagged ridges, a shaded face on
   each, a few strata), and in front of it a green ridge with a bumpy,
   tree-topped edge. A handful of paths in all, so it costs nothing to draw. */
const HILLS = (() => {
  let hs = 91; const r = () => ((hs = (hs * 16807) % 2147483647) / 2147483647);
  const f = (n) => n.toFixed(1);
  const keys = []; let x = -420;
  while (x < WORLD + 420) { keys.push([x, 346 + r() * 24]); x += 50 + r() * 70; keys.push([x, 282 + r() * 58]); x += 60 + r() * 90; }
  keys.push([x, 350]);
  // a jagged line from one key point to the next
  const jag = (a, b) => { const out = []; const n = Math.max(2, Math.round((b[0] - a[0]) / (8 + r() * 6))); for (let i = 1; i < n; i++) { const t = i / n; out.push([a[0] + (b[0] - a[0]) * t + (r() - 0.5) * 3, a[1] + (b[1] - a[1]) * t + (r() - 0.5) * 7]); } out.push(b); return out; };
  const ridge = [keys[0]]; const segs = [];
  for (let i = 1; i < keys.length; i++) { const j = jag(keys[i - 1], keys[i]); segs.push(j); ridge.push(...j); }
  const far = `M${f(ridge[0][0])} ${f(ridge[0][1])}` + ridge.slice(1).map((p) => ` L${f(p[0])} ${f(p[1])}`).join('') + ` V900 H-420 Z`;
  // the shaded face: from each peak down its right side, back up a gully
  let farShade = '', strata = '', scree = '';
  for (let i = 1; i < keys.length - 1; i += 2) {
    const pk = keys[i], sd = keys[i + 1], down = segs[i];
    const gx = pk[0] + (sd[0] - pk[0]) * (0.18 + r() * 0.2), gy = sd[1] + 20 + r() * 30;
    farShade += `M${f(pk[0])} ${f(pk[1])}` + down.map((p) => ` L${f(p[0])} ${f(p[1])}`).join('') + ` L${f(sd[0] - 6)} ${f(sd[1] + 26)} L${f(gx)} ${f(gy)} L${f(pk[0] + 2)} ${f(pk[1] + 14)} Z `;
    const face = segs[i - 1];
    const shoulder = face[Math.floor(face.length * .60)];
    const foot = sd[1] + 13;
    scree += `M${f(shoulder[0])} ${f(shoulder[1])} L${f(pk[0])} ${f(pk[1])} l-4 11 3 -2 -8 13 -4 1 -7 11 -5 1 -10 13 4 -12 -9 6 8 -14 -6 4 Z `;
    for (let k = 1; k < down.length; k += 2) {
      const [sx, sy] = down[k];
      const run = Math.min((foot - sy) * .7, 17 + k * 1.5);
      strata += `M${f(sx - 2)} ${f(sy + 5)} l${f(-run * .26)} ${f(run * .42)} -3 1.4 l${f(-run * .32)} ${f(run * .5)} `;
    }
  }
  // the green ridge: rolling, with small round bumps of trees along its top
  const yAt = (xx) => 404 - 14 * Math.sin(xx / 260) - 9 * Math.sin(xx / 97 + 1.3) - 5 * Math.sin(xx / 41 + 0.4);
  let near = `M-420 ${f(yAt(-420))}`, xx = -420;
  while (xx < WORLD + 420) { const step = 7 + r() * 10, nx = xx + step, b = 2 + r() * 5; near += ` Q${f(xx + step / 2)} ${f(yAt(xx + step / 2) - b * 1.6)} ${f(nx)} ${f(yAt(nx))}`; xx = nx; }
  near += ` V900 H-420 Z`;
  return { far, farShade, strata, scree, near };
})();

// Separate paint surfaces keep a blinking patrol car or moving lift from
// repainting the glass, buildings and landscape behind it. Bounds include
// the artwork's travel, shadows and hover halos, in street coordinates.
const slice = (name, bounds = '') => `<div class="tw-slice"${bounds ? ` data-bounds="${bounds}"` : ''}><svg class="tw-art-${name}" viewBox="0 0 1200 600"${name === 'sky' || name === 'street-front' ? ' aria-hidden="true"' : ''}>`;
const endSlice = '</svg></div>';
const [garageBack, garageFront] = garage();
const homeOffset = HOMESH - EAST;
const svg = `<div class="tw-scene" role="group" aria-label="Sommiville, an illustrated street of places I’ve worked">
  <div class="tw-plane tw-sky-plane">${slice('sky')}
  <defs>
    <linearGradient id="twMbEnamel" x2="0" y2="1"><stop stop-color="var(--tw-mb-light)"/><stop offset=".62" stop-color="var(--tw-mb-mid)"/><stop offset="1" stop-color="var(--tw-mb-dark)"/></linearGradient>
    ${landscapeDefs.trim()}
    <linearGradient id="twSkyDay" gradientUnits="userSpaceOnUse" x1="0" y1="-700" x2="0" y2="600">${SKY_DAY.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>
    <linearGradient id="twSkyNight" gradientUnits="userSpaceOnUse" x1="0" y1="-700" x2="0" y2="600">${SKY_NIGHT.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>
    <linearGradient id="twBeam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff2b2b" stop-opacity=".9"/><stop offset="1" stop-color="#ff2b2b" stop-opacity=".15"/></linearGradient>
    <linearGradient id="twCone" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#7aa2ff" stop-opacity=".5"/><stop offset="1" stop-color="#7aa2ff" stop-opacity="0"/></linearGradient>
    <linearGradient id="twSpot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7de" stop-opacity=".95"/><stop offset="1" stop-color="#fff7de" stop-opacity="0"/></linearGradient>
    <radialGradient id="twPool"><stop offset="0" stop-color="#fff6d8" stop-opacity=".95"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient>
    <radialGradient id="twHalo"><stop offset="0" stop-color="#ffd27a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
    <radialGradient id="twBack"><stop offset="0" stop-color="#fff2ec" stop-opacity=".95"/><stop offset=".55" stop-color="#ffd6cc" stop-opacity=".45"/><stop offset="1" stop-color="#ffd6cc" stop-opacity="0"/></radialGradient>
    <radialGradient id="twLamp"><stop offset="0" stop-color="#ffe2a0" stop-opacity=".5"/><stop offset="1" stop-color="#ffe2a0" stop-opacity="0"/></radialGradient>
    <linearGradient id="twHead" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#fff3c4" stop-opacity=".75"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/></linearGradient>
    <radialGradient id="twBulb"><stop offset="0" stop-color="#fffbe8"/><stop offset=".35" stop-color="#fff1b8" stop-opacity=".9"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></radialGradient>
    <linearGradient id="twLed" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#e4f2ff" stop-opacity=".85"/><stop offset="1" stop-color="#cfe6ff" stop-opacity="0"/></linearGradient>
    <radialGradient id="twLedBulb"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#dcefff" stop-opacity=".95"/><stop offset="1" stop-color="#bfe0ff" stop-opacity="0"/></radialGradient>
    <radialGradient id="twTail"><stop offset="0" stop-color="#ff6a5a"/><stop offset=".4" stop-color="#ff2b2b" stop-opacity=".8"/><stop offset="1" stop-color="#ff2b2b" stop-opacity="0"/></radialGradient>
    <radialGradient id="twHaz"><stop offset="0" stop-color="#ffb21a" stop-opacity=".95"/><stop offset="1" stop-color="#ffb21a" stop-opacity="0"/></radialGradient>
    <linearGradient id="twAmber" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffcf86"/><stop offset="1" stop-color="#e8a24f"/></linearGradient>
    <linearGradient id="twVcGlass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe2a1"/><stop offset=".6" stop-color="#f7b867"/><stop offset="1" stop-color="#e48f45"/></linearGradient>
    <radialGradient id="twVcLight"><stop offset="0" stop-color="#ffc977" stop-opacity=".55"/><stop offset="1" stop-color="#ffb35c" stop-opacity="0"/></radialGradient>
    <linearGradient id="twPorchShade" x2="0" y2="1"><stop stop-color="#30241d" stop-opacity=".42"/><stop offset="1" stop-color="#30241d" stop-opacity="0"/></linearGradient><linearGradient id="twBaySides"><stop stop-color="#291e1a" stop-opacity=".48"/><stop offset=".16" stop-color="#291e1a" stop-opacity=".08"/><stop offset=".48" stop-color="#291e1a" stop-opacity="0"/><stop offset=".78" stop-color="#291e1a" stop-opacity=".09"/><stop offset="1" stop-color="#291e1a" stop-opacity=".42"/></linearGradient>
    <clipPath id="twCarrierEdge"><path d="M92 6.2c18.6-.4 32.6 8.1 38.3 25.1 1.35 4.1 2.15 8.8 1.2 12.2-.6 2.05-4.6 3.55-6.4 4.95-3.3 7.3-7 15.6-9.05 25.6-.65 4.5-1.5 7.1-5.2 10.5-3.2 3.2-3.75 8.85-7.5 13.4-1.65 1.99-3.25 2.6-6.8 2.62H52.1c-6.95.28-10.4-5.05-12.3-10.62l-2.6-6.05c-4.25-3.65-5.75-9.35-3.1-15.2 3.5-7.1 9.55-10.1 17.4-9.55l.52-2.06 10.75-2.03 2.7 1.57c3.5-5.25 5.45-9.35 8.3-14.65 1.4-3.07 1.05-6.65-.13-10.95C68.5 14.75 78.9 6.7 92 6.2Z"/></clipPath>
    <filter id="twGarageBounce" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope=".77" intercept=".075"/><feFuncG type="linear" slope=".75" intercept=".064"/><feFuncB type="linear" slope=".72" intercept=".050"/></feComponentTransfer></filter><radialGradient id="twParkedShadow"><stop stop-color="#241c18" stop-opacity=".76"/><stop offset=".52" stop-color="#30251f" stop-opacity=".48"/><stop offset="1" stop-color="#30251f" stop-opacity="0"/></radialGradient><linearGradient id="twGarageLight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe7b0" stop-opacity=".55"/><stop offset=".7" stop-color="#ffe7b0" stop-opacity="0"/></linearGradient>
    <radialGradient id="twAdtGlow"><stop offset="0" stop-color="#3fa0ff" stop-opacity=".75"/><stop offset="1" stop-color="#1f6fd1" stop-opacity="0"/></radialGradient>
    <radialGradient id="twAdtPool"><stop offset="0" stop-color="#4aa8ff" stop-opacity=".7"/><stop offset="1" stop-color="#1f6fd1" stop-opacity="0"/></radialGradient>
    <radialGradient id="twMoonHalo"><stop offset="0" stop-color="#fff6dc" stop-opacity=".3"/><stop offset=".45" stop-color="#fff6dc" stop-opacity=".14"/><stop offset="1" stop-color="#fff6dc" stop-opacity="0"/></radialGradient>
    <linearGradient id="twBbBeam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff6d6" stop-opacity=".55"/><stop offset=".7" stop-color="#fff6d6" stop-opacity=".12"/><stop offset="1" stop-color="#fff6d6" stop-opacity="0"/></linearGradient>
    <linearGradient id="twBbWash" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff3c8" stop-opacity=".35"/><stop offset="1" stop-color="#fff3c8" stop-opacity="0"/></linearGradient>
    <pattern id="twConcrete" patternUnits="userSpaceOnUse" width="9" height="7"><circle cx="1.5" cy="2" r=".35" fill="rgba(0,0,0,.12)"/><circle cx="6" cy="5" r=".3" fill="rgba(255,255,255,.18)"/><circle cx="4" cy="1" r=".25" fill="rgba(0,0,0,.08)"/></pattern>
    <pattern id="twPegHoles" patternUnits="userSpaceOnUse" width="4" height="4"><circle cx="2" cy="2" r=".42" fill="rgba(80,55,30,.4)"/></pattern>
    <pattern id="twGrain" patternUnits="userSpaceOnUse" width="16.5" height="12"><path d="M2 0 q1.4 6 0 12 M8 0 q-1.2 4 .4 7 q1 3 -.2 5 M13 0 q1 5 -.6 12" fill="none" stroke="rgba(70,40,15,.16)" stroke-width=".5"/></pattern>
    <pattern id="twDrywall" patternUnits="userSpaceOnUse" width="24" height="86"><path d="M0 0 V86" stroke="rgba(0,0,0,.09)" stroke-width=".6"/></pattern>
    <linearGradient id="twBbShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0c18" stop-opacity=".42"/><stop offset=".45" stop-color="#0a0c18" stop-opacity=".14"/><stop offset=".8" stop-color="#0a0c18" stop-opacity="0"/></linearGradient>
    <linearGradient id="twHunterConcrete" x2="0" y2="1"><stop stop-color="#374448"/><stop offset="1" stop-color="#566061"/></linearGradient>
    <linearGradient id="twServiceWallShadow" x1="905.2" x2="939" y1="0" y2="0" gradientUnits="userSpaceOnUse">
      <stop stop-color="#243044" stop-opacity=".25"/>
      <stop offset=".38" stop-color="#243044" stop-opacity=".11"/>
      <stop offset="1" stop-color="#243044" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="twEaveShadow" x2="0%" y2="100%">
      <stop stop-color="#30151c" stop-opacity=".58"/>
      <stop offset=".28" stop-color="#30151c" stop-opacity=".36"/>
      <stop offset=".63" stop-color="#30151c" stop-opacity=".13"/>
      <stop offset="1" stop-color="#30151c" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="twBulge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".1"/><stop offset=".22" stop-color="#000" stop-opacity=".03"/><stop offset=".5" stop-color="#fff" stop-opacity=".12"/><stop offset=".78" stop-color="#000" stop-opacity=".03"/><stop offset="1" stop-color="#000" stop-opacity=".1"/></linearGradient>
    <linearGradient id="twPosterSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fa6c9"/><stop offset="1" stop-color="#d9e4ea"/></linearGradient>
    <linearGradient id="twPosterSun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f08a5d"/><stop offset="1" stop-color="#f6c99a"/></linearGradient>
    <filter id="twBehindGlass" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope=".72" intercept=".2"/><feFuncG type="linear" slope=".72" intercept=".19"/><feFuncB type="linear" slope=".72" intercept=".18"/></feComponentTransfer></filter>
    <filter id="twBehindGlassN" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope=".7" intercept=".2"/><feFuncG type="linear" slope=".68" intercept=".14"/><feFuncB type="linear" slope=".64" intercept=".06"/></feComponentTransfer></filter>
    <radialGradient id="twEmerg"><stop offset="0" stop-color="#ff3b2b" stop-opacity=".95"/><stop offset=".35" stop-color="#e0141c" stop-opacity=".45"/><stop offset="1" stop-color="#a00810" stop-opacity="0"/></radialGradient>
    <radialGradient id="twPlR"><stop offset="0" stop-color="#ff5a4a" stop-opacity=".95"/><stop offset=".4" stop-color="#ff1f1f" stop-opacity=".45"/><stop offset="1" stop-color="#ff1f1f" stop-opacity="0"/></radialGradient>
    <radialGradient id="twPlB"><stop offset="0" stop-color="#6aa2ff" stop-opacity=".95"/><stop offset=".4" stop-color="#2b6bff" stop-opacity=".45"/><stop offset="1" stop-color="#2b6bff" stop-opacity="0"/></radialGradient>
    <linearGradient id="twSignBeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4d0" stop-opacity=".3"/><stop offset="1" stop-color="#fff4d0" stop-opacity=".02"/></linearGradient>
    <filter id="twRavDrl" x="-20%" y="-30%" width="140%" height="160%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="1.3" result="b"/><feFlood flood-color="#e4f3ff"/><feComposite in2="b" operator="in" result="g"/><feGaussianBlur in="SourceAlpha" stdDeviation=".45" result="b2"/><feFlood flood-color="#ffffff"/><feComposite in2="b2" operator="in" result="g2"/><feMerge><feMergeNode in="g"/><feMergeNode in="g"/><feMergeNode in="g2"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="twRavTail" x="-20%" y="-30%" width="140%" height="160%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="b"/><feFlood flood-color="#ff2014"/><feComposite in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="twSoftLight" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.2"/></filter>
    <filter id="twDimMore" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope=".3"/><feFuncG type="linear" slope=".26"/><feFuncB type="linear" slope=".28"/></feComponentTransfer></filter>
    <filter id="twDimHalf" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope=".67"/><feFuncG type="linear" slope=".63"/><feFuncB type="linear" slope=".65"/></feComponentTransfer></filter>
    <filter id="twDimDay" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope=".84"/><feFuncG type="linear" slope=".82"/><feFuncB type="linear" slope=".84"/></feComponentTransfer></filter>
    <filter id="twWhiteOut" color-interpolation-filters="sRGB"><feFlood flood-color="#f4f8ff"/><feComposite in2="SourceAlpha" operator="in"/></filter>
    <filter id="twTextSh" x="-10%" y="-30%" width="120%" height="170%"><feGaussianBlur stdDeviation=".7"/></filter>
    <radialGradient id="twSignWash"><stop offset="0" stop-color="#ffe9b0" stop-opacity=".2"/><stop offset="1" stop-color="#ffe9b0" stop-opacity="0"/></radialGradient>
    <linearGradient id="twGpu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2d8b0"/><stop offset="1" stop-color="#b6a676"/></linearGradient>
    <pattern id="twPerf" patternUnits="userSpaceOnUse" width="1.1" height="1.1"><circle cx=".55" cy=".55" r=".26" fill="rgba(70, 60, 30, .42)"/></pattern>
    <linearGradient id="twHill1" gradientUnits="userSpaceOnUse" x1="0" y1="350" x2="0" y2="480"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>
    <clipPath id="twPortalClip"><ellipse cx="3390" cy="428" rx="40" ry="53"/></clipPath>
    <linearGradient id="twPolySheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".4" stop-color="#fff" stop-opacity=".04"/><stop offset=".55" stop-color="#fff" stop-opacity=".18"/><stop offset=".7" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <clipPath id="twGarSnow"><rect x="3532" y="300" width="240" height="100"/></clipPath>
    <clipPath id="twGarBleed"><rect x="3516" y="300" width="56" height="100"/></clipPath>
    <clipPath id="twCivBay"><path d="M${HOOD.map((p) => p.map((n) => n.toFixed(2)).join(' ')).join(' L')} Z"/></clipPath>
    <radialGradient id="twBeacon"><stop offset="0" stop-color="#ffd0c8"/><stop offset=".3" stop-color="#ff4a3a" stop-opacity=".85"/><stop offset="1" stop-color="#ff2a1a" stop-opacity="0"/></radialGradient>
    <radialGradient id="twPuff"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".55" stop-color="#f1f3f6" stop-opacity=".6"/><stop offset="1" stop-color="#e8ebef" stop-opacity="0"/></radialGradient>
    <radialGradient id="twPuffG"><stop offset="0" stop-color="#9ea3ab" stop-opacity=".9"/><stop offset=".55" stop-color="#9ea3ab" stop-opacity=".5"/><stop offset="1" stop-color="#9ea3ab" stop-opacity="0"/></radialGradient>
    <radialGradient id="twPuffD"><stop offset="0" stop-color="#4f5258" stop-opacity=".95"/><stop offset=".55" stop-color="#55585e" stop-opacity=".55"/><stop offset="1" stop-color="#55585e" stop-opacity="0"/></radialGradient>
    <linearGradient id="twEndL" x1="0" y1="0" x2="1" y2="0"><stop offset="0.8000" stop-color="#05070c" stop-opacity="1.000"/><stop offset="0.8200" stop-color="#05070c" stop-opacity="0.957"/><stop offset="0.8400" stop-color="#05070c" stop-opacity="0.756"/><stop offset="0.8600" stop-color="#05070c" stop-opacity="0.579"/><stop offset="0.8800" stop-color="#05070c" stop-opacity="0.425"/><stop offset="0.9000" stop-color="#05070c" stop-opacity="0.295"/><stop offset="0.9200" stop-color="#05070c" stop-opacity="0.189"/><stop offset="0.9400" stop-color="#05070c" stop-opacity="0.106"/><stop offset="0.9600" stop-color="#05070c" stop-opacity="0.047"/><stop offset="0.9800" stop-color="#05070c" stop-opacity="0.012"/><stop offset="1.0000" stop-color="#05070c" stop-opacity="0.000"/></linearGradient>
    <linearGradient id="twEndR" x1="0" y1="0" x2="1" y2="0"><stop offset="0.0000" stop-color="#05070c" stop-opacity="0.000"/><stop offset="0.0200" stop-color="#05070c" stop-opacity="0.012"/><stop offset="0.0400" stop-color="#05070c" stop-opacity="0.047"/><stop offset="0.0600" stop-color="#05070c" stop-opacity="0.106"/><stop offset="0.0800" stop-color="#05070c" stop-opacity="0.189"/><stop offset="0.1000" stop-color="#05070c" stop-opacity="0.295"/><stop offset="0.1200" stop-color="#05070c" stop-opacity="0.425"/><stop offset="0.1400" stop-color="#05070c" stop-opacity="0.579"/><stop offset="0.1600" stop-color="#05070c" stop-opacity="0.756"/><stop offset="0.1800" stop-color="#05070c" stop-opacity="0.957"/><stop offset="0.2000" stop-color="#05070c" stop-opacity="1.000"/></linearGradient>
    <radialGradient id="twPortalIn"><stop offset="0" stop-color="#f0d9ff"/><stop offset=".3" stop-color="#b56cff"/><stop offset=".75" stop-color="#6a1fd1"/><stop offset="1" stop-color="#2a0a5e"/></radialGradient>
    <radialGradient id="twPortalGlow"><stop offset=".45" stop-color="#a855f7" stop-opacity=".45"/><stop offset="1" stop-color="#a855f7" stop-opacity="0"/></radialGradient>
    <clipPath id="twTvScr"><rect x="3424.4" y="412" width="27.2" height="16.2"/></clipPath>
    <clipPath id="twHkScr"><rect x="936" y="411.4" width="23" height="13.5"/></clipPath>
    <mask id="twHallMask" maskUnits="userSpaceOnUse" x="${MAL.x - 10}" y="${(MAL.y - 10).toFixed(1)}" width="${MAL.w + 20}" height="${(MAL.h + 20).toFixed(1)}"><rect x="${MAL.x - 10}" y="${(MAL.y - 10).toFixed(1)}" width="${MAL.w + 20}" height="${(MAL.h + 20).toFixed(1)}" fill="#fff"/><g class="tw-hall-holes"></g></mask>
    <radialGradient id="twFireGlow"><stop offset="0" stop-color="#ffb347" stop-opacity=".8"/><stop offset="1" stop-color="#ff5a1f" stop-opacity="0"/></radialGradient>
    <radialGradient id="twBar"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".3" stop-color="currentColor" stop-opacity=".8"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></radialGradient>
    <linearGradient id="twGlassReflection" x2="0%" y2="100%">
      <stop stop-color="#f7fcff" stop-opacity=".65"/>
      <stop offset=".24" stop-color="#f7fcff" stop-opacity=".43"/>
      <stop offset=".76" stop-color="#edf7ff" stop-opacity=".17"/>
      <stop offset="1" stop-color="#edf7ff" stop-opacity="0"/>
    </linearGradient>
    <mask id="twShowroomMask" maskUnits="userSpaceOnUse" x="450" y="332" width="450" height="158"><rect x="450" y="332" width="450" height="158" fill="#fff"/><g id="twShowroomHoles"/></mask>
    <mask id="twBetGlassMask" maskUnits="userSpaceOnUse" x="3408" y="400" width="60" height="46"><rect x="3408" y="400" width="60" height="46" fill="#fff"/><g id="twBetHoles"/></mask>
    <mask id="twHpgGlassMask" maskUnits="userSpaceOnUse" x="3375" y="417" width="100" height="66"><rect x="3375" y="417" width="100" height="66" fill="#fff"/><g id="twHpgHoles"/></mask>
    <pattern id="twGlassGrain" width="9.69" height="8.55" patternUnits="userSpaceOnUse"><image href="assets/images/town/glass-grain.png" width="9.69" height="8.55" preserveAspectRatio="none"/></pattern>
    <radialGradient id="twWindshieldCore"><stop stop-color="#f6ffff" stop-opacity=".94"/><stop offset=".45" stop-color="#e5f6f8" stop-opacity=".64"/><stop offset="1" stop-color="#d8edf1" stop-opacity="0"/></radialGradient>
    <radialGradient id="twGlassInterior" cx=".27" cy=".1" r=".9"><stop stop-color="#34434a"/><stop offset=".78" stop-color="#151e22"/><stop offset="1" stop-color="#111719"/></radialGradient>
    <clipPath id="twShowGlass"><rect x="462" y="342" width="100" height="140"/><rect x="658" y="356" width="232" height="126"/></clipPath>
    <clipPath id="twMacScr"><rect x="3808.6" y="456.4" width="16.8" height="10.1"/></clipPath>
    ${WINS.map((w, i) => `<clipPath id="twCivWin${i}"><polygon points="${w.map((p) => p.join(',')).join(' ')}"/></clipPath>`).join('')}
    <pattern id="twShingles" patternUnits="userSpaceOnUse" width="8" height="6"><path d="M-2 3 Q0 .6 2 3 Q4 .6 6 3 Q8 .6 10 3 M0 6 Q2 3.6 4 6 Q6 3.6 8 6" fill="none" stroke="rgba(0,0,0,.3)" stroke-width=".7"/><path d="M0 1.2 H8" stroke="rgba(255,255,255,.06)" stroke-width=".6"/></pattern>
    <pattern id="twBricks" patternUnits="userSpaceOnUse" width="8" height="5"><path d="M0 .25 H8 M0 2.75 H8 M2 .25 V2.75 M6 2.75 V5.25" fill="none" stroke="rgba(40,16,8,.45)" stroke-width=".6"/></pattern>
    <pattern id="twSiding" patternUnits="userSpaceOnUse" width="12" height="5"><path d="M0 4.5 H12" stroke="rgba(0,0,0,.16)" stroke-width=".8"/><path d="M0 .6 H12" stroke="rgba(255,255,255,.16)" stroke-width=".5"/></pattern>
    <linearGradient id="twRoofShade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>
    <linearGradient id="twEaveShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".32"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
    <radialGradient id="twTvGlow" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="#9fd4ff" stop-opacity=".55"/><stop offset="1" stop-color="#9fd4ff" stop-opacity="0"/></radialGradient>
    <radialGradient id="twAlarmRed" cx=".5" cy=".35" r=".75"><stop offset="0" stop-color="#ff2a1f" stop-opacity=".62"/><stop offset=".6" stop-color="#c8101a" stop-opacity=".45"/><stop offset="1" stop-color="#5a0508" stop-opacity=".5"/></radialGradient>
    <linearGradient id="twAdtRim" gradientUnits="userSpaceOnUse" x1="0" y1="-31" x2="0" y2="-4"><stop offset="0" stop-color="#9ad6ff" stop-opacity=".55"/><stop offset=".22" stop-color="#3f9bff" stop-opacity=".18"/><stop offset=".45" stop-color="#1f6fd1" stop-opacity="0"/></linearGradient>
    <filter id="twDrlW" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB"><feMorphology in="SourceAlpha" operator="dilate" radius=".25" result="d"/><feGaussianBlur in="d" stdDeviation="1.3" result="b"/><feFlood flood-color="#d6ecff"/><feComposite in2="b" operator="in" result="g"/><feFlood flood-color="#ffffff"/><feComposite in2="d" operator="in" result="c"/><feMerge><feMergeNode in="g"/><feMergeNode in="g"/><feMergeNode in="g"/><feMergeNode in="c"/></feMerge></filter>
    <filter id="twToyLit" x="-30%" y="-40%" width="160%" height="180%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="3.2" result="b2"/><feFlood flood-color="#ff3a30" flood-opacity=".34"/><feComposite in2="b2" operator="in" result="g2"/><feMerge><feMergeNode in="g2"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="twToyLitS" x="-60%" y="-80%" width="220%" height="260%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="1.1" result="b2"/><feFlood flood-color="#ff3a30" flood-opacity=".34"/><feComposite in2="b2" operator="in" result="g2"/><feMerge><feMergeNode in="g2"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="twAdtLit" x="-60%" y="-40%" width="220%" height="180%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="b1"/><feFlood flood-color="#3fa8ff" flood-opacity=".95"/><feComposite in2="b1" operator="in" result="g1"/><feGaussianBlur in="SourceAlpha" stdDeviation="7" result="b2"/><feFlood flood-color="#1f78ff" flood-opacity=".8"/><feComposite in2="b2" operator="in" result="g2"/><feMerge><feMergeNode in="g2"/><feMergeNode in="g1"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="twDrlA" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="1.3" result="b"/><feFlood flood-color="#ffa21a"/><feComposite in2="b" operator="in" result="g"/><feFlood flood-color="#ffc35a"/><feComposite in2="SourceAlpha" operator="in" result="c"/><feMerge><feMergeNode in="g"/><feMergeNode in="g"/><feMergeNode in="c"/></feMerge></filter>
    <filter id="twSnowOn" x="-4%" y="-20%" width="108%" height="130%" color-interpolation-filters="sRGB"><feOffset in="SourceAlpha" dy="2.4" result="dn"/><feComposite in="SourceAlpha" in2="dn" operator="out" result="top"/><feMorphology in="top" operator="dilate" radius=".5" result="t2"/><feOffset in="t2" dy="-.7" result="t3"/><feGaussianBlur in="t3" stdDeviation=".3" result="tb"/><feFlood id="twSnowAmt" flood-color="#fbfdff" flood-opacity="0"/><feComposite in2="tb" operator="in" result="snow"/><feOffset in="snow" dy=".6" result="sd"/><feColorMatrix in="sd" type="matrix" values="0 0 0 0 .45  0 0 0 0 .52  0 0 0 0 .62  0 0 0 .8 0" result="shade"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="shade"/><feMergeNode in="snow"/></feMerge></filter>
    <filter id="twChar" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".16 .1 .04 0 .015  .12 .1 .04 0 .01  .1 .08 .04 0 .008  0 0 0 1 0"/></filter>
    <filter id="twDim" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope=".5"/><feFuncG type="linear" slope=".44"/><feFuncB type="linear" slope=".46"/></feComponentTransfer></filter>
    <radialGradient id="twScorch"><stop offset="0" stop-color="#140a04" stop-opacity=".85"/><stop offset=".7" stop-color="#2b1a0e" stop-opacity=".5"/><stop offset="1" stop-color="#2b1a0e" stop-opacity="0"/></radialGradient>
    <radialGradient id="twBoom"><stop offset="0" stop-color="#fffbe0"/><stop offset=".3" stop-color="#ffd25a" stop-opacity=".95"/><stop offset=".65" stop-color="#ff6a1a" stop-opacity=".7"/><stop offset="1" stop-color="#ff3a0a" stop-opacity="0"/></radialGradient>
    <radialGradient id="twWarm" cx=".5" cy="1" r=".9"><stop offset="0" stop-color="#ffb46a" stop-opacity=".35"/><stop offset="1" stop-color="#ffb46a" stop-opacity="0"/></radialGradient>
    <linearGradient id="twDayInt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3ead8"/><stop offset="1" stop-color="#ddd0b6"/></linearGradient>
    ${Object.entries(TINT).map(([id, c]) => `<filter id="twGlow-${id}" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="7.2" result="s"/><feComponentTransfer in="s" result="b"><feFuncA type="linear" slope="1.5"/></feComponentTransfer><feFlood flood-color="${c}" flood-opacity=".69"/><feComposite in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="twHalo-${id}" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="7.2" result="s"/><feComponentTransfer in="s" result="b"><feFuncA type="linear" slope="1.5"/></feComponentTransfer><feFlood flood-color="${c}" flood-opacity=".69"/><feComposite in2="b" operator="in"/></filter>`).join('')}
  </defs>

  <!-- Far: the sky, the hills, the clouds; it slides by slower than the
       block as you scroll along it. -->
  <g class="tw-far">
    <rect class="tw-sky-d" x="-800" y="-1600" width="${WORLD + 1600}" height="2140" fill="url(#twSkyDay)"/>
    <rect class="tw-sky-n" x="-800" y="-1600" width="${WORLD + 1600}" height="2140" fill="url(#twSkyNight)"/>
    <g class="tw-stars">${(() => { const c = STARS.split('<circle').filter((x) => x.trim()).map((x) => '<circle' + x); const G = 7; return Array.from({ length: G }, (_, g) => `<g class="tw-stargrp" style="--gt:${(4 + (g % 3) * 1.6).toFixed(1)}s;--gd:${(-g * 1.3).toFixed(1)}s">${c.filter((_, i) => i % G === g).join('')}</g>`).join(''); })()}</g>
    <!-- The sun and the moon are in the sky with the stars: they stay put while
         the street slides (a little, as the sky does), and lean out of view
         when the scene leans in. town.js sets where, once. -->
    <g class="tw-sun"><circle r="74" fill="url(#twHalo)"/><circle r="32" fill="url(#twSunDisc)"/><path d="M-29 13q12 .6 25 0m-21 5h26m-17 5h8m21-8h8" fill="none" stroke="#fff5c9" stroke-width="1.3" stroke-linecap="round" opacity=".7"/></g>
    <g class="tw-moon"><circle cx="-7" cy="5" r="62" fill="url(#twMoonHalo)"/><path d="${MOON}" fill="#f6eed6"/><path d="M-22-12q2-5 6-7m-10 16q-1 5 .3 8m7 10 3 3" stroke="#c6b895" stroke-width="1.6" stroke-linecap="round" fill="none"/></g>
    <rect class="tw-overcast" x="-800" y="-1600" width="${WORLD + 1600}" height="2140"/>
    <g class="tw-wxclouds"><g transform="translate(-300 80) scale(1.9)"><use href="#twCloudArt"/></g><g transform="translate(120 30) scale(2.2)"><use href="#twCloudArt"/></g><g transform="translate(560 90) scale(1.7)"><use href="#twCloudArt"/></g><g transform="translate(980 10) scale(2.3)"><use href="#twCloudArt"/></g><g transform="translate(1400 70) scale(1.9)"><use href="#twCloudArt"/></g><g transform="translate(1820 20) scale(2.1)"><use href="#twCloudArt"/></g><g transform="translate(2240 80) scale(1.8)"><use href="#twCloudArt"/></g><g transform="translate(2660 25) scale(2.2)"><use href="#twCloudArt"/></g><g transform="translate(3080 75) scale(1.9)"><use href="#twCloudArt"/></g><g transform="translate(3500 20) scale(2.1)"><use href="#twCloudArt"/></g><g transform="translate(3920 80) scale(1.8)"><use href="#twCloudArt"/></g><g transform="translate(4340 25) scale(2.2)"><use href="#twCloudArt"/></g><g transform="translate(4760 70) scale(1.9)"><use href="#twCloudArt"/></g></g>
    <g class="tw-cloud" style="--dur:110s;--from:-20s;--skyd:${skyHex(SKY_DAY, 132)};--skyn:${skyHex(SKY_NIGHT, 132)}"><g transform="translate(380 110) scale(1.0)"><use href="#twCloudArt"/></g></g>
    <g class="tw-cloud" style="--dur:150s;--from:-90s;--skyd:${skyHex(SKY_DAY, 75)};--skyn:${skyHex(SKY_NIGHT, 75)}"><g transform="translate(820 60) scale(0.7)"><use href="#twCloudArt"/></g></g>
    <g class="tw-cloud" style="--dur:180s;--from:-150s;--skyd:${skyHex(SKY_DAY, 72)};--skyn:${skyHex(SKY_NIGHT, 72)}"><g transform="translate(120 60) scale(0.55)"><use href="#twCloudArt"/></g></g>
    <g class="tw-cloud" style="--dur:170s;--from:-40s;--skyd:${skyHex(SKY_DAY, -102)};--skyn:${skyHex(SKY_NIGHT, -102)}"><g transform="translate(1500 -120) scale(0.8)"><use href="#twCloudArt"/></g></g>
    <g class="tw-cloud" style="--dur:210s;--from:-120s;--skyd:${skyHex(SKY_DAY, -206)};--skyn:${skyHex(SKY_NIGHT, -206)}"><g transform="translate(600 -220) scale(0.65)"><use href="#twCloudArt"/></g></g>
    <g class="tw-cloud" style="--dur:140s;--from:-70s;--skyd:${skyHex(SKY_DAY, 50)};--skyn:${skyHex(SKY_NIGHT, 50)}"><g transform="translate(1900 30) scale(0.9)"><use href="#twCloudArt"/></g></g>
    <g class="tw-cloudbank">
      ${[[303,186,.42],[844,230,.46],[1026,152,.82],[1558,192,.53],[2024,163,.7]].map(([x,y,k]) => `<use href="#twCloudArt" transform="translate(${x} ${y}) scale(${k} ${(k*.62).toFixed(2)})"/>`).join('')}
    </g>
    <g class="tw-cirrus" fill="none" stroke-linecap="round">
      ${[[680,177,.94],[1130,128,.88],[1390,214,.52],[1870,164,.94],[240,218,.7]].map(([x,y,k]) => `<path transform="translate(${x} ${y}) scale(${k})" d="M0 0q34-4 61-2t64-2m-89 8q24-1 46-3m39-7 25-2"/>`).join('')}
    </g>
    <ellipse class="tw-night tw-warmglow" cx="${WORLD / 2}" cy="470" rx="${WORLD}" ry="210" fill="url(#twWarm)"/>
    <path class="tw-range-back" d="${HILLS.far}" transform="translate(-60 -21)"/>
    <path class="tw-mtn2" d="${HILLS.far}"/>
    <path class="tw-mtn2-sh" d="${HILLS.farShade}"/>
    <path class="tw-scree" d="${HILLS.scree}"/>
    <path class="tw-mtn2-st" d="${HILLS.strata}"/>
    <path class="tw-mtn1" d="${HILLS.near}"/>
    ${distantWoods(WORLD)}
  </g>

  ${endSlice}</div>
  <div class="tw-plane tw-street-plane">
  ${slice('ground')}
  <g class="tw-art tw-mid">
    <rect class="tw-grass" x="-800" y="474" width="${WORLD + 1600}" height="700"/>
    <path class="tw-grass" d="${grassEdge()}"/>
    <rect x="-800" y="474" width="${WORLD + 1600}" height="126" fill="url(#twMeadowLight)" class="tw-nohit"/>
    ${lawn()}
    <!-- trees further back, only where nothing stands in front of them: beside the dealership's dock, behind the garage and the shed -->
    <g class="tw-backtrees">${tree(1010, 478, .62, 1)}${pine(1058, 480, 96)}${tree(1112, 478, .7, 2)}${tree(4238, 476, .95, 0)}${pine(4405, 478, 120)}${tree(4478, 476, 1.0, 2)}${pine(4560, 478, 132)}${tree(4632, 476, .95, 1)}${tree(4716, 476, .9, 0)}</g>
    <rect class="tw-snowground" x="-800" y="474" width="${WORLD + 1600}" height="700"/>
    <rect class="tw-sidewalk" x="-800" y="600" width="${WORLD + 1600}" height="14"/>
    <rect class="tw-curb" x="-800" y="613" width="${WORLD + 1600}" height="3"/>
    <rect class="tw-road" x="-800" y="616" width="${WORLD + 1600}" height="400"/>
    <rect x="-800" y="600" width="${WORLD + 1600}" height="100" fill="url(#twStoneFleck)" opacity=".38" class="tw-nohit"/>
    <path class="tw-lane" d="M-800 633 H${WORLD + 800} M-800 637 H${WORLD + 800}"/>
    <!-- the sidewalk in slabs, a crack here and there; the road patched, cracked and potholed, with one manhole -->
    <path d="${Array.from({ length: Math.ceil((WORLD + 1600) / 26) }, (_, i) => `M${-800 + i * 26} 600.4 l.9 13.2`).join(' ')}" class="tw-swjoint tw-nohit"/>
    <path d="M412 601 l3 4 l-1 4.6 l2.4 4 M1508 603 l4 3.4 l1.2 6 M2218 600.6 l-2 5 l2.6 3.4 M3302 602 l3.6 2.4 l.6 5 l2 3 M4470 600.8 l-1.4 6 l3 5" class="tw-swcrack tw-nohit"/>
    <g class="tw-nohit">${[[310, 618, 46, 9], [1890, 650, 58, 14], [3880, 621, 40, 8]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.4" class="tw-patch"/>`).join('')}</g>
    <path d="M150 662 l14 -3 l9 2 l12 -4 M1120 624 l10 2 l6 -2.4 l11 1.6 M2702 666 l9 -2 l8 1.4 l10 -3.2 l7 .8 M3460 645 l12 2 l8 -2 M4720 626 l8 1.6 l10 -1.6" class="tw-rcrack tw-nohit"/>
    ${[[214, 657, 1], [980, 627, .7], [1712, 664, 1.15], [2366, 644, .85], [3220, 660, 1], [4130, 652, .9], [4870, 668, 1.1]].map(([x, y, k]) => pothole(x, y, k * 1.4)).join('')}
    <g class="tw-nohit" transform="translate(2554 655)"><ellipse rx="12" ry="3.6" class="tw-mh-rim"/><ellipse rx="10.2" ry="2.9" class="tw-mh"/><path d="M-8 -1.4 H8 M-9.4 0 H9.4 M-8 1.4 H8 M-4 -2.6 V2.6 M0 -2.9 V2.9 M4 -2.6 V2.6" class="tw-mh-l"/></g>
    ${hot('shiva', `
    <!-- 2020, Shiva Robotics Academy: a billboard out past the block, search traffic climbing. -->
    <g transform="translate(415 24.3) scale(.72)" class="tw-distant">
      <rect x="82" y="346" width="9" height="276" class="tw-pole"/><rect x="202" y="346" width="9" height="276" class="tw-pole"/>
      <path d="M86.5 360 L206.5 420 M206.5 360 L86.5 420" class="tw-bb-brace"/>
      <rect x="18" y="244" width="258" height="106" rx="6" class="tw-board"/>
      <rect x="18" y="244" width="258" height="106" rx="6" fill="url(#twBbWash)" class="tw-bb-wash tw-nohit"/>
      <image href="assets/logos/opt/shiva.webp" x="36" y="256" width="82" height="82" preserveAspectRatio="xMidYMid meet" class="tw-rounded"/>
      <g class="tw-bars">${[16, 24, 34, 48].map((h, i) => `<rect x="${150 + i * 26}" y="${322 - h}" width="18" height="${h}" rx="3" style="--i:${i}"/>`).join('')}</g>
      <path d="M152 300 L244 258 m-14 -1 l14 1 l-3 13" class="tw-arrow"/>
      <text x="205" y="342" class="tw-plus" text-anchor="middle">+20%</text>
      <!-- the catwalk and its four floodlights, aimed up at the board -->
      <rect x="14" y="351" width="266" height="4" rx="1.5" class="tw-bb-walk"/><path d="M14 351 v-6 M280 351 v-6 M14 346 H280" class="tw-bb-rail"/>
      ${[48, 112, 182, 246].map((x) => `<g transform="translate(${x} 352)"><path d="M0 0 v8" class="tw-bb-arm"/><rect x="-5" y="6" width="10" height="5" rx="1.6" transform="rotate(-24 0 8)" class="tw-bb-lamp"/></g>`).join('')}
      <rect x="18" y="244" width="258" height="106" rx="6" fill="url(#twBbShade)" class="tw-bb-shade tw-nohit"/>
      <g class="tw-bb-beams tw-nohit">${[48, 112, 182, 246].map((x) => `<polygon points="${x - 4},354 ${x + 4},354 ${x + 40},236 ${x - 40},236" fill="url(#twBbBeam)"/><ellipse cx="${x}" cy="354" rx="6" ry="3" fill="url(#twBulb)"/>`).join('')}</g>
    </g>`)}
    <!-- The hedge along the back of the lawn (none where the truck parks). -->
    <g class="tw-backrow">${Array.from({ length: 36 }, (_, i) => 150 + i * 58).filter((x) => x < 270 || x > 1850).map((x, i) => bush(x, 486, 1.25 + (i % 3) * 0.15)).join('')}</g>
    <!-- The car hauler's own lane: concrete, from behind the woods to the dealership's dock. -->
    <path d="M-800 481.6 H1166 L1170 489.4 H-800 Z" class="tw-apron"/>
    <path d="M-800 481.6 H1166 L1170 489.4 H-800 Z" fill="url(#twConcrete)" class="tw-nohit"/>
    <path d="${Array.from({ length: 50 }, (_, i) => -800 + i * 40).map((x) => `M${x} 481.8 L${x + .6} 489.2`).join(' ')}" class="tw-joint tw-nohit"/>
    <path d="M-800 481.6 H1166 M-800 489.4 H1170" class="tw-apron-edge tw-nohit"/>
    <!-- Out on the west end: a little wood, wildflowers, a bench under the trees. -->
    ${pine(18, 488, 150)}${tree(70, 482, 1.25, 0)}${pine(132, 486, 120)}${tree(196, 486, 1.05, 1)}${pine(256, 490, 170)}${tree(318, 488, 1.15, 2)}
    ${[[40, 520, .8], [150, 530, .7], [262, 516, .9], [350, 532, .6], [96, 496, .85], [214, 497, .8], [326, 496, .9], [404, 497, .62]].map(([x, y, k]) => bush(x, y, k)).join('')}
    <g transform="translate(206 548)"><rect x="-16" y="-8" width="32" height="3" rx="1" class="tw-bench"/><rect x="-14" y="-5" width="2.4" height="6" class="tw-bench"/><rect x="11.6" y="-5" width="2.4" height="6" class="tw-bench"/><rect x="-16" y="-15" width="32" height="2.4" rx="1" class="tw-bench"/></g>
    ${tree(1866, 480, 1.1, 1)}${tree(1990, 484, 1.3, 2)}${pine(1930, 486, 150)}${tree(2090, 486, .95, 0)}

    <!-- 2025, JM Family Enterprises: one of its Southeast Toyota car haulers,
         backing up to the dealership with its hazards flashing. -->
    </g>${endSlice}
    ${slice('hauler', `${TK.x - TRUCK_WAIT - 240} 210 ${TK.x + TK.w + 80} 570`)}
    <g class="tw-art tw-truckdrive">
    ${hot('jm', `
    <g>
      <image href="assets/images/town/jm-truck.webp" x="${TK.x}" y="${TK.y.toFixed(2)}" width="${TK.w}" height="${TK.h.toFixed(2)}" preserveAspectRatio="none" class="tw-truckimg"/>
      <image href="assets/images/town/snow-truck.webp" x="${TK.x}" y="${TK.y.toFixed(2)}" width="${TK.w}" height="${TK.h.toFixed(2)}" preserveAspectRatio="none" class="tw-snowimg"/>
      <g class="tw-tcars"></g>
      <g class="tw-hazards">${HAZ.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="url(#twHaz)" class="tw-haz-glow"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" class="tw-haz"/>`).join('')}</g>
      <g class="tw-night tw-nohit"><polygon points="${HEAD[0]},${HEAD[1] - 5} ${HEAD[0]},${HEAD[1] + 5} ${HEAD[0] - 190},${HEAD[1] + 46} ${HEAD[0] - 190},${HEAD[1] - 26}" fill="url(#twHead)"/><circle cx="${HEAD[0]}" cy="${HEAD[1]}" r="11" fill="url(#twBulb)"/></g>
    </g>`)}
    </g>


    ${endSlice}
    ${slice('showroom', '1000 120 1900 560')}<g class="tw-art">
    ${hot('toyota', `
    <!-- 2024, Toyota: the dealership. A showroom wing, the tall main block
         with the emblem and the store's name, a glass entrance with a pillar
         at its heart, and the service wing where Hunter's gear lives. -->
    <g transform="translate(${OFF.toyota} 0)">
      <!-- a loading dock along the showroom's base, a ramp down to the lot -->
      <g transform="translate(0 -4)">
      <path d="M398 486 L438 464.6 H462 V486 Z" class="tw-ramp"/>
      <rect x="436" y="464" width="27" height="22" class="tw-dock"/>
      <path d="M436.6 464.6 H462" class="tw-dock-edge"/>
      <path d="M407 482.4 l3 -1.6 M416 477.6 l3 -1.6 M425 472.8 l3 -1.6 M433 468.4 l2.6 -1.4" class="tw-ramp-l"/>
      <path d="M440 464 V455 H460 V464 M450 455 V464" class="tw-rail"/>
      </g>
      <rect x="462" y="332" width="100" height="10" class="tw-red"/>
      <rect x="462" y="333" width="100" height="9" fill="url(#twEaveShadow)" class="tw-nohit"/>
      <rect x="458" y="324" width="108" height="10" rx="3" class="tw-roofcap"/>
      ${showroom(462, 342, 100, 140, [{ f: 'prius', cx: 512, w: 58 }], 'r')}

      <path d="M560 218 Q732 198.6 904 218 V482 H560 Z" class="tw-facade tw-fo"/>
      <path d="M560 218 Q732 198.6 904 218 V482 H560 Z" fill="url(#twBulge)" class="tw-nohit"/>
      <path d="M561.3 252.88 Q732 237.12 902.7 252.88 M561.3 288.9 Q732 275.7 902.7 288.9 M561.3 324.92 Q732 314.48 902.7 324.92 M561.3 362.2 Q605 358.7 651.8 357.1 M561.3 400.2 Q604 397.4 651.8 396.4 M561.3 438.1 Q603 436 651.8 435.6 M561.3 475.8 Q603 474.6 651.8 474.2 M646 212.1 V481 M732 209.6 V350 M818 212.1 V350" class="tw-grid"/>
      <image href="assets/logos/opt/toyota-mark.webp" x="584" y="230" width="112" height="80" preserveAspectRatio="xMidYMid meet" class="tw-tlogo tw-tmark"/><image href="assets/images/town/snow-tmark2.webp" x="584" y="226.92" width="112" height="83.08" preserveAspectRatio="xMidYMid meet" class="tw-snowimg"/>
      <text x="886" y="332.9" class="tw-sommi tw-textsnow" text-anchor="end">SOMMIVILLE</text><text x="886" y="334" class="tw-sommi" text-anchor="end">SOMMIVILLE</text>
      <rect x="652" y="350" width="244" height="132" class="tw-portal"/>
      ${showroom(658, 356, 232, 126, [{ f: 'bz', cx: 702, w: 59 }, { f: 'gh', cx: 846, w: 62 }])}
      <g class="tw-cracks" clip-path="url(#twShowGlass)"></g>
      <g class="tw-nohit" clip-path="url(#twShowGlass)">
        <path d="${showroomFrames}" class="tw-show-mull"/>
        <path d="${showroomFrames}" class="tw-show-mull-light"/>
      </g>
      <rect x="752" y="388" width="48" height="94" class="tw-pillar tw-fo"/>
      <image href="assets/logos/opt/toyota-emblem.webp" x="760" y="394" width="32" height="22" preserveAspectRatio="xMidYMid meet" class="tw-tlogo tw-temb"/><image href="assets/images/town/snow-temblem2.webp" x="760" y="393.33" width="32" height="22" preserveAspectRatio="none" class="tw-snowimg"/>
      <rect x="760" y="426" width="32" height="56" class="tw-doorglass" mask="url(#twShowroomMask)"/>
      <g class="tw-dooralarm tw-nohit" mask="url(#twShowroomMask)"><rect x="760" y="426" width="32" height="56" class="tw-alarm-dark"/><rect x="760" y="426" width="32" height="56" class="tw-alarm-white"/></g>
      <g class="tw-door-fractures tw-nohit"></g><path d="M776 426 V482" class="tw-mullp"/>${sticker(661, 437, 11, 'twShowroomHoles')}

      <rect x="904" y="284" width="230" height="198" class="tw-facade2 tw-fo"/>
      <g class="tw-nohit">
        <path d="M905.2 285.2h57v19h-57z M1020 305h56v24h-56z" fill="#fff" opacity=".12"/>
        <path d="M962 285.2v44.8m58-44.8v44.8m56-44.8v44.8m-170.8-25h227.6" fill="none" stroke="#65717c" stroke-opacity=".48" stroke-width=".7"/>
        <text x="1019" y="323.4" font-family="var(--font-sans)" font-size="18" font-style="italic" font-weight="850" letter-spacing=".2" text-anchor="middle" fill="#343b44">SERVICE</text>
      </g>
      <rect x="905.2" y="330" width="227.6" height="8" fill="#b7444a"/>
      <path d="M905.2 337.4h227.6v6.6H905.2z" fill="#31363c" class="tw-nohit"/>
      <path d="M905.2 337.4h227.6" stroke="#702c32" stroke-width="1.2" class="tw-nohit"/>
      <rect x="914" y="344" width="210" height="138" rx="3" class="tw-bay"/>
      <g class="tw-nohit">
        <path d="M916 348h206v121H916z" fill="#46545a"/><path d="M916 348l17 12v96l-17 26zm206 0-16 12v96l16 26z" fill="#303c42"/>
        <path d="M933 360h173v96H933z" fill="#596365"/>
        <path d="M933 376h173m-173 15h173m-173 15h173m-173 15h173m-173 15h173m-173 15h173m-140-91v95m65-95v95m60-95v95" fill="none" stroke="#333f44" opacity=".57" stroke-width=".7"/>
        <path d="M933 456h173l16 26H916z" fill="url(#twHunterConcrete)"/>
        <path d="M928 354h182m-171 4h159" fill="none" stroke="#829494" stroke-width=".7"/>
        <path d="M947 358h38m33 0h39m23 0h17" stroke="#ffe4ab" stroke-width="1.8" stroke-linecap="round"/>
        <g transform="translate(1090 372)"><rect width="11" height="10" rx=".8" fill="#d8ceb8"/><path d="M2 3h7m-7 2h4m-4 2h5" stroke="#6f7770" stroke-width=".7"/></g>
        <path d="M915.2 352v128m207.5-128v128" stroke="#aeb8b6" stroke-width="1.6"/>
      </g>
      <rect x="914" y="344" width="210" height="6" class="tw-baylight"/>
      <rect x="905.2" y="285.2" width="33.8" height="195.6" fill="url(#twServiceWallShadow)" class="tw-nohit"/>
    </g>`)}

    </g>${endSlice}
    ${slice('hunter', '1570 315 1890 515')}<g class="tw-art">
    ${hot('hunter', `
    <!-- 2026, Hunter Engineering: in Toyota's service bay, a Hunter HawkEye
         aligner (its two red beacons firing lasers) reading the targets on
         an SUV's wheels, the SUV going up and down on a Hunter scissor lift.
         The lift and the lasers are moved by the script. -->
    <g transform="translate(${OFF.hunter} 0)">
      <image href="assets/images/town/hawkeye.webp" x="916" y="370" width="75.4" height="112" preserveAspectRatio="xMidYMax meet"/>
      <g class="tw-hk-lcd" clip-path="url(#twHkScr)"><rect x="936" y="411.4" width="23" height="13.5" class="tw-tvlcd-bleed"/>${[[939, '#ff2bd6'], [942.6, '#29f0ff'], [950, '#3dff6e'], [955, '#fff']].map(([x, c]) => `<rect x="${x}" y="411.4" width=".6" height="13.5" fill="${c}" class="tw-tvlcd-bar"/>`).join('')}<g class="tw-hk-cr"></g></g>
      <ellipse cx="1057" cy="478.5" rx="65" ry="3.4" fill="url(#twParkedShadow)" opacity=".58"/><rect x="999" y="476" width="119" height="4.5" rx="1.4" class="tw-liftbase"/>
      <rect x="994" y="470" width="10" height="6" rx="1.5" class="tw-liftbase"/><rect x="1112" y="470" width="10" height="6" rx="1.5" class="tw-liftbase"/>
      <path class="tw-arm-b" d="M1004 474 L1110 466"/><path class="tw-arm-a" d="M1110 474 L1004 466"/>
      <circle class="tw-pivot" cx="1057" cy="470" r="3"/>
      <line class="tw-laser" pathLength="100" data-b="1" data-w="0"/><line class="tw-laser" pathLength="100" data-b="1" data-w="1"/>
      <g class="tw-plat">
        <image href="assets/images/town/rav4-side.webp" x="${RAV.x.toFixed(2)}" y="${RAV.y.toFixed(2)}" width="${RAV.w.toFixed(2)}" height="${RAV.h.toFixed(2)}" preserveAspectRatio="none" class="tw-car-img"/>
        <image href="assets/images/town/rav4-drl-lit.webp" x="${RAV.x.toFixed(2)}" y="${RAV.y.toFixed(2)}" width="${RAV.w.toFixed(2)}" height="${RAV.h.toFixed(2)}" preserveAspectRatio="none" class="tw-nohit"/>
        <image href="assets/images/town/rav4-tail-lit.webp" x="${RAV.x.toFixed(2)}" y="${RAV.y.toFixed(2)}" width="${RAV.w.toFixed(2)}" height="${RAV.h.toFixed(2)}" preserveAspectRatio="none" class="tw-nohit"/>
        ${[1020, 1093].map((x) => `<g transform="translate(${x} ${RAV.wy.toFixed(1)})"><path d="M-1 -9 V9 M-4.6 -8.6 H2.6 M-4.6 8.6 H2.6 M-1 0 H6" class="tw-clamp"/><rect x="-2.4" y="-2" width="2.8" height="4" rx=".6" class="tw-clamp-hub"/><path d="M5 -8.5 h10.4 l3.6 8.5 l-3.6 8.5 h-10.4 z" class="tw-tgt"/>${[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => `<path d="M${6.6 + c * 3.4} ${-6.6 + r * 3.9} l2.4 1.3 l-2.4 1.3 z" class="tw-tgt-sq"/>`).join('')).join('')}</g>`).join('')}
        <rect x="990" y="456" width="132" height="10" rx="2" class="tw-lift"/>
        <path d="M993 457.5h125m-121 6.4h29m56 0h34" stroke="#f3b3a2" stroke-width=".65" opacity=".85" class="tw-nohit"/>
        <path d="m994 461 1.8-2m2 2 1.8-2m112.4 2 1.8-2m2 2 1.8-2" stroke="#773c3b" stroke-width="1.3" class="tw-nohit"/>
        <path d="M997 456 l6 -9 h5 l3 9 z" class="tw-chock"/><rect x="997" y="453" width="14" height="3" class="tw-chockband"/>
        <image href="assets/logos/opt/hunter.webp" x="1036" y="457.5" width="40" height="7" preserveAspectRatio="xMidYMid meet"/>
      </g>
      <line class="tw-laser" pathLength="100" data-b="0" data-w="0"/><line class="tw-laser" pathLength="100" data-b="0" data-w="1"/>
      <g class="tw-beacons tw-nohit">${[[916 + 75.4 * 0.0745, 370 + 112 * 0.2057], [916 + 75.4 * 0.923, 370 + 112 * 0.2057]].map(([x, y]) => `<g class="tw-beacon"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5.4" fill="url(#twBeacon)"/><rect x="${(x - 1.1).toFixed(1)}" y="${(y - 1.6).toFixed(1)}" width="2.2" height="3.2" rx=".5" class="tw-beacon-c"/></g>`).join('')}</g>
    </g>`)}

    </g>${endSlice}
    ${slice('showroom-lawn', '1090 405 1900 625')}<g class="tw-art">
    <!-- Front lawn: a walk to the door, a drive to the service bay, hedges. -->
    <g transform="translate(${OFF.toyota} 0)">
    <path d="M760 482 H792 L815.2 600 H736.8 Z" class="tw-walk"/>
    ${slabs([760, 482], [792, 482], [815.2, 600], [736.8, 600], 13)}
    <path d="M914 482 H1124 L1147 600 H900 Z" class="tw-drive"/>
    <!-- the drive into the service bay: concrete slabs, tyre tracks, a couple of oil spots -->
    <path d="M914 482 H1124 L1147 600 H900 Z" fill="url(#twConcrete)" class="tw-nohit"/>
    <path d="M907.5 520 H1131.4 M903.3 560 H1139 M1019 482 V600" class="tw-joint"/>
    ${[[470, 492, .62], [512, 494, .56], [548, 492, .5], [688, 492, .55], [731, 493, .58], [822, 492, .58], [890, 493, .55]].map(([x, y, k]) => bush(x, y, k)).join('')}
    ${bush(666, 510, .8)}${bush(714, 506, .85)}${bush(866, 508, .9)}
    ${[700, 852].map((x) => `<g transform="translate(${x} 560)" class="tw-lamppost"><circle cx="0" cy="-60" r="30" fill="url(#twLamp)" class="tw-lampglow"/><rect x="-2" y="-60" width="4" height="60" class="tw-pole"/><rect x="-7" y="-66" width="14" height="7" rx="3" class="tw-bulb"/></g>`).join('')}
    </g>

    </g>${endSlice}
    ${slice('adt', '1100 280 1450 605')}<g class="tw-art">
    ${hot('adt', `
    <!-- 2026, ADT: its sign in the hedge in front of the dealership's wall, and
         its camera up at the roofline looking down over it. -->
    <g transform="translate(${OFF.adt} 0)">
      <g class="tw-adt-alarm tw-nohit"><circle cx="608" cy="458" r="58" fill="url(#twAdtGlow)" opacity=".8"/><ellipse cx="600" cy="510" rx="62" ry="8" fill="url(#twAdtPool)" opacity=".7"/></g>
      <image href="assets/images/town/adt-sign.webp?v=2" x="588" y="442" width="40" height="65" preserveAspectRatio="xMidYMax meet" class="tw-adtsign"/><image href="assets/images/town/snow-adt.webp" x="588" y="439.61" width="40" height="67.39" preserveAspectRatio="xMidYMax meet" class="tw-snowimg"/>
      <image href="assets/images/town/adt-sign-lit.webp" x="588" y="442" width="40" height="65" preserveAspectRatio="xMidYMax meet" class="tw-adtsign-lit tw-nohit" filter="url(#twAdtLit)"/>
      <g class="tw-adtbush">${bush(580, 518, .8)}${bush(634, 518, .95)}<g class="tw-adt-rim tw-nohit"><use href="#twShrubEdge" transform="translate(580 518) scale(.8)" fill="url(#twAdtRim)"/><use href="#twShrubEdge" transform="translate(634 518) scale(.95)" fill="url(#twAdtRim)"/></g></g>
      <g class="tw-cctv" transform="translate(554 338.5) scale(.84)">
        <ellipse cx="0" cy=".5" rx="4.8" ry="4.3" fill="#27323b" opacity=".28"/><circle r="4" class="tw-cctv-mount"/>
        <path d="M-4-3h.1m7 7h.1" class="tw-cctv-rib"/>
        <g class="tw-cctv-head" transform="rotate(-108)">
          <polygon points="-30,0 -150,-30 -150,30" fill="url(#twCone)" class="tw-cone tw-nohit" transform="scale(1 .55)"/>
          <g class="tw-cambody">
            <rect x="-10" y="-2.8" width="13" height="5.6" rx="2.8" class="tw-cctv-mount"/>
            <path d="M-39-5.8l3-3.5h22q7 .7 7 6v7q-1 4-6 5h-22l-4-3.4z" class="tw-camshell"/>
            <path d="M-36-7.5h21q4 0 6 2.8l-7-.7h-20z" class="tw-cctv-hood"/>
            <path d="M-35.7 3.8h25l-1.5 3h-22.2z" class="tw-cctv-shadow"/>
            <path d="M-34 5.4h2m1.2 0h2m1.2 0h2m14-5.5v2" class="tw-cctv-rib"/>
            <rect x="-41" y="-6" width="7" height="12" rx="2.2" class="tw-cctv-mount"/>
            <ellipse cx="-39.4" cy="0" rx="2.1" ry="4.1" class="tw-cctv-lens"/>
            <path d="M-40-2v1.6" class="tw-cctv-glint"/>
            <circle cx="-15" cy="1" r="1.15" class="tw-rec"/>
          </g>
        </g>
      </g>
    </g>`)}

    </g>${endSlice}
    ${slice('service', '430 210 1080 715')}<g class="tw-art">
    <!-- a pocket-sized competition field for the robot -->
    <g class="tw-court" aria-hidden="true">
      <path d="M574 566 H700 L708 597 H566 Z" class="tw-court-floor"/>
      <path d="M574 566 H700 L708 597 H566 Z" fill="url(#twConcrete)" opacity=".5"/>
      <path d="M637 566 V597 M596 566 L592 597 M678 566 L682 597" class="tw-court-line"/>
      <path d="M572 563 H702" class="tw-court-rail"/>${[574, 600, 637, 674, 700].map((x) => `<rect x="${x - .8}" y="558" width="1.6" height="8" class="tw-court-post"/>`).join('')}
      <rect x="574" y="558.6" width="126" height="5" class="tw-court-poly"/>
      <path d="M566 597 L574 566 V560 L565 592 Z" class="tw-court-blue"/><path d="M708 597 L700 566 V560 L709 592 Z" class="tw-court-red"/>
      <rect x="603" y="566.6" width="9" height="4" rx="1" class="tw-court-hub"/><rect x="663" y="566.6" width="9" height="4" rx="1" class="tw-court-hubr"/>
      <path d="M566 597 H708" class="tw-court-edge"/>
    </g>
    ${hot('rjax', `
    <!-- 2019, Renaissance Jax: a competition robot in the logo's green, on its
         own patch of lawn. Its camera locks on the target, or on the pointer
         when it comes close, and it drives over for a look. -->
    <g>
      <g transform="translate(552 534)"><rect x="-1.6" y="0" width="3.2" height="40" class="tw-pole"/><image href="assets/logos/opt/renaissance-jax.webp" x="-17" y="-30" width="34" height="34" class="tw-rounded"/></g>
      <g transform="translate(714 544)"><rect x="-2" y="0" width="4" height="34" class="tw-pole"/><path d="M-12 -18 v14 h24 v-14 h-6 v8 h-12 v-8 z" class="tw-target"/></g>
      <path class="tw-vision" d="M0 0"/>
      <g class="tw-reticle"><path d="M-20 -14 v-7 h7 M13 -21 h7 v7 M20 14 v7 h-7 M-13 21 h-7 v-7"/></g>
      <g class="tw-frc"><g class="tw-frc-flip">
        <circle cx="-25" cy="21" r="5" class="tw-tyre"/><circle cx="25" cy="21" r="5" class="tw-tyre"/><circle cx="0" cy="21" r="5" class="tw-tyre"/>
        <rect x="-35" y="-34" width="70" height="40" class="tw-frc-poly"/>
        ${[[-24, -4, 7], [-10, -2, 7], [5, -3, 7], [19, -4, 7], [-17, -15, 6.6], [-2, -16, 6.8], [13, -15, 6.6], [-26, -18, 6], [24, -17, 6], [-8, -27, 6], [7, -28, 6.2]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" class="tw-frc-ball"/><path d="M${(x - r * .62).toFixed(1)} ${(y - r * .05).toFixed(1)} q${(r * .12).toFixed(1)} ${(-r * .5).toFixed(1)} ${(r * .58).toFixed(1)} ${(-r * .55).toFixed(1)}" class="tw-frc-seam"/>`).join('')}
        <rect x="-35" y="-34" width="70" height="40" fill="url(#twPolySheen)" class="tw-frc-polyedge"/>
        ${[-35, -12, 10, 31].map((x) => `<rect x="${x}" y="-36" width="4" height="42" class="tw-frc-al"/><path d="M${x + 2} -33 V4" class="tw-frc-holes"/>`).join('')}
        <rect x="-38" y="-38" width="76" height="4" rx="1" class="tw-frc-al"/><path d="M-36 -36 H36" class="tw-frc-holes"/>
        <path d="M-20 -38 l6 -12 h14 l8 12 z" class="tw-frc-plate"/><circle cx="-12" cy="-46" r="4.2" class="tw-frc-roll"/><circle cx="-2" cy="-47" r="4.2" class="tw-frc-roll"/><circle cx="-12" cy="-46" r="1.4" class="tw-frc-axle"/><circle cx="-2" cy="-47" r="1.4" class="tw-frc-axle"/>
        <path d="M4 -41 q10 -6 22 -1" class="tw-frc-chain"/>
        <rect x="21" y="-46" width="4" height="10" class="tw-frc-al"/>
        <rect x="-41" y="2" width="82" height="17" rx="7" class="tw-frc-bump"/>
        <path d="M-37 6.5 H37" class="tw-frc-bumpl"/>
        <text x="0" y="15.6" class="tw-frc-86" text-anchor="middle">86</text>
        <g class="tw-rcoat"><path d="M-40 -36 q0 -6 6 -6 H34 q6 0 6 6 L42.4 -8 q-10.6 4 -21.2 0 q-10.6 4 -21.2 0 q-10.6 4 -21.2 0 q-10.6 4 -21.2 0 Z" class="tw-slicker tw-ol"/><path d="M-31 -38 l-1.6 26 M30 -38 l1.4 26" class="tw-slicker-sheen"/><path d="M-36 -14.5 q36 5 72 0" class="tw-slicker-seam"/></g>
        <g class="tw-turret" transform="translate(23 -48)"><rect x="-8" y="-5.4" width="16" height="10" rx="2.6" class="tw-cam"/><circle cx="6.4" cy="-0.4" r="3.2" class="tw-ringlight"/><g class="tw-rhat"><path d="M-6.4 -5.6 q6.4 -8.6 12.8 0 z" class="tw-slicker tw-ol"/><path d="M-11 -6 q11 -2.8 22 0 q.9 1.4 -.4 2.2 q-10.6 -2 -21.2 0 q-1.3 -.8 -.4 -2.2 z" class="tw-slicker tw-ol"/></g></g>
      </g></g>
    </g>`)}

    ${hot('rfa', `
    <!-- 2022, Robotics For All: the rover, in the colours of its logo, in its
         corner of the lawn. It comes over when the pointer is nearby, and
         keeps a polite distance. -->
    <g class="tw-rover" transform="translate(930 556)"><g class="tw-rover-flip"><g class="tw-rover-hop"><g class="tw-rover-bob"><g class="tw-rover-shiver">
      <rect x="-15" y="1" width="12" height="5.6" rx="2.6" fill="#1d2f6b" class="tw-ol"/><rect x="3" y="1" width="12" height="5.6" rx="2.6" fill="#1d2f6b" class="tw-ol"/>
      <rect x="-13" y="-9" width="10" height="11" fill="#2f63d6" class="tw-ol"/><rect x="3" y="-9" width="10" height="11" fill="#2f63d6" class="tw-ol"/>
      <path d="M-17 -15 l-7 7" class="tw-arm"/><path d="M17 -15 l7 7" class="tw-arm tw-arm-r"/>
      <rect x="-17" y="-21" width="34" height="15" rx="5" fill="#2f63d6" class="tw-ol"/>
      <rect x="-9" y="-24" width="18" height="11" rx="2" fill="#2f63d6" class="tw-ol"/><rect x="-5" y="-20" width="10" height="5.6" rx="1.5" fill="#1f4cb0"/>
      <circle cx="-6.6" cy="-22" r="1.2" fill="#ffd35c"/><circle cx="6.6" cy="-22" r="1.2" fill="#ffd35c"/>
      <rect x="-4" y="-25" width="8" height="3" fill="#3a3d46"/>
      <rect x="-26.5" y="-38" width="5" height="3.2" fill="#7d828c"/><rect x="21.5" y="-38" width="5" height="3.2" fill="#7d828c"/>
      <circle cx="-28" cy="-36.4" r="3.2" fill="#9aa0aa" class="tw-ol"/><circle cx="28" cy="-36.4" r="3.2" fill="#9aa0aa" class="tw-ol"/>
      <rect x="-22" y="-52" width="44" height="28" rx="7" fill="#ffc928" class="tw-ol"/>
      <path d="M-18-44v-2.5q0-2.5 3-2.5h18m13.2 3.5v7" fill="none" stroke="#ffeb99" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M-20-30q1.3 4.2 5 4.2h29" fill="none" stroke="#c48727" stroke-width="1"/>
      <path d="M-13-16v5m2-5v5m22-5v5m2-5v5m-23 13h4m10 0h4" stroke="#90afde" stroke-width=".9" stroke-linecap="round"/>
      <path d="M-18-35h2m-2 1.7h2m32-1.7h2m-2 1.7h2" stroke="#a87b2b" stroke-width=".65" stroke-linecap="round"/>
      <g class="tw-eyes"><rect x="-13.5" y="-44" width="10" height="10" rx="2.4" class="tw-eye"/><rect x="3.5" y="-44" width="10" height="10" rx="2.4" class="tw-eye"/></g>
      <g class="tw-eyes"><circle class="tw-pupil2 tw-follow" cx="-8.5" cy="-39" r="2.1"/><circle class="tw-pupil2 tw-follow" cx="8.5" cy="-39" r="2.1"/></g><path d="M-5 -29.4 q5 3 10 0" class="tw-smile"/><ellipse cx="0" cy="-29" rx="2.2" ry="2.5" class="tw-ohno"/><text x="15" y="-56" class="tw-eek" text-anchor="middle">!</text>
      <g class="tw-mail"><rect x="20" y="-14" width="20" height="14" rx="2" class="tw-paper"/><path d="M21 -13 l9 7 l9 -7" class="tw-fold"/></g>
      <g class="tw-rcoat"><path d="M-18 -21 h36 q4.4 0 5 4.2 l2.6 20.6 q.4 3.2 -3 3.2 h-45.2 q-3.4 0 -3 -3.2 l2.6 -20.6 q.6 -4.2 5 -4.2 z" class="tw-slicker tw-ol"/><path d="M-8.6 -21 l8.6 6.4 l8.6 -6.4" class="tw-slicker-seam"/><path d="M0 -14.6 v20" class="tw-slicker-seam"/><circle cx="-3" cy="-9" r="1.1" class="tw-slicker-btn"/><circle cx="-3" cy="-1.5" r="1.1" class="tw-slicker-btn"/><path d="M-14 -17 l-1.6 16" class="tw-slicker-sheen"/></g>
      <g class="tw-rhat"><path d="M-15 -49.4 q15 -16 30 0 z" class="tw-slicker tw-ol"/><path d="M-25.5 -48.8 q25.5 -5 51 0 q2 2.3 -1 3.6 q-24.5 -4.2 -49 0 q-3 -1.3 -1 -3.6 z" class="tw-slicker tw-ol"/></g>
      <g class="tw-jacket"><path d="M-19 -20 h38 a3 3 0 0 1 3 3 v19 a4 4 0 0 1 -4 4 h-36 a4 4 0 0 1 -4 -4 v-19 a3 3 0 0 1 3 -3 z" fill="#e63946" class="tw-ol"/><path d="M-20 -11 h40 M-20 -3 h40" class="tw-quilt"/><path d="M0 -19 v24" class="tw-zip"/><path d="M-12 -21 q12 7 24 0 v-2 h-24 z" fill="#f4f1ea" class="tw-ol"/></g>
      <g class="tw-beanie"><path d="M-21 -46 q21 -19 42 0 z" fill="#e63946" class="tw-ol"/><rect x="-22" y="-51" width="44" height="6" rx="3" fill="#f4f1ea" class="tw-ol"/></g>
    </g></g></g></g></g>`)}

    </g>${endSlice}
    ${slice('welcome', '2030 70 3390 750')}<g class="tw-art" transform="translate(${-EAST} 0)">
    <!-- The visitor center, where everyone starts: the woods behind it, the
         center, the welcome sign, a signpost, the Classic Line bus stop
         and the time machine. -->
    <g class="tw-woods">${pine(2822, 473, 201)}${pine(2880, 476, 247)}${pine(3044, 473, 235)}${pine(3100, 474, 192)}${pine(3150, 475, 142)}${pine(2786, 475, 130)}<g transform="translate(3125 474)" aria-hidden="true"><g class="tw-doe">
      <g fill="none" stroke="#77543e" stroke-width="2" stroke-linecap="round"><path class="tw-doe-step" d="M-6-9l1 5 -2 4 M5-10l-1 6 2 4"/><path d="M-3-9l-2 9 M7-10l1 9"/></g>
      <path fill="#ac805b" d="M-10-14q3-4 10-2l6 1 4-7 4 1-4 12q-3 3-8 2l-8-1q-6-1-4-6z"/><path fill="#bb9069" d="M9-22l-2-5q4 0 5 4l3-4 1 5 4 3q-1 3-5 2l-5-2z"/><circle cx="14.8" cy="-21" r=".75" fill="#413831"/><path d="M-8-14q-5-1-5-5 4 0 6 4" fill="#e2ceae"/>
    </g></g>${bush(3151, 477, .55)}</g>
    <path d="M2780 493q54-7 146-5l203 1 33 5q-128 10-318 8z M2551 488q35-5 84-4l106 1 19 5q-69 6-192 3z" class="tw-root-shadow tw-nohit"/>
    ${hot('vc', `
    <g>${visitorCenter()}
    </g>`)}
    <path d="M${VC.c - 58} 507 h116 L${VC.c + 69.5} 600 H${VC.c - 69.5} Z" class="tw-walk"/>
    ${garden()}
    ${slabs([VC.c - 58, 507], [VC.c + 58, 507], [VC.c + 69.5, 600], [VC.c - 69.5, 600], 15.5)}<path d="M${VC.c} 507 V600" class="tw-joint tw-nohit"/>
    ${busStop()}

    </g>${endSlice}
    ${slice('campus', '2880 130 4140 710')}<g class="tw-art" transform="translate(${-EAST} 0)">
    <!-- The UF corner: FICS (its sign, and HiPerGator's racks behind glass,
         the dish on the roof watching the sky), Malachowsky Hall, the gator
         pond in front of it, the gator globe. -->
    <path d="M4060 494 h32 l13.5 106 h-59 z" class="tw-walk"/>
    ${slabs([4060, 494], [4092, 494], [4105.5, 600], [4046.5, 600], 13)}
    ${hot('edu', `
    <g>
      <g class="tw-hall-g">
        <image href="assets/images/town/malachowsky-in.webp" x="${MAL.x}" y="${MAL.y.toFixed(2)}" width="${MAL.w}" height="${MAL.h.toFixed(2)}" preserveAspectRatio="none" class="tw-hall-in tw-dayonly"/>
        <image href="assets/images/town/malachowsky-in-n.webp" x="${MAL.x}" y="${MAL.y.toFixed(2)}" width="${MAL.w}" height="${MAL.h.toFixed(2)}" preserveAspectRatio="none" class="tw-hall-in tw-night"/>
        <g class="tw-hall-gl"><image href="assets/images/town/malachowsky-glass.webp" x="${MAL.x}" y="${MAL.y.toFixed(2)}" width="${MAL.w}" height="${MAL.h.toFixed(2)}" preserveAspectRatio="none" class="tw-dayonly"/><image href="assets/images/town/malachowsky-glass-n.webp" x="${MAL.x}" y="${MAL.y.toFixed(2)}" width="${MAL.w}" height="${MAL.h.toFixed(2)}" preserveAspectRatio="none" class="tw-night"/></g>
        <g class="tw-hall-cr"></g>
        <image href="assets/images/town/malachowsky.webp?v=7" x="${MAL.x}" y="${MAL.y.toFixed(2)}" width="${MAL.w}" height="${MAL.h.toFixed(2)}" preserveAspectRatio="none" class="tw-hall tw-dayonly"/>
        <image href="assets/images/town/malachowsky-n.webp" x="${MAL.x}" y="${MAL.y.toFixed(2)}" width="${MAL.w}" height="${MAL.h.toFixed(2)}" preserveAspectRatio="none" class="tw-hall tw-night"/>
        <image href="assets/images/town/snow-mala.webp" x="${MAL.x}" y="${MAL.y.toFixed(2)}" width="${MAL.w}" height="${MAL.h.toFixed(2)}" preserveAspectRatio="none" class="tw-snowimg"/>
      </g>
      <g class="tw-night tw-hallglow tw-nohit"><ellipse cx="3910" cy="494" rx="420" ry="22" fill="url(#twVcLight)"/></g>
      ${Array.from({ length: 21 }, (_, k) => 3516 + k * 39).filter((x) => x < 4046 || x > 4108).map((x, k) => bush(x, 500, .6 + (k % 3) * 0.08)).join('')}
      <path d="M3677 552c2-13 22-15 41-19 26-9 44-5 66-8 24-3 44 3 61 3 32 1 58 9 70 15 13 8 4 17-15 21-22 3-35 9-58 11-34 6-62 3-90 1-32-1-55-7-66-13q-11-4-9-11z" class="tw-pondbank"/>
      <path d="M3686 552q7-10 32-14c24-8 46-5 69-8 30-2 40 3 62 3 24 1 45 6 57 13 11 7-8 15-27 18-30 5-46 11-78 11-37 1-75-2-95-9q-24-6-20-14z" class="tw-pond"/>
      <path d="M3695 554q13-13 42-16 25-2 48-5m-79 26q15 5 34 5m75 6q26-.7 44-6m6-25 20 4" class="tw-water-line"/>
      ${[[3693,555,1],[3710,542,.67],[3889,563,.89],[3907,551,.76]].map(([x,y,k]) => `<g transform="translate(${x} ${y}) scale(${k})" class="tw-nohit"><path d="M0 0q-3-8-7-8 4 1 6 8-1-12-3-16 4 4 5 16 2-12 6-14-3 6-4 14 4-7 7-8-3 4-6 8z" fill="#59795c"/><path d="M1-2l-1-12m3 13 2-16" stroke="#657254" stroke-width=".8"/><path d="m0-14-.4-3m5.4 0 .45-3.2" stroke="#926849" stroke-width="2" stroke-linecap="round"/></g>`).join('')}
      ${[[3720, 556, 6], [3860, 560, 5], [3902, 548, 4.4]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.5}" class="tw-lily"/><path d="M${x} ${y} l${r * 0.9} ${-r * 0.2}" class="tw-lily-cut"/>`).join('')}
      <circle cx="3862" cy="558.6" r="1.6" class="tw-flower" style="--c:#ff9ec4"/>
      <ellipse cx="3684" cy="546" rx="12" ry="7" class="tw-rock"/><ellipse cx="3916" cy="566" rx="11" ry="6" class="tw-rock"/><ellipse cx="3876" cy="532" rx="9" ry="5" class="tw-rock"/>
      ${[3690, 3696, 3702, 3908, 3914, 3920].map((x, k) => `<path d="M${x} ${560 - (k % 3)} q${k % 2 ? 2 : -2} -14 ${k % 2 ? 1 : -1} -24" class="tw-reed"/><rect x="${x + (k % 2 ? 0.4 : -2.4)}" y="${531 - (k % 3)}" width="2.4" height="7" rx="1.2" class="tw-cattail"/>`).join('')}
      <g class="tw-ripples"><ellipse cx="3804" cy="555" rx="20" ry="5"/><ellipse cx="3804" cy="555" rx="20" ry="5" style="animation-delay:-1.6s"/></g>
      <g transform="translate(3696 3)"><g class="tw-gator" transform="translate(-10 26)">
        <!-- the back, a row of ridged scutes trailing off behind the head -->
        <path d="M54 530 Q66 525.4 86 523.6 L88 530 Z" class="tw-gator-b"/>
        ${[58, 64.5, 71, 77.5].map((x, k) => `<path d="M${x} ${528.6 - k * 1.2} q1.7 -3.2 3.4 0 z" class="tw-gator-s"/>`).join('')}
        <!-- the head: a long flat snout, the top darker, a paler band along it -->
        <path d="M84 530 Q85 518.6 99 515.4 Q110 512.6 124 514.8 L149 519 Q160 520.6 166.4 524.4 Q169.6 527 168.4 530 Z" class="tw-gator-b"/>
        <path d="M121 516.6 L149 520.6 Q158.4 522 163.6 525 L161.4 525.8 Q151 522.8 121 518.8 Z" class="tw-gator-hi"/>
        <path d="M86 528.2 Q120 525.6 167.6 528.4" class="tw-gator-jaw"/>
        ${[136, 142, 148, 154, 160].map((x) => `<path d="M${x} ${(527.1 + (x - 136) * 0.04).toFixed(2)} l1 1.7 l1 -1.7 z" class="tw-gator-tooth"/>`).join('')}
        <!-- the nostrils, up on a bump at the tip -->
        <ellipse cx="162.4" cy="522.6" rx="3.6" ry="2.1" class="tw-gator-b"/><ellipse cx="161.2" cy="522" rx=".7" ry=".45" class="tw-gator-nos"/><ellipse cx="164" cy="522.5" rx=".7" ry=".45" class="tw-gator-nos"/>
        <!-- scales -->
        ${[[128, 518.4, 1.6], [136, 519.6, 1.4], [144, 520.6, 1.3], [131, 522.6, 1.5], [140, 523.6, 1.4], [149, 524, 1.2], [92, 522, 1.8], [96, 526, 1.6], [110, 523.2, 1.7], [123, 525.4, 1.5], [104, 527.6, 1.4]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${(r * 0.62).toFixed(2)}" class="tw-gator-sc"/>`).join('')}
        <!-- the eyes, raised on their own bumps, under a heavy brow -->
        <circle cx="102" cy="518" r="7" class="tw-gator-b"/><circle cx="118" cy="518" r="7" class="tw-gator-b"/>
        <path d="M95.4 516 Q102 509.4 108.6 516" class="tw-gator-brow"/><path d="M111.4 516 Q118 509.4 124.6 516" class="tw-gator-brow"/>
        <ellipse cx="102" cy="517" rx="3.8" ry="3.3" class="tw-gator-iris"/><ellipse cx="118" cy="517" rx="3.8" ry="3.3" class="tw-gator-iris"/>
        <ellipse cx="102.6" cy="517" rx=".85" ry="2.7" class="tw-pupil"/><ellipse cx="118.6" cy="517" rx=".85" ry="2.7" class="tw-pupil"/>
        <circle cx="101" cy="515.6" r=".8" fill="#fff" opacity=".85"/><circle cx="117" cy="515.6" r=".8" fill="#fff" opacity=".85"/>
        <rect x="97" y="511" width="26" height="6" class="tw-lid"/>
        <!-- wet where it meets the water -->
        <path d="M82 529.6 Q126 527.4 170 529.6" class="tw-gator-wet"/>
      </g></g>
      <image href="assets/images/town/gator-globe.webp" x="3548" y="468" width="43.7" height="58" preserveAspectRatio="none" class="tw-globe"/>
      <image href="assets/images/town/snow-globe.webp" x="3548" y="468" width="43.7" height="58" preserveAspectRatio="none" class="tw-snowimg"/>
      <rect x="4196" y="512" width="3.4" height="56" class="tw-pole"/>
      <image href="assets/images/town/uf-pennant.webp" x="4199.4" y="512" width="60" height="20" preserveAspectRatio="xMinYMid meet"/>
      ${sticker(4250, 478, 6)}
    </g>`)}
    ${hot('fics', `
    <g>
      <rect x="3366" y="398" width="118" height="8" rx="2" class="tw-roofcap"/>
      <rect x="3370" y="405" width="110" height="81" class="tw-hpg tw-fo"/>
      <rect x="3374" y="408" width="102" height="8" rx="1" class="tw-hpg-band"/><text x="3425" y="414.2" class="tw-hpg-t" text-anchor="middle">HiPerGator AI</text>
      <rect x="3376" y="418" width="98" height="64" class="tw-hpg-room"/>
      <path d="M3376 474 H3474" class="tw-hpg-floor"/>
      <path d="M3378 422 H3472 M3378 424.4 H3472" class="tw-hpg-tray"/>
      ${[0, 1, 2, 3, 4, 5].map((k) => { const x = 3379 + k * 15.6, net = k === 1 || k === 4; return `<g transform="translate(${x} 426)"><rect width="13.4" height="54" rx=".8" class="tw-rack"/><rect x="2" y="1.4" width="9.4" height="2.4" rx=".3" class="tw-rack-lab"/><text x="6.7" y="3.2" class="tw-rack-t" text-anchor="middle">HiPerGator AI</text>${net ? [0, 1, 2, 3, 4, 5, 6, 7].map((r) => `<rect x="1.6" y="${5.6 + r * 5.8}" width="10.2" height="3.6" rx=".3" class="tw-netsw"/><path d="M${2.6 + (r % 3)} ${9.2 + r * 5.8} q.6 3 -.2 6 M${6 + (r % 2)} ${9.2 + r * 5.8} q.8 2.6 0 5.4 M${9.4 - (r % 3) * 0.6} ${9.2 + r * 5.8} q-.6 2.6 .2 5.4" class="tw-cable"/><circle cx="${3 + (r % 4) * 2}" cy="${7.4 + r * 5.8}" r=".5" class="tw-led" style="--d:${((r * 3 + k) % 7 * 0.19).toFixed(2)}s"/>`).join('') : [0, 1, 2, 3, 4].map((r) => `<rect x="1.4" y="${5.4 + r * 9.4}" width="10.6" height="8.4" rx=".5" class="tw-gpu"/><rect x="1.4" y="${5.4 + r * 9.4}" width="10.6" height="8.4" rx=".5" fill="url(#twPerf)" class="tw-nohit"/><rect x="1.8" y="${6 + r * 9.4}" width="1.2" height="7.2" rx=".3" class="tw-gpu-h"/>`).join('')}</g>`; }).join('')}
      <g mask="url(#twHpgGlassMask)">
        <rect x="3376" y="418" width="98" height="64" class="tw-hpg-glass" data-fracture-pane data-fracture-layer="lab" data-pane-grid="3424.5;" data-pane-threshold="2" data-pane-holes="twHpgHoles" data-pane-clear/>
        <path d="M3386 419 l-9 28 M3421 419 l-20 62 M3429 419 l-7 22" class="tw-hpg-shine"/>
        <g data-glass-layer="lab" class="tw-nohit"></g>
      </g>
      <rect x="3376" y="418" width="98" height="64" class="tw-hpg-frame tw-nohit"/>
      <path d="M3424.5 418 V482" class="tw-hpg-mull"/>
      ${sticker(3466, 474, 7, 'twHpgHoles')}
      <g class="tw-dish-g" transform="translate(3400 398)">
        <rect x="-3" y="-16" width="6" height="16" class="tw-pole"/><rect x="-5" y="-2" width="10" height="3" rx="1" class="tw-pole"/>
        <g class="tw-dish" transform="translate(0 -16)"><path d="M-4.4 1.6 L-2.6 -5 H2.6 L4.4 1.6 Z" class="tw-dishyoke"/><circle cx="0" cy="0" r="2.6" class="tw-dishbolt"/>
          <path d="M-22 -14 q22 22 44 0 z" class="tw-dishface"/><path d="M-19 -12.6 q19 15 38 0" class="tw-dishshade"/><ellipse cx="0" cy="-14" rx="22" ry="2.2" class="tw-dishrim"/>
          <path d="M-17 -13.4 L0 -23 M17 -13.4 L0 -23" class="tw-strut"/><path d="M0 -6 l0 -16" class="tw-feed"/><rect x="-2.2" y="-26.6" width="4.4" height="4" rx="1" class="tw-lnb"/><circle cx="0" cy="-28" r="2.2" class="tw-led-on"/>
        <g class="tw-pings"><path d="M-10 -34 a14 14 0 0 1 20 0"/><path d="M-18 -42 a26 26 0 0 1 36 0" style="animation-delay:.4s"/></g></g>
      </g>
      <!-- thick cables from the sign, coiled on the grass, up into HiPerGator -->
      ${[0, 1, 2, 3].map((k) => { const o = k * 2.4, c = ['#1b1d22', '#2a4fa8', '#c2410c', '#3a3d46'][k]; return `<path d="M${3450 + o * 0.4} ${514 - o} C${3466 + o} ${520 - o * 0.4} ${3482 + o} ${516 - o} ${3478 + o * 0.6} ${504 - o * 0.2} C${3474} ${494} ${3461 - o * 0.4} ${497 + o * 0.2} ${3464} ${506 + o * 0.3} C${3467 + o * 0.3} ${514} ${3481 + o} ${508} ${3470 + o} ${486}" class="tw-hcable" style="--c:${c}"/><path d="M${3398 - o * 0.4} ${514 - o} C${3384 - o} ${521} ${3372 - o} ${514} ${3380 - o * 0.4} ${505} C${3388} ${497} ${3396 + o * 0.2} ${504} ${3389} ${510} C${3382} ${515} ${3374 - o * 0.6} ${502} ${3380 + o} ${486}" class="tw-hcable" style="--c:${c}"/>`; }).join('')}
      <path d="M3471 499 l5.6 1.6 M3383.6 497.6 l-5 2.2" class="tw-ziptie"/>
      <path d="M3383 536 l3 -10 h76 l3 10 z" class="tw-planter2"/><path d="M3386 530 h76" class="tw-brick-l"/>
      ${[3389, 3397, 3406, 3442, 3451, 3459].map((x, k) => `<circle cx="${x}" cy="${525 - (k % 2)}" r="${3 + (k % 2)}" class="${k % 2 ? 'tw-leaf2' : 'tw-leaf'}"/>`).join('')}
      <rect x="3393" y="480" width="62" height="46" rx="3.6" class="tw-fics-slab"/>
      <rect x="3393" y="480" width="62" height="3.6" rx="1.6" class="tw-fics-top"/>
      <rect x="3396.6" y="486.4" width="54.8" height="25" rx="2.4" class="tw-fics-inset"/>
      <image href="assets/logos/opt/fics.webp" x="3403" y="487.6" width="42" height="22.6" preserveAspectRatio="xMidYMid meet"/>
      <text x="3424" y="519.6" class="tw-fics-t" text-anchor="middle">CYBERSECURITY RESEARCH</text>
    </g>`)}

    </g>${endSlice}
    ${slice('home', '3080 230 4950 670')}<g class="tw-art" transform="translate(${-EAST} 0)">
    <!-- Home: the house, the garage with my Civic, the bench, and the
         projects around them (see PROJECTS), then palms to the east. -->
    <g transform="translate(${HOMESH} 0)">
    ${bench()}
    ${garageBack.trim()}
    </g></g>${endSlice}
    ${slice('camry', `${homeOffset + 3634} 418 ${homeOffset + 3750} 515`)}<g class="tw-art" transform="translate(${homeOffset} 0)">
    ${storedCamry()}
    </g>${endSlice}
    ${slice('home-front', '3880 115 5370 690')}<g class="tw-art" transform="translate(${-EAST} 0)">
    <g transform="translate(${HOMESH} 0)">
    ${garageFront.trim()}
    ${tree(4222, 494, 1.0, 0)}${pine(4268, 498, 132)}${tree(4318, 496, 1.12, 2)}
    ${[[4236, 504, .7], [4290, 506, .6], [4344, 502, .75]].map(([x, y, k]) => bush(x, y, k)).join('')}
    ${[4200, 4212, 4226, 4248, 4276, 4300, 4330].map((x, k) => `<circle cx="${x}" cy="${512 + (k % 3) * 2}" r="1.6" class="tw-flower" style="--c:${['#ff6b8b', '#ffd166', '#c084fc', '#ff8fab', '#f97316'][k % 5]}"/>`).join('')}
    <g class="tw-snowy" aria-hidden="true"><rect x="3765" y="383" width="318" height="8.5" rx="4" class="tw-snowcap"/>
      <path d="M3524 380 Q3590 352 3655 324.4 Q3720 352 3786 380 L3782 375.4 Q3720 346 3655 318 Q3590 346 3528 375.4 Z" class="tw-snowslope" clip-path="url(#twGarSnow)"/>
      <g transform="${houseT}"><path d="M3392 333 Q3417 309 3440 286 Q3470.6 284.4 3501 286 Q3525 309 3549.4 333.4 L3545 329 Q3522 305 3499.4 281.4 Q3470.6 279.8 3441.6 281.4 Q3419 305 3396 329 Z" class="tw-snowslope"/>
      <path d="M3484.6 427 L3509 410.4 L3533.4 427 L3530 423 L3509 406 L3488 423 Z" class="tw-snowslope"/>
      <rect x="3493" y="237" width="25" height="6" rx="3" class="tw-snowcap"/></g></g>
    </g>

    ${tree(5128 + SH, 486, 1.25, 0)}${bush(5068 + SH, 492, .9)}${tree(5170 + SH, 492, .95, 1)}
    ${hot('tm', `
    <g transform="translate(${5094 + SH} 489) scale(.42) translate(-3390 -487)" class="tw-portal-g">
      <ellipse cx="3390" cy="430" rx="80" ry="92" fill="url(#twPortalGlow)" class="tw-pt-halo tw-nohit"/>
      <ellipse cx="3390" cy="488" rx="60" ry="9" class="tw-pt-pad"/>
      <ellipse cx="3390" cy="428" rx="40" ry="53" fill="url(#twPortalIn)"/>
      <g clip-path="url(#twPortalClip)"><g transform="translate(3390 428)"><g class="tw-pt-swirl"><path d="M0 0 C8.0 0.0 11.9 18.5 -23.5 32.3" class="tw-pt-arm"/><path d="M0 0 C-4.0 6.9 -22.0 1.0 -16.3 -36.5" class="tw-pt-arm"/><path d="M0 0 C-4.0 -6.9 10.1 -19.5 39.8 4.2" class="tw-pt-arm"/></g><g class="tw-pt-swirl tw-pt-back"><circle r="16" class="tw-pt-ring"/><circle r="30" class="tw-pt-ring"/></g></g></g>
      <rect x="3428.0" y="421.5" width="18" height="13" rx="2.6" transform="rotate(90 3437.0 428.0)" class="tw-pt-stone"/><rect x="3424.4" y="444.5" width="18" height="13" rx="2.6" transform="rotate(108 3433.4 451.0)" class="tw-pt-stone"/><rect x="3414.2" y="463.9" width="18" height="13" rx="2.6" transform="rotate(128 3423.2 470.4)" class="tw-pt-stone"/><rect x="3399.0" y="476.9" width="18" height="13" rx="2.6" transform="rotate(152 3408.0 483.4)" class="tw-pt-stone"/><rect x="3381.0" y="481.5" width="18" height="13" rx="2.6" transform="rotate(180 3390.0 488.0)" class="tw-pt-stone"/><rect x="3363.0" y="476.9" width="18" height="13" rx="2.6" transform="rotate(-152 3372.0 483.4)" class="tw-pt-stone"/><rect x="3347.8" y="463.9" width="18" height="13" rx="2.6" transform="rotate(-128 3356.8 470.4)" class="tw-pt-stone"/><rect x="3337.6" y="444.5" width="18" height="13" rx="2.6" transform="rotate(-108 3346.6 451.0)" class="tw-pt-stone"/><rect x="3334.0" y="421.5" width="18" height="13" rx="2.6" transform="rotate(-90 3343.0 428.0)" class="tw-pt-stone"/><rect x="3337.6" y="398.5" width="18" height="13" rx="2.6" transform="rotate(-72 3346.6 405.0)" class="tw-pt-stone"/><rect x="3347.8" y="379.1" width="18" height="13" rx="2.6" transform="rotate(-52 3356.8 385.6)" class="tw-pt-stone"/><rect x="3363.0" y="366.1" width="18" height="13" rx="2.6" transform="rotate(-28 3372.0 372.6)" class="tw-pt-stone"/><rect x="3381.0" y="361.5" width="18" height="13" rx="2.6" transform="rotate(-0 3390.0 368.0)" class="tw-pt-stone"/><rect x="3399.0" y="366.1" width="18" height="13" rx="2.6" transform="rotate(28 3408.0 372.6)" class="tw-pt-stone"/><rect x="3414.2" y="379.1" width="18" height="13" rx="2.6" transform="rotate(52 3423.2 385.6)" class="tw-pt-stone"/><rect x="3424.4" y="398.5" width="18" height="13" rx="2.6" transform="rotate(72 3433.4 405.0)" class="tw-pt-stone"/>
      <g class="tw-pt-motes tw-nohit"><circle cx="3366" cy="470" r="1.6" class="tw-pt-mote" style="--d:0.0s;--x:-6px"/><circle cx="3378" cy="467" r="2.2" class="tw-pt-mote" style="--d:-0.7s;--x:6px"/><circle cx="3388" cy="464" r="2.8" class="tw-pt-mote" style="--d:-1.4s;--x:-6px"/><circle cx="3399" cy="461" r="1.6" class="tw-pt-mote" style="--d:-2.1s;--x:6px"/><circle cx="3408" cy="458" r="2.2" class="tw-pt-mote" style="--d:-2.8s;--x:-6px"/><circle cx="3416" cy="455" r="2.8" class="tw-pt-mote" style="--d:-3.5s;--x:6px"/><circle cx="3372" cy="452" r="1.6" class="tw-pt-mote" style="--d:-4.2s;--x:-6px"/><circle cx="3394" cy="449" r="2.2" class="tw-pt-mote" style="--d:-4.9s;--x:6px"/></g>
    </g>`)}
    ${bush(5094 + SH - 16, 497, .9)}${bush(5094 + SH + 20, 499, .8)}${bush(5094 + SH + 3, 504, 1.02)}
    </g>${endSlice}
    ${slice('street-front')}<g transform="translate(${-EAST} 0)">
    ${tree(2250, 482, 1.15, 2)}
    <g class="tw-snowy" aria-hidden="true">${[[2568, 388, 208], [3172, 512, 100], [3268, 494, 60], [3366, 398, 118]].map(([x, y, w]) => `<rect x="${x - 1}" y="${y - 7}" width="${w + 2}" height="8.5" rx="4" class="tw-snowcap"/>`).join('')}
      <path d="M3284 467 Q3298 443.6 3312 467 Q3298 453.5 3285 466.5 Z" class="tw-snowslope"/>
      <path d="M${VC.l - 14} ${VC.eave + 6} L${VC.c} ${VC.apex - 4} L${VC.r + 14} ${VC.eave + 6} L${VC.r + 8} ${VC.eave + 1} L${VC.c} ${VC.apex - 12} L${VC.l - 8} ${VC.eave + 1} Z" class="tw-snowslope"/></g>
    </g>

    <!-- Snow, when it snows: it settles on the roofs and the ground (town.css). -->
    <g class="tw-snowy" aria-hidden="true">${[[443.8, 200, 152.6], [1158, 324, 108], [1604, 284, 234]].map(([x, y, w]) => `<rect x="${x - 1}" y="${y - 7}" width="${w + 2}" height="8.5" rx="4" class="tw-snowcap"/>`).join('')}<path d="M1255 212 Q1432 186 1609 212 L1609 205 Q1432 179 1255 205 Z" class="tw-snowcap"/></g>

    ${police(1236, 'tw-police-a')}${police(4012, 'tw-police-b')}

    <!-- Past either end of the street, darkness. -->
    <g class="tw-ends tw-nohit" aria-hidden="true"><rect x="-800" y="-1700" width="1000" height="3000" fill="url(#twEndL)"/><rect x="${WORLD - 200}" y="-1700" width="1000" height="3000" fill="url(#twEndR)"/></g>
    <!-- A pin on every stop. -->
    <g class="tw-pins">${roles.filter((r) => SPOT[r.id].pin || r.id === 'rjax' || r.id === 'rfa').map((r) => { const at = SPOT[r.id].pin ? [SPOT[r.id].pin[0] + (OFF[r.id] || 0), SPOT[r.id].pin[1]] : null; return `<g class="tw-pin" data-id="${r.id}"${at ? ` transform="translate(${at[0]} ${at[1]})"` : ''} style="--tint:${r.tint}"><circle r="9" class="tw-pin-ring"/><circle r="4.4" class="tw-pin-dot"/></g>`; }).join('')}</g>
  ${endSlice}</div>
</div>`;

const work = roles.filter((r) => r.year).sort((a, b) => a.year - b.year || order.indexOf(a.id) - order.indexOf(b.id));
const data = {
  order: [...work.map((r) => r.id), 'vc', ...BENCH.map((p) => p.id), ...PROJECTS.map((p) => p.id)],
  W: WORLD, home: HOME, sky: { day: SKY_DAY, night: SKY_NIGHT },
  truck: { wait: TRUCK_WAIT, right: TK.x + TK.w - TRUCK_WAIT, x: TK.x, y: +TK.y.toFixed(2), w: TK.w, h: +TK.h.toFixed(2), glass: TRUCK_GLASS },
  civic: { wins: WINS, fb: FB, rb: RB, ground: CV.ground },
  showroom: SHOWROOM_WINDOWS,
  hall: { ground: 494, polys: MALW.polys.map((p) => p.map(([u, v]) => [+(MAL.x + u * MAL.w).toFixed(1), +(MAL.y + v * MAL.h).toFixed(1)])) },
  pin: Object.fromEntries(Object.entries(SPOT).map(([k, v]) => [k, v.pin ? [v.pin[0] + (OFF[k] || 0), v.pin[1]] : null])),
  links: LINKS,
  roles: Object.fromEntries(roles.map((r) => { const z = SPOT[r.id].zoom; return [r.id, { ...r, zoom: z ? [z[0] + (OFF[r.id] || 0), z[1], z[2], z[3]] : null }]; }))
};

const html = `<!-- town:start -->
    <!-- THE BLOCK, on a wide screen: every place I've worked, on one drawn
         street. Built from retro/content.js by tools/build-town.js; edit
         that, not this. -->
    <section id="experience" class="section town-section">
      <h2 class="tw-sr">Around the block: every place I’ve worked</h2>
      <div class="tw" id="town" tabindex="-1">
        <div class="tw-stage">
          ${svg}
          <canvas class="tw-wx" aria-hidden="true"></canvas>
          <div class="tw-label" aria-hidden="true"></div>
          <button type="button" class="tw-pan tw-pan-l" aria-label="Look left"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          <button type="button" class="tw-pan tw-pan-r" aria-label="Look right"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          <aside class="tw-panel" aria-live="polite" hidden>
            <button type="button" class="tw-x ui-close" aria-label="Back to the whole block"></button>
            <div class="tw-panel-in"></div>
            <div class="tw-nav">
              <button type="button" class="tw-prev"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><span></span></button>
              <button type="button" class="tw-next"><span></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            </div>
          </aside>
        </div>
        <script type="application/json" id="town-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
      </div>
    </section>
    <!-- town:end -->`;

const f = path.join(root, 'index.html');
let page = fs.readFileSync(f, 'utf8');
if (page.includes('<!-- town:start -->')) page = page.replace(/<!-- town:start -->[\s\S]*?<!-- town:end -->/, html.trim());
else page = page.replace('<section id="experience" class="section journey-section" data-compact>', `${html.trim()}\n\n    <section id="path-circuit" class="section journey-section tw-retired" data-compact hidden>`);
fs.writeFileSync(f, page);
console.log('index.html updated', page.length);

/* The classic portfolio (the menu and the visitor center's exit link to
   it): the same page without the town, the old timeline back in its place,
   scrolling as a normal page (town.css scopes the full window to
   html:not(.classic)). */
let classic = page
  .replace('<html lang="en">', '<html lang="en" class="classic">')
  .replaceAll('href="eras.html"', 'href="eras.html?from=classic"')
  .replace(/^    <div class="loader-paper town-paint-paper">.*<\/div>\n/m, '')
  .replace(/^  <script async src="town-paint\.js[^"]*"><\/script>\n\n/m, '')
  .replace('content="#070a1a" media', 'content="#050814" media').replace('content="#9fcbef" media', 'content="#eef2f8" media')
  .replace(/<!-- town:start -->[\s\S]*?<!-- town:end -->/, '')
  .replace('<section id="path-circuit" class="section journey-section tw-retired" data-compact hidden>', '<section id="experience" class="section journey-section" data-compact>')
  .replace('<link rel="canonical" href="https://ajaysommi.github.io/" />', '<link rel="canonical" href="https://ajaysommi.github.io/classic.html" />');
if (!classic.includes('class="classic"') || classic.includes('town:start') || !classic.includes('<section id="experience" class="section journey-section"')) throw new Error('classic page did not build');
fs.writeFileSync(path.join(root, 'classic.html'), classic);
console.log('classic.html updated', classic.length);
