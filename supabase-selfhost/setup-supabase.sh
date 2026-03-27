#!/bin/bash
# ============================================
# 🚀 Supabase Self-Hosted Setup Script
# ============================================
# สำหรับ Ubuntu 22.04 | Domain: supabase.social-generator.vibify.site
# 
# วิธีใช้:
#   chmod +x setup-supabase.sh
#   sudo ./setup-supabase.sh
#
# Script นี้จะ:
# 1. ติดตั้ง Docker & Docker Compose (ถ้ายังไม่มี)
# 2. Clone Supabase Docker repo
# 3. Generate secrets ทั้งหมดอัตโนมัติ
# 4. ตั้งค่า Caddy reverse proxy (auto SSL)
# 5. Start Supabase services
# ============================================

set -euo pipefail

# ==========================================
# Configuration — แก้ไขตรงนี้
# ==========================================
SUPABASE_DOMAIN="supabase.social-generator.vibify.site"
APP_DOMAIN="social-generator.vibify.site"
INSTALL_DIR="/opt/supabase"
DASHBOARD_USERNAME="supabase"
# DASHBOARD_PASSWORD จะ generate อัตโนมัติ หรือตั้งเองตรงนี้:
# DASHBOARD_PASSWORD="YourSecurePasswordHere"

# ==========================================
# Colors
# ==========================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

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
    echo "Usage: sudo ./setup-supabase.sh"
    exit 1
fi

# ==========================================
# Step 1: Install Docker & Docker Compose
# ==========================================
install_docker() {
    log_step "Step 1: Installing Docker & Docker Compose"

    if command -v docker &> /dev/null; then
        log_success "Docker already installed: $(docker --version)"
    else
        log_info "Installing Docker..."
        apt-get update -y
        apt-get install -y ca-certificates curl gnupg lsb-release

        # Add Docker's official GPG key
        install -m 0755 -d /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
        chmod a+r /etc/apt/keyrings/docker.gpg

        # Add the repository
        echo \
          "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
          $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

        apt-get update -y
        apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

        systemctl enable docker
        systemctl start docker
        log_success "Docker installed successfully"
    fi

    # Verify docker compose
    if docker compose version &> /dev/null; then
        log_success "Docker Compose available: $(docker compose version --short)"
    else
        log_error "Docker Compose plugin not found!"
        exit 1
    fi
}

# ==========================================
# Step 2: Install additional tools
# ==========================================
install_dependencies() {
    log_step "Step 2: Installing dependencies"
    apt-get install -y git openssl jq curl
    log_success "Dependencies installed"
}

# ==========================================
# Step 3: Clone & Setup Supabase
# ==========================================
setup_supabase() {
    log_step "Step 3: Setting up Supabase project"

    mkdir -p "$INSTALL_DIR"

    if [ -d "$INSTALL_DIR/supabase-repo" ]; then
        log_info "Updating existing Supabase repo..."
        cd "$INSTALL_DIR/supabase-repo"
        git pull origin master
    else
        log_info "Cloning Supabase repository..."
        git clone --depth 1 https://github.com/supabase/supabase "$INSTALL_DIR/supabase-repo"
    fi

    # Copy docker files to project directory
    if [ ! -f "$INSTALL_DIR/docker-compose.yml" ]; then
        log_info "Copying Docker files..."
        cp -rf "$INSTALL_DIR/supabase-repo/docker/"* "$INSTALL_DIR/"
        cp "$INSTALL_DIR/supabase-repo/docker/.env.example" "$INSTALL_DIR/.env"
        log_success "Docker files copied"
    else
        log_warn "docker-compose.yml already exists, skipping copy (ใช้ backup ถ้าต้องการ reset)"
    fi

    cd "$INSTALL_DIR"
}

