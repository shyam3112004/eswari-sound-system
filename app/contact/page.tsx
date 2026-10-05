'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Send,
  MessageSquare,
  CheckCircle2,
  Radio,
} from 'lucide-react';

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
    <div className="min-h-screen bg-ink text-white py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-amber/30 text-amber text-xs font-mono uppercase tracking-widest">
          <Radio className="w-3.5 h-3.5 text-amber animate-pulse" />
          <span>Direct Crew & Fleet Dispatch</span>
        </div>

        <h1 className="font-heading text-4xl sm:text-5xl font-black text-white tracking-tight">
          Connect Directly With Our <span className="text-gradient-amber">Production Depot</span>
        </h1>

        <p className="text-sm sm:text-base text-neutral-300 font-normal leading-relaxed">
          Zero middleman agents. Speak directly with our lead acoustic engineers and logistics heads in Chennai and Madurai.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        {/* Contact Info & Depots */}
        <div className="space-y-8">
          <div className="glass-card-amber rounded-3xl p-8 border border-amber/30 space-y-6 shadow-2xl">
            <h2 className="font-heading text-2xl font-bold text-white">
              Logistics Depots & Engineering Hubs
            </h2>

            <div className="space-y-6 text-sm">
              <div className="flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-amber shrink-0 mt-1" />
                <div>
                  <div className="font-heading text-base font-bold text-white">
                    Madurai Headquarters & Central Depot
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    No. 14, Bypass Road, Ponmeni, Madurai, Tamil Nadu 625016
                  </p>
                  <span className="text-[11px] font-mono text-amber block mt-1">
                    Acoustic calibration lab & line-array fleet storage
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 border-t border-white/10 pt-4">
                <MapPin className="w-5 h-5 text-amber shrink-0 mt-1" />
                <div>
                  <div className="font-heading text-base font-bold text-white">
                    Chennai Regional Logistics Depot
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Industrial Estate Phase II, Guindy, Chennai, Tamil Nadu 600032
                  </p>
                  <span className="text-[11px] font-mono text-amber block mt-1">
                    North Tamil Nadu & concert tour dispatch hub
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <a
                href="tel:+919876543210"
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber/40 transition-all flex items-center gap-2.5"
              >
                <Phone className="w-4 h-4 text-amber shrink-0" />
                <span>+91 98765 43210</span>
              </a>

              <a
                href="mailto:contact@eswarisound.com"
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber/40 transition-all flex items-center gap-2.5"
              >
                <Mail className="w-4 h-4 text-amber shrink-0" />
                <span>contact@eswarisound.com</span>
              </a>
            </div>

            <div className="pt-2">
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER || '919876543210'}?text=Hi%20Eswari%20Sound%20System,%20I%20would%20like%20to%20inquire%20about%20a%20stage%20sound%20rig.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat Instantly On WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/10 flex items-center gap-4 text-xs font-mono text-neutral-400">
            <Clock className="w-5 h-5 text-amber shrink-0" />
            <div>
              <span className="text-white font-bold block">24/7 Live Event Technical Support</span>
              Our field dispatch teams are reachable 24 hours a day during active deployment weekends.
            </div>
          </div>
        </div>

        {/* Quick Message Form */}
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-white/10">
          <h2 className="font-heading text-2xl font-bold text-white mb-2">
            Send A Direct Message
          </h2>
          <p className="text-xs text-neutral-400 mb-8">
            Tell us about your event date, expected audience size, and venue location.
          </p>

          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-white">Message Dispatched</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Thank you. Our production coordinator will review your request and call you back shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono uppercase tracking-wider text-neutral-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Anand Sundaram"
                  className="w-full px-4 py-3 rounded-xl bg-ink/80 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono uppercase tracking-wider text-neutral-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full px-4 py-3 rounded-xl bg-ink/80 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber"
                  />
                </div>
                <div>
                  <label className="block font-mono uppercase tracking-wider text-neutral-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="anand@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-ink/80 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono uppercase tracking-wider text-neutral-300 mb-1">
                  Event Scope & Equipment Requirements
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Provide date, venue city, indoor/outdoor details, and acoustic preferences..."
                  className="w-full px-4 py-3 rounded-xl bg-ink/80 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber to-amber-soft text-ink font-semibold uppercase tracking-widest text-xs hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber/25 mt-4"
              >
                <Send className="w-4 h-4" />
                <span>Submit Direct Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Map Embed Section */}
      <div className="glass-card rounded-3xl overflow-hidden border border-white/10 p-2">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916!2d80.2707!3d13.0827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA0JzU3LjciTiA4MMKwMTYnMTQuNSJF!5e0!3m2!1sen!2sin!4v1"
          width="100%"
          height="380"
          style={{ border: 0, borderRadius: '1rem', filter: 'invert(90%) hue-rotate(180deg) brightness(85%) contrast(120%)' }}
          allowFullScreen={false}
          loading="lazy"
          title="Eswari Sound System Depot Location"
        />
      </div>
    </div>
  );
}
