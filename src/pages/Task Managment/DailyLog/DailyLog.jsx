import React, { useState } from 'react';
import { USERS, TASKS_DATA, LOGS } from '../data';
import { Card, SectionTitle, KpiCard, Avatar, btnPrimary, inputStyle, selectStyle } from '../components';

const DailyLog = () => {
  const [timer, setTimer]   = useState(false);
  const [logs, setLogs]     = useState(LOGS);
  const [desc, setDesc]     = useState('');
  const [hrs, setHrs]       = useState('');
  const [task, setTask]     = useState(1);
  const [logType, setType]  = useState('TIMED');

  const totalHrs = logs.reduce((a, b) => a + b.hours, 0);

  const addLog = () => {
    if (!desc) return;
    setLogs([...logs, { id: logs.length + 1, userId: 1, taskId: task, date: 'Today', type: logType, hours: parseFloat(hrs) || 1, desc }]);
    setDesc(''); setHrs('');
  };

  return (
    <div style={{ padding: 24, overflowY: 'auto', height: '100vh' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#F1F5F9', margin: 0 }}>Daily log</h1>
        <p style={{ fontSize: 13, color: '#475569', margin: '4px 0 0' }}>Kannan · Today · Total: {totalHrs.toFixed(1)}h logged</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
        <KpiCard label="Hours today"  value={`${totalHrs.toFixed(1)}h`}             color="#3B82F6" />
        <KpiCard label="Entries"      value={logs.length}                            color="#10B981" />
        <KpiCard label="Tasks worked" value={new Set(logs.map(l => l.taskId)).size} color="#8B5CF6" />
        <KpiCard label="Status"       value={timer ? 'Running' : 'Idle'}            color={timer ? '#10B981' : '#475569'} />
      </div>

      <Card style={{ marginBottom: 16 }}>
        <SectionTitle>Log work</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div>
            <label style={{ fontSize: 11, color: '#475569', display: 'block', marginBottom: 4 }}>What are you working on?</label>
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Optimising earmark SP" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#475569', display: 'block', marginBottom: 4 }}>Task</label>
            <select value={task} onChange={e => setTask(Number(e.target.value))} style={selectStyle}>
              {TASKS_DATA.filter(t => t.assignedTo === 1).map(t => (
                <option key={t.id} value={t.id}>{t.code} — {t.title.slice(0, 25)}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#475569', display: 'block', marginBottom: 4 }}>Type</label>
            <select value={logType} onChange={e => setType(e.target.value)} style={selectStyle}>
              {['TIMED','MANUAL','MEETING','SUPPORT'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#475569', display: 'block', marginBottom: 4 }}>Hours</label>
            <input value={hrs} onChange={e => setHrs(e.target.value)} type="number" min="0.25" max="12" step="0.25" placeholder="2.5" style={inputStyle} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setTimer(!timer)} style={{ background: timer ? '#450A0A' : '#052E16', border: `1px solid ${timer ? '#EF4444' : '#10B981'}`, color: timer ? '#EF4444' : '#10B981', padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            {timer ? '⏹ Stop timer' : '▶ Start timer'}
          </button>
          <button onClick={addLog} style={btnPrimary}>+ Log manually</button>
          {timer && <span style={{ fontSize: 16, fontWeight: 700, color: '#10B981', fontFamily: 'monospace' }}>● RECORDING</span>}
        </div>
      </Card>

      <Card>
        <SectionTitle>Today's entries</SectionTitle>
        {logs.map((l, i) => {
          const user = USERS.find(u => u.id === l.userId);
          const taskItem = TASKS_DATA.find(t => t.id === l.taskId);
          const typeColor = l.type === 'TIMED' ? '#10B981' : l.type === 'MEETING' ? '#475569' : '#60A5FA';
          const typeBg    = l.type === 'TIMED' ? '#052E16' : l.type === 'MEETING' ? '#1E293B' : '#1E3A5F';
          const typeBdr   = l.type === 'TIMED' ? '#10B981' : l.type === 'MEETING' ? '#475569' : '#2563EB';
          return (
            <div key={l.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: i < logs.length - 1 ? '1px solid #1E293B' : 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: typeBg, border: `1px solid ${typeBdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: typeColor, fontFamily: 'monospace', flexShrink: 0 }}>
                {l.type === 'TIMED' ? 'T' : l.type === 'MEETING' ? 'M' : 'H'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#F1F5F9' }}>{taskItem?.code} — {taskItem?.title.slice(0, 40)}</span>
                  <Avatar user={user} size={20} />
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>{l.desc}</div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#3B82F6', fontFamily: 'monospace' }}>{l.hours}h</span>
            </div>
          );
        })}
      </Card>
    </div>
  );
};

export default DailyLog;
