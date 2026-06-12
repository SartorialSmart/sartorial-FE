import { apiGet, apiPut } from "../../../utils/serviceHelper";

const StaffPermissionsService = {
  getStaffPermissions: (staffId) =>
    apiGet(`/users/staff-permissions/${staffId}/`),

  updateStaffPermissions: (staffId, permissions) =>
    apiPut(`/users/staff-permissions/${staffId}/`, { permissions }),
};

export default StaffPermissionsService;
