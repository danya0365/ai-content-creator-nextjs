#!/bin/bash
# ============================================
# VPS Initial Setup Script
# ============================================
#
# Script นี้จะติดตั้งทุกอย่างที่จำเป็นบน VPS
# รันครั้งเดียวตอน setup ครั้งแรก
#
# วิธีใช้:
# chmod +x setup-vps.sh
# sudo ./setup-vps.sh
#
# หรือ:
# curl -sSL https://raw.githubusercontent.com/YOUR_USERNAME/ai-content-creator-nextjs/release/scripts/setup-vps.sh | sudo bash
#
# ============================================

set -e  # หยุดทันทีถ้าเกิด error

# ==========================================
# Colors for output
# ==========================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ==========================================
# Helper Functions
# ==========================================
print_header() {
    echo ""
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# ==========================================
# Check if running as root
# ==========================================
if [ "$EUID" -ne 0 ]; then
    print_error "กรุณารันด้วย sudo หรือ root"
    echo "ใช้: sudo ./setup-vps.sh"
    exit 1
fi

print_header "🚀 VPS Setup Script - AI Content Creator"
echo "Script นี้จะติดตั้ง:"
echo "  1. Docker และ Docker Compose"
echo "  2. Git"
echo "  3. Node.js (สำหรับ generate keys)"
echo "  4. Swap file (2GB)"
echo "  5. Firewall (UFW)"
echo ""
echo "VPS Requirements:"
echo "  - Ubuntu 20.04 หรือใหม่กว่า"
echo "  - RAM อย่างน้อย 4GB"
echo "  - Disk อย่างน้อย 20GB"
echo ""

# ==========================================
# 1. System Update
# ==========================================
print_header "1. อัพเดทระบบ"

apt update
apt upgrade -y

print_success "อัพเดทระบบเรียบร้อย"

# ==========================================
# 2. Install Required Packages
# ==========================================
print_header "2. ติดตั้ง packages ที่จำเป็น"

apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common \
    git \
    nano \
    htop \
    wget \
    unzip

print_success "ติดตั้ง packages เรียบร้อย"

# ==========================================
# 3. Install Docker
# ==========================================
print_header "3. ติดตั้ง Docker"

# Check if Docker is already installed
if command -v docker &> /dev/null; then
    print_warning "Docker ถูกติดตั้งแล้ว ข้าม..."
else
    # Remove old versions
    apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

    # Add Docker GPG key
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    # Add Docker repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Install Docker
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Enable Docker to start on boot
    systemctl enable docker
    systemctl start docker

    print_success "ติดตั้ง Docker เรียบร้อย"
fi

# Verify Docker installation
docker --version
docker compose version

# ==========================================
# 4. Install Node.js
# ==========================================
print_header "4. ติดตั้ง Node.js"

# Check if Node.js is already installed
if command -v node &> /dev/null; then
    print_warning "Node.js ถูกติดตั้งแล้ว ข้าม..."
else
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    print_success "ติดตั้ง Node.js เรียบร้อย"
fi

node --version
npm --version

# ==========================================
# 5. Create Swap File
# ==========================================
print_header "5. สร้าง Swap File"

# Check if swap already exists
if swapon --show | grep -q '/swapfile'; then
    print_warning "Swap file มีอยู่แล้ว ข้าม..."
else
    # Create 2GB swap file
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile

    # Make permanent
    if ! grep -q '/swapfile' /etc/fstab; then
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi

    print_success "สร้าง Swap file 2GB เรียบร้อย"
fi

# Show memory status
free -h

# ==========================================
# 6. Configure Firewall
# ==========================================
print_header "6. ตั้งค่า Firewall (UFW)"

# Install UFW if not present
apt install -y ufw

# Configure firewall rules
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (custom port 2222)
ufw allow 2222/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
echo "y" | ufw enable

print_success "ตั้งค่า Firewall เรียบร้อย"
ufw status

# ==========================================
# 7. Create App Directory
# ==========================================
print_header "7. สร้าง Directory สำหรับ Application"

APP_DIR="/opt/app"

if [ -d "$APP_DIR" ]; then
    print_warning "Directory $APP_DIR มีอยู่แล้ว"
else
    mkdir -p $APP_DIR
    print_success "สร้าง $APP_DIR เรียบร้อย"
fi

# Get the original user (not root)
ORIGINAL_USER=${SUDO_USER:-$USER}

# Change ownership
chown -R $ORIGINAL_USER:$ORIGINAL_USER $APP_DIR

print_success "เปลี่ยน ownership เป็น $ORIGINAL_USER"

# ==========================================
# 8. Add User to Docker Group
# ==========================================
print_header "8. เพิ่ม User เข้า Docker Group"

if id -nG "$ORIGINAL_USER" | grep -qw "docker"; then
    print_warning "User $ORIGINAL_USER อยู่ใน docker group แล้ว"
else
    usermod -aG docker $ORIGINAL_USER
    print_success "เพิ่ม $ORIGINAL_USER เข้า docker group เรียบร้อย"
    print_warning "ต้อง logout และ login ใหม่เพื่อให้มีผล"
fi

# ==========================================
# 9. System Optimization
# ==========================================
print_header "9. ปรับแต่ง System"

# Increase file limits
cat > /etc/security/limits.d/docker.conf << EOF
* soft nofile 65535
* hard nofile 65535
EOF

# Increase inotify watches
echo "fs.inotify.max_user_watches=524288" >> /etc/sysctl.conf
sysctl -p

print_success "ปรับแต่ง System เรียบร้อย"

# ==========================================
# 10. Setup Complete
# ==========================================
print_header "✅ Setup เสร็จสมบูรณ์!"

echo ""
echo "🎉 VPS พร้อมใช้งานแล้ว!"
echo ""
echo "ขั้นตอนถัดไป:"
echo ""
echo "1. Logout และ Login ใหม่ (เพื่อให้ docker group มีผล)"
echo "   exit"
echo ""
echo "2. Clone repository"
echo "   cd /opt/app"
echo "   git clone https://github.com/YOUR_USERNAME/ai-content-creator-nextjs.git"
echo "   cd ai-content-creator-nextjs"
echo ""
echo "3. สร้างไฟล์ environment"
echo "   cp .env.production.example .env.production"
echo "   nano .env.production"
echo ""
echo "4. Generate JWT keys"
echo "   node scripts/generate-keys.js"
echo ""
echo "5. Start services"
echo "   docker compose -f docker-compose.production.yml up -d"
echo ""
echo "============================================"
echo "📖 อ่านคู่มือเพิ่มเติมที่ DEPLOYMENT.md"
echo "============================================"
