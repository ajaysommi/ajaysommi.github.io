/* Builds the desktop scene for the work history (the block between the
   "town:start" and "town:end" markers in index.html): one block of a small
   town where every place I've worked has a spot. A Toyota dealership in the
   middle, with Hunter's alignment rack in its service bay and the FICS lab
   on its roof; JM Family's offices next door; Shiva's billboard, the
   Renaissance Jax robot and the Robotics For All rover out on the lawn;
   ADT's sign and camera by the showroom; the UF pond.
   Facts come from retro/content.js; the stories here are told a little more
   plainly (see STORY).
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

const TINT = { rjax: '#1fd12a', shiva: '#2f7fb5', rfa: '#f2b705', fics: '#fa4616', toyota: '#eb0a1e', jm: '#00857c', hunter: '#d0202e', adt: '#1f6fd1', edu: '#0021a5' };
const LOGO = { rfa: ['roboticsforall', 'roboticsforall'], fics: ['fics', 'fics-light'], toyota: ['toyota', 'toyota-light'], jm: ['jm-family', 'jm-family-light'], hunter: ['hunter', 'hunter-light'], adt: ['adt', 'adt'], shiva: ['shiva', 'shiva'], rjax: ['renaissance-jax', 'renaissance-jax'] };

/* Each story, told plainly: what changed because of the work, then how. */
const STORY = {
  rjax: "Taught a competition robot to aim by itself. I wrote the camera code that spotted targets mid match, so it lined up its shots without the driver's help.",
  shiva: "Helped more families find robotics classes: search visits grew 20% in one summer after I reworked the academy's site around what parents were actually searching for.",
  rfa: "Saved volunteers hours every week. My scripts filed each family's sign up details and sent their confirmation emails automatically, so nobody had to copy them by hand.",
  fics: "Found weak spots in AI chatbots before bad actors could. I built tools that automatically tried to trick ChatGPT into misbehaving, and helped work out how to block those tricks.",
  toyota: "Caught bad tire packages before they became recalls: 20% fewer tire warranty claims and over $150k saved. I tracked tire readings from Hunter balancers (sent through HunterNet) across 51,000 vehicles and flagged any package over the limit. I also automated work that saved about 350 hours a year.",
  jm: "Made it easy to spot employees with access they shouldn't have, using an automated check across Microsoft Graph, Salesforce and MuleSoft. I also analysed 100k+ dealership events and helped set up GPT agents that answer questions about them.",
  hunter: "Made it possible to reset Hunter's alignment machines remotely instead of sending a technician, across 100,000+ machines worldwide. I designed and built the secure reset myself, and fixed crashes during machine setup.",
  adt: "Designed an AI check that catches false alarms before emergency responders are sent, and pitched it to senior leadership. I also kept ADT's Salesforce platform under its limits and got releases shipping again."
};

/* Where each stop is: the box the scene leans in to, and its pin. */
const SPOT = {
  shiva: { zoom: [26, 232, 250, 140], pin: [145, 240] },
  rjax: { zoom: null, pin: null },
  rfa: { zoom: null, pin: null },
  edu: { zoom: [10, 480, 260, 110], pin: [120, 520] },
  jm: { zoom: [262, 292, 200, 200], pin: [362, 316] },
  toyota: { zoom: [456, 200, 450, 290], pin: [640, 230] },
  hunter: { zoom: [902, 330, 236, 160], pin: [1020, 360] },
  fics: { zoom: [280, 196, 200, 120], pin: [410, 270] },
  adt: { zoom: [470, 380, 130, 150], pin: [525, 430] }
};
/* How the jobs lead into each other, for each card. */
const LINKS = [
  ['rjax', 'shiva', 'Robotics, from building one to helping a robotics academy grow.'],
  ['shiva', 'rfa', 'Robotics education: first finding families, then running their sign ups.'],
  ['rfa', 'fics', 'Automating manual work became automating AI testing.'],
  ['fics', 'edu', 'FICS is UF’s cybersecurity institute.'],
  ['fics', 'jm', 'Knowing how AI fails helped set up GPT agents at JM.'],
  ['fics', 'adt', 'From breaking AI to an AI check that catches false alarms.'],
  ['toyota', 'hunter', 'Toyota’s tire data came from Hunter machines, which I later built for.'],
  ['jm', 'toyota', 'JM Family is Southeast Toyota’s parent company.'],
  ['hunter', 'adt', 'Both about acting safely from afar.']
];

