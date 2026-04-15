import React from 'react';
import { USERS, TASKS_DATA, LOGS, EOD, BLOCKERS } from '../data';
import { Card, SectionTitle, Badge, Avatar } from '../components';

const Team = () => (
  <div style={{ padding: 24, overflowY: 'auto', height: '100vh' }}>
    <div style={{ marginBottom: 20 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#F1F5F9', margin: 0 }}>Team</h1>
      <p style={{ fontSize: 13, color: '#475569', margin: '4px 0 0' }}>4 members · TTS System</p>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
      {USERS.map(u => {
        const userTasks    = TASKS_DATA.filter(t => t.assignedTo === u.id);
        const doneTasks    = userTasks.filter(t => t.status === 'DONE').length;
        const totalHrs     = LOGS.filter(l => l.userId === u.id).reduce((a, b) => a + b.hours, 0);
        const blockedTasks = userTasks.filter(t => t.status === 'BLOCKED').length;
        const eod          = EOD.find(e => e.userId === u.id);
        return (
          <Card key={u.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <Avatar user={u} size={52} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#F1F5F9' }}>{u.name}</div>
                <div style={{ fontSize: 12, color: u.color, fontFamily: 'monospace', marginTop: 2 }}>{u.role}</div>
              </div>
              <span style={{ marginLeft: 'auto', fontSize: 11, padding: '3px 9px', borderRadius: 6, background: eod?.submitted ? '#052E16' : '#450A0A', color: eod?.submitted ? '#10B981' : '#EF4444', border: `1px solid ${eod?.submitted ? '#10B98133' : '#EF444433'}` }}>
                {eod?.submitted ? 'EOD submitted' : 'EOD missing'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
              {[['Tasks', userTasks.length, '#3B82F6'], ['Done', doneTasks, '#10B981'], ['Hours', `${totalHrs}h`, '#8B5CF6'], ['Blocked', blockedTasks, '#EF4444']].map(([label, val, color]) => (
                <div key={label} style={{ background: '#0D1117', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: 'monospace' }}>{val}</div>
                </div>
              ))}
            </div>

            <SectionTitle>Assigned tasks</SectionTitle>
            {userTasks.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid #1E293B' }}>
                <span style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace', width: 56 }}>{t.code}</span>
                <span style={{ flex: 1, fontSize: 11, color: '#CBD5E1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                <Badge text={t.status.replace('_', ' ')} status={t.status} />
              </div>
            ))}

            {eod?.done && (
              <div style={{ marginTop: 12, padding: 10, background: '#0D1117', borderRadius: 8, border: '1px solid #1E293B' }}>
                <div style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>Today's EOD</div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>{eod.done}</div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  </div>
);

export default Team;
