# 🚀 Quick Start - Production Deployment

## ⚡ 3 ขั้นตอนง่ายๆ สู่ Production!

### 1️⃣ Setup VPS (รันครั้งเดียว)

```bash
# SSH เข้า VPS
ssh -p 2222 acuser01@203.151.166.65

# รัน setup script (ติดตั้ง Docker, Swap, Firewall)
curl -sSL https://raw.githubusercontent.com/YOUR_USERNAME/ai-content-creator-nextjs/release/scripts/setup-vps.sh | sudo bash

# ⚠️ สำคัญ: Logout แล้ว Login ใหม่!
exit
ssh -p 2222 acuser01@203.151.166.65
```

### 2️⃣ Clone & First Time Setup (แค่รันคำสั่งเดียว!)

```bash
# Clone repository
cd /opt/app
git clone https://github.com/YOUR_USERNAME/ai-content-creator-nextjs.git
cd ai-content-creator-nextjs

# 🎉 First time setup - ทำทุกอย่างอัตโนมัติ!
./scripts/first-time-setup.sh
```

Script นี้จะทำให้อัตโนมัติ:
- ✅ Generate JWT keys
- ✅ สร้าง `.env.production`
- ✅ Start all services (Next.js, Supabase, Traefik)
- ✅ Apply database migrations

### 3️⃣ Setup GitHub Secrets (สำหรับ Auto-deploy)

ไปที่ GitHub → Settings → Secrets → Actions → New:

| Name | Value |
|------|-------|
| `VPS_HOST` | `203.151.166.65` |
| `VPS_PORT` | `2222` |
| `VPS_USERNAME` | `acuser01` |
| `VPS_PASSWORD` | (รหัสผ่าน SSH) |

**เสร็จ!** 🎉 ทุกครั้งที่ push ไป `release` branch จะ deploy อัตโนมัติ

---

## 📱 เข้าใช้งาน

หลัง setup เสร็จ:

| Service | URL |
|---------|-----|
| **Web App** | `http://203.151.166.65:3000` |
| **Supabase API** | `http://203.151.166.65:8000` |

---

## 📋 คำสั่งที่ใช้บ่อย

```bash
# ดู logs
docker compose -f docker-compose.production.yml logs -f

# ดู status
docker compose -f docker-compose.production.yml ps

# Restart ทั้งหมด
docker compose -f docker-compose.production.yml restart

# Health check
./scripts/health-check.sh

# Backup database
./scripts/backup.sh

# Apply migrations ใหม่
./scripts/apply-migrations.sh
```

---

## 🔄 Deploy Code ใหม่

```bash
# บน Mac ของคุณ
git add .
git commit -m "Your changes"
git push origin release

# GitHub Actions จะ deploy อัตโนมัติ! 🚀
```

---

## 🆘 Troubleshooting

### ❌ Out of Memory
```bash
free -h              # ดู memory
docker stats         # ดู container memory
```

### ❌ Container ไม่ start
```bash
docker compose -f docker-compose.production.yml logs supabase-db
```

### ❌ Migration failed
```bash
./scripts/apply-migrations.sh  # รัน migrations ใหม่
```

---

📖 **อ่านคู่มือฉบับเต็มที่** `DEPLOYMENT.md`
