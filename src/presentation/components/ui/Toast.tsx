'use client';

import { animated, useSpring, useTransition } from '@react-spring/web';
import { createContext, useCallback, useContext, useState } from 'react';

// Toast Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

/**
 * useToast hook - Access toast functionality
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/**
 * ToastProvider - Global toast state management
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 4000,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

/**
 * ToastContainer - Renders all active toasts
 */
function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const transitions = useTransition(toasts, {
    from: { opacity: 0, x: 100, scale: 0.9 },
    enter: { opacity: 1, x: 0, scale: 1 },
    leave: { opacity: 0, x: 100, scale: 0.9 },
    config: {
      tension: 300,
      friction: 20,
    },
  });

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {transitions((style, toast) => (
        <animated.div
          key={toast.id}
          style={style}
          className="pointer-events-auto"
        >
          <ToastItem toast={toast} onClose={() => removeToast(toast.id)} />
        </animated.div>
      ))}
    </div>
  );
}

/**
 * ToastItem - Individual toast notification
 */
interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const spring = useSpring({
    scale: isHovered ? 1.02 : 1,
    config: { tension: 400, friction: 15 },
  });

  const typeConfig = {
    success: {
      icon: '✅',
      bgClass: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
      iconBg: 'bg-green-500/20',
      titleColor: 'text-green-400',
    },
    error: {
      icon: '❌',
      bgClass: 'from-red-500/20 to-rose-500/20 border-red-500/30',
      iconBg: 'bg-red-500/20',
      titleColor: 'text-red-400',
    },
    warning: {
      icon: '⚠️',
      bgClass: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
      iconBg: 'bg-amber-500/20',
      titleColor: 'text-amber-400',
    },
    info: {
      icon: 'ℹ️',
      bgClass: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
      iconBg: 'bg-blue-500/20',
      titleColor: 'text-blue-400',
    },
  };

  const config = typeConfig[toast.type];

  return (
    <animated.div
      style={{ transform: spring.scale.to((s) => `scale(${s})`) }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative overflow-hidden
        bg-gradient-to-r ${config.bgClass}
        backdrop-blur-xl border rounded-2xl
        p-4 shadow-2xl shadow-black/20
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`w-8 h-8 rounded-xl ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
          <span className="text-lg">{config.icon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold ${config.titleColor}`}>
            {toast.title}
          </h4>
          {toast.message && (
            <p className="text-xs text-muted mt-0.5 line-clamp-2">
              {toast.message}
            </p>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-lg hover:bg-white/10 flex items-center justify-center text-muted hover:text-foreground transition-colors flex-shrink-0"
        >
          ✕
        </button>
      </div>

      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r from-violet-500 to-fuchsia-500`}
            style={{
              animation: `shrink ${toast.duration}ms linear forwards`,
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </animated.div>
  );
}

/**
 * Helper functions for common toast types
 */
export const toast = {
  success: (title: string, message?: string, duration?: number) => ({
    type: 'success' as ToastType,
    title,
    message,
    duration,
  }),
  error: (title: string, message?: string, duration?: number) => ({
    type: 'error' as ToastType,
    title,
    message,
    duration,
  }),
  warning: (title: string, message?: string, duration?: number) => ({
    type: 'warning' as ToastType,
    title,
    message,
    duration,
  }),
  info: (title: string, message?: string, duration?: number) => ({
    type: 'info' as ToastType,
    title,
    message,
    duration,
  }),
};
