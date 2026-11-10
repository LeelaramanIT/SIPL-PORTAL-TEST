import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Popconfirm } from "antd";
import toast from "react-hot-toast";
import { Braces, Info, Save, Trash2 } from "lucide-react";
import {
  deleteOrderRoute,
  getOrderRouteMasters,
  getOrderRoutes,
  saveOrderRoute,
} from "../../../../Redux/Slices/Master/OrderRoutes/OrderRoutesSlice";
import { STATUS_TYPES } from "./data/statusMaster";
import {
  ROUTE_STATUSES,
  STEP_KINDS,
  clone,
  formatHours,
  isNewRouteId,
  newRoute,
  newStep,
  routeSummary,
  stepTitle,
  toCreateWorkflowBody,
  toInsertStatusBody,
  uid,
  usedStatusIds,
  validateRoute,
} from "./helpers";
import RouteRail from "./components/RouteRail";
import StartRulesCard from "./components/StartRulesCard";
import RouteTimeline, { StepNumber } from "./components/RouteTimeline";
import StepInspector from "./components/StepInspector";
import StartRulesInspector from "./components/StartRulesInspector";
import { InspectorShell } from "./components/InspectorShell";
import ExportJsonModal from "./components/ExportJsonModal";

const selectClass =
  "rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900";
const btnClass =
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-semibold text-slate-700 hover:border-indigo-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";

const Stat = ({ label, value, sub, warn }) => (
  <div className="min-w-[120px] flex-1 border-r border-slate-200 px-3.5 py-2.5 last:border-r-0 dark:border-slate-800">
    <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</span>
    <b className={`text-[20px] font-bold tabular-nums ${warn ? "text-amber-600" : "text-slate-900 dark:text-white"}`}>
      {value}
      {sub && <small className="ml-1 text-[12px] font-medium text-slate-400">{sub}</small>}
    </b>
  </div>
);

const EmptyInspector = () => (
  <InspectorShell eyebrow="Inspector" title="Select something to edit">
    <p className="m-0 text-[13px] text-slate-500 dark:text-slate-400">
      Click the Start card to set which orders this route applies to, or click any step to change its status, owner and SLA.
    </p>
    <div className="flex flex-col gap-3">
      {Object.entries(STEP_KINDS).map(([kind, k], i) => (
        <div key={kind} className="grid grid-cols-[40px_1fr] items-center gap-2.5 text-[13px]">
          <StepNumber kind={kind} n={i + 1} />
          <span>
            <b className="block">{k.label}</b>
            <small className="text-slate-500 dark:text-slate-400">{k.desc}</small>
          </span>
        </div>
      ))}
    </div>
    <p className="m-0 rounded-lg bg-slate-50 p-2.5 text-[12px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
      Steps are grouped into stages by status category. Drag steps to reorder them, or use the arrows.
    </p>
  </InspectorShell>
);

