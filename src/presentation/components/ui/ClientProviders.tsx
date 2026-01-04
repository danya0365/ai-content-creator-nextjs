'use client';

import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { OnboardingModal } from '../onboarding/OnboardingModal';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { ToastProvider as ToastProviderBase } from './Toast';

/**
 * KeyboardShortcutsProvider - Enables global keyboard shortcuts
 */
function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const { showHelp, setShowHelp } = useKeyboardShortcuts();

  return (
    <>
      {children}
      <KeyboardShortcutsModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
}

/**
 * ClientProviders - Client-side providers wrapper
 * Used to wrap client components in the root layout
 */
export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProviderBase>
      <KeyboardShortcutsProvider>
        {children}
        <OnboardingModal />
      </KeyboardShortcutsProvider>
    </ToastProviderBase>
  );
}
