import { CATEGORY_ORDER, prettyStatus } from "./data/statusMaster";
import { emptyRules } from "./data/ruleOptions";

export const uid = (prefix) => `${prefix}${Math.random().toString(36).slice(2, 9)}`;
export const isNewRouteId = (id) => String(id).startsWith("new_");
export const clone = (o) => JSON.parse(JSON.stringify(o));
export const pad2 = (n) => String(n).padStart(2, "0");

// 4 -> "4 h", 48 -> "2 d", 30 -> "1.3 d"
export const formatHours = (h) => {
  const n = Number(h) || 0;
  if (!n) return "0 h";
  return n >= 24 ? `${+(n / 24).toFixed(1)} d` : `${n} h`;
};

export const STEP_KINDS = {
  waypoint: { label: "Waypoint", desc: "A marker the order passes when it reaches this status. Nobody has to act." },
  task: { label: "Task", desc: "Someone must finish this work before the order moves on." },
  approval: { label: "Approval", desc: "An approver moves the order forward or sends it back along a revision path." },
};

export const ASSIGNEE_TYPES = ["Internal User", "Service Provider", "Customer"];
export const ASSIGNMENT_MODES = ["Direct", "Round Robin"];
export const ROUTE_STATUSES = ["Active", "Draft", "Inactive"];

export const newStep = (kind = "waypoint", statusId = null, o = {}) => ({
  id: uid("s_"),
  kind,
  statusId,
  name: o.name || "",
  assigneeType: o.assigneeType || "Internal User",
  assignment: o.assignment || "Direct",
  assignee: o.assignee || "",
  slaHours: o.slaHours ?? null,
  sendBack: o.sendBack || [],
});

export const newSendBack = (statusId = null, assignee = "") => ({ id: uid("b_"), statusId, assignee });

export const newRoute = () => ({
  id: uid("new_"),
  name: "New order route",
  status: "Draft",
  statusTypeId: 1,
  rules: emptyRules(),
  steps: [],
});

export const stepTitle = (step, statusById) => {
  const st = statusById.get(step.statusId);
  return step.name || (st ? prettyStatus(st.text) : "Choose a status");
};

// Consecutive steps that share a status category form one stage.
export function groupIntoStages(steps, statusById) {
  const stages = [];
  steps.forEach((step, index) => {
    const category = statusById.get(step.statusId)?.category || "Unsorted";
    const last = stages[stages.length - 1];
    if (last && last.category === category) last.items.push({ step, index });
    else stages.push({ category, items: [{ step, index }] });
  });
  return stages;
}

export const usedStatusIds = (route) => {
  const used = new Set();
  route?.steps.forEach((s) => {
    used.add(s.statusId);
    (s.sendBack || []).forEach((b) => used.add(b.statusId));
  });
  return used;
};

export const sortByCategory = (a, b) =>
  CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || a.id - b.id;

export function routeSummary(route) {
  const steps = route?.steps || [];
  return {
    steps: steps.length,
    approvals: steps.filter((s) => s.kind === "approval").length,
    slaTotal: steps.reduce((a, s) => a + (Number(s.slaHours) || 0), 0),
    owners: new Set(steps.map((s) => s.assignee).filter(Boolean)).size,
    missingStatus: steps.filter((s) => !s.statusId).length,
  };
}

// Body for POST WorkFlow/create-workflow (also shown by Export JSON).
// Rules left on "Any" are sent as 0. Steps are sent in timeline order as
// wayPointOrderID 1, 2, 3…
// `workflowDescription` (the route name) is not in the current API contract;
// it is sent so the backend can store it once the field is added — the GET
// returns workflowDescription, so create needs to accept it.
// Step type, owner, SLA and send-back paths are not in the API yet and are
// not sent.
export function toCreateWorkflowBody(route, statusById) {
  const r = route.rules || {};
  return {
    workflowDescription: route.name.trim(),
    entityID: r.entityId ?? 0,
    exportAuthorizeAddressID: r.exportAddressId ?? 0,
    orderTypeID: r.orderTypeId ?? 0,
    customerCode: r.customerId ?? 0,
    shipID: r.shipId ?? 0,
    billID: r.billId ?? 0,
    workFlowRuleStatus: route.steps.map((s, i) => ({
      statusName: statusById.get(s.statusId)?.text ?? "",
      statusMasterID: s.statusId,
      wayPointOrderID: i + 1,
    })),
  };
}

// A step that is not on the server yet: no ruleStatusId from the GET and not
// sent in an earlier save of this session.
export const isUnsavedStep = (s) => !s.ruleStatusId && !s.persisted;

// Body for POST WorkFlow/insert-workflow-status: the steps added to a saved
// route, each with its position in the timeline (wayPointOrderID).
export function toInsertStatusBody(route, statusById) {
  return {
    ruleHeaderID: route.id,
    workFlows: route.steps
      .map((s, i) => ({ step: s, wayPointOrderID: i + 1 }))
      .filter(({ step }) => isUnsavedStep(step))
      .map(({ step, wayPointOrderID }) => ({
        statusName: statusById.get(step.statusId)?.text ?? "",
        statusMasterID: step.statusId,
        wayPointOrderID,
      })),
  };
}

// Problems that block saving.
export function validateRoute(route) {
  const errors = [];
  if (!route.name.trim()) errors.push("Give the route a name.");
  if (!route.steps.length) errors.push("Add at least one step.");
  route.steps.forEach((s, i) => {
    if (!s.statusId) errors.push(`Step ${i + 1} needs a status.`);
    (s.sendBack || []).forEach((b, j) => {
      if (!b.statusId) errors.push(`Step ${i + 1}: send-back step ${j + 1} needs a status.`);
    });
  });
  return errors;
}
