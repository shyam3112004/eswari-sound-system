'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const DEPOTS = [
  {
    name: 'Madurai — headquarters & central depot',
    address: 'No. 14, Bypass Road, Ponmeni, Madurai, Tamil Nadu 625016',
    note: 'Acoustic calibration lab · line-array & truss storage',
  },
  {
    name: 'Chennai — regional logistics depot',
    address: 'Industrial Estate Phase II, Guindy, Chennai, Tamil Nadu 600032',
    note: 'North Tamil Nadu dispatch · concert tour load-outs',
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          eventType: 'General Production Inquiry',
          message: formData.message,
        }),
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Contact submission error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-white">
      {/* Header */}
      <div className="container-page pt-24 lg:pt-32 pb-4">
        <div className="max-w-3xl">
          <span className="label label-amber">Depots · direct crew dispatch</span>
          <h1 className="font-heading text-h1 text-white mt-4">
            Talk to the engineers, not a call centre
          </h1>
          <p className="mt-5 text-body text-fg-muted leading-relaxed max-w-measure">
            No middleman agents. The person who picks up in Ponmeni or Guindy is
            on the operations team that will load your rig.
          </p>
        </div>
      </div>

      <div className="container-page grid grid-cols-1 lg:grid-cols-12 gap-x-14 gap-y-14 pt-12 pb-20">
        {/* Left: depots & direct lines, plain text blocks on hairlines */}
        <div className="lg:col-span-5">
          <div className="border-b border-white/[0.12] pb-4">
            <span className="label">Depots</span>
          </div>

          {DEPOTS.map((depot) => (
            <div key={depot.name} className="border-b border-white/[0.12] py-7">
              <h2 className="font-heading text-h4 text-white">{depot.name}</h2>
              <p className="mt-2 text-small text-fg-muted leading-relaxed max-w-measure">
                {depot.address}
              </p>
              <p className="mt-2 label label-amber !tracking-[0.12em]">{depot.note}</p>
            </div>
          ))}

          <div className="border-b border-white/[0.12] py-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <span className="label block mb-2">Depot line</span>
              <a href="tel:+919876543210" className="link-plain font-mono text-small">
                +91 98765 43210
              </a>
              <br />
              <a href="tel:+919876543211" className="link-plain font-mono text-small">
                +91 98765 43211
              </a>
            </div>
            <div>
              <span className="label block mb-2">Email</span>
              <a
                href="mailto:contact@eswarisound.com"
                className="link-plain font-mono text-small break-all"
              >
                contact@eswarisound.com
              </a>
            </div>
          </div>

          {/* 24/7 support — highlighted text line, not a panel */}
          <div className="border-l-2 border-amber pl-5 py-6">
            <p className="font-heading text-base font-bold text-white">
              24/7 live event technical support
            </p>
            <p className="mt-1.5 text-small text-fg-muted leading-relaxed max-w-measure">
              During an active deployment weekend, field dispatch is reachable at
              every hour — including the 2 a.m. reset after a wedding hall.
            </p>
          </div>

          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER || '919876543210'}?text=Hi%20Eswari%20Sound%20System,%20I%20would%20like%20to%20inquire%20about%20a%20stage%20sound%20rig.`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 w-full inline-flex items-center justify-center gap-2 py-4 rounded-[2px] bg-fg text-ink font-mono text-[11px] font-semibold uppercase tracking-[0.16em] hover:bg-white transition-colors"
          >
            Chat on WhatsApp
          </a>
        </div>

        {/* Right: underline-only form */}
        <div className="lg:col-span-7 lg:border-l lg:border-white/10 lg:pl-14">
          <div className="border-b border-white/[0.12] pb-4">
            <span className="label">Send a direct message</span>
          </div>

          {submitted ? (
            <div className="py-16 max-w-measure">
              <span className="label label-amber">Received</span>
              <h2 className="font-heading text-h3 text-white mt-3">
                Message logged with the production desk
              </h2>
              <p className="mt-4 text-body text-fg-muted leading-relaxed">
                A coordinator will call you back on the number you left, usually
                the same working day. If the show is within the week, ring the
                depot line directly.
              </p>
              <a href="tel:+919876543210" className="link-arrow mt-7">
                <span>+91 98765 43210</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden />
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="pt-8 space-y-8">
              <div>
                <label className="field-label" htmlFor="contact-name">
                  Full name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Anand Sundaram"
                  className="field"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label className="field-label" htmlFor="contact-phone">
                    Phone number
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="9876543210"
                    className="field font-mono"
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="contact-email">
                    Email address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="anand@example.com"
                    className="field"
                  />
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="contact-message">
                  Event scope &amp; equipment required
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Date, venue city, indoor or outdoor, expected audience, and what you need on stage…"
                  className="field resize-none"
                />
              </div>

              <button type="submit" className="btn-primary w-full sm:w-auto">
                Submit inquiry
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Map — hairline-separated, no card */}
      <div className="border-t border-white/[0.12]">
        <div className="container-page section-tight">
          <div className="flex items-baseline justify-between gap-4 pb-5">
            <span className="label">Madurai depot · Bypass Road, Ponmeni</span>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Ponmeni+Madurai"
              target="_blank"
              rel="noopener noreferrer"
              className="link-arrow"
            >
              <span>Open in maps</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </a>
          </div>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916!2d80.2707!3d13.0827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA0JzU3LjciTiA4MMKwMTYnMTQuNSJF!5e0!3m2!1sen!2sin!4v1"
            width="100%"
            height="380"
            style={{
              border: 0,
              filter: 'invert(90%) hue-rotate(180deg) brightness(85%) contrast(120%)',
            }}
            allowFullScreen={false}
            loading="lazy"
            title="Eswari Sound System depot location, Ponmeni, Madurai"
          />
        </div>
      </div>
    </div>
  );
}
