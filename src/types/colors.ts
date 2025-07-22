export type ColorType = 'pigment' | 'dye' | 'ink';

export interface MediaUpload {
  id: string;
  filename: string;
  mimetype: string;
  type: 'outcome' | 'landscape' | 'process' | 'outcome_original';
  caption: string | undefined;
  colorId: string | null;
  createdAt: string;
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
  coordinates: string | null;
  bioregion: {
    description: string;
    boundary?: {
      coordinates: [number, number][][];
    };
  } | null;
  dateCollected: string;
  season: string;
  materials: Material[];
  processes: Process[];
  mediaUploads: MediaUpload[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  authorName?: string | null;
  sourceMaterial: string;
  type: 'pigment' | 'dye' | 'ink';
} 