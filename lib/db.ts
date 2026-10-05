import { prisma } from './prisma';

export async function getAllPackages() {
  const packages = await prisma.package.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  return packages.map((pkg) => ({
    ...pkg,
    features: JSON.parse(pkg.features || '[]') as string[],
  }));
}

export async function getPackageBySlug(slug: string) {
  const pkg = await prisma.package.findUnique({
    where: { slug },
  });

  if (!pkg) return null;

  return {
    ...pkg,
    features: JSON.parse(pkg.features || '[]') as string[],
  };
}

export async function isDateBlocked(date: Date): Promise<{ isBlocked: boolean; reason?: string }> {
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
}

export async function getBlockedDatesInRange(startDate: Date, endDate: Date) {
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
}
