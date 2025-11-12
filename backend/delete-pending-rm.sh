#!/bin/bash
# Delete PENDING photos using docker run --rm (temporary container)

# Option 1: If database is on host machine (localhost)
docker run --rm \
  -e PGPASSWORD=changeme \
  postgres:15-alpine \
  psql -h host.docker.internal -p 5432 -U rapidphoto -d blitzphoto \
  -c "DELETE FROM photos WHERE status = 'PENDING';"

# Option 2: If database is in another Docker container (use Docker network)
# docker run --rm \
#   --network container:YOUR_POSTGRES_CONTAINER_NAME \
#   -e PGPASSWORD=changeme \
#   postgres:15-alpine \
#   psql -h localhost -p 5432 -U rapidphoto -d blitzphoto \
#   -c "DELETE FROM photos WHERE status = 'PENDING';"

# Option 3: If using Docker network bridge
# docker run --rm \
#   --network bridge \
#   -e PGPASSWORD=changeme \
#   postgres:15-alpine \
#   psql -h YOUR_DB_HOST_IP -p 5432 -U rapidphoto -d blitzphoto \
#   -c "DELETE FROM photos WHERE status = 'PENDING';"

