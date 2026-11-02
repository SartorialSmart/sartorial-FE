import { useAuth } from "../contexts/AuthContext";

export const ADMIN_ROLES = ["super_admin", "admin", "organization"];

export const isAdminRole = (role) => ADMIN_ROLES.includes(role?.toLowerCase());

const getPermissions = (user) => {
  const perms = user?.staff_permissions;
  return Array.isArray(perms) ? perms : [];
};

// View-level access: grant access when the user has the legacy bare module key
// ("staff"), the view action ("staff.view") from the RBAC catalog, or any
// action under the module ("staff.manage", "orders.create", etc.). An empty
// permission list grants nothing. Unknown/empty moduleKey is denied.
export const canViewModule = (user, moduleKey) => {
  if (!moduleKey) return false;
  if (isAdminRole(user?.role)) return true;
  const perms = getPermissions(user);
  if (perms.length === 0) return false;
  return perms.some((p) => p === moduleKey || p.startsWith(`${moduleKey}.`));
};

// Action-level access (create/edit/delete/manage etc.): requires the specific
// "<module>.<action>" permission, or the legacy bare module key. The catalog
// defines per-module actions, e.g. orders:{view,create,edit,delete},
// expenses:{view,create,edit,delete}, production:{view,create,edit,delete,
// manage_production}. An empty permission list grants nothing.
export const canPerformAction = (user, moduleKey, action) => {
  if (!moduleKey || !action) return false;
  if (isAdminRole(user?.role)) return true;
  const perms = getPermissions(user);
  if (perms.length === 0) return false;
  const full = `${moduleKey}.${action}`;
  return perms.some((p) => p === full || p === moduleKey);
};

// Convenience: true if the user holds *any* of the listed actions on the
// module (or the bare module key). Useful for "can manage orders" checks
// where the catalog has no single `manage` action — e.g. orders needs
// create OR edit OR delete to be considered a manager.
export const canPerformAny = (user, moduleKey, actions) => {
  if (!moduleKey || !Array.isArray(actions) || actions.length === 0) return false;
  if (isAdminRole(user?.role)) return true;
  const perms = getPermissions(user);
  if (perms.length === 0) return false;
  if (perms.includes(moduleKey)) return true;
  const wanted = new Set(actions.map((a) => `${moduleKey}.${a}`));
  return perms.some((p) => wanted.has(p));
};

export const usePermissions = () => {
  const { user } = useAuth();
  const isAdmin = isAdminRole(user?.role);
  return {
    user,
    isAdmin,
    canView: (moduleKey) => canViewModule(user, moduleKey),
    canPerform: (moduleKey, action) => canPerformAction(user, moduleKey, action),
    canPerformAny: (moduleKey, actions) => canPerformAny(user, moduleKey, actions),
  };
};

export default usePermissions;
