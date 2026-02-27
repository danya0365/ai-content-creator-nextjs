/**
 * IProfileRepository
 * Repository interface for Profile data access
 * Following Clean Architecture - Application layer
 */

import { AuthProfile, UpdateProfileData } from './IAuthRepository';

export interface ProfileStats {
  totalProfiles: number;
  activeProfiles: number;
  inactiveProfiles: number;
}

export interface IProfileRepository {
  /**
   * Get all profiles for the current user
   */
  getProfiles(): Promise<AuthProfile[]>;

  /**
   * Get specific profile by ID
   */
  getProfile(id: string): Promise<AuthProfile | null>;

  /**
   * Create a new profile for the current user
   */
  createProfile(data: { username: string; fullName?: string; avatarUrl?: string }): Promise<AuthProfile | null>;

  /**
   * Update an existing profile
   */
  updateProfile(id: string, data: UpdateProfileData): Promise<AuthProfile>;

  /**
   * Switch the active profile
   */
  switchProfile(profileId: string): Promise<boolean>;

  /**
   * Get profile statistics
   */
  getStats?(): Promise<ProfileStats>;
}