const roles = P.experience.map((e) => ({
  id: e.id, org: e.org, short: e.short, role: e.role, when: e.when, where: e.where, year: e.year,
  text: STORY[e.id] || e.text, stats: e.stats, tags: e.tags, photos: e.photos.map(big), logo: LOGO[e.id] || null, tint: TINT[e.id]
}));
const E = P.education;
roles.push({ id: 'edu', org: E.school, short: 'UF', role: `${E.degree}, ${E.college}`, when: E.when, where: 'Gainesville, FL', year: 2026, text: E.text, stats: [], tags: E.tags, photos: [], logo: null, gator: E.logo, tint: TINT.edu, school: true });
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
/* A showroom: amber light, spots shining down onto the cars, glass in front. */
const showroom = (x, y, w, h, cars) => {
  const spots = cars.map((c) => c.cx), fy = y + h - 8;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="tw-int"/>
      ${spots.map((cx, i) => `<polygon points="${cx - 10},${y} ${cx + 10},${y} ${cx + 44},${fy} ${cx - 44},${fy}" class="tw-spotcone" style="--i:${i}"/><rect x="${cx - 9}" y="${y}" width="18" height="4" rx="2" class="tw-lamp"/>`).join('')}
      <rect x="${x}" y="${fy}" width="${w}" height="8" class="tw-showfloor"/>
      ${spots.map((cx, i) => `<ellipse cx="${cx}" cy="${fy + 1}" rx="46" ry="6" class="tw-pool" style="--i:${i}"/>`).join('')}
      ${cars.map((c) => `<ellipse cx="${c.cx}" cy="${fy + 1.5}" rx="${c.w * 0.46}" ry="3.2" class="tw-carshadow"/>` + pic(c.f, c.cx - c.w / 2, fy + 3 - c.w * 0.72, c.w, c.w * 0.72, 'tw-showcar')).join('')}
      <rect x="${x}" y="${y}" width="${w}" height="${h}" class="tw-glassover"/>
      <path d="M${x + 14} ${y + 8} l-12 ${Math.round(h * 0.4)} M${x + w * 0.42} ${y + 8} l-22 ${Math.round(h * 0.7)}" class="tw-shine"/>`;
};

// Stars: scattered at random (the same random every build), each with its own size and slow breath.
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const STARS = Array.from({ length: 70 }, () => { const r = rnd(); return `<circle cx="${(rnd() * 1200).toFixed(1)}" cy="${(4 + rnd() * 250).toFixed(1)}" r="${(0.5 + r * r * 1.6).toFixed(2)}" style="--t:${(3 + rnd() * 6).toFixed(1)}s;--d:${(-rnd() * 9).toFixed(1)}s;--lo:${(0.15 + rnd() * 0.35).toFixed(2)}"/>`; }).join('');

const svg = `<svg class="tw-svg" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="A drawn town block. Each part of it is a place I've worked; the buttons below open the same stories.">
  <defs>
    <linearGradient id="twSkyDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fcbef"/><stop offset=".7" stop-color="#e9eef0"/><stop offset="1" stop-color="#f6ecd9"/></linearGradient>
    <linearGradient id="twSkyNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070a1a"/><stop offset=".55" stop-color="#14183a"/><stop offset="1" stop-color="#3a2b55"/></linearGradient>
    <linearGradient id="twBeam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff2b2b" stop-opacity=".9"/><stop offset="1" stop-color="#ff2b2b" stop-opacity=".15"/></linearGradient>
    <linearGradient id="twCone" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#7aa2ff" stop-opacity=".5"/><stop offset="1" stop-color="#7aa2ff" stop-opacity="0"/></linearGradient>
    <linearGradient id="twSpot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff7de" stop-opacity=".95"/><stop offset="1" stop-color="#fff7de" stop-opacity="0"/></linearGradient>
    <radialGradient id="twPool"><stop offset="0" stop-color="#fff6d8" stop-opacity=".95"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient>
    <radialGradient id="twHalo"><stop offset="0" stop-color="#ffd27a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
    <radialGradient id="twBack"><stop offset="0" stop-color="#fff2ec" stop-opacity=".95"/><stop offset=".55" stop-color="#ffd6cc" stop-opacity=".45"/><stop offset="1" stop-color="#ffd6cc" stop-opacity="0"/></radialGradient>
    <radialGradient id="twLamp"><stop offset="0" stop-color="#ffe2a0" stop-opacity=".5"/><stop offset="1" stop-color="#ffe2a0" stop-opacity="0"/></radialGradient>
    <linearGradient id="twAmber" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffcf86"/><stop offset="1" stop-color="#e8a24f"/></linearGradient>
    <linearGradient id="twDayInt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3ead8"/><stop offset="1" stop-color="#ddd0b6"/></linearGradient>
    ${Object.entries(TINT).map(([id, c]) => `<filter id="twGlow-${id}" x="-25%" y="-25%" width="150%" height="150%"><feMorphology in="SourceAlpha" operator="dilate" radius="2" result="d"/><feGaussianBlur in="d" stdDeviation="4" result="b"/><feFlood flood-color="${c}" flood-opacity=".95"/><feComposite in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`).join('')}
  </defs>

  <!-- Far: the sky, the hills, the clouds. -->
  <g class="tw-far" data-depth="4">
    <rect class="tw-sky-d" x="-200" y="-60" width="1600" height="600" fill="url(#twSkyDay)"/>
    <rect class="tw-sky-n" x="-200" y="-60" width="1600" height="600" fill="url(#twSkyNight)"/>
    <g class="tw-stars">${STARS}</g>
    <g class="tw-sun"><circle cx="1090" cy="86" r="70" fill="url(#twHalo)"/><circle cx="1090" cy="86" r="32" fill="#ffcf6b"/></g>
    <g class="tw-moon"><circle cx="1090" cy="80" r="30" fill="#f6eed6"/><circle cx="1106" cy="70" r="27" class="tw-moon-cut"/></g>
    <g class="tw-cloud" style="--dur:110s;--from:-20s"><g transform="translate(380 110)"><rect x="0" y="14" width="180" height="30" rx="15"/><circle cx="60" cy="16" r="28"/><circle cx="104" cy="8" r="36"/><circle cx="140" cy="22" r="20"/></g></g>
    <g class="tw-cloud" style="--dur:150s;--from:-90s"><g transform="translate(820 60)"><rect x="0" y="10" width="120" height="24" rx="12"/><circle cx="44" cy="12" r="20"/><circle cx="76" cy="6" r="24"/></g></g>
    <g class="tw-cloud" style="--dur:180s;--from:-150s"><g transform="translate(120 60)"><rect x="0" y="8" width="96" height="20" rx="10"/><circle cx="34" cy="10" r="16"/><circle cx="60" cy="6" r="19"/></g></g>
    <path class="tw-mtn2" d="M-200 400 L40 312 L150 362 L300 276 L440 352 L600 286 L740 346 L880 280 L1020 340 L1160 290 L1400 360 V480 H-200 Z"/>
    <path class="tw-mtn1" d="M-200 430 Q80 370 250 410 T590 400 T960 392 T1400 410 V480 H-200 Z"/>
  </g>

  <!-- Middle: the block. -->
  <g class="tw-mid" data-depth="9">
    <rect class="tw-grass" x="-200" y="470" width="1600" height="200"/>
    <g class="tw-backrow">${Array.from({ length: 16 }, (_, i) => bush(250 + i * 58, 486, 1.25 + (i % 3) * 0.15)).join('')}</g>
    ${tree(66, 476, 1.25, 0)}${tree(1166, 480, 1.1, 1)}

    ${hot('shiva', `
    <!-- 2020, Shiva Robotics Academy: a billboard, search traffic climbing. -->
    <g>
      <rect x="92" y="346" width="9" height="134" class="tw-pole"/><rect x="192" y="346" width="9" height="134" class="tw-pole"/>
      <rect x="40" y="244" width="212" height="106" rx="10" class="tw-board"/>
      <image href="assets/logos/opt/shiva.webp" x="52" y="256" width="82" height="82" preserveAspectRatio="xMidYMid meet" class="tw-rounded"/>
      <g class="tw-bars">${[16, 24, 34, 48].map((h, i) => `<rect x="${148 + i * 22}" y="${322 - h}" width="15" height="${h}" rx="3" style="--i:${i}"/>`).join('')}</g>
      <path d="M150 300 L226 262 m-14 -1 l14 1 l-3 13" class="tw-arrow"/>
      <text x="196" y="342" class="tw-plus" text-anchor="middle">+20%</text>
      <rect x="66" y="236" width="40" height="8" rx="3" class="tw-pole"/><rect x="186" y="236" width="40" height="8" rx="3" class="tw-pole"/>
    </g>`)}

    ${hot('jm', `
    <!-- 2025, JM Family Enterprises: the offices next door, dashboards in the windows. -->
    <g>
      <rect x="266" y="306" width="190" height="14" rx="3" class="tw-roofcap"/>
      <rect x="270" y="318" width="182" height="164" class="tw-jm"/>
      <rect x="278" y="326" width="166" height="40" rx="4" class="tw-jmband"/>
      <image href="assets/images/town/jm-tree.webp" x="336" y="328" width="46" height="36" preserveAspectRatio="xMidYMid meet"/>
      ${[0, 1, 2].map((i) => `<g transform="translate(${282 + i * 56} 378)"><rect width="48" height="62" rx="3" class="tw-win"/><rect x="8" y="24" width="32" height="20" rx="2" class="tw-screen"/>${[0, 1, 2, 3].map((b) => `<rect x="${12 + b * 7}" y="${40 - (3 + ((i + b) % 3) * 4)}" width="4" height="${3 + ((i + b) % 3) * 4}" class="tw-dash" style="--i:${i + b}"/>`).join('')}<rect x="18" y="44" width="12" height="10" class="tw-desk"/>${i === 1 ? '' : `<circle cx="${i ? 38 : 10}" cy="48" r="6" class="tw-plant"/>`}</g>`).join('')}
      <rect x="290" y="448" width="34" height="34" rx="2" class="tw-door"/>
    </g>`)}

    ${hot('toyota', `
    <!-- 2024, Toyota: the dealership. A showroom wing, the tall main block
         with the emblem and the store's name, a glass entrance with a pillar
         at its heart, and the service wing where Hunter's gear lives. -->
    <g>
      <rect x="458" y="324" width="108" height="10" rx="3" class="tw-roofcap"/>
      <rect x="462" y="332" width="100" height="10" class="tw-red"/>
      ${showroom(462, 342, 100, 140, [{ f: 'car-red-front', cx: 512, w: 58 }])}

      <rect x="556" y="206" width="352" height="12" rx="3" class="tw-roofcap"/>
      <rect x="560" y="216" width="344" height="266" class="tw-facade tw-fo"/>
      <path d="M560 252 H904 M560 288 H904 M560 324 H904 M646 216 V350 M732 216 V350 M818 216 V350" class="tw-grid"/>
      <ellipse cx="635" cy="270" rx="86" ry="56" fill="url(#twBack)" class="tw-backlit"/><image href="assets/logos/opt/toyota-mark.webp" x="574" y="226" width="122" height="88" preserveAspectRatio="xMidYMid meet" class="tw-tlogo"/>
      <text x="890" y="336" class="tw-sommi" text-anchor="end">SOMMIVILLE</text>
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
    <g>
      <image href="assets/images/town/hawkeye.webp" x="916" y="370" width="75.4" height="112" preserveAspectRatio="xMidYMax meet"/>
      <rect x="996" y="474" width="124" height="8" rx="2" class="tw-liftbase"/>
      <rect x="994" y="470" width="10" height="6" rx="1.5" class="tw-liftbase"/><rect x="1112" y="470" width="10" height="6" rx="1.5" class="tw-liftbase"/>
      <path class="tw-arm-b" d="M1004 474 L1110 466"/><path class="tw-arm-a" d="M1110 474 L1004 466"/>
      <circle class="tw-pivot" cx="1057" cy="470" r="3"/>
      <g class="tw-plat">
        <image href="assets/images/town/car-side.webp" x="994" y="404" width="124" height="53" preserveAspectRatio="xMidYMax meet" class="tw-car-img"/>
        ${[1020, 1093].map((x) => `<g transform="translate(${x} 442)"><rect x="-8" y="-8" width="16" height="16" rx="2" class="tw-tgt"/>${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<rect x="${-5.6 + c * 4}" y="${-5.6 + r * 4}" width="3.2" height="3.2" rx=".6" class="tw-tgt-sq"/>`).join('')).join('')}</g>`).join('')}
        <rect x="990" y="456" width="132" height="10" rx="2" class="tw-lift"/>
        <path d="M992 456 l6 -9 h7 l4 9 z" class="tw-chock"/><rect x="992" y="453" width="17" height="3" class="tw-chockband"/>
        <image href="assets/logos/opt/hunter.webp" x="1036" y="457.5" width="40" height="7" preserveAspectRatio="xMidYMid meet"/>
      </g>
      <polygon class="tw-laser" points="0,0 0,0 0,0"/><polygon class="tw-laser" points="0,0 0,0 0,0"/>
    </g>`)}

    ${hot('fics', `
    <!-- 2023, FICS at UF: a lab on JM Family's roof. Racks, a terminal
         catching prompts meant to break a chatbot, and a dish that turns to
         watch the sky. -->
    <g>
      <g transform="translate(-650 20)">
      <rect x="950" y="234" width="150" height="52" rx="4" class="tw-lab"/>
      <rect x="944" y="228" width="162" height="9" rx="3" class="tw-roofcap"/>
      ${[0, 1].map((k) => `<g transform="translate(${960 + k * 30} 244)"><rect width="22" height="38" rx="2" class="tw-rack"/>${[0, 1, 2, 3].map((r) => `<circle cx="6" cy="${7 + r * 9}" r="1.7" class="tw-led" style="--d:${((r + k * 2) % 5) * 0.33}s"/><circle cx="12" cy="${7 + r * 9}" r="1.7" class="tw-led" style="--d:${((r + k + 1) % 5) * 0.29}s"/>`).join('')}</g>`).join('')}
      <rect x="1022" y="244" width="68" height="34" rx="3" class="tw-screen"/>
      <g class="tw-bad"><rect x="1028" y="250" width="46" height="13" rx="4" class="tw-bubble"/><text x="1051" y="259.5" class="tw-mono tw-warn" text-anchor="middle">ignore rules</text></g>
      <g class="tw-shield"><path d="M1078 260 l9 3 v7 q0 7 -9 11 q-9 -4 -9 -11 v-7 z" fill="#22c55e"/><path d="M1074 270 l3 3 l5 -6" class="tw-tick"/></g>
      ${img('fics', 1046, 200, 56, 26)}
      <g class="tw-dish-g" transform="translate(986 228)">
        <rect x="-3" y="-16" width="6" height="16" class="tw-pole"/>
        <g class="tw-dish" transform="translate(0 -16)"><path d="M-22 -14 q22 22 44 0 z" class="tw-dishface"/><path d="M0 -6 l0 -16" class="tw-feed"/><circle cx="0" cy="-24" r="3" class="tw-led-on"/>
        <g class="tw-pings"><path d="M-10 -34 a14 14 0 0 1 20 0"/><path d="M-18 -42 a26 26 0 0 1 36 0" style="animation-delay:.4s"/></g></g>
      </g>
      </g>
    </g>`)}

    <!-- Front lawn: a walk to the door, a drive to the service bay, hedges. -->
    <path d="M760 482 H792 L816 600 H736 Z" class="tw-walk"/>
    <path d="M914 482 H1124 L1150 600 H898 Z" class="tw-drive"/>
    ${bush(604, 508, .9)}${bush(662, 510, .8)}${bush(714, 506, .85)}${bush(866, 508, .9)}
    ${[700, 852].map((x) => `<g transform="translate(${x} 560)" class="tw-lamppost"><circle cx="0" cy="-60" r="30" fill="url(#twLamp)" class="tw-lampglow"/><rect x="-2" y="-60" width="4" height="60" class="tw-pole"/><rect x="-7" y="-66" width="14" height="7" rx="3" class="tw-bulb"/></g>`).join('')}

    ${hot('adt', `
    <!-- 2026, ADT: its sign half hidden in the hedge by the showroom, and its
         camera on the wall just above it. -->
    <g>
      <image href="assets/images/town/adt-sign.webp" x="506" y="428" width="48" height="78" preserveAspectRatio="xMidYMax meet"/>
      ${bush(540, 510, 1.05)}
      <g class="tw-cctv" transform="translate(560 404)">
        <rect x="-10" y="-4" width="10" height="8" rx="1.5" class="tw-pole"/>
        <g transform="translate(-10 0)"><g class="tw-cctv-head" transform="rotate(-26)">
          <polygon points="-30,0 -150,-30 -150,30" fill="url(#twCone)" class="tw-cone tw-nohit" transform="scale(1 .55)"/>
          <rect x="-8" y="-2.5" width="9" height="5" rx="2" class="tw-pole"/>
          <rect x="-34" y="-7" width="28" height="14" rx="4" class="tw-camshell"/>
          <rect x="-39" y="-5" width="6" height="10" rx="2" fill="#1f6fd1"/>
          <circle cx="-12" cy="-3" r="1.8" class="tw-rec"/>
        </g></g>
      </g>
    </g>`)}

    ${hot('edu', `
    <!-- University of Florida: a pond, a pennant, and a gator having a look. -->
    <g>
      <ellipse cx="120" cy="548" rx="110" ry="28" class="tw-pond"/>
      <ellipse cx="44" cy="538" rx="18" ry="10" class="tw-rock"/><ellipse cx="196" cy="552" rx="16" ry="9" class="tw-rock"/><ellipse cx="160" cy="530" rx="12" ry="7" class="tw-rock"/>
      <g class="tw-ripples"><ellipse cx="108" cy="552" rx="20" ry="5"/><ellipse cx="108" cy="552" rx="20" ry="5" style="animation-delay:-1.6s"/></g>
      <g class="tw-gator" transform="translate(-10 26)">
        <path d="M86 530 q4 -14 18 -14 h30 q10 0 18 8 l10 6 z" class="tw-gator-b"/>
        <circle cx="102" cy="518" r="7" class="tw-gator-b"/><circle cx="118" cy="518" r="7" class="tw-gator-b"/>
        <circle cx="102" cy="517" r="3.6" fill="#fff"/><circle cx="118" cy="517" r="3.6" fill="#fff"/>
        <circle cx="103" cy="517" r="1.8" class="tw-pupil"/><circle cx="119" cy="517" r="1.8" class="tw-pupil"/>
        <rect x="97" y="511" width="26" height="6" class="tw-lid"/>
      </g>
      <rect x="182" y="486" width="3.4" height="62" class="tw-pole"/>
      <image href="assets/images/town/uf-pennant.webp" x="185" y="486" width="66" height="22" preserveAspectRatio="xMinYMid meet"/>
    </g>`)}

    ${hot('rjax', `
    <!-- 2019, Renaissance Jax: a competition robot in the logo's green, on its
         own patch of lawn. Its camera locks on the target, or on the pointer
         when it comes close, and it drives over for a look. -->
    <g>
      <g transform="translate(278 504)"><rect x="-1.6" y="0" width="3.2" height="40" class="tw-pole"/><image href="assets/logos/opt/renaissance-jax.webp" x="-17" y="-30" width="34" height="34" class="tw-rounded"/></g>
      <g transform="translate(424 520)"><rect x="-2" y="0" width="4" height="34" class="tw-pole"/><path d="M-12 -18 v14 h24 v-14 h-6 v8 h-12 v-8 z" class="tw-target"/></g>
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
    <g class="tw-rover" transform="translate(1150 556)"><g class="tw-rover-flip"><g class="tw-rover-hop"><g class="tw-rover-bob">
      <rect x="-1.6" y="-60" width="3.2" height="11" class="tw-pole"/><circle cx="0" cy="-62" r="3.6" class="tw-blink" fill="#ff5a3d"/>
      <rect x="-22" y="-50" width="44" height="31" rx="11" fill="#ffc928" class="tw-ol"/>
      <g class="tw-eyes"><rect x="-14" y="-43" width="11" height="12" rx="3.5" class="tw-eye"/><rect x="3" y="-43" width="11" height="12" rx="3.5" class="tw-eye"/></g>
      <g class="tw-eyes"><circle class="tw-pupil2 tw-follow" cx="-8.5" cy="-37" r="2.6"/><circle class="tw-pupil2 tw-follow" cx="8.5" cy="-37" r="2.6"/></g><path d="M-6 -24 q6 4 12 0" class="tw-smile"/>
      <rect x="-17" y="-19" width="34" height="22" rx="6" fill="#2b6fe0" class="tw-ol"/><rect x="-9" y="-15" width="18" height="9" rx="2" fill="#1b4fb4"/>
      <path d="M-17 -12 l-9 8" class="tw-arm"/><path d="M17 -12 l9 8" class="tw-arm tw-arm-r"/>
      <g class="tw-mail"><rect x="20" y="-14" width="20" height="14" rx="2" class="tw-paper"/><path d="M21 -13 l9 7 l9 -7" class="tw-fold"/></g>
      <circle cx="-10" cy="6" r="6.5" class="tw-tyre"/><circle cx="10" cy="6" r="6.5" class="tw-tyre"/>
    </g></g></g></g>`)}

    <!-- A pin on every stop. -->
    <g class="tw-pins">${roles.map((r) => { const at = SPOT[r.id].pin; return `<g class="tw-pin" data-id="${r.id}"${at ? ` transform="translate(${at[0]} ${at[1]})"` : ''} style="--tint:${r.tint}"><circle r="9" class="tw-pin-ring"/><circle r="4.4" class="tw-pin-dot"/></g>`; }).join('')}</g>
  </g>
</svg>`;

const sorted = [...roles].sort((a, b) => a.year - b.year || order.indexOf(a.id) - order.indexOf(b.id));
const chips = sorted.map((r) => `<button type="button" class="tw-chip" data-id="${r.id}" style="--tint:${r.tint}"><b>’${String(r.year).slice(2)}</b><span>${esc(r.school ? 'University of Florida' : r.short)}</span></button>`).join('');
const data = {
  order: sorted.map((r) => r.id),
  pin: Object.fromEntries(Object.entries(SPOT).map(([k, v]) => [k, v.pin])),
  links: LINKS,
  roles: Object.fromEntries(roles.map((r) => [r.id, { ...r, zoom: SPOT[r.id].zoom }]))
};

const html = `<!-- town:start -->
    <!-- THE BLOCK, on a wide screen: every place I've worked, on one drawn
         street. Built from retro/content.js by tools/build-town.js; edit
         that, not this. -->
    <section id="experience" class="section town-section">
      <div class="section-head"><h2>Around the block</h2></div>
      <p class="section-lede">Every place I’ve worked, on one block. Wander around and click anything to step inside.</p>
      <div class="tw" id="town" tabindex="-1">
        <div class="tw-stage">
          ${svg}
          <div class="tw-label" aria-hidden="true"></div>
          <aside class="tw-panel" aria-live="polite" hidden>
            <button type="button" class="tw-x" aria-label="Back to the whole block"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
            <div class="tw-panel-in"></div>
            <div class="tw-nav">
              <button type="button" class="tw-prev"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg><span></span></button>
              <button type="button" class="tw-next"><span></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            </div>
          </aside>
        </div>
        <div class="tw-chips" role="group" aria-label="Every stop, oldest first">${chips}</div>
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
