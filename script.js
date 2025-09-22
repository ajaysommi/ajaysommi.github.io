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
