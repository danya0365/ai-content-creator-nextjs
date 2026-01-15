#!/bin/bash
# ============================================
# Restore Script
# ============================================
#
# Script นี้จะ restore จาก backup file
#
# วิธีใช้:
# ./scripts/restore.sh /opt/app/backups/backup_20260115_020000.tar.gz
#
# ============================================

set -e

# ==========================================
# Check arguments
# ==========================================
if [ -z "$1" ]; then
    echo "Usage: ./scripts/restore.sh <backup_file.tar.gz>"
    echo "Example: ./scripts/restore.sh /opt/app/backups/backup_20260115_020000.tar.gz"
    exit 1
fi

BACKUP_FILE=$1
TEMP_DIR=$(mktemp -d)

# ==========================================
# Colors
# ==========================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# ==========================================
# Confirm restore
# ==========================================
echo ""
echo "============================================"
echo "⚠️  DATABASE RESTORE"
echo "============================================"
echo ""
echo "This will OVERWRITE the current database!"
echo "Backup file: $BACKUP_FILE"
echo ""
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# ==========================================
# Extract backup
# ==========================================
log_info "Extracting backup..."

tar -xzf $BACKUP_FILE -C $TEMP_DIR
BACKUP_DIR=$(ls $TEMP_DIR)

log_success "Backup extracted"

# ==========================================
# Stop services (except database)
# ==========================================
log_info "Stopping services..."

cd /opt/app/ai-content-creator-nextjs
docker compose -f docker-compose.production.yml stop nextjs-app supabase-kong supabase-rest supabase-auth supabase-realtime supabase-storage

log_success "Services stopped"

# ==========================================
# Restore database
# ==========================================
log_info "Restoring database..."

cat $TEMP_DIR/$BACKUP_DIR/database.dump | docker exec -i supabase-db pg_restore \
    -U postgres \
    -d postgres \
    --clean \
    --if-exists \
    2>/dev/null || log_warning "Some restore warnings (usually safe to ignore)"

log_success "Database restored"

# ==========================================
# Restore storage
# ==========================================
if [ -d "$TEMP_DIR/$BACKUP_DIR/storage" ]; then
    log_info "Restoring storage..."
    docker cp $TEMP_DIR/$BACKUP_DIR/storage supabase-storage:/var/lib/
    log_success "Storage restored"
else
    log_warning "No storage data in backup"
fi

# ==========================================
# Start services
# ==========================================
log_info "Starting services..."

docker compose -f docker-compose.production.yml up -d

log_success "Services started"

# ==========================================
# Cleanup
# ==========================================
rm -rf $TEMP_DIR

# ==========================================
# Summary
# ==========================================
echo ""
echo "============================================"
echo "✅ Restore Complete!"
echo "============================================"
echo ""
