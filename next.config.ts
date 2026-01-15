import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ============================================
  // Standalone Output สำหรับ Docker
  // ============================================
  // เมื่อเปิดใช้งาน Next.js จะสร้าง output ที่รวม
  // dependencies ที่จำเป็นทั้งหมด ทำให้:
  // - Docker image มีขนาดเล็กลง
  // - ไม่ต้อง copy node_modules ทั้งหมด
  // - Deploy เร็วขึ้น
  output: 'standalone',
  
  // ============================================
  // Image Optimization
  // ============================================
  images: {
    // Domain ที่อนุญาตให้โหลด images
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },
};

export default nextConfig;
