'use client';

import { animated, config, useSpring } from '@react-spring/web';
import { JellyCard } from '../ui/JellyCard';

import { DashboardActivity } from '../../presenters/dashboard/DashboardPresenter';

type ActivityType = DashboardActivity['type'];

// Activity type config
const ACTIVITY_CONFIG: Record<ActivityType, { icon: string; label: string; color: string }> = {
  created: { icon: '✨', label: 'สร้างใหม่', color: 'bg-violet-500/20 text-violet-400' },
  published: { icon: '✅', label: 'เผยแพร่', color: 'bg-green-500/20 text-green-400' },
  scheduled: { icon: '📅', label: 'กำหนดเวลา', color: 'bg-blue-500/20 text-blue-400' },
  edited: { icon: '✏️', label: 'แก้ไข', color: 'bg-amber-500/20 text-amber-400' },
  deleted: { icon: '🗑️', label: 'ลบ', color: 'bg-red-500/20 text-red-400' },
};

/**
 * Format relative time
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'เมื่อสักครู่';
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
  if (diffDays === 1) return 'เมื่อวาน';
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
}

/**
 * Group activities by date
 */
function groupActivitiesByDate(activities: DashboardActivity[]) {
  const groups: { label: string; activities: DashboardActivity[] }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayActivities: DashboardActivity[] = [];
  const yesterdayActivities: DashboardActivity[] = [];
  const olderActivities: DashboardActivity[] = [];

  activities.forEach((activity) => {
    const activityDate = new Date(activity.timestamp);
    activityDate.setHours(0, 0, 0, 0);

    if (activityDate.getTime() === today.getTime()) {
      todayActivities.push(activity);
    } else if (activityDate.getTime() === yesterday.getTime()) {
      yesterdayActivities.push(activity);
    } else {
      olderActivities.push(activity);
    }
  });

  if (todayActivities.length > 0) {
    groups.push({ label: 'วันนี้', activities: todayActivities });
  }
  if (yesterdayActivities.length > 0) {
    groups.push({ label: 'เมื่อวาน', activities: yesterdayActivities });
  }
  if (olderActivities.length > 0) {
    groups.push({ label: 'ก่อนหน้า', activities: olderActivities });
  }

  return groups;
}

interface ActivityItemProps {
  activity: DashboardActivity;
  delay: number;
}

function ActivityItem({ activity, delay }: ActivityItemProps) {
  const config = ACTIVITY_CONFIG[activity.type];

  const spring = useSpring({
    from: { opacity: 0, x: -20 },
    to: { opacity: 1, x: 0 },
    delay,
    config: { tension: 300, friction: 20 },
  });

  return (
    <animated.div style={spring} className="flex items-center gap-3 py-2">
      {/* Icon */}
      <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center text-sm flex-shrink-0`}>
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-sm text-foreground truncate">{activity.title}</div>
        <div className="text-xs text-muted flex items-center gap-2">
          <span>{config.label}</span>
          <span>•</span>
          <span suppressHydrationWarning>{formatRelativeTime(activity.timestamp)}</span>
        </div>
      </div>
    </animated.div>
  );
}

interface ActivityFeedProps {
  className?: string;
  maxItems?: number;
  activities?: DashboardActivity[];
}

/**
 * ActivityFeed - Recent activities list grouped by date
 */
export function ActivityFeed({ className = '', maxItems = 10, activities = [] }: ActivityFeedProps) {
  const spring = useSpring({
    from: { opacity: 0, y: 10 },
    to: { opacity: 1, y: 0 },
    config: config.gentle,
  });

  const displayActivities = activities.slice(0, maxItems);
  const groupedActivities = groupActivitiesByDate(displayActivities);

  return (
    <animated.div style={spring}>
      <JellyCard className={`glass-card p-5 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">🕐 กิจกรรมล่าสุด</h3>
          <button className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
            ดูทั้งหมด →
          </button>
        </div>

        {/* Activity groups */}
        <div className="space-y-4">
          {groupedActivities.map((group, groupIndex) => (
            <div key={group.label}>
              {/* Group label */}
              <div className="text-xs text-muted font-medium mb-2 flex items-center gap-2">
                <span>{group.label}</span>
                <div className="flex-1 h-px bg-border/30" />
              </div>

              {/* Activities */}
              <div className="space-y-1">
                {group.activities.map((activity, index) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    delay={100 + groupIndex * 100 + index * 50}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {displayActivities.length === 0 && (
          <div className="text-center py-8 text-muted">
            <span className="text-3xl mb-2 block">📭</span>
            <p className="text-sm">ยังไม่มีกิจกรรม</p>
          </div>
        )}
      </JellyCard>
    </animated.div>
  );
}
