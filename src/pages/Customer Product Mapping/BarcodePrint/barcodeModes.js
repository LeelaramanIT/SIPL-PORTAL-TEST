import { hasExactAccess, isAdminUser } from "../../../utils/menuAccess";

// Base URL of the Barcode Print screen. Each mode lives one level below it and
// its full path doubles as the menu permission (menuUrl) in the menu master.
export const BARCODE_PRINT_BASE = "/customer-item-management/barcode-print";

// Order here is the redirect priority for the bare /barcode-print URL.
export const BARCODE_MODES = [
  { key: "bulk", label: "Bulk", segment: "bulk" },
  { key: "input", label: "Quick Scan", segment: "quick-scan" },
  { key: "labelling", label: "Labelling", segment: "labelling" },
].map((m) => ({ ...m, path: `${BARCODE_PRINT_BASE}/${m.segment}` }));

export const getModeByKey = (key) => BARCODE_MODES.find((m) => m.key === key);

// Modes the user may open. Admin (role admin + RoleID 1) sees all of them.
export const getAllowedModes = (auth) => {
  if (isAdminUser(auth)) return BARCODE_MODES;
  const permissions = (auth?.Menus || []).map((m) => m.menuUrl);
  return BARCODE_MODES.filter((m) => hasExactAccess(permissions, m.path));
};
