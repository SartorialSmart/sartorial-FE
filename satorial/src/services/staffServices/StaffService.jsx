import { apiGet, apiPost, apiPut, apiDelete } from "../../../utils/serviceHelper";
import { API } from "../../api/apiEndpoints";

const StaffService = {
  // List all staff members
  listStaff: () => apiGet(API.STAFF_MANAGEMENT.STAFF.LIST),

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

    return apiPost(API.STAFF_MANAGEMENT.STAFF.ADD, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updateStaff: (slug, updatedData, isFormData = false) => {
    const config = isFormData
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : {};
    return apiPut(API.STAFF_MANAGEMENT.STAFF.UPDATE(slug), updatedData, config);
  },

  deleteStaff: (slug) => apiDelete(API.STAFF_MANAGEMENT.STAFF.DELETE(slug)),

  // Update staff salary
  updateSalary: (payload) =>
    apiPost(API.STAFF_MANAGEMENT.SALARY.UPDATE, payload),
};

export default StaffService;
