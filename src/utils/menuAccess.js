// Shared permission-checking helpers so SideBar, InnerSidebar-based layouts,
// and ad-hoc menu/tab bars all resolve access the same way.
//
// Not wired into anything yet — importing this file has no effect on its own.

// A user has access to `key` if they hold that exact permission, or a
// permission nested under it (e.g. permission "/Reports/Sale/Detail" grants
// access to a parent menu keyed "/Reports/Sale").
export const hasAccess = (permissions = [], key) =>
  permissions.some((perm) => perm === key || perm.startsWith(`${key}/`));

const normalizePath = (p) => String(p ?? "").trim().replace(/\/+$/, "").toLowerCase();

// Exact permission match only (no parent/child inheritance) — for pages whose
// sub-URLs are granted individually.
export const hasExactAccess = (permissions = [], key) => {
  const target = normalizePath(key);
  return permissions.some((perm) => normalizePath(perm) === target);
};

// Same admin rule ProtectedRoutes uses: role "admin" and RoleID 1.
export const isAdminUser = (auth) =>
  String(auth?.roles || "").toLowerCase() === "admin" && Number(auth?.RoleID) === 1;

// Recursively filters an antd Menu `items` tree, keeping a parent only if it
// still has at least one allowed leaf/child after filtering.
export const filterMenuTree = (items, { permissions = [], isAdmin = false, alwaysAllowed = [] } = {}) => {
  if (isAdmin) return items;

  const allowed = [];
  for (const item of items) {
    if (item.children) {
      const children = filterMenuTree(item.children, { permissions, isAdmin, alwaysAllowed });
      if (children.length > 0) {
        allowed.push({ ...item, children });
      }
    } else if (alwaysAllowed.includes(item.key) || hasAccess(permissions, item.key)) {
      allowed.push(item);
    }
  }
  return allowed;
};
