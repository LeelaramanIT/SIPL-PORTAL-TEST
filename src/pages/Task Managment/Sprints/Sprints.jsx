import React from 'react';
import { SPRINTS, MODULES, TASKS_DATA, USERS, getProgressColor } from '../data';
import { Card, Badge, Avatar, ProgressBar } from '../components';

const Sprints = () => {
  
  return (
  <div className="w-full h-full flex flex-col p-2 md:p-4 transition-colors duration-300">
    
    {/* Header Section */}
    <div className="mb-4 shrink-0 px-2">
      <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 m-0">
        Sprints
      </h1>
      <p className="text-xs md:text-xs text-slate-500 dark:text-slate-400 mt-1">
        {SPRINTS.length} active cycles across TTS System
      </p>
    </div>

    {/* Scrollable List Container */}
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
      <div className="flex flex-col gap-4 max-w-7xl mx-auto pb-6">
        {SPRINTS.map((s) => {
          const module = MODULES.find((m) => m.id === s.mid);
          const tasks = TASKS_DATA.filter((t) => t.sprint === s.id);
          const pct = s.total > 0 ? Math.round((s.done / s.total) * 100) : 0;
          
          return (
            <Card key={s.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              {/* Top Info Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <span className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 truncate">
                      {s.name}
                    </span>
                    <Badge 
                      text={s.status} 
                      status={s.status === 'ACTIVE' ? 'IN_PROGRESS' : s.status} 
                    />
                  </div>
                  <div className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 truncate uppercase tracking-wide">
                    {module?.name} · {s.start} → {s.end}
                  </div>
                </div>
                
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                  <span className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono leading-none">
                    {pct}%
                  </span>
                  <span className="text-[10px] md:text-[11px] text-slate-400 dark:text-slate-500 font-medium uppercase">
                    {s.done}/{s.total} pts
                  </span>
                </div>
              </div>

              <ProgressBar 
                pct={pct} 
                color={getProgressColor(pct)} 
                height={6} 
                className="bg-slate-100 dark:bg-slate-800"
              />

              {/* Backlog Section */}
              <div className="mt-5">
                <div className="text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500 tracking-[0.2em] font-mono mb-3 uppercase font-semibold">
                  Sprint Backlog
                </div>
                
                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {tasks.map((t) => {
                    const user = USERS.find((u) => u.id === t.assignedTo);
                    return (
                      <div 
                        key={t.id} 
                        className="flex items-center gap-3 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 group"
                      >
                        <span className="hidden sm:inline text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-mono w-14 shrink-0">
                          {t.code}
                        </span>
                        
                        <span className="flex-1 text-xs text-slate-600 dark:text-slate-300 truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                          {t.title}
                        </span>

                        <div className="flex items-center gap-2 shrink-0">
                          <Avatar user={user} size={22} className="ring-1 ring-slate-200 dark:ring-slate-700" />
                          <div className="hidden xs:block">
                             <Badge text={t.status.replace('_', ' ')} status={t.status} />
                          </div>
                          <span className="hidden md:inline text-[10px] text-slate-400 dark:text-slate-500 font-mono w-8 text-right">
                            {t.est}h
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {tasks.length === 0 && (
                  <div className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center italic border border-dashed border-slate-200 dark:border-slate-800 rounded-lg mt-2">
                    Empty backlog for this sprint
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  </div>
)};

export default Sprints;