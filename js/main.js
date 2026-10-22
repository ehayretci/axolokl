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
        // when scrolling stops, glide to the nearest whole panel instead of resting between two
        snap: {
          snapTo: 1 / (panels.length - 1),
          duration: { min: 0.25, max: 0.7 },
          delay: 0.08,
          ease: 'power2.inOut',
        },
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

// ---- Survey + waitlist pop-up (Netlify Forms) ----
(() => {
  const modal = document.getElementById('waitlist-modal');
  if (!modal) return;
  const form = modal.querySelector('form');
  const done = modal.querySelector('.modal__done');
  const error = modal.querySelector('.modal__error');
  const submit = form.querySelector('button[type="submit"]');
  const steps = [...form.querySelectorAll('.survey__step')];
  const nav = form.querySelector('.survey__nav');
  const num = form.querySelector('[data-survey-num]');
  const meter = form.querySelector('.survey__meter span');
  const QUESTIONS = 5;
  let current = 0;

  // Where the visitor came from (QR / UTM tags on the landing URL). Kept for the session,
  // so the tags survive if they browse before opening the survey.
  const sourceField = form.querySelector('input[name="source"]');
  let source = location.search.slice(1);
  try {
    if (source) sessionStorage.setItem('axolokl-source', source);
    else source = sessionStorage.getItem('axolokl-source') || '';
  } catch { /* storage blocked: use this page's tags only */ }
  sourceField.value = source || 'direct';

  const show = (n) => {
    current = n;
    steps.forEach((step, i) => { step.hidden = i !== n; });
    const isQuestion = n >= 1 && n <= QUESTIONS;
    nav.hidden = n === 0;
    num.textContent = Math.min(n, QUESTIONS);
    nav.querySelector('.survey__count').hidden = !isQuestion;
    meter.style.transform = `scaleX(${Math.min(n, QUESTIONS + 1) / (QUESTIONS + 1)})`;
    if (steps[n].querySelector('[data-price]')) limitPrices(n);
    const heading = steps[n].querySelector('legend, .survey__q, .modal__title');
    if (heading) heading.focus({ preventScroll: true });
    if (n === QUESTIONS + 1) form.email.focus();
  };

  // A price answer can't be lower than the one before it (cheap → deal → expensive → too expensive)
  const rankOf = (step) => {
    const picked = step.querySelector('input:checked');
    return picked ? Number(picked.dataset.rank) : 0;
  };
  const limitPrices = (n) => {
    let min = 0;
    for (let i = 2; i < n; i++) min = Math.max(min, rankOf(steps[i]));
    steps[n].querySelectorAll('input').forEach((input) => {
      input.disabled = Number(input.dataset.rank) < min;
      if (input.disabled && input.checked) input.checked = false;
    });
  };

  const answered = (n) => !!steps[n].querySelector('input:checked');

  // Tapping an answer moves on by itself; keyboard users pick with arrows and press Enter
  let pointerPick = false;
  form.addEventListener('pointerdown', (e) => { pointerPick = !!e.target.closest('.chip'); });
  form.addEventListener('change', (e) => {
    if (!e.target.matches('input[type="radio"]')) return;
    if (pointerPick && current <= QUESTIONS) setTimeout(() => show(current + 1), 220);
    pointerPick = false;
  });
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('input[type="radio"]') && answered(current)) {
      e.preventDefault();
      show(current + 1);
    }
  });
  form.querySelector('[data-survey-next]').addEventListener('click', () => show(1));
  form.querySelector('[data-survey-back]').addEventListener('click', () => show(Math.max(0, current - 1)));

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-waitlist-open]')) {
      e.preventDefault();
      modal.showModal();
      if (!form.hidden) show(current);
    } else if (e.target.closest('[data-waitlist-close]')) {
      modal.close();
    }
  });
  // Click on the dimmed backdrop closes it
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });

  const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.email.checkValidity()) { form.email.reportValidity(); return; }
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
      } else {
        console.info('[survey] mock submit', Object.fromEntries(new FormData(form)));
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
