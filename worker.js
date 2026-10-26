// Axolokl site on Cloudflare Workers.
//   Everything is a static file from this folder (env.ASSETS), except:
//   POST /api/waitlist  -> save the email (+ landing tags, flyer code) to D1
//   POST /api/bike-use  -> add the optional bike-use answer to that email's row
//   www.axolokl.co.uk   -> 301 to axolokl.co.uk
// The D1 database is shared with the flyer tracker (go.axolokl.co.uk), whose /admin shows these rows.

const CODE_RE = /^[2-9A-HJKMNP-Z]{6}$/; // flyer codes, same alphabet as the tracker
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
