/* ==========================================================================
   Start-up. After the loading screen the visitor picks what to run. On a
   computer that is a startup disk, one per era, and the system on it boots
   to fill the window: 1983 terminal, 1991 desktop, 1998 web, 2009 desktop.
   On a phone it is a handset: a 2000 candybar, a 2004 pocket player or a
   2007 touchscreen. Every system can come back here to pick another.
   Deep links (#1991, #2009, #nokia, #iphone ...) skip the picker.
   ========================================================================== */
(function start() {
  const root = document.documentElement;
  const MODE = root.dataset.mode;
  const { esc, store } = window.RETRO;
  const I = window.ICONS;
  const SFX = window.SFX;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const READY = window.READY || Promise.resolve();

  const curtain = document.getElementById('curtain');
  const fade = async (fn) => {
    curtain.classList.add('is-on');
    await wait(380);
    await fn();
    curtain.classList.remove('is-on');
  };

  /* ================================================================ DESKTOP */

  const FLOPPY = `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M6 4h80l10 10v80a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" fill="#1d2230"/><rect x="24" y="4" width="50" height="30" rx="1.5" fill="#c9ccd2"/><rect x="54" y="9" width="11" height="20" rx="1" fill="#1d2230"/><rect x="14" y="44" width="72" height="50" rx="2" fill="#f4efe3"/><rect x="14" y="44" width="72" height="7" fill="#ff6b35"/><rect x="14" y="51" width="72" height="3" fill="#3d68ff"/><text x="20" y="68" font-family="Pixelify Sans, monospace" font-size="9" font-weight="700" fill="#1a1a1a">SOMMI-DOS</text><text x="20" y="80" font-family="VT323, monospace" font-size="8" fill="#555">SYSTEM DISK 3.3</text><rect x="8" y="88" width="4" height="4" fill="#0e121a"/></svg>`;
  const CD = `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="cdA"><stop offset=".18" stop-color="#e9edf2"/><stop offset=".2" stop-color="#bfc6cf"/><stop offset="1" stop-color="#dfe5ec"/></radialGradient><linearGradient id="cdB" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8ac8" stop-opacity=".5"/><stop offset=".3" stop-color="#8af0ff" stop-opacity=".4"/><stop offset=".55" stop-color="#fff38a" stop-opacity=".45"/><stop offset=".8" stop-color="#9a8aff" stop-opacity=".5"/></linearGradient></defs><circle cx="50" cy="50" r="46" fill="url(#cdA)" stroke="#9aa3ad"/><circle cx="50" cy="50" r="46" fill="url(#cdB)"/><circle cx="50" cy="50" r="13" fill="#eef2f6" stroke="#9aa3ad"/><circle cx="50" cy="50" r="6" fill="#1a1a1a"/><text x="50" y="80" text-anchor="middle" font-family="Pixelify Sans, monospace" font-size="8" font-weight="700" fill="#1a3a6a">SommiNet 98</text></svg>`;
  const ALU = `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><linearGradient id="alA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f5f7"/><stop offset=".5" stop-color="#d4d8dd"/><stop offset="1" stop-color="#a7adb4"/></linearGradient></defs><rect x="6" y="24" width="88" height="54" rx="7" fill="url(#alA)" stroke="#7d838a"/><rect x="6" y="24" width="88" height="14" rx="7" fill="#fff" opacity=".55"/><g transform="translate(36 40) scale(.62)">${I.mark(40, true).replace('<svg', '<svg x="0" y="0" style="color:#6b7178"')}</g><circle cx="83" cy="69" r="2.6" fill="#59d16a"/></svg>`;

  const ERAS = [
    { year: '1983', name: 'SOMMI-DOS', disk: 'System disk', note: 'A command line. Type, or click the commands.', sys: () => window.TERM, art: FLOPPY },
    { year: '1991', name: 'SommiOS 7', disk: 'Ajay HD', note: 'Black and white windows, icons and a Trash.', sys: () => window.FINDER, art: I.svg('hd', 100) },
    { year: '1998', name: 'SommiNet 98', disk: 'CD-ROM', note: 'A browser and a homepage, guestbook included.', sys: () => window.WEB, art: CD },
    { year: '2009', name: 'SommiOS X', disk: 'Snow Gator', note: 'A dock, Aqua windows and Spotlight.', sys: () => window.OSX, art: ALU }
  ];

  const desk = () => {
    const host = document.getElementById('osHost');
    const pick = document.getElementById('picker');
    const screens = [];
    const booted = [];
    let cur = -1;
    let sel = Math.max(0, ERAS.findIndex((e) => e.year === store.get('era', '2009')));

    const api = {
      go: (i) => launch(i),
      picker: () => showPicker(),
      years: ERAS.map((e) => e.year),
      hint() {}, led() {}
    };

    pick.innerHTML = `
      <div class="pk-in">
        <div class="pk-head">${I.pxmark(40)}<div><h1>Choose a startup disk</h1><p>Each one starts the portfolio up as it would have run in its year.</p></div></div>
        <div class="pk-row" role="listbox" aria-label="Startup disks">${ERAS.map((e, i) => `<button type="button" class="pk-d" role="option" data-i="${i}"><span class="pk-art">${e.art}</span><b>${esc(e.name)}</b><span class="pk-y">${e.year} · ${esc(e.disk)}</span><span class="pk-n">${esc(e.note)}</span><span class="pk-go" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5 5 12h4v7h6v-7h4z" fill="currentColor"/></svg></span></button>`).join('')}</div>
        <p class="pk-foot">Click a disk to start up · or use ← → and Return</p>
        <a class="pk-classic" href="classic.html">Or skip the computer and open the classic site</a>
      </div>`;
    const disks = [...pick.querySelectorAll('.pk-d')];
    const mark = () => disks.forEach((d, i) => { d.classList.toggle('is-sel', i === sel); d.setAttribute('aria-selected', i === sel); });
    mark();
    pick.addEventListener('pointerover', (e) => { const d = e.target.closest('.pk-d'); if (d) { sel = +d.dataset.i; mark(); } });
    pick.addEventListener('click', (e) => { const d = e.target.closest('.pk-d'); if (d) { sel = +d.dataset.i; mark(); SFX.click(); launch(sel); } });
    document.addEventListener('keydown', (e) => {
      if (pick.hidden) return;
      if (e.key === 'ArrowRight') { sel = (sel + 1) % ERAS.length; mark(); disks[sel].focus(); }
      if (e.key === 'ArrowLeft') { sel = (sel - 1 + ERAS.length) % ERAS.length; mark(); disks[sel].focus(); }
      if (e.key === 'Enter' && !e.target.closest('a')) { e.preventDefault(); launch(sel); }
    });

    const screen = (i) => {
      if (screens[i]) return screens[i];
      const s = document.createElement('div');
      s.className = 'os-screen';
      s.hidden = true;
      host.appendChild(s);
      screens[i] = s;
      ERAS[i].sys().build(s, api, i);
      return s;
    };

    async function launch(i) {
      if (i === cur) return;
      const prev = cur;
      cur = i;
      store.set('era', ERAS[i].year);
      await fade(async () => {
        if (prev >= 0) { ERAS[prev].sys().leave(); screens[prev].hidden = true; }
        pick.hidden = true;
        const s = screen(i);
        s.hidden = false;
        history.replaceState(null, '', '#' + ERAS[i].year);
      });
      const sys = ERAS[i].sys();
      if (!booted[i]) { booted[i] = true; await sys.boot(); }
      sys.resize && sys.resize();
      sys.enter();
    }

    async function showPicker() {
      const prev = cur;
      cur = -1;
      await fade(async () => {
        if (prev >= 0) { ERAS[prev].sys().leave(); screens[prev].hidden = true; }
        pick.hidden = false;
        history.replaceState(null, '', location.pathname + location.search);
        mark();
      });
      disks[sel].focus({ preventScroll: true });
    }

    addEventListener('resize', () => { if (cur >= 0) { const s = ERAS[cur].sys(); s.resize && s.resize(); } });

    READY.then(() => {
      const want = ERAS.findIndex((e) => '#' + e.year === location.hash);
      if (want >= 0) launch(want);
      else { pick.hidden = false; disks[sel].focus({ preventScroll: true }); }
    });
    pick.hidden = location.hash.length > 1;
  };

  /* ================================================================= PHONES */

  const PHONE_ART = {
    nokia: `<svg viewBox="0 0 60 130" aria-hidden="true"><rect x="2" y="2" width="56" height="126" rx="20" fill="#2f4372"/><rect x="10" y="18" width="40" height="34" rx="6" fill="#20252c"/><rect x="14" y="22" width="32" height="24" rx="2" fill="#b4d074"/><text x="30" y="37" text-anchor="middle" font-family="Pixelify Sans, monospace" font-size="6" font-weight="700" fill="#1d2a10">SOMMIA</text><rect x="20" y="58" width="20" height="9" rx="4.5" fill="#c4cbd8"/>${[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => `<ellipse cx="${17 + c * 13}" cy="${78 + r * 11}" rx="5" ry="3.6" fill="#d7dce6"/>`).join('')).join('')}</svg>`,
    pocket: `<svg viewBox="0 0 60 130" aria-hidden="true"><rect x="2" y="2" width="56" height="126" rx="12" fill="#f3f1ec" stroke="#c9c3b6"/><rect x="8" y="10" width="44" height="50" rx="4" fill="#2b2e2a"/><rect x="11" y="13" width="38" height="44" rx="2" fill="#c9dcb6"/><rect x="13" y="20" width="34" height="5" fill="#1c2614"/><rect x="13" y="28" width="26" height="3" fill="#55603f"/><rect x="13" y="34" width="30" height="3" fill="#55603f"/><circle cx="30" cy="94" r="22" fill="#fbfaf7" stroke="#d9d4c8"/><circle cx="30" cy="94" r="8" fill="#ece9e2" stroke="#d9d4c8"/></svg>`,
    iphone: `<svg viewBox="0 0 60 130" aria-hidden="true"><rect x="2" y="2" width="56" height="126" rx="13" fill="#0c0c0c" stroke="#c9ccd0" stroke-width="2.4"/><rect x="25" y="12" width="10" height="2" rx="1" fill="#333"/><rect x="7" y="22" width="46" height="70" fill="#000"/>${[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => `<rect x="${9.5 + c * 11}" y="${26 + r * 13}" width="8" height="8" rx="2" fill="hsl(${(r * 4 + c) * 33} 70% 55%)"/>`).join('')).join('')}<rect x="7" y="80" width="46" height="12" fill="#9a9a9a"/><circle cx="30" cy="108" r="7" fill="#111" stroke="#444"/><rect x="27.4" y="105.4" width="5.2" height="5.2" rx="1.2" fill="none" stroke="#888" stroke-width=".8"/></svg>`
  };
  const PHONES = [
    { id: 'nokia', name: 'SOMMIA 3310', year: '2000', note: 'Keys only. Navi selects, C goes back.', mod: () => window.NOKIA, cls: 'nk-room' },
    { id: 'pocket', name: 'Sommi Pocket', year: '2004', note: 'A click wheel and a tiny screen.', mod: () => window.POCKET, cls: 'pocket-room' },
    { id: 'iphone', name: 'iPhone 2G', year: '2007', note: 'Slide to unlock. The home button goes back.', mod: () => window.IPHONE, cls: 'iphone-room' }
  ];

  const phones = () => {
    const host = document.getElementById('phoneHost');
    const pick = document.getElementById('picker');
    const rooms = {};
    let cur = null;
    let sel = Math.max(0, PHONES.findIndex((p) => p.id === store.get('phone', 'iphone')));

    pick.classList.add('is-phones');
    pick.innerHTML = `
      <div class="mp-head">${I.pxmark(32)}<h1>Choose your phone</h1><p>Swipe through, then tap one to power it on.</p></div>
      <div class="mp-rail" role="listbox" aria-label="Phones">${PHONES.map((p, i) => `<button type="button" class="mp-card" role="option" data-i="${i}"><span class="mp-art">${PHONE_ART[p.id]}</span><b>${esc(p.name)}</b><span class="mp-y">${p.year}</span><span class="mp-n">${esc(p.note)}</span><span class="mp-on">Power on</span></button>`).join('')}</div>
      <div class="mp-dots">${PHONES.map((_, i) => `<i data-i="${i}"></i>`).join('')}</div>
      <a class="pk-classic" href="classic.html">Or open the classic site</a>`;
    const rail = pick.querySelector('.mp-rail');
    const cards = [...pick.querySelectorAll('.mp-card')];
    const dots = [...pick.querySelectorAll('.mp-dots i')];
    const markDots = () => {
      const c = rail.scrollLeft + rail.clientWidth / 2;
      let best = 0, bd = 1e9;
      cards.forEach((card, i) => { const d = Math.abs(card.offsetLeft + card.offsetWidth / 2 - c); if (d < bd) { bd = d; best = i; } });
      sel = best;
      dots.forEach((d, i) => d.classList.toggle('on', i === best));
      cards.forEach((d, i) => d.classList.toggle('is-sel', i === best));
    };
    rail.addEventListener('scroll', () => requestAnimationFrame(markDots), { passive: true });
    const center = (i, smooth) => { const c = cards[i]; rail.scrollTo({ left: c.offsetLeft - (rail.clientWidth - c.offsetWidth) / 2, behavior: smooth ? 'smooth' : 'auto' }); };
    pick.addEventListener('click', (e) => {
      const d = e.target.closest('.mp-dots i');
      if (d) { center(+d.dataset.i, true); return; }
      const c = e.target.closest('.mp-card');
      if (!c) return;
      const i = +c.dataset.i;
      if (i !== sel) { center(i, true); return; }
      launch(PHONES[i].id);
    });

    /* A small way back to this picker, outside every phone. */
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'mp-back';
    back.hidden = true;
    back.innerHTML = '‹ Phones';
    back.addEventListener('click', () => showPicker());
    document.body.appendChild(back);

    async function launch(id) {
      const p = PHONES.find((x) => x.id === id);
      if (!p || cur === id) return;
      store.set('phone', id);
      await fade(async () => {
        if (cur) rooms[cur].hidden = true;
        cur = id;
        pick.hidden = true;
        if (!rooms[id]) {
          const r = document.createElement('div');
          r.className = p.cls + ' phone-room';
          host.appendChild(r);
          rooms[id] = r;
          p.mod().start(r, () => showPicker());
        } else rooms[id].hidden = false;
        back.hidden = false;
        history.replaceState(null, '', '#' + id);
      });
    }

    async function showPicker() {
      await fade(async () => {
        if (cur) rooms[cur].hidden = true;
        cur = null;
        back.hidden = true;
        pick.hidden = false;
        history.replaceState(null, '', location.pathname + location.search);
      });
      center(sel, false);
      markDots();
    }

    READY.then(() => {
      const want = PHONES.find((p) => '#' + p.id === location.hash);
      if (want) launch(want.id);
      else { pick.hidden = false; center(sel, false); markDots(); }
    });
    pick.hidden = PHONES.some((p) => '#' + p.id === location.hash);
    requestAnimationFrame(() => { center(sel, false); markDots(); });
  };

  /* Crossing between phone and computer sizes (a rotated tablet, a
     resized window, a browser's device toolbar) restarts on the right
     picker, unless the address bar forces one. */
  const want = () => (matchMedia('(max-width: 760px), (max-height: 520px) and (pointer: coarse)').matches ? 'mobile' : 'desk');
  let rz = 0;
  addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => { if (root.dataset.forced !== '1' && want() !== MODE) location.reload(); }, 250);
  });

  if (MODE === 'mobile') phones(); else desk();
})();
