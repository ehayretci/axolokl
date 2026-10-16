# Axolokl — pre-launch website

## What this is
Axolokl is a master's-module company (Imperial, Design Engineering) designing custom axle locks for bike wheels, against wheel theft in London. Standard quick releases and hex bolts open with one common tool; Axolokl's software generates a unique lock + key pair for every customer, so no universal tool works. Name is a nod to the axolotl.
The product isn't available yet. This site pitches the problem, teases the product, and collects waitlist emails (25% off at launch). Countdown target: 1 Dec 2026, 00:00 UK time.

## Working style (owner: Erim)
- Build one section at a time, then stop and show it. Wait for approval before the next section.
- Concise replies, plain language. No information dumps, no over-execution.
- After visual changes, check the result in a browser (desktop ~1440px and mobile ~390px) before reporting.

## Stack & decisions
- Plain static HTML/CSS/JS, no build step, no framework. Netlify will serve the folder as-is.
- Run locally: `python3 -m http.server 8000` in this folder → http://localhost:8000
- Fonts self-hosted: Archivo variable (wght 100–900, wdth 62–125%) in assets/fonts/archivo-var.woff2. No Google Fonts calls (UK GDPR).
- Planned libs (add when needed, via CDN or vendored): GSAP + ScrollTrigger (pinned horizontal scroll), MapLibre GL (London map, free tiles e.g. OpenFreeMap, no API key).
- Waitlist: Netlify Forms (data-netlify="true", honeypot field, UK GDPR consent checkbox). Stores emails in the Netlify dashboard; export CSV at launch. No emails are sent until launch. Locally the form can't submit, so mock the success state.
- Deploy: LATER. Build locally for now; the domain is in progress. Then GitHub (github.com/ehayretci) → Netlify (team erimhayretci) on the custom domain.
- Git: repo initialised, nothing committed yet.

## Design system (in css/styles.css :root)
- Feel: security, precision, premium hardware. Not gimmicky or cute. Axolotl colours only as accents.
- --paper #F7F7F8 (page bg; matches the hero photo's studio white), --alu #E6E8EB, --graphite #1C1F23 (text / dark sections), --steel #6E757E (secondary text), --hairline #C9CDD2, --axo #F4A9C0 (axolotl pink, on dark only), --gill #B8355E (pink that passes contrast on light; CTAs hover, focus ring, ghost wheels).
- Type: Archivo only. Headlines weight 800, font-stretch ~112%, tight tracking (-0.035em), line-height 0.92. Wordmark: 800 weight, 125% stretch.
- Placeholder wordmark "Axolokl" (text) until a logo exists. Pill buttons in graphite.
- Avoid: ALL-CAPS eyebrow labels, accenting single words in headlines, card grids with identical shadows, scattered fade-up animations, arrows appended to buttons. Spend boldness in one place per section.
- Respect prefers-reduced-motion everywhere; visible focus states; responsive to mobile.

## Page sections & status
1. Hero — DONE. Headline split: "Your lock held." (top-left) / "Your wheels didn't." (bottom-right) around the photo assets/img/hero-stolen-wheels.jpg (1024×765, frame with both wheels stolen, D-lock still on). Signature element: pink dashed SVG "ghost wheels" where the stolen wheels were (circles at image coords cx152/cy652 and cx912/cy548, r262), traced in on load, then line 2 fades in. Sub copy top-right. Photo edges soft-masked; a background-removed photo would remove the faint vignette edge.
2. Problem — NEXT. Pinned horizontal scroll, 4–5 panels: London bike-theft numbers, wheel/component theft, quick release opens in seconds, standard bolts = one tool opens every bike, cost of replacing. Use clearly marked placeholder stats (UK/London focus) until real sourced numbers are given. Page turns dark (graphite) here.
3. Teaser — "we're building something": unique lock + key generated per customer. No product shots yet.
4. London map — Zone 1 only, dark monochrome style. Pins from a data file (e.g. data/spots.json); hover (tap on mobile) shows our photo of a bike with stolen wheels + location + date. Use placeholder photos for now; real ones will go in assets/map-photos (may have GPS EXIF to auto-place pins).
5. CTA — "Make sure you're not next." Countdown to 1 Dec 2026 00:00 Europe/London, email field, "One email. When we launch. That's it.", 25% off for waitlist.
6. Footer — skip for now.

See PLAN.md for the full pipeline (polish, OG/meta, deploy, QA).
