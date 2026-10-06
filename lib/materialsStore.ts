import { prisma } from './prisma';

// Global shared store across serverless lambdas in warm execution
const globalStore = global as unknown as {
  inMemoryMaterials: Map<string, any>;
};

if (!globalStore.inMemoryMaterials) {
  globalStore.inMemoryMaterials = new Map<string, any>();
}

export const inMemoryMaterials = globalStore.inMemoryMaterials;

export interface CreateMaterialInput {
  name: string;
  category: string;
  description: string;
  pricePerDay: number; // in paise
  unit?: string;
  isAvailable?: boolean;
  sortOrder?: number;
}

export interface UpdateMaterialInput {
  name?: string;
  category?: string;
  description?: string;
  pricePerDay?: number;
  unit?: string;
  isAvailable?: boolean;
  sortOrder?: number;
}

export interface BookingMaterialInput {
  materialId: string;
  quantity: number;
}

// Material CRUD Operations
export async function createMaterialSafe(input: CreateMaterialInput) {
  const materialData = {
    id: `mat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: input.name.trim(),
    category: input.category.trim(),
    description: input.description.trim(),
    pricePerDay: input.pricePerDay,
    unit: input.unit || 'unit',
    isAvailable: input.isAvailable ?? true,
    sortOrder: input.sortOrder ?? 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  try {
    const dbMaterial = await prisma.material.create({
      data: materialData,
    });

    inMemoryMaterials.set(dbMaterial.id, dbMaterial);
    return dbMaterial;
  } catch (dbErr) {
    console.warn('Prisma createMaterial failed, storing in resilient fallback store:', dbErr);
    inMemoryMaterials.set(materialData.id, materialData);
    return materialData;
  }
}

export const DEFAULT_MATERIALS = [
  {
    id: 'mat_audio_line_array',
    name: 'Line Array Speaker Box (Dual 12")',
    category: 'audio',
    description: 'Professional grade dual 12-inch line array speaker with rigging hardware. Suitable for medium to large venues.',
    pricePerDay: 350000,
    unit: 'unit',
    isAvailable: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'mat_audio_subwoofer',
    name: '18" High-Output Subwoofer',
    category: 'audio',
    description: 'High-output 18-inch horn-loaded subwoofer for deep sub-bass reinforcement. Ideal for live bands and outdoor events.',
    pricePerDay: 250000,
    unit: 'unit',
    isAvailable: true,
    sortOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'mat_audio_wireless_mic',
    name: 'Wireless Microphone Set (UHF Handheld)',
    category: 'audio',
    description: 'UHF handheld wireless microphone system with dual diversity receiver and anti-interference filters.',
    pricePerDay: 80000,
    unit: 'set',
    isAvailable: true,
    sortOrder: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'mat_audio_digital_mixer',
    name: 'Digital Mixing Console (32-ch)',
    category: 'audio',
    description: '32-channel digital audio mixer with built-in DSP effects processor, motorized faders, and stage box sync.',
    pricePerDay: 300000,
    unit: 'unit',
    isAvailable: true,
    sortOrder: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'mat_audio_stage_monitor',
    name: 'Stage Monitor (Floor Wedge 15")',
    category: 'audio',
    description: '15-inch coaxial active floor monitor wedge for on-stage vocal and instrument foldback.',
    pricePerDay: 120000,
    unit: 'unit',
    isAvailable: true,
    sortOrder: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'mat_lighting_moving_head',
    name: 'LED Moving Head Light (Beam/Spot 150W)',
    category: 'lighting',
    description: 'Professional 150W LED moving head beam/spot hybrid fixture with motorized focus and gobo wheel. DMX controlled.',
    pricePerDay: 150000,
    unit: 'unit',
    isAvailable: true,
    sortOrder: 6,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'mat_lighting_par_can',
    name: 'LED Stage Par Can (RGBWA 54x3W)',
    category: 'lighting',
    description: 'High-brightness RGBWA color-mixing PAR fixture for stage backdrop wash and truss warming.',
    pricePerDay: 40000,
    unit: 'unit',
    isAvailable: true,
    sortOrder: 7,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'mat_lighting_follow_spot',
    name: 'Follow Spot Light 1200W with Stand',
    category: 'lighting',
    description: 'High-power manual follow spot with iris, color changer, and heavy-duty tripod stand for key artist spotlighting.',
    pricePerDay: 200000,
    unit: 'unit',
    isAvailable: true,
    sortOrder: 8,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'mat_staging_truss',
    name: 'Aluminum Box Truss (10ft / 3m Section)',
    category: 'staging',
    description: 'Heavy duty 12-inch triangular/square aluminum truss section with spigoted connectors.',
    pricePerDay: 60000,
    unit: 'piece',
    isAvailable: true,
    sortOrder: 9,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'mat_staging_crank_stand',
    name: 'Heavy Duty Crank Stand (6m Height)',
    category: 'staging',
    description: 'Telescopic crank tower stand with safety brake for flying speakers and lighting truss up to 6 meters.',
    pricePerDay: 120000,
    unit: 'unit',
    isAvailable: true,
    sortOrder: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'mat_power_generator',
    name: '62.5 kVA Silent Diesel Generator',
    category: 'power',
    description: 'Acoustically insulated mobile silent generator with automatic voltage regulation (AVR) for concert audio safety.',
    pricePerDay: 800000,
    unit: 'unit',
    isAvailable: true,
    sortOrder: 11,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'mat_effects_fog_machine',
    name: 'High-Output Stage Fog / Haze Machine',
    category: 'effects',
    description: 'Continuous haze generator designed to enhance beam dispersion and lighting rays without leaving residue.',
    pricePerDay: 100000,
    unit: 'unit',
    isAvailable: true,
    sortOrder: 12,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'mat_effects_cold_spark',
    name: 'Cold Spark Fountain Machine',
    category: 'effects',
    description: 'Indoor-safe pyrotechnic spark simulator with non-hazardous cold sparks up to 4m height. DMX controllable.',
    pricePerDay: 250000,
    unit: 'unit',
    isAvailable: true,
    sortOrder: 13,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

function seedDefaultMaterialsIfEmpty(map: Map<string, any>) {
  if (map.size === 0) {
    DEFAULT_MATERIALS.forEach((m) => {
      map.set(m.id, m);
      inMemoryMaterials.set(m.id, m);
    });
  }
}

export async function getAllMaterialsSafe() {
  const map = new Map<string, any>(inMemoryMaterials);

  try {
    const dbMaterials = await prisma.material.findMany({
      where: { isAvailable: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    dbMaterials.forEach((m) => map.set(m.id, m));
  } catch (err) {
    console.warn('Prisma getAllMaterials error, returning fallback memory materials:', err);
  }

  seedDefaultMaterialsIfEmpty(map);

  return Array.from(map.values())
    .filter((m) => m.isAvailable)
    .sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

export async function getAllMaterialsForAdminSafe() {
  const map = new Map<string, any>(inMemoryMaterials);

  try {
    const dbMaterials = await prisma.material.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    dbMaterials.forEach((m) => map.set(m.id, m));
  } catch (err) {
    console.warn('Prisma getAllMaterials error, returning fallback memory materials:', err);
  }

  seedDefaultMaterialsIfEmpty(map);

  return Array.from(map.values()).sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function getMaterialByIdSafe(id: string) {
  if (inMemoryMaterials.has(id)) {
    return inMemoryMaterials.get(id);
  }

  try {
    const material = await prisma.material.findUnique({
      where: { id },
    });
    if (material) {
      inMemoryMaterials.set(material.id, material);
      return material;
    }
  } catch (err) {
    console.warn('Prisma getMaterialById error:', err);
  }

  const defaultMat = DEFAULT_MATERIALS.find((m) => m.id === id);
  if (defaultMat) {
    inMemoryMaterials.set(defaultMat.id, defaultMat);
    return defaultMat;
  }

  return inMemoryMaterials.get(id) || null;
}

export async function updateMaterialSafe(id: string, input: UpdateMaterialInput) {
  const existing = await getMaterialByIdSafe(id);

  if (existing) {
    const updated = {
      ...existing,
      ...input,
      updatedAt: new Date(),
    };
    inMemoryMaterials.set(id, updated);
  }

  try {
    const dbUpdated = await prisma.material.update({
      where: { id },
      data: input,
    });
    inMemoryMaterials.set(id, dbUpdated);
    return dbUpdated;
  } catch (err) {
    console.warn('Prisma updateMaterial error:', err);
  }

  return inMemoryMaterials.get(id);
}

export async function deleteMaterialSafe(id: string) {
  try {
    await prisma.material.delete({
      where: { id },
    });
    inMemoryMaterials.delete(id);
    return true;
  } catch (err) {
    console.warn('Prisma deleteMaterial error:', err);
    // Soft delete in memory
    const existing = inMemoryMaterials.get(id);
    if (existing) {
      inMemoryMaterials.set(id, { ...existing, isAvailable: false });
    }
    return false;
  }
}

// Booking Materials Operations
export async function addMaterialsToBookingSafe(
  bookingId: string,
  materials: BookingMaterialInput[]
) {
  const bookingMaterials = [];

  for (const materialInput of materials) {
    const material = await getMaterialByIdSafe(materialInput.materialId);
    if (!material) {
      throw new Error(`Material with ID ${materialInput.materialId} not found`);
    }

    const totalPrice = material.pricePerDay * materialInput.quantity;

    const bookingMaterialData = {
      id: `bm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      bookingId,
      materialId: materialInput.materialId,
      quantity: materialInput.quantity,
      pricePerDay: material.pricePerDay,
      totalPrice,
      createdAt: new Date(),
    };

    try {
      const dbBookingMaterial = await prisma.bookingMaterial.create({
        data: bookingMaterialData,
        include: { material: true },
      });
      bookingMaterials.push(dbBookingMaterial);
    } catch (dbErr) {
      console.warn('Prisma createBookingMaterial failed:', dbErr);
      bookingMaterials.push({ ...bookingMaterialData, material });
    }
  }

  return bookingMaterials;
}

