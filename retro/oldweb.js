/* ==========================================================================
   The web as it was. Every browser here (SurfBoard in 1998, Safari on the
   2007 phone and the 2007 desktop) sends what was typed through this:

   - an address opens the Internet Archive's copy of that site from the
     browser's own year, shown without any archive toolbar; if there is no
     copy from near then, today's site loads instead.
   - anything else is a search, answered on a results page dressed as
     Google looked that year. The results themselves are live (DuckDuckGo's
     plain page, read through a reader service); following one goes back
     in time the same way.
   ========================================================================== */
window.OLDWEB = (function () {
  const READER = 'https://r.jina.ai/';
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const isUrl = (v) => /^https?:\/\//i.test(v) || /^[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?$/.test(v.trim());
  const full = (v) => (/^https?:\/\//i.test(v) ? v : 'http://' + v.trim());
  const isGoogle = (v) => /^(https?:\/\/)?(www\.)?google\.com\/?$/i.test(v.trim()) || /^google$/i.test(v.trim());

  /* What the address bar shows: what was typed, with www. in front. */
  const shown = (v) => {
    const s = v.trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '');
    return isUrl(v) || isGoogle(v) ? 'www.' + (isGoogle(v) ? 'google.com' : s) : 'www.google.com/search?q=' + encodeURIComponent(s).replace(/%20/g, '+');
  };

  /* The archive's copy nearest the year, if there is one within a few
     years of it. */
  const snapshot = async (url, year) => {
    try {
      const r = await fetch(`https://archive.org/wayback/available?url=${encodeURIComponent(url.replace(/^https?:\/\//, ''))}&timestamp=${year}0615`);
      const d = await r.json();
      const c = d.archived_snapshots && d.archived_snapshots.closest;
      if (!c || !c.available || String(c.status) !== '200') return null;
      if (Math.abs(+c.timestamp.slice(0, 4) - year) > 3) return null;
      return `https://web.archive.org/web/${c.timestamp}if_/${url}`;
    } catch (e) { return null; }
  };

  /* Search results: title, address and a line of text each. */
  const results = async (q) => {
    const r = await fetch(READER + 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(q), { headers: { 'X-Return-Format': 'html' } });
    if (!r.ok) throw new Error(r.status);
    const doc = new DOMParser().parseFromString(await r.text(), 'text/html');
    return [...doc.querySelectorAll('.result')].map((el) => {
      const a = el.querySelector('a.result__a');
      if (!a) return null;
      let u = a.getAttribute('href') || '';
      try { const x = new URL(u, 'https://duckduckgo.com'); if (x.searchParams.get('uddg')) u = x.searchParams.get('uddg'); } catch (e) { return null; }
      if (/duckduckgo\.com\/y\.js/.test(u)) return null;
      const sn = el.querySelector('.result__snippet');
      return { t: a.textContent.trim(), u, s: sn ? sn.textContent.trim() : '' };
    }).filter(Boolean).slice(0, 10);
  };

  /* Google, by year: the 1998 beta with its exclamation mark, then the
     2000s page with blue links and green addresses. */
  const LOGO = (year, big) => {
    const c = ['#1f4bd0', '#d42a1d', '#f2b400', '#1f4bd0', '#139a2b', '#d42a1d'];
    const s = big ? 64 : 34;
    return `<span class="lg" style="font:bold ${s}px/1 Georgia,'Times New Roman',serif;letter-spacing:-${big ? 3 : 1.5}px;text-shadow:${big ? '2px 2px 0 rgba(0,0,0,.18)' : '1px 1px 0 rgba(0,0,0,.18)'}">${'Google'.split('').map((ch, i) => `<span style="color:${c[i]}">${ch}</span>`).join('')}${year < 2000 ? '<span style="color:#d42a1d">!</span>' : ''}</span>`;
  };
  const STYLE = (year) => `<style>
    body{margin:0;padding:12px 10px;font:${year < 2000 ? '14px "Times New Roman",serif' : '13px Arial,sans-serif'};color:#000;background:#fff}
    a{color:#00c}a:visited{color:#551a8b}.u{color:#008000}.bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;border-bottom:1px solid #c9d7f1;padding-bottom:8px;margin-bottom:10px}
    .bar form{display:flex;gap:4px;flex:1;min-width:180px}input[type=text]{flex:1;font-size:15px;padding:3px}button{font-size:13px}
    .st{background:#e5ecf9;border-top:1px solid #36c;padding:3px 6px;font-size:12px;margin:-4px 0 12px}
    .r{margin:0 0 16px;max-width:620px}.r a.t{font-size:16px}.r .s{font-size:13px;line-height:1.35}.home{text-align:center;padding-top:40px}
    .home form{display:flex;flex-direction:column;align-items:center;gap:8px;margin-top:22px}.home input[type=text]{width:86%;max-width:420px;flex:none}.ft{font-size:11px;color:#777;text-align:center;margin-top:30px}
  </style>`;
  const searchForm = (q) => `<form data-q><input type="text" name="q" value="${esc(q || '')}" autocomplete="off" /><button type="submit">Google Search</button></form>`;
  const homePage = (year) => `${STYLE(year)}<div class="home">${LOGO(year, true)}${searchForm('')}<div class="ft">©${year} Google</div></div>`;
  const resultsPage = (q, list, year) => `${STYLE(year)}<div class="bar">${LOGO(year)}${searchForm(q)}</div><div class="st">Results <b>1</b> - <b>${list.length}</b> for <b>${esc(q)}</b></div>${list.length ? list.map((r) => `<div class="r"><a class="t" href="${esc(r.u)}">${esc(r.t)}</a><div class="s">${esc(r.s)}<br/><span class="u">${esc(r.u.replace(/^https?:\/\//, '').slice(0, 60))}</span></div></div>`).join('') : '<p>Your search did not match any documents.</p>'}`;

  /* Homepages kept with the site, as the archive had them in 1998 and in
     2007: [year, address, folder, title, line]. Typing one of these, or
     searching for it, needs no trip to the archive at all. */
  const KEPT = [[1998, "altavista.com", "altavista", "AltaVista Technology, Inc.", "AltaVista search."], [1998, "amazon.com", "amazon", "Amazon.com--Earth's Biggest Selection", "Earth's biggest selection."], [1998, "aol.com", "aol", "Welcome to AOL.com", "America Online."], [1998, "apple.com", "apple", "Apple Computer", "Apple: Mac, iPod, iPhone and more."], [1998, "ebay.com", "ebay", "eBay - Your Personal Trading Community", "Buy and sell almost anything."], [1998, "geocities.com", "geocities", "GeoCities - The Largest Community on the Web!", "Free homepages for everyone."], [1998, "lycos.com", "lycos", "Lycos: Your Personal Internet Guide", "Lycos: your personal internet guide."], [1998, "microsoft.com", "microsoft", "Welcome to Microsoft's Homepage", "Microsoft Corporation."], [1998, "nba.com", "nba", "NBA.com: The Official Site of the National Basketball Association", "The official site of the NBA."], [1998, "netscape.com", "netscape", "Welcome to Netscape Netcenter", "Netscape Netcenter."], [1998, "nytimes.com", "nytimes", "The New York Times on the Web", "The New York Times on the Web."], [1998, "yahoo.com", "yahoo", "Yahoo!", "Yahoo!: search, mail, news and more."], [2007, "amazon.com", "amazon", "Amazon.com: Online Shopping for Electronics, Apparel, Computers, Books", "Earth's biggest selection."], [2007, "aol.com", "aol", "AOL.com - Welcome to AOL", "America Online."], [2007, "apple.com", "apple", "Apple", "Apple: Mac, iPod, iPhone and more."], [2007, "cnn.com", "cnn", "CNN.com - Breaking News, U.S., World, Weather, Entertainment & Video N", "The latest news from CNN."], [2007, "digg.com", "digg", "Digg / News", "Digg: all the news, voted on by you."], [2007, "ebay.com", "ebay", "eBay - New & used electronics, cars, apparel, collectibles, sporting g", "Buy and sell almost anything."], [2007, "espn.go.com", "espn", "ESPN: The Worldwide Leader In Sports", "ESPN: the worldwide leader in sports."], [2007, "facebook.com", "facebook", "Facebook | Welcome to Facebook!", "A social utility that connects people."], [2007, "microsoft.com", "microsoft", "Microsoft", "Microsoft Corporation."], [2007, "msn.com", "msn", "MSN.com", "MSN."], [2007, "myspace.com", "myspace", "MySpace", "A place for friends."], [2007, "nytimes.com", "nytimes", "The New York Times - Breaking News, World News & Multimedia", "The New York Times on the Web."], [2007, "en.wikipedia.org", "wikipedia", "Main Page - Wikipedia, the free encyclopedia", "The free encyclopedia."], [2007, "yahoo.com", "yahoo", "Yahoo!", "Yahoo!: search, mail, news and more."], [2007, "youtube.com", "youtube", "YouTube - Broadcast Yourself.", "Broadcast yourself."]];
  const bucket = (year) => (year < 2003 ? 1998 : 2007);
  const bare = (u) => u.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/(index\.html?)?$/, '');
  const ALIAS = { 'espn.com': 'espn.go.com', 'wikipedia.org': 'en.wikipedia.org', 'en.m.wikipedia.org': 'en.wikipedia.org' };
  const keep = (u, year) => {
    const b = bare(u), host = ALIAS[b] || b;
    const e = KEPT.find((x) => x[0] === bucket(year) && x[1] === host);
    return e && { path: `assets/oldweb/${e[0]}/${e[2]}/index.html`, e };
  };
  const keeps = (q, year) => {
    const w = q.trim().toLowerCase().replace(/[^a-z0-9.]/g, '');
    return KEPT.filter((x) => x[0] === bucket(year) && (x[2] === w || x[1] === w || x[1].split('.')[0] === w || x[1] === w + '.com')).map((x) => ({ t: x[3], u: 'http://' + (x[1].split('.').length > 2 ? x[1] : 'www.' + x[1]) + '/', s: x[4] }));
  };

  /* Opens what was typed in a frame. Our own pages (Google) are drawn in
     the frame with no scripts, and their links and form come back here;
     archived and present-day sites load as themselves. */
  const open = async (frame, input, year, { onNav, onState, onField } = {}) => {
    const v = String(input || '').trim();
    const state = (s) => onState && onState(s);
    /* Done means the page has really arrived, not that it was asked for. */
    let fin = false;
    const finish = () => { if (!fin) { fin = true; state('done'); } };
    const nav = (u) => onNav && onNav(u);
    /* Pages drawn or kept here: their links and forms come back through
       the browser, and their fields take the device's own keyboard. */
    const hook = () => {
        let d;
        try { d = frame.contentDocument; } catch (e) { return; }
        if (!d) return;
        d.addEventListener('click', (e) => { const a = e.target.closest('a[href]'); if (!a) return; e.preventDefault(); const h = a.getAttribute('href'); if (h.startsWith('#')) { const t = d.getElementById(h.slice(1)); if (t) t.scrollIntoView(); return; } const u = a.href; if (/^https?:/i.test(u) && !u.startsWith(location.origin + '/assets/')) nav(u); });
        d.addEventListener('submit', (e) => { e.preventDefault(); const f = new FormData(e.target); let q = f.get('q') || f.get('p') || f.get('query') || f.get('field-keywords') || f.get('search'); if (!q) { const t = e.target.querySelector('input[type=text],input:not([type])'); q = t && t.value; } if (q && String(q).trim()) nav(String(q)); }, true);
        /* A device with a keyboard of its own types into these fields, so
           the visitor's real keyboard never comes up. */
        if (onField) d.querySelectorAll('input[type=text],input:not([type])').forEach((inp) => {
          inp.readOnly = true; inp.setAttribute('inputmode', 'none');
          inp.addEventListener('pointerdown', (e) => { e.preventDefault(); onField(inp, () => { const q = inp.value.trim(); if (q) nav(q); }); });
        });
        /* On a phone's narrow screen a desktop page opens zoomed out to its
           full width, as the iPhone's Safari showed one. */
        if (frame.dataset.kind === 'doc' && frame.getAttribute('src') && frame.clientWidth < 520) {
          const fit = () => { const w = Math.max(d.documentElement.scrollWidth, d.body ? d.body.scrollWidth : 0); if (w > frame.clientWidth * 1.15) d.documentElement.style.zoom = String(frame.clientWidth / w); };
          fit(); setTimeout(fit, 400);
        }
        finish();
    };
    const draw = (html) => {
      frame.dataset.kind = 'doc';
      frame.setAttribute('sandbox', 'allow-same-origin');
      frame.removeAttribute('src');
      frame.srcdoc = html;
      frame.onload = hook;
    };
    /* A copy kept with the site: shown at once, as itself. */
    const kept = (path) => {
      frame.removeAttribute('srcdoc');
      frame.dataset.kind = 'doc';
      frame.setAttribute('sandbox', 'allow-same-origin');
      frame.onload = hook;
      frame.src = path;
    };
    const site = (src) => {
      frame.removeAttribute('srcdoc');
      frame.dataset.kind = src === 'about:blank' ? '' : 'site';
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
      frame.onload = src === 'about:blank' ? null : finish;
      frame.src = src;
    };
    if (!v) { site('about:blank'); return; }
    state('loading');
    if (isGoogle(v)) { draw(homePage(year)); return; }
    const k = isUrl(v) && keep(v, year);
    if (k) { kept(k.path); return; }
    if (!isUrl(v)) {
      /* A search for one of the kept sites answers at once, that site
         first; the rest of the results join below when they come. */
      const hit = keeps(v, year);
      if (hit.length) {
        draw(resultsPage(v, hit, year).replace(/<div class="st">Results <b>1<\/b> - <b>\d+<\/b>/, '<div class="st">Results <b>1</b> - <b>10</b>') + '<div class="more"></div>');
        results(v).then((list) => {
          let d; try { d = frame.contentDocument; } catch (e) { return; }
          const m = d && d.querySelector('.more');
          if (!m) return;
          const seen = new Set(hit.map((r) => r.u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')));
          m.outerHTML = list.filter((r) => !seen.has(r.u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))).slice(0, 9).map((r) => `<div class="r"><a class="t" href="${esc(r.u)}">${esc(r.t)}</a><div class="s">${esc(r.s)}<br/><span class="u">${esc(r.u.replace(/^https?:\/\//, '').slice(0, 60))}</span></div></div>`).join('');
        }).catch(() => {});
        return;
      }
      try { draw(resultsPage(v, await results(v), year)); }
      catch (e) { site('https://www.google.com/search?igu=1&q=' + encodeURIComponent(v)); }
      return;
    }
    const u = full(v);
    const old = await snapshot(u, year);
    if (old) { site(old); return; }
    /* Nothing from back then: today's page, read through the reader so
       sites that refuse framing still show; failing that, framed as is. */
    try {
      const r = await fetch(READER + u, { headers: { 'X-Return-Format': 'html' } });
      if (!r.ok) throw new Error(r.status);
      const html = (await r.text()).replace(/<script\b[\s\S]*?<\/script>/gi, '');
      draw(`<base href="${esc(u)}">` + html);
    } catch (e) { site(u); }
  };

  return { open, shown, isUrl, isGoogle };
})();
