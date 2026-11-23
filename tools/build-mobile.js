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
const { STORY, ABOUT, PROJ_TEXT } = require('./copy.js');
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
// Each logo comes in two colourings: light lettering for the dark themes,
// dark lettering for daylight. The page shows whichever suits.
const LOGO = { rfa: ['roboticsforall', 'roboticsforall'], fics: ['fics', 'fics-light'], toyota: ['toyota', 'toyota-light'], jm: ['jm-family', 'jm-family-light'], hunter: ['hunter', 'hunter-light'], adt: ['adt', 'adt'], shiva: ['shiva', 'shiva'], rjax: ['renaissance-jax', 'renaissance-jax'] };
// For these the corner copy is just the mark (the emblem, the tree), not the wordmark.
const MARKONLY = { toyota: ['toyota-emblem', 'toyota-emblem'], jm: ['jm-tree', 'jm-tree'] };
// The same colour each stop wears on the desktop's path.
const TINT = { rjax: '#2fae5a', shiva: '#f39c12', rfa: '#f2b705', fics: '#fa4616', toyota: '#eb0a1e', jm: '#00857c', hunter: '#b5121b', adt: '#1f6fd1' };
const pic = ([d, l], cls = '') => d === l
  ? `<img class="${cls}" src="assets/logos/opt/${d}.webp" alt="" loading="lazy" decoding="async" />`
  : `<img class="${cls} lg-d" src="assets/logos/opt/${d}.webp" alt="" loading="lazy" decoding="async" /><img class="${cls} lg-l" src="assets/logos/opt/${l}.webp" alt="" loading="lazy" decoding="async" />`;
// The mark from the top bar, drawn large, its four pieces separate so they can move.
const MARK = `<svg class="mx-aj" viewBox="9 8.5 45 42" aria-hidden="true" focusable="false"><path class="mx-aj-a" d="M10.29 44.57 L30.86 9.90 L43.20 32.70 L43.20 36.19 L36.19 36.19 L30.86 26.67 L20.19 44.57Z"/><path class="mx-aj-u" d="M26.25 36.19 A13.16 13.16 0 0 0 52.57 36.19 L43.83 36.19 A4.42 4.42 0 0 1 34.99 36.19Z"/><rect class="mx-aj-i" x="43.83" y="24.60" width="8.74" height="11.79"/><circle class="mx-aj-d" cx="48.20" cy="17.40" r="5.60"/></svg>`;

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
/* One soft icon per tab, in the site's own drawing: rounded strokes, with a
   quiet fill that warms up when the tab is chosen. */
const ic = (fill, line) => `<svg class="mx-ic" viewBox="0 0 24 24" aria-hidden="true"><g class="mx-ic-f">${fill}</g><g class="mx-ic-l" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${line}</g></svg>`;
const SHAPE = {
  // A road with a start and a pin.
  path: ic('<circle cx="17" cy="7.5" r="4.2"/>', '<path d="M5.5 19.5h6.2a3.3 3.3 0 0 0 0-6.6H9.6a3.3 3.3 0 0 1 0-6.6"/><circle cx="5.5" cy="19.5" r="1.3"/><path d="M17 12.6s-3.6-3-3.6-5.4a3.6 3.6 0 0 1 7.2 0c0 2.4-3.6 5.4-3.6 5.4z"/><circle cx="17" cy="7.2" r="1"/>'),
  // A window with code in it.
  projects: ic('<rect x="3.5" y="5" width="17" height="14" rx="3.2"/>', '<rect x="3.5" y="5" width="17" height="14" rx="3.2"/><path d="M9.6 10.4 7.6 12.4l2 2M14.4 10.4l2 2-2 2"/>'),
  // A screwdriver: repairs and builds, off the clock.
  life: ic('<circle cx="12" cy="12" r="7.5"/>', '<path d="M14.6 4.8a3.4 3.4 0 0 0-4.4 4.2L4.6 14.6a1.9 1.9 0 0 0 2.7 2.7l5.6-5.6a3.4 3.4 0 0 0 4.2-4.4l-2 2-2.1-.4-.4-2.1z"/>'),
  // Stacked layers.
  skills: ic('<path d="M12 4.5 20 9l-8 4.5L4 9z"/>', '<path d="M12 4.5 20 9l-8 4.5L4 9z"/><path d="m4 13 8 4.5 8-4.5"/><path d="m4 16.6 8 4.4 8-4.4" opacity=".55"/>'),
  // A speech bubble with a quote in it.
  words: ic('<path d="M5 5.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4.5 3v-3H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z"/>', '<path d="M5 5.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4.5 3v-3H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z"/><path d="M8.6 12.8c0-1.6.6-2.6 1.8-3.1M12.6 12.8c0-1.6.6-2.6 1.8-3.1"/>')
};
const TABS = [['path', 'Path', 'experience'], ['projects', 'Projects', 'projects'], ['life', 'Life', 'offclock'], ['skills', 'Skills', 'skills'], ['words', 'Words', 'recs']];
const langs = [...new Set(P.projects.map((p) => p.lang))];

