#!/bin/bash
# ============================================
# Deployment Script
# ============================================
#
# Script นี้ถูกเรียกโดย GitHub Actions
# เพื่อ deploy code ใหม่ไปยัง VPS
#
# วิธีใช้:
# ./scripts/deploy.sh
#
# ============================================

set -e  # หยุดทันทีถ้าเกิด error

# ==========================================
# Configuration
# ==========================================
APP_DIR="/opt/app/ai-content-creator-nextjs"
COMPOSE_FILE="docker-compose.production.yml"
BRANCH="release"

# ==========================================
# Colors
# ==========================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ==========================================
# Helper Functions
# ==========================================
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
# Main Deployment
# ==========================================
main() {
    echo ""
    echo "============================================"
    echo "🚀 Starting Deployment"
    echo "============================================"
    echo ""
    
    # ==========================================
    # Step 1: Change to app directory
    # ==========================================
    log_info "Changing to app directory..."
    cd $APP_DIR || {
        log_error "Directory $APP_DIR not found!"
        exit 1
    }
    log_success "Changed to $APP_DIR"
    
    # ==========================================
    # Step 2: Pull latest code
    # ==========================================
    log_info "Pulling latest code from $BRANCH branch..."
    git fetch origin $BRANCH
    git reset --hard origin/$BRANCH
    log_success "Code updated"
    
    # ==========================================
    # Step 3: Pull latest Docker images
    # ==========================================
    log_info "Pulling latest Docker images..."
    docker compose --env-file .env.production -f $COMPOSE_FILE pull || log_warning "Some images may not need updating"
    log_success "Docker images updated"
    
    # ==========================================
    # Step 4: Build and restart services
    # ==========================================
    log_info "Building and restarting services..."
    
    # Restart all services to ensure environment changes are picked up
    docker compose --env-file .env.production -f $COMPOSE_FILE up -d --build --remove-orphans
    
    log_success "Services restarted"
    
    # ==========================================
    # Step 5: Apply Database Migrations
    # ==========================================
    log_info "Applying database migrations..."
    
    # Wait for database to be ready
    sleep 5
    
    # Make migration script executable
    chmod +x scripts/apply-migrations.sh
    
    # Run migrations
    if ./scripts/apply-migrations.sh; then
        log_success "Migrations applied successfully"
    else
        log_warning "Some migrations may have failed, check logs"
    fi
    
    # ==========================================
    # Step 6: Cleanup
    # ==========================================
    log_info "Cleaning up old images..."
    docker image prune -f
    log_success "Cleanup complete"
    
    # ==========================================
    # Step 7: Health Check
    # ==========================================
    log_info "Running health check..."
    sleep 10  # Wait for services to start
    
    # Check if Next.js is responding
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
        log_success "Next.js app is healthy"
    else
        log_warning "Next.js app may still be starting..."
    fi
    
    # ==========================================
    # Step 8: Show status
    # ==========================================
    log_info "Container status:"
    docker compose --env-file .env.production -f $COMPOSE_FILE ps
    
    echo ""
    echo "============================================"
    echo "✅ Deployment Complete!"
    echo "============================================"
    echo ""
    echo "📊 Quick Commands:"
    echo "   View logs:    docker compose -f $COMPOSE_FILE logs -f"
    echo "   Restart all:  docker compose -f $COMPOSE_FILE restart"
    echo "   Stop all:     docker compose -f $COMPOSE_FILE down"
    echo ""
}

# Run main function
main "$@"
