/* ==========================================================================
   Ajay Sommi portfolio behaviour
   Vanilla ES module, no dependencies. Every block is defensive: if an element
   is missing the feature quietly no-ops instead of throwing and killing the
   rest of the page.
   ========================================================================== */

const root = document.documentElement;
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const reduceMotionQuery = matchMedia('(prefers-reduced-motion: reduce)');
const coarsePointer = matchMedia('(hover: none)');
const prefersReduced = () => reduceMotionQuery.matches;

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

/* ==========================================================================
   Shared scroll engine
   One rAF-throttled scroll listener drives every scroll-linked effect, so
   adding effects never adds listeners. A job does its reading and may
   return a function that does its writing: every job reads before any job
   writes, so one effect's write never makes the next effect's read lay the
   page out again in the middle of the frame.
   ========================================================================== */
const onScrollFrame = (() => {
  const jobs = [];
  let ticking = false;

  const run = () => {
    ticking = false;
    const writes = [];
    for (const job of jobs) {
      const w = job();
      if (typeof w === 'function') writes.push(w);
    }
    for (const w of writes) w();
  };

  const request = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(run); }
  };

  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request, { passive: true });

  const add = (job) => {
    jobs.push(job);
    const w = job();
    if (typeof w === 'function') w();
    return request;
  };
  // Shared with the design's own script (minimal.js), which is not a module.
  window.onScrollFrame = add;
  return add;
})();

/* ==========================================================================
   Time of day: the greeting and the sky

   One reading of the clock drives both, so they can never disagree.

   The sky is not a set of named phases. The sun is put on an arc through the
   day and everything else follows from where it lands: the surface shading,
   the terminator, the atmosphere colour, the stars, the city lights. Six in
   the morning is genuinely a different picture from half seven, because the
   sun is genuinely somewhere else.

   The greeting runs before the scramble effect reads the heading, so what it
   writes is what gets scrambled into place. The tail is taken from the markup
   rather than repeated here, so the sentence stays in one place and a visitor
   without JavaScript still gets a whole one.
   ========================================================================== */
(function sky() {
  const card = $('#heroCard');
  const el = $('[data-scramble]');

  /* ---- colour helpers -------------------------------------------------- */

  const hex = (h) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const css = (c) => 'rgb(' + c[0] + ' ' + c[1] + ' ' + c[2] + ')';
  const rgba = (c, a) => 'rgb(' + c[0] + ' ' + c[1] + ' ' + c[2] + ' / ' + a.toFixed(3) + ')';

  /* ---- the palette, keyed to how high the sun is ------------------------

     Each stop is what the scene looks like at that solar elevation, from
     -1 (midnight, sun straight through the planet) to 1 (noon overhead).
     Between stops everything is interpolated, which is where the detail
     comes from: there is no step anywhere, just a curve. */
  const STOPS = [
    { e: -1.00, skyDeep: '#03040a', skyHigh: '#070c18', atmo: '#4c93e8', atmoA: .34,
      surfLit: '#0d2038', surfDark: '#03050b', sun: '#cfe2ff', sunA: .20,
      land: '#24507f', landA: .22, sea: '#12325c', seaA: .18, glint: '#5f86c4',
      star: 1, city: .90 },

    { e: -0.28, skyDeep: '#04060d', skyHigh: '#0d1226', atmo: '#5f80d8', atmoA: .38,
      surfLit: '#132844', surfDark: '#03050c', sun: '#e6d8ff', sunA: .24,
      land: '#2d5580', landA: .32, sea: '#173a63', seaA: .28, glint: '#7f9ed2',
      star: .82, city: .78 },

    { e: -0.08, skyDeep: '#06070f', skyHigh: '#141633', atmo: '#8a7ae0', atmoA: .42,
      surfLit: '#1b2c4d', surfDark: '#04060d', sun: '#ffd9b0', sunA: .30,
      land: '#4a4a76', landA: .42, sea: '#22426b', seaA: .40, glint: '#a9a7de',
      star: .52, city: .58 },

    { e:  0.05, skyDeep: '#0a0c18', skyHigh: '#241f38', atmo: '#ff8f5e', atmoA: .50,
      surfLit: '#2e4763', surfDark: '#070a13', sun: '#ffe3bc', sunA: .42,
      land: '#6a5566', landA: .50, sea: '#2c4f75', seaA: .52, glint: '#ffd0a0',
      star: .20, city: .32 },

    { e:  0.34, skyDeep: '#07101f', skyHigh: '#16294a', atmo: '#7fb6f0', atmoA: .50,
      surfLit: '#2b5b87', surfDark: '#06111f', sun: '#fff4de', sunA: .45,
      land: '#3d6f6a', landA: .58, sea: '#26608f', seaA: .58, glint: '#dceeff',
      star: .04, city: .06 },

    { e:  1.00, skyDeep: '#071022', skyHigh: '#10223d', atmo: '#63b8ff', atmoA: .50,
      surfLit: '#2f6ba0', surfDark: '#071426', sun: '#ffffff', sunA: .45,
      land: '#3f7a63', landA: .62, sea: '#2a72ab', seaA: .62, glint: '#ffffff',
      star: 0, city: 0 },
  ];

  /* Dawn and dusk are not the same colour and never have been: morning air is
     thin and clean, evening air has had all day to pick up dust. Rather than
     tinting one table after the fact, which turned everything mauve, the
     setting sun gets its own stops. They only differ where the sun is low;
     at true noon and true midnight both tables hold the same values, so
     switching between them at those points changes nothing.

     The amber runs across the whole globe here, not just the sky, because
     that is what low light does: it travels through far more atmosphere
     before it reaches the ground. */
  const DUSK = {
    '-0.28': { atmo: '#c0603f', skyHigh: '#1a1024', surfLit: '#2f2536', sun: '#ffb98a',
               land: '#4e3a44', sea: '#332b46', glint: '#c98f74' },
    '-0.08': { atmo: '#ff7a4a', skyHigh: '#2a1729', surfLit: '#3d3346', sun: '#ffd0a0',
               land: '#6d4b4a', sea: '#3d3352', glint: '#ffb98a' },
    '0.05':  { atmo: '#ff6a3c', skyHigh: '#33203a', surfLit: '#4d4254', sun: '#ffe0b4',
               land: '#7d5550', sea: '#48405c', glint: '#ffc79a' },
    '0.34':  { atmo: '#ffa46a', skyHigh: '#1d2c4a', surfLit: '#41607c', sun: '#fff0d4',
               land: '#5d7564', sea: '#3d6a90', glint: '#ffe6c8' },
  };

  /* The light theme is the same sphere with the contrast running the other
     way: a white planet under a white sky, shaded down rather than lit up.
     Nothing here changes what the scene is doing, only what it is made of,
     so the structure below is identical and only the values differ.

     Midnight and terminal both use the tables above. You said both were
     already right, so neither is touched. */
  const LIGHT_STOPS = [
    { e: -1.00, skyDeep: '#e9edf5', skyHigh: '#dbe2f0', atmo: '#93a9c8', atmoA: .50,
      surfLit: '#f3f6fb', surfDark: '#d5dceb', sun: '#dfe8fa', sunA: .16,
      land: '#bfcadc', landA: .30, sea: '#ccd6e6', seaA: .26, glint: '#e8eef8',
      star: 1, city: .55 },

    { e: -0.28, skyDeep: '#ebeef6', skyHigh: '#e0e5f2', atmo: '#9fa9d2', atmoA: .50,
      surfLit: '#f5f7fb', surfDark: '#dae0ee', sun: '#e9e4fb', sunA: .20,
      land: '#c4c9dd', landA: .38, sea: '#d0d6e8', seaA: .34, glint: '#ecf0f8',
      star: .82, city: .46 },

    { e: -0.08, skyDeep: '#eeedf6', skyHigh: '#e6e2f2', atmo: '#ab9ad6', atmoA: .50,
      surfLit: '#f7f5fc', surfDark: '#ded9ec', sun: '#ffe6d2', sunA: .26,
      land: '#c8c1da', landA: .46, sea: '#d3d1e7', seaA: .44, glint: '#f2edf9',
      star: .52, city: .34 },

    { e:  0.05, skyDeep: '#f5efec', skyHigh: '#f7f1ee', atmo: '#ffa87c', atmoA: .50,
      surfLit: '#fdf8f4', surfDark: '#e8dcd7', sun: '#ffeeda', sunA: .38,
      land: '#dccdc4', landA: .52, sea: '#dbd6e2', seaA: .52, glint: '#fff3e4',
      star: .20, city: .18 },

    { e:  0.34, skyDeep: '#f1f6fc', skyHigh: '#e6effb', atmo: '#8cc4f2', atmoA: .50,
      surfLit: '#fbfdff', surfDark: '#e0e9f5', sun: '#ffffff', sunA: .40,
      land: '#c3d9d0', landA: .56, sea: '#cadef1', seaA: .56, glint: '#ffffff',
      star: .04, city: .05 },

    { e:  1.00, skyDeep: '#f4f8ff', skyHigh: '#e9f2fd', atmo: '#7bbdff', atmoA: .50,
      surfLit: '#ffffff', surfDark: '#e2ebf7', sun: '#ffffff', sunA: .40,
      land: '#bcd8cb', landA: .60, sea: '#c2daef', seaA: .60, glint: '#ffffff',
      star: 0, city: 0 },
  ];

  const LIGHT_DUSK = {
    '-0.28': { atmo: '#cf9c8e', skyHigh: '#f6f1f1', surfLit: '#f8f2f1', sun: '#ffd9bd',
               land: '#d4c5c3', sea: '#dad2d6', glint: '#f4eae5' },
    '-0.08': { atmo: '#ff9a72', skyHigh: '#f9ece7', surfLit: '#fbf3ef', sun: '#ffe0c2',
               land: '#dec9c0', sea: '#e0d4d2', glint: '#ffefe0' },
    '0.05':  { atmo: '#ff8a60', skyHigh: '#faece3', surfLit: '#fdf5ef', sun: '#ffeed8',
               land: '#e4ccc0', sea: '#e4d6d0', glint: '#fff5e8' },
    '0.34':  { atmo: '#ffb98c', skyHigh: '#f6f6fc', surfLit: '#fdf9f6', sun: '#fff9ee',
               land: '#d4dace', sea: '#d6deec', glint: '#fff9f0' },
  };

  const COLOURS = ['skyDeep', 'skyHigh', 'atmo', 'surfLit', 'surfDark', 'sun', 'land', 'sea', 'glint'];
  const NUMBERS = ['atmoA', 'sunA', 'landA', 'seaA', 'star', 'city'];

  /* Pre-parse every table once, so the five minute tick is not re-reading
     hex strings. Each theme ends up with a rising pair and a setting pair. */
  function prepare(stops, dusk) {
    const rise = stops.map((st) => {
      const out = { e: st.e };
      COLOURS.forEach((k) => { out[k + '_'] = hex(st[k]); });
      NUMBERS.forEach((k) => { out[k] = st[k]; });
      return out;
    });
    const set = stops.map((st) => {
      const over = dusk[st.e.toFixed(2)] || {};
      const out = { e: st.e };
      COLOURS.forEach((k) => { out[k + '_'] = hex(over[k] || st[k]); });
      NUMBERS.forEach((k) => { out[k] = st[k]; });
      return out;
    });
    return { rise, set };
  }

  const TABLES = {
    dark:  prepare(STOPS, DUSK),
    light: prepare(LIGHT_STOPS, LIGHT_DUSK),
  };

  /* Only the light theme differs. Terminal is dark, and so is anything the
     page has not decided on yet. */
  const tablesNow = () =>
    (root.dataset.theme === 'daylight' ? TABLES.light : TABLES.dark);

  function paletteAt(table, e) {
    let i = 0;
    while (i < table.length - 2 && e > table[i + 1].e) i++;
    const a = table[i], b = table[i + 1];
    const t = clamp((e - a.e) / (b.e - a.e), 0, 1);

    const out = {};
    COLOURS.forEach((k) => { out[k] = mix(a[k + '_'], b[k + '_'], t); });
    NUMBERS.forEach((k) => { out[k] = a[k] + (b[k] - a[k]) * t; });
    return out;
  }

  /* ---- where the sun is ------------------------------------------------

     A day is one turn. Six is sunrise on the left, noon is overhead, six in
     the evening is sunset on the right, and midnight puts the sun straight
     down through the planet. Everything else in here is a consequence of
     this one angle. */
  function solar(now) {
    const h = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
    const a = ((h - 6) / 12) * Math.PI;

    const elev = Math.sin(a);                 // -1 at midnight, 1 at noon
    const x = 50 - 42 * Math.cos(a);          // 8% at dawn, 92% at dusk
    return { h, elev, x, rising: Math.cos(a) > 0 };
  }

  /* ---- writing it onto the card ---------------------------------------- */

  function paint(now) {
    if (!card) return;
    const { elev, x, rising } = solar(now);
    const t = tablesNow();
    const p = paletteAt(rising ? t.rise : t.set, elev);

    /* Height above the horizon, in units of the sky band. Negative sinks it
       below the card, which is exactly where a set sun belongs: gone, but
       still throwing light up into the atmosphere. */
    const height = 1.15 * elev;

    /* The same light in the planet circle's own coordinates. The circle is
       190% of the card's width and centred, so it starts 45% to the left. */
    const litX = (x + 45) / 1.9;

    const set = (k, v) => card.style.setProperty(k, v);
    set('--sun-x', x.toFixed(2) + '%');
    set('--sun-h', height.toFixed(3));
    set('--lit-x', litX.toFixed(2) + '%');

    set('--sky-deep', css(p.skyDeep));
    set('--sky-high', css(p.skyHigh));
    set('--atmo', css(p.atmo));
    set('--atmo-soft', rgba(p.atmo, p.atmoA));
    set('--surface-lit', css(p.surfLit));
    set('--surface-dark', css(p.surfDark));
    set('--sun-core', css(p.sun));
    set('--sun-halo', rgba(p.sun, p.sunA));
    set('--land', css(p.land));
    set('--land-op', p.landA.toFixed(3));
    set('--sea', css(p.sea));
    set('--sea-op', p.seaA.toFixed(3));
    set('--glint', css(p.glint));
    set('--star-op', p.star.toFixed(3));
    set('--city-op', p.city.toFixed(3));
  }

  /* ---- the greeting ---------------------------------------------------- */

  function openerFor(hour) {
    /* Midnight to 5am gets its own line. You said past 1, but the hour after
       midnight fell through to "Good morning", which is true by the clock and
       wrong to read at 00:30, so the window starts at midnight instead. */
    if (hour < 5)  return 'Still up?';
    if (hour < 12) return 'Good morning.';
    if (hour < 18) return 'Good afternoon.';
    return 'Good evening.';
  }

  function writeGreeting(now) {
    if (!el) return;
    const text = el.textContent.trim();
    const cut = text.indexOf('.');
    if (cut < 0) return;
    el.textContent = openerFor(now.getHours()) + text.slice(cut + 1);
  }

  const first = new Date();
  paint(first);
  writeGreeting(first);

  /* Five minutes moves the sun about a degree and a quarter, which the eye
     reads as the scene having drifted rather than jumped. The heading is
     left alone after the first write: a sentence the visitor has already
     read should not change under them. */
  setInterval(() => paint(new Date()), 5 * 60 * 1000);

  /* A laptop shut at dusk and opened at midnight should not still be showing
     dusk, and the interval will not have fired while it slept. */
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') paint(new Date());
  });

  /* Every colour is written inline on the card, which beats any stylesheet
     rule, so a theme swap cannot repaint the sky on its own: it has to be
     told. Watching the attribute rather than hooking the toggle means this
     keeps working however the theme gets changed, including before this
     block ran. */
  new MutationObserver(() => paint(new Date()))
    .observe(root, { attributes: true, attributeFilter: ['data-theme'] });
})();


/* ==========================================================================
   Boot loader
   Dismissed as soon as the page is usable. The old build faded it with a
   CSS animation, which prefers-reduced-motion disabled outright, leaving the
   overlay covering the page permanently. Driving it from JS fixes that.
   ========================================================================== */
(function loader() {
  const el = $('#pageLoader');
  if (!el) return;

  let done = false;
  const dismiss = () => {
    if (done) return;
    done = true;
    el.classList.add('is-done');
    setTimeout(() => el.remove(), 900);
  };

  const minShow = prefersReduced() ? 220 : 1150;
  const started = performance.now();
  const finish = () => setTimeout(dismiss, Math.max(0, minShow - (performance.now() - started)));

  /* Waits for the fonts as well as the page. The hero's text is measured in
     its real fonts to reserve its space; revealed before a slow font
     arrived, the card would still grow under the visitor's eyes when it did. */
  const loaded = document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise((r) => window.addEventListener('load', r, { once: true }));
  const fonts = document.fonts?.ready?.catch(() => {}) || Promise.resolve();
  Promise.all([loaded, fonts]).then(finish);

  // Hard cap so a hung asset can never trap the visitor behind the overlay.
  setTimeout(dismiss, 4000);
})();

/* ==========================================================================
   Footer year
   ========================================================================== */
(function year() {
  const y = $('#y');
  if (y) y.textContent = String(new Date().getFullYear());
})();

/* ==========================================================================
   Toasts
   ========================================================================== */
const toast = (() => {
  const host = $('#toastHost');
  return (message) => {
    if (!host) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = '<i aria-hidden="true"></i><span></span>';
    el.querySelector('span').textContent = message;
    host.appendChild(el);
    setTimeout(() => {
      el.classList.add('is-out');
      el.addEventListener('animationend', () => el.remove(), { once: true });
    }, 2100);
  };
})();

/* ==========================================================================
   Copy-to-clipboard buttons
   ========================================================================== */
(function copyButtons() {
  $$('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        toast(`Copied ${text}`);
      } catch {
        // Clipboard API needs a secure context; fall back to a mail client.
        window.location.href = `mailto:${text}`;
      }
    });
  });
})();

/* ==========================================================================
   Theme cycling: midnight → daylight → terminal
   ========================================================================== */
const THEMES = ['midnight', 'daylight', 'terminal'];

/* A few partner logos (Hunter, JM Family, Toyota, FICS) are white-on-dark
   assets: legible on midnight/terminal, invisible on daylight's light
   background. data-dark-src/data-light-src on the <img> name both variants
   explicitly, both cloned faithfully by the logo carousel regardless of
   when a clone is made. (An earlier version captured "dark" by reading
   whatever src happened to be on the element the first time this ran; if
   the carousel cloned a node *after* it had already been swapped to light,
   the clone would permanently misremember light as its own "dark" source,
   leaving that copy stuck with unreadable dark-on-dark text.) */
function syncLogoTheme() {
  const light = root.dataset.theme === 'daylight';
  $$('img[data-light-src]').forEach((img) => {
    const want = light ? img.dataset.lightSrc : img.dataset.darkSrc;
    if (want && img.getAttribute('src') !== want) img.setAttribute('src', want);
  });
}

function setTheme(name, announce = true) {
  if (!THEMES.includes(name)) return;
  root.dataset.theme = name;
  try { localStorage.setItem('as-theme', name); } catch {}
  const meta = document.querySelector('meta[name="theme-color"]:not([media])');
  if (meta) meta.content = name === 'daylight' ? '#eef2f8' : '#050814';
  syncLogoTheme();
  if (announce) toast(`${name[0].toUpperCase()}${name.slice(1)} theme`);
}

syncLogoTheme();

(function themeToggle() {
  const btn = $('#themeBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const next = THEMES[(THEMES.indexOf(root.dataset.theme) + 1) % THEMES.length];
    // View Transitions give a free cross-fade where supported.
    if (document.startViewTransition && !prefersReduced()) {
      document.startViewTransition(() => setTheme(next));
    } else {
      setTheme(next);
    }
  });
})();

/* ==========================================================================
   Navigation: smooth scroll without polluting the URL, sticky state,
   current-section highlighting, mobile sheet.
   ========================================================================== */
