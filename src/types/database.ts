export type User = {
  id: string;
  email?: string;
  pseudonym?: string;
  created_at: Date;
};

export type Color = {
  id: string;
  name: string;
  hex: string;
  description?: string;
  season?: 'Spring' | 'Summer' | 'Fall' | 'Winter';
  date_collected: Date;
  location_geom: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    crs: {
      type: 'name';
      properties: { name: 'EPSG:4326' };
    };
  };
  user_id: string;
  created_at: Date;
};

export type Material = {
  id: string;
  color_id: string;
  name: string;
  part_used: string;
  origin_note?: string;
};

export type Process = {
  id: string;
  color_id: string;
  technique: string;
  application: string;
  notes?: string;
};

export type MediaUpload = {
  id: string;
  color_id: string;
  type: 'landscape' | 'process' | 'result';
  url: string;
  caption?: string;
};

export type Tag = {
  id: string;
  name: string;
};

export type ColorTag = {
  color_id: string;
  tag_id: string;
}; 