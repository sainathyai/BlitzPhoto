-- Add thumbnail and metadata columns to photos table
ALTER TABLE photos
ADD COLUMN IF NOT EXISTS thumbnail_s3_key VARCHAR(1024),
ADD COLUMN IF NOT EXISTS width INTEGER,
ADD COLUMN IF NOT EXISTS height INTEGER;

-- Create index for thumbnail lookups
CREATE INDEX IF NOT EXISTS idx_photos_thumbnail_s3_key ON photos (thumbnail_s3_key);

-- Create index for dimension-based queries
CREATE INDEX IF NOT EXISTS idx_photos_dimensions ON photos (width, height) WHERE width IS NOT NULL AND height IS NOT NULL;

