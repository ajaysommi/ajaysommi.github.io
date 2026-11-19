/* Builds the desktop "path" scene (the block between the "town:start" and
   "town:end" markers in index.html): one big shop, cut open like a doll's
   house, a room for every place I've worked. Upstairs runs left to right
   from the first job, downstairs runs back right to left, and a single
   thread runs through every room in order, so each job reads as the one
   that led to the next. Facts come from retro/content.js.
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

const TINT = { rjax: '#2fae5a', shiva: '#f39c12', rfa: '#e0a800', fics: '#fa4616', toyota: '#eb0a1e', jm: '#00857c', hunter: '#b5121b', adt: '#1f6fd1', edu: '#0021a5' };
const LOGO = { rfa: ['roboticsforall', 'roboticsforall'], fics: ['fics', 'fics-light'], toyota: ['toyota', 'toyota-light'], jm: ['jm-family', 'jm-family-light'], hunter: ['hunter', 'hunter-light'], adt: ['adt', 'adt'] };

/* The rooms: [x, y, w, h]. Upstairs y 152..338, downstairs y 366..572. */
const ROOM = {
  rjax: [54, 152, 264, 186], shiva: [332, 152, 264, 186], rfa: [610, 152, 264, 186], fics: [888, 152, 258, 186],
  toyota: [840, 366, 306, 206], jm: [530, 366, 296, 206], hunter: [190, 366, 326, 206], adt: [54, 366, 122, 206]
};
/* Where each stop sits on the thread. */
const NODE = { rjax: [186, 352], shiva: [464, 352], rfa: [742, 352], fics: [1017, 352], toyota: [993, 578], jm: [678, 578], hunter: [353, 578], adt: [115, 578] };
const PROP = { rjax: 'the robotics bench', shiva: 'the search desk', rfa: 'the sign up desk', fics: 'the server room', toyota: 'the Toyota showroom', jm: 'the Lexus showroom', hunter: 'the alignment bay', adt: 'the front door', edu: 'the pennant' };

const roles = P.experience.map((e) => ({
  id: e.id, org: e.org, short: e.short, role: e.role, when: e.when, where: e.where, year: e.year,
  text: e.text, stats: e.stats, tags: e.tags, photos: e.photos.map(big), logo: LOGO[e.id] || null, tint: TINT[e.id]
}));
const E = P.education;
roles.push({ id: 'edu', org: E.school, short: 'UF', role: `${E.degree}, ${E.college}`, when: E.when, where: 'Gainesville, FL', year: 2026, text: E.text, stats: [], tags: E.tags, photos: [], logo: null, gator: E.logo, tint: TINT.edu, school: true });
const order = roles.map((r) => r.id);
const zoomOf = (id) => { if (id === 'edu') id = 'fics'; const [x, y, w, h] = ROOM[id]; return [x - 10, y - 10, w + 20, h + 20]; };

