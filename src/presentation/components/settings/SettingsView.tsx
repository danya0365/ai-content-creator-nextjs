'use client';

import { AppSettings, SettingsViewModel } from '@/src/presentation/presenters/settings/SettingsPresenter';
import { animated, config, useSpring } from '@react-spring/web';
import { useState } from 'react';
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
          enabled ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600' : 'bg-surface'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg transition-transform duration-300 ${
            enabled ? 'translate-x-7' : 'translate-x-1'
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

interface SettingsViewProps {
  initialViewModel?: SettingsViewModel;
}

/**
 * SettingsView component
 * Settings page with jelly animations
 */
export function SettingsView({ initialViewModel }: SettingsViewProps) {
  const viewModel = initialViewModel || {
    settings: {
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
    } as AppSettings,
    availableTimeSlots: [],
  };

  const [settings, setSettings] = useState(viewModel.settings);
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate saving
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    console.log('Settings saved:', settings);
  };

  const headerSpring = useSpring({
    from: { opacity: 0, y: -10 },
    to: { opacity: 1, y: 0 },
    config: config.gentle,
  });

  return (
    <MainLayout showBubbles={false}>
      <div className="h-full overflow-auto scrollbar-thin">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
          
          {/* Header */}
          <animated.div style={headerSpring} className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text-purple">Settings</h1>
              <p className="text-sm text-muted">ตั้งค่าและปรับแต่งการทำงาน</p>
            </div>
            <JellyButton
              onClick={handleSave}
              disabled={isSaving}
              variant="primary"
              size="lg"
            >
              {isSaving ? (
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

          {/* API Settings */}
          <SettingsSection title="API Configuration" icon="🔑" delay={100}>
            <SettingRow label="Gemini API Key" description="ใช้สำหรับสร้างคอนเทนต์ด้วย AI">
              <div className="flex items-center gap-2">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={settings.geminiApiKey}
                  onChange={(e) => setSettings((s) => ({ ...s, geminiApiKey: e.target.value }))}
                  placeholder="Enter API key..."
                  className="w-48 px-3 py-2 rounded-lg glass-card text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
                <JellyButton
                  onClick={() => setShowApiKey(!showApiKey)}
                  variant="ghost"
                  size="sm"
                >
                  {showApiKey ? '🙈' : '👁️'}
                </JellyButton>
              </div>
            </SettingRow>
          </SettingsSection>

          {/* Content Settings */}
          <SettingsSection title="Content Generation" icon="✨" delay={150}>
            <SettingRow label="คุณภาพคอนเทนต์" description="ระดับความละเอียดของรูปภาพ">
              <select
                value={settings.contentQuality}
                onChange={(e) => setSettings((s) => ({ ...s, contentQuality: e.target.value as AppSettings['contentQuality'] }))}
                className="px-3 py-2 rounded-lg glass-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                <option value="standard">Standard</option>
                <option value="high">High</option>
                <option value="ultra">Ultra</option>
              </select>
            </SettingRow>

            <SettingRow label="ช่วงเวลาเริ่มต้น" description="ช่วงเวลาที่ใช้เป็นค่าเริ่มต้นสำหรับ Schedule">
              <select
                value={settings.defaultTimeSlot}
                onChange={(e) => setSettings((s) => ({ ...s, defaultTimeSlot: e.target.value }))}
                className="px-3 py-2 rounded-lg glass-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                {viewModel.availableTimeSlots.map((slot) => (
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
                enabled={settings.autoSchedule}
                onChange={(enabled) => setSettings((s) => ({ ...s, autoSchedule: enabled }))}
              />
            </SettingRow>
          </SettingsSection>

          {/* Notification Settings */}
          <SettingsSection title="Notifications" icon="🔔" delay={250}>
            <SettingRow label="เมื่อสร้างคอนเทนต์สำเร็จ" description="แจ้งเตือนเมื่อ AI สร้างคอนเทนต์เสร็จ">
              <ToggleSwitch
                enabled={settings.notifications.onGenerate}
                onChange={(enabled) => setSettings((s) => ({ 
                  ...s, 
                  notifications: { ...s.notifications, onGenerate: enabled } 
                }))}
              />
            </SettingRow>
            <SettingRow label="เมื่อโพสต์คอนเทนต์" description="แจ้งเตือนเมื่อโพสต์คอนเทนต์ตาม Schedule">
              <ToggleSwitch
                enabled={settings.notifications.onPublish}
                onChange={(enabled) => setSettings((s) => ({ 
                  ...s, 
                  notifications: { ...s.notifications, onPublish: enabled } 
                }))}
              />
            </SettingRow>
            <SettingRow label="เมื่อมี Schedule ใหม่" description="แจ้งเตือนเมื่อมี Schedule ใหม่ถูกเพิ่ม">
              <ToggleSwitch
                enabled={settings.notifications.onSchedule}
                onChange={(enabled) => setSettings((s) => ({ 
                  ...s, 
                  notifications: { ...s.notifications, onSchedule: enabled } 
                }))}
              />
            </SettingRow>
          </SettingsSection>

          {/* Language Settings */}
          <SettingsSection title="Language & Display" icon="🌐" delay={300}>
            <SettingRow label="ภาษา" description="เลือกภาษาที่ใช้แสดงผล">
              <select
                value={settings.language}
                onChange={(e) => setSettings((s) => ({ ...s, language: e.target.value as 'th' | 'en' }))}
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
                variant="ghost"
                size="sm"
                className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
              >
                ล้างข้อมูล
              </JellyButton>
            </SettingRow>
          </SettingsSection>
        </div>
      </div>
    </MainLayout>
  );
}
