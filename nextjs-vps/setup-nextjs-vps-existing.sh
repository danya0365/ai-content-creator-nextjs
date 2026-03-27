#!/bin/bash
# ============================================
# 🚀 Next.js App Setup Script (Existing VPS Mode)
# ============================================
# สำหรับเครื่องที่มี Nginx และ Docker อยู่แล้ว
# 
# วิธีใช้:
#   chmod +x setup-nextjs-vps-existing.sh
#   sudo ./setup-nextjs-vps-existing.sh
# ============================================

set -euo pipefail

# ==========================================
# Configuration
# ==========================================
APP_DOMAIN="social-generator.vibify.site"
INSTALL_DIR="/opt/nextjs-ai-creator"
PROJECT_ROOT="$(pwd)" # สมมติว่ารันจาก root ของโปรเจค

# ==========================================
# Colors
# ==========================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warn()    { echo -e "${YELLOW}[⚠]${NC} $1"; }
log_error()   { echo -e "${RED}[✗]${NC} $1"; }
log_step()    { echo -e "\n${CYAN}============================================${NC}"; echo -e "${CYAN}  $1${NC}"; echo -e "${CYAN}============================================${NC}"; }

# ==========================================
# Pre-flight checks
# ==========================================
if [ "$EUID" -ne 0 ]; then
    log_error "กรุณารัน script ด้วย sudo"
    exit 1
fi

# ==========================================
# Step 1: Prepare Environment
# ==========================================
setup_env() {
    log_step "Step 1: Setting up environment"
    
    # Generate CRON_SECRET if not exists
    CRON_SECRET=$(openssl rand -base64 32 | tr -d '\n')
    
    if [ ! -f ".env.production" ]; then
        log_info "Creating .env.production from .env.example..."
        if [ -f ".env.example" ]; then
            cp .env.example .env.production
        else
            touch .env.production
        fi
        
        # Add CRON_SECRET
        echo "CRON_SECRET=$CRON_SECRET" >> .env.production
        log_success ".env.production created"
    else
        log_warn ".env.production already exists, skipping creation"
        CRON_SECRET=$(grep CRON_SECRET .env.production | cut -d '=' -f2)
    fi
}

# ==========================================
# Step 2: Build & Start App
# ==========================================
start_app() {
    log_step "Step 2: Building and starting Next.js app"
    
    # Run from the nextjs-vps directory to find docker-compose.yml
    cd nextjs-vps
    docker compose build
    docker compose up -d
    log_success "Next.js app started on port 3000"
    cd ..
}

# ==========================================
# Step 3: Setup Nginx
# ==========================================
setup_nginx() {
    log_step "Step 3: Setting up Nginx config"

    cat > /etc/nginx/sites-available/nextjs-ai << EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${APP_DOMAIN};

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket support (ถ้า Next.js ใช้)
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

    ln -sf /etc/nginx/sites-available/nextjs-ai /etc/nginx/sites-enabled/
    nginx -t && systemctl reload nginx
    log_success "Nginx configured for ${APP_DOMAIN}"
}

# ==========================================
# Step 4: Setup Cron Job
# ==========================================
setup_cron() {
    log_step "Step 4: Setting up Cron Job"
    
    CRON_LINE="* * * * * curl -s -H \"x-cron-secret: $CRON_SECRET\" http://localhost:3000/api/cron/run >/dev/null 2>&1"
    
    # Check if already exists in crontab
    if crontab -l 2>/dev/null | grep -q "api/cron/run"; then
        log_warn "Cron job already exists, updating..."
        (crontab -l | grep -v "api/cron/run"; echo "$CRON_LINE") | crontab -
    else
        log_info "Adding new cron job..."
        (crontab -l 2>/dev/null; echo "$CRON_LINE") | crontab -
    fi
    
    log_success "Cron job added to run every minute"
}

# ==========================================
# Main
# ==========================================
main() {
    setup_env
    start_app
    setup_nginx
    setup_cron
    
    echo -e "\n${GREEN}============================================${NC}"
    echo -e "${GREEN}  ✅ Next.js App Setup Complete!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo -e "1. แอดมิน Domain: https://${APP_DOMAIN}"
    echo -e "2. ${YELLOW}รัน Certbot เพื่อทำ SSL:${NC}"
    echo -e "   sudo certbot --nginx -d ${APP_DOMAIN}"
    echo -e "3. Cron Secret: ${CRON_SECRET}"
    echo -e "${GREEN}============================================${NC}"
}

main "$@"
