'use client';

import { animated, config, useSpring } from '@react-spring/web';
import { useCallback, useEffect } from 'react';
import { JellyButton } from './JellyButton';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  isLoading?: boolean;
}

/**
 * ConfirmModal - Confirmation dialog with jelly animations
 * Use for destructive actions like delete, clear data, etc.
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  variant = 'default',
  isLoading = false,
}: ConfirmModalProps) {
  // Handle escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    },
    [isOpen, isLoading, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleEscape]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Animations
  const backdropSpring = useSpring({
    opacity: isOpen ? 1 : 0,
    config: config.gentle,
  });

  const modalSpring = useSpring({
    opacity: isOpen ? 1 : 0,
    scale: isOpen ? 1 : 0.9,
    y: isOpen ? 0 : 20,
    config: {
      tension: 300,
      friction: 20,
    },
  });

  if (!isOpen) return null;

  const variantConfig = {
    default: {
      icon: '❓',
      iconBg: 'from-violet-500/20 to-fuchsia-500/20',
      confirmBg: 'from-violet-600 to-fuchsia-600',
    },
    danger: {
      icon: '⚠️',
      iconBg: 'from-red-500/20 to-rose-500/20',
      confirmBg: 'from-red-600 to-rose-600',
    },
  };

  const configVariant = variantConfig[variant];

  return (
    <animated.div
      style={backdropSpring}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={!isLoading ? onClose : undefined}
    >
      <animated.div
        style={{
          opacity: modalSpring.opacity,
          transform: modalSpring.scale.to(
            (s) => `scale(${s}) translateY(${modalSpring.y.get()}px)`
          ),
        }}
        className="glass-card p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${configVariant.iconBg} flex items-center justify-center`}
          >
            <span className="text-3xl">{configVariant.icon}</span>
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
          <p className="text-sm text-muted">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <JellyButton
            onClick={onClose}
            variant="secondary"
            className="flex-1"
            disabled={isLoading}
          >
            {cancelText}
          </JellyButton>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`
              flex-1 py-3 rounded-xl font-semibold
              bg-gradient-to-r ${configVariant.confirmBg}
              text-white shadow-lg
              ${variant === 'danger' ? 'shadow-red-500/25' : 'shadow-purple-500/25'}
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
              transition-transform active:scale-95
            `}
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>กำลังดำเนินการ...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </animated.div>
    </animated.div>
  );
}

/**
 * useConfirmModal hook - Manage confirm modal state
 */
import { useState } from 'react';

interface UseConfirmModalOptions {
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  variant?: 'default' | 'danger';
}

export function useConfirmModal({ onConfirm, ...options }: UseConfirmModalOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => {
    if (!isLoading) {
      setIsOpen(false);
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      setIsOpen(false);
    } catch (error) {
      console.error('Confirm action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const modalProps = {
    isOpen,
    onClose: close,
    onConfirm: handleConfirm,
    isLoading,
    ...options,
  };

  return { open, close, modalProps };
}
