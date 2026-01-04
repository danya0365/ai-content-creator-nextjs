'use client';

import Link from 'next/link';
import { ThemeToggle } from '../ui/ThemeToggle';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Timeline', href: '/timeline', icon: '📜' },
  { label: 'Gallery', href: '/gallery', icon: '🖼️' },
  { label: 'Schedule', href: '/schedule', icon: '📅' },
  { label: 'Settings', href: '/settings', icon: '⚙️' },
];

/**
 * MainHeader component
 * Fixed header with navigation and theme toggle
 */
export function MainHeader() {
  return (
    <header className="h-16 px-6 flex items-center justify-between border-b border-border/30 bg-surface/30 backdrop-blur-xl">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-shadow duration-300">
          <span className="text-xl">🎨</span>
          {/* Pixel art corner accent */}
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-cyan-400 rounded-sm" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
            AI Content
          </span>
          <span className="text-xs text-muted -mt-1">Pixel Art Creator</span>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="hidden md:flex items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-surface/50 transition-all duration-200 flex items-center gap-2"
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Generate button */}
        <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300">
          <span>✨</span>
          <span>Generate</span>
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Mobile menu button */}
        <button className="md:hidden w-10 h-10 rounded-xl bg-surface/50 backdrop-blur-sm border border-border/50 flex items-center justify-center text-muted hover:text-foreground transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}
