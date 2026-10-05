'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Volume2, Menu, X, Calendar, Phone, Sparkles, Film, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setIsAdmin(true);
      })
      .catch(() => {});

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Experience' },
    { href: '/about', label: 'Legacy' },
    { href: '/packages', label: 'Gear & Packages' },
    { href: '/gallery', label: 'Live Stages' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'glass-panel py-3 shadow-2xl'
          : 'bg-gradient-to-b from-ink/90 via-ink/40 to-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber to-amber-soft flex items-center justify-center text-ink font-bold shadow-lg shadow-amber/20 group-hover:scale-105 transition-transform">
              <Volume2 className="w-5 h-5 text-ink stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                ESWARI <span className="text-amber font-normal text-xs uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber/10 border border-amber/20">Sound</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono">
                Concert Audio & Stage Rigging
              </span>
            </div>
          </Link>

          {/* Desktop Navigation (No Box UI) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200',
                    isActive
                      ? 'bg-amber text-ink font-bold shadow-md shadow-amber/20'
                      : 'text-neutral-300 hover:text-white hover:bg-white/10'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin?tab=portfolio"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider text-amber border border-amber/40 hover:bg-amber hover:text-ink transition-all font-semibold"
                title="Admin: Upload & Manage Portfolio"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Portfolio [Admin]</span>
              </Link>
            )}

            <a
              href="tel:+919876543210"
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber font-mono transition-colors px-3 py-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-amber" />
              <span>+91 98765 43210</span>
            </a>
            
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-amber to-amber-soft text-ink hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber/25"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Stage Rig</span>
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            {isAdmin && (
              <Link
                href="/admin?tab=portfolio"
                className="px-2.5 py-1 rounded-full text-[11px] font-mono text-amber border border-amber/40"
              >
                Admin
              </Link>
            )}
            <Link
              href="/book"
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber text-ink"
            >
              Book
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-300 hover:text-white rounded-lg focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-white/10 px-4 pt-4 pb-6 space-y-3 mt-2 animate-in fade-in slide-in-from-top-2">
          {isAdmin && (
            <Link
              href="/admin?tab=portfolio"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-amber bg-amber/10 border border-amber/30 flex items-center justify-between"
            >
              <span>Portfolio Manager</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber text-ink font-bold">Admin</span>
            </Link>
          )}

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-amber text-ink font-semibold'
                  : 'text-neutral-300 hover:text-white hover:bg-white/5'
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <Link
              href="/inquiry"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl text-xs font-medium border border-amber/40 text-amber hover:bg-amber/10"
            >
              Request Custom Quote
            </Link>
            <Link
              href="/my-bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl text-xs text-neutral-400 hover:text-white"
            >
              Lookup Existing Booking
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
