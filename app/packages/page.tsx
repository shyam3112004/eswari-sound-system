'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle2, X, Loader2 } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import {
  MaterialCard,
  ManagePhotosModal,
  AddEditEquipmentModal,
  MaterialLightbox,
  useAdminStatus,
  type Material,
} from '@/components/ui/MaterialsSelection';

const PACKAGE_CATEGORIES = [
  { id: 'all', label: 'All event rigs' },
  { id: 'materials-rent', label: 'Rent materials by item' },
  { id: 'custom', label: 'Custom packages' },
  { id: 'audio', label: 'Audio only' },
  { id: 'lighting', label: 'Stage lighting' },
  { id: 'combo', label: 'Audio + lighting' },
];

function PackagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const { isAdmin } = useAdminStatus();
  const [packages, setPackages] = useState<any[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'packages' | 'materials'>(
    tabParam === 'materials' ? 'materials' : 'packages'
  );
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [materialsCategoryFilter, setMaterialsCategoryFilter] = useState<string>('all');

  // Materials rental state: { [materialId]: quantity }
  const [cart, setCart] = useState<Record<string, number>>({});

  // Admin inline & photo management states
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [managing, setManaging] = useState<Material | null>(null);
  const [editor, setEditor] = useState<{
    mode: 'new' | 'edit';
    material?: Material;
    initialCategory?: string;
  } | null>(null);
  const [lightbox, setLightbox] = useState<{ material: Material; index: number } | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => setToast({ type, text });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightbox(null);
        return;
      }
      const imgs = lightbox.material.images || [];
      if (imgs.length < 2) return;
      if (e.key === 'ArrowRight') {
        setLightbox({ material: lightbox.material, index: (lightbox.index + 1) % imgs.length });
      } else if (e.key === 'ArrowLeft') {
        setLightbox({
          material: lightbox.material,
          index: (lightbox.index - 1 + imgs.length) % imgs.length,
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  const refreshMaterials = async () => {
    try {
      const res = await fetch('/api/materials');
      const data = await res.json();
      if (data.success) {
        setMaterials(data.materials);
      }
    } catch (err) {
      console.error('Failed to reload materials:', err);
    }
  };

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const f of files) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
        showToast('error', 'Only JPG, PNG or WebP images are allowed.');
        continue;
      }
      if (f.size > 5 * 1024 * 1024) {
        showToast('error', `"${f.name}" exceeds the 5 MB limit.`);
        continue;
      }
      const fd = new FormData();
      fd.append('file', f);
      fd.append('folder', 'materials');
      try {
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        if (res.status === 401) {
          showToast('error', 'Unauthorized. Admin session required.');
          return urls;
        }
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          urls.push(data.url);
        } else {
          showToast('error', data.error || 'Upload failed.');
        }
      } catch {
        showToast('error', 'Network error during upload.');
      }
    }
    return urls;
  };

  const uploadImagesToMaterial = async (materialId: string, files: File[]) => {
    const target = materials.find((m) => m.id === materialId);
    if (!target) return;
    setUploadingFor(materialId);
    try {
      const newUrls = await uploadFiles(files);
      if (!newUrls.length) return;
      const combined = [...(target.images || []), ...newUrls];
      const ok = await saveMaterialImages(materialId, combined);
      if (ok) {
        showToast('success', `${newUrls.length} photo${newUrls.length > 1 ? 's' : ''} uploaded.`);
      }
    } finally {
      setUploadingFor(null);
    }
  };

  const saveMaterialImages = async (materialId: string, images: string[]): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/materials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: materialId, images }),
      });
      if (res.status === 401) {
        showToast('error', 'Unauthorized. Admin session required.');
        return false;
      }
      const data = await res.json().catch(() => ({}));
      if (!data.success) {
        showToast('error', data.error || 'Failed to update photos.');
        return false;
      }
      await refreshMaterials();
      return true;
    } catch {
      showToast('error', 'Network error.');
      return false;
    }
  };

  const deleteMaterial = async (m: Material) => {
    if (
      !confirm(
        `Are you sure you want to delete "${m.name}"? This removes its uploaded photos from disk and cannot be undone.`
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/materials?id=${encodeURIComponent(m.id)}`, {
        method: 'DELETE',
      });
      if (res.status === 401) {
        showToast('error', 'Unauthorized. Admin session required.');
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!data.success) {
        showToast('error', data.error || 'Failed to delete material.');
        return;
      }
      showToast('success', `Deleted "${m.name}".`);
      setCart((prev) => {
        const { [m.id]: _, ...rest } = prev;
        return rest;
      });
      await refreshMaterials();
    } catch {
      showToast('error', 'Network error while deleting material.');
    }
  };

  // Sync tab with URL search parameter reactively
  useEffect(() => {
    if (tabParam === 'materials') {
      setActiveTab('materials');
    } else if (tabParam === 'packages' || (!tabParam && activeTab !== 'materials')) {
      setActiveTab('packages');
    }
  }, [tabParam]);

  useEffect(() => {
    fetch('/api/packages')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPackages(data.packages);
      })
      .catch((err) => console.error('Failed to load packages:', err))
      .finally(() => setLoading(false));

    fetch('/api/materials')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMaterials(data.materials);
      })
      .catch((err) => console.error('Failed to load materials:', err))
      .finally(() => setMaterialsLoading(false));
  }, []);

  const filteredPackages =
    activeCategory === 'all'
      ? packages
      : activeCategory === 'custom'
      ? packages.filter((p) => p.slug === 'custom-rig' || p.category === 'custom')
      : packages.filter((p) => p.category === activeCategory);

  // Materials grouping
  const materialCategories = [...new Set(materials.map((m) => m.category))];

  const cartTotal = Object.entries(cart).reduce((acc, [id, qty]) => {
    const material = materials.find((m) => m.id === id);
    return acc + (material ? material.pricePerDay * qty : 0);
  }, 0);

  const cartItemCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const handleBookCustomPackage = () => {
    const selectedList = Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const m = materials.find((x) => x.id === id);
        return {
          material: m,
          quantity: qty,
        };
      })
      .filter((item) => item.material);

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('customPackageMaterials', JSON.stringify(selectedList));
    }
    router.push('/book?package=custom-rig');
  };

  const clearCart = () => setCart({});

  // Build WhatsApp inquiry message from cart
  const buildInquiryMessage = () => {
    const lines = Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const m = materials.find((m) => m.id === id);
        if (!m) return '';
        return `• ${m.name} × ${qty} ${m.unit} = ${formatINR(m.pricePerDay * qty)}/day`;
      })
      .filter(Boolean);

    return encodeURIComponent(
      `Hi Eswari Sound System, I'd like to rent the following materials:\n\n${lines.join(
        '\n'
      )}\n\nTotal: ${formatINR(cartTotal)}/day\n\nPlease confirm availability and provide a full quote.`
    );
  };

  return (
    <div className="min-h-screen bg-ink text-white">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="container-page pt-24 lg:pt-32">
        <div className="max-w-3xl">
          <span className="label label-amber">
            Direct provider · 100% in-house inventory
          </span>
          <h1 className="font-heading text-h1 text-white mt-4">
            Concert-grade stage rigs
            <span className="text-amber"> and day rates</span>
          </h1>
          <p className="mt-5 text-body text-fg-muted leading-relaxed max-w-measure">
            No hidden transport lines. A 25% advance holds the date on the
            operations calendar; the balance is settled on site after sound-check.
          </p>
        </div>

        {/* Main Tab Switch: Packages / Materials Rent */}
        <nav
          className="mt-10 flex items-center gap-8 overflow-x-auto border-b border-white/[0.12] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Catalog"
        >
          <button
            id="tab-btn-packages"
            onClick={() => {
              setActiveTab('packages');
              router.replace('/packages', { scroll: false });
            }}
            className={`tab ${activeTab === 'packages' ? 'is-active' : ''}`}
            aria-current={activeTab === 'packages' ? 'page' : undefined}
          >
            Full stage packages
          </button>
          <button
            id="tab-btn-materials"
            onClick={() => {
              setActiveTab('materials');
              router.replace('/packages?tab=materials', { scroll: false });
            }}
            className={`tab ${activeTab === 'materials' ? 'is-active' : ''}`}
            aria-current={activeTab === 'materials' ? 'page' : undefined}
          >
            Materials rent
            {cartItemCount > 0 && (
              <span className="ml-2 text-amber">({cartItemCount})</span>
            )}
          </button>
        </nav>
      </div>

      {/* ─── TAB: FULL PACKAGES ─── */}
      {activeTab === 'packages' && (
        <div className="container-page pt-14 pb-10">
          {/* Quick switch — open text block, no banner box */}
          <div className="hairline py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="max-w-2xl">
              <p className="text-body text-fg-soft">
                Renting single items instead? Pick line arrays, subs, moving heads,
                trussing, silent generators and fog units a la carte.
              </p>
            </div>
            <button
              onClick={() => {
                setActiveTab('materials');
                router.replace('/packages?tab=materials', { scroll: false });
              }}
              className="link-arrow shrink-0"
            >
              <span>Browse the materials catalog</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </button>
          </div>

          {/* Category filter — text tabs with amber underline */}
          <div className="mt-8 border-b border-white/[0.12] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-start min-w-max">
              {PACKAGE_CATEGORIES.map((c) => {
                const isActive = activeCategory === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      if (c.id === 'materials-rent') {
                        setActiveTab('materials');
                        router.replace('/packages?tab=materials', { scroll: false });
                      } else {
                        setActiveCategory(c.id);
                      }
                    }}
                    className={`tab ${isActive ? 'is-active' : ''}`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div className="py-24 text-center label">Loading production packages…</div>
          ) : (
            <div className="mt-4">
              {filteredPackages.map((pkg) => {
                const isCustom = pkg.slug === 'custom-rig';
                const featured = pkg.isPopular && !isCustom;

                return (
                  <article
                    key={pkg.id}
                    className="hairline py-9 lg:py-11 grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-6"
                  >
                    <div className="lg:col-span-7">
                      <div className="flex items-baseline flex-wrap gap-x-5 gap-y-1">
                        <span className="label">{pkg.category}</span>
                        {featured && <span className="label label-amber">Most booked</span>}
                        {isCustom && <span className="label label-amber">Build your own</span>}
                      </div>

                      <h2
                        className={`font-heading text-white mt-3 ${
                          featured ? 'text-h2' : 'text-h3'
                        }`}
                      >
                        {pkg.name}
                      </h2>

                      <p className="mt-3 text-small text-fg-muted leading-relaxed max-w-measure">
                        {pkg.description}
                      </p>

                      <div className="mt-7">
                        <span className="label block mb-3">
                          {isCustom ? 'How it works' : 'Included'}
                        </span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2.5">
                          {pkg.features.map((f: string, fi: number) => (
                            <li key={fi} className="marker-dot text-small text-fg-soft">
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="lg:col-span-5 lg:border-l lg:border-white/10 lg:pl-10 flex flex-col gap-6">
                      <div>
                        {isCustom ? (
                          <>
                            <div className="font-heading text-3xl sm:text-4xl font-black text-amber">
                              You choose
                            </div>
                            <div className="mt-2 label">Priced from the items you pick</div>
                          </>
                        ) : (
                          <>
                            <div className="font-heading text-4xl sm:text-5xl font-black text-amber tabular-nums">
                              {formatINR(pkg.price)}
                            </div>
                            <div className="mt-2 label">Per event day</div>
                            <div className="mt-6 space-y-1.5 font-mono text-spec text-fg-muted">
                              <div className="flex justify-between gap-4">
                                <span>25% advance</span>
                                <span className="text-fg-soft">
                                  {formatINR(pkg.price * 0.25)}
                                </span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span>Balance on site</span>
                                <span className="text-fg-soft">
                                  {formatINR(pkg.price * 0.75)}
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="mt-auto flex flex-col items-start gap-4">
                        <Link href={`/book?package=${pkg.slug}`} className="link-arrow">
                          <span>
                            {isCustom ? 'Build & book custom rig' : 'Book stage rig'}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                        </Link>
                        {isCustom && (
                          <button
                            onClick={() => {
                              setActiveTab('materials');
                              router.replace('/packages?tab=materials', { scroll: false });
                            }}
                            className="link-arrow !text-[10px] !text-fg-muted"
                          >
                            <span>Browse materials first</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: MATERIALS RENT ─── */}
      {activeTab === 'materials' && (
        <div className="container-page pt-14 pb-24">
          <div className="max-w-3xl">
            <span className="label label-amber">Build your own rig · daily rates</span>
            <p className="mt-4 text-body text-fg-muted leading-relaxed max-w-measure">
              Pick the individual items you need. We deliver, rig and retrieve
              everything — the total below is per rental day, before delivery zone.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-x-12">
            {/* Materials catalog */}
            <div className="lg:col-span-8">
              {/* Category tabs + admin add row */}
              <div className="border-b border-white/[0.12] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex items-end justify-between gap-6 min-w-max">
                  <div className="flex items-start">
                    <button
                      onClick={() => setMaterialsCategoryFilter('all')}
                      className={`tab ${materialsCategoryFilter === 'all' ? 'is-active' : ''}`}
                    >
                      All items ({materials.length})
                    </button>
                    {materialCategories.map((cat) => {
                      const count = materials.filter((m) => m.category === cat).length;
                      return (
                        <button
                          key={cat}
                          onClick={() => setMaterialsCategoryFilter(cat)}
                          className={`tab capitalize ${
                            materialsCategoryFilter === cat ? 'is-active' : ''
                          }`}
                        >
                          {cat} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditor({
                          mode: 'new',
                          initialCategory:
                           materialsCategoryFilter !== 'all'
                             ? materialsCategoryFilter
                              : undefined,
                        })
                      }
                      className="link-arrow label-amber shrink-0 pb-3.5"
                    >
                      <span>+ Add new equipment</span>
                    </button>
                  )}
                </div>
              </div>

              {materialsLoading ? (
                <div className="py-16 flex items-center gap-3 label">
                  <Loader2 className="w-4 h-4 animate-spin text-amber" aria-hidden />
                  <span>Loading materials catalog…</span>
                </div>
              ) : materials.length === 0 ? (
                <div className="py-16 space-y-5">
                  <p className="text-small text-fg-muted">
                    No materials listed yet. Call the depot for a custom quote.
                  </p>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setEditor({ mode: 'new' })}
                      className="link-arrow label-amber"
                    >
                      <span>+ Add the first equipment</span>
                    </button>
                  )}
                </div>
              ) : (
                materialCategories
                  .filter(
                    (cat) =>
                      materialsCategoryFilter === 'all' || cat === materialsCategoryFilter
                  )
                  .map((cat) => {
                    const catMaterials = materials.filter((m) => m.category === cat);
                    return (
                      <section key={cat} className="mt-12 first:mt-8">
                        <div className="flex items-baseline justify-between gap-4 pb-3 border-b border-white/[0.12]">
                          <h3 className="label text-fg capitalize">
                            {cat} equipment
                            <span className="ml-3 text-fg-muted normal-case tracking-normal">
                              {catMaterials.length} items
                            </span>
                          </h3>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => setEditor({ mode: 'new', initialCategory: cat })}
                              className="link-arrow !text-[10px] label-amber"
                            >
                              <span>Add to {cat}</span>
                            </button>
                          )}
                        </div>

                        <div>
                          {catMaterials.map((m) => (
                            <MaterialCard
                              key={m.id}
                              material={m}
                              quantity={cart[m.id] || 0}
                              onQuantityChange={(q) => {
                                setCart((prev) => {
                                  if (q === 0) {
                                    const { [m.id]: _, ...rest } = prev;
                                    return rest;
                                  }
                                  return { ...prev, [m.id]: q };
                                });
                              }}
                              onOpenLightbox={() => setLightbox({ material: m, index: 0 })}
                              isAdmin={isAdmin}
                              uploading={uploadingFor === m.id}
                              onUploadFiles={(files) => uploadImagesToMaterial(m.id, files)}
                              onManage={() => setManaging(m)}
                              onEdit={() => setEditor({ mode: 'edit', material: m })}
                              onDelete={() => deleteMaterial(m)}
                            />
                          ))}

                          {/* Admin-only: plain text add row at the end of the category */}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => setEditor({ mode: 'new', initialCategory: cat })}
                              className="hairline w-full py-5 text-left link-arrow label-amber"
                            >
                              <span>+ Add new equipment to {cat}</span>
                            </button>
                          )}
                        </div>
                      </section>
                    );
                  })
              )}
            </div>

            {/* Rental summary — sticky column behind a vertical hairline */}
            <aside className="lg:col-span-4 mt-14 lg:mt-0 lg:border-l lg:border-white/10 lg:pl-10">
              <div className="lg:sticky lg:top-28">
                <div className="hairline flex items-baseline justify-between gap-4 pt-4 pb-5">
                  <h3 className="font-heading text-h4 text-white">Rental summary</h3>
                  {cartItemCount > 0 && (
                    <button
                      onClick={clearCart}
                      className="link-arrow !text-[10px] !text-fg-muted hover:!text-red-400"
                    >
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                {cartItemCount === 0 ? (
                  <p className="text-small text-fg-muted leading-relaxed max-w-measure">
                    Nothing selected yet. Add items from the catalog and the daily
                    total builds up here.
                  </p>
                ) : (
                  <>
                    <div className="max-h-72 overflow-y-auto">
                      {Object.entries(cart)
                        .filter(([, qty]) => qty > 0)
                        .map(([id, qty]) => {
                          const m = materials.find((x) => x.id === id);
                          if (!m) return null;
                          return (
                            <div
                              key={id}
                              className="hairline py-3 flex items-start justify-between gap-4 text-small"
                            >
                              <div className="min-w-0">
                                <div className="text-fg-soft truncate">{m.name}</div>
                                <div className="font-mono text-spec text-fg-muted">
                                  {qty} {m.unit} × {formatINR(m.pricePerDay)}
                                </div>
                              </div>
                              <div className="text-amber font-mono font-bold shrink-0 tabular-nums">
                                {formatINR(m.pricePerDay * qty)}
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    <div className="hairline mt-1 pt-5 flex items-baseline justify-between gap-4">
                      <span className="label">Total / day</span>
                      <span className="font-heading text-3xl font-black text-amber tabular-nums">
                        {formatINR(cartTotal)}
                      </span>
                    </div>
                    <p className="mt-3 label !tracking-[0.1em] leading-relaxed">
                      Final quote depends on event duration and delivery zone.
                    </p>
                  </>
                )}

                {cartItemCount > 0 && (
                  <div className="mt-7 flex flex-col items-start gap-5">
                    <button onClick={handleBookCustomPackage} className="btn-primary w-full">
                      Book as custom rig
                    </button>

                    <a
                      href={`https://wa.me/${
                        process.env.NEXT_PUBLIC_WA_NUMBER || '919876543210'
                      }?text=${buildInquiryMessage()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-arrow"
                    >
                      <span>Request rental quote on WhatsApp</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                    </a>

                    <Link href="/inquiry" className="link-arrow !text-fg-muted">
                      <span>Submit a formal proposal</span>
                    </Link>
                  </div>
                )}

                <div className="hairline mt-8 pt-5 space-y-2 label !tracking-[0.1em]">
                  <p>Every item is owned by this depot</p>
                  <p>Delivery, rigging &amp; retrieval included</p>
                </div>
              </div>
            </aside>
          </div>

          {lightbox && (
            <MaterialLightbox
              material={lightbox.material}
              index={lightbox.index}
              onClose={() => setLightbox(null)}
              onNavigate={(index) => setLightbox((prev) => (prev ? { ...prev, index } : prev))}
            />
          )}

          {isAdmin && managing && (
            <ManagePhotosModal
              material={managing}
              onClose={() => setManaging(null)}
              onSaving={saveMaterialImages}
              onChanged={async () => {
                await refreshMaterials();
                const freshRes = await fetch('/api/materials');
                const freshData = await freshRes.json();
                const fresh = freshData.materials?.find(
                  (m: Material) => m.id === managing.id
                );
                if (fresh) setManaging(fresh);
              }}
              showToast={showToast}
            />
          )}

          {isAdmin && editor && (
            <AddEditEquipmentModal
              mode={editor.mode}
              material={editor.material}
              initialCategory={editor.initialCategory}
              existingCategories={materialCategories}
              onSave={async (payload) => {
                const isEdit = editor.mode === 'edit';
                const url = '/api/admin/materials';
                const method = isEdit ? 'PATCH' : 'POST';
                const body = isEdit ? { id: editor.material!.id, ...payload } : payload;
                const res = await fetch(url, {
                  method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(body),
                });
                if (res.status === 401) {
                  showToast('error', 'Unauthorized. Admin session required.');
                  return false;
                }
                const data = await res.json().catch(() => ({}));
                if (!data.success) {
                  showToast('error', data.error || 'Failed to save equipment.');
                  return false;
                }
                showToast(
                  'success',
                  isEdit ? 'Equipment updated.' : 'New equipment added to the catalog.'
                );
                await refreshMaterials();
                return true;
              }}
              onClose={() => setEditor(null)}
              showToast={showToast}
            />
          )}
        </div>
      )}

      {/* Custom build CTA */}
      <div className="border-t border-white/[0.12]">
        <div className="container-page section-tight flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <span className="label label-amber">
              Multi-day festivals · college fests · temple celebrations
            </span>
            <h2 className="font-heading text-h2 text-white mt-3">
              Need a 16-box line array or custom truss geometry?
            </h2>
            <p className="mt-4 text-small text-fg-muted leading-relaxed max-w-measure">
              We model the coverage for the actual field, bring dual power backup
              and put a dedicated FOH and monitor team on the job sheet.
            </p>
          </div>

          <Link href="/inquiry" className="btn-primary shrink-0">
            Request a custom proposal
          </Link>
        </div>
      </div>

      {toast && (
        <div className="toast fixed bottom-5 left-1/2 -translate-x-1/2 z-[90]" role="status">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden />
          ) : (
            <X className="w-4 h-4 text-red-400 shrink-0" aria-hidden />
          )}
          <span className={toast.type === 'success' ? 'text-emerald-300' : 'text-red-300'}>
            {toast.text}
          </span>
        </div>
      )}
    </div>
  );
}

export default function PackagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center label gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-amber" aria-hidden />
          <span>Loading production catalog…</span>
        </div>
      }
    >
      <PackagesContent />
    </Suspense>
  );
}
