import axios from "axios";

let isRefreshing = false;
let failedQueue = [];

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL
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

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

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
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;

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