(function navigation() {
  const nav = $('#siteNav');
  const toggle = $('#navToggle');
  const sheet = $('#mobileSheet');
  const scrim = $('#sheetScrim');

  const closeSheet = () => {
    if (!sheet || !scrim) return;
    sheet.classList.remove('is-open');
    scrim.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', 'Open menu');
    setTimeout(() => {
      if (!sheet.classList.contains('is-open')) { sheet.hidden = true; scrim.hidden = true; }
    }, 380);
  };

  const openSheet = () => {
    if (!sheet || !scrim) return;
    sheet.hidden = false;
    scrim.hidden = false;
    requestAnimationFrame(() => {
      sheet.classList.add('is-open');
      scrim.classList.add('is-open');
    });
    toggle?.setAttribute('aria-expanded', 'true');
    toggle?.setAttribute('aria-label', 'Close menu');
  };

  toggle?.addEventListener('click', () => {
    sheet?.classList.contains('is-open') ? closeSheet() : openSheet();
  });
  scrim?.addEventListener('click', closeSheet);

  /* The home mark travels with you. The class is cleared on animationend so
     a second click replays it rather than doing nothing. */
  const brandMark = $('.brand .brand-mark');
  $('.brand')?.addEventListener('click', () => {
    if (!brandMark || prefersReduced()) return;
    brandMark.classList.remove('is-travelling');
    void brandMark.offsetWidth;   // restart the animation from the top
    brandMark.classList.add('is-travelling');
  });

  brandMark?.addEventListener('animationend', () => {
    brandMark.classList.remove('is-travelling');
  });

  // Delegated smooth scrolling for every in-page link.
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();
    closeSheet();
    target.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'start' });
    // Keep the URL clean so a refresh does not jump mid-page.
    history.replaceState(null, '', location.pathname + location.search);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sheet?.classList.contains('is-open')) closeSheet();
  });

  // Sticky shadow, through the shared scroll frame and only on a change.
  let stuck = null;
  onScrollFrame(() => {
    const now = scrollY > 12;
    if (now === stuck) return;
    return () => { stuck = now; nav?.classList.toggle('is-stuck', now); };
  });
})();

/* ==========================================================================
   Scroll rail: progress bar and section dots
   ========================================================================== */
(function scrollRail() {
  const rail = $('.rail');
  const fill = $('.rail-fill');
  const list = $('.rail-dots');
  if (!rail || !fill || !list) return;

  const sections = [
    ['top', 'Top'],
    ['logos', 'Companies'],
    ['experience', 'The Path'],
    ['education', 'Education'],
    ['projects', 'Projects'],
    ['offclock', 'Off the Clock'],
    ['skills', 'Skills'],
    ['recs', 'Recommendations'],
    ['contact', 'Contact'],
  ].filter(([id]) => document.getElementById(id));

  list.innerHTML = '';
  sections.forEach(([id, label]) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.target = id;
    btn.dataset.label = label;
    btn.setAttribute('aria-label', `Go to ${label}`);
    btn.addEventListener('click', () => {
      document.getElementById(id)?.scrollIntoView({
        behavior: prefersReduced() ? 'auto' : 'smooth',
        block: 'start',
      });
    });
    li.appendChild(btn);
    list.appendChild(li);
  });

  const dots = $$('button', list);
  const navLinks = $$('.nav-links a[href^="#"]');

  /* Where each section starts and how far the page scrolls, measured once
     and again only when the layout changes size, rather than read back on
     every frame of every scroll. */
  const els = sections.map(([id]) => document.getElementById(id));
  let tops = [], max = 0;
  const measure = () => {
    const y = scrollY;
    tops = els.map((el) => el.getBoundingClientRect().top + y);
    max = document.documentElement.scrollHeight - innerHeight;
  };

  // The fill scales rather than grows, so moving it never lays anything out.
  let lastFill = '', active = -1;
  const frame = () => {
    const y = scrollY;
    const fillV = clamp(max > 0 ? y / max : 0, 0, 1).toFixed(4);
    const line = y + innerHeight * 0.32;
    let now = 0;
    for (let i = 0; i < tops.length; i++) if (tops[i] <= line) now = i;
    if (fillV === lastFill && now === active) return;
    return () => {
      if (fillV !== lastFill) { lastFill = fillV; fill.style.transform = `scaleY(${fillV})`; }
      if (now !== active) {
        active = now;
        dots.forEach((d, i) => d.classList.toggle('is-active', i === active));
        const activeId = sections[active]?.[0];
        navLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === `#${activeId}`));
      }
    };
  };

  measure();
  const kick = onScrollFrame(frame);
  addEventListener('resize', measure, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(() => { measure(); kick(); }).observe(document.body);
  document.fonts?.ready.then(() => { measure(); kick(); }).catch(() => {});
})();

/* ==========================================================================
   Reveal on scroll
   ========================================================================== */
(function reveal() {
  const items = $$('[data-reveal]');
  if (!items.length) return;

  if (prefersReduced() || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const show = (el, delay = 0) => {
    el.style.transitionDelay = delay ? `${delay}ms` : '';
    el.classList.add('is-in');
    io.unobserve(el);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      // Stagger siblings slightly so a grid does not pop in all at once.
      const siblings = Array.from(entry.target.parentElement?.children || []);
      const idx = siblings.indexOf(entry.target);
      show(entry.target, Math.min(idx, 6) * 55);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  items.forEach((el) => io.observe(el));

  /* Safety net for anything the observer never got to sample. A fast flick,
     or a nav link that jumps straight to a later section, can carry an
     element from below the viewport to above it between two observer
     deliveries; with no intersecting sample it never fires, and the element
     is left sitting at opacity 0 for anyone who scrolls back up. Anything
     already past the top of the viewport is revealed outright (no stagger:
     it is not making an entrance, it is just catching up). */
  let pending = items.length;
  let queued = false;
  const sweep = () => {
    queued = false;
    pending = 0;
    items.forEach((el) => {
      if (el.classList.contains('is-in')) return;
      if (el.getBoundingClientRect().top < 0) show(el);
      else pending++;
    });
    if (!pending) removeEventListener('scroll', onScroll);
  };
  const onScroll = () => {
    if (queued) return;
    queued = true;
    setTimeout(sweep, 100);
  };
  addEventListener('scroll', onScroll, { passive: true });
})();


/* ==========================================================================
   Hero: scramble headline + role typewriter
   ========================================================================== */
(function heroText() {
  const heading = $('[data-scramble]');
  if (heading && !prefersReduced()) {
    const finalText = heading.textContent;
    const glyphs = '!<>_\\/[]{}~=+*^?#01';
    let frame = 0;

    /* The finished sentence stays in the heading the whole time, invisible,
       and holds its space; the scramble is drawn over it. Letters not yet
       reached are spaces, which collapse, so written straight into the
       heading the scramble started as one short line and grew to three on a
       phone, and the whole hero card grew with it. Screen readers get the
       finished sentence throughout, never the noise. */
    /* The overlay is laid out word by word, each word a box locked to the
       width of the finished word. The scramble glyphs are wider than most
       letters, so drawn as plain text the overlay wrapped differently from
       the sentence under it: near the end, with only a few glyphs left, a
       word would tip onto a third line for a few frames and snap back,
       which read as the headline jumping. With every word the width it will
       end up, the lines break exactly where the finished ones do. */
    let words = [];
    const begin = () => {
      const hold = document.createElement('span');
      hold.className = 'scr-hold';
      const live = document.createElement('span');
      live.className = 'scr-live';
      const parts = finalText.split(/(\s+)/);
      let at = 0;
      const holdWords = [];
      words = [];
      for (const part of parts) {
        if (!part) continue;
        if (/^\s+$/.test(part)) {
          hold.append(part);
          live.append(part);
        } else {
          const h = document.createElement('span');
          h.textContent = part;
          hold.append(h);
          const w = document.createElement('span');
          w.className = 'scr-w';
          live.append(w);
          holdWords.push(h);
          words.push({ el: w, from: at, to: at + part.length, text: '' });
        }
        at += part.length;
      }
      heading.setAttribute('aria-label', finalText);
      hold.setAttribute('aria-hidden', 'true');
      live.setAttribute('aria-hidden', 'true');
      heading.replaceChildren(hold, live);
      holdWords.forEach((h, i) => { words[i].el.style.width = `${h.getBoundingClientRect().width}px`; });
    };
    const finish = () => {
      heading.textContent = finalText;
      heading.removeAttribute('aria-label');
    };
    const queue = Array.from(finalText).map((ch, i) => ({
      ch,
      start: Math.floor(i * 1.4),
      end: Math.floor(i * 1.4) + 14 + Math.floor(Math.random() * 12),
    }));

    const tick = () => {
      let complete = 0;
      const out = queue.map((item) => {
        if (frame >= item.end) { complete++; return item.ch; }
        if (frame >= item.start && item.ch.trim()) return glyphs[Math.floor(Math.random() * glyphs.length)];
        if (frame >= item.start) return item.ch;
        return '\u00a0';
      });
      for (const w of words) {
        const text = out.slice(w.from, w.to).join('');
        if (text !== w.text) { w.el.textContent = text; w.text = text; }
      }
      frame++;
      if (complete < queue.length) requestAnimationFrame(tick);
      else finish();
    };
    // Start after the loader clears so the effect is actually seen.
    setTimeout(() => requestAnimationFrame(() => { begin(); tick(); }), 1300);
  }

  const typed = $('#typedRole');
  if (!typed) return;

  const roles = [
    'software engineer who adapts to the problem',
    'C#/.NET · Python · SQL · React · Apex',
    'shipping things that hold up in production',
    'B.S. Computer Science, University of Florida',
  ];

  /* One text node, edited in place throughout: setting textContent swaps
     the node out on every letter, which is a node removed and a node
     inserted, each restyling and relaying the line. */
  const text = document.createTextNode(typed.textContent);
  typed.replaceChildren(text);

  /* Reserve exactly the height the longest role needs, measured rather than
     assumed: a fixed two line reservation left a visible blank line between
     this and the paragraph below, and a one line reservation would make the
     paragraph jump on any width where a role wraps. Only a change of width
     can change that, so a height only resize (a phone's toolbar sliding
     away) does not measure again. */
  const line = typed.parentElement;
  let measuredW = -1;
  const reserve = (force) => {
    const w = line.clientWidth;
    if (force !== true && w === measuredW) return;
    measuredW = w;
    const before = text.data;
    line.style.minHeight = '0px';
    let tallest = 0;
    for (const role of roles) {
      text.data = role;
      tallest = Math.max(tallest, line.getBoundingClientRect().height);
    }
    text.data = before;
    line.style.minHeight = `${Math.ceil(tallest)}px`;
  };

  reserve(true);
  addEventListener('resize', reserve, { passive: true });
  if (document.fonts?.ready) document.fonts.ready.then(() => reserve(true)).catch(() => {});

  if (prefersReduced()) { text.data = roles[0]; return; }

  /* The loop rests while the hero is off screen or the tab is hidden, and
     picks up where it left off. */
  let r = 0, i = 0, deleting = false, timer = 0, onScreen = true;
  const running = () => onScreen && document.visibilityState === 'visible';
  const loop = () => {
    timer = 0;
    if (!running()) return;
    const role = roles[r];
    i += deleting ? -1 : 1;
    text.data = role.slice(0, i);

    let delay = deleting ? 26 : 52;
    if (!deleting && i === role.length) { delay = 1900; deleting = true; }
    else if (deleting && i === 0) { deleting = false; r = (r + 1) % roles.length; delay = 340; }
    timer = setTimeout(loop, delay);
  };
  const resume = () => { if (!timer && running()) timer = setTimeout(loop, 120); };
  document.addEventListener('visibilitychange', resume);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; resume(); }).observe(line);
  }
  timer = setTimeout(loop, 1800);
})();

/* ==========================================================================
   Pointer effects: magnetic buttons
   Nothing follows the cursor with light any more (the page spotlight, the
   glyph trail and the per-card glow are gone), and the project tiles no
   longer tilt or lift. All that is left is the buttons' barely-there lean.
   ========================================================================== */
