import { apiGet, apiPut } from "../../../utils/serviceHelper";
import { API } from "../../api/apiEndpoints";

// Fallback catalog used when /users/permissions-catalog/ is unavailable
// (e.g. a local backend that predates the endpoint). Keys match the
// `${module}.${action}` format the backend stores.
const FALLBACK_PERMISSION_CATALOG = [
  { module: "clients", actions: ["view_clients", "manage_clients"] },
  { module: "orders", actions: ["view_orders", "manage_orders"] },
  { module: "staff", actions: ["view_staff", "manage_staff", "manage_permissions"] },
  { module: "reports", actions: ["view_reports", "export_reports"] },
  { module: "expenses", actions: ["view_expenses", "manage_expenses"] },
  { module: "inventory", actions: ["view_inventory", "manage_inventory"] },
  { module: "subscriptions", actions: ["view_subscriptions", "manage_subscriptions"] },
  { module: "settings", actions: ["view_settings", "manage_settings"] },
  { module: "notifications", actions: ["view_notifications"] },
  { module: "qa_checklist", actions: ["manage_qa_checklist"] },
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
