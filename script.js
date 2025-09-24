// Year in footer
const y = document.getElementById('y');
if (y) y.textContent = new Date().getFullYear();

// Parallax tilt for the hero card
const container = document.querySelector('.parallax');
const card = container ? container.querySelector('.hero-card') : null;

if (container && card) {
  container.addEventListener('mousemove', (e) => {
    const r = container.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;   // 0..1
    const y = (e.clientY - r.top) / r.height;   // 0..1
    const ry = (x - 0.5) * 8;   // yaw
    const rx = -(y - 0.5) * 6;  // pitch
    card.style.setProperty('--ry', ry + 'deg');
    card.style.setProperty('--rx', rx + 'deg');
    card.style.setProperty('--tz', '14px');
  });

  container.addEventListener('mouseleave', () => {
    card.style.setProperty('--ry', '0deg');
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--tz', '0px');
  });
}

// ==== SCROLL-LINKED REVEALS + PARALLAX (safe) ====
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('inview');
        io.unobserve(e.target);
      }
    });
  }, {
    threshold: 0.01,
    rootMargin: '0px 0px -10% 0px' // trigger a bit earlier
  });

  // Helper to mark & observe
  const mark = (nodes, cls='') => {
    nodes.forEach((el, i) => {
      el.classList.add('willreveal');
      if (cls) el.classList.add(cls);
      el.style.setProperty('--delay', (i * 0.06) + 's');
      io.observe(el);
    });
  };

  // Hero
  const hero = document.querySelector('.hero-card');
  if (hero) { hero.classList.add('willreveal'); io.observe(hero); }

  // Projects
  mark([...document.querySelectorAll('.grid .card')]);

  // Skills pills
  mark([...document.querySelectorAll('.pills span')]);

  // Timeline rows (slide in from left)
  mark([...document.querySelectorAll('.timeline .row')], 'x');

  // Parallax on background blobs (cheap)
  const blobs = [...document.querySelectorAll('.blob')];
  if (blobs.length){
    const tick = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      blobs.forEach((b, idx) => {
        const f = (idx + 1) * 0.05;
        b.style.transform = `translate3d(0, ${-y * f}px, 0)`;
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
})();