(function pointerFx() {
  if (coarsePointer.matches || prefersReduced()) return;

  /* Magnetic buttons that lean toward the cursor, barely. Earlier versions
     wrote the cursor's position straight into the transform every frame, so
     the button tracked the mouse exactly and read as twitchy. Now the cursor
     only sets a target and the button eases a fraction of the remaining
     distance each frame, which turns a jump into a drift you feel more than
     you see. */
  $$('[data-magnetic]').forEach((el) => {
    const STRENGTH = 2.2;   // px of lean at the very edge of the element
    const EASE = 0.07;      // fraction of the remaining distance per frame
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;

    const frame = () => {
      cx += (tx - cx) * EASE;
      cy += (ty - cy) * EASE;

      if (Math.abs(tx - cx) < 0.03 && Math.abs(ty - cy) < 0.03) {
        cx = tx; cy = ty;
        raf = 0;
        el.style.transform = tx || ty ? `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)` : '';
        return;
      }

      el.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`;
      raf = requestAnimationFrame(frame);
    };

    const run = () => { if (!raf) raf = requestAnimationFrame(frame); };

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * STRENGTH;
      ty = ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * STRENGTH * 0.5;
      run();
    }, { passive: true });

    // Ease back to rest rather than snapping there.
    const reset = () => { tx = 0; ty = 0; run(); };
    el.addEventListener('pointerleave', reset);
    el.addEventListener('blur', reset);
  });

})();

/* ==========================================================================
   Logo carousel
   Native horizontal scrolling everywhere (so phones can swipe), plus a CSS
   marquee that runs only while idle, plus pointer-drag on desktop.
   ========================================================================== */
(function logoCarousel() {
  const viewport = $('#logoMarquee');
  const track = $('#logoTrack');
  if (!viewport || !track) return;

  const originals = Array.from(track.children);
  if (!originals.length) return;

  const SPEED = 42;          // px per second of idle drift
  const RUNWAY = 12000;      // px a flick can coast either way before it needs wrapping
  let setW = 0;              // width of one full set, including the trailing gap
  let midSet = 1;            // which copy the strip is kept centred on
  let paused = false;        // explicit pause button
  let idle = true;           // nobody is touching it
  let dragging = false;
  let visible = true;        // section is on/near screen
  let settling = false;      // a person just scrolled it and it may still be coasting
  let driftRaf = 0;

  /* ---------- Idle drift ----------
     scrollLeft is deliberately the single source of truth for position here.
     An earlier attempt ran the drift as a CSS transform animation on the
     track instead, which looked correct in isolation but cancelled itself
     out in practice: the track lives inside an overflow-x scroll container,
     and shifting it under the browser's nose makes scroll anchoring adjust
     scrollLeft by the same amount in the opposite direction, pinning the
     strip visually in place. Nudging scrollLeft directly keeps one mechanism
     in charge, so manual scrolling and the drift can never disagree about
     where the strip is. */
  /* Distance comes from the clock, not from the tick count. Timers are
     throttled on a phone (background tabs, low power mode, a busy main thread
     during a scroll), and a tick-based step meant every dropped tick was
     distance silently lost, so the strip sped up and slowed down with the
     device's mood. Measuring elapsed time keeps the speed honest however
     irregularly the ticks arrive.

     Whole pixels only, with the remainder carried: a fractional scrollLeft is
     rounded away by some browsers, which turns a slow glide into a stutter. */
  let carry = 0;
  let lastT = 0;

  /* Every move this script makes goes through here, and the position it
     leaves is remembered. The scroll handler compares against it: a scroll
     that lands somewhere else was made by a person, a finger or a trackpad,
     possibly still coasting on its momentum. */
  let expected = 0;
  const setScroll = (x) => {
    viewport.scrollLeft = x;
    expected = viewport.scrollLeft;
  };

  /* Stepped on the display's own frames rather than a 16ms timer: a timer
     that drifts against the refresh lands two steps in some frames and none
     in others, which is a stutter, and it kept ticking through frames the
     browser was not drawing. The position is the one this script last set
     (nobody else moves the strip while it drifts: a person's scroll stops
     the drift first), so a step costs one write and no extra reads. */
  const tick = (now) => {
    driftRaf = requestAnimationFrame(tick);
    /* Cap the delta so a stall does not teleport the strip. The cap is loose
       enough that ordinary throttling (a busy main thread mid scroll) is
       still made up for: too tight a cap turns every slow tick into lost
       distance, which is the stutter it was meant to prevent. A backgrounded
       tab is handled by pausing outright rather than by this cap. A frame
       stamped before the drift started counts as no time at all. */
    const dt = clamp((now - lastT) / 1000, 0, 0.25);
    lastT = now;

    carry += SPEED * dt;
    const step = Math.floor(carry);
    if (step >= 1) {
      carry -= step;
      setScroll(expected + step);
    }
    wrap(expected);
  };

  const syncDrift = () => {
    const should = idle && !paused && !dragging && !settling && visible &&
                   document.visibilityState === 'visible' && !prefersReduced();
    if (should && !driftRaf) {
      lastT = performance.now();
      carry = 0;
      expected = viewport.scrollLeft;
      driftRaf = requestAnimationFrame(tick);
    } else if (!should && driftRaf) {
      cancelAnimationFrame(driftRaf);
      driftRaf = 0;
    }
  };

  /* ---------- Clone enough sets that the strip can never run out ----------
     The old build cloned exactly once and animated a CSS transform, so
     scrolling by hand eventually hit the end of the track and stopped dead.
     Now the strip is a real infinite scroller: scrollLeft is wrapped by one
     set width, which is invisible because the content repeats exactly. */
  /* Every logo loads and decodes up front. They were lazy and decoded
     asynchronously, which is right for most images but wrong here: a fast
     flick brought copies into view before they had loaded, or before they
     had decoded, and they showed blank until they caught up. Seven small
     files, shared by every copy, so this costs next to nothing. */
  const prepImages = (node) => node.querySelectorAll('img').forEach((img) => {
    img.loading = 'eager';
    img.decoding = 'sync';
  });
  originals.forEach(prepImages);

  const addSet = () => {
    originals.forEach((node) => {
      const copy = node.cloneNode(true);
      prepImages(copy);
      copy.setAttribute('aria-hidden', 'true');
      copy.setAttribute('tabindex', '-1');
      copy.dataset.clone = 'true';
      // Clones must not be reachable by keyboard or screen readers.
      copy.querySelectorAll('a, button').forEach((el) => el.setAttribute('tabindex', '-1'));
      track.appendChild(copy);
    });
  };

  const measure = () => {
    const firstClone = track.querySelector('[data-clone]');
    if (!firstClone) return 0;
    return firstClone.offsetLeft - originals[0].offsetLeft;
  };

  /* Grows the strip to fit and re-measures, without ever tearing down what is
     already there. The earlier version removed every clone and re-added them,
     then parked scrollLeft back at the start. That is why the logos blinked
     out and snapped to the beginning while scrolling a phone: iOS fires a
     resize every time Safari collapses or restores its toolbar, and each one
     rebuilt the strip from scratch. */
  let parked = false;
  let lastW = -1;

  const build = (force = false) => {
    const w = viewport.clientWidth;
    // A height-only change (the toolbar sliding away) must not touch the strip.
    if (!force && w === lastW) return;
    lastW = w;

    if (!track.querySelector('[data-clone]')) addSet();
    setW = measure();
    if (setW <= 0) return;

    /* Enough copies either side of the middle for a hard flick to coast to
       a stop without reaching an end, so the strip never has to be wrapped
       while a finger's momentum is still moving it. */
    const side = Math.max(1, Math.ceil(RUNWAY / setW));
    const needed = Math.max(3, Math.ceil((w * 2) / setW) + 2, side * 2 + 1);
    while (track.children.length / originals.length < needed) addSet();
    midSet = Math.floor(track.children.length / originals.length / 2);

    if (!parked) {
      // Park in the middle copy so there is room to scroll both directions.
      setScroll(setW * midSet);
      parked = true;
    } else {
      // Already running: keep the reader's place, just pull it back in range.
      wrap();
    }
    syncDrift();
  };

  build(true);

  /* Watches the strip's own box rather than the window, so it reacts to the
     thing that actually matters and stays quiet for viewport height changes. */
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => build()).observe(viewport);
  } else {
    addEventListener('resize', () => build(), { passive: true });
  }

  // A logo arriving late changes the set width, so re-measure, but in place.
  $$('img', track).forEach((img) => {
    if (!img.complete) img.addEventListener('load', () => build(true), { once: true });
  });
  if (document.fonts?.ready) document.fonts.ready.then(() => build(true)).catch(() => {});

  /* Keep scrollLeft within half a set of the middle copy, stepping back by
     whole sets. Because every set is identical, the jump is invisible, as
     long as it is made while script is the one moving the strip: the drift,
     a mouse drag, the wheel, the arrow buttons. */
  const wrap = (x = viewport.scrollLeft) => {
    if (setW <= 0) return;
    const k = Math.round((x - setW * midSet) / setW);
    if (k !== 0) setScroll(x - k * setW);
  };

  /* While a person is scrolling it, and while it coasts afterwards, script
     keeps its hands off the position: no wrap and no drift. On a phone the
     browser owns the scroll position during a flick, and a jump or a drift
     step written from script mid flick stopped the flick dead and landed on
     a stretch of strip it had not drawn yet, so the logos went blank for a
     beat, often just as the flick came to rest and the drift took over.

     Once the strip has been still for a quarter second it is safe again:
     the wrap back to the middle copy is made then, where it is as invisible
     as the drift's own, and the drift is allowed to resume. It still
     resumes on its usual timer, 2.4s after the finger lifts; it only waits
     longer if a hard flick is still coasting at that point. If a flick is
     about to run out of strip, it wraps on the spot rather than stop at the
     end. */
  let touching = false;
  let restTimer = 0;
  const nearEdge = () => {
    const max = viewport.scrollWidth - viewport.clientWidth;
    return viewport.scrollLeft < setW * 0.5 || viewport.scrollLeft > max - setW * 0.5;
  };
  const settleSoon = () => {
    clearTimeout(restTimer);
    restTimer = setTimeout(() => {
      settling = false;
      if (!touching && !dragging) wrap();
      syncDrift();
    }, 250);
  };

  const goBusy = () => { idle = false; syncDrift(); };
  const goIdle = () => { idle = true; syncDrift(); };

  let idleTimer;
  const bumpIdle = (delay = 1800) => {
    goBusy();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { if (!dragging) goIdle(); }, delay);
  };

  // Merely hovering does not pause the drift, only an actual interaction
  // does (drag, wheel, arrow keys, touch, keyboard focus) so the strip reads
  // as continuously alive, and manual scrolling always overrides it.
  // A hidden tab throttles timers hard, so stop rather than crawl.
  document.addEventListener('visibilitychange', syncDrift);

  viewport.addEventListener('focusin', goBusy);
  viewport.addEventListener('focusout', (e) => { if (!viewport.contains(e.relatedTarget)) bumpIdle(600); });

  viewport.addEventListener('scroll', () => {
    if (setW <= 0 || Math.abs(viewport.scrollLeft - expected) <= 1) return;  // our own move
    expected = viewport.scrollLeft;
    // A person moved it, and it may still be coasting.
    if (!settling) { settling = true; syncDrift(); }
    if (nearEdge()) wrap();
    settleSoon();
  }, { passive: true });
  viewport.addEventListener('touchstart', () => { touching = true; bumpIdle(2400); }, { passive: true });
  const touchEnd = () => { touching = false; bumpIdle(2400); settleSoon(); };
  viewport.addEventListener('touchend', touchEnd, { passive: true });
  viewport.addEventListener('touchcancel', touchEnd, { passive: true });

  /* ---------- Pointer drag (desktop; touch uses native scrolling) ---------- */
  let startX = 0, startScroll = 0, moved = 0, lastX = 0, velocity = 0, glideRaf = 0;

  /* Capturing the pointer on pointerdown would retarget the click that
     follows onto the viewport, so a plain click on a logo never reached its
     link. The press is only armed here; capture waits until the pointer has
     actually moved far enough to be a drag rather than a click. */
  let armed = false;

  viewport.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch' || e.button !== 0) return;
    armed = true;
    dragging = false;
    moved = 0;
    startX = lastX = e.clientX;
    startScroll = viewport.scrollLeft;
    velocity = 0;
    cancelAnimationFrame(glideRaf);
    viewport.classList.remove('is-dragging');
    goBusy();
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!armed) return;

    if (!dragging) {
      // Under this it is still a click in progress, so stay out of the way.
      if (Math.abs(e.clientX - startX) <= 4) return;
      dragging = true;
      viewport.classList.add('is-dragging');
      try { viewport.setPointerCapture(e.pointerId); } catch {}
    }

    e.preventDefault();
    const dx = e.clientX - startX;
    moved = Math.abs(dx);
    velocity = e.clientX - lastX;
    lastX = e.clientX;
    setScroll(startScroll - dx);
    wrap();
    // Re-base so wrapping mid-drag does not yank the strip.
    startScroll = viewport.scrollLeft + dx;
  });

  const endDrag = (e) => {
    if (!armed) return;
    armed = false;
    if (!dragging) { bumpIdle(1200); return; }  // a click, not a drag
    dragging = false;
    try { viewport.releasePointerCapture(e.pointerId); } catch {}

    /* The logos stay out of hover reach (is-dragging) until the glide has
       run out, as they are during the drag. Otherwise every logo sliding
       under the resting pointer lit up and faded again on its way past,
       each one a restyle and a repaint, a dozen per flick. A press during
       the glide still stops it, as a tap stops a flick on a phone. */
    let v = velocity * 1.4;
    const glide = () => {
      if (Math.abs(v) < 0.4) { viewport.classList.remove('is-dragging'); bumpIdle(400); return; }
      setScroll(expected - v);
      wrap(expected);
      v *= 0.94;
      glideRaf = requestAnimationFrame(glide);
    };
    if (!prefersReduced() && Math.abs(v) > 1) glideRaf = requestAnimationFrame(glide);
    else { viewport.classList.remove('is-dragging'); bumpIdle(1200); }
  };

  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);

  // A drag should not also trigger the link underneath.
  viewport.addEventListener('click', (e) => {
    if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; }
  }, true);

  /* ---------- Controls ---------- */
  const glideBy = (dist) => {
    cancelAnimationFrame(glideRaf);
    const from = viewport.scrollLeft;
    const start = performance.now();
    const dur = prefersReduced() ? 0 : 420;
    goBusy();
    const step = (now) => {
      const t = dur ? clamp((now - start) / dur, 0, 1) : 1;
      const eased = 1 - Math.pow(1 - t, 3);
      setScroll(from + dist * eased);
      wrap();
      if (t < 1) glideRaf = requestAnimationFrame(step);
      else bumpIdle(1600);
    };
    glideRaf = requestAnimationFrame(step);
  };

  const page = () => Math.max(180, viewport.clientWidth * 0.7);
  $('[data-marquee-prev]')?.addEventListener('click', () => glideBy(-page()));
  $('[data-marquee-next]')?.addEventListener('click', () => glideBy(page()));

  const toggleBtn = $('[data-marquee-toggle]');
  toggleBtn?.addEventListener('click', () => {
    paused = !paused;
    syncDrift();
    toggleBtn.setAttribute('aria-pressed', String(paused));
    toggleBtn.setAttribute('aria-label', paused ? 'Resume logo animation' : 'Pause logo animation');
  });

  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); glideBy(page()); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); glideBy(-page()); }
  });

  // Vertical wheel over the strip scrolls it sideways. It never blocks the
  // page now, because the strip has no ends to reach.
  viewport.addEventListener('wheel', (e) => {
    if (coarsePointer.matches) return;
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    e.preventDefault();
    setScroll(viewport.scrollLeft + e.deltaY);
    wrap();
    bumpIdle();
  }, { passive: false });

  // Stop the drift while the section is offscreen (mostly courtesy to the
  // compositor; the animation is cheap, but no reason to run it unseen).
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        visible = entry.isIntersecting;
        syncDrift();
      });
    }, { rootMargin: '150px' }).observe(viewport);
  }
})();


/* Progress of an element through the viewport, 0 before it enters to 1 once
   it has fully passed. */
function viewportProgress(el, { start = 1, end = 0 } = {}) {
  const r = el.getBoundingClientRect();
  const h = innerHeight || 1;
  const from = h * start;
  const to = -r.height + h * end;
  const span = from - to;
  if (span <= 0) return 1;
  return clamp((from - r.top) / span, 0, 1);
}

/* ==========================================================================
   THE PATH: scroll-driven career circuit board
   ========================================================================== */
(function journey() {
  const scope = $('#journeyScope');
  const board = $('#journeyBoard');
  const cardsList = $('#journeyCards');
  if (!scope || !board || !cardsList) return;

  const cards = $$('.jcard', cardsList);
  if (!cards.length) return;

  const N = cards.length;
  scope.style.setProperty('--nodes', String(N));

  /* ---------- Layout the board ---------- */
  const BOARD_W = 560;
  const STEP = 250;                  // vertical distance between nodes
  const MARGIN = 150;                // breathing room at each end
  const BOARD_H = MARGIN * 2 + STEP * (N - 1);
  const LANES = [140, 300, 420, 260]; // x positions cycled to make the trace wander

  board.style.setProperty('--board-h', `${BOARD_H}px`);

  const points = cards.map((_, i) => ({
    x: LANES[i % LANES.length],
    y: MARGIN + STEP * i,
  }));

  /* PCB-style routing: run straight, then break at 45°, then straight again.
     Building the path from the points keeps it correct if roles are added. */
  const buildPath = (pts) => {
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      const dx = b.x - a.x;
      const diag = Math.min(Math.abs(dx), Math.abs(b.y - a.y) - 40);
      if (diag > 4) {
        d += ` L ${a.x} ${b.y - diag - 20}`;
        d += ` L ${b.x} ${b.y - 20}`;
        d += ` L ${b.x} ${b.y}`;
      } else {
        d += ` L ${b.x} ${b.y}`;
      }
    }
    return d;
  };

  const d = buildPath(points);
  const bed = $('#traceBed');
  const live = $('#traceLive');
  const svg = $('#boardTrace');
  if (svg) svg.setAttribute('viewBox', `0 0 ${BOARD_W} ${BOARD_H}`);
  bed?.setAttribute('d', d);
  live?.setAttribute('d', d);

  const traceLen = live?.getTotalLength?.() || 0;
  if (live && traceLen) {
    live.style.strokeDasharray = `${traceLen}`;
    live.style.strokeDashoffset = `${traceLen}`;
  }

  /* ---------- Build the nodes ---------- */
  const nodes = cards.map((card, i) => {
    const el = document.createElement('div');
    el.className = 'node';
    el.dataset.i = String(i);
    el.dataset.state = 'future';
    el.style.setProperty('--nx', `${points[i].x}px`);
    el.style.setProperty('--ny', `${points[i].y}px`);
    el.innerHTML =
      '<span class="node-mast"></span>' +
      '<span class="node-pad"></span>' +
      '<span class="node-card"><b></b><span></span></span>';
    el.querySelector('.node-card b').textContent = card.dataset.company || '';
    el.querySelector('.node-card > span').textContent = card.dataset.short || '';
    board.appendChild(el);
    return el;
  });

  const pulse = document.createElement('div');
  pulse.className = 'board-pulse';
  board.appendChild(pulse);

  /* ---------- Scroll wiring ---------- */
  const idxEl = $('#journeyIdx');
  const totalEl = $('#journeyTotal');
  const barEl = $('#journeyBar');
  if (totalEl) totalEl.textContent = String(N).padStart(2, '0');

  let activeIdx = -1;

  /* Where the active node parks in the stage, in board pixels. Read from CSS
     so each breakpoint can place it for the stage height it actually has. */
  const stage = $('.journey-stage');
  let dolly = 120;
  const readDolly = () => {
    const v = stage && parseFloat(getComputedStyle(stage).getPropertyValue('--dolly'));
    if (Number.isFinite(v)) dolly = v;
  };
  readDolly();
  addEventListener('resize', readDolly, { passive: true });

  const setActive = (i) => {
    if (i === activeIdx) return;
    const prev = activeIdx;
    activeIdx = i;

    cards.forEach((c, k) => {
      c.classList.toggle('is-active', k === i);
      c.classList.toggle('is-leaving', k === prev && k !== i);
    });
    nodes.forEach((n, k) => {
      n.dataset.state = k < i ? 'past' : k === i ? 'active' : 'future';
    });
    if (idxEl) idxEl.textContent = String(i + 1).padStart(2, '0');
    // The photo/tile sizing pass lives in its own block and needs to know.
    document.dispatchEvent(new CustomEvent('journey:active', { detail: { index: i } }));
  };

  const update = () => {
    const sticky = scope.firstElementChild;
    const travel = scope.offsetHeight - (sticky?.offsetHeight || innerHeight);
    const top = scope.getBoundingClientRect().top;
    const p = travel > 0 ? clamp(-top / travel, 0, 1) : 0;

    // Dolly the board so the active node sits in the camera's sweet spot.
    const first = points[0].y;
    const lastY = points[N - 1].y;
    const y = first + (lastY - first) * p;
    board.style.setProperty('--board-y', `${-y + dolly}px`);

    // Energise the trace behind the camera.
    if (live && traceLen) live.style.strokeDashoffset = `${traceLen * (1 - p)}`;

    // Move the current pulse along the path.
    if (traceLen && live.getPointAtLength) {
      const pt = live.getPointAtLength(traceLen * p);
      pulse.style.transform = `translate3d(${pt.x}px, ${pt.y}px, 0)`;
    }

    setActive(clamp(Math.round(p * (N - 1)), 0, N - 1));
    if (barEl) barEl.style.width = `${p * 100}%`;
  };

  const compactSection = scope.closest('.journey-section[data-compact]');
  if (compactSection) {
    /* Compact path: a circuit trace with a node per role, no pinned board.
       Choosing a node moves that role's tile into the slot under it (one
       open at a time; choosing it again closes it), and the trace lights
       up from the first node to the open one. */
    compactSection.classList.add('is-compact');
    const pc = $('#pathCompact');
    const stops = $$('.pc-stop', compactSection);
    const slots = $$('.pc-slot', compactSection);
    const home = $('#journeyCards');
    const bed = $('.pc-bed', pc), liveP = $('.pc-live', pc), svg = $('.pc-trace', pc);
    cards.forEach((c) => c.classList.add('glass'));
    let openIdx = -1;

    /* Smooth curves between node centres: each leaves its node heading
       straight down and eases across into the next, so the trace sways
       from side to side rather than turning corners. */
    const centres = () => {
      const box = pc.getBoundingClientRect();
      return stops.map((b) => {
        const r = $('.pc-node', b).getBoundingClientRect();
        return [r.left + r.width / 2 - box.left, r.top + r.height / 2 - box.top, r.height / 2];
      });
    };
    const pathTo = (pts, upto) => {
      let d = '';
      /* Each run starts and ends at the node centres, under the opaque
         circles, so the bend out of one node and into the next happens out
         of sight and the line meets each rim already at an easy angle.
         Starting at the rims put the whole turn in a few visible pixels,
         where it read as a hook. */
      for (let k = 0; k < Math.min(upto, pts.length - 1); k++) {
        const [x1, y1] = pts[k], [x2, y2] = pts[k + 1];
        const pull = Math.min((y2 - y1) * 0.85, 220);
        d += `M${x1} ${y1}C${x1} ${y1 + pull} ${x2} ${y2 - pull} ${x2} ${y2}`;
      }
      return d;
    };
    const draw = () => {
      const pts = centres();
      svg.setAttribute('viewBox', `0 0 ${pc.clientWidth} ${pc.clientHeight}`);
      bed.setAttribute('d', pathTo(pts, pts.length));
      liveP.setAttribute('d', openIdx > 0 ? pathTo(pts, openIdx) : '');
    };

    const open = (i, { scroll = false } = {}) => {
      const next = i === openIdx ? -1 : i;
      if (openIdx >= 0) home.append(cards[openIdx]);
      cards.forEach((c, k) => c.classList.toggle('is-active', k === next));
      if (next >= 0) slots[next].append(cards[next]);
      openIdx = next;
      stops.forEach((b, k) => {
        b.classList.toggle('is-on', k === next);
        b.classList.toggle('is-past', next >= 0 && k < next);
        b.setAttribute('aria-expanded', String(k === next));
      });
      draw();
      if (next >= 0) {
        document.dispatchEvent(new CustomEvent('journey:active', { detail: { index: next } }));
        requestAnimationFrame(draw);
        if (scroll) stops[next].scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'nearest' });
      }
    };
    stops.forEach((b, i) => b.addEventListener('click', () => open(i, { scroll: true })));
    document.addEventListener('path:open', (e) => {
      const i = e.detail?.index ?? -1;
      if (i < 0) return;
      if (openIdx !== i) open(i);
      stops[i].scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'start' });
    });
    draw();
    // The observer catches every change of the path's size; the window's
    // resize only matters when it changes the width (not a toolbar sliding).
    let drawnW = innerWidth;
    addEventListener('resize', () => { if (innerWidth !== drawnW) { drawnW = innerWidth; draw(); } }, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(draw).observe(pc);
    document.fonts?.ready.then(draw).catch(() => {});
  } else if (prefersReduced()) {
    /* No pinning and no scroll driven board: every role at once, as a list
       of glass tiles you read top to bottom. The stylesheet does the layout
       off .is-still; it had only ever been half done, so the eight roles sat
       stacked on top of one another, unreadable. The lede loses its line
       about scrolling current through the board, since there is no board. */
    const section = scope.closest('.journey-section');
    section?.classList.add('is-still');
    const lede = section?.querySelector('.section-lede');
    if (lede) lede.textContent = 'Every role so far, from a robotics vision system in high school to identity infrastructure in the cloud.';
    cards.forEach((c) => c.classList.add('is-active', 'glass'));
    nodes.forEach((n) => { n.dataset.state = 'past'; });
    if (live && traceLen) live.style.strokeDashoffset = '0';
  } else {
    setActive(0);
    onScrollFrame(update);
  }
})();

/* ==========================================================================
   Journey photos
   Each role's photos sit in one row, all at one height, each as wide as its
   own shape, and the row scrolls sideways when there are more than fit. The
   height is whatever the role's text leaves free in the card, so the photos
   always fill the card to its bottom edge, whatever the role and whatever
   the screen.

   It used to hide the photos that did not fit and shrink the rest until
   they did, measuring the rendered row to find out. That measurement
   depended on the images having loaded, so the same role came out full
   size one time and as thumbnails the next. Nothing is measured from the
   images now: each photo's shape comes from its width and height
   attributes, set on its button as an aspect ratio, so the row lays out
   the same before the images arrive as after.

   The card's size is watched rather than sampled. When a phone's toolbar
   slides in and the window gets shorter, the card gets shorter, and the
   photos are resized on the next frame to fit it exactly.
   ========================================================================== */
(function journeyPhotos() {
  if (!$('.jcard .jc-media')) return;

  const MAX_H = 560;   // a ceiling for very tall windows, well past anything normal
  const FLOOR = 40;    // below this they stop reading as photos; the card scrolls instead

  // How tall a card's own content is, independent of the panel it sits in.
  // The children are all flex: 0 0 auto, so they measure the same whatever
  // height the card has been given.
  const contentHeight = (card, skip) => {
    let h = 0;
    for (const el of card.children) {
      if (el === skip) continue;
      const cs = getComputedStyle(el);
      // Rect height rather than offsetHeight: the latter rounds to whole
      // pixels, and six children of rounding adds up to a visible error.
      h += el.getBoundingClientRect().height +
           (parseFloat(cs.marginTop) || 0) +
           (parseFloat(cs.marginBottom) || 0);
    }
    return h;
  };

  const aspectOf = (img) => {
    const w = Number(img?.getAttribute('width'));
    const h = Number(img?.getAttribute('height'));
    return w > 0 && h > 0 ? w / h : 1;
  };

  /* Each photo becomes a real button so it is reachable by keyboard and
     announced as something you can act on, and the button carries the
     photo's shape. Done here rather than in the markup so a photo added
     later needs no extra wrapper. */
  $$('.jcard .jc-media img').forEach((img) => {
    let btn = img.parentElement;
    if (!btn.classList.contains('jc-shot')) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'jc-shot';
      btn.setAttribute('aria-label', `Open photo: ${img.alt || 'journey photo'}`);
      img.replaceWith(btn);
      btn.appendChild(img);
    }
    btn.style.aspectRatio = String(aspectOf(img));
  });

  /* The edge fade only earns its keep when there is something past the edge,
     and which edge depends on where the strip is scrolled to. */
  const markScroll = (fig) => {
    const slack = fig.scrollWidth - fig.clientWidth;
    fig.classList.toggle('is-scrollable', slack > 4);
    if (slack <= 4) {
      fig.classList.remove('at-end', 'at-middle');
      return;
    }
    const atStart = fig.scrollLeft <= 2;
    const atEnd = fig.scrollLeft >= slack - 2;
    fig.classList.toggle('at-end', atEnd && !atStart);
    fig.classList.toggle('at-middle', !atEnd && !atStart);
  };

  const setHeight = (fig, h) => {
    const v = `${h}px`;
    if (fig.style.height !== v) fig.style.height = v;
    /* Tell each image how wide it is actually drawn, so the browser picks
       the file for that size. The old fixed hints assumed thumbnails and
       would have served the small file to a photo drawn three times larger. */
    /* Only ever raised. Every change of sizes makes the browser pick again,
       and a smaller pick is a second download of a photo already showing at
       a higher resolution. The markup starts each photo at the width the
       Path draws it, so normally this never changes anything. */
    const room = fig.clientWidth || Infinity;
    $$('.jc-shot img', fig).forEach((img) => {
      const want = Math.ceil(Math.min(room, h * aspectOf(img)));
      if (want > (parseFloat(img.getAttribute('sizes')) || 0)) img.setAttribute('sizes', `${want}px`);
    });
  };

  /* Safari snaps a strip to one of its photos while the page is still
     laying out, before the photos have their final size, and could leave a
     role opening on its last photo. So the first fit starts every strip at
     its first photo. Later fits leave the position alone: a strip resized
     while you are looking at it keeps the photo you were looking at. */
  let first = true;

  // Re-queried each pass rather than captured once, so adding a photo to a
  // card later needs no change here.
  const fit = () => {
    const reset = first;
    first = false;
    $$('.jcard .jc-media').forEach((fig) => {
      const card = fig.closest('.jcard');
      const imgs = $$('.jc-shot img', fig);
      if (!card || !imgs.length) return;

      /* Only the stacked cards have a fixed height to fill. Laid out as a
         plain list (reduced motion, print), a card is as tall as its
         content, photos included, so measuring what is left would feed back
         on itself. They get a set height instead, still never so tall that
         one photo is wider than the strip. */
      if (getComputedStyle(card).position !== 'absolute') {
        /* A card that moved here out of the board (the compact path) may
           have been hidden there while it had no height to measure. */
        fig.hidden = false;
        const room = fig.clientWidth;
        const widest = Math.max(...imgs.map(aspectOf));
        setHeight(fig, Math.floor(room > 0 ? Math.min(180, room / widest) : 180));
        markScroll(fig);
        return;
      }

      fig.hidden = false;
      const text = contentHeight(card, fig);
      const gap = parseFloat(getComputedStyle(fig).marginTop) || 0;
      // The 4px is slack against sub pixel rounding in the text measurement:
      // without it a card can end up one or two pixels into a scrollbar.
      const spare = card.clientHeight - text - gap - 4;

      /* The strip takes all the height the text leaves, so the photos always
         reach the bottom of the card and no role ends in a band of empty
         space. It used to be capped so that no single photo could be wider
         than the strip, which on a wide photo left a gap underneath; now a
         photo that would be wider than the strip is drawn at the strip's
         width instead, cropped a little at its sides (the viewer still opens
         it whole). */
      // Too little room for a photo to read as one (the smallest phones, on
      // the wordiest roles): leave the strip out rather than squeeze it, and
      // the viewer is still a tap away on every other screen.
      fig.hidden = spare < FLOOR;
      if (fig.hidden) return;
      setHeight(fig, Math.floor(Math.min(MAX_H, spare)));
      if (reset) fig.scrollLeft = 0;
      markScroll(fig);
    });
  };

  $$('.jcard .jc-media').forEach((fig) => {
    fig.addEventListener('scroll', () => markScroll(fig), { passive: true });
  });

  /* A role with no photos has nothing to fill the leftover space with, and on
     the breakpoints where the readout is drawn as a bordered tile that reads
     as an empty box wrapped around a short paragraph. So the tile shrinks to
     that role's own content instead, and goes back to full height for a role
     that has photos to show. */
  const readout = $('.journey-readout');
  const cardsEl = $('.journey-cards');

  const sizeTile = () => {
    if (!readout || !cardsEl) return;

    // Reduced motion shows every card at once as a plain list; leave it be.
    const active = $$('.jcard.is-active');
    readout.style.alignSelf = '';
    readout.style.height = '';
    cardsEl.style.height = '';
    cardsEl.style.flex = '';

    const card = active.length === 1 ? active[0] : null;
    // Above 900px the readout carries no border, so there is no box to shrink.
    if (!card || innerWidth > 900 || card.querySelector('.jc-media')) {
      fit();
      return;
    }

    // flex-basis, not height, is what sizes a flex item along the main axis.
    cardsEl.style.flex = '0 0 auto';
    cardsEl.style.height = `${Math.ceil(contentHeight(card))}px`;
    readout.style.alignSelf = 'start';
    readout.style.height = 'auto';
  };

  // One pass per frame, however many things report a change in it.
  let queued = 0;
  const queue = () => {
    if (!queued) queued = requestAnimationFrame(() => { queued = 0; sizeTile(); });
  };

  sizeTile();
  document.addEventListener('journey:active', sizeTile);
  addEventListener('resize', queue, { passive: true });
  // Not while a viewer is open: a pinch there is not the page changing size.
  window.visualViewport?.addEventListener('resize', () => { if (!root.classList.contains('is-modal')) queue(); }, { passive: true });
  /* The card area follows the viewport height (dvh on phones), so this is
     what catches a toolbar sliding in or out, a rotation, or the column
     changing width, whether or not the window reports a resize. */
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(queue);
    if (readout) ro.observe(readout);
    if (cardsEl) ro.observe(cardsEl);
  }
  // Fonts landing late changes how tall the text is, which changes the room.
  if (document.fonts?.ready) document.fonts.ready.then(queue).catch(() => {});
})();

/* ==========================================================================
   Photo viewer
   The strips are deliberately small, so every photo opens full size on click.
   A <dialog> carries the focus trap, the backdrop and Escape for free.
   ========================================================================== */
/* html.is-modal while any dialog is open, for the stylesheet to pause the
   page behind it. Watching the open attribute catches every way a dialog
   opens or closes (showModal, close, Escape) without touching their code. */
(function modalFlag() {
  const dialogs = $$('dialog');
  if (!dialogs.length) return;
  const sync = () => root.classList.toggle('is-modal', dialogs.some((d) => d.open));
  const mo = new MutationObserver(sync);
  dialogs.forEach((d) => mo.observe(d, { attributes: true, attributeFilter: ['open'] }));
})();

(function lightbox() {
  const dlg = $('#lightbox');
  const img = $('#lbImg');
  const cap = $('#lbCap');
  const count = $('#lbCount');
  if (!dlg || !img || !dlg.showModal) return;

  // The strip loads a small file; the viewer wants the biggest one on offer.
  const largest = (el) => {
    const set = el.getAttribute('srcset');
    if (!set) return el.currentSrc || el.src;
    let best = { w: 0, url: el.src };
    for (const part of set.split(',')) {
      const [url, size] = part.trim().split(/\s+/);
      const w = parseInt(size, 10) || 0;
      if (url && w >= best.w) best = { w, url };
    }
    return best.url;
  };

  let group = [];
  let at = 0;

  const show = (i) => {
    at = (i + group.length) % group.length;
    const src = group[at];
    img.src = largest(src);
    img.alt = src.alt || '';
    if (cap) cap.textContent = src.alt || '';
    if (count) count.textContent = `${at + 1} / ${group.length}`;
    dlg.toggleAttribute('data-single', group.length < 2);
  };

  document.addEventListener('click', (e) => {
    const shot = e.target.closest('.jc-shot');
    if (!shot) return;
    const fig = shot.closest('.jc-media, .film, .since');
    // One entry per photo: a card's main photo can also be one of its steps.
    const seen = new Set();
    group = $$('img', fig).filter((im) => !seen.has(im.getAttribute('src')) && seen.add(im.getAttribute('src')));
    const mine = $('img', shot).getAttribute('src');
    show(Math.max(0, group.findIndex((im) => im.getAttribute('src') === mine)));
    dlg.showModal();
  });

  $('#lbPrev')?.addEventListener('click', () => show(at - 1));
  $('#lbNext')?.addEventListener('click', () => show(at + 1));
  $('#lbClose')?.addEventListener('click', () => dlg.close());

  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(at - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(at + 1); }
  });

  // Clicking the backdrop means clicking the dialog itself: anything inside it
  // is a descendant, so a hit on the element proper is a hit outside the card.
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) dlg.close();
  });

  /* Pinch to zoom inside the viewer, on the photo alone. Left to the
     browser, a pinch zooms the whole page, and Safari redraws every layer
     of it (blurred glass, the backdrop, the background) at the new scale on
     every frame the fingers stay down; held long enough on an iPhone that
     ran it out of memory and the tab reloaded. Scaling just the photo is
     one layer and costs nothing. Double tap toggles a closer look. */
  let z = 1, tx = 0, ty = 0, pinch = null, pan = null, lastTap = 0;
  const pts = new Map();
  const apply = (ease) => {
    img.style.transition = ease ? 'transform .25s ease' : 'none';
    img.style.transform = z === 1 ? '' : `translate3d(${tx}px, ${ty}px, 0) scale(${z})`;
    dlg.classList.toggle('is-zoomed', z > 1);
  };
  const clampPan = () => {
    const r = img.getBoundingClientRect(), w = r.width / z, h = r.height / z;
    const mx = (w * z - w) / 2, my = (h * z - h) / 2;
    tx = Math.max(-mx, Math.min(mx, tx)); ty = Math.max(-my, Math.min(my, ty));
  };
  const resetZoom = () => { z = 1; tx = ty = 0; pinch = pan = null; pts.clear(); apply(false); };
  const dist = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  img.addEventListener('pointerdown', (e) => {
    try { img.setPointerCapture(e.pointerId); } catch {}
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2) { pinch = { d: dist(), z }; pan = null; }
    else if (pts.size === 1 && z > 1) pan = { x: e.clientX - tx, y: e.clientY - ty };
  });
  img.addEventListener('pointermove', (e) => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pts.size === 2) { z = Math.max(1, Math.min(4, pinch.z * dist() / pinch.d)); clampPan(); apply(false); }
    else if (pan) { tx = e.clientX - pan.x; ty = e.clientY - pan.y; clampPan(); apply(false); }
  });
  const lift = (e) => {
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch = null;
    if (!pts.size) {
      pan = null;
      if (z < 1.05) resetZoom();
      const now = performance.now();
      if (e.type === 'pointerup' && e.pointerType === 'touch' && now - lastTap < 280) {
        if (z > 1) { z = 1; tx = ty = 0; } else z = 2.5;
        apply(true); lastTap = 0;
      } else lastTap = now;
    }
  };
  ['pointerup', 'pointercancel'].forEach((t) => img.addEventListener(t, lift));
  // Safari's own page pinch, kept off while any viewer is open.
  const noPagePinch = (e) => { if (root.classList.contains('is-modal')) e.preventDefault(); };
  document.addEventListener('gesturestart', noPagePinch);
  document.addEventListener('gesturechange', noPagePinch);
  // Swiping between photos only when not zoomed in.
  ['lbPrev', 'lbNext'].forEach((id) => $(`#${id}`)?.addEventListener('click', resetZoom, true));

  // Release the decoded image rather than holding the largest file in memory.
  dlg.addEventListener('close', () => { resetZoom(); img.removeAttribute('src'); });
})();

/* ==========================================================================
   Citizenship chip: a small celebration

   Press it and the pill fills with the flag and dances. Everything stays
   inside the pill, which is both the point and the cheap way to do it: a
   120px box animating its own transform costs nothing, where the earlier
   version bloomed a large blurred gradient into the card behind it and had
   to recomposite against the whole page on every frame.

   The whole thing is two classes and a listener. CSS owns the movement.
   ========================================================================== */
(function citizenSalute() {
  const chip = $('#citizenChip');
  if (!chip) return;

  /* No in-flight guard. One was here and it was a latch: it was cleared by
     animationend, so anything that stopped the animation without ending it
     left the flag stuck true and the easter egg dead for the rest of the
     session. Pressing it again mid dance should just set it off again. */
  chip.addEventListener('click', () => {
    if (prefersReduced()) return;

    /* Restart by dropping the class and waiting two frames rather than by
       reading back a layout value to force the style through. The read is the
       usual trick and it works, but it flushes layout for the whole document
       inside a click handler, which measured at one 150ms frame on the
       version of this that lived in the card. Two frames is imperceptible
       and forces nothing. */
    chip.classList.remove('is-celebrating');
    requestAnimationFrame(() => requestAnimationFrame(() => chip.classList.add('is-celebrating')));
  });

  /* Two animations run: the pill's dance at 1s and the fill's sweep at
     1.35s. The class has to come off on the longer of the two, or removing
     it ends the fill three quarters of the way through, at full opacity,
     which is a snap rather than a fade. */
  chip.addEventListener('animationend', (e) => {
    if (e.animationName === 'chip-fill') chip.classList.remove('is-celebrating');
  });
})();

/* ==========================================================================
   Ambient field

   One environment under the whole page, not a background per section. Seven
   presets, one per chapter, and what gets painted is a weighted blend of
   them keyed to where you are reading. Inside a section its own preset
   stands alone; across a boundary the two neighbours cross over. Nothing
   switches, so there is no moment you can point at and say the background
   just changed.

   The reference is bias lighting behind a television: the room takes its
   colour from what is on screen, and nobody watches the wall.

   The blend is done here and written out as finished values, which is why
   there is no CSS transition on any of it. A transition would be a second
   opinion about where the colour should be, always a beat behind the
   scroll, and the two would spend the whole page disagreeing.
   ========================================================================== */
(function ambient() {
  const field = $('.bg');
  if (!field) return;

  /* --- the chapters -------------------------------------------------------
     Seven, in reading order. The logo strip has no entry of its own: it is
     the tail of the opening, so the hero's light carries through it. */
  const STAGES = [
    { key: 'hero',      sel: '.hero' },
    { key: 'path',      sel: '#experience' },
    { key: 'education', sel: '#education' },
    { key: 'projects',  sel: '#projects' },
    { key: 'skills',    sel: '#skills' },
    { key: 'recs',      sel: '#recs' },
    { key: 'resume',    sel: '#contact' },
  ];

  /* --- the presets --------------------------------------------------------
     Each is a base wash plus five fields. A field is
     [r, g, b, alpha, x%, y%, radius], the position a percentage across the
     frame and the radius in vmin, so a field keeps its shape rather than
     stretching out on a wide monitor. The alphas are the whole discipline of this system: nothing
     above .22 in the dark and nothing above .15 in the light, which is low
     enough that on any single screen you are unlikely to identify a colour,
     only a temperature.

     The story: the hero holds the widest mixture, the path narrows it to
     cool and directional, education is the one moment the colours mean
     something specific, projects turns that into something built, skills
     resolves the mass into separate nodes, recommendations warms into
     human, and the close cools back down to a quieter version of the
     opening. Possibility at the top, resolution at the bottom. */
  const DARK = {
    hero: {
      base: [40, 96, 150, .10],
      f: [[56, 200, 215, .20, 18, 22, 62],
          [60, 120, 230, .18, 70, 16, 58],
          [120,  95, 220, .15, 46, 62, 66],
          [190,  80, 110, .11, 88, 48, 50],
          [ 70, 150, 200, .12, 50, 96, 75]],
    },
    /* Cooler, and the fields fall on a diagonal rather than spreading out:
       the timeline already reads as movement, so the light leans with it
       instead of drawing its own line. */
    path: {
      base: [36, 86, 150, .09],
      f: [[ 50, 205, 205, .21, 12, 28, 55],
          [ 55, 115, 225, .19, 42, 54, 58],
          [105,  95, 205, .12, 76, 80, 52],
          [ 48, 100, 200, .10, 92, 18, 46],
          [ 40,  90, 150, .08, 50,100, 70]],
    },
    /* Blue down one side, amber down the other, meeting in the middle. The
       hues are Florida's; the alphas are not, deliberately. It should land
       as a feeling that the colour belongs to the content, never as
       branding. */
    /* The blues are further round toward azure than Florida's own #0021A5,
       which sits at hue 228. Screened onto a background this dark, 228 comes
       out as an indigo and reads as purple rather than blue, especially with
       something warm on the other side of the frame pulling the eye. These
       paint at hue 215, measured rather than guessed, which is far enough
       round that a viewer calls it blue and not so far that it turns cyan
       and stops meaning anything.

       This is also the one chapter that carries more weight than its
       neighbours. The four coloured fields run about a quarter above
       everything else on the page, which is deliberate: it is the only
       moment where the colour means something specific, so it is the only
       one allowed to be noticed. The fifth field and the base wash are left
       where they were, so what lifts is the blue and the amber rather than
       the section generally. */
    education: {
      base: [40, 84, 152, .09],
      f: [[ 24, 134, 250, .26, 10, 30, 66],
          [ 22, 118, 228, .16, 22, 78, 56],
          [240, 150,  60, .23, 90, 32, 64],
          [235, 165,  90, .14, 82, 82, 54],
          [ 80, 110, 180, .07, 50, 56, 70]],
    },
    projects: {
      base: [44, 92, 160, .10],
      f: [[ 50, 210, 210, .20, 20, 26, 56],
          [ 60, 120, 235, .18, 62, 40, 58],
          [125,  90, 225, .16, 40, 80, 60],
          [190,  80, 190, .10, 86, 70, 48],
          [ 45, 170, 200, .09, 92, 12, 44]],
    },
    /* The same light broken into five smaller sources of near equal weight.
       Not one per skill, and not sharp enough to count: a mass resolving
       into parts. */
    skills: {
      base: [40, 90, 158, .09],
      f: [[ 50, 195, 205, .15, 16, 24, 42],
          [ 58, 118, 225, .15, 44, 34, 40],
          [110,  95, 210, .13, 74, 26, 40],
          [ 48, 180, 200, .13, 30, 74, 40],
          [ 55, 110, 215, .13, 68, 78, 42]],
    },
    recs: {
      base: [120, 86, 70, .09],
      f: [[230, 160,  80, .17, 24, 30, 60],
          [235, 140, 110, .14, 66, 58, 58],
          [220, 175,  95, .12, 86, 24, 50],
          [120,  95, 190, .09, 14, 80, 52],
          [200, 150, 110, .08, 50,100, 68]],
    },
    /* Quieter than the hero on purpose. The top of the page is what could
       happen; the bottom is what did. */
    resume: {
      base: [46, 96, 150, .08],
      f: [[ 80, 200, 210, .15, 50, 28, 62],
          [ 70, 130, 215, .12, 22, 62, 56],
          [180, 210, 230, .09, 78, 66, 54],
          [190, 150, 120, .06, 90, 20, 42],
          [ 60, 110, 180, .07, 50,100, 70]],
    },
  };

  /* Light is not the dark values turned down. Colour on a light ground works
     by tinting rather than glowing, and several low alpha hues stacked on
     white average toward grey, which is the failure mode here: not too
     strong, but dirty. So the hues are held apart across the frame, the
     alphas are roughly two thirds of the dark ones, and every colour stays
     light enough that it tints the page without darkening it. */
  const LIGHT = {
    hero: {
      base: [150, 195, 225, .10],
      f: [[120, 205, 225, .13, 18, 20, 64],
          [130, 170, 235, .12, 72, 14, 60],
          [175, 165, 230, .10, 46, 60, 66],
          [232, 175, 190, .08, 90, 46, 50],
          [150, 195, 225, .08, 50, 98, 76]],
    },
    path: {
      base: [146, 190, 222, .10],
      f: [[120, 205, 220, .13, 12, 28, 56],
          [130, 170, 230, .12, 44, 54, 58],
          [170, 165, 225, .08, 76, 80, 52],
          [140, 180, 225, .07, 92, 18, 46],
          [160, 195, 220, .05, 50,100, 70]],
    },
    education: {
      base: [162, 192, 226, .09],
      f: [[ 96, 176, 240, .17, 10, 28, 66],
          [116, 184, 236, .13, 22, 78, 56],
          [245, 195, 140, .16, 90, 30, 64],
          [245, 210, 170, .13, 82, 82, 54],
          [190, 200, 225, .05, 50, 56, 70]],
    },
    projects: {
      base: [150, 190, 225, .10],
      f: [[120, 210, 215, .13, 20, 24, 56],
          [130, 172, 235, .12, 62, 40, 58],
          [180, 160, 235, .11, 40, 80, 60],
          [225, 165, 225, .07, 86, 70, 48],
          [140, 200, 220, .06, 92, 10, 44]],
    },
    skills: {
      base: [148, 188, 222, .09],
      f: [[125, 205, 220, .10, 16, 22, 42],
          [135, 175, 235, .10, 44, 32, 40],
          [175, 168, 228, .09, 74, 24, 40],
          [130, 198, 218, .09, 30, 74, 40],
          [138, 175, 230, .09, 68, 78, 42]],
    },
    recs: {
      base: [232, 200, 172, .10],
      f: [[245, 200, 145, .13, 24, 28, 60],
          [246, 185, 165, .11, 66, 56, 58],
          [240, 210, 155, .10, 86, 22, 50],
          [190, 175, 225, .06, 14, 80, 52],
          [238, 205, 180, .06, 50,100, 68]],
    },
    resume: {
      base: [176, 206, 228, .08],
      f: [[140, 210, 220, .10, 50, 26, 62],
          [140, 180, 230, .09, 22, 62, 56],
          [200, 220, 235, .07, 78, 66, 54],
          [230, 205, 185, .04, 90, 18, 42],
          [160, 195, 225, .05, 50,100, 70]],
    },
  };

  /* Terminal is a phosphor display, so it gets the dark story rendered in
     one colour rather than a third table. Pulling each hue most of the way
     to green keeps the shape of the narrative, which is what the warm and
     cool moments are made of, without pretending a monochrome tube can show
     amber next to cyan. */
  const PHOSPHOR = [53, 255, 148];
  const PHOSPHOR_PULL = 0.62;

  const smootherstep = (x) => {
    const t = clamp(x, 0, 1);
    return t * t * t * (t * (t * 6 - 15) + 10);
  };

  /* A crossfade sits mostly after the boundary it belongs to rather than
     centred on it: a quarter of its width before, three quarters after. It
     keeps its full length, so the handover is exactly as gradual as it was,
     but a chapter no longer spends half a fade bleeding into the section
     above it. Up and down ramps are the same function of the same boundary,
     so the two weights either side still add to one. */
  const LEAD = 0.25;
  const ramp = (line, span) => smootherstep((line - (span.top - LEAD * span.h)) / (2 * span.h));

  /* --- geometry -----------------------------------------------------------
     Measured through the rect rather than offsetTop, which is relative to
     the nearest positioned ancestor and reads far too small for sections
     that sit inside one. Re-read on resize and once the fonts land, never
     per frame. */
  let spans = [];

  const measure = () => {
    spans = [];
    for (const stage of STAGES) {
      const el = $(stage.sel);
      if (el) spans.push({ key: stage.key, top: el.getBoundingClientRect().top + scrollY });
    }
    spans.sort((a, b) => a.top - b.top);

    const docEnd = document.documentElement.scrollHeight;
    spans.forEach((s, i) => { s.end = i + 1 < spans.length ? spans[i + 1].top : docEnd; });

    /* No minimum length, and no borrowing from neighbours. Both were here
       so a short chapter would not be crossfaded out of existence from both
       sides at once, and they worked, but the cost was that education owned
       nearly a screen more scrolling than it had content for, so its amber
       outlived the section by more than the section's own length.

       A stage reaches full strength without any of that as long as its own
       two ramps do not overlap, which needs the half width under half the
       stage. The clamp below is .38, which leaves a short chapter a window
       of about a quarter of its length at full colour. Education is the
       shortest thing on the page at 368px and it still gets one. */

    /* The furthest the reading line can ever get. The closing stage's span
       runs to the end of the document, which is half a screen past anywhere
       the line can reach, so clamping its crossfade against the span alone
       let the ramp finish somewhere nobody can scroll to and the final
       palette was never reached at all. */
    const maxLine = Math.max(0, document.documentElement.scrollHeight - innerHeight) + innerHeight * 0.5;

    /* The closing section can sit below anywhere the line can get. Contact
       starts 8888px down a document whose last reachable line is 8864, so
       the line never entered its span at all and the resolution palette was
       not merely rushed, it never appeared: at the very bottom of the page
       the field was still showing the warm colours of the section above.

       Pulling that one boundary up is the smallest fix. It means the closing
       colour starts gathering a little before its section, which is the
       thing I have otherwise been removing, but an ending that arrives early
       is worth having and an ending that never arrives is not. It only
       applies when the section is genuinely out of reach. */
    const last = spans[spans.length - 1];
    if (last && spans.length > 1) {
      const cap = maxLine - innerHeight * 0.62;
      if (last.top > cap) {
        last.top = cap;
        spans[spans.length - 2].end = cap;
      }
    }

    spans.forEach((s, i) => {
      if (i === 0) { s.h = 0; return; }
      const prev = spans[i - 1];
      const reach = Math.max(1, Math.min(s.end, maxLine) - s.top);
      s.h = Math.max(1, Math.min(innerHeight * 0.44,
                                 (prev.end - prev.top) * 0.38,
                                 (s.end - s.top) * 0.38,
                                 /* leaves the ramp finished with room to spare */
                                 (reach / (2 - LEAD)) * 0.85));
    });
  };

  /* --- paint --------------------------------------------------------------
     Colours are mixed premultiplied by their own alpha, so a field on its
     way out stops contributing hue as it goes rather than dragging the mix
     through its own colour on the way to nothing. Straight channel mixing
     sends a violet meeting an amber through grey, which is the one result
     neither section wanted. */
  /* One master trim on every alpha in both tables. The presets are written
     at the strength each chapter wants relative to the others; this is the
     single place to say the whole environment should sit a little further
     back, without touching seventy numbers and losing the balance between
     them. One number to turn, which is what it is for. */
  const DIM = 0.53;

  const mixed = new Float64Array(5 * 7);
  const last = { key: '', theme: '' };

  /* Quantised so the paint does not run on every frame of every scroll.
     Three hundred steps across the whole story is still a change too small
     to see between one step and the next (every field is at a fifth of full
     strength or less), and it is a few hundred repaints across an entire
     page rather than one per frame. It was five hundred; each repaint is
     two screen sized gradient layers, which a phone feels. */
  const STEPS = 300;
  const wrote = {};
  function paint(force, y = scrollY) {
    if (!spans.length) return;

    const vh = innerHeight;

    /* The middle of the screen decides the chapter. Nothing else: the older
       version accelerated this line toward the foot of the window over the
       last screen so the closing palette could be reached, and measuring the
       result showed it shoving a whole crossfade through the final eighty
       pixels of the page, one step of which moved a channel by 88. It is not
       needed here. The closing section's span runs to the end of the
       document, and the line can never leave it, because at full scroll the
       line sits half a screen above the bottom. */
    const line = y + vh * 0.5;

    /* Weight per chapter: fully on inside its own span, crossfading across
       each boundary. The two ramps at a shared boundary are complements of
       one another, so the weights always add to one and nothing has to be
       normalised afterwards. */
    let progress = 0;
    let wsum = 0;
    const weights = [];

    for (let i = 0; i < spans.length; i++) {
      const s = spans[i];
      const up = i === 0 ? 1 : ramp(line, s);
      const nxt = spans[i + 1];
      const down = nxt ? ramp(line, nxt) : 0;
      const w = up - down;
      weights.push(w);
      wsum += w;
      progress += w * i;
    }
    if (wsum <= 0) return;

    const theme = root.dataset.theme || '';
    const key = Math.round((progress / Math.max(spans.length - 1, 1)) * STEPS) + '|' + theme;
    if (!force && key === last.key + '|' + last.theme) return;
    last.key = String(Math.round((progress / Math.max(spans.length - 1, 1)) * STEPS));
    last.theme = theme;

    const table = theme === 'daylight' ? LIGHT : DARK;
    const phosphor = theme === 'terminal';

    mixed.fill(0);
    let baseR = 0, baseG = 0, baseB = 0, baseA = 0;

    for (let i = 0; i < spans.length; i++) {
      const w = weights[i] / wsum;
      if (w <= 0.0001) continue;
      const preset = table[spans[i].key];
      if (!preset) continue;

      const b = preset.base;
      const ba = b[3] * DIM;
      baseR += w * ba * b[0]; baseG += w * ba * b[1];
      baseB += w * ba * b[2]; baseA += w * ba;

      for (let f = 0; f < 5; f++) {
        const v = preset.f[f];
        const o = f * 7;
        const wa = w * v[3] * DIM;
        mixed[o]     += wa * v[0];   // premultiplied colour
        mixed[o + 1] += wa * v[1];
        mixed[o + 2] += wa * v[2];
        mixed[o + 3] += wa;          // alpha
        mixed[o + 4] += w * v[4];    // x, y and radius mix straight
        mixed[o + 5] += w * v[5];
        mixed[o + 6] += w * v[6];
      }
    }

    const style = field.style;
    /* Only what moved is written. Within a crossfade the positions and
       radii of most fields barely change from one step to the next, and
       every write restyles the field and repaints it. */
    const put = (prop, v) => { if (wrote[prop] !== v) { wrote[prop] = v; style.setProperty(prop, v); } };

    const toward = (c) => phosphor
      ? [Math.round(c[0] + (PHOSPHOR[0] - c[0]) * PHOSPHOR_PULL),
         Math.round(c[1] + (PHOSPHOR[1] - c[1]) * PHOSPHOR_PULL),
         Math.round(c[2] + (PHOSPHOR[2] - c[2]) * PHOSPHOR_PULL)]
      : c;

    if (baseA > 0.0005) {
      const c = toward([Math.round(baseR / baseA), Math.round(baseG / baseA), Math.round(baseB / baseA)]);
      put('--amb-base',
        `radial-gradient(130% 92% at 50% 0%, rgba(${c[0]},${c[1]},${c[2]},${baseA.toFixed(3)}) 0%, transparent 72%)`);
    } else {
      put('--amb-base', 'transparent');
    }

    for (let f = 0; f < 5; f++) {
      const o = f * 7;
      const a = mixed[o + 3];
      const n = f + 1;
      if (a > 0.0005) {
        const c = toward([Math.round(mixed[o] / a), Math.round(mixed[o + 1] / a), Math.round(mixed[o + 2] / a)]);
        put(`--f${n}c`, `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`);
      } else {
        put(`--f${n}c`, 'transparent');
      }
      put(`--f${n}x`, mixed[o + 4].toFixed(1) + '%');
      put(`--f${n}y`, mixed[o + 5].toFixed(1) + '%');
      put(`--f${n}r`, mixed[o + 6].toFixed(1) + 'vmin');
    }
  }

  measure();
  paint(true);

  // Read the position with the other scroll effects, paint with them after.
  onScrollFrame(() => { const y = scrollY; return () => paint(false, y); });

  /* A resize re-measures, but only repaints if the colours actually move:
     a phone fires one every time its toolbar slides in or out mid scroll,
     and a forced repaint there redrew two screen sized layers for nothing. */
  addEventListener('resize', () => { measure(); paint(false); }, { passive: true });
  if (document.fonts?.ready) document.fonts.ready.then(() => { measure(); paint(true); }).catch(() => {});

  /* A theme swap has to repaint from the same place in the story rather than
     wait for the next scroll, or the ambient light stays on the old theme
     until you move. */
  new MutationObserver(() => paint(true))
    .observe(root, { attributes: true, attributeFilter: ['data-theme'] });
})();

/* ==========================================================================
   Apple-style scroll-linked flourishes
   ========================================================================== */
(function scrollFlourishes() {
  if (prefersReduced()) return;

  /* The hero used to drift, shrink and fade as you scrolled past it. It is
     a glass card, so every frame of that re-rasterised an 18px backdrop blur
     over a transforming box: expensive everywhere, and enough to stall a
     phone for a moment on first scroll. It now simply sits there. */

  /* The colour field used to live here: a scroll fade plus a per section
     palette that switched when a section crossed a line. Both are gone,
     replaced by the ambient block above, which blends continuously and runs
     whether or not motion is reduced. This function does not, and the
     section colours are content rather than motion. */

  /* --- Quote lights up word by word --- */
  const quote = $('.section.quote blockquote');
  if (quote && !quote.querySelector('span')) {
    const words = quote.textContent.trim().split(/\s+/);
    quote.textContent = '';
    quote.classList.add('quote-words');
    words.forEach((w, i) => {
      const s = document.createElement('span');
      s.textContent = w;
      quote.appendChild(s);
      if (i < words.length - 1) quote.appendChild(document.createTextNode(' '));
    });

    const spans = $$('span', quote);
    let litNow = -1;
    onScrollFrame(() => {
      const p = viewportProgress(quote, { start: 0.9, end: 0.45 });
      const lit = Math.round(p * spans.length);
      if (lit === litNow) return;
      return () => { litNow = lit; spans.forEach((s, i) => s.classList.toggle('lit', i < lit)); };
    });
  }

  // The recommendations are a thread now: the bubbles carry their own
  // side-entry reveal, so there is no parallax drift to drive here.

  /* --- Heading gradient sweep --- */
  $$('.section-head h2').forEach((h) => {
    let was = '';
    onScrollFrame(() => {
      const v = viewportProgress(h, { start: 0.95, end: 0.6 }).toFixed(3);
      if (v === was) return;
      return () => { was = v; h.style.setProperty('--sweep', v); };
    });
  });

})();

/* The contact snapshot, pressed onto the page as it scrolls into view
   (stylesheet: CONTACT). */
(function snapshotStick() {
  const print = $('.since-print');
  const pic = print?.querySelector('.since-pic');
  const photo = pic?.querySelector('img');
  if (!print || !pic || !photo || prefersReduced()) return;

  const N = 8;              // strips
  const SPREAD = 0.5;       // how far behind the top strip the bottom one settles
  const HINGE = 34;         // degrees the whole print is lifted at the start
  const CURL = 14;          // and each strip further, relative to the one above
  const bend = document.createElement('div');
  bend.className = 'bend';
  bend.setAttribute('aria-hidden', 'true');
  let strips = [];

  /* One copy of the print per strip, each shifted up so its strip shows its
     own band: the paper in the print's colour, border and corners, and the
     photo where the real one sits, at its size. The print's own look is
     read before it is hidden, and again when the theme changes its paper
     or the print changes size. */
  const build = () => {
    print.classList.remove('has-bend');
    const cs = getComputedStyle(print);
    const bw = parseFloat(cs.borderTopWidth) || 0;
    const H = print.offsetHeight, h = H / N;
    const src = photo.currentSrc || photo.src;
    const paperCss = `height:${H}px;background:${cs.backgroundColor};border:${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor};border-radius:${cs.borderRadius}`;
    const photoCss = `left:${pic.offsetLeft}px;top:${pic.offsetTop}px;width:${pic.offsetWidth}px;height:${pic.offsetHeight}px;background-image:url("${src}")`;
    bend.style.setProperty('--bw', `${bw}px`);
    const shadow = document.createElement('div');
    shadow.className = 'bend-shadow';
    bend.replaceChildren(shadow);
    strips = [];
    let parent = bend;
    for (let i = 0; i < N; i++) {
      const st = document.createElement('div');
      st.className = 'bend-s';
      st.style.height = `${h}px`;
      const f = document.createElement('div');
      f.className = 'bend-f';
      const paper = document.createElement('div');
      paper.className = 'bend-paper';
      paper.style.cssText = `top:${-i * h}px;${paperCss}`;
      const ph = document.createElement('div');
      ph.className = 'bend-photo';
      ph.style.cssText = photoCss;
      const shade = document.createElement('div');
      shade.className = 'bend-shade';
      paper.append(ph);
      f.append(paper, shade);
      st.append(f);
      /* On the back of the bottom strip, over the white margin, a note for
         anyone scrolling slowly enough to see the back of the print. It
         faces away from the front, so it only shows while that strip is
         turned over. */
      if (i === N - 1) {
        const note = document.createElement('div');
        note.className = 'bend-note';
        note.textContent = 'you slowed down to look. so do i.';
        st.append(note);
      }
      parent.append(st);
      parent = st;
      strips.push({ st, shade, t: '', o: '' });
    }
    if (!bend.isConnected) print.append(bend);
    print.classList.add('has-bend');
    last = '';
    kick?.();
  };

  let last = '', kick = null;
  const frame = () => {
    const r = print.getBoundingClientRect();
    const h = innerHeight || 1;
    // From its top edge entering at the foot of the screen to its whole
    // height being in view with a little room under it; smoothstep, so it
    // eases out of the curl and into place.
    const p = clamp((h - r.top) / (print.offsetHeight + h * 0.22), 0, 1);
    const v = p * p * (3 - 2 * p);
    const key = v.toFixed(3);
    if (key === last) return;
    return () => {
      last = key;
      print.style.setProperty('--stick', key);
      let total = 0;
      strips.forEach((st, i) => {
        const local = clamp((v - SPREAD * i / (N - 1)) / (1 - SPREAD), 0, 1);
        const a = (1 - local) * (i === 0 ? HINGE : CURL);
        total += a;
        const t = a < 0.01 ? 'none' : `rotateX(${a.toFixed(2)}deg)`;
        if (t !== st.t) { st.t = t; st.st.style.transform = t; }
        const o = (Math.sin(Math.min(total, 90) * Math.PI / 180) * 0.22).toFixed(3);
        if (o !== st.o) { st.o = o; st.shade.style.opacity = o; }
      });
    };
  };

  // The photo is decoded before the strips first paint it, so coming into
  // view does not also have to decode it in that frame.
  const ready = () => {
    const go = () => { build(); if (!kick) kick = onScrollFrame(frame); };
    (photo.decode ? photo.decode() : Promise.resolve()).then(go, go);
  };
  if (photo.complete && photo.naturalWidth) ready();
  else { photo.loading = 'eager'; photo.addEventListener('load', ready, { once: true }); }

  let builtW = print.clientWidth;
  if ('ResizeObserver' in window) new ResizeObserver(() => { if (print.clientWidth !== builtW && strips.length) { builtW = print.clientWidth; build(); } }).observe(print);
  new MutationObserver(() => { if (strips.length) build(); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
})();

/* ==========================================================================
   Skill + project filtering
   Clicking a skill pill spotlights matching projects and experience.
   ========================================================================== */
(function filtering() {
  const grid = $('#projectGrid');
  if (!grid) return;

  const cards = $$('.card', grid);
  const filterChips = $$('#projectFilters .filter-chip');
  const skillButtons = $$('#skills .pills button');
  const status = $('#filterStatus');
  const statusTag = $('#filterTag');
  const empty = $('#emptyState');

  const tagsOf = (el) => (el.dataset.tags || '').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);

  // A skill label and a card tag do not always match exactly.
  const normalize = (value) => {
    const v = value.toLowerCase().trim();
    const aliases = {
      'microsoft azure': 'azure',
      'azure blob storage': 'azure',
      'node.js': 'node',
      'next.js': 'react',
      'salesforce (apex/lwc)': 'salesforce',
      'html & css': 'html',
      'html &amp; css': 'html',
      'rest apis': 'rest apis',
      'javascript': 'javascript',
    };
    return aliases[v] || v;
  };

  /* Containment has to respect word boundaries. Plain substring matching in
     both directions let "Java" pull in anything tagged "javascript", which is
     just wrong on a filter chip. Boundaries are anything outside the set of
     characters that legitimately appear inside a tech name, so "azure" still
     matches "azure sql" and "c++"/".net"/"c#" stay intact. */
  const INNER = 'a-z0-9+#.';
  const containsWord = (haystack, word) => {
    if (haystack === word) return true;
    const esc = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^${INNER}])${esc}([^${INNER}]|$)`).test(haystack);
  };

  const matches = (el, needle) =>
    tagsOf(el).some((t) => containsWord(t, needle) || containsWord(needle, t));

  /* What is selected, needle to the label it was picked by, in the order
     picked. Empty means everything. The chips above the grid toggle in and
     out of it, so several can be on at once and the grid shows anything
     matching any of them; a skill pill, being a spotlight, replaces it. */
  let selected = new Map();
  const only = (label) => new Map(label === 'all' ? [] : [[normalize(label), label]]);

  /* The most recent role in the Path whose tags include a skill, for the
     skills no project uses (Apex, say, is ADT). Roles are listed oldest
     first, so the last match is the latest. */
  const roles = $$('.jcard');
  const roleFor = (needle) => {
    let found = null;
    roles.forEach((r) => {
      const tags = $$('.jc-tags span', r).map((t) => normalize(t.textContent));
      if (tags.some((t) => containsWord(t, needle) || containsWord(needle, t))) found = r;
    });
    return found;
  };

  /* The Path is driven by scroll position: role i of N is on screen at
     i / (N - 1) of the way through its pinned stretch. With reduced motion
     it is a plain list, so the card itself is scrolled to. */
  const showRole = (card) => {
    const scope = $('#journeyScope');
    const smooth = prefersReduced() ? 'auto' : 'smooth';
    if (scope?.closest('.journey-section')?.classList.contains('is-compact')) {
      document.dispatchEvent(new CustomEvent('path:open', { detail: { index: roles.indexOf(card) } }));
      return;
    }
    const still = scope?.closest('.journey-section')?.classList.contains('is-still');
    if (!scope || still || roles.length < 2) {
      card.scrollIntoView({ behavior: smooth, block: 'start' });
      return;
    }
    const sticky = scope.firstElementChild;
    const travel = scope.offsetHeight - (sticky?.offsetHeight || innerHeight);
    const i = roles.indexOf(card);
    const top = scope.getBoundingClientRect().top + scrollY;
    // The last role sits at the very end of the pinned stretch, where the
    // board starts to scroll away; stop a little short of it.
    const at = Math.min(i, roles.length - 1.3) / (roles.length - 1);
    scrollTo({ top: Math.round(top + travel * at) + 2, behavior: smooth });
  };

  const apply = (sel, { scroll = false } = {}) => {
    selected = sel;
    const needles = [...selected.keys()];
    const any = needles.length > 0;

    let visible = 0;
    cards.forEach((card) => {
      const hit = !any || needles.some((n) => matches(card, n));
      card.classList.toggle('is-hidden', !hit);
      card.classList.toggle('is-lit', hit && any);
      if (hit) visible++;
    });

    filterChips.forEach((c) => {
      const f = c.dataset.filter;
      const on = f === 'all' ? !any : selected.has(normalize(f));
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-pressed', String(on));
    });
    skillButtons.forEach((b) => b.classList.toggle('is-active', selected.has(normalize(b.textContent))));

    if (status && statusTag) {
      status.hidden = !any;
      statusTag.textContent = [...selected.values()].join(', ');
    }
    if (empty) empty.hidden = visible !== 0;

    if (scroll) {
      grid.closest('section')?.scrollIntoView({
        behavior: prefersReduced() ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  };

  // All clears; any other chip toggles itself in or out.
  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const f = chip.dataset.filter;
      if (f === 'all') { apply(only('all')); return; }
      const next = new Map(selected);
      const n = normalize(f);
      if (next.has(n)) next.delete(n); else next.set(n, chip.textContent.trim());
      apply(next);
    });
  });

  skillButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const label = btn.textContent.trim();
      const needle = normalize(label);
      if (selected.size === 1 && selected.has(needle)) { apply(only('all')); toast('Filter cleared'); return; }

      const hits = cards.filter((c) => needle === 'all' || matches(c, needle)).length;
      if (!hits) {
        // No project uses it, but a role might: take them to it in the Path.
        const role = roleFor(needle);
        if (role) {
          apply(only('all'));
          showRole(role);
          toast(`${label}: used at ${role.dataset.company}`);
          return;
        }
      }
      apply(only(label), { scroll: true });
      toast(hits ? `${hits} project${hits === 1 ? '' : 's'} using ${label}` : `No projects tagged ${label} yet`);
    });
  });

  $('#filterClear')?.addEventListener('click', () => apply(only('all')));
  $('[data-filter-reset]')?.addEventListener('click', () => apply(only('all')));
  apply(only('all'));
})();

/* ==========================================================================
   Command palette (⌘K / Ctrl+K)
   ========================================================================== */
const palette = (() => {
  const dialog = $('#palette');
  const input = $('#paletteInput');
  const list = $('#paletteList');
  if (!dialog || !input || !list) return { open: () => {} };

  const go = (id) => () => document.getElementById(id)?.scrollIntoView({
    behavior: prefersReduced() ? 'auto' : 'smooth',
    block: 'start',
  });

  const commands = [
    { icon: '⌂', title: 'Top',              kind: 'section', run: go('top') },
    { icon: '≡', title: 'The Path',         sub: 'Career journey, role by role', kind: 'section', run: go('experience') },
    { icon: '⌁', title: 'Education',        kind: 'section', run: go('education') },
    { icon: '▤', title: 'Projects',         kind: 'section', run: go('projects') },
    { icon: '⚙', title: 'Off the Clock',    kind: 'section', run: go('offclock') },
    { icon: '✦', title: 'Skills & Tools',   kind: 'section', run: go('skills') },
    { icon: '❞', title: 'Recommendations',  kind: 'section', run: go('recs') },
    { icon: '✉', title: 'Contact',          kind: 'section', run: go('contact') },

    { icon: '↗', title: 'SommiScript',      sub: 'Custom language + Java interpreter', kind: 'project', run: () => window.open('https://github.com/ajaysommi/SommiScript', '_blank', 'noopener') },
    { icon: '↗', title: 'GatorGoods',       sub: 'MERN marketplace for UF students',   kind: 'project', run: () => window.open('https://github.com/ajaysommi/GatorGoods', '_blank', 'noopener') },
    { icon: '↗', title: 'BalanceTree',      sub: 'Self-balancing AVL tree in C++',     kind: 'project', run: () => window.open('https://github.com/ajaysommi/BalanceTree', '_blank', 'noopener') },
    { icon: '↗', title: 'Crash Fatality Analysis', sub: 'Vehicle safety data, 1996 to 2022', kind: 'project', run: () => window.open('https://github.com/ajaysommi/Car-Crash-Analyzation-Tool', '_blank', 'noopener') },

    { icon: '⎘', title: 'Copy email',       sub: 'ajaysommi7@gmail.com', kind: 'action', run: async () => {
        try { await navigator.clipboard.writeText('ajaysommi7@gmail.com'); toast('Copied ajaysommi7@gmail.com'); }
        catch { location.href = 'mailto:ajaysommi7@gmail.com'; }
      } },
    { icon: '⇩', title: 'Open resume',      sub: 'PDF + inline viewer', kind: 'action', run: () => { location.href = 'resume.html'; } },
    { icon: '⌘', title: 'GitHub profile',   kind: 'action', run: () => window.open('https://github.com/ajaysommi', '_blank', 'noopener') },
    { icon: 'in', title: 'LinkedIn profile', kind: 'action', run: () => window.open('https://www.linkedin.com/in/ajay-sommi/', '_blank', 'noopener') },

    { icon: '◐', title: 'Theme: Midnight',  kind: 'theme', run: () => setTheme('midnight') },
    { icon: '☀', title: 'Theme: Daylight',  kind: 'theme', run: () => setTheme('daylight') },
    { icon: '▮', title: 'Theme: Terminal',  kind: 'theme', run: () => setTheme('terminal') },
    { icon: '▸', title: 'Open terminal',    sub: 'Try `help`', kind: 'easter egg', run: () => terminal.open() },
    { icon: '🐊', title: 'Release the gators', kind: 'easter egg', run: () => gatorStorm(18) },
  ];

  let results = commands.slice();
  let selected = 0;

  const score = (cmd, q) => {
    const hay = `${cmd.title} ${cmd.sub || ''} ${cmd.kind}`.toLowerCase();
    if (!q) return 1;
    if (hay.startsWith(q)) return 100;
    if (cmd.title.toLowerCase().includes(q)) return 60;
    if (hay.includes(q)) return 30;
    // Loose subsequence match so "recs" finds "Recommendations".
    let i = 0;
    for (const ch of hay) if (ch === q[i]) i++;
    return i === q.length ? 10 : 0;
  };

  const render = () => {
    list.innerHTML = '';
    if (!results.length) {
      const li = document.createElement('li');
      li.className = 'palette-empty';
      li.textContent = 'No matches.';
      list.appendChild(li);
      return;
    }
    results.forEach((cmd, i) => {
      const li = document.createElement('li');
      li.className = i === selected ? 'is-selected' : '';
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(i === selected));

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML =
        `<span class="pal-icon"></span>` +
        `<span class="pal-text"><b></b>${cmd.sub ? '<small></small>' : ''}</span>` +
        `<span class="pal-kind"></span>`;
      btn.querySelector('.pal-icon').textContent = cmd.icon;
      btn.querySelector('b').textContent = cmd.title;
      if (cmd.sub) btn.querySelector('small').textContent = cmd.sub;
      btn.querySelector('.pal-kind').textContent = cmd.kind;

      btn.addEventListener('click', (e) => { e.preventDefault(); execute(cmd); });
      li.appendChild(btn);
      list.appendChild(li);
    });
  };

  const execute = (cmd) => {
    close();
    setTimeout(() => cmd.run(), 120);
  };

  const filter = () => {
    const q = input.value.trim().toLowerCase();
    results = commands
      .map((c) => ({ c, s: score(c, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.c);
    selected = 0;
    render();
  };

  const open = () => {
    if (dialog.open) return;
    input.value = '';
    filter();
    dialog.showModal();
    requestAnimationFrame(() => input.focus());
  };

  const close = () => { if (dialog.open) dialog.close(); };

  input.addEventListener('input', filter);

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || (e.key === 'n' && e.ctrlKey)) {
      e.preventDefault();
      selected = (selected + 1) % Math.max(results.length, 1);
      render();
      list.children[selected]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp' || (e.key === 'p' && e.ctrlKey)) {
      e.preventDefault();
      selected = (selected - 1 + Math.max(results.length, 1)) % Math.max(results.length, 1);
      render();
      list.children[selected]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selected]) execute(results[selected]);
    }
  });

  // Click on the backdrop closes.
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });

  // Desktop's inline button and mobile's floating one both open the same
  // palette; only one is ever visible at a given breakpoint (CSS handles
  // that), so wiring both here is just picking up whichever is showing.
  $$('#paletteBtn, #paletteBtnMobile').forEach((btn) => btn.addEventListener('click', open));

  return { open, close };
})();

/* ==========================================================================
   Mini terminal
   ========================================================================== */
const terminal = (() => {
  const panel = $('#terminal');
  const out = $('#termOut');
  const input = $('#termInput');
  if (!panel || !out || !input) return { open: () => {}, toggle: () => {} };

  const history = [];
  let historyIdx = -1;

  const write = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    out.appendChild(div);
    const body = $('#termBody');
    if (body) body.scrollTop = body.scrollHeight;
  };

  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const COMMANDS = {
    help: () => write(
      `<span class="t-dim">Available commands</span>\n` +
      `  <span class="t-key">whoami</span>      who you're talking to\n` +
      `  <span class="t-key">skills</span>      the stack, grouped\n` +
      `  <span class="t-key">experience</span>  roles, newest first\n` +
      `  <span class="t-key">projects</span>    selected work\n` +
      `  <span class="t-key">education</span>   degree + coursework\n` +
      `  <span class="t-key">contact</span>     how to reach me\n` +
      `  <span class="t-key">resume</span>      open the resume\n` +
      `  <span class="t-key">theme</span>       [midnight|daylight|terminal]\n` +
      `  <span class="t-key">goto</span>        jump to a section\n` +
      `  <span class="t-key">gator</span>       chomp\n` +
      `  <span class="t-key">clear</span>       wipe the scrollback\n` +
      `  <span class="t-key">exit</span>        close this terminal`
    ),

    /* Undocumented on purpose: these are not in help, and finding one is the
       whole point. */
    sudo: (rest) => write(
      rest
        ? `<span class="t-warn">ajay is not in the sudoers file.</span> This incident has been reported.`
        : `<span class="t-dim">usage: sudo &lt;command&gt;. Though it will not help you here.</span>`
    ),

    ls: () => write(
      `<span class="t-dim">drwxr-xr-x</span>  experience/\n` +
      `<span class="t-dim">drwxr-xr-x</span>  projects/\n` +
      `<span class="t-dim">drwxr-xr-x</span>  education/\n` +
      `<span class="t-dim">-rw-r--r--</span>  resume.pdf\n` +
      `<span class="t-dim">-rw-------</span>  .secrets  <span class="t-dim">(nice try)</span>`
    ),

    coffee: () => write(
      `<span class="t-warn">418</span> I'm a teapot.\n` +
      `<span class="t-dim">Though realistically it is closer to a fourth cold brew.</span>`
    ),

    whoami: () => write(
      `ajay sommi\n` +
      `<span class="t-dim">Software engineer · Gainesville, FL · U.S. citizen</span>\n` +
      `B.S. Computer Science, University of Florida.\n` +
      `Backend services, cloud data plumbing, and internal tools\n` +
      `that hold up after the demo.`
    ),

    skills: () => write(
      `<span class="t-key">languages</span>  C#, C++, Python, Java, JavaScript, TypeScript, SQL\n` +
      `<span class="t-key">cloud</span>      Azure, Blob Storage, CosmosDB, Azure SQL, KQL, Power BI\n` +
      `<span class="t-key">frameworks</span> .NET, Blazor, React, Next.js, Node.js\n` +
      `<span class="t-key">devops</span>     Git, Azure DevOps, Docker, GitHub Actions`
    ),

    experience: () => write(
      `<span class="t-key">2026</span>       Software Engineering Intern · ADT\n` +
      `<span class="t-key">2026</span>       SWE Co-op, R&amp;D · Hunter Engineering\n` +
      `<span class="t-key">2025</span>       SWE Intern · JM Family Enterprises\n` +
      `<span class="t-key">2024</span>       SWE Intern · Southeast Toyota Distributors\n` +
      `<span class="t-key">2023/24</span>    AI Cybersecurity Researcher · FICS @ UF\n` +
      `<span class="t-key">2022/23</span>    SWE Intern · Robotics For All\n` +
      `<span class="t-key">2020</span>       SEO Analyst · Shiva Robotics Academy\n` +
      `<span class="t-key">2019/20</span>    Software Developer · Renaissance Jax\n` +
      `<span class="t-dim">Run \`goto experience\` to walk the path.</span>`
    ),

    projects: () => write(
      `<a href="https://github.com/ajaysommi/SommiScript" target="_blank" rel="noopener">SommiScript</a>      custom language + Java interpreter\n` +
      `<a href="https://github.com/ajaysommi/GatorGoods" target="_blank" rel="noopener">GatorGoods</a>       MERN marketplace for UF students\n` +
      `<a href="https://github.com/ajaysommi/BalanceTree" target="_blank" rel="noopener">BalanceTree</a>      self-balancing AVL tree in C++\n` +
      `<a href="https://github.com/ajaysommi/Car-Crash-Analyzation-Tool" target="_blank" rel="noopener">CrashAnalysis</a>    vehicle fatality trends, 1996 to 2022\n` +
      `WAD+FUSE         a real mountable file system in C++`
    ),

    education: () => write(
      `University of Florida, B.S. Computer Science\n` +
      `<span class="t-dim">Herbert Wertheim College of Engineering · Dec 2026</span>\n` +
      `UF AI Certificate. OS, databases, DSA, software engineering,\n` +
      `artificial intelligence, cybersecurity.`
    ),

    contact: () => write(
      `email     <a href="mailto:ajaysommi7@gmail.com">ajaysommi7@gmail.com</a>\n` +
      `github    <a href="https://github.com/ajaysommi" target="_blank" rel="noopener">github.com/ajaysommi</a>\n` +
      `linkedin  <a href="https://www.linkedin.com/in/ajay-sommi/" target="_blank" rel="noopener">in/ajay-sommi</a>`
    ),

    resume: () => { write(`<span class="t-dim">opening resume…</span>`); setTimeout(() => { location.href = 'resume.html'; }, 500); },

    theme: (arg) => {
      if (!arg) { write(`current: <span class="t-key">${root.dataset.theme}</span>  <span class="t-dim">usage: theme [midnight|daylight|terminal]</span>`); return; }
      if (!THEMES.includes(arg)) { write(`<span class="t-warn">unknown theme "${esc(arg)}"</span>. Try midnight, daylight or terminal`); return; }
      setTheme(arg, false);
      write(`theme → <span class="t-key">${arg}</span>`);
    },

    goto: (arg) => {
      const el = arg && document.getElementById(arg);
      if (!el) { write(`<span class="t-warn">no section "${esc(arg || '')}"</span>. Try top, experience, education, projects, skills, recs, contact`); return; }
      write(`<span class="t-dim">scrolling to ${esc(arg)}…</span>`);
      el.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'start' });
    },

    gator: () => { gatorStorm(14); write(`<span class="t-warn">🐊 chomp chomp</span>. Go gators`); },

    sudo: (arg) => {
      if ((arg || '').includes('hire')) {
        write(`<span class="t-key">Permission granted.</span> Resume: <a href="resume.html">resume.html</a>\nEmail: <a href="mailto:ajaysommi7@gmail.com">ajaysommi7@gmail.com</a>`);
        confetti();
      } else {
        write(`<span class="t-warn">ajay is not in the sudoers file. This incident has been reported.</span>`);
      }
    },

    clear: () => { out.innerHTML = ''; },
    exit: () => close(),
  };

  /* `ls` used to alias to help; it lists a directory now, which is what a
     terminal ought to do with it. `man` and `?` still reach help. */
  const ALIASES = { man: 'help', '?': 'help', who: 'whoami', exp: 'experience', work: 'experience', proj: 'projects', edu: 'education', email: 'contact', cv: 'resume', quit: 'exit', close: 'exit' };

  const run = (raw) => {
    const line = raw.trim();
    write(`<span class="t-dim">ajay@portfolio ~ %</span> <span class="t-cmd">${esc(line)}</span>`);
    if (!line) return;

    history.unshift(line);
    historyIdx = -1;

    const [head, ...rest] = line.split(/\s+/);
    const name = ALIASES[head.toLowerCase()] || head.toLowerCase();
    const fn = COMMANDS[name];

    if (fn) fn(rest.join(' ').trim());
    else write(`<span class="t-warn">command not found: ${esc(head)}</span>. Type <span class="t-key">help</span>`);
  };

  const open = () => {
    if (!panel.hidden) { input.focus(); return; }
    panel.hidden = false;
    if (!out.childElementCount) {
      write(`<span class="t-dim">ajay-portfolio ${new Date().getFullYear()} · type </span><span class="t-key">help</span><span class="t-dim"> to get started</span>`);
    }
    requestAnimationFrame(() => input.focus());
  };

  const close = () => { panel.hidden = true; };
  const toggle = () => (panel.hidden ? open() : close());

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { run(input.value); input.value = ''; }
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIdx < history.length - 1) { historyIdx++; input.value = history[historyIdx]; }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) { historyIdx--; input.value = history[historyIdx]; }
      else { historyIdx = -1; input.value = ''; }
    } else if (e.key === 'Escape') { close(); }
  });

  $('#termClose')?.addEventListener('click', close);
  $('#termBody')?.addEventListener('click', () => input.focus());

  return { open, close, toggle };
})();

