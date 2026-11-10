import { createSlice } from "@reduxjs/toolkit";
import { api } from "../../../../utils/axios";
import { SAMPLE_STATUSES, normalizeStatuses } from "../../../../pages/Masters/MasterManagement/OrderRoutes/data/statusMaster";
import {
  SAMPLE_RULE_OPTIONS,
  emptyRules,
  mapCustomerMaster,
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
  statuses: true, // TODO: status master API (ID, StatusText, TypeID)
  ruleOptions: false, // live: entities + customers from /OrderProcess/customer-master
  list: false, // live: GET WorkFlow/workflow-rule-status
  create: false, // live: POST WorkFlow/create-workflow
  update: true, // TODO: no update API yet — edits to saved routes stay in memory
  remove: true, // TODO: no delete API yet
};

export const ORDER_ROUTE_ENDPOINTS = {
  statuses: "WorkFlow/status-master", // TODO: real path
  ruleOptions: "/OrderProcess/customer-master",
  list: "WorkFlow/workflow-rule-status",
  create: "WorkFlow/create-workflow",
  update: (routeId) => `WorkFlow/update-workflow/${routeId}`, // TODO: real path
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

// GET: status master + Start Rules option lists (entities, customers, addresses)
export const getOrderRouteMasters = () => async (dispatch) => {
  const failures = [];

  if (!MOCK.statuses) {
    try {
      const res = await api.get(ORDER_ROUTE_ENDPOINTS.statuses);
      ensureSuccess(res, "Could not load the status master.");
      dispatch(setStatuses(normalizeStatuses(res.data?.data || [])));
    } catch (error) {
      console.error("Failed to fetch status master:", error);
      failures.push(`statuses (${errorMessage(error)})`);
    }
  }

  if (!MOCK.ruleOptions) {
    try {
      const res = await api.get(ORDER_ROUTE_ENDPOINTS.ruleOptions);
      ensureSuccess(res, "Could not load entities and customers.");
      const mapped = mapCustomerMaster(res.data?.data);
      dispatch(setRuleOptions({ ...mapped, entities: mapped.entities.length ? mapped.entities : SAMPLE_RULE_OPTIONS.entities }));
    } catch (error) {
      console.error("Failed to fetch entities and customers:", error);
      failures.push(`entities and customers (${errorMessage(error)})`);
    }
  }

  if (failures.length) return Promise.reject(new Error(`Could not load ${failures.join(" and ")}`));
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

// Save one route. New routes go to POST create-workflow with `body` from
// toCreateWorkflowBody(); there is no update API yet, so edits to an existing
// route are kept in memory only.
// Resolves with { route, sentToServer }.
export const saveOrderRoute = (route, body, isNew) => async (dispatch, getState) => {
  dispatch(setSaving(true));
  try {
    if (!isNew || MOCK.create) {
      if (!isNew && !MOCK.update) {
        const res = await api.put(ORDER_ROUTE_ENDPOINTS.update(route.id), body);
        ensureSuccess(res, "The server could not update the workflow.");
        dispatch(upsertRoute({ route }));
        return { route, sentToServer: true };
      }
      const saved = isNew ? { ...route, id: `route_${Date.now()}` } : route;
      dispatch(upsertRoute({ route: saved, replaceId: route.id }));
      return { route: saved, sentToServer: false };
    }

    const before = new Set(getState().orderRoutes.routes.map((r) => r.id));
    const res = await api.post(ORDER_ROUTE_ENDPOINTS.create, body);
    ensureSuccess(res, "The server could not create the workflow.");

    // The create response shape is not fixed yet: use its ruleHeaderID when
    // present, otherwise reload the list and pick the workflow that is new.
    let newId = res.data?.data?.ruleHeaderID ?? res.data?.ruleHeaderID ?? null;
    if (!MOCK.list) {
      try {
        const routes = await fetchRoutes(getState);
        dispatch(setRoutes(routes));
        if (newId == null) {
          const added = routes.filter((r) => !before.has(r.id));
          newId = (added.find((r) => r.name === body.workflowDescription) || added[added.length - 1])?.id ?? null;
        }
      } catch (error) {
        console.error("Created, but reloading the workflows failed:", error);
      }
    }

    // Keep the local copy (step types, owners, SLAs) for this session under
    // the server id; the GET does not return those fields yet.
    const saved = { ...route, id: newId ?? `route_${Date.now()}` };
    dispatch(upsertRoute({ route: saved, replaceId: newId ?? route.id }));
    return { route: saved, sentToServer: true };
  } catch (error) {
    console.error("Failed to save order route:", error);
    dispatch(setSaving(false));
    return Promise.reject(new Error(errorMessage(error)));
  }
};

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
