// Shared permission-checking helpers so SideBar, InnerSidebar-based layouts,
// and ad-hoc menu/tab bars all resolve access the same way.
//
// Not wired into anything yet — importing this file has no effect on its own.

// A user has access to `key` if they hold that exact permission, or a
// permission nested under it (e.g. permission "/Reports/Sale/Detail" grants
// access to a parent menu keyed "/Reports/Sale").
export const hasAccess = (permissions = [], key) =>
  permissions.some((perm) => perm === key || perm.startsWith(`${key}/`));

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
