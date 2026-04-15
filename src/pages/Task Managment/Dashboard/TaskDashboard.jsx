import React from "react";
import { USERS, PROJECTS, TASKS_DATA, LOGS, BLOCKERS, EOD } from "../data";
import {
  Card,
  SectionTitle,
  KpiCard,
  ProgressBar,
  Badge,
  Avatar,
} from "../components";

const TaskDashboard = () => {
  const totalHours = LOGS.reduce((a, b) => a + b.hours, 0);
  const doneTasks = TASKS_DATA.filter((t) => t.status === "DONE").length;
  const blockers = BLOCKERS.filter((b) => b.status === "OPEN").length;
  const eodMissing = EOD.filter((e) => !e.submitted).length;

  return (
    <div className="px-5 py-2 overflow-y-auto h-full custom-scrollbar">
      {/* Header */}
      <div className="mb-2">
        <div className="text-[10px] text-[var(--primary)] dark:text-blue-600 tracking-[4px] font-mono">
          TODAY · 13 APR 2025
        </div>
        <h1 className="text-[22px] font-bold text-gray-900 dark:text-white/90">
          Good morning, Kannan
        </h1>
        <p className="text-[13px] text-[var(--primary)] dark:text-[#475569]">
          Sprint 1 ends in 3 days · 6 tasks remaining
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <KpiCard
          label="Team hours today"
          value={`${totalHours}h`}
          color="#3B82F6"
          sub="Across 4 members"
        />
        <KpiCard
          label="Tasks done"
          value={doneTasks}
          color="#10B981"
          sub="This sprint"
        />
        <KpiCard
          label="Open blockers"
          value={blockers}
          color="#EF4444"
          sub="Needs attention"
        />
        <KpiCard
          label="EOD missing"
          value={eodMissing}
          color="#F59E0B"
          sub="Submit by 6pm"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-4 mb-4">
        {/* Left */}
        <Card>
          <SectionTitle>Active sprint — Sprint 1</SectionTitle>

          {TASKS_DATA.slice(0, 5).map((t) => {
            const user = USERS.find((u) => u.id === t.assignedTo);

            return (
              <div
                key={t.id}
                className="flex items-center gap-[10px] py-2 border-b-1 border-[var(--border)]"
              >
                <span className="text-[11px] text-[var(--primary)] dark:text-[#475569] font-mono w-[60px] shrink-0">
                  {t.code}
                </span>

                <span className="flex-1 text-[12px] dark:text-[#CBD5E1] truncate whitespace-nowrap overflow-hidden">
                  {t.title}
                </span>

                <Avatar user={user} size={24} />
                <Badge text={t.status.replace("_", " ")} status={t.status} />
              </div>
            );
          })}
        </Card>

        {/* Right */}
        <div className="flex flex-col gap-3">
          {/* Blockers */}
          <Card>
            <SectionTitle>Open blockers</SectionTitle>

            {BLOCKERS.length === 0 ? (
              <p className="text-[12px] text-gray-500 dark:text-gray-400">
                No blockers. All clear!
              </p>
            ) : (
              BLOCKERS.map((b) => {
                const user = USERS.find((u) => u.id === b.reportedBy);

                return (
                  <div
                    key={b.id}
                    className="rounded-lg p-3 mb-2 border
          bg-red-50 border-red-200
          dark:bg-[#450A0A22] dark:border-[#EF444433]"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[11px] font-mono text-red-600 dark:text-[#EF4444]">
                        {b.taskCode}
                      </span>
                      <Avatar user={user} size={20} />
                    </div>

                    <div className="text-[12px] text-red-500 dark:text-[#FCA5A5]">
                      {b.reason}
                    </div>

                    <div className="text-[11px] mt-1 text-red-400 dark:text-[#7F1D1D]">
                      {b.desc}
                    </div>
                  </div>
                );
              })
            )}
          </Card>

          {/* EOD */}
          <Card>
            <SectionTitle>EOD status today</SectionTitle>

            {EOD.map((e) => {
              const user = USERS.find((u) => u.id === e.userId);

              return (
                <div
                  key={e.userId}
                  className="flex items-center gap-2 py-1.5 border-b border-[var(--border))] dark:border-[#1E293B]"
                >
                  <Avatar user={user} size={26} />

                  <span className="flex-1 text-[12px] text-gray-700 dark:text-gray-300">
                    {user.name}
                  </span>

                  <span
                    className={`text-[11px] font-mono ${
                      e.submitted
                        ? "text-green-600 dark:text-[#10B981]"
                        : "text-red-500 dark:text-[#EF4444]"
                    }`}
                  >
                    {e.submitted ? `${e.hours}h ✓` : "Missing"}
                  </span>
                </div>
              );
            })}
          </Card>
        </div>
      </div>

      {/* Projects */}
      <Card>
        <SectionTitle>Project progress</SectionTitle>

        <div className="grid grid-cols-3 gap-4">
          {PROJECTS.map((p) => (
            <div
              key={p.id}
              className="p-[14px] rounded-lg border
        bg-[var(--primary)]/10 border-[var(--border)] shadow-sm
        dark:bg-[#1E293B] dark:border-[#334155]"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[12px] font-semibold text-gray-900 dark:text-[#F1F5F9]">
                  {p.name}
                </span>
                <Badge text={p.status} status={p.status} />
              </div>

              <div className="text-[11px] text-gray-500 dark:text-[#94A3B8] mb-2">
                {p.start} → {p.end}
              </div>

              <ProgressBar pct={p.pct} color="#3B82F6" />

              <div className="text-[11px] text-blue-600 dark:text-[#60A5FA] mt-1 text-right">
                {p.pct}%
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default TaskDashboard;
