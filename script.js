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

  if (document.readyState === 'complete') finish();
  else window.addEventListener('load', finish, { once: true });

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

  // Sticky shadow
  const onScroll = () => nav?.classList.toggle('is-stuck', window.scrollY > 12);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });
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
  let ticking = false;

  const update = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    fill.style.height = `${clamp(max > 0 ? (scrollY / max) * 100 : 0, 0, 100)}%`;

    const line = scrollY + innerHeight * 0.32;
    let active = 0;
    sections.forEach(([id], i) => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top + scrollY <= line) active = i;
    });

    dots.forEach((d, i) => d.classList.toggle('is-active', i === active));
    const activeId = sections[active]?.[0];
    navLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === `#${activeId}`));
  };

  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();
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
    const queue = Array.from(finalText).map((ch, i) => ({
      ch,
      start: Math.floor(i * 1.4),
      end: Math.floor(i * 1.4) + 14 + Math.floor(Math.random() * 12),
    }));

    const tick = () => {
      let output = '';
      let complete = 0;
      for (const item of queue) {
        if (frame >= item.end) { output += item.ch; complete++; }
        else if (frame >= item.start && item.ch.trim()) {
          output += glyphs[Math.floor(Math.random() * glyphs.length)];
        } else if (frame >= item.start) { output += item.ch; }
        else { output += ' '; }
      }
      heading.textContent = output;
      frame++;
      if (complete < queue.length) requestAnimationFrame(tick);
      else heading.textContent = finalText;
    };
    // Start after the loader clears so the effect is actually seen.
    setTimeout(() => requestAnimationFrame(tick), 1300);
  }

  const typed = $('#typedRole');
  if (!typed) return;

  const roles = [
    'software engineer who adapts to the problem',
    'C#/.NET · Python · SQL · React · Apex',
    'shipping things that hold up in production',
    'B.S. Computer Science, University of Florida',
  ];

  /* Reserve exactly the height the longest role needs, measured rather than
     assumed: a fixed two line reservation left a visible blank line between
     this and the paragraph below, and a one line reservation would make the
     paragraph jump on any width where a role wraps. */
  const line = typed.parentElement;
  const reserve = () => {
    const before = typed.textContent;
    line.style.minHeight = '0px';
    let tallest = 0;
    for (const role of roles) {
      typed.textContent = role;
      tallest = Math.max(tallest, line.getBoundingClientRect().height);
    }
    typed.textContent = before;
    line.style.minHeight = `${Math.ceil(tallest)}px`;
  };

  reserve();
  addEventListener('resize', reserve, { passive: true });
  if (document.fonts?.ready) document.fonts.ready.then(reserve).catch(() => {});

  if (prefersReduced()) { typed.textContent = roles[0]; return; }

  let r = 0, i = 0, deleting = false;
  const loop = () => {
    const text = roles[r];
    i += deleting ? -1 : 1;
    typed.textContent = text.slice(0, i);

    let delay = deleting ? 26 : 52;
    if (!deleting && i === text.length) { delay = 1900; deleting = true; }
    else if (deleting && i === 0) { deleting = false; r = (r + 1) % roles.length; delay = 340; }
    setTimeout(loop, delay);
  };
  setTimeout(loop, 1800);
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
  const STEP_MS = 16;        // drift tick, roughly a frame: 20fps read as steppy
  let setW = 0;              // width of one full set, including the trailing gap
  let paused = false;        // explicit pause button
  let idle = true;           // nobody is touching it
  let dragging = false;
  let visible = true;        // section is on/near screen
  let driftTimer = 0;

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

  const tick = () => {
    const now = performance.now();
    /* Cap the delta so a stall does not teleport the strip. The cap is loose
       enough that ordinary throttling (a busy main thread mid scroll) is
       still made up for: too tight a cap turns every slow tick into lost
       distance, which is the stutter it was meant to prevent. A backgrounded
       tab is handled by pausing outright rather than by this cap. */
    const dt = Math.min((now - lastT) / 1000, 0.25);
    lastT = now;

    carry += SPEED * dt;
    const step = Math.floor(carry);
    if (step >= 1) {
      carry -= step;
      viewport.scrollLeft += step;
    }
    wrap();
  };

  const syncDrift = () => {
    const should = idle && !paused && !dragging && visible &&
                   document.visibilityState === 'visible' && !prefersReduced();
    if (should && !driftTimer) {
      lastT = performance.now();
      carry = 0;
      driftTimer = setInterval(tick, STEP_MS);
    } else if (!should && driftTimer) {
      clearInterval(driftTimer);
      driftTimer = 0;
    }
  };

  /* ---------- Clone enough sets that the strip can never run out ----------
     The old build cloned exactly once and animated a CSS transform, so
     scrolling by hand eventually hit the end of the track and stopped dead.
     Now the strip is a real infinite scroller: scrollLeft is wrapped by one
     set width, which is invisible because the content repeats exactly. */
  const addSet = () => {
    originals.forEach((node) => {
      const copy = node.cloneNode(true);
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

    const needed = Math.max(3, Math.ceil((w * 2) / setW) + 2);
    while (track.children.length / originals.length < needed) addSet();

    if (!parked) {
      // Park in the middle copy so there is room to scroll both directions.
      viewport.scrollLeft = setW;
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

  /* Keep scrollLeft inside one set width of the middle copy. Because every
     set is identical, the jump is invisible. */
  const wrap = () => {
    if (setW <= 0) return;
    if (viewport.scrollLeft >= setW * 2) viewport.scrollLeft -= setW;
    else if (viewport.scrollLeft < setW * 0.5) viewport.scrollLeft += setW;
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

  viewport.addEventListener('scroll', () => { wrap(); }, { passive: true });
  viewport.addEventListener('touchstart', () => bumpIdle(2400), { passive: true });
  viewport.addEventListener('touchend', () => bumpIdle(2400), { passive: true });

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
    viewport.scrollLeft = startScroll - dx;
    wrap();
    // Re-base so wrapping mid-drag does not yank the strip.
    startScroll = viewport.scrollLeft + dx;
  });

  const endDrag = (e) => {
    if (!armed) return;
    armed = false;
    if (!dragging) { bumpIdle(1200); return; }  // a click, not a drag
    dragging = false;
    viewport.classList.remove('is-dragging');
    try { viewport.releasePointerCapture(e.pointerId); } catch {}

    let v = velocity * 1.4;
    const glide = () => {
      if (Math.abs(v) < 0.4) { bumpIdle(400); return; }
      viewport.scrollLeft -= v;
      wrap();
      v *= 0.94;
      glideRaf = requestAnimationFrame(glide);
    };
    if (!prefersReduced() && Math.abs(v) > 1) glideRaf = requestAnimationFrame(glide);
    else bumpIdle(1200);
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
      viewport.scrollLeft = from + dist * eased;
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
    viewport.scrollLeft += e.deltaY;
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

/* ==========================================================================
   Shared scroll engine
   One rAF-throttled scroll listener drives every scroll-linked effect, so
   adding effects never adds listeners.
   ========================================================================== */
const onScrollFrame = (() => {
  const jobs = [];
  let ticking = false;

  const run = () => {
    ticking = false;
    for (const job of jobs) job();
  };

  const request = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(run); }
  };

  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request, { passive: true });

  return (job) => {
    jobs.push(job);
    job();
    return request;
  };
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

  if (prefersReduced()) {
    // No pinning games: show everything as a plain list.
    cards.forEach((c) => c.classList.add('is-active'));
    nodes.forEach((n) => { n.dataset.state = 'past'; });
    if (live && traceLen) live.style.strokeDashoffset = '0';
  } else {
    setActive(0);
    onScrollFrame(update);
  }
})();

/* ==========================================================================
   Journey photos
   The panel is a fixed height sized for the wordiest role, so shorter roles
   leave a gap underneath and the photos expand into it. The height is set
   here rather than left to flexbox because each photo sizes its own width
   from its own aspect ratio, and that only works against a height the
   browser already knows. Every role that has photos keeps them at every
   viewport: the height has a floor, and a wordy role gives up a little of
   its own slack rather than losing the photos.
   ========================================================================== */
(function journeyPhotos() {
  if (!$('.jcard .jc-media')) return;

  // Below this the photos stop reading as photos. The smallest phones get a
  // lower floor because the panel there has almost nothing to spare.
  const minH = () => (innerWidth <= 365 ? 74 : 88);
  const MAX_H = 300;  // above this they start to dwarf the text

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

  // Re-queried each pass rather than captured once, so adding a photo to a
  // card later needs no change here.
  const fit = () => {
    const MIN_H = minH();
    $$('.jcard .jc-media').forEach((fig) => {
      const card = fig.closest('.jcard');
      if (!card) return;

      fig.hidden = false;
      // Measure the text, then hand the photos whatever it did not use.
      const text = contentHeight(card, fig);
      const figStyle = getComputedStyle(fig);
      const gap = parseFloat(figStyle.marginTop) || 0;
      // The 4px is slack against sub pixel rounding in the text measurement:
      // without it a card can end up one or two pixels into a scrollbar.
      const spare = card.clientHeight - text - gap - 4;
      /* Take the leftover space as it is. Where there is barely any, the
         photos still get a floor so they cannot vanish, but the floor is low
         enough that the card does not grow a scrollbar to honour it. */
      const ideal = Math.min(MAX_H, spare);
      let h = ideal < MIN_H ? Math.max(36, ideal) : ideal;

      /* A tall row is a wide row, so on a narrow card four uncropped photos
         can only sit side by side by shrinking to thumbnails. Show as many as
         hold a usable height instead and leave the remainder to the lightbox,
         which still opens the whole set. */
      const shots = $$('.jc-shot', fig);
      const aspectOf = (el) => {
        const im = $('img', el);
        const w = Number(im?.getAttribute('width'));
        const ih = Number(im?.getAttribute('height'));
        return w > 0 && ih > 0 ? w / ih : 1;
      };
      const gapX = parseFloat(figStyle.columnGap) || 0;
      const room = fig.clientWidth;
      const GOOD = 92;  // the height below which a photo stops reading as one

      shots.forEach((el) => { el.hidden = false; });
      let shown = shots.length;
      while (shown > 1 && room > 0) {
        const sum = shots.slice(0, shown).reduce((a2, el) => a2 + aspectOf(el), 0);
        if ((room - gapX * (shown - 1)) / sum >= Math.min(GOOD, h)) break;
        shown -= 1;
      }
      for (let i = shown; i < shots.length; i += 1) shots[i].hidden = true;

      /* Height is the only thing being decided: each photo is then as wide as
         its own shape makes it. Nothing cropped, nothing stretched, nothing
         stacked. */
      h = Math.max(1, Math.floor(h));
      fig.style.height = `${h}px`;

      /* Then bring the row in until it fits the card. A tall row is a wide
         row, so the roles carrying three or four photos were overrunning the
         edge and leaving the last one half off the card until you scrolled
         sideways to find it. Shrinking the height is what makes them all fit
         at once. Measured rather than calculated: each photo's border adds a
         couple of pixels the aspect ratio does not know about. */
      for (let pass = 0; pass < 3; pass += 1) {
        const slack = fig.scrollWidth - fig.clientWidth;
        if (slack <= 1 || fig.scrollWidth <= 0) break;
        h = Math.max(1, Math.floor(h * (fig.clientWidth / fig.scrollWidth)));
        fig.style.height = `${h}px`;
      }

      markScroll(fig);
    });
  };

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

  /* Each photo becomes a real button so it is reachable by keyboard and
     announced as something you can act on. Done here rather than in the
     markup so a photo added later needs no extra wrapper. */
  $$('.jcard .jc-media img').forEach((img) => {
    if (img.parentElement.classList.contains('jc-shot')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'jc-shot';
    btn.setAttribute('aria-label', `Open photo: ${img.alt || 'journey photo'}`);
    img.replaceWith(btn);
    btn.appendChild(img);
  });

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

  sizeTile();
  document.addEventListener('journey:active', sizeTile);
  addEventListener('resize', sizeTile, { passive: true });
  // Fonts landing late changes how tall the text is, which changes the room.
  if (document.fonts?.ready) document.fonts.ready.then(sizeTile).catch(() => {});
})();

/* ==========================================================================
   Photo viewer
   The strips are deliberately small, so every photo opens full size on click.
   A <dialog> carries the focus trap, the backdrop and Escape for free.
   ========================================================================== */
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
    const fig = shot.closest('.jc-media');
    group = $$('img', fig);
    const me = $('img', shot);
    show(Math.max(0, group.indexOf(me)));
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

  // Release the decoded image rather than holding the largest file in memory.
  dlg.addEventListener('close', () => { img.removeAttribute('src'); });
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
     [r, g, b, alpha, x%, y%, radius%], positions and radius relative to the
     viewport. The alphas are the whole discipline of this system: nothing
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
    education: {
      base: [46, 76, 150, .09],
      f: [[ 56,  96, 235, .21, 10, 30, 66],
          [ 48,  80, 210, .13, 22, 78, 56],
          [240, 150,  60, .18, 90, 32, 64],
          [235, 165,  90, .11, 82, 82, 54],
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
      base: [168, 190, 222, .09],
      f: [[120, 160, 235, .14, 10, 28, 66],
          [135, 170, 230, .10, 22, 78, 56],
          [245, 195, 140, .13, 90, 30, 64],
          [245, 210, 170, .10, 82, 82, 54],
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

    /* A chapter's share of the journey should not be decided by how much
       markup it happens to contain. Education is one card and about 300px
       tall; the path is four thousand. Left alone, the single most
       deliberate colour moment on the page would get a fifteenth of the
       scroll distance the section before it gets, and would be crossfading
       out before it had finished arriving.

       So any stage shorter than nine tenths of a screen borrows from its
       neighbours, and only from whatever they have above that same
       threshold, so nothing can be starved to feed something else. */
    const MIN = innerHeight * 0.9;
    const len = (x) => x.end - x.top;

    for (let i = 0; i < spans.length; i++) {
      const need = MIN - len(spans[i]);
      if (need <= 0) continue;

      const prev = spans[i - 1];
      const next = spans[i + 1];
      const prevSlack = prev ? Math.max(0, len(prev) - MIN) : 0;
      const nextSlack = next ? Math.max(0, len(next) - MIN) : 0;
      const slack = prevSlack + nextSlack;
      if (slack <= 0) continue;

      const take = Math.min(need, slack);
      if (prevSlack > 0) {
        const d = take * (prevSlack / slack);
        spans[i].top -= d;
        prev.end = spans[i].top;
      }
      if (nextSlack > 0) {
        const d = take * (nextSlack / slack);
        spans[i].end += d;
        next.top = spans[i].end;
      }
    }

    /* Half width of each crossfade, at the boundary that opens a stage. A
       third of a screen where there is room, and never more than nine
       twentieths of either neighbour, so a stage still reaches its own
       colour in the middle rather than being crossfaded out of existence
       from both sides at once. */
    spans.forEach((s, i) => {
      if (i === 0) { s.h = 0; return; }
      const prev = spans[i - 1];
      s.h = Math.max(1, Math.min(innerHeight * 0.34,
                                 (prev.end - prev.top) * 0.45,
                                 (s.end - s.top) * 0.45));
    });
  };

  /* --- paint --------------------------------------------------------------
     Colours are mixed premultiplied by their own alpha, so a field on its
     way out stops contributing hue as it goes rather than dragging the mix
     through its own colour on the way to nothing. Straight channel mixing
     sends a violet meeting an amber through grey, which is the one result
     neither section wanted. */
  const mixed = new Float64Array(5 * 7);
  const last = { key: '', theme: '' };

  function paint(force) {
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
    const line = scrollY + vh * 0.5;

    /* Weight per chapter: fully on inside its own span, crossfading across
       each boundary. The two ramps at a shared boundary are complements of
       one another, so the weights always add to one and nothing has to be
       normalised afterwards. */
    let progress = 0;
    let wsum = 0;
    const weights = [];

    for (let i = 0; i < spans.length; i++) {
      const s = spans[i];
      const up = i === 0 ? 1 : smootherstep((line - (s.top - s.h)) / (2 * s.h));
      const nxt = spans[i + 1];
      const down = nxt ? smootherstep((line - (nxt.top - nxt.h)) / (2 * nxt.h)) : 0;
      const w = up - down;
      weights.push(w);
      wsum += w;
      progress += w * i;
    }
    if (wsum <= 0) return;

    /* Quantised so the paint does not run on every frame of every scroll.
       Five hundred steps across the whole story is a change too small to
       see between one step and the next, and a few hundred repaints across
       an entire page rather than one per frame. */
    const theme = root.dataset.theme || '';
    const key = Math.round((progress / Math.max(spans.length - 1, 1)) * 500) + '|' + theme;
    if (!force && key === last.key + '|' + last.theme) return;
    last.key = String(Math.round((progress / Math.max(spans.length - 1, 1)) * 500));
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
      baseR += w * b[3] * b[0]; baseG += w * b[3] * b[1];
      baseB += w * b[3] * b[2]; baseA += w * b[3];

      for (let f = 0; f < 5; f++) {
        const v = preset.f[f];
        const o = f * 7;
        const wa = w * v[3];
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

    const toward = (c) => phosphor
      ? [Math.round(c[0] + (PHOSPHOR[0] - c[0]) * PHOSPHOR_PULL),
         Math.round(c[1] + (PHOSPHOR[1] - c[1]) * PHOSPHOR_PULL),
         Math.round(c[2] + (PHOSPHOR[2] - c[2]) * PHOSPHOR_PULL)]
      : c;

    if (baseA > 0.0005) {
      const c = toward([Math.round(baseR / baseA), Math.round(baseG / baseA), Math.round(baseB / baseA)]);
      style.setProperty('--amb-base',
        `radial-gradient(130% 92% at 50% 0%, rgba(${c[0]},${c[1]},${c[2]},${baseA.toFixed(3)}) 0%, transparent 72%)`);
    } else {
      style.setProperty('--amb-base', 'transparent');
    }

    for (let f = 0; f < 5; f++) {
      const o = f * 7;
      const a = mixed[o + 3];
      const n = f + 1;
      if (a > 0.0005) {
        const c = toward([Math.round(mixed[o] / a), Math.round(mixed[o + 1] / a), Math.round(mixed[o + 2] / a)]);
        style.setProperty(`--f${n}c`, `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`);
      } else {
        style.setProperty(`--f${n}c`, 'transparent');
      }
      style.setProperty(`--f${n}x`, mixed[o + 4].toFixed(1) + '%');
      style.setProperty(`--f${n}y`, mixed[o + 5].toFixed(1) + '%');
      style.setProperty(`--f${n}r`, mixed[o + 6].toFixed(1) + '%');
    }
  }

  measure();
  paint(true);

  onScrollFrame(() => paint(false));

  addEventListener('resize', () => { measure(); paint(true); }, { passive: true });
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
    onScrollFrame(() => {
      const p = viewportProgress(quote, { start: 0.9, end: 0.45 });
      const lit = Math.round(p * spans.length);
      spans.forEach((s, i) => s.classList.toggle('lit', i < lit));
    });
  }

  /* --- Section progress for lift / drift effects --- */
  const track = (el, opts) => {
    onScrollFrame(() => {
      el.style.setProperty('--sp', viewportProgress(el, opts).toFixed(3));
    });
  };

  // The recommendations are a thread now: the bubbles carry their own
  // side-entry reveal, so there is no parallax drift to drive here.

  /* --- Heading gradient sweep --- */
  $$('.section-head h2').forEach((h) => {
    onScrollFrame(() => {
      h.style.setProperty('--sweep', viewportProgress(h, { start: 0.95, end: 0.6 }).toFixed(3));
    });
  });

  /* --- Skill pills charge as their row scrolls in --- */
  $$('#skills .pills').forEach((row) => {
    row.dataset.charge = '';
    const items = $$('button, span', row);
    onScrollFrame(() => {
      const p = viewportProgress(row, { start: 0.92, end: 0.62 });
      items.forEach((item, i) => {
        // Each pill fills a little after the one before it.
        const local = clamp(p * items.length - i, 0, 1);
        item.style.setProperty('--charge', local.toFixed(3));
      });
    });
  });
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

  let current = 'all';

  const apply = (raw, { scroll = false } = {}) => {
    const needle = raw === 'all' ? 'all' : normalize(raw);
    current = needle;

    let visible = 0;
    cards.forEach((card) => {
      const hit = needle === 'all' || matches(card, needle);
      card.classList.toggle('is-hidden', !hit);
      card.classList.toggle('is-lit', hit && needle !== 'all');
      if (hit) visible++;
    });

    filterChips.forEach((c) => c.classList.toggle('is-active', normalize(c.dataset.filter) === needle));
    skillButtons.forEach((b) => b.classList.toggle('is-active', needle !== 'all' && normalize(b.textContent) === needle));

    if (status && statusTag) {
      status.hidden = needle === 'all';
      statusTag.textContent = raw;
    }
    if (empty) empty.hidden = visible !== 0;

    if (scroll) {
      grid.closest('section')?.scrollIntoView({
        behavior: prefersReduced() ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  };

  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => apply(chip.dataset.filter));
  });

  skillButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const label = btn.textContent.trim();
      const needle = normalize(label);
      if (current === needle) { apply('all'); toast('Filter cleared'); return; }

      apply(label, { scroll: true });
      const hits = cards.filter((c) => !c.classList.contains('is-hidden')).length;
      toast(hits ? `${hits} project${hits === 1 ? '' : 's'} using ${label}` : `No projects tagged ${label} yet`);
    });
  });

  $('#filterClear')?.addEventListener('click', () => apply('all'));
  $('[data-filter-reset]')?.addEventListener('click', () => apply('all'));
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
      `<span class="t-key">2026 on</span>    Software Engineering Intern · ADT\n` +
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
   Console greeting for the curious
   ========================================================================== */
console.log(
  '%cAjay Sommi%c\nPoking around the console? Try pressing ~ on the page for a terminal,\nor ⌘K for the command palette.\n\nmailto:ajaysommi7@gmail.com',
  'font-size:20px;font-weight:700;color:#71FFE9',
  'color:#9fb2c4;font-family:monospace;line-height:1.6'
);
