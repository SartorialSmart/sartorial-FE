import { apiGet, apiPost, apiPut, apiDelete } from "../../../utils/serviceHelper";
import { API } from "../../api/apiEndpoints";

const ExpensesService = {
  createExpense: (payload) =>
    apiPost(API.EXPENSE_MANAGEMENT.EXPENSES.CREATE, payload),

  getExpenseById: (expenseId) =>
    apiGet(API.EXPENSE_MANAGEMENT.EXPENSES.DETAIL(expenseId)),

  updateExpense: (expenseId, payload) =>
    apiPut(API.EXPENSE_MANAGEMENT.EXPENSES.UPDATE(expenseId), payload),

  deleteExpense: (expenseId) =>
    apiDelete(API.EXPENSE_MANAGEMENT.EXPENSES.DELETE(expenseId)),

  getExpenseList: (params) =>
    apiGet(API.EXPENSE_MANAGEMENT.EXPENSES.EXPENSE_LIST, { params }),

  getExpenseSummary: (params) =>
    apiGet(API.EXPENSE_MANAGEMENT.EXPENSES.SUMMARY, { params }),

  exportExpenses: (params) =>
    apiGet(API.EXPENSE_MANAGEMENT.EXPENSES.EXPENSE_LIST, {
      params: { ...params, export: true },
      responseType: "blob",
    }),
};

export default ExpensesService;
