#!/usr/bin/env node
/**
 * ============================================
 * JWT Key Generator สำหรับ Supabase Self-hosted
 * ============================================
 * 
 * Script นี้จะ generate:
 * - ANON_KEY (สำหรับ client-side)
 * - SERVICE_ROLE_KEY (สำหรับ server-side)
 * 
 * วิธีใช้:
 * node scripts/generate-keys.js
 * 
 * หรือตาม prompt (ถ้าต้องการใส่ JWT_SECRET เอง):
 * node scripts/generate-keys.js --interactive
 * 
 * ============================================
 */

const crypto = require('crypto');

// ============================================
// Configuration
// ============================================
const CONFIG = {
    // Default expiry: 10 years from now
    expiryYears: 10,
    
    // Roles
    roles: {
        anon: 'anon',
        serviceRole: 'service_role'
    },
    
    // Issuer
    issuer: 'supabase'
};

// ============================================
// Helper Functions
// ============================================

/**
 * สร้าง random string สำหรับ JWT Secret
 */
function generateSecret(length = 64) {
    return crypto.randomBytes(length).toString('base64').slice(0, length);
}

/**
 * Base64 URL encode
 */
function base64UrlEncode(str) {
    return Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * สร้าง JWT Token แบบ manual (ไม่ต้องใช้ library)
 */
function createJWT(payload, secret) {
    // Header
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };
    
    // Encode header and payload
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    
    // Create signature
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto
        .createHmac('sha256', secret)
        .update(signatureInput)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * สร้าง Supabase API Key
 */
function generateSupabaseKey(role, secret) {
    // Calculate expiry (10 years from now)
    const exp = Math.floor(Date.now() / 1000) + (CONFIG.expiryYears * 365 * 24 * 60 * 60);
    
    const payload = {
        role: role,
        iss: CONFIG.issuer,
        iat: Math.floor(Date.now() / 1000),
        exp: exp
    };
    
    return createJWT(payload, secret);
}

/**
 * สร้าง Secret Key Base สำหรับ Realtime
 */
function generateSecretKeyBase() {
    return crypto.randomBytes(64).toString('base64');
}

// ============================================
// Main
// ============================================
function main() {
    console.log('');
    console.log('============================================');
    console.log('🔐 Supabase JWT Key Generator');
    console.log('============================================');
    console.log('');
    
    // Generate secrets
    const jwtSecret = generateSecret(64);
    const postgresPassword = generateSecret(32);
    const secretKeyBase = generateSecretKeyBase();
    
    // Generate keys
    const anonKey = generateSupabaseKey(CONFIG.roles.anon, jwtSecret);
    const serviceRoleKey = generateSupabaseKey(CONFIG.roles.serviceRole, jwtSecret);
    
    console.log('📋 Copy ค่าเหล่านี้ไปวางใน .env.production:');
    console.log('');
    console.log('============================================');
    console.log('# Database');
    console.log('============================================');
    console.log(`POSTGRES_PASSWORD=${postgresPassword}`);
    console.log('');
    console.log('============================================');
    console.log('# JWT Configuration');
    console.log('============================================');
    console.log(`JWT_SECRET=${jwtSecret}`);
    console.log('');
    console.log('============================================');
    console.log('# Supabase API Keys');
    console.log('============================================');
    console.log(`ANON_KEY=${anonKey}`);
    console.log('');
    console.log(`SERVICE_ROLE_KEY=${serviceRoleKey}`);
    console.log('');
    console.log('============================================');
    console.log('# Realtime Configuration');
    console.log('============================================');
    console.log(`SECRET_KEY_BASE=${secretKeyBase}`);
    console.log('');
    console.log('============================================');
    console.log('');
    console.log('⚠️  สำคัญ:');
    console.log('   - อย่า commit ค่าเหล่านี้ขึ้น git!');
    console.log('   - เก็บ backup ไว้ที่ปลอดภัย');
    console.log('   - SERVICE_ROLE_KEY มีสิทธิ์เต็ม อย่าใช้บน client!');
    console.log('');
    console.log('============================================');
    console.log('✅ Generate เสร็จสมบูรณ์!');
    console.log('============================================');
    console.log('');
}

// Run
main();
