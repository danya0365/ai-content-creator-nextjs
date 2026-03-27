#!/bin/bash
# ============================================
# 🚀 Supabase Self-Hosted Setup Script (Existing VPS Mode)
# ============================================
# สำหรับเครื่องที่มี Nginx และ Docker อยู่แล้ว
# 
# วิธีใช้:
#   chmod +x setup-supabase-vps-existing.sh
#   sudo ./setup-supabase-vps-existing.sh
# ============================================

set -euo pipefail

# ==========================================
# Configuration
# ==========================================
SUPABASE_DOMAIN="supabase.social-generator.vibify.site"
INSTALL_DIR="/opt/supabase"
DASHBOARD_USERNAME="supabase"

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

if ! command -v nginx &> /dev/null; then
    log_error "ไม่พบ Nginx ในระบบ กรุณาติดตั้ง Nginx ก่อนรันสคริปต์นี้"
    exit 1
fi

# ==========================================
# Step 1: Install dependencies
# ==========================================
install_dependencies() {
    log_step "Step 1: Installing dependencies"
    apt-get update -y && apt-get install -y git openssl jq curl
    log_success "Dependencies installed"
}

# ==========================================
# Step 2: Clone & Setup Supabase
# ==========================================
setup_supabase() {
    log_step "Step 2: Setting up Supabase project"

    mkdir -p "$INSTALL_DIR"

    if [ -d "$INSTALL_DIR/supabase-repo" ]; then
        log_info "Updating existing Supabase repo..."
        cd "$INSTALL_DIR/supabase-repo"
        git pull origin master
    else
        log_info "Cloning Supabase repository..."
        git clone --depth 1 https://github.com/supabase/supabase "$INSTALL_DIR/supabase-repo"
    fi

    if [ ! -f "$INSTALL_DIR/docker-compose.yml" ]; then
        log_info "Copying Docker files..."
        cp -rf "$INSTALL_DIR/supabase-repo/docker/"* "$INSTALL_DIR/"
        cp "$INSTALL_DIR/supabase-repo/docker/.env.example" "$INSTALL_DIR/.env"
        log_success "Docker files copied"
    fi

    cd "$INSTALL_DIR"
}

# ==========================================
# Step 3: Generate all secrets
# ==========================================
generate_secrets() {
    log_step "Step 3: Generating secrets"

    POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
    JWT_SECRET=$(openssl rand -base64 48 | tr -dc 'a-zA-Z0-9' | head -c 64)
    SECRET_KEY_BASE=$(openssl rand -base64 48 | tr -d '\n')
    VAULT_ENC_KEY=$(openssl rand -hex 16)
    PG_META_CRYPTO_KEY=$(openssl rand -base64 24 | tr -d '\n')
    LOGFLARE_PUBLIC_TOKEN=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)
    LOGFLARE_PRIVATE_TOKEN=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)
    S3_ACCESS_KEY_ID=$(openssl rand -hex 16)
    S3_ACCESS_KEY_SECRET=$(openssl rand -hex 32)
    MINIO_ROOT_PASSWORD=$(openssl rand -hex 16)
    DASHBOARD_PASSWORD=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | head -c 20)

    # Generate JWT keys
    local IAT=$(date +%s)
    local EXP=$(( IAT + 157680000 ))
    local HEADER=$(echo -n '{"alg":"HS256","typ":"JWT"}' | base64 | tr -d '\n' | tr '+/' '-_' | tr -d '=')
    
    local ANON_PAYLOAD=$(echo -n "{\"role\":\"anon\",\"iss\":\"supabase\",\"iat\":${IAT},\"exp\":${EXP}}" | base64 | tr -d '\n' | tr '+/' '-_' | tr -d '=')
    local ANON_SIGNATURE=$(echo -n "${HEADER}.${ANON_PAYLOAD}" | openssl dgst -sha256 -hmac "$JWT_SECRET" -binary | base64 | tr -d '\n' | tr '+/' '-_' | tr -d '=')
    ANON_KEY="${HEADER}.${ANON_PAYLOAD}.${ANON_SIGNATURE}"

    local SERVICE_PAYLOAD=$(echo -n "{\"role\":\"service_role\",\"iss\":\"supabase\",\"iat\":${IAT},\"exp\":${EXP}}" | base64 | tr -d '\n' | tr '+/' '-_' | tr -d '=')
    local SERVICE_SIGNATURE=$(echo -n "${HEADER}.${SERVICE_PAYLOAD}" | openssl dgst -sha256 -hmac "$JWT_SECRET" -binary | base64 | tr -d '\n' | tr '+/' '-_' | tr -d '=')
    SERVICE_ROLE_KEY="${HEADER}.${SERVICE_PAYLOAD}.${SERVICE_SIGNATURE}"

    log_success "All secrets generated"
}

