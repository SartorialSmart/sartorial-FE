import axiosInstance from "../../../utils/axiosConfig";
import { API } from "../../api/apiEndpoints";

const ExpensesService = {


  createExpense: async (payload) => {
    return await axiosInstance.post(API.EXPENSE_MANAGEMENT.EXPENSES.CREATE, payload);
  },

  getExpenseById: async (expenseId) => {
    return await axiosInstance.get(API.EXPENSE_MANAGEMENT.EXPENSES.DETAIL(expenseId));
  },

  updateExpense: async (expenseId, payload) => {
    return await axiosInstance.put(API.EXPENSE_MANAGEMENT.EXPENSES.UPDATE(expenseId), payload);
  },

  deleteExpense: async (expenseId) => {
    return await axiosInstance.delete(API.EXPENSE_MANAGEMENT.EXPENSES.DELETE(expenseId));
  },

  getExpenseList: async () => {
    return await axiosInstance.get(API.EXPENSE_MANAGEMENT.EXPENSES.EXPENSE_LIST);
  },

  getExpenseSummary: async () => {
    return await axiosInstance.get(API.EXPENSE_MANAGEMENT.EXPENSES.SUMMARY);
  }
};

export default ExpensesService;
