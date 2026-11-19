/* Builds the desktop scene for the work history (the block between the
   "town:start" and "town:end" markers in index.html): one block of a small
   town where every place I've worked has a spot. A Toyota dealership in the
   middle, with Hunter's alignment gear in its service bay and the FICS lab
   on its roof; JM Family's offices next door; Shiva's billboard, the
   Renaissance Jax robot and the Robotics For All rover out on the lawn;
   ADT's sign out front; the UF pond. Threads between them show how one job
   led into the next. Facts come from retro/content.js.
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

const TINT = { rjax: '#22c55e', shiva: '#2f7fb5', rfa: '#f2b705', fics: '#fa4616', toyota: '#eb0a1e', jm: '#00857c', hunter: '#d0202e', adt: '#1f6fd1', edu: '#0021a5' };
const LOGO = { rfa: ['roboticsforall', 'roboticsforall'], fics: ['fics', 'fics-light'], toyota: ['toyota-mark', 'toyota-mark'], jm: ['jm-family', 'jm-family-light'], hunter: ['hunter', 'hunter-light'], adt: ['adt', 'adt'], shiva: ['shiva', 'shiva'], rjax: ['renaissance-jax', 'renaissance-jax'] };
// The card for Southeast Toyota shows its own logo; the building wears Toyota's.
const CARD_LOGO = { ...LOGO, toyota: ['toyota', 'toyota-light'] };

/* Where each stop is: the box the scene leans in to, and its pin. */
const SPOT = {
  shiva: { zoom: [26, 232, 250, 140], pin: [145, 240] },
  rjax: { zoom: [270, 446, 230, 110], pin: [372, 488] },
  rfa: { zoom: null, pin: null },
  edu: { zoom: [14, 452, 260, 110], pin: [130, 496] },
  jm: { zoom: [258, 292, 210, 200], pin: [362, 316] },
  toyota: { zoom: [456, 176, 450, 316], pin: [826, 238] },
  hunter: { zoom: [890, 336, 236, 152], pin: [954, 352] },
  fics: { zoom: [930, 170, 200, 130], pin: [1024, 238] },
  adt: { zoom: [866, 440, 140, 120], pin: [920, 466] }
};
/* How the jobs lead into each other. Short words ride the thread on
   hover; the longer ones sit in each card. */
const LINKS = [
  ['rjax', 'shiva', 'Robotics', 'From building a competition robot to helping a robotics academy get found by the families looking for it.'],
  ['shiva', 'rfa', 'Robotics classes', 'Two robotics education groups: first getting families to the classes, then running the sign ups once they came.'],
  ['rfa', 'fics', 'Automation', 'The habit from Robotics For All (find the manual work and make it run itself) became tools that tested AI chatbots on their own.'],
  ['fics', 'edu', 'UF', 'FICS is the University of Florida’s cybersecurity institute: research alongside coursework.'],
  ['fics', 'jm', 'AI', 'What I learned about how AI fails went into setting up GPT agents at JM Family.'],
  ['fics', 'adt', 'AI safety', 'From finding how AI breaks to designing an AI check that catches false alarms at ADT.'],
  ['toyota', 'hunter', 'HunterNet', 'At Southeast Toyota I pulled Road Force readings from HunterNet, Hunter’s data service for its balancers. When a tire package’s road force variation passed the limit, Toyota had to issue a recall, so finding and reporting those was mine. Two years later I was at Hunter, building for the machines that took those readings.'],
  ['jm', 'toyota', 'Parent company', 'JM Family is the parent of Southeast Toyota. At JM I analysed events from the Toyota and JM Lexus dealership systems.'],
  ['hunter', 'adt', 'Remote reach', 'Both 2026: resetting machines safely from afar at Hunter, then deciding from afar whether an alarm is real at ADT.']
];

