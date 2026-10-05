// Shared, pure helpers used by both the manual creation flow and the Excel
// bulk-upload flow, so there is exactly one duplicate-detection and one
// tyre/assembly/rim normalization implementation — not two parallel copies.

export const norm = (v) => String(v ?? "").trim().toLowerCase();

// Normalizes /OrderProcess/customer-LineItems/{custId} response data (tyre +
// assemblyTyre + rim) into the flat "process master" row shape the spec
// dropdowns, Process ID resolution, and item-code/description lookups all
// key off. Same shape/keys the component's own `customerProcessMaster`
// builds, extracted here so the bulk-import validator can build the same
// thing for *other* customers without duplicating the normalize logic.
export const buildProcessMaster = (lineItems) => {
  const normalize = (item, pid, itemType) => ({
    category: item.category || "",
    platform: item.config || "",
    tyreSize: item.tyreSize || "",
    rimSize: item.tyreRim || "",
    tyreType: item.tyreType || "",
    brand: item.brand || "",
    sideWall: item.sidewall || "",
    directional: item.directional || "",
    piDetails: item.piD_Details || "",
    processId: pid || "",
    itemType,
  });
  const tyres = (lineItems?.tyre || []).map((item) => normalize(item, item.processID, "tyre"));
  const assemblies = (lineItems?.assemblyTyre || []).map((item) => normalize(item, item.assY_PID, "assembly"));
  const rims = (lineItems?.rim || []).map((item) => normalize(item, item.edcno, "rim"));
  return [...tyres, ...assemblies, ...rims].filter((row) => row.processId);
};

// The uniqueness rule for "does this mapping already exist", for the same
// customer + same ship address: either the item code is already mapped
// there, OR the Customer Item Code is already used there (for any item) —
// a Customer Item Code must be a 1:1 alias for one item at a given ship
// address, so reusing it for a second, different item at the same ship
// address is a duplicate too, even if the item codes differ.
// itemType is deliberately excluded from the item-code branch — see the
// call site in CustomerProcessIDMapping.jsx for why (itemCode is already
// type-distinguishing in this system, and an existing record's itemType is
// only ever known via a fallible cross-ref).
export const isDuplicateMapping = (existingRecords, { customerCode, shipid, itemCode, customerItemCode }) =>
  (existingRecords || []).some((m) => {
    if (norm(m.customerCode) !== norm(customerCode) || Number(m.shipid) !== Number(shipid)) return false;
    if (itemCode && norm(m.ourProcessId ?? m.itemCode) === norm(itemCode)) return true;
    if (customerItemCode && norm(m.customerProcessId ?? m.customerItemCode) === norm(customerItemCode)) return true;
    return false;
  });
