import { apiGet, apiPost, apiPut, apiDelete } from "../../../utils/serviceHelper";
import { API } from "../../api/apiEndpoints";

const BonusRuleService = {
  listRules: (params = {}) => {
    const config = Object.keys(params).length ? { params } : {};
    return apiGet(API.STAFF_MANAGEMENT.BONUS_RULES.LIST, config);
  },

  createRule: (data) =>
    apiPost(API.STAFF_MANAGEMENT.BONUS_RULES.CREATE, data),

  getRuleDetail: (id) =>
    apiGet(API.STAFF_MANAGEMENT.BONUS_RULES.DETAIL(id)),

  updateRule: (id, data) =>
    apiPut(API.STAFF_MANAGEMENT.BONUS_RULES.UPDATE(id), data),

  deleteRule: (id) =>
    apiDelete(API.STAFF_MANAGEMENT.BONUS_RULES.DELETE(id)),
};

export default BonusRuleService;
