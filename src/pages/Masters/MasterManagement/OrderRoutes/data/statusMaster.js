// Order status master (TypeID 1 = Sales Order, TypeID 2 = Inward).
// SAMPLE_STATUSES is used until the status API is connected — see
// ORDER_ROUTE_ENDPOINTS.masters in OrderRoutesSlice.

export const STATUS_TYPES = { 1: "Sales Order", 2: "Inward" };

// Display order of the stage groups on the timeline and in the library.
export const CATEGORY_ORDER = [
  "Order",
  "Proforma",
  "Production",
  "Stencil & PDI",
  "Invoice & Payment",
  "Dispatch & Shipping",
  "Revisions",
  "Cancellation",
  "Inward",
];

// Groups a status into a stage from keywords in its text. Statuses added to
// the master later fall into a group automatically; anything unmatched lands
// in "Order".
export function categorizeStatus(text, typeId) {
  if (Number(typeId) === 2) return "Inward";
  const t = String(text || "").toUpperCase();
  const has = (...words) => words.some((w) => t.includes(w));
  if (has("CANCEL")) return "Cancellation";
  if (t.startsWith("REQUEST FOR") || has("REVISION", "CHANGES", "RE-PREPARE", "SUBSTITUTION")) return "Revisions";
  if (has("STENCIL", "PDI")) return "Stencil & PDI";
  if (has("PROFORMA", "DRAFT PI")) return "Proforma";
  if (has("INVOICE", "PAYMENT", "TCS")) return "Invoice & Payment";
  if (has("PRODUCTION", "PPC", "WORK ORDER", "SCHEDULE", "APPROVAL")) return "Production";
  if (has("DISPATCH", "VEHICLE", "SAILING", "CONTAINER", "DOCUMENT", "SHIPPING", "LOADING")) return "Dispatch & Shipping";
  return "Order";
}

const ACRONYMS = new Set(["PDI", "CRM", "PPC", "TCS", "GST", "RFD", "DC", "PI"]);

// "WAITING FOR PPC RFD" -> "Waiting For PPC RFD"
export const prettyStatus = (text) =>
  String(text || "")
    .split(" ")
    .map((w) =>
      ACRONYMS.has(w)
        ? w
        : w
            .split("-")
            .map((p) => p.charAt(0) + p.slice(1).toLowerCase())
            .join("-"),
    )
    .join(" ");

// Accepts rows from the API in either casing (ID/StatusText/TypeID or
// id/statusText/typeId) as well as the [id, text, typeId] tuples below.
export function normalizeStatuses(rows = []) {
  return rows
    .map((r) =>
      Array.isArray(r)
        ? { id: r[0], text: r[1], typeId: r[2] }
        : {
            id: Number(r.id ?? r.ID ?? r.statusId ?? r.StatusID),
            text: String(r.statusText ?? r.StatusText ?? r.text ?? "").trim().toUpperCase(),
            typeId: Number(r.typeId ?? r.TypeID ?? r.typeID ?? 1),
          },
    )
    .filter((s) => s.id && s.text)
    .map((s) => ({ ...s, category: categorizeStatus(s.text, s.typeId) }));
}

const SAMPLE_ROWS = [
  [1, "ORDER RECEIVED", 1],
  [2, "PROFORMA GENERATED", 1],
  [3, "PROFORMA CONFIRMED", 1],
  [4, "MOVED TO PRODUCTION", 1],
  [5, "DISPATCHED", 1],
  [6, "CANCELLED", 1],
  [7, "WAITING FOR INVOICE PREPARE", 1],
  [8, "WAITING FOR PAYMENT CONFIRMATION", 1],
  [9, "WAITING FOR SHIPPING DOCUMENTS E-MAIL", 1],
  [10, "WAITING FOR DOCUMENT COURIER", 1],
  [11, "WAITING FOR PAYMENT RECEIVED", 1],
  [12, "WAITING FOR INVOICE RE-PREPARE", 1],
  [13, "WAITING FOR GST INVOICE PREPARE", 1],
  [14, "REQUEST FOR ORDER MASTER DETAILS REVISE", 1],
  [15, "REQUEST FOR ORDER ITEM DETAILS REVISE", 1],
  [16, "REQUEST FOR OTHER DETAILS REVISE", 1],
  [17, "WAITING FOR CRM REVISIONS", 1],
  [18, "REQUEST FOR ORDER CANCEL", 1],
  [19, "WAITING FOR PDI", 1],
  [20, "WAITING FOR VEHICLE LOADING", 1],
  [21, "WAITING FOR DISPATCH", 1],
  [22, "PROFORMA SENT", 1],
  [23, "WAITING FOR WORK ORDER PREPARE", 1],
  [24, "WAITING FOR PPC RFD", 1],
  [25, "WAITING FOR TENTATIVE SCHEDULE", 1],
  [26, "WAITING FOR ALL DEPT APPROVAL", 1],
  [27, "REQUEST FOR ORDER SPLIT", 1],
  [28, "REQUEST FOR PRICE CHANGE", 1],
  [29, "REQUEST FOR LOGISTICS REVISION", 1],
  [30, "REQUEST FOR PPC REVISION", 1],
  [31, "WAITING FOR LOGISTICS CHANGES", 1],
  [32, "WAITING FOR PPC CHANGES", 1],
  [33, "WAITING FOR SUBSTITUTION CONFIRMATION", 1],
  [34, "WAITING FOR CRM STENCIL ASSIGN", 1],
  [35, "WAITING FOR ASSIGNED STENCIL VERIFICATION", 1],
  [36, "WAITING FOR REVOKE THE STENCIL FROM ASSIGNED", 1],
  [37, "WAITING FOR REVOKE THE STENCIL FROM PDI REJECT", 1],
  [38, "WAITING FOR ACTUAL SAILING DETAILS", 1],
  [39, "WAITING FOR CONTAINER DELIVERED CONFIRMATION", 1],
  [40, "DISPATCHED TO FINAL LOADING", 1],
  [41, "WAITING FOR PPC STENCIL ASSIGN", 1],
  [42, "WAITING FOR APPROVAL TO PRODUCTION", 1],
  [43, "WAITING FOR TCS CONFIRMATION", 1],
  [44, "E-INVOICE CANCELLED", 1],
  [45, "WAITING FOR DRAFT PI PREPARE", 1],
  [46, "SCANNING IN PROGRESS", 2],
  [47, "PENDING DC PREPARATION", 2],
  [48, "PENDING RECEIPT", 2],
  [49, "RECEIVING IN PROGRESS", 2],
  [50, "INWARD COMPLETED", 2],
];

export const SAMPLE_STATUSES = normalizeStatuses(SAMPLE_ROWS);
