import axios from "axios";

export const axiosAPI = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosAPI.interceptors.request.use(
  (request) => {
    return request;
  },
  (error) => {
    console.log("triggered request error");
    return Promise.reject(error);
  },
);

axiosAPI.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      console.warn("Unauthorized access");
    } else if (status === 404) {
      return Promise.reject({
        status,
        message:
          error.response?.data?.message || "API endpoint not foud (bad route)",
      });
    }
    return Promise.reject({
      status,
      message: error.response?.data?.message || "Request failed",
    });
  },
);
