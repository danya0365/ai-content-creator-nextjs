/**
 * MockProfileRepository
 * Mock implementation for development and testing
 * Following Clean Architecture - Infrastructure layer
 */

import { AuthProfile, UpdateProfileData } from '@/src/application/repositories/IAuthRepository';
import { IProfileRepository, ProfileStats } from '@/src/application/repositories/IProfileRepository';
import dayjs from 'dayjs';

const MOCK_PROFILES: AuthProfile[] = [
  {
    id: 'profile-001',
    authId: 'auth-001',
    username: 'mock_user_1',
    fullName: 'Mock User One',
    isActive: true,
    verificationStatus: 'verified',
    preferences: { language: 'th', notifications: true, theme: 'auto' },
    loginCount: 1,
    createdAt: dayjs().toISOString(),
    updatedAt: dayjs().toISOString(),
  },
  {
    id: 'profile-002',
    authId: 'auth-001',
    username: 'mock_user_2',
    fullName: 'Mock User Two',
    isActive: false,
    verificationStatus: 'verified',
    preferences: { language: 'en', notifications: false, theme: 'dark' },
    loginCount: 1,
    createdAt: dayjs().toISOString(),
    updatedAt: dayjs().toISOString(),
  }
];

export class MockProfileRepository implements IProfileRepository {
  private items: AuthProfile[] = [...MOCK_PROFILES];

  async getProfiles(): Promise<AuthProfile[]> {
    await this.delay(100);
    return [...this.items];
  }

  async getProfile(id: string): Promise<AuthProfile | null> {
    await this.delay(100);
    return this.items.find((item) => item.id === id) || null;
  }

  async createProfile(data: { username: string; fullName?: string; avatarUrl?: string }): Promise<AuthProfile | null> {
    await this.delay(200);

    const newItem: AuthProfile = {
      id: `profile-${dayjs().valueOf()}`,
      authId: 'auth-001',
      username: data.username,
      fullName: data.fullName,
      avatarUrl: data.avatarUrl,
      isActive: false,
      verificationStatus: 'verified',
      preferences: { language: 'th', notifications: true, theme: 'auto' },
      loginCount: 1,
      createdAt: dayjs().toISOString(),
      updatedAt: dayjs().toISOString(),
    };

    this.items.push(newItem);
    return newItem;
  }

  async updateProfile(id: string, data: UpdateProfileData): Promise<AuthProfile> {
    await this.delay(200);

    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error('Profile not found');
    }

    const updatedItem = {
      ...this.items[index],
      ...data,
      updatedAt: dayjs().toISOString(),
    } as AuthProfile;

    if (data.preferences) {
      updatedItem.preferences = { ...this.items[index].preferences, ...data.preferences } as typeof updatedItem.preferences;
    }

    this.items[index] = updatedItem;
    return updatedItem;
  }

  async switchProfile(profileId: string): Promise<boolean> {
    await this.delay(200);
    
    const index = this.items.findIndex((item) => item.id === profileId);
    if (index === -1) return false;

    // Set all to inactive
    this.items = this.items.map(item => ({ ...item, isActive: false }));
    
    // Set selected to active
    this.items[index].isActive = true;
    
    return true;
  }

  async getStats(): Promise<ProfileStats> {
    await this.delay(100);

    const total = this.items.length;
    const active = this.items.filter((item) => item.isActive).length;

    return {
      totalProfiles: total,
      activeProfiles: active,
      inactiveProfiles: total - active,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const mockProfileRepository = new MockProfileRepository();
