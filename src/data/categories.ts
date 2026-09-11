import type { FAQ } from './services';

/**
 * Top tier of the content spine: one hub page per Google Business Profile
 * category. Each category owns a set of services (see services.ts, where each
 * service carries a `category` slug pointing back here).
 *
 * Per the internal-linking model (see CLAUDE.md): the home page links to these
 * hubs, each hub links to its own services, and categories do not cross-link.
 *
 * A single-category business simply has one entry here — the model still works.
 */
export interface Category {
  /** URL slug — the hub lives at /[slug]/ */
  slug: string;
  /** Display name used in nav, headings, and cards */
  name: string;
  /** The matching Google Business Profile category (for reference/schema) */
  gbpCategory: string;
  /** One-line summary for cards and nav */
  excerpt: string;
  /** Longer intro prose for the top of the hub page */
  intro: string;
  /** Hub-level FAQs — source from Google "People Also Ask" during research */
  faqs: FAQ[];
}

export const categories: Category[] = [
  {
    slug: 'lawn-maintenance',
    name: 'Lawn Maintenance',
    gbpCategory: 'Lawn Care Service',
    excerpt: 'Recurring mowing, fertilization, aeration, and overseeding to keep your lawn thick and green all season.',
    intro:
      'Our lawn maintenance services keep your property healthy and sharp from spring through fall. From weekly mowing to a full fertilization and weed-control program, we handle the recurring work that makes a lawn thrive — so you don\'t have to think about it.',
    faqs: [
      { question: 'What lawn maintenance services do you offer?', answer: 'We offer weekly and bi-weekly mowing, multi-step fertilization and weed control, core aeration, and overseeding. Most customers combine several of these into a season-long plan.' },
      { question: 'Do you offer season-long lawn care plans?', answer: 'Yes. We build a plan around your lawn\'s needs — typically mowing plus a treatment program, with aeration and overseeding in the fall — and handle the scheduling for you.' },
      { question: 'Is lawn maintenance available year-round?', answer: 'Our core maintenance runs through the growing season (April–October). We also offer spring and fall cleanups to bookend the season — see our Yard Cleanup services.' },
    ],
  },
  {
    slug: 'yard-cleanup',
    name: 'Yard Cleanup',
    gbpCategory: 'Landscaper',
    excerpt: 'Seasonal spring and fall cleanups to prepare your yard for the growing season and protect it through winter.',
    intro:
      'Our yard cleanup services bookend the growing season. In spring we clear winter debris and get your beds and lawn ready to grow; in fall we remove leaves and prep your property for winter so it comes back strong. Both keep your yard tidy and your lawn healthy.',
    faqs: [
      { question: 'When should I schedule spring and fall cleanups?', answer: 'Spring cleanups typically run late March through April; fall cleanups run late October through early December. Booking early gets you a better spot on the schedule.' },
      { question: 'Do you haul away the debris?', answer: 'Yes. All leaves, clippings, and debris collected during a cleanup are removed from your property.' },
      { question: 'Why does seasonal cleanup matter for my lawn?', answer: 'Debris and matted leaves trap moisture and promote mold and disease over winter. Clearing them protects your turf and gives it a clean start each season.' },
    ],
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
