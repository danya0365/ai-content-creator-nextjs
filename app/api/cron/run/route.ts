// TODO: Refactor according to CREATE_PAGE_PATTERN.md - Move business logic and direct DB/Repository access to Server Presenter
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
import { authorizeCronRequest } from '@/src/infrastructure/auth/cron-auth';
import { NextRequest, NextResponse } from 'next/server';
import http from 'http';

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
    // Use Node.js http module for more reliable internal communication in Docker
    const result = await new Promise<TaskResult>((resolve) => {
      const options = {
        hostname: '127.0.0.1',
        port: 3000,
        path: task.handler,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-cron-secret': cronSecret,
          'x-scheduler-task': task.name,
          'host': 'localhost:3000',
        },
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const data = JSON.parse(body || '{}');
            const isOk = res.statusCode ? (res.statusCode >= 200 && res.statusCode < 300) : false;
            resolve({
              name: task.name,
              status: isOk ? 'success' : 'error',
              message: data.message || data.error || (isOk ? 'Success' : `HTTP Error ${res.statusCode}`),
              duration: Date.now() - startTime,
            });
          } catch (e) {
            resolve({
              name: task.name,
              status: 'error',
              message: `Invalid response: ${body.substring(0, 50)}`,
              duration: Date.now() - startTime,
            });
          }
        });
      });

      req.on('error', (err) => {
        resolve({
          name: task.name,
          status: 'error',
          message: `Internal connection failed: ${err.message}`,
          duration: Date.now() - startTime,
        });
      });

      req.end();
    });

    return result;
  } catch (error) {
    console.error(`[Scheduler] ❌ Error running task ${task.name}:`, error);
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

  // Verify authorization (VPS Secret or Admin Session)
  const isAuthorized = await authorizeCronRequest(request);

  if (!isAuthorized) {
    console.warn(`[Scheduler] Unauthorized access attempt from ${request.headers.get('x-forwarded-for') || 'unknown'}`);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get cron secret for calling sub-tasks internally
  const cronSecret = request.headers.get('x-cron-secret') || process.env.CRON_SECRET || '';

  // Log heartbeat of the endpoint being hit
  console.log(`[Scheduler] API Hook triggered at ${now.toISOString()} (${now.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })})`);

  // Get base URL for internal triggers
  // 🐳 In Docker/VPS, we use the container hostname 'nextjs-ai-creator' 
  // which is mapped to the internal IP by Docker DNS.
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = isProduction ? 'http://nextjs-ai-creator:3000' : 'http://localhost:3000';
  
  // NOTE: nextjs-ai-creator:3000 is the internal address of the container.

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

  // Verify authorization (VPS Secret or Admin Session)
  const isAuthorized = await authorizeCronRequest(request);

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
