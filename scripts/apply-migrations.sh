#!/bin/bash
# ============================================
# Apply Migrations Script
# ============================================
#
# Script นี้จะ apply migrations ทั้งหมดไปยัง database
# รันอัตโนมัติตอน deploy หรือรันเองก็ได้
#
# วิธีใช้:
# ./scripts/apply-migrations.sh
#
# ============================================

set -e

# ==========================================
# Configuration
# ==========================================
APP_DIR="/opt/app/ai-content-creator-nextjs"
MIGRATIONS_DIR="$APP_DIR/supabase/migrations"
DB_CONTAINER="supabase-db"
DB_USER="postgres"
DB_NAME="postgres"

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

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ==========================================
# Check if database is ready
# ==========================================
wait_for_db() {
    log_info "Waiting for database to be ready..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker exec $DB_CONTAINER pg_isready -U $DB_USER -d $DB_NAME > /dev/null 2>&1; then
            log_success "Database is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    log_error "Database is not ready after $max_attempts attempts"
    return 1
}

# ==========================================
# Create migrations tracking table
# ==========================================
create_tracking_table() {
    log_info "Creating migrations tracking table..."
    
    docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME << 'EOF'
-- สร้างตารางเก็บประวัติ migrations (ถ้ายังไม่มี)
CREATE TABLE IF NOT EXISTS _migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้าง index
CREATE INDEX IF NOT EXISTS idx_migrations_name ON _migrations(name);
EOF
    
    log_success "Migrations tracking table ready"
}

# ==========================================
# Check if migration was applied
# ==========================================
is_migration_applied() {
    local migration_name=$1
    
    result=$(docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -tAc \
        "SELECT COUNT(*) FROM _migrations WHERE name = '$migration_name';" 2>/dev/null || echo "0")
    
    if [ "$result" = "1" ]; then
        return 0  # Already applied
    else
        return 1  # Not applied
    fi
}

# ==========================================
# Apply single migration
# ==========================================
apply_migration() {
    local migration_file=$1
    local migration_name=$(basename "$migration_file")
    
    # Check if already applied
    if is_migration_applied "$migration_name"; then
        log_warning "Skipping $migration_name (already applied)"
        return 0
    fi
    
    log_info "Applying $migration_name..."
    
    # Apply migration
    if docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME < "$migration_file"; then
        # Record migration
        docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c \
            "INSERT INTO _migrations (name) VALUES ('$migration_name');" > /dev/null
        
        log_success "Applied $migration_name"
        return 0
    else
        log_error "Failed to apply $migration_name"
        return 1
    fi
}

# ==========================================
# Main
# ==========================================
main() {
    echo ""
    echo "============================================"
    echo "🗃️  Database Migrations"
    echo "============================================"
    echo ""
    
    # Change to app directory
    cd $APP_DIR 2>/dev/null || {
        # If running locally, use current directory
        MIGRATIONS_DIR="./supabase/migrations"
    }
    
    # Wait for database
    wait_for_db
    
    # Create tracking table
    create_tracking_table
    
    # Get list of migrations sorted by name (timestamp order)
    log_info "Looking for migrations in $MIGRATIONS_DIR"
    
    if [ ! -d "$MIGRATIONS_DIR" ]; then
        log_error "Migrations directory not found: $MIGRATIONS_DIR"
        exit 1
    fi
    
    # Count migrations
    migration_count=$(find "$MIGRATIONS_DIR" -name "*.sql" -type f | wc -l | tr -d ' ')
    
    if [ "$migration_count" -eq 0 ]; then
        log_warning "No migrations found"
        exit 0
    fi
    
    log_info "Found $migration_count migration files"
    echo ""
    
    # Apply migrations in order
    applied=0
    skipped=0
    failed=0
    
    for migration_file in $(find "$MIGRATIONS_DIR" -name "*.sql" -type f | sort); do
        if apply_migration "$migration_file"; then
            if is_migration_applied "$(basename "$migration_file")"; then
                # Check if it was just applied or skipped
                if [ "$?" -eq 0 ]; then
                    applied=$((applied + 1))
                fi
            fi
        else
            failed=$((failed + 1))
        fi
    done
    
    echo ""
    echo "============================================"
    echo "📊 Migration Summary"
    echo "============================================"
    echo ""
    
    # Show applied migrations
    log_info "Applied migrations:"
    docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c \
        "SELECT name, applied_at FROM _migrations ORDER BY applied_at;" 2>/dev/null || echo "No migrations recorded"
    
    echo ""
    
    # ==========================================
    # Apply Seeds
    # ==========================================
    SEEDS_DIR="$APP_DIR/supabase/seeds"
    if [ -d "$SEEDS_DIR" ] || [ -d "./supabase/seeds" ]; then
        # Use local path if APP_DIR doesn't exist
        if [ ! -d "$SEEDS_DIR" ]; then
            SEEDS_DIR="./supabase/seeds"
        fi
        
        seed_count=$(find "$SEEDS_DIR" -name "*.sql" -type f 2>/dev/null | wc -l | tr -d ' ')
        
        if [ "$seed_count" -gt 0 ]; then
            log_info "Applying $seed_count seed files..."
            
            for seed_file in $(find "$SEEDS_DIR" -name "*.sql" -type f | sort); do
                seed_name=$(basename "$seed_file")
                
                # Check if seed already applied
                seed_applied=$(docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -tAc \
                    "SELECT COUNT(*) FROM _migrations WHERE name = 'seed:$seed_name';" 2>/dev/null || echo "0")
                
                if [ "$seed_applied" = "1" ]; then
                    log_warning "Skipping seed $seed_name (already applied)"
                    continue
                fi
                
                log_info "Applying seed $seed_name..."
                if docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME < "$seed_file"; then
                    docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c \
                        "INSERT INTO _migrations (name) VALUES ('seed:$seed_name');" > /dev/null
                    log_success "Seed $seed_name applied"
                else
                    log_warning "Seed $seed_name may have had issues (non-fatal)"
                fi
            done
        fi
    fi
    
    if [ $failed -eq 0 ]; then
        echo "============================================"
        echo -e "${GREEN}✅ All migrations completed successfully!${NC}"
        echo "============================================"
    else
        echo "============================================"
        echo -e "${RED}❌ Some migrations failed!${NC}"
        echo "============================================"
        exit 1
    fi
}

# Run main function
main "$@"
