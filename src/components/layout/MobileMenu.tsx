import { useState, useEffect } from 'react';

interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

interface MobileMenuProps {
  navItems: NavItem[];
  phone: string;
  phoneFormatted: string;
  ctaLabel: string;
  ctaHref: string;
  currentPath: string;
}

export function MobileMenu({ navItems, phone, phoneFormatted, ctaLabel, ctaHref, currentPath }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const isActive = (href: string) => {
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleExpanded = (label: string) => {
    setExpandedItem(expandedItem === label ? null : label);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger / Close Button */}
      <button
        onClick={toggleMenu}
        className={`md:hidden flex items-center justify-center size-10 transition-colors relative z-60 cursor-pointer ${isOpen ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? (
          <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Full-Screen Overlay */}
      <div
        className={`fixed inset-0 md:hidden overflow-y-auto transition-all duration-300 ease-in-out ${
          isOpen
            ? 'opacity-100 pointer-events-auto backdrop-blur-md'
            : 'opacity-0 pointer-events-none backdrop-blur-none'
        }`}
        style={{ background: 'rgba(17, 24, 39, 0.95)', zIndex: 50 }}
      >
        <div className="flex flex-col items-center justify-center min-h-full px-6 py-20">
          <nav className="w-full max-w-md">
            {navItems.map((item, index) => {
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItem === item.label;

              return (
                <div
                  key={item.label}
                  className={`transition-all duration-300 ${
                    isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: isOpen ? `${index * 50}ms` : '0ms' }}
                >
                  {hasChildren ? (
                    <>
                      <button
                        onClick={() => toggleExpanded(item.label)}
                        className={`w-full flex items-center justify-between py-4 hover:text-primary-400 transition-colors border-b border-white/10 cursor-pointer ${
                          item.children!.some((c) => isActive(c.href)) || isActive(item.href) ? 'text-primary-400' : 'text-white'
                        }`}
                      >
                        <span className="font-heading font-bold uppercase text-lg tracking-widest">
                          {item.label}
                        </span>
                        <svg
                          className={`size-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {isExpanded && (
                        <div className="pl-6 py-2">
                          {item.children!.map((child) => (
                            <a
                              key={child.label}
                              href={child.href}
                              className={`block py-3 hover:text-white transition-colors font-semibold ${
                                isActive(child.href) ? 'text-primary-400' : 'text-white/60'
                              }`}
                            >
                              {child.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <a
                      href={item.href}
                      className={`block py-4 hover:text-primary-400 transition-colors font-heading font-bold uppercase text-lg tracking-widest border-b border-white/10 ${
                        isActive(item.href) ? 'text-primary-400' : 'text-white'
                      }`}
                      {...(isActive(item.href) ? { 'aria-current': 'page' as const } : {})}
                    >
                      {item.label}
                    </a>
                  )}
                </div>
              );
            })}

            {/* Phone + CTA */}
            <div
              className={`mt-8 transition-all duration-300 ${
                isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: isOpen ? `${navItems.length * 50}ms` : '0ms' }}
            >
              <a
                href={`tel:${phone}`}
                className="block text-center text-primary-400 font-bold text-lg mb-6"
              >
                {phoneFormatted}
              </a>
              <a
                href={ctaHref}
                className="inline-flex items-center justify-center w-full px-8 py-4 bg-primary-600 text-white font-semibold uppercase tracking-widest rounded hover:bg-primary-700 transition-colors text-center"
              >
                {ctaLabel}
              </a>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
