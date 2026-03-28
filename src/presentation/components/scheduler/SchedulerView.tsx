'use client';

import { SchedulerViewModel } from '@/src/presentation/presenters/scheduler/SchedulerPresenter';
import { useSchedulerPresenter } from '@/src/presentation/presenters/scheduler/useSchedulerPresenter';
import { animated, config, useSpring } from '@react-spring/web';
import Link from 'next/link';
import { JellyButton } from '../ui/JellyButton';
import { JellyCard } from '../ui/JellyCard';

interface StatCardProps {
  value: number | string;
  label: string;
  icon: string;
  color: string;
  delay: number;
}

function StatCard({ value, label, icon, color, delay }: StatCardProps) {
  const springProps = useSpring({
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    delay,
    config: config.gentle,
  });

  return (
    <animated.div style={springProps}>
      <JellyCard className="glass-card p-5">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${color}20` }}
          >
            {icon}
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{value}</div>
            <div className="text-sm text-muted">{label}</div>
          </div>
        </div>
      </JellyCard>
    </animated.div>
  );
}

interface TaskCardProps {
  task: any;
  result?: any;
  isRunning: boolean;
  delay: number;
  onRun: () => void;
}

function TaskCard({ task, result, isRunning, delay, onRun }: TaskCardProps) {
  const springProps = useSpring({
    from: { opacity: 0, scale: 0.95 },
    to: { opacity: 1, scale: 1 },
    delay,
    config: config.gentle,
  });

  return (
    <animated.div style={springProps}>
      <JellyCard className="glass-card-hover p-4 h-full">
        <div className="flex flex-col h-full justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                task.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
              }`}>
                {task.enabled ? 'Enabled' : 'Disabled'}
              </span>
              <span className="text-[10px] text-muted font-mono">{task.frequency}</span>
            </div>
            
            <h4 className="text-base font-bold text-foreground mb-1 flex items-center gap-2">
              {task.name}
              {isRunning && <span className="inline-block w-2 h-2 rounded-full bg-violet-500 animate-ping"></span>}
            </h4>
            <p className="text-xs text-muted/80 line-clamp-2 mb-3">{task.description}</p>
            
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] text-muted">
                <span>📅</span>
                <span className="truncate">{task.schedule}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted/60 font-mono">
                <span>🔗</span>
                <span className="truncate">{task.handler}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 space-y-3">
            {result && (
              <div className={`p-2 rounded-lg text-[10px] leading-relaxed transition-all duration-300 ${
                result.status === 'success' 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                <div className="font-bold flex items-center justify-between mb-1">
                  <span>{result.status === 'success' ? '✅ SUCCESS' : '❌ ERROR'}</span>
                  <span>{result.duration}ms</span>
                </div>
                <div className="opacity-90 line-clamp-2">{result.message}</div>
              </div>
            )}

            <JellyButton
              onClick={onRun}
              disabled={isRunning}
              variant={result?.status === 'error' ? 'primary' : 'secondary'}
              size="sm"
              className="w-full text-xs py-2"
            >
              {isRunning ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin text-sm">🌀</span> Running...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>▶️</span> Run Manually
                </span>
              )}
            </JellyButton>
          </div>
        </div>
      </JellyCard>
    </animated.div>
  );
}

interface SchedulerViewProps {
  initialViewModel?: SchedulerViewModel;
}

/**
 * SchedulerView component
 * Refactored to match Dashboard aesthetics and Clean Architecture pattern
 */
export function SchedulerView({ initialViewModel }: SchedulerViewProps) {
  const [state, actions] = useSchedulerPresenter(initialViewModel);
  
  const viewModel = state.viewModel || initialViewModel || {
    tasks: [],
    stats: { totalTasks: 0, enabledTasks: 0, runningTasks: 0 },
    lastRunResults: {},
  };

  const headerSpring = useSpring({
    from: { opacity: 0, y: -10 },
    to: { opacity: 1, y: 0 },
    config: config.gentle,
  });

  if (state.loading && !state.viewModel) {
    return (
      <div className="h-full flex items-center justify-center p-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-muted text-sm">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="h-full flex items-center justify-center p-20">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-bold text-foreground mb-2">เกิดข้อผิดพลาด</h3>
          <p className="text-red-400/80 text-sm mb-6">{state.error}</p>
          <JellyButton onClick={actions.refresh} variant="primary">
            ลองอีกครั้ง
          </JellyButton>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto scrollbar-thin">
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-10 space-y-8">
        
        {/* Header */}
        <animated.div style={headerSpring} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/settings" 
              className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition-all duration-300"
            >
              ⬅️
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold gradient-text-purple">Scheduler Debug</h1>
              <p className="text-sm text-muted">Manage and test your automation engine</p>
            </div>
          </div>
          <JellyButton 
            onClick={actions.runFullScheduler} 
            disabled={state.isSchedulerRunning}
            variant="primary" 
            size="lg"
            className="w-full sm:w-auto shadow-lg shadow-violet-500/20"
          >
            {state.isSchedulerRunning ? (
              <><span className="animate-spin">🌀</span> Running Scheduler...</>
            ) : (
              <><span className="text-lg">🚀</span> Run Full Scheduler</>
            )}
          </JellyButton>
        </animated.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            value={viewModel.stats.totalTasks} 
            label="Total Tasks" 
            icon="🧩" 
            color="#8B5CF6" 
            delay={100} 
          />
          <StatCard 
            value={viewModel.stats.enabledTasks} 
            label="Enabled Tasks" 
            icon="✅" 
            color="#10B981" 
            delay={150} 
          />
          <StatCard 
            value={viewModel.tasks.length > 0 ? viewModel.tasks[0].timezone === 'Asia/Bangkok' ? 'ICT' : viewModel.tasks[0].timezone : 'UTC'} 
            label="Server Timezone" 
            icon="🌐" 
            color="#3B82F6" 
            delay={200} 
          />
          <StatCard 
            value={Object.keys(viewModel.lastRunResults).length} 
            label="Tasks Tested" 
            icon="🧪" 
            color="#F59E0B" 
            delay={250} 
          />
        </div>

        {/* Task Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span>Automated Tasks</span>
              <span className="text-xs font-normal py-0.5 px-2 bg-white/5 border border-white/10 rounded-full text-muted">
                {viewModel.tasks.length} tasks
              </span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {viewModel.tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                result={viewModel.lastRunResults[task.id]}
                isRunning={state.runningTasks[task.id]}
                delay={300 + index * 50}
                onRun={() => actions.runTask(task.id)}
              />
            ))}
          </div>
        </div>

        {/* System Info */}
        <animated.div
          style={useSpring({ from: { opacity: 0 }, to: { opacity: 1 }, delay: 600 })}
          className="p-6 rounded-2xl glass-card bg-violet-500/5 border border-violet-500/10 flex flex-col md:flex-row md:items-center gap-6"
        >
          <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center text-2xl flex-shrink-0">
            ⚙️
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground mb-1">Infrastructure Notice</h3>
            <p className="text-xs text-muted/70 leading-relaxed max-w-3xl">
              Manual triggers bypass the time schedule but respect all other task logic. 
              Running tasks here will perform real AI content generation and potentially schedule posts in your primary database.
              Use this interface to verify your cron handlers are active and behaving correctly.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Link href="/" className="text-xs text-violet-400 font-bold hover:underline">
              System Documentation →
            </Link>
          </div>
        </animated.div>
      </div>
    </div>
  );
}
