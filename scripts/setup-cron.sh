#!/bin/bash
# ============================================
# Setup Laravel-style Scheduler
# ============================================
#
# ติดตั้ง cron ให้รัน scheduler ทุกนาที
# Scheduler จะควบคุมเองว่าจะรัน task ไหน
#
# วิธีใช้:
# chmod +x scripts/setup-cron.sh
# ./scripts/setup-cron.sh
#
# ============================================

set -e

# ==========================================
# Configuration
# ==========================================
APP_DIR="/opt/app/ai-content-creator-nextjs"
SCRIPT_PATH="$APP_DIR/scripts/scheduler-run.sh"
LOG_FILE="/var/log/scheduler.log"

# ==========================================
# Colors
# ==========================================
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "============================================"
echo "🕐 Setting up Laravel-style Scheduler"
echo "============================================"
echo ""

# Make script executable
chmod +x "$SCRIPT_PATH"
echo -e "${GREEN}✓${NC} Script is executable"

# Create log file
sudo touch "$LOG_FILE" 2>/dev/null || touch "$LOG_FILE"
sudo chmod 666 "$LOG_FILE" 2>/dev/null || chmod 666 "$LOG_FILE"
echo -e "${GREEN}✓${NC} Log file created at $LOG_FILE"

# Define cron entry (run every minute)
CRON_ENTRY="* * * * * $SCRIPT_PATH >> $LOG_FILE 2>&1"

# Remove old entries and add new one
(crontab -l 2>/dev/null | grep -v "scheduler-run.sh" | grep -v "cron-generate.sh"; echo "$CRON_ENTRY") | crontab -
echo -e "${GREEN}✓${NC} Cron job installed"

echo ""
echo "============================================"
echo "✅ Setup Complete!"
echo "============================================"
echo ""
echo "📋 Cron Entry (runs every minute):"
echo "   $CRON_ENTRY"
echo ""
echo "📅 Task schedules are defined in:"
echo "   src/infrastructure/scheduler/SchedulerConfig.ts"
echo ""
echo "🔧 Commands:"
echo "   View scheduled tasks:  curl http://localhost:3000/api/cron/run"
echo "   Run scheduler now:     $SCRIPT_PATH"
echo "   View logs:             tail -f $LOG_FILE"
echo "   Edit schedules:        Edit SchedulerConfig.ts"
echo ""
echo "📝 Current schedules (from code):"
echo "   🌅 06:00 - Morning content"
echo "   🍱 11:00 - Lunch content"  
echo "   ☀️  14:00 - Afternoon content"
echo "   🌙 18:00 - Evening content"
echo ""
