export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'ADVANCE_PAID' | 'FULLY_PAID';
export type InquiryStatus = 'NEW' | 'QUOTED' | 'ACCEPTED' | 'DECLINED';

export interface PackageFeature {
  name: string;
}

export interface PackageData {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  features: string[];
  price: number;
  image?: string | null;
  isPopular: boolean;
  sortOrder: number;
}
