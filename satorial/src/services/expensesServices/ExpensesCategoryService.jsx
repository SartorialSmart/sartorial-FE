import axiosInstance from "../../../utils/axiosConfig";
import { API } from "../../api/apiEndpoints";

const ExpensescategoryService = {

    
  createExpenseCategory: async (payload) => {
    return await axiosInstance.post(API.EXPENSE_MANAGEMENT.EXPENSE_CATEGORIES.CREATE, payload);
  },

  getExpenseCategoriesList: async () => {
    return await axiosInstance.get(API.EXPENSE_MANAGEMENT.EXPENSE_CATEGORIES.LIST);
  },

  getExpenseCategoryById: async (categoryId) => {
    return await axiosInstance.get(API.EXPENSE_MANAGEMENT.EXPENSE_CATEGORIES.DETAIL(categoryId));
  },

  updateExpenseCategory: async (categoryId, payload) => {
    return await axiosInstance.put(API.EXPENSE_MANAGEMENT.EXPENSE_CATEGORIES.UPDATE(categoryId), payload);
  },

  deleteExpenseCategory: async (categoryId) => {
    return await axiosInstance.delete(API.EXPENSE_MANAGEMENT.EXPENSE_CATEGORIES.DELETE(categoryId));
  },

}

export default ExpensescategoryService;
