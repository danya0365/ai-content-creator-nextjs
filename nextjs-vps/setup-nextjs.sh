#!/bin/bash
# ============================================
# 🚀 Next.js App Setup Script (Clean VPS Mode)
# ============================================
# สำหรับ Ubuntu 22.04 | Domain: social-generator.vibify.site
# 
# วิธีใช้:
#   chmod +x setup-nextjs.sh
#   sudo ./setup-nextjs.sh
# ============================================

set -euo pipefail

# ==========================================
# Configuration
# ==========================================
APP_DOMAIN="social-generator.vibify.site"
INSTALL_DIR="/opt/nextjs-ai-creator"

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
# Step 1: Install Docker
# ==========================================
install_docker() {
    log_step "Step 1: Installing Docker"
    if command -v docker &> /dev/null; then
        log_success "Docker already installed"
    else
        apt-get update -y
        apt-get install -y ca-certificates curl gnupg lsb-release
        mkdir -p /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
        apt-get update -y
        apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
        log_success "Docker installed"
    fi
}

# ==========================================
# Step 2: Install Caddy
# ==========================================
install_caddy() {
    log_step "Step 2: Installing Caddy"
    if command -v caddy &> /dev/null; then
        log_success "Caddy already installed"
    else
        apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
        curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
        curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
        apt-get update -y
        apt-get install -y caddy
        log_success "Caddy installed"
    fi
}

# ==========================================
# Step 3: Setup App
# ==========================================
setup_app() {
    log_step "Step 3: Setting up app and environment"
    
    CRON_SECRET=$(openssl rand -base64 32 | tr -d '\n')
    
    if [ ! -f ".env.production" ]; then
        cp .env.example .env.production || touch .env.production
        echo "CRON_SECRET=$CRON_SECRET" >> .env.production
        log_success ".env.production created"
    fi
    
    cd nextjs-vps
    docker compose build
    docker compose up -d
    cd ..
}

# ==========================================
# Step 4: Caddy Config
# ==========================================
setup_caddy() {
    log_step "Step 4: Configuring Caddy"
    cat > /etc/caddy/Caddyfile << EOF
${APP_DOMAIN} {
    reverse_proxy localhost:3000
}
EOF
    systemctl restart caddy
    log_success "Caddy configured"
}

# ==========================================
# Step 5: Cron Setup
# ==========================================
setup_cron() {
    log_step "Step 5: Setting up Cron Job"
    CRON_SECRET=$(grep CRON_SECRET .env.production | cut -d '=' -f2)
    CRON_LINE="* * * * * curl -s -H \"x-cron-secret: $CRON_SECRET\" http://localhost:3000/api/cron/run >/dev/null 2>&1"
    (crontab -l 2>/dev/null | grep -v "api/cron/run"; echo "$CRON_LINE") | crontab -
    log_success "Cron job added"
}

# ==========================================
# Main
# ==========================================
main() {
    install_docker
    install_caddy
    setup_app
    setup_caddy
    setup_cron
    
    echo -e "\n${GREEN}✅ Setup Complete (Clean VPS Mode)${NC}"
    echo -e "🔗 URL: https://${APP_DOMAIN}"
}

main "$@"
