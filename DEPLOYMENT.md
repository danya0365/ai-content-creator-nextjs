# 🚀 Production Deployment Guide

คู่มือการ Deploy โปรเจค AI Content Creator ขึ้น VPS แบบละเอียด สำหรับผู้เริ่มต้น

---

## 📋 สารบัญ

1. [ภาพรวม Architecture](#1-ภาพรวม-architecture)
2. [เตรียม VPS ครั้งแรก](#2-เตรียม-vps-ครั้งแรก)
3. [ติดตั้ง Docker และ Dependencies](#3-ติดตั้ง-docker-และ-dependencies)
4. [ตั้งค่า Supabase Self-hosted](#4-ตั้งค่า-supabase-self-hosted)
5. [ตั้งค่า GitHub Secrets](#5-ตั้งค่า-github-secrets)
6. [Deploy ครั้งแรก](#6-deploy-ครั้งแรก)
7. [Automatic Deployment](#7-automatic-deployment)
8. [การดูแลรักษา](#8-การดูแลรักษา)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. ภาพรวม Architecture

### 🏗️ โครงสร้างระบบ

```
┌─────────────────────────────────────────────────────────────────┐
│                     VPS (Ubuntu 22.04)                          │
│                   IP: 203.151.166.65                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Internet                                                      │
│      │                                                          │
│      ▼                                                          │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    Traefik                               │   │
│   │              (Reverse Proxy + SSL)                       │   │
│   │           Port 80 (HTTP) → 443 (HTTPS)                  │   │
│   └─────────────────────────────────────────────────────────┘   │
│      │                           │                              │
│      ▼                           ▼                              │
│   ┌───────────────┐     ┌───────────────────────────────────┐   │
│   │   Next.js     │     │         Supabase Stack            │   │
│   │   App         │     │  ┌─────────┐  ┌─────────┐        │   │
│   │   Port 3000   │     │  │Postgres │  │ Auth    │        │   │
│   │               │◄────┤  │  :5432  │  │(GoTrue) │        │   │
│   │               │     │  └─────────┘  └─────────┘        │   │
│   │               │     │  ┌─────────┐  ┌─────────┐        │   │
│   │               │     │  │PostgREST│  │Realtime │        │   │
│   │               │     │  │  :3000  │  │  :4000  │        │   │
│   └───────────────┘     │  └─────────┘  └─────────┘        │   │
│                         │  ┌─────────┐  ┌─────────┐        │   │
│                         │  │Storage  │  │ Studio  │        │   │
│                         │  │  :5000  │  │  :3001  │        │   │
│                         │  └─────────┘  └─────────┘        │   │
│                         └───────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 📦 อธิบาย Components

| Component | คืออะไร | ทำหน้าที่อะไร |
|-----------|---------|---------------|
| **Traefik** | Reverse Proxy | รับ traffic จาก internet, จัดการ SSL certificate อัตโนมัติ, route ไปยัง services |
| **Next.js App** | Web Application | เว็บแอปพลิเคชันหลักของเรา |
| **Postgres** | Database | เก็บข้อมูลทั้งหมด (users, content, etc.) |
| **GoTrue (Auth)** | Authentication | จัดการ login, register, JWT tokens |
| **PostgREST** | REST API | สร้าง REST API อัตโนมัติจาก database |
| **Realtime** | WebSocket | ส่งข้อมูล real-time (live updates) |
| **Storage** | File Storage | เก็บไฟล์ รูปภาพ วิดีโอ |
| **Studio** | Admin Panel | หน้า admin สำหรับจัดการ database (ปิดใน production) |

---

## 2. เตรียม VPS ครั้งแรก

### 2.1 SSH เข้า VPS

เปิด Terminal แล้วพิมพ์:

```bash
ssh -p 2222 acuser01@203.151.166.65
```

### 2.2 รัน Setup Script

หลังจาก SSH เข้าไปแล้ว ให้รันคำสั่งนี้:

```bash
# Download และรัน setup script
curl -sSL https://raw.githubusercontent.com/YOUR_USERNAME/ai-content-creator-nextjs/release/scripts/setup-vps.sh | sudo bash
```

หรือถ้าต้องการทำ manual ให้ดูหัวข้อ 3

---

## 3. ติดตั้ง Docker และ Dependencies

### 3.1 อัพเดท System

```bash
# อัพเดท package list
sudo apt update

# อัพเกรด packages ทั้งหมด
sudo apt upgrade -y
```

### 3.2 ติดตั้ง Docker

```bash
# ติดตั้ง required packages
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# เพิ่ม Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# เพิ่ม Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# อัพเดท package list อีกครั้ง
sudo apt update

# ติดตั้ง Docker
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# เพิ่ม user ปัจจุบันเข้า docker group (ไม่ต้องใช้ sudo)
sudo usermod -aG docker $USER
```

### 3.3 ติดตั้ง Git

```bash
sudo apt install -y git
```

### 3.4 สร้าง Swap File (จำเป็นมาก สำหรับ 4GB RAM)

```bash
# สร้าง swap file ขนาด 2GB
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# ทำให้ swap ทำงานหลัง reboot
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 3.5 ตั้งค่า Firewall

```bash
# เปิด UFW firewall
sudo ufw enable

# อนุญาต SSH port
sudo ufw allow 2222/tcp

# อนุญาต HTTP และ HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# ดูสถานะ
sudo ufw status
```

---

## 4. ตั้งค่า Supabase Self-hosted

### 4.1 สร้าง Directory Structure

```bash
# สร้างโฟลเดอร์สำหรับ app
sudo mkdir -p /opt/app
sudo chown -R $USER:$USER /opt/app
cd /opt/app
```

### 4.2 Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-content-creator-nextjs.git
cd ai-content-creator-nextjs
```

### 4.3 สร้างไฟล์ Environment

```bash
# Copy ไฟล์ตัวอย่าง
cp .env.production.example .env.production

# แก้ไขค่าในไฟล์
nano .env.production
```

### 4.4 สิ่งสำคัญที่ต้องแก้ใน .env.production

⚠️ **สำคัญมาก**: ต้องเปลี่ยนค่าเหล่านี้!

1. **POSTGRES_PASSWORD** - รหัสผ่าน database (สุ่มมาใหม่)
2. **JWT_SECRET** - ใช้สร้าง JWT tokens (ต้องยาว 32+ ตัวอักษร)
3. **ANON_KEY** และ **SERVICE_ROLE_KEY** - จะ generate ให้ในหัวข้อถัดไป

### 4.5 Generate JWT Keys

ไปที่เว็บนี้เพื่อ generate keys: https://supabase.com/docs/guides/self-hosting/docker#generate-api-keys

หรือใช้คำสั่งนี้บน VPS:

```bash
# Install Node.js ถ้ายังไม่มี
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Generate keys
cd /opt/app/ai-content-creator-nextjs
node scripts/generate-keys.js
```

### 4.6 Start Services

```bash
# Start ทั้งหมด
docker compose -f docker-compose.production.yml up -d

# ดู logs
docker compose -f docker-compose.production.yml logs -f
```

---

## 5. ตั้งค่า GitHub Secrets

### 5.1 ทำไมต้องใช้ GitHub Secrets?

GitHub Secrets คือที่เก็บข้อมูลลับ (passwords, keys) อย่างปลอดภัย
เมื่อ GitHub Actions รัน มันจะดึงค่าเหล่านี้มาใช้โดยอัตโนมัติ

### 5.2 วิธีเพิ่ม Secrets

1. ไปที่ GitHub Repository ของคุณ
2. คลิก **Settings** (tab ด้านบน)
3. เมนูซ้าย: **Secrets and variables** → **Actions**
4. คลิก **New repository secret**

### 5.3 Secrets ที่ต้องเพิ่ม

| Secret Name | Value | คำอธิบาย |
|-------------|-------|----------|
| `VPS_HOST` | `203.151.166.65` | IP ของ VPS |
| `VPS_PORT` | `2222` | SSH Port |
| `VPS_USERNAME` | `******` | SSH Username |
| `VPS_PASSWORD` | `******` | SSH Password |
| `NEXT_PUBLIC_SUPABASE_URL` | `http://203.151.166.65:8000` | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (ค่าที่ generate) | Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | (ค่าที่ generate) | Service Role Key |

---

## 6. Deploy ครั้งแรก

### 6.1 Push ไปยัง Release Branch

```bash
# ใน local machine
git checkout -b release
git push origin release
```

### 6.2 ดู GitHub Actions

1. ไปที่ GitHub Repository
2. คลิก **Actions** tab
3. จะเห็น workflow กำลังรัน
4. รอจนเสร็จ (ประมาณ 5-10 นาที)

### 6.3 ตรวจสอบ Deployment

```bash
# SSH เข้า VPS
ssh -p 2222 acuser01@203.151.166.65

# ดู containers ที่รันอยู่
docker ps

# ดู logs ของ Next.js app
docker logs nextjs-app -f
```

---

## 7. Automatic Deployment

### 7.1 วิธีการทำงาน

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Developer  │────▶│   GitHub    │────▶│    VPS      │
│  Push code  │     │   Actions   │     │  Auto-pull  │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                    │
      │                   │                    │
      ▼                   ▼                    ▼
   1. Push to         2. Build &          3. Pull &
   release branch     Test app            Restart
```

### 7.2 Flow อธิบาย

1. **Developer push code** - คุณ push code ไปยัง `release` branch
2. **GitHub Actions trigger** - GitHub Actions รับ event และเริ่มทำงาน
3. **Build & Test** - Actions build Docker image และ test
4. **SSH to VPS** - Actions connect ไปยัง VPS ผ่าน SSH
5. **Pull & Restart** - VPS pull code ใหม่และ restart containers

### 7.3 การ Deploy

ทุกครั้งที่ต้องการ deploy ใหม่:

```bash
# ใน local machine
git add .
git commit -m "Your changes"
git push origin release
```

แค่นี้! ระบบจะ deploy อัตโนมัติ

---

## 8. การดูแลรักษา

### 8.1 ดู Logs

```bash
# ดู logs ทั้งหมด
docker compose -f docker-compose.production.yml logs -f

# ดู logs เฉพาะ service
docker compose -f docker-compose.production.yml logs -f nextjs-app
docker compose -f docker-compose.production.yml logs -f supabase-db
```

### 8.2 Restart Services

```bash
# Restart ทั้งหมด
docker compose -f docker-compose.production.yml restart

# Restart service เดียว
docker compose -f docker-compose.production.yml restart nextjs-app
```

### 8.3 Stop Services

```bash
docker compose -f docker-compose.production.yml down
```

### 8.4 ดู Resource Usage

```bash
# ดู memory/CPU
docker stats

# ดู disk space
df -h
```

### 8.5 Backup Database

```bash
# Backup
docker exec supabase-db pg_dump -U postgres postgres > backup_$(date +%Y%m%d).sql

# Restore
cat backup_20260115.sql | docker exec -i supabase-db psql -U postgres postgres
```

### 8.6 อัพเดท Images

```bash
# Pull images ใหม่
docker compose -f docker-compose.production.yml pull

# Restart ด้วย images ใหม่
docker compose -f docker-compose.production.yml up -d
```

---

## 9. Troubleshooting

### ❌ ปัญหา: Container ไม่ start

```bash
# ดู logs
docker compose -f docker-compose.production.yml logs

# ดู status
docker compose -f docker-compose.production.yml ps
```

### ❌ ปัญหา: Out of Memory

```bash
# ดูว่า swap ทำงานไหม
free -h

# ถ้า swap = 0 ให้สร้าง swap file ใหม่ตามหัวข้อ 3.4
```

### ❌ ปัญหา: Database connection error

```bash
# ตรวจสอบ database container
docker logs supabase-db

# Restart database
docker compose -f docker-compose.production.yml restart supabase-db
```

### ❌ ปัญหา: SSL Certificate error

```bash
# ดู Traefik logs
docker logs traefik

# ตรวจสอบว่า domain ชี้มาที่ VPS ถูกต้อง
nslookup your-domain.com
```

### ❌ ปัญหา: GitHub Actions failed

1. ไปที่ GitHub Actions tab
2. คลิกที่ workflow ที่ fail
3. ดู logs เพื่อหาสาเหตุ
4. ตรวจสอบ Secrets ว่าถูกต้อง

---

## 📞 ต้องการความช่วยเหลือ?

ถ้าติดปัญหา สามารถ:
1. ดู logs ของ containers
2. ตรวจสอบ GitHub Actions logs
3. ติดต่อผู้พัฒนา

---

## 📝 Checklist ก่อน Deploy

- [ ] ติดตั้ง Docker บน VPS แล้ว
- [ ] สร้าง Swap file แล้ว
- [ ] ตั้งค่า Firewall แล้ว
- [ ] Clone repository ไปยัง VPS แล้ว
- [ ] สร้าง .env.production แล้ว
- [ ] Generate JWT keys แล้ว
- [ ] เพิ่ม GitHub Secrets แล้ว
- [ ] Push ไปยัง release branch แล้ว
