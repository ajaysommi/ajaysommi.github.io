// year
document.getElementById("y")?.replaceChildren?.(document.createTextNode(new Date().getFullYear()));

// cursor follower
const cursor = document.querySelector('.cursor');
let cx = -100, cy = -100;
window.addEventListener('mousemove', (e) => { cx = e.clientX; cy = e.clientY; cursor.style.transform = `translate(${cx}px, ${cy}px)`; });

// parallax (hero card)
const parallaxEls = document.querySelectorAll('.parallax');
window.addEventListener('mousemove', (e) => {
  const { innerWidth:w, innerHeight:h } = window;
  const x = (e.clientX / w - 0.5) * 2;
  const y = (e.clientY / h - 0.5) * 2;
  parallaxEls.forEach(el => {
    const d = parseFloat(el.dataset.depth || '10');
    el.style.transform = `translate3d(${x * d}px, ${y * d}px, 0)`;
  });
});

// gentle 3D tilt on cards
document.querySelectorAll('.tilt').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `rotateX(${(-py*6)}deg) rotateY(${(px*8)}deg) translateY(-2px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateX(0) rotateY(0)';
  });
});
