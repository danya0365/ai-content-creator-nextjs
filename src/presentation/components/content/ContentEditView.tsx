'use client';

import { GeneratedContent } from '@/src/data/mock/mockContents';
import { animated, config, useSpring } from '@react-spring/web';
import Link from 'next/link';
import { useState } from 'react';
import { MainLayout } from '../layout/MainLayout';
import { JellyButton } from '../ui/JellyButton';
import { JellyCard } from '../ui/JellyCard';

interface ContentEditViewProps {
  content?: GeneratedContent;
}

/**
 * ContentEditView - Edit content form with live preview
 */
export function ContentEditView({ content }: ContentEditViewProps) {
  // Mock content for demo
  const mockContent: GeneratedContent = content || {
    id: 'demo-1',
    title: 'สรุปข่าว AI ประจำวัน 🤖',
    description: 'อัพเดทข่าวสาร AI ล่าสุดแบบ Pixel Art สุดน่ารัก พร้อมสรุปเข้าใจง่ายสำหรับทุกคน',
    prompt: 'Create a cute pixel art illustration about AI news today',
    imageUrl: '',
    status: 'published',
    timeSlot: 'morning',
    contentTypeId: 'morning-news',
    scheduledAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    likes: 1247,
    shares: 312,
  };

  const [formData, setFormData] = useState({
    title: mockContent.title,
    description: mockContent.description,
    prompt: mockContent.prompt,
    timeSlot: mockContent.timeSlot,
    hashtags: ['#PixelArt', '#AI', '#Content', '#Creative', '#Tech'],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const headerSpring = useSpring({
    from: { opacity: 0, y: -20 },
    to: { opacity: 1, y: 0 },
    config: config.gentle,
  });

  const formSpring = useSpring({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    delay: 100,
    config: config.gentle,
  });

  const previewSpring = useSpring({
    from: { opacity: 0, x: 20 },
    to: { opacity: 1, x: 0 },
    delay: 200,
    config: config.gentle,
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    console.log('Saved:', formData);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsRegenerating(false);
  };

  const timeSlots = [
    { id: 'morning', label: '🌅 ตอนเช้า', time: '6:00 - 9:00' },
    { id: 'lunch', label: '🍱 ตอนเที่ยง', time: '11:00 - 14:00' },
    { id: 'afternoon', label: '☀️ ตอนบ่าย', time: '14:00 - 18:00' },
    { id: 'evening', label: '🌙 ตอนเย็น', time: '18:00 - 22:00' },
  ];

  return (
    <MainLayout showBubbles={false}>
      <div className="h-full overflow-auto scrollbar-thin">
        <div className="max-w-6xl mx-auto px-6 py-6">
          
          {/* Header */}
          <animated.div style={headerSpring} className="mb-6">
            <div className="flex items-center gap-2 text-sm text-muted mb-4">
              <Link href="/gallery" className="hover:text-violet-400 transition-colors">
                Gallery
              </Link>
              <span>/</span>
              <Link href={`/content/${mockContent.id}`} className="hover:text-violet-400 transition-colors">
                {mockContent.title}
              </Link>
              <span>/</span>
              <span className="text-foreground">Edit</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold gradient-text-purple">Edit Content</h1>
                <p className="text-sm text-muted">แก้ไขและปรับปรุงคอนเทนต์ของคุณ</p>
              </div>

              <div className="flex gap-2">
                <Link href={`/content/${mockContent.id}`}>
                  <JellyButton variant="ghost">
                    ✕ Cancel
                  </JellyButton>
                </Link>
                <JellyButton
                  onClick={handleSave}
                  disabled={isSaving}
                  variant="primary"
                >
                  {isSaving ? '⏳ Saving...' : '💾 Save Changes'}
                </JellyButton>
              </div>
            </div>
          </animated.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Form */}
            <animated.div style={formSpring} className="space-y-6">
              {/* Title */}
              <JellyCard className="glass-card p-5">
                <label className="block text-sm font-medium text-foreground mb-2">
                  📝 Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-card text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  placeholder="Enter title..."
                />
              </JellyCard>

              {/* Description */}
              <JellyCard className="glass-card p-5">
                <label className="block text-sm font-medium text-foreground mb-2">
                  📄 Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl glass-card text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                  placeholder="Enter description..."
                />
              </JellyCard>

              {/* AI Prompt */}
              <JellyCard className="glass-card p-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">
                    🤖 AI Prompt
                  </label>
                  <JellyButton
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    variant="ghost"
                    size="sm"
                  >
                    {isRegenerating ? '⏳ Generating...' : '✨ Regenerate Image'}
                  </JellyButton>
                </div>
                <textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl glass-card text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none font-mono text-sm"
                  placeholder="Enter AI prompt..."
                />
              </JellyCard>

              {/* Time Slot */}
              <JellyCard className="glass-card p-5">
                <label className="block text-sm font-medium text-foreground mb-3">
                  ⏰ Time Slot
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setFormData({ ...formData, timeSlot: slot.id as 'morning' | 'lunch' | 'afternoon' | 'evening' })}
                      className={`p-3 rounded-xl text-left transition-all ${
                        formData.timeSlot === slot.id
                          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
                          : 'glass-card hover:border-violet-500/50'
                      }`}
                    >
                      <div className="text-sm font-medium">{slot.label}</div>
                      <div className={`text-xs ${formData.timeSlot === slot.id ? 'text-white/70' : 'text-muted'}`}>
                        {slot.time}
                      </div>
                    </button>
                  ))}
                </div>
              </JellyCard>

              {/* Hashtags */}
              <JellyCard className="glass-card p-5">
                <label className="block text-sm font-medium text-foreground mb-3">
                  # Hashtags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.hashtags.map((tag, index) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm rounded-full bg-violet-500/20 text-violet-400 flex items-center gap-2"
                    >
                      {tag}
                      <button
                        onClick={() => {
                          const newTags = [...formData.hashtags];
                          newTags.splice(index, 1);
                          setFormData({ ...formData, hashtags: newTags });
                        }}
                        className="hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add hashtag..."
                  className="w-full px-4 py-2 rounded-lg glass-card text-sm text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value && !formData.hashtags.includes(value)) {
                        setFormData({ ...formData, hashtags: [...formData.hashtags, value.startsWith('#') ? value : `#${value}`] });
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
              </JellyCard>
            </animated.div>

            {/* Preview */}
            <animated.div style={previewSpring} className="space-y-6">
              <JellyCard className="glass-card p-5 sticky top-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span>👁️</span> Live Preview
                </h3>

                {/* Preview Card */}
                <div className="glass-card p-4 rounded-xl">
                  {/* Image */}
                  <div className={`aspect-video rounded-xl bg-gradient-to-br from-violet-500/30 via-purple-500/20 to-fuchsia-500/30 flex items-center justify-center mb-4 relative ${isRegenerating ? 'animate-pulse' : ''}`}>
                    {isRegenerating ? (
                      <div className="text-center">
                        <span className="text-4xl mb-2 block animate-spin">✨</span>
                        <span className="text-sm text-muted">Generating...</span>
                      </div>
                    ) : (
                      <span className="text-6xl">🎨</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-bold text-foreground">
                      {formData.title || 'Untitled'}
                    </h4>
                    <p className="text-sm text-muted line-clamp-2">
                      {formData.description || 'No description'}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {formData.hashtags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs text-violet-400">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div className="mt-4 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                  <h4 className="text-sm font-medium text-violet-400 mb-2">💡 Tips</h4>
                  <ul className="text-xs text-muted space-y-1">
                    <li>• ใช้ emoji เพื่อดึงดูดความสนใจ</li>
                    <li>• Title ควรมีไม่เกิน 50 ตัวอักษร</li>
                    <li>• เพิ่ม hashtags ที่เกี่ยวข้อง</li>
                  </ul>
                </div>
              </JellyCard>
            </animated.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
