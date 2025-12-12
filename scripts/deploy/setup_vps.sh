#!/bin/bash

# CAFE COLOMBIA - VPS Setup Script
# Ubuntu 25.04 Compatible
# Run as ROOT

set -e

echo "🚀 Starting VPS Setup for Cafe Colombia..."

# 1. Update System
echo "📦 Updating system packages..."
apt-get update
# apt-get upgrade -y # Optional: Can be slow, skip for speed if needed, but recommended for security.

# 2. Install Essentials
echo "🛠️ Installing essential tools..."
apt-get install -y curl git unzip ufw nginx build-essential

# 3. Install Node.js (LTS v20)
if ! command -v node &> /dev/null; then
    echo "🟢 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
else
    echo "✅ Node.js is already installed."
fi

# 4. Install PM2 (Process Manager)
if ! command -v pm2 &> /dev/null; then
    echo "📊 Installing PM2..."
    npm install -g pm2
else
    echo "✅ PM2 is already installed."
fi

# 5. Configure Firewall (UFW)
echo "🛡️ Configuring Firewall..."
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
# Arma Reforger Ports (Standard)
ufw allow 20010/udp
ufw allow 20011/udp

# Enable firewall if not active (Check first to avoid locking self out if ssh config is weird)
if ! ufw status | grep -q "Status: active"; then
    echo "y" | ufw enable
fi

# 6. Setup Directory Structure
APP_DIR="/var/www/cafecolombia"
mkdir -p "$APP_DIR"
chown -R $USER:$USER "$APP_DIR" # Adjust permissions if running as non-root user later

# 7. Configure Nginx Reverse Proxy
echo "🌐 Configuring Nginx..."
NGINX_CONF="/etc/nginx/sites-available/cafecolombia"

cat > "$NGINX_CONF" <<EOL
server {
    listen 80;
    server_name _; # Catch-all for IP access. Change to domain later.

    location / {
        proxy_pass http://localhost:3002; # Internal Node App Port
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

# Enable Site
rm -f /etc/nginx/sites-enabled/default # Remove default if it conflicts
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

echo "✅ Server Setup Complete!"
echo "   - Node.js $(node -v)"
echo "   - Nginx Running"
echo "   - Firewall Configured (SSH, HTTP, Arma)"
