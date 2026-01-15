/**
 * Scheduler API Route (Laravel-style)
 * =====================================
 * 
 * VPS cron ต้องเรียก endpoint นี้ทุกนาที:
 * * * * * * curl -s http://localhost:3000/api/cron/scheduler >/dev/null 2>&1
 * 
 * Scheduler จะตรวจสอบว่ามี task ไหนต้องรันตอนนี้
 * แล้วเรียก handler ของแต่ละ task อัตโนมัติ
 */

import { getNextRunDescription, getTasksToRun, SCHEDULED_TASKS, ScheduledTask } from '@/src/infrastructure/scheduler/SchedulerConfig';
import { NextRequest, NextResponse } from 'next/server';

// Store last run times to prevent duplicate runs
const lastRunTimes: Record<string, number> = {};

// Minimum gap between runs of the same task (in ms)
const MIN_RUN_GAP = 55000; // 55 seconds

interface TaskResult {
  name: string;
  status: 'success' | 'error' | 'skipped';
  message?: string;
  duration?: number;
}

/**
 * Run a scheduled task by calling its handler
 */
async function runTask(task: ScheduledTask, baseUrl: string, cronSecret: string): Promise<TaskResult> {
  const startTime = Date.now();
  
  try {
    // Build full URL
    const url = `${baseUrl}${task.handler}`;
    
    // Make request to handler
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cron-secret': cronSecret,
        'x-scheduler-task': task.name,
      },
    });

    const data = await response.json();
    const duration = Date.now() - startTime;

    if (response.ok) {
      return {
        name: task.name,
        status: 'success',
        message: data.message || 'Task completed successfully',
        duration,
      };
    } else {
      return {
        name: task.name,
        status: 'error',
        message: data.error || `HTTP ${response.status}`,
        duration,
      };
    }
  } catch (error) {
    return {
      name: task.name,
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Check if task was run recently (prevent duplicate runs)
 */
function wasRunRecently(taskName: string): boolean {
  const lastRun = lastRunTimes[taskName];
  if (!lastRun) return false;
  return Date.now() - lastRun < MIN_RUN_GAP;
}

/**
 * POST /api/cron/scheduler
 * เรียกโดย VPS cron ทุกนาที
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const now = new Date();

  // Verify cron secret
  const cronSecret = request.headers.get('x-cron-secret') || '';
  const expectedSecret = process.env.CRON_SECRET;
  const isLocalhost = request.headers.get('host')?.includes('localhost');

  if (!isLocalhost && expectedSecret && cronSecret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get base URL
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host') || 'localhost:3000';
  const baseUrl = `${protocol}://${host}`;

  // Get tasks that should run now
  const tasksToRun = getTasksToRun(now);

  // Filter out tasks that were run recently
  const tasksToExecute = tasksToRun.filter(task => {
    if (task.withoutOverlapping && wasRunRecently(task.name)) {
      return false;
    }
    return true;
  });

  // Execute tasks
  const results: TaskResult[] = [];

  for (const task of tasksToExecute) {
    // Mark as running
    lastRunTimes[task.name] = Date.now();

    // Run the task
    const result = await runTask(task, baseUrl, cronSecret);
    results.push(result);

    console.log(`[Scheduler] ${task.name}: ${result.status} (${result.duration}ms)`);
  }

  const totalDuration = Date.now() - startTime;

  return NextResponse.json({
    success: true,
    timestamp: now.toISOString(),
    timezone: 'Asia/Bangkok',
    localTime: now.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }),
    tasksChecked: SCHEDULED_TASKS.length,
    tasksRun: results.length,
    results,
    duration: totalDuration,
  });
}

/**
 * GET /api/cron/scheduler
 * แสดงสถานะ scheduler และ tasks ทั้งหมด
 */
export async function GET(request: NextRequest) {
  const now = new Date();
  const tasksToRun = getTasksToRun(now);

  // Verify cron secret for running tasks
  const cronSecret = request.headers.get('x-cron-secret') || '';
  const expectedSecret = process.env.CRON_SECRET;
  const isLocalhost = request.headers.get('host')?.includes('localhost');
  const isAuthorized = isLocalhost || !expectedSecret || cronSecret === expectedSecret;

  // If authorized and tasks need to run, run them
  if (isAuthorized && tasksToRun.length > 0) {
    // Redirect to POST to actually run the tasks
    return POST(request);
  }

  // Otherwise just show status
  const tasks = SCHEDULED_TASKS.map(task => ({
    name: task.name,
    description: task.description,
    handler: task.handler,
    schedule: getNextRunDescription(task),
    enabled: task.enabled,
    shouldRunNow: tasksToRun.some(t => t.name === task.name),
    lastRun: lastRunTimes[task.name] 
      ? new Date(lastRunTimes[task.name]).toISOString() 
      : null,
  }));

  return NextResponse.json({
    status: 'running',
    timestamp: now.toISOString(),
    timezone: 'Asia/Bangkok',
    localTime: now.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }),
    totalTasks: SCHEDULED_TASKS.length,
    enabledTasks: SCHEDULED_TASKS.filter(t => t.enabled).length,
    tasksToRunNow: tasksToRun.length,
    tasks,
    setupInstructions: {
      vps: "Add this single cron entry: * * * * * curl -s http://localhost:3000/api/cron/scheduler >/dev/null 2>&1",
      vercel: "Vercel Cron is configured in vercel.json",
    },
  });
}
