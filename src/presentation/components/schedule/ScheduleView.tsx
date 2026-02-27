'use client';

import { Content } from '@/src/application/repositories/IContentRepository';
import { TimeSlot, TimeSlotConfig } from '@/src/data/master/contentTypes';
import { ScheduleDay, ScheduleViewModel } from '@/src/presentation/presenters/schedule/SchedulePresenter';
import { useSchedulePresenter } from '@/src/presentation/presenters/schedule/useSchedulePresenter';
import { useGenerateStore } from '@/src/presentation/stores/useGenerateStore';
import { animated, config, useSpring } from '@react-spring/web';
import { useEffect } from 'react';
import { GenerateContentModal } from '../generate/GenerateContentModal';
import { MainLayout } from '../layout/MainLayout';
import { JellyButton } from '../ui/JellyButton';
import { JellyCard } from '../ui/JellyCard';
import { SmartImage } from '../ui/SmartImage';

interface DayColumnProps {
  day: ScheduleDay;
  isSelected: boolean;
  onClick: () => void;
  delay: number;
}

function DayColumn({ day, isSelected, onClick, delay }: DayColumnProps) {
  const springProps = useSpring({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    delay,
    config: config.gentle,
  });

  return (
    <animated.div style={springProps}>
      <JellyCard
        onClick={onClick}
        as="button"
        className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-300 min-w-[70px] ${
          isSelected
            ? 'bg-gradient-to-b from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/25'
            : day.isToday
            ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
            : 'glass-card text-muted hover:text-foreground'
        }`}
      >
        <span className="text-xs font-medium mb-1">{day.dayOfWeek}</span>
        <span className="text-xl font-bold">{day.dayNumber}</span>
        {day.contents.length > 0 && (
          <div className="flex gap-0.5 mt-2">
            {day.contents.slice(0, 3).map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-violet-400'}`} />
            ))}
          </div>
        )}
      </JellyCard>
    </animated.div>
  );
}

interface TimeSlotRowProps {
  slot: TimeSlotConfig;
  contents: Content[];
  onAddContent: () => void;
}

