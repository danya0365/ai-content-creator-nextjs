import { ISchedulerRepository, ScheduledTask, SchedulerStats, TaskResult } from '@/src/application/repositories/ISchedulerRepository';
import { getNextRunDescription, SCHEDULED_TASKS } from '@/src/infrastructure/scheduler/SchedulerConfig';

export class SchedulerRepository implements ISchedulerRepository {
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
      runningTasks: 0, // Volatile state, handled by UI/Presenter
    };
  }

  async runTask(taskId: string): Promise<TaskResult> {
    const task = SCHEDULED_TASKS.find(t => t.name === taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    const startTime = Date.now();
    try {
      // Trigger via API call (internal fetch)
      const response = await fetch(task.handler, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      return {
        name: task.name,
        status: response.ok ? 'success' : 'error',
        message: data.message || data.error || (response.ok ? 'Success' : `HTTP Error ${response.status}`),
        duration,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        name: task.name,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error during task execution',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async runFullScheduler(): Promise<TaskResult[]> {
    const startTime = Date.now();
    try {
      const response = await fetch('/api/cron/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP Error ${response.status}`);
      }

      return (data.results || []).map((res: any) => ({
        name: res.name,
        status: res.status,
        message: res.message,
        duration: res.duration,
        timestamp: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to run scheduler:', error);
      throw error;
    }
  }
}
