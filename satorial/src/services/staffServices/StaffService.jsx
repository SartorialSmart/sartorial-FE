import { apiGet, apiPost, apiPut, apiDelete } from "../../../utils/serviceHelper";
import { API } from "../../api/apiEndpoints";

const StaffService = {
  // List all staff members
  listStaff: (params = {}) => {
    const config = Object.keys(params).length ? { params } : {};
    return apiGet(API.STAFF_MANAGEMENT.STAFF.LIST, config);
  },

  // Get single staff detail
  getStaffDetail: (slug) => apiGet(API.STAFF_MANAGEMENT.STAFF.DETAIL(slug)),

  addStaff: (staffData) => {
    const formData = new FormData();

    // Append each field to FormData with the correct field names
    Object.keys(staffData).forEach((key) => {
      // Skip null or undefined values
      if (staffData[key] != null) {
        // Handle file objects separately
        if (key === "avatar" && staffData[key] instanceof File) {
          formData.append(key, staffData[key]);
        } else {
          // Convert non-string values to string
          formData.append(key, String(staffData[key]));
        }
      }
    });

    return apiPost(API.STAFF_MANAGEMENT.STAFF.ADD, formData);
  },

  updateStaff: (slug, updatedData) => {
    return apiPut(API.STAFF_MANAGEMENT.STAFF.UPDATE(slug), updatedData);
  },

  deleteStaff: (slug) => apiDelete(API.STAFF_MANAGEMENT.STAFF.DELETE(slug)),

  // Update staff salary
  updateSalary: (payload) =>
    apiPost(API.STAFF_MANAGEMENT.SALARY.UPDATE, payload),

  // Invite a member by email + role + permissions (they set up their own account).
  inviteStaff: (payload) => apiPost(API.STAFF_MANAGEMENT.STAFF.INVITE, payload),

  // Turn an existing staff *record* into a user of the system. Takes a plan seat
  // and emails them an invite to finish their profile and set a password.
  grantLoginAccess: (staffId, payload) =>
    apiPost(API.STAFF_MANAGEMENT.STAFF.GRANT_LOGIN(staffId), payload),

  // Remove someone's sign-in without removing them from the business.
  revokeLoginAccess: (staffId) =>
    apiPost(API.STAFF_MANAGEMENT.STAFF.REVOKE_LOGIN(staffId), {}),

  // Resend an invite to a not-yet-activated member.
  resendInvite: (staffId) =>
    apiPost(API.STAFF_MANAGEMENT.STAFF.RESEND_INVITE, { staff_id: staffId }),

  // Public: the invitee sets their password + details to activate their account.
  acceptInvite: (payload) => apiPost(API.USER_MANAGEMENT.AUTH.ACCEPT_INVITE, payload),
};

export default StaffService;
