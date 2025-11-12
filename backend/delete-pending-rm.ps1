# PowerShell: Delete PENDING photos using docker run --rm (temporary container)

# Option 1: If database is on host machine (localhost) - Windows/Mac
docker run --rm `
  -e PGPASSWORD=changeme `
  postgres:15-alpine `
  psql -h host.docker.internal -p 5432 -U rapidphoto -d blitzphoto `
  -c "DELETE FROM photos WHERE status = 'PENDING';"

# Option 2: If database is accessible via localhost (Linux or if host.docker.internal doesn't work)
# docker run --rm `
#   --network host `
#   -e PGPASSWORD=changeme `
#   postgres:15-alpine `
#   psql -h localhost -p 5432 -U rapidphoto -d blitzphoto `
#   -c "DELETE FROM photos WHERE status = 'PENDING';"

# Option 3: If database is in another Docker container
# First, find your postgres container name:
# docker ps --filter "ancestor=postgres" --format "{{.Names}}"
# Then use:
# docker run --rm `
#   --network container:YOUR_POSTGRES_CONTAINER_NAME `
#   -e PGPASSWORD=changeme `
#   postgres:15-alpine `
#   psql -h localhost -p 5432 -U rapidphoto -d blitzphoto `
#   -c "DELETE FROM photos WHERE status = 'PENDING';"

