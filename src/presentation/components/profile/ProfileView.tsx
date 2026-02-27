'use client';

import { useAuthPresenter } from '@/src/presentation/presenters/auth/useAuthPresenter';
import { useProfilePresenter } from '@/src/presentation/presenters/profile/useProfilePresenter';
import { animated, config, useSpring } from '@react-spring/web';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MainLayout } from '../layout/MainLayout';
import { JellyButton } from '../ui/JellyButton';
import { JellyCard } from '../ui/JellyCard';

// ─── Inline SVG Icons ────────────────────────────────────────────────
function IconUser({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function IconShield({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function IconPlus({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
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

function IconMail({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function IconPhone({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

function IconCalendar({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function IconGlobe({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

function IconMapPin({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function IconClock({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconFingerprint({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a48.667 48.667 0 00-1.372 8.558M11.25 4.014A7.464 7.464 0 0010.5 10.5c0 2.92.556 5.709 1.568 8.268M8.25 10.5a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0z" />
    </svg>
  );
}

function IconClose({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconCheck({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconHash({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" />
    </svg>
  );
}

// ─── Verification Badge ──────────────────────────────────────────────
function VerificationBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    verified: { label: 'Verified', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    pending: { label: 'Pending', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    rejected: { label: 'Rejected', color: 'text-red-500', bg: 'bg-red-500/10' },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.color}`}>
      <IconShield className="w-3.5 h-3.5" />
      {s.label}
    </span>
  );
}

// ─── Info Tile ───────────────────────────────────────────────────────
function InfoTile({ icon, label, value, color = 'violet' }: { icon: React.ReactNode; label: string; value?: string | number | null; color?: string }) {
  if (value === undefined || value === null || value === '') return null;
  const colorMap: Record<string, string> = {
    violet: 'bg-violet-500/10 text-violet-500',
    blue: 'bg-blue-500/10 text-blue-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
    amber: 'bg-amber-500/10 text-amber-500',
    fuchsia: 'bg-fuchsia-500/10 text-fuchsia-500',
    cyan: 'bg-cyan-500/10 text-cyan-500',
    rose: 'bg-rose-500/10 text-rose-500',
  };
  const c = colorMap[color] || colorMap.violet;

  return (
    <div className="glass-card p-3 flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${c}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] text-muted uppercase tracking-wider">{label}</div>
        <div className="text-sm font-medium text-foreground truncate">{String(value)}</div>
      </div>
    </div>
  );
}

// ─── Section Header ──────────────────────────────────────────────────
function SectionHeader({ emoji, title }: { emoji: string; title: string }) {
  return (
    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
      <span className="text-lg">{emoji}</span>
      {title}
    </h3>
  );
}

// ─── Main Component ─────────────────────────────────────────────────
export function ProfileView() {
  const [authState] = useAuthPresenter();
  const [profileState, profileActions] = useProfilePresenter();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authState.isAuthenticated, authState.isLoading, router]);

  // Form states
  const [isCreating, setIsCreating] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');

  // Animations
  const headerSpring = useSpring({
    from: { opacity: 0, y: -10 },
    to: { opacity: 1, y: 0 },
    config: config.gentle,
  });

  const leftSpring = useSpring({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    config: config.gentle,
    delay: 100,
  });

  const rightSpring = useSpring({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    config: config.gentle,
    delay: 200,
  });

  // Fetch profiles on mount
  useEffect(() => {
    if (authState.isAuthenticated && profileState.profiles.length === 0) {
      profileActions.getProfiles();
    }
  }, [authState.isAuthenticated, profileState.profiles.length, profileActions]);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    const success = await profileActions.createProfile({
      username: newUsername,
      fullName: newFullName,
    });

    if (success) {
      setIsCreating(false);
      setNewUsername('');
      setNewFullName('');
    }
  };

  const handleSwitchProfile = async (profileId: string) => {
    await profileActions.switchProfile(profileId);
  };

  // ─── Loading State ──────────────────────────────────────────────
  if (authState.isLoading) {
    return (
      <MainLayout showBubbles={false}>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-muted text-sm">กำลังโหลด...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const activeProfile = authState.profile;
  const authUser = authState.user;
  const otherProfiles = profileState.profiles.filter((p) => p.id !== activeProfile?.id);

  // ─── Format helpers ─────────────────────────────────────────────
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const genderLabel = (g?: string) => {
    const map: Record<string, string> = { male: 'ชาย', female: 'หญิง', other: 'อื่นๆ' };
    return g ? map[g] || g : null;
  };

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <MainLayout showBubbles={false}>
      <div className="h-full overflow-auto scrollbar-thin">
        <div className="max-w-7xl mx-auto px-3 py-4 md:px-6 md:py-6 space-y-4 md:space-y-6">

          {/* ── Header ─────────────────────────────────────────── */}
          <animated.div style={headerSpring} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold gradient-text-purple">My Profiles</h1>
              <p className="text-xs md:text-sm text-muted">จัดการโปรไฟล์และสลับบัญชีของคุณ</p>
            </div>
            <JellyButton
              variant="primary"
              size="md"
              onClick={() => setIsCreating(!isCreating)}
              className="w-full sm:w-auto"
            >
              {isCreating ? (
                <>
                  <IconClose className="w-4 h-4" />
                  <span>ยกเลิก</span>
                </>
              ) : (
                <>
                  <IconPlus className="w-4 h-4" />
                  <span>เพิ่มโปรไฟล์</span>
                </>
              )}
            </JellyButton>
          </animated.div>

          {/* ── Alerts ──────────────────────────────────────────── */}
          {profileState.error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center animate-fade-in">
              {profileState.error}
            </div>
          )}
          {profileState.successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm text-center animate-fade-in">
              {profileState.successMessage}
            </div>
          )}

          {/* ── Create Profile Form (expandable) ───────────────── */}
          {isCreating && (
            <animated.div style={leftSpring}>
              <JellyCard className="glass-card border border-primary/30 p-5 md:p-6">
                <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500">
                    <IconPlus className="w-4 h-4" />
                  </div>
                  สร้างโปรไฟล์ใหม่
                </h3>
                <form onSubmit={handleCreateProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">Username *</label>
                    <input
                      type="text"
                      required
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full bg-surface/50 border border-border/50 text-foreground px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted/50 text-sm"
                      placeholder="username"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      className="w-full bg-surface/50 border border-border/50 text-foreground px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted/50 text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="sm:col-span-2 flex gap-3 pt-1">
                    <JellyButton type="submit" variant="primary" className="flex-1" disabled={profileState.isSubmitting || !newUsername.trim()}>
                      {profileState.isSubmitting ? 'กำลังสร้าง...' : 'สร้างโปรไฟล์'}
                    </JellyButton>
                    <JellyButton type="button" variant="secondary" onClick={() => setIsCreating(false)}>
                      ยกเลิก
                    </JellyButton>
                  </div>
                </form>
              </JellyCard>
            </animated.div>
          )}

          {/* ── Two-Column Grid ─────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

            {/* ──── Left: Hero + Details (2/3) ────────────────── */}
            <animated.div style={leftSpring} className="lg:col-span-2 space-y-4 md:space-y-6">

              {/* Hero Profile Card */}
              {activeProfile && (
                <JellyCard className="glass-card p-5 md:p-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    {/* Avatar with glow ring */}
                    <div className="relative flex-shrink-0">
                      <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center overflow-hidden ring-4 ring-violet-500/20 shadow-lg shadow-violet-500/10">
                        {activeProfile.avatarUrl ? (
                          <img src={activeProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <IconUser className="w-12 h-12 text-violet-400" />
                        )}
                      </div>
                      {/* Active dot */}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-[3px] border-white dark:border-[#0a0a0a]" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold gradient-text-purple">
                          {activeProfile.fullName || activeProfile.username || 'Unknown'}
                        </h2>
                        <p className="text-sm text-muted">@{activeProfile.username || 'no-username'}</p>
                      </div>

                      {activeProfile.bio && (
                        <p className="text-sm text-foreground/70 leading-relaxed max-w-md">{activeProfile.bio}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start pt-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                        <VerificationBadge status={activeProfile.verificationStatus} />
                        {activeProfile.preferences?.language && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                            <IconGlobe className="w-3 h-3" />
                            {activeProfile.preferences.language.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Joined date - desktop */}
                    <div className="hidden md:block text-right flex-shrink-0">
                      <div className="text-[11px] text-muted uppercase tracking-wider mb-0.5">สร้างเมื่อ</div>
                      <div className="text-sm font-medium text-foreground">
                        {formatDate(activeProfile.createdAt) || '—'}
                      </div>
                    </div>
                  </div>
                </JellyCard>
              )}

              {/* ── Account Info (from AuthUser) ───────────────── */}
              {authUser && (
                <div>
                  <SectionHeader emoji="🔐" title="ข้อมูลบัญชี (Auth)" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                    <InfoTile icon={<IconMail className="w-4 h-4" />} label="อีเมล" value={authUser.email} color="blue" />
                    <InfoTile
                      icon={<IconCheck className="w-4 h-4" />}
                      label="ยืนยันอีเมล"
                      value={authUser.emailVerified ? '✅ ยืนยันแล้ว' : '⏳ ยังไม่ยืนยัน'}
                      color={authUser.emailVerified ? 'emerald' : 'amber'}
                    />
                    <InfoTile icon={<IconPhone className="w-4 h-4" />} label="โทรศัพท์ (Auth)" value={authUser.phone} color="cyan" />
                    <InfoTile icon={<IconCalendar className="w-4 h-4" />} label="สร้างบัญชี" value={formatDate(authUser.createdAt)} color="violet" />
                    <InfoTile icon={<IconClock className="w-4 h-4" />} label="เข้าสู่ระบบล่าสุด (Auth)" value={formatDateTime(authUser.lastLoginAt)} color="fuchsia" />
                    <InfoTile icon={<IconFingerprint className="w-4 h-4" />} label="Auth ID" value={authUser.id} color="rose" />
                  </div>
                </div>
              )}

              {/* ── Profile Details Grid ───────────────────────── */}
              {activeProfile && (
                <div>
                  <SectionHeader emoji="📋" title="ข้อมูลโปรไฟล์" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                    <InfoTile icon={<IconUser className="w-4 h-4" />} label="Username" value={activeProfile.username} color="violet" />
                    <InfoTile icon={<IconUser className="w-4 h-4" />} label="ชื่อเต็ม" value={activeProfile.fullName} color="violet" />
                    <InfoTile icon={<IconPhone className="w-4 h-4" />} label="โทรศัพท์" value={activeProfile.phone} color="cyan" />
                    <InfoTile icon={<IconCalendar className="w-4 h-4" />} label="วันเกิด" value={formatDate(activeProfile.dateOfBirth)} color="blue" />
                    <InfoTile
                      icon={<IconUser className="w-4 h-4" />}
                      label="เพศ"
                      value={genderLabel(activeProfile.gender)}
                      color="fuchsia"
                    />
                    <InfoTile icon={<IconMapPin className="w-4 h-4" />} label="ที่อยู่" value={activeProfile.address} color="emerald" />
                    <InfoTile icon={<IconClock className="w-4 h-4" />} label="เข้าสู่ระบบล่าสุด" value={formatDateTime(activeProfile.lastLogin)} color="amber" />
                    <InfoTile icon={<IconHash className="w-4 h-4" />} label="จำนวนล็อกอิน" value={activeProfile.loginCount} color="blue" />
                    <InfoTile icon={<IconCalendar className="w-4 h-4" />} label="สร้างโปรไฟล์" value={formatDate(activeProfile.createdAt)} color="violet" />
                    <InfoTile icon={<IconCalendar className="w-4 h-4" />} label="อัปเดตล่าสุด" value={formatDateTime(activeProfile.updatedAt)} color="fuchsia" />
                    <InfoTile icon={<IconFingerprint className="w-4 h-4" />} label="Profile ID" value={activeProfile.id} color="rose" />
                    <InfoTile icon={<IconFingerprint className="w-4 h-4" />} label="Auth ID" value={activeProfile.authId} color="rose" />
                  </div>
                </div>
              )}

              {/* ── Social Links ───────────────────────────────── */}
              {activeProfile?.socialLinks && Object.keys(activeProfile.socialLinks).length > 0 && (
                <div>
                  <SectionHeader emoji="🔗" title="โซเชียลลิงก์" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                    {Object.entries(activeProfile.socialLinks).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-card-hover p-3 flex items-center gap-3 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                          <IconGlobe className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs text-muted uppercase tracking-wider">{platform}</div>
                          <div className="text-sm font-medium text-foreground truncate group-hover:text-violet-500 transition-colors">{url}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Privacy Settings ───────────────────────────── */}
              {activeProfile?.privacySettings && Object.keys(activeProfile.privacySettings).length > 0 && (
                <div>
                  <SectionHeader emoji="🔒" title="ตั้งค่าความเป็นส่วนตัว" />
                  <JellyCard className="glass-card p-4">
                    <div className="space-y-2.5">
                      {Object.entries(activeProfile.privacySettings).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-xs text-muted capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="text-sm font-medium text-foreground">
                            {typeof value === 'boolean' ? (value ? '✅ เปิด' : '❌ ปิด') : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </JellyCard>
                </div>
              )}
            </animated.div>

            {/* ──── Right: Sidebar (1/3) ──────────────────────── */}
            <animated.div style={rightSpring} className="space-y-4">

              {/* Quick Stats */}
              <JellyCard className="glass-card p-4">
                <SectionHeader emoji="📊" title="สถิติโปรไฟล์" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded-xl bg-violet-500/5">
                    <div className="text-2xl font-bold text-violet-500">{profileState.profiles.length}</div>
                    <div className="text-[11px] text-muted uppercase tracking-wider mt-0.5">โปรไฟล์ทั้งหมด</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-blue-500/5">
                    <div className="text-2xl font-bold text-blue-500">{activeProfile?.loginCount ?? 0}</div>
                    <div className="text-[11px] text-muted uppercase tracking-wider mt-0.5">ล็อกอิน</div>
                  </div>
                </div>
              </JellyCard>

              {/* Other Profiles */}
              <div>
                <SectionHeader emoji="👥" title="โปรไฟล์อื่น" />
                <div className="space-y-2">
                  {otherProfiles.length === 0 ? (
                    <JellyCard className="glass-card p-6 text-center">
                      <span className="text-3xl block mb-2">🎭</span>
                      <p className="text-sm text-muted">ยังไม่มีโปรไฟล์อื่น</p>
                      <p className="text-xs text-muted/70 mt-1">กดปุ่ม &quot;เพิ่มโปรไฟล์&quot; เพื่อสร้างใหม่</p>
                    </JellyCard>
                  ) : (
                    otherProfiles.map((p) => (
                      <JellyCard key={p.id} className="glass-card-hover p-3 group">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/15 to-fuchsia-500/15 flex items-center justify-center overflow-hidden border border-border/50 flex-shrink-0">
                            {p.avatarUrl ? (
                              <img src={p.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <IconUser className="w-5 h-5 text-muted" />
                            )}
                          </div>

                          {/* Name */}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-foreground group-hover:text-violet-500 transition-colors truncate">
                              {p.fullName || p.username || 'Unknown'}
                            </div>
                            <div className="text-xs text-muted">@{p.username || 'no-username'}</div>
                          </div>

                          {/* Switch button */}
                          <JellyButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSwitchProfile(p.id)}
                            disabled={profileState.isSubmitting}
                          >
                            <IconSwitch className="w-4 h-4" />
                            <span className="hidden sm:inline">Switch</span>
                          </JellyButton>
                        </div>
                      </JellyCard>
                    ))
                  )}
                </div>
              </div>

              {/* Preferences Card */}
              {activeProfile?.preferences && (
                <JellyCard className="glass-card p-4">
                  <SectionHeader emoji="⚙️" title="ค่ากำหนด" />
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">ธีม</span>
                      <span className="text-sm font-medium text-foreground capitalize">{activeProfile.preferences.theme}</span>
                    </div>
                    <div className="w-full h-px bg-border/30" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">การแจ้งเตือน</span>
                      <span className={`text-sm font-medium ${activeProfile.preferences.notifications ? 'text-emerald-500' : 'text-muted'}`}>
                        {activeProfile.preferences.notifications ? 'เปิด' : 'ปิด'}
                      </span>
                    </div>
                    <div className="w-full h-px bg-border/30" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">ภาษา</span>
                      <span className="text-sm font-medium text-foreground">{activeProfile.preferences.language || '—'}</span>
                    </div>
                  </div>
                </JellyCard>
              )}
            </animated.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
