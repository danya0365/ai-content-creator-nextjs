import { AuthProfile, UpdateProfileData } from '@/src/application/repositories/IAuthRepository';
import { IProfileRepository } from '@/src/application/repositories/IProfileRepository';

export class ProfilePresenter {
  constructor(private readonly repository: IProfileRepository) {}

  async getProfiles(): Promise<AuthProfile[]> {
    try {
      return await this.repository.getProfiles();
    } catch (error) {
      console.error('Get profiles error:', error);
      return [];
    }
  }

  async getProfile(id: string): Promise<AuthProfile | null> {
    try {
      return await this.repository.getProfile(id);
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  }

  async createProfile(data: { username: string; fullName?: string; avatarUrl?: string }): Promise<AuthProfile | null> {
    try {
      return await this.repository.createProfile(data);
    } catch (error) {
      console.error('Create profile error:', error);
      return null;
    }
  }
  
  async updateProfile(id: string, data: UpdateProfileData): Promise<AuthProfile> {
    return await this.repository.updateProfile(id, data);
  }

  async switchProfile(profileId: string): Promise<boolean> {
    try {
      return await this.repository.switchProfile(profileId);
    } catch (error) {
      console.error('Switch profile error:', error);
      return false;
    }
  }
}
