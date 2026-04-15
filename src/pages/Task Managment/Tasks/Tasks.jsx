import React, { useState } from 'react';
import { USERS, TASKS_DATA } from '../data';
import { Card, Badge, PriBadge, Avatar, ProgressBar } from '../components';

const STATUSES = ['ALL', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'TESTING', 'DONE', 'BLOCKED'];

const Tasks = () => {
  const [filter, setFilter] = useState('ALL');
  const [assignFilter, setAssign] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const filtered = TASKS_DATA.filter(t => {
    const statusOk = filter === 'ALL' || t.status === filter;
    const assignOk = assignFilter === 0 || t.assignedTo === assignFilter;
    return statusOk && assignOk;
  });

  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto w-full custom-scrollbar">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-[20px] font-bold text-[#F1F5F9] m-0">Tasks</h1>
          <p className="text-[13px] text-[#475569] mt-1">Sprint 1 — {TASKS_DATA.length} tasks total</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded-md text-sm font-medium transition-all"
        >
          + New task
        </button>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        {/* Status Filters */}
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map(s => (
            <button 
              key={s} 
              onClick={() => setFilter(s)} 
              className={`px-3 py-1.5 rounded-md text-[11px] font-mono border transition-all ${
                filter === s 
                ? 'bg-[#1E3A5F] border-[#2563EB] text-[#60A5FA]' 
                : 'bg-transparent border-[#1E293B] text-[#475569] hover:border-[#334155]'
              }`}
            >
              {s.replace('_', ' ')} <span className="opacity-60 ml-1">{s === 'ALL' ? TASKS_DATA.length : TASKS_DATA.filter(t => t.status === s).length}</span>
            </button>
          ))}
        </div>

        {/* User Filters */}
        <div className="flex flex-wrap gap-1.5 lg:ml-auto">
          {[{ id: 0, name: 'All' }, ...USERS].map(u => (
            <button 
              key={u.id} 
              onClick={() => setAssign(u.id)} 
              className={`px-2.5 py-1.5 rounded-md text-[11px] border transition-all ${
                assignFilter === u.id 
                ? 'bg-[#1E3A5F] border-[#2563EB] text-[#60A5FA]' 
                : 'bg-transparent border-[#1E293B] text-[#475569] hover:border-[#334155]'
              }`}
            >
              {u.name || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Create Task Form Card */}
      {showForm && (
        <Card className="mb-4 border-[#2563EB]/30 animate-in fade-in slide-in-from-top-2">
          <h2 className="text-xs font-bold text-[#475569] tracking-widest uppercase mb-4">Create task</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-[11px] text-[#475569] block mb-1">Title</label>
              <input placeholder="e.g. Build earmark API" className="w-full bg-[#0F172A] border border-[#1E293B] rounded p-2 text-xs text-[#CBD5E1] outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="text-[11px] text-[#475569] block mb-1">Task code</label>
              <input placeholder="e.g. TTS-008" className="w-full bg-[#0F172A] border border-[#1E293B] rounded p-2 text-xs text-[#CBD5E1] outline-none focus:border-[#2563EB]" />
            </div>
            <div>
              <label className="text-[11px] text-[#475569] block mb-1">Assign to</label>
              <select className="w-full bg-[#0F172A] border border-[#1E293B] rounded p-2 text-xs text-[#CBD5E1] outline-none focus:border-[#2563EB]">
                {USERS.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {['Priority', 'Type', 'Sprint', 'Est. hours'].map(label => (
              <div key={label}>
                <label className="text-[11px] text-[#475569] block mb-1">{label}</label>
                <input placeholder={label} className="w-full bg-[#0F172A] border border-[#1E293B] rounded p-2 text-xs text-[#CBD5E1] outline-none focus:border-[#2563EB]" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="bg-[#3B82F6] text-white px-4 py-1.5 rounded text-xs font-medium hover:bg-[#2563EB]">Create task</button>
            <button onClick={() => setShowForm(false)} className="text-[#475569] px-4 py-1.5 rounded text-xs font-medium hover:bg-[#1E293B]">Cancel</button>
          </div>
        </Card>
      )}

      {/* Task List */}
      <div className="flex flex-col gap-2">
        {filtered.map(t => {
          const user = USERS.find(u => u.id === t.assignedTo);
          const pct = t.est > 0 ? Math.min(100, Math.round((t.actual / t.est) * 100)) : 0;
          return (
            <Card key={t.id} className="p-3.5 hover:border-[#334155] transition-colors">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                {/* Code & Title */}
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-[11px] text-[#475569] font-mono w-16 shrink-0">{t.code}</span>
                  <span className="text-[13px] text-[#F1F5F9] font-medium">{t.title}</span>
                </div>

                {/* Metadata & Statuses */}
                <div className="flex items-center flex-wrap gap-3">
                  <PriBadge priority={t.priority} />
                  <Badge text={t.type} status="TODO" />
                  <Badge text={t.status.replace('_', ' ')} status={t.status} />
                  
                  <div className="flex items-center gap-3">
                    <Avatar user={user} size={26} />
                    {/* Progress */}
                    <div className="w-20">
                      <ProgressBar pct={pct} color={pct === 100 ? '#10B981' : '#3B82F6'} height={4} />
                      <div className="text-[10px] text-[#475569] text-right mt-1 font-mono leading-none">
                        {t.actual}h / {t.est}h
                      </div>
                    </div>
                    <span className="text-[11px] text-[#475569] shrink-0">Due {t.due}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#475569] text-sm">
            No tasks match this filter
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;