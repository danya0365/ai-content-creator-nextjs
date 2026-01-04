'use client';

import { animated, config, useSpring } from '@react-spring/web';
import { JellyButton } from '../ui/JellyButton';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * KeyboardShortcutsModal - Shows all available keyboard shortcuts
 */
export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const backdropSpring = useSpring({
    opacity: isOpen ? 1 : 0,
    config: config.gentle,
  });

  const modalSpring = useSpring({
    opacity: isOpen ? 1 : 0,
    scale: isOpen ? 1 : 0.95,
    y: isOpen ? 0 : 20,
    config: config.gentle,
  });

  if (!isOpen) return null;

  const shortcuts = [
    { category: 'Navigation', items: [
      { keys: ['G', 'D'], desc: 'Go to Dashboard' },
      { keys: ['G', 'L'], desc: 'Go to Gallery' },
      { keys: ['G', 'S'], desc: 'Go to Schedule' },
      { keys: ['G', 'A'], desc: 'Go to Analytics' },
      { keys: ['G', 'T'], desc: 'Go to Settings' },
    ]},
    { category: 'Actions', items: [
      { keys: ['N'], desc: 'New content' },
      { keys: ['?'], desc: 'Show shortcuts' },
      { keys: ['Esc'], desc: 'Close dialog' },
    ]},
  ];

  return (
    <animated.div
      style={backdropSpring}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <animated.div
        style={modalSpring}
        className="glass-card p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span>⌨️</span> Keyboard Shortcuts
          </h2>
          <JellyButton onClick={onClose} variant="ghost" size="sm">
            ✕
          </JellyButton>
        </div>

        {/* Shortcuts */}
        <div className="space-y-6">
          {shortcuts.map((group) => (
            <div key={group.category}>
              <h3 className="text-sm font-semibold text-muted mb-3">{group.category}</h3>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div key={item.desc} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{item.desc}</span>
                    <div className="flex gap-1">
                      {item.keys.map((key, i) => (
                        <span key={i}>
                          <kbd className="px-2 py-1 text-xs font-mono rounded bg-surface border border-border text-foreground">
                            {key}
                          </kbd>
                          {i < item.keys.length - 1 && (
                            <span className="mx-1 text-muted text-xs">then</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-border/30 text-center">
          <p className="text-xs text-muted">
            Press <kbd className="px-1.5 py-0.5 text-xs font-mono rounded bg-surface border border-border">?</kbd> anytime to show this
          </p>
        </div>
      </animated.div>
    </animated.div>
  );
}