/* ==========================================================================
   Confetti + gator storm
   ========================================================================== */
function confetti(count = 90) {
  if (prefersReduced()) return;
  const colors = ['#71FFE9', '#3BA4F6', '#FA4616', '#0021A5', '#ffffff'];
  for (let i = 0; i < count; i++) {
    const bit = document.createElement('div');
    bit.className = 'confetti-bit';
    bit.style.left = `${Math.random() * 100}vw`;
    bit.style.top = `${-10 - Math.random() * 20}vh`;
    bit.style.background = colors[Math.floor(Math.random() * colors.length)];
    bit.style.setProperty('--dx', `${(Math.random() - 0.5) * 320}px`);
    bit.style.setProperty('--spin', `${Math.random() * 1080}deg`);
    bit.style.setProperty('--dur-fall', `${1.9 + Math.random() * 1.7}s`);
    document.body.appendChild(bit);
    bit.addEventListener('animationend', () => bit.remove(), { once: true });
  }
}

function flyGator(x, y) {
  if (prefersReduced()) return;
  const emojis = ['🐊', '🧡', '💙', '🏈', '🎓', '📘', '📚', '💻', '📎', '🌴'];
  const el = document.createElement('div');
  el.className = 'flying-gator';
  el.textContent = emojis[Math.floor(Math.random() * emojis.length)];

  const w = innerWidth, h = innerHeight;
  const ends = [
    { x: w + 90, y: Math.random() * h },
    { x: -90, y: Math.random() * h },
    { x: Math.random() * w, y: -90 },
    { x: Math.random() * w, y: h + 90 },
  ];
  const end = ends[Math.floor(Math.random() * ends.length)];

  el.style.setProperty('--start-x', `${x}px`);
  el.style.setProperty('--start-y', `${y}px`);
  el.style.setProperty('--end-x', `${end.x}px`);
  el.style.setProperty('--end-y', `${end.y}px`);
  el.style.setProperty('--spin', `${(Math.random() - 0.5) * 720}deg`);

  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove(), { once: true });
}

