import axios from "axios";

let isRefreshing = false;
let failedQueue = [];

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.timeout = 10000;

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

// Public endpoints that don't require authentication
const PUBLIC_ENDPOINTS = [
  "auth/send-otp/",
  "auth/verify-otp/",
  "signup/",
  "token/",
  "refresh/",
  "auth/account-verification/",
  "auth/forget-password/"
];

// REQUEST INTERCEPTOR - Attach token to every request
axios.interceptors.request.use(
  (config) => {
    // Skip adding token for public endpoints
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => 
      config.url?.includes(endpoint)
    );

    if (isPublicEndpoint) {
      return config;
    }

    const token = localStorage.getItem("connectify_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR - Handle token refresh on 401
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent refresh loop on refresh endpoint itself
    if (originalRequest.url?.includes("refresh/")) {
      localStorage.removeItem("connectify_token");
      localStorage.removeItem("connectify_user");
      localStorage.removeItem("connectify_refresh");
      window.location.href = "/";
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refresh = localStorage.getItem("connectify_refresh");

      if (!refresh) {
        localStorage.removeItem("connectify_token");
        localStorage.removeItem("connectify_user");
        localStorage.removeItem("connectify_refresh");
        window.location.href = "/";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post("refresh/", {
          refresh: refresh,
        });

        const newAccessToken = res.data.access;
        localStorage.setItem("connectify_token", newAccessToken);

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        axios.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        return axios(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token expired or invalid");
        processQueue(refreshError, null);

        localStorage.removeItem("connectify_token");
        localStorage.removeItem("connectify_user");
        localStorage.removeItem("connectify_refresh");
        window.location.href = "/";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