function TimeSlotRow({ slot, contents, onAddContent }: TimeSlotRowProps) {
  return (
    <div className="flex gap-4 items-stretch">
      {/* Time label */}
      <div className="w-24 flex-shrink-0 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{slot.emoji}</span>
          <div>
            <div className="text-sm font-medium text-foreground">{slot.nameTh}</div>
            <div className="text-xs text-muted">{slot.startHour}:00 - {slot.endHour}:00</div>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 min-h-[100px] glass-card rounded-xl p-3 flex gap-3 overflow-x-auto scrollbar-thin">
        {contents.length > 0 ? (
          contents.map((content) => (
            <JellyCard
              key={content.id}
              className="flex-shrink-0 w-48 glass-card-hover p-3 rounded-xl"
            >
              <div className="w-full aspect-video rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 mb-2 flex items-center justify-center overflow-hidden relative">
                <SmartImage
                  src={content.imageUrl}
                  alt={content.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 300px"
                  emojiClassName="text-2xl"
                  containerClassName="w-full h-full flex items-center justify-center absolute inset-0"
                />
              </div>
              <h4 className="text-xs font-medium text-foreground line-clamp-2">{content.title}</h4>
            </JellyCard>
          ))
        ) : (
          <JellyCard
            onClick={onAddContent}
            as="button"
            className="flex-shrink-0 w-48 h-full min-h-[80px] border-2 border-dashed border-border/50 rounded-xl flex flex-col items-center justify-center text-muted hover:text-foreground hover:border-violet-500/50 transition-colors"
          >
            <span className="text-xl mb-1">+</span>
            <span className="text-xs">เพิ่มคอนเทนต์</span>
          </JellyCard>
        )}
        
        {/* Add more button if has contents */}
        {contents.length > 0 && (
          <JellyCard
            onClick={onAddContent}
            as="button"
            className="flex-shrink-0 w-12 border-2 border-dashed border-border/50 rounded-xl flex items-center justify-center text-muted hover:text-foreground hover:border-violet-500/50 transition-colors"
          >
            <span className="text-xl">+</span>
          </JellyCard>
        )}
      </div>
    </div>
  );
}

interface ScheduleViewProps {
  initialViewModel?: ScheduleViewModel;
}

/**
 * ScheduleView component
 * Calendar view with jelly animations
 * ✅ Clean View - All logic moved to useSchedulePresenter hook
 */
export function ScheduleView({ initialViewModel }: ScheduleViewProps) {
  // ✅ All state and logic comes from hook
  const [state, actions] = useSchedulePresenter(initialViewModel);
  
  const viewModel = state.viewModel || {
    currentWeek: [],
    timeSlots: [],
    contentTypes: [],
    scheduledContents: [],
    totalScheduled: 0,
  };

  // Zustand store
  const { isModalOpen, openModal, closeModal, generateContent, generatedContent } = useGenerateStore();

  // Auto-refresh when new content is generated
  useEffect(() => {
    if (generatedContent) {
      actions.refresh();
    }
  }, [generatedContent, actions]);

  const headerSpring = useSpring({
    from: { opacity: 0, y: -10 },
    to: { opacity: 1, y: 0 },
    config: config.gentle,
  });

  // Loading state
  if (state.loading && !state.viewModel) {
    return (
      <MainLayout showBubbles={false}>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-muted">กำลังโหลด...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (state.error) {
    return (
      <MainLayout showBubbles={false}>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-4">{state.error}</p>
            <JellyButton onClick={actions.refresh} variant="primary">
              ลองใหม่
            </JellyButton>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showBubbles={false}>
      <div className="h-full overflow-auto scrollbar-thin">
        <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
          
          {/* Header */}
          <animated.div style={headerSpring} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold gradient-text-purple">Schedule</h1>
              <p className="text-sm text-muted">
                จัดตารางโพสต์คอนเทนต์ • {viewModel.totalScheduled} รายการที่กำลังรอโพสต์
              </p>
            </div>
            <JellyButton 
              variant="primary" 
              size="lg" 
              onClick={() => openModal({ scheduledDate: state.selectedDay?.dateString })}
            >
              <span>➕</span>
              <span>เพิ่ม Schedule</span>
            </JellyButton>
          </animated.div>

          {/* Week selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {viewModel.currentWeek.map((day, index) => (
              <DayColumn
                key={day.dateString}
                day={day}
                isSelected={state.selectedDayIndex === index}
                onClick={() => actions.selectDay(index)}
                delay={100 + index * 50}
              />
            ))}
          </div>

          {/* Selected day info */}
          {state.selectedDay && (
            <JellyCard className="glass-card p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {state.selectedDay.isToday ? 'วันนี้' : `${state.selectedDay.dayOfWeek}ที่ ${state.selectedDay.dayNumber}`}
                  </h2>
                  <p className="text-sm text-muted">
                    {state.selectedDay.contents.length} คอนเทนต์ที่กำหนดไว้
                  </p>
                </div>
                {state.selectedDay.isToday && (
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                    Today
                  </span>
                )}
              </div>

              {/* Time slots */}
              <div className="space-y-4">
                {viewModel.timeSlots.map((slot) => (
                  <TimeSlotRow
                    key={slot.id}
                    slot={slot}
                    contents={actions.getContentsForSlot(slot)}
                    onAddContent={() => openModal({
                      timeSlot: slot.id as TimeSlot,
                      scheduledDate: state.selectedDay?.dateString,
                      scheduledTime: `${slot.startHour}:00`
                    })}
                  />
                ))}
              </div>
            </JellyCard>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {viewModel.timeSlots.map((slot) => {
              const count = viewModel.scheduledContents.filter((c) => c.timeSlot === slot.id).length;
              return (
                <JellyCard key={slot.id} className="glass-card p-4 flex items-center gap-3">
                  <span className="text-2xl">{slot.emoji}</span>
                  <div>
                    <div className="text-lg font-bold text-foreground">{count}</div>
                    <div className="text-xs text-muted">{slot.nameTh}</div>
                  </div>
                </JellyCard>
              );
            })}
          </div>
        </div>
      </div>

      {/* Generate Content Modal */}
      <GenerateContentModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onGenerate={generateContent}
      />
    </MainLayout>
  );
}
