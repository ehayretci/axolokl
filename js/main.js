// Axolokl — page scripts
document.documentElement.classList.add('js');

// Start the hero load sequence once the photo is ready
const bike = document.querySelector('.hero__bike');
const start = () => requestAnimationFrame(() => document.documentElement.classList.add('is-loaded'));
if (bike && !bike.complete) bike.addEventListener('load', start, { once: true });
else start();

// ---- Problem: pinned horizontal scroll (desktop, motion allowed) ----
window.addEventListener('DOMContentLoaded', () => {
  const section = document.querySelector('.problem');
  const nav = document.querySelector('.nav');
  if (!section || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const track = section.querySelector('.problem__track');
  const panels = [...section.querySelectorAll('.panel')];
  const current = section.querySelector('.problem__current');
  const meter = section.querySelector('.problem__meter');

  const setActive = (i) => {
    panels.forEach((p, j) => p.classList.toggle('is-active', j === i));
    panels[i].classList.add('is-seen');
    current.textContent = String(i + 1).padStart(2, '0');
  };

  const mm = gsap.matchMedia();

  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
    section.classList.add('is-horizontal', 'is-animated');
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
          const i = Math.min(panels.length - 1, Math.round(self.progress * (panels.length - 1)));
          setActive(i);
        },
      },
    });
    setActive(0);

    return () => {
      section.classList.remove('is-horizontal', 'is-animated');
      panels.forEach((p) => p.classList.remove('is-active', 'is-seen'));
    };
  });

  mm.add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', () => {
    section.classList.add('is-animated');
    const triggers = panels.map((p) => ScrollTrigger.create({
      trigger: p.querySelector('.viz'), start: 'top 85%', once: true,
      onEnter: () => p.classList.add('is-seen'),
    }));
    return () => {
      triggers.forEach((t) => t.kill());
      section.classList.remove('is-animated');
      panels.forEach((p) => p.classList.remove('is-seen'));
    };
  });

  // Nav turns light while it sits over the dark section (created after the pin so it measures the pin spacing)
  ScrollTrigger.create({
    trigger: section, start: 'top 48px', end: 'bottom 48px',
    toggleClass: { targets: nav, className: 'is-dark' },
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