const logoOf = (e) => LOGO[e.id] ? `<span class="mx-logo">${pic(LOGO[e.id])}</span>` : `<span class="mx-logo mx-logo-t" aria-hidden="true">${esc(initials(e.short))}</span>`;
/* A stop on the path: the logo glowing in its own colour, and a much larger,
   fainter copy of it tipped into the card's corner, the way the Gators mark
   peers into the education card on the desktop. */
const stop = (e, i) => {
  const L = LOGO[e.id];
  const face = L ? `<span class="mx-st-logo">${pic(L)}</span>` : `<span class="mx-st-logo mx-st-mono" aria-hidden="true">${esc(initials(e.short))}</span>`;
  const wm = MARKONLY[e.id] ? `<span class="mx-st-wm mx-st-wm-mark" aria-hidden="true">${pic(MARKONLY[e.id])}</span>` : L ? `<span class="mx-st-wm" aria-hidden="true">${pic(L)}</span>` : `<span class="mx-st-wm mx-st-wm-t" aria-hidden="true">${esc(initials(e.short))}</span>`;
  return `<li style="--tint:${TINT[e.id] || 'var(--accent)'};--k:${i}"><button type="button" class="mx-stop" data-sheet="mx-role-${e.id}">
            <span class="mx-st-glow" aria-hidden="true"></span>${wm}
            <span class="mx-st-top">${face}<span class="mx-st-yr" aria-label="${e.year}">’${String(e.year).slice(2)}</span></span>
            <span class="mx-st-t"><b>${esc(e.org)}</b><span>${esc(e.role)}</span><span class="mx-st-where">${esc(e.where)}</span></span>
          </button></li>`;
};

