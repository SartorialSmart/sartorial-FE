import { apiGet, apiPost, apiPut, apiDelete } from "../../../utils/serviceHelper";
import { API } from "../../api/apiEndpoints";

const StaffRoleService = {
  listRoles: () => apiGet(API.STAFF_MANAGEMENT.ROLES.LIST),

  getRole: (roleId) => apiGet(API.STAFF_MANAGEMENT.ROLES.DETAIL(roleId)),

  addRole: (roleData) => apiPost(API.STAFF_MANAGEMENT.ROLES.LIST, roleData),

  updateRole: (roleId, roleData) =>
    apiPut(API.STAFF_MANAGEMENT.ROLES.DETAIL(roleId), roleData),

  deleteRole: (roleId) =>
    apiDelete(API.STAFF_MANAGEMENT.ROLES.DETAIL(roleId)),
};

export default StaffRoleService;
