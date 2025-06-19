export interface Animal {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  coordinates: string | { lat: number; lng: number };
  image: string;
  date: string | Date;
  scientificName?: string;
  habitat?: string;
  diet?: string;
  behavior?: string;
  conservation?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
} 