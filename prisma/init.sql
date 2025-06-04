-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create the database if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'carespace') THEN
        CREATE DATABASE carespace;
    END IF;
END
$$; 