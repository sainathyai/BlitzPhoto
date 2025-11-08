-- Create photos table
-- This table stores individual photos within upload jobs

CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upload_job_id UUID NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    error_message VARCHAR(1000),
    s3_key VARCHAR(1000),
    thumbnail_s3_key VARCHAR(1000),
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_at TIMESTAMP,
    
    CONSTRAINT fk_photos_upload_job FOREIGN KEY (upload_job_id) REFERENCES upload_jobs(id) ON DELETE CASCADE,
    CONSTRAINT chk_photos_status CHECK (status IN ('PENDING', 'UPLOADING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    CONSTRAINT chk_photos_file_size CHECK (file_size > 0)
);

-- Create index on upload_job_id for fast lookups
CREATE INDEX idx_photos_upload_job_id ON photos(upload_job_id);

-- Create index on status for filtering by status
CREATE INDEX idx_photos_status ON photos(status);

-- Create index on created_at for sorting by creation date
CREATE INDEX idx_photos_created_at ON photos(created_at DESC);

-- Create composite index for upload job's photos ordered by creation date
CREATE INDEX idx_photos_job_created ON photos(upload_job_id, created_at DESC);

-- Create index on s3_key for fast lookups (when photo is completed)
CREATE INDEX idx_photos_s3_key ON photos(s3_key) WHERE s3_key IS NOT NULL;

-- Add comment to table
COMMENT ON TABLE photos IS 'Individual photos within upload jobs';
COMMENT ON COLUMN photos.status IS 'Photo status: PENDING, UPLOADING, PROCESSING, COMPLETED, FAILED';
COMMENT ON COLUMN photos.s3_key IS 'S3 key where the photo is stored (null until upload completes)';
COMMENT ON COLUMN photos.thumbnail_s3_key IS 'S3 key for the thumbnail (null until processing completes)';
COMMENT ON COLUMN photos.error_message IS 'Error message if upload or processing failed';