# ==========================================
# Step 4: Generate all secrets
# ==========================================
generate_secrets() {
    log_step "Step 4: Generating secrets"

    # Generate all secrets
    POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32)
    JWT_SECRET=$(openssl rand -base64 48 | tr -dc 'a-zA-Z0-9' | head -c 64)
    SECRET_KEY_BASE=$(openssl rand -base64 48)
    VAULT_ENC_KEY=$(openssl rand -hex 16)
    PG_META_CRYPTO_KEY=$(openssl rand -base64 24)
    LOGFLARE_PUBLIC_TOKEN=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)
    LOGFLARE_PRIVATE_TOKEN=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)
    S3_ACCESS_KEY_ID=$(openssl rand -hex 16)
    S3_ACCESS_KEY_SECRET=$(openssl rand -hex 32)
    MINIO_ROOT_PASSWORD=$(openssl rand -hex 16)

    # Generate Dashboard password if not set
    if [ -z "${DASHBOARD_PASSWORD:-}" ]; then
        DASHBOARD_PASSWORD=$(openssl rand -base64 16 | tr -dc 'a-zA-Z0-9' | head -c 20)
    fi

    log_success "All base secrets generated"

    # Generate JWT tokens (ANON_KEY and SERVICE_ROLE_KEY)
    generate_jwt_keys
}

# ==========================================
# Generate JWT keys using openssl
# ==========================================
generate_jwt_keys() {
    log_info "Generating JWT ANON_KEY and SERVICE_ROLE_KEY..."

    # Current timestamp
    local IAT=$(date +%s)
    # 5 years from now
    local EXP=$(( IAT + 157680000 ))

    # ANON KEY payload
    local ANON_PAYLOAD=$(echo -n "{\"role\":\"anon\",\"iss\":\"supabase\",\"iat\":${IAT},\"exp\":${EXP}}" | base64 | tr '+/' '-_' | tr -d '=')
    local HEADER=$(echo -n '{"alg":"HS256","typ":"JWT"}' | base64 | tr '+/' '-_' | tr -d '=')
    local ANON_SIGNATURE=$(echo -n "${HEADER}.${ANON_PAYLOAD}" | openssl dgst -sha256 -hmac "$JWT_SECRET" -binary | base64 | tr '+/' '-_' | tr -d '=')
    ANON_KEY="${HEADER}.${ANON_PAYLOAD}.${ANON_SIGNATURE}"

    # SERVICE_ROLE KEY payload
    local SERVICE_PAYLOAD=$(echo -n "{\"role\":\"service_role\",\"iss\":\"supabase\",\"iat\":${IAT},\"exp\":${EXP}}" | base64 | tr '+/' '-_' | tr -d '=')
    local SERVICE_SIGNATURE=$(echo -n "${HEADER}.${SERVICE_PAYLOAD}" | openssl dgst -sha256 -hmac "$JWT_SECRET" -binary | base64 | tr '+/' '-_' | tr -d '=')
    SERVICE_ROLE_KEY="${HEADER}.${SERVICE_PAYLOAD}.${SERVICE_SIGNATURE}"

    log_success "JWT keys generated"
}

