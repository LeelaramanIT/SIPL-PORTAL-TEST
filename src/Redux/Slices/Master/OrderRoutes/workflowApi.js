// API service layer for the WorkFlow controller (Order Routes page).
// Paths are relative to VITE_BASE_URL (e.g. http://localhost:5300/api/).
// Every call resolves with { message, data } or rejects with an Error whose
// message is the server's own message whenever it sent one.
import toast from "react-hot-toast";
import { api } from "../../../../utils/axios";

export const WORKFLOW_ENDPOINTS = {
  details: "WorkFlow/workflow-details", // GET  statuses, status types, Start Rules lists
  list: "WorkFlow/workflow-rule-status", // GET  all workflows with their steps
  create: "WorkFlow/create-workflow", // POST    save type 1
  insertStatus: "WorkFlow/insert-workflow-status", // POST    save type 2
  activeInactive: "WorkFlow/workflow-status-active-inactive", // PATCH save type 3
  reorder: "WorkFlow/update-workflow-status-order", // PUT     save type 4
  modify: "WorkFlow/modify-workflow-configuration", // PUT     save type 5 (header: name, rules, on/off, delete)
};

// ─── Request models ──────────────────────────────────────────────────────────
// CreateWorkflowRequestDto
//   { entityID, exportAuthorizeAddressID, orderTypeID, customerCode, shipID, billID,
//     workFlowRuleStatus: [{ statusName, statusMasterID, wayPointOrderID }] }
// InsertWorkflowStatusRequestDto
//   { ruleHeaderID, workFlows: [{ statusName, statusMasterID, wayPointOrderID }] }
// WorkflowActiveInactiveRequestDto
//   { ruleStatusID, isActive, isDeleted }   (both bools always sent; isDeleted: true deletes the step)
// UpdateWorkflowStatusOrderRequestDto
//   { ruleHeaderID, workflowStatuses: [{ ruleStatusID, wayPointOrderID }] }
// ModifyWorkflowConfigurationRequestDto — only the fields to change; null = unchanged
//   { ruleHeaderID, isDelete?, isActive?, entityID?, exportAuthorizeAddressID?,
//     orderTypeID?, customerCode?, shipID?, billID?, workflowDescription? }
//   A rule set to "Any" is sent as 0 (same as create); unchanged rules are left out.
//   Description ≤ 500 chars; at least one field besides ruleHeaderID.
//
// ─── Response models (all wrapped in ApiResponse) ────────────────────────────
// ApiResponse<T>: { isSuccess, statusCode, message, data: T, status }
//   create         T = { ruleHeaderID, totalStatusInserted }
//   insertStatus   T = [{ statusCode, message, ruleHeaderID, ruleStatusID, statusName, wayPointOrderID }]
//   activeInactive T = { isSuccess, message }
//   reorder        T = { updatedRecords }
//   modify         T = { isSuccess, message }

// Text of an error body: ApiResponse.message, ASP.NET ProblemDetails
// (title + validation errors) or a plain string.
const bodyMessage = (body) => {
  if (!body) return "";
  if (typeof body === "string") return body.slice(0, 300);
  if (body.message) return body.message;
  const fieldErrors = body.errors && typeof body.errors === "object" ? Object.values(body.errors).flat().filter(Boolean) : [];
  return [body.title, ...fieldErrors].filter(Boolean).join(" ");
};

// Turns an HTTP response into { message, data }, or throws with the server's message.
function unwrap(res, fallback) {
  const body = res?.data;
  if (!res || res.status < 200 || res.status >= 300) throw new Error(bodyMessage(body) || `${fallback} (HTTP ${res?.status})`);
  if (body && typeof body === "object") {
    // Only isSuccess is trusted: the API sends `status: false` on successful responses too.
    if (body.isSuccess === false) throw new Error(bodyMessage(body) || fallback);
    // activeInactive carries its own isSuccess inside data
    if (body.data && !Array.isArray(body.data) && body.data.isSuccess === false) throw new Error(body.data.message || body.message || fallback);
  }
  return { message: body?.message || "", data: body?.data };
}

async function request(send, fallback) {
  let res;
  try {
    res = await send();
  } catch (error) {
    // axios rejects on 4xx/5xx and network errors
    const status = error?.response?.status;
    const text = bodyMessage(error?.response?.data);
    // The global interceptor (utils/axios.jsx) already toasted the raw 400 body;
    // drop that toast, the page shows the readable message instead.
    if (error?.handled) toast.dismiss("validation-error");
    if (status === 401) throw new Error(text || "Your session has expired. Please sign in again.");
    if (status) throw new Error(text || `${fallback} (HTTP ${status})`);
    throw new Error(`${fallback}: ${error?.message || "the server could not be reached"}`);
  }
  return unwrap(res, fallback);
}

const RULE_API_KEY_SET = { entityID: 1, exportAuthorizeAddressID: 1, orderTypeID: 1, customerCode: 1, shipID: 1, billID: 1 };

export const workflowApi = {
  getDetails: () => request(() => api.get(WORKFLOW_ENDPOINTS.details), "Could not load the workflow details"),

  getWorkflows: () => request(() => api.get(WORKFLOW_ENDPOINTS.list), "Could not load the workflows"),

  // Save type 1
  create: (body) => request(() => api.post(WORKFLOW_ENDPOINTS.create, body), "Could not create the workflow"),

  // Save type 2. A row with statusCode >= 400 counts as a failure even when the
  // call as a whole succeeded.
  insertStatus: async (body) => {
    const result = await request(() => api.post(WORKFLOW_ENDPOINTS.insertStatus, body), "Could not add the steps");
    const rows = Array.isArray(result.data) ? result.data : [];
    const failed = rows.filter((r) => Number(r.statusCode) >= 400);
    if (failed.length) throw new Error(failed.map((r) => `${r.statusName || "Step"}: ${r.message || "not added"}`).join("; "));
    return { ...result, data: rows };
  },

  // Save type 3
  setStatusActive: (body) =>
    request(() => api.patch(WORKFLOW_ENDPOINTS.activeInactive, body), `Could not ${body.isActive ? "activate" : "deactivate"} the step`),

  // Save type 3 (delete): same endpoint with isDeleted: true
  deleteStatus: (body) => request(() => api.patch(WORKFLOW_ENDPOINTS.activeInactive, body), "Could not delete the step"),

  // Save type 4
  reorder: (body) => request(() => api.put(WORKFLOW_ENDPOINTS.reorder, body), "Could not save the step order"),

  // Save type 5: header fields (name, start rules, whole-workflow on/off)
  modifyHeader: async (body) => {
    try {
      return await request(() => api.put(WORKFLOW_ENDPOINTS.modify, body), "Could not update the workflow");
    } catch (error) {
      // A rule set to Any goes out as 0; an API that still validates "ids > 0" refuses it.
      const sentZero = Object.entries(body).some(([k, v]) => k in RULE_API_KEY_SET && v === 0);
      if (sentZero && /greater than zero/i.test(error.message))
        throw new Error(`${error.message} The page sent 0 for a rule set to Any; modify-workflow-configuration must accept 0 as "Any" (clear the rule).`);
      throw error;
    }
  },

  // Delete = modify with isDelete
  remove: (ruleHeaderID) => request(() => api.put(WORKFLOW_ENDPOINTS.modify, { ruleHeaderID, isDelete: true }), "Could not delete the workflow"),
};
