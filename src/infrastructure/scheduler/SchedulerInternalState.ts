/**
 * SchedulerInternalState
 * 
 * Simple singleton to persist scheduler state during application runtime
 */

export class SchedulerInternalState {
  private static instance: SchedulerInternalState;
  private lastRunTimes: Record<string, number> = {};

  private constructor() {}

  static getInstance(): SchedulerInternalState {
    if (!SchedulerInternalState.instance) {
      SchedulerInternalState.instance = new SchedulerInternalState();
    }
    return SchedulerInternalState.instance;
  }

  setLastRunTime(taskName: string, timestamp: number): void {
    this.lastRunTimes[taskName] = timestamp;
  }

  getLastRunTime(taskName: string): number | undefined {
    return this.lastRunTimes[taskName];
  }

  getAllLastRunTimes(): Record<string, number> {
    return { ...this.lastRunTimes };
  }
}
