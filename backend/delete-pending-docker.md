# Delete PENDING Upload Photos using Docker

## Quick Command

If you have a PostgreSQL container named `postgres`:

```powershell
# Delete all PENDING photos
docker exec -i postgres psql -U rapidphoto -d blitzphoto -c "DELETE FROM photos WHERE status = 'PENDING';"
```

## If your container has a different name:

```powershell
# List all containers to find your PostgreSQL container
docker ps -a

# Replace 'YOUR_CONTAINER_NAME' with the actual container name
docker exec -i YOUR_CONTAINER_NAME psql -U rapidphoto -d blitzphoto -c "DELETE FROM photos WHERE status = 'PENDING';"
```

## Complete cleanup (with confirmation):

```powershell
# 1. Check what will be deleted
docker exec -i postgres psql -U rapidphoto -d blitzphoto -c "SELECT COUNT(*) as pending_count FROM photos WHERE status = 'PENDING';"

# 2. Delete PENDING photos
docker exec -i postgres psql -U rapidphoto -d blitzphoto -c "DELETE FROM photos WHERE status = 'PENDING';"

# 3. Verify deletion
docker exec -i postgres psql -U rapidphoto -d blitzphoto -c "SELECT status, COUNT(*) as count FROM photos GROUP BY status;"
```

## If connecting to remote database:

```powershell
# Using psql directly (if installed)
psql -h localhost -p 5432 -U rapidphoto -d blitzphoto -c "DELETE FROM photos WHERE status = 'PENDING';"
```

## One-liner to start container and delete:

```powershell
# Start container if not running, then delete
docker start postgres; docker exec -i postgres psql -U rapidphoto -d blitzphoto -c "DELETE FROM photos WHERE status = 'PENDING';"
```

