/**
 * ApiProfileRepository
 * Implements IProfileRepository using API calls instead of direct Supabase connection
 * 
 * ✅ For use in CLIENT-SIDE components only
 * ✅ No connection pool issues - calls go through Next.js API routes
 * ✅ Secure - no Supabase credentials exposed to client
 */

'use client';

import { AuthProfile, UpdateProfileData } from '@/src/application/repositories/IAuthRepository';
import { IProfileRepository } from '@/src/application/repositories/IProfileRepository';

export class ApiProfileRepository implements IProfileRepository {
  private baseUrl = '/api/profiles';

  async getProfiles(): Promise<AuthProfile[]> {
    const res = await fetch(this.baseUrl);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'ไม่สามารถโหลดข้อมูลได้');
    }
    
    return res.json();
  }

  async getProfile(id: string): Promise<AuthProfile | null> {
    const res = await fetch(`${this.baseUrl}/${id}`);
    
    if (res.status === 404) return null;
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'ไม่สามารถโหลดข้อมูลได้');
    }
    
    return res.json();
  }

  async createProfile(data: { username: string; fullName?: string; avatarUrl?: string }): Promise<AuthProfile | null> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'ไม่สามารถสร้างข้อมูลได้');
    }
    
    return res.json();
  }

  async updateProfile(id: string, data: UpdateProfileData): Promise<AuthProfile> {
    const res = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'ไม่สามารถอัปเดตข้อมูลได้');
    }
    
    return res.json();
  }

  async switchProfile(profileId: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/${profileId}/switch`, {
      method: 'PUT',
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'ไม่สามารถสลับโปรไฟล์ได้');
    }
    
    return res.json();
  }

  /**
   * Get the primary admin profile (Not intended for client-side API usage)
   */
  async getAdminProfile(): Promise<AuthProfile | null> {
    throw new Error('getAdminProfile is only available on server-side');
  }
}
