'use client';

import { AuthProfile, UpdateProfileData } from '@/src/application/repositories/IAuthRepository';
import { useCallback, useMemo, useState } from 'react';
import { useAuthStore } from '../../stores/auth-store';
import { ProfilePresenter } from './ProfilePresenter';
import { createClientProfilePresenter } from './ProfilePresenterClientFactory';

export interface ProfilePresenterState {
  profiles: AuthProfile[];
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  isSubmitting: boolean;
}

export interface ProfilePresenterActions {
  getProfiles: () => Promise<AuthProfile[]>;
  switchProfile: (profileId: string) => Promise<boolean>;
  createProfile: (data: { username: string; fullName?: string; avatarUrl?: string }) => Promise<boolean>;
  updateProfile: (id: string, data: UpdateProfileData) => Promise<boolean>;
  clearError: () => void;
  clearSuccessMessage: () => void;
}

export function useProfilePresenter(presenterOverride?: ProfilePresenter): [ProfilePresenterState, ProfilePresenterActions] {
  const presenter = useMemo(
    () => presenterOverride ?? createClientProfilePresenter(),
    [presenterOverride]
  );
  
  const { profiles } = useAuthStore();
  
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getProfiles = useCallback(async (): Promise<AuthProfile[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await presenter.getProfiles();
      useAuthStore.getState().setProfiles(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดโปรไฟล์';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [presenter]);

  const switchProfile = useCallback(async (profileId: string): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const success = await presenter.switchProfile(profileId);
      if (success) {
        // Update active profile in auth-store immediately for reactive UI
        const store = useAuthStore.getState();
        const switchedProfile = store.profiles.find((p) => p.id === profileId);
        if (switchedProfile) {
          store.setProfile(switchedProfile);
        }
        setSuccessMessage('สลับโปรไฟล์สำเร็จ');
        return true;
      } else {
        setError('เกิดข้อผิดพลาดในการสลับโปรไฟล์');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
      setError(errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [presenter]);

  const createProfile = useCallback(async (data: { username: string; fullName?: string; avatarUrl?: string }): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const newProfile = await presenter.createProfile(data);
      if (newProfile) {
        setSuccessMessage('สร้างโปรไฟล์ใหม่สำเร็จ');
        await getProfiles(); 
        return true;
      } else {
        setError('เกิดข้อผิดพลาดในการสร้างโปรไฟล์');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
      setError(errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [presenter, getProfiles]);
  
  const updateProfile = useCallback(async (id: string, data: UpdateProfileData): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const updatedProfile = await presenter.updateProfile(id, data);
      setSuccessMessage('อัปเดตโปรไฟล์สำเร็จ');
      
      // Update store for the specific profile
      const userStore = useAuthStore.getState();
      if (userStore.profile?.id === id) {
        userStore.setProfile(updatedProfile);
      }
      await getProfiles();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
      setError(errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [presenter, getProfiles]);

  const clearError = useCallback(() => setError(null), []);
  const clearSuccessMessage = useCallback(() => setSuccessMessage(null), []);

  const state: ProfilePresenterState = useMemo(() => ({
    profiles,
    isLoading,
    error,
    successMessage,
    isSubmitting,
  }), [profiles, isLoading, error, successMessage, isSubmitting]);

  const actions: ProfilePresenterActions = useMemo(() => ({
    getProfiles,
    switchProfile,
    createProfile,
    updateProfile,
    clearError,
    clearSuccessMessage,
  }), [getProfiles, switchProfile, createProfile, updateProfile, clearError, clearSuccessMessage]);

  return [state, actions];
}
