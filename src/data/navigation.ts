import { categories } from './categories';

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const mainNav: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about/' },
  {
    // Dropdown lists the category hubs (the top tier). Services live under
    // each hub, per the internal-linking model in CLAUDE.md.
    label: 'Services',
    href: '/services/',
    children: categories.map((c) => ({
      label: c.name,
      href: `/${c.slug}/`,
    })),
  },
  { label: 'Blog', href: '/blog/' },
  { label: 'Contact', href: '/contact/' },
];