const OrderRoutes = () => {
  const dispatch = useDispatch();
  const { routes: savedRoutes, statuses, ruleOptions, saving, loading, error, mock } = useSelector((s) => s.orderRoutes);

  // Local working copies; edits stay here until Save.
  const [routes, setRoutes] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [dirty, setDirty] = useState({});
  const [selection, setSelection] = useState(null); // 'rules' | step id | null
  const [libQuery, setLibQuery] = useState("");
  const [jsonOpen, setJsonOpen] = useState(false);
  const dirtyRef = useRef(dirty);

  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  useEffect(() => {
    // Statuses first: the route list uses them to tell Sales Order from Inward.
    dispatch(getOrderRouteMasters())
      .catch((e) => toast.error(e.message))
      .then(() => dispatch(getOrderRoutes()))
      .catch((e) => toast.error(`Could not load order routes: ${e.message}`));
  }, [dispatch]);

  // Refresh from the store but keep routes with unsaved edits.
  useEffect(() => {
    setRoutes((prev) => {
      const keep = prev.filter((r) => dirtyRef.current[r.id]);
      const merged = savedRoutes.map((r) => keep.find((k) => k.id === r.id) || clone(r));
      keep.forEach((k) => {
        if (!merged.some((m) => m.id === k.id)) merged.push(k);
      });
      return merged;
    });
  }, [savedRoutes]);

  useEffect(() => {
    if (!currentId && routes.length) setCurrentId(routes[0].id);
  }, [routes, currentId]);

  // Warn before leaving the page with unsaved routes.
  useEffect(() => {
    const anyDirty = Object.values(dirty).some(Boolean);
    if (!anyDirty) return undefined;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setSelection(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const route = routes.find((r) => r.id === currentId) || null;
  const statusById = useMemo(() => new Map(statuses.map((s) => [s.id, s])), [statuses]);
  const usedIds = useMemo(() => usedStatusIds(route), [route]);
  const summary = routeSummary(route);
  const selectedStep = route?.steps.find((s) => s.id === selection) || null;

  // Apply a mutator to a clone of the current route and mark it unsaved.
  const updateRoute = useCallback(
    (mutate) => {
      if (!currentId) return;
      setRoutes((prev) =>
        prev.map((r) => {
          if (r.id !== currentId) return r;
          const next = clone(r);
          mutate(next);
          return next;
        }),
      );
      setDirty((d) => ({ ...d, [currentId]: true }));
    },
    [currentId],
  );

  const updateStep = (stepId, mutate) =>
    updateRoute((r) => {
      const s = r.steps.find((x) => x.id === stepId);
      if (s) {
        mutate(s);
        if (s.kind === "approval" && !s.sendBack) s.sendBack = [];
      }
    });

  const insertStep = (at, statusId) => {
    const step = newStep("waypoint", statusId ?? null);
    updateRoute((r) => r.steps.splice(at, 0, step));
    setSelection(step.id);
    if (statusId) toast.success(`Added “${stepTitle(step, statusById)}” as step ${at + 1}`);
  };

  const moveStep = (stepId, to) =>
    updateRoute((r) => {
      const i = r.steps.findIndex((s) => s.id === stepId);
      if (i < 0) return;
      const [s] = r.steps.splice(i, 1);
      const target = Math.max(0, Math.min(r.steps.length, to > i ? to - 1 : to));
      r.steps.splice(target, 0, s);
    });

  const addFromLibrary = (statusId) => {
    const i = route.steps.findIndex((s) => s.id === selection);
    insertStep(i >= 0 ? i + 1 : route.steps.length, statusId);
  };

  const selectRoute = (id) => {
    setCurrentId(id);
    setSelection(null);
    setLibQuery("");
  };

  const addRoute = () => {
    const r = newRoute();
    setRoutes((prev) => [...prev, r]);
    setDirty((d) => ({ ...d, [r.id]: true }));
    setCurrentId(r.id);
    setSelection("rules");
  };

  const handleSave = () => {
    const errors = validateRoute(route);
    if (errors.length) {
      toast.error(errors.slice(0, 3).join("\n") + (errors.length > 3 ? `\n+${errors.length - 3} more` : ""));
      return;
    }
    const oldId = route.id;
    const isNew = isNewRouteId(oldId);
    const bodies = { create: toCreateWorkflowBody(route, statusById), insert: toInsertStatusBody(route, statusById) };
    dispatch(saveOrderRoute(route, bodies, isNew))
      .then(({ route: saved, sentToServer, insertedCount, notSaved }) => {
        setRoutes((prev) => {
          const i = prev.findIndex((r) => r.id === oldId);
          const rest = prev.filter((r) => r.id !== oldId && r.id !== saved.id);
          rest.splice(i < 0 ? rest.length : Math.min(i, rest.length), 0, clone(saved));
          return rest;
        });
        setDirty((d) => {
          const next = { ...d };
          delete next[oldId];
          delete next[saved.id];
          return next;
        });
        setCurrentId(saved.id);
        if (isNew) {
          if (sentToServer) toast.success("Order route created");
          else toast("Saved for this session only: creating on the server is switched off", { icon: "ℹ️", duration: 6000 });
          return;
        }
        if (sentToServer) toast.success(`Added ${insertedCount} step${insertedCount === 1 ? "" : "s"} to the route on the server`);
        if (notSaved.length) {
          toast(`Not saved on the server (no API yet): ${notSaved.join(", ")}. These changes last until you reload.`, {
            icon: "ℹ️",
            duration: 8000,
          });
        } else if (!sentToServer) {
          toast("Nothing new to send. Step types, owners and SLAs are kept on this page only for now.", { icon: "ℹ️", duration: 6000 });
        }
      })
      .catch((e) => toast.error(`Could not save: ${e.message}`));
  };

  const handleDelete = () => {
    const id = route.id;
    const finish = () => {
      setRoutes((prev) => prev.filter((r) => r.id !== id));
      setDirty((d) => {
        const next = { ...d };
        delete next[id];
        return next;
      });
      setCurrentId(null);
      setSelection(null);
      if (isNewRouteId(id) || !mock.remove) toast.success("Order route deleted");
      else toast("Hidden for this session only: there is no delete API yet, so it comes back when you reload", { icon: "ℹ️", duration: 6000 });
    };
    if (isNewRouteId(id)) return finish();
    dispatch(deleteOrderRoute(id))
      .then(finish)
      .catch((e) => toast.error(`Could not delete: ${e.message}`));
  };

  const duplicateStep = () => {
    const i = route.steps.findIndex((s) => s.id === selection);
    // A copy is a new step for the server: drop the original's server ids.
    const copy = { ...clone(route.steps[i]), id: uid("s_"), ruleStatusId: undefined, persisted: false };
    copy.sendBack = (copy.sendBack || []).map((b) => ({ ...b, id: uid("b_") }));
    updateRoute((r) => r.steps.splice(i + 1, 0, copy));
    setSelection(copy.id);
    toast.success("Step duplicated");
  };

  const deleteStep = () => {
    updateRoute((r) => {
      r.steps = r.steps.filter((s) => s.id !== selection);
    });
    setSelection(null);
    toast.success("Step deleted");
  };

  let inspector = <EmptyInspector />;
  if (route && selection === "rules") {
    inspector = (
      <StartRulesInspector
        routeName={route.name}
        rules={route.rules}
        options={ruleOptions}
        onChange={(mutate) => updateRoute((r) => mutate(r.rules))}
        onClose={() => setSelection(null)}
      />
    );
  } else if (route && selectedStep) {
    inspector = (
      <StepInspector
        key={selectedStep.id}
        route={route}
        step={selectedStep}
        statuses={statuses}
        statusById={statusById}
        onChange={(mutate) => updateStep(selectedStep.id, mutate)}
        onClose={() => setSelection(null)}
        onDuplicate={duplicateStep}
        onDelete={deleteStep}
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 bg-slate-50 p-2 font-sans text-slate-800 dark:bg-slate-950 dark:text-slate-100 sm:p-3 lg:flex-row">
      <RouteRail
        routes={routes}
        currentId={currentId}
        dirty={dirty}
        onSelectRoute={selectRoute}
        onNewRoute={addRoute}
        statusTypeId={route?.statusTypeId ?? 1}
        statuses={statuses}
        usedIds={usedIds}
        query={libQuery}
        onQueryChange={setLibQuery}
        onAddStatus={(id) => (route ? addFromLibrary(id) : toast.error("Create or pick an order route first"))}
      />

      <main className="custom-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {!route ? (
          <div className="grid h-full place-items-center p-10 text-center text-[14px] text-slate-500">
            {loading ? (
              <p className="m-0">Loading order routes…</p>
            ) : (
              <div>
                <p className="m-0">{error ? `Could not load order routes: ${error}` : "No order route selected."}</p>
                <div className="mt-3 flex justify-center gap-2">
                  {error && (
                    <button type="button" onClick={() => dispatch(getOrderRoutes()).catch(() => {})} className={btnClass}>
                      Try again
                    </button>
                  )}
                  <button type="button" onClick={addRoute} className="rounded-md bg-indigo-600 px-3 py-1.5 text-[13px] font-semibold text-white">
                    Create order route
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mx-auto flex max-w-[880px] flex-col gap-4 px-4 pb-10 pt-5 sm:px-6">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={route.name}
                onChange={(e) => updateRoute((r) => (r.name = e.target.value))}
                aria-label="Order route name"
                className="min-w-[220px] flex-1 border-b border-dashed border-transparent bg-transparent py-0.5 text-[24px] font-bold tracking-tight outline-none hover:border-slate-300 focus:border-indigo-500"
              />
              <select aria-label="Order route status" value={route.status} onChange={(e) => updateRoute((r) => (r.status = e.target.value))} className={selectClass}>
                {ROUTE_STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <select
                aria-label="Status master type"
                value={route.statusTypeId}
                onChange={(e) => updateRoute((r) => (r.statusTypeId = Number(e.target.value)))}
                className={selectClass}
              >
                {Object.entries(STATUS_TYPES).map(([id, label]) => (
                  <option key={id} value={id}>
                    Type {id} · {label}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => setJsonOpen(true)} className={btnClass}>
                <Braces className="h-3.5 w-3.5" /> Export JSON
              </button>
              <Popconfirm title="Delete this order route?" description="This cannot be undone." okText="Delete" okButtonProps={{ danger: true }} onConfirm={handleDelete}>
                <button type="button" className={`${btnClass} !text-red-600`}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </Popconfirm>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3.5 py-1.5 text-[13px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : dirty[route.id] ? "Save changes" : "Save"}
              </button>
            </div>

            {(isNewRouteId(route.id) ? mock.create : true) ? (
              <p className="m-0 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12.5px] text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                <Info className="mt-0.5 h-3.5 w-3.5 flex-none" />
                <span>
                  {isNewRouteId(route.id)
                    ? mock.create
                      ? "Creating on the server is switched off, so this route lasts only until you reload. "
                      : ""
                    : mock.insertSteps
                      ? "This route is saved on the server. Changes here last only until you reload. "
                      : "This route is saved on the server. Save sends the steps you add; other changes (name, start rules, reorder, remove) have no API yet and last until you reload. "}                </span>
              </p>
            ) : null}

            <div className="flex flex-wrap overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <Stat label="Steps" value={summary.steps} />
              <Stat label="Approvals" value={summary.approvals} />
              <Stat label="Planned cycle" value={formatHours(summary.slaTotal)} sub={`${summary.slaTotal} h SLA`} />
              <Stat label="Owners" value={summary.owners} />
              {summary.missingStatus > 0 && <Stat label="Need a status" value={summary.missingStatus} warn />}
            </div>

            <StartRulesCard
              rules={route.rules}
              options={ruleOptions}
              selected={selection === "rules"}
              onSelect={() => setSelection("rules")}
            />

            <RouteTimeline
              route={route}
              statusById={statusById}
              selection={selection}
              onSelect={setSelection}
              onInsert={insertStep}
              onMove={moveStep}
            />
          </div>
        )}
      </main>

      {/* Inspector: docked on wide screens, slide-in drawer below 2xl */}
      {selection && (
        <div className="fixed inset-0 z-40 bg-black/30 2xl:hidden" onClick={() => setSelection(null)} aria-hidden="true" />
      )}
      <aside
        aria-label="Inspector"
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-[400px] border-l border-slate-200 bg-white shadow-2xl transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900 2xl:static 2xl:z-auto 2xl:w-[370px] 2xl:max-w-none 2xl:flex-none 2xl:translate-x-0 2xl:overflow-hidden 2xl:rounded-2xl 2xl:border 2xl:shadow-none ${
          selection ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {inspector}
      </aside>

      <ExportJsonModal
        open={jsonOpen}
        routeName={route?.name}
        payload={route ? toCreateWorkflowBody(route, statusById) : null}
        onClose={() => setJsonOpen(false)}
      />
    </div>
  );
};

export default OrderRoutes;
