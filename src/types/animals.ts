export interface Animal {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  coordinates: string | { lat: number; lng: number };
  image: string;
  date: string | Date;
  scientificName?: string | null;
  habitat?: string | null;
  diet?: string | null;
  behavior?: string | null;
  conservation?: string | null;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
} 