/* Builds the desktop "path" scene (the block between the "town:start" and
   "town:end" markers in index.html): every place I've worked, drawn as one
   flat, moving dealership lot. Facts come from retro/content.js, the same
   ones the phone layout and the retro machines read.
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

const TINT = { rjax: '#2fae5a', shiva: '#f39c12', rfa: '#f2b705', fics: '#fa4616', toyota: '#eb0a1e', jm: '#00857c', hunter: '#b5121b', adt: '#1f6fd1', edu: '#fa4616' };
const LOGO = { rfa: ['roboticsforall', 'roboticsforall'], fics: ['fics', 'fics-light'], toyota: ['toyota', 'toyota-light'], jm: ['jm-family', 'jm-family-light'], hunter: ['hunter', 'hunter-light'], adt: ['adt', 'adt'] };
// Where each stop is in the scene: the box to zoom to, and where its pin sits.
const SPOT = {
  rjax: { zoom: [240, 420, 220, 110], pin: [290, 452], prop: 'the competition robot' },
  shiva: { zoom: [30, 196, 260, 210], pin: [156, 196], prop: 'the billboard' },
  rfa: { zoom: [360, 470, 200, 100], pin: [420, 500], prop: 'the delivery robot' },
  fics: { zoom: [560, 150, 320, 150], pin: [810, 214], prop: 'the rooftop lab' },
  toyota: { zoom: [512, 370, 400, 120], pin: [566, 436], prop: 'the showroom' },
  jm: { zoom: [512, 290, 400, 100], pin: [884, 312], prop: 'the offices upstairs' },
  hunter: { zoom: [895, 250, 280, 230], pin: [928, 326], prop: 'the service bay' },
  adt: { zoom: [440, 360, 200, 170], pin: [496, 380], prop: 'the camera and the sign' },
  edu: { zoom: [40, 470, 230, 100], pin: [150, 498], prop: 'the pond' }
};

const roles = P.experience.map((e) => ({
  id: e.id, org: e.org, short: e.short, role: e.role, when: e.when, where: e.where, year: e.year,
  text: e.text, stats: e.stats, tags: e.tags, photos: e.photos.map(big), logo: LOGO[e.id] || null, tint: TINT[e.id]
}));
const E = P.education;
roles.push({ id: 'edu', org: E.school, short: 'UF', role: `${E.degree}, ${E.college}`, when: E.when, where: 'Gainesville, FL', year: 2026, text: E.text, stats: [], tags: E.tags, photos: [], logo: null, gator: E.logo, tint: TINT.edu, school: true });
const order = roles.map((r) => r.id);

// Small helpers for drawing.
const img = (id, x, y, w, h, cls = '') => {
  const [d, l] = LOGO[id];
  return d === l ? `<image class="${cls}" href="assets/logos/opt/${d}.webp" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`
    : `<image class="${cls} tw-lg-d" href="assets/logos/opt/${d}.webp" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/><image class="${cls} tw-lg-l" href="assets/logos/opt/${l}.webp" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`;
};
const hot = (id, inner) => `<g class="tw-hot" data-id="${id}" style="--tint:${TINT[id]}" tabindex="-1" aria-hidden="true">${inner}</g>`;
const car = (cls, fill, x, y, s = 1, flip = false) => `<g class="${cls}" transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})"><path d="M-46 0 v-14 q0-6 6-7 l14-3 l14-12 q4-3 9-3 h22 q6 0 10 4 l12 12 l8 2 q7 2 7 8 v13 z" fill="${fill}"/><path d="M-20 -24 l10-9 q3-2 6-2 h10 v11 z M10 -24 v-11 h9 q4 0 7 3 l8 8 z" class="tw-car-win"/><circle cx="-26" cy="0" r="7.5" class="tw-tyre"/><circle cx="26" cy="0" r="7.5" class="tw-tyre"/><circle cx="-26" cy="0" r="3" class="tw-hub"/><circle cx="26" cy="0" r="3" class="tw-hub"/><rect x="38" y="-12" width="6" height="4" rx="2" class="tw-lamp"/></g>`;

const svg = `<svg class="tw-svg" viewBox="0 0 1200 640" preserveAspectRatio="xMidYMid slice" role="img" aria-label="A drawn dealership lot. Each part of it is a place I've worked; the buttons below open the same stories.">
  <defs>
    <linearGradient id="twSkyDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9d5f0"/><stop offset=".75" stop-color="#ece8de"/></linearGradient>
    <linearGradient id="twSkyNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#080c19"/><stop offset=".8" stop-color="#1b1f30"/></linearGradient>
    <linearGradient id="twBeam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5ff0ff" stop-opacity=".05"/><stop offset="1" stop-color="#5ff0ff" stop-opacity=".8"/></linearGradient>
    <linearGradient id="twSpot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6d8" stop-opacity=".75"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></linearGradient>
    <linearGradient id="twCone" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5a8bff" stop-opacity=".45"/><stop offset="1" stop-color="#5a8bff" stop-opacity="0"/></linearGradient>
    <radialGradient id="twHalo"><stop offset="0" stop-color="#ffd27a" stop-opacity=".6"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
    <clipPath id="twGlass"><rect x="532" y="406" width="356" height="64"/></clipPath>
    <clipPath id="twBay"><rect x="920" y="372" width="226" height="98"/></clipPath>
    <filter id="twGlow" x="-30%" y="-30%" width="160%" height="160%"><feMorphology in="SourceAlpha" operator="dilate" radius="2.2" result="d"/><feGaussianBlur in="d" stdDeviation="3" result="b"/><feFlood flood-color="#ff7a3d" flood-opacity=".95"/><feComposite in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>

  <!-- Far: sky, sun or moon, stars, clouds, hills. -->
  <g class="tw-far" data-depth="4">
    <rect class="tw-sky-d" x="-200" y="-60" width="1600" height="560" fill="url(#twSkyDay)"/>
    <rect class="tw-sky-n" x="-200" y="-60" width="1600" height="560" fill="url(#twSkyNight)"/>
    <g class="tw-stars">${Array.from({ length: 34 }, (_, i) => `<circle cx="${(i * 137) % 1200}" cy="${18 + ((i * 71) % 230)}" r="${i % 5 ? 1 : 1.6}" style="--d:${(i % 7) * 0.6}s"/>`).join('')}</g>
    <g class="tw-sun"><circle cx="1060" cy="92" r="70" fill="url(#twHalo)"/><circle cx="1060" cy="92" r="34" fill="#ffcf6b"/></g>
    <g class="tw-moon"><circle cx="1060" cy="92" r="30" fill="#f1ead6"/><circle cx="1074" cy="82" r="27" class="tw-moon-cut"/></g>
    <g class="tw-clouds">
      <g class="tw-cloud" style="--dur:95s;--from:-260px"><g transform="translate(140 96)"><rect x="0" y="10" width="150" height="30" rx="15"/><circle cx="50" cy="12" r="24"/><circle cx="92" cy="8" r="30"/></g></g>
      <g class="tw-cloud" style="--dur:130s;--from:-700px"><g transform="translate(640 60)"><rect x="0" y="8" width="110" height="24" rx="12"/><circle cx="40" cy="10" r="18"/><circle cx="70" cy="6" r="22"/></g></g>
      <g class="tw-cloud" style="--dur:160s;--from:-1100px"><g transform="translate(900 150)"><rect x="0" y="8" width="90" height="20" rx="10"/><circle cx="34" cy="8" r="15"/><circle cx="58" cy="6" r="17"/></g></g>
    </g>
    <path class="tw-hill2" d="M-200 430 Q 80 340 330 390 T 760 380 T 1160 360 T 1400 380 V 480 H -200 Z"/>
    <path class="tw-hill1" d="M-200 450 Q 160 400 420 430 T 900 420 T 1400 430 V 480 H -200 Z"/>
  </g>

  <!-- Middle: the lot, the buildings and everything that happens there. -->
  <g class="tw-mid" data-depth="9">
    <rect class="tw-grass" x="-200" y="464" width="1600" height="200"/>
    <rect class="tw-lot" x="250" y="466" width="1150" height="92"/>
    <g class="tw-lines">${[290, 340, 390, 440].map((x) => `<rect x="${x}" y="470" width="3" height="26" rx="1.5"/>`).join('')}</g>

    <!-- Trees -->
    <g class="tw-tree" transform="translate(506 470)"><rect x="-3" y="-30" width="6" height="30" class="tw-trunk"/><circle cx="0" cy="-44" r="20"/><circle cx="-12" cy="-34" r="13"/><circle cx="12" cy="-32" r="14"/></g>
    <g class="tw-tree" transform="translate(1180 470) scale(.9)"><rect x="-3" y="-30" width="6" height="30" class="tw-trunk"/><circle cx="0" cy="-44" r="20"/><circle cx="-12" cy="-34" r="13"/><circle cx="12" cy="-32" r="14"/></g>

    ${hot('shiva', `
    <!-- 2020, Shiva Robotics Academy: a roadside billboard, search traffic climbing. -->
    <g transform="translate(46 206)">
      <rect x="54" y="112" width="8" height="150" class="tw-post"/><rect x="168" y="112" width="8" height="150" class="tw-post"/>
      <rect x="0" y="0" width="230" height="116" rx="7" class="tw-board"/>
      <rect x="12" y="12" width="206" height="24" rx="12" class="tw-search"/>
      <circle cx="27" cy="24" r="5" class="tw-mag"/><path d="M31 28 l4 4" class="tw-mag"/>
      <text x="40" y="28" class="tw-mono tw-type">robotics classes near me</text>
      <rect x="194" y="16" width="1.6" height="16" class="tw-caret"/>
      <g class="tw-bars">${[14, 22, 30, 42, 56].map((h, i) => `<rect x="${18 + i * 26}" y="${104 - h}" width="17" height="${h}" rx="3" style="--i:${i}"/>`).join('')}</g>
      <path d="M150 84 l36-30 m-12 0 h12 v12" class="tw-up"/>
      <text x="150" y="104" class="tw-big">+20%</text>
      <rect x="20" y="-8" width="40" height="8" rx="3" class="tw-post"/><rect x="170" y="-8" width="40" height="8" rx="3" class="tw-post"/>
    </g>`)}

    ${hot('edu', `
    <!-- University of Florida: a pond, a pennant, and a gator having a look. -->
    <g>
      <ellipse cx="150" cy="520" rx="98" ry="22" class="tw-pond"/>
      <g class="tw-ripples"><ellipse cx="150" cy="522" rx="20" ry="5"/><ellipse cx="150" cy="522" rx="20" ry="5" style="animation-delay:-1.6s"/></g>
      <g class="tw-gator">
        <path d="M118 524 q4-14 18-14 h30 q10 0 18 8 l10 6 z" class="tw-gator-b"/>
        <circle cx="134" cy="512" r="7" class="tw-gator-b"/><circle cx="150" cy="512" r="7" class="tw-gator-b"/>
        <circle cx="134" cy="511" r="3.6" fill="#fff"/><circle cx="150" cy="511" r="3.6" fill="#fff"/>
        <circle cx="135" cy="511" r="1.8" class="tw-pupil"/><circle cx="151" cy="511" r="1.8" class="tw-pupil"/>
        <rect x="129" y="505" width="26" height="6" class="tw-lid"/>
      </g>
      <rect x="226" y="476" width="3" height="46" class="tw-post"/>
      <path d="M229 478 l34 9 l-34 9 z" fill="#0021a5"/><path d="M229 487 l34 0 l-34 9 z" fill="#fa4616"/>
    </g>`)}

    ${hot('rjax', `
    <!-- 2019, Renaissance Jax: a competition robot lining itself up on a target. -->
    <g>
      <g transform="translate(424 456)"><rect x="-2" y="0" width="4" height="36" class="tw-post"/><path d="M-12 -18 v14 h24 v-14 h-6 v8 h-12 v-8 z" class="tw-target"/></g>
      <g class="tw-reticle" transform="translate(424 446)"><path d="M-22 -16 v-8 h8 M14 -24 h8 v8 M22 16 v8 h-8 M-14 24 h-8 v-8"/></g>
      <path d="M326 470 L414 442" class="tw-vision"/>
      <g transform="translate(272 474)">
        <rect x="-4" y="16" width="80" height="13" rx="6" fill="#c8373c"/>
        <rect x="0" y="0" width="72" height="20" rx="4" fill="#2fae5a"/>
        <rect x="8" y="5" width="22" height="3" rx="1.5" class="tw-vent"/><rect x="8" y="11" width="22" height="3" rx="1.5" class="tw-vent"/>
        <circle cx="12" cy="32" r="6" class="tw-tyre"/><circle cx="60" cy="32" r="6" class="tw-tyre"/>
        <g class="tw-turret"><rect x="44" y="-14" width="6" height="16" class="tw-post"/><rect x="40" y="-22" width="16" height="10" rx="3" class="tw-cam"/><circle cx="54" cy="-17" r="3.4" fill="#46f28a" class="tw-ring"/></g>
      </g>
    </g>`)}

    ${hot('rfa', `
    <!-- 2022, Robotics For All: a little robot doing the rounds with sign up mail. -->
    <g class="tw-rover">
      <g class="tw-rover-in" transform="translate(392 538) scale(.86)">
        <rect x="-1.5" y="-46" width="3" height="10" class="tw-post"/><circle cx="0" cy="-48" r="3.4" class="tw-blink" fill="#ff5a3d"/>
        <rect x="-20" y="-38" width="40" height="28" rx="9" fill="#f6c431"/>
        <rect x="-13" y="-31" width="10" height="11" rx="3" class="tw-eye"/><rect x="3" y="-31" width="10" height="11" rx="3" class="tw-eye"/>
        <circle class="tw-pupil tw-follow" cx="-8" cy="-25.5" r="2.4"/><circle class="tw-pupil tw-follow" cx="8" cy="-25.5" r="2.4"/>
        <rect x="-16" y="-10" width="32" height="24" rx="5" fill="#2d6cdf"/>
        <rect x="-9" y="-6" width="18" height="10" rx="2" fill="#1d4fb0"/>
        <circle cx="-9" cy="18" r="6" class="tw-tyre"/><circle cx="9" cy="18" r="6" class="tw-tyre"/>
        <g class="tw-mail"><rect x="14" y="-24" width="22" height="15" rx="2" fill="#fff" stroke="#c9c2b4"/><path d="M14.5 -23.5 l10.5 8 l10.5 -8" fill="none" stroke="#c9c2b4" stroke-width="1.4"/></g>
      </g>
    </g>`)}

    <!-- The building: showroom below, offices above, a lab on the roof. -->
    <rect x="512" y="284" width="396" height="18" rx="2" class="tw-roof"/>
    ${hot('jm', `
    <!-- 2025, JM Family Enterprises: the offices upstairs, dashboards in every window. -->
    <g>
      <rect x="520" y="302" width="380" height="78" class="tw-wall2"/>
      <rect x="530" y="312" width="66" height="58" rx="5" class="tw-plaque"/>
      ${img('jm', 536, 316, 54, 50)}
      ${[0, 1, 2, 3, 4].map((i) => `<g transform="translate(${610 + i * 56} 316)"><rect width="46" height="48" rx="3" class="tw-win"/><rect x="8" y="22" width="30" height="16" rx="2" class="tw-screen"/><rect x="11" y="${33 - (i % 3) * 3}" width="4" height="${3 + (i % 3) * 3}" class="tw-dash" style="--i:${i}"/><rect x="17" y="${30 - (i % 2) * 4}" width="4" height="${6 + (i % 2) * 4}" class="tw-dash" style="--i:${i + 1}"/><rect x="23" y="27" width="4" height="9" class="tw-dash" style="--i:${i + 2}"/><rect x="29" y="${31 - (i % 3) * 2}" width="4" height="${5 + (i % 3) * 2}" class="tw-dash" style="--i:${i + 3}"/><circle cx="${i % 2 ? 36 : 12}" cy="14" r="5" class="tw-head"/></g>`).join('')}
    </g>`)}

    ${hot('toyota', `
    <!-- 2024, Southeast Toyota: the showroom, a car on the turntable, tyres out front. -->
    <g>
      <rect x="520" y="380" width="380" height="26" class="tw-band"/>
      <image href="assets/logos/opt/toyota.webp" x="636" y="383" width="150" height="20" preserveAspectRatio="xMidYMid meet"/>
      <rect x="532" y="406" width="356" height="64" class="tw-glass"/>
      <g clip-path="url(#twGlass)">
        <polygon points="620,406 600,470 680,470 652,406" fill="url(#twSpot)" class="tw-spot"/>
        <polygon points="744,406 712,470 792,470 760,406" fill="url(#twSpot)" class="tw-spot" style="animation-delay:-2s"/>
        <ellipse cx="700" cy="463" rx="74" ry="7" class="tw-turn"/>
        <g class="tw-spin">${car('', '#eb0a1e', 700, 458, 1.05)}</g>
        <path d="M560 406 l-30 64 M600 406 l-30 64 M820 406 l-30 64" class="tw-shine"/>
      </g>
      ${[591, 650, 709, 768, 827].map((x) => `<rect x="${x}" y="406" width="3" height="64" class="tw-mull"/>`).join('')}
      <g transform="translate(864 470)"><ellipse cx="0" cy="-4" rx="17" ry="6" class="tw-tyre"/><ellipse cx="0" cy="-12" rx="17" ry="6" class="tw-tyre"/><ellipse cx="0" cy="-20" rx="17" ry="6" class="tw-tyre"/><ellipse cx="0" cy="-20" rx="7" ry="2.4" class="tw-hub"/></g>
    </g>`)}

    ${hot('fics', `
    <!-- 2023, FICS at UF: a rooftop lab catching the prompts meant to break a chatbot. -->
    <g>
      <rect x="772" y="222" width="70" height="62" rx="4" class="tw-rack"/>
      ${[0, 1, 2, 3].map((r) => `<rect x="778" y="${230 + r * 12}" width="58" height="8" rx="2" class="tw-unit"/>${[0, 1, 2].map((c) => `<circle cx="${784 + c * 6}" cy="${234 + r * 12}" r="1.6" class="tw-led" style="--d:${((r * 3 + c) % 5) * 0.37}s"/>`).join('')}`).join('')}
      <text x="807" y="281" class="tw-mono tw-tiny" text-anchor="middle">HiPerGator</text>
      <g transform="translate(610 284)">
        <rect x="-3" y="-24" width="6" height="24" class="tw-post"/>
        <path d="M-26 -30 q26 26 52 0 z" class="tw-dish"/><path d="M0 -30 l10 -14" class="tw-post-l"/><circle cx="10" cy="-45" r="3" class="tw-led-on"/>
        <g class="tw-pings"><path d="M18 -54 a14 14 0 0 1 10 12"/><path d="M22 -62 a24 24 0 0 1 16 20" style="animation-delay:.4s"/></g>
      </g>
      <g class="tw-chat" transform="translate(690 196)">
        <g class="tw-bad"><path d="M-6 0 h66 a8 8 0 0 1 8 8 v18 a8 8 0 0 1 -8 8 h-42 l-10 9 v-9 h-14 a8 8 0 0 1 -8 -8 v-18 a8 8 0 0 1 8 -8 z" class="tw-bubble"/><text x="27" y="21.5" class="tw-mono tw-warn" text-anchor="middle">ignore rules</text></g>
        <g class="tw-shield"><path d="M82 -2 l14 5 v10 q0 12 -14 18 q-14 -6 -14 -18 v-10 z" fill="#2fae5a"/><path d="M76 12 l4 4 l8 -9" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></g>
      </g>
    </g>`)}

    ${hot('hunter', `
    <!-- 2026, Hunter Engineering: the service bay, an alignment rig scanning a car,
         and the reset signal going out to the cloud. -->
    <g>
      <polygon points="897,338 1168,338 1150,316 915,316" class="tw-roof"/>
      <rect x="905" y="338" width="255" height="132" class="tw-wall"/>
      <rect x="905" y="342" width="255" height="26" class="tw-band"/>
      <image href="assets/logos/opt/hunter.webp" x="972" y="345" width="120" height="20" preserveAspectRatio="xMidYMid meet"/>
      <rect x="920" y="372" width="226" height="98" class="tw-bay"/>
      <g clip-path="url(#twBay)">
        <rect x="920" y="372" width="226" height="6" class="tw-bay-light"/>
        <rect x="920" y="378" width="226" height="9" class="tw-door"/>
        <rect x="944" y="446" width="150" height="7" rx="2" fill="#c8302f"/><rect x="950" y="453" width="7" height="17" class="tw-post"/><rect x="1080" y="453" width="7" height="17" class="tw-post"/>
        <g class="tw-lift">${car('', '#3d68ff', 1016, 438, 1)}<g class="tw-clamps"><rect x="982" y="430" width="16" height="16" rx="2"/><rect x="1034" y="430" width="16" height="16" rx="2"/></g></g>
        <g transform="translate(1124 384)"><rect x="-3" y="0" width="6" height="86" class="tw-post"/><rect x="-14" y="2" width="28" height="5" rx="2" class="tw-post"/><rect x="-16" y="-4" width="10" height="10" rx="2" class="tw-cam"/><rect x="6" y="-4" width="10" height="10" rx="2" class="tw-cam"/></g>
        <polygon points="1110,381 990,433 990,443" fill="url(#twBeam)" class="tw-beam"/>
        <polygon points="1132,381 1042,433 1042,443" fill="url(#twBeam)" class="tw-beam" style="animation-delay:-.6s"/>
        <rect x="930" y="430" width="16" height="22" rx="2" class="tw-console"/><rect x="933" y="433" width="10" height="7" rx="1" class="tw-screen"/>
      </g>
      <g class="tw-waves" transform="translate(1032 312)"><path d="M-14 0 a16 16 0 0 1 28 0"/><path d="M-24 -8 a28 28 0 0 1 48 0" style="animation-delay:.5s"/><path d="M-34 -16 a40 40 0 0 1 68 0" style="animation-delay:1s"/></g>
      <g transform="translate(1032 252)" class="tw-iot"><rect x="-26" y="-6" width="52" height="20" rx="10"/><circle cx="-10" cy="-6" r="12"/><circle cx="8" cy="-10" r="15"/><path d="M-4 0 a6 6 0 1 1 8 5 m-4 -9 v4" class="tw-reset"/></g>
    </g>`)}

    ${hot('adt', `
    <!-- 2026, ADT: a camera on the corner that watches you, and the sign out front. -->
    <g>
      <g class="tw-cctv" transform="translate(518 392)">
        <rect x="-2" y="-6" width="4" height="12" class="tw-post"/><rect x="-14" y="-2" width="14" height="4" class="tw-post"/>
        <g class="tw-cctv-head" transform="rotate(-28)"><g transform="translate(-14 0)">
          <polygon points="-18,0 -170,-40 -170,40" fill="url(#twCone)" class="tw-cone" transform="scale(1 .62)"/>
          <rect x="-26" y="-7" width="28" height="14" rx="4" fill="#f4f1ea" stroke="#c9c2b4"/>
          <rect x="-30" y="-5" width="6" height="10" rx="2" fill="#1f6fd1"/>
          <circle cx="-4" cy="-3" r="1.8" class="tw-rec"/>
        </g></g>
      </g>
      <g transform="translate(548 492)"><rect x="-1.6" y="0" width="3.2" height="38" class="tw-post"/>${img('adt', -17, -32, 34, 34)}</g>
    </g>`)}

    <!-- Lamps along the road: lit after dark. -->
    ${[250, 700, 1100].map((x) => `<g transform="translate(${x} 556)" class="tw-lampost"><rect x="-2" y="-70" width="4" height="70" class="tw-post"/><rect x="-2" y="-72" width="22" height="4" rx="2" class="tw-post"/><rect x="12" y="-70" width="12" height="5" rx="2" class="tw-bulb"/><polygon points="12,-65 24,-65 44,0 -8,0" class="tw-pool"/></g>`).join('')}
  </g>

  <!-- Near: the road, and traffic. -->
  <g class="tw-near" data-depth="14">
    <rect x="-200" y="556" width="1600" height="6" class="tw-curb"/>
    <rect x="-200" y="562" width="1600" height="62" class="tw-road"/>
    <g class="tw-dashes">${Array.from({ length: 30 }, (_, i) => `<rect x="${-180 + i * 56}" y="592" width="28" height="3" rx="1.5"/>`).join('')}</g>
    <g class="tw-drive tw-drive-r">${car('', '#ff6b35', 0, 588, .82)}</g>
    <g class="tw-drive tw-drive-l">${car('', '#6a7cff', 0, 616, .82, true)}</g>
    <g class="tw-drive tw-drive-r2">${car('', '#2fae5a', 0, 588, .76)}</g>
    <rect x="-200" y="624" width="1600" height="40" class="tw-grass"/>
  </g>

  <!-- A pin on each stop, so it's clear what can be opened. -->
  <g class="tw-pins">${roles.map((r) => { const [x, y] = SPOT[r.id].pin; return `<g class="tw-pin" data-id="${r.id}" transform="translate(${x} ${y})" style="--tint:${r.tint}"><circle r="9" class="tw-pin-ring"/><circle r="4.2" class="tw-pin-dot"/></g>`; }).join('')}</g>
</svg>`;

const sorted = [...roles].sort((a, b) => a.year - b.year || order.indexOf(a.id) - order.indexOf(b.id));
const chips = sorted.map((r) => `<button type="button" class="tw-chip" data-id="${r.id}" style="--tint:${r.tint}"><b>’${String(r.year).slice(2)}</b><span>${esc(r.school ? 'University of Florida' : r.short)}</span></button>`).join('');
const data = { order: sorted.map((r) => r.id), roles: Object.fromEntries(roles.map((r) => [r.id, { ...r, zoom: SPOT[r.id].zoom, prop: SPOT[r.id].prop }])) };

const html = `<!-- town:start -->
    <!-- THE PATH, on a wide screen: one drawn dealership lot, every place I've
         worked a part of it. Built from retro/content.js by tools/build-town.js;
         edit that, not this. -->
    <section id="experience" class="section town-section">
      <div class="section-head"><h2>The path so far</h2></div>
      <p class="section-lede">Every place I’ve worked, on one lot. Click anything in the scene to step inside, or pick a year below.</p>
      <div class="tw" id="town" tabindex="-1">
        <div class="tw-stage">
          ${svg}
          <p class="tw-hint" aria-hidden="true"><i></i>Click anything with a pin</p>
          <div class="tw-label" aria-hidden="true"></div>
          <aside class="tw-panel" aria-live="polite" hidden>
            <button type="button" class="tw-x" aria-label="Back to the whole lot"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
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
else {
  // The circuit stays in the page, retired, so the scripts that drive it still find it.
  page = page.replace('<section id="experience" class="section journey-section" data-compact>', `${html.trim()}\n\n    <section id="path-circuit" class="section journey-section tw-retired" data-compact hidden>`);
}
if (!page.includes('href="town.css')) page = page.replace(/(<link rel="stylesheet" href="mobile\.css[^"]*" \/>)/, '$1\n  <link rel="stylesheet" href="town.css?v=1" />');
if (!page.includes('src="town.js')) page = page.replace(/(<script src="mobile\.js[^"]*" defer><\/script>)/, '$1\n  <script src="town.js?v=1" defer></script>');
fs.writeFileSync(f, page);
console.log('index.html updated', page.length);
