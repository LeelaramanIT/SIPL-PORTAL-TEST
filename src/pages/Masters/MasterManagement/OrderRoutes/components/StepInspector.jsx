import React, { useState } from "react";
import { Copy, Plus, Trash2, X } from "lucide-react";
import { CATEGORY_ORDER, STATUS_TYPES, prettyStatus } from "../data/statusMaster";
import {
  ASSIGNEE_TYPES,
  ASSIGNMENT_MODES,
  STEP_KINDS,
  newSendBack,
  sortByCategory,
  stepTitle,
  usedStatusIds,
} from "../helpers";
import { FieldHeader, InspectorShell, Segmented, inputClass } from "./InspectorShell";

// Right panel for one step: type, status, owner, SLA and (for approvals) the
// send-back path. Edits apply immediately through onChange(mutator).
const StepInspector = ({ route, step, statuses, statusById, onChange, onClose, onDuplicate, onDelete }) => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [armDelete, setArmDelete] = useState(false);

  const index = route.steps.findIndex((s) => s.id === step.id);
  const typeStatuses = statuses.filter((s) => s.typeId === route.statusTypeId || s.id === step.statusId);
  const categories = ["All", ...CATEGORY_ORDER.filter((c) => typeStatuses.some((s) => s.category === c))];
  const activeCategory = categories.includes(category) ? category : "All";
  const used = usedStatusIds(route);
  const q = query.trim().toUpperCase();
  const rows = typeStatuses
    .filter((s) => (activeCategory === "All" || s.category === activeCategory) && (!q || s.text.includes(q) || String(s.id) === q))
    .sort(sortByCategory);

  // Send-back dropdown: revision statuses first, as they are the usual choice.
  const sendBackGroups = ["Revisions", ...CATEGORY_ORDER.filter((c) => c !== "Revisions")]
    .map((c) => ({ c, items: statuses.filter((s) => s.category === c && s.typeId === route.statusTypeId) }))
    .filter((g) => g.items.length);

  const set = (field, value) => onChange((s) => (s[field] = value));

  return (
    <InspectorShell
      eyebrow={`Step ${index + 1} of ${route.steps.length}`}
      title={stepTitle(step, statusById)}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onDuplicate}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-[13px] font-semibold hover:border-indigo-500 dark:border-slate-700"
          >
            <Copy className="h-3.5 w-3.5" /> Duplicate
          </button>
          <span className="flex-1" />
          <button
            type="button"
            onClick={() => (armDelete ? onDelete() : setArmDelete(true))}
            onBlur={() => setArmDelete(false)}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" /> {armDelete ? "Click again to delete" : "Delete step"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-1.5">
        <FieldHeader title="Step type" />
        <Segmented
          ariaLabel="Step type"
          value={step.kind}
          onChange={(v) => set("kind", v)}
          options={Object.entries(STEP_KINDS).map(([value, k]) => ({ value, label: k.label }))}
        />
        <p className="m-0 text-[12px] text-slate-500 dark:text-slate-400">{STEP_KINDS[step.kind].desc}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <FieldHeader
          title={step.kind === "waypoint" ? "Status reached" : "Status while this step is open"}
          count={`Type ${route.statusTypeId} · ${STATUS_TYPES[route.statusTypeId]}`}
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search status text or ID"
          className={inputClass}
        />
        <div className="flex flex-wrap gap-1">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-md border px-2 py-0.5 text-[11.5px] ${
                activeCategory === c
                  ? "border-indigo-600 bg-indigo-600 font-semibold text-white"
                  : "border-slate-200 bg-white hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-900"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div role="radiogroup" aria-label="Status" className="custom-scrollbar max-h-56 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700">
          {rows.length === 0 && <p className="m-2 text-[12px] text-slate-500">No status matches.</p>}
          {rows.map((s) => {
            const on = step.statusId === s.id;
            return (
              <label
                key={s.id}
                className={`grid cursor-pointer grid-cols-[18px_30px_1fr] items-center gap-2 border-b border-slate-100 px-2.5 py-1.5 text-[12.5px] last:border-b-0 dark:border-slate-800 ${
                  on ? "bg-indigo-50 dark:bg-indigo-500/10" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <input type="radio" name={`status-${step.id}`} checked={on} onChange={() => set("statusId", s.id)} className="accent-indigo-600" />
                <span className="font-mono text-[10.5px] text-slate-400">#{s.id}</span>
                <span>{prettyStatus(s.text)}</span>
                {used.has(s.id) && !on && <em className="col-start-3 -mt-0.5 text-[10.5px] not-italic text-amber-600">Already used in this route</em>}
              </label>
            );
          })}
        </div>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-[12px] font-semibold text-slate-500">Display name (optional)</span>
        <input
          type="text"
          value={step.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder={statusById.get(step.statusId) ? prettyStatus(statusById.get(step.statusId).text) : "Uses the status name"}
          className={inputClass}
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <FieldHeader title="Owner" />
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <label className="flex min-w-0 flex-col gap-1">
            <span className="text-[12px] font-semibold text-slate-500">Assignee type</span>
            <select value={step.assigneeType} onChange={(e) => set("assigneeType", e.target.value)} className={inputClass}>
              {ASSIGNEE_TYPES.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-1">
            <span className="text-[12px] font-semibold text-slate-500">Assignment</span>
            <select value={step.assignment} onChange={(e) => set("assignment", e.target.value)} className={inputClass}>
              {ASSIGNMENT_MODES.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-1">
            <span className="text-[12px] font-semibold text-slate-500">Person or team</span>
            <input type="text" value={step.assignee} onChange={(e) => set("assignee", e.target.value)} placeholder="e.g. CRM desk" className={inputClass} />
          </label>
          <label className="flex min-w-0 flex-col gap-1">
            <span className="text-[12px] font-semibold text-slate-500">SLA (hours)</span>
            <input
              type="number"
              min="0"
              value={step.slaHours ?? ""}
              onChange={(e) => set("slaHours", e.target.value === "" ? null : Math.max(0, Number(e.target.value)))}
              placeholder="e.g. 24"
              className={inputClass}
            />
          </label>
        </div>
      </div>

      {step.kind === "approval" && (
        <div className="flex flex-col gap-1.5">
          <FieldHeader
            title="When sent back"
            hint="The order goes through these steps, then returns to this approval. Leave empty to return to the previous step."
          />
          {(step.sendBack || []).map((b, j) => (
            <div key={b.id} className="grid grid-cols-[18px_minmax(0,1.6fr)_minmax(0,1fr)_30px] items-center gap-1.5">
              <span className="font-mono text-[11px] text-red-500">{j + 1}</span>
              <select
                aria-label={`Send-back status ${j + 1}`}
                value={b.statusId ?? ""}
                onChange={(e) => onChange((s) => (s.sendBack[j].statusId = e.target.value ? Number(e.target.value) : null))}
                className={inputClass}
              >
                <option value="">Choose status…</option>
                {sendBackGroups.map((g) => (
                  <optgroup key={g.c} label={g.c}>
                    {g.items.map((s) => (
                      <option key={s.id} value={s.id}>
                        #{s.id} {prettyStatus(s.text)}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <input
                type="text"
                aria-label={`Send-back owner ${j + 1}`}
                value={b.assignee}
                onChange={(e) => onChange((s) => (s.sendBack[j].assignee = e.target.value))}
                placeholder="Owner"
                className={inputClass}
              />
              <button
                type="button"
                aria-label={`Remove send-back step ${j + 1}`}
                onClick={() => onChange((s) => s.sendBack.splice(j, 1))}
                className="grid h-[30px] place-items-center rounded-md border border-slate-200 text-slate-500 hover:border-red-400 hover:text-red-600 dark:border-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {(step.sendBack || []).length > 0 && <p className="m-0 pl-6 text-[12px] italic text-slate-500">↩ back to this approval</p>}
          <button
            type="button"
            onClick={() =>
              onChange((s) => {
                if (!s.sendBack) s.sendBack = [];
                s.sendBack.push(newSendBack());
              })
            }
            className="inline-flex items-center gap-1 self-start text-[13px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            <Plus className="h-3.5 w-3.5" /> Add send-back step
          </button>
        </div>
      )}
    </InspectorShell>
  );
};

export default StepInspector;
