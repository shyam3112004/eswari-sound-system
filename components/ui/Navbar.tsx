'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Volume2, Menu, X, Calendar, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthButton } from './AuthButton';

const NAV_LINKS = [
  { href: '/', label: 'Experience' },
  { href: '/about', label: 'Legacy' },
  { href: '/packages', label: 'Stage Packages' },
  { href: '/packages?tab=materials', label: 'Materials Rent' },
  { href: '/gallery', label: 'Live Stages' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver sentinel instead of a scroll listener: the callback
  // only fires on threshold crossings, never per scroll frame.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href.split('?')[0];
  };

  return (
    <>
    {/* Out-of-flow sentinel at the document top (nav height): crosses the
        viewport threshold once the user scrolls past the navbar. */}
    <div ref={sentinelRef} className="absolute left-0 top-0 w-px h-20 pointer-events-none" aria-hidden />
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color] duration-300',
        scrolled
          ? 'glass-panel py-3'
          : 'bg-gradient-to-b from-ink/90 via-ink/50 to-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Identity */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-full bg-amber flex items-center justify-center text-ink group-hover:brightness-110 transition-[filter]">
              <Volume2 className="w-5 h-5 text-ink stroke-[2]" aria-hidden />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-heading text-lg font-bold tracking-tight text-white">
                ESWARI
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-widest text-neutral-400 font-mono">
                Concert audio & stage rigging
              </span>
            </div>
          </Link>

          {/* Desktop navigation: single line */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={cn(
                  'px-3 py-1.5 rounded-full text-[13px] font-medium tracking-wide transition-colors whitespace-nowrap',
                  link.href === '/packages?tab=materials' &&
                    !isActive(link.href) &&
                    'text-amber hover:bg-amber/10',
                  isActive(link.href) &&
                    link.href !== '/packages?tab=materials' &&
                    'bg-white/10 text-white',
                  !isActive(link.href) &&
                    link.href !== '/packages?tab=materials' &&
                    'text-neutral-400 hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <a
              href="tel:+919876543210"
              className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-amber font-mono transition-colors px-2"
            >
              <Phone className="w-3.5 h-3.5" aria-hidden />
              <span>+91 98765 43210</span>
            </a>

            <AuthButton />

            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-amber text-ink hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <Calendar className="w-3.5 h-3.5" aria-hidden />
              <span>Book Stage Rig</span>
            </Link>
          </div>

          {/* Mobile trigger */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            <AuthButton />
            <Link
              href="/book"
              className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-amber text-ink whitespace-nowrap"
            >
              Book Stage Rig
            </Link>
            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="p-2 text-neutral-300 hover:text-white rounded-lg focus:outline-none focus-visible:ring-1 focus-visible:ring-amber"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-panel border-t border-white/10 px-4 pt-4 pb-6 mt-2">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'bg-white/10 text-white'
                    : 'text-neutral-300 hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-3 mt-3 border-t border-white/10 flex flex-col gap-2">
            <Link
              href="/inquiry"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider border border-amber/40 text-amber hover:bg-amber/10 transition-colors"
            >
              Request a Quote
            </Link>
            <Link
              href="/my-bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl text-xs text-neutral-400 hover:text-white transition-colors"
            >
              My Bookings
            </Link>
          </div>
        </div>
      )}
    </header>
    </>
  );
}
