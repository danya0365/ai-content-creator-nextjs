'use client';

import { Content } from '@/src/application/repositories/IContentRepository';
import { TimelineEntry } from '@/src/presentation/presenters/timeline/TimelinePresenter';
import { animated, config, useSpring } from '@react-spring/web';
import { JellyButton } from '../ui/JellyButton';
import { JellyCard } from '../ui/JellyCard';
import { SmartImage } from '../ui/SmartImage';
import Link from 'next/link';

interface ContentDetailModalProps {
  content: Content | TimelineEntry;
  onClose: () => void;
}

/**
 * ContentDetailModal - Shared modal for viewing content details
 * Used in both Gallery and Timeline views
 */
export function ContentDetailModal({ content, onClose }: ContentDetailModalProps) {
  const backdropSpring = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: config.gentle,
  });

  const modalSpring = useSpring({
    from: { opacity: 0, scale: 0.9, y: 20 },
    to: { opacity: 1, scale: 1, y: 0 },
    config: config.gentle,
  });

  const statusColors = {
    draft: 'bg-gray-500/20 text-gray-400',
    scheduled: 'bg-blue-500/20 text-blue-400',
    published: 'bg-green-500/20 text-green-400',
    failed: 'bg-red-500/20 text-red-400',
  };

  // Type guard to check if it's a full Content object
  const isFullContent = 'prompt' in content;

  return (
    <animated.div
      style={backdropSpring}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <animated.div
        style={modalSpring}
        className="glass-card p-6 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <JellyButton
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 w-8 h-8 rounded-full z-10 bg-black/20 hover:bg-black/40 text-white"
        >
          ✕
        </JellyButton>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-1 scrollbar-thin scrollbar-thumb-violet-500/20">
          {/* Image */}
          <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-violet-500/30 via-purple-500/20 to-fuchsia-500/30 mb-4 flex items-center justify-center overflow-hidden relative shrink-0">
            <SmartImage
              src={content.imageUrl}
              alt={content.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 500px"
              emojiClassName="text-6xl"
              containerClassName="w-full h-full flex items-center justify-center absolute inset-0"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-3 py-1 rounded-full ${statusColors[content.status as keyof typeof statusColors]}`}>
                {content.status.toUpperCase()}
              </span>
              {'timeSlot' in content && <span className="text-xs text-muted">{content.timeSlot}</span>}
            </div>

            <h2 className="text-xl font-bold text-foreground leading-tight">{content.title}</h2>
            <p className="text-sm text-muted whitespace-pre-wrap">{content.description}</p>

            {content.status === 'published' && (
              <div className="flex items-center gap-6 py-3 border-t border-b border-border/30">
                <div className="text-center">
                  <div className="text-xl font-bold text-foreground">{content.likes}</div>
                  <div className="text-xs text-muted">Likes</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-foreground">{content.shares}</div>
                  <div className="text-xs text-muted">Shares</div>
                </div>
              </div>
            )}

            {isFullContent && content.prompt && (
              <JellyCard className="glass-card p-3">
                <div className="text-xs text-muted mb-1">AI Prompt:</div>
                <div className="text-sm text-foreground italic line-clamp-3">
                  "{content.prompt}"
                </div>
              </JellyCard>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-2 pt-4 border-t border-border/30 shrink-0">
          <Link href={`/content/${content.id}`} className="w-full">
            <JellyButton variant="primary" className="w-full">
              🔎 อ่านรายละเอียดตัวเต็ม
            </JellyButton>
          </Link>
          <div className="flex gap-2">
            <JellyButton variant="secondary" className="flex-1" onClick={onClose}>
              🚀 ปิดหน้านี้
            </JellyButton>
            <JellyButton variant="secondary">
              📤 Share
            </JellyButton>
          </div>
        </div>
      </animated.div>
    </animated.div>
  );
}
