import { MediaUpload } from '@/types/colors';

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string | null;
    image: string | null;
    displayName?: string;
  };
  replies?: Comment[];
}

export interface MediaUploadWithComments extends Omit<MediaUpload, 'data'> {
  colorId: string | null;
  comments: Comment[];
  createdAt: string;
  type: 'outcome' | 'landscape' | 'process';
  caption: string;
}

export interface ExtendedColor {
  id: string;
  name: string;
  hex: string;
  description: string | null;
  aiDescription?: string;
  location: string;
  coordinates: string | null;
  bioregion: {
    description: string;
    boundary: {
      type: string;
      coordinates: [number, number][][];
    };
  } | null;
  dateCollected: string;
  season: string;
  authorName?: string | null;
  materials: {
    id: string;
    name: string;
    partUsed: string;
    originNote: string | null;
    createdAt: string;
    updatedAt: string;
  }[];
  processes: {
    id: string;
    technique: string;
    application: string;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
  }[];
  mediaUploads: MediaUploadWithComments[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  sourceMaterial: string;
  type: 'pigment' | 'dye' | 'ink';
  user: {
    id: string;
    name: string | null;
    email: string;
    pseudonym: string | null;
  };
} 