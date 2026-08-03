import { useAuth } from "../contexts/AuthContext";

export const ADMIN_ROLES = ["super_admin", "admin", "organization"];

export const isAdminRole = (role) => ADMIN_ROLES.includes(role?.toLowerCase());

const getPermissions = (user) => {
  const perms = user?.staff_permissions;
  return Array.isArray(perms) ? perms : [];
};

// View-level access: grant access when the user has the legacy bare module key
// ("staff"), the view action ("staff.view_staff"), or any action under the
// module ("staff.manage_staff"). An empty permission list grants nothing.
export const canViewModule = (user, moduleKey) => {
  if (isAdminRole(user?.role)) return true;
  const perms = getPermissions(user);
  return perms.some((p) => p === moduleKey || p.startsWith(`${moduleKey}.`));
};

// Action-level access (create/edit/delete/export): requires the specific
// "<module>.<action>" permission, or the legacy bare module key. An empty
// permission list grants nothing.
export const canPerformAction = (user, moduleKey, action) => {
  if (isAdminRole(user?.role)) return true;
  const perms = getPermissions(user);
  const full = `${moduleKey}.${action}`;
  return perms.some((p) => p === full || p === moduleKey);
};

export const usePermissions = () => {
  const { user } = useAuth();
  const isAdmin = isAdminRole(user?.role);
  return {
    user,
    isAdmin,
    canView: (moduleKey) => canViewModule(user, moduleKey),
    canPerform: (moduleKey, action) => canPerformAction(user, moduleKey, action),
  };
};

export default usePermissions;
