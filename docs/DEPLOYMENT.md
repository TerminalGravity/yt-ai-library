# Deployment Guide

Complete guide for deploying the YouTube AI Library to production environments.

## Table of Contents

- [Production Requirements](#production-requirements)
- [Environment Setup](#environment-setup)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Security Considerations](#security-considerations)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup and Recovery](#backup-and-recovery)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## Production Requirements

### System Requirements

**Minimum Hardware:**
- CPU: 2 cores
- RAM: 4 GB
- Storage: 20 GB SSD
- Network: 100 Mbps

**Recommended Hardware:**
- CPU: 4 cores
- RAM: 8 GB
- Storage: 100 GB SSD
- Network: 1 Gbps

### Software Dependencies

- Docker 20.10+
- Docker Compose 2.0+
- SSL Certificate (Let's Encrypt recommended)
- Domain name with DNS configuration

### External Services

- OpenAI API account with sufficient credits
- PostgreSQL 16+ with pgvector extension
- (Optional) YouTube Data API v3 key
- (Optional) CDN for static assets

## Environment Setup

### Production Environment Variables

Create a production `.env` file:

```env
# Environment
ENVIRONMENT=production
DEBUG=false

# Database
DATABASE_URL=postgresql://username:password@db-host:5432/youtube_library

# OpenAI
OPENAI_API_KEY=sk-your-production-key
OPENAI_MODEL=o3-mini

# Security
SECRET_KEY=your-super-secret-production-key-minimum-32-characters
JWT_SECRET_KEY=another-secret-key-for-jwt-if-implemented

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Application
MAX_CONCURRENT_INGESTIONS=3
CHUNK_SIZE=1000
CHUNK_OVERLAP=200

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/youtube-ai-library/app.log

# Rate Limiting (if implemented)
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_MINUTE=60

# Email (if notifications are implemented)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Frontend Environment Variables

Create a production `.env.production` file:

```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
```

## Docker Deployment

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: youtube_library
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d youtube_library"]
      interval: 30s
      timeout: 10s
      retries: 3

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/youtube_library
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ENVIRONMENT=production
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./logs:/var/log/youtube-ai-library
    ports:
      - "8000:8000"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
      args:
        - REACT_APP_API_URL=https://api.yourdomain.com
    ports:
      - "3000:80"
    restart: unless-stopped
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

### Production Dockerfiles

**Backend Dockerfile (`backend/Dockerfile.prod`):**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
USER app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Run application
CMD ["gunicorn", "main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

**Frontend Dockerfile (`frontend/Dockerfile.prod`):**

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build arguments
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

Create `nginx/nginx.conf`:

```nginx
upstream backend {
    server backend:8000;
}

upstream frontend {
    server frontend:80;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# Main application server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # API routes
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts for long-running requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 300s;
    }

    # Health check
    location /health {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend application
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://frontend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Cloud Deployment

### AWS Deployment

#### Using EC2 with Docker

1. **Launch EC2 instance:**
   - Amazon Linux 2 or Ubuntu 20.04 LTS
   - t3.medium or larger
   - Security group allowing ports 80, 443, 22

2. **Install Docker:**
```bash
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

3. **Deploy application:**
```bash
git clone <your-repo>
cd yt-ai-library
cp .env.example .env
# Edit .env with production values
docker-compose -f docker-compose.prod.yml up -d
```

#### Using ECS (Elastic Container Service)

1. **Create ECS cluster**
2. **Build and push images to ECR**
3. **Create task definitions**
4. **Set up Application Load Balancer**
5. **Configure auto-scaling**

### Google Cloud Platform

#### Using Compute Engine

Similar to AWS EC2 setup with Google Cloud specific networking and security configurations.

#### Using Cloud Run

For serverless deployment of individual services.

### Digital Ocean

#### Using App Platform

1. Connect your GitHub repository
2. Configure build and run commands
3. Set environment variables
4. Deploy with automatic HTTPS

## Security Considerations

### Environment Security

1. **Secrets Management:**
   - Use Docker secrets or external secret management
   - Never commit secrets to version control
   - Rotate API keys regularly

2. **Database Security:**
   - Use strong passwords
   - Enable SSL connections
   - Restrict network access
   - Regular security updates

3. **Application Security:**
   - Input validation and sanitization
   - SQL injection prevention (SQLAlchemy ORM)
   - CORS configuration
   - Rate limiting implementation

### Network Security

1. **Firewall Configuration:**
   - Allow only necessary ports (80, 443, 22)
   - Restrict SSH access to specific IPs
   - Use VPC/subnet isolation

2. **SSL/TLS Configuration:**
   - Use Let's Encrypt for free SSL certificates
   - Implement HSTS headers
   - Configure strong cipher suites

### Access Control

1. **Authentication (Future):**
   - Implement JWT-based authentication
   - Multi-factor authentication
   - Session management

2. **Authorization (Future):**
   - Role-based access control
   - API key management
   - Resource-level permissions

## Monitoring and Logging

### Application Monitoring

1. **Health Checks:**
   - Database connectivity
   - External API availability
   - Memory and CPU usage
   - Disk space monitoring

2. **Metrics Collection:**
   - Request rate and latency
   - Error rates
   - Ingestion progress
   - User activity

### Logging Configuration

```python
# backend/app/logging_config.py
import logging
import logging.handlers
import os

def setup_logging():
    log_level = os.getenv('LOG_LEVEL', 'INFO')
    log_file = os.getenv('LOG_FILE', '/var/log/youtube-ai-library/app.log')
    
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # File handler with rotation
    file_handler = logging.handlers.RotatingFileHandler(
        log_file,
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    file_handler.setFormatter(formatter)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    
    # Configure root logger
    logging.basicConfig(
        level=getattr(logging, log_level),
        handlers=[file_handler, console_handler]
    )
```

### Log Aggregation

1. **ELK Stack (Elasticsearch, Logstash, Kibana):**
   - Centralized log collection
   - Real-time search and analysis
   - Custom dashboards

2. **Cloud Solutions:**
   - AWS CloudWatch
   - Google Cloud Logging
   - Azure Monitor

## Backup and Recovery

### Database Backup

1. **Automated Backups:**
```bash
#!/bin/bash
# backup-script.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="youtube_library"

# Create backup
docker exec postgres pg_dump -U admin $DB_NAME > "$BACKUP_DIR/backup_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/backup_$DATE.sql"

# Remove backups older than 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

# Upload to cloud storage (optional)
aws s3 cp "$BACKUP_DIR/backup_$DATE.sql.gz" s3://your-backup-bucket/
```

2. **Backup Schedule:**
```bash
# Add to crontab
0 2 * * * /path/to/backup-script.sh
```

### Recovery Procedures

1. **Database Recovery:**
```bash
# Stop application
docker-compose stop backend

# Restore database
gunzip -c backup_20240101_020000.sql.gz | docker exec -i postgres psql -U admin -d youtube_library

# Restart application
docker-compose start backend
```

2. **Disaster Recovery:**
   - Document recovery procedures
   - Test recovery regularly
   - Maintain infrastructure as code
   - Use multiple availability zones

## Performance Optimization

### Database Optimization

1. **Indexing:**
```sql
-- Create performance indexes
CREATE INDEX CONCURRENTLY idx_video_embeddings_embedding ON video_embeddings USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX CONCURRENTLY idx_videos_channel_ingested ON videos(channel_id, is_ingested);
CREATE INDEX CONCURRENTLY idx_channels_active ON channels(is_active) WHERE is_active = true;
```

2. **Connection Pooling:**
```python
# backend/app/database.py
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True
)
```

### Application Optimization

1. **Caching:**
   - Redis for session storage
   - Application-level caching
   - CDN for static assets

2. **Async Processing:**
   - Celery for background tasks
   - Message queues (Redis/RabbitMQ)
   - Horizontal scaling

### Infrastructure Optimization

1. **Load Balancing:**
   - Multiple backend instances
   - Health check configuration
   - Session affinity if needed

2. **Auto-scaling:**
   - CPU/memory-based scaling
   - Predictive scaling
   - Cost optimization

## Troubleshooting

### Common Issues

1. **Database Connection Errors:**
   - Check database container status
   - Verify connection string
   - Check network connectivity

2. **Memory Issues:**
   - Monitor embedding storage size
   - Implement cleanup procedures
   - Optimize chunk size

3. **API Timeouts:**
   - Increase timeout values
   - Implement request queuing
   - Add circuit breakers

### Debug Commands

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Database debugging
docker exec -it postgres psql -U admin -d youtube_library
\dt  # List tables
\di  # List indexes

# Performance monitoring
docker stats
docker exec backend top
```

### Maintenance Tasks

1. **Regular Updates:**
   - Security patches
   - Dependency updates
   - Database maintenance

2. **Cleanup Tasks:**
   - Log rotation
   - Temporary file cleanup
   - Unused embedding removal

3. **Monitoring:**
   - Disk space usage
   - Memory consumption
   - API response times

---

This deployment guide provides a comprehensive foundation for production deployment. Adjust configurations based on your specific requirements and infrastructure constraints.