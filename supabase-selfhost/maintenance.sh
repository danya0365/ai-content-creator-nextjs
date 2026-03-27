#!/bin/bash
# ============================================
# 🔧 Supabase Self-Hosted Maintenance Script
# ============================================
# วิธีใช้:
#   sudo ./maintenance.sh <command>
#
# Commands:
#   status    — แสดงสถานะ services
#   restart   — restart ทุก services
#   stop      — stop ทุก services
#   start     — start ทุก services
#   logs      — ดู logs (ระบุ service name ได้)
#   backup    — backup database
#   restore   — restore database จาก backup file
#   update    — อัพเดท Supabase images
#   creds     — แสดง credentials
# ============================================

set -euo pipefail

INSTALL_DIR="/opt/supabase"
BACKUP_DIR="/opt/supabase-backups"

# Colors
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

# ==========================================
# Status
# ==========================================
cmd_status() {
    log_info "Supabase Services Status:"
    echo ""
    cd "$INSTALL_DIR"
    docker compose ps
    echo ""

    # Show disk usage
    log_info "Disk Usage:"
    echo "  Docker volumes: $(docker system df --format '{{.Size}}' 2>/dev/null | head -1)"
    echo "  Install dir:    $(du -sh $INSTALL_DIR 2>/dev/null | cut -f1)"
    if [ -d "$BACKUP_DIR" ]; then
        echo "  Backups:        $(du -sh $BACKUP_DIR 2>/dev/null | cut -f1)"
    fi
}

# ==========================================
# Restart
# ==========================================
cmd_restart() {
    log_info "Restarting all Supabase services..."
    cd "$INSTALL_DIR"
    docker compose down
    docker compose up -d
    sleep 10
    log_success "Services restarted"
    docker compose ps
}

# ==========================================
# Stop
# ==========================================
cmd_stop() {
    log_info "Stopping all Supabase services..."
    cd "$INSTALL_DIR"
    docker compose down
    log_success "All services stopped"
}

# ==========================================
# Start
# ==========================================
cmd_start() {
    log_info "Starting all Supabase services..."
    cd "$INSTALL_DIR"
    docker compose up -d
    sleep 10
    log_success "Services started"
    docker compose ps
}

# ==========================================
# Logs
# ==========================================
cmd_logs() {
    local service="${1:-}"
    cd "$INSTALL_DIR"

    if [ -z "$service" ]; then
        echo ""
        log_info "Available services:"
        docker compose ps --format '{{.Name}}' | sed 's/^/  - /'
        echo ""
        log_info "Usage: ./maintenance.sh logs <service_name>"
        log_info "หรือดู logs ทั้งหมด: ./maintenance.sh logs all"
        echo ""
        read -p "ดู logs ของ service ไหน? (หรือ 'all'): " service
    fi

    if [ "$service" = "all" ]; then
        docker compose logs --tail=100 -f
    else
        docker compose logs --tail=100 -f "$service"
    fi
}

# ==========================================
# Backup Database
# ==========================================
cmd_backup() {
    log_info "Starting database backup..."

    mkdir -p "$BACKUP_DIR"

    # Load postgres password from .env
    source "$INSTALL_DIR/.env"
    local TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    local BACKUP_FILE="${BACKUP_DIR}/supabase_backup_${TIMESTAMP}.sql.gz"

    # Get the postgres container name
    cd "$INSTALL_DIR"
    local PG_CONTAINER=$(docker compose ps -q db)

    if [ -z "$PG_CONTAINER" ]; then
        log_error "Postgres container not running!"
        exit 1
    fi

    log_info "Dumping database..."
    docker exec "$PG_CONTAINER" pg_dumpall -U supabase_admin | gzip > "$BACKUP_FILE"

    local FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log_success "Backup created: ${BACKUP_FILE} (${FILE_SIZE})"

    # Keep only last 7 backups
    local BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/supabase_backup_*.sql.gz 2>/dev/null | wc -l)
    if [ "$BACKUP_COUNT" -gt 7 ]; then
        log_info "Cleaning old backups (keeping last 7)..."
        ls -1t "$BACKUP_DIR"/supabase_backup_*.sql.gz | tail -n +8 | xargs rm -f
        log_success "Old backups cleaned"
    fi

    # List all backups
    echo ""
    log_info "Available backups:"
    ls -lh "$BACKUP_DIR"/supabase_backup_*.sql.gz 2>/dev/null | awk '{print "  " $NF " (" $5 ")"}'
}

