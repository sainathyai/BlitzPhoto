# VPN/Firewall Solutions for PostgreSQL Connection

## Problem Diagnosed

Port **5432** (PostgreSQL) is being blocked by your network/VPN/firewall, while other ports (like 26257) work fine.

## Solutions

### Option 1: Use SSH Tunnel (Recommended)

Create an SSH tunnel through a bastion host or EC2 instance:

```powershell
# Install SSH client if needed
# Then create tunnel:
ssh -L 5432:sainathyai-db-dev.czgui6kw4z1d.us-west-2.rds.amazonaws.com:5432 user@your-bastion-host.com -N

# In another terminal, connect to localhost:5432
# Update .env:
DB_HOST=localhost
DB_PORT=5432
```

### Option 2: Use AWS Systems Manager Session Manager

If you have an EC2 instance in the same VPC:

```powershell
# Port forward through Session Manager
aws ssm start-session --target i-1234567890abcdef0 --document-name AWS-StartPortForwardingSession --parameters '{"portNumber":["5432"],"localPortNumber":["5432"]}'
```

### Option 3: Request Network Admin to Whitelist Port 5432

Contact your network administrator to:
- Whitelist outbound port 5432
- Add exception for AWS RDS endpoints
- Configure VPN to allow PostgreSQL connections

### Option 4: Use AWS RDS Proxy (If Available)

RDS Proxy can help with connection management and might work through different network paths.

### Option 5: Change RDS Port (If Possible)

If you can modify the RDS instance, change it to a non-standard port that's not blocked:

```bash
# In AWS Console or Terraform, change RDS port from 5432 to something like 5433
# Then update .env:
DB_PORT=5433
```

## Quick Test

To verify if it's specifically port 5432:

```powershell
# Test different ports
Test-NetConnection -ComputerName sainathyai-db-dev.czgui6kw4z1d.us-west-2.rds.amazonaws.com -Port 5432
Test-NetConnection -ComputerName sainathyai-db-dev.czgui6kw4z1d.us-west-2.rds.amazonaws.com -Port 5433
Test-NetConnection -ComputerName sainathyai-db-dev.czgui6kw4z1d.us-west-2.rds.amazonaws.com -Port 3306
```

## Temporary Workaround

If you have access to an EC2 instance in the same VPC, you can:
1. Deploy the backend on EC2 (where it can connect directly)
2. Or use port forwarding through EC2

## Next Steps

1. Check with your network/VPN administrator about port 5432
2. Set up SSH tunnel if you have a bastion host
3. Consider deploying backend to EC2/ECS where it can connect directly to RDS



