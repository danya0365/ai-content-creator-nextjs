/**
 * Scheduler Configuration
 * ========================
 * 
 * แนวคิดเดียวกับ Laravel Scheduler
 * กำหนด scheduled tasks ทั้งหมดในไฟล์เดียว
 * 
 * VPS ต้องตั้ง cron เพียง 1 entry:
 * * * * * * curl -s http://localhost:3000/api/cron/scheduler >/dev/null 2>&1
 * 
 * หรือ:
 * * * * * * /opt/app/ai-content-creator-nextjs/scripts/scheduler-run.sh
 */

export type ScheduleFrequency = 
  | 'everyMinute'
  | 'everyFiveMinutes'
  | 'everyFifteenMinutes'
  | 'everyThirtyMinutes'
  | 'hourly'
  | 'hourlyAt'
  | 'daily'
  | 'dailyAt'
  | 'weekly'
  | 'monthly'
  | 'cron';

export interface ScheduledTask {
  name: string;
  description: string;
  handler: string; // API route path e.g., '/api/cron/generate'
  frequency: ScheduleFrequency;
  // For specific times
  at?: string; // e.g., '06:00' for dailyAt
  hourAt?: number; // e.g., 30 for hourlyAt (at minute 30)
  cronExpression?: string; // For custom cron
  // Options
  enabled: boolean;
  withoutOverlapping?: boolean;
  timezone?: string;
}

/**
 * Define all scheduled tasks here
 * เพิ่ม/แก้ไข scheduled tasks ได้ง่ายๆ
 */
export const SCHEDULED_TASKS: ScheduledTask[] = [
  // ==========================================
  // Morning Content (6:00)
  // ==========================================
  {
    name: 'generate-morning-content',
    description: 'Generate morning news and motivation content',
    handler: '/api/cron/generate',
    frequency: 'dailyAt',
    at: '06:00',
    enabled: true,
    timezone: 'Asia/Bangkok',
  },

  // ==========================================
  // Lunch Content (11:00)
  // ==========================================
  {
    name: 'generate-lunch-content',
    description: 'Generate food and recipe content',
    handler: '/api/cron/generate',
    frequency: 'dailyAt',
    at: '11:00',
    enabled: true,
    timezone: 'Asia/Bangkok',
  },

  // ==========================================
  // Afternoon Content (14:00)
  // ==========================================
  {
    name: 'generate-afternoon-content',
    description: 'Generate tech tips and entertainment content',
    handler: '/api/cron/generate',
    frequency: 'dailyAt',
    at: '14:00',
    enabled: true,
    timezone: 'Asia/Bangkok',
  },

  // ==========================================
  // Evening Content (18:00)
  // ==========================================
  {
    name: 'generate-evening-content',
    description: 'Generate gaming and evening content',
    handler: '/api/cron/generate',
    frequency: 'dailyAt',
    at: '18:00',
    enabled: true,
    timezone: 'Asia/Bangkok',
  },

  // ==========================================
  // Publish scheduled content (every 5 minutes)
  // ==========================================
  {
    name: 'publish-scheduled-content',
    description: 'Publish content that is scheduled for now',
    handler: '/api/cron/publish',
    frequency: 'everyFiveMinutes',
    enabled: true,
  },

  // ==========================================
  // Weekly Report (Monday 9:00 AM)
  // ==========================================
  {
    name: 'weekly-report',
    description: 'Generate weekly analytics report',
    handler: '/api/cron/weekly-report',
    frequency: 'cron',
    cronExpression: '0 9 * * 1', // Monday 9:00 AM
    enabled: true,
    timezone: 'Asia/Bangkok',
  },
];

/**
 * Check if a task should run now based on its schedule
 */
