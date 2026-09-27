/* ==========================================================================
   Haptics
   A light tap under the finger when something is pressed on a phone. The
   web has no haptics API on iPhone: navigator.vibrate is Android only. Since
   iOS 18, though, Safari gives a switch style checkbox (<input type=checkbox
   switch>) the same tick a native switch makes, and toggling one through its
   label from inside a tap plays it. So each tap flicks a hidden switch that
   exists only for that instant. Older iPhones ignore it, Android gets a
   short vibration instead, and either way the phone's own haptics setting
   decides: anyone who has turned system haptics off feels nothing.

   Touch screens only, real taps only: keyboard presses and clicks made by
   script (detail 0, or untrusted) stay silent, and so does a carousel drag,
   which stops its click before it gets here.

   Its own file, loaded by every page, because the resume page does not load
   script.js; tucked inside it, the resume page's buttons never ticked.
   ========================================================================== */
(function haptics() {
  if (!matchMedia('(hover: none) and (pointer: coarse)').matches) return;

  const TARGETS = 'a[href], button, [role="button"], summary, label, select, input[type="checkbox"], input[type="radio"]';

  const iosTick = () => {
    const label = document.createElement('label');
    label.setAttribute('aria-hidden', 'true');
    label.style.display = 'none';
    const sw = document.createElement('input');
    sw.type = 'checkbox';
    sw.setAttribute('switch', '');
    label.appendChild(sw);
    // The switch's own click must not reach the page's click handlers.
    label.addEventListener('click', (e) => e.stopPropagation());
    document.head.appendChild(label);
    label.click();
    label.remove();
  };

  const tick = typeof navigator.vibrate === 'function'
    ? () => navigator.vibrate(10)
    : iosTick;

  document.addEventListener('click', (e) => {
    if (!e.isTrusted || e.detail === 0) return;
    const el = e.target.closest?.(TARGETS);
    if (!el || el.matches(':disabled, [aria-disabled="true"]')) return;
    try { tick(); } catch {}
  });
})();
