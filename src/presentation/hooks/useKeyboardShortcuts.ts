'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useGenerateStore } from '../stores/useGenerateStore';

interface KeyboardShortcut {
  key: string;
  modifiers?: ('ctrl' | 'shift' | 'alt' | 'meta')[];
  action: () => void;
  description: string;
  category: string;
}

/**
 * useKeyboardShortcuts - Global keyboard shortcuts hook
 */
export function useKeyboardShortcuts() {
  const router = useRouter();
  const { openModal } = useGenerateStore();
  const [showHelp, setShowHelp] = useState(false);

  const shortcuts: KeyboardShortcut[] = [
    // Navigation
    { key: 'g', modifiers: [], action: () => {}, description: 'Go to... (then press key)', category: 'Navigation' },
    { key: 'd', modifiers: [], action: () => router.push('/dashboard'), description: 'Dashboard', category: 'Navigation (after G)' },
    { key: 'a', modifiers: [], action: () => router.push('/analytics'), description: 'Analytics', category: 'Navigation (after G)' },
    { key: 's', modifiers: [], action: () => router.push('/schedule'), description: 'Schedule', category: 'Navigation (after G)' },
    { key: 'l', modifiers: [], action: () => router.push('/gallery'), description: 'Gallery', category: 'Navigation (after G)' },
    { key: 't', modifiers: [], action: () => router.push('/settings'), description: 'Settings', category: 'Navigation (after G)' },
    
    // Actions
    { key: 'n', modifiers: [], action: openModal, description: 'New content', category: 'Actions' },
    { key: '?', modifiers: ['shift'], action: () => setShowHelp(true), description: 'Show help', category: 'Help' },
    { key: 'Escape', modifiers: [], action: () => setShowHelp(false), description: 'Close dialogs', category: 'General' },
  ];

  const [awaitingSecondKey, setAwaitingSecondKey] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Skip if focused on input/textarea
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLSelectElement
    ) {
      return;
    }

    const key = e.key.toLowerCase();

    // Handle "G" prefix for navigation
    if (awaitingSecondKey) {
      setAwaitingSecondKey(false);
      
      switch (key) {
        case 'd':
          router.push('/dashboard');
          break;
        case 'a':
          router.push('/analytics');
          break;
        case 's':
          router.push('/schedule');
          break;
        case 'l':
          router.push('/gallery');
          break;
        case 't':
          router.push('/settings');
          break;
      }
      return;
    }

    // Handle single key shortcuts
    switch (key) {
      case 'g':
        setAwaitingSecondKey(true);
        setTimeout(() => setAwaitingSecondKey(false), 1000); // Reset after 1s
        break;
      case 'n':
        e.preventDefault();
        openModal();
        break;
      case '?':
        if (e.shiftKey) {
          e.preventDefault();
          setShowHelp(true);
        }
        break;
      case 'escape':
        setShowHelp(false);
        break;
    }
  }, [awaitingSecondKey, router, openModal]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    shortcuts,
    showHelp,
    setShowHelp,
    awaitingSecondKey,
  };
}
