-- Create upload_jobs table
-- This table stores upload job aggregates (aggregate root)

CREATE TABLE upload_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'CREATED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    CONSTRAINT fk_upload_jobs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_upload_jobs_status CHECK (status IN ('CREATED', 'IN_PROGRESS', 'COMPLETED', 'PARTIALLY_COMPLETED', 'FAILED'))
);

-- Create index on user_id for fast lookups
CREATE INDEX idx_upload_jobs_user_id ON upload_jobs(user_id);

-- Create index on status for filtering by status
CREATE INDEX idx_upload_jobs_status ON upload_jobs(status);

-- Create index on created_at for sorting by creation date
CREATE INDEX idx_upload_jobs_created_at ON upload_jobs(created_at DESC);

-- Create composite index for user's upload jobs ordered by creation date
CREATE INDEX idx_upload_jobs_user_created ON upload_jobs(user_id, created_at DESC);

-- Add comment to table
COMMENT ON TABLE upload_jobs IS 'Upload job aggregates managing batches of photos';
COMMENT ON COLUMN upload_jobs.status IS 'Job status: CREATED, IN_PROGRESS, COMPLETED, PARTIALLY_COMPLETED, FAILED';
COMMENT ON COLUMN upload_jobs.completed_at IS 'Timestamp when job reached terminal state (COMPLETED, PARTIALLY_COMPLETED, or FAILED)';

