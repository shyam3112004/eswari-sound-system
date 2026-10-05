'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Radio,
  Send,
  Loader2,
  Calendar,
  Volume2,
  Zap,
  Layers,
  Phone,
} from 'lucide-react';

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
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-xl w-full text-center space-y-6 glass-card-amber rounded-3xl p-8 sm:p-12 border border-amber/30 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h1 className="font-heading text-3xl font-extrabold text-white">
            Custom Quotation Request Dispatched
          </h1>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Our Senior Sound Designer & Fleet Coordinator will review your stage rider specifications and contact you within 24 hours with an itemized proposal.
          </p>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 font-mono text-xs flex justify-between items-center text-neutral-300">
            <span>Inquiry Tracking ID:</span>
            <span className="text-amber font-bold">{successId}</span>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER || '919876543210'}?text=${encodeURIComponent(`Hi Eswari Sound System, I have submitted a quotation request with ID: ${successId}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <span>Instant WhatsApp Follow-up</span>
            </a>

            <Link
              href="/"
              className="flex-1 py-3.5 rounded-full glass-card hover:bg-white/10 text-white font-medium text-xs uppercase tracking-wider border border-white/20 transition-all flex items-center justify-center"
            >
              <span>Back To Homepage</span>
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
    <div className="min-h-screen bg-ink text-white py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-amber/30 text-amber text-xs font-mono uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 text-amber" />
          <span>Arena Festivals & Tour Production</span>
        </div>

        <h1 className="font-heading text-3xl sm:text-5xl font-black text-white tracking-tight">
          Request Custom <span className="text-gradient-amber">Festival Quotation</span>
        </h1>

        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
          Planning a multi-day music festival, college cultural summit, or large arena tour? We engineer customized acoustic modeling tailored to your exact venue geometry.
        </p>
      </div>

      <div className="glass-card rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                Contact Person Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ramesh V"
                className="w-full px-4 py-3 rounded-xl bg-ink/80 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber"
              />
            </div>

            <div>
              <label className="block font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                10-Digit Phone Number
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="9876543210"
                className="w-full px-4 py-3 rounded-xl bg-ink/80 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber font-mono"
              />
            </div>

            <div>
              <label className="block font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ramesh@festival.org"
                className="w-full px-4 py-3 rounded-xl bg-ink/80 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                Event Category
              </label>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-ink/80 border border-white/15 text-white focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber"
              >
                <option value="College Cultural Music Fest">College Cultural Music Fest</option>
                <option value="Multi-Day Music Festival">Multi-Day Music Festival</option>
                <option value="Mega Concert / Arena Tour">Mega Concert / Arena Tour</option>
                <option value="Temple / Spiritual Gathering">Temple / Spiritual Gathering</option>
                <option value="Political Rally / Public Address">Political Rally / Public Address</option>
                <option value="Corporate Global Summit">Corporate Global Summit</option>
              </select>
            </div>

            <div>
              <label className="block font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                Tentative Date
              </label>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-ink/80 border border-white/15 text-white focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber font-mono"
              />
            </div>

            <div>
              <label className="block font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                Expected Audience Size
              </label>
              <select
                value={formData.crowdSize}
                onChange={(e) => setFormData({ ...formData, crowdSize: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-ink/80 border border-white/15 text-white focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber"
              >
                <option value="1,000 - 3,000">1,000 - 3,000 Attendees</option>
                <option value="3,000 - 6,000">3,000 - 6,000 Attendees</option>
                <option value="6,000 - 12,000">6,000 - 12,000 Attendees</option>
                <option value="12,000+ Stadium Scale">12,000+ Stadium / Arena Scale</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
              Venue Location & City
            </label>
            <input
              type="text"
              required
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="e.g. YMCA Grounds, Royapettah, Chennai (Outdoor Open Air)"
              className="w-full px-4 py-3 rounded-xl bg-ink/80 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber"
            />
          </div>

          {/* Technical Specs Checklist */}
          <div>
            <label className="block font-mono uppercase tracking-wider text-neutral-300 mb-2">
              Select Required Production Capabilities
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {techSpecs.map((spec) => {
                const isSelected = selectedSpecs.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSpec(spec)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-amber/15 border-amber text-white font-medium'
                        : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>{spec}</span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                        isSelected ? 'border-amber bg-amber text-ink' : 'border-neutral-500'
                      }`}
                    >
                      {isSelected && '✓'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
              Specific Band / Artist Rider Notes
            </label>
            <textarea
              rows={4}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Specify live band input list, monitor requirements, drum risers, generator specs, or sound check schedules..."
              className="w-full px-4 py-3 rounded-xl bg-ink/80 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber to-amber-soft text-ink font-bold uppercase tracking-widest text-xs hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber/25 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Technical Inquiry...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Custom Quotation Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
