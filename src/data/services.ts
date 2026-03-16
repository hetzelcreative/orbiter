export interface Service {
  slug: string;
  name: string;
  excerpt: string;
  description: string;
}

export const services: Service[] = [
  {
    slug: 'lawn-mowing',
    name: 'Lawn Mowing',
    excerpt: 'Professional weekly and bi-weekly mowing services to keep your lawn looking pristine.',
    description: 'Our professional lawn mowing service keeps your property looking its best all season long. We offer weekly and bi-weekly mowing schedules tailored to your lawn\'s needs, including trimming, edging, and blowing off hard surfaces.',
  },
  {
    slug: 'lawn-treatment-programs',
    name: 'Lawn Treatment Programs',
    excerpt: 'Customized fertilization and weed control programs for a thick, healthy lawn.',
    description: 'Our lawn treatment programs include a multi-step fertilization and weed control plan customized for your soil and grass type. We use professional-grade products to promote thick, green growth while keeping weeds at bay.',
  },
  {
    slug: 'aeration',
    name: 'Aeration',
    excerpt: 'Core aeration to relieve soil compaction and promote deeper root growth.',
    description: 'Core aeration removes small plugs of soil from your lawn, relieving compaction and allowing water, air, and nutrients to reach the root zone. This service is essential for maintaining a healthy, resilient lawn.',
  },
  {
    slug: 'overseeding',
    name: 'Overseeding',
    excerpt: 'Thicken your lawn and fill in bare spots with premium grass seed.',
    description: 'Overseeding introduces new grass seed into your existing lawn to fill in thin or bare areas. Combined with aeration, overseeding is one of the most effective ways to improve lawn density and crowd out weeds.',
  },
  {
    slug: 'spring-cleanup',
    name: 'Spring Cleanup',
    excerpt: 'Get your yard ready for the growing season with a thorough spring cleanup.',
    description: 'Our spring cleanup service prepares your property for the growing season. We remove leaves and debris, clean out beds, trim back dead growth, and give your lawn its first mow of the year.',
  },
  {
    slug: 'fall-cleanup',
    name: 'Fall Cleanup',
    excerpt: 'Leaf removal and end-of-season preparation to protect your lawn through winter.',
    description: 'Our fall cleanup service removes leaves and debris from your lawn and beds before winter sets in. Proper fall cleanup prevents mold, disease, and damage so your lawn comes back strong in the spring.',
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
