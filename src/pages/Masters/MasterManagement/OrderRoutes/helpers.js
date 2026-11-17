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
// Whole-workflow switch, saved through modify-workflow-configuration.isActive.
export const ROUTE_STATUSES = ["Active", "Inactive"];

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
  isActive: true,
});

export const newSendBack = (statusId = null, assignee = "") => ({ id: uid("b_"), statusId, assignee });

export const newRoute = (statusTypeId = null) => ({
  id: uid("new_"),
  name: "New order route",
  status: "Active",
  statusTypeId,
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

// Body for POST WorkFlow/create-workflow (also shown by Export JSON):
//   { workflowDescription, entityID, exportAuthorizeAddressID, orderTypeID,
//     customerCode, shipID, billID, workFlowRuleStatus: [...] }
// CreateWorkflowRequestDto uses non-nullable `long` for the six rule ids, so a
// rule left empty ("applies to all") is sent as 0; at least one must be set
// (all six 0 = the default workflow). Steps are sent in timeline order as wayPointOrderID 1, 2, 3…
// Step type, owner, SLA and send-back paths are not in the API yet and are
// not sent.
export function toCreateWorkflowBody(route, statusById) {
  const r = route.rules || {};
  const id = (v) => ruleValue(v) ?? 0;
  return {
    workflowDescription: route.name.trim(),
    entityID: id(r.entityId),
    exportAuthorizeAddressID: id(r.exportAddressId),
    orderTypeID: id(r.orderTypeId),
    customerCode: id(r.customerId),
    shipID: id(r.shipId),
    billID: id(r.billId),
    workFlowRuleStatus: route.steps.map((s, i) => ({
      statusName: statusById.get(s.statusId)?.text ?? "",
      statusMasterID: s.statusId,
      wayPointOrderID: i + 1,
    })),
  };
}

// A step that is not on the server yet (no ruleStatusID).
export const isUnsavedStep = (s) => !s.ruleStatusId;

// Saved step whose Active switch differs from what the server has.
export const isActiveChanged = (s) => Boolean(s.ruleStatusId) && (s.isActive !== false) !== (s.serverActive !== false);

// wayPointOrderID is always the step's position in the timeline: 1, 2, 3…
// with no gaps, recalculated from the current order on every save. The order
// counts as changed when the saved steps' sequence differs from the server's
// (compared by sequence, not by number: the GET leaves gaps where it hides
// inactive steps).
export const isOrderChanged = (route) => {
  const saved = route.steps.filter((s) => s.ruleStatusId);
  const serverOrder = saved
    .slice()
    .sort((a, b) => (a.wayPointOrderId ?? 0) - (b.wayPointOrderId ?? 0))
    .map((s) => s.ruleStatusId);
  return saved.some((s, i) => s.ruleStatusId !== serverOrder[i]);
};

// Body for POST WorkFlow/insert-workflow-status (save type 2): the steps added
// to a saved route, each with the position it must take (wayPointOrderID).
// Saved steps are not sent here, so they are not inserted twice; their new
// positions go to update-workflow-status-order (toReorderBody).
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

// Body for PUT WorkFlow/update-workflow-status-order (save type 4): the full
// ordered list of the route's steps. Every step needs its ruleStatusID.
export const toReorderBody = (route) => ({
  ruleHeaderID: route.id,
  workflowStatuses: route.steps.map((s, i) => ({ ruleStatusID: s.ruleStatusId, wayPointOrderID: i + 1 })),
});

// Body for PATCH WorkFlow/workflow-status-active-inactive (save type 3), one per step.
// WorkflowActiveInactiveRequestDto has two non-nullable bools: both are always sent.
export const toActiveBody = (step) => ({ ruleStatusID: step.ruleStatusId, isActive: step.isActive !== false, isDeleted: false });

// Body for PATCH WorkFlow/workflow-status-active-inactive that deletes a saved
// step (a deleted step is also inactive).
export const toDeleteStepBody = (step) => ({ ruleStatusID: step.ruleStatusId, isActive: false, isDeleted: true });

// Same Start Rules = the same combination of set and empty fields, with
// 0 / null / "" all treated as empty.
export const sameRules = (a = {}, b = {}) => RULE_FIELDS.every(([k]) => ruleValue(a[k]) === ruleValue(b[k]));

const RULE_API_KEYS = {
  entityId: "entityID",
  exportAddressId: "exportAuthorizeAddressID",
  orderTypeId: "orderTypeID",
  customerId: "customerCode",
  shipId: "shipID",
  billId: "billID",
};

// Body for PUT WorkFlow/modify-workflow-configuration (save type 5): only the
// header fields that differ from the server copy; unchanged fields are left
// out (the API reads a missing field as "leave as is"). Returns null when
// nothing there changed. A rule set to "Any" is sent as 0, like on create:
//   { ruleHeaderID: 10, entityID: 2, shipID: 0, billID: 0, workflowDescription: "…" }
export function toModifyHeaderBody(local, server) {
  const body = { ruleHeaderID: local.id };
  if ((local.name || "").trim() !== (server.name || "").trim()) body.workflowDescription = local.name.trim();
  RULE_FIELDS.forEach(([k]) => {
    const lv = ruleValue(local.rules?.[k]);
    if (lv !== ruleValue(server.rules?.[k])) body[RULE_API_KEYS[k]] = lv ?? 0;
  });
  if (local.status !== server.status) body.isActive = local.status === "Active";
  return Object.keys(body).length > 1 ? body : null;
}

// Start Rules: any one or more of the six fields. An empty field means
// "applies to all"; the page keeps it as null and sends it as 0 (the DTO's
// ids are non-nullable long).
export const RULE_FIELDS = [
  ["entityId", "Entity"],
  ["exportAddressId", "Export address"],
  ["orderTypeId", "Order type"],
  ["customerId", "Customer"],
  ["shipId", "Ship-to"],
  ["billId", "Bill-to"],
];
// 0, null, "" and undefined all count as empty.
export const ruleValue = (v) => (v === "" || v == null || Number(v) <= 0 || Number.isNaN(Number(v)) ? null : Number(v));
export const setRules = (rules = {}) => RULE_FIELDS.filter(([k]) => ruleValue(rules[k]) != null).map(([, label]) => label);
export const hasAnyRule = (rules) => setRules(rules).length > 0;
// All six rules on Any = the DEFAULT workflow: it matches every order, so it is
// used only when no more specific route matches (most set fields wins).
export const isDefaultRules = (rules) => !hasAnyRule(rules);

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
