export type ColorType = 'pigment' | 'dye' | 'ink';

export interface Location {
  name: string;
  coordinates: [number, number]; // [latitude, longitude]
  photo?: string;
}

export interface Process {
  sourceMaterial: string;
  type: ColorType;
  application?: string;
  recipe: string;
  season: string;
}

export interface ColorSubmission {
  id: string;
  name: string;
  hexCode: string;
  photo: string;
  origin: Location;
  process: Process;
  mediaUploads?: string[];
  submittedBy?: {
    name?: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
} 