import React from "react";
import { describeRules } from "../data/ruleOptions";

// The "Start" card at the top of the timeline: a readable summary of which
// orders follow this route. Clicking it opens the Start Rules editor.
const StartRulesCard = ({ rules, options, selected, onSelect }) => {
  const tokens = describeRules(rules, options);

  return (
    <section
      role="button"
      tabIndex={0}
      aria-label="Edit start rules"
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`flex cursor-pointer flex-col gap-2.5 rounded-xl border-[1.5px] bg-slate-50 px-4 py-3.5 transition-colors dark:bg-slate-800/50 ${
        selected
          ? "border-indigo-500 ring-4 ring-indigo-500/15"
          : "border-slate-200 hover:border-indigo-400 dark:border-slate-700"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="rounded-md bg-indigo-600 px-2.5 py-1 text-[12px] font-extrabold uppercase tracking-[0.1em] text-white">
          Start
        </span>
        <p className="m-0 min-w-[200px] flex-1 text-[14px] text-slate-700 dark:text-slate-200">
          Begin when a new order matches all of these start rules
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tokens.length === 0 && (
          <p className="m-0 text-[13px] text-slate-500 dark:text-slate-400">No rules yet, so every new order follows this route.</p>
        )}
        {tokens.map((t) => (
          <span
            key={t.key}
            className="inline-flex max-w-full items-baseline gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[12.5px] dark:border-slate-700 dark:bg-slate-900"
          >
            <span className="whitespace-nowrap text-slate-500 dark:text-slate-400">{t.label}</span>
            <b className="truncate font-semibold text-slate-800 dark:text-slate-100">{t.value}</b>
          </span>
        ))}
        <span className="inline-flex items-center rounded-md border border-dashed border-indigo-300 px-2.5 py-1 text-[12.5px] font-semibold text-indigo-600 dark:border-indigo-500/50 dark:text-indigo-400">
          + Add rule
        </span>
      </div>
    </section>
  );
};

export default StartRulesCard;
