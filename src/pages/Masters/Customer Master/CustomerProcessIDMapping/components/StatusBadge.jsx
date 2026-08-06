import React from "react";

const STYLES = {
  Active: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-800",
  Inactive: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 ring-slate-200 dark:ring-slate-600",
  Pending: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 ring-amber-200 dark:ring-amber-800",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
      STYLES[status] || STYLES.Inactive
    }`}
  >
    <span
      className={`h-1.5 w-1.5 rounded-full ${
        status === "Active" ? "bg-emerald-500" : status === "Pending" ? "bg-amber-500" : "bg-slate-400"
      }`}
    />
    {status}
  </span>
);

export default StatusBadge;
