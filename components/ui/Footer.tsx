import React from 'react';
import Link from 'next/link';
import { Volume2, MapPin, Phone, Mail, ShieldCheck, Clock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-ink border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber flex items-center justify-center text-ink">
                <Volume2 className="w-5 h-5 text-ink stroke-[2.5]" aria-hidden />
              </div>
              <span className="font-heading text-lg font-bold tracking-tight text-white">
                ESWARI <span className="text-amber font-normal">SOUND SYSTEM</span>
              </span>
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Tamil Nadu&apos;s single-provider concert sound, line array
              deployment, stage trussing and intelligent DMX lighting since 1998.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-amber font-mono">
              <ShieldCheck className="w-4 h-4" aria-hidden />
              <span>Direct crew, in-house gear, 0% brokerage</span>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-heading text-xs uppercase tracking-widest text-white/90 mb-4 font-semibold">
              Live Stage & Systems
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-400 font-normal">
              <li>
                <Link href="/packages" className="hover:text-amber transition-colors">
                  Line-Array Audio Rigs
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-amber transition-colors">
                  Live Concert Gallery
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber transition-colors">
                  Engineering &amp; Crew Legacy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber transition-colors">
                  Depot &amp; Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Client portal */}
          <div>
            <h4 className="font-heading text-xs uppercase tracking-widest text-white/90 mb-4 font-semibold">
              Client Portal
            </h4>
            <ul className="space-y-2.5 text-sm text-neutral-400">
              <li>
                <Link href="/book" className="hover:text-amber transition-colors">
                  Book Stage Rig
                </Link>
              </li>
              <li>
                <Link href="/inquiry" className="hover:text-amber transition-colors">
                  Request a Quote
                </Link>
              </li>
              <li>
                <Link href="/my-bookings" className="hover:text-amber transition-colors">
                  My Bookings &amp; Invoices
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="hover:text-neutral-200 text-xs text-neutral-600 transition-colors inline-block mt-1"
                >
                  Staff Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-xs uppercase tracking-widest text-white/90 mb-4 font-semibold">
              Direct Contact
            </h4>
            <div className="space-y-3 text-sm text-neutral-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber shrink-0 mt-1" aria-hidden />
                <span className="text-xs text-neutral-400">
                  Main depot &amp; studio, Chennai and Madurai logistics hub,
                  Tamil Nadu
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber shrink-0" aria-hidden />
                <a
                  href="tel:+919876543210"
                  className="text-xs font-mono hover:text-amber transition-colors"
                >
                  +91 98765 43210 / +91 98765 43211
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber shrink-0" aria-hidden />
                <a
                  href="mailto:contact@eswarisound.com"
                  className="text-xs font-mono hover:text-amber transition-colors"
                >
                  contact@eswarisound.com
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-neutral-500 font-mono pt-1">
                <Clock className="w-3.5 h-3.5 text-neutral-400" aria-hidden />
                <span>24/7 event technical support</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>
            © {new Date().getFullYear()} Eswari Sound System. All rights
            reserved. Single direct provider.
          </p>
          <span>Payments secured by Razorpay</span>
        </div>
      </div>
    </footer>
  );
}
