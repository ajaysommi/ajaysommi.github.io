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
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const has = (f) => fs.existsSync(path.join(root, f));
const big = (s) => { for (const k of ['-800', '-960']) { const f = s.replace(/-(400|480)\.webp$/, k + '.webp'); if (f !== s && has(f)) return f; } return s; };

const TINT = { vc: '#19633a', tm: '#8b5cf6', rjax: '#1fd12a', shiva: '#2f7fb5', rfa: '#f2b705', fics: '#fa4616', toyota: '#eb0a1e', jm: '#00857c', hunter: '#d0202e', adt: '#1f6fd1', edu: '#0021a5' };
const LOGO = { rfa: ['roboticsforall', 'roboticsforall'], fics: ['fics', 'fics-light'], toyota: ['toyota', 'toyota-light'], jm: ['jm-family', 'jm-family-light'], hunter: ['hunter', 'hunter-light'], adt: ['adt', 'adt'], shiva: ['shiva', 'shiva'], rjax: ['renaissance-jax', 'renaissance-jax'] };

/* Each story, told plainly: what changed because of the work, then how. */
const STORY = {
  rjax: "Taught a competition robot to aim by itself. I wrote the camera code that spotted targets mid match, so it lined up its shots without the driver's help.",
  shiva: "Helped more families find robotics classes: search visits grew 20% in one summer after I reworked the academy's site around what parents were actually searching for.",
  rfa: "Saved volunteers hours every week. My scripts filed each family's sign up details and sent their confirmation emails automatically, so nobody had to copy them by hand.",
  fics: "Found weak spots in AI chatbots before bad actors could. I built tools that automatically tried to trick ChatGPT into misbehaving, and helped work out how to block those tricks.",
  toyota: "Caught bad tire packages before they became recalls: 20% fewer tire warranty claims and over $150k saved. I tracked tire readings from Hunter balancers (sent through HunterNet) across 51,000 vehicles and flagged any package over the limit. I also automated work that saved about 350 hours a year.",
  jm: "Made it easy to spot employees with access they shouldn't have, using an automated check across Microsoft Graph, Salesforce and MuleSoft. I also analysed 100k+ events from JM Lexus and Toyota dealerships and helped set up GPT agents that answer questions about them.",
  hunter: "Made it possible to reset Hunter's alignment machines remotely instead of sending a technician, across 100,000+ machines worldwide. I designed and built the secure reset myself, and fixed crashes during machine setup.",
  adt: "Designed an AI check that catches false alarms before emergency responders are sent, and pitched it to senior leadership. I also kept ADT's Salesforce platform under its limits and got releases shipping again."
};

/* The block is wider now (it fills the window and scrolls sideways), so
   each place keeps its drawing and is moved along the street by OFF. */
/* Everything from the visitor center east is drawn in its own coordinates
   and slid back west by EAST, so the gap after the dealership stays short. */
const EAST = 320;
const WORLD = 5180 - EAST;
const HOME = 2850 - EAST;   // the visitor center, where the street starts
const OFF = { edu: -EAST, fics: -EAST, shiva: 230, rjax: 330, toyota: 700, hunter: 700, adt: 700, vc: -EAST, tm: -EAST };
// The home (the house, the garage and the bench) sits east of Malachowsky Hall,
// drawn in its own coordinates and slid along by HOMESH.
const HOMESH = 700;
// The truck waits a little way up the street and backs in once you get near.
const TRUCK_WAIT = 110;

/* What each place is, for anyone who hasn't heard of it. */
const ABOUT = {
  rjax: 'A student robotics team in Jacksonville that builds robots for head to head competitions.',
  shiva: 'A robotics academy that teaches kids to build and code robots.',
  rfa: 'A volunteer run nonprofit that teaches kids robotics and coding, often for free.',
  fics: 'The University of Florida’s cybersecurity research institute, where researchers work out how computer systems (and now AI) get attacked, and how to stop it.',
  toyota: 'Southeast Toyota gets new Toyotas from the factory to more than 170 dealerships across five southeastern states. It’s part of JM Family.',
  jm: 'One of the largest privately owned companies in the US, based in Florida. It runs Southeast Toyota, which delivers new Toyotas to dealers across the Southeast, and JM Lexus, its own Lexus dealership, along with car loan and warranty businesses.',
  hunter: 'Hunter makes the machines repair shops use to align wheels and balance tires.',
  adt: 'The home security company behind the blue sign.'
};

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
  { id: 'p-lid', name: 'Auto lid', tint: '#14b8a6', step: [5, 6], title: 'The self opening toilet lid', zoom: [3900, 418, 120, 66], pin: [3960, 450] },
  { id: 'p-oldlap', name: 'Old laptop', tint: '#475569', step: [4], badge: 'Try', role: 'Off the clock · an experiment, just for fun', title: 'The smallest OS I could find', zoom: [3936, 418, 120, 66], pin: [3996, 449] },
  { id: 'p-dehum', name: 'Dehumidifier', tint: '#38bdf8', step: [3], title: 'Why did the dehumidifier stop?', zoom: [3971, 418, 120, 66], pin: [4031, 438] }
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
  { id: 'p-gatorgoods', src: ['projects', 'gatorgoods'], name: 'GatorGoods', tint: '#fa4616', zoom: [3374, 488, 96, 82], pin: [3412, 504] },
  { id: 'p-sommiscript', src: ['projects', 'sommiscript'], name: 'SommiScript', tint: '#f59e0b', zoom: [3432, 512, 70, 58], pin: [3466, 528] },
  { id: 'p-betai', src: ['projects', 'betai'], name: 'BetAI', tint: '#16a34a', zoom: [3400, 386, 76, 66], pin: [3438, 402] },
  { id: 'p-wadfs', src: ['projects', 'wadfs'], name: 'WAD FS', tint: '#7c3aed', zoom: [3546, 404, 84, 84], pin: [3579, 430] },
  { id: 'p-crash', src: ['projects', 'crash'], name: 'Crash Analysis', tint: '#dc2626', zoom: [4086, 424, 100, 80], pin: [4130, 448] }
];
PROJECTS.forEach((p) => { TINT[p.id] = p.tint; OFF[p.id] = HOMESH - EAST; });
BENCH.forEach((p) => { TINT[p.id] = p.tint; OFF[p.id] = HOMESH - EAST; });

/* Where each stop is: the box the scene leans in to, and its pin. */
const SPOT = {
  shiva: { zoom: [196, 186, 190, 110], pin: [290, 196] },
  rjax: { zoom: null, pin: null },
  rfa: { zoom: null, pin: null },
  edu: { zoom: [3420, 300, 600, 290], pin: [3690, 520] },
  jm: { zoom: [400, 250, 560, 290], pin: [604, 420] },
  toyota: { zoom: [456, 200, 450, 290], pin: [640, 230] },
  hunter: { zoom: [902, 330, 236, 160], pin: [1020, 360] },
  fics: { zoom: [3292, 360, 196, 170], pin: [3350, 392] },
  adt: { zoom: [548, 334, 110, 180], pin: [610, 424] },
  vc: { zoom: [2560, 280, 580, 230], pin: [2960, 290] },
  tm: { zoom: [5040, 400, 120, 100], pin: null },
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
  'Hi, I’m Ajay. Thanks for stopping by, and make yourself at home.',
  'I’m a Gator, finishing up at the University of Florida, and I’m happiest when I’m figuring out how something works, usually by opening it up to look inside.',
  'Wander around, poke at whatever catches your eye, and say hi if you’d like.'
].join(' ');
roles.push({ id: 'vc', org: 'Welcome to Sommiville', short: 'Visitor center', badge: 'Hi', role: P.name, when: '', where: '', text: HELLO, quote: P.quote, about: '', stats: [], tags: [], photos: [big(P.photo), 'assets/images/offclock/kid-2006-640.webp'], logo: null, tint: TINT.vc, ph: 'Add more personal photos and a few lines about life outside work: hobbies, family, where I grew up, favourite places.', go: [['Classic portfolio', 'classic.html'], ['Résumé', 'resume.html'], ['GitHub', P.github], ['LinkedIn', P.linkedin], ['Email', 'mailto:' + P.email]] });
roles.push({ id: 'tm', org: 'Time machine', short: 'Time machine', badge: '1977', role: '', when: '', where: '', text: '', about: '', stats: [], tags: [], photos: [], logo: null, tint: TINT.tm, special: true });
const stepsOf = (list) => list.map(([f, t, c]) => [big(f), t, c]);
BENCH.forEach((p) => {
  const base = { id: p.id, short: p.name, badge: 'Fix', when: '', where: '', about: '', stats: [], tags: [], photos: [], logo: null, tint: p.tint };
  if (p.id === 'p-civic') roles.push({ ...base, org: OC.civic.title, role: 'Off the clock · my Civic', text: OC.civic.lede, steps: stepsOf(OC.civic.steps) });
  else if (p.id === 'p-macbook') roles.push({ ...base, org: OC.macbook.title, role: 'Off the clock · my 2011 MacBook Pro', text: OC.macbook.lede, steps: stepsOf(OC.macbook.steps) });
  else {
    const st = p.step.map((k) => EL[k]);
    roles.push({ ...base, badge: p.badge || base.badge, org: p.title, role: p.role || 'Off the clock · learning electronics', about: OC.electronics.lede, text: st.map((x) => x[2]).join(' '), photos: st.map((x) => big(x[0])) });
  }
});
PROJECTS.forEach((p) => {
  const s = P[p.src[0]].find((q) => q.id === p.src[1]) || {};
  roles.push({ id: p.id, org: s.full, short: p.name, badge: 'Build', role: s.kind, when: s.stack, where: '', text: s.text, about: '', stats: [], tags: String(s.stack || '').split(' / '), photos: s.shot ? [big(s.shot)] : [], logo: null, tint: p.tint, url: s.url || '' });
});
const order = roles.map((r) => r.id);

