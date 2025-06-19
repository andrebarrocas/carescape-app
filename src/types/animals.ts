export interface Animal {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  coordinates: string | { lat: number; lng: number };
  image: string;
  date: string;
  scientificName: string;
  habitat: string;
  diet: string;
  behavior: string;
  conservation: string;
} 