export function shouldRunNow(task: ScheduledTask, now: Date): boolean {
  if (!task.enabled) return false;

  // Get time in task's timezone
  const timezone = task.timezone || 'Asia/Bangkok';
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: 'numeric',
    weekday: 'short',
    day: 'numeric',
    hour12: false,
  });
  
  const parts = formatter.formatToParts(now);
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
  const weekday = parts.find(p => p.type === 'weekday')?.value || '';
  const day = parseInt(parts.find(p => p.type === 'day')?.value || '1');

  switch (task.frequency) {
    case 'everyMinute':
      return true;

    case 'everyFiveMinutes':
      return minute % 5 === 0;

    case 'everyFifteenMinutes':
      return minute % 15 === 0;

    case 'everyThirtyMinutes':
      return minute % 30 === 0;

    case 'hourly':
      return minute === 0;

    case 'hourlyAt':
      return minute === (task.hourAt || 0);

    case 'daily':
      return hour === 0 && minute === 0;

    case 'dailyAt':
      if (!task.at) return false;
      const [targetHour, targetMinute] = task.at.split(':').map(Number);
      return hour === targetHour && minute === targetMinute;

    case 'weekly':
      return weekday === 'Sun' && hour === 0 && minute === 0;

    case 'monthly':
      return day === 1 && hour === 0 && minute === 0;

    case 'cron':
      return matchesCronExpression(task.cronExpression || '', now, timezone);

    default:
      return false;
  }
}

/**
 * Simple cron expression matcher
 * Supports: minute hour day month weekday
 */
function matchesCronExpression(expression: string, now: Date, timezone: string): boolean {
  if (!expression) return false;

  const parts = expression.split(' ');
  if (parts.length !== 5) return false;

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    minute: 'numeric',
    hour: 'numeric',
    day: 'numeric',
    month: 'numeric',
    weekday: 'short',
    hour12: false,
  });

  const dateParts = formatter.formatToParts(now);
  const minute = parseInt(dateParts.find(p => p.type === 'minute')?.value || '0');
  const hour = parseInt(dateParts.find(p => p.type === 'hour')?.value || '0');
  const day = parseInt(dateParts.find(p => p.type === 'day')?.value || '1');
  const month = parseInt(dateParts.find(p => p.type === 'month')?.value || '1');
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(
    dateParts.find(p => p.type === 'weekday')?.value || 'Sun'
  );

  const [cronMin, cronHour, cronDay, cronMonth, cronWeekday] = parts;

  return (
    matchesCronField(cronMin, minute) &&
    matchesCronField(cronHour, hour) &&
    matchesCronField(cronDay, day) &&
    matchesCronField(cronMonth, month) &&
    matchesCronField(cronWeekday, weekday)
  );
}

function matchesCronField(field: string, value: number): boolean {
  if (field === '*') return true;
  
  // Handle comma-separated values
  if (field.includes(',')) {
    return field.split(',').some(v => parseInt(v) === value);
  }
  
  // Handle ranges (e.g., 1-5)
  if (field.includes('-')) {
    const [start, end] = field.split('-').map(Number);
    return value >= start && value <= end;
  }
  
  // Handle step values (e.g., */5)
  if (field.includes('/')) {
    const [, step] = field.split('/');
    return value % parseInt(step) === 0;
  }
  
  return parseInt(field) === value;
}

/**
 * Get all tasks that should run now
 */
export function getTasksToRun(now: Date = new Date()): ScheduledTask[] {
  return SCHEDULED_TASKS.filter(task => shouldRunNow(task, now));
}

/**
 * Get next run time for a task (for display purposes)
 */
export function getNextRunDescription(task: ScheduledTask): string {
  switch (task.frequency) {
    case 'everyMinute':
      return 'Every minute';
    case 'everyFiveMinutes':
      return 'Every 5 minutes';
    case 'everyFifteenMinutes':
      return 'Every 15 minutes';
    case 'everyThirtyMinutes':
      return 'Every 30 minutes';
    case 'hourly':
      return 'Every hour at :00';
    case 'hourlyAt':
      return `Every hour at :${String(task.hourAt || 0).padStart(2, '0')}`;
    case 'daily':
      return 'Daily at 00:00';
    case 'dailyAt':
      return `Daily at ${task.at}`;
    case 'weekly':
      return 'Weekly on Sunday at 00:00';
    case 'monthly':
      return 'Monthly on the 1st at 00:00';
    case 'cron':
      return `Cron: ${task.cronExpression}`;
    default:
      return 'Unknown';
  }
}
