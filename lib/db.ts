import { prisma } from './prisma';

const FALLBACK_PACKAGES = [
  {
    id: 'basic-sound',
    slug: 'basic-sound',
    name: 'Basic Sound Package',
    category: 'audio',
    description: 'Perfect for small gatherings and house parties. Includes 2 speakers, 1 mic, and basic mixer.',
    features: [
      '2 × 500W Powered Speakers',
      '1 × Wireless Microphone',
      '4-Channel Mixer',
      'Setup & Sound Check',
    ],
    price: 800000,
    image: null,
    isPopular: false,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'premium-dj',
    slug: 'premium-dj',
    name: 'Premium DJ Package',
    category: 'combo',
    description: 'Complete DJ setup with lighting for medium-sized events. Includes sound, lights, and DJ console.',
    features: [
      '4 × 1000W Line Array Speakers',
      '2 × Wireless Mics + 1 Wired Mic',
      'Professional DJ Controller',
      'LED PAR Can Lights (4 units)',
      'Fog Machine',
      'Truss Stand Setup',
      'Sound Engineer + DJ',
    ],
    price: 2500000,
    image: null,
    isPopular: true,
    sortOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'stage-lighting',
    slug: 'stage-lighting',
    name: 'Stage Lighting Package',
    category: 'lighting',
    description: 'Dynamic lighting setup to transform any venue into a concert hall.',
    features: [
      '8 × LED Moving Head Lights',
      '12 × LED PAR Cans',
      '2 × Follow Spots',
      'DMX Controller + Operator',
      'Truss Rigging',
    ],
    price: 1800000,
    image: null,
    isPopular: false,
    sortOrder: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'mega-event',
    slug: 'mega-event',
    name: 'Mega Event Package',
    category: 'combo',
    description: 'The ultimate production package for weddings, corporate events, and large celebrations.',
    features: [
      '8 × 1000W Line Array Speakers',
      'Subwoofer Array (4 units)',
      '4 × Wireless Mics',
      'Digital Mixer + Stage Box',
      'LED Wall (P3.9, 3×2m)',
      '12 × Moving Head Lights',
      'CO2 Jet Effects',
      'Full Truss + Stage Setup',
      'Sound Engineer + Lighting Designer',
    ],
    price: 5500000,
    image: null,
    isPopular: false,
    sortOrder: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'custom-rig',
    slug: 'custom-rig',
    name: 'Custom Rig (Choose Materials)',
    category: 'combo',
    description: 'Build your own custom setup by selecting individual rental materials. Total price is calculated dynamically from your material choices with no fixed package minimum.',
    features: [
      'Choose from Audio, Lighting, Staging, Power & Effects',
      'Mix and match any quantity of equipment',
      'Pay only for what you select (₹0 base package fee)',
      'Delivery, rigging & retrieval included',
      'Lock your date with a 25% advance deposit',
    ],
    price: 0,
    image: null,
    isPopular: false,
    sortOrder: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function getAllPackages() {
  try {
    const packages = await prisma.package.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    if (packages && packages.length > 0) {
      return packages.map((pkg) => ({
        ...pkg,
        features: JSON.parse(pkg.features || '[]') as string[],
      }));
    }
  } catch (err) {
    console.warn('Prisma package query fallback:', err);
  }

  return FALLBACK_PACKAGES;
}

export async function getPackageBySlug(slug: string) {
  try {
    const pkg = await prisma.package.findUnique({
      where: { slug },
    });

    if (pkg) {
      return {
        ...pkg,
        features: JSON.parse(pkg.features || '[]') as string[],
      };
    }
  } catch (err) {
    console.warn('Prisma single package query fallback:', err);
  }

  const fallback = FALLBACK_PACKAGES.find((p) => p.slug === slug);
  return fallback || null;
}

export async function isDateBlocked(date: Date): Promise<{ isBlocked: boolean; reason?: string }> {
  try {
    // Normalize date to YYYY-MM-DD bounds
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Check Availability table
    const blockedAvailability = await prisma.availability.findFirst({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        isBlocked: true,
      },
    });

    if (blockedAvailability) {
      return {
        isBlocked: true,
        reason: blockedAvailability.reason || 'Date is unavailable',
      };
    }

    // Check Confirmed Bookings on this date
    const existingBooking = await prisma.booking.findFirst({
      where: {
        eventDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ['CONFIRMED', 'PENDING'],
        },
      },
    });

    if (existingBooking) {
      return {
        isBlocked: true,
        reason: 'Date already reserved by another production',
      };
    }

    return { isBlocked: false };
  } catch (err) {
    console.warn('Prisma availability check fallback:', err);
    return { isBlocked: false };
  }
}

export async function getBlockedDatesInRange(startDate: Date, endDate: Date) {
  try {
    const [availabilityList, bookingsList] = await Promise.all([
      prisma.availability.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
          isBlocked: true,
        },
        select: { date: true, reason: true },
      }),
      prisma.booking.findMany({
        where: {
          eventDate: {
            gte: startDate,
            lte: endDate,
          },
          status: { in: ['CONFIRMED', 'PENDING'] },
        },
        select: { eventDate: true },
      }),
    ]);

    const blockedMap = new Map<string, string>();

    availabilityList.forEach((a) => {
      const key = a.date.toISOString().split('T')[0];
      blockedMap.set(key, a.reason || 'Unavailable');
    });

    bookingsList.forEach((b) => {
      const key = b.eventDate.toISOString().split('T')[0];
      blockedMap.set(key, 'Already Booked');
    });

    return Array.from(blockedMap.entries()).map(([date, reason]) => ({
      date,
      reason,
    }));
  } catch (err) {
    console.warn('Prisma getBlockedDatesInRange fallback:', err);
    return [];
  }
}
