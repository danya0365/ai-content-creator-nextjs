'use client';

import { ToastProvider as ToastProviderBase } from './Toast';

/**
 * ClientProviders - Client-side providers wrapper
 * Used to wrap client components in the root layout
 */
export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <ToastProviderBase>{children}</ToastProviderBase>;
}
