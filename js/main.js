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

// ---- Waitlist pop-up (Netlify Forms): email first, then one optional question ----
(() => {
  const modal = document.getElementById('waitlist-modal');
  if (!modal) return;
  const joinForm = modal.querySelector('.waitlist-form');
  const useForm = modal.querySelector('.use-form');
  const done = modal.querySelector('.modal__done');
  const error = joinForm.querySelector('.modal__error');

  // Where the visitor came from (QR / UTM tags on the landing URL). Kept for the session,
  // so the tags survive if they browse before opening the pop-up.
  let source = location.search.slice(1);
  try {
    if (source) sessionStorage.setItem('axolokl-source', source);
    else source = sessionStorage.getItem('axolokl-source') || '';
  } catch { /* storage blocked: use this page's tags only */ }
  modal.querySelectorAll('input[name="source"]').forEach((input) => { input.value = source || 'direct'; });

  const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  // Locally there is no Netlify to receive forms, so submissions are only logged
  const post = async (form) => {
    const data = new URLSearchParams(new FormData(form));
    if (isLocal) { console.info('[form] mock submit', Object.fromEntries(data)); return; }
    const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: data.toString() });
    if (!res.ok) throw new Error(res.status);
  };
  const showOnly = (el) => {
    [joinForm, useForm, done].forEach((x) => { x.hidden = x !== el; });
    el.querySelector('.modal__title')?.focus();
  };
  const finish = () => {
    done.querySelector('.modal__email').textContent = joinForm.email.value;
    showOnly(done);
  };

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-waitlist-open]')) {
      e.preventDefault();
      modal.showModal();
      if (!joinForm.hidden) joinForm.email.focus();
    } else if (e.target.closest('[data-waitlist-close]')) {
      modal.close();
    }
  });
  // Click on the dimmed backdrop closes it
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });

  // 1. Join: the email is saved straight away, so nobody is lost if they skip the question
  const joinBtn = joinForm.querySelector('button[type="submit"]');
  const joinLabel = joinBtn.querySelector('.btn__label');
  const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

  // Confetti: a burst of muted brand-coloured flakes from behind the title that spreads
  // across the whole screen, then falls and fades. Skipped when the visitor prefers reduced motion.
  const canvas = modal.querySelector('.modal__confetti');
  const confetti = () => {
    if (!canvas || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = innerWidth, h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const title = useForm.querySelector('.modal__title').getBoundingClientRect();
    const ox = title.left + title.width * 0.5, oy = title.top + title.height / 2;
    const colours = ['#F4A9C0', '#F4A9C0', '#B8355E', '#E6E8EB', '#E6E8EB', '#6E757E'];
    const flakes = Array.from({ length: 110 }, () => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.15; // mostly upwards, fanning out
      const speed = 7 + Math.random() * 11;
      return {
        x: ox + (Math.random() - 0.5) * 80, y: oy,
        vx: Math.cos(angle) * speed * 1.25, vy: Math.sin(angle) * speed,
        w: 5 + Math.random() * 6, h: 2.5 + Math.random() * 2.5,
        rot: Math.random() * Math.PI, spin: (Math.random() - 0.5) * 0.35,
        sway: Math.random() * Math.PI * 2,
        colour: colours[Math.floor(Math.random() * colours.length)],
      };
    });
    const life = 2600;
    const start = performance.now();
    const frame = (now) => {
      const t = (now - start) / life;
      ctx.clearRect(0, 0, w, h);
      if (t >= 1) return;
      ctx.globalAlpha = t < 0.6 ? 0.95 : 0.95 * (1 - (t - 0.6) / 0.4);
      flakes.forEach((f) => {
        f.vy = Math.min(f.vy + 0.32, 6); // gravity, with a gentle terminal speed so they flutter down
        f.vx *= 0.97;
        f.sway += 0.08;
        f.x += f.vx + Math.sin(f.sway) * 0.6;
        f.y += f.vy;
        f.rot += f.spin;
        ctx.save();
        ctx.translate(f.x, f.y); ctx.rotate(f.rot);
        // flip the flake's width with its spin so it reads as a turning paper strip
        ctx.scale(Math.cos(f.rot * 1.7), 1);
        ctx.fillStyle = f.colour;
        ctx.fillRect(-f.w / 2, -f.h / 2, f.w, f.h);
        ctx.restore();
      });
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };
  joinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!joinForm.email.checkValidity()) { joinForm.email.reportValidity(); return; }
    error.hidden = true;
    joinBtn.disabled = true;
    joinForm.email.readOnly = true;
    joinBtn.classList.add('is-loading');
    joinLabel.textContent = 'Joining the waitlist…';
    try {
      // a short, deliberate pause so joining feels like it happened, not an instant jump
      await Promise.all([post(joinForm), wait(2000)]);
      useForm.email.value = joinForm.email.value;
      showOnly(useForm);
      confetti();
    } catch {
      error.hidden = false;
    } finally {
      joinBtn.disabled = false;
      joinForm.email.readOnly = false;
      joinBtn.classList.remove('is-loading');
      joinLabel.textContent = 'Join the waitlist';
    }
  });

  // 2. One last question: multiple choice, "Something else" opens a text line
  const boxes = [...useForm.querySelectorAll('input[type="checkbox"]')];
  const other = useForm.querySelector('[data-use-other]');
  const otherText = useForm.querySelector('.use__other');
  const sendBtn = useForm.querySelector('button[type="submit"]');
  const refresh = () => {
    otherText.hidden = !other.checked;
    if (!other.checked) otherText.value = '';
    useForm.uses.value = boxes.filter((b) => b.checked).map((b) => b.value).join(', ');
    sendBtn.disabled = !useForm.uses.value;
  };
  useForm.addEventListener('change', (e) => {
    if (!e.target.matches('input[type="checkbox"]')) return;
    refresh();
    if (e.target === other && other.checked) otherText.focus();
  });
  useForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    refresh();
    if (!useForm.uses.value) return;
    sendBtn.disabled = true;
    try { await post(useForm); } catch { /* the email is already saved; don't block the thank-you */ }
    finish();
  });
})();