const roles = P.experience.map((e) => ({
  id: e.id, org: e.org, short: e.short, role: e.role, when: e.when, where: e.where, year: e.year,
  text: e.text, stats: e.stats, tags: e.tags, photos: e.photos.map(big), logo: CARD_LOGO[e.id] || null, tint: TINT[e.id]
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
const hot = (id, inner, cls = '') => `<g class="tw-hot ${cls}" data-id="${id}" style="--tint:${TINT[id]}">${inner}</g>`;
const tree = (x, y, s = 1, k = 0) => `<g class="tw-tree" transform="translate(${x} ${y}) scale(${s})"><path d="M-6 0 V-58 M0 -40 L18 -66 M-2 -48 L-22 -70" class="tw-trunk"/><g class="tw-canopy" style="--k:${k}"><circle cx="0" cy="-92" r="38" class="tw-leaf2"/><circle cx="-34" cy="-70" r="28" class="tw-leaf2"/><circle cx="32" cy="-68" r="30" class="tw-leaf2"/><circle cx="-6" cy="-100" r="30" class="tw-leaf"/><circle cx="-34" cy="-76" r="22" class="tw-leaf"/><circle cx="26" cy="-78" r="24" class="tw-leaf"/><circle cx="8" cy="-120" r="18" class="tw-leaf"/></g></g>`;
const bush = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="-16" cy="-8" r="13" class="tw-leaf2"/><circle cx="14" cy="-8" r="14" class="tw-leaf2"/><circle cx="0" cy="-15" r="16" class="tw-leaf"/><circle cx="-18" cy="-12" r="9" class="tw-leaf"/><circle cx="18" cy="-12" r="10" class="tw-leaf"/></g>`;
// A modern side-on car for the road, nose to the right, standing on y = 0.
const SIDE = `<g class="tw-ol">
    <path d="M-82 -12 Q-84 -27 -70 -31 L-46 -35 Q-28 -55 0 -57 Q30 -57 50 -38 L74 -33 Q86 -30 86 -16 V-8 H-82 Z" class="tw-paint"/>
    <path d="M-36 -37 Q-22 -51 -4 -53 V-37 Z M2 -53 Q24 -53 40 -37 H2 Z" class="tw-glass-c"/>
    <path d="M-1 -37 V-12 M-40 -24 H74" class="tw-trim"/>
    <path d="M70 -31 L86 -27" class="tw-headlamp"/><path d="M-82 -27 H-72" class="tw-tail"/>
    <circle cx="-50" cy="-8" r="15" class="tw-tyre"/><circle cx="52" cy="-8" r="15" class="tw-tyre"/><circle cx="-50" cy="-8" r="6.5" class="tw-hub"/><circle cx="52" cy="-8" r="6.5" class="tw-hub"/>
  </g>`;
const SUV = `<g class="tw-ol">
    <path d="M-82 -12 V-36 Q-82 -44 -72 -45 L-54 -47 L-40 -66 Q-37 -70 -30 -70 H44 Q52 -70 57 -62 L68 -47 Q84 -45 84 -32 V-12 Z" class="tw-paint"/>
    <path d="M-34 -50 L-25 -64 H4 V-50 Z M10 -64 H44 L54 -50 H10 Z" class="tw-glass-c"/>
    <path d="M7 -50 V-16 M-46 -28 H74" class="tw-trim"/>
    <path d="M70 -40 L84 -37" class="tw-headlamp"/><path d="M-82 -40 H-72" class="tw-tail"/>
    <circle cx="-50" cy="-8" r="16" class="tw-tyre"/><circle cx="52" cy="-8" r="16" class="tw-tyre"/><circle cx="-50" cy="-8" r="7" class="tw-hub"/><circle cx="52" cy="-8" r="7" class="tw-hub"/>
  </g>`;

const svg = `<svg class="tw-svg" viewBox="0 0 1200 640" preserveAspectRatio="xMidYMid slice" role="img" aria-label="A drawn town block. Each part of it is a place I've worked; the buttons below open the same stories.">
  <defs>
    <linearGradient id="twSkyDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fcbef"/><stop offset=".7" stop-color="#e9eef0"/><stop offset="1" stop-color="#f6ecd9"/></linearGradient>
    <linearGradient id="twSkyNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#151b3d"/><stop offset=".55" stop-color="#2d2f5e"/><stop offset="1" stop-color="#6a4a7a"/></linearGradient>
    <linearGradient id="twBeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff4d4d" stop-opacity=".85"/><stop offset="1" stop-color="#ff4d4d" stop-opacity="0"/></linearGradient>
    <linearGradient id="twCone" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#7aa2ff" stop-opacity=".5"/><stop offset="1" stop-color="#7aa2ff" stop-opacity="0"/></linearGradient>
    <radialGradient id="twHalo"><stop offset="0" stop-color="#ffd27a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
    <radialGradient id="twLamp"><stop offset="0" stop-color="#ffe2a0" stop-opacity=".5"/><stop offset="1" stop-color="#ffe2a0" stop-opacity="0"/></radialGradient>
    ${Object.entries(TINT).map(([id, c]) => `<filter id="twGlow-${id}" x="-25%" y="-25%" width="150%" height="150%"><feMorphology in="SourceAlpha" operator="dilate" radius="2" result="d"/><feGaussianBlur in="d" stdDeviation="4" result="b"/><feFlood flood-color="${c}" flood-opacity=".95"/><feComposite in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`).join('')}
    <g id="twSedan">${SIDE}</g><g id="twSuv">${SUV}</g>
  </defs>

  <!-- Far: the sky, the hills, the clouds. -->
  <g class="tw-far" data-depth="4">
    <rect class="tw-sky-d" x="-200" y="-60" width="1600" height="600" fill="url(#twSkyDay)"/>
    <rect class="tw-sky-n" x="-200" y="-60" width="1600" height="600" fill="url(#twSkyNight)"/>
    <g class="tw-stars">${Array.from({ length: 34 }, (_, i) => `<circle cx="${(i * 137) % 1200}" cy="${14 + ((i * 71) % 200)}" r="${i % 5 ? 1.1 : 1.8}" style="--d:${(i % 7) * 0.6}s"/>`).join('')}</g>
    <g class="tw-sun"><circle cx="1090" cy="86" r="70" fill="url(#twHalo)"/><circle cx="1090" cy="86" r="32" fill="#ffcf6b"/></g>
    <g class="tw-moon"><circle cx="1090" cy="80" r="30" fill="#f6eed6"/><circle cx="1106" cy="70" r="27" class="tw-moon-cut"/></g>
    <g class="tw-cloud" style="--dur:110s;--from:-20s"><g transform="translate(380 120)"><rect x="0" y="14" width="180" height="30" rx="15"/><circle cx="60" cy="16" r="28"/><circle cx="104" cy="8" r="36"/><circle cx="140" cy="22" r="20"/></g></g>
    <g class="tw-cloud" style="--dur:150s;--from:-90s"><g transform="translate(820 70)"><rect x="0" y="10" width="120" height="24" rx="12"/><circle cx="44" cy="12" r="20"/><circle cx="76" cy="6" r="24"/></g></g>
    <g class="tw-cloud" style="--dur:180s;--from:-150s"><g transform="translate(120 70)"><rect x="0" y="8" width="96" height="20" rx="10"/><circle cx="34" cy="10" r="16"/><circle cx="60" cy="6" r="19"/></g></g>
    <path class="tw-mtn2" d="M-200 400 L40 312 L150 362 L300 276 L440 352 L600 286 L740 346 L880 280 L1020 340 L1160 290 L1400 360 V480 H-200 Z"/>
    <path class="tw-mtn1" d="M-200 430 Q80 370 250 410 T590 400 T960 392 T1400 410 V480 H-200 Z"/>
  </g>

  <!-- Middle: the block. -->
  <g class="tw-mid" data-depth="9">
    <rect class="tw-grass" x="-200" y="470" width="1600" height="90"/>
    <g class="tw-backrow">${Array.from({ length: 16 }, (_, i) => bush(250 + i * 58, 486, 1.25 + (i % 3) * 0.15)).join('')}</g>
    ${tree(70, 476, 1.25, 0)}${tree(1162, 478, 1.15, 1)}${tree(1205, 486, 0.9, 2)}

    ${hot('shiva', `
    <!-- 2020, Shiva Robotics Academy: a billboard by the road, search traffic climbing. -->
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
      <rect x="268" y="306" width="190" height="14" rx="3" class="tw-roofcap"/>
      <rect x="272" y="318" width="182" height="164" class="tw-jm"/>
      <rect x="280" y="326" width="166" height="40" rx="4" class="tw-jmband"/>
      <image href="assets/logos/opt/jm-family-light.webp" x="290" y="329" width="146" height="34" preserveAspectRatio="xMidYMid meet"/>
      ${[0, 1, 2].map((i) => `<g transform="translate(${284 + i * 56} 378)"><rect width="48" height="62" rx="3" class="tw-win"/><rect x="8" y="24" width="32" height="20" rx="2" class="tw-screen"/>${[0, 1, 2, 3].map((b) => `<rect x="${12 + b * 7}" y="${40 - (3 + ((i + b) % 3) * 4)}" width="4" height="${3 + ((i + b) % 3) * 4}" class="tw-dash" style="--i:${i + b}"/>`).join('')}<rect x="18" y="44" width="12" height="10" class="tw-desk"/>${i === 1 ? '' : `<circle cx="${i ? 38 : 10}" cy="48" r="6" class="tw-plant"/>`}</g>`).join('')}
      <rect x="292" y="448" width="34" height="34" rx="2" class="tw-door"/>
    </g>`)}

    ${hot('toyota', `
    <!-- 2024, Toyota: the dealership. Showroom, the tall white tower with
         the emblem, and the service wing (where Hunter's gear lives). -->
    <g>
      <rect x="460" y="282" width="310" height="12" rx="3" class="tw-roofcap"/>
      <rect x="464" y="292" width="302" height="40" class="tw-facade"/>${[0, 1, 2, 3, 4].map((i) => `<path d="M${524 + i * 60} 292 V332" class="tw-seam"/>`).join('')}
      <rect x="464" y="330" width="302" height="9" class="tw-red"/>
      <rect x="464" y="339" width="302" height="143" class="tw-glass"/>
      <rect x="464" y="472" width="302" height="10" class="tw-showfloor"/>
      ${pic('car-bronze-front', 480, 386, 128, 92, 'tw-car-img')}${pic('car-red-front', 624, 392, 122, 86, 'tw-car-img')}
      <g transform="translate(612 472)"><rect x="-8" y="-14" width="16" height="14" rx="3" class="tw-pot"/><circle cx="0" cy="-26" r="12" class="tw-leaf"/><circle cx="-8" cy="-34" r="8" class="tw-leaf2"/><circle cx="8" cy="-36" r="9" class="tw-leaf"/></g>
      ${[514, 564, 614, 664, 714].map((x) => `<rect x="${x}" y="339" width="4" height="143" class="tw-mull"/>`).join('')}
      <path d="M484 350 l-18 60 M530 350 l-30 100 M690 350 l-24 80" class="tw-shine"/>

      <rect x="890" y="282" width="236" height="12" rx="3" class="tw-roofcap"/>
      <rect x="884" y="292" width="238" height="40" class="tw-facade"/>
      <text x="1003" y="321" class="tw-service" text-anchor="middle">SERVICE</text>
      <rect x="884" y="330" width="238" height="9" class="tw-red"/>
      <rect x="884" y="339" width="238" height="143" class="tw-facade2"/>
      <rect x="896" y="350" width="114" height="132" rx="3" class="tw-bay"/><rect x="1016" y="350" width="98" height="132" rx="3" class="tw-bay"/>
      <rect x="896" y="350" width="114" height="6" class="tw-baylight"/><rect x="1016" y="350" width="98" height="6" class="tw-baylight"/>

      <rect x="762" y="228" width="128" height="254" class="tw-tower"/>
      <image href="assets/logos/opt/toyota-mark.webp" x="776" y="244" width="100" height="80" preserveAspectRatio="xMidYMid meet"/>
      <rect x="762" y="330" width="128" height="9" class="tw-red"/>
      <rect x="772" y="394" width="108" height="10" rx="2" class="tw-red"/>
      <rect x="786" y="404" width="80" height="78" class="tw-glass"/><path d="M826 404 V482 M786 430 H866" class="tw-mullp"/>
      <rect x="818" y="440" width="3" height="18" rx="1.5" class="tw-handle"/><rect x="831" y="440" width="3" height="18" rx="1.5" class="tw-handle"/>
      ${[790, 816, 842, 868].map((x, i) => `<circle cx="${x}" cy="500" r="7" class="tw-bollard" style="--i:${i}"/>`).join('')}
    </g>`)}

    <!-- The Road Force card: HunterNet readings, read at Toyota. -->
    ${hot('toyota', `
    <g class="tw-rf">
      <rect x="584" y="184" width="162" height="78" rx="9" class="tw-card"/>
      <text x="596" y="202" class="tw-mono tw-card-k">HUNTERNET · ROAD FORCE</text>
      <path d="M596 236 H734" class="tw-limit"/><text x="734" y="232" class="tw-mono tw-card-s" text-anchor="end">limit</text>
      ${[14, 18, 12, 30, 16, 20, 13].map((h, i) => `<rect x="${600 + i * 19}" y="${252 - h}" width="11" height="${h}" rx="2" class="${h > 24 ? 'tw-rf-over' : 'tw-rf-ok'}" style="--i:${i}"/>`).join('')}
      <g class="tw-recall"><rect x="644" y="208" width="42" height="13" rx="3"/><text x="665" y="217.6" class="tw-mono" text-anchor="middle">RECALL</text></g>
    </g>`, 'tw-rf-hot')}

    ${hot('hunter', `
    <!-- 2026, Hunter Engineering: in Toyota's service bay. The alignment rig
         (its logo on the crossbar) reading a car's wheels, and a Road Force
         balancer, whose readings travel up the wire to HunterNet. -->
    <g>
      <rect x="906" y="462" width="94" height="9" rx="2" class="tw-lift"/><rect x="914" y="471" width="7" height="11" class="tw-pole"/><rect x="985" y="471" width="7" height="11" class="tw-pole"/>
      <rect x="950" y="362" width="7" height="36" class="tw-pole"/>
      <rect x="906" y="358" width="96" height="9" rx="3" class="tw-tbar"/>
      <rect x="922" y="342" width="64" height="17" rx="3" class="tw-plate"/><image href="assets/logos/opt/hunter.webp" x="925" y="344" width="58" height="13" preserveAspectRatio="xMidYMid meet" class="tw-hlogo"/>
      <rect x="900" y="364" width="14" height="10" rx="2" class="tw-cam"/><rect x="994" y="364" width="14" height="10" rx="2" class="tw-cam"/>
      <polygon points="907,374 912,374 926,452 912,452" fill="url(#twBeam)" class="tw-beam"/>
      <polygon points="1001,374 996,374 982,452 996,452" fill="url(#twBeam)" class="tw-beam" style="animation-delay:-.6s"/>
      <g class="tw-onlift">${pic('car-white-back', 910, 388, 88, 74, 'tw-car-img')}</g>
      <g transform="translate(1062 0)">
        <rect x="-36" y="420" width="56" height="54" rx="5" class="tw-balancer"/><rect x="-36" y="474" width="56" height="8" class="tw-pole"/>
        <rect x="-34" y="426" width="52" height="16" rx="2" class="tw-plate"/><image href="assets/logos/opt/hunter.webp" x="-31" y="428" width="46" height="12" preserveAspectRatio="xMidYMid meet" class="tw-hlogo"/>
        <g class="tw-wheel" transform="translate(-14 404)"><circle r="20" class="tw-tyre"/><circle r="10" class="tw-rim"/><path d="M0 -10 V10 M-10 0 H10" class="tw-spoke"/></g>
        <rect x="18" y="376" width="34" height="26" rx="3" class="tw-screen"/><path d="M22 392 q4 -8 8 0 t8 0 t8 0 t4 -2" class="tw-wave"/>
        <rect x="32" y="402" width="5" height="18" class="tw-pole"/>
        <g transform="translate(40 482)"><ellipse cx="0" cy="-8" rx="11" ry="5" class="tw-tyre"/><ellipse cx="0" cy="-18" rx="11" ry="5" class="tw-tyre"/><ellipse cx="0" cy="-28" rx="11" ry="5" class="tw-tyre"/></g>
      </g>
    </g>`)}

    <!-- The wire: Road Force readings from the balancer, up to HunterNet and into Toyota's card. -->
    <g class="tw-wire"><path d="M1096 380 V312 H898 V222 H746" class="tw-wire-bed"/><path d="M1096 380 V312 H898 V222 H746" class="tw-wire-p"/></g>

    ${hot('fics', `
    <!-- 2023, FICS at UF: a lab on the dealership's roof. Racks, a terminal
         catching prompts meant to break a chatbot, and a dish that turns to
         watch the sky. -->
    <g>
      <rect x="950" y="232" width="150" height="52" rx="4" class="tw-lab"/>
      <rect x="944" y="226" width="162" height="9" rx="3" class="tw-roofcap"/>
      ${[0, 1].map((k) => `<g transform="translate(${960 + k * 30} 242)"><rect width="22" height="38" rx="2" class="tw-rack"/>${[0, 1, 2, 3].map((r) => `<circle cx="6" cy="${7 + r * 9}" r="1.7" class="tw-led" style="--d:${((r + k * 2) % 5) * 0.33}s"/><circle cx="12" cy="${7 + r * 9}" r="1.7" class="tw-led" style="--d:${((r + k + 1) % 5) * 0.29}s"/>`).join('')}</g>`).join('')}
      <rect x="1022" y="242" width="68" height="34" rx="3" class="tw-screen"/>
      <g class="tw-bad"><rect x="1028" y="248" width="46" height="13" rx="4" class="tw-bubble"/><text x="1051" y="257.5" class="tw-mono tw-warn" text-anchor="middle">ignore rules</text></g>
      <g class="tw-shield"><path d="M1078 258 l9 3 v7 q0 7 -9 11 q-9 -4 -9 -11 v-7 z" fill="#22c55e"/><path d="M1074 268 l3 3 l5 -6" class="tw-tick"/></g>
      ${img('fics', 1052, 204, 48, 22)}
      <g class="tw-dish-g" transform="translate(986 226)">
        <rect x="-3" y="-16" width="6" height="16" class="tw-pole"/>
        <g class="tw-dish" transform="translate(0 -16)"><path d="M-22 -14 q22 22 44 0 z" class="tw-dishface"/><path d="M0 -6 l0 -16" class="tw-feed"/><circle cx="0" cy="-24" r="3" class="tw-led-on"/>
        <g class="tw-pings"><path d="M-10 -34 a14 14 0 0 1 20 0"/><path d="M-18 -42 a26 26 0 0 1 36 0" style="animation-delay:.4s"/></g></g>
      </g>
    </g>`)}

    <!-- Front lawn: a walk to the door, a drive to the service bays, hedges. -->
    <path d="M800 482 H852 L870 552 H782 Z" class="tw-walk"/>
    <rect x="884" y="482" width="238" height="70" class="tw-drive"/>
    ${bush(480, 494, .9)}${bush(560, 496, .8)}${bush(708, 494, .95)}${bush(452, 498, .7)}

    ${hot('adt', `
    <!-- 2026, ADT: the sign on the lawn, and the camera on the showroom's corner. -->
    <g>
      <g transform="translate(920 516)"><rect x="-2" y="-30" width="4" height="40" class="tw-pole"/>${img('adt', -22, -72, 44, 44)}<text x="0" y="-80" class="tw-mono tw-secured" text-anchor="middle">SECURED BY</text></g>
      <g class="tw-cctv" transform="translate(462 300)">
        <rect x="-12" y="-3" width="12" height="6" class="tw-pole"/>
        <g class="tw-cctv-head" transform="rotate(-24)"><g transform="translate(-12 0)">
          <polygon points="-18,0 -170,-40 -170,40" fill="url(#twCone)" class="tw-cone" transform="scale(1 .55)"/>
          <rect x="-26" y="-7" width="28" height="14" rx="4" class="tw-camshell"/>
          <rect x="-31" y="-5" width="6" height="10" rx="2" fill="#1f6fd1"/>
          <circle cx="-4" cy="-3" r="1.8" class="tw-rec"/>
        </g></g>
      </g>
    </g>`)}

    ${hot('edu', `
    <!-- University of Florida: a pond, a pennant, and a gator having a look. -->
    <g>
      <ellipse cx="130" cy="522" rx="112" ry="26" class="tw-pond"/>
      <ellipse cx="54" cy="512" rx="18" ry="10" class="tw-rock"/><ellipse cx="206" cy="526" rx="16" ry="9" class="tw-rock"/><ellipse cx="170" cy="506" rx="12" ry="7" class="tw-rock"/>
      <g class="tw-ripples"><ellipse cx="118" cy="526" rx="20" ry="5"/><ellipse cx="118" cy="526" rx="20" ry="5" style="animation-delay:-1.6s"/></g>
      <g class="tw-gator">
        <path d="M86 530 q4 -14 18 -14 h30 q10 0 18 8 l10 6 z" class="tw-gator-b"/>
        <circle cx="102" cy="518" r="7" class="tw-gator-b"/><circle cx="118" cy="518" r="7" class="tw-gator-b"/>
        <circle cx="102" cy="517" r="3.6" fill="#fff"/><circle cx="118" cy="517" r="3.6" fill="#fff"/>
        <circle cx="103" cy="517" r="1.8" class="tw-pupil"/><circle cx="119" cy="517" r="1.8" class="tw-pupil"/>
        <rect x="97" y="511" width="26" height="6" class="tw-lid"/>
      </g>
      <rect x="228" y="466" width="3.4" height="58" class="tw-pole"/>
      <path d="M231 468 l40 11 l-40 11 z" fill="#0021a5"/><path d="M231 479 l40 0 l-40 11 z" fill="#fa4616"/><text x="243" y="483" class="tw-uf">UF</text>
    </g>`)}

    ${hot('rjax', `
    <!-- 2019, Renaissance Jax: a competition robot on the lawn, locking on its target. -->
    <g>
      <g transform="translate(300 478)"><rect x="-1.6" y="0" width="3.2" height="40" class="tw-pole"/><image href="assets/logos/opt/renaissance-jax.webp" x="-17" y="-30" width="34" height="34" class="tw-rounded"/></g>
      <g transform="translate(470 500)"><rect x="-2" y="0" width="4" height="34" class="tw-pole"/><path d="M-12 -18 v14 h24 v-14 h-6 v8 h-12 v-8 z" class="tw-target"/></g>
      <g class="tw-reticle" transform="translate(470 490)"><path d="M-22 -16 v-8 h8 M14 -24 h8 v8 M22 16 v8 h-8 M-14 24 h-8 v-8"/></g>
      <path d="M402 512 L456 490" class="tw-vision"/>
      <g transform="translate(330 512)">
        <rect x="-4" y="16" width="80" height="13" rx="6" fill="#c8373c"/>
        <rect x="0" y="0" width="72" height="20" rx="4" fill="#22a052"/>
        <rect x="8" y="5" width="22" height="3" rx="1.5" class="tw-vent"/><rect x="8" y="11" width="22" height="3" rx="1.5" class="tw-vent"/>
        <circle cx="12" cy="32" r="6" class="tw-tyre"/><circle cx="60" cy="32" r="6" class="tw-tyre"/>
        <g class="tw-turret"><rect x="44" y="-14" width="6" height="16" class="tw-pole"/><rect x="40" y="-22" width="18" height="10" rx="3" class="tw-cam"/><circle cx="57" cy="-17" r="3.6" class="tw-ringlight"/></g>
      </g>
    </g>`)}

    ${hot('rfa', `
    <!-- 2022, Robotics For All: the rover, in the colours of its logo. It
         wanders the lawn, and follows the pointer when it's on the grass. -->
    <g class="tw-rover" transform="translate(600 538)"><g class="tw-rover-flip"><g class="tw-rover-bob">
      <rect x="-1.6" y="-60" width="3.2" height="11" class="tw-pole"/><circle cx="0" cy="-62" r="3.6" class="tw-blink" fill="#ff5a3d"/>
      <rect x="-22" y="-50" width="44" height="31" rx="11" fill="#ffc928" class="tw-ol"/>
      <rect x="-14" y="-43" width="11" height="12" rx="3.5" class="tw-eye"/><rect x="3" y="-43" width="11" height="12" rx="3.5" class="tw-eye"/>
      <circle class="tw-pupil2 tw-follow" cx="-8.5" cy="-37" r="2.6"/><circle class="tw-pupil2 tw-follow" cx="8.5" cy="-37" r="2.6"/>
      <rect x="-17" y="-19" width="34" height="22" rx="6" fill="#2b6fe0" class="tw-ol"/><rect x="-9" y="-15" width="18" height="9" rx="2" fill="#1b4fb4"/>
      <path d="M-17 -12 l-9 8 M17 -12 l9 8" class="tw-arm"/>
      <g class="tw-mail"><rect x="20" y="-14" width="20" height="14" rx="2" class="tw-paper"/><path d="M21 -13 l9 7 l9 -7" class="tw-fold"/></g>
      <circle cx="-10" cy="6" r="6.5" class="tw-tyre"/><circle cx="10" cy="6" r="6.5" class="tw-tyre"/>
    </g></g></g>`)}

    <!-- Lamps along the road. -->
    ${[330, 760, 1150].map((x) => `<g transform="translate(${x} 552)" class="tw-lamppost"><circle cx="12" cy="-58" r="34" fill="url(#twLamp)" class="tw-lampglow"/><rect x="-2" y="-62" width="4" height="62" class="tw-pole"/><rect x="-2" y="-64" width="20" height="4" rx="2" class="tw-pole"/><rect x="10" y="-62" width="12" height="5" rx="2" class="tw-bulb"/></g>`).join('')}

    <!-- The threads between jobs, drawn on hover. -->
    <g class="tw-links"></g>
    <!-- A pin on every stop. -->
    <g class="tw-pins">${roles.filter((r) => SPOT[r.id].pin).map((r) => { const [x, y] = SPOT[r.id].pin; return `<g class="tw-pin" data-id="${r.id}" transform="translate(${x} ${y})" style="--tint:${r.tint}"><circle r="9" class="tw-pin-ring"/><circle r="4.4" class="tw-pin-dot"/></g>`; }).join('')}<g class="tw-pin" data-id="rfa" style="--tint:${TINT.rfa}"><circle r="9" class="tw-pin-ring"/><circle r="4.4" class="tw-pin-dot"/></g></g>
  </g>

  <!-- Near: the road. Cars are placed by the script; the cone follows the pointer. -->
  <g class="tw-near" data-depth="14">
    <rect x="-200" y="552" width="1600" height="6" class="tw-curb"/>
    <rect x="-200" y="558" width="1600" height="70" class="tw-road"/>
    <g class="tw-dashes">${Array.from({ length: 30 }, (_, i) => `<rect x="${-180 + i * 56}" y="592" width="28" height="3" rx="1.5"/>`).join('')}</g>
    <g class="tw-traffic"></g>
    <g class="tw-cone-pt" opacity="0"><path d="M-10 0 L-3.5 -26 H3.5 L10 0 Z" fill="#ff7a1a"/><path d="M-7.4 -10 H7.4 M-5.4 -18 H5.4" stroke="#fff" stroke-width="3"/><rect x="-14" y="-3" width="28" height="5" rx="2" fill="#ff7a1a"/></g>
    <rect x="-200" y="628" width="1600" height="20" class="tw-grass"/>
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
         street, with threads showing how each led to the next. Built from
         retro/content.js by tools/build-town.js; edit that, not this. -->
    <section id="experience" class="section town-section">
      <div class="section-head"><h2>Around the block</h2></div>
      <p class="section-lede">Every place I’ve worked, on one street. Wander around, click anything to step inside, and mind the traffic.</p>
      <div class="tw" id="town" tabindex="-1">
        <div class="tw-stage">
          ${svg}
          <div class="tw-label" aria-hidden="true"></div>
          <aside class="tw-panel" aria-live="polite" hidden>
            <button type="button" class="tw-x" aria-label="Back to the whole street"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
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
if (!page.includes('href="town.css')) page = page.replace(/(<link rel="stylesheet" href="mobile\.css[^"]*" \/>)/, '$1\n  <link rel="stylesheet" href="town.css?v=1" />');
if (!page.includes('src="town.js')) page = page.replace(/(<script src="mobile\.js[^"]*" defer><\/script>)/, '$1\n  <script src="town.js?v=1" defer></script>');
fs.writeFileSync(f, page);
console.log('index.html updated', page.length);
