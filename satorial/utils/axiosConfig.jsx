import axios from 'axios';

const resolvedBaseUrl =
  import.meta.env.VITE_BASE_URL ||
  (import.meta.env.PROD ? "https://api.sartorialsmart.com/api/v1/" : "http://127.0.0.1:8000/api/v1/");

if (!import.meta.env.VITE_BASE_URL) {
  console.warn(
    `[axiosConfig] VITE_BASE_URL is not set — falling back to ${resolvedBaseUrl}. ` +
      "Set VITE_BASE_URL in your .env or Vercel env vars."
  );
}

const axiosInstance = axios.create({
  baseURL: resolvedBaseUrl,
});

const PUBLIC_ENDPOINTS = ['/users/login/', '/users/register-organization/', '/users/forgot-password/', '/users/reset-password/', '/users/accept-invite/', '/ecommerce/storefront/', '/ecommerce/webhooks/'];

axiosInstance.interceptors.request.use(
  async (config) => {
    // Robust FormData detection — instanceof can fail across realms/bundles
    const isFormData =
      config.data instanceof FormData ||
      (config.data != null &&
        typeof config.data.append === "function" &&
        typeof config.data.get === "function" &&
        typeof config.data.has === "function");
    if (isFormData) {
      // Let browser/axios set multipart boundary — delete any preset JSON header
      if (config.headers["Content-Type"]) delete config.headers["Content-Type"];
      if (config.headers["content-type"]) delete config.headers["content-type"];
      if (axiosInstance.defaults.headers.common["Content-Type"]) {
        // ensure per-request header is removed so it doesn't leak from defaults
        delete config.headers["Content-Type"];
      }
    } else {
      config.headers["Content-Type"] = "application/json";
    }

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
          .post(`${resolvedBaseUrl}users/token/refresh/`, {
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

    // Global error toasts for 500s and network failures — skip if caller handles it
    const skipGlobal = error.config?.headers?.["X-Skip-Global-Error"] || error.config?.skipGlobalError;
    if (!skipGlobal) {
      if (error.response?.status >= 500) {
        import("antd").then(({ message: antdMessage }) => {
          antdMessage.error("Server error. Please try again later.");
        });
      } else if (!error.response && error.code !== "ERR_CANCELED") {
        import("antd").then(({ message: antdMessage }) => {
          antdMessage.error("Network error. Please check your connection.");
        });
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
