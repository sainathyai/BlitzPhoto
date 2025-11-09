-- Create users table
-- This table stores user information for authentication and authorization

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

-- Create index on email for fast lookups
CREATE INDEX idx_users_email ON users(email);

-- Create index on username for fast lookups
CREATE INDEX idx_users_username ON users(username);

-- Create index on active status for filtering active users
CREATE INDEX idx_users_active ON users(active);

-- Add comment to table
COMMENT ON TABLE users IS 'User accounts for BlitzPhoto application';
COMMENT ON COLUMN users.password_hash IS 'BCrypt hashed password';
COMMENT ON COLUMN users.active IS 'Whether the user account is active and can upload photos';

