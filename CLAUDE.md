# Orbiter — Starter Template Guide

Orbiter is the starter repo for local-business websites built for local-SEO clients.
Every new client site begins as a copy of this repo and is customized per the conventions
below. This file is the authoritative source of those conventions — when a client repo's
own instructions disagree with this file, this file wins.

**Stack:** Astro + Tailwind CSS v4 (via `@tailwindcss/vite`, no PostCSS config) +
`@astrojs/sitemap`. React (`@astrojs/react`) is available for interactive islands but used
sparingly (currently only the mobile menu). Deploy target is **Netlify**.

---

## Building a new client site (start here)

When the user asks to build, start, or spin up a site for a new client — e.g. "let's build
a new site for XYZ" — this is a fresh clone of orbiter and that phrasing is the kickoff.
Follow the conventions in this file (the "Site architecture & internal linking" rules are
**doctrine**) and use `docs/design-references.md` for design direction. If the user names
specific inspiration/competitor sites, treat those as additional references.

If essential info is missing (NAP, primary GBP category, or the category/service list), ask
a few targeted questions before starting — don't invent business facts.

Work in **four phases and stop for approval between each** — don't run ahead:

1. **Intake & IA** — populate `business.ts` (single source of truth); draft `categories.ts`
   (one hub per GBP category) and `services.ts` (each service's `category` → its parent);
   set brand tokens + fonts in `global.css` `@theme`; update `astro.config.mjs` `site`,
   `package.json` `name`, `robots.txt`. Output the IA tree + palette/fonts, then stop.
2. **Research** — top competitors in the client's city for the primary category; real Google
   "People Also Ask" questions per category/service (don't invent generic FAQs); seasonal/
   market angles. Summarize findings + proposed FAQs, then stop.
3. **Home page only** — design the homepage on the **primary GBP category + primary
   location**, linking only to category hubs, drawing visual direction from the design
   references (professional muted base + single warm accent for CTAs, real photography, dual
   hero CTA incl. click-to-call, trust signals high, reviews lower). Build only the home page
   + shared shell, then **stop for design review**.
4. **Full site** (after approval) — all category hubs (intro + own services + PAA FAQ via
   `FAQSection`) and service pages (description + `Breadcrumb` + in-body link to parent +
   FAQ); wire schema + footer `GbpMap` + contact→`/thank-you/` + Netlify/Twilio; enforce the
   siloing rules; `npm run build`; then walk the launch checklist and flag placeholders.

Keep everything driven by data files, tokens, and UI primitives — don't hand-roll markup or
hardcode business data.

---

## Core principles

### 1. `src/data/business.ts` is the single source of truth
All name, address, phone (NAP), hours, geo, social profiles, and analytics IDs live in
`business.ts` and are read from there everywhere — layout, header, footer, schema, pages.

- **Never hardcode business info inline** in components, pages, or schema. If a component
  needs the phone number or address, import `business`. (Past client sites regressed by
  inlining NAP across Header/Footer/Layout/schema and produced a domain typo in one file —
  don't repeat this.)
- Extend `business.ts` with whatever scalar fields a niche needs (e.g. `broker`, `founded`,
  `priceRange`, `lotsTotal`) rather than scattering them.

### 2. Theming lives in `src/styles/global.css` `@theme` tokens
Per-client branding = edit the `@theme` block (color scales + fonts) plus swap
favicons/logos in `public/`. That's the intended seam.

- **Drive all color from tokens** (`bg-primary-500`, `text-secondary-600`, etc.).
  Never hardcode hex values in components or one-off gradients — a past site's brown
  gradient didn't match its green theme because it bypassed the tokens.
- Fonts are set via `--font-sans` / `--font-heading`. Self-host with `@fontsource*` when a
  client needs a specific pairing.

### 3. Use the UI primitives; don't hand-roll markup
The `src/components/ui/` set is the design system: `Text`, `Button`, `Section`,
`SectionTitle`, `PageHero`. Prefer these over raw `<h1>`/`<p>`/`<button>` + ad-hoc utility
strings so type scale, color, and spacing stay consistent.

- `Text` — every text node. Props: `variant`, `color`, `weight`, `align`, `as`.
- `Section` — page section wrapper with `variant` (background) + `padding`.
- `Button` — links and form buttons; `variant` (`primary`/`secondary`/`outline`/
  `outline-white`), `size`, `href` (renders `<a>`) or `type` (renders `<button>`).
- Only reach for raw markup when no primitive fits (e.g. inside a form field grid).

### 4. Content model: two-tier categories → services, blog dormant by default
- **The content spine is a two-tier hierarchy that mirrors the client's Google Business
  Profile (GBP) categories.** Top tier = **categories** (one hub page per GBP category),
  bottom tier = **services** (sub-service pages nested under a category). Edit
  `src/data/categories.ts` (the hubs) and `src/data/services.ts` (each service carries a
  `category` slug linking it to its parent). This is the main customization surface, and it
  drives routing, navigation, and the internal-linking model below.
- Nav derives the Services dropdown from these files, so adding a category/service updates
  navigation automatically. `navigation.ts` is hand-edited for everything else.
- **Collapses gracefully for single-category clients:** a business with one GBP category has
  one hub; the services still nest under it. Don't force multiple categories where the
  business only has one.
- **Blog ships wired but dormant.** The `blog` collection (`src/content.config.ts`),
  `blog/` pages, and `BlogPostSchema` exist but are unused until there's content. To keep
  it dormant, leave `src/content/blog/` empty and comment out the Blog nav item. Enable it
  only when the client is actually publishing posts. It's fine to delete the blog entirely
  for a client that will never blog.

### 5. Programmatic local SEO = data file + `[slug]` page + schema
The core SEO play for service clients: create individual location/service-area pages rather
than stuffing every city onto one page. The reusable trio is:
1. a typed data file (e.g. `locations.ts` with slug/city/geo/intro/faqs),
2. a matching dynamic route (`[slug].astro`),
3. a matching JSON-LD schema component.

Keyword-bake URL slugs where it helps ranking (e.g. `/[city]-asphalt-contractor/`), and
preserve old URLs with 301 redirects (see Deployment).

### 6. Images follow slug-based conventions
- Per-service images: `src/assets/<service-slug>/…`
- Auto-globbed galleries: drop files in `src/assets/gallery/` and the gallery page picks
  them up.
- Before/after pairs: name them `before.*` / `after.*`.

### 7. Schema is data-driven components
JSON-LD lives as components in `src/components/schema/`, pulling values from `business.ts` —
never hardcode business data into schema. Swap schema types to fit the vertical (e.g.
`RealEstateListing` + `FAQPage` for a real-estate client). Keep FAQ/Breadcrumb/Service
schema generic and prop-driven so they're reusable.

### 8. Reviews — fetched on build via DataForSEO
Google reviews are the standard, single approach: `scripts/fetch-reviews.js` pulls them from
DataForSEO into `src/data/reviews.json`, consumed via `src/utils/googleReviews.ts` and
`ReviewSchema.astro`. Don't hand-maintain a `reviews.ts` — use this pipeline.

- Runs automatically before every build (`prebuild`), and manually via `npm run fetch-reviews`.
- Requires `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD`, and `GOOGLE_PLACE_ID` in `.env`
  (and in the Netlify dashboard for production builds).
- **Build-safe:** if those are unset or the fetch fails, it warns and keeps the committed
  `reviews.json` rather than failing the build — so the fetch only runs where creds exist.

---

## Site architecture & internal linking (the SEO model)

Every orbiter site follows the same siloed information architecture. These rules are
**doctrine** — follow them on every build. They exist to concentrate topical authority per
GBP category and avoid diluting it with cross-links.

**Page types & routes**
- **Home** (`/`) — focused on the client's **primary GBP category + primary location**
  (e.g. "Roofing in Omaha, NE"). It is the top of the funnel, not a catch-all.
- **Category hub** (`/[category]/`) — one page per GBP category (e.g. `/roofing/`). Introduces
  the category and links to all of its service pages.
- **Service** (`/[category]/[service]/`) — one page per sub-service, nested under its parent
  category (e.g. `/roofing/shingle-repair/`). Keyword-bake slugs where it helps ranking.

**Linking rules (silos)**
1. **Home links only to category hubs** — never directly to individual service pages.
2. **Each category hub links to all of its own service pages** (and only its own).
3. **Each service page links back to its parent category** (breadcrumb + in-body link).
4. **Do NOT cross-link between categories** — a roofing service page must not link to a
   gutters service or the gutters hub. Keep each category's link graph self-contained.
   (Global nav/footer links are exempt; this rule governs in-content links.)

**Required on-page elements**
5. **Category hubs and service pages each get an FAQ section** rendered with `FAQSection`
   (which emits `FAQPage` JSON-LD via `FAQSchema`). Source questions from Google's
   "People Also Ask" for that category/service during research — don't invent generic FAQs.
6. **Service pages show a breadcrumb** (`Home › Category › Service`) via `Breadcrumb`
   (emits `BreadcrumbList` JSON-LD).
7. **The GBP map is embedded in the site footer** on every page via `GbpMap`, reading
   `business.googleMapsEmbed`. This reinforces NAP + location signals site-wide.

The enabling components (`FAQSection`, `Breadcrumb`, `GbpMap`) and the category/service data
model + routes ship in the starter so these rules are structural, not something to remember.

---

## Deployment & forms (Netlify)

Sites deploy to Netlify. `netlify.toml` configures the build, functions dir, and redirects.

- **Contact / lead forms use Netlify Forms.** Pattern: `data-netlify="true"`, a honeypot
  `bot-field`, a hidden `<input name="form-name">`, and `action="/thank-you/"` to redirect
  on submit. The `/thank-you` page is `noindex`.
- **SMS notifications** go through `netlify/functions/send-sms.js` (Twilio). Wire it under
  Netlify → Forms → Form notifications → Outgoing webhook, pointing at
  `/.netlify/functions/send-sms`. Set the four env vars from `.env.example` in the Netlify
  dashboard. The function has a `contact` branch and a generic fallback, so new forms notify
  automatically — add a branch to format a specific form nicely.
  **The form field `name`s are the contract** between the form and the function.
- **Legacy redirects** (migrating off WordPress, etc.) go in `netlify.toml` as 301s.

## Analytics
GA4 is loaded off the main thread via Partytown, gated on `business.gaMeasurementId`. The
tags are pre-wired (commented) in `Layout.astro` — uncomment once the client's GA ID is set.
Keep analytics off the main thread; don't add inline main-thread gtag snippets.

---

## Per-client launch checklist
These fields are placeholders in the starter and **must** be changed before launch (past
sites shipped with several of these left as defaults):

- [ ] `package.json` `name` — still `"orbiter"` in fresh copies
- [ ] `src/data/business.ts` — all NAP, hours, geo, socials, `siteUrl`, `gaMeasurementId`
- [ ] `astro.config.mjs` `site` — the production domain (drives sitemap + canonical URLs)
- [ ] `public/robots.txt` — sitemap URL (do not leave `yourbusiness.com`)
- [ ] `src/styles/global.css` `@theme` — brand colors + fonts
- [ ] `public/` — favicons, logos, `og-meta.png`, `site.webmanifest`
- [ ] `src/data/services.ts` + `navigation.ts` — real services & nav
- [ ] Netlify env vars for Twilio (if SMS notifications are used)
- [ ] Set DataForSEO creds + `GOOGLE_PLACE_ID` (Netlify env) so reviews fetch on build
- [ ] Uncomment the GA/Partytown tags in `Layout.astro` once `gaMeasurementId` is set

## Commands
- `npm run dev` — local dev server
- `npm run build` — production build to `./dist/`
- `npm run preview` — preview the build locally
