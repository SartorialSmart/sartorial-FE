import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "../../utils/serviceHelper";
import { API } from "../api/apiEndpoints";

const multipartConfig = {
  headers: {
    "Accept": "application/json",
    "Content-Type": "multipart/form-data",
  },
};

const VendorService = {
  // Create a new vendor
  createVendor: (vendorData) =>
    apiPost(API.ORDER_MANAGEMENT.VENDORS.CREATE, vendorData, multipartConfig),

  // Fetch the list of all vendors
  getVendorsList: () => apiGet(API.ORDER_MANAGEMENT.VENDORS.LIST),

  // Fetch vendor details by ID
  getVendorDetails: (vendorId) =>
    apiGet(API.ORDER_MANAGEMENT.VENDORS.DETAIL(vendorId)),

  // Update vendor by ID
  updateVendor: (vendorId, vendorData) =>
    apiPut(API.ORDER_MANAGEMENT.VENDORS.DETAIL(vendorId), vendorData, multipartConfig),

  // Delete vendor by ID
  deleteVendor: (vendorId) =>
    apiDelete(API.ORDER_MANAGEMENT.VENDORS.DETAIL(vendorId)),

  // Partial update vendor by ID (PATCH)
  patchVendor: (vendorId, vendorData) =>
    apiPatch(API.ORDER_MANAGEMENT.VENDORS.DETAIL(vendorId), vendorData, multipartConfig),
};

export default VendorService;
