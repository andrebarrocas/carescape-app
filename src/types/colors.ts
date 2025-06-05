export type ColorType = 'pigment' | 'dye' | 'ink';

export interface MediaUpload {
  id: string;
  url: string;
  type: 'outcome' | 'landscape' | 'process';
  caption?: string;
  filename: string;
  mimetype: string;
}

export interface Material {
  id: string;
  name: string;
  partUsed: string;
  originNote: string;
  colorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Process {
  id: string;
  technique: string;
  application: string;
  notes: string;
  colorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ColorSubmission {
  id: string;
  name: string;
  hex: string;
  description: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  } | null;
  materials: Material[];
  processes: Process[];
  season: string;
  dateCollected: string;
  mediaUploads: MediaUpload[];
  createdAt: string;
  updatedAt: string;
  userId: string;
} 