import { apiGet, apiPut } from "../../../utils/serviceHelper";
import { API } from "../../api/apiEndpoints";

const StaffPermissionsService = {
  // The RBAC permission catalog (modules -> actions) used to build the UI.
  getPermissionsCatalog: () => apiGet(API.STAFF_MANAGEMENT.PERMISSIONS_CATALOG),

  getStaffPermissions: (staffId) => apiGet(API.STAFF_MANAGEMENT.PERMISSIONS(staffId)),

  updateStaffPermissions: (staffId, permissions) =>
    apiPut(API.STAFF_MANAGEMENT.PERMISSIONS(staffId), { permissions }),
};

export default StaffPermissionsService;
