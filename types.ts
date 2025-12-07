
export interface ResortFeature {
  icon: string;
  title: string;
  description?: string;
}

export interface InclusionItem {
  icon: string;
  title: string;
}

export interface AirportInfo {
  code: string;
  name: string;
  distance: string;
  time: string;
}

export interface PriceTier {
  durationLabel: string;
  priceSingle: string;
  priceDouble: string;
}

export interface PackageItem {
  name: string;
  durations: string[];
}

export interface PackageCategory {
  title: string;
  items: PackageItem[];
  priceTiers: PriceTier[];
}

export interface Resort {
  id: string;
  name: string;
  location: string;
  description: string;
  longDescription?: string;
  imageUrl: string;
  badge?: string;
  airport?: AirportInfo;
  features?: ResortFeature[];
  offerIncludes?: InclusionItem[];
  treatmentIncludes?: InclusionItem[];
  packageCategories: PackageCategory[];
  stars?: number;
  bookingScore?: number;
}

export interface BookingFormData {
  name: string;
  phone: string;
  email: string;
  date: string;
  plan: string;
  duration?: string;
  roomType?: 'single' | 'double';
  price?: string;
}
