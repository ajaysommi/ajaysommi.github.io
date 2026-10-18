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
  const RESUME = 2000;   // ms of the resume scene
  const SOFT = 1700;     // the resume scene without the throw
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
    .hop .hop-mark { display: block; transform-origin: 50% 92%; will-change: transform; backface-visibility: hidden; }
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
       over in a throw: the mark turns toward the sheet and loads up, then
       springs it forward. The sheet flies at the screen, its drawing giving
       way to a plain page that lands exactly where the real document will
       be; the resume page opens with that page in place and dissolves it,
       so the document fades in underneath.
       The parts carry their own inertia: the eye trails the body (it sinks
       as the body lifts, rises as it drops and settles a beat after each
       landing, and lags behind each sideways shift), and the hook swings
       like a pendulum against the sideways motion. Squashes are small,
       the size a real hop would make, not a cartoon's. */
    .hop-stage { position: relative; display: flex; align-items: flex-end; gap: 6px; translate: -10px 0; }
    .hop-r .hop-mark { animation: hop-tap ${RESUME}ms linear both; }
    /* Where the browser cannot show the PDF inline, the resume page shows a
       card instead, so there is nothing for the sheet to land on: the scene
       keeps the writing, the taps and the jump, and then the mark and its
       sheet simply fade away into the page. */
    .hop-soft .hop-mark { animation: hop-tap-soft ${SOFT}ms linear both; }
    .hop-soft .hop-hook { animation-duration: ${SOFT}ms; }
    .hop-soft .hop-eye { animation-duration: ${SOFT}ms; }
    .hop-soft .hop-stage { animation: hop-soft-out ${SOFT}ms linear both; }
    .hop.hop-soft .hop-sheet { position: static; display: block; width: auto; height: auto; margin-bottom: 12px; animation: hop-sheet-soft ${SOFT}ms linear both; }
    .hop.hop-soft .hop-sheet svg { width: 58px; height: 70px; }
    .hop.hop-soft .hop-sheet .ln { animation-duration: ${SOFT}ms; }
    .hop.hop-soft .hop-sheet .detail { animation: none; }
    .hop.hop-soft .hop-sheet .blank { display: none; }
    .hop-r .hop-hook { animation: hop-tap-hook ${RESUME}ms linear both; }
    .hop-r .hop-eye { animation: hop-tap-eye ${RESUME}ms linear both; }
    /* The sheet is drawn at the size of the real document, right where it
       will land, and shrunk down beside the mark for most of the scene, so
       the throw grows it back to its true size and it stays sharp (drawn
       small and blown up, it went soft). An empty slot keeps its place in
       the row beside the mark. */
    .hop .hop-slot { display: block; width: 58px; height: 70px; margin-bottom: 12px; }
    .hop .hop-sheet {
      position: fixed;
      left: var(--tl); top: var(--tt); width: var(--tw); height: var(--th);
      transform-origin: 50% 100%;
      animation: hop-sheet ${RESUME}ms linear both;
    }
    .hop .hop-sheet svg { width: 100%; height: 100%; }
    /* Paper in the page's own colours: a sheet a shade off the page with a
       fine outline, grey lines of text, a blue title and an orange dot. */
    .hop-sheet .paper { fill: color-mix(in oklab, var(--ink, #edebe6) 5%, var(--bg, #121212)); stroke: color-mix(in oklab, var(--ink, #edebe6) 42%, transparent); stroke-width: 1.6; stroke-linejoin: round; }
    [data-theme="daylight"] .hop-sheet .paper { fill: #fff; }
    .hop-sheet .fold { fill: color-mix(in oklab, var(--ink, #edebe6) 14%, var(--bg, #121212)); stroke: color-mix(in oklab, var(--ink, #edebe6) 42%, transparent); stroke-width: 1.6; stroke-linejoin: round; }
    .hop-sheet .detail { animation: hop-detail-out ${RESUME}ms linear both; }
    .hop-sheet .blank { fill: color-mix(in oklab, var(--ink, #edebe6) 5%, var(--bg, #121212)); opacity: 0; animation: hop-blank-in ${RESUME}ms linear both; }
    [data-theme="daylight"] .hop-sheet .blank { fill: #fff; }
    .hop-sheet .ln { fill: color-mix(in oklab, var(--ink, #edebe6) 38%, transparent); transform-box: fill-box; transform-origin: 0 50%; transform: scaleX(0); }
    .hop-sheet .ln.title { fill: #3d68ff; }
    .hop-sheet .ln.dot { fill: #ff6b35; transform-origin: 50% 50%; transform: scale(0); }
    .hop-sheet .l1 { animation: hop-write1 ${RESUME}ms linear both; }
    .hop-sheet .l2 { animation: hop-write2 ${RESUME}ms linear both; }
    .hop-sheet .l3 { animation: hop-write3 ${RESUME}ms linear both; }
    .hop-sheet .l4 { animation: hop-write4 ${RESUME}ms linear both; }
    .hop-sheet .l5 { animation: hop-write5 ${RESUME}ms linear both; }

    @keyframes hop-tap {
      0%   { opacity: 1; transform: perspective(360px) translate(0, 0) rotate(0) rotateY(0deg) scale(1, 1); animation-timing-function: ${SNAP}; }
      4%   { transform: perspective(360px) translate(0, 0) rotate(0) rotateY(0deg) scale(1.07, .93); animation-timing-function: ${UP}; }
      8%   { transform: perspective(360px) translate(-6px, -16px) rotate(-5deg) rotateY(0deg) scale(.97, 1.04); animation-timing-function: ${DOWN}; }
      12%  { transform: perspective(360px) translate(-8px, 0) rotate(-2deg) rotateY(0deg) scale(1.09, .91); animation-timing-function: ${UP}; }
      17%  { transform: perspective(360px) translate(4px, -15px) rotate(5deg) rotateY(0deg) scale(.97, 1.04); animation-timing-function: ${DOWN}; }
      22%  { transform: perspective(360px) translate(8px, 0) rotate(2deg) rotateY(0deg) scale(1.09, .91); animation-timing-function: ${UP}; }
      27%  { transform: perspective(360px) translate(-4px, -15px) rotate(-5deg) rotateY(0deg) scale(.97, 1.04); animation-timing-function: ${DOWN}; }
      32%  { transform: perspective(360px) translate(-8px, 0) rotate(-2deg) rotateY(0deg) scale(1.09, .91); animation-timing-function: ${UP}; }
      37%  { transform: perspective(360px) translate(4px, -15px) rotate(5deg) rotateY(0deg) scale(.97, 1.04); animation-timing-function: ${DOWN}; }
      42%  { transform: perspective(360px) translate(8px, 0) rotate(2deg) rotateY(0deg) scale(1.09, .91); animation-timing-function: ${SNAP}; }
      45%  { transform: perspective(360px) translate(0, 0) rotate(0) rotateY(0deg) scale(1.02, .98); animation-timing-function: ${SNAP}; }
      48%  { transform: perspective(360px) translate(0, 0) rotate(0) rotateY(0deg) scale(1.16, .82); animation-timing-function: ${UP}; }
      51%  { transform: perspective(360px) translate(0, -26px) rotate(-2deg) rotateY(0deg) scale(.9, 1.12); animation-timing-function: ${UP}; }
      58%  { transform: perspective(360px) translate(0, -92px) rotate(-7deg) rotateY(0deg) scale(1, 1); animation-timing-function: ${DOWN}; }
      64%  { transform: perspective(360px) translate(0, 0) rotate(-1deg) rotateY(0deg) scale(.95, 1.06); animation-timing-function: ${SNAP}; }
      67%  { transform: perspective(360px) translate(0, 0) rotate(0) rotateY(0deg) scale(1.17, .83); animation-timing-function: ${UP}; }
      70%  { transform: perspective(360px) translate(0, -9px) rotate(0) rotateY(0deg) scale(.97, 1.03); animation-timing-function: ${DOWN}; }
      73%  { transform: perspective(360px) translate(0, 0) rotate(0) rotateY(7deg) scale(1.04, .96); animation-timing-function: cubic-bezier(.45, 0, .55, 1); }
      79%  { transform: perspective(360px) translate(7px, 3px) rotate(11deg) rotateY(32deg) scale(1.08, .9); animation-timing-function: cubic-bezier(.5, 0, .75, .3); }
      80%  { transform: perspective(360px) translate(7.5px, 3.5px) rotate(12deg) rotateY(34deg) scale(1.09, .89); animation-timing-function: cubic-bezier(.1, .7, .3, 1); }
      83%  { transform: perspective(360px) translate(-5px, -11px) rotate(-9deg) rotateY(-18deg) scale(.93, 1.09); animation-timing-function: cubic-bezier(.4, 0, .6, 1); }
      87%  { opacity: 1; transform: perspective(360px) translate(-1px, 0) rotate(4deg) rotateY(10deg) scale(1.04, .96); animation-timing-function: cubic-bezier(.4, 0, .6, 1); }
      91%  { transform: perspective(360px) translate(0, -2px) rotate(-1.5deg) rotateY(-3.5deg) scale(.99, 1.01); animation-timing-function: cubic-bezier(.4, 0, .6, 1); }
      100% { opacity: 0; transform: perspective(360px) translate(0, 0) rotate(0) rotateY(0deg) scale(.98, .98); }
    }
    @keyframes hop-tap-soft {
      0%   { opacity: 1; transform: perspective(360px) translate(0, 0) rotate(0) rotateY(0deg) scale(1, 1); animation-timing-function: ${SNAP}; }
      4%   { transform: perspective(360px) translate(0, 0) rotate(0) rotateY(0deg) scale(1.07, .93); animation-timing-function: ${UP}; }
      8%   { transform: perspective(360px) translate(-6px, -16px) rotate(-5deg) rotateY(0deg) scale(.97, 1.04); animation-timing-function: ${DOWN}; }
      12%  { transform: perspective(360px) translate(-8px, 0) rotate(-2deg) rotateY(0deg) scale(1.09, .91); animation-timing-function: ${UP}; }
      17%  { transform: perspective(360px) translate(4px, -15px) rotate(5deg) rotateY(0deg) scale(.97, 1.04); animation-timing-function: ${DOWN}; }
      22%  { transform: perspective(360px) translate(8px, 0) rotate(2deg) rotateY(0deg) scale(1.09, .91); animation-timing-function: ${UP}; }
      27%  { transform: perspective(360px) translate(-4px, -15px) rotate(-5deg) rotateY(0deg) scale(.97, 1.04); animation-timing-function: ${DOWN}; }
      32%  { transform: perspective(360px) translate(-8px, 0) rotate(-2deg) rotateY(0deg) scale(1.09, .91); animation-timing-function: ${UP}; }
      37%  { transform: perspective(360px) translate(4px, -15px) rotate(5deg) rotateY(0deg) scale(.97, 1.04); animation-timing-function: ${DOWN}; }
      42%  { transform: perspective(360px) translate(8px, 0) rotate(2deg) rotateY(0deg) scale(1.09, .91); animation-timing-function: ${SNAP}; }
      45%  { transform: perspective(360px) translate(0, 0) rotate(0) rotateY(0deg) scale(1.02, .98); animation-timing-function: ${SNAP}; }
      48%  { transform: perspective(360px) translate(0, 0) rotate(0) rotateY(0deg) scale(1.16, .82); animation-timing-function: ${UP}; }
      51%  { transform: perspective(360px) translate(0, -26px) rotate(-2deg) rotateY(0deg) scale(.9, 1.12); animation-timing-function: ${UP}; }
      58%  { transform: perspective(360px) translate(0, -92px) rotate(-7deg) rotateY(0deg) scale(1, 1); animation-timing-function: ${DOWN}; }
      64%  { transform: perspective(360px) translate(0, 0) rotate(-1deg) rotateY(0deg) scale(.95, 1.06); animation-timing-function: ${SNAP}; }
      67%  { transform: perspective(360px) translate(0, 0) rotate(0) rotateY(0deg) scale(1.17, .83); animation-timing-function: ${UP}; }
      70%  { transform: perspective(360px) translate(0, -9px) rotate(0) rotateY(0deg) scale(.97, 1.03); animation-timing-function: ${DOWN}; }
      73%  { transform: perspective(360px) translate(0, 0) rotate(0) rotateY(7deg) scale(1.04, .96); animation-timing-function: cubic-bezier(.45, 0, .55, 1); }
      80%, 100% { transform: perspective(360px) translate(0, 0) rotate(0) rotateY(0deg) scale(1, 1); }
    }
    @keyframes hop-soft-out { 0%, 74% { opacity: 1; scale: 1; animation-timing-function: cubic-bezier(.4, 0, .2, 1); } 100% { opacity: 0; scale: .97; } }
    @keyframes hop-sheet-soft {
      0%, 6% { opacity: 0; transform: translate(0, 14px) rotate(-4deg) scale(.9); animation-timing-function: ${UP}; }
      12% { opacity: 1; transform: translate(0, -3px) rotate(1.5deg) scale(1.01); animation-timing-function: ${SNAP}; }
      16%, 48% { transform: translate(0, 0) rotate(0) scale(1); animation-timing-function: ${UP}; }
      55% { transform: translate(0, -5px) rotate(-1.5deg) scale(1); animation-timing-function: ${SNAP}; }
      62%, 100% { transform: translate(0, 0) rotate(0) scale(1); }
    }
    /* Swings against the sideways motion, a beat behind it. */
    @keyframes hop-tap-hook {
      0%, 4% { transform: rotate(0); }
      9% { transform: rotate(6deg); } 13% { transform: rotate(1deg); }
      18% { transform: rotate(-6deg); } 23% { transform: rotate(-1deg); }
      28% { transform: rotate(6deg); } 33% { transform: rotate(1deg); }
      38% { transform: rotate(-6deg); } 43% { transform: rotate(-1deg); }
      49% { transform: rotate(3deg); } 55% { transform: rotate(-3deg); }
      61% { transform: rotate(2deg); } 68% { transform: rotate(-6deg); }
      73% { transform: rotate(2deg); } 79% { transform: rotate(-5deg); }
      84% { transform: rotate(7deg); } 90% { transform: rotate(-2deg); }
      100% { transform: rotate(0); }
    }
    /* Looks right at the sheet throughout (+1.5); on top of that it trails
       the body: down as it lifts, up as it drops, a settle after landing. */
    @keyframes hop-tap-eye {
      0%   { transform: translate(0, 0) scale(1); }
      4%   { transform: translate(1.2px, .6px) scale(1.04, .96); }
      8%   { transform: translate(2.8px, 1.8px) scale(1); }
      12%  { transform: translate(.6px, -.8px) scale(1.08, .92); }
      17%  { transform: translate(.2px, 1.8px) scale(1); }
      22%  { transform: translate(2.4px, -.8px) scale(1.08, .92); }
      27%  { transform: translate(2.8px, 1.8px) scale(1); }
      32%  { transform: translate(.6px, -.8px) scale(1.08, .92); }
      37%  { transform: translate(.2px, 1.8px) scale(1); }
      42%  { transform: translate(2.4px, -.8px) scale(1.08, .92); }
      45%  { transform: translate(1.5px, 0) scale(1); }
      48%  { transform: translate(1.5px, .9px) scale(1.06, .94); }
      51%  { transform: translate(1.5px, 2.6px) scale(.96, 1.05); }
      58%  { transform: translate(1.5px, -2.2px) scale(1); }
      64%  { transform: translate(1.5px, -1.4px) scale(.98, 1.02); }
      67%  { transform: translate(1.5px, 1.8px) scale(1.16, .84); }
      71%  { transform: translate(1.5px, -.4px) scale(1); }
      79%  { transform: translate(2.8px, 1px) scale(1); }
      83%  { transform: translate(-.6px, -1.6px) scale(1.05); }
      88%  { transform: translate(0, .5px) scale(1); }
      91%  { transform: translate(0, .9px) scale(1.12, .12); }
      94%, 100% { transform: translate(0, 0) scale(1); }
    }
    /* The sheet rises into place and settles, sits still while it is
       written, lifts a touch as the mark jumps, then glides over to the
       middle as it is handed across; then the whole scene fades out to the
       page's paper, and the resume fades in from the same paper. */
    @keyframes hop-sheet {
      0%, 6% { opacity: 0; transform: translate(calc(var(--dx) + 0px), calc(var(--dy) + 14px)) rotate(-4deg) scale(calc(var(--sx) * 0.9), calc(var(--sy) * 0.9)); animation-timing-function: ${UP}; }
      12% { opacity: 1; transform: translate(calc(var(--dx) + 0px), calc(var(--dy) + -3px)) rotate(1.5deg) scale(calc(var(--sx) * 1.01), calc(var(--sy) * 1.01)); animation-timing-function: ${SNAP}; }
      16% { transform: translate(calc(var(--dx) + 0px), calc(var(--dy) + 0px)) rotate(0deg) scale(calc(var(--sx) * 1), calc(var(--sy) * 1)); }
      48% { transform: translate(calc(var(--dx) + 0px), calc(var(--dy) + 0px)) rotate(0deg) scale(calc(var(--sx) * 1), calc(var(--sy) * 1)); animation-timing-function: ${UP}; }
      55% { transform: translate(calc(var(--dx) + 0px), calc(var(--dy) + -5px)) rotate(-1.5deg) scale(calc(var(--sx) * 1), calc(var(--sy) * 1)); animation-timing-function: ${SNAP}; }
      62%, 73% { transform: translate(calc(var(--dx) + 0px), calc(var(--dy) + 0px)) rotate(0deg) scale(calc(var(--sx) * 1), calc(var(--sy) * 1)); animation-timing-function: cubic-bezier(.45, 0, .55, 1); }
      80% { transform: translate(calc(var(--dx) + -9px), calc(var(--dy) + 6px)) rotate(14deg) scale(calc(var(--sx) * .95), calc(var(--sy) * .95)); animation-timing-function: cubic-bezier(.2, .6, .4, 1); }
      83% { transform: translate(calc(var(--dx) * .9), calc(var(--dy) * .9 - 22px)) rotate(-6deg) scale(calc(var(--sx) * 1.3), calc(var(--sy) * 1.3)); animation-timing-function: cubic-bezier(.55, 0, .9, .45); }
      92% { transform: translate(0px, 0px) rotate(0deg) scale(1.015, 1.015); animation-timing-function: cubic-bezier(.3, 0, .4, 1); }
      96%, 100% { transform: translate(0px, 0px) rotate(0deg) scale(1, 1); }
    }
    /* As the wind-up starts, the drawing gives way to a plain page in the
       same colour; only the blank page is thrown (so nothing on it is seen
       stretching), speeding up as it comes at the viewer, and it lands on
       the document, which the resume page then dissolves it to show. */
    @keyframes hop-detail-out { 0%, 73% { opacity: 1; } 78%, 100% { opacity: 0; } }
    @keyframes hop-blank-in { 0%, 72% { opacity: 0; } 77%, 100% { opacity: 1; } }
    @keyframes hop-write1 { 0%, 18% { transform: scaleX(0); animation-timing-function: ${UP}; } 22%, 100% { transform: scaleX(1); } }
    @keyframes hop-write2 { 0%, 24% { transform: scaleX(0); animation-timing-function: ${UP}; } 28%, 100% { transform: scaleX(1); } }
    @keyframes hop-write3 { 0%, 30% { transform: scaleX(0); animation-timing-function: ${UP}; } 34%, 100% { transform: scaleX(1); } }
    @keyframes hop-write4 { 0%, 36% { transform: scaleX(0); animation-timing-function: ${UP}; } 40%, 100% { transform: scaleX(1); } }
    @keyframes hop-write5 { 0%, 41% { transform: scale(0); animation-timing-function: cubic-bezier(.34, 1.56, .64, 1); } 45%, 100% { transform: scale(1); } }`;

  // The mark, with a margin of room around the drawing (viewBox padded by 6).
  const mark = `<span class="hop-mark"><svg viewBox="3 2.5 57 54" aria-hidden="true" focusable="false">
      <path class="am-a" d="M10.29 44.57 L30.86 9.90 L43.20 32.70 L43.20 36.19 L36.19 36.19 L30.86 26.67 L20.19 44.57Z"/>
      <path class="hop-hook" d="M26.25 36.19 A13.16 13.16 0 0 0 52.57 36.19 L43.83 36.19 A4.42 4.42 0 0 1 34.99 36.19Z" fill="#ff6b35"/>
      <rect x="43.83" y="24.60" width="8.74" height="11.79" fill="#3d68ff"/>
      <circle class="hop-eye" cx="48.20" cy="17.40" r="5.60" fill="#3d68ff"/>
    </svg></span>`;

  // A flat sheet in the mark's own colours: no outline or shading, a folded
  // corner, a blue title, lines that get written in, and an orange dot.
  const sheet = `<span class="hop-sheet"><svg viewBox="2 2 40 56" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <g class="detail">
        <path class="paper" d="M5 2h24l13 13v40a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3Z"/>
        <path class="fold" d="M29 2v10a3 3 0 0 0 3 3h10Z"/>
        <rect class="ln title l1" x="8" y="10" width="15" height="5" rx="2.5"/>
        <rect class="ln l2" x="8" y="24" width="20" height="4" rx="2"/>
        <rect class="ln l3" x="8" y="33" width="28" height="4" rx="2"/>
        <rect class="ln l4" x="8" y="42" width="22" height="4" rx="2"/>
        <circle class="ln dot l5" cx="34" cy="26" r="3.2"/>
      </g>
      <rect class="blank" x="2" y="2" width="40" height="56" rx="1"/>
    </svg></span>`;

  /* Where the resume document sits on the resume page, so the thrown sheet
     lands right on it: on desktop the embedded PDF (centred, 944px at most,
     letter shaped, at most 78% of the window tall, 229px from the top); on
     phones, which show a card instead, a centred page. */
  const docRect = () => {
    const vw = innerWidth, vh = innerHeight;
    const phone = vw < 720 || /iPad|iPhone|iPod|Android/.test(navigator.userAgent);
    if (!phone) {
      const w = Math.min(944, vw - 56), h = Math.min(w * 11 / 8.5, vh * 0.78);
      return { left: (vw - w) / 2, top: 229, width: w, height: h };
    }
    const w = vw - 40, h = Math.min(w * 11 / 8.5, vh * 0.66);
    return { left: (vw - (h * 8.5 / 11 < w ? h * 8.5 / 11 : w)) / 2, top: (vh - h) / 2, width: Math.min(w, h * 8.5 / 11), height: h };
  };
  // Places the full size sheet on the document's rectangle, then works out
  // the translate and scale (about its bottom centre) that shrink it onto
  // the small paper beside the mark, where it spends most of the scene.
  const aimSheet = (el, slot) => {
    if (!el || !slot) return;
    const t = docRect();
    el.style.setProperty('--tl', `${t.left}px`);
    el.style.setProperty('--tt', `${t.top}px`);
    el.style.setProperty('--tw', `${t.width}px`);
    el.style.setProperty('--th', `${t.height}px`);
    const r = slot.getBoundingClientRect();
    const pw = 40, ph = 56, px = r.left + 8, py = r.top + 8;   // the paper within the slot
    el.style.setProperty('--sx', (pw / t.width).toFixed(5));
    el.style.setProperty('--sy', (ph / t.height).toFixed(5));
    el.style.setProperty('--dx', `${(px + pw / 2 - (t.left + t.width / 2)).toFixed(1)}px`);
    el.style.setProperty('--dy', `${(py + ph - (t.top + t.height)).toFixed(1)}px`);
    /* The blank page lands with the document card's own corners (--r-lg,
       18px). The sheet's drawing is stretched to the document's shape, so
       the corner radius is set separately across and down to come out
       round, not squashed. */
    const blank = el.querySelector('.blank');
    if (blank) {
      const rad = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--r-lg')) || 18;
      blank.setAttribute('rx', (rad * pw / t.width).toFixed(3));
      blank.setAttribute('ry', (rad * ph / t.height).toFixed(3));
    }
  };

  // The same test the resume page uses to swap the embedded PDF for a card.
  const noInlinePdf = () => {
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return ios || /Android/.test(ua) || navigator.pdfViewerEnabled === false;
  };

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
    const soft = forResume && noInlinePdf();
    const veil = document.createElement('div');
    veil.className = `hop ${forResume ? 'hop-r' : 'hop-p'}${soft ? ' hop-soft' : ''}`;
    veil.setAttribute('aria-hidden', 'true');
    veil.innerHTML = !forResume ? mark
      : soft ? `<span class="hop-stage">${mark}${sheet.replace('viewBox="2 2 40 56" preserveAspectRatio="none"', 'viewBox="-6 -6 58 70"')}</span>`
      : `<span class="hop-stage">${mark}<span class="hop-slot"></span></span>${sheet}`;
    document.body.appendChild(veil);
    if (forResume && !soft) aimSheet(veil.querySelector('.hop-sheet'), veil.querySelector('.hop-slot'));
    requestAnimationFrame(() => requestAnimationFrame(() => veil.classList.add('is-on')));
    // The next page fades in from the paper rather than cutting in.
    try { sessionStorage.setItem('hop-arrive', soft ? 'soft' : '1'); } catch {}
    setTimeout(() => { location.href = url; }, (soft ? SOFT : forResume ? RESUME : DANCE) + 60);
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
