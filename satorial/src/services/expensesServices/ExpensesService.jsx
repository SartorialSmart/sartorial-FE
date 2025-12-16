import axiosInstance from "../../../utils/axiosConfig";
import { API } from "../../api/apiEndpoints";

const ExpensesService = {
  createExpense: async (payload) => {
    return await axiosInstance.post(
      API.EXPENSE_MANAGEMENT.EXPENSES.CREATE,
      payload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  getExpenseById: async (expenseId) => {
    const response = await axiosInstance.get(
      API.EXPENSE_MANAGEMENT.EXPENSES.DETAIL(expenseId)
    );
    return response.data;
  },

  updateExpense: async (expenseId, payload) => {
    return await axiosInstance.put(
      API.EXPENSE_MANAGEMENT.EXPENSES.UPDATE(expenseId),
      payload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  },

  deleteExpense: async (expenseId) => {
    return await axiosInstance.delete(
      API.EXPENSE_MANAGEMENT.EXPENSES.DELETE(expenseId)
    );
  },

  getExpenseList: async (params) => {
    try {
      const response = await axiosInstance.get(
        API.EXPENSE_MANAGEMENT.EXPENSES.EXPENSE_LIST,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching expenses:", error);
      throw error;
    }
  },

  getExpenseSummary: async () => {
    const response = await axiosInstance.get(
      API.EXPENSE_MANAGEMENT.EXPENSES.SUMMARY
    );
    return response.data;
  },

  exportExpenses: async (params) => {
    try {
      const response = await axiosInstance.get(
        API.EXPENSE_MANAGEMENT.EXPENSES.EXPENSE_LIST,
        {
          params: { ...params, export: true },
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error exporting expenses:", error);
      throw error;
    }
  },
};

export default ExpensesService;