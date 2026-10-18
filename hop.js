/* ==========================================================================
   Page hop
   Going from one page of the site to another (the resume, say), the page
   fades to its own paper and the Aj mark does a little happy dance for
   about a second before the next page opens. Links back to the home page
   are left alone, since it has its own loading screen; so are new tabs,
   downloads, mail links and anything on another site. With reduced motion
   the page simply changes.
   ========================================================================== */
(function hop() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const DANCE = 1000;   // ms the mark dances before the next page opens
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
    .hop .hop-body { transform-box: view-box; transform-origin: 50% 100%; animation: hop-dance ${DANCE}ms cubic-bezier(.4, 0, .3, 1) both; }
    .hop .hop-hook { transform-box: fill-box; transform-origin: 50% 0; animation: hop-swing ${DANCE}ms ease-in-out both; }
    .hop .hop-eye { transform-box: fill-box; transform-origin: 50% 100%; animation: hop-eye ${DANCE}ms ease-in-out both; }
    @keyframes hop-dance {
      0%   { transform: translateY(0) scale(1, 1) rotate(0); }
      10%  { transform: translateY(0) scale(1.1, .86) rotate(0); }
      24%  { transform: translateY(-26px) scale(.94, 1.08) rotate(-9deg); }
      36%  { transform: translateY(0) scale(1.12, .84) rotate(0); }
      50%  { transform: translateY(-20px) scale(.95, 1.06) rotate(9deg); }
      62%  { transform: translateY(0) scale(1.1, .88) rotate(0); }
      74%  { transform: translateY(-9px) scale(.98, 1.03) rotate(-4deg); }
      86%  { transform: translateY(0) scale(1.04, .96) rotate(0); }
      100% { transform: translateY(0) scale(1, 1) rotate(0); }
    }
    @keyframes hop-swing {
      0%, 100% { transform: rotate(0); }
      24% { transform: rotate(10deg); }
      50% { transform: rotate(-10deg); }
      74% { transform: rotate(5deg); }
    }
    @keyframes hop-eye {
      0%, 100% { transform: translateY(0) scale(1); }
      20% { transform: translateY(-7px) scale(1.12); }
      36% { transform: translateY(1px) scale(1.15, .8); }
      46% { transform: translateY(-6px) scale(1.1); }
      62% { transform: translateY(1px) scale(1.12, .84); }
      76% { transform: translateY(-3px); }
      88% { transform: translateY(0) scale(1.04, .96); }
    }`;

  const mark = `<svg viewBox="9 8.5 45 42" aria-hidden="true" focusable="false"><g class="hop-body">
      <path class="am-a" d="M10.29 44.57 L30.86 9.90 L43.20 32.70 L43.20 36.19 L36.19 36.19 L30.86 26.67 L20.19 44.57Z"/>
      <path class="hop-hook" d="M26.25 36.19 A13.16 13.16 0 0 0 52.57 36.19 L43.83 36.19 A4.42 4.42 0 0 1 34.99 36.19Z" fill="#ff6b35"/>
      <rect x="43.83" y="24.60" width="8.74" height="11.79" fill="#3d68ff"/>
      <circle class="hop-eye" cx="48.20" cy="17.40" r="5.60" fill="#3d68ff"/>
    </g></svg>`;

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
    veil.innerHTML = mark;
    document.body.appendChild(veil);
    requestAnimationFrame(() => requestAnimationFrame(() => veil.classList.add('is-on')));
    setTimeout(() => { location.href = url; }, DANCE + 80);
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
