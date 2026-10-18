/* ==========================================================================
   Page hop
   Going from one page of the site to another, the page fades to its own
   paper and the Aj mark plays a short scene before the next page opens.
   For the resume, it quickly puts a resume together beside itself, shifting
   from foot to foot with excitement as the lines get written, takes a big
   happy jump, and hands the sheet over; the resume page then fades in from
   it. Any other page gets a couple of happy hops. Links back to the home
   page are left alone, since it has its own loading screen; so are new
   tabs, downloads, mail links and anything on another site. With reduced
   motion the page simply changes.

   The jumps move an HTML wrapper around the mark, never the shapes inside
   its SVG: an SVG trims whatever leaves its own box in Safari, which cut the
   mark off at the top of a jump. The SVGs themselves carry a margin around
   the drawing so the small moves inside (the eye, the hook) have room too.
   ========================================================================== */
(function hop() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const DANCE = 1200;    // ms of the plain hops
  const RESUME = 2200;   // ms of the resume scene
  let going = false;

  // Rising slows to the top, falling speeds up: gravity.
  const UP = 'cubic-bezier(.2, .65, .4, 1)';
  const DOWN = 'cubic-bezier(.6, 0, .8, .35)';
  const SNAP = 'cubic-bezier(.3, 0, .5, 1)';

  const css = `
    .hop {
      position: fixed; inset: 0; z-index: 2147483600;
      display: grid; place-items: center;
      background: var(--bg, #121212);
      opacity: 0; transition: opacity .16s ease;
      pointer-events: all;
    }
    .hop.is-on { opacity: 1; }
    .hop svg { display: block; overflow: visible; }
    .hop .am-a { fill: var(--ink, #edebe6); }
    .hop .hop-mark { display: block; transform-origin: 50% 92%; will-change: transform; }
    .hop .hop-mark svg { width: 122px; height: 115px; }
    .hop .hop-hook { transform-box: fill-box; transform-origin: 50% 0; }
    .hop .hop-eye { transform-box: fill-box; transform-origin: 50% 100%; }

    /* ---- the plain version: two happy hops ---- */
    .hop-p .hop-mark { animation: hop-jump ${DANCE}ms linear both; }
    .hop-p .hop-hook { animation: hop-hook ${DANCE}ms linear both; }
    .hop-p .hop-eye { animation: hop-eye ${DANCE}ms linear both; }
    @keyframes hop-jump {
      0%   { transform: translateY(0) rotate(0) scale(1, 1); animation-timing-function: ${SNAP}; }
      10%  { transform: translateY(0) rotate(0) scale(1.14, .82); animation-timing-function: ${UP}; }
      16%  { transform: translateY(-15px) rotate(-3deg) scale(.9, 1.14); animation-timing-function: ${UP}; }
      33%  { transform: translateY(-72px) rotate(-11deg) scale(1, 1); animation-timing-function: ${DOWN}; }
      48%  { transform: translateY(0) rotate(-2deg) scale(.94, 1.08); animation-timing-function: ${SNAP}; }
      52%  { transform: translateY(0) rotate(0) scale(1.2, .76); animation-timing-function: ${UP}; }
      57%  { transform: translateY(-11px) rotate(2deg) scale(.92, 1.1); animation-timing-function: ${UP}; }
      69%  { transform: translateY(-40px) rotate(9deg) scale(1, 1); animation-timing-function: ${DOWN}; }
      79%  { transform: translateY(0) rotate(1deg) scale(.96, 1.05); animation-timing-function: ${SNAP}; }
      83%  { transform: translateY(0) rotate(0) scale(1.13, .85); animation-timing-function: ${SNAP}; }
      91%  { transform: translateY(-4px) rotate(0) scale(.98, 1.03); animation-timing-function: ${SNAP}; }
      100% { transform: translateY(0) rotate(0) scale(1, 1); }
    }
    @keyframes hop-hook {
      0%, 10% { transform: rotate(0); } 18% { transform: rotate(-6deg); } 33% { transform: rotate(4deg); }
      52% { transform: rotate(-7deg); } 60% { transform: rotate(5deg); } 69% { transform: rotate(-3deg); }
      83% { transform: rotate(-5deg); } 92% { transform: rotate(2deg); } 100% { transform: rotate(0); }
    }
    @keyframes hop-eye {
      0% { transform: translateY(0) scale(1); }
      10% { transform: translateY(1px) scale(1.06, .9); }
      17% { transform: translateY(2.5px) scale(.94, 1.08); }
      33% { transform: translateY(-3px) scale(1); }
      48% { transform: translateY(-1.5px) scale(.96, 1.05); }
      53% { transform: translateY(1.5px) scale(1.22, .8); }
      58% { transform: translateY(2px) scale(.95, 1.06); }
      69% { transform: translateY(-2px) scale(1); }
      84% { transform: translateY(1.2px) scale(1.15, .85); }
      89% { transform: translateY(0) scale(1); }
      93% { transform: translateY(1px) scale(1.12, .12); }
      97%, 100% { transform: translateY(0) scale(1); }
    }

    /* ---- the resume version ----
       The sheet pops into being beside the mark, flat like the mark itself,
       and its lines get written in one after another while the mark shifts
       its weight from foot to foot, a quick tap to the left, then to the
       right, eye on the work. Then one big jump, and the sheet is handed
       over to the middle of the screen as the page changes.
       The parts carry their own inertia: the eye trails the body (it sinks
       as the body lifts, rises as it drops and settles a beat after each
       landing, and lags behind each sideways shift), and the hook swings
       like a pendulum against the sideways motion. Squashes are small,
       the size a real hop would make, not a cartoon's. */
    .hop-stage { position: relative; display: flex; align-items: flex-end; gap: 6px; translate: -10px 0; }
    .hop-r .hop-mark { animation: hop-tap ${RESUME}ms linear both; }
    .hop-r .hop-hook { animation: hop-tap-hook ${RESUME}ms linear both; }
    .hop-r .hop-eye { animation: hop-tap-eye ${RESUME}ms linear both; }
    .hop .hop-sheet { display: block; margin-bottom: 12px; transform-origin: 50% 100%; will-change: transform; animation: hop-sheet ${RESUME}ms linear both; }
    .hop .hop-sheet svg { width: 58px; height: 70px; }
    .hop-sheet .paper { fill: var(--ink, #edebe6); }
    .hop-sheet .fold { fill: color-mix(in oklab, var(--ink, #edebe6) 55%, var(--bg, #121212)); }
    .hop-sheet .ln { fill: var(--bg, #121212); transform-box: fill-box; transform-origin: 0 50%; transform: scaleX(0); }
    .hop-sheet .ln.title { fill: #3d68ff; }
    .hop-sheet .ln.dot { fill: #ff6b35; transform-origin: 50% 50%; transform: scale(0); }
    .hop-sheet .l1 { animation: hop-write1 ${RESUME}ms linear both; }
    .hop-sheet .l2 { animation: hop-write2 ${RESUME}ms linear both; }
    .hop-sheet .l3 { animation: hop-write3 ${RESUME}ms linear both; }
    .hop-sheet .l4 { animation: hop-write4 ${RESUME}ms linear both; }
    .hop-sheet .l5 { animation: hop-write5 ${RESUME}ms linear both; }

    @keyframes hop-tap {
      0%   { transform: translate(0, 0) rotate(0) scale(1, 1); animation-timing-function: ${SNAP}; }
      5%   { transform: translate(0, 0) rotate(0) scale(1.05, .95); animation-timing-function: ${UP}; }
      10%  { transform: translate(-5px, -12px) rotate(-4deg) scale(.985, 1.02); animation-timing-function: ${DOWN}; }
      15%  { transform: translate(-7px, 0) rotate(-2deg) scale(1.05, .95); animation-timing-function: ${UP}; }
      21%  { transform: translate(3px, -11px) rotate(4deg) scale(.985, 1.02); animation-timing-function: ${DOWN}; }
      27%  { transform: translate(7px, 0) rotate(2deg) scale(1.05, .95); animation-timing-function: ${UP}; }
      33%  { transform: translate(-3px, -11px) rotate(-4deg) scale(.985, 1.02); animation-timing-function: ${DOWN}; }
      39%  { transform: translate(-7px, 0) rotate(-2deg) scale(1.05, .95); animation-timing-function: ${UP}; }
      45%  { transform: translate(3px, -11px) rotate(4deg) scale(.985, 1.02); animation-timing-function: ${DOWN}; }
      51%  { transform: translate(7px, 0) rotate(2deg) scale(1.05, .95); animation-timing-function: ${SNAP}; }
      57%  { transform: translate(0, 0) rotate(0) scale(1.01, .99); animation-timing-function: ${SNAP}; }
      62%  { transform: translate(0, 0) rotate(0) scale(1.12, .86); animation-timing-function: ${UP}; }
      66%  { transform: translate(0, -22px) rotate(-2deg) scale(.93, 1.08); animation-timing-function: ${UP}; }
      75%  { transform: translate(0, -80px) rotate(-6deg) scale(1, 1); animation-timing-function: ${DOWN}; }
      84%  { transform: translate(0, 0) rotate(-1deg) scale(.97, 1.04); animation-timing-function: ${SNAP}; }
      87%  { transform: translate(0, 0) rotate(0) scale(1.13, .87); animation-timing-function: ${UP}; }
      92%  { transform: translate(0, -8px) rotate(0) scale(.985, 1.015); animation-timing-function: ${DOWN}; }
      96%  { transform: translate(0, 0) rotate(0) scale(1.025, .975); animation-timing-function: ${SNAP}; }
      100% { transform: translate(0, 0) rotate(0) scale(1, 1); }
    }
    /* Swings against the sideways motion, a beat behind it. */
    @keyframes hop-tap-hook {
      0%, 5% { transform: rotate(0); }
      12% { transform: rotate(5deg); } 18% { transform: rotate(1deg); }
      24% { transform: rotate(-5deg); } 30% { transform: rotate(-1deg); }
      36% { transform: rotate(5deg); } 42% { transform: rotate(1deg); }
      48% { transform: rotate(-5deg); } 54% { transform: rotate(-1deg); }
      60% { transform: rotate(2deg); } 68% { transform: rotate(-3deg); }
      78% { transform: rotate(2deg); } 88% { transform: rotate(-4deg); }
      94% { transform: rotate(1.5deg); } 100% { transform: rotate(0); }
    }
    /* Looks right at the sheet throughout (+1.5); on top of that it trails
       the body: down as it lifts, up as it drops, a settle after landing. */
    @keyframes hop-tap-eye {
      0%   { transform: translate(0, 0) scale(1); }
      5%   { transform: translate(1.2px, .6px) scale(1.03, .97); }
      10%  { transform: translate(2.6px, 1.4px) scale(1); }
      15%  { transform: translate(.8px, -.6px) scale(1.06, .94); }
      21%  { transform: translate(.4px, 1.4px) scale(1); }
      27%  { transform: translate(2.2px, -.6px) scale(1.06, .94); }
      33%  { transform: translate(2.6px, 1.4px) scale(1); }
      39%  { transform: translate(.8px, -.6px) scale(1.06, .94); }
      45%  { transform: translate(.4px, 1.4px) scale(1); }
      51%  { transform: translate(2.2px, -.6px) scale(1.06, .94); }
      57%  { transform: translate(1.5px, 0) scale(1); }
      62%  { transform: translate(1.5px, .8px) scale(1.05, .95); }
      66%  { transform: translate(1.5px, 2.2px) scale(.97, 1.04); }
      75%  { transform: translate(1.5px, -1.8px) scale(1); }
      84%  { transform: translate(1.5px, -1.2px) scale(.98, 1.02); }
      87%  { transform: translate(1.5px, 1.4px) scale(1.12, .88); }
      91%  { transform: translate(1.5px, -.4px) scale(1); }
      94%  { transform: translate(1.5px, .9px) scale(1.12, .12); }
      97%, 100% { transform: translate(1px, 0) scale(1); }
    }
    @keyframes hop-sheet {
      0%, 9% { opacity: 0; transform: translate(0, 8px) rotate(-12deg) scale(.1); }
      15%  { opacity: 1; transform: translate(0, -6px) rotate(4deg) scale(1.1); animation-timing-function: ${SNAP}; }
      20%  { transform: translate(0, 2px) rotate(-2deg) scale(.97); animation-timing-function: ${SNAP}; }
      25%  { transform: translate(0, 0) rotate(.5deg) scale(1.01); }
      30%, 57% { transform: translate(0, 0) rotate(0) scale(1); }
      62%  { transform: translate(0, 1px) rotate(0) scale(1.02, .98); }
      75%  { transform: translate(0, -5px) rotate(-2deg) scale(1); }
      86%  { opacity: 1; transform: translate(0, 0) rotate(0) scale(1); animation-timing-function: cubic-bezier(.5, 0, .2, 1); }
      100% { opacity: 1; transform: translate(-64px, -40px) rotate(0) scale(2.3); }
    }
    @keyframes hop-write1 { 0%, 24% { transform: scaleX(0); animation-timing-function: ${UP}; } 29%, 100% { transform: scaleX(1); } }
    @keyframes hop-write2 { 0%, 31% { transform: scaleX(0); animation-timing-function: ${UP}; } 36%, 100% { transform: scaleX(1); } }
    @keyframes hop-write3 { 0%, 38% { transform: scaleX(0); animation-timing-function: ${UP}; } 44%, 100% { transform: scaleX(1); } }
    @keyframes hop-write4 { 0%, 45% { transform: scaleX(0); animation-timing-function: ${UP}; } 50%, 100% { transform: scaleX(1); } }
    @keyframes hop-write5 { 0%, 51% { transform: scale(0); animation-timing-function: cubic-bezier(.34, 1.56, .64, 1); } 56%, 100% { transform: scale(1); } }`;

  // The mark, with a margin of room around the drawing (viewBox padded by 6).
  const mark = `<span class="hop-mark"><svg viewBox="3 2.5 57 54" aria-hidden="true" focusable="false">
      <path class="am-a" d="M10.29 44.57 L30.86 9.90 L43.20 32.70 L43.20 36.19 L36.19 36.19 L30.86 26.67 L20.19 44.57Z"/>
      <path class="hop-hook" d="M26.25 36.19 A13.16 13.16 0 0 0 52.57 36.19 L43.83 36.19 A4.42 4.42 0 0 1 34.99 36.19Z" fill="#ff6b35"/>
      <rect x="43.83" y="24.60" width="8.74" height="11.79" fill="#3d68ff"/>
      <circle class="hop-eye" cx="48.20" cy="17.40" r="5.60" fill="#3d68ff"/>
    </svg></span>`;

  // A flat sheet in the mark's own colours: no outline or shading, a folded
  // corner, a blue title, lines that get written in, and an orange dot.
  const sheet = `<span class="hop-sheet"><svg viewBox="-6 -6 58 70" aria-hidden="true" focusable="false">
      <path class="paper" d="M5 2h24l13 13v40a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3Z"/>
      <path class="fold" d="M29 2v10a3 3 0 0 0 3 3h10Z"/>
      <rect class="ln title l1" x="8" y="10" width="15" height="5" rx="2.5"/>
      <rect class="ln l2" x="8" y="24" width="20" height="4" rx="2"/>
      <rect class="ln l3" x="8" y="33" width="28" height="4" rx="2"/>
      <rect class="ln l4" x="8" y="42" width="22" height="4" rx="2"/>
      <circle class="ln dot l5" cx="34" cy="26" r="3.2"/>
    </svg></span>`;

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
    const forResume = /resume\.html$/i.test(new URL(url, location.href).pathname);
    const veil = document.createElement('div');
    veil.className = `hop ${forResume ? 'hop-r' : 'hop-p'}`;
    veil.setAttribute('aria-hidden', 'true');
    veil.innerHTML = forResume ? `<span class="hop-stage">${mark}${sheet}</span>` : mark;
    document.body.appendChild(veil);
    requestAnimationFrame(() => requestAnimationFrame(() => veil.classList.add('is-on')));
    // The next page fades in from the paper rather than cutting in.
    try { sessionStorage.setItem('hop-arrive', '1'); } catch {}
    setTimeout(() => { location.href = url; }, (forResume ? RESUME : DANCE) + 60);
  };
  window.hopTo = go;

  // Coming back with the back button restores this page from the cache,
  // scene and all; clear it away.
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
