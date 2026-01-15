#!/bin/bash
# ============================================
# First Time Setup Script
# ============================================
#
# Script นี้ใช้สำหรับ setup ครั้งแรกบน VPS
# จะทำทุกอย่างให้อัตโนมัติ:
# 1. Generate JWT keys
# 2. สร้าง .env.production
# 3. Start services
# 4. Apply migrations
#
# วิธีใช้:
# ./scripts/first-time-setup.sh
#
# ============================================

set -e

# ==========================================
# Configuration
# ==========================================
APP_DIR=$(pwd)
COMPOSE_FILE="docker-compose.production.yml"

# ==========================================
# Colors
# ==========================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo ""
    echo -e "${CYAN}============================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}============================================${NC}"
    echo ""
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ==========================================
# Check prerequisites
# ==========================================
check_prerequisites() {
    print_header "📋 Checking Prerequisites"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed!"
        echo "Please run: sudo ./scripts/setup-vps.sh"
        exit 1
    fi
    log_success "Docker is installed"
    
    # Check Docker Compose
    if ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed!"
        exit 1
    fi
    log_success "Docker Compose is installed"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed!"
        echo "Please run: sudo ./scripts/setup-vps.sh"
        exit 1
    fi
    log_success "Node.js is installed"
    
    # Check if .env.production exists
    if [ -f ".env.production" ]; then
        log_warning ".env.production already exists!"
        read -p "Overwrite? (yes/no): " OVERWRITE
        if [ "$OVERWRITE" != "yes" ]; then
            log_info "Keeping existing .env.production"
            return 0
        fi
    fi
}

# ==========================================
# Generate keys and create .env.production
# ==========================================
generate_env() {
    print_header "🔐 Generating Production Environment"
    
    # Generate secrets
    log_info "Generating secrets..."
    
    # Generate random strings
    POSTGRES_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)
    JWT_SECRET=$(openssl rand -base64 48 | tr -dc 'a-zA-Z0-9' | head -c 64)
    SECRET_KEY_BASE=$(openssl rand -base64 64)
    
    log_success "Secrets generated"
    
    # Generate JWT tokens using Node.js
    log_info "Generating JWT tokens..."
    
    ANON_KEY=$(node -e "
const crypto = require('crypto');
const header = Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
const payload = Buffer.from(JSON.stringify({role:'anon',iss:'supabase',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+315360000})).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
const signature = crypto.createHmac('sha256','$JWT_SECRET').update(header+'.'+payload).digest('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
console.log(header+'.'+payload+'.'+signature);
")

    SERVICE_ROLE_KEY=$(node -e "
const crypto = require('crypto');
const header = Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
const payload = Buffer.from(JSON.stringify({role:'service_role',iss:'supabase',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+315360000})).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
const signature = crypto.createHmac('sha256','$JWT_SECRET').update(header+'.'+payload).digest('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
console.log(header+'.'+payload+'.'+signature);
")
    
    log_success "JWT tokens generated"
    
    # Get VPS IP
    VPS_IP=$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_VPS_IP")
    
    # Create .env.production
    log_info "Creating .env.production..."
    
    cat > .env.production << EOF
# ============================================
# Production Environment - Auto Generated
# Generated at: $(date)
# ============================================

# Domain Settings
APP_DOMAIN=${VPS_IP}
SUPABASE_DOMAIN=${VPS_IP}
SITE_URL=http://${VPS_IP}
ADDITIONAL_REDIRECT_URLS=http://${VPS_IP}

# Supabase URLs
API_EXTERNAL_URL=http://${VPS_IP}:8000
NEXT_PUBLIC_SUPABASE_URL=http://${VPS_IP}:8000

# SSL (uncomment when you have a domain)
# ACME_EMAIL=your-email@example.com

# Database
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

# JWT
JWT_SECRET=${JWT_SECRET}

# Supabase API Keys
ANON_KEY=${ANON_KEY}
SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}

# Realtime
SECRET_KEY_BASE=${SECRET_KEY_BASE}

# Application
NEXT_PUBLIC_APP_NAME="AI Content Creator"
EOF

    log_success ".env.production created!"
    
    echo ""
    echo "📋 Generated credentials (save these!):"
    echo "============================================"
    echo "POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}"
    echo "JWT_SECRET: ${JWT_SECRET:0:20}..."
    echo "ANON_KEY: ${ANON_KEY:0:50}..."
    echo "SERVICE_ROLE_KEY: ${SERVICE_ROLE_KEY:0:50}..."
    echo "============================================"
    echo ""
}

# ==========================================
# Start services
# ==========================================
start_services() {
    print_header "🚀 Starting Services"
    
    log_info "Starting Docker Compose..."
    
    # Pull images first
    docker compose --env-file .env.production -f $COMPOSE_FILE pull
    
    # Start services
    docker compose --env-file .env.production -f $COMPOSE_FILE up -d
    
    log_success "Services started!"
    
    # Wait for database
    log_info "Waiting for database to be ready..."
    sleep 15
    
    # Check database
    local attempts=0
    while [ $attempts -lt 30 ]; do
        if docker exec supabase-db pg_isready -U postgres > /dev/null 2>&1; then
            log_success "Database is ready!"
            break
        fi
        echo -n "."
        sleep 2
        attempts=$((attempts + 1))
    done
    echo ""
}

# ==========================================
# Apply migrations
# ==========================================
apply_migrations() {
    print_header "🗃️ Applying Migrations"
    
    chmod +x scripts/apply-migrations.sh
    ./scripts/apply-migrations.sh
}

# ==========================================
# Show summary
# ==========================================
show_summary() {
    print_header "✅ Setup Complete!"
    
    # Get VPS IP
    VPS_IP=$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_VPS_IP")
    
    echo ""
    echo "🌐 Your application is now running at:"
    echo ""
    echo "   📱 Web App:       http://${VPS_IP}:3000"
    echo "   🔌 Supabase API:  http://${VPS_IP}:8000"
    echo ""
    echo "============================================"
    echo ""
    echo "📊 Useful Commands:"
    echo ""
    echo "   View logs:        docker compose -f $COMPOSE_FILE logs -f"
    echo "   View status:      docker compose -f $COMPOSE_FILE ps"
    echo "   Restart:          docker compose -f $COMPOSE_FILE restart"
    echo "   Stop:             docker compose -f $COMPOSE_FILE down"
    echo "   Health check:     ./scripts/health-check.sh"
    echo "   Backup:           ./scripts/backup.sh"
    echo ""
    echo "============================================"
    echo ""
    echo "⚠️  Next Steps:"
    echo ""
    echo "   1. Setup GitHub Secrets for auto-deployment"
    echo "   2. (Optional) Configure domain name"
    echo "   3. (Optional) Enable SSL with Let's Encrypt"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed instructions"
    echo ""
}

# ==========================================
# Main
# ==========================================
main() {
    echo ""
    echo "============================================"
    echo "🚀 First Time Production Setup"
    echo "   AI Content Creator"
    echo "============================================"
    echo ""
    
    check_prerequisites
    generate_env
    start_services
    apply_migrations
    show_summary
}

# Run main
main "$@"