function gatorStorm(n = 12) {
  for (let i = 0; i < n; i++) {
    setTimeout(() => flyGator(Math.random() * innerWidth, innerHeight * (0.3 + Math.random() * 0.5)), i * 90);
  }
}

/* The gator flourish is opt-in now: reachable via the terminal `gator`
   command, the command palette, and the Konami code, not fired at anyone
   who happens to hover the education card. */

/* ==========================================================================
   Global keyboard shortcuts
   ========================================================================== */
(function shortcuts() {
  const isTyping = (el) =>
    el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);

  document.addEventListener('keydown', (e) => {
    // ⌘K / Ctrl+K opens the command palette
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      palette.open();
      return;
    }
    if (isTyping(document.activeElement)) return;

    // "/" focuses the palette too, like most dev tools.
    if (e.key === '/') { e.preventDefault(); palette.open(); return; }
    // "~" or "`" toggles the terminal.
    if (e.key === '~' || e.key === '`') { e.preventDefault(); terminal.toggle(); return; }
    // "t" cycles the theme.
    if (e.key.toLowerCase() === 't' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      setTheme(THEMES[(THEMES.indexOf(root.dataset.theme) + 1) % THEMES.length]);
    }
  });

  // Konami code
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let pos = 0;
  document.addEventListener('keydown', (e) => {
    if (isTyping(document.activeElement)) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    pos = key === KONAMI[pos] ? pos + 1 : (key === KONAMI[0] ? 1 : 0);
    if (pos === KONAMI.length) {
      pos = 0;
      confetti(140);
      gatorStorm(20);
      toast('Konami unlocked. Go gators 🐊');
    }
  });
})();

