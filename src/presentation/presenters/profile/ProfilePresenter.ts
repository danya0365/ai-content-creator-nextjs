import { AuthProfile, UpdateProfileData } from '@/src/application/repositories/IAuthRepository';
import { IProfileRepository } from '@/src/application/repositories/IProfileRepository';

export class ProfilePresenter {
  constructor(private readonly repository: IProfileRepository) {}

  async getProfiles(): Promise<AuthProfile[]> {
    try {
      return await this.repository.getProfiles();
    } catch (error) {
      console.error('[ProfilePresenter] Get profiles error:', error);
      return [];
    }
  }

  async getProfile(id: string): Promise<AuthProfile | null> {
    try {
      return await this.repository.getProfile(id);
    } catch (error) {
      console.error('[ProfilePresenter] Get profile error:', error);
      return null;
    }
  }

  async createProfile(data: { username: string; fullName?: string; avatarUrl?: string }): Promise<AuthProfile | null> {
    try {
      return await this.repository.createProfile(data);
    } catch (error) {
      console.error('[ProfilePresenter] Create profile error:', error);
      return null;
    }
  }
  
  async updateProfile(id: string, data: UpdateProfileData): Promise<AuthProfile> {
    try {
      return await this.repository.updateProfile(id, data);
    } catch (error) {
      console.error('[ProfilePresenter] Update profile error:', error);
      throw error;
    }
  }

  async switchProfile(profileId: string): Promise<boolean> {
    try {
      return await this.repository.switchProfile(profileId);
    } catch (error) {
      console.error('[ProfilePresenter] Switch profile error:', error);
      return false;
    }
  }

  /**
   * Identifies the primary admin profile (used for system triggers/attribution)
   */
  async getAdminProfile(): Promise<{ id: string; name: string } | null> {
    try {
      const profile = await this.repository.getAdminProfile();
      if (!profile) return null;
      return { id: profile.id, name: profile.fullName || 'System Admin' };
    } catch (error) {
      console.error('[ProfilePresenter] Error fetching admin profile:', error);
      return null;
    }
  }
}
