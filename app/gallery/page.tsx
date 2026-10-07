'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Users,
  MapPin,
  ArrowRight,
  Play,
  Video,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Upload,
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
    { id: 'all', label: 'All live stages' },
    { id: 'concert', label: 'Concerts' },
    { id: 'wedding', label: 'Weddings' },
    { id: 'college', label: 'College fests' },
    { id: 'corporate', label: 'Corporate' },
    { id: 'temple', label: 'Festivals' },
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
    filter === 'all' ? items : items.filter((item) => item.category === filter);

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
    <div className="min-h-screen bg-ink text-white">
      {/* Header — statement left, admin action right */}
      <div className="container-page pt-24 lg:pt-32 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <span className="label label-amber">
              Production portfolio · 1,200+ live stages
            </span>
            <h1 className="font-heading text-h1 text-white mt-4">Stage proof</h1>
            <p className="mt-5 text-body text-fg-muted leading-relaxed max-w-measure">
              Photographs and video from finished builds — acoustic weddings,
              college arenas and concert tours across South India. What you see
              is gear we own and crew we employ.
            </p>
          </div>

          {isAdmin && (
            <Link href="/admin?tab=portfolio" className="link-arrow shrink-0">
              <Upload className="w-3.5 h-3.5" aria-hidden />
              <span>Publish new project</span>
            </Link>
          )}
        </div>

        {/* Category filters — text tabs on a hairline */}
        <div className="mt-10 flex items-start gap-1 overflow-x-auto border-b border-white/[0.12] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setFilter(c.id);
                setSelectedItemIndex(null);
              }}
              className={`tab ${filter === c.id ? 'is-active' : ''}`}
              aria-current={filter === c.id ? 'page' : undefined}
            >
              {c.label}
            </button>
          ))}
          <span className="label ml-auto py-2.5 hidden sm:block">
            {filteredItems.length} entries
          </span>
        </div>
      </div>

      {/* Showcase grid — open media rows on hairlines */}
      {loading ? (
        <div className="container-page py-24">
          <p className="label">Loading finished stage productions…</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="container-page py-20 max-w-2xl">
          <div className="border-t border-white/[0.12] pt-6">
            <span className="label label-amber">Empty category</span>
            <h2 className="font-heading text-h3 text-white mt-3">
              Nothing published here yet
            </h2>
            <p className="mt-3 text-small text-fg-muted leading-relaxed max-w-measure">
              No finished projects are tagged to this category. View every
              stage we have published, or send the crew a date to shoot.
            </p>
            <button
              onClick={() => setFilter('all')}
              className="link-arrow mt-6"
            >
              <span>Show all live stages</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </button>
          </div>
        </div>
      ) : (
        <div className="container-page pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
            {filteredItems.map((item, index) => (
              <article
                key={item.id}
                className="group border-t border-white/[0.12] hover:border-amber/60 transition-colors pt-4 flex flex-col"
              >
                <div
                  onClick={() => setSelectedItemIndex(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setSelectedItemIndex(index);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${item.title}`}
                  className="h-64 w-full bg-ink-raised relative overflow-hidden cursor-pointer"
                >
                  {item.mediaType === 'video' ? (
                    <div className="w-full h-full relative">
                      <video
                        src={item.mediaUrl}
                        preload="metadata"
                        muted
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 bg-amber text-ink flex items-center justify-center transition-transform group-hover:scale-110">
                          <Play className="w-6 h-6 fill-current ml-0.5" aria-hidden />
                        </div>
                      </div>
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.14em] bg-black/75 text-amber">
                        <Video className="w-3.5 h-3.5" aria-hidden />
                        <span>Live video</span>
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
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <Maximize2 className="w-5 h-5 text-white" aria-hidden />
                      </div>
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.14em] bg-black/75 text-amber">
                        <ImageIcon className="w-3.5 h-3.5" aria-hidden />
                        <span>{item.tag || 'Stage photo'}</span>
                      </div>
                    </div>
                  )}

                  {item.crowd && (
                    <span className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono bg-black/75 text-fg">
                      <Users className="w-3.5 h-3.5 text-amber" aria-hidden />
                      <span>{item.crowd}</span>
                    </span>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3 text-[11px] font-mono text-fg">
                    <span className="flex items-center gap-1.5 truncate bg-black/75 px-2 py-1">
                      <MapPin className="w-3.5 h-3.5 text-amber shrink-0" aria-hidden />
                      <span className="truncate">{item.location}</span>
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <span className="label label-amber">{item.category}</span>
                    <h3
                      onClick={() => setSelectedItemIndex(index)}
                      className="mt-2 font-heading text-h4 text-white group-hover:text-amber transition-colors cursor-pointer"
                    >
                      {item.title}
                    </h3>
                    {item.specs && (
                      <p className="mt-2 text-spec font-mono text-fg-muted leading-relaxed">
                        {item.specs}
                      </p>
                    )}
                  </div>

                  <div className="border-t border-white/[0.12] pt-3 flex items-center justify-between gap-4">
                    <span className="label">100% in-house gear</span>
                    <Link
                      href={`/book?specs=${encodeURIComponent(item.title)}`}
                      className="link-arrow"
                    >
                      <span>Book similar rig</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox — framed modal surface (the one box the system allows) */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center p-3 sm:p-6">
          <div className="relative max-w-5xl w-full glass-card overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-start justify-between gap-4 p-4 sm:p-6 border-b border-white/[0.12]">
              <div>
                <span className="label label-amber">
                  {activeModalItem.category} · {activeModalItem.location}
                  {activeModalItem.crowd ? ` · ${activeModalItem.crowd}` : ''}
                </span>
                <h3 className="mt-1.5 font-heading text-h3 text-white">
                  {activeModalItem.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItemIndex(null)}
                aria-label="Close preview"
                className="p-2 text-fg-muted hover:text-amber transition-colors shrink-0"
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
            </div>

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

              {filteredItems.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    aria-label="Previous item"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/70 hover:bg-amber hover:text-ink text-white border border-white/20 flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" aria-hidden />
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next item"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/70 hover:bg-amber hover:text-ink text-white border border-white/20 flex items-center justify-center transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" aria-hidden />
                  </button>
                </>
              )}
            </div>

            <div className="p-4 sm:p-6 border-t border-white/[0.12] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                {activeModalItem.specs && (
                  <p className="text-spec font-mono text-fg-muted">
                    <span className="text-amber font-semibold">Stage & audio rig — </span>
                    {activeModalItem.specs}
                  </p>
                )}
                <p className="label">
                  {selectedItemIndex !== null ? selectedItemIndex + 1 : 1} of{' '}
                  {filteredItems.length} · Eswari Sound System archive
                </p>
              </div>

              <Link href="/book" className="btn-primary shrink-0">
                <Calendar className="w-4 h-4" aria-hidden />
                <span>Book this rig</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Closing CTA */}
      <div className="border-t border-white/[0.12]">
        <div className="container-page section-tight max-w-4xl">
          <span className="label label-amber">Direct provider · date locking</span>
          <h2 className="font-heading text-h2 text-white mt-3">
            Plan your event with the rig in these frames
          </h2>
          <p className="mt-4 text-body text-fg-muted leading-relaxed max-w-measure">
            Reserve the same line-array audio and intelligent lighting
            directly. Dates lock with a 25% advance — no broker, no sub-rental.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link href="/book" className="btn-primary">
              <span>Check dates</span>
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
            <Link href="/packages" className="link-arrow">
              <span>See day rates</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
