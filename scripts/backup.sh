#!/bin/bash
# ============================================
# Backup Script
# ============================================
#
# Script นี้จะ backup:
# 1. Database (PostgreSQL)
# 2. Storage files
# 3. Environment files
#
# วิธีใช้:
# ./scripts/backup.sh
#
# ตั้ง Cron job:
# 0 2 * * * /opt/app/ai-content-creator-nextjs/scripts/backup.sh
#
# ============================================

set -e

# ==========================================
# Configuration
# ==========================================
APP_DIR="/opt/app/ai-content-creator-nextjs"
BACKUP_DIR="/opt/app/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7  # เก็บ backup กี่วัน

# ==========================================
# Colors
# ==========================================
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# ==========================================
# Create backup directory
# ==========================================
mkdir -p $BACKUP_DIR/$DATE

# ==========================================
# 1. Backup Database
# ==========================================
log_info "Backing up database..."

docker exec supabase-db pg_dump \
    -U postgres \
    -Fc \
    postgres > $BACKUP_DIR/$DATE/database.dump

log_success "Database backup complete"

# ==========================================
# 2. Backup Storage
# ==========================================
log_info "Backing up storage..."

docker cp supabase-storage:/var/lib/storage $BACKUP_DIR/$DATE/storage 2>/dev/null || echo "No storage data to backup"

log_success "Storage backup complete"

# ==========================================
# 3. Backup Environment
# ==========================================
log_info "Backing up environment..."

cp $APP_DIR/.env.production $BACKUP_DIR/$DATE/env.production.backup 2>/dev/null || echo "No .env.production found"

log_success "Environment backup complete"

# ==========================================
# 4. Compress backup
# ==========================================
log_info "Compressing backup..."

cd $BACKUP_DIR
tar -czf backup_$DATE.tar.gz $DATE
rm -rf $DATE

log_success "Backup compressed: backup_$DATE.tar.gz"

# ==========================================
# 5. Cleanup old backups
# ==========================================
log_info "Cleaning up old backups..."

find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

log_success "Old backups cleaned"

# ==========================================
# Summary
# ==========================================
echo ""
echo "============================================"
echo "✅ Backup Complete!"
echo "============================================"
echo "Location: $BACKUP_DIR/backup_$DATE.tar.gz"
echo "Size: $(du -h $BACKUP_DIR/backup_$DATE.tar.gz | cut -f1)"
echo ""