/* ==========================================================================
   LIQUID GLASS
   Experiment branch. The bar is treated as one persistent piece of optical
   material that changes state, rather than as elements playing animations.
   The material itself (fill, frost, tint, contrast layers, the light on
   its edges) is CSS in the liquid layer; this is everything that has to be
   computed: the environment it sits in, and how it moves. There is no
   refraction: the glass is a soft blur in every browser.

   Pointer movement writes a handful of numbers per frame and never touches
   layout. Geometry is measured on resize and cached.
   ========================================================================== */
(function liquidGlass() {
  const bar = $('header.nav');
  if (!bar) return;

  const fab = $('.dock-fab');
  const reduced = prefersReduced;
  const clamp01 = (v) => clamp(v, 0, 1);
  /* Inline style writes that skip a value already there. The loop runs every
     frame while anything is settling, and most of what it writes on most
     frames has not moved; each write would still restyle the bar and re-run
     its backdrop filter. */
  const written = new WeakMap();
  const put = (el, prop, v) => {
    let m = written.get(el);
    if (!m) written.set(el, (m = {}));
    if (m[prop] === v) return;
    m[prop] = v;
    if (prop.startsWith('--')) el.style.setProperty(prop, v);
    else el.style[prop] = v;
  };

  /* ------------------------------------------------------------------------
     Environment

     The glass takes a faint colour from what is behind it and adjusts its
     own density so what is in front of it stays legible. A backdrop cannot
     be read back from script, so this estimates it from two things it can
     know: the ambient field, whose colours and positions are already
     written on .bg, and whatever element is actually under the bar at a few
     points along it. A photograph under a dark bar darkens the glass; a
     dark stretch under a light bar lifts it. Estimates ease toward their
     targets, so nothing ever switches.
     ------------------------------------------------------------------------ */
  const field = $('.bg');
  const env = { r: 120, g: 160, b: 230, dim: 0, lift: 0 };
  const envT = { ...env };
  const parseRGBA = (s) => {
    const m = s && s.match(/rgba?\(([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:[, /]+([\d.]+))?/);
    return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null;
  };
  const luma = (r, g, b) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  function underLuma(x, y) {
    const stack = document.elementsFromPoint(x, y);
    for (const el of stack) {
      if (el === bar || bar.contains(el) || el === fab || fab?.contains(el)) continue;
      if (el === field || field?.contains(el) || el === document.body || el === root) break;
      if (el.tagName === 'IMG' || el.tagName === 'VIDEO' || el.tagName === 'CANVAS') return 0.55;
      const c = parseRGBA(getComputedStyle(el).backgroundColor);
      if (c && c[3] > 0.35) return luma(c[0], c[1], c[2]);
    }
    return null;
  }

  function sampleEnv() {
    const rect = bar.getBoundingClientRect();
    const yPct = ((rect.top + rect.height / 2) / Math.max(innerHeight, 1)) * 100;

    // Ambient colour, weighted by each field's strength and nearness.
    let r = 0, g = 0, b = 0, wsum = 0;
    if (field) {
      for (let n = 1; n <= 5; n++) {
        const c = parseRGBA(field.style.getPropertyValue(`--f${n}c`));
        if (!c) continue;
        const fx = parseFloat(field.style.getPropertyValue(`--f${n}x`)) || 50;
        const fy = parseFloat(field.style.getPropertyValue(`--f${n}y`)) || 50;
        const dist = Math.hypot((fx - 50) * 0.55, fy - yPct);
        const w = c[3] * Math.exp(-((dist / 48) ** 2));
        r += c[0] * w; g += c[1] * w; b += c[2] * w; wsum += w;
      }
    }
    if (wsum > 0.001) {
      envT.r = r / wsum; envT.g = g / wsum; envT.b = b / wsum;
    }

    // What is actually behind it, at five points along its length.
    const pageL = luma(...(parseRGBA(getComputedStyle(root).backgroundColor) || [8, 12, 22, 1]).slice(0, 3));
    let sum = 0, count = 0;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < 5; i++) {
      const x = rect.left + rect.width * (0.1 + 0.2 * i);
      const l = underLuma(x, cy);
      sum += l === null ? pageL : l;
      count++;
    }
    const L = sum / count;
    const light = root.dataset.theme === 'daylight';
    envT.dim = light ? 0 : clamp((L - 0.28) * 0.9, 0, 0.42);
    envT.lift = light ? clamp((0.62 - L) * 0.9, 0, 0.38) : 0;
    wake();
  }

  /* Only what changed is written. --lg-dim feeds the backdrop filter, and
     every write to it re-runs the filter, whether or not the value moved. */
  let envSig = '';
  function writeEnv() {
    const v = `${env.r.toFixed(0)}, ${env.g.toFixed(0)}, ${env.b.toFixed(0)}`;
    const dim = env.dim.toFixed(3), lift = env.lift.toFixed(3);
    const sig = `${v}|${dim}|${lift}`;
    if (sig === envSig) return;
    envSig = sig;
    [bar, fab].forEach((el) => {
      if (!el) return;
      el.style.setProperty('--lg-env', v);
      el.style.setProperty('--lg-dim', dim);
      el.style.setProperty('--lg-lift', lift);
    });
  }

  let envTimer = 0, envLast = 0;
  const queueEnv = () => {
    const now = performance.now();
    // At most every 180ms while the page moves, and once more when it stops;
    // the estimate eases toward each sample, so the spacing never shows.
    if (now - envLast > 180) { envLast = now; sampleEnv(); return; }
    clearTimeout(envTimer);
    envTimer = setTimeout(() => { envLast = performance.now(); sampleEnv(); }, 190);
  };

  /* ------------------------------------------------------------------------
     Geometry, cached

     Everything the per frame loop needs is measured here, on resize and
     once the fonts land, and never while the pointer is moving.
     ------------------------------------------------------------------------ */
  const pocket = document.createElement('span');
  pocket.className = 'nav-pocket';
  pocket.setAttribute('aria-hidden', 'true');
  bar.prepend(pocket);

  const ITEM_SEL = '.nav-links a, header.nav .brand, header.nav .icon-btn, header.nav a.cta';
  let items = [];
  let barRect = null, border = 1;

  function measure() {
    barRect = bar.getBoundingClientRect();
    border = parseFloat(getComputedStyle(bar).borderLeftWidth) || 0;
    items = $$(ITEM_SEL, bar)
      .filter((el) => el.offsetWidth > 0 && getComputedStyle(el).display !== 'none')
      .map((el) => {
        const r = (el.classList.contains('brand') ? el.querySelector('.brand-mark') || el : el).getBoundingClientRect();
        return { el, left: r.left - barRect.left - border, width: r.width };
      });
  }

  /* ------------------------------------------------------------------------
     Motion

     Damped springs on a unit mass, one clock. Values chosen from the spec's
     ranges and tuned by eye:

       pointer response    k 240, c 30   almost no overshoot
       pocket, leading     k 520, c 34   a touch of overshoot on arrival
       pocket, trailing    k 250, c 30   the back edge catches up late,
                                         which is the stretch
       press               k 700, c 46   fast in, fast out

     Distant moves raise the stiffness a little so a long trip across the
     bar does not feel sluggish, and scale the damping with it so the
     character of the motion stays the same.
     ------------------------------------------------------------------------ */
  const S = {
    near: 0, vNear: 0, tNear: 0,
    dx: 0, vDx: 0, tDx: 0,
    press: 0, vPress: 0, tPress: 0,
    L: 0, vL: 0, tL: 0,
    R: 0, vR: 0, tR: 0,
    op: 0, vOp: 0, tOp: 0,
  };

  const spring = (key, k, c, dt) => {
    const v = 'v' + key[0].toUpperCase() + key.slice(1);
    const t = 't' + key[0].toUpperCase() + key.slice(1);
    const a = -k * (S[key] - S[t]) - c * S[v];
    S[v] += a * dt;
    S[key] += S[v] * dt;
    return Math.abs(S[key] - S[t]) > 0.02 || Math.abs(S[v]) > 0.05;
  };

  /* The clock starts on the first frame it is given, not on
     performance.now() when it was asked for. The two are not the same
     clock: a frame callback requested from an input handler can run in the
     current frame, whose timestamp is already in the past, so measuring
     from performance.now() gives a negative step. A damped spring stepped
     backwards is an undamped one, and it grows without limit: that sent the
     pocket to a hundred and fifty thousand pixels wide on a press. dt is
     also clamped at zero for the same reason, and at a thirtieth of a
     second above so a stalled frame cannot fling anything. */
  let raf = 0, lastT = -1;
  function wake() {
    if (!raf) { lastT = -1; raf = requestAnimationFrame(frame); }
  }

  function frame(now) {
    if (lastT < 0) lastT = now;
    const dt = clamp((now - lastT) / 1000, 0, 1 / 30);
    lastT = now;
    const rm = reduced();
    let busy = false;

    // Environment eases toward its estimate.
    for (const k of ['r', 'g', 'b', 'dim', 'lift']) {
      const d = envT[k] - env[k];
      if (Math.abs(d) > (k.length === 1 ? 0.3 : 0.002)) { env[k] += d * Math.min(1, dt * 7); busy = true; }
      else env[k] = envT[k];
    }
    writeEnv();

    // Pointer response and press.
    busy = spring('near', 240, 30, dt) || busy;
    busy = spring('press', 700, 46, dt) || busy;
    if (!rm) busy = spring('dx', 240, 30, dt) || busy;
    else S.dx = 0;

    put(bar, '--lg-near', clamp01(S.near).toFixed(3));
    /* A tiny lean toward the pointer, a pixel or so, on the independent
       translate and scale properties so it composes with the transform that
       centres the bar. Sideways only: any vertical give read as the bar
       bobbing up and down under the pointer. */
    put(bar, 'translate', rm ? '' : `${S.dx.toFixed(2)}px 0`);
    put(bar, 'scale', rm ? '' : `${(1 + clamp01(S.near) * 0.0025 - clamp01(S.press) * 0.004).toFixed(4)} 1`);

    // Pocket.
    const dir = Math.sign((S.tL + S.tR) - (S.L + S.R));
    const dist = Math.abs((S.tL + S.tR) / 2 - (S.L + S.R) / 2);
    /* Long trips get stiffer so crossing the bar does not drag, and the
       trailing edge lags more on long trips than on short ones: next door,
       it keeps nearly level with the front and the move settles almost at
       once; across the bar, it falls behind and the stretch shows. Damping
       scales with stiffness so the character of the motion holds. */
    const boost = 1 + Math.min(dist / 420, 0.6);
    const near = 1 - Math.min(dist / 300, 1);
    const kLead = 520 * boost, kTrail = (250 + 230 * near) * boost;
    const lead = [kLead, 1.5 * Math.sqrt(kLead)];
    const trail = [kTrail, 1.86 * Math.sqrt(kTrail)];
    if (rm) {
      S.L = S.tL; S.R = S.tR; S.vL = S.vR = 0;
    } else {
      const [kL, cL] = dir > 0 ? trail : lead;
      const [kR, cR] = dir > 0 ? lead : trail;
      busy = spring('L', kL, cL, dt) || busy;
      busy = spring('R', kR, cR, dt) || busy;
    }
    busy = spring('op', rm ? 900 : 300, rm ? 60 : 34, dt) || busy;
    renderPocket();

    raf = busy ? requestAnimationFrame(frame) : 0;
  }

  function renderPocket() {
    const w = Math.max(0, S.R - S.L);
    const op = clamp01(S.op);
    put(pocket, 'opacity', op.toFixed(3));
    if (op < 0.005) return;

    /* It stretches and settles sideways only. It used to pinch in at the
       waist while stretched, and it shrank in both directions on a press;
       together they read as the bubble billowing up and down as it moved
       between tabs. Its height never changes now. */
    const pressK = 1 - clamp01(S.press) * 0.018;
    put(pocket, 'width', `${w.toFixed(2)}px`);
    put(pocket, 'transform', `translate3d(${S.L.toFixed(2)}px, -50%, 0) scale(${pressK.toFixed(4)}, 1)`);
  }

  /* ------------------------------------------------------------------------
     Where the pocket goes

     At rest it marks the current section. Pointing at an item takes it
     there; leaving the bar sends it back. Arriving from nothing it swells
     out from the middle of its target rather than fading in, and leaving
     for nothing it draws back into a point and goes, so it always reads as
     the same piece of glass.
     ------------------------------------------------------------------------ */
  let hovered = null, pressedItem = null;

  const itemFor = (el) => items.find((it) => it.el === el || it.el.contains(el));

  function retarget() {
    const cur = bar.querySelector('.nav-links a.is-current');
    const target = pressedItem || hovered || (cur && itemFor(cur)) || null;
    items.forEach((it) => it.el.classList.toggle('is-pocketed', !!target && it === target));

    if (!target) {
      const mid = (S.L + S.R) / 2;
      S.tL = S.tR = mid;
      S.tOp = 0;
    } else {
      if (S.op < 0.05) {
        const mid = target.left + target.width / 2;
        S.L = S.R = mid; S.vL = S.vR = 0;
      }
      S.tL = target.left;
      S.tR = target.left + target.width;
      S.tOp = 1;
    }
    wake();
  }

  /* ------------------------------------------------------------------------
     Input
     ------------------------------------------------------------------------ */
  let px = -1e4, py = -1e4, pointerKind = 'mouse';

  function pointerUpdate() {
    if (!barRect || pointerKind !== 'mouse' || reduced()) {
      S.tNear = 0; S.tDx = 0;
      wake();
      return;
    }
    const r = barRect;
    const ox = Math.max(r.left - px, 0, px - r.right);
    const oy = Math.max(r.top - py, 0, py - r.bottom);
    const near = clamp01(1 - Math.hypot(ox, oy) / 90);
    S.tNear = near;
    if (near > 0) {
      S.tDx = clamp((px - (r.left + r.width / 2)) / (r.width / 2), -1, 1) * 1.6 * near;
    } else {
      S.tDx = 0;
    }
    wake();
  }

  addEventListener('pointermove', (e) => {
    px = e.clientX; py = e.clientY; pointerKind = e.pointerType || 'mouse';
    pointerUpdate();
  }, { passive: true });

  /* Leaving the window: pointerout with nowhere to go. pointerleave on the
     document is not something browsers fire reliably. */
  document.addEventListener('pointerout', (e) => {
    if (!e.relatedTarget) { px = py = -1e4; pointerUpdate(); }
  });

  bar.addEventListener('pointerover', (e) => {
    if (e.pointerType !== 'mouse') return;
    const it = itemFor(e.target);
    if (it && it !== hovered) { hovered = it; retarget(); }
  });
  bar.addEventListener('pointerleave', () => { if (hovered) { hovered = null; retarget(); } });

  // Keyboard focus moves the pocket the same way a pointer does.
  bar.addEventListener('focusin', (e) => {
    const it = itemFor(e.target);
    if (it) { hovered = it; retarget(); }
  });
  bar.addEventListener('focusout', (e) => {
    if (!bar.contains(e.relatedTarget)) { hovered = null; retarget(); }
  });

  /* Press. The item and the pocket compress about 2% and the bar's shadow
     tightens, then all of it springs back. On a phone there is no hover and no current section in
     the dock, so this is also what brings the pocket up at all: it swells
     under the thumb and goes when the thumb lifts. */
  const release = () => {
    S.tPress = 0;
    bar.classList.remove('lg-bar-pressed');
    if (pressedItem) { pressedItem = null; retarget(); }
    wake();
  };
  bar.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    S.tPress = 1;
    bar.classList.add('lg-bar-pressed');
    const it = itemFor(e.target);
    if (it && e.pointerType !== 'mouse') { pressedItem = it; retarget(); }
    wake();
  }, { passive: true });
  ['pointerup', 'pointercancel'].forEach((t) => addEventListener(t, release, { passive: true }));
  addEventListener('blur', release);

  // The scroll spy decides the current section; the pocket follows it.
  /* Only is-current matters here. The pocket toggles is-pocketed on these
     same links, and reacting to that would just be the pocket reacting to
     itself. */
  const mo = new MutationObserver((recs) => {
    if (recs.some((r) => (r.oldValue || '').includes('is-current') !== r.target.classList.contains('is-current'))) retarget();
  });
  $$('.nav-links a', bar).forEach((a) => mo.observe(a, { attributes: true, attributeFilter: ['class'], attributeOldValue: true }));

  // The environment changes as the page moves under the glass.
  addEventListener('scroll', queueEnv, { passive: true });
  new MutationObserver(queueEnv).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  const relayout = () => {
    measure();
    retarget();
    queueEnv();
  };

  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(relayout, 140); }, { passive: true });
  document.fonts?.ready.then(relayout).catch(() => {});
  relayout();
})();