const roleSheet = (e) => {
  const [a, b] = lead(STORY[e.id] || e.text);
  return `<template id="mx-role-${e.id}">
    <header class="mxs-head">${logoOf(e)}<div><p class="mx-mono">${esc(e.when)}</p><h3>${esc(e.org)}</h3><p class="mxs-sub">${esc(e.role)}</p><p class="mxs-sub mxs-where">${esc(e.where)}</p></div></header>
    ${ABOUT[e.id] ? `<p class="mxs-about">${esc(ABOUT[e.id])}</p>` : ''}
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
    <p class="mxs-text">${esc(PROJ_TEXT[p.id] || p.text)}</p>
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
      <span class="mx-face"><img src="${P.photo}" alt="Ajay Sommi" decoding="async" /></span>
      <h1 class="mx-name"><span class="mx-hi">Hi, I’m</span> <span class="mx-me">Ajay.</span></h1>
      <p class="mx-line">I build software that feels thoughtful, reliable and good to use.</p>
      <button type="button" class="mx-cue" aria-label="Scroll down"><i aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></i></button>
    </section>

    <div class="mx-pager">
      <section class="mx-panel" id="mx-p-path" role="tabpanel" aria-labelledby="mx-tab-path" data-tab="path">
        <h2 class="mx-ph">The path so far</h2>
        <p class="mx-intro">Where I’ve worked so far, newest first. Tap one for the story.</p>
        <ol class="mx-tl">
          ${ROLES.map(stop).join('\n          ')}
        </ol>
        <div class="mx-edu" style="--tint:#fa4616">
          <img class="mx-edu-wm" src="assets/images/uf-gator-320.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" />
          <p class="mx-mono">Education · ${esc(P.education.when)}</p><b>${esc(P.education.school)}</b><span>${esc(P.education.degree)}, with the UF AI Certificate</span>
        </div>
      </section>

      <section class="mx-panel" id="mx-p-projects" role="tabpanel" aria-labelledby="mx-tab-projects" data-tab="projects">
        <h2 class="mx-ph">Things I’ve built</h2>
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
        <h2 class="mx-ph">Off the clock</h2>
        <p class="mx-intro">Repairs, teardowns and builds, off the clock. Tap a story.</p>
        <div class="mx-stories">
          ${P.offclock.map((o, i) => `<button type="button" class="mx-story-b" data-story="${i}" style="--i:${i}">
            <span class="mx-ring"><img src="${o.cover}" alt="" loading="lazy" decoding="async" /></span>
            <span class="mx-story-t"><span class="mx-story-l">${esc(o.title)}</span><span class="mx-story-s">${esc(String(o.steps[0][1]).replace(/\.$/, ''))} · ${o.steps.length} photos</span></span>${I.chev}
          </button>`).join('')}
        </div>
        <figure class="mx-quote"><blockquote>“${esc(P.quote)}”</blockquote><figcaption class="mx-mono">What keeps me building</figcaption></figure>
      </section>

      <section class="mx-panel" id="mx-p-skills" role="tabpanel" aria-labelledby="mx-tab-skills" data-tab="skills">
        <h2 class="mx-ph">Skills</h2>
        <p class="mx-intro">Tap a skill to see where I’ve used it.</p>
        <div class="mx-groups" role="group" aria-label="Skill groups">${P.skills.map(([g], i) => `<button type="button" aria-pressed="${i === 0}" data-g="${i}">${esc(g.replace(', Data & Databases', ' & Data').replace(' & Libraries', '').replace(' & Integration', '').replace(' & Tooling', ''))}</button>`).join('')}</div>
        ${P.skills.map(([, l], i) => `<ul class="mx-skills${i === 0 ? ' on' : ''}" data-g="${i}">${l.map((s) => { const u = usedAt(s); return `<li><button type="button" class="mx-skill${u.length ? ' used' : ''}" data-used="${esc(u.join(' · '))}">${esc(s)}</button></li>`; }).join('')}</ul>`).join('\n        ')}
        <p class="mx-used" aria-live="polite"><span class="mx-mono">Highlighted skills are ones I’ve used on the job</span></p>
      </section>

      <section class="mx-panel" id="mx-p-words" role="tabpanel" aria-labelledby="mx-tab-words" data-tab="words">
        <h2 class="mx-ph">Kind words</h2>
        <p class="mx-intro">From managers, mentors and teammates. Swipe left for the next, right to go back.</p>
        <div class="mx-deck">
          ${P.recs.map(([n, o, q], i) => `<figure class="mx-note" data-i="${i}"><blockquote>${esc(q)}</blockquote><figcaption><span class="mx-av" aria-hidden="true">${initials(n)}</span><span><b>${esc(n)}</b><span class="mx-mono">${esc(o)}</span></span></figcaption></figure>`).join('\n          ')}
        </div>
        <div class="mx-deck-nav"><span class="mx-dots" aria-hidden="true">${P.recs.map(() => '<i></i>').join('')}</span><span class="mx-mono mx-count" aria-live="polite">1 / ${P.recs.length}</span></div>
      </section>
    </div>

    <section class="mx-contact" id="m-contact">
      <div class="mx-prints">
        <button type="button" class="mx-print" aria-label="Ajay as a kid, at a computer. Tap to see it bigger"><img src="assets/images/offclock/kid-2006-480.webp" alt="Ajay as a kid, at a computer" loading="lazy" decoding="async" /></button>
      </div>
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
    </section>
    <a class="mx-tt" href="eras.html"><span class="mx-tt-i"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 1h7v1.2c0 1.6-1.4 2.6-2.6 3.8 1.2 1.2 2.6 2.2 2.6 3.8V11h-7V9.8c0-1.6 1.4-2.6 2.6-3.8C3.9 4.8 2.5 3.8 2.5 2.2Z" fill="currentColor"/></svg></span><span>Step into the time machine</span></a>
    <p class="mx-psst"><span class="mx-psst-i" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5V15H4ZM2 17h20l-1 2H3Z" fill="currentColor"/></svg></span><span><b>Psst.</b> This page has another side to it, a place you can wander around in. It only opens on a computer.</span></p>
    <p class="mx-foot mx-mono">© 2026 Ajay Sommi</p>

    <nav class="mx-tabs" id="mx-tabs" aria-label="Sections" role="tablist">
      ${TABS.map(([k, t], i) => `<button type="button" role="tab" id="mx-tab-${k}" aria-controls="mx-p-${k}" aria-selected="${i === 0}" data-tab="${k}">${SHAPE[k]}<span>${t}</span></button>`).join('')}
      <i class="mx-ink" aria-hidden="true"></i>
    </nav>

    ${ROLES.map(roleSheet).join('\n    ')}
    ${P.projects.map(projSheet).join('\n    ')}
    <script type="application/json" id="mx-stories-data">${JSON.stringify(P.offclock.map((o) => ({ t: o.title, s: o.steps.map(([s, h, x]) => [mid(s), h, x]) }))).replace(/</g, '\\u003c')}</script>
  </div>

  <!-- A sheet that slides up for a role or a project, and the story viewer. -->
  <div class="mx-scrim" hidden></div>
  <div class="mx-sheet" role="dialog" aria-modal="true" aria-label="Details" hidden><div class="mx-sheet-bar"><div class="mx-grab" aria-hidden="true"></div><button type="button" class="mx-sheet-close ui-close" aria-label="Close details"></button></div><div class="mx-sheet-in"></div></div>
  <div class="mx-viewer" role="dialog" aria-modal="true" aria-label="Story" hidden>
    <div class="mxv-bars" aria-hidden="true"></div>
    <div class="mxv-top"><span class="mxv-title"></span><button type="button" class="mxv-x ui-close" aria-label="Close"></button></div>
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
