export interface User {
  id: string;
  email?: string;
  pseudonym?: string;
  created_at: string;
}

export interface Color {
  id: string;
  name: string;
  hex: string;
  description: string;
  date_collected: string;
  season: string;
  user_id: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  created_at: string;
}

export interface Source {
  id: string;
  color_id: string;
  material: string;
  type: string;
  application: string;
  process: string;
  notes?: string;
}

export interface Upload {
  id: string;
  color_id: string;
  type: 'landscape' | 'result' | 'process';
  url: string;
  caption?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  name?: string;
} 