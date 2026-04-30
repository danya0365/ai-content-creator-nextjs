'use client';

import { ContentEditViewModel } from '@/src/presentation/presenters/content/ContentEditPresenter';
import { useContentEditPresenter } from '@/src/presentation/presenters/content/useContentEditPresenter';
import { animated, config, useSpring } from '@react-spring/web';
import Link from 'next/link';
import { JellyButton } from '../ui/JellyButton';
import { JellyCard } from '../ui/JellyCard';
import { ContentDetailSkeleton } from './ContentDetailSkeleton';

interface ContentEditViewProps {
  contentId: string;
  initialViewModel?: ContentEditViewModel;
}

/**
 * ContentEditView - Edit content form with live preview
 * ✅ Clean View - All logic moved to useContentEditPresenter hook
 */
export function ContentEditView({ contentId, initialViewModel }: ContentEditViewProps) {
  // ✅ All state and logic comes from hook
  const [state, actions] = useContentEditPresenter(contentId, initialViewModel);

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

  if (state.loading && !state.viewModel) {
    return <ContentDetailSkeleton />;
  }

  // Error state
  if (state.error) {
    return (
      <>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-4">{state.error}</p>
            <JellyButton onClick={() => actions.refresh(contentId)} variant="primary">
              ลองใหม่
            </JellyButton>
          </div>
        </div>
      </>
    );
  }

  // Not found state
  if (!state.content) {
    return (
      <>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <span className="text-5xl mb-4 block">🔍</span>
            <h2 className="text-xl font-bold text-foreground mb-2">ไม่พบคอนเทนต์</h2>
            <p className="text-muted mb-4">คอนเทนต์นี้อาจถูกลบไปแล้ว</p>
            <Link href="/gallery">
              <JellyButton variant="primary">กลับไปหน้า Gallery</JellyButton>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="h-full overflow-auto scrollbar-thin">
        <div className="max-w-6xl mx-auto px-6 py-6">
          
          {/* Header */}
          <animated.div style={headerSpring} className="mb-6">
            <div className="flex items-center gap-2 text-sm text-muted mb-4">
              <Link href="/gallery" className="hover:text-violet-400 transition-colors">
                Gallery
              </Link>
              <span>/</span>
              <Link href={`/content/${state.content.id}`} className="hover:text-violet-400 transition-colors">
                {state.content.title}
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
                <Link href={`/content/${state.content.id}`}>
                  <JellyButton variant="ghost">
                    ✕ Cancel
                  </JellyButton>
                </Link>
                <JellyButton
                  onClick={actions.saveContent}
                  disabled={state.isSaving}
                  variant="primary"
                >
                  {state.isSaving ? '⏳ Saving...' : '💾 Save Changes'}
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
                  value={state.formData.title}
                  onChange={(e) => actions.updateFormData({ title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass-card text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  placeholder="Enter title..."
                />
              </JellyCard>

              {/* Description */}
              <JellyCard className="glass-card p-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">
                    📄 Description
                  </label>
                  <JellyButton
                    onClick={actions.regenerateDescription}
                    disabled={state.isRegenerating}
                    variant="ghost"
                    size="sm"
                    className="text-muted hover:text-foreground"
                  >
                    {state.isRegenerating ? '⏳...' : '✨ Gen Description'}
                  </JellyButton>
                </div>
                <textarea
                  value={state.formData.description}
                  onChange={(e) => actions.updateFormData({ description: e.target.value })}
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
                  <div className="flex gap-2">
                    <JellyButton
                      onClick={actions.regenerateContent}
                      disabled={state.isRegenerating}
                      variant="ghost"
                      size="sm"
                    >
                      {state.isRegenerating ? '⏳...' : '📝 Gen เนื้อหาใหม่'}
                    </JellyButton>
                    <JellyButton
                      onClick={actions.regenerateImage}
                      disabled={state.isRegenerating}
                      variant="ghost"
                      size="sm"
                    >
                      {state.isRegenerating ? '⏳...' : '✨ Gen รูปใหม่'}
                    </JellyButton>
                  </div>
                </div>
                <textarea
                  value={state.formData.prompt}
                  onChange={(e) => actions.updateFormData({ prompt: e.target.value })}
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
                  {state.timeSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => actions.updateFormData({ timeSlot: slot.id })}
                      className={`p-3 rounded-xl text-left transition-all ${
                        state.formData.timeSlot === slot.id
                          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
                          : 'glass-card hover:border-violet-500/50'
                      }`}
                    >
                      <div className="text-sm font-medium">{slot.label}</div>
                      <div className={`text-xs ${state.formData.timeSlot === slot.id ? 'text-white/70' : 'text-muted'}`}>
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
                  {state.formData.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm rounded-full bg-violet-500/20 text-violet-400 flex items-center gap-2"
                    >
                      {tag}
                      <button
                        onClick={() => actions.removeHashtag(tag)}
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
                      if (value && !state.formData.hashtags.includes(value)) {
                        actions.addHashtag(value.startsWith('#') ? value : `#${value}`);
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
                  <div className={`aspect-video rounded-xl bg-gradient-to-br from-violet-500/30 via-purple-500/20 to-fuchsia-500/30 flex items-center justify-center mb-4 relative overflow-hidden ${state.isRegenerating ? 'animate-pulse' : ''}`}>
                    {state.isRegenerating ? (
                      <div className="text-center">
                        <span className="text-4xl mb-2 block animate-spin">✨</span>
                        <span className="text-sm text-muted">Generating...</span>
                      </div>
                    ) : state.formData.imageUrl ? (
                      <img src={state.formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-6xl">🎨</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-bold text-foreground">
                      {state.formData.title || 'Untitled'}
                    </h4>
                    <p className="text-sm text-muted line-clamp-2">
                      {state.formData.description || 'No description'}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {state.formData.hashtags.slice(0, 3).map((tag) => (
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
    </>
  );
}
