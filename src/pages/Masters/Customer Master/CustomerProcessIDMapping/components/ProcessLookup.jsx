import React, { useMemo, useState, useRef, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PROCESS_MASTER } from "../data/mockData";

// Free-text lookup across processId / platform / brand / tyreSize / tyreType —
// so typing "18x7" or "sunbear" both surface a matching Process ID.
const searchProcessMaster = (query) => {
  const q = query.trim().toLowerCase();
  if (!q) return PROCESS_MASTER;
  return PROCESS_MASTER.filter((p) =>
    [p.processId, p.platform, p.brand, p.tyreSize, p.rimSize, p.tyreType, p.sideWall]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
};

const ProcessLookup = ({ value, onSelect, error }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const results = useMemo(() => searchProcessMaster(query), [query]);
  const selected = PROCESS_MASTER.find((p) => p.processId === value);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-8 sm:h-9 w-full items-center gap-2 rounded-md border bg-white dark:bg-slate-800 px-2.5 sm:px-3 text-left text-[12px] sm:text-[13px] outline-none transition-colors
          ${error ? "border-rose-400 dark:border-rose-600" : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"}
          ${open ? "border-blue-600 ring-2 ring-blue-600/15" : ""}`}
      >
        <Search size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
        {selected ? (
          <span className="flex-1 truncate">
            <span className="font-semibold text-slate-800 dark:text-slate-100">{selected.processId}</span>
            <span className="text-slate-500 dark:text-slate-400"> — {selected.tyreSize} | {selected.brand}</span>
          </span>
        ) : (
          <span className="flex-1 text-slate-400 dark:text-slate-500">Search Process ID, tyre size, brand…</span>
        )}
        <ChevronDown size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg"
          >
            <div className="border-b border-slate-100 dark:border-slate-700 p-2">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. 18x7, LUG, SUNBEAR…"
                className="h-8 w-full rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5 text-[13px] outline-none focus:border-blue-500"
              />
            </div>
            <div className="max-h-64 overflow-y-auto">
              {results.length === 0 ? (
                <p className="px-3 py-6 text-center text-[12px] text-slate-400 dark:text-slate-500">No matching process IDs</p>
              ) : (
                results.map((p) => (
                  <button
                    key={p.processId}
                    type="button"
                    onClick={() => {
                      onSelect(p);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`flex w-full flex-col gap-0.5 border-b border-slate-50 dark:border-slate-700/60 px-3 py-2 text-left transition-colors last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700
                      ${p.processId === value ? "bg-blue-50 dark:bg-blue-900/30" : ""}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{p.processId}</span>
                      <span className="rounded bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                        {p.platform}
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {p.tyreSize} · Rim {p.rimSize} · {p.tyreType} · {p.brand}
                    </span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="mt-1 text-[11px] font-medium text-rose-600">{error}</p>}
    </div>
  );
};

export default ProcessLookup;
