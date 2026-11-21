// Reusable ink shapes for the street. Instances share the same paths so a
// camera move only has to reposition the scene, even in the denser woods.
const definitions = `
  <g id="twFirArt">
    <path fill="var(--tw-trunk)" d="M-2 0l1.3-36 2.6-12L2.6-.4l2.5 1-8.8.4z"/>
    <path class="tw-pine2" d="M.8-100Q-.8-92-6-85l3-.9Q-6-77-12-71l5.6-1.8Q-9-66-16-61l3.8-.8-5.6 5.5 8.5-2Q-14-51-23-45l6.4-1.8-4.3 5.2 9.5-2.9Q-17-35-27-29l5.5-.7-3.8 4.6 7.7-1.3-4.2 4.2q10 .4 19.7-5.6l-2 4.7 5.3-2.7 2.5 3.6 1.3-4.1q7 6.1 16.1 6.4l-3.8-3.7 9.4 1.8-4.6-4.5 7 1.3Q19-33 14-43l7.7 2.8-3.6-4.8 6.1 1.5Q15-51 10-60l7.1 2.3-2.8-4.1 4 .9Q10-68 7-74l5 1.2Q6-79 4.1-85.6l2.7 1Q2.8-92 .8-100Z"/>
    <path class="tw-pine1" d="M.7-98q-.7 10-4.1 17.3l3-1.7q-2.2 8.4-9.8 15.4 4.8-.9 8.2-4.9-1.4 8.9-11.6 17.8 9-2.6 13.8-9.1-2.9 12.9-16.6 22.4 8.7-1.7 16.3-10.4-1.8 12.3-19.4 25.5 11.9-2.1 20.2-12.8 4.4 8.3 15.4 12.9-7.3-9.2-9.5-15.7l6.1 3.8q-9.8-10.8-11.5-18.3l6.7 4.1Q1.7-63.2 1.9-72l4.8 3.9Q.6-79.3.7-98z"/>
    <path d="M-15-31q5.5-3.4 8.6-7.6m-4.4-6.8 5.4-5.8m-4.2-8.4 5.9-6.2m1.8-10.4 2.3-4m7.1 32.1 4.8 5.6m-6.6 6.3 7.5 6.5" class="tw-needle"/>
  </g>
  <g id="twOakCrown">
    <path class="tw-leaf2" d="M-55-72q-5-12 6-19-2-13 12-17 1-14 14-15 5-14 20-12 11-9 23-2 13 0 15 14 14 2 15 16 15 5 12 19 9 12 0 21 1 15-15 17-7 11-19 7-10 9-22 2-15 6-24-4-15 4-23-8-13-1-12-15z"/>
    <path class="tw-leaf" d="M-55-76q-5-10 6-16-3-12 12-17 2-12 14-14 6-15 20-12 12-10 24-1 12 2 11 12 12 2 10 12 9 9-2 15-5 9-15 6-8 9-20 4-9 12-22 6-8 10-22 5-10 5-16 0z"/>
    <path d="M-44-98q4-8 11-7m3-10q5-6 11-5m14-8q6-6 14-3m2 16q6-4 11-1m-57 27q5-6 12-5m4-10q4-6 10-5m16 29q5-5 10-4m11 17q4-3 8-3m-41 7q6-1 8-6" class="tw-leaf-etch"/>
    <path d="M-48-84q6-1 9-5m21 2q6 0 9-5m26 16q6 0 10-7m12-13q5-2 7-6m-66 48q6 2 12-2" class="tw-leaf-vein"/>
  </g>
  <path id="twShrubEdge" d="M-30-2q-4-6 1-10-1-6 6-8 2-7 9-6 4-7 12-5 8-6 13 0 8-1 11 6 7 0 7 8 7 3 5 10-1 6-9 7-12 3-24 1-20 3-31-3z"/>
  <g id="twShrubArt"><use href="#twShrubEdge" class="tw-leaf2"/>
    <path class="tw-leaf" d="M-29-8q-3-6 2-9 1-5 7-5 3-6 9-4 4-7 11-5 8-5 13 1 7 0 9 7 4 2 4 5-3 4-9 2-6 7-13 3-8 6-14 2-9 6-19 3z"/>
    <path d="M-20-17l3-2m5-3 3-1m8 5 3-2m5-5 3 1m8 12 3-1m-32 7 4-1" class="tw-leaf-etch"/>
  </g>
  <g id="twDaisy">
    <path d="M0 4.5Q1 2 0 0m.2 3.4Q-3 3.6-3.1 1.5-.8 1.4.2 3.4z" fill="#53784b" stroke="#53784b" stroke-width=".45"/>
    <path d="M0-.9c-2.8-3.3-4.4.2-1.6 1-3.2.8-.8 3.7.9 1.7.1 3.2 3.1 2.5 2.2-.4 2.9 1.5 3.5-1.6.7-2 2.4-2.1-.9-3.5-2.2-.3z" class="tw-flower"/>
    <circle r=".8" fill="#d99e49"/>
  </g>
  <g id="twTopiaryArt">
    <path d="M0-8.5q3-1.1 5.2 1.1 2.6 0 3.1 3.3 2 2.5.5 5.2.7 3.1-2.1 4.7-1.4 3.3-5.2 2.7-3.1 1.2-5.2-1-3.1.1-4.1-3.6-2-1.8-.7-5 0-3.6 3.1-4.5Q-3.2-8.5 0-8.5z" class="tw-leaf2"/>
    <path d="M-6.7-2q-.2-2.5 2.7-3.8Q-2.3-8 0-7.2 3-8 4.5-5.8 7-5.3 6.1-2.6 4.7-.5 2.7-1 1.5 1.7-.8.8-2.2 3-4 1.2q-3.2 1-2.7-3.2z" class="tw-leaf"/>
    <path d="m-4-3 1-.9m2.5-1.5 1.2-.35M4 1.7l1.3-.8" stroke="#dece94" opacity=".65" stroke-width=".8" stroke-linecap="round"/>
  </g>
  <g id="twCloudArt">
    <path d="M-6 35q4-4 15-4-1-8 11-9 3-15 20-13 5-16 23-12 9-22 29-14 13-15 27-2 10 1 12 14 15-5 23 9 12-1 16 9 14-1 16 6 14 0 19 4-34 4-58 2-22 6-51 3-29 3-51-1-21 2-41-2z"/>
    <path d="M14 31q17 2 27-4 13 5 28-3 12 4 24-5-6 12-21 13-28 6-58-1zm92-6q16 2 29-8 1 8 11 7 12 2 21-1-6 7-20 6-22 4-41-4z" fill="#526b88" opacity=".16"/>
    <path d="M44 5q8-10 19-6m10-8q8-8 17-4m17-2q8-3 13 4" fill="none" stroke="#fff" stroke-opacity=".45" stroke-linecap="round" stroke-width="1.4"/>
  </g>
  <path id="twDistantStand" d="M0 1l3-5 2 4 3-10 3 7 4-14 2 7-1-.4 3 6 3-8 2.5 6 3-13 2.5 8 2-3 2.6 6 3-8 2 6 3-3 2 4 3-5 2.4 5v9H0z"/>
  <pattern id="twStoneFleck" width="47" height="29" patternUnits="userSpaceOnUse">
    <path d="m3 9 2-.5m12 14 1.2-.4m9-14 2-.3m13 8 1.3-.4M9 2l1-.3" fill="none" stroke="#fff1ca" stroke-width=".65" stroke-linecap="round" opacity=".54"/>
    <path d="m6 16 1.3.2m14-12 1.7.3m9 22 2-.6m5-16 1.5.2" stroke="#152e36" stroke-width=".8" opacity=".42"/>
  </pattern>
  <pattern id="twTimber" width="29" height="54" patternUnits="userSpaceOnUse">
    <path d="M5-2q.6 10-.8 16t-.2 17m.4 6 .3 14M13 6q-1 13 .5 21t.2 20M23-4q-1 10 .4 17t-.3 19m-.4 4q-3 4 .2 8 3-4-.2-8z" fill="none" stroke="#352720" stroke-width=".65" opacity=".48"/>
    <path d="M8 3v13m8 11 .2 13m10-31v14" fill="none" stroke="#ffe0a6" stroke-width=".65" opacity=".54"/>
  </pattern>
  <linearGradient id="twMeadowLight" x1="0" y1="0" x2=".1" y2="1">
    <stop stop-color="#f9ebad" stop-opacity=".24"/><stop offset=".54" stop-color="#ffd389" stop-opacity=".07"/><stop offset="1" stop-color="#355340" stop-opacity=".14"/>
  </linearGradient>
  <linearGradient id="twSunDisc" x2=".3" y2="1"><stop stop-color="#fff4bd"/><stop offset=".65" stop-color="#ffdd82"/><stop offset="1" stop-color="#efb96d"/></linearGradient>
`;

