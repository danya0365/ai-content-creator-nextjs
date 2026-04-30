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
  status: 'success' | 'error' | 'skipped';
  message: string;
  duration?: number;
  timestamp: string;
}

export interface SchedulerStats {
  totalTasks: number;
  enabledTasks: number;
  runningTasks: number;
}

export interface SchedulerStatus extends SchedulerStats {
  status: string;
  timestamp: string;
  timezone: string;
  localTime: string;
  tasksToRunNow: number;
  tasks: (ScheduledTask & { shouldRunNow: boolean, lastRun: string | null })[];
}

export interface SchedulerRunResponse {
  success: boolean;
  timestamp: string;
  timezone: string;
  localTime: string;
  tasksChecked: number;
  tasksRun: number;
  results: TaskResult[];
  duration: number;
  error?: string;
}

export interface SchedulerStatusResponse extends SchedulerStatus {
  setupInstructions: {
    vps: string;
    vercel: string;
  };
  error?: string;
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
   * Run the full scheduler dispatcher (Triggered by POST)
   */
  dispatch(cronSecret: string): Promise<TaskResult[]>;

  /**
   * Get full scheduler status (Triggered by GET/UI)
   */
  getFullStatus(): Promise<SchedulerStatus>;

  /**
   * Run the full scheduler dispatcher via API call (Legacy support)
   */
  runFullScheduler(): Promise<TaskResult[]>;
}
