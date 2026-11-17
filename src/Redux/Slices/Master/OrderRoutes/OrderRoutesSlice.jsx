import { createSlice } from "@reduxjs/toolkit";
import { workflowApi } from "./workflowApi";
import { mapStatusTypes, normalizeStatuses } from "../../../../pages/Masters/MasterManagement/OrderRoutes/data/statusMaster";
import {
  EMPTY_RULE_OPTIONS,
  emptyRules,
  mapWorkflowDetails,
} from "../../../../pages/Masters/MasterManagement/OrderRoutes/data/ruleOptions";
import {
  isActiveChanged,
  isOrderChanged,
  isUnsavedStep,
  isDefaultRules,
  sameRules,
  toActiveBody,
  toCreateWorkflowBody,
  toDeleteStepBody,
  toInsertStatusBody,
  toModifyHeaderBody,
  toReorderBody,
} from "../../../../pages/Masters/MasterManagement/OrderRoutes/helpers";

// "D-14 SOUTH SIDE, B-BLOCK ,~AUTO NAGAR" -> "D-14 SOUTH SIDE, B-BLOCK, AUTO NAGAR"; blank -> "".
const cleanText = (v) =>
  String(v ?? "")
    .replace(/~/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/\s+/g, " ")
    .trim();

// A rule's id with the name the API sent for it; null when the rule is "Any".
const named = (id, name) => (id ? { id: Number(id), name: cleanText(name) } : null);

// GET WorkFlow/workflow-rule-status returns, per workflow, its header, start
// rules (ids + display names) and ordered statuses:
//   { ruleHeaderID, workflowDescription,
//     entityID, entityName, customerCode, customerName, orderTypeID, orderTypeName,
//     shipID, shipAddress, billID, billAddress, exportAuthorizeAddressID, exportAddress,
//     orderStatus: [{ ruleStatusID, statusName, statusMasterID, wayPointOrderID, isActive? }] }
// A rule id of 0 means "Any". Step types, owners and SLAs are not in this
// response yet, so they get defaults: every status becomes a Waypoint.
const mapWorkflowRuleStatus = (w, statuses) => {
  const steps = (w.orderStatus || [])
    .slice()
    .sort((a, b) => (a.wayPointOrderID ?? 0) - (b.wayPointOrderID ?? 0))
    .map((s) => {
      // isActive is not in the GET yet: treat a step as active unless it says otherwise.
      const active = s.isActive ?? s.IsActive;
      return {
        id: `rs_${s.ruleStatusID}`,
        ruleStatusId: s.ruleStatusID,
        wayPointOrderId: Number(s.wayPointOrderID) || null,
        kind: "waypoint",
        statusId: Number(s.statusMasterID),
        name: "",
        assigneeType: "Internal User",
        assignment: "Direct",
        assignee: "",
        slaHours: null,
        sendBack: [],
        isActive: active == null ? null : Boolean(active),
        serverActive: active == null ? null : Boolean(active),
      };
    });
  // Use the route's type when the API sends it; otherwise infer it from the
  // statuses used (null when they are mixed or untyped).
  const types = new Set(steps.map((s) => statuses.find((x) => x.id === s.statusId)?.typeId).filter((t) => t != null));
  const apiType = w.statusTypeId ?? w.typeId ?? w.typeID;
  // Header isActive is not in the GET yet; a workflow counts as Active unless it says otherwise.
  const headerActive = w.isActive ?? w.IsActive;
  return {
    id: w.ruleHeaderID,
    name: w.workflowDescription ?? "",
    status: headerActive === false ? "Inactive" : "Active",
    statusTypeId: apiType != null ? Number(apiType) : types.size === 1 ? [...types][0] : null,
    rules: {
      ...emptyRules(),
      entityId: Number(w.entityID) || null,
      exportAddressId: Number(w.exportAuthorizeAddressID) || null,
      orderTypeId: Number(w.orderTypeID) || null,
      customerId: Number(w.customerCode) || null,
      shipId: Number(w.shipID) || null,
      billId: Number(w.billID) || null,
    },
    // Names the server sent for the saved rules, used when an id is not in
    // the workflow-details lists. Each one applies only while its id is unchanged.
    ruleNames: {
      entityId: named(w.entityID, w.entityName),
      exportAddressId: named(w.exportAuthorizeAddressID, w.exportAddress),
      orderTypeId: named(w.orderTypeID, w.orderTypeName),
      customerId: named(w.customerCode, w.customerName),
      shipId: named(w.shipID, w.shipAddress),
      billId: named(w.billID, w.billAddress),
    },
    steps,
  };
};