# ==========================================
# Restore Database
# ==========================================
cmd_restore() {
    local backup_file="${1:-}"

    if [ -z "$backup_file" ]; then
        echo ""
        log_info "Available backups:"
        ls -1t "$BACKUP_DIR"/supabase_backup_*.sql.gz 2>/dev/null | while read f; do
            echo "  $(basename $f) ($(du -h "$f" | cut -f1))"
        done
        echo ""
        read -p "ระบุ path ของ backup file: " backup_file
    fi

    if [ ! -f "$backup_file" ]; then
        # Try looking in backup dir
        if [ -f "${BACKUP_DIR}/${backup_file}" ]; then
            backup_file="${BACKUP_DIR}/${backup_file}"
        else
            log_error "Backup file not found: ${backup_file}"
            exit 1
        fi
    fi

    echo ""
    log_warn "⚠️  การ restore จะ OVERWRITE ข้อมูลทั้งหมดในฐานข้อมูล!"
    read -p "ต้องการดำเนินการต่อหรือไม่? (y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        log_info "Cancelled."
        exit 0
    fi

    cd "$INSTALL_DIR"
    local PG_CONTAINER=$(docker compose ps -q db)

    log_info "Restoring from: $(basename $backup_file)..."
    gunzip -c "$backup_file" | docker exec -i "$PG_CONTAINER" psql -U supabase_admin -d postgres

    log_success "Database restored!"
    log_info "แนะนำให้ restart services:"
    log_info "  sudo ./maintenance.sh restart"
}

# ==========================================
# Update Supabase
# ==========================================
cmd_update() {
    log_info "Updating Supabase..."

    # Backup first
    echo ""
    read -p "ต้องการ backup ก่อน update หรือไม่? (Y/n): " do_backup
    if [ "$do_backup" != "n" ] && [ "$do_backup" != "N" ]; then
        cmd_backup
    fi

    cd "$INSTALL_DIR"

    # Update repo
    if [ -d "$INSTALL_DIR/supabase-repo" ]; then
        log_info "Pulling latest Supabase repo..."
        cd "$INSTALL_DIR/supabase-repo"
        git pull origin master

        # Check for docker-compose changes
        log_warn "ตรวจสอบว่า docker-compose.yml มีการเปลี่ยนแปลงหรือไม่"
        log_info "ถ้าต้องการใช้ docker-compose.yml ใหม่:"
        log_info "  cp $INSTALL_DIR/supabase-repo/docker/docker-compose.yml $INSTALL_DIR/docker-compose.yml"
    fi

    cd "$INSTALL_DIR"

    log_info "Pulling latest Docker images..."
    docker compose pull

    log_info "Restarting services with new images..."
    docker compose down
    docker compose up -d

    sleep 15
    log_success "Supabase updated!"
    docker compose ps

    # Clean up old images
    echo ""
    read -p "ต้องการลบ Docker images เก่าหรือไม่? (y/N): " cleanup
    if [ "$cleanup" = "y" ] || [ "$cleanup" = "Y" ]; then
        docker image prune -f
        log_success "Old images cleaned"
    fi
}

# ==========================================
# Show Credentials
# ==========================================
cmd_creds() {
    local CREDS_FILE="$INSTALL_DIR/.credentials"

    if [ -f "$CREDS_FILE" ]; then
        cat "$CREDS_FILE"
    else
        log_warn "Credentials file not found: $CREDS_FILE"
        log_info "แสดงจาก .env แทน:"
        echo ""
        cd "$INSTALL_DIR"
        grep -E "^(POSTGRES_PASSWORD|JWT_SECRET|ANON_KEY|SERVICE_ROLE_KEY|DASHBOARD_|SUPABASE_PUBLIC_URL)" .env
    fi
}

