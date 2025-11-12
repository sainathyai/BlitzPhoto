# 📋 Prerequisites Setup Guide

## Current Status

Based on system check:
- ✅ **Node.js 24.11.0** - Installed
- ❌ **Java 21** - Not installed
- ❌ **Maven 3.8+** - Not installed
- ❌ **PostgreSQL 17.6** - Not installed
- ❌ **Docker** - Not installed

## Installation Steps

### 1. Install Java 21

**Option A: Using Chocolatey (Recommended for Windows)**
```powershell
# Install Chocolatey if not installed
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Java 21
choco install openjdk21 -y
```

**Option B: Manual Installation**
1. Download Java 21 from: https://adoptium.net/
2. Install and set JAVA_HOME environment variable
3. Add Java to PATH

**Verify:**
```powershell
java -version
```

### 2. Install Maven

**Option A: Using Chocolatey**
```powershell
choco install maven -y
```

**Option B: Manual Installation**
1. Download Maven from: https://maven.apache.org/download.cgi
2. Extract and set MAVEN_HOME
3. Add Maven to PATH

**Verify:**
```powershell
mvn -version
```

### 3. Install PostgreSQL

**Option A: Using Chocolatey**
```powershell
choco install postgresql17 -y
```

**Option B: Manual Installation**
1. Download PostgreSQL 17.6 from: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set

**Option C: Use Docker (Easier)**
```powershell
# Install Docker Desktop from: https://www.docker.com/products/docker-desktop
# Then use docker-compose.yml provided
```

**Verify:**
```powershell
psql --version
```

### 4. Install Docker (Optional but Recommended)

1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop
2. Install and start Docker Desktop
3. Verify:
```powershell
docker --version
docker-compose --version
```

## Quick Setup Script

After installing prerequisites, run:

```powershell
# 1. Start PostgreSQL (if using Docker)
docker-compose up -d postgres

# 2. Set up backend
cd backend
# Create .env file with database credentials
mvn clean install
mvn spring-boot:run

# 3. Set up web frontend (in new terminal)
cd web
npm install
npm run dev
```

## Alternative: Use Cloud Services

If you prefer not to install locally:

1. **Use AWS RDS** for PostgreSQL (already provisioned via Terraform)
2. **Use AWS S3** for storage (already provisioned)
3. **Use AWS SQS** for queues (already provisioned)

Just update `backend/.env` with AWS credentials.

## Next Steps

Once prerequisites are installed:

1. See `LOCAL_SETUP.md` for detailed setup instructions
2. See `LOCAL_TESTING.md` for testing guide
3. Start with backend, then web frontend

---

**Need help?** Check the troubleshooting section in `LOCAL_SETUP.md`

