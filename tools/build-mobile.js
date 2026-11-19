/* Builds the phone layout of the home page (the block between the
   "mx:start" and "mx:end" markers in index.html) from retro/content.js,
   the same facts the retro machines read. Phones only: on anything wider
   the block is hidden and the page is as it always was.
   Run: node tools/build-mobile.js */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const window = {};
const src = fs.readFileSync(path.join(root, 'retro/content.js'), 'utf8');
new Function('window', src.slice(0, src.indexOf('/* Small helpers every machine shares. */')))(window);
const P = window.PORTFOLIO;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const has = (f) => fs.existsSync(path.join(root, f));
const mid = (s) => { for (const k of ['-960', '-800']) { const f = s.replace(/-(400|480)\.webp$/, k + '.webp'); if (f !== s && has(f)) return f; } return s; };
const usedAt = (skill) => {
  const k = skill.toLowerCase().replace(/[()]/g, '').split(/[ /]/)[0];
  if (k.length < 2) return [];
  return P.experience.filter((e) => e.tags.some((t) => t.toLowerCase().includes(k)) || (k.length > 3 && e.text.toLowerCase().includes(k))).map((e) => e.short);
};
const lead = (t) => { const i = t.indexOf('. '); return i < 0 ? [t, ''] : [t.slice(0, i + 1), t.slice(i + 2)]; };
const initials = (n) => n.split(' ').map((w) => w[0]).join('').slice(0, 2);
const ROLES = [...P.experience].reverse();
// Logos sit on a white tile, so the versions with dark lettering.
const LOGO = { rfa: 'roboticsforall', fics: 'fics-light', toyota: 'toyota-light', jm: 'jm-family-light', hunter: 'hunter-light', adt: 'adt' };

