/* ==========================================================================
   Page hop
   Going from one page of the site to another (the resume, say), the page
   fades to its own paper and the Aj mark does a couple of happy hops for
   about a second before the next page opens. Links back to the home page
   are left alone, since it has its own loading screen; so are new tabs,
   downloads, mail links and anything on another site. With reduced motion
   the page simply changes.
   ========================================================================== */
(function hop() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const DANCE = 1200;   // ms the mark dances before the next page opens
  const RESUME = 1400;  // the resume version runs a little longer
  let going = false;

  const css = `
    .hop {
      position: fixed; inset: 0; z-index: 2147483600;
      display: grid; place-items: center;
      background: var(--bg, #121212);
      opacity: 0; transition: opacity .16s ease;
      pointer-events: all;
    }
    .hop.is-on { opacity: 1; }
    .hop svg { width: 96px; height: 90px; overflow: visible; }
    .hop .am-a { fill: var(--ink, #edebe6); }
    .hop .hop-body { transform-box: view-box; transform-origin: 50% 100%; animation: hop-jump ${DANCE}ms linear both; }
    .hop .hop-hook { transform-box: fill-box; transform-origin: 50% 0; animation: hop-hook ${DANCE}ms linear both; }
    .hop .hop-eye { transform-box: fill-box; transform-origin: 50% 100%; animation: hop-eye ${DANCE}ms linear both; }
    /* Two happy hops with real weight: a crouch to gather, a launch that
       stretches, a rise that slows to the top (with a playful tilt) and a
       fall that speeds up, a squash on landing; then a smaller hop tilting
       the other way, another squash, and a blink of the eye to finish. The
       eye and the hook trail the body a moment, so it has some give. */
    @keyframes hop-jump {
      0%   { transform: translateY(0) rotate(0) scale(1, 1); animation-timing-function: cubic-bezier(.3, 0, .6, 1); }
      10%  { transform: translateY(0) rotate(0) scale(1.14, .82); animation-timing-function: cubic-bezier(.2, .8, .4, 1); }
      16%  { transform: translateY(-7px) rotate(-3deg) scale(.9, 1.14); animation-timing-function: cubic-bezier(.25, .6, .5, 1); }
      33%  { transform: translateY(-34px) rotate(-11deg) scale(1, 1); animation-timing-function: cubic-bezier(.5, 0, .8, .4); }
      48%  { transform: translateY(0) rotate(-2deg) scale(.94, 1.08); animation-timing-function: cubic-bezier(.2, .8, .4, 1); }
      52%  { transform: translateY(0) rotate(0) scale(1.2, .76); animation-timing-function: cubic-bezier(.2, .8, .4, 1); }
      57%  { transform: translateY(-5px) rotate(2deg) scale(.92, 1.1); animation-timing-function: cubic-bezier(.25, .6, .5, 1); }
      69%  { transform: translateY(-19px) rotate(9deg) scale(1, 1); animation-timing-function: cubic-bezier(.5, 0, .8, .4); }
      79%  { transform: translateY(0) rotate(1deg) scale(.96, 1.05); animation-timing-function: cubic-bezier(.2, .8, .4, 1); }
      83%  { transform: translateY(0) rotate(0) scale(1.13, .85); animation-timing-function: cubic-bezier(.3, 0, .5, 1); }
      91%  { transform: translateY(-2px) rotate(0) scale(.98, 1.03); animation-timing-function: cubic-bezier(.3, 0, .5, 1); }
      100% { transform: translateY(0) rotate(0) scale(1, 1); }
    }
    @keyframes hop-hook {
      0%, 10% { transform: rotate(0); }
      18%  { transform: rotate(-6deg); }
      33%  { transform: rotate(4deg); }
      52%  { transform: rotate(-7deg); }
      60%  { transform: rotate(5deg); }
      69%  { transform: rotate(-3deg); }
      83%  { transform: rotate(-5deg); }
      92%  { transform: rotate(2deg); }
      100% { transform: rotate(0); }
    }
    @keyframes hop-eye {
      0%   { transform: translateY(0) scale(1); }
      10%  { transform: translateY(1px) scale(1.06, .9); }
      17%  { transform: translateY(2.5px) scale(.94, 1.08); }
      33%  { transform: translateY(-3px) scale(1); }
      48%  { transform: translateY(-1.5px) scale(.96, 1.05); }
      53%  { transform: translateY(1.5px) scale(1.22, .8); }
      58%  { transform: translateY(2px) scale(.95, 1.06); }
      69%  { transform: translateY(-2px) scale(1); }
      84%  { transform: translateY(1.2px) scale(1.15, .85); }
      89%  { transform: translateY(0) scale(1); }
      93%  { transform: translateY(1px) scale(1.12, .12); }
      97%  { transform: translateY(0) scale(1); }
      100% { transform: translateY(0) scale(1); }
    }

    /* The resume version: a little resume sheet pops up beside the mark,
       which bounces from foot to foot like an excited toddler, eye on the
       paper, then takes one big happy jump toward it; the sheet grows to
       fill the screen as the resume opens. */
    .hop-stage { position: relative; display: block; width: 96px; height: 90px; translate: -30px 0; }
    .hop-stage > svg.hop-aj { width: 96px; height: 90px; }
    .hop-r .hop-body { animation: hop-toddler ${RESUME}ms linear both; }
    .hop-r .hop-hook { animation: hop-toddler-hook ${RESUME}ms linear both; }
    .hop-r .hop-eye { animation: hop-toddler-eye ${RESUME}ms linear both; }
    .hop .hop-paper {
      position: absolute; left: calc(100% + 14px); bottom: 2px;
      width: 46px; height: 58px; overflow: visible;
      transform-origin: 50% 100%;
      animation: hop-paper ${RESUME}ms linear both;
    }
    .hop-paper .sheet { fill: color-mix(in oklab, var(--ink, #edebe6) 8%, var(--bg, #121212)); stroke: var(--ink, #edebe6); stroke-width: 2.2; stroke-linejoin: round; }
    .hop-paper .fold { fill: none; stroke: var(--ink, #edebe6); stroke-width: 2.2; stroke-linejoin: round; }
    .hop-paper .line { stroke: var(--ink, #edebe6); stroke-width: 2.4; stroke-linecap: round; opacity: .55; }
    .hop-paper .head { fill: #3d68ff; }
    .hop-paper .dot { fill: #ff6b35; }
    @keyframes hop-toddler {
      0%   { transform: translateY(0) rotate(0) scale(1, 1); animation-timing-function: cubic-bezier(.3, 0, .6, 1); }
      6%   { transform: translateY(0) rotate(0) scale(1.08, .9); animation-timing-function: cubic-bezier(.2, .7, .4, 1); }
      11%  { transform: translateY(-10px) rotate(-6deg) scale(.96, 1.05); animation-timing-function: cubic-bezier(.6, 0, .8, .4); }
      16%  { transform: translateY(0) rotate(-2deg) scale(1.12, .86); animation-timing-function: cubic-bezier(.2, .7, .4, 1); }
      21%  { transform: translateY(-11px) rotate(6deg) scale(.96, 1.05); animation-timing-function: cubic-bezier(.6, 0, .8, .4); }
      26%  { transform: translateY(0) rotate(2deg) scale(1.12, .86); animation-timing-function: cubic-bezier(.2, .7, .4, 1); }
      31%  { transform: translateY(-10px) rotate(-6deg) scale(.96, 1.05); animation-timing-function: cubic-bezier(.6, 0, .8, .4); }
      36%  { transform: translateY(0) rotate(-2deg) scale(1.12, .86); animation-timing-function: cubic-bezier(.2, .7, .4, 1); }
      41%  { transform: translateY(-11px) rotate(6deg) scale(.96, 1.05); animation-timing-function: cubic-bezier(.6, 0, .8, .4); }
      46%  { transform: translateY(0) rotate(2deg) scale(1.12, .86); animation-timing-function: cubic-bezier(.2, .7, .4, 1); }
      51%  { transform: translateY(-9px) rotate(-5deg) scale(.97, 1.04); animation-timing-function: cubic-bezier(.6, 0, .8, .4); }
      56%  { transform: translateY(0) rotate(0) scale(1.16, .8); animation-timing-function: cubic-bezier(.2, .8, .4, 1); }
      62%  { transform: translateY(-6px) rotate(4deg) scale(.9, 1.13); animation-timing-function: cubic-bezier(.25, .6, .5, 1); }
      71%  { transform: translateY(-28px) rotate(10deg) scale(1, 1); animation-timing-function: cubic-bezier(.5, 0, .8, .4); }
      80%  { transform: translateY(0) rotate(2deg) scale(.95, 1.07); animation-timing-function: cubic-bezier(.2, .8, .4, 1); }
      84%  { transform: translateY(0) rotate(0) scale(1.18, .8); animation-timing-function: cubic-bezier(.3, 0, .5, 1); }
      91%  { transform: translateY(-3px) rotate(0) scale(.97, 1.03); animation-timing-function: cubic-bezier(.3, 0, .5, 1); }
      100% { transform: translateY(0) rotate(0) scale(1, 1); }
    }
    @keyframes hop-toddler-hook {
      0%, 6% { transform: rotate(0); }
      11% { transform: rotate(5deg); } 16% { transform: rotate(-4deg); }
      21% { transform: rotate(-5deg); } 26% { transform: rotate(4deg); }
      31% { transform: rotate(5deg); } 36% { transform: rotate(-4deg); }
      41% { transform: rotate(-5deg); } 46% { transform: rotate(4deg); }
      56% { transform: rotate(-6deg); } 71% { transform: rotate(4deg); }
      84% { transform: rotate(-6deg); } 92% { transform: rotate(2deg); }
      100% { transform: rotate(0); }
    }
    @keyframes hop-toddler-eye {
      0%   { transform: translate(0, 0) scale(1); }
      10%  { transform: translate(1.6px, 1px) scale(1); }
      16%, 26%, 36%, 46% { transform: translate(1.8px, 1.4px) scale(1.12, .88); }
      21%, 31%, 41% { transform: translate(1.8px, -1.6px) scale(1); }
      56%  { transform: translate(1.8px, 1.4px) scale(1.15, .85); }
      71%  { transform: translate(2px, -2.6px) scale(1); }
      84%  { transform: translate(1.8px, 1.4px) scale(1.18, .82); }
      89%  { transform: translate(1.4px, 0) scale(1); }
      93%  { transform: translate(1.4px, 1px) scale(1.12, .12); }
      97%, 100% { transform: translate(1px, 0) scale(1); }
    }
    @keyframes hop-paper {
      0%, 14% { opacity: 0; transform: translateY(10px) rotate(-14deg) scale(.2); }
      22%  { opacity: 1; transform: translateY(-6px) rotate(6deg) scale(1.12); animation-timing-function: cubic-bezier(.3, 0, .5, 1); }
      28%  { transform: translateY(0) rotate(-3deg) scale(1); }
      36%  { transform: translateY(-3px) rotate(4deg) scale(1); }
      44%  { transform: translateY(0) rotate(-3deg) scale(1); }
      52%  { transform: translateY(-3px) rotate(3deg) scale(1); }
      60%  { transform: translateY(0) rotate(0) scale(1); }
      74%  { transform: translateY(-4px) rotate(-4deg) scale(1.05); }
      84%  { opacity: 1; transform: translateY(0) rotate(0) scale(1); animation-timing-function: cubic-bezier(.6, 0, .9, .5); }
      100% { opacity: 0; transform: translate(-70px, -40px) rotate(0) scale(14); }
    }`;

  const mark = `<svg viewBox="9 8.5 45 42" aria-hidden="true" focusable="false"><g class="hop-body">
      <path class="am-a" d="M10.29 44.57 L30.86 9.90 L43.20 32.70 L43.20 36.19 L36.19 36.19 L30.86 26.67 L20.19 44.57Z"/>
      <path class="hop-hook" d="M26.25 36.19 A13.16 13.16 0 0 0 52.57 36.19 L43.83 36.19 A4.42 4.42 0 0 1 34.99 36.19Z" fill="#ff6b35"/>
      <rect x="43.83" y="24.60" width="8.74" height="11.79" fill="#3d68ff"/>
      <circle class="hop-eye" cx="48.20" cy="17.40" r="5.60" fill="#3d68ff"/>
    </g></svg>`;

  // A little resume: a sheet with a folded corner, a coloured header and a
  // few lines of text.
  const paper = `<svg class="hop-paper" viewBox="0 0 46 58" aria-hidden="true" focusable="false">
      <path class="sheet" d="M4 3h26l12 12v38a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/>
      <path class="fold" d="M30 3v10a2 2 0 0 0 2 2h10"/>
      <rect class="head" x="8" y="10" width="14" height="5" rx="2.5"/>
      <circle class="dot" cx="33" cy="25" r="3"/>
      <line class="line" x1="8" y1="25" x2="26" y2="25"/>
      <line class="line" x1="8" y1="33" x2="38" y2="33"/>
      <line class="line" x1="8" y1="40" x2="38" y2="40"/>
      <line class="line" x1="8" y1="47" x2="30" y2="47"/>
    </svg>`;

  const go = (url) => {
    if (going) return;
    if (reduce.matches) { location.href = url; return; }
    going = true;
    if (!document.getElementById('hopStyle')) {
      const st = document.createElement('style');
      st.id = 'hopStyle';
      st.textContent = css;
      document.head.appendChild(st);
    }
    const veil = document.createElement('div');
    veil.className = 'hop';
    veil.setAttribute('aria-hidden', 'true');
    const forResume = /resume\.html$/i.test(new URL(url, location.href).pathname);
    if (forResume) {
      veil.classList.add('hop-r');
      veil.innerHTML = `<span class="hop-stage">${mark.replace('<svg ', '<svg class="hop-aj" ')}${paper}</span>`;
    } else {
      veil.innerHTML = mark;
    }
    document.body.appendChild(veil);
    requestAnimationFrame(() => requestAnimationFrame(() => veil.classList.add('is-on')));
    setTimeout(() => { location.href = url; }, (forResume ? RESUME : DANCE) + 80);
  };
  window.hopTo = go;

  // Coming back with the back button restores this page from the cache,
  // dance and all; clear it away.
  addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    going = false;
    document.querySelectorAll('.hop').forEach((n) => n.remove());
  });

  const isHome = (u) => /\/(index\.html)?$/.test(u.pathname);

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    let u;
    try { u = new URL(a.getAttribute('href'), location.href); } catch { return; }
    if (u.origin !== location.origin || !/^https?:$/.test(u.protocol)) return;
    if (u.pathname === location.pathname) return;          // same page, an anchor
    if (isHome(u) || /\.pdf$/i.test(u.pathname)) return;   // home has its own loader
    e.preventDefault();
    go(u.href);
  });
})();
