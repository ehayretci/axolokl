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

The site is designed for desktop for now (about 1440px wide). The waitlist form only saves emails once the site is deployed on Netlify; locally it just shows the success message.

## Structure

- `index.html`: the whole page (header, hero, problem space, launch section, waitlist pop-up)
- `css/styles.css`: all styles; colours and type tokens are at the top in `:root`
- `js/main.js`: hero load animation, sideways-scrolling problem panels, lock-dial countdown, waitlist pop-up
- `js/vendor/`: GSAP + ScrollTrigger
- `assets/`: images, logo SVGs, self-hosted fonts (Archivo, Urbanist)

Project notes and decisions: `CLAUDE.md`. Build plan: `PLAN.md`.
