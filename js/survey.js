// Bike survey, one question per screen. Questions + branching: js/survey-questions.js.
// Every answer is saved to /api/survey straight away (the whole answer set, with a rising seq), so partial
// surveys are kept too. Progress is also kept in localStorage, so a reload or a lost signal carries on
// where the person left off.
(() => {
  const S = window.AXO_SURVEY;
  const $ = (s) => document.querySelector(s);
  const KEY = 'axolokl-survey';
  const OTHER = 'Other';
  // the option that opens a text box: an added "Other", or one of the question's own options (other: 'Something else')
  const otherOf = (q) => (q?.other === true ? OTHER : q?.other || null);
  const allOpts = (q) => [...q.options, ...(q.other === true ? [OTHER] : [])];
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // phones: a slightly longer pause after a tap so people see their pick before the next question
  const TOUCH = matchMedia('(hover: none), (pointer: coarse)').matches;

  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch { /* private mode: still works, just no resume */ } };
  const landingSource = () => {
    let s = location.search.slice(1);
    try { s = s || sessionStorage.getItem('axolokl-source') || ''; } catch { /* ignore */ }
    return s || 'direct';
  };
  const fresh = () => ({ id: crypto.randomUUID(), seq: 0, synced: 0, answers: {}, path: [], done: false, source: landingSource() });

  let st = load();
  if (!st || !st.id) st = fresh();
  let advanceTimer = null, typeTimer = null, retryTimer = null;

  // ---------- saving ----------
  // only the answers on the path actually taken (going back and changing a branch drops the old branch)
  function payload(done) {
    const on = new Set(st.path);
    const hasOther = (id) => { const o = otherOf(S.byId[id]); return !!o && (st.answers[id] === o || listOf(id).includes(o)); };
    const answers = Object.fromEntries(Object.entries(st.answers).filter(([k]) => on.has(k.match(/^q\d+/)[0])
      && (!k.endsWith('_other') || hasOther(k.slice(0, -6)))));
    return JSON.stringify({ id: st.id, seq: st.seq, answers, path: st.path, last_q: st.path[st.path.length - 1] || null, done: !!done, source: st.source });
  }
  async function send(done) {
    const seq = st.seq;
    const r = await fetch('/api/survey', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload(done), keepalive: true });
    if (!r.ok) throw new Error(`save failed: ${r.status}`);
    st.synced = Math.max(st.synced, seq); persist();
  }
  function save() {
    st.seq += 1; persist();
    clearTimeout(retryTimer);
    send(false).catch(() => { retryTimer = setTimeout(flush, 5000); });
  }
  function flush() { if (st.synced < st.seq) send(st.done).catch(() => { retryTimer = setTimeout(flush, 8000); }); }
  // leaving the page with an unsent answer: one last try that survives the tab closing
  addEventListener('pagehide', () => {
    if (st.synced < st.seq && navigator.sendBeacon) navigator.sendBeacon('/api/survey', new Blob([payload(st.done)], { type: 'application/json' }));
  });
  addEventListener('online', flush);

  // ---------- screens ----------
  function show(id) {
    for (const s of document.querySelectorAll('.sv-screen')) s.hidden = s.id !== id;
    scrollTo(0, 0);
  }
  function progress() {
    const cur = st.path[st.path.length - 1];
    const i = st.done ? S.QUESTIONS.length : cur ? S.QUESTIONS.findIndex((q) => q.id === cur) : 0;
    $('#sv-bar').style.width = `${Math.round((i / S.QUESTIONS.length) * 100)}%`;
  }

  function intro() {
    if (st.done) return done();
    const started = st.path.length > 1 || Object.keys(st.answers).length;
    const r = $('#sv-resume');
    r.hidden = !started;
    if (started) {
      r.innerHTML = `You've started this survey already. <strong>Start</strong> carries on where you left off, or <button class="sv-link" type="button" id="sv-over">start over</button>.`;
      $('#sv-over').addEventListener('click', restart);
    }
    show('sv-intro'); progress();
  }
  function restart() { st = fresh(); persist(); start(); }
  function start() {
    if (!st.path.length) { st.path = [S.first]; persist(); }
    render();
  }

  // ---------- one question ----------
  const cur = () => S.byId[st.path[st.path.length - 1]];
  const listOf = (id) => (Array.isArray(st.answers[id]) ? st.answers[id] : []);

  function optButton(label, role, checked, i, pic) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = pic ? 'sv-opt sv-opt--pic' : 'sv-opt'; b.setAttribute('role', role);
    b.setAttribute('aria-checked', checked ? 'true' : 'false');
    const key = i != null && i < 9 ? `<span class="sv-key" aria-hidden="true">${i + 1}</span>` : '';
    b.innerHTML = pic
      ? `<span class="sv-opt__img"><img src="${pic[0]}" alt="" width="240" height="200" loading="lazy"></span>
         <span class="sv-opt__row"><span class="sv-mark" aria-hidden="true"></span><span><span class="sv-opt__label"></span><span class="sv-opt__hint"></span></span>${key}</span>`
      : `<span class="sv-mark" aria-hidden="true"></span><span class="sv-opt__label"></span>${key}`;
    b.querySelector('.sv-opt__label').textContent = label;
    if (pic) b.querySelector('.sv-opt__hint').textContent = pic[1];
    b.dataset.value = label;
    return b;
  }
  function otherBox(q) {
    const input = document.createElement('input');
    input.className = 'sv-input sv-other'; input.type = 'text'; input.maxLength = 300;
    input.placeholder = 'Please say what'; input.setAttribute('aria-label', `${q.title} Other`);
    input.value = st.answers[`${q.id}_other`] || '';
    input.addEventListener('input', () => { st.answers[`${q.id}_other`] = input.value; typed(); });
    return input;
  }
  function typed() { persist(); clearTimeout(typeTimer); typeTimer = setTimeout(save, 700); }

  function render() {
    clearTimeout(advanceTimer);
    const q = cur();
    const sec = q.section ? S.SECTIONS[q.section] : null;
    $('#sv-section').textContent = sec ? sec.title : 'About you';
    $('#sv-section-note').hidden = !sec?.note; $('#sv-section-note').textContent = sec?.note || '';
    $('#sv-title').textContent = q.title;
    $('#sv-note').hidden = !q.note; $('#sv-note').textContent = q.note || '';
    const hint = q.type === 'many' ? (q.max ? `Pick up to ${q.max === 3 ? 'three' : q.max}.` : 'Tick all that apply.')
      : q.type === 'grid' ? 'One answer per row.' : q.optional ? 'Optional.' : '';
    $('#sv-hint').hidden = !hint; $('#sv-hint').textContent = hint;
    $('#sv-error').hidden = true;
    $('#sv-back').hidden = st.path.length <= 1;

    const body = $('#sv-body');
    body.innerHTML = '';
    const opts = q.options ? allOpts(q) : [];

    body.className = q.pics ? 'sv-body sv-body--pics' : 'sv-body';
    if (q.type === 'one') {
      body.setAttribute('role', 'radiogroup');
      opts.forEach((o, i) => {
        const b = optButton(o, 'radio', st.answers[q.id] === o, i, q.pics?.[o]);
        b.addEventListener('click', () => pickOne(q, o));
        body.append(b);
      });
      if (otherOf(q) && st.answers[q.id] === otherOf(q)) body.append(otherBox(q));
    } else if (q.type === 'many') {
      body.setAttribute('role', 'group');
      const list = listOf(q.id);
      const full = q.max && list.length >= q.max;
      opts.forEach((o) => {
        const b = optButton(o, 'checkbox', list.includes(o));
        if (full && !list.includes(o)) b.disabled = true;
        b.addEventListener('click', () => toggle(q, o));
        body.append(b);
      });
      if (otherOf(q) && list.includes(otherOf(q))) body.append(otherBox(q));
    } else if (q.type === 'grid') {
      body.removeAttribute('role');
      for (const [key, label] of q.rows) {
        const row = document.createElement('div');
        row.className = 'sv-row';
        row.innerHTML = `<p class="sv-row__label"></p><div class="sv-row__opts" role="radiogroup"></div>`;
        row.querySelector('.sv-row__label').textContent = label;
        row.querySelector('[role=radiogroup]').setAttribute('aria-label', label);
        for (const o of q.options) {
          const b = optButton(o, 'radio', st.answers[key] === o);
          b.addEventListener('click', () => pickGrid(q, key, o));
          row.querySelector('.sv-row__opts').append(b);
        }
        body.append(row);
      }
    } else {
      body.removeAttribute('role');
      const long = q.type === 'long';
      const input = document.createElement(long ? 'textarea' : 'input');
      input.className = 'sv-input'; input.id = 'sv-text';
      if (!long) { input.type = q.type === 'email' ? 'email' : 'text'; input.maxLength = q.type === 'email' ? 254 : 200; }
      else input.maxLength = 4000;
      if (q.type === 'email') { input.autocomplete = 'email'; input.placeholder = 'you@example.com'; }
      input.setAttribute('aria-labelledby', 'sv-title');
      input.value = st.answers[q.id] || '';
      input.addEventListener('input', () => { st.answers[q.id] = input.value; typed(); nextLabel(); });
      body.append(input);
      if (q.suggest && SOURCES[q.suggest]?.()) suggest(q, input, body);
    }
    nextLabel();
    show('sv-q'); progress();
    const text = $('#sv-text');
    if (text && matchMedia('(hover: hover)').matches) text.focus(); else $('#sv-title').focus({ preventScroll: true });
  }

  // ---------- type-ahead (countries, UK towns) ----------
  const SOURCES = { countries: () => window.AXO_COUNTRIES, uk_places: () => window.AXO_UK_PLACES };
  const PLACEHOLDER = { countries: 'Start typing a country', uk_places: 'Start typing a town or city' };
  const fold = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/['’.]/g, '').toLowerCase().trim();
  const titleCase = (s) => s.replace(/(^|[\s-])\w/g, (c) => c.toUpperCase()).replace(/ (Upon|And|The|Of|On) /g, (w) => w.toLowerCase());
  function standardName(kind, text) { // exact name or alias -> the standard name
    const t = fold(text), C = SOURCES[kind]?.();
    if (!t || !C) return null;
    return C.NAMES.find((n) => fold(n) === t) || Object.entries(C.ALIASES).find(([a]) => fold(a) === t)?.[1] || null;
  }
  function matches(kind, text) { // -> [{ value, label }], best first
    const t = fold(text), C = SOURCES[kind](), out = [];
    if (!t) return out;
    const add = (value, alias) => {
      const label = alias && C.showAlias?.includes(value) ? `${value} (${titleCase(alias)})` : value;
      if (!out.some((o) => fold(o.label) === fold(label) || (!alias && o.value === value))) out.push({ value, label });
    };
    for (const [a, n] of Object.entries(C.ALIASES)) if (fold(a) === t) add(n, a);
    for (const n of C.NAMES) if (fold(n).startsWith(t)) add(n);
    for (const n of C.NAMES) if (fold(n).split(/[\s-]+/).some((w) => w.startsWith(t))) add(n);
    if (t.length >= 2) for (const [a, n] of Object.entries(C.ALIASES)) if (fold(a).startsWith(t)) add(n, a);
    if (t.length >= 3) for (const n of C.NAMES) if (fold(n).includes(t)) add(n);
    return out.slice(0, 6);
  }
  function suggest(q, input, body) {
    const kind = q.suggest;
    input.autocomplete = 'off'; input.placeholder = PLACEHOLDER[kind] || '';
    input.setAttribute('role', 'combobox'); input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', 'sv-suggest'); input.setAttribute('aria-expanded', 'false');
    const list = document.createElement('div');
    list.id = 'sv-suggest'; list.className = 'sv-suggest'; list.setAttribute('role', 'listbox');
    body.append(list);
    let items = [], hi = -1;
    const draw = () => {
      items = standardName(kind, input.value) === input.value ? [] : matches(kind, input.value);
      if (hi >= items.length) hi = -1;
      list.innerHTML = '';
      items.forEach((it, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'sv-opt sv-suggest__opt'; b.id = `sv-sug-${i}`;
        b.setAttribute('role', 'option'); b.setAttribute('aria-selected', i === hi ? 'true' : 'false');
        b.textContent = it.label;
        b.addEventListener('mousedown', (e) => e.preventDefault()); // keep the keyboard open on phones
        b.addEventListener('click', () => choose(it.value));
        list.append(b);
      });
      input.setAttribute('aria-expanded', items.length ? 'true' : 'false');
      if (hi >= 0) input.setAttribute('aria-activedescendant', `sv-sug-${hi}`); else input.removeAttribute('aria-activedescendant');
    };
    const choose = (n) => { input.value = n; st.answers[q.id] = n; persist(); save(); nextLabel(); hi = -1; draw(); };
    input.addEventListener('input', () => { hi = -1; draw(); });
    input.addEventListener('keydown', (e) => {
      if (!items.length) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); hi = (hi + 1) % items.length; draw(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); hi = hi <= 0 ? items.length - 1 : hi - 1; draw(); }
      else if (e.key === 'Enter') { e.preventDefault(); choose(items[hi >= 0 ? hi : 0].value); }
      else if (e.key === 'Escape') { items = []; list.innerHTML = ''; input.setAttribute('aria-expanded', 'false'); }
    });
    draw();
  }

  function nextLabel() {
    const q = cur();
    const empty = !(st.answers[q.id] || '').toString().trim() && !listOf(q.id).length;
    $('#sv-next').textContent = q.id === 'q30' ? 'Finish' : q.optional && empty ? 'Skip' : 'Next';
  }

  function pickOne(q, o) {
    st.answers[q.id] = o;
    persist(); save();
    if (o === otherOf(q)) { render(); $('.sv-other')?.focus(); return; }
    for (const b of document.querySelectorAll('#sv-body .sv-opt')) b.setAttribute('aria-checked', b.dataset.value === o ? 'true' : 'false');
    $('.sv-other')?.remove();
    advanceTimer = setTimeout(advance, TOUCH ? 420 : 260); // single choice moves on by itself
  }
  function pickGrid(q, key, o) {
    st.answers[key] = o;
    persist(); save();
    for (const row of document.querySelectorAll('.sv-row'))
      if (row.querySelector('.sv-row__label').textContent === q.rows.find(([k]) => k === key)[1])
        for (const b of row.querySelectorAll('.sv-opt')) b.setAttribute('aria-checked', b.dataset.value === o ? 'true' : 'false');
    if (q.rows.every(([k]) => st.answers[k])) advanceTimer = setTimeout(advance, TOUCH ? 480 : 320);
  }
  function toggle(q, o) {
    let list = listOf(q.id);
    if (list.includes(o)) list = list.filter((x) => x !== o);
    else if (o === q.none) list = [o];
    else list = [...list.filter((x) => x !== q.none), o];
    if (q.max && list.length > q.max) return;
    st.answers[q.id] = list;
    persist(); save();
    render();
    if (o === otherOf(q) && list.includes(o)) $('.sv-other')?.focus();
  }

  function problem(q) {
    const a = st.answers[q.id];
    if (q.type === 'one') {
      if (!a) return 'Please choose an answer.';
      if (a === otherOf(q) && !(st.answers[`${q.id}_other`] || '').trim()) return 'Please type your answer in the box.';
    } else if (q.type === 'many') {
      const list = listOf(q.id);
      if (!list.length && !q.optional) return 'Please tick at least one.';
      if (otherOf(q) && list.includes(otherOf(q)) && !(st.answers[`${q.id}_other`] || '').trim()) return 'Please type your answer in the box.';
    } else if (q.type === 'grid') {
      if (!q.rows.every(([k]) => st.answers[k])) return 'Please answer both rows.';
    } else if (q.type === 'email') {
      if ((a || '').trim() && !EMAIL_RE.test(a.trim())) return "That email doesn't look right.";
    } else if (!q.optional && !(a || '').trim()) return 'Please type an answer.';
    return '';
  }

  async function advance() {
    clearTimeout(advanceTimer);
    const q = cur();
    if (q.suggest) { const c = standardName(q.suggest, st.answers[q.id] || ''); if (c) st.answers[q.id] = c; } // "usa" -> United States, "hackney" -> London
    const err = problem(q);
    if (err) { $('#sv-error').textContent = err; $('#sv-error').hidden = false; return; }
    const to = S.next(q, st.answers);
    if (to) { st.path.push(to); persist(); save(); render(); return; }
    await finish();
  }

  async function finish() {
    const btn = $('#sv-next');
    btn.disabled = true; btn.textContent = 'Saving…';
    st.done = true; st.seq += 1; persist();
    let ok = false;
    for (let i = 0; i < 3 && !ok; i++) {
      try { await send(true); ok = true; } catch { await new Promise((r) => setTimeout(r, 1200 * (i + 1))); }
    }
    btn.disabled = false;
    if (!ok) {
      st.done = false; persist();
      btn.textContent = 'Finish';
      $('#sv-error').textContent = "We couldn't send your answers. Check your connection and press Finish again.";
      $('#sv-error').hidden = false;
      return;
    }
    done();
  }

  function done() {
    $('#sv-done-email').hidden = !EMAIL_RE.test((st.answers.q30 || '').trim()) || !st.path.includes('q30');
    show('sv-done'); progress();
  }

  // ---------- wiring ----------
  $('#sv-start').addEventListener('click', start);
  $('#sv-form').addEventListener('submit', (e) => { e.preventDefault(); advance(); });
  $('#sv-back').addEventListener('click', () => { if (st.path.length > 1) { st.path.pop(); persist(); render(); } });
  $('#sv-again').addEventListener('click', restart);
  // keys 1-9 pick an option on single-choice questions (desktop)
  addEventListener('keydown', (e) => {
    if ($('#sv-q').hidden || e.metaKey || e.ctrlKey || e.altKey || /INPUT|TEXTAREA/.test(document.activeElement?.tagName)) return;
    const q = cur();
    const n = Number(e.key);
    if (q.type === 'one' && n >= 1 && n <= 9) {
      const o = allOpts(q)[n - 1];
      if (o) pickOne(q, o);
    }
  });

  // count page views (opened vs started vs finished), like the main site's beacons
  try {
    let session = sessionStorage.getItem('axolokl-session');
    if (!session) { session = crypto.randomUUID(); sessionStorage.setItem('axolokl-session', session); }
    const data = new URLSearchParams({ name: 'survey_view', session, source: st.source, page: location.pathname });
    navigator.sendBeacon ? navigator.sendBeacon('/api/event', data) : fetch('/api/event', { method: 'POST', body: data, keepalive: true });
  } catch { /* never block the survey */ }

  flush();
  intro();
})();
