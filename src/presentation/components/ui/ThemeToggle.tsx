'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * ThemeToggle component
 * Switches between light and dark mode with animated icons
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="w-10 h-10 rounded-xl bg-surface/50 backdrop-blur-sm border border-border/50 flex items-center justify-center"
        aria-label="Toggle theme"
      >
        <div className="w-5 h-5 bg-muted/30 rounded-full animate-pulse" />
      </button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="group relative w-10 h-10 rounded-xl bg-surface/50 backdrop-blur-sm border border-border/50 
                 hover:border-border hover:bg-surface/80 transition-all duration-300
                 flex items-center justify-center overflow-hidden"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Sun Icon */}
      <svg
        className={`w-5 h-5 text-yellow-500 absolute transition-all duration-500 ease-out
                    ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>

      {/* Moon Icon */}
      <svg
        className={`w-5 h-5 text-indigo-400 absolute transition-all duration-500 ease-out
                    ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
      </svg>

      {/* Hover glow effect */}
      <div
        className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
                    ${isDark ? 'bg-indigo-500/10' : 'bg-yellow-500/10'}`}
      />
    </button>
  );
}