# ==========================================
# Step 4: Configure .env
# ==========================================
configure_env() {
    log_step "Step 4: Configuring .env"

    sed -i "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${POSTGRES_PASSWORD}|" .env
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|" .env
    sed -i "s|ANON_KEY=.*|ANON_KEY=${ANON_KEY}|" .env
    sed -i "s|SERVICE_ROLE_KEY=.*|SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}|" .env
    sed -i "s|DASHBOARD_USERNAME=.*|DASHBOARD_USERNAME=${DASHBOARD_USERNAME}|" .env
    sed -i "s|DASHBOARD_PASSWORD=.*|DASHBOARD_PASSWORD=${DASHBOARD_PASSWORD}|" .env
    sed -i "s|SECRET_KEY_BASE=.*|SECRET_KEY_BASE=${SECRET_KEY_BASE}|" .env
    sed -i "s|VAULT_ENC_KEY=.*|VAULT_ENC_KEY=${VAULT_ENC_KEY}|" .env
    sed -i "s|PG_META_CRYPTO_KEY=.*|PG_META_CRYPTO_KEY=${PG_META_CRYPTO_KEY}|" .env
    sed -i "s|SUPABASE_PUBLIC_URL=.*|SUPABASE_PUBLIC_URL=https://${SUPABASE_DOMAIN}|" .env
    sed -i "s|API_EXTERNAL_URL=.*|API_EXTERNAL_URL=https://${SUPABASE_DOMAIN}|" .env

    log_success ".env configured"
}

# ==========================================
# Step 5: Setup Nginx Config
# ==========================================
setup_nginx() {
    log_step "Step 5: Setting up Nginx config"

    cat > /etc/nginx/sites-available/supabase << EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${SUPABASE_DOMAIN};

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    ln -sf /etc/nginx/sites-available/supabase /etc/nginx/sites-enabled/
    nginx -t && systemctl reload nginx
    log_success "Nginx configured for ${SUPABASE_DOMAIN}"
}

# ==========================================
# Step 6: Start Supabase
# ==========================================
start_supabase() {
    log_step "Step 6: Starting Supabase"
    cd "$INSTALL_DIR"
    docker compose pull
    docker compose up -d
    log_success "Supabase services started!"
}

# ==========================================
# Step 7: Save credentials
# ==========================================
save_credentials() {
    local CREDS_FILE="$INSTALL_DIR/.credentials"
    cat > "$CREDS_FILE" << EOF
# Supabase Self-Hosted Credentials
DASHBOARD_URL=https://${SUPABASE_DOMAIN}
DASHBOARD_USERNAME=${DASHBOARD_USERNAME}
DASHBOARD_PASSWORD=${DASHBOARD_PASSWORD}
SUPABASE_URL=https://${SUPABASE_DOMAIN}
SUPABASE_ANON_KEY=${ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
EOF
    chmod 600 "$CREDS_FILE"
    log_success "Credentials saved to ${CREDS_FILE}"
}

# ==========================================
# Main
# ==========================================
main() {
    install_dependencies
    setup_supabase
    generate_secrets
    configure_env
    setup_nginx
    start_supabase
    save_credentials
    
    echo -e "\n${GREEN}============================================${NC}"
    echo -e "${GREEN}  ✅ Setup Complete (Existing VPS Mode)${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo -e "1. คอนฟิก Nginx เรียบร้อยแล้ว (Port 80)"
    echo -e "2. ${YELLOW}ต้องรัน Certbot เพื่อทำ SSL:${NC}"
    echo -e "   sudo certbot --nginx -d ${SUPABASE_DOMAIN}"
    echo -e "3. ตรวจสอบ Credentials ได้ที่: ${INSTALL_DIR}/.credentials"
    echo -e "${GREEN}============================================${NC}"
}

main "$@"
