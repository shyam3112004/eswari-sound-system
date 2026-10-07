'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Check,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Upload,
  Loader2,
  Camera,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const STANDARD_CATEGORIES = ['audio', 'lighting', 'staging', 'power', 'effects'];

export interface Material {
  id: string;
  name: string;
  category: string;
  description: string;
  pricePerDay: number;
  unit: string;
  isAvailable: boolean;
  images?: string[] | null;
}

export interface SelectedMaterial {
  material: Material;
  quantity: number;
}

export interface MaterialsSelectionProps {
  selectedMaterials: SelectedMaterial[];
  onMaterialsChange: (materials: SelectedMaterial[]) => void;
  onNext?: () => void;
  onBack?: () => void;
  showNavigation?: boolean;
  isCustomPackage?: boolean;
  isAdmin?: boolean;
}

/**
 * Reliable client-side admin detection hook:
 * Checks /api/auth/user for user.isAdmin.
 */
export function useAdminStatus() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/user')
      .then((r) => r.json())
      .then((d) => setIsAdmin(Boolean(d?.authenticated && d?.user?.isAdmin)))
      .catch(() => setIsAdmin(false))
      .finally(() => setLoading(false));
  }, []);

  return { isAdmin, loading };
}

export default function MaterialsSelection({
  selectedMaterials,
  onMaterialsChange,
  onNext,
  onBack,
  showNavigation = true,
  isCustomPackage = false,
  isAdmin: isAdminProp,
}: MaterialsSelectionProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ material: Material; index: number } | null>(null);

  // Admin-only inline controls
  const { isAdmin: detectedAdmin } = useAdminStatus();
  const isAdmin = isAdminProp !== undefined ? isAdminProp : detectedAdmin;
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [managing, setManaging] = useState<Material | null>(null);
  const [editor, setEditor] = useState<{ mode: 'new' | 'edit'; material?: Material; initialCategory?: string } | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3400);
    return () => clearTimeout(timer);
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

  const categoryNames: Record<string, string> = {
    audio: 'Audio Equipment',
    lighting: 'Lighting & Effects',
    staging: 'Staging & Structure',
    power: 'Power & Generators',
    effects: 'Special Effects',
  };

  const categoryLabel = (cat: string) => categoryNames[cat] || cat;

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await fetch('/api/materials');
      const data = await res.json();
      if (data.success) {
        setMaterials(data.materials);
      }
    } catch (err) {
      console.error('Failed to fetch materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
  };

  const uploadFiles = async (files: File[]) => {
    const urls: string[] = [];
    for (const f of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(f.type)) {
        showToast('error', 'Only JPG, PNG or WebP images are allowed.');
        return null;
      }
      if (f.size > MAX_IMAGE_SIZE) {
        showToast('error', 'Each photo must be under 5 MB.');
        return null;
      }
      const fd = new FormData();
      fd.append('file', f);
      fd.append('folder', 'materials');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (res.status === 401) {
        showToast('error', 'Unauthorized. Admin session required.');
        return null;
      }
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        urls.push(data.url);
      } else {
        showToast('error', data.error || 'One of the uploads failed.');
        return null;
      }
    }
    return urls;
  };

  const uploadImagesToMaterial = async (material: Material, files: File[]) => {
    if (!files.length) return;
    setUploadingFor(material.id);
    try {
      const urls = await uploadFiles(files);
      if (!urls) return;
      const nextImages = [...(material.images || []), ...urls];
      const res = await fetch('/api/admin/materials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: material.id,
          images: nextImages,
        }),
      });
      if (res.status === 401) {
        showToast('error', 'Unauthorized. Admin session required.');
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        showToast('success', `Added ${urls.length} photo${urls.length > 1 ? 's' : ''}.`);
        setMaterials((prev) =>
          prev.map((m) => (m.id === material.id ? { ...m, images: nextImages } : m))
        );
        await fetchMaterials();
      } else {
        showToast('error', data.error || 'Failed to save photos.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Upload failed. Try again.');
    } finally {
      setUploadingFor(null);
    }
  };

  const saveMaterialImages = async (materialId: string, images: string[]) => {
    const res = await fetch('/api/admin/materials', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: materialId, images }),
    });
    const data = await res.json().catch(() => ({}));
    if (!data.success) {
      showToast('error', data.error || 'Failed to update photos.');
      return false;
    }
    setMaterials((prev) =>
      prev.map((m) => (m.id === materialId ? { ...m, images } : m))
    );
    return true;
  };

  const deleteMaterial = async (material: Material) => {
    if (!confirm(`Delete "${material.name}" from the catalog? Its uploaded photos will also be removed.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/materials?id=${encodeURIComponent(material.id)}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        showToast('success', `"${material.name}" deleted.`);
        setMaterials((prev) => prev.filter((m) => m.id !== material.id));
        await fetchMaterials();
      } else {
        showToast('error', data.error || 'Failed to delete.');
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Delete failed.');
    }
  };

  const getSelectedQuantity = (materialId: string) => {
    const selected = selectedMaterials.find((sm) => sm.material.id === materialId);
    return selected ? selected.quantity : 0;
  };

  const updateQuantity = (material: Material, quantity: number) => {
    if (quantity > 0) {
      setValidationError(null);
    }
    const newSelectedMaterials = selectedMaterials.filter(
      (sm) => sm.material.id !== material.id
    );

    if (quantity > 0) {
      newSelectedMaterials.push({ material, quantity });
    }

    onMaterialsChange(newSelectedMaterials);
  };

  const getTotalCost = () => {
    return selectedMaterials.reduce(
      (total, sm) => total + sm.material.pricePerDay * sm.quantity,
      0
    );
  };

  const categories = [...new Set(materials.map((m) => m.category))];
  const filteredMaterials = activeCategory === 'all'
    ? materials
    : materials.filter((m) => m.category === activeCategory);

  const materialsByCategory = categories.reduce((acc, category) => {
    acc[category] = materials.filter((m) => m.category === category);
    return acc;
  }, {} as Record<string, Material[]>);

  const openAddForm = (initialCategory?: string) => setEditor({ mode: 'new', initialCategory });

  if (loading) {
    return (
      <div className="py-10 label">Loading rental materials catalog…</div>
    );
  }

  const renderAddCard = (categoryName?: string) => (
    <button
      type="button"
      onClick={() => openAddForm(categoryName)}
      className="hairline w-full py-5 text-left link-arrow label-amber"
    >
      <span>
        + Add new equipment{categoryName ? ` to ${categoryName}` : ''}
      </span>
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="hairline pt-5">
        <span className="label label-amber">
          {isCustomPackage ? 'Step 3 · custom rig' : 'Optional add-ons'}
        </span>
        <h2 className="font-heading text-h3 text-white mt-2">
          {isCustomPackage
            ? 'Pick the gear for the custom package'
            : 'Additional materials rental'}
        </h2>
        <p className="mt-2 text-small text-fg-muted leading-relaxed max-w-measure">
          {isCustomPackage
            ? 'Choose the exact sound, lighting, staging, power and effects gear for the build. Nothing is sub-contracted.'
            : 'Extra equipment for your booking. Every item is rented per day and rigged by our own crew.'}
        </p>
      </div>

      {validationError && (
        <div className="alert" role="alert">
          {validationError}
        </div>
      )}

      {/* Category tabs — text bar with an amber underline */}
      <div className="border-b border-white/[0.12] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-start min-w-max">
          <button
            onClick={() => setActiveCategory('all')}
            className={`tab ${activeCategory === 'all' ? 'is-active' : ''}`}
          >
            All categories ({materials.length})
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`tab ${activeCategory === category ? 'is-active' : ''}`}
            >
              {categoryLabel(category)} ({materialsByCategory[category]?.length || 0})
            </button>
          ))}
        </div>
      </div>

      {isAdmin && (
        <button
          type="button"
          onClick={() => openAddForm()}
          className="link-arrow label-amber -mt-2"
        >
          <span>+ Add new equipment</span>
        </button>
      )}

      {/* Materials Grid */}
      <div className="space-y-6">
        {activeCategory === 'all' ? (
          // Show by categories
          Object.entries(materialsByCategory).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-baseline justify-between gap-4 pt-4 pb-2 border-b border-white/[0.12]">
                <h3 className="label text-fg">{categoryLabel(category)}</h3>
                <span className="label">{items.length} items</span>
              </div>
              <div>
                {items.map((material) => (
                  <MaterialCard
                    key={material.id}
                    material={material}
                    quantity={getSelectedQuantity(material.id)}
                    onQuantityChange={(quantity) => updateQuantity(material, quantity)}
                    onOpenLightbox={() => setLightbox({ material, index: 0 })}
                    isAdmin={isAdmin}
                    uploading={uploadingFor === material.id}
                    onUploadFiles={(files) => uploadImagesToMaterial(material, files)}
                    onManage={() => setManaging(material)}
                    onEdit={() => setEditor({ mode: 'edit', material })}
                    onDelete={() => deleteMaterial(material)}
                  />
                ))}
                {isAdmin && <div className="flex">{renderAddCard(category)}</div>}
              </div>
            </div>
          ))
        ) : (
          // Show filtered materials
          <div>
            {filteredMaterials.map((material) => (
              <MaterialCard
                key={material.id}
                material={material}
                quantity={getSelectedQuantity(material.id)}
                onQuantityChange={(quantity) => updateQuantity(material, quantity)}
                onOpenLightbox={() => setLightbox({ material, index: 0 })}
                isAdmin={isAdmin}
                uploading={uploadingFor === material.id}
                onUploadFiles={(files) => uploadImagesToMaterial(material, files)}
                onManage={() => setManaging(material)}
                onEdit={() => setEditor({ mode: 'edit', material })}
                onDelete={() => deleteMaterial(material)}
              />
            ))}
            {isAdmin && <div className="flex">{renderAddCard(activeCategory)}</div>}
          </div>
        )}
      </div>

      {/* Selected Materials Summary */}
      {selectedMaterials.length > 0 && (
        <div className="hairline pt-5">
          <div className="mb-2">
            <span className="label text-fg">
              Selected materials ({selectedMaterials.length})
            </span>
          </div>

          <div className="max-h-40 overflow-y-auto">
            {selectedMaterials.map((sm) => (
              <div
                key={sm.material.id}
                className="hairline py-2.5 flex items-start justify-between gap-3 text-small"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-fg-soft">{sm.material.name}</span>
                  <span className="text-fg-muted font-mono text-spec block">
                    {sm.quantity} × {formatINR(sm.material.pricePerDay)} ={' '}
                    {formatINR(sm.material.pricePerDay * sm.quantity)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => updateQuantity(sm.material, 0)}
                  className="text-red-400 hover:text-red-300 transition-colors shrink-0"
                  aria-label={`Remove ${sm.material.name}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="hairline mt-2 pt-3 flex justify-between items-baseline gap-3">
            <span className="label">Materials total</span>
            <span className="font-mono font-bold text-amber tabular-nums">
              {formatINR(getTotalCost())}/day
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      {showNavigation && (
        <div className="hairline pt-5 flex justify-between items-center gap-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="link-arrow !text-fg-muted"
            >
              <span>Back to package selection</span>
            </button>
          )}

          <div className="ml-auto flex items-center gap-5">
            {onNext && (
              <button
                type="button"
                onClick={() => {
                  if (isCustomPackage && selectedMaterials.length === 0) {
                    setValidationError('Please select at least 1 equipment material to build your custom package.');
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                    return;
                  }
                  setValidationError(null);
                  onNext();
                }}
                className="btn-primary"
              >
                <span>Continue to Venue Details</span>
              </button>
            )}
          </div>
        </div>
      )}

      {lightbox && (
        <MaterialLightbox
          material={lightbox.material}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onNavigate={(index) =>
            setLightbox((prev) => (prev ? { ...prev, index } : prev))
          }
        />
      )}

      {isAdmin && managing && (
        <ManagePhotosModal
          material={managing}
          onClose={() => setManaging(null)}
          onSaving={saveMaterialImages}
          onChanged={async () => {
            await fetchMaterials();
            const fresh = (await (await fetch('/api/materials')).json()).materials?.find(
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
          existingCategories={categories}
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
            const data = await res.json().catch(() => ({}));
            if (!data.success) {
              showToast('error', data.error || 'Failed to save equipment.');
              return false;
            }
            showToast(
              'success',
              isEdit ? 'Equipment updated.' : 'New equipment added to the catalog.'
            );
            await fetchMaterials();
            return true;
          }}
          onClose={() => setEditor(null)}
          showToast={showToast}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className="toast fixed bottom-5 left-1/2 -translate-x-1/2 z-[90]"
          role="status"
        >
          {toast.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span className={toast.type === 'success' ? 'text-emerald-300' : 'text-red-300'}>
            {toast.text}
          </span>
        </div>
      )}
    </div>
  );
}

export interface MaterialCardProps {
  material: Material;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onOpenLightbox: () => void;
  isAdmin: boolean;
  uploading: boolean;
  onUploadFiles: (files: File[]) => void;
  onManage: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function MaterialCard({
  material,
  quantity,
  onQuantityChange,
  onOpenLightbox,
  isAdmin,
  uploading,
  onUploadFiles,
  onManage,
  onEdit,
  onDelete,
}: MaterialCardProps) {
  const images = material.images || [];

  return (
    <article className="hairline py-5 flex gap-4 sm:gap-6">
      {images.length > 0 ? (
        <button
          type="button"
          onClick={onOpenLightbox}
          className="relative w-20 h-20 sm:w-28 sm:h-28 shrink-0 overflow-hidden bg-ink-raised block group cursor-zoom-in text-left"
          aria-label={`View photos of ${material.name}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[0]}
            alt={material.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {images.length > 1 && (
            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/75 text-[9px] font-mono text-white">
              +{images.length - 1}
            </span>
          )}
        </button>
      ) : (
        <div className="w-20 h-20 sm:w-28 sm:h-28 shrink-0 bg-ink-raised flex flex-col items-center justify-center gap-1 text-fg-muted">
          <Package className="w-5 h-5 stroke-[1.5]" aria-hidden />
          <span className="label !text-[8px]">No photo</span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h4
              className="font-heading text-base font-bold text-white"
              title={material.name}
            >
              {material.name}
            </h4>
            <p className="text-small text-fg-muted mt-1 leading-relaxed max-w-measure">
              {material.description}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="font-mono text-base font-bold text-amber tabular-nums block">
              {formatINR(material.pricePerDay)}
            </span>
            <span className="label !text-[9px]">/ {material.unit} / day</span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">

          {quantity > 0 ? (
            <div className="flex items-center gap-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
                className="text-fg-muted hover:text-red-400 transition-colors"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-5 text-center font-bold text-amber tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => onQuantityChange(quantity + 1)}
                className="text-fg-muted hover:text-amber transition-colors"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onQuantityChange(1)}
              className="link-arrow label-amber !text-[10px]"
            >
              <span>+ Add</span>
            </button>
          )}
        </div>

        {quantity > 0 && (
          <div className="mt-2 font-mono text-spec text-fg-muted">
            Subtotal · {quantity} {material.unit} ={' '}
            <span className="text-amber font-bold">
              {formatINR(material.pricePerDay * quantity)}/day
            </span>
          </div>
        )}

        {isAdmin && (
          <div className="hairline mt-3 pt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <label
              className={`link-arrow !text-[9px] label-amber cursor-pointer ${
                uploading ? 'opacity-75 pointer-events-none' : ''
              }`}
            >
              <span>{uploading ? 'Uploading…' : 'Upload photos'}</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                disabled={uploading}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) onUploadFiles(Array.from(e.target.files));
                  e.target.value = '';
                }}
              />
            </label>

            <button
              type="button"
              onClick={onManage}
              disabled={images.length === 0}
              className="link-arrow !text-[9px] disabled:opacity-40 disabled:cursor-not-allowed"
              title={images.length ? `Manage photos (${images.length})` : 'No photos to manage yet'}
            >
              <span>Photos ({images.length})</span>
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="link-arrow !text-[9px]"
              title="Edit equipment"
            >
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="link-arrow !text-[9px] hover:!text-red-400"
              title="Delete equipment"
            >
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export interface ManagePhotosModalProps {
  material: Material;
  onClose: () => void;
  onSaving: (materialId: string, images: string[]) => Promise<boolean>;
  onChanged: () => void;
  showToast: (type: 'success' | 'error', text: string) => void;
}

export function ManagePhotosModal({ material, onClose, onSaving, onChanged, showToast }: ManagePhotosModalProps) {
  const [images, setImages] = useState<string[]>(material.images || []);
  const [busy, setBusy] = useState(false);

  const persist = async (next: string[]) => {
    setBusy(true);
    try {
      const ok = await onSaving(material.id, next);
      if (ok) {
        setImages(next);
        showToast('success', 'Photos updated.');
        onChanged();
      }
    } finally {
      setBusy(false);
    }
  };

  const addFiles = async (files: File[]) => {
    if (!files.length) return;
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const f of files) {
        if (!ALLOWED_IMAGE_TYPES.includes(f.type)) {
          showToast('error', 'Only JPG, PNG or WebP images are allowed.');
          return;
        }
        if (f.size > MAX_IMAGE_SIZE) {
          showToast('error', 'Each photo must be under 5 MB.');
          return;
        }
        const fd = new FormData();
        fd.append('file', f);
        fd.append('folder', 'materials');
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        if (res.status === 401) {
          showToast('error', 'Unauthorized. Admin session required.');
          return;
        }
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          urls.push(data.url);
        } else {
          showToast('error', data.error || 'Upload failed.');
          return;
        }
      }
      await persist([...images, ...urls]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-lg glass-card p-6 space-y-5 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Manage photos for ${material.name}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="label label-amber">Manage photos</span>
            <h4 className="font-heading text-h4 text-white mt-1">{material.name}</h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-fg-muted hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {images.map((url, idx) => (
            <div key={url} className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/15 bg-black/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white">
                {idx + 1}
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => persist(images.filter((u) => u !== url))}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
                title="Remove photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <label className={`w-24 h-24 rounded-xl border-2 border-dashed border-white/25 bg-white/5 flex flex-col items-center justify-center gap-1 text-neutral-400 hover:text-white hover:border-amber hover:bg-amber/10 cursor-pointer transition-all ${busy ? 'opacity-60 pointer-events-none' : ''}`}>
            {busy ? <Loader2 className="w-5 h-5 animate-spin text-amber" /> : <Camera className="w-5 h-5" />}
            <span className="text-[9px] font-mono uppercase tracking-wider">Add more</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              disabled={busy}
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) addFiles(Array.from(e.target.files));
                e.target.value = '';
              }}
            />
          </label>
        </div>

        {images.length === 0 && (
          <p className="text-xs text-neutral-500 font-mono">
                  No photos yet. Use the “Add more” tile to upload JPG/PNG/WebP photos (max 5 MB each).
          </p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="btn-primary w-full"
        >
          Done
        </button>
      </div>
    </div>
  );
}

export interface AddEditEquipmentModalProps {
  mode: 'new' | 'edit';
  material?: Material;
  initialCategory?: string;
  existingCategories: string[];
  onSave: (payload: Record<string, unknown>) => Promise<boolean>;
  onClose: () => void;
  showToast: (type: 'success' | 'error', text: string) => void;
}

export function AddEditEquipmentModal({
  mode,
  material,
  initialCategory,
  existingCategories,
  onSave,
  onClose,
  showToast,
}: AddEditEquipmentModalProps) {
  const [name, setName] = useState(material?.name || '');
  const [category, setCategory] = useState(
    material
      ? (STANDARD_CATEGORIES.includes(material.category) || existingCategories.includes(material.category) ? material.category : '__custom__')
      : (initialCategory || existingCategories[0] || 'audio')
  );
  const [customCategory, setCustomCategory] = useState(
    material && !STANDARD_CATEGORIES.includes(material.category) && !existingCategories.includes(material.category) ? material.category : ''
  );
  const [description, setDescription] = useState(material?.description || '');
  const [pricePaise, setPricePaise] = useState<number>(material?.pricePerDay || 100000);
  const [unit, setUnit] = useState(material?.unit || 'unit');
  const [isAvailable, setIsAvailable] = useState(material?.isAvailable ?? true);
  const [images, setImages] = useState<string[]>(material?.images || []);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const categoryOptions = [
    ...STANDARD_CATEGORIES,
    ...existingCategories.filter((c) => !STANDARD_CATEGORIES.includes(c)),
    '__custom__',
  ];

  const addFiles = async (files: File[]) => {
    setUploading(true);
    try {
      for (const f of files) {
        if (!ALLOWED_IMAGE_TYPES.includes(f.type)) {
          showToast('error', 'Only JPG, PNG or WebP images are allowed.');
          return;
        }
        if (f.size > MAX_IMAGE_SIZE) {
          showToast('error', 'Each photo must be under 5 MB.');
          return;
        }
        const fd = new FormData();
        fd.append('file', f);
        fd.append('folder', 'materials');
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
        if (res.status === 401) {
          showToast('error', 'Unauthorized. Admin session required.');
          return;
        }
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          setImages((prev) => [...prev, data.url]);
        } else {
          showToast('error', data.error || 'Upload failed.');
          return;
        }
      }
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveCategory = category === '__custom__' ? customCategory.trim().toLowerCase() : category.trim().toLowerCase();
    if (!name.trim()) {
      showToast('error', 'Please enter the equipment name.');
      return;
    }
    if (!effectiveCategory) {
      showToast('error', 'Please type a name for the new category.');
      return;
    }
    if (!description.trim()) {
      showToast('error', 'Please enter a description.');
      return;
    }
    setSaving(true);
    try {
      const ok = await onSave({
        name: name.trim(),
        category: effectiveCategory,
        description: description.trim(),
        pricePerDay: pricePaise,
        unit,
        isAvailable,
        images,
      });
      if (ok) onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-xl glass-card p-6 space-y-5 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'edit' ? 'Edit equipment' : 'Add new equipment'}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="label label-amber">Admin</span>
            <h4 className="font-heading text-h4 text-white mt-1">
              {mode === 'edit' ? 'Edit Equipment' : 'Add New Equipment'}
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-fg-muted hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Line Array Speaker Box"
              className="w-full px-4 py-2.5 rounded-xl bg-ink border border-white/20 text-white text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-ink border border-white/20 text-white text-xs"
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c === '__custom__'
                      ? 'New Category…'
                      : c === 'audio'
                      ? 'Audio Equipment'
                      : c === 'lighting'
                      ? 'Lighting & Effects'
                      : c === 'staging'
                      ? 'Staging & Structure'
                      : c === 'power'
                      ? 'Power & Generators'
                      : c === 'effects'
                      ? 'Special Effects'
                      : c}
                  </option>
                ))}
              </select>
              {category === '__custom__' && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Type the new category, e.g. Acoustics"
                  className="w-full mt-2 px-4 py-2.5 rounded-xl bg-ink border border-amber/40 text-white text-xs"
                  required
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
                Price per day (₹) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={pricePaise / 100}
                onChange={(e) => setPricePaise(Number(e.target.value) * 100)}
                placeholder="2500"
                className="w-full px-4 py-2.5 rounded-xl bg-ink border border-white/20 text-white text-xs font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">Description *</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the equipment…"
              className="w-full px-4 py-2.5 rounded-xl bg-ink border border-white/20 text-white text-xs resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-ink border border-white/20 text-white text-xs"
              >
                <option value="unit">Unit</option>
                <option value="set">Set</option>
                <option value="piece">Piece</option>
                <option value="box">Box</option>
                <option value="pair">Pair</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">Availability</label>
              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  isAvailable
                    ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400'
                    : 'bg-red-950/60 border-red-500/30 text-red-400'
                }`}
              >
                {isAvailable ? 'Available for Rent' : 'Disabled'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-neutral-400 mb-1">
              Equipment Photos ({images.length})
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {images.map((url, idx) => (
                <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/15 bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    disabled={saving || uploading}
                    onClick={() => setImages((prev) => prev.filter((u) => u !== url))}
                    className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/70 text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
                    title="Remove photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label
                className={`w-20 h-20 rounded-xl border-2 border-dashed border-white/25 bg-white/5 flex flex-col items-center justify-center gap-1 text-neutral-400 hover:text-white hover:border-amber hover:bg-amber/10 cursor-pointer transition-all ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin text-amber" /> : <Upload className="w-4 h-4" />}
                <span className="text-[9px] font-mono uppercase tracking-wider">Add</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  disabled={uploading}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) addFiles(Array.from(e.target.files));
                    e.target.value = '';
                  }}
                />
              </label>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1.5">
              JPG/PNG/WebP, max 5 MB each.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving…</span></>
            ) : (
              <><Check className="w-4 h-4" /><span>{mode === 'edit' ? 'Save Changes' : 'Add To Catalog'}</span></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export interface MaterialLightboxProps {
  material: Material;
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function MaterialLightbox({
  material,
  index,
  onClose,
  onNavigate,
}: MaterialLightboxProps) {
  const images = material.images || [];
  const current = images[index];
  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${material.name} photos`}
    >
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className="text-xs font-mono text-neutral-300 px-3 py-1.5 rounded-full bg-white/10">
          {index + 1} / {images.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Close gallery"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute top-4 left-4 max-w-[60vw]">
        <span className="font-heading text-sm font-bold text-white truncate block">
          {material.name}
        </span>
      </div>

      <div className="w-full max-w-5xl flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => onNavigate((index - 1 + images.length) % images.length)}
          disabled={images.length < 2}
          className="p-2 sm:p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          aria-label="Previous photo"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 relative aspect-[16/10] overflow-hidden rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={current}
            src={current}
            alt={`${material.name} photo ${index + 1}`}
            className="w-full h-full object-contain"
          />
        </div>

        <button
          type="button"
          onClick={() => onNavigate((index + 1) % images.length)}
          disabled={images.length < 2}
          className="p-2 sm:p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          aria-label="Next photo"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {images.length > 1 && (
        <div
          className="mt-4 flex items-center gap-2 max-w-full overflow-x-auto px-1 py-1"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, i) => (
            <button
              type="button"
              key={img}
              onClick={() => onNavigate(i)}
              className={`w-14 h-10 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                i === index ? 'border-amber' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
              aria-label={`Photo ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
