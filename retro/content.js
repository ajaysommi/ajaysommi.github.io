/* ==========================================================================
   Everything the retro machines say, in one place. Each machine (the 1983
   terminal, the 1991 desktop, the 1998 browser and the pocket device on
   phones) draws the same facts in its own idiom, so a fact changes here once.
   ========================================================================== */
window.PORTFOLIO = (function () {
  const J = 'assets/images/journey/';
  const O = 'assets/images/offclock/';

  return {
    name: 'Ajay Sommi',
    title: 'Software Engineer',
    email: 'ajaysommi7@gmail.com',
    github: 'https://github.com/ajaysommi',
    linkedin: 'https://www.linkedin.com/in/ajay-sommi/',
    resume: 'Ajay_Sommi_Resume.pdf',
    photo: 'assets/images/opt/hero-480.webp',
    kidPhoto: 'assets/images/offclock/kid-2006-crop.webp',
    citizen: 'U.S. Citizen',

    about: [
      "Welcome. I'm Ajay, glad you're here.",
      "I’m a software engineer and a problem solver at heart. As our tools become more intelligent and capable, I think good problem solving matters more, not less. I keep learning what each problem needs while staying focused on the person using it. I care about experiences that feel thoughtful, reliable, secure, and genuinely good to use."
    ],

    quote: "I hope I never run out of things I don’t understand.",

    experience: [
      {
        id: 'rjax', short: 'Renaissance Jax', year: 2019,
        org: 'Renaissance Jax', role: 'Software Developer',
        when: 'Sep 2019 to Feb 2020', where: 'Jacksonville, FL',
        text: "Gave a competition robot the ability to line itself up on its own. I wrote the vision code that spotted targets by color mid match, so the robot could aim without the driver doing it by hand, and kept the cameras, wiring and code working together all season. My first time writing code that had to work in the real world, not just on a laptop.",
        stats: [],
        tags: ['C++', 'Computer Vision', 'Git'],
        photos: [J + 'renaissance-jax-480.webp', J + 'rjax-sensor-480.webp', J + 'rjax-code-480.webp']
      },
      {
        id: 'shiva', short: 'Shiva Robotics', year: 2020,
        org: 'Shiva Robotics Academy', role: 'SEO Analyst',
        when: 'Jun 2020 to Jul 2020', where: 'Remote',
        text: "Grew search visits to the academy's site by 20% in one summer, so more families looking for robotics classes actually found it. I studied what people were searching for, rewrote the parts of the site search engines read, and checked the numbers every week to see what was working.",
        stats: [],
        tags: ['Analytics', 'SEO'],
        photos: []
      },
      {
        id: 'rfa', short: 'Robotics For All', year: 2022,
        org: 'Robotics For All', role: 'Software Engineering Intern',
        when: 'Mar 2022 to Jan 2023', where: 'Palo Alto, CA',
        text: "Gave volunteers back hours every week. They were copying sign up details between forms and spreadsheets by hand, so I wrote scripts that filed each family's information automatically and sent the confirmation emails. Fewer typos, faster replies to parents, and the start of a habit: finding manual work and making it run on its own.",
        stats: [],
        tags: ['JavaScript', 'Google Apps Script', 'Automation'],
        photos: []
      },
      {
        id: 'fics', short: 'FICS @ UF', year: 2023,
        org: 'Florida Institute for Cybersecurity Research', role: 'AI Cybersecurity Researcher',
        when: 'May 2023 to May 2024', where: 'Gainesville, FL',
        text: "Helped find the weak spots in AI chatbots before bad actors could. I built tools that automatically tested ChatGPT with inputs designed to make it misbehave, kept a catalogue of the failures we could reliably repeat, and worked on ways to detect and block them, running some of the experiments on HiPerGator, UF's supercomputer. Early, hands on experience with how AI can fail.",
        stats: [],
        tags: ['Python', 'LLM Security', 'Research'],
        photos: [J + 'fics-terminal-400.webp']
      },
      {
        id: 'toyota', short: 'Toyota', year: 2024,
        org: 'Southeast Toyota Distributors', role: 'Software Engineering Intern',
        when: 'Jun 2024 to Aug 2024', where: 'Jacksonville, FL',
        text: "Helped cut tire warranty claims by 20% and save over $150k by catching costly tire package recalls before they happened. I analyzed tire data for 51,000 vehicles into 21 reports, automated a file transfer that saved about 350 hours a year, and replaced a manual spreadsheet with a live dashboard that made data entry 5× faster.",
        stats: [['20%', 'fewer warranty claims'], ['$150k', 'saved on prevented tire recalls'], ['5×', 'faster data entry']],
        tags: ['Python', 'SQL', 'Azure Blob', 'Amazon RDS', 'Power BI', 'VBA'],
        photos: [J + 'toyota-sign-400.webp', J + 'toyota-vpc-lexus-400.webp', J + 'toyota-road-force-400.webp']
      },
      {
        id: 'jm', short: 'JM Family', year: 2025,
        org: 'JM Family Enterprises', role: 'Software Engineering Intern',
        when: 'May 2025 to Nov 2025', where: 'Deerfield Beach, FL',
        text: "Made it easier to spot employees with the wrong system access. I built an automated check in Azure that compared each person's access across Microsoft Graph, Salesforce and MuleSoft, flagged anything that didn't match company policy, and produced exception reports. I also built a service that analyzed 100k+ events from JM Lexus and Toyota dealership systems, and helped set up GPT agents to answer questions about that data.",
        stats: [],
        tags: ['Azure Functions', 'C#/.NET', 'Microsoft Graph', 'Salesforce', 'MuleSoft', 'App Insights', 'MCP', 'RAG'],
        photos: [J + 'jm-campus-400.webp', J + 'jm-interns-400.webp', J + 'jm-showroom-400.webp', J + 'jm-jet-400.webp', J + 'jm-axe-400.webp']
      },
      {
        id: 'hunter', short: 'Hunter Engineering', year: 2026,
        org: 'Hunter Engineering Company', role: 'Software Engineering Co-op, R&D',
        when: 'Jan 2026 to May 2026', where: 'St. Louis, MO',
        text: "Made it possible to reset Hunter's alignment machines remotely instead of sending someone out, across more than 100,000 units worldwide. I designed and built the secure reset workflow myself, in C#/.NET and Blazor on Azure IoT Hub. I also fixed crashes that hit during machine setup, and moved the tests to a safer framework that removed a security and privacy risk.",
        stats: [['100,000+', 'units reachable worldwide'], ['Moq → NSubstitute', 'across an enterprise codebase']],
        tags: ['C#/.NET', 'Blazor', 'Azure IoT Hub', 'IoT Edge', 'NSubstitute', 'Docker'],
        photos: [J + 'hunter-sign-400.webp', J + 'hunter-shop-400.webp', J + 'hunter-axe-400.webp', J + 'hunter-jump-400.webp']
      },
      {
        id: 'adt', short: 'ADT', year: 2026,
        org: 'ADT', role: 'Software Engineering Intern',
        when: 'May 2026 to Oct 2026', where: 'Boca Raton, FL',
        text: "Designed an AI check to catch false alarms before emergency responders are sent out, and presented it to senior leadership. On ADT's Salesforce platform I cleaned up data to keep it under platform limits, brought test coverage back up so releases could ship, and used AI tools like Claude and Cursor to work through a large codebase faster.",
        stats: [['False alarms', 'AI dispatch check, pitched to leadership'], ['Under the cap', 'metadata folded into Custom Objects'], ['Coverage', 'Apex tests back above the deploy bar']],
        tags: ['Salesforce', 'Apex', 'Custom Objects', 'Cursor', 'Claude + MCP', 'AI'],
        photos: [J + 'adt-hq-400.webp', J + 'adt-jump-400.webp', J + 'adt-interns-400.webp', J + 'adt-stage-400.webp', J + 'adt-sign-400.webp']
      }
    ],

    education: {
      school: 'University of Florida',
      degree: 'B.S. in Computer Science',
      college: 'Herbert Wertheim College of Engineering',
      when: 'December 2026',
      text: "Earned the University of Florida AI Certificate, with coursework spanning operating systems, databases, data structures and algorithms, software engineering, artificial intelligence, and cybersecurity.",
      tags: ['AI Certificate', 'Operating Systems', 'Databases', 'Algorithms'],
      logo: 'assets/images/uf-gator-320.webp'
    },

    projects: [
      {
        id: 'sommiscript', name: 'SommiScript', full: 'SommiScript: Lightweight Programming Language',
        kind: 'Language', stack: 'Java / Language Design / Interpreters', lang: 'Java',
        text: "Built a custom scripting language with Python/JavaScript-inspired syntax and a lightweight Java interpreter, making it easy to experiment with language design and execution.",
        url: 'https://github.com/ajaysommi/SommiScript'
      },
      {
        id: 'betai', name: 'BetAI', full: 'BetAI Marketplace',
        kind: 'AI platform', stack: 'Python / FastAPI / Next.js / Supabase', lang: 'Python',
        text: "AI sports betting platform built on an NFL betting model, being turned into a marketplace where users build their own models, prove them against historical data, and sell access to their live picks.",
        url: ''
      },
      {
        id: 'gatorgoods', name: 'GatorGoods', full: 'GatorGoods Marketplace',
        kind: 'Full-stack', stack: 'MongoDB / Express / React / Node', lang: 'React',
        text: "Full-stack MERN app for UF students to buy and sell items, with secure authentication, listings, and a clean API-first design.",
        url: 'https://github.com/ajaysommi/GatorGoods'
      },
      {
        id: 'crash', name: 'Crash Analysis', full: 'Crash Fatality Analysis',
        kind: 'Data science', stack: 'Python / Pandas / Visualization', lang: 'Python',
        text: "Interactive analysis of vehicle fatality data (1996 to 2022), uncovering safety trends by make, model, and year to reveal gaps in official ratings.",
        url: 'https://github.com/ajaysommi/Car-Crash-Analyzation-Tool'
      },
      {
        id: 'avl', name: 'BalanceTree', full: 'BalanceTree (AVL)',
        kind: 'Algorithms', stack: 'C++ / Data Structures', lang: 'C++',
        text: "Self-balancing AVL tree with insert, delete, and lookup operations, optimized for performance and correctness.",
        url: 'https://github.com/ajaysommi/BalanceTree'
      },
      {
        id: 'wadfs', name: 'WAD FS', full: 'Custom WAD File System with FUSE Integration',
        kind: 'Systems', stack: 'C++ / FUSE / File Systems', lang: 'C++',
        text: "Implemented a file system in C++ from scratch, supporting directories and files inside WAD archives. Integrated with FUSE so it can be mounted and browsed like a real OS file system.",
        url: ''
      }
    ],

    offclock: [
      {
        id: 'electronics', name: 'Electronics', title: 'Learning electronics by building (and breaking)',
        lede: "It started with one screen saying hello, and turned into a habit of opening things up to see how they work, including one lesson about heat I learned the hard way.",
        cover: O + 'ard-tool-480.webp',
        steps: [
          [O + 'ard-lcd-480.webp', 'Hello, world.', 'My first real Arduino circuit. Wired it up, flashed it, and the screen said hello back.'],
          [O + 'ard-drive-480.webp', 'The dead drive.', "I hooked an old hard drive up to my laptop to recover its data. It wouldn't power on, and the problem looked like the board itself."],
          [O + 'ard-tool-480.webp', 'The homemade soldering iron.', "Fixing that board meant soldering, and I didn't own an iron, so I built one: pencil lead, an old phone charger and wrapped wire. It got hot. So did my fingers."],
          [O + 'diag-humidifier-480.webp', 'Why did it stop?', 'Our dehumidifier died, so I took it apart to find out how it actually works. A crash course in Peltier cooling and thermodynamics.'],
          [O + 'ard-laptop-480.webp', 'Just for fun.', 'Bored one day, I gutted an old laptop nobody at home was using anymore and gave myself one goal: get the smallest operating system I could find running on it. No reason. Just curiosity.'],
          [O + 'ard-desk-480.webp', 'The idea.', 'College group project: pick an idea and build it. Ours was a toilet lid that opens on its own when you walk up.'],
          [O + 'ard-servo-480.webp', 'The prototype.', 'Our working prototype: walk up and the lid lifts, over a bowl we 3D printed.']
        ]
      },
      {
        id: 'macbook', name: 'MacBook', title: 'Bringing a MacBook back from the dead',
        lede: "It started with a dead memory slot on my 2011 MacBook Pro's board. Rather than settle for a repair, I put a 2012 logic board in the 2011 body, something it was never built to take, shaved down a connector to make it fit and tracked down why it wouldn't boot. It came back as a 2012, faster graphics and memory included, now running a macOS Apple never released for it.",
        cover: O + 'mac-paste-480.webp',
        steps: [
          [O + 'mac-open-480.webp', 'Gutted.', 'Everything out. The hard drive became an SSD and the battery was replaced.'],
          [O + 'mac-paste-480.webp', 'Fresh paste.', "Thermal paste is what carries heat off the processor. Years old, it had dried out, and a chip that can't shed heat runs hot and slows itself down. I took the board out, cleaned the old paste off and put fresh paste on."],
          [O + 'mac-clean-480.webp', 'Making it fit.', "The 2012 board was never meant to go in a 2011 body, and its display connector simply didn't fit. So I literally took a sheet of sandpaper and filed the connector's edges down by hand, a little at a time. File too far and I'd wear through the insulation and short the board, or crack the fragile connector for good. It clicked in."],
          [O + 'mac-boot-480.webp', 'Stuck at boot.', "First attempt: it powered on but wouldn't boot properly, so it was back to troubleshooting to track down the fault."],
          [O + 'mac-sonoma-480.webp', 'It boots.', 'With the fault fixed, it came up as a 2012. Then I went one step further and unofficially installed macOS Sonoma, a version Apple never supported on this model. One less laptop in a landfill.']
        ]
      },
      {
        id: 'civic', name: 'The Civic', title: 'Working on my own car',
        lede: "A 2007 Honda Civic closing in on 200,000 miles, and a habit of trying the fix myself before calling in a mechanic. Every repair started the same way: a symptom, hours of research and tutorials, then doing it myself until it worked.",
        cover: O + 'diag-goggles-480.webp',
        steps: [
          [O + 'diag-goggles-480.webp', 'AC out, mid summer.', 'The AC quit in the middle of summer. Ninety degree heat, a low pressure refrigerant gauge and an electrical check on the compressor clutch, working through it one tutorial at a time.'],
          [O + 'civic-plug-480.webp', 'First engine work.', 'My first time working inside an engine. This is what a spark plug looks like after almost 200,000 miles.'],
          [O + 'civic-throttle-480.webp', 'Running rough.', 'The engine was running rough. Hours of troubleshooting, well past midnight, came down to a dirty throttle body. One careful cleaning later, it was running noticeably better.'],
          [O + 'civic-magnet-480.webp', 'What 180,000 miles leaves behind.', 'The transmission had never had its fluid changed. Grinding, violent shaking, jerky shifts and a transmission code. When the drain plug came out, its magnet was coated in burnt black sludge: raw metal shavings from inside the transmission.'],
          [O + 'civic-fluid-480.webp', 'Fresh fluid.', 'After weeks of research, a drain and fill with fresh fluid. It shifted buttery smooth again, and I saved about $2,000.']
        ]
      }
    ],

    skills: [
      ['Programming', ['C#', 'C++', 'Python', 'Java', 'JavaScript', 'TypeScript', 'SQL', 'HTML & CSS', 'ARM Assembly', 'VBA', 'DAX']],
      ['Cloud, Data & Databases', ['Microsoft Azure', 'Azure Blob Storage', 'Amazon RDS', 'Oracle', 'Pandas', 'TensorFlow', 'KQL', 'Power BI']],
      ['Frameworks & Libraries', ['.NET', 'React', 'Next.js', 'Node.js', 'Chart.js', 'Tkinter']],
      ['APIs & Integration', ['REST APIs', 'JSON', 'Salesforce (Apex/LWC)']],
      ['DevOps & Tooling', ['Git', 'Azure DevOps', 'Containerization', 'Docker', 'GitHub Actions', 'JetBrains IDEs', 'GDB', 'Google Apps Script']],
      ['Soft Skills', ['Agile', 'Problem-solving', 'Teamwork', 'Communication', 'Time management', 'Precision']]
    ],

    recs: [
      ['Barbara Russo', 'JM Family', "Ajay consistently exceeded expectations … always open to feedback, eager to learn, and quick to offer fresh ideas … I highly recommend him to any organization seeking a talented and dedicated professional."],
      ['Branden Martinelli', 'Hunter Engineering', "Ajay has done a wonderful job at Hunter Engineering as a co-op. He did a full design of a feature to implementation with minimal guidance and excelled at every task given to him. He was instrumental in delivering value to our team and exceeded expectations of a co-op."],
      ['Daniel Donaldson', 'Southeast Toyota', "Ajay created automation that moved quality assessment data into our repository and built reports that made a real impact for our team. His focus and resolve helped us make significant progress."],
      ['Saleem Nashawaty', 'JM Family', "I had the pleasure of mentoring Ajay during his internship at JM Family, and he consistently impressed me with his strong work ethic and eagerness to learn … Any team would be fortunate to have him!"],
      ['Naman Goyal', 'Southeast Toyota', "Ajay consistently demonstrated enthusiasm, determination, and strong data skills. His grasp of data structures and proficiency with Microsoft Power Suite significantly contributed to our project's success."],
      ['Preston Misemer', 'Hunter Engineering', "Ajay was a diligent and focused software developer in his time at Hunter Engineering. He was open to feedback, enthusiastic to learn new technologies, and thoughtful in his approach to design and problem solving."],
      ['Andrew Butzel', 'Hunter Engineering', "I was lucky enough to have Ajay as a fellow co-op during my time as a data science co-op at Hunter Engineering. Throughout, he was a great team player and demonstrated a variety of strong skills in programming and software engineering. Any company would be lucky to have him in the future!"],
      ['Garrett Tieng', 'Robotics For All', "Ajay was a key member of our software team, taking ownership of projects and bridging knowledge gaps. His backend automation streamlined how parent and student information is ingested."],
      ['Valeria Pinatelli', 'Robotics For All', "Ajay demonstrated exceptional software engineering skills and a proactive, problem-solving approach. He delivered high-quality work and collaborated effectively across the team."]
    ]
  };
})();

