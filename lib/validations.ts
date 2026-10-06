import { z } from 'zod';

export const bookingSchema = z.object({
  packageSlug: z.string().min(1, 'Package selection is required'),
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: z.string().email('Please enter a valid email address'),
  customerPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  eventDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid event date is required',
  }),
  venueAddress: z.string().min(5, 'Full venue address is required'),
  eventType: z.string().optional(),
  notes: z.string().max(500, 'Notes must be under 500 characters').optional(),
  materials: z.array(z.object({
    materialId: z.string(),
    quantity: z.number().min(1),
  })).optional(),
});

export const inquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  eventType: z.string().min(2, 'Event type is required (e.g. Wedding, Concert, Corporate)'),
  eventDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: 'Event date must be valid',
    }),
  venue: z.string().optional(),
  message: z.string().min(10, 'Please describe your event requirements (minimum 10 characters)'),
});

export const availabilityCheckSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid date (YYYY-MM-DD) is required',
  }),
});
