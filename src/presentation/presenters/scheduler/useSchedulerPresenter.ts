'use client';

import { useState, useCallback, useMemo } from 'react';
import { SchedulerViewModel, TaskResult } from './SchedulerPresenter';
import { createClientSchedulerPresenter } from './SchedulerPresenterClientFactory';

export interface SchedulerState {
  viewModel: SchedulerViewModel | null;
  loading: boolean;
  error: string | null;
  runningTasks: Record<string, boolean>;
  isSchedulerRunning: boolean;
}

export interface SchedulerActions {
  refresh: () => Promise<void>;
  runTask: (taskId: string) => Promise<void>;
  runFullScheduler: () => Promise<void>;
}

export function useSchedulerPresenter(initialViewModel?: SchedulerViewModel): [SchedulerState, SchedulerActions] {
  const presenter = useMemo(() => createClientSchedulerPresenter(), []);
  
  const [state, setState] = useState<SchedulerState>({
    viewModel: initialViewModel || null,
    loading: !initialViewModel,
    error: null,
    runningTasks: {},
    isSchedulerRunning: false,
  });

  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const viewModel = await presenter.getViewModel();
      setState(prev => ({ ...prev, viewModel, loading: false }));
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: err instanceof Error ? err.message : 'Failed to refresh scheduler data' 
      }));
    }
  }, [presenter]);

  const runTask = useCallback(async (taskId: string) => {
    if (!state.viewModel) return;
    
    const task = state.viewModel.tasks.find(t => t.id === taskId);
    if (!task) return;

    setState(prev => ({ 
      ...prev, 
      runningTasks: { ...prev.runningTasks, [taskId]: true } 
    }));

    try {
      const result = await presenter.runTask(taskId);
      setState(prev => ({
        ...prev,
        viewModel: prev.viewModel ? {
          ...prev.viewModel,
          lastRunResults: { ...prev.viewModel.lastRunResults, [taskId]: result }
        } : null,
        runningTasks: { ...prev.runningTasks, [taskId]: false }
      }));
    } catch (err) {
      console.error('Run task error:', err);
      setState(prev => ({ 
        ...prev, 
        runningTasks: { ...prev.runningTasks, [taskId]: false } 
      }));
    }
  }, [presenter, state.viewModel]);

  const runFullScheduler = useCallback(async () => {
    setState(prev => ({ ...prev, isSchedulerRunning: true }));
    try {
      const results = await presenter.runFullScheduler();
      
      setState(prev => {
        if (!prev.viewModel) return prev;
        
        const newResults = { ...prev.viewModel.lastRunResults };
        results.forEach(res => {
          newResults[res.name] = res;
        });

        return {
          ...prev,
          isSchedulerRunning: false,
          viewModel: {
            ...prev.viewModel,
            lastRunResults: newResults
          }
        };
      });
    } catch (err) {
      console.error('Run full scheduler error:', err);
      setState(prev => ({ ...prev, isSchedulerRunning: false }));
    }
  }, [presenter]);

  const actions = useMemo(() => ({
    refresh,
    runTask,
    runFullScheduler,
  }), [refresh, runTask, runFullScheduler]);

  return [state, actions];
}
