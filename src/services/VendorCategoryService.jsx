import { apiGet, apiPost } from "../../utils/serviceHelper";
import { API } from "../api/apiEndpoints";

const VendorCategoryService = {
  // Create a new vendor category
  createCategory: (categoryData) =>
    apiPost(API.ORDER_MANAGEMENT.VENDOR_CATEGORIES.CREATE, categoryData),

  // Fetch the list of all vendor categories
  getCategoriesList: () =>
    apiGet(API.ORDER_MANAGEMENT.VENDOR_CATEGORIES.LIST),

  // Fetch vendor category details by ID
  getCategoryDetails: (categoryId) =>
    apiGet(API.ORDER_MANAGEMENT.VENDOR_CATEGORIES.DETAIL(categoryId)),

  // Fetch vendor categories with bill counts
  getCategoriesWithBillCount: () =>
    apiGet(API.ORDER_MANAGEMENT.VENDOR_CATEGORIES.WITH_BILL_COUNT),
};

export default VendorCategoryService;
