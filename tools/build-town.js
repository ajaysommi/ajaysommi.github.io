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
const WORLD = 5520;
const HOME = 2900;   // the visitor center, where the street starts
const OFF = { edu: 170, fics: 230, shiva: 230, rjax: 330, toyota: 700, hunter: 700, adt: 700 };

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

/* East of the visitor center: what I've built, one lot each.
   PLACEHOLDERS. Each lot is a stand-in drawing with a red note saying what
   should go there; the card under it already uses the real write up from
   retro/content.js. To replace one, draw its lot in lot() (or give it its
   own drawing) and delete its `ph` note. */
const PROJECTS = [
  { id: 'p-civic', src: ['offclock', 'civic'], name: 'Car repair', tint: '#c0392b', ph: 'Draw a home garage with my car up on jack stands, tools on the wall.' },
  { id: 'p-macbook', src: ['offclock', 'macbook'], name: 'Laptop repair', tint: '#6b7280', ph: 'Draw a repair bench with the MacBook opened up and its logic board out.' },
  { id: 'p-electronics', src: ['offclock', 'electronics'], name: 'Electronics', tint: '#0ea5e9', ph: 'Draw a tinker shop: Arduino, the homemade soldering iron, the self opening lid.' },
  { id: 'p-sommiscript', src: ['projects', 'sommiscript'], name: 'SommiScript', tint: '#f59e0b', ph: 'Draw something for my programming language (a print shop? a little school?).' },
  { id: 'p-betai', src: ['projects', 'betai'], name: 'BetAI', tint: '#16a34a', ph: 'Draw a stadium style kiosk or a scoreboard for the betting model marketplace.' },
  { id: 'p-gatorgoods', src: ['projects', 'gatorgoods'], name: 'GatorGoods', tint: '#fa4616', ph: 'Draw a campus market stall for the student marketplace.' },
  { id: 'p-crash', src: ['projects', 'crash'], name: 'Crash Analysis', tint: '#dc2626', ph: 'Draw a crash test lab with a dummy and charts.' },
  { id: 'p-avl', src: ['projects', 'avl'], name: 'BalanceTree', tint: '#65a30d', ph: 'Draw a tree nursery with a perfectly balanced tree.' },
  { id: 'p-wadfs', src: ['projects', 'wadfs'], name: 'WAD FS', tint: '#7c3aed', ph: 'Draw a filing archive / warehouse for the file system.' }
];
const LOT0 = 3560, LOTW = 205;
PROJECTS.forEach((p, i) => { p.x = LOT0 + i * LOTW; TINT[p.id] = p.tint; });

