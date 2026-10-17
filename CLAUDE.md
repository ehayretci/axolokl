# Axolokl — pre-launch website

## What this is
Axolokl is a master's-module company (Imperial, Design Engineering) designing custom axle locks for bike wheels, against wheel theft in London. Standard quick releases and hex bolts open with one common tool; Axolokl's software generates a unique lock + key pair for every customer, so no universal tool works. Name is a nod to the axolotl.
The product isn't available yet. This site pitches the problem and collects waitlist emails (25% off at launch). Launch / countdown target: 1 Dec 2026, 00:00 UK time.

## Working style (owner: Erim)
- Build one section at a time, then stop and show it. Wait for approval before the next section.
- Concise replies, plain language. No information dumps, no over-execution.
- After visual changes, check the result in a browser before reporting, at desktop (~1440px) and phone (~390px). Mobile styles live in one `@media (max-width: 720px)` block at the end of styles.css; keep desktop unchanged when editing mobile and vice versa.
- Erim often sends annotated screenshots of the Browser pane and asks for small tweaks; commit only when asked, with the message Erim gives.

## Stack & decisions
- Plain static HTML/CSS/JS, no build step, no framework. Netlify will serve the folder as-is.
- Run locally: `python3 dev-server.py` → http://localhost:8000 (like `http.server`, but sends `Cache-Control: no-store` so browsers never show stale CSS/JS). `.claude/launch.json` starts it for the browser pane. CSS/JS links also carry `?v=N`; bump it if a browser shows old styles.
- Fonts self-hosted, no Google Fonts calls (UK GDPR): Archivo variable (headlines) in assets/fonts/archivo-var.woff2; Urbanist variable (body) in assets/fonts/urbanist-var.woff2. Urbanist was picked to match the logo: geometric, circular bowls, single-storey a.
- GSAP 3.12.7 + ScrollTrigger vendored in js/vendor/ (no CDN). Don't use CSS `scroll-behavior: smooth` — it breaks ScrollTrigger measurements; anchor smooth-scroll is done in js/main.js.
- Waitlist: Netlify Forms (`name="waitlist"`, data-netlify, honeypot `bot-field`). The consent checkbox was removed at Erim's request; the pop-up copy states the purpose. Add a short privacy notice before going live. Locally the submit is mocked (success state shown); on Netlify it POSTs via fetch. Emails land in the Netlify dashboard; export CSV at launch. Nothing is emailed until launch.
- Contact: info@axolokl.co.uk. Instagram: instagram.com/axolokl.
- Hosting: public GitHub repo github.com/ehayretci/axolokl (branch `master`) → Netlify (team erimhayretci), auto-deploys on push. `netlify.toml` publishes the folder as-is and 404s internal files (CLAUDE.md, PLAN.md, README.md, dev-server.py, .claude/). Netlify Forms needs "form detection" enabled in the Netlify UI.
- Domain: axolokl.co.uk, DNS on Cloudflare. Web records point to Netlify (DNS only, not proxied, so Netlify can issue HTTPS). Cloudflare Email Routing (MX + SPF TXT) handles info@axolokl.co.uk — never touch those records.
- Git: commits are made section by section, with the message Erim gives. Push to GitHub only when asked (a push = a live deploy once Netlify is connected).

## Design system (css/styles.css :root)
- Feel: security, precision, premium hardware. Not gimmicky or cute. Axolotl colours only as accents.
- --paper #F7F7F8 (page bg), --alu #E6E8EB, --graphite #1C1F23 (text / dark sections), --steel #6E757E (secondary text), --hairline #C9CDD2, --axo #F4A9C0 (axolotl pink, on dark), --gill #B8355E (deep pink: hover state of every button, focus ring, ghost wheels, labels on light).
- Type: headlines Archivo 800, font-stretch ~112%, tracking -0.035em, tight line-height. Body Urbanist 450.
- Logo: assets/logo/axolokl-mark.svg (axolotl mark, updated 16 Oct 2026) + axolokl-wordmark.svg; favicon.svg is the mark in graphite. Both are inlined in index.html with fill="currentColor" (header + launch footer) — if the logo changes, replace the files AND the two inline copies.
- Buttons: pills; hover is always --gill with light text. Avoid ALL-CAPS eyebrow labels, accenting single words in headlines, card grids with identical shadows, scattered fade-up animations. Spend boldness in one place per section.
- Images on the light page have their white baked to the paper colour (or pure white + `mix-blend-mode: multiply` for the hero photo) so no boxes show. Don't rely on multiply inside layers that fade/transform — it flashes.
- Respect prefers-reduced-motion everywhere; visible focus states.

## Page (index.html), top to bottom — all built
- Header — non-sticky floating white pill bar (on phones: logo, mail + Instagram icons, "Join −25%"): mark + wordmark left; Contact (mailto), Instagram, and "Join the waitlist −25%" (opens the pop-up). Text links get a dashed gill underline on hover.
- 1. Hero — "Your lock held." (top-left) / "Your wheels didn't." (bottom-right), no sub text. Photo assets/img/hero-bike.jpg (1024×765, background pushed to pure white, multiplied onto the page). Ghost wheels: hand-drawn sketch SVG (tyre, tread, hatching, rim, 32 spokes, hub) in gill, drawn BEHIND the frame, centred at image coords (152,652) and (912,548), r262; each stroke traces in on load (slow, ~4.5s), then line 2 fades in at 3.8s. Rear wheel has an SVG mask (circle at 911,562 r44) so the photo's real cassette shows through. The SVG is generated markup (inline, ~80 paths) — edit by hand or regenerate.
- 2. Problem space — light section, pinned; 4 panels scroll sideways (GSAP), progress counter top-right, inactive panels fade. Each panel: Archivo headline + body + linked source, graphic on the right. Graphics (assets/img/problem-*.jpg) are cropped with equal margins around the drawing and shown at one shared height, fine-tuned with `--scale` per figure; cable-lock has its paper texture edge-faded. Stats/sources: #1 stolen part (thebestbikelock.com), 17%/73% (LCC Cycle Theft Survey 2025), £240–370 rear wheel (Brick Lane Bikes workshop); panel 4 "One tool opens almost every bike" has no source.
- 3. Launch — graphite sheet with rounded top corners (not full-screen). "Work in progress." with a looping hex-key-turning-a-bolt icon; lede with **1 December** in pink; countdown built as a combination lock (metal wheels per digit that roll, pink index marks; built in main.js, target Date.UTC(2026,11,1)). Right column: pink "Join the waitlist →" button (arrow swaps for −25% chip on hover), note right-aligned and top-aligned with the counter. Footer row: small mark + wordmark, email, Instagram, © 2026.
- Waitlist pop-up — `<dialog>`, graphite, ~27rem wide: "Launching 1 December" + close, "Join the waitlist.", "You'll be eligible for 25% off our first products. We'll email the code when Axolokl launches.", email field, pink submit (gill hover). Success: "You're on the list. We'll email {email} once we launch."

## Not built / open
- Teaser and London map sections from the original plan were not built (launch section took over the CTA + footer role). Ask before adding them.
- Privacy notice, OG/meta + share image, QA on real phones. See PLAN.md for the pipeline.
- Mobile (≤720px) is done for every section: hero lines wrap bigger around a smaller bike; problem panels still scroll sideways, text over graphic; launch stacks in one column and shows the −25% chip without hover. The root clips horizontal overflow so nothing can widen the page.