/* ---------------------------------------------------------------- drawing */
const img = (id, x, y, w, h) => {
  const [d, l] = LOGO[id];
  const one = (f, c) => `<image class="${c}" href="assets/logos/opt/${f}.webp" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`;
  return d === l ? one(d, '') : one(d, 'tw-lg-d') + one(l, 'tw-lg-l');
};
const room = (id, inner) => {
  const [x, y, w, h] = ROOM[id];
  return `<g class="tw-room tw-hot" data-id="${id}" style="--tint:${TINT[id]}">
      <rect class="tw-back tw-back-${id}" x="${x}" y="${y}" width="${w}" height="${h}"/>
      <rect class="tw-floor" x="${x}" y="${y + h - 14}" width="${w}" height="14"/>
      ${inner}
      <rect class="tw-ring" x="${x + 3}" y="${y + 3}" width="${w - 6}" height="${h - 6}" rx="6"/>
    </g>`;
};
// Cars, front on: a Toyota crossover and a Lexus sedan. Drawn at the
// origin, standing on y = 0.
const FRONT_TOYOTA = `<g class="tw-o">
    <rect x="-80" y="-30" width="22" height="30" rx="6" class="tw-tyre"/><rect x="58" y="-30" width="22" height="30" rx="6" class="tw-tyre"/>
    <path d="M-60 -76 L-48 -112 Q-46 -118 -38 -118 H38 Q46 -118 48 -112 L60 -76 Z" class="tw-paint"/>
    <path d="M-50 -80 L-41 -108 H41 L50 -80 Z" class="tw-glass-c"/>
    <rect x="-74" y="-94" width="13" height="10" rx="4" class="tw-paint"/><rect x="61" y="-94" width="13" height="10" rx="4" class="tw-paint"/>
    <path d="M-86 -24 V-64 Q-86 -76 -74 -78 L74 -78 Q86 -76 86 -64 V-24 Q86 -14 76 -14 H-76 Q-86 -14 -86 -24 Z" class="tw-paint"/>
    <path d="M-80 -68 L-40 -64 L-44 -55 L-80 -57 Z M80 -68 L40 -64 L44 -55 L80 -57 Z" class="tw-lightlens"/>
    <rect x="-34" y="-68" width="68" height="10" rx="3" class="tw-grille"/>
    <ellipse cx="0" cy="-63" rx="9" ry="6" class="tw-badge"/><ellipse cx="0" cy="-63" rx="3.4" ry="6" class="tw-badge-in"/><ellipse cx="0" cy="-65" rx="8" ry="2.6" class="tw-badge-in"/>
    <path d="M-54 -50 H54 L46 -24 H-46 Z" class="tw-grille"/>
    <path d="M-50 -46 H50 M-48 -40 H48 M-46 -34 H46 M-44 -28 H44" class="tw-mesh"/>
    <rect x="-17" y="-44" width="34" height="10" rx="2" class="tw-plate"/>
    <rect x="-78" y="-38" width="14" height="6" rx="3" class="tw-fog"/><rect x="64" y="-38" width="14" height="6" rx="3" class="tw-fog"/>
  </g>`;
const FRONT_LEXUS = `<g class="tw-o">
    <rect x="-80" y="-26" width="22" height="26" rx="6" class="tw-tyre"/><rect x="58" y="-26" width="22" height="26" rx="6" class="tw-tyre"/>
    <path d="M-58 -62 L-44 -94 Q-42 -100 -34 -100 H34 Q42 -100 44 -94 L58 -62 Z" class="tw-paint"/>
    <path d="M-48 -66 L-37 -91 H37 L48 -66 Z" class="tw-glass-c"/>
    <rect x="-72" y="-78" width="13" height="9" rx="4" class="tw-paint"/><rect x="59" y="-78" width="13" height="9" rx="4" class="tw-paint"/>
    <path d="M-88 -22 V-52 Q-88 -63 -76 -64 L76 -64 Q88 -63 88 -52 V-22 Q88 -12 78 -12 H-78 Q-88 -12 -88 -22 Z" class="tw-paint"/>
    <path d="M-84 -57 L-36 -55 L-41 -49 L-80 -49 Z M84 -57 L36 -55 L41 -49 L80 -49 Z" class="tw-lightlens"/>
    <path d="M-80 -44 L-72 -34 L-58 -42 M80 -44 L72 -34 L58 -42" class="tw-drl"/>
    <path d="M-28 -60 H28 L16 -43 L38 -16 H-38 L-16 -43 Z" class="tw-grille"/>
    <path d="M-24 -55 L24 -55 M-19 -48 H19 M-22 -38 H22 M-30 -28 H30 M-35 -21 H35" class="tw-mesh"/>
    <ellipse cx="0" cy="-51" rx="9" ry="6" class="tw-badge"/><path d="M-3 -55 L-5 -47 H4" class="tw-badge-l"/>
  </g>`;
