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

// ==== SCROLL-LINKED REVEALS + PARALLAX ====
(function () {
  // Respect reduced motion
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  // IntersectionObserver to add .inview
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('inview');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  // Observe containers we want to animate when they enter view
  const observe = (sel, staggerChildren = false, baseDelay = 0.06) => {
    document.querySelectorAll(sel).forEach((section) => {
      io.observe(section);
      if (staggerChildren) {
        [...section.children].forEach((child, i) =>
          child.style.setProperty('--delay', (i * baseDelay) + 's')
        );
      }
    });
  };

  // Sections & groups
  observe('.section', true, 0.06);
  observe('.grid', true, 0.06);
  observe('.timeline', true, 0.07);

  // Hero card
  const hero = document.querySelector('.hero-card');
  if (hero) io.observe(hero);

  // Stagger individual items
  document.querySelectorAll('.grid .card')
    .forEach((el, i) => el.style.setProperty('--delay', (i * 0.06) + 's'));
  document.querySelectorAll('.pills span')
    .forEach((el, i) => el.style.setProperty('--delay', (i * 0.04) + 's'));
  document.querySelectorAll('.timeline .row')
    .forEach((el, i) => el.style.setProperty('--delay', (i * 0.07) + 's'));

  // Micro parallax on background blobs (cheap + continuous)
  const blobs = [...document.querySelectorAll('.blob')];
  if (blobs.length) {
    const parallax = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      blobs.forEach((b, idx) => {
        const f = (idx + 1) * 0.05; // 0.05, 0.10, 0.15, ...
        b.style.transform = `translate3d(0, ${-y * f}px, 0)`;
      });
      requestAnimationFrame(parallax);
    };
    requestAnimationFrame(parallax);
  }
})();

