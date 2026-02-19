# Mariposa CRE - Ubuntu Server Deployment Guide

## Prerequisites

- Ubuntu 22.04+ server
- Domain name (optional, for SSL)
- MongoDB Atlas account or self-hosted MongoDB
- SMTP credentials for email (OTP login)

---

## 1. System Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node -v   # v20.x
npm -v    # 10.x

# Install Redis
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
redis-cli ping  # Should return PONG

# Install Bun (required for CRE workflow compilation)
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
bun --version  # Should be >= 1.2.21

# Install CRE CLI
curl -L -o /tmp/cre_linux_amd64.tar.gz \
  https://github.com/smartcontractkit/cre-cli/releases/download/v1.0.11/cre_linux_amd64.tar.gz
tar -xzf /tmp/cre_linux_amd64.tar.gz -C /tmp
sudo mv /tmp/cre_v1.0.11_linux_amd64 /usr/local/bin/cre
sudo chmod +x /usr/local/bin/cre
cre --version

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install -y nginx
sudo systemctl enable nginx
```

> **Note:** If `cre` gives a glibc error, download the alternate build:
> `cre_linux_amd64_ldd2-35.tar.gz` from the same release page.

---

## 2. Upload Project

```bash
# Option A: Git clone
cd /opt
sudo mkdir mariposa && sudo chown $USER:$USER mariposa
git clone <your-repo-url> /opt/mariposa

# Option B: SCP from local machine
scp -r ./backend ./frontend user@your-server:/opt/mariposa/
```

---

## 3. Backend Setup

### 3.1 Install dependencies

```bash
cd /opt/mariposa/backend
npm install
```

### 3.2 Configure environment

```bash
cp .env.example .env   # or create from scratch
nano .env
```

Set these values in `.env`:

```env
# Server
PORT=5000
NODE_ENV=production

# MongoDB (use your connection string)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mariposa?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-strong-random-secret-here
JWT_EXPIRE=7d

# Frontend URL (used for CORS)
FRONTEND_URL=http://your-domain.com

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Email (SMTP for OTP login)
EMAIL_HOST=mail.privateemail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-email-password
EMAIL_FROM=Mariposa <your-email@domain.com>

# CRE Configuration
CRE_PROJECTS_DIR=./cre-projects
BUN_PATH=bun
CRE_CLI_PATH=cre
SOLC_VERSION=0.8.19
DEFAULT_TESTNET_RPC=https://ethereum-sepolia-rpc.publicnode.com
```

### 3.3 Build

```bash
npm run build
```

### 3.4 Create CRE projects directory

```bash
mkdir -p /opt/mariposa/backend/cre-projects
```

### 3.5 Test run

```bash
npm start
# Should show: Server running in production mode on port 5000
# Press Ctrl+C to stop
```

---

## 4. Frontend Setup

### 4.1 Install dependencies

```bash
cd /opt/mariposa/frontend
npm install
```

### 4.2 Configure environment

```bash
nano .env.local
```

Set these values:

```env
NEXT_PUBLIC_API_URL=http://your-domain.com/api
NEXT_PUBLIC_WS_URL=http://your-domain.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
```

> **With SSL (recommended):** Replace `http://` with `https://` in both URLs above.

### 4.3 Build

```bash
npm run build
```

### 4.4 Test run

```bash
npm start
# Should show: Ready on http://localhost:3000
# Press Ctrl+C to stop
```

---

## 5. PM2 Process Management

### 5.1 Create ecosystem config

```bash
cat > /opt/mariposa/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'mariposa-backend',
      cwd: '/opt/mariposa/backend',
      script: 'dist/server.js',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G',
    },
    {
      name: 'mariposa-frontend',
      cwd: '/opt/mariposa/frontend',
      script: 'node_modules/.bin/next',
      args: 'start',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '1G',
    },
  ],
};
EOF
```

### 5.2 Start services

```bash
cd /opt/mariposa
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow the printed command to enable on boot
```

### 5.3 Useful PM2 commands

```bash
pm2 status              # Check running processes
pm2 logs                # View all logs
pm2 logs mariposa-backend   # Backend logs only
pm2 restart all         # Restart everything
pm2 reload all          # Zero-downtime reload
```

---

## 6. Nginx Reverse Proxy

### 6.1 Create config

```bash
sudo nano /etc/nginx/sites-available/mariposa
```

Paste this config (replace `your-domain.com` with your actual domain or server IP):

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend (Next.js on port 3000)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API (Express on port 5000)
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket (Socket.io on port 5000)
    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 6.2 Enable and test

```bash
sudo ln -s /etc/nginx/sites-available/mariposa /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
sudo nginx -t   # Test config
sudo systemctl reload nginx
```

---

## 7. SSL with Let's Encrypt (Optional)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
# Follow the prompts, certbot auto-configures nginx

# Auto-renewal is set up automatically. Test with:
sudo certbot renew --dry-run
```

After SSL is enabled, update your environment files:

```bash
# Backend .env
FRONTEND_URL=https://your-domain.com

# Frontend .env.local
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXT_PUBLIC_WS_URL=https://your-domain.com
```

Then restart:

```bash
cd /opt/mariposa && pm2 restart all
```

---

## 8. Firewall

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## 9. Quick Reference

| Service        | Port  | URL                              |
|----------------|-------|----------------------------------|
| Frontend       | 3000  | http://localhost:3000             |
| Backend API    | 5000  | http://localhost:5000/api         |
| WebSocket      | 5000  | ws://localhost:5000/socket.io     |
| MongoDB        | 27017 | (or MongoDB Atlas cloud)         |
| Redis          | 6379  | localhost:6379                   |

### Health Check

```bash
curl http://localhost:5000/api/health
# Expected: {"success":true,"message":"Server is running"}
```

### Update Deployment

```bash
cd /opt/mariposa
git pull origin main

# Backend
cd backend && npm install && npm run build && cd ..

# Frontend
cd frontend && npm install && npm run build && cd ..

pm2 restart all
```
