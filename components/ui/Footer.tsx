import React from 'react';
import Link from 'next/link';
import { Volume2, MapPin, Phone, Mail, ShieldCheck, Clock, Award } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-ink border-t border-white/10 relative overflow-hidden pt-16 pb-12">
      {/* Background radial accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-48 bg-amber/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber to-amber-soft flex items-center justify-center text-ink font-bold shadow-lg shadow-amber/20">
                <Volume2 className="w-5 h-5 text-ink stroke-[2.5]" />
              </div>
              <span className="font-heading text-lg font-bold tracking-tight text-white">
                ESWARI <span className="text-amber font-light">SOUND SYSTEM</span>
              </span>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Tamil Nadu’s trusted single-provider concert sound, high-grade line array deployment, stage trussing, and intelligent DMX event lighting since 1998.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-amber font-mono">
              <ShieldCheck className="w-4 h-4 text-amber" />
              <span>Direct Crew & In-House Gear • 0% Brokerage</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-xs uppercase tracking-widest text-white/90 mb-4 font-semibold">
              Live Stage & Systems
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-400 font-normal">
              <li>
                <Link href="/packages" className="hover:text-amber transition-colors">Line-Array Audio Rigs</Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-amber transition-colors">Intelligent Stage Lighting</Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-amber transition-colors">Full Event Production Combos</Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-amber transition-colors">Live Concert Gallery</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber transition-colors">Engineering & Crew Legacy</Link>
              </li>
            </ul>
          </div>

          {/* Booking & Inquiries */}
          <div>
            <h4 className="font-heading text-xs uppercase tracking-widest text-white/90 mb-4 font-semibold">
              Client Portal
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <Link href="/book" className="hover:text-amber transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Instant Date Booking (25% Advance)
                </Link>
              </li>
              <li>
                <Link href="/inquiry" className="hover:text-amber transition-colors">
                  Custom Festival & Wedding Quote
                </Link>
              </li>
              <li>
                <Link href="/my-bookings" className="hover:text-amber transition-colors">
                  Check Booking Status & Invoice
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-neutral-200 text-xs text-neutral-600 transition-colors">
                  Staff Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-heading text-xs uppercase tracking-widest text-white/90 mb-4 font-semibold">
              Direct Contact
            </h4>
            <div className="space-y-3 text-sm text-neutral-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber shrink-0 mt-1" />
                <span className="text-xs text-neutral-400">
                  Main Depot & Studio, Chennai & Madurai Logistics Hub, Tamil Nadu
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber shrink-0" />
                <a href="tel:+919876543210" className="text-xs font-mono hover:text-amber transition-colors">
                  +91 98765 43210 / +91 98765 43211
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber shrink-0" />
                <a href="mailto:contact@eswarisound.com" className="text-xs font-mono hover:text-amber transition-colors">
                  contact@eswarisound.com
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-neutral-500 font-mono pt-1">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>24/7 Event Technical Support</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} Eswari Sound System. All rights reserved. Single Direct Provider.</p>
          <div className="flex items-center gap-6">
            <span>Security & Escrow via Razorpay</span>
            <span>Zero sub-contracting guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