/* Small helpers every machine shares. */
window.RETRO = (function () {
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* Where a skill shows up in the roles, by its name or the first word of it. */
  const usedAt = (skill) => {
    const k = skill.toLowerCase().replace(/[()]/g, '').split(/[ /]/)[0];
    if (k.length < 2) return [];
    return window.PORTFOLIO.experience
      .filter((e) => e.tags.some((t) => t.toLowerCase().includes(k)) || (k.length > 3 && e.text.toLowerCase().includes(k)))
      .map((e) => e.short);
  };

  /* Atkinson dithering, after Bill Atkinson's own: each pixel's error goes
     to six neighbours, an eighth each, and the last quarter is dropped,
     which is what gives it that crisp, slightly bright look. Returns a
     data URL of a 1-bit picture, cached per source and width. */
  const cache = new Map();
  const dither = (src, width) => new Promise((resolve) => {
    const key = src + '@' + width;
    if (cache.has(key)) return resolve(cache.get(key));
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      const w = Math.max(16, Math.round(width));
      const h = Math.max(16, Math.round(img.naturalHeight * (w / img.naturalWidth)));
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const x = c.getContext('2d', { willReadFrequently: true });
      x.drawImage(img, 0, 0, w, h);
      let d;
      try { d = x.getImageData(0, 0, w, h); } catch (e) { cache.set(key, src); return resolve(src); }
      const p = d.data;
      const g = new Float32Array(w * h);
      for (let i = 0; i < w * h; i++) {
        /* A little contrast first, so faces do not wash out. */
        const l = 0.299 * p[i * 4] + 0.587 * p[i * 4 + 1] + 0.114 * p[i * 4 + 2];
        g[i] = Math.min(255, Math.max(0, (l - 128) * 1.08 + 134));
      }
      const spread = [[1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [0, 2]];
      for (let yy = 0; yy < h; yy++) {
        for (let xx = 0; xx < w; xx++) {
          const i = yy * w + xx;
          const v = g[i] < 128 ? 0 : 255;
          const err = (g[i] - v) / 8;
          g[i] = v;
          for (const [dx, dy] of spread) {
            const nx = xx + dx, ny = yy + dy;
            if (nx >= 0 && nx < w && ny < h) g[ny * w + nx] += err;
          }
        }
      }
      for (let i = 0; i < w * h; i++) {
        const v = g[i] > 127 ? 255 : 0;
        p[i * 4] = p[i * 4 + 1] = p[i * 4 + 2] = v; p[i * 4 + 3] = 255;
      }
      x.putImageData(d, 0, 0);
      const url = c.toDataURL('image/png');
      cache.set(key, url);
      resolve(url);
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });

  /* Fills every <img data-dither="src"> under root with its 1-bit version. */
  const ditherAll = (root) => {
    root.querySelectorAll('img[data-dither]').forEach((im) => {
      const src = im.getAttribute('data-dither');
      const w = +im.getAttribute('data-dw') || 240;
      im.removeAttribute('data-dither');
      dither(src, w).then((u) => { im.src = u; im.classList.add('is-dithered'); });
    });
  };

  /* Turns a picture into rows of characters, darkest to lightest. */
  const ascii = (src, cols, k = 0.5) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ramp = '@%#*+=-:. ';
      const w = cols, h = Math.round(img.naturalHeight / img.naturalWidth * cols * k);
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const x = c.getContext('2d', { willReadFrequently: true });
      x.drawImage(img, 0, 0, w, h);
      let d;
      try { d = x.getImageData(0, 0, w, h).data; } catch (e) { return resolve(''); }
      let out = '';
      for (let yy = 0; yy < h; yy++) {
        for (let xx = 0; xx < w; xx++) {
          const i = (yy * w + xx) * 4;
          const l = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
          const k = Math.min(ramp.length - 1, Math.max(0, Math.round(Math.pow(l, 1.1) * (ramp.length - 1))));
          /* On a dark screen bright pixels should be dense characters. */
          out += ramp[ramp.length - 1 - k];
        }
        out += '\n';
      }
      resolve(out);
    };
    img.onerror = () => resolve('');
    img.src = src;
  });

  const store = {
    get(k, d) { try { const v = localStorage.getItem('retro-' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('retro-' + k, JSON.stringify(v)); } catch (e) {} }
  };

  /* The space a phone really has: the small viewport height (browser bars
     showing, as svh measures it) minus the safe areas, the same allowance
     the main site makes for a bottom toolbar. */
  let probe = null;
  const viewport = () => {
    if (!probe) {
      probe = document.createElement('div');
      probe.setAttribute('aria-hidden', 'true');
      probe.style.cssText = 'position:fixed;left:0;top:0;width:100vw;height:100svh;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);box-sizing:border-box';
      document.body.appendChild(probe);
    }
    /* Turned sideways, the page is drawn upright across the long side. */
    if (turned()) { const vv = window.visualViewport; return { w: vv ? vv.height : innerHeight, h: vv ? vv.width : innerWidth, top: 0 }; }
    const cs = getComputedStyle(probe);
    const h = Math.min(probe.offsetHeight || innerHeight, window.visualViewport ? visualViewport.height : innerHeight) - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const w = (window.visualViewport ? visualViewport.width : innerWidth) - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    return { w, h, top: parseFloat(cs.paddingTop) };
  };

  /* Follow the visible viewport as browser bars come and go: the phone
     host is sized to it, and anything that fits itself listens for
     retro-fit. */
  /* A phone turned on its side stays upright: the whole page is rotated
     back a quarter turn against the turn, so nothing reflows into a
     landscape (or desktop) layout. */
  const turned = () => document.documentElement.classList.contains('is-turned');
  const sync = () => {
    const vv = window.visualViewport, root = document.documentElement, r = root.style;
    const W = vv ? vv.width : innerWidth, H = vv ? vv.height : innerHeight;
    const side = root.dataset.mode === 'mobile' && matchMedia('(pointer: coarse)').matches && W > H;
    root.classList.toggle('is-turned', side);
    if (side) {
      const a = screen.orientation ? screen.orientation.angle : (window.orientation || 90);
      root.dataset.turn = a === 270 || a === -90 ? 'r' : 'l';
      r.setProperty('--tw', H + 'px'); r.setProperty('--th', W + 'px');
      r.setProperty('--vvh', W + 'px'); r.setProperty('--vvt', '0px');
      dispatchEvent(new Event('retro-fit'));
      return;
    }
    r.setProperty('--tw', W + 'px'); r.setProperty('--th', H + 'px');
    r.setProperty('--vvh', (vv ? vv.height : innerHeight) + 'px');
    r.setProperty('--vvt', (vv ? Math.max(0, vv.offsetTop) : 0) + 'px');
    dispatchEvent(new Event('retro-fit'));
  };
  let raf = 0;
  const later = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(sync); };
  if (window.visualViewport) { visualViewport.addEventListener('resize', later); visualViewport.addEventListener('scroll', later); }
  addEventListener('resize', later);
  addEventListener('orientationchange', () => setTimeout(sync, 350));
  sync();

  return { esc, usedAt, dither, ditherAll, ascii, store, viewport };
})();