const tree = (x, y, s = 1, k = 0) => `<g class="tw-tree" transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="-4" cy=".5" rx="24" ry="3.2" class="tw-root-shadow"/>
  <path fill="var(--tw-trunk)" d="M-10 1q4-13 3-33l-.8-21-17-24 5 2 15 15 3-28 4 1-2 36 15-16 3 1-17 23Q-1-7 3 1l-7-2z"/>
  <path d="M-5-4q1-12-.1-24m2.8-9 1.4-12" fill="none" stroke="#dfb279" stroke-width="1.2" opacity=".56"/>
  <g class="tw-canopy" style="--k:${k}"><use href="#twOakCrown" transform="scale(${k % 2 ? -1 : 1} 1)"/></g></g>`;
const pine = (x, y, h) => `<use class="tw-pine" href="#twFirArt" transform="translate(${x} ${y}) scale(${((x % 3 === 0 ? -.95 : .94) * h / 100).toFixed(3)} ${h / 100})"/>`;
const bush = (x, y, s = 1) => `<use class="tw-leaf2" href="#twShrubArt" transform="translate(${x} ${y}) scale(${s})"/>`;

// Rolling colour bands and occasional stands of spruce give the valley depth.
const distantWoods = (world) => {
  return [[381, 15, .65], [412, 18, 1], [451, 10, .84]].map(([base, depth, scale], band) => {
    const ground = x => base + depth * Math.sin(x / 178 + band * 2) + 6 * Math.sin(x / 75);
    const ridge = [], trees = [];
    for (let x = -820; x < world + 860; x += 32) {
      ridge.push(`L${x} ${ground(x).toFixed(1)}`);
      if (Math.sin(x / 92 + band) + Math.cos(x / 61) < -.37) continue;
      const slope = (ground(x + 32) - ground(x)) / 32;
      const width = scale * (.88 + .2 * Math.sin(x));
      trees.push(`<use href="#twDistantStand" transform="matrix(${width.toFixed(2)} ${(slope * width).toFixed(2)} 0 ${scale} ${x} ${ground(x).toFixed(1)})"/>`);
    }
    return `<g class="tw-woodland-${band}"><path d="M-820 500 ${ridge.join('')}V500Z"/>${trees.join('')}</g>`;
  }).join('');
};

module.exports = { definitions, tree, bush, pine, distantWoods };
