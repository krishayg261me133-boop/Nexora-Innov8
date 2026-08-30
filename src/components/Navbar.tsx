import { useEffect, useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

const navLinks = [
  { label: 'At a Glance', href: '#glance' },
  { label: 'Markets', href: '#markets' },
  { label: 'Businesses', href: '#businesses' },
  { label: 'Leadership', href: '#leadership' },
  { label: 'Contact', href: '#contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-ink-950/85 backdrop-blur-xl border-b border-white/5'
          : 'bg-transparent'
      }`}
    >
      <nav className="container-px mx-auto flex max-w-container items-center justify-between h-20">
        <a href="#top" className="flex items-center gap-2 group">
          <span className="grid h-9 w-9 place-items-center rounded-lg accent-gradient text-ink-950 font-display font-extrabold text-lg shadow-lg shadow-accent-500/20">
            N
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-white">
            Nexora
          </span>
        </a>

        <ul className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-ink-200 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full accent-gradient px-5 py-2.5 text-sm font-semibold text-ink-950 transition-all hover:shadow-lg hover:shadow-accent-500/30 hover:-translate-y-0.5"
          >
            Contact Us
            <ChevronDown className="h-4 w-4 -rotate-90" />
          </a>
        </div>

        <button
          className="lg:hidden grid h-10 w-10 place-items-center rounded-lg text-white hover:bg-white/10"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <div
        className={`lg:hidden overflow-hidden transition-all duration-500 ${
          open ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <ul className="container-px mx-auto flex max-w-container flex-col gap-1 pb-6">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 rounded-lg text-base font-medium text-ink-200 hover:text-white hover:bg-white/5"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="pt-2">
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="block rounded-full accent-gradient px-5 py-3 text-center text-sm font-semibold text-ink-950"
            >
              Contact Us
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
