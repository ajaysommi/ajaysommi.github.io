/* ==========================================================================
   1983: SOMMI-DOS. A text screen and a prompt. Everything in the portfolio
   is a command away, and every command it prints can also be clicked, so
   nobody has to know what to type. Photos come out as characters.
   ========================================================================== */
window.TERM = (function () {
  const P = window.PORTFOLIO;
  const { esc, ascii, store } = window.RETRO;
  let root, out, input, typedEl, chips, api, screen;
  let ready = false;
  const hist = [];
  let hi = 0;
  let queue = [], pumping = false;

  /* ------------------------------------------------------------- printing */

  const line = (html, cls) => {
    const d = document.createElement('div');
    d.className = 'term-line' + (cls ? ' ' + cls : '');
    d.innerHTML = html === '' ? '&nbsp;' : html;
    return d;
  };
  const promptEl = () => out.querySelector('.term-prompt');
  const scrollDown = () => { out.scrollTop = out.scrollHeight; };

  /* Lines go out one at a time, quickly, like a slow serial link; a key
     press flushes whatever is still waiting. */
  const print = (items, delay = 14) => new Promise((resolve) => {
    (Array.isArray(items) ? items : [items]).forEach((it) => queue.push([typeof it === 'string' ? [it] : it, delay]));
    queue.push([null, 0, resolve]);
    if (!pumping) pump();
  });
  const pump = () => {
    pumping = true;
    const next = queue.shift();
    if (!next) { pumping = false; return; }
    const [it, delay, done] = next;
    if (done) { done(); return pump(); }
    const p = promptEl();
    out.insertBefore(line(it[0], it[1]), p);
    scrollDown();
    if (delay && !document.documentElement.classList.contains('reduced')) setTimeout(pump, delay);
    else pump();
  };
  const flush = () => {
    while (queue.length) {
      const [it, , done] = queue.shift();
      if (done) { done(); continue; }
      out.insertBefore(line(it[0], it[1]), promptEl());
    }
    pumping = false;
    scrollDown();
  };

  const cmd = (c, label) => `<button type="button" class="t-cmd" data-cmd="${esc(c)}">${esc(label || c.toUpperCase())}</button>`;
  const link = (href, label) => `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;
  const pad = (s, n) => { s = String(s); return s.length >= n ? s.slice(0, n - 1) + ' ' : s + ' '.repeat(n - s.length); };
  const rule = (n = 64) => '\u2500'.repeat(n);

  /* --------------------------------------------------------------- pages */

  const BANNER = [
    ' \u2588\u2588\u2588      \u2588  \u2588\u2588\u2588  \u2588   \u2588      \u2588\u2588\u2588\u2588  \u2588\u2588\u2588  \u2588   \u2588 \u2588   \u2588 \u2588\u2588\u2588',
    '\u2588   \u2588     \u2588 \u2588   \u2588  \u2588 \u2588      \u2588     \u2588   \u2588 \u2588\u2588 \u2588\u2588 \u2588\u2588 \u2588\u2588  \u2588 ',
    '\u2588\u2588\u2588\u2588\u2588     \u2588 \u2588\u2588\u2588\u2588\u2588   \u2588        \u2588\u2588\u2588  \u2588   \u2588 \u2588 \u2588 \u2588 \u2588 \u2588 \u2588  \u2588 ',
    '\u2588   \u2588 \u2588   \u2588 \u2588   \u2588   \u2588           \u2588 \u2588   \u2588 \u2588   \u2588 \u2588   \u2588  \u2588 ',
    '\u2588   \u2588  \u2588\u2588\u2588  \u2588   \u2588   \u2588       \u2588\u2588\u2588\u2588   \u2588\u2588\u2588  \u2588   \u2588 \u2588   \u2588 \u2588\u2588\u2588'
  ];

  const MENU = [
    ['about', 'who I am'],
    ['work', 'the path so far, 8 roles'],
    ['projects', 'things I have built'],
    ['garage', 'repairs and builds off the clock'],
    ['skills', 'languages and tools'],
    ['school', 'education'],
    ['refs', 'what folks have to say'],
    ['contact', 'say hello'],
    ['resume', 'open the resume (PDF)']
  ];

  const home = () => [
    ...BANNER.map((l) => [esc(l), 'big']),
    '',
    `SOFTWARE ENGINEER \u00b7 UNIVERSITY OF FLORIDA, CS \u00b7 ${esc(P.citizen.toUpperCase())}`,
    '',
    ...MENU.map(([c, d], i) => `  ${i + 1}  ${cmd(c, pad(c.toUpperCase(), 10))}${esc(d)}`),
    '',
    [`  Type a command or a number, or click one. ${cmd('help', 'HELP')} lists them all.`, 'dim'],
    [`  Type ${cmd('era', 'ERA')} to start up from another era.`, 'dim'],
    ''
  ];

  const help = () => [
    'COMMANDS',
    rule(48),
    ...MENU.map(([c, d]) => `  ${cmd(c, pad(c.toUpperCase(), 12))}${esc(d)}`),
    `  ${cmd('view me', pad('VIEW ME', 12))}a photo, in text mode`,
    `  ${cmd('github', pad('GITHUB', 12))}open GitHub`,
    `  ${cmd('linkedin', pad('LINKEDIN', 12))}open LinkedIn`,
    `  ${cmd('news', pad('NEWS', 12))}the users group news sheet, fall 1983`,
    `  ${cmd('catalog', pad('CATALOG', 12))}the SOMMI //e brochure`,
    `  ${cmd('bricks', pad('BRICKS', 12))}a game: break out the wall`,
    `  ${cmd('era', pad('ERA', 12))}start up from another era`,
    `  ${cmd('clear', pad('CLEAR', 12))}clear the screen`,
    '',
    ['  WORK, PROJECTS and GARAGE take a number: WORK 5. TAB completes, \u2191 recalls.', 'dim'],
    ''
  ];

  const about = () => [
    'ABOUT.TXT',
    rule(48),
    esc(P.about[0]),
    '',
    esc(P.about[1]),
    '',
    `  ${cmd('view me', '[ VIEW PHOTO ]')}  ${cmd('work', '[ SEE THE WORK ]')}  ${cmd('contact', '[ SAY HELLO ]')}`,
    ''
  ];

  const work = (arg) => {
    const ex = P.experience;
    if (arg) {
      let i = parseInt(arg, 10) - 1;
      if (isNaN(i)) i = ex.findIndex((e) => (e.id + ' ' + e.short + ' ' + e.org).toLowerCase().includes(arg));
      const e = ex[i];
      if (!e) return [`NO SUCH ROLE: ${esc(arg)}. Try ${cmd('work')}.`, ''];
      const L = [
        rule(),
        `  ${esc(e.org.toUpperCase())}`,
        `  ${esc(e.role)}`,
        [`  ${esc(e.when)} \u00b7 ${esc(e.where)}`, 'dim'],
        rule(),
        esc(e.text),
        ''
      ];
      e.stats.forEach(([a, b]) => L.push(`  \u25b8 ${esc(pad(a, 20))}${esc(b)}`));
      if (e.stats.length) L.push('');
      L.push(`  STACK   ${e.tags.map((t) => '[' + esc(t) + ']').join(' ')}`);
      if (e.photos.length) L.push(`  PHOTOS  ${e.photos.map((p, k) => cmd(`view ${e.id} ${k + 1}`, `[VIEW ${k + 1}]`)).join(' ')}`);
      L.push('');
      L.push(`  ${i > 0 ? cmd('work ' + i, '\u2039 PREV') : '      '}   ${cmd('work', 'ALL ROLES')}   ${i < ex.length - 1 ? cmd('work ' + (i + 2), 'NEXT \u203a') : ''}`);
      L.push('');
      return L;
    }
    return [
      `THE PATH SO FAR${' '.repeat(33)}${ex.length} ROLES`,
      rule(),
      ['  #  YEAR  COMPANY               ROLE', 'dim'],
      ...ex.map((e, i) => '  ' + cmd('work ' + (i + 1), `${pad(i + 1, 3)}${pad(e.year, 6)}${pad(e.short, 22)}${e.role}`)),
      '',
      ['  Click a row, or type WORK and a number.', 'dim'],
      ''
    ];
  };

  const projects = (arg) => {
    const pr = P.projects;
    if (arg) {
      let i = parseInt(arg, 10) - 1;
      if (isNaN(i)) i = pr.findIndex((p) => (p.id + ' ' + p.name).toLowerCase().includes(arg));
      const p = pr[i];
      if (!p) return [`NO SUCH PROJECT: ${esc(arg)}. Try ${cmd('projects')}.`, ''];
      return [
        rule(),
        `  ${esc(p.full.toUpperCase())}`,
        [`  ${esc(p.kind)} \u00b7 ${esc(p.stack)}`, 'dim'],
        rule(),
        esc(p.text),
        '',
        p.url ? `  SOURCE  ${link(p.url, p.url.replace('https://', ''))}` : ['  SOURCE  private, for now', 'dim'],
        '',
        `  ${i > 0 ? cmd('project ' + i, '\u2039 PREV') : '      '}   ${cmd('projects', 'ALL PROJECTS')}   ${i < pr.length - 1 ? cmd('project ' + (i + 2), 'NEXT \u203a') : ''}`,
        ''
      ];
    }
    return [
      'PROJECTS.BAS',
      rule(),
      ['  #  NAME             KIND           STACK', 'dim'],
      ...pr.map((p, i) => '  ' + cmd('project ' + (i + 1), `${pad(i + 1, 3)}${pad(p.name, 17)}${pad(p.kind, 15)}${p.stack}`)),
      '',
      ['  Click one, or type PROJECT and a number.', 'dim'],
      ''
    ];
  };

  const garage = (arg) => {
    const oc = P.offclock;
    if (arg) {
      let i = parseInt(arg, 10) - 1;
      if (isNaN(i)) i = oc.findIndex((s) => (s.id + ' ' + s.name).toLowerCase().includes(arg));
      const s = oc[i];
      if (!s) return [`NO SUCH LOG: ${esc(arg)}. Try ${cmd('garage')}.`, ''];
      const L = [rule(), `  ${esc(s.title.toUpperCase())}`, rule(), esc(s.lede), ''];
      s.steps.forEach(([, t, d], k) => {
        L.push(`  ${pad(k + 1 + '.', 4)}${esc(t.toUpperCase())}  ${cmd(`view ${s.id} ${k + 1}`, '[VIEW]')}`);
        L.push(`      ${esc(d)}`);
        L.push('');
      });
      L.push(`  ${cmd('garage', 'ALL LOGS')}`);
      L.push('');
      return L;
    }
    return [
      'GARAGE.LOG \u00b7 off the clock',
      rule(),
      ...oc.map((s, i) => '  ' + cmd('garage ' + (i + 1), `${pad(i + 1, 3)}${s.title}`)),
      '',
      [`  "${esc(P.quote)}"`, 'dim'],
      ''
    ];
  };

  const skills = () => {
    const L = ['SKILLS.SYS', rule()];
    P.skills.forEach(([g, list]) => {
      L.push(`  ${esc(g.toUpperCase())}`);
      L.push(`    ${list.map(esc).join(' \u00b7 ')}`);
      L.push('');
    });
    return L;
  };

  const school = () => {
    const e = P.education;
    return [
      'SCHOOL.TXT',
      rule(),
      `  ${esc(e.school.toUpperCase())}`,
      `  ${esc(e.degree)}, ${esc(e.college)}`,
      [`  Graduating ${esc(e.when)}`, 'dim'],
      '',
      esc(e.text),
      '',
      `  ${e.tags.map((t) => '[' + esc(t) + ']').join(' ')}`,
      ''
    ];
  };

  const refs = () => {
    const L = ['REFS.TXT \u00b7 what folks have to say', rule()];
    P.recs.forEach(([n, c, q]) => {
      L.push(`"${esc(q)}"`);
      L.push([`    \u2014 ${esc(n)}, ${esc(c)}`, 'dim']);
      L.push('');
    });
    L.push(`  More on ${link(P.linkedin, 'LinkedIn')}.`);
    L.push('');
    return L;
  };

  /* The papers on the disk: the users group's news sheet and the
     catalogue page, word wrapped to the screen. */
  const paper = (k) => {
    const d = window.PAPERS[1983][k];
    const wrapTo = (t, n = 58) => t.split(' ').reduce((a, w) => { const l = a[a.length - 1]; if ((l + ' ' + w).trim().length > n) a.push(w); else a[a.length - 1] = (l + ' ' + w).trim(); return a; }, ['']);
    const L = [`${d.file} \u00b7 ${esc(d.title)}`, [esc(d.sub), 'dim'], rule()];
    d.items.forEach(([h, t]) => { L.push(`  ${esc(h)}`); wrapTo(t).forEach((l) => L.push(['    ' + esc(l), 'dim'])); L.push(''); });
    L.push(esc(d.foot));
    L.push('');
    return L;
  };

  const contact = () => [
    'CONTACT',
    rule(48),
    '  Email is the quickest way to reach me.',
    '',
    `  EMAIL     ${link('mailto:' + P.email, P.email)}`,
    `  GITHUB    ${link(P.github, P.github.replace('https://', ''))}`,
    `  LINKEDIN  ${link(P.linkedin, P.linkedin.replace('https://www.', ''))}`,
    `  RESUME    ${cmd('resume', 'OPEN')}`,
    ''
  ];

  const FILES = [
    ['ABOUT.TXT', 'about', 1204], ['WORK.DAT', 'work', 8192], ['PROJECTS.BAS', 'projects', 4410],
    ['GARAGE.LOG', 'garage', 6120], ['SKILLS.SYS', 'skills', 980], ['SCHOOL.TXT', 'school', 512],
    ['REFS.TXT', 'refs', 3301], ['CONTACT.TXT', 'contact', 256], ['RESUME.PDF', 'resume', 88213],
    ['NEWS.TXT', 'news', 2210], ['CATALOG.TXT', 'catalog', 1180],
    ['AUTOEXEC.BAT', 'home', 64], ['SECRETS.TXT', 'secrets', 42]
  ];

  const dir = () => [
    ' Volume in drive A is PORTFOLIO',
    ' Directory of A:\\',
    '',
    ...FILES.map(([n, c, s]) => ` ${cmd(c === 'home' ? 'clear' : (c === 'secrets' ? 'type secrets.txt' : c), pad(n.split('.')[0], 9) + pad(n.split('.')[1], 4))}${String(s).padStart(8)}  10-23-83`),
    `       ${FILES.length} file(s)   ${FILES.reduce((a, f) => a + f[2], 0).toLocaleString()} bytes`,
    '               1,343,488 bytes free',
    ''
  ];

  /* ------------------------------------------------------------ commands */

  const viewPhoto = async (args) => {
    let src = null, label = '';
    const [a, b] = args;
    if (!a || a === 'me' || a === 'ajay') { src = P.photo; label = 'ME.PIC'; }
    else if (a === 'kid') { src = P.kidPhoto; label = 'KID.PIC'; }
    else {
      const n = Math.max(1, parseInt(b, 10) || 1) - 1;
      const role = P.experience.find((e) => e.id === a || e.short.toLowerCase().includes(a));
      const story = P.offclock.find((s) => s.id === a || s.name.toLowerCase().includes(a));
      if (role && role.photos.length) { src = role.photos[Math.min(n, role.photos.length - 1)]; label = role.id.toUpperCase() + (n + 1) + '.PIC'; }
      else if (story) { const st = story.steps[Math.min(n, story.steps.length - 1)]; src = st[0]; label = story.id.toUpperCase() + (n + 1) + '.PIC'; }
    }
    if (!src) return print([`NO PICTURE CALLED ${esc(args.join(' ').toUpperCase())}. Try VIEW ME.`, '']);
    await print([`LOADING ${label} IN TEXT MODE...`]);
    const tf = parseFloat(getComputedStyle(root).fontSize) || 24;
    const charW = tf * 0.62 * 0.5;
    const cols = Math.max(40, Math.min(104, Math.floor((out.clientWidth - tf * 3) / charW)));
    const art = await ascii(src, cols, 0.64);
    await print([[esc(art), 'art'], '']);
    window.EGGS.find('ascii');
  };

  const FORTUNES = [
    P.quote
  ];

  const ALIASES = {
    '?': 'help', menu: 'help', h: 'help', commands: 'help',
    me: 'about', bio: 'about', info: 'about',
    experience: 'work', path: 'work', jobs: 'work', job: 'work', career: 'work', roles: 'work', role: 'work',
    project: 'projects', proj: 'projects', code: 'projects', portfolio: 'projects', run: 'projects',
    offclock: 'garage', 'off-the-clock': 'garage', hobbies: 'garage', builds: 'garage', repairs: 'garage',
    stack: 'skills', tools: 'skills', skill: 'skills',
    education: 'school', edu: 'school', uf: 'school', college: 'school',
    recs: 'refs', recommendations: 'refs', testimonials: 'refs', guestbook: 'refs', references: 'refs',
    email: 'contact', mail: 'contact', reach: 'contact',
    cv: 'resume', 'r\u00e9sum\u00e9': 'resume',
    cls: 'clear', dir: 'ls', 'ls -la': 'ls', cat: 'type', more: 'type', open: 'type',
    next: '1991', gui: '1991', startx: '1991', win: '1991', desktop: '1991', finder: '1991',
    web: '1998', www: '1998', internet: '1998', netscape: '1998', browser: '1998',
    quit: 'era', logout: 'era', bye: 'era', shutdown: 'era', exit: 'era', eras: 'era', switch: 'era', restart: 'era',
    hi: 'hello', hey: 'hello', yo: 'hello',
    ver: 'version', play: 'games', game: 'games', tea: 'coffee', java: 'coffee'
  };

  const COMMANDS = {
    help: () => print(help(), 6),
    about: () => print(about()),
    work: (a) => print(work(a.join(' '))),
    projects: (a) => print(projects(a.join(' '))),
    garage: (a) => print(garage(a.join(' '))),
    skills: () => print(skills()),
    school: () => print(school()),
    refs: () => print(refs(), 8),
    contact: () => print(contact()),
    news: () => print(paper('news'), 8),
    catalog: () => print(paper('brochure'), 8),
    resume: () => { window.open(P.resume, '_blank', 'noopener'); return print(['OPENING RESUME.PDF IN A NEW WINDOW...', '']); },
    github: () => { window.open(P.github, '_blank', 'noopener'); return print(['DIALING GITHUB...', '']); },
    linkedin: () => { window.open(P.linkedin, '_blank', 'noopener'); return print(['DIALING LINKEDIN...', '']); },
    view: (a) => viewPhoto(a),
    clear: () => { out.querySelectorAll('.term-line').forEach((l) => l.remove()); return Promise.resolve(); },
    home: () => { COMMANDS.clear(); return print(home(), 8); },
    ls: () => print(dir(), 6),
    type: (a) => {
      const f = (a[0] || '').toLowerCase();
      if (!f) return print(['WHICH FILE? Try DIR.', '']);
      if (f.startsWith('secret')) return print(['SECRETS.TXT', rule(24), 'NO SECRETS ON THIS DISK.', '']);
      const hit = FILES.find(([n]) => n.toLowerCase().startsWith(f.replace(/\..*$/, '')));
      if (!hit) return print([`FILE NOT FOUND: ${esc(f.toUpperCase())}`, '']);
      return run(hit[1] === 'home' ? 'home' : hit[1]);
    },
    cd: (a) => print(['THERE IS ONLY ONE DIRECTORY.', '']),
    pwd: () => print(['A:\\PORTFOLIO', '']),
    date: () => print([new Date().toDateString().toUpperCase(), '']),
    time: () => COMMANDS.date(),
    whoami: () => print(['guest', '']),
    hello: () => print(['HELLO! GLAD YOU\u2019RE HERE.', `  ${cmd('about', 'START WITH ABOUT')}  or  ${cmd('help', 'SEE EVERYTHING')}`, '']),
    version: () => print(['SOMMI-DOS VERSION 3.3 \u00b7 BUILD 1983.10.23', '']),
    history: () => print(hist.length ? hist.map((h, i) => `  ${i + 1}  ${esc(h)}`).concat(['']) : ['NO HISTORY YET.', '']),
    echo: (a, raw) => print([esc(raw.replace(/^\s*echo\s?/i, '')) || '', '']),
    sudo: () => { window.EGGS.find('sudo'); return print(['guest is not in the sudoers file.', '']); },
    hire: () => {
      window.EGGS.find('hire');
      return print(['CONTACT DETAILS:', '[\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588] 100%', `  ${link('mailto:' + P.email + '?subject=' + encodeURIComponent("Let's talk"), '[ SEND IT ]')}`, '']);
    },
    xyzzy: () => { window.EGGS.find('xyzzy'); return print(['Nothing happens.', '']); },
    plugh: () => print(['A hollow voice says "Fool."', '']),
    color: (a) => {
      const order = ['green', 'amber', 'white', 'blue'];
      const now = root.dataset.ph || 'green';
      const want = order.includes(a[0]) ? a[0] : order[(order.indexOf(now) + 1) % order.length];
      root.dataset.ph = want;
      store.set('ph', want);
      window.EGGS.find('phosphor');
      return print([`PHOSPHOR SET TO ${want.toUpperCase()}. Try COLOR ${order.filter((o) => o !== want).join(', ').toUpperCase()}.`, '']);
    },
    beep: () => { window.SFX.beep(); return print(['\u0007BEEP.', '']); },
    sound: () => { window.SFX.toggle(); return print([window.SFX.muted ? 'SOUND OFF.' : 'SOUND ON. TYPE SOUND AGAIN TO MUTE.', '']); },
    fortune: () => print([`"${esc(FORTUNES[Math.floor(Math.random() * FORTUNES.length)])}"`, '']),
    ping: () => print(['PING ajay (127.0.0.1): 56 data bytes', '64 bytes: icmp_seq=0 time=0.26 ms', '64 bytes: icmp_seq=1 time=0.24 ms', '']),
    games: () => print(['GAMES:', `  ${cmd('bricks', 'BRICKS')}  break out the wall, one brick at a time.`, '']),
    bricks: () => bricks(),
    vim: () => print(['NO SUCH EDITOR ON THIS DISK.', '']),
    emacs: () => COMMANDS.vim(),
    ':q': () => print(['NOTHING TO QUIT.', '']),
    ':wq': () => COMMANDS[':q'](),
    rm: () => print(['PERMISSION DENIED.', '']),
    exit: () => print(['TYPE ERA TO LEAVE.', `  ${cmd('1991', '[ TRAVEL TO 1991 ]')}`, '']),
    reboot: () => { COMMANDS.clear(); return boot(true); },
    logo: () => print([...BANNER.map((l) => [esc(l), 'big']), '']),
    '1983': () => print(['YOU ARE ALREADY IN 1983.', '']),
    era: () => { print(['SHUTTING DOWN. CHOOSE A STARTUP DISK...', '']); setTimeout(() => api.picker(), 600); return Promise.resolve(); },
    '2007': () => { print(['JUMPING AHEAD TO 2007...', '']); setTimeout(() => api.go(3), 450); return Promise.resolve(); },
    '1991': () => { print(['ENGAGING TIME CIRCUITS...', '']); setTimeout(() => api.go(1), 450); return Promise.resolve(); },
    '1998': () => { print(['SKIPPING AHEAD TO 1998...', '']); setTimeout(() => api.go(2), 450); return Promise.resolve(); }
  };

  const lev = (a, b) => {
    const m = a.length, n = b.length;
    const d = Array.from({ length: m + 1 }, (_, i) => [i]);
    for (let j = 1; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  };

  const run = (raw) => {
    const text = raw.trim();
    if (!text) return Promise.resolve();
    let [w, ...args] = text.toLowerCase().split(/\s+/);
    if (/^[1-9]$/.test(w) && !args.length) w = MENU[+w - 1] ? MENU[+w - 1][0] : w;
    if (w === 'hire' || (w === 'hire' && args[0] === 'ajay')) w = 'hire';
    if (text.toLowerCase().startsWith('rm ')) w = 'rm';
    w = ALIASES[w] || w;
    const f = COMMANDS[w];
    if (f) return f(args, text);
    const names = Object.keys(COMMANDS).concat(Object.keys(ALIASES)).filter((n) => /^[a-z]/.test(n));
    const best = names.map((n) => [n, lev(w, n)]).sort((a, b) => a[1] - b[1])[0];
    return print([
      `BAD COMMAND OR FILE NAME: ${esc(w.toUpperCase())}`,
      best && best[1] <= 2 ? `  DID YOU MEAN ${cmd(ALIASES[best[0]] || best[0], (ALIASES[best[0]] || best[0]).toUpperCase())}?` : `  TYPE ${cmd('help', 'HELP')} FOR A LIST.`,
      ''
    ]);
  };

  /* -------------------------------------------------------------- prompt */

  const echo = (text) => {
    out.insertBefore(line(`A:\\&gt; ${esc(text)}`), promptEl());
  };
  /* BRICKS: the wall-breaking game, in characters. A wall of bricks along
     the top, a ball, a paddle on the bottom row: ← and → (or A and D, or
     the mouse, or the on-screen arrows) move it. Every brick is worth a
     point, more for the higher rows; the ball quickens as the wall comes
     down. Three balls. ESC or Q quits. */
  let game = null;
  const bricks = () => new Promise((resolve) => {
    const C = 38, R = 17, ROWS = 5, BW = 3;
    const wall = [...Array(ROWS)].map(() => [...Array(Math.floor(C / BW))].map(() => 1));
    const g = { px: Math.floor(C / 2) - 3, pw: 7, bx: C / 2, by: R - 3, dx: 1, dy: -1, score: 0, lives: 3, tick: 95, t: 0, held: 0, wait: true, over: false };
    const box = document.createElement('div');
    box.className = 'term-game';
    box.innerHTML = `<pre class="tg-field" aria-label="Bricks"></pre><div class="tg-ctl"><button type="button" data-g="-1">&lt;</button><button type="button" data-g="go">LAUNCH</button><button type="button" data-g="1">&gt;</button><button type="button" data-g="q">QUIT</button></div>`;
    out.insertBefore(box, promptEl());
    promptEl().hidden = true;
    scrollDown();
    const pre = box.querySelector('.tg-field');
    const draw = () => {
      const rows = [];
      rows.push('+' + '-'.repeat(C) + '+' + `  SCORE ${String(g.score).padStart(3, '0')}  BALLS ${'O'.repeat(g.lives)}`);
      for (let y = 0; y < R; y++) {
        let line = '';
        for (let x = 0; x < C; x++) {
          let ch = ' ';
          const wy = y - 1;
          if (wy >= 0 && wy < ROWS) { const k = Math.floor(x / BW); if (k < wall[wy].length && wall[wy][k]) ch = x % BW === 0 ? '[' : x % BW === BW - 1 ? ']' : (wy < 2 ? '#' : wy < 4 ? '=' : '-'); }
          if (y === R - 1 && x >= g.px && x < g.px + g.pw) ch = '=';
          if (Math.round(g.by) === y && Math.round(g.bx) === x) ch = 'O';
          line += ch;
        }
        rows.push('|' + line + '|');
      }
      rows.push('+' + '-'.repeat(C) + '+' + (g.over ? '  GAME OVER. LAUNCH TO PLAY AGAIN' : g.wait ? '  ARROWS MOVE, SPACE LAUNCHES' : ''));
      pre.textContent = rows.join('\n');
    };
    const reset = (all) => {
      if (all) { wall.forEach((r) => r.fill(1)); Object.assign(g, { score: 0, lives: 3, tick: 95, over: false }); }
      Object.assign(g, { bx: g.px + g.pw / 2, by: R - 2, dx: Math.random() < 0.5 ? -1 : 1, dy: -1, wait: true });
    };
    const step = () => {
      let nx = g.bx + g.dx, ny = g.by + g.dy;
      if (nx < 0 || nx > C - 1) { g.dx = -g.dx; nx = g.bx + g.dx; window.SFX.key(); }
      if (ny < 0) { g.dy = 1; ny = g.by + g.dy; window.SFX.key(); }
      const wy = Math.round(ny) - 1, k = Math.floor(Math.round(nx) / BW);
      if (wy >= 0 && wy < ROWS && k < wall[wy].length && wall[wy][k]) {
        wall[wy][k] = 0; g.dy = -g.dy; ny = g.by + g.dy;
        g.score += ROWS - wy; g.tick = Math.max(38, g.tick - 1.4); window.SFX.click();
        if (wall.every((r) => r.every((b) => !b))) { wall.forEach((r) => r.fill(1)); g.tick = Math.max(38, g.tick - 10); reset(false); return; }
      }
      if (Math.round(ny) >= R - 1 && g.dy > 0) {
        const hit = Math.round(nx) - g.px;
        if (hit >= -1 && hit <= g.pw) {
          g.dy = -1; ny = R - 2;
          g.dx = hit < 2 ? -1 : hit > g.pw - 3 ? 1 : g.dx;
          window.SFX.detent ? window.SFX.detent() : window.SFX.key();
        } else if (ny > R) {
          g.lives--; window.SFX.error();
          if (g.lives <= 0) { g.over = true; g.wait = true; draw(); return; }
          reset(false); return;
        }
      }
      g.bx = nx; g.by = ny;
    };
    const move = (d) => { g.px = Math.max(0, Math.min(C - g.pw, g.px + d * 2)); if (g.wait && !g.over) g.bx = g.px + g.pw / 2; };
    const launch = () => { if (g.over) { reset(true); return; } g.wait = false; };
    let raf = 0;
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      if (g.held) move(g.held * 0.5);
      if (!g.wait && now - g.t > g.tick) { g.t = now; step(); }
      draw();
    };
    raf = requestAnimationFrame(loop);
    const quit = () => {
      cancelAnimationFrame(raf);
      game = null;
      box.remove();
      promptEl().hidden = false;
      print([`BRICKS: ${g.score} POINTS.${g.score > store.get('bricks-hi', 0) ? ' A NEW HIGH SCORE!' : ` HIGH SCORE: ${store.get('bricks-hi', 0)}.`}`, '']).then(resolve);
      if (g.score > store.get('bricks-hi', 0)) store.set('bricks-hi', g.score);
      focus();
    };
    game = {
      key: (e) => {
        const k = e.key.toLowerCase();
        if (k === 'arrowleft' || k === 'a') { move(-1); return true; }
        if (k === 'arrowright' || k === 'd') { move(1); return true; }
        if (k === ' ' || k === 'enter' || k === 'arrowup') { launch(); return true; }
        if (k === 'escape' || k === 'q') { quit(); return true; }
        return true;
      }
    };
    // The mouse moves the paddle too, and the on-screen buttons can be held.
    pre.addEventListener('pointermove', (e) => {
      const r = pre.getBoundingClientRect(), cw = r.width / (C + 2);
      const x = Math.floor((e.clientX - r.left) / cw) - 1 - Math.floor(g.pw / 2);
      g.px = Math.max(0, Math.min(C - g.pw, x)); if (g.wait && !g.over) g.bx = g.px + g.pw / 2;
    });
    pre.addEventListener('click', launch);
    box.querySelector('.tg-ctl').addEventListener('pointerdown', (e) => {
      const b = e.target.closest('[data-g]'); if (!b) return;
      e.preventDefault(); e.stopPropagation();
      const v = b.dataset.g;
      if (v === 'go') launch(); else if (v === 'q') quit(); else { g.held = +v; move(+v); }
    });
    addEventListener('pointerup', () => { g.held = 0; });
    reset(true);
  });

  const submit = (text, fromClick) => {
    flush();
    echo(text);
    if (text.trim()) { hist.push(text.trim()); hi = hist.length; }
    input.value = '';
    render();
    if (fromClick) window.SFX.click();
    return run(text);
  };
  const render = () => { typedEl.textContent = input.value; scrollDown(); };

  const complete = () => {
    const v = input.value.toLowerCase();
    if (!v || v.includes(' ')) return;
    const all = Object.keys(COMMANDS).filter((n) => /^[a-z]/.test(n) && n.startsWith(v));
    if (all.length === 1) input.value = all[0] + ' ';
    else if (all.length > 1) { flush(); echo(input.value); print([all.map((a) => cmd(a, a.toUpperCase())).join('  '), '']); }
    render();
  };

  /* -------------------------------------------------------------- system */

  const build = (scr, deskApi) => {
    screen = scr;
    api = deskApi;
    root = document.createElement('div');
    root.className = 'term';
    root.dataset.ph = store.get('ph', 'green');
    window.RETRO.contextMenu(root, 'term-ctx', () => [['HELP', () => run('help')], ['ABOUT', () => run('about')], ['WORK', () => run('work')], ['CONTACT', () => run('contact')], '-', ['CLEAR', () => run('clear')], ['ERA', () => run('era')]]);
    root.innerHTML = `
      <div class="term-bar" hidden><span>SOMMI-DOS 3.3 \u00b7 A:\\PORTFOLIO</span><span>TYPE HELP \u00b7 ERA TO SWITCH \u00b7 <button type="button" class="term-snd" data-snd>SOUND OFF</button></span></div>
      <div class="term-out" role="log" aria-live="polite" aria-label="Terminal output">
        <div class="term-prompt"><span>A:\\&gt; </span><span class="typed"></span><span class="term-cursor">&nbsp;</span></div>
      </div>
      <div class="term-chips" role="toolbar" aria-label="Commands"></div>
      <input class="term-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Type a command" />
      <div class="term-wait"><div>${window.ICONS.pxmark(96, true)}SOMMI-83 PERSONAL COMPUTER<br/>BIOS v1.0 \u00b7 (C) 1983<br/><br/>NO SYSTEM DISK.<br/>INSERT PORTFOLIO DISK IN DRIVE A:<br/><span class="blink">\u2588</span></div></div>`;
    scr.appendChild(root);
    out = root.querySelector('.term-out');
    input = root.querySelector('.term-input');
    typedEl = root.querySelector('.typed');
    chips = root.querySelector('.term-chips');
    root.querySelector('.term-prompt').hidden = true;
    chips.hidden = true;
    sizeFont();

    ['help', ...MENU.map((m) => m[0]), 'era'].forEach((c) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = c === 'era' ? 'ERA \u21c4' : c.toUpperCase();
      b.dataset.cmd = c;
      chips.appendChild(b);
    });

    const sndBtn = root.querySelector('[data-snd]');
    const sndLabel = () => { sndBtn.textContent = window.SFX.muted ? 'SOUND OFF' : 'SOUND ON'; };
    sndLabel();
    document.addEventListener('sfx-mute', sndLabel);
    sndBtn.addEventListener('click', (e) => { e.stopPropagation(); window.SFX.toggle(); });
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-cmd]');
      if (b && ready) { submit(b.dataset.cmd, true); focus(); return; }
      if (e.target.closest('a')) return;
      if (!getSelection().toString()) focus();
    });
    input.addEventListener('input', () => { render(); window.SFX.key(); });
    input.addEventListener('focus', () => root.classList.add('has-focus'));
    input.addEventListener('blur', () => root.classList.remove('has-focus'));
    input.addEventListener('keydown', (e) => {
      if (game) { e.preventDefault(); game.key(e); return; }
      if (!ready) { e.preventDefault(); return; }
      if (queue.length) flush();
      if (e.key === 'Enter') { e.preventDefault(); submit(input.value); }
      else if (e.key === 'Tab') { e.preventDefault(); complete(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (hi > 0) { hi--; input.value = hist[hi]; render(); } }
      else if (e.key === 'ArrowDown') { e.preventDefault(); if (hi < hist.length) { hi++; input.value = hist[hi] || ''; render(); } }
      else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); COMMANDS.clear(); }
      else if (e.key === 'c' && e.ctrlKey) { e.preventDefault(); flush(); echo(input.value + '^C'); input.value = ''; render(); }
      else if (e.key === 'PageDown') { out.scrollTop += out.clientHeight * 0.8; }
      else if (e.key === 'PageUp') { out.scrollTop -= out.clientHeight * 0.8; }
      requestAnimationFrame(render);
    });
  };

  const sizeFont = () => {
    const W = innerWidth;
    root.style.setProperty('--tf', Math.max(18, Math.min(30, W / 52)) + 'px');
  };

  const focus = () => { if (ready) input.focus({ preventScroll: true }); };

  const boot = async (fast) => {
    const wait = root.querySelector('.term-wait');
    wait && wait.remove();
    root.querySelector('.term-prompt').hidden = false;
    root.querySelector('.term-bar').hidden = false;
    typedEl.textContent = '';
    ready = false;
    const d = fast ? 0 : 60;
    await print([
      'SOMMI-83 BIOS v1.0',
      'MEMORY TEST ........... 640K OK',
      'DRIVE A: 1.44MB ....... READY',
      'READING PORTFOLIO DISK'
    ], d);
    if (!fast) {
      const bar = line('[' + ' '.repeat(28) + ']');
      out.insertBefore(bar, promptEl());
      for (let i = 1; i <= 28; i++) {
        bar.textContent = '[' + '\u2588'.repeat(i) + ' '.repeat(28 - i) + '] ' + Math.round(i / 28 * 100) + '%';
        if (i % 4 === 0) window.SFX.seek(0, 1);
        await new Promise((r) => setTimeout(r, 38));
      }
    }
    await print(['LOADING SOMMI-DOS 3.3 ...', '', 'A:\\> AUTOEXEC.BAT', ''], d);
    await print(home(), fast ? 0 : 22);
    chips.hidden = false;
    ready = true;
  };

  return {
    build,
    boot,
    enter() { focus(); scrollDown(); },
    leave() { input && input.blur(); },
    resize() { sizeFont(); }
  };
})();
