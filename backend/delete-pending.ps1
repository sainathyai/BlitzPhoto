# Delete PENDING photos using docker run --rm with local postgres:15-alpine image

Write-Host "Deleting PENDING photos from database..." -ForegroundColor Yellow

# Try Option 1: host.docker.internal (Windows/Mac Docker Desktop)
docker run --rm `
  -e PGPASSWORD=changeme `
  postgres:15-alpine `
  psql -h host.docker.internal -p 5432 -U rapidphoto -d blitzphoto `
  -c "DELETE FROM photos WHERE status = 'PENDING';"

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nConnection via host.docker.internal failed. Trying localhost..." -ForegroundColor Yellow
    
    # Option 2: Try with --network host (Linux) or direct connection
    docker run --rm `
      --add-host=host.docker.internal:host-gateway `
      -e PGPASSWORD=changeme `
      postgres:15-alpine `
      psql -h host.docker.internal -p 5432 -U rapidphoto -d blitzphoto `
      -c "DELETE FROM photos WHERE status = 'PENDING';"
}

Write-Host "`nDone! Check the output above for results." -ForegroundColor Green

