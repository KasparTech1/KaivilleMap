# KaivilleMap - DGX Spark Deployment Guide

This guide covers deploying KaivilleMap on an NVIDIA DGX Spark system via SSH.

## Prerequisites

### On the DGX Spark
- Docker and Docker Compose installed
- Git installed
- Network access to reach Supabase (external database)
- Port 3001 (or your chosen port) accessible from your network

### Verify Docker is available:
```bash
docker --version
docker compose version
```

## Quick Deployment

### 1. Clone the Repository

SSH into your DGX Spark and clone the repo:

```bash
ssh user@dgx-spark-ip
cd ~
git clone https://github.com/your-org/KaivilleMap.git
cd KaivilleMap
```

### 2. Create Environment File

Create a `.env` file with your credentials:

```bash
cat > .env << 'EOF'
# KaivilleMap Environment Variables for DGX Spark
NODE_ENV=production
PORT=3000

# Host port (external access port)
HOST_PORT=3001

# Supabase Configuration
SUPABASE_URL=https://yvbtqcmiuymyvtvaqgcf.supabase.co
SUPABASE_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_PROJECT_ID=yvbtqcmiuymyvtvaqgcf

# Build-time variables for Vite (client-side - these get baked into the build)
VITE_SUPABASE_URL=https://yvbtqcmiuymyvtvaqgcf.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
EOF
```

> ⚠️ **Security Note**: Never commit `.env` files with real credentials to git!

### 3. Deploy

Using the deployment script:

```bash
chmod +x scripts/deploy-dgx.sh
./scripts/deploy-dgx.sh deploy
```

Or manually:

```bash
docker compose -f docker-compose.dgx.yml build
docker compose -f docker-compose.dgx.yml up -d
```

### 4. Verify Deployment

```bash
# Check container status
docker compose -f docker-compose.dgx.yml ps

# Check logs
docker compose -f docker-compose.dgx.yml logs -f

# Test health endpoint
curl http://localhost:3001/api/health
```

## Accessing the Application

### From the DGX Spark itself:
```
http://localhost:3001
```

### From your local machine (via SSH tunnel):
```bash
# Create SSH tunnel
ssh -L 3001:localhost:3001 user@dgx-spark-ip

# Then access in browser:
http://localhost:3001
```

### From other machines on the network:
```
http://dgx-spark-ip:3001
```

> **Note**: Replace `dgx-spark-ip` with the actual IP address of your DGX Spark.

## Management Commands

The deployment script (`scripts/deploy-dgx.sh`) provides several commands:

| Command | Description |
|---------|-------------|
| `./scripts/deploy-dgx.sh build` | Build the Docker image |
| `./scripts/deploy-dgx.sh start` | Start the container |
| `./scripts/deploy-dgx.sh stop` | Stop the container |
| `./scripts/deploy-dgx.sh restart` | Restart the container |
| `./scripts/deploy-dgx.sh logs` | View container logs |
| `./scripts/deploy-dgx.sh status` | Check container status |
| `./scripts/deploy-dgx.sh shell` | Open shell in container |
| `./scripts/deploy-dgx.sh deploy` | Full deployment (build + start) |

## Updating the Application

To update to the latest version:

```bash
cd ~/KaivilleMap
git pull origin main
./scripts/deploy-dgx.sh deploy
```

## Exposing to the Internet (Optional)

If you need external access beyond your local network:

### Option 1: Reverse Proxy with Nginx

Install nginx on the DGX Spark and configure:

```nginx
# /etc/nginx/sites-available/kaivillemap
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: Cloudflare Tunnel

For secure external access without opening ports:

```bash
# Install cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared

# Authenticate and create tunnel
cloudflared tunnel login
cloudflared tunnel create kaivillemap
cloudflared tunnel route dns kaivillemap your-subdomain.your-domain.com

# Run tunnel
cloudflared tunnel run --url http://localhost:3001 kaivillemap
```

### Option 3: ngrok (Quick Testing)

```bash
ngrok http 3001
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker compose -f docker-compose.dgx.yml logs

# Check if port is in use
sudo lsof -i :3001
```

### Build fails
```bash
# Clear Docker cache and rebuild
docker compose -f docker-compose.dgx.yml build --no-cache
```

### Can't connect from network
```bash
# Check firewall
sudo ufw status
sudo ufw allow 3001/tcp  # If using UFW

# Or with iptables
sudo iptables -A INPUT -p tcp --dport 3001 -j ACCEPT
```

### Health check failing
```bash
# Check if app is responding
docker exec kaivillemap curl -s http://localhost:3000/api/health

# Check container health
docker inspect kaivillemap | grep -A 10 Health
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    DGX Spark                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Docker Container                      │  │
│  │  ┌─────────────┐    ┌────────────────────────┐   │  │
│  │  │   React     │    │    Express Server      │   │  │
│  │  │  Frontend   │◄──►│    (Node.js API)       │   │  │
│  │  │  (Static)   │    │                        │   │  │
│  │  └─────────────┘    └──────────┬─────────────┘   │  │
│  │                                 │                  │  │
│  └─────────────────────────────────┼─────────────────┘  │
│                                    │                     │
│              Port 3001 ◄───────────┘                     │
└────────────────────────────────────┼─────────────────────┘
                                     │
                                     ▼
                          ┌─────────────────────┐
                          │     Supabase        │
                          │  (External Cloud)   │
                          │    Database         │
                          └─────────────────────┘
```

## Security Considerations

1. **Don't expose directly to internet** without a reverse proxy with TLS
2. **Use SSH tunnels** for personal access
3. **Keep secrets in `.env`** file (not in git)
4. **Regular updates**: Pull latest code and rebuild periodically
5. **Container runs as non-root** user for security

## Resource Usage

The container is configured with these limits (adjustable in `docker-compose.dgx.yml`):

- **CPU**: 2 cores (limit), 0.5 cores (reserved)
- **Memory**: 2GB (limit), 512MB (reserved)

These are conservative defaults. DGX Spark has plenty of resources, so you can increase these if needed.
