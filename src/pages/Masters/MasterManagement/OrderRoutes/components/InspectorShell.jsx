import React from "react";
import { X } from "lucide-react";

// Shared frame for the right-hand inspector panels.
export const InspectorShell = ({ eyebrow, title, onClose, footer, children }) => (
  <div className="flex h-full min-h-0 flex-col">
    <div className="flex items-start gap-2.5 border-b border-slate-200 px-4 pb-2.5 pt-4 dark:border-slate-800">
      <div className="min-w-0">
        <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{eyebrow}</p>
        <h2 className="m-0 mt-0.5 text-[19px] font-bold leading-tight text-slate-900 dark:text-white">{title}</h2>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="ml-auto rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
    <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto px-4 pb-5 pt-3.5">{children}</div>
    {footer && <div className="flex items-center gap-2 border-t border-slate-200 px-4 py-2.5 dark:border-slate-800">{footer}</div>}
  </div>
);

export const FieldHeader = ({ title, count, onClear, hint }) => (
  <>
    <div className="flex items-baseline gap-2">
      <h3 className="m-0 text-[13px] font-bold text-slate-800 dark:text-slate-100">{title}</h3>
      {count && <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">{count}</span>}
      {onClear && (
        <button type="button" onClick={onClear} className="ml-auto text-[12px] text-red-600 hover:underline dark:text-red-400">
          Clear
        </button>
      )}
    </div>
    {hint && <p className="m-0 -mt-1 text-[12px] text-slate-500 dark:text-slate-400">{hint}</p>}
  </>
);

export const Segmented = ({ options, value, onChange, ariaLabel }) => (
  <div role="radiogroup" aria-label={ariaLabel} className="inline-flex flex-wrap self-start overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        role="radio"
        aria-checked={value === o.value}
        onClick={() => onChange(o.value)}
        className={`border-r border-slate-200 px-3 py-1.5 text-[12.5px] font-medium last:border-r-0 dark:border-slate-700 ${
          value === o.value ? "bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900" : "bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800"
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

export const inputClass =
  "w-full min-w-0 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900";
