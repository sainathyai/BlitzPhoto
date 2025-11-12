#!/bin/bash
# Bash script to run PostgreSQL container and cleanup stuck uploads

# Database connection details
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="blitzphoto"
DB_USER="rapidphoto"
DB_PASSWORD="changeme"

echo "=== BlitzPhoto - Cleanup Stuck Uploads ==="
echo ""

# Check if PostgreSQL container is running
echo "Checking for PostgreSQL container..."
CONTAINER=$(docker ps --filter "name=postgres" --format "{{.Names}}" | head -n 1)

if [ -z "$CONTAINER" ]; then
    echo "PostgreSQL container not found. Starting container..."
    
    # Try to start existing container
    docker start postgres 2>/dev/null
    
    if [ $? -ne 0 ]; then
        echo "No existing container found. Creating new PostgreSQL container..."
        docker run -d \
            --name postgres \
            -e POSTGRES_USER=$DB_USER \
            -e POSTGRES_PASSWORD=$DB_PASSWORD \
            -e POSTGRES_DB=$DB_NAME \
            -p ${DB_PORT}:5432 \
            postgres:15-alpine
        
        echo "Waiting for PostgreSQL to start..."
        sleep 5
    fi
else
    echo "PostgreSQL container '$CONTAINER' is running."
fi

echo ""
echo "=== Checking stuck uploads ==="

# Check stuck uploads
CHECK_QUERY="SELECT 
    uj.id as upload_job_id,
    uj.user_id,
    uj.status as job_status,
    COUNT(p.id) as total_photos,
    COUNT(CASE WHEN p.status = 'PENDING' THEN 1 END) as pending_photos
FROM upload_jobs uj
LEFT JOIN photos p ON p.upload_job_id = uj.id
WHERE p.status = 'PENDING' OR uj.status = 'IN_PROGRESS'
GROUP BY uj.id, uj.user_id, uj.status;"

echo "Stuck uploads:"
docker exec -i postgres psql -U $DB_USER -d $DB_NAME -c "$CHECK_QUERY"

echo ""
echo "=== Deleting stuck PENDING photos ==="

# Delete stuck PENDING photos
DELETE_QUERY="DELETE FROM photos WHERE status = 'PENDING';"

read -p "Are you sure you want to delete ALL PENDING photos? (yes/no): " confirm
if [ "$confirm" = "yes" ]; then
    docker exec -i postgres psql -U $DB_USER -d $DB_NAME -c "$DELETE_QUERY"
    echo "Deleted stuck PENDING photos."
    
    # Update upload job statuses
    echo ""
    echo "=== Updating upload job statuses ==="
    UPDATE_QUERY="UPDATE upload_jobs 
SET status = 'FAILED',
    updated_at = CURRENT_TIMESTAMP
WHERE id IN (
    SELECT uj.id 
    FROM upload_jobs uj
    LEFT JOIN photos p ON p.upload_job_id = uj.id AND p.status != 'PENDING'
    GROUP BY uj.id
    HAVING COUNT(p.id) = 0
);"
    docker exec -i postgres psql -U $DB_USER -d $DB_NAME -c "$UPDATE_QUERY"
    echo "Updated upload job statuses."
else
    echo "Cancelled. No photos deleted."
fi

echo ""
echo "=== Cleanup complete ==="
echo "You can now restart your backend server."

