/* ==========================================================================
   Page hop
   Going from one page of the site to another, the page fades to its own
   paper and the Aj mark plays a short scene before the next page opens.
   For the resume, it quickly puts a resume together beside itself, shifting
   from foot to foot with excitement as the lines get written, and throws
   the sheet at the screen; the resume page then fades in from
   it. Any other page gets a couple of happy hops. Links back to the home
   page (the standard site) or on to the era picker play that page's own
   loading screen; so the trip there is the mark flying down from the nav to
   where that screen draws it (turning to pixels on the way to the picker). New tabs,
   downloads, mail links and anything on another site are left alone. With
   reduced motion the page simply changes.

   Either way the scene begins with the nav's own small mark lifting out of
   the bar and flying to the middle of the screen, growing as it goes, to
   land exactly where the next page's mark starts, so it reads as one mark
   carried across.

   The jumps move an HTML wrapper around the mark, never the shapes inside
   its SVG: an SVG trims whatever leaves its own box in Safari, which cut the
   mark off at the top of a jump. The SVGs themselves carry a margin around
   the drawing so the small moves inside (the eye, the hook) have room too.
   ========================================================================== */
(function hop() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const DANCE = 1000;    // ms of the plain hops
  // The resume scene's keyframes are written in ms on a 1930ms timeline,
  // played back a touch faster by PACE.
  const PACE = 0.9;
  const RESUME = Math.round(1930 * PACE);   // ms of the resume scene
  const SOFT = 1300;     // the resume scene without the throw
  // Moments in the resume scene: the sheet hits the glass and spreads flat,
  // and the batter has run and faded by the time the page changes.
  const HIT = Math.round(1105 * PACE), SPLAT = Math.round(1145 * PACE), SETTLED = Math.round(1650 * PACE);
  const LIFE = RESUME - SPLAT - 20;
  const P = (ms) => `${(ms * PACE / RESUME * 100).toFixed(2)}%`;
  let going = false;

  // Rising slows to the top, falling speeds up: gravity.
  const UP = 'cubic-bezier(.2, .65, .4, 1)';
  const DOWN = 'cubic-bezier(.6, 0, .8, .35)';
  const SNAP = 'cubic-bezier(.3, 0, .5, 1)';

  const css = `
    .hop {
      position: fixed; inset: 0; z-index: 2147483600;
      display: grid; place-items: center;
      isolation: isolate;
      opacity: 0; transition: opacity .16s ease;
      pointer-events: all;
    }
    .hop::before {
      content: ""; position: absolute; inset: 0; z-index: -1;
      background: var(--bg, #121212);
      transition: opacity .45s cubic-bezier(.4, 0, .2, 1);
    }
    .hop.is-on { opacity: 1; }
    /* On the way to the era picker the paper is its loading screen's. */
    .hop.hop-px::before { background: #16130f; }
    /* On the resume page the scene is already up when the page shows. */
    .hop.hop-live { opacity: 1; transition: none; }
    /* The sheet and the batter, together, so they can dissolve as one. */
    .hop-fx { position: fixed; inset: 0; pointer-events: none; will-change: opacity; }
    /* Done: the paper lifts away first, then the sheet and batter dissolve
       and the real document shows through where it landed. */
    .hop.is-lifting { pointer-events: none; }
    .hop.is-lifting::before { opacity: 0; transition-duration: .85s; }
    .hop.is-lifting .hop-fx { opacity: 0; transition: opacity .95s cubic-bezier(.4, 0, .2, 1); }
    .hop svg { display: block; overflow: visible; }
    /* The nav's mark in flight, above the paper. */
    .hop-fly { position: fixed; z-index: 2147483601; pointer-events: none; will-change: transform; }
    .hop-fly .am-a { fill: var(--ink, #edebe6); }
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
       right, eye on the work. Then, straight off the last tap, the sheet
       is handed over in a throw: the mark turns toward the sheet and loads up, then
       springs it forward. The sheet flies at the screen, its drawing giving
       way to a plain page that lands exactly where the real document will
       be; the resume page opens with that page in place and dissolves it,
       so the document fades in underneath.
       The parts carry their own inertia: the eye trails the body (it sinks
       as the body lifts, rises as it drops and settles a beat after each
       landing, and lags behind each sideways shift), and the hook swings
       like a pendulum against the sideways motion. Squashes are small,
       the size a real hop would make, not a cartoon's. */
    .hop-stage { position: relative; display: flex; align-items: flex-end; gap: 18px; translate: 10px 0; }
    .hop-r .hop-mark { animation: hop-tap ${RESUME}ms linear both; }
    /* Where the browser cannot show the PDF inline, the resume page shows a
       card instead, so there is nothing for the sheet to land on: the scene
       keeps the writing, the taps and the jump, and then the mark and its
       sheet simply fade away into the page. */
    .hop-soft .hop-mark { animation: hop-tap-soft ${SOFT}ms linear both; }
    .hop-soft .hop-hook { animation: hop-tap-hook-soft ${SOFT}ms linear both; }
    .hop-soft .hop-eye { animation: hop-tap-eye-soft ${SOFT}ms linear both; }
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
      transform-origin: 50% 50%;
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
    /* Batter flung off by the splat: drops that fly out and stick to the
       glass, then slide and fade; and runs that streak down from the sides.
 */
    .hop-drop, .hop-run {
      position: fixed;
      left: var(--x); top: var(--y);
      background: color-mix(in oklab, var(--ink, #edebe6) 5%, var(--bg, #121212));
      box-shadow: 0 0 0 .5px color-mix(in oklab, var(--ink, #edebe6) 10%, transparent), 0 1px 3px color-mix(in oklab, var(--ink, #edebe6) 18%, transparent);
      opacity: 0;
      pointer-events: none;
    }
    [data-theme="daylight"] .hop-drop, [data-theme="daylight"] .hop-run { background: #fff; }
    .hop-drop {
      width: var(--s); height: calc(var(--s) * var(--k, 1));
      margin: calc(var(--s) / -2) 0 0 calc(var(--s) / -2);
      border-radius: 50%;
      animation: hop-drop var(--life) linear var(--delay) both, hop-fade var(--life) linear var(--delay) both;
    }
    .hop-run {
      width: var(--w); height: var(--len);
      margin-left: calc(var(--w) / -2);
      border-radius: 50% 50% 50% 50% / 18% 18% 82% 82%;
      transform-origin: 50% 0;
      animation: hop-run var(--life) linear var(--delay) both, hop-fade var(--life) linear var(--delay) both;
    }
    /* Motion and fade run on their own curves, so neither jolts the
       other: a drop flies out, squashes flat on the glass, recovers, then
       slides down in one easing; the fade starts gently partway through. */
    @keyframes hop-drop {
      0%   { transform: translate(var(--fx), var(--fy)) scale(.35); animation-timing-function: cubic-bezier(.1, .8, .3, 1); }
      10%  { transform: translate(0, 0) scale(1.16, .84); animation-timing-function: cubic-bezier(.35, 0, .45, 1); }
      20%  { transform: translate(0, 0) scale(1, 1); animation-timing-function: cubic-bezier(.4, 0, .5, 1); }
      100% { transform: translate(0, calc(var(--slide) * 1.4)) scale(.92, 1.16); }
    }
    @keyframes hop-run {
      0%   { transform: translateY(0) scaleY(.1); animation-timing-function: cubic-bezier(.4, 0, .45, 1); }
      100% { transform: translateY(var(--drop)) scaleY(1); }
    }
    @keyframes hop-fade {
      0%   { opacity: 0; animation-timing-function: ease-out; }
      3%   { opacity: 1; }
      35%  { opacity: 1; animation-timing-function: cubic-bezier(.4, 0, .6, 1); }
      100% { opacity: 0; }
    }
    .hop-sheet .ln { fill: color-mix(in oklab, var(--ink, #edebe6) 38%, transparent); transform-box: fill-box; transform-origin: 0 50%; transform: scaleX(0); }
    .hop-sheet .ln.title { fill: #3d68ff; }
    .hop-sheet .ln.dot { fill: #ff6b35; transform-origin: 50% 50%; transform: scale(0); }
    .hop-sheet .l1 { animation: hop-write1 ${RESUME}ms linear both; }
    .hop-sheet .l2 { animation: hop-write2 ${RESUME}ms linear both; }
    .hop-sheet .l3 { animation: hop-write3 ${RESUME}ms linear both; }
    .hop-sheet .l4 { animation: hop-write4 ${RESUME}ms linear both; }
    .hop-sheet .l5 { animation: hop-write5 ${RESUME}ms linear both; }

    @keyframes hop-tap {
      0%       { opacity: 1; transform: perspective(360px) translate(0, 0) rotate(0) rotateY(0deg) scale(1, 1); animation-timing-function: cubic-bezier(.3, 0, .4, 1); }
      /* A hop with weight. A crouch to push off, a stretch as it leaves,
         then a real arc: slowing on the way up (OUT), speeding on the way
         down (IN), a deep squash on landing, and a rebound a third as
         high that lands softer. */
      ${P(110)}  { transform: perspective(360px) translate(0, 3px) rotate(0) rotateY(0deg) scale(1.13, 0.87); animation-timing-function: cubic-bezier(.2, .6, .4, 1); }
      ${P(135)}  { transform: perspective(360px) translate(-2px, -14px) rotate(-1.5deg) rotateY(0deg) scale(0.93, 1.11); animation-timing-function: cubic-bezier(.25, .46, .45, .94); }
      ${P(290)}  { transform: perspective(360px) translate(-8px, -60px) rotate(-5deg) rotateY(0deg) scale(1, 1); animation-timing-function: cubic-bezier(.55, .085, .68, .53); }
      ${P(470)}  { transform: perspective(360px) translate(-8px, 2px) rotate(-1.5deg) rotateY(0deg) scale(1.2, 0.8); animation-timing-function: cubic-bezier(.2, .65, .35, 1); }
      ${P(495)}  { transform: perspective(360px) translate(-7px, -5px) rotate(-1deg) rotateY(0deg) scale(0.95, 1.08); animation-timing-function: cubic-bezier(.25, .46, .45, .94); }
      ${P(590)}  { transform: perspective(360px) translate(-5px, -19px) rotate(-3deg) rotateY(0deg) scale(1, 1); animation-timing-function: cubic-bezier(.55, .085, .68, .53); }
      ${P(690)}  { transform: perspective(360px) translate(-3px, 0) rotate(0) rotateY(0deg) scale(1.1, 0.9); animation-timing-function: cubic-bezier(.45, 0, .4, 1); }
      /* The landing squash runs straight into the wind-up: the body coils
         back like a rubber band being drawn, turning away and sinking low,
         holds at full stretch, then lets go in a whip and recoils, the
         stretch running out of it in smaller and smaller swings. */
      ${P(700)}  { transform: perspective(360px) translate(0, 0) rotate(0) rotateY(0deg) scale(1.14, 0.86); animation-timing-function: cubic-bezier(.45, 0, .4, 1); }
      ${P(790)} { transform: perspective(360px) translate(-5px, 2px) rotate(-5deg) rotateY(-16deg) scale(1.1, 0.9); animation-timing-function: cubic-bezier(.45, 0, .35, 1); }
      ${P(930)} { transform: perspective(360px) translate(16px, 6px) rotate(25deg) rotateY(62deg) scale(1.12, 0.82); animation-timing-function: cubic-bezier(.5, 0, .75, .3); }
      ${P(1000)} { transform: perspective(360px) translate(17px, 7px) rotate(27deg) rotateY(66deg) scale(1.13, 0.8); animation-timing-function: cubic-bezier(.1, .7, .3, 1); }
      ${P(1065)} { transform: perspective(360px) translate(-9px, -15px) rotate(-15deg) rotateY(-28deg) scale(0.9, 1.12); animation-timing-function: cubic-bezier(.4, 0, .6, 1); }
      ${P(1140)} { transform: perspective(360px) translate(2px, 0) rotate(4deg) rotateY(8deg) scale(1.03, 0.97); animation-timing-function: cubic-bezier(.4, 0, .6, 1); }
      ${P(1215)} { transform: perspective(360px) translate(0, -1px) rotate(-1.5deg) rotateY(-3deg) scale(1, 1); animation-timing-function: cubic-bezier(.4, 0, .6, 1); }
      ${P(1240)} { opacity: 1; }
      ${P(1285)} { transform: perspective(360px) translate(0, 0) rotate(1deg) rotateY(2deg) scale(1, 1); }
      ${P(1380)} { opacity: 0; }
      100%     { opacity: 0; transform: perspective(360px) translate(0, 0) rotate(0) rotateY(0deg) scale(1, 1); }
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
    @keyframes hop-tap-hook-soft {
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
    @keyframes hop-tap-eye-soft {
      0%   { transform: translate(0, 0) scale(1); }
      4%   { transform: translate(1.2px, .6px) scale(1.04, .96); }
      8.01%   { transform: translate(2.8px, 1.8px) scale(1); }
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
      57.99%  { transform: translate(1.5px, -2.2px) scale(1); }
      64%  { transform: translate(1.5px, -1.4px) scale(.98, 1.02); }
      67%  { transform: translate(1.5px, 1.8px) scale(1.16, .84); }
      71%  { transform: translate(1.5px, -.4px) scale(1); }
      79%  { transform: translate(2.8px, 1px) scale(1); }
      83%  { transform: translate(-.6px, -1.6px) scale(1.05); }
      88%  { transform: translate(0, .5px) scale(1); }
      90.99%  { transform: translate(0, .9px) scale(1.12, .12); }
      94%, 100% { transform: translate(0, 0) scale(1); }
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
      0%, ${P(110)} { transform: rotate(0); }
      ${P(150)} { transform: rotate(8deg); } ${P(290)} { transform: rotate(-6deg); }
      ${P(380)} { transform: rotate(-1deg); } ${P(470)} { transform: rotate(10deg); }
      ${P(540)} { transform: rotate(-5deg); } ${P(590)} { transform: rotate(4deg); }
      ${P(690)} { transform: rotate(-3deg); } ${P(740)} { transform: rotate(2deg); } ${P(790)} { transform: rotate(6deg); } ${P(930)} { transform: rotate(-11deg); }
      ${P(1000)} { transform: rotate(-12deg); } ${P(1075)} { transform: rotate(10deg); }
      ${P(1150)} { transform: rotate(-3deg); } ${P(1230)} { transform: rotate(1deg); }
      ${P(1300)}, 100% { transform: rotate(0); }
    }
    /* Looks right at the sheet throughout (+1.5); on top of that it trails
       the body: down as it lifts, up as it drops, a settle after landing. */
    @keyframes hop-tap-eye {
      0%   { transform: translate(0, 0) scale(1); }
      ${P(110)}  { transform: translate(1.2px, 1.6px) scale(1.07, .93); }
      ${P(135)}  { transform: translate(2.4px, -1.6px) scale(.94, 1.08); }
      ${P(290)}  { transform: translate(1.8px, -2.6px) scale(1); }
      ${P(380)}  { transform: translate(1.5px, .6px) scale(1); }
      ${P(470)}  { transform: translate(1px, 2.4px) scale(1.14, .86); }
      ${P(495)}  { transform: translate(1.8px, -1.6px) scale(.96, 1.05); }
      ${P(590)}  { transform: translate(1.8px, -2.2px) scale(1); }
      ${P(690)}  { transform: translate(1.5px, 1.6px) scale(1.07, .93); }
      ${P(700)}  { transform: translate(1.5px, 1.2px) scale(1.1, .9); }
      ${P(790)} { transform: translate(.4px, 1.8px) scale(1.04, .96); }
      ${P(930)} { transform: translate(3.2px, 1.2px) scale(1); }
      ${P(1000)} { transform: translate(3.4px, 1.3px) scale(1); }
      ${P(1065)} { transform: translate(-.8px, -1.8px) scale(1.05); }
      ${P(1140)} { transform: translate(.4px, .6px) scale(1); }
      ${P(1180)} { transform: translate(0, .9px) scale(1.12, .12); }
      ${P(1220)}, 100% { transform: translate(0, 0) scale(1); }
    }
    /* The sheet rises into place and settles, sits still while it is
       written, is drawn back with the wind-up, then flies over to the
       middle as it is handed across; then the whole scene fades out to the
       page's paper, and the resume fades in from the same paper. */
    @keyframes hop-sheet {
      0%, ${P(60)} { opacity: 0; transform: translate(calc(var(--dx) + 0px), calc(var(--dy) + 14px)) rotate(-4deg) scale(calc(var(--sx) * 0.9), calc(var(--sy) * 0.9)); animation-timing-function: ${UP}; }
      ${P(160)} { opacity: 1; transform: translate(calc(var(--dx) + 0px), calc(var(--dy) + -3px)) rotate(1.5deg) scale(calc(var(--sx) * 1.01), calc(var(--sy) * 1.01)); animation-timing-function: ${SNAP}; }
      ${P(220)} { transform: translate(calc(var(--dx) + 0px), calc(var(--dy) + 0px)) rotate(0deg) scale(calc(var(--sx) * 1), calc(var(--sy) * 1)); animation-timing-function: ${UP}; }
      ${P(465)} { transform: translate(calc(var(--dx) + 0px), calc(var(--dy) + 0px)) rotate(0deg) scale(calc(var(--sx) * 1), calc(var(--sy) * 1)); animation-timing-function: ${UP}; }
      ${P(490)} { transform: translate(calc(var(--dx) + 0px), calc(var(--dy) + -4px)) rotate(1.5deg) scale(calc(var(--sx) * 1), calc(var(--sy) * 1)); animation-timing-function: ${DOWN}; }
      ${P(570)} { transform: translate(calc(var(--dx) + 0px), calc(var(--dy) + 0px)) rotate(0deg) scale(calc(var(--sx) * 1), calc(var(--sy) * 1)); }
      ${P(700)} { transform: translate(calc(var(--dx) + 0px), calc(var(--dy) + 0px)) rotate(0deg) scale(calc(var(--sx) * 1), calc(var(--sy) * 1)); animation-timing-function: cubic-bezier(.45, 0, .4, 1); }
      ${P(800)} { transform: translate(calc(var(--dx) + 0px), calc(var(--dy) + 0px)) rotate(0deg) scale(calc(var(--sx) * 1), calc(var(--sy) * 1)); animation-timing-function: cubic-bezier(.5, 0, .75, .3); }
      ${P(930)} { transform: translate(calc(var(--dx) + -19px), calc(var(--dy) + 10px)) rotate(27deg) scale(calc(var(--sx) * 0.92), calc(var(--sy) * 0.93)); animation-timing-function: cubic-bezier(.5, 0, .75, .3); }
      ${P(1000)} { transform: translate(calc(var(--dx) + -21px), calc(var(--dy) + 11px)) rotate(30deg) scale(calc(var(--sx) * 0.91), calc(var(--sy) * 0.92)); animation-timing-function: cubic-bezier(.2, .6, .4, 1); }
      ${P(1020)} { transform: translate(calc(var(--dx) * .9), calc(var(--dy) * .9 - 22px)) rotate(-6deg) scale(calc(var(--sx) * 1.3), calc(var(--sy) * 1.3)); animation-timing-function: cubic-bezier(.55, 0, .9, .45); }
      ${P(1105)} { transform: translate(0px, 5px) rotate(-1deg) scale(.97, .97); animation-timing-function: cubic-bezier(.1, .8, .25, 1); }
      ${P(1145)} { transform: translate(0px, -4px) rotate(0deg) scale(1.085, 1.07); animation-timing-function: cubic-bezier(.2, .6, .3, 1); }
      /* Back to exactly the document's own size by the time the hand over
         begins, and held there, so the edges meet its outline one to one. */
      ${P(1650)} { transform: translate(0px, 0px) rotate(0deg) scale(1, 1); }
      100% { transform: translate(0px, 0px) rotate(0deg) scale(1, 1); }
    }
    /* As the wind-up starts, the drawing gives way to a plain page in the
       same colour; only the blank page is thrown (so nothing on it is seen
       stretching), speeding up as it comes at the viewer. It hits the
       screen like a pancake on a window: flattens out big the instant it
       lands, then slowly draws in and slides down a touch to sit exactly
       on the document, which the resume page then dissolves it to show. */
    @keyframes hop-detail-out { 0%, ${P(810)} { opacity: 1; } ${P(880)}, 100% { opacity: 0; } }
    @keyframes hop-blank-in { 0%, ${P(790)} { opacity: 0; } ${P(860)}, 100% { opacity: 1; } }
    @keyframes hop-write1 { 0%, ${P(120)} { transform: scaleX(0); animation-timing-function: ${UP}; } ${P(190)}, 100% { transform: scaleX(1); } }
    @keyframes hop-write2 { 0%, ${P(205)} { transform: scaleX(0); animation-timing-function: ${UP}; } ${P(275)}, 100% { transform: scaleX(1); } }
    @keyframes hop-write3 { 0%, ${P(290)} { transform: scaleX(0); animation-timing-function: ${UP}; } ${P(360)}, 100% { transform: scaleX(1); } }
    @keyframes hop-write4 { 0%, ${P(375)} { transform: scaleX(0); animation-timing-function: ${UP}; } ${P(445)}, 100% { transform: scaleX(1); } }
    @keyframes hop-write5 { 0%, ${P(455)} { transform: scale(0); animation-timing-function: cubic-bezier(.34, 1.56, .64, 1); } ${P(515)}, 100% { transform: scale(1); } }`;

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
      <path class="blank" d="M2 2H42V58H2Z"><animate class="splat" attributeName="d" begin="0s" fill="freeze" calcMode="spline"/></path>
    </svg></span>`;

  /* Where the resume document sits on the resume page, so the thrown sheet
     lands right on it: on desktop the embedded PDF (centred, 944px at most,
     letter shaped, at most 78% of the window tall, 229px from the top); on
     phones, which show a card instead, a centred page. */
  const docRect = () => {
    // On the resume page, the document's real box, wherever the layout puts it.
    const box = document.getElementById('pdfEmbed');
    if (box && box.offsetWidth) {
      const r = box.getBoundingClientRect();
      return { left: r.left, top: r.top, width: r.width, height: r.height };
    }
    const vw = innerWidth, vh = innerHeight;
    const w = Math.min(944, vw - 56), h = Math.min(w * 11 / 8.5, vh * 0.78);
    return { left: (vw - w) / 2, top: 229, width: w, height: h };
  };
  // Places the full size sheet on the document's rectangle, then works out
  // the translate and scale (about its centre) that shrink it onto
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
    el.style.setProperty('--dy', `${(py + ph / 2 - (t.top + t.height / 2)).toFixed(1)}px`);
    /* The blank page lands with the document card's own corners (--r-lg,
       18px). The sheet's drawing is stretched to the document's shape, so
       the corner radius is set separately across and down to come out
       round, not squashed. */
    const blank = el.querySelector('.blank');
    if (blank) shapeBlank(blank, t.width, t.height);
  };

  /* The blank page's outline, worked out for the document's real size so
     its corners and wobbles come out round at any window size: the clean
     shape is the document card's own (18px corners); the splat is the same
     outline pushed out and in by an uneven wave, the ragged edge of a
     pancake spreading on glass. Both are drawn from the same points, so one
     can turn into the other, which an SVG animation does on impact: clean
     in flight, ragged the instant it hits, smoothing back to clean as it
     draws in. Coordinates are in the sheet's own stretched units (40 by 56
     across the document). */
  const shapeBlank = (blank, W, H) => {
    const rad = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--r-lg')) || 18;
    const N = 88;
    const per = 2 * (W + H - 4 * rad) + 2 * Math.PI * rad;
    const at = (d) => {   // point and outward normal at distance d around the rounded rectangle
      const segs = [
        [W - 2 * rad, (u) => [rad + u, 0], [0, -1]],
        [Math.PI * rad / 2, (u) => { const a = -Math.PI / 2 + u / rad; return [W - rad + rad * Math.cos(a), rad + rad * Math.sin(a)]; }, null],
        [H - 2 * rad, (u) => [W, rad + u], [1, 0]],
        [Math.PI * rad / 2, (u) => { const a = u / rad; return [W - rad + rad * Math.cos(a), H - rad + rad * Math.sin(a)]; }, null],
        [W - 2 * rad, (u) => [W - rad - u, H], [0, 1]],
        [Math.PI * rad / 2, (u) => { const a = Math.PI / 2 + u / rad; return [rad + rad * Math.cos(a), H - rad + rad * Math.sin(a)]; }, null],
        [H - 2 * rad, (u) => [0, H - rad - u], [-1, 0]],
        [Math.PI * rad / 2, (u) => { const a = Math.PI + u / rad; return [rad + rad * Math.cos(a), rad + rad * Math.sin(a)]; }, null],
      ];
      for (const [len, f, n] of segs) {
        if (d <= len) {
          const p = f(d);
          if (n) return [p, n];
          const cx = p[0] < W / 2 ? rad : W - rad, cy = p[1] < H / 2 ? rad : H - rad;
          const l = Math.hypot(p[0] - cx, p[1] - cy) || 1;
          return [p, [(p[0] - cx) / l, (p[1] - cy) / l]];
        }
        d -= len;
      }
      return [[rad, 0], [0, -1]];
    };
    /* Where the points sit around the outline: four on each corner, so
       the settled shape keeps true round corners (spread evenly, a corner
       only got one point and came out lumpy, then snapped round when the
       real card took over), and the rest spread along the sides. */
    const sides = [W - 2 * rad, H - 2 * rad, W - 2 * rad, H - 2 * rad];
    const arc = Math.PI * rad / 2, CP = 4, M = N - 4 * CP;
    const ds = [];
    let d0 = 0;
    sides.forEach((len) => {
      const m = Math.max(1, Math.round(M * len / (2 * (W + H - 4 * rad))));
      for (let i = 0; i < m; i++) ds.push(d0 + len * i / m);
      d0 += len;
      for (let i = 0; i < CP; i++) ds.push(d0 + arc * i / CP);
      d0 += arc;
    });
    const seed = [Math.random() * 6.28, Math.random() * 6.28, Math.random() * 6.28];
    const wave = (dist) => {
      const a = dist / per * Math.PI * 2;
      return 12 * Math.sin(a * 5 + seed[0]) + 7.5 * Math.sin(a * 9 + seed[1]) + 5 * Math.sin(a * 14 + seed[2]) + 6.5;
    };
    const toU = ([x, y]) => [2 + x * 40 / W, 2 + y * 56 / H];
    const f3 = (v) => v.toFixed(3);
    const path = (push) => {
      const K = ds.length, pts = [], tan = [];
      ds.forEach((dist) => {
        const [p, n] = at(dist);
        const o = push ? wave(dist) : 0;
        pts.push([p[0] + n[0] * o, p[1] + n[1] * o]);
        tan.push([-n[1], n[0]]);   // along the outline, clockwise
      });
      let d = `M${toU(pts[0]).map(f3).join(' ')}`;
      for (let i = 0; i < K; i++) {
        const j = (i + 1) % K, p1 = pts[i], p2 = pts[j];
        let c1, c2;
        if (!push) {
          // The settled card: handles along the true tangent, a third of the
          // way, which traces the straight sides and round corners exactly.
          const h = (((ds[j] - ds[i]) + per) % per) / 3;
          c1 = [p1[0] + tan[i][0] * h, p1[1] + tan[i][1] * h];
          c2 = [p2[0] - tan[j][0] * h, p2[1] - tan[j][1] * h];
        } else {
          // The splat: a smooth curve through the points (Catmull-Rom).
          const p0 = pts[(i - 1 + K) % K], p3 = pts[(i + 2) % K];
          c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
          c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
        }
        d += `C${[...toU(c1), ...toU(c2), ...toU(p2)].map(f3).join(' ')}`;
      }
      return d + 'Z';
    };
    const clean = path(false), ragged = path(true);
    blank.setAttribute('d', clean);
    const anim = blank.querySelector('animate');
    if (!anim) return;
    // Clean until impact, ragged at full splat, then one long settle back
    // to clean, quick at first and slowing all the way, as batter pulls
    // itself together (two stages here made it lurch near the end). The
    // sheet's own draw-in uses the same curve.
    const T = (ms) => (ms / RESUME).toFixed(4);
    anim.setAttribute('dur', `${RESUME}ms`);
    anim.setAttribute('values', `${clean};${clean};${ragged};${clean};${clean}`);
    anim.setAttribute('keyTimes', `0;${T(HIT)};${T(SPLAT)};${T(SETTLED)};1`);
    anim.setAttribute('keySplines', '0 0 1 1;.1 .8 .25 1;.2 .6 .3 1;0 0 1 1');

  };

  // The same test the resume page uses to swap the embedded PDF for a card.
  const noInlinePdf = () => {
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return ios || /Android/.test(ua) || navigator.pdfViewerEnabled === false;
  };

  /* The batter thrown off at impact, around the document's rectangle t: a
     couple of dozen drops of varied size that fly out from the edge and
     stick, and four runs down the two sides. Timed from the splat. */
  const splatter = (veil, t) => {
    const life = LIFE;
    const cx = t.left + t.width / 2, cy = t.top + t.height / 2;
    const hw = t.width * 0.545, hh = t.height * 0.535;   // the splat's spread
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 22; i++) {
      // A point on the splat's edge, then out from it.
      const a = Math.random() * Math.PI * 2;
      const ex = Math.cos(a), ey = Math.sin(a);
      const k = 1 / Math.max(Math.abs(ex) / hw, Math.abs(ey) / hh);
      const px = cx + ex * k, py = cy + ey * k;
      const out = 10 + Math.pow(Math.random(), 1.4) * 75;
      const x = px + ex * out, y = py + ey * out;
      const d = document.createElement('i');
      d.className = 'hop-drop';
      const sz = 4.5 + Math.pow(Math.random(), 1.8) * 19 * (1 - out / 130);   // bigger close in, fine spray further out
      d.style.cssText = `--x:${x.toFixed(1)}px;--y:${y.toFixed(1)}px;--s:${sz.toFixed(1)}px;--k:${(0.8 + Math.random() * 0.45).toFixed(2)};`
        + `--fx:${(-ex * out).toFixed(1)}px;--fy:${(-ey * out).toFixed(1)}px;--slide:${(4 + Math.random() * 14).toFixed(1)}px;`
        + `--delay:${SPLAT - 10 + Math.round(Math.random() * 40)}ms;--life:${life}ms`;
      frag.appendChild(d);
    }
    [[-1, 0.22], [1, 0.3], [-1, 0.48], [1, 0.56]].forEach(([side, f], i) => {
      const r = document.createElement('i');
      r.className = 'hop-run';
      const w = 8 + Math.random() * 6;
      const x = cx + side * (hw - w * 0.15), y = t.top + t.height * (f + (Math.random() - 0.5) * 0.08);
      r.style.cssText = `--x:${x.toFixed(1)}px;--y:${y.toFixed(1)}px;--w:${w.toFixed(1)}px;--len:${(50 + Math.random() * 60).toFixed(0)}px;`
        + `--drop:${(30 + Math.random() * 50).toFixed(0)}px;--delay:${SPLAT + 30 + i * 40}ms;--life:${life - i * 40}ms`;
      frag.appendChild(r);
    });
    (veil.querySelector('.hop-fx') || veil).appendChild(frag);
  };

  /* Nothing scrolls while a scene plays: wheel, touch and the scroll keys
     are held off until the next page opens (or the page comes back from
     the cache, below). Held off rather than hiding the scrollbar, so the
     page does not shift sideways as the scene starts. */
  const SCROLL_KEYS = new Set([' ', 'PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
  const hold = (e) => { if (e.cancelable) e.preventDefault(); };
  const holdKeys = (e) => { if (SCROLL_KEYS.has(e.key)) e.preventDefault(); };
  const lock = (on) => {
    const f = on ? addEventListener : removeEventListener;
    f('wheel', hold, { passive: false });
    f('touchmove', hold, { passive: false });
    f('keydown', holdKeys);
  };

  const injectCss = () => {
    if (document.getElementById('hopStyle')) return;
    const st = document.createElement('style');
    st.id = 'hopStyle';
    st.textContent = css;
    document.head.appendChild(st);
  };

  /* The resume page and its document are fetched ahead of the click, as
     soon as the pointer or a finger is on a link to it. */
  let warmed = false;
  const warm = () => {
    if (warmed) return;
    warmed = true;
    ['resume.html'].concat(noInlinePdf() ? [] : ['Ajay_Sommi_Resume.pdf']).forEach((h) => {
      const l = document.createElement('link');
      l.rel = 'prefetch';
      l.href = h;
      document.head.appendChild(l);
    });
  };
  const toResume = (e) => { const a = e.target.closest?.('a[href]'); if (a && /resume\.html$/i.test(a.pathname)) warm(); };
  document.addEventListener('pointerover', toResume, { passive: true });
  document.addEventListener('touchstart', toResume, { passive: true });
  document.addEventListener('focusin', toResume);

  /* ---- the flight ------------------------------------------------------

     Where an SVG's drawing actually is on screen: its viewBox fitted into
     its box (centred, uniform scale), as the browser lays it out. */
  const fit = (vb, r) => {
    const s = Math.min(r.width / vb[2], r.height / vb[3]);
    return { s, ox: r.left + (r.width - vb[2] * s) / 2 - vb[0] * s, oy: r.top + (r.height - vb[3] * s) / 2 - vb[1] * s };
  };
  const navMark = () => {
    const el = document.querySelector('header.nav .brand-mark svg.brand-aj');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return r.width && r.height && r.bottom > 0 && r.top < innerHeight ? el : null;
  };
  const FLY = 680;

  /* Lifts the nav's mark out of the bar and flies it to `to` (a viewBox and
     the box that viewBox will be drawn in on the next page), growing as it
     goes, in one unbroken sweep. Across and down run as two motions on
     their own curves, each a single ease from start to end with no stops in
     between: the copy's frame carries it across, and the mark inside it
     carries the rise, the growth and a soft overshoot as it lands, so the
     path bends gently and the speed never dips midway. The copy is drawn at
     its final size and scaled down to start, so it is sharp where it lands.
     Resolves when it has landed (at once if there is no mark to fly). */
  const fly = (to, dress) => new Promise((done) => {
    const src = navMark();
    if (!src) { done(); return; }
    const svb = src.viewBox.baseVal;
    const from = fit(svb && svb.width ? [svb.x, svb.y, svb.width, svb.height] : [9, 8.5, 45, 42], src.getBoundingClientRect());
    const end = fit(to.vb, to.rect);
    const [vx, vy, vw, vh] = to.vb;
    const w = vw * end.s, h = vh * end.s;
    const left = end.ox + vx * end.s, top = end.oy + vy * end.s;
    // Centre of the drawing at the start and at the end, and the scale between.
    const cx = vx + vw / 2, cy = vy + vh / 2;
    const dx = from.ox + cx * from.s - (left + w / 2);
    const dy = from.oy + cy * from.s - (top + h / 2);
    const k = from.s / end.s;
    const frame = document.createElement('div');
    frame.className = 'hop-fly';
    frame.setAttribute('aria-hidden', 'true');
    Object.assign(frame.style, { left: `${left}px`, top: `${top}px`, width: `${w}px`, height: `${h}px` });
    const f = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    f.setAttribute('viewBox', to.vb.join(' '));
    f.innerHTML = src.innerHTML;
    if (dress) dress(f);
    Object.assign(f.style, { display: 'block', width: '100%', height: '100%', overflow: 'visible', transformOrigin: '50% 50%', willChange: 'transform' });
    frame.appendChild(f);
    document.body.appendChild(frame);
    src.style.visibility = 'hidden';
    const across = frame.animate(
      [{ transform: `translateX(${dx}px)` }, { transform: 'none' }],
      { duration: FLY, easing: 'cubic-bezier(.45, 0, .2, 1)', fill: 'forwards' });
    f.animate(
      [{ transform: `translateY(${dy}px) scale(${k})` }, { transform: 'none' }],
      { duration: FLY, easing: 'cubic-bezier(.55, 0, .25, 1.08)', fill: 'forwards' });
    across.finished.then(done, done);
  });

  /* Where the resume scene's mark stands when the scene begins: laid out
     unseen from the scene's own markup, so it always matches. */
  const resumeMarkBox = () => {
    const probe = document.createElement('div');
    probe.className = 'hop hop-r';
    probe.style.visibility = 'hidden';
    probe.innerHTML = noInlinePdf()
      ? `<span class="hop-stage">${mark}${sheet.replace('viewBox="2 2 40 56" preserveAspectRatio="none"', 'viewBox="-6 -6 58 70"')}</span>`
      : `<span class="hop-stage">${mark}<span class="hop-slot"></span></span>`;
    document.body.appendChild(probe);
    probe.querySelectorAll('*').forEach((n) => { n.style.animation = 'none'; });
    const rect = probe.querySelector('.hop-mark svg').getBoundingClientRect();
    probe.remove();
    return { vb: [3, 2.5, 57, 54], rect };
  };

  /* The era picker opens on its pixel mark, alone in the middle of a dark
     screen. So the trip there flies the nav's mark to that very spot and,
     as it settles, redraws it in pixels: square by square the pixel mark
     comes in over the smooth one, which fades out from under it, until only
     the pixel mark is left, exactly where the next page draws its own. That
     page then opens with it already in place (see eras.html's loader). */
  const PX = [
    '.......##.......', '......####...bb.', '......####..bbbb', '.....######.bbbb',
    '.....######..bb.', '....########....', '....########.bbb', '...####..###.bbb',
    '...####..####bbb', '..####...####bbb', '..####rrrr...rrr', '.####..rrrrrrrrr',
    '####...rrrrrrrr.', '........rrrrrr..', '..........rr....', '................'
  ];
  const PX_INK = { '#': '#e9e4d8', b: '#3d68ff', r: '#ff6b35' };
  // The part of the smooth mark's drawing that the 16 by 16 grid covers.
  const PX_VB = [8.86, 8.82, 44, 44];
  const MORPH = 1180;   // ms from lift off to the last pixel
  const pixelBox = () => {
    const s = 112, w = document.documentElement.clientWidth, h = innerHeight;
    return { left: (w - s) / 2, top: (h - s) / 2, width: s, height: s };
  };
  const pixelGrid = (box) => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    if (box) { g.setAttribute('x', box[0]); g.setAttribute('y', box[1]); g.setAttribute('width', box[2]); g.setAttribute('height', box[3]); }
    g.setAttribute('viewBox', '0 0 16 16');
    g.setAttribute('shape-rendering', 'crispEdges');
    g.style.overflow = 'visible';
    const cells = [];
    PX.forEach((row, y) => [...row].forEach((ch, x) => {
      if (!PX_INK[ch]) return;
      const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      r.setAttribute('x', x); r.setAttribute('y', y); r.setAttribute('width', 1.02); r.setAttribute('height', 1.02);
      r.setAttribute('fill', PX_INK[ch]);
      r.dataset.ch = ch;
      r.style.opacity = '0';
      g.appendChild(r);
      cells.push(r);
    }));
    // Shuffled, but roughly top to bottom, the way the loader draws them.
    cells.sort((a, b) => (+a.getAttribute('y') + Math.random() * 6) - (+b.getAttribute('y') + Math.random() * 6));
    return { g, cells };
  };
  /* Each piece of the smooth mark fades as its own pixels come in over it,
     so it is never missing before they are there. */
  const pixelate = (cells, smooth, from) => {
    const span = MORPH - from - 140;
    const at = new Map();
    cells.forEach((c, i) => {
      const t = from + span * Math.pow(i / cells.length, .85);
      at.set(c, t);
      c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 90, delay: t, fill: 'forwards' });
    });
    // Which pixels draw which piece: the A, the dot, the stem, the smile.
    const piece = (n) => (n.classList.contains('am-a') ? (c) => c.dataset.ch === '#'
      : n.tagName === 'circle' ? (c) => c.dataset.ch === 'b' && +c.getAttribute('y') < 5
      : n.tagName === 'rect' ? (c) => c.dataset.ch === 'b' && +c.getAttribute('y') >= 5
      : (c) => c.dataset.ch === 'r');
    smooth.forEach((n) => {
      const times = cells.filter(piece(n)).map((c) => at.get(c)).sort((a, b) => a - b);
      if (!times.length) return;
      const start = times[Math.floor(times.length * .45)], end = times[times.length - 1] + 90;
      n.animate([{ opacity: 1 }, { opacity: 0 }], { duration: Math.max(80, end - start), delay: start, easing: 'ease-in', fill: 'forwards' });
    });
  };
  const pixelFly = () => {
    const rect = pixelBox();
    const t0 = performance.now();
    const ended = () => new Promise((r) => setTimeout(r, Math.max(0, MORPH + 60 - (performance.now() - t0))));
    if (!navMark()) {
      // No mark in view to carry over: the pixel one simply comes in there.
      const { g, cells } = pixelGrid();
      g.classList.add('hop-fly');
      Object.assign(g.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
      document.body.appendChild(g);
      pixelate(cells, [], 120);
      return ended();
    }
    return fly({ vb: PX_VB, rect }, (f) => {
      const smooth = [...f.children];
      // The smooth mark's ink turns to the pixel mark's as the room darkens.
      f.querySelectorAll('.am-a').forEach((a) => a.animate([{ fill: getComputedStyle(a).fill }, { fill: PX_INK['#'] }], { duration: 420, easing: 'ease', fill: 'forwards' }));
      const { g, cells } = pixelGrid(PX_VB);
      f.appendChild(g);
      pixelate(cells, smooth, 300);
    }).then(ended);
  };

  /* Where the standard site's loading screen draws its mark. This page carries
     the same stylesheet, so the loader's own markup is laid out here unseen
     and measured: whatever size the screen gives the mark and its bar, the
     flight lands on it. Its paper runs the large viewport's height, unless
     the page opens on a #link. */
  const homeMarkBox = (u) => {
    const probe = document.createElement('div');
    probe.className = 'page-loader is-fixed';
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = `visibility:hidden;pointer-events:none;bottom:auto;height:${u.hash ? '100vh' : '100lvh'}`;
    probe.innerHTML = '<div class="loader-card"><div class="m-load"><span class="m-load-mark"></span>' +
      '<span class="m-load-bar"><span class="m-load-line"></span></span></div></div>';
    document.body.appendChild(probe);
    const rect = probe.querySelector('.m-load-mark').getBoundingClientRect();
    probe.remove();
    return { vb: [8, 8, 48, 42], rect };
  };

  const go = (url) => {
    if (going) return;
    if (reduce.matches) { location.href = url; return; }
    const u = new URL(url, location.href);
    const forResume = /resume\.html$/i.test(u.pathname);
    const forHome = isEras(u);
    const forClassic = isClassic(u);
    going = true;
    lock(true);
    injectCss();
    const veil = document.createElement('div');
    veil.className = `hop ${forResume || forHome || forClassic ? 'hop-lead' : 'hop-p'}${forHome ? ' hop-px' : ''}`;
    veil.setAttribute('aria-hidden', 'true');
    // For the resume and home the paper only fades in here, under the mark
    // in flight: the scene itself plays on the next page.
    if (!forResume && !forHome && !forClassic) veil.innerHTML = mark;
    document.body.appendChild(veil);
    // Fades in from the very next style change, not after a frame or two,
    // so the paper is never late under the flying mark.
    void veil.offsetWidth;
    veil.classList.add('is-on');
    if (forResume || forHome || forClassic) {
      try { sessionStorage.setItem(forResume ? 'hop-scene' : forHome ? 'hop-px' : 'hop-home', '1'); } catch { location.href = url; return; }
      if (forResume) warm();
      (forResume ? fly(resumeMarkBox()) : forHome ? pixelFly() : fly(homeMarkBox(u))).then(() => { location.href = url; });
      return;
    }
    setTimeout(() => { location.href = url; }, DANCE + 60);
  };

  /* The resume scene, played on the resume page itself. The page is built
     under paper (resume.html's own head puts it up so nothing shows first);
     once the fonts are in and the layout has settled, the scene starts, and
     its sheet lands on the document's real box. The scene then waits, if it
     has to, for the document itself to finish loading and paint, and only
     then lifts away, so the resume is simply there. */
  const scene = () => {
    going = true;
    lock(true);
    injectCss();
    scrollTo(0, 0);
    const soft = noInlinePdf();
    const veil = document.createElement('div');
    veil.className = `hop hop-r hop-live${soft ? ' hop-soft' : ''}`;
    veil.setAttribute('aria-hidden', 'true');
    veil.innerHTML = soft
      ? `<span class="hop-stage">${mark}${sheet.replace('viewBox="2 2 40 56" preserveAspectRatio="none"', 'viewBox="-6 -6 58 70"')}</span>`
      : `<span class="hop-stage">${mark}<span class="hop-slot"></span></span><div class="hop-fx">${sheet}</div>`;
    document.body.appendChild(veil);
    if (!soft) {
      const sheetEl = veil.querySelector('.hop-sheet');
      const slotEl = veil.querySelector('.hop-slot');
      aimSheet(sheetEl, slotEl);
      splatter(veil, docRect());
      /* The sheet lands on wherever the document actually is, not where it
         was when the scene began: a window resized meanwhile, a scrollbar
         arriving, a late font moving the heading, and the box has moved or
         changed size. So it is measured again as the scene runs, and the
         sheet re-aimed whenever it has shifted. */
      let fitted = docRect();
      const refit = () => {
        const r = docRect();
        if (Math.abs(r.left - fitted.left) > 0.25 || Math.abs(r.top - fitted.top) > 0.25 ||
            Math.abs(r.width - fitted.width) > 0.25 || Math.abs(r.height - fitted.height) > 0.25) {
          fitted = r;
          aimSheet(sheetEl, slotEl);
        }
      };
      addEventListener('resize', refit);
      veil.__refit = refit;
      /* The wobbly outline is an SVG animation, and each browser starts its
         clock at its own moment: Firefox a fifth of a second after the CSS
         one, Chrome a touch before it. So it is not left to run by itself:
         its time is set, every frame, from the sheet's own CSS animation, so
         the two cannot drift apart and the outline lands in step with the
         sheet's size in every browser. */
      const svg = sheetEl.querySelector('svg');
      if (svg && svg.pauseAnimations && svg.setCurrentTime) {
        svg.pauseAnimations();
        svg.setCurrentTime(0);
        const began = performance.now();
        let frameNo = 0;
        const drive = () => {
          const a = sheetEl.getAnimations && sheetEl.getAnimations().find((x) => x.animationName === 'hop-sheet');
          const t = a && typeof a.currentTime === 'number' ? a.currentTime : performance.now() - began;
          svg.setCurrentTime(Math.min(t, RESUME + 60) / 1000);
          if ((frameNo++ & 7) === 0) refit();
          if (t < RESUME + 30 && veil.isConnected) requestAnimationFrame(drive);
        };
        requestAnimationFrame(drive);
      }
    }
    // The page's own paper hands over to the scene's, the same colour.
    requestAnimationFrame(() => document.documentElement.classList.remove('hop-scene'));

    /* The document: loaded, and a beat for the viewer to paint it. In
       Chrome and Firefox the frame has been loading since the page began,
       behind the paper, and is long since ready. (It is left visible: Firefox
       does not load a PDF in a frame that is hidden.) Safari draws the PDF's
       own controls above everything on the page, a veil included, so there
       the frame is only created a little before it is wanted, and those
       controls turn up with the document rather than over the scene. */
    const frame = document.querySelector('#pdfEmbed iframe');
    const ua = navigator.userAgent;
    const webkit = /Safari\//.test(ua) && !/(Chrome|Chromium|CriOS|FxiOS|Edg|OPR|Android)/.test(ua);
    const late = !!frame && !soft && webkit && !frame.getAttribute('src');
    const docReady = soft || !frame ? Promise.resolve() : new Promise((done) => {
      const arm = () => frame.addEventListener('load', () => setTimeout(done, 500), { once: true });
      if (late) {
        // A frame with no address reports a load of its own (a blank page),
        // which is not the document; only the load after the address counts.
        setTimeout(() => { frame.dataset.loaded = ''; arm(); frame.src = frame.dataset.src; }, Math.max(0, RESUME - 750));
      } else if (frame.dataset.loaded === '1') setTimeout(done, 500);
      else arm();
      setTimeout(done, 6000);   // never hold the page hostage
    });
    /* The hand over: as the splat settles, the paper starts to lift and the
       sheet and batter dissolve over the document, which is already there
       and drawn, so the resume is simply visible as they go. */
    const played = new Promise((r) => setTimeout(r, soft ? SOFT : RESUME - 250));
    Promise.all([played, docReady]).then(() => {
      if (veil.__refit) veil.__refit();   // one last look before the hand over
      veil.classList.add('is-lifting');
      setTimeout(() => { if (veil.__refit) removeEventListener('resize', veil.__refit); veil.remove(); lock(false); going = false; }, 1050);
    });
  };

  window.hopTo = go;

  // Coming back with the back button restores this page from the cache,
  // scene and all; clear it away.
  addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    going = false;
    lock(false);
    document.querySelectorAll('.hop, .hop-fly').forEach((n) => n.remove());
    const src = document.querySelector('header.nav .brand-mark svg.brand-aj');
    if (src) src.style.visibility = '';
  });

  // The era picker, and the standard site (the home page) with its own
  // loading screen to land on.
  const isEras = (u) => /\/eras\.html$/.test(u.pathname);
  const isClassic = (u) => /\/(index\.html)?$/.test(u.pathname);

  // Arriving from a click on Resume (see resume.html's head): start once the
  // fonts are in, so the layout the sheet lands on has stopped moving.
  if (window.__hopScene && !reduce.matches) {
    const faces = ['400 1em Geist', '500 1em Geist', '600 1em Geist', '700 1em Geist'];
    const fonts = document.fonts?.load
      ? Promise.all(faces.map((f) => document.fonts.load(f).catch(() => {}))).then(() => document.fonts.ready).catch(() => {})
      : Promise.resolve();
    Promise.race([fonts, new Promise((r) => setTimeout(r, 1200))]).then(scene);
  }

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    let u;
    try { u = new URL(a.getAttribute('href'), location.href); } catch { return; }
    if (u.origin !== location.origin || !/^https?:$/.test(u.protocol)) return;
    if (u.pathname === location.pathname) return;          // same page, an anchor
    if (/\.pdf$/i.test(u.pathname)) return;
    if (isClassic(u) && isClassic(location)) return;       // home to itself
    e.preventDefault();
    go(u.href);
  });
})();
