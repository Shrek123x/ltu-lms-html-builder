# Quick AWS Deployment Guide (15 Minutes)

## Fastest Method: AWS EC2 with Docker

### Step 1: Launch EC2 Instance (5 min)

1. Go to AWS Console → EC2
2. Click **"Launch Instance"**
3. Choose:
   - **Name:** `ltu-lms-app`
   - **AMI:** Amazon Linux 2023
   - **Instance type:** t2.micro (free tier)
   - **Key pair:** Create new or use existing
   - **Security group:** Allow ports 22 (SSH), 80 (HTTP), 3000 (app)
4. Click **"Launch Instance"**

### Step 2: Connect to EC2 (2 min)

```bash
# Use EC2 Instance Connect (browser-based) or SSH:
ssh -i your-key.pem ec2-user@<your-ec2-public-ip>
```

### Step 3: Install Docker on EC2 (3 min)

```bash
# Update packages
sudo yum update -y

# Install Docker
sudo yum install docker -y

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -a -G docker ec2-user

# Log out and back in, or run:
newgrp docker
```

### Step 4: Deploy Your App (5 min)

**Method A: Using Docker Hub**

```bash
# 1. On your local machine, push to Docker Hub
docker tag ltu-lms-html-builder:latest yourusername/ltu-lms-html-builder:latest
docker push yourusername/ltu-lms-html-builder:latest

# 2. On EC2, pull and run
docker pull yourusername/ltu-lms-html-builder:latest
docker run -d -p 3000:3000 --name ltu-app \
  -e DATABASE_URL="file:/app/data/dev.db" \
  yourusername/ltu-lms-html-builder:latest
```

**Method B: Build on EC2**

```bash
# 1. Install git
sudo yum install git -y

# 2. Clone your repository
git clone <your-repo-url>
cd ltu-lms-html-builder

# 3. Build and run
docker build -t ltu-lms-html-builder .
docker run -d -p 3000:3000 --name ltu-app \
  -e DATABASE_URL="file:/app/data/dev.db" \
  ltu-lms-html-builder
```

### Step 5: Access Your App

Open browser and go to:
```
http://<your-ec2-public-ip>:3000
```

Find your EC2 public IP in AWS Console → EC2 → Instances

---

## Add Custom Domain (Optional)

### Using Route 53:

1. **Register domain** in Route 53 (or use existing)
2. **Create hosted zone**
3. **Add A record** pointing to EC2 public IP
4. Access via: `http://yourapp.com:3000`

### Using Nginx Reverse Proxy (Remove :3000 from URL):

```bash
# Install nginx
sudo yum install nginx -y

# Configure nginx
sudo nano /etc/nginx/nginx.conf
```

Add this server block:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Start nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

Now access at: `http://your-domain.com` (no port needed!)

---

## Production Database (RDS PostgreSQL)

### Step 1: Create RDS Instance

1. AWS Console → RDS → Create database
2. Choose:
   - **Engine:** PostgreSQL 15
   - **Template:** Free tier
   - **DB instance identifier:** ltu-lms-db
   - **Master username:** postgres
   - **Master password:** (save this!)
   - **Public access:** Yes (for testing)
3. Create database

### Step 2: Update Connection String

```bash
# Stop current container
docker stop ltu-app
docker rm ltu-app

# Run with RDS connection
docker run -d -p 3000:3000 --name ltu-app \
  -e DATABASE_URL="postgresql://postgres:yourpassword@your-rds-endpoint.rds.amazonaws.com:5432/ltudb" \
  yourusername/ltu-lms-html-builder:latest
```

### Step 3: Run Migrations

```bash
# Exec into container
docker exec -it ltu-app sh

# Run Prisma migrations
npx prisma migrate deploy

# Exit container
exit
```

---

## Deploy Lambda Function (HTML Generator)

### Step 1: Prepare Lambda Package

```bash
# On your local machine
cd lambda
zip -r lambda-function.zip index.js package.json node_modules/
```

### Step 2: Create Lambda Function

1. AWS Console → Lambda → Create function
2. Choose:
   - **Function name:** ltu-html-generator
   - **Runtime:** Node.js 20.x
   - **Architecture:** x86_64
3. Upload `lambda-function.zip`
4. Set handler to: `index.handler`

### Step 3: Test Lambda

Use this test event:

```json
{
  "messages": [
    {
      "id": 1,
      "text": "Test message",
      "from": "user",
      "level": "info",
      "timestamp": "2025-10-16T00:00:00.000Z",
      "resolved": false
    }
  ],
  "theme": "light"
}
```

### Step 4: Create API Gateway (Optional)

1. Create REST API
2. Add POST method
3. Integrate with Lambda
4. Deploy API
5. Get invoke URL: `https://xxxxxxx.execute-api.us-east-1.amazonaws.com/prod/generate`

---

## Monitoring & Logs

### View Docker Logs:
```bash
docker logs ltu-app -f
```

### View EC2 Metrics:
AWS Console → EC2 → Monitoring

### Set Up CloudWatch:
```bash
# Install CloudWatch agent on EC2
sudo yum install amazon-cloudwatch-agent -y
```

---

## Cost Estimate (Monthly)

- **EC2 t2.micro:** FREE (first 12 months) or ~$8.50/month
- **RDS db.t3.micro:** FREE (first 12 months) or ~$15/month
- **Lambda:** First 1M requests FREE, then $0.20 per 1M
- **Data transfer:** 1GB outbound FREE/month

**Total:** $0 with free tier, ~$25/month after

---

## Troubleshooting

### Container won't start:
```bash
docker logs ltu-app
docker inspect ltu-app
```

### Port 3000 not accessible:
- Check EC2 Security Group allows port 3000
- Check EC2 public IP is correct
- Verify container is running: `docker ps`

### Database connection fails:
- Check RDS security group allows EC2 IP
- Verify DATABASE_URL is correct
- Test connection: `docker exec -it ltu-app npx prisma db push`

---

## Next Steps

✅ **Assignment Complete!** You now have:
- ✅ Dockerized application
- ✅ Cloud deployment guide
- ✅ Database integration
- ✅ API endpoints
- ✅ Lambda function
- ✅ Tests passing

**For submission:**
1. Take screenshots of running EC2 instance
2. Capture API responses
3. Show CloudWatch logs
4. Document the deployment URL