/* Where each stop is: the box the scene leans in to, and its pin. */
const SPOT = {
  shiva: { zoom: [196, 186, 190, 110], pin: [290, 196] },
  rjax: { zoom: null, pin: null },
  rfa: { zoom: null, pin: null },
  edu: { zoom: [6, 480, 270, 110], pin: [120, 520] },
  jm: { zoom: [540, 372, 210, 120], pin: [604, 420] },
  toyota: { zoom: [456, 200, 450, 290], pin: [640, 230] },
  hunter: { zoom: [902, 330, 236, 160], pin: [1020, 360] },
  fics: { zoom: [8, 250, 128, 236], pin: [70, 296] },
  adt: { zoom: [548, 334, 110, 180], pin: [610, 424] },
  vc: { zoom: [2700, 222, 400, 290], pin: [2900, 236] },
  tm: { zoom: [3320, 330, 140, 170], pin: [3390, 344] },
  ...Object.fromEntries(PROJECTS.map((p) => [p.id, { zoom: [p.x - 16, 330, 202, 186], pin: [p.x + 85, 360] }]))
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
roles.push({ id: 'vc', org: 'Sommiville Visitor Center', short: 'Visitor center', badge: 'Hi', role: `${P.name}, ${P.title}`, when: 'University of Florida, Class of 2026', where: 'Florida', text: P.about.join(' '), about: '', stats: [], tags: [], photos: [], logo: null, tint: TINT.vc, go: [['Classic portfolio', 'classic.html'], ['Résumé', 'resume.html'], ['GitHub', P.github], ['LinkedIn', P.linkedin], ['Email', 'mailto:' + P.email]] });
roles.push({ id: 'tm', org: 'Time machine', short: 'Time machine', badge: '1977', role: '', when: '', where: '', text: '', about: '', stats: [], tags: [], photos: [], logo: null, tint: TINT.tm, special: true });
PROJECTS.forEach((p) => {
  const s = P[p.src[0]].find((q) => q.id === p.src[1]) || {};
  const off = p.src[0] === 'offclock';
  const pics = off ? [s.cover, ...(s.steps || []).map((st) => st[0])].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).slice(0, 6) : s.shot ? [s.shot] : [];
  roles.push({ id: p.id, org: off ? s.title : s.full, short: p.name, badge: off ? 'Fix' : 'Build', role: off ? 'Off the clock' : s.kind, when: off ? '' : s.stack, where: '', text: off ? s.lede : s.text, about: '', stats: [], tags: off ? [] : String(s.stack || '').split(' / '), photos: pics.map(big), logo: null, tint: p.tint, ph: p.ph, url: s.url || '' });
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
/* A big red gift bow (the picture) up on the hood, clear of the grille. */
const bow = (cx, cy, w) => `<image href="assets/images/town/bow.webp" x="${(cx - w / 2).toFixed(1)}" y="${(cy - w * 0.799 * 0.6).toFixed(1)}" width="${w.toFixed(1)}" height="${(w * 0.799).toFixed(1)}" class="tw-bow"/>`;
/* A placeholder lot (see PROJECTS). */
const lot = (p) => hot(p.id, `
    <g>
      <text x="${p.x + 85}" y="352" class="tw-ph-big" text-anchor="middle">PLACEHOLDER</text>
      <rect x="${p.x}" y="362" width="170" height="10" rx="3" class="tw-roofcap"/>
      <rect x="${p.x + 4}" y="370" width="162" height="116" class="tw-lotwall tw-fo"/>
      <rect x="${p.x + 14}" y="378" width="142" height="20" rx="4" class="tw-jmband"/>
      <text x="${p.x + 85}" y="392" class="tw-lot-n" text-anchor="middle">${esc(p.name)}</text>
      <path d="M${p.x} 402 h170 l-8 14 h-154 z" fill="${p.tint}" class="tw-awning"/>
      ${[0, 1, 2, 3, 4].map((k) => `<path d="M${p.x + 17 + k * 34} 402 h17 l-1.6 14 h-15.4 z" class="tw-awning-s"/>`).join('')}
      <rect x="${p.x + 14}" y="424" width="88" height="48" rx="3" class="tw-win"/>
      <rect x="${p.x + 114}" y="430" width="40" height="56" rx="2" class="tw-door"/>
      <text x="${p.x + 85}" y="503" class="tw-ph-note" text-anchor="middle">TODO: draw ${esc(p.name.toLowerCase())}</text>
    </g>`);

/* A showroom: amber light, spots shining down onto the cars, glass in front. */
const showroom = (x, y, w, h, cars) => {
  const spots = cars.map((c) => c.cx), fy = y + h - 8;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="tw-int"/>
      ${spots.map((cx, i) => `<polygon points="${cx - 10},${y} ${cx + 10},${y} ${cx + 44},${fy} ${cx - 44},${fy}" class="tw-spotcone" style="--i:${i}"/><rect x="${cx - 9}" y="${y}" width="18" height="4" rx="2" class="tw-lamp"/>`).join('')}
      <rect x="${x}" y="${fy}" width="${w}" height="8" class="tw-showfloor"/>
      ${spots.map((cx, i) => `<ellipse cx="${cx}" cy="${fy + 1}" rx="46" ry="6" class="tw-pool" style="--i:${i}"/>`).join('')}
      ${cars.map((c) => `<ellipse cx="${c.cx}" cy="${fy + 1.5}" rx="${c.w * 0.46}" ry="3.2" class="tw-carshadow"/>` + pic(c.f, c.cx - c.w / 2, fy + 3 - c.w * 0.72, c.w, c.w * 0.72, 'tw-showcar') + bow(c.cx, fy + 3 - c.w * 0.72 * 0.6, c.w * 0.5)).join('')}
      <rect x="${x}" y="${y}" width="${w}" height="${h}" class="tw-glassover"/>
      <path d="M${x + 14} ${y + 8} l-12 ${Math.round(h * 0.4)} M${x + w * 0.42} ${y + 8} l-22 ${Math.round(h * 0.7)}" class="tw-shine"/>`;
};

// Stars: scattered at random (the same random every build), each with its own size and slow breath.
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const STARS = Array.from({ length: 210 }, () => { const r = rnd(); return `<circle cx="${(rnd() * WORLD).toFixed(1)}" cy="${(-560 + rnd() * 820).toFixed(1)}" r="${(0.5 + r * r * 1.6).toFixed(2)}" style="--t:${(3 + rnd() * 6).toFixed(1)}s;--d:${(-rnd() * 9).toFixed(1)}s;--lo:${(0.15 + rnd() * 0.35).toFixed(2)}"/>`; }).join('');

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
    <linearGradient id="twDayInt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3ead8"/><stop offset="1" stop-color="#ddd0b6"/></linearGradient>
    ${Object.entries(TINT).map(([id, c]) => `<filter id="twGlow-${id}" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="3.6" result="s"/><feComponentTransfer in="s" result="b"><feFuncA type="linear" slope="2.4"/></feComponentTransfer><feFlood flood-color="${c}" flood-opacity=".95"/><feComposite in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="twHalo-${id}" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="3.6" result="s"/><feComponentTransfer in="s" result="b"><feFuncA type="linear" slope="2.4"/></feComponentTransfer><feFlood flood-color="${c}" flood-opacity=".95"/><feComposite in2="b" operator="in"/></filter>`).join('')}
  </defs>

  <!-- Far: the sky, the hills, the clouds; it slides by slower than the
       block as you scroll along it. -->
  <g class="tw-far">
    <rect class="tw-sky-d" x="-800" y="-1600" width="${WORLD + 1600}" height="2140" fill="url(#twSkyDay)"/>
    <rect class="tw-sky-n" x="-800" y="-1600" width="${WORLD + 1600}" height="2140" fill="url(#twSkyNight)"/>
    <g class="tw-stars">${STARS}</g>
    <rect class="tw-overcast" x="-800" y="-1600" width="${WORLD + 1600}" height="2140"/>
    <g class="tw-sun"><circle cx="1380" cy="-30" r="70" fill="url(#twHalo)"/><circle cx="1380" cy="-30" r="32" fill="#ffcf6b"/></g>
    <g class="tw-moon"><circle cx="1380" cy="-36" r="30" fill="#f6eed6"/><circle cx="1396" cy="-46" r="27" class="tw-moon-cut"/></g>
    <g class="tw-cloud" style="--dur:110s;--from:-20s"><g transform="translate(380 110) scale(1.0)"><rect x="0" y="14" width="180" height="30" rx="15"/><circle cx="60" cy="16" r="28"/><circle cx="104" cy="8" r="36"/><circle cx="140" cy="22" r="20"/></g></g>
    <g class="tw-cloud" style="--dur:150s;--from:-90s"><g transform="translate(820 60) scale(0.7)"><rect x="0" y="14" width="180" height="30" rx="15"/><circle cx="60" cy="16" r="28"/><circle cx="104" cy="8" r="36"/><circle cx="140" cy="22" r="20"/></g></g>
    <g class="tw-cloud" style="--dur:180s;--from:-150s"><g transform="translate(120 60) scale(0.55)"><rect x="0" y="14" width="180" height="30" rx="15"/><circle cx="60" cy="16" r="28"/><circle cx="104" cy="8" r="36"/><circle cx="140" cy="22" r="20"/></g></g>
    <g class="tw-cloud" style="--dur:170s;--from:-40s"><g transform="translate(1500 -120) scale(0.8)"><rect x="0" y="14" width="180" height="30" rx="15"/><circle cx="60" cy="16" r="28"/><circle cx="104" cy="8" r="36"/><circle cx="140" cy="22" r="20"/></g></g>
    <g class="tw-cloud" style="--dur:210s;--from:-120s"><g transform="translate(600 -220) scale(0.65)"><rect x="0" y="14" width="180" height="30" rx="15"/><circle cx="60" cy="16" r="28"/><circle cx="104" cy="8" r="36"/><circle cx="140" cy="22" r="20"/></g></g>
    <g class="tw-cloud" style="--dur:140s;--from:-70s"><g transform="translate(1900 30) scale(0.9)"><rect x="0" y="14" width="180" height="30" rx="15"/><circle cx="60" cy="16" r="28"/><circle cx="104" cy="8" r="36"/><circle cx="140" cy="22" r="20"/></g></g>
    <path class="tw-mtn2" d="${HILL2}"/>
    <path class="tw-mtn1" d="${HILL1}"/>
  </g>

  <!-- Middle: the block. -->
  <g class="tw-mid">
    <rect class="tw-grass" x="-800" y="470" width="${WORLD + 1600}" height="700"/>
    <rect class="tw-snowground" x="-800" y="474" width="${WORLD + 1600}" height="700"/>
    ${hot('shiva', `
    <!-- 2020, Shiva Robotics Academy: a billboard out past the block, search traffic climbing. -->
    <g transform="translate(415 24.3) scale(.72)" class="tw-distant">
      <rect x="92" y="346" width="9" height="276" class="tw-pole"/><rect x="192" y="346" width="9" height="276" class="tw-pole"/>
      <rect x="40" y="244" width="212" height="106" rx="10" class="tw-board"/>
      <image href="assets/logos/opt/shiva.webp" x="52" y="256" width="82" height="82" preserveAspectRatio="xMidYMid meet" class="tw-rounded"/>
      <g class="tw-bars">${[16, 24, 34, 48].map((h, i) => `<rect x="${148 + i * 22}" y="${322 - h}" width="15" height="${h}" rx="3" style="--i:${i}"/>`).join('')}</g>
      <path d="M150 300 L226 262 m-14 -1 l14 1 l-3 13" class="tw-arrow"/>
      <text x="196" y="342" class="tw-plus" text-anchor="middle">+20%</text>
      <rect x="66" y="236" width="40" height="8" rx="3" class="tw-pole"/><rect x="186" y="236" width="40" height="8" rx="3" class="tw-pole"/>
    </g>`)}
    <g class="tw-backrow">${Array.from({ length: 36 }, (_, i) => bush(150 + i * 58, 486, 1.25 + (i % 3) * 0.15)).join('')}</g>
    ${tree(70, 480, 1.2, 0)}${tree(1866, 480, 1.1, 1)}${tree(1996, 484, 1.3, 2)}${tree(2130, 480, 1.05, 0)}

    <!-- FICS at UF: a campus lab building. Its sign on the front, racks and
         a terminal catching prompts meant to break a chatbot in the window,
         and a dish on the roof that turns to watch the sky. -->
    ${hot('fics', `
    <g transform="translate(${OFF.fics} 0)">
      <rect x="12" y="300" width="118" height="10" rx="3" class="tw-roofcap"/>
      <rect x="16" y="308" width="110" height="176" class="tw-labwall tw-fo"/>
      <rect x="24" y="318" width="94" height="30" rx="4" class="tw-jmband"/>
      ${img('fics', 44, 320, 54, 26)}
      <rect x="24" y="356" width="94" height="40" rx="3" class="tw-lab"/>
      <g transform="translate(24 360) scale(.627) translate(-950 -234)">
      ${[0, 1].map((k) => `<g transform="translate(${960 + k * 30} 244)"><rect width="22" height="38" rx="2" class="tw-rack"/>${[0, 1, 2, 3].map((r) => `<circle cx="6" cy="${7 + r * 9}" r="1.7" class="tw-led" style="--d:${((r + k * 2) % 5) * 0.33}s"/><circle cx="12" cy="${7 + r * 9}" r="1.7" class="tw-led" style="--d:${((r + k + 1) % 5) * 0.29}s"/>`).join('')}</g>`).join('')}
      <rect x="1022" y="244" width="68" height="34" rx="3" class="tw-screen"/>
      <g class="tw-bad"><rect x="1028" y="250" width="46" height="13" rx="4" class="tw-bubble"/><text x="1051" y="259.5" class="tw-mono tw-warn" text-anchor="middle">ignore rules</text></g>
      <g class="tw-shield"><path d="M1078 260 l9 3 v7 q0 7 -9 11 q-9 -4 -9 -11 v-7 z" fill="#22c55e"/><path d="M1074 270 l3 3 l5 -6" class="tw-tick"/></g>
      </g>
      <rect x="24" y="406" width="40" height="30" rx="2" class="tw-win"/><rect x="78" y="406" width="40" height="30" rx="2" class="tw-win"/>
      <rect x="54" y="446" width="34" height="38" rx="2" class="tw-door"/>
      <g class="tw-dish-g" transform="translate(44 300)">
        <rect x="-3" y="-16" width="6" height="16" class="tw-pole"/>
        <g class="tw-dish" transform="translate(0 -16)"><path d="M-22 -14 q22 22 44 0 z" class="tw-dishface"/><path d="M0 -6 l0 -16" class="tw-feed"/><circle cx="0" cy="-24" r="3" class="tw-led-on"/>
        <g class="tw-pings"><path d="M-10 -34 a14 14 0 0 1 20 0"/><path d="M-18 -42 a26 26 0 0 1 36 0" style="animation-delay:.4s"/></g></g>
      </g>
    </g>`)}

    <!-- 2025, JM Family Enterprises: one of its Southeast Toyota car haulers,
         backing up to the dealership with its hazards flashing. -->
    <g class="tw-truckdrive">
    ${hot('jm', `
    <g>
      <image href="assets/images/town/jm-truck.webp" x="${TK.x}" y="${TK.y.toFixed(2)}" width="${TK.w}" height="${TK.h.toFixed(2)}" preserveAspectRatio="none"/>
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
      ${showroom(462, 342, 100, 140, [{ f: 'car-red-front', cx: 512, w: 58 }])}

      <rect x="556" y="206" width="352" height="12" rx="3" class="tw-roofcap"/>
      <rect x="560" y="216" width="344" height="266" class="tw-facade tw-fo"/>
      <path d="M560 252 H904 M560 288 H904 M560 324 H904 M646 216 V350 M732 216 V350 M818 216 V350" class="tw-grid"/>
      <ellipse cx="660" cy="270" rx="80" ry="52" fill="url(#twBack)" class="tw-backlit"/><image href="assets/logos/opt/toyota-mark.webp" x="604" y="230" width="112" height="80" preserveAspectRatio="xMidYMid meet" class="tw-tlogo"/>
      <text x="886" y="334" class="tw-sommi" text-anchor="end">SOMMIVILLE</text>
      <rect x="652" y="350" width="244" height="132" class="tw-portal"/>
      ${showroom(658, 356, 232, 126, [{ f: 'car-bronze-front', cx: 702, w: 60 }, { f: 'car-white-front', cx: 846, w: 58 }])}
      <rect x="752" y="388" width="48" height="94" class="tw-pillar tw-fo"/>
      <image href="assets/logos/opt/toyota-emblem.webp" x="760" y="394" width="32" height="22" preserveAspectRatio="xMidYMid meet" class="tw-tlogo"/>
      <rect x="760" y="426" width="32" height="56" class="tw-doorglass"/><path d="M776 426 V482" class="tw-mullp"/>

      <rect x="904" y="284" width="234" height="12" rx="3" class="tw-roofcap"/>
      <rect x="904" y="294" width="230" height="188" class="tw-facade2 tw-fo"/>
      <text x="1019" y="322" class="tw-service" text-anchor="middle">SERVICE</text>
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
    <path d="M760 482 H792 L816 600 H736 Z" class="tw-walk"/>
    <path d="M914 482 H1124 L1150 600 H898 Z" class="tw-drive"/>
    ${bush(666, 510, .8)}${bush(714, 506, .85)}${bush(866, 508, .9)}
    ${[700, 852].map((x) => `<g transform="translate(${x} 560)" class="tw-lamppost"><circle cx="0" cy="-60" r="30" fill="url(#twLamp)" class="tw-lampglow"/><rect x="-2" y="-60" width="4" height="60" class="tw-pole"/><rect x="-7" y="-66" width="14" height="7" rx="3" class="tw-bulb"/></g>`).join('')}
    </g>

    ${hot('adt', `
    <!-- 2026, ADT: its sign in the hedge in front of the dealership's wall, and
         its camera up at the roofline looking down over it. -->
    <g transform="translate(${OFF.adt} 0)">
      <image href="assets/images/town/adt-sign.webp" x="584" y="430" width="48" height="78" preserveAspectRatio="xMidYMax meet"/>
      ${bush(612, 514, 1.05)}
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

    ${hot('edu', `
    <!-- University of Florida: a pond, a pennant, and a gator having a look. -->
    <g transform="translate(${OFF.edu} 0)">
      <ellipse cx="120" cy="548" rx="110" ry="28" class="tw-pond"/>
      <ellipse cx="44" cy="538" rx="18" ry="10" class="tw-rock"/><ellipse cx="214" cy="560" rx="14" ry="8" class="tw-rock"/><ellipse cx="160" cy="530" rx="12" ry="7" class="tw-rock"/>
      <g class="tw-ripples"><ellipse cx="108" cy="552" rx="20" ry="5"/><ellipse cx="108" cy="552" rx="20" ry="5" style="animation-delay:-1.6s"/></g>
      <g class="tw-gator" transform="translate(-10 26)">
        <path d="M86 530 q4 -14 18 -14 h30 q10 0 18 8 l10 6 z" class="tw-gator-b"/>
        <circle cx="102" cy="518" r="7" class="tw-gator-b"/><circle cx="118" cy="518" r="7" class="tw-gator-b"/>
        <circle cx="102" cy="517" r="3.6" fill="#fff"/><circle cx="118" cy="517" r="3.6" fill="#fff"/>
        <circle cx="103" cy="517" r="1.8" class="tw-pupil"/><circle cx="119" cy="517" r="1.8" class="tw-pupil"/>
        <rect x="97" y="511" width="26" height="6" class="tw-lid"/>
      </g>
      <rect x="186" y="498" width="3.4" height="58" class="tw-pole"/>
      <image href="assets/images/town/uf-pennant.webp" x="189" y="498" width="66" height="22" preserveAspectRatio="xMinYMid meet"/>
    </g>`)}

    ${hot('rjax', `
    <!-- 2019, Renaissance Jax: a competition robot in the logo's green, on its
         own patch of lawn. Its camera locks on the target, or on the pointer
         when it comes close, and it drives over for a look. -->
    <g>
      <g transform="translate(630 510)"><rect x="-1.6" y="0" width="3.2" height="40" class="tw-pole"/><image href="assets/logos/opt/renaissance-jax.webp" x="-17" y="-30" width="34" height="34" class="tw-rounded"/></g>
      <g transform="translate(754 520)"><rect x="-2" y="0" width="4" height="34" class="tw-pole"/><path d="M-12 -18 v14 h24 v-14 h-6 v8 h-12 v-8 z" class="tw-target"/></g>
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

    <!-- The visitor center, where everyone starts: the welcome sign, the
         center itself, a signpost, the exit to the classic site and the
         time machine. -->
    ${hot('vc', `
    <g>
      <rect x="2770" y="300" width="8" height="66" class="tw-pole"/><rect x="3022" y="300" width="8" height="66" class="tw-pole"/>
      <rect x="2730" y="230" width="340" height="80" rx="12" class="tw-welcome"/>
      <rect x="2739" y="239" width="322" height="62" rx="8" class="tw-welcome-in"/>
      <text x="2900" y="261" class="tw-wel-s" text-anchor="middle">WELCOME TO</text>
      <text x="2900" y="293" class="tw-wel-b" text-anchor="middle">SOMMIVILLE</text>
      <rect x="2756" y="362" width="288" height="12" rx="3" class="tw-roofcap"/>
      <rect x="2762" y="372" width="276" height="114" class="tw-vcwall tw-fo"/>
      <rect x="2772" y="382" width="256" height="24" rx="4" class="tw-jmband"/>
      <text x="2900" y="399" class="tw-vc-t" text-anchor="middle">VISITOR CENTER</text>
      <rect x="2774" y="418" width="90" height="54" rx="3" class="tw-win"/><rect x="2936" y="418" width="90" height="54" rx="3" class="tw-win"/>
      <rect x="2788" y="432" width="34" height="24" rx="2" class="tw-vcmap"/><path d="M2792 450 l8 -9 l7 6 l9 -10" class="tw-vcmap-l"/>
      <rect x="2952" y="440" width="58" height="10" rx="2" class="tw-desk"/>
      <rect x="2878" y="426" width="44" height="60" rx="2" class="tw-door"/>
      <circle cx="2900" cy="416" r="7" fill="#2b6fe0"/><text x="2900" y="419.6" class="tw-i" text-anchor="middle">i</text>
    </g>`)}
    <g class="tw-signpost">
      <rect x="2627" y="402" width="6" height="128" class="tw-pole"/>
      <path d="M2632 408 H2526 l-11 11 l11 11 H2632 Z" class="tw-dir"/><text x="2577" y="422.5" class="tw-dir-t" text-anchor="middle">WHERE I’VE WORKED</text>
      <path d="M2628 438 H2734 l11 11 l-11 11 H2628 Z" class="tw-dir"/><text x="2683" y="452.5" class="tw-dir-t" text-anchor="middle">WHAT I’VE BUILT</text>
    </g>
    <a href="classic.html" class="tw-exit" aria-label="Take the exit to the classic portfolio">
      <rect x="3112" y="412" width="6" height="126" class="tw-pole"/><rect x="3244" y="412" width="6" height="126" class="tw-pole"/>
      <rect x="3190" y="352" width="66" height="24" rx="4" class="tw-exit-b"/><text x="3223" y="368.5" class="tw-exit-n" text-anchor="middle">EXIT 1</text>
      <rect x="3096" y="372" width="170" height="66" rx="8" class="tw-exit-b"/>
      <rect x="3101" y="377" width="160" height="56" rx="5" class="tw-exit-ln"/>
      <text x="3112" y="400" class="tw-exit-t">Classic</text><text x="3112" y="423" class="tw-exit-t">Portfolio</text>
      <path d="M3222 424 l20 -22 m-13 -1 h13 v13" class="tw-exit-ar"/>
    </a>
    ${hot('tm', `
    <g>
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

    <!-- What I've built: placeholder lots for now (see PROJECTS). -->
    ${PROJECTS.map(lot).join('')}
    ${tree(2290, 482, 1.15, 2)}${tree(3500, 480, 1.05, 1)}${tree(5440, 482, 1.25, 0)}

    <!-- Snow, when it snows: it settles on the roofs and the ground (town.css). -->
    <g class="tw-snowy" aria-hidden="true">${[[242, 300, 118], [443.8, 200, 152.6], [1158, 324, 108], [1256, 206, 352], [1604, 284, 234], [2730, 230, 340], [2756, 362, 288], [3096, 372, 170], [3190, 352, 66], [3352, 350, 76], ...PROJECTS.map((p) => [p.x, 362, 170])].map(([x, y, w]) => `<rect x="${x - 1}" y="${y - 7}" width="${w + 2}" height="8.5" rx="4" class="tw-snowcap"/>`).join('')}</g>

    <!-- A pin on every stop. -->
    <g class="tw-pins">${roles.map((r) => { const at = SPOT[r.id].pin ? [SPOT[r.id].pin[0] + (OFF[r.id] || 0), SPOT[r.id].pin[1]] : null; return `<g class="tw-pin" data-id="${r.id}"${at ? ` transform="translate(${at[0]} ${at[1]})"` : ''} style="--tint:${r.tint}"><circle r="9" class="tw-pin-ring"/><circle r="4.4" class="tw-pin-dot"/></g>`; }).join('')}</g>
  </g>
</svg>`;

const work = roles.filter((r) => r.year).sort((a, b) => a.year - b.year || order.indexOf(a.id) - order.indexOf(b.id));
const data = {
  order: [...work.map((r) => r.id), 'vc', ...PROJECTS.map((p) => p.id)],
  W: WORLD, home: HOME,
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
  .replace(/<!-- town:start -->[\s\S]*?<!-- town:end -->/, '')
  .replace('<section id="path-circuit" class="section journey-section tw-retired" data-compact hidden>', '<section id="experience" class="section journey-section" data-compact>')
  .replace('<link rel="canonical" href="https://ajaysommi.github.io/" />', '<link rel="canonical" href="https://ajaysommi.github.io/classic.html" />');
if (!classic.includes('class="classic"') || classic.includes('town:start') || !classic.includes('<section id="experience" class="section journey-section"')) throw new Error('classic page did not build');
fs.writeFileSync(path.join(root, 'classic.html'), classic);
console.log('classic.html updated', classic.length);
