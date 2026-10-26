// Axolokl site on Cloudflare Workers.
//   Everything is a static file from this folder (env.ASSETS), except:
//   POST /api/waitlist  -> save the email (+ landing tags, flyer code) to D1
//   POST /api/bike-use  -> add the optional bike-use answer to that email's row
//   POST /api/demo      -> mark that email's row as joining the free demo team (with consent time)
//   POST /api/event     -> log one click beacon from main.js (table `events`)
//   www.axolokl.co.uk   -> 301 to axolokl.co.uk
// The D1 database is shared with the flyer tracker (go.axolokl.co.uk), whose /admin shows these rows.

const CODE_RE = /^[2-9A-HJKMNP-Z]{6}$/; // flyer codes, same alphabet as the tracker
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EVENTS = new Set(['visit', 'open_waitlist', 'close_waitlist', 'waitlist_submit', 'demo_consent_tick',
  'demo_consent_untick', 'demo_join', 'demo_pass', 'bike_use_sent', 'instagram', 'contact', 'privacy']);
const BOT_RE = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|discord|slack|embedly|curl|wget|python|headless|monitor/i;
const USES = new Set(['work', 'uni', 'errands', 'leisure', 'fitness', 'deliveries', 'other']);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname.startsWith('www.')) {
      url.hostname = url.hostname.slice(4);
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname.startsWith('/api/')) {
      try {
        if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
        if (url.pathname === '/api/waitlist') return await waitlist(request, env);
        if (url.pathname === '/api/bike-use') return await bikeUse(request, env);
        if (url.pathname === '/api/demo') return await demo(request, env);
        if (url.pathname === '/api/event') return await event(request, env);
        return json({ error: 'not_found' }, 404);
      } catch (err) {
        console.error(err);
        return json({ error: 'server_error' }, 500);
      }
    }
    return env.ASSETS.fetch(request);
  },
};

async function fields(request) {
  const form = await request.formData();
  const get = (k, max) => String(form.get(k) || '').trim().slice(0, max);
  return { get, honeypot: !!get('bot-field', 200) };
}

async function waitlist(request, env) {
  const { get, honeypot } = await fields(request);
  if (honeypot) return json({ ok: true }); // bot: pretend it worked
  const email = get('email', 254).toLowerCase();
  if (!EMAIL_RE.test(email)) return json({ error: 'bad_email' }, 400);
  const source = get('source', 500) || 'direct';
  const c = new URLSearchParams(source).get('c');
  const flyer = c && CODE_RE.test(c.toUpperCase()) ? c.toUpperCase() : null;

  // Joining twice keeps the first visit; a flyer code is filled in if it was missing.
  await env.DB.prepare(
    `INSERT INTO waitlist (email, source, flyer_code) VALUES (?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET flyer_code = COALESCE(waitlist.flyer_code, excluded.flyer_code)`
  ).bind(email, source, flyer).run();
  return json({ ok: true });
}

async function bikeUse(request, env) {
  const { get, honeypot } = await fields(request);
  if (honeypot) return json({ ok: true });
  const email = get('email', 254).toLowerCase();
  const uses = get('uses', 200).split(',').map((u) => u.trim()).filter((u) => USES.has(u)).join(', ');
  if (!EMAIL_RE.test(email) || !uses) return json({ error: 'bad_answer' }, 400);
  const other = uses.includes('other') ? get('use_other', 120) || null : null;
  await env.DB.prepare(
    "UPDATE waitlist SET uses = ?, use_other = ?, answered_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE email = ?"
  ).bind(uses, other, email).run();
  return json({ ok: true });
}

// Needs two columns on the shared table (added once in D1):
//   ALTER TABLE waitlist ADD COLUMN demo_optin INTEGER NOT NULL DEFAULT 0;
//   ALTER TABLE waitlist ADD COLUMN demo_consent_at TEXT;
async function demo(request, env) {
  const { get, honeypot } = await fields(request);
  if (honeypot) return json({ ok: true });
  const email = get('email', 254).toLowerCase();
  if (!EMAIL_RE.test(email)) return json({ error: 'bad_email' }, 400);
  // the consent box is required: it's what lets us contact them about delivery and feedback
  if (get('demo_consent', 10) !== 'yes') return json({ error: 'no_consent' }, 400);
  await env.DB.prepare(
    "UPDATE waitlist SET demo_optin = 1, demo_consent_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE email = ?"
  ).bind(email).run();
  return json({ ok: true });
}

// Click beacons from main.js. Bots and unknown event names are dropped; nothing here blocks the page.
async function event(request, env) {
  const ua = request.headers.get('user-agent') || '';
  if (!ua || BOT_RE.test(ua)) return new Response(null, { status: 204 });
  const { get } = await fields(request);
  const name = get('name', 40);
  const session = get('session', 64);
  if (!EVENTS.has(name) || !/^[A-Za-z0-9-]{8,64}$/.test(session)) return new Response(null, { status: 204 });
  const email = get('email', 254).toLowerCase();
  const c = new URLSearchParams(get('source', 500)).get('c');
  const flyer = c && CODE_RE.test(c.toUpperCase()) ? c.toUpperCase() : null;
  await env.DB.prepare(
    'INSERT INTO events (session, name, detail, page, flyer_code, email, device) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(session, name, get('detail', 40) || null, get('page', 100) || null, flyer,
         EMAIL_RE.test(email) ? email : null, deviceOf(ua)).run();
  return new Response(null, { status: 204 });
}

function deviceOf(ua) {
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Android/i.test(ua)) return 'Android';
  if (/Macintosh|Windows|Linux|CrOS/i.test(ua)) return 'Desktop';
  return 'Other';
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
