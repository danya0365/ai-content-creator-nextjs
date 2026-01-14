/**
 * useSettingsPresenter
 * Custom hook for Settings presenter
 * ✅ All logic moved from View to Hook following CREATE_PAGE_PATTERN.md
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppSettings, SettingsPresenter, SettingsViewModel, UserProfile } from './SettingsPresenter';
import { createClientSettingsPresenter } from './SettingsPresenterClientFactory';

// ✅ Re-export UserProfile type from Presenter for Single Source of Truth
export type { UserProfile } from './SettingsPresenter';

export interface SettingsPresenterState {
  viewModel: SettingsViewModel | null;
  loading: boolean;
  error: string | null;
  // Settings form state
  settings: AppSettings;
  isSaving: boolean;
  showApiKey: boolean;
  // ✅ User profile from viewModel (Single Source of Truth)
  userProfile: UserProfile | null;
}

export interface SettingsPresenterActions {
  loadData: () => Promise<void>;
  setError: (error: string | null) => void;
  refresh: () => Promise<void>;
  // Settings actions
  updateSettings: (updates: Partial<AppSettings>) => void;
  updateNotification: (key: keyof AppSettings['notifications'], value: boolean) => void;
  saveSettings: () => Promise<void>;
  toggleApiKeyVisibility: () => void;
  clearAllData: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  geminiApiKey: '',
  autoSchedule: true,
  defaultTimeSlot: 'morning',
  contentQuality: 'high',
  language: 'th',
  notifications: {
    onGenerate: true,
    onPublish: true,
    onSchedule: true,
  },
};

export function useSettingsPresenter(
  initialViewModel?: SettingsViewModel,
  presenterOverride?: SettingsPresenter
): [SettingsPresenterState, SettingsPresenterActions] {
  // ✅ Create presenter inside hook with useMemo
  // Accept override for easier testing (Dependency Injection)
  const presenter = useMemo(
    () => presenterOverride ?? createClientSettingsPresenter(),
    [presenterOverride]
  );

  const [viewModel, setViewModel] = useState<SettingsViewModel | null>(initialViewModel || null);
  const [loading, setLoading] = useState(!initialViewModel);
  const [error, setError] = useState<string | null>(null);
  
  // Settings form state (moved from View)
  const [settings, setSettings] = useState<AppSettings>(
    initialViewModel?.settings || defaultSettings
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const newViewModel = await presenter.getViewModel();
      setViewModel(newViewModel);
      setSettings(newViewModel.settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [presenter]);

  const refresh = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Update settings partially
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  // Update notification settings
  const updateNotification = useCallback(
    (key: keyof AppSettings['notifications'], value: boolean) => {
      setSettings((prev) => ({
        ...prev,
        notifications: { ...prev.notifications, [key]: value },
      }));
    },
    []
  );

  // Save settings
  const saveSettings = useCallback(async () => {
    setIsSaving(true);
    try {
      // In production, save to database/localStorage
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Settings saved:', settings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  // Toggle API key visibility
  const toggleApiKeyVisibility = useCallback(() => {
    setShowApiKey((prev) => !prev);
  }, []);

  // Clear all data (danger zone)
  const clearAllData = useCallback(async () => {
    // In production, implement data clearing
    console.log('Clearing all data...');
  }, []);

  useEffect(() => {
    if (!initialViewModel) {
      loadData();
    }
  }, [initialViewModel, loadData]);

  return [
    {
      viewModel,
      loading,
      error,
      settings,
      isSaving,
      showApiKey,
      userProfile: viewModel?.userProfile || null, // ✅ Single Source of Truth
    },
    {
      loadData,
      setError,
      refresh,
      updateSettings,
      updateNotification,
      saveSettings,
      toggleApiKeyVisibility,
      clearAllData,
    },
  ];
}
