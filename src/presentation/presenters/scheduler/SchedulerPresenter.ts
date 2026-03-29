import { Metadata } from 'next';
import { 
  ISchedulerRepository, 
  ScheduledTask, 
  SchedulerStats, 
  TaskResult, 
  SchedulerStatus,
  SchedulerRunResponse,
  SchedulerStatusResponse
} from '@/src/application/repositories/ISchedulerRepository';

export type { TaskResult };

export interface SchedulerViewModel {
  tasks: (ScheduledTask & { shouldRunNow: boolean; lastRun: string | null })[];
  stats: SchedulerStats;
  lastRunResults: Record<string, TaskResult>;
  timestamp: string;
  localTime: string;
}

export class SchedulerPresenter {
  constructor(private readonly repository: ISchedulerRepository) {}

  /**
   * Get view model for the page (For Server/Client Components)
   */
  async getViewModel(): Promise<SchedulerViewModel> {
    try {
      const status = await this.repository.getFullStatus();

      return {
        tasks: status.tasks,
        stats: {
          totalTasks: status.totalTasks,
          enabledTasks: status.enabledTasks,
          runningTasks: status.runningTasks,
        },
        lastRunResults: {}, // Initially empty
        timestamp: status.timestamp,
        localTime: status.localTime,
      };
    } catch (error) {
      console.error('[SchedulerPresenter] Error getting view model:', error);
      throw error;
    }
  }

  /**
   * Generate metadata for the page
   */
  generateMetadata(): Metadata {
    return {
      title: "Scheduler Debug | Kongkadoo",
      description: "Manage and test automated content generation schedules",
    };
  }

  /**
   * Handle the POST request logic and response formatting
   */
  async handleRunRequest(cronSecret: string): Promise<SchedulerRunResponse> {
    const startTime = Date.now();
    
    // Execute dispatcher in the repository
    const results = await this.repository.dispatch(cronSecret);
    
    const status = await this.repository.getFullStatus();
    const duration = Date.now() - startTime;

    return {
      success: true,
      timestamp: status.timestamp,
      timezone: status.timezone,
      localTime: status.localTime,
      tasksChecked: status.totalTasks,
      tasksRun: results.length,
      results,
      duration: duration,
    };
  }

  /**
   * Handle the GET request logic and response formatting
   */
  async handleStatusRequest(isAuthorized: boolean, cronSecret: string): Promise<SchedulerStatusResponse | SchedulerRunResponse> {
    if (!isAuthorized) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        timezone: 'Asia/Bangkok',
        localTime: new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }),
        tasksChecked: 0,
        tasksRun: 0,
        results: [],
        duration: 0,
        error: 'Unauthorized',
      } as SchedulerRunResponse;
    }

    const status = await this.repository.getFullStatus();

    // If authorized and tasks need to run, trigger the run logic (Dispatcher mode)
    if (status.tasksToRunNow > 0) {
      return this.handleRunRequest(cronSecret);
    }

    // Add setup instructions in the presenter layer for the API response
    return {
      ...status,
      setupInstructions: {
        vps: "Add this single cron entry: * * * * * curl -s http://localhost:3000/api/cron/scheduler >/dev/null 2>&1",
        vercel: "Vercel Cron is configured in vercel.json",
      },
    };
  }

  /**
   * Run a specific task manually (For Debug UI)
   */
  async runTask(taskId: string): Promise<TaskResult> {
    return this.repository.runTask(taskId);
  }

  /**
   * Run the full scheduler manually (Legacy support)
   */
  async runFullScheduler(): Promise<TaskResult[]> {
    return this.repository.runFullScheduler();
  }
}
