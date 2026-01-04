'use client';

import { ReactNode } from 'react';
import { CrystalBubbleAnimation } from '../effects/CrystalBubbleAnimation';
import { MainFooter } from './MainFooter';
import { MainHeader } from './MainHeader';

interface MainLayoutProps {
  children: ReactNode;
  showBubbles?: boolean;
}

/**
 * MainLayout component
 * Full-screen layout without scrolling (web app style)
 * Contains Header, Main content area, and Footer
 */
export function MainLayout({ children, showBubbles = true }: MainLayoutProps) {
  return (
    <div className="relative h-screen w-screen overflow-hidden flex flex-col bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-background to-fuchsia-950/20 pointer-events-none" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
      
      {/* Crystal bubble animation */}
      {showBubbles && <CrystalBubbleAnimation />}

      {/* Header - Fixed height */}
      <MainHeader />

      {/* Main content area - Flexible, fills remaining space */}
      <main className="relative flex-1 overflow-hidden">
        <div className="h-full w-full overflow-auto scrollbar-thin">
          {children}
        </div>
      </main>

      {/* Footer - Fixed height */}
      <MainFooter />
    </div>
  );
}
