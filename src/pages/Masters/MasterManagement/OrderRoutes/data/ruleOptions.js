// Start Rules: one value per field, matching POST WorkFlow/create-workflow
// (entityID, exportAuthorizeAddressID, orderTypeID, customerCode, shipID, billID).
// null means "any" and is sent as 0.
//
// Entities and customers (with their addresses) come from the same API the
// Order Entry screen uses: GET /OrderProcess/customer-master.

export const emptyRules = () => ({
  entityId: null,
  exportAddressId: null,
  orderTypeId: null,
  customerId: null,
  shipId: null,
  billId: null,
});

// Order Entry has no order-type master; its save sends orderTypeID with 1 as
// the default. These ids follow the order of ORDER_TYPES in SaleOrderEntry.jsx.
// TODO: confirm the ids with the backend (or replace with an order-type API).
export const ORDER_TYPE_OPTIONS = [
  { id: 1, name: "Standard Sales Order" },
  { id: 2, name: "Sales Agreement" },
  { id: 3, name: "Make-to-Stock" },
  { id: 4, name: "Trial / Sample" },
  { id: 5, name: "Inter-Plant Transfer" },
];

const joinParts = (...parts) => parts.filter(Boolean).join(", ");

// Maps GET /OrderProcess/customer-master → { entities, customers }.
// Entity:   { entityID, entityCode, entityName, countryCode, addresses: [{ id, addressType, exporterAddressFormatted }] }
// Customer: { custID, customerCode, customerName, addresses: [{ id, addressType (1 ship / 2 bill), addressName, city, country, billID }] }
export function mapCustomerMaster(data = {}) {
  const entities = (data.companyEntities || []).map((e) => ({
    id: Number(e.entityID),
    code: e.entityCode || e.entityShortName || "",
    name: e.entityName || "",
    meta: e.countryCode || "",
    addresses: (e.addresses || []).map((a) => ({
      id: Number(a.id),
      label: a.exporterAddressFormatted || joinParts(a.addressName, a.city, a.country) || `Address ${a.id}`,
      type: a.addressType ?? "",
    })),
  }));

  const customers = (data.customers || []).map((c) => {
    const addresses = c.addresses || [];
    const isBill = (a) => Number(a.addressType) === 2 || a.addressType === "BILL_TO";
    const label = (a) => joinParts(a.addressName, a.city, a.stateName, a.country) || `Address ${a.id}`;
    return {
      id: Number(c.custID),
      code: c.customerCode ?? c.custID,
      name: c.customerName || "",
      ship: addresses.filter((a) => !isBill(a)).map((a) => ({ id: Number(a.id), label: label(a), billId: a.billID ?? null })),
      bill: addresses.filter(isBill).map((a) => ({ id: Number(a.id), label: label(a) })),
    };
  });

  return { entities, customers, orderTypes: ORDER_TYPE_OPTIONS };
}

// Used only when the customer-master API cannot be reached.
export const SAMPLE_RULE_OPTIONS = {
  entities: [
    { id: 1, code: "SIPL", name: "Sundaram Industries Private Limited", meta: "SI001 · India", addresses: [] },
    { id: 2, code: "SLTL", name: "Sundaram Lanka Tyres Limited", meta: "SL001 · Sri Lanka", addresses: [] },
    { id: 3, code: "SITL", name: "Sun Industrial Tyres Limited", meta: "SI002 · Sri Lanka", addresses: [] },
    { id: 4, code: "STA", name: "Sun TWS America", meta: "ST002 · America", addresses: [] },
  ],
  customers: [],
  orderTypes: ORDER_TYPE_OPTIONS,
};

// Readable labels for the current rule values (for the Start card).
export function describeRules(rules, options) {
  const entity = options.entities.find((e) => e.id === rules.entityId);
  const customer = options.customers.find((c) => c.id === rules.customerId);
  const out = [];
  if (rules.entityId != null) out.push({ key: "entity", label: "Entity is", value: entity ? entity.code || entity.name : `#${rules.entityId}` });
  if (rules.exportAddressId != null) {
    const a = entity?.addresses.find((x) => x.id === rules.exportAddressId);
    out.push({ key: "exportAddress", label: "Export address is", value: a ? a.label : `#${rules.exportAddressId}` });
  }
  if (rules.orderTypeId != null) {
    const t = options.orderTypes.find((x) => x.id === rules.orderTypeId);
    out.push({ key: "orderType", label: "Order type is", value: t ? t.name : `#${rules.orderTypeId}` });
  }
  if (rules.customerId != null) out.push({ key: "customer", label: "Customer is", value: customer ? customer.name : `#${rules.customerId}` });
  if (rules.shipId != null) {
    const a = customer?.ship.find((x) => x.id === rules.shipId);
    out.push({ key: "ship", label: "Ship-to is", value: a ? a.label : `#${rules.shipId}` });
  }
  if (rules.billId != null) {
    const a = customer?.bill.find((x) => x.id === rules.billId);
    out.push({ key: "bill", label: "Bill-to is", value: a ? a.label : `#${rules.billId}` });
  }
  return out;
}
