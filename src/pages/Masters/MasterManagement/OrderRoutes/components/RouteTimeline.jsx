import React, { useState } from "react";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { prettyStatus } from "../data/statusMaster";
import { STEP_KINDS, formatHours, groupIntoStages, pad2, stepTitle } from "../helpers";

const KIND_STYLES = {
  waypoint: {
    num: "rounded-full border-violet-500 text-violet-600 dark:text-violet-400",
    pill: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  },
  task: {
    num: "rounded-full border-blue-500 text-blue-600 dark:text-blue-400",
    pill: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  },
  approval: {
    num: "rounded-md rotate-45 border-orange-500 text-orange-600 dark:text-orange-400",
    pill: "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  },
};

export const StepNumber = ({ kind, n }) => (
  <span
    className={`relative z-10 grid h-[30px] w-[30px] flex-none place-items-center border-2 bg-white font-mono text-[11px] font-medium dark:bg-slate-900 ${KIND_STYLES[kind].num}`}
  >
    <span className={kind === "approval" ? "-rotate-45" : ""}>{pad2(n)}</span>
  </span>
);

const SendBackStrip = ({ step, statusById }) => {
  const back = step.sendBack || [];
  return (
    <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-lg border border-dashed border-red-300 bg-red-50 px-2 py-1.5 text-[12px] dark:border-red-500/40 dark:bg-red-500/10">
      <span className="font-bold text-red-600 dark:text-red-400">If sent back</span>
      {back.length === 0 && <span className="italic text-slate-500">returns to the previous step</span>}
      {back.map((b, j) => {
        const st = statusById.get(b.statusId);
        return (
          <React.Fragment key={b.id}>
            {j > 0 && <span className="text-red-500">→</span>}
            <span className="rounded bg-white px-1.5 py-px text-slate-700 dark:bg-slate-900 dark:text-slate-200">
              <i className="mr-1 font-mono text-[10.5px] not-italic text-slate-400">#{b.statusId ?? "?"}</i>
              {st ? prettyStatus(st.text) : "No status"}
            </span>
          </React.Fragment>
        );
      })}
      {back.length > 0 && (
        <>
          <span className="text-red-500">→</span>
          <span className="italic text-slate-500">back to this approval</span>
        </>
      )}
    </div>
  );
};

// Vertical journey: stages (status categories) on a rail, numbered steps,
// insert gaps between steps, drag to reorder, drop statuses from the library.
const RouteTimeline = ({ route, statusById, selection, onSelect, onInsert, onMove }) => {
  const [drop, setDrop] = useState(null); // { at, mark: 'before'|'after'|'gap', index }
  const stages = groupIntoStages(route.steps, statusById);

  const handleDragOver = (e, target) => {
    e.preventDefault();
    if (target.gap != null) return setDrop({ at: target.gap, mark: "gap", index: target.gap });
    const r = e.currentTarget.getBoundingClientRect();
    const after = e.clientY > r.top + r.height / 2;
    setDrop({ at: target.index + (after ? 1 : 0), mark: after ? "after" : "before", index: target.index });
  };
  const handleDrop = (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    const at = drop?.at;
    setDrop(null);
    if (at == null || !data) return;
    if (data.startsWith("step:")) onMove(data.slice(5), at);
    else if (data.startsWith("status:")) onInsert(at, Number(data.slice(7)));
  };

  const gap = (i) => (
    <li key={`gap-${i}`}>
      <button
        type="button"
        aria-label={`Add step before step ${i + 1}`}
        onClick={() => onInsert(i, null)}
        onDragOver={(e) => handleDragOver(e, { gap: i })}
        onDrop={handleDrop}
        className="group/gap relative ml-12 block h-3 w-[calc(100%-3rem)]"
      >
        <span
          className={`absolute inset-x-0 top-1/2 border-t-[1.5px] border-dashed border-indigo-500 transition-opacity ${
            drop?.mark === "gap" && drop.index === i ? "opacity-100" : "opacity-0 group-hover/gap:opacity-100 group-focus-visible/gap:opacity-100"
          }`}
        />
        <span
          className={`absolute left-0 top-1/2 -translate-y-1/2 bg-white px-1.5 text-[11.5px] font-semibold text-indigo-600 transition-opacity dark:bg-slate-900 dark:text-indigo-400 ${
            drop?.mark === "gap" && drop.index === i ? "opacity-100" : "opacity-0 group-hover/gap:opacity-100 group-focus-visible/gap:opacity-100"
          }`}
        >
          + Add step here
        </span>
      </button>
    </li>
  );

  return (
    <ol
      className="relative m-0 list-none p-0 before:absolute before:bottom-2 before:left-[19px] before:top-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700"
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setDrop(null);
      }}
    >
      {stages.map((stage, si) => {
        const sla = stage.items.reduce((a, { step }) => a + (Number(step.slaHours) || 0), 0);
        return (
          <li key={`${stage.category}-${si}`} className="relative pb-1.5">
            <div className="flex items-center gap-2.5 pb-1.5 pt-3.5">
              <span className="relative z-10 ml-[14px] h-3 w-3 flex-none rotate-45 border-2 border-slate-800 bg-white dark:border-slate-200 dark:bg-slate-900" />
              <h3 className="m-0 ml-1.5 text-[13.5px] font-extrabold uppercase tracking-[0.08em] text-slate-800 dark:text-slate-100">
                {stage.category}
              </h3>
              <span className="text-[12px] tabular-nums text-slate-500">
                {stage.items.length} step{stage.items.length > 1 ? "s" : ""} · {formatHours(sla)}
              </span>
            </div>
            <ol className="m-0 list-none p-0">
              {stage.items.map(({ step, index }) => {
                const st = statusById.get(step.statusId);
                const selected = selection === step.id;
                const warn = !st && !step.name;
                const mark = drop && drop.mark !== "gap" && drop.index === index ? drop.mark : null;
                return (
                  <React.Fragment key={step.id}>
                    {index > 0 && gap(index)}
                    <li
                      tabIndex={0}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", `step:${step.id}`);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragOver={(e) => handleDragOver(e, { index })}
                      onDrop={handleDrop}
                      onDragEnd={() => setDrop(null)}
                      onClick={() => onSelect(step.id)}
                      onKeyDown={(e) => {
                        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                          e.preventDefault();
                          onSelect(step.id);
                        }
                      }}
                      className={`group relative grid cursor-pointer grid-cols-[40px_minmax(0,1fr)_auto] items-start gap-3 rounded-xl border py-2.5 pr-2.5 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 sm:grid-cols-[40px_minmax(0,1fr)_auto_auto] ${
                        selected
                          ? "border-indigo-500 bg-indigo-50/80 dark:bg-indigo-500/10"
                          : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      } ${mark === "before" ? "shadow-[inset_0_3px_0_var(--color-indigo-500)]" : ""} ${
                        mark === "after" ? "shadow-[inset_0_-3px_0_var(--color-indigo-500)]" : ""
                      }`}
                    >
                      <span className="ml-[5px]">
                        <StepNumber kind={step.kind} n={index + 1} />
                      </span>
                      <div className="flex min-w-0 flex-col gap-1">
                        <div className="flex flex-wrap items-baseline gap-2 text-[14.5px] font-semibold">
                          <span className={warn ? "text-amber-600" : "text-slate-800 dark:text-slate-100"}>
                            {stepTitle(step, statusById)}
                          </span>
                          {st && <span className="font-mono text-[11px] font-normal text-slate-400">#{st.id}</span>}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-slate-500 dark:text-slate-400">
                          <span className={`rounded px-1.5 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.06em] ${KIND_STYLES[step.kind].pill}`}>
                            {STEP_KINDS[step.kind].label}
                          </span>
                          <span>{step.assigneeType}</span>
                          <span>
                            {step.assignment}
                            {step.assignee ? ` · ${step.assignee}` : ""}
                          </span>
                        </div>
                        {step.kind === "approval" && <SendBackStrip step={step} statusById={statusById} />}
                      </div>
                      <span className="min-w-[52px] whitespace-nowrap pt-0.5 text-right font-mono text-[12px] text-slate-500">
                        {step.slaHours != null && step.slaHours !== "" ? formatHours(step.slaHours) : "no SLA"}
                      </span>
                      <div className="hidden gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 sm:flex">
                        <button
                          type="button"
                          aria-label="Move up"
                          disabled={index === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            onMove(step.id, index - 1);
                          }}
                          className="grid h-[26px] w-[26px] place-items-center rounded-md border border-slate-200 bg-white disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Move down"
                          disabled={index === route.steps.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            onMove(step.id, index + 2);
                          }}
                          className="grid h-[26px] w-[26px] place-items-center rounded-md border border-slate-200 bg-white disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  </React.Fragment>
                );
              })}
            </ol>
          </li>
        );
      })}

      {route.steps.length === 0 && (
        <li
          onDragOver={(e) => handleDragOver(e, { gap: 0 })}
          onDrop={handleDrop}
          className="ml-12 mt-3.5 rounded-xl border-[1.5px] border-dashed border-slate-300 p-4 text-[13px] text-slate-500 dark:border-slate-700"
        >
          No steps yet. Pick a status from the library, drag one here, or add a step below.
        </li>
      )}

      <li>
        <button
          type="button"
          onClick={() => onInsert(route.steps.length, null)}
          onDragOver={(e) => handleDragOver(e, { gap: route.steps.length })}
          onDrop={handleDrop}
          className="ml-12 mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-semibold text-slate-700 hover:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <Plus className="h-3.5 w-3.5" /> Add step
        </button>
      </li>
      <li className="flex items-center gap-2.5 pt-3.5">
        <span className="relative z-10 ml-3 h-4 w-4 flex-none rounded-full bg-slate-800 dark:bg-slate-200" />
        <span className="ml-1.5 text-[12.5px] font-extrabold uppercase tracking-[0.08em] text-slate-800 dark:text-slate-100">
          Route complete
        </span>
      </li>
    </ol>
  );
};

export default RouteTimeline;
