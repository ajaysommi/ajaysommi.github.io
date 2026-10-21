/* ==========================================================================
   Time of day
   Experiment, with the "Time of day" section at the end of minimal.css. The
   big shapes behind the page pick up a faint glow at their edges in the
   light of the visitor's part of the day: gold in the morning, a cool
   white-blue in the afternoon, amber in the evening, moonlight blue late at
   night.

   The parts of the day are the greeting's (openerFor in script.js): before
   5 is night ("Still up?"), then morning to noon, afternoon to 6, evening
   after. Keep the two in step.

   Written onto the root as data-daypart. Loaded in the head, not deferred,
   so the first paint is already right; checked again every few minutes and
   on coming back to the tab. ?hour=18 in the address previews any hour.
   ========================================================================== */
(function timeOfDay() {
  var root = document.documentElement;

  var forced = null;
  try {
    var q = new URLSearchParams(location.search).get('hour');
    if (q !== null && q !== '' && !isNaN(q)) forced = ((+q % 24) + 24) % 24;
  } catch (e) {}

  function partOf(hour) {
    if (hour < 5)  return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  function apply() {
    var part = partOf(forced !== null ? forced : new Date().getHours());
    if (root.dataset.daypart !== part) root.dataset.daypart = part;
  }

  apply();
  if (forced === null) {
    setInterval(apply, 5 * 60 * 1000);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) apply();
    });
  }
})();
