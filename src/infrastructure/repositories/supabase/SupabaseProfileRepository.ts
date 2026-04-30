/**
 * SupabaseProfileRepository
 * Implementation of IProfileRepository using Supabase
 * Following Clean Architecture - Infrastructure layer
 * 
 * ✅ For SERVER-SIDE use only (API Routes, Server Components)
 * ❌ Do NOT use in Client Components directly
 */

import { AuthProfile, UpdateProfileData } from '@/src/application/repositories/IAuthRepository';
import { IProfileRepository } from '@/src/application/repositories/IProfileRepository';
import { Database } from '@/src/domain/types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';

export class SupabaseProfileRepository implements IProfileRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  private mapProfile = (profile: any): AuthProfile => {
    const preferences = profile.preferences as { language?: string; notifications?: boolean; theme?: string } || {};
    
    return {
      id: profile.id,
      authId: profile.auth_id,
      username: profile.username || undefined,
      fullName: profile.full_name || undefined,
      phone: profile.phone || undefined,
      avatarUrl: profile.avatar_url || undefined,
      dateOfBirth: profile.date_of_birth || undefined,
      gender: profile.gender as 'male' | 'female' | 'other' | undefined,
      address: profile.address || undefined,
      bio: profile.bio || undefined,
      preferences: {
        language: preferences.language || 'th',
        notifications: preferences.notifications ?? true,
        theme: (preferences.theme as 'light' | 'dark' | 'auto') || 'auto',
      },
      privacySettings: (profile.privacy_settings as Record<string, unknown>) || undefined,
      socialLinks: (profile.social_links as Record<string, string>) || undefined,
      verificationStatus: profile.verification_status as 'pending' | 'verified' | 'rejected',
      role: (profile.profile_roles?.role || profile.role || 'user') as 'user' | 'moderator' | 'admin',
      isActive: profile.is_active,
      lastLogin: profile.last_login || undefined,
      loginCount: profile.login_count ?? 0,
      createdAt: profile.created_at || dayjs().toISOString(),
      updatedAt: profile.updated_at || dayjs().toISOString(),
    };
  };

  async getProfiles(): Promise<AuthProfile[]> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return [];

    // Fetch all profiles for the user with roles
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*, profile_roles(role)')
      .eq('auth_id', user.id);

    if (error) {
      console.error('Error fetching profiles with roles:', error);
      return [];
    }

    if (!data) return [];
    return data.map((profile: any) => this.mapProfile(profile));
  }

  async getProfile(id: string): Promise<AuthProfile | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await this.supabase
      .from('profiles')
      .select('*, profile_roles(role)')
      .eq('id', id)
      .eq('auth_id', user.id)
      .single();

    if (error || !data) return null;
    return this.mapProfile(data);
  }

  async createProfile(data: { username: string; fullName?: string; avatarUrl?: string }): Promise<AuthProfile | null> {
    const { data: profileId, error } = await this.supabase.rpc('create_profile', {
      username: data.username,
      full_name: data.fullName,
      avatar_url: data.avatarUrl,
    });

    if (error) {
        console.error('RPC create_profile error:', error);
        return null;
    }

    if (profileId) {
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('*, profile_roles(role)')
        .eq('id', profileId)
        .single();
        
      if (profile) return this.mapProfile(profile);
    }
    return null;
  }

  async updateProfile(id: string, data: UpdateProfileData): Promise<AuthProfile> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('ไม่พบผู้ใช้');

    const updateData: Partial<Database['public']['Tables']['profiles']['Update']> = {};

    if (data.username !== undefined) updateData.username = data.username;
    if (data.fullName !== undefined) updateData.full_name = data.fullName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;
    if (data.dateOfBirth !== undefined) updateData.date_of_birth = data.dateOfBirth;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.bio !== undefined) updateData.bio = data.bio;

    if (data.preferences) {
      updateData.preferences = data.preferences as unknown as Database['public']['Tables']['profiles']['Update']['preferences'];
    }

    if (data.privacySettings) {
      updateData.privacy_settings = data.privacySettings as unknown as Database['public']['Tables']['profiles']['Update']['privacy_settings'];
    }

    if (data.socialLinks) {
      updateData.social_links = data.socialLinks as unknown as Database['public']['Tables']['profiles']['Update']['social_links'];
    }

    const { data: profile, error } = await this.supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .eq('auth_id', user.id)
      .select('*, profile_roles(role)')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return this.mapProfile(profile);
  }

  async switchProfile(profileId: string): Promise<boolean> {
    const { error } = await this.supabase.rpc('set_profile_active', {
      profile_id: profileId,
    });

    if (error) {
      console.error('RPC set_profile_active error:', error);
      return false;
    }
    return true;
  }

  /**
   * Get the primary admin profile (for system attribution)
   */
  async getAdminProfile(): Promise<AuthProfile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*, profile_roles(role)')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (error || !data) {
      // Try fallback if 'role' column is not directly on profiles
      const { data: fallbackData, error: fallbackError } = await this.supabase
        .from('profiles')
        .select('*, profile_roles!inner(role)')
        .eq('profile_roles.role', 'admin')
        .limit(1)
        .single();
        
      if (fallbackError || !fallbackData) {
        console.error('[SupabaseProfileRepository] Error fetching admin profile:', error || fallbackError);
        return null;
      }
      return this.mapProfile(fallbackData);
    }

    return this.mapProfile(data);
  }
}
