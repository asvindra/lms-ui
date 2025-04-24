import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

console.log("api url", process.env);

// Interceptor to add Authorization token (client-side only)
apiClient.interceptors.request.use((config: any) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("err", error);

    if (
      error.response?.status === 403 &&
      error.response.data.error === "Invalid token" &&
      typeof window !== "undefined"
    ) {
      localStorage.removeItem("token");
      document.cookie = "token=; path=/; max-age=0"; // Clear cookie
      window.location.href = "/auth/login"; // Redirect to login
    }
    return Promise.reject(error);
  }
);

export default apiClient;
