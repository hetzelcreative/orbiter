export interface FAQ {
  question: string;
  answer: string;
}

export interface Service {
  slug: string;
  name: string;
  excerpt: string;
  description: string;
  faqs: FAQ[];
}

export const services: Service[] = [
  {
    slug: 'lawn-mowing',
    name: 'Lawn Mowing',
    excerpt: 'Professional weekly and bi-weekly mowing services to keep your lawn looking pristine.',
    description: 'Our professional lawn mowing service keeps your property looking its best all season long. We offer weekly and bi-weekly mowing schedules tailored to your lawn\'s needs, including trimming, edging, and blowing off hard surfaces.',
    faqs: [
      { question: 'How often should my lawn be mowed?', answer: 'Most lawns in our area do best with weekly mowing during the growing season (April–October). We also offer bi-weekly schedules for slower-growing lawns.' },
      { question: 'Do you include trimming and edging?', answer: 'Yes. Every mow includes string trimming around obstacles, edging along sidewalks and driveways, and blowing off hard surfaces.' },
      { question: 'What height do you cut the grass?', answer: 'We typically mow at 3–3.5 inches, which is ideal for cool-season grasses in Iowa. We can adjust based on your preference and grass type.' },
    ],
  },
  {
    slug: 'lawn-treatment-programs',
    name: 'Lawn Treatment Programs',
    excerpt: 'Customized fertilization and weed control programs for a thick, healthy lawn.',
    description: 'Our lawn treatment programs include a multi-step fertilization and weed control plan customized for your soil and grass type. We use professional-grade products to promote thick, green growth while keeping weeds at bay.',
    faqs: [
      { question: 'How many applications are in a treatment program?', answer: 'Our standard program includes 5–6 applications spread across the growing season, from early spring pre-emergent through late fall winterizer.' },
      { question: 'Are the products safe for kids and pets?', answer: 'Yes. We use EPA-registered products and follow all label guidelines. We recommend staying off treated areas until dry, usually 1–2 hours.' },
      { question: 'When will I see results?', answer: 'Most customers notice greener, thicker grass within 2–3 weeks of the first application. Full results build over the course of the season.' },
    ],
  },
  {
    slug: 'aeration',
    name: 'Aeration',
    excerpt: 'Core aeration to relieve soil compaction and promote deeper root growth.',
    description: 'Core aeration removes small plugs of soil from your lawn, relieving compaction and allowing water, air, and nutrients to reach the root zone. This service is essential for maintaining a healthy, resilient lawn.',
    faqs: [
      { question: 'When is the best time to aerate?', answer: 'Fall is the ideal time for aeration in Iowa, typically September through mid-October. Spring aeration can also be beneficial for heavily compacted lawns.' },
      { question: 'What happens to the soil plugs?', answer: 'The small plugs left on the surface break down naturally within 1–2 weeks and return nutrients to the soil. We recommend leaving them in place.' },
      { question: 'How often should I aerate my lawn?', answer: 'Most residential lawns benefit from annual aeration. Lawns with heavy clay soil or high foot traffic may benefit from twice-yearly treatment.' },
    ],
  },
  {
    slug: 'overseeding',
    name: 'Overseeding',
    excerpt: 'Thicken your lawn and fill in bare spots with premium grass seed.',
    description: 'Overseeding introduces new grass seed into your existing lawn to fill in thin or bare areas. Combined with aeration, overseeding is one of the most effective ways to improve lawn density and crowd out weeds.',
    faqs: [
      { question: 'Should I combine overseeding with aeration?', answer: 'Absolutely. Aeration creates the perfect seed-to-soil contact for germination. We recommend doing both at the same time for the best results.' },
      { question: 'What type of seed do you use?', answer: 'We use a premium blend of turf-type tall fescue and Kentucky bluegrass suited for Southwest Iowa\'s climate and soil conditions.' },
      { question: 'How long until the new grass comes in?', answer: 'You should see germination within 10–14 days. The new grass will fill in and blend with your existing lawn over the following 4–6 weeks.' },
    ],
  },
  {
    slug: 'spring-cleanup',
    name: 'Spring Cleanup',
    excerpt: 'Get your yard ready for the growing season with a thorough spring cleanup.',
    description: 'Our spring cleanup service prepares your property for the growing season. We remove leaves and debris, clean out beds, trim back dead growth, and give your lawn its first mow of the year.',
    faqs: [
      { question: 'What does a spring cleanup include?', answer: 'We remove leftover leaves and debris, trim back dead perennials and ornamental grasses, clean out landscape beds, and give your lawn its first mow and edge of the season.' },
      { question: 'When should I schedule spring cleanup?', answer: 'We typically start spring cleanups in late March or early April, depending on weather. The earlier you schedule, the better chance of getting your preferred date.' },
      { question: 'Do you haul away the debris?', answer: 'Yes. All debris collected during cleanup is removed from your property.' },
    ],
  },
  {
    slug: 'fall-cleanup',
    name: 'Fall Cleanup',
    excerpt: 'Leaf removal and end-of-season preparation to protect your lawn through winter.',
    description: 'Our fall cleanup service removes leaves and debris from your lawn and beds before winter sets in. Proper fall cleanup prevents mold, disease, and damage so your lawn comes back strong in the spring.',
    faqs: [
      { question: 'Why is fall cleanup important?', answer: 'Leaves left on the lawn over winter trap moisture, promote mold and fungal disease, and can smother the grass. Removing them protects your lawn\'s health for spring.' },
      { question: 'How many visits does fall cleanup take?', answer: 'It depends on your property and tree coverage. Most customers need 1–2 visits between late October and early December.' },
      { question: 'Do you clean out landscape beds too?', answer: 'Yes. We remove leaves and debris from beds, along with the lawn, so your entire property is ready for winter.' },
    ],
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
