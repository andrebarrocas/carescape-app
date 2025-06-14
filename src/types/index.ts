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
  description?: string;
  aiDescription?: string;
  location: string;
  coordinates?: string;
  dateCollected: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  materials: Material[];
  processes: Process[];
  mediaUploads: MediaUpload[];
  bioregion?: Bioregion;
  bioregionId?: string;
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

export interface Process {
  id: string;
  colorId: string;
  technique: string;
  description: string;
  application?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Material {
  id: string;
  name: string;
  description?: string;
  partUsed: string;
  originNote: string;
  colorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaUpload {
  id: string;
  filename: string;
  mimetype: string;
  type: string;
  url: string;
  caption?: string;
  colorId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  colorId: string;
  mediaId?: string;
  userId: string;
  createdAt: string;
  author?: {
    id: string;
    name: string;
    email: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  updatedAt: string;
}

export interface Bioregion {
  id: string;
  name: string;
  description?: string;
  coordinates?: string;
  createdAt: Date;
  updatedAt: Date;
  colors: Color[];
} 