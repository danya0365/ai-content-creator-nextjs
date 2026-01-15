#!/bin/bash
# ============================================
# Health Check Script
# ============================================
#
# Script นี้ใช้ตรวจสอบสถานะของ services
#
# วิธีใช้:
# ./scripts/health-check.sh
#
# ============================================

# ==========================================
# Colors
# ==========================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ==========================================
# Functions
# ==========================================
check_service() {
    local name=$1
    local container=$2
    
    if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
        # Check if container is healthy
        local status=$(docker inspect --format='{{.State.Health.Status}}' $container 2>/dev/null || echo "none")
        
        if [ "$status" = "healthy" ] || [ "$status" = "none" ]; then
            local uptime=$(docker inspect --format='{{.State.StartedAt}}' $container 2>/dev/null)
            echo -e "${GREEN}✓${NC} $name: Running (since $uptime)"
            return 0
        else
            echo -e "${YELLOW}⚠${NC} $name: $status"
            return 1
        fi
    else
        echo -e "${RED}✗${NC} $name: Not running"
        return 1
    fi
}

check_http() {
    local name=$1
    local url=$2
    
    local code=$(curl -s -o /dev/null -w "%{http_code}" $url 2>/dev/null || echo "000")
    
    if [ "$code" = "200" ] || [ "$code" = "301" ] || [ "$code" = "302" ]; then
        echo -e "${GREEN}✓${NC} $name: HTTP $code"
        return 0
    else
        echo -e "${RED}✗${NC} $name: HTTP $code"
        return 1
    fi
}

# ==========================================
# Main
# ==========================================
echo ""
echo "============================================"
echo "🏥 Health Check"
echo "============================================"
echo ""

# Check containers
echo "📦 Container Status:"
echo "--------------------------------------------"
check_service "Traefik" "traefik"
check_service "Next.js App" "nextjs-app"
check_service "Supabase Kong" "supabase-kong"
check_service "Supabase Database" "supabase-db"
check_service "Supabase Auth" "supabase-auth"
check_service "Supabase REST" "supabase-rest"
check_service "Supabase Realtime" "supabase-realtime"
check_service "Supabase Storage" "supabase-storage"

echo ""

# Check HTTP endpoints
echo "🌐 HTTP Endpoints:"
echo "--------------------------------------------"
check_http "Next.js App" "http://localhost:3000"
check_http "Supabase API" "http://localhost:8000"

echo ""

# Resource usage
echo "💻 Resource Usage:"
echo "--------------------------------------------"
echo ""

# Memory
echo "Memory:"
free -h | head -2

echo ""

# Docker stats (snapshot)
echo "Docker Stats:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" \
    traefik nextjs-app supabase-kong supabase-db supabase-auth supabase-rest supabase-realtime supabase-storage 2>/dev/null || echo "Could not get stats"

echo ""

# Disk usage
echo "Disk Usage:"
df -h / | tail -1

echo ""
echo "============================================"
