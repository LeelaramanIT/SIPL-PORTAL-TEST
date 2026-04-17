import React from "react";
import { STATUS_COLOR, STATUS_BG, PRIORITY_COLOR } from "./constants";

/* Avatar */
export const Avatar = ({ user, size = 32 }) => (
  <div
    className="flex items-center justify-center rounded-full font-semibold font-mono shrink-0"
    style={{
      width: size,
      height: size,
      fontSize: size * 0.35,
      color: user.color,
      backgroundColor: `${user.color}33`,
      border: `1.5px solid ${user.color}`,
    }}
  >
    {user.initials}
  </div>
);

/* Badge */
export const Badge = ({ text, status }) => (
  <span
    className="text-[11px] px-2 py-[2px] rounded-md font-mono whitespace-nowrap"
    style={{
      background: STATUS_BG[status] || "#E2E8F0",
      color: STATUS_COLOR[status] || "#334155",
      border: `1px solid ${STATUS_COLOR[status] || "#334155"}33`,
    }}
  >
    {text}
  </span>
);

export const Owners = ({ text, className }) => (
  <div className={className}>
    <p>{text}</p>
  </div>
);

/* Priority Badge */
export const PriBadge = ({ priority }) => (
  <span
    className="text-[10px] px-[7px] py-[2px] rounded font-mono"
    style={{
      color: PRIORITY_COLOR[priority],
      background: PRIORITY_COLOR[priority] + "22",
    }}
  >
    {priority}
  </span>
);

/* Progress Bar */
export const ProgressBar = ({ pct, color = "#3B82F6", height = 5 }) => (
  <div
    className="rounded overflow-hidden bg-gray-200 dark:bg-[#1E293B]"
    style={{ height }}
  >
    <div
      className="h-full rounded transition-all duration-400"
      style={{ width: `${pct}%`, background: color }}
    />
  </div>
);

/* Card */
export const Card = ({ children, style = {} }) => (
  <div
    className="rounded-xl p-5 border 
    bg-white border-[var(--border)] 
    dark:bg-[#111827] dark:border-[#1E293B] shadow-md"
    style={style}
  >
    {children}
  </div>
);

/* Section Title */
export const SectionTitle = ({ children }) => (
  <div
    className="text-[11px] font-bold tracking-[2px] uppercase font-mono mb-3.5
text-gray-500 dark:text-gray-400"
  >
    {children}
  </div>
);

/* KPI Card */
export const KpiCard = ({ label, value, sub, color = "#3B82F6" }) => (
  <div
    className="rounded-[10px] px-4 py-[14px] border border-[var(--border)] border-t-[3px]
    bg-white dark:bg-[#111827] dark:border-[#1E293B] shadow-md"
    style={{ borderTopColor: color }}
  >
    <div className="text-[11px] font-mono tracking-[1px] mb-1 text-gray-500 dark:text-gray-400">
      {label}
    </div>

    <div
      className="text-[26px] font-bold font-mono tracking-[-1px]"
      style={{ color }}
    >
      {value}
    </div>

    {sub && (
      <div className="text-[11px] mt-1 text-[var(--primary)] dark:text-gray-400">
        {sub}
      </div>
    )}
  </div>
);

/* Inputs */
export const inputStyle =
  "w-full px-[10px] py-[7px] rounded-md text-[13px] box-border font-inherit " +
  "bg-white border border-[var(--border)] text-gray-900 placeholder:text-gray-400 " +
  "focus:outline-none focus:ring-[0.2px] focus:ring-[var(--primary)] focus:border-[var(--primary)] " +
  "transition-all duration-150 " +
  "dark:bg-[#0D1117] dark:border-[#1E293B] dark:text-gray-100 dark:placeholder:text-gray-500 " +
  "dark:focus:ring-[var(--primary)] dark:focus:border-[var(--primary)]";
/* Select */
export const selectStyle =
  "w-full px-[10px] py-[7px] rounded-md text-[13px] font-inherit " +
  "bg-white border border-[var(--border)] text-gray-900 " +
  "focus:outline-none focus:ring-[0.2px] focus:ring-[var(--primary)] focus:border-[var(--primary)] " +
  "transition-all duration-150 " +
  "dark:bg-[#0D1117] dark:border-[#1E293B] dark:text-[#F1F5F9] " +
  "dark:focus:ring-[var(--primary)] dark:focus:border-[var(--primary)]";
/* Buttons */
export const btnPrimary =
  "px-4 py-2 rounded-md text-[13px] cursor-pointer font-inherit " +
  "bg-[var(--primary)]/10 border border-[var(--border)] text-[var(--primary)] " +
  "dark:bg-[#1E3A5F] dark:border-[#2563EB] dark:text-blue-300";

export const btnGhost =
  "px-4 py-2 rounded-md text-[13px] cursor-pointer font-inherit " +
  "bg-transparent border border-gray-300 text-gray-600 " +
  "dark:border-[#1E293B] dark:text-gray-400";
