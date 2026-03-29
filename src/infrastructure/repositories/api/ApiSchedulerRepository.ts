import { 
  ISchedulerRepository, 
  ScheduledTask, 
  SchedulerStats, 
  TaskResult, 
  SchedulerStatus 
} from '@/src/application/repositories/ISchedulerRepository';

/**
 * ApiSchedulerRepository
 * Implementation of ISchedulerRepository for client-side access via API routes.
 * ✅ Following Clean Architecture - Infrastructure Layer
 */
export class ApiSchedulerRepository implements ISchedulerRepository {
  private readonly baseUrl = '/api/cron';

  async getAllTasks(): Promise<ScheduledTask[]> {
    const response = await fetch(`${this.baseUrl}/status`);
    if (!response.ok) throw new Error('Failed to fetch scheduler tasks');
    const data = await response.json() as SchedulerStatus;
    return data.tasks;
  }

  async getStats(): Promise<SchedulerStats> {
    const response = await fetch(`${this.baseUrl}/status`);
    if (!response.ok) throw new Error('Failed to fetch scheduler stats');
    const data = await response.json() as SchedulerStats;
    return {
      totalTasks: data.totalTasks,
      enabledTasks: data.enabledTasks,
      runningTasks: data.runningTasks,
    };
  }

  async runTask(taskId: string): Promise<TaskResult> {
    const response = await fetch(`${this.baseUrl}/run?task=${taskId}`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error(`Failed to run task: ${taskId}`);
    return await response.json() as TaskResult;
  }

  async dispatch(cronSecret: string): Promise<TaskResult[]> {
    const response = await fetch(`${this.baseUrl}/run`, {
      method: 'POST',
      headers: {
        'x-cron-secret': cronSecret,
      },
    });
    if (!response.ok) throw new Error('Failed to dispatch scheduler');
    const data = await response.json();
    return data.results || [];
  }

  async getFullStatus(): Promise<SchedulerStatus> {
    const response = await fetch(`${this.baseUrl}/status`);
    if (!response.ok) throw new Error('Failed to get scheduler status');
    return await response.json() as SchedulerStatus;
  }

  async runFullScheduler(): Promise<TaskResult[]> {
    const response = await fetch(`${this.baseUrl}/run`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to run full scheduler');
    const data = await response.json();
    return data.results || [];
  }
}