// Side on, for the lift and the road: a sedan, nose to the right.
const SIDE_SEDAN = `<g class="tw-o">
    <path d="M-80 -14 Q-82 -30 -66 -33 L-40 -36 Q-24 -56 4 -58 Q32 -58 50 -38 L72 -33 Q84 -30 84 -16 V-10 H-80 Z" class="tw-paint"/>
    <path d="M-33 -37 Q-20 -51 -2 -53 V-37 Z M3 -53 Q26 -53 41 -37 H3 Z" class="tw-glass-c"/>
    <path d="M-2 -37 V-14 M-36 -22 H70" class="tw-trim"/>
    <rect x="72" y="-30" width="11" height="6" rx="3" class="tw-lightlens"/><rect x="-80" y="-30" width="8" height="7" rx="3" class="tw-tail"/>
    <circle cx="-48" cy="-8" r="15" class="tw-tyre"/><circle cx="50" cy="-8" r="15" class="tw-tyre"/><circle cx="-48" cy="-8" r="6.5" class="tw-hub"/><circle cx="50" cy="-8" r="6.5" class="tw-hub"/>
  </g>`;

const svg = `<svg class="tw-svg" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid meet" role="img" aria-label="A drawn shop, cut open, a room for each place I've worked. The buttons below open the same stories.">
  <defs>
    <linearGradient id="twSkyDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bcd8f1"/><stop offset="1" stop-color="#efe9dd"/></linearGradient>
    <linearGradient id="twSkyNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#090d1a"/><stop offset="1" stop-color="#1c2032"/></linearGradient>
    <linearGradient id="twSpot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4d6" stop-opacity=".8"/><stop offset="1" stop-color="#fff4d6" stop-opacity="0"/></linearGradient>
    <linearGradient id="twBeam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#58e8ff" stop-opacity=".05"/><stop offset="1" stop-color="#58e8ff" stop-opacity=".85"/></linearGradient>
    <linearGradient id="twCone" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#6c95ff" stop-opacity=".5"/><stop offset="1" stop-color="#6c95ff" stop-opacity="0"/></linearGradient>
    <radialGradient id="twHalo"><stop offset="0" stop-color="#ffd27a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
    <pattern id="twPeg" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="1.4" class="tw-peg"/></pattern>
    <g id="twSedan">${SIDE_SEDAN}</g>
    <g id="twSuv"><g class="tw-o">
      <path d="M-80 -12 V-34 Q-80 -42 -70 -43 L-52 -45 L-38 -66 Q-35 -70 -28 -70 H44 Q52 -70 57 -62 L68 -45 Q82 -43 82 -32 V-12 Z" class="tw-paint"/>
      <path d="M-32 -48 L-23 -63 H4 V-48 Z M10 -63 H44 L54 -48 H10 Z" class="tw-glass-c"/>
      <path d="M7 -48 V-16 M-44 -26 H74" class="tw-trim"/>
      <rect x="70" y="-38" width="11" height="7" rx="3" class="tw-lightlens"/><rect x="-80" y="-40" width="8" height="10" rx="3" class="tw-tail"/>
      <circle cx="-48" cy="-8" r="16" class="tw-tyre"/><circle cx="50" cy="-8" r="16" class="tw-tyre"/><circle cx="-48" cy="-8" r="7" class="tw-hub"/><circle cx="50" cy="-8" r="7" class="tw-hub"/>
    </g></g>
  </defs>

  <!-- Sky. -->
  <g class="tw-far" data-depth="5">
    <rect class="tw-sky-d" x="-200" y="-100" width="1600" height="700" fill="url(#twSkyDay)"/>
    <rect class="tw-sky-n" x="-200" y="-100" width="1600" height="700" fill="url(#twSkyNight)"/>
    <g class="tw-stars">${Array.from({ length: 26 }, (_, i) => `<circle cx="${(i * 149) % 1200}" cy="${10 + ((i * 53) % 96)}" r="${i % 4 ? 1.1 : 1.7}" style="--d:${(i % 6) * 0.5}s"/>`).join('')}</g>
    <g class="tw-sun"><circle cx="1110" cy="58" r="64" fill="url(#twHalo)"/><circle cx="1110" cy="58" r="26" fill="#ffcf6b"/></g>
    <g class="tw-moon"><circle cx="1110" cy="58" r="22" fill="#f1ead6"/><circle cx="1121" cy="50" r="20" class="tw-moon-cut"/></g>
    <g class="tw-cloud" style="--dur:120s;--from:-30s"><g transform="translate(220 52)"><rect x="0" y="8" width="120" height="26" rx="13"/><circle cx="42" cy="10" r="20"/><circle cx="76" cy="6" r="24"/></g></g>
    <g class="tw-cloud" style="--dur:160s;--from:-110s"><g transform="translate(700 30)"><rect x="0" y="6" width="90" height="20" rx="10"/><circle cx="32" cy="8" r="15"/><circle cx="58" cy="5" r="18"/></g></g>
  </g>

  <g class="tw-mid" data-depth="10">
    <!-- The shop: a roof, two floors, a slab between them. -->
    <rect x="22" y="110" width="1156" height="30" rx="8" class="tw-roof tw-o"/>
    <rect x="130" y="88" width="64" height="24" rx="4" class="tw-unit tw-o"/><rect x="214" y="96" width="40" height="16" rx="4" class="tw-unit tw-o"/>
    <rect x="40" y="138" width="1120" height="446" class="tw-shell tw-o"/>

    ${room('rjax', `
      <!-- 2019, Renaissance Jax: a robotics bench; the robot finds its target by colour. -->
      <rect x="70" y="170" width="120" height="84" rx="6" fill="url(#twPeg)" class="tw-pegboard tw-o"/>
      <path d="M86 186 l14 14 m-4 -14 l-14 14" class="tw-tool"/><rect x="118" y="182" width="8" height="34" rx="3" class="tw-tool-f"/><circle cx="160" cy="198" r="11" class="tw-tool"/><path d="M146 232 h30" class="tw-tool"/>
      <g class="tw-target-g" transform="translate(286 204)"><path d="M-14 -16 v18 h28 v-18 h-8 v10 h-12 v-10 z" class="tw-target"/></g>
      <g class="tw-reticle" transform="translate(286 198)"><path d="M-24 -18 v-8 h8 M16 -26 h8 v8 M24 18 v8 h-8 M-16 26 h-8 v-8"/></g>
      <path d="M232 230 L272 204" class="tw-vision"/>
      <rect x="64" y="292" width="244" height="12" rx="3" class="tw-bench tw-o"/><rect x="76" y="304" width="10" height="20" class="tw-leg"/><rect x="286" y="304" width="10" height="20" class="tw-leg"/>
      <g transform="translate(80 252)"><rect x="0" y="0" width="56" height="38" rx="4" class="tw-laptop tw-o"/><path d="M8 10 h20 M8 18 h32 M14 26 h22" class="tw-code"/><rect x="-6" y="38" width="68" height="4" rx="2" class="tw-laptop tw-o"/></g>
      <g class="tw-frc" transform="translate(160 252)">
        <rect x="0" y="10" width="78" height="22" rx="5" fill="#2fae5a" class="tw-o"/>
        <rect x="-4" y="26" width="86" height="14" rx="7" fill="#c8373c" class="tw-o"/>
        <rect x="10" y="15" width="26" height="3.4" rx="1.7" class="tw-vent"/><rect x="10" y="21" width="26" height="3.4" rx="1.7" class="tw-vent"/>
        <g class="tw-turret"><rect x="58" y="-12" width="7" height="24" class="tw-leg"/><rect x="52" y="-24" width="22" height="14" rx="4" class="tw-cam tw-o"/><circle cx="72" cy="-17" r="4.6" class="tw-ring-light"/></g>
      </g>`)}

    ${room('shiva', `
      <!-- 2020, Shiva Robotics Academy: a search desk, the academy climbing to the top. -->
      <rect x="348" y="172" width="44" height="58" rx="4" class="tw-cork tw-o"/>
      <rect x="354" y="178" width="14" height="14" class="tw-note" style="fill:#ffd966"/><rect x="372" y="182" width="14" height="14" class="tw-note" style="fill:#9fd3ff"/><rect x="356" y="200" width="14" height="14" class="tw-note" style="fill:#ffb0a0"/><rect x="372" y="208" width="14" height="14" class="tw-note" style="fill:#c6f0a8"/>
      <rect x="404" y="176" width="176" height="104" rx="8" class="tw-monitor tw-o"/>
      <rect x="412" y="184" width="160" height="88" rx="4" class="tw-screen-l"/>
      <rect x="420" y="191" width="144" height="15" rx="7.5" class="tw-searchbar"/><circle cx="430" cy="198.5" r="3.6" class="tw-mag"/>
      <text x="438" y="202" class="tw-mono tw-type">robotics classes near me</text>
      <g class="tw-results"><rect x="420" y="214" width="144" height="14" rx="3" class="tw-top"/><text x="426" y="224" class="tw-mono tw-rank">#1</text><rect x="442" y="219" width="70" height="4" rx="2" class="tw-line-a"/>
      <rect x="420" y="233" width="100" height="4" rx="2" class="tw-line"/><rect x="420" y="242" width="80" height="4" rx="2" class="tw-line"/></g>
      <g class="tw-bars">${[8, 12, 17, 23].map((h, i) => `<rect x="${528 + i * 9}" y="${266 - h}" width="6" height="${h}" rx="1.5" style="--i:${i}"/>`).join('')}</g>
      <text x="454" y="265" class="tw-up">+20%</text>
      <rect x="484" y="280" width="16" height="12" class="tw-leg"/>
      <rect x="352" y="292" width="232" height="12" rx="3" class="tw-bench tw-o"/><rect x="364" y="304" width="10" height="20" class="tw-leg"/><rect x="562" y="304" width="10" height="20" class="tw-leg"/>`)}

    ${room('rfa', `
      <!-- 2022, Robotics For All: the sign up desk; forms file themselves, the robot posts the replies. -->
      <rect x="770" y="172" width="92" height="74" rx="6" class="tw-monitor tw-o"/><rect x="776" y="178" width="80" height="62" rx="3" class="tw-screen-l"/>
      ${[0, 1, 2, 3, 4].map((r) => `<rect x="782" y="${184 + r * 11}" width="68" height="7" rx="1.5" class="tw-cell" style="--i:${r}"/>`).join('')}
      <rect x="624" y="262" width="128" height="62" rx="5" class="tw-counter tw-o"/><rect x="618" y="256" width="140" height="10" rx="3" class="tw-bench tw-o"/>
      <g transform="translate(646 228)"><rect width="34" height="28" rx="4" class="tw-tablet tw-o"/><rect x="5" y="6" width="24" height="3" rx="1.5" class="tw-line"/><rect x="5" y="12" width="18" height="3" rx="1.5" class="tw-line"/><rect x="5" y="18" width="12" height="5" rx="2" class="tw-go"/></g>
      <g class="tw-form"><rect x="690" y="236" width="18" height="22" rx="2" class="tw-paper tw-o"/></g>
      <g transform="translate(842 290)"><rect x="-4" y="0" width="8" height="34" class="tw-leg"/><rect x="-18" y="-26" width="36" height="28" rx="6" fill="#2d6cdf" class="tw-o"/><rect x="-10" y="-14" width="20" height="4" rx="2" fill="#123a8a"/></g>
      <g class="tw-rover"><g transform="translate(704 328)">
        <rect x="-1.6" y="-56" width="3.2" height="10" class="tw-leg"/><circle cx="0" cy="-58" r="3.4" class="tw-blink" fill="#ff5a3d"/>
        <rect x="-22" y="-48" width="44" height="30" rx="10" fill="#f6c431" class="tw-o"/>
        <rect x="-14" y="-41" width="11" height="12" rx="3.5" class="tw-eye"/><rect x="3" y="-41" width="11" height="12" rx="3.5" class="tw-eye"/>
        <circle class="tw-pupil tw-follow" cx="-8.5" cy="-35" r="2.6"/><circle class="tw-pupil tw-follow" cx="8.5" cy="-35" r="2.6"/>
        <rect x="-17" y="-18" width="34" height="22" rx="5" fill="#2d6cdf" class="tw-o"/>
        <g class="tw-mail"><rect x="14" y="-30" width="22" height="15" rx="2" class="tw-paper tw-o"/><path d="M15 -29 l10 8 l10 -8" class="tw-fold"/></g>
        <circle cx="-9" cy="6" r="6" class="tw-tyre"/><circle cx="9" cy="6" r="6" class="tw-tyre"/>
      </g></g>`)}

    ${room('fics', `
      <!-- 2023, FICS at UF: the server room, catching the prompts meant to break a chatbot. -->
      ${[904, 968].map((x, k) => `<rect x="${x}" y="184" width="56" height="140" rx="5" class="tw-rack tw-o"/>${[0, 1, 2, 3, 4, 5, 6].map((r) => `<rect x="${x + 6}" y="${192 + r * 18}" width="44" height="12" rx="2" class="tw-unit-s"/>${[0, 1, 2].map((c) => `<circle cx="${x + 13 + c * 7}" cy="${198 + r * 18}" r="1.9" class="tw-led" style="--d:${((r * 3 + c + k * 2) % 6) * 0.31}s"/>`).join('')}`).join('')}`).join('')}
      <text x="960" y="180" class="tw-mono tw-tiny" text-anchor="middle">HiPerGator</text>
      <rect x="1040" y="236" width="96" height="66" rx="6" class="tw-monitor tw-o"/><rect x="1046" y="242" width="84" height="54" rx="3" class="tw-screen-d"/>
      <g class="tw-bad"><rect x="1052" y="250" width="62" height="18" rx="6" class="tw-bubble"/><text x="1083" y="262.5" class="tw-mono tw-warn" text-anchor="middle">ignore rules</text></g>
      <g class="tw-shield"><path d="M1110 268 l12 4 v9 q0 10 -12 15 q-12 -5 -12 -15 v-9 z" fill="#2fae5a"/><path d="M1105 281 l4 4 l7 -8" class="tw-tick"/></g>
      <rect x="1080" y="302" width="14" height="10" class="tw-leg"/><rect x="1034" y="312" width="108" height="10" rx="3" class="tw-bench tw-o"/>`)}

    <!-- The pennant: University of Florida, hung in the server room. -->
    <g class="tw-hot tw-pennant" data-id="edu" style="--tint:#0021a5"><rect x="1040" y="168" width="3" height="54" class="tw-leg"/><path d="M1043 170 L1112 184 L1043 198 Z" fill="#0021a5" class="tw-o"/><path d="M1043 198 L1112 184 L1043 212 Z" fill="#fa4616" class="tw-o"/><text x="1060" y="190" class="tw-uf">UF</text></g>

    <!-- Downstairs. -->
    ${room('toyota', `
      <!-- 2024, Southeast Toyota: the showroom, a crossover on the turntable, tyres on display. -->
      <rect x="850" y="378" width="286" height="30" rx="5" class="tw-signband tw-o"/>
      <image href="assets/logos/opt/toyota.webp" x="904" y="382" width="178" height="22" preserveAspectRatio="xMidYMid meet"/>
      <polygon points="930,408 900,558 1010,558 980,408" fill="url(#twSpot)" class="tw-spotlight"/>
      <ellipse cx="970" cy="560" rx="104" ry="8" class="tw-turn"/>
      <g class="tw-show" transform="translate(970 560)"><g class="tw-car-toyota">${FRONT_TOYOTA}</g></g>
      <g transform="translate(1106 558)">${[0, 1, 2].map((i) => `<ellipse cx="0" cy="${-8 - i * 15}" rx="24" ry="9" class="tw-tyre tw-o"/>`).join('')}<ellipse cx="0" cy="-38" rx="9" ry="3.4" class="tw-hub"/></g>`)}

    ${room('jm', `
      <!-- 2025, JM Family: the Lexus side of the house, and the data behind the whole floor. -->
      <rect x="544" y="378" width="160" height="30" rx="5" class="tw-signband tw-o"/>
      <image href="assets/logos/opt/jm-lexus.webp" x="554" y="384" width="140" height="18" preserveAspectRatio="xMidYMid meet" class="tw-lexus-mark"/>
      <rect x="718" y="378" width="96" height="60" rx="6" class="tw-plaque tw-o"/>${img('jm', 724, 382, 84, 52)}
      <rect x="718" y="448" width="96" height="76" rx="6" class="tw-monitor tw-o"/><rect x="723" y="453" width="86" height="66" rx="3" class="tw-screen-d"/>
      ${[0, 1, 2, 3, 4].map((r) => `<g class="tw-check" style="--i:${r}"><rect x="729" y="${459 + r * 12}" width="52" height="7" rx="2" class="tw-row"/><text x="789" y="${465.5 + r * 12}" class="tw-mono tw-mark ${r === 2 ? 'tw-bad-x' : 'tw-ok'}">${r === 2 ? '✕' : '✓'}</text></g>`).join('')}
      <polygon points="610,408 580,558 690,558 660,408" fill="url(#twSpot)" class="tw-spotlight" style="animation-delay:-2.5s"/>
      <ellipse cx="634" cy="560" rx="100" ry="8" class="tw-turn"/>
      <g class="tw-show" transform="translate(634 560)"><g class="tw-car-lexus">${FRONT_LEXUS}</g></g>`)}

    ${room('hunter', `
      <!-- 2026, Hunter Engineering: the service bay. A Toyota from the showroom on the
           alignment lift, the rig reading its wheels, the reset going out over the air. -->
      <rect x="204" y="378" width="190" height="30" rx="5" class="tw-signband tw-o"/>
      <image href="assets/logos/opt/hunter.webp" x="218" y="382" width="162" height="22" preserveAspectRatio="xMidYMid meet"/>
      <rect x="204" y="414" width="32" height="96" rx="4" class="tw-console tw-o"/><rect x="209" y="420" width="22" height="16" rx="2" class="tw-screen-d"/><path d="M220 414 v-14" class="tw-antenna"/><circle cx="220" cy="398" r="3" class="tw-led-on"/>
      <g class="tw-waves" transform="translate(220 396)"><path d="M10 -6 a12 12 0 0 1 0 12" /><path d="M18 -12 a22 22 0 0 1 0 24" style="animation-delay:.4s"/><path d="M26 -18 a32 32 0 0 1 0 36" style="animation-delay:.8s"/></g>
      <g class="tw-lift">
        <g transform="translate(350 522)"><g class="tw-car-side">${SIDE_SEDAN}</g></g>
        <rect x="294" y="502" width="16" height="16" rx="3" class="tw-clamp tw-o"/><rect x="392" y="502" width="16" height="16" rx="3" class="tw-clamp tw-o"/>
        <rect x="252" y="528" width="200" height="10" rx="3" fill="#c8302f" class="tw-o"/>
      </g>
      <rect x="262" y="538" width="10" height="34" class="tw-leg"/><rect x="432" y="538" width="10" height="34" class="tw-leg"/>
      <g transform="translate(486 420)"><rect x="-4" y="0" width="8" height="152" class="tw-leg"/><rect x="-22" y="0" width="44" height="7" rx="3" class="tw-leg"/><rect x="-26" y="-10" width="16" height="14" rx="3" class="tw-cam tw-o"/><rect x="10" y="-10" width="16" height="14" rx="3" class="tw-cam tw-o"/></g>
      <polygon points="466,416 302,504 302,516" fill="url(#twBeam)" class="tw-beam"/>
      <polygon points="502,416 400,504 400,516" fill="url(#twBeam)" class="tw-beam" style="animation-delay:-.7s"/>`)}

    ${room('adt', `
      <!-- 2026, ADT: the front door, the panel beside it, the sign above it. -->
      <rect x="66" y="378" width="98" height="38" rx="5" class="tw-signband tw-o"/>${img('adt', 98, 381, 34, 32)}
      <rect x="70" y="426" width="70" height="146" rx="3" class="tw-door tw-o"/><rect x="78" y="434" width="54" height="128" rx="2" class="tw-door-glass"/>
      <path d="M86 440 l-8 40 M104 440 l-16 70" class="tw-shine"/>
      <rect x="128" y="498" width="4" height="22" rx="2" class="tw-leg"/>
      <rect x="148" y="460" width="20" height="30" rx="4" class="tw-keypad tw-o"/><rect x="151" y="464" width="14" height="7" rx="1.5" class="tw-screen-d"/><circle cx="158" cy="481" r="2.2" class="tw-armed"/>`)}

    <!-- The camera on the corner, outside, watching the street (and the pointer). -->
    <g class="tw-cctv" transform="translate(40 392)">
      <rect x="-14" y="-3" width="14" height="6" class="tw-leg"/>
      <g class="tw-cctv-head" transform="rotate(-24)"><g transform="translate(-14 0)">
        <polygon points="-20,0 -200,-46 -200,46" fill="url(#twCone)" class="tw-cone" transform="scale(1 .55)"/>
        <rect x="-30" y="-8" width="32" height="16" rx="5" class="tw-camshell tw-o"/>
        <rect x="-35" y="-6" width="7" height="12" rx="2" fill="#1f6fd1"/>
        <circle cx="-5" cy="-3" r="2" class="tw-rec"/>
      </g></g>
    </g>

  </g>

  <!-- The street. Cars are placed by the script; the cone follows the pointer. -->
  <g class="tw-near" data-depth="16">
    <rect x="-200" y="584" width="1600" height="24" class="tw-walk"/>
    <rect x="-200" y="606" width="1600" height="6" class="tw-curb"/>
    <rect x="-200" y="612" width="1600" height="100" class="tw-road"/>
    <g class="tw-dashes">${Array.from({ length: 30 }, (_, i) => `<rect x="${-180 + i * 56}" y="653" width="28" height="3" rx="1.5"/>`).join('')}</g>
    <g class="tw-traffic"></g>
    <g class="tw-cone-pt" opacity="0"><path d="M-12 0 L-4 -30 H4 L12 0 Z" fill="#ff7a1a" class="tw-o"/><path d="M-8.6 -12 H8.6 M-6.4 -21 H6.4" stroke="#fff" stroke-width="3.4"/><rect x="-16" y="-3" width="32" height="5" rx="2" fill="#ff7a1a" class="tw-o"/></g>
  </g>

  <g class="tw-mid" data-depth="10">
    <!-- The thread: every job, in order, running through the house. -->
    <path class="tw-thread-bed" d="M120 352 H1153 V578 H96"/>
    <path class="tw-thread" d="M120 352 H1153 V578 H96"/>
    <g class="tw-nodes">${['rjax', 'shiva', 'rfa', 'fics', 'toyota', 'jm', 'hunter', 'adt'].map((id) => { const [x, y] = NODE[id]; const r = roles.find((q) => q.id === id); return `<g class="tw-node tw-hot" data-id="${id}" transform="translate(${x} ${y})" style="--tint:${TINT[id]}"><circle r="17" class="tw-node-c"/><text y="5" class="tw-node-t" text-anchor="middle">’${String(r.year).slice(2)}</text></g>`; }).join('')}</g>
  </g>
</svg>`;

