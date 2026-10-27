import { apiGet, apiPut } from "../../../utils/serviceHelper";
import { API } from "../../api/apiEndpoints";

// Fallback catalog used when /users/permissions-catalog/ is unavailable.
//
// This MUST mirror PERMISSION_CATALOG in the backend's common/rbac.py: the
// server rejects anything outside it with "Unknown permissions". The previous
// list used a different naming scheme entirely (`staff.manage_staff` where the
// backend defines `staff.manage`) and invented modules that do not exist, so
// 20 of its 21 keys were rejected — every permission chosen while the endpoint
// was down failed to save.
const FALLBACK_PERMISSION_CATALOG = [
  { module: "clients", actions: ["view", "create", "edit", "delete"] },
  { module: "orders", actions: ["view", "create", "edit", "delete"] },
  { module: "inventory", actions: ["view", "create", "edit", "delete"] },
  { module: "expenses", actions: ["view", "create", "edit", "delete"] },
  { module: "vendors", actions: ["view", "create", "edit", "delete"] },
  { module: "reports", actions: ["view"] },
  { module: "staff", actions: ["view", "manage"] },
  { module: "payroll", actions: ["view", "manage"] },
  { module: "qa_checklist", actions: ["view", "edit"] },
  { module: "billing", actions: ["view", "manage"] },
  { module: "settings", actions: ["view", "manage"] },
  { module: "production", actions: ["view", "create", "edit", "delete", "manage_production"] },
];

const StaffPermissionsService = {
  // The RBAC permission catalog (modules -> actions) used to build the UI.
  getPermissionsCatalog: () => apiGet(API.STAFF_MANAGEMENT.PERMISSIONS_CATALOG),

  // Same as above but always resolves to an array, falling back to a local
  // catalog when the endpoint is unavailable.
  getPermissionCatalog: async () => {
    try {
      const data = await StaffPermissionsService.getPermissionsCatalog();
      const list = data?.catalog || data || [];
      return Array.isArray(list) && list.length > 0
        ? list
        : FALLBACK_PERMISSION_CATALOG;
    } catch {
      return FALLBACK_PERMISSION_CATALOG;
    }
  },

  getStaffPermissions: (staffId) => apiGet(API.STAFF_MANAGEMENT.PERMISSIONS(staffId)),

  updateStaffPermissions: (staffId, permissions) =>
    apiPut(API.STAFF_MANAGEMENT.PERMISSIONS(staffId), { permissions }),
};

export default StaffPermissionsService;
