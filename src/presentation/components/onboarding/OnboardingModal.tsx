'use client';

import { animated, config, useSpring } from '@react-spring/web';
import { useEffect, useState } from 'react';
import { JellyButton } from '../ui/JellyButton';

interface OnboardingStep {
  title: string;
  description: string;
  icon: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: 'Welcome! 🎉',
    description: 'สร้างคอนเทนต์ด้วย AI อัตโนมัติ แบบ Pixel Art สุดน่ารัก',
    icon: '✨',
  },
  {
    title: 'สร้างคอนเทนต์',
    description: 'กด "N" เพื่อสร้างคอนเทนต์ใหม่ หรือกดปุ่ม ✨ ที่ Dashboard',
    icon: '🎨',
  },
  {
    title: 'ตั้งเวลาโพสต์',
    description: 'ตั้งเวลาโพสต์อัตโนมัติตาม Time Slot ที่กำหนด',
    icon: '📅',
  },
  {
    title: 'Keyboard Shortcuts',
    description: 'กด ? เพื่อดู Keyboard Shortcuts ทั้งหมด',
    icon: '⌨️',
  },
];

const ONBOARDING_KEY = 'ai-content-creator-onboarding-v1';

/**
 * OnboardingModal - Welcome modal for new users
 */
export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasSeenOnboarding) {
      setIsOpen(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const backdropSpring = useSpring({
    opacity: isOpen ? 1 : 0,
    config: config.gentle,
  });

  const modalSpring = useSpring({
    opacity: isOpen ? 1 : 0,
    scale: isOpen ? 1 : 0.9,
    y: isOpen ? 0 : 30,
    config: config.gentle,
  });

  const stepSpring = useSpring({
    opacity: 1,
    x: 0,
    from: { opacity: 0, x: 20 },
    reset: true,
    key: currentStep,
    config: config.gentle,
  });

  if (!isOpen) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <animated.div
      style={backdropSpring}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
    >
      <animated.div
        style={modalSpring}
        className="glass-card p-6 md:p-8 max-w-md w-full text-center"
      >
        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mb-6">
          {ONBOARDING_STEPS.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'w-6 bg-gradient-to-r from-violet-500 to-fuchsia-500'
                  : index < currentStep
                  ? 'bg-violet-400'
                  : 'bg-surface'
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <animated.div style={stepSpring} className="mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 flex items-center justify-center text-4xl">
            {step.icon}
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            {step.title}
          </h2>
          <p className="text-sm md:text-base text-muted">
            {step.description}
          </p>
        </animated.div>

        {/* Actions */}
        <div className="flex gap-3">
          <JellyButton
            onClick={handleSkip}
            variant="ghost"
            className="flex-1"
          >
            ข้าม
          </JellyButton>
          <JellyButton
            onClick={handleNext}
            variant="primary"
            className="flex-1"
          >
            {isLastStep ? '🚀 เริ่มใช้งาน' : 'ต่อไป →'}
          </JellyButton>
        </div>
      </animated.div>
    </animated.div>
  );
}
