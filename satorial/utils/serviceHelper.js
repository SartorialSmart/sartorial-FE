import axiosInstance from "./axiosConfig";

/**
 * Generic API call wrapper. Returns response.data directly.
 * Errors propagate to the caller — no try/catch here by design.
 */
function apiCall(method, url, data = null, config = {}) {
  const request = data
    ? axiosInstance[method](url, data, config)
    : axiosInstance[method](url, config);
  return request.then((res) => res.data);
}

export const apiGet = (url, config) => apiCall("get", url, null, config);
export const apiPost = (url, data, config) => apiCall("post", url, data, config);
export const apiPut = (url, data, config) => apiCall("put", url, data, config);
export const apiPatch = (url, data, config) => apiCall("patch", url, data, config);
export const apiDelete = (url, config) => apiCall("delete", url, null, config);
