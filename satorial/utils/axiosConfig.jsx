import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

const PUBLIC_ENDPOINTS = ['/users/login/', '/users/register-organization/', '/users/forgot-password/', '/users/reset-password/', '/users/accept-invite/'];

axiosInstance.interceptors.request.use(
  async (config) => {
    // Set JSON Content-Type for non-FormData requests
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    // For FormData, let axios/browser auto-set multipart/form-data with boundary

    if (!PUBLIC_ENDPOINTS.some((ep) => config.url.includes(ep))) {
      let token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);


let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    if (response?.data && typeof response.data === "object" && response.data.success === false) {
      const errorMsg = response.data.message || response.data.detail || "Operation failed";
      const error = new Error(errorMsg);
      error.response = response;
      return Promise.reject(error);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.error('No refresh token found, logging out');
        localStorage.removeItem('accessToken');
        isRefreshing = false;
        return Promise.reject(error);
      }

      return new Promise((resolve, reject) => {
        axios
          .post(`${import.meta.env.VITE_BASE_URL}users/token/refresh/`, {
            refresh: refreshToken,
          })
          .then((response) => {
            const newAccessToken = response.data.access;
            localStorage.setItem('accessToken', newAccessToken);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            processQueue(null, newAccessToken);
            resolve(axiosInstance(originalRequest));
          })
          .catch((refreshError) => {
            console.error('Token refresh failed:', refreshError.response?.data || refreshError.message);
            processQueue(refreshError, null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            reject(refreshError);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    // Plan-limit / feature-lock: the API returns 403 with upgrade_required.
    // Surface a clear message with a path to the pricing page.
    if (error.response?.status === 403 && error.response?.data?.upgrade_required) {
      import("antd").then(({ message: antdMessage }) => {
        antdMessage.warning({
          content:
            (error.response.data.message || "You've reached your plan limit.") +
            " Upgrade your plan to continue.",
          duration: 5,
        });
      });
      return Promise.reject(error);
    }

    // Global error toasts for 500s and network failures
    if (error.response?.status >= 500) {
      import("antd").then(({ message: antdMessage }) => {
        antdMessage.error("Server error. Please try again later.");
      });
    } else if (!error.response && error.code !== "ERR_CANCELED") {
      import("antd").then(({ message: antdMessage }) => {
        antdMessage.error("Network error. Please check your connection.");
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