/* --- Menus grow out of what opened them --------------------------------------
   The command palette and the phone menu do not appear on their own. They
   start as the glass of the control that opened them, stretch out toward
   where they are going, and only show their contents once there is enough
   surface for them. Closing runs the other way and merges back into the
   control, so what you are looking at is one object changing shape rather
   than a new thing arriving.

   The shape is drawn with a clip on the menu itself, shifted with translate
   so the visible part starts exactly over the control. No scaling, so the
   text and the radii are never stretched, and the menu's own glass and
   blur are what grow, since clip-path clips the backdrop as well.

   Both the palette and the sheet are opened and closed by code elsewhere.
   Rather than rewiring that, this watches for the state change and takes
   over the motion: the palette's showModal and close are wrapped on the
   instance, and Escape's native cancel is intercepted, because it would
   otherwise close the dialog without going through close() at all. */
(function liquidMorph() {
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const radiusOf = (el) => parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
  /* DOMRect has width and height, not w and h. Reading .w off one gave
     undefined, every coordinate came out NaN, and the browser quietly threw
     away the translate and the clip, leaving only the fade. */
  const box = (el) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
  const visible = (el) => el && el.offsetWidth > 0 && getComputedStyle(el).display !== 'none';

  /* content is what fades in once there is room: one element, or a list,
     but never the surface itself, or the two fades land on the same
     element and the second overwrites the first. */
  function createMorph(el, content, { kOpen = 300, cOpen = 31, kClose = 460, cClose = 40 } = {}) {
    let p = 0, v = 0, target = 0, raf = 0, last = 0;
    let from = null, to = null, fromR = 20, toR = 26, done = null, k = kOpen, c = cOpen;
    const parts = Array.isArray(content) ? content : [content];
    const setContent = (o) => parts.forEach((n) => { n.style.opacity = o; });

    const clear = () => {
      el.style.translate = '';
      el.style.clipPath = '';
      el.style.opacity = '';
      setContent('');
      el.classList.remove('lg-morph');
    };

    const render = () => {
      const q = p;
      const w = lerp(from.w, to.w, q), h = lerp(from.h, to.h, q);
      const cx = lerp(from.x + from.w / 2, to.x + to.w / 2, q);
      const cy = lerp(from.y + from.h / 2, to.y + to.h / 2, q);
      const dx = cx - (to.x + to.w / 2), dy = cy - (to.y + to.h / 2);
      const ix = (to.w - w) / 2, iy = (to.h - h) / 2;
      const r = lerp(fromR, toR, clamp(q, 0, 1));
      el.style.translate = `${dx.toFixed(2)}px ${dy.toFixed(2)}px`;
      el.style.clipPath = `inset(${iy.toFixed(2)}px ${ix.toFixed(2)}px ${iy.toFixed(2)}px ${ix.toFixed(2)}px round ${r.toFixed(2)}px)`;
      // Contents only once there is room for them; the glass itself never pops.
      setContent(smooth(0.55, 0.95, q).toFixed(3));
      el.style.opacity = smooth(0, 0.12, q).toFixed(3);
    };

    const step = (now) => {
      // Same clock rule as the bar: baseline from the first frame, never negative.
      if (last < 0) last = now;
      const dt = clamp((now - last) / 1000, 0, 1 / 30);
      last = now;
      const a = -k * (p - target) - c * v;
      v += a * dt; p += v * dt;
      render();
      if (Math.abs(p - target) < 0.002 && Math.abs(v) < 0.01) {
        p = target; v = 0; raf = 0;
        const cb = done; done = null;
        if (target === 1) clear();
        cb?.();
        return;
      }
      raf = requestAnimationFrame(step);
    };

    const run = (t, cb) => {
      target = t; done = cb;
      k = t ? kOpen : kClose; c = t ? cOpen : cClose;
      if (!raf) { last = -1; raf = requestAnimationFrame(step); }
    };

    return {
      open(src) {
        cancelAnimationFrame(raf); raf = 0;
        clear();
        to = box(el);
        toR = radiusOf(el);
        if (!src || prefersReduced()) {
          /* No control to grow from, or motion reduced: a short fade in
             place, which keeps the glass and loses the travel. */
          el.style.opacity = '0';
          requestAnimationFrame(() => { el.style.transition = 'opacity .16s ease'; el.style.opacity = ''; });
          setTimeout(() => { el.style.transition = ''; }, 200);
          return;
        }
        from = box(src);
        fromR = Math.min(radiusOf(src), from.w / 2, from.h / 2);
        el.classList.add('lg-morph');
        p = 0; v = 0;
        render();
        run(1);
      },
      close(src, cb) {
        if (!src || prefersReduced() || !to) {
          el.style.transition = 'opacity .14s ease';
          el.style.opacity = '0';
          setTimeout(() => { el.style.transition = ''; clear(); cb?.(); }, 150);
          return;
        }
        from = box(src);
        fromR = Math.min(radiusOf(src), from.w / 2, from.h / 2);
        if (!el.classList.contains('lg-morph')) { el.classList.add('lg-morph'); p = 1; v = 0; }
        run(0, () => { clear(); cb?.(); });
      },
    };
  }

  /* ---- The palette ---- */
  const dialog = $('#palette');
  const inner = dialog?.querySelector('.palette-inner');
  if (dialog && inner && dialog.showModal) {
    const morph = createMorph(dialog, inner);
    let source = null;

    // Whichever search control opened it; ⌘K has no pointer, so it uses
    // whichever of the two is on screen.
    document.addEventListener('pointerdown', (e) => {
      const b = e.target.closest?.('#paletteBtn, #paletteBtnMobile');
      if (b) source = b;
    }, { capture: true, passive: true });
    const pickSource = () => {
      if (visible(source)) return source;
      return [$('#paletteBtnMobile'), $('#paletteBtn')].find(visible) || null;
    };

    const nativeShow = dialog.showModal.bind(dialog);
    const nativeClose = dialog.close.bind(dialog);
    let closing = false;

    dialog.showModal = () => {
      nativeShow();
      closing = false;
      morph.open(pickSource());
    };

    dialog.close = (...args) => {
      if (!dialog.open || closing) return;
      closing = true;
      morph.close(pickSource(), () => { closing = false; source = null; nativeClose(...args); });
    };

    dialog.addEventListener('cancel', (e) => { e.preventDefault(); dialog.close(); });
  }

  /* ---- The phone menu ----
     Opened and closed by the navigation block, which toggles .is-open and
     then sets hidden 380ms after closing. The close spring is stiffer than
     the open one so it is finished well inside that. */
  const sheet = $('#mobileSheet');
  const toggle = $('#navToggle');
  if (sheet && toggle) {
    const morph = createMorph(sheet, [...sheet.children], { kOpen: 300, cOpen: 31, kClose: 520, cClose: 43 });
    let wasOpen = sheet.classList.contains('is-open');

    new MutationObserver(() => {
      const isOpen = sheet.classList.contains('is-open');
      if (isOpen === wasOpen) return;
      wasOpen = isOpen;
      if (isOpen) {
        // Its own slide is replaced, so hold it where it will end up.
        sheet.style.transition = 'none';
        sheet.style.transform = 'none';
        morph.open(visible(toggle) ? toggle : null);
      } else {
        morph.close(visible(toggle) ? toggle : null, () => {
          sheet.style.transform = '';
          sheet.style.transition = '';
        });
      }
    }).observe(sheet, { attributes: true, attributeFilter: ['class'] });
  }
})();

