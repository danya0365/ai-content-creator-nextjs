'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useAuthPresenter } from '../../presenters/auth/useAuthPresenter';
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
];

/**
 * MainHeader component
 * Fixed header with navigation and theme toggle
 */
export function MainHeader() {
  const [{ isAuthenticated, profile }, { signOut }] = useAuthPresenter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="relative z-50 h-16 px-6 flex items-center justify-between border-b border-border/30 bg-surface/30 backdrop-blur-xl">
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
        {isAuthenticated ? (
          <div className="hidden md:flex items-center gap-2">
            <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/50 border border-border/50 hover:bg-surface transition-colors">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs overflow-hidden">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  '👤'
                )}
              </div>
              <span className="text-sm font-medium">{profile?.username || 'User'}</span>
            </Link>
            <button onClick={() => signOut()} className="px-3 py-1.5 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
              ออกจากระบบ
            </button>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2">
            <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-foreground hover:bg-surface/50 rounded-lg transition-colors">
              เข้าสู่ระบบ
            </Link>
            <Link href="/auth/register" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              สมัครสมาชิก
            </Link>
          </div>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Mobile menu button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden w-10 h-10 rounded-xl bg-surface/50 backdrop-blur-sm border border-border/50 flex items-center justify-center text-muted hover:text-foreground transition-colors"
        >
          {isMobileMenuOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-surface/95 backdrop-blur-xl border-b border-border/30 p-4 flex flex-col gap-4 md:hidden shadow-xl z-50">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-base font-medium text-foreground hover:bg-surface/50 transition-all flex items-center gap-3"
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="h-px w-full bg-border/30 my-1" />

          {/* Auth Section - Mobile */}
          {isAuthenticated ? (
            <div className="flex flex-col gap-2">
              <Link 
                href="/profile" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface/50 border border-border/50 hover:bg-surface transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg overflow-hidden shrink-0">
                  {profile?.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    '👤'
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted">เข้าสู่ระบบในชื่อ</span>
                  <span className="text-sm font-medium">{profile?.username || 'User'}</span>
                </div>
              </Link>
              <button 
                onClick={() => { signOut(); setIsMobileMenuOpen(false); }} 
                className="w-full px-4 py-3 mt-1 text-center text-sm font-medium text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors"
              >
                ออกจากระบบ
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link 
                href="/auth/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full px-4 py-3 text-center text-sm font-medium text-foreground hover:bg-surface/50 border border-border/50 rounded-xl transition-colors"
              >
                เข้าสู่ระบบ
              </Link>
              <Link 
                href="/auth/register" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full px-4 py-3 text-center text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                สมัครสมาชิก
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