# ==========================================
# Step 5: Configure .env
# ==========================================
configure_env() {
    log_step "Step 5: Configuring .env"

    cd "$INSTALL_DIR"

    # Backup original .env
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

    # Update .env with sed
    sed -i "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${POSTGRES_PASSWORD}|" .env
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|" .env
    sed -i "s|ANON_KEY=.*|ANON_KEY=${ANON_KEY}|" .env
    sed -i "s|SERVICE_ROLE_KEY=.*|SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}|" .env
    sed -i "s|DASHBOARD_USERNAME=.*|DASHBOARD_USERNAME=${DASHBOARD_USERNAME}|" .env
    sed -i "s|DASHBOARD_PASSWORD=.*|DASHBOARD_PASSWORD=${DASHBOARD_PASSWORD}|" .env

    # Secret keys
    sed -i "s|SECRET_KEY_BASE=.*|SECRET_KEY_BASE=${SECRET_KEY_BASE}|" .env
    sed -i "s|VAULT_ENC_KEY=.*|VAULT_ENC_KEY=${VAULT_ENC_KEY}|" .env
    sed -i "s|PG_META_CRYPTO_KEY=.*|PG_META_CRYPTO_KEY=${PG_META_CRYPTO_KEY}|" .env
    sed -i "s|LOGFLARE_PUBLIC_ACCESS_TOKEN=.*|LOGFLARE_PUBLIC_ACCESS_TOKEN=${LOGFLARE_PUBLIC_TOKEN}|" .env
    sed -i "s|LOGFLARE_PRIVATE_ACCESS_TOKEN=.*|LOGFLARE_PRIVATE_ACCESS_TOKEN=${LOGFLARE_PRIVATE_TOKEN}|" .env
    sed -i "s|S3_PROTOCOL_ACCESS_KEY_ID=.*|S3_PROTOCOL_ACCESS_KEY_ID=${S3_ACCESS_KEY_ID}|" .env
    sed -i "s|S3_PROTOCOL_ACCESS_KEY_SECRET=.*|S3_PROTOCOL_ACCESS_KEY_SECRET=${S3_ACCESS_KEY_SECRET}|" .env
    sed -i "s|MINIO_ROOT_PASSWORD=.*|MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}|" .env

    # URLs — ใช้ HTTPS ผ่าน Caddy reverse proxy
    sed -i "s|SUPABASE_PUBLIC_URL=.*|SUPABASE_PUBLIC_URL=https://${SUPABASE_DOMAIN}|" .env
    sed -i "s|API_EXTERNAL_URL=.*|API_EXTERNAL_URL=https://${SUPABASE_DOMAIN}|" .env
    sed -i "s|SITE_URL=.*|SITE_URL=https://${APP_DOMAIN}|" .env

    log_success ".env configured with all secrets"
}

# ==========================================
# Step 6: Setup Caddy reverse proxy
# ==========================================
setup_caddy() {
    log_step "Step 6: Setting up Caddy reverse proxy (auto SSL)"

    # Install Caddy
    if command -v caddy &> /dev/null; then
        log_success "Caddy already installed: $(caddy version)"
    else
        log_info "Installing Caddy..."
        apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
        curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
        curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
        apt-get update -y
        apt-get install -y caddy
        log_success "Caddy installed"
    fi

    # Create Caddyfile
    cat > /etc/caddy/Caddyfile << EOF
# ============================================
# Supabase Reverse Proxy
# ============================================
# Caddy จัดการ SSL certificate อัตโนมัติ
# ไม่ต้องทำอะไรเพิ่ม แค่ชี้ DNS ไปที่ VPS IP

${SUPABASE_DOMAIN} {
    # Proxy ไปยัง Kong API Gateway (port 8000)
    reverse_proxy localhost:8000
}
EOF

    # Restart Caddy
    systemctl enable caddy
    systemctl restart caddy

    log_success "Caddy configured for ${SUPABASE_DOMAIN}"
    log_info "⚡ SSL certificate จะถูก provision อัตโนมัติเมื่อ DNS ชี้มาที่ server นี้"
}

# ==========================================
# Step 7: Pull & Start Supabase
# ==========================================
start_supabase() {
    log_step "Step 7: Starting Supabase"

    cd "$INSTALL_DIR"

    log_info "Pulling Docker images (อาจใช้เวลาสักครู่)..."
    docker compose pull

    log_info "Starting services..."
    docker compose up -d

    log_info "Waiting for services to be healthy..."
    sleep 30

    docker compose ps

    log_success "Supabase services started!"
}

