/* ==========================================================================
   Time of day
   Experiment, with the "Time of day" section at the end of minimal.css. The
   light in the room changes with the visitor's own clock: rose and gold low
   from the left in the early morning, a cool, high white around midday, gold
   again low from the right toward evening, then a faint moonlit blue.

   Written onto the root as four custom properties, worked out from a few
   moments through the day and blended between them minute by minute:

     --tod      the light's colour, as "r g b"
     --tod-a    how strong it is, 0 to 1
     --tod-x/y  where the light comes from, for the soft wash on the ground

   Loaded in the head, not deferred, so the first paint is already in the
   right light. Checked again every few minutes and on coming back to the
   tab. ?hour=18.5 in the address previews any time of day.
   ========================================================================== */
(function timeOfDay() {
  var root = document.documentElement;

  //  hour   colour            strength  from x, y
  var KEYS = [
    [0,    [120, 140, 255],  .45,      80, -10],   // night, moonlight
    [5,    [120, 140, 255],  .40,      20, -10],
    [6,    [255, 150, 130],  .70,       0,  30],   // dawn, rose, low in the east
    [7.5,  [255, 190, 110],  .90,       5,  15],   // early morning gold
    [10,   [255, 225, 180],  .50,      25,  -5],   // morning, softening
    [12.5, [200, 225, 255],  .60,      50, -15],   // midday, cool and high
    [15.5, [210, 225, 255],  .50,      75,  -5],   // afternoon
    [17.5, [255, 180,  90],  .90,      95,  15],   // golden hour, low in the west
    [19,   [255, 135,  95],  .85,     100,  30],   // sunset
    [20.5, [170, 140, 255],  .60,      90,   5],   // dusk
    [22,   [120, 140, 255],  .45,      80, -10],   // night
    [24,   [120, 140, 255],  .45,      80, -10],
  ];

  var forced = null;
  try {
    var q = new URLSearchParams(location.search).get('hour');
    if (q !== null && q !== '' && !isNaN(q)) forced = ((+q % 24) + 24) % 24;
  } catch (e) {}

  var lerp = function (a, b, t) { return a + (b - a) * t; };

  function apply() {
    var now = new Date();
    var h = forced !== null ? forced : now.getHours() + now.getMinutes() / 60;
    var i = 0;
    while (i < KEYS.length - 2 && KEYS[i + 1][0] <= h) i++;
    var a = KEYS[i], b = KEYS[i + 1];
    // Eased, so each colour lingers around its moment and the change
    // between them happens in the hours in between.
    var t = (h - a[0]) / (b[0] - a[0]);
    t = t * t * (3 - 2 * t);
    var rgb = [0, 1, 2].map(function (k) { return Math.round(lerp(a[1][k], b[1][k], t)); });
    var s = root.style;
    s.setProperty('--tod', rgb.join(' '));
    s.setProperty('--tod-a', lerp(a[2], b[2], t).toFixed(3));
    s.setProperty('--tod-x', lerp(a[3], b[3], t).toFixed(1) + '%');
    s.setProperty('--tod-y', lerp(a[4], b[4], t).toFixed(1) + '%');
  }

  apply();
  if (forced === null) {
    setInterval(apply, 5 * 60 * 1000);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) apply();
    });
  }
})();
