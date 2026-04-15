import React, { useState } from 'react';
import { USERS } from '../data';
import { Card, SectionTitle, Badge, PriBadge, Avatar } from '../components';
import { STATUS_DATA, PRIORITY_DATA, TASKTYPE_DATA, STATUS_COLOR, PRIORITY_COLOR } from '../constants';

const Masters = () => {
  const [tab, setTab] = useState('users');
  const tabs = [
    { id:'users',    label:'Users' },
    { id:'status',   label:'Status master' },
    { id:'priority', label:'Priority master' },
    { id:'tasktype', label:'Task types' },
  ];

  return (
    <div style={{ padding: 24, overflowY: 'auto', height: '100vh' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#F1F5F9', margin: 0 }}>Master data</h1>
        <p style={{ fontSize: 13, color: '#475569', margin: '4px 0 0' }}>Configure users, statuses, priorities and task types</p>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '7px 14px', borderRadius: 8, background: tab === t.id ? '#1E3A5F' : 'transparent', border: `1px solid ${tab === t.id ? '#2563EB' : '#1E293B'}`, color: tab === t.id ? '#60A5FA' : '#475569', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <Card>
          <SectionTitle>Users ({USERS.length})</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {USERS.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#0D1117', borderRadius: 8, border: '1px solid #1E293B' }}>
                <Avatar user={u} size={38} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: u.color, fontFamily: 'monospace' }}>{u.role}</div>
                </div>
                <span style={{ fontSize: 11, padding: '3px 9px', background: '#052E16', color: '#10B981', borderRadius: 6, border: '1px solid #10B98133' }}>Active</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'status' && (
        <Card>
          <SectionTitle>Status master ({STATUS_DATA.length} records)</SectionTitle>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: 'monospace' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1E293B' }}>
                  {['Module','Code','Name','Order','Color'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#475569', fontSize: 10, letterSpacing: 1, fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STATUS_DATA.map((s, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1E293B', background: i % 2 === 0 ? 'transparent' : '#0D111744' }}>
                    <td style={{ padding: '9px 12px', color: '#94A3B8' }}>{s.module}</td>
                    <td style={{ padding: '9px 12px' }}><Badge text={s.code} status={s.code} /></td>
                    <td style={{ padding: '9px 12px', color: '#F1F5F9' }}>{s.name}</td>
                    <td style={{ padding: '9px 12px', color: '#475569' }}>{s.order}</td>
                    <td style={{ padding: '9px 12px' }}>
                      <div style={{ width: 16, height: 16, borderRadius: 4, background: STATUS_COLOR[s.code] || '#475569', display: 'inline-block' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'priority' && (
        <Card>
          <SectionTitle>Priority master</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PRIORITY_DATA.map(p => (
              <div key={p.code} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#0D1117', borderRadius: 8, border: '1px solid #1E293B' }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: PRIORITY_COLOR[p.code] }} />
                <span style={{ fontSize: 13, color: '#F1F5F9', fontWeight: 600 }}>{p.name}</span>
                <PriBadge priority={p.code} />
                <span style={{ marginLeft: 'auto', fontSize: 11, color: '#475569' }}>Order {p.order}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'tasktype' && (
        <Card>
          <SectionTitle>Task types</SectionTitle>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TASKTYPE_DATA.map(t => (
              <div key={t} style={{ padding: '8px 16px', background: '#0D1117', border: '1px solid #1E293B', borderRadius: 8, fontSize: 12, color: '#94A3B8', fontFamily: 'monospace' }}>{t}</div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Masters;
