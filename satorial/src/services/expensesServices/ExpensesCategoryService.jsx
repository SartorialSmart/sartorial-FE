import { apiGet, apiPost, apiPut, apiDelete } from "../../../utils/serviceHelper";
import { API } from "../../api/apiEndpoints";

const ExpensescategoryService = {

  createExpenseCategory: (payload) =>
    apiPost(API.EXPENSE_MANAGEMENT.EXPENSE_CATEGORIES.CREATE, payload),

  getExpenseCategoriesList: () =>
    apiGet(API.EXPENSE_MANAGEMENT.EXPENSE_CATEGORIES.LIST),

  getExpenseCategoryById: (categoryId) =>
    apiGet(API.EXPENSE_MANAGEMENT.EXPENSE_CATEGORIES.DETAIL(categoryId)),

  updateExpenseCategory: (categoryId, payload) =>
    apiPut(API.EXPENSE_MANAGEMENT.EXPENSE_CATEGORIES.UPDATE(categoryId), payload),

  deleteExpenseCategory: (categoryId) =>
    apiDelete(API.EXPENSE_MANAGEMENT.EXPENSE_CATEGORIES.DELETE(categoryId)),
};

export default ExpensescategoryService;
