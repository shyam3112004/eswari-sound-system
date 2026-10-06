'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Minus,
  ShoppingCart,
  Volume2,
  Lightbulb,
  Layers,
  Battery,
  Wind,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

interface Material {
  id: string;
  name: string;
  category: string;
  description: string;
  pricePerDay: number;
  unit: string;
  isAvailable: boolean;
}

interface SelectedMaterial {
  material: Material;
  quantity: number;
}

interface MaterialsSelectionProps {
  selectedMaterials: SelectedMaterial[];
  onMaterialsChange: (materials: SelectedMaterial[]) => void;
  onNext?: () => void;
  onBack?: () => void;
  showNavigation?: boolean;
  isCustomPackage?: boolean;
}

export default function MaterialsSelection({
  selectedMaterials,
  onMaterialsChange,
  onNext,
  onBack,
  showNavigation = true,
  isCustomPackage = false,
}: MaterialsSelectionProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [validationError, setValidationError] = useState<string | null>(null);

  const categoryIcons: Record<string, React.ReactNode> = {
    audio: <Volume2 className="w-4 h-4" />,
    lighting: <Lightbulb className="w-4 h-4" />,
    staging: <Layers className="w-4 h-4" />,
    power: <Battery className="w-4 h-4" />,
    effects: <Wind className="w-4 h-4" />,
  };

  const categoryNames: Record<string, string> = {
    audio: 'Audio Equipment',
    lighting: 'Lighting & Effects',
    staging: 'Staging & Structure', 
    power: 'Power & Generators',
    effects: 'Special Effects',
  };

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

  if (loading) {
    return (
      <div className="glass-card rounded-3xl p-8 border border-white/10 space-y-6">
        <div className="text-center text-neutral-400 font-mono text-xs">
          Loading rental materials catalog...
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-8 border border-white/10 space-y-6">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
          isCustomPackage
            ? 'bg-amber/20 border border-amber/40 text-amber'
            : 'bg-haze/15 border border-haze/30 text-haze'
        }`}>
          <Package className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-xl font-bold text-white">
              {isCustomPackage ? 'Step 3: Select Materials for Custom Package' : 'Additional Materials Rental (Optional)'}
            </h2>
            {isCustomPackage && (
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber/20 border border-amber/40 text-amber font-bold">
                Custom Rig
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-400">
            {isCustomPackage
              ? 'Select the exact sound, lighting, staging, power, and effects gear for your custom setup.'
              : 'Add extra equipment to your booking. All items are rented per day.'}
          </p>
        </div>
      </div>

      {validationError && (
        <div className="p-3.5 rounded-2xl bg-amber-950/70 border border-amber-500/40 text-amber text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            activeCategory === 'all'
              ? 'bg-haze text-ink font-semibold'
              : 'bg-white/5 text-neutral-400 hover:text-white border border-white/10'
          }`}
        >
          All Categories ({materials.length})
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeCategory === category
                ? 'bg-haze text-ink font-semibold'
                : 'bg-white/5 text-neutral-400 hover:text-white border border-white/10'
            }`}
          >
            {categoryIcons[category]}
            <span>{categoryNames[category]} ({materialsByCategory[category]?.length || 0})</span>
          </button>
        ))}
      </div>

      {/* Materials Grid */}
      <div className="space-y-6">
        {activeCategory === 'all' ? (
          // Show by categories
          Object.entries(materialsByCategory).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2 py-2 border-b border-white/10">
                {categoryIcons[category]}
                <h3 className="font-heading text-base font-bold text-white">
                  {categoryNames[category]}
                </h3>
                <span className="text-xs text-neutral-400 font-mono">
                  ({items.length} items)
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((material) => (
                  <MaterialCard
                    key={material.id}
                    material={material}
                    quantity={getSelectedQuantity(material.id)}
                    onQuantityChange={(quantity) => updateQuantity(material, quantity)}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          // Show filtered materials
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map((material) => (
              <MaterialCard
                key={material.id}
                material={material}
                quantity={getSelectedQuantity(material.id)}
                onQuantityChange={(quantity) => updateQuantity(material, quantity)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Selected Materials Summary */}
      {selectedMaterials.length > 0 && (
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCart className="w-4 h-4 text-haze" />
            <span className="font-heading text-sm font-bold text-white">
              Selected Materials ({selectedMaterials.length})
            </span>
          </div>
          
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {selectedMaterials.map((sm) => (
              <div
                key={sm.material.id}
                className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 text-xs"
              >
                <div className="flex-1">
                  <span className="text-white font-medium">{sm.material.name}</span>
                  <span className="text-neutral-400 ml-2">
                    {formatINR(sm.material.pricePerDay)} × {sm.quantity} = {formatINR(sm.material.pricePerDay * sm.quantity)}
                  </span>
                </div>
                <button
                  onClick={() => updateQuantity(sm.material, 0)}
                  className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-white/10 mt-3">
            <span className="text-xs text-neutral-400 font-mono">Total Materials Cost:</span>
            <span className="font-mono font-bold text-haze">{formatINR(getTotalCost())}/day</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      {showNavigation && (
        <div className="flex justify-between items-center pt-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white"
            >
              ← Back to Package Selection
            </button>
          )}

          <div className="ml-auto">
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
                className={`px-6 py-3 rounded-full text-ink font-semibold text-xs uppercase tracking-wider hover:brightness-110 flex items-center gap-2 shadow-lg transition-all ${
                  isCustomPackage
                    ? 'bg-gradient-to-r from-amber to-amber-soft shadow-amber/20'
                    : 'bg-gradient-to-r from-haze to-haze-soft shadow-haze/20'
                }`}
              >
                <span>Continue to Venue Details</span>
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface MaterialCardProps {
  material: Material;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}

function MaterialCard({ material, quantity, onQuantityChange }: MaterialCardProps) {
  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
      <div className="space-y-3">
        <div>
          <h4 className="font-heading text-sm font-bold text-white">
            {material.name}
          </h4>
          <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
            {material.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-xs font-mono text-amber font-bold">
            {formatINR(material.pricePerDay)}/{material.unit}/day
          </span>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
              disabled={quantity === 0}
              className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            
            <span className="w-8 text-center text-xs font-mono font-bold text-white">
              {quantity}
            </span>
            
            <button
              onClick={() => onQuantityChange(quantity + 1)}
              className="p-1 rounded-lg bg-haze/20 text-haze hover:bg-haze/30 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {quantity > 0 && (
          <div className="text-xs text-center p-2 rounded-xl bg-haze/10 border border-haze/30 text-haze font-mono">
            Subtotal: {formatINR(material.pricePerDay * quantity)}/day
          </div>
        )}
      </div>
    </div>
  );
}