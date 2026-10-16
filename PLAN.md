# Axolokl — website build plan

Goal: a single scrollable pre-launch page. Pitch the problem, tease the product, collect waitlist emails (25% off at launch). Launch countdown: 1 Dec 2026, 00:00 UK time.

## Stack
- Plain static HTML/CSS/JS, no build step (Netlify serves the folder as-is)
- GSAP + ScrollTrigger for pinned / horizontal scroll; Lenis for smooth scroll
- MapLibre GL + a custom monochrome map style (no API key) for the London map
- Netlify Forms for the waitlist: stores emails in the Netlify dashboard, CSV export at launch, honeypot spam protection. No emails sent until launch.
- Hosting: build locally first; later GitHub (github.com/ehayretci) -> Netlify (team erimhayretci) on our own domain
- Fonts self-hosted (Archivo variable) — no Google Fonts call, better for UK GDPR

## Design direction
- Feel: security, precision, premium hardware. Not cute.
- Base: near-black graphite + warm off-white. Accent: axolotl pink (used sparingly: CTAs, map pins, countdown), optional gill-coral secondary.
- Type: one sharp grotesk for display + body, monospace for numbers/stats (engineered feel).
- Hero stays light (matches the white studio photo), then transitions into dark for the problem section.
- Placeholder wordmark "AXOLOKL" until a logo exists.

## Page sections
1. Hero — stolen-wheels photo, hook line, scroll cue.
2. Problem (horizontal scroll, pinned) — 4–5 panels: London bike theft numbers, wheel/component theft, "a quick release takes seconds", "standard bolts = one tool opens every bike", the cost. Placeholders until real stats.
3. Teaser — "We're building something": unique lock + key generated per customer, so no universal tool works. No product shots yet.
4. London map — central London, pins from data/spots.json, hover (tap on mobile) shows our photo, location, date.
5. CTA — "Make sure you're not next." Countdown to 1 Dec 2026, email field, "One email. When we launch. That's it." 25% off for waitlist.
6. Footer — privacy note, contact, project credit.

## Pipeline
0. Setup — folder, git init, Vite scaffold, folder structure  [folder done]
1. Style tile — colours, type, buttons, wordmark — approve before building
2. Build sections one at a time, review each: Hero -> Problem -> Teaser -> Map -> CTA -> Footer
3. Waitlist — Netlify form, consent checkbox (UK GDPR), success state, privacy text
4. Real content — stats with sources, map photos (GPS from EXIF), copy pass
5. Polish — responsive/mobile, reduced-motion fallback, accessibility, image compression (AVIF/WebP), favicon, OG/share image, meta tags
6. Deploy — push to GitHub, connect Netlify (build: npm run build, publish: dist), test a real form submission, optional custom domain, analytics
7. QA — Chrome/Safari/iOS, Lighthouse, form end-to-end, countdown timezone check
