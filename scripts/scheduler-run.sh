#!/bin/bash
# ============================================
# Laravel-style Scheduler Runner
# ============================================
#
# แนวคิดเหมือน Laravel: php artisan schedule:run
# 
# ใช้ cron entry เพียง 1 บรรทัด:
# * * * * * /opt/app/ai-content-creator-nextjs/scripts/scheduler-run.sh >> /var/log/scheduler.log 2>&1
#
# Scheduler จะตรวจสอบเองว่าต้องรัน task ไหน
#
# ============================================

# ==========================================
# Configuration
# ==========================================
APP_DIR="/opt/app/ai-content-creator-nextjs"
API_URL="http://localhost:3000/api/cron/scheduler"
LOG_FILE="/var/log/scheduler.log"

# Load environment variables
if [ -f "$APP_DIR/.env.production" ]; then
    export $(grep -v '^#' "$APP_DIR/.env.production" | xargs 2>/dev/null)
fi

# ==========================================
# Main
# ==========================================

# Call the scheduler endpoint
RESPONSE=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "x-cron-secret: ${CRON_SECRET:-}" \
    2>&1)

# Log only if tasks were run
if echo "$RESPONSE" | grep -q '"tasksRun":0'; then
    # No tasks run, minimal logging
    exit 0
else
    # Tasks were run, log the response
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $RESPONSE"
fi
