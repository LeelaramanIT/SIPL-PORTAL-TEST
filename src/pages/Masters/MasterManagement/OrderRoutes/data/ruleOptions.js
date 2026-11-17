// Start Rules: one value per field, matching POST WorkFlow/create-workflow
// (entityID, exportAuthorizeAddressID, orderTypeID, customerCode, shipID, billID).
// null means "any" and is sent as 0.
//
// All option lists (and the status master) come from one call:
// GET WorkFlow/workflow-details — see mapWorkflowDetails below.

export const emptyRules = () => ({
  entityId: null,
  exportAddressId: null,
  orderTypeId: null,
  customerId: null,
  shipId: null,
  billId: null,
});

// Empty lists until GET WorkFlow/workflow-details has loaded.
export const EMPTY_RULE_OPTIONS = {
  entities: [],
  exportAddresses: [],
  orderTypes: [],
  customers: [],
  shipAddresses: [],
  billAddresses: [],
};

const joinParts = (...parts) =>
  parts
    .map((p) => (typeof p === "string" ? p.trim() : p))
    .filter(Boolean)
    .join(", ");

// First value that is set, as a number; null when none is.
const num = (...vals) => {
  const v = vals.find((x) => x !== undefined && x !== null && x !== "");
  return v === undefined ? null : Number(v);
};

// The API can send the same id twice (workflow-details returns duplicate
// customers); the first row wins, and rows without a valid id are dropped.
const uniqueById = (list) => {
  const seen = new Set();
  return list.filter((x) => Number.isFinite(x.id) && x.id > 0 && !seen.has(x.id) && seen.add(x.id));
};

// Maps `data` of GET WorkFlow/workflow-details →
//   { entities, exportAddresses, orderTypes, customers, shipAddresses, billAddresses }
//
//   legalEntities:        { legalEntityId, entityCode, legalName, shortName }
//   legalEntityAddresses: { legalEntityAddressId, addressName, address }
//   orderTypes:           { orderTypeID, orderTypeName }
//   customers:            { customerID, custCode, custFullName }
//   shipAddresses:        empty so far; read defensively (id, customer id,
//                         name, linked bill id, addressType 2 = bill).
//
// An address carries its entity / customer id when the API sends one. Without
// it, the address is offered whichever entity / customer is picked.
export function mapWorkflowDetails(data = {}) {
  const entities = (data.legalEntities || []).map((e) => ({
    id: Number(e.legalEntityId),
    code: e.shortName || e.entityCode || "",
    name: e.legalName || "",
    meta: e.entityCode || "",
  }));

  const exportAddresses = (data.legalEntityAddresses || []).map((a) => {
    const id = Number(a.legalEntityAddressId ?? a.id);
    return {
      id,
      label: joinParts(a.addressName, a.address) || `Address ${id}`,
      entityId: num(a.legalEntityId, a.legalEntityID, a.entityId),
    };
  });

  const orderTypes = (data.orderTypes || []).map((t) => ({
    id: Number(t.orderTypeID ?? t.id),
    name: t.orderTypeName || t.name || "",
  }));

  const customers = (data.customers || []).map((c) => ({
    id: Number(c.customerID ?? c.custID),
    code: c.custCode ?? c.customerCode ?? "",
    name: c.custFullName || c.customerName || "",
  }));

  // ShipAddressDto is { shipID, companyName } (sp_List_Workflow_Details); other
  // names are read in case the list grows. There is no bill-to list yet: a
  // row flagged addressType 2 / "BILL_TO" goes to billAddresses.
  const addresses = (data.shipAddresses || []).map((a) => {
    const id = Number(a.shipID ?? a.shipId ?? a.shipAddressId ?? a.shipAddressID ?? a.addressId ?? a.id);
    return {
      id,
      label: joinParts(a.companyName, a.addressName, a.address, a.city, a.stateName, a.country) || `Address ${id}`,
      customerId: num(a.customerID, a.customerId, a.custID),
      billId: num(a.billID, a.billId, a.billAddressId),
      isBill: Number(a.addressType) === 2 || a.addressType === "BILL_TO",
    };
  });
  const billRows = (data.billAddresses || []).map((a) => {
    const id = Number(a.billID ?? a.billId ?? a.id);
    return { id, label: joinParts(a.companyName, a.addressName, a.address) || `Address ${id}`, customerId: num(a.customerID, a.customerId, a.custID), isBill: true };
  });

  return {
    entities: uniqueById(entities),
    exportAddresses: uniqueById(exportAddresses),
    orderTypes: uniqueById(orderTypes),
    customers: uniqueById(customers),
    shipAddresses: uniqueById(addresses.filter((a) => !a.isBill)),
    billAddresses: uniqueById([...billRows, ...addresses.filter((a) => a.isBill)]),
  };
}

// Addresses that apply to the chosen entity / customer. An address without an
// owner id is offered for all.
const ownedBy = (list, key, ownerId) => (list || []).filter((a) => a[key] == null || ownerId == null || a[key] === ownerId);
export const exportAddressesFor = (options, entityId) => ownedBy(options.exportAddresses, "entityId", entityId);
export const shipAddressesFor = (options, customerId) => ownedBy(options.shipAddresses, "customerId", customerId);
export const billAddressesFor = (options, customerId) => ownedBy(options.billAddresses, "customerId", customerId);

// Name the server sent for a saved rule (route.ruleNames from
// workflow-rule-status), only while the rule still has that id.
export const savedRuleName = (ruleNames, field, id) => {
  const n = ruleNames?.[field];
  return n && id != null && n.id === id && n.name ? n.name : "";
};

// Readable label for one rule value: the loaded option first, then the name
// the server sent with the route, then the id.
export function ruleLabel(field, id, options, ruleNames) {
  if (id == null) return "";
  const find = (list) => (list || []).find((x) => x.id === id);
  let fromList = "";
  if (field === "entityId") {
    const e = find(options.entities);
    fromList = e ? e.code || e.name : "";
  } else if (field === "customerId") {
    const c = find(options.customers);
    fromList = c ? `${c.name}${c.code ? ` (${c.code})` : ""}` : "";
  } else if (field === "orderTypeId") fromList = find(options.orderTypes)?.name || "";
  else if (field === "exportAddressId") fromList = find(options.exportAddresses)?.label || "";
  else if (field === "shipId") fromList = find(options.shipAddresses)?.label || "";
  else if (field === "billId") fromList = find(options.billAddresses)?.label || "";
  return fromList || savedRuleName(ruleNames, field, id) || `#${id}`;
}

const RULE_TOKENS = [
  ["entityId", "entity", "Entity is"],
  ["exportAddressId", "exportAddress", "Export address is"],
  ["orderTypeId", "orderType", "Order type is"],
  ["customerId", "customer", "Customer is"],
  ["shipId", "ship", "Ship-to is"],
  ["billId", "bill", "Bill-to is"],
];

// Readable labels for the current rule values (for the Start card).
export function describeRules(rules, options, ruleNames) {
  return RULE_TOKENS.filter(([field]) => rules[field] != null).map(([field, key, label]) => ({
    key,
    label,
    value: ruleLabel(field, rules[field], options, ruleNames),
  }));
}
