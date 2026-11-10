import React from "react";
import { Plus, Search } from "lucide-react";
import { CATEGORY_ORDER, STATUS_TYPES, prettyStatus } from "../data/statusMaster";

// Left column: list of order routes + status library for the current route's
// status type. Statuses can be clicked (added after the selected step) or
// dragged into the timeline.
const RouteRail = ({
  routes,
  currentId,
  dirty,
  onSelectRoute,
  onNewRoute,
  statusTypeId,
  statuses,
  usedIds,
  query,
  onQueryChange,
  onAddStatus,
}) => {
  const q = query.trim().toUpperCase();
  const list = statuses.filter((s) => s.typeId === statusTypeId && (!q || s.text.includes(q) || String(s.id) === q));

  return (
    <aside className="flex min-h-0 flex-col gap-4 lg:w-[250px] lg:flex-none">
      <div>
        <p className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Routes</p>
        <div className="flex flex-col gap-0.5">
          {routes.map((r) => {
            const on = r.id === currentId;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelectRoute(r.id)}
                className={`flex w-full flex-col rounded-lg px-2.5 py-2 text-left transition-colors ${
                  on
                    ? "bg-white shadow-[inset_3px_0_0_var(--color-indigo-500)] dark:bg-slate-800"
                    : "hover:bg-white/70 dark:hover:bg-slate-800/60"
                }`}
              >
                <span className="flex items-center gap-1.5 truncate text-[13.5px] font-semibold text-slate-800 dark:text-slate-100">
                  {dirty[r.id] && <span className="h-1.5 w-1.5 flex-none rounded-full bg-amber-500" title="Unsaved changes" />}
                  <span className="truncate">{r.name || "Untitled order route"}</span>
                </span>
                <span className="text-[11.5px] text-slate-500 dark:text-slate-400">
                  {r.status} · {r.steps.length} steps · {STATUS_TYPES[r.statusTypeId]}
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onNewRoute}
          className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 text-[13px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          <Plus className="h-3.5 w-3.5" /> New order route
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 max-lg:max-h-[320px]">
        <div className="flex flex-col gap-1.5 px-3 pt-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Status library · Type {statusTypeId} {STATUS_TYPES[statusTypeId]}
          </p>
          <p className="text-[12px] text-slate-500 dark:text-slate-400">
            Click to add after the selected step, or drag into the timeline.
          </p>
          <label className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search status or ID"
              aria-label="Search status library"
              className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-2 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
        </div>
        <div className="custom-scrollbar mt-1 min-h-0 flex-1 overflow-y-auto px-1.5 pb-2.5">
          {list.length === 0 && <p className="m-2 rounded-md bg-slate-50 p-2 text-[12px] text-slate-500 dark:bg-slate-800">No status matches that search.</p>}
          {CATEGORY_ORDER.map((cat) => {
            const items = list.filter((s) => s.category === cat);
            if (!items.length) return null;
            return (
              <div key={cat}>
                <div className="flex justify-between px-1.5 pb-1 pt-2.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  <span>{cat}</span>
                  <span>{items.length}</span>
                </div>
                {items.map((s) => {
                  const used = usedIds.has(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", `status:${s.id}`);
                        e.dataTransfer.effectAllowed = "copy";
                      }}
                      onClick={() => onAddStatus(s.id)}
                      className={`grid w-full cursor-grab grid-cols-[26px_1fr_auto] items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[12px] hover:bg-slate-50 dark:hover:bg-slate-800 ${
                        used ? "text-slate-400 dark:text-slate-500" : "text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <span className="font-mono text-[10.5px] text-slate-400">#{s.id}</span>
                      <span>{prettyStatus(s.text)}</span>
                      <span className="text-[10px] font-bold text-indigo-500">{used ? "IN ROUTE" : ""}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default RouteRail;
