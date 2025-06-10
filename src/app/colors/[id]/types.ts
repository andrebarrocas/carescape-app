import { Color, Material, Process, MediaUpload, Comment, User } from '@prisma/client';

export interface ExtendedComment extends Comment {
  user: Pick<User, 'name' | 'image'>;
}

export interface ExtendedMediaUpload extends Omit<MediaUpload, 'data'> {
  comments: ExtendedComment[];
}

export interface ExtendedColor extends Omit<Color, 'bioregion'> {
  bioregion: {
    description: string;
    boundary?: {
      type: string;
      coordinates: number[][][];
    };
  } | null;
  materials: Material[];
  processes: Process[];
  mediaUploads: ExtendedMediaUpload[];
}

export type ColorWithRelations = Color & {
  materials: Material[];
  processes: Process[];
  mediaUploads: (MediaUpload & {
    comments: (Comment & {
      user: Pick<User, 'name' | 'image'>;
    })[];
  })[];
}; 