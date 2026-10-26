# Axolokl — pre-launch site

Custom axle locks against bike-wheel theft in London. This is the pre-launch page: the problem, a countdown to launch (1 December 2026) and a waitlist.

## Run it locally

You only need Python 3 (already on macOS). No install, no build step.

```bash
git clone https://github.com/ehayretci/axolokl.git
cd axolokl
python3 dev-server.py
```

Then open http://localhost:8000. Stop the server with Ctrl+C.

`dev-server.py` is Python's built-in web server with caching turned off, so your changes show up on every reload.

With `dev-server.py` the waitlist form only shows the success message. To run the real form API against a local database, use `npx wrangler dev` (Node 22+).

## Hosting

The site is a Cloudflare Worker (`wrangler.jsonc`, `worker.js`) on axolokl.co.uk. Pushing to `master` deploys it. Waitlist emails and answers are stored in Cloudflare D1 and shown at go.axolokl.co.uk/admin.

## Structure

- `index.html`: the whole page (header, hero, problem space, launch section, waitlist pop-up)
- `css/styles.css`: all styles; colours and type tokens are at the top in `:root`
- `js/main.js`: hero load animation, sideways-scrolling problem panels, lock-dial countdown, waitlist pop-up
- `worker.js`: www redirect and the waitlist form API (`/api/waitlist`, `/api/bike-use`)
- `js/vendor/`: GSAP + ScrollTrigger
- `assets/`: images, logo SVGs, self-hosted fonts (Archivo, Urbanist)

Project notes and decisions: `CLAUDE.md`. Build plan: `PLAN.md`.
