import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-ink border-t border-white/[0.12] pt-20 pb-12">
      <div className="container-page">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-10 gap-y-12">
          {/* Brand */}
          <div className="lg:col-span-5 lg:pr-16">
            <div className="flex items-baseline gap-3">
              <span aria-hidden className="block h-6 w-[3px] bg-amber" />
              <span className="font-heading text-xl font-bold tracking-tight text-white">
                ESWARI SOUND SYSTEM
              </span>
            </div>
            <p className="mt-5 text-small text-fg-muted leading-relaxed max-w-measure">
              Concert sound, line-array deployment, stage trussing and DMX lighting
              out of Madurai and Chennai. Own the gear, run the crew, answer the
              phone at 2 a.m. — that has been the whole business since 1998.
            </p>
            <p className="mt-6 label label-amber">Direct crew · in-house gear · 0% brokerage</p>
          </div>

          {/* Explore */}
          <nav
            className="lg:col-span-3 lg:border-l lg:border-white/[0.12] lg:pl-10"
            aria-label="Explore"
          >
            <h4 className="label mb-5 text-fg">Live stages &amp; systems</h4>
            <ul className="space-y-3 text-small">
              <li>
                <Link href="/packages" className="link-plain">
                  Line-array audio rigs
                </Link>
              </li>
              <li>
                <Link href="/packages?tab=materials" className="link-plain">
                  Materials rent
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="link-plain">
                  Live concert gallery
                </Link>
              </li>
              <li>
                <Link href="/about" className="link-plain">
                  Engineering &amp; crew legacy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="link-plain">
                  Depot &amp; contact
                </Link>
              </li>
            </ul>
          </nav>

          {/* Client portal */}
          <nav
            className="lg:col-span-2 lg:border-l lg:border-white/[0.12] lg:pl-10"
            aria-label="Client portal"
          >
            <h4 className="label mb-5 text-fg">Client portal</h4>
            <ul className="space-y-3 text-small">
              <li>
                <Link href="/book" className="link-plain">
                  Book stage rig
                </Link>
              </li>
              <li>
                <Link href="/inquiry" className="link-plain">
                  Request a quote
                </Link>
              </li>
              <li>
                <Link href="/my-bookings" className="link-plain">
                  My bookings &amp; invoices
                </Link>
              </li>
              <li>
                <Link href="/admin" className="link-plain text-fg-muted">
                  Staff console
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <div className="lg:col-span-2 lg:border-l lg:border-white/[0.12] lg:pl-10">
            <h4 className="label mb-5 text-fg">Direct contact</h4>
            <div className="space-y-3 text-small text-fg-muted">
              <p className="leading-relaxed">
                Main depot, Madurai
                <br />
                Logistics hub, Guindy
              </p>
              <p>
                <a href="tel:+919876543210" className="link-plain font-mono text-xs">
                  +91 98765 43210
                </a>
                <br />
                <a href="tel:+919876543211" className="link-plain font-mono text-xs">
                  +91 98765 43211
                </a>
              </p>
              <p>
                <a href="mailto:contact@eswarisound.com" className="link-plain font-mono text-xs break-all">
                  contact@eswarisound.com
                </a>
              </p>
              <p className="label pt-1">24/7 event technical support</p>
            </div>
          </div>
        </div>

        <div className="hairline mt-16 pt-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 label">
          <p>
            © {new Date().getFullYear()} Eswari Sound System · Single direct provider
          </p>
          <p>Payments secured by Razorpay</p>
        </div>
      </div>
    </footer>
  );
}
