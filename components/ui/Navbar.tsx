'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone } from 'lucide-react';
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

/** Nav link: plain text, amber underline slides in when active or hovered. */
function NavLink({
  href,
  label,
  active,
  onClick,
  className,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative py-1 text-[13px] tracking-wide transition-colors whitespace-nowrap',
        active ? 'text-white' : 'text-fg-muted hover:text-white',
        className
      )}
    >
      {label}
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute left-0 -bottom-0.5 h-px w-full origin-left bg-amber transition-transform duration-300 ease-editorial',
          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
        )}
      />
    </Link>
  );
}

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
      <div
        ref={sentinelRef}
        className="absolute left-0 top-0 w-px h-20 pointer-events-none"
        aria-hidden
      />
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color] duration-300',
          scrolled ? 'glass-panel py-3' : 'bg-transparent py-5'
        )}
      >
        <div className="container-page">
          <div className="flex items-center justify-between gap-4">
            {/* Logo & Identity */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <span
                aria-hidden
                className="block h-8 w-[3px] bg-amber transition-transform duration-300 ease-editorial group-hover:scale-y-110"
              />
              <span className="flex flex-col leading-tight">
                <span className="font-heading text-lg font-bold tracking-tight text-white">
                  ESWARI
                </span>
                <span className="hidden sm:block label !tracking-[0.22em] !text-[9px] text-fg-muted">
                  Concert audio &amp; stage rigging
                </span>
              </span>
            </Link>

            {/* Desktop navigation: single line */}
            <nav className="hidden lg:flex items-center gap-7" aria-label="Primary">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  active={isActive(link.href)}
                />
              ))}
            </nav>

            {/* Action CTAs */}
            <div className="hidden lg:flex items-center gap-5 shrink-0">
              <a
                href="tel:+919876543210"
                className="font-mono text-xs text-fg-muted hover:text-amber transition-colors"
              >
                <span className="sr-only sm:not-sr-only">+91 98765 43210</span>
              </a>

              <AuthButton />

              <Link href="/book" className="btn-primary btn-primary-sm">
                Book Stage Rig
              </Link>
            </div>

            {/* Mobile trigger */}
            <div className="flex lg:hidden items-center gap-3 shrink-0">
              <AuthButton />
              <Link href="/book" className="btn-primary btn-primary-sm !px-3">
                Book
              </Link>
              <button
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="p-2 text-fg-soft hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-amber"
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
          <div className="lg:hidden glass-panel border-t border-white/10 px-5 pt-5 pb-7 mt-2">
            <nav className="flex flex-col" aria-label="Mobile">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  active={isActive(link.href)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="hairline py-3.5 text-sm"
                />
              ))}
            </nav>
            <div className="pt-5 mt-1 flex flex-col gap-4">
              <a
                href="tel:+919876543210"
                className="link-arrow text-fg-muted"
              >
                <Phone className="w-3.5 h-3.5" aria-hidden />
                <span>+91 98765 43210</span>
              </a>
              <Link
                href="/inquiry"
                onClick={() => setMobileMenuOpen(false)}
                className="link-arrow"
              >
                <span>Request a quote</span>
              </Link>
              <Link
                href="/my-bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="link-arrow"
              >
                <span>My bookings</span>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
