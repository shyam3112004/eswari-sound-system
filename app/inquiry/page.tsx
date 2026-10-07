'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2, Send } from 'lucide-react';

const STEPS = [
  {
    num: '01',
    title: 'Scope lands with the desk',
    desc: 'Your rider, crowd size and dates go straight to the senior sound designer — not a call centre.',
  },
  {
    num: '02',
    title: 'Itemised quotation in 24 hours',
    desc: 'Line array count, lighting plot, generators and crew, priced as one line per item.',
  },
  {
    num: '03',
    title: 'Date held while you decide',
    desc: 'A 25% advance locks the rig on the operations calendar; balance settles on site.',
  },
];

export default function InquiryPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: 'College Cultural Music Fest',
    eventDate: '',
    durationDays: '1',
    crowdSize: '5,000 - 10,000',
    venue: '',
    message: '',
  });

  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([
    'Flown 8-16 Box Line Array',
    'Intelligent Moving Heads',
    'Dual Silent Generators',
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleSpec = (spec: string) => {
    setSelectedSpecs((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const consolidatedMessage = `
[Crowd Scale: ${formData.crowdSize}]
[Duration: ${formData.durationDays} Day(s)]
[Technical Inclusions: ${selectedSpecs.join(', ')}]
[Client Notes: ${formData.message}]
      `.trim();

      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          eventType: formData.eventType,
          eventDate: formData.eventDate || undefined,
          venue: formData.venue,
          message: consolidatedMessage,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit quotation request');
      }

      setSuccessId(data.inquiryId);
    } catch (err: any) {
      setError(err.message || 'Submission error');
    } finally {
      setSubmitting(false);
    }
  };

  if (successId) {
    return (
      <div className="min-h-screen bg-ink text-white">
        <div className="container-page pt-28 lg:pt-36 pb-24 max-w-3xl">
          <span className="label label-amber">Dispatched · quotation desk</span>
          <h1 className="font-heading text-h1 text-white mt-4">
            Request received
          </h1>
          <p className="mt-5 text-body text-fg-muted leading-relaxed max-w-measure">
            The senior sound designer and fleet coordinator will read your
            rider and come back within 24 hours with an itemised proposal —
            line array count, lighting plot, power and crew, priced per item.
          </p>

          <div className="mt-10 border-t border-white/[0.12] pt-5 flex flex-wrap items-baseline justify-between gap-4">
            <span className="label">Inquiry tracking ID</span>
            <span className="font-mono text-amber font-bold">{successId}</span>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-start gap-6">
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER || '919876543210'}?text=${encodeURIComponent(`Hi Eswari Sound System, I have submitted a quotation request with ID: ${successId}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-[2px] bg-fg text-ink font-mono text-[11px] font-semibold uppercase tracking-[0.16em] hover:bg-white transition-colors"
            >
              Follow up on WhatsApp
            </a>
            <Link href="/" className="link-arrow">
              <span>Back to homepage</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const techSpecs = [
    'Flown 8-16 Box Line Array',
    'Intelligent Moving Heads',
    'Cardioid Subwoofer Array',
    'P3.9 Outdoor LED Wall',
    'Dual Silent Generators',
    '32-Channel Digital Stage Box',
    'Modular Walnut Stage Decking',
    'Dedicated FOH Sound Engineer',
  ];

  return (
    <div className="min-h-screen bg-ink text-white">
      {/* Header */}
      <div className="container-page pt-24 lg:pt-32 pb-8">
        <div className="max-w-3xl">
          <span className="label label-amber">Arena festivals & tour production</span>
          <h1 className="font-heading text-h1 text-white mt-4">
            Request a custom festival quotation
          </h1>
          <p className="mt-5 text-body text-fg-muted leading-relaxed max-w-measure">
            Multi-day music festivals, college cultural summits and arena
            tours. Tell us the venue geometry and crowd — we model the system
            around it, then price it line by line.
          </p>
        </div>
      </div>

      <div className="container-page grid grid-cols-1 lg:grid-cols-12 gap-x-14 gap-y-14 pt-8 pb-24">
        {/* Left rail: how the quotation runs */}
        <aside className="lg:col-span-4">
          <div className="border-b border-white/[0.12] pb-4">
            <span className="label">How this runs</span>
          </div>
          {STEPS.map((s) => (
            <div key={s.num} className="border-b border-white/[0.12] py-6">
              <div className="flex items-baseline gap-4">
                <span className="numeral text-h4">{s.num}</span>
                <h2 className="font-heading text-base font-bold text-white">
                  {s.title}
                </h2>
              </div>
              <p className="mt-2.5 text-small text-fg-muted leading-relaxed max-w-measure">
                {s.desc}
              </p>
            </div>
          ))}

          <div className="border-l-2 border-amber pl-5 py-6">
            <p className="font-heading text-base font-bold text-white">
              Show inside the week?
            </p>
            <p className="mt-1.5 text-small text-fg-muted leading-relaxed max-w-measure">
              Ring the depot line instead. Multi-rig deployments are quoted on
              the call, not by form.
            </p>
            <a
              href="tel:+919876543210"
              className="link-arrow mt-4 inline-flex"
            >
              <span>+91 98765 43210</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </a>
          </div>
        </aside>

        {/* Right: underline form */}
        <div className="lg:col-span-8 lg:border-l lg:border-white/10 lg:pl-14">
          <div className="border-b border-white/[0.12] pb-4">
            <span className="label">Rider &amp; scope</span>
          </div>

          {error && (
            <div className="alert alert-error mt-6" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="pt-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <label className="field-label" htmlFor="inq-name">
                  Contact person
                </label>
                <input
                  id="inq-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh V"
                  className="field"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="inq-phone">
                  Phone number
                </label>
                <input
                  id="inq-phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="9876543210"
                  className="field font-mono"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="inq-email">
                  Email address
                </label>
                <input
                  id="inq-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ramesh@festival.org"
                  className="field"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <label className="field-label" htmlFor="inq-type">
                  Event category
                </label>
                <select
                  id="inq-type"
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  className="field bg-ink"
                >
                  <option value="College Cultural Music Fest">College cultural music fest</option>
                  <option value="Multi-Day Music Festival">Multi-day music festival</option>
                  <option value="Mega Concert / Arena Tour">Mega concert / arena tour</option>
                  <option value="Temple / Spiritual Gathering">Temple / spiritual gathering</option>
                  <option value="Political Rally / Public Address">Political rally / public address</option>
                  <option value="Corporate Global Summit">Corporate global summit</option>
                </select>
              </div>
              <div>
                <label className="field-label" htmlFor="inq-date">
                  Tentative date
                </label>
                <input
                  id="inq-date"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="field font-mono"
                />
              </div>
              <div>
                <label className="field-label" htmlFor="inq-crowd">
                  Expected audience
                </label>
                <select
                  id="inq-crowd"
                  value={formData.crowdSize}
                  onChange={(e) => setFormData({ ...formData, crowdSize: e.target.value })}
                  className="field bg-ink"
                >
                  <option value="1,000 - 3,000">1,000 – 3,000 attendees</option>
                  <option value="3,000 - 6,000">3,000 – 6,000 attendees</option>
                  <option value="6,000 - 12,000">6,000 – 12,000 attendees</option>
                  <option value="12,000+ Stadium Scale">12,000+ stadium scale</option>
                </select>
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="inq-venue">
                Venue location &amp; city
              </label>
              <input
                id="inq-venue"
                type="text"
                required
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g. YMCA Grounds, Royapettah, Chennai (outdoor open air)"
                className="field"
              />
            </div>

            {/* Capability list — quiet rows, dot marks the selection */}
            <div>
              <span className="field-label">Required production capabilities</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
                {techSpecs.map((spec) => {
                  const isSelected = selectedSpecs.includes(spec);
                  return (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => toggleSpec(spec)}
                      aria-pressed={isSelected}
                      className={`text-left border-b border-white/[0.12] py-3 text-small transition-colors flex items-center justify-between gap-4 ${
                        isSelected ? 'text-white' : 'text-fg-muted hover:text-fg-soft'
                      }`}
                    >
                      <span className={isSelected ? 'marker-dot' : 'pl-4'}>
                        {spec}
                      </span>
                      <span
                        className={`label shrink-0 ${isSelected ? 'label-amber' : ''}`}
                      >
                        {isSelected ? 'In scope' : 'Add'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="inq-notes">
                Band / artist rider notes
              </label>
              <textarea
                id="inq-notes"
                rows={4}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Input list, monitor requirements, drum risers, generator specs or sound-check schedule…"
                className="field resize-none"
              />
            </div>

            <div className="hairline pt-7 flex flex-wrap items-center justify-between gap-5">
              <p className="label max-w-[36ch]">
                One arena or multi-stage event per date
              </p>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                    <span>Sending rider</span>
                  </>
                ) : (
                  <>
                    <span>Submit quotation request</span>
                    <Send className="w-4 h-4" aria-hidden />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