const I = {
  chev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  right: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M15 9V6.5A2.5 2.5 0 0 0 12.5 4h-6A2.5 2.5 0 0 0 4 6.5v6A2.5 2.5 0 0 0 6.5 15H9" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 6.5h17v11h-17zM4 7l8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  resume: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20zM14 3.5V8h4M9.5 12h5M9.5 15.5h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg>',
  github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-3.160 19.490c.5.090.680-.220.680-.480v-1.700c-2.780.600-3.370-1.340-3.370-1.340-.450-1.160-1.110-1.470-1.110-1.470-.910-.620.070-.610.070-.610 1 .070 1.530 1.030 1.530 1.030.890 1.530 2.340 1.090 2.910.830.090-.650.350-1.090.630-1.340-2.220-.250-4.560-1.110-4.560-4.940 0-1.090.390-1.980 1.030-2.680-.100-.250-.450-1.270.100-2.650 0 0 .840-.270 2.750 1.020a9.560 9.560 0 0 1 5 0c1.910-1.290 2.750-1.020 2.750-1.020.550 1.380.200 2.400.100 2.650.640.700 1.030 1.590 1.030 2.680 0 3.840-2.340 4.680-4.570 4.930.360.310.680.920.680 1.850v2.750c0 .270.180.580.690.480A10 10 0 0 0 12 2z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4.980 3.500a2.490 2.490 0 1 1 0 4.980 2.490 2.490 0 0 1 0-4.980zM3 9.750h4V21H3zM9.500 9.750h3.800v1.540h.060c.530-1 1.820-2.050 3.750-2.050 4 0 4.750 2.640 4.750 6.070V21h-4v-5.050c0-1.200-.020-2.750-1.680-2.750s-1.940 1.310-1.940 2.660V21h-4z"/></svg>',
  flip: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 13.700-5.600L20 8.700M20 4v4.700h-4.700M20 12a8 8 0 0 1-13.700 5.600L4 15.300M4 20v-4.700h4.700" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};
/* The site's section shapes: the same five flat marks the desktop uses. */
const SHAPE = {
  path: '<i class="mx-sh mx-sh-q" aria-hidden="true"></i>',
  projects: '<i class="mx-sh mx-sh-t" aria-hidden="true"></i>',
  life: '<i class="mx-sh mx-sh-c" aria-hidden="true"></i>',
  skills: '<i class="mx-sh mx-sh-s" aria-hidden="true"></i>',
  words: '<i class="mx-sh mx-sh-h" aria-hidden="true"></i>'
};
const TABS = [['path', 'Path', 'experience'], ['projects', 'Projects', 'projects'], ['life', 'Life', 'offclock'], ['skills', 'Skills', 'skills'], ['words', 'Words', 'recs']];
const langs = [...new Set(P.projects.map((p) => p.lang))];

const logoOf = (e) => LOGO[e.id] ? `<span class="mx-logo"><img src="assets/logos/opt/${LOGO[e.id]}${['toyota', 'jm-family', 'hunter', 'fics'].includes(LOGO[e.id]) ? '' : ''}.webp" alt="" loading="lazy" decoding="async" /></span>` : `<span class="mx-logo mx-logo-t" aria-hidden="true">${esc(initials(e.short))}</span>`;

const roleSheet = (e) => {
  const [a, b] = lead(e.text);
  return `<template id="mx-role-${e.id}">
    <header class="mxs-head">${logoOf(e)}<div><p class="mx-mono">${esc(e.when)}</p><h3>${esc(e.org)}</h3><p class="mxs-sub">${esc(e.role)} · ${esc(e.where)}</p></div></header>
    ${e.photos.length ? `<div class="mxs-pics">${e.photos.map((s) => `<img src="${mid(s)}" alt="" loading="lazy" decoding="async" />`).join('')}</div>` : ''}
    <p class="mxs-lead">${esc(a)}</p>
    ${b ? `<p class="mxs-text">${esc(b)}</p>` : ''}
    ${e.stats.length ? `<ul class="mxs-stats">${e.stats.map(([n, t]) => `<li><b>${esc(n)}</b><span>${esc(t)}</span></li>`).join('')}</ul>` : ''}
    <ul class="mx-tags">${e.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
  </template>`;
};
const projSheet = (p) => `<template id="mx-proj-${p.id}">
    ${p.shot ? `<img class="mxs-shot" src="${p.shot.replace('-480', '-960')}" alt="${esc(p.name)} screenshot" loading="lazy" decoding="async" />` : ''}
    <header class="mxs-head mxs-head-plain"><div><p class="mx-mono">${esc(p.kind)}</p><h3>${esc(p.full)}</h3></div></header>
    <p class="mxs-text">${esc(p.text)}</p>
    <ul class="mx-tags">${p.stack.split(' / ').map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    ${p.url ? `<a class="mx-btn mx-btn-solid mxs-go" href="${esc(p.url)}" target="_blank" rel="noopener">${I.github} View on GitHub ${I.arrow}</a>` : '<p class="mxs-soon mx-mono">In progress, not public yet</p>'}
  </template>`;

const html = `<!-- mx:start -->
  <!-- Phones only. The same site, laid out for a hand: a short hello, then
       five tabs to swipe between, with the details in sheets that slide up.
       Built from retro/content.js by tools/build-mobile.js; edit that, not this. -->
  <div class="mx" id="mx">
    <!-- The first screen says one thing. -->
    <section class="mx-hero" id="m-top">
      <button type="button" class="mx-mark" aria-label="Turn the shapes">
        <span class="mx-tiles" aria-hidden="true"></span>
      </button>
      <p class="mx-mono mx-greet"><i class="mx-live" aria-hidden="true"></i><span data-mx-greeting>Hello</span></p>
      <h1 class="mx-name"><span class="mx-hi">Hi, I’m</span> <span class="mx-me">Ajay.</span></h1>
      <p class="mx-line">I build software that feels thoughtful, reliable and good to use.</p>
      <a class="mx-down" href="#mx-tabs" aria-label="Take a look"><span>Take a look</span><i aria-hidden="true"></i></a>
    </section>

    <nav class="mx-tabs" id="mx-tabs" aria-label="Sections" role="tablist">
      ${TABS.map(([k, t], i) => `<button type="button" role="tab" id="mx-tab-${k}" aria-controls="mx-p-${k}" aria-selected="${i === 0}" data-tab="${k}">${SHAPE[k]}<span>${t}</span></button>`).join('')}
      <i class="mx-ink" aria-hidden="true"></i>
    </nav>

    <div class="mx-pager">
      <section class="mx-panel" id="mx-p-path" role="tabpanel" aria-labelledby="mx-tab-path" data-tab="path">
        <p class="mx-intro">Eight roles since 2019. Tap one for the story.</p>
        <ol class="mx-tl">
          ${ROLES.map((e) => `<li><button type="button" class="mx-row" data-sheet="mx-role-${e.id}">${logoOf(e)}<span class="mx-row-t"><b>${esc(e.org)}</b><span>${esc(e.role)}</span></span><span class="mx-yr mx-mono">${e.year}</span>${I.chev}</button></li>`).join('\n          ')}
        </ol>
        <div class="mx-edu">
          <img src="${P.education.logo}" alt="" loading="lazy" decoding="async" />
          <div><p class="mx-mono">Education · ${esc(P.education.when)}</p><b>${esc(P.education.school)}</b><span>${esc(P.education.degree)}, with the UF AI Certificate</span></div>
        </div>
      </section>

      <section class="mx-panel" id="mx-p-projects" role="tabpanel" aria-labelledby="mx-tab-projects" data-tab="projects">
        <p class="mx-intro">Things I built to understand how they work.</p>
        <div class="mx-filter" role="group" aria-label="Filter by language"><button type="button" aria-pressed="true" data-lang="all">All <span>${P.projects.length}</span></button>${langs.map((l) => `<button type="button" aria-pressed="false" data-lang="${esc(l)}">${esc(l)} <span>${P.projects.filter((p) => p.lang === l).length}</span></button>`).join('')}</div>
        <ul class="mx-projs">
          ${P.projects.map((p) => `<li data-lang="${esc(p.lang)}"><button type="button" class="mx-proj" data-sheet="mx-proj-${p.id}">
            <span class="mx-proj-pic">${p.shot ? `<img src="${p.shot}" alt="" loading="lazy" decoding="async" />` : `<b aria-hidden="true">${esc(p.name.slice(0, 1))}</b>`}</span>
            <span class="mx-proj-t"><b>${esc(p.name)}</b><span>${esc(p.kind)} · ${esc(p.lang)}</span></span>${I.chev}
          </button></li>`).join('\n          ')}
        </ul>
      </section>

      <section class="mx-panel" id="mx-p-life" role="tabpanel" aria-labelledby="mx-tab-life" data-tab="life">
        <p class="mx-intro">Repairs, teardowns and builds, off the clock. Tap a story.</p>
        <div class="mx-stories">
          ${P.offclock.map((o, i) => `<button type="button" class="mx-story-b" data-story="${i}" style="--i:${i}">
            <span class="mx-ring"><img src="${o.cover}" alt="" loading="lazy" decoding="async" /></span>
            <span class="mx-story-l">${esc(o.title)}</span>
          </button>`).join('')}
        </div>
        <figure class="mx-quote"><blockquote>“${esc(P.quote)}”</blockquote><figcaption class="mx-mono">What keeps me building</figcaption></figure>
      </section>

      <section class="mx-panel" id="mx-p-skills" role="tabpanel" aria-labelledby="mx-tab-skills" data-tab="skills">
        <p class="mx-intro">Tap a skill to see where I’ve used it.</p>
        <div class="mx-groups" role="group" aria-label="Skill groups">${P.skills.map(([g], i) => `<button type="button" aria-pressed="${i === 0}" data-g="${i}">${esc(g.replace(', Data & Databases', ' & Data').replace(' & Libraries', '').replace(' & Integration', '').replace(' & Tooling', ''))}</button>`).join('')}</div>
        ${P.skills.map(([, l], i) => `<ul class="mx-skills${i === 0 ? ' on' : ''}" data-g="${i}">${l.map((s) => { const u = usedAt(s); return `<li><button type="button" class="mx-skill${u.length ? ' used' : ''}" data-used="${esc(u.join(' · '))}">${esc(s)}</button></li>`; }).join('')}</ul>`).join('\n        ')}
        <p class="mx-used" aria-live="polite"><span class="mx-mono">Dots mark skills used on the job</span></p>
      </section>

      <section class="mx-panel" id="mx-p-words" role="tabpanel" aria-labelledby="mx-tab-words" data-tab="words">
        <p class="mx-intro">From managers, mentors and teammates. Swipe for the next.</p>
        <div class="mx-deck">
          ${P.recs.map(([n, o, q], i) => `<figure class="mx-note" data-i="${i}"><blockquote>${esc(q)}</blockquote><figcaption><span class="mx-av" aria-hidden="true">${initials(n)}</span><span><b>${esc(n)}</b><span class="mx-mono">${esc(o)}</span></span></figcaption></figure>`).join('\n          ')}
        </div>
        <div class="mx-deck-nav"><span class="mx-dots" aria-hidden="true">${P.recs.map(() => '<i></i>').join('')}</span><span class="mx-mono mx-count" aria-live="polite">1 / ${P.recs.length}</span></div>
      </section>
    </div>

    <a class="mx-eras" href="eras.html">
      <span class="mx-eras-st" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span>
      <span class="mx-eras-t"><span class="mx-mono">New</span><b>Try this portfolio in <span class="mx-eras-y" data-years="2000,2003,2007">2000</span></b></span>
      <span class="mx-eras-go">${I.right}</span>
    </a>

    <section class="mx-contact" id="m-contact">
      <button type="button" class="mx-ava" aria-label="Then and now: tap to turn the photo over" aria-pressed="false">
        <span class="mx-ava-in">
          <img class="mx-ava-now" src="assets/images/opt/hero-480.webp" alt="Ajay Sommi" loading="lazy" decoding="async" />
          <img class="mx-ava-then" src="assets/images/offclock/kid-2006-480.webp" alt="Ajay in 2006, at a computer" loading="lazy" decoding="async" />
        </span>
        <span class="mx-ava-tag mx-mono" aria-hidden="true"><b class="mx-now">2026</b><b class="mx-then">2006</b></span>
      </button>
      <h2>20+ years of experience.</h2>
      <p>Let’s not be strangers.</p>
      <div class="mx-mailrow">
        <a class="mx-mail" href="mailto:${P.email}">${I.mail}<span>${P.email}</span></a>
        <button type="button" class="mx-copy" data-copy="${P.email}" aria-label="Copy email address">${I.copy}</button>
      </div>
      <div class="mx-cta mx-cta-3">
        <a class="mx-btn" href="resume.html">${I.resume}Resume</a>
        <a class="mx-btn" href="${P.github}" target="_blank" rel="noopener" aria-label="GitHub">${I.github}</a>
        <a class="mx-btn" href="${P.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn">${I.linkedin}</a>
      </div>
      <p class="mx-facts mx-mono">${esc(P.citizen)} · UF Computer Science · Dec 2026</p>
      <p class="mx-foot mx-mono">© 2026 Ajay Sommi</p>
    </section>

    ${ROLES.map(roleSheet).join('\n    ')}
    ${P.projects.map(projSheet).join('\n    ')}
    <script type="application/json" id="mx-stories-data">${JSON.stringify(P.offclock.map((o) => ({ t: o.title, s: o.steps.map(([s, h, x]) => [mid(s), h, x]) }))).replace(/</g, '\\u003c')}</script>
  </div>

  <!-- A sheet that slides up for a role or a project, and the story viewer. -->
  <div class="mx-scrim" hidden></div>
  <div class="mx-sheet" role="dialog" aria-modal="true" aria-label="Details" hidden><div class="mx-grab" aria-hidden="true"></div><div class="mx-sheet-in"></div></div>
  <div class="mx-viewer" role="dialog" aria-modal="true" aria-label="Story" hidden>
    <div class="mxv-bars" aria-hidden="true"></div>
    <div class="mxv-top"><span class="mxv-title"></span><button type="button" class="mxv-x" aria-label="Close">✕</button></div>
    <div class="mxv-stage"><img alt="" /></div>
    <div class="mxv-cap"><b></b><p></p></div>
    <button type="button" class="mxv-zone mxv-prev" aria-label="Previous"></button><button type="button" class="mxv-zone mxv-next" aria-label="Next"></button>
  </div>
  <!-- mx:end -->`;

const f = path.join(root, 'index.html');
let page = fs.readFileSync(f, 'utf8');
if (page.includes('<!-- mx:start -->')) page = page.replace(/<!-- mx:start -->[\s\S]*?<!-- mx:end -->/, html.trim());
else page = page.replace('  <main id="main">', `  ${html.trim()}\n\n  <main id="main">`);
if (!page.includes('href="mobile.css')) page = page.replace('<link rel="stylesheet" href="minimal.css" />', '<link rel="stylesheet" href="minimal.css" />\n  <link rel="stylesheet" href="mobile.css?v=1" />');
if (!page.includes('src="mobile.js')) page = page.replace('<script src="minimal.js" defer></script>', '<script src="minimal.js" defer></script>\n  <script src="mobile.js?v=1" defer></script>');
fs.writeFileSync(f, page);
console.log('index.html updated', page.length);