# ==========================================
# Step 8: Save credentials & Summary
# ==========================================
save_credentials() {
    log_step "Step 8: Saving credentials"

    local CREDS_FILE="$INSTALL_DIR/.credentials"

    cat > "$CREDS_FILE" << EOF
# ============================================
# 🔐 Supabase Self-Hosted Credentials
# ============================================
# Generated: $(date)
# ⚠️  เก็บไฟล์นี้ให้ปลอดภัย! ห้ามแชร์!
# ============================================

# Supabase Dashboard
DASHBOARD_URL=https://${SUPABASE_DOMAIN}
DASHBOARD_USERNAME=${DASHBOARD_USERNAME}
DASHBOARD_PASSWORD=${DASHBOARD_PASSWORD}

# API Keys (ใช้ในแอป Next.js)
SUPABASE_URL=https://${SUPABASE_DOMAIN}
SUPABASE_ANON_KEY=${ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}

# Database
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
DATABASE_URL=postgresql://postgres.your-tenant-id:${POSTGRES_PASSWORD}@localhost:5432/postgres

# JWT
JWT_SECRET=${JWT_SECRET}

# ============================================
# สำหรับ Next.js .env (copy ไปใช้ได้เลย):
# ============================================
# NEXT_PUBLIC_SUPABASE_URL=https://${SUPABASE_DOMAIN}
# NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}
# SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}
EOF

    chmod 600 "$CREDS_FILE"
    log_success "Credentials saved to ${CREDS_FILE}"
}

# ==========================================
# Step 9: Configure Firewall
# ==========================================
setup_firewall() {
    log_step "Step 9: Configuring Firewall"

    if command -v ufw &> /dev/null; then
        ufw allow 22/tcp    comment 'SSH'
        ufw allow 80/tcp    comment 'HTTP (Caddy)'
        ufw allow 443/tcp   comment 'HTTPS (Caddy)'
        # ไม่เปิด port 8000 โดยตรง ให้ผ่าน Caddy เท่านั้น
        ufw --force enable
        log_success "Firewall configured (ports: 22, 80, 443)"
    else
        log_warn "ufw not found, skipping firewall setup"
        log_warn "กรุณาตั้งค่า firewall เอง: เปิด port 22, 80, 443 เท่านั้น"
    fi
}

# ==========================================
# Print Summary
# ==========================================
print_summary() {
    echo ""
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}  ✅ Supabase Self-Hosted Setup Complete!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo ""
    echo -e "  ${CYAN}🌐 Dashboard:${NC}  https://${SUPABASE_DOMAIN}"
    echo -e "  ${CYAN}👤 Username:${NC}   ${DASHBOARD_USERNAME}"
    echo -e "  ${CYAN}🔑 Password:${NC}   ${DASHBOARD_PASSWORD}"
    echo ""
    echo -e "  ${CYAN}🔗 API URL:${NC}    https://${SUPABASE_DOMAIN}"
    echo ""
    echo -e "  ${YELLOW}📝 Next Steps:${NC}"
    echo -e "  1. ชี้ DNS record: ${SUPABASE_DOMAIN} → VPS IP"
    echo -e "  2. รอ SSL certificate provision (~1-2 นาที)"
    echo -e "  3. เปิด https://${SUPABASE_DOMAIN} ล็อกอิน"
    echo -e "  4. อัพเดท .env ของ Next.js app"
    echo ""
    echo -e "  ${YELLOW}📄 Credentials:${NC} ${INSTALL_DIR}/.credentials"
    echo -e "  ${YELLOW}📂 Install Dir:${NC} ${INSTALL_DIR}"
    echo ""
    echo -e "${GREEN}============================================${NC}"
}

# ==========================================
# Main
# ==========================================
main() {
    echo ""
    echo -e "${CYAN}============================================${NC}"
    echo -e "${CYAN}  🚀 Supabase Self-Hosted Installer${NC}"
    echo -e "${CYAN}  Domain: ${SUPABASE_DOMAIN}${NC}"
    echo -e "${CYAN}  OS: Ubuntu 22.04${NC}"
    echo -e "${CYAN}============================================${NC}"
    echo ""

    install_docker
    install_dependencies
    setup_supabase
    generate_secrets
    configure_env
    setup_caddy
    setup_firewall
    start_supabase
    save_credentials
    print_summary
}

main "$@"