const sorted = [...roles].sort((a, b) => a.year - b.year || order.indexOf(a.id) - order.indexOf(b.id));
const chips = sorted.map((r) => `<button type="button" class="tw-chip" data-id="${r.id}" style="--tint:${r.tint}"><b>’${String(r.year).slice(2)}</b><span>${esc(r.school ? 'University of Florida' : r.short)}</span></button>`).join('');
const data = { order: sorted.map((r) => r.id), node: NODE, roles: Object.fromEntries(roles.map((r) => [r.id, { ...r, zoom: zoomOf(r.id), prop: PROP[r.id] }])) };

const html = `<!-- town:start -->
    <!-- THE PATH, on a wide screen: one shop, cut open, a room for every
         place I've worked, and a thread through them in order. Built from
         retro/content.js by tools/build-town.js; edit that, not this. -->
    <section id="experience" class="section town-section">
      <div class="section-head"><h2>The path so far</h2></div>
      <p class="section-lede">One shop, a room for every place I’ve worked, the thread running through them in order. Click a room to step inside.</p>
      <div class="tw" id="town" tabindex="-1">
        <div class="tw-stage">
          ${svg}
          <div class="tw-label" aria-hidden="true"></div>
          <aside class="tw-panel" aria-live="polite" hidden>
            <button type="button" class="tw-x" aria-label="Back to the whole shop"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
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
