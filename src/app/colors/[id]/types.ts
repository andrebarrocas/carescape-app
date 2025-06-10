import type { MediaUpload, User } from '@prisma/client';

export interface MediaUploadWithComments extends Omit<MediaUpload, 'data'> {
  comments: Array<{
    id: string;
    content: string;
    createdAt: Date;
    user: Pick<User, 'name' | 'image'> | null;
  }>;
}

export interface ExtendedColor {
  id: string;
  name: string;
  hex: string;
  description: string;
  location: string;
  coordinates: string | null;
  bioregion: {
    description: string;
    boundary: [number, number][];
  } | null;
  bioregionMap: string | null;
  season: string;
  dateCollected: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  materials: Array<{
    id: string;
    name: string;
    partUsed: string;
  }>;
  processes: Array<{
    id: string;
    technique: string;
    application: string;
    notes: string;
  }>;
  mediaUploads: MediaUploadWithComments[];
} 