import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../../../utils/axios";
import { SAMPLE_STATUSES, normalizeStatuses } from "../../../../pages/Masters/MasterManagement/OrderRoutes/data/statusMaster";
import {
  SAMPLE_RULE_OPTIONS,
  emptyRules,
  mapWorkflowDetails,
} from "../../../../pages/Masters/MasterManagement/OrderRoutes/data/ruleOptions";
import { buildSampleRoutes } from "../../../../pages/Masters/MasterManagement/OrderRoutes/data/sampleRoutes";

// ─────────────────────────────────────────────────────────────────────────────
// API HOOK-UP
// Each call is switched on separately. A call marked `true` in MOCK uses sample
// data or stays in memory (lost on reload). When an API is ready: set its flag
// to false, put its path in ORDER_ROUTE_ENDPOINTS and check its mapper.
// Paths are relative to VITE_BASE_URL (e.g. http://localhost:5300/api/).
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK = {
  masters: false, // live: GET WorkFlow/workflow-details (statuses + all Start Rules lists)
  list: false, // live: GET WorkFlow/workflow-rule-status
  create: false, // live: POST WorkFlow/create-workflow
  insertSteps: false, // live: POST WorkFlow/insert-workflow-status (steps added to a saved route)
  remove: true, // TODO: no delete API yet
};

export const ORDER_ROUTE_ENDPOINTS = {
  masters: "WorkFlow/workflow-details",
  list: "WorkFlow/workflow-rule-status",
  create: "WorkFlow/create-workflow",
  insertSteps: "WorkFlow/insert-workflow-status",
  remove: (routeId) => `WorkFlow/delete-workflow/${routeId}`, // TODO: real path
};

// GET WorkFlow/workflow-rule-status returns, per workflow, only its header and
// ordered statuses:
//   { ruleHeaderID, workflowDescription,
//     orderStatus: [{ ruleStatusID, statusName, statusMasterID, wayPointOrderID }] }
// Start rules, step types, owners and SLAs are not in this response yet, so
// they get defaults: every status becomes a Waypoint.
const mapWorkflowRuleStatus = (w, statuses) => {
  const steps = (w.orderStatus || [])
    .slice()
    .sort((a, b) => (a.wayPointOrderID ?? 0) - (b.wayPointOrderID ?? 0))
    .map((s) => ({
      id: `rs_${s.ruleStatusID}`,
      ruleStatusId: s.ruleStatusID,
      kind: "waypoint",
      statusId: Number(s.statusMasterID),
      name: "",
      assigneeType: "Internal User",
      assignment: "Direct",
      assignee: "",
      slaHours: null,
      sendBack: [],
    }));
  // The response has no status type; infer it from the statuses used.
  const types = new Set(steps.map((s) => statuses.find((x) => x.id === s.statusId)?.typeId).filter(Boolean));
  return {
    id: w.ruleHeaderID,
    name: w.workflowDescription ?? "",
    status: "Active",
    statusTypeId: types.size === 1 ? [...types][0] : 1,
    // Read the rule ids too, in case the GET starts returning them.
    rules: {
      ...emptyRules(),
      entityId: w.entityID || null,
      exportAddressId: w.exportAuthorizeAddressID || null,
      orderTypeId: w.orderTypeID || null,
      customerId: w.customerCode || null,
      shipId: w.shipID || null,
      billId: w.billID || null,
    },
    steps,
  };
};

const errorMessage = (error) => error?.response?.data?.message || error?.message || String(error);

const ensureSuccess = (res, fallback) => {
  if (res.status < 200 || res.status >= 300) throw new Error("Unexpected response status: " + res.status);
  if (res.data?.isSuccess === false) throw new Error(res.data?.message || fallback);
};

