'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Volume2,
  Calendar,
  Users,
  MapPin,
  ArrowRight,
  Filter,
  Play,
  Video,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Lock,
  Upload,
  Film,
  ShieldCheck,
} from 'lucide-react';

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  location: string;
  crowd?: string | null;
  specs?: string | null;
  tag?: string | null;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl?: string | null;
  eventDate?: string | null;
}

export default function GalleryPage() {
  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const categories = [
    { id: 'all', label: 'All Live Stages' },
    { id: 'concert', label: 'Live Concerts' },
    { id: 'wedding', label: 'Grand Weddings' },
    { id: 'college', label: 'College Fests' },
    { id: 'corporate', label: 'Corporate Summits' },
    { id: 'temple', label: 'Heritage & Festivals' },
  ];

  useEffect(() => {
    async function loadPortfolio() {
      setLoading(true);
      try {
        const res = await fetch('/api/portfolio');
        const data = await res.json();
        if (data.success && data.items && data.items.length > 0) {
          setItems(data.items);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error('Failed to load portfolio items:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPortfolio();

    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setIsAdmin(true);
      })
      .catch(() => {});
  }, []);

  const filteredItems =
    filter === 'all'
      ? items
      : items.filter((item) => item.category === filter);

  const activeModalItem =
    selectedItemIndex !== null && filteredItems[selectedItemIndex]
      ? filteredItems[selectedItemIndex]
      : null;

  const handleNext = () => {
    if (selectedItemIndex !== null) {
      setSelectedItemIndex((selectedItemIndex + 1) % filteredItems.length);
    }
  };

  const handlePrev = () => {
    if (selectedItemIndex !== null) {
      setSelectedItemIndex(
        (selectedItemIndex - 1 + filteredItems.length) % filteredItems.length
      );
    }
  };

  return (
    <div className="min-h-screen bg-ink text-white py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="flex items-center justify-center gap-2 text-amber text-xs font-mono uppercase tracking-[0.25em]">
          <Sparkles className="w-3.5 h-3.5 text-amber" />
          <span>PRODUCTION PORTFOLIO • 1,200+ LIVE STAGES</span>
        </div>

        <h1 className="font-heading text-4xl sm:text-6xl font-black text-white tracking-tight">
          Visual Heritage & <span className="text-gradient-amber">Stage Proof</span>
        </h1>

        <p className="text-sm sm:text-base text-neutral-300 font-normal leading-relaxed max-w-2xl mx-auto">
          From intimate acoustic weddings to 12,000+ attendee college cultural arenas, explore authentic photos and live video recordings from our completed stage setups across South India.
        </p>

        {/* Admin Only Portfolio Manager Action */}
        {isAdmin && (
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/admin?tab=portfolio"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber text-ink font-bold text-xs font-mono uppercase tracking-wider hover:brightness-110 transition-all active:scale-95"
            >
              <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Admin: + Upload New Project To Portfolio</span>
            </Link>
          </div>
        )}

        {/* Category Filters (Clean, No Box UI) */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
          {categories.map((c) => {
            const isActive = filter === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setFilter(c.id);
                  setSelectedItemIndex(null);
                }}
                className={`px-5 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-amber text-ink font-bold '
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Showcase Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-2 border-amber border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-xs text-neutral-400">Loading finished stage productions & videos...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-24 text-center glass-card rounded-3xl p-8 border border-white/10 max-w-lg mx-auto">
          <Volume2 className="w-12 h-12 text-amber mx-auto mb-3 opacity-60" />
          <h3 className="font-heading text-lg font-bold text-white mb-2">No projects found in this category</h3>
          <p className="text-xs text-neutral-400 mb-4">Select another category or view all live stages.</p>
          <button
            onClick={() => setFilter('all')}
            className="px-5 py-2 rounded-xl bg-amber text-ink text-xs font-bold uppercase tracking-wider"
          >
            Show All Live Stages
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-24">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className="group flex flex-col justify-between transition-all duration-300 border-t border-white/15 hover:border-amber pt-4"
            >
              {/* Media Visual Container */}
              <div
                onClick={() => setSelectedItemIndex(index)}
                className="h-64 w-full bg-neutral-950 rounded-2xl relative overflow-hidden cursor-pointer"
              >
                {item.mediaType === 'video' ? (
                  <div className="w-full h-full relative">
                    <video
                      src={item.mediaUrl}
                      preload="metadata"
                      muted
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-amber/90 text-ink flex items-center justify-center group-hover:scale-115 transition-all group-hover:bg-amber">
                        <Play className="w-6 h-6 fill-current ml-0.5 text-ink" />
                      </div>
                    </div>

                    {/* Video Tag */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/75 backdrop-blur-md text-amber border border-amber/40">
                      <Video className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                      <span>Live Video Footage</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.mediaUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                    {/* Zoom icon badge */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center border border-white/30">
                        <Maximize2 className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Image Tag */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/75 backdrop-blur-md text-amber border border-amber/40">
                      <ImageIcon className="w-3.5 h-3.5 text-amber" />
                      <span>{item.tag || 'Stage Photo'}</span>
                    </div>
                  </div>
                )}

                {/* Crowd Badge */}
                {item.crowd && (
                  <span className="absolute top-3 right-3 z-10 text-xs font-mono text-neutral-200 flex items-center gap-1 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <Users className="w-3.5 h-3.5 text-amber" />
                    <span>{item.crowd}</span>
                  </span>
                )}

                {/* Location overlay */}
                <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-xs text-neutral-200 font-mono">
                  <div className="flex items-center gap-1.5 truncate bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                    <MapPin className="w-3.5 h-3.5 text-amber shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                  {item.tag && item.mediaType === 'video' && (
                    <span className="text-[10px] uppercase font-bold text-amber bg-black/70 px-2 py-1 rounded-lg border border-white/10">
                      {item.tag}
                    </span>
                  )}
                </div>
              </div>

              {/* Details (No Box UI) */}
              <div className="pt-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    onClick={() => setSelectedItemIndex(index)}
                    className="font-heading text-xl font-bold text-white group-hover:text-amber transition-colors cursor-pointer"
                  >
                    {item.title}
                  </h3>
                  {item.specs && (
                    <div className="text-xs text-neutral-300 font-mono mt-2">
                      <span className="text-amber font-semibold block mb-0.5">Rig Specifications:</span>
                      <p className="text-neutral-400">{item.specs}</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-mono">100% In-House Gear</span>
                  <Link
                    href={`/book?specs=${encodeURIComponent(item.title)}`}
                    className="inline-flex items-center gap-1.5 text-amber font-medium hover:underline"
                  >
                    <span>Book Similar Rig</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Cinema Modal (for Video Playback & Fullscreen Photos) */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center p-3 sm:p-6">
          <div className="relative max-w-5xl w-full glass-card rounded-3xl border border-white/20 overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-neutral-950/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-amber font-bold">
                    {activeModalItem.category} • {activeModalItem.location}
                  </span>
                  {activeModalItem.crowd && (
                    <span className="text-xs font-mono text-neutral-400 flex items-center gap-1">
                      • <Users className="w-3 h-3 text-amber" /> {activeModalItem.crowd}
                    </span>
                  )}
                </div>
                <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
                  {activeModalItem.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedItemIndex(null)}
                  className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 hover:scale-105 transition-all"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Media Display Area */}
            <div className="flex-1 bg-black flex items-center justify-center relative min-h-[350px] max-h-[60vh] overflow-hidden">
              {activeModalItem.mediaType === 'video' ? (
                <video
                  key={activeModalItem.mediaUrl}
                  src={activeModalItem.mediaUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full max-h-[60vh] object-contain"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={activeModalItem.mediaUrl}
                  alt={activeModalItem.title}
                  className="w-full h-full max-h-[60vh] object-contain"
                />
              )}

              {/* Navigation Arrows */}
              {filteredItems.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-amber hover:text-ink text-white border border-white/20 flex items-center justify-center transition-all backdrop-blur-sm"
                    aria-label="Previous item"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-amber hover:text-ink text-white border border-white/20 flex items-center justify-center transition-all backdrop-blur-sm"
                    aria-label="Next item"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Modal Footer with Rig Specs and Direct Booking CTA */}
            <div className="p-4 sm:p-6 border-t border-white/10 bg-neutral-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-xl">
                {activeModalItem.specs && (
                  <div className="text-xs font-mono text-neutral-300">
                    <span className="text-amber font-semibold">Stage & Audio Rig: </span>
                    {activeModalItem.specs}
                  </div>
                )}
                <div className="text-[11px] font-mono text-neutral-400">
                  Item {selectedItemIndex !== null ? selectedItemIndex + 1 : 1} of {filteredItems.length} • Authentic footage from Eswari Sound System archive
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <Link
                  href="/book"
                  className="px-6 py-2.5 rounded-full bg-amber text-ink font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book This Rig</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action Section (Clean, No Box UI) */}
      <div className="border-t border-white/10 pt-16 text-center space-y-4 max-w-3xl mx-auto">
        <div className="text-amber text-xs font-mono uppercase tracking-[0.25em]">
          // DIRECT PROVIDER DATE LOCKING
        </div>
        <h3 className="font-heading text-2xl sm:text-4xl font-extrabold text-white">
          Plan Your Event With South India’s Most Trusted Rig
        </h3>
        <p className="text-xs sm:text-sm text-neutral-300 max-w-xl mx-auto leading-relaxed">
          Reserve our line-array audio and intelligent lighting directly. Instant date locking with a 25% advance.
        </p>
        <div className="pt-3">
          <Link
            href="/book"
            className="inline-flex items-center gap-2 px-9 py-4 rounded-full bg-amber text-ink font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all "
          >
            <Calendar className="w-4 h-4" />
            <span>Check Date & Book Advance</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
