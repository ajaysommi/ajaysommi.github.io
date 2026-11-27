/* Fade the bottom edge of window panes while more content is below it. */
(() => {
  const panes = [
    '.tw-panel-in', '.tw-open-mail', '.tw-memory-card', '.mx-sheet-in',
    '.jcard', '.palette-list', '.term-body', '.st-text',
    '.win-body', '.br-page', '.p8-body', '.find-res', '.term-out',
    '.ox-body', '.sp-res', '.fx-side', '.fx-main', '.src', '.xp-pane',
    '.ph-side', '.ph-main', '.ch-list', '.ch-msgs', '.ch-people',
    '.mb-side', '.mb-rows', '.mb-read',
    '.ip-screen .pg', '.note-pg .note', '.cam-card p', '.sms-pg .sms',
    '.mp-list', '.vm-list', '.np-words', '.lcd-story', '.lcd-story .cp', '.nk-txt',
  ].join(', ');
  const watched = new Map();
  const pending = new Set();
  let frame = 0;

  // Town cards paint their fade on the stationary frame around the scroller.
  const surfaceFor = pane => pane.parentElement?.classList.contains('tw-panel-body')
    ? pane.parentElement : pane;

  const update = () => {
    frame = 0;
    // Measure everything before changing any styles.
    const changes = [];
    for (const pane of pending) {
      const height = pane.clientHeight;
      const remaining = pane.scrollHeight - height - Math.max(0, pane.scrollTop);
      const scrollable = height && remaining > 2 && /^(auto|scroll)$/.test(getComputedStyle(pane).overflowY);
      const depth = scrollable ? Math.round(Math.min(50, height * .22, remaining * 1.55)) : 0;
      if (watched.get(pane) !== depth) changes.push([pane, depth]);
    }
    pending.clear();
    for (const [pane, depth] of changes) {
      watched.set(pane, depth);
      const surface = surfaceFor(pane);
      if (depth) surface.style.setProperty('--scroll-cue-depth', `${depth}px`);
      else surface.style.removeProperty('--scroll-cue-depth');
      if (surface === pane) pane.classList.toggle('has-scroll-cue', depth > 0);
    }
  };

  const schedule = (pane) => {
    if (!watched.has(pane)) return;
    pending.add(pane);
    if (!frame) frame = requestAnimationFrame(update);
  };
  const resize = new ResizeObserver((entries) => entries.forEach(({ target }) => schedule(target)));

  const visit = (node, callback) => {
    if (!(node instanceof HTMLElement)) return;
    if (node.matches(panes)) callback(node);
    node.querySelectorAll(panes).forEach(callback);
  };

  const watch = (pane) => {
    if (watched.has(pane) || !pane.isConnected) return;
    watched.set(pane, 0);
    resize.observe(pane);
    schedule(pane);
  };
  const unwatch = (pane) => {
    if (pane.isConnected || !watched.delete(pane)) return;
    resize.unobserve(pane);
    pending.delete(pane);
    surfaceFor(pane).style.removeProperty('--scroll-cue-depth');
    pane.classList.remove('has-scroll-cue');
  };

  const refreshContaining = (node) => {
    let pane = node instanceof HTMLElement ? node.closest(panes) : node.parentElement?.closest(panes);
    while (pane) {
      schedule(pane);
      pane = pane.parentElement?.closest(panes);
    }
  };

  visit(document.body, watch);
  new MutationObserver((records) => {
    for (const { target, addedNodes, removedNodes } of records) {
      refreshContaining(target);
      addedNodes.forEach((node) => visit(node, watch));
      removedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        for (const pane of watched.keys()) if (node.contains(pane)) unwatch(pane);
      });
    }
  }).observe(document.body, { subtree: true, childList: true, characterData: true });
  document.addEventListener('scroll', (event) => schedule(event.target), { capture: true, passive: true });
  ['load', 'toggle', 'transitionend'].forEach((event) => {
    document.addEventListener(event, ({ target }) => refreshContaining(target), true);
  });
  document.fonts?.ready.then(() => watched.forEach((_, pane) => schedule(pane)));
})();
