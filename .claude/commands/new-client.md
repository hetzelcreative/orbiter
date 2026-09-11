---
description: Kick off a new client site build from the orbiter starter (phased, home-page first)
argument-hint: client name + business info (NAP, hours, description, primary GBP category, GBP categories, any design refs)
---

You are building a brand-new local-business website from this orbiter starter. The client details are below:

$ARGUMENTS

Before doing anything, read `CLAUDE.md` in full — it is the authoritative source of conventions, and the "Site architecture & internal linking" rules are **doctrine you must follow**. Also read `docs/design-references.md` for the design direction (the house reference set + synthesized principles). If the client info above names specific competitor or inspiration sites, treat those as additional references.

If any essential info is missing (NAP, primary GBP category, or the list of GBP categories/services), ask me a few targeted questions before starting — don't invent business facts.

Work in **four phases and STOP for my approval between each**. Do not run ahead to a later phase.

### Phase 1 — Intake & information architecture
- Populate `src/data/business.ts` (single source of truth: NAP, hours, geo, socials, `siteUrl`, `gaMeasurementId`). Never inline business info elsewhere.
- Draft `src/data/categories.ts` (one hub per GBP category) and `src/data/services.ts` (each service's `category` points to its parent). Collapse to a single category if that's all the business has.
- Set brand tokens + fonts in `src/styles/global.css` `@theme`, and update `astro.config.mjs` `site`, `package.json` `name`, and `public/robots.txt`.
- **Output the IA tree** (categories → services) and the chosen palette/fonts, then stop for approval.

### Phase 2 — Research
- Research the top competitors in the client's city for the **primary category**; note positioning, offers, and what their sites do well/poorly.
- For every category and service, pull real **"People Also Ask"** questions from Google (don't invent generic FAQs) and draft the FAQ sets.
- Note market/seasonal angles worth featuring.
- **Summarize findings** and the proposed FAQs, then stop for approval.

### Phase 3 — Home page ONLY
- Design the homepage focused on the **primary GBP category + primary location** (e.g. "Roofing in Omaha, NE"). It links only to category hubs — never directly to service pages.
- Draw visual direction from the design references: a professional muted base + a single warm accent for CTAs, real photography, dual CTA in the hero (quote + click-to-call), trust signals high up, reviews lower.
- Build only the home page and its shared shell (header/footer). **Stop — I review the design before you build anything else.**

### Phase 4 — Full site (after approval)
- Build every category hub (intro + links to its own services + PAA FAQ via `FAQSection`) and every service page (description + `Breadcrumb` + in-body link back to parent + FAQ).
- Wire schema (`ServiceSchema`, `FAQSchema`, `BreadcrumbSchema`, plus the existing Organization/LocalBusiness), confirm the footer `GbpMap` reads `business.googleMapsEmbed`, and set up the contact form → `/thank-you/` + Netlify/Twilio pipeline.
- Enforce the siloing rules: home → hubs only; hub → its own services only; service → parent; **no cross-linking between categories** in body content.
- Run `npm run build` and fix anything before handing off. Then walk me through the `CLAUDE.md` per-client launch checklist and flag anything still on a placeholder.

Keep everything driven by the data files, tokens, and UI primitives — don't hand-roll markup or hardcode business data. Match the quality bar in `docs/design-references.md`.
