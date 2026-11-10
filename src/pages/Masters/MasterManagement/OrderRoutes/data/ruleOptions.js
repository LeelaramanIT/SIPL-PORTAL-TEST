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

// Fallback only, used if workflow-details returns no orderTypes.
export const ORDER_TYPE_OPTIONS = [
  { id: 1, name: "Standard Sales Order" },
  { id: 2, name: "Sales Agreement" },
  { id: 3, name: "Make-to-Stock" },
  { id: 4, name: "Trial / Sample" },
  { id: 5, name: "Inter-Plant Transfer" },
];

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

  const addresses = (data.shipAddresses || []).map((a) => {
    const id = Number(a.shipAddressId ?? a.shipAddressID ?? a.addressId ?? a.id);
    return {
      id,
      label: joinParts(a.addressName, a.address, a.city, a.stateName, a.country) || `Address ${id}`,
      customerId: num(a.customerID, a.customerId, a.custID),
      billId: num(a.billID, a.billId, a.billAddressId),
      isBill: Number(a.addressType) === 2 || a.addressType === "BILL_TO",
    };
  });

  return {
    entities,
    exportAddresses,
    orderTypes: orderTypes.length ? orderTypes : ORDER_TYPE_OPTIONS,
    customers,
    shipAddresses: addresses.filter((a) => !a.isBill),
    billAddresses: addresses.filter((a) => a.isBill),
  };
}

// Addresses that apply to the chosen entity / customer. An address without an
// owner id is offered for all.
const ownedBy = (list, key, ownerId) => (list || []).filter((a) => a[key] == null || ownerId == null || a[key] === ownerId);
export const exportAddressesFor = (options, entityId) => ownedBy(options.exportAddresses, "entityId", entityId);
export const shipAddressesFor = (options, customerId) => ownedBy(options.shipAddresses, "customerId", customerId);
export const billAddressesFor = (options, customerId) => ownedBy(options.billAddresses, "customerId", customerId);

// Used only when workflow-details cannot be reached.
export const SAMPLE_RULE_OPTIONS = {
  entities: [
    { id: 1, code: "SIPL", name: "SUNDARAM INDUSTRIES PRIVATE LIMITED", meta: "SI001" },
    { id: 2, code: "SLTL", name: "SUNDARAM LANKA TYRES LIMITED", meta: "SL001" },
    { id: 3, code: "SITL", name: "SUN INDUSTRIAL TYRES LIMITED", meta: "SI002" },
    { id: 4, code: "STA", name: "SUN TWS AMERICA", meta: "ST002" },
  ],
  exportAddresses: [],
  orderTypes: ORDER_TYPE_OPTIONS,
  customers: [],
  shipAddresses: [],
  billAddresses: [],
};

// Readable labels for the current rule values (for the Start card).
export function describeRules(rules, options) {
  const find = (list, id) => (list || []).find((x) => x.id === id);
  const entity = find(options.entities, rules.entityId);
  const customer = find(options.customers, rules.customerId);
  const out = [];
  if (rules.entityId != null) out.push({ key: "entity", label: "Entity is", value: entity ? entity.code || entity.name : `#${rules.entityId}` });
  if (rules.exportAddressId != null) {
    const a = find(options.exportAddresses, rules.exportAddressId);
    out.push({ key: "exportAddress", label: "Export address is", value: a ? a.label : `#${rules.exportAddressId}` });
  }
  if (rules.orderTypeId != null) {
    const t = find(options.orderTypes, rules.orderTypeId);
    out.push({ key: "orderType", label: "Order type is", value: t ? t.name : `#${rules.orderTypeId}` });
  }
  if (rules.customerId != null)
    out.push({
      key: "customer",
      label: "Customer is",
      value: customer ? `${customer.name}${customer.code ? ` (${customer.code})` : ""}` : `#${rules.customerId}`,
    });
  if (rules.shipId != null) {
    const a = find(options.shipAddresses, rules.shipId);
    out.push({ key: "ship", label: "Ship-to is", value: a ? a.label : `#${rules.shipId}` });
  }
  if (rules.billId != null) {
    const a = find(options.billAddresses, rules.billId);
    out.push({ key: "bill", label: "Bill-to is", value: a ? a.label : `#${rules.billId}` });
  }
  return out;
}