export async function getBookingMaterialsSafe(bookingId: string) {
  try {
    const bookingMaterials = await prisma.bookingMaterial.findMany({
      where: { bookingId },
      include: { material: true },
    });
    return bookingMaterials;
  } catch (err) {
    console.warn('Prisma getBookingMaterials error:', err);
    return [];
  }
}

export async function removeBookingMaterialSafe(bookingId: string, materialId: string) {
  try {
    await prisma.bookingMaterial.delete({
      where: {
        bookingId_materialId: {
          bookingId,
          materialId,
        },
      },
    });
    return true;
  } catch (err) {
    console.warn('Prisma removeBookingMaterial error:', err);
    return false;
  }
}

export async function updateBookingMaterialQuantitySafe(
  bookingId: string,
  materialId: string,
  quantity: number
) {
  const material = await getMaterialByIdSafe(materialId);
  if (!material) {
    throw new Error('Material not found');
  }

  const totalPrice = material.pricePerDay * quantity;

  try {
    const updated = await prisma.bookingMaterial.update({
      where: {
        bookingId_materialId: {
          bookingId,
          materialId,
        },
      },
      data: {
        quantity,
        totalPrice,
      },
      include: { material: true },
    });
    return updated;
  } catch (err) {
    console.warn('Prisma updateBookingMaterial error:', err);
    return null;
  }
}

export function getMaterialsByCategory(materials: any[]) {
  const categories = materials.reduce((acc, material) => {
    const category = material.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(material);
    return acc;
  }, {} as Record<string, any[]>);

  return categories;
}