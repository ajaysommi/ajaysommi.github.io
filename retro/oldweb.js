/* ==========================================================================
   The web as it was. Every browser here (SurfBoard in 1998, Safari on the
   2007 phone and the 2009 desktop) sends what was typed through this:

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

  /* Opens what was typed in a frame. Our own pages (Google) are drawn in
     the frame with no scripts, and their links and form come back here;
     archived and present-day sites load as themselves. */
  const open = async (frame, input, year, { onNav, onState } = {}) => {
    const v = String(input || '').trim();
    const state = (s) => onState && onState(s);
    const nav = (u) => onNav && onNav(u);
    const draw = (html) => {
      frame.dataset.kind = 'doc';
      frame.setAttribute('sandbox', 'allow-same-origin');
      frame.removeAttribute('src');
      frame.srcdoc = html;
      frame.onload = () => {
        let d;
        try { d = frame.contentDocument; } catch (e) { return; }
        if (!d) return;
        d.addEventListener('click', (e) => { const a = e.target.closest('a[href]'); if (!a) return; e.preventDefault(); const h = a.getAttribute('href'); if (h.startsWith('#')) { const t = d.getElementById(h.slice(1)); if (t) t.scrollIntoView(); return; } if (/^https?:/i.test(a.href)) nav(a.href); });
        d.addEventListener('submit', (e) => { e.preventDefault(); const q = new FormData(e.target).get('q'); if (q && String(q).trim()) nav(String(q)); }, true);
      };
    };
    const site = (src) => {
      frame.removeAttribute('srcdoc');
      frame.dataset.kind = src === 'about:blank' ? '' : 'site';
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
      frame.onload = null;
      frame.src = src;
    };
    if (!v) { site('about:blank'); return; }
    state('loading');
    if (isGoogle(v)) { draw(homePage(year)); state('done'); return; }
    if (!isUrl(v)) {
      try { draw(resultsPage(v, await results(v), year)); }
      catch (e) { site('https://www.google.com/search?igu=1&q=' + encodeURIComponent(v)); }
      state('done');
      return;
    }
    const u = full(v);
    const old = await snapshot(u, year);
    if (old) { site(old); state('done'); return; }
    /* Nothing from back then: today's page, read through the reader so
       sites that refuse framing still show; failing that, framed as is. */
    try {
      const r = await fetch(READER + u, { headers: { 'X-Return-Format': 'html' } });
      if (!r.ok) throw new Error(r.status);
      const html = (await r.text()).replace(/<script\b[\s\S]*?<\/script>/gi, '');
      draw(`<base href="${esc(u)}">` + html);
    } catch (e) { site(u); }
    state('done');
  };

  return { open, shown, isUrl, isGoogle };
})();