const initialState = {
  routes: [],
  statuses: [],
  statusTypes: [],
  ruleOptions: EMPTY_RULE_OPTIONS,
  loading: false,
  saving: false,
  error: null,
  canDeleteOnServer: true, // PUT modify-workflow-configuration { isDelete: true }
  // Active/Inactive set through modify-workflow-configuration, kept here
  // because the GET does not return the header's isActive yet.
  headerStatus: {},
  // Ids deleted this session: the delete is soft and the GET still returns them.
  deletedIds: [],
};

const orderRoutesSlice = createSlice({
  name: "orderRoutes",
  initialState,
  reducers: {
    setRoutesLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setRoutes: (state, action) => {
      state.routes = action.payload;
      state.loading = false;
    },
    setStatuses: (state, action) => {
      state.statuses = action.payload;
    },
    setStatusTypes: (state, action) => {
      state.statusTypes = action.payload;
    },
    setRuleOptions: (state, action) => {
      state.ruleOptions = action.payload;
    },
    setSaving: (state, action) => {
      state.saving = action.payload;
    },
    removeRoute: (state, action) => {
      state.routes = state.routes.filter((r) => r.id !== action.payload);
      delete state.headerStatus[action.payload];
      if (!state.deletedIds.includes(action.payload)) state.deletedIds.push(action.payload);
    },
    setHeaderStatus: (state, action) => {
      const { id, status } = action.payload;
      state.headerStatus[id] = status;
      const r = state.routes.find((x) => x.id === id);
      if (r) r.status = status;
    },
    setRoutesError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  setRoutesLoading,
  setRoutes,
  setStatuses,
  setStatusTypes,
  setRuleOptions,
  setSaving,
  removeRoute,
  setHeaderStatus,
  setRoutesError,
} = orderRoutesSlice.actions;

// GET WorkFlow/workflow-details: status master, status types and every Start
// Rules list (legal entities, export addresses, order types, customers, ship
// addresses).
export const getOrderRouteMasters = () => async (dispatch) => {
  try {
    const { data = {} } = await workflowApi.getDetails();
    const statuses = normalizeStatuses(data?.orderStatuses || []);
    dispatch(setStatuses(statuses));
    dispatch(setStatusTypes(mapStatusTypes(data || {}, statuses)));
    dispatch(setRuleOptions(mapWorkflowDetails(data || {})));
  } catch (error) {
    console.error("Failed to fetch workflow details:", error);
    return Promise.reject(new Error(`Could not load statuses, entities and customers (${error.message})`));
  }
};

const fetchRoutes = async (getState) => {
  const { data } = await workflowApi.getWorkflows();
  const { statuses = [], headerStatus = {}, deletedIds = [] } = getState().orderRoutes || {};
  return (Array.isArray(data) ? data : [])
    .filter((r) => !deletedIds.includes(r.ruleHeaderID) && r.isDelete !== true && r.IsDelete !== true)
    .map((r) => {
      const route = mapWorkflowRuleStatus(r, statuses);
      const known = headerStatus[route.id];
      return known && (r.isActive ?? r.IsActive) == null ? { ...route, status: known } : route;
    });
};

// GET: all order routes
export const getOrderRoutes = () => async (dispatch, getState) => {
  dispatch(setRoutesLoading());
  try {
    dispatch(setRoutes(await fetchRoutes(getState)));
  } catch (error) {
    console.error("Failed to fetch order routes:", error);
    dispatch(setRoutesError(error.message));
    return Promise.reject(error);
  }
};

// ─── Save ────────────────────────────────────────────────────────────────────
// Which calls a save needs, from the route's current state:
//   no ruleHeaderID (new route)          → 1  POST  create-workflow (full ordered list)
//   saved route with steps added         → 2  POST  insert-workflow-status (new steps, at their positions)
//                                           4  PUT   update-workflow-status-order (full ordered list)
//   saved route with steps reordered     → 4  PUT   update-workflow-status-order (full ordered list)
//   saved steps removed                  → 3  PATCH workflow-status-active-inactive { isDeleted: true } (one call per step)
//                                           4  PUT   update-workflow-status-order (renumber 1, 2, 3…)
//   saved steps switched on / off        → 3  PATCH workflow-status-active-inactive { isActive } (one call per step)
//   name, start rules, workflow on / off → 5  PUT   modify-workflow-configuration (changed fields only)
// Calls run in this order: deletes → 2 → 4 → 3 → 5, and stop at the first failure.
//
// Throws (before any call) when the route cannot be saved as it is.
export function planSave(route, serverCopy, allRoutes, statusById) {
  if (!serverCopy) {
    // Same combination of set and empty fields as an active workflow.
    const duplicate = allRoutes.find((r) => r.id !== route.id && r.status !== "Inactive" && sameRules(r.rules, route.rules));
    if (duplicate)
      throw new Error(
        isDefaultRules(route.rules)
          ? `A default workflow (all Start Rules on Any) is already active: “${duplicate.name || `#${duplicate.id}`}”. Only one default is allowed: open that one and change it, or switch it to Inactive first.`
          : `An active workflow already has exactly these Start Rules: “${duplicate.name || `#${duplicate.id}`}”. Open that workflow and change it instead.`,
      );
    return { kind: "create", create: toCreateWorkflowBody(route, statusById), notSaved: [] };
  }

  // Saved steps the user removed from the page: deleted on the server.
  const deletes = serverCopy.steps.filter((s) => !route.steps.some((l) => l.ruleStatusId === s.ruleStatusId));

  const header = toModifyHeaderBody(route, serverCopy);
  if (header && !sameRules(route.rules, serverCopy.rules)) {
    const duplicate = allRoutes.find((r) => r.id !== route.id && r.status !== "Inactive" && sameRules(r.rules, route.rules));
    if (duplicate)
      throw new Error(
        isDefaultRules(route.rules)
          ? `A default workflow (all Start Rules on Any) is already active: “${duplicate.name || `#${duplicate.id}`}”.`
          : `An active workflow already has exactly these Start Rules: “${duplicate.name || `#${duplicate.id}`}”.`,
      );
  }
  const insert = route.steps.some(isUnsavedStep) ? toInsertStatusBody(route, statusById) : null;
  return {
    kind: "update",
    deletes, // type 3 (delete)
    insert, // type 2
    reorder: Boolean(insert) || deletes.length > 0 || isOrderChanged(route), // type 4: also renumbers after a delete
    toggles: route.steps.filter(isActiveChanged), // type 3
    header, // type 5
    notSaved: unsupportedChanges(route, serverCopy),
  };
}

// Gives local steps that have no ruleStatusID the id of the matching server
// row: by position (insert response) or by status (reloaded list). Keeps the
// local order.
function fillStepIds(route, serverRows) {
  const claimed = new Set(route.steps.map((s) => s.ruleStatusId).filter(Boolean));
  const pool = serverRows.filter((r) => r.ruleStatusId && !claimed.has(r.ruleStatusId));
  const steps = route.steps.map((s, i) => {
    if (s.ruleStatusId) return s;
    let k = pool.findIndex((r) => r.wayPointOrderId === i + 1 && (r.statusId == null || r.statusId === s.statusId));
    if (k < 0) k = pool.findIndex((r) => r.statusId === s.statusId);
    if (k < 0) return s;
    const row = pool.splice(k, 1)[0];
    return { ...s, ruleStatusId: row.ruleStatusId, wayPointOrderId: row.wayPointOrderId ?? i + 1 };
  });
  return { ...route, steps };
}

// Server copy of a route + the local copy: take the server's step ids and
// order, and keep the local-only details (step type, owner, SLA, send-back,
// active flag when the GET does not return it) and start rules for this session.
function mergeServerRoute(server, local) {
  const unmatched = local.steps.filter((s) => !s.ruleStatusId);
  const steps = server.steps.map((ss) => {
    let ls = local.steps.find((l) => l.ruleStatusId && l.ruleStatusId === ss.ruleStatusId);
    if (!ls) {
      const i = unmatched.findIndex((l) => l.statusId === ss.statusId);
      if (i >= 0) ls = unmatched.splice(i, 1)[0];
    }
    if (!ls) return ss;
    const isActive = ss.isActive ?? ls.isActive;
    const serverActive = ss.serverActive ?? ls.serverActive;
    return { ...ls, id: ss.id, ruleStatusId: ss.ruleStatusId, statusId: ss.statusId, wayPointOrderId: ss.wayPointOrderId, isActive, serverActive };
  });
  return { ...server, rules: local.rules, ruleNames: server.ruleNames, status: local.status, statusTypeId: local.statusTypeId, steps };
}

// Edits to a saved route that no API can store yet.
function unsupportedChanges(local, server) {
  const notes = [];
  if (local.steps.some((l) => l.ruleStatusId && server.steps.find((s) => s.ruleStatusId === l.ruleStatusId)?.statusId !== l.statusId))
    notes.push("changed statuses");
  return notes;
}

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

// Save one route: works out the save types (planSave), runs them in order and
// stops at the first failure, then reloads the workflow list.
// Resolves with { route, messages, notSaved, sent }.
// Rejects with an Error that also carries `route` (the local copy including
// whatever did reach the server) and `messages` (the calls that succeeded).
export const saveOrderRoute = (route, statusById) => async (dispatch, getState) => {
  const state = getState().orderRoutes;
  if (state.saving) throw new Error("A save is already in progress.");
  const serverCopy = state.routes.find((r) => r.id === route.id) || null;
  const plan = planSave(route, serverCopy, state.routes, statusById);

  dispatch(setSaving(true));
  const messages = [];
  let working = route;
  let reloaded = null;
  const reload = async () => {
    reloaded = await fetchRoutes(getState);
    dispatch(setRoutes(reloaded));
    return reloaded;
  };

  try {
    if (plan.kind === "create") {
      // Save type 1
      const { message, data } = await workflowApi.create(plan.create);
      const sent = plan.create.workFlowRuleStatus.length;
      const inserted = Number(data?.totalStatusInserted);
      messages.push(message || `Workflow created with ${plural(sent, "step")}.`);
      if (Number.isFinite(inserted) && inserted < sent) messages.push(`Warning: the server stored ${inserted} of ${sent} steps.`);

      const routes = await reload();
      let newId = Number(data?.ruleHeaderID) || null;
      if (!newId) {
        const known = new Set(state.routes.map((r) => r.id));
        newId = routes.find((r) => !known.has(r.id))?.id ?? null;
      }
      // Created workflows are active; switch off now if the user chose Inactive.
      if (newId && route.status === "Inactive") {
        const { message } = await workflowApi.modifyHeader({ ruleHeaderID: newId, isActive: false });
        messages.push(message || "Workflow set to Inactive.");
        dispatch(setHeaderStatus({ id: newId, status: "Inactive" }));
      }
      const fresh = routes.find((r) => r.id === newId);
      return { route: fresh ? mergeServerRoute(fresh, route) : route, messages, notSaved: [], sent: true };
    }

    const nothingToSend = !plan.deletes.length && !plan.insert && !plan.reorder && !plan.toggles.length && !plan.header;
    if (nothingToSend) return { route, messages, notSaved: plan.notSaved, sent: false };

    // Save type 3 (delete): saved steps removed on the page go first, so the
    // positions of the steps added below are counted without them
    let deleteMessage = "";
    for (const step of plan.deletes) {
      ({ message: deleteMessage } = await workflowApi.deleteStatus(toDeleteStepBody(step)));
    }
    if (plan.deletes.length === 1) messages.push(deleteMessage || "Step deleted.");
    else if (plan.deletes.length > 1) messages.push(`Deleted ${plural(plan.deletes.length, "step")}.`);

    // Save type 2: add the new steps at their positions
    if (plan.insert) {
      const { message, data } = await workflowApi.insertStatus(plan.insert);
      messages.push(message || `Added ${plural(plan.insert.workFlows.length, "step")}.`);
      const rows = data.map((r) => ({ ruleStatusId: r.ruleStatusID, wayPointOrderId: Number(r.wayPointOrderID) || null, statusId: null }));
      working = fillStepIds(working, rows);
      if (working.steps.some(isUnsavedStep)) {
        // The response did not identify every new row: take the ids from the reloaded list.
        const fresh = (await reload()).find((r) => r.id === route.id);
        if (fresh) working = fillStepIds(working, fresh.steps);
      }
    }

    // Save type 4: full ordered list, positions 1, 2, 3…
    if (plan.reorder) {
      if (working.steps.some(isUnsavedStep))
        throw new Error("The new steps were added, but the server did not return their ids, so the step order could not be saved. Reload the page and save the order again.");
      const { message, data } = await workflowApi.reorder(toReorderBody(working));
      messages.push(message || `Step order saved (${plural(Number(data?.updatedRecords) || working.steps.length, "step")}).`);
      working = { ...working, steps: working.steps.map((s, i) => ({ ...s, wayPointOrderId: i + 1 })) };
    }

    // Save type 3: one call per step whose Active switch changed
    for (const step of plan.toggles) {
      const body = toActiveBody(step);
      const { message } = await workflowApi.setStatusActive(body);
      messages.push(message || `Step #${step.statusId} ${body.isActive ? "activated" : "deactivated"}.`);
      working = {
        ...working,
        steps: working.steps.map((s) => (s.ruleStatusId === step.ruleStatusId ? { ...s, serverActive: body.isActive } : s)),
      };
    }

    // Save type 5: name, start rules, whole-workflow switch (changed fields only)
    if (plan.header) {
      const { message } = await workflowApi.modifyHeader(plan.header);
      messages.push(message || "Workflow details updated.");
      if (plan.header.isActive != null) dispatch(setHeaderStatus({ id: route.id, status: plan.header.isActive ? "Active" : "Inactive" }));
    }

    const fresh = (await reload()).find((r) => r.id === route.id);
    return { route: fresh ? mergeServerRoute(fresh, working) : working, messages, notSaved: plan.notSaved, sent: true };
  } catch (error) {
    console.error("Failed to save order route:", error);
    // Show the newest server state for whatever did succeed.
    if (messages.length && !reloaded) {
      try {
        await reload();
      } catch (e) {
        console.error("Reloading the workflows failed:", e);
      }
    }
    const err = new Error(error.message);
    err.route = working;
    err.messages = messages;
    throw err;
  } finally {
    dispatch(setSaving(false));
  }
};

// Delete ONE saved step right away (the Delete step button):
//   PATCH workflow-status-active-inactive { ruleStatusID, isActive: false, isDeleted: true }
// then PUT update-workflow-status-order renumbers the remaining saved steps
// 1, 2, 3… in the server's own order (so a reorder the user has not saved yet
// is not saved by accident), then the list is reloaded.
// Resolves with { messages }; rejects with an Error carrying `messages` when a
// later call fails after the delete already went through.
export const deleteSavedStep = (route, step) => async (dispatch, getState) => {
  const state = getState().orderRoutes;
  if (state.saving) throw new Error("A save is already in progress.");
  const serverCopy = state.routes.find((r) => r.id === route.id);
  dispatch(setSaving(true));
  const messages = [];
  try {
    const { message } = await workflowApi.deleteStatus(toDeleteStepBody(step));
    messages.push(message || "Step deleted.");
    const rest = (serverCopy?.steps || []).filter((s) => s.ruleStatusId && s.ruleStatusId !== step.ruleStatusId);
    if (rest.length) {
      const { message: m } = await workflowApi.reorder({
        ruleHeaderID: route.id,
        workflowStatuses: rest.map((s, i) => ({ ruleStatusID: s.ruleStatusId, wayPointOrderID: i + 1 })),
      });
      messages.push(m || "Step order saved.");
    }
    try {
      dispatch(setRoutes(await fetchRoutes(getState)));
    } catch (e) {
      console.error("Step deleted, but reloading the workflows failed:", e);
    }
    return { messages };
  } catch (error) {
    console.error("Failed to delete the step:", error);
    const err = new Error(error.message);
    err.messages = messages;
    err.stepDeleted = messages.length > 0;
    throw err;
  } finally {
    dispatch(setSaving(false));
  }
};

// Delete one saved route: PUT modify-workflow-configuration { isDelete: true }.
// Resolves with the server's message.
export const deleteOrderRoute = (routeId) => async (dispatch) => {
  try {
    const { message } = await workflowApi.remove(routeId);
    dispatch(removeRoute(routeId));
    return message;
  } catch (error) {
    console.error("Failed to delete order route:", error);
    return Promise.reject(error);
  }
};

export default orderRoutesSlice.reducer;
