# ============================================
# Dockerfile สำหรับ Next.js Application
# ============================================
# 
# Dockerfile คือ "สูตรอาหาร" สำหรับสร้าง Docker Image
# Docker Image คือ "ภาพถ่าย" ของแอปพลิเคชันที่พร้อมรัน
# 
# การทำงาน:
# 1. ใช้ Node.js เป็น base
# 2. ติดตั้ง dependencies
# 3. Build แอป
# 4. สร้าง image ขนาดเล็กสำหรับ production
# ============================================

# ============================================
# Stage 1: Dependencies
# ============================================
# ติดตั้ง dependencies ทั้งหมด
FROM node:22-alpine AS deps

# alpine = Linux version เล็กมาก (~5MB)
# ทำให้ image เบา boot เร็ว

# ติดตั้ง libc6-compat สำหรับ packages บางตัว
RUN apk add --no-cache libc6-compat

# ตั้ง working directory
WORKDIR /app

# Copy ไฟล์ที่จำเป็นสำหรับ install dependencies
COPY package.json yarn.lock* ./

# ติดตั้ง dependencies
# --frozen-lockfile = ใช้ version ตาม lock file เท่านั้น
RUN yarn install --frozen-lockfile --ignore-engines

# ============================================
# Stage 2: Builder
# ============================================
# Build แอปพลิเคชัน
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependencies จาก stage ก่อนหน้า
COPY --from=deps /app/node_modules ./node_modules

# Copy source code ทั้งหมด
COPY . .

# ตั้งค่า Environment สำหรับ build
ARG BUILD_COMMIT_SHA
ENV VERCEL_GIT_COMMIT_SHA=$BUILD_COMMIT_SHA
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build แอป
RUN yarn build

# ============================================
# Stage 3: Runner (Production)
# ============================================
# Image สุดท้ายที่จะใช้รัน production
FROM node:22-alpine AS runner

WORKDIR /app

# ตั้งค่า production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# สร้าง user ใหม่ที่ไม่ใช่ root (security)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy ไฟล์ที่จำเป็นสำหรับรัน
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# ============================================
# Standalone Output
# ============================================
# Next.js สามารถ output แบบ standalone ได้
# ทำให้ไม่ต้อง copy node_modules ทั้งหมด
# ลดขนาด image ลงมาก

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# เปลี่ยนไปใช้ user ที่ไม่ใช่ root
USER nextjs

# Expose port 3000
EXPOSE 3000

# ตั้งค่า port
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# คำสั่งสำหรับ start แอป (standalone ใช้ server.js)
CMD ["node", "server.js"]