# ==========================================
# Quick Health Check
# ==========================================
cmd_health() {
    log_info "Running health check..."

    cd "$INSTALL_DIR"
    source .env

    local SUPABASE_URL="${SUPABASE_PUBLIC_URL:-http://localhost:8000}"

    # Check each service
    echo ""
    echo "Service Health:"

    # Kong API Gateway
    local HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${SUPABASE_URL}/rest/v1/" -H "apikey: ${ANON_KEY}" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "  ${GREEN}✓${NC} REST API      (HTTP ${HTTP_CODE})"
    else
        echo -e "  ${RED}✗${NC} REST API      (HTTP ${HTTP_CODE})"
    fi

    # Auth
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${SUPABASE_URL}/auth/v1/health" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "  ${GREEN}✓${NC} Auth          (HTTP ${HTTP_CODE})"
    else
        echo -e "  ${RED}✗${NC} Auth          (HTTP ${HTTP_CODE})"
    fi

    # Storage
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${SUPABASE_URL}/storage/v1/" -H "apikey: ${ANON_KEY}" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "400" ]; then
        echo -e "  ${GREEN}✓${NC} Storage       (HTTP ${HTTP_CODE})"
    else
        echo -e "  ${RED}✗${NC} Storage       (HTTP ${HTTP_CODE})"
    fi

    echo ""

    # Docker status
    local TOTAL=$(docker compose ps --format '{{.Name}}' | wc -l)
    local HEALTHY=$(docker compose ps --format '{{.Status}}' | grep -c "(healthy)" || true)
    echo -e "  Containers: ${HEALTHY}/${TOTAL} healthy"
    echo ""
}

# ==========================================
# Setup Cron for auto backup
# ==========================================
cmd_setup_cron() {
    log_info "Setting up automatic daily backup..."

    local SCRIPT_PATH="$(realpath "$0")"
    local CRON_LINE="0 3 * * * ${SCRIPT_PATH} backup >> /var/log/supabase-backup.log 2>&1"

    # Check if cron already exists
    if crontab -l 2>/dev/null | grep -q "supabase.*backup"; then
        log_warn "Backup cron already exists"
        crontab -l | grep "supabase.*backup"
    else
        (crontab -l 2>/dev/null; echo "$CRON_LINE") | crontab -
        log_success "Daily backup cron set at 03:00 AM"
        log_info "Logs: /var/log/supabase-backup.log"
    fi
}

# ==========================================
# Usage
# ==========================================
usage() {
    echo ""
    echo -e "${CYAN}🔧 Supabase Maintenance Tool${NC}"
    echo ""
    echo "Usage: sudo ./maintenance.sh <command> [args]"
    echo ""
    echo "Commands:"
    echo "  status       แสดงสถานะ services"
    echo "  health       ตรวจสอบ health ของ APIs"
    echo "  start        start ทุก services"
    echo "  stop         stop ทุก services"
    echo "  restart      restart ทุก services"
    echo "  logs [svc]   ดู logs (ระบุ service ได้)"
    echo "  backup       backup database"
    echo "  restore      restore database จาก backup"
    echo "  update       อัพเดท Supabase images"
    echo "  creds        แสดง credentials"
    echo "  setup-cron   ตั้ง auto backup วันละครั้ง"
    echo ""
}

# ==========================================
# Main
# ==========================================
COMMAND="${1:-}"
shift 2>/dev/null || true

case "$COMMAND" in
    status)     cmd_status ;;
    health)     cmd_health ;;
    start)      cmd_start ;;
    stop)       cmd_stop ;;
    restart)    cmd_restart ;;
    logs)       cmd_logs "$@" ;;
    backup)     cmd_backup ;;
    restore)    cmd_restore "$@" ;;
    update)     cmd_update ;;
    creds)      cmd_creds ;;
    setup-cron) cmd_setup_cron ;;
    *)          usage ;;
esac
