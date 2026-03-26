'use client';

import { useEffect, useRef, useState } from 'react';

import Link from 'next/link';
import { useAuthPresenter } from '../../presenters/auth/useAuthPresenter';
import { useProfilePresenter } from '../../presenters/profile/useProfilePresenter';
import { ThemeToggle } from '../ui/ThemeToggle';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Timeline', href: '/timeline', icon: '📜' },
  { label: 'Trends', href: '/trends', icon: '🔥' },
  { label: 'Gallery', href: '/gallery', icon: '🖼️' },
  { label: 'Schedule', href: '/schedule', icon: '📅' },
];

// ─── Inline SVG Icons ───────────────────────────────────────────
function IconChevronDown({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function IconUser({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function IconSwitch({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  );
}

function IconLogout({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}

function IconSettings({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconCheck({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

/**
 * MainHeader component
 * Fixed header with navigation, theme toggle, and profile dropdown
 */
export function MainHeader() {
  const [{ isAuthenticated, profile }, { signOut }] = useAuthPresenter();
  const [profileState, profileActions] = useProfilePresenter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch profiles when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && isAuthenticated && profileState.profiles.length === 0) {
      profileActions.getProfiles();
    }
  }, [isDropdownOpen, isAuthenticated, profileState.profiles.length, profileActions]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  // Close dropdown on Escape
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsDropdownOpen(false);
    }
    if (isDropdownOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isDropdownOpen]);

  const otherProfiles = profileState.profiles.filter((p) => p.id !== profile?.id);

  const handleSwitch = async (profileId: string) => {
    await profileActions.switchProfile(profileId);
    setIsDropdownOpen(false);
  };

  // ──── Quick-link items for dropdown ────
  const DROPDOWN_LINKS = [
    { label: 'โปรไฟล์', href: '/profile', icon: <IconUser className="w-4 h-4" /> },
    { label: 'ตั้งค่า', href: '/settings', icon: <IconSettings className="w-4 h-4" /> },
  ];

  return (
    <header className="relative z-50 h-16 px-6 flex items-center justify-between border-b border-border/30 bg-surface/30 backdrop-blur-xl">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-shadow duration-300">
          <span className="text-xl">🎨</span>
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
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />

        {isAuthenticated ? (
          /* ──── Compact Profile Dropdown ──── */
          <div ref={dropdownRef} className="relative">
            {/* Trigger button */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`
                flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full
                border transition-all duration-200 cursor-pointer
                ${isDropdownOpen
                  ? 'bg-surface border-primary/40 shadow-lg shadow-primary/10'
                  : 'bg-surface/50 border-border/50 hover:bg-surface hover:border-border'}
              `}
            >
              {/* Avatar */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center text-xs overflow-hidden ring-2 ring-violet-500/20 flex-shrink-0">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <IconUser className="w-4 h-4 text-violet-400" />
                )}
              </div>
              {/* Name - desktop only */}
              <span className="hidden md:inline text-sm font-medium text-foreground max-w-[100px] truncate">
                {profile?.username || 'User'}
              </span>
              {/* Chevron */}
              <IconChevronDown className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* ──── Dropdown Menu ──── */}
            {isDropdownOpen && (
              <div
                className="absolute right-0 top-[calc(100%+6px)] w-72 rounded-2xl border border-border/50 bg-surface/95 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden"
                style={{ animation: 'fadeSlideIn 150ms ease-out' }}
              >
                {/* Active profile header */}
                <div className="p-4 border-b border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center overflow-hidden ring-2 ring-violet-500/20 flex-shrink-0">
                      {profile?.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <IconUser className="w-5 h-5 text-violet-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-foreground truncate">
                        {profile?.fullName || profile?.username || 'User'}
                      </div>
                      <div className="text-xs text-muted truncate">@{profile?.username || 'user'}</div>
                    </div>
                    <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </div>
                </div>

                {/* Switch profiles */}
                {otherProfiles.length > 0 && (
                  <div className="p-2 border-b border-border/30">
                    <div className="px-2 py-1.5 text-[10px] font-semibold text-muted uppercase tracking-wider">
                      สลับโปรไฟล์
                    </div>
                    {otherProfiles.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSwitch(p.id)}
                        disabled={profileState.isSubmitting}
                        className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-left hover:bg-surface/80 transition-colors group cursor-pointer disabled:opacity-50"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center overflow-hidden border border-border/50 flex-shrink-0">
                          {p.avatarUrl ? (
                            <img src={p.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <IconUser className="w-4 h-4 text-muted" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate group-hover:text-violet-500 transition-colors">
                            {p.fullName || p.username || 'Unknown'}
                          </div>
                          <div className="text-xs text-muted truncate">@{p.username || 'no-username'}</div>
                        </div>
                        <IconSwitch className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick links */}
                <div className="p-2 border-b border-border/30">
                  {DROPDOWN_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-2 py-2 rounded-xl text-sm text-foreground hover:bg-surface/80 transition-colors"
                    >
                      <span className="text-muted">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Sign out */}
                <div className="p-2">
                  <button
                    onClick={() => { signOut(); setIsDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <IconLogout className="w-4 h-4" />
                    ออกจากระบบ
                  </button>
                </div>
              </div>
            )}
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
              {/* Active profile */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface/50 border border-border/50">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center overflow-hidden ring-2 ring-violet-500/20 flex-shrink-0">
                  {profile?.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <IconUser className="w-5 h-5 text-violet-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">{profile?.fullName || profile?.username || 'User'}</div>
                  <div className="text-xs text-muted truncate">@{profile?.username || 'user'}</div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-500">
                  Active
                </span>
              </div>

              {/* Switch profiles - mobile */}
              {otherProfiles.length > 0 && (
                <div className="space-y-1">
                  <div className="px-4 text-[10px] font-semibold text-muted uppercase tracking-wider">สลับโปรไฟล์</div>
                  {otherProfiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { handleSwitch(p.id); setIsMobileMenuOpen(false); }}
                      disabled={profileState.isSubmitting}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-surface/50 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center overflow-hidden border border-border/50 flex-shrink-0">
                        {p.avatarUrl ? (
                          <img src={p.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <IconUser className="w-4 h-4 text-muted" />
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{p.fullName || p.username || 'Unknown'}</div>
                        <div className="text-xs text-muted truncate">@{p.username || 'no-username'}</div>
                      </div>
                      <IconSwitch className="w-4 h-4 text-muted" />
                    </button>
                  ))}
                </div>
              )}

              {/* Quick links - mobile */}
              <div className="h-px w-full bg-border/30 my-1" />
              {DROPDOWN_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-foreground hover:bg-surface/50 transition-colors"
                >
                  <span className="text-muted">{item.icon}</span>
                  {item.label}
                </Link>
              ))}

              {/* Sign out - mobile */}
              <button
                onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                className="w-full px-4 py-3 mt-1 text-center text-sm font-medium text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors cursor-pointer"
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

      {/* Dropdown animation */}
      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(-4px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </header>
  );
}
