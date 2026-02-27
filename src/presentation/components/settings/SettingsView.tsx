'use client';

import { AppSettings } from '@/src/presentation/presenters/settings/SettingsPresenter';
import { UserProfile, useSettingsPresenter } from '@/src/presentation/presenters/settings/useSettingsPresenter';
import { animated, config, useSpring } from '@react-spring/web';
import { MainLayout } from '../layout/MainLayout';
import { JellyButton } from '../ui/JellyButton';
import { JellyCard, JellyWrapper } from '../ui/JellyCard';

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

function ToggleSwitch({ enabled, onChange }: ToggleSwitchProps) {
  return (
    <JellyWrapper>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
          enabled 
            ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600' 
            : 'bg-gray-300 dark:bg-gray-600 border border-gray-400 dark:border-gray-500'
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 rounded-full shadow-lg transition-transform duration-300 ${
            enabled 
              ? 'translate-x-6 bg-white' 
              : 'translate-x-0.5 bg-white dark:bg-gray-300'
          }`}
        />
      </button>
    </JellyWrapper>
  );
}

interface SettingsSectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  delay: number;
}

function SettingsSection({ title, icon, children, delay }: SettingsSectionProps) {
  const springProps = useSpring({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    delay,
    config: config.gentle,
  });

  return (
    <animated.div style={springProps}>
      <JellyCard className="glass-card p-5">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/30">
          <span className="text-xl">{icon}</span>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        <div className="space-y-4">{children}</div>
      </JellyCard>
    </animated.div>
  );
}

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && <div className="text-xs text-muted mt-0.5">{description}</div>}
      </div>
      {children}
    </div>
  );
}

interface ProfileSectionProps {
  userProfile: UserProfile | null;
  delay: number;
}

function ProfileSection({ userProfile, delay }: ProfileSectionProps) {
  const springProps = useSpring({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    delay,
    config: config.gentle,
  });

  // Loading state
  if (!userProfile) {
    return (
      <animated.div style={springProps}>
        <JellyCard className="glass-card p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
          </div>
        </JellyCard>
      </animated.div>
    );
  }

  return (
    <animated.div style={springProps}>
      <JellyCard className="glass-card p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-4xl shadow-lg shadow-purple-500/25">
              {userProfile.avatar}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm hover:bg-violet-500 transition-colors shadow-lg">
              📷
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-foreground mb-1">{userProfile.name}</h2>
            <p className="text-sm text-muted mb-2">{userProfile.email}</p>
            <p className="text-sm text-muted/80 mb-4">{userProfile.bio}</p>

            {/* Stats */}
            <div className="flex gap-4 justify-center sm:justify-start">
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">{userProfile.stats.totalContents}</div>
                <div className="text-xs text-muted">คอนเทนต์</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-400">{userProfile.stats.published}</div>
                <div className="text-xs text-muted">เผยแพร่</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-pink-400">{userProfile.stats.likes}</div>
                <div className="text-xs text-muted">Likes</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">{userProfile.stats.shares}</div>
                <div className="text-xs text-muted">Shares</div>
              </div>
            </div>
          </div>

          {/* Edit button */}
          <JellyButton variant="secondary" size="sm">
            ✏️ แก้ไข
          </JellyButton>
        </div>
      </JellyCard>
    </animated.div>
  );
}

interface SettingsViewProps {
  initialViewModel?: import('@/src/presentation/presenters/settings/SettingsPresenter').SettingsViewModel;
}

/**
 * SettingsView component
 * Settings page with jelly animations
 * ✅ Clean View - All logic moved to useSettingsPresenter hook
 */
export function SettingsView({ initialViewModel }: SettingsViewProps) {
  // ✅ All state and logic comes from hook
  const [state, actions] = useSettingsPresenter(initialViewModel);

  const headerSpring = useSpring({
    from: { opacity: 0, y: -10 },
    to: { opacity: 1, y: 0 },
    config: config.gentle,
  });

  // Loading state
  if (state.loading && !state.viewModel) {
    return (
      <MainLayout showBubbles={false}>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-muted">กำลังโหลด...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (state.error) {
    return (
      <MainLayout showBubbles={false}>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-4">{state.error}</p>
            <JellyButton onClick={actions.refresh} variant="primary">
              ลองใหม่
            </JellyButton>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showBubbles={false}>
      <div className="h-full overflow-auto scrollbar-thin">
        {/* 'Coming Soon' Wrapper */}
        <div className="relative h-full">
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
          
          {/* Header */}
          <animated.div style={headerSpring} className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text-purple">Settings</h1>
              <p className="text-sm text-muted">ตั้งค่าและปรับแต่งการทำงาน</p>
            </div>
            <JellyButton
              onClick={actions.saveSettings}
              disabled={state.isSaving}
              variant="primary"
              size="lg"
            >
              {state.isSaving ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>บันทึก</span>
                </>
              )}
            </JellyButton>
          </animated.div>

          {/* Profile Section */}
          <ProfileSection userProfile={state.userProfile} delay={50} />

          {/* API Settings */}
          <SettingsSection title="API Configuration" icon="🔑" delay={100}>
            <SettingRow label="Gemini API Key" description="ใช้สำหรับสร้างคอนเทนต์ด้วย AI">
              <div className="flex items-center gap-2">
                <input
                  type={state.showApiKey ? 'text' : 'password'}
                  value={state.settings.geminiApiKey}
                  onChange={(e) => actions.updateSettings({ geminiApiKey: e.target.value })}
                  placeholder="Enter API key..."
                  className="w-48 px-3 py-2 rounded-lg glass-card text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
                <JellyButton
                  onClick={actions.toggleApiKeyVisibility}
                  variant="ghost"
                  size="sm"
                >
                  {state.showApiKey ? '🙈' : '👁️'}
                </JellyButton>
              </div>
            </SettingRow>
          </SettingsSection>

          {/* Content Settings */}
          <SettingsSection title="Content Generation" icon="✨" delay={150}>
            <SettingRow label="คุณภาพคอนเทนต์" description="ระดับความละเอียดของรูปภาพ">
              <select
                value={state.settings.contentQuality}
                onChange={(e) => actions.updateSettings({ contentQuality: e.target.value as AppSettings['contentQuality'] })}
                className="px-3 py-2 rounded-lg glass-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                <option value="standard">Standard</option>
                <option value="high">High</option>
                <option value="ultra">Ultra</option>
              </select>
            </SettingRow>

            <SettingRow label="ช่วงเวลาเริ่มต้น" description="ช่วงเวลาที่ใช้เป็นค่าเริ่มต้นสำหรับ Schedule">
              <select
                value={state.settings.defaultTimeSlot}
                onChange={(e) => actions.updateSettings({ defaultTimeSlot: e.target.value })}
                className="px-3 py-2 rounded-lg glass-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                {state.viewModel?.availableTimeSlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.name}
                  </option>
                ))}
              </select>
            </SettingRow>
          </SettingsSection>

          {/* Schedule Settings */}
          <SettingsSection title="Schedule" icon="📅" delay={200}>
            <SettingRow label="Auto Schedule" description="จัดตาราง Schedule อัตโนมัติหลังสร้างคอนเทนต์">
              <ToggleSwitch
                enabled={state.settings.autoSchedule}
                onChange={(enabled) => actions.updateSettings({ autoSchedule: enabled })}
              />
            </SettingRow>
          </SettingsSection>

          {/* Notification Settings */}
          <SettingsSection title="Notifications" icon="🔔" delay={250}>
            <SettingRow label="เมื่อสร้างคอนเทนต์สำเร็จ" description="แจ้งเตือนเมื่อ AI สร้างคอนเทนต์เสร็จ">
              <ToggleSwitch
                enabled={state.settings.notifications.onGenerate}
                onChange={(enabled) => actions.updateNotification('onGenerate', enabled)}
              />
            </SettingRow>
            <SettingRow label="เมื่อโพสต์คอนเทนต์" description="แจ้งเตือนเมื่อโพสต์คอนเทนต์ตาม Schedule">
              <ToggleSwitch
                enabled={state.settings.notifications.onPublish}
                onChange={(enabled) => actions.updateNotification('onPublish', enabled)}
              />
            </SettingRow>
            <SettingRow label="เมื่อมี Schedule ใหม่" description="แจ้งเตือนเมื่อมี Schedule ใหม่ถูกเพิ่ม">
              <ToggleSwitch
                enabled={state.settings.notifications.onSchedule}
                onChange={(enabled) => actions.updateNotification('onSchedule', enabled)}
              />
            </SettingRow>
          </SettingsSection>

          {/* Language Settings */}
          <SettingsSection title="Language & Display" icon="🌐" delay={300}>
            <SettingRow label="ภาษา" description="เลือกภาษาที่ใช้แสดงผล">
              <select
                value={state.settings.language}
                onChange={(e) => actions.updateSettings({ language: e.target.value as 'th' | 'en' })}
                className="px-3 py-2 rounded-lg glass-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                <option value="th">🇹🇭 ไทย</option>
                <option value="en">🇺🇸 English</option>
              </select>
            </SettingRow>
          </SettingsSection>

          {/* Danger Zone */}
          <SettingsSection title="Danger Zone" icon="⚠️" delay={350}>
            <SettingRow label="ล้างข้อมูลทั้งหมด" description="ลบคอนเทนต์และ Schedule ทั้งหมด">
              <JellyButton
                onClick={actions.clearAllData}
                variant="ghost"
                size="sm"
                className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
              >
                ล้างข้อมูล
              </JellyButton>
            </SettingRow>
          </SettingsSection>
        </div>

        {/* Blur Overlay */}
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 bg-background/50 backdrop-blur-md rounded-2xl m-4 border border-border/10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-4xl shadow-lg shadow-purple-500/25 mb-6 animate-bounce">
            🚧
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3 text-center">
            Coming in <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Phase 2</span>
          </h2>
          <p className="text-muted text-center max-w-md mb-8">
            หน้านี้กำลังอยู่ระหว่างการพัฒนา 
            ระบบตั้งค่าทั้งหมดจะถูกเปิดให้ใช้งานอย่างสมบูรณ์ในเฟสถัดไปครับ 🚀
          </p>
          <JellyButton
            variant="primary"
            onClick={() => window.location.href = '/dashboard'}
            size="lg"
          >
            <span>🏠</span>
            <span>กลับไปหน้า Dashboard</span>
          </JellyButton>
        </div>

        </div>
      </div>
    </MainLayout>
  );
}
