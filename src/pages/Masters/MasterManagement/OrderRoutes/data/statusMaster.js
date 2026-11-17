// Order status master and status types, both loaded from
// GET WorkFlow/workflow-details. Nothing here is hardcoded master data.
//
//   orderStatuses: { id, statusText, typeId? }
//   statusTypes:   { typeId, typeName }   (also read: orderStatusTypes, id/TypeID, name/TypeName)
//
// A status without a typeId is shown for every status type.

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
export function categorizeStatus(text) {
  const t = String(text || "").toUpperCase();
  const has = (...words) => words.some((w) => t.includes(w));
  if (has("INWARD", "RECEIPT", "RECEIVING", "SCANNING", "DC PREPARATION")) return "Inward";
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
// id/statusText/typeId). typeId stays null when the API does not send it.
export function normalizeStatuses(rows = []) {
  return rows
    .map((r) => {
      const id = Number(r.id ?? r.ID ?? r.statusId ?? r.StatusID);
      const type = r.typeId ?? r.TypeID ?? r.typeID ?? r.statusTypeId;
      const text = String(r.statusText ?? r.StatusText ?? r.text ?? "").trim().toUpperCase();
      return {
        id,
        text,
        typeId: type == null || type === "" ? null : Number(type),
        category: r.category || categorizeStatus(text),
      };
    })
    .filter((s) => s.id && s.text);
}

// Status types from the API, plus any typeId used by a status that the list
// does not name (shown as "Type N").
export function mapStatusTypes(data = {}, statuses = []) {
  const rows = data.statusTypes || data.orderStatusTypes || [];
  const types = rows
    .map((t) => ({
      id: Number(t.typeId ?? t.typeID ?? t.TypeID ?? t.id),
      name: String(t.typeName ?? t.TypeName ?? t.name ?? "").trim(),
    }))
    .filter((t) => t.id);
  statuses.forEach((s) => {
    if (s.typeId != null && !types.some((t) => t.id === s.typeId)) types.push({ id: s.typeId, name: "" });
  });
  return types.sort((a, b) => a.id - b.id);
}

// True when a status belongs to the given type. Either side unknown = match.
export const matchesType = (status, typeId) => status.typeId == null || typeId == null || status.typeId === typeId;

export const statusTypeLabel = (types, id) => {
  if (id == null) return "";
  const t = (types || []).find((x) => x.id === id);
  return t?.name || `Type ${id}`;
};
