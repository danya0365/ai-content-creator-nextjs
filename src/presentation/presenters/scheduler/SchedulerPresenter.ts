import { Metadata } from 'next';
import { ISchedulerRepository, ScheduledTask, SchedulerStats, TaskResult } from '@/src/application/repositories/ISchedulerRepository';

export type { TaskResult };

export interface SchedulerViewModel {
  tasks: ScheduledTask[];
  stats: SchedulerStats;
  lastRunResults: Record<string, TaskResult>;
}

export class SchedulerPresenter {
  constructor(private readonly repository: ISchedulerRepository) {}

  /**
   * Get view model for the page
   */
  async getViewModel(): Promise<SchedulerViewModel> {
    try {
      const [tasks, stats] = await Promise.all([
        this.repository.getAllTasks(),
        this.repository.getStats(),
      ]);

      return {
        tasks,
        stats,
        lastRunResults: {}, // Initially empty
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
   * Run a specific task
   */
  async runTask(taskId: string): Promise<TaskResult> {
    return this.repository.runTask(taskId);
  }

  /**
   * Run the full scheduler
   */
  async runFullScheduler(): Promise<TaskResult[]> {
    return this.repository.runFullScheduler();
  }
}
