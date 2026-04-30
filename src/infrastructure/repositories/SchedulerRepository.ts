import { ISchedulerRepository, ScheduledTask, SchedulerStats, TaskResult, SchedulerStatus } from '@/src/application/repositories/ISchedulerRepository';
import { getNextRunDescription, getTasksToRun, SCHEDULED_TASKS } from '@/src/infrastructure/scheduler/SchedulerConfig';
import { SchedulerInternalState } from '@/src/infrastructure/scheduler/SchedulerInternalState';
import http from 'http';

// Minimum gap between runs of the same task (in ms)
const MIN_RUN_GAP = 55000; // 55 seconds

export class SchedulerRepository implements ISchedulerRepository {
  private internalState = SchedulerInternalState.getInstance();

  async getAllTasks(): Promise<ScheduledTask[]> {
    return SCHEDULED_TASKS.map(task => ({
      id: task.name,
      name: task.name,
      description: task.description,
      handler: task.handler,
      frequency: task.frequency,
      schedule: getNextRunDescription(task),
      enabled: task.enabled,
      timezone: task.timezone || 'Asia/Bangkok',
    }));
  }

  async getStats(): Promise<SchedulerStats> {
    const totalTasks = SCHEDULED_TASKS.length;
    const enabledTasks = SCHEDULED_TASKS.filter(t => t.enabled).length;
    
    return {
      totalTasks,
      enabledTasks,
      runningTasks: 0, // Volatile state
    };
  }

  /**
   * Run a specific task manually (Triggered by Debug UI)
   */
  async runTask(taskId: string): Promise<TaskResult> {
    const task = SCHEDULED_TASKS.find(t => t.name === taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    // Getting cron secret from environment for manual triggers
    const cronSecret = process.env.CRON_SECRET || '';
    return this.executeTaskInternally(task, cronSecret);
  }

  /**
   * Run the full scheduler dispatcher (Triggered by POST)
   */
  async dispatch(cronSecret: string): Promise<TaskResult[]> {
    const now = new Date();
    const tasksToRun = getTasksToRun(now);

    // Filter out tasks that were run recently
    const tasksToExecute = tasksToRun.filter(task => {
      if (task.withoutOverlapping && this.wasRunRecently(task.name)) {
        return false;
      }
      return true;
    });

    const results: TaskResult[] = [];
    for (const task of tasksToExecute) {
      // Mark as running
      this.internalState.setLastRunTime(task.name, Date.now());

      // Run the task
      const result = await this.executeTaskInternally(task, cronSecret);
      results.push(result);
    }

    return results;
  }

  /**
   * Get full scheduler status (Triggered by GET/UI)
   */
  async getFullStatus(): Promise<SchedulerStatus> {
    const now = new Date();
    const tasksToRun = getTasksToRun(now);
    const stats = await this.getStats();

    const tasks = SCHEDULED_TASKS.map(task => {
      const lastRun = this.internalState.getLastRunTime(task.name);
      return {
        id: task.name,
        name: task.name,
        description: task.description,
        handler: task.handler,
        frequency: task.frequency,
        schedule: getNextRunDescription(task),
        enabled: task.enabled,
        timezone: task.timezone || 'Asia/Bangkok',
        shouldRunNow: tasksToRun.some(t => t.name === task.name),
        lastRun: lastRun ? new Date(lastRun).toISOString() : null,
      };
    });

    return {
      ...stats,
      status: 'running',
      timestamp: now.toISOString(),
      timezone: 'Asia/Bangkok',
      localTime: now.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }),
      tasksToRunNow: tasksToRun.length,
      tasks,
    };
  }

  /**
   * Run the full scheduler dispatcher via API call (Legacy support)
   */
  async runFullScheduler(): Promise<TaskResult[]> {
    const cronSecret = process.env.CRON_SECRET || '';
    return this.dispatch(cronSecret);
  }

  // ===========================================================================
  // PRIVATE HELPERS
  // ===========================================================================

  private async executeTaskInternally(task: { handler: string, name: string }, cronSecret: string): Promise<TaskResult> {
    const startTime = Date.now();
    
    return new Promise<TaskResult>((resolve) => {
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
            const isOk = res.statusCode && res.statusCode >= 200 && res.statusCode < 300;
            resolve({
              name: task.name,
              status: isOk ? 'success' : 'error',
              message: data.message || data.error || (isOk ? 'Success' : `HTTP Error ${res.statusCode}`),
              duration: Date.now() - startTime,
              timestamp: new Date().toISOString(),
            });
          } catch (e) {
            resolve({
              name: task.name,
              status: 'error',
              message: `Invalid response: ${body.substring(0, 50)}`,
              duration: Date.now() - startTime,
              timestamp: new Date().toISOString(),
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
          timestamp: new Date().toISOString(),
        });
      });

      req.end();
    });
  }

  private wasRunRecently(taskName: string): boolean {
    const lastRun = this.internalState.getLastRunTime(taskName);
    if (!lastRun) return false;
    return Date.now() - lastRun < MIN_RUN_GAP;
  }
}
