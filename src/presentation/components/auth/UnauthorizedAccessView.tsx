'use client';

/**
 * UnauthorizedAccessView
 * Displayed when a user is authenticated but lacks the required role
 */

import Link from 'next/link';
import { JellyCard } from '../ui/JellyCard';
import { JellyButton } from '../ui/JellyButton';
import { animated, useSpring, config } from '@react-spring/web';

interface UnauthorizedAccessViewProps {
  title?: string;
  message?: string;
  returnPath?: string;
  returnLabel?: string;
}

export function UnauthorizedAccessView({
  title = 'ไม่มีสิทธิ์เข้าถึง',
  message = 'หน้านี้สงวนสิทธิ์เฉพาะผู้ใช้ที่มีบทบาทที่กำหนดเท่านั้น',
  returnPath = '/',
  returnLabel = 'กลับสู่หน้าหลัก',
}: UnauthorizedAccessViewProps) {
  const spring = useSpring({
    from: { opacity: 0, y: 30 },
    to: { opacity: 1, y: 0 },
    config: config.gentle,
  });

  return (
    <div className="flex items-center justify-center py-20 px-6">
      <animated.div style={spring} className="w-full max-w-md">
        <JellyCard className="glass-card p-10 text-center relative overflow-hidden group">
          {/* Background decoration */}
          <div className="absolute -top-24 -right-24 w-56 h-56 bg-red-500/10 rounded-full blur-3xl group-hover:bg-red-500/20 transition-colors duration-700" />
          <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-violet-600/10 rounded-full blur-3xl group-hover:bg-violet-600/20 transition-colors duration-700" />

          <div className="relative z-10">
            <div className="text-7xl mb-8 inline-block filter drop-shadow-2xl translate-y-[-10%] animate-float">🔒</div>
            
            <h1 className="text-2xl font-bold gradient-text-purple mb-4">
              {title}
            </h1>
            
            <p className="text-muted mb-10 leading-relaxed font-medium">
              {message}
            </p>
            
            <Link href={returnPath}>
              <JellyButton variant="primary" size="lg" className="w-full">
                <span>🏠</span>
                <span>{returnLabel}</span>
              </JellyButton>
            </Link>
          </div>
        </JellyCard>
      </animated.div>
    </div>
  );
}