/* --- Press, everywhere else ----------------------------------------------------
   The rest of the controls respond the same way, simpler: compress a
   percent and a half, a light under the pointer, spring back. CSS does the
   springing; this says where and when. The bar handles its own. */
(function liquidPress() {
  const SEL = [
    '.btn', '.filter-chip', '.pills button', '.contact a', '.card-repo',
    '.chip', '.chip-clear', '.carousel-ctrl .icon-btn', '.sheet-cta', '.lb-btn', '.st-btn', '.st-close',
    'header.nav .icon-btn', 'header.nav a.cta', 'header.nav .brand', '.dock-fab .icon-btn',
  ].join(',');

  $$(SEL).forEach((el) => el.classList.add('lg-press'));

  let active = null;
  const release = () => {
    if (!active) return;
    active.classList.remove('lg-pressed');
    active = null;
  };

  const press = (el, cx, cy) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--lg-px', `${clamp(((cx - r.left) / r.width) * 100, 0, 100).toFixed(1)}%`);
    el.style.setProperty('--lg-py', `${clamp(((cy - r.top) / r.height) * 100, 0, 100).toFixed(1)}%`);
    release();
    active = el;
    el.classList.add('lg-pressed');
  };

  document.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    const el = e.target.closest?.(SEL);
    if (el) press(el, e.clientX, e.clientY);
  }, { passive: true });

  ['pointerup', 'pointercancel', 'dragstart'].forEach((t) => addEventListener(t, release, { passive: true }));
  addEventListener('blur', release);

  document.addEventListener('keydown', (e) => {
    if (e.repeat || (e.key !== 'Enter' && e.key !== ' ')) return;
    const el = document.activeElement?.closest?.(SEL);
    if (!el) return;
    const r = el.getBoundingClientRect();
    press(el, r.left + r.width / 2, r.top + r.height / 2);
  });
  document.addEventListener('keyup', (e) => { if (e.key === 'Enter' || e.key === ' ') release(); });
})();

/* ==========================================================================
   Off the Clock: rolls of film
   One frame of each roll is "on": it is highlighted and its note shows in
   the caption under the strip. Hovering or focusing a frame puts it on;
   on a touch screen, so does swiping the strip, which settles on the frame
   nearest its left edge. Clicking a frame opens it in the viewer.
   ========================================================================== */
(function filmRolls() {
  $$('.roll').forEach((roll) => {
    const frames = $$('.film-frame', roll);
    const notes = $$('.film-note', roll);
    const scroller = $('.film-scroll', roll);
    if (!frames.length) return;
    let on = -1;
    const set = (i) => {
      if (i === on) return;
      on = i;
      frames.forEach((f, k) => f.classList.toggle('is-on', k === i));
      notes.forEach((n, k) => n.classList.toggle('is-on', k === i));
    };
    set(0);
    frames.forEach((f, i) => {
      f.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') set(i); });
      f.addEventListener('focus', () => set(i));
    });
    if (!scroller) return;
    let t = 0;
    scroller.addEventListener('scroll', () => {
      if (!coarsePointer.matches) return;
      cancelAnimationFrame(t);
      t = requestAnimationFrame(() => {
        const left = scroller.getBoundingClientRect().left + 14;
        let best = 0, dist = Infinity;
        frames.forEach((f, k) => {
          const d = Math.abs(f.getBoundingClientRect().left - left);
          if (d < dist) { dist = d; best = k; }
        });
        // At the very end of the strip, the last frame is the one in view.
        if (scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 4) best = frames.length - 1;
        set(best);
      });
    }, { passive: true });
  });
})();

/* ==========================================================================
   Off the Clock: stories
   Three circles, like story highlights. Opening one plays its steps in a
   full screen viewer, one photo and one short note at a time, with a bar
   per step across the top that fills while it plays. Tap the right side
   (or press the right arrow) for the next step, the left side for the
   previous one, hold to pause. At the end of one story the next begins;
   after the last, the viewer closes. A circle you have watched turns
   grey. With reduced motion nothing plays on its own.
   ========================================================================== */
(function stories() {
  const dlg = $('#storyView');
  const hls = $$('.hl');
  if (!dlg || !hls.length || !dlg.showModal) return;

  /* The circles notice the cursor: each one leans toward it (up to 5px)
     and swells slightly as it comes within reach, its ring turning to
     face it, then eases back when it leaves. Eased every frame and
     stopped once everything has settled. */
  if (!coarsePointer.matches && !prefersReduced()) {
    const rings = hls.map((hl) => $('.hl-ring', hl));
    const st = rings.map(() => ({ dx: 0, dy: 0, k: 1, tx: 0, ty: 0, tk: 1, spin: 210 }));
    let mx = -1e4, my = -1e4, loop = 0;
    const frame = () => {
      loop = 0;
      let moving = false;
      rings.forEach((r, i) => {
        const b = r.getBoundingClientRect();
        const cx = b.left + b.width / 2 - st[i].dx, cy = b.top + b.height / 2 - st[i].dy;
        const vx = mx - cx, vy = my - cy, d = Math.hypot(vx, vy);
        const reach = 180, pull = Math.max(0, 1 - d / reach);
        const s = st[i];
        s.tx = d ? (vx / d) * 5 * pull : 0;
        s.ty = d ? (vy / d) * 5 * pull : 0;
        s.tk = 1 + 0.025 * pull;
        if (pull > 0) s.spin = (Math.atan2(vy, vx) * 180) / Math.PI + 90;
        s.dx += (s.tx - s.dx) * 0.1; s.dy += (s.ty - s.dy) * 0.1; s.k += (s.tk - s.k) * 0.1;
        if (Math.abs(s.tx - s.dx) > 0.05 || Math.abs(s.ty - s.dy) > 0.05 || Math.abs(s.tk - s.k) > 0.001) moving = true;
        r.style.setProperty('--dx', s.dx.toFixed(2));
        r.style.setProperty('--dy', s.dy.toFixed(2));
        r.style.setProperty('--k', s.k.toFixed(4));
        r.style.setProperty('--spin', `${s.spin.toFixed(1)}deg`);
      });
      if (moving) loop = requestAnimationFrame(frame);
    };
    const wake = () => { if (!loop) loop = requestAnimationFrame(frame); };
    const sec = $('#offclock');
    sec?.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; wake(); }, { passive: true });
    sec?.addEventListener('pointerleave', () => { mx = my = -1e4; wake(); });
  }

  /* The opening step carries the intro as well, so it stays up a touch
     longer; the rest move a touch quicker. */
  const FIRST_MS = 8000, STEP_MS = 6500;
  const stepMs = () => (step === 0 ? FIRST_MS : STEP_MS);
  const data = hls.map((hl) => {
    const box = $('.hl-data', hl);
    return {
      title: $('h3', box).textContent,
      intro: $('p', box).textContent,
      steps: $$('li', box).map((li) => ({
        src: li.dataset.src, srcset: li.dataset.srcset, alt: li.dataset.alt,
        lead: $('strong', li).textContent,
        body: li.textContent.replace($('strong', li).textContent, '').trim(),
      })),
    };
  });

  const bars = $('.st-bars', dlg), img = $('.st-img', dlg), title = $('.st-title', dlg);
  const intro = $('.st-intro', dlg), nEl = $('.st-n', dlg), lead = $('.st-lead', dlg), body = $('.st-body', dlg);
  let story = 0, step = 0, start = 0, elapsed = 0, raf = 0, paused = false;
  const auto = () => !prefersReduced();

  const fill = (k) => $$('i', bars).forEach((b, j) => {
    b.style.transform = `scaleX(${j < step ? 1 : j > step ? 0 : k})`;
  });

  const blur = $('.st-blur', dlg), count = $('.st-count', dlg), pauseBtn = $('.st-pause', dlg);
  /* Paused from the button or the space bar, as opposed to held: a hold
     ends when the finger lifts, a pause stays until it is undone. */
  let userPaused = false;
  const setPaused = (on) => {
    userPaused = paused = on;
    dlg.classList.toggle('is-paused', on);
    pauseBtn.setAttribute('aria-label', on ? 'Play' : 'Pause');
  };
  const tick = (now) => {
    if (!paused) elapsed += now - start;
    start = now;
    const k = Math.min(1, elapsed / stepMs());
    fill(k);
    if (k >= 1) { next(); return; }
    raf = requestAnimationFrame(tick);
  };
  const play = () => {
    cancelAnimationFrame(raf);
    elapsed = 0;
    fill(0);
    if (!auto()) { fill(1); $$('i', bars).forEach((b, j) => { b.style.transform = `scaleX(${j <= step ? 1 : 0})`; }); return; }
    start = performance.now();
    raf = requestAnimationFrame(tick);
  };

  const show = () => {
    const d = data[story], st = d.steps[step];
    if (bars.children.length !== d.steps.length || bars.dataset.story !== String(story)) {
      bars.replaceChildren(...d.steps.map(() => { const s = document.createElement('span'); s.append(document.createElement('i')); return s; }));
      bars.dataset.story = String(story);
    }
    title.textContent = d.title;
    img.srcset = st.srcset;
    img.sizes = SIZES;
    img.src = st.src;
    img.alt = st.alt;
    // The same photo, blurred, fills whatever the frame has left around it.
    // Same srcset and sizes as the photo itself, so both resolve to the one
    // file and change together instead of the blur trailing behind.
    blur.srcset = st.srcset;
    blur.sizes = img.sizes;
    blur.src = st.src;
    count.textContent = `${step + 1} / ${d.steps.length}`;
    intro.textContent = step === 0 ? d.intro : '';
    intro.hidden = step !== 0;
    nEl.textContent = String(step + 1).padStart(2, '0');
    lead.textContent = st.lead;
    body.textContent = ' ' + st.body;
    // Warm the next photo so it is there when the step changes.
    const nx = d.steps[step + 1];
    if (nx) warm(nx);
    play();
  };

  /* Photos are fetched and decoded before they are needed, at exactly the
     size the viewer draws them (same srcset and sizes, so the viewer's own
     request is a cache hit). Opening a story used to start its first photo
     only then, and a phone showed the empty black frame until it arrived.
     Now the first photo of every story is warmed as Off the Clock comes
     near, a story is warmed the moment a finger touches its circle, and
     each step warms the next. The handles are kept so nothing is dropped
     before it lands. */
  const SIZES = 'min(92vw, 560px)';
  const warmed = new Map();
  function warm(st) {
    if (!st || warmed.has(st.src)) return;
    const pre = new Image();
    pre.decoding = 'async';
    pre.srcset = st.srcset;
    pre.sizes = SIZES;
    pre.src = st.src;
    pre.decode?.().catch(() => {});
    warmed.set(st.src, pre);
  }
  const warmStory = (i, n = 1) => data[i]?.steps.slice(0, n).forEach(warm);
  const section = hls[0]?.closest('section');
  if (section && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      data.forEach((_, i) => warmStory(i));
    }, { rootMargin: '900px 0px' });
    io.observe(section);
  } else {
    data.forEach((_, i) => warmStory(i));
  }
  hls.forEach((hl, i) => $('.hl-btn', hl).addEventListener('pointerdown', () => warmStory(i, 2), { passive: true }));

  const seen = (i) => hls[i].classList.add('is-seen');
  function next() {
    if (step < data[story].steps.length - 1) { step++; show(); return; }
    seen(story);
    if (story < data.length - 1) { story++; step = 0; show(); return; }
    dlg.close();
  }
  function prev() {
    if (step > 0) { step--; show(); return; }
    if (story > 0) { story--; step = data[story].steps.length - 1; show(); return; }
    show();
  }

  hls.forEach((hl, i) => $('.hl-btn', hl).addEventListener('click', () => {
    story = i; step = 0; setPaused(false);
    dlg.showModal();
    show();
  }));
  $('.st-next', dlg).addEventListener('click', next);
  $('.st-prev', dlg).addEventListener('click', prev);
  $('.st-fwd', dlg).addEventListener('click', next);
  $('.st-back', dlg).addEventListener('click', prev);
  pauseBtn.addEventListener('click', () => setPaused(!userPaused));
  $('.st-close', dlg).addEventListener('click', () => dlg.close());
  dlg.addEventListener('close', () => { cancelAnimationFrame(raf); seen(story); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    if (e.key === ' ' && !e.target.closest('button')) { e.preventDefault(); setPaused(!userPaused); }
  });
  // Hold anywhere to pause, like a story: lifting the finger carries on.
  // The buttons are left out so a press on one is just a press.
  const hold = (on) => { paused = on || userPaused; dlg.classList.toggle('is-paused', paused); };
  const frame = $('.st-frame', dlg);
  const isButton = (t) => t.closest('.st-controls, .st-close');
  let holdT = 0, held = false;
  frame.addEventListener('pointerdown', (e) => {
    if (isButton(e.target)) return;
    held = false;
    holdT = setTimeout(() => { held = true; hold(true); }, 220);
  });
  const up = () => { clearTimeout(holdT); if (held) hold(false); };
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((t) => frame.addEventListener(t, up));
  // A hold should not also count as a tap, and should not raise the
  // long press menu or select the text underneath.
  frame.addEventListener('click', (e) => { if (held) { e.stopImmediatePropagation(); e.preventDefault(); held = false; } }, true);
  frame.addEventListener('contextmenu', (e) => { if (!isButton(e.target)) e.preventDefault(); });
  /* Swipe down to close on phones, the way a story does: the viewer
     follows the finger down, shrinking a little and letting the page show
     through, then either carries on off the bottom (pulled far enough, or
     flicked) or springs back into place. */
  let y0 = null, x0 = 0, t0 = 0, dragging = false, lastY = 0, lastT = 0, vel = 0;
  const setPull = (dy) => {
    const h = innerHeight, k = Math.min(1, Math.max(0, dy) / h);
    dlg.style.transform = `translate3d(0, ${Math.max(0, dy)}px, 0) scale(${1 - k * 0.14})`;
    dlg.style.borderRadius = `${Math.min(28, k * 120)}px`;
    dlg.style.setProperty('--pull', k.toFixed(3));
  };
  const clearPull = () => {
    dlg.style.transition = '';
    dlg.style.transform = '';
    dlg.style.borderRadius = '';
    dlg.style.removeProperty('--pull');
  };
  dlg.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1 || isButton(e.target)) { y0 = null; return; }
    y0 = lastY = e.touches[0].clientY; x0 = e.touches[0].clientX;
    t0 = lastT = performance.now(); dragging = false; vel = 0;
    dlg.style.transition = 'none';
  }, { passive: true });
  dlg.addEventListener('touchmove', (e) => {
    if (y0 === null) return;
    const y = e.touches[0].clientY, dy = y - y0, dx = e.touches[0].clientX - x0;
    if (!dragging) {
      if (dy < 8 || Math.abs(dx) > dy) return;
      // Committed to a pull: freeze the story and make sure lifting the
      // finger is not read as a tap.
      dragging = true; held = true; clearTimeout(holdT); hold(true);
    }
    const now = performance.now();
    vel = (y - lastY) / Math.max(1, now - lastT);
    lastY = y; lastT = now;
    setPull(dy);
  }, { passive: true });
  const endPull = () => {
    if (y0 === null) return;
    const dy = lastY - y0;
    y0 = null;
    if (!dragging) { dlg.style.transition = ''; return; }
    dragging = false;
    if (dy > innerHeight * 0.22 || (vel > 0.6 && dy > 40)) {
      // Carry on down at about the speed it was going, then close.
      const ms = Math.round(Math.min(340, Math.max(180, (innerHeight - dy) / Math.max(vel, 1.4))));
      dlg.style.transition = `transform ${ms}ms cubic-bezier(.2, .7, .3, 1), opacity ${ms}ms ease-out, border-radius ${ms}ms`;
      dlg.style.opacity = '0';
      setPull(innerHeight);
      setTimeout(() => { dlg.close(); clearPull(); dlg.style.opacity = ''; }, ms);
    } else {
      dlg.style.transition = 'transform .42s cubic-bezier(.22, 1.25, .36, 1), border-radius .42s ease';
      setPull(0);
      dlg.style.setProperty('--pull', '0');
      setTimeout(clearPull, 440);
      hold(false);
    }
  };
  dlg.addEventListener('touchend', endPull, { passive: true });
  dlg.addEventListener('touchcancel', endPull, { passive: true });
})();

/* ==========================================================================
   Console greeting for the curious
   ========================================================================== */
console.log(
  '%cAjay Sommi%c\nPoking around the console? Try pressing ~ on the page for a terminal,\nor ⌘K for the command palette.\n\nmailto:ajaysommi7@gmail.com',
  'font-size:20px;font-weight:700;color:#71FFE9',
  'color:#9fb2c4;font-family:monospace;line-height:1.6'
);
