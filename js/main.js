// Axolokl — page scripts
document.documentElement.classList.add('js');

// Start the hero load sequence once the photo is ready
const bike = document.querySelector('.hero__bike');
const start = () => requestAnimationFrame(() => document.documentElement.classList.add('is-loaded'));
if (bike && !bike.complete) bike.addEventListener('load', start, { once: true });
else start();

// ---- Problem: sticky section, panels scroll sideways, then the page carries on ----
window.addEventListener('DOMContentLoaded', () => {
  const section = document.querySelector('.problem');
  if (!section || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const track = section.querySelector('.problem__track');
  const panels = [...section.querySelectorAll('.panel')];
  const current = section.querySelector('.problem__current');
  const meter = section.querySelector('.problem__meter');

  const setActive = (i) => {
    panels.forEach((p, j) => p.classList.toggle('is-active', j === i));
    current.textContent = String(i + 1).padStart(2, '0');
  };

  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    section.classList.add('is-horizontal');
    const distance = () => track.scrollWidth - window.innerWidth;

    gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        pin: section.querySelector('.problem__pin'),
        start: 'top top',
        end: () => '+=' + distance(),
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          meter.style.setProperty('--p', self.progress.toFixed(3));
          setActive(Math.round(self.progress * (panels.length - 1)));
        },
      },
    });
    setActive(0);

    return () => section.classList.remove('is-horizontal');
  });
});

// Smooth anchor scrolling in JS (CSS scroll-behavior: smooth breaks ScrollTrigger's measurements)
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  const target = link && document.querySelector(link.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  history.replaceState(null, '', link.getAttribute('href'));
});
