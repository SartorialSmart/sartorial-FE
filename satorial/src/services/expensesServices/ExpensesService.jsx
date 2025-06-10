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
    return await axiosInstance.get(
      API.EXPENSE_MANAGEMENT.EXPENSES.DETAIL(expenseId)
    );
  },

  updateExpense: async (expenseId, payload) => {
    return await axiosInstance.put(
      API.EXPENSE_MANAGEMENT.EXPENSES.UPDATE(expenseId),
      payload
    );
  },

  deleteExpense: async (expenseId) => {
    return await axiosInstance.delete(
      API.EXPENSE_MANAGEMENT.EXPENSES.DELETE(expenseId)
    );
  },

  getExpenseList: async () => {
    try {
      const response = await axiosInstance.get(
        API.EXPENSE_MANAGEMENT.EXPENSES.EXPENSE_LIST
      );
      return response.data; // Return the data from the response
    } catch (error) {
      console.error("Error fetching expenses:", error);
      throw error;
    }
  },

  getExpenseSummary: async () => {
    return await axiosInstance.get(API.EXPENSE_MANAGEMENT.EXPENSES.SUMMARY);
  },
};

export default ExpensesService;