const initialState = {
  routes: [],
  statuses: SAMPLE_STATUSES,
  ruleOptions: SAMPLE_RULE_OPTIONS,
  loading: false,
  saving: false,
  error: null,
  mock: MOCK,
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
    setRuleOptions: (state, action) => {
      state.ruleOptions = action.payload;
    },
    setSaving: (state, action) => {
      state.saving = action.payload;
    },
    upsertRoute: (state, action) => {
      const { route, replaceId } = action.payload;
      const i = state.routes.findIndex((r) => r.id === (replaceId ?? route.id));
      if (i >= 0) state.routes[i] = route;
      else state.routes.push(route);
      state.saving = false;
    },
    removeRoute: (state, action) => {
      state.routes = state.routes.filter((r) => r.id !== action.payload);
    },
    setRoutesError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { setRoutesLoading, setRoutes, setStatuses, setRuleOptions, setSaving, upsertRoute, removeRoute, setRoutesError } =
  orderRoutesSlice.actions;

// GET WorkFlow/workflow-details: status master + every Start Rules list
// (legal entities, export addresses, order types, customers, ship addresses).
// Lists that come back empty keep the sample fallback.
export const getOrderRouteMasters = () => async (dispatch) => {
  if (MOCK.masters) return;
  try {
    const res = await api.get(ORDER_ROUTE_ENDPOINTS.masters);
    ensureSuccess(res, "Could not load the workflow details.");
    const data = res.data?.data || {};
    const statuses = normalizeStatuses(data.orderStatuses || []);
    if (statuses.length) dispatch(setStatuses(statuses));
    const mapped = mapWorkflowDetails(data);
    dispatch(setRuleOptions({ ...mapped, entities: mapped.entities.length ? mapped.entities : SAMPLE_RULE_OPTIONS.entities }));
  } catch (error) {
    console.error("Failed to fetch workflow details:", error);
    return Promise.reject(new Error(`Could not load statuses, entities and customers (${errorMessage(error)})`));
  }
};

const fetchRoutes = async (getState) => {
  const res = await api.get(ORDER_ROUTE_ENDPOINTS.list);
  ensureSuccess(res, "The server could not return the workflows.");
  const statuses = getState().orderRoutes?.statuses || SAMPLE_STATUSES;
  const rows = Array.isArray(res.data?.data) ? res.data.data : [];
  return rows.map((r) => mapWorkflowRuleStatus(r, statuses));
};

// GET: all order routes
export const getOrderRoutes = () => async (dispatch, getState) => {
  dispatch(setRoutesLoading());
  if (MOCK.list) {
    dispatch(setRoutes(buildSampleRoutes()));
    return;
  }
  try {
    dispatch(setRoutes(await fetchRoutes(getState)));
  } catch (error) {
    console.error("Failed to fetch order routes:", error);
    dispatch(setRoutesError(errorMessage(error)));
    return Promise.reject(new Error(errorMessage(error)));
  }
};

// Save one route.
// - New route: POST create-workflow with bodies.create (toCreateWorkflowBody).
// - Saved route: steps added since the last save go to POST
//   insert-workflow-status with bodies.insert (toInsertStatusBody). There is
//   no API yet for other edits (name, start rules, reorder, remove, change a
//   step's status); those stay in memory and are listed in `notSaved`.
// Resolves with { route, sentToServer, insertedCount, notSaved }.
export const saveOrderRoute = (route, bodies, isNew) => async (dispatch, getState) => {
  dispatch(setSaving(true));
  try {
    if (isNew) {
      if (MOCK.create) {
        const saved = { ...route, id: `route_${Date.now()}` };
        dispatch(upsertRoute({ route: saved, replaceId: route.id }));
        return { route: saved, sentToServer: false, insertedCount: 0, notSaved: [] };
      }
      const before = new Set(getState().orderRoutes.routes.map((r) => r.id));
      const res = await api.post(ORDER_ROUTE_ENDPOINTS.create, bodies.create);
      ensureSuccess(res, "The server could not create the workflow.");

      // The create response shape is not fixed yet: use its ruleHeaderID when
      // present, otherwise reload the list and pick the workflow that is new.
      let newId = res.data?.data?.ruleHeaderID ?? res.data?.ruleHeaderID ?? null;
      let serverRoute = null;
      if (!MOCK.list) {
        try {
          const routes = await fetchRoutes(getState);
          dispatch(setRoutes(routes));
          if (newId == null) {
            const added = routes.filter((r) => !before.has(r.id));
            newId = (added.find((r) => r.name === bodies.create.workflowDescription) || added[added.length - 1])?.id ?? null;
          }
          serverRoute = routes.find((r) => r.id === newId) || null;
        } catch (error) {
          console.error("Created, but reloading the workflows failed:", error);
        }
      }
      const saved = serverRoute
        ? mergeServerRoute(serverRoute, route)
        : { ...route, id: newId ?? `route_${Date.now()}`, steps: route.steps.map((s) => ({ ...s, persisted: true })) };
      if (serverRoute) dispatch(setSaving(false));
      else dispatch(upsertRoute({ route: saved, replaceId: newId ?? route.id }));
      return { route: saved, sentToServer: true, insertedCount: 0, notSaved: [] };
    }

    // Existing route
    const serverCopy = getState().orderRoutes.routes.find((r) => r.id === route.id);
    const notSaved = unsupportedChanges(route, serverCopy);
    const toInsert = bodies.insert.workFlows;

    // The store keeps the server's copy, so later saves can still tell which
    // edits never reached the server.
    if (!toInsert.length || MOCK.insertSteps) {
      dispatch(setSaving(false));
      return { route, sentToServer: false, insertedCount: 0, notSaved: toInsert.length ? [...notSaved, "added steps"] : notSaved };
    }

    const res = await api.post(ORDER_ROUTE_ENDPOINTS.insertSteps, bodies.insert);
    ensureSuccess(res, "The server could not add the steps.");

    let saved = { ...route, steps: route.steps.map((s) => (s.ruleStatusId ? s : { ...s, persisted: true })) };
    if (!MOCK.list) {
      try {
        const routes = await fetchRoutes(getState);
        dispatch(setRoutes(routes));
        const fresh = routes.find((r) => r.id === route.id);
        if (fresh) saved = mergeServerRoute(fresh, route);
      } catch (error) {
        console.error("Steps added, but reloading the workflows failed:", error);
      }
    }
    dispatch(setSaving(false));
    return { route: saved, sentToServer: true, insertedCount: toInsert.length, notSaved };
  } catch (error) {
    console.error("Failed to save order route:", error);
    dispatch(setSaving(false));
    return Promise.reject(new Error(errorMessage(error)));
  }
};

// Server copy of a route + the local copy: take the server's step ids and
// order, and keep the local-only details (step type, owner, SLA, send-back)
// and start rules for this session.
function mergeServerRoute(server, local) {
  const unmatched = local.steps.filter((s) => !s.ruleStatusId);
  const steps = server.steps.map((ss) => {
    let ls = local.steps.find((l) => l.ruleStatusId && l.ruleStatusId === ss.ruleStatusId);
    if (!ls) {
      const i = unmatched.findIndex((l) => l.statusId === ss.statusId);
      if (i >= 0) ls = unmatched.splice(i, 1)[0];
    }
    return ls ? { ...ls, id: ss.id, ruleStatusId: ss.ruleStatusId, statusId: ss.statusId } : ss;
  });
  return { ...server, rules: local.rules, status: local.status, statusTypeId: local.statusTypeId, steps };
}

// Edits to a saved route that no API can store yet.
function unsupportedChanges(local, server) {
  if (!server) return [];
  const notes = [];
  if ((local.name || "").trim() !== (server.name || "").trim()) notes.push("route name");
  if (JSON.stringify(local.rules) !== JSON.stringify(server.rules)) notes.push("start rules");
  const localSaved = local.steps.filter((s) => s.ruleStatusId);
  const serverSaved = server.steps.filter((s) => s.ruleStatusId);
  if (serverSaved.some((s) => !localSaved.some((l) => l.ruleStatusId === s.ruleStatusId))) notes.push("removed steps");
  if (localSaved.some((l) => serverSaved.find((s) => s.ruleStatusId === l.ruleStatusId)?.statusId !== l.statusId)) notes.push("changed statuses");
  const order = (steps) => steps.map((s) => s.ruleStatusId).filter((id) => localSaved.some((l) => l.ruleStatusId === id) && serverSaved.some((x) => x.ruleStatusId === id));
  if (order(localSaved).join(",") !== order(serverSaved).join(",")) notes.push("step order");
  return notes;
}

// DELETE: one saved route
export const deleteOrderRoute = (routeId) => async (dispatch) => {
  if (!MOCK.remove) {
    try {
      await api.delete(ORDER_ROUTE_ENDPOINTS.remove(routeId));
    } catch (error) {
      console.error("Failed to delete order route:", error);
      return Promise.reject(new Error(errorMessage(error)));
    }
  }
  dispatch(removeRoute(routeId));
};

export default orderRoutesSlice.reducer;
