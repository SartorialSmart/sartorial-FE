import { apiGet, apiPost, apiPut, apiDelete } from "../../../utils/serviceHelper";
import { API } from "../../api/apiEndpoints";

const PayComponentService = {
  listComponents: (params = {}) => {
    const config = Object.keys(params).length ? { params } : {};
    return apiGet(API.STAFF_MANAGEMENT.PAY_COMPONENTS.LIST, config);
  },

  createComponent: (data) =>
    apiPost(API.STAFF_MANAGEMENT.PAY_COMPONENTS.CREATE, data),

  getComponentDetail: (id) =>
    apiGet(API.STAFF_MANAGEMENT.PAY_COMPONENTS.DETAIL(id)),

  updateComponent: (id, data) =>
    apiPut(API.STAFF_MANAGEMENT.PAY_COMPONENTS.UPDATE(id), data),

  deleteComponent: (id) =>
    apiDelete(API.STAFF_MANAGEMENT.PAY_COMPONENTS.DELETE(id)),
};

export default PayComponentService;
