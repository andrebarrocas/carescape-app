-- Enable PostGIS extension for geometric data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT,
    pseudonym TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Colors table
CREATE TABLE colors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    hex TEXT NOT NULL,
    description TEXT,
    season TEXT,
    date_collected DATE NOT NULL,
    location_geom GEOMETRY(Point, 4326),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Materials table
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    color_id UUID REFERENCES colors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    part_used TEXT NOT NULL,
    origin_note TEXT
);

-- Processes table
CREATE TABLE processes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    color_id UUID REFERENCES colors(id) ON DELETE CASCADE,
    technique TEXT NOT NULL,
    application TEXT NOT NULL,
    notes TEXT
);

-- Media uploads table
CREATE TABLE media_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    color_id UUID REFERENCES colors(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    caption TEXT
);

-- Tags table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE
);

-- Color tags junction table
CREATE TABLE color_tags (
    color_id UUID REFERENCES colors(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (color_id, tag_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_colors_user_id ON colors(user_id);
CREATE INDEX idx_materials_color_id ON materials(color_id);
CREATE INDEX idx_processes_color_id ON processes(color_id);
CREATE INDEX idx_media_uploads_color_id ON media_uploads(color_id);
CREATE INDEX idx_color_tags_color_id ON color_tags(color_id);
CREATE INDEX idx_color_tags_tag_id ON color_tags(tag_id);
CREATE INDEX idx_tags_name ON tags(name);

-- Create spatial index for location data
CREATE INDEX idx_colors_location ON colors USING GIST(location_geom);

-- Add some helpful constraints
ALTER TABLE colors ADD CONSTRAINT valid_hex_code CHECK (hex ~* '^#[0-9A-F]{6}$');
ALTER TABLE media_uploads ADD CONSTRAINT valid_media_type CHECK (type IN ('landscape', 'process', 'result'));
ALTER TABLE colors ADD CONSTRAINT valid_season CHECK (season IN ('Spring', 'Summer', 'Fall', 'Winter')); 