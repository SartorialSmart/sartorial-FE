import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const PUBLIC_ENDPOINTS = ['/users/login/', '/users/register-organization/', '/users/forgot-password/', '/users/reset-password/'];

axiosInstance.interceptors.request.use(
  async (config) => {
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


axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.error('No refresh token found, logging out');
        localStorage.removeItem('accessToken');
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}users/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        localStorage.setItem('accessToken', newAccessToken);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;


        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError.response?.data || refreshError.message);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return Promise.reject(refreshError);
      }
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
