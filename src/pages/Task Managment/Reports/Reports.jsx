import React from 'react';
import { USERS, TASKS_DATA, LOGS, BLOCKERS, SPRINTS, EOD } from '../data';
import { Card, SectionTitle, KpiCard, Badge, Avatar, ProgressBar } from '../components';
import { STATUS_COLOR } from '../constants';

const Reports = () => {
  const sprintDone  = TASKS_DATA.filter(t => t.status === 'DONE').length;
  const sprintTotal = TASKS_DATA.length;
  const totalHrs    = LOGS.reduce((a, b) => a + b.hours, 0);

  return (
    <div style={{ padding: 24, overflowY: 'auto', height: '100vh' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#F1F5F9', margin: 0 }}>Reports</h1>
        <p style={{ fontSize: 13, color: '#475569', margin: '4px 0 0' }}>Management visibility — Sprint 1 · TTS System</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <KpiCard label="Sprint progress" value={`${Math.round((sprintDone / sprintTotal) * 100)}%`} color="#3B82F6" sub={`${sprintDone}/${sprintTotal} tasks`} />
        <KpiCard label="Team hours"      value={`${totalHrs}h`} color="#10B981" sub="Today total" />
        <KpiCard label="Open blockers"   value={BLOCKERS.filter(b => b.status === 'OPEN').length} color="#EF4444" sub="Needs resolution" />
        <KpiCard label="Days remaining"  value={3} color="#F59E0B" sub="Sprint ends 14 Apr" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Card>
          <SectionTitle>Sprint burndown</SectionTitle>
          {SPRINTS.map(s => {
            const pct = s.total > 0 ? Math.round((s.done / s.total) * 100) : 0;
            return (
              <div key={s.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: '#F1F5F9' }}>{s.name}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Badge text={s.status} status={s.status === 'ACTIVE' ? 'IN_PROGRESS' : s.status} />
                    <span style={{ fontSize: 11, color: '#3B82F6', fontFamily: 'monospace' }}>{s.done}/{s.total} pts</span>
                  </div>
                </div>
                <ProgressBar pct={pct} color={pct === 100 ? '#10B981' : '#3B82F6'} height={8} />
                <div style={{ fontSize: 10, color: '#475569', marginTop: 3 }}>{s.start} → {s.end}</div>
              </div>
            );
          })}
        </Card>

        <Card>
          <SectionTitle>Team workload today</SectionTitle>
          {USERS.map(u => {
            const hrs   = LOGS.filter(l => l.userId === u.id).reduce((a, b) => a + b.hours, 0);
            const tasks = new Set(LOGS.filter(l => l.userId === u.id).map(l => l.taskId)).size;
            const pct   = Math.min(100, Math.round((hrs / 8) * 100));
            return (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #1E293B' }}>
                <Avatar user={u} size={30} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#F1F5F9' }}>{u.name}</span>
                    <span style={{ fontSize: 11, color: '#3B82F6', fontFamily: 'monospace' }}>{hrs}h · {tasks} tasks</span>
                  </div>
                  <ProgressBar pct={pct} color={pct >= 80 ? '#10B981' : pct >= 40 ? '#3B82F6' : '#F59E0B'} height={5} />
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <SectionTitle>Task status breakdown</SectionTitle>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['TODO','IN_PROGRESS','IN_REVIEW','TESTING','DONE','BLOCKED'].map(s => {
            const count = TASKS_DATA.filter(t => t.status === s).length;
            const pct   = Math.round((count / TASKS_DATA.length) * 100);
            return (
              <div key={s} style={{ flex: 1, minWidth: 100, padding: 14, background: '#0D1117', borderRadius: 8, border: `1px solid ${STATUS_COLOR[s]}33`, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: STATUS_COLOR[s], fontFamily: 'monospace' }}>{count}</div>
                <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>{s.replace('_', ' ')}</div>
                <div style={{ fontSize: 10, color: STATUS_COLOR[s], marginTop: 2 }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <SectionTitle>Morning standup report — today</SectionTitle>
        {USERS.map(u => {
          const eod = EOD.find(e => e.userId === u.id);
          const hrs = LOGS.filter(l => l.userId === u.id).reduce((a, b) => a + b.hours, 0);
          const blk = BLOCKERS.filter(b => b.reportedBy === u.id && b.status === 'OPEN').length;
          return (
            <div key={u.id} style={{ padding: '14px 0', borderBottom: '1px solid #1E293B' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: eod?.submitted ? 10 : 0 }}>
                <Avatar user={u} size={34} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>{u.name}</span>
                    <span style={{ fontSize: 11, color: '#475569' }}>{u.role}</span>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#3B82F6' }}>{hrs}h logged</span>
                    {blk > 0 && <span style={{ fontSize: 11, padding: '2px 7px', background: '#450A0A', color: '#EF4444', borderRadius: 6, border: '1px solid #EF444433' }}>{blk} blocker</span>}
                  </div>
                </div>
                <span style={{ fontSize: 11, color: eod?.submitted ? '#10B981' : '#EF4444' }}>{eod?.submitted ? '✓ EOD submitted' : '✗ EOD missing'}</span>
              </div>
              {eod?.submitted && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginLeft: 44 }}>
                  <div style={{ padding: 10, background: '#0D1117', borderRadius: 6 }}>
                    <div style={{ fontSize: 10, color: '#475569', marginBottom: 3 }}>Done today</div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>{eod.done}</div>
                  </div>
                  <div style={{ padding: 10, background: '#0D1117', borderRadius: 6 }}>
                    <div style={{ fontSize: 10, color: '#475569', marginBottom: 3 }}>Plan tomorrow</div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>{eod.tomorrow}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </Card>
    </div>
  );
};

export default Reports;
