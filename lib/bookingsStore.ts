import { prisma } from './prisma';
import { getPackageBySlug } from './db';

// Global shared store across serverless lambdas in warm execution
const globalStore = global as unknown as {
  inMemoryBookings: Map<string, any>;
};

if (!globalStore.inMemoryBookings) {
  globalStore.inMemoryBookings = new Map<string, any>();
}

export const inMemoryBookings = globalStore.inMemoryBookings;

export interface CreateBookingInput {
  packageSlug: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: Date;
  venueAddress: string;
  eventType?: string;
  notes?: string | null;
}

export async function createBookingSafe(input: CreateBookingInput) {
  // 1. Resolve package
  let pkg: any = null;
  try {
    pkg = await prisma.package.findUnique({
      where: { slug: input.packageSlug },
    });
  } catch (err) {
    console.warn('Prisma package lookup fallback:', err);
  }

  if (!pkg) {
    pkg = await getPackageBySlug(input.packageSlug);
  }

  if (!pkg) {
    throw new Error('Package not found');
  }

  const totalAmount = pkg.price;
  const advanceAmount = Math.round(totalAmount * 0.25);
  const balanceAmount = totalAmount - advanceAmount;

  const bookingId = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const bookingData = {
    id: bookingId,
    packageId: pkg.id,
    customerName: input.customerName.trim(),
    customerEmail: input.customerEmail.toLowerCase().trim(),
    customerPhone: input.customerPhone.trim(),
    eventDate: input.eventDate,
    venueAddress: input.venueAddress.trim(),
    eventType: input.eventType?.trim() || 'Live Stage Production',
    totalAmount,
    advanceAmount,
    balanceAmount,
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    notes: input.notes?.trim() || null,
    createdAt: new Date(),
    updatedAt: new Date(),
    package: pkg,
  };

  // 2. Try database persist
  try {
    const dbBooking = await prisma.booking.create({
      data: {
        packageId: pkg.id,
        customerName: bookingData.customerName,
        customerEmail: bookingData.customerEmail,
        customerPhone: bookingData.customerPhone,
        eventDate: bookingData.eventDate,
        venueAddress: bookingData.venueAddress,
        eventType: bookingData.eventType,
        totalAmount,
        advanceAmount,
        balanceAmount,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        notes: bookingData.notes,
      },
      include: { package: true },
    });

    inMemoryBookings.set(dbBooking.id, dbBooking);
    return dbBooking;
  } catch (dbErr) {
    console.warn('Prisma createBooking failed, storing in resilient fallback store:', dbErr);
    inMemoryBookings.set(bookingId, bookingData);
    return bookingData;
  }
}

export async function getBookingByIdSafe(id: string) {
  // Check memory store first
  if (inMemoryBookings.has(id)) {
    return inMemoryBookings.get(id);
  }

  // Check database
  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { package: true },
    });
    if (booking) {
      inMemoryBookings.set(booking.id, booking);
      return booking;
    }
  } catch (err) {
    console.warn('Prisma getBookingById error:', err);
  }

  return inMemoryBookings.get(id) || null;
}

export async function updateBookingStatusSafe(
  id: string,
  updates: { status?: string; paymentStatus?: string; razorpayOrderId?: string; razorpayPaymentId?: string }
) {
  const existing = await getBookingByIdSafe(id);

  if (existing) {
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    inMemoryBookings.set(id, updated);
  }

  try {
    const dbUpdated = await prisma.booking.update({
      where: { id },
      data: updates,
      include: { package: true },
    });
    inMemoryBookings.set(id, dbUpdated);
    return dbUpdated;
  } catch (err) {
    console.warn('Prisma updateBooking error:', err);
  }

  return inMemoryBookings.get(id);
}

export async function getAllBookingsSafe() {
  const map = new Map<string, any>(inMemoryBookings);

  try {
    const dbBookings = await prisma.booking.findMany({
      include: { package: true },
      orderBy: { createdAt: 'desc' },
    });
    dbBookings.forEach((b) => map.set(b.id, b));
  } catch (err) {
    console.warn('Prisma getAllBookings error, returning fallback memory bookings:', err);
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
