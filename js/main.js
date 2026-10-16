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
  if (link && link.hasAttribute('data-waitlist-open')) return; // opens the pop-up instead
  const target = link && document.querySelector(link.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  history.replaceState(null, '', link.getAttribute('href'));
});

// ---- Launch countdown as a combination lock: 1 Dec 2026, 00:00 UK time (GMT, so 00:00 UTC) ----
(() => {
  const lock = document.querySelector('.lock');
  if (!lock) return;
  const launch = Date.UTC(2026, 11, 1, 0, 0, 0);
  const srText = lock.querySelector('[data-countdown-text]');

  // Two wheels per unit, each a strip of 0-9 that rolls to the current digit
  const wheels = {};
  lock.querySelectorAll('.lock__group').forEach((group) => {
    const holder = group.querySelector('.lock__wheels');
    wheels[group.dataset.unit] = [0, 1].map(() => {
      const wheel = document.createElement('span');
      wheel.className = 'wheel';
      wheel.setAttribute('aria-hidden', 'true');
      const strip = document.createElement('span');
      strip.className = 'wheel__strip';
      strip.innerHTML = '0123456789'.split('').map((n) => `<span>${n}</span>`).join('');
      wheel.appendChild(strip);
      holder.appendChild(wheel);
      return strip;
    });
  });

  const set = (unit, value) => {
    const digits = String(value).padStart(2, '0').slice(-2);
    wheels[unit].forEach((strip, i) => strip.style.setProperty('--d', digits[i]));
  };

  let lastMinute = -1;
  const tick = () => {
    const sec = Math.floor(Math.max(0, launch - Date.now()) / 1000);
    const d = Math.floor(sec / 86400), h = Math.floor(sec / 3600) % 24, m = Math.floor(sec / 60) % 60;
    set('days', d); set('hours', h); set('minutes', m); set('seconds', sec % 60);
    // Screen readers get a plain sentence, updated once a minute rather than every second
    if (m !== lastMinute) { lastMinute = m; srText.textContent = `${d} days, ${h} hours and ${m} minutes until launch.`; }
    if (sec === 0) clearInterval(timer);
  };
  const timer = setInterval(tick, 1000);
  // First set after a frame, so the wheels visibly spin from 00 into place
  requestAnimationFrame(() => requestAnimationFrame(tick));
})();

// ---- Waitlist pop-up (Netlify Forms) ----
(() => {
  const modal = document.getElementById('waitlist-modal');
  if (!modal) return;
  const form = modal.querySelector('form');
  const done = modal.querySelector('.modal__done');
  const error = modal.querySelector('.modal__error');
  const submit = modal.querySelector('.modal__submit');

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-waitlist-open]')) {
      e.preventDefault();
      modal.showModal();
    } else if (e.target.closest('[data-waitlist-close]')) {
      modal.close();
    }
  });
  // Click on the dimmed backdrop closes it
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });

  const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    error.hidden = true;
    submit.disabled = true;
    try {
      // Locally there is no Netlify to receive the form, so the success state is mocked
      if (!isLocal) {
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(new FormData(form)).toString(),
        });
        if (!res.ok) throw new Error(res.status);
      }
      done.querySelector('.modal__email').textContent = form.email.value;
      form.hidden = true;
      done.hidden = false;
      done.querySelector('.modal__title').focus();
    } catch {
      error.hidden = false;
    } finally {
      submit.disabled = false;
    }
  });
})();