/* ---------------------------------------------------------------- drawing */
const img = (id, x, y, w, h, cls = '') => {
  const [d, l] = LOGO[id];
  const one = (f, c) => `<image class="${c}" href="assets/logos/opt/${f}.webp" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`;
  return d === l ? one(d, cls) : one(d, `${cls} tw-lg-d`) + one(l, `${cls} tw-lg-l`);
};
const pic = (f, x, y, w, h, cls = '') => `<image class="${cls}" href="assets/images/town/${f}.webp" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMax meet"/>`;
const hot = (id, inner) => `<g class="tw-hot" data-id="${id}" style="--tint:${TINT[id]}">${inner}</g>`;
const tree = (x, y, s = 1, k = 0) => `<g class="tw-tree" transform="translate(${x} ${y}) scale(${s})"><path d="M-6 0 V-58 M0 -40 L18 -66 M-2 -48 L-22 -70" class="tw-trunk"/><g class="tw-canopy" style="--k:${k}"><circle cx="0" cy="-92" r="38" class="tw-leaf2"/><circle cx="-34" cy="-70" r="28" class="tw-leaf2"/><circle cx="32" cy="-68" r="30" class="tw-leaf2"/><circle cx="-6" cy="-100" r="30" class="tw-leaf"/><circle cx="-34" cy="-76" r="22" class="tw-leaf"/><circle cx="26" cy="-78" r="24" class="tw-leaf"/><circle cx="8" cy="-120" r="18" class="tw-leaf"/></g></g>`;
const bush = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="-16" cy="-8" r="13" class="tw-leaf2"/><circle cx="14" cy="-8" r="14" class="tw-leaf2"/><circle cx="0" cy="-15" r="16" class="tw-leaf"/><circle cx="-18" cy="-12" r="9" class="tw-leaf"/><circle cx="18" cy="-12" r="10" class="tw-leaf"/></g>`;
/* A palm: a bending, ringed trunk, fronds drooping from the top, coconuts. */
const palm = (x, base, h, lean = 10, k = 0) => {
  const tx = x + lean, ty = base - h, d = `M${x} ${base} Q${(x + lean * 0.15).toFixed(1)} ${(base - h * 0.55).toFixed(1)} ${tx} ${ty}`;
  const fr = [-168, -140, -112, -80, -52, -22, 8, 30].map((a, i) => { const L = 30 + (i % 3) * 7; return `<path d="M0 0 Q${(L * 0.45).toFixed(1)} -9 ${L} 5 Q${(L * 0.6).toFixed(1)} -1.4 ${(L * 0.3).toFixed(1)} 2.6 Q${(L * 0.15).toFixed(1)} 3 0 2.4 Z" transform="rotate(${a})" class="${i % 2 ? 'tw-leaf2' : 'tw-leaf'}"/>`; }).join('');
  return `<g class="tw-palm"><path d="${d}" class="tw-palmtrunk"/><path d="${d}" class="tw-palmrings"/><g transform="translate(${tx} ${ty})"><g class="tw-canopy" style="--k:${k}">${fr}<circle cx="-2.4" cy="3.6" r="3" class="tw-coco"/><circle cx="2.6" cy="4.6" r="3" class="tw-coco"/></g></g></g>`;
};
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
    flowers.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1 + grnd() * 0.8).toFixed(2)}" class="tw-flower" style="--c:${['#ffffff', '#ffd166', '#ff8fab', '#c084fc', '#ffe8a3'][Math.floor(grnd() * 5)]}"/>`);
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
      ${L2.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7.4" class="tw-leaf2 tw-avl-n"/><circle cx="${x - 1.6}" cy="${y - 2}" r="4.6" class="tw-leaf"/>`).join('')}
      ${L1.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8.2" class="tw-leaf2 tw-avl-n"/><circle cx="${x - 1.8}" cy="${y - 2.2}" r="5" class="tw-leaf"/>`).join('')}
      <circle cx="3366" cy="402" r="9" class="tw-leaf2 tw-avl-n"/><circle cx="3364" cy="399.6" r="5.6" class="tw-leaf"/>
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
      <ellipse cx="3466" cy="562.4" rx="15" ry="2" class="tw-carshadow"/>
      <path d="M3453 562 L3459 527 M3479 562 L3473 527" class="tw-aframe"/>
      <rect x="3454.6" y="527" width="22.8" height="27" rx="1.6" class="tw-chalkfr"/>
      <rect x="3456.4" y="528.8" width="19.2" height="23.4" rx=".8" class="tw-chalk"/>
      <text x="3466" y="534.4" class="tw-chalk-h" text-anchor="middle">SommiScript</text>
      <path d="M3458.4 536.2 h15.2" class="tw-chalk-l"/>
      <text x="3458.4" y="540.6" class="tw-chalk-t">let x = 6 * 7</text>
      <text x="3458.4" y="545" class="tw-chalk-t">say x</text>
      <text x="3458.4" y="549.4" class="tw-chalk-t tw-chalk-o">› 42</text>
      <path d="M3470.4 546.4 q1.6 1.6 3.2 0 M3471 544.2 h.01 M3473 544.2 h.01" class="tw-chalk-l"/>
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
      <path d="M3414 404 h7 q-2.4 18 1 36 h-8 z M3462 404 h-7 q2.4 18 -1 36 h8 z" class="tw-curtain"/>
      <path d="M3438 404 V440 M3414 422 h4 M3458 422 h4" class="tw-mull"/>
      <rect x="3411" y="440" width="54" height="3.4" rx="1" class="tw-sill"/>
    </g>`),
  // A filing cabinet in the garage, folders sticking up out of the top drawer.
  'p-wadfs': () => hot('p-wadfs', `<g>
      ${['#7c3aed', '#f59e0b', '#22c55e', '#3b82f6', '#ef4444'].map((c, k) => `<rect x="${3570.4 + k * 3.8}" y="${428.4 - (k % 2) * 1.6}" width="3.4" height="6" rx=".6" fill="${c}" class="tw-folder"/>`).join('')}
      <rect x="3567" y="432" width="24" height="54" rx="1.6" class="tw-cab"/>
      ${[0, 1, 2, 3].map((k) => `<rect x="3569" y="${434.4 + k * 12.6}" width="20" height="11" rx=".8" class="tw-drawer"/><rect x="3575.4" y="${436.2 + k * 12.6}" width="7.2" height="3.4" rx=".4" class="tw-drlabel"/><text x="3579" y="${438.9 + k * 12.6}" class="tw-drlabel-t" text-anchor="middle">${['WAD', 'DIR', 'LUMP', 'FUSE'][k]}</text><path d="M3576 ${442 + k * 12.6} h6" class="tw-drhandle"/>`).join('')}
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
const sticker = (x, y, w = 9) => `<image href="assets/images/town/adt-sticker.webp" x="${x}" y="${y}" width="${w}" height="${(w / 2.79).toFixed(2)}" class="tw-adtsticker"/>`;

/* A pine, for the woods behind the visitor center. */
const pine = (x, base, h) => { const w = h * 0.42; return `<g class="tw-pine"><rect x="${x - 3}" y="${base - h * 0.14}" width="6" height="${h * 0.14}" class="tw-trunk-f"/>${[0, 1, 2, 3].map((k) => { const top = base - h + k * h * 0.2, bw = w * (0.45 + k * 0.2); return `<path d="M${x} ${top} L${x + bw / 2} ${top + h * 0.34} H${x - bw / 2} Z" class="${k % 2 ? 'tw-pine2' : 'tw-pine1'}"/>`; }).join('')}</g>`; };

/* The visitor center, after a national park one: a big timber gable with a
   wall of warm glass, wood siding, a WELCOME CENTER plaque, steps and
   benches, pines behind; out front, a routed wood sign on a stone base. */
const VC = { l: 2796, r: 3124, c: 2960, eave: 404, apex: 304, base: 486 };
const roofY = (x) => VC.apex + (VC.eave - VC.apex) * Math.abs(x - VC.c) / (VC.c - VC.l + 12);
const visitorCenter = () => {
  const gl = 2900, gr = 3020, gy = roofY(gl) + 4;
  const batt = (a, b) => Array.from({ length: Math.floor((b - a) / 8) }, (_, i) => `M${a + 4 + i * 8} ${VC.eave + 2} V${VC.base}`).join(' ');
  return `
      <ellipse cx="${VC.c}" cy="470" rx="230" ry="70" class="tw-vc-halo tw-nohit"/>
      <rect x="${VC.l + 8}" y="${VC.eave - 2}" width="${VC.r - VC.l - 16}" height="${VC.base - VC.eave + 2}" class="tw-vcwood tw-fo"/>
      <path d="${batt(VC.l + 8, gl)} ${batt(gr, VC.r - 8)}" class="tw-batten"/>
      <path d="M${gl} ${VC.base} V${gy} L${VC.c} ${VC.apex + 14} L${gr} ${gy} V${VC.base} Z" fill="url(#twVcGlass)" class="tw-vcglass"/>
      <path d="M${gl + 6} ${gy + 14} L${VC.c} ${VC.apex + 30} L${gr - 6} ${gy + 14} M${gl + 4} ${gy + 20} H${gr - 4} M${VC.c} ${VC.apex + 30} V${gy + 20} M${VC.c - 30} ${gy + 2} V${gy + 20} M${VC.c + 30} ${gy + 2} V${gy + 20}" class="tw-beam"/>
      ${[VC.c - 34, VC.c, VC.c + 34].map((x) => `<path d="M${x} ${gy + 20} V${gy + 34}" class="tw-beam-t"/><circle cx="${x}" cy="${gy + 37}" r="3.4" class="tw-pendant"/>`).join('')}
      <path d="M${gl + 30} ${gy + 4} V${VC.base} M${VC.c} ${gy + 20} V${VC.base} M${gr - 30} ${gy + 4} V${VC.base} M${gl} 430 H${gr} M${gl} 458 H${gr}" class="tw-mull"/>
      <rect x="${gl - 4}" y="${gy - 2}" width="6" height="${VC.base - gy + 2}" class="tw-vcpost"/><rect x="${gr - 2}" y="${gy - 2}" width="6" height="${VC.base - gy + 2}" class="tw-vcpost"/>
      <rect x="2814" y="420" width="72" height="50" rx="2" fill="url(#twVcGlass)"/><path d="M2838 420 V470 M2862 420 V470 M2814 445 H2886" class="tw-mull"/>
      <rect x="3032" y="416" width="78" height="30" rx="2" class="tw-vcplaque"/>
      <text x="3071" y="429" class="tw-vcplaque-t" text-anchor="middle">WELCOME</text><text x="3071" y="441" class="tw-vcplaque-t" text-anchor="middle">CENTER</text>
      <rect x="3036" y="452" width="70" height="22" rx="2" fill="url(#twVcGlass)"/><path d="M3071 452 V474" class="tw-mull"/>${sticker(3092, 455)}
      <path d="M${VC.l - 14} ${VC.eave + 6} L${VC.c} ${VC.apex - 4} L${VC.r + 14} ${VC.eave + 6} L${VC.r + 6} ${VC.eave + 10} L${VC.c} ${VC.apex + 10} L${VC.l - 6} ${VC.eave + 10} Z" class="tw-vcroof"/>
      <path d="M${VC.l - 14} ${VC.eave + 6} L${VC.c} ${VC.apex - 4} L${VC.r + 14} ${VC.eave + 6}" class="tw-vcfascia"/>
      <rect x="${VC.l - 12}" y="486" width="${VC.r - VC.l + 24}" height="9" class="tw-vcdeck"/>
      <path d="M${VC.c - 52} 495 h104 v6 h-104 z M${VC.c - 58} 501 h116 v6 h-116 z" class="tw-vcstep"/>
      ${[2832, 3088].map((x) => `<rect x="${x - 16}" y="478" width="32" height="3" rx="1" class="tw-bench"/><rect x="${x - 14}" y="481" width="2.4" height="5" class="tw-bench"/><rect x="${x + 11.6}" y="481" width="2.4" height="5" class="tw-bench"/>`).join('')}
      <g transform="translate(3140 486)"><rect x="-1.4" y="-150" width="2.8" height="150" class="tw-pole"/><path d="M1.4 -148 h26 l-5 8 l5 8 h-26 z" class="tw-vcflag"/></g>
      <g class="tw-woodsign tw-snowable">
        <path d="M2596 486 q-4 -26 10 -28 h130 q14 2 10 28 z" class="tw-stone"/>
        ${[[2610, 474, 9], [2632, 468, 8], [2656, 476, 10], [2682, 469, 9], [2708, 476, 9], [2730, 469, 8]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.7}" class="tw-stone2"/>`).join('')}
        <rect x="2604" y="378" width="10" height="84" rx="3" class="tw-log"/><rect x="2730" y="378" width="10" height="84" rx="3" class="tw-log"/>
        <rect x="2568" y="388" width="208" height="64" rx="7" class="tw-wood"/>
        <rect x="2575" y="395" width="194" height="50" rx="4" class="tw-wood-ln"/>
        <text x="2672" y="411" class="tw-wel-s" text-anchor="middle">WELCOME TO</text>
        <text x="2672" y="437" class="tw-wel-b" text-anchor="middle">SOMMIVILLE</text>
      </g>
      <g class="tw-night tw-nohit"><ellipse cx="${VC.c}" cy="420" rx="70" ry="56" fill="url(#twVcLight)"/><ellipse cx="2850" cy="446" rx="44" ry="30" fill="url(#twVcLight)"/><ellipse cx="3071" cy="462" rx="38" ry="20" fill="url(#twVcLight)"/></g>`;
};

/* The way to the classic portfolio: a bus stop for the Classic Line. */
const busStop = () => `
    <a href="classic.html" class="tw-exit" aria-label="Take the Classic Line to the classic portfolio">
      <rect x="3142" y="408" width="100" height="8" rx="2" class="tw-shelter"/>
      <rect x="3148" y="416" width="4" height="70" class="tw-shelter"/><rect x="3232" y="416" width="4" height="70" class="tw-shelter"/>
      <rect x="3152" y="418" width="80" height="58" class="tw-shglass"/>
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
const HINGE = cv(217.3, 150), HOOD_UP = 58;
// The bumpers (cut out of the picture, civic-fbump / civic-rbump) and the windows, for the damage.
const box = (x0, y0, x1, y1) => { const [x, y] = cv(x0, y0), [X, Y] = cv(x1, y1); return { x, y, w: X - x, h: Y - y }; };
const FB = box(0, 224, 113, 341), RB = box(797, 215, 900, 341);
const WINS = [
  [[218, 148], [300, 108], [372, 78], [388, 82], [330, 122], [266, 150]],
  [[322, 150], [352, 106], [400, 82], [505, 72], [490, 150]],
  [[525, 72], [600, 72], [665, 85], [672, 148], [512, 150]],
  [[676, 100], [700, 112], [708, 148], [680, 148]]
].map((w) => w.map(([x, y]) => cv(x, y).map((n) => +n.toFixed(2))));
// where the hood's front edge ends up, open, for the prop rod
const hoodTip = (() => { const [x, y] = HOOD[0], [hx, hy] = HINGE, a = HOOD_UP * Math.PI / 180; return [hx + (x - hx) * Math.cos(a) - (y - hy) * Math.sin(a), hy + (x - hx) * Math.sin(a) + (y - hy) * Math.cos(a)]; })();
/* The house: lap siding, a shingled roof, a brick chimney, shutters, a
   porch over the door; the projects are around it (PROJ). Edges bow a
   little, nothing ruler straight. */
const home = () => `
    <rect x="3497" y="246" width="17" height="60" class="tw-chimney"/><rect x="3497" y="246" width="17" height="60" fill="url(#twBricks)" class="tw-nohit"/>
    <path d="M3494.4 247.4 q5.6 -1.4 11 -.6 q5.6 -.6 11.2 .4 v-5 q-5.6 -.8 -11.2 -.2 q-5.4 -.6 -11 .4 z" class="tw-chimcap"/>
    <path d="M3404.6 324 Q3470 322.6 3536.6 324.4 L3536 486 Q3470 486.8 3405.2 486 Z" class="tw-housewall tw-fo"/>
    <path d="M3404.6 324 Q3470 322.6 3536.6 324.4 L3536 486 Q3470 486.8 3405.2 486 Z" fill="url(#twSiding)" class="tw-nohit"/>
    <path d="M3404.6 324 Q3470 322.6 3536.6 324.4 L3536.4 360 H3404.8 Z" fill="url(#twEaveShade)" class="tw-nohit"/>
    <path d="M3405 326 V485.4 M3535.8 326 V485.4" class="tw-trim"/>
    ${[[3416, 342], [3494, 342]].map(([x, y]) => `<rect x="${x - 7}" y="${y}" width="6" height="28" rx=".8" class="tw-shutter"/><rect x="${x + 25}" y="${y}" width="6" height="28" rx=".8" class="tw-shutter"/><rect x="${x}" y="${y}" width="24" height="28" rx="1.4" fill="url(#twVcGlass)" class="tw-homewin"/><path d="M${x + 1.4} ${y + 1.4} h21.2 v6 q-10.6 4 -21.2 0 z" class="tw-valance"/><path d="M${x + 12} ${y} V${y + 28} M${x} ${y + 14} H${x + 24}" class="tw-mull"/><rect x="${x - 3}" y="${y + 28}" width="30" height="3" rx="1" class="tw-sill"/>`).join('')}
    <rect x="3414" y="373" width="28" height="5" rx="1.4" class="tw-planter"/>${[3417, 3423, 3429, 3435, 3440].map((x, k) => `<circle cx="${x}" cy="${372 - (k % 2)}" r="${2.6 + (k % 2) * 0.6}" class="${k % 2 ? 'tw-leaf2' : 'tw-leaf'}"/><circle cx="${x + 1}" cy="${370 - (k % 2)}" r="1.1" class="tw-flower" style="--c:${['#ff6b8b', '#ffd166', '#ff8fab', '#f9f871', '#ff6b8b'][k]}"/>`).join('')}
    <path d="M3392 333 Q3431 300 3470.6 259.4 Q3510 298.6 3549.4 333.4 Q3470 330.6 3392 333 Z" class="tw-roof"/>
    <path d="M3392 333 Q3431 300 3470.6 259.4 Q3510 298.6 3549.4 333.4 Q3470 330.6 3392 333 Z" fill="url(#twShingles)" class="tw-nohit"/>
    <path d="M3392 333 Q3431 300 3470.6 259.4 Q3510 298.6 3549.4 333.4 Q3470 330.6 3392 333 Z" fill="url(#twRoofShade)" class="tw-nohit"/>
    <path d="M3390.6 333.6 Q3470 330 3550.8 334" class="tw-fascia"/>
    <path d="M3392 333 Q3431 300 3470.6 259.4 Q3510 298.6 3549.4 333.4" class="tw-roofedge"/>
    <circle cx="3470.4" cy="301" r="7.6" class="tw-atticfr"/><circle cx="3470.4" cy="301" r="5.8" fill="url(#twVcGlass)" class="tw-homewin"/><path d="M3470.4 295.2 V306.8 M3464.6 301 H3476.2" class="tw-mull"/>
    <path d="M3484.6 427 L3509 410.4 L3533.4 427 Q3509 425.4 3484.6 427 Z" class="tw-roof"/><path d="M3484.6 427 L3509 410.4 L3533.4 427 Q3509 425.4 3484.6 427 Z" fill="url(#twShingles)" class="tw-nohit"/><path d="M3483.6 427.4 Q3509 425.4 3534.4 427.4" class="tw-fascia"/>
    <rect x="3487" y="427" width="2.6" height="59" class="tw-post"/><rect x="3528.4" y="427" width="2.6" height="59" class="tw-post"/>
    <rect x="3496" y="430" width="26" height="56" rx="2" class="tw-homedoor"/><path d="M3499.6 459 h18.8 v23 h-18.8 z" class="tw-doorpanel"/><circle cx="3517.6" cy="458" r="1.4" class="tw-knob"/>
    <path d="M3500 445 a9 9 0 0 1 18 0 v2 h-18 z" fill="url(#twVcGlass)"/><path d="M3509 436 V447" class="tw-mull"/>${sticker(3500, 450, 7)}
    <circle cx="3492.6" cy="438" r="14" fill="url(#twVcLight)" class="tw-porchglow"/><rect x="3490" y="435" width="5.4" height="8" rx="1.6" class="tw-porchlamp"/>
    <path d="M3492 486 h34 v3 h-34 z M3489 489 h40 v3.4 h-40 z" class="tw-vcstep"/>
    <path d="M3496 492.4 h26 l9 111.6 h-44 z" class="tw-walk"/>
    ${PROJ['p-betai']()}
    ${[[3412, 497, .55], [3444, 498, .6], [3540, 497, .5]].map(([x, y, k]) => bush(x, y, k)).join('')}
    ${[3404, 3412, 3420, 3428, 3436, 3446, 3456, 3466, 3476].map((x, k) => `<circle cx="${x}" cy="${489 - (k % 3)}" r="1.5" class="tw-flower" style="--c:${['#ff6b8b', '#ffd166', '#c084fc', '#ff8fab'][k % 4]}"/>`).join('')}
    ${PROJ['p-avl']()}
    ${PROJ['p-gatorgoods']()}
    ${PROJ['p-sommiscript']()}`;
const garage = () => {
  const [hx, hy] = HINGE, [ix, iy] = cv(39.237, 143.706);
  return `
    ${home()}
    <rect x="3536" y="374" width="238" height="112" class="tw-house tw-fo"/>
    <path d="M3534 379 L3655 330 L3776 379 Z" class="tw-house"/><path d="M3534 379 L3655 330 L3776 379 Z" fill="url(#twSiding)" class="tw-nohit"/>
    <circle cx="3655" cy="358" r="7" class="tw-atticfr"/><circle cx="3655" cy="358" r="5.2" class="tw-vent"/><path d="M3650.4 355.4 h9.2 M3649.8 358 h10.4 M3650.4 360.6 h9.2" class="tw-ventl"/>
    <path d="M3524 380 Q3590 352 3655 324.4 Q3720 352 3786 380 L3778 384.6 Q3716 358 3655 332.6 Q3594 358 3532 384.6 Z" class="tw-roof"/><path d="M3524 380 Q3590 352 3655 324.4 Q3720 352 3786 380 L3778 384.6 Q3716 358 3655 332.6 Q3594 358 3532 384.6 Z" fill="url(#twShingles)" class="tw-nohit"/>
    <rect x="3566" y="400" width="178" height="86" class="tw-gint"/>
    <rect x="3566" y="400" width="178" height="86" fill="url(#twGarageLight)" class="tw-glight"/>
    <rect x="3640" y="402" width="30" height="3" rx="1.5" class="tw-lamp"/>
    <path d="M3568 409 Q3590 416 3612 409 Q3634 416 3656 409 Q3678 416 3700 409 Q3722 416 3742 409" class="tw-string"/>
    ${[3576, 3590, 3604, 3620, 3634, 3648, 3664, 3678, 3692, 3708, 3722, 3736].map((x, k) => `<circle cx="${x}" cy="${(411.5 + Math.sin(k * 1.4) * 1.6).toFixed(1)}" r="1.5" class="tw-bulb2" style="--k:${k}"/>`).join('')}
    <path d="M3598 432 H3642 M3598 454 H3642 M3690 430 H3738" class="tw-shelf"/>
    <rect x="3600" y="420" width="12" height="12" class="tw-box"/><rect x="3616" y="424" width="16" height="8" class="tw-box"/><rect x="3606" y="444" width="20" height="10" class="tw-box"/>
    ${PROJ['p-wadfs']()}
    <g class="tw-bike"><circle cx="3700" cy="452" r="7"/><circle cx="3724" cy="452" r="7"/><path d="M3700 452 L3710 440 H3722 L3724 452 M3710 440 L3714 452 H3724 M3708 436 h5 M3721 437 l2 -3"/></g>
    <rect x="3700" y="420" width="10" height="10" class="tw-box"/><rect x="3716" y="420" width="12" height="8" rx="1" class="tw-jar"/>
    <rect x="3592" y="470" width="64" height="14" rx="3" class="tw-rug"/>
    <rect x="3562" y="396" width="186" height="8" rx="1" class="tw-gdoor"/><path d="M3562 400 H3748" class="tw-gdoor-l"/>
    ${sticker(3750, 420, 8)}
    <path d="M3566 486 H3744 L3770 604 H3540 Z" class="tw-drive"/>
    ${hot('p-civic', `
    <g>
      <path d="M${HOOD.map((p) => p.map((n) => n.toFixed(2)).join(' ')).join(' L')} Z" class="tw-engbay"/>
      <g class="tw-civ-bay">
        <rect x="${(CV.x + 14).toFixed(1)}" y="${(hy - 2).toFixed(1)}" width="18" height="7" rx="2" class="tw-engine"/>
        <rect x="${(CV.x + 6).toFixed(1)}" y="${(hy + 1).toFixed(1)}" width="8" height="5" rx="1.6" class="tw-airbox"/>
        <circle cx="${(CV.x + 29).toFixed(1)}" cy="${(hy - 1).toFixed(1)}" r="1.3" class="tw-capy"/><circle cx="${(CV.x + 19).toFixed(1)}" cy="${(hy - 2.2).toFixed(1)}" r="1" class="tw-capy"/>
        <path d="M${(CV.x + 7).toFixed(1)} ${(hy + 6).toFixed(1)} L${(hoodTip[0] + 2).toFixed(1)} ${(hoodTip[1] + 1.2).toFixed(1)}" class="tw-prop"/>
      </g>
      <ellipse cx="${CV.x + CV.w / 2}" cy="${CV.ground}" rx="${CV.w * 0.46}" ry="3" class="tw-carshadow"/>
      ${[FB, RB].map((b) => `<rect x="${(b.x + b.w * 0.08).toFixed(2)}" y="${(b.y + b.h * 0.18).toFixed(2)}" width="${(b.w * 0.84).toFixed(2)}" height="${(b.h * 0.6).toFixed(2)}" rx="1" class="tw-crashbar"/><path d="M${(b.x + b.w * 0.1).toFixed(2)} ${(b.y + b.h * 0.34).toFixed(2)} h${(b.w * 0.8).toFixed(2)}" class="tw-crashbar-l"/>`).join('')}
      <image href="assets/images/town/civic-body2.webp" x="${CV.x}" y="${CV.y.toFixed(2)}" width="${CV.w}" height="${CV.h.toFixed(2)}" preserveAspectRatio="none" class="tw-snowable"/>
      ${[['f', FB], ['r', RB]].map(([k, b]) => `<g class="tw-bump tw-bump-${k}"><image href="assets/images/town/civic-${k}bump.webp" x="${b.x.toFixed(2)}" y="${b.y.toFixed(2)}" width="${b.w.toFixed(2)}" height="${b.h.toFixed(2)}" preserveAspectRatio="none"/></g>`).join('')}
      <g class="tw-civ-dmg">${WINS.map((w, i) => `<g clip-path="url(#twCivWin${i})" class="tw-civ-win" data-w="${i}"></g>`).join('')}<g class="tw-civ-dents"></g></g>
      <g transform="translate(${hx.toFixed(2)} ${hy.toFixed(2)})"><g class="tw-civ-hood" style="transform-origin:${((217.3 - 39.237) / 180 * 100).toFixed(1)}% ${((150 - 143.706) / 56 * 100).toFixed(1)}%;--up:${HOOD_UP}deg"><path d="M${HOOD.slice(6).map(([x, y]) => `${(x - hx).toFixed(2)} ${(y - hy).toFixed(2)}`).join(' L')}" class="tw-hood-under"/><image href="assets/images/town/civic-hood.webp" x="${(ix - hx).toFixed(2)}" y="${(iy - hy).toFixed(2)}" width="${(180 * CV.u).toFixed(2)}" height="${(56 * CV.u).toFixed(2)}" preserveAspectRatio="none"/></g></g>
      <g class="tw-night tw-nohit"><polygon points="${cv(70, 190)} ${cv(70, 200)} ${(CV.x - 56).toFixed(1)},${(cv(70, 200)[1] + 18).toFixed(1)} ${(CV.x - 56).toFixed(1)},${(cv(70, 190)[1] - 6).toFixed(1)}" fill="url(#twHead)"/><circle cx="${cv(60, 196)[0].toFixed(1)}" cy="${cv(60, 196)[1].toFixed(1)}" r="5" fill="url(#twBulb)"/></g>
    </g>`)}
    <g class="tw-steam" aria-hidden="true">${[0, 1, 2, 3, 4].map((k) => `<circle cx="${(CV.x + 8 + k * 4.5).toFixed(1)}" cy="${(HINGE[1] - 2).toFixed(1)}" r="${3 + (k % 2)}" style="--d:${(-k * 0.55).toFixed(2)}s;--dx:${k % 2 ? -5 : 4}px"/>`).join('')}</g>
    <g class="tw-civ-tags" aria-hidden="true">${[['Spark plugs', CV.x + 21, HINGE[1] - 2, 470], ['Throttle body', CV.x + 9, HINGE[1] + 1, 478], ['AC compressor', CV.x + 6, HINGE[1] + 8, 486], ['Transmission fluid', CV.x + 30, CV.ground - 8, 494]].map(([t, x, y, ty], i) => `<g style="--i:${i}"><path d="M3578 ${ty - 1.4} H3582 L${x.toFixed(1)} ${y.toFixed(1)}" class="tw-tag-l"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.1" class="tw-tag-d"/><text x="3577" y="${ty}" class="tw-tag-t" text-anchor="end">${t}</text></g>`).join('')}</g>`;
};

/* The workbench beside it: a lean to with a pegboard, a lamp, and
   everything else I've taken apart, each its own stop. */
const bench = () => `
    <rect x="3774" y="398" width="300" height="88" class="tw-fence tw-fo"/>
    <path d="${Array.from({ length: 18 }, (_, i) => `M${3790 + i * 16.5} 400 V486`).join(' ')}" class="tw-fence-l"/>
    <path d="M3766 390 H4082 L4076 400 H3772 Z" class="tw-awn"/>
    <rect x="3800" y="408" width="250" height="44" rx="2" class="tw-peg"/>
    <g class="tw-tools">
      <path d="M3814 414 v22 M3810 414 h8" class="tw-tool"/><path d="M3832 414 l0 20 m-4 -20 h8 v5 h-8 z" class="tw-tool"/>
      <path d="M3852 416 l12 18 M3858 414 a4 4 0 1 0 0.1 0" class="tw-tool"/><path d="M3880 414 h22 v6 h-22 z M3884 420 l-2 12 h26 l-2 -12" class="tw-tool"/>
      <circle cx="3930" cy="426" r="8" class="tw-wire"/><circle cx="3930" cy="426" r="4" class="tw-wire"/>
      <path d="M3956 414 v24 M3964 414 v18 M3972 414 v20" class="tw-tool"/>
      <path d="M3990 432 H4040" class="tw-shelf"/><rect x="3994" y="422" width="10" height="10" class="tw-box"/><rect x="4008" y="425" width="14" height="7" class="tw-box"/><rect x="4026" y="424" width="9" height="8" rx="1" class="tw-jar"/>
    </g>
    <path d="M3798 468 L3806 440 L3824 438" class="tw-lamparm"/><path d="M3818 434 l14 2 l-4 8 l-12 -2 z" class="tw-lampshade"/>
    <polygon points="3820,442 3830,444 3846,468 3800,468" class="tw-lampcone tw-nohit"/>
    <rect x="3790" y="468" width="270" height="5" rx="1" class="tw-benchtop"/>
    <rect x="3794" y="473" width="5" height="33" class="tw-benchleg"/><rect x="4051" y="473" width="5" height="33" class="tw-benchleg"/>
    <rect x="3794" y="494" width="262" height="3" class="tw-benchleg"/>
    ${hot('p-macbook', `<g>
      <image href="assets/images/town/macbook.webp" x="3806" y="455.7" width="22" height="12.3" preserveAspectRatio="none"/>
      <g class="tw-mac-lcd" clip-path="url(#twMacScr)">
        <rect x="3808.6" y="456.4" width="16.8" height="10.1" class="tw-lcd-bleed"/>
        ${[[3810, '#ff2bd6'], [3811.2, '#29f0ff'], [3816.5, '#3dff6e'], [3821, '#fff'], [3823.4, '#ff2bd6']].map(([x, c]) => `<rect x="${x}" y="456.4" width=".5" height="10.1" fill="${c}"/>`).join('')}
        <path d="M3818 461 l-3.4 -4.6 M3818 461 l5.2 -3 M3818 461 l6 2.6 M3818 461 l-1 5.5 M3818 461 l-6.6 3.2 M3818 461 l-7 -1.6 M3815.8 458 l2.4 -.6 M3821.6 459.4 l.6 2.2 M3813.6 462.4 l1.4 2" class="tw-lcd-crack"/>
        <circle cx="3818" cy="461" r="1.6" class="tw-lcd-ink"/>
      </g>
      <g class="tw-mac-fire tw-nohit">${[[3812, 1], [3817.5, 1.35], [3823, 1.1]].map(([x, k], i) => `<path d="M${x} 466 c-2.4 -1.4 -2.6 -4 -1 -6.2 c.2 1.4 1 2 1.6 2.2 c-.4 -2.6 .6 -4.8 2.6 -6.2 c-.6 2.2 .4 3.8 1.4 4.8 c.6 -1 .7 -2 .5 -3 c1.8 2.4 1.8 5.6 -.6 8.4 z" transform="translate(${x} 466) scale(${k}) translate(${-x} -466)" class="tw-flame" style="--d:${(-i * 0.23).toFixed(2)}s"/>`).join('')}<circle cx="3818" cy="462" r="9" fill="url(#twFireGlow)" class="tw-fireglow"/></g>
    </g>`)}
    <g class="tw-smoke" aria-hidden="true">${[0, 1, 2].map((k) => `<circle cx="${3815 + k * 2.6}" cy="455" r="${1.6 + k * 0.3}" style="--d:${(-k * 0.8).toFixed(1)}s;--dx:${k % 2 ? -3 : 3}px"/>`).join('')}${[0, 1, 2, 3, 4].map((k) => `<circle class="tw-smoke-x" cx="${3810 + k * 4}" cy="452" r="${2.2 + (k % 2)}" style="--d:${(-k * 0.5).toFixed(1)}s;--dx:${k % 2 ? -5 : 5}px"/>`).join('')}</g>
    ${hot('p-lcd', `<g>
      <rect x="3840" y="464" width="20" height="4" rx="1" class="tw-pcb"/>
      <rect x="3842" y="451" width="16" height="12" rx="1" class="tw-lcdcase"/><rect x="3843.5" y="453" width="13" height="7" class="tw-lcd"/>
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
      <rect x="3984" y="452" width="22" height="14" rx="1" class="tw-oldlid"/><rect x="3986" y="454" width="18" height="10" class="tw-oldscr"/>
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
const CAR = { prius: { a: 0.742, l: [[0.169, 0.463], [0.835, 0.464]] }, bz: { a: 0.781, l: [[0.192, 0.432], [0.811, 0.432]] }, gh: { a: 0.814, l: [[0.152, 0.388], [0.847, 0.387]] } };
const showroom = (x, y, w, h, cars) => {
  const spots = cars.map((c) => c.cx), fy = y + h - 8;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="tw-int"/>
      ${spots.map((cx, i) => `<polygon points="${cx - 10},${y} ${cx + 10},${y} ${cx + 44},${fy} ${cx - 44},${fy}" class="tw-spotcone" style="--i:${i}"/><rect x="${cx - 9}" y="${y}" width="18" height="4" rx="2" class="tw-lamp"/>`).join('')}
      <rect x="${x}" y="${fy}" width="${w}" height="8" class="tw-showfloor"/>
      ${spots.map((cx, i) => `<ellipse cx="${cx}" cy="${fy + 1}" rx="46" ry="6" class="tw-pool" style="--i:${i}"/>`).join('')}
      <g class="tw-alarmin tw-nohit"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#twAlarmRed)" class="tw-alarm-red"/><rect x="${x}" y="${y}" width="${w}" height="${h}" class="tw-alarm-white"/></g>
      ${cars.map((c) => { const K = CAR[c.f], H = c.w * K.a, x0 = c.cx - c.w / 2, y0 = fy + 3 - H, at = (fx, fy2) => [(x0 + c.w * fx).toFixed(1), (y0 + H * fy2).toFixed(1)]; const ws = at(.36, .17);
        const drl = (cls, f) => `<image href="assets/images/town/car-${c.f}-drl.webp" x="${x0.toFixed(1)}" y="${y0.toFixed(1)}" width="${c.w}" height="${H.toFixed(1)}" preserveAspectRatio="none" class="${cls}" filter="url(#${f})"/>`;
        return `<ellipse cx="${c.cx}" cy="${fy + 1.5}" rx="${c.w * 0.46}" ry="3.2" class="tw-carshadow"/><g class="tw-showcar" data-car="${c.f}">`
          + `<image href="assets/images/town/car-${c.f}.webp" x="${x0.toFixed(1)}" y="${y0.toFixed(1)}" width="${c.w}" height="${H.toFixed(1)}" preserveAspectRatio="none" class="tw-carimg"/>`
          + bow(c.cx, y0 + H * 0.43, c.w * 0.5)
          + `<path d="M${ws[0]} ${ws[1]} l-5 -3.4 M${ws[0]} ${ws[1]} l6 -4 M${ws[0]} ${ws[1]} l9 1.6 M${ws[0]} ${ws[1]} l-7 2.4 M${ws[0]} ${ws[1]} l2 5 M${ws[0]} ${ws[1]} l12 -2.6" class="tw-wscrack"/>`
          + `<g class="tw-carlights tw-nohit"><g class="tw-heads">${K.l.map(([a, b]) => { const [px, py] = at(a, b); return `<ellipse cx="${px}" cy="${py}" rx="9" ry="5" fill="url(#twLedBulb)" opacity=".7"/>`; }).join('')}${drl('tw-drl', 'twDrlW')}</g>`
          + `<g class="tw-hzs">${K.l.map(([a, b]) => { const [px, py] = at(a, b); return `<ellipse cx="${px}" cy="${py}" rx="8" ry="4.4" fill="url(#twHaz)" opacity=".8"/>`; }).join('')}${drl('tw-drl', 'twDrlA')}</g></g></g>`; }).join('')}
      <rect x="${x}" y="${y}" width="${w}" height="${h}" class="tw-glassover"/>
      <path d="M${x + 14} ${y + 8} l-12 ${Math.round(h * 0.4)} M${x + w * 0.42} ${y + 8} l-22 ${Math.round(h * 0.7)}" class="tw-shine"/>
      <path d="M${x} ${y} l7 0 l-4 10 l6 6 l-9 7 Z M${x + w} ${y} l-10 0 l5 8 l-6 9 l11 4 Z M${x} ${y + h - 8} l0 -16 l8 8 l5 8 Z M${x + w} ${y + h - 8} l0 -12 l-9 6 l-3 6 Z M${x + w * 0.4} ${y} l12 0 l-5 9 Z" class="tw-glassedge"/>
      <g class="tw-shards">${Array.from({ length: Math.round(w / 9) }, (_, i) => { const sx = x + 4 + i * 9 + (i * 37 % 5), sy = y + h + 2 + (i * 13 % 7); return `<path d="M${sx} ${sy} l${2 + i % 3} -1.6 l1 ${1.4 + i % 2} z" class="tw-shard"/>`; }).join('')}</g>`;
};

// Stars: scattered at random (the same random every build), each with its own size and slow breath.
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const STARS = Array.from({ length: 210 }, () => { const r = rnd(); return `<circle cx="${(rnd() * WORLD).toFixed(1)}" cy="${(-560 + rnd() * 820).toFixed(1)}" r="${(0.5 + r * r * 1.6).toFixed(2)}" style="--t:${(3 + rnd() * 6).toFixed(1)}s;--d:${(-rnd() * 9).toFixed(1)}s;--lo:${(0.15 + rnd() * 0.35).toFixed(2)}"/>`; }).join('');

const SPARKS = Array.from({ length: 46 }, () => { const x = rnd() * WORLD, y = -520 + rnd() * 700, k = 0.6 + rnd() * 0.9; return `<path d="M0 -6 Q.7 -.7 6 0 Q.7 .7 0 6 Q-.7 .7 -6 0 Q-.7 -.7 0 -6 Z" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${k.toFixed(2)})" style="--t:${(2.4 + rnd() * 3.4).toFixed(1)}s;--d:${(-rnd() * 6).toFixed(1)}s"/>`; }).join('');

const TK = { x: 536, w: 620, ground: 486 };
TK.s = TK.w / 1972; TK.h = 438 * TK.s; TK.y = TK.ground - TK.h;
const tk = (px, py) => [TK.x + px * TK.s, TK.y + py * TK.s];
// Its own amber lights (the cab's corner and roof lights, the trailer's side
// markers), flashing as hazards; never the cars it carries.
const HAZ = [[48, 327], [166, 162], [186, 160], [350, 328], [755, 392], [1552, 328], [1953, 370], [1934, 156]].map(([x, y]) => tk(x, y));
const HEAD = tk(34, 330);

const hills = () => {
  let p2 = 'M-400 400', x = -400, k = 0;
  while (x < WORLD + 400) { x += 130 + (k % 3) * 25; p2 += ` L${x} ${k % 2 ? 300 + (k * 37) % 40 : 352 + (k * 23) % 30}`; k++; }
  let p1 = 'M-400 430', y = 0;
  for (let xx = -400; xx < WORLD + 400; xx += 340) { y++; p1 += ` Q${xx + 170} ${y % 2 ? 372 : 392} ${xx + 340} ${y % 2 ? 404 : 410}`; }
  return [p2 + ` V480 H-400 Z`, p1 + ` V480 H-400 Z`];
};
const [HILL2, HILL1] = hills();

const svg = `<svg class="tw-svg" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="A drawn town block. Each part of it is a place I've worked; the buttons below open the same stories.">
  <defs>
    <linearGradient id="twSkyDay" gradientUnits="userSpaceOnUse" x1="0" y1="-700" x2="0" y2="600"><stop offset="0" stop-color="#9fcbef"/><stop offset=".7" stop-color="#e9eef0"/><stop offset="1" stop-color="#f6ecd9"/></linearGradient>
    <linearGradient id="twSkyNight" gradientUnits="userSpaceOnUse" x1="0" y1="-700" x2="0" y2="600"><stop offset="0" stop-color="#070a1a"/><stop offset=".55" stop-color="#14183a"/><stop offset="1" stop-color="#3a2b55"/></linearGradient>
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
    <linearGradient id="twGarageLight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe7b0" stop-opacity=".55"/><stop offset=".7" stop-color="#ffe7b0" stop-opacity="0"/></linearGradient>
    <radialGradient id="twAdtGlow"><stop offset="0" stop-color="#3fa0ff" stop-opacity=".75"/><stop offset="1" stop-color="#1f6fd1" stop-opacity="0"/></radialGradient>
    <radialGradient id="twAdtPool"><stop offset="0" stop-color="#4aa8ff" stop-opacity=".7"/><stop offset="1" stop-color="#1f6fd1" stop-opacity="0"/></radialGradient>
    <mask id="twMoonMask" maskUnits="userSpaceOnUse" x="-60" y="-60" width="120" height="120"><rect x="-60" y="-60" width="120" height="120" fill="#fff"/><circle cx="16" cy="-10" r="27" fill="#000"/></mask>
    <radialGradient id="twMoonHalo"><stop offset=".55" stop-color="#fff6dc" stop-opacity=".35"/><stop offset="1" stop-color="#fff6dc" stop-opacity="0"/></radialGradient>
    <radialGradient id="twFireGlow"><stop offset="0" stop-color="#ffb347" stop-opacity=".8"/><stop offset="1" stop-color="#ff5a1f" stop-opacity="0"/></radialGradient>
    <radialGradient id="twBar"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".3" stop-color="currentColor" stop-opacity=".8"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></radialGradient>
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
    <filter id="twAdtLit" x="-60%" y="-40%" width="220%" height="180%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="b1"/><feFlood flood-color="#3fa8ff" flood-opacity=".95"/><feComposite in2="b1" operator="in" result="g1"/><feGaussianBlur in="SourceAlpha" stdDeviation="7" result="b2"/><feFlood flood-color="#1f78ff" flood-opacity=".8"/><feComposite in2="b2" operator="in" result="g2"/><feMerge><feMergeNode in="g2"/><feMergeNode in="g1"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="twDrlA" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="1.3" result="b"/><feFlood flood-color="#ffa21a"/><feComposite in2="b" operator="in" result="g"/><feFlood flood-color="#ffc35a"/><feComposite in2="SourceAlpha" operator="in" result="c"/><feMerge><feMergeNode in="g"/><feMergeNode in="g"/><feMergeNode in="c"/></feMerge></filter>
    <filter id="twSnowOn" x="-4%" y="-20%" width="108%" height="130%" color-interpolation-filters="sRGB"><feOffset in="SourceAlpha" dy="2.4" result="dn"/><feComposite in="SourceAlpha" in2="dn" operator="out" result="top"/><feMorphology in="top" operator="dilate" radius=".5" result="t2"/><feOffset in="t2" dy="-.7" result="t3"/><feGaussianBlur in="t3" stdDeviation=".3" result="tb"/><feFlood id="twSnowAmt" flood-color="#fbfdff" flood-opacity="0"/><feComposite in2="tb" operator="in" result="snow"/><feOffset in="snow" dy=".6" result="sd"/><feColorMatrix in="sd" type="matrix" values="0 0 0 0 .45  0 0 0 0 .52  0 0 0 0 .62  0 0 0 .8 0" result="shade"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="shade"/><feMergeNode in="snow"/></feMerge></filter>
    <filter id="twChar" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".16 .1 .04 0 .015  .12 .1 .04 0 .01  .1 .08 .04 0 .008  0 0 0 1 0"/></filter>
    <filter id="twDim" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope=".5"/><feFuncG type="linear" slope=".44"/><feFuncB type="linear" slope=".46"/></feComponentTransfer></filter>
    <radialGradient id="twScorch"><stop offset="0" stop-color="#140a04" stop-opacity=".85"/><stop offset=".7" stop-color="#2b1a0e" stop-opacity=".5"/><stop offset="1" stop-color="#2b1a0e" stop-opacity="0"/></radialGradient>
    <radialGradient id="twBoom"><stop offset="0" stop-color="#fffbe0"/><stop offset=".3" stop-color="#ffd25a" stop-opacity=".95"/><stop offset=".65" stop-color="#ff6a1a" stop-opacity=".7"/><stop offset="1" stop-color="#ff3a0a" stop-opacity="0"/></radialGradient>
    <radialGradient id="twWarm" cx=".5" cy="1" r=".9"><stop offset="0" stop-color="#ffb46a" stop-opacity=".35"/><stop offset="1" stop-color="#ffb46a" stop-opacity="0"/></radialGradient>
    <linearGradient id="twDayInt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3ead8"/><stop offset="1" stop-color="#ddd0b6"/></linearGradient>
    ${Object.entries(TINT).map(([id, c]) => `<filter id="twGlow-${id}" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="3.6" result="s"/><feComponentTransfer in="s" result="b"><feFuncA type="linear" slope="2.4"/></feComponentTransfer><feFlood flood-color="${c}" flood-opacity=".95"/><feComposite in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="twHalo-${id}" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="3.6" result="s"/><feComponentTransfer in="s" result="b"><feFuncA type="linear" slope="2.4"/></feComponentTransfer><feFlood flood-color="${c}" flood-opacity=".95"/><feComposite in2="b" operator="in"/></filter>`).join('')}
  </defs>

  <!-- Far: the sky, the hills, the clouds; it slides by slower than the
       block as you scroll along it. -->
  <g class="tw-far">
    <rect class="tw-sky-d" x="-800" y="-1600" width="${WORLD + 1600}" height="2140" fill="url(#twSkyDay)"/>
    <rect class="tw-sky-n" x="-800" y="-1600" width="${WORLD + 1600}" height="2140" fill="url(#twSkyNight)"/>
    <g class="tw-stars">${STARS}</g>
    <g class="tw-sparkles">${SPARKS}</g>
    <path class="tw-shooting" d="M0 0 L-90 34"/>
    <rect class="tw-overcast" x="-800" y="-1600" width="${WORLD + 1600}" height="2140"/>
    <g class="tw-cloud" style="--dur:110s;--from:-20s"><g transform="translate(380 110) scale(1.0)"><rect x="0" y="14" width="180" height="30" rx="15"/><circle cx="60" cy="16" r="28"/><circle cx="104" cy="8" r="36"/><circle cx="140" cy="22" r="20"/></g></g>
    <g class="tw-cloud" style="--dur:150s;--from:-90s"><g transform="translate(820 60) scale(0.7)"><rect x="0" y="14" width="180" height="30" rx="15"/><circle cx="60" cy="16" r="28"/><circle cx="104" cy="8" r="36"/><circle cx="140" cy="22" r="20"/></g></g>
    <g class="tw-cloud" style="--dur:180s;--from:-150s"><g transform="translate(120 60) scale(0.55)"><rect x="0" y="14" width="180" height="30" rx="15"/><circle cx="60" cy="16" r="28"/><circle cx="104" cy="8" r="36"/><circle cx="140" cy="22" r="20"/></g></g>
    <g class="tw-cloud" style="--dur:170s;--from:-40s"><g transform="translate(1500 -120) scale(0.8)"><rect x="0" y="14" width="180" height="30" rx="15"/><circle cx="60" cy="16" r="28"/><circle cx="104" cy="8" r="36"/><circle cx="140" cy="22" r="20"/></g></g>
    <g class="tw-cloud" style="--dur:210s;--from:-120s"><g transform="translate(600 -220) scale(0.65)"><rect x="0" y="14" width="180" height="30" rx="15"/><circle cx="60" cy="16" r="28"/><circle cx="104" cy="8" r="36"/><circle cx="140" cy="22" r="20"/></g></g>
    <g class="tw-cloud" style="--dur:140s;--from:-70s"><g transform="translate(1900 30) scale(0.9)"><rect x="0" y="14" width="180" height="30" rx="15"/><circle cx="60" cy="16" r="28"/><circle cx="104" cy="8" r="36"/><circle cx="140" cy="22" r="20"/></g></g>
    <ellipse class="tw-night tw-warmglow" cx="${WORLD / 2}" cy="470" rx="${WORLD}" ry="210" fill="url(#twWarm)"/>
    <path class="tw-mtn2" d="${HILL2}"/>
    <path class="tw-mtn1" d="${HILL1}"/>
  </g>
  <!-- The sun and the moon are far enough away to hold still while the
       street slides and leans in (placed by town.js). -->
  <g class="tw-sky-fixed" aria-hidden="true">
    <g class="tw-sun"><circle r="70" fill="url(#twHalo)"/><circle r="32" fill="#ffcf6b"/></g>
    <g class="tw-moon"><circle r="46" fill="url(#twMoonHalo)" class="tw-moonhalo" mask="url(#twMoonMask)"/><circle r="30" fill="#f6eed6" mask="url(#twMoonMask)"/></g>
  </g>

  <!-- Middle: the block. -->
  <g class="tw-mid">
    <rect class="tw-grass" x="-800" y="474" width="${WORLD + 1600}" height="700"/>
    <path class="tw-grass" d="${grassEdge()}"/>
    ${lawn()}
    <rect class="tw-snowground" x="-800" y="474" width="${WORLD + 1600}" height="700"/>
    <rect class="tw-sidewalk" x="-800" y="600" width="${WORLD + 1600}" height="14"/>
    <rect class="tw-curb" x="-800" y="613" width="${WORLD + 1600}" height="3"/>
    <rect class="tw-road" x="-800" y="616" width="${WORLD + 1600}" height="400"/>
    <path class="tw-lane" d="M-800 650 H${WORLD + 800}"/>
    ${hot('shiva', `
    <!-- 2020, Shiva Robotics Academy: a billboard out past the block, search traffic climbing. -->
    <g transform="translate(415 24.3) scale(.72)" class="tw-distant">
      <rect x="92" y="346" width="9" height="276" class="tw-pole"/><rect x="192" y="346" width="9" height="276" class="tw-pole"/>
      <rect x="40" y="244" width="212" height="106" rx="10" class="tw-board tw-snowable"/>
      <image href="assets/logos/opt/shiva.webp" x="52" y="256" width="82" height="82" preserveAspectRatio="xMidYMid meet" class="tw-rounded"/>
      <g class="tw-bars">${[16, 24, 34, 48].map((h, i) => `<rect x="${148 + i * 22}" y="${322 - h}" width="15" height="${h}" rx="3" style="--i:${i}"/>`).join('')}</g>
      <path d="M150 300 L226 262 m-14 -1 l14 1 l-3 13" class="tw-arrow"/>
      <text x="196" y="342" class="tw-plus" text-anchor="middle">+20%</text>
      <rect x="66" y="236" width="40" height="8" rx="3" class="tw-pole"/><rect x="186" y="236" width="40" height="8" rx="3" class="tw-pole"/>
    </g>`)}
    <!-- The hedge along the back of the lawn (none where the truck parks). -->
    <g class="tw-backrow">${Array.from({ length: 36 }, (_, i) => 150 + i * 58).filter((x) => x < 330 || x > 1190).map((x, i) => bush(x, 486, 1.25 + (i % 3) * 0.15)).join('')}</g>
    <!-- Out on the west end: a little wood, wildflowers, a bench under the trees. -->
    ${pine(18, 488, 150)}${tree(70, 482, 1.25, 0)}${pine(132, 486, 120)}${tree(196, 486, 1.05, 1)}${pine(256, 490, 170)}${tree(318, 488, 1.15, 2)}
    ${[[40, 520, .8], [150, 530, .7], [262, 516, .9], [350, 532, .6]].map(([x, y, k]) => bush(x, y, k)).join('')}
    <g transform="translate(206 548)"><rect x="-16" y="-8" width="32" height="3" rx="1" class="tw-bench"/><rect x="-14" y="-5" width="2.4" height="6" class="tw-bench"/><rect x="11.6" y="-5" width="2.4" height="6" class="tw-bench"/><rect x="-16" y="-15" width="32" height="2.4" rx="1" class="tw-bench"/></g>
    ${tree(1866, 480, 1.1, 1)}${tree(1990, 484, 1.3, 2)}${pine(1930, 486, 150)}${tree(2090, 486, .95, 0)}

    <!-- 2025, JM Family Enterprises: one of its Southeast Toyota car haulers,
         backing up to the dealership with its hazards flashing. -->
    <g class="tw-truckdrive">
    ${hot('jm', `
    <g>
      <image href="assets/images/town/jm-truck.webp" x="${TK.x}" y="${TK.y.toFixed(2)}" width="${TK.w}" height="${TK.h.toFixed(2)}" preserveAspectRatio="none" class="tw-snowable"/>
      <g class="tw-hazards">${HAZ.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="url(#twHaz)" class="tw-haz-glow"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" class="tw-haz"/>`).join('')}</g>
      <g class="tw-night tw-nohit"><polygon points="${HEAD[0]},${HEAD[1] - 5} ${HEAD[0]},${HEAD[1] + 5} ${HEAD[0] - 190},${HEAD[1] + 46} ${HEAD[0] - 190},${HEAD[1] - 26}" fill="url(#twHead)"/><circle cx="${HEAD[0]}" cy="${HEAD[1]}" r="11" fill="url(#twBulb)"/></g>
    </g>`)}
    </g>


    ${hot('toyota', `
    <!-- 2024, Toyota: the dealership. A showroom wing, the tall main block
         with the emblem and the store's name, a glass entrance with a pillar
         at its heart, and the service wing where Hunter's gear lives. -->
    <g transform="translate(${OFF.toyota} 0)">
      <rect x="458" y="324" width="108" height="10" rx="3" class="tw-roofcap"/>
      <rect x="462" y="332" width="100" height="10" class="tw-red"/>
      ${showroom(462, 342, 100, 140, [{ f: 'prius', cx: 512, w: 58 }])}

      <rect x="556" y="206" width="352" height="12" rx="3" class="tw-roofcap"/>
      <rect x="560" y="216" width="344" height="266" class="tw-facade tw-fo"/>
      <path d="M560 252 H904 M560 288 H904 M560 324 H904 M646 216 V350 M732 216 V350 M818 216 V350" class="tw-grid"/>
      <ellipse cx="654" cy="270" rx="80" ry="52" fill="url(#twBack)" class="tw-backlit"/><image href="assets/logos/opt/toyota-mark.webp" x="598" y="230" width="112" height="80" preserveAspectRatio="xMidYMid meet" class="tw-tlogo tw-snowable"/>
      <text x="886" y="334" class="tw-sommi tw-snowable" text-anchor="end">SOMMIVILLE</text>
      <rect x="652" y="350" width="244" height="132" class="tw-portal"/>
      ${showroom(658, 356, 232, 126, [{ f: 'bz', cx: 702, w: 59 }, { f: 'gh', cx: 846, w: 62 }])}
      <g class="tw-cracks" clip-path="url(#twShowGlass)"></g>
      <rect x="752" y="388" width="48" height="94" class="tw-pillar tw-fo"/>
      <image href="assets/logos/opt/toyota-emblem.webp" x="760" y="394" width="32" height="22" preserveAspectRatio="xMidYMid meet" class="tw-tlogo tw-snowable"/>
      <rect x="760" y="426" width="32" height="56" class="tw-doorglass"/><path d="M776 426 V482" class="tw-mullp"/>${sticker(661, 444, 11)}

      <rect x="904" y="284" width="234" height="12" rx="3" class="tw-roofcap"/>
      <rect x="904" y="294" width="230" height="188" class="tw-facade2 tw-fo"/>
      <text x="1019" y="322" class="tw-service tw-snowable" text-anchor="middle">SERVICE</text>
      <rect x="904" y="330" width="230" height="8" class="tw-red"/>
      <rect x="914" y="344" width="210" height="138" rx="3" class="tw-bay"/>
      <rect x="914" y="344" width="210" height="6" class="tw-baylight"/>
    </g>`)}

    ${hot('hunter', `
    <!-- 2026, Hunter Engineering: in Toyota's service bay, a Hunter HawkEye
         aligner (its two red beacons firing lasers) reading the targets on
         an SUV's wheels, the SUV going up and down on a Hunter scissor lift.
         The lift and the lasers are moved by the script. -->
    <g transform="translate(${OFF.hunter} 0)">
      <image href="assets/images/town/hawkeye.webp" x="916" y="370" width="75.4" height="112" preserveAspectRatio="xMidYMax meet"/>
      <rect x="996" y="474" width="124" height="8" rx="2" class="tw-liftbase"/>
      <rect x="994" y="470" width="10" height="6" rx="1.5" class="tw-liftbase"/><rect x="1112" y="470" width="10" height="6" rx="1.5" class="tw-liftbase"/>
      <path class="tw-arm-b" d="M1004 474 L1110 466"/><path class="tw-arm-a" d="M1110 474 L1004 466"/>
      <circle class="tw-pivot" cx="1057" cy="470" r="3"/>
      <g class="tw-plat">
        <image href="assets/images/town/car-side.webp" x="994" y="404" width="124" height="53" preserveAspectRatio="xMidYMax meet" class="tw-car-img"/>
        <g class="tw-night tw-nohit"><polygon points="1002,424 1002,430 950,446 950,414" fill="url(#twLed)"/><circle cx="1002.5" cy="427" r="6" fill="url(#twLedBulb)"/><circle cx="1109" cy="423.5" r="6" fill="url(#twTail)"/></g>
        ${[1020, 1093].map((x) => `<g transform="translate(${x} 442)"><rect x="-8" y="-8" width="16" height="16" rx="2" class="tw-tgt"/>${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<rect x="${-5.6 + c * 4}" y="${-5.6 + r * 4}" width="3.2" height="3.2" rx=".6" class="tw-tgt-sq"/>`).join('')).join('')}</g>`).join('')}
        <rect x="990" y="456" width="132" height="10" rx="2" class="tw-lift"/>
        <path d="M992 456 l6 -9 h7 l4 9 z" class="tw-chock"/><rect x="992" y="453" width="17" height="3" class="tw-chockband"/>
        <image href="assets/logos/opt/hunter.webp" x="1036" y="457.5" width="40" height="7" preserveAspectRatio="xMidYMid meet"/>
      </g>
      <polygon class="tw-laser" points="0,0 0,0 0,0"/><polygon class="tw-laser" points="0,0 0,0 0,0"/>
    </g>`)}

    <!-- Front lawn: a walk to the door, a drive to the service bay, hedges. -->
    <g transform="translate(${OFF.toyota} 0)">
    <path d="M760 482 H792 L816 604 H736 Z" class="tw-walk"/>
    <path d="M914 482 H1124 L1150 616 H898 Z" class="tw-drive"/>
    ${bush(666, 510, .8)}${bush(714, 506, .85)}${bush(866, 508, .9)}
    ${[700, 852].map((x) => `<g transform="translate(${x} 560)" class="tw-lamppost"><circle cx="0" cy="-60" r="30" fill="url(#twLamp)" class="tw-lampglow"/><rect x="-2" y="-60" width="4" height="60" class="tw-pole"/><rect x="-7" y="-66" width="14" height="7" rx="3" class="tw-bulb"/></g>`).join('')}
    </g>

    ${hot('adt', `
    <!-- 2026, ADT: its sign in the hedge in front of the dealership's wall, and
         its camera up at the roofline looking down over it. -->
    <g transform="translate(${OFF.adt} 0)">
      <g class="tw-adt-alarm tw-nohit"><circle cx="608" cy="458" r="58" fill="url(#twAdtGlow)" opacity=".8"/><ellipse cx="600" cy="510" rx="62" ry="8" fill="url(#twAdtPool)" opacity=".7"/></g>
      <image href="assets/images/town/adt-sign.webp?v=2" x="584" y="430" width="48" height="78" preserveAspectRatio="xMidYMax meet" class="tw-adtsign"/>
      <image href="assets/images/town/adt-sign-lit.webp" x="584" y="430" width="48" height="78" preserveAspectRatio="xMidYMax meet" class="tw-adtsign-lit tw-nohit" filter="url(#twAdtLit)"/>
      <g class="tw-adtbush">${bush(612, 514, 1.05)}<g class="tw-adt-rim tw-nohit">${bush(612, 514, 1.05).replace(/class="tw-leaf2?"/g, 'fill="url(#twAdtRim)"')}</g></g>
      <g class="tw-cctv" transform="translate(568 350)">
        <rect x="-5" y="-5" width="10" height="10" rx="2" class="tw-pole"/>
        <g class="tw-cctv-head" transform="rotate(-108)">
          <polygon points="-30,0 -150,-30 -150,30" fill="url(#twCone)" class="tw-cone tw-nohit" transform="scale(1 .55)"/>
          <g class="tw-cambody"><rect x="-8" y="-2.5" width="9" height="5" rx="2" class="tw-pole"/>
          <rect x="-34" y="-7" width="28" height="14" rx="4" class="tw-camshell"/>
          <rect x="-39" y="-5" width="6" height="10" rx="2" fill="#1f6fd1"/>
          <circle cx="-12" cy="3" r="1.8" class="tw-rec"/></g>
        </g>
      </g>
    </g>`)}

    ${hot('rjax', `
    <!-- 2019, Renaissance Jax: a competition robot in the logo's green, on its
         own patch of lawn. Its camera locks on the target, or on the pointer
         when it comes close, and it drives over for a look. -->
    <g>
      <g transform="translate(590 534)"><rect x="-1.6" y="0" width="3.2" height="40" class="tw-pole"/><image href="assets/logos/opt/renaissance-jax.webp" x="-17" y="-30" width="34" height="34" class="tw-rounded"/></g>
      <g transform="translate(714 544)"><rect x="-2" y="0" width="4" height="34" class="tw-pole"/><path d="M-12 -18 v14 h24 v-14 h-6 v8 h-12 v-8 z" class="tw-target"/></g>
      <path class="tw-vision" d="M0 0"/>
      <g class="tw-reticle"><path d="M-20 -14 v-7 h7 M13 -21 h7 v7 M20 14 v7 h-7 M-13 21 h-7 v-7"/></g>
      <g class="tw-frc"><g class="tw-frc-flip">
        <rect x="-38" y="6" width="76" height="12" rx="6" fill="#1b1d22"/>
        <rect x="-34" y="-12" width="68" height="20" rx="5" fill="#1fd12a" class="tw-ol"/>
        <rect x="-26" y="-7" width="22" height="3" rx="1.5" fill="#fff" opacity=".8"/><rect x="-26" y="-1" width="22" height="3" rx="1.5" fill="#fff" opacity=".8"/>
        <circle cx="-22" cy="20" r="6" class="tw-tyre"/><circle cx="22" cy="20" r="6" class="tw-tyre"/>
        <rect x="10" y="-26" width="6" height="16" class="tw-pole"/>
        <g class="tw-turret" transform="translate(13 -28)"><rect x="-9" y="-6" width="18" height="11" rx="3" class="tw-cam"/><circle cx="7" cy="-0.5" r="3.6" class="tw-ringlight"/></g>
      </g></g>
    </g>`)}

    ${hot('rfa', `
    <!-- 2022, Robotics For All: the rover, in the colours of its logo, in its
         corner of the lawn. It comes over when the pointer is nearby, and
         keeps a polite distance. -->
    <g class="tw-rover" transform="translate(1850 556)"><g class="tw-rover-flip"><g class="tw-rover-hop"><g class="tw-rover-bob"><g class="tw-rover-shiver">
      <rect x="-1.6" y="-60" width="3.2" height="11" class="tw-pole"/><circle cx="0" cy="-62" r="3.6" class="tw-blink" fill="#ff5a3d"/>
      <rect x="-22" y="-50" width="44" height="31" rx="11" fill="#ffc928" class="tw-ol"/>
      <g class="tw-eyes"><rect x="-14" y="-43" width="11" height="12" rx="3.5" class="tw-eye"/><rect x="3" y="-43" width="11" height="12" rx="3.5" class="tw-eye"/></g>
      <g class="tw-eyes"><circle class="tw-pupil2 tw-follow" cx="-8.5" cy="-37" r="2.6"/><circle class="tw-pupil2 tw-follow" cx="8.5" cy="-37" r="2.6"/></g><path d="M-6 -24 q6 4 12 0" class="tw-smile"/>
      <rect x="-17" y="-19" width="34" height="22" rx="6" fill="#2b6fe0" class="tw-ol"/><rect x="-9" y="-15" width="18" height="9" rx="2" fill="#1b4fb4"/>
      <path d="M-17 -12 l-9 8" class="tw-arm"/><path d="M17 -12 l9 8" class="tw-arm tw-arm-r"/>
      <g class="tw-mail"><rect x="20" y="-14" width="20" height="14" rx="2" class="tw-paper"/><path d="M21 -13 l9 7 l9 -7" class="tw-fold"/></g>
      <circle cx="-10" cy="6" r="6.5" class="tw-tyre"/><circle cx="10" cy="6" r="6.5" class="tw-tyre"/>
      <g class="tw-jacket"><path d="M-19 -20 h38 a3 3 0 0 1 3 3 v19 a4 4 0 0 1 -4 4 h-36 a4 4 0 0 1 -4 -4 v-19 a3 3 0 0 1 3 -3 z" fill="#e63946" class="tw-ol"/><path d="M-20 -11 h40 M-20 -3 h40" class="tw-quilt"/><path d="M0 -19 v24" class="tw-zip"/><path d="M-12 -21 q12 7 24 0 v-2 h-24 z" fill="#f4f1ea" class="tw-ol"/></g>
      <g class="tw-beanie"><path d="M-21 -46 q21 -19 42 0 z" fill="#e63946" class="tw-ol"/><rect x="-22" y="-51" width="44" height="6" rx="3" fill="#f4f1ea" class="tw-ol"/></g>
    </g></g></g></g></g>`)}

    <!-- The police, once the showroom's alarm has gone off for a while. -->
    <g class="tw-police" aria-hidden="true"><g transform="translate(1330 640)">
      <path d="M2 -6 q-2 -9 8 -10 l16 -2 l10 -10 h30 l12 10 l14 2 q6 1 6 8 v8 h-96 z" class="tw-pc-body"/>
      <path d="M38 -26 h27 l9 8 h-44 z" class="tw-pc-win"/><path d="M52 -26 v8" class="tw-pc-pillar"/>
      <path d="M26 -16 h64 v12 h-64 z" class="tw-pc-door"/><text x="58" y="-7" class="tw-pc-t" text-anchor="middle">POLICE</text>
      <rect x="2" y="-12" width="5" height="3" rx="1" class="tw-pc-head"/><rect x="92" y="-12" width="5" height="3" rx="1" class="tw-pc-tail"/>
      <g class="tw-pc-bar"><rect x="44" y="-32" width="22" height="5" rx="2" class="tw-pc-barbase"/><rect x="45" y="-31.4" width="10" height="3.8" rx="1.4" class="tw-pc-r"/><rect x="55" y="-31.4" width="10" height="3.8" rx="1.4" class="tw-pc-b"/>
        <circle cx="50" cy="-30" r="16" fill="url(#twBar)" class="tw-pc-gr"/><circle cx="60" cy="-30" r="16" fill="url(#twBar)" class="tw-pc-gb"/></g>
      ${[20, 78].map((x) => `<circle cx="${x}" cy="2" r="7.5" class="tw-tyre"/><circle cx="${x}" cy="2" r="3" class="tw-hub"/>`).join('')}
    </g></g>

    <!-- East of here everything is drawn in its own coordinates and slid
         back by EAST (see the top). -->
    <g transform="translate(${-EAST} 0)">
    <!-- The visitor center, where everyone starts: the woods behind it, the
         center, the welcome sign, a signpost, the Classic Line bus stop
         and the time machine. -->
    <g class="tw-woods">${pine(2822, 412, 150)}${pine(2880, 410, 186)}${pine(3044, 410, 176)}${pine(3100, 412, 140)}${pine(3150, 440, 120)}${pine(2786, 440, 110)}</g>
    ${hot('vc', `
    <g>${visitorCenter()}
    </g>`)}
    <path d="M${VC.c - 58} 507 h116 L${VC.c + 70} 604 H${VC.c - 70} Z" class="tw-walk"/>
    <g class="tw-signpost tw-snowable">
      <rect x="2452" y="410" width="6" height="120" class="tw-pole"/>
      <path d="M2457 414 H2408 l-11 11 l11 11 H2457 Z" class="tw-dir"/><text x="2429" y="428.6" class="tw-dir-t" text-anchor="middle">WORK</text>
      <path d="M2453 444 H2502 l11 11 l-11 11 H2453 Z" class="tw-dir"/><text x="2479" y="458.6" class="tw-dir-t" text-anchor="middle">HOME</text>
    </g>
    ${busStop()}

    <!-- The UF corner: FICS (its sign, and HiPerGator's racks behind glass,
         the dish on the roof watching the sky), Malachowsky Hall, the gator
         pond in front of it, the gator globe. -->
    ${hot('edu', `
    <g>
      <image href="assets/images/town/malachowsky.webp" x="3392" y="302.6" width="640" height="191.42" preserveAspectRatio="none" class="tw-hall tw-snowable"/>
      <image href="assets/images/town/malachowsky-night.webp" x="3392" y="302.6" width="640" height="191.42" preserveAspectRatio="none" class="tw-night tw-hall-n"/>
      <g class="tw-night tw-nohit"><ellipse cx="3712" cy="492" rx="330" ry="22" fill="url(#twVcLight)"/></g>
      ${[3404, 3446, 3488, 3530, 3572, 3614, 3656, 3698, 3740, 3782, 3888, 3930, 3972, 4014].map((x, k) => bush(x, 499, .62 + (k % 3) * 0.08)).join('')}
      <path d="M3824 494 h32 l14 110 h-60 z" class="tw-walk"/>
      <g class="tw-hallsign"><path d="M3878 526 q-2 -12 5 -13 h48 q7 1 5 13 z" class="tw-brick"/><path d="M3880 520 h50 M3884 516.4 v3.6 M3898 516.4 v3.6 M3912 516.4 v3.6 M3926 516.4 v3.6" class="tw-brick-l"/>
        <rect x="3880" y="498" width="50" height="15" rx="1.4" class="tw-hallplate"/><text x="3905" y="504.6" class="tw-hall-t" text-anchor="middle">MALACHOWSKY</text><text x="3905" y="510.4" class="tw-hall-s" text-anchor="middle">HALL</text></g>
      <ellipse cx="3640" cy="552" rx="122" ry="27" class="tw-pondbank"/>
      <ellipse cx="3640" cy="553" rx="114" ry="23" class="tw-pond"/>
      <ellipse cx="3610" cy="546" rx="60" ry="7" class="tw-pondshine"/>
      ${[[3560, 556, 6], [3700, 560, 5], [3742, 548, 4.4]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.5}" class="tw-lily"/><path d="M${x} ${y} l${r * 0.9} ${-r * 0.2}" class="tw-lily-cut"/>`).join('')}
      <circle cx="3702" cy="558.6" r="1.6" class="tw-flower" style="--c:#ff9ec4"/>
      <ellipse cx="3524" cy="546" rx="12" ry="7" class="tw-rock"/><ellipse cx="3756" cy="566" rx="11" ry="6" class="tw-rock"/><ellipse cx="3716" cy="532" rx="9" ry="5" class="tw-rock"/>
      ${[3530, 3536, 3542, 3748, 3754, 3760].map((x, k) => `<path d="M${x} ${560 - (k % 3)} q${k % 2 ? 2 : -2} -14 ${k % 2 ? 1 : -1} -24" class="tw-reed"/><rect x="${x + (k % 2 ? 0.4 : -2.4)}" y="${531 - (k % 3)}" width="2.4" height="7" rx="1.2" class="tw-cattail"/>`).join('')}
      <g class="tw-ripples"><ellipse cx="3644" cy="555" rx="20" ry="5"/><ellipse cx="3644" cy="555" rx="20" ry="5" style="animation-delay:-1.6s"/></g>
      <g transform="translate(3536 3)"><g class="tw-gator" transform="translate(-10 26)">
        <path d="M86 530 q4 -14 18 -14 h30 q10 0 18 8 l10 6 z" class="tw-gator-b"/>
        <circle cx="102" cy="518" r="7" class="tw-gator-b"/><circle cx="118" cy="518" r="7" class="tw-gator-b"/>
        <circle cx="102" cy="517" r="3.6" fill="#fff"/><circle cx="118" cy="517" r="3.6" fill="#fff"/>
        <circle cx="103" cy="517" r="1.8" class="tw-pupil"/><circle cx="119" cy="517" r="1.8" class="tw-pupil"/>
        <rect x="97" y="511" width="26" height="6" class="tw-lid"/>
      </g></g>
      <image href="assets/images/town/gator-globe.webp" x="3474" y="466" width="43.7" height="58" preserveAspectRatio="none" class="tw-globe tw-snowable"/>
      <rect x="3786" y="512" width="3.4" height="56" class="tw-pole"/>
      <image href="assets/images/town/uf-pennant.webp" x="3789.4" y="512" width="60" height="20" preserveAspectRatio="xMinYMid meet"/>
      ${sticker(3858, 476, 6)}
    </g>`)}
    ${hot('fics', `
    <g>
      <rect x="3308" y="404" width="82" height="8" rx="2" class="tw-roofcap"/>
      <rect x="3312" y="410" width="74" height="76" class="tw-hpg tw-fo"/>
      <rect x="3318" y="415" width="62" height="11" rx="2" class="tw-hpg-band"/><text x="3349" y="423.2" class="tw-hpg-t" text-anchor="middle">HiPerGator</text>
      <rect x="3318" y="430" width="62" height="52" rx="1.5" class="tw-hpg-glass"/>
      ${[0, 1, 2, 3, 4].map((k) => `<g transform="translate(${3321 + k * 11.8} 433)"><rect width="9.6" height="46" rx="1" class="tw-rack"/>${[0, 1, 2, 3, 4, 5, 6].map((r) => `<rect x="1.4" y="${2.6 + r * 6.2}" width="6.8" height="1.4" rx=".4" class="tw-rackslot"/><circle cx="2.4" cy="${5.2 + r * 6.2}" r=".8" class="tw-led" style="--d:${(((r + k * 3) % 7) * 0.21).toFixed(2)}s"/><circle cx="5" cy="${5.2 + r * 6.2}" r=".8" class="tw-led" style="--d:${(((r * 2 + k) % 5) * 0.27).toFixed(2)}s"/>`).join('')}</g>`).join('')}
      <path d="M3324 434 l-5 44 M3352 434 l-9 44" class="tw-shine"/>
      ${sticker(3374, 472, 7)}
      <g class="tw-dish-g" transform="translate(3334 404)">
        <rect x="-3" y="-16" width="6" height="16" class="tw-pole"/>
        <g class="tw-dish" transform="translate(0 -16)"><path d="M-22 -14 q22 22 44 0 z" class="tw-dishface"/><path d="M0 -6 l0 -16" class="tw-feed"/><circle cx="0" cy="-24" r="3" class="tw-led-on"/>
        <g class="tw-pings"><path d="M-10 -34 a14 14 0 0 1 20 0"/><path d="M-18 -42 a26 26 0 0 1 36 0" style="animation-delay:.4s"/></g></g>
      </g>
      <path d="M3398 526 q-3 -14 6 -15 h52 q9 1 6 15 z" class="tw-stone"/>
      ${[[3406, 518, 5], [3420, 514, 4.4], [3436, 519, 5], [3452, 515, 4.4]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.7}" class="tw-stone2"/>`).join('')}
      <rect x="3402" y="478" width="56" height="33" rx="3" class="tw-ficsboard"/>
      ${img('fics', 3408, 481, 44, 18, 'tw-snowable')}
      <text x="3430" y="506" class="tw-ficsboard-t" text-anchor="middle">CYBERSECURITY RESEARCH</text>
    </g>`)}

    <!-- Home: the house, the garage with my Civic, the bench, and the
         projects around them (see PROJECTS), then palms to the east. -->
    <g transform="translate(${HOMESH} 0)">
    ${garage()}
    ${bench()}
    ${palm(4214, 494, 96, 12, 0)}${palm(4262, 496, 120, -8, 1)}${palm(4318, 494, 104, 14, 2)}
    ${[[4236, 504, .7], [4290, 506, .6], [4344, 502, .75]].map(([x, y, k]) => bush(x, y, k)).join('')}
    ${[4200, 4212, 4226, 4248, 4276, 4300, 4330].map((x, k) => `<circle cx="${x}" cy="${512 + (k % 3) * 2}" r="1.6" class="tw-flower" style="--c:${['#ff6b8b', '#ffd166', '#c084fc', '#ff8fab', '#f97316'][k % 5]}"/>`).join('')}
    <g class="tw-snowy" aria-hidden="true"><rect x="3765" y="383" width="318" height="8.5" rx="4" class="tw-snowcap"/>
      <path d="M3392 333 Q3431 300 3470.6 259.4 Q3510 298.6 3549.4 333.4 L3545 329 Q3510 292 3470.6 252.6 Q3431 294 3396 329 Z" class="tw-snowslope"/>
      <path d="M3524 380 Q3590 352 3655 324.4 Q3720 352 3786 380 L3782 375.4 Q3720 346 3655 318 Q3590 346 3528 375.4 Z" class="tw-snowslope"/>
      <path d="M3484.6 427 L3509 410.4 L3533.4 427 L3530 423 L3509 406 L3488 423 Z" class="tw-snowslope"/>
      <rect x="3493" y="237" width="25" height="6" rx="3" class="tw-snowcap"/></g>
    </g>

    ${hot('tm', `
    <g transform="translate(5090 487) scale(.5) translate(-3390 -487)">
      <ellipse cx="3390" cy="487" rx="66" ry="10" class="tw-tm-pad"/>
      <ellipse cx="3390" cy="485" rx="52" ry="6.5" class="tw-tm-glow"/>
      <path d="M3366 382 l-9 -12 M3414 382 l9 -12" class="tw-feed"/><circle cx="3357" cy="369" r="3" class="tw-led-on"/><circle cx="3423" cy="369" r="3" class="tw-led-on"/>
      <rect x="3348" y="378" width="84" height="106" rx="40" class="tw-tm-body tw-ol"/>
      <rect x="3360" y="392" width="60" height="72" rx="30" class="tw-tm-glass"/>
      <g transform="translate(3390 428)"><g class="tw-tm-swirl"><circle r="22" class="tw-tm-ring"/></g><g class="tw-tm-swirl tw-tm-back"><circle r="13" class="tw-tm-ring tw-tm-ring2"/></g></g>
      <rect x="3352" y="350" width="76" height="22" rx="6" class="tw-tm-sign"/>
      <text x="3390" y="365.5" class="tw-tm-yr" text-anchor="middle">1977</text>
      <text x="3390" y="343" class="tw-tm-t" text-anchor="middle">TIME MACHINE</text>
    </g>`)}
    ${tree(2250, 482, 1.15, 2)}${tree(5128, 486, 1.25, 0)}${bush(5068, 492, .9)}${palm(5160, 494, 90, -10, 1)}
    <g class="tw-snowy" aria-hidden="true">${[[2568, 388, 208], [3142, 408, 100], [3308, 404, 82]].map(([x, y, w]) => `<rect x="${x - 1}" y="${y - 7}" width="${w + 2}" height="8.5" rx="4" class="tw-snowcap"/>`).join('')}
      <path d="M${VC.l - 14} ${VC.eave + 6} L${VC.c} ${VC.apex - 4} L${VC.r + 14} ${VC.eave + 6} L${VC.r + 8} ${VC.eave + 1} L${VC.c} ${VC.apex - 12} L${VC.l - 8} ${VC.eave + 1} Z" class="tw-snowslope"/></g>
    </g>

    <!-- Snow, when it snows: it settles on the roofs and the ground (town.css). -->
    <g class="tw-snowy" aria-hidden="true">${[[443.8, 200, 152.6], [1158, 324, 108], [1256, 206, 352], [1604, 284, 234]].map(([x, y, w]) => `<rect x="${x - 1}" y="${y - 7}" width="${w + 2}" height="8.5" rx="4" class="tw-snowcap"/>`).join('')}</g>

    <!-- A pin on every stop. -->
    <g class="tw-pins">${roles.filter((r) => SPOT[r.id].pin || r.id === 'rjax' || r.id === 'rfa').map((r) => { const at = SPOT[r.id].pin ? [SPOT[r.id].pin[0] + (OFF[r.id] || 0), SPOT[r.id].pin[1]] : null; return `<g class="tw-pin" data-id="${r.id}"${at ? ` transform="translate(${at[0]} ${at[1]})"` : ''} style="--tint:${r.tint}"><circle r="9" class="tw-pin-ring"/><circle r="4.4" class="tw-pin-dot"/></g>`; }).join('')}</g>
  </g>
</svg>`;

const work = roles.filter((r) => r.year).sort((a, b) => a.year - b.year || order.indexOf(a.id) - order.indexOf(b.id));
const data = {
  order: [...work.map((r) => r.id), 'vc', ...BENCH.map((p) => p.id), ...PROJECTS.map((p) => p.id)],
  W: WORLD, home: HOME,
  truck: { wait: TRUCK_WAIT, right: TK.x + TK.w - TRUCK_WAIT },
  civic: { wins: WINS, fb: FB, rb: RB, ground: CV.ground },
  glass: [[462, 342, 100, 140], [658, 356, 232, 126]],
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
            <button type="button" class="tw-x" aria-label="Back to the whole block"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
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
  .replace('content="#070a1a" media', 'content="#050814" media').replace('content="#9fcbef" media', 'content="#eef2f8" media')
  .replace(/<!-- town:start -->[\s\S]*?<!-- town:end -->/, '')
  .replace('<section id="path-circuit" class="section journey-section tw-retired" data-compact hidden>', '<section id="experience" class="section journey-section" data-compact>')
  .replace('<link rel="canonical" href="https://ajaysommi.github.io/" />', '<link rel="canonical" href="https://ajaysommi.github.io/classic.html" />');
if (!classic.includes('class="classic"') || classic.includes('town:start') || !classic.includes('<section id="experience" class="section journey-section"')) throw new Error('classic page did not build');
fs.writeFileSync(path.join(root, 'classic.html'), classic);
console.log('classic.html updated', classic.length);
