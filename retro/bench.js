/* ==========================================================================
   Two games for the iPhone, both from things that really happened: bringing
   a 2011 MacBook Pro back with a 2012 board, and keeping an old car going
   past 180,000 miles. Each returns the frame tick gameApp wants. All touches
   arrive at the play area and are read by position, so a part can be dragged
   anywhere and still be let go of.
   ========================================================================== */
window.BENCH = (function () {
  const shuffle = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
  const pick = (a, n) => shuffle(a).slice(0, n);
  const near = (p, x, y, w, h) => p.x > x && p.x < x + w && p.y > y && p.y < y + h;

  /* What every game here shares: positions in the phone's own points, and one
     current job at a time that gets down, move, up and each frame. */
  const stage = (play) => {
    const g = { job: {} };
    const at = (e) => { const r = play.getBoundingClientRect(), k = r.width / 320; return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k }; };
    play.addEventListener('pointerdown', (e) => { try { play.setPointerCapture(e.pointerId); } catch (x) {} g.job.down && g.job.down(at(e), e.target); });
    play.addEventListener('pointermove', (e) => { g.job.move && g.job.move(at(e)); });
    play.addEventListener('pointerup', (e) => { g.job.up && g.job.up(at(e)); });
    play.addEventListener('pointercancel', (e) => { g.job.up && g.job.up(at(e)); });
    return g;
  };
  /* A part that follows the finger from where it was picked up. */
  const grabbable = (el, x, y, onDrop) => {
    let from = null;
    const put = (px, py) => { el.style.transform = `translate(${px}px, ${py}px)`; };
    put(x, y);
    return {
      down(p, t) { if (t === el || el.contains(t)) { from = { dx: p.x - x, dy: p.y - y }; el.classList.add('is-held'); return true; } return false; },
      move(p) { if (from) { x = p.x - from.dx; y = p.y - from.dy; put(x, y); } },
      up(p) { if (!from) return; from = null; el.classList.remove('is-held'); onDrop(p, (nx, ny) => { x = nx; y = ny; el.style.transition = 'transform .18s ease-out'; put(nx, ny); setTimeout(() => { el.style.transition = ''; }, 200); }); }
    };
  };

  /* ------------------------------------------------------------ Laptop Rescue */

  const MAC = { x: 28, y: 92, w: 264, h: 172 };
  const rescue = (play, over, S) => {
    play.innerHTML = `<div class="lr-hud"><b class="lr-n">0 saved</b><span class="lr-str"></span></div><div class="lr-time"><i></i></div><div class="lr-tip"></div>
      <div class="lr-mac"><div class="lr-board"><i class="lr-cpu"></i><i class="lr-ram"></i><i class="lr-ram b"></i></div></div><div class="lr-tools"></div><div class="lr-float"></div>`;
    const q = (s) => play.querySelector(s);
    const macEl = q('.lr-mac'), tools = q('.lr-tools'), tipEl = q('.lr-tip'), bar = q('.lr-time i'), nEl = q('.lr-n'), strEl = q('.lr-str'), float = q('.lr-float');
    const g = stage(play);
    let time = 50, saved = 0, lives = 3, done = false, queue = [], maxT = 50;
    const tip = (s) => { tipEl.textContent = s; tipEl.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 180 }); };
    const lamps = () => { strEl.textContent = '●'.repeat(lives) + '○'.repeat(3 - lives); };
    const pop = (s, bad) => {
      const e = document.createElement('div');
      e.className = 'lr-pop' + (bad ? ' bad' : '');
      e.textContent = s;
      float.appendChild(e);
      e.animate([{ opacity: 0, transform: 'translate(-50%, 8px) scale(.9)' }, { opacity: 1, transform: 'translate(-50%, 0)', offset: .2 }, { opacity: 1, offset: .75 }, { opacity: 0, transform: 'translate(-50%, -14px)' }], { duration: 1000 }).finished.then(() => e.remove());
    };
    const clearJob = () => { macEl.querySelectorAll('.lr-x').forEach((x) => x.remove()); tools.innerHTML = ''; g.job = {}; };
    const add = (cls, style, html = '', host = macEl) => { const e = document.createElement('div'); e.className = 'lr-x ' + cls; if (style) e.style.cssText = style; e.innerHTML = html; host.appendChild(e); return e; };
    const next = () => { clearJob(); if (done) return; const j = queue.shift(); if (j) JOBS[j](); else newMac(); };
    const end = (title, line) => { done = true; clearJob(); over(title, line, saved); };
    const lost = (why) => {
      lives--; lamps();
      S.error && S.error();
      macEl.classList.add('is-dead');
      pop(why, true);
      if (lives <= 0) { setTimeout(() => end('Landfill', `${saved} laptop${saved === 1 ? '' : 's'} saved. It happens: file too far and the board shorts.`), 500); return; }
      setTimeout(newMac, 800);
    };

    const JOBS = {
      /* The case comes off, one screw at a time. */
      screws() {
        tip('Tap each screw to take the case off');
        const lid = add('lr-lid', '', '<span>MacBook Pro</span>');
        const spots = [[12, 12], [126, 8], [240, 12], [12, 148], [126, 152], [240, 148]];
        let left = spots.length;
        spots.forEach(([x, y]) => add('lr-screw', `left:${x}px;top:${y}px`, '', lid));
        g.job.down = (p, t) => {
          if (!t.classList || !t.classList.contains('lr-screw') || t.classList.contains('out')) return;
          t.classList.add('out'); S.click && S.click(); left--;
          if (!left) { lid.classList.add('off'); setTimeout(next, 330); }
        };
      },
      /* Old part out, new part in: the hard drive becomes an SSD. */
      drive() { swap('The hard drive is failing. Drag it out, drop in the SSD', 'lr-hdd', 'HDD', 'lr-ssd', 'SSD', 164, 86, 84, 66); },
      battery() { swap('The battery has swollen. Pull it, seat the new one', 'lr-bat old', 'OLD', 'lr-bat', 'NEW', 14, 96, 136, 58); },
      /* Dried paste is why it runs hot and slows itself down. */
      paste() {
        tip('The paste dried out. Scrub the chip clean');
        const cpu = add('lr-crust', '');
        const bits = [...Array(18)].map((_, i) => add('lr-bit', `left:${3 + (i % 6) * 13}px;top:${3 + Math.floor(i / 6) * 17}px`, '', cpu));
        let left = bits.length, on = false;
        const rub = (p) => {
          bits.forEach((b) => {
            if (b.dataset.gone) return;
            const r = b.getBoundingClientRect(), pr = play.getBoundingClientRect(), k = pr.width / 320;
            if (Math.hypot((r.left + r.width / 2 - pr.left) / k - p.x, (r.top + r.height / 2 - pr.top) / k - p.y) < 18) { b.dataset.gone = 1; b.classList.add('gone'); left--; }
          });
          if (!left && !fresh) { fresh = true; freshPaste(cpu); }
        };
        let fresh = false;
        g.job.down = (p) => { on = true; rub(p); };
        g.job.move = (p) => { if (on) rub(p); };
        g.job.up = () => { on = false; };
        const freshPaste = (box) => {
          tip('Now hold to lay fresh paste. Let go at the line');
          const blob = add('lr-blob', '', '', box), m = add('lr-meter', '', '<i></i><u style="left:62%;width:24%"></u>', tools);
          let hold = false, v = 0;
          g.job = {
            down() { hold = true; },
            up() { if (!hold) return; hold = false; if (v >= .62 && v <= .86) { S.click && S.click(); pop('Good spread'); setTimeout(next, 280); } else { pop(v > .86 ? 'Too much. Wipe and redo' : 'Not enough', true); time -= 1; v = 0; paint(); } },
            tick(dt) { if (hold) { v = Math.min(1, v + dt / 1100); paint(); } }
          };
          const paint = () => { m.firstChild.style.width = v * 100 + '%'; blob.style.transform = `scale(${v})`; };
        };
      },
      /* The real risk: a 2012 board's display connector in a 2011 body. */
      file() {
        tip('The 2012 connector won’t fit. Hold to file it. Stop in green');
        const c = add('lr-conn', '', '<i class="lr-pins"></i><i class="lr-rasp"></i>');
        const m = add('lr-meter big', '', '<i></i><u style="left:68%;width:16%"></u><b style="left:84%;width:16%"></b>', tools);
        add('lr-hold', '', 'HOLD TO FILE', tools);
        const rasp = c.querySelector('.lr-rasp');
        let hold = false, v = 0;
        const paint = () => { m.firstChild.style.width = v * 100 + '%'; c.style.setProperty('--w', 100 - v * 26 + '%'); };
        g.job = {
          down() { hold = true; rasp.classList.add('on'); },
          up() {
            if (!hold) return;
            hold = false; rasp.classList.remove('on');
            if (v >= .68 && v < .84) { pop('It clicked in'); S.click && S.click(); setTimeout(next, 300); }
            else if (v > .3) pop('Not yet. File a bit more', false);
          },
          tick(dt) { if (hold) { v += dt / 1500; paint(); if (v >= .84) { hold = false; g.job = {}; lost('Wore through. Board shorted'); } } }
        };
      },
      /* Powers on, won't boot: back to troubleshooting. */
      probe() {
        tip('It powers on but won’t boot. Probe for the bad part');
        const names = shuffle(['RAM', 'SSD', 'GPU', 'SMC']), bad = names[Math.floor(Math.random() * 4)];
        add('lr-chips', '', names.map((n) => `<button type="button" data-c="${n}"><b>${n}</b><span>?</span></button>`).join(''), tools);
        g.job.down = (p, t) => {
          const b = t.closest && t.closest('[data-c]');
          if (!b || b.dataset.done) return;
          b.dataset.done = 1;
          if (b.dataset.c === bad) { b.querySelector('span').textContent = 'BAD'; b.classList.add('bad'); pop(`Found it: ${bad}`); setTimeout(next, 420); }
          else { b.querySelector('span').textContent = 'OK'; b.classList.add('ok'); time -= 1.5; S.click && S.click(); }
        };
      },
      /* The newest OS was never supported on this model. Install it anyway. */
      install() {
        tip('Now give it a good OS. Pick one');
        macEl.classList.add('is-closed');
        add('lr-disks', '', [['Old OS', 'too old', 0], ['Newest OS', 'unofficial', 1], ['Older OS', 'too old', 0]].sort(() => Math.random() - .5).map(([n, s, ok]) => `<button type="button" data-os="${ok}"><b>${n}</b><span>${s}</span></button>`).join(''), tools);
        let stage2 = false, v = 0, warned = false;
        const go = () => {
          stage2 = true;
          tools.innerHTML = '';
          tip('Installing the OS…');
          const m = add('lr-meter big', '', '<i></i>', tools);
          g.job.tick = (dt) => {
            if (warned === 'wait') return;
            v = Math.min(1, v + dt / 1500);
            m.firstChild.style.width = v * 100 + '%';
            if (v > .45 && !warned) {
              warned = 'wait';
              add('lr-warn', '', '<b>This Mac isn’t supported.</b><button type="button" data-w>Install Anyway</button>', tools);
            }
            if (v >= 1) { g.job = {}; next(); }
          };
        };
        g.job.down = (p, t) => {
          const w = t.closest && t.closest('[data-w]');
          if (w) { warned = true; const x = tools.querySelector('.lr-warn'); if (x) x.remove(); S.click && S.click(); return; }
          const b = t.closest && t.closest('[data-os]');
          if (!b || stage2) return;
          if (b.dataset.os === '1') go();
          else { time -= 1.5; b.classList.add('no'); pop('Too old to be much use', true); }
        };
      },
      /* Into the box and out the door. */
      ship() {
        tip('Good as new. Drag it into the box');
        const box = add('lr-box', '', '<i></i>', tools);
        const dragMac = grabbable(macEl, 0, 0, (p, back) => {
          if (p.y > 300) {
            g.job = {};
            macEl.style.transition = 'transform .3s ease-in, opacity .3s';
            macEl.style.transform = 'translate(0, 240px) scale(.3)';
            macEl.style.opacity = '0';
            box.classList.add('shut');
            saved++;
            nEl.textContent = `${saved} saved`;
            const bonus = Math.max(7, 13 - saved * .5);
            time = Math.min(maxT, time + bonus);
            pop(saved === 1 ? 'One less laptop in a landfill' : `+${Math.round(bonus)}s`);
            S.click && S.click();
            setTimeout(newMac, 520);
          } else back(0, 0);
        });
        g.job = { down: (p, t) => { if (macEl.contains(t)) dragMac.down(p, t); }, move: dragMac.move, up: dragMac.up };
      }
    };
    /* Old part out, new part in. Shared by the drive and the battery. */
    function swap(say, oldCls, oldTxt, newCls, newTxt, bx, by, bw, bh) {
      tip(say);
      const slot = add('lr-slot', `left:${bx}px;top:${by}px;width:${bw}px;height:${bh}px`);
      const oldP = add('lr-part ' + oldCls, `width:${bw}px;height:${bh}px`, oldTxt);
      const trayY = 214 - MAC.y + 60;
      const newP = add('lr-part ' + newCls, `width:${bw}px;height:${bh}px`, newTxt);
      newP.classList.add('is-wait');
      let stage2 = false;
      const a = grabbable(oldP, bx, by, (p, back) => {
        if (!near(p, MAC.x + bx - 6, MAC.y + by - 6, bw + 12, bh + 12)) { oldP.classList.add('gone'); stage2 = true; newP.classList.remove('is-wait'); S.click && S.click(); slot.classList.add('lit'); }
        else back(bx, by);
      });
      const b = grabbable(newP, (264 - bw) / 2, trayY, (p, back) => {
        if (near(p, MAC.x + bx - 24, MAC.y + by - 24, bw + 48, bh + 48)) { back(bx, by); S.click && S.click(); slot.classList.remove('lit'); g.job = {}; setTimeout(next, 240); }
        else back((264 - bw) / 2, trayY);
      });
      g.job = { down: (p, t) => { (stage2 ? b : a).down(p, t); }, move: (p) => (stage2 ? b : a).move(p), up: (p) => (stage2 ? b : a).up(p) };
    }
    function newMac() {
      if (done) return;
      macEl.className = 'lr-mac';
      macEl.style.cssText = '';
      macEl.animate([{ transform: 'translateX(340px)' }, { transform: 'none' }], { duration: 340, easing: 'cubic-bezier(.2,.8,.3,1)' });
      const n = saved < 1 ? 1 : saved < 3 ? 2 : saved < 6 ? 3 : 4;
      queue = ['screws', ...pick(['drive', 'battery', 'paste', 'file', 'probe'], n), 'install', 'ship'];
      next();
    }
    lamps();
    newMac();
    return (dt) => {
      if (done) return;
      time -= dt / 1000;
      bar.style.width = Math.max(0, time / maxT * 100) + '%';
      bar.classList.toggle('low', time < 10);
      if (g.job.tick) g.job.tick(dt);
      if (time <= 0) end('Out of Time', `${saved} laptop${saved === 1 ? '' : 's'} kept out of a landfill.`);
    };
  };

  /* ------------------------------------------------------------ Fix the Car */

  const PROBLEMS = {
    ac: { sym: 'Ninety degrees and the AC is blowing warm', tool: 0 },
    plugs: { sym: 'It’s misfiring. These plugs have never been changed', tool: 1 },
    throttle: { sym: 'Idling rough. Stalling at lights', tool: 2 },
    trans: { sym: 'Grinding, violent shaking, jerky shifts', tool: 3 },
    /* Past 200,000 miles, everything else starts to go too. */
    brakes: { sym: 'Pedal goes soft. Brakes feel spongy', tool: 4, late: 1 },
    battery: { sym: 'Just clicks. Won’t turn over', tool: 5, late: 1 },
    tire: { sym: 'Flat tire. Pulling hard to the right', tool: 6, late: 1 },
    cool: { sym: 'Temp gauge in the red. Steam from the hood', tool: 7, late: 1 }
  };
  const LATE = 200000;
  const car = (play, over, S) => {
    const TOOLS = [
      ['Refrigerant Gauge', 'AC and cooling', 'M4 16a11 11 0 0 1 22 0zM15 16l6-7', 1],
      ['Spark Plug Socket', 'Misfires, power', 'M12 2h6v5h-6zM10 7h10v4H10zM12 11h6v8l-3 5-3-5z'],
      ['Throttle Cleaner', 'Rough idle, stalling', 'M12 2h6v3h-6zM10 5h10l1 3v16H9V8zM2 6l5 2-5 2z'],
      ['Transmission Fluid', 'Gears and shifting', 'M15 2c5 7 8 10 8 14a8 8 0 0 1-16 0c0-4 3-7 8-14z'],
      ['Brake Bleeder', 'Soft pedal, spongy', 'M15 3a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6z'],
      ['Jumper Cables', 'Won’t start', 'M4 4h8v5H4zM18 4h8v5h-8zM7 9h2v6c0 4 3 6 6 6s6-2 6-6V9h2v6c0 5-4 8-8 8s-8-3-8-8z'],
      ['Lug Wrench', 'Flats, wobbles', 'M14 2h2v10h10v2H16v10h-2V14H4v-2h10zM13 11h4v4h-4z'],
      ['Coolant', 'Overheating', 'M11 2h8v3h-8zM9 5h12v4l3 3v12H6V12l3-3zM15 12c3 4 4 5 4 7a4 4 0 0 1-8 0c0-2 1-3 4-7z']
    ];
    play.innerHTML = `<div class="cv-hud"><span class="cv-odo">180,000</span><span class="cv-unit">miles</span><span class="cv-str"></span></div>
      <div class="cv-road"><i class="cv-hills"></i><i class="cv-line"></i>
        <svg class="cv-car" viewBox="50 96 846 290" aria-hidden="true"><defs>
          <linearGradient id="cvBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f6fe0"/><stop offset=".3" stop-color="#1650c8"/><stop offset=".62" stop-color="#0e3fb0"/><stop offset="1" stop-color="#0a2c86"/></linearGradient>
          <linearGradient id="cvGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bfe6f4"/><stop offset=".55" stop-color="#7fb2c6"/><stop offset="1" stop-color="#3f6476"/></linearGradient>
          <radialGradient id="cvRim" cx=".45" cy=".4" r=".65"><stop offset="0" stop-color="#eef1f4"/><stop offset="1" stop-color="#8f979f"/></radialGradient>
        </defs>
        <path d="M70 170 118 174 120 186 72 186z" fill="#0a2a7c"/>
        <path d="M424 106 480 112 478 104 426 100z" fill="#101a2c"/>
        <path d="M62 300C56 268 60 240 68 222L72 186 122 182C172 170 208 148 250 132 316 108 400 102 462 108 524 114 590 148 678 194 736 204 800 222 842 246 872 262 888 282 888 318V338L812 352H150L62 312z" fill="url(#cvBody)"/><circle cx="210" cy="318" r="67" fill="#070b14"/><circle cx="742" cy="322" r="69" fill="#070b14"/><path d="M280 340H670V352H280z" fill="#0a2c86"/>
        <path d="M232 184C238 160 256 140 280 130 330 112 392 108 440 112 500 118 590 162 678 206L424 192 232 184z" fill="#0b1626"/>
        <path d="M238 180C244 162 254 148 268 140L272 182z" fill="url(#cvGlass)"/>
        <path d="M280 182 282 134C320 122 366 118 400 120L408 190z" fill="url(#cvGlass)"/>
        <path d="M432 192 428 122C494 124 586 166 672 206z" fill="url(#cvGlass)"/>
        <path d="M428 118 412 196 418 196 434 118z" fill="#0b1626"/>
        <path d="M594 178C604 174 622 178 624 192L604 202C594 200 588 188 594 178z" fill="#1650c8" stroke="#0a2c86"/>
        <path d="M232 186 244 322M430 196 430 330M654 210 650 332" stroke="#0a2572" stroke-width="2" fill="none"/>
        <path d="M256 206q26-6 54 0v6q-28-5-54 0zM440 216q26-6 54 0v6q-28-5-54 0z" fill="#2a66da" stroke="#0a2572"/>
        <path d="M285 296H650" stroke="#2b6ce2" stroke-width="4" fill="none" opacity=".7"/>
        <path d="M70 192 96 222 92 234 68 232z" fill="#c9262c"/>
        <path d="M804 246C830 248 856 256 870 270L846 268 812 258z" fill="#ffd27a" stroke="#c98a2c"/>
        <path d="M812 346H880L884 322 820 324z" fill="#0a2572"/>
        <path d="M304 276h52v8h-52z" fill="#dfe5ee" opacity=".85"/>
        ${[[210, 318], [742, 322]].map(([x, y]) => `<g transform="translate(${x} ${y})"><g class="cv-wheel"><circle r="60" fill="#14161a"/><circle r="45" fill="url(#cvRim)"/>${[0, 72, 144, 216, 288].map((a) => `<g transform="rotate(${a})"><path d="M-7 -8 -12 -41H-4L0 -10zM7 -8 12 -41H4L0 -10z" fill="#3b4148"/></g>`).join('')}<circle r="9" fill="#4a5058"/><circle r="4" fill="#c7ccd2"/></g></g>`).join('')}</svg>
        <i class="cv-smoke"></i></div>
      <div class="cv-sym"></div><div class="cv-hp"><i></i></div>
      <div class="cv-tools">${TOOLS.map(([n, sub, d], i) => `<button type="button" data-t="${i}"${i > 3 ? ' hidden' : ''}><svg viewBox="0 0 30 26"><path d="${d}" fill="currentColor"/></svg><b>${n}</b><span>${sub}</span></button>`).join('')}</div><div class="cv-fix" hidden></div><div class="lr-float"></div>`;
    const q = (s) => play.querySelector(s);
    const odo = q('.cv-odo'), road = q('.cv-road'), sym = q('.cv-sym'), hpEl = q('.cv-hp i'), fix = q('.cv-fix'), toolsEl = q('.cv-tools'), strEl = q('.cv-str'), float = q('.lr-float');
    const g = stage(play);
    let miles = 180000, lives = 3, cur = null, hp = 1, gap = 2600, done = false, fixes = 0, last = null;
    const lamps = () => { strEl.textContent = '●'.repeat(lives) + '○'.repeat(3 - lives); };
    const pop = (s, bad) => {
      const e = document.createElement('div');
      e.className = 'lr-pop' + (bad ? ' bad' : '');
      e.textContent = s;
      float.appendChild(e);
      e.animate([{ opacity: 0 }, { opacity: 1, offset: .15 }, { opacity: 1, offset: .75 }, { opacity: 0, transform: 'translate(-50%, -12px)' }], { duration: 1200 }).finished.then(() => e.remove());
    };
    /* Older, and things break more often, sometimes one right after another. */
    let late = false;
    const drive = () => { cur = null; g.job = driving; road.classList.remove('stopped', 'hurt'); fix.hidden = true; fix.innerHTML = ''; sym.textContent = 'Running smooth'; sym.classList.remove('bad'); hpEl.parentNode.classList.remove('on'); gap = Math.max(900, 2600 - fixes * 170); if (late) gap = Math.random() < Math.min(.55, (miles - LATE) / 120000 + .2) ? 350 : Math.max(500, gap - (miles - LATE) / 60); };
    const getOld = () => {
      late = true;
      toolsEl.classList.add('many');
      toolsEl.querySelectorAll('[hidden]').forEach((b, i) => { b.hidden = false; b.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }], { duration: 320, delay: i * 90, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'backwards' }); });
      pop('200,000 miles. Everything else starts to go');
    };
    const breakDown = () => {
      if (done) return;
      lives--; lamps();
      S.error && S.error();
      if (lives <= 0) { done = true; g.job = {}; road.classList.add('stopped'); over('Towed', `It made it to ${Math.floor(miles).toLocaleString('en-US')} miles.`, Math.floor(miles)); return; }
      pop('Broke down. Towed home', true);
      drive();
      gap = 2200;
    };
    const fixed = (line) => {
      fixes++;
      miles += 1200;
      S.click && S.click();
      pop(line);
      drive();
    };
    const open = (html, tipText) => { fix.hidden = false; road.classList.add('stopped'); fix.innerHTML = `<div class="cv-ftip">${tipText}</div>${html}`; };
    const REPAIR = {
      /* Low refrigerant: top it up by the gauge. */
      ac() {
        open('<div class="cv-gauge"><i class="zone"></i><i class="needle"></i></div><div class="lr-hold">HOLD TO CHARGE</div>', 'Low refrigerant. Hold to charge. Let go in the green');
        const n = fix.querySelector('.needle');
        let hold = false, v = .12;
        const paint = () => { n.style.transform = `rotate(${-90 + v * 180}deg)`; };
        paint();
        g.job = {
          down() { hold = true; },
          up() { if (!hold) return; hold = false; if (v >= .62 && v <= .8) fixed('Cold air again'); else if (v > .8) { pop('Overcharged. Bleed it off', true); v = .3; paint(); hp -= .15; } },
          tick(dt) { if (hold) { v = Math.min(1, v + dt / 1300); paint(); if (v >= 1) { hold = false; pop('Overcharged. Bleed it off', true); v = .3; paint(); hp -= .15; } } }
        };
      },
      /* Four cylinders, in the order they light up. */
      plugs() {
        open(`<div class="cv-block">${[0, 1, 2, 3].map((i) => `<button type="button" data-p="${i}"><i></i></button>`).join('')}</div>`, 'Swap each worn plug as it lights up');
        const order = shuffle([0, 1, 2, 3]);
        let k = 0;
        const light = () => fix.querySelectorAll('[data-p]').forEach((b) => b.classList.toggle('lit', +b.dataset.p === order[k]));
        light();
        g.job = { down(p, t) {
          const b = t.closest && t.closest('[data-p]');
          if (!b) return;
          if (+b.dataset.p !== order[k]) { hp -= .06; return; }
          b.classList.add('new'); S.click && S.click(); k++;
          if (k === 4) fixed('Firing on all four'); else light();
        } };
      },
      /* A dirty throttle body: hours of troubleshooting, one careful cleaning. */
      throttle() {
        open(`<div class="cv-tb">${[...Array(22)].map((_, i) => { const a = i * 2.4, r = 14 + i * 2.9; return `<i style="left:${90 + Math.cos(a) * r}px;top:${90 + Math.sin(a) * r}px"></i>`; }).join('')}</div>`, 'Rub the carbon off the throttle body');
        const box = fix.querySelector('.cv-tb'), bits = [...box.children];
        let left = bits.length, on = false;
        const rub = (p) => {
          const pr = play.getBoundingClientRect(), k = pr.width / 320;
          bits.forEach((b) => {
            if (b.dataset.g) return;
            const r = b.getBoundingClientRect();
            if (Math.hypot((r.left + r.width / 2 - pr.left) / k - p.x, (r.top + r.height / 2 - pr.top) / k - p.y) < 22) { b.dataset.g = 1; b.classList.add('gone'); left--; }
          });
          if (!left) { g.job = {}; setTimeout(() => fixed('Running noticeably better'), 180); }
        };
        g.job = { down(p) { on = true; rub(p); }, move(p) { if (on) rub(p); }, up() { on = false; } };
      },
      /* Air in the lines: pump the pedal until the bubbles are gone. */
      brakes() {
        open(`<div class="cv-brk"><div class="cv-line2">${[...Array(8)].map(() => '<i></i>').join('')}</div><button type="button" class="cv-pedal" data-b>PUMP</button></div>`, 'Air in the brake lines. Pump the pedal to bleed it out');
        const bubbles = [...fix.querySelectorAll('.cv-line2 i')];
        let n = bubbles.length;
        g.job = { down(p, t) { if (!(t.closest && t.closest('[data-b]'))) return; const b = fix.querySelector('.cv-pedal'); b.animate([{ transform: 'translateY(6px) scaleY(.92)' }, { transform: 'none' }], { duration: 160 }); n--; bubbles[n].classList.add('gone'); S.key && S.key(); if (!n) { g.job = {}; setTimeout(() => fixed('Firm pedal. Stops on a dime'), 200); } } };
      },
      /* Red to the dead battery first, black last, or it sparks. */
      battery() {
        open('<div class="cv-bat"><div class="cv-cell"><button type="button" data-c="0" class="pos">+</button><button type="button" data-c="1" class="neg">−</button><b>12V</b></div><div class="cv-clamps"><span class="red">RED</span><span class="blk">BLACK</span></div></div>', 'Dead battery. Red clamp on + first, then black on −');
        let k = 0;
        g.job = { down(p, t) {
          const b = t.closest && t.closest('[data-c]');
          if (!b) return;
          if (+b.dataset.c !== k) { hp -= .2; S.error && S.error(); pop('Sparks! Red goes on first', true); fix.querySelector('.cv-cell').animate([{ boxShadow: '0 0 0 6px #ffe16b' }, { boxShadow: '0 0 0 0 transparent' }], { duration: 300 }); return; }
          b.classList.add('on'); S.click && S.click(); k++;
          if (k === 2) { g.job = {}; setTimeout(() => fixed('Vroom. Started right up'), 260); }
        } };
      },
      /* Five lug nuts, loosened in a star so the wheel comes off true. */
      tire() {
        open(`<div class="cv-hub">${[0, 1, 2, 3, 4].map((i) => { const a = -Math.PI / 2 + i * Math.PI * 2 / 5; return `<button type="button" data-l="${i}" style="left:${80 + Math.cos(a) * 52}px;top:${80 + Math.sin(a) * 52}px"></button>`; }).join('')}<i></i></div>`, 'Loosen the lug nuts in a star, as each lights up');
        const order = [0, 2, 4, 1, 3];
        let k = 0;
        const light = () => fix.querySelectorAll('[data-l]').forEach((b) => b.classList.toggle('lit', +b.dataset.l === order[k]));
        light();
        g.job = { down(p, t) {
          const b = t.closest && t.closest('[data-l]');
          if (!b) return;
          if (+b.dataset.l !== order[k]) { hp -= .06; return; }
          b.classList.add('off'); S.click && S.click(); k++;
          if (k === 5) { g.job = {}; setTimeout(() => fixed('Spare’s on. Back on the road'), 200); } else light();
        } };
      },
      /* Never open a hot radiator: wait for it to cool, then top it up. */
      cool() {
        open('<div class="cv-pan"><div class="cv-temp"><i class="t"></i><span>HOT</span></div><div class="cv-oil cv-cool"><i class="lvl"></i><i class="mark"></i></div></div><div class="lr-hold">WAIT FOR IT TO COOL</div>', 'Overheating. Let it cool before you open the cap');
        const lvl = fix.querySelector('.lvl'), hold = fix.querySelector('.lr-hold'), temp = fix.querySelector('.cv-temp .t'), tl = fix.querySelector('.cv-temp span');
        let heat = 1, v = .25, on = false;
        const paint = () => { lvl.style.height = v * 100 + '%'; temp.style.height = heat * 100 + '%'; };
        paint();
        g.job = {
          down() { if (heat > .35) { hp -= .14; S.error && S.error(); pop('Too hot! Wait', true); return; } on = true; },
          up() { if (!on) return; on = false; if (v >= .68 && v <= .84) fixed('Temp’s back in the middle'); else if (v > .84) { pop('Overfilled. Drain some', true); v = .4; paint(); hp -= .12; } },
          tick(dt) {
            if (heat > .3) { heat = Math.max(.3, heat - dt / 3200); if (heat <= .35) { tl.textContent = 'COOL'; temp.classList.add('cool'); hold.textContent = 'HOLD TO FILL'; } }
            if (on) { v = Math.min(1, v + dt / 1300); if (v >= 1) { on = false; pop('Overfilled. Drain some', true); v = .4; hp -= .12; } }
            paint();
          }
        };
      },
      /* Never changed in 180,000 miles: pull the plug, see the shavings, refill. */
      trans() {
        open('<div class="cv-pan"><button type="button" class="cv-drain" data-d>Pull drain plug</button><div class="cv-oil"><i class="lvl dirty"></i><i class="mark"></i></div></div><div class="lr-hold" hidden>HOLD TO FILL</div>', 'The fluid’s never been changed. Pull the drain plug');
        const lvl = fix.querySelector('.lvl'), hold = fix.querySelector('.lr-hold'), ftip = fix.querySelector('.cv-ftip');
        let v = .9, step = 0, on = false;
        const paint = () => { lvl.style.height = v * 100 + '%'; };
        paint();
        g.job = {
          down(p, t) {
            if (step === 0 && t.closest && t.closest('[data-d]')) { step = 1; S.click && S.click(); fix.querySelector('.cv-drain').textContent = 'Magnet: coated in metal'; ftip.textContent = 'Burnt, black, full of shavings. Let it drain'; }
            else if (step === 2) on = true;
          },
          up() { if (!on) return; on = false; if (v >= .68 && v <= .84) fixed('Buttery smooth. Saved $2,000'); else if (v > .84) { pop('Overfilled. Drain some', true); v = .4; paint(); hp -= .12; } },
          tick(dt) {
            if (step === 1) { v -= dt / 900; if (v <= .05) { v = .05; step = 2; lvl.classList.remove('dirty'); fix.querySelector('.cv-drain').hidden = true; hold.hidden = false; ftip.textContent = 'Now refill. Let go at the mark'; } paint(); }
            if (step === 2 && on) { v = Math.min(1, v + dt / 1300); paint(); if (v >= 1) { on = false; pop('Overfilled. Drain some', true); v = .4; paint(); hp -= .12; } }
          }
        };
      }
    };
    const driving = {
      down(p, t) {
        const b = t.closest && t.closest('[data-t]');
        if (!b) return;
        if (!cur) { pop('Nothing wrong. Keep driving'); return; }
        if (+b.dataset.t !== PROBLEMS[cur].tool) { hp -= .22; toolsEl.classList.add('no'); setTimeout(() => toolsEl.classList.remove('no'), 180); S.error && S.error(); pop('That’s not it', true); return; }
        S.click && S.click();
        REPAIR[cur]();
      }
    };
    g.job = driving;
    lamps();
    let sinceLine = 0;
    return (dt) => {
      if (done) return;
      const inFix = !fix.hidden;
      if (!inFix) {
        const ratio = cur ? .55 : 1;
        miles += dt * .55 * ratio * (1 + fixes * .06);
        if (!late && miles >= LATE) getOld();
        sinceLine += dt;
        if (sinceLine > 90) { sinceLine = 0; odo.textContent = Math.floor(miles).toLocaleString('en-US'); }
      } else odo.textContent = Math.floor(miles).toLocaleString('en-US');
      if (g.job.tick) g.job.tick(dt);
      if (!cur) {
        gap -= dt;
        if (gap <= 0) {
          const keys = Object.keys(PROBLEMS).filter((k) => k !== last && (late || !PROBLEMS[k].late));
          cur = last = keys[Math.floor(Math.random() * keys.length)];
          hp = 1;
          sym.textContent = PROBLEMS[cur].sym;
          sym.classList.add('bad');
          hpEl.parentNode.classList.add('on');
          road.classList.add('hurt');
          sym.animate([{ transform: 'scale(1.08)' }, { transform: 'none' }], { duration: 220 });
        }
      } else {
        if (!inFix) hp -= dt / Math.max(5200, 11000 - fixes * 420);
        else hp -= dt / 42000;
        hpEl.style.width = Math.max(0, hp * 100) + '%';
        if (hp <= 0) breakDown();
      }
    };
  };

  return { rescue, car };
})();
