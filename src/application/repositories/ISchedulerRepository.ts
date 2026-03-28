/**
 * ISchedulerRepository
 * Repository interface for Scheduler tasks access and execution
 * Following Clean Architecture - this is in the Application layer
 */

export interface ScheduledTask {
  id: string;
  name: string;
  description: string;
  handler: string;
  frequency: string;
  schedule: string;
  enabled: boolean;
  timezone: string;
}

export interface TaskResult {
  name: string;
  status: 'success' | 'error';
  message: string;
  duration?: number;
  timestamp: string;
}

export interface SchedulerStats {
  totalTasks: number;
  enabledTasks: number;
  runningTasks: number;
}

export interface ISchedulerRepository {
  /**
   * Get all scheduled tasks
   */
  getAllTasks(): Promise<ScheduledTask[]>;

  /**
   * Get statistics
   */
  getStats(): Promise<SchedulerStats>;

  /**
   * Execute a specific task manually
   */
  runTask(taskId: string): Promise<TaskResult>;

  /**
   * Run the full scheduler dispatcher
   */
  runFullScheduler(): Promise<TaskResult[]>;
}
