# 🚀 Infrastructure Quick Start Card

## ⚡ 3 Commands to Get Running

```bash
# 1. Verify AWS access
./verify-aws-access.sh

# 2. Set database password
cd terraform
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars  # Change db_password

# 3. Provision everything
cd ..
./setup-aws.sh
```

**Done! Wait 15 minutes for infrastructure to be ready.**

---

## 📋 Quick Checklist

- [ ] AWS CLI configured: `aws sts get-caller-identity`
- [ ] Password changed in `terraform.tfvars`
- [ ] Run `./verify-aws-access.sh` (all green ✅)
- [ ] Run `./setup-aws.sh`
- [ ] Save outputs: `terraform output > outputs.txt`
- [ ] Test RDS: `psql -h <endpoint> -U rapidphoto_admin -d rapidphoto`
- [ ] Configure backend `.env` with outputs
- [ ] Start backend: `cd ../backend && ./mvnw spring-boot:run`

---

## 💰 Cost: ~$20-25/month (dev)

## 🎯 Resources Created: 28

- VPC with subnets
- RDS PostgreSQL
- 2 S3 buckets  
- SQS queues
- IAM roles
- CloudWatch logs

---

## 📞 Need Help?

- **Full guide:** [READY_TO_PROVISION.md](READY_TO_PROVISION.md)
- **Review:** [INFRASTRUCTURE_REVIEW.md](INFRASTRUCTURE_REVIEW.md)
- **Credentials:** [AWS_CREDENTIALS_SETUP.md](AWS_CREDENTIALS_SETUP.md)

---

## 🐛 Quick Troubleshooting

**Credentials fail?**
```bash
aws configure
```

**Terraform fails?**
```bash
rm -rf .terraform
terraform init
```

**Can't connect to RDS?**
Add your IP to security group in AWS Console

---

**You're ready! Go! 🚀**

